---
description: "OS 4.1 orchestrator entrypoint for Next.js frontend tasks"
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

# /nextjs - Next.js Lane Orchestrator (OS 4.1)

Use this command for Next.js / frontend UI work.

## Usage

```bash
/nextjs "update the pricing page layout"           # Default: light path + design gates
/nextjs -tweak "fix button spacing"                # Fast: light path, no gates
/nextjs --complex "multi-page feature"             # Full: grand-architect + all gates
/nextjs "implement requirement 2025-11-25-0930-dashboard"  # Full path with spec
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

## 0.1 Telemetry (OS 4.1) - MUST EXECUTE

**Reference:** `docs/reference/telemetry-standard.md`

**MANDATORY: You MUST execute these Bash commands, not just read them.**

### At Pipeline Start (EXECUTE THIS)

**Step 1:** Generate trace_id and emit pipeline_start event:

```
Bash({
  command: 'TRACE_ID="nextjs-$(date +%Y%m%dT%H%M%S)-$(LC_ALL=C tr -dc a-z0-9 </dev/urandom | head -c 4)" && mkdir -p .claude/telemetry/sessions && echo "{\"type\":\"pipeline_start\",\"trace_id\":\"$TRACE_ID\",\"ts\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"data\":{\"domain\":\"nextjs\",\"task\":\"$TASK_SUMMARY\",\"mode\":\"$MODE\"}}" >> .claude/telemetry/sessions/trace-$TRACE_ID.jsonl && echo $TRACE_ID',
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
  → If NO: record has_visual_reference: false (grand-architect will diagnose first)
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

This is passed to grand-architect who uses it to decide whether to run
design-reviewer in DIAGNOSE mode before implementation.

---

## 0.5 Deep Audit Mode (Optional)

Use this mode when you want a **deep review/audit** of the existing
Next.js codebase, not implementation:

- Structural issues
- Standards violations
- Design/UX consistency problems
- Perf/a11y/SEO risks

**IMPORTANT:** Audit mode MUST NOT modify code. It only analyzes and
reports.

When `--audit` is detected:

1. **Clarify focus**
   - Use `AskUserQuestion` to ask what to prioritize:
     - Standards & architecture
     - Design & UX
     - Performance
     - Accessibility
     - SEO

2. **Memory & ProjectContext**
   - Run memory-first search (Workshop + unified memory) for:
     - Past Next.js incidents, RA tags, and standards.
   - Call `mcp__project-context__query_context` with a diagnostic task:
     - `domain: "nextjs"`
     - `task`: "Deep Next.js codebase audit"
     - `maxFiles`: larger than usual (e.g. 30–50)
     - `includeHistory: true`

3. **Assemble an audit squad (via Task)**
   - Based on user focus, delegate to relevant agents:
     - Standards:
       - `nextjs-standards-enforcer` – scan key app/routes/components for standards violations.
     - Design & UX:
       - `nextjs-design-reviewer` – visual/layout/design DNA review.
     - Performance:
       - `nextjs-performance-specialist` – hotspots, bundle/perf issues.
     - Accessibility:
       - `nextjs-accessibility-specialist` – WCAG/a11y issues.
     - SEO:
       - `nextjs-seo-specialist` – metadata, structure, crawlability.

   - In prompts, make it explicit that:
     - They are in **audit** mode.
     - They should use `Read`/`Grep`/`Glob` (+ ProjectContext) to inspect
       code, not rely on `files_modified`.
     - They MUST NOT edit code; only analyze and report.

4. **Synthesize a Next.js Audit Report**
   - Combine agent findings into a single report:
     - Structural/standards issues
     - Design inconsistencies
     - Perf/a11y/SEO risks
     - Suggested follow-up tasks (each one can become a `/plan` + `/nextjs` implementation later).

5. **(Optional) Save audit history**
   - Use `mcp__project-context__save_task_history` with:
     - `domain: "nextjs"`
     - `task`: "audit: nextjs codebase"
     - `outcome`: `"diagnosed"` or `"reviewed"`
     - `learnings`: key bullets from the audit

Return this report to the user and **do not** proceed into the normal
implementation pipeline unless explicitly requested.

---

## 1. Memory-First Context

### 1.1 Memory Search (Before ProjectContext)

Before expensive ProjectContext queries, check local memory:

```bash
# Search Workshop for relevant Next.js decisions/gotchas
workshop --workspace .claude/memory why "nextjs $TASK_KEYWORDS"

# Search vibe.db for relevant code/symbols (if available)
python3 ~/.claude/scripts/memory-search-unified.py "$TASK_KEYWORDS" --mode all --top-k 5
```

If memory hits are relevant:
- Note them for context
- May skip or reduce ProjectContext query scope

### 1.1.1 Reflexion Loading & Constraint Injection (OS 4.1)

Load relevant reflexions from past gate failures:

```bash
workshop --workspace .claude/memory search "reflexion" -t nextjs --limit 5 2>/dev/null || true
```

Pass any reflexions found to agents in the ContextBundle under `prior_reflexions`.
This helps agents avoid repeating past mistakes.

**Constraint Injection (OS 4.1):**

For agents that generated past reflexions, synthesize constraint bullets and inject into `phase_state.plan.constraints`:

```json
{
  "plan": {
    "constraints": [
      "reflexion: Always include loading.tsx for async pages (from evt-20251201-003)",
      "reflexion: Verify 'use client' on hook-using components (from evt-20251128-007)"
    ],
    "constraint_source": "improvement-bus"
  }
}
```

When delegating to `nextjs-builder`, include these as **Active Constraints**:

```markdown
## Active Constraints (from past failures)

These constraints are derived from past failures by this agent. Apply them:

- Always include loading.tsx for async pages
- Verify 'use client' on hook-using components

Failure to apply these constraints will result in gate failure.
```

**Scoping:** Only inject constraints for the specific agent that generated them. `nextjs-builder` receives constraints from `nextjs-builder` reflexions, not from `ios-builder`.

### 1.2 Spec Gating (--complex flag only)

**If user passed `--complex` flag:**

1. Check if request references a requirement ID
2. Look for `.claude/requirements/<id>/06-requirements-spec.md`
3. **If spec NOT found:**
   ```
    BLOCKED: Complex task requires a spec.

   This task appears to involve multiple pages or architectural decisions.
   Please run:
     /plan "<task description>"

   Then return with:
     /nextjs "implement requirement <id>"
   ```
4. **If spec found:**
   - Record `requirement_id` and `requirements_spec_path` in phase_state
   - Spec becomes authoritative source for nextjs-architect

---

## 2. Flag Routing

### Default (no flag) - Light Path WITH Design Gates

Delegate to `nextjs-light-orchestrator` with Context Inheritance:

**Context Inheritance Protocol (default mode):**

```
Task({
  subagent_type: "nextjs-light-orchestrator",
  description: "Next.js task with design verification",
  prompt: `
=== CONTEXT BUNDLE (INHERITED) ===
CONTEXT_SOURCE: /nextjs
CONTEXT_MODE: full
DO_NOT_QUERY: true

<ContextBundle JSON if queried, or "narrow query needed" if memory-first>
===

CRITICAL: You received context above. DO NOT call mcp__project-context__query_context.
Use the inherited bundle. You MAY query with narrow scope (maxFiles: 5) if context missing.

Handle this Next.js task via the light path WITH design verification gates.

REQUEST: $ARGUMENTS

MEMORY CONTEXT (if any):
<memory hits from 1.1>

ROUTING MODE: default (light + gates)
- Run nextjs-builder + specialists
- Run design verification gates (standards-enforcer, design-reviewer)
- Ephemeral phase_state only (scores for this run, no ceremony)
- NO grand-architect, NO spec requirement
  `
})
```

---

### -tweak Flag - Light Path WITHOUT Gates (Pure Speed)

1. Memory-first context only (skip ProjectContext)
2. Delegate directly to `nextjs-builder`
3. Basic verification (lint/type/build)
4. NO design verification gates

**Fallback:** If memory can't locate files, MAY use narrow ProjectContext (maxFiles: 3)

**Context Inheritance Protocol (-tweak mode):**

```
Task({
  subagent_type: "nextjs-builder",
  description: "Fast Next.js tweak (no gates)",
  prompt: `
=== CONTEXT BUNDLE (INHERITED) ===
CONTEXT_SOURCE: /nextjs
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
## Proposed Next.js Pipeline

**Request:** [the task]
**Mode:** --complex (full pipeline)

### Phases
1. Context Query (ProjectContext)
2. Grand Architect (nextjs-grand-architect) - architecture decisions
3. Planning (nextjs-architect) - detailed plan
4. Analysis (nextjs-layout-analyzer) - structure mapping
5. Implementation (nextjs-builder + specialists)
6. Gates (nextjs-standards-enforcer, nextjs-design-reviewer)
7. Verification (nextjs-verification-agent)

### Agent Team
| Role | Agent |
|------|-------|
| Coordination | nextjs-grand-architect |
| Architecture | nextjs-architect |
| Layout Analysis | nextjs-layout-analyzer |
| Implementation | nextjs-builder |
| Specialists | [list relevant ones based on 3.1.1] |
| Standards Gate | nextjs-standards-enforcer |
| Design Gate | nextjs-design-reviewer |
| Verification | nextjs-verification-agent |

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
4. If user says "Switch to -tweak" → delegate to nextjs-builder directly (Section 2)

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
| "remove/eliminate/migrate from Tailwind" | `tailwind-specialist` | `nextjs-css-specialist`, `design-token-guardian` |
| "remove/eliminate inline styles" | — | `nextjs-css-specialist`, `design-token-guardian` |
| "CSS architecture/semantic CSS/@layer" | `tailwind-specialist` | `nextjs-css-specialist` |
| "audit/review" (not implement) | `nextjs-builder` | Appropriate reviewer/enforcer agents |

**Detection keywords:**
- "remove", "eliminate", "get rid of", "migrate away from", "replace" → EXCLUDE that specialist
- "audit", "review", "analyze", "check" → Use reviewers, NOT builders

#### 3.1.2 Tech Stack Detection (Tailwind/shadcn)

**Auto-detect styling stack before proposing team:**

```bash
# Detect Tailwind
TAILWIND_DETECTED=false
if [ -f "tailwind.config.js" ] || [ -f "tailwind.config.ts" ] || [ -f "tailwind.config.mjs" ]; then
  TAILWIND_DETECTED=true
fi
# Also check for Tailwind v4 CSS-first config
if grep -q "@import 'tailwindcss'" app/globals.css 2>/dev/null || \
   grep -q '@import "tailwindcss"' app/globals.css 2>/dev/null; then
  TAILWIND_DETECTED=true
fi

# Detect shadcn/ui
SHADCN_DETECTED=false
if [ -f "components.json" ] || [ -d "components/ui" ]; then
  SHADCN_DETECTED=true
fi
```

**Routing based on detection:**

| Detection | Include Specialist |
|-----------|-------------------|
| Tailwind detected | `tailwind-specialist` |
| shadcn detected | `shadcn-specialist` |
| Neither detected | `nextjs-css-specialist` (semantic CSS) |
| Both detected | `tailwind-specialist` + `shadcn-specialist` |

**Record in phase_state:**
```json
{
  "tech_stack": {
    "tailwind": true,
    "shadcn": true,
    "css_approach": "tailwind+shadcn"
  }
}
```

**Pass to agents in ContextBundle:**
```markdown
TECH STACK DETECTED:
- Tailwind: [yes/no]
- shadcn/ui: [yes/no]
- CSS Approach: [tailwind+shadcn / tailwind / shadcn / semantic-css]
```

### 3.2 Context Query

Call ProjectContextServer (unless memory-first gave sufficient context):

```
mcp__project-context__query_context({
  domain: "nextjs",
  task: <sanitized task description>,
  projectPath: <repo root>,
  maxFiles: 10-15,
  includeHistory: true
})
```

Initialize phase_state.json:
```json
{
  "domain": "nextjs",
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

Delegate to `nextjs-grand-architect` with Context Inheritance:

**Context Inheritance Protocol (OS 4.1):**

When delegating, wrap the ContextBundle with inheritance headers:

```
=== CONTEXT BUNDLE (INHERITED) ===
CONTEXT_SOURCE: /nextjs
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

**CRITICAL:** Grand-architect will use visual context to decide flow:
- If `has_visual_reference: true` → Builder gets user's visual context directly
- If `needs_diagnosis: true` → Run `nextjs-design-reviewer` in DIAGNOSE mode first

Outputs:
- Architecture path (App Router structure, RSC vs client, data patterns)
- Design DNA presence check
- Risk assessment
- Task force plan

Save decision via `mcp__project-context__save_decision`.

### 3.4 Planning (nextjs-architect)

Delegate to `nextjs-architect`:

**If requirements_spec_path exists:**
- nextjs-architect MUST read spec first
- Spec's constraints and acceptance criteria are authoritative
- Note any out-of-scope or ambiguous items

Outputs:
- Change type classification
- Impact analysis (routes, components, risks)
- Detailed plan with steps
- Assigned agents

Update phase_state.planning.

### 3.5 Analysis (nextjs-layout-analyzer)

Delegate to `nextjs-layout-analyzer`:

Outputs:
- Layout structure
- Component hierarchy
- Style sources

Update phase_state.analysis.

### 3.6 Implementation (nextjs-builder + specialists)

Delegate to `nextjs-builder`:

**Specialists as needed (per confirmed team from 3.1):**
- Tailwind CSS: `tailwind-specialist` (if Tailwind detected - see 3.1.2)
- shadcn/ui: `shadcn-specialist` (if shadcn detected - see 3.1.2)
- CSS Architecture: `nextjs-css-specialist` (semantic CSS, @layer, design tokens)
- Layout: `nextjs-layout-specialist`
- Types: `nextjs-typescript-specialist`
- Tokens: `design-token-guardian`
- Performance: `nextjs-performance-specialist`
- Accessibility: `nextjs-accessibility-specialist`
- SEO: `nextjs-seo-specialist`

** Use ONLY the specialists confirmed in Section 3.1.**
Do not add specialists that weren't in the confirmed team.

Update phase_state.implementation_pass1.

### 3.7 Gates

Run gate agents:

1. **nextjs-standards-enforcer** - Code standards, token usage
   - Threshold: 90/100
   - Hard block if < 90

2. **nextjs-design-reviewer** - Visual QA, design DNA
   - Threshold: 90/100
   - Hard block if < 90
    - MUST produce a structured design review report under
      `.claude/orchestration/evidence/design-review-*.md` and record its path
      in `phase_state.gates.design_qa.evidence_paths`. The gate enforcement
      hook will block any attempt to set `gate_decision: "PASS"` without valid
      evidence paths pointing to structurally valid reports (coverage
      declaration, measurements, pixel comparison, verification result).

Update phase_state.gates.

**If gates fail:** Allow one corrective pass (implementation_pass2) scoped to violations only.

### 3.8 Verification

Delegate to `nextjs-verification-agent`:
- Run lint/typecheck/build
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
   - "Let me write this code" → WRONG. Delegate to nextjs-builder
   - "I'll fix this directly" → WRONG. Delegate to specialist
   - Using Edit/Write tools → WRONG. You're an orchestrator
   - Resuming without confirmation → WRONG. Must re-confirm first
   - "Based on feedback, re-confirming plan..." → CORRECT
   - "Based on feedback, delegating to nextjs-builder..." → WRONG (skipped confirmation)

---

## 5. Notes

- Use **Customization Gate** to block when design-dna is missing for UI work
- Keep nextjs-grand-architect in pure orchestration mode
- All agents use Opus 4.5 (default model)
- Complex tasks MUST have specs
- Simple tasks use light path for speed
- **Visual Context Flow:** If UI task has no screenshot, diagnose before building
