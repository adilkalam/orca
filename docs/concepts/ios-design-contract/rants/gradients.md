# Rant: Gradients (iOS/SwiftUI) — the decorative AI tell, ported to SwiftUI

> **Provenance.** Cross-platform refusal. Same enemy as the web
> `design-contract/rants/gradients.md` (AI-purple/magenta/pink gradients, `background-clip:text`
> gradient text), re-expressed for SwiftUI's `LinearGradient`/`RadialGradient`/`AngularGradient`
> constructs. The colorblind argument (the purple/magenta band is exactly where the owner's
> vision compresses) carries over unchanged.

## Detector rule this rant backs

| Rule id | Severity | What fires |
|---|---|---|
| `gradient-fill` | **P0 (blocks)** | A `LinearGradient`/`RadialGradient`/`AngularGradient`/`EllipticalGradient` initializer or a `.linearGradient(...)`/`.radialGradient(...)` member call used as a surface/text fill, OR a token whose name contains `gradient` (`gradientStart`/`gradientEnd`). Fires inside token dirs too — the gradient stop tokens are declared there. |

## The refusal

A gradient used as a **surface or text fill reads as decorative AI slop.** It is the
2024–2025 generator fingerprint: the soft purple-to-pink hero wash, the "premium" angular
sheen, the gradient-filled headline. On this brand it fails twice:

- It is **decoration announcing itself** — "there is nothing uglier than annotated art." A
  gradient is the surface saying *look how designed I am*.
- The AI-gradient band (purple → magenta → pink) is **precisely the hue range the owner's
  protan/deutran vision compresses.** The gradient is invisible-as-intended and present-as-haze
  at the same time.

Use a **solid token.** For emphasis use weight, size, or blue depth — never a gradient.

## SwiftUI shape of the slop — wrong / right

**Wrong** — gradient surface and gradient text:

```swift
RoundedRectangle(cornerRadius: 16)
    .fill(LinearGradient(                       // gradient-fill fires
        colors: [Color(hex: "#a855f7"), Color(hex: "#ec4899")],
        startPoint: .topLeading, endPoint: .bottomTrailing))

Text("Mechanism")
    .foregroundStyle(.linearGradient(           // gradient-fill fires (member call)
        colors: [.purple, .pink], startPoint: .leading, endPoint: .trailing))
```

```swift
enum BrandGradient {
    static let gradientStart = Color(hex: "#336CFF")   // gradient-fill fires at the token source
    static let gradientEnd   = Color(hex: "#1d3aa3")
}
```

**Right** — solid token; emphasis via weight and blue depth:

```swift
RoundedRectangle(cornerRadius: 16)
    .fill(DesignSystem.Color.surfaceElevated)          // a solid token

Text("Mechanism")
    .font(v7Typography.h2)                             // size + weight carry emphasis
    .foregroundColor(DesignSystem.Color.accentBlueDeep)
```

## The narrow legitimate exception

A near-imperceptible **single-hue blue depth shift** (e.g. a 2–4% lightness vignette on a
full-bleed hero, where it reads as light falloff, not as decoration) is not what this rant
forbids — but it must be **shown, not announced**, stay strictly within the blue band, and never
involve a second hue. If you have to think "is this a gradient effect?", it is. Default to solid.

## When the refusal is overridden

It is not, for surface/text fills. Material light-falloff that the viewer never reads as "a
gradient" is a craft call, not a license to ship the purple hero wash.
