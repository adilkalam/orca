# ORCA-OS User Guides

---

## What ORCA-OS Does

ORCA-OS fills gaps that LLMs have by default:

| Default LLM | With ORCA-OS |
|-------------|--------------|
| Reasoning is ephemeral | Structured thinking with persistence |
| Every session starts fresh | Memory across sessions |
| Self-reports completion | Evidence-based verification |

Three systems, working together:

```
COGNITION          MEMORY             ORCHESTRATION
---------          ------             -------------
How to think  -->  How to remember  -->  How to build
                         |                    |
                         +--------------------+
                                 |
                         (learnings loop back)
```

---

## The Guides

### 1. [Cognition](cognition-readme.md)

**Prosthetic thinking for LLMs.**

When to read: You want to think through problems systematically before building.

Key concepts:
- `/think` with flags (`--systems`, `--debug`, `--decide`, `--model`)
- Composed commands: `/deepthink`, `/problem-solve`, `/challenge`
- Accept-Store-Echo pattern via cognition-mcp

### 2. [Memory](memory-readme.md)

**Continuity across sessions.**

When to read: You want decisions and context to persist, not be re-explained every session.

Key concepts:
- Workshop (decisions, gotchas, preferences)
- Code index (semantic code search)
- ProjectContext MCP (bundles context for agents)
- `/project-setup`, `/project-memory`

### 3. [Orchestration](orchestration-readme.md)

**Multi-agent execution with quality.**

When to read: You want work executed reliably with verification, not self-reported completion.

Key concepts:
- `/plan` -> `/orca-{domain}` workflow
- Three-tier routing (default/tweak/complex)
- Role separation (orchestrators/builders/gates)
- phase_state.json for resumption

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
| "I'm confused about this problem" | [Cognition](cognition-readme.md) - `/deepthink` |
| "Why did we choose X?" | [Memory](memory-readme.md) - `/project-memory why` |
| "Build this feature" | [Orchestration](orchestration-readme.md) - `/plan` -> `/orca-*` |
| "Quick fix" | [Orchestration](orchestration-readme.md) - `/{domain} -tweak` |
| "Is this a good idea?" | [Cognition](cognition-readme.md) - `/challenge` |

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

# 6. MEMORY: Context saved automatically for next session
# Decisions recorded, learnings captured
```

Next time you work on checkout, memory loads what you learned.

---

## See Also

- `CLAUDE.md` - Project-specific conventions
- `docs/concepts/` - Technical reference
- `commands/` - Full command specifications
- `quick-reference/` - Cheat sheets

---

_Version: OS 5.0_
