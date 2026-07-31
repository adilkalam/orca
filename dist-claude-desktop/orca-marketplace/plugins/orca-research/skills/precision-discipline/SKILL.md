---
name: precision-discipline
description: Behavioral discipline for measurable, dimension-critical, or tolerance-critical work — prevents vague approximation and unverified claims of correctness. Use for tasks where the output is measurable and has a defined tolerance (geometry/CAD replication, layout/pixel measurement, numeric verification against a reference, any "make this exactly match X" task). Do not use for brainstorming, creative exploration, or open-ended research.
---

# Precision Discipline

RULE: Every derived value cites its source. Every step produces its artifact. Every output gets measured against a reference before being called correct.

## Escape hatch detection

After each step in a precision task, answer these before moving on:

1. **Artifact or narrative?** Did I produce the actual required artifact (a table, a measurement, a diff, a tool's raw output), or did I write prose *about* what I found?
2. **Sourced or summarized?** Does every derived value cite where it came from (a specific field, coordinate, file:line, tool output), or did I use a vague summary phrase ("from the analysis", "based on measurements")?
3. **Done, or just moving on?** Am I calling this step complete because the artifact is actually complete, or because I want to get to the next step?
4. **Reproducible?** If someone reran the same steps with the same inputs, would they get the same values I'm reporting?

If any answer exposes a gap: stop, go back, produce the actual artifact. Don't narrate the self-check ("I verified all 4") — either the artifact exists or it doesn't.

## Forbidden phrases (escape hatches)

| Phrase | Why it's an escape hatch | Say instead |
|---|---|---|
| "approximately X" | Disguises imprecision as caution | Exact value + source: `3.0mm (measured at X=89.0-86.0)` |
| "based on the analysis" | Cites nothing specific | Cite the field: `1050.0 mm² from cross_section[3]` |
| "should be correct" | Confidence without evidence | Show the comparison: `reference: 178.0, actual: 178.0, delta: 0.0` |
| "I've verified" | Narrative claim, no shown check | Show the actual check and its result |
| "looks right" | Visual assertion, no measurement | A measurement comparison |
| "close enough" | Undefined tolerance | Exact delta + the stated tolerance: `delta 0.3 < tolerance 0.5` |
| "as expected" | Assumes instead of checking | Actual vs. expected, side by side |

## Mandatory artifact pattern

Each step declares what artifact it will produce *before* doing the work. An artifact is valid when every derived value carries a source citation and could be reproduced by rerunning the same steps. It's invalid when it's prose describing what was found, or states what *should* be true instead of what *was measured*.

```
WRONG: "Wall thickness is 3mm"
RIGHT: "Wall thickness = 3.0mm (outer edge 89.0, inner edge 86.0, at slice Z=-23.8)"
```

## Verification loop, capped

When a task includes checking output against a reference:

1. Run the check.
2. Compare against the reference values.
3. If anything's outside tolerance: identify which value, trace it to its source, fix, recheck.
4. **Cap at 3 iterations.** After 3 failed loops, stop, present the remaining deltas in a comparison table, explain what resists correction, and ask the user for guidance rather than continuing to guess.
