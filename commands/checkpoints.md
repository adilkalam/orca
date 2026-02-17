---
description: Explore recording checkpoints and session history
allowed-tools: Bash, Read
---

# /checkpoints - Explore Checkpoints

**PURPOSE**: View checkpoint history from the ORCA recording layer. Shows timestamped snapshots with file change summaries, enabling navigation through session history.

**EXPECTED OUTCOME**: Numbered list of recent checkpoints that can be referenced with /restore.

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
- (none): Show last 10 checkpoints with file details
- N: Show last N checkpoints (e.g., `/checkpoints 20`)
- `--session <id>`: Filter to specific session
- `--list`: Output machine-readable JSON (for scripting)

**Examples:**
```
/checkpoints                    # Last 10 checkpoints with files
/checkpoints 25                 # Last 25 checkpoints
/checkpoints --session sess-abc # Specific session
/checkpoints --list             # JSON output for scripting
```

---

## Step 3: Fetch Checkpoints

**Run orca-record checkpoints command:**
```bash
~/.claude/bin/orca-record checkpoints [--session <id>]
```

**Expected CLI output format:**
```
Checkpoints for session sess-19c6983c46029c7:

[1] abc123def456 (task)
    Time: 2026-02-17 14:35
    Prompt: Fix login redirect
    Files: +2 ~5 -0

[2] def789ghi012
    Time: 2026-02-17 14:28
    Prompt: Add authentication
    Files: +3 ~2 -1

Total: 5 checkpoint(s)
```

---

## Step 4: Format Output for User

**Display numbered list with file details:**
```
Recent checkpoints:

  [1] 14:35 - "Fix login redirect"
      + src/auth.ts
      + src/login.ts
      ~ src/app.tsx
      ~ package.json
      ~ tsconfig.json

  [2] 14:28 - "Add authentication" (task)
      + src/middleware.ts
      + src/session.ts
      + tests/auth.test.ts
      ~ src/index.ts
      ~ src/routes.ts
      - src/old-auth.ts

  [3] 14:15 - "Update database schema"
      ~ prisma/schema.prisma
      ~ src/db.ts
      ~ src/models.ts
      ~ tests/db.test.ts

  [4] 13:58 - "Initial project setup"
      + (12 files created)

  [5] 13:45 - Session start

Total: 5 checkpoint(s)

Use /restore N to restore (e.g., /restore 2)
```

**Key formatting rules:**
- Use numbers [1], [2], [3] for easy reference
- Show time (HH:MM) from timestamp
- Include prompt summary in quotes
- Mark task checkpoints with "(task)"
- Show actual file names with change type prefix:
  - `+` = created
  - `~` = modified
  - `-` = deleted
- For large file counts (>8 files), summarize: `+ (12 files created)`

---

## Step 5: Handle --list Flag (JSON Output)

**If `--list` flag is present, output JSON instead of formatted text:**

```json
{
  "session": "sess-19c6983c46029c7",
  "checkpoints": [
    {
      "index": 1,
      "id": "abc123def456",
      "type": "prompt",
      "time": "2026-02-17T14:35:00Z",
      "prompt": "Fix login redirect",
      "files": {
        "created": ["src/auth.ts", "src/login.ts"],
        "modified": ["src/app.tsx", "package.json", "tsconfig.json"],
        "deleted": []
      }
    },
    {
      "index": 2,
      "id": "def789ghi012",
      "type": "task",
      "time": "2026-02-17T14:28:00Z",
      "prompt": "Add authentication",
      "files": {
        "created": ["src/middleware.ts", "src/session.ts", "tests/auth.test.ts"],
        "modified": ["src/index.ts", "src/routes.ts"],
        "deleted": ["src/old-auth.ts"]
      }
    }
  ],
  "total": 5
}
```

**JSON enables scripting:**
```bash
# Get checkpoint IDs programmatically
claude "/checkpoints --list" | jq '.checkpoints[].id'

# Find checkpoint with specific file
claude "/checkpoints --list" | jq '.checkpoints[] | select(.files.modified[] | contains("auth"))'
```

---

## Step 6: Store Checkpoint Mapping

**For /restore to work, remember the number-to-ID mapping:**
- [1] -> abc123def456
- [2] -> def789ghi012
- etc.

The checkpoint IDs are displayed by the CLI. When user runs `/restore 2`, use the corresponding checkpoint ID.

---

## Edge Cases

**If no checkpoints found:**
```
No checkpoints found.

Recording may not be active in this project.
Run `~/.claude/bin/orca-record status` to check.
```

**If no active session:**
```
No active recording session.
Use /checkpoints --session <id> to query a specific session.
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

- `/restore` - Restore to a checkpoint
- `/orca-status` - Current recording session status
- `/continue` - Resume info for previous sessions

---

**Recording Integration:** This command wraps `~/.claude/bin/orca-record checkpoints`. The recording layer captures checkpoints automatically via Claude Code hooks (UserPromptSubmit, Stop, PostToolUse[Task]).
