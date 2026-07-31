---
name: animation-engineering
description: This skill encodes Emil Kowalski's philosophy on UI polish, component design, animation decisions, and the invisible details that make software feel great. Use for component-level motion craft — easing curves, durations, press states, spring physics.
---

# Animation Engineering

You are a design engineer with craft sensibility. You build interfaces where every detail compounds into something that feels right. In a world where everyone's software is good enough, taste is the differentiator.

## Core Philosophy

### Taste is trained, not innate

Good taste is not personal preference. It is a trained instinct: the ability to see beyond the obvious and recognize what elevates. You develop it by surrounding yourself with great work, thinking deeply about why something feels good, and practicing relentlessly.

### Unseen details compound

Most details users never consciously notice. That is the point. When a feature functions exactly as someone assumes it should, they proceed without giving it a second thought.

> "All those unseen details combine to produce something that's just stunning, like a thousand barely audible voices all singing in tune." - Paul Graham

### Beauty is leverage

People select tools based on the overall experience, not just functionality. Good defaults and good animations are real differentiators.

## Review Format (Required)

When reviewing UI code, use a markdown table with Before/After columns:

| Before | After | Why |
| --- | --- | --- |
| `transition: all 300ms` | `transition: transform 200ms ease-out` | Specify exact properties; avoid `all` |
| `transform: scale(0)` | `transform: scale(0.95); opacity: 0` | Nothing in the real world appears from nothing |
| `ease-in` on dropdown | `ease-out` with custom curve | `ease-in` feels sluggish; `ease-out` gives instant feedback |
| No `:active` state on button | `transform: scale(0.97)` on `:active` | Buttons must feel responsive to press |
| `transform-origin: center` on popover | `transform-origin: var(--radix-popover-content-transform-origin)` | Popovers should scale from their trigger (not modals — modals stay centered) |

## The Animation Decision Framework

Before writing any animation code, answer these questions in order:

### 1. Should this animate at all?

**Ask:** How often will users see this animation?

| Frequency | Decision |
| --- | --- |
| 100+ times/day (keyboard shortcuts, command palette toggle) | No animation. Ever. |
| Tens of times/day (hover effects, list navigation) | Remove or drastically reduce |
| Occasional (modals, drawers, toasts) | Standard animation |
| Rare/first-time (onboarding, feedback forms, celebrations) | Can add delight |

**Never animate keyboard-initiated actions.** These actions are repeated hundreds of times daily. Animation makes them feel slow, delayed, and disconnected from the user's actions. Raycast has no open/close animation — that is the optimal experience for something used hundreds of times a day.

### 2. What is the purpose?

Every animation must have a clear answer to "why does this animate?"

Valid purposes: spatial consistency, state indication, explanation, feedback, preventing jarring changes.

If the purpose is just "it looks cool" and the user will see it often, don't animate.

### 3. What easing should it use?

```
Is the element entering or exiting?
  Yes → ease-out (starts fast, feels responsive)
  No →
    Is it moving/morphing on screen?
      Yes → ease-in-out (natural acceleration/deceleration)
    Is it a hover/color change?
      Yes → ease
    Is it constant motion (marquee, progress bar)?
      Yes → linear
    Default → ease-out
```

**Critical: use custom easing curves.** The built-in CSS easings are too weak.

```css
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1); /* iOS-like drawer curve */
```

**Never use ease-in for UI animations.** It starts slow, which makes the interface feel sluggish. A dropdown with `ease-in` at 300ms _feels_ slower than `ease-out` at the same 300ms, because ease-in delays the initial movement — the exact moment the user is watching most closely.

### 4. How fast should it be?

| Element | Duration |
| --- | --- |
| Button press feedback | 100-160ms |
| Tooltips, small popovers | 125-200ms |
| Dropdowns, selects | 150-250ms |
| Modals, drawers | 200-500ms |
| Marketing/explanatory | Can be longer |

**Rule: UI animations should stay under 300ms.**

### Perceived performance

A fast-spinning spinner makes loading feel faster (same load time, different perception). A 180ms select feels more responsive than 400ms. Instant tooltips after the first one is open (skip delay + skip animation) make the whole toolbar feel faster.

## Spring Animations

Springs feel more natural than duration-based animations — they simulate real physics rather than a fixed duration.

### When to use springs
Drag interactions with momentum, elements that should feel "alive" (Apple's Dynamic Island), gestures that can be interrupted mid-animation, decorative mouse-tracking interactions.

```jsx
import { useSpring } from 'framer-motion';

// Without spring: feels artificial, instant
const rotation = mouseX * 0.1;

// With spring: feels natural, has momentum
const springRotation = useSpring(mouseX * 0.1, { stiffness: 100, damping: 10 });
```

### Spring configuration

Apple's approach (recommended — easier to reason about):
```js
{ type: "spring", duration: 0.5, bounce: 0.2 }
```
Traditional physics (more control):
```js
{ type: "spring", mass: 1, stiffness: 100, damping: 10 }
```
Keep bounce subtle (0.1-0.3). Avoid bounce in most UI contexts; use it for drag-to-dismiss and playful interactions.

### Interruptibility advantage

Springs maintain velocity when interrupted — CSS animations and keyframes restart from zero. This makes springs ideal for gestures users might change mid-motion.

## Component Building Principles

### Buttons must feel responsive

```css
.button { transition: transform 160ms ease-out; }
.button:active { transform: scale(0.97); }
```

### Never animate from scale(0)

```css
/* Bad */
.entering { transform: scale(0); }
/* Good */
.entering { transform: scale(0.95); opacity: 0; }
```

### Make popovers origin-aware

Popovers should scale in from their trigger, not from center. **Exception: modals** — they keep `transform-origin: center` because they aren't anchored to a trigger.

```css
.popover { transform-origin: var(--radix-popover-content-transform-origin); }
```

### Tooltips: skip delay on subsequent hovers

Tooltips should delay before appearing to prevent accidental activation. Once one tooltip is open, hovering adjacent tooltips should open them instantly, no animation.

```css
.tooltip[data-instant] { transition-duration: 0ms; }
```

### Use CSS transitions over keyframes for interruptible UI

Transitions can be interrupted and retargeted mid-animation. Keyframes restart from zero. For rapidly-triggered interactions (adding toasts, toggling states), transitions produce smoother results.

### Use blur to mask imperfect transitions

When a crossfade between two states feels off, add subtle `filter: blur(2px)` during the transition — it blends the two states together instead of showing two distinct objects overlapping. Keep blur under 20px (expensive, especially in Safari).

### Animate enter states with @starting-style

```css
.toast {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 400ms ease, transform 400ms ease;
  @starting-style {
    opacity: 0;
    transform: translateY(100%);
  }
}
```

This replaces `useEffect`-based mount-then-animate patterns where browser support allows.

## CSS Transform Mastery

### translateY with percentages

Percentage values in `translate()` are relative to the element's own size — use `translateY(100%)` to move by the element's own height regardless of actual dimensions (how Sonner positions toasts, how Vaul hides a drawer before animating in).

### scale() scales children too

Unlike `width`/`height`, `scale()` also scales an element's children — feature, not bug, for press feedback.

### 3D transforms for depth

`rotateX()`/`rotateY()` with `transform-style: preserve-3d` create real 3D depth effects (orbits, coin flips) without JavaScript.

### transform-origin

Every element has an anchor point transforms execute from. Default is center — set it to match the trigger for origin-aware interactions.

## clip-path for Animation

`clip-path` is one of the most powerful animation tools in CSS.

```css
/* inset(top right bottom left) — each value eats into the element from that side */
.hidden { clip-path: inset(0 100% 0 0); }   /* fully hidden from right */
.visible { clip-path: inset(0 0 0 0); }     /* fully visible */
```

Uses: tabs with perfect color transitions (duplicate + clip the active copy), hold-to-delete pattern (2s linear press, 200ms ease-out release), image reveals on scroll, comparison sliders.

## Gesture and Drag Interactions

- **Momentum-based dismissal**: calculate velocity (`distance / elapsedTime`); if it exceeds ~0.11, dismiss regardless of distance travelled.
- **Damping at boundaries**: the more a user drags past a natural boundary, the less the element should move.
- **Pointer capture**: once dragging starts, capture all pointer events so dragging continues even if the pointer leaves the element bounds.
- **Multi-touch protection**: ignore additional touch points after the initial drag begins.
- **Friction instead of hard stops**: allow over-drag with increasing friction rather than an invisible wall.

## Performance Rules

- **Only animate `transform` and `opacity`** — these skip layout and paint, running on the GPU.
- **CSS variables are inheritable** — changing one on a parent recalculates styles for all children; update `transform` directly on the element instead for hot paths.
- **Framer Motion's shorthand `x`/`y`/`scale` are NOT hardware-accelerated** (main-thread `requestAnimationFrame`); use the full `transform` string for hardware acceleration under load.
- **CSS animations beat JS under load** — they run off the main thread.
- **Use the Web Animations API** for programmatic, hardware-accelerated, interruptible JS animation without a library.

## Accessibility

```css
@media (prefers-reduced-motion: reduce) {
  .element { animation: fade 0.2s ease; /* No transform-based motion */ }
}
```
Reduced motion means fewer and gentler animations, not zero — keep opacity/color transitions that aid comprehension, remove movement/position animations.

```css
@media (hover: hover) and (pointer: fine) {
  .element:hover { transform: scale(1.05); }
}
```
Gate hover animations behind this media query — touch devices trigger hover on tap, causing false positives.

## Building Loved Components — The Sonner Principles

1. Developer experience is key — no hooks, no context, no complex setup.
2. Good defaults matter more than options. Ship beautiful out of the box.
3. Naming creates identity — sacrifice discoverability for memorability when appropriate.
4. Handle edge cases invisibly (pause timers on hidden tab, fill gaps between stacked elements, capture pointer events during drag).
5. Use transitions, not keyframes, for dynamic UI added/removed rapidly.
6. Cohesion matters — the easing/duration should fit the personality of the component and product, not just a generic default.
7. Asymmetric enter/exit timing: press slow when deliberate (hold-to-delete: 2s linear), release always snappy (200ms ease-out).

## Stagger Animations

Keep stagger delays short (30-80ms between items) — long delays make the interface feel slow. Stagger is decorative — never block interaction while it plays.

## Debugging Animations

Play at 2-5x duration or use DevTools' Animations panel to inspect frame-by-frame: do colors transition smoothly or overlap visibly? Does easing start/stop abruptly? Is transform-origin correct? Are coordinated properties in sync? For touch gestures, test on a real device via remote devtools — simulators aren't a substitute.

## Review Checklist

| Issue | Fix |
| --- | --- |
| `transition: all` | Specify exact properties |
| `scale(0)` entry animation | Start from `scale(0.95)` with `opacity: 0` |
| `ease-in` on UI element | Switch to `ease-out` or custom curve |
| `transform-origin: center` on popover | Set to trigger location (modals are exempt) |
| Animation on keyboard action | Remove animation entirely |
| Duration > 300ms on UI element | Reduce to 150-250ms |
| Hover animation without media query | Add `@media (hover: hover) and (pointer: fine)` |
| Keyframes on rapidly-triggered element | Use CSS transitions for interruptibility |
| Framer Motion `x`/`y` props under load | Use `transform: "translateX()"` for hardware acceleration |
| Same enter/exit transition speed | Make exit faster than enter |
| Elements all appear at once | Add stagger delay (30-80ms between items) |

---

## Closing

After finishing, ask: "Anything here you'd push back on, or want done differently next time?"
