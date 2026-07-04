# Preference: Motion discipline (`withAnimation` + `accessibilityReduceMotion`)

> **Provenance.** Cross-platform spirit (the web `design-contract/preferences/motion-references.md`
> — directional, not perspective; ease-out; no bounce/elastic), authored here for the SwiftUI
> mechanism (`withAnimation`, `MotionTokens`, `@Environment(\.accessibilityReduceMotion)`).
> Source of truth: `peptidefox-ios/.claude/CLAUDE.md §6.4`. The refusal side lives in
> `rants/spring-overshoot.md`.

## The positive move

Motion is **directional and decelerating**, applied to **high-impact moments**, and **always
gated on reduced motion.**

1. **Ease-out for entries, considered durations.** Things slide/fade in and decelerate to rest.
   Use a `MotionTokens` curve, not an ad-hoc spring:
   ```swift
   withAnimation(MotionTokens.easeOutStandard) { isVisible = true }
   ```
2. **No bounce / elastic.** If a spring is genuinely needed, keep `bounce ≤ 0.3` /
   `dampingFraction ≥ 0.7` so it settles without overshoot (`spring-overshoot`, advisory).
3. **Directional, not perspective.** Translate/opacity, not 3D rotation or perspective tilt.
   > "Smooth, elegant motion — not perspective, just directional."
4. **Animate transform + opacity, not layout.** Prefer offset/scale/opacity over animating frame
   size where it would jank.

## Always honor Reduce Motion

Every non-trivial animation must check the user's setting and degrade to an instant (or
cross-fade) state change:

```swift
@Environment(\.accessibilityReduceMotion) private var reduceMotion

func reveal() {
    if reduceMotion {
        isVisible = true                                   // instant, no movement
    } else {
        withAnimation(MotionTokens.easeOutStandard) { isVisible = true }
    }
}
```

(In UIKit-adjacent code, the equivalent is `UIAccessibility.isReduceMotionEnabled`.)

## Wrong / right

```swift
// WRONG — over-bouncy, and ignores Reduce Motion
withAnimation(.spring(response: 0.4, dampingFraction: 0.4)) { panel.toggle() }
```

```swift
// RIGHT — decelerating, reduced-motion-aware
if reduceMotion { panel.toggle() }
else { withAnimation(MotionTokens.easeOutStandard) { panel.toggle() } }
```

## Why it holds

Routine state changes get little or no motion; an *earned* milestone gets proportional
celebration (the delight-proportionality principle). Scattering bouncy micro-interactions
everywhere is the toy feel the brand refuses. And a person who has turned on Reduce Motion has
told the app something — honoring it is non-negotiable on a primary mobile surface.
