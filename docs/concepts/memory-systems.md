# Memory Systems

**Version:** OS 7.0 | **Last Updated:** 2026-02-26

OS 7.0 uses multiple memory systems to maintain context across sessions and provide relevant information to agents.

## Memory Architecture

```

                    Memory-First Flow                     

                                                         
  1. Workshop (fast, local)                              
     ↓                                                   
  2. code-index.db (semantic search)                           
     ↓                                                   
  3. ProjectContext MCP (expensive, comprehensive)       
                                                         

```

## Workshop

**What:** CLI tool for persistent project memory.

**Stores:**
- **Decisions** - architectural choices with reasoning
- **Gotchas** - pitfalls and issues to avoid
- **Preferences** - code style, patterns, conventions
- **Goals** - current objectives
- **Notes** - general context

**Commands:**
```bash
# Query
workshop why "topic"              # THE KILLER FEATURE - why did we do X?
workshop search "query"           # Search all entries
workshop recent                   # Recent activity
workshop context                  # Session summary

# Record
workshop decision "text" -r "reasoning"
workshop gotcha "text" -t tag1 -t tag2
workshop preference "text" --category code_style
workshop goal add "text"
```

**NEVER call `workshop note` directly** -- only commands (deepthink, think, problem-solve, etc.) write notes to Workshop via their harvest phase.

**Location:** `.claude/memory/workshop.db`

**Retention:** Workshop enforces a `maxEntries=500` cap with prune-on-write. When the cap is reached, unpinned entries are pruned oldest-first. Entries tagged as preferences or antipatterns are auto-pinned to survive pruning.

## code-index.db

**What:** Semantic code search and symbol indexing.

**Stores:**
- Code file embeddings
- Symbol definitions (functions, classes, types)
- File index and component registry

**Commands:**
```bash
# Via unified search
python3 ~/.claude/scripts/memory-search-unified.py "query" --mode all --top-k 10

# Via project-code command
/project-code search "query"
/project-code symbol "SymbolName"
```

**Location:** `.claude/memory/code-index.db`

## ProjectContext MCP

**What:** MCP server providing comprehensive project context.

**Returns:** ContextBundle containing:
- `relevantFiles` - files related to the task
- `projectState` - structure summary, dependencies, component names
- `pastDecisions` - from Workshop
- `relatedStandards` - domain-specific standards
- `similarTasks` - previous task history

**Usage:**
```typescript
mcp__project-context__query_context({
  domain: "ios",                    // ios, nextjs, expo, etc.
  task: "add haptic feedback",      // short task description
  projectPath: "/path/to/project",  // optional, auto-detects
  maxFiles: 10,                     // relevant files to return
  includeHistory: true              // include task history
})
```

**Also provides:**
- `save_decision` - record architectural decisions
- `save_standard` - codify recurring rules
- `save_task_history` - log task outcomes (writes 1 merged entry per task)
- `index_project` - index project files for semantic search
- `reanalyze_project` - re-analyze project state
- `recall` - retrieve archived content by ID

### Implementation Details

The ProjectContext MCP uses a hybrid approach for Workshop integration:

**Reads (SQLite)**: Query methods (`queryDecisions`, `queryStandards`, `queryTaskHistory`) read directly from `workshop.db` using `better-sqlite3`. This provides reliable structured data access.

**Writes (CLI)**: Save methods (`saveDecision`, `saveGotcha`, `saveTaskHistory`) use the Workshop CLI. This ensures proper schema migrations and CLI compatibility.

**Symlink Consolidation**: On macOS/Linux, `.workshop` is automatically symlinked to `.claude/memory` so the Workshop CLI defaults to the correct location.

**Maintenance -- Native Module Rebuilds**: The `better-sqlite3` module is compiled against a specific Node ABI. After upgrading Node.js, rebuild it in the deployed directory:

```bash
cd ~/.claude/mcp/project-context-server && npm rebuild better-sqlite3
```

Without this, all SQLite read methods (`queryStandards`, `queryDecisions`, `queryTaskHistory`) silently return empty results.



## Memory-First Pattern

OS 7.0 checks fast, local memory before expensive queries:

```bash
# Step 1: Check Workshop for relevant decisions/gotchas
workshop why "iOS haptic feedback"

# Step 2: Check code-index.db for relevant code/symbols
python3 ~/.claude/scripts/memory-search-unified.py "haptic" --mode all --top-k 5

# Step 3: Only then call ProjectContext if needed
mcp__project-context__query_context(...)
```

**Benefits:**
- Faster response for known patterns
- Reduced token usage
- Surfaces past decisions and gotchas early
- May skip or reduce ProjectContext scope

## How Memory Flows to Agents

```
User Request
    
    

  /orca-{domain} 
   (orchestrator)

         
          1. Memory search
         

    Workshop     → Decisions, gotchas, preferences
    code-index.db      → Relevant code, symbols

         
          2. ProjectContext query
         

 ProjectContext  → ContextBundle
      MCP        

         
          3. Delegate with context
         

   Specialist    → Has: memory hints + ContextBundle
     Agent       

```

## Persisting Learnings

After task completion, orchestrators persist learnings:

```typescript
// Record task outcome
mcp__project-context__save_task_history({
  domain: "ios",
  task: "add haptic feedback to save button",
  outcome: "success",
  files_modified: ["SaveButton.swift"],
  learnings: "Used UIImpactFeedbackGenerator with .medium style"
})

// Record architectural decision
mcp__project-context__save_decision({
  domain: "ios",
  decision: "Use UIImpactFeedbackGenerator for all button haptics",
  reasoning: "Consistent feel, system-managed intensity",
  tags: ["haptics", "ux", "buttons"]
})

// Codify recurring rule (from /audit)
mcp__project-context__save_standard({
  what_happened: "Inconsistent haptic patterns across buttons",
  cost: "User confusion, inconsistent feel",
  rule: "All interactive buttons must use UIImpactFeedbackGenerator.medium",
  domain: "ios"
})
```

## Memory Layer 5: Recording Database (.orca/recording.db)

**What:** Per-project SQLite database that records session activity and cognitive state via hooks.

**Overview:**
The recording layer (added in OS 7.0) provides session-level persistence that goes beyond Workshop's decision/gotcha entries. It captures the timeline of what happened in each session: prompts, tool calls, file changes, and checkpoints.

**Storage:** `.orca/recording.db` (per-project, gitignored)

**Key Tables:**
- `sessions` -- Session metadata (start/end, branch, status)
- `checkpoints` -- Per-turn snapshots with file diffs and cognitive links
- `events` -- Tool calls, prompts, and state transitions

**Architecture (v0.4.0):**
The recording layer consists of hooks + SQLite + state machine. The git shadow branch layer (`orca/<hash>-<wt>`) and orphan branch (`orca/checkpoints/v1`) were removed in v0.4.0. Code restoration (rewind) is no longer available.

**Cognitive Fusion:**
Checkpoints link session state to cognition-mcp reasoning chains via 7 recording operations: `recording_status`, `recording_query`, `recording_checkpoint`, `recording_compare`, `recording_quality`, `recording_explain`, `recording_rewind`. Note: `recording_rewind` queries checkpoint data but code restoration is no longer available since v0.4.0.

**CLI:** `orca-record` (Bun-compiled binary at `~/.claude/bin/orca-record`) with 7 commands (5 hook + 2 user).

**Supersedes:** Telemetry system (`.claude/telemetry/`) which is now deprecated.

## Recording Context Injection (OS 7.0)

Commands use the recording layer to inject prior session context before delegating
to agents. This provides continuity across sessions by surfacing what happened in
previous work on the same files.

**How it works:**

1. The orchestrator command checks if `.orca/recording.db` exists
2. If yes, calls `recording_query` with files from the current task context
   (limit 3, state "ENDED") to find relevant prior sessions
3. If sessions are found, calls `recording_explain` on the most relevant
   session to get a narrative summary
4. The narrative summary (max 500 chars) is included in the delegation prompt
   to the grand-architect as `RECORDING_CONTEXT`

**Central vs Independent injection:**

- `/orca` queries centrally and passes `RECORDING_CONTEXT` to domain commands
- Domain commands (`/nextjs`, `/ios`, etc.) check for inherited context first;
  if invoked directly, they query `.orca/recording.db` independently
- All recording context is OPTIONAL -- silently skipped without `.orca/recording.db`

**Integration with reflect-analyze.py:**

The `/reflect` analysis script (`scripts/reflect-analyze.py`) can also source data
from `.orca/recording.db` via the `--source` flag:
- `--source auto` (default): tries recording.db first, falls back to JSONL
- `--source recording`: uses recording.db only
- `--source jsonl`: uses JSONL transcripts only (legacy behavior)

---

## Session Hooks

Memory is automatically managed via hooks:

### Core Hooks

| Hook | Trigger | Purpose |
|------|---------|---------|
| `session-start.sh` | SessionStart | Loads context, Workshop summary, active task |
| `post-tool-use.sh` | PostToolUse | ORCA-Mem truncation, auto-deploy |
| `file-location-guard.sh` | PostToolUse | Enforces artifacts in `.claude/` |
| `gate-enforcement.sh` | PreToolUse | Enforces quality gate requirements |
| `auto-deploy.sh` | PostToolUse | Deploys ORCA-OS changes to `~/.claude/` |

### Recording Layer Hooks (orca-record)

| Hook | Trigger | Purpose |
|------|---------|---------|
| `orca-record prompt-submit` | UserPromptSubmit | Git status snapshot, start/continue session (async) |
| `orca-record stop` | Stop | Transcript capture, file diff, checkpoint creation |
| `orca-record pre-task` | PreToolUse[Task] | Pre-task file state capture |
| `orca-record post-task` | PostToolUse[Task] | Subagent checkpoint |
| `orca-record post-todo` | PostToolUse[TodoWrite] | Incremental checkpoint |

### Active Task Persistence

The SessionStart hook outputs saved task context to STDOUT so Claude sees it immediately. This is the solution to session persistence - context saved via `/session-save` automatically loads on next session.

**File:** `.claude/orchestration/active-task.md`

**5 Safeguards:**
1. **48h freshness** - Skips if file older than 48 hours (stale context is worse than no context)
2. **2000 char limit** - Truncates with indicator if exceeded (prevents context bloat)
3. **Graceful missing file** - Silent continue if not found (won't break session start)
4. **Absolute paths** - Uses `$ORCH_DIR` prefix (works from any directory)
5. **Resume mode awareness** - Native `--continue` provides full transcript; this is for fresh sessions

**Why STDOUT, not FILE:**
Claude only sees STDOUT from hooks. Writing to a file that Claude then reads requires a separate read operation. Outputting directly to STDOUT ensures the context appears in the conversation immediately.

**Commands:**
- `/session-save` - Save current context before ending session
- `/session-resume` - Manually reload if needed mid-session

## Troubleshooting

### Empty pastDecisions in query_context

1. Check if workshop.db exists: `ls -la .claude/memory/workshop.db`
2. Verify decisions exist: `sqlite3 .claude/memory/workshop.db "SELECT COUNT(*) FROM entries WHERE type='decision'"`
3. Restart Claude Code to reload MCP

### Workshop CLI writes not visible to MCP

Ensure `.workshop` symlink exists:
```bash
ls -la .workshop  # Should show: .workshop -> .claude/memory
```

If not, create it:
```bash
ln -s .claude/memory .workshop
```

### relatedStandards always empty in ContextBundle

The learning loop depends on `better-sqlite3` reading from Workshop DB. Two common causes:

1. **Node ABI mismatch**: After a Node.js upgrade, the native module fails to load. Fix:
   ```bash
   cd ~/.claude/mcp/project-context-server && npm rebuild better-sqlite3
   ```

2. **Serialization mismatch**: Standards are stored as flattened strings by `saveGotcha()`. If the format changes, `queryStandards()` regex will not parse them. Verify stored format:
   ```bash
   sqlite3 .claude/memory/workshop.db "SELECT content FROM entries WHERE type='gotcha' LIMIT 3"
   ```
   Expected format: `[domain] rule text (Cost: cost text. Cause: what happened)`



## Memory Layer 4: ORCA-Mem

**What:** Context management system that prevents conversation bloat through intelligent truncation and archival.

**Overview:**
ORCA-Mem manages context window efficiently by:
1. Detecting when tool outputs exceed threshold
2. Truncating middle content while preserving head/tail
3. Archiving full content for later recall
4. Cleaning up old archives automatically

**Components:**

| Component | Location | Purpose |
|-----------|----------|---------|
| PostToolUse Hook | `hooks/post-tool-use.sh` | Truncates large outputs, archives originals |
| Recall Tool | ProjectContextServer MCP | Retrieves archived content by archive ID |
| Archive Cleanup | `scripts/archive-cleanup.sh` | Removes archives older than 7 days |

**Configuration:**

```yaml
# Truncation thresholds (in characters)
threshold: 4000      # Trigger truncation above this
head_preserve: 1500  # Keep first N chars
tail_preserve: 500   # Keep last N chars
archive_location: ~/.claude/archives/
retention_days: 7
```

**How it works:**

```
Tool Output (>4000 chars)
         |
         v
  PostToolUse Hook
         |
    +----+----+
    |         |
    v         v
 Truncate   Archive
  output    original
    |         |
    v         v
 HEAD +    ~/.claude/archives/
 TAIL +    {YYYY-MM-DD}/{timestamp-random}.txt
 [archived]
```

**Recall via ProjectContextServer:**

```typescript
// Retrieve archived content
mcp__project-context__recall({
  id: "1705123456-abc123"  // Archive ID from truncation message
})
```

**Integration:**
- PostToolUse hook runs after every tool call
- Archives are keyed by date directory and a unique timestamp-random ID (e.g., ~/.claude/archives/2026-02-07/1707312456-a8b3c9d1.txt)
- ProjectContextServer provides `recall` tool for retrieval

## Cognition Persistence (.claude/cognition/)

**What:** File-based persistence for cognitive command outputs.

**Purpose:** Heavyweight cognitive commands (`/problem-solve`, `/deepthink`, `/challenge`, `/root-cause`) and lightweight commands (`/think`) produce extensive analysis that can be lost when context window compacts. This directory preserves key insights.

**File Patterns:**

| Command Type | File Pattern | Format |
|-------------|--------------|--------|
| Heavyweight | `YYYYMMDD-HHMM-<slug>.md` | Individual summary file |
| Lightweight | `YYYYMMDD-daily.md` | Daily log with appended entries |

**Heavyweight File Template:**
```markdown
# [Command]: [Topic]

**Date**: YYYY-MM-DD HH:MM
**Session ID**: <cognition-mcp sessionId>
**Command**: /[command-name]

## Executive Summary
[2-3 sentence summary]

## Key Findings
- [Finding 1]
- [Finding 2]

## Decision/Recommendation
[Main takeaway]

## Recovery
To resume: `/think --import <sessionId>`
```

**Lightweight Daily Log Entry:**
```markdown
---
### [HH:MM] /[command] - [Topic slug]
Session: <sessionId>

[1-2 sentence summary]
---
```

**Discovery:**
All entries also write to Workshop for searchability:
```bash
workshop --workspace .claude/memory search cognition
workshop why "topic from analysis"
```

**Commands with Persistence:**
- `/problem-solve` - Heavyweight (individual files)
- `/deepthink` - Heavyweight (individual files)
- `/challenge` - Heavyweight (individual files)
- `/root-cause` - Heavyweight (individual files)
- `/think` - Lightweight (daily log)

**Location:** `.claude/cognition/`

## See Also

- [Pipeline Model](pipeline-model.md) - How memory fits into pipelines
- [Response Awareness](response-awareness.md) - Tracking assumptions
