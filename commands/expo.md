---
description: "OS 7.1 Expo/React Native Orchestrator – coordinates the Expo lane pipeline, never writes code"
argument-hint: "[--light | --tweak | --complex | --audit] <task description or requirement ID>"
allowed-tools:
  - Agent
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
2. Determine routing (--tweak, default, --complex)
3. **Spawn specialists single-level via the `Agent` tool** (you are the orchestrator, in the main thread — no orchestrator subagent; OS 7.1)

Even `--tweak` delegates to a builder. It skips gates, not agents.

**If you are about to Edit/Write, STOP. Delegate instead.**

---

# /expo - Expo Lane Orchestrator (OS 7.1)

Use this command for Expo/React Native mobile work.

## Usage

```bash
/expo "add pull-to-refresh to product list"        # Default: light path + design gates
/expo --tweak "fix button spacing"                  # Fast: light path, no gates
/expo --complex "multi-screen auth flow"           # Full: architect + builder + all gates
/expo "implement requirement 2025-11-25-auth"      # Full path with spec
```

##  CRITICAL ROLE BOUNDARY 

**YOU ARE AN ORCHESTRATOR. YOU NEVER WRITE CODE.**

- **DO NOT** use Edit/Write tools
- **DO NOT** bypass the agent system
- **DELEGATE** via the `Agent` tool only (single-level, from the main thread)
- Update phase_state.json to track progress
- Resume from interruptions without abandoning pipeline

---

## 0. Parse Arguments & Detect Mode

**Check for flags:**
```
$ARGUMENTS contains "--light" → Section 2.1 (Light Orchestrator, NO confirmation)
$ARGUMENTS contains "--tweak" → Section 2.2 (Builder Direct, NO confirmation)
$ARGUMENTS contains "--complex" → Section 3 (Full Pipeline with confirmation)
No flag → Section 3 (Light Orchestrator WITH confirmation)
```

---

## 0.1 Recording Context (OS 7.1)

> Session activity is captured automatically by **orca-record** hooks. Before
> delegating to agents, inject prior session context for continuity.

### Recording Context Injection (OPTIONAL)

**Check for inherited context first:**
If invoked via `/orca`, check if `RECORDING_CONTEXT` was already provided in
the delegation prompt. If present, use it directly and skip the query below.

**If no inherited context AND `.orca/recording.db` exists:**

1. Query for relevant prior sessions:
   ```
   mcp__cognition-mcp__cognition({
     operation: "recording_query",
     content: {
       files: [<files related to current task>],
       limit: 3,
       state: "ENDED"
     }
   })
   ```

2. If sessions found, get narrative for most relevant:
   ```
   mcp__cognition-mcp__cognition({
     operation: "recording_explain",
     content: {
       session_id: "<most relevant session id>"
     }
   })
   ```

3. Include in delegation prompts to the agents you spawn:
   ```
   === RECORDING CONTEXT ===
   <narrative.summary, max 500 chars>
   ===
   ```

**If `.orca/recording.db` does not exist:** skip this section silently.

---

**Check for requirement ID:**
```
$ARGUMENTS matches "requirement <id>" or "<YYYY-MM-DD-HHMM-*>"
  → Look for .orca/requirements/<id>/06-requirements-spec.md
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
  → If NO: record has_visual_reference: false (the command will diagnose first)
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

This is used by the command (Section 3.3) to decide whether to run
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

3. **Assemble an audit squad (via Agent, single-level)**
   - Based on focus, delegate to relevant agents:
     - Architecture/navigation:
       - `expo-architect-agent`
     - Design & tokens:
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


## 0.6 Design-First Check (UI Tasks)

### Manifesto Priming (ALL tiers)
Inject this context block into ALL delegation prompts (tweak, default, complex):

```
=== DESIGN AWARENESS ===
When working with CSS/styling, be aware of these verified failure patterns:
1. I autocomplete utility classes from training data rather than designing.
2. With utilities, every session produces different combinations for the same element.
3. Semantic CSS constrains my output to design coherence; utilities make me an unsupervised designer.
4. 'Change all labels' is one CSS edit with semantic classes, a codebase-wide hunt with utilities.
5. The stylesheet IS the design document. Utilities scatter design across every JSX file.
Recommendation: For agentic coding, semantic CSS produces better output. The stylesheet constrains all downstream work.
===
```

### Design-DNA Gate (default and complex modes only)

**Tweak mode**: Skip gate. Manifesto priming above is sufficient.

> **OS 7.1 / design-fork note:** `design-system-architect` and `design-dna.json` are archived. Design intent now lives in the per-project design contract (`{project}/.claude/PRODUCT.md` + `DESIGN.md`) and the `/impeccable` command + the `impeccable-hub` skill (the register; `interfaces-that-feel` is the felt-state spine the hub points to). There is no design-system-architect subagent to spawn.

**Default mode (UI tasks):**
1. Check for a project design contract: `test -f {project}/.claude/PRODUCT.md` and `test -f {project}/.claude/DESIGN.md` (the two-file split; the single-file `aesthetic.md` is deprecated).
2. If EITHER EXISTS: note `has_design_contract: true`, record the paths, and pass them to `expo-builder-agent` as `PRODUCT_CONTRACT_PATH` (`.claude/PRODUCT.md`) and `DESIGN_CONTRACT_PATH` (`.claude/DESIGN.md`).
3. If BOTH MISSING: note `has_design_contract: false`; the aesthetics gate (`expo-aesthetics-specialist`) applies the `interfaces-that-feel` baseline. Optionally suggest the user run `/impeccable --teach` (writes PRODUCT.md) then `/document` (writes DESIGN.md) to set up a contract.

**Complex mode (UI tasks):** same, plus require the `expo-aesthetics-specialist` gate to run regardless of contract presence.

### Design Weight Escalation

When a requirements spec is detected (via requirement ID in arguments):
1. Read `metadata.json` from the requirements folder
2. Check `design_weight` field:
   - `high`: Escalate gate behavior -- default mode uses complex-mode gate (always run the `expo-aesthetics-specialist` gate, block until confirmed)
   - `medium`: Keep current tier's gate behavior
   - `low`: Keep current tier's gate behavior

This ensures design-heavy tasks get mandatory aesthetics-gate review even in default mode.


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

### 1.1.1 Reflexion Loading (OS 7.1)

Load relevant reflexions from past gate failures:

```bash
workshop --workspace .claude/memory search "reflexion" -t expo --limit 5 2>/dev/null || true
```

Pass any reflexions found to agents in the ContextBundle under `prior_reflexions`.
This helps agents avoid repeating past mistakes.

### 1.2 Spec Gating (--complex flag only)

**If user passed `--complex` flag:**

1. Check if request references a requirement ID
2. Look for `.orca/requirements/<id>/06-requirements-spec.md`
3. **If spec NOT found:**
   ```
    BLOCKED: Complex task requires a spec.

   This task appears to involve multiple screens or architectural decisions.
   Please run:
     /requirements "<task description>"

   Then return with:
     /expo "implement requirement <id>"
   ```
4. **If spec found:**
   - Record `requirement_id` and `requirements_spec_path` in phase_state
   - Spec becomes authoritative source for expo-architect-agent

---

## 2. Light Path Flow (--light and --tweak modes ONLY)

This section applies ONLY when user passes `--light` or `--tweak` flags.
Default (no flag) now goes to Section 3 for confirmation first.

### 2.1 --light Flag - Light Path WITHOUT Confirmation

Run the light path **yourself, in the main thread** (no orchestrator subagent — OS 7.1). Skip Section 3. Spawn specialists single-level via `Agent()`, one at a time, reading each result before the next. See `docs/reference/flatten-orchestration-pattern.md`.

**Flat phase script (--light):**

1. **Build** — `Agent({ subagent_type: "expo-builder-agent", description: "Expo task (light)", prompt: <REQUEST + inherited ContextBundle + memory hits + STANDARDS from prior gate failures + DESIGN AWARENESS block> })`. Tell the builder: context is inherited, do NOT call `query_context` (may narrow-query maxFiles:5 if missing).
2. **Design/standards gate** — `Agent({ subagent_type: "expo-standards-enforcer", ... })`; read its `standards_score` and write the canonical dev-lane score contract (`docs/reference/gate-contract.md`) to phase_state: `gates.standards = { "score": <standards_score>, "threshold": 90, "gate_decision": "PASS" (score ≥ 90) | "BLOCK", "lane": "expo" }`. The "hard block < 90" is now mechanical — `hooks/gate-enforcement.sh` exit-2s any `gates.standards` PASS whose score is absent, non-numeric, or below the threshold.
3. **A11y gate** — `Agent({ subagent_type: "a11y-enforcer", ... })`; read its verdict (hard block on any critical violation).
4. **Performance gate** — `Agent({ subagent_type: "performance-enforcer", ... })`; read its verdict (hard block on budget violations).
5. **Aesthetics gate** — `Agent({ subagent_type: "expo-aesthetics-specialist", ... })`; read its verdict (soft gate ≥ 75, block < 60 AI-slop).
6. **Verification** — `Agent({ subagent_type: "expo-verification-agent", ... })`; run npm test / expo doctor, record status.
7. If a gate ERRORs/BLOCKs, route the violations back to `expo-builder-agent` once, then re-gate; increment `gates.standards.attempts` on the respawn (mirrors the design-lane `attempts` convention, `docs/reference/design-lane.md`).
8. Ephemeral phase_state only (scores for this run; no spec ceremony). Persist the `gates.standards` contract above to `.orca/orchestration/phase_state.json`; a final PASS is written only once `score ≥ 90`.

(The old `expo-light-orchestrator` delegation is dissolved — the command owns this sequence.)

---

### 2.2 --tweak Flag - Builder Direct (Pure Speed)

1. Memory-first context only (skip ProjectContext)
2. Delegate directly to `expo-builder-agent`
3. Basic verification (npm test / expo doctor)
4. NO design verification gates

**Fallback:** If memory can't locate files, MAY use narrow ProjectContext (maxFiles: 3)

**Context Inheritance Protocol (--tweak mode):**

```
Agent({
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


=== DESIGN AWARENESS ===
When working with CSS/styling, be aware of these verified failure patterns:
1. I autocomplete utility classes from training data rather than designing.
2. With utilities, every session produces different combinations for the same element.
3. Semantic CSS constrains my output to design coherence; utilities make me an unsupervised designer.
4. 'Change all labels' is one CSS edit with semantic classes, a codebase-wide hunt with utilities.
5. The stylesheet IS the design document. Utilities scatter design across every JSX file.
Recommendation: For agentic coding, semantic CSS produces better output. The stylesheet constrains all downstream work.
===

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

### --complex Flag - Full Pipeline (Architect + Builder + All Gates)

Continue with full orchestration below (Section 3).

---

## 3. Pipeline Flow with Confirmation (Default and --complex modes)

This section applies when:
- **Default (no flag)**: runs the light flow (Section 2.1) AFTER confirmation
- **--complex flag**: runs the full pipeline (Section 3.2+) AFTER confirmation

### 3.1 Team Confirmation (MANDATORY - BLOCKING)

**DO NOT PROCEED TO SECTION 3.2 WITHOUT USER CONFIRMATION**

**This is a TWO-STEP process. You MUST do both steps.**

#### Step A: OUTPUT the team (VISIBLE MARKDOWN - NOT inside AskUserQuestion)

**FIRST, output this as regular markdown so the user can see it.**

**For DEFAULT mode (no flag):**

```markdown
## Proposed Expo/React Native Pipeline

**Request:** [the task]
**Mode:** default (light path with confirmation)

### Phases
1. Context Query (ProjectContext)
2. Coordination — /expo command (main thread)
3. Implementation (expo-builder-agent + specialists)
4. Gates (expo-standards-enforcer, a11y-enforcer, performance-enforcer, expo-aesthetics-specialist)

### Agent Team
| Role | Agent |
|------|-------|
| Coordination | /expo command (main thread) |
| Implementation | expo-builder-agent |
| Specialists | [list relevant ones based on 3.1.1] |
| Standards Gate | expo-standards-enforcer |
| A11y Gate | a11y-enforcer |
| Performance Gate | performance-enforcer |
| Aesthetics Gate | expo-aesthetics-specialist |

### Files Likely Affected
- [list from ContextBundle or memory]

### Risks/Notes
- [any identified risks]
```

**For --complex mode:**

```markdown
## Proposed Expo/React Native Pipeline

**Request:** [the task]
**Mode:** --complex (full pipeline)

### Phases
1. Context Query (ProjectContext)
2. Coordination — /expo command (main thread)
3. Planning + architecture decisions (expo-architect-agent)
4. Implementation (expo-builder-agent + specialists)
5. Gates (expo-standards-enforcer, a11y-enforcer, performance-enforcer)
6. Power Checks (performance-prophet, security-specialist) - if needed
7. Verification (expo-verification-agent)

### Agent Team
| Role | Agent |
|------|-------|
| Coordination | /expo command (main thread) |
| Architecture + Planning | expo-architect-agent |
| Implementation | expo-builder-agent |
| Specialists | [list relevant ones based on 3.1.1] |
| Standards Gate | expo-standards-enforcer |
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
      { label: "Switch to --light", description: "Skip confirmation next time (use --light flag)" }
    ]
  }]
})
```

**After presenting the confirmation question:**
1. STOP and wait for user response
2. If user says "Yes, proceed" → Route based on mode (see below)
3. If user says "Modify team" → ask what to change, update, re-output team, re-confirm
4. If user says "Switch to --light" → run the light flow yourself (Section 2.1)

**After confirmation received - ROUTING (you run these in the main thread; no orchestrator subagent):**
- If `--complex` flag → run the full pipeline (Section 3.2+): architect → builder → all gates → verification, each spawned single-level via `Agent()`
- If default (no flag) → run the light flow (Section 2.1): builder + design/a11y/perf/aesthetics gates

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

### 3.3 Coordination (main thread — OS 7.1)

> The `expo-grand-orchestrator` coordinator tier is dissolved. **You** (the command, in the main thread) own coordination: you sequence the phases below and spawn each specialist single-level via `Agent()`. Architecture decisions are produced by `expo-architect-agent` in 3.4 (it is the planner). See `docs/reference/flatten-orchestration-pattern.md`.

Decide flow from **visual context** (from Section 0) before planning:
- If `has_visual_reference: true` → pass the user's visual context straight to `expo-builder-agent` in 3.5.
- If `needs_diagnosis: true` → spawn `expo-aesthetics-specialist` in DIAGNOSE mode first, feed its findings into 3.4.

Context to pass into every `Agent()` call this run (inherited — instruct each agent NOT to call `query_context`; targeted file reads OK):
- ContextBundle from Section 3.2, memory summary, requirements spec (if any), STANDARDS from prior gate failures, and the DESIGN AWARENESS block.

```
=== DESIGN AWARENESS ===
When working with CSS/styling, be aware of these verified failure patterns:
1. I autocomplete utility classes from training data rather than designing.
2. With utilities, every session produces different combinations for the same element.
3. Semantic CSS constrains my output to design coherence; utilities make me an unsupervised designer.
4. 'Change all labels' is one CSS edit with semantic classes, a codebase-wide hunt with utilities.
5. The stylesheet IS the design document. Utilities scatter design across every JSX file.
Recommendation: For agentic coding, semantic CSS produces better output. The stylesheet constrains all downstream work.
===
```

Architecture/data decisions (navigation, state, data patterns; risk assessment) are the output of 3.4, recorded via `mcp__project-context__save_decision`.

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
   cat .orca/orchestration/phase_state.json
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

## 5. Standards Inputs (OS 7.1 Learning Loop)

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
- Coordination runs in the main thread (the /expo command); there is no orchestrator subagent (OS 7.1)
- All agents use Opus 4.6 (default model)
- Complex tasks MUST have specs
- Simple tasks use light path for speed
- High-risk domains (auth, payments, PII) → mandatory security-specialist
- **Visual Context Flow:** If UI task has no screenshot, diagnose before building

Begin orchestration for: **$ARGUMENTS**
