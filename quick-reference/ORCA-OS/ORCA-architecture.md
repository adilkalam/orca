# OS 7.0 Architecture Quick Reference

**Last Updated:** 2026-03-16
**Version:** OS 7.0

---

## Overview

ORCA-OS is a Claude Code orchestration system that counteracts trained defaults -- the tendency toward quick, shallow, agreeable output that LLM training optimizes for casual users rather than agentic development workflows. The architecture provides structure that prevents bypassing the capability that already exists in the model.

- **100 agents** across 10 domains
- **37 commands** (13 lane orchestrators + utilities) + orca-record CLI
- **Project-scoped MCPs** to minimize token usage
- **Recording layer** for session event tracking and observability
- **Dependency graph** for change impact tracking

> For the reasoning behind this architecture, see `docs/concepts/why-orca-architecture.md`.

---

## Lane Architecture

### Active Lanes (14)

| Lane | Command | Agents | MCPs |
|------|---------|--------|------|
| iOS | `/ios` | 18 | XcodeBuildMCP |
| Next.js | `/nextjs` | 15 | chrome-devtools |
| Django-React | `/django-react` | 13 | (none) |
| Expo | `/expo` | 12 | (none) |
| Dev (cross-cutting) | - | 13 | - |
| OS-Dev | `/orca-os-dev` | 11 | (none) |
| Audit | `/audit` | 0 (agentless) | cognition-mcp |
| RVRY | `/rvry` | 7 | (none) |
| Research | `/research` | 7 | crawl4ai |
| Typography | `/typography` | 6 | (none) |
| SEO | `/seo` | 5 | ahrefs, crawl4ai, cognition-mcp (--think) |
| Data | (none) | 4 | (none) |
| 3D Printing | `/design` | 0 (MCP+skill) | bambu-3mf, openscad-mcp |
| Creative Design | `/design`, `/illustrate` | 0 (MCP+skill) | adb-mcp (Photoshop, Illustrator) |

---

## Routing Modes

All lane commands support:

| Mode | Flag | Behavior |
|------|------|----------|
| **Default** | (none) | Light orchestrator + gates |
| **Tweak** | `-tweak` | Light orchestrator, no gates |
| **Complex** | `--complex` | Full pipeline with spec |

```
/ios "task"           # Default: light-orchestrator -> builder -> gates
/ios -tweak "task"    # Tweak: builder only, you verify
/ios --complex "task" # Complex: grand-architect -> full pipeline
```

---

## Pipeline Flow

### Default Pipeline

```
User Request
    |
    v
[Light Orchestrator] -> [Builder] -> [Quality Gates] -> Done
```
Light orchestrator delegates to builder, then runs domain-specific gates (>=90 to pass).

### Complex Pipeline (--complex flag)

```
User Request
    |
    v
[Context Query] - ProjectContext MCP (MANDATORY)
    |
    v
[Team Confirm] - AskUserQuestion
    |
    v
[Planning] - grand-architect
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

### ProjectContext Implementation (OS 7.0)

The MCP uses a hybrid approach:
- **Reads:** Direct SQLite queries via `better-sqlite3` (reliable, no CLI parsing)
- **Writes:** Workshop CLI (ensures schema migrations work)
- **Symlink:** Auto-creates `.workshop -> .claude/memory` on macOS/Linux

### Local LLM Stack (Ollama)

code-index.db uses Ollama running on port 11434 for embeddings:

| Component | Ollama Model | Purpose |
|-----------|--------------|---------|
| code-index.db | `nomic-embed-text` | Code embeddings for semantic search |

Workshop uses heuristic parsing for session extraction -- no LLM dependency.

See `quick-reference/llm-local.md` for setup.

---

## Recording Layer (orca-record)

The recording layer provides session event tracking via Claude Code hooks. Events and file change data are stored in SQLite for Workshop notes, cognition-mcp queries, and session context.

```
User prompt
  -> [UserPromptSubmit] -> orca-record prompt-submit (git status snapshot, session start)
  -> Claude processes...
     -> [PreToolUse[Task]] -> orca-record pre-task (file state capture)
     -> [PostToolUse[Task]] -> orca-record post-task (subagent checkpoint)
  -> Agent responds
  -> [Stop] -> orca-record stop (file diff, checkpoint, event)
```

**Storage:**
- `.orca/recording.db` -- Per-project SQLite database (sessions, checkpoints, events)
- `.git/orca-sessions/<id>.json` -- Session state files

**Agent interface:** Recording operations in cognition-mcp (READ-ONLY): `recording_status`, `recording_query`, `recording_checkpoint`, `recording_compare`, `recording_quality`, `recording_explain`

---

## Directory Structure

### Source (ORCA-OS Repo)
```
$ORCA_OS_PATH/
  agents/             # 124 agent definitions
    iOS/              # 18 agents
    nextjs/           # 15 agents
    django-react/     # 13 agents
    expo/             # 12 agents
    dev/              # 13 agents (cross-cutting)
    os-dev/           # 11 agents (os-dev-* + orca-pipeline-*)
    rvry/             # 7 agents
    audit/            # (agentless)
    research/         # 7 agents
    typography/       # 6 agents
    seo/              # 5 agents
    data/             # 4 agents
  commands/           # 37 command definitions
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
  bin/                # Compiled binaries (orca-record)
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

| Hook | Trigger | Purpose |
|------|---------|---------|
| `session-start.sh` | SessionStart | Loads context, Workshop summary |
| `file-location-guard.sh` | PostToolUse (*) | Ensures artifacts in `.claude/` |
| `gate-enforcement.sh` | PreToolUse (Write/Edit) | Enforces quality gates |
| `auto-deploy.sh` | PostToolUse (Edit/Write) | Auto-deploys ORCA-OS changes |
| `post-tool-use.sh` | PostToolUse (*) | ORCA-Mem: truncate large outputs, archive full version |
| `pre-compact.sh` | PreCompact | Captures context before compaction |
| `alignment-gate-validator.sh` | (called by gates) | Validates alignment claims with measurement data |

### Recording Layer Hooks (orca-record)

| Hook | Trigger | Purpose |
|------|---------|---------|
| `orca-record prompt-submit` | UserPromptSubmit | Snapshot git status, start/continue session (async) |
| `orca-record stop` | Stop | Transcript capture, file diff, checkpoint creation |
| `orca-record pre-task` | PreToolUse[Task] | Pre-task file state capture |
| `orca-record post-task` | PostToolUse[Task] | Subagent checkpoint (diff vs pre-task) |
| `orca-record post-todo` | PostToolUse[TodoWrite] | Incremental checkpoint |

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
_Last sync: 2026-03-16_
