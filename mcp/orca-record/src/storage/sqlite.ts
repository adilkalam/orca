/**
 * Recording Database Operations
 *
 * SQLite database for session recording data.
 * Uses bun:sqlite (Bun's built-in SQLite driver) for synchronous, fast access.
 * Location: .orca/recording.db in the project root.
 */

import { Database } from "bun:sqlite";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import { SCHEMA_VERSION, MIGRATIONS } from "./schema.js";
import type {
  Session,
  Checkpoint,
  RecordingEvent,
  Transcript,
  Condensed,
} from "../types.js";

let dbInstance: Database | null = null;

/**
 * Initialize the recording database. Creates .orca/ directory and
 * runs migrations if needed.
 */
export function initDb(projectPath: string): Database {
  if (dbInstance) return dbInstance;

  const orcaDir = join(projectPath, ".orca");
  if (!existsSync(orcaDir)) {
    mkdirSync(orcaDir, { recursive: true });
  }

  const dbPath = join(orcaDir, "recording.db");
  const db = new Database(dbPath, { create: true });

  // WAL mode for better concurrent read performance
  db.exec("PRAGMA journal_mode = WAL");
  db.exec("PRAGMA busy_timeout = 5000");
  db.exec("PRAGMA foreign_keys = ON");

  // Run migrations
  runMigrations(db);

  dbInstance = db;
  return db;
}

/**
 * Run pending migrations.
 */
function runMigrations(db: Database): void {
  // Ensure schema_version table exists first
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL
    );
  `);

  const row = db.query("SELECT MAX(version) as v FROM schema_version").get() as
    | { v: number | null }
    | null;

  const version = row?.v ?? 0;

  for (let v = version + 1; v <= SCHEMA_VERSION; v++) {
    const migration = MIGRATIONS[v];
    if (migration) {
      db.exec(migration);
      db.run(
        "INSERT INTO schema_version (version, applied_at) VALUES (?, ?)",
        [v, new Date().toISOString()]
      );
    }
  }
}

/**
 * Get the database instance. Throws if not initialized.
 */
export function getDb(): Database {
  if (!dbInstance) {
    throw new Error("Database not initialized. Call initDb() first.");
  }
  return dbInstance;
}

/**
 * Close the database connection.
 */
export function closeDb(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

// ============================================================================
// SESSION OPERATIONS
// ============================================================================

export function createSession(session: Session): void {
  const db = getDb();
  db.run(
    `INSERT INTO sessions (
      id, started_at, ended_at, state, base_commit, worktree_id,
      shadow_branch, cognition_session_id, git_head, step_count,
      token_usage_json, files_touched_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      session.id,
      session.started_at,
      session.ended_at,
      session.state,
      session.base_commit,
      session.worktree_id,
      session.shadow_branch,
      session.cognition_session_id,
      session.git_head,
      session.step_count,
      session.token_usage_json,
      session.files_touched_json,
    ]
  );
}

export function updateSession(
  id: string,
  fields: Partial<Omit<Session, "id">>
): void {
  const db = getDb();
  const setClauses: string[] = [];
  const values: unknown[] = [];

  for (const [key, value] of Object.entries(fields)) {
    setClauses.push(`${key} = ?`);
    values.push(value);
  }

  if (setClauses.length === 0) return;

  values.push(id);
  db.run(
    `UPDATE sessions SET ${setClauses.join(", ")} WHERE id = ?`,
    values
  );
}

export function getSession(id: string): Session | null {
  const db = getDb();
  return (
    (db.query("SELECT * FROM sessions WHERE id = ?").get(id) as Session) ??
    null
  );
}

export function getActiveSession(): Session | null {
  const db = getDb();
  return (
    (db
      .query(
        "SELECT * FROM sessions WHERE state IN ('ACTIVE', 'ACTIVE_COMMITTED') ORDER BY started_at DESC LIMIT 1"
      )
      .get() as Session) ?? null
  );
}

// ============================================================================
// CHECKPOINT OPERATIONS
// ============================================================================

export function createCheckpoint(checkpoint: Checkpoint): void {
  const db = getDb();
  db.run(
    `INSERT INTO checkpoints (
      id, session_id, created_at, type, shadow_commit, prompt_summary,
      files_modified_json, files_new_json, files_deleted_json,
      cognition_snapshot_json, quality_json, tool_use_id, subagent_type,
      is_incremental, incremental_sequence
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      checkpoint.id,
      checkpoint.session_id,
      checkpoint.created_at,
      checkpoint.type,
      checkpoint.shadow_commit,
      checkpoint.prompt_summary,
      checkpoint.files_modified_json,
      checkpoint.files_new_json,
      checkpoint.files_deleted_json,
      checkpoint.cognition_snapshot_json,
      checkpoint.quality_json,
      checkpoint.tool_use_id,
      checkpoint.subagent_type,
      checkpoint.is_incremental ? 1 : 0,
      checkpoint.incremental_sequence,
    ]
  );
}

export function getCheckpoint(id: string): Checkpoint | null {
  const db = getDb();
  return (
    (db.query("SELECT * FROM checkpoints WHERE id = ?").get(id) as Checkpoint) ??
    null
  );
}

export function updateCheckpoint(
  id: string,
  fields: Partial<Omit<Checkpoint, "id">>
): void {
  const db = getDb();
  const setClauses: string[] = [];
  const values: unknown[] = [];

  for (const [key, value] of Object.entries(fields)) {
    setClauses.push(`${key} = ?`);
    values.push(value);
  }

  if (setClauses.length === 0) return;

  values.push(id);
  db.run(
    `UPDATE checkpoints SET ${setClauses.join(", ")} WHERE id = ?`,
    values
  );
}

export function getCheckpoints(sessionId: string): Checkpoint[] {
  const db = getDb();
  return db
    .query(
      "SELECT * FROM checkpoints WHERE session_id = ? ORDER BY created_at ASC"
    )
    .all(sessionId) as Checkpoint[];
}

// ============================================================================
// EVENT OPERATIONS
// ============================================================================

export function insertEvent(event: RecordingEvent): void {
  const db = getDb();
  db.run(
    `INSERT INTO events (session_id, timestamp, event_type, hook_input_json, git_head, metadata_json)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [
      event.session_id,
      event.timestamp,
      event.event_type,
      event.hook_input_json,
      event.git_head,
      event.metadata_json,
    ]
  );
}

export function getEvents(sessionId: string): RecordingEvent[] {
  const db = getDb();
  return db
    .query(
      "SELECT * FROM events WHERE session_id = ? ORDER BY timestamp ASC"
    )
    .all(sessionId) as RecordingEvent[];
}

// ============================================================================
// TRANSCRIPT OPERATIONS
// ============================================================================

export function saveTranscript(
  sessionId: string,
  data: { path?: string; data?: string; hash?: string }
): void {
  const db = getDb();
  db.run(
    `INSERT OR REPLACE INTO transcripts (session_id, transcript_path, transcript_data, content_hash, redacted)
    VALUES (?, ?, ?, ?, 1)`,
    [sessionId, data.path ?? null, data.data ?? null, data.hash ?? null]
  );
}

export function getTranscript(sessionId: string): Transcript | null {
  const db = getDb();
  return (
    (db
      .query("SELECT * FROM transcripts WHERE session_id = ?")
      .get(sessionId) as Transcript) ?? null
  );
}

// ============================================================================
// CONDENSED OPERATIONS
// ============================================================================

export function insertCondensed(condensed: Condensed): void {
  const db = getDb();
  db.run(
    `INSERT OR REPLACE INTO condensed (
      checkpoint_id, session_id, commit_hash, orphan_commit, condensed_at, metadata_json
    ) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      condensed.checkpoint_id,
      condensed.session_id,
      condensed.commit_hash,
      condensed.orphan_commit,
      condensed.condensed_at,
      condensed.metadata_json,
    ]
  );
}

export function getCondensedByCheckpoint(checkpointId: string): Condensed | null {
  const db = getDb();
  return (
    (db
      .query("SELECT * FROM condensed WHERE checkpoint_id = ?")
      .get(checkpointId) as Condensed) ?? null
  );
}

export function getCondensedByCommit(commitHash: string): Condensed[] {
  const db = getDb();
  return db
    .query("SELECT * FROM condensed WHERE commit_hash = ?")
    .all(commitHash) as Condensed[];
}

export function getCondensedBySession(sessionId: string): Condensed[] {
  const db = getDb();
  return db
    .query(
      "SELECT * FROM condensed WHERE session_id = ? ORDER BY condensed_at ASC"
    )
    .all(sessionId) as Condensed[];
}

export function hasSessionFilesTouched(sessionId: string): boolean {
  const db = getDb();
  const row = db
    .query(
      `SELECT COUNT(*) as cnt FROM checkpoints
       WHERE session_id = ?
       AND (files_modified_json IS NOT NULL OR files_new_json IS NOT NULL OR files_deleted_json IS NOT NULL)`
    )
    .get(sessionId) as { cnt: number } | null;
  return (row?.cnt ?? 0) > 0;
}
