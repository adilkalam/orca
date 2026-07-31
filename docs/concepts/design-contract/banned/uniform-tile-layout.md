# Banned: Uniform-tile dashboard layout

## Verbatim

> just horrific layout. I mean what the fuck is this? its ugly (square boxes only) + ITS LITERALLY THOUGHTLESS. NOT A SINGLE TOKEN WAS SPENT ON "WHAT SHOULD THIS ACTUALLY BE LAID OUT LIKE FOR A USER TO INTERACT WITH IT" its a dump of choices, nonsensically, in a way that is completely fucking unclear

## What this ban is actually about

The model's reflex when asked to compose multiple panels on a page is to render every panel as an identical bordered tile in a uniform grid. Same border-radius. Same border weight. Same internal padding. Same eyebrow + title + body + footer chrome. Same size class. Arranged in a 2×N grid with `gap: 1rem` between them.

This is the AI dashboard tell. It's how Vercel, Linear, Notion, and every "modern SaaS" template lays out a "stats overview" or "settings page." It's the trained-data default. It's also the failure mode Adil is naming: "a dump of choices, nonsensically."

The failure has two layers:

1. **No hierarchy through scale.** When every panel is the same size with the same chrome, the user has no signal about which panel is the page's reason to exist vs which is supporting detail vs which is reference depth. Everything reads as equally weighted, which is the same as no weighting.

2. **No compositional thought.** The model treats panel composition as a layout-grid problem ("how do I fit four panels in a 2-col grid"), not as a design-rhythm problem ("which panel leads, which supports, which is depth, where does negative space create the breathing room that lets the eye organize"). The panels become tiles in a wallpaper instead of elements in a composition.

The user is naming this failure as the visible-thoughtlessness of the LLM register. Even when the *content* of the panels is correct and the *typography* is disciplined, a uniform-tile grid says "I didn't think about layout, I just placed things."

## What this is NOT

- Not a refusal of cards or framed panels per se. Framed panels are correct for data exhibits where the frame separates the panel's data-density from the page's reading flow.
- Not a refusal of grids. Grids are correct when the content actually wants to be aligned and compared.
- Not a refusal of consistency. Visual systems benefit from shared tokens (border-radius, padding scale, color palette).

The refusal is specifically: **applying the same panel chrome to every content type on the page, regardless of role, content shape, or hierarchy.**

## The trained-reflex pattern, named

When asked to "build a dashboard / workbench / overview page with N panels," the LLM produces:

```
.panel {
  background: white;
  border: 1px solid var(--line);
  border-radius: 2px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.panel__head { display: grid; grid-template-columns: 1fr auto; }
.panel__eyebrow { /* small uppercase tag */ }
.panel__title { /* serif heading */ }
.panel__body { /* the actual content, almost an afterthought */ }
.panel__foot { /* citation or meta */ }

.workbench { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
```

Every panel uses `.panel`. The page uses `.workbench`. Done.

This is wrong even when each rule is technically defensible. The wrongness is in the uniformity, not in any individual rule.

## Detection signals

| Signal | Detection | Severity |
|---|---|---|
| All panels on a page share the same `.panel` (or `.card`) class with no role-specific extension | grep panel-class usages on a page; if N > 3 instances of the same class with no `--variant` modifier, flag | P1 |
| Equal-weight panel grid (`grid-template-columns: repeat(N, 1fr)` where N ≥ 2 and panels inside have no size differentiation) | grep `repeat\(\s*[2-9]\s*,\s*1fr\s*\)` on a page-level container with N panels of identical shape | P1 |
| Every panel has the same eyebrow + title + body + footer structure | structural pattern across N panels: `__eyebrow` + `__title` + `__body` + `__foot` repeated | P0 (very strong AI-tell signal) |
| No panel has a distinct size class (`--full`, `--lead`, `--detail`, `--inline`, etc.) | absence of any size modifier on panel classes | P1 |
| Page has no "primary canvas" + "reference depth" zones — just one undifferentiated grid | page layout uses one section/grid for everything | P1 |

These are heuristic; visual review is the second layer. A page that fails most of them is the dashboard-tile failure mode.

## What to reach for instead

The composition discipline replaces the layout-grid reflex.

1. **Identify zones, not panels.** A page typically has 2–4 zones with different roles: masthead (controls/navigation), primary canvas (the page's reason to exist), reference depth (data exhibits, tables, supporting figures), footer (citations, metadata). Each zone gets its own composition. Panels inside zones can be uniform; panels across zones should not be.

2. **Hierarchy through scale, not through chrome.** The page hero gets a larger size than supporting detail. A research-grade primary canvas might be a 1.4fr / 1fr split (lead panel wider than supporting panel) instead of 1fr / 1fr.

3. **Reserve framed panels for data-density exhibits.** A trajectory chart, a multi-row table, a chart with axis chrome and citation footer — these earn the framed-panel treatment. The frame separates their data-density from the reading flow.

4. **Use borderless panels for conversational content.** The primary canvas of a research workbench is often best as a borderless `dp-canvas` register: title block + body + hairline footer. The white space around it does the separating work; the frame would over-articulate.

5. **Hairlines are separators.** A horizontal hairline between two content blocks does more compositional work than two separate bordered cards. Use them.

6. **Asymmetry is a tool.** A 1.4fr / 1fr grid with the lead panel left and the support panel right is more composed than 1fr / 1fr. A primary canvas above with a borderless reference table below is more composed than a uniform 2×2 grid.

7. **Think about the page top-to-bottom as a reading experience, not as a tile arrangement.** What lands first? What lands second? What is the reader's eye drawn to and why? The composition answers these.

## Example — the recovery from a failure

A peptidefox `/glp-1/dosing` workbench was built (May 2026) as: parameter surface + 4 identical-shape panels in a 2-col grid (receptor occupancy, plasma curve, trajectory studio, dose escalation). All four panels used the same `.dp-panel` class with the same chrome. The user's response: "horrific layout, square boxes only, dump of choices."

The recraft replaced the 2×2 grid with three zones:

1. **Compact page header** (no floating meta-element)
2. **Primary canvas** — `dp-primary` zone with a 1.4fr / 1fr split. Receptor occupancy on the left as the page hero (wider, page-section title scale, borderless `dp-canvas` register). Plasma curve on the right as supporting detail (narrower, panel scale, borderless). Both share the `dp-canvas` register but different sizes signal different roles.
3. **Reference depth** — `dp-deep` zone with framed `dp-frame` panels for the trajectory studio (data-dense exhibit, deserves the frame) AND a borderless `dp-canvas` for the dose escalation table (the table chrome IS the data, no need for a panel around it).

Audit-detectable changes:
- `dp-panel` class removed entirely; replaced with `dp-canvas` (borderless, primary register) and `dp-frame` (framed, reference-depth register)
- Page-level grids (`dp-primary`, `dp-deep`) instead of one undifferentiated `dp-workbench`
- Distinct size classes per role

The user reaction: that's the right composition.

## When it's NOT a refusal

Some pages are genuinely "a list of equally-weighted cards" — search results, gallery pages, a directory of items. There the uniformity IS the composition. The refusal applies when the page has multiple content types with different roles being flattened into uniform tiles.

## Cross-references

- `~/.claude/docs/concepts/design-contract/banned/generic-ui-defaults.md` — adjacent failure (defaulting to platform-stock UI register)
- `~/.claude/docs/concepts/design-contract/banned/alignment-spacing.md` — adjacent failure (spacing-without-thought, floating elements)
- `~/.claude/docs/concepts/design-contract/preferences/alignment-precision.md` — positive moves on optical alignment
