---
name: document
description: "Generate a Stitch-spec DESIGN.md from existing code or seed mode interview. Captures the project's visual system so every design command stays on-brand."
argument-hint: "[--seed]"
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - Bash
  - Skill
  - AskUserQuestion
license: Apache 2.0. Based on Anthropic's frontend-design skill + Paul Bakaus's Impeccable. See NOTICE.md for attribution.
---

# /document — Generate DESIGN.md (Stitch-spec)

Captures the project's **visual system** as a Stitch-format DESIGN.md so every other design command (`/impeccable --craft`, `/refine`, `/simplify`, `/fortify`, `/motion-design`, `/recraft`) reads the same visual contract.

DESIGN.md is the visual layer (colors, typography, components, do's-and-don'ts). PRODUCT.md is the strategic layer (register, users, anti-references, principles). Run `/impeccable --teach` first to populate PRODUCT.md; this command requires it as a precondition.

Reference: https://impeccable.style/docs/document and https://stitch.withgoogle.com/docs/design-md/format/

## Entry: mandatory skill loading

Before any work, in this order:

1. Invoke `Skill("impeccable-hub")` — the aesthetic (felt-state spine + banned rules + preferences + voice-anchors + detector floor). Required for every invocation.
2. Read `{current-project}/.claude/PRODUCT.md`. **If missing, stop and route to `/impeccable --teach` first.** PRODUCT.md is required input — anti-references and design principles named there are cited in DESIGN.md's Do's-and-Don'ts.

Do not attempt to infer strategic context from the codebase. The user is the only source.

## Parse flag

| Flag | Mode |
|------|------|
| (none) | **Scan mode** — code already exists; extract tokens from CSS / Tailwind config / design token files; interview only on qualitative language. |
| `--seed` | **Seed mode** — no code yet; five-question interview produces a scaffold DESIGN.md with `<!-- SEED -->` placeholders. Re-run scan once code exists. |

If `--seed` is provided AND `{project}/app|src` already contains styled code, ask one clarifying question before defaulting (the user might genuinely want a re-scaffold).

---

## Scan mode (default)

### Step 0 — Announce what's loaded

Print to user:

> PRODUCT.md is loaded. I'll extract visual tokens from the codebase, then ask short qualitative questions to fill the prose sections. The output is a Stitch-spec DESIGN.md (YAML frontmatter + 6 fixed markdown sections in the exact required order).

### Step 1 — Token extraction

Find and parse:

- CSS custom properties (`:root { --color-* }`, `--font-*`, `--space-*`, `--radius-*`, theme blocks)
- Tailwind config (`tailwind.config.{js,ts}` `theme.extend`)
- Design token files (`tokens.json`, `tokens.css`, `design-tokens.json`, `tokens.ts`)
- Imported font names (Google Fonts links, `@font-face`, `next/font` calls)

Build a candidate token map:

```yaml
colors:        # hex sRGB only — NOT OKLCH (Stitch spec)
  primary:     "#..."
  secondary:   "#..."
  surface:     "#..."
  ink:         "#..."
typography:
  display:     {family: "...", weight: ..., size: "..."}
  headline:    {family: "...", weight: ..., size: "..."}
  title:       {family: "...", weight: ..., size: "..."}
  body:        {family: "...", weight: ..., size: "..."}
  label:       {family: "...", weight: ..., size: "..."}
rounded:       {sm: "...", md: "...", lg: "..."}
spacing:       {xs: "...", sm: "...", md: "...", lg: "...", xl: "..."}
```

**Hard rule — no fabricated tokens.** Only document tokens the code actually uses. If the codebase has no display family, leave it blank and flag it in the qualitative interview.

**OKLCH conversion.** If the codebase stores colors in OKLCH (PeptideFox, RVRY), convert to hex sRGB for the frontmatter. Stitch parsers expect sRGB. The OKLCH source can stay in the codebase; DESIGN.md mirrors it in sRGB.

### Step 2 — Component inventory

Find component definitions (`components/`, `app/components/`, `src/components/`). For each top-level component (Button, Card, Input, Badge, etc.), extract its visible props limited to **the 8 Stitch-spec props ONLY**:

```yaml
components:
  button:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm} {spacing.md}"
    size: "..."
    height: "..."
    width: "..."
```

Use `{path.to.token}` reference syntax — never inline values in the component block. If a component uses something not in the token map, add the token first.

### Step 2.5 — Role taxonomy extraction (doctrine B, taxonomy-first)

Extract the project's existing **role/semantic-class vocabulary** — the named roles agents should compose from instead of inventing design decisions inline. This is the design constitution (`banned/css-architecture.md` + `preferences/css-architecture.md`).

Scan for the centralized layer in whatever CSS approach the project uses (detect-and-follow — do NOT impose semantic CSS on a Tailwind project):

- **Semantic CSS / CSS Modules:** `@layer components` blocks, semantic role classes (`.ds-*`, `.card`, `.metric-label`, module class names), and the tokens they consume.
- **Tailwind:** `@apply`-into-named-component definitions, `@layer components` classes, and theme-mapped utility groupings — the centralized layer, NOT the inline utility strings.
- **styled-components:** named styled roles (`const MetricLabel = styled...`) and the tokens they reference.

For each role, capture what it **IS** (its system role, not its appearance) and the tokens it binds to. Populate the `roles:` frontmatter block:

```yaml
roles:
  metric-label:
    role: "small label for a numeric stat"
    typography: "{typography.label}"
    color:      "{colors.neutral-2}"
```

**If the codebase has scattered utility sprawl and no centralized role layer**, do NOT fabricate roles. Flag it in the qualitative interview ("no centralized role vocabulary found — design decisions are scattered inline; consider extracting repeated clusters to named roles") and leave `roles:` minimal. Detection of sprawl is advisory (`utility-sprawl` detector rule) — report, don't block.

### Step 3 — Qualitative interview (5 questions)

Tokens describe what; the prose sections describe **why**. Ask exactly five:

1. **Creative North Star metaphor.** "If this product were a physical object, what would it be?" (e.g., "a museum exhibit caption", "a 1970s mainframe manual", "a hand-painted shop sign"). One sentence. This anchors Overview.
2. **Color names.** For each non-functional palette role, give a **descriptive name** (sand, brass, obsidian, eggshell — NOT "primary-500" or "accent-2"). Reference the global color catalog substitutes (`banned/colors.md`) if helpful.
3. **Elevation philosophy.** "Where does depth come from in this product?" (shadow / border / background contrast / layered surfaces / no elevation / specific physical metaphor). One sentence.
4. **Component character.** "How should components feel? (sharp / soft / utilitarian / playful / precise / generous)." Three to five adjectives max.
5. **Voice for Do's-and-Don'ts.** Confirm: design-director voice ("Prohibited", "forbidden", "never", "always"). NOT "consider" / "prefer" / "may". This is non-negotiable in Stitch spec; the question exists to make the user aware before they read the file.

### Step 4 — Cross-reference PRODUCT.md anti-references

Read PRODUCT.md's Anti-references section. Each named brand/product becomes a Do's-and-Don'ts entry citing it by name:

> **Forbidden:** Linear-style task UI density. The product is editorial, not engineering tooling.

NOT:

> **Avoid:** dense layouts. (Generic, unbound, Stitch-inadmissible voice.)

### Step 5 — Write DESIGN.md

Path: `{current-project}/.claude/DESIGN.md`. If the file exists, **do not silently overwrite** — ask the user whether to overwrite, merge, or back up.

Schema (character-for-character — Stitch parsers depend on these names):

```markdown
---
name: <project name>
description: <one-line product description from PRODUCT.md>
colors:
  <color tokens, hex sRGB>
typography:
  display:  {family, weight, size, line-height, letter-spacing}
  headline: {...}
  title:    {...}
  body:     {...}
  label:    {...}
rounded:
  <radius tokens>
spacing:
  <spacing tokens>
components:
  <component definitions, 8 props max each, token references only>
roles:
  <role taxonomy — named semantic roles agents compose from; each role binds to tokens; from Step 2.5 (scan) or Q6 (seed)>
---

# <project name>

## Overview

<Creative North Star metaphor + 1-2 paragraphs on what this design system is and what it isn't. Reference PRODUCT.md register here without restating it.>

## Colors

<descriptive name → token mapping with rationale per role. e.g., "Sand surface — warm off-white at oklch(0.98 0.005 85), used as the base for all reading surfaces.">

## Typography

<which family for which role + why, hierarchy commitments, mono discipline if relevant. Reference Adil's mono catalog (`banned/typography-mono.md`) for projects that use mono.>

## Elevation

<from interview Step 3>

## Components

<short prose per component family explaining its character + when to use which variant>

## Do's-and-Don'ts

<every entry in design-director voice — "Prohibited", "forbidden", "never", "always". Cite PRODUCT.md anti-references by name. Cite global banned-rule files where relevant (`banned/typography-mono.md`, `banned/colors.md`, etc.).>
```

### Step 6 — Write DESIGN.json sidecar

Path: `{current-project}/.claude/DESIGN.json`. Mirror the YAML frontmatter as JSON for tools that prefer JSON parsing (Stitch CLI, downstream linters). Skip in seed mode.

### Step 7 — Summarize and hand back

Print a 6-line summary:

- Frontmatter token counts (colors, typography roles, components)
- Section word counts (Overview, Colors, Typography, Elevation, Components, Do's-and-Don'ts)
- PRODUCT.md anti-references cited in Do's-and-Don'ts (count + names)
- DESIGN.json sidecar written (Y/N)
- Existing DESIGN.md was overwritten / merged / backed up
- Next: run `/impeccable --craft "<feature>"` to build against this contract

Aesthetic capture is owner-gated — see ~/.claude/docs/reference/design-lane.md (Aesthetic capture). No closing capture question.

---

## Seed mode (`--seed`)

Used when the project has no code yet — design-driven greenfield. Five quick questions:

1. **Color strategy.** Two-color minimal / warm-neutral + accent / dark-with-jewel-tones / monochrome / specific reference (paint chip, print sample, photograph)?
2. **Typography direction.** Editorial serif + clean sans / technical mono pair / display + body / single-family system / reference foundry (Klim, Pangram Pangram, ABC Dinamo)?
3. **Motion energy.** Quiet (120-180ms, snappy) / considered (300-450ms, soft) / cinematic (600ms+, exponential) / refused-by-default?
4. **Three named references.** Three real products / sites / objects this should feel like. NOT adjectives.
5. **One anti-reference.** One specific named thing this should NOT feel like.
6. **Role taxonomy (doctrine B, taxonomy-first).** Greenfield is where the design constitution gets designed FIRST — before any component. Ask the user (or, if delegated, propose then confirm) to name the 5-10 core semantic **roles** the UI is built from. A role names what something IS in the system (`metric-label`, `stat-value`, `nav-item`, `section-heading`, `card`), NOT how it looks (`blue-box`) or where it sits (`top-left-thing`). For each role, note the token it should bind to (which typography/color role from Q1-Q2). This populates the `roles:` frontmatter block — the design constitution agents will compose from. See `preferences/css-architecture.md` for the procedure. If the user has no opinion yet, scaffold a minimal `roles:` block with `<!-- SEED -->` markers and the taxonomy-first reminder.

Write a scaffold DESIGN.md with all 6 sections present and `<!-- SEED -->` markers in slots that need code-derived tokens later. Include the `roles:` frontmatter block from Q6 (or a seed-marked stub). The taxonomy is designed before components — that is the point of seeding it greenfield. Frontmatter contains placeholder token names with `TBD` values:

```yaml
colors:
  primary: "#TBD <!-- SEED: pick from interview Q1 -->"
```

Skip DESIGN.json (no real values yet). Add a top-of-file note:

```markdown
<!-- SEED MODE — re-run /impeccable --document (no flag) once code exists to populate real tokens. -->
```

Close as in scan mode (aesthetic capture is owner-gated; no closing capture question).

---

## Hard rules (apply to both modes)

- **Section names character-for-character.** "Overview", "Colors", "Typography", "Elevation", "Components", "Do's-and-Don'ts". No "Layout", "Motion", "Responsive" as top-level sections — fold into Overview or Components. Stitch parsers depend on this.
- **Voice in Do's-and-Don'ts is design-director.** "Prohibited", "forbidden", "never", "always". NOT "consider", "prefer", "may", "should".
- **Cite PRODUCT.md anti-references by name.** Generic refusals are inadmissible.
- **Tokens in frontmatter only.** Don't redefine in prose. Reference via `{path.to.token}`.
- **Don't fabricate tokens.** Only document what code uses. Flag missing ones in the interview.
- **Don't silently overwrite.** Existing DESIGN.md requires user choice.
- **Hex sRGB in frontmatter.** OKLCH source-of-truth lives in code; DESIGN.md mirrors in sRGB for Stitch compatibility.
- **8 component props max.** backgroundColor, textColor, typography, rounded, padding, size, height, width. No more.

## Refusals

This command refuses to:

- Run without PRODUCT.md present.
- Generate DESIGN.md from inferred context (no PRODUCT.md, no codebase scan, no interview).
- Use OKLCH in the frontmatter (Stitch spec is hex sRGB).
- Use vague Do's-and-Don'ts voice ("consider clean typography").
- Add top-level sections beyond the six.
- Silently overwrite an existing DESIGN.md.
- Bind taste through this artifact alone — DESIGN.md is the visual contract every design command reads, but binding happens through `/shape` (per-feature discovery), `/craft` (visual-direction comp pick), and `/live` (element-by-element variant selection). Documentation is necessary but not sufficient.

---

## Failure mode notes

The prior approach to this layer collapsed strategic context (register, users, anti-references) and visual context (colors, fonts, components) into one file. That prevents any refining command from cleanly reading just the visual layer when the strategic layer hasn't changed. The split is load-bearing:

- **PRODUCT.md** changes when register or audience changes (rare).
- **DESIGN.md** changes when visual tokens change (more often).
- Refining commands read both; strategic-only commands (`/shape`) read PRODUCT.md only; visual-only checks (Stitch parsers, `npx impeccable detect`-style hygiene) read DESIGN.md only.

Reference: https://impeccable.style/docs/document
