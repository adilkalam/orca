/**
 * Ulysses Protocol Handler - Accept-Store-Echo Pattern
 *
 * CRITICAL: This handler follows the accept-store-echo pattern exactly.
 * The MCP is a MIRROR. It cannot generate, suggest, enhance, or transform.
 */
import type { CognitionRequest, HandlerResult } from '../../types.js';
import { SessionState } from '../../session/state.js';
export declare function handleUlyssesProtocol(args: CognitionRequest, session: SessionState): Promise<HandlerResult>;
//# sourceMappingURL=ulysses.d.ts.map