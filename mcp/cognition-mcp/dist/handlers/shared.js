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
/**
 * Build a clean one-liner summary for the user audience block.
 */
function buildUserSummary(response, args, storeType, status, extra) {
    const sessionId = response.sessionId || response.sessionContext?.sessionId || '';
    const shortId = sessionId.slice(0, 8);
    // For checkpoint with protocol state
    if (storeType === 'checkpoints' && extra?.protocolState) {
        const ps = extra.protocolState;
        const activeCount = ps.activeConstraints?.filter((c) => c.status === 'active').length || 0;
        const gate = ps.gateStatus || 'pending';
        const phase = response.phase || args.content?.phase || 'unknown';
        const blocked = ps.blocked ? ' [BLOCKED]' : '';
        const phases = ps.phasesCompleted?.length || 0;
        return `Checkpoint: ${phase} | Gate: ${gate} | ${activeCount} active constraints | ${phases} phases${blocked} [${shortId}]`;
    }
    // For auto-persisted harvest
    if (extra?.autoPersist) {
        const ap = extra.autoPersist;
        const file = ap.file ? ` -> ${ap.file.split('/').pop()}` : '';
        return `Harvest persisted${file} [${shortId}]`;
    }
    // For exported/completed sessions
    if (status === 'exported') {
        const exportPath = response.exportPath;
        const file = exportPath ? ` -> ${exportPath.split('/').pop()}` : '';
        return `Session exported${file} [${shortId}]`;
    }
    // For errors
    if (status === 'error') {
        const error = response.error || 'unknown error';
        return `Error: ${error}`;
    }
    // Default: operation stored
    const op = args.operation || 'operation';
    const entries = response.totalEntries || response.sessionContext?.totalEntries || 0;
    return `${op} stored (${entries} total) [${shortId}]`;
}
/**
 * Build a dual-block error response with audience annotations.
 */
export function buildErrorResponse(errorResponse) {
    const error = errorResponse.error || 'unknown error';
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
    };
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
export function buildResponse(content, args, session, storeType, status, exportPath, extra) {
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
    };
}
//# sourceMappingURL=shared.js.map