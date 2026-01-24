/**
 * Code Search Implementation
 *
 * Queries code-index.db for code context using hybrid search:
 * - Semantic search (embeddings) - 40%
 * - Symbol search (function/class names) - 35%
 * - Full-text search - 25%
 *
 * This replaces the old in-memory keyword search with
 * code-index.db's indexed code_chunks and symbols tables.
 */
import type { FileContext } from './types.js';
/**
 * Code search that queries code-index.db's code_chunks and symbols
 */
export declare class CodeSearch {
    private projectPath;
    private codeIndexDbPath;
    constructor(projectPath: string);
    /**
     * Check if code-index.db exists for this project
     */
    hasCodeIndex(): boolean;
    /**
     * Initialize code-index.db if it doesn't exist
     */
    ensureCodeIndex(): Promise<boolean>;
    /**
     * Hybrid search using code-index.db
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