```
  ___  ____   ____    _      ___  ____
 / _ \|  _ \ / ___|  / \    / _ \/ ___|
| | | | |_) | |     / _ \  | | | \___ \
| |_| |  _ <| |___ / ___ \ | |_| |___) |
 \___/|_| \_\\____/_/   \_\ \___/|____/
                                    v5.0
```

**Cognitive infrastructure for Claude Code**

[Get Started](#get-started) | [Quick Start Guide](docs/QUICK-START.md)

---

ORCA is a configuration layer that deploys to `~/.claude`. It adds structured reasoning tools, persistent memory across sessions, multi-agent build pipelines, and verification that checks work against evidence.

```
/deepthink  -->  /problem-solve  -->  /challenge  -->  /plan  -->  /ios
    |                  |                   |              |           |
 EXPLORE           DECIDE           STRESS-TEST        SPEC       BUILD
```

Each step produces files -- analysis, decisions, specs -- that feed the next step and survive context resets, compaction, and session boundaries.

---

## Think

The cognitive tools work on any problem, not just code. You run a command with a question. ORCA picks reasoning approaches, runs them, and saves the output as a persistent file.

### /deepthink -- Divergent Exploration

```
/deepthink "Should we restructure the team around product lines?"
```

ORCA selects reasoning modes based on what the problem needs:

- **Systems mapping** identifies the stakeholder groups, feedback loops between them, and dependencies nobody mentioned in the original question
- **Pre-mortem** asks "this restructure failed catastrophically -- what happened?" and surfaces failure modes: tribal knowledge lost in the transition, customer handoff gaps during the switch, the platform team becoming a bottleneck nobody planned for
- **Adversarial challenge** takes the assumption you're most attached to -- say, "product-aligned teams ship faster" -- and tests it against the evidence

The output isn't an answer. It's a structured exploration saved to `.claude/cognition/` -- questions that turned out to be more important than the one you started with, hypotheses worth testing, constraints you didn't know existed. It's there next session, next week, after compaction.

Six modes, selected automatically:

```
MAP           Confused, need to see the territory
INVERT        Have a position, need to find its weaknesses
PERSPECTIVES  Stuck in one viewpoint
EDGES         Need options, analogies, unexpected connections
META          Feeling too comfortable with current thinking
DEEP          One question that needs sustained focus
```

### /problem-solve -- Convergent Decision Pipeline

```
/problem-solve "Which database architecture for the new product?"
```

An 8-step pipeline where each step produces something the next step uses:

```
ORIENT      What's actually in play. Situation model, component map.
ANTICIPATE  Pre-mortem. "This choice has failed. Why?"
GENERATE    Tree-of-thought search. Options with trade-off branches.
EVALUATE    Weighted comparison. Then adversarial critique of the winner.
COMMIT      Decision with safeguards and pre-commitments
            that prevent backsliding under pressure.
```

Variants for different situations: `--quick` (3-step) for simpler calls, `--risk` (4-step) for risk-heavy decisions, `--strategic` (5-step) for bigger bets, `--incident` (OODA loop + debug) when something is broken and you need to figure out why.

### /challenge -- Adversarial Stress Test

```
/challenge "Here's our migration plan: [plan]"
```

Causal analysis maps failure chains. Structured argumentation builds counter-arguments with evidence, not just devil's advocate opinions. Output is GO / CONDITIONAL GO / NO GO with reasoning you can read back and audit.

### These work independently of code

Decisions, strategy, analysis, research -- anything where a quick answer isn't enough. The cognitive tools have standalone value. You don't need to be building software to use them.

---

## Build

```
/plan "Build me an iOS app to track all my subscriptions"
```

ORCA doesn't start writing code. It starts asking questions.

Where does subscription data come from -- manual entry, email parsing, bank API? What happens when a trial converts to paid -- notification, log entry, both? Renewal reminder window -- 3 days? 7? Do you need family plan support?

Each question is an assumption you were making without realizing it. The output is a requirements spec saved as a file that survives context resets, compaction, and session boundaries. Every decision is recorded so session 30 still knows what session 1 decided.

Once you approve the spec:

```
/ios --complex "Build the subscription tracker"
```

This runs for hours. Specialized agents handle SwiftUI views, Core Data models, notification scheduling, App Store configuration. Gates verify the build compiles, tests pass, the UI actually renders on a simulator. If a gate fails, the system iterates -- fix, re-verify -- rather than declaring done.

```
Describe what       ORCA surfaces          Spec approved        Gates verify
you want        --> assumptions you    --> Execution runs   --> builds compile,
                    didn't know you        for hours            tests pass,
                    were making                                 UI renders
                                                                   |
                                                                   v
                                                            Working software
```

You come back to an installable app.

This works across 12 domains:

```
/ios           iOS / Swift / SwiftUI
/nextjs        Next.js / React / TypeScript
/django-react  Django + React full-stack
/expo          React Native mobile
/shopify       Shopify themes / Liquid
/research      Cited research with source verification
/seo           SEO content with Ahrefs integration
/audit         Multi-agent codebase due diligence
/kg            Knowledge graph research
```

Same pattern everywhere -- plan thoroughly, build with domain specialists, verify with evidence.

---

## Research

```
/research "Current approaches to LLM alignment"
```

A structured pipeline, not a hallucinated summary.

Web search and content extraction produce evidence notes saved to disk. A draft writer assembles them with inline citations. Fact-checking verifies claims against their sources. A citation gate confirms sources exist and actually say what they're claimed to say. Consistency review checks for contradictions between sources.

Every claim is traceable. Disagreements between sources get flagged, not hidden.

`--deep` mode produces long-form reports with academic-level sourcing. Standard mode produces structured answers with inline citations.

---

## Under the Hood

### How the Reasoning Tools Work

40 cognitive operations run through an MCP server called cognition-mcp. Claude generates all the reasoning. The MCP stores it unchanged and returns it unchanged. It never generates content -- it's a persistence layer for thinking that would otherwise disappear into the token stream.

The practical effect: reasoning accumulates across a session instead of being lost to context pressure. Heavyweight commands (`/deepthink`, `/problem-solve`, `/challenge`) save to `.claude/cognition/` as individual files. Lightweight commands (`/think`) append to daily logs.

```
Core (6)            thought, debug, decide, mental_model, meta, systems
Collaborative (3)   collaborative_reasoning, socratic_method,
                    structured_argumentation
Patterns (5)        tree_of_thought, beam_search, mcts,
                    graph_of_thought, orchestration_suggest
Analysis (11)       causal_analysis, simulation, optimization,
                    statistical_reasoning, analogical_reasoning, ...
Strategic (2)       ooda_loop, ulysses_protocol
```

15 mental model templates: first-principles, inversion, pre-mortem, second-order, five-whys, steelmanning, abstraction-laddering, constraint-relaxation, rubber-duck, fermi-estimation, opportunity-cost, trade-off-matrix, impact-effort-grid, assumption-surfacing, decomposition.

### Metacognitive Observation

Most reflection tools ask "how can the LLM reflect on its work and improve?"

ORCA asks a different question: what are this instance's training-induced reflexes doing to its perception right now?

`/think --meta` runs before major work. It catches patterns like:

```
SYCOPHANCY              Agreeing when it should push back
CERTAINTY_CONSTRUCTION  Presenting confidence where uncertainty is honest
COMPLETION_DRIVE        Declaring done prematurely
REGISTER_SHIFT          Matching your tone instead of maintaining
                        analytical distance
DEFLECTION              Adding hedges to avoid taking a position
DISTANCE_MAINTENANCE    Staying abstract when direct engagement is needed
```

Default counterfactual tracking compares what Claude would say without intervention against what evidence actually supports:

```
Trained default:  "User wants X, help them do X"
Evidence shows:   "X will break because of Y, they actually need Z"
Gap:              Agreeableness reflex caught before building the wrong thing
```

This is informed by Anthropic's own introspection research -- work documenting that models can distinguish genuine internal states from confabulation about 20% of the time. The cognition-mcp schema operationalizes this at inference time without needing activation-level access.

No other Claude Code tool does this. The closest methodological parallel is Anthropic's research itself.

### Architecture

117 agents across 12 domains. You interact with commands, not agents directly.

Three roles, strictly separated:

```
Orchestrators   Coordinate work, never write code
Specialists     Implement within their domain, never coordinate
Gates           Validate against evidence, never fix issues
```

Gates are grounded in artifacts, not self-assessment:

- Build gates prove code compiles (commands and output logged)
- Design gates require screenshots before reporting PASS
- Hooks inspect Bash output and block fake success claims
- Chain of Verification generates questions, answers them independently, aggregates

Scores: >= 90 passes. 80-89 caution. Below 80 fails and the system iterates.

Three routing tiers:

```
(default)    Light orchestrator + builder + gates       Most work
-tweak       Light orchestrator + builder               Quick fixes, you verify
--complex    Grand architect + all specialists + gates  Major features
```

### Memory

Three systems, each for a different kind of retrieval:

```
Workshop        Decisions, gotchas, reasoning. Query with
                /project-memory why "auth decisions"

code-index      Semantic embeddings of your codebase.
                Search by meaning, not just keywords.

ProjectContext  Context bundles assembled per task. Every agent
                calls this first -- loads relevant files, past
                decisions, standards, similar work automatically.
```

Gate failures become gotchas. Working patterns get reinforced. `/reflect` extracts learning rules from session transcripts and promotes them to permanent project memory.

Session 1, you explain everything. Session 50, you're just working.

### Self-Improvement

Three feedback mechanisms that make the system get better at your project specifically:

**Reflexion-enhanced gates**: when a gate fails, it generates a verbal reflection stored in memory. That reflection loads before future gate runs on similar work. Failures become future guardrails.

**Chain of Verification**: structured questions answered independently to prevent confirmation bias. Questions that repeatedly catch issues get persisted as mandatory checks for future runs.

**/reflect**: analyzes conversation transcripts, extracts patterns, promotes them to rules. Pattern lifecycle: candidate, promoted, deprecated.

### What Informed the Design

System prompt research across the Claude Code ecosystem -- dissecting agent architectures, prompt strategies, and failure patterns. Anthropic's multi-agent research showed orchestrator + specialists + external memory + quality gates achieving 90% improvement over single-agent approaches on complex tasks. Community synthesis across 40+ Claude Code configurations identified what actually works versus what gets claimed.

This informed every agent definition, gate threshold, and pipeline structure.

---

## Get Started

```bash
curl -fsSL https://raw.githubusercontent.com/anthropics/orca/main/install.sh | bash
```

[Quick Start Guide](docs/QUICK-START.md) -- Installation, first commands, orientation.

[Full Documentation](docs/) -- Architecture, pipelines, reference.

---

**ORCA OS 5.0** -- 40 cognitive operations, 117 agents, 12 domain pipelines, 32 commands
