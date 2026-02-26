---
description: Creative design thinking for visual/3D work with Photoshop, Illustrator, OpenSCAD
argument-hint: [--stl] <design brief or challenge>
---

# /design - Creative Design Thinking

**YOUR ROLE**: Guide a multi-phase design thinking session from brief to executable concept. You scaffold the cognitive arc from design intent to artifact specification using existing cognition-mcp operations. You do NOT call design tool MCPs directly -- you produce the cognitive framework that bridges thinking to execution.

**Design Brief**: $ARGUMENTS

---

## If --help or empty arguments

Display this reference and stop:

```
/design - Creative Design Thinking

Structured design exploration for visual/3D work.
Uses Photoshop, Illustrator, and OpenSCAD MCPs.

USAGE:
  /design <design brief or challenge>
  /design --help

PHASES (automatic):
  FRAME     - Parse brief, constraints, success criteria
  EXPLORE   - Generate 3-5 design directions (not ideas)
  DEVELOP   - Develop top directions into executable concepts
  EVALUATE  - Structured crit against brief criteria
  ITERATE   - Capture lessons, loop back

FLAGS:
  --stl              STL replication mode (replaces EXPLORE/DEVELOP with 5-step geometry protocol)

EXAMPLES:
  /design Create a brutalist poster for a tech conference
  /design Design a parametric vase in OpenSCAD with organic curves
  /design --stl Replicate Frame.stl storage box in OpenSCAD
  /design Photo composite: surreal landscape with floating architecture
  /design Illustrator logo: geometric animal mark for a coffee brand

RELATED:
  /think --creative   Non-design creative thinking (workarounds, reframing)
  /design-review      Visual quality audit of existing UI
```

---

## Core Principle

> "The thing that makes the thing is more interesting than the thing."

This command designs the PROCESS that produces the artifact. Each phase scaffolds structured thinking so that when you reach tool execution, every decision has a rationale traceable to the brief.

---

## Verbose Flag

Include `verbose: true` in every cognition MCP call from /design. This is a multi-phase interactive command where the user needs to see output from each phase.

---

## Phase 1: FRAME

Parse the design brief into structured constraints. This is where most design work succeeds or fails -- a well-framed brief is half the solution.

Call `mcp__cognition-mcp__cognition`:

```typescript
{
  operation: "thought",
  sessionTitle: "Design: <brief summary>",
  sessionTags: ["design", "<medium>", "creative"],
  verbose: true,
  content: {
    thought: "Framing the design brief...",
    frame: {
      intent: "<what and why -- the purpose of this artifact>",
      constraints: {
        dimensions: "<size, resolution, aspect ratio if applicable>",
        colors: "<palette restrictions, brand colors, or 'open'>",
        brand: "<brand guidelines, tone, existing identity if any>",
        material: "<physical material constraints for 3D, or digital format>",
        technical: "<file format, print vs screen, rendering engine limits>"
      },
      medium: "<raster | vector | 3D | mixed> -- this shapes what's possible",
      emotionalQualities: ["<what should it feel like?>", "<mood, tone, energy>"],
      successCriteria: [
        "<criterion 1: how will we know it's good?>",
        "<criterion 2>",
        "<criterion 3>"
      ],
      antiReferences: ["<what to avoid -- as important as what to pursue>"]
    },
    thoughtNumber: 1,
    totalThoughts: 3,
    nextThoughtNeeded: true
  }
}
```

If the brief is ambiguous or incomplete, make a second `thought` call to surface what is missing and state assumptions explicitly:

```typescript
{
  operation: "thought",
  sessionId: "<sessionId>",
  verbose: true,
  content: {
    thought: "Identifying gaps in the brief...",
    gaps: ["<what the brief doesn't specify>"],
    assumptions: ["<assumption I'm making and why>"],
    questionsForUser: ["<clarifying question if critical information is missing>"],
    thoughtNumber: 2,
    totalThoughts: 3,
    nextThoughtNeeded: true
  }
}
```

**Output**:

```
## Phase: FRAME

**Intent:** [what and why]
**Medium:** [raster/vector/3D]
**Constraints:** [key constraints]
**Emotional Qualities:** [mood/tone]
**Success Criteria:**
- [criterion 1]
- [criterion 2]
- [criterion 3]
**Anti-References:** [what to avoid]

**Next:** EXPLORE -- generate divergent design directions within these constraints
```

---

## Phase 2: EXPLORE

Generate 3-5 design DIRECTIONS. A direction is a conceptual approach, not an idea. "Minimal geometric" vs "organic flowing" vs "brutalist typography" are directions. "Make the text bigger" is not.

Constraint-based creativity: the constraints from FRAME are enablers, not limiters. Narrower constraints produce more interesting creative territory (Stokes 2006).

Call `mcp__cognition-mcp__cognition`:

```typescript
{
  operation: "creative_thinking",
  sessionId: "<sessionId>",
  verbose: true,
  content: {
    prompt: "Generate 3-5 design directions for: <brief summary>. Constraints: <key constraints from FRAME>",
    techniques: ["constraint_as_enabler", "analogy_transfer", "perspective_shift", "inversion"],
    ideas: [
      {
        idea: "Direction 1: <conceptual approach name>",
        potential: "<mood/feeling this direction creates>",
        formLanguage: "<shapes, textures, spatial relationships>",
        paletteHints: "<color direction>",
        referenceNotes: "<what this references or draws from>",
        challenges: ["<what would be hard about this direction>"]
      },
      {
        idea: "Direction 2: <conceptual approach name>",
        potential: "<mood/feeling>",
        formLanguage: "<shapes, textures>",
        paletteHints: "<color direction>",
        referenceNotes: "<references>",
        challenges: ["<challenges>"]
      },
      {
        idea: "Direction 3: <conceptual approach name>",
        potential: "<mood/feeling>",
        formLanguage: "<shapes, textures>",
        paletteHints: "<color direction>",
        referenceNotes: "<references>",
        challenges: ["<challenges>"]
      }
    ],
    synthesis: "These directions span the space from [conservative end] to [experimental end]. The most promising tension is between [direction A] and [direction B].",
    nextThoughtNeeded: true
  }
}
```

**IMPORTANT**: Produce deliberately divergent directions. No premature convergence. If all directions feel similar, you have not explored enough. The Geneplore model says: generate without goal control first, then evaluate.

**ANTI-PATTERN**: Listing generic directions like "modern and clean" or "minimal and elegant" without specificity. Every direction must have concrete form language.

**Output**:

```
## Phase: EXPLORE

### Direction 1: [Name]
**Mood:** [feeling]
**Form:** [shapes, textures, spatial relationships]
**Palette:** [color hints]
**References:** [what this draws from]

### Direction 2: [Name]
...

### Direction 3: [Name]
...

**Synthesis:** [where the tension lives between directions]

**Next:** DEVELOP -- take top 1-2 directions and make them concrete enough to execute
```

---

## Phase 3: DEVELOP

Bridge thinking to tool execution. Take the top 1-2 directions from EXPLORE and develop them into concrete concepts with enough specificity to execute in Photoshop, Illustrator, or OpenSCAD.

Progressive fidelity: sketch-level first, refine later. Do not over-specify on the first pass.

Call `mcp__cognition-mcp__cognition` for each direction being developed (1-2 calls):

```typescript
{
  operation: "thought",
  sessionId: "<sessionId>",
  verbose: true,
  content: {
    thought: "Developing direction: <direction name>",
    concept: {
      visualSpecification: "<detailed description of the final artifact>",
      composition: "<layout, hierarchy, focal points>",
      colorSpecification: "<specific colors with hex values or material descriptions>",
      typographyOrForm: "<typeface choices OR 3D form details>",
      layerStructure: [
        "<layer/component 1: what it contains>",
        "<layer/component 2: what it contains>",
        "<layer/component 3: what it contains>"
      ],
      toolOperations: [
        "<step 1: specific tool operation (e.g., 'Create 1200x800 canvas, #1a1a2e background')>",
        "<step 2: specific tool operation>",
        "<step 3: specific tool operation>"
      ]
    },
    fidelityLevel: "sketch | refined | production",
    thoughtNumber: 3,
    totalThoughts: 5,
    nextThoughtNeeded: true
  }
}
```

If developing a second direction, make an additional call with the same structure.

**Integration with design tool MCPs:**

After developing the concept, specify the execution bridge. The /design command does NOT call tool MCPs directly -- it produces the cognitive framework.

```
To execute this concept in [Photoshop/Illustrator/OpenSCAD], the steps would be:
1. [Specific tool operation with parameters]
2. [Specific tool operation with parameters]
3. [Specific tool operation with parameters]
```

**Output**:

```
## Phase: DEVELOP

### Concept A: [Direction Name] -- Developed
**Visual Spec:** [detailed description]
**Composition:** [layout, hierarchy]
**Colors:** [specific hex values or material descriptions]
**Layer Structure:**
1. [layer/component 1]
2. [layer/component 2]
3. [layer/component 3]

**Tool Execution Plan ([Photoshop/Illustrator/OpenSCAD]):**
1. [specific operation]
2. [specific operation]
3. [specific operation]

### Concept B: [Direction Name] -- Developed (if applicable)
...

**Next:** EVALUATE -- structured crit of concepts against brief criteria
```

---

## Phase 4: EVALUATE

Structured critique. Assess each developed concept against the success criteria defined in FRAME. This is NOT generic pros/cons -- every assessment is tied to a specific criterion from the brief.

Call `mcp__cognition-mcp__cognition`:

```typescript
{
  operation: "decide",
  sessionId: "<sessionId>",
  verbose: true,
  content: {
    statement: "Which developed concept best fulfills the design brief?",
    options: [
      {
        name: "Concept A: <direction name>",
        description: "<brief description of the developed concept>",
        pros: ["<strength tied to specific brief criterion>"],
        cons: ["<weakness tied to specific brief criterion>"]
      },
      {
        name: "Concept B: <direction name>",
        description: "<brief description>",
        pros: ["<strength tied to criterion>"],
        cons: ["<weakness tied to criterion>"]
      }
    ],
    criteria: ["<criterion 1 from FRAME>", "<criterion 2 from FRAME>", "<criterion 3 from FRAME>"],
    analysis: "Assessment against brief criteria:\n- [Criterion 1]: Concept A [score/assessment], Concept B [score/assessment]\n- [Criterion 2]: ...\n- [Criterion 3]: ...",
    choice: "<selected concept>",
    verdict: "<continue | pivot | refine | ship>",
    nextThoughtNeeded: true
  }
}
```

**Verdicts:**
- **ship**: Concept is ready for tool execution
- **refine**: Concept is strong but needs adjustments (loop to DEVELOP)
- **pivot**: Concept misses the brief; return to EXPLORE with new constraints
- **continue**: Need more development before evaluating

**Output**:

```
## Phase: EVALUATE

### Assessment Against Brief Criteria

| Criterion | Concept A | Concept B |
|-----------|-----------|-----------|
| [criterion 1] | [assessment] | [assessment] |
| [criterion 2] | [assessment] | [assessment] |
| [criterion 3] | [assessment] | [assessment] |

**Selected:** [Concept name]
**Verdict:** [ship/refine/pivot/continue]
**Rationale:** [why this verdict]

**Next:** [Based on verdict -- ITERATE if refine/pivot, or proceed to execution if ship]
```

---

## Phase 5: ITERATE (if verdict is refine or pivot)

Capture what changed and determine which phase to return to.

Call `mcp__cognition-mcp__cognition`:

```typescript
{
  operation: "thought",
  sessionId: "<sessionId>",
  verbose: true,
  content: {
    thought: "Iterating on design...",
    iteration: {
      whatChanged: "<what the evaluation revealed>",
      returnTo: "<EXPLORE | DEVELOP>",
      reason: "<why returning to this phase>",
      adjustments: ["<specific adjustment 1>", "<specific adjustment 2>"],
      lessonsFromIteration: ["<what this iteration taught us>"]
    },
    thoughtNumber: 5,
    totalThoughts: 6,
    nextThoughtNeeded: true
  }
}
```

Then execute the phase indicated by `returnTo` with the adjustments applied.

**Output**:

```
## Phase: ITERATE

**What Changed:** [evaluation findings]
**Returning To:** [EXPLORE/DEVELOP]
**Adjustments:**
- [adjustment 1]
- [adjustment 2]
**Lessons:** [what this iteration taught us]
```

---

## --stl Mode: STL Replication Protocol

When `--stl` flag is present, SKIP the 5-phase creative flow (FRAME/EXPLORE/DEVELOP/EVALUATE/ITERATE). Instead, execute this 5-step geometry replication protocol. This is a precision engineering workflow, not a creative exploration.

**The `precision-discipline` skill applies to this entire mode.** Every step has a mandatory artifact, a checkpoint call, and escape hatch detection. Read that skill before proceeding.

### Initialize

Start a cognition session and register the precision constraints:

```typescript
{
  operation: "checkpoint",
  sessionTitle: "STL Replication: <filename>",
  sessionTags: ["design", "stl", "precision"],
  content: {
    command: "design --stl",
    phase: "init",
    addConstraints: [
      { type: "EVIDENCE", text: "Dimension table with source coordinates (Step 2)" },
      { type: "EVIDENCE", text: "Feature transition table (Step 3)" },
      { type: "VERIFY", text: "analyze_stl called on generated STL with same params (Step 5)" },
      { type: "VERIFY", text: "Comparison table: reference vs generated coordinates (Step 5)" },
      { type: "FORBIDDEN", text: "No dimension without source coordinate citation" },
      { type: "FORBIDDEN", text: "No 'approximately', 'should be', 'looks right', 'close enough'" }
    ]
  }
}
```

### Step 1: ANALYZE

**Mandatory artifact**: Full `analyze_stl` output recorded (not summarized).

Call `analyze_stl` on each reference STL part:
- Use `measurements=["basics", "cross_sections", "thickness"]`
- Use `cross_section_axis="z"` (primary axis)
- Use fine `cross_section_heights` at 1-2mm intervals through the full height range
- Record the full output -- polygon vertex coordinates are the source of truth

**Checkpoint after Step 1:**
```typescript
{
  operation: "checkpoint",
  sessionId: "<sessionId>",
  content: {
    phase: "ANALYZE",
    summary: "<number of cross-sections, bounding box, polygon counts>",
    gateCheck: {
      escapeHatchCheck: [true, true, true, true],
      artifactProduced: true,
      notes: "Full analyze_stl output with <N> cross-sections"
    }
  }
}
```

**Escape hatch check**: Did I record the full tool output, or did I summarize it into prose?

### Step 2: EXTRACT

**Mandatory artifact**: Dimension table with these exact columns:

| Dimension | Value | Source Coordinate | Source Slice |
|-----------|-------|-------------------|--------------|
| Outer width | 178.0mm | X: -89.0 to 89.0 | Z=0.0 |
| Wall thickness (X+) | 3.0mm | outer X=89.0, inner X=86.0 | Z=-23.8 |

For each cross-section slice, read the polygon coordinates:
- Exterior coordinate extremes: X_min, X_max, Y_min, Y_max = outer dimensions at this height
- Interior coordinate extremes (from holes/interiors): = inner dimensions at this height
- Per-side wall thickness: `outer_right - inner_right`, `outer_left - inner_left`, `outer_top - inner_top`, `outer_bottom - inner_bottom`
- Corner radius estimation from arc vertices (transition from flat to curved segment)

**Checkpoint after Step 2:**
```typescript
{
  operation: "checkpoint",
  sessionId: "<sessionId>",
  content: {
    phase: "EXTRACT",
    summary: "<number of dimensions extracted with sources>",
    resolveConstraints: ["<EVIDENCE constraint for dimension table>"],
    gateCheck: {
      escapeHatchCheck: [true, true, true, true],
      artifactProduced: true,
      notes: "<N> dimensions, all with coordinate citations"
    }
  }
}
```

**Escape hatch check**: Does every row in the table have both a Source Coordinate and Source Slice? If any cell is empty or says "from analysis", STOP and fill it.

### Step 3: COMPARE SLICES

**Mandatory artifact**: Feature transition table:

| Z Height | Feature | Magnitude | Type |
|----------|---------|-----------|------|
| -15.0mm | Inner wall steps inward | 2.0mm | Ledge |

For each pair of adjacent slices:
- Compare inner and outer coordinate extremes
- Any change > 0.3mm between adjacent slices = feature transition
- Identify: ledges (inner wall steps inward), shelves (inner wall steps outward), slots (exterior notches), clip openings (localized wall removals)

**Checkpoint after Step 3:**
```typescript
{
  operation: "checkpoint",
  sessionId: "<sessionId>",
  content: {
    phase: "COMPARE",
    summary: "<N feature transitions found>",
    resolveConstraints: ["<EVIDENCE constraint for feature transition table>"],
    gateCheck: {
      escapeHatchCheck: [true, true, true, true],
      artifactProduced: true,
      notes: "<N> transitions identified with Z heights"
    }
  }
}
```

### Step 4: WRITE OPENSCAD

**Mandatory artifact**: OpenSCAD code where every dimension has a source citation comment.

```openscad
wall_thickness = 3.0; // outer X=89.0, inner X=86.0, Z=-23.8 slice
outer_width = 178.0;  // X: -89.0 to 89.0, Z=0.0 slice
```

- Every dimension in the OpenSCAD code MUST trace to a specific coordinate from Steps 2-3
- NEVER guess a dimension -- if you can't determine it from coordinates, add an UNKNOWN constraint and ask the user
- Use parametric patterns from the existing codebase (rounded_rect modules, etc.)
- For curves/fillets: estimate from arc vertices, note the estimation in a comment

**Checkpoint after Step 4:**
```typescript
{
  operation: "checkpoint",
  sessionId: "<sessionId>",
  content: {
    phase: "WRITE",
    summary: "<N dimensions in code, all with source comments>",
    // Add UNKNOWN constraints for any dimension that couldn't be determined
    addConstraints: [
      { type: "UNKNOWN", text: "Corner radius estimated from <N> arc vertices -- not exact" }
    ],
    gateCheck: {
      escapeHatchCheck: [true, true, true, true],
      artifactProduced: true,
      notes: "Every dimension has // source comment"
    }
  }
}
```

**Escape hatch check**: Read back every dimension line in the OpenSCAD code. Does each one have a `//` comment citing source coordinates? If any dimension lacks a citation, you skipped work.

### Step 5: VERIFY

**Mandatory artifact**: Comparison table:

| Dimension | Reference | Generated | Delta |
|-----------|-----------|-----------|-------|
| Outer width | 178.0mm | 178.0mm | 0.0mm |
| Wall thickness (X+) | 3.0mm | 3.0mm | 0.0mm |

This step is where escape hatches are most tempting. The discipline layer is strictest here.

1. Export the OpenSCAD model to STL via `render_openscad` or OpenSCAD CLI
2. **Call `analyze_stl` on the GENERATED STL** with the same cross-section parameters used in Step 1. This tool call is the gate -- no narrative substitute.
3. Compare polygon vertex coordinates slice-by-slice between reference and generated STLs:
   - For each matching Z height, compare exterior and interior coordinate extremes
   - Any dimensional deviation > 0.5mm: identify which feature is wrong
   - Trace the wrong dimension back to Step 2 measurements
   - Fix the OpenSCAD code and re-export
4. Also call `compare_stl` for overall volume/bounding box validation
5. **3-iteration cap on fix loops.** After 3 failed verify-fix cycles: STOP, present the remaining deltas, ask the user for guidance. Do not keep guessing.

**Checkpoint after Step 5:**
```typescript
{
  operation: "checkpoint",
  sessionId: "<sessionId>",
  content: {
    phase: "VERIFY",
    summary: "<N dimensions compared, max delta: Xmm>",
    resolveConstraints: ["<VERIFY constraint for generated STL comparison>"],
    gateCheck: {
      escapeHatchCheck: [true, true, true, true],
      artifactProduced: true,
      notes: "analyze_stl called on generated STL, comparison table produced"
    }
  }
}
```

### --stl Output Format

```
# STL Replication: [filename]

## ANALYZE
[analyze_stl output -- bounding box, cross-section count, raw data preserved]

## EXTRACT
| Dimension | Value | Source Coordinate | Source Slice |
|-----------|-------|-------------------|--------------|
| ... | ... | ... | ... |

## COMPARE SLICES
| Z Height | Feature | Magnitude | Type |
|----------|---------|-----------|------|
| ... | ... | ... | ... |

## OPENSCAD
[Generated code -- every dimension line has a // source comment]

## VERIFY
| Dimension | Reference | Generated | Delta |
|-----------|-----------|-----------|-------|
| ... | ... | ... | ... |

Status: PASS (all deltas < 0.5mm) / FAIL (iteration N/3 -- fixing...)
```

---

## Final Output Format

```
# Design Session: [Brief Summary]

## FRAME
[Framing output]

## EXPLORE
[Directions output]

## DEVELOP
[Concepts output with tool execution plan]

## EVALUATE
[Assessment output with verdict]

## ITERATE (if applicable)
[Iteration output]

## Execution Summary

**Selected Concept:** [name]
**Medium:** [raster/vector/3D]
**Tool:** [Photoshop/Illustrator/OpenSCAD]
**Ready for execution:** [yes/no]

To execute, the tool operations are:
1. [specific operation]
2. [specific operation]
3. [specific operation]

---
*Design session completed via /design*
*Session ID: [sessionId]*
```

---

## Persist Analysis (Lightweight)

After completing the analysis, append to daily log.

### Step 1: Create Cognition Directory

```bash
mkdir -p .claude/cognition
```

### Step 2: Append to Daily Log

Append entry to `.claude/cognition/YYYYMMDD-daily.md`:

```markdown
---
### [HH:MM] /design - [Brief slug]
Session: <sessionId>

[1-2 sentence summary of the design direction chosen and verdict]
---
```

### Step 3: Write Workshop Entry

```bash
workshop --workspace .claude/memory note \
  "/design: [Brief] - [Selected concept summary]. Verdict: [verdict]. Session: <sessionId>" \
  -t design -t cognition -t creative
```

### Error Handling

If persistence fails, display warning and continue - do NOT halt.

---

_See also: `think.md --creative` for non-design creative thinking, `deepthink.md` for depth-first exploration_
