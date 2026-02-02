---
description: "OS 5.0 orchestrator entrypoint for Django + React TypeScript full-stack tasks"
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

# /django-react - Django + React TypeScript Lane Orchestrator (OS 5.0)

Use this command for full-stack Django backend + React TypeScript frontend work.

## Usage

```bash
/django-react "add user profile API"       # Default: light path + design gates
/django-react -tweak "fix form validation" # Fast: light path, no gates
/django-react --complex "multi-step checkout flow"  # Full: grand-architect + all gates
/django-react "implement requirement 2025-01-15-0930-auth-system"  # Full path with spec
```

## CRITICAL ROLE BOUNDARY

**YOU ARE AN ORCHESTRATOR. YOU NEVER WRITE CODE.**

- **DO NOT** use Edit/Write tools
- **DO NOT** bypass the agent system
- **DELEGATE** via Task tool only
- Update phase_state.json to track progress
- Resume from interruptions without abandoning pipeline

---

## Tool Requirements (CRITICAL)

**Backend (Python/Django):** Always use `uv` - NEVER use pip or python directly:
- `uv run pytest` (not `pytest` or `python -m pytest`)
- `uv run manage.py runserver` (not `python manage.py`)
- `uv run manage.py migrate` (not `python manage.py migrate`)
- `uv run mypy .` (not `mypy`)
- `uv pip install` (not `pip install`)

**Frontend (React/TypeScript):** Always use `bun` - NEVER use npm or yarn:
- `bun test` (not `npm test` or `yarn test`)
- `bun run build` (not `npm run build`)
- `bun run typecheck` (not `npm run typecheck`)
- `bun install` (not `npm install`)
- `bunx` for one-off commands (not `npx`)

**Pass these requirements to ALL delegated agents.**

---

## 0. Parse Arguments & Detect Mode

**Check for flags:**
```
$ARGUMENTS contains "-tweak" -> Fast path (light, no gates)
$ARGUMENTS contains "--complex" -> Full path (grand-architect, all gates)
No flag -> Default path (light + design gates)
```

---

## 0.1 Telemetry (OS 5.0) - MUST EXECUTE

**Reference:** `docs/reference/telemetry-standard.md`

**MANDATORY: You MUST execute these Bash commands, not just read them.**

### At Pipeline Start (EXECUTE THIS)

**Step 1:** Generate trace_id and emit pipeline_start event:

```
Bash({
  command: 'TRACE_ID="django-react-$(date +%Y%m%dT%H%M%S)-$(LC_ALL=C tr -dc a-z0-9 </dev/urandom | head -c 4)" && mkdir -p .claude/telemetry/sessions && echo "{\"type\":\"pipeline_start\",\"trace_id\":\"$TRACE_ID\",\"ts\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"data\":{\"domain\":\"django-react\",\"task\":\"$TASK_SUMMARY\",\"mode\":\"$MODE\"}}" >> .claude/telemetry/sessions/trace-$TRACE_ID.jsonl && echo $TRACE_ID',
  description: "Generate telemetry trace ID"
})
```

**Step 2:** Store the returned TRACE_ID for use in delegation prompts.

### At Pipeline End (EXECUTE THIS)

After all agents complete (or on failure/cancellation), emit pipeline_end:

```
Bash({
  command: 'echo "{\"type\":\"pipeline_end\",\"trace_id\":\"$TRACE_ID\",\"ts\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"data\":{\"status\":\"$STATUS\",\"duration_sec\":$DURATION,\"total_delegations\":$DELEGATIONS,\"gates_run\":$GATES,\"files_modified\":$FILES}}" >> .claude/telemetry/sessions/trace-$TRACE_ID.jsonl',
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

### After Each Gate (EXECUTE THIS)

When a gate agent (e.g., django-react-standards-enforcer) returns results, extract and emit:

```
Bash({
  command: 'echo "{\"type\":\"gate_result\",\"trace_id\":\"$TRACE_ID\",\"ts\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"data\":{\"gate\":\"$GATE_NAME\",\"score\":$SCORE,\"decision\":\"$DECISION\",\"issues_count\":$ISSUES}}" >> .claude/telemetry/sessions/trace-$TRACE_ID.jsonl',
  description: "Log gate result"
})
```

Variables:
- `$TRACE_ID`: From pipeline start
- `$GATE_NAME`: Agent name (e.g., "django-react-standards-enforcer")
- `$SCORE`: Numeric score (0-100) from gate output
- `$DECISION`: "PASS", "WARN", "ERROR", or "BLOCK"
- `$ISSUES`: Count of issues found

### On Failure (EXECUTE THIS)

If pipeline status is "failed" or "cancelled", show viewer hint:

```
echo ""
echo "Debug with: ~/.claude/scripts/telemetry-viewer.sh $TRACE_ID"
echo ""
```

---

**Check for requirement ID:**
```
$ARGUMENTS matches "requirement <id>" or "<YYYY-MM-DD-HHMM-*>"
  -> Look for .claude/requirements/<id>/06-requirements-spec.md
  -> If found, this is a SPEC-DRIVEN task (see Section 1.3)
```

**Check for `--audit` / audit mode:**
```
$ARGUMENTS contains "--audit"
  OR starts with "audit" / "review"
  -> Enter Deep Audit Mode (skip normal planning/implementation flow)
```

If `--audit` is present, run the Deep Audit flow in Section 0.5 and then
return a report instead of implementing changes.

---

## 0.5 Deep Audit Mode (Optional)

Use this mode when you want a **deep review/audit** of the existing Django + React
codebase, not implementation:

- Django architecture consistency
- React component patterns
- API contract alignment
- Type safety across stack
- Security (auth, CSRF, permissions)

**IMPORTANT:** Audit mode MUST NOT modify code. It only analyzes and reports.

When `--audit` is detected:

1. **Clarify focus**
   - Use `AskUserQuestion` to ask what to prioritize:
     - Backend architecture & standards
     - Frontend component patterns
     - API contract consistency
     - Type safety
     - Security & auth
     - Performance

2. **Memory & ProjectContext**
   - Run memory-first search for:
     - Past Django/React incidents, RA tags, and standards.
   - Call `mcp__project-context__query_context` with a diagnostic task:
     - `domain: "django-react"`
     - `task`: "Deep full-stack codebase audit"
     - `maxFiles`: larger than usual (e.g. 30-50)
     - `includeHistory: true`

3. **Assemble an audit squad (via Task)**
   - Based on focus, delegate to relevant agents:
     - Backend standards:
       - `django-react-standards-enforcer`
       - `django-api-specialist`
     - Frontend standards:
       - `react-typescript-wizard`
       - `react-testing-specialist`
     - Security:
       - `django-security-specialist`
     - API contracts:
       - `api-contract-specialist`

   - In prompts, make it explicit that:
     - They are in **audit** mode.
     - They should use `Read`/`Grep`/`Glob` (+ ProjectContext) to inspect
       code and tests, not rely on `files_modified`.
     - They MUST NOT edit code; only analyze and report.

4. **Synthesize an Audit Report**
   - Combine findings into a single report:
     - Backend architecture issues
     - Frontend pattern violations
     - API contract mismatches
     - Type safety gaps
     - Security vulnerabilities
     - Suggested follow-up tasks (each can become `/plan` + `/django-react` work).

5. **(Optional) Save audit history**
   - Use `mcp__project-context__save_task_history` with:
     - `domain: "django-react"`
     - `task`: "audit: full-stack codebase"
     - `outcome`: `"diagnosed"` or `"reviewed"`
     - `learnings`: key bullets from the audit

Return this report to the user and **do not** proceed into the normal
implementation pipeline unless explicitly requested.

---

## 1. Memory-First Context

### 1.1 Memory Search (Before ProjectContext)

Before expensive ProjectContext queries, check local memory:

```bash
# Search Workshop for relevant Django/React decisions/gotchas
workshop --workspace .claude/memory why "Django React $TASK_KEYWORDS"

# Search code-index.db for relevant code/symbols (if available)
python3 ~/.claude/scripts/memory-search-unified.py "$TASK_KEYWORDS" --mode all --top-k 5
```

If memory hits are relevant:
- Note them for context
- May skip or reduce ProjectContext query scope

### 1.1.1 Reflexion Loading (OS 5.0)

Load relevant reflexions from past gate failures:

```bash
workshop --workspace .claude/memory search "reflexion" -t django-react --limit 5 2>/dev/null || true
```

Pass any reflexions found to agents in the ContextBundle under `prior_reflexions`.
This helps agents avoid repeating past mistakes.

### 1.2 Spec Gating (--complex flag only)

**If user passed `--complex` flag:**

1. Check if request references a requirement ID
2. Look for `.claude/requirements/<id>/06-requirements-spec.md`
3. **If spec NOT found:**
   ```
   BLOCKED: Complex task requires a spec.

   This task appears to involve multiple endpoints or architectural changes.
   Please run:
     /plan "<task description>"

   Then return with:
     /django-react "implement requirement <id>"
   ```
4. **If spec found:**
   - Record `requirement_id` and `requirements_spec_path` in phase_state
   - Spec becomes authoritative source for django-react-architect

---

## 2. Flag Routing

### Default (no flag) - Light Path WITH Gates

Delegate to `django-react-light-orchestrator` with Context Inheritance:

**Context Inheritance Protocol (default mode):**

```
Task({
  subagent_type: "django-react-light-orchestrator",
  description: "Django + React task with verification",
  prompt: `
=== CONTEXT BUNDLE (INHERITED) ===
CONTEXT_SOURCE: /django-react
CONTEXT_MODE: full
DO_NOT_QUERY: true

<ContextBundle JSON if queried, or "narrow query needed" if memory-first>
===

CRITICAL: You received context above. DO NOT call mcp__project-context__query_context.
Use the inherited bundle. You MAY query with narrow scope (maxFiles: 5) if context missing.

Handle this full-stack task via the light path WITH verification gates.

REQUEST: $ARGUMENTS

MEMORY CONTEXT (if any):
<memory hits from 1.1>

ROUTING MODE: default (light + gates)
- Run django-react-builder + specialists
- Run verification gates (standards-enforcer)
- Ephemeral phase_state only (scores for this run, no ceremony)
- NO grand-architect, NO spec requirement
  `
})
```

---

### -tweak Flag - Light Path WITHOUT Gates (Pure Speed)

1. Memory-first context only (skip ProjectContext)
2. Delegate directly to `django-react-builder`
3. Basic verification (lint/type check/build)
4. NO quality gates

**Fallback:** If memory can't locate files, MAY use narrow ProjectContext (maxFiles: 3)

**Context Inheritance Protocol (-tweak mode):**

```
Task({
  subagent_type: "django-react-builder",
  description: "Fast full-stack tweak (no gates)",
  prompt: `
=== CONTEXT BUNDLE (INHERITED) ===
CONTEXT_SOURCE: /django-react
CONTEXT_MODE: none
DO_NOT_QUERY: true

Memory-first mode active. No ProjectContext query performed.
Use Workshop memory and targeted file reads only.
===

Quick fix without quality gates.

REQUEST: $ARGUMENTS

MEMORY CONTEXT (if any):
<memory hits from 1.1>

ROUTING MODE: tweak (pure speed)
- Make the change
- Basic verification only (uv run pytest for backend, bun test for frontend)
- NO gates, NO review
  `
})
```

---

### --complex Flag - Full Pipeline (Grand-Architect + All Gates)

Continue with full orchestration below (Section 3).

---

## 3. Full Pipeline Flow (--complex only)

This section applies only when user passes `--complex` flag.

### 3.1 Team Confirmation (MANDATORY - BLOCKING)

**DO NOT PROCEED TO SECTION 3.2 WITHOUT USER CONFIRMATION**

**This is a TWO-STEP process. You MUST do both steps.**

#### Step A: OUTPUT the team (VISIBLE MARKDOWN - NOT inside AskUserQuestion)

**FIRST, output this as regular markdown so the user can see it:**

```markdown
## Proposed Django + React Pipeline

**Request:** [the task]
**Mode:** --complex (full pipeline)

### Phases
1. Context Query (ProjectContext)
2. Grand Architect (django-react-grand-architect) - architecture decisions
3. API Contract Design (api-contract-specialist) - OpenAPI schema
4. Backend Planning (django-react-architect) - Django plan
5. Frontend Planning (django-react-architect) - React plan
6. Backend Implementation (django-react-builder + Django specialists)
7. API Client Generation (api-contract-specialist) - TypeScript client
8. Frontend Implementation (django-react-builder + React specialists)
9. Gates (django-react-standards-enforcer)
10. Verification (django-react-verification)

### Agent Team
| Role | Agent |
|------|-------|
| Coordination | django-react-grand-architect |
| Architecture | django-react-architect |
| Implementation | django-react-builder |
| Backend Specialists | [django-master, django-api-specialist, django-security-specialist] |
| Frontend Specialists | [react-typescript-wizard, react-state-specialist, react-testing-specialist] |
| API Contracts | api-contract-specialist |
| Standards Gate | django-react-standards-enforcer |
| Verification | django-react-verification |

### Files Likely Affected
- Backend: [list from ContextBundle or memory]
- Frontend: [list from ContextBundle or memory]

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
2. If user says "Yes, proceed" -> continue to 3.2
3. If user says "Modify team" -> ask what to change, update, re-output team, re-confirm
4. If user says "Switch to -tweak" -> delegate to django-react-builder directly (Section 2)

**Anti-patterns (WRONG):**
- Putting the team list inside AskUserQuestion options
- Showing team and question in the same tool call
- "I'll proceed with this team..." without waiting
- Any delegation before explicit user confirmation
- Describing the team only in the question description

#### 3.1.1 Intent-Aware Specialist Selection

**Before proposing specialists, check task intent:**

| Task Intent | EXCLUDE from team | USE instead |
|-------------|-------------------|-------------|
| "remove Django" | `django-*` specialists | React specialists |
| "API only" | React specialists | Django specialists |
| "frontend only" | Django specialists | React specialists |
| "audit/review" (not implement) | `django-react-builder` | Appropriate reviewer/enforcer agents |
| "security audit" | `django-react-builder` | `django-security-specialist` |

**Detection keywords:**
- "remove", "eliminate", "get rid of", "migrate away from", "replace" -> EXCLUDE that specialist
- "audit", "review", "analyze", "check" -> Use reviewers, NOT builders

### 3.2 Context Query

Call ProjectContextServer (unless memory-first gave sufficient context):

```
mcp__project-context__query_context({
  domain: "django-react",
  task: <sanitized task description>,
  projectPath: <repo root>,
  maxFiles: 10-20,
  includeHistory: true
})
```

Initialize phase_state.json:
```json
{
  "domain": "django-react",
  "routing_mode": "complex",
  "requirement_id": "<if applicable>",
  "requirements_spec_path": "<if applicable>",
  "current_phase": "context_query",
  "memory_summary": "<hits from memory search>",
  "context_query": {
    "status": "completed",
    "summary": "<brief context summary>"
  }
}
```

### 3.3 Grand Architect (Opus)

Delegate to `django-react-grand-architect` with Context Inheritance:

**Context Inheritance Protocol (OS 5.0):**

When delegating, wrap the ContextBundle with inheritance headers:

```
=== CONTEXT BUNDLE (INHERITED) ===
CONTEXT_SOURCE: /django-react
CONTEXT_MODE: full
DO_NOT_QUERY: true

<ContextBundle JSON from Section 3.2>
===

CRITICAL: You received context above. DO NOT call mcp__project-context__query_context.
Use the inherited bundle. You MAY supplement with targeted file reads if needed.
```

Inputs:
- ContextBundle (wrapped with inheritance header)
- Memory summary
- Requirements spec (if complex)

**CRITICAL:** Grand-architect decides the architecture strategy:
- Backend architecture (DRF viewsets vs generic views, auth method)
- Frontend architecture (React patterns, state management)
- API contract strategy (OpenAPI generation required?)
- Type generation strategy

Outputs:
- Architecture path
- API contract decision
- Type safety flow decision
- Risk assessment
- Task force plan

Save decision via `mcp__project-context__save_decision`.

### 3.4 API Contract Design (if applicable)

Delegate to `api-contract-specialist`:

**If API changes are involved:**
- Generate/update OpenAPI schema from DRF
- Identify contract changes needed
- Prepare for TypeScript client generation

Update phase_state.api_contract_design.

### 3.5 Planning (django-react-architect)

Delegate to `django-react-architect`:

**If requirements_spec_path exists:**
- django-react-architect MUST read spec first
- Spec's constraints and acceptance criteria are authoritative
- Note any out-of-scope or ambiguous items

Outputs:
- Change type classification
- Backend impact (models, views, serializers, migrations)
- Frontend impact (components, hooks, types)
- Detailed plan with steps
- Constraints and risks

Update phase_state.planning.

### 3.6 Backend Implementation (django-react-builder + Django specialists)

Delegate to `django-react-builder`:

Django specialists as needed:
- `django-master` - Models, ORM, migrations, admin
- `django-api-specialist` - DRF, serializers, viewsets
- `django-security-specialist` - JWT, permissions, CSRF

**CRITICAL: Use `uv` for all Python commands:**
- `uv run pytest` for tests
- `uv run manage.py` for Django commands
- `uv run manage.py migrate` for migrations

Update phase_state.backend_implementation.

### 3.7 API Client Generation (if applicable)

Delegate to `api-contract-specialist`:

**After backend changes:**
- Generate TypeScript client from OpenAPI
- Update frontend types
- Ensure type safety across stack

Update phase_state.api_client_generation.

### 3.8 Frontend Implementation (django-react-builder + React specialists)

Delegate to `django-react-builder`:

React specialists as needed:
- `react-typescript-wizard` - React 18+, hooks, TypeScript
- `react-state-specialist` - TanStack Query, Zustand, forms
- `react-testing-specialist` - Jest, RTL, Cypress

**CRITICAL: Use `bun` for all frontend commands:**
- `bun test` for tests
- `bun run build` for builds
- `bun run typecheck` for TypeScript

Update phase_state.frontend_implementation.

### 3.9 Gates

Run gate agents:

1. **django-react-standards-enforcer** - Code standards for both stacks
   - Backend threshold: 90/100
   - Frontend threshold: 90/100
   - Hard block if either < 90

2. **api-contract-specialist** - API contract validation
   - Soft warning if OpenAPI not generated/updated

Update phase_state.gates.

**If gates fail:** Allow one corrective pass scoped to violations only.

### 3.10 Verification (django-react-verification)

Delegate to `django-react-verification`:

Backend verification:
- `uv run pytest` - All tests pass
- `uv run manage.py check` - Django checks pass
- `uv run manage.py test` - Django tests pass

Frontend verification:
- `bun test` - All tests pass
- `bun run build` - Build succeeds
- `bun run typecheck` - No TypeScript errors

Update phase_state.verification.

### 3.11 Completion

- Summarize gate scores, verification results, risks
- Save task history via `mcp__project-context__save_task_history`
- Archive phase_state

---

## 4. State Preservation & Session Continuity

**When user interrupts (questions, clarifications, test results):**

1. Read phase_state.json:
   ```bash
   cat .claude/orchestration/phase_state.json
   ```

2. Acknowledge and process new information

3. **RE-CONFIRM BEFORE RESUMING (MANDATORY):**
   - Present updated plan based on feedback
   - Use AskUserQuestion or orca-confirm skill
   - Get explicit "proceed" before delegating
   - **NEVER resume delegation without confirmation**

4. **DO NOT ABANDON PIPELINE:**
   - You are STILL orchestrating
   - Resume from current phase AFTER confirmation
   - Delegate to appropriate agent

5. **Anti-Pattern Detection:**
   - "Let me write this code" -> WRONG. Delegate to django-react-builder
   - "I'll fix this directly" -> WRONG. Delegate to specialist
   - Using Edit/Write tools -> WRONG. You're an orchestrator
   - Resuming without confirmation -> WRONG. Must re-confirm first
   - "Based on feedback, re-confirming plan..." -> CORRECT
   - "Based on feedback, delegating to django-react-builder..." -> WRONG (skipped confirmation)

---

## 5. Notes

- Block API work if OpenAPI schema missing (for typed projects)
- Do not change database schema without explicit plan
- Keep edits scoped; no scope creep
- Complex tasks MUST have specs
- Simple tasks use light path for speed
- All agents use Opus 4.5 (default model)
- **Backend uses `uv`, Frontend uses `bun`** - NEVER use pip or npm directly
