/**
 * Shared Handler Utilities
 *
 * Common response builder for all accept-store-echo handlers.
 * Supports verbose flag: full echo (backward compat) vs minimal ACK.
 *
 * Returns dual content blocks with audience annotations:
 *   Block 1: Full structured JSON for the LLM (assistant-only)
 *   Block 2: Clean human-readable summary for the user
 */

import type { CognitionRequest, HandlerResult, SessionStores } from '../types.js';
import { SessionState } from '../session/state.js';

/**
 * Build a clean one-liner summary for the user audience block.
 */
function buildUserSummary(
  response: Record<string, unknown>,
  args: CognitionRequest,
  storeType: string,
  status: string,
  extra?: Record<string, unknown>,
): string {
  const sessionId = (response as any).sessionId || (response as any).sessionContext?.sessionId || '';
  const shortId = sessionId.slice(0, 8);

  // For checkpoint with protocol state
  if (storeType === 'checkpoints' && extra?.protocolState) {
    const ps = extra.protocolState as any;
    const activeCount = ps.activeConstraints?.filter((c: any) => c.status === 'active').length || 0;
    const gate = ps.gateStatus || 'pending';
    const phase = (response as any).phase || (args.content as any)?.phase || 'unknown';
    const blocked = ps.blocked ? ' [BLOCKED]' : '';
    const phases = ps.phasesCompleted?.length || 0;
    return `Checkpoint: ${phase} | Gate: ${gate} | ${activeCount} active constraints | ${phases} phases${blocked} [${shortId}]`;
  }

  // For auto-persisted harvest
  if (extra?.autoPersist) {
    const ap = extra.autoPersist as any;
    const file = ap.file ? ` -> ${ap.file.split('/').pop()}` : '';
    return `Harvest persisted${file} [${shortId}]`;
  }

  // For exported/completed sessions
  if (status === 'exported') {
    const exportPath = (response as any).exportPath;
    const file = exportPath ? ` -> ${exportPath.split('/').pop()}` : '';
    return `Session exported${file} [${shortId}]`;
  }

  // For errors
  if (status === 'error') {
    const error = (response as any).error || 'unknown error';
    return `Error: ${error}`;
  }

  // Default: operation stored
  const op = args.operation || 'operation';
  const entries = (response as any).totalEntries || (response as any).sessionContext?.totalEntries || 0;
  return `${op} stored (${entries} total) [${shortId}]`;
}

/**
 * Build a dual-block error response with audience annotations.
 */
export function buildErrorResponse(errorResponse: Record<string, unknown>): HandlerResult {
  const error = (errorResponse as any).error || 'unknown error';
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(errorResponse),
        annotations: { audience: ['assistant'], priority: 1.0 },
      },
      {
        type: 'text',
        text: `Error: ${error}`,
        annotations: { audience: ['user'], priority: 0.7 },
      },
    ],
  } as any;
}

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

  // Content block 1: Full structured response for the LLM (assistant-only)
  // Content block 2: Clean human-readable summary for the user
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(response),
        annotations: { audience: ['assistant'], priority: 1.0 },
      },
      {
        type: 'text',
        text: buildUserSummary(response, args, storeType, status, extra),
        annotations: { audience: ['user'], priority: 0.7 },
      },
    ],
  } as any;
}

/**
 * Build a StoredEntry from validated content and args.
 * Centralizes entry construction so tokenEstimate is included automatically.
 */
export function buildEntry<T>(
  content: T,
  args: CognitionRequest,
): { content: T; quality?: import('../types.js').QualityMetrics; timestamp: number; tokenEstimate?: number } {
  return {
    content,
    quality: args.quality,
    timestamp: Date.now(),
    ...(args.tokenEstimate !== undefined ? { tokenEstimate: args.tokenEstimate } : {}),
  };
}
