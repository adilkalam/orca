/**
 * Visual Dashboard Handler - Accept-Store-Echo Pattern
 *
 * CRITICAL: This handler follows the accept-store-echo pattern exactly.
 * The MCP is a MIRROR. It cannot generate, suggest, enhance, or transform.
 */
import { validateOperationContent } from '../../schema.js';
import { getSessionManager } from '../../session/manager.js';
import { buildResponse, buildErrorResponse } from '../shared.js';
export async function handleVisualDashboard(args, session) {
    const manager = getSessionManager();
    // 1. VALIDATE structure (not content)
    const validation = validateOperationContent('visual_dashboard', args.content);
    if (!validation.success) {
        return buildErrorResponse({
            status: 'error',
            error: validation.error,
            hint: validation.hint,
            sessionContext: {
                sessionId: session.id,
                entryCount: session.getCount('dashboard'),
                totalEntries: session.getTotalCount(),
                sessionDuration: session.getDuration(),
                continuation: null,
            },
        });
    }
    const dashboardContent = validation.data;
    // 2. STORE unchanged (add timestamp)
    const entry = {
        content: dashboardContent, // UNCHANGED
        quality: args.quality, // UNCHANGED
        timestamp: Date.now(),
    };
    // 3. PERSIST to filesystem
    await manager.addEntry(session, 'dashboard', entry);
    // Check if session should complete
    const shouldComplete = dashboardContent.nextThoughtNeeded === false;
    let exportPath = null;
    if (shouldComplete) {
        exportPath = await manager.completeSession(session);
    }
    // 4. ECHO unchanged + context (respects verbose flag)
    return buildResponse(dashboardContent, args, session, 'dashboard', shouldComplete ? 'exported' : 'stored', exportPath);
}
//# sourceMappingURL=dashboard.js.map