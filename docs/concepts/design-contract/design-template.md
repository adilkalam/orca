# Design — Project Visual Contract (Stitch Spec)

**This file is the per-project visual contract.** It captures colors (hex sRGB), typography hierarchy, components (8 props max each), and Do's-and-Don'ts in design-director voice.

Populated by `/impeccable --document` on first entry into a project (or refresh). Lives at `{project_root}/.claude/DESIGN.md`. A JSON sidecar (`{project_root}/.claude/DESIGN.json`) mirrors the YAML frontmatter for tools that prefer JSON parsing.

The format follows the Stitch spec exactly so Stitch-compatible parsers can read DESIGN.md without modification. References:
- https://impeccable.style/docs/document
- https://stitch.withgoogle.com/docs/design-md/format/

The two-file split (PRODUCT.md strategic + DESIGN.md visual) is load-bearing. PRODUCT.md changes when register or audience changes (rare). DESIGN.md changes when visual tokens change (more often).

If work fails the eye or the user critiques it, the redo path is `/recraft "<critique>"` — a thin coordinator. DESIGN.md may need re-entry via `/impeccable --document` if the visual contract itself is the failure.

---

## Required structure (character-for-character)

```markdown
---
name: <project name>
description: <one-line product description>
colors:
  primary:    "#..."        # hex sRGB only
  secondary:  "#..."
  surface:    "#..."
  ink:        "#..."
  accent:     "#..."
  # functional roles
  danger:     "#..."
  success:    "#..."
  warn:       "#..."
  info:       "#..."
  # neutrals (3-5 steps of the surface family)
  neutral-1:  "#..."
  neutral-2:  "#..."
  neutral-3:  "#..."

typography:
  display:   {family: "...", weight: ..., size: "...", line-height: ..., letter-spacing: "..."}
  headline:  {family: "...", weight: ..., size: "...", line-height: ..., letter-spacing: "..."}
  title:     {family: "...", weight: ..., size: "...", line-height: ..., letter-spacing: "..."}
  body:      {family: "...", weight: ..., size: "...", line-height: ..., letter-spacing: "..."}
  label:     {family: "...", weight: ..., size: "...", line-height: ..., letter-spacing: "..."}

rounded:
  sm: "..."
  md: "..."
  lg: "..."

spacing:
  xs:  "..."
  sm:  "..."
  md:  "..."
  lg:  "..."
  xl:  "..."

components:
  button:
    backgroundColor: "{colors.primary}"
    textColor:       "{colors.surface}"
    typography:      "{typography.label}"
    rounded:         "{rounded.md}"
    padding:         "{spacing.sm} {spacing.md}"
    size:            "..."
    height:          "..."
    width:           "..."
  card:
    backgroundColor: "{colors.surface}"
    textColor:       "{colors.ink}"
    typography:      "{typography.body}"
    rounded:         "{rounded.lg}"
    padding:         "{spacing.md}"
    size:            "..."
    height:          "..."
    width:           "..."
  # ... at most 8 props per component (Stitch spec)

# Role Taxonomy — the design constitution (doctrine B, taxonomy-first)
# Named semantic roles agents COMPOSE from instead of inventing design decisions inline.
# Each role names what it IS in the system (not how it looks) and binds to tokens above.
# This is the per-project home for the centralize-design-authority principle
# (rants/css-architecture.md + preferences/css-architecture.md). Populated by /document.
roles:
  metric-label:                       # role name = what it IS, never appearance/position
    role: "small label for a numeric stat; pairs with a stat-value"
    typography: "{typography.label}"
    color:      "{colors.neutral-2}"
  stat-value:
    role: "the number a metric-label describes"
    typography: "{typography.title}"
    color:      "{colors.ink}"
  # ... add the project's actual roles. Bind every role to tokens above; never inline literals.
---

# <project name>

## Overview

<Creative North Star metaphor + 1-2 paragraphs on what this design system is and what it isn't. Reference PRODUCT.md register here without restating it.>

## Colors

<Descriptive name → token mapping with rationale per role. Each entry: descriptive name (e.g., "Sand surface", "Brass accent", "Obsidian ink"), token reference, OKLCH source-of-truth (if codebase stores OKLCH), and one-sentence reason for the role assignment.>

## Typography

<Which family for which role + why; hierarchy commitments; mono discipline if relevant. Reference Adil's mono rant catalog for projects that use mono. Cite the 22-font catalog by name where applicable.>

## Elevation

<Where does depth come from in this product? shadow / border / background contrast / layered surfaces / no elevation / specific physical metaphor. One paragraph + concrete commitments.>

## Components

<Short prose per component family explaining its character + when to use which variant. NOT exhaustive prop documentation — the frontmatter already has the props. Prose contextualizes the **character** ("button is sharp, never rounded; uses brass on obsidian, never the reverse").

Also describe the **Role Taxonomy** here (the `roles:` frontmatter block): the named semantic roles agents compose from — the design constitution. State the procedure: name the role (what it IS, not how it looks), bind it to tokens, only then implement. Cite `preferences/css-architecture.md`. This is doctrine B's per-project home — folded into Components so the 6-section Stitch order is preserved.>

## Do's-and-Don'ts

<Every entry in **design-director voice** — "Prohibited", "forbidden", "never", "always". NOT "consider", "prefer", "may", "should". Cite PRODUCT.md anti-references by name. Cite global rant files where relevant.>
```

---

## Hard rules

### Section names character-for-character

The 6 markdown section names MUST be exactly:

1. **Overview**
2. **Colors**
3. **Typography**
4. **Elevation**
5. **Components**
6. **Do's-and-Don'ts**

In that exact order. Stitch parsers depend on these names character-for-character — no "Layout", no "Motion", no "Responsive" as top-level sections. Fold layout into Overview or Components. Fold motion into Components ("Button: hover state uses considered easing, 320ms"). Fold responsive into Components ("Card: stacks on container query below 640px").

### Voice in Do's-and-Don'ts is design-director

Use these words: **Prohibited. Forbidden. Never. Always.**

Do NOT use: consider, prefer, may, should, might want to, you might, generally.

Examples that count:

> **Forbidden:** Linear-style task UI density. The product is editorial, not engineering tooling.
>
> **Always:** Mono is reserved for the six whitelisted slots in `rants/typography-mono.md` — eyebrow, tag chip, unit, axis chrome, terminal/code, footnote tag. Never elsewhere.
>
> **Never:** AI-purple-to-pink gradients (per `rants/gradients.md`). Substitute brass-on-obsidian or single-hue tonal range.

Examples that DO NOT count:

> Consider keeping density low.
>
> You might want to use mono only in specific places.
>
> Try to avoid AI gradients.

This voice is non-negotiable in Stitch spec. The /document command's qualitative interview confirms it before writing.

### Cite PRODUCT.md anti-references by name

Generic refusals are inadmissible. Each Do's-and-Don'ts entry that refuses an aesthetic direction MUST cite the specific named brand/product/object from PRODUCT.md's Anti-references section.

### Frontmatter is normative; prose contextualizes

The YAML frontmatter contains the exact tokens. The prose sections explain **why** those tokens, **when** to use which, **what character** they carry. Do not redefine tokens in prose. Do not put tokens in two places.

### Hex sRGB in frontmatter (not OKLCH)

Stitch parsers expect hex sRGB. If the codebase stores colors in OKLCH (PeptideFox, RVRY), convert to hex sRGB for the frontmatter. The OKLCH source-of-truth lives in code; DESIGN.md mirrors in sRGB. Document the OKLCH source in the Colors prose section if helpful.

### 8 component props maximum

Stitch component spec limits each component to 8 props:

```
backgroundColor, textColor, typography, rounded, padding, size, height, width
```

If a component needs more state (hover, focus, disabled, variants), document those in the Components prose section, not in the frontmatter. The frontmatter captures the **default** state; prose documents variants.

### No fabricated tokens

Only document tokens the code actually uses. If the codebase has no display family, leave the display row out of frontmatter and flag it in the Typography section. Re-run `/impeccable --document` once the code is updated.

### Role Taxonomy is frontmatter, prose lives in Components

The `roles:` block is **YAML frontmatter**, not a 7th top-level markdown section — the 6 Stitch section names stay character-for-character. Each role:

- Names what it **IS** in the system (a role: `metric-label`, `stat-value`, `nav-item`), NOT how it looks (`blue-box`, `rounded-card`) or where it sits (`top-left-thing`). Appearance/position names are not roles — they are the mechanical-semantic-CSS failure mode (`rants/css-architecture.md`).
- **Binds to tokens** (`{typography.label}`, `{colors.ink}`) — never inline literals. The role is the boundary between "what it is" (the name) and "what it's made of" (the tokens).
- Is **designed first** (taxonomy-first), then implemented. Greenfield: design the taxonomy before any component (`/document --seed`). Brownfield: extract the existing role/semantic-class vocabulary (`/document` scan).

This block is the per-project design constitution. Agents compose from these roles instead of scattering design decisions inline. Prose explanation lives in the Components section. See `preferences/css-architecture.md` for the procedure.

### Token reference syntax

Reference tokens via `{path.to.token}`:

```yaml
button:
  backgroundColor: "{colors.primary}"
  typography:      "{typography.label}"
  rounded:         "{rounded.md}"
```

Never inline values in component blocks. If a component uses a value not in the token map, add the token first.

---

## Cross-references

- Strategic contract: `{project}/.claude/PRODUCT.md` (generated by `/impeccable --teach`)
- Global rant catalog: `~/.claude/docs/concepts/design-contract/rants/` — cite in Do's-and-Don'ts where relevant
- Global preferences: `~/.claude/docs/concepts/design-contract/preferences/` — typography catalog (22 fonts), type scale, spacing junctions, alignment precision, motion references
- Project-scoped rant extensions: existing `rants/typography-mono.md`, `rants/uniform-tile-layout.md`, `rants/alignment-spacing.md` continue to apply at project level. Cite them in Do's-and-Don'ts entries.
- Reference: https://impeccable.style/docs/document and https://stitch.withgoogle.com/docs/design-md/format/

## Why this format

The Stitch spec is **Google's** open format for design markdown — designed so any Stitch-compatible tool can read DESIGN.md without proprietary extensions. By writing PRODUCT.md and DESIGN.md to spec, the project gets:

- **Tool interop.** Any Stitch parser can read the visual contract. Future linters, hygiene utilities, and design-system tools can target this format.
- **Refining-command efficiency.** Commands that need only visual context (`/refine`, `/simplify`, `/fortify`) read DESIGN.md without parsing the strategic-context noise. Commands that need only strategic context (`/shape`) read PRODUCT.md without parsing the visual-token noise.
- **Refresh isolation.** When visual tokens change (new accent, new font), only DESIGN.md regenerates. PRODUCT.md (strategic) is untouched.

Reference: https://stitch.withgoogle.com/docs/design-md/format/
