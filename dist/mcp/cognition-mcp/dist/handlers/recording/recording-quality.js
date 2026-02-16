/**
 * Recording Quality Handler
 *
 * Session quality analytics: gate results, rewind frequency,
 * error patterns, checkpoint frequency, cross-session patterns.
 * READ-ONLY: queries .orca/recording.db written by orca-record.
 */
import { openRecordingDb, getQualityMetrics } from '../../recording/db.js';
export async function handleRecordingQuality(args, _session) {
    const db = openRecordingDb(args.projectPath || undefined);
    if (!db) {
        return {
            content: [{
                    type: 'text',
                    text: JSON.stringify({
                        status: 'info',
                        message: 'No recording database found.',
                        quality: null,
                    }),
                }],
        };
    }
    const content = (args.content || {});
    const report = getQualityMetrics(db, content.session_id);
    return {
        content: [{
                type: 'text',
                text: JSON.stringify({ status: 'info', quality: report }),
            }],
    };
}
//# sourceMappingURL=recording-quality.js.map