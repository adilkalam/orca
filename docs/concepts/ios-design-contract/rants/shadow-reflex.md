# Rant: Shadow / material / glassmorphism reflex (iOS/SwiftUI) — restraint over faux-depth

> **Provenance.** Cross-platform spirit (the web `design-contract/rants/skeuomorphism.md` +
> `chamfered-buttons.md` refuse the "dark-glow" and inset-highlight faux-depth stack), authored
> here for the SwiftUI surface where the reflex is `.shadow(...)`, `.ultraThinMaterial`, and the
> glassmorphism blur. Source of truth for the iOS stance:
> `peptidefox-ios/.claude/CLAUDE.md §6.4` ("Restraint over faux-depth … hairlines and contrast,
> not heavy drop-shadows or glassmorphism — this pushes *against* default iOS material chrome").

## Detector rule this rant backs

| Rule id | Severity | What fires |
|---|---|---|
| `shadow-reflex` | **P1 (advisory)** | Any explicit `.shadow(...)` modifier call. Colored / large-radius shadows are the worst case (the "dark-glow" tell ported to SwiftUI); v1 flags any explicit `.shadow` as advisory. Fires inside token dirs too — an elevation/shadow token can encode the reflex. |

## The refusal

The brand language is **hairlines and contrast**, not depth-faking. The reflex moves it refuses:

- **Drop shadows to imply elevation** — especially colored or large-radius shadows. A coloured
  glow is the dark-glow AI tell; a soft 20pt drop shadow under every card is the SaaS-template
  reflex.
- **Glassmorphism** — `.ultraThinMaterial` / `.regularMaterial` blur stacks used decoratively to
  look "premium." This is the iOS-default material chrome the brand deliberately pushes against.
- **The skeuomorphic depth stack** — inner highlight + outer shadow + subtle gradient to fake a
  raised button. (The gradient half is also caught by `gradients.md`.)

The point is **deliberate restraint**: depth, when it is needed at all, comes from a **hairline
border** (1px / `.separator`), a **flat tint step**, or a token-defined elevation — never a
reflexive `.shadow(...)`. Because this pushes against the platform default, it is a choice you
make *each time*, on purpose.

> "A great one carries what the product is in a way that's immersive, without announcing. There
> is nothing uglier than annotated art." A drop shadow under every card is the surface
> announcing "I am elevated."

## SwiftUI shape of the slop — wrong / right

**Wrong** — reflexive shadow and decorative material:

```swift
card
    .background(.ultraThinMaterial)              // shadow-reflex family: glassmorphism chrome
    .shadow(color: .blue.opacity(0.4), radius: 18, y: 8)  // shadow-reflex (advisory): coloured large-radius glow
```

**Right** — hairline + flat tint; depth without faux-depth:

```swift
card
    .background(DesignSystem.Color.surfaceElevated)   // a flat tint step
    .overlay(
        RoundedRectangle(cornerRadius: 12)
            .stroke(DesignSystem.Color.hairline, lineWidth: 1)  // a hairline carries the edge
    )
```

## When the refusal is overridden

Advisory only — it never blocks. A single, restrained, neutral (non-coloured), small-radius
shadow for a genuinely floating element (e.g. a transient toast) is a defensible exception the
validator can clear. The reflex it kills is *shadow-on-everything* and *coloured glow*. Default
to a hairline.
