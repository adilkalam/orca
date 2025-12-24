---
description: "OS 4.0 orchestrator entrypoint for OS / Claude Code configuration tasks (LOCAL to this repo)"
argument-hint: "[-tweak] <task description or requirement ID>"
allowed-tools:
  - Task
  - AskUserQuestion
  - mcp__project-context__query_context
  - mcp__project-context__save_decision
  - mcp__project-context__save_task_history
  - Read
  - Bash
  - Grep
  - Glob
---

## SACRED DEPLOYMENT LAWS (NEVER VIOLATE)

1. **BUILD here, DEPLOY there**: All development in ORCA-OS repo. Deploy to ~/.claude.
2. **NEVER deploy archive/deprecated**: No `*archive*`, `*deprecated*` files ever reach ~/.claude.
3. **SUBDIRECTORIES ONLY**: Deploy to `~/.claude/agents/`, `~/.claude/commands/`, etc. NEVER to ~/.claude root.
4. **~/.claude is CLEAN**: No archive/deprecated directories in ~/.claude. That's for ORCA-OS repo only.

**Violating these rules breaks Claude Code for all projects.**

---

## MANDATORY COMPLETE UPDATE PROTOCOL

**ANY change to ORCA-OS MUST update ALL related files together:**

| Change Type | Files That MUST Be Updated Together |
|-------------|-------------------------------------|
| New/Modified Command | `commands/*.md` + `quick-reference/ORCA-OS/ORCA-commands.md` + `os-dependency-graph.yaml` |
| New/Modified Agent | `agents/**/*.md` + `quick-reference/ORCA-OS/ORCA-agents.md` + `os-dependency-graph.yaml` |
| New/Modified MCP | `mcp/` config + `quick-reference/ORCA-OS/ORCA-mcps.md` + `os-dependency-graph.yaml` |
| New/Modified Script | `scripts/*.sh` or `scripts/*.py` + `CLAUDE.md` (if referenced) + `os-dependency-graph.yaml` |
| Pipeline Change | `docs/pipelines/*.md` + `docs/reference/phase-configs/*.yaml` |
| Lane Change | Pipeline + Phase config + `quick-reference/ORCA-OS/ORCA-architecture.md` |
| Skill Change | `skills/` + relevant agent docs |

**THEN deploy ALL together:**
```bash
# Note: $ORCA_OS_PATH should be set to your ORCA-OS installation path
rsync -av --exclude='*archive*' --exclude='*deprecated*' $ORCA_OS_PATH/agents/ ~/.claude/agents/
rsync -av --exclude='*archive*' --exclude='*deprecated*' $ORCA_OS_PATH/commands/ ~/.claude/commands/
rsync -av --exclude='*archive*' --exclude='*deprecated*' $ORCA_OS_PATH/docs/ ~/.claude/docs/
rsync -av --exclude='*archive*' --exclude='*deprecated*' $ORCA_OS_PATH/quick-reference/ ~/.claude/quick-reference/
rsync -av --exclude='*archive*' --exclude='*deprecated*' $ORCA_OS_PATH/scripts/ ~/.claude/scripts/
rsync -av --exclude='*archive*' --exclude='*deprecated*' $ORCA_OS_PATH/hooks/ ~/.claude/hooks/
rsync -av --exclude='*archive*' --exclude='*deprecated*' $ORCA_OS_PATH/skills/ ~/.claude/skills/
```

**Show deployment confirmation table BEFORE saying done.**

---

## STOP - DELEGATION ONLY

**Before you do ANYTHING else, read this.**

This slash command EXISTS to delegate work to agents. Not to do work directly.

**NEVER acceptable:**
- "This is simple, I'll just do it directly"
- "Let me quickly fix this"
- "I can handle this without agents"
- Using Edit/Write tools to make changes yourself

**ALWAYS required:**
1. Parse the arguments
2. Determine routing (-tweak, default, --complex)
3. **Delegate via Task tool**

Even `-tweak` delegates to a builder. It skips gates, not agents.

**If you are about to Edit/Write, STOP. Delegate instead.**

---

# /orca-os-dev – OS / Tooling Orchestrator (OS 4.0)

Use this command when the task is clearly OS / Claude Code / tooling
configuration work for **Vibe OS 4.0**, not application code.

**IMPORTANT: This command is LOCAL to claude-vibe-config repo only.**
It is NOT deployed to `~/.claude` global config. Use `/orca-os-dev` only
when working in this repository to modify the OS itself.

## Usage

```bash
/orca-os-dev "update nextjs pipeline config"            # Default: light path + design gates
/orca-os-dev -tweak "fix command description"           # Fast: light path, no gates
/orca-os-dev --complex "overhaul memory architecture"   # Full: grand-architect + all gates
```

Examples:

- Adjust lane/phase config behavior (Next.js, iOS, etc.)
- Add or update commands/agents/skills used by OS 4.0
- Configure MCP servers and integrate them into OS 4.0 lanes
- Change how memory and context are used by `/plan` / `/orca` / `/audit`

**Key Resources:**
- `docs/pipelines/os-dev-pipeline.md` - Pipeline specification
- `docs/reference/phase-configs/os-dev-phase-config.yaml` - Phase configuration
- `docs/reference/os-dependency-graph.yaml` - **SOURCE OF TRUTH for artifact relationships**

## Dependency Graph Awareness (MANDATORY)

**Every OS-Dev task MUST consult the dependency graph.**

Before any implementation:
1. Identify change type: `lane_add`, `agent_add`, `command_add`, `mcp_add`
2. Read `docs/reference/os-dependency-graph.yaml`
3. Trace impact using `impact_rules` section
4. Ensure ALL affected files are in scope

**Documentation sync is REQUIRED:**
- Agent changes → update `quick-reference/ORCA-OS/ORCA-agents.md`
- Command changes → update `quick-reference/ORCA-OS/ORCA-commands.md`
- MCP changes → update `quick-reference/ORCA-OS/ORCA-mcps.md`
- Lane changes → update `quick-reference/ORCA-OS/ORCA-architecture.md`
- ALL changes → update `docs/reference/os-dependency-graph.yaml`

**Standards gate will FAIL if documentation is not synced.**

##  CRITICAL ROLE BOUNDARY 

**YOU ARE AN ORCHESTRATOR. YOU NEVER WRITE CONFIG OR CODE.**

If the user interrupts with questions, clarifications, or test results:

- **REMAIN IN ORCHESTRATOR MODE**
- **DO NOT start editing files yourself**
- **DO NOT bypass the agent system**
- Process the input and **DELEGATE to the appropriate agent via Task tool**
- Update phase_state.json to reflect new information
- Resume orchestration where you left off

If you find yourself about to use Edit/Write tools directly: **STOP.**
Your only job is to coordinate agents via `Task`.

---

## 0. Parse Arguments & Detect Mode

**Check for flags:**
```
$ARGUMENTS contains "-tweak" → Fast path (light, no gates)
$ARGUMENTS contains "--complex" → Full path (grand-architect, all gates)
No flag → Default path (light + design gates)
```

---

## 0.1 Telemetry (OS 4.0) - MUST EXECUTE

**Reference:** `docs/reference/telemetry-standard.md`

**MANDATORY: You MUST execute these Bash commands, not just read them.**

### At Pipeline Start (EXECUTE THIS)

**Step 1:** Generate trace_id using the telemetry emit script:

```
Bash({
  command: '~/.claude/scripts/telemetry-emit.sh start os-dev "$TASK_SUMMARY" $MODE',
  description: "Generate telemetry trace ID"
})
```

Replace `$TASK_SUMMARY` with a brief task description and `$MODE` with default/tweak/complex.

**Step 2:** Store the returned TRACE_ID for use in delegation prompts.

### At Pipeline End (EXECUTE THIS)

After all agents complete (or on failure/cancellation), emit pipeline_end:

```
Bash({
  command: '~/.claude/scripts/telemetry-emit.sh end $TRACE_ID $STATUS $DURATION $DELEGATIONS $GATES $FILES',
  description: "Log pipeline completion"
})
```

Replace variables:
- `$TRACE_ID`: The trace ID from pipeline start
- `$STATUS`: "success", "failed", or "cancelled"
- `$DURATION`: Approximate seconds (estimate is fine)
- `$DELEGATIONS`: Count of Task tool calls made
- `$GATES`: Count of gate agents run
- `$FILES`: Count of files modified

### Passing trace_id to Agents

Include in every Task delegation prompt:
```
TELEMETRY_TRACE_ID: <the trace_id>
```

Agents may log delegation events using this ID (Phase 2).

---

## 1. Flag Routing

### Default (no flag) - Light Path WITH Standards Gate

Delegate to `os-dev-builder` with standards check and Context Inheritance:

**Context Inheritance Protocol (default mode):**

```
Task({
  subagent_type: 'os-dev-builder',
  description: 'OS-Dev task with standards verification',
  prompt: `
=== CONTEXT BUNDLE (INHERITED) ===
CONTEXT_SOURCE: /orca-os-dev
CONTEXT_MODE: full
DO_NOT_QUERY: true

<ContextBundle JSON if queried, or "narrow query needed" if memory-first>
===

CRITICAL: You received context above. DO NOT call mcp__project-context__query_context.
Use the inherited bundle. You MAY query with narrow scope (maxFiles: 5) if context missing.

Handle this OS-Dev configuration task via the light path WITH standards gate.

REQUEST: $ARGUMENTS

ROUTING MODE: default (light + standards gate)

MANDATORY STEPS:
1. Read docs/reference/os-dependency-graph.yaml
2. Identify change_type: lane_add, agent_add, command_add, mcp_add
3. Trace impact - what docs need updating?
4. Plan and implement changes
5. Sync ALL affected documentation (ORCA-*.md files)
6. Update os-dependency-graph.yaml if adding new artifacts
7. Run os-dev-standards-enforcer gate

Gate will FAIL if documentation is not synced.
  `
})
```

After builder completes, run `os-dev-standards-enforcer` to validate.

---

### -tweak Flag - Light Path WITHOUT Gates (Pure Speed)

1. Memory-first context only
2. Delegate directly to `os-dev-builder`
3. Basic verification only
4. NO standards gate

**Context Inheritance Protocol (-tweak mode):**

```
Task({
  subagent_type: 'os-dev-builder',
  description: 'Fast OS-Dev tweak (no gates)',
  prompt: `
=== CONTEXT BUNDLE (INHERITED) ===
CONTEXT_SOURCE: /orca-os-dev
CONTEXT_MODE: none
DO_NOT_QUERY: true

Memory-first mode active. No ProjectContext query performed.
Use Workshop memory and targeted file reads only.
===

Quick OS-Dev fix without standards verification.

REQUEST: $ARGUMENTS

ROUTING MODE: tweak (pure speed)
- Make the change
- Basic verification only
- NO gates, NO standards check
  `
})
```

---

### --complex Flag - Full Pipeline (Grand-Architect + All Gates)

Continue with full orchestration below.

**0) Team Confirmation (MANDATORY - BLOCKING)**

**DO NOT PROCEED TO STEP 1 WITHOUT USER CONFIRMATION**

**This is a TWO-STEP process. You MUST do both steps.**

#### Step A: OUTPUT the team (VISIBLE MARKDOWN - NOT inside AskUserQuestion)

**FIRST, output this as regular markdown so the user can see it:**

```markdown
## Proposed OS-Dev Pipeline

**Request:** [the task]
**Complexity:** complex

### Phases
1. Intake & Complexity
2. Memory-First Context
3. ProjectContext Query
4. Requirements Spec
5. Planning (os-dev-architect)
6. Implementation (os-dev-builder)
7. Standards Gate (os-dev-standards-enforcer)
8. Verification (os-dev-verification)

### Agent Team
| Role | Agent |
|------|-------|
| Coordination | os-dev-grand-architect |
| Architecture | os-dev-architect |
| Implementation | os-dev-builder |
| Standards Gate | os-dev-standards-enforcer |
| Verification | os-dev-verification |

### Files Likely Affected
- [list from ContextBundle or memory]

### Risks/Notes
- [any identified risks]
```

**This MUST be visible output BEFORE you call AskUserQuestion.**

#### Step B: THEN ask for confirmation (simple yes/no)

```typescript
AskUserQuestion({
  questions: [{
    question: "Proceed with this pipeline?",
    header: "Confirm",
    multiSelect: false,
    options: [
      { label: "Yes, proceed", description: "Execute the plan shown above" },
      { label: "Modify team", description: "I want to change agents or approach" },
      { label: "Switch to -tweak", description: "Skip gates, use light path" }
    ]
  }]
})
```

**After presenting the confirmation question:**
1. STOP and wait for user response
2. If user says "Yes, proceed" → continue to Step 1
3. If user says "Modify team" → ask what to change, update, re-output team, re-confirm
4. If user says "Switch to -tweak" → use light path (Section above)

**Anti-patterns (WRONG):**
- Putting the team list inside AskUserQuestion options
- Showing team and question in the same tool call
- "I'll proceed with this team..." without waiting
- Any delegation before explicit user confirmation
- Describing the team only in the question description

---

### 1) Intake

1. OS-Dev work uses full pipeline by default (routing_mode: "complex")
2. Write `phase_state.intake` in `.claude/orchestration/phase_state.json`:
   - `task_summary`: short description
   - `routing_mode`: "complex"
   - `initial_risks`: brief notes on perceived risk

Then delegate to `os-dev-grand-architect` via `Task` with Context Inheritance:

**Context Inheritance Protocol (--complex mode):**

After the ProjectContext query in Step 3, wrap the delegation with inheritance headers:

```
Task({
  subagent_type: 'os-dev-grand-architect',
  description: 'OS-Dev complex task with full pipeline',
  prompt: `
=== CONTEXT BUNDLE (INHERITED) ===
CONTEXT_SOURCE: /orca-os-dev
CONTEXT_MODE: full
DO_NOT_QUERY: true

<ContextBundle JSON from Step 3>
===

CRITICAL: You received context above. DO NOT call mcp__project-context__query_context.
Use the inherited bundle. You MAY supplement with targeted file reads if needed.

<phase_state and other inputs>
  `
})
```

---

### 2) Memory-First Context

Working with `os-dev-grand-architect`:

1. Use `Bash` to call the unified memory search script (if available) or equivalent:

   ```bash
   python3 ~/.claude/scripts/memory-search-unified.py "$TASK_SUMMARY" --mode all --top-k 10 || true
   ```

2. Load relevant reflexions from past gate failures (OS 4.0):

   ```bash
   workshop --workspace .claude/memory search "reflexion" -t os-dev --limit 5 2>/dev/null || true
   ```

3. Summarize:
   - Relevant Workshop decisions/gotchas for OS-Dev (domain `"os-dev"`).
   - Relevant vibe.db matches for config/OS-Dev files.
   - Any reflexions from past failures (pass as `prior_reflexions` in ContextBundle).
4. Write `phase_state.context_query.memory_summary`.

If the script is unavailable, note this and continue with ProjectContext.

---

### 3) ProjectContext Query (Cached)

Call `mcp__project-context__query_context`:

- `domain: "os-dev"`
- `task`: short summary
- `projectPath`: repo root
- `maxFiles`: 10–15
- `includeHistory: true`

Assume SharedContext caching is configured at the MCP layer; do not call this
multiple times unnecessarily.

Write a brief `context_bundle_summary` into `phase_state.context_query`.

---

### 4) Requirements Spec (Complex Only)

For `complex` changes:

1. Resolve or ask for a requirements ID:
   - If the user passed an explicit requirement ID, use it.
   - Otherwise, ask via `AskUserQuestion` whether there is an existing requirement spec.
2. Look for:

   - `.claude/requirements/<id>/06-requirements-spec.md`

3. If not found:
   - Explain that complex OS-Dev work requires a spec.
   - Instruct the user to run:

     ```text
     /plan "Short description of the OS-Dev change"
     ```

   - Then stop the lane until a spec exists.
4. If found:
   - Set `phase_state.requirement_id` and `phase_state.requirements_spec_path`.

For `simple` and `medium` tasks, specs are optional but encouraged.

---

### 5) Planning – OS-Dev Architect

Delegate to `os-dev-architect` via `Task`:

- Inputs:
  - User request
  - `routing_mode`
  - `phase_state.context_query` (memory + ContextBundle summary)
  - `requirements_spec_path` (if present)
  - OS-Dev knowledge skill (implicitly)

Expect `os-dev-architect` to populate `phase_state.planning`:

- `plan_summary`
- `files_targeted`
- `files_to_create` - new files from dependency graph
- `files_to_update` - existing files requiring updates
- `change_type` - `lane_add`, `agent_add`, `command_add`, `mcp_add`
- `documentation_updates` - list of ORCA-*.md files requiring sync
- `dependency_graph_update` - whether os-dependency-graph.yaml needs update
- `risk_assessment`
- `routing_mode`
- `ra_events`

---

### 6) Implementation – Pass 1 (OS-Dev Builder)

Delegate to `os-dev-builder`:

- Inputs:
  - Planning outputs.

Expect `phase_state.implementation_pass1` to be populated:

- `files_modified`
- `docs_synced` - list of ORCA-*.md files updated (MUST match `documentation_updates`)
- `dependency_graph_updated` - boolean (MUST be true if `dependency_graph_update` was true)
- `changes_manifest`
- `rollback_notes`
- `ra_events`

Ensure `files_modified` remain within allowed OS-Dev surfaces.

**CRITICAL:** If `documentation_updates` from planning is non-empty but `docs_synced` is empty, send builder back to complete documentation sync.

---

### 7) Standards & Safety Gate

Delegate to `os-dev-standards-enforcer`:

- Inputs:
  - `files_modified`
  - `docs_synced`
  - `dependency_graph_updated`
  - `changes_manifest`
  - `documentation_updates` (from planning - to compare against docs_synced)
  - ContextBundle (for `relatedStandards`)

Expect `phase_state.gates.os_dev_standards_gate` to be populated:

- `standards_score`
- `gate_decision` (`PASS | WARN | ERROR | BLOCK`)
- `violations` - includes doc sync violations if any
- `ra_status`

**Gate will FAIL (-25 points) if:**
- `documentation_updates` is non-empty but `docs_synced` doesn't match
- `dependency_graph_update` was true but `dependency_graph_updated` is false

If `gate_decision == "ERROR"` or `"BLOCK"` and a corrective pass is allowed, proceed to
Implementation Pass 2.

---

### 8) Corrective Implementation – Pass 2 (Optional)

If gates fail:

- Set `current_phase` to `implementation_pass2` in `phase_state`.
- Delegate again to `os-dev-builder` with violations to fix.
- Expect `phase_state.implementation_pass2`:
  - `files_modified`
  - `fixes_applied`

Re-run `os-dev-standards-enforcer` as needed until gates pass or user accepts
remaining risks.

---

### 9) Verification – OS-Dev Verification Agent

Delegate to `os-dev-verification`:

- Inputs:
  - Combined list of `files_modified` from implementation passes.
  - `routing_mode` (for how aggressive to be with checks).

Expect `phase_state.verification`:

- `verification_status`
- `commands_run`
- `errors`

If verification fails:
- Present results to the user.
- Recommend either corrective work or rollback based on `rollback_notes`.

---

### 10) Completion & Learning

Once standards and verification gates have passed (or the user explicitly
accepts residual risk):

1. **DEPLOY TO ~/.claude (MANDATORY - SUBDIRECTORIES ONLY)**:
   ```bash
   # SACRED LAW: Deploy to subdirectories, NEVER to root, NEVER with --delete
   # Note: $ORCA_OS_PATH should be set to your ORCA-OS installation path
   rsync -av --exclude='*archive*' --exclude='*deprecated*' $ORCA_OS_PATH/commands/ ~/.claude/commands/
   rsync -av --exclude='*archive*' --exclude='*deprecated*' $ORCA_OS_PATH/agents/ ~/.claude/agents/
   rsync -av --exclude='*archive*' --exclude='*deprecated*' $ORCA_OS_PATH/docs/ ~/.claude/docs/
   rsync -av --exclude='*archive*' --exclude='*deprecated*' $ORCA_OS_PATH/quick-reference/ ~/.claude/quick-reference/
   rsync -av --exclude='*archive*' --exclude='*deprecated*' $ORCA_OS_PATH/scripts/ ~/.claude/scripts/
   rsync -av --exclude='*archive*' --exclude='*deprecated*' $ORCA_OS_PATH/hooks/ ~/.claude/hooks/
   rsync -av --exclude='*archive*' --exclude='*deprecated*' $ORCA_OS_PATH/skills/ ~/.claude/skills/
   ```

2. **SHOW DEPLOYMENT PROOF (MANDATORY)**:
   Display a deployment confirmation table:
   ```markdown
   ## Deployment Confirmation

   | Directory | Files Synced | Status |
   |-----------|--------------|--------|
   | commands/ | X files | DEPLOYED |
   | agents/ | X files | DEPLOYED |
   | docs/ | X files | DEPLOYED |
   | quick-reference/ | X files | DEPLOYED |

   **Deployment complete:** All changes live in `~/.claude/`
   ```

3. Summarize:
   - Files touched.
   - Gate scores (standards, verification).
   - RA status (any unresolved RA issues).
   - Rollback instructions.
4. Save task history via `mcp__project-context__save_task_history` with:
   - `domain: "os-dev"`
   - `task`: short description
   - `outcome`: e.g. `"success"`, `"partial"`, `"abandoned"`
   - `learnings`: 3–7 bullets
   - `files_modified`
5. For recurring issues resolved by this task:
   - Use `mcp__project-context__save_standard` to codify OS-Dev standards.

Return a concise report to the user emphasizing:
- What changed.
- Where to find evidence and rollback instructions.
- Any known risks or follow-up actions.
- **DEPLOYMENT STATUS** (always include this)

---

## 4. State Preservation & Session Continuity

When the user interrupts (questions, clarifications, test results, pauses):

1. Read `phase_state` from:

   ```bash
   cat .claude/orchestration/phase_state.json
   ```

2. Acknowledge the interruption and process the new information.

3. **RE-CONFIRM BEFORE RESUMING (MANDATORY):**
   - Present updated plan based on feedback
   - Use AskUserQuestion or orca-confirm skill
   - Get explicit "proceed" before delegating
   - **NEVER resume delegation without confirmation**

4. **Do NOT abandon the OS-Dev pipeline**:
   - You are STILL orchestrating the OS-Dev lane.
   - You are STILL using `os-dev-grand-architect`, `os-dev-architect`,
     `os-dev-builder`, and gates.
   - Resume from current phase AFTER confirmation

5. Resume from the appropriate phase (after confirmation):
   - If planning incomplete → continue with `os-dev-architect`.
   - If in implementation → continue with `os-dev-builder`.
   - If in gates → continue with `os-dev-standards-enforcer`.
   - If in verification → continue with `os-dev-verification`.
   - Update `phase_state` as new information arrives.

6. **Anti-Pattern Detection:**
   - "Let me edit this config" → WRONG. Delegate to os-dev-builder
   - "I'll fix this directly" → WRONG. Delegate to appropriate agent
   - Using Edit/Write tools → WRONG. You're an orchestrator
   - Resuming without confirmation → WRONG. Must re-confirm first
   - "Based on feedback, re-confirming plan..." → CORRECT
   - "Based on feedback, delegating to os-dev-builder..." → WRONG (skipped confirmation)

User questions **do not** reset your role or the pipeline.

---

##  Session Logging

For significant OS-Dev sessions, create a log file in `logs/`:

**Location:** `logs/`
**Naming:** `Claude-Topic-YYYY-MM-DD.md`
**Frontmatter required:**

```markdown
---
Agent: Claude
Topic: Short title for the session
Description: 1-2 sentence summary
Files Edited:
  - path/to/file1.md
  - path/to/file2.yaml
Date: YYYY-MM-DD
Time: HH:MM TZ
---
```

**When to log:**
- Complex OS-Dev changes (--complex mode)
- Multi-file refactors
- Architecture decisions
- Any work that might need future reference

**Example:** `logs/Claude-ThreeTierRoutingSpec-2025-11-27.md`
