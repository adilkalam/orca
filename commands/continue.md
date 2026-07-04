---
description: Show recent recording sessions (telemetry) and route to the correct resume path
allowed-tools:
  - Bash
  - Read
---

# /continue - Session Resume Info

**PURPOSE**: Show recent recording sessions (telemetry) and route you to the right resume path. Recording `sess-...` ids are internal to orca-record; they are NOT Claude Code conversation ids, so they are shown for context only and must never be passed to `--continue`/`--resume`.

**EXPECTED OUTCOME**: A list of recent sessions plus the correct way to resume -- `/session-resume` when `active-task.md` is fresh, otherwise native `claude --continue`.

---

## Step 1: Check Recording Layer Status

**Verify recording database exists:**
```bash
if [ ! -f .orca/recording.db ]; then
  echo "No recording database found at .orca/recording.db"
  echo "Recording layer may not be active in this project."
  exit 0
fi
```

**Verify sqlite3 available:**
```bash
if ! command -v sqlite3 >/dev/null 2>&1; then
  echo "sqlite3 not found. Required for session queries."
  exit 0
fi
```

---

## Step 2: Parse Arguments

**Arguments:**
- (none): List recent sessions
- <session-id>: Show specific session's continue command

**Examples:**
```
/continue                           # List recent sessions
/continue sess-19c6983c46029c7      # Specific session info
```

---

## Step 3: Query Recent Sessions

**Query the recording database:**
```bash
sqlite3 .orca/recording.db "
SELECT
  s.id,
  s.started_at,
  s.ended_at,
  s.state,
  s.step_count,
  json_array_length(COALESCE(s.files_touched_json, '[]')) as files_touched
FROM sessions s
ORDER BY s.started_at DESC
LIMIT 5;
"
```

---

## Step 4: Format Output for User

**Display session list with continue commands:**
```
Recent sessions (recording telemetry):

  [1] sess-19c6983c46029c7  today, 14:30   -- 5 steps, 12 files, state: ended
  [2] sess-abc123def456     yesterday      -- 12 steps, 28 files, state: ended
  [3] sess-def789ghi012     2 days ago     -- 8 steps, 15 files, state: ended

To RESUME where you left off:
  - If you saved intent this session: run /session-resume (reads .orca/orchestration/active-task.md)
  - Otherwise: run `claude --continue` (native; reloads the most recent conversation -- takes NO id argument)

(The sess-... ids are orca-record internal identifiers for telemetry, not Claude conversation ids.)
```

**Time formatting:**
- Today: "today, HH:MM"
- Yesterday: "yesterday, HH:MM"
- This week: "N days ago, HH:MM"
- Older: "YYYY-MM-DD HH:MM"

---

## Step 5: Handle Specific Session Query

**If session ID provided:**
```bash
sqlite3 .orca/recording.db "
SELECT
  s.id,
  s.started_at,
  s.ended_at,
  s.state,
  s.shadow_branch
FROM sessions s
WHERE s.id = '<session-id>';
"
```

**Output:**
```
Session: sess-19c6983c46029c7

Started: 2026-02-17 14:30
Ended: 2026-02-17 16:45
State: ended
Shadow branch: orca/abc1234-def567

To resume: run /session-resume (if active-task.md is fresh) or native `claude --continue`.
(sess-... is an orca-record telemetry id -- not a Claude conversation id.)
```

---

## Edge Cases

**If no sessions found:**
```
No recording sessions found.

Recording layer may not have been active, or this is a new project.
Start a session normally and checkpoints will be created automatically.
```

**If session ID not found:**
```
Session not found: sess-abc123

Use /continue without arguments to see available sessions.
```

**If database missing:**
```
No recording database found at .orca/recording.db

The recording layer captures session history automatically.
If this is a new project, sessions will be recorded on next use.
```

---

## Related Commands

- `/orca-status` - Current recording session status

---

**Cross-Session Continuity:** `active-task.md` (written by `/session-save`, read by `/session-resume`) is the primary continuity mechanism -- it carries your intent and next steps. Native `claude --continue` (no argument) reloads the most recent conversation transcript. The recording layer's sessions/checkpoints are telemetry that contextualize both; their `sess-...` ids are internal and cannot be passed to `--continue`/`--resume`.

**Note:** `/continue` shows resume info; it does not perform the resume itself. Use `/session-resume` or run `claude --continue` in your terminal.
