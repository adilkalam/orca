/**
 * SessionState - In-memory session state with typed stores
 *
 * Stores entries exactly as received. No transformation.
 */
import type { SessionMetadata, SessionStores, SessionExport, StoredEntry, SessionStateInterface } from '../types.js';
export declare class SessionState implements SessionStateInterface {
    id: string;
    metadata: SessionMetadata;
    stores: SessionStores;
    constructor(id: string, title?: string, tags?: string[]);
    /**
     * Add an entry to the specified store.
     * Entry is stored EXACTLY as provided - no modification.
     */
    add(type: keyof SessionStores, entry: StoredEntry<any>): void;
    /**
     * Get count for a specific store type.
     */
    getCount(type: keyof SessionStores): number;
    /**
     * Get total count across all stores.
     */
    getTotalCount(): number;
    /**
     * Get all entries from a specific store.
     */
    getAll<T>(type: keyof SessionStores): StoredEntry<T>[];
    /**
     * Get session duration in milliseconds.
     */
    getDuration(): number;
    /**
     * Mark session as complete.
     */
    markComplete(): void;
    /**
     * Export session for persistence or reimport.
     */
    toExport(): SessionExport;
    /**
     * Restore session from export data.
     */
    static fromExport(data: SessionExport): SessionState;
}
//# sourceMappingURL=state.d.ts.map