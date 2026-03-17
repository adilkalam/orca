/**
 * OS 2.0 ProjectContextServer
 *
 * THE MANDATORY BRAIN: No agent can work without context from this service.
 *
 * Key principles:
 * 1. Context is MANDATORY, not optional
 * 2. Every operation goes through this service
 * 3. Makes v1's context amnesia structurally impossible
 * 4. Integrates: Claude Context MCP + code-index.db + file index
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import type {
  ContextBundle,
  ContextQuery,
  SemanticSearch,
} from './types.js';
import { SemanticSearchImpl } from './semantic.js';
import { ContextBundler } from './bundle.js';
import { WorkshopClient } from './workshop.js';
import { execSync } from 'child_process';

/**
 * ProjectContextServer - The mandatory context service for OS 2.0
 */
export class ProjectContextServer {
  private server: Server;
  private semantic: SemanticSearch;
  private bundler: ContextBundler;

  constructor() {
    this.server = new Server(
      {
        name: 'project-context-server',
        version: '2.1.0', // Upgraded: code-index.db code search + Workshop session memory
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Initialize subsystems
    // Note: Session memory (decisions, standards, history) now uses Workshop
    // Code search now uses code-index.db's hybrid search with fallback
    this.semantic = new SemanticSearchImpl();
    this.bundler = new ContextBundler(this.semantic);

    this.setupHandlers();
  }

  /**
   * Auto-detect project path from environment or git root
   */
  private detectProjectPath(providedPath?: string): string {
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
    } catch {
      // Not a git repo, fall through
    }

    // Fall back to current working directory
    return process.cwd();
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: this.getTools(),
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'query_context':
          return await this.handleQueryContext(args as unknown as ContextQuery);

        case 'save_decision':
          return await this.handleSaveDecision(args as Record<string, unknown>);

        case 'save_standard':
          return await this.handleSaveStandard(args as Record<string, unknown>);

        case 'save_task_history':
          return await this.handleSaveTaskHistory(args as Record<string, unknown>);

        case 'index_project':
          return await this.handleIndexProject(args as { projectPath?: string });

        case 'reanalyze_project':
          return await this.handleReanalyzeProject(args as { projectPath?: string });

        case 'recall':
          return await this.handleRecall(args as { id: string });

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  /**
   * Define MCP tools exposed by this server
   */
  private getTools(): Tool[] {
    return [
      {
        name: 'query_context',
        description:
          'MANDATORY: Get project context bundle before ANY work. ' +
          'Returns relevant files, project state, past decisions, standards, and history. ' +
          'No agent can work without calling this first.',
        inputSchema: {
          type: 'object',
          properties: {
            domain: {
              type: 'string',
              enum: ['webdev', 'nextjs', 'ios', 'expo', 'data', 'seo', 'brand', 'django-react', 'research', 'kg', 'shopify', 'audit', 'os-dev', 'orca-pipeline'],
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
        description:
          'Create a new standard from a failure or repeated issue. ' +
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
        description:
          'Force reanalysis of project structure. ' +
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
      {
        name: 'recall',
        description:
          'Retrieve full archived tool output by ID. Use when you need complete data ' +
          'that was truncated by ORCA-Mem. The truncation message includes the ID.',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Archive ID from truncation message (e.g., "1705123456-abc123")',
            },
          },
          required: ['id'],
        },
      },
    ];
  }

  /**
   * CORE FUNCTION: Query project context
   * This is called before EVERY agent operation
   */
  private async handleQueryContext(query: ContextQuery) {
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

  /**
   * Validate that required string fields are present and non-empty.
   * Throws a descriptive error if validation fails.
   */
  private validateRequiredStrings(
    args: Record<string, unknown>,
    fields: string[],
    handlerName: string
  ): void {
    for (const field of fields) {
      if (typeof args[field] !== 'string' || args[field].trim() === '') {
        throw new Error(
          `${handlerName}: '${field}' is required and must be a non-empty string`
        );
      }
    }
  }

  /**
   * Validate that a field, if present, is a string.
   */
  private validateOptionalString(
    args: Record<string, unknown>,
    field: string,
    handlerName: string
  ): void {
    if (args[field] !== undefined && args[field] !== null && typeof args[field] !== 'string') {
      throw new Error(
        `${handlerName}: '${field}' must be a string if provided`
      );
    }
  }

  /**
   * Validate that a field, if present, is an array of strings.
   */
  private validateOptionalStringArray(
    args: Record<string, unknown>,
    field: string,
    handlerName: string
  ): void {
    if (args[field] !== undefined && args[field] !== null) {
      if (!Array.isArray(args[field]) || !args[field].every((item: unknown) => typeof item === 'string')) {
        throw new Error(
          `${handlerName}: '${field}' must be an array of strings if provided`
        );
      }
    }
  }

  private async handleSaveDecision(args: Record<string, unknown>) {
    // Validate required fields
    this.validateRequiredStrings(args, ['domain', 'decision', 'reasoning'], 'save_decision');
    // Validate optional fields
    this.validateOptionalString(args, 'projectPath', 'save_decision');
    this.validateOptionalString(args, 'context', 'save_decision');
    this.validateOptionalStringArray(args, 'tags', 'save_decision');

    const projectPath = this.detectProjectPath(args.projectPath as string | undefined);
    // Use Workshop for session memory (decisions, gotchas, learnings)
    const workshop = new WorkshopClient(projectPath);
    await workshop.saveDecision({
      domain: args.domain as string,
      decision: args.decision as string,
      reasoning: args.reasoning as string,
      context: args.context as string | undefined,
      tags: args.tags as string[] | undefined,
    });
    return {
      content: [{ type: 'text', text: 'Decision saved to Workshop' }],
    };
  }

  private async handleSaveStandard(args: Record<string, unknown>) {
    // Validate required fields
    this.validateRequiredStrings(args, ['what_happened', 'cost', 'rule', 'domain'], 'save_standard');
    // Validate optional fields
    this.validateOptionalString(args, 'projectPath', 'save_standard');

    const projectPath = this.detectProjectPath(args.projectPath as string | undefined);
    // Use Workshop for gotchas (standards/rules)
    const workshop = new WorkshopClient(projectPath);
    await workshop.saveGotcha({
      what_happened: args.what_happened as string,
      cost: args.cost as string,
      rule: args.rule as string,
      domain: args.domain as string,
    });
    return {
      content: [{ type: 'text', text: 'Standard saved to Workshop as gotcha' }],
    };
  }

  private async handleSaveTaskHistory(args: Record<string, unknown>) {
    // Validate required fields
    this.validateRequiredStrings(args, ['domain', 'task', 'outcome'], 'save_task_history');
    // Validate outcome enum
    const validOutcomes = ['success', 'failure', 'partial'];
    if (!validOutcomes.includes(args.outcome as string)) {
      throw new Error(
        `save_task_history: 'outcome' must be one of: ${validOutcomes.join(', ')}`
      );
    }
    // Validate optional fields
    this.validateOptionalString(args, 'projectPath', 'save_task_history');
    this.validateOptionalString(args, 'learnings', 'save_task_history');
    this.validateOptionalStringArray(args, 'files_modified', 'save_task_history');

    const projectPath = this.detectProjectPath(args.projectPath as string | undefined);
    // Use Workshop for task history
    const workshop = new WorkshopClient(projectPath);
    await workshop.saveTaskHistory({
      domain: args.domain as string,
      task: args.task as string,
      outcome: args.outcome as string,
      learnings: args.learnings as string | undefined,
      files_modified: args.files_modified as string[] | undefined,
    });
    return {
      content: [{ type: 'text', text: 'Task history saved to Workshop' }],
    };
  }

  private async handleIndexProject(args: { projectPath?: string }) {
    const projectPath = this.detectProjectPath(args.projectPath);
    await this.semantic.indexProject(projectPath);
    return {
      content: [
        { type: 'text', text: `Project indexed: ${projectPath}` },
      ],
    };
  }

  private async handleReanalyzeProject(args: { projectPath?: string }) {
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

  private countFilesInTree(node: any): number {
    if (node.type === 'file') return 1;
    return (node.children || []).reduce(
      (sum: number, child: any) => sum + this.countFilesInTree(child),
      0
    );
  }

  /**
   * ORCA-Mem: Recall archived tool output
   * Retrieves full content that was truncated by post-tool-use hook
   */
  private async handleRecall(args: { id: string }): Promise<any> {
    // Validate archive ID to prevent path traversal
    if (args.id.includes('/') || args.id.includes('..') || args.id.includes('\\')) {
      throw new Error('Invalid archive ID');
    }

    const baseDir = `${process.env.HOME}/.claude/archives`;
    const fs = await import('fs');
    const path = await import('path');

    try {
      // Check if archive directory exists
      if (!fs.existsSync(baseDir)) {
        return {
          content: [{
            type: 'text',
            text: `Archive directory not found at ${baseDir}. No truncated outputs have been archived yet.`
          }]
        };
      }

      // Get all date directories, sorted in reverse (most recent first)
      const dirs = fs.readdirSync(baseDir)
        .filter((d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d))
        .sort()
        .reverse();

      // Search for the archive file
      for (const dir of dirs) {
        const filePath = path.join(baseDir, dir, `${args.id}.txt`);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf-8');
          const stats = fs.statSync(filePath);
          const sizeKB = Math.round(stats.size / 1024);

          return {
            content: [{
              type: 'text',
              text: `[Recalled archive ${args.id} - ${sizeKB}KB]\n\n${content}`
            }]
          };
        }
      }

      // Not found in any directory
      return {
        content: [{
          type: 'text',
          text: `Archive '${args.id}' not found. It may have expired (7-day retention) or the ID is incorrect.\n\nAvailable date directories: ${dirs.slice(0, 5).join(', ')}${dirs.length > 5 ? '...' : ''}\n\nTip: Check ~/.claude/archives/ for available archives.`
        }]
      };
    } catch (error) {
      return {
        content: [{
          type: 'text',
          text: `Error reading archive: ${error}. The archive directory may not exist yet.`
        }]
      };
    }
  }

  /**
   * Start the MCP server
   */
  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('ProjectContextServer v2.1 started');
    console.error('Code search: code-index.db hybrid (semantic + symbol + fulltext)');
    console.error('Session memory: Workshop (decisions, standards, history)');
  }
}

// Start server if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new ProjectContextServer();
  server.run().catch(console.error);
}
