# ORCA-OS Skills — Quick Reference

**Last updated:** 2026-07-31 (three-tier design lane; hubs are the standing aesthetic; owner-gated capture — footers removed)

Skills live in `skills/` and deploy to `~/.claude/skills/`. They are composable, model-invocable Markdown modules that carry disciplined procedures (teach mode, checklists, references).

---

## Design System (24 skills — fork of Bakaus's Impeccable + Adil's aesthetic; web + iOS hubs)

All design **commands** (`/impeccable`, `/recraft`, `/motion-design`, `/refine`, `/simplify`, `/fortify`, `/document`, `/design-audit`, `/design-critique`) load the `impeccable-hub` skill as their aesthetic baseline. Collection lives at `docs/concepts/design-contract/`. Deterministic detector at `mcp/design-detector/`.

> **iOS sibling (2026-06-18):** `.swift` targets load `ios-impeccable-hub` instead (collection `docs/concepts/ios-design-contract/`, detector `mcp/swift-design-detector/`). The count rose 23 → 24 with the iOS hub addition. See the Hub section below.

> **Hub vs. command name (2026-06-03):** the **skill** is `impeccable-hub`; the **slash command** is `/impeccable`. They are different objects with similar names — the hub is the durable-knowledge module every design command loads; `/impeccable` is the thin orchestrator command. Do not conflate them.

### Hub (2 — web + iOS)

| Skill | Purpose |
|-------|---------|
| `impeccable-hub` | THE WEB HUB (2026-06-03 totality rethink, FR-1; the **standing aesthetic** since 2026-07-31). Single home for durable design knowledge: the `interfaces-that-feel` felt-state spine + 17 voice anchors + banned rules (`design-contract/banned/`, 12 refusals) + preferences (7 positive moves) + detector contract. POINTS to `design-contract/` + `impeccable-reference/` refs — no inlined copies (`#POISON_PATH`). Loaded by every design command and by the lane's gated tiers (T1/T2 builder + validator); **T0 `--tweak` does NOT depend on it** — the lane commands inline the banned-core in their own bodies. (Replaces the old `impeccable` spine SKILL.md, which was archived when `/impeccable` was promoted to a command on 2026-04-23.) |
| `ios-impeccable-hub` | THE iOS/SwiftUI HUB (2026-06-18, req `ios-impeccable-adaptation`; the **iOS standing aesthetic** since 2026-07-31). Sibling of `impeccable-hub` for `.swift` targets. A **full parallel hub** that POINTS to the shared felt-state spine (`Skill("interfaces-that-feel")`) and voice anchors (`design-contract/voice-anchors.md`) — never re-inlining them (`#POISON_PATH`) — and authors only the SwiftUI delta inline: the color principle (2026-07-02: Klein-blue primary + duty-scoped supporting color; colorblind kernel = hue never alone, blue↔yellow axis), Dynamic Type discipline, token-layer-is-the-design-document. POINTS to its own collection `docs/concepts/ios-design-contract/` (13 banned rules, 7 preferences, README provenance manifest). §5 detector floor points at `mcp/swift-design-detector/bin/swiftdesigncheck` (the SwiftSyntax CLI), **NOT** `designcheck.js`. **Consumers:** the 3 ios-design agents (`ios-design-architect`/`ios-design-builder`/`ios-design-validator`) + the 5 design-fork commands (`/refine`, `/fortify`, `/simplify`, `/design-audit`, `/design-critique`) when the target is `.swift`. Loaded by the `/ios-impeccable` lane's gated tiers (T0 inlines the iOS banned-core). |

### Verbs — MODIFY surgical additions over Bakaus's content (10)

| Skill | Purpose |
|-------|---------|
| `shape` | Pre-implementation design brief (discovery interview + register calibration via `interfaces-that-feel`). |
| `polish` | Final quality pass. Adds pixel-precision + typography junction audits. |
| `critique` | 3-assessment review: LLM slop check + deterministic detector + persona red-flags. Loaded by `/design-critique`. (Motion-feel adjudication now lives in the shared design lane's `design-validator` — see `docs/reference/design-lane.md`; the old fresh-`Agent()` critique-as-handback-gate for `/motion-design` was superseded by the separate validator.) |
| `typeset` | Typography work. Adds preferred-font-set consult, non-uniform scale, junction discipline. |
| `layout` | Spatial rhythm. Adds 7-rule alignment precision + balance-as-entry-point. |
| `colorize` | Color application. Tailwind palette refused; material-derived substitutes. |
| `animate` | Motion work. Three-tier routing (CSS / GSAP+Lenis / Three.js), directional-not-perspective, Emil Kowalski craft source. |
| `overdrive` | Past-the-limits execution. 2D only, no perspective; Radiant shaders as ambient-background option. |
| `delight` | Earned-emotion proportionality (routine → nothing; milestone → proportional celebration). |
| `harden` | Production readiness. Felt-state framing for edge/error/empty states. |

### Verbs — KEEP (Bakaus content intact + capture-protocol pointer) (6)

| Skill | Purpose |
|-------|---------|
| `ui-quality-audit` (renamed from `audit`) | Technical quality checks (a11y, perf, theming, responsive, anti-patterns) with scored P0–P3 report. Loaded by `/design-audit`. Renamed `audit` → `ui-quality-audit` to stop shadowing the ORCA `/audit` due-diligence command. (The artifact-vs-bound-constraints handback verdict now lives in the shared design lane's separate `design-validator` — see `docs/reference/design-lane.md`; the old self-graded `ui-quality-audit` handback gate for `/impeccable` + `/recraft` was replaced by it.) |
| `distill` | Simplification pass. |
| `bolder` | Push intensity up. |
| `quieter` | Tone intensity down. |
| `optimize` | Performance tuning. |
| `adapt` | Context-adaptation pass. |

### Peer skills (6 — register + motion + 3D specialists)

| Skill | Purpose |
|-------|---------|
| `interfaces-that-feel` | Emotional-register calibration (joy/efficiency/trust/urgency). Earned-emotion table. Persona red-flags. **The felt-state spine the `impeccable-hub` skill points to** — the hub indexes it, it is not duplicated into the hub. |
| `animation-engineering` | Emil Kowalski's motion craft — easing, durations, press states. |
| `motion-design-principles` | Three-tier routing (CSS / GSAP+Lenis / Three.js) + core motion principles. |
| `lenis-integration` | Smooth-scroll setup with Lenis. |
| `threejs-patterns` | Three.js scene patterns. |
| `three-js-animation` | Three.js animation patterns. |

> **Note:** the `interfaces-that-feel` peer is the felt-state spine the hub points to (the hub does not duplicate it).
>
> **Aesthetic capture is owner-gated (2026-07-31, canon `docs/reference/design-lane.md` §Aesthetic capture):** the old closing-handback capture footer on the verb skills is REMOVED — there is NO per-turn capture question. Writes to the aesthetic (`banned/`, `preferences/`, `{project}/.orca/aesthetic-pending.md`) happen ONLY on the owner's explicit ask, or on a strong correction with the exact entry text proposed and approved first. Entries carry the owner's VERBATIM words + explicit scope + severity (`P0 | P1 | advisory`) + date; sessions that wrote entries disclose them in one line at the end. Pending entries sweep via `/impeccable --extract aesthetic`.
>
> **Count observation (updated 2026-06-18):** the table totals Hub (2: `impeccable-hub` + `ios-impeccable-hub`) + MODIFY verbs (10) + KEEP verbs (6) + Peers (6) = 24, matching the heading. (Was 23 before the iOS hub was added.) A `clarify` skill directory exists in `skills/` (wired as `/simplify --clarify → Skill("clarify")`) even though earlier notes said the `clarify` verb was "intentionally absent" — flagged here as pre-existing drift between the prose and the on-disk skill set, not silently reconciled.
>
> **SwiftUI-target blocks + single-sourced cognition loop (updated 2026-07-03, req `orca-audit-remediation` Phase 3b):** the 14 verb skills (`adapt`, `animate`, `bolder`, `clarify`, `colorize`, `delight`, `distill`, `harden`, `layout`, `optimize`, `overdrive`, `polish`, `quieter`, `typeset`) now each carry a `## SwiftUI target` section. The web/iOS lanes share these skills; the `ios-design-architect` passes `platform: swiftui`, and the `ios-design-builder` reads ONLY that section (never the web craft body, which teaches OKLCH/CSS `gap`/`px`/`designcheck.js` that the SwiftUI builder forbids — the iOS self-check is `swiftdesigncheck`). `overdrive`'s SwiftUI block is a stay-native redirect (excluded from the iOS v1 lane). Each skill's per-file "Run the cognition constraint loop (MANDATORY)" paragraph was collapsed to a single line pointing at the canonical `docs/reference/cognition-constraint-loop.md` (removing 14× duplication).

---

## Collection (`docs/concepts/design-contract/`)

- `product-template.md` + `design-template.md` — the per-project schema templates. `/impeccable --teach` reads `product-template.md` and writes `{project}/.claude/PRODUCT.md` (strategic); `/document` (a.k.a. `/impeccable --document`) reads `design-template.md` and writes `{project}/.claude/DESIGN.md` (Stitch-spec visual contract). The old single-file `aesthetic.md` was DEPRECATED 2026-05-02 — the strategic/visual split (PRODUCT.md + DESIGN.md) replaced it; every design command now reads those two files, not `aesthetic.md`.
- `vocabulary.md` — named moves + feelings (grows via aesthetic capture)
- `voice-anchors.md` — 20 verbatim quotes (17 Adil quotes/prefs + 3 sourced from `docs/concepts/llm-css-manifesto.md` for the CSS-architecture family; load-bearing)
- `detector-rules.json` — 11 active pattern rules (regex; incl. `utility-sprawl`, advisory — logs only, never blocks) + deferred handler stubs
- `banned/` — 12 anti-pattern files (colors, fonts, gradients, motion-suddenness, chamfered-buttons, generic-ui-defaults, alignment-spacing, rounded-corners, skeuomorphism, typography-mono, uniform-tile-layout, **css-architecture**). `css-architecture.md` = doctrine B (LLM utility sprawl = scattered design authority; centralize in a named role/token vocabulary, taxonomy-first; advisory, NOT a Tailwind ban; sibling to `colors.md`).
- `preferences/` — 7 move files (alignment-precision, motion-references, typography-fonts, typography-scale, typography-spacing, typography-mono, **css-architecture**). `css-architecture.md` = the positive move: centralize design authority, the role-taxonomy procedure (name role → bind tokens → implement), `@layer`/cascade greenfield default, brownfield respect-detected-approach.
- `radiant-shaders/` — 88 drop-in canvas/WebGL shader HTML files

---

## iOS Collection (`docs/concepts/ios-design-contract/`)

The SwiftUI sibling collection the `ios-impeccable-hub` skill points to (req `ios-impeccable-adaptation` Phase 2, 2026-06-18). Deterministic detector at `mcp/swift-design-detector/` (CLI `swiftdesigncheck` — a SwiftSyntax AST CLI, **not** the web `designcheck.js`).

- `README.md` — index + **provenance manifest** (every section tagged spine-referenced / iOS-authored / provenance-copied; the drift-bound mitigation for the full-parallel-hub `#POISON_PATH`).
- `detector-rules.swift.json` — the Swift detector rule contract (11 rules: 6 P0/block, 5 P1/advisory; mirrors the web finding schema; `scope_in_token_dirs` keystone flag). Phase 0/1.
- `detector-config-schema.md` — the per-project `.design-detector.swift.json` token-dir scoping schema (default globs `**/DesignSystem/Tokens/**`, `**/*Tokens.swift`).
- `banned/` — 13 refusal files: **colors** (the 2026-07-02 color principle; backs `raw-hex-outside-tokens`/`tailwind-palette-hex` fully live + `off-palette-hue`), **hue-coded-categorical** (`hue-coded-category`; kernel = hue-alone + red-vs-green refused), **gradients** (`gradient-fill`), **fonts** (`display-font-below-floor`/`system-font-reflex`), **magic-number-spacing**, **shadow-reflex** (shadow/material/glassmorphism), **spring-overshoot**, **mono-fatigue**, **ios-default-reflex** (backs the `ios-default-reflex` P0 rule), **baseline-join** (backs the `unjoined-unit-baseline` P0 rule, owner-instructed), plus 3 owner-instructed validator-judged refusals distilled 2026-07-06 from the PeptideFox rounds: **prompt-verbosity**, **off-flow-data**, **redundant-chrome**. Every banned filename matches the `source` ref in `detector-rules.swift.json` (field renamed from `source_rant` 2026-07-31).
- `preferences/` — 7 positive-move files: token-layer-is-the-design-document, dynamic-type-discipline (`relativeTo:`), motion-discipline (`withAnimation` + `accessibilityReduceMotion`), color-principle (REPLACES blue-only-palette-law 2026-07-06; sourced from `peptidefox-ios .claude/CLAUDE.md §6.1`), bundled-font-discipline (Brown LL), modal-grammar (swipe + bottom SAVE), dosing-surface-conventions (PeptideFox app-specific).

> Felt-state spine + voice anchors are NOT duplicated here — the iOS hub POINTS to the shared canonical homes (`skills/interfaces-that-feel/SKILL.md`, `docs/concepts/design-contract/voice-anchors.md`). See the README provenance manifest.

---

## Other Skills (general engineering)

See `skills/` directory. Non-design skills unchanged by this fork: `adobe-execution`, `adversarial-analysis`, `alignment-verification`, `article-extractor`, `ascii-tables`, `cursor-code-style`, `debugging-first`, `elements-of-style`, `ios-*`, `linter-loop-limits`, `lovable-pitfalls`, `nextjs-knowledge-skill`, `orca-confirm`, `pg-style-editor`, `precision-discipline`, `print-prep`, `react-*`, `search-before-edit`, `security-basics`, `ship-learn-next`, `tapestry`, `testing-strategy`, `using-loaded-knowledge`, `web-interface-guidelines`, `youtube-transcript`.

---

*Related: [ORCA-agents.md](ORCA-agents.md) · [ORCA-commands.md](ORCA-commands.md) · [ORCA-mcps.md](ORCA-mcps.md) · [ORCA-architecture.md](ORCA-architecture.md)*
