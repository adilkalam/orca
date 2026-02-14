/**
 * PreToolUse[Task] Hook Handler
 *
 * Triggered before a Task (subagent) starts execution.
 * Actions:
 *   1. Capture pre-task file state (git status)
 *   2. Store tool_use_id from hook input
 *   3. Record event to SQLite
 */

import { execSync } from "child_process";
import type { HookInput, GitSnapshot } from "../types.js";
import { StateMachine } from "../state-machine.js";
import { initDb, insertEvent } from "../storage/sqlite.js";
import { redactHookInput } from "../redaction/redact.js";

export async function handlePreTask(
  hookInput: HookInput,
  gitDir: string,
  projectRoot: string
): Promise<void> {
  initDb(projectRoot);

  const sm = new StateMachine(gitDir);
  const sessionState = sm.findActiveSession();
  if (!sessionState) return;

  const gitHead = getGitHead(projectRoot);
  const gitStatus = getGitStatus(projectRoot);
  const toolUseId = hookInput.tool_use_id ?? "unknown";

  // Capture pre-task snapshot keyed by tool_use_id
  const snapshot: GitSnapshot = {
    head: gitHead,
    status: gitStatus,
    timestamp: new Date().toISOString(),
  };
  sm.setPreTaskSnapshot(sessionState, toolUseId, snapshot);

  // Redact hook input
  const { redacted: redactedInput } = redactHookInput(
    hookInput as Record<string, unknown>
  );

  // Record event
  insertEvent({
    session_id: sessionState.session_id,
    timestamp: new Date().toISOString(),
    event_type: "pre_task",
    hook_input_json: JSON.stringify(redactedInput),
    git_head: gitHead,
    metadata_json: JSON.stringify({
      tool_use_id: toolUseId,
      status_file_count: gitStatus.length,
    }),
  });
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
