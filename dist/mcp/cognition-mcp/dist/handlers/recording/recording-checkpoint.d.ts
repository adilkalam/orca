/**
 * Recording Checkpoint Handler
 *
 * Get full checkpoint detail including code state, cognitive state,
 * quality, timing, and condensed commit reference.
 * READ-ONLY: queries .orca/recording.db written by orca-record.
 */
import type { CognitionRequest, HandlerResult } from '../../types.js';
import type { SessionState } from '../../session/state.js';
export declare function handleRecordingCheckpoint(args: CognitionRequest, _session: SessionState): Promise<HandlerResult>;
//# sourceMappingURL=recording-checkpoint.d.ts.map