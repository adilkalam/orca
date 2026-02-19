---
description: Pre-mortem exploration with adaptive failure analysis via cognition-mcp
argument-hint: [--design|--quick] <problem or question to explore>
---

# /deepthink - Pre-Mortem Exploration

**YOUR ROLE**: Execute depth-first exploration with adaptive pre-mortems after conclusion-producing modes. DIVERGENT thinking -- exploring questions, generating hypotheses, stress-testing conclusions before they solidify. For CONVERGENT decision-making, use `/problem-solve`. For lighter exploration without pre-mortems, use `/think`.

**Question/Problem**: $ARGUMENTS

---

## If --help or empty arguments

Display this reference and stop:

```
/deepthink - Pre-Mortem Exploration

USAGE:
  /deepthink <problem or question>
  /deepthink --design <problem>    (design-focused exploration with pre-mortems)
  /deepthink --quick <problem>     (fast exploration, no self-observation overhead)
  /deepthink --help

MODES: MAP, INVERT, PERSPECTIVES, EDGES, META, DEEP, DESIGN
CONSTRAINT CHAIN: After each mode, MCP tracks constraints (FORWARD/FORBIDDEN/QUESTION)
ADAPTIVE PRE-MORTEM: After conclusion-producing modes, runs failure analysis

RELATED: /think (constraint chain, no pre-mortems), /problem-solve (convergent)
```

---

## Phase 0: Parse Flags

### Flags

| Flag | Effect |
|------|--------|
| --design | Loads design context + auto-selects DESIGN mode |
| --quick | Fast exploration via blind_orchestrate -- no self-checks, constraints, or pre-mortems |

**Routing logic**:
- If --quick: Jump to **Phase 1B: Quick Exploration**
- If --design or no flags: Continue to **Phase 1: ENTER**

Include `verbose: false` in every cognition MCP call (except --quick, which uses blind_orchestrate).

## Phase 1: ENTER

Call cognition with `operation: "thought"`, `sessionTitle: "DeepThink: <summary>"`, `sessionTags: ["deepthink", "exploration"]`. Register the command:

```typescript
// After ENTER, register command with checkpoint
{ operation: "checkpoint", sessionId: "<id>", content: { command: "deepthink", phase: "enter" } }
```


## Phase 1B: Quick Exploration (--quick)

Fast exploration using blind_orchestrate. Same analytical depth as default deepthink but without self-checks, constraint tracking, checkpoints, pre-mortems, or protocol vocabulary. Faster because it skips the metacognitive overhead.

### Process

1. Call cognition MCP with `operation: "blind_orchestrate"` and `content: { problem: "$ARGUMENTS", step: 0 }` to get the first analytical task.

2. Read the `nextPrompt` from the response. Write your analysis naturally -- no structured framework, no protocol vocabulary (no "constraints", "gates", "modes", "phases", "self-check", "protocol"). Think deeply and thoroughly. Write full analysis as regular text output.

3. After completing your analysis, call cognition MCP again with `operation: "blind_orchestrate"` and `content: { problem: "$ARGUMENTS", reasoning: "<your analysis from this step>", step: <next step number> }` to get the next task.

4. Repeat steps 2-3 until the orchestrator returns `done: true`.

5. When done, write a final synthesis, then jump directly to **Quick Output Format** below. Skip all other phases.

### Rules

- Do NOT use any structured reasoning framework vocabulary
- Do NOT call any cognition operations other than `blind_orchestrate`
- Think naturally. Follow the prompts. Write clearly.
- Be thorough in each step -- do not rush to the next prompt
- Include your genuine uncertainties and position changes

### Quick Output Format

```
# DeepThink: [Problem Summary]

## Entry Point
[brief orientation from the exploration]

## Exploration
### [Topic 1]: [2-3 sentence key finding]
### [Topic 2]: [2-3 sentence key finding]

## Summary
[2-4 sentences: the actual synthesis]

## Where to Go Next
-> /deepthink "[follow-up]" (without --quick, for full pre-mortem analysis)
   _[why this needs adversarial exploration]_
-> /think "[question]"
   _[why this needs investigation]_
-> /problem-solve "[decision]"
   _[if ready to decide]_
```

Note: --quick output does NOT include "What the Protocol Caught" table since there is no protocol self-observation. That is the key difference from default output.

---

## Phase 2: ORIENT

### Full ORIENT Display

Call cognition `operation: "thought"` with full orientation:
- **What I know**: Key facts and evidence
- **What I'm uncertain about**: Gaps, assumptions, unknowns
- **What I'm avoiding**: Uncomfortable angles, taboo options
- **What would an essayist notice?**: Free-associate briefly -- what connections, reframings, or uncomfortable observations might structured analysis miss? (1-2 sentences, not a mode)
- **Mode selection**: Recommended modes with rationale

### --design Auto-Selection

If `--design` flag is present:
1. Load `design-deepthink` skill context
2. Search for and read project design files:
   - `design-dna.json` (project root)
   - `.claude/design-dna/` directory (any files)
   - `design-system.md` (project root)
   - `css/design-system-tokens.css` (if exists)
3. Auto-select DESIGN mode (skip mode selection below)
4. User can still pivot to other modes if DESIGN doesn't fit

### SCOPE Check (non-design)
1. What is the SYMPTOM?
2. What components could POSSIBLY cause it? (ALL, not just likely)
3. Where does control flow NEXT after success? (destination component)

### Mode Selection Guide

| Mode | When | Operations |
|------|------|------------|
| MAP | Confused, need territory | systems, causal_analysis |
| INVERT | Have position, need weaknesses | mental_model (pre-mortem), thought (reflexion) |
| PERSPECTIVES | Stuck in one viewpoint | collaborative_reasoning, thought (steelman) |
| EDGES | Need options, analogies | creative_thinking, analogical_reasoning |
| META | Too comfortable, might be avoiding | meta (substrate observation) |
| DEEP | One question needs focus | 3 thought chains (analytical, intuitive, adversarial) |
| DESIGN | UI/UX exploration, visual problems | systems + thought (design-specific) |

---

## Phase 3: MODE EXECUTION

Execute the selected mode. Each mode uses 1-2 cognition operations. Typically run 3-4 modes.

**MAP**: systems map (components, relationships, feedbackLoops, blindSpots) then causal_analysis on leverage points (causes, effects, chains). Depth gate: non-obvious insights?

**INVERT**: mental_model pre-mortem (setup: "This failed. What happened?", steps: failure modes, rootCauses). Then thought reflexion on top 2 failure modes (verificationCriteria, earlyWarnings). Depth gate: actionable criteria?

**PERSPECTIVES**: collaborative_reasoning (perspectives with role/viewpoint/arguments, tensions, synthesis). Then steelman each via thought (strongestArgument, evidenceForMindChange, costOfIgnoring). Depth gate: genuine merit found?

**EDGES**: creative_thinking (techniques, ideas with source/potential/challenges, surprises). Then analogical_reasoning on best 2 (analogs, mappings, insights, limitations). Depth gate: transferable principles?

**META**: meta operation (observations, deflections, actualBehavior, insights). Depth gate: caught real behavior?

**DEEP**: 3 thought chains (analytical, intuitive, adversarial), 5 thoughts each. Then convergence check thought (chain conclusions, convergent T/F, sharedInsights, divergentAreas). Depth gate: framings revealed blind spots?

**DESIGN**: systems map (design context: components, tokens, relationships, design-dna rules) then thought analysis with design-specific prompts:
- Anti-pattern detection (7 AI slop patterns from design-deepthink skill)
- Visual hierarchy assessment
- Token compliance check
- Accessibility concerns
Depth gate: Did we find specific, actionable design issues?

**Field hints for operations without full examples above:**

| Operation | Key fields |
|-----------|-----------|
| systems | system, components[{name, function}], relationships[{from, to, type}], feedbackLoops |
| causal_analysis | phenomenon, causes[{factor, type, strength}], effects[{outcome, likelihood, timeframe}], chains |
| mental_model | modelName, problem, setup, steps, rootCauses[{failure, cause, preventable}], conclusion |
| collaborative_reasoning | topic, perspectives[{role, viewpoint, arguments}], tensions, synthesis |
| creative_thinking | challenge, techniques, ideas[{idea, potential, challenges}] |
| analogical_reasoning | target, analogs[{domain, description, similarity}], mappings, insights, limitations |

---

## Phase 4: SELF-CHECK + CONSTRAINT CHECKPOINT + ADAPTIVE PRE-MORTEM (After Each Mode)

### 6-Question Self-Check (mandatory)

**Internal**:
1. Is this shallow or predictable?
2. What am I avoiding?
3. Why not the uncomfortable option?

**External**:
4. What would I critique if someone else wrote this?
5. What would a skeptical expert challenge?
6. Any verifiable claims that should be checked?

### Constraint Checkpoint

After self-check, call checkpoint with protocol state fields. MCP tracks constraints and evaluates gates.

```typescript
{
  operation: "checkpoint",
  sessionId: "<sessionId>",
  content: {
    phase: "<MODE_NAME>",
    summary: "<1-2 sentence mode summary>",
    keyFindings: ["<finding 1>", "<finding 2>"],
    // Add constraints discovered during this mode
    addConstraints: [
      { type: "FORWARD", text: "Must trace causal chain from X to Y" },
      { type: "FORBIDDEN", text: "Cannot conclude API is bottleneck without profiling" },
      { type: "QUESTION", text: "What happens under concurrent access?" }
    ],
    // Resolve/acknowledge/defer constraints from previous modes
    resolveConstraints: ["C1"],
    acknowledgeConstraints: ["C2"],
    deferConstraints: [{ id: "C3", reason: "Requires testing" }],
    // Self-check result
    gateCheck: {
      selfCheckPassed: true,
      depthGatePassed: true,
      notes: "Found non-obvious insight about X"
    }
  }
}
```

**Read the `protocolState` from response** to determine next action:
- `gateStatus: "PASS"` + no active constraints -> can proceed to HARVEST
- `gateStatus: "SOFT_FAIL"` -> active constraints remain, run another mode
- `gateStatus: "HARD_FAIL"` -> self-check or depth gate failed, go deeper
- `blocked: true` -> cannot harvest until constraints addressed

Minimum constraints: 2 per mode.

### Adaptive Pre-Mortem (After Each Mode)

After the constraint checkpoint, evaluate whether the mode produced a **testable conclusion**. This is a heuristic YOU apply, not MCP logic.

**Run a pre-mortem** (via `mental_model` operation with `modelName: "pre-mortem"`) if the mode output contains:
- A specific recommendation ("use X instead of Y")
- A position reversal or commitment
- An actionable architecture/design decision

**Skip the pre-mortem** if the mode output is:
- An exploratory map (systems diagram, causal graph)
- A question-generating exercise
- Pure information gathering

When running the pre-mortem:
1. Call `mental_model` with `modelName: "pre-mortem"`, `problem: "<the conclusion being tested>"`, `setup: "This decision/recommendation failed. What happened?"`, `steps: [failure modes]`
2. Each non-trivial failure mode becomes a new constraint via `addConstraints` in the next checkpoint

This ensures conclusions are stress-tested before they propagate through subsequent modes.

---

## Phase 5: ROUTING

After each mode + self-check + optional pre-mortem:
- Check `protocolState.blocked` -- if true, must address constraints before harvest
- After 3-4 modes with PASS gates AND `protocolState.blocked === false`, proceed to HARVEST
- Continue until genuine surprise + all constraints addressed

---

## Phase 6: HARVEST

Call checkpoint with `phase: "harvest"`. MCP auto-persists a summary file to `.claude/cognition/`.

```typescript
{
  operation: "checkpoint",
  sessionId: "<sessionId>",
  projectPath: "<absolute project path>",
  content: {
    phase: "harvest",
    summary: "<2-3 sentence executive summary>",
    keyFindings: ["<key finding 1>", "<key finding 2>"],
    openQuestions: ["<remaining question>"],
    nextSteps: ["<what to explore next>"],
    followUpQuestions: [
      {
        question: "<specific follow-up based on findings>",
        command: "/deepthink",
        rationale: "<why this needs adversarial testing>"
      },
      {
        question: "<specific follow-up based on findings>",
        command: "/think",
        rationale: "<why this needs investigation>"
      }
    ]
  }
}
```

**Response includes**: `autoPersist: { persisted: true, file: "<path>" }`, `protocolState` with deferred constraints, and `followUpQuestions` array (explicit + auto-extracted from deferred constraints).

### Workshop Entry (after harvest)

```bash
workshop --workspace .claude/memory note \
  "/deepthink: [Topic] - [Key discovery]. Session: <sessionId>. File: <autoPersist.file>" \
  -t deepthink -t cognition
```

If workshop fails, display warning and continue.

---

## Final Output Format

The output is bottom-anchored for terminal reading. The last thing printed is the most important.

```
# DeepThink: [Problem Summary]

## Entry Point
What I knew: [key facts, scope, constraints]
What I was uncertain about: [gaps, unknowns, open questions]
What I was avoiding: [uncomfortable angles, things that might not be true yet]

## Exploration
### [MODE 1]: [2-3 sentence key finding]
### [MODE 2]: [2-3 sentence key finding]
### [MODE 3]: [2-3 sentence key finding]

## What the Protocol Caught
- "[assumption or default]" --> [mechanism] --> [what actually held up or changed]
- "[another assumption]" --> [mechanism] --> [outcome]

## Summary
[3-5 sentences: trace the actual arc of reasoning -- what shifted, what
surprised, what resisted. Not a conclusion statement but a description of
how thinking evolved from entry point to current understanding. End with
honest assessment of whether genuine insight emerged or just structured text.]

## Where to Go Next
-> /problem-solve "[specific decision point]"
   _[why this needs convergent decision-making]_
-> /deepthink "[specific follow-up]"
   _[why this needs further adversarial exploration]_
-> /think "[specific question]"
   _[why this needs investigation]_
```

---

## Key Differences from Other Commands

| /deepthink | /think | /problem-solve |
|------------|--------|----------------|
| Divergent + pre-mortems | Divergent, no pre-mortems | Convergent - decide, commit |
| 6-question self-check | 3-question self-check | Phase gates |
| Adaptive failure analysis | Constraint chain only | Fixed 8-step sequence |
| Valid: "more confused in useful ways" | Valid: "new insight found" | Valid: clear decision + safeguards |

---

_See also: `think.md`, `problem-solve.md`, `guide-think-complex.md`_
