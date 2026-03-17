/**
 * PDR Reasoning Handler - Accept-Store-Echo Pattern
 *
 * CRITICAL: This handler follows the accept-store-echo pattern exactly.
 * The MCP is a MIRROR. It cannot generate, suggest, enhance, or transform.
 */
import { validateOperationContent } from '../../schema.js';
import { getSessionManager } from '../../session/manager.js';
import { buildResponse } from '../shared.js';
export async function handlePDRReasoning(args, session) {
    const manager = getSessionManager();
    // 1. VALIDATE structure (not content)
    const validation = validateOperationContent('pdr_reasoning', args.content);
    if (!validation.success) {
        return {
            content: [{
                    type: 'text',
                    text: JSON.stringify({
                        status: 'error',
                        error: validation.error,
                        hint: validation.hint,
                        sessionContext: {
                            sessionId: session.id,
                            entryCount: session.getCount('pdr'),
                            totalEntries: session.getTotalCount(),
                            sessionDuration: session.getDuration(),
                            continuation: null,
                        },
                    }),
                }],
        };
    }
    const pdrContent = validation.data;
    // 2. STORE unchanged (add timestamp)
    const entry = {
        content: pdrContent, // UNCHANGED
        quality: args.quality, // UNCHANGED
        timestamp: Date.now(),
        ...(args.tokenEstimate !== undefined ? { tokenEstimate: args.tokenEstimate } : {}),
    };
    // 3. PERSIST to filesystem
    await manager.addEntry(session, 'pdr', entry);
    // Check if session should complete
    const shouldComplete = pdrContent.nextThoughtNeeded === false;
    let exportPath = null;
    if (shouldComplete) {
        exportPath = await manager.completeSession(session);
    }
    // 4. ECHO unchanged + context (respects verbose flag)
    return buildResponse(pdrContent, args, session, 'pdr', shouldComplete ? 'exported' : 'stored', exportPath);
}
//# sourceMappingURL=pdr.js.map