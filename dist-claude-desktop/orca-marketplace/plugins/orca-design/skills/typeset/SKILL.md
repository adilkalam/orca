---
name: typeset
description: Improves typography by fixing font choices, hierarchy, sizing, weight, and readability so text feels intentional. Use when the user mentions fonts, type, readability, text hierarchy, sizing looks off, or wants more polished, intentional typography.
---

Assess and improve typography that feels generic, inconsistent, or poorly structured — turning default-looking text into intentional, well-crafted type.

## Preparation

Read the `impeccable-hub` skill first if available this conversation.

---

## Preferred font approach (consult FIRST)

Before picking any font, run the font selection procedure below. Reflex-picking a "safer" trendy font after being told not to use Inter just recreates a new monoculture — avoid that failure mode explicitly.

## Type scale discipline

Non-uniform scale: a big drop from H1→H2; H3 barely larger than body; H4 equal to body size, differentiated by form (caps, weight, tracking) rather than size.

## Typography spacing — junction discipline

Every prose-scope CSS must handle `:first-child`, `:last-child`, `:has(+ ul)`, and per-heading asymmetric margins — the places double-stacked margins usually appear.

---

## Assess Current Typography

1. **Font choices**: invisible defaults (Inter, Roboto, Arial, Open Sans)? Does the font match brand personality? More than 2-3 families (almost always a mess)?
2. **Hierarchy**: can you tell headings from body from captions at a glance? Sizes too close together (14/15/16px = muddy)? Weight contrasts strong enough?
3. **Sizing & scale**: consistent type scale or arbitrary sizes? Body text ≥16px? Fixed `rem` scale for app UI vs fluid `clamp()` for marketing headings?
4. **Readability**: comfortable line lengths (45-75 characters)? Appropriate line-height? Enough text/background contrast?
5. **Consistency**: same elements styled the same way throughout? Weights used consistently per role? Intentional letter-spacing?

**CRITICAL**: The goal isn't to make text "fancier" — it's to make it clearer, more readable, and more intentional. Good typography is invisible; bad typography is distracting.

## Plan Typography Improvements

- Font selection: do fonts need replacing? What fits the brand/context?
- Type scale: establish a modular scale (e.g. 1.25 ratio) with clear hierarchy.
- Weight strategy: which weights serve which roles?
- Spacing: line-heights, letter-spacing, margins between typographic elements.

## Improve Typography Systematically

### Font Selection Procedure (do this BEFORE typing any font name)

The failure mode: "told not to use Inter, so I reach for my next favorite → new monoculture."

1. Write 3 concrete brand-voice words (NOT "modern"/"elegant" — dead categories).
2. List the 3 fonts you'd reflexively reach for. If any are reflex picks (Fraunces, Newsreader, Playfair, IBM Plex, Space Grotesk, Inter, DM Sans, Outfit, Plus Jakarta, Instrument, etc.), reject them.
3. Browse a catalog with the 3 words in mind (Google Fonts, Pangram Pangram, Future Fonts, Klim, Velvetyne...). Find a font that fits the brand as a *physical object*. Reject the first "designy" pick.
4. Cross-check: "elegant" is not necessarily a serif; "technical" not necessarily a sans; "warm" not necessarily Fraunces. If the pick lines up with reflex, go back to step 3.
5. Pair with genuine contrast (serif + sans, geometric + humanist) or use a single family in multiple weights. Ensure `font-display: swap` and metric-matched fallbacks avoid layout shift.

### Establish Hierarchy
- 5 sizes cover most needs: caption, secondary, body, subheading, heading.
- Use a consistent ratio between levels (1.25, 1.333, or 1.5).
- Combine size + weight + color + space for strong hierarchy — don't rely on size alone.
- App UIs: fixed `rem`-based scale, optionally adjusted at 1-2 breakpoints (predictability matters for dense layouts).
- Marketing/content pages: fluid `clamp(min, preferred, max)` for headings and display text; keep body text fixed.

### Fix Readability
- `max-width: 65ch` on text containers.
- Line-height tighter for headings (1.1-1.2), looser for body (1.5-1.7); increase slightly for light-on-dark text.
- Body text at least 16px / 1rem.

### Refine Details
- `tabular-nums` for data tables and aligned numbers.
- `letter-spacing`: slightly open for small caps/uppercase, default or tight for large display text.
- Semantic token names (`--text-body`, `--text-heading`), not value names (`--font-16`).
- `font-kerning: normal`, consider OpenType features where appropriate.

### Weight Consistency
- Define clear roles per weight and stick to them.
- No more than 3-4 weights (Regular, Medium, Semibold, Bold is plenty).
- Load only the weights you actually use.

**NEVER**:
- Use more than 2-3 font families
- Pick sizes arbitrarily — commit to a scale
- Set body text below 16px
- Use decorative/display fonts for body text
- Disable browser zoom (`user-scalable=no`)
- Use `px` for font sizes — use `rem`
- Default to Inter/Roboto/Open Sans when personality matters
- Pair fonts that are similar but not identical (two geometric sans-serifs)

## Verify Typography Improvements

- Hierarchy: can you identify heading vs body vs caption instantly?
- Readability: is body text comfortable in long passages?
- Consistency: are same-role elements styled identically throughout?
- Personality: does the typography reflect the brand?
- Performance: are web fonts loading efficiently without layout shift?
- Accessibility: WCAG contrast ratios met? Zoomable to 200%?

Remember: Typography is the foundation of interface design — it carries the majority of information. Getting it right is the highest-leverage improvement you can make.

---

## Closing

After finishing, ask: "Anything here you'd push back on, or want done differently next time?" There's no shared project file this app writes preferences to automatically — restate any strong preference back to the user.
