# Natural Language Triggers and Tools (OS 5.1)

**Version:** OS 5.1
**Last Updated:** 2026-01-19

Say what you want; map to the right command.

## Common Triggers → Actions

### Planning & Implementation
- "Plan this feature" → `/plan "feature description"`
- "Build X end-to-end" → `/plan "X"` then `/orca "implement requirement <id>"`
- "Implement approved blueprint" → `/nextjs "implement requirement <id> using spec"`
- "Add dark mode to iOS app" → `/plan "dark mode"` then `/ios "implement requirement <id>"`
- "Fix this bug" → `/orca-{domain} "fix: description"`

### Review & Quality
- "Check quality of recent work" → `/audit "last 10 tasks"`
- "Is this safe? What's risky?" → `/ultra-think "risk analysis for X"`
- "Check how it looks" → Domain design-reviewer agent (in pipeline)
- "Prove it's done" → Verification agent runs automatically in pipeline

### Memory & Context
- "Find our past decision about X" → `workshop why "X"`
- "What did we decide last week?" → `workshop recent`
- "Search project context" → Automatic via ProjectContextServer in `/plan` and `/orca`

### Design & UI
- "I want a better layout" → Use `/design-dna` then implement via `/orca`
- "Small UI tweak" → `/orca-{domain} "tweak description"`
- "Explore a new design" → `/plan "design exploration"` with design focus

### Analysis
- "Help me think this through" → `/ultra-think "problem description"`
- "Analyze this data" → `/orca-data "analysis request"`

## Workflow Patterns

### Standard Feature Implementation
```
1. /plan "feature description"
   → Creates .claude/requirements/<id>/06-requirements-spec.md

2. /nextjs "implement requirement <id>"
   OR /ios "implement requirement <id>"
   OR /expo "implement requirement <id>"
   → Team confirmation → Implementation → Gates → Verification

3. /audit "last 5 tasks" (periodically)
   → Meta-review → Standards from failures
```

### Quick Fix (No Planning)
```
/orca-{domain} "fix typo in homepage title"
→ Direct implementation (trivial tasks)
```

### Complex Architecture Decision
```
1. /ultra-think "architecture decision context"
   → Deep analysis

2. /plan "implement chosen architecture"
   → Blueprint with #PATH_DECISION tags

3. /orca-{domain} "implement requirement <id>"
   → Execution with awareness
```

## Tips

### Do This
- **Start with `/plan`** for any non-trivial feature
- **Use `/audit` periodically** (every 5-10 tasks) to learn from patterns
- **Trust the pipeline** - orchestrators coordinate agents, you don't need to micromanage
- **Ask questions during implementation** - state preservation means pipeline continues
- **Confirm agent teams** - AskUserQuestion shows you what will happen before work starts

### Don't Do This
-  Skip `/plan` for complex features (creates scope ambiguity)
-  Try to write code when orchestrator asks questions (breaks role boundaries)
-  Worry about interrupting - pipeline survives questions/clarifications
-  Use deprecated commands (`/requirements-*`, `/response-awareness-*`)

### When to Use What

**Use `/plan` when:**
- Feature needs discovery questions
- Requirements unclear or complex
- Want RA tagging and structured blueprint
- Need to involve stakeholders

**Use `/orca` directly when:**
- Simple, well-defined tasks
- Trivial fixes (typos, small tweaks)
- Following existing patterns

**Use `/audit` when:**
- After 5-10 tasks completed
- After major failure/rework
- Before starting large initiative (learn from recent work)
- Noticing recurring issues

**Use `/ultra-think` when:**
- Complex decision needs deep analysis
- Multiple competing approaches
- High-risk architectural choice
- Need to explore problem space

**Use `workshop` commands when:**
- Need to find past decision: `workshop why "X"`
- Want to see recent work: `workshop recent`
- Recording decision: `workshop decision "X" -r "reasoning"`
- Want session summary: `workshop context`

## Where to Find Details

- **All Commands:** `quick-reference/ORCA-OS/ORCA-commands.md`
- **All Agents:** `quick-reference/ORCA-OS/ORCA-agents.md`
- **Architecture:** `quick-reference/ORCA-OS/ORCA-architecture.md`
- **Main Overview:** `/README.md`

---

_OS 5.1 simplifies workflows: `/plan` → `/orca` → `/audit` replaces 8+ fragmented commands_
