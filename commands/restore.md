---
description: Restore working directory to a checkpoint
allowed-tools: Bash, Read, AskUserQuestion
---

# /restore - Restore to Checkpoint

**PURPOSE**: Restore working directory files to a specific checkpoint from the ORCA recording layer. This undoes file changes made after the selected checkpoint.

**EXPECTED OUTCOME**: Files restored to checkpoint state, with summary of changes and `claude --continue` hint.

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

## Step 2: Parse Arguments

**Arguments:**
- (none): Show checkpoint list (same as /checkpoints)
- N: Restore to checkpoint #N from last /checkpoints list
- <checkpoint-id>: Restore to checkpoint by full ID
- --logs-only: Restore transcript only (no file changes)

**Examples:**
```
/restore           # Show list
/restore 2         # Restore to #2 from list
/restore abc123def456   # Restore by ID
/restore abc123def456 --logs-only   # Transcript only
```

---

## Step 2b: Handle --logs-only Flag

**If `--logs-only` flag is present in the arguments:**

1. Extract the checkpoint ID (remove `--logs-only` from arguments)
2. If checkpoint is a number, map it to checkpoint ID using `~/.claude/bin/orca-record checkpoints`
3. Run transcript-only restore:

```bash
~/.claude/bin/orca-record rewind <checkpoint-id> --logs-only
```

**Expected output:**
```
Transcript restored to: ~/.claude/projects/-Users-adilkalam-project/sess-abc123.jsonl
Resume with: claude --continue sess-abc123
```

**Display to user:**
```
Transcript restored (files unchanged).
Resume with: claude --continue <session-id>
```

**Then STOP -- do not proceed to file restore steps.**

---

## Step 3: Handle No-Argument Case

**If no argument provided, show checkpoint list:**
```
No checkpoint specified. Here are recent checkpoints:

  [1] 14:35 - "Fix login redirect" (+2 ~5 -0)
  [2] 14:28 - "Add authentication" (task) (+3 ~2 -1)
  [3] 14:15 - "Update database schema" (+0 ~4 -0)

Use /restore N to restore (e.g., /restore 2)
```

This provides the same output as `/checkpoints` for convenience.

---

## Step 4: Map Number to Checkpoint ID

**If user provides a number (1, 2, 3, etc.):**
1. Run `~/.claude/bin/orca-record checkpoints` to get current list
2. Map the number to the checkpoint ID from the output
3. Use the checkpoint ID for the rewind operation

**Example mapping:**
- User: `/restore 2`
- Lookup: [2] corresponds to checkpoint ID `def789ghi012`
- Execute: `~/.claude/bin/orca-record rewind def789ghi012`

**If user provides a full checkpoint ID (12+ chars), use it directly.**

---

## Step 5: Preview Changes (BEFORE Restore)

**CRITICAL: Show user what will change BEFORE executing restore.**

**First, get checkpoint details to show file preview:**
```bash
~/.claude/bin/orca-record checkpoints
```

**Parse the checkpoint info and display preview:**
```
Restore to checkpoint [2]?

  Time: 14:28
  Prompt: "Add authentication"

Files that will be affected:
  + src/middleware.ts      (will be created)
  + src/session.ts         (will be created)
  + tests/auth.test.ts     (will be created)
  ~ src/index.ts           (will be modified)
  ~ src/routes.ts          (will be modified)
  - src/new-feature.ts     (will be deleted)

This will discard changes made after this checkpoint.
```

---

## Step 6: Confirm with User

**MANDATORY: Ask for confirmation before destructive action.**

Use AskUserQuestion to confirm:
```
Proceed with restore?
  [Yes] - Restore files to checkpoint state
  [No]  - Cancel and keep current state
```

**If user selects "No" or cancels:**
```
Restore cancelled. No files were changed.
```

**Only proceed to Step 7 if user confirms "Yes".**

---

## Step 7: Execute Restore

**Run orca-record rewind command:**
```bash
~/.claude/bin/orca-record rewind <checkpoint-id>
```

**Expected CLI output format:**
```
Rewinding to checkpoint def789ghi012...

Restored to checkpoint def789ghi012
Commit: 7a8b9c0

Created (2):
  + src/auth.ts
  + src/login.ts

Restored (3):
  ~ src/app.tsx
  ~ package.json
  ~ tsconfig.json

Deleted (0):

Total files affected: 5
```

---

## Step 8: Format Output for User

**Display restore summary:**
```
Restored to checkpoint [2]

Checkpoint: def789ghi012
Commit: 7a8b9c0

Created (2):
  + src/auth.ts
  + src/login.ts

Modified (3):
  ~ src/app.tsx
  ~ package.json
  ~ tsconfig.json

Total files affected: 5

To continue from this point in a new session:
  claude --continue <session-id>
```

---

## Step 9: Post-Restore Hint

**Always include the continue hint:**
```
To continue from this point in a new session:
  claude --continue <session-id>

Current session will continue with files at this checkpoint state.
```

---

## Edge Cases

**If checkpoint not found:**
```
Checkpoint not found: abc123

The checkpoint may not exist on the current shadow branch.
Use /checkpoints to see available checkpoints.
```

**If number out of range:**
```
Checkpoint 15 not found.
Only 5 checkpoints available. Use /checkpoints to see the list.
```

**If no active session:**
```
No active recording session.
Cannot restore without an active session.
```

**If CLI binary missing:**
```
orca-record CLI not found at ~/.claude/bin/orca-record

To install:
1. cd $ORCA_OS_PATH/mcp/orca-record
2. bun run build
3. cp dist/orca-record ~/.claude/bin/
```

---

## Related Commands

- `/checkpoints` - View checkpoint list
- `/orca-status` - Current recording session status
- `/continue` - Resume info for previous sessions

---

**Recording Integration:** This command wraps `~/.claude/bin/orca-record rewind <id>`. Restore operations are git-based: files are checked out from the shadow branch checkpoint commit.

**Safety Note:** Restore overwrites uncommitted changes to affected files. Git working directory is modified directly.
