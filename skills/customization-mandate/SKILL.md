---
name: customization-mandate
description: >
  Mandatory component customization before page implementation. Derive all
  customizations from design-dna tokens. No default component styling allowed.
  Take pride in originality.
trigger_terms: customize, customization, component styling, design system setup
---

# Customization Mandate

## Core Principle

**BEFORE building pages, customize ALL base UI components.**

Every component must be visually distinct -- derived from the project's design-dna tokens. No default styling from component libraries (shadcn, Radix, etc.) should remain visible in the final product.

"Take pride in the originality of the designs."

## Workflow

### Phase 0: Component Customization (BEFORE Page Implementation)

1. **Read design-dna.json** -- extract colors, typography, spacing, border-radius, shadows, motion tokens
2. **Identify all base components** the project will use
3. **Customize each component** to reflect the design-dna identity
4. **Verify:** No component should look like its library default

### Phase 1+: Page Implementation
Only AFTER Phase 0 is complete. Pages consume already-customized components.

## Component Checklist

Customize these components BEFORE building pages:

### Interactive Elements
- [ ] Button (primary, secondary, ghost, destructive variants)
- [ ] Link / anchor styles
- [ ] Toggle / switch
- [ ] Checkbox
- [ ] Radio button
- [ ] Select / dropdown

### Form Elements
- [ ] Input (text, email, password, number)
- [ ] Textarea
- [ ] Form error states
- [ ] Form labels
- [ ] Form helper text

### Display Components
- [ ] Card (with hover state)
- [ ] Badge / tag / chip
- [ ] Avatar
- [ ] Tooltip
- [ ] Alert / callout
- [ ] Separator / divider

### Navigation
- [ ] Navigation bar / header
- [ ] Footer
- [ ] Breadcrumbs
- [ ] Tabs
- [ ] Sidebar (if applicable)

### Overlay Components
- [ ] Dialog / modal
- [ ] Sheet / drawer
- [ ] Toast / notification
- [ ] Popover
- [ ] Command palette (if applicable)

### Layout Components
- [ ] Section container
- [ ] Content wrapper
- [ ] Grid system

## Customization Sources

All customizations derive from design-dna tokens:

| Token Category | Applies To |
|---------------|------------|
| `colors.primary` | Button fills, link colors, focus rings |
| `colors.surface` | Card backgrounds, input backgrounds |
| `colors.border` | Input borders, card borders, dividers |
| `typography.fontFamily` | All text elements |
| `typography.heading` | H1-H6 styles |
| `spacing` | Padding, margins, gaps |
| `borderRadius` | Buttons, cards, inputs, badges |
| `shadows` | Cards, dropdowns, modals |
| `motion.easing` | Hover transitions, focus transitions |
| `motion.duration` | Animation timing |

## Anti-Defaults

### Colors to Avoid (Unless Specified in Design-DNA)
- Purple / indigo / violet (shadcn defaults)
- Blue (#3b82f6 / Tailwind blue-500)
- Generic gray scales without character

### Patterns to Avoid
- Default border-radius (6px from shadcn)
- Default shadow (shadow-sm/shadow-md from Tailwind)
- Default focus rings without brand color
- Generic hover: opacity changes without personality
- Emojis in UI elements

### The Test
For each component ask: "Could this component belong to ANY project?"
- If YES: it is not customized enough
- If NO: it reflects this project's identity

## Verification

After customization phase, verify:

1. **Visual distinctiveness:** Screenshot components -- they should not look like library defaults
2. **Token compliance:** Grep for hardcoded color/spacing values -- there should be none
3. **Consistency:** All components share the same design language (border-radius, shadow style, color palette)
4. **States:** Every interactive component has hover, focus, active, and disabled states customized
5. **Dark mode (if applicable):** Token switching works for all components

## Example: Button Customization

```css
/* WRONG: Default shadcn button */
.button {
  border-radius: 6px;
  background: hsl(222.2, 84%, 4.9%);
  padding: 8px 16px;
}

/* RIGHT: Design-DNA driven button */
.button {
  border-radius: var(--radius-md);
  background: var(--color-primary);
  padding: var(--space-2) var(--space-4);
  font-family: var(--font-body);
  font-weight: var(--font-weight-medium);
  letter-spacing: var(--letter-spacing-wide);
  transition: background var(--motion-duration-fast) var(--motion-easing-entrance),
              transform var(--motion-duration-fast) var(--motion-easing-entrance);
}
.button:hover {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
}
.button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```
