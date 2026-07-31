# Banned: Unjoined unit baseline (iOS/SwiftUI) — a figure and its unit are ONE phrase, seated on ONE baseline

> **Provenance.** Owner-instructed, REPEATEDLY. First as the P6-T1 entry-anatomy correction
> (2026-07 calculator passes: "firstTextBaseline unit-on-figure join fixed once at shared
> components, 0pt deviation, pixel-proofed"), then re-caught by the owner on the FoxAI
> Explore & Build review editor, 2026-07-14, verbatim: **"And I still see design nits I had
> called out last session — like not having units aligned to the baseline of numbers in
> inputs."** A rule the owner has to re-teach is a rule that wasn't structural — hence this
> promotion. The recorded canonical mechanism lives at the shared entry components
> (`VialMixInputModule` "P6-T1 BASELINE JOIN — the mechanism, recorded").

## Detector rule this ban backs

| Rule id | Severity | What fires |
|---|---|---|
| `unjoined-unit-baseline` | **P0 (block) — owner-instructed** | An `HStack` whose `alignment:` is absent (default `.center`) or not `.firstTextBaseline`, whose trailing closure contains BOTH an entry field (`TextField`/`SecureField`) AND a `Text` label at its own level. Nested containers are boundaries — each answers for its own alignment, so a seated inner join beside a sibling `Toggle` passes clean. |

## The refusal

A dose reads as one phrase: "250 µg". "10 weeks". The figure and its unit are the two halves
of a single utterance — and text that shares an utterance shares a **baseline**. The slop is
the default: SwiftUI's `HStack` center-aligns, and a 13pt unit label center-anchored beside a
17–24pt entry figure floats **above** the figure's baseline — worse the moment the entry voice
grows. It reads as a typo at every glance, and the owner cannot help but notice
("I do not fuck around with alignment").

The failure is invisible in code review because both lines LOOK adjacent in source; it is a
felt failure on screen. That asymmetry is exactly why it recurred — and exactly what a
deterministic AST rule is for.

## Wrong / right

```swift
// WRONG — default (center) alignment: the unit floats above the figure's baseline
HStack(spacing: DesignSystem.Spacing.xs) {
    TextField("Choose value", text: $doseText)
        .font(DesignSystem.Typography.resultInline)
    Text("µg")
        .font(DesignSystem.Typography.unit)
}

// RIGHT — the P6-T1 join: value + unit seated on .firstTextBaseline
HStack(alignment: .firstTextBaseline, spacing: DesignSystem.Spacing.xs) {
    TextField("Choose value", text: $doseText)
        .font(DesignSystem.Typography.resultInline)   // placeholder shares the entry font —
    Text("µg")                                        // empty→filled never re-seats the line
        .font(DesignSystem.Typography.unit)           // natural text height: NO maxHeight fill
}
```

The three load-bearing conditions of the mechanism (all recorded at the canon site):
1. **`.firstTextBaseline` on the joining HStack** — never a per-mount `.offset`/`.padding`
   fudge, never an `.alignmentGuide` fallback.
2. **The placeholder renders in the entry's own font** (the `.font` on the `TextField`), so the
   line never re-seats between empty and filled.
3. **The unit label keeps its natural text height** — a `maxHeight: .infinity` fill is what
   center-anchors the old anatomy and floats the unit.

Sibling controls (a `Toggle`, a stepper) ride the OUTER row center-aligned against the entry
line as a whole; the baseline seat is internal to the figure+unit pair. The detector encodes
this: nested containers are judged on their own alignment.

## Scope notes

- Fires app-wide on view files; suppressed in token dirs (no entry anatomy lives there).
- Tunable without recompiling via the rule JSON `detector` block (`container_types`,
  `entry_field_types`, `label_types`, `required_alignment`, `boundary_containers`).
- On promotion day (2026-07-14) the rule immediately caught three live pre-existing sites the
  owner's eye had been paying for: `FormValidation.swift` (the SHARED number-field component),
  `DoseEditSheet.swift`, and `ProtocolFormSheet+Sections.swift` — all fixed the same hour.
