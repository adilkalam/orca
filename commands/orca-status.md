---
description: Show current ORCA recording session status
allowed-tools:
  - Bash
---

# /orca-status - Recording Session Status

**PURPOSE**: Show current recording session status including session ID, state, step count, and files touched.

**EXPECTED OUTCOME**: Quick status overview of the active recording session.

---

## Step 1: Check Recording Layer Status

**Verify orca-record binary exists:**
```bash
if [ ! -f ~/.claude/bin/orca-record ]; then
  echo "orca-record not installed. Run: cd ~/.claude && ./install.sh"
  exit 0
fi
```

**Verify git repository:**
```bash
if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "Not in a git repository. Recording layer requires git."
  exit 0
fi
```

---

## Step 2: Execute Status Command

**Run orca-record status:**
```bash
~/.claude/bin/orca-record status
```

**Expected CLI output format:**
```
Session: sess-19c6983c46029c7
State: ACTIVE
Started: 2026-02-17T14:30:00.000Z
Steps: 5
Files touched: 12
```

---

## Step 3: Format Output for User

**Display formatted status:**
```
Recording Status

Session: sess-19c6983c46029c7
State: ACTIVE
Started: 2026-02-17 14:30
Steps: 5
Files touched: 12
```

**State values:**
- `ACTIVE` - Active session, events being recorded
- `IDLE` - No active session
- `ENDED` - Session completed

---

## Step 4: No-Session Case

**If no active session:**
```
Recording Status

No active recording session.

Recording starts automatically when you begin working.
Use /continue to see previous sessions.
```

---

## Step 5: Surface Continuity State (active-task.md is primary)

Recording is telemetry; the primary continuity artifact is `active-task.md`. Surface its
freshness so the user knows whether `/session-resume` will restore intent:

```bash
AT=.orca/orchestration/active-task.md
if [ -f "$AT" ]; then
  mtime=$(stat -f %m "$AT" 2>/dev/null || stat -c %Y "$AT" 2>/dev/null)
  age_h=$(( ( $(date +%s) - mtime ) / 3600 ))
  if [ "$age_h" -lt 48 ]; then
    echo "active-task.md: present, ${age_h}h old -- fresh; run /session-resume to restore intent"
  else
    echo "active-task.md: present, ${age_h}h old -- stale (>48h); re-run /session-save"
  fi
else
  echo "active-task.md: none -- run /session-save to capture intent for the next session"
fi
```

---

## Edge Cases

**If CLI binary missing:**
```
orca-record CLI not found at ~/.claude/bin/orca-record

To install:
1. cd $ORCA_OS_PATH/mcp/orca-record
2. bun run build
3. cp dist/orca-record ~/.claude/bin/
```

**If not in git repo:**
```
Not in a git repository.

The recording layer requires git for session state storage.
Initialize a git repository to enable recording.
```

---

## Related Commands

- `/continue` - Resume info for previous sessions

---

**Recording Layer:** The recording layer (orca-record) automatically captures session activity via Claude Code hooks. This command shows the current state without modifying anything.

**Note:** Named `/orca-status` to avoid conflict with Claude Code's built-in `/status` command.
