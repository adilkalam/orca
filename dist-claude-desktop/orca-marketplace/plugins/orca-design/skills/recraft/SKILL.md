---
name: recraft
description: Handle a redo or "this isn't right" critique on prior design work by classifying the scope of the problem (one element, a whole feature, or the underlying brief) and routing to the right depth of rework, instead of blindly regenerating everything from a rule list. Use when the user says "redesign this", "try again", "this sucks", "start over", or gives pointed criticism of design output.
license: Apache 2.0. Based on Anthropic's frontend-design skill + Paul Bakaus's Impeccable. See NOTICE.md for attribution.
---

# Recraft — the try-again coordinator

The redo skill. **A thin router, not a generator.** When work fails the eye or the user critiques it, classify the scope of the problem first, then route to the appropriately-sized rework. Do not regenerate everything from a rule list — design's failure modes are unbounded, so no fixed checklist catches them all; the fix is asking the right question about scope, then applying human judgment (yours + the user's) at that scope.

Use `recraft` when the user is unhappy with prior output and wants it redone. Use a single verb skill directly (e.g. `layout`, `polish`) when the current work is roughly right and they want one additive pass over it.

## Step 1 — Capture the critique verbatim

Before doing anything else, restate the user's critique back to them in your own summary line, but keep their exact words available for the rest of this session — verbatim language is load-bearing for what you build next; don't paraphrase away the specific complaint.

## Step 2 — Classify the scope

Ask the user which of these matches (offer as explicit options, don't guess):

- **A — Single-element issue.** One panel, one component, one typography moment — an iteration on a specific piece.
- **B — Whole-feature redo.** The overall direction was right but the execution missed it broadly.
- **C — Brief/contract failure.** The underlying design direction itself (the tokens, the register, the strategic brief) is what's wrong, not just the execution of it.

## Step 3 — Route

### Route A — Single element

Identify the specific target (which component, which region). Read the `impeccable-hub` skill, then rebuild just that element under the user's critique as the primary constraint, offering 2-3 concrete variants if the direction is genuinely unclear rather than committing to one guess. This does NOT regenerate the whole page — only the named piece.

### Route B — Whole-feature redo

1. Re-run the discovery questions from the `shape` skill, anchored specifically on what went wrong — even if a shape pass happened before, the critique reveals it missed something.
2. Propose 1-3 concrete directions (composition, hero treatment, density, color) in words before writing anything — get the user's pick on direction before rebuilding.
3. Rebuild against the chosen direction using the relevant verb skill(s) (see the `impeccable` skill's decomposition step), folding the captured critique in as the primary constraint to avoid repeating.

### Route C — Brief/contract failure

This is the most expensive route, because the fix is updating the underlying direction, not re-running a build against an already-wrong brief. Ask which layer is wrong — the strategic register (who this is for, what it should never feel like) or the visual contract (colors, type, components) — and revisit that with the user directly (the `design-md` skill's interview can help structure the visual side) before building anything new.

## Step 4 — Closing

After the routed rework lands, ask: "Anything here you'd push back on?" If the same critique comes up twice across two different routes, that's a signal the underlying brief is the actual problem — escalate to Route C explicitly rather than looping A or B against a brief that's wrong at the root.

## Refusals

This skill refuses to:
- Regenerate an entire surface from a rule checklist without first classifying scope — design's failure modes are unbounded; a fixed rule list cannot catch them all, and skipping scope classification produces a rebuild that passes every mechanical check while still being wrong.
- Skip the direction-pick step on a whole-feature redo — proposing options and getting a pick is the actual binding step; skipping it just produces another guess dressed up as ceremony.
