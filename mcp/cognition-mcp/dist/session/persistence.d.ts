/**
 * Persistence Layer - Global storage at ~/.orca-cognition/
 *
 * All sessions: ~/.orca-cognition/sessions/{sessionId}/
 * Global index: ~/.orca-cognition/index.jsonl (cross-project search)
 *
 * projectPath is stored in session metadata for attribution but does NOT
 * affect storage location. All machine-readable data is global.
 *
 * Append-only JSONL format for each store type.
 * Prevents corruption and allows streaming reads.
 */
import type { SessionMetadata, SessionStores, SessionExport, StoredEntry } from '../types.js';
import { SessionState } from './state.js';
/**
 * Resolve the base cognition directory. Always global.
 * _projectPath accepted for backward compatibility but ignored.
 */
export declare function resolveBaseDir(_projectPath?: string): string;
/**
 * Resolve the sessions directory. Always global.
 */
export declare function resolveSessionsDir(_projectPath?: string): string;
/**
 * Ensure all required directories exist.
 * _projectPath accepted for backward compatibility but ignored.
 */
export declare function ensureDirectories(_projectPath?: string): void;
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
 * Save protocol state to protocol.json
 * Called after checkpoint modifies protocol state.
 */
export declare function saveProtocolState(session: SessionState): void;
/**
 * Append a single entry to the appropriate JSONL file.
 * This is the core of append-only persistence.
 */
export declare function appendEntry(sessionId: string, storeType: keyof SessionStores, entry: StoredEntry<unknown>, projectPath?: string): void;
/**
 * Load session from filesystem. Always from global storage.
 * _projectPath accepted for backward compatibility but ignored.
 */
export declare function loadSession(sessionId: string, _projectPath?: string): Promise<SessionState | null>;
/**
 * Export complete session to session directory.
 * Called when nextThoughtNeeded: false
 */
export declare function exportSession(session: SessionState): Promise<string>;
/**
 * Import session from export data.
 */
export declare function importSession(data: SessionExport): Promise<SessionState>;
/**
 * Check if session exists in global storage.
 * _projectPath accepted for backward compatibility but ignored.
 */
export declare function sessionExists(sessionId: string, _projectPath?: string): boolean;
/**
 * List all session IDs from global storage.
 * _projectPath accepted for backward compatibility but ignored.
 */
export declare function listSessions(_projectPath?: string): Promise<string[]>;
//# sourceMappingURL=persistence.d.ts.map