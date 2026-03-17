# OS 7.0 Recording Layer Reference

**Last Updated:** 2026-02-26
**Version:** orca-record v0.4.0

---

## Overview

The recording layer (`orca-record`) captures session activity automatically via Claude Code hooks. Every prompt records an event and creates a checkpoint tracking which files changed. This data powers Workshop session notes, cognition-mcp recording reads, and session-start context.

---

## Quick Commands

| Command | Purpose |
|---------|---------|
| `/orca-status` | Current session status |
| `/continue` | Resume info for previous sessions |

---

## CLI Commands

The binary lives at `~/.claude/bin/orca-record`.

### User Commands

```bash
# Session status
orca-record status

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
```

---

## Session States

```
IDLE
  | SessionStart/TurnStart
  v
ACTIVE
  | TurnEnd -> ACTIVE (same turn continues)
  | SessionStop
  v
ENDED
  | SessionStart -> ACTIVE (new session)
```

**States:**
- `IDLE` - No active session
- `ACTIVE` - Session in progress, events being recorded
- `ACTIVE_COMMITTED` - Legacy state (backward compat with existing DBs)
- `ENDED` - Session completed

---

## Storage Locations

| Location | Contents |
|----------|----------|
| `.orca/recording.db` | SQLite database (per-project, gitignored) |
| `.git/orca-sessions/<id>.json` | Session state files |

---

## Database Schema

```sql
-- Sessions
sessions (id, started_at, ended_at, state, base_commit, shadow_branch, ...)

-- Checkpoints (one per turn or task completion)
checkpoints (id, session_id, type, shadow_commit, prompt_summary, files_*)

-- Events (full hook log)
events (id, session_id, event_type, hook_input_json, git_head, ...)

-- Transcripts (legacy table, no longer written to)
transcripts (session_id, transcript_path, transcript_data, redacted)

-- Condensed (legacy table, no longer written to)
condensed (checkpoint_id, session_id, commit_hash, orphan_commit, ...)
```

Schema is preserved for cognition-mcp backward compatibility (READ-ONLY queries).

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

The recording layer integrates with cognition-mcp for session queries:

| cognition-mcp Operation | Purpose |
|-------------------------|---------|
| `recording_status` | Current session state |
| `recording_query` | Query sessions by date/files |
| `recording_checkpoint` | Get checkpoint details |
| `recording_compare` | Diff checkpoints |
| `recording_quality` | Session quality analytics |
| `recording_explain` | Human-readable narrative |
| `recording_rewind` | Query rewind data from recording history |

These operations READ from `.orca/recording.db` -- they require no changes.

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

**No active session:**
- Check if recording is active: `orca-record status`
- Verify git repository exists
- Check `.orca/recording.db` exists

**Hooks not firing:**
- Check `~/.claude/settings.json` hook configuration
- Verify binary path is correct
- Hooks must exit 0 (all errors swallowed)

---

_Source: `mcp/orca-record/`_
_Slash commands: `/continue`, `/orca-status`_
