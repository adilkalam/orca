/**
 * Recording Query Handler
 *
 * Query recording sessions by date, files, state, checkpoint count.
 * READ-ONLY: queries .orca/recording.db written by orca-record.
 */
import type { CognitionRequest, HandlerResult } from '../../types.js';
import type { SessionState } from '../../session/state.js';
export declare function handleRecordingQuery(args: CognitionRequest, _session: SessionState): Promise<HandlerResult>;
//# sourceMappingURL=recording-query.d.ts.map