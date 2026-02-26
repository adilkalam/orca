/**
 * Recording Quality Handler
 *
 * Session quality analytics: gate results, rewind frequency,
 * error patterns, checkpoint frequency, cross-session patterns.
 * READ-ONLY: queries .orca/recording.db written by orca-record.
 */
import type { CognitionRequest, HandlerResult } from '../../types.js';
import type { SessionState } from '../../session/state.js';
export declare function handleRecordingQuality(args: CognitionRequest, _session: SessionState): Promise<HandlerResult>;
//# sourceMappingURL=recording-quality.d.ts.map