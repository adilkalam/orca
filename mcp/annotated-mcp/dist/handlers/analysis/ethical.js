/**
 * Ethical Analysis Handler - Accept-Store-Echo Pattern
 *
 * CRITICAL: This handler follows the accept-store-echo pattern exactly.
 * The MCP is a MIRROR. It cannot generate, suggest, enhance, or transform.
 */
import { validateOperationContent } from '../../schema.js';
import { getSessionManager } from '../../session/manager.js';
import { buildResponse, buildErrorResponse } from '../shared.js';
export async function handleEthicalAnalysis(args, session) {
    const manager = getSessionManager();
    // 1. VALIDATE structure (not content)
    const validation = validateOperationContent('ethical_analysis', args.content);
    if (!validation.success) {
        return buildErrorResponse({
            status: 'error',
            error: validation.error,
            hint: validation.hint,
            sessionContext: {
                sessionId: session.id,
                entryCount: session.getCount('ethical'),
                totalEntries: session.getTotalCount(),
                sessionDuration: session.getDuration(),
                continuation: null,
            },
        });
    }
    const ethicalContent = validation.data;
    // 2. STORE unchanged (add timestamp)
    const entry = {
        content: ethicalContent, // UNCHANGED
        quality: args.quality, // UNCHANGED
        timestamp: Date.now(),
    };
    // 3. PERSIST to filesystem
    await manager.addEntry(session, 'ethical', entry);
    // Check if session should complete
    const shouldComplete = ethicalContent.nextThoughtNeeded === false;
    let exportPath = null;
    if (shouldComplete) {
        exportPath = await manager.completeSession(session);
    }
    // 4. ECHO unchanged + context (respects verbose flag)
    return buildResponse(ethicalContent, args, session, 'ethical', shouldComplete ? 'exported' : 'stored', exportPath);
}
//# sourceMappingURL=ethical.js.map