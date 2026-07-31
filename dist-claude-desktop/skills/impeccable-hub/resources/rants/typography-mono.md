# Rant: Typography — Mono Overuse

## Verbatim

> STOP OVERUSING THE MONO FONT. IT SHOULD RARELY BE USED — LABELS, NEVER WITH EXCESS TRACKING, AND FOR EYEBROWS — WHICH ARE ALSO RARE USE, AND NEVER USED FOR TITLE / DISPLAY FONTS — AND IF WE SHOW HARDCORE TERMINAL OR CODE. THATS IT. IT IS NOT TO BE USED FOR PROSE, EVER.

> TINY abusive use of mono. Things that don't even render correctly. ITS LITERALLY THOUGHTLESS. NOT A SINGLE TOKEN WAS SPENT ON "WHAT SHOULD THIS ACTUALLY BE LAID OUT LIKE FOR A USER TO INTERACT WITH IT" its a dump of choices, nonsensically, in a way that is completely fucking unclear — rooted in part by [where you] do idiotic and insufferable shit like putting mono sublabels into buttons that only add confusion.

## What the rant is actually about

Mono fonts (IBM Plex Mono, Brown Mono LL, JetBrains Mono, Space Mono, etc.) are the trained reflex of "this looks technical, therefore it's data, therefore use mono." The model reaches for mono whenever a string carries a number, a unit, a code-like identifier, or a label that "feels like" data. It's the same family of failure as gradient text and glassmorphism — a decorative move performed without earning a slot.

The trained reflex is so strong that documentation alone has not bound it. Adil has called this out across multiple sessions on multiple projects. Every session, the model adds mono to: button sublabels, footnote citations, descriptive readouts, big numerals, "data-ish" prose paragraphs, redundant chip-plus-label patterns ("7d Weekly"), short identifiers that "feel data-shaped" but are not data.

The pattern Adil is naming: **mono should be RARE. It should EARN its slot. The default for any user-facing string is the body sans, not mono.**

## Hard whitelist — mono is permitted ONLY for

1. **Eyebrows** — uppercase, tracked when labeling required ("REFERENCE WORKBENCH", "PRESS RELEASE") NOT USED ABOVE TITLES/DISPLAY FONTS EVER.
2. **Tags / chips** — short single-token identifiers in a chip role ("A", "B", "X", "n=33", "wk 24")
3. **Units** — pure unit strings on their own ("mg", "%", "bpm")
4. **Chart axis chrome** — SVG axis ticks and labels inside data visualizations
5. **Hardcore terminal/code blocks** — actual quoted artifacts in a terminal-panel register, code samples, syntax-highlighted blocks
6. **Footnote / source-citation eyebrow tags** — short uppercase tag accompanying a citation block, where the tag is the label, not the citation prose

That is the entire allowed list.

## Hard refusals — mono is FORBIDDEN for

- Prose. Ever. Including short prose paragraphs that "feel data-shaped." If it reads as a sentence, it is body sans.
- Citations and source lines. ("Jastreboff 2023 NEJM · NCT04881760"). Use body sans italic at small size.
- Big numbers (the page's hero numerals, calculator outputs, ratio numerals). Use the display serif/sans.
- Long inline labels or descriptive sentences inside chrome.
- Sublabels inside buttons. ("7d Weekly" / "3.5d Twice"). The button label alone, in body sans, is sufficient.
- Sublabels that duplicate the visible value ("Reading as A Trial cohort" — the "A" tag chip is fine; a mono sublabel like "GLP-1 receptor" next to a bold "GLP-1R" name is redundant chrome).
- Anything with a sentence-length subject ("Numbers shift from the trial cohort. Phase 1 SAD was…").
- Calculator metadata strings that read as prose ("steady state · t½ 6 d" reads as prose; only "t½ 6d" alone is a tag).
- Per-row meta strings inside tables when body sans would do ("free fraction 0.22% · half-life derived" — that is prose).

## Tracking discipline

- Mono uppercase eyebrows: max `letter-spacing: 0.08em`. No higher.
- Mono lowercase tags / data: max `letter-spacing: 0.04em`. Default to `0.02em` if unsure.
- Excess tracking is a tell. The user reads it as "this is trying to look technical." Don't.

## OpenType ligature trap

Mono fonts often inherit OpenType feature settings from a parent rule that enables `liga`, `dlig`, `hist`, or stylistic alternates. **Brown Mono LL specifically has a `hist` historical-`s` alternate that fires on `s` followed by another letter and renders as the long-`s` glyph (ſ).** This produces strings like "ſteady ſtate" instead of "steady state." See screenshot evidence — this happened in peptidefox/.

**Rule:** when any selector uses a mono font, explicitly disable advanced OpenType features:

```css
.dp-mono {
  font-family: 'Brown Mono LL', ui-monospace, monospace;
  font-feature-settings: 'liga' 0, 'dlig' 0, 'hist' 0, 'calt' 0;
  font-variant-ligatures: none;
}
```

The page-root rule that enables `ss01` and `ss02` for the body sans ALSO inherits to mono spans unless the mono register explicitly disables them. Always set it.

## Regex-detectable signals

| Pattern | Detection | Severity |
|---|---|---|
| Mono font-family declarations per stylesheet | `grep -c "font-family.*Brown Mono\\|font-family.*ui-monospace"` per file; flag if > 8 | P0 |
| Mono inside non-whitelisted CSS class | mono `font-family` declaration on a class whose name does NOT contain `__eyebrow`, `__tag`, `__unit`, `__chip`, `__axis`, `__footnote`, `__terminal`, `__code` | P0 |
| Mono inside button-content sublabel | `<button>` containing mono-class span that is a sublabel duplicating the button's main label | P0 (the "7d Weekly" pattern) |
| OpenType features not disabled on mono register | mono font-family declaration without `font-variant-ligatures: none` or `font-feature-settings.*'liga' 0` in the same rule or an ancestor `.dp-mono` rule | P1 |
| Excess mono tracking | `letter-spacing` greater than `0.08em` paired with a mono `font-family` | P1 |
| Citation rendered in mono | Selectors containing `citation`, `source`, `footnote-text`, `provenance-text`, `chart-foot-source` paired with mono font-family | P0 |
| Big number in mono | Selectors with `numeral`, `value`, `result`, `metric-value`, `pair-ratio` paired with mono font-family | P0 |

## Substitute moves

- For citations and source lines → **body sans italic at the body-small size.** Reads as quiet provenance, not as fake-data chrome.
- For big numerals → **display serif (Ivar Display, or whatever the project's display family is).** Numerals in serif read as editorial, not as terminal output.
- For "this feels data-shaped" descriptive copy → **body sans regular.** If the copy is a sentence, it's prose. If it's not a sentence, it's a tag — and then it's <8 characters.
- For per-row data inside tables → **body sans, tabular-figures variant** (`font-variant-numeric: tabular-nums`). Same family, but with even-width digits for column alignment. Don't confuse "needs aligned digits" with "needs mono font."

## Failure mode in production

The screenshot evidence from peptidefox `/glp-1/dosing` (May 2026 redesign) shows the failure mode at scale:
- Receptor names ("GIPR") shown twice — once bold-sans, once mono-sublabel ("GIP receptor"), creating redundant chrome.
- Cadence segmented control with mono "tag chips" prefixing every label ("7d Weekly", "3.5d Twice", "3d Every"), every chip noise.
- Header-meta string "steady state · t½ 6 d" rendered in mono with the OpenType `hist` glyph firing, producing "ſteady ſtate" — a mono violation compounded by an OpenType feature inheritance bug.
- Citation lines in mono-style instead of italic-prose ("Coskun 2022 · Cell Metab 34:1234-47").

Any of these patterns appearing in new work is an automatic-fail under this rant.

## Audit script (project-side)

A peptidefox-style project should ship `scripts/audit-design.sh` that runs:
```bash
# Mono count per file
for f in app/styles/components/*.css; do
  count=$(grep -c "font-family.*Brown Mono" "$f")
  if [ "$count" -gt 8 ]; then echo "FAIL: $f has $count mono declarations (cap 8)"; fi
done

# Mono outside whitelist classes
grep -rEn "font-family.*(Brown Mono|ui-monospace)" app/styles/components/ \
  | grep -vE '(__eyebrow|__tag|__unit|__chip|__axis|__footnote|__terminal|__code|__meta|__readout|__cell-mono|__measure-unit|axis-tick)'
# any output = violation
```

The audit should be run before claiming a UI pass is "done." The rule does not bind via documentation alone — it binds when the build refuses to ship the violation.

## When it's NOT a refusal

If the project's `aesthetic.md` explicitly specifies a mono register that goes beyond this whitelist (e.g., a code-editor product where the entire surface is mono by design), the rule is overridden by project context. The default — across every other project — is the whitelist above.

## Cross-references

- Positive catalog of where mono IS earned: `~/.claude/docs/concepts/design-contract/preferences/typography-mono.md`
- Project-specific selection: each project's `.claude/aesthetic.md` "Mono discipline" section
- Adjacent fonts rant (general typography monoculture): `~/.claude/docs/concepts/design-contract/rants/fonts.md`
