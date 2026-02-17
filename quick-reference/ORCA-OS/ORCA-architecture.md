# OS 6.2 Architecture Quick Reference

**Last Updated:** 2026-02-13
**Version:** OS 6.2

---

## Overview

ORCA-OS is a Claude Code orchestration system that counteracts trained defaults -- the tendency toward quick, shallow, agreeable output that LLM training optimizes for casual users rather than agentic development workflows. The architecture provides structure that prevents bypassing the capability that already exists in the model.

- **112 agents** across 11 domains
- **37 commands** (12 lane orchestrators + utilities) + orca-record CLI
- **Project-scoped MCPs** to minimize token usage
- **Recording layer** for session recording, git-backed checkpoints, and cognitive fusion
- **Dependency graph** for change impact tracking

> For the reasoning behind this architecture, see `docs/concepts/why-orca-architecture.md`.

---

## Lane Architecture

### Active Lanes (11)

| Lane | Command | Agents | MCPs |
|------|---------|--------|------|
| iOS | `/ios` | 19 | XcodeBuildMCP |
| Next.js | `/nextjs` | 15 | chrome-devtools, puppeteer |
| Django-React | `/django-react` | 13 | (none) |
| Expo | `/expo` | 12 | (none) |
| Dev (cross-cutting) | - | 12 | - |
| OS-Dev | `/orca-os-dev` | 11 | (none) |
| Audit | `/audit` | 8 | cognition-mcp |
| Research | `/research` | 7 | crawl4ai |
| Typography | `/typography` | 6 | (none) |
| SEO | `/seo` | 5 | ahrefs, crawl4ai |
| Data | (none) | 4 | (none) |

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

### ProjectContext Implementation (OS 6.2)

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

## Recording Layer (orca-record)

The recording layer provides full session recording with git-backed checkpoints and cognitive fusion. It supersedes the telemetry system (`.claude/telemetry/`).

```
User prompt
  -> [UserPromptSubmit] -> orca-record prompt-submit (git status snapshot)
  -> Claude processes...
     -> [PreToolUse[Task]] -> orca-record pre-task (file state capture)
     -> [PostToolUse[Task]] -> orca-record post-task (subagent checkpoint)
  -> Agent responds
  -> [Stop] -> orca-record stop (transcript + checkpoint on shadow branch)
  -> User commits
  -> [post-commit] -> orca-record condense (shadow -> orphan branch)
```

**Storage:**
- `.orca/recording.db` -- Per-project SQLite database (sessions, checkpoints, events, transcripts)
- `orca/<hash>-<wt>` -- Shadow branches (temporary, per-session)
- `orca/checkpoints/v1` -- Orphan branch (permanent checkpoint storage)

**Cognitive fusion:** Checkpoints link code state to cognition-mcp reasoning chains, enabling "show me the reasoning behind this code change" and "show me what code this reasoning produced."

**Agent interface:** 7 recording operations in cognition-mcp: `recording_status`, `recording_query`, `recording_checkpoint`, `recording_compare`, `recording_quality`, `recording_explain`, `recording_rewind`

---

## Directory Structure

### Source (ORCA-OS Repo)
```
$ORCA_OS_PATH/
  agents/             # 124 agent definitions
    iOS/              # 19 agents
    nextjs/           # 15 agents
    django-react/     # 13 agents
    expo/             # 12 agents
    dev/              # 12 agents (cross-cutting)
    os-dev/           # 11 agents (os-dev-* + orca-pipeline-*)
    audit/            # 8 agents
    research/         # 7 agents
    typography/       # 6 agents
    seo/              # 5 agents
    data/             # 4 agents
  commands/           # 35 command definitions
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

### Critical Project Protection

These hooks enforce git tracking for critical projects.
Configure your projects in the hook files:
- `~/ORCA-OS` (default)
- Add your other projects as needed

| Hook | Trigger | Purpose |
|------|---------|---------|
| `session-end.sh` | SessionEnd | Saves session summary to Workshop + session-summary.md |

### Other Hooks

| Hook | Trigger | Purpose |
|------|---------|---------|
| `session-start.sh` | SessionStart | Loads context, Workshop summary |
| `file-location-guard.sh` | PostToolUse (*) | Ensures artifacts in `.claude/` |
| `gate-enforcement.sh` | PreToolUse (Write/Edit) | Enforces quality gates |
| `auto-deploy.sh` | PostToolUse (Edit/Write) | Auto-deploys ORCA-OS changes |

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
_Last sync: 2026-02-13_
