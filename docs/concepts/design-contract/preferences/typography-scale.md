# Preference: Type Scale & Hierarchy

## Verbatim

> "Large displays; Large, but not heavy H1s → Big drop to H2; H3 only a little larger than body; H4 the same size as body, just often a different form (e.g. all caps, heavier); Mono fonts used sparingly unless the entire aesthetic is built around it (used for code, data, as accents or labels); Generally oriented toward 300/400 weights; italics sparingly used in body but sometimes invoked heavily for displays."

## The hierarchy shape

This is a **non-uniform scale**, not a modular-ratio scale. The hierarchy compresses at the bottom and stretches at the top:

```
DISPLAY   ████████████████████████████████    (huge; display font only)
H1        ██████████████                      (large; light weight; NOT heavy)
          ▼ big drop
H2        ██████                              (moderate; clear step down)
H3        █████                               (slightly larger than body)
H4        ████                                (same size as body, different form — caps, heavier)
BODY      ████                                (300/400 weight; reading size)
```

Key properties:

1. **Display is for display.** Huge sizes, typically ≥32px, often much larger. Respects display font hard minimums.
2. **H1 is large but light.** Large in scale, weight 200-300. The elegance comes from size + lightness, not size + mass. **Bold huge headings are refused as a category.**
3. **H1→H2 is a visible drop**, not a smooth ratio. H2 is noticeably smaller — not "one step down on a 1.25 scale" smaller, but "clearly a different register" smaller.
4. **H3 barely larger than body.** The hierarchy compresses here. H3 is not a "big heading" — it's a local section marker.
5. **H4 equals body size.** H4 differentiates via FORM, not size: usually all caps, heavier weight (500), or tracked-out letter-spacing.
6. **Body 300/400.** Default weight. Light-to-regular. Avoid heavy body text.
7. **Mono sparingly** unless the entire aesthetic is built around it. Mono has specific roles: code, data, accents, labels. Not a body font choice unless deliberate.
8. **Italic is a role**, not decoration. Sparingly in body — used for specific content types (citations, definitions, emphasis-with-meaning). Can be invoked heavily for displays where the italic is a formal choice.

---

## Why the hierarchy compresses at the bottom

The H3/H4/body compression is deliberate. Traditional editorial hierarchy uses size to create structure. This hierarchy uses **size + weight + form** — H4 "works" as a heading not because it's bigger than body, but because it's caps + heavier or otherwise formally distinct.

This pattern comes from editorial print (magazines, books) where page-scale typography already has H1/H2 doing the heavy lifting, and lower-level headings are visual pauses rather than visual announcements. Tech/SaaS typography inverted this (every heading is bigger than the next) and produced the flat-hierarchy-with-six-nearly-identical-sizes failure.

---

## Typography hard minimums (non-negotiable)

These minimums are based on human perception and font design. They are not flexible.

### Display fonts

**Display fonts have a HARD minimum of ~32px.** They become illegible below this size because:
- Their letterforms are designed for large display
- Spacing, proportions, and detail are calibrated for size
- Ultra-light weights (200-300) magnify this — light weights NEED larger sizes

**Never use:**
- Display font at 24px → use body font at 24px instead
- Display font at 18px → use body font
- Any ultra-light weight (200-300) below 24px

If the heading size is too small for the display font, **choose a different font designed for smaller sizes** (body font, often works for mid-level headings).

### Body text

- **Minimum: 12px.** Below this, readability strains.
- **Recommended: 14-16px** for body paragraphs.
- **Never:** `font-size` below 12px on any body/paragraph/list.

### Font pairing

- **Maximum: 4 font families.** More creates visual chaos.
- Each font has a clear role (display / body / accent / mono). No overlap in usage.
- **Display fonts for display. Body fonts for body.** Don't use display for captions. Don't use body for heroes.

---

## Weight strategy

- **Lighter weights (200-300) for large display sizes** — preserve elegance. A 64px heading at 300 weight reads as refined; the same heading at 700 weight reads as shouty.
- **Regular weights (400) for body text** — avoid ultra-light for readability at small sizes.
- **Weight + size relationship**: weight 200-300 needs size ≥24px to stay readable. Heavier weights (500-700) work at body sizes.
- **Never use heavy weight (600+) on H1** — refused as a category. Large means light in this system.

---

## Italic as role

Italic is a role, not decoration. Apply consistently for specific content types, not for emphasis drift.

**Italic roles:**
- Citations / quotes
- Book titles, film titles, work titles
- Definitions on first introduction
- Emphasis-with-meaning (rare)
- Display editorial moments — hero, pull quote, chapter opener

**Anti-pattern:** italic on body paragraphs without a role. If you can't articulate *why* this text is italic, it shouldn't be.

**Display italic as editorial move** — when the project calls for a moment of editorial gravity, display-scale italic serif carries weight. The preferred fonts that handle italic display well: GT Pantheon Italic, GT Sectra Italic, Domaine Display Italic, OGG Italic, Sang Bleu Serif Italic.

---

## Mono as role

**Mono sparingly.** Mono fonts have specific roles:

- Code blocks and inline code
- Data tables, numerical displays, precision values
- Accent labels, timestamps, IDs
- High-density number contexts

**Anti-patterns:**
- Mono as body font (unless the entire aesthetic is built around monospace, e.g., a developer-tool UI where mono is the thesis)
- Mono as display font (unless deliberate retro-futuristic move)
- Mono mixed with sans-serif body on the same surface without clear role division

**When mono IS the aesthetic** (e.g., a terminal-inspired product), it can carry body text. But this is a thesis-level choice, not a default.

---

## Starting values (reference only; project overrides)

If no project-specific scale is declared, these starting values show the non-uniform scale shape in practice:

```css
:root {
  --font-size-display:   clamp(4rem, 8vw, 8rem);      /* ~64–128px */
  --font-size-h1:        clamp(2.5rem, 4vw, 4rem);    /* ~40–64px */
  --font-size-h2:        1.5rem;                      /* 24px */
  --font-size-h3:        1.125rem;                    /* 18px */
  --font-size-h4:        1rem;                        /* 16px — same as body */
  --font-size-body:      1rem;                        /* 16px */
  --font-size-caption:   0.875rem;                    /* 14px */
}
```

Notice the jumps:
- Display → H1 = 2× or more
- H1 → H2 = 2.5–3× (big drop)
- H2 → H3 = 1.33× (moderate)
- H3 → H4 = 1.125× (small)
- H4 = body

**The curve is heavy at the top, flat at the bottom.** Dramatic jumps from display to H2; compression below.

### H4 differentiation via form (not size)

Since H4 equals body size, it differentiates through form:

```css
.prose h4 {
  font-family: var(--font-display-sans);       /* different family */
  font-size: 1rem;                             /* same as body */
  font-weight: 500;                            /* heavier than body's 300/400 */
  text-transform: uppercase;                   /* form distinction */
  letter-spacing: 0.05em;                      /* tracked */
  margin-top: var(--space-24);
  margin-bottom: var(--space-8);
  padding-bottom: var(--space-2);
  border-bottom: 1px solid var(--color-accent);
}
```

Weight + caps + letter-spacing + (optionally) different family does the work that size would do in a traditional scale.

### Line-height relationships

Line-height scales inversely with line length and font size:

- **Display text:** `line-height: 1.0 – 1.1` (tight, reads as one unit)
- **H1:** `line-height: 1.1 – 1.2`
- **H2:** `line-height: 1.2 – 1.3`
- **H3:** `line-height: 1.3 – 1.4`
- **H4:** `line-height: 1.4 – 1.5`
- **Body:** `line-height: 1.4 – 1.6` depending on measure

**For light text on dark backgrounds, add 0.05–0.1 to the normal line-height** — light type reads as lighter weight and needs more breathing room.

---

## Detection / enforcement

| Signal | Detection | Severity |
|---|---|---|
| Heavy-weight H1 | `h1.*font-weight:\s*([6-9]\d{2}\|bold)` — weight ≥600 on H1 | P1 |
| No drop between H1 and H2 | computed font-size ratio H1/H2 < 1.5 | P1 |
| H3 much larger than body | computed font-size ratio H3/body > 1.4 | P1 |
| H4 larger than body | computed font-size ratio H4/body > 1.1 | P1 |
| H4 with same form as body | H4 with same weight, letter-spacing, and text-transform as body | P0 |
| Heavy body text | `body/p.*font-weight:\s*([5-9]\d{2}\|bold)` | P1 |
| Mono used as body font | `font-family` on body/p/article uses mono AND project doesn't declare mono-aesthetic | P0 |
| Italic used as body-default | `font-style: italic` on body paragraphs without documented role | P1 |
| Display font below minimum | display-family `font-size < 32px` (or ≥24px with weight 200-300) | P0 |
| Body text below minimum | body/p/list `font-size < 12px` | P0 |
| More than 4 font families | distinct `font-family` values in project > 4 | P1 |
| Ultra-light weight at small size | weight 200-300 with size < 24px | P0 |

---

## What the spine enforces

- Non-uniform scale shape: significant H1→H2 drop; H3 and H4 compressed near body
- H1 weight 200-400; heavy weights refused
- H4 differentiation via form (caps, weight, tracking), not size
- Typography hard minimums (display ≥32px, body ≥12px, ultra-light ≥24px)
- ≤4 font families
- Mono sparingly (catches body-font-mono without project override)
- Italic as role, not default

The spine does NOT lock specific sizes — those come from project context. But the shape of the scale and the discipline of form-not-size at H4 are enforced.
