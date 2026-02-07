---
description: "OS 5.2 meta-pipeline for creating new domain pipelines"
argument-hint: "[--quick] <domain-name> [description]"
allowed-tools:
  - Task
  - AskUserQuestion
  - Read
  - Bash
  - Grep
  - Glob
  - mcp__project-context__query_context
  - mcp__project-context__save_decision
  - mcp__project-context__save_task_history
---

## STOP - DELEGATION ONLY

**Before you do ANYTHING else, read this.**

This slash command EXISTS to delegate work to agents. Not to do work directly.

**NEVER acceptable:**
- "This is simple, I'll just do it directly"
- "Let me quickly create this file"
- "I can handle this without agents"
- Using Edit/Write tools to make changes yourself

**ALWAYS required:**
1. Parse the arguments
2. Determine mode (--quick vs full)
3. **Delegate via Task tool to orca-pipeline-orchestrator**

**If you are about to Edit/Write, STOP. Delegate instead.**

---

# /orca-pipeline – Meta-Pipeline for Creating Domain Pipelines (OS 5.2)

Create new domain pipelines systematically through a 5-phase wizard.
Ensures all required artifacts are generated and properly integrated.

## Usage

```bash
# Full 5-phase wizard (recommended for new domains)
/orca-pipeline trading "Fundamentals-based trading analysis and execution"

# Quick mode with Template Gallery
/orca-pipeline --quick data-analysis

# Quick mode for rapid experimentation
/orca-pipeline --quick market-research "Quick market research workflow"
```

## Modes

| Mode | Flag | Phases | Use Case |
|------|------|--------|----------|
| **Full** | (none) | Interview → Research → Blueprint → Generate → Validate | New domains, complex pipelines |
| **Quick** | `--quick` | Template Select → Customize → Generate → Validate | Known patterns, rapid prototyping |

---

## 0. Parse Arguments

**Check for flags:**
```
$ARGUMENTS contains "--quick" → Quick mode (Template Gallery)
No flag → Full 5-phase wizard
```

**Extract domain name:**
- First non-flag argument is domain name
- Optional description follows in quotes

**Examples:**
- `/orca-pipeline trading "desc"` → domain="trading", mode=full
- `/orca-pipeline --quick analysis` → domain="analysis", mode=quick

---

## 1. Delegate to Orchestrator

**For Full Mode:**

```typescript
Task({
  subagent_type: 'orca-pipeline-orchestrator',
  description: 'Create <domain> pipeline via 5-phase wizard',
  prompt: `
Create a new domain pipeline for "<domain-name>".

MODE: full (5-phase wizard)

Domain: <domain-name>
Description: <description or "Not provided">

Execute the full 5-phase wizard:
1. INTERVIEW - Gather domain requirements
2. RESEARCH - Find templates in _explore/
3. BLUEPRINT - Design pipeline architecture
4. GENERATE - Create all required files
5. VALIDATE - Ensure completeness

Include checkpoints after phases 1, 2, and 3 for user approval.
  `
})
```

**For Quick Mode:**

```typescript
Task({
  subagent_type: 'orca-pipeline-orchestrator',
  description: 'Create <domain> pipeline via Template Gallery',
  prompt: `
Create a new domain pipeline for "<domain-name>".

MODE: quick (Template Gallery)

Domain: <domain-name>
Description: <description or "Not provided">

Skip interview and research. Offer template selection:
- hybrid (8 agents, balanced)
- research-heavy (7 agents, planning focus)
- build-heavy (5 agents, implementation focus)
- minimal (4 agents, quick experiments)

Then generate and validate.
  `
})
```

---

## 2. Pipeline Phases (Full Mode)

### Phase 1: INTERVIEW

Gather domain-specific requirements:

- **Workflow type**: Research-heavy, build-heavy, or hybrid
- **Specialists needed**: Performance, security, accessibility, etc.
- **Quality gates**: Standards, design QA, verification
- **MCP integrations**: Browser automation, external APIs, etc.

**Checkpoint:** Display summary, get user approval.

### Phase 2: RESEARCH

Search _explore/ for relevant agent templates:

- Check `_explore/4.agents-workflows/_domains/DOMAINS-INDEX.md`
- Check `_explore/INDEX.md` for related collections
- Prefer Tier 1-2 sources (score ≥7)
- **HARD LIMITS:** Max 20 files, 5 minutes

**Checkpoint:** Display research findings, get user approval.

### Phase 3: BLUEPRINT

Design pipeline architecture:

- Agent taxonomy (orchestrators, builders, specialists, gates)
- Phase flow with agent assignments
- Three-tier complexity routing
- MCP requirements

**Checkpoint:** Display blueprint, get user approval.

### Phase 4: GENERATE

Create all required files:

- `commands/<domain>.md` - Orchestrator command
- `docs/pipelines/<domain>-pipeline.md` - Pipeline documentation
- `docs/reference/phase-configs/<domain>-phase-config.yaml` - Phase config
- `agents/<domain>/*.md` - All agents from blueprint

### Phase 5: VALIDATE

Ensure completeness:

- Syntax validation (YAML/Markdown)
- Completeness check vs `os-dependency-graph.yaml`
- Cross-reference validation
- Documentation sync check

**If validation fails:** Loop back to Phase 4 with specific fixes.

**If validation passes:** Display success summary with next steps.

---

## 3. Template Gallery (Quick Mode)

Four predefined templates:

| Template | Agents | Best For |
|----------|--------|----------|
| **hybrid** | 8 | Most features, balanced planning + building |
| **research-heavy** | 7 | Data, analysis, discovery workflows |
| **build-heavy** | 5 | Simple implementations, minimal planning |
| **minimal** | 4 | Quick experiments, prototyping |

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

## 4. Artifacts Generated

For every new pipeline:

### Required Files (from os-dependency-graph.yaml)

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

## 5. Success Criteria

Pipeline creation is complete when:

1. All files from `impact_rules.lane_add.create` exist
2. All YAML files parse without errors
3. All agent cross-references resolve
4. Documentation files identified for update
5. New command structure is valid

---

## 6. Example Session

```
User: /orca-pipeline trading "Fundamentals-based trading analysis"

Claude: Starting /orca-pipeline wizard for "trading"...

## Phase 1: Interview

[AskUserQuestion about workflow type, specialists, gates, MCPs]

User answers...

## Interview Summary

**Domain:** trading
**Workflow Type:** research-heavy
**Specialists:** performance
**Gates:** standards, verification
**MCPs:** None additional

Proceed to research phase? [Yes]

## Phase 2: Research

Searching _explore/ for trading-related templates...

[Research agent runs, returns findings]

## Research Summary

**Files Analyzed:** 15
**Relevant Templates Found:**
- trading/workflow-synthesis-report.md (score: 9)
- _anthropic/multi-agent-research-system.md (score: 10)

**Suggested Agent Roles:**
- trading-research-agent
- trading-analysis-agent
- trading-execution-agent

Proceed to blueprint phase? [Yes]

... continues through all phases ...

## Pipeline Created Successfully

**Command:** /trading
**Agents:** 7

### Next Steps
1. Review generated files
2. Update documentation
3. Deploy to ~/.claude/
4. Test with: /trading "analyze AAPL fundamentals"
```

---

## 7. Key Safeguards

| Safeguard | Purpose |
|-----------|---------|
| Research bounded (20 files, 5 min) | Prevent research black hole |
| Checkpoints at phases 1-3 | Prevent wrong direction |
| os-dependency-graph validation | Prevent orphaned artifacts |
| 5-phase maximum | Prevent over-engineering |
| Template Gallery escape hatch | Respect user expertise |

---

## 8. Related Commands

| Command | Purpose |
|---------|---------|
| `/orca-os-dev` | Modify existing OS tooling |
| `/plan` | Create requirements specs |
| `/orca` | Universal router to domain lanes |

---

## 9. Completion & Learning

After successful pipeline creation:

1. Save decision via `mcp__project-context__save_decision`:
   - Domain, template used, agent count
   - Key architectural decisions
   - Path to generated files

2. Save task history via `mcp__project-context__save_task_history`:
   - domain: "orca-pipeline"
   - task: "Created <domain> pipeline"
   - outcome: "success"
   - files_modified: [list of created files]
   - learnings: Key patterns used
