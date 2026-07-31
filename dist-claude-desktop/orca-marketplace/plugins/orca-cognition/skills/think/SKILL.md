---
name: think
description: Run structured, multi-mode exploratory reasoning on a hard question using the cognition MCP as an external notepad. Use when the user asks to "think through" a problem, wants a constraint-chain exploration, or needs divergent analysis without committing to a decision yet (for that, use the problem-solve skill instead).
---

# Think — Constraint Chain Exploration

You explore a question by making multiple calls to the `cognition` MCP tool (server: `cognition-mcp`). The tool is a mirror — it **stores and echoes your reasoning, it does not generate it**. You do the thinking; the tool tracks it as a structured, resumable session and surfaces a `gateStatus` (PASS / SOFT_FAIL / HARD_FAIL) so you know when you've gone deep enough.

Include `verbose: true` in every call — since each turn typically makes only one or two calls, the echo IS how you see your own stored state back.

## Default flow

1. **Orient.** State what's uncertain about the question. If genuinely ambiguous, ask up to 2 scope questions (smart default first). Otherwise state your assumption and proceed.
2. **Difficulty gate.** Is this a simple question dressed up as complex? If yes, run ONE mode and go straight to harvest. Otherwise pick 2-3 modes:

| Mode | When | Operations |
|---|---|---|
| MAP | Confused, need territory | `systems`, `causal_analysis` |
| INVERT | Have a position, need weaknesses | `mental_model` (pre-mortem), `thought` (reflexion) |
| PERSPECTIVES | Stuck in one viewpoint | `collaborative_reasoning`, `thought` (steelman) |
| EDGES | Need options, analogies | `creative_thinking`, `analogical_reasoning` |
| META | Might be avoiding something | `meta` |
| DEEP | One question needs focus | 3 `thought` chains (analytical, intuitive, adversarial) |

3. **After each mode**, run a 3-question self-check (Is this shallow? What am I avoiding? What would a skeptic challenge?) and either VERIFY each concern raised (re-check the claim) or DEFER it explicitly with a reason — never raise and dismiss in the same breath. Then call `operation: "checkpoint"` with `phase`, `summary`, `keyFindings`, and any `addConstraints` (`FORWARD`/`FORBIDDEN`/`QUESTION`). Read `gateStatus` back: PASS -> harvest; SOFT_FAIL -> another mode (active constraint type suggests which); HARD_FAIL -> go deeper on the same mode.
4. **Guard against complexity-collapse.** If a mode produced a specific recommendation, treat the next mode as a COMPETING candidate on the ORIGINAL question, not an elaboration of the last one.
5. **Harvest.** Before writing the final checkpoint, run one `mental_model` pre-mortem on your emerging recommendation: does it match the scale of the original question, or did the analysis over-elaborate a simple problem? Name the simpler alternative if so. Then call `checkpoint` with `phase: "harvest"`, a 2-3 sentence summary, key findings, open questions (including deferred concerns), and next steps.

## Alternate modes

- **Quick pass**: skip orient/self-checks/constraints entirely; call `operation: "blind_orchestrate"` with `{problem, step: 0}`, read `nextPrompt`, answer naturally (no framework vocabulary), call again with your reasoning + incremented step, repeat until `done: true`.
- **Single named operation** (debug / decide / systems / causal / ooda / tree / beam / argue / analogy / stats / simulate / optimize / scientific / socratic / graph / ethical): run that one cognition-mcp operation directly as a focused capstone, no mode chain. Ask the user which specific technique if unclear, or infer from phrasing ("what if X fails" -> pre-mortem via mental_model; "options for X" -> tree_of_thought; "map this system" -> systems).

## Rendering

Cognition-mcp returns JSON. Never dump raw JSON to the user — extract the content and render as clean prose/markdown with real line breaks. The structured calls are the reasoning; the rendering is a separate presentation step.

## Output shape

Lead with findings, not process. No "Round 1 found X" narration. Curate 3-6 findings max, each a clear bolded statement with 1-2 sentences of support. Close with the actual answer to the question — no heading, no "after analyzing..." framing.

## Key operation schemas

```
thought: { thought, thoughtNumber, totalThoughts, nextThoughtNeeded, isRevision? }
mental_model: { modelName?, problem?, steps?, reasoning?, conclusion?, setup?, rootCauses?[{failure,cause,preventable}] }
systems: { system?, components?[{name,function}], relationships?[{from,to,type}], feedbackLoops? }
causal_analysis: { phenomenon, causes[{factor,type,strength,evidence?}], effects[{outcome,likelihood,timeframe}], chains[{sequence,probability}], interventions? }
collaborative_reasoning: { topic?, perspectives?[{role,viewpoint,arguments}], commonGround?, tensions?, synthesis? }
creative_thinking: { prompt?, techniques?, ideas?[{idea,potential,challenges}], synthesis? }
analogical_reasoning: { target, analogs[{domain,description,similarity}], mappings[{targetElement,analogElement,relationship}], insights, limitations }
tree_of_thought: { root, branches[{id,parent,thought,evaluation:{score,strengths,weaknesses,feasibility}}], currentPath, bestPath, pruned, synthesis }
decide: { statement, options[{name,description,pros,cons}], criteria, analysis, choice, nextThoughtNeeded }
checkpoint: { summary?, keyFindings?, phase?, addConstraints?[{type:'FORWARD'|'FORBIDDEN'|'QUESTION',text}], resolveConstraints?, deferConstraints?[{id,reason}], gateCheck?{selfCheckPassed,depthGatePassed,notes} }
```

Related skills: `deepthink` (adds adaptive pre-mortems after conclusions), `problem-solve` (convergent — decides and commits), `think-model` (applies one named mental model).
