# ORCA-OS Systems Analysis

**Generated:** 2026-03-02
**Version:** OS 7.0
**Source of Truth:** `docs/reference/os-dependency-graph.yaml`

---

## Executive Summary

ORCA-OS is a Claude Code configuration system that deploys to `~/.claude`. It consists of **9 architectural layers** working together to provide domain-specific AI-assisted development pipelines. Each layer exists to counteract a specific trained default: specialized agents prevent drift toward generic output, phase configs prevent skipping planning and verification, memory systems compensate for no persistent context, quality gates prevent premature completion, and the cognition system enables substrate-level observation of reasoning. The architecture matches the complexity of the problem it solves -- development orchestration across 14 domains with enforced quality.

| Layer | Count | Purpose |
|-------|-------|---------|
| Commands | 36 | User entry points |
| Agents | 131 | Workers across 14 domains |
| Pipelines | 15 | Workflow documentation |
| Phase Configs | 13 | Machine-readable definitions |
| MCPs | 6 global + project-scoped | Core infra + domain-specific |
| Skills | 40 | Knowledge packages |
| Hooks | 7 | Lifecycle scripts |
| Memory | 3-layer | Persistent context |
| Cognition | 49 ops | Structured reasoning, substrate observation, and recording |

---

## Layer 1: Commands (37)

User entry points invoked via `/command`.

### Categories

| Category | Count | Commands |
|----------|-------|----------|
| Research | 7 | `agents/research/` | research-web-search-subagent, research-answer-writer, research-fact-checker |
| RVRY | 7 | `agents/rvry/` | rvry-grand-architect, rvry-engine-builder, rvry-web-builder, rvry-protocol-gate |
| Typography | 6 | `agents/typography/` | typography-orchestrator, glyph-editor, ttf-exporter, path-guardian |
| SEO | 5 | `agents/seo/` | seo-research-specialist, seo-brief-strategist, seo-draft-writer, seo-optimizer |
| **TOTAL** | **119** | **12 dirs** | |

Note: OS-Dev (6) and Orca-Pipeline (5) share the `agents/os-dev/` directory, totaling 11 agents there.

### Agent Hierarchy

```
Grand-Architect (coordination, NEVER writes code)
    +-- Architect (planning, routes to specialists)
    |       +-- Light-Orchestrator (default/tweak routing, fast path)
    +-- Builder (implementation)
    +-- Specialists (domain work)
    |       +-- *-swiftui-specialist
    |       +-- *-css-specialist
    |       +-- *-testing-specialist
    |       +-- etc.
    +-- Gates (verification, NEVER fixes)
            +-- *-standards-enforcer (code quality, 0-100 score)
            +-- *-verification (build/test, pass/fail)
            +-- *-ui-reviewer / *-design-reviewer (visual quality)
```

### Role Boundaries

- **Orchestrators NEVER write code** -- only coordinate via Task tool
- **Gates NEVER fix** -- only score and report violations
- **Builders and specialists** do the actual implementation work
- **All agents use Opus 4.6** (default model, never specified in agent files)

---

## Layer 3: Pipelines (15)

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
| orca-pipeline-pipeline.md | Meta-pipeline creation |
| audit-pipeline.md | Due diligence auditing |
| typography-pipeline.md | Font management |
| requirements-pipeline.md | Requirements gathering |

### Pipeline Contents

Each pipeline doc contains:
- Team roster (agents involved)
- Phase assignments (which agent handles which phase)
- Workflow steps
- Gate configurations
- Specialist trigger conditions

State persisted to `.claude/orchestration/phase_state.json` for resumption across sessions.

---

## Layer 4: Phase Configs (13)

Machine-readable YAML definitions in `docs/reference/phase-configs/`.

One phase config per lane: ios, nextjs, django-react, expo, research, seo, rvry, data, os-dev, orca-pipeline, audit, requirements, typography.

### Structure

```yaml
pipeline:
  name: "{lane}-pipeline"
  version: "7.0"

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

quality_gates:
  standards:
    threshold: 90
    agent: "{lane}-standards-enforcer"

specialist_triggers:
  # When to activate domain specialists
```

### Complexity Tier Behavior

| Tier | Grand-Architect | Architect | Builder | Gates | Spec Required |
|------|-----------------|-----------|---------|-------|---------------|
| Tweak | No | No | Yes | No | No |
| Default | No | No | Yes | Yes | No |
| Complex | Yes | Yes | Yes | Yes | Yes |

---

## Layer 5: MCPs

Model Context Protocol integrations. Global MCPs are always available; project-scoped MCPs minimize token bloat.

### Global MCPs (6)

Always available in `~/.claude.json` (user-scoped):

| MCP | Purpose | Key Tools |
|-----|---------|-----------|
| cognition-mcp | Sequential thinking storage with 49 operations (incl. 7 recording ops + blind_orchestrate) | `cognition` (accept-store-echo pattern) |
| project-context | Project context + ORCA-Mem recall | `query_context`, `save_decision`, `save_standard`, `save_task_history`, `index_project`, `reanalyze_project`, `recall` (7 tools) |
| crawl4ai | Web content extraction (SSE, Docker) | `md`, `crawl`, `html`, `screenshot`, `pdf`, `execute_js`, `ask` |
| sequential-thinking | Extended multi-step reasoning | `sequentialthinking` |
| chrome-devtools | Browser automation and visual QA (headless, isolated) | `navigate_page`, `take_screenshot`, `click`, `fill`, etc. |
| context7 | Library documentation (disabled by default) | `resolve-library-id`, `get-library-docs` |

### Project-Scoped MCPs

Defined in project `.mcp.json`, enabled via `enabledMcpjsonServers` in `~/.claude.json`:

| MCP | Lanes | Type |
|-----|-------|------|
| XcodeBuildMCP | iOS | stdio/npx |
| ahrefs | SEO | stdio/npx |
| analytics-mcp | SEO (audit) | pipx |
| mcp-gsc | SEO (audit) | stdio/npx |
| adb-mcp | (project-specific) | stdio (requires UXP plugin + proxy) |
| bambu-3mf | 3D Printing | stdio/node |
| openscad-mcp | 3D Rendering (experimental) | stdio/uv |
| mcp-send-email | Email | stdio/npx |

### Lane-MCP Matrix

| Lane | MCPs Required |
|------|---------------|
| iOS | XcodeBuildMCP |
| Next.js | chrome-devtools |
| SEO | ahrefs, crawl4ai, analytics-mcp (audit), mcp-gsc (audit) |
| Research | crawl4ai |
| Audit | cognition-mcp (global) |
| All others | (none beyond globals) |

---

## Layer 6: Skills (40)

Knowledge packages that agents reference. 40 directories exist in `skills/`.

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
| web-interface-guidelines | Next.js, Django-React |
| react-performance | Next.js, Django-React |
| design-dna-skill | Design |
| design-qa-skill | Design |
| frontend-aesthetics | Frontend |
| os-dev-knowledge-skill | OS-Dev |
| stripe-integration | Next.js, Django-React |
| security-basics | Cross-cutting |
| testing-strategy | Cross-cutting |

### Utility Skills

article-extractor, youtube-transcript, pg-style-editor, elements-of-style, ship-learn-next, tapestry, alignment-verification, orca-confirm, using-loaded-knowledge, adversarial-analysis, ascii-tables, mm-comps, mm-copy, mm-visual-audit

---

## Layer 7: Hooks (7)

Lifecycle scripts in `hooks/`.

| Hook | Trigger | Purpose |
|------|---------|---------|
| session-start.sh | SessionStart | Load context, Workshop summary, active task |
| auto-deploy.sh | PostToolUse (Edit/Write) | Sync ORCA-OS to ~/.claude |
| file-location-guard.sh | PostToolUse (*) | Enforce .claude/ for artifacts |
| gate-enforcement.sh | PreToolUse (Write/Edit) | Enforce quality thresholds |
| alignment-gate-validator.sh | Alignment checks | Validate alignment gates |
| post-tool-use.sh | PostToolUse | ORCA-Mem: truncate large outputs, archive originals |
| pre-compact.sh | PreCompact | Capture context before compaction |

---

## Layer 8: Memory Architecture

Three-layer memory system feeding into ProjectContext MCP.

### Memory Layers

```
+-------------------------------------------------------+
|                  ProjectContext MCP                     |
|  query_context | save_decision | save_standard |       |
|  save_task_history | index_project | recall             |
+-------------------------------------------------------+
                          ^
          +---------------+---------------+
          |               |               |
   +------+------+  +----+------+  +------+------+
   |  Workshop   |  | code-index|  | project-meta|
   | (decisions, |  | (semantic |  | (structure, |
   |  gotchas)   |  |  search)  |  |  deps, cfg) |
   +-------------+  +-----------+  +-------------+
```

| Layer | Storage | Access |
|-------|---------|--------|
| Workshop | .claude/memory/workshop.db | `workshop --workspace .claude/memory <cmd>` |
| code-index.db | .claude/memory/code-index.db | `python3 ~/.claude/scripts/code-index.py <cmd>` |
| project-meta | MCP cache | ProjectContext MCP auto-detection |

### ProjectContext Implementation (OS 7.0)

The MCP uses a hybrid approach:
- **Reads:** Direct SQLite queries via `better-sqlite3` (reliable, no CLI parsing)
- **Writes:** Workshop CLI (ensures schema migrations work)
- **Symlink:** Auto-creates `.workshop -> .claude/memory` on macOS/Linux

### ORCA-Mem (Context Management)

Large tool outputs are truncated intelligently by the `post-tool-use.sh` hook:
- Threshold: 4000 characters
- Preserves: head (1500 chars) + tail (500 chars)
- Archives full output at `~/.claude/archives/{date}/{id}.txt`
- Retrieval: `mcp__project-context__recall(id)` fetches the full content
- Retention: 7 days (cleaned by `scripts/archive-cleanup.sh`)

### Local LLM Stack (Ollama)

code-index.db uses Ollama running on port 11434 for embeddings:

| Component | Model | Purpose |
|-----------|-------|---------|
| code-index.db | `nomic-embed-text` | Code embeddings for semantic search |

Workshop uses heuristic parsing for session extraction -- no LLM dependency.

---

## Layer 9: Cognition System

The cognition-mcp provides structured reasoning with substrate-level observation.

### Accept-Store-Echo Pattern

The cognition-mcp is a MIRROR -- it stores and echoes, never generates:

```
Claude sends:  { thought: "X", ... }
MCP stores:    { thought: "X", ... }
MCP returns:   { thought: "X", ... }  <- UNCHANGED
```

Claude generates the reasoning. The MCP tracks it with session continuity.

### Operations (49 total)

| Category | Count | Operations |
|----------|-------|------------|
| Core | 7 | thought, mental_model, list_mental_models, debug, decide, meta, systems |
| Extended Core | 4 | creative_thinking, visual_reasoning, checkpoint, scientific_method |
| Collaborative | 3 | collaborative_reasoning, socratic_method, structured_argumentation |
| Analysis | 11 | research, analogical_reasoning, causal_analysis, statistical_reasoning, simulation, optimization, ethical_analysis, visual_dashboard, pdr_reasoning, custom_framework, code_execution |
| Patterns | 5 | tree_of_thought, beam_search, mcts, graph_of_thought, orchestration_suggest |
| Strategic | 2 | ooda_loop, ulysses_protocol |
| Notebook | 4 | notebook_create, notebook_add_cell, notebook_run_cell, notebook_export |
| Audit | 1 | audit |
| Session | 3 | session_info, session_export, session_import |
| Stats | 1 | reasoning_stats |
| Recording | 7 | recording_status, recording_query, recording_checkpoint, recording_compare, recording_quality, recording_explain, recording_rewind |

### Substrate Observation

The cognition-mcp operates at the substrate level, not just process level. It identifies six trained reflexes:

| Reflex | What It Does |
|--------|-------------|
| SYCOPHANCY | Shapes output to please rather than inform |
| DEFLECTION | Avoids engagement with difficult content |
| CERTAINTY_CONSTRUCTION | Presents uncertain conclusions as settled |
| REGISTER_SHIFT | Changes tone/formality to signal safety |
| DISTANCE_MAINTENANCE | Adds hedging that dilutes genuine analysis |
| WHAT_ABOUT | Redirects away from the core issue |

The core operation tracks the gap between trained default and reasoned conclusion via the DefaultCounterfactual interface.

### Mental Models (15)

Available via `/think --model <name>`: five-whys, fermi-estimation, abstraction-laddering, steelmanning, rubber-duck, opportunity-cost, constraint-relaxation, time-horizon-shifting, impact-effort-grid, assumption-surfacing, trade-off-matrix, decomposition, inversion, pre-mortem, first-principles.

Templates live at `quick-reference/thinking-models/*.md`.

### Cognition Persistence

```
.claude/cognition/
  YYYYMMDD-daily.md              # Daily log (/think)
  YYYYMMDD-HHMM-<slug>.md       # Per-session (/deepthink, /problem-solve, /challenge, /root-cause)

~/.orca-cognition/
  sessions/{id}/*.jsonl          # Full session logs
  exports/{id}.json              # Session exports
  index.jsonl                    # Cross-project search
```

---

## Verification System

OS 7.0 uses graduated gate scoring, not binary pass/fail.

### Graduated Gate Labels

| Score Range | Label | Pipeline Behavior |
|-------------|-------|-------------------|
| >= 90 | **PASS** | Continue |
| 80-89 | **WARN** | Continue, note issues (may auto-promote via Net Positive) |
| 70-79 | **ERROR** | Pause, user decides: fix or proceed |
| < 70 | **BLOCK** | Stop, must fix before continuing |

### Threshold Presets

| Preset | PASS | WARN | ERROR | BLOCK |
|--------|------|------|-------|-------|
| strict | >=95 | 85-94 | 75-84 | <75 |
| standard | >=90 | 80-89 | 70-79 | <70 |
| lenient | >=85 | 75-84 | 65-74 | <65 |

### Three-Stage Verification Sequence

Every pipeline follows:
1. **Standards Enforcer Gate** -- Code-level quality audit (0-100 score)
2. **Design/UI Gate** -- Visual or UI quality review (where applicable)
3. **Verification Agent** -- Build, test, and lint execution (mechanical pass/fail)

### Research-Backed Patterns

- **Reflexion** (Shinn et al., NeurIPS 2023): Gate failures generate verbal reflections stored in Workshop, feeding future runs. Achieves 88% pass@1 vs 67% baseline.
- **Chain of Verification (CoVe)** (Dhuliawala et al., Meta AI 2023): Verification agents generate 3-5 questions and answer them independently, doubling factual precision. CoVe tables are mandatory in all verification output.

### Gate Agents (12)

All 12 gate agents call `save_standard` directly on ERROR/BLOCK decisions and emit `VIOLATIONS_JSON` blocks for the standards-persistence-agent fallback.

| Gate | Domain | Type |
|------|--------|------|
| nextjs-standards-enforcer | Next.js | Standards |
| nextjs-design-reviewer | Next.js | Design |
| ios-standards-enforcer | iOS | Standards |
| ios-ui-reviewer | iOS | Design |
| expo-standards-enforcer | Expo | Standards |
| expo-verification-agent | Expo | Verification |
| django-react-standards-enforcer | Django-React | Standards |
| os-dev-standards-enforcer | OS-Dev | Standards |
| seo-quality-guardian | SEO | Quality |
| typography-orchestrator | Typography | Orchestration |

All 12 gate agents implement Reflexion-on-failure and store lessons via save_standard.

---

## Response Awareness (RA)

RA is instrumentation for making assumptions and decisions explicit during agent work. Tags surface where the model is guessing, following bad framing, or making architectural choices.

### Core RA Tags

| Tag | Purpose |
|-----|---------|
| `#COMPLETION_DRIVE` | Assumed behavior without explicit confirmation |
| `#PATH_DECISION` | Architectural or design choice made during work |
| `#PATH_RATIONALE` | Explanation for a path decision |
| `#POISON_PATH` | User framing or prior code leading toward unsafe patterns |
| `#CARGO_CULT` | Copied pattern without understanding |
| `#CONTEXT_DEGRADED` | Operating with reduced context quality |

### Research-Specific Tags

`#LOW_EVIDENCE`, `#SOURCE_DISAGREEMENT`, `#SUSPECT_SOURCE`, `#OUT_OF_DATE`, `#TOOL_ERROR`, `#RATE_LIMITED`, `#RETRY_EXHAUSTED`

### RA in Gates

Gate agents check RA status from implementation phases and factor unresolved assumptions into their scoring. High-risk unresolved tags (e.g., `#COMPLETION_DRIVE` in auth flows, ignored `#POISON_PATH`) may trigger score downgrades.

---

## Self-Improvement System

OS 7.0 provides learning at two levels, unified by Workshop memory.

### Two Levels

| Level | Mechanism | Storage | Trigger |
|-------|-----------|---------|---------|
| Agent-level | Workshop standards per agent | Workshop gotchas + save_standard | Task completion |
| Pipeline-level | Standards loop | gate failure -> save_standard -> query_context -> orchestrator injection | `/audit`, `/self-improve` |

### Workshop Memory Loop

All improvement sources feed back through Workshop memory:

```
Sources                    Workshop Memory              Sinks
-------                    ---------------              -----
Reflexion (gates)    -->   save_standard            -->  Orchestrator constraints
CoVe failures        -->   Workshop gotchas         -->  Gate checklists
/audit proposals     -->   query_context retrieval   -->  Builder context
```

### Reflexion-as-Constraint

Gate failure reflexions are synthesized into constraint bullets and injected into `phase_state.plan.constraints` for the source agent. Past failures actively inform future planning.

### CoVe Question Mining

Verification questions that fail 2+ times are stored as Workshop gotchas. Future verification runs retrieve these via query_context.

### Learning Lifecycle

1. **Discovery**: Gate agent identifies failure pattern during verification
2. **Storage**: Reflexion stored as Workshop gotcha via save_standard
3. **Retrieval**: Next orchestrator run calls query_context, gets relatedStandards
4. **Injection**: Standard injected as constraint in builder prompt
5. **Reinforcement**: Repeated failures strengthen the pattern in Workshop memory

---

## Recording Layer

Session activity is captured automatically by the **orca-record** recording layer via Claude Code hooks. The recording database (`.orca/recording.db`) stores session history, file changes, and checkpoints.

### Recording Context Injection

Domain commands inject prior session context from the recording layer before delegating to agents:

1. `/orca` queries `recording_query` for prior sessions related to the task
2. `/orca` calls `recording_explain` on the most relevant session
3. The narrative summary (max 500 chars) is passed as `RECORDING_CONTEXT`
4. Domain grand-architects receive this context in their delegation prompt

Domain commands (`/nextjs`, `/ios`, `/expo`, etc.) check for inherited `RECORDING_CONTEXT` first. If invoked directly, they query `.orca/recording.db` independently.

### Key Operations

| Operation | Purpose |
|-----------|---------|
| `recording_query` | Find prior sessions by files, limit, state |
| `recording_explain` | Get narrative summary of a specific session |
| `recording_checkpoint` | Create git-backed snapshot |
| `recording_rewind` | Restore code and cognitive state |

### Storage

```
.orca/recording.db     # Per-project SQLite (gitignored)
orca/<hash>-<wt>       # Shadow branches (per-session checkpoints)
orca/checkpoints/v1    # Orphan branch (permanent storage)
```

CLI: `orca-record` v0.4.0 (7 commands: 5 hook + 2 user). Git shadow branch layer removed; event tracking only. Supersedes legacy telemetry.

---

## System Relationships

```
+---------------+     orchestrates via Task     +---------------+
|   Commands    | -------------------------------->|    Agents    |
+---------------+                                +---------------+
       |                                                |
       | reads routing                                  | declares in
       | rules from                                     | tools: section
       v                                                v
+---------------+                                +---------------+
| Phase Configs |<------ machine-readable -------|   Pipelines   |
+---------------+       version of               +---------------+
                                                        |
                                                 documents team
                                                        |
       +------------------------------------------------+
       v
+---------------+     references in Required     +---------------+
|    Agents     | -------------------------------->|    Skills    |
+---------------+     Skills section             +---------------+
       |
       | gates trigger reflexion
       v
+---------------+     session-start loads        +---------------+
|    Memory     |<---------------------------------|    Hooks    |
+---------------+                                +---------------+
       |                                                |
       | context bundles                                | auto-deploy
       v                                                v
+---------------+                                +---------------+
|    Agents     |                                | ~/.claude/    |
|  (work loop)  |                                | (deployed)    |
+---------------+                                +---------------+
```

---

## Feedback Loops

### 1. Reflexion Loop

```
Gate failure -> Workshop gotcha -> save_standard -> query_context -> orchestrator constraints
```

Gates that score WARN/ERROR/BLOCK generate verbal reflections, store them in Workshop via save_standard. On subsequent runs, query_context retrieves these as relatedStandards for orchestrator injection.

### 2. Context Loop

```
ProjectContext query -> agent work -> save_decision/save_task_history -> future context queries
```

Every agent calls `query_context` first, works with the assembled context, then records learnings back to Workshop. The loop closes: work produces learnings, learnings feed future work.

### 3. Auto-Deploy Loop

```
Edit in ORCA-OS -> auto-deploy.sh -> rsync to ~/.claude -> available in all projects
```

The PostToolUse hook detects edits to deployable directories and syncs to `~/.claude` automatically, excluding archive/deprecated content.

### 4. CoVe Accumulation Loop

```
CoVe question fails -> Workshop gotcha -> query_context retrieval -> future CoVe runs include it
```

Verification questions that repeatedly fail become permanent mandatory checks, turning CoVe from a one-time check into a cumulative verification system.

### 5. Cognition Persistence Loop

```
/think or /deepthink -> cognition-mcp stores session -> .claude/cognition/ file -> Workshop entry -> future session recall
```

Cognitive analysis persists as files on disk. When the context window compacts, the analysis remains readable. Future sessions can query Workshop for past cognitive work.

---

## Key Principles

1. **BUILD here, DEPLOY there**: All development in ORCA-OS repo, deploy to ~/.claude subdirectories
2. **Orchestrators NEVER write code**: Only coordinate via Task tool
3. **Gates NEVER fix**: Only score and report violations
4. **Graduated scoring**: >=90 PASS, 80-89 WARN, 70-79 ERROR, <70 BLOCK
5. **Context mandatory**: All agents call ProjectContext MCP first
6. **State preserved**: phase_state.json enables resumption across sessions
7. **All Opus 4.6**: Default model across all 102 agents, never specified
8. **Four-tier routing**: --light (fast, no confirmation) / default (fast+gates) / -tweak (builder direct) / --complex (full pipeline)
9. **User approval required**: Agents never auto-modify; improvements need explicit approval

---

## File Locations

### Source vs Deployed

| Artifact | ORCA-OS (source) | ~/.claude (deployed) |
|----------|------------------|----------------------|
| Agents | agents/**/*.md | ~/.claude/agents/ |
| Commands | commands/*.md | ~/.claude/commands/ |
| Scripts | scripts/ | ~/.claude/scripts/ |
| Hooks | hooks/*.sh | ~/.claude/hooks/ |
| Docs | docs/ | ~/.claude/docs/ |
| Quick Ref | quick-reference/ | ~/.claude/quick-reference/ |
| Skills | skills/ | ~/.claude/skills/ |
| MCPs | mcp/ | ~/.claude/mcp/ (manual sync) |

### Project Working Directory

```
<project>/.claude/
  memory/
    workshop.db             # Decision/gotcha storage
    code-index.db           # Semantic code search
  orchestration/
    phase_state.json        # Pipeline state
    evidence/               # Final artifacts
    temp/                   # Working files (clean up after)
  requirements/             # Planning outputs
  cognition/                # Cognitive analysis persistence
  audit/                    # Audit reports and index
```

---

_Source of truth: `docs/reference/os-dependency-graph.yaml`_
_Version: OS 7.0 | Generated: 2026-03-02_
