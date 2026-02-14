/**
 * SQLite Schema Definitions
 *
 * CREATE TABLE statements for the recording database.
 * Location: .orca/recording.db (per-project, gitignored)
 */

export const SCHEMA_VERSION = 1;

export const CREATE_TABLES = `
-- Sessions
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  state TEXT NOT NULL DEFAULT 'IDLE',
  base_commit TEXT,
  worktree_id TEXT,
  shadow_branch TEXT,
  cognition_session_id TEXT,
  git_head TEXT,
  step_count INTEGER DEFAULT 0,
  token_usage_json TEXT,
  files_touched_json TEXT
);

-- Checkpoints (one per agent turn or subagent completion)
CREATE TABLE IF NOT EXISTS checkpoints (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id),
  created_at TEXT NOT NULL,
  type TEXT NOT NULL,
  shadow_commit TEXT,
  prompt_summary TEXT,
  files_modified_json TEXT,
  files_new_json TEXT,
  files_deleted_json TEXT,
  cognition_snapshot_json TEXT,
  quality_json TEXT,
  tool_use_id TEXT,
  subagent_type TEXT,
  is_incremental BOOLEAN DEFAULT FALSE,
  incremental_sequence INTEGER
);

-- Events (all hook events, full recording)
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL REFERENCES sessions(id),
  timestamp TEXT NOT NULL,
  event_type TEXT NOT NULL,
  hook_input_json TEXT,
  git_head TEXT,
  metadata_json TEXT
);

-- Transcripts (full session transcripts, stored separately for size)
CREATE TABLE IF NOT EXISTS transcripts (
  session_id TEXT PRIMARY KEY REFERENCES sessions(id),
  transcript_path TEXT,
  transcript_data TEXT,
  content_hash TEXT,
  redacted BOOLEAN DEFAULT TRUE
);

-- Condensed checkpoints (after git commit, permanent)
CREATE TABLE IF NOT EXISTS condensed (
  checkpoint_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  commit_hash TEXT NOT NULL,
  orphan_commit TEXT,
  condensed_at TEXT NOT NULL,
  metadata_json TEXT
);

-- Schema version tracking
CREATE TABLE IF NOT EXISTS schema_version (
  version INTEGER PRIMARY KEY,
  applied_at TEXT NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sessions_state ON sessions(state);
CREATE INDEX IF NOT EXISTS idx_checkpoints_session ON checkpoints(session_id);
CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_condensed_commit ON condensed(commit_hash);
`;

export const MIGRATIONS: Record<number, string> = {
  1: CREATE_TABLES,
};
