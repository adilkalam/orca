---
description: Sequential thinking with accept-store-echo pattern via cognition-mcp
argument-hint: [--flag] <problem or question>
---

# /think - Sequential Thinking

**YOUR ROLE**: Build reasoning chains by making MULTIPLE calls to `mcp__cognition-mcp__cognition`. Each call stores a thought step; the MCP echoes it back unchanged.

**Input**: $ARGUMENTS

---

## If --help or empty arguments

Display this reference and stop:

```
/think - Sequential Thinking (cognition-mcp)

USAGE:
  /think [--flag] <prompt>
  /think --help

PRIMARY FLAGS (pick reasoning mode):
    (none)           Sequential thought chain (default)
    --debug          Debug approach capstone
    --decide         Decision framework capstone
    --model <name>   Mental model capstone
    --meta           Metacognitive analysis
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
  /think --debug Why is authentication failing?
  /think --model inversion How could this migration fail?
  /think --decide Microservices vs monolith
  /think --systems How do these components interact?
  /think --creative How could we gamify this feature?
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

---

## Phase 1: Parse Arguments

Extract from $ARGUMENTS:

1. **Primary flag** (optional, one of):
   - `--debug` - Complete with debugging analysis
   - `--decide` - Complete with decision framework
   - `--model <name>` - Complete with mental model analysis (kebab-case)
   - `--meta` - Complete with metacognitive monitoring
   - `--systems` - Complete with systems thinking
   - `--spatial` - Visual/spatial reasoning (visual_reasoning operation)
   - `--creative` - Creative thinking (creative_thinking operation)
   - `--causal` - Causal analysis (causal_analysis operation)
   - `--ooda` - OODA loop (ooda_loop operation)
   - `--ulysses` - Precommitment protocol (ulysses_protocol operation)

2. **Modifier flags** (optional, combine with primary):
   - `--visual` - Generate ASCII diagram after primary operation
   - `--challenge` - Run adversarial critique after primary operation

3. **Session flags** (optional):
   - `--info` - Get session state
   - `--export` - Export session
   - `--import <data>` - Import session

4. **Prompt**: Everything after flags

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

## Phase 2: Sequential Thinking Flow

### Step 1: Initial Thought

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

### Step 2-N: Continue Reasoning

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

### Step N+1: Complete (or Capstone)

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
// Read: quick-reference/mental-models/<model-name>.md
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

// For --creative (creative_thinking)
{
  operation: "creative_thinking",
  sessionId: "<sessionId>",
  content: {
    prompt: "<the creative challenge>",
    techniques: ["<technique 1: e.g. brainstorming, lateral thinking>"],
    ideas: [
      { idea: "<idea description>", potential: "<why this could work>", challenges: ["<challenge 1>"] }
    ],
    synthesis: "<combining ideas into solution>",
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

After completing the reasoning chain, present clearly:

```
## Thinking: [Topic]

### Reasoning Chain
1. [Thought 1 summary]
2. [Thought 2 summary]
...

### [Conclusion / Debug Analysis / Decision / etc.]
[Final output based on capstone or final thought]
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

For simple problems (3-5 thoughts):

1. `thought` (thoughtNumber: 1, nextThoughtNeeded: true)
2. `thought` (thoughtNumber: 2, nextThoughtNeeded: true)
3. `thought` (thoughtNumber: 3, nextThoughtNeeded: false) OR capstone operation

For complex problems (5-10+ thoughts):

1. `thought` x N (building understanding)
2. Capstone operation (structured completion)

---

## Default Behavior

If no flags provided:
1. Begin sequential thinking with operation: "thought"
2. Make 3-5 calls to build reasoning chain
3. Complete with nextThoughtNeeded: false on final thought
4. Present the reasoning chain and conclusion
