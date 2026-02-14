/**
 * orca-record CLI Entry Point
 *
 * Command router for the ORCA recording layer.
 * Invoked by Claude Code hooks. All handlers exit 0.
 *
 * Commands:
 *   prompt-submit  -- UserPromptSubmit hook handler
 *   stop           -- Stop hook handler (transcript + checkpoint)
 *   pre-task       -- PreToolUse[Task] handler
 *   post-task      -- PostToolUse[Task] handler
 *   post-todo      -- PostToolUse[TodoWrite] handler
 *   status         -- Show current recording session status + shadow branch info
 *   checkpoints    -- List checkpoints for current/specified session
 *   rewind         -- Restore working directory to a checkpoint
 *   version        -- Print version and exit
 *
 * Exit behavior: ALWAYS exits 0. Hooks must never block Claude Code.
 */

import { execSync } from "child_process";
import { existsSync } from "fs";
import { handlePromptSubmit } from "./hooks/prompt-submit.js";
import { handleStop } from "./hooks/stop.js";
import { handlePreTask } from "./hooks/pre-task.js";
import { handlePostTask } from "./hooks/post-task.js";
import { handlePostTodo } from "./hooks/post-todo.js";
import { closeDb, initDb, getActiveSession } from "./storage/sqlite.js";
import { StateMachine } from "./state-machine.js";
import { SessionEvent } from "./types.js";
import { listCheckpoints } from "./git/rewind.js";
import { restoreCheckpoint } from "./git/rewind.js";
import { getShadowBranchInfo, getCurrentShadowBranch } from "./git/shadow-branch.js";
import { condense, condenseIfFilesTouched } from "./git/condensation.js";
import {
  installGitHooks,
  uninstallGitHooks,
  handlePrepareCommitMsg,
  handlePostCommit,
} from "./git/hooks.js";
import { findCheckpointForCommit, findCommitForCheckpoint, getSessionHistory } from "./git/linking.js";
import type { HookInput } from "./types.js";

const VERSION = "0.3.0";

async function main(): Promise<void> {
  const command = process.argv[2];

  if (!command) {
    console.log(`orca-record v${VERSION}`);
    console.log("Usage: orca-record <command> [options]");
    console.log("");
    console.log("Hook Commands:");
    console.log("  prompt-submit          UserPromptSubmit hook handler");
    console.log("  stop                   Stop hook handler");
    console.log("  pre-task               PreToolUse[Task] handler");
    console.log("  post-task              PostToolUse[Task] handler");
    console.log("  post-todo              PostToolUse[TodoWrite] handler");
    console.log("  prepare-commit-msg     Git prepare-commit-msg hook handler");
    console.log("  post-commit            Git post-commit hook handler");
    console.log("");
    console.log("User Commands:");
    console.log("  status                     Show recording session status + shadow branch");
    console.log("  checkpoints [--session ID] List checkpoints for current/specified session");
    console.log("  rewind <checkpoint-id>     Restore working directory to a checkpoint");
    console.log("  condense [--session ID]    Manually trigger condensation");
    console.log("  install-hooks              Install ORCA git hooks in current project");
    console.log("  uninstall-hooks            Remove ORCA git hooks");
    console.log("  link <commit-hash>         Show checkpoint linked to a commit");
    console.log("  link --checkpoint <id>     Show commit linked to a checkpoint");
    console.log("  history [range]            Show session history for commit range");
    console.log("  version                    Print version");
    return;
  }

  if (command === "version") {
    console.log(`orca-record v${VERSION}`);
    return;
  }

  // Check if we are in a git directory
  const gitDir = getGitDir();
  if (!gitDir) {
    // Not a git directory -- exit silently
    return;
  }

  const projectRoot = getProjectRoot(gitDir);
  if (!projectRoot) return;

  // Handle user-facing commands (no stdin needed)
  if (command === "status") {
    await handleStatus(gitDir, projectRoot);
    return;
  }

  if (command === "checkpoints") {
    await handleCheckpoints(gitDir, projectRoot);
    return;
  }

  if (command === "rewind") {
    const checkpointId = process.argv[3];
    if (!checkpointId) {
      console.error("Usage: orca-record rewind <checkpoint-id>");
      return;
    }
    await handleRewind(gitDir, projectRoot, checkpointId);
    return;
  }

  // Phase 3: Condensation + linking commands
  if (command === "condense") {
    await handleCondense(gitDir, projectRoot);
    return;
  }

  if (command === "install-hooks") {
    await handleInstallHooks(projectRoot);
    return;
  }

  if (command === "uninstall-hooks") {
    await handleUninstallHooks(projectRoot);
    return;
  }

  if (command === "link") {
    await handleLink(gitDir, projectRoot);
    return;
  }

  if (command === "history") {
    await handleHistory(gitDir, projectRoot);
    return;
  }

  // Phase 3: Git hook handlers (called by git hooks, no stdin)
  if (command === "prepare-commit-msg") {
    const msgFile = process.argv[3];
    const source = process.argv[4];
    const sha = process.argv[5];
    if (msgFile) {
      handlePrepareCommitMsg(msgFile, source, sha, projectRoot);
    }
    return;
  }

  if (command === "post-commit") {
    handlePostCommit(projectRoot);
    // Also trigger state machine transition
    const sm = new StateMachine(gitDir);
    const sessionState = sm.findActiveSession();
    if (sessionState) {
      sm.transition(sessionState, SessionEvent.GitCommit);
    }
    return;
  }

  // Read hook input from stdin
  const hookInput = await readStdinJson();

  // Route to handler
  switch (command) {
    case "prompt-submit":
      await handlePromptSubmit(hookInput, gitDir, projectRoot);
      break;
    case "stop":
      await handleStop(hookInput, gitDir, projectRoot);
      break;
    case "pre-task":
      await handlePreTask(hookInput, gitDir, projectRoot);
      break;
    case "post-task":
      await handlePostTask(hookInput, gitDir, projectRoot);
      break;
    case "post-todo":
      await handlePostTodo(hookInput, gitDir, projectRoot);
      break;
    default:
      // Unknown command -- exit silently
      break;
  }

  // Close database connection
  closeDb();
}

/**
 * Read JSON from stdin. Returns empty object if stdin is empty or invalid.
 */
async function readStdinJson(): Promise<HookInput> {
  try {
    // Check if stdin has data (non-TTY)
    if (process.stdin.isTTY) {
      return {};
    }

    const chunks: Buffer[] = [];
    for await (const chunk of process.stdin) {
      chunks.push(chunk as Buffer);
    }
    const raw = Buffer.concat(chunks).toString("utf-8").trim();
    if (!raw) return {};

    return JSON.parse(raw) as HookInput;
  } catch {
    return {};
  }
}

/**
 * Get the .git directory path. Returns null if not in a git repo.
 */
function getGitDir(): string | null {
  try {
    return execSync("git rev-parse --git-dir", {
      encoding: "utf-8",
      timeout: 3000,
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
  } catch {
    return null;
  }
}

/**
 * Get the project root from the git dir.
 */
function getProjectRoot(gitDir: string): string | null {
  try {
    return execSync("git rev-parse --show-toplevel", {
      encoding: "utf-8",
      timeout: 3000,
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
  } catch {
    return null;
  }
}

/**
 * Show current recording session status with shadow branch info.
 */
async function handleStatus(gitDir: string, projectRoot: string): Promise<void> {
  // Check state machine first (no DB needed)
  const sm = new StateMachine(gitDir);
  const sessionState = sm.findActiveSession();

  if (sessionState) {
    console.log(`Session: ${sessionState.session_id}`);
    console.log(`State: ${sessionState.state}`);
    console.log(`Started: ${sessionState.started_at}`);
    console.log(`Steps: ${sessionState.step_count}`);
    console.log(`Files touched: ${sessionState.files_touched.length}`);

    // Phase 2: Show shadow branch info
    if (sessionState.shadow_branch) {
      console.log(`Shadow branch: ${sessionState.shadow_branch}`);
      const branchInfo = getShadowBranchInfo(projectRoot, sessionState.shadow_branch);
      if (branchInfo) {
        console.log(`Checkpoints on branch: ${branchInfo.commitCount}`);
        if (branchInfo.latestCheckpointId) {
          console.log(`Latest checkpoint: ${branchInfo.latestCheckpointId}`);
        }
      }
    } else {
      console.log("Shadow branch: none");
    }
    return;
  }

  // Try database for historical sessions
  try {
    initDb(projectRoot);
    const dbSession = getActiveSession();
    if (dbSession) {
      console.log(`Session: ${dbSession.id}`);
      console.log(`State: ${dbSession.state}`);
      console.log(`Started: ${dbSession.started_at}`);
      console.log(`Steps: ${dbSession.step_count}`);
      if (dbSession.shadow_branch) {
        console.log(`Shadow branch: ${dbSession.shadow_branch}`);
      }
    } else {
      console.log("No active recording session.");
    }
    closeDb();
  } catch {
    console.log("No active recording session.");
  }
}

/**
 * List checkpoints for current or specified session.
 */
async function handleCheckpoints(gitDir: string, projectRoot: string): Promise<void> {
  // Parse --session flag
  let sessionId: string | undefined;
  const args = process.argv.slice(3);
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--session" && args[i + 1]) {
      sessionId = args[i + 1];
      break;
    }
  }

  // If no session specified, find active session
  if (!sessionId) {
    const sm = new StateMachine(gitDir);
    const activeSession = sm.findActiveSession();
    sessionId = activeSession?.session_id;
  }

  const checkpoints = listCheckpoints(projectRoot, sessionId);

  if (checkpoints.length === 0) {
    console.log("No checkpoints found.");
    if (!sessionId) {
      console.log("Hint: No active session. Specify --session <id> to query a specific session.");
    }
    return;
  }

  console.log(`Checkpoints for session ${sessionId ?? "(current)"}:`);
  console.log("");

  for (let i = 0; i < checkpoints.length; i++) {
    const cp = checkpoints[i];
    const num = `[${i + 1}]`;
    const typeTag = cp.type === "task" ? " (task)" : "";
    const files = `+${cp.filesNew} ~${cp.filesModified} -${cp.filesDeleted}`;

    console.log(`${num} ${cp.checkpointId}${typeTag}`);
    console.log(`    Time: ${cp.timestamp}`);
    if (cp.promptSummary) {
      console.log(`    Prompt: ${cp.promptSummary}`);
    }
    console.log(`    Files: ${files}`);
    console.log("");
  }

  console.log(`Total: ${checkpoints.length} checkpoint(s)`);
}

/**
 * Restore working directory to a specific checkpoint.
 */
async function handleRewind(
  gitDir: string,
  projectRoot: string,
  checkpointId: string
): Promise<void> {
  console.log(`Rewinding to checkpoint ${checkpointId}...`);

  const result = restoreCheckpoint(projectRoot, checkpointId);

  if (!result) {
    console.error(`Failed to restore checkpoint ${checkpointId}.`);
    console.error("The checkpoint may not exist on the current shadow branch.");
    return;
  }

  console.log(`Restored to checkpoint ${result.checkpointId}`);
  console.log(`Commit: ${result.commitHash}`);
  console.log("");

  if (result.filesCreated.length > 0) {
    console.log(`Created (${result.filesCreated.length}):`);
    for (const f of result.filesCreated.slice(0, 20)) {
      console.log(`  + ${f}`);
    }
    if (result.filesCreated.length > 20) {
      console.log(`  ... and ${result.filesCreated.length - 20} more`);
    }
  }

  if (result.filesModified.length > 0) {
    console.log(`Restored (${result.filesModified.length}):`);
    for (const f of result.filesModified.slice(0, 20)) {
      console.log(`  ~ ${f}`);
    }
    if (result.filesModified.length > 20) {
      console.log(`  ... and ${result.filesModified.length - 20} more`);
    }
  }

  if (result.filesDeleted.length > 0) {
    console.log(`Deleted (${result.filesDeleted.length}):`);
    for (const f of result.filesDeleted.slice(0, 20)) {
      console.log(`  - ${f}`);
    }
    if (result.filesDeleted.length > 20) {
      console.log(`  ... and ${result.filesDeleted.length - 20} more`);
    }
  }

  const total =
    result.filesCreated.length +
    result.filesModified.length +
    result.filesDeleted.length;
  console.log("");
  console.log(`Total files affected: ${total}`);
}

// ============================================================================
// PHASE 3: CONDENSATION + LINKING HANDLERS
// ============================================================================

/**
 * Manual condensation trigger.
 */
async function handleCondense(gitDir: string, projectRoot: string): Promise<void> {
  // Parse --session flag
  let sessionId: string | undefined;
  const args = process.argv.slice(3);
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--session" && args[i + 1]) {
      sessionId = args[i + 1];
      break;
    }
  }

  // Find session
  if (!sessionId) {
    const sm = new StateMachine(gitDir);
    const activeSession = sm.findActiveSession();
    sessionId = activeSession?.session_id;
  }

  if (!sessionId) {
    console.error("No active session. Specify --session <id>.");
    return;
  }

  // Get current HEAD as the user commit hash
  let userCommitHash: string;
  try {
    userCommitHash = execSync("git rev-parse HEAD", {
      cwd: projectRoot,
      encoding: "utf-8",
      timeout: 5000,
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
  } catch {
    console.error("Failed to get HEAD commit hash.");
    return;
  }

  initDb(projectRoot);

  console.log(`Condensing session ${sessionId}...`);
  const result = condense(projectRoot, sessionId, userCommitHash);

  if (!result) {
    console.error("Condensation failed or no checkpoints found.");
    console.error("Shadow branch may not exist or session has no checkpoints.");
    return;
  }

  console.log(`Condensed ${result.checkpointsCondensed} checkpoint(s)`);
  console.log(`Orphan commit: ${result.orphanCommitHash}`);
  console.log(`Shadow branch deleted: ${result.shadowBranchDeleted}`);
  closeDb();
}

/**
 * Install ORCA git hooks.
 */
async function handleInstallHooks(projectRoot: string): Promise<void> {
  console.log("Installing ORCA git hooks...");
  const results = installGitHooks(projectRoot);

  for (const result of results) {
    if (result.installed) {
      const backupNote = result.backedUp
        ? ` (original backed up to ${result.backupPath})`
        : "";
      console.log(`  ${result.hookName}: installed${backupNote}`);
    } else {
      console.log(`  ${result.hookName}: FAILED - ${result.error}`);
    }
  }

  const installed = results.filter((r) => r.installed).length;
  console.log(`\n${installed}/${results.length} hooks installed.`);
}

/**
 * Uninstall ORCA git hooks.
 */
async function handleUninstallHooks(projectRoot: string): Promise<void> {
  console.log("Uninstalling ORCA git hooks...");
  const results = uninstallGitHooks(projectRoot);

  for (const result of results) {
    if (!result.error) {
      console.log(`  ${result.hookName}: removed`);
    } else {
      console.log(`  ${result.hookName}: ${result.error}`);
    }
  }

  console.log("Done.");
}

/**
 * Link a commit to a checkpoint or vice versa.
 */
async function handleLink(gitDir: string, projectRoot: string): Promise<void> {
  const args = process.argv.slice(3);

  initDb(projectRoot);

  // Check for --checkpoint flag
  const cpIdx = args.indexOf("--checkpoint");
  if (cpIdx !== -1 && args[cpIdx + 1]) {
    const checkpointId = args[cpIdx + 1];
    const result = findCommitForCheckpoint(projectRoot, checkpointId);

    if (!result) {
      console.log(`No commit found for checkpoint ${checkpointId}.`);
      closeDb();
      return;
    }

    console.log(`Checkpoint: ${result.checkpointId}`);
    console.log(`Commit: ${result.commitHash}`);
    console.log(`Session: ${result.sessionId}`);
    console.log(`Source: ${result.source}`);
    if (result.metadata?.promptSummary) {
      console.log(`Prompt: ${result.metadata.promptSummary}`);
    }
    closeDb();
    return;
  }

  // Otherwise, first arg is commit hash
  const commitHash = args[0];
  if (!commitHash) {
    console.error("Usage: orca-record link <commit-hash>");
    console.error("       orca-record link --checkpoint <id>");
    closeDb();
    return;
  }

  const result = findCheckpointForCommit(projectRoot, commitHash);

  if (!result) {
    console.log(`No checkpoint found for commit ${commitHash}.`);
    closeDb();
    return;
  }

  console.log(`Commit: ${result.commitHash}`);
  console.log(`Checkpoint: ${result.checkpointId}`);
  console.log(`Session: ${result.sessionId}`);
  console.log(`Source: ${result.source}`);
  if (result.metadata?.promptSummary) {
    console.log(`Prompt: ${result.metadata.promptSummary}`);
  }
  if (result.metadata?.files) {
    const f = result.metadata.files;
    console.log(`Files: +${f.new.length} ~${f.modified.length} -${f.deleted.length}`);
  }
  closeDb();
}

/**
 * Show session history for a commit range.
 */
async function handleHistory(gitDir: string, projectRoot: string): Promise<void> {
  const range = process.argv[3]; // Optional commit range

  initDb(projectRoot);

  const history = getSessionHistory(projectRoot, range);

  if (history.length === 0) {
    console.log("No ORCA-linked commits found in range.");
    closeDb();
    return;
  }

  console.log("Session History:");
  console.log("");

  for (const entry of history) {
    const files = `+${entry.filesNew} ~${entry.filesModified} -${entry.filesDeleted}`;
    console.log(`${entry.commitHash.slice(0, 8)} ${entry.commitMessage}`);
    console.log(`  Checkpoint: ${entry.checkpointId}`);
    console.log(`  Session: ${entry.sessionId}`);
    if (entry.promptSummary) {
      console.log(`  Prompt: ${entry.promptSummary.slice(0, 100)}`);
    }
    console.log(`  Files: ${files}`);
    console.log("");
  }

  console.log(`Total: ${history.length} linked commit(s)`);
  closeDb();
}

// ============================================================================
// ENTRY POINT
// ============================================================================

// Wrap everything in try/catch -- hooks must NEVER throw, NEVER exit non-zero
main().catch(() => {
  // Swallow all errors. Exit 0.
});
