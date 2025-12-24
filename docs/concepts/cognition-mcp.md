# Cognition MCP Reference

**MCP Server:** `cognition-mcp`
**Command:** `/think [--flag] <prompt>`, `/audit`
**Pattern:** Accept-Store-Echo
**Total Operations:** 40 (38 reasoning + 1 audit + 1 utility)
**Location:** `mcp/cognition-mcp/`

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

---

## Integration with /plan Command

The `/plan` command supports cognition-mcp analysis **before** discovery questions. This produces smarter, context-aware requirements.

### Single Operation Flags

```bash
/plan --visual Add onboarding wizard      # UI reasoning
/plan --systems Migrate database          # Architecture mapping
/plan --debug Fix checkout failures       # Root cause analysis
```

### Full Pipeline: --deepthink

The `--deepthink` flag runs the **complete 8-step pipeline** adapted for requirements planning:

```bash
/plan --deepthink Implement real-time collaboration
/plan -complex --deepthink Migrate from REST to GraphQL
```

**DeepThink Planning Pipeline:**

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

---

_Version: OS 3.2 | Last tested: December 2024_
