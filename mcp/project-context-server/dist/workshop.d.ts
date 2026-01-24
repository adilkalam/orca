/**
 * Workshop Client
 *
 * Wraps Workshop CLI for reading/writing session memory.
 * Workshop handles: decisions, gotchas, learnings, task history
 *
 * This keeps code-index.db focused on code context only (chunks, components, embeddings)
 */
import type { Decision, Standard, TaskHistory, DecayConfig } from './types.js';
/**
 * Calculate decay score for a timestamp
 * Uses exponential decay: score = 0.5^(days / halfLife)
 */
export declare function calculateDecay(timestamp: Date, config: DecayConfig): number;
/**
 * Apply decay to a list of entries with timestamps
 * Returns entries sorted by decayed score (highest first)
 */
export declare function applyDecay<T extends {
    timestamp?: Date;
    created?: Date;
    entry_metadata?: string;
}>(entries: T[], config: DecayConfig): (T & {
    decayedScore: number;
    pinned: boolean;
})[];
export declare class WorkshopClient {
    private workspacePath;
    private projectPath;
    private decayConfig;
    constructor(projectPath: string);
    private getDbPath;
    private openDatabase;
    /**
     * Execute workshop command
     */
    private runWorkshop;
    /**
     * Save a decision to Workshop
     */
    saveDecision(decision: {
        domain: string;
        decision: string;
        reasoning: string;
        context?: string;
        tags?: string[];
    }): Promise<void>;
    /**
     * Save a gotcha (standard/rule) to Workshop
     */
    saveGotcha(standard: {
        what_happened: string;
        cost: string;
        rule: string;
        domain: string;
    }): Promise<void>;
    /**
     * Save task history as a note
     */
    saveTaskHistory(task: {
        domain: string;
        task: string;
        outcome: string;
        learnings?: string;
        files_modified?: string[];
    }): Promise<void>;
    /**
     * Query decisions from Workshop using SQLite
     * When decay is enabled, applies time-weighted scoring
     * Uses tokenized word matching for broader recall (matches ANY word)
     */
    queryDecisions(query: string, limit?: number): Promise<Decision[]>;
    /**
     * Query standards/gotchas from Workshop using SQLite
     * When decay is enabled, applies time-weighted scoring
     */
    queryStandards(domain: string): Promise<Standard[]>;
    /**
     * Query task history from Workshop using SQLite
     * When decay is enabled, applies time-weighted scoring
     * Uses tokenized word matching for broader recall (matches ANY word)
     */
    queryTaskHistory(query: string, limit?: number): Promise<TaskHistory[]>;
    /**
     * Get recent context from Workshop
     */
    getRecentContext(): Promise<string>;
    /**
     * Ensures .workshop symlink points to .claude/memory for CLI default behavior.
     * Safe: never overwrites directory with data.
     */
    ensureWorkshopSymlink(): Promise<void>;
}
//# sourceMappingURL=workshop.d.ts.map