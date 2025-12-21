/**
 * Mental Model List Handler - Read-Only Operation
 *
 * Returns metadata about available mental model templates.
 * This is a read-only operation that doesn't modify session state.
 */
import type { CognitionRequest, HandlerResult } from '../types.js';
import { SessionState } from '../session/state.js';
export declare function handleListMentalModels(args: CognitionRequest, session: SessionState): Promise<HandlerResult>;
//# sourceMappingURL=mental-model-list.d.ts.map