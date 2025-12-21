/**
 * Code Search Implementation
 *
 * Queries vibe.db for code context using hybrid search:
 * - Semantic search (embeddings) - 40%
 * - Symbol search (function/class names) - 35%
 * - Full-text search - 25%
 *
 * This replaces the old in-memory keyword search with
 * vibe.db's indexed code_chunks and symbols tables.
 */
import type { FileContext } from './types.js';
/**
 * Code search that queries vibe.db's code_chunks and symbols
 */
export declare class CodeSearch {
    private projectPath;
    private vibeDbPath;
    constructor(projectPath: string);
    /**
     * Check if vibe.db exists for this project
     */
    hasVibeDb(): boolean;
    /**
     * Initialize vibe.db if it doesn't exist
     */
    ensureVibeDb(): Promise<boolean>;
    /**
     * Hybrid search using vibe.db
     *
     * Combines semantic, symbol, and full-text search with weighted scoring
     */
    hybridSearch(query: string, maxResults?: number): Promise<FileContext[]>;
    /**
     * Symbol search - fast lookup by function/class name
     */
    symbolSearch(symbolName: string, maxResults?: number): Promise<FileContext[]>;
    /**
     * Parse hybrid search JSON output
     */
    private parseHybridSearchResults;
    /**
     * Parse symbol search output
     */
    private parseSymbolSearchResults;
    /**
     * Get file type from extension
     */
    private getFileType;
}
/**
 * Factory function to create CodeSearch for a project
 */
export declare function createCodeSearch(projectPath: string): CodeSearch;
//# sourceMappingURL=code-search.d.ts.map