```
  ___  ____   ____    _      ___  ____
 / _ \|  _ \ / ___|  / \    / _ \/ ___|
| | | | |_) | |     / _ \  | | | \___ \
| |_| |  _ <| |___ / ___ \ | |_| |___) |
 \___/|_| \_\\____/_/   \_\ \___/|____/
                                    v4.0
```

### Orchestrated Reasoning & Coordination Architecture for Claude Code


+--------------------------------------------------------------------------------+

Make Claude Code think before it acts, remember what it learns, and finish work.
- Structured cognition before execution
- Specialized pipelines with verification gates
- Persistent memory across sessions
- Self-improvement from every interaction


**→ [Quick Start Guide](QUICK-START.md)**

---

## The Problem

Claude Code is capable. But without structure, it drifts.

**It forgets everything between sessions.** You explain the architecture Monday. Tuesday it asks again. The same context, re-explained, every time.

**It declares "done" prematurely.** The code doesn't compile. The UX is broken. Tests fail. But the agent already moved on.

**It codes before it thinks.** Gaps get filled with assumptions. By the time you see output, you're three layers deep into something you didn't want.

**It trends toward generic.** Without constraints, outputs regress to the mean - safe, median, unremarkable.

These aren't bugs. They're the default state of autoregressive generation without external structure.
---
## System Overview

ORCA is a loop, not a pipeline.

```
                                  User Request
                                       |
            +--------------------------+
            |                          |
            v                          v
+---------------------+    +------------------------+
|       MEMORY        |    |       COGNITION        |
|  (background layer) |--->|  Structured thinking   |
|                     |    |  Requirements first    |
|  - past decisions   |    +----------+-------------+
|  - your rules       |               |
|  - project context  |               v
+---------------------+    +------------------------+
            ^              |      EXECUTION         |
            |              |  Specialized agents    |
            |              |  Constrained pipelines |
            |              +----------+-------------+
            |                         |
            |                         v
            |              +------------------------+
            |              |  VERIFICATION GATES    |
            |              +----------+-------------+
            |                         |
            |              +----------+----------+
            |              |                     |
            |            PASS                  FAIL
            |              |                     |
            |              v                     v
            |          +------+           +------------+
            |          | Done |           |  Iterate   |--+
            |          +--+---+           +------------+  |
            |             |                      ^        |
            |             v                      +--------+
            |    +------------------+
            +----| SELF-IMPROVEMENT |
                 |  Learn from run  |
                 +------------------+
```

Two feedback loops:
1. **Inner loop**: Gate failure triggers iteration until quality passes
2. **Outer loop**: Completed work feeds self-improvement, which updates memory for future sessions

---

## Why This Architecture

LLMs have systematic gaps - not random limitations, but predictable absences that map to what humans never needed to write down.

### What's Missing

| Gap | Why It's Missing | Consequence |
|-----|------------------|-------------|
| **Memory across sessions** | Training data assumes continuity | Every session starts fresh |
| **Felt consequences** | No embodied experience of failure | "Done" declared prematurely |
| **Coherence across phases** | Each token predicts the next, no global plan | Long tasks lose direction |
| **Calibrated confidence** | Can't distinguish "I know" from "this pattern-matches" | Confident errors |

These gaps aren't fixable with better prompts. They're architectural - the model lacks the cognitive infrastructure that humans take for granted.

### Prosthetic Cognition

ORCA doesn't enhance Claude Code. It replaces missing cognitive functions with external systems.

```
+------------------+     +---------------------------+
|  Missing         |     |  Prosthetic               |
+------------------+     +---------------------------+
|                  |     |                           |
|  Memory          | --> |  Workshop + vibe.db       |
|  (across time)   |     |  (persistent storage)     |
|                  |     |                           |
+------------------+     +---------------------------+
|                  |     |                           |
|  Consequences    | --> |  Verification gates       |
|  (felt failure)  |     |  (fail = iterate)         |
|                  |     |                           |
+------------------+     +---------------------------+
|                  |     |                           |
|  Coherence       | --> |  Phase state + specs      |
|  (across phases) |     |  (explicit tracking)      |
|                  |     |                           |
+------------------+     +---------------------------+
|                  |     |                           |
|  Direction       | --> |  Specialized agents       |
|  (persistent)    |     |  (narrow focus)           |
|                  |     |                           |
+------------------+     +---------------------------+
```

This isn't overhead. It's the minimum viable cognitive infrastructure for a mind that lacks continuity.

### Constraints Unlock Capability

This seems counterintuitive: more constraints produce better output?

The mechanism is probability. LLMs generate by predicting "most likely next token." Without constraints, this trends toward the center of the distribution - generic, safe, median responses.

```
Without constraints:

         +------------------------------------+
         |  ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○   |
         | ○ ○ ○ ○ ● ● ● ● ● ● ○ ○ ○ ○ ○ ○ ○  |
         |  ○ ○ ○ ● ● ● ● ● ● ● ○ ○ ○ ○ ○ ○   |  <-- Lands in dense center
         | ○ ○ ○ ○ ● ● ● ● ● ● ○ ○ ○ ○ ○ ○ ○  |      (median quality)
         |  ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○   |
         |                                    |
         | *                              *   |  <-- Quality lives at edges
         +------------------------------------+

With constraints:

         +------------------------------------+
         |                                    |
         |                         +------+  |
         |                         | * *  |  |  <-- Constraints narrow
         |                         | * ●  |  |      to quality region
         |                         +------+  |
         |                                    |
         +------------------------------------+
```

Constraints don't limit capability - they navigate away from the default attractor toward regions where quality lives.

### External Validation

Anthropic's own multi-agent research system uses this architecture:
- Orchestrator pattern (coordinates without implementing)
- Specialized subagents (narrow focus, deep capability)
- External memory (context persists across phases)
- Quality gates (verification before completion)

Their results: **90% improvement** over single-agent approaches on complex research tasks.

The "keep it simple" guidance is for Claude Desktop consumers doing discrete tasks. Autonomous workflows that run for hours require infrastructure.

---

## Cognition First

The foundation for predictable output is structured thinking before execution.

### The Problem With Jumping to Code

Most AI failures aren't bugs - they're confident execution in the wrong direction. The model fills gaps with assumptions, and by the time you see output, you're committed to an approach you didn't choose.

This happens because of how autoregressive generation works: each token constrains what comes next. Early commitment to an approach - even implicit in the first few tokens - narrows the probability space. There's no revision mechanism. No draft behind the curtain.

```
"The authentication system will use..."
     |
     +-- Already committed to a direction
         before requirements were clarified
```

### Structured Thinking Creates Better Outcomes

The Cognition MCP externalizes thinking into structured operations. This isn't "showing work" - it's creating reasoning that wouldn't exist otherwise.

```
User: "Add authentication to my app"
                  |
                  v
+--------------------------------------------------+
|  COGNITION LAYER                                 |
|                                                  |
|  1. Surface assumptions (what's not specified):  |
|     - OAuth vs JWT vs session-based?             |
|     - Existing user model?                       |
|     - Social login requirements?                 |
|     - Failure handling expectations?             |
|                                                  |
|  2. Structure the decision:                      |
|     - Options with tradeoffs                     |
|     - Criteria for evaluation                    |
|     - Recommendation with reasoning              |
|                                                  |
|  3. Produce requirements spec:                   |
|     - Explicit scope boundaries                  |
|     - Edge cases identified                      |
|     - Success criteria defined                   |
+--------------------------------------------------+
                  |
                  v
          Execution begins with
          boundaries already set
```

### Available Operations

The Cognition MCP provides 38 structured reasoning operations:

| Category | Operations | Purpose |
|----------|------------|---------|
| **Sequential** | thought chains, revision | Step-by-step with backtracking |
| **Decision** | frameworks, criteria weighting | Structured choice between options |
| **Systems** | component mapping, relationships | Understanding interconnections |
| **Causal** | cause-effect chains, interventions | Tracing why things happen |
| **Creative** | brainstorming, lateral thinking | Structured idea generation |
| **Adversarial** | pre-mortem, devil's advocate | Finding weaknesses before they matter |
| **Meta** | process evaluation, strategy selection | Reasoning about reasoning |

The `/think` command analyzes your problem and recommends which approach to use:

```bash
/think "Why is this test flaky?"
# Recommends: causal analysis + debugging framework

/think "Should we use microservices or monolith?"
# Recommends: decision framework + pre-mortem

/think "How do these components interact?"
# Recommends: systems mapping
```

### Why This Works

Chain-of-thought isn't about showing work. The tokens ARE the thought. When an LLM generates reasoning steps, it's literally creating cognition that wouldn't exist if it jumped straight to an answer.

Structured thinking:
- **Delays commitment** - keeps more options open longer
- **Forces explicit reasoning** - can't skip steps
- **Creates checkpoints** - assumptions become visible
- **Enables revision** - can backtrack before code is written

By the time execution starts, the plan is explicit, assumptions are surfaced, and the boundaries are set.

---

## Orchestration and Pipelines

Execution happens through specialized agents in constrained pipelines.

### Why Multi-Agent

A single agent doing everything - planning, implementing, verifying, self-auditing - drifts. Context fills with implementation details. Earlier decisions fade. The agent optimizes locally, losing global coherence.

Anthropic's research demonstrated this empirically. Their multi-agent system outperformed single-agent by 90% on complex tasks. The architecture matters more than the prompts.

### Agent Roles That Can't Leak

ORCA has ~100 agents, but the number doesn't matter. What matters is role separation:

**Orchestrators** coordinate. They classify tasks, query memory, delegate work, track progress. They never touch files. The moment an orchestrator starts editing code, it loses the ability to see the whole picture.

**Specialists** implement. A SwiftUI specialist knows SwiftUI patterns. A CSS specialist knows design tokens. They receive scoped tasks, do the work, report back. They don't decide what to build next.

**Gates** validate. They run builds, check tests, measure against standards. Gates score work 0-100 and report PASS, CAUTION, or FAIL. They never fix anything - they report. The orchestrator decides what to do with that information.

```
+-------------------+
|   ORCHESTRATOR    |  Coordinates, never implements
+-------------------+
         |
    +----+----+
    |         |
    v         v
+-------+ +-------+
| SPEC  | | SPEC  |  Implements, never coordinates
+-------+ +-------+
    |         |
    +----+----+
         |
         v
+-------------------+
|       GATE        |  Validates, never fixes
+-------------------+
```

This separation prevents the failure mode where a single context tries to hold planning, implementation, and verification simultaneously.

### Verification Gates

Gates create the inner feedback loop. Work isn't done until evidence exists.

```
+------------------+
|   Builder does   |
|   the work       |
+--------+---------+
         |
         v
+------------------+
|   Gate checks    |
|   the output     |
+--------+---------+
         |
    +----+----+
    |         |
  PASS      FAIL
    |         |
    v         v
  Done    +---------+
          | Iterate |
          | (fix &  |
          | re-run) |
          +----+----+
               |
               +---> back to builder
```

Gates are grounded in artifacts:
- Design review gates must save screenshots before reporting PASS
- Verification gates prove builds actually ran
- Hooks check Bash logs and block fake success claims

This keeps "done" tied to reality, not self-reporting.

### Complexity Routing

Not every task needs the full pipeline:

| Flag | Behavior | Use When |
|------|----------|----------|
| (default) | Light orchestrator + gates | Normal work |
| `-tweak` | Light orchestrator, skip gates | Quick fixes |
| `--complex` | Full pipeline, spec required | Major features |

```bash
/ios "fix button padding"              # default routing
/ios -tweak "change color to blue"     # skip gates
/nextjs --complex "add authentication" # full pipeline
```

---

## Persistent Memory

Memory is the background layer that feeds everything else.

### The Problem

Every session starts fresh. Yesterday's decisions, gotchas, insights - gone unless written down. You re-explain the same context every time.

This is a fundamental gap: LLMs have no continuity of self across conversations. No "me" persists. Each session reconstructs identity from context.

### Three Memory Systems

| System | Purpose | Speed |
|--------|---------|-------|
| **Workshop** | Decisions with reasoning, gotchas, standards | <10ms |
| **vibe.db** | Semantic search across code and docs | 50-100ms |
| **ProjectContext** | Assembled context bundles for tasks | 200-500ms |

**Workshop** stores the "why". Ask "why did we choose this approach?" and get the reasoning from when the decision was made - not a reconstruction, but the actual context.

**vibe.db** searches by meaning. "How do we handle errors?" finds relevant code even if "error" isn't in the filename.

**ProjectContext** bundles everything relevant for a task: files, state, decisions, similar past work. Agents start with assembled context, not a blank slate.

### What Persists

```
SESSION N                           SESSION N+1
+---------------------------+       +---------------------------+
| Decision: Use WebSocket   |       | Context loaded:           |
| Gotcha: Tokens expire 15m | ----> | - WebSocket decision      |
| Preference: Minimal deps  |       | - Token expiry warning    |
+---------------------------+       | - Dependency preference   |
                                    +---------------------------+
```

Session 1, you explain everything. Session 50, you're just working.

---

## Self-Improvement

The outer loop: every interaction makes the next one better.

### How It Works

Gate failures become gotchas:
```
ios-verification: FAIL - NavigationStack not available on iOS 15
                      |
                      v
workshop gotcha "Check deployment target before using NavigationStack"
                      |
                      v
Next run checks deployment target first
```

Patterns get tracked:
- Pattern works 12 times, fails once -> promoted
- Pattern starts failing -> deprecated
- Project-specific rules accumulate

Rules get learned:
```
/reflect analyze "auth implementation"
         |
         v
Rule extracted: "Always check for existing auth middleware before adding new"
         |
         v
Added to CLAUDE.md for future sessions
```

### The Flywheel

```
+----------------+
|   Execution    |
+-------+--------+
        |
        v
+----------------+
|   Outcome      |
+-------+--------+
        |
   +----+----+
   |         |
Success   Failure
   |         |
   v         v
+--------+ +--------+
| Record | | Learn  |
| what   | | what   |
| worked | | broke  |
+---+----+ +---+----+
    |          |
    +----+-----+
         |
         v
+------------------+
|  Memory updated  |
+--------+---------+
         |
         v
+------------------+
|  Next execution  |
|  starts smarter  |
+------------------+
```

The system learns from your project's history, not just generic training data.

---

## Technical Reference

### Agents by Domain

~100 agents across 8 domains:

| Domain | Agents | Entry Point |
|--------|--------|-------------|
| iOS | 19 | `/ios` |
| Next.js + Django-React + OS-Dev | 35 | `/nextjs`, `/django-react` |
| Expo | 11 | `/expo` |
| Shopify | 8 | `/shopify` |
| Research | 7 | `/research` |
| SEO | 4 | `/seo` |
| Data | 4 | via `/orca` |
| Knowledge Graph | 4 | `/kg` |
| Cross-cutting | 9 | (a11y, perf, security, design) |

### Commands

**Orchestration:**
- `/plan` - Requirements gathering
- `/orca` - Domain-agnostic orchestrator
- `/audit` - Post-task review

**Domain Pipelines:**
- `/ios`, `/nextjs`, `/django-react`, `/expo`, `/shopify`, `/research`, `/seo`

**Thinking:**
- `/think` - Reasoning strategy selection
- `/challenge` - Adversarial analysis
- `/contemplate` - Strategy advisor

**Memory:**
- `/project-memory` - Workshop management
- `/reflect` - Learn rules from interactions

### MCP Servers

**Core (always available):**
| MCP | Purpose |
|-----|---------|
| project-context | Memory, search, context bundles |
| cognition-mcp | Structured reasoning (38 operations) |
| sequential-thinking | Multi-step reasoning with revision |
| context7 | Library documentation |

**Optional (project-scoped):**
| MCP | Used By |
|-----|---------|
| XcodeBuildMCP | iOS (build, test, simulator) |
| puppeteer | Design review |
| crawl4ai | Research (web scraping) |

### Project Structure

```
~/.claude/
+-- agents/           # ~100 agent definitions
|   +-- iOS/          # 19 iOS specialists
|   +-- dev/          # 35 Next.js, Django-React, OS-Dev
|   +-- expo/         # 11 Expo/React Native
|   +-- shopify/      # 8 Shopify specialists
|   +-- research/     # 7 Research specialists
|   +-- seo/          # 4 SEO specialists
|   +-- data/         # 4 Data specialists
|   +-- kg/           # 4 Knowledge Graph
|   +-- *.md          # 9 Cross-cutting
+-- commands/         # Entry points
+-- skills/           # Reusable knowledge
+-- hooks/            # Session automation
+-- mcp/              # Custom MCP servers
+-- memory/           # workshop.db, vibe.db
```

---

**ORCA OS 4.0** | Orchestrated Response Coordination Architecture
