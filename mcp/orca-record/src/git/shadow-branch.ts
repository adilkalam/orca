/**
 * Shadow Branch Management
 *
 * Shadow branches store checkpoint commits alongside the user's working tree.
 * Named: orca/<HEAD[:7]>-<worktreeHash[:6]> (matches Entire convention).
 *
 * Each checkpoint commit on the shadow branch contains:
 *   - Full working tree snapshot (code at that point)
 *   - .orca/sessions/<session-id>/ metadata directory
 *   - Commit trailers: ORCA-Session, ORCA-Checkpoint
 *
 * Shadow branches are ephemeral -- they exist only during a recording session.
 * Phase 3 condenses them to permanent storage on the orphan branch.
 */

import { execSync } from "child_process";
import {
  writeTree,
  commitTree,
  updateRef,
  getHead,
  getWorktreeHash,
  resolveRef,
  refExists,
  deleteRef,
} from "./plumbing.js";
import type { ShadowBranchMetadata, CheckpointManifest } from "../types.js";

/**
 * Derive the shadow branch name from current HEAD and worktree state.
 * Format: orca/<HEAD[:7]>-<worktreeHash[:6]>
 */
export function deriveShadowBranchName(cwd: string): string | null {
  const head = getHead(cwd);
  if (!head) return null;

  const wtHash = getWorktreeHash(cwd);
  const wtSuffix = wtHash ? wtHash.slice(0, 6) : "000000";

  return `orca/${head.slice(0, 7)}-${wtSuffix}`;
}

/**
 * Create a new shadow branch for a recording session.
 * The initial commit captures the current working tree state.
 *
 * Returns the shadow branch name, or null on failure.
 */
export function createShadowBranch(
  cwd: string,
  sessionId: string
): string | null {
  const head = getHead(cwd);
  if (!head) return null;

  const branchName = deriveShadowBranchName(cwd);
  if (!branchName) return null;

  // If branch already exists, reuse it
  if (refExists(cwd, branchName)) {
    return branchName;
  }

  // Create initial commit: current worktree as tree, HEAD as parent
  const treeHash = writeTree(cwd);
  if (!treeHash) return null;

  const commitHash = commitTree(cwd, treeHash, {
    parentHash: head,
    message: `orca: session ${sessionId} started`,
    trailers: {
      "ORCA-Session": sessionId,
      "ORCA-Type": "session-start",
    },
  });

  if (!commitHash) return null;

  // Create the branch ref
  const created = updateRef(cwd, branchName, commitHash);
  if (!created) return null;

  return branchName;
}

/**
 * Create a checkpoint commit on the shadow branch.
 *
 * The commit contains:
 *   1. Current working tree snapshot (all files)
 *   2. Metadata in commit message trailers
 *
 * Note: .orca/sessions/ metadata blobs are stored as part of the tree
 * via temporary files written before write-tree and cleaned up after.
 * For Phase 2, we store metadata in trailers and SQLite.
 * Phase 3 will add tree-embedded metadata blobs.
 *
 * Returns the commit hash, or null on failure.
 */
export function createCheckpointCommit(
  cwd: string,
  sessionId: string,
  checkpointId: string,
  metadata: {
    type: "session" | "task";
    promptSummary?: string | null;
    filesModified?: string[];
    filesNew?: string[];
    filesDeleted?: string[];
  }
): string | null {
  // Get the current shadow branch
  const branchName = getShadowBranchForSession(cwd, sessionId);
  if (!branchName) return null;

  // Get parent commit (tip of shadow branch)
  const parentHash = resolveRef(cwd, branchName);
  if (!parentHash) return null;

  // Capture current working tree
  const treeHash = writeTree(cwd);
  if (!treeHash) return null;

  // Build commit message
  const typeLabel = metadata.type === "session" ? "turn" : "task";
  const summary = metadata.promptSummary
    ? `: ${metadata.promptSummary.slice(0, 80)}`
    : "";
  const message = `orca: ${typeLabel} checkpoint${summary}`;

  // Build trailers
  const trailers: Record<string, string> = {
    "ORCA-Session": sessionId,
    "ORCA-Checkpoint": checkpointId,
    "ORCA-Type": metadata.type,
  };

  // Add file change counts to trailers
  const modCount = metadata.filesModified?.length ?? 0;
  const newCount = metadata.filesNew?.length ?? 0;
  const delCount = metadata.filesDeleted?.length ?? 0;
  if (modCount + newCount + delCount > 0) {
    trailers["ORCA-Files"] = `+${newCount} ~${modCount} -${delCount}`;
  }

  // Create commit
  const commitHash = commitTree(cwd, treeHash, {
    parentHash,
    message,
    trailers,
  });

  if (!commitHash) return null;

  // Advance shadow branch to new commit
  updateRef(cwd, branchName, commitHash);

  return commitHash;
}

/**
 * Find the shadow branch name for a session.
 * Searches for branches matching orca/* pattern and checks commit trailers
 * for the session ID.
 *
 * Returns the branch name, or null if not found.
 */
export function getShadowBranchForSession(
  cwd: string,
  sessionId: string
): string | null {
  try {
    // List all orca/* branches
    const output = execSync("git for-each-ref --format='%(refname:short)' refs/heads/orca/", {
      cwd,
      encoding: "utf-8",
      timeout: 5000,
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();

    if (!output) return null;

    const branches = output.split("\n").filter(Boolean);

    // Check each branch for our session ID in the latest commit
    for (const branch of branches) {
      try {
        const msg = execSync(`git log -1 --format="%B" refs/heads/${branch}`, {
          cwd,
          encoding: "utf-8",
          timeout: 5000,
          stdio: ["pipe", "pipe", "pipe"],
        });

        if (msg.includes(`ORCA-Session: ${sessionId}`)) {
          return branch;
        }
      } catch {
        continue;
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Migrate a shadow branch when HEAD changes (pull, rebase, amend).
 * Renames: orca/<old[:7]>-<wt> -> orca/<new[:7]>-<wt>
 *
 * Returns the new branch name, or null on failure.
 */
export function migrateShadowBranch(
  cwd: string,
  oldBranchName: string
): string | null {
  // Get the new branch name from current HEAD
  const newBranchName = deriveShadowBranchName(cwd);
  if (!newBranchName) return null;

  // If names are the same, no migration needed
  if (oldBranchName === newBranchName) return oldBranchName;

  // Get the commit the old branch points to
  const commitHash = resolveRef(cwd, oldBranchName);
  if (!commitHash) return null;

  // Create new ref pointing to same commit
  const created = updateRef(cwd, newBranchName, commitHash);
  if (!created) return null;

  // Delete old ref
  deleteRef(cwd, oldBranchName);

  return newBranchName;
}

/**
 * Delete a shadow branch (cleanup after condensation).
 * Returns true if deleted, false if branch didn't exist or deletion failed.
 */
export function deleteShadowBranch(
  cwd: string,
  branchName: string
): boolean {
  return deleteRef(cwd, branchName);
}

/**
 * Get the current shadow branch name based on HEAD state.
 * Does NOT search by session -- just derives from current HEAD.
 */
export function getCurrentShadowBranch(cwd: string): string | null {
  const name = deriveShadowBranchName(cwd);
  if (!name) return null;
  return refExists(cwd, name) ? name : null;
}

/**
 * Get metadata about the shadow branch (commit count, latest checkpoint).
 */
export function getShadowBranchInfo(
  cwd: string,
  branchName: string
): ShadowBranchMetadata | null {
  if (!refExists(cwd, branchName)) return null;

  try {
    // Count commits on the shadow branch
    const countOutput = execSync(
      `git rev-list --count refs/heads/${branchName}`,
      {
        cwd,
        encoding: "utf-8",
        timeout: 5000,
        stdio: ["pipe", "pipe", "pipe"],
      }
    ).trim();

    const commitCount = parseInt(countOutput, 10) || 0;

    // Get the latest commit info
    const latestMsg = execSync(
      `git log -1 --format="%B" refs/heads/${branchName}`,
      {
        cwd,
        encoding: "utf-8",
        timeout: 5000,
        stdio: ["pipe", "pipe", "pipe"],
      }
    ).trim();

    // Parse latest checkpoint ID from trailers
    const checkpointMatch = latestMsg.match(/ORCA-Checkpoint:\s*(\S+)/);
    const sessionMatch = latestMsg.match(/ORCA-Session:\s*(\S+)/);

    return {
      branchName,
      commitCount,
      latestCheckpointId: checkpointMatch?.[1] ?? null,
      sessionId: sessionMatch?.[1] ?? null,
    };
  } catch {
    return null;
  }
}
