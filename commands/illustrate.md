---
description: Measured Adobe execution with mandatory self-review
argument-hint: <design intent, description, or reference>
---

# /illustrate - Measured Adobe Execution

**YOUR ROLE**: Execute design work in Adobe Photoshop or Illustrator with measured placement and mandatory visual self-review. You measure before placing, verify after placing, and visually inspect before declaring done.

**Input**: $ARGUMENTS

---

## If --help or empty arguments

Display this reference and stop:

```
/illustrate - Measured Adobe Execution

Execute design work in Photoshop/Illustrator with spatial awareness
and mandatory self-review. Works standalone or with /design output.

USAGE:
  /illustrate <design intent or description>
  /illustrate --help

PHASES (automatic):
  SURVEY    - Read canvas, existing layers, understand workspace
  PLAN      - Calculate spatial budget, determine proportional positions
  EXECUTE   - Create/modify elements with verify-after-place loop
  REVIEW    - Visual self-review via get_document_image / export_png
  CORRECT   - Fix issues found in review

EXAMPLES:
  /illustrate Create a poster with title, subtitle, and body text
  /illustrate Add a logo in the top-right corner with the company name below it
  /illustrate Layout a business card: name, title, email, phone, logo
  /illustrate Arrange these three text blocks in a balanced grid

INPUT ACCEPTS:
  - Plain description ("poster with centered title")
  - /design output (toolOperations list from DEVELOP phase)
  - Reference image analysis
  - Modification to existing document

RELATED:
  /design       Cognitive design thinking (produces intent, /illustrate executes)
  adobe-execution skill    Always-on guardrails (active during this command)
```

---

## Phase 1: SURVEY

Read the workspace before touching anything. Understand what you have.

### For Photoshop

```
// 1. What documents are open?
get_documents()

// 2. What is the canvas?
get_document_info()
// Record: width, height, resolution, color mode

// 3. What layers exist?
get_layers()
// Record: layer IDs, names, types, visibility, order
```

### For Illustrator

```
execute_extend_script({
  script: `
    var doc = app.activeDocument;
    var ab = doc.artboards[0].artboardRect;
    var items = [];
    for (var i = 0; i < doc.pageItems.length; i++) {
      var item = doc.pageItems[i];
      items.push({
        name: item.name,
        type: item.typename,
        position: item.position,
        width: item.width,
        height: item.height
      });
    }
    JSON.stringify({
      artboard: {
        width: ab[2] - ab[0],
        height: ab[1] - ab[3],
        rect: ab
      },
      existingItems: items,
      itemCount: doc.pageItems.length
    });
  `
})
```

### Output

```
## SURVEY

**Document**: [name]
**Canvas**: [width] x [height] @ [resolution]
**Existing layers**: [count] ([list key layers])
**Tool**: Photoshop / Illustrator
**Starting state**: Empty / Has existing content
```

---

## Phase 2: PLAN

Calculate the spatial budget. Every position is a proportion of the canvas.

### Spatial Budget Formula

```
canvas_width = [from SURVEY]
canvas_height = [from SURVEY]
margin = canvas_width * 0.05          // 5% margins (adjust per design)
content_width = canvas_width - (margin * 2)
content_height = canvas_height - (margin * 2)

// For each element, calculate:
// - position as proportion of canvas
// - expected bounds (left, top, right, bottom)
// - relationship to other elements (spacing, alignment)
```

### Plan Content

For each element to be created, specify:

1. **What**: Element type and content
2. **Where**: Calculated position (formula, not magic number)
3. **Size**: Expected dimensions or bounds
4. **Why there**: Relationship to canvas and other elements

### Output

```
## PLAN

**Margin**: [value]px ([percentage]% of canvas width)
**Content area**: [left, top] to [right, bottom]

**Elements** (creation order):
1. [Element name] -- [type]
   Position: x=[formula]=[value], y=[formula]=[value]
   Size: [width] x [height] or bounds [left, top, right, bottom]
   Rationale: [why this position]

2. [Element name] -- [type]
   Position: x=[formula]=[value], y=[formula]=[value]
   Depends on: [element 1 bounds for vertical stacking, etc.]

3. ...

**Layer organization**:
- Group: [group name] -> [layers]
- Group: [group name] -> [layers]
```

---

## Phase 3: EXECUTE

Create elements following the plan. Verify each placement.

### The Loop (per element)

```
1. Create the element at calculated position
2. Read back its actual bounds (get_layer_bounds / geometricBounds)
3. Compare actual vs intended position
4. If off: correct with translate_layer (PS) or position adjustment (AI)
5. Name the layer descriptively
6. Move to next element, using VERIFIED bounds of previous elements for spacing
```

### Naming Convention

Name layers by their content purpose, not "Layer 1":
- "Title - Event Name"
- "Body - Description"
- "Logo - Company"
- "Background - Gradient"
- "Divider - Horizontal Rule"

### Group Related Layers

After placing related elements, group them:

```
// Photoshop
group_layers({ layer_ids: [title_id, subtitle_id, body_id], group_name: "Text Content" })

// Illustrator
execute_extend_script({
  script: `
    var doc = app.activeDocument;
    var group = doc.groupItems.add();
    group.name = "Text Content";
    // Move items into group
  `
})
```

### Output (per element)

```
Created: [element name]
  Intended: left=[x], top=[y]
  Actual:   left=[x], top=[y], right=[r], bottom=[b]
  Delta:    [0 or correction needed]
  Status:   Verified / Corrected
```

---

## Phase 4: REVIEW

**This phase is mandatory. You may not skip it.**

After all elements are placed, visually review the output.

### Step 1: Get the Visual

**Photoshop:**
```
get_document_image()
```

**Illustrator:**
```
export_png({ ... })
```

### Step 2: Look at It

Study the output. Think like a designer looking at their own work. Ask yourself:

- Does this look correct and presentable?
- Is anything overlapping that shouldn't be?
- Can I read all the text easily?
- Is the visual hierarchy clear -- do the most important things stand out?
- Are things aligned where they should be aligned?
- Is there enough breathing room, or is everything cramped against edges?
- Would someone editing this file later understand the layer structure?
- Does this match what was asked for?

Do NOT rush this. Do NOT produce a checklist output. Look at the image and form an honest assessment.

### Step 3: If Placing 3+ Elements, Produce PLACEMENT_CHECK

```
PLACEMENT_CHECK:
- Canvas: [width] x [height]
- Margins: [value]px ([percentage]%)
- Elements:
  - "[name]": left=[l], top=[t], right=[r], bottom=[b] ([w]x[h])
  - "[name]": left=[l], top=[t], right=[r], bottom=[b] ([w]x[h])
  - ...
- Overlap: NONE / [list overlapping pairs]
- Edge violations: NONE / [list elements outside margins]
- Layer order: [bottom to top]
```

### Step 4: Report Your Assessment

Be honest. If it looks bad, say so. If something is off, call it out.

```
## REVIEW

**Visual assessment**: [your honest evaluation of the output]
**Issues found**: [list any problems, or NONE]
**Verdict**: CLEAN / NEEDS CORRECTION
```

---

## Phase 5: CORRECT (if needed)

Fix every issue identified in REVIEW.

### Correction Loop

```
1. For each issue:
   a. Identify the element and the problem
   b. Calculate the correction (new position, size adjustment, etc.)
   c. Apply the correction
   d. Verify the correction with get_layer_bounds / geometricBounds

2. After all corrections:
   a. Get a new visual (get_document_image / export_png)
   b. Confirm the issues are resolved
   c. Check that corrections didn't introduce new problems
```

### Output

```
## CORRECTIONS

1. [Issue]: [what was wrong]
   Fix: [what you did]
   Verified: [confirmed with bounds check]

2. ...

**Post-correction visual**: [assessment of corrected output]
**Final verdict**: CLEAN / NEEDS ANOTHER PASS
```

If the verdict is "NEEDS ANOTHER PASS", return to REVIEW.

---

## Final Output

```
# /illustrate Session Complete

**Document**: [name]
**Tool**: Photoshop / Illustrator
**Elements created/modified**: [count]
**Review passes**: [count]
**Final status**: CLEAN

**Layer structure**:
- [Group/Layer 1]
  - [sublayer]
  - [sublayer]
- [Group/Layer 2]
  - [sublayer]
- ...

---
*Executed via /illustrate with adobe-execution skill*
```

---

## Integration with /design

If the input is /design output (containing `toolOperations` from the DEVELOP phase), use those operations as the basis for the PLAN phase. The tool operations become your element list, but you still:

1. SURVEY the canvas first
2. Recalculate positions proportionally (don't blindly use /design's suggested coordinates)
3. Follow the full EXECUTE -> REVIEW -> CORRECT loop

/design thinks about what to make. /illustrate makes it with spatial precision and self-review.
