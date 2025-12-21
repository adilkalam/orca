# ORCA-OS v3.1.0 Systems Analysis

**Generated:** 2025-12-18
**Session:** 19d48465-987b-45b7-94dd-6bc0d5728fbf
**Source of Truth:** `docs/reference/os-dependency-graph.yaml`

---

## Executive Summary

ORCA-OS is a Claude Code configuration system that deploys to `~/.claude`. It consists of **8 architectural layers** working together to provide domain-specific AI-assisted development pipelines.

| Layer | Count | Purpose |
|-------|-------|---------|
| Commands | 27 | User entry points |
| Agents | 89 | Workers across 6 domains |
| Pipelines | 11 | Workflow documentation |
| Phase Configs | 7 | Machine-readable definitions |
| MCPs | 8 | Tool integrations |
| Skills | 28 | Knowledge packages |
| Hooks | 10 | Lifecycle scripts |
| Memory | 3-layer | Persistent context |

---

## Layer 1: Commands (28)

User entry points invoked via `/command`.

### Categories

| Category | Count | Commands |
|----------|-------|----------|
| Lane Orchestrators | 6 | `/ios`, `/nextjs`, `/django-react`, `/expo`, `/research`, `/seo`, `/orca-os-dev` |
| Universal | 1 | `/orca` |
| Planning | 2 | `/plan`, `/audit` |
| Reasoning | 4 | `/think`, `/contemplate`, `/challenge`, `/ultra-think` |
| Utility | 14 | `/enhance`, `/root-cause`, `/design-dna`, `/design-review`, `/clone-website`, `/session-save`, `/session-resume`, `/project-memory`, `/project-code`, `/reflect`, `/self-improve`, `/design-review-from-screenshot`, `/memory-search` |

### Three-Tier Routing

All lane commands support:

| Mode | Flag | Path | Gates |
|------|------|------|-------|
| Default | (none) | Light + Gates | YES |
| Tweak | `-tweak` | Light (pure) | NO |
| Complex | `--complex` | Full pipeline | YES |

---

## Layer 2: Agents (89)

Workers organized by domain with strict hierarchy.

### Domain Breakdown

| Domain | Count | Key Agents |
|--------|-------|------------|
| iOS | 19 | ios-grand-architect, ios-builder, ios-swiftui-specialist, ios-verification |
| Next.js | 16 | nextjs-grand-architect, nextjs-builder, nextjs-css-specialist, nextjs-design-reviewer |
| Django-React | 13 | django-react-grand-architect, django-master, react-typescript-wizard, api-contract-specialist |
| Expo | 11 | expo-grand-orchestrator, expo-builder-agent, bundle-assassin, impact-analyzer |
| Research | 8 | research-lead-agent, research-web-search-subagent, research-fact-checker |
| OS-Dev | 5 | os-dev-grand-architect, os-dev-builder, os-dev-standards-enforcer |
| SEO | 4 | seo-research-specialist, seo-brief-strategist, seo-draft-writer |
| Data | 4 | data-researcher, python-analytics-expert, competitive-analyst |
| Cross-cutting | 9 | a11y-enforcer, design-system-architect, security-specialist, performance-enforcer, crash-analyzer, debt-eliminator, version-shield |

### Agent Hierarchy

```
Grand-Architect (coordination, NEVER writes code)
    ├── Architect (planning, routes to specialists)
    │       └── Light-Orchestrator (default routing, fast path)
    ├── Builder (implementation)
    ├── Specialists (domain work)
    │       ├── *-swiftui-specialist
    │       ├── *-css-specialist
    │       ├── *-testing-specialist
    │       └── etc.
    └── Gates (verification, NEVER fixes)
            ├── *-standards-enforcer
            ├── *-verification
            └── *-ui-reviewer
```

### Key Principles

- **Orchestrators NEVER write code** - only coordinate via Task tool
- **Gates NEVER fix** - only score and report violations
- **Graduated scoring:** >=90 PASS, 80-89 WARN, 70-79 ERROR, <70 BLOCK

---

## Layer 3: Pipelines (11)

Workflow documentation in `docs/pipelines/`.

| Pipeline | Description |
|----------|-------------|
| ios-pipeline.md | iOS/Swift development |
| nextjs-pipeline.md | Next.js frontend |
| django-react-pipeline.md | Full-stack Django + React |
| expo-pipeline.md | React Native/Expo |
| research-pipeline.md | Deep web research |
| seo-pipeline.md | SEO content creation |
| seo-optimizer-pipeline.md | SEO optimization |
| data-pipeline.md | Data analysis |
| design-pipeline.md | Design system work |
| os-dev-pipeline.md | ORCA-OS development |
| requirements-pipeline.md | Requirements gathering |

### Pipeline Contents

Each pipeline doc contains:
- Team roster (agents involved)
- Phase assignments (which agent handles which phase)
- Workflow steps
- Gate configurations

State persisted to `.claude/orchestration/phase_state.json` for resumption.

---

## Layer 4: Phase Configs (7)

Machine-readable YAML definitions in `docs/reference/phase-configs/`.

### Structure

```yaml
pipeline:
  name: "{lane}-pipeline"
  version: "3.0"

phase_state_schema:
  # JSON schema for phase_state.json

complexity_tiers:
  default:
    phases: [planning, implementation, standards, verification]
  tweak:
    phases: [implementation]
  complex:
    phases: [planning, implementation, standards, design_qa, verification]

phases:
  planning:
    agent: "{lane}-architect"
    outputs: [plan, file_list]
  implementation:
    agent: "{lane}-builder"
    outputs: [files_modified]
  # ...

quality_gates:
  standards:
    threshold: 90
    agent: "{lane}-standards-enforcer"
  # ...

specialist_triggers:
  # When to activate domain specialists
```

---

## Layer 5: MCPs (9)

Model Context Protocol integrations.

### Global MCPs (5)

Always available in `~/.claude.json`:

| MCP | Purpose | Key Tools |
|-----|---------|-----------|
| cognition-mcp | Sequential thinking storage with 38 operations | `cognition` (accept-store-echo pattern) |
| project-context | Project context queries | `query_context`, `save_decision`, `save_standard`, `save_task_history` |
| sequential-thinking | Extended reasoning | `sequentialthinking` |
| context7 | Library documentation | `resolve-library-id`, `get-library-docs` |

### Project-Scoped MCPs (Optional)

Defined in project `.mcp.json`, enabled via `enabledMcpjsonServers`:

| MCP | Lanes | Projects |
|-----|-------|----------|
| XcodeBuildMCP | iOS | (iOS projects) |
| chrome-devtools | Next.js | (web projects) |
| puppeteer | Next.js | (web projects) |
| crawl4ai | Research | (research projects) |

---

## Layer 6: Skills (28)

Knowledge packages that agents reference.

### Universal Skills (5)

Referenced by ALL agents in "Required Skills" section:

| Skill | Purpose |
|-------|---------|
| cursor-code-style | Variable naming, control flow patterns |
| lovable-pitfalls | Common mistakes to avoid |
| search-before-edit | Always search before modifying |
| linter-loop-limits | Max 3 linter fix attempts |
| debugging-first | Debug before code changes |

### Domain Skills

| Skill | Domain |
|-------|--------|
| ios-knowledge-skill | iOS |
| ios-testing-skill | iOS |
| nextjs-knowledge-skill | Next.js |
| design-dna-skill | Design |
| design-qa-skill | Design |
| frontend-aesthetics | Frontend |
| os-dev-knowledge-skill | OS-Dev |

### Utility Skills

article-extractor, youtube-transcript, pg-style-editor, ship-learn-next, tapestry, alignment-verification, orca-confirm, using-loaded-knowledge, adversarial-analysis

---

## Layer 7: Hooks (10)

Lifecycle scripts in `hooks/`.

| Hook | Trigger | Purpose |
|------|---------|---------|
| session-start.sh | Session start | Load context, show recent Workshop entries |
| session-end.sh | Session end | Cleanup temp files |
| auto-deploy.sh | Edit/Write to deployable dirs | Sync ORCA-OS to ~/.claude |
| file-location-guard.sh | File operations | Enforce .claude/ for artifacts |
| gate-enforcement.sh | Gate results | Enforce quality thresholds |
| alignment-gate-validator.sh | Alignment checks | Validate alignment gates |
| git-tracking-guard.sh | Git operations | Protect tracked files |
| detect-project-type.sh | Project detection | Identify project domain |
| load-design-dna.sh | Design work | Load design tokens |
| auto-activate-skills.sh | Skill activation | Auto-load relevant skills |

---

## Layer 8: Memory Architecture

Three-layer memory system feeding into ProjectContext MCP.

### Memory Layers

```
┌─────────────────────────────────────────────────────────┐
│                    ProjectContext MCP                    │
│  query_context | save_decision | save_standard | save_  │
│                     task_history                         │
└─────────────────────────────────────────────────────────┘
                           ▲
           ┌───────────────┼───────────────┐
           │               │               │
    ┌──────┴──────┐ ┌──────┴──────┐ ┌──────┴──────┐
    │  Workshop   │ │   vibe.db   │ │project-meta │
    │  (session)  │ │ (code intel)│ │ (discovery) │
    └─────────────┘ └─────────────┘ └─────────────┘
```

| Layer | Storage | CLI/Access |
|-------|---------|------------|
| Workshop | .claude/memory/ | `workshop --workspace .claude/memory <cmd>` |
| vibe.db | .claude/vibe.db | `python3 ~/.claude/scripts/vibe-sync.py <cmd>` |
| project-meta | Auto-detected | ProjectContext MCP |

### Reflexion Pattern

```
Gate Failure
    │
    ▼
Workshop gotcha (via Bash)
    │
    ▼
Improvement Bus (.claude/improvement-events/)
    │
    ▼
/self-improve routes to agent patterns.json
    │
    ▼
Improved gate checks in future runs
```

---

## System Relationships

```
┌──────────────┐     orchestrates via Task     ┌──────────────┐
│   Commands   │ ─────────────────────────────▶│    Agents    │
└──────────────┘                               └──────────────┘
       │                                              │
       │ reads routing                                │ declares in
       │ rules                                        │ tools: section
       ▼                                              ▼
┌──────────────┐                               ┌──────────────┐
│Phase Configs │◀─────── machine-readable ─────│   Pipelines  │
└──────────────┘         version of            └──────────────┘
                                                      │
                                               documents team
                                                      │
       ┌──────────────────────────────────────────────┘
       ▼
┌──────────────┐     references in Required    ┌──────────────┐
│    Agents    │ ─────────────────────────────▶│    Skills    │
└──────────────┘     Skills section            └──────────────┘
       │
       │ gates trigger
       ▼
┌──────────────┐     session-start loads       ┌──────────────┐
│    Memory    │◀────────────────────────────── │    Hooks     │
└──────────────┘                               └──────────────┘
       │
       │ provides context bundles
       ▼
┌──────────────┐
│    Agents    │
└──────────────┘
```

---

## Feedback Loops

### 1. Reflexion Loop

```
Gate failure → Workshop gotcha → Improvement Bus → agent patterns.json → improved gate checks
```

### 2. Context Loop

```
ProjectContext query → agent work → save_decision/save_task_history → future context queries
```

### 3. Auto-Deploy Loop

```
Edit in ORCA-OS → auto-deploy.sh → rsync to ~/.claude → available in all projects
```

---

## Key Principles

1. **BUILD here, DEPLOY there**: All development in ORCA-OS repo, deploy to ~/.claude
2. **Orchestrators NEVER write code**: Only coordinate via Task tool
3. **Gates NEVER fix**: Only score and report
4. **Context mandatory**: All agents call ProjectContext MCP first
5. **State preserved**: phase_state.json enables resumption
6. **Quality gates**: >=90 to pass
7. **All Opus 4.5**: Default model, never specify

---

## File Locations

| Artifact | ORCA-OS (source) | ~/.claude (deployed) |
|----------|------------------|----------------------|
| Agents | agents/**/*.md | ~/.claude/agents/ |
| Commands | commands/*.md | ~/.claude/commands/ |
| Scripts | scripts/ | ~/.claude/scripts/ |
| Hooks | hooks/*.sh | ~/.claude/hooks/ |
| Docs | docs/ | ~/.claude/docs/ |
| Quick Ref | quick-reference/ | ~/.claude/quick-reference/ |
| MCPs | mcp/ | ~/.claude/mcp/ (manual) |

---

_Exported from cognition-mcp session: 19d48465-987b-45b7-94dd-6bc0d5728fbf_
_Full session: ~/.orca-cognition/exports/19d48465-987b-45b7-94dd-6bc0d5728fbf.json_
