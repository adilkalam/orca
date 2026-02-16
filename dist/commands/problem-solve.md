---
description: Convergent 8-step decision pipeline (ORIENT→ANTICIPATE→GENERATE→EVALUATE→COMMIT)
argument-hint: <complex problem or decision>
---

# /problem-solve - Convergent 8-Step Decision Pipeline

**YOUR ROLE**: Execute the FULL 8-step complex problem pipeline automatically, making multiple calls to `mcp__cognition-mcp__cognition` in sequence. Each phase builds on the previous. This is NOT a recommendation engine - you EXECUTE each step.

**Problem**: $ARGUMENTS

---

## If --help or empty arguments

Display this reference and stop:

```
/problem-solve - Automated Complex Problem Pipeline

Runs the full 8-step ORIENT→ANTICIPATE→GENERATE→EVALUATE→COMMIT cycle.

USAGE:
  /problem-solve <complex problem or decision>
  /problem-solve --quick <problem>    (3-step: systems → decide → challenge)
  /problem-solve --risk <problem>     (4-step: systems → pre-mortem → causal → meta)
  /problem-solve --strategic <problem> (5-step: systems → pre-mortem → tree → decide → ulysses)
  /problem-solve --incident <problem>  (3-step: ooda → debug → meta)
  /problem-solve --help

FULL PIPELINE (default):
  1. orchestrate  - What operations does this need?
  2. systems      - Map components, relationships, loops
  3. pre-mortem   - Imagine failure, trace causes
  4. tree         - Generate options aware of risks
  5. decide       - Structured criteria comparison
  6. challenge    - Adversarial stress test
  7. ulysses      - Pre-commit with safeguards
  8. meta         - Reflect on process quality

EXAMPLES:
  /problem-solve Should we migrate from monolith to microservices?
  /problem-solve --quick Which database: PostgreSQL vs MongoDB?
  /problem-solve --risk Launching new payment system
  /problem-solve --strategic 3-year platform modernization
  /problem-solve --incident Production outage on checkout flow
```

---

## Phase 0: Parse Arguments & Select Pipeline

**Parse $ARGUMENTS for pipeline variant**:

| Flag | Pipeline | Steps |
|------|----------|-------|
| (none) | Full | All 8 steps |
| --quick | Quick Decision | systems → decide → challenge |
| --risk | Risk Assessment | systems → pre-mortem → causal → meta |
| --strategic | Strategic Planning | systems → pre-mortem → tree → decide+challenge → ulysses |
| --incident | Incident Response | ooda → debug → meta |

**Extract problem statement**: Everything after the flag (or entire $ARGUMENTS if no flag)

---
## Phase 0.5: SCOPE (Before ORIENT)

Before mapping the presumed cause, enumerate ALL components the SYMPTOM could touch.

**Questions:**
1. "What is the SYMPTOM (what the user observes failing)?"
2. "What components could POSSIBLY cause this symptom?"
   (Not what you think is likely - list ALL possibilities including destination components)
3. "If this action succeeds, where does control flow NEXT?"
   (The destination page/component - often missed but critical)

**CRITICAL**: Include the component you land on AFTER the action completes.
Example: Login redirect -> must include what /admin/orders/ page needs to render.

**Soft Verification** (Recommended):
Before proceeding to ORIENT, verify at least one claim empirically if possible
(query run, file read). If not verifiable, note this gap.

**Output**: Component list that MUST include destination, not just action path.

---


## Phase Gate Protocol

After each major phase, run a lightweight verification check to catch errors before they propagate.

### Gate Output Format

```
---
GATE [N]: [PHASE NAME]
Status: [PASS | SOFT FAIL | HARD FAIL]
[If SOFT FAIL: Warning: <message>]
[If HARD FAIL: STOPPING - <reason>. Address the issue, then continue.]
---
```

### Gate Definitions

**Gate 1: After ORIENT (Systems Map)**

Questions (external validity focus):
1. Does the map include the FULL PATH from symptom to resolution?
   (Not just the presumed cause, but also what happens AFTER the action succeeds)
2. Have you VERIFIED at least one assumption with actual tool output?
   (Query run, file read - not just logical claim. If not possible, note the gap.)
3. If component X works, what does the NEXT component in the chain need?
   (The destination component that receives control after success)

Pass Criteria: All 3 questions answered "yes"
Soft Fail: Warning shown, continue by default
Hard Fail: Missing critical component from problem statement -> stop and clarify

**Gate 2: After ANTICIPATE (Pre-Mortem)**
Questions:
1. Does each failure mode trace back to components in the systems map?
2. Are failure modes specific (not generic "it might fail")?
3. Did we identify at least one non-obvious failure mode?

Pass Criteria: All 3 questions answered "yes"
Soft Fail: Warning about weak risk analysis
Hard Fail: Failure modes don't reference systems map → re-run with explicit links

**Gate 3: After GENERATE (Option Tree)**
Questions:
1. Does each option address at least one failure mode from pre-mortem?
2. Are there at least 2 meaningfully different options (not variants)?
3. Did we prune any options and explain why?

Pass Criteria: All 3 questions answered "yes"
Soft Fail: Warning about narrow options
Hard Fail: Options ignore identified risks → regenerate with risk constraints

**Gate 4: After EVALUATE (Decision)**
Questions:
1. Did the adversarial critique identify at least one genuine weakness?
2. Is the confidence score justified by the analysis?
3. Did we consider at least one alternative interpretation of the data?

Pass Criteria: All 3 questions answered "yes"
Soft Fail: Warning about weak evaluation
Hard Fail: Adversarial critique found critical flaw → return to GENERATE

---

## Verbose Flag

Include `verbose: false` in every cognition MCP call from /problem-solve. This command makes 6-8 calls per session; the minimal ACK response saves significant tokens. Claude already has the content in its output history.

## Phase 1: ORIENT - Understand the Landscape

### Step 1.1: Orchestration Assessment

Call `mcp__cognition-mcp__cognition`:

```typescript
{
  operation: "orchestration_suggest",
  sessionTitle: "ProblemSolve: <problem summary>",
  sessionTags: ["problem-solve", "complex-problem", "convergent"],
  content: {
    task: "<problem from $ARGUMENTS>",
    complexity: "complex",
    suggestedOperations: [
      // YOU determine these based on problem characteristics
      { operation: "systems", reason: "<why mapping helps>", order: 1 },
      { operation: "mental_model", reason: "Pre-mortem to anticipate failure", order: 2 },
      // ... continue based on problem type
    ],
    alternativeApproaches: [
      { approach: "<alternative>", tradeoffs: "<when to use>" }
    ],
    recommendation: "<1-2 sentence approach summary>"
  }
}
```

**Output**: Brief summary of the orchestration assessment. Note the sessionId for subsequent calls.

### Step 1.2: Systems Mapping

Call `mcp__cognition-mcp__cognition`:

```typescript
{
  operation: "systems",
  sessionId: "<sessionId from 1.1>",
  content: {
    system: "<name of the system being analyzed>",
    components: [
      { name: "<component 1>", function: "<what it does>" },
      { name: "<component 2>", function: "<what it does>" },
      // ... identify 3-6 key components
    ],
    relationships: [
      { from: "<component 1>", to: "<component 2>", type: "<depends_on|influences|triggers|feeds>" },
      // ... map key relationships
    ],
    feedbackLoops: [
      "<description of any reinforcing or balancing loops>"
    ],
    boundaries: "<what's in scope vs out of scope>",
    keyLeveragePoints: ["<where small changes have big effects>"]
  }
}
```

**Output**: Present the systems map with ASCII diagram:

```
## Phase 1: Systems Map

[Component A] ──depends_on──> [Component B]
      │                            │
      └────influences────> [Component C] <─feeds─┘
                                  │
                           [Feedback Loop]

Key components: ...
Leverage points: ...
```

### Execute Gate 1

Run Gate 1 verification:
1. Check: All problem statement components in map?
2. Check: No orphan components?
3. Check: At least one feedback loop/leverage point?

Output gate result before proceeding.

---

## Phase 2: ANTICIPATE - Identify Failure Modes

### Step 2: Pre-Mortem Analysis

Call `mcp__cognition-mcp__cognition`:

```typescript
{
  operation: "mental_model",
  sessionId: "<sessionId>",
  content: {
    modelName: "pre-mortem",
    problem: "<problem statement>",
    setup: "It's [timeframe] from now. This initiative has failed spectacularly. What happened?",
    steps: [
      "<failure mode 1: what went wrong>",
      "<failure mode 2: what went wrong>",
      "<failure mode 3: what went wrong>",
      // ... identify 3-5 major failure modes
    ],
    reasoning: "<why each failure mode is plausible given the systems map>",
    rootCauses: [
      { failure: "<failure>", cause: "<underlying cause>", preventable: true/false }
    ],
    conclusion: "<key risks to address in solution design>"
  }
}
```

**Output**: Present failure modes and risks:

```
## Phase 2: Pre-Mortem Analysis

"This failed because..."

1. [Failure Mode 1] - Root cause: ...
2. [Failure Mode 2] - Root cause: ...
3. [Failure Mode 3] - Root cause: ...

Key risks to mitigate:
- ...
```

### Execute Gate 2

Run Gate 2 verification:
1. Check: Each failure mode traces to systems map component?
2. Check: Failure modes are specific, not generic?
3. Check: At least one non-obvious failure mode identified?

Output gate result before proceeding.

---

## Phase 3: GENERATE - Create Risk-Aware Options

### Step 3: Option Generation

Call `mcp__cognition-mcp__cognition`:

```typescript
{
  operation: "tree_of_thought",
  sessionId: "<sessionId>",
  content: {
    problem: "<problem statement>",
    constraints: [
      "<constraint from systems map>",
      "<risk to avoid from pre-mortem>"
    ],
    branches: [
      {
        id: "A",
        thought: "<Option A description>",
        evaluation: {
          score: 0.0-1.0,
          strengths: ["<strength>"],
          weaknesses: ["<weakness, especially re: identified risks>"],
          feasibility: "high|medium|low"
        },
        children: [
          // Sub-options if branching further
        ]
      },
      {
        id: "B",
        thought: "<Option B description>",
        evaluation: { ... }
      },
      {
        id: "C",
        thought: "<Option C description>",
        evaluation: { ... }
      }
    ],
    bestPath: ["<root>", "<best branch>", "<best sub-branch if any>"],
    pruned: ["<branches eliminated and why>"],
    synthesis: "<how the best option addresses identified risks>"
  }
}
```

**Output**: Present option tree:

```
## Phase 3: Option Tree

       [Problem]
      /    |    \
   [A]    [B]    [C]
   0.7    0.85*  0.6
    |      |
  [A1]   [B1]

Options:
A: [Description] - Score: 0.7 (weakness: ...)
B: [Description] - Score: 0.85 (addresses risk X)
C: [Description] - Score: 0.6 (pruned: ...)

Recommended path: B → B1
```

### Execute Gate 3

Run Gate 3 verification:
1. Check: Each option addresses at least one failure mode?
2. Check: At least 2 meaningfully different options (not variants)?
3. Check: Options were pruned with explanations?

Output gate result before proceeding.

---

## Phase 4: EVALUATE - Rigorous Comparison

### Step 4.1: Decision Framework

Call `mcp__cognition-mcp__cognition`:

```typescript
{
  operation: "decide",
  sessionId: "<sessionId>",
  content: {
    statement: "<the decision to be made>",
    options: [
      {
        name: "<Option A from tree>",
        description: "<what it involves>",
        pros: ["<pro 1>", "<pro 2>"],
        cons: ["<con 1>", "<con 2, linked to pre-mortem risks>"]
      },
      {
        name: "<Option B from tree>",
        description: "<what it involves>",
        pros: ["<pro 1>", "<pro 2>"],
        cons: ["<con 1>"]
      }
      // Include top 2-3 options from tree
    ],
    criteria: [
      "<criterion 1 - derived from systems analysis>",
      "<criterion 2 - derived from risk analysis>",
      "<criterion 3 - user's implicit requirements>",
      "<criterion 4 - feasibility/resources>"
    ],
    weights: {
      "<criterion 1>": 0.3,
      "<criterion 2>": 0.25,
      // ... weights should sum to 1.0
    },
    analysis: "<detailed comparison of options against weighted criteria>",
    scores: {
      "<Option A>": 0.72,
      "<Option B>": 0.86
    },
    choice: "<recommended option>",
    confidence: 0.0-1.0,
    nextThoughtNeeded: true  // Still need challenge phase
  }
}
```

### Step 4.2: Adversarial Challenge

**Generate adversarial critique inline** (do NOT call MCP again):

Produce structured critique of the recommended option:

```
## Phase 4: Decision Analysis

### Recommendation: [Option B]

| Option | C1 (30%) | C2 (25%) | C3 (25%) | C4 (20%) | Total |
|--------|----------|----------|----------|----------|-------|
| A      | 0.7      | 0.6      | 0.8      | 0.7      | 0.70  |
| B      | 0.9      | 0.85     | 0.8      | 0.85     | 0.86  |

Confidence: 0.8

---

### Adversarial Critique

**Assumptions Being Made:**
- [List 2-3 key assumptions]

**What Could Go Wrong:**
- [Risk 1, especially from pre-mortem that isn't fully addressed]
- [Risk 2]

**Devil's Advocate:**
[Strong argument for NOT choosing the recommended option]

**Blind Spots:**
- [What the analysis might be missing]

**Stress Test Result:** [PASSED | PASSED WITH CAVEATS | NEEDS REVISION]
```

### Execute Gate 4

Run Gate 4 verification:
1. Check: Adversarial critique identified at least one genuine weakness?
2. Check: Confidence score is justified by the analysis?
3. Check: At least one alternative interpretation was considered?

Output gate result before proceeding. If HARD FAIL (critical flaw found), return to GENERATE.

---

## Phase 5: COMMIT - Lock In With Safeguards

### Step 5.1: Ulysses Protocol

Call `mcp__cognition-mcp__cognition`:

```typescript
{
  operation: "ulysses_protocol",
  sessionId: "<sessionId>",
  content: {
    goal: "<the chosen option from decision phase>",
    context: "<why this commitment matters>",
    temptations: [
      {
        trigger: "<situation that might cause drift>",
        temptation: "<what might tempt abandonment/change>",
        risk: "<why giving in would be dangerous>"
      }
      // 2-3 temptations based on pre-mortem analysis
    ],
    commitments: [
      {
        commitment: "<specific, measurable commitment>",
        enforcement: "<how it will be enforced>",
        consequences: "<what happens if broken>"
      }
      // 2-4 concrete commitments
    ],
    safeguards: [
      {
        safeguard: "<protective measure>",
        trigger: "<when it activates>",
        linkedRisk: "<which pre-mortem risk this addresses>"
      }
    ],
    reviewPoints: [
      { milestone: "<checkpoint>", criteria: "<what to evaluate>" }
    ],
    accountability: "<who/what ensures follow-through>",
    escapeHatch: "<under what conditions is it OK to change course>"
  }
}
```

### Step 5.2: Process Reflection

Call `mcp__cognition-mcp__cognition`:

```typescript
{
  operation: "meta",
  sessionId: "<sessionId>",
  content: {
    process: "ProblemSolve 8-step convergent decision pipeline",
    observations: [
      "<observation about how the analysis went>",
      "<what was most valuable>",
      "<what was surprising>"
    ],
    adjustments: [
      "<what could be done differently next time>"
    ],
    effectiveness: 0.0-1.0,
    insights: "<metacognitive insights about the reasoning process>",
    transferable: "<what from this analysis applies to similar problems>",
    nextThoughtNeeded: false
  }
}
```

**Output**:

```
## Phase 5: Commitment Protocol

### Decision: [Chosen Option]

### Commitments:
1. [Commitment 1] - Enforced by: ...
2. [Commitment 2] - Enforced by: ...

### Safeguards:
- [Safeguard 1] - Triggers when: ... (addresses: [risk from pre-mortem])
- [Safeguard 2] - Triggers when: ...

### Review Points:
- [ ] [Milestone 1]: [Criteria]
- [ ] [Milestone 2]: [Criteria]

### Escape Hatch:
[When it's OK to change course]

---

## Process Reflection

Effectiveness: [X/10]
Key insight: ...
For next time: ...
```

## Attempt Tracking (Per Session)

Track fix attempts within the current session.
After 2 failed attempts, display warning before attempt #3:

---
**WARNING: You have attempted 2 fixes without success.**

Before attempting fix #3, STOP and complete:
1. **VERIFY** current hypothesis: Run query/command that PROVES it
2. **LIST** 2 alternative hypotheses for this symptom
3. **CHECK**: What does the destination page/component need?

If you cannot complete these steps, consider:
- The problem may be different from what you're investigating
- Expand scope to include components you've dismissed
---

---

## Final Output Format

After completing all phases, present a unified summary:

```
# ProblemSolve Analysis: [Problem Summary]

## Executive Summary
[2-3 sentence summary of recommendation and key insight]

## Gate Summary
| Gate | Phase | Status |
|------|-------|--------|
| Gate 1 | ORIENT | [PASS/SOFT FAIL/HARD FAIL] |
| Gate 2 | ANTICIPATE | [PASS/SOFT FAIL/HARD FAIL] |
| Gate 3 | GENERATE | [PASS/SOFT FAIL/HARD FAIL] |
| Gate 4 | EVALUATE | [PASS/SOFT FAIL/HARD FAIL] |

## The Journey

### Phase 1: ORIENT
[Brief systems map summary]
**Gate 1:** [Status + any warnings]

### Phase 2: ANTICIPATE
[Key risks identified]
**Gate 2:** [Status + any warnings]

### Phase 3: GENERATE
[Options considered, best path]
**Gate 3:** [Status + any warnings]

### Phase 4: EVALUATE
[Decision with confidence level]
[Stress test result]
**Gate 4:** [Status + any warnings]

### Phase 5: COMMIT
[Key commitments and safeguards]

## Recommended Action
[Clear, actionable next step]

## Key Safeguards
1. [Safeguard 1]
2. [Safeguard 2]

## Review Schedule
- [Checkpoint 1]
- [Checkpoint 2]

## Next Steps

Based on this analysis:

**If confidence is low (<0.7) and you need more exploration:**
→ /deepthink "[area of uncertainty from analysis]"

**If multiple safeguards need formalization:**
→ /think --ulysses "[commitment requiring safeguards]"

**If the systems map revealed unexpected complexity:**
→ /think --systems "[component needing deeper analysis]"

**If you want to stress-test the decision further:**
→ /challenge "[the decision]"

**If implementation planning is needed:**
→ /plan "[chosen option implementation]"

---
*Analysis completed via ProblemSolve 8-step pipeline*
*Gate Summary: [N]/4 PASS, [N] SOFT FAIL, [N] HARD FAIL*
*Session ID: [sessionId] (can be resumed with /think --import)*
```

---

## Shortened Pipeline Variants

### --quick (3 steps)

Execute only:
1. Step 1.2 (systems)
2. Step 4.1 (decide)
3. Step 4.2 (challenge - inline)

### --risk (4 steps)

Execute only:
1. Step 1.2 (systems)
2. Step 2 (pre-mortem)
3. Additional: causal_analysis operation
4. Step 5.2 (meta)

### --strategic (5 steps)

Execute only:
1. Step 1.2 (systems)
2. Step 2 (pre-mortem)
3. Step 3 (tree)
4. Steps 4.1 + 4.2 (decide + challenge)
5. Step 5.1 (ulysses)

### --incident (3 steps)

Execute only:
1. ooda_loop operation
2. debug operation
3. Step 5.2 (meta)

---

## Critical Requirements

1. **EXECUTE, don't recommend**: Unlike /contemplate, this command RUNS each phase automatically
2. **Maintain session**: Use the same sessionId throughout all phases
3. **Build on previous**: Each phase must reference insights from earlier phases
4. **Present progressively**: Show output after each phase so user sees progress
5. **Quality over speed**: Take time for thorough analysis at each step
6. **Link risks to safeguards**: Pre-mortem risks should directly inform ulysses safeguards

---

## Example Execution

**Input**: `/problem-solve Should we migrate from monolith to microservices?`

**Output Flow**:

```
# ProblemSolve: Monolith to Microservices Migration

Starting 8-phase analysis...

---

## Phase 1: ORIENT

### Orchestration Assessment
Complexity: complex
Recommended approach: Full pipeline with emphasis on risk analysis...

### Systems Map
[ASCII diagram of current architecture]
Key leverage points: API layer, shared database, deployment pipeline

---

## Phase 2: ANTICIPATE

### Pre-Mortem: "The migration failed after 18 months"
1. Team fragmentation - services owned by no one
2. Distributed debugging nightmare - incidents took 10x longer
3. Data consistency chaos - eventual consistency misunderstood
...

---

## Phase 3: GENERATE

### Option Tree
       [Migration Strategy]
      /        |         \
[Full MW]  [Strangler]  [Modular Mono]
   0.6        0.82*         0.75

Recommended: Strangler Fig pattern

---

## Phase 4: EVALUATE

### Decision Matrix
[Table comparing options]

Recommendation: Strangler Fig (confidence: 0.82)

### Adversarial Critique
Assumptions: Team has service boundary expertise...
Devil's advocate: Modular monolith achieves 80% of benefits at 20% risk...
Stress test: PASSED WITH CAVEATS

---

## Phase 5: COMMIT

### Ulysses Protocol
Commitments:
1. No new service without clear domain boundary (enforced by ADR requirement)
2. Shared observability before any extraction (blocked in CI)
...

Safeguards:
- Kill switch: If mean-time-to-recovery exceeds 2x baseline, pause extractions
...

---

## Executive Summary

Recommend Strangler Fig pattern with strict domain boundary discipline.
Key safeguard: Observability-first extraction with kill switch at 2x MTTR.

Session ID: abc123 (resume with /think --import abc123)
```

---

## Related Commands

| Command | Purpose | Output |
|---------|---------|--------|
| `/problem-solve <problem>` | Decision analysis | Decision + Ulysses Protocol |
| `/plan --problem-solve <task>` | Requirements planning | Spec + RA tags for domain lanes |

**Rule of thumb:**
- Use `/problem-solve` to decide **IF** you should do something
- Use `/plan --problem-solve` to define **WHAT** and **HOW** before implementing

---

## Persist Analysis (MANDATORY)

After completing the analysis, persist for future reference.

### Step 1: Create Cognition Directory

```bash
mkdir -p .claude/cognition
```

### Step 2: Generate Summary File

Create file at `.claude/cognition/YYYYMMDD-HHMM-<slug>.md` where:
- YYYYMMDD = current date (no dashes)
- HHMM = current time
- slug = first 30 chars of topic, kebab-cased

**File Template**:
```markdown
# ProblemSolve: [Topic]

**Date**: YYYY-MM-DD HH:MM
**Session ID**: <sessionId from cognition-mcp>
**Command**: /problem-solve

## Executive Summary

[2-3 sentence summary of key insight/decision from the analysis]

## Key Findings

- [Finding 1]
- [Finding 2]
- [Finding 3]

## Decision/Recommendation

[Main takeaway or decision]

## Recovery

To resume full analysis:
```
/think --import <sessionId>
```
```

### Step 3: Write Workshop Entry

```bash
workshop --workspace .claude/memory note \
  "/problem-solve: [Topic] - [Key decision]. Session: <sessionId>. File: .claude/cognition/<filename>" \
  -t problem-solve -t cognition
```

### Step 4: Confirm to User

Output:
```
---
Analysis persisted:
  File: .claude/cognition/YYYYMMDD-HHMM-slug.md
  Workshop: Tagged with problem-solve, cognition
  Recovery: /think --import <sessionId>
---
```

### Error Handling

If file write or Workshop command fails:
- Display warning: "Warning: Could not persist analysis. Analysis shown above is still valid."
- Continue normally - do NOT halt the command

---

_See also: `guide-think-complex.md` for pipeline theory, `think.md` for individual operations, `plan.md` Section 0.2 for planning-adapted pipeline_
