/**
 * SessionState - In-memory session state with typed stores
 *
 * Stores entries exactly as received. No transformation.
 */
import type { SessionMetadata, SessionStores, SessionExport, StoredEntry, SessionStateInterface, ProtocolState } from '../types.js';
export declare class SessionState implements SessionStateInterface {
    id: string;
    metadata: SessionMetadata;
    stores: SessionStores;
    protocolState?: ProtocolState;
    constructor(id: string, title?: string, tags?: string[], projectPath?: string);
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
     * Get or lazily create protocol state for constraint tracking.
     */
    getOrCreateProtocolState(): ProtocolState;
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