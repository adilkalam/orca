/**
 * Stop Hook Handler
 *
 * Triggered when Claude Code finishes processing (agent responds).
 * This is the most complex handler:
 *   1. Read hook input from stdin
 *   2. Wait for transcript flush
 *   3. Parse transcript
 *   4. Diff files (current vs snapshot from prompt-submit)
 *   5. Redact secrets from transcript and event data
 *   6. Create checkpoint in SQLite
 *   7. Record event
 *   8. Update session state
 */

import { execSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import { createHash } from "crypto";
import { join, resolve } from "path";
import {
  SessionEvent,
  type HookInput,
  type GitSnapshot,
  type Checkpoint,
} from "../types.js";
import { StateMachine } from "../state-machine.js";
import {
  initDb,
  updateSession,
  insertEvent,
  createCheckpoint,
  saveTranscript,
  updateCheckpoint,
} from "../storage/sqlite.js";
import { redactHookInput, redactJson } from "../redaction/redact.js";
import { waitForTranscriptFlush } from "../transcript/flush-wait.js";
import { parseTranscript } from "../transcript/parser.js";
import { createCheckpointCommit } from "../git/shadow-branch.js";
import { isGitRepo } from "../git/plumbing.js";

export async function handleStop(
  hookInput: HookInput,
  gitDir: string,
  projectRoot: string
): Promise<void> {
  // Initialize database
  initDb(projectRoot);

  const sm = new StateMachine(gitDir);

  // Find active session
  const sessionState = sm.findActiveSession();
  if (!sessionState) {
    // No active session -- nothing to stop
    return;
  }

  const now = new Date().toISOString();
  const gitHead = getGitHead(projectRoot);

  // Diff files: current state vs snapshot from prompt-submit
  const currentStatus = getGitStatus(projectRoot);
  const previousSnapshot = sessionState.last_snapshot;
  const { modified, added, deleted } = diffStatus(previousSnapshot, currentStatus);

  // Track files touched
  const allFilesTouched = [...modified, ...added, ...deleted];
  sm.recordStep(sessionState, allFilesTouched);

  // Wait for transcript flush and capture
  let transcriptData: string | null = null;
  let transcriptHash: string | null = null;

  const transcriptPath = findTranscriptPath(hookInput, projectRoot);
  if (transcriptPath) {
    const flushResult = await waitForTranscriptFlush(transcriptPath);
    if (flushResult.success && flushResult.path) {
      try {
        const rawTranscript = readFileSync(flushResult.path, "utf-8");
        // Redact secrets from transcript
        const redactionResult = redactJson(rawTranscript);
        transcriptData = redactionResult.redacted;
        transcriptHash = createHash("sha256")
          .update(transcriptData)
          .digest("hex");
      } catch {
        // Transcript read failed -- continue without it
      }
    }
  }

  // Save transcript to SQLite
  if (transcriptData) {
    saveTranscript(sessionState.session_id, {
      data: transcriptData,
      hash: transcriptHash ?? undefined,
    });
  }

  // Generate checkpoint ID
  const checkpointId = generateCheckpointId();

  // Create session checkpoint
  const promptSummary = extractPromptSummary(hookInput);
  const checkpoint: Checkpoint = {
    id: checkpointId,
    session_id: sessionState.session_id,
    created_at: now,
    type: "session",
    shadow_commit: null, // Phase 2: shadow branch commits
    prompt_summary: promptSummary,
    files_modified_json: modified.length > 0 ? JSON.stringify(modified) : null,
    files_new_json: added.length > 0 ? JSON.stringify(added) : null,
    files_deleted_json: deleted.length > 0 ? JSON.stringify(deleted) : null,
    cognition_snapshot_json: null, // Phase 4: cognition fusion
    quality_json: null, // Phase 4: quality metrics
    tool_use_id: null,
    subagent_type: null,
    is_incremental: false,
    incremental_sequence: null,
  };
  createCheckpoint(checkpoint);

  // Phase 2: Create shadow branch checkpoint commit
  // Stop hook runs once per turn -- no lockfile needed
  if (isGitRepo(projectRoot) && sessionState.shadow_branch) {
    try {
      const shadowCommit = createCheckpointCommit(
        projectRoot,
        sessionState.session_id,
        checkpointId,
        {
          type: "session",
          promptSummary: promptSummary,
          filesModified: modified,
          filesNew: added,
          filesDeleted: deleted,
        }
      );
      if (shadowCommit) {
        // Update SQLite checkpoint with shadow commit hash
        updateCheckpoint(checkpointId, { shadow_commit: shadowCommit });
      }
    } catch {
      // Shadow branch checkpoint failed -- continue without it
    }
  }

  // Redact hook input
  const { redacted: redactedInput } = redactHookInput(
    hookInput as Record<string, unknown>
  );

  // Record stop event
  insertEvent({
    session_id: sessionState.session_id,
    timestamp: now,
    event_type: "stop",
    hook_input_json: JSON.stringify(redactedInput),
    git_head: gitHead,
    metadata_json: JSON.stringify({
      checkpoint_id: checkpointId,
      files_modified: modified.length,
      files_new: added.length,
      files_deleted: deleted.length,
      transcript_captured: !!transcriptData,
      transcript_hash: transcriptHash,
    }),
  });

  // Apply TurnEnd event to state machine
  sm.transition(sessionState, SessionEvent.TurnEnd);

  // Update session in SQLite
  updateSession(sessionState.session_id, {
    git_head: gitHead,
    step_count: sessionState.step_count + 1,
    files_touched_json: JSON.stringify(
      Array.from(new Set([...(sessionState.files_touched || []), ...allFilesTouched]))
    ),
  });
}

/**
 * Find the transcript path from hook input or known locations.
 */
function findTranscriptPath(hookInput: HookInput, projectRoot: string): string | null {
  // Check hook input for explicit path
  if (hookInput.transcript_path && existsSync(hookInput.transcript_path as string)) {
    return hookInput.transcript_path as string;
  }

  // Check known Claude Code transcript locations
  const possiblePaths = [
    join(projectRoot, ".claude", "transcript.jsonl"),
    join(projectRoot, ".claude", "session-transcript.jsonl"),
  ];

  // Also check home-relative paths
  const homeDir = process.env.HOME ?? "";
  if (homeDir) {
    possiblePaths.push(
      join(homeDir, ".claude", "transcript.jsonl"),
      join(homeDir, ".claude", "session-transcript.jsonl")
    );
  }

  for (const p of possiblePaths) {
    if (existsSync(p)) return p;
  }

  return null;
}

/**
 * Diff git status between snapshot and current.
 */
function diffStatus(
  previousSnapshot: GitSnapshot | null,
  currentStatus: string[]
): { modified: string[]; added: string[]; deleted: string[] } {
  const modified: string[] = [];
  const added: string[] = [];
  const deleted: string[] = [];

  const previousFiles = new Set(
    (previousSnapshot?.status ?? []).map((s) => s.slice(3)) // Remove status prefix (e.g., " M ")
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

/**
 * Extract a prompt summary (first 200 chars) from hook input.
 */
function extractPromptSummary(hookInput: HookInput): string | null {
  const prompt = hookInput.prompt ?? hookInput.prompt_content;
  if (!prompt || typeof prompt !== "string") return null;
  return prompt.length > 200 ? prompt.slice(0, 200) + "..." : prompt;
}

/**
 * Generate a 12-hex-char checkpoint ID.
 */
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
