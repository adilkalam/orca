/**
 * Recording Compare Handler
 *
 * Diff two checkpoints: code changes, reasoning changes,
 * quality delta, and events between them.
 * READ-ONLY: queries .orca/recording.db written by orca-record.
 */
import type { CognitionRequest, HandlerResult } from '../../types.js';
import type { SessionState } from '../../session/state.js';
export declare function handleRecordingCompare(args: CognitionRequest, _session: SessionState): Promise<HandlerResult>;
//# sourceMappingURL=recording-compare.d.ts.map