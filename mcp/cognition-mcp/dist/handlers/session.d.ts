/**
 * Session Handlers - Info, Export, Import
 *
 * These handlers manage session lifecycle.
 * They return session data, they do not generate content.
 */
import type { CognitionRequest, HandlerResult } from '../types.js';
import { SessionState } from '../session/state.js';
/**
 * Session Info - Returns current session state
 */
export declare function handleSessionInfo(_args: CognitionRequest, session: SessionState): Promise<HandlerResult>;
/**
 * Session Export - Exports complete session to file and returns data
 */
export declare function handleSessionExport(_args: CognitionRequest, session: SessionState): Promise<HandlerResult>;
/**
 * Session Import - Imports session from export data
 */
export declare function handleSessionImport(args: CognitionRequest, _session: SessionState): Promise<HandlerResult>;
//# sourceMappingURL=session.d.ts.map