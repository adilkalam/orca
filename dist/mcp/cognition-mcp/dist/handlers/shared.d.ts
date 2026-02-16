/**
 * Shared Handler Utilities
 *
 * Common response builder for all accept-store-echo handlers.
 * Supports verbose flag: full echo (backward compat) vs minimal ACK.
 */
import type { CognitionRequest, HandlerResult, SessionStores } from '../types.js';
import { SessionState } from '../session/state.js';
/**
 * Build the MCP response based on verbose flag.
 *
 * When verbose: true  -> full echo (backward compat, content + quality + status + context)
 * When verbose: false -> minimal ACK (ok + status + context only)
 */
export declare function buildResponse(content: Record<string, unknown>, args: CognitionRequest, session: SessionState, storeType: keyof SessionStores, status: 'stored' | 'exported', exportPath?: string | null): HandlerResult;
//# sourceMappingURL=shared.d.ts.map