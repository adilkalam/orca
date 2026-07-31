# DEPRECATED 2026-05-02

This template is deprecated. It collapsed strategic decisions (register, users, anti-references, principles) and visual decisions (colors, typography, components) into one file, which prevents refining commands from cleanly reading just the visual layer.

**Use the split templates instead:**

- Strategic content (register, users, anti-references, principles, accessibility) → `product-template.md` (writes `{project}/.claude/PRODUCT.md`)
- Visual content (colors, typography, components, do's-and-don'ts) → `design-template.md` (writes `{project}/.claude/DESIGN.md`)

Existing projects with `.claude/aesthetic.md` should split via `/impeccable --teach` (regenerates PRODUCT.md) and `/impeccable --document` (regenerates DESIGN.md).

The original template content is preserved below for reference but should not be used for new projects.

---

# Aesthetic — Project Selection Contract (DEPRECATED)

**This file is the per-project selection drawn from the global design-contract catalog.** It carries this project's specific commitments. The global collection (`docs/concepts/design-contract/` in ORCA-OS, or `~/.claude/docs/concepts/design-contract/` after deployment) is the catalog; this file is the contract.

Populated by `/impeccable --teach` on first entry into a project. Lives at `{project_root}/.claude/aesthetic.md`.

The template includes hard-binding sections (Mono discipline, Alignment discipline, Redundant chip+label control) lifted from the patterns proven in peptidefox. Documentation alone does not bind trained reflexes; the audit script at `{project}/scripts/audit-design.sh` (deployed by `/impeccable --teach` from `/Users/adilkalam/ORCA-OS/templates/audit-design.sh`) is the mechanical gate. Run it before claiming a UI pass is done.

If work fails the eye or the user critiques it, the redo path is `/recraft "<critique>"`, not another `/refine` pass.

---

## 1. Project Identity

- **Project name:** [e.g., RVRY]
- **Domain:** [what the product does, in one sentence]
- **Register:** [one short phrase — "technical research UI" / "clinical-commerce" / "fashion-editorial" / etc. The register is how the design wants to *feel*, not what it does.]
- **Target audience:** [who uses this]
- **Anti-audience:** [who this is explicitly not for]

---

## 2. Typography Commitments

### Picked fonts

Chosen from the 22-font catalog at `preferences/typography-fonts.md`. Reference by name.

- **Display / headings:** [e.g., "Fraunces"]
- **Body / sans:** [e.g., "Instrument Sans"]
- **Monospace (if used):** [e.g., "IBM Plex Mono"]

If picking a font NOT in the catalog, explain why here. Adding to the global catalog requires an owner-approved aesthetic-capture entry.

### Scale overrides (optional)

The global type scale at `preferences/typography-scale.md` is non-uniform (big H1→H2 drop, H3≈body). If this project needs a different scale, override here:

- [only fill if overriding; otherwise leave blank and the global scale applies]

### Weights in use

Max 3 per page per the global preferences. List the 2-3 weights committed:

- [e.g., "400 body, 600 UI labels, 800 display"]

### Mono discipline (HARD — non-negotiable)

Mono is the most over-reached-for font on most projects. The trained reflex toward "looks technical → use mono" is so strong that documentation alone has not bound it. The rule below is therefore a HARD WHITELIST + an AUDIT SCRIPT + a BEFORE-SHIPPING CHECKLIST. Not philosophy. Not "use sparingly." A whitelist with explicit allowed/forbidden enumerated, mechanically auditable, automatic-fail-able.

Cross-references:
- Global banned rule: `~/.claude/docs/concepts/design-contract/banned/typography-mono.md`
- Positive catalog: `~/.claude/docs/concepts/design-contract/preferences/typography-mono.md`

**Mono is permitted ONLY for these six slots. No others.**

| # | Slot | Example |
|---|---|---|
| 1 | Non-Title/Display Heading Eyebrow | "REFERENCE WORKBENCH", "PRESS RELEASE" |
| 2 | Tag / chip (≤8 chars) | "A" "B" "X" / "n=33" / "wk 24" |
| 3 | Unit (split from numeric value) | the "mg" beside a 7.21 numeral |
| 4 | Chart axis chrome | SVG tick labels, axis labels |
| 5 | Terminal / code block | quoted command output, code samples |
| 6 | Footnote / source-citation eyebrow tag | the "PRIMARY" tag, NOT the citation prose |

**Mono is FORBIDDEN for these patterns. Each is automatic-fail.**

| Forbidden pattern | Substitute |
|---|---|
| Prose of any length | Body sans regular |
| Citations and source lines ("Coskun 2022 · Cell Metab 34:1234-47") | Body sans italic at small size |
| Big numerals (hero values, calculator outputs, ratio numbers) | Display family (serif or display sans) |
| Sublabels inside buttons that duplicate the visible label ("7d Weekly" / "3.5d Twice") | Single-label button in body sans |
| Sublabels next to a bold name that re-spell the same thing ("GIPR / GIP receptor" tag underneath) | Drop the sublabel entirely, OR use a tooltip |
| Long inline labels or descriptive sentences in chrome | Body sans |
| Per-row meta strings that read as prose ("free fraction 0.22% · half-life derived") | Body sans italic small |

**Tracking caps (HARD):**
- Uppercase eyebrows: max `letter-spacing: 0.08em`
- Lowercase tags: max `letter-spacing: 0.04em`
- Default to `0.02em` if unsure

**OpenType ligature trap (HARD):**

Several mono fonts (Brown Mono LL specifically) have a `hist` historical-`s` alternate that fires on `s` and renders as ſ (long-s). When the page-root rule enables `font-feature-settings: 'ss01', 'ss02', 'kern'`, those features inherit to mono spans and produce strings like "ſteady ſtate" instead of "steady state."

**Every selector that uses the project mono font must include:**
```css
font-variant-ligatures: none;
font-feature-settings: 'liga' 0, 'dlig' 0, 'hist' 0, 'calt' 0;
```

OR live inside a `.mono-register` parent that sets these once and is inherited by all child mono selectors.

**Per-stylesheet count cap:** 8 mono `font-family` declarations per file (configurable via `.audit-config.json` `monoCountCap`). Higher than that = mono fatigue, audit fail.

### Mono audit grep set (run before claiming a UI pass is done)

The grep set is implemented in `scripts/audit-design.sh`. Run it before considering any UI work complete. Quick overview of what it checks:

```bash
# 1. Mono count per stylesheet (cap 8 by default)
# 2. Mono used inside non-whitelisted class names
# 3. OpenType ligature features not disabled on mono register
# 4. Excess mono tracking (> 0.08em on uppercase, > 0.04em lowercase)
# 5. Citations / big-numerals rendered in mono (forbidden)
```

The build does not refuse the violation today, but the human-facing protocol for "is this done" is "audit passes + visual review passes."

### Redundant chip+label control pattern (HARD)

A segmented control or button with **a mono "tag chip" prefixing every option label that adds no information** is forbidden. Pattern: "7d Weekly", "3.5d Twice", "3d Every" — the "7d / 3.5d / 3d" mono prefix is duplicating the human-readable label, just in mono register, for no gain. The result is visual noise and confusion.

Rule: a segmented control button has ONE label. Choose the form:
- Just the human label: "Weekly", "Twice weekly", "Every 3 days"
- OR just the abbreviation in mono if space is tight: "7d", "3.5d", "3d"
- NEVER both at the same time.

If both pieces of information are genuinely needed (rare), put the abbreviation in a tooltip on hover, not in the visible chrome.

### Alignment discipline (HARD — non-negotiable)

The alignment register is **optical, not geometric**. Both the project and the global preference catalog carry the spec.

Cross-references:
- Local: project's `docs/design-system/` if present
- Global: `preferences/alignment-precision.md`

The rules below have a **mechanical artifact** column — the code shape that proves the rule was applied. The artifacts are grep-able. The audit script checks for them.

| # | Rule | Artifact (code that PROVES it was applied) | Failure signal (grep target) |
|---|---|---|---|
| 1 | Triangle / pointed-shape offset shifts 5–8% toward point | `transform: translateX(±5–8%)` OR `--optical-offset` custom property OR explicit non-50% positioning on chevron/caret/arrow/play classes | `transform: translateX(-50%)` on a class containing chevron/caret/arrow/play/triangle |
| 2 | Icon sits 1–2px above text baseline | Icon has `position: relative; top: -1px` OR uses an SVG with `vertical-align: -0.125em` | Icon class with no top adjustment AND `align-items: center` parent |
| 3 | Icon-to-text horizontal gap = 1.5× text-only | Parent has `gap: 0.75rem` (12px) when leading element is icon-shaped (swatch / SVG / mono tag chip / 12×N stroke) | `gap: 0.5rem` on parent whose first child is an icon-shape |
| 4 | Border-weight padding compensation | Padding decremented by 1px from nominal: 24px nominal → `padding: 1.4375rem` (23px) when paired with `border: 1px solid` | `border: 1px solid` AND `padding: 1rem`/`1.5rem`/`2rem` (un-decremented) on the same rule |
| 5 | Bullet list alignment via custom marker | `::before` pseudo with `font-size: 0.85em` and explicit `top:` matching x-height per size tier | Default `list-style: disc` OR `list-style: none` with no custom marker |
| 6 | Heavy elements get +1 grid increment of space | Adjacent gap is +1 token tier on heavy-content junction (e.g., `gap: 1.25rem` instead of `gap: 1rem`) | Same gap value across the whole component regardless of element weight |
| 7 | Rounded-corner heading inset | Heading has `padding-left: calc(container-padding + radius × 0.5)`, snapped to 2px, max +8px | Heading aligned to container's geometric edge with no inset |
| 8 | Comparison-card height matching | Either `min-height: <Npx>` with a documented calc comment OR shared `grid-template-rows` across all sibling card instances; math documented in code comment near the rule | Sibling cards with `auto`-derived heights and no shared row template |
| 9 | Prose container first/last child margin reset | `:first-child { margin-top: 0 }` AND `:last-child { margin-bottom: 0 }` on prose container | Prose container with default child margins inheriting → leading/trailing whitespace |

These rules are not exhaustive — the human visual review is the second layer. The audit greps catch the most obvious artifacts. Each rule that fires must be either fixed or have a justifying code comment naming why the visual case overrides.

### Before-shipping checklist (run for every UI pass)

Before claiming a redesign / panel / component is done, walk this list. If any item fails, the work is not done.

1. [ ] Mono count per stylesheet ≤ 8 (or per `.audit-config.json` `monoCountCap`)
2. [ ] Every mono selector lives in a whitelisted class name suffix (per `.audit-config.json` `monoWhitelist`)
3. [ ] Every mono selector explicitly disables OpenType ligatures
4. [ ] No mono tracking exceeds 0.08em (uppercase) or 0.04em (lowercase)
5. [ ] No citation, source-line, or descriptive-prose lives in mono
6. [ ] No big numeral lives in mono — all big numerals are display family
7. [ ] No segmented-control button has a redundant mono tag chip duplicating its label
8. [ ] All nine alignment rules above have been actively applied to the new components
9. [ ] No `style={{}}` inline styles in JSX (lint enforces; verify it actually passes)
10. [ ] Run project type-check, lint, AND `scripts/audit-design.sh` — all three must exit 0 / produce zero violations on new files

Posting "done" without running this checklist is shipping with violations. Don't.

---

## 3. Color Commitments

### Palette

Concrete values. Each role resolved to OKLCH (or hex if OKLCH not workable in this project's stack).

- **Surface / background:** [e.g., "oklch(0.98 0.005 85)" — warm off-white]
- **Ink / foreground:** [e.g., "oklch(0.18 0.01 250)"]
- **Primary accent:** [named substitute from banned/colors.md — brass, sand, eggshell, etc.]
- **Secondary accent (if any):**
- **Functional roles:** danger / success / warn / info — values here
- **Neutrals:** 3-5 steps of the surface family

### Palette rationale

Why these colors serve the register. Short — 2-3 sentences.

### Blue stance (if applicable)

Per `banned/colors.md`, blue is deferred to user judgment because of colorblindness. If this project uses blue, record the specific blue chosen and what was confirmed.

### Project-scoped color refusals

Beyond the global Tailwind refusal, what colors are refused specifically for THIS project's register?

- [e.g., "medical-orange — reads alarmist for this product" for a clinical project]

---

## 4. Motion Register

Global motion preferences at `preferences/motion-references.md` (directional, not perspective). Per-project overrides:

- **Tier default:** CSS / GSAP / Three.js — which tier is the default for this project's motion? (Most projects: CSS. Media-heavy editorial: GSAP. 3D/data-viz: Three.js.)
- **Duration register:** quick (120-180ms) / considered (300-450ms) / slow (600ms+) — which feel is default?
- **Easing register:** snappy / soft / exponential — which curve family is default?
- **Motion refusals:** [any motion patterns refused for this project specifically beyond the global "no perspective/tilt/device-orientation" rules]

---

## 5. Spatial Register

- **Density:** tight / balanced / generous — how much breathing room
- **Rhythm:** strict grid / relaxed grid / asymmetric — how disciplined is the spatial system
- **Base grid unit:** [e.g., 4px, 8px]
- **Section rhythm multiplier:** [e.g., 2x component gap — matches global `preferences/typography-spacing.md`]

---

## 6. Project-Scoped Banned-Rule Extensions

Things this project refuses that the global banned rules don't cover, OR things this project reverses from the global banned rules. Each entry: one-line refusal + short reason.

- [e.g., for RVRY: "Geist is allowed for engineering-admin surfaces — the global ban on Geist is register-conditional on editorial work"]
- [e.g., for peptidefox: "No serif italic ligatures — they read pharmaceutical-retro here"]

---

## 7. References

### Positive references

URLs, screenshots, named works this project's aesthetic points at. Not the global motion-references, but project-specific inspiration.

- [URL or /path/to/screenshot]

### Anti-references

What this project is explicitly NOT. Naming these is as valuable as naming the positive ones.

- [e.g., "Not Notion — we don't want neutral-productivity feel"]

---

## 8. Working notes

Free-text scratchpad for design decisions made mid-project that should be remembered but don't fit a slot above. Dated entries.

- 2026-MM-DD: [decision + why]
