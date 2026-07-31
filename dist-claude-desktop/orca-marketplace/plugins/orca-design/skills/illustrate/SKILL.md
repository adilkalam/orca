---
name: illustrate
description: Measured Adobe Photoshop/Illustrator execution workflow — survey the canvas, plan proportional placement, execute with verify-after-place, then a mandatory visual self-review before declaring done. Use for any Photoshop or Illustrator composition task via a connected Adobe MCP tool (poster, layout, business card, logo placement, etc.).
---

# Illustrate — measured Adobe execution

Execute design work in Photoshop or Illustrator with measured placement and mandatory visual self-review. This skill is the session workflow; the `adobe-execution` skill (load it too) has the underlying measure/verify guardrails and coordinate-system reference — read both.

**Requires an Adobe Photoshop/Illustrator MCP connector** to actually call `get_document_info`/`create_*_layer`/`execute_extend_script`/`get_document_image`-style tools — see this pack's MCP config for the connector this assumes. Without it, this skill has no tools to call.

## Phase 1: SURVEY

Read the workspace before touching anything.

**Photoshop:**
```
get_documents()               // what's open
get_document_info()           // width, height, resolution, color mode
get_layers()                  // existing layer ids, names, types, order
```

**Illustrator:**
```
execute_extend_script({ script: `
  var doc = app.activeDocument;
  var ab = doc.artboards[0].artboardRect;
  var items = [];
  for (var i = 0; i < doc.pageItems.length; i++) {
    var item = doc.pageItems[i];
    items.push({ name: item.name, type: item.typename, position: item.position, width: item.width, height: item.height });
  }
  JSON.stringify({ artboard: { width: ab[2]-ab[0], height: ab[1]-ab[3], rect: ab }, existingItems: items, itemCount: doc.pageItems.length });
`})
```

Report: document name, canvas dimensions + resolution, existing layer count/key layers, tool, starting state (empty vs has content).

## Phase 2: PLAN

Calculate the spatial budget — every position is a proportion of the canvas, never a magic number.

```
margin = canvas_width * 0.05          // adjust per design
content_width = canvas_width - (margin * 2)
content_height = canvas_height - (margin * 2)
```

For each element: what it is, where (as a formula, not a hardcoded number), expected size/bounds, and why there (relationship to canvas and other elements).

## Phase 3: EXECUTE

Per element, in order:

1. Create the element at the calculated position.
2. Read back its actual bounds (`get_layer_bounds` PS / `geometricBounds` AI).
3. Compare actual vs. intended; correct with `translate_layer` (PS — remember `y_offset` positive is UP, inverted from bounds) or a position adjustment (AI).
4. Name the layer by content purpose ("Title - Event Name"), never "Layer 1".
5. Use the VERIFIED bounds of prior elements — not the planned ones — when positioning the next element relative to it.

Group related layers once placed (`group_layers` PS / `groupItems.add()` AI).

## Phase 4: REVIEW (mandatory — do not skip)

Get the actual visual: `get_document_image()` (PS) or `export_png({...})` (AI). Look at it as a designer would — don't produce a checklist, form an honest assessment:

- Does this look correct and presentable?
- Is anything overlapping that shouldn't be?
- Is the text readable, is hierarchy clear?
- Are things aligned where they should be?
- Enough breathing room, or is it cramped against edges?
- Would someone editing this later understand the layer structure?
- Does this match what was asked for?

If placing 3+ elements, produce a `PLACEMENT_CHECK` block (canvas dims, margins, each element's bounds, overlap check, edge-violation check, layer order — see the `adobe-execution` skill for the exact format).

Report a verdict: CLEAN or NEEDS CORRECTION, with specifics if not clean.

## Phase 5: CORRECT (if needed)

For each issue: identify element + problem, calculate the correction, apply it, verify with a fresh bounds read. Then get a new visual and confirm the issue is resolved and no new one was introduced. If still not clean, return to Phase 4.

## Final Output

Summarize: document, tool, elements created/modified, review passes, final status, and the resulting layer structure (grouped, named).

## Integration with prior design thinking

If you already have a design brief or plan for this composition (e.g. from the `shape` skill), use it as the basis for Phase 2 — but still SURVEY the actual canvas first and recalculate positions proportionally rather than blindly trusting the brief's suggested coordinates.
