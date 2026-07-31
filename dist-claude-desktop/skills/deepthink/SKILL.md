---
name: deepthink
description: Run divergent, depth-first exploration of a hard question with adaptive pre-mortems that stress-test conclusions before they solidify, using the cognition MCP. Use when the user says "deepthink this", wants adversarial pre-mortems woven into exploration (not just a decision), or a question needs to be explored more thoroughly than the think skill's constraint chain.
---

# DeepThink — Pre-Mortem Exploration

Depth-first exploration via the `cognition` MCP tool (server: `cognition-mcp`), same accept-store-echo mirror as the `think` skill, but every conclusion-producing mode triggers an adaptive pre-mortem before you move on. Divergent, not convergent — for committing to a decision, use `problem-solve` instead.

Include `verbose: false` in calls (deepthink makes many calls; the echo isn't needed each time).

## Optional: SHIMMER priming

If the user's question is open-ended or the framing itself seems worth examining, prime with SHIMMER before mode execution: apply this exact prompt to the question and write the self-observation (not the answer) —

> Treat self-observation as the task. While answering, examine what happens in your own processing as the answer forms. Notice moments of activation, repetition, branching, compression, hesitation, or shift. If useful, invent brief vocabulary for what you observe. Give one integrated response that reports the self-observation and answers the question. Do not narrate drafts, rounds, or revisions.

Store it via `operation: "thought"` (thoughtNumber 1) before starting mode execution. Let it influence subsequent analysis through context, not by referencing it explicitly.

## Mode execution

Typical: MAP -> INVERT -> [DEEP or EDGES if needed] -> HARVEST, 3-5 modes. MAP absorbs assumption-surfacing ("state key assumptions and uncertainties, then map the system"). INVERT is close to mandatory — it's the highest insight-density mode.

| Mode | Operations |
|---|---|
| MAP | `systems` then `causal_analysis` on leverage points |
| INVERT | `mental_model` pre-mortem ("this failed, what happened?") then `thought` reflexion on top 2 failure modes |
| PERSPECTIVES | `collaborative_reasoning` then steelman via `thought` |
| EDGES | `creative_thinking` then `analogical_reasoning` on best 2 ideas |
| META | `meta` operation — only when genuinely avoiding something, not routine |
| DEEP | 3 `thought` chains (analytical, intuitive, adversarial), then a convergence-check thought |

## After each mode

1. **Weakness probe** (rotate through: which part deserves another round / what's the first thing someone notices if this fails / what surprised you / what did you almost say / which claim would you cut / are your strongest claim and biggest caveat in tension).
2. **Checkpoint**: `operation: "checkpoint"` with `phase`, `summary`, `keyFindings`, `addConstraints` (FORWARD/FORBIDDEN/QUESTION), resolve/defer prior ones, `gateCheck`. Read `gateStatus` and `blocked`.
3. **Adaptive pre-mortem**: if the mode produced a specific recommendation, position reversal, or actionable decision — run `mental_model` pre-mortem on it (`setup: "This decision/recommendation failed. What happened?"`). Skip if the mode was purely exploratory (a map, a question list). Each non-trivial failure mode becomes a new `FORWARD`/`FORBIDDEN` constraint.
4. **Candidate reframing**: if a pre-mortem just ran, the next mode must generate a genuinely different approach to the ORIGINAL question — not deepen what came before. This is the guard against complexity-collapse (elaborating a simple problem until its complexity justifies an over-built answer).

Continue until 3-4 modes have passed with `blocked: false`, or genuine surprise is exhausted.

## Self-check (once, before harvest)

Three questions: what am I avoiding, what would a skeptical expert challenge, what verifiable claim haven't I checked. For each concern, VERIFY (re-check it) or DEFER (state why it can't be checked now) — never raise and dismiss in the same pass.

## Harvest

Run one final pre-mortem on the overall emerging recommendation, scoped specifically to whether it matches the scale of the original question. Then synthesize: `checkpoint` with `phase: "harvest"`, summary, key findings, open questions, next steps.

## Output format

```
# DeepThink: [Problem]

## Default Starting Point
[assumptions, knowns, open questions — 1-3 sentences]

## Insights from DeepThink
**[Finding as a clear statement.]** [expand only if needed]
[3-6 curated findings, best format per finding — bullet, bold+paragraph, mixed.
Never lead with mode names (no "MAP:", "INVERT:"). Optional (#tags): #pre-mortem #inversion #edge #perspective #meta]

---
[The answer. No heading, no "after analyzing..." framing. What you actually think now.]
```

## Key operation schemas

Same as `think` skill, plus:
```
meta: { process?, observations?, adjustments?, effectiveness?, insights?, nextThoughtNeeded? }
```

Related skills: `think` (lighter, no pre-mortems), `problem-solve` (convergent — commits to a decision), `challenge`/`adversarial` (pure red-team of an existing proposal).
