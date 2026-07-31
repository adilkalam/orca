# Banned: The iOS-default reflex — shipping the template instead of the brand

> **Provenance.** iOS-authored, owner-instructed. The SwiftUI sibling of the web
> `design-contract/banned/generic-ui-defaults.md` (iOS-as-default / pretend-variation), re-expressed
> for SwiftUI chrome. It was *taste-advisory with no rule* in the first tranche — which is exactly why
> the reflex survived the gate and recurred. **The owner has instructed custom compact controls over
> native chrome, and the bundled brand language over stock SF, repeatedly** — repeated explicit
> instruction is the highest-merit signal there is (Precedence §1, `docs/reference/design-lane.md`). So it
> is now a real **P0 owner-instructed** detector rule, not a frozen advisory. Source of truth for the iOS
> surface law: `peptidefox-ios/.claude/CLAUDE.md §6` and the hub §3 refusal table.

## Detector rules this ban backs

| Rule id | Severity | What fires |
|---|---|---|
| `ios-default-reflex` | **P0 (blocks) — owner-instructed** | Reflexive stock iOS chrome: a native `Menu`/`Picker` where a custom compact control was the instruction; a default-SF `contextMenu` popover; the default accent `.tint(.blue)` / `.accentColor(.blue)`; oversized native control geometry. Owner-instructed P0 per project — read the severity from the project detector config (`.design-detector.swift.json`) / `BOUND_CONSTRAINTS[].severity`, not a frozen global default; an explicit owner `OVERRIDE` for a named scope suppresses it (owner outranks the floor). |

> **Why P0, not advisory.** Severity tracks **what the owner cares about**, set per project — not a
> frozen global map (the inverse-failure clause of `design-lane.md` §Precedence). A thing the owner
> *instructs* that the severity map files as `advisory` sails through the gate forever; that is the exact
> recurrence this rule kills. It is owner-instructed P0 for this project alongside `system-font-reflex`.

## The refusal

Reflexively shipping the **stock iOS look** — the unmodified Settings grouped-inset list, the
default `.blue` accent (`.tint(.blue)` / `.accentColor`), the default sheet grabber, the default
`NavigationStack` chrome, a native `Menu`/`Picker` or a default-SF `contextMenu` popover where a
custom compact control was instructed — is the iOS form of "looks like every other app." It is not
*wrong*; it is *uncommitted*. The brand has a specific blue (deep cobalt/obsidian, not `.blue`), a
specific type system, and a hairline-not-shadow surface language. Defaulting to the template
throws all of that away and announces "I reached for whatever Xcode gave me."

> "Commit to a BOLD aesthetic direction … No design should be the same across projects. NEVER
> converge on common choices across generations." The iOS-default reflex is convergence on the
> single most common choice.

The specific tells:

- **`.tint(.blue)` / `.accentColor(.blue)`** — the system blue, not the brand obsidian. (If the
  literal `.blue` appears as a hex it may also trip `off-palette-hue`/`tailwind-palette-hex`, but
  the SwiftUI `.blue` *symbol* is the chrome reflex this rule names.)
- **Native `Menu` / `Picker`** dropped in where a custom compact control was instructed — the
  stock disclosure chrome and oversized native geometry instead of the brand's tight control.
- **Default-SF `contextMenu` popover** left in the system look — the unmodified popover chrome.
- **Stock grouped-inset `List` / `Form`** used as the default layout without a deliberate choice
  — the Settings-app look pasted onto a content surface.
- **Default sheet / `NavigationStack` chrome** left untouched where the brand surface language
  (hairlines, brand type, blue depth) was the point.

## SwiftUI shape of the slop — wrong / right

**Wrong** — the stock template (native control chrome + system accent):

```swift
NavigationStack {
    List {                                  // default grouped-inset Settings look
        Section("Compounds") {
            Picker("Sort", selection: $sort) { … }   // native Picker chrome, oversized geometry
        }
    }
    .tint(.blue)                            // system blue, not the brand obsidian
}
```

**Right** — a committed surface in the brand language (custom compact control + brand tint):

```swift
NavigationStack {
    ScrollView {
        LazyVStack(spacing: Spacing.md) {   // a deliberate layout, brand spacing
            CompoundRow(...)                // brand type, hairline separators, blue depth
            CompactSortControl(selection: $sort)     // a custom compact control, brand geometry
        }
        .padding(.horizontal, Spacing.md)
    }
    .tint(DesignSystem.Color.accentBlueDeep) // the brand blue
}
```

A grouped `List` or a native `Picker` is a legitimate choice *when chosen on purpose* for a genuine
settings surface — the refusal is the *reflex*, not the control.

## When the refusal is overridden

It is **owner-instructed P0**, so it does not soften to advisory — but the owner outranks it. The
single sanctioned way past it is an explicit owner `OVERRIDE` (Precedence §1): when the owner
instructs, in context, that a native `Menu`/grouped `List`/`Picker` IS the right call for a named
scope (a genuine settings/preferences screen), bind an `OVERRIDE`
(`{suppresses:"ios-default-reflex", scope:"<glob>", value:"native picker on settings", provenance:"<his
words>"}`), the validator subtracts it before the verdict, and it is written back to
`{project}/.design-overrides.json` so the rule stops firing for that scope. The refusal kills the
*unconsidered default*, not the deliberate platform idiom the owner sanctioned. Never invent the
override — only the owner's explicit instruction licenses it.
