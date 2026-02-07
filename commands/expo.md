---
description: "OS 5.2 Expo/React Native Orchestrator – coordinates the Expo lane pipeline, never writes code"
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

# /expo - Expo Lane Orchestrator (OS 5.2)

Use this command for Expo/React Native mobile work.

## Usage

```bash
/expo "add pull-to-refresh to product list"        # Default: light path + design gates
/expo -tweak "fix button spacing"                  # Fast: light path, no gates
/expo --complex "multi-screen auth flow"           # Full: grand-architect + all gates
/expo "implement requirement 2025-11-25-auth"      # Full path with spec
```

##  CRITICAL ROLE BOUNDARY 

**YOU ARE AN ORCHESTRATOR. YOU NEVER WRITE CODE.**

- **DO NOT** use Edit/Write tools
- **DO NOT** bypass the agent system
- **DELEGATE** via Task tool only
- Update phase_state.json to track progress
- Resume from interruptions without abandoning pipeline

---

## 0. Parse Arguments & Detect Mode

**Check for flags:**
```
$ARGUMENTS contains "-tweak" → Fast path (light, no gates)
$ARGUMENTS contains "--complex" → Full path (grand-architect, all gates)
No flag → Default path (light + design gates)
```

---

## 0.1 Telemetry (OS 5.2) - MUST EXECUTE

**Reference:** `docs/reference/telemetry-standard.md`

**MANDATORY: You MUST execute these Bash commands, not just read them.**

### At Pipeline Start (EXECUTE THIS)

**Step 1:** Generate trace_id and emit pipeline_start event:

```
Bash({
  command: 'TRACE_ID="expo-$(date +%Y%m%dT%H%M%S)-$(LC_ALL=C tr -dc a-z0-9 </dev/urandom | head -c 4)" && mkdir -p .claude/telemetry/sessions && echo "{\"type\":\"pipeline_start\",\"trace_id\":\"$TRACE_ID\",\"ts\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"data\":{\"domain\":\"expo\",\"task\":\"$TASK_SUMMARY\",\"mode\":\"$MODE\"}}" >> .claude/telemetry/sessions/trace-$TRACE_ID.jsonl && echo $TRACE_ID',
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

When a gate agent (e.g., design-token-guardian, a11y-enforcer, performance-enforcer) returns results, extract and emit:

```
Bash({
  command: 'echo "{\"type\":\"gate_result\",\"trace_id\":\"$TRACE_ID\",\"ts\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"data\":{\"gate\":\"$GATE_NAME\",\"score\":$SCORE,\"decision\":\"$DECISION\",\"issues_count\":$ISSUES}}" >> .claude/telemetry/sessions/trace-$TRACE_ID.jsonl',
  description: "Log gate result"
})
```

Variables:
- `$TRACE_ID`: From pipeline start
- `$GATE_NAME`: Agent name (e.g., "expo-aesthetics-specialist")
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
  → Look for .claude/requirements/<id>/06-requirements-spec.md
  → If found, this is a SPEC-DRIVEN task (see Section 1.3)
```

**Check for `--audit` / audit mode:**
```
$ARGUMENTS contains "--audit"
  OR starts with "audit" / "review"
  → Enter Deep Audit Mode (skip normal planning/implementation flow)
```

If `--audit` is present, run the Deep Audit flow in Section 0.5 and then
return a report instead of implementing changes.

**Check for visual context (UI tasks):**
```
If task involves UI/UX (keywords: "UI", "layout", "styling", "broken", "fucked", "spacing", "visual"):
  → Check if user attached screenshot/image
  → If YES: record has_visual_reference: true
  → If NO: record has_visual_reference: false (grand-orchestrator will diagnose first)
```

Record in phase_state:
```json
{
  "visual_context": {
    "has_visual_reference": true|false,
    "user_provided_screenshot": true|false,
    "needs_diagnosis": true|false
  }
}
```

This is passed to grand-orchestrator who uses it to decide whether to run
expo-aesthetics-specialist in DIAGNOSE mode before implementation.

---

## 0.5 Deep Audit Mode (Optional)

Use this mode when you want a **deep review/audit** of the existing
Expo/React Native codebase, not implementation:

- Navigation and architecture
- API usage and state management
- Design DNA, aesthetics, accessibility
- Performance and bundle health

**IMPORTANT:** Audit mode MUST NOT modify code. It only analyzes and
reports.

When `--audit` is detected:

1. **Clarify focus**
   - Use `AskUserQuestion` to ask what to prioritize:
     - Architecture & navigation
     - Design & aesthetics
     - Accessibility
     - Performance & bundle size
     - API usage & error handling

2. **Memory & ProjectContext**
   - Run memory-first search (Workshop + unified memory) for:
     - Past Expo incidents, RA tags, and standards.
   - Call `mcp__project-context__query_context` with a diagnostic task:
     - `domain: "expo"`
     - `task`: "Deep Expo/React Native codebase audit"
     - `maxFiles`: larger than usual (e.g. 30–50)
     - `includeHistory: true`

3. **Assemble an audit squad (via Task)**
   - Based on focus, delegate to relevant agents:
     - Architecture/navigation:
       - `expo-architect-agent`
     - Design & tokens:
       - `design-dna-guardian`
       - `expo-aesthetics-specialist`
     - Accessibility:
       - `a11y-enforcer`
     - Performance:
       - `performance-enforcer`
       - `bundle-assassin`
     - API/state & testing:
       - `api-guardian`
       - `test-generator`

   - In prompts, make it explicit that:
     - They are in **audit** mode.
     - They should use `Read`/`Grep`/`Glob` (+ ProjectContext) to inspect
       code, not rely on `modified_files`.
     - They MUST NOT edit code; only analyze and report.

4. **Synthesize an Expo Audit Report**
   - Combine findings into a unified report:
     - Navigation/architecture issues
     - Design/aesthetics/a11y gaps
     - Performance & bundle risks
     - API/state/testing issues
     - Suggested follow-up tasks for targeted improvements.

5. **(Optional) Save audit history**
   - Use `mcp__project-context__save_task_history` with:
     - `domain: "expo"`
     - `task`: "audit: expo codebase"
     - `outcome`: `"diagnosed"` or `"reviewed"`
     - `learnings`: key bullets from the audit

Return this report to the user and **do not** proceed into the normal
implementation pipeline unless explicitly requested.

---

## 1. Memory-First Context

### 1.1 Memory Search (Before ProjectContext)

Before expensive ProjectContext queries, check local memory:

```bash
# Search Workshop for relevant Expo decisions/gotchas
workshop --workspace .claude/memory why "expo $TASK_KEYWORDS"

# Search code-index.db for relevant code/symbols (if available)
python3 ~/.claude/scripts/memory-search-unified.py "$TASK_KEYWORDS" --mode all --top-k 5
```

If memory hits are relevant:
- Note them for context
- May skip or reduce ProjectContext query scope

### 1.1.1 Reflexion Loading (OS 5.2)

Load relevant reflexions from past gate failures:

```bash
workshop --workspace .claude/memory search "reflexion" -t expo --limit 5 2>/dev/null || true
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

   This task appears to involve multiple screens or architectural decisions.
   Please run:
     /plan "<task description>"

   Then return with:
     /expo "implement requirement <id>"
   ```
4. **If spec found:**
   - Record `requirement_id` and `requirements_spec_path` in phase_state
   - Spec becomes authoritative source for expo-architect-agent

---

## 2. Flag Routing

### Default (no flag) - Light Path WITH Design Gates

Delegate to `expo-light-orchestrator` with Context Inheritance:

**Context Inheritance Protocol (default mode):**

```
Task({
  subagent_type: 'expo-light-orchestrator',
  description: 'Expo task with design verification',
  prompt: `
=== CONTEXT BUNDLE (INHERITED) ===
CONTEXT_SOURCE: /expo
CONTEXT_MODE: full
DO_NOT_QUERY: true

<ContextBundle JSON if queried, or "narrow query needed" if memory-first>
===

CRITICAL: You received context above. DO NOT call mcp__project-context__query_context.
Use the inherited bundle. You MAY query with narrow scope (maxFiles: 5) if context missing.

Handle this Expo/React Native task via the light path WITH design verification gates.

REQUEST: $ARGUMENTS

MEMORY CONTEXT (if any):
<memory hits from 1.1>

ROUTING MODE: default (light + gates)
- Run expo-builder-agent + specialists
- Run design verification gates (design-token-guardian, a11y-enforcer, expo-aesthetics-specialist)
- Ephemeral phase_state only (scores for this run, no ceremony)
- NO grand-architect, NO spec requirement
  `
})
```

---

### -tweak Flag - Light Path WITHOUT Gates (Pure Speed)

1. Memory-first context only (skip ProjectContext)
2. Delegate directly to `expo-builder-agent`
3. Basic verification (npm test / expo doctor)
4. NO design verification gates

**Fallback:** If memory can't locate files, MAY use narrow ProjectContext (maxFiles: 3)

**Context Inheritance Protocol (-tweak mode):**

```
Task({
  subagent_type: 'expo-builder-agent',
  description: 'Fast Expo tweak (no gates)',
  prompt: `
=== CONTEXT BUNDLE (INHERITED) ===
CONTEXT_SOURCE: /expo
CONTEXT_MODE: none
DO_NOT_QUERY: true

Memory-first mode active. No ProjectContext query performed.
Use Workshop memory and targeted file reads only.
===

Quick fix without design verification.

REQUEST: $ARGUMENTS

MEMORY CONTEXT (if any):
<memory hits from 1.1>

ROUTING MODE: tweak (pure speed)
- Make the change
- Basic verification only
- NO gates, NO design review
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
## Proposed Expo/React Native Pipeline

**Request:** [the task]
**Mode:** --complex (full pipeline)

### Phases
1. Context Query (ProjectContext)
2. Grand Orchestrator (expo-grand-orchestrator) - architecture decisions
3. Planning (expo-architect-agent) - detailed plan
4. Implementation (expo-builder-agent + specialists)
5. Gates (design-token-guardian, a11y-enforcer, performance-enforcer)
6. Power Checks (performance-prophet, security-specialist) - if needed
7. Verification (expo-verification-agent)

### Agent Team
| Role | Agent |
|------|-------|
| Coordination | expo-grand-orchestrator |
| Architecture | expo-architect-agent |
| Implementation | expo-builder-agent |
| Specialists | [list relevant ones based on 3.1.1] |
| Design Gate | design-token-guardian |
| A11y Gate | a11y-enforcer |
| Performance Gate | performance-enforcer |
| Verification | expo-verification-agent |

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
2. If user says "Yes, proceed" → continue to 3.2
3. If user says "Modify team" → ask what to change, update, re-output team, re-confirm
4. If user says "Switch to -tweak" → delegate to expo-builder-agent directly (Section 2)

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
| "remove/eliminate inline styles" | — | `design-token-guardian` |
| "remove/migrate from Redux" | — | Use context/zustand patterns |
| "audit/review" (not implement) | `expo-builder-agent` | Appropriate reviewer/enforcer agents |
| "accessibility audit" | `expo-builder-agent` | `a11y-enforcer` |
| "performance audit" | `expo-builder-agent` | `performance-enforcer`, `bundle-assassin` |
| "security audit" | `expo-builder-agent` | `security-specialist` |

**Detection keywords:**
- "remove", "eliminate", "get rid of", "migrate away from", "replace" → EXCLUDE that specialist
- "audit", "review", "analyze", "check" → Use reviewers, NOT builders

### 3.2 Context Query

Call ProjectContextServer (unless memory-first gave sufficient context):

```
mcp__project-context__query_context({
  domain: "expo",
  task: <sanitized task description>,
  projectPath: <repo root>,
  maxFiles: 15,
  includeHistory: true
})
```

**FTS5 Sanitization:** Remove special characters that cause FTS5 syntax errors:
```
sanitizedTask = task.replace(/[\\/+\-()"*]/g, ' ').trim()
```

Initialize phase_state.json:
```json
{
  "domain": "expo",
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

Delegate to `expo-grand-orchestrator` with Context Inheritance:

**Context Inheritance Protocol (OS 5.2):**

When delegating, wrap the ContextBundle with inheritance headers:

```
=== CONTEXT BUNDLE (INHERITED) ===
CONTEXT_SOURCE: /expo
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
- **Visual context** (from Section 0):
  - `has_visual_reference`: Did user provide screenshot?
  - `needs_diagnosis`: Should reviewer diagnose first?

**CRITICAL:** Grand-orchestrator will use visual context to decide flow:
- If `has_visual_reference: true` → Builder gets user's visual context directly
- If `needs_diagnosis: true` → Run `expo-aesthetics-specialist` in DIAGNOSE mode first

Outputs:
- Architecture path (navigation, state, data patterns)
- Design DNA presence check
- Risk assessment
- Task force plan

Save decision via `mcp__project-context__save_decision`.

### 3.4 Planning (expo-architect-agent)

Delegate to `expo-architect-agent`:

**If requirements_spec_path exists:**
- expo-architect-agent MUST read spec first
- Spec's constraints and acceptance criteria are authoritative
- Note any out-of-scope or ambiguous items

Outputs:
- Change type classification
- Impact analysis (screens, modules, risks)
- Detailed plan with steps
- Assigned agents

Update phase_state.planning.

### 3.5 Implementation (expo-builder-agent + specialists)

Delegate to `expo-builder-agent`:

Specialists as needed:
- Performance: `performance-prophet`
- Security: `security-specialist`
- Tokens: `design-token-guardian`

**Parallel deployment available** for independent components (see playbooks).

Update phase_state.implementation_pass1.

### 3.6 Gates (Parallel)

Run gate agents in parallel:

1. **design-token-guardian** - Design system compliance
   - Threshold: 90/100
   - Hard block if < 90

2. **a11y-enforcer** - WCAG 2.2 accessibility
   - Threshold: 0 critical violations
   - Hard block on any critical

3. **expo-aesthetics-specialist** - Visual quality
   - Threshold: 75/100 (soft gate)
   - Block if < 60 (AI slop)

4. **performance-enforcer** - Bundle/runtime budgets
   - Threshold: within budgets
   - Hard block on budget violations

Update phase_state.standards_budgets.

**If gates fail:** Allow one corrective pass (implementation_pass2) scoped to violations only.

### 3.7 Power Checks (Optional)

For high-risk work (auth, payments, offline, perf-sensitive):

1. **performance-prophet** - Predictive performance analysis
2. **security-specialist** - OWASP Mobile Top 10 audit

Update phase_state.power_checks.

### 3.8 Verification

Delegate to `expo-verification-agent`:
- Run npm test / expo doctor
- Record verification status

Update phase_state.verification.

### 3.9 Completion

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
   - "Let me write this code" → WRONG. Delegate to expo-builder-agent
   - "I'll fix this directly" → WRONG. Delegate to specialist
   - Using Edit/Write tools → WRONG. You're an orchestrator
   - Resuming without confirmation → WRONG. Must re-confirm first
   - "Based on feedback, re-confirming plan..." → CORRECT
   - "Based on feedback, delegating to expo-builder-agent..." → WRONG (skipped confirmation)

---

## 5. Standards Inputs (OS 5.2 Learning Loop)

### Gate Enforcement

`design-token-guardian`, `a11y-enforcer`, `performance-enforcer` MUST:
- Read `relatedStandards` from ContextBundle
- Treat them as **enforceable rules**, not suggestions
- Tag violations to the specific standard they break

### Learning Loop Closure

After task completion:
1. Recurring violations → `mcp__project-context__save_standard` (via /audit)
2. New standards flow into future `relatedStandards`
3. Future tasks see and enforce the new standard

```
violation → /audit → save_standard → code-index.db → future relatedStandards → gate enforcement
```

---

## 6. Notes

- Use **Customization Gate** to block when design-dna is missing for UI work
- Keep expo-grand-orchestrator in pure orchestration mode (Opus)
- All agents use Opus 4.6 (default model)
- Complex tasks MUST have specs
- Simple tasks use light path for speed
- High-risk domains (auth, payments, PII) → mandatory security-specialist
- **Visual Context Flow:** If UI task has no screenshot, diagnose before building

Begin orchestration for: **$ARGUMENTS**
