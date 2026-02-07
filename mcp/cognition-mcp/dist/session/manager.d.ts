/**
 * SessionManager - Create, load, and manage sessions
 *
 * Handles session lifecycle: create, load, persist, complete.
 * Supports per-project storage via projectPath parameter.
 */
import { SessionState } from './state.js';
import type { SessionStores, StoredEntry, SessionExport } from '../types.js';
export declare class SessionManager {
    private sessions;
    constructor();
    /**
     * Get or create a session.
     * If sessionId is provided, load existing session.
     * If not, create new session.
     * projectPath routes storage to {project}/.claude/.cognition/
     */
    getOrCreate(sessionId?: string, title?: string, tags?: string[], projectPath?: string): Promise<SessionState>;
    /**
     * Get a session by ID.
     * Returns null if not found.
     */
    get(sessionId: string, projectPath?: string): Promise<SessionState | null>;
    /**
     * Check if session exists.
     */
    exists(sessionId: string, projectPath?: string): boolean;
    /**
     * Add an entry to a session and persist.
     * This is the core store operation.
     */
    addEntry(session: SessionState, storeType: keyof SessionStores, entry: StoredEntry<unknown>): Promise<void>;
    /**
     * Complete a session and export.
     * Called when nextThoughtNeeded: false
     */
    completeSession(session: SessionState): Promise<string>;
    /**
     * Import a session from export data.
     */
    importFromExport(data: SessionExport): Promise<SessionState>;
}
export declare function getSessionManager(): SessionManager;
//# sourceMappingURL=manager.d.ts.map