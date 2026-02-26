/**
 * Checkpoint Handler - Accept-Store-Echo Pattern + Protocol State Management
 *
 * Core pattern: accept-store-echo (unchanged content always stored).
 * Enhancement: When protocol fields are present, MCP manages constraint state,
 * evaluates gates, and auto-persists at harvest. This is FREE computation
 * (runs in MCP process, not in context window).
 *
 * Note: Checkpoints do not have nextThoughtNeeded - they are state saves mid-chain.
 */
import type { CognitionRequest, HandlerResult } from '../../types.js';
import { SessionState } from '../../session/state.js';
export declare function handleCheckpoint(args: CognitionRequest, session: SessionState): Promise<HandlerResult>;
//# sourceMappingURL=checkpoint.d.ts.map