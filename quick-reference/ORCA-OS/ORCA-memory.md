# Memory: Continuity Across Sessions

---

## The Problem

Every session starts fresh. The model has no memory of yesterday.

**You explain the architecture Monday. Tuesday it asks again.** The same context, re-explained, every time. Decisions get re-made. Gotchas get re-discovered. Mistakes repeat.

This isn't a bug -- it's how LLMs work. No "self" persists across conversations. Each session reconstructs identity from whatever context is provided.

```
SESSION 1                    SESSION 2                    SESSION 3
+-----------+                +-----------+                +-----------+
| Explain   |                | Explain   |                | Explain   |
| context   |                | context   |                | context   |
| again     |                | AGAIN     |                | AGAIN     |
+-----------+                +-----------+                +-----------+
     |                            |                            |
     v                            v                            v
  (work)                       (work)                       (work)
     |                            |                            |
     v                            v                            v
 [forgotten]                 [forgotten]                 [forgotten]
```

Without external memory, you're trapped in this loop forever.

---

## What Memory Provides

Memory systems are **prosthetic continuity** -- external storage that replaces what the model lacks.

| Missing | Prosthetic |
|---------|------------|
| Memory across sessions | Workshop database (decisions, gotchas, preferences) |
| "Why did we choose X?" | `workshop why "X"` returns original reasoning |
| Code understanding by meaning | Code index semantic search (embeddings) |
| Context assembly for agents | ProjectContext MCP bundles everything relevant |

After setup, Session 1 you explain everything. Session 50, you're just working.

```
SESSION 1                    SESSION 50
+-----------+                +-----------+
| Explain   |                | Context   |
| context   |                | auto-     |
| manually  |                | loaded    |
+-----------+                +-----------+
     |                            |
     v                            v
  (work)                       (work)
     |                            |
     v                            v
 [recorded]  ──────────────> [remembered]
```

---

## Getting Started: /project-setup

Run once per project to initialize conventions.

```bash
/project-setup
```

This wizard:
1. **Detects project type** (iOS, Next.js, Python, etc.)
2. **Asks 4 questions** about your preferences
3. **Generates CLAUDE.md** with project-specific rules
4. **Initializes memory** in `.claude/memory/`

### What It Creates

```
<project>/
 CLAUDE.md                 # Project conventions (sacred paths, archive rules)
 .claude/
    memory/
        workshop.db       # Decision/gotcha storage
        code-index.db     # Semantic code search (optional)
```

### Updating Later

```bash
/project-setup update    # Add new conventions
/project-setup audit     # Check for staleness
```

---

## The Three Memory Systems

### 1. Workshop (Decisions & Gotchas)

**What it stores**: Decisions, gotchas, notes, preferences, antipatterns

**When to use**: Recording architectural choices, documenting pitfalls, capturing preferences

```bash
# Record a decision
/project-memory decide "Use JWT for API auth" -r "Stateless, scales horizontally"

# Record a gotcha
/project-memory gotcha "Token refresh fails silently if network is slow"

# Query past decisions
/project-memory why "authentication"
```

**The killer feature**: `workshop why` returns the original reasoning, not a reconstruction. You get what you actually thought, not what the model guesses you might have thought.

### 2. Code Index (Semantic Code Search)

**What it stores**: Code embeddings and symbol index for semantic search

**When to use**: Finding code by meaning, not filename

```bash
# Sync codebase to index
/project-code sync

# Search by meaning
/memory-search "error handling for API calls"

# Search for a symbol
/project-code symbol "handleError"
```

Returns relevant code even if "error" isn't in the filename. Searches by what the code *does*, not what it's called.

### 3. ProjectContext MCP (Context Assembly)

**What it does**: Bundles everything relevant for a task

**When it runs**: Automatically, as the first action of every agent

```typescript
// Every agent calls this first
mcp__project-context__query_context({
  domain: "nextjs",
  task: "Add user authentication"
})

// Returns:
{
  relevantFiles: [...],      // From code index semantic search
  pastDecisions: [...],      // From Workshop
  relatedStandards: [...],   // From Workshop
  projectState: {...},       // Structure, dependencies
  similarTasks: [...]        // Previous task history
}
```

You don't call this directly. Agents do. It's why they start with context instead of a blank slate.

---

## Daily Usage: /project-memory

### Recording

```bash
# Decision with reasoning
/project-memory decide "Use Zustand over Redux" -r "Simpler API, less boilerplate"

# Quick gotcha
/project-memory gotcha "iOS 15 doesn't support NavigationStack"

# General note
/project-memory note "Auth refactor planned for Q2"
```

### Querying

```bash
# Why did we choose something?
/project-memory why "state management"

# Search everything
/project-memory search "authentication"

# Recent activity
/project-memory recent
```

### Reviewing & Cleaning

```bash
# See all gotchas with IDs
/project-memory review gotchas

# Delete an entry by ID
/project-memory delete 47

# Interactive cleanup
/project-memory clean
```

---

## How It Works Behind the Scenes

### Session Start Hook

When you start Claude Code, `session-start.sh` runs automatically:

1. **Loads active task context** (if saved via `/session-save`) - outputs directly to STDOUT
2. Loads previous session summary (if less than 24h old)
3. Loads Workshop summary (recent decisions, gotchas)
4. Initializes code-index (telemetry deprecated -- replaced by orca-record recording layer)
5. Outputs architecture reminders
6. Writes session metadata to `.claude/orchestration/temp/session-context.md`
7. Makes context available to all subsequent work

You see this in the session startup:
```
===============================================================
PREVIOUS SESSION CONTEXT
===============================================================

[Your saved task context appears here]

===============================================================

PROJECT CONTEXT AUTO-LOAD
Memory systems available:
  - Workshop: workshop --workspace .claude/memory <command>
  - ProjectContext MCP: mcp__project-context__query_context
```

### Session Persistence (Active Task)

**The Problem:** Sessions don't remember what you were working on.

**The Solution:** Save context before ending, auto-load on next start.

```bash
# Before ending session
/session-save

# Context automatically loads next time you open Claude Code
```

**File:** `.claude/orchestration/active-task.md`

**5 Safeguards protect this system:**
1. **48h freshness** - Skips stale context (older than 48 hours)
2. **2000 char limit** - Truncates to prevent context bloat
3. **Graceful errors** - Won't break session start if file missing
4. **Absolute paths** - Works from any working directory
5. **Resume mode** - Native `--continue` provides full transcript for mid-session resumption

**Key insight:** Claude only sees STDOUT from hooks. The active task context outputs directly to STDOUT, not to a file that requires reading.

### Cognition Persistence

Cognitive commands (`/deepthink`, `/problem-solve`, `/challenge`) persist their output as **files**, not as tokens in a context window. When Claude's context compacts mid-session, the analysis is still on disk:

- `.claude/cognition/YYYYMMDD-HHMM-slug.md` - Summary files
- `~/.orca-cognition/sessions/` - Full session logs
- Workshop entries tagged `#cognition`

This means session 1's analysis is still readable in session 50.

### Context Management (ORCA-Mem)

Large tool outputs get truncated intelligently -- head and tail preserved, middle archived for recall by ID. The context window stays clean without losing information. If you need the full output, `mcp__project-context__recall` retrieves it from the archive.

### Agent Context Loading

Every orchestrated agent calls `query_context` before doing anything:

```
User Request
     |
     v
[query_context]  <-- Assembles: files + decisions + standards + history
     |
     v
[Agent works with full context]
     |
     v
[Records learnings back to Workshop]
```

The loop closes: work produces learnings, learnings feed future work.

---

## Memory and Learning

Memory stores facts: decisions, gotchas, context. [Learning](ORCA-learning.md) stores patterns: what works, what fails, what to check next time.

They're complementary:
- **Memory** answers "why did we choose X?" with original reasoning
- **Learning** answers "what went wrong last time?" with constraints and reflexions

Both systems feed agents through ProjectContext, so every task starts with both factual context and learned patterns.

---

## What Gets Persisted

| Type | Example | Stored In |
|------|---------|-----------|
| Decisions | "Use WebSocket for real-time" | Workshop |
| Gotchas | "Token expires after 15min, not 1hr" | Workshop |
| Preferences | "Prefer functional components" | Workshop |
| Standards | "All API responses must include timestamp" | Workshop |
| Code context | Semantic embeddings of codebase | code-index.db |
| Cognitive output | Deepthink analyses, decision trails | `.claude/cognition/` files |
| Learned patterns | Agent success/failure tracking | `.claude/agent-knowledge/` (created per-project by agents when they record learnings; convention-based, no central infrastructure) |
| Learned rules | Your accumulated corrections | CLAUDE.md |

---

## Quick Reference

### Setup (Once)
```bash
/project-setup              # Initialize project with CLAUDE.md + memory
```

### Record (As You Work)
```bash
/project-memory decide "X"  # Record decision
/project-memory gotcha "X"  # Record pitfall
/project-memory note "X"    # General note
```

### Query (When Needed)
```bash
/project-memory why "X"     # Why did we choose X?
/project-memory search "X"  # Search all memory
/memory-search "X"          # Unified search (Workshop + code index)
```

### Maintenance (Occasionally)
```bash
/project-memory status      # Check memory health
/project-code sync          # Re-index code to code-index.db
/project-setup audit        # Check CLAUDE.md freshness
```

---

## See Also

- `docs/concepts/memory-systems.md` - Full technical reference
- [Learning Guide](ORCA-learning.md) - How the system improves over time
- `commands/project-setup.md` - Complete setup specification
- `commands/project-memory.md` - All subcommands
- `mcp/project-context-server/` - MCP implementation

---

_Version: OS 6.3 | Memory is continuity, made persistent._
