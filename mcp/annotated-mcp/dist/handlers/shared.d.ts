/**
 * Shared Handler Utilities
 *
 * Common response builder for all accept-store-echo handlers.
 * Supports verbose flag: full echo (backward compat) vs minimal ACK.
 *
 * Annotated variant: returns dual content blocks with audience annotations.
 */
import type { CognitionRequest, HandlerResult, SessionStores } from '../types.js';
import { SessionState } from '../session/state.js';
/**
 * Build a dual-block error response with audience annotations.
 */
export declare function buildErrorResponse(errorResponse: Record<string, unknown>): HandlerResult;
/**
 * Build the MCP response based on verbose flag.
 *
 * When verbose: true  -> full echo (backward compat, content + quality + status + context)
 * When verbose: false -> minimal ACK (ok + status + context only)
 *
 * Returns dual content blocks with audience annotations:
 *   Block 1: Full structured JSON for the LLM (assistant-only)
 *   Block 2: Clean human-readable summary for the user
 */
export declare function buildResponse(content: Record<string, unknown>, args: CognitionRequest, session: SessionState, storeType: keyof SessionStores, status: 'stored' | 'exported', exportPath?: string | null, extra?: Record<string, unknown>): HandlerResult;
//# sourceMappingURL=shared.d.ts.map