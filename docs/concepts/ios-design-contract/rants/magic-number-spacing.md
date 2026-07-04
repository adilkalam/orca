# Rant: Magic-number spacing (iOS/SwiftUI) — route rhythm through the scale

> **Provenance.** iOS-authored, in the spirit of the web alignment/spacing discipline
> (`design-contract/rants/alignment-spacing.md` + `preferences/typography-spacing.md`). The web
> mechanism is CSS `gap`/tokens; the iOS mechanism is the `Spacing` token scale and the failure
> is raw numeric literals in `.padding(...)` / `spacing:` / frame insets. Source of truth for
> the iOS principle: `peptidefox-ios/.claude/CLAUDE.md §6.3` ("tokens, not hardcoded").

## Detector rule this rant backs

| Rule id | Severity | What fires |
|---|---|---|
| `magic-number-spacing` | **P1 (advisory)** | A raw integer/float literal passed to `.padding(...)`, `spacing:`, `VStack`/`HStack(spacing:)`, frame insets, etc. in a non-token file. `0` is ignored (intentional zero-out). Suppressed inside token dirs — the `Spacing` scale itself is defined with numeric literals there. |

## The refusal

Spacing is **rhythm**, and rhythm comes from a scale, not from whatever number felt right at the
call site. A `.padding(13)` here and `.padding(20)` there is the visible signature of spacing
decided ad hoc — the alignment imprecision the owner notices instantly.

> "I do not fuck around with alignment. Pixel perfect precision, otherwise I can't help but
> notice."

Route every inset and gap through the `Spacing` token scale (the 4pt scale with semantic names).
A value that is not in the scale is not allowed at the call site — add it to the scale first,
then reference it. This is the §6.3 principle: the token layer is the design document; views
*consume* it.

## SwiftUI shape of the slop — wrong / right

**Wrong** — raw literals scattered across a view:

```swift
VStack(spacing: 13) {                 // magic-number-spacing (advisory)
    header
    body
}
.padding(.horizontal, 18)             // magic-number-spacing (advisory)
.padding(.top, 22)                    // magic-number-spacing (advisory)
```

**Right** — every inset and gap is a token:

```swift
VStack(spacing: Spacing.sm) {         // 12pt, from the scale
    header
    body
}
.padding(.horizontal, Spacing.md)     // 16pt
.padding(.top, Spacing.lg)            // 24pt
```

`.padding(0)` and `spacing: 0` are intentional zero-outs and are NOT flagged.

## When the refusal is overridden

Advisory only — it never blocks the gate. A genuinely one-off optical nudge (a 1pt baseline
correction the scale can't express) is a defensible exception the validator can clear, but it
should be commented as a deliberate optical adjustment, not left as a bare number.
