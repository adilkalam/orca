# ORCA-OS v6.0 Systems Analysis

**Generated:** 2026-02-07
**Source of Truth:** `docs/reference/os-dependency-graph.yaml`

---

## Executive Summary

ORCA-OS is a Claude Code configuration system that deploys to `~/.claude`. It consists of **9 architectural layers** working together to provide domain-specific AI-assisted development pipelines. Each layer exists to counteract a specific trained default: specialized agents prevent drift toward generic output, phase configs prevent skipping planning and verification, memory systems compensate for no persistent context, quality gates prevent premature completion, and the cognition system enables substrate-level observation of reasoning. The architecture matches the complexity of the problem it solves -- development orchestration across 11 domains with enforced quality.

| Layer | Count | Purpose |
|-------|-------|---------|
| Commands | 35 | User entry points |
| Agents | 124 | Workers across 11 domains |
| Pipelines | 14 | Workflow documentation |
| Phase Configs | 12 | Machine-readable definitions |
| MCPs | 10 | Tool integrations (4 global + 6 project-scoped) |
| Skills | 36 | Knowledge packages |
| Hooks | 8 | Lifecycle scripts |
| Memory | 3-layer | Persistent context |
| Cognition | 48 ops | Structured reasoning, substrate observation, and recording |

---

## Layer 1: Commands (35)

User entry points invoked via `/command`.

### Categories

| Category | Count | Commands |
|----------|-------|----------|
| Lane Orchestrators | 10 | `/ios`, `/nextjs`, `/django-react`, `/expo`, `/research`, `/seo`, `/typography`, `/orca-os-dev`, `/orca`, `/orca-pipeline` |
| Planning & Audit | 2 | `/plan`, `/audit` |
| Reasoning | 6 | `/think`, `/contemplate`, `/challenge`, `/ultra-think`, `/deepthink`, `/problem-solve` |
| Utility | 13 | `/enhance`, `/root-cause`, `/design-dna`, `/design-review`, `/clone-website`, `/session-save`, `/session-resume`, `/project-memory`, `/project-code`, `/reflect`, `/self-improve`, `/memory-search`, `/project-setup` |

### Three-Tier Routing

All lane commands support three execution modes. This is the central routing mechanism of OS 6.0.

| Mode | Flag | Path | Gates | Use Case |
|------|------|------|-------|----------|
| **Tweak** | `-tweak` | Light orchestrator + builder | NO | Speed iteration, user verifies |
| **Default** | (none) | Light orchestrator + builder + gates | YES | Most work -- fast with quality |
| **Complex** | `--complex` | Grand-architect + full pipeline + all gates | YES | Architecture, multi-file, specs |

Key inversion from earlier versions: Default mode now runs gates. Tweak is the explicit opt-out.

Complex mode requires a requirements spec (created by `/plan`). If one does not exist, the pipeline blocks and directs the user to run `/plan` first.

---

## Layer 2: Agents (124)

Workers organized by domain with strict role boundaries.

### Domain Breakdown

| Domain | Count | Directory | Key Agents |
|--------|-------|-----------|------------|
| iOS | 19 | `agents/iOS/` | ios-grand-architect, ios-builder, ios-swiftui-specialist, ios-verification |
| Next.js | 15 | `agents/nextjs/` | nextjs-grand-architect, nextjs-builder, nextjs-css-specialist, nextjs-design-reviewer |
| Django-React | 13 | `agents/django-react/` | django-react-grand-architect, django-master, react-typescript-wizard, api-contract-specialist |
| Expo | 12 | `agents/expo/` | expo-grand-orchestrator, expo-builder-agent, bundle-assassin, impact-analyzer |
| Dev (cross-cutting) | 12 | `agents/dev/` | a11y-enforcer, design-system-architect, security-specialist, performance-enforcer |
| OS-Dev | 6 | `agents/os-dev/` | os-dev-grand-architect, os-dev-builder, os-dev-standards-enforcer |
| Orca-Pipeline | 5 | `agents/os-dev/` | orca-pipeline-orchestrator, orca-pipeline-researcher, orca-pipeline-generator |
| Audit | 8 | `agents/audit/` | audit-structure-specialist, audit-security-specialist, audit-architecture-specialist |
| Research | 7 | `agents/research/` | research-web-search-subagent, research-answer-writer, research-fact-checker |
| Typography | 6 | `agents/typography/` | typography-orchestrator, glyph-editor, ttf-exporter, path-guardian |
| SEO | 5 | `agents/seo/` | seo-research-specialist, seo-brief-strategist, seo-draft-writer, seo-optimizer |
| Data | 4 | `agents/data/` | data-researcher, python-analytics-expert, competitive-analyst |
| **TOTAL** | **124** | **13+ dirs** | |

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

## Layer 3: Pipelines (14)

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

## Layer 4: Phase Configs (12)

Machine-readable YAML definitions in `docs/reference/phase-configs/`.

One phase config per lane: ios, nextjs, django-react, expo, research, seo, data, os-dev, orca-pipeline, audit, requirements, typography.

### Structure

```yaml
pipeline:
  name: "{lane}-pipeline"
  version: "6.0"

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

## Layer 5: MCPs (10)

Model Context Protocol integrations. Project-scoped by default to minimize token bloat.

### Global MCPs (4)

Always available in `~/.claude.json`:

| MCP | Purpose | Key Tools |
|-----|---------|-----------|
| cognition-mcp | Sequential thinking storage with 48 operations (incl. 7 recording ops) | `cognition` (accept-store-echo pattern) |
| project-context | Project context + ORCA-Mem recall | `query_context`, `save_decision`, `save_standard`, `save_task_history`, `index_project`, `reanalyze_project`, `recall` (7 tools) |
| sequential-thinking | Extended multi-step reasoning | `sequentialthinking` |
| context7 | Library documentation (disabled by default) | `resolve-library-id`, `get-library-docs` |

### Project-Scoped MCPs (6)

Defined in project `.mcp.json`, enabled via `enabledMcpjsonServers` in `~/.claude.json`:

| MCP | Lanes | Type |
|-----|-------|------|
| XcodeBuildMCP | iOS | stdio/npx |
| chrome-devtools | Next.js | stdio/npx |
| puppeteer | Next.js | stdio/node |
| crawl4ai | Research, SEO | SSE (requires manual server start) |
| ahrefs | SEO | stdio/npx |
| adb-mcp | (project-specific) | stdio (requires UXP plugin + proxy) |

Additionally, openscad-mcp exists as an experimental integration with no dedicated lane.

### Lane-MCP Matrix

| Lane | MCPs Required |
|------|---------------|
| iOS | XcodeBuildMCP |
| Next.js | chrome-devtools, puppeteer |
| SEO | ahrefs, crawl4ai |
| Research | crawl4ai |
| Audit | cognition-mcp (global) |
| All others | (none beyond globals) |

---

## Layer 6: Skills (36)

Knowledge packages that agents reference. 36 directories exist in `skills/`; 2 are empty (`ios-simulator-skill`, `react-patterns`).

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
| api-design | Cross-cutting |
| git-workflow | Cross-cutting |

### Utility Skills

article-extractor, youtube-transcript, pg-style-editor, elements-of-style, ship-learn-next, tapestry, alignment-verification, orca-confirm, using-loaded-knowledge, adversarial-analysis, ascii-tables, mm-comps, mm-copy, mm-visual-audit

---

## Layer 7: Hooks (8)

Lifecycle scripts in `hooks/`.

| Hook | Trigger | Purpose |
|------|---------|---------|
| session-start.sh | SessionStart | Load context, Workshop summary, telemetry init |
| session-end.sh | SessionEnd | Extract learnings from JSONL transcripts via Ollama |
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

### ProjectContext Implementation (OS 6.0)

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

Both memory systems use Ollama running on port 11434:

| Component | Model | Purpose |
|-----------|-------|---------|
| code-index.db | `nomic-embed-text` | Code embeddings for semantic search |
| Workshop | `mistral` | Quality extraction from session transcripts |

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

### Operations (48 total)

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
  YYYYMMDD-daily.md              # Daily log (/think, /contemplate)
  YYYYMMDD-HHMM-<slug>.md       # Per-session (/deepthink, /problem-solve, /challenge, /ultra-think, /root-cause)

~/.orca-cognition/
  sessions/{id}/*.jsonl          # Full session logs
  exports/{id}.json              # Session exports
  index.jsonl                    # Cross-project search
```

---

## Verification System

OS 6.0 uses graduated gate scoring, not binary pass/fail.

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

### Gate Agents (8)

| Gate | Domain | Type |
|------|--------|------|
| nextjs-standards-enforcer | Next.js | Standards |
| nextjs-design-reviewer | Next.js | Design |
| ios-standards-enforcer | iOS | Standards |
| ios-ui-reviewer | iOS | Design |
| expo-standards-enforcer | Expo | Standards |
| django-react-standards-enforcer | Django-React | Standards |
| os-dev-standards-enforcer | OS-Dev | Standards |
| design-dna-guardian | iOS | Design system |

All 8 gate agents implement Reflexion-on-failure and emit to the Improvement Bus.

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

OS 6.0 provides learning at three levels, unified by the Improvement Bus.

### Three Levels

| Level | Mechanism | Storage | Trigger |
|-------|-----------|---------|---------|
| Agent-level | Pattern tracking per agent | `.claude/agent-knowledge/*/patterns.json` | Task completion |
| Pipeline-level | Improvement loop | task_history -> patterns -> proposals -> agent defs | `/audit`, `/self-improve` |
| Conversation-level | Transcript analysis | `/reflect` -> CLAUDE.md rules + Workshop preferences | `/reflect` |

### Improvement Bus

All improvement sources write to `.claude/improvement-events/improvement_event.jsonl`:

```
Sources                    Improvement Bus              Sinks
-------                    ---------------              -----
Reflexion (gates)    -->                          -->  Agent patterns
CoVe failures        -->   improvement_event.jsonl -->  CLAUDE.md rules
/reflect rules       -->          |               -->  Workshop standards
/audit proposals     -->          v               -->  Gate checklists
Agent discoveries    -->   /self-improve          -->  phase_state constraints
```

### Reflexion-as-Constraint

Gate failure reflexions are synthesized into constraint bullets and injected into `phase_state.plan.constraints` for the source agent. Past failures actively inform future planning.

### CoVe Question Mining

Verification questions that fail 2+ times become mandatory checks in `.claude/agent-knowledge/{agent}/mandatory_checks.json`. Future verification runs load these automatically.

### Agent Pattern Lifecycle

1. **Discovery**: Agent finds effective pattern during task
2. **Candidate**: Added with `status: "candidate"`, `successCount: 1`
3. **Tracking**: Success/failure counts updated each use
4. **Promotion**: When `successRate >= 0.85` AND `successCount >= 10`, status becomes `"promoted"`
5. **Deprecation**: If success rate drops below 0.5, flagged for review

---

## Telemetry

Pipeline execution tracking for debugging and performance analysis.

### Events

| Event | When | Data Captured |
|-------|------|---------------|
| `pipeline_start` | Lane command starts | Domain, task, mode (tweak/default/complex) |
| `gate_result` | Gate completes | Score, decision, issue count |
| `pipeline_end` | Pipeline completes | Status, duration, files modified |

### Trace ID Format

```
{domain}-{timestamp}-{random}
nextjs-20260124T143022-a7b3
```

### Storage

```
.claude/telemetry/
  sessions/
    trace-{domain}-{timestamp}-{random}.jsonl
  index.json
```

Viewer: `~/.claude/scripts/telemetry-viewer.sh --recent`
Retention: 7 days.

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
Gate failure -> Workshop gotcha -> Improvement Bus -> agent patterns.json -> improved gate checks
```

Gates that score WARN/ERROR/BLOCK generate verbal reflections, store them in Workshop, and emit events to the Improvement Bus. When `/self-improve` runs, these become agent patterns or constraint injections.

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
CoVe question fails -> Improvement Bus event -> /self-improve -> mandatory_checks.json -> future CoVe runs include it
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
7. **All Opus 4.6**: Default model across all 112 agents, never specified
8. **Three-tier routing**: -tweak (fast) / default (fast+gates) / --complex (full pipeline)
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
  telemetry/                # Pipeline traces
  improvement-events/       # Improvement Bus event log
  agent-knowledge/          # Per-agent pattern files
  audit/                    # Audit reports and index
```

---

_Source of truth: `docs/reference/os-dependency-graph.yaml`_
_Version: OS 6.0 | Generated: 2026-02-07_
