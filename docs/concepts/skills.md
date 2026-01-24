# Skills

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

```
skills/
 ios-knowledge-skill/
    SKILL.md
 nextjs-knowledge-skill/
    SKILL.md
 os-dev-knowledge-skill/
     SKILL.md
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

### Universal Skills (Introduced in v4.1)

These skills are referenced by ALL 85 agents via "Required Skills" sections:

| Skill | Purpose | Key Rules |
|-------|---------|-----------|
| `cursor-code-style` | Code style enforcement | Variable naming, control flow, comments |
| `lovable-pitfalls` | Common mistake prevention | 7 DON'T patterns from V0/Lovable |
| `search-before-edit` | Mandatory search | Always grep before modifying files |
| `linter-loop-limits` | Linter loop prevention | Max 3 attempts on linter errors |
| `debugging-first` | Debug-first workflow | Use debug tools before code changes |

**Format:** Universal skills use explicit DO/DON'T structure with examples:
```markdown
## DO
- Use descriptive variable names
- Follow existing patterns

## DON'T
- Use single-letter variables (except i, j in loops)
- Mix naming conventions
```

### Domain Knowledge Skills
- `ios-knowledge-skill` - iOS/Swift patterns and conventions
- `nextjs-knowledge-skill` - Next.js patterns and conventions
- `os-dev-knowledge-skill` - OS 4.2 configuration knowledge (LOCAL)

### Testing Skills
- `ios-testing-skill` - iOS testing patterns

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

## Skill Wiring to Agents (v4.1)

All 85 agents now have explicit skill references in their definitions:

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
