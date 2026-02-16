/**
 * Recording Query Handler
 *
 * Query recording sessions by date, files, state, checkpoint count.
 * READ-ONLY: queries .orca/recording.db written by orca-record.
 */
import { openRecordingDb, listSessions } from '../../recording/db.js';
export async function handleRecordingQuery(args, _session) {
    const db = openRecordingDb(args.projectPath || undefined);
    if (!db) {
        return {
            content: [{
                    type: 'text',
                    text: JSON.stringify({
                        status: 'info',
                        message: 'No recording database found.',
                        sessions: [],
                    }),
                }],
        };
    }
    const content = (args.content || {});
    const filters = {
        date_from: content.date_from,
        date_to: content.date_to,
        files: content.files,
        min_checkpoints: content.min_checkpoints,
        state: content.state,
        limit: content.limit || 20,
    };
    const sessions = listSessions(db, filters);
    return {
        content: [{
                type: 'text',
                text: JSON.stringify({
                    status: 'info',
                    count: sessions.length,
                    sessions,
                }),
            }],
    };
}
//# sourceMappingURL=recording-query.js.map