# Preference: The blue-only palette law (cross-platform)

> **Provenance — PROVENANCE-COPIED.** This is the positive, prescriptive form of the
> cross-platform palette law. The authoritative source is
> `peptidefox-ios/.claude/CLAUDE.md §6.1` ("The palette LAW"); the passages below are condensed
> from it. The refusal side lives in `rants/colors.md` + `rants/hue-coded-categorical.md`. The
> law is owner-accessibility, not CSS — it transfers to every platform unchanged.

## The law (the positive moves)

The product owner is **protan + deutran colorblind and sees blue best.** So design *toward* what
the owner can reliably judge:

1. **Make blue carry the entire chromatic load.** Build hierarchy from **blue depth + ink weight
   + scale + space.** The brand blue is a deep **cobalt / obsidian** (~`#1d3aa3`), not a bright
   tech-blue. Reach for blue depth where another system would reach for a second hue.
2. **Distinguish categories by LIGHTNESS TIER.** When N things need distinct identities
   (compounds, chart series, stack groups), give them dark / mid / light blue steps with
   text-color inversion — a *ladder*, not a rainbow. This is the move that replaces
   `CompoundColorScheme`-style hue coding.
3. **Reinforce, never encode, with the single `danger` red.** The lone sanctioned non-blue
   chromatic is a danger red — **icon-required (SF Symbol + text label), never color-alone,
   genuine danger only.** Color is reinforcement; the icon + label carry the meaning.
4. **Tint neutrals, don't saturate them.** A warm/cool off-white and an ink ramp do the
   structural work; keep them near-neutral (the detector allows near-neutral hexes regardless of
   hue) and let blue be the only chroma.
5. **Anti-Vanish floor.** Nothing meant to be seen may blend into its surface on a bright
   high-DPI display. Validate **by eye on a bright screen**, not by the computed contrast value.
   (`PeptideFox/DesignSystem/Docs/ColorContrastGuide.md` is the iOS home for this.)

## Hard refusals (the law's negative space)

- **Never the warm-orange family** (rust, peach, amber, ember, terracotta, saffron,
  gold-as-action). Permanent.
- **Never the AI-purple / lavender / cyan / neon family. Never raw Tailwind-palette hexes.**
- **Never a second chromatic hue for hierarchy or categories** — hue steps at one lightness read
  as monochrome to this owner.

## The blue band (what the detector treats as on-palette)

The `off-palette-hue` rule allows HSL hue **205–245°** (covers `#336CFF` ~223° and `#2563eb`
~221°) plus near-neutral hexes (channel spread under the neutral threshold). That band excludes
teal (~173°), green (~145°), orange (~25°), pink (~330°), purple (~271°), and lavender (~253°).
The cool-grey *text* tokens read clean because their hue sits inside the blue band even at higher
chroma. New tokens must land inside this band or be near-neutral.

## Both appearances stay on-palette

The iOS app supports light **and** dark (`dynamicColor(light:dark:)`, CLAUDE.md §6.4 — do not
port the web's "committed-light"). The blue-only law applies to **both** schemes: a token's dark
variant is still blue-band-or-neutral, never a second hue smuggled in for the dark theme.

## Dark / divergence note

`ColorTokens.swift` currently ships off-palette legacy debt (orange/teal/pink/purple/lavender +
Tailwind hexes + hue-coded categories). The detector flags it P0 so it is named at the gate.
Remediation — collapse categorical hues to blue lightness tiers, drop the off-palette families,
make every semantic state icon-required, pull the accent toward obsidian — is a scoped task, not
a side effect. New code holds the line.
