/**
 * Bidirectional Commit <-> Checkpoint Linking
 *
 * Links user git commits to ORCA checkpoints and vice versa.
 * Uses three resolution strategies:
 *   1. Trailer parsing (ORCA-Checkpoint trailer in commit message)
 *   2. SQLite condensed table lookup
 *   3. Git log search as fallback
 */

import { execSync } from "child_process";
import { getCommitMessage } from "./plumbing.js";
import {
  initDb,
  getCondensedByCheckpoint,
  getCondensedByCommit,
} from "../storage/sqlite.js";
import type {
  LinkResult,
  SessionHistoryEntry,
  CondensedMetadata,
} from "../types.js";

const GIT_TIMEOUT = 10000;

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Find the checkpoint linked to a user commit.
 *
 * Resolution order:
 *   1. Parse ORCA-Checkpoint trailer from commit message
 *   2. Look up commit hash in SQLite condensed table
 *
 * Returns the link result, or null if no checkpoint found.
 */
export function findCheckpointForCommit(
  cwd: string,
  commitHash: string
): LinkResult | null {
  // Strategy 1: Parse trailer from commit message
  const message = getCommitMessage(cwd, commitHash);
  if (message) {
    const checkpointId = parseTrailer(message, "ORCA-Checkpoint");
    if (checkpointId) {
      // Try to enrich from condensed table
      const condensed = getCondensedByCheckpoint(checkpointId);
      const metadata = condensed?.metadata_json
        ? tryParseJson<CondensedMetadata>(condensed.metadata_json)
        : null;

      return {
        commitHash,
        checkpointId,
        sessionId: condensed?.session_id ?? metadata?.sessionId ?? "unknown",
        source: "trailer",
        metadata,
      };
    }
  }

  // Strategy 2: Look up in condensed table by commit hash
  const condensedRows = getCondensedByCommit(commitHash);
  if (condensedRows.length > 0) {
    const first = condensedRows[0];
    const metadata = first.metadata_json
      ? tryParseJson<CondensedMetadata>(first.metadata_json)
      : null;

    return {
      commitHash,
      checkpointId: first.checkpoint_id,
      sessionId: first.session_id,
      source: "condensed",
      metadata,
    };
  }

  return null;
}

/**
 * Find the user commit linked to a checkpoint.
 *
 * Resolution order:
 *   1. Look up checkpoint_id in SQLite condensed table
 *   2. Search git log for commits with matching ORCA-Checkpoint trailer
 *
 * Returns the link result, or null if no commit found.
 */
export function findCommitForCheckpoint(
  cwd: string,
  checkpointId: string
): LinkResult | null {
  // Strategy 1: SQLite condensed table
  const condensed = getCondensedByCheckpoint(checkpointId);
  if (condensed) {
    const metadata = condensed.metadata_json
      ? tryParseJson<CondensedMetadata>(condensed.metadata_json)
      : null;

    return {
      commitHash: condensed.commit_hash,
      checkpointId,
      sessionId: condensed.session_id,
      source: "condensed",
      metadata,
    };
  }

  // Strategy 2: Search git log for trailer
  const commitHash = searchGitLogForCheckpoint(cwd, checkpointId);
  if (commitHash) {
    return {
      commitHash,
      checkpointId,
      sessionId: "unknown", // Would need further resolution
      source: "git-log",
      metadata: null,
    };
  }

  return null;
}

/**
 * Get session history for a range of commits.
 *
 * Walks commits and resolves ORCA-Checkpoint trailers to full
 * checkpoint + session + cognitive context entries.
 *
 * @param cwd Project root
 * @param commitRange Git revision range (e.g., "HEAD~10..HEAD", "main..feature")
 *                    If not provided, defaults to last 20 commits.
 */
export function getSessionHistory(
  cwd: string,
  commitRange?: string
): SessionHistoryEntry[] {
  const range = commitRange ?? "HEAD~20..HEAD";
  const entries: SessionHistoryEntry[] = [];

  try {
    // Get commits in range with message and timestamp
    const output = execSync(
      `git log ${range} --format="%H%x00%s%x00%aI%x00%B%x1e" --reverse`,
      {
        cwd,
        encoding: "utf-8",
        timeout: GIT_TIMEOUT,
        stdio: ["pipe", "pipe", "pipe"],
      }
    ).trim();

    if (!output) return [];

    // Split by record separator
    const records = output.split("\x1e").filter((r) => r.trim());

    for (const record of records) {
      const parts = record.trim().split("\0");
      if (parts.length < 4) continue;

      const [commitHash, subject, timestamp, body] = parts;

      // Check for ORCA-Checkpoint trailer
      const checkpointId = parseTrailer(body, "ORCA-Checkpoint");
      if (!checkpointId) continue;

      // Enrich from condensed table
      const condensed = getCondensedByCheckpoint(checkpointId);
      const metadata = condensed?.metadata_json
        ? tryParseJson<CondensedMetadata>(condensed.metadata_json)
        : null;

      entries.push({
        commitHash,
        commitMessage: subject,
        commitTimestamp: timestamp,
        checkpointId,
        sessionId: condensed?.session_id ?? metadata?.sessionId ?? "unknown",
        promptSummary: metadata?.promptSummary ?? null,
        filesModified: metadata?.files?.modified?.length ?? 0,
        filesNew: metadata?.files?.new?.length ?? 0,
        filesDeleted: metadata?.files?.deleted?.length ?? 0,
      });
    }
  } catch {
    // Range may be invalid or repo too shallow
  }

  return entries;
}

// ============================================================================
// INTERNAL
// ============================================================================

/**
 * Search git log for a commit containing a specific ORCA-Checkpoint trailer.
 */
function searchGitLogForCheckpoint(
  cwd: string,
  checkpointId: string
): string | null {
  try {
    const output = execSync(
      `git log --all --grep="ORCA-Checkpoint: ${checkpointId}" --format="%H" --max-count=1`,
      {
        cwd,
        encoding: "utf-8",
        timeout: GIT_TIMEOUT,
        stdio: ["pipe", "pipe", "pipe"],
      }
    ).trim();

    return output || null;
  } catch {
    return null;
  }
}

/**
 * Parse a trailer value from a commit message.
 */
function parseTrailer(message: string, key: string): string | null {
  const pattern = new RegExp(`^${key}:\\s*(.+)$`, "m");
  const match = message.match(pattern);
  return match?.[1]?.trim() ?? null;
}

/**
 * Safely parse JSON, returning null on failure.
 */
function tryParseJson<T>(str: string): T | null {
  try {
    return JSON.parse(str) as T;
  } catch {
    return null;
  }
}
