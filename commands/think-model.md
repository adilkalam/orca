---
description: Apply a named mental model to a problem via cognition-mcp
argument-hint: "<model> <problem> | --list | --help"
allowed-tools:
  - mcp__cognition-mcp__cognition
  - Read
  - Write
  - Bash
---

# /think-model - Mental Model Application

**YOUR ROLE**: Apply a structured mental model to a problem. Read the model template from `quick-reference/thinking-models/<model>.md`, follow its process, and store the result via `mcp__cognition-mcp__cognition` `operation: "mental_model"`.

**Input**: $ARGUMENTS

---

## If --help, --list, or empty arguments

Display this reference and stop:

```
/think-model - Mental Model Application (cognition-mcp)

USAGE:
  /think-model <model-name> <problem>
  /think-model --list
  /think-model --help

AVAILABLE MODELS:

  Debugging & Validation
    five-whys              Root cause drilling through iterative "why"
    rubber-duck            Explain step-by-step to clarify thinking
    assumption-surfacing   Identify and test hidden assumptions

  Estimation
    fermi-estimation       Order-of-magnitude reasoning for unknowns

  Architecture & Design
    abstraction-laddering  Move up/down abstraction levels
    decomposition          Break down complexity into tractable pieces
    constraint-relaxation  "What if X wasn't a constraint?"
    first-principles       Break to fundamentals, rebuild from there

  Decision Making
    steelmanning           Strongest opposing arguments before deciding
    opportunity-cost       Explicit cost framing of alternatives
    trade-off-matrix       Multi-criteria decision analysis
    time-horizon-shifting  Analyze across time scales
    reversibility          One-way vs two-way door classification

  Planning & Risk
    inversion              Work backwards from failure scenarios
    pre-mortem             Imagine failure, trace causes proactively
    second-order-effects   Trace consequences of consequences

  Adversarial
    red-team               Attack the proposal from an adversary's perspective

  Prioritization
    impact-effort-grid     2x2 prioritization matrix

EXAMPLES:
  /think-model pre-mortem Migrating monolith to microservices
  /think-model five-whys Why are CI builds flaky?
  /think-model red-team Our new auth flow
  /think-model reversibility Should we rewrite this service?
  /think-model inversion How could this migration fail?
  /think-model first-principles Rethinking the pricing model
  /think-model trade-off-matrix Choosing between Postgres and DynamoDB
  /think-model second-order-effects Introducing a weekly no-meeting policy

RELATED:
  /think           Constraint chain exploration with mode selection
  /deepthink             Adversarial pre-mortem exploration
  /problem-solve         Convergent decision pipeline
```

---

## Core Concept: Template-Driven Application

The cognition-mcp stores and echoes; the REASONING is yours. For `/think-model`, the reasoning is SHAPED by the template file that defines the model's process.

```
Claude reads:   quick-reference/thinking-models/<model>.md
Claude applies: the template's "Process" steps to the user's problem
Claude sends:   { operation: "mental_model", modelName, problem, steps, reasoning, conclusion }
MCP returns:    echo (unchanged) + persistence metadata
```

**Verbose flag**: Include `verbose: true` in the cognition call. This is a single-call command, so the echo IS the output.

---

## Phase 0: Parse Arguments

1. **First token** = model name (normalize to lowercase, strip leading `--`).
2. **Remaining tokens** = the problem statement.
3. If model name is missing, `--help`, or `--list`: show the reference above and stop.
4. If model name is unrecognized: print "Unknown model: <name>" and show the AVAILABLE MODELS list, then stop.

**Recognized model names** (must match file basenames in `quick-reference/thinking-models/`):

```
abstraction-laddering, assumption-surfacing, constraint-relaxation,
decomposition, fermi-estimation, first-principles, five-whys,
impact-effort-grid, inversion, opportunity-cost, pre-mortem,
red-team, reversibility, rubber-duck, second-order-effects,
steelmanning, time-horizon-shifting, trade-off-matrix
```

---

## Phase 1: Load Template

Resolve the template path (try project-local first, then deployed global):

1. `{$PWD}/quick-reference/thinking-models/<model>.md`
2. `~/.claude/quick-reference/thinking-models/<model>.md`

Read the file. Extract:
- **When to Use** — confirm the problem fits (note any mismatch, but proceed).
- **Process** — the numbered steps become the `steps` array.
- **Key Principle** — frame the reasoning.
- **Example Application** — inspiration for how to structure the applied analysis.
- **Common Mistakes / Anti-patterns** — avoid these in your reasoning.

If the file cannot be read from either location, print "Template not found: <model>.md" and stop.

---

## Phase 2: Apply the Model

Call `mcp__cognition-mcp__cognition`:

```typescript
{
  operation: "mental_model",
  sessionTitle: "Model (<model>): <short problem summary>",
  sessionTags: ["think-model", "<model>"],
  verbose: true,
  content: {
    modelName: "<model>",
    problem: "<the user's problem verbatim or lightly cleaned>",
    steps: [
      "<step 1 from template's Process section>",
      "<step 2>",
      "<step 3>"
    ],
    reasoning: "<detailed reasoning that walks through each step applied to THIS problem -- not an abstract description of the model, but the model applied>",
    conclusion: "<the key insight or recommendation produced by the model>",
    nextThoughtNeeded: false
  }
}
```

**Schema notes** (all fields optional per MCP):
- `modelName` is required semantically, even if schema permits omission.
- `steps` should reflect the template, adapted for the specific problem.
- `reasoning` is the substantive content — this is where the model does its work.
- `conclusion` must be actionable or directional, not abstract.

---

## Phase 3: Present Results

Render as clean markdown (not raw JSON). Extract the stored content and present:

```
# Model: <model-name> | <Topic>

## Problem
<one-line framing>

## Process Applied
1. <step 1, adapted>
2. <step 2, adapted>
3. <step 3, adapted>

## Reasoning
<the applied analysis, following the template's structure>

## Conclusion
<key insight, recommendation, or classification the model produced>

## Where to Go Next
-> /think "<follow-up that needs constraint chain exploration>"
   _[why this needs structured multi-mode exploration]_
-> /deepthink "<deeper question>"
   _[if the conclusion needs adversarial stress-testing]_
-> /problem-solve "<decision point>"
   _[if ready to commit to a course of action]_
```

**No protocol vocabulary** in user-facing output. Lead with findings, not with "the model says".

---

## Phase 4: Persist

### Daily Log

Append to `.orca/cognition/YYYYMMDD-daily.md`:

```markdown
---
### [HH:MM] /think-model <model> - [Topic slug]
Session: <sessionId>

[1-2 sentence summary of the conclusion]
---
```

### Workshop Entry

```bash
workshop --workspace .claude/memory note \
  "/think-model <model>: [Topic] - [Conclusion]. Session: <sessionId>" \
  -t think-model -t <model> -t cognition
```

### Confirm to User

```
---
Analysis persisted:
  Model: <model-name>
  Session: <sessionId>
  Workshop: Tagged with think-model, <model>, cognition
---
```

### Error Handling

If persistence fails, display a warning and continue — do NOT halt.
