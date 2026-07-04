# Rant: Hue-coded categories — the rainbow that the owner cannot see

> **Provenance.** iOS-authored. The web hub distinguishes categories with the typography/layout
> moves in its preferences; there is no exact web rant for this because the *categorical*
> failure is sharpest under the owner's colorblindness, which the iOS law (`§6.1`) makes
> central. This rant is the SwiftUI-specific refusal that the `hue-coded-category` detector rule
> backs.

## Detector rule this rant backs

| Rule id | Severity | What fires |
|---|---|---|
| `hue-coded-category` | **P0 (blocks)** | A `switch`/`case` that maps category cases to *differing* color values (e.g. `CompoundColorScheme.forCompound`), OR a family of ≥3 tokens named `<category>Accent` assigning chromatic, differing hues per category. Fires inside token dirs too — the per-category color map lives in the token file. |

## The refusal

A categorical concept — compound type, metabolic vs. healing, per-peptide accent, chart series,
stack group — must NOT be encoded by **giving each category its own hue.** This is the single
most direct violation of the blue-only law (`colors.md`), because:

- To a **protan + deutran** viewer, the per-category hues collapse toward a single muddy band.
  The "color coding" the code believes it is doing is invisible to the exact person the product
  is built for. The distinction is real in the source and absent on the screen.
- It also re-introduces the AI-slop multi-hue palette through the back door of "but it's
  semantic."

**Categories are distinguished by typography, layout, iconography, and blue LIGHTNESS TIER —
never by stepping hue.** When N things need distinct identities, separate them by dark / mid /
light lightness steps with text-color inversion, plus a distinct SF Symbol and a clear label.

## SwiftUI shape of the slop — wrong / right

**Wrong** — a color scheme that switches the accent hue per category:

```swift
enum CompoundColorScheme {
    static func forCompound(_ c: Compound) -> Color {
        switch c.kind {
        case .metabolic: return Color(hex: "#f97316")   // orange
        case .healing:   return Color(hex: "#14b8a6")   // teal
        case .glow:      return Color(hex: "#ec4899")   // pink
        case .nad:       return Color(hex: "#9333ea")   // purple
        }
    }
}
// hue-coded-category fires: a switch maps cases to differing chromatic hues.
```

**Right** — one accent, distinguish by lightness tier + symbol + label:

```swift
enum CompoundTier {
    /// Distinction is lightness + iconography, NOT hue.
    static func tier(_ c: Compound) -> Color {
        switch c.kind {
        case .metabolic: return DesignSystem.Color.accentBlueDeep
        case .healing:   return DesignSystem.Color.accentBlueMid
        case .glow:      return DesignSystem.Color.accentBlueLight
        case .nad:       return DesignSystem.Color.accentBlueFaint
        }
    }
    static func symbol(_ c: Compound) -> String { /* a distinct SF Symbol per kind */ }
}
```

The reader tells categories apart by *how light the blue is*, *which icon sits beside it*, and
*the label* — all of which survive the owner's vision. The hue never does the work.

## When the refusal is overridden

It is not, on this brand. If a future project is NOT owned by a colorblind viewer, the
lightness-tier rule relaxes to a preference — but the detector default and this brand keep it P0.
