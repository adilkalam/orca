---
name: adobe-execution
description: >
  Measure-place-verify guardrails for Adobe Photoshop and Illustrator MCP work.
  Prevents blind placement, text fragmentation, coordinate confusion, and
  layer spaghetti. Forces visual self-review before declaring done.
---

# Adobe Execution Skill

RULE: Never place without measuring. Never declare done without looking.

## Core Principle

Every element you create has a position. Every position is verifiable. You MUST verify positions after placement, not assume they are correct. The loop is: **measure canvas -> plan positions -> place element -> verify position -> correct if wrong -> repeat -> visually review -> fix issues -> done.**

## Mental Model

Think of a canvas as a spatial budget. Before placing anything, you need to know:

1. **Canvas dimensions** -- How much space exists (width, height)
2. **Existing elements** -- What is already placed and where
3. **Margins** -- Safe zones from edges (proportional, not fixed)
4. **Relationships** -- How elements relate spatially (centered, stacked, grouped)

Every placement decision is a proportion of the canvas, not a magic number.

---

## Rule 1: Measure Before You Place

Read the canvas dimensions and existing layer positions BEFORE creating any element.

### Photoshop

**WRONG:**
```
create_single_line_text_layer({ text: "Title", position: { x: 100, y: 50 }, fontSize: 48 })
create_single_line_text_layer({ text: "Subtitle", position: { x: 100, y: 120 }, fontSize: 24 })
// Where did 100, 50 come from? What if the canvas is 400px wide? 4000px wide?
```

**RIGHT:**
```
// Step 1: Read canvas
get_document_info()
// Returns: { width: 1200, height: 800, ... }

// Step 2: Calculate proportional positions
// margin = width * 0.05 = 60px
// title_x = margin = 60
// title_y = height * 0.08 = 64
// subtitle_y = title_y + fontSize + (height * 0.02) = 64 + 48 + 16 = 128

// Step 3: Place with calculated values
create_single_line_text_layer({ text: "Title", position: { x: 60, y: 64 }, fontSize: 48 })
create_single_line_text_layer({ text: "Subtitle", position: { x: 60, y: 128 }, fontSize: 24 })
```

### Illustrator

**WRONG:**
```
execute_extend_script({
  script: `
    var doc = app.activeDocument;
    var text = doc.textFrames.add();
    text.contents = "Title";
    text.position = [100, 700];
  `
})
// 100, 700 means nothing without knowing the artboard size
```

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

    // Return measurements for verification
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

**WRONG:**
```
create_single_line_text_layer({ text: "Title", position: { x: 60, y: 64 }, fontSize: 48 })
// Immediately move on. Assume it worked.
create_single_line_text_layer({ text: "Next element", ... })
```

**RIGHT:**
```
create_single_line_text_layer({ text: "Title", position: { x: 60, y: 64 }, fontSize: 48 })

// Verify: read back the actual bounds
get_layer_bounds({ layer_id: <title_layer_id> })
// Returns: { left: 60, top: 64, right: 280, bottom: 112 }
// Actual width = 220, actual height = 48. Position confirmed.

// NOW use the verified bounds to calculate next element position
// next_y = bottom + gap = 112 + 16 = 128
create_single_line_text_layer({ text: "Subtitle", position: { x: 60, y: 128 }, fontSize: 24 })
```

### Illustrator

**RIGHT:**
```
execute_extend_script({
  script: `
    var doc = app.activeDocument;
    // After placing elements, verify all positions
    var results = [];
    for (var i = 0; i < doc.pageItems.length; i++) {
      var item = doc.pageItems[i];
      results.push({
        name: item.name || ("item_" + i),
        position: item.position,
        width: item.width,
        height: item.height,
        bounds: item.geometricBounds // [left, top, right, bottom]
      });
    }
    JSON.stringify(results);
  `
})
```

---

## Rule 3: Use Multi-Line Text, Not Line-Per-Box

Paragraphs go in ONE multi-line text layer, not one text layer per line.

### Photoshop

**WRONG:**
```
create_single_line_text_layer({ text: "This is the first line of a paragraph.", position: { x: 60, y: 200 }, fontSize: 16 })
create_single_line_text_layer({ text: "This is the second line of a paragraph.", position: { x: 60, y: 220 }, fontSize: 16 })
create_single_line_text_layer({ text: "This is the third line of a paragraph.", position: { x: 60, y: 240 }, fontSize: 16 })
// Three separate text layers for one paragraph. Uneditable mess.
```

**RIGHT:**
```
// Use create_multi_line_text_layer with bounds that define the text area
create_multi_line_text_layer({
  text: "This is the first line of a paragraph. This is the second line of a paragraph. This is the third line of a paragraph.",
  bounds: { left: 60, top: 200, right: 540, bottom: 400 },
  fontSize: 16,
  justification: "LEFT"
})
// One text layer. Text wraps within the bounds. Editable.
```

**When to use which:**
- `create_single_line_text_layer` -- Headings, labels, single short strings
- `create_multi_line_text_layer` -- Body copy, descriptions, any text that should wrap

### Illustrator

**WRONG:**
```
execute_extend_script({
  script: `
    var doc = app.activeDocument;
    var lines = ["Line one.", "Line two.", "Line three."];
    for (var i = 0; i < lines.length; i++) {
      var t = doc.textFrames.add();
      t.contents = lines[i];
      t.position = [100, 700 - (i * 20)];
    }
  `
})
```

**RIGHT:**
```
execute_extend_script({
  script: `
    var doc = app.activeDocument;
    var ab = doc.artboards[0].artboardRect;
    var margin = (ab[2] - ab[0]) * 0.05;

    // Create area text frame (bounded, wraps text)
    var textRect = doc.pathItems.rectangle(
      ab[1] - (ab[1] - ab[3]) * 0.3,  // top
      ab[0] + margin,                   // left
      (ab[2] - ab[0]) * 0.6,           // width
      (ab[1] - ab[3]) * 0.4            // height
    );
    var areaText = doc.textFrames.areaText(textRect);
    areaText.contents = "Line one. Line two. Line three. The text wraps naturally within the area frame.";
    areaText.textRange.characterAttributes.size = 16;
  `
})
```

---

## Coordinate System Reference

### Photoshop
- **Origin**: Top-left corner of canvas
- **X axis**: Left to right (positive = right)
- **Y axis**: Top to bottom (positive = DOWN)
- **get_layer_bounds**: Returns `{ left, top, right, bottom }` in canvas coordinates
- **translate_layer**: `y_offset` positive = **UP** (INVERTED from the bounds coordinate system)

**This WILL bite you.** If a layer is at `top: 200` and you want to move it to `top: 150`, you need `y_offset: 50` (positive, because UP in translate = negative in canvas coords).

```
// Layer is at top: 300, want it at top: 200
// Delta in canvas coords: 200 - 300 = -100 (moving up in canvas)
// translate_layer y_offset: +100 (positive = up)
translate_layer({ layer_id: id, x_offset: 0, y_offset: 100 })
```

### Illustrator (ExtendScript)
- **Origin**: Bottom-left corner of artboard
- **X axis**: Left to right (positive = right)
- **Y axis**: Bottom to top (positive = UP) -- standard math orientation
- **artboardRect**: `[left, top, right, bottom]` where top > bottom
- **position**: `[x, y]` of top-left corner of the item
- **geometricBounds**: `[left, top, right, bottom]`

**The gotcha**: `position[1]` (y) uses the same upward-positive system. A position of `[72, 720]` on a 792pt-tall artboard means the item's top-left is 72pt from the bottom.

---

## Pitfall Catalog

### 1. Blind placement (no canvas read)
Creating elements without knowing canvas dimensions. Positions are meaningless without context.
**Fix**: Always call `get_document_info()` (PS) or read `artboardRect` (AI) first.

### 2. Text fragmentation
Splitting paragraphs into one text layer per line.
**Fix**: Use `create_multi_line_text_layer` (PS) or `areaText()` (AI) for any text that should wrap.

### 3. Position-and-pray
Placing elements without verifying their actual position after creation.
**Fix**: Call `get_layer_bounds` (PS) or read `geometricBounds` (AI) after every placement.

### 4. Layer spaghetti
Layers named "Layer 1", "Layer 2", "Layer 3" with no grouping.
**Fix**: Name every layer descriptively. Group related layers. Use `rename_layers` and `group_layers` (PS) or set `item.name` (AI).

### 5. Coordinate confusion
Using positive y_offset in translate_layer expecting downward movement (it moves UP).
**Fix**: Reference the coordinate system section above. Calculate deltas explicitly.

### 6. Declaring done without looking
Finishing a session without calling `get_document_image` to see the actual result.
**Fix**: ALWAYS visually review before declaring done. See self-review section.

---

## Self-Review Protocol

Before declaring any Adobe session complete, you MUST visually review the output.

### How to Review

**Photoshop:**
```
get_document_image()
// Returns a JPEG snapshot of the current document state
```

**Illustrator:**
```
export_png({ ... })
// Export current state for visual inspection
```

### What to Look For

Do not use a checklist. Look at the output as a designer would and ask yourself:

- Does this look correct and presentable?
- Is anything overlapping that shouldn't be?
- Is the text readable? Is the hierarchy clear?
- Are elements aligned with each other where they should be?
- Is there breathing room (margins, padding) or is everything cramped?
- Would someone editing this later understand the layer structure?

### Scaling by Complexity

**Simple (1-2 elements):** Quick visual check. Glance at the output, confirm nothing is obviously wrong.

**Medium (3-5 elements):** Read layer list, verify no overlap via bounds, then visual check.

**Complex (6+ elements or full layout):** Full review. Read all layer bounds. Check for overlap between adjacent elements. Verify alignment of related elements. Visual check. Fix any issues found. Visual check again after fixes.

### PLACEMENT_CHECK (for 3+ element layouts)

When placing 3 or more elements, produce a placement summary:

```
PLACEMENT_CHECK:
- Canvas: 1200 x 800
- Margins: 60px (5% of width)
- Elements:
  - "Title": left=60, top=64, right=340, bottom=112 (280x48)
  - "Subtitle": left=60, top=128, right=290, bottom=152 (230x24)
  - "Body": left=60, top=180, right=540, bottom=380 (480x200, multi-line)
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

**ALWAYS apply when:**
- Any Adobe Photoshop MCP tool is called
- Any Adobe Illustrator MCP tool is called
- User asks to create, modify, or arrange elements in PS or AI

**Scale the overhead:**
- Single element creation: Measure canvas, place, verify, quick visual check
- Multi-element layout: Full measure-plan-place-verify loop with PLACEMENT_CHECK
- Complex compositions: Everything above plus multiple review passes

**SKIP when:**
- Just opening or saving files
- Querying document info without making changes
- Non-Adobe work
