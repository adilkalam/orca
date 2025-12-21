/**
 * Semantic Search Implementation
 *
 * Integrates with Claude Context MCP for semantic code search
 * Provides instant, relevant file discovery across large codebases
 */

import { readdir, stat, readFile } from 'fs/promises';
import { join, relative } from 'path';
import type { FileContext, SemanticSearch } from './types.js';

/**
 * Semantic search implementation using Claude Context MCP
 *
 * Note: This is a simplified implementation.
 * In production, this would delegate to Claude Context MCP's vector search.
 */
export class SemanticSearchImpl implements SemanticSearch {
  private projectIndexes: Map<string, ProjectIndex> = new Map();

  /**
   * Search for files semantically relevant to a query
   */
  async search(
    query: string,
    projectPath: string,
    maxResults = 10
  ): Promise<FileContext[]> {
    // Get or create index for this project
    let index = this.projectIndexes.get(projectPath);
    if (!index) {
      await this.indexProject(projectPath);
      index = this.projectIndexes.get(projectPath)!;
    }

    // Simple keyword-based search for now
    // TODO: Replace with Claude Context MCP vector search
    const queryLower = query.toLowerCase();
    const results: Array<FileContext & { score: number }> = [];

    for (const [path, metadata] of index.files) {
      let score = 0;

      // Check filename relevance
      const filename = path.split('/').pop()!.toLowerCase();
      if (filename.includes(queryLower)) {
        score += 10;
      }

      // Check symbols relevance
      if (metadata.symbols) {
        for (const symbol of metadata.symbols) {
          if (symbol.toLowerCase().includes(queryLower)) {
            score += 5;
          }
        }
      }

      // Check summary relevance (if available)
      if (metadata.summary?.toLowerCase().includes(queryLower)) {
        score += 3;
      }

      if (score > 0) {
        results.push({
          path: relative(projectPath, path),
          type: this.getFileType(path),
          lastModified: metadata.lastModified,
          summary: metadata.summary,
          relevanceScore: score,
          symbols: metadata.symbols,
          score,
        });
      }
    }

    // Sort by relevance and return top results
    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)
      .map(({ score, ...file }) => file);
  }

  /**
   * Index a project for semantic search
   */
  async indexProject(projectPath: string): Promise<void> {
    console.error(`Indexing project: ${projectPath}`);

    const index: ProjectIndex = {
      projectPath,
      files: new Map(),
      lastIndexed: new Date(),
    };

    await this.indexDirectory(projectPath, projectPath, index);

    this.projectIndexes.set(projectPath, index);
    console.error(
      `Indexed ${index.files.size} files in ${projectPath}`
    );
  }

  /**
   * Recursively index a directory
   */
  private async indexDirectory(
    dirPath: string,
    projectPath: string,
    index: ProjectIndex
  ): Promise<void> {
    const entries = await readdir(dirPath);

    for (const entry of entries) {
      // Skip common ignore patterns
      if (this.shouldIgnore(entry)) continue;

      const fullPath = join(dirPath, entry);
      const stats = await stat(fullPath);

      if (stats.isDirectory()) {
        await this.indexDirectory(fullPath, projectPath, index);
      } else if (stats.isFile() && this.shouldIndex(entry)) {
        await this.indexFile(fullPath, stats.mtime, index);
      }
    }
  }

  /**
   * Index a single file
   */
  private async indexFile(
    filePath: string,
    lastModified: Date,
    index: ProjectIndex
  ): Promise<void> {
    try {
      const content = await readFile(filePath, 'utf-8');
      const symbols = this.extractSymbols(content, filePath);
      const summary = this.generateSummary(content, filePath);

      index.files.set(filePath, {
        lastModified,
        symbols,
        summary,
      });
    } catch (error) {
      // Skip files that can't be read
      console.error(`Failed to index ${filePath}:`, error);
    }
  }

  /**
   * Extract symbols (exports, functions, classes) from file
   */
  private extractSymbols(content: string, filePath: string): string[] {
    const symbols: string[] = [];

    // TypeScript/JavaScript exports
    if (filePath.match(/\.(ts|tsx|js|jsx)$/)) {
      // Export statements
      const exportMatches = content.matchAll(/export\s+(const|function|class|interface|type)\s+(\w+)/g);
      for (const match of exportMatches) {
        symbols.push(match[2]);
      }

      // Default exports with name
      const defaultMatch = content.match(/export\s+default\s+(function|class)\s+(\w+)/);
      if (defaultMatch) {
        symbols.push(defaultMatch[2]);
      }
    }

    // Python exports
    if (filePath.endsWith('.py')) {
      const defMatches = content.matchAll(/^def\s+(\w+)/gm);
      for (const match of defMatches) {
        symbols.push(match[1]);
      }

      const classMatches = content.matchAll(/^class\s+(\w+)/gm);
      for (const match of classMatches) {
        symbols.push(match[1]);
      }
    }

    return symbols;
  }

  /**
   * Generate a brief summary of file contents
   */
  private generateSummary(content: string, filePath: string): string | undefined {
    // Extract first JSDoc comment or Python docstring
    const jsDocMatch = content.match(/\/\*\*\s*\n\s*\*\s*([^\n]+)/);
    if (jsDocMatch) {
      return jsDocMatch[1].trim();
    }

    const pyDocMatch = content.match(/"""\s*([^\n]+)/);
    if (pyDocMatch) {
      return pyDocMatch[1].trim();
    }

    return undefined;
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
      py: 'python',
      md: 'markdown',
      json: 'json',
      yaml: 'yaml',
      yml: 'yaml',
    };
    return typeMap[ext || ''] || 'unknown';
  }

  /**
   * Should this entry be ignored?
   */
  private shouldIgnore(entry: string): boolean {
    const ignorePatterns = [
      'node_modules',
      '.git',
      'dist',
      'build',
      '.next',
      '__pycache__',
      '.venv',
      'venv',
      '.DS_Store',
    ];
    return ignorePatterns.includes(entry) || entry.startsWith('.');
  }

  /**
   * Should this file be indexed?
   */
  private shouldIndex(filename: string): boolean {
    const indexableExtensions = [
      '.ts',
      '.tsx',
      '.js',
      '.jsx',
      '.py',
      '.md',
      '.json',
      '.yaml',
      '.yml',
    ];
    return indexableExtensions.some((ext) => filename.endsWith(ext));
  }
}

/**
 * Project index structure
 */
interface ProjectIndex {
  projectPath: string;
  files: Map<string, FileMetadata>;
  lastIndexed: Date;
}

interface FileMetadata {
  lastModified: Date;
  symbols?: string[];
  summary?: string;
}
