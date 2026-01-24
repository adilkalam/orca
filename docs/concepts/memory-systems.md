# Memory Systems

OS 4.2 uses multiple memory systems to maintain context across sessions and provide relevant information to agents.

## Memory Architecture

```

                    Memory-First Flow                     

                                                         
  1. Workshop (fast, local)                              
     ↓                                                   
  2. vibe.db (semantic search)                           
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
workshop note "text"
workshop goal add "text"
```

**Location:** `.claude/memory/workshop.db`

## vibe.db

**What:** Semantic code search and symbol indexing.

**Stores:**
- Code file embeddings
- Symbol definitions (functions, classes, types)
- File relationships

**Commands:**
```bash
# Via unified search
python3 ~/.claude/scripts/memory-search-unified.py "query" --mode all --top-k 10

# Via project-code command
/project-code search "query"
/project-code symbol "SymbolName"
```

**Location:** `.claude/memory/vibe.db`

## ProjectContext MCP

**What:** MCP server providing comprehensive project context.

**Returns:** ContextBundle containing:
- `relevantFiles` - files related to the task
- `projectState` - structure, dependencies, config
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
- `save_task_history` - log task outcomes

### Implementation Details

The ProjectContext MCP uses a hybrid approach for Workshop integration:

**Reads (SQLite)**: Query methods (`queryDecisions`, `queryStandards`, `queryTaskHistory`) read directly from `workshop.db` using `better-sqlite3`. This provides reliable structured data access.

**Writes (CLI)**: Save methods (`saveDecision`, `saveGotcha`, `saveTaskHistory`) use the Workshop CLI. This ensures proper schema migrations and CLI compatibility.

**Symlink Consolidation**: On macOS/Linux, `.workshop` is automatically symlinked to `.claude/memory` so the Workshop CLI defaults to the correct location.

## Memory-First Pattern

OS 4.2 checks fast, local memory before expensive queries:

```bash
# Step 1: Check Workshop for relevant decisions/gotchas
workshop why "iOS haptic feedback"

# Step 2: Check vibe.db for relevant code/symbols
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
    vibe.db      → Relevant code, symbols

         
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

## Session Hooks

Memory is automatically managed via hooks:

- **SessionStart**: Loads cached context, runs memory search
- **SessionEnd**: Captures session summary to Workshop

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
| Session End Hook | `hooks/session-end.sh` | Captures session summary on exit |
| Recall Tool | ProjectContextServer MCP | Retrieves archived content by session/timestamp |
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
 TAIL +    {session}/{timestamp}.txt
 [archived]
```

**Recall via ProjectContextServer:**

```typescript
// Retrieve archived content
mcp__project-context__recall({
  session_id: "abc123",        // Optional: specific session
  timestamp: "2025-01-15T...", // Optional: specific archive
  query: "database migration"  // Optional: search archives
})
```

**Integration:**
- PostToolUse hook runs after every tool call
- Archives are keyed by session ID and timestamp
- ProjectContextServer provides `recall` tool for retrieval
- Session end hook ensures summaries are captured

## Cognition Persistence (.claude/cognition/)

**What:** File-based persistence for cognitive command outputs.

**Purpose:** Heavyweight cognitive commands (`/problem-solve`, `/deepthink`, `/challenge`, `/ultra-think`, `/root-cause`) and lightweight commands (`/think`, `/contemplate`) produce extensive analysis that can be lost when context window compacts. This directory preserves key insights.

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
- `/ultra-think` - Heavyweight (individual files)
- `/root-cause` - Heavyweight (individual files)
- `/think` - Lightweight (daily log)
- `/contemplate` - Lightweight (daily log)

**Location:** `.claude/cognition/`

## See Also

- [Pipeline Model](pipeline-model.md) - How memory fits into pipelines
- [Response Awareness](response-awareness.md) - Tracking assumptions
