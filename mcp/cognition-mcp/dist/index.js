/**
 * Cognition MCP - Entry Point
 *
 * A structured notepad for Claude's reasoning.
 *
 * CORE PATTERN: Accept-Store-Echo
 * - ACCEPT: Claude provides structured thoughts
 * - STORE: MCP stores them unchanged
 * - ECHO: MCP returns them unchanged + session context
 *
 * The MCP is a MIRROR. It cannot generate, suggest, enhance, or transform.
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { CognitionInputSchema } from './schema.js';
import { getSessionManager } from './session/manager.js';
import { routeOperation } from './handlers/index.js';
import { buildErrorResponse } from './handlers/shared.js';
import { ensureDirectories } from './session/persistence.js';
/**
 * CognitionServer - MCP server for structured reasoning
 */
class CognitionServer {
    constructor() {
        this.server = new Server({
            name: 'cognition-mcp',
            version: '1.0.0',
        }, {
            capabilities: {
                tools: {},
            },
        });
        // Ensure storage directories exist
        ensureDirectories();
        this.setupHandlers();
    }
    setupHandlers() {
        // List available tools
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: this.getTools(),
        }));
        // Handle tool calls
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            if (name !== 'cognition') {
                throw new Error('Unknown tool: ' + name);
            }
            const result = await this.handleCognition(args);
            return result;
        });
    }
    /**
     * Define the single 'cognition' tool
     */
    getTools() {
        return [
            {
                name: 'cognition',
                description: 'Structured reasoning notepad. Stores thoughts, mental models, debugging sessions, decisions, metacognitive observations, and systems maps. Claude provides all content; MCP stores and returns with session context. PATTERN: Accept-Store-Echo.' +
                    '\n\nOperations: thought, mental_model, list_mental_models, debug, decide, meta, systems, creative_thinking, visual_reasoning, checkpoint, scientific_method, collaborative_reasoning, socratic_method, structured_argumentation, tree_of_thought, beam_search, mcts, graph_of_thought, orchestration_suggest, research, analogical_reasoning, causal_analysis, statistical_reasoning, simulation, optimization, ethical_analysis, visual_dashboard, pdr_reasoning, custom_framework, code_execution, ooda_loop, ulysses_protocol, audit, notebook_create, notebook_add_cell, notebook_run_cell, notebook_export, session_info, session_export, session_import, reasoning_stats, recording_status, recording_query, recording_checkpoint, recording_compare, recording_quality, recording_explain, recording_rewind' +
                    ', blind_orchestrate' +
                    '\n\nProtocol: checkpoint supports constraint tracking + gate evaluation + auto-persist at harvest. Session context preserved across calls via sessionId. Recording operations query .orca/recording.db.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        operation: {
                            type: 'string',
                            enum: [
                                'thought',
                                'mental_model',
                                'list_mental_models',
                                'debug',
                                'decide',
                                'meta',
                                'systems',
                                'creative_thinking',
                                'visual_reasoning',
                                'checkpoint',
                                'scientific_method',
                                'collaborative_reasoning',
                                'socratic_method',
                                'structured_argumentation',
                                'tree_of_thought',
                                'beam_search',
                                'mcts',
                                'graph_of_thought',
                                'orchestration_suggest',
                                'research',
                                'analogical_reasoning',
                                'causal_analysis',
                                'statistical_reasoning',
                                'simulation',
                                'optimization',
                                'ethical_analysis',
                                'visual_dashboard',
                                'pdr_reasoning',
                                'custom_framework',
                                'code_execution',
                                'ooda_loop',
                                'ulysses_protocol',
                                'audit',
                                'notebook_create',
                                'notebook_add_cell',
                                'notebook_run_cell',
                                'notebook_export',
                                'session_info',
                                'session_export',
                                'session_import',
                                'reasoning_stats',
                                'recording_status',
                                'recording_query',
                                'recording_checkpoint',
                                'recording_compare',
                                'recording_quality',
                                'recording_explain',
                                'recording_rewind',
                                'blind_orchestrate',
                            ],
                            description: 'The operation to perform',
                        },
                        content: {
                            type: 'object',
                            description: 'Operation-specific content (Claude provides ALL of this)',
                            additionalProperties: true,
                        },
                        quality: {
                            type: 'object',
                            description: 'Claude self-assessment (stored unchanged)',
                            properties: {
                                confidence: { type: 'number', minimum: 0, maximum: 1 },
                                consistency: { type: 'number', minimum: 0, maximum: 5 },
                                completeness: { type: 'number', minimum: 0, maximum: 5 },
                                bias_check: { type: 'string' },
                            },
                        },
                        sessionId: {
                            type: 'string',
                            description: 'Session ID for continuing existing session',
                        },
                        sessionTitle: {
                            type: 'string',
                            description: 'Title for new session',
                        },
                        sessionTags: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Tags for new session',
                        },
                        data: {
                            type: 'object',
                            description: 'Session data for import operation',
                        },
                        verbose: {
                            type: 'boolean',
                            description: 'If true, echo full content in response. Default: minimal ACK.',
                        },
                        tokenEstimate: {
                            type: 'number',
                            description: 'Token estimate for this operation (optional, renderer computes fallback)',
                        },
                        projectPath: {
                            type: 'string',
                            description: 'Absolute path to project root for per-project session storage. If omitted, uses global ~/.orca-cognition/.',
                        },
                    },
                    required: ['operation'],
                },
            },
        ];
    }
    /**
     * Handle cognition tool call
     */
    async handleCognition(args) {
        // Validate input structure
        const validation = CognitionInputSchema.safeParse(args);
        if (!validation.success) {
            return buildErrorResponse({
                status: 'error',
                error: 'Invalid input: ' + validation.error.message,
                sessionContext: {
                    sessionId: '',
                    entryCount: 0,
                    totalEntries: 0,
                    sessionDuration: 0,
                    continuation: null,
                },
            });
        }
        const request = validation.data;
        // Get or create session (routed by projectPath for per-project storage)
        const manager = getSessionManager();
        const session = await manager.getOrCreate(request.sessionId, request.sessionTitle, request.sessionTags, request.projectPath);
        // Route to appropriate handler
        return await routeOperation(request, session);
    }
    /**
     * Start the MCP server
     */
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Cognition MCP v1.1.0 started');
        console.error('Pattern: Accept-Store-Echo');
        console.error('Storage: per-project {project}/.claude/.cognition/ | global ~/.orca-cognition/');
    }
}
// Start server if run directly
const server = new CognitionServer();
server.run().catch(console.error);
//# sourceMappingURL=index.js.map