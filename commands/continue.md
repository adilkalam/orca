---
description: Show resume info for previous recording sessions
allowed-tools: [Bash, Read]
---

# /continue - Session Resume Info

**PURPOSE**: Show resume information for previous recording sessions. Displays `claude --continue` commands for easy copy-paste to continue where you left off.

**EXPECTED OUTCOME**: List of recent sessions with ready-to-use continue commands.

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
  (SELECT COUNT(*) FROM events e WHERE e.session_id = s.id AND e.type = 'checkpoint') as checkpoint_count,
  (SELECT COUNT(DISTINCT json_each.value)
   FROM events e, json_each(e.files_new || e.files_modified || e.files_deleted)
   WHERE e.session_id = s.id) as files_touched
FROM sessions s
ORDER BY s.started_at DESC
LIMIT 5;
"
```

---

## Step 4: Format Output for User

**Display session list with continue commands:**
```
Recent sessions:

  [1] sess-19c6983c46029c7 (today, 14:30)
      5 checkpoints, 12 files touched
      > claude --continue sess-19c6983c46029c7

  [2] sess-abc123def456 (yesterday, 16:45)
      12 checkpoints, 28 files touched
      > claude --continue sess-abc123def456

  [3] sess-def789ghi012 (2 days ago, 10:15)
      8 checkpoints, 15 files touched
      > claude --continue sess-def789ghi012

To continue a session, run the command shown above.
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

To continue this session:
  claude --continue sess-19c6983c46029c7

This will restore your previous conversation context.
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

- `/checkpoints` - View checkpoint list
- `/restore` - Restore to a checkpoint
- `/orca-status` - Current recording session status

---

**Cross-Session Continuity:** The `claude --continue` command is a native Claude Code feature that loads the previous session's conversation transcript. Combined with the recording layer's checkpoints, you can resume exactly where you left off.

**Note:** `/continue` shows resume info; it does not perform the continue action itself. Copy the displayed command and run it in your terminal.
