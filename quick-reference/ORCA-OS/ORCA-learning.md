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

ORCA-OS v7.0 implements a closed-loop learning system based on gate failures flowing back to builders. No phantom infrastructure -- just the actual flow:

```
Gate detects failure
    |
    v
Gate calls mcp__project-context__save_standard({
  what_happened: "Used NavigationStack without iOS 16 check",
  cost: "Gate failed, required manual fix",
  rule: "Check deployment target before using iOS 16+ APIs",
  domain: "ios"
})
    |
    v
Standard stored in Workshop DB
    |
    v
Next task: lane command calls query_context(domain, task)
    |
    v
query_context returns ContextBundle with relatedStandards
    |
    v
Orchestrator extracts relatedStandards
    |
    v
Orchestrator includes "ACTIVE STANDARDS" section in Task prompt to builder
    |
    v
Builder sees and applies standards
    |
    v
Fewer failures --> fewer new standards needed
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

When a gate reports CAUTION or FAIL, it calls `save_standard` with structured failure information.

### How It Works

```
Gate runs  -->  CAUTION or FAIL
    |
    v
Gate calls save_standard MCP:
  what_happened: "NavigationStack used without checking iOS 16+ deployment target"
  cost: "Gate failed, required 2 fix iterations"
  rule: "Check deployment target before using iOS 16+ APIs"
  domain: "ios"
    |
    v
Workshop stores standard with domain tag
    |
    v
Future runs: orchestrator calls query_context(domain, task)
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

**Gate-to-builder flow.** Standards flow from gates (who detect failures) to builders (who prevent them). The orchestrator is the bridge.

**Scoped injection.** Standards are tagged by domain. `nextjs-builder` doesn't see iOS standards. This prevents context bloat.

**User-visible standards.** All learning is stored in Workshop DB and inspectable via `workshop` CLI. Standards accumulate automatically from gate failures.

---

## Storage Locations

| Data | Location |
|------|----------|
| Domain standards | Workshop DB (via `save_standard` MCP) |
| Decisions/gotchas | Workshop DB (via `workshop` CLI) |
| Learned rules | Project CLAUDE.md `Learned Rules` section |

---

## See Also

- `quick-reference/ORCA-OS/ORCA-memory.md` - Memory systems reference
- `docs/concepts/memory-systems.md` - Full memory architecture

---

_Version: OS 7.0 | Learning is standards, made cumulative._
