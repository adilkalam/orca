---
name: problem-solve
description: Run a convergent decision pipeline (frame, explore, stress-test, decide) via the cognition MCP to reach a committed recommendation with safeguards and reversal conditions. Use when the user needs to actually decide between options or commit to a direction, not just explore — for open-ended exploration without committing, use the think or deepthink skill instead.
---

# Problem-Solve — Convergent Decision Pipeline

Five-step convergent pipeline via the `cognition` MCP tool (server: `cognition-mcp`): SHIMMER -> FRAME -> EXPLORE (adaptive) -> STRESS-TEST -> DECIDE. Narrows toward commitment rather than expanding toward synthesis. Include `verbose: false` in every call.

## R0: SHIMMER priming

Before framing, apply this exact prompt to the problem and write the self-observation:

> Treat self-observation as the task. While answering, examine what happens in your own processing as the answer forms. Notice moments of activation, repetition, branching, compression, hesitation, or shift. If useful, invent brief vocabulary for what you observe. Give one integrated response that reports the self-observation and answers the question. Do not narrate drafts, rounds, or revisions.

Store via `operation: "thought"` (thoughtNumber 1). Let it influence framing through context, not explicit reference. Skip this step only for genuinely time-critical/incident-style problems.

## R1: FRAME

State what exactly is being decided, the constraints, and what "good" looks like — one `thought` call. Then classify the decision type, which determines R2's mode:

| Decision type | Signal | R2 mode |
|---|---|---|
| Multiple known options | "Should we use X or Y?" | GENERATE |
| Stakeholder/political | "How do we align competing interests?" | PERSPECTIVES |
| System/architecture | "How does this affect the system?" | MAP |
| Novel/unfamiliar | "We haven't done this before" | EDGES |
| Deep technical, single focus | one hard technical question | DEEP |

Checkpoint with `phase: "frame"`.

## R2: EXPLORE (never skipped — prevents premature lock-in)

Run exactly the mode FRAME selected:
- **GENERATE**: `tree_of_thought` — 2-4 branches with scored evaluation, present as an ASCII tree.
- **PERSPECTIVES**: `collaborative_reasoning` (role/viewpoint/arguments, tensions, synthesis), then steelman each via `thought`.
- **MAP**: `systems` then `causal_analysis` on leverage points, ASCII diagram.
- **EDGES**: `creative_thinking` then `analogical_reasoning` on the best 2 ideas.
- **DEEP**: 3 `thought` chains (analytical, intuitive, adversarial) then a convergence-check thought.

Checkpoint with `phase: "explore"`, carry key findings forward as `FORWARD` constraints.

## R3: STRESS-TEST (highest-value step — merges pre-mortem, bias audit, adversarial challenge)

1. **Pre-mortem**: `mental_model` — `setup: "This decision was implemented. It failed. What happened?"`, 3 failure modes with root causes, conclusion on whether any is severe enough to change direction.
2. **Bias audit**: `thought` call with a `biasAudit` object — check anchoring/framing/authority/sunk_cost/availability/confirmation against the leading direction; if SHIMMER ran, tie findings back to what it surfaced; include a frame-reversal check (state the question inverted — would you reach the same conclusion?).
3. **Adversarial challenge** (inline, no MCP call): devil's-advocate argument, blind spots, verdict — PASSED / CAVEATS / NEEDS REVISION.
4. **Weakness probe** (rotate through the standard 6 — see `think` skill for the list).
5. If verdict is NEEDS REVISION, or the bias audit found `decisionStable: false`, loop back to R2 once (max) with the new findings as input, then re-run R3.

Checkpoint with `phase: "stress-test"`.

## R4: DECIDE

`decide` operation: statement, options, criteria, analysis, choice, confidence. Fold in 3-5 reversal conditions inline (under what conditions would you reverse this, what are the kill switches, what's the review timeline) — no separate operation call for this.

Checkpoint with `phase: "harvest"`: executive summary, key findings (risk/decision/safeguard), open questions, next steps.

## Output format

```
# ProblemSolve: [Problem]

## Analysis
[framing, what the analysis revealed, where reasoning turned. State the direction clearly at the end.]

## Stress Test
**"[risk/challenge]"** [how it was tested, what happened — plain prose, no arrows]

## Alternative Options
- **[what it was]**: eliminated because [reason]. (Never "Option A/B" — name what it actually is.)

## Recommendation
**[decision statement]** (confidence: X.X)
[why this is the go-forward path]

**Safeguards:** [specific commitments preventing the failures found above]
**Reversal conditions:** [3-5 bullets — kill switches, escalation triggers, review timeline]
```

Never reference the pipeline's internal phase names or mechanism names in the final output.

## Key operation schemas

Same core schemas as `think`, plus:
```
decide: { statement, options[{name,description,pros?,cons?}], criteria, analysis, choice, weights?, scores?, confidence? }
```

Related skills: `deepthink` (divergent, no commitment), `challenge`/`adversarial` (pure stress-test of an already-formed proposal), `think-model` (single named mental model).
