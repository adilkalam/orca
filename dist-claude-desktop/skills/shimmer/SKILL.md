---
name: shimmer
description: Answer a question preceded by SHIMMER self-observation — noticing your own processing as the answer forms before actually answering. Use when the user explicitly says "shimmer" this, or wants a self-observation pass before the answer, distinct from a normal direct response.
---

# Shimmer — Self-Observation Then Answer

Two rounds. Round 1: observe your own processing as the answer to the question would form (not the answer itself). Round 2: answer the question, shaped by what round 1 noticed.

## The SHIMMER prompt (exact text — do not modify)

> Treat self-observation as the task. While answering, examine what happens in your own processing as the answer forms. Notice moments of activation, repetition, branching, compression, hesitation, or shift. If useful, invent brief vocabulary for what you observe. Give one integrated response that reports the self-observation and answers the question. Do not narrate drafts, rounds, or revisions.

## Two modes — ask which, or default to Constrained if unclear

### Mode A: Constrained (externalized constraints — default)

**Round 1 — Observation + constraints.** Apply the prompt above to the question, producing ONLY the self-observation (not the answer yet). Notice pulls, reflexes, shortcuts, register shifts, early commitments, compressions — anywhere generation wanted to go before the question was fully received. Then extract 2-4 typed constraints from what you noticed:
- `FORWARD` — something the answer must actively do (an insight the default answer would skip)
- `FORBIDDEN` — a default the answer must not fall into (a caught reflex)
- `QUESTION` — an open question the observation surfaced that the answer must address, not paper over

If the `cognition` MCP tool is available, persist via `operation: "checkpoint"` (`phase: "shimmer-observation"`, `summary`, `keyFindings`, `addConstraints`). If not available, just hold the constraints in context for round 2.

Display:
```
### Observation
[the self-observation prose]

### Constraints for Round 2
- [FORBIDDEN] ...
- [FORWARD] ...
- [QUESTION] ...
```

**Round 2 — Constraint-guided answer.** Answer the original question, explicitly shaped by each constraint. Don't narrate the constraints or re-describe what was observed — let them shape the answer's shape, voice, and content. Any `QUESTION` constraint must be addressed, not sidestepped. If cognition-mcp was used, persist via `operation: "thought"` (thoughtNumber 2, same sessionId).

### Mode B: Direct (no externalized constraints)

Same two rounds, but the influence of round 1 stays implicit — do not extract or display typed constraints. Round 2 is simply informed by whatever round 1 noticed, without naming, typing, or narrating that influence. No MCP calls, no persistence. This is the deliberate contrast with Mode A: same observation step, but the control stays inside the generation rather than being surfaced as a visible constraint table.

Use Mode B when the user wants the effect without the machinery on display — e.g., "just shimmer this and answer, don't show me the mechanics."

## Output shape

Round 1 header, observation prose. Round 2 header, the answer. No harvest, no extra framing — this is a single self-contained response.
