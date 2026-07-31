# Preference: The color principle — Klein blue primary + duty-scoped supporting color

> **Provenance — PROVENANCE-COPIED.** The positive, prescriptive form of the palette law.
> Authoritative source: `peptidefox-ios/.claude/CLAUDE.md §6.1` — **THE COLOR PRINCIPLE
> (2026-07-02, owner verbatim)**, condensed here; CLAUDE.md remains the source of truth (drift
> rule: it wins, this re-syncs). **This file replaces `blue-only-palette-law.md`** — the owner's
> 2026-07-02 ruling supersedes every prior "blue-only" or "grey/blue mix" reading. Ratified
> overrides: `peptidefox-ios/.design-overrides.json`. The refusal side lives in
> `banned/colors.md` + `banned/hue-coded-categorical.md`.

## The principle (the owner's words)

> "klein blue is primary, but we can and should be utilizing a lot more color to differentiate,
> distinguish, and make things clear for the user. Again, doesn't mean turn this into an acid
> trip, but it can be a lot better than what it currently is which feels almost like its afraid
> to be seen." *(owner, 2026-07-02)*

## The positive moves

1. **Klein blue is the PRIMARY accent.** `#002FA7` light / `#4565E6` dark via `v7Cobalt*` —
   hero numerals, active states, CTAs. Reserve it for emphasis; don't spread it across chrome
   (blue text on a blue-tinted surface is the dark-mode failure mode — default chrome to neutral).
2. **Distinct supporting color is the DEFAULT TOOL for hierarchy and differentiation** — not a
   reluctant exception. Duty-scoped families are sanctioned: e.g. time-of-day, Waking→Morning as
   one (cool) family, Evening→Bedtime as a different (warm) family. The **warm family
   (amber/red) is UNBANNED** (owner, 2026-07-02) — custom-tuned, duty-scoped, token-routed.
3. **Steer between the two named failure modes.** The acid trip (unconsidered multi-hue) and the
   timid grey/blue-only mix ("afraid to be seen") are equal and opposite failures. Functional,
   considered color is the target between them.
4. **The colorblind kernel stays real** (protan + deutran owner). Pair hue with **icon + label +
   lightness** so meaning never rides on hue alone; put chromatic contrast on the **blue ↔
   yellow axis** he fully sees (cool-vs-warm splits are ideal); **never red-vs-green** as the
   distinguishing axis. `danger` red stays icon-required, genuine danger only.
5. **Every hue enters through the token layer.** New hues are **bespoke values** (never Tailwind
   pastes) defined in `ColorTokens.swift` only and consumed as named tokens (§6.3). Still
   refused outright: AI-purple/lavender/neon, raw Tailwind-palette hexes, gradient fills.
6. **A new accent hue is the OWNER's call, not the agent's.** Supporting families are sanctioned
   in kind; each specific hue is his decision. Don't invent one to fill a gap.
7. **Anti-Vanish floor.** Nothing meant to be seen may blend into its surface on a bright
   high-DPI display. Validate **by eye on a bright screen**, not by the computed contrast value
   (`PeptideFox/DesignSystem/Docs/ColorContrastGuide.md`).

## Both appearances stay on-principle

The iOS app supports light **and** dark (`dynamicColor(light:dark:)`, CLAUDE.md §6.4 — do not
port the web's "committed-light"). Every rule above applies to both schemes; a dark variant is
tuned for the dark surface, never a second un-ratified hue smuggled in for the dark theme.

## Detector status (honest)

The Swift detector still encodes the older blue-band law (`off-palette-hue` 205–245°,
`hue-coded-category` any-per-category-hue). The owner's overrides suppress both for
`PeptideFox/**` (`.design-overrides.json`) — **treat the detector as advisory on color until it
is re-tuned** to the 2026-07-02 principle, and defer to the owner's eye. The non-color rules
(`raw-hex-outside-tokens`, `tailwind-palette-hex`, `gradient-fill`) are unaffected and fully live.

## Known divergence (do not silently refactor)

`ColorTokens.swift` legacy debt (orange "Metabolic", teal "Healing", pink/purple accents,
lavender, Tailwind semantic hexes) is still debt under the new principle — un-ratified Tailwind
pastes and hue-alone category coding, not duty-scoped bespoke color. Remediation is its own
scoped task; new code holds the line.
