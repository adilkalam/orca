---
name: motion-design
description: "Heavy motion/animation orchestrator — loads Emil's craft spine + 3-tier routing + felt-state baseline. Use for full motion pipeline work."
argument-hint: "<target of motion>"
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - Bash
  - Skill
  - AskUserQuestion
---

# /motion-design — Motion/Animation Pipeline

Heavy orchestrator. Use this for real motion work. For a light pass, the user calls `/refine --animate` instead.

## Load the motion craft context (every invocation)

Load these skills — the hub for the aesthetic, the motion skills for the craft spine — before any analysis or work:

- `Skill("impeccable-hub")` — the single home for the aesthetic (the `interfaces-that-feel` felt-state baseline — emotional register, earned emotion, physical-world vocabulary — plus the voice anchors, banned rules, preferences, detector contract). This is what binds the aesthetic by construction; do not skip it — this command exists because the felt-state baseline was previously disconnected from motion work.
- `Skill("animation-engineering")` — Emil Kowalski's craft spine (custom easing, durations, press states, invisible details).
- `Skill("motion-design-principles")` — three-tier routing + composition rules + anti-patterns.
- If the target mentions scroll, scroll-driven, parallax-distance, pin, scrub, or smooth-scroll: also `Skill("lenis-integration")`.

The hub points to the canonical motion refs (`~/.claude/docs/concepts/design-contract/banned/motion-suddenness.md`, `~/.claude/docs/concepts/design-contract/preferences/motion-references.md`, `~/.claude/docs/concepts/design-contract/voice-anchors.md`); read them when you reach for the corresponding move. This file carries **zero copies** of those rules (`#POISON_PATH` re-inlining).

## The shared design lane (how motion feel is judged)

Motion work is gated by the **one shared lane**, defined once at **`~/.claude/docs/reference/design-lane.md`** — never re-described here (`#POISON_PATH` duplication; copy-pasting the lane's steps is exactly what bloated this file). The lane is: the orchestrator (this main thread) **binds** typed FORBIDDEN/FORWARD constraints via a cognition `checkpoint` and records the returned ids to `{current-project}/.orca/orchestration/phase_state.json → planning.bound_constraint_ids` → spawns `Agent(design-builder)` to produce the artifact under those ids → spawns `Agent(design-validator)` (fresh context) which returns `GATE_VERDICT: PASS|BLOCK` → **branches** (PASS hands back; BLOCK loops the builder with the findings, **MAX N=2**, then escalates to the user).

**Motion-specific bind input.** When binding for a motion task, emit:
- Motion `FORBIDDEN`s citing their detector ids: `bounce-easing`, `bouncy-easing`, `default-ease-transition`, `layout-transition` — e.g. `{type:"FORBIDDEN", text:"bounce/elastic easing (detector:bouncy-easing)"}`.
- Banned-rule refusals (cite `banned:motion-suddenness`): 3D CSS transforms (`rotateX`/`rotateY`/`perspective`/`preserve-3d`), device-orientation tilt, parallax-Z (depth-layer), tilt/flip cards — directional-not-perspective.
- One or more `FORWARD` items derived at runtime from `voice-anchors.md` + the task — the felt-state obligations (smooth/elegant/directional motion that matches the user's emotional state at this moment in the flow).

The `design-validator` (fresh context) judges the produced motion against these bound ids — that is how motion feel (which the detector is blind to: it cannot read timing/emotion) gets adjudicated externally, not self-graded. Skipping the bind ⇒ no bound ids ⇒ the validator returns `BLOCK: no bound constraints`. Interactive mid-build critique stays **in-thread** (FR-6) — carry the user's critique verbatim into the builder. Read the lane file for the full step-by-step.

## Context gathering

1. Read `{current-project}/DESIGN.md`. Focus on the **motion register** section (custom easing curves, duration register, press-state rules — the concrete visual tokens). Also read `{current-project}/PRODUCT.md` for the **emotional register** (the felt-state the motion must match).
2. If `DESIGN.md` is missing, empty, or the motion register is unpopulated: stop and route the user to `/impeccable --document` first (which generates DESIGN.md). If `PRODUCT.md` is also absent, route to `/impeccable --teach` first. Resume after they return.

(The motion banned rule + preferences + voice-anchors are already loaded by the entry bind above.)

## Three-tier routing decision

Present the tier choice to the user. Never auto-escalate. Default is CSS.

| Tier | Technology | When |
|------|-----------|------|
| **Default** | CSS (`animation-timeline: scroll()`, `@starting-style`, View Transitions API, transitions, keyframes) | Transitions, state changes, scroll-linked, entrance/exit, most UI motion. |
| **Escalate** | GSAP (+ ScrollTrigger, SplitText, Lenis) | Timeline choreography, pinning, scrub, split-text, sequence coordination. Requires explicit user confirmation. |
| **Escalate** | Three.js | Inherently 3D scenes. Requires explicit user confirmation. |

Present the assessment:
- State the motion's nature (transition / timeline / 3D).
- Recommend the tier (CSS unless inherently in a higher tier).
- If recommending GSAP or Three.js, ask the user to confirm escalation before implementing.

## Enforcement — Emil's craft

Pull from the project's motion register (`DESIGN.md`):
- Use the **custom easing curves** declared there (never `ease`, `ease-in-out`, or default `linear` — those are refused).
- Use the **duration register** (fast/medium/slow values declared per project).
- Apply **press states** for interactive elements (scale-down on active, not on hover).
- Apply **invisible details** (subtle parallax of intrinsic elements, not z-axis; micro-delays between sibling elements).

## Enforcement — directional-not-perspective (Adil's rule)

Refuse, without negotiation:
- 3D CSS transforms (`rotateX`, `rotateY`, `perspective`, `transform-style: preserve-3d`).
- Device-orientation-driven tilt effects (except where the target is explicitly a 3D scene via Three.js tier).
- Parallax-Z (depth-layer parallax). Directional parallax (2D offset on scroll) is fine.
- Tilt cards, flip cards, and other simulated-depth interactions.

If the user requests any of the above, explain the refusal (cite `banned/motion-suddenness.md` and `preferences/motion-references.md`), and offer a directional alternative.

## Enforcement — felt-state framing

Before committing to a motion, ask: does this motion match the user's emotional state at this moment in the flow? A celebratory motion on an error screen is an anti-pattern. Pull framing from `interfaces-that-feel`.

## Work

Implement the motion through the **shared lane** (above / `~/.claude/docs/reference/design-lane.md`): the bind (motion-specific FORBIDDEN/FORWARD) is already emitted; the `design-builder` produces the motion under those ids using the selected tier, the project's motion register, and the above enforcement rules. Preserve reduced-motion preferences (`prefers-reduced-motion: reduce`). The above directional-not-perspective refusals are bound as FORBIDDEN constraints, so the validator enforces them — but the builder must honor them by construction, not rely on the gate to catch them.

## Verification (the shared lane's validator does the gating)

The implemented motion is gated by the lane's `design-validator` (fresh context) — NOT a verifying gate re-described here. The validator is the hard FLOOR: it runs the local detector (`node /Users/adilkalam/ORCA-OS/mcp/design-detector/bin/designcheck.js` on the produced path), maps findings to the bound motion FORBIDDEN ids (the detector is **motion-blind to timing/feel** — it catches `bounce-easing`/`bouncy-easing`/`default-ease-transition`/`layout-transition` and the broader slop set if the change touches non-motion CSS, but cannot read emotion), and judges the FORWARD obligations — chiefly whether the motion matches the user's emotional state at this moment in the flow (a celebratory motion on an error screen is an anti-pattern). It returns `GATE_VERDICT: PASS|BLOCK`. BLOCK loops the builder with the combined findings (MAX N=2, then escalate to the user). The orchestrator never grades its own output; an empty `planning.bound_constraint_ids` means the bind was skipped and the validator returns `BLOCK: no bound constraints`.

**Optional parallel hygiene check.** If the project has `scripts/audit-design.sh`, optionally run it after the lane:

```bash
bash {current-project}/scripts/audit-design.sh
```

The `audit-design.sh` script informs but does not gate — the lane's validator is the hard FLOOR; the user's eye is the taste CEILING. If the user critiques the output, escalate to `/recraft "<critique>"` (the thin-coordinator redo command). If the project has no `scripts/audit-design.sh`, skip this step.

## Handback

Aesthetic capture is owner-gated — see ~/.claude/docs/reference/design-lane.md (Aesthetic capture). No closing capture question.
