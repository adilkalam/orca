# /think Quick Reference

**MCP:** `cognition-mcp`
**Command:** `/think [--flag] <prompt>`
**Pattern:** Accept-Store-Echo (Claude thinks, MCP stores)
**Operations:** 38 total

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

## Quick Start

```bash
/think "Why is this test flaky?"              # Sequential thinking (default)
/think --debug "Why is auth failing?"         # Debug capstone
/think --model first-principles "Why slow?"   # Mental model capstone
/think --decide "Postgres vs MongoDB"         # Decision capstone
/think --systems "How do these connect?"      # Systems capstone
/think --creative "Generate solutions"        # Creative thinking
/think --tree "Explore options"               # Tree of thought
```

---

## All Operations (38)

### Core Operations (7)
| Operation | Purpose | Key Fields |
|-----------|---------|------------|
| `thought` | Sequential reasoning step | thought, thoughtNumber, totalThoughts, nextThoughtNeeded |
| `mental_model` | Apply reasoning framework | modelName, problem, steps, reasoning, conclusion |
| `debug` | Debugging analysis | approach, issue, steps, findings, resolution |
| `decide` | Decision framework | statement, options, criteria, analysis, choice |
| `meta` | Metacognitive monitoring | process, observations, adjustments, effectiveness |
| `systems` | Systems thinking | system, components, relationships, feedbackLoops |
| `creative_thinking` | Brainstorming/ideation | prompt, techniques, ideas, synthesis |
| `visual_reasoning` | Spatial/diagram thinking | description, elements, relationships, insights |
| `checkpoint` | Save mid-chain state | label, summary, keyFindings, openQuestions |
| `scientific_method` | Hypothesis testing | question, hypothesis, experiment, observations, conclusion |

### Collaborative Operations (3)
| Operation | Purpose | Key Fields |
|-----------|---------|------------|
| `collaborative_reasoning` | Multiple perspectives | topic, perspectives, commonGround, tensions, synthesis |
| `socratic_method` | Question assumptions | initialClaim, questions, assumptions, refinedPosition |
| `structured_argumentation` | Formal arguments | claim, premises, evidence, counterarguments, conclusion |

### Analysis Operations (11)
| Operation | Purpose | Key Fields |
|-----------|---------|------------|
| `research` | Structured research | question, sources, findings, synthesis, gaps |
| `analogical_reasoning` | Pattern comparison | target, analogs, mappings, insights, limitations |
| `causal_analysis` | Cause-effect chains | phenomenon, causes, effects, chains, interventions |
| `statistical_reasoning` | Probabilistic thinking | question, data, analysis, confidence, conclusion |
| `simulation` | Mental simulation | scenario, initialConditions, steps, finalState, insights |
| `optimization` | Tradeoff analysis | objective, constraints, variables, tradeoffs, recommendation |
| `ethical_analysis` | Moral reasoning | situation, stakeholders, principles, options, recommendation |
| `visual_dashboard` | Aggregate visualization | title, sections, highlights, alerts |
| `pdr_reasoning` | Problem-Design-Resolution | problem, constraints, design, resolution |
| `custom_framework` | User-defined frameworks | name, description, stages, application, conclusion |
| `code_execution` | Code-based reasoning | language, purpose, code, inputs, output, analysis |

### Pattern Operations (5)
| Operation | Purpose | Key Fields |
|-----------|---------|------------|
| `tree_of_thought` | Branching exploration | root, branches, currentPath, bestPath, pruned |
| `beam_search` | Parallel path exploration | problem, beamWidth, candidates, iteration, selected |
| `mcts` | Monte Carlo tree search (--monte-carlo) | problem, simulations, nodes, bestAction, confidence |
| `graph_of_thought` | Non-linear connections | topic, nodes, edges, clusters, insights |
| `orchestration_suggest` | Meta-pattern recommendation | task, complexity, suggestedOperations, recommendation |

### Strategic Operations (2)
| Operation | Purpose | Key Fields |
|-----------|---------|------------|
| `ooda_loop` | Observe-Orient-Decide-Act | situation, observe, orient, decide, act, iteration |
| `ulysses_protocol` | Pre-commitment mechanisms | goal, temptations, commitments, safeguards, review |

### Notebook Operations (4)
| Operation | Purpose | Key Fields |
|-----------|---------|------------|
| `notebook_create` | Create notebook | name, description, tags, metadata |
| `notebook_add_cell` | Add cell | notebookId, cellType, content, position |
| `notebook_run_cell` | Execute cell | notebookId, cellId, input, output, status |
| `notebook_export` | Export notebook | notebookId, format, includeOutputs, content |

### Session Operations (3)
| Operation | Purpose | Key Fields |
|-----------|---------|------------|
| `session_info` | Get session state | (none - returns current session) |
| `session_export` | Export session | (none - exports current session) |
| `session_import` | Import session | data (session export data) |

---

## Flags

### Original Capstone Operations
| Flag | Operation | Use Case |
|------|-----------|----------|
| `--debug` | `debug` | Debugging analysis |
| `--decide` | `decide` | Decision frameworks |
| `--model <name>` | `mental_model` | Apply mental model |
| `--meta` | `meta` | Metacognitive monitoring |
| `--systems` | `systems` | Systems thinking |

### Core Extensions
| Flag | Operation | Use Case |
|------|-----------|----------|
| `--creative` | `creative_thinking` | Brainstorming, ideation |
| `--visual` | `visual_reasoning` | Diagrams, spatial thinking |
| `--checkpoint` | `checkpoint` | Save mid-chain state |
| `--scientific` | `scientific_method` | Hypothesis testing |

### Collaborative
| Flag | Operation | Use Case |
|------|-----------|----------|
| `--collab` | `collaborative_reasoning` | Multiple perspectives |
| `--socratic` | `socratic_method` | Question assumptions |
| `--argue` | `structured_argumentation` | Formal arguments |

### Analysis
| Flag | Operation | Use Case |
|------|-----------|----------|
| `--research` | `research` | Structured research |
| `--analogy` | `analogical_reasoning` | Pattern comparison |
| `--causal` | `causal_analysis` | Cause-effect analysis |
| `--stats` | `statistical_reasoning` | Probabilistic thinking |
| `--simulate` | `simulation` | Scenario simulation |
| `--optimize` | `optimization` | Tradeoff analysis |
| `--ethics` | `ethical_analysis` | Moral reasoning |
| `--dashboard` | `visual_dashboard` | Aggregate view |
| `--pdr` | `pdr_reasoning` | Problem-Design-Resolution |
| `--custom` | `custom_framework` | User frameworks |
| `--code` | `code_execution` | Code reasoning |

### Patterns
| Flag | Operation | Use Case |
|------|-----------|----------|
| `--tree` | `tree_of_thought` | Branching exploration |
| `--beam` | `beam_search` | Parallel paths |
| `--monte-carlo` | `mcts` | Monte Carlo tree search |
| `--graph` | `graph_of_thought` | Non-linear thinking |
| `--orchestrate` | `orchestration_suggest` | Pattern selection |

### Strategic
| Flag | Operation | Use Case |
|------|-----------|----------|
| `--ooda` | `ooda_loop` | Decision cycles |
| `--ulysses` | `ulysses_protocol` | Pre-commitments |

### Session
| Flag | Operation | Purpose |
|------|-----------|---------|
| `--info` | `session_info` | Get session state |
| `--export` | `session_export` | Export session |
| `--import` | `session_import` | Restore session |

### Modifier Flags (combine with primary)
| Flag | Purpose |
|------|---------|
| `--visual` | Output ASCII diagram of reasoning structure |
| `--challenge` | Run adversarial critique after primary analysis |
| `--deep` | Extended thinking (8-12+ thoughts, review/synthesis checkpoints, branching) |

**--visual output examples:**

Thought chain:
```
[1] Initial analysis
 |
[2] Deeper dive
 |
[3] Conclusion
```

Tree of thought:
```
       [root]
      /   |   \
   [A]   [B]   [C]
   / \    |    (x)
[A1] [A2][B1]
  *
Best: root -> A -> A1
```

**--challenge workflow:**
1. Run primary operation (e.g., --decide)
2. Store result
3. Generate adversarial critique:
   - What assumptions are we making?
   - What could go wrong?
   - Devil's advocate on conclusion
4. Output both: Primary + Challenge

---

## Mental Models (for --model)

| Model | Use When |
|-------|----------|
| `first-principles` | Break down to fundamentals |
| `inversion` | Work backwards from failure |
| `pre-mortem` | Imagine failure, trace causes |
| `second-order` | Consequences of consequences |
| `occams-razor` | Simplest explanation |
| `rubber-duck` | Explain to clarify |

---

## How It Works: Sequential Flow

`/think` makes **MULTIPLE calls** to the MCP, building a reasoning chain:

```
/think --debug "Why is checkout failing?"

Call 1: thought → "Let me use binary search debugging..."
Call 2: thought → "Error happens AFTER payment succeeds..."
Call 3: thought → "Found race condition in webhook handler..."
Call 4: thought → "The fix is to add idempotency check..."
Call 5: debug   → { approach, issue, steps, findings, resolution }
                  ↑ CAPSTONE with substantive content
```

Each call stores a step. The final call is the **capstone** - a structured summary.

---

## The Capstone Pattern

Capstone operations are NOT standalone. They **complete** sequential thinking:

```
WRONG:
  Call 1: debug { steps: ["Identify problem"], findings: "TBD" }
  ↑ Empty scaffold - placeholder garbage

RIGHT:
  Call 1: thought → "Investigating the flaky test..."
  Call 2: thought → "Found that it fails on concurrent runs..."
  Call 3: thought → "Root cause is shared state in setUp..."
  Call 4: debug {
    approach: "binary_search",
    steps: [
      "Verified failure is non-deterministic",
      "Identified concurrency as trigger",
      "Found shared state in test fixtures"
    ],
    findings: "Test fixture modifies class-level variable",
    resolution: "Use instance variable instead of class variable"
  }
  ↑ SUBSTANTIVE content from actual reasoning
```

---

## Examples by Situation

### Debugging
```bash
/think --debug "Tests pass locally but fail in CI"
```
→ Sequential thoughts narrowing down → debug capstone with findings

### Architecture Decisions
```bash
/think --decide "Postgres vs MongoDB for this use case"
```
→ Sequential thoughts analyzing options → decide capstone with choice

### Risk Analysis
```bash
/think --model inversion "How could this migration fail?"
```
→ Sequential thoughts exploring failure modes → mental_model capstone

### System Understanding
```bash
/think --systems "How does payment interact with inventory?"
```
→ Sequential thoughts mapping components → systems capstone

### Brainstorming
```bash
/think --creative "Solutions for reducing API latency"
```
→ Sequential thoughts generating ideas → creative_thinking capstone

### Multi-Perspective Analysis
```bash
/think --collab "Evaluate this architecture from different roles"
```
→ Sequential thoughts from perspectives → collaborative_reasoning capstone

### Branching Exploration
```bash
/think --tree "What are the implementation approaches?"
```
→ Build tree structure → tree_of_thought with branches and evaluation

### General Problem Solving
```bash
/think "Why is the API slow?"
```
→ Sequential thoughts building analysis → final thought with conclusion

---

## Session Continuity

Sessions persist across calls via `sessionId`:

```
Call 1: → Returns sessionId: "abc-123"
Call 2: → Include sessionId: "abc-123" to continue
...
Final:  → nextThoughtNeeded: false triggers export
```

**Persistence location:** `~/.orca-cognition/`
- `sessions/{id}/*.jsonl` - Append-only logs per operation type
- `exports/{id}.json` - Full session export on completion

---

## MCP Details

**Server:** `cognition-mcp`
**Location:** `mcp/cognition-mcp/`
**Tool:** `cognition` (single tool, operation parameter routes)
**Pattern:** Accept-Store-Echo
**Total Operations:** 38

### Store Files
Each operation type persists to its own JSONL file:
- `thoughts.jsonl`, `mental-models.jsonl`, `debugging.jsonl`, `decisions.jsonl`
- `meta.jsonl`, `systems.jsonl`, `creative.jsonl`, `visual.jsonl`
- `checkpoints.jsonl`, `scientific.jsonl`, `collaborative.jsonl`, `socratic.jsonl`
- `argumentation.jsonl`, `research.jsonl`, `analogical.jsonl`, `causal.jsonl`
- `statistical.jsonl`, `simulation.jsonl`, `optimization.jsonl`, `ethical.jsonl`
- `dashboard.jsonl`, `pdr.jsonl`, `custom-framework.jsonl`, `code-execution.jsonl`
- `tree.jsonl`, `beam.jsonl`, `mcts.jsonl`, `graph.jsonl`, `orchestration.jsonl`
- `ooda.jsonl`, `ulysses.jsonl`, `notebook-*.jsonl`

---

## Pattern Philosophy

cognition-mcp uses the **Accept-Store-Echo pattern**:

| Aspect | Description |
|--------|-------------|
| Pattern | Accept-Store-Echo |
| Content | Claude provides ALL reasoning content |
| Use | `/think` sequential chains |
| Persistence | Yes (`~/.orca-cognition/`) |
| Operations | 38 total |

**Use cognition-mcp** when building sequential reasoning chains with full control over the content and structure.

---

## Full Reference

For complete schema examples, mental model details, and test results:
**See:** `docs/concepts/cognition-mcp.md`

---

_Version: OS 4.3 | Pattern: Accept-Store-Echo | Operations: 38_
