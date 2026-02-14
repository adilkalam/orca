/**
 * PostToolUse[Task] Hook Handler
 *
 * Triggered after a Task (subagent) completes execution.
 * Actions:
 *   1. Diff against pre-task state
 *   2. Create task-level checkpoint in SQLite
 *   3. Record event with subagent info
 */

import { execSync } from "child_process";
import type { HookInput, Checkpoint, GitSnapshot } from "../types.js";
import { StateMachine } from "../state-machine.js";
import { initDb, insertEvent, createCheckpoint, updateCheckpoint } from "../storage/sqlite.js";
import { redactHookInput } from "../redaction/redact.js";
import { createCheckpointCommit } from "../git/shadow-branch.js";
import { withLock } from "../git/lockfile.js";
import { isGitRepo } from "../git/plumbing.js";

export async function handlePostTask(
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
  const toolUseId = hookInput.tool_use_id ?? "unknown";

  // Get pre-task snapshot for diffing
  const { state: updatedState, snapshot: preTaskSnapshot } =
    sm.popPreTaskSnapshot(sessionState, toolUseId);

  // Current state
  const currentStatus = getGitStatus(projectRoot);

  // Diff against pre-task state
  const { modified, added, deleted } = diffStatus(preTaskSnapshot, currentStatus);
  const allFilesTouched = [...modified, ...added, ...deleted];

  // Track files touched in session
  if (allFilesTouched.length > 0) {
    sm.recordStep(updatedState, allFilesTouched);
  }

  // Generate checkpoint ID
  const checkpointId = generateCheckpointId();

  // Create task checkpoint
  const checkpoint: Checkpoint = {
    id: checkpointId,
    session_id: sessionState.session_id,
    created_at: now,
    type: "task",
    shadow_commit: null,
    prompt_summary: null,
    files_modified_json: modified.length > 0 ? JSON.stringify(modified) : null,
    files_new_json: added.length > 0 ? JSON.stringify(added) : null,
    files_deleted_json: deleted.length > 0 ? JSON.stringify(deleted) : null,
    cognition_snapshot_json: null,
    quality_json: null,
    tool_use_id: toolUseId,
    subagent_type: hookInput.tool_name ?? null,
    is_incremental: false,
    incremental_sequence: null,
  };
  createCheckpoint(checkpoint);

  // Phase 2: Create shadow branch checkpoint with lockfile (concurrent subagents)
  const resolvedGitDir = getGitDir(projectRoot);
  if (isGitRepo(projectRoot) && sessionState.shadow_branch && resolvedGitDir) {
    try {
      await withLock(resolvedGitDir, async () => {
        const shadowCommit = createCheckpointCommit(
          projectRoot,
          sessionState.session_id,
          checkpointId,
          {
            type: "task",
            promptSummary: null,
            filesModified: modified,
            filesNew: added,
            filesDeleted: deleted,
          }
        );
        if (shadowCommit) {
          updateCheckpoint(checkpointId, { shadow_commit: shadowCommit });
        }
      });
    } catch {
      // Shadow branch checkpoint failed -- continue without it
    }
  }

  // Redact hook input
  const { redacted: redactedInput } = redactHookInput(
    hookInput as Record<string, unknown>
  );

  // Record event
  insertEvent({
    session_id: sessionState.session_id,
    timestamp: now,
    event_type: "post_task",
    hook_input_json: JSON.stringify(redactedInput),
    git_head: gitHead,
    metadata_json: JSON.stringify({
      checkpoint_id: checkpointId,
      tool_use_id: toolUseId,
      files_modified: modified.length,
      files_new: added.length,
      files_deleted: deleted.length,
    }),
  });
}

function diffStatus(
  preSnapshot: GitSnapshot | null,
  currentStatus: string[]
): { modified: string[]; added: string[]; deleted: string[] } {
  const modified: string[] = [];
  const added: string[] = [];
  const deleted: string[] = [];

  const previousFiles = new Set(
    (preSnapshot?.status ?? []).map((s) => s.slice(3))
  );

  for (const line of currentStatus) {
    const status = line.slice(0, 2).trim();
    const file = line.slice(3);

    if (status === "??" || status === "A") {
      if (!previousFiles.has(file)) {
        added.push(file);
      }
    } else if (status === "D") {
      deleted.push(file);
    } else if (status === "M" || status === "MM" || status === "AM") {
      modified.push(file);
    }
  }

  return { modified, added, deleted };
}

function generateCheckpointId(): string {
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function getGitDir(projectRoot: string): string | null {
  try {
    return execSync("git rev-parse --git-dir", {
      cwd: projectRoot,
      encoding: "utf-8",
      timeout: 3000,
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
  } catch {
    return null;
  }
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

function getGitStatus(projectRoot: string): string[] {
  try {
    const output = execSync("git status --porcelain", {
      cwd: projectRoot,
      encoding: "utf-8",
      timeout: 5000,
    });
    return output
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}
