/**
 * MCTS (Monte Carlo Tree Search) Handler - Accept-Store-Echo Pattern
 *
 * CRITICAL: This handler follows the accept-store-echo pattern exactly.
 * The MCP is a MIRROR. It cannot generate, suggest, enhance, or transform.
 */
import { validateOperationContent } from '../../schema.js';
import { getSessionManager } from '../../session/manager.js';
import { buildResponse, buildErrorResponse } from '../shared.js';
export async function handleMCTS(args, session) {
    const manager = getSessionManager();
    // 1. VALIDATE structure (not content)
    const validation = validateOperationContent('mcts', args.content);
    if (!validation.success) {
        return buildErrorResponse({
            status: 'error',
            error: validation.error,
            hint: validation.hint,
            sessionContext: {
                sessionId: session.id,
                entryCount: session.getCount('mcts'),
                totalEntries: session.getTotalCount(),
                sessionDuration: session.getDuration(),
                continuation: null,
            },
        });
    }
    const mctsContent = validation.data;
    // 2. STORE unchanged (add timestamp)
    const entry = {
        content: mctsContent, // UNCHANGED
        quality: args.quality, // UNCHANGED
        timestamp: Date.now(),
    };
    // 3. PERSIST to filesystem
    await manager.addEntry(session, 'mcts', entry);
    // Check if session should complete
    const shouldComplete = mctsContent.nextThoughtNeeded === false;
    let exportPath = null;
    if (shouldComplete) {
        exportPath = await manager.completeSession(session);
    }
    // 4. ECHO unchanged + context (respects verbose flag)
    return buildResponse(mctsContent, args, session, 'mcts', shouldComplete ? 'exported' : 'stored', exportPath);
}
//# sourceMappingURL=mcts.js.map