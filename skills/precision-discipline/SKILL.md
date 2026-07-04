---
name: precision-discipline
description: >
  Reusable behavioral constraint layer for precision execution work.
  Prevents performative reasoning depth, lazy approximation, and skipped
  verification. Uses cognition-mcp checkpoint chain (same mechanism as
  the design lanes' escape-hatch detection). Apply when a command or workflow
  requires measurable precision -- STL replication, layout measurement,
  print settings verification, dimension-critical work.
---

# Precision Discipline

RULE: Every derived value cites its source. Every step produces its artifact. Every output gets measured.

## When to Apply

Apply when a command or workflow flag activates precision mode:
- `/design --stl` (STL geometry replication)
- Any workflow where the output is measurable and the tolerance is defined

Do NOT apply to creative exploration, brainstorming, or research. Those use different constraint patterns.

## Escape Hatch Detection

After EACH step in a precision workflow, answer these 4 questions before proceeding:

1. **Artifact or narrative?** Did I produce the mandatory artifact for this step (table, comparison, tool output), or did I write prose ABOUT what I found?
2. **Sourced or summarized?** Does every derived value cite a specific source (tool output field, coordinate pair, file:line), or did I use a summary phrase ("from the analysis", "based on measurements")?
3. **Done or moving on?** Am I declaring this step complete because the artifact is complete, or because I want to get to the next step?
4. **Reproducible?** If someone re-ran my exact tool calls with the same parameters, would they get the same values I'm reporting?

If ANY answer exposes an escape hatch: **STOP. Go back. Produce the actual artifact.**

Do not narrate the self-check. Do not write "I checked and all 4 passed." Either the artifact exists or it doesn't.

## Constraint Chain Integration

Use cognition-mcp `checkpoint` calls to track precision constraints. Same cognition-mcp mechanism, with execution-specific constraint types.

### Constraint Types

| Type | Meaning | Resolves when |
|------|---------|---------------|
| EVIDENCE | Must produce this artifact before proceeding | Artifact exists in output |
| VERIFY | Must measure output against reference | Comparison tool call completed with results shown |
| FORBIDDEN | Cannot do this at all | Never resolves -- permanent constraint |
| UNKNOWN | Gap that cannot be filled from available data | User provides the value, or explicitly accepted as unknown |

### Checkpoint Pattern

After each step, call checkpoint with constraints:

```typescript
{
  operation: "checkpoint",
  sessionId: "<sessionId>",
  content: {
    phase: "<STEP_NAME>",
    summary: "<what was produced, not what was learned>",
    addConstraints: [
      { type: "EVIDENCE", text: "<artifact the next step must produce>" },
      { type: "VERIFY", text: "<what must be measured before done>" },
      { type: "FORBIDDEN", text: "<specific lazy shortcut to block>" }
    ],
    resolveConstraints: ["<IDs of constraints satisfied by this step's artifact>"],
    gateCheck: {
      escapeHatchCheck: [true, true, true, true],
      artifactProduced: true,
      notes: "<what the artifact contains>"
    }
  }
}
```

Read `protocolState` from response:
- `blocked: true` -> artifact missing or VERIFY constraint unresolved. Cannot proceed.
- `gateStatus: "SOFT_FAIL"` -> artifact exists but escape hatch detected. Fix before proceeding.
- `gateStatus: "PASS"` -> proceed to next step.

## Forbidden Completions

These phrases are escape hatches. If you catch yourself writing one, you have skipped work.

| Phrase | Why it's an escape hatch | Write instead |
|--------|-------------------------|---------------|
| "approximately X" | Disguises imprecision as caution | Exact value: `3.0mm (X: 89.0 - 86.0, Z=-23.8)` |
| "based on the analysis" | Cites nothing specific | Cite the field: `area_mm2: 1050.0 from cross_section[3]` |
| "should be correct" | Performs confidence without evidence | Show the comparison: `reference: 178.0, generated: 178.0, delta: 0.0` |
| "I've verified" | Narrative claim without tool call | Show the tool call and its output |
| "looks right/good" | Visual assertion without measurement | Measurement comparison table |
| "close enough" | Undefined tolerance | Exact delta + defined threshold: `delta: 0.3mm < tolerance: 0.5mm` |
| "consistent with" | Vague agreement claim | Show both values side by side |
| "as expected" | Assumes rather than checks | Show actual vs expected with delta |

## Mandatory Artifact Pattern

Each step in a precision workflow declares its artifact BEFORE execution. The artifact is a specific output format that requires data to fill -- not narrative.

**An artifact is valid when:**
- It contains values from tool output (not paraphrased)
- Every derived value has a source citation
- It can be verified by re-running the tool calls

**An artifact is invalid when:**
- It contains prose descriptions of what was found
- Values lack source citations
- It says what SHOULD be true rather than what WAS measured

### Source Citation Format

Every derived value must include:
- The value itself
- The source (tool name, output field, or coordinate)
- The context (which slice, which file, which call)

```
WRONG: "Wall thickness is 3mm"
WRONG: "Wall thickness = 3mm (from analysis)"
WRONG: "Wall thickness = 3mm (measured)"
RIGHT: "Wall thickness = 3.0mm (outer X=89.0, inner X=86.0, Z=-23.8 slice)"
RIGHT: "Area = 1050.0 mm2 (cross_section[3].polygons[0].area_mm2)"
```

## Verification Loop with Cap

When a precision workflow includes a verification step:

1. Run the verification (tool call on generated output)
2. Compare against reference values
3. If any dimension exceeds tolerance: identify the wrong dimension, trace to source, fix, re-verify
4. **Maximum 3 verification iterations.** After 3 failed loops:
   - STOP
   - Present the remaining deltas to the user in a comparison table
   - Explain which dimensions resist correction and why
   - Ask for guidance
   - Do NOT keep guessing

This prevents infinite fix-verify loops while ensuring the agent actually attempts correction.

## Integration with Commands

Commands activate precision discipline by:
1. Declaring `precision-discipline applies to this mode` in their flag section
2. Defining domain-specific steps with named artifacts
3. Using checkpoint calls after each step
4. Running escape hatch detection after each step

The discipline layer provides the behavioral mechanism. The command provides the domain steps and artifact definitions.

### Example: /design --stl integration

```
Step 1 ANALYZE -> artifact: "full analyze_stl output"
  checkpoint: addConstraints [EVIDENCE: "dimension table with source coordinates"]
  escape hatch check

Step 2 EXTRACT -> artifact: "dimension table (Dimension | Value | Source Coordinate | Source Slice)"
  checkpoint: resolveConstraints [dimension table], addConstraints [EVIDENCE: "feature transition list"]
  escape hatch check

Step 3 COMPARE -> artifact: "feature transition table (Z Height | Feature | Magnitude | Type)"
  checkpoint: resolveConstraints [feature transition list], addConstraints [VERIFY: "generated STL comparison"]
  escape hatch check

Step 4 WRITE -> artifact: "OpenSCAD code with dimension citations in comments"
  checkpoint: addConstraints [VERIFY: "analyze_stl on generated STL"]
  escape hatch check (question 2 is critical here -- every dimension must have a source comment)

Step 5 VERIFY -> artifact: "comparison table (Dimension | Reference | Generated | Delta)"
  tool call gate: analyze_stl MUST be called on the generated STL file
  checkpoint: resolveConstraints [generated STL comparison]
  3-iteration cap on fix loops
```
