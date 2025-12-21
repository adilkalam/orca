/**
 * Thought Handler - Accept-Store-Echo Pattern
 *
 * CRITICAL: This handler follows the accept-store-echo pattern exactly.
 * 1. VALIDATE structure (not content)
 * 2. STORE unchanged
 * 3. PERSIST to filesystem
 * 4. ECHO unchanged + context
 *
 * The MCP is a MIRROR. It cannot generate, suggest, enhance, or transform.
 */
import type { CognitionRequest, HandlerResult } from '../types.js';
import { SessionState } from '../session/state.js';
export declare function handleThought(args: CognitionRequest, session: SessionState): Promise<HandlerResult>;
//# sourceMappingURL=thought.d.ts.map