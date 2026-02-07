---
description: Reasoning strategist - recommends which thinking tools (Clear Thought, Sequential) to use and in what sequence for complex problems.
argument-hint: <problem or scenario to reason through>
---

# /contemplate - Reasoning Strategy Advisor

**YOUR ROLE**: Analyze the user's problem and recommend a reasoning strategy using available thinking tools. Uses `orchestration_suggest` internally, then formats the output for humans.

**Original Problem**: $ARGUMENTS

---

## If --help or empty arguments

Display this reference and stop:

```
/contemplate - Reasoning Strategy Advisor

Analyzes your problem and recommends which thinking tools to use.

USAGE:
  /contemplate <problem or scenario>
  /contemplate --help

HOW IT WORKS:
  1. Classifies your problem (type, complexity)
  2. Calls --orchestrate to get recommended operations
  3. Formats output with ready-to-copy commands

EXAMPLES:
  /contemplate Should we use microservices or monolith?
  /contemplate How do I debug this intermittent failure?
  /contemplate Plan migration from Expo to Swift iOS
  /contemplate Optimize our CI/CD pipeline
```

---

## Phase 0.5: Problem-Type Detection

Analyze $ARGUMENTS to classify problem type before selecting operations.

### Problem-Type Routing Table

| Problem Type | Characteristics | Primary Technique | Evidence |
|--------------|-----------------|-------------------|----------|
| **EXPLORATION** | Confused, need options, "what could we do?" | Tree-of-Thought | 74% vs 4% (18x) |
| **COMPOSITIONAL** | Multi-step, build on sub-solutions | Least-to-Most decomposition | 99.7% vs 16% |
| **AGGREGATION** | Combine multiple outputs, merge perspectives | Graph-of-Thought | 62% over ToT |
| **ARITHMETIC/MATH** | Calculations, quantitative reasoning | Self-Consistency | Consistent gains |
| **CODE/TECHNICAL** | Implementation, debugging, refactoring | Reflexion loop | 91% vs 80% |
| **DECISION** | Choose between options, trade-offs | Decide + Challenge | Standard |
| **RISK** | What could go wrong, failure modes | Pre-mortem inversion | Standard |
| **STRATEGIC** | Long-term planning, multi-phase | Full /problem-solve | Standard |

### Detection Heuristics

- Contains "what could", "options for", "explore" → EXPLORATION
- Contains "step by step", "then", "first...then" → COMPOSITIONAL
- Contains "combine", "synthesize", "multiple" → AGGREGATION
- Contains numbers, "calculate", "estimate" → ARITHMETIC
- Contains "debug", "implement", "refactor", "code" → CODE
- Contains "choose", "vs", "trade-off", "decide" → DECISION
- Contains "risk", "fail", "wrong", "danger" → RISK
- Contains "plan", "strategy", "long-term" → STRATEGIC

### Detection Output

Before proceeding to Phase 1, output:

```
**Problem Type Detected:** [TYPE]
**Rationale:** [Why this classification based on detected keywords/patterns]
**Primary Technique:** [From routing table]
**Maps to:** /think --[flag] or /problem-solve --[variant]
```

---

## Phase 1: Problem Classification

Analyze $ARGUMENTS and determine:

### Complexity Level
- **simple**: Single decision, clear options (2-3 operations)
- **medium**: Multiple factors, some uncertainty (3-5 operations)
- **complex**: Many variables, dependencies, unknowns (5-8 operations)

### Problem Characteristics
Note which apply:
- Has clear options to evaluate? → needs `decide`
- Involves multiple stakeholders? → needs `collaborative_reasoning`
- Has sequential dependencies? → needs `thought` chains
- Involves system interactions? → needs `systems`
- Needs cause-effect analysis? → needs `causal_analysis`
- Is time-critical? → needs `ooda_loop`
- Is high-stakes/irreversible? → needs `ulysses_protocol`
- Needs risk assessment? → needs `mental_model` (pre-mortem/inversion)
- Needs idea generation? → needs `creative_thinking` or `tree_of_thought`

---

## Phase 2: Call orchestration_suggest

**Verbose flag**: Include `verbose: true` in the cognition MCP call. Since /contemplate is a single orchestration call, the echo IS the output.

Call `mcp__cognition-mcp__cognition` with operation `orchestration_suggest`:

```typescript
{
  operation: "orchestration_suggest",
  sessionTitle: "Contemplate: <problem summary>",
  content: {
    task: "<the user's problem from $ARGUMENTS>",
    complexity: "<simple|medium|complex>",
    suggestedOperations: [
      { operation: "<operation name>", reason: "<why this helps>", order: 1 },
      { operation: "<operation name>", reason: "<why this helps>", order: 2 },
      // ... based on problem characteristics
    ],
    alternativeApproaches: [
      { approach: "<alternative>", tradeoffs: "<when to use instead>" }
    ],
    recommendation: "<1-2 sentence summary of the approach>"
  }
}
```

### Operation Selection Guide

| Problem Type | Typical Operations |
|--------------|-------------------|
| Architecture/Design | systems → collaborative_reasoning → decide → mental_model (inversion) |
| Debugging | debug → causal_analysis → tree_of_thought |
| Decision Making | decide → collaborative_reasoning → mental_model → socratic_method |
| Planning/Strategy | systems → mental_model (pre-mortem) → tree_of_thought → decide → ulysses_protocol |
| Optimization | causal_analysis → statistical_reasoning → optimization |
| Exploration | creative_thinking → tree_of_thought → analogical_reasoning |
| Risk Assessment | mental_model (inversion) → systems → ulysses_protocol |
| Incident Response | ooda_loop → debug → meta |

---

## Phase 3: Format Output

Transform the orchestration_suggest response into human-readable format:

```markdown
## Reasoning Strategy for: [Problem Summary]

**Problem Type**: [From Phase 0.5 detection]
**Complexity**: [simple/medium/complex]
**Key Challenge**: [What makes this hard - from your analysis]

### Routing Recommendation

Based on problem type **[TYPE]**, the primary technique is **[TECHNIQUE]**.

This maps to:
- /think --[flag]: [specific prompt based on problem type]

OR for complex problems:
- /problem-solve --[variant]: [specific prompt]

---

### Recommended Approach

**Phase 1: [Operation Name]** - [Reason from suggestedOperations]
```
/think --[flag] [Generate a specific, ready-to-use prompt for this phase]
```

**Phase 2: [Operation Name]** - [Reason]
```
/think --[flag] [Specific prompt]
```

[Continue for all suggested operations]

---

### Alternative Approaches

[From alternativeApproaches in the response]

---

### Quick Start

Copy this to begin:
```
/think --[first flag] [First prompt]
```

---

Ready to begin? I can run the first phase now, or you can copy the
commands above to work through them step by step.
```

---

## Phase 4: Operation-to-Flag Mapping

When generating prompts, map operations to flags:

| Operation | Flag | Prompt Template |
|-----------|------|-----------------|
| thought | (none) | [problem statement] |
| mental_model | --model [name] | [problem framed for that model] |
| debug | --debug | [issue description with symptoms] |
| decide | --decide | [decision statement with options] |
| meta | --meta | [process to evaluate] |
| systems | --systems | [system to map] |
| creative_thinking | --creative | [creative challenge] |
| visual_reasoning | --spatial | [what to visualize] |
| causal_analysis | --causal | [phenomenon to analyze] |
| ooda_loop | --ooda | [situation requiring rapid response] |
| ulysses_protocol | --ulysses | [goal requiring pre-commitment] |
| tree_of_thought | --tree | [options to explore] |
| beam_search | --beam | [parallel paths to evaluate] |
| mcts | --monte-carlo | [complex decision tree] |
| graph_of_thought | --graph | [concepts to connect] |
| collaborative_reasoning | --collab | [topic with perspectives to include] |
| socratic_method | --socratic | [claim to question] |
| structured_argumentation | --argue | [thesis to defend] |
| research | --research | [question to investigate] |
| analogical_reasoning | --analogy | [target domain + source domains] |
| statistical_reasoning | --stats | [question with data] |
| simulation | --simulate | [scenario to simulate] |
| optimization | --optimize | [objective with constraints] |
| ethical_analysis | --ethics | [situation with stakeholders] |
| orchestration_suggest | --orchestrate | [task to plan] |

---

## Example Flow

**Input**: `/contemplate Should we rewrite our auth system or incrementally improve it?`

**Step 1**: Classify as Architecture/Design, complexity: complex

**Step 2**: Call orchestration_suggest:
```typescript
{
  operation: "orchestration_suggest",
  content: {
    task: "Should we rewrite our auth system or incrementally improve it?",
    complexity: "complex",
    suggestedOperations: [
      { operation: "systems", reason: "Map current auth architecture", order: 1 },
      { operation: "mental_model", reason: "Identify failure modes via pre-mortem", order: 2 },
      { operation: "tree_of_thought", reason: "Explore rewrite vs incremental options", order: 3 },
      { operation: "decide", reason: "Evaluate options against criteria", order: 4 },
      { operation: "ulysses_protocol", reason: "High-stakes commitment needs safeguards", order: 5 }
    ],
    alternativeApproaches: [
      { approach: "Start with --ooda if there's active security pressure", tradeoffs: "Faster but less thorough" }
    ],
    recommendation: "Full 5-phase analysis recommended given the stakes and complexity of auth systems"
  }
}
```

**Step 3**: Format output with specific prompts:

```markdown
## Reasoning Strategy for: Auth System Rewrite Decision

**Complexity**: complex
**Key Challenge**: Auth is critical infrastructure - wrong choice has security and velocity implications

---

### Recommended Approach

**Phase 1: Systems Mapping** - Map current auth architecture
```
/think --systems "Our auth system: components, dependencies, pain points, and integration touchpoints"
```

**Phase 2: Risk Identification** - Identify failure modes via pre-mortem
```
/think --model pre-mortem "The auth rewrite failed after 6 months. What went wrong?"
```

**Phase 3: Option Exploration** - Explore rewrite vs incremental options
```
/think --tree "Auth improvement options: full rewrite, incremental refactor, third-party replacement, modular extraction"
```

**Phase 4: Decision Framework** - Evaluate options against criteria
```
/think --decide "Auth strategy: full rewrite vs incremental improvement vs third-party"
```

**Phase 5: Commitment Protocol** - High-stakes commitment needs safeguards
```
/think --ulysses "Committing to [chosen auth strategy] with safeguards"
```

---

### Alternative Approaches

If there's active security pressure, consider:
- Start with `/think --ooda` for rapid response, then return to full analysis

---

### Quick Start

Copy this to begin:
```
/think --systems "Our auth system: components, dependencies, pain points, and integration touchpoints"
```

---

### Next Steps

Based on the recommended strategy:

**If the problem is clear and you're ready to execute:**
→ Execute the first recommended phase above

**If the problem feels too complex/uncertain:**
→ /deepthink "[the problem]" before committing to a strategy

**If you need a quick decision now:**
→ /problem-solve --quick "[decision statement]"

**If this is high-stakes and needs full rigor:**
→ /problem-solve "[the problem]"

---

Ready to begin? I can run the first phase now, or you can copy the
commands above to work through them step by step.
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
### [HH:MM] /contemplate - [Topic slug]
Session: <sessionId>

[1-2 sentence summary of the recommended strategy]
---
```

### Step 3: Write Workshop Entry

```bash
workshop --workspace .claude/memory note \
  "/contemplate: [Topic] - [Recommended approach]. Session: <sessionId>" \
  -t contemplate -t cognition
```

### Error Handling

If persistence fails, display warning and continue - do NOT halt.
