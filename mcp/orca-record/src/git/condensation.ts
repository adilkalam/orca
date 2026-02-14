/**
 * Shadow Branch Condensation Pipeline
 *
 * On user git commit, session data moves from ephemeral shadow branches
 * to permanent orphan branch storage (orca/checkpoints/v1).
 *
 * Condensation is atomic: if it fails partway, the shadow branch is
 * preserved for retry. Only after successful condensation is the
 * shadow branch deleted.
 *
 * Orphan branch storage uses sharded paths to prevent huge directories:
 *   <id[:2]>/<id[2:]>/metadata.json
 *   <id[:2]>/<id[2:]>/transcript.jsonl
 *   <id[:2]>/<id[2:]>/reasoning.json
 *   <id[:2]>/<id[2:]>/quality.json
 *   <id[:2]>/<id[2:]>/memory-refs.json
 *   <id[:2]>/<id[2:]>/checkpoint-manifest.json
 */

import { execSync } from "child_process";
import {
  commitTree,
  getCommitMessage,
  logRef,
  resolveRef,
} from "./plumbing.js";
import { getShadowBranchForSession, deleteShadowBranch } from "./shadow-branch.js";
import {
  initDb,
  getCheckpoints,
  getTranscript,
  insertCondensed,
  hasSessionFilesTouched,
} from "../storage/sqlite.js";
import type {
  CondensationResult,
  CondensedMetadata,
  Condensed,
  CheckpointManifest,
} from "../types.js";

const GIT_TIMEOUT = 15000; // 15s for condensation ops (longer than normal plumbing)
const ORPHAN_BRANCH = "orca/checkpoints/v1";

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Run the full condensation pipeline for a session.
 *
 * 1. Find shadow branch for session
 * 2. Walk all checkpoint commits on shadow branch
 * 3. For each checkpoint, create sharded storage on orphan branch
 * 4. Update SQLite condensed table
 * 5. Delete shadow branch after successful condensation
 *
 * Returns the condensation result, or null on failure.
 */
export function condense(
  cwd: string,
  sessionId: string,
  userCommitHash: string
): CondensationResult | null {
  // Find shadow branch
  const shadowBranch = getShadowBranchForSession(cwd, sessionId);
  if (!shadowBranch) return null;

  // Ensure orphan branch exists
  const orphanRef = ensureOrphanBranch(cwd);
  if (!orphanRef) return null;

  // Walk checkpoint commits on shadow branch
  const commits = logRef(cwd, shadowBranch, 500);
  if (commits.length === 0) return null;

  // Get checkpoints from SQLite for metadata enrichment
  const sqliteCheckpoints = getCheckpoints(sessionId);
  const checkpointMap = new Map(sqliteCheckpoints.map((cp) => [cp.id, cp]));

  // Get transcript if available
  const transcript = getTranscript(sessionId);

  // Collect all checkpoint metadata for orphan branch storage
  const checkpointEntries: CondensedMetadata[] = [];

  for (const commit of commits) {
    const fullMessage = getCommitMessage(cwd, commit.hash);
    if (!fullMessage) continue;

    // Parse trailers
    const checkpointId = parseTrailer(fullMessage, "ORCA-Checkpoint");
    if (!checkpointId) continue; // Skip non-checkpoint commits

    const cpSessionId = parseTrailer(fullMessage, "ORCA-Session") ?? sessionId;
    const cpType = (parseTrailer(fullMessage, "ORCA-Type") ?? "session") as "session" | "task";
    const filesInfo = parseTrailer(fullMessage, "ORCA-Files");

    // Parse file counts
    let filesModified: string[] = [];
    let filesNew: string[] = [];
    let filesDeleted: string[] = [];

    // Enrich from SQLite if available
    const sqliteCp = checkpointMap.get(checkpointId);
    if (sqliteCp) {
      filesModified = tryParseJsonArray(sqliteCp.files_modified_json);
      filesNew = tryParseJsonArray(sqliteCp.files_new_json);
      filesDeleted = tryParseJsonArray(sqliteCp.files_deleted_json);
    }

    // Extract prompt summary
    const firstLine = fullMessage.split("\n")[0] ?? "";
    const summaryMatch = firstLine.match(/orca:\s+\w+\s+checkpoint:?\s*(.*)/);
    const promptSummary = sqliteCp?.prompt_summary ?? summaryMatch?.[1]?.trim() ?? null;

    // Build all trailers
    const trailers: Record<string, string> = {};
    for (const line of fullMessage.split("\n")) {
      const match = line.match(/^(ORCA-\w+):\s*(.+)$/);
      if (match) {
        trailers[match[1]] = match[2].trim();
      }
    }

    checkpointEntries.push({
      checkpointId,
      sessionId: cpSessionId,
      timestamp: commit.timestamp,
      type: cpType,
      userCommitHash,
      shadowCommitHash: commit.hash,
      promptSummary,
      files: { modified: filesModified, new: filesNew, deleted: filesDeleted },
      trailers,
    });
  }

  if (checkpointEntries.length === 0) return null;

  // Create condensed commit on orphan branch with sharded storage
  const orphanCommitHash = createCondensedCommit(
    cwd,
    sessionId,
    userCommitHash,
    checkpointEntries,
    transcript?.transcript_data ?? null
  );

  if (!orphanCommitHash) {
    // Condensation failed -- shadow branch preserved for retry
    return null;
  }

  // Update SQLite condensed table
  const now = new Date().toISOString();
  for (const entry of checkpointEntries) {
    const condensed: Condensed = {
      checkpoint_id: entry.checkpointId,
      session_id: entry.sessionId,
      commit_hash: userCommitHash,
      orphan_commit: orphanCommitHash,
      condensed_at: now,
      metadata_json: JSON.stringify(entry),
    };
    insertCondensed(condensed);
  }

  // Delete shadow branch after successful condensation
  const deleted = deleteShadowBranch(cwd, shadowBranch);

  return {
    sessionId,
    userCommitHash,
    orphanCommitHash,
    checkpointsCondensed: checkpointEntries.length,
    shadowBranchDeleted: deleted,
    condensedAt: now,
  };
}

/**
 * Ensure the orphan branch exists. Create it if not.
 * Returns the ref name on success, null on failure.
 */
export function ensureOrphanBranch(cwd: string): string | null {
  // Check if ref already exists
  const existing = resolveOrphanRef(cwd);
  if (existing) return ORPHAN_BRANCH;

  try {
    // Create an empty tree
    const emptyTree = execSync("git hash-object -t tree /dev/null", {
      cwd,
      encoding: "utf-8",
      timeout: GIT_TIMEOUT,
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();

    if (!emptyTree) return null;

    // Create initial commit on orphan branch (no parent)
    const initCommit = commitTree(cwd, emptyTree, {
      message: "orca: initialize checkpoint storage v1",
    });

    if (!initCommit) return null;

    // Create the ref
    execSync(
      `git update-ref refs/heads/${ORPHAN_BRANCH} ${initCommit}`,
      {
        cwd,
        encoding: "utf-8",
        timeout: GIT_TIMEOUT,
        stdio: ["pipe", "pipe", "pipe"],
      }
    );

    return ORPHAN_BRANCH;
  } catch {
    return null;
  }
}

/**
 * Conditionally condense: only if the session has file modifications.
 * Returns the condensation result, or null if skipped/failed.
 */
export function condenseIfFilesTouched(
  cwd: string,
  sessionId: string,
  userCommitHash: string
): CondensationResult | null {
  if (!hasSessionFilesTouched(sessionId)) {
    return null; // Lightweight session, no checkpoint needed
  }
  return condense(cwd, sessionId, userCommitHash);
}

// ============================================================================
// INTERNAL
// ============================================================================

/**
 * Create a single commit on the orphan branch containing all checkpoint
 * metadata in sharded storage layout.
 *
 * Uses git mktree to build a tree with the sharded structure,
 * then commits it to the orphan branch.
 */
function createCondensedCommit(
  cwd: string,
  sessionId: string,
  userCommitHash: string,
  checkpoints: CondensedMetadata[],
  transcriptData: string | null
): string | null {
  try {
    // Get current orphan branch tip as parent
    const parentHash = resolveOrphanRef(cwd);
    if (!parentHash) return null;

    // Build tree entries for all checkpoints
    // We create blobs first, then build the tree
    const treeEntries: string[] = [];

    for (const cp of checkpoints) {
      const shard1 = cp.checkpointId.slice(0, 2);
      const shard2 = cp.checkpointId.slice(2);
      const basePath = `${shard1}/${shard2}`;

      // metadata.json
      const metadataBlob = hashObject(cwd, JSON.stringify(cp, null, 2));
      if (metadataBlob) {
        treeEntries.push(`100644 blob ${metadataBlob}\t${basePath}/metadata.json`);
      }

      // checkpoint-manifest.json
      const manifest: CheckpointManifest = {
        checkpointId: cp.checkpointId,
        sessionId: cp.sessionId,
        timestamp: cp.timestamp,
        type: cp.type,
        files: cp.files,
        quality: null,
        memoryRefs: null,
        cognitiveSessionId: null,
      };
      const manifestBlob = hashObject(cwd, JSON.stringify(manifest, null, 2));
      if (manifestBlob) {
        treeEntries.push(`100644 blob ${manifestBlob}\t${basePath}/checkpoint-manifest.json`);
      }

      // transcript.jsonl (shared across all checkpoints in session)
      if (transcriptData) {
        const transcriptBlob = hashObject(cwd, transcriptData);
        if (transcriptBlob) {
          treeEntries.push(`100644 blob ${transcriptBlob}\t${basePath}/transcript.jsonl`);
        }
      }

      // quality.json (placeholder)
      const qualityBlob = hashObject(cwd, JSON.stringify({ score: null, errors: 0 }));
      if (qualityBlob) {
        treeEntries.push(`100644 blob ${qualityBlob}\t${basePath}/quality.json`);
      }

      // reasoning.json (Phase 4 placeholder)
      const reasoningBlob = hashObject(cwd, JSON.stringify({ reasoning: null }));
      if (reasoningBlob) {
        treeEntries.push(`100644 blob ${reasoningBlob}\t${basePath}/reasoning.json`);
      }

      // memory-refs.json (placeholder)
      const memRefsBlob = hashObject(cwd, JSON.stringify({ refs: [] }));
      if (memRefsBlob) {
        treeEntries.push(`100644 blob ${memRefsBlob}\t${basePath}/memory-refs.json`);
      }
    }

    if (treeEntries.length === 0) return null;

    // Build tree using mktree
    const treeInput = treeEntries.join("\n") + "\n";
    const newTreeHash = execSync("git mktree", {
      cwd,
      encoding: "utf-8",
      input: treeInput,
      timeout: GIT_TIMEOUT,
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();

    if (!newTreeHash) return null;

    // Create commit
    const commitMessage = [
      `orca: condense session ${sessionId}`,
      "",
      `User-Commit: ${userCommitHash}`,
      `Session: ${sessionId}`,
      `Checkpoints: ${checkpoints.length}`,
    ].join("\n");

    const commitHash = commitTree(cwd, newTreeHash, {
      parentHash,
      message: commitMessage,
    });

    if (!commitHash) return null;

    // Advance orphan branch
    execSync(
      `git update-ref refs/heads/${ORPHAN_BRANCH} ${commitHash}`,
      {
        cwd,
        encoding: "utf-8",
        timeout: GIT_TIMEOUT,
        stdio: ["pipe", "pipe", "pipe"],
      }
    );

    return commitHash;
  } catch {
    return null;
  }
}

/**
 * Hash a string into a git blob object.
 * Returns the blob hash, or null on failure.
 */
function hashObject(cwd: string, content: string): string | null {
  try {
    return execSync("git hash-object -w --stdin", {
      cwd,
      encoding: "utf-8",
      input: content,
      timeout: GIT_TIMEOUT,
      stdio: ["pipe", "pipe", "pipe"],
    }).trim() || null;
  } catch {
    return null;
  }
}

/**
 * Resolve the orphan branch ref to a commit hash.
 */
function resolveOrphanRef(cwd: string): string | null {
  try {
    return execSync(
      `git rev-parse refs/heads/${ORPHAN_BRANCH}`,
      {
        cwd,
        encoding: "utf-8",
        timeout: GIT_TIMEOUT,
        stdio: ["pipe", "pipe", "pipe"],
      }
    ).trim() || null;
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
 * Safely parse a JSON string to an array, returning [] on failure.
 */
function tryParseJsonArray(json: string | null): string[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
