# Banned: Hue-coded categories — hue as the SOLE carrier of meaning

> **Provenance.** iOS-authored; re-scoped 2026-07-06 to the **2026-07-02 color principle**
> (`peptidefox-ios/.claude/CLAUDE.md §6.1`, owner verbatim), which supersedes the original
> blue-only reading. The original ban refused *any* per-category hue; the owner's ruling
> sanctions **duty-scoped color families** for hierarchy and differentiation. What this ban
> still refuses is narrower and permanent: **hue as the sole carrier**, the **red-vs-green
> axis**, and the **un-ratified rainbow**. Ratified override:
> `peptidefox-ios/.design-overrides.json` (hue-coded-category suppression, 2026-07-02).

## The refusal (re-scoped)

The owner is **protan + deutran colorblind**. A categorical color scheme fails him in two ways,
and those two failures are what this ban names:

1. **Hue ALONE encoding the category.** If the only difference between category A and B is the
   hue of a dot/tint/border, the distinction is real in the source and absent on his screen.
   **Hue is always paired with icon + label + lightness** so meaning survives his vision.
2. **Red-vs-green as the distinguishing axis.** The protan/deutran-invisible axis. When two
   categories need chromatic contrast, put it on the **blue ↔ yellow axis** he fully sees —
   cool-vs-warm family splits are ideal (and are exactly the owner's own example: Waking→Morning
   cool, Evening→Bedtime warm).
3. **The un-ratified rainbow.** One-hue-per-case slapped across an enum (the
   `CompoundColorScheme` pattern, typically with Tailwind pastes) is still the AI-slop tell. A
   sanctioned family is **duty-scoped** (it means something — a time of day, a state, a mode),
   **custom-tuned** (bespoke values), and **token-routed** — not a per-case decoration.

**What is now sanctioned (owner, 2026-07-02):** distinct, duty-scoped color families as a
default tool for hierarchy — "given the complexity of the UI, its better UX to use distinct
colors for visual hiearchy." Don't regress a considered family split to grey or all-blue; the
timid mix is a named failure mode ("afraid to be seen").

## Detector rule this ban backs — ⚠️ advisory until re-tuned

| Rule id | Corpus severity | Status under the 2026-07-02 principle |
|---|---|---|
| `hue-coded-category` | P0 | **Encodes the superseded any-per-category-hue reading.** Suppressed for `PeptideFox/**` by owner override (duty-scoped families, always paired with icon+label+lightness). Treat as advisory on color until the detector is re-tuned to distinguish ratified duty-scoped families from the un-ratified rainbow. |

## SwiftUI shape — wrong / right

**Wrong** — the un-ratified rainbow: hue alone, per-case, Tailwind pastes:

```swift
enum CompoundColorScheme {
    static func forCompound(_ c: Compound) -> Color {
        switch c.kind {
        case .metabolic: return Color(hex: "#f97316")   // orange — a paste, no duty
        case .healing:   return Color(hex: "#14b8a6")   // teal — hue is the ONLY signal
        case .glow:      return Color(hex: "#ec4899")   // pink
        case .nad:       return Color(hex: "#9333ea")   // purple — AI-family, still banned
        }
    }
}
```

**Wrong** — red-vs-green as the axis (invisible to the owner):

```swift
Circle().fill(isActive ? .green : .red)   // the one axis he cannot see; no icon, no label
```

**Right** — a duty-scoped family split on the blue↔yellow axis, meaning carried by icon + label
+ lightness, hue differentiating on top:

```swift
// ColorTokens.swift — bespoke, duty-scoped family tokens
static let morningCool = dynamicColor(light: "#2B4C8C", dark: "#7C96D9")   // waking→morning
static let eveningWarm = dynamicColor(light: "#A65D3F", dark: "#D99A7C")   // evening→bedtime

// ScheduleRow.swift
Label(slot.name, systemImage: slot.symbol)         // icon + label carry the meaning
    .foregroundStyle(slot.isEvening ? ColorTokens.eveningWarm : ColorTokens.morningCool)
```

The reader tells categories apart by icon, label, and lightness even with no hue perception at
all; the cool/warm split adds a differentiation channel the owner *does* see.

## When the refusal is overridden

The narrowed refusal (hue-alone, red-vs-green, un-ratified rainbow) does not soften — it is the
accessibility kernel of the color principle. New duty-scoped families are sanctioned in kind, but
**each new hue is the owner's call** (bespoke value, through `ColorTokens.swift`); never invent
one to fill a gap.
