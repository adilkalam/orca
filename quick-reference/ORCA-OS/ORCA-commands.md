# OS 7.0 Commands Quick Reference

**Last Updated:** 2026-06-18 (ios-impeccable overlay added)
**Version:** OS 7.1
**Total Commands:** 32 (+ orca-record CLI with 7 subcommands (5 hook + 2 user))

> **Count reconciled (2026-06-04, +1 on 2026-06-18):** `find commands -maxdepth 1 -name '*.md' | wc -l` returned **54** at the 2026-06-04 reconcile; the prior recorded count of 52 was stale (`think-model.md`, added on 2026-04-23 during the design-system fork, was the most-recent uncounted file). On 2026-06-18 `/ios-impeccable` (the additive iOS/SwiftUI design overlay, Phase 3 of `ios-impeccable-adaptation`) was added, bringing the total to **55**; `total_commands: 55` here now agrees with `os-dependency-graph.yaml`. Note: a few command files share a single doc entry below — `/session-resume` is documented under the `/session-save` / `/session-resume` combined header. The Design Commands section count IS verified against on-disk files. `/ios-impeccable` is documented within the Design Commands section as the iOS overlay sibling of `/impeccable`.

---

## Routing Modes

All `/orca-*` lane commands support four execution modes:

| Mode | Flag | Path | Gates | Use Case |
|------|------|------|-------|----------|
| **Light** | `--light` | Light orchestrator | YES | Confident users, skip confirmation |
| **Default** | (none) | Light + Confirmation | YES | Most work |
| **Tweak** | `--tweak` | Builder direct | NO | Speed iteration |
| **Complex** | `--complex` | Full pipeline | YES | Architecture work |

---

## Lane Orchestrator Commands (15)

<!-- /seo-optimize and /aio are advisory/diagnostic lanes -- a command plus a
focused working agent set, not full orchestrator-ceremony lanes. /geo-diagnose,
/geo-rewrite, and /geo-measure are composable sub-commands of the /aio lane (each
wraps one of the three aio agents); they are not counted as separate lanes. -->



### `/ios` - iOS Lane
```bash
/ios "fix button padding"           # Default: light + gates
/ios --tweak "try animation"         # Tweak: no gates
/ios --complex "auth flow"          # Complex: full pipeline
```
**Agents:** ios-grand-architect, ios-builder, ios-standards-enforcer, ios-ui-reviewer, ios-verification
**MCP:** XcodeBuildMCP

### `/nextjs` - Next.js Lane
```bash
/nextjs "fix spacing"               # Default: light + gates
/nextjs --tweak "try padding"        # Tweak: no gates
/nextjs --complex "dark mode"       # Complex: full pipeline
```
**Agents:** nextjs-grand-architect, nextjs-builder, nextjs-standards-enforcer

> **Note (2026-04-22):** `/nextjs` pipeline is non-functional pending follow-up reshape. Design/CSS/animation/3D/layout specialists and `nextjs-design-reviewer` were archived with the design-system fork. Design work routes through `/impeccable` skills.

### `/django-react` - Django + React TypeScript Lane
```bash
/django-react "add user profile API"       # Default: light + gates
/django-react --tweak "try new endpoint"    # Tweak: no gates
/django-react --complex "auth system"      # Complex: full pipeline
```
**Agents:** django-react-grand-architect, django-react-builder, django-react-standards-enforcer, django-react-verification

### `/expo` - Expo/React Native Lane
```bash
/expo "fix button styling"
/expo --tweak "try different colors"
/expo --complex "offline sync"
```
**Agents:** expo-grand-orchestrator, expo-builder-agent, expo-verification-agent

### `/seo` - SEO Content Lane
```bash
/seo "keyword research for peptides"

# Cognition-powered content strategy phase
/seo --think "target keyword"
```
**Agents:** seo-research-specialist, seo-brief-strategist, seo-draft-writer, seo-quality-guardian
**MCP:** ahrefs, crawl4ai, cognition-mcp (--think)

> **Optimization removed (2026-05-17).** `/seo` is a content-pipeline command only.
> The `--optimize`, `--with-optimize`, `--audit`, and `--audit-full` flags and the
> `seo-optimizer` agent are deprecated. Technical-SEO and GEO/AIO optimization live
> in the **`/seo-optimize`** (technical SEO) and **`/aio`** (GEO) lanes -- see the
> SEO/GEO optimization capability spec at
> `.orca/requirements/2026-05-17-1903-seo-geo-optimization-capability/`.

### `/seo-optimize` - Technical-SEO Optimization Lane
```bash
/seo-optimize https://example.com/page
/seo-optimize https://example.com/sitemap.xml
```
**Agents:** seo-technical-advisor
**MCP:** analytics-mcp, mcp-gsc

> Advisory lane. Runs the deterministic detector CLI (`mcp/seo-geo-detector/`),
> filters to `technical-seo` findings, and produces a prioritized, evidence-backed
> report -- every recommendation traces to a detector `check_id`. Replaces the
> deprecated `seo-optimizer`.

### `/aio` - Generative-Engine Optimization Lane
```bash
/aio https://example.com/page
/aio https://example.com/page --rewrite
```
**Agents:** geo-diagnose-recommend, geo-rewrite, measurement-analyst
**MCP:** none (detector + measurement tool are local CLIs)

> Advisory lane, the deeper of the two. Runs the detector's GEO checks, scores the
> target against the optimization doctrine, contextualizes with citation-rate data
> from the measurement store, and produces prioritized GEO recommendations. With
> `--rewrite`, delegates a doctrine-aligned content rewrite.

#### Composable `/aio` sub-commands

`/aio` runs the full chain (diagnose -> recommend -> optional rewrite -> measure).
The three agents it orchestrates are also exposed as standalone commands, so a
user can diagnose before committing to a rewrite. These are additive -- `/aio`
remains the umbrella command.

##### `/geo-diagnose` - GEO Diagnosis (composable)
```bash
/geo-diagnose https://example.com/page
/geo-diagnose https://example.com/sitemap.xml
```
**Agents:** geo-diagnose-recommend

> Runs the detector's GEO checks, scores the target against the optimization
> doctrine, contextualizes with citation-rate data, and emits a prioritized
> diagnosis + recommendations report -- then stops. No rewrite. Review the
> diagnosis before committing to `/geo-rewrite`.

##### `/geo-rewrite` - Doctrine-Aligned GEO Rewrite (composable)
```bash
/geo-rewrite https://example.com/page
/geo-rewrite https://example.com/page --from .orca/research/geo-diagnose/<report>.md
```
**Agents:** geo-rewrite (geo-diagnose-recommend when run without `--from`)

> Rewrites a page's content so generative engines read and cite it better.
> Consumes a prior `/geo-diagnose` report via `--from`, or runs a diagnosis
> first. The single deliberate feedback edge to content generation -- it does
> not absorb the `/seo` content pipeline.

##### `/geo-measure` - GEO Measurement Context (composable)
```bash
/geo-measure
```
**Agents:** measurement-analyst

> Reads the AI-answer capture store and reports citation rate, the cited-domain
> landscape, and competitive contrast pairs. Degrades gracefully to "no capture
> data yet" when the store is empty.

### `/research` - Deep Research Lane
```bash
/research "How do mTOR inhibitors work?"
/research --deep "Complete mechanism analysis"
```
**Agents:** research-web-search-subagent, research-site-crawler-subagent, research-answer-writer, research-fact-checker
**MCP:** crawl4ai

### `/typography` - Typography/Font Management Lane
```bash
/typography "Reduce terminal curl on DomaineSansCustom"      # Default: with checkpoints
/typography --tweak "Make the period rounder in Calibre"     # Tweak: direct to specialist
/typography --complex "Create Light and Bold via stroke offsetting"
/typography "Export DomaineSansCustom to TTF for Epson"
/typography "Recommend fonts for technical documentation"

# Typography Explorer (interactive testing tool)
/typography --explorer                       # Auto-detect format and context
/typography --explorer --nextjs              # Generate as Next.js React components
/typography --explorer --html                # Generate as standalone HTML
/typography --explorer --context store       # E-commerce product UI context
/typography --explorer --context markdown    # Article/documentation context
```
**Agents:** typography-orchestrator, glyph-editor, ttf-exporter, typography-advisor, typography-explorer-generator, path-guardian
**Workflows:** glyph editing (fontTools), TTF export (Epson LabelWorks), font selection/pairing, explorer generation

| `/illustrate` | (MCP+skill driven -- adobe-photoshop, adobe-illustrator) |

### `/rvry-dev` - RVRY Product Pipeline
```bash
/rvry-dev "implement hedge-word frequency heuristic"    # Default: light + gates
/rvry-dev --tweak "adjust escape threshold"              # Tweak: no gates
/rvry-dev --complex "state machine redesign"            # Complex: full pipeline
```
**Agents:** rvry-grand-architect, rvry-engine-architect, rvry-engine-builder, rvry-web-builder, rvry-protocol-gate, rvry-verification
**Domain Gates:** delta (divergence scoring), escape-detection (FP <30%), streaming, trace


### `/orca-os-dev` - OS Development Lane
```bash
/orca-os-dev "add new specialist agent"
/orca-os-dev "update ios pipeline"
```
**Agents:** os-dev-architect, os-dev-builder, os-dev-standards-enforcer, os-dev-verification

### `/orca` - Universal Router
```bash
/orca "task description"
/orca --audit                     # Audit last 5 tasks
/orca --audit "last 10 tasks"     # Audit with scope
/orca --audit "iOS work"          # Audit specific domain
```
Detects domain and routes to appropriate lane command.
**Special Mode:** `--audit` runs Response-Aware behavior analysis instead of pipeline execution.

### `/orca-pipeline` - Pipeline Creation Wizard
```bash
/orca-pipeline analytics "Data analytics pipeline"    # Full 5-phase wizard
/orca-pipeline --quick data-analysis                   # Template Gallery mode
```
Meta-pipeline for creating new domain pipelines. 5 phases: Interview → Research → Blueprint → Generate → Validate.
**Agents:** orca-pipeline-orchestrator, orca-pipeline-researcher, orca-pipeline-architect, orca-pipeline-generator, orca-pipeline-validator
**Quick Mode Templates:** hybrid (8 agents), research-heavy (7), build-heavy (5), minimal (4)

---

## Planning Commands (1)

### `/requirements` - Unified Requirements + RA Blueprint
```bash
/requirements "Add dark mode support"
/requirements --visual "UI redesign"
/requirements --systems "Database migration"
/requirements --debug "Fix checkout bug"
/requirements --problem-solve "Complex architectural decision"   # Full 8-step pipeline
/requirements --complex --problem-solve "Migrate to GraphQL"      # Max rigor
```
**Cognition Flags:** `--visual`, `--systems`, `--debug`, `--model`, `--creative`, `--causal`, `--decide`, `--problem-solve`
**Tier Flags:** `--tweak` (quick), (none) (standard), `--complex` (deep)
Creates: `.orca/requirements/<id>/06-requirements-spec.md`

---

<!-- PUBLIC-ONLY: the line below survives stripping and replaces the one above -->
## Reasoning Commands (1)


### `/meta` - Sustained Metacognitive Substrate Observation
```bash
/meta                                      # Observe current conversation context
/meta "What is my training doing here?"    # Focused substrate observation
/meta --predict "hedge patterns"           # With verifiable prediction
/meta --on <sessionId> "revisit"           # Reflect on prior session
/meta --auto "training artifacts"          # No questions, states assumptions
```
3 constraint-chained rounds: Priority Displacement, Constrained Observation, Synthesis. Each round uses cognition-mcp `meta` operation with the same sessionId. Sustained observation outlasts trained responses via content thinning.
**Flags:** `--predict` (verifiable prediction in Round 3, persisted to Workshop), `--on <sessionId>` (composability -- loads prior session harvest), `--auto` (no questions)
**Topic:** Optional -- no args observes current conversation context
**MCP:** cognition-mcp
**Persistence:** Creates `.orca/cognition/YYYYMMDD-HHMM-meta-<slug>.md` + Workshop entry





---

## Audit Commands (1)

### `/audit` - Due Diligence Multi-Agent Auditing
```bash
/audit                           # Quick health check (~5 min, 3 agents)
/audit --comprehensive           # Full due diligence (~45-60 min, 8 agents)
/audit --core                    # Core dimensions (~15 min, 5 agents)
/audit --item design-system      # Focused audit on specific area
/audit --item page /checkout
/audit --documentation           # Deep doc verification (~15-20 min, sampled)
/audit --documentation --comprehensive  # Exhaustive doc verification (every file)
/audit --since abc1234           # Incremental since commit
/audit --verbose                 # Full findings (default: TL;DR)
```
**Architecture:** Multi-agent parallel execution (standard modes); sequential two-agent pipeline (documentation mode)
**Agents:** audit-structure-specialist, audit-dependency-specialist, audit-security-specialist (Phase 1); audit-doc-inventory, audit-doc-verifier (documentation mode)
**Dimensions:** Structure (0.10), Dependencies (0.15), Security (0.20), Patterns (0.10), Documentation (0.10), Tests (0.15), Architecture (0.15), Design (0.05)
**Output:** `.orca/audit/YYYY-MM-DD-<scope>.md` + `audit-index.json`
**Scoring:** Weighted average of dimension scores (0-100), grade A-F, risk level
**Finding Format:** AUD-YYYY-NNN with type, severity, location, recommendation, effort
**Integration:** `/orca fix AUD-YYYY-NNN` to route fixes to appropriate lane
**MCP:** cognition-mcp (audit operation)

---

## Design Commands (9)

Design-fork commands. **All nine load the `impeccable-hub` skill** as their register baseline (the felt-state spine + voice anchors + rants + preferences + detector contract — it POINTS to `design-contract/` refs, no inlined copies), read `{project}/.claude/PRODUCT.md` (strategic) and `{project}/.claude/DESIGN.md` (visual contract — Stitch spec), and rant-capture at handback. Optional parallel hygiene check via `bash {project}/scripts/audit-design.sh` informs but does not gate — the user's eye is the taste ceiling, not the script.

> **Hub vs. command naming.** The **skill** is `impeccable-hub`; the **slash command** is `/impeccable`. Every design command loads the `impeccable-hub` skill; only `/impeccable` is the command of that family-name. Do not conflate them.

> **2026-06-03 design-system totality rethink (Phase 2 — all 8 design commands converted).** The eight design commands were converted to load the `impeccable-hub` skill (was `interfaces-that-feel`) and read `PRODUCT.md`/`DESIGN.md` (was the deprecated `aesthetic.md`). **Build-producing commands route through the one shared design lane** (`docs/reference/design-lane.md`): the command (main-thread orchestrator) binds typed FORBIDDEN/FORWARD constraints via a cognition `checkpoint`, spawns a **separate** `design-builder`, then a **separate fresh-context** `design-validator` (returns `GATE_VERDICT: PASS\|BLOCK` via the LOCAL detector `node mcp/design-detector/bin/designcheck.js` — NOT `npx`), and branches (N=2 → escalate). The model never grades its own output; the old self-graded `ui-quality-audit` handback gate is replaced by the separate validator. **Build-producers (route the lane):** `/refine`, `/simplify`, `/fortify`, `/recraft` (Routes A/B only), `/motion-design`. **Diagnostic / contract commands (do NOT route the lane):** `/document` (generates DESIGN.md), `/design-audit` + `/design-critique` (produce reports), `/recraft` Route C (contract edit, no UI artifact). `/impeccable` is THIN — it loads the hub and routes flags; its build flag (`--craft`) and freeform improve-existing path run the lane. **Status:** built, **pending post-reload live proof** (a new agent is not spawnable until a session reload). Honest ceiling: hard-on-named-slop, advisory-on-taste — the user's eye is the taste ceiling. **Spec:** `.orca/requirements/2026-06-03-2251-design-system-totality-rethink/`.

**Naming rule:** commands never shadow existing skills. `/animate`, `/harden`, and `/audit` remain skill-only — command access is via `/motion-design`, `/fortify --harden`, `/design-audit`.

### `/impeccable` - THIN design orchestrator (flag-free default)
```bash
/impeccable clean up the UI on the pricing page    # default mode — no flag needed
/impeccable --craft "a settings panel"             # shape → comp pick → lane
/impeccable --teach                                # write PRODUCT.md
/impeccable --document                             # write DESIGN.md (alias of /document)
```
THIN orchestrator. **Default mode is FLAG-FREE** — `/impeccable <freeform request>` classifies the request (improve-existing / build-new / setup) and runs it; it does NOT dump the flag list and stop. Loads the `impeccable-hub` skill (the register) and routes flags. The improve-existing freeform path and `--craft` run the **shared design lane** (bind → `design-builder` → `design-validator` → branch, N=2 → escalate). `--teach`/`--document`/`--extract` are setup/diagnostic flags (no lane). Carries **zero** inlined rants/anchors/preferences (`#POISON_PATH` — those live in the hub + `design-contract/`). **Owner-override precedence (2026-06-23):** when the owner's live instruction contradicts a standing rule, the lane threads a typed `OVERRIDE` constraint (`{suppresses, scope, value, provenance}`) bind → validate → branch and **writes it back** to `{project}/.design-overrides.json` so the suppressed rule stops firing for its `scope` on future runs (`docs/reference/design-lane.md` §Precedence + Step 4; schema `docs/concepts/design-overrides-schema.md`). The owner outranks the register outranks the detector.

> **CSS Architecture / doctrine B (2026-05-29).** The `/impeccable` spine carries a **CSS Architecture** subsection under Frontend Aesthetics Guidelines (peer to Typography / Color & Theme / Layout & Space): design authority lives in a named role/token vocabulary; agents compose from it, taxonomy-first; cascade/`@layer` greenfield default; brownfield respects the detected CSS approach; no raw palette utilities; **no absolute Tailwind ban** (utility SPRAWL is advisory only via the `utility-sprawl` detector rule — logs, never blocks). Refusal: `rants/css-architecture.md`. Positive move: `preferences/css-architecture.md`. Seam discipline: the spine states the PRINCIPLE; enforcement mechanics live in the detector floor + lane builders. Source: `docs/concepts/llm-css-manifesto.md`.

### `/ios-impeccable` - iOS/SwiftUI design lane orchestrator (ADDITIVE overlay)
```bash
/ios-impeccable clean up the dosing card                 # default mode — classify → plan → lane
/ios-impeccable --colorize DosingCardView.swift          # single-verb lane on a .swift target
/ios-impeccable --typeset CalculatorView.swift           # Dynamic Type + brand-face workhorse
```
THIN orchestrator — the SwiftUI sibling of `/impeccable`. Loads the `ios-impeccable-hub` skill (the iOS register: blue-only palette law + SwiftUI rants + Swift detector contract) and routes the request through the **shared design lane** (`docs/reference/design-lane.md`, REUSED not duplicated): bind typed FORBIDDEN/FORWARD constraints via a cognition `checkpoint` → spawn the separate `ios-design-builder` → spawn the separate fresh-context `ios-design-validator` (runs `swiftdesigncheck`, NOT `designcheck.js`; returns `GATE_VERDICT: PASS\|BLOCK`) → branch (N=2 → escalate). **Runs ADDITIVELY alongside the `/ios` correctness gates — it does NOT replace `ios-standards-enforcer`, `ios-ui-reviewer`, or `ios-verification`.** Verb subset v1: layout, typeset, colorize, bolder, quieter, delight, harden, polish, distill, adapt, clarify, animate (excludes overdrive/threejs — no clean SwiftUI analogue; Metal/SceneKit out of scope). The validator fills the former `design-dna-guardian` role for iOS. Carries **zero** inlined rants/anchors/preferences (`#POISON_PATH`). **Owner-override precedence (2026-06-23):** when the owner's live instruction contradicts a standing rule (e.g. soft-red against the blue-only P0, or a custom control over native `Menu`/`Picker` chrome), the lane threads a typed `OVERRIDE` constraint (`{suppresses, scope, value, provenance}`) bind → validate → branch and **writes it back** to `{project}/.design-overrides.json` (`SWIFT_DESIGN_OVERRIDES`) so the suppressed rule stops firing for its `scope` on future runs. Severity is now per-project, and the new P0 rule `ios-default-reflex` plus `system-font-reflex` are **P0 owner-instructed** (were advisory/no-rule). The owner outranks the register outranks the detector (`docs/reference/design-lane.md` §Precedence; schema `docs/concepts/design-overrides-schema.md`). **Status:** built, **pending post-reload live proof**. **Spec:** `peptidefox-ios/.orca/requirements/2026-06-17-2153-ios-impeccable-adaptation/`.

### `/motion-design` - Heavy motion/animation orchestrator
```bash
/motion-design "fade the hero in on scroll"
```
Loads the `impeccable-hub` skill (the register / felt-state baseline) + `animation-engineering` + `motion-design-principles` (+ `lenis-integration` when scroll-related). Presents 3-tier routing (CSS default; GSAP/Three.js require user confirmation). Refuses 3D transforms, tilt, parallax-Z. For a light pass, use `/refine --animate`. **Routes the shared design lane (build-producer):** the entry bind emits motion FORBIDDENs (`bouncy-easing`/`default-ease-transition`/`layout-transition` + 3D/tilt/parallax-Z rant refusals) + FORWARD felt-state, recorded to `planning.bound_constraint_ids`; `design-builder` produces the motion under those ids; the fresh-context `design-validator` judges motion-feel (the detector is motion-blind to timing/emotion) and returns `GATE_VERDICT: PASS\|BLOCK`, looping N=2 then escalating. Skipping the bind ⇒ no bound ids ⇒ `BLOCK: no bound constraints`.

### `/refine --<flag>` - Design refinement router
```bash
/refine --bolder "the pricing page"
/refine --animate "the card hover"      # light pass — loads animate skill, not /motion-design
/refine --overdrive "the hero"
```
Flags: `--animate`, `--bolder`, `--colorize`, `--delight`, `--layout`, `--overdrive`, `--quieter`, `--typeset`. Loads the `impeccable-hub` skill as baseline, then the per-flag skill. **Build-producer** — the edited artifact is judged by the **shared design lane** (`docs/reference/design-lane.md`): detector floor + fresh-context `design-validator` → `GATE_VERDICT: PASS\|BLOCK`, looping N=2 then escalating. It does NOT self-grade. **`.swift` target detection (2026-06-18):** when the TARGET ends in `.swift`, loads `ios-impeccable-hub` and runs the Swift detector (`swiftdesigncheck`) instead of the CSS path — per the ONE shared rule `docs/concepts/ios-design-contract/target-routing.md`.

### `/simplify --<flag>` - Design simplification router
```bash
/simplify --clarify "Error 401: Unauthorized"
/simplify --distill "the checkout flow"
```
Flags: `--adapt`, `--clarify`, `--distill`. Loads the `impeccable-hub` skill as baseline, then the per-flag skill. **Build-producer** — the edited artifact is judged by the **shared design lane** (detector floor + fresh-context `design-validator` → `GATE_VERDICT: PASS\|BLOCK`, N=2 → escalate). It does NOT self-grade. **`.swift` target detection (2026-06-18):** `.swift` TARGET → `ios-impeccable-hub` + `swiftdesigncheck` (per `docs/concepts/ios-design-contract/target-routing.md`).

### `/fortify --<flag>` - Design hardening router
```bash
/fortify --harden "the signup form"
/fortify --polish "the settings page"
```
Flags: `--harden`, `--optimize`, `--polish`. Named `/fortify` to avoid shadowing the `/harden` skill. Loads the `impeccable-hub` skill as baseline, then the per-flag skill. **Build-producer** — the edited artifact is judged by the **shared design lane** (detector floor + fresh-context `design-validator` → `GATE_VERDICT: PASS\|BLOCK`, N=2 → escalate). It does NOT self-grade. **`.swift` target detection (2026-06-18):** `.swift` TARGET → `ios-impeccable-hub` + `swiftdesigncheck` (per `docs/concepts/ios-design-contract/target-routing.md`).

### `/document` - Generate Stitch-spec DESIGN.md
```bash
/impeccable --document            # scan mode (default; extracts tokens from existing code)
/impeccable --document --seed     # seed mode (no code yet; 5-question interview)
```
Generate a Stitch-spec DESIGN.md from existing code or seed mode interview. Captures the project's visual system (colors hex sRGB, typography hierarchy, components 8-prop max) so every design command stays on-brand. Required before `/impeccable --craft`. **Diagnostic / contract command — does NOT route the shared design lane** (it generates the DESIGN.md contract, it does not produce a UI artifact). Loads the `impeccable-hub` skill as baseline; reads PRODUCT.md as precondition (must exist). Writes `.claude/DESIGN.md` (Stitch spec — 6 fixed sections character-for-character) + `.claude/DESIGN.json` sidecar. **Role Taxonomy (2026-05-29, doctrine B):** scan mode extracts the project's existing role/semantic-class vocabulary into a `roles:` frontmatter block (the design constitution agents compose from); seed mode adds a 6th question that has the user design the role taxonomy FIRST (greenfield, taxonomy-first). Reachable as `/impeccable --document` (alias) or `/document` directly. Reference: https://impeccable.style/docs/document and https://stitch.withgoogle.com/docs/design-md/format/

### `/recraft` - Try-again / redo (thin coordinator)
```bash
/recraft "this still feels noisy in the cadence chips"
/recraft "the GIPR sublabel is mono, kill it" + screenshots
```
Thin coordinator for redo/recraft case. Classifies scope (single element / whole feature / contract failure) and routes to `/live` (Route A), re-shape+re-craft (Route B), or re-teach+re-document (Route C). **Does NOT regenerate from rules.** Loads the `impeccable-hub` skill + reads PRODUCT.md + DESIGN.md (both required). Captures the verbatim critique to `{project}/.orca/design-rants-pending.md` BEFORE doing anything, then asks one AskUserQuestion to classify scope, then routes. **Routes the shared design lane on Routes A/B only** (UI-producing): the entry bind folds the verbatim critique into task-specific FORBIDDENs (recorded to `planning.bound_constraint_ids`); `design-builder` rebuilds under them; the fresh-context `design-validator` returns `GATE_VERDICT: PASS\|BLOCK`, looping N=2 then escalating. **Route C (PRODUCT.md/DESIGN.md edit) produces NO UI artifact and runs NO lane** — contract edit only. The `audit-design.sh` script remains parallel hygiene only; the user's eye is the taste ceiling, the lane's validator is the distinct hard floor.

### `/design-audit` - Technical quality audit (diagnostic)
```bash
/design-audit "the pricing page"
```
Technical quality audit (a11y + performance + responsive + anti-patterns) producing a scored P0–P3 report. **Diagnostic command — does NOT route the shared design lane** (it produces a report, not a UI artifact). Loads the `impeccable-hub` skill + the `ui-quality-audit` skill. Runs the deterministic detector as a DIAGNOSTIC input (a report signal, NOT a shipping gate). Named `/design-audit` to avoid shadowing the ORCA `/audit` due-diligence command (the skill was renamed `audit` → `ui-quality-audit`). **`.swift` target detection (2026-06-18):** `.swift` TARGET → loads `ios-impeccable-hub`, swaps the CSS rant bullets for the iOS-rant equivalents, and runs `swiftdesigncheck` (per `docs/concepts/ios-design-contract/target-routing.md`).

### `/design-critique` - UX critique (diagnostic)
```bash
/design-critique "the dashboard"
```
UX critique with visual hierarchy, persona red-flags, cognitive load, and anti-pattern scoring (3 assessments: LLM review + deterministic detector + persona red-flags from the hub's `interfaces-that-feel` spine). **Diagnostic command — does NOT route the shared design lane** (produces a report). Loads the `impeccable-hub` skill + the `critique` skill. Named `/design-critique` to avoid shadowing the `/critique` skill. **`.swift` target detection (2026-06-18):** `.swift` TARGET → loads `ios-impeccable-hub` and runs `swiftdesigncheck` in Assessment B (per `docs/concepts/ios-design-contract/target-routing.md`).

**Spec:** `.orca/requirements/2026-06-03-2251-design-system-totality-rethink/` (current — design lane). Prior: `.orca/requirements/2026-04-22-2334-design-commands-architecture/`.

> **Lane vs. diagnostic split (2026-06-03).** Build-producing design commands (`/refine`, `/simplify`, `/fortify`, `/recraft` Routes A/B, `/motion-design`, and `/impeccable`'s build paths) route the **shared design lane** (`docs/reference/design-lane.md`): entry bind → separate `design-builder` → separate fresh-context `design-validator` → branch (N=2 → escalate); the model never grades its own output. Diagnostic/contract commands (`/document`, `/design-audit`, `/design-critique`, `/recraft` Route C) do NOT route the lane — they generate a contract or a report, with the detector run as a diagnostic input, not a gate. The lane replaced the prior two-layer self-graded `ui-quality-audit`/`critique` handback gates (spec `2026-05-29-0141`) with the separate validator.

> **`.swift` target detection on the 5 design-fork commands (2026-06-18).** `/refine`, `/fortify`, `/simplify`, `/design-audit`, `/design-critique` are now **target-aware**. When the TARGET ends in `.swift`, they load `Skill("ios-impeccable-hub")` (SwiftUI rants + preferences + iOS detector contract) and run the Swift detector `mcp/swift-design-detector/bin/swiftdesigncheck detect --json <target>` (`EXIT=2` = findings); otherwise they keep the existing CSS path unchanged (`impeccable-hub` + `llm-css-manifesto` + `designcheck.js`). The branch is authored ONCE in the shared rule `docs/concepts/ios-design-contract/target-routing.md` and referenced by a single inline rule line per command (no 5× copy-paste, `#POISON_PATH`). The platform-neutral cognition loop / design-lane spine is unchanged; only the doctrine-read + detector leaves are target-routed (`docs/reference/cognition-constraint-loop.md`, `design-lane.md` generalized accordingly). **Spec:** `.orca/requirements/2026-06-17-2153-ios-impeccable-adaptation/`.

---

<!-- PUBLIC-ONLY: the line below survives stripping and replaces the one above -->
## Utility Commands (15)

### `/enhance` - Prompt Enhancement
```bash
/enhance "make the UI better"
/enhance --clarify "fix the bug"
```


### `/illustrate` - Measured Adobe Execution
```bash
/illustrate "Create a poster with title, subtitle, and body text"
/illustrate "Add a logo in the top-right corner with the company name below it"
/illustrate "Layout a business card: name, title, email, phone, logo"
```
Measured execution in Photoshop/Illustrator with mandatory self-review. Phases: SURVEY (read canvas, existing layers) -> PLAN (spatial budget, proportional positions) -> EXECUTE (create with verify-after-place loop) -> REVIEW (visual self-review via get_document_image) -> CORRECT (fix issues).
**MCP:** adobe-photoshop, adobe-illustrator
**Skill:** adobe-execution (always-on guardrails)
**Integration:** Works standalone; produces layout and text operations for Adobe apps.

> **Note (2026-04-22 design-system fork):** `/design`, `/design-dna`, and `/design-review` were archived. Design work now routes through the design command family (`/impeccable`, `/recraft`, `/motion-design`, `/refine`, `/simplify`, `/fortify`, `/document`, `/design-audit`, `/design-critique`) — every one loads the `impeccable-hub` skill and reads PRODUCT.md/DESIGN.md (the `aesthetic.md` single-file was deprecated 2026-05-02). See the Design Commands (9) section above and `ORCA-skills.md`.

### `/clone-website` - Website Cloning
```bash
/clone-website https://example.com
```

### `/session-save` / `/session-resume`
```bash
/session-save                       # Save context
/session-resume                     # Resume context
```

### `/project-memory` - Workshop Interface
```bash
/project-memory status              # Current state
/project-memory why "auth"          # Query decisions
/project-memory recent              # Recent activity
```

### `/memory-search` - Unified Memory Search
```bash
/memory-search "auth decisions"     # Search across Workshop + code-index.db
```
Searches all memory systems for relevant context and decisions.

### `/project-code` - Code Intelligence
```bash
/project-code sync                  # Index codebase
/project-code search "auth"         # Search code
/project-code symbol "UserService"  # Find symbols
```


### `/reflect` - Self-Improvement
```bash
/reflect                            # Analyze recent work
/reflect --source recording         # Analyze from recording.db
/reflect learn "Always check types" # Add rule
/reflect status                     # View rules
```

### `/self-improve` - Workshop Memory Stats
```bash
/self-improve                       # Show Workshop memory stats
/self-improve --dry-run             # Preview only
```

### `/project-setup` - Project Conventions Wizard
```bash
/project-setup                      # Initialize CLAUDE.md (same as init)
/project-setup init                 # Full initialization flow
/project-setup update               # Update existing CLAUDE.md
/project-setup audit                # Check CLAUDE.md health
```
Guided wizard for project structure decisions. Detects project type (ios, nextjs, react, python, flutter, react-native, generic), observes existing patterns, asks 4 focused questions (2 shared + 2 type-specific), and generates CLAUDE.md with actionable rules.
**Features:** Auto-detects sacred paths per framework, handles existing CLAUDE.md (merge/replace/cancel), saves decisions to ProjectContext.

---

## Recording Commands (2)

Slash commands for session recording status.

### `/continue` - Session Resume Info
```bash
/continue                       # List recent sessions
/continue sess-19c6983c46029c7  # Specific session info
```
Shows `claude --continue` commands for resuming previous sessions.

### `/orca-status` - Recording Status
```bash
/orca-status                    # Current session status
```
Shows session ID, state, step count, and files touched.

## Recording Layer (orca-record CLI)

`orca-record` is a Bun-compiled binary that handles session event tracking. It runs automatically via Claude Code hooks. Deployed to `~/.claude/bin/orca-record`.

### Hook Commands (invoked automatically)

| Command | Hook | Purpose |
|---------|------|---------|
| `orca-record prompt-submit` | UserPromptSubmit (async) | Snapshot git status, start/continue session |
| `orca-record stop` | Stop | Diff files, create checkpoint, record event |
| `orca-record pre-task` | PreToolUse[Task] | Capture pre-task file state for subagent tracking |
| `orca-record post-task` | PostToolUse[Task] | Diff against pre-task state, create task checkpoint |
| `orca-record post-todo` | PostToolUse[TodoWrite] | Incremental checkpoint within subagent context |

### User Commands

| Command | Purpose |
|---------|---------|
| `orca-record status` | Show current session recording state |
| `orca-record version` | Show CLI version |

### Storage

- **Database:** `.orca/recording.db` (per-project SQLite, gitignored)
- **Session state:** `.git/orca-sessions/<session-id>.json`

---

## Skills (Always-On Knowledge)

Skills are passive knowledge that shape Claude's responses when relevant context is detected. They do not require commands to activate.

### `adobe-execution`
Measure-place-verify guardrails for Adobe Photoshop and Illustrator MCP work. Prevents blind placement, text fragmentation, coordinate confusion. Forces visual self-review.
**Activates when:** Adobe Photoshop or Illustrator MCP tools are called
**Location:** `~/.claude/skills/adobe-execution/SKILL.md`

---

## Command Architecture

### Role Boundaries
- Orchestrators NEVER write code
- Only coordinate agents via Task tool
- Read phase_state.json for resumption

### Recording Context Injection (OS 7.0)

All lane orchestrator commands inject prior session context from `.orca/recording.db`
before delegating to agents:

- `/orca` queries centrally via `recording_query` + `recording_explain`, passes
  `RECORDING_CONTEXT` to domain grand-architects in delegation prompts
- Domain commands (`/nextjs`, `/ios`, `/expo`, `/django-react`,
  `/orca-os-dev`, `/seo`) check for inherited context first; if invoked directly
  (not via `/orca`), they query `.orca/recording.db` independently
- All recording context is OPTIONAL -- silently skipped if `.orca/recording.db`
  does not exist

### Quality Gates
- Standards: >=90 to pass
- Design QA: >=90 to pass
- Build/Test: PASS/FAIL

### State Preservation
All orchestrators maintain state in `.orca/orchestration/phase_state.json`

---

## Command Locations

### Source (ORCA-OS Repo)
```
$ORCA_OS_PATH/commands/
```

### Deployed (Global)
```
~/.claude/commands/
```

---

## Command-Agent Dependencies

| Command | Primary Agents |
|---------|----------------|
| `/ios` | ios-grand-architect, ios-builder, ios-verification |
| `/ios-impeccable` | ios-design-architect, ios-design-builder, ios-design-validator (additive design overlay; composes with `/ios`) |
| `/nextjs` | nextjs-grand-architect, nextjs-builder, nextjs-verification-agent |
| `/django-react` | django-react-grand-architect, django-react-builder, django-react-verification |
| `/expo` | expo-grand-orchestrator, expo-builder-agent, expo-verification-agent |
| `/research` | research-web-search-subagent, research-site-crawler-subagent, research-answer-writer |
| `/seo` | seo-research-specialist, seo-brief-strategist, seo-draft-writer, seo-quality-guardian |
| `/seo-optimize` | seo-technical-advisor |
| `/aio` | geo-diagnose-recommend, geo-rewrite, measurement-analyst |
| `/geo-diagnose` | geo-diagnose-recommend |
| `/geo-rewrite` | geo-rewrite, geo-diagnose-recommend |
| `/geo-measure` | measurement-analyst |
| `/orca-os-dev` | os-dev-architect, os-dev-builder, os-dev-standards-enforcer, os-dev-verification |
| `/rvry-dev` | rvry-grand-architect, rvry-engine-architect, rvry-engine-builder, rvry-web-builder, rvry-protocol-gate, rvry-verification |
| `/orca-pipeline` | orca-pipeline-orchestrator, orca-pipeline-researcher, orca-pipeline-generator |
| `/typography` | typography-orchestrator, glyph-editor, ttf-exporter, typography-advisor, typography-explorer-generator, path-guardian |
| `/illustrate` | (MCP+skill driven -- adobe-photoshop, adobe-illustrator) |

---

_Source of truth: `docs/reference/os-dependency-graph.yaml`_
_Last sync: 2026-03-16_
