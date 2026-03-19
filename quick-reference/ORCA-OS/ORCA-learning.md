# Learning: The OS 7.0 Standards Loop

---

## The Problem

The same mistake, repeated across sessions, is the signature failure of LLM workflows.

Session 12 hits the same bug that session 3 hit. Session 20 makes the same architectural error as session 8. The model has no memory of failing. It has no felt experience of "this broke last time." Every session starts from zero.

```
SESSION 3                    SESSION 8                    SESSION 12
+-----------+                +-----------+                +-----------+
| Use API   |                | Skip iOS  |                | Use API   |
| that needs|                | version   |                | that needs|
| iOS 16+   |                | check     |                | iOS 16+   |
+-----------+                +-----------+                +-----------+
     |                            |                            |
     v                            v                            v
  [fails]                     [fails]                      [fails]
     |                            |                            |
     v                            v                            v
 [forgotten]                 [forgotten]                 [forgotten]
```

Without learning, you're the only quality memory in the system. You catch the same errors, give the same corrections, explain the same constraints. The model never improves.

---

## The v7.0 Learning Loop

ORCA-OS v7.0 implements a closed-loop learning system. Gate failures flow through a dedicated persistence agent back to builders via the ContextBundle.

```
Gate detects failure (ERROR or BLOCK)
    |
    v
Gate emits VIOLATIONS_JSON block in output
    |
    v
Orchestrator detects VIOLATIONS_JSON
    |
    v
Orchestrator spawns standards-persistence-agent (fire-and-forget)
    |
    v
standards-persistence-agent deduplicates + calls save_standard()
    |
    v
Standard stored in Workshop DB (gotcha entry)
    |
    v
Next task: orchestrator calls query_context(domain, task)
    |
    v
queryStandards() reads + parses from Workshop DB
    |
    v
ContextBundle.relatedStandards populated
    |
    v
Orchestrator injects "ACTIVE STANDARDS" into builder prompt
    |
    v
Builder applies standards --> fewer failures
```

This is a genuine feedback loop: failures create standards, standards prevent future failures.

---

## What Learning Provides

ORCA learns at the gate level -- file-based, no weight updates, no fine-tuning.

| Level | What it learns from | What it produces | Storage |
|-------|-------------------|-----------------|---------|
| **Gate-level** | CAUTION/FAIL decisions | Standards (what failed and how to prevent) | Workshop DB via `save_standard` MCP |

The research backing: Reflexion (Shinn et al., NeurIPS 2023) achieved 88% pass@1 on HumanEval -- compared to GPT-4's 67% -- through verbal feedback stored in episodic memory. ORCA implements this pattern via the standards loop.

---

## Gate-Level Learning (Standards)

When a gate reports CAUTION or FAIL, it emits a `VIOLATIONS_JSON` block. The orchestrator spawns the `standards-persistence-agent` to parse and persist these violations.

### How It Works

```
Gate runs  -->  ERROR or BLOCK
    |
    v
Gate emits VIOLATIONS_JSON:
  <!-- VIOLATIONS_JSON
  [{
    "rule": "Check deployment target before using iOS 16+ APIs",
    "what_happened": "NavigationStack used without iOS 16 check",
    "cost": "Gate failed, required 2 fix iterations",
    "domain": "ios"
  }]
  -->
    |
    v
Orchestrator spawns standards-persistence-agent
    |
    v
Agent deduplicates against existing standards
    |
    v
Agent calls save_standard() for each new violation
    |
    v
Workshop stores as gotcha: "[ios] Check deployment target... (Cost: ... Cause: ...)"
    |
    v
Future runs: orchestrator calls query_context(domain, task)
    |
    v
queryStandards() parses content field back into structured Standard objects
    |
    v
ContextBundle.relatedStandards populated from Workshop
    |
    v
Orchestrator includes in builder delegation prompt:
  "ACTIVE STANDARDS (from past failures):
   - Check deployment target before using iOS 16+ APIs"
```

The standard becomes a constraint for future work. Builders in the same domain see it. Builders in different domains don't -- this prevents context bloat.

### Standards Flow

The key mechanism is the `relatedStandards` field in ContextBundle:

```typescript
interface ContextBundle {
  projectState: { ... }
  relatedDecisions: Decision[]
  relatedStandards: Standard[]  // <-- Learning loop output
  codeContext: { ... }
}
```

Orchestrators are responsible for extracting `relatedStandards` and injecting them into builder prompts.

### The Persistence Agent

The `standards-persistence-agent` (in `agents/cross-domain/`) is the primary path for saving standards. It is spawned as a fire-and-forget background task by orchestrators when a gate returns ERROR or BLOCK.

Why a dedicated agent instead of direct gate calls:
- Gate agents focus on quality checking, not persistence
- Deduplication logic lives in one place
- 12 gate agents share one persistence mechanism

---

## Workshop Memory

Workshop provides structured storage for decisions, gotchas, and preferences:

```bash
workshop decision "Use Tailwind for styling" -r "Consistent with existing codebase"
workshop gotcha "iOS 16+ APIs require deployment target check"
workshop gotcha "Performance budget: 100ms first paint"
```

These entries surface in `ContextBundle.relatedDecisions` when relevant to the current task.

---

## What This Looks Like Over Time

### Session 1

Agent knows nothing project-specific. Uses general knowledge. Makes mistakes. Gates catch some and save standards.

### Session 10

Agent has learned: your TypeScript preferences (CLAUDE.md rules), 3 domain standards (Workshop). Gates contribute new standards only for novel failure modes. Fewer corrections needed.

### Session 50

Standards cover known failure modes across domains. CLAUDE.md rules encode your accumulated preferences. Session 50 is different from session 1.

---

## Practical Usage

### See What's Been Learned

```bash
# See past decisions/gotchas
workshop why "styling approach"

# Check recent Workshop entries
workshop recent
```

### Teach Explicitly

```bash
# Record a decision with reasoning
workshop decision "Use React Query for data fetching" -r "Better caching than SWR"

# Record a gotcha
workshop gotcha "Always check deployment target before using new APIs"
```

---

## Design Principles

**File-based, not weight-based.** All learning is stored in SQLite (Workshop) and markdown (CLAUDE.md). Nothing modifies the model itself. This means learnings are inspectable, editable, and portable.

**Gate-to-builder flow via persistence agent.** Standards flow from gates (who detect failures) through the standards-persistence-agent (who persists them) to builders (who prevent them). The orchestrator bridges detection and application.

**Scoped injection.** Standards are tagged by domain. `nextjs-builder` doesn't see iOS standards. This prevents context bloat.

**User-visible standards.** All learning is stored in Workshop DB and inspectable via `workshop` CLI. Standards accumulate automatically from gate failures.

---

## Maintenance

### After Node.js Upgrades

The ProjectContext MCP uses `better-sqlite3` (native Node module). After upgrading Node.js, rebuild it:

```bash
cd ~/.claude/mcp/project-context-server && npm rebuild better-sqlite3
```

Without this, `queryStandards()` silently returns empty results -- the learning loop appears functional but produces nothing.

---

## Storage Locations

| Data | Location |
|------|----------|
| Domain standards | Workshop DB (via `save_standard` MCP, persisted by standards-persistence-agent) |
| Decisions/gotchas | Workshop DB (via `workshop` CLI) |
| Learned rules | Project CLAUDE.md `Learned Rules` section |

---

## See Also

- `quick-reference/ORCA-OS/ORCA-memory.md` - Memory systems reference
- `docs/concepts/memory-systems.md` - Full memory architecture
- `docs/concepts/self-improvement.md` - Detailed self-improvement architecture and history

---

_Version: OS 7.0 | Learning is standards, made cumulative._
