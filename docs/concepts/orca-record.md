# ORCA Recording Layer Architecture

**Version:** orca-record v0.4.0
**Last Updated:** 2026-02-26

---

## Introduction

The ORCA recording layer is a lean event tracker for Claude Code sessions. It automatically captures session events, tool calls, and file changes to a per-project SQLite database (`.orca/recording.db`), enabling session continuity, cognitive fusion through cognition-mcp, and Workshop memory persistence.

**Design Philosophy:** Recording is invisible infrastructure. Users work normally; events are captured automatically via Claude Code hooks. The recording layer powers downstream consumers (Workshop notes, cognition-mcp recording queries, session context injection) without user intervention.

**v0.4.0 Note:** The git shadow branch layer (checkpoints, rewind, condensation) was removed in v0.4.0. The event tracking layer -- hooks, SQLite storage, state machine, and redaction -- is the valuable core that powers all downstream consumers.

---

## Architecture Overview

```
Claude Code Session
        |
        v
+---------------------------------------------------------------------+
|                         Claude Code Hooks                            |
|  UserPromptSubmit | Stop | PreToolUse[Task] | PostToolUse[Task/Todo] |
+---------------------------------------------------------------------+
        |
        v
+---------------------------------------------------------------------+
|                         orca-record CLI (v0.4.0)                     |
|  prompt-submit | stop | pre-task | post-task | post-todo | status   |
+---------------------------------------------------------------------+
        |
        +------------------------+
        v                        v
+-------------------+    +-------------------+
|   State Machine   |    |    SQLite DB      |
| .git/orca-sessions|    | .orca/recording.db|
+-------------------+    +-------------------+
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
| `ACTIVE_COMMITTED` | Legacy state, handled gracefully for backward compat |
| `ENDED` | Session terminated |

**Transitions:**

```typescript
const TRANSITIONS = {
  IDLE: {
    SessionStart: { next: ACTIVE },
    TurnStart: { next: ACTIVE },
  },
  ACTIVE: {
    TurnEnd: { next: ACTIVE },
    SessionStop: { next: ENDED },
  },
  ACTIVE_COMMITTED: {
    // Backward compat: if an existing session is in this state
    TurnEnd: { next: ACTIVE },
    TurnStart: { next: ACTIVE },
    SessionStop: { next: ENDED },
  },
  ENDED: {
    SessionStart: { next: ACTIVE },
    TurnStart: { next: ACTIVE },
  },
};
```

### 2. SQLite Storage

The SQLite database (`.orca/recording.db`) provides fast queries and persistent storage.

**Active Tables:**

```sql
-- Session metadata
sessions (
  id TEXT PRIMARY KEY,
  started_at TEXT,
  ended_at TEXT,
  state TEXT,
  base_commit TEXT,
  shadow_branch TEXT,      -- Legacy column, no longer written to
  step_count INTEGER,
  files_touched_json TEXT
);

-- Checkpoints (event-based, no longer git-backed)
checkpoints (
  id TEXT PRIMARY KEY,
  session_id TEXT REFERENCES sessions(id),
  created_at TEXT,
  type TEXT,  -- 'session' | 'task'
  shadow_commit TEXT,      -- Legacy column, no longer written to
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
```

**Legacy Tables (schema preserved, no longer written to):**

```sql
-- Was used by transcript parser (src/transcript/ deleted in v0.4.0)
transcripts (session_id, transcript_path, transcript_data, redacted);

-- Was used by git condensation layer (src/git/ deleted in v0.4.0)
condensed (checkpoint_id, session_id, commit_hash, orphan_commit, condensed_at, metadata_json);
```

### 3. Hook Handlers

Each Claude Code hook maps to a handler. All handlers exit 0 and swallow errors.

**UserPromptSubmit (`prompt-submit`):**
1. Initialize/continue session
2. Snapshot git status
3. Transition state machine (IDLE -> ACTIVE or TurnStart)
4. Record event to SQLite

**Stop (`stop`):**
1. Record final event
2. Update session metadata (step count, files touched)
3. Transition to ENDED

**PreToolUse[Task] (`pre-task`):**
1. Snapshot current git state
2. Store pre-task snapshot keyed by tool_use_id

**PostToolUse[Task] (`post-task`):**
1. Retrieve pre-task snapshot
2. Diff files changed during task
3. Record subagent completion event

**PostToolUse[TodoWrite] (`post-todo`):**
1. Record todo update event

### 4. Redaction

All hook inputs are redacted before SQLite storage to prevent secret leakage:

**Pattern Categories:**
- Known API key prefixes (sk-, ghp-, etc.)
- Bearer tokens
- Password field values
- High-entropy strings (potential secrets)
- Environment variable patterns

---

## CLI Commands

```
orca-record v0.4.0

Hook Commands:
  prompt-submit          UserPromptSubmit hook handler
  stop                   Stop hook handler
  pre-task               PreToolUse[Task] handler
  post-task              PostToolUse[Task] handler
  post-todo              PostToolUse[TodoWrite] handler

User Commands:
  status                 Show recording session status
  version                Print version
```

---

## Integration Points

### Claude Code Hooks

Hooks must exit 0 always, handle stdin JSON gracefully, and swallow all errors.

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

cognition-mcp reads from recording.db (READ-ONLY) for cognitive fusion queries:

| Operation | What It Does |
|-----------|-------------|
| `recording_status` | Current session state |
| `recording_query` | Find sessions by files touched, state, or time range |
| `recording_explain` | Narrative summary of a session |
| `recording_compare` | Diff between two checkpoints |
| `recording_checkpoint` | Create a manual checkpoint entry |
| `recording_quality` | Session quality metrics |
| `recording_rewind` | Query rewind data (code restore no longer available) |

### Workshop Memory

The session-end hook extracts learnings from sessions and persists them as Workshop notes. This is the primary downstream consumer of recording data.

### Recording Context Injection

Domain commands (`/ios`, `/nextjs`, `/expo`, etc.) query recording.db for prior session context before delegating to agents, bridging sessions automatically.

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
- Hook input malformed? Use empty object.

---

## What Was Removed in v0.4.0

The following components were removed to simplify the architecture:

| Removed Component | Files Deleted | Why |
|-------------------|---------------|-----|
| Git shadow branches | `src/git/shadow-branch.ts`, `src/git/plumbing.ts` | Complex, never used effectively |
| Condensation | `src/git/condensation.ts`, `src/git/linking.ts` | Dependent on shadow branches |
| Git hooks | `src/git/hooks.ts` | prepare-commit-msg/post-commit for condensation |
| Lockfile management | `src/git/lockfile.ts` | For shadow branch operations |
| Code rewind | `src/git/rewind.ts` | Restored code from shadow branches |
| Transcript parser | `src/transcript/parser.ts`, `src/transcript/restore.ts` | Parsed JSONL transcripts |
| Flush-wait | `src/transcript/flush-wait.ts` | Waited for transcript writes |
| /checkpoints command | `commands/checkpoints.md` | Listed git-backed checkpoints |
| /restore command | `commands/restore.md` | Rewound to git checkpoint |

The event tracking layer (hooks + SQLite + state machine + redaction) was the valuable core that powers Workshop notes, cognition-mcp, and session context. The git layer added complexity without proportional value.

---

## File Locations

| Component | Location |
|-----------|----------|
| Binary | `~/.claude/bin/orca-record` |
| Source | `ORCA-OS/mcp/orca-record/` |
| Database | `.orca/recording.db` (per-project, gitignored) |
| State files | `.git/orca-sessions/*.json` |

---

## Related Documentation

- Quick reference: `quick-reference/ORCA-OS/ORCA-recording.md`
- Commands: `commands/orca-status.md`, `commands/continue.md`
- cognition-mcp integration: `docs/concepts/cognition-mcp.md`
- Memory systems: `docs/concepts/memory-systems.md`

---

_This document describes the orca-record v0.4.0 architecture as of OS 6.4._
