---
name: contemplate
description: Recommend which reasoning approach fits a problem — think, deepthink, problem-solve, think-model, or challenge/adversarial — and in what sequence, before diving in. Use when the user isn't sure how to approach a complex problem and wants a strategy recommendation rather than jumping straight into analysis.
---

# Contemplate — Reasoning Strategy Advisor

Classify the problem, then recommend which of the other cognition skills (and in what order) fits — a router, not an analyzer itself.

## Step 1: Classify problem type

| Type | Signal | Primary approach |
|---|---|---|
| Exploration | "what could we do", "options for", confused/need territory | `think` (MAP or EDGES mode) |
| Compositional | multi-step, "first...then" | `think` (DEEP mode) or decompose manually |
| Decision | "choose", "vs", "trade-off" | `problem-solve` |
| Risk / what-could-go-wrong | "risk", "fail", "danger" | `think-model` (pre-mortem or inversion) or `challenge` |
| Strategic / long-term, high-stakes | multi-phase, irreversible | `problem-solve`, or `deepthink` first if the framing itself is uncertain |
| Attack an existing proposal | "stress-test this", "what's wrong with" | `challenge` or `adversarial` |
| Single named technique | user names a specific model | `think-model` |
| Genuinely uncertain framing | the question itself may be wrong | `deepthink` |

## Step 2: Assess complexity

- **Simple**: single decision, clear options — a direct answer or one `think-model` pass may be enough; contemplate's overhead isn't warranted.
- **Medium**: multiple factors, some uncertainty — one skill, one pass.
- **Complex**: many variables, dependencies, unknowns — sequence 2-3 skills.

## Step 3: Recommend a sequence with concrete framing

Don't just name the skill — give the user (or yourself, if proceeding immediately) a specific opening prompt for each stage. Example:

```
## Reasoning Strategy for: [problem]

**Type:** Architecture/Design · **Complexity:** complex
**Key challenge:** [what makes this hard]

### Recommended sequence

1. **Map the system** — think (MAP mode): "map [system]: components, dependencies, pain points"
2. **Find failure modes** — think-model (pre-mortem): "[decision] failed after 6 months. What went wrong?"
3. **Explore alternatives** — think (EDGES mode): "options for [problem]: [known candidates]"
4. **Decide** — problem-solve: "[decision statement]"

### If time-critical instead
Skip straight to problem-solve.

### If the framing itself might be wrong
Start with deepthink before any of the above.
```

Offer to run the first stage immediately, or let the user work through the sequence themselves.
