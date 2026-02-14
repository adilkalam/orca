/**
 * Recording Database - READ-ONLY SQLite interface
 *
 * Opens .orca/recording.db (written by orca-record).
 * This module ONLY reads. All writes happen in orca-record.
 *
 * Uses better-sqlite3 for Node.js compatibility.
 */
import Database from 'better-sqlite3';
import * as path from 'path';
import { existsSync } from 'fs';
// ============================================================================
// DATABASE DISCOVERY
// ============================================================================
/**
 * Find .orca/recording.db by walking up from a starting directory.
 * Returns the absolute path or null if not found.
 */
function findRecordingDb(startDir) {
    let dir = startDir || process.cwd();
    const root = path.parse(dir).root;
    while (dir !== root) {
        const candidate = path.join(dir, '.orca', 'recording.db');
        if (existsSync(candidate)) {
            return candidate;
        }
        dir = path.dirname(dir);
    }
    return null;
}
// ============================================================================
// DATABASE CONNECTION
// ============================================================================
let cachedDb = null;
let cachedDbPath = null;
/**
 * Open the recording database in READ-ONLY mode.
 * Returns null if no recording.db exists.
 */
export function openRecordingDb(projectPath) {
    const dbPath = findRecordingDb(projectPath);
    if (!dbPath) {
        return null;
    }
    // Reuse cached connection if same path
    if (cachedDb && cachedDbPath === dbPath) {
        return cachedDb;
    }
    // Close previous connection
    if (cachedDb) {
        try {
            cachedDb.close();
        }
        catch { /* ignore */ }
    }
    try {
        cachedDb = new Database(dbPath, { readonly: true });
        cachedDbPath = dbPath;
        return cachedDb;
    }
    catch {
        cachedDb = null;
        cachedDbPath = null;
        return null;
    }
}
/**
 * Get a single session by ID.
 */
export function getSession(db, id) {
    const stmt = db.prepare('SELECT * FROM sessions WHERE id = ?');
    return stmt.get(id) || null;
}
/**
 * Get the currently active session (if any).
 */
export function getActiveSession(db) {
    const stmt = db.prepare("SELECT * FROM sessions WHERE state IN ('ACTIVE', 'ACTIVE_COMMITTED') ORDER BY started_at DESC LIMIT 1");
    return stmt.get() || null;
}
/**
 * List sessions matching optional filters.
 */
export function listSessions(db, filters) {
    let sql = 'SELECT s.*, (SELECT COUNT(*) FROM checkpoints c WHERE c.session_id = s.id) as checkpoint_count FROM sessions s WHERE 1=1';
    const params = [];
    if (filters?.date_from) {
        sql += ' AND s.started_at >= ?';
        params.push(filters.date_from);
    }
    if (filters?.date_to) {
        sql += ' AND s.started_at <= ?';
        params.push(filters.date_to);
    }
    if (filters?.state) {
        sql += ' AND s.state = ?';
        params.push(filters.state);
    }
    if (filters?.min_checkpoints) {
        sql += ' HAVING checkpoint_count >= ?';
        params.push(filters.min_checkpoints);
    }
    sql += ' ORDER BY s.started_at DESC';
    sql += ' LIMIT ?';
    params.push(filters?.limit || 20);
    const stmt = db.prepare(sql);
    const rows = stmt.all(...params);
    let results = rows.map(row => ({
        id: row.id,
        started_at: row.started_at,
        ended_at: row.ended_at,
        state: row.state,
        checkpoint_count: row.checkpoint_count,
        files_touched: parseJsonArray(row.files_touched_json),
        cognition_session_id: row.cognition_session_id,
    }));
    // Post-filter by files if specified (SQLite JSON ops are limited)
    if (filters?.files && filters.files.length > 0) {
        results = results.filter(r => filters.files.some(f => r.files_touched.some(ft => ft.includes(f))));
    }
    return results;
}
/**
 * Get all checkpoints for a session.
 */
export function getCheckpoints(db, sessionId) {
    const stmt = db.prepare('SELECT * FROM checkpoints WHERE session_id = ? ORDER BY created_at ASC');
    return stmt.all(sessionId);
}
/**
 * Get a single checkpoint by ID with full detail.
 */
export function getCheckpoint(db, id) {
    const stmt = db.prepare('SELECT * FROM checkpoints WHERE id = ?');
    const row = stmt.get(id);
    if (!row)
        return null;
    // Check for condensed data
    const condensedStmt = db.prepare('SELECT commit_hash FROM condensed WHERE checkpoint_id = ?');
    const condensed = condensedStmt.get(id);
    return {
        id: row.id,
        session_id: row.session_id,
        created_at: row.created_at,
        type: row.type,
        shadow_commit: row.shadow_commit,
        prompt_summary: row.prompt_summary,
        files_modified: parseJsonArray(row.files_modified_json),
        files_new: parseJsonArray(row.files_new_json),
        files_deleted: parseJsonArray(row.files_deleted_json),
        cognition_snapshot: parseJsonObject(row.cognition_snapshot_json),
        quality: parseJsonObject(row.quality_json),
        tool_use_id: row.tool_use_id,
        subagent_type: row.subagent_type,
        condensed_commit: condensed?.commit_hash || null,
    };
}
/**
 * Get events for a session, optionally filtered by type.
 */
export function getEvents(db, sessionId, eventType) {
    let sql = 'SELECT * FROM events WHERE session_id = ?';
    const params = [sessionId];
    if (eventType) {
        sql += ' AND event_type = ?';
        params.push(eventType);
    }
    sql += ' ORDER BY timestamp ASC';
    const stmt = db.prepare(sql);
    return stmt.all(...params);
}
/**
 * Count events between two timestamps for a session.
 */
export function countEventsBetween(db, sessionId, fromTime, toTime) {
    const stmt = db.prepare('SELECT COUNT(*) as cnt FROM events WHERE session_id = ? AND timestamp >= ? AND timestamp <= ?');
    const row = stmt.get(sessionId, fromTime, toTime);
    return row.cnt;
}
/**
 * Get transcript for a session.
 */
export function getTranscript(db, sessionId) {
    const stmt = db.prepare('SELECT * FROM transcripts WHERE session_id = ?');
    return stmt.get(sessionId) || null;
}
/**
 * Get condensed data for a checkpoint.
 */
export function getCondensed(db, checkpointId) {
    const stmt = db.prepare('SELECT * FROM condensed WHERE checkpoint_id = ?');
    return stmt.get(checkpointId) || null;
}
// ============================================================================
// AGGREGATE STATS
// ============================================================================
/**
 * Get aggregate statistics across all sessions.
 */
export function getSessionStats(db) {
    const sessionsStmt = db.prepare('SELECT COUNT(*) as cnt FROM sessions');
    const totalSessions = sessionsStmt.get().cnt;
    const activeStmt = db.prepare("SELECT COUNT(*) as cnt FROM sessions WHERE state IN ('ACTIVE', 'ACTIVE_COMMITTED')");
    const activeSessions = activeStmt.get().cnt;
    const endedStmt = db.prepare("SELECT COUNT(*) as cnt FROM sessions WHERE state = 'ENDED'");
    const endedSessions = endedStmt.get().cnt;
    const checkpointsStmt = db.prepare('SELECT COUNT(*) as cnt FROM checkpoints');
    const totalCheckpoints = checkpointsStmt.get().cnt;
    const eventsStmt = db.prepare('SELECT COUNT(*) as cnt FROM events');
    const totalEvents = eventsStmt.get().cnt;
    return {
        total_sessions: totalSessions,
        active_sessions: activeSessions,
        ended_sessions: endedSessions,
        total_checkpoints: totalCheckpoints,
        total_events: totalEvents,
        avg_checkpoints_per_session: totalSessions > 0
            ? Math.round((totalCheckpoints / totalSessions) * 100) / 100
            : 0,
    };
}
/**
 * Get quality metrics, optionally scoped to a session.
 */
export function getQualityMetrics(db, sessionId) {
    const params = [];
    let checkpointSql = 'SELECT * FROM checkpoints';
    let eventSql = 'SELECT * FROM events';
    if (sessionId) {
        checkpointSql += ' WHERE session_id = ?';
        eventSql += ' WHERE session_id = ?';
        params.push(sessionId);
    }
    const checkpoints = db.prepare(checkpointSql).all(...params);
    const events = db.prepare(eventSql).all(...params);
    // Count rewinds (events with type containing 'rewind')
    const rewindCount = events.filter(e => e.event_type.toLowerCase().includes('rewind')).length;
    // Count errors
    const errorCount = events.filter(e => e.event_type.toLowerCase().includes('error')).length;
    // Collect quality scores
    const qualityScores = [];
    for (const cp of checkpoints) {
        const quality = parseJsonObject(cp.quality_json);
        if (quality) {
            qualityScores.push({
                checkpoint_id: cp.id,
                created_at: cp.created_at,
                ...quality,
            });
        }
    }
    // Calculate checkpoint frequency (avg time between checkpoints in seconds)
    let avgFrequency = null;
    if (checkpoints.length >= 2) {
        const times = checkpoints.map(cp => new Date(cp.created_at).getTime());
        const deltas = times.slice(1).map((t, i) => t - times[i]);
        avgFrequency = Math.round(deltas.reduce((a, b) => a + b, 0) / deltas.length / 1000);
    }
    // Detect patterns
    const patterns = [];
    if (rewindCount > 0) {
        patterns.push(`${rewindCount} rewind(s) detected`);
    }
    if (errorCount > 0) {
        patterns.push(`${errorCount} error event(s) detected`);
    }
    if (qualityScores.length > 0) {
        patterns.push(`${qualityScores.length} checkpoint(s) with quality data`);
    }
    const sessionCount = sessionId
        ? 1
        : db.prepare('SELECT COUNT(*) as cnt FROM sessions').get().cnt;
    return {
        scope: sessionId ? 'session' : 'aggregate',
        session_id: sessionId,
        total_sessions: sessionCount,
        total_checkpoints: checkpoints.length,
        rewind_count: rewindCount,
        error_events: errorCount,
        checkpoint_frequency: avgFrequency,
        quality_scores: qualityScores,
        patterns,
    };
}
// ============================================================================
// JSON HELPERS
// ============================================================================
function parseJsonArray(json) {
    if (!json)
        return [];
    try {
        const parsed = JSON.parse(json);
        return Array.isArray(parsed) ? parsed : [];
    }
    catch {
        return [];
    }
}
function parseJsonObject(json) {
    if (!json)
        return null;
    try {
        const parsed = JSON.parse(json);
        return typeof parsed === 'object' && parsed !== null ? parsed : null;
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=db.js.map