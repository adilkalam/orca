/**
 * Rewind Operations
 *
 * List checkpoints on the shadow branch and restore code state
 * to any checkpoint. This is the user-facing "undo" capability.
 *
 * Checkpoint listing:
 *   - Walk shadow branch commit log
 *   - Parse ORCA-Checkpoint trailer from each commit
 *   - Enrich with SQLite data (files touched, prompt summary, etc.)
 *
 * Restore:
 *   - Read tree from checkpoint commit into index
 *   - Write index to working directory
 *   - Report files changed (new, modified, deleted)
 */

import { execSync } from "child_process";
import { existsSync, unlinkSync } from "fs";
import { join } from "path";
import {
  logRef,
  getCommitMessage,
  readTree,
  checkoutIndex,
  listTree,
  showFile,
  resolveRef,
} from "./plumbing.js";
import { getShadowBranchForSession, getCurrentShadowBranch } from "./shadow-branch.js";
import type { CheckpointInfo } from "../types.js";

/**
 * List all checkpoints on the shadow branch for a session.
 *
 * Walks the commit log and extracts checkpoint metadata from
 * commit message trailers.
 *
 * Returns checkpoints in chronological order (oldest first).
 */
export function listCheckpoints(
  cwd: string,
  sessionId?: string
): CheckpointInfo[] {
  // Find the shadow branch
  let branchName: string | null = null;

  if (sessionId) {
    branchName = getShadowBranchForSession(cwd, sessionId);
  } else {
    branchName = getCurrentShadowBranch(cwd);
  }

  if (!branchName) return [];

  // Get commit log
  const commits = logRef(cwd, branchName, 200);
  if (commits.length === 0) return [];

  const checkpoints: CheckpointInfo[] = [];

  for (const commit of commits) {
    // Get full commit message for trailer parsing
    const fullMessage = getCommitMessage(cwd, commit.hash);
    if (!fullMessage) continue;

    // Parse trailers
    const checkpointId = parseTrailer(fullMessage, "ORCA-Checkpoint");
    if (!checkpointId) continue; // Skip non-checkpoint commits (e.g., session-start)

    const checkpointSessionId = parseTrailer(fullMessage, "ORCA-Session");
    const type = parseTrailer(fullMessage, "ORCA-Type") as "session" | "task" | null;
    const filesInfo = parseTrailer(fullMessage, "ORCA-Files");

    // Parse file counts from ORCA-Files trailer: "+N ~N -N"
    let filesNew = 0;
    let filesModified = 0;
    let filesDeleted = 0;
    if (filesInfo) {
      const match = filesInfo.match(/\+(\d+)\s+~(\d+)\s+-(\d+)/);
      if (match) {
        filesNew = parseInt(match[1], 10);
        filesModified = parseInt(match[2], 10);
        filesDeleted = parseInt(match[3], 10);
      }
    }

    // Extract prompt summary from commit message (first line after "orca: ")
    const firstLine = fullMessage.split("\n")[0] ?? "";
    const summaryMatch = firstLine.match(/orca:\s+\w+\s+checkpoint:?\s*(.*)/);
    const promptSummary = summaryMatch?.[1]?.trim() || null;

    checkpoints.push({
      checkpointId,
      sessionId: checkpointSessionId ?? sessionId ?? "unknown",
      commitHash: commit.hash,
      timestamp: commit.timestamp,
      type: type ?? "session",
      promptSummary,
      filesNew,
      filesModified,
      filesDeleted,
      // Phase 4 placeholders
      qualityScore: null,
      cognitiveContext: null,
    });
  }

  // Return in chronological order (commits come newest-first from logRef)
  return checkpoints.reverse();
}

/**
 * Restore the working directory to the state at a specific checkpoint.
 *
 * Process:
 *   1. Find the commit on the shadow branch with matching checkpoint ID
 *   2. Read that commit's tree into the index
 *   3. Write the index to the working directory
 *   4. Handle file deletions (files in current tree but not in checkpoint)
 *   5. Return list of files restored
 *
 * Returns null on failure, or a RestoreResult on success.
 */
export function restoreCheckpoint(
  cwd: string,
  checkpointId: string,
  sessionId?: string
): RestoreResult | null {
  // Find the commit for this checkpoint
  const commitHash = findCheckpointCommit(cwd, checkpointId, sessionId);
  if (!commitHash) return null;

  // Get list of files before restore (for detecting deletions)
  const filesBefore = getWorkingTreeFiles(cwd);

  // Get list of files in the checkpoint commit
  const filesInCheckpoint = new Set(listTree(cwd, commitHash));

  // Read the checkpoint tree into the index
  if (!readTree(cwd, commitHash)) return null;

  // Write index to working directory
  if (!checkoutIndex(cwd)) return null;

  // Handle deletions: files that exist now but not in checkpoint
  const filesDeleted: string[] = [];
  for (const file of filesBefore) {
    // Skip .orca/ metadata files and .git/
    if (file.startsWith(".orca/") || file.startsWith(".git/")) continue;

    if (!filesInCheckpoint.has(file)) {
      const fullPath = join(cwd, file);
      try {
        if (existsSync(fullPath)) {
          unlinkSync(fullPath);
          filesDeleted.push(file);
        }
      } catch {
        // Best effort deletion
      }
    }
  }

  // Determine which files were created or modified
  const filesRestored: string[] = [];
  const filesCreated: string[] = [];
  const filesModified: string[] = [];

  for (const file of filesInCheckpoint) {
    // Skip metadata files
    if (file.startsWith(".orca/")) continue;

    if (!filesBefore.includes(file)) {
      filesCreated.push(file);
    } else {
      filesModified.push(file);
    }
    filesRestored.push(file);
  }

  return {
    checkpointId,
    commitHash,
    filesRestored,
    filesCreated,
    filesModified,
    filesDeleted,
  };
}

/**
 * Get metadata for a specific checkpoint from the shadow branch.
 */
export function getCheckpointMetadata(
  cwd: string,
  checkpointId: string,
  sessionId?: string
): CheckpointInfo | null {
  const commitHash = findCheckpointCommit(cwd, checkpointId, sessionId);
  if (!commitHash) return null;

  const fullMessage = getCommitMessage(cwd, commitHash);
  if (!fullMessage) return null;

  const checkpointSessionId = parseTrailer(fullMessage, "ORCA-Session");
  const type = parseTrailer(fullMessage, "ORCA-Type") as "session" | "task" | null;
  const filesInfo = parseTrailer(fullMessage, "ORCA-Files");

  let filesNew = 0;
  let filesModified = 0;
  let filesDeleted = 0;
  if (filesInfo) {
    const match = filesInfo.match(/\+(\d+)\s+~(\d+)\s+-(\d+)/);
    if (match) {
      filesNew = parseInt(match[1], 10);
      filesModified = parseInt(match[2], 10);
      filesDeleted = parseInt(match[3], 10);
    }
  }

  const firstLine = fullMessage.split("\n")[0] ?? "";
  const summaryMatch = firstLine.match(/orca:\s+\w+\s+checkpoint:?\s*(.*)/);
  const promptSummary = summaryMatch?.[1]?.trim() || null;

  // Read checkpoint manifest from tree if it exists
  const manifestJson = showFile(
    cwd,
    commitHash,
    `.orca/sessions/${checkpointSessionId}/checkpoint-manifest.json`
  );

  return {
    checkpointId,
    sessionId: checkpointSessionId ?? sessionId ?? "unknown",
    commitHash,
    timestamp: "", // Would need to parse from git log
    type: type ?? "session",
    promptSummary,
    filesNew,
    filesModified,
    filesDeleted,
    qualityScore: null,
    cognitiveContext: null,
    manifest: manifestJson ? tryParseJson(manifestJson) : null,
  };
}

// ============================================================================
// TYPES
// ============================================================================

export interface RestoreResult {
  checkpointId: string;
  commitHash: string;
  filesRestored: string[];
  filesCreated: string[];
  filesModified: string[];
  filesDeleted: string[];
}

// ============================================================================
// INTERNAL
// ============================================================================

/**
 * Find the commit hash for a given checkpoint ID by walking the shadow branch.
 */
function findCheckpointCommit(
  cwd: string,
  checkpointId: string,
  sessionId?: string
): string | null {
  let branchName: string | null = null;

  if (sessionId) {
    branchName = getShadowBranchForSession(cwd, sessionId);
  } else {
    branchName = getCurrentShadowBranch(cwd);
  }

  if (!branchName) return null;

  // Walk commits looking for matching checkpoint ID
  const commits = logRef(cwd, branchName, 200);
  for (const commit of commits) {
    const msg = getCommitMessage(cwd, commit.hash);
    if (!msg) continue;

    const id = parseTrailer(msg, "ORCA-Checkpoint");
    if (id === checkpointId) {
      return commit.hash;
    }
  }

  return null;
}

/**
 * Parse a trailer value from a commit message.
 * Trailers are in format "Key: Value" in the commit body.
 */
function parseTrailer(message: string, key: string): string | null {
  const pattern = new RegExp(`^${key}:\\s*(.+)$`, "m");
  const match = message.match(pattern);
  return match?.[1]?.trim() ?? null;
}

/**
 * Get list of all files in the current working tree (tracked + untracked).
 */
function getWorkingTreeFiles(cwd: string): string[] {
  try {
    const output = execSync("git ls-files", {
      cwd,
      encoding: "utf-8",
      timeout: 5000,
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();

    if (!output) return [];
    return output.split("\n").filter(Boolean);
  } catch {
    return [];
  }
}

/**
 * Safely parse JSON, returning null on failure.
 */
function tryParseJson(str: string): unknown | null {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}
