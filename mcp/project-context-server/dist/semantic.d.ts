/**
 * Semantic Search Implementation
 *
 * Integrates with Claude Context MCP for semantic code search
 * Provides instant, relevant file discovery across large codebases
 */
import type { FileContext, SemanticSearch } from './types.js';
/**
 * Semantic search implementation using Claude Context MCP
 *
 * Note: This is a simplified implementation.
 * In production, this would delegate to Claude Context MCP's vector search.
 */
export declare class SemanticSearchImpl implements SemanticSearch {
    private projectIndexes;
    /**
     * Search for files semantically relevant to a query
     */
    search(query: string, projectPath: string, maxResults?: number): Promise<FileContext[]>;
    /**
     * Index a project for semantic search
     */
    indexProject(projectPath: string): Promise<void>;
    /**
     * Recursively index a directory
     */
    private indexDirectory;
    /**
     * Index a single file
     */
    private indexFile;
    /**
     * Extract symbols (exports, functions, classes) from file
     */
    private extractSymbols;
    /**
     * Generate a brief summary of file contents
     */
    private generateSummary;
    /**
     * Get file type from extension
     */
    private getFileType;
    /**
     * Should this entry be ignored?
     */
    private shouldIgnore;
    /**
     * Should this file be indexed?
     */
    private shouldIndex;
}
//# sourceMappingURL=semantic.d.ts.map