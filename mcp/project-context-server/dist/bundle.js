/**
 * Context Bundler
 *
 * Creates tailored context bundles by combining:
 * - Code search via vibe.db (hybrid: semantic + symbol + fulltext)
 * - Session memory via Workshop (decisions, standards, history)
 * - Project state (components, structure)
 *
 * Every agent receives a ContextBundle before work begins.
 */
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { StructureAnalyzer } from './structure.js';
import { WorkshopClient } from './workshop.js';
import { CodeSearch } from './code-search.js';
export class ContextBundler {
    semantic;
    structureAnalyzer;
    cacheMaxAge = 1000 * 60 * 60; // 1 hour cache
    codeSearchCache = new Map();
    constructor(semantic) {
        this.semantic = semantic;
        this.structureAnalyzer = new StructureAnalyzer();
    }
    /**
     * Get or create CodeSearch for a project
     */
    getCodeSearch(projectPath) {
        let codeSearch = this.codeSearchCache.get(projectPath);
        if (!codeSearch) {
            codeSearch = new CodeSearch(projectPath);
            this.codeSearchCache.set(projectPath, codeSearch);
        }
        return codeSearch;
    }
    /**
     * Create a complete context bundle for an agent operation
     *
     * KEY PRINCIPLE: Return MINIMAL, RELEVANT context - not full project dumps.
     * A 25k token response is a failure. Target: <3k tokens.
     */
    async createBundle(query) {
        // Create Workshop client for this project
        const workshop = new WorkshopClient(query.projectPath);
        console.error(`Creating context bundle: ${query.domain} - ${query.task.substring(0, 50)}...`);
        // Run queries in parallel for efficiency
        // Now using Workshop for decisions, standards, and task history
        const [relevantFiles, pastDecisions, relatedStandards, similarTasks, projectStateSummary,] = await Promise.all([
            this.getRelevantFiles(query),
            workshop.queryDecisions(query.task, 3), // Reduced from 5
            workshop.queryStandards(query.domain),
            query.includeHistory ? workshop.queryTaskHistory(query.task, 3) : Promise.resolve([]), // Reduced from 5
            this.getProjectStateSummary(query.projectPath), // Summary, not full state
        ]);
        const bundle = {
            relevantFiles,
            projectState: projectStateSummary,
            pastDecisions,
            relatedStandards,
            similarTasks,
        };
        // Add design system summary for webdev and expo domains (tokens only, not full system)
        if (query.domain === 'webdev' || query.domain === 'expo' || query.domain === 'nextjs') {
            bundle.designSystem = await this.getDesignSystemSummary(query.projectPath);
        }
        console.error(`Bundle created: ${relevantFiles.length} files, ` +
            `${pastDecisions.length} decisions, ` +
            `${relatedStandards.length} standards`);
        return bundle;
    }
    /**
     * Get files relevant to the task using hybrid search
     *
     * Uses vibe.db's hybrid search (semantic + symbol + fulltext) if available,
     * falls back to basic keyword search if vibe.db doesn't exist.
     */
    async getRelevantFiles(query) {
        const maxFiles = query.maxFiles || 10;
        const codeSearch = this.getCodeSearch(query.projectPath);
        // Try vibe.db hybrid search first
        if (codeSearch.hasVibeDb()) {
            console.error('Using vibe.db hybrid search for code context');
            const results = await codeSearch.hybridSearch(query.task, maxFiles);
            if (results.length > 0) {
                return results;
            }
            // Fall through to basic search if no results
            console.error('vibe.db returned no results, falling back to keyword search');
        }
        else {
            console.error('vibe.db not found, using basic keyword search');
        }
        // Fallback to basic keyword search
        return await this.semantic.search(query.task, query.projectPath, maxFiles);
    }
    // Note: getPastDecisions, getRelatedStandards, getSimilarTasks
    // are now handled by WorkshopClient directly in createBundle()
    /**
     * Get PROJECT STATE SUMMARY - minimal context, not full dumps
     * Returns counts and key directories, not full file trees
     */
    async getProjectStateSummary(projectPath) {
        const statePath = join(projectPath, '.claude', 'memory', 'state.json');
        let fullState = null;
        // Try to read cached state
        try {
            const stateData = await readFile(statePath, 'utf-8');
            const cachedState = JSON.parse(stateData);
            // Check if cache is still fresh
            const cacheAge = Date.now() - new Date(cachedState.lastUpdated).getTime();
            if (cacheAge < this.cacheMaxAge) {
                console.error(`Using cached project state (${Math.round(cacheAge / 1000 / 60)}min old)`);
                fullState = cachedState;
            }
        }
        catch {
            // No cache or invalid cache
        }
        // Cache miss or expired - analyze project
        if (!fullState) {
            console.error('Analyzing project structure (this may take a moment)...');
            fullState = await this.structureAnalyzer.analyzeProject(projectPath);
            await this.cacheProjectState(projectPath, fullState);
        }
        // RETURN SUMMARY, NOT FULL STATE
        // This is the key change - summarize instead of dump
        return this.summarizeProjectState(fullState, projectPath);
    }
    /**
     * Summarize project state to minimal tokens
     * Target: <500 tokens for project state
     */
    summarizeProjectState(state, projectPath) {
        // Count files in tree
        const fileCount = this.countFilesInTree(state.fileStructure);
        // Get top-level directories only
        const topLevelDirs = (state.fileStructure.children || [])
            .filter((c) => c.type === 'directory')
            .map((c) => c.name)
            .slice(0, 10); // Max 10 dirs
        // Count dependencies
        const depCount = Object.keys(state.dependencies).length;
        // Get key dependencies only (frameworks, not utilities)
        const keyDeps = this.extractKeyDependencies(state.dependencies);
        // Count components
        const componentCount = state.components.length;
        // Get component names only (no paths, no imports/exports)
        const componentNames = state.components
            .slice(0, 15) // Max 15 components
            .map((c) => c.name);
        return {
            summary: {
                totalFiles: fileCount,
                totalDependencies: depCount,
                totalComponents: componentCount,
                lastUpdated: state.lastUpdated,
            },
            topLevelDirectories: topLevelDirs,
            keyDependencies: keyDeps,
            componentNames: componentNames,
            // NOTE: Full file tree intentionally omitted - use relevantFiles for specific files
        };
    }
    /**
     * Extract only key dependencies (frameworks, not utilities)
     */
    extractKeyDependencies(deps) {
        const keyPatterns = [
            'next', 'react', 'vue', 'angular', 'svelte', // Frameworks
            'expo', 'react-native', // Mobile
            'tailwind', 'styled-components', // Styling
            'prisma', 'drizzle', 'mongoose', // DB
            'express', 'fastify', 'hono', // Server
            'typescript', // Language
        ];
        return Object.keys(deps)
            .filter(dep => keyPatterns.some(pattern => dep.includes(pattern)))
            .slice(0, 10); // Max 10 key deps
    }
    /**
     * Get current project state (with caching) - FULL VERSION
     * Used for reanalyze, not for query_context
     */
    async getProjectState(projectPath) {
        const statePath = join(projectPath, '.claude', 'memory', 'state.json');
        // Try to read cached state
        try {
            const stateData = await readFile(statePath, 'utf-8');
            const cachedState = JSON.parse(stateData);
            // Check if cache is still fresh
            const cacheAge = Date.now() - new Date(cachedState.lastUpdated).getTime();
            if (cacheAge < this.cacheMaxAge) {
                console.error(`Using cached project state (${Math.round(cacheAge / 1000 / 60)}min old)`);
                return cachedState;
            }
        }
        catch {
            // No cache or invalid cache
        }
        // Cache miss or expired - analyze project
        console.error('Analyzing project structure (this may take a moment)...');
        const projectState = await this.structureAnalyzer.analyzeProject(projectPath);
        // Cache the result
        await this.cacheProjectState(projectPath, projectState);
        return projectState;
    }
    /**
     * Force reanalysis of project structure
     */
    async reanalyzeProject(projectPath) {
        console.error('Force reanalyzing project structure...');
        const projectState = await this.structureAnalyzer.analyzeProject(projectPath);
        await this.cacheProjectState(projectPath, projectState);
        return projectState;
    }
    /**
     * Cache project state to disk
     */
    async cacheProjectState(projectPath, state) {
        const stateDir = join(projectPath, '.claude', 'memory');
        const statePath = join(stateDir, 'state.json');
        try {
            // Ensure directory exists
            await mkdir(stateDir, { recursive: true });
            // Write state
            await writeFile(statePath, JSON.stringify(state, null, 2), 'utf-8');
            console.error(`Project state cached to ${statePath}`);
        }
        catch (error) {
            console.error(`Failed to cache project state:`, error);
        }
    }
    /**
     * Get design system SUMMARY - key tokens only, not full system
     * Target: <200 tokens
     */
    async getDesignSystemSummary(projectPath) {
        // Check multiple possible locations
        const designPaths = [
            join(projectPath, 'design-dna.json'),
            join(projectPath, '.claude', 'design-dna', 'design-dna.json'),
            join(projectPath, 'design-system.json'),
        ];
        for (const designPath of designPaths) {
            try {
                const designData = await readFile(designPath, 'utf-8');
                const fullSystem = JSON.parse(designData);
                // Return SUMMARY only
                return {
                    hasDesignSystem: true,
                    source: designPath.split('/').pop(),
                    // Extract only key tokens
                    primaryColors: this.extractPrimaryColors(fullSystem),
                    fontFamily: fullSystem.typography?.fontFamily || fullSystem.fonts?.primary,
                    spacing: fullSystem.spacing?.base || fullSystem.spacing?.unit,
                    borderRadius: fullSystem.borderRadius?.base || fullSystem.radius?.default,
                    // NOTE: Full design system intentionally omitted
                };
            }
            catch {
                // Try next path
            }
        }
        // No design system found
        return { hasDesignSystem: false };
    }
    /**
     * Extract primary colors from design system (max 5)
     */
    extractPrimaryColors(system) {
        const colors = [];
        // Try different common structures
        if (system.colors?.primary)
            colors.push(`primary: ${system.colors.primary}`);
        if (system.colors?.secondary)
            colors.push(`secondary: ${system.colors.secondary}`);
        if (system.colors?.accent)
            colors.push(`accent: ${system.colors.accent}`);
        if (system.colors?.background)
            colors.push(`bg: ${system.colors.background}`);
        if (system.colors?.text)
            colors.push(`text: ${system.colors.text}`);
        // Or it might be flat
        if (system.primary)
            colors.push(`primary: ${system.primary}`);
        if (system.background)
            colors.push(`bg: ${system.background}`);
        return colors.slice(0, 5);
    }
    /**
     * Count files in tree (helper)
     */
    countFilesInTree(node) {
        if (node.type === 'file')
            return 1;
        return (node.children || []).reduce((sum, child) => sum + this.countFilesInTree(child), 0);
    }
}
//# sourceMappingURL=bundle.js.map