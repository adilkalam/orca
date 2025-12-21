/**
 * Visual Dashboard Handler - Accept-Store-Echo Pattern
 *
 * CRITICAL: This handler follows the accept-store-echo pattern exactly.
 * The MCP is a MIRROR. It cannot generate, suggest, enhance, or transform.
 */
import { validateOperationContent } from '../../schema.js';
import { getSessionManager } from '../../session/manager.js';
export async function handleVisualDashboard(args, session) {
    const manager = getSessionManager();
    // 1. VALIDATE structure (not content)
    const validation = validateOperationContent('visual_dashboard', args.content);
    if (!validation.success) {
        return {
            content: [{
                    type: 'text',
                    text: JSON.stringify({
                        status: 'error',
                        error: validation.error,
                        sessionContext: {
                            sessionId: session.id,
                            entryCount: session.getCount('dashboard'),
                            totalEntries: session.getTotalCount(),
                            sessionDuration: session.getDuration(),
                            continuation: null,
                        },
                    }),
                }],
        };
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
    // 4. ECHO unchanged + context
    const response = {
        ...dashboardContent,
        quality: args.quality,
        status: shouldComplete ? 'exported' : 'stored',
        sessionContext: {
            sessionId: session.id,
            entryCount: session.getCount('dashboard'),
            totalEntries: session.getTotalCount(),
            sessionDuration: session.getDuration(),
            continuation: shouldComplete
                ? null
                : 'Continue with sessionId: ' + session.id,
        },
        ...(exportPath ? { exportPath } : {}),
    };
    return {
        content: [{
                type: 'text',
                text: JSON.stringify(response),
            }],
    };
}
//# sourceMappingURL=dashboard.js.map