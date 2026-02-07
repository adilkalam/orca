/**
 * SessionManager - Create, load, and manage sessions
 *
 * Handles session lifecycle: create, load, persist, complete.
 * Supports per-project storage via projectPath parameter.
 */

import { randomUUID } from 'crypto';
import { SessionState } from './state.js';
import {
  ensureDirectories,
  loadSession,
  saveSessionMetadata,
  appendEntry,
  exportSession,
  sessionExists,
} from './persistence.js';
import type { SessionStores, StoredEntry, SessionExport } from '../types.js';

export class SessionManager {
  private sessions: Map<string, SessionState> = new Map();

  constructor() {
    ensureDirectories();
  }

  /**
   * Get or create a session.
   * If sessionId is provided, load existing session.
   * If not, create new session.
   * projectPath routes storage to {project}/.claude/.cognition/
   */
  async getOrCreate(
    sessionId?: string,
    title?: string,
    tags?: string[],
    projectPath?: string
  ): Promise<SessionState> {
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
  async get(sessionId: string, projectPath?: string): Promise<SessionState | null> {
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
  exists(sessionId: string, projectPath?: string): boolean {
    return this.sessions.has(sessionId) || sessionExists(sessionId, projectPath);
  }

  /**
   * Add an entry to a session and persist.
   * This is the core store operation.
   */
  async addEntry(
    session: SessionState,
    storeType: keyof SessionStores,
    entry: StoredEntry<unknown>
  ): Promise<void> {
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
  async completeSession(session: SessionState): Promise<string> {
    session.markComplete();
    await saveSessionMetadata(session);

    const exportPath = await exportSession(session);
    return exportPath;
  }

  /**
   * Import a session from export data.
   */
  async importFromExport(data: SessionExport): Promise<SessionState> {
    const session = SessionState.fromExport(data);

    // Save to filesystem
    await saveSessionMetadata(session);

    // Save all stores (routed by session's projectPath)
    const projectPath = session.metadata.projectPath;
    for (const [storeType, entries] of Object.entries(session.stores)) {
      for (const entry of entries) {
        appendEntry(session.id, storeType as keyof SessionStores, entry, projectPath);
      }
    }

    // Cache in memory
    this.sessions.set(session.id, session);

    return session;
  }
}

// Singleton instance
let manager: SessionManager | null = null;

export function getSessionManager(): SessionManager {
  if (!manager) {
    manager = new SessionManager();
  }
  return manager;
}
