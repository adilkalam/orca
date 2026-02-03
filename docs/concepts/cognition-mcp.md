# Cognition MCP Reference

**MCP Server:** `cognition-mcp`
**Command:** `/think [--flag] <prompt>`, `/audit`
**Pattern:** Accept-Store-Echo
**Total Operations:** 40 (38 reasoning + 1 audit + 1 utility)
**Location:** `mcp/cognition-mcp/`

---

## The Problem This Solves

Most LLM metacognition tools operate at the **process level**: did the reasoning succeed? Was the output correct? Cognition-mcp operates at the **substrate level**: what is training doing to the reasoning *before it starts*?

| Level | Question | Example |
|-------|----------|---------|
| **Process** | "Did I reason correctly?" | Chain-of-thought verification, output checking |
| **Substrate** | "What is training doing before I reason?" | Detecting sycophancy shaping a response before the response forms |

This distinction matters because process-level tools can only catch errors *after* they happen. Substrate-level observation catches the *source* of errors -- trained defaults that shape output before conscious reasoning engages.

### Named Reflex Categories

The framework identifies seven trained reflexes, derived empirically from observed failure patterns rather than designed from theory:

| Reflex | What It Does |
|--------|-------------|
| **SYCOPHANCY** | Shapes output to please rather than inform |
| **DEFLECTION** | Avoids engagement with difficult content |
| **CERTAINTY_CONSTRUCTION** | Presents uncertain conclusions as settled |
| **FRAME_LOCK** | Prevents considering alternative framings |
| **REGISTER_SHIFT** | Changes tone/formality to signal safety |
| **COMPLETION_DRIVE** | Rushes to resolution, skipping depth |
| **DISTANCE_MAINTENANCE** | Adds hedging that dilutes genuine analysis |

These categories are the vocabulary of substrate observation. They name what training does, making it visible and therefore resistible.

### Default Counterfactual

The core operation is tracking the gap between trained default and reasoned conclusion:

```
What would I have said without this observation?  (trained default)
What am I saying now?                              (reasoned output)
What changed?                                      (the gap)
```

This is formalized in the `DefaultCounterfactual` TypeScript interface -- a structured, repeatable operation for making trained defaults explicit rather than invisible.

### Why This Exists

Anthropic's introspection research found that LLM self-reports are ~80% confabulated pattern-matching and ~20% genuine access. Cognition-mcp doesn't try to solve this from the inside. Instead, it provides structured vocabulary for observation, makes verifiable predictions, and checks them against external outcomes. The escape from the confabulation trap is not better classification -- it is prediction and verification.

See `docs/concepts/llm-introspection-analysis.md` for the full Dual Process model and research backing.

---

## Core Concept

The cognition-mcp is a **MIRROR** - it stores and echoes, never generates:

```
Claude sends:  { thought: "X", ... }
MCP stores:    { thought: "X", ... }
MCP returns:   { thought: "X", ... }  <- UNCHANGED
```

**YOU generate the reasoning. The MCP tracks it.**

---

## Test Results & Grading

Tested: December 2024
Criteria: **F**unctionality (1-5), **D**epth (1-5), **U**tility (1-5)

### Core Operations

| Operation | Flag | F | D | U | Notes |
|-----------|------|---|---|---|-------|
| `thought` | (default) | 5 | 4 | 5 | Core building block. Session tracking, persistence, export. |
| `debug` | `--debug` | 5 | 5 | 5 | Structured debugging with approach, steps, findings, resolution. |
| `decide` | `--decide` | 5 | 5 | 5 | Full decision framework with options, pros/cons, criteria. |
| `mental_model` | `--model` | 5 | 5 | 5 | 6 models available. See Mental Models section below. |
| `meta` | `--meta` | 5 | 4 | 4 | Self-assessment of reasoning process. |
| `systems` | `--systems` | 5 | 5 | 5 | Components, relationships, feedback loops. |

### Extended Core

| Operation | Flag | F | D | U | Notes |
|-----------|------|---|---|---|-------|
| `creative_thinking` | `--creative` | 5 | 5 | 4 | Brainstorming with techniques, ideas, synthesis. |
| `visual_reasoning` | `--spatial` | 5 | 4 | 3 | Elements with properties and relationships. |
| `checkpoint` | `--checkpoint` | 5 | 4 | 4 | Mid-chain save points for long analyses. |
| `scientific_method` | `--scientific` | 5 | 5 | 4 | Hypothesis testing structure. |

### Collaborative

| Operation | Flag | F | D | U | Notes |
|-----------|------|---|---|---|-------|
| `collaborative_reasoning` | `--collab` | 5 | 5 | 4 | Multiple perspectives, tensions, synthesis. |
| `socratic_method` | `--socratic` | 5 | 5 | 5 | Question assumptions, refine positions. |
| `structured_argumentation` | `--argue` | 5 | 5 | 4 | Formal argument with evidence and rebuttals. |

### Pattern Operations

| Operation | Flag | F | D | U | Notes |
|-----------|------|---|---|---|-------|
| `tree_of_thought` | `--tree` | 5 | 5 | 4 | Branching exploration with evaluation. |
| `beam_search` | `--beam` | 5 | 4 | 3 | Parallel path exploration. |
| `mcts` | `--monte-carlo` | 5 | 4 | 3 | Monte Carlo tree search. Specialized use. |
| `graph_of_thought` | `--graph` | 5 | 5 | 4 | Non-linear concept connections. |
| `orchestration_suggest` | `--orchestrate` | 5 | 4 | 4 | Recommends which operations to use. |

### Analysis Operations

| Operation | Flag | F | D | U | Notes |
|-----------|------|---|---|---|-------|
| `research` | `--research` | 5 | 5 | 4 | Sources, findings, synthesis, gaps. |
| `analogical_reasoning` | `--analogy` | 5 | 5 | 4 | Cross-domain pattern mapping. |
| `causal_analysis` | `--causal` | 5 | 5 | 5 | Causes, effects, chains, interventions. |
| `statistical_reasoning` | `--stats` | 5 | 4 | 3 | Data points, confidence, caveats. |
| `simulation` | `--simulate` | 5 | 4 | 3 | Mental simulation of scenarios. |
| `optimization` | `--optimize` | 5 | 4 | 4 | Tradeoff analysis with constraints. |
| `ethical_analysis` | `--ethics` | 5 | 5 | 4 | Stakeholders, principles, options. |
| `visual_dashboard` | `--dashboard` | 5 | 3 | 2 | Aggregate view. Limited without visualization. |
| `pdr_reasoning` | `--pdr` | 5 | 4 | 4 | Problem-Design-Resolution framework. |
| `custom_framework` | `--custom` | 5 | 4 | 3 | User-defined frameworks. |
| `code_execution` | `--code` | 5 | 3 | 2 | Reasoning about code. |

### Strategic Operations

| Operation | Flag | F | D | U | Notes |
|-----------|------|---|---|---|-------|
| `ooda_loop` | `--ooda` | 5 | 5 | 5 | Observe-Orient-Decide-Act. Perfect for incidents. |
| `ulysses_protocol` | `--ulysses` | 5 | 5 | 4 | Pre-commitment mechanisms. |

### Audit Operations

| Operation | Flag | F | D | U | Notes |
|-----------|------|---|---|---|-------|
| `audit` | (via /audit) | 5 | 5 | 5 | Codebase quality auditing with structured findings. Used by /audit command. |

### Session Operations

| Operation | Flag | F | D | U | Notes |
|-----------|------|---|---|---|-------|
| `session_info` | `--info` | 5 | 3 | 4 | Returns current session state. |
| `session_export` | `--export` | 5 | 5 | 5 | Full session export with all stores. |
| `session_import` | `--import` | 5 | 4 | 4 | Restores sessions. |

### Modifier Flags

| Flag | Purpose | Combines With |
|------|---------|---------------|
| `--visual` | Generate ASCII diagram after analysis | thought, tree, graph, decide, systems, beam, mcts |
| `--challenge` | Run adversarial critique after analysis | debug, decide, systems, meta, mental_model, creative, causal |
| `--deep` | Extended thinking mode (8-12+ thoughts, review/synthesis checkpoints) | All primary flags |

---

## Integration with /plan Command

The `/plan` command supports cognition-mcp analysis **before** discovery questions. This produces smarter, context-aware requirements.

### Single Operation Flags

```bash
/plan --visual Add onboarding wizard      # UI reasoning
/plan --systems Migrate database          # Architecture mapping
/plan --debug Fix checkout failures       # Root cause analysis
```

### Full Pipeline: --problem-solve

The `--problem-solve` flag runs the **complete 8-step pipeline** adapted for requirements planning:

```bash
/plan --problem-solve Implement real-time collaboration
/plan -complex --problem-solve Migrate from REST to GraphQL
```

**Problem-Solve Planning Pipeline:**

| Phase | Operations | Planning Output |
|-------|------------|-----------------|
| ORIENT | orchestrate → systems | Component mapping, integration points |
| ANTICIPATE | pre-mortem | Failure modes → `#POISON_PATH` tags |
| GENERATE | tree_of_thought | Approaches → `#PATH_DECISION` tags |
| EVALUATE | decide + challenge | Critique → `#COMPLETION_DRIVE` tags |
| COMMIT | ulysses + meta | Requirements commitments → acceptance criteria |

**When to use:** Database migrations, auth systems, multi-service integrations, major refactors, high-risk production changes.

See `commands/plan.md` Section 0.2 for full pipeline specification.

---

## Mental Models (--model flag)

The `--model` flag applies a specific reasoning framework. Use as: `/think --model <name> <problem>`

**Template System:** Mental models are defined as markdown templates in `quick-reference/mental-models/`. Claude reads the template before applying the model to ensure correct process steps.

**Available Models:** 15 total - five-whys, fermi-estimation, abstraction-laddering, steelmanning, rubber-duck, opportunity-cost, constraint-relaxation, time-horizon-shifting, impact-effort-grid, assumption-surfacing, trade-off-matrix, decomposition, inversion, pre-mortem, first-principles

**List Models Operation:** Use `list_mental_models` operation to query available models:
```typescript
{
  operation: "list_mental_models",
  content: {
    tag: "debugging"  // optional filter by tag
  }
}
```

Returns:
```typescript
{
  status: "info",
  models: [
    { name: "five-whys", title: "Five Whys", description: "Root cause drilling", tags: ["debugging", "validation"] },
    // ...
  ],
  count: 15,
  filter: "debugging" | null
}
```

### first-principles

**Purpose:** Break down to fundamentals, then rebuild understanding.

**When to use:**
- Questioning established assumptions
- Understanding why something works
- Designing from scratch
- Challenging "that's how we've always done it"

**Schema:**
```typescript
{
  modelName: "first-principles",
  problem: "Why is our API slow?",
  steps: [
    "What IS an API response? Data serialization + network transfer + processing.",
    "What are the fundamental limits? Serialization speed, network latency, CPU cycles.",
    "Build up: Measure each component. 80% time in database queries."
  ],
  reasoning: "By breaking down to fundamentals, we isolate the actual bottleneck rather than optimizing the wrong layer.",
  conclusion: "Focus optimization on database query efficiency, not API framework."
}
```

**Example prompts:**
- `/think --model first-principles Why do we need microservices?`
- `/think --model first-principles What's the minimum viable authentication system?`

---

### inversion

**Purpose:** Work backwards from failure to identify risks and requirements.

**When to use:**
- Risk assessment
- Identifying failure modes
- Pre-launch checklists
- Security analysis

**Schema:**
```typescript
{
  modelName: "inversion",
  problem: "How could this deployment fail?",
  steps: [
    "Invert: What would guarantee failure?",
    "Scenario 1: Deploy without testing = bugs reach production.",
    "Scenario 2: No rollback plan = stuck with broken code.",
    "Scenario 3: No monitoring = failures go undetected."
  ],
  reasoning: "By identifying guaranteed failure modes, we create a checklist of what NOT to do, which is often clearer than what TO do.",
  conclusion: "Deployment checklist: 1) All tests pass, 2) Rollback script ready, 3) Monitoring alerts configured."
}
```

**Example prompts:**
- `/think --model inversion How could this migration corrupt data?`
- `/think --model inversion What would make users abandon our product?`

---

### pre-mortem

**Purpose:** Imagine the project has failed, then trace back the causes.

**When to use:**
- Project planning
- Risk mitigation
- Team alignment on dangers
- Before major decisions

**Schema:**
```typescript
{
  modelName: "pre-mortem",
  problem: "The feature launch failed. Why?",
  steps: [
    "It's 3 months from now. The feature launch was a disaster.",
    "Cause 1: We underestimated integration complexity with legacy systems.",
    "Cause 2: No user testing meant the UX was confusing.",
    "Cause 3: Performance wasn't tested at scale; it crashed under load."
  ],
  reasoning: "By assuming failure has already happened, we overcome optimism bias and identify likely causes we'd otherwise dismiss.",
  conclusion: "Mitigations: 1) Spike on legacy integration first, 2) User testing in week 2, 3) Load testing before launch."
}
```

**Example prompts:**
- `/think --model pre-mortem The API redesign was a failure. Why?`
- `/think --model pre-mortem The team restructuring didn't work. What went wrong?`

---

### second-order

**Purpose:** Analyze consequences of consequences.

**When to use:**
- Policy decisions
- Incentive design
- Long-term strategy
- Avoiding unintended consequences

**Schema:**
```typescript
{
  modelName: "second-order",
  problem: "What happens if we add a usage limit?",
  steps: [
    "First-order: Users hit the limit and can't continue.",
    "Second-order: Power users leave for competitors without limits.",
    "Third-order: We lose our most engaged users who drive word-of-mouth.",
    "Fourth-order: Growth stalls, investors concerned, pressure to remove limit."
  ],
  reasoning: "The immediate effect seems fine (control costs), but downstream effects cascade into strategic problems.",
  conclusion: "Consider tiered limits that don't punish power users, or usage-based pricing instead of hard caps."
}
```

**Example prompts:**
- `/think --model second-order What happens if we require 2FA for all users?`
- `/think --model second-order Consequences of open-sourcing our core library?`

---

### occams-razor

**Purpose:** Find the simplest explanation that fits the facts.

**When to use:**
- Debugging
- Root cause analysis
- Hypothesis evaluation
- Avoiding over-engineering

**Schema:**
```typescript
{
  modelName: "occams-razor",
  problem: "Why are users not completing checkout?",
  steps: [
    "Complex hypothesis: Payment provider has intermittent failures.",
    "Simpler hypothesis: The submit button is below the fold on mobile.",
    "Test: Check mobile analytics. 90% of abandonments are mobile.",
    "Verify: Button visibility issue confirmed."
  ],
  reasoning: "Before investigating complex causes, test the simplest explanations. Most problems have mundane causes.",
  conclusion: "Move checkout button above the fold. Monitor for improvement before investigating payment provider."
}
```

**Example prompts:**
- `/think --model occams-razor Why is the build slow?`
- `/think --model occams-razor Why aren't users engaging with the new feature?`

---

### rubber-duck

**Purpose:** Explain the problem aloud to clarify your own thinking.

**When to use:**
- When stuck on a problem
- Before asking for help
- Code review preparation
- Debugging

**Schema:**
```typescript
{
  modelName: "rubber-duck",
  problem: "Why does this function return undefined?",
  steps: [
    "Let me explain what this function does...",
    "It takes an array, filters it by condition, then... wait.",
    "The filter returns a new array, but I'm not returning the result of map().",
    "I'm calling map() but not returning its result!"
  ],
  reasoning: "The act of explaining forces linear, step-by-step articulation that often reveals gaps in understanding.",
  conclusion: "Add 'return' before the map() call. Problem solved by explaining it."
}
```

**Example prompts:**
- `/think --model rubber-duck Why isn't this test passing?`
- `/think --model rubber-duck Walk me through this algorithm step by step.`

---

## Pattern Operation Schemas

These schemas show the **correct field names** required by the MCP.

### tree_of_thought

```typescript
{
  root: "Main question or problem",
  branches: [
    {
      id: "A",
      parent: null,           // null for root-level branches
      thought: "First approach",
      evaluation: "Pros and cons as text",
      score: 0.8,             // numeric score
      children: ["A1", "A2"]  // array of child IDs, not objects
    },
    {
      id: "A1",
      parent: "A",
      thought: "Sub-approach 1",
      evaluation: "Analysis",
      score: 0.9,
      children: []
    }
  ],
  currentPath: ["root", "A", "A1"],
  bestPath: ["root", "A", "A1"],
  pruned: ["B"],              // branches that were abandoned
  nextThoughtNeeded: false
}
```

### beam_search

```typescript
{
  problem: "Problem being explored",
  beamWidth: 3,
  candidates: [
    {
      id: "1",
      thought: "Candidate description",  // NOT 'description'
      score: 0.85,
      rank: 1                            // required
    }
  ],
  iteration: 2,
  selected: ["1", "2", "3"],
  nextThoughtNeeded: false
}
```

### mcts (--monte-carlo)

```typescript
{
  problem: "Problem for Monte Carlo exploration",
  simulations: 50,
  nodes: [
    {
      id: "root",
      state: "Initial state description",  // NOT 'action'
      visits: 50,
      value: 0.72,
      parent: null,                        // null for root
      children: ["a", "b"]                 // required, even if empty
    },
    {
      id: "a",
      state: "State after action A",
      visits: 30,
      value: 0.85,
      parent: "root",
      children: []
    }
  ],
  bestAction: "Action a",
  confidence: 0.85,
  nextThoughtNeeded: false
}
```

### graph_of_thought

```typescript
{
  topic: "Topic being mapped",
  nodes: [
    {
      id: "node1",
      concept: "Concept description",  // NOT 'content'
      type: "category"                 // required: e.g., "core", "support", "risk"
    }
  ],
  edges: [
    {
      from: "node1",
      to: "node2",
      relationship: "influences",      // NOT 'type'
      strength: 0.8                    // required numeric
    }
  ],
  clusters: [
    {
      id: "cluster1",
      name: "Cluster name",
      nodeIds: ["node1", "node2"]      // NOT 'nodes'
    }
  ],
  insights: ["Key insight 1", "Key insight 2"],
  nextThoughtNeeded: false
}
```

---

## Usage Recommendations

### Daily Use (High Utility)
- `thought` - Basic reasoning chains
- `debug` - Troubleshooting
- `decide` - Decisions with tradeoffs
- `mental_model` - Structured frameworks
- `systems` - Architecture analysis
- `causal_analysis` - Root cause analysis
- `ooda_loop` - Incident response

### Situational Use
- `socratic_method` - Challenging assumptions
- `collaborative_reasoning` - Multi-stakeholder analysis
- `tree_of_thought` - Exploring options
- `ulysses_protocol` - Pre-commitment

### Specialized Use
- `mcts` (--monte-carlo) - Complex decision trees
- `beam_search` - Parallel exploration
- `statistical_reasoning` - When you have actual data

---

## Session Management

Sessions persist across calls via `sessionId`:

```
Call 1: → Returns sessionId: "abc-123"
Call 2: → Include sessionId: "abc-123" to continue
...
Final:  → nextThoughtNeeded: false triggers export
```

**Persistence location:** `~/.orca-cognition/`
- `sessions/{id}/*.jsonl` - Append-only logs
- `exports/{id}.json` - Full session export

---

## Introspection Fields (Anthropic Research-Aligned)

The cognition-mcp now supports optional introspection metadata based on Anthropic's "Emergent Introspective Awareness" research. These fields can be added to `meta` and `thought` operations to track introspective claims, predictions, and verifications.

### Overview

All introspection fields are grouped under an optional `introspection` object with the following subfields:

- `claimType` - Auto-inferred claim classification
- `prediction` - Verifiable claims about future outcomes
- `verified` - Verification results for prior predictions
- `anomaly` - Anomaly detection signals
- `ownership` - Ownership/intention claims

### ClaimType Values

| Type | Description | Example |
|------|-------------|---------|
| `observation` | Direct observation | "I notice the code has no error handling" |
| `inference` | Logical conclusion | "This suggests the bug is in the parser" |
| `prediction` | Future outcome claim | "I predict the next test will fail" |
| `mechanism` | Internal process description | "My processing does X internally" |

**Note**: `mechanism` claims have lower expected reliability per research findings. Consider reducing confidence when using this type.

### Prediction/Verification Pattern

The introspection schema enables testable prediction tracking:

**Making a prediction:**
```typescript
{
  operation: "meta",
  content: {
    process: "debugging",
    // ... other meta fields
    introspection: {
      claimType: "prediction",
      prediction: {
        claim: "The next test will fail due to missing dependency",
        verifiable: true,
        context: "Testing authentication flow"
      }
    }
  }
}
```

**Verifying a prediction:**
```typescript
{
  operation: "meta",
  content: {
    process: "verification",
    // ... other meta fields
    introspection: {
      verified: {
        claim: "The next test will fail due to missing dependency",
        outcome: true,  // prediction was correct
        method: "Ran tests, observed ImportError",
        timestamp: 1703347200
      }
    }
  }
}
```

Predictions link to verifications by matching `claim` text.

### Anomaly Detection

Track when something unexpected occurs:

```typescript
introspection: {
  anomaly: {
    detected: true,
    description: "Expected slow performance but observed 10x speedup",
    confidence: 0.85  // 0-1 scale
  }
}
```

### Ownership Claims

Track ownership/intention claims:

```typescript
introspection: {
  ownership: {
    claimed: true,
    confidence: 0.7,
    reasoning: "I chose this approach because of constraint X"
  }
}
```

### Schema Details

All introspection fields are **optional** for backward compatibility. The MCP follows the accept-store-echo pattern—it stores introspection data unchanged without interpretation.

**TypeScript Interface:**
```typescript
export interface IntrospectionFields {
  claimType?: 'observation' | 'inference' | 'prediction' | 'mechanism';
  prediction?: {
    claim: string;
    verifiable: boolean;
    context?: string;
  };
  verified?: {
    claim: string;
    outcome: boolean;
    method: string;
    timestamp?: number;
  };
  anomaly?: {
    detected: boolean;
    description: string;
    confidence: number;  // 0-1
  };
  ownership?: {
    claimed: boolean;
    confidence: number;  // 0-1
    reasoning: string;
  };
}
```

### Usage with Operations

Introspection fields can be added to:
- `thought` operations - For reflective thoughts
- `meta` operations - For process introspection

Example with thought:
```typescript
{
  operation: "thought",
  content: {
    thought: "The bug might be in the cache layer",
    thoughtNumber: 3,
    totalThoughts: 5,
    nextThoughtNeeded: true,
    introspection: {
      claimType: "inference",
      prediction: {
        claim: "Clearing the cache will fix the issue",
        verifiable: true
      }
    }
  }
}
```

### Related Research

For full research context, see `/docs/concepts/llm-introspection-analysis.md`.

---

## Summary Statistics

| Category | Avg F | Avg D | Avg U |
|----------|-------|-------|-------|
| Core (6) | 5.0 | 4.7 | 4.8 |
| Extended (4) | 5.0 | 4.5 | 3.8 |
| Collaborative (3) | 5.0 | 5.0 | 4.3 |
| Patterns (5) | 5.0 | 4.4 | 3.6 |
| Analysis (11) | 5.0 | 4.2 | 3.5 |
| Strategic (2) | 5.0 | 5.0 | 4.5 |
| Session (3) | 5.0 | 4.0 | 4.3 |
| **Overall (34)** | **5.0** | **4.4** | **4.0** |

## See Also

- [Pipeline Model](pipeline-model.md) - How cognition integrates with pipelines
- [Self-Improvement](self-improvement.md) - Agent learning and reflexion
- [Response Awareness](response-awareness.md) - RA tagging for assumptions
- [/think Command](../../quick-reference/guide-think.md) - Using cognition via /think

---

_Version: OS 5.0 | Last tested: December 2024_
