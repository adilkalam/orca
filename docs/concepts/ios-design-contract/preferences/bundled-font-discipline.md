# Preference: Bundled-font discipline (Brown LL is the face; reserve the display + mono)

> **Provenance.** iOS-authored. The web `design-contract/preferences/typography-fonts.md` runs a
> 22-font selection *procedure* because the web brand chooses faces per project; iOS is the
> opposite case — the app **ships a single bundled family (Brown LL)** in `Resources/Fonts/` and
> the discipline is *use it well*, not *pick one*. Source of truth:
> `peptidefox-ios/.claude/CLAUDE.md §6.2` and `PeptideFox/DesignSystem/Tokens/TypographyTokens.swift`.
> Refusal side: `rants/fonts.md` + `rants/mono-fatigue.md`.

## The positive move

The brand ships four roles of one family. Each has a factory and a sanctioned scope:

| Role | Factory | Use | Never |
|---|---|---|---|
| **Workhorse** (Brown LL) | `Font.primary(_:size:relativeTo:)` | UI, body, controls, labels, headers, card titles | — |
| **Display** (Brown LL Inline) | `Font.heroInline(_:size:relativeTo:)` | Hero moments ONLY, **≥28pt** | card titles, H1–H6, body |
| **Mono/accent** (Brown Mono LL) | `Font.accentMono(size:relativeTo:)` | micro nav badges, units, tags, code identifiers | body, calculator/numeric output |

Procedure when typing any font in a view:

1. **Default to `Font.primary`.** It is the workhorse for almost everything, including headers
   and peptide card titles (`v7Typography.peptideCardTitle` is `Font.primary`, deliberately NOT
   Inline).
2. **Reserve `heroInline` for the one hero takeover per screen, at ≥28pt.** It collapses below
   that floor (`display-font-below-floor`, P0). If you want the "fancy" face on something small,
   you want `Font.primary` instead.
3. **Reserve `accentMono` for micro labels only.** Body or numeric data in mono is fatigue
   (`mono-fatigue`). For column-aligned figures use `.monospacedDigit()` on the brand face, not
   the mono family.
4. **Never `.font(.system(...))` reflexively** — the bundled face is right there
   (`system-font-reflex`).
5. **Always pass `relativeTo:`** so the face honors Dynamic Type (see
   `dynamic-type-discipline.md`).

## Wrong / right

```swift
// WRONG — display face abused small; mono on body; system reflex
Text(card.title).font(.heroInline(.regular, size: 18, relativeTo: .title3))   // collapses (P0)
Text(body).font(.accentMono(14, relativeTo: .body))                           // mono fatigue
Text(label).font(.system(.headline))                                          // system reflex
```

```swift
// RIGHT — each role in its lane
Text(hero.headline).font(v7Typography.heroLarge)        // display: hero only, 48pt
Text(card.title).font(v7Typography.peptideCardTitle)    // workhorse for card titles
Text(body).font(TypographyToken.Body.large)             // workhorse body
Text("MG / WEEK").font(TypographyToken.Label.micro)     // mono's sanctioned home
```

## The OPEN cross-platform decision (do not resolve unilaterally)

The web brand retired Brown LL and moved to Ivar + Supreme LL + GT Sectra + Brown Mono LL. **Do
NOT port "Brown LL is retired" to iOS** — the iOS app bundles only the Brown LL family and has
none of the web's new faces; porting that rule would invalidate the entire shipped type system.
Whether iOS re-converges on the web roster (a real licensing/bundling lift) or keeps Brown LL as
a deliberate cross-platform split is a **product call, flagged to the user**, not an agent call.
Until decided, Brown LL is the iOS face and this discipline governs it.
