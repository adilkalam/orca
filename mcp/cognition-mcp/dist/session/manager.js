/**
 * SessionManager - Create, load, and manage sessions
 *
 * Handles session lifecycle: create, load, persist, complete.
 * Supports per-project storage via projectPath parameter.
 */
import { randomUUID } from 'crypto';
import { SessionState } from './state.js';
import { ensureDirectories, loadSession, saveSessionMetadata, appendEntry, exportSession, sessionExists, } from './persistence.js';
export class SessionManager {
    constructor() {
        this.sessions = new Map();
        ensureDirectories();
    }
    /**
     * Get or create a session.
     * If sessionId is provided, load existing session.
     * If not, create new session.
     * projectPath routes storage to {project}/.claude/.cognition/
     */
    async getOrCreate(sessionId, title, tags, projectPath) {
        // If sessionId provided, try to load existing
        if (sessionId) {
            // Check memory cache first
            const cached = this.sessions.get(sessionId);
            if (cached) {
                return cached;
            }
            // Try to load from filesystem (project-local then global fallback)
            const loaded = await loadSession(sessionId, projectPath);
            if (loaded) {
                this.sessions.set(sessionId, loaded);
                return loaded;
            }
            // Session doesn't exist, create new with provided ID
            if (projectPath) {
                ensureDirectories(projectPath);
            }
            const newSession = new SessionState(sessionId, title, tags, projectPath);
            this.sessions.set(sessionId, newSession);
            await saveSessionMetadata(newSession);
            return newSession;
        }
        // No sessionId provided, create new
        if (projectPath) {
            ensureDirectories(projectPath);
        }
        const newId = randomUUID();
        const session = new SessionState(newId, title, tags, projectPath);
        this.sessions.set(newId, session);
        await saveSessionMetadata(session);
        return session;
    }
    /**
     * Get a session by ID.
     * Returns null if not found.
     */
    async get(sessionId, projectPath) {
        // Check memory cache
        const cached = this.sessions.get(sessionId);
        if (cached) {
            return cached;
        }
        // Try to load from filesystem
        const loaded = await loadSession(sessionId, projectPath);
        if (loaded) {
            this.sessions.set(sessionId, loaded);
            return loaded;
        }
        return null;
    }
    /**
     * Check if session exists.
     */
    exists(sessionId, projectPath) {
        return this.sessions.has(sessionId) || sessionExists(sessionId, projectPath);
    }
    /**
     * Add an entry to a session and persist.
     * This is the core store operation.
     */
    async addEntry(session, storeType, entry) {
        // Add to in-memory state
        session.add(storeType, entry);
        // Persist to filesystem (append-only, routed by session's projectPath)
        appendEntry(session.id, storeType, entry, session.metadata.projectPath);
        // Update metadata
        await saveSessionMetadata(session);
    }
    /**
     * Complete a session and export.
     * Called when nextThoughtNeeded: false
     */
    async completeSession(session) {
        session.markComplete();
        await saveSessionMetadata(session);
        const exportPath = await exportSession(session);
        return exportPath;
    }
    /**
     * Import a session from export data.
     */
    async importFromExport(data) {
        const session = SessionState.fromExport(data);
        // Save to filesystem
        await saveSessionMetadata(session);
        // Save all stores (routed by session's projectPath)
        const projectPath = session.metadata.projectPath;
        for (const [storeType, entries] of Object.entries(session.stores)) {
            for (const entry of entries) {
                appendEntry(session.id, storeType, entry, projectPath);
            }
        }
        // Cache in memory
        this.sessions.set(session.id, session);
        return session;
    }
}
// Singleton instance
let manager = null;
export function getSessionManager() {
    if (!manager) {
        manager = new SessionManager();
    }
    return manager;
}
//# sourceMappingURL=manager.js.map