# Natural Language Triggers and Tools (OS 7.0)

**Version:** OS 7.0
**Last Updated:** 2026-01-19

Say what you want; map to the right command.

## Common Triggers → Actions

### Planning & Implementation
- "Plan this feature" → `/requirements "feature description"`
- "Build X end-to-end" → `/requirements "X"` then `/orca "implement requirement <id>"`
- "Implement approved blueprint" → `/nextjs "implement requirement <id> using spec"`
- "Add dark mode to iOS app" → `/requirements "dark mode"` then `/ios "implement requirement <id>"`
- "Fix this bug" → `/{domain} "fix: description"` (e.g., `/nextjs "fix: ..."`, `/ios "fix: ..."`)

### Review & Quality
- "Check quality of recent work" → `/audit "last 10 tasks"`
- "Is this safe? What's risky?" → `/challenge "risk analysis for X"`
- "Check how it looks" → Domain design-reviewer agent (in pipeline)
- "Prove it's done" → Verification agent runs automatically in pipeline

### Memory & Context
- "Find our past decision about X" → `workshop why "X"`
- "What did we decide last week?" → `workshop recent`
- "Search project context" → Automatic via ProjectContextServer in `/requirements` and `/orca`

### Design & UI
- "I want a better layout" → Use `/design-dna` then implement via `/{domain}`
- "Small UI tweak" → `/{domain} -tweak "tweak description"`
- "Explore a new design" → `/requirements "design exploration"` with design focus

### Analysis
- "Help me think this through" → `/think "problem description"`
- "Analyze this data" → Use data-researcher or python-analytics-expert agents directly

## Workflow Patterns

### Standard Feature Implementation
```
1. /requirements "feature description"
   → Creates .orca/requirements/<id>/06-requirements-spec.md

2. /nextjs "implement requirement <id>"
   OR /ios "implement requirement <id>"
   OR /expo "implement requirement <id>"
   → Team confirmation → Implementation → Gates → Verification

3. /audit "last 5 tasks" (periodically)
   → Meta-review → Standards from failures
```

### Quick Fix (No Planning)
```
/{domain} -tweak "fix typo in homepage title"
→ Direct implementation (trivial tasks)
```

### Complex Architecture Decision
```
1. /think "architecture decision context"
   → Multi-perspective analysis

2. /requirements "implement chosen architecture"
   → Blueprint with #PATH_DECISION tags

3. /{domain} "implement requirement <id>"
   → Execution with awareness
```

## Tips

### Do This
- **Start with `/requirements`** for any non-trivial feature
- **Use `/audit` periodically** (every 5-10 tasks) to learn from patterns
- **Trust the pipeline** - orchestrators coordinate agents, you don't need to micromanage
- **Ask questions during implementation** - state preservation means pipeline continues
- **Confirm agent teams** - AskUserQuestion shows you what will happen before work starts

### Don't Do This
-  Skip `/requirements` for complex features (creates scope ambiguity)
-  Try to write code when orchestrator asks questions (breaks role boundaries)
-  Worry about interrupting - pipeline survives questions/clarifications
-  Use deprecated commands (`/requirements-*`, `/response-awareness-*`)

### When to Use What

**Use `/requirements` when:**
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

**Use `/think` when:**
- Complex decision needs multi-perspective analysis
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

_OS 7.0 simplifies workflows: `/requirements` → `/orca` → `/audit` replaces 8+ fragmented commands_
