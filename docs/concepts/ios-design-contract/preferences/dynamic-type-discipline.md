# Preference: Dynamic Type discipline (`relativeTo:` always; tabular figures for data)

> **Provenance.** iOS-authored — an accessibility requirement the web docs do not address.
> Source of truth: `peptidefox-ios/.claude/CLAUDE.md §6.2` ("Honor Dynamic Type … never ship a
> fixed-size font that ignores the user's text-size setting") and the real factory pattern in
> `PeptideFox/DesignSystem/Tokens/TypographyTokens.swift`.

## The positive move

**Every font token scales with Dynamic Type.** The brand factories take a `relativeTo:`
`TextStyle` so a custom-sized Brown LL face still grows and shrinks with the user's
accessibility text-size setting:

```swift
static func primary(_ weight: BrownLLWeight, size: CGFloat, relativeTo textStyle: TextStyle) -> Font {
    .custom(weight.rawValue, size: size, relativeTo: textStyle)
}
```

Rules of the discipline:

1. **Never `.custom(name, size:)` without `relativeTo:`** — a fixed-size font ignores Dynamic
   Type and is an accessibility regression. Always pass the closest semantic `TextStyle`
   (`.body`, `.title2`, `.largeTitle`, `.caption2`, …).
2. **Map size → text style honestly.** Hero/display sizes use `.largeTitle`/`.title`; body uses
   `.body`; micro labels use `.caption2`. The factory's `relativeTo:` argument is the legitimate
   appearance of a system `TextStyle` — it is NOT the `system-font-reflex` (the detector
   explicitly does not flag the `relativeTo:` argument).
3. **The display floor still applies.** `Font.heroInline(...)` asserts ≥28pt; Dynamic Type
   scales *up* from there, never below the collapse floor (see `banned/fonts.md`).

## Tabular figures for ALL dosing / calculator output

Figures in the Calculator and ProtocolTracker (the core surfaces) must **align in columns**. Use
lining tabular numerals on the **brand body face** — `.monospacedDigit()` applied to a
`Font.primary(...)` token, NOT the mono *family* (that would be `mono-fatigue`):

```swift
Text(result.milligrams)
    .font(TypographyToken.Data.resultLarge)   // brand face, scales with Dynamic Type
    .monospacedDigit()                         // tabular column alignment, brand face preserved
```

## Wrong / right

```swift
// WRONG — fixed size, ignores Dynamic Type
Text(label).font(.custom("BrownLL-Regular", size: 16))
```

```swift
// RIGHT — scales with the user's text-size setting
Text(label).font(TypographyToken.Body.large)   // Font.primary(.regular, size: 16, relativeTo: .body)
```

## Why it holds

iOS is the phone-first, primary surface for this product (the mobile inversion, CLAUDE.md §4).
Thumb-zone reading at the user's chosen text size is the *default* experience, not a degraded
path. A fixed-size font breaks the one accessibility guarantee a native app is expected to keep.
