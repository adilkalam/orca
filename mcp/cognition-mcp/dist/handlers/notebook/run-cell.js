/**
 * Notebook Run Cell Handler - Accept-Store-Echo Pattern
 *
 * CRITICAL: This handler follows the accept-store-echo pattern exactly.
 * The MCP is a MIRROR. It cannot generate, suggest, enhance, or transform.
 */
import { validateOperationContent } from '../../schema.js';
import { getSessionManager } from '../../session/manager.js';
export async function handleNotebookRunCell(args, session) {
    const manager = getSessionManager();
    // 1. VALIDATE structure (not content)
    const validation = validateOperationContent('notebook_run_cell', args.content);
    if (!validation.success) {
        return {
            content: [{
                    type: 'text',
                    text: JSON.stringify({
                        status: 'error',
                        error: validation.error,
                        sessionContext: {
                            sessionId: session.id,
                            entryCount: session.getCount('notebookRun'),
                            totalEntries: session.getTotalCount(),
                            sessionDuration: session.getDuration(),
                            continuation: null,
                        },
                    }),
                }],
        };
    }
    const runContent = validation.data;
    // 2. STORE unchanged (add timestamp)
    const entry = {
        content: runContent, // UNCHANGED
        quality: args.quality, // UNCHANGED
        timestamp: Date.now(),
    };
    // 3. PERSIST to filesystem
    await manager.addEntry(session, 'notebookRun', entry);
    // Notebook run cell does not have nextThoughtNeeded - always stored
    // 4. ECHO unchanged + context
    const response = {
        ...runContent,
        quality: args.quality,
        status: 'stored',
        sessionContext: {
            sessionId: session.id,
            entryCount: session.getCount('notebookRun'),
            totalEntries: session.getTotalCount(),
            sessionDuration: session.getDuration(),
            continuation: 'Continue with sessionId: ' + session.id,
        },
    };
    return {
        content: [{
                type: 'text',
                text: JSON.stringify(response),
            }],
    };
}
//# sourceMappingURL=run-cell.js.map