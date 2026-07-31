---
name: solve
description: Run a full 8-step convergent decision pipeline (orient, anticipate, generate, evaluate, pre-mortem gate, commit) via the cognition MCP for complex, high-stakes decisions needing maximum rigor. Use when problem-solve's 5-step pipeline isn't enough — multi-stakeholder, high-stakes, or the user explicitly wants the fuller ceremony.
---

# Solve — Full 8-Step Decision Pipeline

The heavier sibling of `problem-solve`: same convergent spirit, more ceremony. Uses the `cognition` MCP tool (server: `cognition-mcp`), `verbose: false`. Pipeline: orchestrate -> systems -> pre-mortem -> tree -> decide -> challenge -> pre-mortem-gate -> ulysses -> meta.

Use `problem-solve` instead for most decisions — reach for `solve` specifically when stakes are high enough to warrant simulation-of-consequences and a formal precommitment protocol.

## Phase 0: SHIMMER priming (skip only for genuine incidents)

Apply the exact SHIMMER prompt to the problem, write the self-observation, store via `thought` (thoughtNumber 1):

> Treat self-observation as the task. While answering, examine what happens in your own processing as the answer forms. Notice moments of activation, repetition, branching, compression, hesitation, or shift. If useful, invent brief vocabulary for what you observe. Give one integrated response that reports the self-observation and answers the question. Do not narrate drafts, rounds, or revisions.

## Phase 1: ORIENT

State the problem and what's uncertain. If genuinely ambiguous, ask up to 3 scope questions with smart defaults; otherwise state assumptions. Then `operation: "orchestration_suggest"` (task, complexity, suggested operations with reasons/order) followed by `operation: "systems"` (components, relationships, feedback loops, leverage points) — present as an ASCII diagram. Checkpoint `phase: "orient"`. Gate: does the map cover the full path, verify an assumption, include the destination component?

## Phase 2: ANTICIPATE

`operation: "mental_model"` pre-mortem: 3-5 failure modes tied to the systems map, root causes, conclusion. Gate: failure modes trace to the map, are specific (not generic), at least one non-obvious.

## Phase 3: GENERATE

`operation: "tree_of_thought"`: 2-4+ branches with scored evaluation (strengths/weaknesses/feasibility), best path, pruned branches with reasons, synthesis. Present as an ASCII tree. Gate: options address the failure modes, 2+ meaningfully different, pruning explained.

## Phase 4: EVALUATE

`operation: "decide"` with weighted criteria (weights sum to 1.0). Weakness probe (rotate the standard 6 questions — see `think` skill). Inline adversarial challenge: decision matrix, assumptions, what could go wrong (linked to the pre-mortem), devil's advocate, blind spots, verdict PASSED/CAVEATS/NEEDS REVISION. Gate: genuine weakness found, confidence justified, alternative interpretation considered. If HARD FAIL, return to GENERATE.

## Phase 4.5: PRE-MORTEM GATE

A second, sharper pre-mortem specifically on the option EVALUATE selected: `setup: "This decision was implemented. Six months later it failed. What happened?"`. If a failure mode changes the ranking, return to EVALUATE with the new findings and re-score. If not, the failure modes become safeguards in COMMIT.

## Phase 5: COMMIT

`operation: "ulysses_protocol"`: goal, temptations (trigger/temptation/risk), commitments (commitment/enforcement/consequences), safeguards tied to the failure modes found above, review points, accountability, escape hatch. Then `operation: "meta"`: process reflection on the pipeline itself (observations, adjustments, insights).

## Harvest

Checkpoint `phase: "harvest"`: executive summary of decision + rationale, key findings (risk/decision/safeguard), open questions, next steps.

## Output format

Same decision-first shape as `problem-solve`: Analysis (framing, reasoning arc, stated direction) -> Stress Test (bold risk, plain response) -> Alternative Options (named, not "Option A/B", with elimination reason) -> Recommendation (statement + confidence + safeguards). Never reference internal phase/gate names in the final output.

## Key operation schemas

```
orchestration_suggest: { task, complexity, suggestedOperations[{operation,reason,order}], alternativeApproaches, recommendation }
systems: { system?, components?[{name,function}], relationships?[{from,to,type}], feedbackLoops? }
mental_model: { modelName, problem, setup, steps[], rootCauses[{failure,cause,preventable}], conclusion }
tree_of_thought: { branches[{id,thought,evaluation:{score,strengths,weaknesses,feasibility}}], bestPath, pruned, synthesis }
decide: { statement, options[{name,description,pros,cons}], criteria, weights?, analysis, choice, confidence? }
ulysses_protocol: { goal, temptations[{trigger,temptation,risk}], commitments[{commitment,enforcement,consequences}], safeguards[{safeguard,trigger,linkedRisk?}], reviewPoints?, accountability, escapeHatch? }
meta: { process, observations, adjustments, effectiveness?, insights, nextThoughtNeeded }
```

Related: `problem-solve` (lighter, 5-step version of the same idea — default to this one).
