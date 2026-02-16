/**
 * Recording Explain Handler
 *
 * Generate a human-readable narrative of a recording session:
 * what happened, why, how well, and what was produced.
 * READ-ONLY: queries .orca/recording.db written by orca-record.
 */
import { openRecordingDb, getSession, getCheckpoints, getEvents, getCondensed, } from '../../recording/db.js';
export async function handleRecordingExplain(args, _session) {
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
    if (!content.session_id) {
        return {
            content: [{
                    type: 'text',
                    text: JSON.stringify({
                        status: 'error',
                        error: 'session_id is required.',
                    }),
                }],
        };
    }
    const session = getSession(db, content.session_id);
    if (!session) {
        return {
            content: [{
                    type: 'text',
                    text: JSON.stringify({
                        status: 'error',
                        error: `Session not found: ${content.session_id}`,
                    }),
                }],
        };
    }
    const checkpoints = getCheckpoints(db, content.session_id);
    const events = getEvents(db, content.session_id);
    // Build timeline
    const timeline = [];
    timeline.push(`Session started at ${session.started_at} (state: ${session.state}).`);
    // Count event types
    const eventCounts = {};
    for (const ev of events) {
        eventCounts[ev.event_type] = (eventCounts[ev.event_type] || 0) + 1;
    }
    if (Object.keys(eventCounts).length > 0) {
        const eventSummary = Object.entries(eventCounts)
            .map(([type, count]) => `${count} ${type}`)
            .join(', ');
        timeline.push(`Events: ${eventSummary}.`);
    }
    // Summarize checkpoints
    for (const cp of checkpoints) {
        const filesModified = cp.files_modified_json
            ? JSON.parse(cp.files_modified_json).length
            : 0;
        const filesNew = cp.files_new_json
            ? JSON.parse(cp.files_new_json).length
            : 0;
        const summary = cp.prompt_summary || 'no summary';
        timeline.push(`Checkpoint ${cp.id.substring(0, 8)} at ${cp.created_at}: ${summary} (${filesModified} modified, ${filesNew} new).`);
    }
    if (session.ended_at) {
        timeline.push(`Session ended at ${session.ended_at}.`);
    }
    // Build summary
    const filesTouched = session.files_touched_json
        ? JSON.parse(session.files_touched_json)
        : [];
    const filesTouchedCount = Array.isArray(filesTouched) ? filesTouched.length : 0;
    const rewindEvents = events.filter(e => e.event_type.toLowerCase().includes('rewind'));
    let summary = `Session ${content.session_id.substring(0, 8)} `;
    if (session.state === 'ENDED') {
        summary += 'completed';
    }
    else {
        summary += `is ${session.state.toLowerCase()}`;
    }
    summary += `. Created ${checkpoints.length} checkpoint(s) touching ${filesTouchedCount} file(s).`;
    if (rewindEvents.length > 0) {
        summary += ` Rewound ${rewindEvents.length} time(s).`;
    }
    // Quality note
    let qualityNote = 'No quality data recorded.';
    const qualityCheckpoints = checkpoints.filter(cp => cp.quality_json);
    if (qualityCheckpoints.length > 0) {
        qualityNote = `${qualityCheckpoints.length} of ${checkpoints.length} checkpoints have quality data.`;
    }
    // Commit info from condensed
    let commitInfo = null;
    if (checkpoints.length > 0) {
        const lastCp = checkpoints[checkpoints.length - 1];
        const condensed = getCondensed(db, lastCp.id);
        if (condensed) {
            commitInfo = `Condensed to commit ${condensed.commit_hash.substring(0, 8)} at ${condensed.condensed_at}.`;
        }
    }
    const narrative = {
        session_id: content.session_id,
        summary,
        timeline,
        quality_note: qualityNote,
        commit_info: commitInfo,
    };
    return {
        content: [{
                type: 'text',
                text: JSON.stringify({ status: 'info', narrative }),
            }],
    };
}
//# sourceMappingURL=recording-explain.js.map