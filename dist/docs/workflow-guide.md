# ORCA-OS Workflow Guide

A practical guide to using ORCA-OS effectively for different scenarios.

---

## General Workflow

Use this flow for most tasks - feature development, refactoring, new implementations.

### 1. Initialize Project Memory

First time in a project? Set up memory:

```bash
/project-memory init
```

Check existing context:
```bash
/project-memory status
/project-memory recent
```

### 2. Think Through the Problem

Start with reasoning using `/think`:

```bash
/think "Why is this test flaky?"
/think --debug "Why is auth failing?"
/think --model first-principles "Why is performance slow?"
/think --decide "Postgres vs MongoDB"
/think --systems "How do payment and inventory connect?"
```

### 3. Create the Plan

Generate a structured implementation plan:

```bash
/plan <task description>
```

This creates a requirements spec with:
- Clear objectives
- Implementation steps
- File targets
- Risk assessment

### 4. Execute with Domain Orchestrator

Run the appropriate domain command:

| Domain | Command |
|--------|---------|
| iOS (Swift/SwiftUI) | `/ios <task>` |
| React Native/Expo | `/expo <task>` |
| Next.js | `/nextjs <task>` |
| Django + React | `/django-react <task>` |
| Research | `/research <question>` |
| SEO Content | `/seo <topic>` |
| Due Diligence Audit | `/audit <scope>` |
| Typography | `/typography <task>` |
| OS Development | `/orca-os-dev <task>` |
| Pipeline Creation | `/orca-pipeline <domain>` |
| General Orchestrator | `/orca <task>` |

### Complexity Flags

Adjust based on task complexity:

```bash
# Quick fix, skip gates
/plan -tweak "fix typo in header"
/ios -tweak "update button color"

# Standard (default) - includes design gates
/plan "add user profile page"
/nextjs "implement dark mode"

# Complex - full pipeline with architect + all gates
/plan --complex "redesign authentication system"
/expo --complex "implement offline sync"
```

---

## Debug Workflow

Use this flow when something is broken and you need to find the root cause.

### 1. Structured Debugging

Start with systematic debugging approach:

```bash
/think --debug "app crashes when user uploads large image"
```

This applies debugging frameworks like:
- Binary search isolation
- Rubber duck analysis
- Stack trace analysis
- Hypothesis testing

### 2. Stress Test Your Fix

Before implementing, challenge your assumptions:

```bash
/challenge "proposed fix or approach"
/challenge --quick "approach"    # Fast causal analysis only
/challenge --deep "approach"     # Full analysis + simulation
```

This runs adversarial analysis:
- Maps causal chains of failure
- Builds counter-arguments
- Returns GO / CONDITIONAL GO / NO GO verdict
- Sessions persisted to ~/.orca-cognition/ for review

### 3. Plan the Fix

Create a targeted fix plan:

```bash
/plan "fix description"
```

### 4. Execute

Run the domain command:

```bash
/ios -tweak "fix crash on profile load"
/nextjs "fix hydration mismatch in cart"
```

---

## Complex Task Workflow

For architectural changes, major features, or anything touching multiple systems.

### 1. Deep Analysis

Choose the right thinking mode:

```bash
# First principles breakdown
/think --model first-principles "problem"

# Inversion thinking (what could go wrong?)
/think --model inversion "problem"

# Multi-persona discussion
/think --collab "problem"

# Causal analysis
/think --causal "problem"
```

### 2. Stress Test the Approach

Run adversarial analysis:

```bash
/challenge --deep "proposed architecture"
```

This identifies:
- Hidden assumptions
- Edge cases
- Failure modes
- Alternative approaches

### 3. Comprehensive Planning

Use complex mode for full architect involvement:

```bash
/plan --complex "task description"
```

### 4. Execute with Full Pipeline

```bash
/expo --complex "implement real-time collaboration"
/nextjs --complex "migrate to App Router"
```

---

## /think Quick Reference

### Primary Flags (reasoning mode)

| Flag | Use When |
|------|----------|
| (none) | Sequential thought chain (default) |
| `--debug` | Systematic debugging |
| `--decide` | Weigh options systematically |
| `--model <name>` | Apply mental model (see below) |
| `--meta` | Assess your own reasoning |
| `--systems` | Model interconnected components |
| `--creative` | Brainstorming and ideation |
| `--causal` | Investigate cause-and-effect |

### Mental Models (`--model`)

| Model | Use When |
|-------|----------|
| `first-principles` | Break down to fundamentals |
| `inversion` | Think about what could go wrong |
| `pre-mortem` | Imagine failure, trace causes |
| `second-order` | Consider downstream effects |
| `occams-razor` | Simplest explanation |
| `rubber-duck` | Explain to clarify |

### Modifier Flags (combine with primary)

| Flag | Purpose |
|------|---------|
| `--visual` | Output ASCII diagram of reasoning |
| `--challenge` | Run adversarial critique after |

### Collaborative

| Flag | Use When |
|------|----------|
| `--collab` | Multi-persona discussion |
| `--socratic` | Question-driven refinement |
| `--argue` | Build formal arguments |

### Strategic

| Flag | Use When |
|------|----------|
| `--ooda` | Rapid decision cycles |
| `--ulysses` | Pre-commitment mechanisms |
| `--tree` | Branching exploration |

---

## Example Sessions

### Adding a New Feature

```bash
# Understand the problem space
/think "add user notifications system"

# Analyze architecture implications
/think --systems "notification system needs: push, email, in-app, preferences"

# Plan it out
/plan "implement user notification system with push, email, and in-app support"

# Execute
/expo "implement notification system per plan"
```

### Fixing a Bug

```bash
# Debug systematically
/think --debug "app crashes when user uploads large image"

# Verify the fix approach
/challenge "add image compression before upload"

# Quick fix
/ios -tweak "add image compression before upload, max 2MB"
```

### Major Refactor

```bash
# Deep analysis
/think --model first-principles "why is our state management complex?"
/think --collab "should we migrate from Redux to Zustand?"

# Stress test
/challenge --deep "migrate from Redux to Zustand"

# Full planning
/plan --complex "migrate state management from Redux to Zustand"

# Execute with all gates
/nextjs --complex "execute Redux to Zustand migration"
```

---

## Tips

1. **Memory compounds** - Use `/project-memory` consistently. Past decisions inform future work.

2. **Think before plan** - `/think` helps you ask the right questions before committing to a plan.

3. **Challenge important decisions** - Run `/challenge` on anything architectural or hard to reverse.

4. **Match complexity to task** - Don't use `--complex` for typo fixes. Don't use `-tweak` for architecture changes.

5. **Check the plan output** - `/plan` creates specs in `.claude/requirements/`. Review before executing.

6. **Domain commands are smart** - They route to the right specialists automatically. Trust the orchestration.

7. **Save session context** - Before ending a long session, run `/session-save` to capture what you're working on. Next session will automatically load this context.

---

## Command Quick Reference

### Domain Orchestrators

| Command | Purpose |
|---------|---------|
| `/ios` | iOS (Swift/SwiftUI) development |
| `/nextjs` | Next.js frontend development |
| `/expo` | Expo/React Native development |
| `/django-react` | Django + React full-stack development |
| `/research` | Deep, cited research |
| `/seo` | SEO content pipeline |
| `/audit` | Multi-agent due diligence auditing |
| `/typography` | Typography pipeline (glyph editing, TTF export, font tools) |
| `/orca-os-dev` | OS/Claude Code configuration development |
| `/orca-pipeline` | Meta-pipeline for creating new domain pipelines |
| `/orca` | General orchestrator (coordinates pipelines, never writes code) |

### Thinking and Analysis

| Command | Purpose |
|---------|---------|
| `/think` | Structured reasoning with cognition-mcp (48 operations) |
| `/deepthink` | Depth-first exploration with constraint chain and self-check |
| `/ultra-think` | Multi-dimensional deep analysis and problem solving |
| `/contemplate` | Reasoning strategist (recommends which thinking tools to use) |
| `/problem-solve` | Convergent 8-step decision pipeline |
| `/challenge` | Adversarial analysis (attack a proposal to find weaknesses) |

### Project Setup

| Command | Purpose |
|---------|---------|
| `/plan` | Unified planner (requirements + RA blueprint, no implementation) |
| `/project-setup` | Initialize or update CLAUDE.md with project conventions |
| `/design-dna` | Initialize or update design-dna for project design system |

### Memory and Context

| Command | Purpose |
|---------|---------|
| `/memory-search` | Unified search across all memory systems |
| `/project-memory` | Manage project memory (Workshop, code-index.db) |
| `/project-code` | Manage code context (code-index.db: status, sync, search) |
| `/session-save` | Save current session context for automatic resumption |
| `/session-resume` | Manually reload session context |

### Design

| Command | Purpose |
|---------|---------|
| `/design` | Creative design thinking (Photoshop, Illustrator, OpenSCAD) |
| `/design-review` | In-depth UI/UX visual audit with Puppeteer MCP |
| `/illustrate` | Measured Adobe execution with mandatory self-review |
| `/clone-website` | Clone a website's UI into a project using web analysis |

### Utility

| Command | Purpose |
|---------|---------|
| `/enhance` | Transform vague requests into well-structured prompts |
| `/reflect` | Self-improvement (learn from interactions) |
| `/self-improve` | Run the Improvement Bus (route events to agents and gates) |
| `/root-cause` | Root cause analysis (identify why something is failing) |
