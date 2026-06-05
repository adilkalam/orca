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
import { renderEntryContent, STORE_LABELS } from './core/harvest-renderer.js';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
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
    // Persist individual round file to session folder (non-checkpoint operations only)
    persistRoundFile(session, storeType, content, args.operation || storeType);
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
/**
 * Persist a round file to the session folder.
 * Called after buildResponse for non-checkpoint operations.
 * Failures are silently caught -- round file writes must not crash operations.
 */
function persistRoundFile(session, storeType, content, operationName) {
    if (!session.sessionFolder)
        return;
    if (storeType === 'checkpoints')
        return;
    try {
        if (!existsSync(session.sessionFolder)) {
            mkdirSync(session.sessionFolder, { recursive: true });
        }
        const counter = String(session.roundFileCounter).padStart(2, '0');
        const label = STORE_LABELS[storeType] || operationName;
        const filename = `${counter}-${operationName}.md`;
        const filepath = join(session.sessionFolder, filename);
        const now = new Date();
        const timestamp = `${now.toISOString().slice(0, 10)} ${now.toISOString().slice(11, 19)}`;
        const rendered = renderEntryContent(storeType, content);
        const md = [
            `# ${label}`,
            '',
            `**Time**: ${timestamp}`,
            `**Operation**: ${operationName}`,
            '',
            '---',
            '',
            rendered,
            '',
        ].join('\n');
        writeFileSync(filepath, md, 'utf-8');
        session.roundFileCounter++;
    }
    catch {
        // Round file write failures must not crash the operation
    }
}
/**
 * Build a StoredEntry from validated content and args.
 * Centralizes entry construction so tokenEstimate is included automatically.
 */
export function buildEntry(content, args) {
    return {
        content,
        quality: args.quality,
        timestamp: Date.now(),
        ...(args.tokenEstimate !== undefined ? { tokenEstimate: args.tokenEstimate } : {}),
    };
}
//# sourceMappingURL=shared.js.map