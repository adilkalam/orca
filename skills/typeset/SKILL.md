---
name: typeset
description: "Improves typography by fixing font choices, hierarchy, sizing, weight, and readability so text feels intentional. Use when the user mentions fonts, type, readability, text hierarchy, sizing looks off, or wants more polished, intentional typography."
argument-hint: "[target]"
user-invocable: true
---

Assess and improve typography that feels generic, inconsistent, or poorly structured — turning default-looking text into intentional, well-crafted type.

## MANDATORY PREPARATION

**Run the cognition constraint loop (MANDATORY)** — see `~/.claude/docs/reference/cognition-constraint-loop.md`. (If `design-builder` loaded this skill only for craft reference, ignore this block and use the craft below.)

Invoke {{command_prefix}}impeccable — it contains design principles, anti-patterns, and the **Context Gathering Protocol**. Follow the protocol before proceeding — if no design context exists yet, you MUST run {{command_prefix}}impeccable teach first.

---

## Preferred font set (NEW — consult FIRST)

Before running Bakaus's font_selection_procedure, check `~/.claude/docs/concepts/design-contract/preferences/typography-fonts.md` for Adil's preferred set (22 fonts, 4 categories: Sans, Serif, Display, Mono). Propose 2-3 from the set that match the register before reaching beyond.

## Type scale discipline (NEW — applies to all heading/body work)

Non-uniform scale: big drop H1→H2; H3 barely larger than body; H4 equals body size, differentiates via form (caps, weight, tracking). See `~/.claude/docs/concepts/design-contract/preferences/typography-scale.md`.

## Typography spacing — junction discipline (NEW)

Every prose-scope CSS must handle `:first-child`, `:last-child`, `:has(+ ul)`, per-heading asymmetric margins. See `~/.claude/docs/concepts/design-contract/preferences/typography-spacing.md` for the 14 named junctions + working CSS patterns.

---

## Assess Current Typography

Analyze what's weak or generic about the current type:

1. **Font choices**:
   - Are we using invisible defaults? (Inter, Roboto, Arial, Open Sans, system defaults)
   - Does the font match the brand personality? (A playful brand shouldn't use a corporate typeface)
   - Are there too many font families? (More than 2-3 is almost always a mess)

2. **Hierarchy**:
   - Can you tell headings from body from captions at a glance?
   - Are font sizes too close together? (14px, 15px, 16px = muddy hierarchy)
   - Are weight contrasts strong enough? (Medium vs Regular is barely visible)

3. **Sizing & scale**:
   - Is there a consistent type scale, or are sizes arbitrary?
   - Does body text meet minimum readability? (16px+)
   - Is the sizing strategy appropriate for the context? (Fixed `rem` scales for app UIs; fluid `clamp()` for marketing/content page headings)

4. **Readability**:
   - Are line lengths comfortable? (45-75 characters ideal)
   - Is line-height appropriate for the font and context?
   - Is there enough contrast between text and background?

5. **Consistency**:
   - Are the same elements styled the same way throughout?
   - Are font weights used consistently? (Not bold in one section, semibold in another for the same role)
   - Is letter-spacing intentional or default everywhere?

**CRITICAL**: The goal isn't to make text "fancier" — it's to make it clearer, more readable, and more intentional. Good typography is invisible; bad typography is distracting.

## Plan Typography Improvements

Consult the [typography reference](reference/typography.md) from the impeccable skill for detailed guidance on scales, pairing, and loading strategies.

Create a systematic plan:

- **Font selection**: Do fonts need replacing? What fits the brand/context?
- **Type scale**: Establish a modular scale (e.g., 1.25 ratio) with clear hierarchy
- **Weight strategy**: Which weights serve which roles? (Regular for body, Semibold for labels, Bold for headings — or whatever fits)
- **Spacing**: Line-heights, letter-spacing, and margins between typographic elements

## Improve Typography Systematically

### Font Selection

If fonts need replacing:
- Choose fonts that reflect the brand personality
- Pair with genuine contrast (serif + sans, geometric + humanist) — or use a single family in multiple weights
- Ensure web font loading doesn't cause layout shift (`font-display: swap`, metric-matched fallbacks)

### Establish Hierarchy

Build a clear type scale:
- **5 sizes cover most needs**: caption, secondary, body, subheading, heading
- **Use a consistent ratio** between levels (1.25, 1.333, or 1.5)
- **Combine dimensions**: Size + weight + color + space for strong hierarchy — don't rely on size alone
- **App UIs**: Use a fixed `rem`-based type scale, optionally adjusted at 1-2 breakpoints. Fluid sizing undermines the spatial predictability that dense, container-based layouts need
- **Marketing / content pages**: Use fluid sizing via `clamp(min, preferred, max)` for headings and display text. Keep body text fixed

### Fix Readability

- Set `max-width` on text containers using `ch` units (`max-width: 65ch`)
- Adjust line-height per context: tighter for headings (1.1-1.2), looser for body (1.5-1.7)
- Increase line-height slightly for light-on-dark text
- Ensure body text is at least 16px / 1rem

### Refine Details

- Use `tabular-nums` for data tables and numbers that should align
- Apply proper `letter-spacing`: slightly open for small caps and uppercase, default or tight for large display text
- Use semantic token names (`--text-body`, `--text-heading`), not value names (`--font-16`)
- Set `font-kerning: normal` and consider OpenType features where appropriate

### Weight Consistency

- Define clear roles for each weight and stick to them
- Don't use more than 3-4 weights (Regular, Medium, Semibold, Bold is plenty)
- Load only the weights you actually use (each weight adds to page load)

**NEVER**:
- Use more than 2-3 font families
- Pick sizes arbitrarily — commit to a scale
- Set body text below 16px
- Use decorative/display fonts for body text
- Disable browser zoom (`user-scalable=no`)
- Use `px` for font sizes — use `rem` to respect user settings
- Default to Inter/Roboto/Open Sans when personality matters
- Pair fonts that are similar but not identical (two geometric sans-serifs)

## Verify Typography Improvements

- **Hierarchy**: Can you identify heading vs body vs caption instantly?
- **Readability**: Is body text comfortable to read in long passages?
- **Consistency**: Are same-role elements styled identically throughout?
- **Personality**: Does the typography reflect the brand?
- **Performance**: Are web fonts loading efficiently without layout shift?
- **Accessibility**: Does text meet WCAG contrast ratios? Is it zoomable to 200%?

Remember: Typography is the foundation of interface design — it carries the majority of information. Getting it right is the highest-leverage improvement you can make.

---

## SwiftUI target

When the iOS architect passes `platform: swiftui`, the builder reads ONLY this section — the CSS craft above (`rem`, `clamp()`, `font-display`, `ch` widths) does NOT apply.

- Route every text style through `TypographyTokens` (`Font.primary` workhorse); size with Dynamic Type via `.font(...)` + `relativeTo:` a `TextStyle` — NO `px`/`rem`, NO web `@font-face`.
- Non-uniform scale: big H1→H2 drop, H3 barely over body; differentiate small heads by weight/tracking (`.fontWeight`, `.tracking`), not size alone.
- `.monospacedDigit()` on the brand face for tabular/aligned numbers; display face only ≥28pt (`display-font-below-floor`).
- Prefer the bundled brand face over stock SF; a raw `.font(.system(...))` reflex is `system-font-reflex` (P0 on this project).
- Support Dynamic Type up to accessibility XXL; set line length via container width + `.lineSpacing`.
- Self-check with `swiftdesigncheck` (NOT `designcheck.js`).

---

## Rant-capture at handback

After completing the work, before returning to the user, ask:

> "Returned to bench. Anything here you'd rant about?"

If the user responds, append the entry to the current project's `.orca/design-rants-pending.md` in this format:

```
## YYYY-MM-DD HH:MM — [verb-name]
[user's response verbatim]
```

Create `.orca/` in the current project if absent. Do NOT write to `~/.claude/` or to the ORCA-OS source tree directly. Pending entries are swept and categorized later via `/impeccable extract rants`.
