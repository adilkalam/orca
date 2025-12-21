/**
 * Persistence Layer - JSONL read/write to ~/.orca-cognition/
 *
 * Append-only JSONL format for each store type.
 * Prevents corruption and allows streaming reads.
 */
import type { SessionStores, SessionExport, StoredEntry } from '../types.js';
import { SessionState } from './state.js';
/**
 * Ensure all required directories exist.
 */
export declare function ensureDirectories(): void;
/**
 * Save session metadata to session.json
 */
export declare function saveSessionMetadata(session: SessionState): Promise<void>;
/**
 * Append a single entry to the appropriate JSONL file.
 * This is the core of append-only persistence.
 */
export declare function appendEntry(sessionId: string, storeType: keyof SessionStores, entry: StoredEntry<unknown>): void;
/**
 * Load session from filesystem.
 * Returns null if session doesn't exist.
 */
export declare function loadSession(sessionId: string): Promise<SessionState | null>;
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
 * Check if session exists.
 */
export declare function sessionExists(sessionId: string): boolean;
/**
 * List all session IDs.
 */
export declare function listSessions(): Promise<string[]>;
//# sourceMappingURL=persistence.d.ts.map