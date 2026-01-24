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

import { execSync, spawn } from 'child_process';
import { join } from 'path';
import { existsSync } from 'fs';
import type { FileContext } from './types.js';

// Path to code-index.py
const CODE_INDEX_PATH = join(
  process.env.HOME || '',
  '.claude',
  'scripts',
  'code-index.py'
);

/**
 * Search result from code-index.db
 */
interface CodeSearchResult {
  file_path: string;
  name?: string;
  parent_name?: string;
  chunk_type?: string;
  content?: string;
  score: number;
}

/**
 * Code search that queries code-index.db's code_chunks and symbols
 */
export class CodeSearch {
  private projectPath: string;
  private codeIndexDbPath: string;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
    this.codeIndexDbPath = join(projectPath, '.claude', 'memory', 'code-index.db');
  }

  /**
   * Check if code-index.db exists for this project
   */
  hasCodeIndex(): boolean {
    return existsSync(this.codeIndexDbPath);
  }

  /**
   * Initialize code-index.db if it doesn't exist
   */
  async ensureCodeIndex(): Promise<boolean> {
    if (this.hasCodeIndex()) {
      return true;
    }

    // Try to initialize code-index.db
    try {
      execSync(`python3 "${CODE_INDEX_PATH}" init`, {
        cwd: this.projectPath,
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      return this.hasCodeIndex();
    } catch (error) {
      console.error('Failed to initialize code-index.db:', error);
      return false;
    }
  }

  /**
   * Hybrid search using code-index.db
   *
   * Combines semantic, symbol, and full-text search with weighted scoring
   */
  async hybridSearch(
    query: string,
    maxResults: number = 10
  ): Promise<FileContext[]> {
    if (!this.hasCodeIndex()) {
      console.error('code-index.db not found, skipping code search');
      return [];
    }

    try {
      // Use code-index.py hsearch command
      const output = execSync(
        `python3 "${CODE_INDEX_PATH}" hsearch "${query.replace(/"/g, '\\"')}" --limit ${maxResults * 2}`,
        {
          cwd: this.projectPath,
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'pipe'],
        }
      );

      return this.parseHybridSearchResults(output, maxResults);
    } catch (error) {
      console.error('Hybrid search failed:', error);
      return [];
    }
  }

  /**
   * Symbol search - fast lookup by function/class name
   */
  async symbolSearch(
    symbolName: string,
    maxResults: number = 10
  ): Promise<FileContext[]> {
    if (!this.hasCodeIndex()) {
      return [];
    }

    try {
      const output = execSync(
        `python3 "${CODE_INDEX_PATH}" symbol "${symbolName.replace(/"/g, '\\"')}" --limit ${maxResults}`,
        {
          cwd: this.projectPath,
          encoding: 'utf8',
          stdio: ['pipe', 'pipe', 'pipe'],
        }
      );

      return this.parseSymbolSearchResults(output);
    } catch (error) {
      console.error('Symbol search failed:', error);
      return [];
    }
  }

  /**
   * Parse hybrid search JSON output
   */
  private parseHybridSearchResults(
    output: string,
    maxResults: number
  ): FileContext[] {
    try {
      // Find the JSON array in the output
      const jsonMatch = output.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        return [];
      }

      const results: CodeSearchResult[] = JSON.parse(jsonMatch[0]);

      // Deduplicate by file path (keep highest score)
      const fileMap = new Map<string, CodeSearchResult>();
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
    } catch (error) {
      console.error('Failed to parse hybrid search results:', error);
      return [];
    }
  }

  /**
   * Parse symbol search output
   */
  private parseSymbolSearchResults(output: string): FileContext[] {
    try {
      const jsonMatch = output.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        return [];
      }

      const results = JSON.parse(jsonMatch[0]);

      return results.map((result: any) => ({
        path: result.file_path,
        type: this.getFileType(result.file_path),
        lastModified: new Date(),
        relevanceScore: 1.0,
        symbols: [result.name],
        summary: result.symbol_type
          ? `${result.symbol_type}: ${result.name}`
          : undefined,
      }));
    } catch (error) {
      console.error('Failed to parse symbol search results:', error);
      return [];
    }
  }

  /**
   * Get file type from extension
   */
  private getFileType(path: string): string {
    const ext = path.split('.').pop()?.toLowerCase();
    const typeMap: Record<string, string> = {
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
export function createCodeSearch(projectPath: string): CodeSearch {
  return new CodeSearch(projectPath);
}
