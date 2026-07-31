# Preference: Typography Mono — the earned-slot discipline

## Verbatim

> Mono should be RARE. It should EARN its slot. Eyebrows, footnotes, axis chrome, terminal-style readouts. That's the entire allowed list.

## What this is about

The positive companion to `~/.claude/docs/concepts/design-contract/rants/typography-mono.md`. The rant catalogs failure modes; this file catalogs the **six places mono actually belongs.**

Read both. The rant tells you when not to. This file tells you when yes — and what makes the yes correct in execution, not just permitted.

The default is: **the body sans is the workhorse of the page.** Mono appears only when a string is structurally NOT prose, AND the mono register adds information that body sans would not — typically: "this is a chip / tag / unit / fixed-width readout, treat it as a separate visual category."

---

## The six earned slots



### 1. Tags / chips

Single tokens in a chip role. Anchor identifiers ("A", "B", "X"), arm names ("n=33"), week markers ("wk 24").

```css
.dp-tag {
  font-family: 'Brown Mono LL', ui-monospace, monospace;
  font-size: 0.6875rem;
  letter-spacing: 0;            /* general mono use: no added tracking */
  color: var(--color-ink-mute);
  font-variant-ligatures: none;
}
```

Maximum ~8 characters. If the tag is longer than that, it's a label — and labels with sentence shape go in body sans.

### 2. Units

Pure unit strings rendered as their own visual element, separated from a numeric value.

```html
<span class="metric-value">7.21</span>
<span class="metric-unit">mg</span>
```

The number is in the display family (Ivar Display or similar). The unit is mono. This split is the whole reason mono is earned here — the unit is *categorically different* from the number, so they're different families.

If the unit is part of inline prose ("the dose is 7.21 mg of retatrutide"), do NOT split — the whole sentence is body sans.

### 3. Chart axis chrome

SVG axis ticks, axis labels, gridline value labels inside data visualizations.

```css
.chart-axis-tick {
  font-family: 'Brown Mono LL', ui-monospace, monospace;
  font-size: 11px;
  letter-spacing: 0;            /* general mono use: no added tracking */
  fill: var(--color-ink-mute);
}
```

This is a tabular-data context. Mono is correct because the axis labels are aligned by digit position — even-width digits matter visually.

(Alternative: body sans + `font-variant-numeric: tabular-nums` works equally well in some font families. If the body sans has a tabular-figures variant, prefer it. Don't reach for mono just because there are numbers.)

### 4. Terminal / code blocks

Actual quoted artifacts in a terminal-panel register, syntax-highlighted code samples, command-line snippets.

```html
<pre class="terminal-panel">
$ bun run dev
&gt; Server ready on http://localhost:3000
</pre>
```

This is the original use case for monospaced fonts. It's also the one place the entire body of a block can be mono — because the content is, materially, code-shaped artifact and the reader expects mono.

The terminal-panel is also typically a different surface (dark, framed, distinct from the page register) so the mono register reads as "this is a quoted artifact" not "this is the page's voice."
### 5. Earned Eyebrows

THIS IS NOT A OPEN OFFER TO PLANT EYEBROWS EVERYWHERE. EYEBROWS ARE SPARSE USE, NEVER USED ABOVE DISPLAY HEADINGS. NEVER DEPLOYED EN MASS UNLESS DIRECT. SEEK APPROVAL FOR EYEBROW USE.

```css
.dp-eyebrow {
  font-family: 'Brown Mono LL', ui-monospace, monospace;
  font-size: 0.6875rem;        /* 11px */
  letter-spacing: 0.02em;       /* all-caps label max — Brown Mono LL needs no more */
  text-transform: uppercase;
  color: var(--color-accent);
  font-feature-settings: 'liga' 0, 'dlig' 0, 'hist' 0, 'calt' 0;
  font-variant-ligatures: none;
}
```

Maximum 2 words. If it's a sentence, it's not an eyebrow.

### 6. Footnote / source-citation eyebrow tags

Where a citation block has a small uppercase label introducing it ("PRIMARY SOURCE", "EVIDENCE", "TRIAL"), the LABEL is mono. The citation prose itself ("Jastreboff 2023 NEJM 389:514-526") is body sans italic.

```html
<aside class="citation">
  <span class="citation-tag">PRIMARY</span>
  <p class="citation-body">Jastreboff AM, Kaplan LM, Frías JP, et al. <em>NEJM</em> 2023;389:514-526.</p>
</aside>
```

This is where the trained reflex commonly fails — it puts the entire citation in mono because "it's a citation, that's data-shaped." It is not. A citation is prose with structured fields. Body sans italic at small size, with the leading tag in mono.

---

## What makes a mono use correct in execution

Beyond being in one of the six slots, the mono use has to be technically correct:

1. **OpenType features explicitly disabled** — see the rant for the `hist` / long-`s` failure mode in Brown Mono LL specifically. Always include `font-variant-ligatures: none` and `font-feature-settings: 'liga' 0, 'dlig' 0, 'hist' 0, 'calt' 0` on any mono-using selector, OR on a parent `.mono-register` rule that all mono selectors live inside.
2. **No added tracking in general use** — Brown Mono LL is already wide and needs none. Zero letter-spacing on tags, units, axis chrome, and terminal text. The ONLY exception is all-caps labels (eyebrows), which take **0.02em max**. Anything more reads as "trying to look technical."
3. **Percent sign uses the body-sans glyph** — Brown Mono LL's `%` is poorly drawn. Anywhere a `%` appears in a mono context (axis labels, tags like `4.2%`, readouts), render the percent sign in the body sans (e.g. Brown LL) while the number stays mono: `<span class="pf-pct">%</span>`. The number is mono; the `%` is not.
4. **Fallback chain includes `ui-monospace`** — not just `monospace` (which is too coarse). The chain `'Brown Mono LL', ui-monospace, monospace` resolves to system mono fallback before hitting browser default.
5. **Size discipline** — mono renders heavier than body sans at the same nominal size. A mono tag at 11px reads like body at 13px in apparent weight. Adjust visual size accordingly; don't size mono and body the same and expect them to match.
6. **Color discipline** — mono usually wants a softer color than body ink. Default to `--color-ink-mute` for tags and eyebrows; reserve full ink-strong for the body voice.

---

## The audit / counts ratio

Count mono `font-family` declarations per stylesheet. The rule of thumb:

| Stylesheet scope | Acceptable mono count |
|---|---|
| Single-component CSS (a few hundred lines) | 1–4 |
| Page-level CSS (full page, multiple panels) | 5–10 |
| Whole-app CSS module | < 15 |

If the count is higher, mono has stopped being earned and started being default. Audit each declaration against the six slots; if it doesn't fit one, rewrite it as body sans.

---

## Cross-references

- The rant: `~/.claude/docs/concepts/design-contract/rants/typography-mono.md`
- Project-specific selection: each project's `.claude/aesthetic.md` "Mono register" section
- Sibling preference (font selection generally): `~/.claude/docs/concepts/design-contract/preferences/typography-fonts.md`
- Junction discipline (what to do AFTER you've picked the font register): `~/.claude/docs/concepts/design-contract/preferences/typography-spacing.md`
