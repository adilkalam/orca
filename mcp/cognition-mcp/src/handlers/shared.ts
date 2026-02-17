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
export function buildResponse(
  content: Record<string, unknown>,
  args: CognitionRequest,
  session: SessionState,
  storeType: keyof SessionStores,
  status: 'stored' | 'exported',
  exportPath?: string | null,
  extra?: Record<string, unknown>,
): HandlerResult {
  const sessionContext = {
    sessionId: session.id,
    entryCount: session.getCount(storeType),
    totalEntries: session.getTotalCount(),
    sessionDuration: session.getDuration(),
    continuation: status === 'exported'
      ? null
      : 'Continue with sessionId: ' + session.id,
  };

  const response = args.verbose
    ? {
        ...content,
        quality: args.quality,
        status,
        sessionContext,
        ...(exportPath ? { exportPath } : {}),
        ...(extra || {}),
      }
    : {
        ok: true,
        ...sessionContext,
        status,
        ...(exportPath ? { exportPath } : {}),
        ...(extra || {}),
      };

  return {
    content: [{
      type: 'text',
      text: JSON.stringify(response),
    }],
  };
}
