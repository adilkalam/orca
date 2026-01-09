---
description: Automated 8-step complex problem pipeline - runs full ORIENT→ANTICIPATE→GENERATE→EVALUATE→COMMIT cycle
argument-hint: <complex problem or decision>
---

# /deepthink - Complex Problem Pipeline (Automated)

**YOUR ROLE**: Execute the FULL 8-step complex problem pipeline automatically, making multiple calls to `mcp__cognition-mcp__cognition` in sequence. Each phase builds on the previous. This is NOT a recommendation engine - you EXECUTE each step.

**Problem**: $ARGUMENTS

---

## If --help or empty arguments

Display this reference and stop:

```
/deepthink - Automated Complex Problem Pipeline

Runs the full 8-step ORIENT→ANTICIPATE→GENERATE→EVALUATE→COMMIT cycle.

USAGE:
  /deepthink <complex problem or decision>
  /deepthink --quick <problem>    (3-step: systems → decide → challenge)
  /deepthink --risk <problem>     (4-step: systems → pre-mortem → causal → meta)
  /deepthink --strategic <problem> (5-step: systems → pre-mortem → tree → decide → ulysses)
  /deepthink --incident <problem>  (3-step: ooda → debug → meta)
  /deepthink --help

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
  /deepthink Should we migrate from monolith to microservices?
  /deepthink --quick Which database: PostgreSQL vs MongoDB?
  /deepthink --risk Launching new payment system
  /deepthink --strategic 3-year platform modernization
  /deepthink --incident Production outage on checkout flow
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

## Phase 1: ORIENT - Understand the Landscape

### Step 1.1: Orchestration Assessment

Call `mcp__cognition-mcp__cognition`:

```typescript
{
  operation: "orchestration_suggest",
  sessionTitle: "DeepThink: <problem summary>",
  sessionTags: ["deepthink", "complex-problem"],
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
    process: "DeepThink 8-step complex problem pipeline",
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

---

## Final Output Format

After completing all phases, present a unified summary:

```
# DeepThink Analysis: [Problem Summary]

## Executive Summary
[2-3 sentence summary of recommendation and key insight]

## The Journey

### Phase 1: ORIENT
[Brief systems map summary]

### Phase 2: ANTICIPATE
[Key risks identified]

### Phase 3: GENERATE
[Options considered, best path]

### Phase 4: EVALUATE
[Decision with confidence level]
[Stress test result]

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

---
*Analysis completed via DeepThink 8-step pipeline*
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

**Input**: `/deepthink Should we migrate from monolith to microservices?`

**Output Flow**:

```
# DeepThink: Monolith to Microservices Migration

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
| `/deepthink <problem>` | Decision analysis | Decision + Ulysses Protocol |
| `/plan --deepthink <task>` | Requirements planning | Spec + RA tags for domain lanes |

**Rule of thumb:**
- Use `/deepthink` to decide **IF** you should do something
- Use `/plan --deepthink` to define **WHAT** and **HOW** before implementing

---

_See also: `guide-think-complex.md` for pipeline theory, `think.md` for individual operations, `plan.md` Section 0.2 for planning-adapted pipeline_
