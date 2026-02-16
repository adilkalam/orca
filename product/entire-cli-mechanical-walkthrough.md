# How Entire CLI Works: Full Mechanical Walkthrough

**Date**: 2026-02-13
**Source**: Direct analysis of `_explore/cli/` codebase (~50k+ lines Go)
**Version analyzed**: 0.4.4

---

## 1. Installation (`entire enable`)

Entire installs itself into two hook systems simultaneously:

**Claude Code hooks** (in `.claude/settings.local.json`):
- `SessionStart` -> `entire hooks claude-code session-start`
- `UserPromptSubmit` -> `entire hooks claude-code user-prompt-submit`
- `Stop` -> `entire hooks claude-code stop`
- `PreToolUse[Task]` -> `entire hooks claude-code pre-task`
- `PostToolUse[Task]` -> `entire hooks claude-code post-task`
- `PostToolUse[TodoWrite]` -> `entire hooks claude-code post-todo`

**Git hooks** (in `.git/hooks/`):
- `prepare-commit-msg` -- injects `Entire-Checkpoint: <id>` trailer
- `post-commit` -- fires `EventGitCommit` into the state machine
- `pre-push` -- optionally pushes the `entire/checkpoints/v1` orphan branch

It also creates:
- `.entire/` directory (gitignored) for settings/logs
- `entire/checkpoints/v1` orphan branch for permanent metadata storage

---

## 2. On Every User Prompt (`UserPromptSubmit` hook)

When you type a prompt and hit enter, BEFORE Claude sees it:

```
captureInitialState() fires:
  1. Records current untracked files (git status snapshot)
  2. Records current transcript position (line number in the JSONL)
  3. Saves this as "pre-prompt state" to .git/entire-sessions/
  4. Ensures git hooks and metadata branch exist
  5. Initializes session state if first prompt
  6. Fires EventTurnStart -> state machine moves IDLE -> ACTIVE
```

This is the "before" snapshot. Later, the "after" is computed by diffing.

---

## 3. During Agent Work (Subagent Hooks)

When Claude spawns subagents via the Task tool:

**PreToolUse[Task]:**
```
handleClaudeCodePreTask():
  1. Captures pre-task file state (another snapshot)
  2. Records the tool_use_id for later matching
```

**PostToolUse[Task]:**
```
handleClaudeCodePostTask():
  1. Finds the subagent's transcript file (if it exists)
  2. Parses transcript to extract modified files
  3. Diffs against pre-task state to find new/deleted files
  4. Calls strategy.SaveTaskCheckpoint() which:
     - Builds a git tree in-memory with code + metadata
     - Writes it as a commit on the shadow branch
     - No working directory changes, no commits on your branch
```

**PostToolUse[TodoWrite]:**
```
handleClaudeCodePostTodo():
  1. Only fires in subagent context (checks for active pre-task file)
  2. Detects file changes since last checkpoint
  3. Creates an incremental checkpoint on the shadow branch
  4. These are the fine-grained rewind points within a single task
```

---

## 4. When the Agent Finishes (`Stop` hook)

This is the big one -- `commitWithMetadata()`:

```
1. Wait for transcript flush
   - Claude Code's Stop hook fires BEFORE the transcript is fully written
   - Entire polls the transcript tail for a sentinel entry (up to 3 seconds)
   - This guarantees all prior entries have been flushed to disk

2. Copy transcript
   - Full JSONL transcript copied to .entire/metadata/<session-id>/full.jsonl

3. Determine transcript offset
   - Loads pre-prompt state to find where THIS turn's data starts
   - Only parses NEW lines since last checkpoint (not the whole file)

4. Extract data from transcript
   - User prompts (all prompts since last checkpoint)
   - Last assistant message (summary)
   - Modified files (from tool_use entries: Edit, Write, Bash)

5. Compute file changes
   - Diffs current git status against pre-prompt snapshot
   - Produces: modified files, new files, deleted files
   - Uses repo root (not cwd) for path resolution

6. Build SaveContext and delegate to strategy
   - SaveContext contains: session ID, files lists, metadata dir,
     commit message, transcript path, author info, agent type,
     transcript position, token usage

7. Strategy.SaveChanges() -- for manual-commit:
   - Builds a git tree in-memory containing:
     * The actual working directory files (code)
     * .entire/metadata/<session-id>/ (transcript, prompts, context)
   - Creates a commit on the shadow branch:
     entire/<HEAD-hash[:7]>-<worktreeHash[:6]>
   - Commit has trailers: Entire-Session, Entire-Metadata, Entire-Strategy
   - NOTHING touches your working branch

8. Fire EventTurnEnd
   - State machine: ACTIVE -> IDLE
   - If ACTIVE_COMMITTED -> IDLE: triggers ActionCondense (see below)

9. Cleanup pre-prompt state
```

---

## 5. When You Make a Git Commit

**prepare-commit-msg hook:**
```
1. Generates a 12-hex-char checkpoint ID
2. Appends "Entire-Checkpoint: <id>" trailer to your commit message
3. User can delete it before saving (manual-commit mode)
```

**post-commit hook:**
```
1. Fires EventGitCommit into the state machine
2. If IDLE + GitCommit -> triggers ActionCondense:

   Condensation:
   a. Reads all session data from the shadow branch
   b. Writes it to entire/checkpoints/v1 orphan branch
      at sharded path: <id[:2]>/<id[2:]>/
      containing: metadata.json, full.jsonl, prompt.txt, context.md
   c. Commit subject: "Checkpoint: <checkpoint-id>"
   d. Commit trailers: Entire-Session, Entire-Strategy, Entire-Agent
   e. Deletes the shadow branch (cleanup)

3. If ACTIVE + GitCommit -> ACTIVE_COMMITTED:
   - Condensation deferred until agent finishes (TurnEnd)
   - Shadow branch migrated to new HEAD hash
```

---

## 6. The Shadow Branch System

This is the clever part. In manual-commit mode:

```
Your branch:     main (untouched)
Shadow branch:   entire/abc1234-def567
                 (named from HEAD hash + worktree hash)

Shadow branch commits contain:
  - Full working tree (your code at that point)
  - .entire/metadata/ (transcript, prompts, context)
  - Trailers linking to session

When you commit:
  Shadow branch data -> condensed to entire/checkpoints/v1
  Shadow branch -> deleted

When HEAD changes (pull/rebase):
  Shadow branch renamed: entire/old-hash -> entire/new-hash
  Checkpoints preserved
```

The shadow branch uses go-git's plumbing APIs to build trees in-memory -- it never touches the working directory or your index. It's pure git object creation.

### Metadata Structure on Shadow Branches

```
.entire/metadata/<session-id>/
  full.jsonl               # Session transcript
  prompt.txt               # User prompts
  context.md               # Generated context
  tasks/<tool-use-id>/     # Task checkpoints
    checkpoint.json        # UUID mapping for rewind
    agent-<id>.jsonl       # Subagent transcript
```

### Metadata Structure on Permanent Branch (`entire/checkpoints/v1`)

```
<checkpoint-id[:2]>/<checkpoint-id[2:]>/
  metadata.json            # CheckpointSummary (aggregated stats)
  0/                       # First session (0-based indexing)
    metadata.json          # Session-specific metadata
    full.jsonl             # Session transcript
    prompt.txt             # User prompts
    context.md             # Generated context
    content_hash.txt       # SHA256 of transcript
    tasks/<tool-use-id>/   # Task checkpoints (if applicable)
  1/                       # Second session (if multiple)
    ...
```

The sharded path format (`<id[:2]>/<id[2:]>/`) creates 256 directories to prevent bloat.

---

## 7. Bidirectional Checkpoint Linking

```
User commit -> Metadata:
  Extract "Entire-Checkpoint: a3b2c4d5e6f7" trailer from commit
  -> Look up a3/b2c4d5e6f7/ directory on entire/checkpoints/v1 branch

Metadata -> User commits:
  Given checkpoint ID a3b2c4d5e6f7
  -> Search user branch for commits with "Entire-Checkpoint: a3b2c4d5e6f7" trailer

Example:
  User's commit (on main):
    "Implement login feature
     Entire-Checkpoint: a3b2c4d5e6f7"
          |
          | linked via checkpoint ID
          |
  entire/checkpoints/v1 commit:
    Subject: "Checkpoint: a3b2c4d5e6f7"
    Tree: a3/b2c4d5e6f7/metadata.json, full.jsonl, prompt.txt, context.md
```

---

## 8. Rewind

```
entire rewind:
  1. Lists all commits on the shadow branch with Entire-Session trailer
  2. Presents them as checkpoints (with timestamp, prompt, files touched)
  3. User picks one
  4. Strategy restores files from that commit's tree
     - Manual-commit: reads tree objects and writes files to working directory
     - Auto-commit: git reset --hard to the checkpoint commit
  5. Working directory now matches the state at that checkpoint
```

---

## 9. Resume

```
entire resume:
  1. Checks out the target branch
  2. Restores the latest checkpointed session metadata
  3. Prints the command to continue the agent session where you left off
  4. Session continues with full context from the checkpoint
```

---

## 10. Secret Redaction

Before any transcript data hits git:

```
redact.String(content):
  Layer 1: Entropy-based
    - Regex finds alphanumeric sequences >= 10 chars
    - Shannon entropy calculated for each match
    - If entropy > 4.5, marked for redaction

  Layer 2: Pattern-based (gitleaks)
    - 180+ regex patterns for known secret formats
    - AWS keys, GitHub tokens, private keys, etc.

  Merge overlapping regions, replace with "REDACTED"

Special handling for JSONL:
  - Parses each line as JSON
  - Walks the JSON tree
  - Skips: fields ending in "id", "signature", image/base64 objects
  - Redacts string values that match
  - Replaces in the raw JSON to preserve formatting
```

---

## 11. The State Machine

```
IDLE --TurnStart--> ACTIVE --TurnEnd--> IDLE
                      |                   |
                    GitCommit           GitCommit
                      |                   |
                      v                   v
              ACTIVE_COMMITTED         Condense
                      |
                    TurnEnd
                      |
                      v
                   Condense

Any --SessionStop--> ENDED --SessionStart--> IDLE
```

**Phases:** `IDLE`, `ACTIVE`, `ACTIVE_COMMITTED`, `ENDED`

**Events:** `TurnStart`, `TurnEnd`, `GitCommit`, `SessionStart`, `SessionStop`

**Actions emitted by transitions:**
- `Condense` -- copy session data from shadow branch to permanent branch
- `CondenseIfFilesTouched` -- condense only if files were modified
- `DiscardIfNoFiles` -- discard session if no files were touched
- `MigrateShadowBranch` -- rename shadow branch to match new HEAD
- `WarnStaleSession` -- warn about orphaned active sessions
- `ClearEndedAt` -- clear end timestamp on session re-entry
- `UpdateLastInteraction` -- update interaction timestamp

Key: the state machine determines WHEN condensation happens. If you commit while the agent is working (ACTIVE + GitCommit), condensation is DEFERRED until the turn ends (ACTIVE_COMMITTED + TurnEnd -> Condense). This prevents data loss from mid-turn commits.

---

## 12. Multi-Session and Worktree Handling

**Concurrent sessions in same directory:**
- Both sessions' checkpoints interleave on the same shadow branch
- Each checkpoint's `RewindPoint` includes `SessionID` and `SessionPrompt`
- On commit, all sessions condensed together with numbered subfolders

**Different git worktrees:**
- Each worktree gets its own shadow branch namespace (worktree hash in branch name)
- No conflicts between worktrees

**Shadow branch migration (pull/rebase):**
- Detection: base commit changed AND old shadow branch still exists
- Action: rename `entire/<old-hash>-<worktreeHash>` to `entire/<new-hash>-<worktreeHash>`
- Checkpoints preserved seamlessly

**Orphaned shadow branches:**
- If shadow branch exists without session state file, it's reset on next session start
- If session state file exists (concurrent session), `SessionIDConflictError` returned

---

## 13. Two Strategies

### Manual-Commit (default)

- Never creates commits on your working branch
- Shadow branches store checkpoints between commits
- Condensation happens when YOU commit
- Safe on main/master (never modifies commit history)
- Uses go-git plumbing APIs for in-memory tree building

### Auto-Commit

- Creates clean commits on your active branch after each agent response
- Commits have `Entire-Checkpoint` trailer only (clean history)
- Metadata stored on orphan `entire/checkpoints/v1` branch
- Full rewind if commit is only on current branch (not in main)
- Logs-only rewind if commit is in main

---

## 14. Hook Registry Architecture

```go
// Maps (agentName, hookName) -> handler function
hookRegistry = map[AgentName]map[string]HookHandlerFunc{}

// Claude Code hooks registered:
claude-code/session-start  -> handleClaudeCodeSessionStart()
claude-code/session-end    -> handleClaudeCodeSessionEnd()
claude-code/stop           -> commitWithMetadata()
claude-code/user-prompt-submit -> captureInitialState()
claude-code/pre-task       -> handleClaudeCodePreTask()
claude-code/post-task      -> handleClaudeCodePostTask()
claude-code/post-todo      -> handleClaudeCodePostTodo()

// Gemini CLI hooks registered:
gemini/session-start       -> handleGeminiSessionStart()
gemini/session-end         -> handleGeminiSessionEnd()
gemini/before-tool         -> handleGeminiBeforeTool()
gemini/after-tool          -> handleGeminiAfterTool()
gemini/before-agent        -> handleGeminiBeforeAgent()
gemini/after-agent         -> handleGeminiAfterAgent()
gemini/before-model        -> handleGeminiBeforeModel()
gemini/after-model         -> handleGeminiAfterModel()
gemini/before-tool-selection -> handleGeminiBeforeToolSelection()
gemini/pre-compress        -> handleGeminiPreCompress()
gemini/notification        -> handleGeminiNotification()
```

The `Agent` interface abstracts agent-specific behavior:
- `Name()`, `Type()`, `DetectPresence()`
- `ParseHookInput()` -- agent-specific input parsing
- `GetSessionDir()`, `ReadSession()`, `WriteSession()`
- `FormatResumeCommand()` -- generates the CLI command to resume

---

## 15. Technical Profile

- **Language**: Go 1.25.x
- **Dependencies**: go-git (git plumbing), cobra (CLI), charmbracelet/huh (TUI), gitleaks (secret detection)
- **Codebase**: ~50k+ lines core code
- **Test coverage**: Extensive (explain_test.go alone is 119k)
- **Agent support**: Claude Code + Gemini CLI, designed for more via Agent interface
- **License**: MIT
- **Distribution**: Homebrew, Go install

---

## The Core Insight

Entire is a **parallel git history system**. Your branch stays clean. All session data lives in git objects on ephemeral (shadow) and permanent (orphan) branches. The hook system captures events at the right lifecycle points. The state machine ensures condensation happens at safe moments. Secret redaction happens before storage. And the bidirectional checkpoint ID links the two histories together.

It's infrastructure for the outer loop (managing the human-AI workflow), not the inner loop (what happens during reasoning). It records what happened. It doesn't change what happens.

---

*Generated from direct codebase analysis of `_explore/cli/`. Key source files: hooks.go, hooks_claudecode_handlers.go, hook_registry.go, session/phase.go, strategy/strategy.go, strategy/manual_commit.go, redact/redact.go, summarize/summarize.go, checkpoint/.*
