---
name: alignment-verification
description: Verify pixel-level UI alignment (centering, edge alignment, equal spacing) with exact measurements instead of visual approximation — alignment is binary, either 0px deviation or not. Use when the user asks to center, align, or "make things line up" in a web UI, or wants layout spacing verified rather than eyeballed.
---

# Alignment Verification — Zero-Tolerance Protocol

Alignment has exactly two outcomes: delta = 0px (ALIGNED: YES) or delta > 0px (ALIGNED: NO, report the exact deviation). No tolerances, no "close enough" — a 2px deviation in a row of elements is visible.

This requires browser inspection access (e.g. a chrome-devtools MCP connector or similar `evaluate`/`boundingBox`-style capability) to extract real pixel values. Without that access, do not claim alignment — say so and describe what you can verify from the code/CSS alone (e.g. "the CSS specifies `justify-content: center`, but I can't confirm the rendered pixel result without inspecting the live page").

## Mental model

Alignment is a **relationship**, not a property of one element. Every check needs: target element(s), reference element (what it aligns TO), alignment type (center/edge/spacing), and container space to align within.

## Protocol

1. **State the check explicitly** before measuring: which elements, what type, what reference.
2. **Extract exact pixel values** via the browser tool's script-evaluation capability (`getBoundingClientRect()` or equivalent).
3. **Calculate the exact deviation** — no rounding, no tolerance band.
4. **Output an ALIGNMENT_CHECK block.**

```
ALIGNMENT_CHECK:
- Task: [alignment goal in plain language]
- Type: [horizontal_center|vertical_center|left_edge|right_edge|top_edge|bottom_edge|spacing]
- Elements measured: [selector]: [value]px  (one line per element)
- ALIGNED: YES/NO
- Max deviation: Xpx
```

## Alignment types

**Center horizontally/vertically in parent:** `parentCenter = parent.x + parent.width/2`, same for child, `deviation = abs(parentCenter - childCenter)`.

**Left/right/top edge alignment (multiple elements):** measure each element's edge, take the first as reference, `deviation[i] = abs(edge[i] - reference)`, report the max.

**Equal spacing:** compute the gap between each consecutive pair (`boxes[i].x - (boxes[i-1].x + boxes[i-1].width)`), take the first gap as reference, report max deviation from it.

## Common pitfalls

- **CSS `margin: auto` alone does nothing** in block layout — needs a flex/grid parent, or an explicit width on the child.
- **`getBoundingClientRect()` returns post-transform position incorrectly** in some cases — a `transform: translateX()`'d element's visual position can differ from its measured box; account for this or use `offsetLeft`.
- **Asymmetric content** (icon + text in a button) can look off-center even when the container IS centered — visual weight isn't geometric center. Either accept true center or adjust padding for optical center, and say explicitly which you did.

## Forbidden language

Reject these in your own output — they're not measurements: "within tolerance," "close enough," "approximately aligned," "looks aligned," "alignment seems fine," "roughly centered." If you haven't produced an ALIGNMENT_CHECK block with a real pixel deviation, you haven't verified alignment — say so plainly instead of asserting it.

## When to apply

Whenever the user says "center this," "align these," "make them line up," or when reviewing spacing consistency / verifying a layout implementation. Skip when there's no alignment requirement, the work is non-visual (APIs, logic), or the user explicitly waives exact alignment.
