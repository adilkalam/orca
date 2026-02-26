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
import type {
  RecordingSessionState,
  SessionQueryFilter,
  SessionQueryResult,
  CheckpointDetail,
  QualityReport,
} from './types.js';

// ============================================================================
// DATABASE DISCOVERY
// ============================================================================

/**
 * Find .orca/recording.db by walking up from a starting directory.
 * Returns the absolute path or null if not found.
 */
function findRecordingDb(startDir?: string): string | null {
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

let cachedDb: Database.Database | null = null;
let cachedDbPath: string | null = null;

/**
 * Open the recording database in READ-ONLY mode.
 * Returns null if no recording.db exists.
 */
export function openRecordingDb(projectPath?: string): Database.Database | null {
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
    try { cachedDb.close(); } catch { /* ignore */ }
  }

  try {
    cachedDb = new Database(dbPath, { readonly: true });
    cachedDbPath = dbPath;
    return cachedDb;
  } catch {
    cachedDb = null;
    cachedDbPath = null;
    return null;
  }
}

// ============================================================================
// SESSION QUERIES
// ============================================================================

interface SessionRow {
  id: string;
  started_at: string;
  ended_at: string | null;
  state: string;
  shadow_branch: string | null;
  cognition_session_id: string | null;
  step_count: number;
  files_touched_json: string | null;
}

/**
 * Get a single session by ID.
 */
export function getSession(db: Database.Database, id: string): SessionRow | null {
  const stmt = db.prepare('SELECT * FROM sessions WHERE id = ?');
  return (stmt.get(id) as SessionRow) || null;
}

/**
 * Get the currently active session (if any).
 */
export function getActiveSession(db: Database.Database): SessionRow | null {
  const stmt = db.prepare(
    "SELECT * FROM sessions WHERE state IN ('ACTIVE', 'ACTIVE_COMMITTED') ORDER BY started_at DESC LIMIT 1"
  );
  return (stmt.get() as SessionRow) || null;
}

/**
 * List sessions matching optional filters.
 */
export function listSessions(
  db: Database.Database,
  filters?: SessionQueryFilter
): SessionQueryResult[] {
  let sql = 'SELECT s.*, (SELECT COUNT(*) FROM checkpoints c WHERE c.session_id = s.id) as checkpoint_count FROM sessions s WHERE 1=1';
  const params: unknown[] = [];

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
  const rows = stmt.all(...params) as Array<SessionRow & { checkpoint_count: number }>;

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
    results = results.filter(r =>
      filters.files!.some(f => r.files_touched.some(ft => ft.includes(f)))
    );
  }

  return results;
}

// ============================================================================
// CHECKPOINT QUERIES
// ============================================================================

interface CheckpointRow {
  id: string;
  session_id: string;
  created_at: string;
  type: string;
  shadow_commit: string | null;
  prompt_summary: string | null;
  files_modified_json: string | null;
  files_new_json: string | null;
  files_deleted_json: string | null;
  cognition_snapshot_json: string | null;
  quality_json: string | null;
  tool_use_id: string | null;
  subagent_type: string | null;
}

/**
 * Get all checkpoints for a session.
 */
export function getCheckpoints(db: Database.Database, sessionId: string): CheckpointRow[] {
  const stmt = db.prepare(
    'SELECT * FROM checkpoints WHERE session_id = ? ORDER BY created_at ASC'
  );
  return stmt.all(sessionId) as CheckpointRow[];
}

/**
 * Get a single checkpoint by ID with full detail.
 */
export function getCheckpoint(db: Database.Database, id: string): CheckpointDetail | null {
  const stmt = db.prepare('SELECT * FROM checkpoints WHERE id = ?');
  const row = stmt.get(id) as CheckpointRow | undefined;
  if (!row) return null;

  // Check for condensed data
  const condensedStmt = db.prepare('SELECT commit_hash FROM condensed WHERE checkpoint_id = ?');
  const condensed = condensedStmt.get(id) as { commit_hash: string } | undefined;

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

// ============================================================================
// EVENT QUERIES
// ============================================================================

interface EventRow {
  id: number;
  session_id: string;
  timestamp: string;
  event_type: string;
  hook_input_json: string | null;
  git_head: string | null;
  metadata_json: string | null;
}

/**
 * Get events for a session, optionally filtered by type.
 */
export function getEvents(
  db: Database.Database,
  sessionId: string,
  eventType?: string
): EventRow[] {
  let sql = 'SELECT * FROM events WHERE session_id = ?';
  const params: unknown[] = [sessionId];

  if (eventType) {
    sql += ' AND event_type = ?';
    params.push(eventType);
  }

  sql += ' ORDER BY timestamp ASC';

  const stmt = db.prepare(sql);
  return stmt.all(...params) as EventRow[];
}

/**
 * Count events between two timestamps for a session.
 */
export function countEventsBetween(
  db: Database.Database,
  sessionId: string,
  fromTime: string,
  toTime: string
): number {
  const stmt = db.prepare(
    'SELECT COUNT(*) as cnt FROM events WHERE session_id = ? AND timestamp >= ? AND timestamp <= ?'
  );
  const row = stmt.get(sessionId, fromTime, toTime) as { cnt: number };
  return row.cnt;
}

// ============================================================================
// TRANSCRIPT QUERIES
// ============================================================================

interface TranscriptRow {
  session_id: string;
  transcript_path: string | null;
  transcript_data: string | null;
  content_hash: string | null;
  redacted: number;
}

/**
 * Get transcript for a session.
 */
export function getTranscript(db: Database.Database, sessionId: string): TranscriptRow | null {
  const stmt = db.prepare('SELECT * FROM transcripts WHERE session_id = ?');
  return (stmt.get(sessionId) as TranscriptRow) || null;
}

// ============================================================================
// CONDENSED QUERIES
// ============================================================================

interface CondensedRow {
  checkpoint_id: string;
  session_id: string;
  commit_hash: string;
  orphan_commit: string | null;
  condensed_at: string;
  metadata_json: string | null;
}

/**
 * Get condensed data for a checkpoint.
 */
export function getCondensed(db: Database.Database, checkpointId: string): CondensedRow | null {
  const stmt = db.prepare('SELECT * FROM condensed WHERE checkpoint_id = ?');
  return (stmt.get(checkpointId) as CondensedRow) || null;
}

// ============================================================================
// AGGREGATE STATS
// ============================================================================

/**
 * Get aggregate statistics across all sessions.
 */
export function getSessionStats(db: Database.Database): {
  total_sessions: number;
  active_sessions: number;
  ended_sessions: number;
  total_checkpoints: number;
  total_events: number;
  avg_checkpoints_per_session: number;
} {
  const sessionsStmt = db.prepare('SELECT COUNT(*) as cnt FROM sessions');
  const totalSessions = (sessionsStmt.get() as { cnt: number }).cnt;

  const activeStmt = db.prepare(
    "SELECT COUNT(*) as cnt FROM sessions WHERE state IN ('ACTIVE', 'ACTIVE_COMMITTED')"
  );
  const activeSessions = (activeStmt.get() as { cnt: number }).cnt;

  const endedStmt = db.prepare("SELECT COUNT(*) as cnt FROM sessions WHERE state = 'ENDED'");
  const endedSessions = (endedStmt.get() as { cnt: number }).cnt;

  const checkpointsStmt = db.prepare('SELECT COUNT(*) as cnt FROM checkpoints');
  const totalCheckpoints = (checkpointsStmt.get() as { cnt: number }).cnt;

  const eventsStmt = db.prepare('SELECT COUNT(*) as cnt FROM events');
  const totalEvents = (eventsStmt.get() as { cnt: number }).cnt;

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
export function getQualityMetrics(
  db: Database.Database,
  sessionId?: string
): QualityReport {
  const params: unknown[] = [];
  let checkpointSql = 'SELECT * FROM checkpoints';
  let eventSql = 'SELECT * FROM events';

  if (sessionId) {
    checkpointSql += ' WHERE session_id = ?';
    eventSql += ' WHERE session_id = ?';
    params.push(sessionId);
  }

  const checkpoints = db.prepare(checkpointSql).all(...params) as CheckpointRow[];
  const events = db.prepare(eventSql).all(...params) as EventRow[];

  // Count rewinds (events with type containing 'rewind')
  const rewindCount = events.filter(e =>
    e.event_type.toLowerCase().includes('rewind')
  ).length;

  // Count errors
  const errorCount = events.filter(e =>
    e.event_type.toLowerCase().includes('error')
  ).length;

  // Collect quality scores
  const qualityScores: Record<string, unknown>[] = [];
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
  let avgFrequency: number | null = null;
  if (checkpoints.length >= 2) {
    const times = checkpoints.map(cp => new Date(cp.created_at).getTime());
    const deltas = times.slice(1).map((t, i) => t - times[i]);
    avgFrequency = Math.round(deltas.reduce((a, b) => a + b, 0) / deltas.length / 1000);
  }

  // Detect patterns
  const patterns: string[] = [];
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
    : (db.prepare('SELECT COUNT(*) as cnt FROM sessions').get() as { cnt: number }).cnt;

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

function parseJsonArray(json: string | null): string[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseJsonObject(json: string | null): Record<string, unknown> | null {
  if (!json) return null;
  try {
    const parsed = JSON.parse(json);
    return typeof parsed === 'object' && parsed !== null ? parsed : null;
  } catch {
    return null;
  }
}
