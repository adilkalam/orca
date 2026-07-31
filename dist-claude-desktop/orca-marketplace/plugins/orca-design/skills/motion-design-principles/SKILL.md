---
name: motion-design-principles
description: Three-tier animation decision framework, composition rules, anti-patterns, and responsive animation principles. Foundation for all motion work — the routing skill the `animate`/`overdrive` skills load first.
---

# Motion Design Principles

## Three-Tier Animation Decision Tree

Choose the SIMPLEST tier that achieves the effect. Never escalate without reason.

### Tier 1: CSS Scroll-Driven Animations
**Use when:** Simple reveals, hover effects, viewport-triggered fades.
**Technology:** CSS `animation-timeline: scroll()`, `@keyframes`, `transition`.
**Advantages:** Zero JS, best performance, compositor-only.

```css
@keyframes fade-up {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}
.reveal-on-scroll {
  animation: fade-up linear both;
  animation-timeline: view();
  animation-range: entry 0% entry 30%;
}
```

**Decision:** If a simple CSS scroll-driven animation achieves the effect, STOP HERE.

### Tier 2: GSAP ScrollTrigger
**Use when:** Choreographed sequences, pinning, horizontal scroll, split text, staggered children, scrub-linked animations.
**Technology:** GSAP 3 + ScrollTrigger plugin + optionally SplitText, Flip.
**Advantages:** Timeline control, pin support, scrub, responsive via matchMedia.

**Decision:** If the effect needs timeline choreography, scrub, or pinning, use GSAP.

### Tier 3: Three.js / WebGL
**Use when:** 3D scenes, particle systems, model rendering, camera scroll animation.
**Technology:** three@0.169.0 (vanilla, NOT React Three Fiber).
**Advantages:** Full 3D, GPU-powered, immersive experiences.

**Decision:** Only when the effect is inherently 3D. Never for 2D scroll effects.

## Composition Rules

### Stagger Timing
- Base stagger: ~0.12s
- Max visible staggers: 8-12 elements. Beyond that, use batch reveals.
- Stagger direction: follow reading order (left-to-right, top-to-bottom)

### Easing Selection by Context
| Context | Easing |
|---------|--------|
| Element entering viewport | Decelerate (ease-out) |
| Element leaving viewport | Accelerate (ease-in) |
| Emphasis/attention | Elastic/bounce — use sparingly |
| Continuous/scrub | Linear or none |

### Duration Relationships
- Fast interactions (hover, click feedback): ~0.3s
- Standard reveals: ~0.6s
- Dramatic/hero sequences: ~1.0s
- Between-element stagger: ~0.12s
- **Rule:** Longer distances = longer durations. Scale proportionally.

## Do / Don't

### DO
- Keep timing/easing values consistent across a project (define once, reuse)
- Clean up ScrollTrigger instances on component unmount
- Use `gsap.matchMedia()` for responsive animation differences
- Use `will-change` sparingly and remove after animation completes
- Animate only `transform` and `opacity` when possible (compositor-only)
- Respect `prefers-reduced-motion`: disable or simplify animations
- Use `ScrollTrigger.batch()` for many identical reveal animations

### DON'T
- Hardcode inconsistent animation values across a project
- Mix `scrub` and `toggleActions` on the same ScrollTrigger
- Put ScrollTrigger on child tweens inside a timeline (put it on the timeline)
- Animate layout properties (`width`, `height`, `top`, `left`) -- use transforms
- Use `transition: all` -- list specific properties
- Forget cleanup: always `tl.revert()` or `ScrollTrigger.kill()` on unmount
- Create animations without testing on mobile viewports

## Anti-Patterns

### ScrollTrigger on Child Tweens (CRITICAL)
```javascript
// WRONG: ScrollTrigger on individual tweens inside timeline
const tl = gsap.timeline();
tl.to('.a', { y: 0, scrollTrigger: { trigger: '.a' } }); // BUG

// RIGHT: ScrollTrigger on the timeline itself
const tl = gsap.timeline({
  scrollTrigger: { trigger: '.section', start: 'top center' }
});
tl.to('.a', { y: 0 });
tl.to('.b', { y: 0 });
```

### Missing Cleanup
```javascript
// RIGHT: Context-based cleanup
useEffect(() => {
  const ctx = gsap.context(() => {
    gsap.to('.element', { scrollTrigger: { /* ... */ } });
  }, containerRef);
  return () => ctx.revert();
}, []);
```

### Missing Responsive Handling
```javascript
// RIGHT: Responsive via matchMedia
gsap.matchMedia().add('(min-width: 768px)', () => {
  gsap.to('.hero', { x: 500 });
});
gsap.matchMedia().add('(max-width: 767px)', () => {
  gsap.to('.hero', { x: 200 });
});
```

## Responsive Animation Principles

1. Always use `gsap.matchMedia()` for viewport-dependent animations.
2. Simplify on mobile: reduce parallax intensity, disable horizontal scroll sections.
3. Touch considerations: no hover-dependent animations on mobile.
4. Performance budget: fewer simultaneous animations on mobile.
5. Reduced motion: check `prefers-reduced-motion` and provide a fallback.

## Performance Guidelines

- Batch similar animations with `ScrollTrigger.batch()`.
- Animate `transform` and `opacity` only for 60fps.
- Apply `will-change` to at most 3-5 elements simultaneously.
- Use lazy `ScrollTrigger.create()` for off-screen content.
- Set `pinSpacing: true` (default) unless layout requires otherwise.

---

## Closing

After finishing, ask: "Anything here you'd push back on, or want done differently next time?"
