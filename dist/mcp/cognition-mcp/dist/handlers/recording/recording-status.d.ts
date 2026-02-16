/**
 * Recording Status Handler
 *
 * Returns current recording state: active session, shadow branch,
 * checkpoint count, files touched, duration.
 * READ-ONLY: queries .orca/recording.db written by orca-record.
 */
import type { CognitionRequest, HandlerResult } from '../../types.js';
import type { SessionState } from '../../session/state.js';
export declare function handleRecordingStatus(args: CognitionRequest, _session: SessionState): Promise<HandlerResult>;
//# sourceMappingURL=recording-status.d.ts.map