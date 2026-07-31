---
name: adobe-execution
description: Measure-place-verify guardrails for Adobe Photoshop and Illustrator MCP work. Prevents blind placement, text fragmentation, coordinate confusion, and layer spaghetti. Forces visual self-review before declaring done. Use whenever an Adobe Photoshop or Illustrator MCP tool is involved.
---

# Adobe Execution Skill

RULE: Never place without measuring. Never declare done without looking.

## Core Principle

Every element you create has a position. Every position is verifiable. You MUST verify positions after placement, not assume they are correct. The loop is: **measure canvas -> plan positions -> place element -> verify position -> correct if wrong -> repeat -> visually review -> fix issues -> done.**

## Mental Model

Think of a canvas as a spatial budget. Before placing anything, you need to know:

1. **Canvas dimensions** — how much space exists (width, height)
2. **Existing elements** — what is already placed and where
3. **Margins** — safe zones from edges (proportional, not fixed)
4. **Relationships** — how elements relate spatially (centered, stacked, grouped)

Every placement decision is a proportion of the canvas, not a magic number.

---

## Rule 1: Measure Before You Place

Read the canvas dimensions and existing layer positions BEFORE creating any element.

### Photoshop

**WRONG:**
```
create_single_line_text_layer({ text: "Title", position: { x: 100, y: 50 }, fontSize: 48 })
// Where did 100, 50 come from? What if the canvas is 400px wide? 4000px wide?
```

**RIGHT:**
```
// Step 1: Read canvas
get_document_info()
// Returns: { width: 1200, height: 800, ... }

// Step 2: Calculate proportional positions
// margin = width * 0.05 = 60px; title_y = height * 0.08 = 64

// Step 3: Place with calculated values
create_single_line_text_layer({ text: "Title", position: { x: 60, y: 64 }, fontSize: 48 })
```

### Illustrator

**RIGHT:**
```
execute_extend_script({
  script: `
    var doc = app.activeDocument;
    var ab = doc.artboards[0].artboardRect; // [left, top, right, bottom]
    var abWidth = ab[2] - ab[0];
    var abHeight = ab[1] - ab[3]; // top - bottom (AI y-axis: up is positive)
    var margin = abWidth * 0.05;

    var text = doc.textFrames.add();
    text.contents = "Title";
    text.position = [ab[0] + margin, ab[1] - (abHeight * 0.08)];

    JSON.stringify({
      artboard: { width: abWidth, height: abHeight },
      placed: { x: text.position[0], y: text.position[1], width: text.width, height: text.height }
    });
  `
})
```

---

## Rule 2: Verify After Placement

After placing an element, read its actual position back and confirm it landed where intended.

### Photoshop

```
create_single_line_text_layer({ text: "Title", position: { x: 60, y: 64 }, fontSize: 48 })
get_layer_bounds({ layer_id: <title_layer_id> })
// Returns: { left: 60, top: 64, right: 280, bottom: 112 }
// Use the VERIFIED bounds to calculate the next element's position
```

### Illustrator

```
execute_extend_script({
  script: `
    var doc = app.activeDocument;
    var results = [];
    for (var i = 0; i < doc.pageItems.length; i++) {
      var item = doc.pageItems[i];
      results.push({ name: item.name || ("item_" + i), position: item.position, width: item.width, height: item.height, bounds: item.geometricBounds });
    }
    JSON.stringify(results);
  `
})
```

---

## Rule 3: Use Multi-Line Text, Not Line-Per-Box

Paragraphs go in ONE multi-line text layer, not one text layer per line.

### Photoshop

**WRONG:** three separate `create_single_line_text_layer` calls for one paragraph — uneditable mess.

**RIGHT:**
```
create_multi_line_text_layer({
  text: "This is the first line of a paragraph. This is the second...",
  bounds: { left: 60, top: 200, right: 540, bottom: 400 },
  fontSize: 16,
  justification: "LEFT"
})
```

**When to use which:** `create_single_line_text_layer` for headings/labels/short strings; `create_multi_line_text_layer` for body copy and anything that should wrap.

### Illustrator

Use area text, not a loop of individual text frames:
```
execute_extend_script({
  script: `
    var doc = app.activeDocument;
    var ab = doc.artboards[0].artboardRect;
    var margin = (ab[2] - ab[0]) * 0.05;
    var textRect = doc.pathItems.rectangle(
      ab[1] - (ab[1] - ab[3]) * 0.3, ab[0] + margin,
      (ab[2] - ab[0]) * 0.6, (ab[1] - ab[3]) * 0.4
    );
    var areaText = doc.textFrames.areaText(textRect);
    areaText.contents = "Line one. Line two. The text wraps naturally within the area frame.";
    areaText.textRange.characterAttributes.size = 16;
  `
})
```

---

## Coordinate System Reference

### Photoshop
- **Origin**: top-left corner of canvas
- **X**: left to right (positive = right); **Y**: top to bottom (positive = DOWN)
- `get_layer_bounds`: returns `{ left, top, right, bottom }` in canvas coordinates
- `translate_layer`: `y_offset` positive = **UP** (INVERTED from the bounds coordinate system) — **this will bite you.**

```
// Layer is at top: 300, want it at top: 200
// Delta in canvas coords: 200 - 300 = -100 (moving up)
// translate_layer y_offset: +100 (positive = up)
translate_layer({ layer_id: id, x_offset: 0, y_offset: 100 })
```

### Illustrator (ExtendScript)
- **Origin**: bottom-left corner of artboard
- **X**: left to right; **Y**: bottom to top (positive = UP, standard math orientation)
- `artboardRect`: `[left, top, right, bottom]` where top > bottom
- `position`: `[x, y]` of the item's top-left corner (same upward-positive y system)
- `geometricBounds`: `[left, top, right, bottom]`

**The gotcha**: `position[1]` (y) uses the upward-positive system. A position of `[72, 720]` on a 792pt-tall artboard means the item's top-left is 72pt from the bottom.

---

## Pitfall Catalog

1. **Blind placement (no canvas read)** — positions are meaningless without context. Fix: always `get_document_info()` (PS) or read `artboardRect` (AI) first.
2. **Text fragmentation** — one text layer per line. Fix: `create_multi_line_text_layer` (PS) or `areaText()` (AI).
3. **Position-and-pray** — no verification after creation. Fix: `get_layer_bounds` (PS) / `geometricBounds` (AI) after every placement.
4. **Layer spaghetti** — unlabeled, ungrouped layers. Fix: name every layer descriptively, group related layers.
5. **Coordinate confusion** — positive `y_offset` in `translate_layer` expecting downward movement (it moves UP). Fix: reference the coordinate section above, calculate deltas explicitly.
6. **Declaring done without looking** — finishing without a visual check. Fix: ALWAYS review visually before declaring done.

---

## Self-Review Protocol

Before declaring any Adobe session complete, you MUST visually review the output.

**Photoshop:** `get_document_image()` — returns a JPEG snapshot of the current document state.
**Illustrator:** `export_png({ ... })` — export current state for visual inspection.

### What to Look For

Not a checklist — look at the output as a designer would:
- Does this look correct and presentable?
- Is anything overlapping that shouldn't be?
- Is the text readable? Is the hierarchy clear?
- Are elements aligned with each other where they should be?
- Is there breathing room, or is everything cramped?
- Would someone editing this later understand the layer structure?

### Scaling by Complexity

- **Simple (1-2 elements):** Quick visual check.
- **Medium (3-5 elements):** Read layer list, verify no overlap via bounds, then visual check.
- **Complex (6+ elements or full layout):** Full review — all layer bounds, overlap check between adjacent elements, alignment check, visual check, fix, visual check again.

### PLACEMENT_CHECK (for 3+ element layouts)

Produce a placement summary before declaring done:

```
PLACEMENT_CHECK:
- Canvas: 1200 x 800
- Margins: 60px (5% of width)
- Elements:
  - "Title": left=60, top=64, right=340, bottom=112 (280x48)
  - "Subtitle": left=60, top=128, right=290, bottom=152 (230x24)
  - "Logo": left=1060, top=64, right=1140, bottom=144 (80x80)
- Overlap: NONE
- Edge violations: NONE (all within margins)
- Layer order: [Logo, Body, Subtitle, Title, Background]
```

---

## Anti-Patterns (FORBIDDEN Behaviors)

| Behavior | Why Forbidden |
|----------|---------------|
| Using fixed pixel positions without reading canvas | Positions are meaningless without canvas context |
| One text layer per line of a paragraph | Creates uneditable layer spaghetti |
| Not calling get_layer_bounds after placement | You don't know where the element actually landed |
| Leaving layers as "Layer 1", "Layer 2" | No one can edit this later |
| Positive y_offset in translate_layer expecting down | It goes UP. Check the coordinate reference. |
| Saying "done" without get_document_image | You haven't seen your own output |
| Guessing at overlap ("they should be fine") | Measure bounds. Calculate. Know. |

---

## When to Apply This Skill

**ALWAYS apply when:** any Adobe Photoshop or Illustrator MCP tool is called, or the user asks to create/modify/arrange elements in PS or AI.

**Scale the overhead:** single element (measure, place, verify, quick visual check) → multi-element layout (full measure-plan-place-verify loop with PLACEMENT_CHECK) → complex compositions (everything above plus multiple review passes).

**SKIP when:** just opening/saving files, querying document info without changes, or non-Adobe work.

---

## Setup note for this app

This skill assumes an Adobe Photoshop/Illustrator MCP connector (an `adb-mcp`-style bridge) is connected — see this pack's MCP config for the local server that provides the actual `get_document_info`/`create_*_layer`/`execute_extend_script` tools. Without that connector, this skill has nothing to call; it's a craft-discipline layer on top of those tools, not a substitute for them.
