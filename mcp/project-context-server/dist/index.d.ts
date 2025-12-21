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
/**
 * ProjectContextServer - The mandatory context service for OS 2.0
 */
export declare class ProjectContextServer {
    private server;
    private semantic;
    private bundler;
    constructor();
    /**
     * Auto-detect project path from environment or git root
     */
    private detectProjectPath;
    private setupHandlers;
    /**
     * Define MCP tools exposed by this server
     */
    private getTools;
    /**
     * CORE FUNCTION: Query project context
     * This is called before EVERY agent operation
     */
    private handleQueryContext;
    private handleSaveDecision;
    private handleSaveStandard;
    private handleSaveTaskHistory;
    private handleIndexProject;
    private handleReanalyzeProject;
    private countFilesInTree;
    /**
     * Start the MCP server
     */
    run(): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map