/**
 * Recording Compare Handler
 *
 * Diff two checkpoints: code changes, reasoning changes,
 * quality delta, and events between them.
 * READ-ONLY: queries .orca/recording.db written by orca-record.
 */
import { openRecordingDb, getCheckpoint, countEventsBetween, } from '../../recording/db.js';
export async function handleRecordingCompare(args, _session) {
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
    if (!content.checkpoint_id_a || !content.checkpoint_id_b) {
        return {
            content: [{
                    type: 'text',
                    text: JSON.stringify({
                        status: 'error',
                        error: 'Both checkpoint_id_a and checkpoint_id_b are required.',
                    }),
                }],
        };
    }
    const cpA = getCheckpoint(db, content.checkpoint_id_a);
    const cpB = getCheckpoint(db, content.checkpoint_id_b);
    if (!cpA) {
        return {
            content: [{
                    type: 'text',
                    text: JSON.stringify({
                        status: 'error',
                        error: `Checkpoint A not found: ${content.checkpoint_id_a}`,
                    }),
                }],
        };
    }
    if (!cpB) {
        return {
            content: [{
                    type: 'text',
                    text: JSON.stringify({
                        status: 'error',
                        error: `Checkpoint B not found: ${content.checkpoint_id_b}`,
                    }),
                }],
        };
    }
    // Compute code diff
    const allFilesA = new Set([...cpA.files_modified, ...cpA.files_new]);
    const allFilesB = new Set([...cpB.files_modified, ...cpB.files_new]);
    const filesAdded = [...allFilesB].filter(f => !allFilesA.has(f));
    const filesRemoved = [...allFilesA].filter(f => !allFilesB.has(f));
    const filesChanged = [...allFilesB].filter(f => allFilesA.has(f));
    // Compute reasoning diff from cognition snapshots
    const snapA = cpA.cognition_snapshot || {};
    const snapB = cpB.cognition_snapshot || {};
    const newThoughts = countArrayDiff(snapA, snapB, 'thoughts');
    const newDecisions = countArrayDiff(snapA, snapB, 'decisions');
    const newConstraints = countArrayDiff(snapA, snapB, 'constraints');
    // Count events between the two checkpoints
    const sessionId = cpA.session_id === cpB.session_id
        ? cpA.session_id
        : cpA.session_id;
    const eventsBetween = countEventsBetween(db, sessionId, cpA.created_at, cpB.created_at);
    const comparison = {
        checkpoint_a: { id: cpA.id, created_at: cpA.created_at },
        checkpoint_b: { id: cpB.id, created_at: cpB.created_at },
        code_diff: {
            files_added: filesAdded,
            files_removed: filesRemoved,
            files_changed: filesChanged,
        },
        reasoning_diff: {
            new_thoughts: newThoughts,
            new_decisions: newDecisions,
            new_constraints: newConstraints,
        },
        quality_delta: {
            a_quality: cpA.quality,
            b_quality: cpB.quality,
        },
        events_between: eventsBetween,
    };
    return {
        content: [{
                type: 'text',
                text: JSON.stringify({ status: 'info', comparison }),
            }],
    };
}
/**
 * Count the difference in array length between two snapshots for a given key.
 */
function countArrayDiff(snapA, snapB, key) {
    const countA = Array.isArray(snapA[key]) ? snapA[key].length : 0;
    const countB = Array.isArray(snapB[key]) ? snapB[key].length : 0;
    return Math.max(0, countB - countA);
}
//# sourceMappingURL=recording-compare.js.map