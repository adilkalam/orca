/**
 * Structure Analyzer
 * Analyzes project structure to build ProjectState
 */
import type { ProjectState } from './types.js';
export declare class StructureAnalyzer {
    /**
     * Analyze project to build state
     */
    analyzeProject(projectPath: string): Promise<ProjectState>;
    /**
     * Build file tree (simplified)
     */
    private buildFileTree;
    /**
     * Find components (simplified)
     */
    private findComponents;
    /**
     * Read dependencies from package.json
     */
    private readDependencies;
}
//# sourceMappingURL=structure.d.ts.map