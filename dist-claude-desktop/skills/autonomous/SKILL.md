---
name: autonomous
description: Run a 4-phase autonomous pipeline (research, deep exploration, adversarial challenge, extended problem-solve) for complex multi-domain problems needing a committed, research-grounded decision. Use only when the problem spans 3+ domains, would normally take weeks to work through, needs a genuinely committed decision (not exploration), and external knowledge would materially change the analysis.
---

# Autonomous — 4-Phase Research-to-Commitment Pipeline

The heaviest cognition skill — full multi-phase pipeline via the `cognition` MCP tool (server: `cognition-mcp`), each phase its own independent session, connected by lossy context (harvest summaries, not full history). Use `deepthink` instead for single-domain exploration under 20 minutes; use `solve` instead if research isn't the bottleneck.

## Phase 1: SHIMMER priming (mandatory)

Apply the exact SHIMMER prompt (see `think` skill for the text), write the self-observation, save it — do not yet open a cognition session.

## Phase 2: Research (skip if the user says so, or if you have no search/fetch capability available)

Derive 4-6 focused, independently-answerable subquestions covering the problem's distinct domains. Research each — using web search/fetch if you have that capability in this environment, otherwise state plainly that research is being skipped and proceed with reasoning from existing knowledge only (flag this as a real limitation, not a silent gap). For each subquestion gathered: 3-5 findings with sources and a confidence level (high/medium/speculative), noted caveats. Synthesize into a top-10 findings list with attribution — this seeds Phase 3.

## Phase 3: Deep exploration (15+ rounds target)

Open a new cognition session seeded with the full problem, research synthesis, and any stated scope answers. Rotate modes: MAP -> INVERT -> PERSPECTIVES -> EDGES -> META -> DEEP -> repeat (see `deepthink` skill for what each mode calls). After each mode: 7-question self-check (shallow/predictable? what am I avoiding? why not the uncomfortable option? what would I critique in someone else's version? what would a skeptic challenge? any unverified claims? what factual premise is unverified?) with mandatory verify-or-defer on the external/grounding questions, a weakness probe, a constraint checkpoint, and — if the mode produced a testable conclusion — an adaptive pre-mortem.

**Hard gate before moving on** (all three): 10+ rounds completed, no active blocking constraints, and at least 3 rounds produced a pre-mortem (i.e., a real conclusion got stress-tested, not just exploration). Harvest the top 5-7 conclusions.

## Phase 4: Adversarial challenge

New session. Challenge the Phase 3 conclusions directly: `causal_analysis` on what could make the emerging direction fail, an assumption/edge-case audit, `structured_argumentation` (thesis vs. antithesis vs. synthesis), then a `decide` verdict — GO / CONDITIONAL GO / NO GO.

**If NO GO** (max 2 loops): extract the top 3 failure modes as new constraints, return to Phase 3 with them pre-loaded, re-run exploration, re-challenge. After 2 NO GO verdicts, stop the pipeline, present everything found across both attempts, and recommend `deepthink` on fundamentals before retrying.

**If GO or CONDITIONAL GO**: record required mitigations, proceed to Phase 5.

## Phase 5: Extended problem-solve

New session, seeded with Phase 3's conclusions + Phase 4's verdict and mitigations. Run: `orchestration_suggest` -> `systems` (mitigations folded in) -> pre-mortem gate 1 -> `tree_of_thought` (4+ branches, not the usual 2-4) -> `decide` (weighted) -> inline adversarial challenge -> pre-mortem gate 2 ("six months later it failed") -> `simulation` on the top 2 options -> `ulysses_protocol` (5+ safeguards, each tied to a specific failure mode found earlier) -> `meta` process reflection.

## Phase 6: Unified synthesis

Write one document with the **executive summary at the top** (not buried at the end):

```
# Autonomous: [Problem]
**Decision:** [1 sentence] · **Confidence:** [0.0-1.0]
[why this is the go-forward path]

## Research Findings — top 10, sourced, confidence-tagged (or "skipped" + why)
## Exploration Insights — top 6-8 findings from Phase 3
## Challenge Verdict — GO/CONDITIONAL GO, key failure modes, required mitigations
## Committed Decision — full statement + confidence + reasoning arc + safeguards
## Actionable Roadmap — now / near-term / long-term
## Open Questions
```

## Key operation schemas

Union of the schemas used across `think`, `deepthink`, `problem-solve`, and `challenge` — `thought`, `mental_model`, `systems`, `causal_analysis`, `collaborative_reasoning`, `creative_thinking`, `analogical_reasoning`, `tree_of_thought`, `decide`, `structured_argumentation`, `simulation`, `ulysses_protocol`, `meta`, `orchestration_suggest`, `checkpoint`. See those skills for field-level detail.

Related: `problem-solve` / `solve` for single-session convergent decisions without the research phase; `deepthink` for single-domain exploration under 20 minutes.
