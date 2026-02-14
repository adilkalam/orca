/**
 * PostToolUse[TodoWrite] Hook Handler
 *
 * Triggered after TodoWrite completes within a subagent context.
 * Creates an incremental checkpoint for progress tracking.
 * Actions:
 *   1. Record event with todo content
 *   2. Create incremental checkpoint
 */

import { execSync } from "child_process";
import type { HookInput, Checkpoint } from "../types.js";
import { StateMachine } from "../state-machine.js";
import { initDb, insertEvent, createCheckpoint, getCheckpoints } from "../storage/sqlite.js";
import { redactHookInput } from "../redaction/redact.js";

export async function handlePostTodo(
  hookInput: HookInput,
  gitDir: string,
  projectRoot: string
): Promise<void> {
  initDb(projectRoot);

  const sm = new StateMachine(gitDir);
  const sessionState = sm.findActiveSession();
  if (!sessionState) return;

  const now = new Date().toISOString();
  const gitHead = getGitHead(projectRoot);

  // Get the incremental sequence number for this session
  const existingCheckpoints = getCheckpoints(sessionState.session_id);
  const incrementalCount = existingCheckpoints.filter(
    (c) => c.is_incremental
  ).length;

  // Generate checkpoint ID
  const checkpointId = generateCheckpointId();

  // Create incremental checkpoint
  const checkpoint: Checkpoint = {
    id: checkpointId,
    session_id: sessionState.session_id,
    created_at: now,
    type: "task",
    shadow_commit: null,
    prompt_summary: null,
    files_modified_json: null,
    files_new_json: null,
    files_deleted_json: null,
    cognition_snapshot_json: null,
    quality_json: null,
    tool_use_id: hookInput.tool_use_id ?? null,
    subagent_type: "TodoWrite",
    is_incremental: true,
    incremental_sequence: incrementalCount + 1,
  };
  createCheckpoint(checkpoint);

  // Redact hook input
  const { redacted: redactedInput } = redactHookInput(
    hookInput as Record<string, unknown>
  );

  // Record event
  insertEvent({
    session_id: sessionState.session_id,
    timestamp: now,
    event_type: "post_todo",
    hook_input_json: JSON.stringify(redactedInput),
    git_head: gitHead,
    metadata_json: JSON.stringify({
      checkpoint_id: checkpointId,
      incremental_sequence: incrementalCount + 1,
      tool_use_id: hookInput.tool_use_id,
    }),
  });
}

function generateCheckpointId(): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function getGitHead(projectRoot: string): string | null {
  try {
    return execSync("git rev-parse HEAD", {
      cwd: projectRoot,
      encoding: "utf-8",
      timeout: 5000,
    }).trim();
  } catch {
    return null;
  }
}
