# Preference: Motion References (editorial / page-scale)

## Verbatim

> Examples of smooth, elegant, motion — not perspective, just directional. And not a "I like this design" necessarily either.

## What this is about

This is a **different motion register** than UI micro-interactions. DESIGN_OCD_META_RULES handles UI feedback motion (≤8px travel, ≤300ms, spring easing). This file handles editorial / page-scale motion — scroll-driven reveals, cinematic transitions, staggered entries, page choreography. The motion that carries a user through a page, not the motion that confirms a button press.

Three defining properties of the preferred register:

1. **Directional, not perspective.** Motion happens in 2D — translation along X/Y, fades, clip-path reveals, mask animation. Not 3D transforms. Not tilt effects. Not camera-dolly parallax. Not "every element has a z-axis." Flat-plane motion, executed cleanly.

2. **Smooth, elegant.** The easing is considered. Durations are tuned. Staggering has rhythm. The motion doesn't interrupt; it carries. This is the opposite of the "everything bounces on hover" AI default.

3. **The motion is separable from the design.** The user explicitly noted: *"not a 'I like this design' necessarily."* Some of these references have aesthetics he wouldn't ship himself. The motion patterns are what's being pointed at, not the whole visual treatment.

## The reference set

These are sites Adil has identified as carrying the register. **Not prescriptions** — collection references. When the LLM needs inspiration for page/editorial motion, look here.

### Standard tier

| Site | URL | Register |
|---|---|---|
| Mainframe Manifesto | https://manifesto.mainframe.inc/?ref=maxibestof.one | Long-form editorial scroll. Text-reveal patterns, staggered paragraphs, sectional rhythm. |
| Glyphic | https://www.glyphic.bio/ | Product-company scroll. Mixed media reveals, probably mask-based. Biotech register. |
| Odin's Crow | https://www.odins-crow.com/?ref=godly | Godly-featured. Sophisticated staged motion. |
| Benjamin Righetti | https://benjaminrighetti.netlify.app/ | Portfolio. Smooth transitions, reveals on scroll. |
| Optikka | https://optikka.com/ | Eyewear / editorial product. Motion serving composition. |

### Higher tier

| Site | URL | Register |
|---|---|---|
| Stone Style | https://stonestyle.co.th/ | Thai luxury brand. Editorial motion at premium fidelity. |
| Optikka | https://optikka.com/ | (same as above; user listed twice — flagged as meaningful) |
| Impeccable.style | https://impeccable.style/ | Bakaus's own showcase. Motion matches the craft the skill prescribes. |

## What to extract when referencing these

When the LLM is designing a page and the project calls for editorial motion, the spine should:

1. **Point at this list.** The list itself is the reference — the LLM reads the URLs and infers patterns.
2. **Propose 2-3 motion directions** grounded in what these sites do (staggered-scroll-reveal, mask-based-transition, directional-slide-with-easing, etc.) — never auto-pick.
3. **Apply the register constraints**:
   - 2D translation only. No `perspective()` CSS. No `rotateY()` / `rotateX()` for depth.
   - No parallax-with-z-axis (scroll-tied X/Y movement is fine; layered 3D depth is not).
   - No page-tilt. No device-motion reactivity.
   - Smooth easing. Custom cubic-beziers, not default ease.
   - Stagger has rhythm — not the everything-appears-together default.
4. **Respect the layering**: UI micro-interactions (buttons, hovers) still follow DESIGN_OCD_META_RULES (≤8px, ≤300ms, spring). Editorial motion operates above that layer.

## Specific techniques these sites likely use

Without deep-fetching each (which would be out of scope for this capture), the patterns the register implies:

- **GSAP ScrollTrigger** or Motion One for scroll-driven sequences
- **Clip-path reveals** (`inset()` animations) — directional text and image unveilings
- **Translate + opacity** staggered entries — each element slides up/in with delay
- **Mask-based transitions** — SVG mask reveals or CSS mask-image animations
- **Linked scroll**: text pinned while adjacent content scrolls, then released
- **Horizontal scroll sections** (occasionally, when the content calls for it)
- **Lenis smooth scroll** for the scroll feel itself — addressed separately in the motion-layer skills

## Anti-patterns this register explicitly refuses

| Anti-pattern | Why refused |
|---|---|
| 3D flip transitions | Perspective. Refused. |
| Tilt-on-mouse-move card effects | Perspective. Also: the "every card rotates slightly as mouse passes" pattern is dated. |
| Device orientation / gyroscope effects | Perspective. Also: accessibility concern. |
| Parallax layers stacked in z-axis | Perspective. |
| Hero video auto-playing with slow-zoom | Editorial-video clichés are their own failure. |
| "Whole page zooms on scroll" | Not directional; scale-based; refused. |
| Text that types itself out character-by-character | Not the register. |
| Cursor-trail effects | Performative. Refused. |
| Element-follows-mouse effects | Decorative. Refused. |
| Bouncy / elastic easing on reveals | Covered by UI-motion rules in DESIGN_OCD; applies here too at the editorial scale. |

## The distinction this file preserves

Two motion layers coexist:

1. **UI feedback motion** — buttons, hovers, toggles, state changes. Rules from DESIGN_OCD_META_RULES § Motion. Small, tight, spring-eased.
2. **Editorial / scroll motion** — page reveals, section transitions, staggered content entries, scroll-linked choreography. Rules from this file. 2D only, smooth, directional, carries the user through the page.

Both layers exist on the same page simultaneously. A landing page has editorial scroll motion (sections reveal as user scrolls) AND UI micro-motion (buttons press, dropdowns open). The spine knows which layer is operating and applies the right rules.

The motion-design-principles skill (installed as a peer) already codifies the three-tier routing (CSS / GSAP+Lenis / Three.js). This file adds: **within those tiers, the register is directional-not-perspective, smooth-not-suddenness, elegant-not-showy.** The tier routes the technique; this file shapes the character.

## Future work

When a project is actually being built and needs specific motion direction, this file can grow by:

- Adding screenshots of specific moments from the reference sites that capture a move cleanly
- Capturing specific timing / easing choices from a reference (if reverse-engineered from source)
- Adding new references as Adil encounters motion that belongs in the set
- Removing references that stop carrying the register as they age

The list is alive. The register is stable.
