# ORCA Recording Layer Architecture

**Version:** orca-record v0.3.0
**Last Updated:** 2026-02-17

---

## Introduction

The ORCA recording layer provides session-level undo capability for Claude Code sessions. It automatically captures checkpoints on every user prompt, enabling instant rollback to any point in the session. Unlike traditional version control, recording captures the *working state* - uncommitted changes, conversation context, and cognitive reasoning chains.

**Design Philosophy:** Recording is invisible infrastructure. Users work normally; checkpoints happen automatically. When something goes wrong, they can rewind without losing context.

---

## Architecture Overview

```
Claude Code Session
        │
        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Claude Code Hooks                          │
│  UserPromptSubmit │ Stop │ PreToolUse[Task] │ PostToolUse[Task]   │
└─────────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         orca-record CLI                            │
│  prompt-submit │ stop │ pre-task │ post-task │ status │ rewind    │
└─────────────────────────────────────────────────────────────────────┘
        │
        ├──────────────────────┬──────────────────────┐
        ▼                      ▼                      ▼
┌───────────────┐      ┌───────────────┐      ┌───────────────┐
│ State Machine │      │   SQLite DB   │      │ Git Plumbing  │
│ .git/orca-*   │      │ .orca/*.db    │      │ Shadow Branch │
└───────────────┘      └───────────────┘      └───────────────┘
```

---

## Core Components

### 1. State Machine

The session lifecycle follows a finite state machine persisted to `.git/orca-sessions/<session-id>.json`.

**States:**

| State | Description |
|-------|-------------|
| `IDLE` | No active session |
| `ACTIVE` | Recording in progress |
| `ACTIVE_COMMITTED` | User committed, awaiting condensation |
| `ENDED` | Session terminated |

**Transitions:**

```typescript
const TRANSITIONS = {
  IDLE: {
    SessionStart: { next: ACTIVE, actions: [] },
    TurnStart: { next: ACTIVE, actions: [] },
  },
  ACTIVE: {
    TurnEnd: { next: ACTIVE, actions: [] },
    GitCommit: { next: ACTIVE_COMMITTED, actions: [CondenseIfFilesTouched] },
    SessionStop: { next: ENDED, actions: [] },
  },
  ACTIVE_COMMITTED: {
    TurnEnd: { next: ENDED, actions: [Condense] },
    TurnStart: { next: ACTIVE, actions: [CondenseIfFilesTouched, MigrateShadowBranch] },
    SessionStop: { next: ENDED, actions: [Condense] },
  },
  ENDED: {
    SessionStart: { next: ACTIVE, actions: [] },
    TurnStart: { next: ACTIVE, actions: [WarnStaleSession] },
  },
};
```

**Session State File:**

```typescript
interface SessionStateFile {
  session_id: string;           // sess-<hex-timestamp><rand>
  state: SessionState;
  started_at: string;           // ISO timestamp
  base_commit: string | null;   // Git HEAD at session start
  git_head: string | null;      // Current HEAD
  step_count: number;           // Prompts processed
  files_touched: string[];      // Files modified this session
  last_snapshot: GitSnapshot;   // For diffing
  pre_task_snapshots: Record<string, GitSnapshot>;  // Task tracking
  shadow_branch: string | null; // orca/<hash>-<hash>
}
```

### 2. Shadow Branches

Shadow branches are ephemeral git branches that store full working tree snapshots for each checkpoint. They exist alongside the user's working tree but don't interfere with normal git operations.

**Naming Convention:**
```
orca/<HEAD[:7]>-<worktree-hash[:6]>
```

**Example:** `orca/abc1234-def567`

**Creation:**

```typescript
function createShadowBranch(cwd: string, sessionId: string): string | null {
  const head = getHead(cwd);
  const branchName = deriveShadowBranchName(cwd);

  // Create initial commit with current tree, HEAD as parent
  const treeHash = writeTree(cwd);
  const commitHash = commitTree(cwd, treeHash, {
    parentHash: head,
    message: `orca: session ${sessionId} started`,
    trailers: {
      "ORCA-Session": sessionId,
      "ORCA-Type": "session-start",
    },
  });

  updateRef(cwd, branchName, commitHash);
  return branchName;
}
```

**Checkpoint Commits:**

Each checkpoint is a commit on the shadow branch containing:
- Full working tree snapshot (all files)
- Commit message trailers with metadata
- No impact on working directory or HEAD

```
Commit message format:
  orca: turn checkpoint: <prompt-summary>

  ORCA-Session: sess-abc123
  ORCA-Checkpoint: cp-789xyz
  ORCA-Type: session
  ORCA-Files: +2 ~5 -0
```

### 3. Git Plumbing Operations

The recording layer uses low-level git plumbing commands to avoid affecting the working tree:

| Operation | Git Command | Purpose |
|-----------|-------------|---------|
| `writeTree` | `git write-tree` | Capture working tree as tree object |
| `commitTree` | `git commit-tree` | Create commit from tree |
| `updateRef` | `git update-ref` | Move branch pointer |
| `readTree` | `git read-tree` | Load tree into index |
| `checkoutIndex` | `git checkout-index` | Write index to working dir |

**Why Plumbing?**
- No UI output
- Atomic operations
- No working directory side effects (until restore)
- Precise control over commit structure

### 4. SQLite Storage

The SQLite database (`.orca/recording.db`) provides fast queries and persistent storage for:

**Tables:**

```sql
-- Session metadata
sessions (
  id TEXT PRIMARY KEY,
  started_at TEXT,
  ended_at TEXT,
  state TEXT,
  base_commit TEXT,
  shadow_branch TEXT,
  step_count INTEGER,
  files_touched_json TEXT
);

-- Checkpoints
checkpoints (
  id TEXT PRIMARY KEY,
  session_id TEXT REFERENCES sessions(id),
  created_at TEXT,
  type TEXT,  -- 'session' | 'task'
  shadow_commit TEXT,
  prompt_summary TEXT,
  files_modified_json TEXT,
  files_new_json TEXT,
  files_deleted_json TEXT,
  tool_use_id TEXT,
  subagent_type TEXT
);

-- Raw event log
events (
  id INTEGER PRIMARY KEY,
  session_id TEXT REFERENCES sessions(id),
  timestamp TEXT,
  event_type TEXT,
  hook_input_json TEXT,
  git_head TEXT,
  metadata_json TEXT
);

-- Full transcripts (separate for size)
transcripts (
  session_id TEXT PRIMARY KEY,
  transcript_path TEXT,
  transcript_data TEXT,
  redacted BOOLEAN
);

-- Permanent storage after condensation
condensed (
  checkpoint_id TEXT PRIMARY KEY,
  session_id TEXT,
  commit_hash TEXT,  -- User's commit
  orphan_commit TEXT,
  condensed_at TEXT,
  metadata_json TEXT
);
```

### 5. Hook Handlers

Each Claude Code hook maps to a handler:

**UserPromptSubmit:**
1. Initialize/continue session
2. Snapshot git status
3. Transition state machine (IDLE -> ACTIVE or TurnStart)
4. Create shadow branch (if new session)
5. Record event to SQLite

**Stop:**
1. Parse transcript file
2. Create final checkpoint
3. Store transcript (redacted)
4. Transition to ENDED
5. Trigger condensation if needed

**PreToolUse[Task]:**
1. Snapshot current git state
2. Store pre-task snapshot keyed by tool_use_id

**PostToolUse[Task]:**
1. Retrieve pre-task snapshot
2. Diff files changed during task
3. Create task checkpoint
4. Record subagent completion

---

## Checkpoint Creation Flow

```
User submits prompt
        │
        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    handlePromptSubmit()                            │
│  1. initDb(projectRoot)                                            │
│  2. getGitHead(), getGitStatus() -> snapshot                       │
│  3. StateMachine.findActiveSession() or createSession()            │
│  4. StateMachine.transition(TurnStart)                             │
│  5. createShadowBranch() (if new session)                          │
│  6. insertEvent()                                                   │
└─────────────────────────────────────────────────────────────────────┘
        │
        ▼
Claude processes prompt, makes changes
        │
        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        handleStop()                                │
│  1. Get last snapshot from state machine                           │
│  2. Diff: current files vs snapshot                                │
│  3. createCheckpointCommit(filesNew, filesModified, filesDeleted)  │
│  4. Parse & store transcript (redacted)                            │
│  5. insertCheckpoint() to SQLite                                   │
│  6. StateMachine.transition(TurnEnd)                               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Restore (Rewind) Process

```typescript
function restoreCheckpoint(cwd: string, checkpointId: string): RestoreResult {
  // 1. Find checkpoint commit on shadow branch
  const commitHash = findCheckpointCommit(cwd, checkpointId);

  // 2. Get current files (for deletion tracking)
  const filesBefore = getWorkingTreeFiles(cwd);

  // 3. Get files in checkpoint
  const filesInCheckpoint = new Set(listTree(cwd, commitHash));

  // 4. Read checkpoint tree into index
  readTree(cwd, commitHash);

  // 5. Write index to working directory
  checkoutIndex(cwd);

  // 6. Delete files not in checkpoint (except .orca/, .git/)
  for (const file of filesBefore) {
    if (!filesInCheckpoint.has(file)) {
      unlinkSync(join(cwd, file));
    }
  }

  return { filesCreated, filesModified, filesDeleted };
}
```

**Logs-only mode:** Restore transcript without file changes:
```bash
orca-record rewind <id> --logs-only
```

This restores the conversation transcript to `~/.claude/projects/.../<session>.jsonl`, enabling `claude --continue <session>` without modifying code.

---

## Condensation

When the user commits their changes, the recording layer condenses checkpoints from the ephemeral shadow branch to permanent storage.

**Process:**

1. **Trigger:** `GitCommit` event transitions to `ACTIVE_COMMITTED`
2. **Sharding:** Create checkpoint storage on orphan branch
3. **Linking:** Add trailers to user's commit linking to checkpoint
4. **Cleanup:** Delete ephemeral shadow branch
5. **Database:** Record condensation in `condensed` table

**Orphan Branch Structure:**
```
refs/heads/orca-storage
  └── <id[:2]>/<id[2:]>/
        ├── metadata.json
        ├── transcript.jsonl
        ├── reasoning.json (from cognition-mcp)
        ├── quality.json
        └── manifest.json
```

**Commit Trailers (on user's commit):**
```
ORCA-Checkpoint: cp-abc123
ORCA-Session: sess-xyz789
```

---

## Redaction

All hook inputs are redacted before SQLite storage to prevent secret leakage:

**Pattern Categories:**
- Known API key prefixes (sk-, ghp-, etc.)
- Bearer tokens
- Password field values
- High-entropy strings (potential secrets)
- Environment variable patterns

**Entropy Detection:**
```typescript
function isHighEntropy(str: string): boolean {
  // Shannon entropy calculation
  // Threshold: 4.5 bits/char for strings > 16 chars
}
```

---

## Integration Points

### Claude Code Hooks

Hooks must:
- Exit 0 always (never block Claude Code)
- Handle stdin JSON gracefully
- Swallow all errors

```json
// ~/.claude/settings.json
{
  "hooks": {
    "UserPromptSubmit": [{
      "matcher": "",
      "hooks": [{
        "type": "command",
        "command": "~/.claude/bin/orca-record prompt-submit"
      }]
    }]
  }
}
```

### cognition-mcp Recording Extension

The recording layer exposes operations through cognition-mcp for cognitive fusion queries:

```typescript
// Example: Compare checkpoints with reasoning context
{
  operation: "recording_compare",
  content: {
    checkpointA: "cp-123",
    checkpointB: "cp-456",
    includeReasoning: true
  }
}
```

### Git Hooks

Auto-installed on first prompt:
- `prepare-commit-msg`: Add ORCA trailers
- `post-commit`: Trigger condensation

---

## Error Handling

**Principle:** Never block Claude Code.

```typescript
main().catch(() => {
  // Swallow all errors. Exit 0.
});
```

**Graceful Degradation:**
- No git repo? Exit silently.
- SQLite error? Log and continue.
- Shadow branch missing? Skip checkpoint.
- Hook input malformed? Use empty object.

---

## Performance Considerations

- `git write-tree`: ~10ms for typical repo
- `git commit-tree`: ~5ms
- SQLite insert: ~1ms
- Total checkpoint: ~20ms overhead

**Optimizations:**
- Incremental tree writes (Phase 4 planned)
- Background condensation
- Deferred transcript parsing

---

## Future Phases

**Phase 4: Quality + Memory**
- Checkpoint quality scoring
- Memory reference tracking
- Cognitive chain snapshots

**Phase 5: Distributed Sessions**
- Cross-machine session transfer
- Remote checkpoint storage
- Team collaboration

---

## File Locations

| Component | Location |
|-----------|----------|
| Binary | `~/.claude/bin/orca-record` |
| Source | `ORCA-OS/mcp/orca-record/` |
| Database | `.orca/recording.db` (per-project) |
| State files | `.git/orca-sessions/*.json` |
| Shadow branches | `refs/heads/orca/*` |
| Orphan storage | `refs/heads/orca-storage` |

---

## Related Documentation

- Quick reference: `quick-reference/ORCA-OS/ORCA-recording.md`
- Slash commands: `commands/checkpoints.md`, `commands/restore.md`, `commands/continue.md`, `commands/orca-status.md`
- cognition-mcp integration: `docs/concepts/cognition-mcp.md`
- Memory systems: `docs/concepts/memory-systems.md`

---

_This document describes the orca-record v0.3.0 architecture as of OS 6.2._
