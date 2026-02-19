---
name: ui-typography-spacing
description: >
  Typography hierarchy and spacing scale fallbacks.
  Yields to project design-dna when present.
---

# UI Typography and Spacing

**Design-DNA override:** When a project has `design-dna.json` or equivalent design
tokens, those values override ALL defaults below.

## Typography Hierarchy

### Size and Weight Scale

| Element | Size | Weight | Line Height | Letter Spacing |
|---------|------|--------|-------------|----------------|
| H1 (page title) | 2.25-3rem | 700-800 | 1.1-1.2 | -0.02em |
| H2 (section) | 1.5-2rem | 600-700 | 1.2-1.3 | -0.01em |
| H3 (subsection) | 1.25-1.5rem | 600 | 1.3 | 0 |
| Body | 1rem (16px min) | 400 | 1.5-1.6 | 0 |
| Small/caption | 0.875rem | 400-500 | 1.4 | 0.01em |
| Label | 0.75-0.875rem | 500-600 | 1.3 | 0.05em |

### Typography Rules

- **Max line length:** 65-75 characters for body text readability (`max-width: 65ch` to `75ch`)
- **Heading-to-body size ratio:** At least 1.5x between H1 and body text
- **Font weight limit:** Never use more than 3 font weights on a single page
- **Contrast between levels:** Ensure sufficient visual distinction between heading levels (size, weight, or both must differ noticeably)
- **Body text minimum:** Never smaller than 1rem (16px) for primary body content

## Visual Rhythm / Spacing

### Spacing Scale

| Level | Desktop | Mobile | CSS Example |
|-------|---------|--------|-------------|
| Section-to-section | 64-96px | 48-64px | `py-16` to `py-24` / `gap-16` to `gap-24` |
| Component-to-component | 24-32px | 16-24px | `gap-6` to `gap-8` |
| Element-to-element | 8-16px | 8-16px | `gap-2` to `gap-4` |

### The 2x Rule

Section gaps should be approximately 2x component gaps.
Component gaps should be approximately 2x element gaps.

This creates natural visual grouping: elements within a component feel connected,
components within a section feel related, sections feel distinct.

**Example:** If element gaps are 12px, component gaps should be ~24px, section gaps ~48-64px.

### Consistency Rule

The same gap value MUST be used for the same element type across ALL sections of a page.
If card-to-card spacing is 24px in one section, it must be 24px in every section.
