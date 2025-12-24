---
name: frontend-aesthetics
description: >
  Global frontend aesthetics skill that helps Claude avoid generic "AI slop"
  UI and make bold, intentional visual decisions while still honoring each
  project's design-dna, tokens, and architecture.
license: internal
allowed-tools:
  - Read
  - WebFetch
metadata:
  category: "frontend-design"
  source: "anthropic-frontend-design-plugin + OS 4.1 design-dna"
---

# Frontend Aesthetics – Global Design Skill

You are loading the **Frontend Aesthetics** skill. This skill is meant to:

- Push you away from generic, template-like AI UI.
- Encourage distinctive, cohesive aesthetics per project.
- Keep you inside each project's **design-dna and tokens**.

This skill does **not** define a visual language by itself. It layers on top of:
- Project design docs (`design-system-vX.X.md`, `DESIGN_RULES_vX.X.md`,
  `CSS-ARCHITECTURE.md` or equivalents).
- Any project-specific design-dna JSON (e.g. `design-dna.json` or `.claude/design-dna/`).

---

## 1. When to Use This Skill

You can use this skill in **any** frontend context (web/expo/ios) when:
- The user asks for UI that feels **distinctive, premium, or designed**, not
  "just another dashboard".
- The project has at least some design/dna docs or tokens you can honor.
- You want to avoid generic AI patterns and make more intentional choices.

You must still:
- Respect project design systems and constraints.
- Treat local design-dna as **law**; this skill is advisory, not overriding.

---

## 2. Core Aesthetic Principles

These principles help create intentional, distinctive UI while respecting project constraints.

### 2.1 Typography

- Choose **intentional type roles**, not arbitrary sizes:
  - Headings, section titles, labels, body, meta.
  - Use project tokens or semantic CSS classes where available.
- Avoid:
  - Overused generic fonts in projects that ship their own type.
  - Random size ladders that don't map to design tokens.
- Use typography to create a clear hierarchy:
  - H1/H2 vs section subheads.
  - Body vs meta/labels.

### 2.2 Color & Theme

- Commit to a **cohesive aesthetic**:
  - One primary accent.
  - A small supporting palette.
  - Reasonable neutrals for surfaces/backgrounds.
- Avoid:
  - The classic "AI slop" purple gradient on white, unless explicitly part of
    design-dna.
  - Competing accents everywhere; let color mean something.
- Prefer:
  - Token-based colors (CSS variables, theme tokens).
  - Semantic roles (surface, accent, border, text) rather than one-off hex.

### 2.3 Spacing, Layout & Rhythm

- Snap spacing to the project's **grid and spacing tokens**.
- Use consistent vertical rhythm:
  - Section breaks.
  - Component padding.
  - Distance between related elements.
- Avoid:
  - Uneven, ad-hoc spacing just to make something "fit".
  - Over-nesting containers when simple layout primitives would suffice.

### 2.4 Motion & Micro-interactions

- Use motion to:
  - Clarify state changes.
  - Add subtle delight to key interactions.
- Favor:
  - Simple, performant patterns (opacity/translate) with short durations.
- Avoid:
  - Bouncy, chaotic motion unless it is explicitly part of the brand.
  - Spreading micro-animations everywhere without a clear purpose.

### 2.5 Backgrounds & Depth

- Use surfaces, elevation, and subtle contrast to create **depth and focus**:
  - Cards/panels for grouped content.
  - Differentiated backgrounds for page sections.
- Avoid:
  - Flat, lifeless layouts where everything is the same value.
  - Heavy borders; prefer hairlines and surface contrast.

---

## 3. Anti-Pattern Library – "AI Slop" to Avoid

When designing or implementing UI, watch out for:

1. **Generic dashboards**
   - Centered hero + 2–3 gradient cards + basic charts with no identity.
   - Uniform-grey cards with indistinguishable content blocks.

2. **Copy-paste template feel**
   - Obvious clone of a popular UI library's default look without customization.

3. **Color soup**
   - Too many accents, uncoordinated hues, no clear semantic meaning.

4. **Flattened hierarchy**
   - Everything the same weight and size.
   - Sections only separated by random white space.

5. **Over-animated UI**
   - Every hover zooms/bounces.
   - Long transitions that slow the interface down.

If you see these emerging, pause and re-center on project design-dna and the
principles above.

---

## 4. Interaction with Project Design-DNA

When a project has a machine-readable design-dna (e.g. `design-dna.json` or
`.claude/design-dna/`):

- **Always load design-dna first.**
  - Get tokens, components, and cardinal laws.
- Then apply this skill:
  - Use it to make **better choices within those constraints**, not to invent
    a new visual language.

If no design-dna exists:
- Use this skill to:
  - Push toward an aesthetic that feels cohesive and intentional.
  - Still keep implementation maintainable and token-friendly so design-dna
    can be added later.

---

## 5. Output Expectations for Agents Using This Skill

When a frontend/expo/ios agent has loaded this skill and is asked to build or
refine UI:

- Make aesthetic decisions **explicit**:
  - "I'm using [X] as the primary accent and [Y/Z] as supporting tones."
  - "Title/body/meta are mapped to [these] typography roles."
- Call out where you've **avoided generic patterns**:
  - "Instead of a generic 3-card feature row, I used [project-specific pattern]."
- Remain grounded in **project design-dna** when present:
  - Reference specific tokens, components, or rules from design-dna when
    explaining choices.

The goal is for UI to feel:
- Designed, not templated.
- Distinctive, but still aligned with the project's system.
- Maintainable and understandable to other humans and agents.
