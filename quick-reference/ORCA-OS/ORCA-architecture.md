# OS 7.0 Architecture Quick Reference

**Last Updated:** 2026-03-31
**Version:** OS 7.0

---

## Overview

ORCA-OS is a Claude Code orchestration system that counteracts trained defaults -- the tendency toward quick, shallow, agreeable output that LLM training optimizes for casual users rather than agentic development workflows. The architecture provides structure that prevents bypassing the capability that already exists in the model.

- **132 agents** across 17 domains
- **52 commands** (14 lane orchestrators + utilities + the 3 composable `/aio` sub-commands) + orca-record CLI
- **Project-scoped MCPs** to minimize token usage
- **Recording layer** for session event tracking and observability
- **Dependency graph** for change impact tracking

> For the reasoning behind this architecture, see `docs/concepts/why-orca-architecture.md`.

---

## Lane Architecture

### Active Lanes (18)

| Lane | Command | Agents | MCPs |
|------|---------|--------|------|
| iOS | `/ios` | 18 | XcodeBuildMCP |
| Next.js | `/nextjs` | 8 (flat pattern; design floor + design specialists archived) | chrome-devtools |
| Django-React | `/django-react` | 13 | (none) |
| Expo | `/expo` | 12 | (none) |
| Dev (cross-cutting) | - | 13 | - |
| OS-Dev | `/orca-os-dev` | 11 | (none) |
| Audit | `/audit` | 0 (agentless) | cognition-mcp |
| RVRY | `/rvry` | 7 | (none) |
| Research | `/research` | 7 | crawl4ai |
| Typography | `/typography` | 6 | (none) |
| SEO | `/seo` | 5 | ahrefs, crawl4ai, cognition-mcp (--think) |
| SEO-Optimize | `/seo-optimize` | 1 (advisory lane) | analytics-mcp, mcp-gsc |
| AIO | `/aio` | 3 (advisory lane) | (none) |

> **AIO sub-commands (2026-05-18):** `/aio` is the umbrella command running the
> full chain (diagnose -> recommend -> optional rewrite -> measure). Its three
> agents are also exposed as composable standalone commands -- `/geo-diagnose`
> (geo-diagnose-recommend), `/geo-rewrite` (geo-rewrite), `/geo-measure`
> (measurement-analyst) -- so diagnosis can be reviewed before a rewrite is
> committed. Additive: no new agents, `/aio` unchanged.
| Data | (none) | 4 | (none) |
| Design | `/impeccable` (+ design verbs) | 2 (design-builder, design-validator) | design-detector (local CLI), cognition-mcp |
| iOS Design (overlay) | `/ios-impeccable` (+ verbs) | 3 (ios-design-architect, ios-design-builder, ios-design-validator) | swift-design-detector (local CLI), cognition-mcp |
| 3D Printing | (MCP+skill driven) | 0 | bambu-3mf, openscad-mcp |
| Creative Design | `/illustrate` + `/impeccable` skills | 0 | adb-mcp (Photoshop, Illustrator) |

> **2026-04-22 design-system fork:** `/design`, `/design-dna`, `/design-review` commands were archived. `/nextjs` is restored (flat pattern, 8 agents, design floor) — see the 2026-07-03 note below; design/css/animation/3D/layout specialists remain archived. Design work now routes through the `/impeccable` skill family. See `ORCA-skills.md`.

> **2026-06-03 design-system totality rethink (Phase 2 — the design lane):** the design command family now routes through a **full-separation lane** — a thin orchestrator (the design command, main thread) binds typed FORBIDDEN/FORWARD constraints via a cognition `checkpoint`, spawns a **separate** `design-builder`, then a **separate fresh-context** `design-validator` (returns `GATE_VERDICT: PASS\|BLOCK` via the LOCAL detector), and branches (N=2 → escalate). The model never grades its own output. Shared definition: `docs/reference/design-lane.md` (referenced, never copy-pasted). Hub skill: `skills/impeccable-hub/SKILL.md` (the register; points to `design-contract/` refs, no inlining — distinct from the `/impeccable` command). All 9 design commands load the hub. **Build-producers route the lane:** `/refine`, `/simplify`, `/fortify`, `/recraft` (Routes A/B), `/motion-design`, and `/impeccable`'s build paths. **Diagnostic/contract commands do NOT route the lane:** `/document`, `/design-audit`, `/design-critique`, `/recraft` Route C. **Status:** built, **pending post-reload live proof** (a new agent is not spawnable until a session reload). Honest ceiling: hard-on-named-slop, advisory-on-taste — **the user's eye is the taste ceiling**.

> **2026-06-18 ios-impeccable-adaptation (Phase 3 — additive iOS design overlay):** the `/ios` correctness lane (build/architecture/visual) now has a **SwiftUI design overlay** that composes additively with it — `/ios-impeccable` + the 3 `agents/ios-design/` agents (`ios-design-architect` → bind → `ios-design-builder` → `ios-design-validator` → branch, N=2 → escalate). It **REUSES** the same shared lane spine (`docs/reference/design-lane.md`) as the web design lane, swapping the web leaves for Swift: the iOS hub skill `skills/ios-impeccable-hub/SKILL.md` (blue-only palette law + SwiftUI rants) and the **Swift** detector `mcp/swift-design-detector` (`swiftdesigncheck`, NOT `designcheck.js`). **Additive composition:** `/ios` keeps owning correctness (`ios-standards-enforcer`, `ios-ui-reviewer`, `ios-verification` UNCHANGED); the overlay owns aesthetic/felt-state/design-DNA — `ios-design-validator` fills the former `design-dna-guardian` role for iOS. This is an OVERLAY, not a `lane_add` (no new pipeline doc / phase-config). Verb subset v1 excludes overdrive/threejs. **Status:** built, **pending post-reload live proof**. **Spec:** `peptidefox-ios/.orca/requirements/2026-06-17-2153-ios-impeccable-adaptation/`.

> **2026-06-23 owner-override precedence (both design lanes — web + iOS):** both the web `design` lane and the iOS `ios-design` overlay now enforce a fixed precedence — **the owner's live instruction outranks the standing register (rants/preferences) outranks the deterministic detector** (`docs/reference/design-lane.md` §Precedence). When the owner's in-context instruction contradicts a standing rule, the architect (`design-architect` / `ios-design-architect`) emits a typed **`OVERRIDE`** constraint (`{suppresses, scope, value, provenance}`) ONLY from that explicit instruction; it is threaded bind → validate → branch and **written back** to a new per-project registry `{project}/.design-overrides.json`. Both detectors self-suppress from that registry (`DESIGN_OVERRIDES_PATH` web / `SWIFT_DESIGN_OVERRIDES` iOS), so a written-back override stops the named rule firing for its `scope` on all future runs (kills the "circles"). Both validators **subtract owner-sanctioned findings before the verdict** (an owner-sanctioned P0 no longer forces BLOCK; it downgrades to an `owner-sanctioned` advisory). The inverse failure is also corrected: enforcement severity is now **per-project** (the detector config), and the iOS lane adds a new P0 rule `ios-default-reflex` (native `Menu`/`Picker`, default-SF `contextMenu` popover, `.tint(.blue)` reflex) — `system-font-reflex` + `ios-default-reflex` are now **P0 owner-instructed** (were advisory/no-rule). The gate hook (`hooks/gate-enforcement.sh`) honors `.design-overrides.json` + reads `gates.*.active_overrides`. Shared schema: `docs/concepts/design-overrides-schema.md`.

---

## Routing Modes

All lane commands support:

| Mode | Flag | Behavior |
|------|------|----------|
| **Default** | (none) | Light orchestrator + gates |
| **Tweak** | `--tweak` | Light orchestrator, no gates |
| **Complex** | `--complex` | Full pipeline with spec |

```
/ios "task"           # Default: light-orchestrator -> builder -> gates
/ios --tweak "task"    # Tweak: builder only, you verify
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
  agents/             # 130 agent definitions
    iOS/              # 18 agents
    nextjs/           # 8 agents
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

**Deploy-safety guard:** `scripts/deploy-diff.sh` does a content-based (cksum) drift check between the repo and `~/.claude`, and `scripts/deploy-protected.txt` lists the SC-1 cognition-direct commands that are never synced in either direction (their deployed copies are knowingly newer). See `quick-reference/ORCA-OS/ORCA-verification.md`.

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
