# Banned: Motion that's sudden, no elegance, no transition

## Verbatim

> When they use motion/animation, its sudden, no elegance, no transition.

## What this ban is actually about

The failure is the absence of considered transitions — state changes that pop rather than ease, hovers that swap colors instantly, drawers that slide with `ease` default (which is the "no one chose a curve" curve), animations whose timing is wrong because nobody tuned them.

Two directions this breaks:

1. **Missing transitions entirely**: the element changes state with no interpolation. Hover swaps color instantly. Dropdown appears instantly. Modal shows with no entrance.
2. **Transitions that exist but are thoughtless**: `transition: all 300ms` with default `ease`. Nothing chose the duration; nothing chose the curve. The animation is there but it's the laziest possible version of being there.

Both produce "sudden." Both produce "no elegance." The refusal is of the thought-gap, not of any specific curve or duration.

## Regex-detectable signals

| Pattern | Detection | Severity |
|---|---|---|
| `transition: none` on interactive contexts | `:hover\|:focus\|:active` selectors with `transition:\s*none` | P1 |
| Missing transition on state-changing elements | AST: elements with `:hover` rule changing `background\|color\|transform` but no `transition` declaration anywhere in scope | P1 |
| Implicit zero-duration | `transition-duration:\s*0` with any unit | P1 |
| Too-fast transitions (< 80ms) | `transition:\s*.*\s+([0-9]{1,2})ms` where value < 80 (below perceived-simultaneity threshold) | P1 |
| `transition: all` with default ease | `transition:\s*all\s+\d+m?s\s*[;}]` (no easing specified = default `ease`) | P0 |
| Default `ease` anywhere | `transition-timing-function:\s*ease[;}]` or `transition:.*\sease\s` | P0 |
| Bouncy / elastic easing on UI (not marketing) | `cubic-bezier` values with overshoot: y1 > 1 OR y2 < 0 OR y2 > 1 (Emil's rule: never bounce on UI) | P0 |

## Named substitutes (from animation-engineering / Emil)

- For UI entering: `cubic-bezier(0.23, 1, 0.32, 1)` (strong ease-out)
- For UI moving/morphing on screen: `cubic-bezier(0.77, 0, 0.175, 1)` (strong ease-in-out)
- For drawers / bottom sheets: `cubic-bezier(0.32, 0.72, 0, 1)` (iOS-like)
- Durations: button press 100-160ms, tooltips 125-200ms, dropdowns 150-250ms, modals 200-500ms, never > 300ms on UI

## The companion failure (to catch proactively)

Not just "no animation" but also "animation everywhere." If every hover zooms, every card lifts, every element has a perpetual subtle float — that's the opposite failure and equally refused. Motion should exist where state changes deserve registration, not as ambient decoration.
