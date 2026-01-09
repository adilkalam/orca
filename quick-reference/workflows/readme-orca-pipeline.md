# Orca-Pipeline Workflow

**Purpose:** Create new domain pipelines systematically through a 5-phase wizard.

---

## Quick Start

```bash
# Full wizard (recommended for new domains)
/orca-pipeline trading "Fundamentals-based trading analysis"

# Quick mode with Template Gallery
/orca-pipeline --quick data-analysis

# Quick mode with description
/orca-pipeline --quick market-research "Quick market research workflow"
```

---

## Two Modes

| Mode | Flag | Phases | Best For |
|------|------|--------|----------|
| **Full** | (none) | Interview → Research → Blueprint → Generate → Validate | New domains, complex pipelines |
| **Quick** | `--quick` | Template Select → Customize → Generate → Validate | Known patterns, rapid prototyping |

---

## Full Mode Phases

### Phase 1: Interview
Gather domain requirements via interactive questions:
- Workflow type (research-heavy, build-heavy, hybrid)
- Specialists needed (performance, security, accessibility)
- Quality gates required
- MCP integrations

### Phase 2: Research
Bounded search in `_explore/` for quality templates:
- Max 20 files
- Max 5 minutes
- Tier 1-2 sources preferred (score ≥7)
- Web fallback if needed

### Phase 3: Blueprint
Design pipeline architecture:
- Agent taxonomy
- Phase flow with assignments
- Three-tier complexity routing
- MCP requirements

### Phase 4: Generate
Create all required files:
- `commands/<domain>.md`
- `agents/<domain>/*.md`
- `docs/pipelines/<domain>-pipeline.md`
- `docs/reference/phase-configs/<domain>-phase-config.yaml`

### Phase 5: Validate
Verify completeness:
- File existence
- Syntax validation
- Frontmatter completeness
- Cross-reference validation
- Required sections present
- Documentation sync status

---

## Template Gallery (Quick Mode)

| Template | Agents | Best For |
|----------|--------|----------|
| **hybrid** | 8 | Balanced planning + building |
| **research-heavy** | 7 | Data, analysis, discovery |
| **build-heavy** | 5 | Simple implementations |
| **minimal** | 4 | Quick experiments |

### Hybrid Template (8 agents)
- `<domain>-grand-architect`
- `<domain>-light-orchestrator`
- `<domain>-architect`
- `<domain>-builder`
- `<domain>-specialist`
- `<domain>-standards-enforcer`
- `<domain>-verification`
- `<domain>-reviewer`

### Research-Heavy Template (7 agents)
- `<domain>-grand-architect`
- `<domain>-light-orchestrator`
- `<domain>-researcher`
- `<domain>-analyst`
- `<domain>-builder`
- `<domain>-standards-enforcer`
- `<domain>-verification`

### Build-Heavy Template (5 agents)
- `<domain>-light-orchestrator`
- `<domain>-architect`
- `<domain>-builder`
- `<domain>-standards-enforcer`
- `<domain>-verification`

### Minimal Template (4 agents)
- `<domain>-light-orchestrator`
- `<domain>-builder`
- `<domain>-standards-enforcer`
- `<domain>-verification`

---

## Checkpoints

User approval required at:
1. After Interview (Phase 1)
2. After Research (Phase 2)
3. After Blueprint (Phase 3)

No checkpoint between Generate and Validate.

---

## Safeguards

| Safeguard | Purpose |
|-----------|---------|
| Research bounded (20 files, 5 min) | Prevent research black hole |
| Blueprint review checkpoint | Prevent generic agent soup |
| Dependency graph validation | Prevent orphaned artifacts |
| 5-phase maximum | Prevent over-engineering |
| Template Gallery escape hatch | Respect user expertise |

---

## Files Generated

### Required
- `commands/<domain>.md` - Orchestrator entry point
- `agents/<domain>/*.md` - Agent definitions
- `docs/pipelines/<domain>-pipeline.md` - Pipeline documentation
- `docs/reference/phase-configs/<domain>-phase-config.yaml` - Phase config

### Documentation Updates Needed (Manual)
- `quick-reference/ORCA-OS/ORCA-commands.md`
- `quick-reference/ORCA-OS/ORCA-agents.md`
- `docs/reference/os-dependency-graph.yaml`

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

Found 15 relevant files in _explore/
- workflow-synthesis-report.md (score: 9)
- 7-role agent taxonomy documented

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

## Success!

Command: /trading
Agents: 7
Files: 9

Next steps:
1. Review generated files
2. Update documentation (ORCA-commands.md, ORCA-agents.md)
3. Deploy to ~/.claude/
4. Test with: /trading "analyze AAPL fundamentals"
```

---

## Related Commands

| Command | Purpose |
|---------|---------|
| `/orca-os-dev` | Modify existing OS tooling |
| `/plan` | Create requirements specs |
| `/orca` | Universal router to domain lanes |

---

## Agent Team

| Agent | Purpose | Weight |
|-------|---------|--------|
| `orca-pipeline-orchestrator` | Wizard coordination, phase routing | heavy |
| `orca-pipeline-researcher` | Bounded _explore/ search | medium |
| `orca-pipeline-architect` | Blueprint design | medium |
| `orca-pipeline-generator` | Artifact file creation | heavy |
| `orca-pipeline-validator` | Completeness verification | medium |

---

_Source of truth: `docs/reference/os-dependency-graph.yaml`_
