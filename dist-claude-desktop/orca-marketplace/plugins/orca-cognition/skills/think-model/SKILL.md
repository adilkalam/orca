---
name: think-model
description: Apply one specific named mental model (five-whys, pre-mortem, inversion, first-principles, red-team, etc.) to a problem, using the cognition MCP to store the applied reasoning. Use when the user names a specific mental model explicitly, or asks "apply the [X] model to this."
---

# Think-Model — Named Mental Model Application

The `cognition` MCP tool (server: `cognition-mcp`) stores and echoes; the reasoning is yours, shaped by the model's process. Read `reference/models.md` in this skill for the process steps of each model, apply those steps to the user's actual problem (not an abstract description of the model), then store via `operation: "mental_model"` with `verbose: true`.

## Steps

1. Identify which model the user wants (or infer the best fit — see the table in `reference/models.md`).
2. Read that model's process from the reference file.
3. Apply each step to the specific problem — this is the substantive work.
4. Call:
```typescript
{
  operation: "mental_model",
  content: {
    modelName: "<model>",
    problem: "<user's problem>",
    steps: ["<step 1 from the model's process, adapted>", "..."],
    reasoning: "<the applied analysis — the model's process walked through on THIS problem, not a description of the model>",
    conclusion: "<actionable insight or recommendation — not abstract>",
    nextThoughtNeeded: false
  }
}
```
5. Present: Problem (1 line) -> Process Applied (numbered, adapted steps) -> Reasoning -> Conclusion. No protocol vocabulary in the output ("the model says..." — instead lead with the finding itself).

## Available models

See `reference/models.md` for the full process definitions. Quick index:

- **Debugging**: five-whys, rubber-duck, assumption-surfacing
- **Estimation**: fermi-estimation
- **Architecture**: abstraction-laddering, decomposition, constraint-relaxation, first-principles
- **Decisions**: steelmanning, opportunity-cost, trade-off-matrix, time-horizon-shifting, reversibility
- **Planning/risk**: inversion, pre-mortem, second-order-effects
- **Adversarial**: red-team
- **Prioritization**: impact-effort-grid

Related skills: `think` (multi-mode chain), `deepthink` (adversarial pre-mortems woven in), `problem-solve` (convergent decision pipeline).
