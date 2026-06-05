/**
 * Recording Database - READ-ONLY SQLite interface
 *
 * Opens .orca/recording.db (written by orca-record).
 * This module ONLY reads. All writes happen in orca-record.
 *
 * Uses better-sqlite3 for Node.js compatibility.
 */
import Database from 'better-sqlite3';
import type { SessionQueryFilter, SessionQueryResult, CheckpointDetail, QualityReport } from './types.js';
/**
 * Open the recording database in READ-ONLY mode.
 * Returns null if no recording.db exists.
 */
export declare function openRecordingDb(projectPath?: string): Database.Database | null;
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
export declare function getSession(db: Database.Database, id: string): SessionRow | null;
/**
 * Get the currently active session (if any).
 */
export declare function getActiveSession(db: Database.Database): SessionRow | null;
/**
 * List sessions matching optional filters.
 */
export declare function listSessions(db: Database.Database, filters?: SessionQueryFilter): SessionQueryResult[];
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
export declare function getCheckpoints(db: Database.Database, sessionId: string): CheckpointRow[];
/**
 * Get a single checkpoint by ID with full detail.
 */
export declare function getCheckpoint(db: Database.Database, id: string): CheckpointDetail | null;
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
export declare function getEvents(db: Database.Database, sessionId: string, eventType?: string): EventRow[];
/**
 * Count events between two timestamps for a session.
 */
export declare function countEventsBetween(db: Database.Database, sessionId: string, fromTime: string, toTime: string): number;
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
export declare function getTranscript(db: Database.Database, sessionId: string): TranscriptRow | null;
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
export declare function getCondensed(db: Database.Database, checkpointId: string): CondensedRow | null;
/**
 * Get aggregate statistics across all sessions.
 */
export declare function getSessionStats(db: Database.Database): {
    total_sessions: number;
    active_sessions: number;
    ended_sessions: number;
    total_checkpoints: number;
    total_events: number;
    avg_checkpoints_per_session: number;
};
/**
 * Get quality metrics, optionally scoped to a session.
 */
export declare function getQualityMetrics(db: Database.Database, sessionId?: string): QualityReport;
export {};
//# sourceMappingURL=db.d.ts.map