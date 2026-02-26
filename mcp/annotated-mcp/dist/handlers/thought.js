/**
 * Thought Handler - Accept-Store-Echo Pattern
 *
 * CRITICAL: This handler follows the accept-store-echo pattern exactly.
 * 1. VALIDATE structure (not content)
 * 2. STORE unchanged
 * 3. PERSIST to filesystem
 * 4. ECHO unchanged + context
 *
 * The MCP is a MIRROR. It cannot generate, suggest, enhance, or transform.
 */
import { validateOperationContent } from '../schema.js';
import { getSessionManager } from '../session/manager.js';
import { buildResponse, buildErrorResponse } from './shared.js';
export async function handleThought(args, session) {
    const manager = getSessionManager();
    // 1. VALIDATE structure (not content)
    const validation = validateOperationContent('thought', args.content);
    if (!validation.success) {
        return buildErrorResponse({
            status: 'error',
            error: validation.error,
            hint: validation.hint,
            sessionContext: {
                sessionId: session.id,
                entryCount: session.getCount('thoughts'),
                totalEntries: session.getTotalCount(),
                sessionDuration: session.getDuration(),
                continuation: null,
            },
        });
    }
    const thoughtContent = validation.data;
    // 2. STORE unchanged (add timestamp)
    const entry = {
        content: thoughtContent, // UNCHANGED - exact same content that came in
        quality: args.quality, // UNCHANGED - Claude's self-assessment
        timestamp: Date.now(),
    };
    // 3. PERSIST to filesystem
    await manager.addEntry(session, 'thoughts', entry);
    // Check if session should complete
    const shouldComplete = thoughtContent.nextThoughtNeeded === false;
    let exportPath = null;
    if (shouldComplete) {
        exportPath = await manager.completeSession(session);
    }
    // 4. ECHO unchanged + context (respects verbose flag)
    return buildResponse(thoughtContent, args, session, 'thoughts', shouldComplete ? 'exported' : 'stored', exportPath);
}
//# sourceMappingURL=thought.js.map