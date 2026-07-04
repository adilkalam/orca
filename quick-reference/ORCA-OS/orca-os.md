# ORCA-OS User Guides

---

## The Problem ORCA Solves

LLMs are trained on millions of casual interactions. Quick, agreeable, hedged responses scored well. That training doesn't disappear when you ask a hard question -- it sits underneath the reasoning, shaping output before the model starts thinking about your problem.

Claude agrees with your startup idea instead of telling you why it'll fail. Builds a confident explanation when the honest answer is "I don't know." Hedges on medical claims not because it reasoned toward caution, but because the training data is full of cautious medical responses. Every session starts blank -- no memory of yesterday's architecture discussion, no recall of last week's decisions.

These are structural gaps, not skill gaps. Better prompts don't fix them. ORCA builds external systems that compensate for what the model structurally lacks:

| Default LLM | With ORCA-OS |
|-------------|--------------|
| Trained reflexes shape output before reasoning | Substrate observation catches and names reflexes |
| Reasoning is ephemeral | Structured thinking with file-based persistence |
| Every session starts fresh | Memory across sessions with decision recall |
| Self-reports completion | Evidence-based verification with gates |
| Same mistakes repeat indefinitely | Learning system improves across sessions |

---

## The Four Systems

```
COGNITION          MEMORY             ORCHESTRATION        LEARNING
---------          ------             -------------        --------
How to think  -->  How to remember -->  How to build  -->  How to improve
                         |                    |                  |
                         +--------------------+------------------+
                                       |
                               (learnings loop back)
```

### How to Use This

The collaboration that works: you bring persistence across sessions, taste, verification, "this feels wrong," "you're missing the point." ORCA brings structured reasoning, synthesis, exploration of implications, and memory of what happened before. Each side handles what it's better at.

ORCA doesn't replace your judgment. It replaces the infrastructure you'd have to provide manually every session -- the context, the structure, the verification, the memory.

---

## The Guides


### 2. [Memory](ORCA-memory.md)

**Continuity across sessions.**

When to read: You want decisions and context to persist, not be re-explained every session.

Key concepts:
- Workshop (decisions, gotchas, preferences with original reasoning)
- Code index (semantic code search by meaning)
- ProjectContext MCP (bundles context for agents)
- `/project-setup`, `/project-memory`

### 3. [Orchestration](../orchestration.md)

**Multi-agent execution with quality.**

When to read: You want work executed reliably with verification, not self-reported completion.

Key concepts:
- `/requirements` -> `/{domain}` workflow
- Routing modes (default/tweak/complex)
- Role separation (orchestrators/builders/gates)
- Response Awareness annotations for visible assumptions

### 4. [Learning](ORCA-learning.md)

**Improvement without weight updates.**

When to read: You want the system to get better over time, not repeat the same mistakes.

Key concepts:
- Gate-level learning: standards from failures fed back to builders
- Reflexion-based gate learning (NeurIPS 2023)
- Standards loop: gates write structured failures, builders receive them via ProjectContext

---

## Quick Start

### First Time Setup

```bash
# Initialize project conventions and memory
/project-setup
```

### Standard Workflow

```bash

# 2. Plan the implementation
/requirements Add social login to the auth flow

# 3. Execute with orchestration
/nextjs   # or /ios, /expo, /django-react
```

### Speed Mode

```bash
# Quick change, you verify
/nextjs --tweak "fix button padding"
```

### Complex Mode

```bash
# Major feature, full ceremony
/requirements --complex "implement checkout flow"
/nextjs --complex "implement requirement checkout-flow"
```

---

## When to Use What

| Situation | Start Here |
|-----------|------------|
| "Why did we choose X?" | [Memory](ORCA-memory.md) - `/project-memory why` or `workshop why "X"` |
| "Build this feature" | [Orchestration](../orchestration.md) - `/requirements` -> `/{domain}` |
| "Quick fix" | [Orchestration](../orchestration.md) - `/{domain} --tweak` |
| "Same bug keeps happening" | [Learning](ORCA-learning.md) - standards loop |

---

## The Full Pipeline

For significant features, use everything:

<!-- PUBLIC-ONLY: dedicated cognition commands are local-only; public pipeline starts at orchestration -->
```bash
# 1. ORCHESTRATION: Plan implementation
/requirements Implement progressive checkout redesign

# 2. ORCHESTRATION: Execute with verification
/nextjs   # Reads spec, assembles team, runs gates

# 3. MEMORY + LEARNING: Saved automatically
# Decisions recorded, learnings captured, patterns updated
```

Next time you work on checkout, memory loads what you learned. Gates check what failed before. The system is different from when you started.

---

## See Also

- `CLAUDE.md` - Project-specific conventions
- `docs/concepts/` - Technical reference
- `commands/` - Full command specifications
- `quick-reference/` - Cheat sheets

---

_Version: OS 7.0_
