/**
 * Context Bundler
 *
 * Creates tailored context bundles by combining:
 * - Code search via vibe.db (hybrid: semantic + symbol + fulltext)
 * - Session memory via Workshop (decisions, standards, history)
 * - Project state (components, structure)
 *
 * Every agent receives a ContextBundle before work begins.
 */
import type { ContextBundle, ContextQuery, SemanticSearch, ProjectState } from './types.js';
export declare class ContextBundler {
    private semantic;
    private structureAnalyzer;
    private cacheMaxAge;
    private codeSearchCache;
    constructor(semantic: SemanticSearch);
    /**
     * Get or create CodeSearch for a project
     */
    private getCodeSearch;
    /**
     * Create a complete context bundle for an agent operation
     *
     * KEY PRINCIPLE: Return MINIMAL, RELEVANT context - not full project dumps.
     * A 25k token response is a failure. Target: <3k tokens.
     */
    createBundle(query: ContextQuery): Promise<ContextBundle>;
    /**
     * Get files relevant to the task using hybrid search
     *
     * Uses vibe.db's hybrid search (semantic + symbol + fulltext) if available,
     * falls back to basic keyword search if vibe.db doesn't exist.
     */
    private getRelevantFiles;
    /**
     * Get PROJECT STATE SUMMARY - minimal context, not full dumps
     * Returns counts and key directories, not full file trees
     */
    private getProjectStateSummary;
    /**
     * Summarize project state to minimal tokens
     * Target: <500 tokens for project state
     */
    private summarizeProjectState;
    /**
     * Extract only key dependencies (frameworks, not utilities)
     */
    private extractKeyDependencies;
    /**
     * Get current project state (with caching) - FULL VERSION
     * Used for reanalyze, not for query_context
     */
    private getProjectState;
    /**
     * Force reanalysis of project structure
     */
    reanalyzeProject(projectPath: string): Promise<ProjectState>;
    /**
     * Cache project state to disk
     */
    private cacheProjectState;
    /**
     * Get design system SUMMARY - key tokens only, not full system
     * Target: <200 tokens
     */
    private getDesignSystemSummary;
    /**
     * Extract primary colors from design system (max 5)
     */
    private extractPrimaryColors;
    /**
     * Count files in tree (helper)
     */
    private countFilesInTree;
}
//# sourceMappingURL=bundle.d.ts.map