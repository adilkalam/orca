/**
 * Recording Checkpoint Handler
 *
 * Get full checkpoint detail including code state, cognitive state,
 * quality, timing, and condensed commit reference.
 * READ-ONLY: queries .orca/recording.db written by orca-record.
 */
import { openRecordingDb, getCheckpoint } from '../../recording/db.js';
export async function handleRecordingCheckpoint(args, _session) {
    const db = openRecordingDb(args.projectPath || undefined);
    if (!db) {
        return {
            content: [{
                    type: 'text',
                    text: JSON.stringify({
                        status: 'error',
                        error: 'No recording database found.',
                    }),
                }],
        };
    }
    const content = (args.content || {});
    if (!content.checkpoint_id) {
        return {
            content: [{
                    type: 'text',
                    text: JSON.stringify({
                        status: 'error',
                        error: 'checkpoint_id is required.',
                    }),
                }],
        };
    }
    const detail = getCheckpoint(db, content.checkpoint_id);
    if (!detail) {
        return {
            content: [{
                    type: 'text',
                    text: JSON.stringify({
                        status: 'error',
                        error: `Checkpoint not found: ${content.checkpoint_id}`,
                    }),
                }],
        };
    }
    return {
        content: [{
                type: 'text',
                text: JSON.stringify({ status: 'info', checkpoint: detail }),
            }],
    };
}
//# sourceMappingURL=recording-checkpoint.js.map