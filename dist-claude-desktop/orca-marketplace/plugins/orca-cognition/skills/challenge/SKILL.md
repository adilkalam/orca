---
name: challenge
description: Adversarially stress-test a proposal to find weaknesses before it's implemented, producing a GO / CONDITIONAL GO / NO GO verdict, using the cognition MCP. Use when the user wants their idea, plan, or architecture choice attacked and pressure-tested before committing — not explored (use think/deepthink) or decided between alternatives (use problem-solve).
---

# Challenge — Adversarial Analysis with Verdict

Stress-test a proposal using the `cognition` MCP tool (server: `cognition-mcp`) across four operations in sequence: causal analysis of failure -> assumption/edge-case/failure-mode catalog -> structured argumentation against it -> final verdict. Be genuinely adversarial — the goal is finding weaknesses, not balanced assessment. Include `verbose: false` in every call.

## Before analysis: declare the adversarial stance

State: what's being proposed and why it looks appealing; what you're suspicious of (gut-level concerns); what could go wrong before any structured analysis. You are not neutral — you are looking for reasons this fails.

## Step 1 — Causal analysis of failure

`operation: "causal_analysis"`: `phenomenon: "Failure of: <proposal>"`. 5-7 causes spanning technical/organizational/market/resource factors, 4-6 effects across immediate/medium/long-term, 2-3 critical causal chains, interventions.

## Step 2 — Assumption audit + edge cases + failure modes

One `thought` call covering all three:
- **Assumptions**: for each, confidence (high/med/low), what breaks if wrong, and whether a specific cognitive bias (anchoring/framing/authority/sunk_cost/availability/confirmation/none) is plausibly operating on it — `none` is a valid answer, don't manufacture bias.
- **Edge cases**: 5-10 boundary and hostile scenarios.
- **Failure modes**: per component — how it fails, blast radius (contained/cascading), how it'd be detected.

## Step 3 — Structured argumentation

`operation: "structured_argumentation"`: claim ("this should NOT be implemented because..."), 3 premises, evidence with strength ratings, steel-manned counterarguments (argue FOR the proposal) each followed by a rebuttal, conclusion.

## Step 4 — Verdict

`operation: "decide"`: statement ("should we proceed with X?"), three options (GO / CONDITIONAL GO / NO GO) each with pros/cons, criteria (risk tolerance, resource availability, reversibility), analysis, choice.

## Quick mode

If the user wants speed over rigor: run only the causal_analysis (3 causes, 3 effects) plus a light assumption/edge-case thought call (3 assumptions, 5 edge cases). Skip structured argumentation and the formal verdict — end with a plain "proceed with caution / needs more analysis / red flags present" call.

## Deep mode

If the stakes are high: after Step 3, add a `simulation` operation (walk a 3-4 step failure scenario to a final state) and an `ethical_analysis` operation (stakeholders, principles, weighted options, recommendation, honest dissent) before the verdict.

## Output format

```
# Challenge: [Proposal]

## The Proposal
[what's being challenged, why it seems appealing] · Suspicious of: [gut concern]

## Weaknesses Found
**"[most severe weakness]"** (#tag) [why it matters, plain prose]
**"[next weakness]"**
[order most-to-least severe; optional tags: #assumption #cascade #edge-case #counter-argument]

## Verdict
**[GO / CONDITIONAL GO / NO GO]** (confidence: X.X)
**Required Mitigations (if CONDITIONAL GO):** 1. [...] 2. [...]
```

Never reference the operation names or pipeline mechanics in the rendered output — only the analysis and verdict.

## Key operation schemas

```
causal_analysis: { phenomenon, causes[{factor,type,strength,evidence?}], effects[{outcome,likelihood,timeframe}], chains[{sequence,probability}], interventions? }
structured_argumentation: { thesis|claim, premises?, evidence[{point,strength}], counterarguments[{point|argument,rebuttal}], conclusion }
decide: { statement, options[{name,description,pros,cons}], criteria, analysis, choice }
simulation: { scenario, initialConditions, steps[{step,action,outcome}], finalState, insights, alternativeOutcomes }
ethical_analysis: { situation, stakeholders[{group,interests,impact}], principles[{principle,application,weight}], options[{option,ethicalScore,reasoning}], recommendation, dissent }
```

Related skills: `adversarial` (a leaner pre-mortem + devil's-advocate variant of this same idea — use whichever the user names), `problem-solve` (decide between multiple options), `deepthink` (exploration with pre-mortems woven in, not a standalone attack).
