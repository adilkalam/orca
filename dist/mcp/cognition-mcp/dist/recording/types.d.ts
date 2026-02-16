/**
 * Recording-specific types for cognition-mcp.
 *
 * These mirror the orca-record SQLite schema but are typed
 * for READ-ONLY access from cognition-mcp.
 */
export type RecordingSessionState = 'IDLE' | 'ACTIVE' | 'ACTIVE_COMMITTED' | 'ENDED';
export interface RecordingStatus {
    hasRecordingDb: boolean;
    activeSessionId: string | null;
    state: RecordingSessionState | null;
    shadowBranch: string | null;
    checkpointCount: number;
    filesTouchedCount: number;
    duration: number | null;
    cognitionSessionId: string | null;
}
export interface SessionQueryFilter {
    date_from?: string;
    date_to?: string;
    files?: string[];
    min_checkpoints?: number;
    state?: RecordingSessionState;
    limit?: number;
}
export interface SessionQueryResult {
    id: string;
    started_at: string;
    ended_at: string | null;
    state: string;
    checkpoint_count: number;
    files_touched: string[];
    cognition_session_id: string | null;
}
export interface CheckpointDetail {
    id: string;
    session_id: string;
    created_at: string;
    type: string;
    shadow_commit: string | null;
    prompt_summary: string | null;
    files_modified: string[];
    files_new: string[];
    files_deleted: string[];
    cognition_snapshot: Record<string, unknown> | null;
    quality: Record<string, unknown> | null;
    tool_use_id: string | null;
    subagent_type: string | null;
    condensed_commit: string | null;
}
export interface CheckpointComparison {
    checkpoint_a: {
        id: string;
        created_at: string;
    };
    checkpoint_b: {
        id: string;
        created_at: string;
    };
    code_diff: {
        files_added: string[];
        files_removed: string[];
        files_changed: string[];
    };
    reasoning_diff: {
        new_thoughts: number;
        new_decisions: number;
        new_constraints: number;
    };
    quality_delta: {
        a_quality: Record<string, unknown> | null;
        b_quality: Record<string, unknown> | null;
    };
    events_between: number;
}
export interface QualityReport {
    scope: 'session' | 'aggregate';
    session_id?: string;
    total_sessions: number;
    total_checkpoints: number;
    rewind_count: number;
    error_events: number;
    checkpoint_frequency: number | null;
    quality_scores: Record<string, unknown>[];
    patterns: string[];
}
export interface SessionNarrative {
    session_id: string;
    summary: string;
    timeline: string[];
    quality_note: string;
    commit_info: string | null;
}
export interface RewindResult {
    success: boolean;
    checkpoint_id: string;
    files_restored: string[];
    cognitive_context: string | null;
    message: string;
}
//# sourceMappingURL=types.d.ts.map