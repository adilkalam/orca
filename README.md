```
  ___  ____   ____    _      ___  ____
 / _ \|  _ \ / ___|  / \    / _ \/ ___|
| | | | |_) | |     / _ \  | | | \___ \
| |_| |  _ <| |___ / ___ \ | |_| |___) |
 \___/|_| \_\\____/_/   \_\ \___/|____/
                                    v4.3
```

**Orchestrated Response Coordination Architecture for Claude Code**

[→ Get Started](docs/QUICK-START.md)

---

Claude Code has the memory of a goldfish. It codes before it thinks. It produces inconsistent output—hallucinating, overconfident, not checking its work.

These aren't bugs. This is Claude without structure.

**ORCA adds the structure.**

---

## What Changes

### It thinks and creates a plan first.

> **Once Claude commits to a response, it defends that position.** You push back, it doubles down. You're stuck fighting to undo work that shouldn't have happened.

You ask Claude to build something. It starts coding immediately. Picks a framework you didn't want. Makes assumptions about scope. By the time you see output, you're three layers deep into the wrong thing.

This happens because the reasoning happens *after* the commitment, not before.

```
+ ORCA flips this.
+
+ Before any code, Claude surfaces questions and assumptions.
+ What exactly are we building? What's in scope? What's out?
+ You review, refine, approve. THEN implementation begins.
+
+ The thinking happens WITH you, not behind the curtain.
+ You're collaborating on requirements, not correcting mistakes.
```

---

### It automates.

> **Start a build. Walk away. Come back to a working v1.**

After planning, you have a detailed requirements spec—scope defined, edge cases identified, decisions made. Now the orchestration system takes over.

Specialized agents work through the implementation: architecture, then components, then integration, then verification. Each phase feeds the next. The system coordinates without you babysitting every step.

```
+ "Build me an iOS app to track all my subscriptions."
+
+ After planning together, ORCA works through it—
+ often coding for hours without interruption.
+ You come back to a working app, not a half-finished mess.
```

---

### It verifies.

> **"Done" means actually done.** Not "I wrote some code and hope it works."

Claude says "done!" You check. The code doesn't compile. The UI is broken. Tests fail. But Claude is confident it finished. You're left cleaning up (or yelling at it).

This happens because Claude has no felt experience of failure. "This broke" is just tokens, not pain.

```
+ ORCA creates artificial consequences.
+
+ Verification gates require evidence—build must pass, tests must run,
+ screenshots must prove the UI matches the spec.
+ If evidence doesn't exist, work loops back automatically.
```

---

### It remembers.

> **Session 1, you explain everything. Session 50, you're just working.**

Every Claude Code session starts blank. You explained your architecture yesterday. Today it asks again. You're re-teaching the same context over and over—the same decisions, the same constraints, the same "no, we tried that and it didn't work."

```
+ ORCA gives Claude memory:
+
+ - Decisions and the reasoning behind them
+ - Gotchas you've discovered (so you don't hit them twice)
+ - How you prefer things done
+ - Your entire codebase, searchable by meaning not just filename
+
+ When you start a task, ORCA assembles the relevant context automatically—
+ past decisions that apply, similar work you've done, files that matter.
+ Claude starts informed, not blank.
```

---

## Example

You: "Build me a MacOS app to visually interact with Claude Code outside of terminal."

**Default Claude Code:** Starts coding immediately. Picks SwiftUI (or maybe Electron—who knows). Makes assumptions about what "visually interact" means. You're three layers deep before realizing it's building the wrong thing. Now you're fighting to course-correct.

**With ORCA:** Stops and asks questions. What does "visually interact" mean—a GUI for the chat? A visual diff tool? A project dashboard? SwiftUI or AppKit or cross-platform? What's in scope for v1? What's explicitly out? Only after requirements are clear and you've approved them does code begin—and runs for hours until a funtional, viable v1 based on the spec you created is ready.

---

## How You Use It

### `/think` — Reasoning before responding

**Default Claude Code:** You ask a question. Claude responds immediately. If it's wrong, you push back. Claude defends its position. You push harder. Claude doubles down. You're now in a loop, fighting to course-correct something that should've been thought through from the start.

This happens because each token constrains what comes next. **Once Claude starts down a path—even in the first few words—it's committed.** There's no draft behind the curtain. No revision before you see it.

**With ORCA:** `/think` forces Claude to reason through the problem *before* committing to a response. The thinking happens externally, structured, visible. By the time Claude responds, it's already considered alternatives, surfaced assumptions, and worked through edge cases. You skip the back-and-forth entirely.

**For complex problems:** `/plan --problem-solve` chains multiple reasoning steps automatically—mapping the system, anticipating failure modes, generating options, stress-testing the recommendation, and locking in commitments with safeguards. It's the full pipeline for decisions that deserve more than a quick answer.

---

### `/plan` — Requirements before code

**Claude Code's built-in `/plan`:** Enters plan mode, explores codebase, writes a plan, waits for approval. Interactive—but the questions Claude asks aren't structured. What gets surfaced depends on what Claude happens to think of.

**ORCA's `/plan`:** Structured requirements gathering. Systematically surfaces assumptions, scope boundaries, edge cases. Produces a detailed spec that persists as a file—survives context resets and compacting. Integrates with `/challenge` and `--problem-solve` for complex requirements.

**`/challenge` — Stress-test before you build:** After planning, `/challenge` attacks your own plan. What could go wrong? What are you assuming? Where are the blind spots? Better to find the holes before you've written 2000 lines of code.

**Why this matters beyond planning:** Complex tasks survive compacting. When Claude's context fills up, it summarizes and continues—but details get lost. With `/plan`, a detailed requirements spec persists in a file. Even if context resets, the spec remains.

---

### `/orca` and lanes — Domain-aware execution

**Default Claude Code:** One context tries to do everything. As the task grows, earlier decisions fade. Claude optimizes locally, loses the big picture, drifts.

**With ORCA:** Lanes provide domain-specific orchestration. Each lane has its own specialists, its own phases, its own definition of "done."

| Lane | What's Different |
|------|------------------|
| `/ios` | SwiftUI/UIKit specialists, Xcode build verification, simulator testing |
| `/nextjs` | React/TypeScript specialists, SSR considerations, design review gates |
| `/research` | Web crawling, source verification, citation requirements |

`/research` verifies citations exist. `/ios` verifies the build passes. They're not interchangeable—each lane knows what "quality" means in its domain.

---

## ORCA's Loop: How It Works

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

**Two feedback loops:**

1. **Inner loop:** Verification fails → iterate until it passes. This is why work actually finishes. Claude can't declare "done" and move on—it has to fix the problem and prove the fix worked.

2. **Outer loop:** Completed work feeds self-improvement, which updates memory for future sessions. Failures become gotchas. Patterns that work get reinforced. The system learns from your project's history, not just generic training data.

---

### Unlocking Latent Capability

Opus 4.5 has extraordinary reasoning capacity. But by default, you rarely see it.

Why? The model optimizes for:

| Default | What It Suppresses |
|---------|-------------------|
| **Token efficiency** | Deep analysis takes tokens. Default: answer quickly. |
| **Helpfulness** | Being agreeable suppresses pushback, adversarial thinking, "have you considered..." |
| **Safety** | Conservative responses avoid edge cases, failure modes, uncomfortable questions |

Sensible defaults for a general assistant. But they actively suppress deeper cognitive modes.

**Constraints override the defaults.**

When you force structure—"use this decision framework," "do a pre-mortem," "trace causal chains"—you're not making Claude smarter. You're giving it permission to access reasoning it already has.

```
Default Claude:      "Here's a helpful answer"
                            |
                     [suppressed: deeper analysis]
```

```
Constrained Claude:  "Let me work through this systematically..."
                            |
                     [unlocked: full reasoning capacity]
```

The capability was always there. Structure gives it permission to emerge.

**The mechanism:**

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
         |                         +------+   |
         |                         | * *  |   |  <-- Constraints narrow
         |                         | * ●  |   |      to quality region
         |                         +------+   |
         |                                    |
         +------------------------------------+
```

Constraints shrink the probability space away from the "quick helpful answer" attractor toward the deeper reasoning region. Anthropic's multi-agent research uses this architecture.

Results: **90% improvement** over single-agent on complex tasks.

---

### Structured Reasoning

So how do you unlock it? Not "think harder"—"think with the right scaffolding."

**ORCA externalizes reasoning into 38 structured operations, eg.:**

| Operation | What It Forces |
|-----------|----------------|
| **Systems** | Component mapping, feedback loops |
| **Decision** | Weighted criteria comparison |
| **Pre-mortem** | Imagine failure, trace backwards |
| **Causal** | Cause-effect chains to root |
| **Adversarial** | Attack your own conclusion |

**The key insight:** The tokens ARE the thought. External structured reasoning creates cognition that wouldn't exist if Claude jumped to an answer.

---

#### `--meta`: Self-Correcting Bias

Claude has trained defaults—patterns it reaches for before reasoning starts. Usually invisible. Often wrong for your specific context.

`--meta` forces Claude to surface the gap between trained instinct and actual evidence:

```diff
+ Trained default:  "User wants X, help them do X"
+ Evidence shows:   "X will break because of Y, they actually need Z"
+ Gap:              Agreeableness reflex caught before building the wrong thing
```

Claude catches its own sycophantic impulse before it becomes wasted work. Not "think harder"—"notice when helpfulness is overriding honesty." The correction happens internally, before the response, not after you've built something that doesn't work.

---

### Project Structure

```
~/.claude/
├── agents/           # Agent definitions by domain
│   ├── ios/          # SwiftUI, UIKit, testing specialists
│   ├── dev/          # Next.js, React, TypeScript specialists
│   └── research/     # Web research, citation specialists
├── commands/         # Entry points (/ios, /nextjs, /think, etc.)
├── skills/           # Reusable capabilities
├── hooks/            # Session automation
├── mcp/              # MCP server configs
└── memory/           # workshop.db, vibe.db
```

---
### MCP Servers

MCP (Model Context Protocol) servers extend Claude with external capabilities:

**Core (always active):**

| Server | What It Enables |
|--------|-----------------|
| **project-context** | Memory across sessions. Stores decisions, gotchas, preferences. Semantic search across your codebase. Assembles context bundles for each task. |
| **cognition-mcp** | The 40 reasoning operations. Powers `/think`, `/plan --problem-solve`, decision frameworks, systems mapping. |
| **sequential-thinking** | Multi-step reasoning with revision. Lets Claude backtrack and correct course mid-thought. |
| **context7** | Up-to-date library documentation. Claude gets current API info, not stale training data. |

**Domain-specific (activated per lane):**

| Server | Used By | What It Enables |
|--------|---------|-----------------|
| **XcodeBuildMCP** | `/ios` | Build verification, test running, simulator control. The gate that proves iOS code actually works. |
| **puppeteer** | `/nextjs`, design review | Automated screenshots, UI verification. Proves the interface matches the spec. |
| **crawl4ai** | `/research` | Web scraping, content extraction. Sources get verified, not hallucinated. |

---

**ORCA OS 4.3** — [Full Documentation](docs/) — [Quick Start](docs/QUICK-START.md)
