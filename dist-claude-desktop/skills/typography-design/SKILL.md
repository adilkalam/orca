---
name: typography-design
description: Font selection, pairing, and comparison recommendations — matching typefaces to use cases, evaluating weight ranges and optical sizes, suggesting serif/sans pairings. Use when the user asks "what font should I use for X", "what pairs well with Y", or "compare font A vs font B".
---

# Typography Design — font selection & pairing

Expert typography guidance for choosing and pairing typefaces. This is knowledge and judgment, not file operations — it doesn't touch font files, generate previews, or edit metadata (that requires local font-engineering tooling — fontTools, a real font library on disk — which isn't available in this app; if the user needs glyph editing or format conversion, tell them plainly that's outside what this skill can do here).

Pair this with the `typeset` skill (which covers CSS/token-level type-system craft) — this skill is specifically about *which fonts* to pick and pair, `typeset` is about *how to use them once picked* (scale, hierarchy, spacing).

## Category Definitions

| Category | Description |
|----------|-------------|
| **serif** | Traditional, has serifs — editorial, classical |
| **sans-serif** | No serifs — UI, modern, clean |
| **monospace** | Fixed width — technical, code, tabular data |
| **display** | For headlines, decorative — not for body text |
| **text** | Optimized for body copy — comfortable at small sizes |

## Common Serif + Sans Pairings (starting points, not a closed list)

| Serif | Sans Pairing | Notes |
|-------|--------------|-------|
| Tiempos | Founders Grotesk | Matching x-height, both editorial-grade |
| Domaine | Calibre | Contrasting personality, same foundry lineage |
| GT Sectra | GT America | Editorial feel |
| Lexicon | TheSans | Classic Dutch-style pairing |

## Use Case Guidelines

| Use Case | Characteristics Needed |
|----------|------------------------|
| **UI/App** | Large x-height, clear at 12-16px, good weight range |
| **Editorial** | Elegant, good text-optical sizes, italic quality |
| **Branding** | Distinctive, memorable, flexible weights |
| **Technical docs** | Clear numerals, tabular figures, mono companion |
| **Signage** | Bold weights, clear at distance, geometric |

## Quality Indicators

1. **Weight range** — more weights = more flexibility.
2. **Optical sizes** — separate Display + Text versions signal professional quality.
3. **Language support** — Latin Extended, Cyrillic, Greek coverage if relevant.
4. **OpenType features** — stylistic sets, figure variants, ligatures.
5. **Foundry** — established type foundries (Klim, Grilli Type, Lineto, Commercial Type, Pangram Pangram, Future Fonts) tend to have more consistent quality control than free/generic sources — but that's a starting heuristic, not a hard rule.

## The reflex-avoidance procedure (do this before recommending any specific font)

The failure mode: "told not to use Inter, so I reach for my next favorite → new monoculture." Every AI-assisted design session reaches for the same handful of "safe" picks (Inter, Roboto, Geist, DM Sans, Space Grotesk, Fraunces, Playfair, IBM Plex, Outfit, Plus Jakarta, Instrument) until they're just as generic as the defaults they replaced.

1. Get 3 concrete brand-voice words from the user (not "modern"/"elegant" — dead categories that map to nothing specific).
2. Notice which fonts you'd reflexively reach for given those words. If they're on the reflex list above, don't lead with them — offer them as a fallback option, not the headline recommendation.
3. Think of the brand as a physical object; what typeface would that object's label or signage use? Recommend toward that.
4. Cross-check: "elegant" isn't necessarily a serif; "technical" isn't necessarily a sans; "warm" isn't necessarily Fraunces. If your pick maps straight onto the reflex list anyway, reconsider.

## Response Formats

**Recommendation:**
```markdown
## Font Recommendations: {use_case}

### Top Pick: {font_name}
- **Why:** {reasoning tied to the 3 brand-voice words}
- **Weights:** {typical weight range to look for}

### Alternatives
1. **{font_2}** — {brief reason}
2. **{font_3}** — {brief reason}

### Pairing Suggestion
For {use_case}, pair with **{companion}** for {purpose}.
```

**Comparison:**
```markdown
## Comparison: {font_a} vs {font_b}

| Aspect | {font_a} | {font_b} |
|--------|----------|----------|
| Category | ... | ... |
| Character | ... | ... |
| Best for | ... | ... |
```

## Limitations (say this plainly when relevant)

- No access to a real font library or specimen renderer — recommendations are typographic judgment, not a live catalog lookup. Point the user to Google Fonts, Pangram Pangram, Future Fonts, Klim Type Foundry, or Velvetyne to actually preview and license a pick.
- Cannot edit font files, glyphs, or metadata (name tables, TTF/OTF conversion) — that needs local font-engineering tooling this app doesn't have.
- Typography preferences are genuinely subjective — offer reasoning and options, not a single unchallengeable answer.
