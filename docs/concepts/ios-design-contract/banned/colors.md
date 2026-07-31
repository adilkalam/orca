# Banned: Colors (iOS/SwiftUI) — unconsidered color: Tailwind pastes, AI-purple, meaning on hue alone

> **Provenance.** Provenance-copied from `peptidefox-ios/.claude/CLAUDE.md §6.1` — **THE COLOR
> PRINCIPLE (2026-07-02, owner verbatim)**, which **supersedes every prior "blue-only" or
> "grey/blue mix" reading of this ban.** History: the absolutist "ONLY blue" rule was corrected
> 2026-06-23; the owner set Klein blue as accent + a first supporting palette 2026-07-01; the full
> principle landed 2026-07-02. The ratified per-scope overrides live in
> `peptidefox-ios/.design-overrides.json`. CLAUDE.md §6.1 remains the single source of truth —
> when it and this file diverge, it wins and this file re-syncs (the drift rule).

## The law (the owner's words — do not dilute)

> "klein blue is primary, but we can and should be utilizing a lot more color to differentiate,
> distinguish, and make things clear for the user. Again, doesn't mean turn this into an acid
> trip, but it can be a lot better than what it currently is which feels almost like its afraid
> to be seen." *(owner, 2026-07-02)*

> "Lets eliminate this constraint of not using amber / red shades if its there — really, we
> should be utilizing color more distinctly in this app. We don't need to go crazy, but given the
> complexity of the UI, its better UX to use distinct colors for visual hiearchy." *(owner,
> 2026-07-02)*

Two failure modes, named and equal: the **acid trip** (unconsidered multi-hue slop) and the
**timid grey/blue-only mix** ("afraid to be seen"). This ban refuses both — it is NOT a
blue-only law anymore.

## The refusal — what is still NEVER acceptable

- **The AI-purple / lavender / cyan / neon family.** Permanent. ("Whatever color that background
  is hurts my eyes; the gradients only make it worse.")
- **Raw Tailwind-palette hexes.** The canonical AI-slop fingerprint. A supporting color is a
  **bespoke, custom-tuned value** — never a paste from the default palette every generator emits.
- **Raw hex in a view/feature file.** Every hue — Klein blue and supporting families alike —
  enters through `ColorTokens.swift` only and is consumed as a named token (§6.3).
- **Meaning riding on hue ALONE.** The owner is **protan + deutran colorblind**. Hue is always
  paired with **icon + label + lightness** so the signal survives his vision.
- **Red-vs-green as the distinguishing axis.** The protan/deutran-invisible axis. Prefer
  contrasts on the **blue ↔ yellow axis** he fully sees — cool-vs-warm family splits are ideal.
- **Greying everything.** The opposite failure of the old blue-only over-reach: an all-grey /
  grey+blue-only surface is the "afraid to be seen" mode the owner named. Distinct supporting
  color is the DEFAULT TOOL for hierarchy, not a reluctant exception.

**Explicitly UNBANNED (2026-07-02):** the warm family (amber/red shades). The old "permanent"
warm-orange refusal is lifted by the owner's word. Warm shades are sanctioned as **duty-scoped,
custom-tuned, token-routed** supporting color (e.g. time-of-day: Waking→Morning as a cool family,
Evening→Bedtime as a warm family).

## Detector rules this ban backs — ⚠️ advisory on color until re-tuned

| Rule id | Corpus severity | Status under the 2026-07-02 principle |
|---|---|---|
| `off-palette-hue` | P0 | **Encodes the superseded blue-band (205–245°) law.** Suppressed for `PeptideFox/**` by owner override (`.design-overrides.json`, ratified 2026-07-01). Treat as advisory on color until the detector is re-tuned. |
| `raw-hex-outside-tokens` | **P0 (blocks)** | **Fully live.** Unaffected by the color ruling — tokens-only routing is §6.3 law, not palette law. |
| `tailwind-palette-hex` | **P0 (blocks)** | **Fully live.** Unaffected — Tailwind pastes are refused regardless of hue. |

## SwiftUI shape of the slop — wrong / right

**Wrong** — a raw Tailwind paste in a view (three violations at once):

```swift
// FeatureCardView.swift  (a feature file, NOT a token dir)
Text(compound.name)
    .foregroundColor(Color(hex: "#f97316"))   // raw-hex-outside-tokens + tailwind-palette-hex
```

**Right** — a bespoke duty-scoped value enters through the token layer, consumed by name, paired
with icon + label:

```swift
// ColorTokens.swift — the ONLY place a hue is defined; bespoke value, not a palette paste
static let eveningWarm = dynamicColor(light: "#A65D3F", dark: "#D99A7C")  // duty: evening→bedtime family

// EveningScheduleRow.swift — hue never carries meaning alone
Label("Evening", systemImage: "moon.fill")            // icon + label carry the meaning
    .foregroundStyle(ColorTokens.eveningWarm)          // color differentiates, duty-scoped
```

## When the refusal is overridden

The 2026-07-02 principle *is itself* the worked example of the amendment channel: the owner's
live word amended the standing blue-only law, was bound as `OVERRIDE` constraints, and was
written back to `.design-overrides.json` — which is why this file now reads as it does. The
remaining refusals (AI-purple/lavender/neon, Tailwind pastes, raw hex in views, hue-alone
meaning, red-vs-green axis) soften only the same way: the owner's explicit instruction, never an
agent's inference. **A new hue is the owner's call** — don't invent one to fill a gap.

## Known divergence (do not silently refactor)

`peptidefox-ios/PeptideFox/DesignSystem/Tokens/ColorTokens.swift` still ships the legacy palette
(orange "Metabolic", teal "Healing", pink/purple compound accents, lavender, Tailwind semantic
hexes). Under the 2026-07-02 principle the debt is reframed but still debt: those values are
**raw Tailwind pastes and un-ratified hue-coded categories**, not duty-scoped bespoke supporting
color. Remediation — re-deriving supporting families as owner-ratified, custom-tuned, duty-scoped
tokens with icon+label pairing — is its own scoped task (CLAUDE.md §6.1). New code holds the line.
