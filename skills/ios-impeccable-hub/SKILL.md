---
name: ios-impeccable-hub
description: "The single home for durable iOS/SwiftUI design knowledge. Load this when doing ANY SwiftUI front-end / visual / interface / motion work on an iOS target — crafting a screen, refining a view, hardening a form, setting type, choosing color, building layout, designing motion. It is the felt-state baseline (interfaces-that-feel) PLUS the iOS aesthetic: the color principle (Klein-blue primary + duty-scoped supporting color), the SwiftUI refusals (banned rules), the positive moves (preferences), and the Swift named-slop detector contract. It does NOT inline the platform-agnostic spine — it POINTS to its single canonical home (interfaces-that-feel + voice-anchors.md) and authors only the SwiftUI-specific delta. This is the iOS sibling of impeccable-hub; load this one when the target is .swift."
license: Apache 2.0. Based on Anthropic's frontend-design skill + Paul Bakaus's Impeccable, adapted for iOS/SwiftUI. See NOTICE.md for attribution.
---

# iOS Impeccable — the SwiftUI design hub

This is the ONE home for durable **iOS/SwiftUI** design knowledge — the platform sibling of the
web `impeccable-hub` skill. When a design verb runs against a `.swift` target (`/refine`,
`/fortify`, `/simplify`, `/design-audit`, `/design-critique`, and the `/ios-impeccable` lane),
this hub is the aesthetic baseline so the doctrine is present *structurally*, never re-stated.

**This hub POINTS; it does not inline.** The platform-agnostic felt-state spine and the voice
anchors have a single canonical home (shared with the web hub). Re-inlining them here would
recreate the lossy monolith this system exists to delete (`#POISON_PATH`). Only the
**SwiftUI-specific delta** is authored inline below; the iOS banned rules/preferences live in their
single home under `docs/concepts/ios-design-contract/`.

> Path note: in this repo the collection lives at `docs/concepts/ios-design-contract/...`;
> deployed it lives at `~/.claude/docs/concepts/ios-design-contract/...`. Both resolve to the
> same content. Read whichever exists.
>
> Provenance note: `docs/concepts/ios-design-contract/README.md` carries the **provenance
> manifest** — for every section it states whether it is spine-referenced / iOS-authored /
> provenance-copied. That manifest is the drift-bound mitigation for choosing a full parallel
> hub. Read it if you need to trace any passage to its source of truth.

---

## 1. The felt-state baseline (the spine) — POINTED TO, not copied

Start every interface from the **felt state of the person**, not the task. This is the
platform-agnostic `interfaces-that-feel` practice — it is the first thing you load, and it is the
SAME practice for web and iOS.

→ **`skills/interfaces-that-feel/SKILL.md`** — load it directly (`Skill("interfaces-that-feel")`).
The full practice (felt-state framing, motion craft, copy voice, empty states, error messages,
loading, onboarding, micro-interactions) is there. It is **not** duplicated here.

Technical correctness is the floor. On iOS this is doubly true: the `/ios` lane already gates
correctness/architecture/build. The ceiling is — does this product know the user is a person
holding a phone one-handed? (This app is **phone-first / primary**, not a degraded path; see the
mobile inversion in CLAUDE.md §4.)

---

## 2. The aesthetic — voice anchors (the user's own words) — POINTED TO

The voice anchors are load-bearing direct quotes from Adil — the *why* behind every refusal and
move. They are platform-agnostic; do not paraphrase or dilute them.

→ **`docs/concepts/design-contract/voice-anchors.md`** — the full anchor set. Read it there; it is
not copied into this iOS hub.

→ **`docs/concepts/design-contract/persona.md`** — the POSITIVE side of the aesthetic (taste, references,
gravity), platform-agnostic and shared with the web hub — POINTED TO, not copied (per this hub's
delta-only rule). The banned rules say what is refused; the persona says what is aimed at — the flatness
mission, context-over-reflex, the named references, the composition discipline (entry point / pace /
density-per-moment). **Read it before composing any new screen** — FORWARD seeds draw from it at
bind time. Judgment + gravity, never a house style; anti-convergence outranks it.

A few that orient the iOS work (read the file for all of them):
- "The use of Geist = vercel → no thought in typography." (the iOS form: shipping default SF where
  the bundled Brown LL was right there.)
- "Whatever color that background is hurts my eyes; the gradients only make it worse." (AI-purple.)
- "I do not fuck around with alignment. Pixel perfect precision, otherwise I can't help but
  notice." (the spacing-scale discipline.)
- "There is nothing uglier than annotated art." (shown, not announced — no reflexive shadows/
  glassmorphism.)
- "Smooth, elegant motion — not perspective, just directional." (no spring overshoot.)

### The iOS delta on the aesthetic (authored inline — this IS the platform-specific part)

The web aesthetic is about CSS/typography/color in the browser. The iOS surface adds three things
the spine does not address, and these are the load-bearing iOS additions:

1. **The color principle (2026-07-02, supersedes "blue-only"): Klein blue is PRIMARY; distinct
   duty-scoped supporting color is the DEFAULT TOOL for hierarchy.** The owner is **protan +
   deutran colorblind** — the accessibility kernel is that meaning never rides on hue ALONE
   (pair hue with icon + label + lightness), chromatic contrast sits on the blue↔yellow axis he
   sees (cool-vs-warm splits are ideal), and red-vs-green is never the distinguishing axis. The
   warm family is UNBANNED (duty-scoped, custom-tuned, token-routed); the timid grey/blue-only
   mix is a named failure mode ("afraid to be seen"), equal to the acid trip. (Source of truth:
   `peptidefox-ios/.claude/CLAUDE.md §6.1`; his live word beats this hub.)
2. **Dynamic Type is non-negotiable.** Every font scales (`relativeTo:` a `TextStyle`); a
   fixed-size font is an accessibility regression. The web docs do not address this.
3. **The token layer IS the design document.** No raw hex, no raw font name, no magic-number
   spacing in views — everything routes through `DesignSystem/Tokens/`. This is the iOS form of
   the web's "semantic CSS is the authority."

---

## 3. The refusals (banned) — what is NEVER acceptable

Each banned rule is a named refusal with the SwiftUI wrong/right + its detector rule id. Consult the
rule when you reach for the move it forbids. Each lives in `docs/concepts/ios-design-contract/banned/`.

| Refusal | Source rule | Detector rule(s) | Severity |
|---|---|---|---|
| Raw hex in a view / Tailwind-palette hex / AI-purple-lavender-neon | `banned/colors.md` | `raw-hex-outside-tokens`, `tailwind-palette-hex` (both fully live); `off-palette-hue` (blue-band rule — **advisory-on-color** since the 2026-07-02 principle, suppressed for `PeptideFox/**` in `.design-overrides.json`) | **P0 (block)** for the live rules |
| Hue as SOLE carrier of meaning / red-vs-green axis / un-ratified rainbow | `banned/hue-coded-categorical.md` | `hue-coded-category` (**advisory-on-color** since 2026-07-02 — duty-scoped families with icon+label+lightness are sanctioned) | Kernel refusals validator-judged |
| Gradient surface/text fill | `banned/gradients.md` | `gradient-fill` | **P0 (block)** |
| Display face below the 28pt collapse floor | `banned/fonts.md` | `display-font-below-floor` | **P0 (block)** |
| System-font reflex (default SF over bundled Brown LL) | `banned/fonts.md` | `system-font-reflex` | **P0 (block) — owner-instructed** † |
| Magic-number spacing (raw literals in padding/spacing) | `banned/magic-number-spacing.md` | `magic-number-spacing` | P1 (advisory) |
| Shadow / material / glassmorphism reflex | `banned/shadow-reflex.md` | `shadow-reflex` | P1 (advisory) |
| Spring overshoot (bouncy/elastic animation) | `banned/spring-overshoot.md` | `spring-overshoot` | P1 (advisory) |
| Monospace fatigue (mono on body/numeric data) | `banned/mono-fatigue.md` | `mono-fatigue` | P1 (advisory) |
| iOS-default reflex (stock grouped list/`Menu`/`Picker`, `.tint(.blue)`, default chrome, oversized native popovers) | `banned/ios-default-reflex.md` | `ios-default-reflex` | **P0 (block) — owner-instructed** † |
| Unit/suffix label not baseline-joined to its figure (center-anchored entry joins) | `banned/baseline-join.md` | `unjoined-unit-baseline` | **P0 (block) — owner-instructed** † |
| Prompt verbosity (multi-sentence step prompts; words where a glyph works — lock = glyph, not words; "(optional)"-style qualifiers; headlines restating content) | `banned/prompt-verbosity.md` | *(none — validator-judged)* | **Owner-instructed (validator BLOCK)** † |
| Off-flow data (surfacing information the flow didn't compute or consume — e.g. frequency on a mixing result) | `banned/off-flow-data.md` | *(none — validator-judged)* | **Owner-instructed (validator BLOCK)** † |
| Redundant chrome (boxed native controls, orphaned hairlines, duplicate affordances, modal top bars) | `banned/redundant-chrome.md` | *(none — validator-judged)* | **Owner-instructed (validator BLOCK)** † |

> † **Severity tracks what the owner cares about (Precedence §1), set per project.** The owner has
> instructed the bundled face over default SF and a custom compact control over native `Menu`/`Picker`
> chrome **repeatedly** — repeated explicit instruction is the highest-merit signal there is, so these
> are **enforced, not advisory**, for this project. They were `P1`/`taste-no-rule` before, which is
> exactly why they survived the gate and recurred. The enforcement home is the per-project detector
> config (`.design-detector.swift.json` severity overrides) + a real `ios-default-reflex` rule in
> `detector-rules.swift.json`; this row is the contract those changes satisfy. (The detector-code half is
> the next tranche — see the affected-files list.)

**Absolute bans (rewrite the element entirely if you catch yourself reaching for these):**
- **The AI-purple/lavender/cyan/neon family** and **raw Tailwind-palette hexes** — permanent.
- **Gradient as surface/text fill** — decorative AI tell, and it lands in the hue band the owner
  cannot see.
- **Meaning riding on hue ALONE**, and **red-vs-green as the distinguishing axis** — the
  protan/deutran kernel. Hue is always paired with icon + label + lightness.

> **Lifted (2026-07-02, owner):** the old "permanent" warm-orange ban. Warm shades are sanctioned
> as duty-scoped, custom-tuned, token-routed supporting color, and a second hue for hierarchy is
> now the DEFAULT TOOL (paired per the kernel) — see `preferences/color-principle.md` and
> CLAUDE.md §6.1. Do not re-impose the old bans; the timid grey/blue-only mix is itself a named
> failure mode.

---

## 4. The positive moves (preferences) — what to reach for instead

Each preference is a positive catalog/procedure under
`docs/concepts/ios-design-contract/preferences/`. Consult when making the corresponding decision.

| Move | Source preference |
|---|---|
| Route every value through tokens (no inline design) | `preferences/token-layer-is-the-design-document.md` |
| Dynamic Type discipline (`relativeTo:` always; tabular figures for data) | `preferences/dynamic-type-discipline.md` |
| Motion (directional ease-out, `withAnimation` + `accessibilityReduceMotion`, no bounce) | `preferences/motion-discipline.md` |
| The color principle (Klein-blue primary; duty-scoped supporting color as the default hierarchy tool; colorblind kernel: icon+label+lightness, blue↔yellow axis, icon-required danger red) | `preferences/color-principle.md` |
| Bundled-font discipline (Brown LL workhorse; reserve display ≥28pt + mono micro-only) | `preferences/bundled-font-discipline.md` |
| Modal grammar (swipe in/out, bottom SAVE, centered normal-size title, scope tag up top, inline toggles) | `preferences/modal-grammar.md` |
| Dosing-surface conventions (µg symbol always; unit dropdowns; ratio-lock recap + glyph; converged → Smaller injection; doses-per-vial; compact secondary caption) — **PeptideFox app-specific** | `preferences/dosing-surface-conventions.md` |

### Always-on craft (do these without consulting a reference)

- **Color:** Klein blue (`v7Cobalt*`) is the primary accent — hero numerals, active states, CTAs;
  most chrome stays ink/white/neutral. Distinct duty-scoped supporting color (warm families
  included) is the default tool for hierarchy — bespoke values through `ColorTokens.swift`, never
  Tailwind pastes, never AI-purple/lavender/neon. The colorblind kernel: pair hue with icon +
  label + lightness (never hue alone), prefer the blue↔yellow axis, never red-vs-green;
  danger red stays icon-required. Steer between the acid trip AND the timid grey/blue-only mix.
  Validate by eye on a bright screen (the Anti-Vanish floor); both light and dark schemes obey.
- **Type:** `Font.primary` is the workhorse for nearly everything (incl. headers and card titles);
  `Font.heroInline` only for hero moments at ≥28pt; `Font.accentMono` only for micro labels.
  Always `relativeTo:` a `TextStyle`. Calculator/dosing figures use `.monospacedDigit()` on the
  BRAND face (tabular columns), never the mono family.
- **Space:** every inset/gap is a `Spacing` token from the 4pt scale — no bare numbers. Vary
  spacing for hierarchy.
- **Motion:** directional ease-out, considered durations, no bounce/elastic, transform+opacity
  over layout, and always gate on `accessibilityReduceMotion`.
- **Surface:** hairlines + flat tint steps, not reflexive `.shadow(...)` or `.ultraThinMaterial`
  glassmorphism. Depth is a choice made each time, against the platform default.

---

## 5. The detector — the named-slop floor (Swift, NOT designcheck.js)

The iOS detector is a deterministic SwiftSyntax AST CLI that names slop in `.swift` files. It is
the FLOOR of the gate, never the taste ceiling. Run it via the wrapper (it resolves a prebuilt
binary, falls back to `swift run`, and degrades to a non-blocking exit 0 if no Swift toolchain is
present):

```bash
/Users/adilkalam/ORCA-OS/mcp/swift-design-detector/bin/swiftdesigncheck detect --json <path> 2>&1; echo "EXIT=$?"
```

> Use the Swift wrapper above — **NOT** the web `designcheck.js`. That is the CSS detector and
> does not understand Swift.

Contract (mirrors the web detector): **EXIT 0** + `[]` = clean. **EXIT 2** = findings, and the
findings JSON arrives on STDERR (capture `2>&1`, key the decision off the exit code). Each finding
is `{antipattern:<ruleId>, name, description, file, line, snippet}`. Rule definitions + severities
live in `docs/concepts/ios-design-contract/detector-rules.swift.json`; per-project token-dir
scoping is `.design-detector.swift.json` (schema: `detector-config-schema.md`).

- **P0 (a finding forces BLOCK):** `off-palette-hue`, `raw-hex-outside-tokens`,
  `hue-coded-category`, `tailwind-palette-hex`, `gradient-fill`, `display-font-below-floor`, `unjoined-unit-baseline` (owner-instructed).
- **P1 (advisory — logged, never blocks):** `magic-number-spacing`,
  `shadow-reflex`, `spring-overshoot`, `mono-fatigue`.

> **Owner-cares-about (per-project severity, override-config-driven).** `system-font-reflex` †
> is NOT a flat P1 advisory — its enforcement severity is **set per project, not by a frozen global
> map**. The owner has instructed the bundled Brown LL face over default SF **repeatedly**, so a
> project pins it to BLOCK (owner-instructed) and the lane reads that from the per-project detector
> config (`.design-detector.swift.json` severity override) / `BOUND_CONSTRAINTS[].severity` — exactly
> as the §3 dagger footnote (lines ~101-108) specifies. The corpus default in
> `detector-rules.swift.json` stays `P1` by design; the per-project override is the enforcement home
> for the flip. See the §3 `†` footnote. (`ios-default-reflex` is a separate P0 rule — §3, not this
> P1 list.)

**The token-scoping keystone:** raw-literal rules (`raw-hex-outside-tokens`, `system-font-reflex`,
`magic-number-spacing`, `spring-overshoot`, `mono-fatigue`) are **suppressed** inside token dirs
(`**/*Tokens.swift`, `**/DesignSystem/Tokens/**`) because defining literals there is the token
layer's job. But `off-palette-hue`, `hue-coded-category`, `tailwind-palette-hex`, `gradient-fill`,
`display-font-below-floor` **STILL FIRE** inside token dirs — because that is precisely where the
off-palette / hue-coded / pasted-Tailwind / gradient slop lives. This is what makes
`ColorTokens.swift` correctly flag P0 instead of falsely passing clean.

**Scope & cross-project use.** The detector defaults encode the PeptideFox v7 palette law *as of
the blue-only era* (the 205–245° blue band, the hardcoded token paths, the
`peptidefox-ios .claude/CLAUDE.md §6.1` rule prose). The 2026-07-02 color principle supersedes that
reading: `off-palette-hue` and `hue-coded-category` are **advisory on color** for this brand until
the detector is re-tuned (owner suppressions in `.design-overrides.json`); the other rules are
unaffected. They are this brand's law, not generic-iOS defaults. To run against another brand, override
`SWIFT_DESIGN_RULES` (the rule corpus JSON), `SWIFT_DESIGN_CONFIG` (token-dir scoping), and
`SWIFT_DESIGN_DETECTOR_BIN` (the binary path).

---

## 6. How the rules actually bind (floor vs ceiling — honest)

**Precedence (read this first): the owner outranks this hub.** Everything below is a *default for when
the owner has not spoken to the point* — never a ceiling over his live word. The order is fixed: (1) the
owner's explicit, in-context instruction; (2) the aesthetic; (3) the deterministic Swift
detector. A banned rule is *derived from* the owner; it cannot outrank him. The mechanism has a completed
worked example: the owner's "this brief is over-restrictive, use color" (2026-07-01) and the full
color principle (2026-07-02) **won over the then-standing blue-only P0** — bound as `OVERRIDE`
constraints (`docs/reference/design-lane.md` §Precedence) that the validator subtracts before the verdict,
**written back** to `{project}/.design-overrides.json`, and ultimately ratified into the standing law
itself (CLAUDE.md §6.1 + this aesthetic's 2026-07-06 re-sync). That is the full life-cycle: live word →
scoped override → amended standing aesthetic. A default owned by a person who needs to amend it
situationally MUST have an amendment channel, or it produces the exact repetition it was meant to end.
The override is owner-authored, so it is ratified by construction (unlike a banned rule the system distilled and
froze without his sign-off). See `design-lane.md` §Precedence for the full mechanism.

The hub being present is necessary but not sufficient. Two mechanisms do the binding:

1. **The iOS design lane** (Phase 3: `agents/ios-design/` + `commands/ios-impeccable.md`,
   reusing `docs/reference/design-lane.md`) — a thin orchestrator binds typed FORBIDDEN/FORWARD
   constraints, spawns a SEPARATE `ios-design-builder`, then a SEPARATE fresh-context
   `ios-design-validator` that judges against the bound ids + the Swift detector and emits
   `GATE_VERDICT: PASS|BLOCK`. The model never grades its own output (the self-charity floor).
   This lane runs ADDITIVELY alongside the `/ios` correctness gates — it does not replace
   `ios-standards-enforcer`, `ios-ui-reviewer`, or `ios-verification`.
2. **Structured selection** — felt-state binds through discovery, not through narrated reasoning.

**The honest ceiling (state it, never hide it):**
- **Guaranteed:** rules present (structural); adjudication external (separate validator + Swift
  detector floor); no named slop; no silent no-op; the `ColorTokens.swift` divergences are named
  at the gate.
- **NOT guaranteed:** good taste — irreducibly the validator's judgment + **the user's eye is the
  taste ceiling** (and on color, the owner's colorblind eye on a bright screen is the final check
  the Anti-Vanish floor defers to). The detector/validator are **hard-on-named-slop,
  advisory-on-taste**. Anyone claiming more is selling another constraint-bind (`#POISON_PATH`).

---

## 7. Project context (read before any iOS design work)

The authoritative iOS design law is **`peptidefox-ios/.claude/CLAUDE.md §6`** — the color
principle (§6.1, 2026-07-02: Klein-blue primary + duty-scoped supporting color, incl. the known
`ColorTokens.swift` divergence), typography (§6.2, incl. the
OPEN Brown-LL-vs-web-roster decision — a product call, not an agent call), tokens-not-hardcoded
(§6.3), and elevation/motion/dark-mode (§6.4). The shipped token system is
`PeptideFox/DesignSystem/Tokens/{ColorTokens,TypographyTokens,SpacingTokens,MotionTokens}.swift`;
contrast guidance is `PeptideFox/DesignSystem/Docs/ColorContrastGuide.md`.

Two things the spine does NOT decide and you must NOT decide unilaterally:
- **Remediating the `ColorTokens.swift` off-palette debt** — its own scoped task; do not silently
  refactor tokens as a side effect of unrelated work. The detector names the debt at the gate.
- **The Brown LL vs. web type roster question (§6.2)** — flag it to the user; either answer is
  defensible; it is a product call.

---

## 8. The AI slop test

If you showed this screen to someone and said "AI made this," would they believe you immediately?
If yes, that's the problem. The §3 refusals are the 2024–2025 fingerprints in SwiftUI form:
gradient hero washes, default-SF type, `.tint(.blue)` stock chrome, shadow-on-everything, bouncy
springs, and a rainbow of category hues the owner can't even see. A distinctive iOS interface
makes someone ask "how was this built?" — not "which template is this?"
