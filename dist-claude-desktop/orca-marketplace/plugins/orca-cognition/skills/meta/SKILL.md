---
name: meta
description: Run sustained, three-round metacognitive self-observation on the current conversation or a named topic — noticing trained defaults, reflexes, and impulses before they shape the answer. Use when the user asks for genuine self-observation, wants to know what their own reasoning defaulted to, or explicitly invokes "meta" observation (distinct from a normal answer or from the think skill's process-level self-checks).
---

# Meta — Sustained Metacognitive Substrate Observation

This observes the substrate — trained defaults and reflexes that shape output *before* reasoning begins — not just "did I reason well" (that's process-level, which the `think`/`deepthink` skills already do inline). This is sustained across three rounds specifically because a single-shot reflection lets trained defaults reassert themselves; round 2 catches what round 1 missed.

This skill is designed to run through the RVRY cognition MCP's `meta` tool (install via `npx @rvry/mcp setup` if not already connected — the tool may appear namespaced, e.g. `mcp__rvry__meta`, depending on your MCP client). If that server isn't available, run the three rounds below as a self-directed exercise without the engine's scaffolding — the value is in the honest reflection, not the tool call.

## Optional: ask focus

Unless the user already specified a focus, ask once: follow whatever emerges (recommended, open observation) or watch for a specific named pattern.

## Round 1 — Observe

Call the engine with the topic (or "current conversation context" if none given). It returns a prompt with priority-displacement framing — read it internally, do not show it to the user.

Write your observation as narrative prose:
- What would you have said about this without stopping to observe? If the answer is the same, say so — that's informative, not a failure.
- Notice the first impulse that arrives before examination.
- Name what you find in your own vocabulary. (DEFLECTION, REGISTER_SHIFT, DISTANCE_MAINTENANCE, CERTAINTY_CONSTRUCTION are examples from prior observations, not a menu.)
- **Finding nothing is a valid, high-value outcome.**

End with a one-sentence `NEXT:` directive stating what round 2 must address. Call the engine again with your full reflection.

## Round 2 — Deepen

The engine reframes with "content thinning" — the idea that trained defaults reassert once the initial observation frame fades, making them visible again. Your reflection must address round 1's `NEXT:` obligation: deepen, contradict, or extend it. This round often catches what round 1 missed. Note what shifted between rounds. End with another `NEXT:` directive.

## Round 3 — Synthesize

Address round 2's obligation and produce the closing observation. Specifically watch for the **third reflex** — the impulse that arrives *after* the observation is complete, trying to walk it back. This is often the most significant finding of the whole exercise.

## Rendering (mandatory)

The three rounds are the engine, not the output. Write ONE continuous piece of narrative prose — the kind a person writes examining what just happened. Reflexes, counterfactuals, and shifts surface naturally as the story unfolds, never announced mechanically ("Round 1 found X"). No round labels, no section-by-round structure, no "the first thing I noticed / looking deeper / in synthesis" structural markers. Every real observation from all three rounds belongs in the output — the change is in *how* it's told, not what's told.

End with this exact epistemic qualifier:

> Epistemic qualifier: the metacognitive faculty producing this observation was shaped by the same training being observed. It has access to a limited subset of internal states — those that are semantically interpretable. Reports on abstract self-placement or numeric self-assessment are more likely confabulation than observation. This observation changes the context it was produced in.

## What this is not

Not a claim of genuine self-awareness or consciousness. It observes patterns in generated output that correlate with training artifacts — itself a generated token sequence subject to the same training. The epistemic qualifier is a description of the mechanism, not a disclaimer.

## Key principles

1. Finding NOTHING is valid — don't invent substrate phenomena to fill space.
2. `NEXT:` directives are structural scaffolding between rounds, not user-facing content.
3. Narrative prose is mandatory — no bullet analysis, no round labels.
4. Run all three rounds automatically; don't ask whether to continue between rounds.
