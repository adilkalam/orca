/**
 * Ulysses Protocol Handler - Accept-Store-Echo Pattern
 *
 * CRITICAL: This handler follows the accept-store-echo pattern exactly.
 * The MCP is a MIRROR. It cannot generate, suggest, enhance, or transform.
 */
import { validateOperationContent } from '../../schema.js';
import { getSessionManager } from '../../session/manager.js';
import { buildResponse } from '../shared.js';
export async function handleUlyssesProtocol(args, session) {
    const manager = getSessionManager();
    // 1. VALIDATE structure (not content)
    const validation = validateOperationContent('ulysses_protocol', args.content);
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
                            entryCount: session.getCount('ulysses'),
                            totalEntries: session.getTotalCount(),
                            sessionDuration: session.getDuration(),
                            continuation: null,
                        },
                    }),
                }],
        };
    }
    const ulyssesContent = validation.data;
    // 2. STORE unchanged (add timestamp)
    const entry = {
        content: ulyssesContent, // UNCHANGED
        quality: args.quality, // UNCHANGED
        timestamp: Date.now(),
        ...(args.tokenEstimate !== undefined ? { tokenEstimate: args.tokenEstimate } : {}),
    };
    // 3. PERSIST to filesystem
    await manager.addEntry(session, 'ulysses', entry);
    // Check if session should complete
    const shouldComplete = ulyssesContent.nextThoughtNeeded === false;
    let exportPath = null;
    if (shouldComplete) {
        exportPath = await manager.completeSession(session);
    }
    // 4. ECHO unchanged + context (respects verbose flag)
    return buildResponse(ulyssesContent, args, session, 'ulysses', shouldComplete ? 'exported' : 'stored', exportPath);
}
//# sourceMappingURL=ulysses.js.map