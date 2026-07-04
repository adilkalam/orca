---
description: "OS 7.1 orchestrator entrypoint for Next.js frontend tasks"
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

# /nextjs - Next.js Lane Orchestrator (OS 7.1)

Use this command for Next.js / React frontend UI work (App Router, RSC, TypeScript, semantic CSS).

**Flat pattern:** this command runs in the main thread and IS the orchestrator. It spawns
the **8 real nextjs agents** single-level via `Agent()`: `nextjs-architect` (planning /
analysis), `nextjs-builder` (implementation — owns CSS / layout / tokens),
`nextjs-standards-enforcer` (standards gate), `nextjs-verification-agent` (verification),
and the specialists `nextjs-typescript-specialist`, `nextjs-performance-specialist`,
`nextjs-accessibility-specialist`, `nextjs-seo-specialist`. Design adjudication for
UI-affecting tasks is the **shared web design lane floor** (`design-validator` + the
`designcheck` detector, `docs/reference/design-lane.md`) — there are no CSS / layout /
design-review specialist agents; that work is owned by the builder + the design floor.
See `docs/pipelines/nextjs-pipeline.md` and `docs/reference/phase-configs/nextjs-phase-config.yaml`.

## Usage

```bash
/nextjs "update the pricing page layout"           # Default: light path + gates
/nextjs --tweak "fix button spacing"                # Fast: light path, no gates
/nextjs --complex "multi-page feature"             # Full: architect + builder + all gates
/nextjs "implement requirement 2025-11-25-0930-dashboard"  # Full path with spec
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
$ARGUMENTS contains "--light" -> Section 2.1 (Light Path, NO confirmation)
$ARGUMENTS contains "--tweak" -> Section 2.2 (Builder Direct, NO confirmation)
$ARGUMENTS contains "--complex" -> Section 3 (Full Pipeline with confirmation)
No flag -> Section 3 (Light Path WITH confirmation)
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

3. Include in the delegation prompt to the builder/architect:
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
  -> Look for .orca/requirements/<id>/06-requirements-spec.md
  -> If found, this is a SPEC-DRIVEN task (see Section 1.2)
```

**Check for `--audit` / audit mode:**
```
$ARGUMENTS contains "--audit"
  OR starts with "audit" / "review"
  -> Enter Deep Audit Mode (skip normal planning/implementation flow)
```

If `--audit` is present, run the Deep Audit flow in Section 0.5 and then
return a report instead of implementing changes.

**Check for visual context (UI tasks):**
```
If task involves UI/UX (keywords: "UI", "layout", "styling", "broken", "spacing", "visual"):
  -> Check if user attached screenshot/image
  -> If YES: record has_visual_reference: true
  -> If NO: record has_visual_reference: false (the command runs a structure-mapping diagnose pass first)
```

Record in phase_state:
```json
{
  "visual_context": {
    "has_visual_reference": true,
    "user_provided_screenshot": true,
    "needs_diagnosis": false
  }
}
```

The command (main thread) uses this to decide whether to run a diagnose pass
before implementation. There is no design-reviewer agent: when a broken UI has
**no screenshot**, either spawn `nextjs-architect` to map structure / layout, or
route the aesthetic diagnosis to `/impeccable --audit` (see Section 3.5).

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
     - `maxFiles`: larger than usual (e.g. 30-50)
     - `includeHistory: true`

3. **Assemble an audit squad (via Agent, single-level)**
   - Based on user focus, delegate to relevant agents:
     - Standards & architecture:
       - `nextjs-standards-enforcer` - scan key app/routes/components for standards violations.
     - Design & UX:
       - `design-validator` (audit/read mode) - run the detector + judge against the register, OR route to `/impeccable --audit` for a full aesthetic review.
     - Performance:
       - `nextjs-performance-specialist` - hotspots, bundle/perf issues.
     - Accessibility:
       - `nextjs-accessibility-specialist` - WCAG/a11y issues.
     - SEO:
       - `nextjs-seo-specialist` - metadata, structure, crawlability.

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
     - Suggested follow-up tasks (each one can become a `/requirements` + `/nextjs` implementation later).

5. **(Optional) Save audit history**
   - Use `mcp__project-context__save_task_history` with:
     - `domain: "nextjs"`
     - `task`: "audit: nextjs codebase"
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

### Design Contract (passed to the builder)

> **OS 7.1 / design-fork note:** the old design-first Phase 0 gate and its `design-dna.json`
> artifact are retired. Design intent now lives in the per-project design contract
> (`{project}/.claude/PRODUCT.md` + `DESIGN.md`) and the `/impeccable` command + the
> `impeccable-hub` skill (the register; `interfaces-that-feel` is the felt-state spine the
> hub points to). There is no design-first architect subagent to spawn.

1. Check for a project design contract: `test -f {project}/.claude/PRODUCT.md` and `test -f {project}/.claude/DESIGN.md` (the two-file split; the single-file `aesthetic.md` is retired).
2. If EITHER EXISTS: note `has_design_contract: true`, record the paths, and pass them to `nextjs-builder` as `PRODUCT_CONTRACT_PATH` (`.claude/PRODUCT.md`) and `DESIGN_CONTRACT_PATH` (`.claude/DESIGN.md`).
3. If BOTH MISSING: note `has_design_contract: false`; the design floor (Section 0.6.1) applies the `interfaces-that-feel` baseline. Optionally suggest the user run `/impeccable --teach` (writes PRODUCT.md) then `/document` (writes DESIGN.md) to set up a contract.

### 0.6.1 The Design Lane Floor (UI-affecting tasks) — FR-5.2

This is the **shared web design lane floor** (`docs/reference/design-lane.md`), run as a
LIGHT per-task gate. It replaces the old design-review step (that reviewer agent is gone).
Run it whenever the task is **UI-affecting** and gates are active (default / --light /
--complex). It is referenced by the light path (Section 2.1) and the complex gates
(Section 3.7).

**UI-affecting definition.** The task is UI-affecting when it touches:
- `*.css` / `*.scss` / `*.sass` / `*.less` / `*.module.css`, OR
- `*.tsx` / `*.jsx` containing `className=`, `style=`, or a CSS import, OR
- files under `app/`, `components/`, or `pages/`.

Pure server-action / route-handler / config changes are **NOT** UI-affecting -> **skip the
design gate** (the standards gate and verification still run).

**Step 1 — LIGHTWEIGHT BIND (no cognition checkpoint).** Hand-build a small
`BOUND_CONSTRAINTS` JSON in the main thread (do NOT call a cognition tool). Populate:
- **FORBIDDEN** ids drawn from the web detector rule ids the task can trip — pick the ones
  relevant to the change from: `tailwind-palette-utilities`, `tailwind-hex-values`,
  `reflex-fonts`, `geist-imports`, `purple-pink-gradients`, `gradient-text`,
  `side-stripe-borders`, `inset-highlight-shadow`, `default-ease-transition`,
  `bouncy-easing`.
- **At least one FORWARD** felt-state obligation derived from the task + the design
  contract / `interfaces-that-feel` baseline.

Assign ids `N1, N2, ...` and serialize to `.orca/orchestration/temp/nextjs-bound-constraints.json`:
```json
{
  "bound_constraints": [
    { "id": "N1", "type": "FORBIDDEN", "statement": "no raw Tailwind palette utilities", "detector_rule": "tailwind-palette-utilities", "severity": "P0" },
    { "id": "N2", "type": "FORWARD", "statement": "the pricing cards must feel calm and legible (clear hierarchy, restrained motion)", "detector_rule": null, "severity": "P1" }
  ]
}
```
**MUST include >=1 FORBIDDEN AND >=1 FORWARD.** An empty bind makes the validator return
`GATE_VERDICT: BLOCK` with `UNSATISFIED_CONSTRAINTS: ["NO-BOUND-CONSTRAINTS"]` — never a
silent pass.

**Step 2 — VALIDATE (fresh context).** Spawn a fresh-context `Agent(design-validator)`
with ONLY: the builder's changed-file `ARTIFACT_PATHS` (non-empty), the `BOUND_CONSTRAINTS`
JSON, and the hub (prompt-injected). **Never pass the builder's reasoning.** Instruct the
validator to `export DESIGN_OVERRIDES_PATH={project}/.design-overrides.json` before the
detector run so file-based owner overrides suppress correctly regardless of cwd. Parse the
machine verdict — `GATE_VERDICT: PASS|BLOCK` is the ONLY field you branch on.

**Step 3 — BRANCH.**
- **PASS** -> write the design-lane gate so the live hook re-runs the detector as a hard floor:
  ```json
  { "gates": { "design_lane": {
      "gate_decision": "PASS",
      "artifact_paths": ["<non-empty builder-changed paths>"],
      "validator_score": 95,
      "bound_constraint_ids": ["N1", "N2"],
      "attempts": 0,
      "active_overrides": []
  } } }
  ```
  `artifact_paths` MUST be non-empty. `hooks/gate-enforcement.sh` re-runs `designcheck`
  on `artifact_paths` and exit-2 blocks a PASS if it finds a named P0 the validator missed.
- **BLOCK** -> run ONE corrective `nextjs-builder` pass feeding it the validator's
  `UNSATISFIED_CONSTRAINTS` + `FINDINGS`, then re-validate. **MAX N = 2** builder retries;
  increment `gates.design_lane.attempts` on each respawn. After the 2nd failed retry,
  ESCALATE to the user with the unresolved findings named, and set
  `gates.design_lane.escalated: true` (the hook blocks a PASS past N=2 without it).

### Design Weight Escalation

When a requirements spec is detected (via requirement ID in arguments):
1. Read `metadata.json` from the requirements folder
2. Check `design_weight` field:
   - `high`: Escalate gate behavior — default mode runs the design floor (Section 0.6.1) regardless of contract presence
   - `medium`: Keep current tier's gate behavior
   - `low`: Keep current tier's gate behavior

This ensures design-heavy tasks get a mandatory design floor even in default mode.


---

## 1. Memory-First Context

### 1.1 Memory Search (Before ProjectContext)

Before expensive ProjectContext queries, check local memory:

```bash
# Search Workshop for relevant Next.js decisions/gotchas
workshop --workspace .claude/memory why "nextjs $TASK_KEYWORDS"

# Search code-index.db for relevant code/symbols (if available)
python3 ~/.claude/scripts/memory-search-unified.py "$TASK_KEYWORDS" --mode all --top-k 5
```

If memory hits are relevant:
- Note them for context
- May skip or reduce ProjectContext query scope

### 1.1.1 Reflexion Loading & Constraint Injection (OS 7.1)

Load relevant reflexions from past gate failures:

```bash
workshop --workspace .claude/memory search "reflexion" -t nextjs --limit 5 2>/dev/null || true
```

Pass any reflexions found to agents in the ContextBundle under `prior_reflexions`.
This helps agents avoid repeating past mistakes.

**Constraint Injection (OS 7.1):**

For agents that generated past reflexions, synthesize constraint bullets and inject into `phase_state.plan.constraints`:

```json
{
  "plan": {
    "constraints": [
      "reflexion: Always include loading.tsx for async pages (from evt-20251201-003)",
      "reflexion: Verify 'use client' on hook-using components (from evt-20251128-007)"
    ]
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
2. Look for `.orca/requirements/<id>/06-requirements-spec.md`
3. **If spec NOT found:**
   ```
    BLOCKED: Complex task requires a spec.

   This task appears to involve multiple pages or architectural decisions.
   Please run:
     /requirements "<task description>"

   Then return with:
     /nextjs "implement requirement <id>"
   ```
4. **If spec found:**
   - Record `requirement_id` and `requirements_spec_path` in phase_state
   - Spec becomes authoritative source for nextjs-architect

---

## 2. Light Path Flow (--light and --tweak modes ONLY)

This section applies ONLY when user passes `--light` or `--tweak` flags.
Default (no flag) now goes to Section 3 for confirmation first.

### 2.1 --light Flag - Light Path WITHOUT Confirmation

Run the light path **yourself, in the main thread** (no orchestrator subagent — OS 7.1). Skip Section 3. Spawn specialists single-level via `Agent()`, one at a time, reading each result before the next. See `docs/reference/flatten-orchestration-pattern.md`.

**Flat phase script (--light):**

1. **Build** — `Agent({ subagent_type: "nextjs-builder", description: "Next.js task (light)", prompt: <REQUEST + inherited ContextBundle + memory hits + manifesto priming + tech-stack detection (css_approach) + STANDARDS from prior gate failures> })`. Tell the builder: context is inherited, do NOT call `query_context` (may narrow-query maxFiles:5 if missing).
2. **Standards gate** — `Agent({ subagent_type: "nextjs-standards-enforcer", ... })`; read its `standards_score` and write the canonical dev-lane score contract (`docs/reference/gate-contract.md`) to phase_state:
   `gates.standards = { "score": <standards_score>, "threshold": 90, "gate_decision": "PASS"|"BLOCK", "lane": "nextjs" }`.
   **BINARY mapping (the live-hook safety hinge):** the enforcer emits a *graduated* decision (PASS / WARN / ERROR / BLOCK). Write `gate_decision: "PASS"` ONLY when the enforcer decision is `PASS` **AND** `score >= 90`; otherwise write `"BLOCK"`. ALWAYS write `score` as a NUMBER. A PASS written with WARN/ERROR text or a missing/non-numeric score is exit-2 blocked by `hooks/gate-enforcement.sh` (`docs/reference/gate-contract.md`).
3. **Design gate (UI-affecting only)** — if the change is UI-affecting (Section 0.6.1 definition), run the Design Lane Floor (Section 0.6.1): lightweight bind -> `Agent(design-validator)` -> branch, writing `gates.design_lane`. Skip for pure server/route/config changes.
4. If a gate ERRORs/BLOCKs, route the violations back to `nextjs-builder` once, then re-gate; increment `gates.standards.attempts` (standards) or `gates.design_lane.attempts` (design) on the respawn (mirrors the design-lane `attempts` convention, `docs/reference/design-lane.md`). MAX N=2 on the design lane, then escalate.
5. Ephemeral phase_state only (scores for this run; no spec ceremony). Persist the `gates.standards` contract above (and `gates.design_lane` when UI-affecting) to `.orca/orchestration/phase_state.json`; a final PASS is written only once `score >= 90` and the design floor (if run) is PASS.

(The old light-orchestrator delegation tier is dissolved — the command owns this sequence.)

Inject the `=== DESIGN AWARENESS ===` block (the Manifesto Priming text from Section 0.6) into the builder prompt for the light path.

---

### 2.2 --tweak Flag - Builder Direct (Pure Speed)

1. Memory-first context only (skip ProjectContext)
2. Delegate directly to `nextjs-builder`
3. NO verification (no lint, no build, no tests)
4. NO design verification gates

**Fallback:** If memory can't locate files, MAY use narrow ProjectContext (maxFiles: 3)

**Context Inheritance Protocol (--tweak mode):**

```
Agent({
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

ROUTING MODE: tweak (fast but thoughtful)
- COMPLETE the change (not just make it)
- NO verification (no lint, no build, no tests)
- NO gates, NO design review
- YES reasoning about implications:
  - Position change? Adjust spacing (top<->bottom), flip directional indicators
  - Order change? Check borders, visual hierarchy
  - Style change? Check sibling consistency
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
## Proposed Next.js Pipeline

**Request:** [the task]
**Mode:** default (light path with confirmation)

### Phases
1. Context Query (ProjectContext)
2. Coordination — /nextjs command (main thread)
3. Implementation (nextjs-builder + specialists)
4. Gates (nextjs-standards-enforcer, design floor for UI-affecting tasks)

### Agent Team
| Role | Agent |
|------|-------|
| Coordination | /nextjs command (main thread) |
| Implementation | nextjs-builder |
| Specialists | [list relevant ones based on 3.1.1] |
| Standards Gate | nextjs-standards-enforcer |
| Design Gate | design-validator (web design floor) |

### Files Likely Affected
- [list from ContextBundle or memory]

### Risks/Notes
- [any identified risks]
```

**For --complex mode:**

```markdown
## Proposed Next.js Pipeline

**Request:** [the task]
**Mode:** --complex (full pipeline)

### Phases
1. Context Query (ProjectContext)
2. Coordination — /nextjs command (main thread)
3. Planning + architecture decisions (nextjs-architect)
4. Implementation (nextjs-builder + specialists)
5. Gates (nextjs-standards-enforcer, design floor for UI-affecting tasks)
6. Verification (nextjs-verification-agent)

### Agent Team
| Role | Agent |
|------|-------|
| Coordination | /nextjs command (main thread) |
| Architecture + Planning | nextjs-architect |
| Implementation | nextjs-builder |
| Specialists | [list relevant ones based on 3.1.1] |
| Standards Gate | nextjs-standards-enforcer |
| Design Gate | design-validator (web design floor) |
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
      { label: "Switch to --light", description: "Skip confirmation next time (use --light flag)" }
    ]
  }]
})
```

**After presenting the confirmation question:**
1. STOP and wait for user response
2. If user says "Yes, proceed" -> Route based on mode (see below)
3. If user says "Modify team" -> ask what to change, update, re-output team, re-confirm
4. If user says "Switch to --light" -> run the light flow yourself (Section 2.1)

**After confirmation received - ROUTING (you run these in the main thread; no orchestrator subagent):**
- If `--complex` flag -> run the full pipeline (Section 3.2+): architect -> builder -> all gates, each spawned single-level via `Agent()`
- If default (no flag) -> run the light flow (Section 2.1): builder + standards gate + design floor

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
| "audit/review" (not implement) | `nextjs-builder` | Appropriate reviewer/enforcer agents + `design-validator` |
| "performance audit" | `nextjs-builder` | `nextjs-performance-specialist` |
| "accessibility audit" | `nextjs-builder` | `nextjs-accessibility-specialist` |
| "SEO audit" | `nextjs-builder` | `nextjs-seo-specialist` |

**Detection keywords:**
- "audit", "review", "analyze", "check" -> Use reviewers/enforcers, NOT builders

> **CSS / layout / tokens are NOT specialist agents.** They are owned by `nextjs-builder`,
> which auto-adapts to the detected `css_approach` (3.1.2), plus the design floor
> (Section 0.6.1). Do not propose CSS / layout / design-review specialists — none exist.

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

**Record `css_approach` in phase_state (there are NO CSS specialist agents — the builder adapts):**

```json
{
  "tech_stack": {
    "tailwind": true,
    "shadcn": true,
    "css_approach": "tailwind+shadcn"
  }
}
```

Map the two booleans to `css_approach`: `tailwind+shadcn` / `tailwind` / `shadcn` /
`semantic-css` (neither detected). Then **pass `css_approach` to `nextjs-builder` in the
ContextBundle** — the builder owns CSS / layout / tokens and auto-adapts its output to the
detected approach. The design floor (Section 0.6.1) enforces named-slop discipline
regardless of approach.

**Pass to the builder in the ContextBundle:**
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

### 3.3 Coordination (main thread — OS 7.1)

> The `nextjs` coordinator tier is dissolved. **You** (the command, in the main thread) own coordination: you sequence the phases below and spawn each specialist single-level via `Agent()`. Architecture decisions are produced by `nextjs-architect` in 3.4 (it is the planner). See `docs/reference/flatten-orchestration-pattern.md`.

Decide flow from **visual context** (from Section 0) before planning:
- If `has_visual_reference: true` -> pass the user's visual context straight to `nextjs-builder` in 3.6.
- If `needs_diagnosis: true` -> run the diagnose pass from Section 3.5 first, feed its findings into 3.4.

Context to pass into every `Agent()` call this run (inherited — instruct each agent NOT to call `query_context`; targeted file reads OK):
- ContextBundle from Section 3.2, memory summary, requirements spec (if any), the `=== DESIGN AWARENESS ===` manifesto block (Section 0.6), tech-stack detection / `css_approach` (3.1.2), and STANDARDS from prior gate failures.

Architecture/data decisions (App Router structure, RSC vs client, data patterns; risk assessment) are the output of 3.4, recorded via `mcp__project-context__save_decision`.

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

### 3.5 Analysis (structure / layout mapping)

Component hierarchy, layout structure, and style sources are mapped by `nextjs-architect`
as part of its plan in 3.4 (no separate analyzer agent). If deeper diagnosis is needed for
a **broken UI with no screenshot**, spawn `nextjs-architect` in a read-only diagnose pass
to map the structure / layout / style sources, OR route the aesthetic diagnosis to
`/impeccable --audit`. There is no design-reviewer agent.

Record the structure map in `phase_state.analysis`.

### 3.6 Implementation (nextjs-builder + specialists)

Spawn `nextjs-builder` single-level via `Agent()`, then any specialists single-level (each spawned by this command, one at a time):

**Specialists as needed (per confirmed team from 3.1):**
- Types: `nextjs-typescript-specialist`
- Performance: `nextjs-performance-specialist`
- Accessibility: `nextjs-accessibility-specialist`
- SEO: `nextjs-seo-specialist`

CSS / layout / tokens are **owned by `nextjs-builder`** (it auto-adapts to the detected
`css_approach` from 3.1.2). There are no CSS / layout / design-review specialist agents.

** Use ONLY the specialists confirmed in Section 3.1.**
Do not add specialists that weren't in the confirmed team.

Update phase_state.implementation_pass1.

### 3.7 Gates

Run gate agents in order:

1. **nextjs-standards-enforcer** — code standards, token usage, safety.
   - Threshold: 90/100. Hard block if < 90.
   - Write the canonical score contract to phase_state:
     `gates.standards = { "score": <score>, "threshold": 90, "gate_decision": "PASS"|"BLOCK", "lane": "nextjs" }`
     (`docs/reference/gate-contract.md`).
   - **BINARY mapping:** the enforcer emits a graduated decision (PASS / WARN / ERROR / BLOCK).
     Write `gate_decision: "PASS"` ONLY when the enforcer decision is `PASS` **AND**
     `score >= 90`; otherwise `"BLOCK"`. ALWAYS write `score` as a NUMBER.
     `hooks/gate-enforcement.sh` exit-2 blocks a PASS with a missing/non-numeric score,
     a score below threshold, or WARN/ERROR text written as PASS.

2. **Design floor (UI-affecting tasks only)** — the web design lane floor (Section 0.6.1):
   lightweight bind -> `Agent(design-validator)` (fresh context, detector + bound
   constraints) -> branch, writing `gates.design_lane` with non-empty `artifact_paths`
   (`docs/reference/design-lane.md`). Skip for pure server/route/config changes.
   `hooks/gate-enforcement.sh` re-runs `designcheck` on `artifact_paths` and exit-2 blocks
   a PASS on a missed P0.

Update phase_state.gates.

**If gates block:** Allow one corrective pass (implementation_pass2) scoped to violations
only; increment `gates.standards.attempts` / `gates.design_lane.attempts` on the corrective
respawn. MAX N=2 on the design lane, then escalate (`escalated: true`).

### 3.8 Verification (nextjs-verification-agent)

Delegate to `nextjs-verification-agent` (the distinct verification gate — this lane keeps
it separate from the standards gate):
- Run lint / typecheck / build
- Record `verification.verification_status` and `verification.commands_run` (the exact
  commands executed — `hooks/gate-enforcement.sh` blocks a `"pass"` whose `commands_run`
  entries were not actually run via the Bash tool this session)

Update phase_state.verification.

### 3.9 Completion

- Summarize gate scores, verification results, risks
- Save task history via `mcp__project-context__save_task_history`
- Retire phase_state (write final status)

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
   - "Let me write this code" -> WRONG. Delegate to nextjs-builder
   - "I'll fix this directly" -> WRONG. Delegate to specialist
   - Using Edit/Write tools -> WRONG. You're an orchestrator
   - Resuming without confirmation -> WRONG. Must re-confirm first
   - "Based on feedback, re-confirming plan..." -> CORRECT
   - "Based on feedback, delegating to nextjs-builder..." -> WRONG (skipped confirmation)

---

## 5. Notes

- Use the design floor (Section 0.6.1) to keep named slop out of UI-affecting changes; skip it for pure server/route/config work
- The command (main thread) owns coordination; specialists are spawned single-level via `Agent()` — no orchestrator subagent (OS 7.1)
- **/impeccable boundary:** `/nextjs` runs a LIGHT per-task design floor. Heavy / holistic aesthetic work (multi-verb, `--craft`, full cognition bind, register harvest) routes to `/impeccable` — mirroring the `/ios` <-> `/ios-impeccable` split
- CSS / layout / tokens are owned by `nextjs-builder` + the design floor; the design/CSS/layout specialists were retired with the design-fork
- All agents inherit the user's configured default model (never pinned in agent frontmatter)
- Complex tasks MUST have specs
- Simple tasks use light path for speed
- **Visual Context Flow:** If a UI task has no screenshot, run the structure-mapping diagnose pass (Section 3.5) before building
