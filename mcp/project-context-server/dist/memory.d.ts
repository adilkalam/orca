/**
 * Memory Store Implementation
 *
 * Manages vibe.db - the project's persistent memory
 * Stores: decisions, standards, task history, events
 */
import type { Decision, Standard, TaskHistory, MemoryStore } from './types.js';
export declare class MemoryStoreImpl implements MemoryStore {
    private db;
    private projectPath;
    /**
     * Initialize database for a project (public method for interface)
     */
    initializeDb(projectPath: string): Promise<void>;
    /**
     * Initialize database for a project
     */
    private getDb;
    /**
     * Create vibe.db schema
     */
    private initSchema;
    saveDecision(decision: Omit<Decision, 'id' | 'timestamp'>): Promise<void>;
    queryDecisions(query: string, limit?: number): Promise<Decision[]>;
    saveStandard(standard: Omit<Standard, 'id' | 'created'>): Promise<void>;
    queryStandards(domain: string): Promise<Standard[]>;
    saveTaskHistory(task: Omit<TaskHistory, 'id' | 'timestamp'>): Promise<void>;
    queryTaskHistory(query: string, limit?: number): Promise<TaskHistory[]>;
}
//# sourceMappingURL=memory.d.ts.map