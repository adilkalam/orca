/**
 * ORCA Recording Layer - Shared Type Definitions
 *
 * Core data structures for session lifecycle, events, checkpoints,
 * and hook I/O. Matches the SQLite schema in storage/schema.ts.
 */

// ============================================================================
// SESSION STATE MACHINE
// ============================================================================

export enum SessionState {
  IDLE = "IDLE",
  ACTIVE = "ACTIVE",
  ACTIVE_COMMITTED = "ACTIVE_COMMITTED",
  ENDED = "ENDED",
}

export enum SessionEvent {
  TurnStart = "TurnStart",
  TurnEnd = "TurnEnd",
  GitCommit = "GitCommit",
  SessionStart = "SessionStart",
  SessionStop = "SessionStop",
}

// State machine transition actions (Phase 1: only record, no git operations)
export enum TransitionAction {
  Condense = "Condense",
  CondenseIfFilesTouched = "CondenseIfFilesTouched",
  MigrateShadowBranch = "MigrateShadowBranch",
  WarnStaleSession = "WarnStaleSession",
}

// ============================================================================
// SESSION DATA
// ============================================================================

export interface Session {
  id: string;
  started_at: string;
  ended_at: string | null;
  state: SessionState;
  base_commit: string | null;
  worktree_id: string | null;
  shadow_branch: string | null;
  cognition_session_id: string | null;
  git_head: string | null;
  step_count: number;
  token_usage_json: string | null;
  files_touched_json: string | null;
}

// ============================================================================
// CHECKPOINTS
// ============================================================================

export interface Checkpoint {
  id: string;
  session_id: string;
  created_at: string;
  type: "session" | "task";
  shadow_commit: string | null;
  prompt_summary: string | null;
  files_modified_json: string | null;
  files_new_json: string | null;
  files_deleted_json: string | null;
  cognition_snapshot_json: string | null;
  quality_json: string | null;
  tool_use_id: string | null;
  subagent_type: string | null;
  is_incremental: boolean;
  incremental_sequence: number | null;
}

// ============================================================================
// EVENTS
// ============================================================================

export type EventType =
  | "prompt_submit"
  | "stop"
  | "pre_task"
  | "post_task"
  | "post_todo"
  | "session_start"
  | "session_end";

export interface RecordingEvent {
  id?: number;
  session_id: string;
  timestamp: string;
  event_type: EventType;
  hook_input_json: string | null;
  git_head: string | null;
  metadata_json: string | null;
}

// ============================================================================
// TRANSCRIPTS
// ============================================================================

export interface Transcript {
  session_id: string;
  transcript_path: string | null;
  transcript_data: string | null;
  content_hash: string | null;
  redacted: boolean;
}

export interface TranscriptEntry {
  type: "user" | "assistant" | "tool_use" | "tool_result" | "system";
  timestamp?: string;
  content: string;
  tool_name?: string;
  tool_use_id?: string;
  file_path?: string;
  offset: number;
}

// ============================================================================
// CONDENSED
// ============================================================================

export interface Condensed {
  checkpoint_id: string;
  session_id: string;
  commit_hash: string;
  orphan_commit: string | null;
  condensed_at: string;
  metadata_json: string | null;
}

// ============================================================================
// HOOK INPUT (from Claude Code via stdin)
// ============================================================================

export interface HookInput {
  // Common fields
  hook_type?: string;
  session_id?: string;

  // UserPromptSubmit fields
  prompt?: string;
  prompt_content?: string;

  // Tool use fields
  tool_name?: string;
  tool_use_id?: string;
  tool_input?: Record<string, unknown>;
  tool_result?: string;

  // Stop fields
  stop_reason?: string;
  transcript_path?: string;

  // Catch-all for unknown fields
  [key: string]: unknown;
}

// ============================================================================
// REDACTION
// ============================================================================

export interface SecretPattern {
  name: string;
  pattern: RegExp;
  type: string;
}

export interface RedactionResult {
  redacted: string;
  count: number;
  types: string[];
}

// ============================================================================
// GIT STATE
// ============================================================================

export interface GitSnapshot {
  head: string | null;
  status: string[];
  timestamp: string;
}

// ============================================================================
// SESSION STATE FILE (persisted to .git/orca-sessions/)
// ============================================================================

export interface SessionStateFile {
  session_id: string;
  state: SessionState;
  started_at: string;
  base_commit: string | null;
  git_head: string | null;
  step_count: number;
  files_touched: string[];
  last_snapshot: GitSnapshot | null;
  pre_task_snapshots: Record<string, GitSnapshot>;
  shadow_branch: string | null;
}

// ============================================================================
// PHASE 3: CONDENSATION + COMMIT LINKING
// ============================================================================

/**
 * Condensation result from processing a shadow branch into
 * permanent orphan branch storage.
 */
export interface CondensationResult {
  sessionId: string;
  userCommitHash: string;
  orphanCommitHash: string;
  checkpointsCondensed: number;
  shadowBranchDeleted: boolean;
  condensedAt: string;
}

/**
 * Sharded storage entry on the orphan branch.
 * Path: <id[:2]>/<id[2:]>/<filename>
 */
export interface OrphanStorageEntry {
  checkpointId: string;
  shardPath: string;
  files: {
    metadata: string;
    transcript: string | null;
    reasoning: string | null;
    quality: string | null;
    memoryRefs: string | null;
    manifest: string;
  };
}

/**
 * Metadata stored as metadata.json on the orphan branch for each checkpoint.
 */
export interface CondensedMetadata {
  checkpointId: string;
  sessionId: string;
  timestamp: string;
  type: "session" | "task";
  userCommitHash: string;
  shadowCommitHash: string;
  promptSummary: string | null;
  files: {
    modified: string[];
    new: string[];
    deleted: string[];
  };
  trailers: Record<string, string>;
}

/**
 * Result of linking a commit to a checkpoint or vice versa.
 */
export interface LinkResult {
  commitHash: string;
  checkpointId: string;
  sessionId: string;
  source: "trailer" | "condensed" | "git-log";
  metadata: CondensedMetadata | null;
}

/**
 * Session history entry combining commit, checkpoint, and cognitive context.
 */
export interface SessionHistoryEntry {
  commitHash: string;
  commitMessage: string;
  commitTimestamp: string;
  checkpointId: string;
  sessionId: string;
  promptSummary: string | null;
  filesModified: number;
  filesNew: number;
  filesDeleted: number;
}

/**
 * Git hook installation status.
 */
export interface HookInstallResult {
  hookName: string;
  installed: boolean;
  backedUp: boolean;
  backupPath: string | null;
  error: string | null;
}

// ============================================================================
// PHASE 2: GIT-BACKED CHECKPOINTS
// ============================================================================

/**
 * Shadow branch metadata (returned by getShadowBranchInfo).
 */
export interface ShadowBranchMetadata {
  branchName: string;
  commitCount: number;
  latestCheckpointId: string | null;
  sessionId: string | null;
}

/**
 * Checkpoint manifest stored in .orca/sessions/<session-id>/ tree blob.
 * Phase 2: stored in trailers + SQLite. Phase 3: stored in tree.
 */
export interface CheckpointManifest {
  checkpointId: string;
  sessionId: string;
  timestamp: string;
  type: "session" | "task";
  files: {
    modified: string[];
    new: string[];
    deleted: string[];
  };
  // Phase 4 placeholders
  quality: Record<string, unknown> | null;
  memoryRefs: string[] | null;
  cognitiveSessionId: string | null;
}

/**
 * Checkpoint info returned by rewind.listCheckpoints().
 * Combines git commit data with parsed trailer metadata.
 */
export interface CheckpointInfo {
  checkpointId: string;
  sessionId: string;
  commitHash: string;
  timestamp: string;
  type: "session" | "task";
  promptSummary: string | null;
  filesNew: number;
  filesModified: number;
  filesDeleted: number;
  // Phase 4 placeholders
  qualityScore: number | null;
  cognitiveContext: string | null;
  manifest?: unknown | null;
}
