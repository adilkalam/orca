# Banned: Alignment and spacing — the "floating awkwardly in a random spot" failure

## Verbatim

> Lack of space between header buttons and the ugly purple box, which has these obviously AI generated rounded corners, and gives zero thought to the horizontal placement and alignment of the logo and menu items leaving them to just float awkwardly in a random spot.

And earlier:

> I do not fuck around with alignment. Pixel perfect precision, otherwise I can't help but notice. Special typesetting for bullets to be perfectly at a font's x-height. Pixel level compensation for rounded corners. Optical alignment > programmatic confirmation.

## What this ban is actually about

This is the signature discipline showing up as a refusal. This ban has two specific failures layered:

1. **Missing gap / crowded-together elements**: "lack of space between header buttons and the ugly purple box." The LLM placed elements against each other without breathing room. This is the generic-Tailwind-gap-4 reflex, or worse, no gap at all.

2. **Floating-in-random-spot alignment**: "the logo and menu items just float awkwardly in a random spot." Elements placed without shared horizontal or vertical baselines. Nav items that don't sit on a common axis. Logo that doesn't align with the nav's optical center. The *absence* of deliberate placement.

Underneath both: **pixel-precision is categorical, not casual**. An element that's 2px off is wrong. An element that's optically misaligned even if mathematically centered is wrong. This is the OCD discipline made explicit.

## Detection — mixed regex and heuristic

Pure regex won't catch optical alignment. Most of these require computed-style inspection (via jsdom or browser automation) or visual diffing.

| Signal | Detection | Severity |
|---|---|---|
| Elements with no gap on flex/grid containers | `display:\s*(flex\|grid)` without any `gap` declaration AND multiple children | P1 (warning) |
| Arbitrary pixel values (not from scale) | Spacing values that don't fall on the 4px grid: `margin\|padding.*:\s*\d+px` where value % 4 ≠ 0 | P1 |
| Mixed spacing units within a single component | Both `rem` and `px` used for spacing in the same scope | P1 |
| Missing shared baseline on nav/header | AST: nav items as direct siblings of logo without shared flex baseline (`align-items: center` or equivalent) | P0 |
| Optical misalignment (computed) | Run after render: bounding-box audit on nav items — if any item's vertical center is > 0px off the group's mean, flag | P0 |
| Icon + text pairs not optically aligned | AST + computed: `<icon>Text</text>` patterns where icon's optical center doesn't align with text's x-height | P1 |

## The "pixel-perfect audit" — explicit detector feature

This is its own deterministic scanner, separate from the anti-pattern regex list. Runs in `/polish` and `/critique`. Zero tolerance. Any misalignment > 0px on elements that should align gets flagged as P0.

Elements that should align (detected by structural pattern):
- Nav items on the same axis
- Buttons in a button group
- Labels + their inputs
- Icon + adjacent text
- Elements in a row-flex layout
- Grid children in the same row

The audit reports exact pixel values, not tolerances. "Button 1 bottom: 244px. Button 2 bottom: 244px. Button 3 bottom: 246px. ALIGNED: NO. Max deviation: 2px. 2px is visible and wrong."

This audit is load-bearing because Adil notices 2px. The detector has to notice 2px. The fence cannot be "close enough" here — the refusal is categorical.

## The "floating in random spot" heuristic

Harder to regex. The signal: elements whose positioning isn't derivable from a shared baseline or a documented grid. Detection approach:

- Identify grouping: is the element in a clear parent layout (flex/grid)? If not, check for implicit alignment (margin auto-centering, absolute positioning with logical anchors).
- Check shared-axis: does the element share a baseline with siblings, or is it positioned independently?
- If positioned independently AND adjacent to elements that ARE aligned, flag. The inconsistency itself is the problem.

This is heuristic. False positives likely. But the false-negative is worse here — a header where the logo "just floats" is the exact signature of LLM-generated UI, and the detector has to earn its place by catching it.

## What to reach for instead

- Explicit flex/grid containers with named gap tokens from the scale
- Shared vertical baseline on all horizontal nav groups
- Optical alignment: test by eye and by computed bounding-box, not by margin math
- When in doubt, more breathing room — elements default to OVER-spaced, not crowded
- Typography: baseline grid where it matters (long-form content especially); x-height awareness on icon/text pairs; bullet alignment to body font's x-height, not to the line-box default

---

## Specific failure mode: page-meta floating in the right corner

A common LLM reflex on page headers: the title block goes left, then a small page-meta element (often "AS OF / 2026-05," "LAST UPDATED," "VERSION 2.1") gets dropped into the right column with no horizontal anchor relative to the content. The result: the meta-element floats in a visually random spot — vertically centered against the title block, but horizontally just sitting wherever the right edge of the container ends.

This is a specific instance of the broader "floating in random spot" pattern, named explicitly because it's frequent enough to deserve its own callout.

**Detection:**

| Signal | Detection | Severity |
|---|---|---|
| Header with `grid-template-columns: 1fr auto` AND a small meta-element on the right with no shared baseline to the left content | structural pattern match on page-header markup | P0 |
| Page meta-element ("as of," "last updated," "version") that's not anchored to a footer, a deck-style metadata row, or an inline byline | flag any "metadata"-shaped element in a page-header right column | P0 |

**Why this fails:** the meta-element is a footer concern, not a header concern. Reference-document metadata ("as of," "version," "last updated," "audit date") belongs in the page footer where it's a small italic line of provenance. Putting it in the header steals visual weight from the title and creates the floating-element pattern that signals "AI placed this without thinking."

**What to reach for instead:**

- Move the meta-element to the page footer as a small italic line of provenance.
- OR inline it into the title block as a byline beneath the title (italic body sans, small).
- OR drop it entirely if it's not load-bearing for the reader.

The header is for the title and orientation. It's not a place to park metadata that would otherwise have no home.

---

## Specific failure mode: redundant chip+label sublabels

Naming a related pattern that violates both the alignment register AND the typography register (specifically `banned/typography-mono.md`): a segmented control or button where every option carries a mono "tag chip" prefixing the human label that adds no information.

Example: a cadence control with options "7d Weekly," "3.5d Twice weekly," "3d Every 3 days." The "7d / 3.5d / 3d" mono prefix duplicates what the human label already says. The chip is visual noise.

**Why this is an alignment-spacing failure too:** the chip+label combination forces a wider button than the label alone needs, fights the grid rhythm of adjacent controls, and creates an icon-text-pair where the chip is treated as an icon (so the rule about 1.5× icon-text gap kicks in, expanding the button further). The fix is to drop the chip. One label per button. If the abbreviation is genuinely needed, put it in a `title` tooltip on hover.

See `~/.claude/docs/concepts/design-contract/banned/typography-mono.md` for the full mono-discipline coverage of this pattern.
