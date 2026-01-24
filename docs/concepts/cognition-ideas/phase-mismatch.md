# Phase Mismatch: Exploration vs Decision

## The Problem

Current `/deepthink` is consistently underwhelming even for its designed use case (major architectural decisions). The root cause: **phase mismatch**.

## The Insight

Complex work has distinct phases:

```
EXPLORATION          SYNTHESIS           DECISION
"what is this?"      "what patterns?"    "which path?"
     |                    |                   |
  divergent            connecting          convergent
  messy                forming             evaluating
  discovering          hypotheses          committing
```

Deepthink's ORIENT->ANTICIPATE->GENERATE->EVALUATE->COMMIT structure is a **convergent tool**. It assumes you already know what you're deciding between.

During exploration, you don't yet know what the decision even is. You're discovering the problem space, not evaluating options.

## The Symptom

When you use deepthink during exploration:
- You're forced to produce structured output before you've done the messy work of discovery
- You fill boxes with half-formed thoughts
- The output feels thin because the input wasn't ready
- Premature convergence forecloses genuine exploration

## The Solution

Split the tooling by phase:

| Tool | Phase | Mode | Output |
|------|-------|------|--------|
| `/deepthink` (new) | Exploration | Divergent | Questions + hypotheses |
| `/planthink` (old deepthink) | Decision | Convergent | Plan + commitment |

The handoff: `/deepthink` produces understanding -> `/planthink` produces action.

## Key Principle

The underwhelming feeling comes from applying convergent structure during a divergent phase. That's a tool-phase mismatch, not a tool quality problem.
