# OS 6.2 Recording Layer Reference

**Last Updated:** 2026-02-17
**Version:** orca-record v0.3.0

---

## Overview

The recording layer (`orca-record`) captures session activity automatically via Claude Code hooks. Every prompt creates a checkpoint - a full working tree snapshot stored on a git shadow branch. Users can rewind to any checkpoint, restoring both code and conversation context.

**Key concept:** Shadow branches are ephemeral git branches that store checkpoints alongside your working tree. They're invisible to normal git operations but enable instant rollback.

---

## Quick Commands

| Command | Purpose |
|---------|---------|
| `/checkpoints` | List recent checkpoints with file changes |
| `/restore N` | Restore to checkpoint #N |
| `/restore N --logs-only` | Restore transcript only (no file changes) |
| `/orca-status` | Current session status |
| `/continue` | Resume info for previous sessions |

---

## CLI Commands

The binary lives at `~/.claude/bin/orca-record`.

### User Commands

```bash
# Session status
orca-record status

# List checkpoints
orca-record checkpoints
orca-record checkpoints --session sess-abc123

# Restore to checkpoint
orca-record rewind <checkpoint-id>
orca-record rewind <checkpoint-id> --logs-only

# Condensation (after git commit)
orca-record condense
orca-record condense --session sess-abc123

# Git hook management
orca-record install-hooks
orca-record uninstall-hooks

# Commit-checkpoint linking
orca-record link <commit-hash>
orca-record link --checkpoint <checkpoint-id>
orca-record history [commit-range]

# Version
orca-record version
```

### Hook Commands (invoked by Claude Code)

```bash
orca-record prompt-submit   # UserPromptSubmit hook
orca-record stop            # Stop hook
orca-record pre-task        # PreToolUse[Task] handler
orca-record post-task       # PostToolUse[Task] handler
orca-record post-todo       # PostToolUse[TodoWrite] handler
orca-record prepare-commit-msg  # Git hook
orca-record post-commit     # Git hook
```

---

## Session States

```
IDLE ──────────────────────────────────────────────────────────────────
  │ SessionStart/TurnStart
  v
ACTIVE ────────────────────────────────────────────────────────────────
  │ GitCommit               │ SessionStop
  v                         v
ACTIVE_COMMITTED            ENDED
  │ TurnStart                 │ SessionStart
  │ (new turn after commit)   v
  └─────> ACTIVE            ACTIVE (new session)
```

**States:**
- `IDLE` - No active session
- `ACTIVE` - Recording in progress, checkpoints being created
- `ACTIVE_COMMITTED` - User committed changes, awaiting next turn or session end
- `ENDED` - Session completed

---

## Storage Locations

| Location | Contents |
|----------|----------|
| `.orca/recording.db` | SQLite database (per-project, gitignored) |
| `.git/orca-sessions/<id>.json` | Session state files |
| `orca/<HEAD[:7]>-<worktree[:6]>` | Shadow branch (ephemeral) |
| `orca-storage` | Orphan branch (permanent, after condensation) |

---

## Database Schema

```sql
-- Sessions
sessions (id, started_at, ended_at, state, base_commit, shadow_branch, ...)

-- Checkpoints (one per turn or task completion)
checkpoints (id, session_id, type, shadow_commit, prompt_summary, files_*)

-- Events (full hook log)
events (id, session_id, event_type, hook_input_json, git_head, ...)

-- Transcripts (conversation history)
transcripts (session_id, transcript_path, transcript_data, redacted)

-- Condensed (permanent storage after commit)
condensed (checkpoint_id, session_id, commit_hash, orphan_commit, ...)
```

---

## Shadow Branch Anatomy

Shadow branches capture full working tree snapshots as git commits:

```
refs/heads/orca/abc1234-def567
  │
  ├── Commit: "orca: session sess-abc started"
  │     ORCA-Session: sess-abc
  │     ORCA-Type: session-start
  │
  ├── Commit: "orca: turn checkpoint: Fix login redirect"
  │     ORCA-Session: sess-abc
  │     ORCA-Checkpoint: cp-123
  │     ORCA-Type: session
  │     ORCA-Files: +2 ~5 -0
  │
  └── Commit: "orca: task checkpoint: Authentication"
        ORCA-Session: sess-abc
        ORCA-Checkpoint: cp-456
        ORCA-Type: task
        ORCA-Files: +3 ~2 -1
```

**Naming:** `orca/<HEAD[:7]>-<worktree-hash[:6]>`

---

## Checkpoint Types

| Type | Created When | Contains |
|------|--------------|----------|
| `session` | Each user prompt | Full tree + prompt metadata |
| `task` | Subagent completion | Full tree + task metadata |

---

## Condensation

When the user commits, the recording layer condenses checkpoints:

1. Creates sharded storage on orphan branch
2. Links user commit to checkpoint via trailers
3. Deletes ephemeral shadow branch
4. Preserves checkpoint metadata in SQLite

**Trigger:** `ACTIVE -> ACTIVE_COMMITTED` on `GitCommit` event

---

## Redaction

All hook inputs are redacted before storage:

- API keys, tokens, secrets
- High-entropy strings (potential credentials)
- Environment variables with sensitive names

Pattern library in `src/redaction/patterns.ts`.

---

## Hook Configuration

In `~/.claude/settings.json`:

```json
{
  "hooks": {
    "UserPromptSubmit": [
      {
        "matcher": "",
        "hooks": [{
          "type": "command",
          "command": "~/.claude/bin/orca-record prompt-submit"
        }]
      }
    ],
    "Stop": [...],
    "PreToolUse": [...],
    "PostToolUse": [...]
  }
}
```

---

## Integration with cognition-mcp

The recording layer integrates with cognition-mcp for cognitive fusion:

| cognition-mcp Operation | Purpose |
|-------------------------|---------|
| `recording_status` | Current session state |
| `recording_query` | Query sessions by date/files/quality |
| `recording_checkpoint` | Get checkpoint with cognitive context |
| `recording_compare` | Diff checkpoints: code + reasoning |
| `recording_quality` | Session quality analytics |
| `recording_explain` | Human-readable narrative |
| `recording_rewind` | Trigger rewind with cognitive state |

---

## Installation

```bash
# Build from source
cd /path/to/ORCA-OS/mcp/orca-record
bun run build

# Deploy binary
mkdir -p ~/.claude/bin
cp dist/orca-record ~/.claude/bin/orca-record
```

---

## Troubleshooting

**No checkpoints found:**
- Check if recording is active: `orca-record status`
- Verify git repository exists
- Check `.orca/recording.db` exists

**Restore failed:**
- Shadow branch may have been deleted after condensation
- Use `--session <id>` to specify exact session

**Hooks not firing:**
- Check `~/.claude/settings.json` hook configuration
- Verify binary path is correct
- Hooks must exit 0 (all errors swallowed)

---

_Source: `mcp/orca-record/`_
_Slash commands: `/checkpoints`, `/restore`, `/continue`, `/orca-status`_
