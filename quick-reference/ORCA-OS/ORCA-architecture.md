# OS 5.1 Architecture Quick Reference

**Last Updated:** 2026-02-03
**Version:** OS 5.1

---

## Overview

ORCA-OS is a Claude Code orchestration system that counteracts trained defaults -- the tendency toward quick, shallow, agreeable output that LLM training optimizes for casual users rather than agentic development workflows. The architecture provides structure that prevents bypassing the capability that already exists in the model.

- **110 agents** across 11 public lanes + cross-cutting (122 total including internal lanes)
- **33 commands** (12 lane orchestrators + utilities)
- **Project-scoped MCPs** to minimize token usage
- **Dependency graph** for change impact tracking

> **Scope Note:** This quick-reference covers public lanes. Internal lanes (kg, shopify) are documented in `docs/reference/os-dependency-graph.yaml`. For the reasoning behind this architecture, see `docs/concepts/why-orca-architecture.md`.

---

## Lane Architecture

### Active Lanes (11)

| Lane | Command | Agents | MCPs |
|------|---------|--------|------|
| iOS | `/ios` | 19 | XcodeBuildMCP |
| Next.js | `/nextjs` | 15 | chrome-devtools, puppeteer |
| Django-React | `/django-react` | 13 | (none) |
| Expo | `/expo` | 12 | (none) |
| Research | `/research` | 7 | crawl4ai |
| SEO | `/seo` | 5 | ahrefs, crawl4ai |
| Typography | `/typography` | 5 | (none) |
| Data | (none) | 4 | (none) |
| OS-Dev | `/orca-os-dev` | 6 | (none) |
| Orca-Pipeline | `/orca-pipeline` | 5 | (none) |
| Audit | `/audit` | 8 | cognition-mcp |
| **Cross-cutting** | - | 11 | - |

---

## Routing Modes

All lane commands support:

| Mode | Flag | Behavior |
|------|------|----------|
| **Default** | (none) | Light orchestrator + gates |
| **Tweak** | `-tweak` | Light orchestrator, no gates |
| **Complex** | `--complex` | Full pipeline with spec |

```
/ios "task"           # Default: architect -> builder -> gates
/ios -tweak "task"    # Tweak: builder only, you verify
/ios --complex "task" # Complex: grand-architect -> full pipeline
```

---

## Pipeline Flow

### Standard Pipeline (Default/Complex)

```
User Request
    |
    v
[Context Query] - ProjectContext MCP (MANDATORY)
    |
    v
[Team Confirm] - AskUserQuestion (complex only)
    |
    v
[Planning] - grand-architect or architect
    |
    v
[Implementation] - builder + specialists
    |
    v
[Quality Gates] - standards-enforcer, design-reviewer
    |               (>=90 to pass)
    v
[Verification] - verification agent (build/test)
    |
    v
Output + Memory Update
```

### Tweak Pipeline

```
User Request
    |
    v
[Light Orchestrator] -> [Builder] -> Done
```
No gates, no architect, user verifies.

---

## Memory Architecture

```
+---------------+    +---------------+    +---------------+
|   Workshop    |    |    code-index.db    |    | project-meta  |
| (Session Mem) |    | (Code Intel)  |    | (Stable Cfg)  |
+-------+-------+    +-------+-------+    +-------+-------+
        |                    |                    |
        +--------------------+--------------------+
                             |
                             v
                 +---------------------+
                 | ProjectContext MCP  |
                 |   (Task Bundler)    |
                 +---------------------+
```

**Workshop:** Decisions, gotchas, learnings (`.claude/memory/workshop.db`)
**code-index.db:** Code chunks, symbols, embeddings (`.claude/memory/code-index.db`)
**project-meta:** Project type, dependencies, tokens (MCP cache)

### ProjectContext Implementation (OS 5.1)

The MCP uses a hybrid approach:
- **Reads:** Direct SQLite queries via `better-sqlite3` (reliable, no CLI parsing)
- **Writes:** Workshop CLI (ensures schema migrations work)
- **Symlink:** Auto-creates `.workshop -> .claude/memory` on macOS/Linux

### Local LLM Stack (Ollama)

Both memory systems use Ollama running on port 11434:

| Component | Ollama Model | Purpose |
|-----------|--------------|---------|
| code-index.db | `nomic-embed-text` | Code embeddings for semantic search |
| Workshop | `mistral` | Quality extraction from session transcripts |

See `quick-reference/llm-local.md` for setup.

---

## Directory Structure

### Source (ORCA-OS Repo)
```
$ORCA_OS_PATH/
  agents/             # 110 agent definitions (public)
    iOS/              # 19 agents
    nextjs/           # 15 agents (nextjs-*)
    django-react/     # 13 agents
    expo/             # 12 agents
    os-dev/           # 11 agents (os-dev-* + orca-pipeline-*)
    dev/              # 11 agents (cross-cutting)
    research/         # 7 agents
    seo/              # 5 agents
    data/             # 4 agents
    audit/            # 8 agents
    typography/       # 5 agents
  commands/           # 33 command definitions
  docs/
    pipelines/        # Pipeline specs
    reference/
      phase-configs/  # Phase configurations
      os-dependency-graph.yaml  # SOURCE OF TRUTH
  quick-reference/
    ORCA-OS/          # These files
```

### Deployed (~/.claude/)
```
~/.claude/
  agents/             # Deployed agents
  commands/           # Deployed commands
  docs/               # Deployed docs
  mcp/                # MCP servers
  scripts/            # Helper scripts
  hooks/              # Session hooks
```

### Project Working Directory
```
<project>/.claude/
  memory/
    workshop.db       # Session memory
    code-index.db           # Code intelligence
  orchestration/
    phase_state.json  # Pipeline state
    evidence/         # Artifacts
    temp/             # Working files
  requirements/       # Planning outputs
```

---

## Role Boundaries

### Orchestrators NEVER Write Code

```markdown
CRITICAL: Orchestrators coordinate via Task tool only

DO:
- Read phase_state.json
- Query ProjectContext
- Delegate to agents via Task tool
- Track progress
- Resume after interruptions

DON'T:
- Use Edit/Write tools
- Implement code directly
- Bypass agent system
```

### Quality Gates

| Gate | Threshold | Skipped in Tweak |
|------|-----------|------------------|
| Standards | >=90 | Yes |
| Design QA | >=90 | Yes |
| Accessibility | >=90 | Yes |
| Build/Test | PASS | No |

---

## Dependency Graph

Changes must trace the dependency graph (`os-dependency-graph.yaml`):

### Lane Add Impact
- Create: agents, command, pipeline doc, phase config, workflow readme
- Update: ORCA-agents.md, ORCA-commands.md, ORCA-architecture.md
- If MCP: Create project .mcp.json, update ~/.claude.json

### Agent Add Impact
- Create: agent file
- Update: pipeline doc, ORCA-agents.md, dependency graph
- Verify: MCPs exist, command references agent

### Command Add Impact
- Create: command file
- Update: ORCA-commands.md, workflow readme, dependency graph
- Verify: agents exist

### MCP Add Impact
- Create: project .mcp.json (if project-scoped)
- Update: ~/.claude.json, ORCA-mcps.md, agents using it

---

## Configuration Files

| File | Purpose |
|------|---------|
| `~/.claude.json` | Global config, MCP servers, project settings |
| `<project>/.mcp.json` | Project-specific MCP definitions |
| `<project>/CLAUDE.md` | Project instructions |
| `docs/reference/os-dependency-graph.yaml` | Artifact relationships |
| `docs/reference/phase-configs/*.yaml` | Pipeline phase definitions |

---

## Session Hooks

Hooks run at key moments in Claude Code lifecycle.

### Critical Project Protection

These hooks enforce git tracking for critical projects.
Configure your projects in the hook files:
- `~/ORCA-OS` (default)
- Add your other projects as needed

| Hook | Trigger | Purpose |
|------|---------|---------|
| `git-tracking-guard.sh` | PreToolUse (Edit/Write) | Warns when editing untracked files |
| `session-end.sh` | SessionEnd | Extracts learnings from JSONL transcripts via Ollama |

### Other Hooks

| Hook | Trigger | Purpose |
|------|---------|---------|
| `session-start.sh` | SessionStart | Loads context, Workshop summary |
| `file-location-guard.sh` | PreToolUse (*) | Ensures artifacts in `.claude/` |
| `gate-enforcement.sh` | PreToolUse (Write/Edit) | Enforces quality gates |
| `auto-deploy.sh` | PostToolUse (Edit/Write) | Auto-deploys ORCA-OS changes |

---

## Key Principles

1. **Context is Mandatory** - Always query ProjectContext first
2. **Role Boundaries Enforced** - Orchestrators never code
3. **State Preserved** - phase_state.json survives interruptions
4. **Quality Non-Negotiable** - Gates >=90 (except tweak mode)
5. **All Opus 4.6** - Unified model across all agents
6. **Dependency Aware** - Changes trace the graph
7. **Git Tracking Enforced** - Critical projects warn on untracked edits

---

_Source of truth: `docs/reference/os-dependency-graph.yaml`_
_Last sync: 2026-02-03_
