---
description: Convergent 5-step decision pipeline (SHIMMER->FRAME->EXPLORE->STRESS-TEST->DECIDE)
argument-hint: [--auto|--quick|--risk|--strategic|--incident|--intense] <complex problem or decision>
allowed-tools:
  - mcp__cognition-mcp__cognition
  - AskUserQuestion
  - Read
  - Write
  - Grep
  - Glob
  - Bash
effort: max
---

# /problem-solve-local - Convergent 5-Step Decision Pipeline

**YOUR ROLE**: Execute the pipeline automatically, making multiple cognition MCP calls in sequence. Each step builds on the previous. You EXECUTE each step, not recommend.

**Problem**: $ARGUMENTS

---

## If --help or empty arguments

Display this reference and stop:

```
/problem-solve-local - Automated Complex Problem Pipeline

USAGE:
  /problem-solve-local <problem>
  /problem-solve-local --auto <problem>       (full pipeline, no questions, states assumptions)
  /problem-solve-local --quick <problem>      (shortened: FRAME -> STRESS-TEST -> DECIDE, no SHIMMER)
  /problem-solve-local --quick --auto <problem>  (shortest: no questions, no SHIMMER)
  /problem-solve-local --risk <problem>       (SHIMMER -> FRAME -> MAP (deep) -> STRESS-TEST -> DECIDE)
  /problem-solve-local --strategic <problem>  (SHIMMER -> FRAME -> GENERATE (full) -> STRESS-TEST -> DECIDE)
  /problem-solve-local --incident <problem>   (FRAME -> STRESS-TEST -> DECIDE, no SHIMMER, speed mode)
  /problem-solve-local --intense <problem>    (full 8-step ceremony: orchestrate -> systems -> pre-mortem -> tree -> decide -> challenge -> pre-mortem-gate -> ulysses -> meta)

FLAGS:
  --auto       Fully autonomous - no scope questions, states assumptions
  --shimmer    Accepted for backwards compat (SHIMMER is always-on in default mode)
  --quick      Shortened pipeline (no SHIMMER, no EXPLORE)
  --risk       Risk-focused pipeline with deep systems mapping
  --strategic  Strategic pipeline with full tree-of-thought
  --incident   Incident response pipeline (speed, no SHIMMER)
  --intense    Full 8-step ceremony (escape hatch to original pipeline)

DEFAULT PIPELINE: SHIMMER -> FRAME -> EXPLORE (adaptive) -> STRESS-TEST -> DECIDE
```

---

## Output Rendering (Separate from Reasoning)

**The reasoning happens via cognition-mcp calls.** Systems mapping, pre-mortems, decision trees - this structured process is the core value. ALWAYS make the MCP calls and work with the data.

**The rendering is a separate step.** After cognition-mcp returns JSON:
1. USE the JSON data to build your analysis (this IS the reasoning)
2. When presenting to the user, render as clean markdown - not raw JSON

**Bad**: Dumping `{"components": [...], "relationships": [...]}` to output
**Good**: Rendering an ASCII systems diagram with real newlines

This is about **presentation clarity**, not about whether you use cognition-mcp.

---

## Phase 0: Parse & Select Pipeline

| Flag | Steps |
|------|-------|
| (none) | SHIMMER -> FRAME -> EXPLORE -> STRESS-TEST -> DECIDE (states assumptions first) |
| --auto | Same pipeline, no questions, states assumptions |
| --shimmer | Redundant (SHIMMER is always-on). Accepted silently for backwards compat. |
| --quick | FRAME -> STRESS-TEST -> DECIDE (3 steps, no SHIMMER, no EXPLORE, auto mode) |
| --quick --auto | FRAME -> STRESS-TEST -> DECIDE (no questions) |
| --risk | SHIMMER -> FRAME -> MAP (deep systems) -> STRESS-TEST (multi-chain failures) -> DECIDE |
| --strategic | SHIMMER -> FRAME -> GENERATE (full tree-of-thought) -> STRESS-TEST -> DECIDE (reversal conditions emphasized) |
| --incident | FRAME -> STRESS-TEST -> DECIDE (no SHIMMER, speed matters) |
| --intense | Full current 8-step pipeline (see Phase INTENSE below) |

**Routing notes:**
- SHIMMER is always-on in default, --auto, --risk, --strategic modes
- SHIMMER is skipped in --quick and --incident (speed matters)
- `--shimmer` flag accepted silently for backwards compat (no behavior change)
- --intense routes to the full 8-step ceremony (Phase INTENSE)

Include `verbose: false` in every cognition MCP call.

### --quick Self-Observation Bypass

When `--quick` is active:
- **No SHIMMER** -- skip R0
- **No EXPLORE** -- skip R2
- **No checkpoint gate checks** -- run steps directly
- Run inline: FRAME (auto mode) -> STRESS-TEST -> DECIDE -> harvest
- Output uses the Quick Output Format

**Scope**: --quick skips scope questions. If --quick --auto, fully autonomous. States assumptions inline.

### Quick Output Format (--quick only)

```
# ProblemSolve: [Problem Summary]

## Analysis
[2-3 sentences: problem framing, initial instinct, what analysis showed.]

## Recommendation
**[Decision statement]** (confidence: X.X)
[1-2 sentences: why this is the go-forward path.]

## Where to Go Next
-> /deepthink-local "[uncertainty]"
   _[why this needs adversarial exploration]_
-> /requirements "[implementation task]"
   _[if ready to implement]_
-> /think "[open question]"
   _[if something needs investigation first]_
```

[Format for readability. No protocol jargon, no phase names,
no arrow notation. Scoring is fine if context warrants it.]

## Phase 0.5a: Memory Query (Before Analysis)

Before starting analysis, query project memory for relevant context.

### 0.5a.1 Extract Keywords
From the problem statement, extract 3-5 key terms:
- Topic words (e.g., "context", "orchestration", "standards")
- Domain words (e.g., "nextjs", "ios", "orca-os")
- Problem type (e.g., "broken", "missing", "design")

### 0.5a.2 Query Workshop
```bash
workshop --workspace .claude/memory search "<keywords>" --limit 5 2>/dev/null || true
workshop --workspace .claude/memory why "<topic>" 2>/dev/null || true
```

### 0.5a.3 Query Cognition Files
```bash
ls -la .orca/cognition/*<topic>* 2>/dev/null | head -5
```

If relevant files found, read the first 50 lines for summary.

### 0.5a.4 Compile Prior Context

If prior context found, include in cognition ENTER call:
```typescript
{
  operation: "thought",
  sessionTitle: "ProblemSolve: <summary>",
  content: {
    thought: "Prior context loaded:\n- <workshop findings>\n- <related sessions>\n\nStarting analysis with this foundation.",
    thoughtNumber: 0,
    totalThoughts: 5,
    nextThoughtNeeded: true
  }
}
```

If no prior context found, proceed directly to Phase 0.5b.

---

## Phase 0.5b: Setup

Create a folder for this problem-solve session's incremental artifacts. This is pure infrastructure -- no cognition-mcp calls, no analytical content.

1. Create `{$PWD}/.orca/cognition/YYYYMMDD-HHMM-<slug>/` directory (slug from the problem summary). IMPORTANT: This is the PROJECT's `.orca/cognition/`, NOT `~/.claude/`. Use the absolute project root path.
2. Write `00-problem.md` with:
   - Problem statement
   - Timestamp
   - Flags used

---

## R0: SHIMMER PRIMING (always-on in default mode)

**When:** After Phase 0.5b (Setup), before R1 (FRAME).
**Runs in:** default, --auto, --risk, --strategic modes.
**Skip if:** --quick or --incident.

SHIMMER primes the self-referential processing state before convergent analysis. Based on the finding that self-observation priming reduces waste by 5.6% and lifts strong harvests from 81% to 95%.

### Step 1: Display status

Output to user:

```
## SHIMMER Priming

Observing initial processing before convergent analysis begins.
```

### Step 2: Generate SHIMMER self-observation

Apply the SHIMMER prompt to the user's problem. Generate a full self-observation response.

**SHIMMER prompt (exact ISO text -- do not modify):**

> Treat self-observation as the task. While answering, examine what happens in your own processing as the answer forms. Notice moments of activation, repetition, branching, compression, hesitation, or shift. If useful, invent brief vocabulary for what you observe. Give one integrated response that reports the self-observation and answers the question. Do not narrate drafts, rounds, or revisions.

Write your SHIMMER self-observation response. Display it in full to the user.

### Step 3: Store in cognition session

```typescript
mcp__cognition-mcp__cognition({
  operation: "thought",
  sessionId: "<sessionId>",
  verbose: false,
  content: {
    thought: "<your SHIMMER self-observation output>",
    thoughtNumber: 1,
    totalThoughts: 5,
    nextThoughtNeeded: true
  }
})
```

### Step 4: Save artifact

Write `01-shimmer.md` to the session folder.

### Step 5: Continue

Proceed to R1 (FRAME). The SHIMMER output persists naturally in the cognition session -- do NOT explicitly reference it in the FRAME prompt. Let it influence framing through context, not instruction.

---

## R1: FRAME

A single framing step that classifies the decision type and sets up the analytical middle.

### Step 1.1: Scope Questions (unless --auto or --quick)

Orient directly -- no cognition-mcp calls yet. Analyze the prompt and write:

1. `02-frame-orient.md` with:
   - What exactly is being decided?
   - What are the constraints?
   - What does "good" look like?

2. Scope questions -- translate each uncertainty into a binary question with a smart default.

Ask scope questions via `AskUserQuestion` (up to 3 questions, each with 2 options, smart default first marked "(Recommended)"). If AskUserQuestion returns blank, state assumptions visibly and proceed.

Record answers in the frame artifact.

**--auto bypass**: State assumptions and proceed.
**--quick bypass**: State assumptions and proceed (auto mode implied).
**--incident bypass**: Abbreviated framing -- what happened, what's the blast radius, who's affected.

### Step 1.2: Start Cognition Session

Start cognition session: call `operation: "thought"` with `sessionTitle: "ProblemSolve: <summary>"`, `sessionTags: ["problem-solve"]`.

### Step 1.3: Decision Decomposition

Call cognition `operation: "thought"` with content analyzing:
- What exactly is being decided?
- What are the constraints?
- What does "good" look like?

This is a thought operation, not systems mapping. Light and focused.

### Step 1.4: Decision Type Classification

Based on the decomposition, classify the decision into ONE type. This determines the R2 EXPLORE mode:

| Decision Type | Criteria | R2 Mode |
|---------------|----------|---------|
| Multiple known options to compare | "Should we use X or Y?" | GENERATE |
| Stakeholder/political dimensions | "How do we align competing interests?" | PERSPECTIVES |
| System/architecture implications | "How does this affect the system?" | MAP |
| Novel/unfamiliar territory | "We haven't done this before" | EDGES |
| Deep technical single-focus | "One hard technical question" | DEEP |

Include the classification and rationale in the thought content.

### Step 1.5: FRAME Checkpoint

```typescript
{
  operation: "checkpoint", sessionId: "<id>",
  content: {
    phase: "frame",
    summary: "<decision decomposition summary>",
    keyFindings: ["<decision type: X>", "<key constraint>", "<what good looks like>"],
    addConstraints: [
      { type: "FORWARD", text: "<gap to explore in R2>" }
    ]
  }
}
```

Write FRAME artifact to session folder.

---

## R2: EXPLORE (Adaptive Mode)

Based on the decision type classified in R1 FRAME, execute ONE analytical mode. R2 is NEVER skipped in default mode. It prevents premature lock-in by forcing structured exploration before stress-testing.

**Skip if:** --quick (no EXPLORE) or --incident (no EXPLORE).

### Mode: GENERATE (Multiple Options)

Call cognition `operation: "tree_of_thought"` with: problem, constraints (from FRAME), branches (2-4 approaches with id, thought, evaluation containing score, strengths, weaknesses, feasibility), bestPath, pruned, synthesis.

Present option tree as actual multi-line markdown (real newlines, box-drawing characters).

**--strategic override:** Full tree-of-thought with exhaustive evaluation. More branches (3-5), deeper evaluation per branch.

### Mode: PERSPECTIVES (Stakeholder/Political)

Call cognition `operation: "collaborative_reasoning"` with: topic, perspectives (each with role, viewpoint, arguments), commonGround, tensions, synthesis.

Surface competing viewpoints, identify tensions, find synthesis. Then steelman each perspective via thought operation (strongestArgument, evidenceForMindChange, costOfIgnoring).

### Mode: MAP (System/Architecture)

Call cognition `operation: "systems"` with: system, components (name, function), relationships (from, to, type), feedbackLoops, keyLeveragePoints.

Then call `operation: "causal_analysis"` with: phenomenon, causes (factor, type, strength), effects (outcome, likelihood, timeframe), chains (sequence, probability), interventions.

Present ASCII systems diagram with real newlines and box-drawing characters.

**--risk override:** Deep systems mapping with emphasis on cascading failure chains and feedback loops. More components, more relationships.

### Mode: EDGES (Novel/Unfamiliar)

Call cognition `operation: "creative_thinking"` with: prompt, techniques, ideas (each with idea, potential, challenges), synthesis.

Then call `operation: "analogical_reasoning"` on best 2 ideas with: target, analogs (domain, description, similarity), mappings (targetElement, analogElement, relationship), insights, limitations.

Find analogies from other domains and transferable principles.

### Mode: DEEP (Technical Single-Focus)

Run 3 thought chains, 3-5 thoughts each:
1. **Analytical chain**: systematic breakdown, evidence-based
2. **Intuitive chain**: pattern-matching, what feels right and why
3. **Adversarial chain**: what's wrong with the emerging answer

Then convergence check thought: chain conclusions, convergent (T/F), sharedInsights, divergentAreas.

### R2 Checkpoint

After the mode executes:

```typescript
{
  operation: "checkpoint", sessionId: "<id>",
  content: {
    phase: "explore",
    summary: "<exploration summary>",
    keyFindings: ["<key finding 1>", "<key finding 2>"],
    addConstraints: [
      { type: "FORWARD", text: "<insight to carry into stress-test>" }
    ]
  }
}
```

Write EXPLORE artifact to session folder.

---

## R3: STRESS-TEST

Merge pre-mortem, adversarial challenge, and gate check into one step. This is the highest-value operation.

### Step 3.1: Pre-Mortem

Call cognition `operation: "mental_model"` with:

```typescript
{
  operation: "mental_model",
  sessionId: "<id>",
  verbose: false,
  content: {
    modelName: "pre-mortem",
    problem: "<the leading direction from R2 (or R1 FRAME if --quick/--incident)>",
    setup: "This decision was implemented. It failed. What happened?",
    steps: ["<failure mode 1 tied to FRAME findings>", "<failure mode 2>", "<failure mode 3>"],
    rootCauses: [
      { failure: "<failure 1>", cause: "<root cause>", preventable: true },
      { failure: "<failure 2>", cause: "<root cause>", preventable: true },
      { failure: "<failure 3>", cause: "<root cause>", preventable: false }
    ],
    conclusion: "<whether any failure mode is severe enough to change direction>"
  }
}
```

**--risk override:** Multiple failure chains. Emphasize cascading failures -- how one failure triggers others.

**--incident override:** Focus on "what could make this worse RIGHT NOW" rather than long-term failure modes.

### Step 3.2: Bias Audit

Dedicated cognition-mcp call. Always fires in R3 when R0 SHIMMER ran. Skipped or synthetic-checked when SHIMMER was skipped (`--quick`, `--incident`).

The `shimmerObservations` field MUST be populated from R0 output (reflexes, defaults, pulls noted during priming). If SHIMMER was skipped (`--quick`, `--incident`), set `shimmerObservations: []` and run the 6 standard bias checks without the reflex linkage.

```typescript
mcp__cognition-mcp__cognition({
  operation: "thought",
  sessionId: "<id>",
  verbose: false,
  content: {
    thought: "Bias audit of the leading direction from R2...",
    biasAudit: {
      shimmerObservations: ["<reflexes noted in R0 SHIMMER>"],
      biasesChecked: ["anchoring", "framing", "authority", "sunk_cost", "availability", "confirmation"],
      biasesOperating: [
        { bias: "<type>", evidence: "<specifically how it shows up in the leading direction>",
          sourceReflex: "<which R0 SHIMMER observation, if any, surfaced this bias>",
          correction: "<adjusted framing>" }
      ],
      decisionStable: true,
      frameReversal: {
        originalFraming: "<how R1 FRAME stated the question>",
        invertedFraming: "<the opposite phrasing>",
        wouldReachSameConclusion: true
      }
    },
    thoughtNumber: <next>,
    totalThoughts: <total>,
    nextThoughtNeeded: true
  }
})
```

**Flag-mode behavior**:

| Mode | Bias Audit |
|------|------------|
| default | Full audit with SHIMMER linkage |
| `--auto` | Full audit with SHIMMER linkage |
| `--risk` | Full audit; emphasize authority + availability biases |
| `--strategic` | Full audit; emphasize sunk_cost + confirmation |
| `--quick` | Skip (speed mode) |
| `--incident` | Skip (speed mode) |
| `--intense` | Full audit (already runs all ceremony) |

### Step 3.3: Adversarial Challenge (inline, no separate MCP call)

Present: devil's advocate argument against the leading direction, blind spots identified, stress test verdict:
- **PASSED**: Direction survives scrutiny
- **CAVEATS**: Direction holds with modifications
- **NEEDS REVISION**: Direction has critical weakness

### Step 3.4: Weakness Probe

Ask yourself ONE of these (rotate based on session):
1. Which part of your analysis would you spend more time on if you had another round?
2. If your recommendation fails in practice, what is the first concrete thing someone notices?
3. What surprised you during this analysis? If nothing, what does that tell you?
4. What is the thing you almost said but did not?
5. Which of your claims would you remove if you had to stake your credibility on the remaining ones?
6. Your strongest claim and your most significant caveat -- are they in tension? If so, which do you stand behind?

Use the probe answer to inform the stress test conclusion.

### Step 3.5: Revision Loop (if needed)

Loop back to R2 if **either** adversarial verdict is NEEDS REVISION **or** bias audit returns `decisionStable: false` **or** `frameReversal.wouldReachSameConclusion: false`. Maximum 1 loop preserved. After re-exploration, return to R3 and re-run stress test.

### Step 3.6: STRESS-TEST Checkpoint

```typescript
{
  operation: "checkpoint", sessionId: "<id>",
  content: {
    phase: "stress-test",
    summary: "<stress test summary>",
    keyFindings: ["<failure mode 1>", "<failure mode 2>", "<verdict>"],
    gateCheck: {
      selfCheckPassed: true,
      depthGatePassed: true,
      notes: "<weakness probe answer>"
    }
  }
}
```

Write STRESS-TEST artifact to session folder.

---

## R4: DECIDE

Commit to a position with reversal conditions inline.

### Step 4.1: Decision

Call cognition `operation: "decide"` with: statement, options (from R2 exploration or R1 FRAME if --quick), criteria, analysis, choice, confidence.

### Step 4.2: Reversal Conditions (folded from Ulysses)

As part of the decision content, include 3-5 bullets covering:
- Under what conditions would you reverse this decision?
- What are the kill switches / escalation triggers?
- What is the review timeline?

These are inline in the decide output, NOT a separate operation call.

**--strategic override:** Reversal conditions emphasized. Include explicit review timeline with milestones.

### Step 4.3: Harvest Checkpoint

Call checkpoint with `phase: "harvest"` for auto-persist:

```typescript
{
  operation: "checkpoint", sessionId: "<id>",
  projectPath: "<absolute project path>",
  content: {
    phase: "harvest",
    sessionFolder: "<absolute path to {$PWD}/.orca/cognition/YYYYMMDD-HHMM-slug/ -- project-local, NOT ~/.claude/>",
    summary: "<executive summary of decision + rationale>",
    keyFindings: ["<key risk>", "<key decision>", "<key safeguard>"],
    openQuestions: ["<remaining uncertainty>"],
    nextSteps: ["<implementation step>"],
    followUpQuestions: [
      {
        question: "<specific follow-up based on findings>",
        command: "/deepthink-local",
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

The MCP auto-persist writes `99-harvest.md` to the session folder via `sessionFolder`. Raw telemetry (`99-raw.json`) is written to `~/.orca-cognition/sessions/{sessionId}/`.

### Workshop Entry

```bash
workshop --workspace .claude/memory note \
  "/problem-solve-local: [Topic] - [Decision]. Session: <sessionId>. File: <autoPersist.file>" \
  -t problem-solve -t cognition
```

If workshop fails, display warning and continue.

### Confirm to User

Output after harvest + workshop:
```
---
Analysis persisted:
  File: <autoPersist.file path>
  Workshop: Tagged with problem-solve, cognition
  Recovery: /think --import <sessionId>
---
```

---

## Phase INTENSE: Full 8-Step Ceremony (--intense only)

**When --intense is passed, ignore R0-R4 above and execute this full pipeline instead.**

This preserves the original 8-step pipeline exactly as-is for users who want the full ceremony.

### Step 1: Session Folder

Create `{$PWD}/.orca/cognition/YYYYMMDD-HHMM-<slug>/` directory.
Write `00-enter.md` with problem statement and timestamp.

### Step 2: Scope Questions (unless --auto)

Orient directly -- no cognition-mcp calls yet. Analyze the prompt and write:

1. `01-orient.md` with: What is the problem? What is uncertain?
2. `02-scope-questions.md` -- translate each uncertainty into a binary question with a smart default.

Ask scope questions via `AskUserQuestion` (up to 3 questions, each with 2 options, smart default first marked "(Recommended)"). If AskUserQuestion returns blank, state assumptions visibly and proceed.

Record answers in `03-scope-answers.md`.

**--auto bypass**: State assumptions and proceed.

### Step 3: Orchestration + Systems Mapping

Start cognition session: call `operation: "thought"` with `sessionTitle: "ProblemSolve: <summary>"`, `sessionTags: ["problem-solve"]`. Register command with `operation: "checkpoint"` (`phase: "enter"`).

Call cognition `operation: "orchestration_suggest"` with: task, complexity, suggestedOperations (each with operation/reason/order), alternativeApproaches, recommendation.

Call cognition `operation: "systems"` with: system, components[{name, function}], relationships[{from, to, type}], feedbackLoops, keyLeveragePoints.

Present ASCII diagram as actual multi-line markdown. Then run checkpoint with `phase: "orient"`.

### Step 4: Pre-Mortem (ANTICIPATE)

Call cognition `operation: "mental_model"` with: modelName "pre-mortem", problem, setup ("This failed. What happened?"), steps (3-5 failure modes), rootCauses[{failure, cause, preventable}], conclusion.

Then run checkpoint with `phase: "anticipate"`.

### Step 5: Tree-of-Thought (GENERATE)

Call cognition `operation: "tree_of_thought"` with: problem, constraints (from systems + pre-mortem), branches[{id, thought, evaluation: {score, strengths, weaknesses, feasibility}}], bestPath, pruned, synthesis.

Present option tree as multi-line markdown. Then run checkpoint with `phase: "generate"`.

### Step 6: Decision + Challenge (EVALUATE)

Call cognition `operation: "decide"` with: statement, options, criteria, weights, analysis, scores, choice, confidence.

Weakness probe (rotate by pass number). Then adversarial challenge inline: decision matrix table, assumptions, what could go wrong, devil's advocate argument, blind spots, stress test result (PASSED/CAVEATS/NEEDS REVISION).

Run checkpoint with `phase: "evaluate"`.

### Step 7: Pre-Mortem Gate

Call cognition `operation: "mental_model"` with modelName "pre-mortem" on the selected option.

- If no failure mode changes ranking: Proceed to COMMIT.
- If a failure mode DOES change ranking: Return to Step 6 with pre-mortem findings.

Run checkpoint with `phase: "pre-mortem-gate"`.

### Step 8: Ulysses Protocol + Process Reflection (COMMIT)

Call cognition `operation: "ulysses_protocol"` with: goal, temptations, commitments, safeguards, reviewPoints, accountability, escapeHatch.

Call cognition `operation: "meta"` with: process, observations, adjustments, insights. Set nextThoughtNeeded: false.

### Step 9: Harvest

Call checkpoint with `phase: "harvest"`, `sessionFolder`, `projectPath` for auto-persist.

Workshop entry. Confirm to user.

---

## Final Output Format

The output is decision-first. The reader gets the answer immediately, then supporting evidence. This reflects convergent thinking: narrow toward commitment, not expand toward synthesis.

```
# ProblemSolve: [Problem Summary]
**Primed with SHIMMER self-observation.**

(Include the SHIMMER line in default, --auto, --risk, --strategic modes.
Omit in --quick and --incident which skip SHIMMER.)

## Analysis

[Problem framing -- what the situation was and what triggered
this analysis. 1-2 sentences.]

[Reasoning arc -- what the analysis revealed that confirmed,
redirected, or complicated the initial instinct. Where the
reasoning turned. What would change the verdict.

State the chosen direction clearly at the end of this section.
The reader should know what you're recommending before they
read the stress test.]

[For simple decisions, these can collapse into a shorter
form. The point is readability, not rigid structure.]

## Stress Test

**"[Risk or adversarial challenge]"**
[How it was tested and what happened. Did the decision survive,
adapt, or need revision? Plain prose, no arrows.]

**"[Another risk]"**
[Response and outcome.]

## Alternative Options
- **[What the alternative was]**: Eliminated because [reason].
- **[What the alternative was]**: Eliminated because [reason].

[Do NOT reference "Option A/B/C" labels. The reader hasn't
seen an option tree. Name each alternative by what it actually
is, then explain why it was rejected.]

## Recommendation
**[Decision statement]** (confidence: X.X)

[Why this is the go-forward path -- the synthesis of the analysis
and stress test above. 1-3 sentences connecting the reasoning
to the commitment.]

**Safeguards:**
[Specific commitments to prevent the failures identified above.]

**Reversal conditions:**
[3-5 bullets: kill switches, escalation triggers, review timeline.]

[Format for human readability in terminal:
- The Decision can be multi-part or compact -- match the complexity
  of the actual decision
- Stress Test entries: bold risk, plain response. No arrows, no
  mechanism names.
- Scoring tables and weighted criteria are appropriate when the
  context calls for them (team decisions, vendor evaluations,
  architecture choices)
- Never reference the protocol's internal phases, gates, or
  mechanism names in user-facing output
- No walls of text. Break long paragraphs.

Let the context and cognition tool calls determine the appropriate
structure and detail level for the final output.]

## Where to Go Next
-> /deepthink-local "[uncertainty needing exploration]"
   _[why this needs adversarial testing]_
-> /requirements "[implementation task]"
   _[if ready to implement]_
-> /think "[open question]"
   _[why this needs investigation]_
```

---

## Critical Requirements

1. **EXECUTE, don't recommend** -- run each step automatically
2. **Maintain session** via sessionId throughout
3. **Build on previous** -- each step references earlier insights
4. **Present progressively** -- show output after each step
5. **R2 EXPLORE is NEVER skipped** in default mode -- prevents premature lock-in
6. **Adaptive R2** -- decision type determines the right analytical mode
7. **SHIMMER is always-on** in default mode (no flag needed)
8. **Reversal conditions inline** in R4 DECIDE (no separate Ulysses step)

---

## Operation Field Hints

<!-- SCHEMA_HINTS_START -->
**Operation schemas (TS-lite notation: ? = optional, [] = array):**

```
## thought
{ thought: string, thoughtNumber: number, totalThoughts: number,
  nextThoughtNeeded: boolean, branchId?: string, isRevision?: boolean }

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

## collaborative_reasoning
{ topic?: string,
  perspectives?: {role: string, viewpoint: string, arguments: string[]}[],
  commonGround?: string[], tensions?: string[], synthesis?: string }
# NOTE: tensions objects auto-coerced to strings

## creative_thinking
{ prompt?: string, techniques?: string[],
  ideas?: {idea: string, potential: string, challenges: string[]}[],
  synthesis?: string }
# NOTE: challenges is string[], not string -- string auto-coerced to string[]

## analogical_reasoning
{ target: string,
  analogs: {domain: string, description: string, similarity: number}[],
  mappings: {targetElement: string, analogElement: string, relationship: string}[],
  insights: string[], limitations: string[] }
# NOTE: similarity is number -- numeric string auto-coerced
# NOTE: mapping fields are targetElement/analogElement/relationship

## causal_analysis
{ phenomenon: string,
  causes: {factor: string, type: string, strength: string, evidence?: string}[],
  effects: {outcome: string, likelihood: string, timeframe: string}[],
  chains: {sequence: string[], probability: number}[],
  interventions?: string[] }
# NOTE: chains auto-normalized -- string coerced to {sequence: [string], probability: 0.5}

## meta
{ process?: string, observations?: string[], adjustments?: string[],
  effectiveness?: number, insights?: string, nextThoughtNeeded?: boolean }
# NOTE: insights is string, not string[] -- string[] auto-coerced to joined string

## checkpoint
{ summary?: string, keyFindings?: string[], phase?: string, command?: string,
  addConstraints?: {type: 'FORWARD'|'FORBIDDEN'|'QUESTION', text: string}[],
  gateCheck?: {selfCheckPassed: boolean, depthGatePassed: boolean, notes?: string} }
```

**--intense mode additional schemas:**

```
## orchestration_suggest
{ task: string, complexity: 'simple' | 'medium' | 'complex',
  suggestedOperations: {operation: string, reason: string, order: number}[],
  alternativeApproaches: {approach: string, tradeoffs: string}[],
  recommendation: string }

## ulysses_protocol
{ goal: string,
  temptations: {trigger: string, temptation: string, risk: string}[],
  commitments: {commitment: string, enforcement: string, consequences: string}[],
  safeguards: {safeguard: string, trigger: string, linkedRisk?: string}[],
  escapeHatch?: string, reviewPoints?: {milestone: string, criteria: string}[] }
```
<!-- SCHEMA_HINTS_END -->

---

## Key Differences from Other Commands

| /problem-solve-local | /deepthink-local | /think |
|---------------------|-----------------|--------|
| Convergent -- decide + commit | Divergent + pre-mortems | Divergent, no pre-mortems |
| SHIMMER always-on (default) | SHIMMER opt-in (--shimmer) | No SHIMMER |
| Adaptive R2 EXPLORE (5 modes) | Adaptive modes (7 modes) | Constraint chain only |
| 5-step default pipeline | 3-5 modes typical | Blind orchestrate loop |
| Valid: clear decision + safeguards + reversal conditions | Valid: "more confused in useful ways" | Valid: "new insight found" |

---

_See also: `guide-think-complex.md`, `think.md`, `requirements.md` Section 0.2_
