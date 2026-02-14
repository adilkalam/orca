/**
 * UserPromptSubmit Hook Handler
 *
 * Triggered when the user submits a prompt to Claude Code.
 * Actions:
 *   1. Read hook input from stdin (JSON)
 *   2. Snapshot: git status --porcelain
 *   3. Start or continue session in state machine
 *   4. Record event to SQLite
 *   5. Store git HEAD for baseline
 */

import { execSync } from "child_process";
import {
  SessionState as SessionStateEnum,
  SessionEvent,
  type HookInput,
  type GitSnapshot,
  type Session,
} from "../types.js";
import { StateMachine } from "../state-machine.js";
import { initDb, createSession, updateSession, insertEvent, getActiveSession } from "../storage/sqlite.js";
import { redactHookInput } from "../redaction/redact.js";
import { createShadowBranch } from "../git/shadow-branch.js";
import { isGitRepo } from "../git/plumbing.js";
import { areHooksInstalled, installGitHooks } from "../git/hooks.js";

export async function handlePromptSubmit(
  hookInput: HookInput,
  gitDir: string,
  projectRoot: string
): Promise<void> {
  // Initialize database
  initDb(projectRoot);

  // Get git state
  const gitHead = getGitHead(projectRoot);
  const gitStatus = getGitStatus(projectRoot);

  const snapshot: GitSnapshot = {
    head: gitHead,
    status: gitStatus,
    timestamp: new Date().toISOString(),
  };

  // State machine
  const sm = new StateMachine(gitDir);

  // Find or create session
  let sessionState = sm.findActiveSession();
  let isNewSession = false;

  if (!sessionState) {
    sessionState = sm.createSession(gitHead);
    isNewSession = true;
  }

  // Apply TurnStart event
  const { state: updatedState } = sm.transition(
    sessionState,
    isNewSession ? SessionEvent.SessionStart : SessionEvent.TurnStart
  );

  // Store snapshot for later diffing (in Stop hook)
  sm.setSnapshot(updatedState, snapshot);

  // Phase 2: Create shadow branch on first turn (IDLE -> ACTIVE)
  let shadowBranchName: string | null = null;
  if (isNewSession && isGitRepo(projectRoot)) {
    try {
      shadowBranchName = createShadowBranch(projectRoot, updatedState.session_id);
      if (shadowBranchName) {
        // Record shadow branch in state file
        const withBranch = { ...updatedState, shadow_branch: shadowBranchName };
        sm.saveSession(withBranch);
      }
    } catch {
      // Shadow branch creation failed -- continue without it
    }
  }

  // Phase 3: Auto-install git hooks on first invocation (EnsureSetup pattern)
  if (isGitRepo(projectRoot) && !areHooksInstalled(projectRoot)) {
    try {
      installGitHooks(projectRoot);
    } catch {
      // Hook installation failed -- continue without it
    }
  }

  // Create session in SQLite if new
  if (isNewSession) {
    const session: Session = {
      id: updatedState.session_id,
      started_at: updatedState.started_at,
      ended_at: null,
      state: SessionStateEnum.ACTIVE,
      base_commit: gitHead,
      worktree_id: null,
      shadow_branch: shadowBranchName,
      cognition_session_id: null,
      git_head: gitHead,
      step_count: 0,
      token_usage_json: null,
      files_touched_json: null,
    };
    createSession(session);
  } else {
    // Update existing session
    updateSession(updatedState.session_id, {
      state: SessionStateEnum.ACTIVE,
      git_head: gitHead,
    });
  }

  // Redact hook input before storage
  const { redacted: redactedInput } = redactHookInput(
    hookInput as Record<string, unknown>
  );

  // Record event
  insertEvent({
    session_id: updatedState.session_id,
    timestamp: new Date().toISOString(),
    event_type: "prompt_submit",
    hook_input_json: JSON.stringify(redactedInput),
    git_head: gitHead,
    metadata_json: JSON.stringify({
      is_new_session: isNewSession,
      status_file_count: gitStatus.length,
      prompt_length: (hookInput.prompt ?? hookInput.prompt_content ?? "").length,
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
