/**
 * Recording Rewind Handler
 *
 * Triggers a rewind to a specific checkpoint via orca-record CLI.
 * Returns the files restored and cognitive context at that checkpoint.
 *
 * NOTE: This is the ONE handler that triggers a write-side operation
 * by calling orca-record as a child process. The database read
 * for cognitive context is still read-only from our side.
 */

import { execFile } from 'child_process';
import { promisify } from 'util';
import type { CognitionRequest, HandlerResult } from '../../types.js';
import type { SessionState } from '../../session/state.js';
import { openRecordingDb, getCheckpoint } from '../../recording/db.js';
import type { RewindResult } from '../../recording/types.js';

const execFileAsync = promisify(execFile);

export async function handleRecordingRewind(
  args: CognitionRequest,
  _session: SessionState
): Promise<HandlerResult> {
  const content = (args.content || {}) as { checkpoint_id?: string };

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

  // Read checkpoint detail before rewind
  const db = openRecordingDb(args.projectPath || undefined);
  let cognitiveContext: string | null = null;
  let filesExpected: string[] = [];

  if (db) {
    const cp = getCheckpoint(db, content.checkpoint_id);
    if (cp) {
      filesExpected = [...cp.files_modified, ...cp.files_new];
      if (cp.cognition_snapshot) {
        cognitiveContext = JSON.stringify(cp.cognition_snapshot);
      }
    }
  }

  // Call orca-record rewind via child process
  try {
    const cwd = args.projectPath || process.cwd();
    await execFileAsync(
      'npx',
      ['orca-record', 'rewind', '--checkpoint', content.checkpoint_id],
      { cwd, timeout: 30000 }
    );

    const result: RewindResult = {
      success: true,
      checkpoint_id: content.checkpoint_id,
      files_restored: filesExpected,
      cognitive_context: cognitiveContext,
      message: `Rewound to checkpoint ${content.checkpoint_id.substring(0, 8)}. ${filesExpected.length} file(s) expected to be restored.`,
    };

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ status: 'info', rewind: result }),
      }],
    };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);

    const result: RewindResult = {
      success: false,
      checkpoint_id: content.checkpoint_id,
      files_restored: [],
      cognitive_context: cognitiveContext,
      message: `Rewind failed: ${errMsg}`,
    };

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ status: 'error', rewind: result }),
      }],
    };
  }
}
