# Rant: Colors (iOS/SwiftUI) — blue carries the entire chromatic load

> **Provenance.** The colorblind/blue-only law is the *cross-platform* layer — the same
> refusal as the web `design-contract/rants/colors.md` (the Tailwind-palette-as-enemy rant),
> re-expressed in the owner's accessibility terms and the SwiftUI surface. The authoritative
> iOS source is `peptidefox-ios/.claude/CLAUDE.md §6.1` ("the palette LAW"). This file does
> not re-derive the law; it states the refusal, names the SwiftUI shape of the slop, and links
> the detector rules that block it. The positive procedure lives in
> `preferences/blue-only-palette-law.md`.

## Detector rules this rant backs

| Rule id | Severity | What fires |
|---|---|---|
| `off-palette-hue` | **P0 (blocks)** | A chromatic hex whose hue is outside the blue band (205–245°) and is not near-neutral. Orange/teal/pink/purple/lavender. Fires inside token dirs too — the off-palette literal IS the slop. |
| `raw-hex-outside-tokens` | **P0 (blocks)** | A `Color(hex:"#…")` / `UIColor` literal in a view/feature file instead of a named token. Suppressed inside token dirs (defining literals is the token layer's job). |
| `tailwind-palette-hex` | **P0 (blocks)** | A hex copied verbatim from the Tailwind default palette (`f97316`, `3b82f6`, `a855f7`, …). The canonical AI-slop fingerprint. Fires inside token dirs too. |

## The refusal

The product owner is **protan + deutran colorblind and sees blue best.** This is a hard
accessibility constraint, not a style preference, and it does not soften on iOS. So:

- **Blue carries the entire chromatic load.** Hierarchy comes from **blue depth + ink weight +
  scale + space** — never from a second chromatic hue. The brand blue is a deep **cobalt /
  obsidian**, not a bright "tech blue."
- **Categorical distinction is by LIGHTNESS TIER, never by hue.** Hue steps at one lightness
  read as monochrome to a protan/deutran viewer — the distinction the code thinks it is making
  is invisible to the person it is for. (See `hue-coded-categorical.md`.)
- **The only sanctioned non-blue chromatic is a `danger` red — icon-required, never
  color-alone, genuine danger only.** A red-only signal is not reliably discriminable to this
  owner; the SF Symbol + text label carry the meaning, color reinforces.
- **Never the warm-orange family** (rust, peach, amber, ember, terracotta, saffron,
  gold-as-action). Permanent, profanity-confirmed refusal on the brand.
- **Never the AI-purple / lavender / cyan / neon family. Never raw Tailwind-palette hexes.**

> "Whatever color that background is hurts my eyes; the gradients only make it worse."
> The refusal comes from "this hurts to look at," not from an abstract hue rule. Honor it
> literally.

## SwiftUI shape of the slop — wrong / right

**Wrong** — a second chromatic hue, and a raw Tailwind hex in a view:

```swift
// MetabolicCardView.swift  (a feature file, NOT a token dir)
Text(compound.name)
    .foregroundColor(Color(hex: "#f97316"))   // raw-hex-outside-tokens + off-palette-hue + tailwind-palette-hex
RoundedRectangle(cornerRadius: 12)
    .fill(Color(hex: "#14b8a6"))               // teal — a SECOND hue, off-palette
```

**Right** — consume a named token; distinguish by lightness tier + ink weight, not hue:

```swift
Text(compound.name)
    .foregroundColor(DesignSystem.Color.primary)        // ink weight carries emphasis
RoundedRectangle(cornerRadius: 12)
    .fill(DesignSystem.Color.accentBlueDeep)            // blue depth, not a new hue
    // category B uses .accentBlueMid; category C uses .accentBlueLight — a lightness ladder
```

## When the refusal is overridden

It is not. The blue-only law is an accessibility constraint owned by the person using the
product. The `danger` red is the single sanctioned exception and only with mandatory
iconography. There is no project context that re-licenses orange/teal/pink/purple on this brand.

## Known divergence (do not silently refactor)

`peptidefox-ios/PeptideFox/DesignSystem/Tokens/ColorTokens.swift` predates the blue-only move
and still ships orange "Metabolic", teal "Healing", pink/purple compound accents, and lavender.
That is *the* concrete shape of the neglected-iOS-app debt. Remediation is its own scoped task —
this rant + the detector exist so the debt is *named at the gate*, not so an unrelated change
quietly rewrites the token file. New code holds the line.
