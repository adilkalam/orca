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
import { execSync } from 'child_process';
import { join } from 'path';
import { existsSync } from 'fs';
// Path to vibe-sync.py
const VIBE_SYNC_PATH = join(process.env.HOME || '', '.claude', 'scripts', 'vibe-sync.py');
/**
 * Code search that queries vibe.db's code_chunks and symbols
 */
export class CodeSearch {
    projectPath;
    vibeDbPath;
    constructor(projectPath) {
        this.projectPath = projectPath;
        this.vibeDbPath = join(projectPath, '.claude', 'memory', 'vibe.db');
    }
    /**
     * Check if vibe.db exists for this project
     */
    hasVibeDb() {
        return existsSync(this.vibeDbPath);
    }
    /**
     * Initialize vibe.db if it doesn't exist
     */
    async ensureVibeDb() {
        if (this.hasVibeDb()) {
            return true;
        }
        // Try to initialize vibe.db
        try {
            execSync(`python3 "${VIBE_SYNC_PATH}" init`, {
                cwd: this.projectPath,
                encoding: 'utf8',
                stdio: ['pipe', 'pipe', 'pipe'],
            });
            return this.hasVibeDb();
        }
        catch (error) {
            console.error('Failed to initialize vibe.db:', error);
            return false;
        }
    }
    /**
     * Hybrid search using vibe.db
     *
     * Combines semantic, symbol, and full-text search with weighted scoring
     */
    async hybridSearch(query, maxResults = 10) {
        if (!this.hasVibeDb()) {
            console.error('vibe.db not found, skipping code search');
            return [];
        }
        try {
            // Use vibe-sync.py hsearch command
            const output = execSync(`python3 "${VIBE_SYNC_PATH}" hsearch "${query.replace(/"/g, '\\"')}" --limit ${maxResults * 2}`, {
                cwd: this.projectPath,
                encoding: 'utf8',
                stdio: ['pipe', 'pipe', 'pipe'],
            });
            return this.parseHybridSearchResults(output, maxResults);
        }
        catch (error) {
            console.error('Hybrid search failed:', error);
            return [];
        }
    }
    /**
     * Symbol search - fast lookup by function/class name
     */
    async symbolSearch(symbolName, maxResults = 10) {
        if (!this.hasVibeDb()) {
            return [];
        }
        try {
            const output = execSync(`python3 "${VIBE_SYNC_PATH}" symbol "${symbolName.replace(/"/g, '\\"')}" --limit ${maxResults}`, {
                cwd: this.projectPath,
                encoding: 'utf8',
                stdio: ['pipe', 'pipe', 'pipe'],
            });
            return this.parseSymbolSearchResults(output);
        }
        catch (error) {
            console.error('Symbol search failed:', error);
            return [];
        }
    }
    /**
     * Parse hybrid search JSON output
     */
    parseHybridSearchResults(output, maxResults) {
        try {
            // Find the JSON array in the output
            const jsonMatch = output.match(/\[[\s\S]*\]/);
            if (!jsonMatch) {
                return [];
            }
            const results = JSON.parse(jsonMatch[0]);
            // Deduplicate by file path (keep highest score)
            const fileMap = new Map();
            for (const result of results) {
                const existing = fileMap.get(result.file_path);
                if (!existing || result.score > existing.score) {
                    fileMap.set(result.file_path, result);
                }
            }
            // Convert to FileContext format
            return Array.from(fileMap.values())
                .slice(0, maxResults)
                .map((result) => ({
                path: result.file_path,
                type: this.getFileType(result.file_path),
                lastModified: new Date(),
                relevanceScore: result.score,
                symbols: result.name ? [result.name] : undefined,
                summary: result.parent_name
                    ? `${result.chunk_type || 'code'} in ${result.parent_name}`
                    : result.chunk_type || undefined,
            }));
        }
        catch (error) {
            console.error('Failed to parse hybrid search results:', error);
            return [];
        }
    }
    /**
     * Parse symbol search output
     */
    parseSymbolSearchResults(output) {
        try {
            const jsonMatch = output.match(/\[[\s\S]*\]/);
            if (!jsonMatch) {
                return [];
            }
            const results = JSON.parse(jsonMatch[0]);
            return results.map((result) => ({
                path: result.file_path,
                type: this.getFileType(result.file_path),
                lastModified: new Date(),
                relevanceScore: 1.0,
                symbols: [result.name],
                summary: result.symbol_type
                    ? `${result.symbol_type}: ${result.name}`
                    : undefined,
            }));
        }
        catch (error) {
            console.error('Failed to parse symbol search results:', error);
            return [];
        }
    }
    /**
     * Get file type from extension
     */
    getFileType(path) {
        const ext = path.split('.').pop()?.toLowerCase();
        const typeMap = {
            ts: 'typescript',
            tsx: 'typescript-react',
            js: 'javascript',
            jsx: 'javascript-react',
            swift: 'swift',
            py: 'python',
            md: 'markdown',
            json: 'json',
            yaml: 'yaml',
            yml: 'yaml',
        };
        return typeMap[ext || ''] || 'unknown';
    }
}
/**
 * Factory function to create CodeSearch for a project
 */
export function createCodeSearch(projectPath) {
    return new CodeSearch(projectPath);
}
//# sourceMappingURL=code-search.js.map