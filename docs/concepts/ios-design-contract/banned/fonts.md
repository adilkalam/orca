# Banned: Fonts (iOS/SwiftUI) — use the bundled brand face; don't collapse the display floor

> **Provenance.** Cross-platform spirit (the web `design-contract/banned/fonts.md` refuses the
> Geist/Inter reflex roster), but the iOS *mechanism* is different and authored here: the brand
> ships the **Brown LL** family in `Resources/Fonts/`, the type system is built entirely on it,
> and the failure modes are (a) reaching for `.system(...)` instead of the bundled face and
> (b) instantiating the display face below its collapse floor. Source of truth for the iOS type
> discipline: `peptidefox-ios/.claude/CLAUDE.md §6.2` and
> `PeptideFox/DesignSystem/Tokens/TypographyTokens.swift`.

## Detector rules this ban backs

| Rule id | Severity | What fires |
|---|---|---|
| `display-font-below-floor` | **P0 (blocks)** | A display/hero face (`Font.heroInline(...)` / `BrownLLInline`) instantiated below the 24pt detector floor. `TypographyTokens.swift` asserts Inline MUST be ≥28pt — "Inline collapses below this size." Fires inside token dirs too. |
| `system-font-reflex` | **P1 (advisory)** | `Font.system(...)` / `.system(size:)` / a bare `.font(.title)`/`.headline` system text style instead of `Font.primary(...)`. Suppressed inside token dirs (factories legitimately compose `relativeTo:` system text styles). |

## The refusal — two failures

### 1. The system-font reflex (`system-font-reflex`, advisory)

The brand has a real bundled typeface (Brown LL). Reflexively typing `.font(.system(...))` or a
bare `.font(.title)` ships **iOS-default San Francisco** — the typographic equivalent of
"I reached for whatever was closest to hand." It is the iOS shape of the web's Geist/Inter
reflex: no thought in typography, looks like every other app.

> "The use of Geist = vercel → no thought in typography. Boring, plain, looks like every other
> SaaS." The iOS form of that is shipping default SF where the bundled brand face was right
> there.

Use the brand factories: `Font.primary(_:size:relativeTo:)` for UI/body/headers,
`Font.heroInline(...)` for hero moments, `Font.accentMono(...)` for sanctioned micro labels
(see `mono-fatigue.md`). Note: `relativeTo:` legitimately names a system `TextStyle` for Dynamic
Type — that argument is NOT the reflex (see `preferences/dynamic-type-discipline.md`).

### 2. The display floor collapse (`display-font-below-floor`, P0)

`Brown LL Inline` is a display face reserved for **hero moments only** and it **collapses below
28pt** — the inline strokes break up and it reads as broken, not editorial.
`Font.heroInline(...)` carries an `assert(size >= 28)` for exactly this reason. Instantiating it
small (to use the "fancy" face for a card title or a label) is the slop: it both abuses the
display reservation and ships a collapsed face. The detector floor sits at 24pt (below the 28pt
display floor, above the 16pt body ceiling) to catch genuinely-too-small display type.

## SwiftUI shape of the slop — wrong / right

**Wrong** — system reflex and a collapsed display face:

```swift
Text(page.title)
    .font(.system(size: 28, weight: .bold))     // system-font-reflex (advisory): bundled face was right there
Text(card.title)
    .font(.heroInline(.regular, size: 18, relativeTo: .title3))  // display-font-below-floor (P0): Inline collapses
```

**Right** — bundled brand face; display reserved for hero, at/above floor:

```swift
Text(page.title)
    .font(v7Typography.h1Page)                   // Font.primary(.medium, size: 36, relativeTo: .largeTitle)
Text(card.title)
    .font(v7Typography.peptideCardTitle)         // Brown LL Regular/Medium — NOT Inline — for card titles
// heroInline is ONLY for the H1 hero takeover, at 28pt+:
Text(hero.headline)
    .font(v7Typography.heroLarge)                // Font.heroInline(.light, size: 48, relativeTo: .largeTitle)
```

## When the refusal is overridden

`system-font-reflex` is advisory — a deliberate SF usage (e.g. matching a system control's
chrome on purpose) is a judgment call the validator can clear. `display-font-below-floor` is
P0 and not negotiable: the face is physically broken below 28pt. Reach for `Font.primary`
instead of shrinking the display face.
