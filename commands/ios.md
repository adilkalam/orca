---
description: "OS 6.2 orchestrator entrypoint for native iOS tasks"
argument-hint: "[--light | -tweak | --complex] <task description or requirement ID>"
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

# /ios - iOS Lane Orchestrator (OS 6.2)

Use this command for native iOS work (Swift/SwiftUI/UIKit, Xcode, device features).

## Usage

```bash
/ios "add haptic feedback to save button"       # Default: light path + design gates
/ios -tweak "fix button padding"                # Fast: light path, no gates
/ios --complex "multi-screen feature"           # Full: grand-architect + all gates
/ios "implement requirement 2025-11-25-0930-workspace-sharing"  # Full path with spec
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
$ARGUMENTS contains "--light" → Section 2.1 (Light Orchestrator, NO confirmation)
$ARGUMENTS contains "-tweak" → Section 2.2 (Builder Direct, NO confirmation)
$ARGUMENTS contains "--complex" → Section 3 (Full Pipeline with confirmation)
No flag → Section 3 (Light Orchestrator WITH confirmation)
```

---

## 0.1 Recording Context (OS 6.2)

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

3. Include in delegation prompt to grand-architect:
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
ios-ui-reviewer in DIAGNOSE mode before implementation.

---

## 0.5 Deep Audit Mode (Optional)

Use this mode when you want a **deep review/audit** of the existing iOS
codebase, not implementation:

- Architecture consistency
- Concurrency and safety
- Design DNA & UI/UX quality
- Performance/security/accessibility risks

**IMPORTANT:** Audit mode MUST NOT modify code. It only analyzes and
reports.

When `--audit` is detected:

1. **Clarify focus**
   - Use `AskUserQuestion` to ask what to prioritize:
     - Architecture & standards
     - UI/UX & design tokens
     - Concurrency & safety
     - Performance
     - Security & privacy
     - Accessibility

2. **Memory & ProjectContext**
   - Run memory-first search (Workshop + unified memory) for:
     - Past iOS incidents, RA tags, and standards.
   - Call `mcp__project-context__query_context` with a diagnostic task:
     - `domain: "ios"`
     - `task`: "Deep iOS codebase audit"
     - `maxFiles`: larger than usual (e.g. 30–50)
     - `includeHistory: true`

3. **Assemble an audit squad (via Task)**
   - Based on focus, delegate to relevant agents:
     - Standards/architecture:
       - `ios-standards-enforcer`
     - UI/UX & tokens:
       - `ios-ui-reviewer`
       - `design-dna-guardian`
     - Concurrency/safety:
       - `ios-performance-specialist`
       - `ios-security-specialist`
     - Accessibility:
       - `ios-accessibility-specialist`
     - Testing:
       - `ios-testing-specialist`
       - `ios-ui-testing-specialist`

   - In prompts, make it explicit that:
     - They are in **audit** mode.
     - They should use `Read`/`Grep`/`Glob` (+ ProjectContext) to inspect
       code and tests, not rely on `files_modified`.
     - They MUST NOT edit code; only analyze and report.

4. **Synthesize an iOS Audit Report**
   - Combine findings into a single report:
     - Architecture & standards issues
     - Concurrency/safety concerns
     - UI/UX & design DNA issues
     - Performance/security/accessibility gaps
     - Suggested follow-up tasks (each can become `/plan` + `/ios` work).

5. **(Optional) Save audit history**
   - Use `mcp__project-context__save_task_history` with:
     - `domain: "ios"`
     - `task`: "audit: ios codebase"
     - `outcome`: `"diagnosed"` or `"reviewed"`
     - `learnings`: key bullets from the audit

Return this report to the user and **do not** proceed into the normal
implementation pipeline unless explicitly requested.

---

## 1. Memory-First Context

### 1.1 Memory Search (Before ProjectContext)

Before expensive ProjectContext queries, check local memory:

```bash
# Search Workshop for relevant iOS decisions/gotchas
workshop --workspace .claude/memory why "iOS $TASK_KEYWORDS"

# Search code-index.db for relevant code/symbols (if available)
python3 ~/.claude/scripts/memory-search-unified.py "$TASK_KEYWORDS" --mode all --top-k 5
```

If memory hits are relevant:
- Note them for context
- May skip or reduce ProjectContext query scope

### 1.1.1 Reflexion Loading (OS 6.2)

Load relevant reflexions from past gate failures:

```bash
workshop --workspace .claude/memory search "reflexion" -t ios --limit 5 2>/dev/null || true
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

   This task appears to involve multiple screens/flows or architectural changes.
   Please run:
     /plan "<task description>"

   Then return with:
     /ios "implement requirement <id>"
   ```
4. **If spec found:**
   - Record `requirement_id` and `requirements_spec_path` in phase_state
   - Spec becomes authoritative source for ios-architect

---

## 2. Light Path Flow (--light and -tweak modes ONLY)

This section applies ONLY when user passes `--light` or `-tweak` flags.
Default (no flag) now goes to Section 3 for confirmation first.

### 2.1 --light Flag - Light Path WITHOUT Confirmation

Delegate to `ios-light-orchestrator` directly. Skip Section 3.

**Context Inheritance Protocol (--light mode):**

```
Task({
  subagent_type: "ios-light-orchestrator",
  description: "iOS task with design verification (fast, no confirmation)",
  prompt: `
=== CONTEXT BUNDLE (INHERITED) ===
CONTEXT_SOURCE: /ios
CONTEXT_MODE: full
DO_NOT_QUERY: true

<ContextBundle JSON if queried, or "narrow query needed" if memory-first>
===

CRITICAL: You received context above. DO NOT call mcp__project-context__query_context.
Use the inherited bundle. You MAY query with narrow scope (maxFiles: 5) if context missing.

Handle this iOS task via the light path WITH design verification gates.

REQUEST: $ARGUMENTS

MEMORY CONTEXT (if any):
<memory hits from 1.1>

ROUTING MODE: --light (light + gates, no confirmation)
- Run ios-builder + specialists
- Run design verification gates (standards-enforcer, ui-reviewer)
- Ephemeral phase_state only (scores for this run, no ceremony)
- NO grand-architect, NO spec requirement
  `
})
```

---

### 2.2 -tweak Flag - Builder Direct (Pure Speed)

1. Memory-first context only (skip ProjectContext)
2. Delegate directly to `ios-builder`
3. Basic verification (build/lint)
4. NO design verification gates

**Fallback:** If memory can't locate files, MAY use narrow ProjectContext (maxFiles: 3)

**Context Inheritance Protocol (-tweak mode):**

```
Task({
  subagent_type: "ios-builder",
  description: "Fast iOS tweak (no gates)",
  prompt: `
=== CONTEXT BUNDLE (INHERITED) ===
CONTEXT_SOURCE: /ios
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
- NO gates, NO UI review
  `
})
```

---

### --complex Flag - Full Pipeline (Grand-Architect + All Gates)

Continue with full orchestration below (Section 3).

---

## 3. Pipeline Flow with Confirmation (Default and --complex modes)

This section applies when:
- **Default (no flag)**: Routes to light-orchestrator AFTER confirmation
- **--complex flag**: Routes to grand-architect AFTER confirmation

### 3.1 Team Confirmation (MANDATORY - BLOCKING)

**DO NOT PROCEED TO SECTION 3.2 WITHOUT USER CONFIRMATION**

**This is a TWO-STEP process. You MUST do both steps.**

#### Step A: OUTPUT the team (VISIBLE MARKDOWN - NOT inside AskUserQuestion)

**FIRST, output this as regular markdown so the user can see it.**

**For DEFAULT mode (no flag):**

```markdown
## Proposed iOS Pipeline

**Request:** [the task]
**Mode:** default (light path with confirmation)

### Phases
1. Context Query (ProjectContext)
2. Light Orchestrator (ios-light-orchestrator) - coordination
3. Implementation (ios-builder + specialists)
4. Gates (ios-standards-enforcer, ios-ui-reviewer)

### Agent Team
| Role | Agent |
|------|-------|
| Coordination | ios-light-orchestrator |
| Implementation | ios-builder |
| Specialists | [list relevant ones based on 3.1.1] |
| Standards Gate | ios-standards-enforcer |
| UI Review Gate | ios-ui-reviewer |

### Files Likely Affected
- [list from ContextBundle or memory]

### Risks/Notes
- [any identified risks]
```

**For --complex mode:**

```markdown
## Proposed iOS Pipeline

**Request:** [the task]
**Mode:** --complex (full pipeline)

### Phases
1. Context Query (ProjectContext)
2. Grand Architect (ios-grand-architect) - architecture decisions
3. Planning (ios-architect) - detailed plan
4. Implementation (ios-builder + specialists)
5. Gates (ios-standards-enforcer, ios-ui-reviewer)
6. Verification (ios-verification)

### Agent Team
| Role | Agent |
|------|-------|
| Coordination | ios-grand-architect |
| Architecture | ios-architect |
| Implementation | ios-builder |
| Specialists | [list relevant ones based on 3.1.1] |
| Standards Gate | ios-standards-enforcer |
| UI Review Gate | ios-ui-reviewer |
| Verification | ios-verification |

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
4. If user says "Switch to --light" → delegate to ios-light-orchestrator directly (Section 2.1)

**After confirmation received - ROUTING:**
- If `--complex` flag → Delegate to `ios-grand-architect` (full pipeline, Section 3.2+)
- If default (no flag) → Delegate to `ios-light-orchestrator` (fast, with gates)

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
| "remove/migrate from UIKit" | `ios-uikit-specialist` | `ios-swiftui-specialist` |
| "remove/eliminate Combine" | — | Use async/await patterns |
| "audit/review" (not implement) | `ios-builder` | Appropriate reviewer/enforcer agents |
| "security audit" | `ios-builder` | `ios-security-specialist` |
| "performance audit" | `ios-builder` | `ios-performance-specialist` |

**Detection keywords:**
- "remove", "eliminate", "get rid of", "migrate away from", "replace" → EXCLUDE that specialist
- "audit", "review", "analyze", "check" → Use reviewers, NOT builders

### 3.2 Context Query

Call ProjectContextServer (unless memory-first gave sufficient context):

```
mcp__project-context__query_context({
  domain: "ios",
  task: <sanitized task description>,
  projectPath: <repo root>,
  maxFiles: 10-20,
  includeHistory: true
})
```

Initialize phase_state.json:
```json
{
  "domain": "ios",
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

Delegate to `ios-grand-architect` with Context Inheritance:

**Context Inheritance Protocol (OS 6.2):**

When delegating, wrap the ContextBundle with inheritance headers:

```
=== CONTEXT BUNDLE (INHERITED) ===
CONTEXT_SOURCE: /ios
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
- If `needs_diagnosis: true` → Run `ios-ui-reviewer` in DIAGNOSE mode first

Outputs:
- Architecture path (SwiftUI vs MVVM/TCA/UIKit)
- Data strategy (SwiftData vs Core Data/GRDB)
- Design DNA presence check
- Risk assessment
- Task force plan

Save decision via `mcp__project-context__save_decision`.

### 3.4 Planning (ios-architect)

Delegate to `ios-architect`:

**If requirements_spec_path exists:**
- ios-architect MUST read spec first
- Spec's constraints and acceptance criteria are authoritative
- Note any out-of-scope or ambiguous items

Outputs:
- Change type classification
- Impact analysis (screens, flows, data, navigation)
- Detailed plan with steps
- Constraints and risks

Update phase_state.planning.

### 3.5 Implementation (ios-builder + specialists)

Delegate to `ios-builder`:

Specialists as needed:
- UI: `ios-swiftui-specialist` or `ios-uikit-specialist`
- Tokens: `design-dna-guardian`
- Data: `ios-persistence-specialist`
- Networking: `ios-networking-specialist`
- Testing: `ios-testing-specialist`, `ios-ui-testing-specialist`
- Risk: `ios-performance-specialist`, `ios-security-specialist`, `ios-accessibility-specialist`

Update phase_state.implementation_pass1.

### 3.6 Gates

Run gate agents:

1. **ios-standards-enforcer** - Code standards, Swift 6 concurrency
   - Threshold: 90/100
   - Hard block if < 90

2. **ios-ui-reviewer** - Code-based UI review (NO simulator)
   - Checks: token usage, patterns, accessibility labels in code
   - Threshold: 90/100
   - Hard block if < 90
   - Defers visual verification to ios-verification

3. **ios-verification** - Build/test/visual (ONLY agent with XcodeBuildMCP)
   - Must pass build
   - Must pass tests
   - Visual verification if requested or flagged by ios-ui-reviewer
   - Takes screenshots, measures pixels

Update phase_state.gates.

**If gates fail:** Allow one corrective pass (implementation_pass2) scoped to violations only.

### 3.7 Completion

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
   - "Let me write this code" → WRONG. Delegate to ios-builder
   - "I'll fix this directly" → WRONG. Delegate to specialist
   - Using Edit/Write tools → WRONG. You're an orchestrator
   - Resuming without confirmation → WRONG. Must re-confirm first
   - "Based on feedback, re-confirming plan..." → CORRECT
   - "Based on feedback, delegating to ios-builder..." → WRONG (skipped confirmation)

---

## 5. Notes

- Block UI work if design DNA/tokens missing
- Do not change data store without explicit plan
- Keep edits scoped; no scope creep
- Complex tasks MUST have specs
- Simple tasks use light path for speed
- All agents use Opus 4.6 (default model)
- **Visual Context Flow:** If UI task has no screenshot, diagnose before building
