---
name: impeccable
description: Full front-end design workflow — classify a design request, apply the impeccable-hub register, and produce the work through the matching verb skill(s) (layout, typeset, colorize, bolder, quieter, delight, harden, polish, optimize, adapt, clarify, distill, overdrive, animation). Use for any substantial design task — "clean up the pricing page," "build this feature," "make this feel more premium" — not just single-word requests.
license: Apache 2.0. Based on Anthropic's frontend-design skill + Paul Bakaus's Impeccable. See NOTICE.md for attribution.
---

# Impeccable — the design workflow

This is the general entry point for design work in this pack. It reads a request, plans it, and does the work directly through the matching verb skill(s) — `layout`, `typeset`, `colorize`, `bolder`, `quieter`, `delight`, `harden`, `polish`, `optimize`, `adapt`, `clarify`, `distill`, `overdrive`, `animate`/`animation-engineering`, `threejs-patterns`/`three-js-animation`.

**Honest limitation vs. the original ORCA-OS version of this workflow**: the source system ran this as a multi-agent pipeline — a separate planner, a separate builder, and a separate fresh-context validator that judged the builder's output without seeing its reasoning, so the model never graded its own work. This app has no subagent mechanism, so all of that runs as ONE pass by you: plan, build, then self-check against the same rule list an independent validator would have used. Say so if the user asks how rigorous this is — it's a self-check, not an independent judgment.

## Step 0 — Load the register

Read the `impeccable-hub` skill (and its bundled `resources/` files as you reach for specific moves) before doing any design work. This is what keeps taste consistent instead of re-litigating the same rules every task.

## Step 1 — Classify the request

| Request is… | Route |
|---|---|
| improve / fix / clean up / polish an **existing** surface the user describes or pastes | **improve-existing** → decompose into ordered verb-tasks (Step 2), run each (Step 3) |
| build / create a **new** feature from scratch | **build-new** → run the `shape` skill's discovery interview first, then treat the resulting brief as the spec for Step 2-3 |
| a single named verb ("make this bolder", "fix the spacing") | **single-verb** → skip decomposition, run that one verb skill directly (Step 3) |

State the classification in one line, then proceed — don't stop to ask unless genuinely ambiguous.

## Step 2 — Decompose into ordered verb-tasks (multi-verb requests only)

For a request touching more than one dimension (e.g. "clean up the pricing page" → probably layout + typeset + colorize), plan the ordered task list yourself before touching anything:

- For each task, name: the verb, the target (file/component/section), the specific slop to avoid (cite the rant or `detector-rules.json` id from `impeccable-hub/resources/`), and the specific felt-state obligation the result must meet (derived from `voice-anchors.md` + the request).
- **Order structure before surface**: layout before colorize; typeset before polish. Fix the skeleton before the finish.
- **Class-scope the sweep.** When the request names a pattern (a slop tell, a component, a styling reflex), find and note every place that pattern shows up in what the user has shared — not just the one instance they pointed at. Say explicitly which instances you're touching and which you're deliberately leaving, and why.
- If genuinely ambiguous, ask one clarifying question; otherwise proceed.

## Step 3 — Do the work (per task, or the single task)

For each verb-task, in order:

1. **Bind** — before touching anything, state (to yourself and, briefly, to the user) the specific FORBIDDEN patterns this verb-on-this-target is at risk of (from the hub) and the specific FORWARD obligation (the felt-state property the result must have).
2. **Build** — do the work under those constraints, using the matching verb skill's craft (`layout`, `typeset`, `colorize`, etc.) and the user's own critique language verbatim where they've given it.
3. **Self-check** — walk the output against `impeccable-hub/resources/detector-rules.json`'s BLOCKING rule list by name. If you find one, fix it before moving on — don't report a blocking pattern and ship it anyway.
4. If you genuinely can't resolve a conflict (the request wants two things that fight each other), stop and ask, rather than silently picking one.

## Step 4 — Closing

After the work clears self-check, ask: "Anything here you'd push back on, or want done differently next time?" There's no shared project file this app writes to automatically — if the user gives you a strong standing preference, restate it clearly so they can pin it in their Project instructions for next time.

If the user critiques the result afterward, use the `recraft` skill to classify the scope of the redo rather than regenerating everything from scratch.

## The honest ceiling

This raises the floor (rules present by construction, no named slop, self-checked against a named rule list) — it does not manufacture taste. Good taste is irreducibly your judgment plus the user's eye. If someone claims a rule list alone produces good design, that's overselling it.
