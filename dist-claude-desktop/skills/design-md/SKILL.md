---
name: design-md
description: Generate a structured DESIGN.md visual-system brief (Stitch-format — colors, typography, components, do's-and-don'ts) either by extracting tokens from code the user pastes/shares, or by running a short interview for a greenfield project with no code yet. Use when the user wants to document or establish their project's visual system before design work begins.
---

# Design.md — visual system brief generator

Captures a project's **visual system** as a structured brief so design work stays consistent instead of reinventing tokens each time. This is the visual layer (colors, typography, components, do's-and-don'ts) — distinct from the strategic layer (register, audience, anti-references), which the user should have already told you or you should ask for before this.

Reference format: this mirrors the "Stitch" DESIGN.md convention — YAML frontmatter with token data, then six fixed prose sections.

## Precondition

Before running this, make sure you know the strategic register: who this is for, what it should feel like, and at least one named anti-reference (a product/brand this should NOT feel like). If you don't have that yet, ask for it first — a visual brief without strategic grounding just becomes generic token soup.

## Mode selection

- **Scan mode** (default): the user has existing code/CSS/tokens to share. Ask them to paste the relevant CSS custom properties, Tailwind config theme block, or a tokens file, plus component source if available.
- **Seed mode**: no code exists yet — greenfield. Run a short interview instead.

## Scan mode

### Step 1 — Token extraction

From what the user pastes, extract:
- CSS custom properties (`:root { --color-*, --font-*, --space-*, --radius-* }`, theme blocks)
- Tailwind config `theme.extend`
- Any `tokens.json`/`tokens.css`/`design-tokens.json`
- Font imports (Google Fonts links, `@font-face`, framework font loaders)

Build a token map (colors as hex sRGB — convert from OKLCH if that's the source format, since this format expects sRGB in the frontmatter):

```yaml
colors: {primary: "#...", secondary: "#...", surface: "#...", ink: "#..."}
typography:
  display: {family: "...", weight: ..., size: "..."}
  headline: {...}
  title: {...}
  body: {...}
  label: {...}
rounded: {sm: "...", md: "...", lg: "..."}
spacing: {xs: "...", sm: "...", md: "...", lg: "...", xl: "..."}
```

**Hard rule — no fabricated tokens.** Only document tokens the shared code actually uses. If something's missing (no display family, say), leave it blank and ask about it in the interview step below instead of inventing a value.

### Step 2 — Component inventory

For each top-level component the user shares (Button, Card, Input, Badge, etc.), extract only these 8 Stitch-spec props, using `{path.to.token}` references, never inline values:

```yaml
components:
  button: {backgroundColor: "{colors.primary}", textColor: "{colors.surface}", typography: "{typography.label}", rounded: "{rounded.md}", padding: "{spacing.sm} {spacing.md}", size: "...", height: "...", width: "..."}
```

### Step 3 — Role taxonomy (if the codebase has one)

Look for a centralized semantic-role layer (named CSS classes like `.ds-*`/`.card`/`.metric-label`, or a `@layer components` block, or Tailwind `@apply`-into-named-components). For each role found, capture what it IS (its system role, not its appearance) and which tokens it binds to:

```yaml
roles:
  metric-label: {role: "small label for a numeric stat", typography: "{typography.label}", color: "{colors.neutral-2}"}
```

If there's no centralized role layer — just scattered inline styling — don't invent one. Note it in the qualitative section instead ("no centralized role vocabulary found; design decisions are scattered inline").

### Step 4 — Qualitative interview (5 short questions)

1. **Creative North Star metaphor.** "If this product were a physical object, what would it be?" One sentence.
2. **Color names.** For each non-functional palette role, a descriptive name (sand, brass, obsidian — not "primary-500").
3. **Elevation philosophy.** Where does depth come from — shadow, border, background contrast, layered surfaces, or none?
4. **Component character.** 3-5 adjectives: sharp / soft / utilitarian / playful / precise / generous.
5. **Do's-and-Don'ts voice check.** Confirm: this section should read in a director's voice ("Prohibited", "forbidden", "never", "always") — not hedged ("consider", "prefer").

### Step 5 — Cross-reference anti-references

Every named anti-reference from the strategic register becomes a specific Do's-and-Don'ts entry citing it by name: "**Forbidden:** Linear-style task UI density. The product is editorial, not engineering tooling." Not a generic "avoid dense layouts."

## Seed mode (no code yet)

Ask instead:
1. Color strategy: two-color minimal / warm-neutral+accent / dark-with-jewel-tones / monochrome / a specific reference (paint chip, print sample, photo)?
2. Typography direction: editorial serif+clean sans / technical mono pair / display+body / single-family system / a specific foundry reference?
3. Motion energy: quiet (120-180ms) / considered (300-450ms) / cinematic (600ms+) / no motion by default?
4. Three named references (real products/sites/objects this should feel like — not adjectives).
5. One named anti-reference.
6. Role taxonomy: 5-10 core semantic roles the UI will be built from (what something IS — `metric-label`, `nav-item`, `card` — not how it looks or where it sits). If they have no opinion yet, note it as unresolved rather than inventing one.

Produce the same 6-section output with `<!-- SEED -->` markers on anything that needs real code to fill in later.

## Output

Present the result as a single markdown document:

```markdown
---
name: <project name>
description: <one-line product description>
colors: <hex sRGB tokens>
typography: {display: {...}, headline: {...}, title: {...}, body: {...}, label: {...}}
rounded: <radius tokens>
spacing: <spacing tokens>
components: <component definitions, 8 props max each, token references only>
roles: <named semantic roles from Step 3/seed Q6>
---

# <project name>

## Overview
<North Star metaphor + 1-2 paragraphs on what this design system is and isn't>

## Colors
<descriptive name → token mapping with rationale per role>

## Typography
<which family for which role and why, hierarchy commitments>

## Elevation
<from Step 4 / seed Q3>

## Components
<short prose per component family — character + when to use which variant>

## Do's-and-Don'ts
<every entry in director voice, citing named anti-references>
```

**Section names must match exactly**: Overview, Colors, Typography, Elevation, Components, Do's-and-Don'ts — no extra top-level sections (fold Layout/Motion/Responsive into Overview or Components).

## Refusals

This skill refuses to:
- Generate the brief without a strategic register (who it's for, what it should never feel like) — ask for that first if missing.
- Fabricate tokens not actually present in shared code (scan mode).
- Use hedged Do's-and-Don'ts language ("consider clean typography" is inadmissible — it must be a directive).
- Use more than the six named sections.
