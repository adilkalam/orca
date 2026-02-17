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

### 1. [Cognition](../cognition.md)

**Prosthetic thinking for LLMs.**

When to read: You want to think through problems systematically before building.

Key concepts:
- Substrate observation -- catching trained reflexes before they shape output
- `/think` with flags (`--systems`, `--debug`, `--decide`, `--model`, and more)
- Composed commands: `/deepthink`, `/problem-solve`, `/challenge`
- Accept-Store-Echo pattern via cognition-mcp

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
- `/plan` -> `/orca-{domain}` workflow
- Routing modes (default/tweak/complex)
- Role separation (orchestrators/builders/gates)
- Response Awareness annotations for visible assumptions

### 4. [Learning](ORCA-learning.md)

**Improvement without weight updates.**

When to read: You want the system to get better over time, not repeat the same mistakes.

Key concepts:
- Three learning levels (agent/gate/conversation)
- Reflexion-based gate learning (NeurIPS 2023)
- `/reflect` for extracting rules from your corrections
- Improvement bus unifying all learning loops

---

## Quick Start

### First Time Setup

```bash
# Initialize project conventions and memory
/project-setup
```

### Standard Workflow

```bash
# 1. Think through the problem (optional but recommended)
/think --systems How does our auth work?

# 2. Plan the implementation
/plan Add social login to the auth flow

# 3. Execute with orchestration
/nextjs   # or /ios, /expo, /django-react
```

### Speed Mode

```bash
# Quick change, you verify
/nextjs -tweak "fix button padding"
```

### Complex Mode

```bash
# Major feature, full ceremony
/plan --complex "implement checkout flow"
/nextjs --complex "implement requirement checkout-flow"
```

---

## When to Use What

| Situation | Start Here |
|-----------|------------|
| "I'm confused about this problem" | [Cognition](../cognition.md) - `/deepthink` |
| "Why did we choose X?" | [Memory](ORCA-memory.md) - `/project-memory why` or `workshop why "X"` |
| "Build this feature" | [Orchestration](../orchestration.md) - `/plan` -> `/orca-*` |
| "Quick fix" | [Orchestration](../orchestration.md) - `/{domain} -tweak` |
| "Is this a good idea?" | [Cognition](../cognition.md) - `/challenge` |
| "Same bug keeps happening" | [Learning](ORCA-learning.md) - `/reflect` |

---

## The Full Pipeline

For significant features, use everything:

```bash
# 1. COGNITION: Understand the problem
/deepthink Why do users abandon checkout?

# 2. COGNITION: Decide on approach
/problem-solve Optimize current flow vs rebuild from scratch?

# 3. COGNITION: Stress-test the decision
/challenge Rebuild checkout with progressive disclosure

# 4. ORCHESTRATION: Plan implementation
/plan Implement progressive checkout redesign

# 5. ORCHESTRATION: Execute with verification
/nextjs   # Reads spec, assembles team, runs gates

# 6. MEMORY + LEARNING: Saved automatically
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

_Version: OS 6.2_
