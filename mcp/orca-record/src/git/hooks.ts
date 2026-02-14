/**
 * Git Hook Installation
 *
 * Installs prepare-commit-msg and post-commit hooks that integrate
 * ORCA recording with the user's git workflow.
 *
 * Hooks chain with existing hooks (never clobber):
 *   - If an existing hook exists, it's backed up to <hook>.pre-orca
 *   - New hook calls original first, then ORCA handler
 *   - Uninstall restores originals from backup
 *
 * Marker file: .git/orca-hooks-installed tracks installation state.
 */

import {
  existsSync,
  readFileSync,
  writeFileSync,
  renameSync,
  unlinkSync,
  chmodSync,
  mkdirSync,
  readdirSync,
} from "fs";
import { join } from "path";
import { execSync } from "child_process";
import type { HookInstallResult } from "../types.js";

const MARKER_FILE = "orca-hooks-installed";

// Which hooks we manage
const MANAGED_HOOKS = ["prepare-commit-msg", "post-commit"] as const;
type ManagedHook = (typeof MANAGED_HOOKS)[number];

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Install ORCA git hooks in the project.
 *
 * For each managed hook:
 *   1. Back up existing hook to <hook>.pre-orca
 *   2. Write new hook that chains original + orca-record handler
 *   3. Make executable
 *   4. Record in marker file
 *
 * Returns results for each hook installed.
 */
export function installGitHooks(cwd: string): HookInstallResult[] {
  const hooksDir = getHooksDir(cwd);
  if (!hooksDir) return [];

  // Ensure hooks directory exists
  if (!existsSync(hooksDir)) {
    try {
      mkdirSync(hooksDir, { recursive: true });
    } catch {
      return [];
    }
  }

  const results: HookInstallResult[] = [];

  for (const hookName of MANAGED_HOOKS) {
    const result = installSingleHook(hooksDir, hookName, cwd);
    results.push(result);
  }

  // Write marker file
  const gitDir = getGitDir(cwd);
  if (gitDir) {
    const markerPath = join(gitDir, MARKER_FILE);
    const markerData = {
      installed_at: new Date().toISOString(),
      hooks: results
        .filter((r) => r.installed)
        .map((r) => r.hookName),
    };
    try {
      writeFileSync(markerPath, JSON.stringify(markerData, null, 2), "utf-8");
    } catch {
      // Non-critical
    }
  }

  return results;
}

/**
 * Uninstall ORCA git hooks, restoring originals from backup.
 */
export function uninstallGitHooks(cwd: string): HookInstallResult[] {
  const hooksDir = getHooksDir(cwd);
  if (!hooksDir) return [];

  const results: HookInstallResult[] = [];

  for (const hookName of MANAGED_HOOKS) {
    const result = uninstallSingleHook(hooksDir, hookName);
    results.push(result);
  }

  // Remove marker file
  const gitDir = getGitDir(cwd);
  if (gitDir) {
    const markerPath = join(gitDir, MARKER_FILE);
    try {
      if (existsSync(markerPath)) unlinkSync(markerPath);
    } catch {
      // Non-critical
    }
  }

  return results;
}

/**
 * Check if ORCA hooks are installed.
 */
export function areHooksInstalled(cwd: string): boolean {
  const gitDir = getGitDir(cwd);
  if (!gitDir) return false;
  return existsSync(join(gitDir, MARKER_FILE));
}

/**
 * Handle prepare-commit-msg: inject ORCA-Checkpoint trailer into commit message.
 * Called by the git hook. MUST be fast (< 100ms).
 *
 * @param msgFile Path to the commit message file ($1)
 * @param source  Commit source: "message", "template", "merge", "squash", "commit" ($2)
 * @param sha     SHA for amend commits ($3)
 * @param cwd     Project root
 */
export function handlePrepareCommitMsg(
  msgFile: string,
  source: string | undefined,
  sha: string | undefined,
  cwd: string
): void {
  // Skip merge, squash, and amend commits
  if (source === "merge" || source === "squash" || source === "commit") {
    return;
  }

  // Find active session's latest checkpoint
  const checkpointId = findLatestCheckpointId(cwd);
  if (!checkpointId) return;

  // Read current commit message
  let message: string;
  try {
    message = readFileSync(msgFile, "utf-8");
  } catch {
    return;
  }

  // Don't add duplicate trailer
  if (message.includes("ORCA-Checkpoint:")) return;

  // Inject trailer
  // Trailers go after a blank line following the message body
  const trimmed = message.trimEnd();
  const modified = trimmed + "\n\nORCA-Checkpoint: " + checkpointId + "\n";

  try {
    writeFileSync(msgFile, modified, "utf-8");
  } catch {
    // Non-critical -- commit proceeds without trailer
  }
}

/**
 * Handle post-commit: trigger condensation or state transition.
 * Called by the git hook. Can take up to 1s.
 *
 * @param cwd Project root
 */
export function handlePostCommit(cwd: string): void {
  // Get the just-created commit hash
  let commitHash: string;
  try {
    commitHash = execSync("git rev-parse HEAD", {
      cwd,
      encoding: "utf-8",
      timeout: 5000,
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
  } catch {
    return;
  }

  if (!commitHash) return;

  // Find active session via state machine
  const gitDir = getGitDir(cwd);
  if (!gitDir) return;

  // Import dynamically to avoid circular deps at module level
  // State machine + condensation are handled by the CLI commands
  // The post-commit hook just signals by writing a marker
  const postCommitMarker = join(gitDir, "orca-post-commit-pending");
  try {
    writeFileSync(
      postCommitMarker,
      JSON.stringify({
        commit_hash: commitHash,
        timestamp: new Date().toISOString(),
      }),
      "utf-8"
    );
  } catch {
    // Non-critical
  }
}

// ============================================================================
// INTERNAL
// ============================================================================

/**
 * Install a single git hook with chaining.
 */
function installSingleHook(
  hooksDir: string,
  hookName: ManagedHook,
  cwd: string
): HookInstallResult {
  const hookPath = join(hooksDir, hookName);
  const backupPath = join(hooksDir, `${hookName}.pre-orca`);
  let backedUp = false;

  // Back up existing hook
  if (existsSync(hookPath)) {
    // Check if it's already an ORCA hook
    try {
      const content = readFileSync(hookPath, "utf-8");
      if (content.includes("# ORCA-RECORD HOOK")) {
        // Already installed -- skip
        return {
          hookName,
          installed: true,
          backedUp: false,
          backupPath: null,
          error: null,
        };
      }
    } catch {
      // Can't read, try to back up anyway
    }

    try {
      renameSync(hookPath, backupPath);
      backedUp = true;
    } catch (err) {
      return {
        hookName,
        installed: false,
        backedUp: false,
        backupPath: null,
        error: `Failed to back up existing hook: ${err}`,
      };
    }
  }

  // Determine orca-record binary path
  const orcaBin = findOrcaRecordBin();

  // Write new hook
  const hookContent = generateHookScript(hookName, orcaBin, backedUp ? backupPath : null);

  try {
    writeFileSync(hookPath, hookContent, "utf-8");
    chmodSync(hookPath, 0o755);
  } catch (err) {
    // Restore backup on failure
    if (backedUp) {
      try {
        renameSync(backupPath, hookPath);
      } catch {
        // Double failure -- leave backup
      }
    }
    return {
      hookName,
      installed: false,
      backedUp,
      backupPath: backedUp ? backupPath : null,
      error: `Failed to write hook: ${err}`,
    };
  }

  return {
    hookName,
    installed: true,
    backedUp,
    backupPath: backedUp ? backupPath : null,
    error: null,
  };
}

/**
 * Uninstall a single hook and restore backup.
 */
function uninstallSingleHook(
  hooksDir: string,
  hookName: ManagedHook
): HookInstallResult {
  const hookPath = join(hooksDir, hookName);
  const backupPath = join(hooksDir, `${hookName}.pre-orca`);

  // Check if current hook is an ORCA hook
  if (existsSync(hookPath)) {
    try {
      const content = readFileSync(hookPath, "utf-8");
      if (!content.includes("# ORCA-RECORD HOOK")) {
        // Not our hook -- don't touch it
        return {
          hookName,
          installed: false,
          backedUp: false,
          backupPath: null,
          error: "Hook is not an ORCA hook, skipping",
        };
      }
    } catch {
      // Can't read
    }
  }

  // Remove ORCA hook
  try {
    if (existsSync(hookPath)) unlinkSync(hookPath);
  } catch (err) {
    return {
      hookName,
      installed: false,
      backedUp: false,
      backupPath: null,
      error: `Failed to remove hook: ${err}`,
    };
  }

  // Restore backup
  if (existsSync(backupPath)) {
    try {
      renameSync(backupPath, hookPath);
      return {
        hookName,
        installed: false,
        backedUp: false,
        backupPath: null,
        error: null,
      };
    } catch (err) {
      return {
        hookName,
        installed: false,
        backedUp: true,
        backupPath,
        error: `Hook removed but failed to restore backup: ${err}`,
      };
    }
  }

  return {
    hookName,
    installed: false,
    backedUp: false,
    backupPath: null,
    error: null,
  };
}

/**
 * Generate the shell script content for a git hook.
 */
function generateHookScript(
  hookName: ManagedHook,
  orcaBin: string,
  backupPath: string | null
): string {
  const lines: string[] = [
    "#!/bin/sh",
    "# ORCA-RECORD HOOK -- auto-generated, do not edit manually",
    `# Installed: ${new Date().toISOString()}`,
    "",
  ];

  // Chain with original hook if backup exists
  if (backupPath) {
    lines.push(
      "# Run original hook first",
      `if [ -x "${backupPath}" ]; then`,
      `  "${backupPath}" "$@"`,
      `  ORIG_EXIT=$?`,
      `  if [ $ORIG_EXIT -ne 0 ]; then`,
      `    exit $ORIG_EXIT`,
      `  fi`,
      `fi`,
      ""
    );
  }

  // Add ORCA handler
  if (hookName === "prepare-commit-msg") {
    lines.push(
      "# ORCA: inject checkpoint trailer",
      `if command -v "${orcaBin}" >/dev/null 2>&1; then`,
      `  "${orcaBin}" prepare-commit-msg "$1" "$2" "$3" 2>/dev/null || true`,
      `fi`,
    );
  } else if (hookName === "post-commit") {
    lines.push(
      "# ORCA: signal post-commit for condensation",
      `if command -v "${orcaBin}" >/dev/null 2>&1; then`,
      `  "${orcaBin}" post-commit 2>/dev/null || true`,
      `fi`,
    );
  }

  lines.push("");
  return lines.join("\n");
}

/**
 * Find the orca-record binary. Checks known locations.
 */
function findOrcaRecordBin(): string {
  const homeDir = process.env.HOME ?? "";
  const knownPaths = [
    join(homeDir, ".claude", "bin", "orca-record"),
    "orca-record", // fallback to PATH
  ];

  for (const p of knownPaths) {
    if (p && existsSync(p)) return p;
  }

  // Default to the expected deployment location
  return join(homeDir, ".claude", "bin", "orca-record");
}

/**
 * Find the latest checkpoint ID from the active session.
 * Must be fast (< 50ms) since this runs during git commit.
 */
function findLatestCheckpointId(cwd: string): string | null {
  const gitDir = getGitDir(cwd);
  if (!gitDir) return null;

  // Read state machine files to find active session
  const sessionsDir = join(gitDir, "orca-sessions");
  if (!existsSync(sessionsDir)) return null;

  try {
    // Find most recent session file
    const files = readdirSync(sessionsDir)
      .filter((f) => f.toString().endsWith(".json"))
      .sort()
      .reverse();

    for (const file of files) {
      try {
        const raw = readFileSync(join(sessionsDir, file), "utf-8");
        const state = JSON.parse(raw);
        if (state.state === "ACTIVE" || state.state === "ACTIVE_COMMITTED") {
          // Found active session -- now find latest checkpoint from shadow branch
          if (state.shadow_branch) {
            return findLatestCheckpointFromBranch(cwd, state.shadow_branch);
          }
          return null;
        }
      } catch {
        continue;
      }
    }
  } catch {
    return null;
  }

  return null;
}

/**
 * Get the latest checkpoint ID from a shadow branch.
 * Reads the tip commit's trailers.
 */
function findLatestCheckpointFromBranch(
  cwd: string,
  branchName: string
): string | null {
  try {
    const msg = execSync(
      `git log -1 --format="%B" refs/heads/${branchName}`,
      {
        cwd,
        encoding: "utf-8",
        timeout: 3000,
        stdio: ["pipe", "pipe", "pipe"],
      }
    );

    const match = msg.match(/^ORCA-Checkpoint:\s*(\S+)$/m);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

/**
 * Get the .git directory path.
 */
function getGitDir(cwd: string): string | null {
  try {
    return execSync("git rev-parse --git-dir", {
      cwd,
      encoding: "utf-8",
      timeout: 3000,
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
  } catch {
    return null;
  }
}

/**
 * Get the hooks directory path.
 */
function getHooksDir(cwd: string): string | null {
  try {
    // Respect core.hooksPath configuration
    const hooksPath = execSync("git config --get core.hooksPath", {
      cwd,
      encoding: "utf-8",
      timeout: 3000,
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();

    if (hooksPath) return hooksPath;
  } catch {
    // No custom hooksPath configured
  }

  const gitDir = getGitDir(cwd);
  if (!gitDir) return null;
  return join(gitDir, "hooks");
}
