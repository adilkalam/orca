/**
 * Recording Rewind Handler
 *
 * Triggers a rewind to a specific checkpoint via orca-record CLI.
 * Returns the files restored and cognitive context at that checkpoint.
 *
 * NOTE: This is the ONE handler that triggers a write-side operation
 * by calling orca-record as a child process. The database read
 * for cognitive context is still read-only from our side.
 */
import type { CognitionRequest, HandlerResult } from '../../types.js';
import type { SessionState } from '../../session/state.js';
export declare function handleRecordingRewind(args: CognitionRequest, _session: SessionState): Promise<HandlerResult>;
//# sourceMappingURL=recording-rewind.d.ts.map