# Skills

**Version:** OS 6.3 | **Last Updated:** 2026-02-13 | **Total:** See quick-reference for current count

Skills are reusable knowledge packages that provide domain expertise to agents.

## What is a Skill?

A skill is a directory containing:
- `SKILL.md` - skill definition with metadata and knowledge
- Supporting files (optional) - examples, templates, references

Skills load into agent context when relevant, providing:
- Domain-specific patterns and conventions
- Best practices and anti-patterns
- Reference material and examples

## Skill Structure

Skill directories with standard SKILL.md layout:

```
skills/
  adversarial-analysis/SKILL.md
  alignment-verification/SKILL.md
  article-extractor/SKILL.md
  ascii-tables/SKILL.md
  cursor-code-style/SKILL.md
  debugging-first/SKILL.md
  design-dna-skill/SKILL.md
  design-qa-skill/SKILL.md
  elements-of-style/SKILL.md
  frontend-aesthetics/SKILL.md
  ios-knowledge-skill/SKILL.md
  ios-testing-skill/SKILL.md
  linter-loop-limits/SKILL.md
  lovable-pitfalls/SKILL.md
  mm-comps/SKILL.md
  mm-copy/SKILL.md
  mm-visual-audit/SKILL.md
  nextjs-knowledge-skill/SKILL.md
  orca-confirm/SKILL.md
  os-dev-knowledge-skill/SKILL.md
  pg-style-editor/SKILL.md
  react-patterns/                  # empty (consolidated into react-performance)
  react-performance/SKILL.md
  search-before-edit/SKILL.md
  security-basics/SKILL.md
  ship-learn-next/SKILL.md
  stripe-integration/SKILL.md
  tapestry/SKILL.md
  testing-strategy/SKILL.md
  ui-image-rules/SKILL.md
  ui-page-standards/SKILL.md
  ui-typography-spacing/SKILL.md
  using-loaded-knowledge/SKILL.md
  web-interface-guidelines/SKILL.md
  youtube-transcript/SKILL.md
  ...
```

## SKILL.md Format

```yaml
---
name: skill-name
description: >
  What this skill provides and when to use it.
---

# Skill Title

Content that loads into agent context...

## Patterns
...

## Anti-Patterns
...

## Examples
...
```

## How Skills Load

1. **Explicit invocation**: User or agent calls the skill
2. **Agent reference**: Agent definition mentions the skill
3. **Context matching**: Skill description matches task domain

When loaded, skill content appears in agent context alongside:
- ContextBundle from ProjectContext
- Memory hits from Workshop/code-index.db
- Task-specific instructions from orchestrator

## Available Skills

### Universal Skills

These skills are referenced by all agents via "Required Skills" sections. They were not designed from theory -- they were extracted from analysis of 8 competitor system prompts totaling ~3,800 lines of instructions:

| Skill | Purpose | Key Rules |
|-------|---------|-----------|
| `cursor-code-style` | Code style enforcement | Variable naming, control flow, comments |
| `lovable-pitfalls` | Common mistake prevention | 7 DON'T patterns from V0/Lovable |
| `search-before-edit` | Mandatory search | Always grep before modifying files |
| `linter-loop-limits` | Linter loop prevention | Max 3 attempts on linter errors |
| `debugging-first` | Debug-first workflow | Use debug tools before code changes |

#### Provenance: Competitor System Prompt Analysis

Each universal skill traces to specific patterns observed in production AI coding tools:

| Skill | Primary Source | Supporting Sources |
|-------|---------------|-------------------|
| `cursor-code-style` | Cursor (230 lines) -- no 1-2 char names, guard clauses, explain "why" not "how" | Devin 2.0 -- code conventions mirroring |
| `lovable-pitfalls` | Lovable (1,551 lines) -- common pitfalls list, "do STRICTLY what user asks" | V0 (1,267 lines) -- design system enforcement |
| `search-before-edit` | V0 -- semantic search first | Cursor -- multiple searches with different wording |
| `linter-loop-limits` | Cursor -- 3x then ask user | Replit (103 lines) -- >3 attempts = ask user |
| `debugging-first` | Lovable -- console logs before code changes | Bolt.new (284 lines) -- consider ALL files before acting |

Other competitor patterns not yet extracted into skills: Perplexity's report structure (10K word reports, bracket citations), Codex's AGENTS.md spec (scoped instructions, file:line citations), Devin's planning mode (gather info before suggest_plan).

**Format:** Universal skills use explicit DO/DON'T structure with examples:
```markdown
## DO
- Use descriptive variable names
- Follow existing patterns

## DON'T
- Use single-letter variables (except i, j in loops)
- Mix naming conventions
```

### Design Skills
- `alignment-verification` - Zero-tolerance alignment verification protocol; alignment is binary with no tolerances
- `design-dna-skill` - Interpret, enforce, and evolve design-dna.json across projects
- `design-qa-skill` - Design QA checklists and principles for visual review (hierarchy, spacing, color, responsiveness)
- `frontend-aesthetics` - Global frontend aesthetics skill to avoid generic "AI slop" UI and make bold visual decisions
- `mm-comps` - Marina Moscone competitor-dossier skill for structured competitor research
- `mm-copy` - Marina Moscone ad-copy framework and Performance Voice for SKU-level copy variants
- `mm-visual-audit` - Marina Moscone casting and visual audit skill for imagery evaluation

### Development Skills
- `react-performance` - React/Next.js performance patterns with wrong/right code examples (adapted from Vercel best practices)
- `security-basics` - Essential security checklist covering OWASP top 10, input validation, and secure coding
- `testing-strategy` - Testing strategies for unit, integration, and E2E tests (test pyramid, mocking, coverage)
- `web-interface-guidelines` - Web UI quality rules for interactions, forms, loading, animations, accessibility (adapted from Vercel)
- `stripe-integration` - Stripe payment integration patterns (checkout sessions, subscriptions, webhooks, idempotency)

### Domain Knowledge Skills
- `ios-knowledge-skill` - iOS/Swift patterns and conventions
- `nextjs-knowledge-skill` - Next.js patterns and conventions
- `os-dev-knowledge-skill` - OS 6.3 configuration knowledge (LOCAL)

### Content/Writing Skills
- `elements-of-style` - Classic writing guide by William Strunk Jr. (1918) for clarity, conciseness, and grammar
- `pg-style-editor` - Edit writing to adopt Paul Graham's clear style for research and long-form content
- `article-extractor` - Extract clean article content from URLs, removing ads/navigation/clutter
- `youtube-transcript` - Download YouTube video transcripts via yt-dlp

### Process/Utility Skills
- `orca-confirm` - Handle team confirmation with automatic bypass mode detection for /orca
- `ship-learn-next` - Transform learning content into actionable implementation plans using Ship-Learn-Next framework
- `using-loaded-knowledge` - Mandatory pre-response protocol enforcing knowledge check before every response
- `ascii-tables` - Markdown table generation with pixel-perfect alignment via mandatory post-processing
- `tapestry` - Unified content extraction and action planning (YouTube, articles, PDFs to Ship-Learn-Next plans)
- `adversarial-analysis` - 6-phase framework for stress-testing proposals before commitment

### Testing Skills
- `ios-testing-skill` - iOS testing patterns

**Note:** `react-patterns/` is empty and has been consolidated into `react-performance`.

## Creating a Skill

1. Create directory: `skills/my-skill/`
2. Create `SKILL.md` with frontmatter and content
3. Reference in agent definitions or invoke explicitly

### Example SKILL.md

```yaml
---
name: my-domain-skill
description: >
  Expertise for my-domain development. Use when working on
  my-domain files or patterns.
---

# My Domain Skill

## Core Patterns

### Pattern 1
Description and example...

### Pattern 2
Description and example...

## Anti-Patterns

### Don't Do This
Why it's bad and what to do instead...

## Common Gotchas

- Gotcha 1: explanation
- Gotcha 2: explanation
```

## Skills vs Agents

| Aspect | Skill | Agent |
|--------|-------|-------|
| Purpose | Provide knowledge | Perform actions |
| Has tools? | No | Yes |
| Edits files? | No | Yes (specialists) |
| Invocation | Loads into context | Delegated via Task |

Skills inform agents; agents do work.

## Skill Wiring to Agents

All 112 agents now have explicit skill references in their definitions:

```markdown
## Required Skills

You MUST apply these skills to all work:
- `skills/cursor-code-style/SKILL.md` — Variable naming, control flow, comments
- `skills/lovable-pitfalls/SKILL.md` — Common mistakes to avoid
- `skills/search-before-edit/SKILL.md` — Always grep before modifying files
- `skills/linter-loop-limits/SKILL.md` — Max 3 attempts on linter errors
- `skills/debugging-first/SKILL.md` — Debug tools before code changes
```

This ensures skills are consistently applied rather than only loaded on demand.

## See Also

- [Pipeline Model](pipeline-model.md) - How skills fit into pipelines
- [Memory Systems](memory-systems.md) - Other sources of agent context
- [Self-Improvement](self-improvement.md) - Agent learning system
