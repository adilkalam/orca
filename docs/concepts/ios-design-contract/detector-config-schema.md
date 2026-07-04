# `.design-detector.swift.json` — per-project config schema

The Swift design detector (`mcp/swift-design-detector`, CLI `swiftdesigncheck`)
reads an **optional** per-project config that tells it which files are the
**token layer** (where defining color/spacing/font literals is legitimate) and
how each rule class behaves inside that layer. The config is the iOS analogue of
the web detector's `DESIGN_COLLECTION_PATH` override, but it is *per-project*
(decision D3 of requirement `ios-impeccable-adaptation`) because token-dir
locations vary per app.

The rule definitions themselves live in
`docs/concepts/ios-design-contract/detector-rules.swift.json`. This config only
scopes them.

> **Two distinct per-project files.** This `.design-detector.swift.json` scopes
> and tunes the *standing* rules (token-dir globs, per-rule `scope_in_token_dirs`
> + `severity`). The **owner-override registry**
> `.design-overrides.json` — schema in
> [`docs/concepts/design-overrides-schema.md`](../design-overrides-schema.md) —
> *suppresses* a named rule for a named path scope from the owner's explicit
> in-context instruction (design-lane.md §Precedence). Both detectors (web + iOS)
> read both files; the detector resolves overrides via `--overrides` flag →
> `SWIFT_DESIGN_OVERRIDES` env → walk-up for `.design-overrides.json` → empty.

## Resolution order

1. `--config <path>` CLI flag.
2. `SWIFT_DESIGN_CONFIG` environment variable.
3. A `.design-detector.swift.json` found by walking **up** from the scanned
   path to the repo root.
4. Built-in defaults (below) if none is found.

A missing config is **not** an error — the detector falls back to defaults so it
works out-of-the-box on any iOS repo whose tokens live under the conventional
paths.

## Schema

```jsonc
{
  // Globs (relative, matched against the scanned file's path) that mark the
  // token layer. A file matching ANY glob is "in a token dir".
  "token_dir_globs": [
    "**/DesignSystem/Tokens/**",
    "**/*Tokens.swift"
  ],

  // OPTIONAL per-rule override of the scope_in_token_dirs flag and/or the
  // enforcement severity baked into detector-rules.swift.json. Keyed by rule id.
  // Use sparingly — the defaults in the rule file are the contract.
  "rule_overrides": {
    // "shadow-reflex": { "scope_in_token_dirs": false },
    // Raise/lower what THIS project enforces (design-lane.md §Precedence inverse
    // case): the global rule files mono-fatigue as P1/advisory, but if the owner
    // cares about it on this app, enforce it as P0 here.
    // "mono-fatigue": { "severity": "P0" }
  }
}
```

#### Per-rule override fields

| Field | Type | Meaning |
| --- | --- | --- |
| `scope_in_token_dirs` | `bool?` | Override the rule's in-token-dir behavior (see keystone below). |
| `severity` | `string?` | Override the rule's enforcement severity (e.g. `"P0"`, `"P1"`, `"advisory"`). Lets a project track **what the owner cares about** instead of a frozen global severity map. Resolved by `DetectorConfig.severity(ruleID:ruleDefault:)` and stamped onto each `Finding` at scan time. |

> The `severity` override is **distinct** from the owner-override registry
> (`.design-overrides.json`, see `docs/concepts/design-overrides-schema.md`). This
> config tunes a rule's *standing* severity for a whole project; the override
> registry *suppresses* a named rule for a named path scope from the owner's
> explicit in-context instruction. Two different jobs, two different files.

### Defaults

| Field | Default |
| --- | --- |
| `token_dir_globs` | `["**/DesignSystem/Tokens/**", "**/*Tokens.swift"]` |
| `rule_overrides` | `{}` (every rule uses its own `scope_in_token_dirs` + `severity`) |

`ColorTokens.swift` and `TypographyTokens.swift` match `**/*Tokens.swift` (and
`**/DesignSystem/Tokens/**`), so both are "in a token dir".

## The keystone: rule-class-aware token scoping

This is the correctness point the architect flagged `#COMPLETION_DRIVE`. A naive
"suppress *everything* inside token dirs" rule would make `ColorTokens.swift`
pass clean at `EXIT=0` even though it is full of off-palette slop — a **false
pass**. The detector therefore splits rules by whether the offense is the token
layer's *job* (suppress) or *slop that happens to live in the token file*
(still fire).

Each rule carries `scope_in_token_dirs` in `detector-rules.swift.json`:

| Rule | `scope_in_token_dirs` | Behavior inside a token dir | Why |
| --- | --- | --- | --- |
| `raw-hex-outside-tokens` | `false` | **suppressed** | Defining hex literals IS the token layer's job. |
| `system-font-reflex` | `false` | **suppressed** | Token factories may compose `relativeTo:` system styles. |
| `magic-number-spacing` | `false` | **suppressed** | The `Spacing` scale is *defined* with numeric literals here. |
| `spring-overshoot` | `false` | **suppressed** | Central animation tokens may legitimately tune curves. |
| `mono-fatigue` | `false` | **suppressed** | The mono factory + sanctioned mono tokens are declared here. |
| `ios-default-reflex` | `false` | **suppressed** | The token layer may legitimately reference system controls/colors when defining adaptions; the reflex is slop only in view/feature code. |
| `off-palette-hue` | `true` | **STILL FIRES** | The orange/teal/pink/purple/lavender slop is defined *in the token file*. |
| `hue-coded-category` | `true` | **STILL FIRES** | The per-category color map (`CompoundColorScheme.forCompound`, `*Accent` families) lives here. |
| `tailwind-palette-hex` | `true` | **STILL FIRES** | The Tailwind default-palette hexes were pasted directly into the tokens. |
| `gradient-fill` | `true` | **STILL FIRES** | `gradientStart`/`gradientEnd` and gradient definitions are declared here. |
| `display-font-below-floor` | `true` | **STILL FIRES** | Display tokens are declared here; a too-small display token is slop at the source. |

Outside token dirs, **every** rule fires (the `scope_in_token_dirs` flag only
governs the in-token-dir case).

### Worked consequence (the acceptance anchor)

Running the detector on `PeptideFox/DesignSystem/Tokens/ColorTokens.swift`
(which matches `**/*Tokens.swift`):

- `raw-hex-outside-tokens` is **suppressed** → the legitimate blue/neutral/ink
  token literals (`#336CFF`, `#2563eb`, `#F7F8FA`, `#111315`, `#0D0F12`, …) stay
  clean.
- `off-palette-hue`, `hue-coded-category`, `tailwind-palette-hex`,
  `gradient-fill` **still fire** → the orange (`#f97316`), teal (`#14b8a6`),
  pink (`#ec4899`), purple (`#9333ea`/`#a855f7`), lavender (`#EDE8FF`),
  `CompoundColorScheme`, and Tailwind-palette hexes are reported as **P0**.

Result: `EXIT=2` with P0 findings that name the slop, and **no** false positive
on the legitimate blue tokens.
