---
name: adversarial
description: Run a lean adversarial pipeline (pre-mortem, then argumentation, then a devil's-advocate-vs-defender debate) on a proposal via the cognition MCP, ending in a GO/CONDITIONAL GO/NO GO verdict. Use when the user explicitly says "adversarial analysis" or wants a faster, pre-mortem-centered attack than the challenge skill's four-operation pipeline.
---

# Adversarial — Pre-Mortem-Centered Attack

A leaner sibling of the `challenge` skill: same spirit (attack the proposal, don't confirm it), different operation sequence, centered on pre-mortem. Uses the `cognition` MCP tool (server: `cognition-mcp`). Include `verbose: false` in every call.

## Stance declaration

Before any structured step, write out: the proposal and why it looks appealing; what you're suspicious of; failure scenarios that come to mind before analysis. This is the adversarial-stance declaration — you are not neutral.

## Step 1 — Pre-mortem (always runs)

`operation: "mental_model"`: `modelName: "pre-mortem"`, `setup: "This was implemented. It failed. What happened?"`, 5 failure modes, root causes per failure with a `preventable` flag, overall vulnerability conclusion.

Run a 3-question self-check after: Am I being genuinely adversarial or just listing concerns? What weakness am I avoiding because it's uncomfortable? Would this change if I staked my credibility on it?

**Quick mode**: stop here, skip to the verdict.

## Step 2 — Structured argumentation

`operation: "structured_argumentation"`: thesis is the proposal, 2+ arguments against it each with evidence (point + strength), possible defenses with rebuttals for why they're insufficient, overall conclusion. Repeat the 3-question self-check.

## Step 3 — Devil's advocate via collaborative reasoning

`operation: "collaborative_reasoning"`: two perspectives — **Devil's Advocate** (strongest arguments against, informed by steps 1-2, including one uncomfortable truth) and **Defender** (strongest genuine case for it). Name the real tensions where they disagree. Synthesize an honest read of where the evidence weight falls. Repeat the 3-question self-check.

## Verdict

Synthesize into GO / CONDITIONAL GO / NO GO with required mitigations if conditional.

## Output format

```
# Challenge: [Proposal]

## Weaknesses Found
**"[most severe]"** (#tag) [how found, why it matters — plain prose, no arrows, no mechanism names]
**"[next]"**
**"[finding that survived scrutiny]"** [optional, only if meaningful]

## Verdict
**[GO / CONDITIONAL GO / NO GO]**
**Required Mitigations (if CONDITIONAL GO):** 1. [...] 2. [...]

---
[The honest assessment — what you actually think now. No heading, no "the analysis..." framing.]
```

Order findings most-to-least severe. Never show the engine/protocol/operation names to the user.

## Key operation schemas

```
mental_model: { modelName, problem, setup, steps[], rootCauses[{failure,cause,preventable}], conclusion }
structured_argumentation: { thesis, arguments[{claim,evidence[{point,strength}],counterArguments,rebuttal}], conclusion }
collaborative_reasoning: { topic, perspectives[{role,viewpoint,arguments}], tensions, synthesis }
```

Related skills: `challenge` (a fuller four-operation version — causal analysis + catalog + argumentation + formal decide verdict), `problem-solve` (convergent, decides between options rather than attacking one).
