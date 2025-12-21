/**
 * OS 2.0 ProjectContextServer
 *
 * THE MANDATORY BRAIN: No agent can work without context from this service.
 *
 * Key principles:
 * 1. Context is MANDATORY, not optional
 * 2. Every operation goes through this service
 * 3. Makes v1's context amnesia structurally impossible
 * 4. Integrates: Claude Context MCP + vibe.db + file index
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { SemanticSearchImpl } from './semantic.js';
import { ContextBundler } from './bundle.js';
import { WorkshopClient } from './workshop.js';
import { execSync } from 'child_process';
/**
 * ProjectContextServer - The mandatory context service for OS 2.0
 */
export class ProjectContextServer {
    server;
    semantic;
    bundler;
    constructor() {
        this.server = new Server({
            name: 'project-context-server',
            version: '2.1.0', // Upgraded: vibe.db code search + Workshop session memory
        }, {
            capabilities: {
                tools: {},
            },
        });
        // Initialize subsystems
        // Note: Session memory (decisions, standards, history) now uses Workshop
        // Code search now uses vibe.db's hybrid search with fallback
        this.semantic = new SemanticSearchImpl();
        this.bundler = new ContextBundler(this.semantic);
        this.setupHandlers();
    }
    /**
     * Auto-detect project path from environment or git root
     */
    detectProjectPath(providedPath) {
        if (providedPath) {
            return providedPath;
        }
        // Try CLAUDE_PROJECT_DIR environment variable first (set by hooks)
        if (process.env.CLAUDE_PROJECT_DIR) {
            return process.env.CLAUDE_PROJECT_DIR;
        }
        // Try to find git root
        try {
            const gitRoot = execSync('git rev-parse --show-toplevel', {
                encoding: 'utf8',
                stdio: ['pipe', 'pipe', 'ignore'],
            }).trim();
            if (gitRoot) {
                return gitRoot;
            }
        }
        catch {
            // Not a git repo, fall through
        }
        // Fall back to current working directory
        return process.cwd();
    }
    setupHandlers() {
        // List available tools
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: this.getTools(),
        }));
        // Handle tool calls
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            switch (name) {
                case 'query_context':
                    return await this.handleQueryContext(args);
                case 'save_decision':
                    return await this.handleSaveDecision(args);
                case 'save_standard':
                    return await this.handleSaveStandard(args);
                case 'save_task_history':
                    return await this.handleSaveTaskHistory(args);
                case 'index_project':
                    return await this.handleIndexProject(args);
                case 'reanalyze_project':
                    return await this.handleReanalyzeProject(args);
                default:
                    throw new Error(`Unknown tool: ${name}`);
            }
        });
    }
    /**
     * Define MCP tools exposed by this server
     */
    getTools() {
        return [
            {
                name: 'query_context',
                description: 'MANDATORY: Get project context bundle before ANY work. ' +
                    'Returns relevant files, project state, past decisions, standards, and history. ' +
                    'No agent can work without calling this first.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        domain: {
                            type: 'string',
                            enum: ['webdev', 'nextjs', 'ios', 'expo', 'data', 'seo', 'brand'],
                            description: 'The domain/lane for this operation',
                        },
                        task: {
                            type: 'string',
                            description: 'Description of the task to perform',
                        },
                        projectPath: {
                            type: 'string',
                            description: 'Absolute path to the project root (optional - auto-detects from git root or cwd)',
                        },
                        maxFiles: {
                            type: 'number',
                            description: 'Maximum number of relevant files to return (default: 10)',
                            default: 10,
                        },
                        includeHistory: {
                            type: 'boolean',
                            description: 'Include task history in the bundle (default: true)',
                            default: true,
                        },
                    },
                    required: ['domain', 'task'],
                },
            },
            {
                name: 'save_decision',
                description: 'Log a design or architectural decision to project memory',
                inputSchema: {
                    type: 'object',
                    properties: {
                        projectPath: { type: 'string', description: 'Absolute path to project root (optional - auto-detects from git root or cwd)' },
                        domain: { type: 'string' },
                        decision: { type: 'string' },
                        reasoning: { type: 'string' },
                        context: { type: 'string' },
                        tags: { type: 'array', items: { type: 'string' } },
                    },
                    required: ['domain', 'decision', 'reasoning'],
                },
            },
            {
                name: 'save_standard',
                description: 'Create a new standard from a failure or repeated issue. ' +
                    'Format: What Happened / Cost / Rule',
                inputSchema: {
                    type: 'object',
                    properties: {
                        projectPath: { type: 'string', description: 'Absolute path to project root (optional - auto-detects from git root or cwd)' },
                        what_happened: { type: 'string' },
                        cost: { type: 'string' },
                        rule: { type: 'string' },
                        domain: { type: 'string' },
                    },
                    required: ['what_happened', 'cost', 'rule', 'domain'],
                },
            },
            {
                name: 'save_task_history',
                description: 'Record task completion for future reference',
                inputSchema: {
                    type: 'object',
                    properties: {
                        projectPath: { type: 'string', description: 'Absolute path to project root (optional - auto-detects from git root or cwd)' },
                        domain: { type: 'string' },
                        task: { type: 'string' },
                        outcome: { type: 'string', enum: ['success', 'failure', 'partial'] },
                        learnings: { type: 'string' },
                        files_modified: { type: 'array', items: { type: 'string' } },
                    },
                    required: ['domain', 'task', 'outcome'],
                },
            },
            {
                name: 'index_project',
                description: 'Index a project for semantic search (run once per project)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        projectPath: {
                            type: 'string',
                            description: 'Absolute path to project root (optional - auto-detects from git root or cwd)',
                        },
                    },
                    required: [],
                },
            },
            {
                name: 'reanalyze_project',
                description: 'Force reanalysis of project structure. ' +
                    'Rebuilds the complete directory tree, component registry, and dependencies. ' +
                    'Run this after major file/directory changes.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        projectPath: {
                            type: 'string',
                            description: 'Absolute path to the project root (optional - auto-detects from git root or cwd)',
                        },
                    },
                    required: [],
                },
            },
        ];
    }
    /**
     * CORE FUNCTION: Query project context
     * This is called before EVERY agent operation
     */
    async handleQueryContext(query) {
        // Auto-detect project path if not provided
        const projectPath = this.detectProjectPath(query.projectPath);
        const queryWithPath = { ...query, projectPath };
        const bundle = await this.bundler.createBundle(queryWithPath);
        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(bundle, null, 2),
                },
            ],
        };
    }
    async handleSaveDecision(args) {
        const projectPath = this.detectProjectPath(args.projectPath);
        // Use Workshop for session memory (decisions, gotchas, learnings)
        const workshop = new WorkshopClient(projectPath);
        await workshop.saveDecision({
            domain: args.domain,
            decision: args.decision,
            reasoning: args.reasoning,
            context: args.context,
            tags: args.tags,
        });
        return {
            content: [{ type: 'text', text: 'Decision saved to Workshop' }],
        };
    }
    async handleSaveStandard(args) {
        const projectPath = this.detectProjectPath(args.projectPath);
        // Use Workshop for gotchas (standards/rules)
        const workshop = new WorkshopClient(projectPath);
        await workshop.saveGotcha({
            what_happened: args.what_happened,
            cost: args.cost,
            rule: args.rule,
            domain: args.domain,
        });
        return {
            content: [{ type: 'text', text: 'Standard saved to Workshop as gotcha' }],
        };
    }
    async handleSaveTaskHistory(args) {
        const projectPath = this.detectProjectPath(args.projectPath);
        // Use Workshop for task history
        const workshop = new WorkshopClient(projectPath);
        await workshop.saveTaskHistory({
            domain: args.domain,
            task: args.task,
            outcome: args.outcome,
            learnings: args.learnings,
            files_modified: args.files_modified,
        });
        return {
            content: [{ type: 'text', text: 'Task history saved to Workshop' }],
        };
    }
    async handleIndexProject(args) {
        const projectPath = this.detectProjectPath(args.projectPath);
        await this.semantic.indexProject(projectPath);
        return {
            content: [
                { type: 'text', text: `Project indexed: ${projectPath}` },
            ],
        };
    }
    async handleReanalyzeProject(args) {
        const projectPath = this.detectProjectPath(args.projectPath);
        const projectState = await this.bundler.reanalyzeProject(projectPath);
        const summary = `Project reanalyzed: ${projectPath}
- Components: ${projectState.components.length}
- Files: ${this.countFilesInTree(projectState.fileStructure)}
- Dependencies: ${Object.keys(projectState.dependencies).length}

Cache updated at .claude/memory/state.json`;
        return {
            content: [{ type: 'text', text: summary }],
        };
    }
    countFilesInTree(node) {
        if (node.type === 'file')
            return 1;
        return (node.children || []).reduce((sum, child) => sum + this.countFilesInTree(child), 0);
    }
    /**
     * Start the MCP server
     */
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('ProjectContextServer v2.1 started');
        console.error('Code search: vibe.db hybrid (semantic + symbol + fulltext)');
        console.error('Session memory: Workshop (decisions, standards, history)');
    }
}
// Start server if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const server = new ProjectContextServer();
    server.run().catch(console.error);
}
//# sourceMappingURL=index.js.map