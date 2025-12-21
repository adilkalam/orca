/**
 * Session Handlers - Info, Export, Import
 *
 * These handlers manage session lifecycle.
 * They return session data, they do not generate content.
 */
import { getSessionManager } from '../session/manager.js';
import { exportSession } from '../session/persistence.js';
/**
 * Session Info - Returns current session state
 */
export async function handleSessionInfo(_args, session) {
    const response = {
        status: 'info',
        session: {
            id: session.id,
            title: session.metadata.title,
            tags: session.metadata.tags,
            status: session.metadata.status,
            createdAt: session.metadata.createdAt,
            lastAccessedAt: session.metadata.lastAccessedAt,
            counts: {
                thoughts: session.getCount('thoughts'),
                mentalModels: session.getCount('mentalModels'),
                debugging: session.getCount('debugging'),
                decisions: session.getCount('decisions'),
                meta: session.getCount('meta'),
                systems: session.getCount('systems'),
            },
            totalEntries: session.getTotalCount(),
            duration: session.getDuration(),
        },
        sessionContext: {
            sessionId: session.id,
            entryCount: session.getTotalCount(),
            totalEntries: session.getTotalCount(),
            sessionDuration: session.getDuration(),
            continuation: session.metadata.status === 'active'
                ? 'Continue with sessionId: ' + session.id
                : null,
        },
    };
    return {
        content: [{
                type: 'text',
                text: JSON.stringify(response),
            }],
    };
}
/**
 * Session Export - Exports complete session to file and returns data
 */
export async function handleSessionExport(_args, session) {
    const exportPath = await exportSession(session);
    const exportData = session.toExport();
    const response = {
        status: 'exported',
        exportPath,
        exportData,
        sessionContext: {
            sessionId: session.id,
            entryCount: session.getTotalCount(),
            totalEntries: session.getTotalCount(),
            sessionDuration: session.getDuration(),
            continuation: null,
        },
    };
    return {
        content: [{
                type: 'text',
                text: JSON.stringify(response),
            }],
    };
}
/**
 * Session Import - Imports session from export data
 */
export async function handleSessionImport(args, _session) {
    const manager = getSessionManager();
    if (!args.data) {
        return {
            content: [{
                    type: 'text',
                    text: JSON.stringify({
                        status: 'error',
                        error: 'No data provided for import',
                        sessionContext: {
                            sessionId: '',
                            entryCount: 0,
                            totalEntries: 0,
                            sessionDuration: 0,
                            continuation: null,
                        },
                    }),
                }],
        };
    }
    try {
        const importData = args.data;
        const importedSession = await manager.importFromExport(importData);
        const response = {
            status: 'imported',
            session: {
                id: importedSession.id,
                title: importedSession.metadata.title,
                tags: importedSession.metadata.tags,
                status: importedSession.metadata.status,
                totalEntries: importedSession.getTotalCount(),
            },
            sessionContext: {
                sessionId: importedSession.id,
                entryCount: importedSession.getTotalCount(),
                totalEntries: importedSession.getTotalCount(),
                sessionDuration: importedSession.getDuration(),
                continuation: importedSession.metadata.status === 'active'
                    ? 'Continue with sessionId: ' + importedSession.id
                    : null,
            },
        };
        return {
            content: [{
                    type: 'text',
                    text: JSON.stringify(response),
                }],
        };
    }
    catch (err) {
        return {
            content: [{
                    type: 'text',
                    text: JSON.stringify({
                        status: 'error',
                        error: 'Failed to import session: ' + (err instanceof Error ? err.message : 'Unknown error'),
                        sessionContext: {
                            sessionId: '',
                            entryCount: 0,
                            totalEntries: 0,
                            sessionDuration: 0,
                            continuation: null,
                        },
                    }),
                }],
        };
    }
}
//# sourceMappingURL=session.js.map