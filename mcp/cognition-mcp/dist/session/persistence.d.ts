/**
 * Persistence Layer - Per-project + global fallback storage
 *
 * Per-project: {projectPath}/.claude/.cognition/sessions/{sessionId}/
 * Global fallback: ~/.orca-cognition/sessions/ (unattributed sessions)
 * Global index: ~/.orca-cognition/index.jsonl (cross-project search)
 *
 * Append-only JSONL format for each store type.
 * Prevents corruption and allows streaming reads.
 */
import type { SessionMetadata, SessionStores, SessionExport, StoredEntry } from '../types.js';
import { SessionState } from './state.js';
/**
 * Resolve the base cognition directory for a project or global.
 */
export declare function resolveBaseDir(projectPath?: string): string;
/**
 * Resolve the sessions directory for a project or global.
 */
export declare function resolveSessionsDir(projectPath?: string): string;
/**
 * Resolve the exports directory for a project or global.
 */
export declare function resolveExportsDir(projectPath?: string): string;
/**
 * Ensure all required directories exist.
 */
export declare function ensureDirectories(projectPath?: string): void;
/**
 * Append/update entry in global index.
 * Called on every session metadata save.
 */
export declare function updateGlobalIndex(metadata: SessionMetadata): void;
/**
 * Save session metadata to session.json
 */
export declare function saveSessionMetadata(session: SessionState): Promise<void>;
/**
 * Append a single entry to the appropriate JSONL file.
 * This is the core of append-only persistence.
 */
export declare function appendEntry(sessionId: string, storeType: keyof SessionStores, entry: StoredEntry<unknown>, projectPath?: string): void;
/**
 * Load session from filesystem.
 * Checks project-local first, then global fallback.
 * Returns null if session doesn't exist in either location.
 */
export declare function loadSession(sessionId: string, projectPath?: string): Promise<SessionState | null>;
/**
 * Export complete session to exports directory.
 * Called when nextThoughtNeeded: false
 */
export declare function exportSession(session: SessionState): Promise<string>;
/**
 * Import session from export data.
 */
export declare function importSession(data: SessionExport): Promise<SessionState>;
/**
 * Check if session exists (project-local or global).
 */
export declare function sessionExists(sessionId: string, projectPath?: string): boolean;
/**
 * List all session IDs for a project (or global).
 */
export declare function listSessions(projectPath?: string): Promise<string[]>;
//# sourceMappingURL=persistence.d.ts.map