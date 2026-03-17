# Orca-Pipeline Domain Pipeline

**Status:** OS 7.0 Meta-Pipeline
**Domain:** `orca-pipeline`
**Last Updated:** 2026-02-13

## Overview

The orca-pipeline is a **meta-pipeline** for creating new domain pipelines in ORCA-OS. It provides a structured 5-phase wizard that:

- Gathers domain requirements through adaptive interview
- Researches quality agent templates in `_explore/`
- Designs pipeline architecture with proper agent taxonomy
- Generates all required files (command, agents, docs, config)
- Validates completeness against `os-dependency-graph.yaml`

This pipeline ensures consistent, complete pipeline creation while preventing:
- Over-engineering (5 phases max, checkpoints at each)
- Research black hole (20 files max, 5 min timeout)
- Generic agent soup (domain expertise injection via research)
- Orphaned artifacts (dependency graph validation)

## Two-Mode Routing

| Mode | Flag | Phases | Use Case |
|------|------|--------|----------|
| **Full Wizard** | (none) | Interview → Research → Blueprint → Generate → Validate | New domains, complex pipelines |
| **Quick (Template Gallery)** | `--quick` | Template Select → Customize → Generate → Validate | Known patterns, rapid prototyping |

## Agent Roster (5 Agents)

### Orchestration

| Agent | Purpose |
|-------|---------|
| `orca-pipeline-orchestrator` | Wizard flow coordination, phase routing, checkpoints |

### Implementation

| Agent | Purpose |
|-------|---------|
| `orca-pipeline-researcher` | Bounded _explore/ search, web fallback |
| `orca-pipeline-architect` | Blueprint design from interview + research |
| `orca-pipeline-generator` | Artifact file creation |

### Validation

| Agent | Purpose |
|-------|---------|
| `orca-pipeline-validator` | Completeness check via os-dependency-graph |

## Pipeline Architecture

```
/orca-pipeline "<domain>" "<description>"
  │
  ├── [Quick Mode?] ────────────────────────────────────┐
  │       │                                              │
  │       ▼                                              │
  │   Template Selection                                 │
  │   (AskUserQuestion)                                  │
  │       │                                              │
  │       └──────────────────────────┐                   │
  │                                  │                   │
  ▼                                  ▼                   │
[Phase 1: INTERVIEW]             [Skip to Generate] ◄───┘
  │ (Adaptive requirements)
  │
  ▼ ═══ CHECKPOINT ═══
[Phase 2: RESEARCH]
  │ (orca-pipeline-researcher)
  │ Max 20 files, 5 min
  │
  ▼ ═══ CHECKPOINT ═══
[Phase 3: BLUEPRINT]
  │ (orca-pipeline-architect)
  │ Agent taxonomy, phases, routing
  │
  ▼ ═══ CHECKPOINT ═══
[Phase 4: GENERATE]
  │ (orca-pipeline-generator)
  │ Command, docs, agents
  │
  ▼
[Phase 5: VALIDATE]
  │ (orca-pipeline-validator)
  │ Completeness check
  │
  ├── FAIL ──► Loop back to Generate with fixes
  │
  └── PASS ──► Success Summary + Next Steps
```

## Phases

### Phase 1: INTERVIEW

**Agent:** (inline in orchestrator)

**Purpose:** Gather domain-specific requirements through adaptive questions.

**Questions:**
- Workflow type (research-heavy, build-heavy, hybrid)
- Specialists needed (performance, security, accessibility)
- Quality gates required
- MCP integrations needed

**Checkpoint:** User approves interview summary before research.

---

### Phase 2: RESEARCH

**Agent:** `orca-pipeline-researcher`

**Purpose:** Find quality agent templates and patterns in `_explore/`.

**Strategy:**
1. Check `_explore/4.agents-workflows/_domains/DOMAINS-INDEX.md`
2. Check `_explore/INDEX.md` for related collections
3. Prefer Tier 1-2 sources (score ≥7)
4. Web search only if `_explore/` insufficient

**Bounds:**
- Max 20 files from `_explore/`
- Max 5 minutes total
- Structured summary output (not raw dump)

**Checkpoint:** User approves research findings before blueprint.

---

### Phase 3: BLUEPRINT

**Agent:** `orca-pipeline-architect`

**Purpose:** Design complete pipeline architecture from interview + research.

**Produces:**
- Agent taxonomy (orchestrators, builders, specialists, gates)
- Phase flow with agent assignments
- Four-tier complexity routing
- MCP requirements

**Checkpoint:** User approves blueprint before generation.

---

### Phase 4: GENERATE

**Agent:** `orca-pipeline-generator`

**Purpose:** Create all required files from blueprint.

**Files Created:**
- `commands/<domain>.md`
- `docs/pipelines/<domain>-pipeline.md`
- `docs/reference/phase-configs/<domain>-phase-config.yaml`
- `agents/<domain>/<agent>.md` (for each agent)

**No checkpoint** - proceeds directly to validation.

---

### Phase 5: VALIDATE

**Agent:** `orca-pipeline-validator`

**Purpose:** Ensure all artifacts exist and are properly integrated.

**Checks:**
1. File existence (all from `impact_rules.lane_add.create`)
2. Syntax validation (YAML/Markdown)
3. Frontmatter completeness
4. Cross-reference validation
5. Required sections present
6. Documentation sync status

**If FAIL:** Loop back to Phase 4 with specific fixes.
**If PASS:** Display success summary with next steps.

---

## Template Gallery (Quick Mode)

Four predefined templates:

| Template | Agents | Best For |
|----------|--------|----------|
| **hybrid** | 8 | Balanced planning + building |
| **research-heavy** | 7 | Data, analysis, discovery |
| **build-heavy** | 5 | Simple implementations |
| **minimal** | 4 | Quick experiments |

---

## Safeguards (from DeepThink Analysis)

| Safeguard | Purpose |
|-----------|---------|
| Research checkpoint | Prevents research black hole |
| Blueprint review | Prevents generic agent soup |
| Dependency graph validation | Prevents orphaned artifacts |
| 5-phase maximum | Prevents over-engineering |
| 20 file + 5 min limits | Prevents research runaway |
| Template Gallery escape | Respects user expertise |

---

## Success Criteria

Pipeline creation is complete when:

1. All files from `impact_rules.lane_add.create` exist
2. All YAML files parse without errors
3. All agent cross-references resolve
4. Documentation updates identified
5. New command structure is valid

---

## Artifacts Generated

For every new pipeline:

### Required Files
| File | Purpose |
|------|---------|
| `commands/<domain>.md` | Orchestrator entry point |
| `agents/<domain>/*.md` | Agent definitions |
| `docs/pipelines/<domain>-pipeline.md` | Pipeline documentation |
| `docs/reference/phase-configs/<domain>-phase-config.yaml` | Phase configuration |

### Documentation Updates Needed
| File | Update |
|------|--------|
| `quick-reference/ORCA-OS/ORCA-commands.md` | Add command entry |
| `quick-reference/ORCA-OS/ORCA-agents.md` | Add agent roster |
| `docs/reference/os-dependency-graph.yaml` | Add lane definition |

---

## Related Commands

| Command | Purpose |
|---------|---------|
| `/orca-os-dev` | Modify existing OS tooling |
| `/requirements` | Create requirements specs |
| `/orca` | Universal router to domain lanes |

---

## Example Session

```
User: /orca-pipeline trading "Fundamentals-based trading analysis"

## Phase 1: Interview

[Workflow type?] → research-heavy
[Specialists?] → performance
[Gates?] → standards, verification
[MCPs?] → None additional

✓ Interview complete. Proceed to research? [Yes]

## Phase 2: Research

Searching _explore/...
Found 15 relevant files (trading domain exists!)

Key findings:
- workflow-synthesis-report.md (score: 9)
- 7-role agent taxonomy documented
- MCP recommendations: Alpaca, Polygon

✓ Research complete. Proceed to blueprint? [Yes]

## Phase 3: Blueprint

Designed 7-agent pipeline:
- trading-grand-architect
- trading-light-orchestrator
- trading-researcher
- trading-analyst
- trading-builder
- trading-standards-enforcer
- trading-verification

✓ Blueprint complete. Proceed to generate? [Yes]

## Phase 4: Generate

Created 9 files in agents/trading/

## Phase 5: Validate

✓ All files exist
✓ All syntax valid
✓ All cross-references resolve
✓ Documentation updates identified

## Success!

Command: /trading
Agents: 7
Files: 9

Next steps:
1. Review generated files
2. Update documentation
3. Deploy to ~/.claude/
4. Test with: /trading "analyze AAPL fundamentals"
```

---

_Source of truth: `docs/reference/os-dependency-graph.yaml`_
