/**
 * Recording Status Handler
 *
 * Returns current recording state: active session, shadow branch,
 * checkpoint count, files touched, duration.
 * READ-ONLY: queries .orca/recording.db written by orca-record.
 */

import type { CognitionRequest, HandlerResult } from '../../types.js';
import type { SessionState } from '../../session/state.js';
import { openRecordingDb, getActiveSession, getCheckpoints } from '../../recording/db.js';
import type { RecordingStatus } from '../../recording/types.js';

export async function handleRecordingStatus(
  args: CognitionRequest,
  _session: SessionState
): Promise<HandlerResult> {
  const db = openRecordingDb(args.projectPath || undefined);

  if (!db) {
    const result: RecordingStatus = {
      hasRecordingDb: false,
      activeSessionId: null,
      state: null,
      shadowBranch: null,
      checkpointCount: 0,
      filesTouchedCount: 0,
      duration: null,
      cognitionSessionId: null,
    };

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          status: 'info',
          message: 'No recording database found. Start a recording session with orca-record first.',
          data: result,
        }),
      }],
    };
  }

  const activeSession = getActiveSession(db);

  if (!activeSession) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          status: 'info',
          data: {
            hasRecordingDb: true,
            activeSessionId: null,
            state: 'IDLE',
            shadowBranch: null,
            checkpointCount: 0,
            filesTouchedCount: 0,
            duration: null,
            cognitionSessionId: null,
          } satisfies RecordingStatus,
        }),
      }],
    };
  }

  const checkpoints = getCheckpoints(db, activeSession.id);
  const filesTouched = activeSession.files_touched_json
    ? JSON.parse(activeSession.files_touched_json)
    : [];
  const startedAt = new Date(activeSession.started_at).getTime();
  const duration = Math.round((Date.now() - startedAt) / 1000);

  const result: RecordingStatus = {
    hasRecordingDb: true,
    activeSessionId: activeSession.id,
    state: activeSession.state as RecordingStatus['state'],
    shadowBranch: activeSession.shadow_branch,
    checkpointCount: checkpoints.length,
    filesTouchedCount: Array.isArray(filesTouched) ? filesTouched.length : 0,
    duration,
    cognitionSessionId: activeSession.cognition_session_id,
  };

  return {
    content: [{
      type: 'text',
      text: JSON.stringify({ status: 'info', data: result }),
    }],
  };
}
