/**
 * Recording Explain Handler
 *
 * Generate a human-readable narrative of a recording session:
 * what happened, why, how well, and what was produced.
 * READ-ONLY: queries .orca/recording.db written by orca-record.
 */
import type { CognitionRequest, HandlerResult } from '../../types.js';
import type { SessionState } from '../../session/state.js';
export declare function handleRecordingExplain(args: CognitionRequest, _session: SessionState): Promise<HandlerResult>;
//# sourceMappingURL=recording-explain.d.ts.map