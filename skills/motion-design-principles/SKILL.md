---
name: motion-design-principles
description: >
  Three-tier animation decision framework, composition rules, anti-patterns,
  and responsive animation principles. Foundation for all motion work.
trigger_terms: animation, animate, motion, scroll effect, reveal, transition
---

# Motion Design Principles

## Three-Tier Animation Decision Tree

Choose the SIMPLEST tier that achieves the effect. Never escalate without reason.

### Tier 1: CSS Scroll-Driven Animations
**Use when:** Simple reveals, hover effects, viewport-triggered fades.
**Technology:** CSS `animation-timeline: scroll()`, `@keyframes`, `transition`.
**Advantages:** Zero JS, best performance, compositor-only.

```css
/* Tier 1 example: simple fade-up on scroll */
@keyframes fade-up {
  from { opacity: 0; transform: translateY(var(--motion-reveal-distance, 40px)); }
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
- Base stagger: use design-dna `motion.duration.stagger` (default 0.12s)
- Max visible staggers: 8-12 elements. Beyond that, use batch reveals.
- Stagger direction: follow reading order (left-to-right, top-to-bottom)

### Easing Selection by Context
| Context | Easing | Design-DNA Token |
|---------|--------|-----------------|
| Element entering viewport | Decelerate | `motion.easing.entrance` |
| Element leaving viewport | Accelerate | `motion.easing.exit` |
| Emphasis/attention | Elastic/bounce | `motion.easing.emphasis` |
| Continuous/scrub | Linear or none | `motion.easing.smooth` |

### Duration Relationships
- Fast interactions (hover, click feedback): `motion.duration.fast` (0.3s)
- Standard reveals: `motion.duration.normal` (0.6s)
- Dramatic/hero sequences: `motion.duration.slow` (1.0s)
- Between-element stagger: `motion.duration.stagger` (0.12s)
- **Rule:** Longer distances = longer durations. Scale proportionally.

## Do / Don't

### DO
- Consume ALL timing/easing values from design-dna motion tokens
- Clean up ScrollTrigger instances on component unmount
- Use `gsap.matchMedia()` for responsive animation differences
- Use `will-change` sparingly and remove after animation completes
- Animate only `transform` and `opacity` when possible (compositor-only)
- Respect `prefers-reduced-motion`: disable or simplify animations
- Use `ScrollTrigger.batch()` for many identical reveal animations

### DON'T
- Hardcode animation values (durations, easings, distances)
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
tl.to('.b', { y: 0, scrollTrigger: { trigger: '.b' } }); // BUG

// RIGHT: ScrollTrigger on the timeline itself
const tl = gsap.timeline({
  scrollTrigger: { trigger: '.section', start: 'top center' }
});
tl.to('.a', { y: 0 });
tl.to('.b', { y: 0 });
```

### Missing Cleanup
```javascript
// WRONG: No cleanup
useEffect(() => {
  gsap.to('.element', { scrollTrigger: { ... } });
}, []);

// RIGHT: Context-based cleanup
useEffect(() => {
  const ctx = gsap.context(() => {
    gsap.to('.element', { scrollTrigger: { ... } });
  }, containerRef);
  return () => ctx.revert();
}, []);
```

### Missing Responsive Handling
```javascript
// WRONG: Same animation at all viewport sizes
gsap.to('.hero', { x: 500 });

// RIGHT: Responsive via matchMedia
gsap.matchMedia().add('(min-width: 768px)', () => {
  gsap.to('.hero', { x: 500 });
});
gsap.matchMedia().add('(max-width: 767px)', () => {
  gsap.to('.hero', { x: 200 });
});
```

## Responsive Animation Principles

1. **Always use `gsap.matchMedia()`** for viewport-dependent animations
2. **Simplify on mobile:** Reduce parallax intensity, disable horizontal scroll sections
3. **Touch considerations:** No hover-dependent animations on mobile
4. **Performance budget:** Fewer simultaneous animations on mobile
5. **Reduced motion:** Check `prefers-reduced-motion` and provide fallback

## Performance Guidelines

- **Batch similar animations:** `ScrollTrigger.batch()` for repeated reveals
- **Transforms only:** Animate `transform` and `opacity` for 60fps
- **Will-change budget:** Apply to max 3-5 elements simultaneously
- **Lazy ScrollTrigger:** Use `ScrollTrigger.create()` with lazy refresh for off-screen content
- **Pin spacing:** Always set `pinSpacing: true` (default) unless layout requires otherwise

---

## Rant-capture at handback

After completing the work, before returning to the user, ask:

> "Returned to bench. Anything here you'd rant about?"

If the user responds, append the entry to the current project's `.orca/design-rants-pending.md` in this format:

```
## YYYY-MM-DD HH:MM — [verb-name]
[user's response verbatim]
```

Create `.orca/` in the current project if absent. Do NOT write to `~/.claude/` or to the ORCA-OS source tree directly. Pending entries are swept and categorized later via `/impeccable extract rants`.
