---
name: layout
description: Improve layout, spacing, and visual rhythm. Fixes monotonous grids, inconsistent spacing, and weak visual hierarchy. Use when the user mentions layout feeling off, spacing issues, visual hierarchy, crowded UI, alignment problems, or wanting better composition.
---

Assess and improve layout and spacing that feels monotonous, crowded, or structurally weak — turning generic arrangements into intentional, rhythmic compositions.

## Alignment precision (runs throughout)

Apply optical alignment discipline and a base grid system, and audit pixel-precision. Nothing floats in a random spot without a reason. Every layout has a deliberate visual entry point that carries the viewer to the destination without announcing itself. Balance negative/positive space.

---

## Assess Current Layout

1. **Spacing**: Is spacing consistent or arbitrary? Is all spacing the same (no rhythm)? Are related elements grouped tightly, with generous space between groups?
2. **Visual hierarchy**: Squint test — blur your eyes, can you still identify the most important element, second most important, and clear groupings?
3. **Grid & structure**: Is there a clear underlying structure? Are identical card grids used everywhere? Is everything centered (left-aligned with asymmetric layouts often feels more designed)?
4. **Rhythm & variety**: Does the layout alternate tight/generous spacing, or is every section structured identically?
5. **Density**: Too cramped? Too sparse? Does density match the content type (data-dense UI needs tighter spacing; marketing pages need more air)?

**CRITICAL**: Layout problems are often the root cause of interfaces feeling "off" even when colors and fonts are fine. Space is a design material — use it with intention.

## Plan Layout Improvements

- **Spacing system**: Use a consistent scale — the specific values matter less than consistency.
- **Hierarchy strategy**: How will space communicate importance?
- **Layout approach**: Flex for 1D, Grid for 2D, named areas for complex page layouts.
- **Rhythm**: Where should spacing be tight vs generous?

## Improve Layout Systematically

### Establish a Spacing System
- Use a consistent spacing scale (framework scale, rem-based tokens, or custom scale).
- Name tokens semantically (`--space-xs` through `--space-xl`), not by value.
- Use `gap` for sibling spacing instead of margins — eliminates margin collapse hacks.
- Apply `clamp()` for fluid spacing that breathes on larger screens.

### Create Visual Rhythm
- Tight grouping for related elements (8-12px between siblings).
- Generous separation between distinct sections (48-96px).
- Varied spacing within sections — not every row needs the same gap.
- Asymmetric compositions where it makes sense.

### Choose the Right Layout Tool
- Flexbox for 1D layouts: rows, nav bars, button groups, card contents.
- Grid for 2D layouts: page-level structure, dashboards, data-dense interfaces.
- Don't default to Grid when Flexbox + `flex-wrap` would be simpler.
- `repeat(auto-fit, minmax(280px, 1fr))` for responsive grids without breakpoints.
- Named grid areas (`grid-template-areas`) for complex page layouts.

### Break Card Grid Monotony
- Don't default to card grids for everything — spacing and alignment create visual grouping naturally.
- Never nest cards inside cards. Vary card sizes, span columns, or mix cards with non-card content.

### Strengthen Visual Hierarchy
- Use the fewest dimensions needed for clear hierarchy — space and weight alone can be enough.
- Be aware of reading flow (top-left to bottom-right in LTR, but primary action placement depends on context).
- Create clear content groupings through proximity and separation.

### Manage Depth & Elevation
- Create a semantic z-index scale (dropdown → sticky → modal-backdrop → modal → toast → tooltip).
- Build a consistent, subtle shadow scale (sm → md → lg → xl).

### Optical Adjustments
- Nudge an icon that looks visually off-center despite being geometrically centered — but only when you're confident, not speculatively.

**NEVER**:
- Use arbitrary spacing values outside your scale
- Make all spacing equal — variety creates hierarchy
- Wrap everything in cards, or nest cards inside cards
- Use identical card grids everywhere
- Center everything
- Default to the hero-metric layout (big number, small label, gradient) as a template unless it's real data
- Default to CSS Grid when Flexbox would be simpler
- Use arbitrary z-index values (999, 9999) — build a semantic scale

## Verify Layout Improvements

- **Squint test**: Can you identify primary, secondary, and groupings with blurred vision?
- **Rhythm**: Does the page have a satisfying beat of tight and generous spacing?
- **Hierarchy**: Is the most important content obvious within 2 seconds?
- **Breathing room**: Comfortable, not cramped or wasteful?
- **Consistency**: Is the spacing system applied uniformly?
- **Responsiveness**: Does the layout adapt gracefully across screen sizes?

Remember: Space is the most underused design tool. A layout with the right rhythm and hierarchy can make even simple content feel polished and intentional.

---

## Closing

After finishing, ask: "Anything here you'd push back on, or want done differently next time?" There's no shared project file this app writes preferences to automatically — restate any strong preference back to the user.
