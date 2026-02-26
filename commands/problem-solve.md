---
description: Convergent 8-step decision pipeline (ORIENT->ANTICIPATE->GENERATE->EVALUATE->COMMIT)
argument-hint: <complex problem or decision>
---

# /problem-solve - Convergent 8-Step Decision Pipeline

**YOUR ROLE**: Execute the FULL 8-step pipeline automatically, making multiple cognition MCP calls in sequence. Each phase builds on the previous. You EXECUTE each step, not recommend.

**Problem**: $ARGUMENTS

---

## If --help or empty arguments

Display this reference and stop:

```
/problem-solve - Automated Complex Problem Pipeline

USAGE:
  /problem-solve <problem>
  /problem-solve --quick <problem>    (systems -> decide -> challenge, no self-observation)
  /problem-solve --risk <problem>     (systems -> pre-mortem -> causal -> meta)
  /problem-solve --strategic <problem> (systems -> pre-mortem -> tree -> decide -> ulysses)
  /problem-solve --incident <problem>  (ooda -> debug -> meta)

FULL PIPELINE: orchestrate -> systems -> pre-mortem -> tree -> decide -> challenge -> pre-mortem-gate -> ulysses -> meta
```

---

## Phase 0: Parse & Select Pipeline

| Flag | Steps |
|------|-------|
| (none) | All 8 + pre-mortem gate |
| --quick | systems, decide, challenge (no checkpoints, no meta, no ulysses, no pre-mortem gate) |
| --risk | systems, pre-mortem, causal_analysis, pre-mortem gate, meta |
| --strategic | systems, pre-mortem, tree, decide+challenge, pre-mortem gate, ulysses |
| --incident | ooda, debug, pre-mortem gate, meta |

Include `verbose: false` in every cognition MCP call.

### --quick Self-Observation Bypass

When `--quick` is active, skip the following across all phases:
- **No checkpoint gate checks** -- run steps directly without gate evaluation
- **No meta step** (Phase 5 Step 5.2) -- skip process reflection
- **No ulysses protocol** (Phase 5 Step 5.1) -- skip precommitment
- **No pre-mortem gate** (Phase 4.5) -- skip post-decision pre-mortem
- **No orchestration_suggest** (Phase 1 Step 1.1) -- jump straight to systems mapping
- Run inline: systems map -> decide -> adversarial challenge -> harvest
- Output uses the Quick Output Format (no "What the Protocol Caught" table)

### Quick Output Format (--quick only)

```
# ProblemSolve: [Problem Summary]

## The Decision
**[Decision statement]** (confidence: X.X)
[2-3 sentences: problem framing, initial instinct, what analysis showed,
why this choice.]

## Where to Go Next
-> /deepthink "[uncertainty]"
   _[why this needs adversarial exploration]_
-> /plan "[implementation task]"
   _[if ready to implement]_
-> /think "[open question]"
   _[if something needs investigation first]_
```

## Phase 0.5: SCOPE

Before ORIENT, enumerate ALL components the SYMPTOM could touch:
1. What is the SYMPTOM?
2. What components could POSSIBLY cause it? (ALL, including destination)
3. Where does control flow NEXT after success?

Verify at least one claim empirically if possible.

---

## Phase 1: ORIENT

### Step 1.1: Orchestration

Call cognition `operation: "orchestration_suggest"` with: task, complexity, suggestedOperations (each with operation/reason/order), alternativeApproaches, recommendation. Register command:

```typescript
{ operation: "checkpoint", sessionId: "<id>", content: { command: "problem-solve", phase: "orient" } }
```

### Step 1.2: Systems Mapping

Call cognition `operation: "systems"` with: system, components[{name, function}], relationships[{from, to, type}], feedbackLoops, keyLeveragePoints.

Present ASCII diagram. Then run **Gate 1** checkpoint:

```typescript
{
  operation: "checkpoint", sessionId: "<id>",
  content: {
    phase: "orient",
    summary: "<systems map summary>",
    keyFindings: ["<key components>", "<leverage points>"],
    gateCheck: { selfCheckPassed: true, depthGatePassed: true },
    addConstraints: [
      { type: "FORWARD", text: "<gap to explore>" }
    ]
  }
}
```

Gate 1 criteria: Full path in map? Verified an assumption? Destination component included?

---

## Phase 2: ANTICIPATE

Call cognition `operation: "mental_model"` with: modelName "pre-mortem", problem, setup ("This failed. What happened?"), steps (3-5 failure modes), rootCauses[{failure, cause, preventable}], conclusion.

Then run **Gate 2** checkpoint with gateCheck. Gate criteria: Failure modes trace to systems map? Specific (not generic)? At least one non-obvious?

---

## Phase 3: GENERATE

Call cognition `operation: "tree_of_thought"` with: problem, constraints (from systems + pre-mortem), branches[{id, thought, evaluation: {score, strengths, weaknesses, feasibility}}], bestPath, pruned, synthesis.

Present option tree. Then run **Gate 3** checkpoint. Gate criteria: Options address failure modes? 2+ meaningfully different options? Pruned with explanations?

---

## Phase 4: EVALUATE

### Step 4.1: Decision

Call cognition `operation: "decide"` with: statement, options[{name, description, pros, cons}], criteria, weights (sum to 1.0), analysis, scores, choice, confidence.

### Step 4.2: Adversarial Challenge (inline, no MCP call)

Present: decision matrix table, assumptions, what could go wrong (link to pre-mortem), devil's advocate argument, blind spots, stress test result (PASSED/CAVEATS/NEEDS REVISION).

Then run **Gate 4** checkpoint. Gate criteria: Genuine weakness found? Confidence justified? Alternative interpretation considered? If HARD FAIL, return to GENERATE.

---


## Phase 4.5: PRE-MORTEM GATE

After EVALUATE selects the top option and runs adversarial challenge, stress-test the decision before committing.

### Step 4.5.1: Pre-Mortem Analysis

Call cognition `operation: "mental_model"` with:

```typescript
{
  operation: "mental_model",
  sessionId: "<id>",
  content: {
    modelName: "pre-mortem",
    problem: "<the selected option from EVALUATE>",
    setup: "This decision was implemented. Six months later it failed. What happened?",
    steps: ["<failure mode 1 tied to systems map>", "<failure mode 2 tied to systems map>", "<failure mode 3 tied to systems map>"],
    rootCauses: [
      { failure: "<failure 1>", cause: "<root cause>", preventable: true },
      { failure: "<failure 2>", cause: "<root cause>", preventable: true },
      { failure: "<failure 3>", cause: "<root cause>", preventable: false }
    ],
    conclusion: "<whether any failure mode is severe enough to change the EVALUATE ranking>"
  }
}
```

### Step 4.5.2: Gate Logic

- If **no failure mode changes ranking**: Proceed to COMMIT. Failure modes become safeguards in the Ulysses Protocol.
- If a failure mode **DOES change ranking**: Return to EVALUATE Step 4.1 with the pre-mortem findings as additional input. Re-score options.

### Step 4.5.3: Pre-Mortem Checkpoint

```typescript
{
  operation: "checkpoint",
  sessionId: "<id>",
  content: {
    phase: "pre-mortem-gate",
    summary: "<pre-mortem summary>",
    keyFindings: ["<failure mode 1>", "<failure mode 2>"],
    gateCheck: {
      selfCheckPassed: true,
      depthGatePassed: true,  // false if ranking changed
      notes: "<whether ranking changed and what action was taken>"
    }
  }
}
```

Gate criteria: Failure modes reference systems map? Specific (not generic)? At least one non-obvious? If ranking changed, EVALUATE re-ran with pre-mortem input?

---

## Phase 5: COMMIT

### Step 5.1: Ulysses Protocol

Call cognition `operation: "ulysses_protocol"` with: goal, temptations[{trigger, temptation, risk}], commitments[{commitment, enforcement, consequences}], safeguards[{safeguard, trigger, linkedRisk}], reviewPoints, accountability, escapeHatch.

### Step 5.2: Process Reflection

Call cognition `operation: "meta"` with: process, observations, adjustments, effectiveness, insights. Set nextThoughtNeeded: false.

---

## Phase 6: HARVEST

Call checkpoint with `phase: "harvest"` for auto-persist:

```typescript
{
  operation: "checkpoint", sessionId: "<id>",
  projectPath: "<absolute project path>",
  content: {
    phase: "harvest",
    summary: "<executive summary of decision + rationale>",
    keyFindings: ["<key risk>", "<key decision>", "<key safeguard>"],
    openQuestions: ["<remaining uncertainty>"],
    nextSteps: ["<implementation step>"],
    followUpQuestions: [
      {
        question: "<specific follow-up based on findings>",
        command: "/deepthink",
        rationale: "<why this needs adversarial testing>"
      },
      {
        question: "<specific follow-up based on findings>",
        command: "/think",
        rationale: "<why this needs investigation>"
      }
    ]
  }
}
```

Response includes `autoPersist: { persisted: true, file: "<path>" }`.

### Workshop Entry

```bash
workshop --workspace .claude/memory note \
  "/problem-solve: [Topic] - [Decision]. Session: <sessionId>. File: <autoPersist.file>" \
  -t problem-solve -t cognition
```

If workshop fails, display warning and continue.

---

## Final Output Format

The output is decision-first. The reader gets the answer immediately, then supporting evidence. This reflects convergent thinking: narrow toward commitment, not expand toward synthesis.

```
# ProblemSolve: [Problem Summary]

## The Decision
**[Decision statement]** (confidence: X.X)

The problem was [1-2 sentence framing]. Initial instinct said [gut reaction].
[2-3 sentences: decision arc -- what the analysis revealed that confirmed,
redirected, or complicated the instinct. Where the reasoning turned. Include
what would change the verdict.]

## Why Not the Alternatives
- **[Option B]** ([what it was]): eliminated because [reason from ANTICIPATE/GENERATE/EVALUATE]
- **[Option C]** ([what it was]): eliminated because [reason]

## What Tried to Kill It
- "[risk from pre-mortem]" --> [stress test mechanism] --> [survived because / adapted by]
- "[adversarial challenge]" --> [gate that caught it] --> [how decision adapted]

## Safeguards
[From ulysses protocol -- specific commitments to prevent identified failures]

## Where to Go Next
-> /deepthink "[uncertainty needing exploration]"
   _[why this needs adversarial testing]_
-> /plan "[implementation task]"
   _[if ready to implement]_
-> /think "[open question]"
   _[why this needs investigation]_
```

---

## Critical Requirements

1. **EXECUTE, don't recommend** -- run each phase automatically
2. **Maintain session** via sessionId throughout
3. **Build on previous** -- each phase references earlier insights
4. **Present progressively** -- show output after each phase
5. **Link risks to safeguards** -- pre-mortem risks inform ulysses directly

---

## Operation Field Hints

<!-- SCHEMA_HINTS_START -->
**Operation schemas (TS-lite notation: ? = optional, [] = array):**

```
## orchestration_suggest
{ task: string, complexity: 'simple' | 'medium' | 'complex',
  suggestedOperations: {operation: string, reason: string, order: number}[],
  alternativeApproaches: {approach: string, tradeoffs: string}[],
  recommendation: string }

## systems
{ system?: string, components?: {name: string, function: string}[],
  relationships?: {from: string, to: string, type: string}[],
  feedbackLoops?: string[] }
# NOTE: feedbackLoops objects auto-coerced to strings

## mental_model
{ modelName?: string, problem?: string, steps?: string[], reasoning?: string,
  conclusion?: string, setup?: string,
  rootCauses?: {failure: string, cause: string, preventable: boolean}[] }
# NOTE: all fields optional

## tree_of_thought
{ branches: {id: string, thought: string, evaluation?: string | {score?: number, strengths?: string[], weaknesses?: string[], feasibility?: string}, score?: number}[],
  bestPath: string[], pruned: string[], root?: string, synthesis?: string }

## decide
{ statement: string,
  options: {name: string, description: string, pros?: string[], cons?: string[]}[],
  criteria: string[], analysis: string, choice: string,
  weights?: Record<string, number>, scores?: Record<string, number>,
  confidence?: number }

## ulysses_protocol
{ goal: string,
  temptations: {trigger: string, temptation: string, risk: string}[],
  commitments: {commitment: string, enforcement: string, consequences: string}[],
  safeguards: {safeguard: string, trigger: string, linkedRisk?: string}[],
  escapeHatch?: string, reviewPoints?: {milestone: string, criteria: string}[] }

## meta
{ process?: string, observations?: string[], adjustments?: string[],
  effectiveness?: number, insights?: string, nextThoughtNeeded?: boolean }
# NOTE: insights is string, not string[] -- string[] auto-coerced to joined string

## checkpoint
{ summary?: string, keyFindings?: string[], phase?: string, command?: string,
  addConstraints?: {type: 'FORWARD'|'FORBIDDEN'|'QUESTION', text: string}[],
  gateCheck?: {selfCheckPassed: boolean, depthGatePassed: boolean, notes?: string} }
```
<!-- SCHEMA_HINTS_END -->

---

_See also: `guide-think-complex.md`, `think.md`, `plan.md` Section 0.2_
