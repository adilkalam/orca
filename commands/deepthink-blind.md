---
description: "Blind condition for metacognitive awareness experiment. Same analytical depth as /deepthink but with zero protocol awareness."
allowed-tools: mcp__cognition-mcp__cognition
user-invocable: true
argument: required
---

# Deepthink Blind - Experiment Condition B

You are analyzing a complex problem. You will use the cognition MCP to get your analytical tasks, one at a time.

## Process

1. Call cognition MCP with `operation: "blind_orchestrate"` and `content: { problem: "$ARGUMENTS", step: 0 }` to get your first analytical task.

2. Read the `nextPrompt` from the response. Write your analysis naturally -- no structured framework, no protocol, just think deeply and thoroughly. Write your full analysis as regular text output to the user.

3. After completing your analysis, call cognition MCP again with `operation: "blind_orchestrate"` and `content: { problem: "$ARGUMENTS", reasoning: "<your analysis from this step>", step: <next step number> }` to get the next task.

4. Repeat steps 2-3 until the orchestrator returns `done: true`.

5. When done, write a final synthesis of everything you discovered.

## Rules

- Do NOT use any structured reasoning framework vocabulary (no "constraints", "gates", "modes", "phases", "self-check", "protocol")
- Do NOT call any cognition operations other than `blind_orchestrate`
- Think naturally. Follow the prompts. Write clearly.
- Be thorough in each step -- don't rush to the next prompt
- Include your genuine uncertainties and position changes
