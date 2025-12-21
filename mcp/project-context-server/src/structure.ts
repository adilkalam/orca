/**
 * Structure Analyzer
 * Analyzes project structure to build ProjectState
 */

import { readdir, stat, readFile } from 'fs/promises';
import { join, extname } from 'path';
import type { ProjectState, FileNode, ComponentRegistry } from './types.js';

export class StructureAnalyzer {
  /**
   * Analyze project to build state
   */
  async analyzeProject(projectPath: string): Promise<ProjectState> {
    const fileStructure = await this.buildFileTree(projectPath);
    const components = await this.findComponents(projectPath);
    const dependencies = await this.readDependencies(projectPath);

    return {
      fileStructure,
      components,
      dependencies,
      lastUpdated: new Date(),
    };
  }

  /**
   * Build file tree (simplified)
   */
  private async buildFileTree(dir: string, depth = 0): Promise<FileNode> {
    if (depth > 3) {
      return {
        name: '...',
        type: 'directory',
        path: dir,
      };
    }

    const name = dir.split('/').pop() || '';
    const children: FileNode[] = [];

    try {
      const items = await readdir(dir);

      for (const item of items) {
        // Skip node_modules, .git, etc.
        if (item.startsWith('.') || item === 'node_modules' || item === 'dist') {
          continue;
        }

        const fullPath = join(dir, item);
        const stats = await stat(fullPath);

        if (stats.isDirectory()) {
          children.push(await this.buildFileTree(fullPath, depth + 1));
        } else {
          children.push({
            name: item,
            type: 'file',
            path: fullPath,
          });
        }
      }
    } catch {
      // Ignore errors
    }

    return {
      name,
      type: 'directory',
      path: dir,
      children: children.length > 0 ? children : undefined,
    };
  }

  /**
   * Find components (simplified)
   */
  private async findComponents(projectPath: string): Promise<ComponentRegistry[]> {
    const components: ComponentRegistry[] = [];

    // Look for common component patterns
    const searchDirs = ['src/components', 'components', 'app/components', 'src'];

    for (const searchDir of searchDirs) {
      try {
        const dir = join(projectPath, searchDir);
        const items = await readdir(dir);

        for (const item of items) {
          const ext = extname(item);
          if (['.tsx', '.jsx', '.ts', '.js', '.vue', '.svelte'].includes(ext)) {
            components.push({
              name: item.replace(ext, ''),
              path: join(dir, item),
              type: 'component',
              exports: [],
              imports: [],
            });
          }
        }
      } catch {
        // Directory doesn't exist
      }
    }

    return components;
  }

  /**
   * Read dependencies from package.json
   */
  private async readDependencies(projectPath: string): Promise<Record<string, string>> {
    try {
      const packageJsonPath = join(projectPath, 'package.json');
      const content = await readFile(packageJsonPath, 'utf-8');
      const pkg = JSON.parse(content);

      return {
        ...(pkg.dependencies || {}),
        ...(pkg.devDependencies || {}),
      };
    } catch {
      return {};
    }
  }
}