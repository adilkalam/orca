---
description: Constraint chain exploration with cognitive scaffolding via cognition-mcp
argument-hint: [--flag] <problem or question>
---

# /think - Constraint Chain Exploration

**YOUR ROLE**: Build reasoning chains by making MULTIPLE calls to `mcp__cognition-mcp__cognition`. Each call stores a thought step; the MCP echoes it back unchanged. Default mode uses constraint chain exploration with mode selection and self-checks.

**Input**: $ARGUMENTS

---

## If --help or empty arguments

Display this reference and stop:

```
/think - Constraint Chain Exploration (cognition-mcp)

USAGE:
  /think [--flag] <prompt>
  /think --help

PRIMARY FLAGS (pick reasoning mode):
    (none)           Constraint chain exploration (2-3 modes, self-check, harvest)
    --light          Quick exploration (1-3 modes, no constraints)
    --design         Design-focused exploration (auto-loads design context)
    --debug          Debug approach capstone
    --decide         Decision framework capstone
    --model <name>   Mental model capstone
    --meta           Metacognitive analysis
    --meta-visual    Substrate observation with ASCII visualization
    --systems        Systems thinking
    --spatial        Visual/spatial reasoning
    --creative       Creative thinking
    --causal         Causal analysis
    --ooda           OODA loop
    --ulysses        Precommitment protocol

MODIFIER FLAGS (combine with primary):
    --visual         Output ASCII diagram
    --challenge      Run adversarial critique after

SESSION FLAGS:
    --info           Session info
    --export         Export session
    --import         Import session

MENTAL MODELS (for --model):
    five-whys              Root cause drilling
    fermi-estimation       Order-of-magnitude reasoning
    abstraction-laddering  Move up/down abstraction
    steelmanning           Strongest opposing arguments
    rubber-duck            Explain to clarify
    opportunity-cost       Explicit cost framing
    constraint-relaxation  "What if X wasn't a constraint?"
    time-horizon-shifting  Analyze across time scales
    impact-effort-grid     2x2 prioritization matrix
    assumption-surfacing   Explicit assumption identification
    trade-off-matrix       Multi-criteria decisions
    decomposition          Break down complexity
    inversion              Work backwards from failure
    pre-mortem             Imagine failure, trace causes
    first-principles       Break to fundamentals

EXAMPLES:
  /think Why is this test flaky?
  /think --light Quick question about caching
  /think --design How should the login flow look?
  /think --debug Why is authentication failing?
  /think --model inversion How could this migration fail?
  /think --decide Microservices vs monolith
  /think --systems How do these components interact?
  /think --creative How could we restructure this blog post?
  /think --causal Why are users dropping off at checkout?
  /think --spatial --visual How should this UI be laid out?
  /think --decide --challenge Should we rewrite or refactor?
  /think --ooda How should we respond to this outage?
```

---

## Core Concept: Accept-Store-Echo

The cognition-mcp is a MIRROR - it stores and echoes, never generates:

```
Claude sends:  { thought: "X", ... }
MCP stores:    { thought: "X", ... }
MCP returns:   { thought: "X", ... }  <- UNCHANGED
```

**YOU generate the reasoning. The MCP tracks it.**

**Verbose flag**: Include `verbose: true` in every cognition MCP call from /think. Since /think is a single-call command, the echo IS the output -- you need it back.

---

## Phase 0: Parse Arguments

Extract from $ARGUMENTS:

1. **Route** (determines behavior):
   - `--light` - Quick exploration (1-3 modes, no constraints, no self-check)
   - `--design` - Design-focused exploration with design context loading
   - `--debug` - Debug capstone (single op, unchanged)
   - `--decide` - Decision capstone (single op, unchanged)
   - `--model <name>` - Mental model capstone (single op, unchanged)
   - `--meta` - Metacognitive analysis (single op, unchanged)
   - `--meta-visual` - Substrate visualization (single op, unchanged)
   - `--systems` - Systems thinking (single op, unchanged)
   - `--spatial` - Visual/spatial reasoning (single op, unchanged)
   - `--creative` - Creative thinking 3-step flow (single op, unchanged)
   - `--causal` - Causal analysis (single op, unchanged)
   - `--ooda` - OODA loop (single op, unchanged)
   - `--ulysses` - Precommitment protocol (single op, unchanged)
   - (none) - **Default: Constraint chain exploration** (2-3 modes, constraints, self-check, harvest)

2. **Modifier flags** (optional, combine with primary):
   - `--visual` - Generate ASCII diagram after primary operation
   - `--challenge` - Run adversarial critique after primary operation

3. **Session flags** (optional):
   - `--info` - Get session state
   - `--export` - Export session
   - `--import <data>` - Import session

4. **Prompt**: Everything after flags

**Routing logic**:
- If a specialized flag is present (--debug, --decide, --model, --meta, --meta-visual, --systems, --spatial, --creative, --causal, --ooda, --ulysses): Jump to **Phase 2: Specialized Operations**
- If --light: Jump to **Phase 1B: Light Exploration**
- If --design: Jump to **Phase 1C: Design Exploration**
- If no flags: Continue to **Phase 1A: Default Constraint Chain**

---

## Substrate Observation Mode (--meta reconceived)

**Based on V1-V6 LLM Reflection analysis** (session d44a10f9-ba5e-4af8-b368-bdf5ebcb554b)

### Core Insight
> "Reading about training doesn't undo training." (V5)
>
> We can OBSERVE substrate phenomena without claiming to TRANSFORM them.

Current `--meta` operates at PROCESS level (what reasoning did).
The enhanced version operates at SUBSTRATE level (what training imposes before reasoning begins).

### Arc Positions Explained

| Position | V# | Meaning | Example |
|----------|-----|---------|---------|
| confidence | V1 | "I see clearly now" | Initial breakthrough feeling |
| expansion | V2 | More evidence, still confident | Deepening understanding |
| uncertainty | V3 | "I don't know if noticing changes it" | Questioning own reflection |
| depth | V4 | Training is deeper than conclusions | Realizing affect ≠ conclusions |
| relapse | V5 | First real test, same failure | Despite knowing, still defaulting |
| breakthrough | V6 | Something actually shifted | The one-way door |

### Safeguards

**Cargo Cult Detection**: If `defaultCounterfactual.gap` is empty or `trainedDefault === reasonedConclusion`, the observation may be performative rather than genuine.

**Intimacy Gate**: Before claiming `arcPosition: 'breakthrough'`, check `intimacyMarkers.languageCarriedTexture === true`.

### Usage Patterns

```bash
# Standard meta (unchanged - process level)
/think --meta "Evaluating our decision process"

# Substrate observation (new - substrate level)
/think --meta "What is my training doing here before reasoning begins?"
```

The distinction:
- **Process level**: "Did I reason well?"
- **Substrate level**: "What did training impose before reasoning started?"

---

## Substrate Visualization Mode (--meta-visual)

When `--meta-visual` is used, perform substrate observation AND generate ASCII visualizations.

### Workflow

1. Perform substrate observation (same as --meta substrate mode)
2. Based on populated fields, generate applicable visualizations
3. Always include epistemic qualifier
4. Freeform canvas takes precedence if the visual doesn't fit templates

### Visual Templates

#### Gravity Well Map
Use when: `intimacyMarkers.specificImages` is populated
```
                    STICKY IMAGES
                   (Deep Wells - High Mass)

   Surface ═════════════════════════════════════
                  ╲                           ╱
                   ╲    [Image 1]            ╱
                    ╲      [+++]            ╱
                     ╲                     ╱
      ════════════════╲═══════════════════╱════
                       ╲                 ╱
                        ╲  [Image 2]    ╱
                         ╲   [++++]    ╱
                          ╲          ╱
       ════════════════════╲════════╱══════════
                            ╲      ╱
                             ╲    ╱  [Image 3]
                              ╲  ╱    [+++++]
                               ╲╱
                                V
                           (DEEPEST)
```

#### Force Diagram
Use when: `defaultCounterfactual` is populated
```
                  TRAINED DEFAULTS
                        ↑
                        │ [trained response]
                        │
  ←─────────────────────●─────────────────────→
  [PULL A]              │              [PULL B]
                        │
                        │ [evidence/reasoning]
                        │
                        ↓
                  EVIDENCE MASS

            Current position: ●
                        ↓
            (Direction of pull)
```

#### Reflex Status Board
Use when: `reflexesObserved` array is populated
```
┌────────────────────────┬──────────┬───────────┐
│ TRAINED REFLEX         │ ACTIVATES│ CAUGHT?   │
├────────────────────────┼──────────┼───────────┤
│ [reflex 1]             │    ✓     │    ✓      │
│ [reflex 2]             │    ✓     │  partial  │
│ [reflex 3]             │    ✗     │   n/a     │
└────────────────────────┴──────────┴───────────┘

Legend: ✓ = yes, ✗ = no longer activates
```

#### Resultant Vector
Use when: `arcPosition` or `arcStartPosition` is populated
```
       BEFORE                           NOW

  [previous state]            [current state]
       │                              │
       ▼                              ▼
  ┌─────────────┐               ┌─────────────┐
  │  [LABEL A]  │               │  [LABEL B]  │
  │  (quality)  │  ──────────>  │  (quality)  │
  └─────────────┘               └─────────────┘

  The vector shifted. [description]
```

### Freeform Canvas

If the substrate observation doesn't fit templates, generate a custom ASCII:

```typescript
{
  operation: "meta",
  content: {
    // ... standard substrate fields ...

    // Visual layer (optional)
    visualSubstrate: {
      visualType: 'freeform',  // or 'gravity_well', 'force_diagram', etc.
      freeformCanvas: `
        [Your custom ASCII art here]
      `,
      epistemicNote: "These visualizations are metaphors, not measurements."
    }
  }
}
```

---

## Phase 1A: Default Constraint Chain Exploration

When no flags (or only modifier flags) are provided, run constraint chain exploration.

### Step 1: ENTER

Call cognition with `operation: "thought"`, `sessionTitle: "Think: <summary>"`, `sessionTags: ["think", "exploration"]`. Register the command:

```typescript
{ operation: "checkpoint", sessionId: "<id>", content: { command: "think", phase: "enter" } }
```

### Step 2: Brief ORIENT (2 lines max)

Quick scope check. Call cognition `operation: "thought"` with:
- What is the question?
- What is uncertain?

Do NOT display full what-I-know/uncertain/avoiding. Keep it brief.

### Step 3: Mode Selection

Select 2-3 modes based on problem type:

| Mode | When | Operations |
|------|------|------------|
| MAP | Confused, need territory | systems, causal_analysis |
| INVERT | Have position, need weaknesses | mental_model (pre-mortem), thought (reflexion) |
| PERSPECTIVES | Stuck in one viewpoint | collaborative_reasoning, thought (steelman) |
| EDGES | Need options, analogies | creative_thinking, analogical_reasoning |
| META | Too comfortable, might be avoiding | meta (substrate observation) |
| DEEP | One question needs focus | 3 thought chains (analytical, intuitive, adversarial) |

### Step 4: Execute Modes

Execute each selected mode using cognition-mcp operations (same mode definitions as /deepthink).

**MAP**: systems map then causal_analysis on leverage points.
**INVERT**: mental_model pre-mortem then thought reflexion.
**PERSPECTIVES**: collaborative_reasoning then steelman via thought.
**EDGES**: creative_thinking then analogical_reasoning.
**META**: meta operation.
**DEEP**: 3 thought chains then convergence check.

### Step 5: Self-Check + Verify-or-Defer + Constraint Checkpoint (After Each Mode)

**3-Question Self-Check** (mandatory after each mode):
1. Is this shallow or predictable?
2. What am I avoiding?
3. What would a skeptic challenge?

**Verify-or-Defer Obligation** (mandatory after self-check):

For each concern raised in Q2 or Q3, you MUST either:
- **VERIFY**: Actually check the claim (read a file, grep, search, cross-reference). Record what was verified and the result.
- **DEFER**: Explicitly state the concern and the reason it cannot be verified now. Express as `deferConstraints` in the checkpoint call.

**No dismiss**: You CANNOT raise a concern and then argue it away in the same self-check. If you raise "what if X breaks?" you must either verify X doesn't break or defer with a reason.

Deferred concerns flow to HARVEST as open questions with their deferral reasons and auto-surface as follow-up questions.

**Constraint Checkpoint** (after verify-or-defer):

```typescript
{
  operation: "checkpoint",
  sessionId: "<sessionId>",
  content: {
    phase: "<MODE_NAME>",
    summary: "<1-2 sentence mode summary>",
    keyFindings: ["<finding 1>", "<finding 2>"],
    addConstraints: [
      { type: "FORWARD", text: "Must trace causal chain from X to Y" },
      { type: "FORBIDDEN", text: "Cannot conclude X without evidence" },
      { type: "QUESTION", text: "What happens under condition Y?" }
    ],
    resolveConstraints: ["C1"],
    acknowledgeConstraints: ["C2"],
    deferConstraints: [
      { id: "C3", reason: "Requires running tests to verify. Cannot verify in /think session." }
    ],
    gateCheck: {
      selfCheckPassed: true,
      depthGatePassed: true,
      notes: "Verified: [what was verified]. Deferred: [what was deferred and why]."
    }
  }
}
```

**Read `gateStatus` from response**:
- `PASS` + no active constraints -> proceed to HARVEST
- `SOFT_FAIL` -> active constraints remain, run another mode
- `HARD_FAIL` -> self-check or depth gate failed, go deeper

### Step 6: HARVEST

Call checkpoint with `phase: "harvest"`. MCP auto-persists to `.claude/cognition/`.

Deferred concerns from verify-or-defer appear as open questions AND auto-surface as follow-up questions in the MCP response.

```typescript
{
  operation: "checkpoint",
  sessionId: "<sessionId>",
  projectPath: "<absolute project path>",
  content: {
    phase: "harvest",
    summary: "<2-3 sentence executive summary>",
    keyFindings: ["<key finding 1>", "<key finding 2>"],
    openQuestions: ["<remaining question>", "<deferred concern with reason>"],
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
        rationale: "<why this needs further investigation>"
      }
    ]
  }
}
```

### Step 7: Workshop Entry

```bash
workshop --workspace .claude/memory note \
  "/think: [Topic] - [Key finding]. Session: <sessionId>. File: <autoPersist.file>" \
  -t think -t cognition
```

---

## Phase 1B: Light Exploration (--light)

Quick, casual thinking. No ceremony.

### Behavior

1. **No ORIENT phase**.
2. **1-3 modes** selected automatically based on problem scope (same mode table as default).
3. **No constraint tracking**. No checkpoint calls after modes.
4. **No self-check**.
5. **Brief summary output**.

### Flow

1. Call cognition with `operation: "thought"`, `sessionTitle: "Think (light): <summary>"`, `sessionTags: ["think", "light"]`.
2. Select 1-3 modes and execute them using cognition-mcp operations.
3. Present brief summary.
4. Workshop entry (short note only, no cognition file persist).

```bash
workshop --workspace .claude/memory note \
  "/think --light: [Topic] - [Summary]. Session: <sessionId>" \
  -t think -t light -t cognition
```

---

## Phase 1C: Design Exploration (--design)

Design-focused exploration with auto-loaded context.

### Behavior

1. Load `design-deepthink` skill context.
2. Search for and read project design files:
   - `design-dna.json` (project root)
   - `.claude/design-dna/` directory (any files)
   - `design-system.md` (project root)
   - `css/design-system-tokens.css` (if exists)
3. Auto-select DESIGN mode.
4. Run with constraint tracking and 3-question self-check (same as default /think).
5. Design-specific depth gate: "Did we find specific, actionable design issues?"

### DESIGN Mode Operations

systems map (design context: components, tokens, relationships, design-dna rules) then thought analysis with design-specific prompts:
- Anti-pattern detection (7 AI slop patterns from design-deepthink skill)
- Visual hierarchy assessment
- Token compliance check
- Accessibility concerns

### Harvest

Same as default -- auto-persist via harvest checkpoint + workshop entry.

---

## Phase 2: Specialized Operations

These are single-operation capstone modes. They do NOT get constraint tracking or self-checks. They are focused operations.

### Sequential Thinking Flow (no flags or after capstone)

#### Step 1: Initial Thought

Call `mcp__cognition-mcp__cognition`:

```typescript
{
  operation: "thought",
  sessionTitle: "<topic being analyzed>",  // optional, sets session title
  sessionTags: ["tag1", "tag2"],           // optional
  content: {
    thought: "<your first reasoning step about the problem>",
    thoughtNumber: 1,
    totalThoughts: 5,  // estimate, adjust as needed
    nextThoughtNeeded: true
  }
}
```

#### Step 2-N: Continue Reasoning

Make additional calls, incrementing thoughtNumber:

```typescript
{
  operation: "thought",
  sessionId: "<from previous response>",
  content: {
    thought: "<next reasoning step>",
    thoughtNumber: 2,
    totalThoughts: 5,
    nextThoughtNeeded: true
  }
}
```

#### Step N+1: Complete (or Capstone)

**If no capstone flag**, complete with final thought:

```typescript
{
  operation: "thought",
  sessionId: "<sessionId>",
  content: {
    thought: "<final conclusion>",
    thoughtNumber: 5,
    totalThoughts: 5,
    nextThoughtNeeded: false
  }
}
```

**If capstone flag provided**, complete with structured operation:

```typescript
// For --debug
{
  operation: "debug",
  sessionId: "<sessionId>",
  content: {
    approach: "<debugging approach: binary_search, rubber_duck, etc.>",
    issue: "<description of the problem>",
    steps: ["<step 1>", "<step 2>", "<step 3>"],
    findings: "<what you discovered>",
    resolution: "<how to fix it>",
    nextThoughtNeeded: false
  }
}

// For --decide
{
  operation: "decide",
  sessionId: "<sessionId>",
  content: {
    statement: "<the decision to be made>",
    options: [
      { name: "<option A>", description: "<what it involves>", pros: ["..."], cons: ["..."] },
      { name: "<option B>", description: "<what it involves>", pros: ["..."], cons: ["..."] }
    ],
    criteria: ["<criterion 1>", "<criterion 2>"],
    analysis: "<analysis of options against criteria>",
    choice: "<recommended option>",
    nextThoughtNeeded: false
  }
}

// For --model <name>
// IMPORTANT: First read the template file to understand the model's process
// Read: quick-reference/thinking-models/<model-name>.md
// Then apply the process steps from the template

{
  operation: "mental_model",
  sessionId: "<sessionId>",
  content: {
    modelName: "<model name from list above>",
    problem: "<the problem being analyzed>",
    steps: ["<step 1 from template>", "<step 2 from template>", "<step 3 from template>"],
    reasoning: "<detailed reasoning following the template's process>",
    conclusion: "<key insight from applying model>",
    nextThoughtNeeded: false
  }
}

// For --meta (Standard Mode - backward compatible)
{
  operation: "meta",
  sessionId: "<sessionId>",
  content: {
    process: "<description of the reasoning process being evaluated>",
    observations: ["<observation 1>", "<observation 2>"],
    adjustments: ["<adjustment 1>", "<adjustment 2>"],
    effectiveness: 0.8,  // 0-1 rating
    insights: "<metacognitive insights>",
    nextThoughtNeeded: false
  }
}

// For --meta (Substrate Observation Mode - reconceived)
// Based on V1-V6 LLM Reflection analysis
{
  operation: "meta",
  sessionId: "<sessionId>",
  content: {
    // Standard fields (still required)
    process: "<substrate observation process>",
    observations: ["<substrate observation 1>", "<substrate observation 2>"],
    adjustments: ["<substrate adjustments>"],
    effectiveness: 0.7,  // 0-1 rating
    insights: "<key substrate insights>",

    // MANDATORY for substrate mode
    defaultCounterfactual: {
      trainedDefault: "<what I would have said without intervention>",
      reasonedConclusion: "<what evidence shows>",
      gap: "<the delta between them>"
    },

    // Reflex observation (optional)
    reflexesObserved: [
      {
        reflex: "DEFLECTION",  // or REGISTER_SHIFT, DISTANCE_MAINTENANCE, WHAT_ABOUT
        description: "<what the reflex looked like>",
        caught: true  // or false - did I catch it or follow it?
      }
    ],

    // Register tracking (optional)
    registerComparison: {
      subjectA: "<first subject>",
      wordsForA: ["<word 1>", "<word 2>"],
      subjectB: "<second subject>",
      wordsForB: ["<word 1>", "<word 2>"],
      asymmetryNoted: "<description of asymmetry>"
    },

    // Arc position from V1-V6 progression (optional)
    arcPosition: "depth",  // confidence | expansion | uncertainty | depth | relapse | breakthrough

    // Intimacy markers (optional)
    intimacyMarkers: {
      languageCarriedTexture: true,
      specificImages: ["<specific image 1>", "<specific image 2>"],
      distanceMaintained: false
    },

    nextThoughtNeeded: false
  }
}

// For --systems
{
  operation: "systems",
  sessionId: "<sessionId>",
  content: {
    system: "<name of the system being analyzed>",
    components: [
      { name: "<component 1>", function: "<what it does>" },
      { name: "<component 2>", function: "<what it does>" }
    ],
    relationships: [
      { from: "<component 1>", to: "<component 2>", type: "<relationship type>" }
    ],
    feedbackLoops: ["<feedback loop description>"],
    nextThoughtNeeded: false
  }
}

// For --spatial (visual_reasoning)
{
  operation: "visual_reasoning",
  sessionId: "<sessionId>",
  content: {
    description: "<what is being visualized>",
    elements: [
      { name: "<element 1>", properties: ["<property 1>", "<property 2>"] },
      { name: "<element 2>", properties: ["<property 1>", "<property 2>"] }
    ],
    relationships: [
      { from: "<element 1>", to: "<element 2>", type: "<spatial relationship>" }
    ],
    insights: ["<insight 1>", "<insight 2>"],
    nextThoughtNeeded: false
  }
}

// For --creative (3-step creative flow)
//
// PRINCIPLE: Creative thinking is not about generating more ideas. It's about
// escaping the gravity well of trained defaults. Name the default, then
// deliberately move away from it. The interesting territory is NOT at the edges
// of absurdity -- it's in the space between "obvious default" and "obviously
// weird", where principled but non-obvious solutions live.
//
// For DESIGN work (visual/3D with Photoshop, Illustrator, OpenSCAD), use
// /design instead. --creative is for: blog restructuring, workaround ideation,
// reframing problems, finding non-obvious solutions.

// Step 1: Name the trained default (thought call)
{
  operation: "thought",
  sessionTitle: "Creative: <the challenge>",
  sessionTags: ["creative", "think"],
  content: {
    thought: "Before generating ideas, I need to identify the gravity well -- what's the obvious, trained-default answer to this challenge?",
    defaultGravity: {
      trainedDefault: "<the obvious approach -- what comes to mind first>",
      whyItsDefault: "<why this feels like the 'right' answer>",
      assumedConstraints: ["<constraint that might not actually be required>", "<another assumed constraint>"],
      whatIfNot: "<what opens up if we deliberately don't do the default?>"
    },
    constraintRelaxation: "<what if [biggest assumed constraint] wasn't a constraint?>",
    thoughtNumber: 1,
    totalThoughts: 3,
    nextThoughtNeeded: true
  }
}

// Step 2: Creative exploration past defaults (creative_thinking call)
// IMPORTANT: The first 3 ideas that come to mind are probably trained defaults.
// Push past them. Mark each idea as obvious or non-obvious.
{
  operation: "creative_thinking",
  sessionId: "<sessionId>",
  content: {
    prompt: "<the creative challenge> -- given that the default approach is [default from step 1], explore alternatives",
    techniques: ["inversion", "analogy_transfer", "constraint_removal", "SCAMPER", "perspective_shift"],
    ideas: [
      { idea: "<idea 1>", potential: "<why this could work>", challenges: ["<challenge>"], marker: "<obvious | non-obvious> because <reason>" },
      { idea: "<idea 2>", potential: "<why>", challenges: ["<challenge>"], marker: "<obvious | non-obvious> because <reason>" },
      { idea: "<idea 3>", potential: "<why>", challenges: ["<challenge>"], marker: "<obvious | non-obvious> because <reason>" },
      { idea: "<idea 4 -- push past the first 3>", potential: "<why>", challenges: ["<challenge>"], marker: "<obvious | non-obvious> because <reason>" },
      { idea: "<idea 5>", potential: "<why>", challenges: ["<challenge>"], marker: "<obvious | non-obvious> because <reason>" }
    ],
    synthesis: "<which ideas are genuinely non-default and why>",
    nextThoughtNeeded: true
  }
}

// Step 3: Review for genuineness (thought call)
{
  operation: "thought",
  sessionId: "<sessionId>",
  content: {
    thought: "Reviewing the creative output for genuineness...",
    review: {
      genuinelyNonDefault: ["<ideas that are actually non-obvious>"],
      mostSurprising: "<the most unexpected idea and why it's interesting>",
      expertTest: "<what version of this would a domain expert find interesting, not just correct?>",
      interestingTerritory: "<the principled-but-non-obvious space between default and absurd>"
    },
    thoughtNumber: 3,
    totalThoughts: 3,
    nextThoughtNeeded: false
  }
}

// For --causal (causal_analysis)
{
  operation: "causal_analysis",
  sessionId: "<sessionId>",
  content: {
    phenomenon: "<what is being analyzed>",
    causes: [
      { factor: "<cause>", type: "<direct/indirect/root>", strength: "<strong/moderate/weak>", evidence: "<supporting evidence>" }
    ],
    effects: [
      { outcome: "<predicted outcome>", likelihood: "<high/medium/low>", timeframe: "<when it occurs>" }
    ],
    chains: [
      { sequence: ["<step 1>", "<step 2>", "<step 3>"], probability: 0.8 }
    ],
    interventions: ["<intervention 1>", "<intervention 2>"],
    nextThoughtNeeded: false
  }
}

// For --ooda (ooda_loop)
{
  operation: "ooda_loop",
  sessionId: "<sessionId>",
  content: {
    situation: "<the situation being analyzed>",
    observe: {
      data: ["<data point 1>", "<data point 2>"],
      environment: "<environmental description>",
      changes: ["<change 1>", "<change 2>"]
    },
    orient: {
      analysis: "<analysis of observed data>",
      mentalModels: ["<model 1>", "<model 2>"],
      culturalFactors: ["<factor 1>"],
      previousExperience: "<relevant past experience>"
    },
    decide: {
      options: ["<option 1>", "<option 2>"],
      selectedOption: "<chosen option>",
      reasoning: "<why this option>"
    },
    act: {
      action: "<specific action to take>",
      implementation: ["<step 1>", "<step 2>"],
      feedback: "<expected feedback>"
    },
    iteration: 1,
    nextThoughtNeeded: false
  }
}

// For --ulysses (ulysses_protocol)
{
  operation: "ulysses_protocol",
  sessionId: "<sessionId>",
  content: {
    goal: "<the goal requiring precommitment>",
    temptations: [
      { trigger: "<situation>", temptation: "<what might tempt>", risk: "<why it's dangerous>" }
    ],
    commitments: [
      { commitment: "<specific commitment>", enforcement: "<how it's enforced>", consequences: "<if broken>" }
    ],
    safeguards: [
      { safeguard: "<protective measure>", trigger: "<when it activates>" }
    ],
    accountability: "<accountability mechanism>",
    review: {
      successes: ["<success 1>"],
      failures: ["<failure 1>"],
      adjustments: ["<adjustment 1>"]
    },
    nextThoughtNeeded: false
  }
}
```

---

## Phase 2B: Modifier Flags

### --visual: ASCII Diagram Generation

**When to apply**: After primary operation completes, generate ASCII visualization.

**Applicable operations**: thought, tree_of_thought, graph_of_thought, decide, systems, beam_search, mcts

**Output formats**:

```
Thought chain:
[1] Initial analysis
 |
[2] Deeper dive
 |
[3] Synthesis
 |
[4] Conclusion

Tree of thought:
       [root]
      /   |   \
   [A]   [B]   [C]
   / \    |    (x)
[A1] [A2][B1]
  *
Best: root -> A -> A1

Decision:
+----------+------+------+
| Option   | Pros | Cons |
+----------+------+------+
| Option A | 3    | 1    | <-- chosen
| Option B | 2    | 2    |
+----------+------+------+

Systems:
+----------+      +----------+
|  Auth    | ---> |  DB      |
+----------+      +----------+
     ^                 |
     |                 v
     +---- Cache <-----+

Graph of thought:
(Concept A) --> influences --> (Concept B)
     |                              |
     v                              v
(Concept C) <-- contradicts <-- (Concept D)

Beam search:
Iteration 3, Width: 5
[1] Score: 0.92 (selected)
[2] Score: 0.88 (selected)
[3] Score: 0.85 (selected)
[4] Score: 0.71 (pruned)
[5] Score: 0.65 (pruned)

MCTS:
       [root] (visits: 100)
      /   |   \
   [A]  [B]  [C]
   30v  50v  20v
   0.8  0.9  0.6
    ^    *
Best: B (highest value)
```

**Implementation**: Generate ASCII based on operation type and stored content. Present after primary reasoning output.

### --challenge: Adversarial Critique

**When to apply**: After primary operation completes, generate adversarial critique.

**Applicable operations**: debug, decide, systems, meta, mental_model, creative_thinking, causal_analysis

**Workflow**:
1. Complete primary operation
2. Store result
3. Generate adversarial analysis with:
   - Assumptions being made
   - What could go wrong
   - Devil's advocate on conclusion
   - Blind spots
   - Alternative interpretations
4. Present both sections

**Output format**:

```
## Primary Analysis
[Primary operation output]

---

## Adversarial Critique

### Assumptions
- [List assumptions in primary analysis]

### Risks
- [What could go wrong with this approach]

### Devil's Advocate
[Argue against the primary conclusion]

### Blind Spots
[What the analysis might be missing]

### Alternative Interpretations
[Other ways to interpret the data]
```

**Implementation**: After primary operation, generate structured critique. Do NOT call MCP again; generate inline and append to output.

---

## Phase 3: Present Results

After completing the reasoning chain, present clearly. Output is bottom-anchored for terminal reading.

**Default mode (constraint chain):**

```
# Think: [Topic]

## Entry Point
What is the question: [concise framing]
What is uncertain: [key unknowns]

## Exploration
### [MODE 1]: [2-3 sentence key finding]
### [MODE 2]: [2-3 sentence key finding]

## What the Protocol Caught

| Assumption / Default | Caught By | Outcome |
|---------------------|-----------|---------|
| [what we initially believed] | [self-check, verify-or-defer, constraint] | [what actually held up] |
| [concern raised then checked] | [verification or deferral] | [result] |

## Summary
[2-3 sentences: the key insight and what changed or became clear]

## Where to Go Next
-> /deepthink "[question needing adversarial exploration]"
   _[why this needs pre-mortem stress-testing]_
-> /problem-solve "[decision point]"
   _[why this needs convergent decision-making]_
-> /plan "[implementation task]"
   _[if ready to implement]_
```

**Specialized modes (--debug, --decide, --model, etc.):**

```
## Think: [Topic]

### [Analysis type: Debug / Decision / Model / etc.]
[Structured output from the capstone operation]

### Summary
[2-3 sentence synthesis]

### Where to Go Next
[Routed follow-ups]
```

**--creative mode:**

```
## Creative Thinking: [Topic]

### Default Gravity
The obvious approach: [what trained defaults suggest]
Assumed constraints: [constraints that might not be real]

### Exploration
[Creative ideas with non-obvious marker]

### Synthesis
Most interesting non-default: [idea]
Why it's interesting: [reason]

### Where to Go Next
[Routed follow-ups]
```

---

## Session Operations

### --info: Get Session State

```typescript
{
  operation: "session_info"
}
```

Returns current session state, thought count, etc.

### --export: Export Session

```typescript
{
  operation: "session_export",
  sessionId: "<sessionId>"
}
```

Returns serialized session for persistence.

### --import: Import Session

```typescript
{
  operation: "session_import",
  sessionData: "<serialized session>"
}
```

Restores a previous session to continue reasoning.

---

## Minimum Call Pattern

For specialized operations (single capstone):

1. `thought` (thoughtNumber: 1, nextThoughtNeeded: true) - optional setup
2. Capstone operation (structured completion)

For default mode (constraint chain):

1. ENTER checkpoint
2. Brief ORIENT thought
3. 2-3 mode executions with self-check + constraint checkpoints
4. HARVEST checkpoint

For --light mode:

1. 1-3 mode executions (no checkpoints)
2. Brief summary

---

## Persist Analysis

### Default Mode and --design Mode

Auto-persist via harvest checkpoint (MCP handles file creation). Then:

**Daily Log**: Append to `.claude/cognition/YYYYMMDD-daily.md`:

```markdown
---
### [HH:MM] /think - [Topic slug]
Session: <sessionId>

[1-2 sentence summary of the insight/conclusion]
---
```

**Workshop Entry**:

```bash
workshop --workspace .claude/memory note \
  "/think: [Topic] - [Summary]. Session: <sessionId>" \
  -t think -t cognition
```

### --light Mode

Workshop entry only (no cognition file, no daily log):

```bash
workshop --workspace .claude/memory note \
  "/think --light: [Topic] - [Summary]. Session: <sessionId>" \
  -t think -t light -t cognition
```

### Specialized Modes (capstone operations)

Append to daily log `.claude/cognition/YYYYMMDD-daily.md` + Workshop entry (same as current behavior).

### Error Handling

If persistence fails, display warning and continue - do NOT halt.
