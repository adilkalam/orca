# Preference: The token layer IS the design document

> **Provenance.** iOS translation of the web's "semantic CSS is the authority" doctrine
> (`design-contract/preferences/css-architecture.md`). The web mechanism (CSS `@layer`, role
> taxonomy, no inline styles) does not transfer; its **principle** does. Source of truth:
> `peptidefox-ios/.claude/CLAUDE.md §6.3` and the shipped `PeptideFox/DesignSystem/Tokens/`.

## The positive move

Design authority lives in `DesignSystem/Tokens/` — `ColorTokens`, `TypographyTokens`,
`SpacingTokens`, `MotionTokens`. **Views consume tokens; they never invent design inline.** A
value that is not in the token system is not allowed at a call site:

1. **Need a new value?** Add the token to the relevant enum first.
2. **Then** reference it from the view.

This is what makes the detector's token-dir scoping correct: the literal lives in *one* place
(the token file), and that one place is the document a reviewer audits. It also means the
detector can suppress raw-literal rules inside token dirs (defining literals there is the job)
while keeping `off-palette-hue` / `tailwind-palette-hex` / `gradient-fill` / `hue-coded-category`
firing there — because those are *slop in the design document itself*, not legitimate token work.

## The procedure (name → define → reference)

- **Color:** add a `dynamicColor(light:dark:)` token to `ColorTokens` (a bespoke on-principle
  value — see `color-principle.md`); reference `DesignSystem.Color.<name>` in the view. Never
  `Color(hex:)` in a view (`raw-hex-outside-tokens`, P0).
- **Type:** add a factory/token to `TypographyTokens` using `Font.primary(...)` /
  `Font.heroInline(...)` / `Font.accentMono(...)` with a `relativeTo:` text style; reference the
  token. Never `.font(.system(...))` reflexively (`system-font-reflex`).
- **Space:** use a `Spacing` scale name; never a bare number in `.padding`/`spacing:`
  (`magic-number-spacing`).
- **Motion:** use a `MotionTokens` curve/duration; never an ad-hoc over-bouncy spring
  (`spring-overshoot`).

## Wrong / right

```swift
// WRONG — design invented inline, three rules tripped
Text(t).foregroundColor(Color(hex: "#336CFF"))   // raw-hex-outside-tokens
       .font(.system(size: 16))                  // system-font-reflex
       .padding(14)                              // magic-number-spacing
```

```swift
// RIGHT — every decision is a named token; the view just composes
Text(t).foregroundColor(DesignSystem.Color.accentBlueDeep)
       .font(TypographyToken.Body.large)
       .padding(Spacing.md)
```

## Why it holds

The token layer being the single home is what ends the per-view repetition tax and what lets the
gate be deterministic: there is exactly one file to get right, and the detector polices *that*
file harder, not softer.
