---
name: polish
description: Performs a final quality pass fixing alignment, spacing, consistency, and micro-detail issues before shipping. Use when the user mentions polish, finishing touches, pre-launch review, something looks off, or wants to go from good to great.
---

## Preparation

Read the `impeccable-hub` skill first if available this conversation. Additionally gather: quality bar (MVP vs flagship).

---

## Precision audit (runs BEFORE the general polish checklist)

Apply zero-tolerance alignment discipline: any misalignment is worth flagging, no "close enough." Check typography-spacing junctions: `:first-child`, `:has()`, `:last-child` rules, per-heading asymmetric margins.

---

Perform a meticulous final pass to catch all the small details that separate good work from great work. The difference between shipped and polished.

## Design System Discovery

Before polishing, understand the system you are polishing toward:

1. Find the design system: search for design tokens, component library, style guide. Study color tokens, spacing scale, typography styles, component API.
2. Note the conventions: how are shared components imported, what spacing scale, which colors come from tokens vs hard-coded, established motion patterns.
3. Identify drift: where does the target deviate — hard-coded values that should be tokens, custom components duplicating shared ones, off-scale spacing.

If a design system exists, polish should align the feature with it. If none exists, polish against the conventions visible in the codebase.

## Pre-Polish Assessment

1. Review completeness: functionally complete? known issues to preserve? MVP vs flagship? how much time for polish?
2. Identify polish areas: visual inconsistencies, spacing/alignment, interaction state gaps, copy inconsistencies, edge cases, loading/transition smoothness.

**CRITICAL**: Polish is the last step, not the first. Don't polish work that's not functionally complete.

## Polish Systematically

### Visual Alignment & Spacing
Pixel-perfect alignment to grid, consistent spacing scale (no random 13px gaps), optical alignment adjustments, responsive consistency at all breakpoints, baseline grid adherence.

### Typography Refinement
Hierarchy consistency, 45-75 character line length, appropriate line-height, no widows/orphans, appropriate hyphenation, kerning on headlines, no FOUT/FOIT.

### Color & Contrast
WCAG contrast on all text, tokens not hard-coded colors, theme consistency across variants, consistent color meaning, accessible focus indicators, tinted (never pure) neutrals, never gray text on colored backgrounds.

### Interaction States
Every interactive element needs: default, hover, focus, active, disabled, loading, error, success. Missing states create confusion and broken experiences.

### Micro-interactions & Transitions
Smooth 150-300ms transitions, ease-out-quart/quint/expo (never bounce/elastic), 60fps (transform/opacity only), motion serves purpose, respects `prefers-reduced-motion`.

### Content & Copy
Consistent terminology and capitalization, no typos, appropriate length, consistent punctuation on labels.

### Icons & Images
Consistent icon family/style, consistent sizing, optical alignment with adjacent text, alt text on all images, no layout shift, 2x assets for retina.

### Forms & Inputs
Consistent labels, clear required indicators, helpful consistent error messages, logical tab order, sensible auto-focus, consistent validation timing.

### Edge Cases & Error States
Loading feedback on all async actions, helpful empty states, clear recoverable error states, success confirmations, long-content handling, missing-data handling.

### Responsiveness
Test mobile/tablet/desktop, 44x44px touch targets, no text under 14px on mobile, no horizontal scroll, logical reflow.

### Performance
Fast initial load, no CLS, smooth interactions, optimized images, lazy-loaded off-screen content.

### Code Quality
No console logs or commented-out code in production, unused imports removed, consistent naming, no `any`/ignored type errors, proper ARIA + semantic HTML.

## Polish Checklist

- [ ] Visual alignment perfect at all breakpoints
- [ ] Spacing uses design tokens consistently
- [ ] Typography hierarchy consistent
- [ ] All interactive states implemented
- [ ] All transitions smooth (60fps)
- [ ] Copy is consistent and polished
- [ ] Icons are consistent and properly sized
- [ ] All forms properly labeled and validated
- [ ] Error states are helpful
- [ ] Loading states are clear
- [ ] Empty states are welcoming
- [ ] Touch targets are 44x44px minimum
- [ ] Contrast ratios meet WCAG AA
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] No console errors or warnings
- [ ] No layout shift on load
- [ ] Works in all supported browsers
- [ ] Respects reduced motion preference
- [ ] Code is clean (no TODOs, console.logs, commented code)

**IMPORTANT**: Polish is about details. Zoom in. Squint at it. Use it yourself. The little things add up.

**NEVER**:
- Polish before it's functionally complete
- Spend hours on polish if it ships in 30 minutes (triage)
- Introduce bugs while polishing
- Ignore systematic issues (if spacing is off everywhere, fix the system)
- Perfect one thing while leaving others rough
- Create new one-off components when design system equivalents exist
- Hard-code values that should use design tokens

## Final Verification

Use it yourself, actually interact with every state (not just happy path), compare to the intended design, ask for fresh eyes if possible.

## Clean Up

Replace custom implementations with shared design-system components where they exist, remove orphaned code, consolidate new values into tokens, verify DRYness.

Remember: You have impeccable attention to detail and exquisite taste. Polish until it feels effortless, looks intentional, and works flawlessly. Sweat the details - they matter.

---

## Closing

After finishing, ask: "Anything here you'd push back on, or want done differently next time?" There's no shared project file this app writes preferences to automatically — restate any strong preference back to the user.
