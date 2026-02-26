/**
 * Notebook Export Handler - Accept-Store-Echo Pattern
 *
 * CRITICAL: This handler follows the accept-store-echo pattern exactly.
 * The MCP is a MIRROR. It cannot generate, suggest, enhance, or transform.
 */
import { validateOperationContent } from '../../schema.js';
import { getSessionManager } from '../../session/manager.js';
import { buildErrorResponse } from '../shared.js';
export async function handleNotebookExport(args, session) {
    const manager = getSessionManager();
    // 1. VALIDATE structure (not content)
    const validation = validateOperationContent('notebook_export', args.content);
    if (!validation.success) {
        return buildErrorResponse({
            status: 'error',
            error: validation.error,
            hint: validation.hint,
            sessionContext: {
                sessionId: session.id,
                entryCount: session.getCount('notebookExport'),
                totalEntries: session.getTotalCount(),
                sessionDuration: session.getDuration(),
                continuation: null,
            },
        });
    }
    const exportContent = validation.data;
    // 2. STORE unchanged (add timestamp)
    const entry = {
        content: exportContent, // UNCHANGED
        quality: args.quality, // UNCHANGED
        timestamp: Date.now(),
    };
    // 3. PERSIST to filesystem
    await manager.addEntry(session, 'notebookExport', entry);
    // Notebook export does not have nextThoughtNeeded - always stored
    // 4. ECHO unchanged + context
    const response = {
        ...exportContent,
        quality: args.quality,
        status: 'stored',
        sessionContext: {
            sessionId: session.id,
            entryCount: session.getCount('notebookExport'),
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
//# sourceMappingURL=export.js.map