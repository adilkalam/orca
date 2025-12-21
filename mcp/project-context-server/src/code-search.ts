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

import { execSync, spawn } from 'child_process';
import { join } from 'path';
import { existsSync } from 'fs';
import type { FileContext } from './types.js';

// Path to vibe-sync.py
const VIBE_SYNC_PATH = join(
  process.env.HOME || '',
  '.claude',
  'scripts',
  'vibe-sync.py'
);

/**
 * Search result from vibe.db
 */
interface VibeSearchResult {
  file_path: string;
  name?: string;
  parent_name?: string;
  chunk_type?: string;
  content?: string;
  score: number;
}

/**
 * Code search that queries vibe.db's code_chunks and symbols
 */
export class CodeSearch {
  private projectPath: string;
  private vibeDbPath: string;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
    this.vibeDbPath = join(projectPath, '.claude', 'memory', 'vibe.db');
  }

  /**
   * Check if vibe.db exists for this project
   */
  hasVibeDb(): boolean {
    return existsSync(this.vibeDbPath);
  }

  /**
   * Initialize vibe.db if it doesn't exist
   */
  async ensureVibeDb(): Promise<boolean> {
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
    } catch (error) {
      console.error('Failed to initialize vibe.db:', error);
      return false;
    }
  }

  /**
   * Hybrid search using vibe.db
   *
   * Combines semantic, symbol, and full-text search with weighted scoring
   */
  async hybridSearch(
    query: string,
    maxResults: number = 10
  ): Promise<FileContext[]> {
    if (!this.hasVibeDb()) {
      console.error('vibe.db not found, skipping code search');
      return [];
    }

    try {
      // Use vibe-sync.py hsearch command
      const output = execSync(
        `python3 "${VIBE_SYNC_PATH}" hsearch "${query.replace(/"/g, '\\"')}" --limit ${maxResults * 2}`,
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
    if (!this.hasVibeDb()) {
      return [];
    }

    try {
      const output = execSync(
        `python3 "${VIBE_SYNC_PATH}" symbol "${symbolName.replace(/"/g, '\\"')}" --limit ${maxResults}`,
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

      const results: VibeSearchResult[] = JSON.parse(jsonMatch[0]);

      // Deduplicate by file path (keep highest score)
      const fileMap = new Map<string, VibeSearchResult>();
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
