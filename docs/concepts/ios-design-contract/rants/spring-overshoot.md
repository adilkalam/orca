# Rant: Spring overshoot (iOS/SwiftUI) — real objects decelerate; they don't bounce

> **Provenance.** Cross-platform refusal. Same enemy as the web
> `design-contract/rants/motion-suddenness.md` (the bounce/elastic easing tell), authored here
> for SwiftUI's `.spring` / `interpolatingSpring` / `interactiveSpring` API. The positive motion
> doctrine lives in `preferences/motion-discipline.md`. Source of truth for the iOS motion
> stance: `peptidefox-ios/.claude/CLAUDE.md §6.4` ("no bounce/elastic").

## Detector rule this rant backs

| Rule id | Severity | What fires |
|---|---|---|
| `spring-overshoot` | **P1 (advisory)** | A `.spring` / `interpolatingSpring` / `interactiveSpring` call whose `bounce` > 0.3 or `dampingFraction` < 0.7. Suppressed inside token dirs (central animation tokens may legitimately tune curves). |

## The refusal

An **over-bouncy spring** — high `bounce`, low `dampingFraction` — is the bounce-easing AI tell.
It makes the interface feel like a toy: panels that wobble past their resting point, sheets that
spring back, buttons that boing. Real objects decelerate smoothly toward rest; they do not
overshoot and oscillate.

> "Smooth, elegant motion — not perspective, just directional."

Motion should be **directional and decelerating**: an entry slides in and eases to a stop; it
does not arrive, overshoot, and settle. Reduce `bounce` (≤0.3) or raise `dampingFraction`
(≥0.7), or prefer a plain ease-out curve where no spring physics is needed.

## SwiftUI shape of the slop — wrong / right

**Wrong** — an over-bouncy spring:

```swift
withAnimation(.spring(response: 0.4, dampingFraction: 0.45)) {  // spring-overshoot: damping < 0.7
    isExpanded.toggle()
}
withAnimation(.interpolatingSpring(stiffness: 300, damping: 8)) {  // very low damping → visible boing
    offset = .zero
}
```

**Right** — a critically-/over-damped spring, or a directional ease-out:

```swift
withAnimation(.spring(response: 0.4, dampingFraction: 0.85)) {   // settles without overshoot
    isExpanded.toggle()
}
// or, when no physics is needed, a directional ease-out from the motion tokens:
withAnimation(MotionTokens.easeOutStandard) {
    offset = .zero
}
```

Always gate motion on `accessibilityReduceMotion` (see `preferences/motion-discipline.md`).

## When the refusal is overridden

Advisory only — it never blocks. A deliberately playful confirmation on a genuine milestone (an
*earned* moment of delight) may justify a touch more bounce, but the default is composed
deceleration. Routine state changes never bounce.
