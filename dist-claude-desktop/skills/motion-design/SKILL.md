---
name: motion-design
description: Heavy motion/animation workflow — loads the full motion craft spine (easing, durations, press states, three-tier routing, felt-state framing) for substantial animation work on an interface. Use for real motion pipelines, not a single quick tweak (for a light single pass, the user can just ask for the `animate` skill directly).
---

# Motion Design — the full motion pipeline

Use this for real motion work spanning multiple interactions or a whole flow. For a light single pass, the `animate` skill alone is enough.

## Load the motion craft context

Before any analysis or work, read (in this order):

1. **`impeccable-hub`** — the register: the `interfaces-that-feel` felt-state baseline (emotional register, earned emotion, physical-world vocabulary) plus the voice anchors, rants, preferences, and self-check rule list.
2. **`animation-engineering`** — Emil Kowalski's craft spine (custom easing, durations, press states, invisible details).
3. **`motion-design-principles`** — three-tier routing + composition rules + anti-patterns.
4. If the target involves scroll, parallax, pinning, scrubbing, or smooth-scroll: also **`lenis-integration`**.

## Context gathering

Ask the user (or read what they've pasted) for: the existing motion register if any (custom easing curves, duration scale, press-state conventions already in use elsewhere in the product), and the emotional register of the product (what the motion needs to feel like — see `interfaces-that-feel`'s calibration table).

## Three-tier routing decision

Present the tier choice explicitly. Never auto-escalate — default is CSS.

| Tier | Technology | When |
|------|-----------|------|
| **Default** | CSS (`animation-timeline: scroll()`, `@starting-style`, View Transitions API, transitions, keyframes) | Transitions, state changes, scroll-linked, entrance/exit, most UI motion. |
| **Escalate** | GSAP (+ ScrollTrigger, SplitText, Lenis) | Timeline choreography, pinning, scrub, split-text, sequence coordination. Confirm with the user before implementing. |
| **Escalate** | Three.js | Inherently 3D scenes. Confirm with the user before implementing. |

State the motion's nature (transition / timeline / 3D), recommend a tier, and if recommending GSAP or Three.js, get explicit confirmation before building.

## Enforcement — Emil's craft

- Use custom easing curves — never bare `ease`, `ease-in-out`, or default `linear` for UI motion.
- Establish a duration scale (fast/medium/slow) and stay consistent with it across the piece.
- Apply press states for interactive elements (scale-down on active, not just hover).
- Apply the invisible details: subtle parallax of intrinsic (2D) elements, micro-delays between sibling elements in a stagger.

## Enforcement — directional, not perspective

Refuse, without negotiation, unless the target is explicitly a 3D scene (Three.js tier):
- 3D CSS transforms (`rotateX`, `rotateY`, `perspective`, `transform-style: preserve-3d`)
- Device-orientation-driven tilt effects
- Parallax-Z (depth-layer parallax) — directional parallax (2D offset on scroll) is fine
- Tilt cards, flip cards, and other simulated-depth interactions

If the user requests any of these, explain the refusal and offer a directional (2D) alternative instead.

## Enforcement — felt-state framing

Before committing to a motion, ask: does this motion match the user's emotional state at this moment in the flow? A celebratory motion on an error screen is an anti-pattern regardless of how well-crafted the easing is. Pull framing from `interfaces-that-feel`'s earned-emotion table.

## Self-check

Before calling the work done, walk it against: bounce/elastic easing anywhere in UI motion, default-ease transitions, any of the directional-not-perspective refusals above, and `prefers-reduced-motion` coverage on every animation added.

## Closing

Ask: "Anything here you'd push back on, or want done differently next time?" If the user critiques the result, use the `recraft` skill to classify the scope of the redo.
