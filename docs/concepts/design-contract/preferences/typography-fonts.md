# Preference: Typography Fonts — the premium set

## Verbatim

> Font selection is premium, from my fonts folder `/Users/adilkalam/Library/Mobile Documents/com~apple~CloudDocs/Downloads/Fonts/`. Fonts I like and have used:
>
> **Sans Serifs:** Supreme LL, Brown LL, Lab Grotesque, Circular XX, GT Cimtype [Cinetype], Avenir Pro, Sharp Sans No 2
> **Serifs:** GT Panteheon [Pantheon], GT Sectra, Domaine, Minion Pro, Ivar, Tiempos
> **Display:** Domaine Sans Display, Domaine Display, GT Super Display, OGG, Sang Bleu Serif
> **Mono:** Brown Mono LL, Lab Grotesque Mono, GT Cincetype [Cinetype] Mono, Unica77 Mono
>
> I almost always pick from this set; can always add others.

## Typos noted & normalized

Two typos in the verbatim list have been normalized against the actual Grilli Type folder:
- "GT Panteheon" → **GT Pantheon** (confirmed at `Grilli Type/GT Pantheon/`)
- "GT Cimtype" and "GT Cincetype" → **GT Cinetype** (confirmed at `Grilli Type/GT Cinetype 3.002/`)

Preserved in verbatim block above so the original text is recorded. Normalized names used in the working list below.

## The working set

### Sans Serifs

| Font | Foundry | Folder path |
|---|---|---|
| Supreme LL | Lineto | `Lineto/` |
| Brown LL | Lineto | `Lineto/` |
| Lab Grotesque | Letters from Sweden | `Letters from Sweden/` |
| Circular XX | Lineto | `Lineto/` |
| GT Cinetype | Grilli Type | `Grilli Type/GT Cinetype 3.002/` |
| Avenir Pro | Linotype | `Linotype/` |
| Sharp Sans No 2 | Sharp Type | `Sharp Type/` |

### Serifs

| Font | Foundry | Folder path |
|---|---|---|
| GT Pantheon | Grilli Type | `Grilli Type/GT Pantheon/` |
| GT Sectra | Grilli Type | `Grilli Type/GT Sectra 3.002/` |
| Domaine | Klim Type Foundry | `Klim Type Foundry/` |
| Minion Pro | Adobe | `[Adobe] Fonts/` |
| Ivar | Letters from Sweden | `Letters from Sweden/` |
| Tiempos | Klim Type Foundry | `Klim Type Foundry/` |

### Display

| Font | Foundry | Folder path |
|---|---|---|
| Domaine Sans Display | Klim Type Foundry | `Klim Type Foundry/` |
| Domaine Display | Klim Type Foundry | `Klim Type Foundry/` |
| GT Super Display | Grilli Type | `Grilli Type/GT Super 2.000/` |
| OGG | Sharp Type | `Sharp Type/` |
| Sang Bleu Serif | Swiss Typefaces | `Swiss Typefaces/` |

### Mono

| Font | Foundry | Folder path |
|---|---|---|
| Brown Mono LL | Lineto | `Lineto/` |
| Lab Grotesque Mono | Letters from Sweden | `Letters from Sweden/` |
| GT Cinetype Mono | Grilli Type | `Grilli Type/GT Cinetype 3.002/` |
| Unica77 Mono | Lineto | `Lineto/` |

## How the spine uses this

This is a **preference**, not a refusal. Different shape from `banned/fonts.md`.

When a font is needed and the project doesn't specify one:

1. **Default reach**: pick from this set. Match the role (sans/serif/display/mono) to the type task (body/heading/display-callout/code).
2. **Propose, don't pick**: when multiple fonts from the set would fit, propose 2-3 and let the user choose. Don't auto-select.
3. **Cross-check against refusals**: no font from this set appears in `banned/fonts.md` — the sets are deliberately disjoint. If a proposed font appears in both, something's wrong.
4. **"Can always add others"**: this list isn't closed. If the project's register genuinely calls for a font outside the set, it's allowed — but the addition should be justified and documented in the project's `aesthetic.md`, not reached for silently.

## Detection

| Signal | Detection | Action |
|---|---|---|
| Generated CSS uses a font NOT in this set AND NOT in project-specific override | `font-family:` declarations checked against preferred list | Flag: "consider a font from the preferred set — see `typography-fonts.md`" |
| Generated CSS uses a font in this set | `font-family:` matches an entry | Allow; reinforces the preference |
| Generated CSS uses a font from `banned/fonts.md` refused list | `font-family:` matches refused (Geist, Inter, DM Sans, etc.) | P0 refuse |
| Project declares a different font in `aesthetic.md` | Project override | Project wins; spine defers |

## Companion principle

This set exists because these fonts have been **used and tested** — Adil has worked with them on real projects and trusts their behavior at different sizes, weights, and contexts. The spine preferring them isn't about them being "the best fonts" abstractly; it's about them being the **known quantities** in this user's toolkit. An LLM reaching into the known-quantity set is making a less risky choice than reaching into the full universe of type.

## Path reference

All of these live at:

```
/Users/adilkalam/Library/Mobile Documents/com~apple~CloudDocs/Downloads/Fonts/
```

When the detector or spine needs to verify a font exists before proposing it, check against that path. When a web project needs to ship a font, the user's working copy is at that location and can be loaded via `@font-face` from a project-local copy.

Font licenses: check `typefacelicense.typeface-license` in the fonts root before shipping any commercial project. Several of these (Domaine, Tiempos, Sang Bleu, OGG, Sharp Sans) are licensed fonts — commercial use has cost implications.
