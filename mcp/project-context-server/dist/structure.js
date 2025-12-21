/**
 * Structure Analyzer
 * Analyzes project structure to build ProjectState
 */
import { readdir, stat, readFile } from 'fs/promises';
import { join, extname } from 'path';
export class StructureAnalyzer {
    /**
     * Analyze project to build state
     */
    async analyzeProject(projectPath) {
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
    async buildFileTree(dir, depth = 0) {
        if (depth > 3) {
            return {
                name: '...',
                type: 'directory',
                path: dir,
            };
        }
        const name = dir.split('/').pop() || '';
        const children = [];
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
                }
                else {
                    children.push({
                        name: item,
                        type: 'file',
                        path: fullPath,
                    });
                }
            }
        }
        catch {
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
    async findComponents(projectPath) {
        const components = [];
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
            }
            catch {
                // Directory doesn't exist
            }
        }
        return components;
    }
    /**
     * Read dependencies from package.json
     */
    async readDependencies(projectPath) {
        try {
            const packageJsonPath = join(projectPath, 'package.json');
            const content = await readFile(packageJsonPath, 'utf-8');
            const pkg = JSON.parse(content);
            return {
                ...(pkg.dependencies || {}),
                ...(pkg.devDependencies || {}),
            };
        }
        catch {
            return {};
        }
    }
}
//# sourceMappingURL=structure.js.map