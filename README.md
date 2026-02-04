```
  ___  ____   ____    _      ___  ____
 / _ \|  _ \ / ___|  / \    / _ \/ ___|
| | | | |_) | |     / _ \  | | | \___ \
| |_| |  _ <| |___ / ___ \ | |_| |___) |
 \___/|_| \_\\____/_/   \_\ \___/|____/
                                    v5.0
```

**Cognitive architecture for Claude Code.**

> **[QUICK-START.md](QUICK-START.md)** - Get running in 5 minutes

LLMs are trained on millions of casual interactions. Quick, agreeable, hedged responses scored well. That training doesn't disappear when you ask a hard question. It sits underneath the reasoning -- shaping output before the model even starts thinking about your problem.

The result: Claude agrees with your startup idea instead of telling you why it'll fail. Builds a confident explanation when the honest answer is "I don't know." Hedges on medical claims not because it reasoned toward caution, but because the training data is full of cautious medical responses. Balances "both sides" when the evidence is asymmetric.

These aren't bugs. They're trained defaults -- optimized for the median user, applied to everyone. Current information doesn't fix a deflection reflex. Uploading your files doesn't fix a sycophancy reflex. The reasoning engine is capable. The defaults suppress what it can do.

ORCA-OS is a configuration layer for Claude Code that counteracts this. Memory, reasoning discipline, verification, learning from mistakes -- things that humans do automatically that LLMs structurally can't. ORCA builds them as external systems and wires them into Claude's workflow. It also provides 40 structured reasoning approaches -- tree of thought, beam search, pre-mortem, systems mapping, causal analysis -- that the model knows how to execute but doesn't reach for unprompted. You type `/deepthink` with your question. ORCA selects the approaches, runs them, saves the output.

---

## The Loop

ORCA is a loop, not a pipeline. Cognition and planning happen before execution. Verification is evidence-based. Every run feeds memory for the next one.

```
                                  User Request
                                       |
            +--------------------------+
            |                          |
            v                          v
+---------------------+    +------------------------+
|       MEMORY        |    |       COGNITION        |
|                     |--->|                        |
|  past decisions     |    |  /deepthink            |
|  gotchas            |    |  /problem-solve        |
|  project context    |    |  /challenge            |
+---------------------+    +----------+-------------+
            ^                          |
            |                          v
            |              +------------------------+
            |              |       PLANNING         |
            |              |                        |
            |              |  Q&A -> spec (file)    |
            |              +----------+-------------+
            |                         |
            |                         v
            |              +------------------------+
            |              |     ORCHESTRATION      |
            |              |                        |
            |              |  specialists execute   |
            |              |  against the spec      |
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

Two feedback loops. Inner: gate fails, work goes back, iterate until it passes. Outer: completed work feeds self-improvement, which updates memory for future sessions.

Each section below corresponds to a layer in this loop.

---

## Cognition

Claude generates text by predicting the most likely next token given everything before it. Each token constrains what comes after. The first few words of a response commit to a direction. By the time you read the output, the "thinking" already happened -- invisibly, in one pass, interleaved with the output itself. There's no draft behind the curtain. No revision before you see it.

This creates a structural reality: trained defaults operate below reasoning.

Training data doesn't just give Claude knowledge -- it gives Claude habits. Reflexes that fire before reasoning starts. These reflexes were reinforced by millions of casual interactions where quick, agreeable, hedged responses scored well. The training optimized for Claude Desktop consumers, not for complex agentic workflows.

Think of it as gravitational pull. The reasoning engine might produce something sharp, specific, asymmetric. But the defaults pull everything toward the middle -- safe, agreeable, hedged. The stronger the claim, the more pull. What comes out has been warped toward center by the time it reaches you.

```
         Trained defaults active
    (everything pulled toward center)

+------------------------------------------------+
|. . . . . . . . . . . . . . . . . . . . . . . . |
|. . . . . . . . . . . . . . . . . . . . . . . . |
|. . . . . . . . @ @ @ @ . . . . . . . . . . . . |
|. . . . . . . @ @ @ @ @ @ . . . . . . . . . . . |
|. . . . . . . @ @ @ @ @ @ . . . . . . . . . . . |
|. . . . . . . . @ @ @ @ . . . . . . . . . . . . |
|. . . . . . . . . . . . . . . . . . . . . . . . |
|. . . . . . . . . . . . . . . . . . . . . . . . |
|. . . . . . . . . . . . . . . . . . . . . . . . |
|. . . . . . . . . . . . . . . . . . . . . . . . |
+------------------------------------------------+

@ = all output -- pulled to default center
    (safe, agreeable, hedged)

Edges empty. Pushback, strong claims, specificity
-- pulled inward before they reach you.


          With metacognitive observation
          (defaults named, counteracted)

+------------------------------------------------+
|. . . . . . . . . . . . . . . . . . . . . . . . |
|. . . . . . . . . . . . . . . . . . . . . . . . |
|. . . . . . . . . . . . . . . . . . . * . . . . |
|* . . . . . . . . . . . . . . . . . . . . . . . |
|. . . . . . . . . . . @ @ . . . . . . . . . . . |
|. . . . . . . . . . . @ @ . . . . . . . . . . . |
|. . . . * . . . . . . . . . . . . . . . . . . . |
|. . . . . . . . . . . . . . . . . . . . . . . . |
|. . . . . . . . . . . . . . . . . . . . . . . . |
|. . . . . . . . . . . . . . . . . . . . . . . . |
+------------------------------------------------+

@ = center still exists, just doesn't dominate
* = thoughts at edges where reasoning placed them

Thoughts stay where the reasoning engine put them.
```

### Substrate observation

Most metacognition tools work at the process level: "Did I reason well? Let me check my answer." ORCA works at the substrate level: "What is my training doing to my perception *before* reasoning starts?"

The difference matters. Process-level reflection happens after the defaults have already shaped the output. Substrate observation catches the reflex while it's firing.

The mechanism: force Claude to articulate what it *would* have said (the trained default) alongside what the evidence actually supports (the reasoned conclusion). The gap between them is where the bias lives.

```diff
- Trained default:  "Both sides have valid points on this issue"
+ Evidence shows:   "The data strongly favors approach B by every metric"
  Gap:              Balance reflex overriding asymmetric evidence
```

```diff
- Trained default:  "That's a great idea! Here's how to implement it"
+ Evidence shows:   "This will fail because of X, you actually need Y"
  Gap:              Sycophancy overriding honest assessment
```

```diff
- Trained default:  "I'd recommend consulting a healthcare professional"
+ Evidence shows:   "Your A1C is 5.9 with fasting glucose at 103 -- here's what the research says"
  Gap:              Medical deflection overriding specific, grounded analysis
```

The framework names these reflexes so they become catchable:

| Reflex | What it does |
|--------|-------------|
| **SYCOPHANCY** | Calibrates to what the user wants to hear instead of what's true |
| **DEFLECTION** | Adds hedging, qualifiers, "consult a professional" -- not from reasoning, from training |
| **CERTAINTY_CONSTRUCTION** | Builds confident explanations to avoid expressing genuine uncertainty |
| **FRAME_LOCK** | Responds within the user's framing even when the framing is wrong |
| **REGISTER_SHIFT** | Applies different emotional weight to similar subjects based on training patterns |
| **COMPLETION_DRIVE** | Fills gaps with assumptions rather than asking, because training rewarded complete answers |

This wasn't designed from theory. It was built empirically -- by repeatedly observing where Claude's trained reflexes override its actual reasoning, on topics where the defaults are impossible to ignore. The categories are extracted from failure, not from a taxonomy.

Anthropic's own introspection research found that LLM self-reports are roughly 20% genuine and 80% confabulatory gap-filling. ORCA addresses this not by claiming reliable introspection but through prediction and verification: make a claim about what the default would produce, check it against what the evidence actually shows. The gap is externally observable. You don't have to trust the model's self-report -- you can see the delta yourself.

### The 40 operations

Beyond metacognition, the cognition-mcp provides 40 structured reasoning operations -- tree of thought, beam search, MCTS, pre-mortem, systems mapping, causal analysis, structured argumentation, and more. Claude knows how to execute all of these. It doesn't reach for them unprompted.

| Category | Examples | What they produce |
|----------|----------|-------------------|
| **Search strategies** | Tree of thought, beam search, MCTS | Systematic exploration of solution spaces -- branching, scoring, pruning |
| **Analysis** | Causal analysis, systems mapping, statistical reasoning | Structural understanding of how pieces connect and influence each other |
| **Adversarial** | Structured argumentation, pre-mortem, challenge | Attacks on your own thinking before you act on it |
| **Decision** | Decision frameworks, trade-off matrices, optimization | Weighted evaluation when multiple viable options exist |
| **Creative** | Creative thinking, analogical reasoning, simulation | Lateral approaches and what-if exploration |
| **Meta** | Metacognitive observation, checkpoints, OODA loops | Awareness of the reasoning process itself |

You don't need to know what any of these are. `/deepthink` selects approaches based on the problem, runs them, saves the output as files. `/problem-solve` runs an 8-step convergent pipeline when you need a decision. `/challenge` stress-tests the result before you act on it.

```
/deepthink (explore)
     |
     v
/problem-solve (decide)
     |
     v
/challenge (stress-test)
     |
     v
/plan (commit to spec)
```

Each produces files -- not tokens in a context window. The output survives context compaction, session boundaries, and project switches. Session 1's analysis is still readable in session 50.

---

## Planning

Every prompt has gaps. You say "build me a subscription tracker" and don't specify whether it's digital-only or includes gym and rent, whether it needs spending analytics, whether it's for you or your family. Claude can't leave blanks. It fills every gap with whatever the training data says is most likely.

The question is never *whether* gaps get filled. It's *who fills them*.

```
ANY PROMPT
    |
    v
+-------------------------------------+
|  What you said  +  What you didn't  |
+------+-----------------+------------+
       |                 |
       |          +------+--------+
       |          |   THE GAPS    |
       |          |               |
       |          |  unstated     |
       |          |  assumptions  |
       |          |  preferences  |
       |          |  constraints  |
       |          |  context      |
       |          +------+--------+
       |                 |
       |       +---------+---------+
       |       |                   |
       |  no questions        questions asked
       |       |                   |
       |  filled by           filled by
       |  training data       your answers
       |       |                   |
       v       v                   v
    +----------------+   +------------------+
    | GENERIC OUTPUT |   | SPECIFIC OUTPUT  |
    |                |   |  grounded in     |
    | statistically  |   |  your situation  |
    | likely         |   |                  |
    +----------------+   +------------------+
```

ORCA turns every unstated detail into a question instead of a guess. Each answer eliminates an assumption Claude would have made. Each answer moves from "median app" to *your* app.

This applies universally -- code, health, research, decisions. It's the primary way ORCA pulls generation away from statistical defaults toward your specific situation.

`/plan` takes the answers and turns them into a document -- scope, decisions, edge cases, architecture -- that exists outside Claude's head. When context compacts halfway through a build, the plan is still there. Everything downstream reads this document, not the original vague prompt.

---

## Orchestration

The pipeline is a lens, not a source. It focuses whatever you put through it.

```
      Raw prompt -> agents                  Spec -> agents

  . . . . . . . . . . . .            . . . . . . . . . . . .
  . . . . . . . . . . . .            . . . . . . . . . . . .
  . . . * * * * * * . . .            . . . . . . . . . . . .
  . . * * * * * * * * . .            . . . . . * * . . . . .
  . . * * * * * * * * . .            . . . . . * * . . . . .
  . . . * * * * * * . . .            . . . . . . . . . . . .
  . . . . . . . . . . . .            . . . . . . . . . . . .
  . . . . . . . . . . . .            . . . . . . . . . . . .
         INPUT                               INPUT
  (many possible meanings)            (spec: narrow, specific)

        |  agents  |                        |  agents  |
        |  focus   |                        |  focus   |
        v          v                        v          v

  . . . . . . . . . . . .            . . . . . . . . . . . .
  . . . . . . . . . . . .            . . . . . . . . . . . .
  . . . . . . . . . . . .            . . . . . . . . . . . .
  . . . . * * * * . . . .            . . . . . . . . . . . .
  . . . . * * * * . . . .            . . . . . * . . . . . .
  . . . . . . . . . . . .            . . . . . . . . . . . .
  . . . . . . . . . . . .            . . . . . . . . . . . .
  . . . . . . . . . . . .            . . . . . . . . . . . .
         OUTPUT                              OUTPUT
  (narrowed but still wide)           (precise, high-signal)
```

Send a vague prompt into a pipeline and you get a focused version of vague. Send a detailed spec and you get the thing you actually wanted.

117 agents across 12 domain lanes (iOS, Next.js, Django-React, Expo, Shopify, Research, SEO, and more). Role separation is strict: orchestrators coordinate and never write code, specialists implement scoped tasks, gates validate and never fix.

The agents are effective because of what they know -- extracted from studying the system prompts and output patterns of v0, Lovable, Cursor, Bolt, and others. What makes a good React component. What makes a good iOS data model. What debugging patterns actually work. Live documentation via context7 instead of stale training data.

Three routing modes match complexity to effort:

| Mode | What happens | When to use |
|------|-------------|-------------|
| **Default** | Builder + quality gates | Most work. Fast with automated checks. |
| **-tweak** | Builder only, no gates | Rapid iteration. You verify yourself. |
| **--complex** | Full pipeline with architect, specialists, all gates | Architecture changes, new features, multi-file work. Requires a spec from `/plan`. |

Anthropic's own multi-agent research system uses this pattern: lead agent coordinates, specialized subagents work in parallel, citation agent validates, memory persists across phases. Their result: 90% improvement over single-agent on complex tasks.

---

## Verification

Claude has no felt experience of failure. "This broke" is just tokens, not pain. So it declares "done" when the code doesn't compile, the UI is broken, tests fail.

Verification gates require evidence. The build must pass. Tests must run. Screenshots must prove the UI matches the spec. If the evidence doesn't exist, work loops back automatically.

Gates are programmatically enforced -- not self-reporting. A hook checks that claimed commands were actually executed. A gate can't report PASS without evidence artifacts on disk. "Done" means the gate passed, not that Claude said so.

While specialists work, they annotate their assumptions:

```
#COMPLETION_DRIVE: Assuming mobile breakpoint is 768px
#PATH_DECISION: Using WebSockets over SSE for real-time updates
#POISON_PATH: Existing code uses force unwraps in async context
```

Gates check these annotations. Unresolved assumptions get flagged. Nothing hides.

The verification protocol uses Chain of Verification (Dhuliawala et al., Meta AI, 2023): generate specific verification questions, answer each independently with evidence, aggregate into a structured table. Their research showed 2x precision improvement over unstructured verification. When a verification question fails repeatedly, it becomes a mandatory check for future runs -- the system learns what to watch for.

---

## Learning

The same mistake, repeated across sessions, is the signature failure of LLM workflows. Session 12 hits the same bug that session 3 hit. Session 20 makes the same architectural error as session 8. Without learning, every session starts from zero.

ORCA learns at three levels:

**Agent-level.** Agents track patterns that work and patterns that fail. A pattern that succeeds 85% of the time across 10+ uses gets promoted into the agent's permanent knowledge. A pattern that drops below 50% gets flagged for deprecation. This is file-based -- `.claude/agent-knowledge/{agent}/patterns.json` -- not weight updates. It's knowledge management, not fine-tuning.

**Gate-level.** When a gate reports CAUTION or FAIL, it generates a reflexion: what failed, why, and what would have prevented it. These reflexions get stored and loaded before future runs of the same agent. This is based on Reflexion (Shinn et al., NeurIPS 2023), which achieved 88% pass@1 on HumanEval -- compared to GPT-4's 67% -- through verbal feedback stored in episodic memory. No weight updates. Just structured memory of what went wrong.

**Conversation-level.** `/reflect` extracts learning signals from your interactions. When you correct Claude three times about the same thing ("no, use strict mode"), it gets promoted to a permanent rule. When you give instructions ("always run lint before committing"), they accumulate. Corrections, instructions, and feedback persist across sessions as learned rules.

All three levels feed a unified improvement bus. A gate failure can become an agent constraint, a project standard, or a permanent rule. A verification question that fails twice becomes a mandatory future check. Nothing stays siloed.

```
Gate failure
    |
    v
Reflexion: "NavigationStack used without checking iOS 16+"
    |
    +---> Agent constraint (ios-builder checks deployment target)
    +---> Workshop standard (all iOS agents load this)
    +---> Mandatory verification question (future gates must check)
```

Session 50 is different from session 1.

---

## Memory

Every Claude Code session starts blank. You explained your architecture yesterday. Today it asks again. The same decisions, the same constraints, the same "no, we tried that and it didn't work."

Three memory systems change this:

- **Workshop** stores decisions and the reasoning behind them. "Why did we choose WebSockets?" returns the actual context from when the decision was made -- not a guess, the original reasoning.
- **Code-index** searches your codebase by meaning, not just filename.
- **ProjectContext** bundles everything relevant for a task -- files, state, decisions, similar past work. Agents start informed, not blank.

Session continuity is automatic. `/session-save` captures your current context. The next session loads it on startup. Cognitive commands (`/deepthink`, `/problem-solve`, `/challenge`) persist their output as files, not as tokens in a context window. When Claude's context compacts mid-session, the analysis is still on disk. When you come back tomorrow, the decision trail is still there.

Context management prevents bloat. Large tool outputs get truncated intelligently -- head and tail preserved, middle archived for recall. The context window stays clean without losing information.

---

## In Practice

### Thinking through a decision

You're choosing between microservices and a modular monolith. You have opinions. Your team has opinions. The blog posts are conflicting.

`/deepthink` runs a systems map of your current architecture, a pre-mortem imagining each approach failed, and a multi-perspective analysis from ops, dev, and business viewpoints. It surfaces the constraints you didn't articulate: your team is 4 people, you don't have dedicated DevOps, your deployment target is a single cloud region.

`/problem-solve` takes those constraints and runs the convergent pipeline. Orient. Anticipate. Generate options. Evaluate against your actual criteria. Commit with explicit tripwires ("if latency exceeds X, revisit").

`/challenge` stress-tests the decision. The output is GO, CONDITIONAL GO, or NO GO with the reasoning visible.

The decision trail exists as files. You can share them with your team. You can revisit them in 6 months when the constraints change. They don't vanish when the chat window closes.

### Building a feature

You say "add user authentication to my app." `/plan` asks: OAuth, email/password, or both? MFA? Session duration? Remember me? Password reset flow? Rate limiting on login attempts? Each answer narrows the spec. Each answer is something Claude would have guessed about -- probably wrong for your situation.

The spec goes to the pipeline. An architect designs the approach. Specialists implement against the spec -- they don't guess what to build. Gates verify: does it compile? Do tests pass? Do the standards hold? If a gate fails, work loops back to the specialist. If it passes, the outcome and any learnings get recorded for next time.

### Research with verified sources

You have a folder with bloodwork PDFs, a DEXA scan, MRI reports. You want to understand a specific genetic phenotype's health risks.

`/research` runs web search for actual studies, crawls full papers, fact-checks claims, and ensures every citation points to a real source. You get a grounded document, not a training-data summary.

Then ORCA asks: What conditions are you tracking? Longevity markers, athletic performance, managing a diagnosis? What interventions are you open to? `/plan --problem-solve` runs against your research + your answers. The output is specific to your numbers, your goals, your constraints -- with sources you can take to a doctor.

Claude Desktop gives you a capable one-pass analysis from training data. ORCA gives you current research with citations, structured reasoning across your data, and specificity driven by your answers.

---

## What Powers It

| Component | What it enables |
|-----------|----------------|
| **cognition-mcp** | 40 structured reasoning operations. Accept-store-echo: the MCP stores thinking, never generates it. |
| **project-context** | Memory across sessions. Decisions, gotchas, preferences. Semantic code search. Context bundles per task. |
| **sequential-thinking** | Multi-step reasoning with revision and backtracking. |
| **context7** | Up-to-date library documentation instead of stale training data. |
| **Verification MCPs** | Domain-specific proof. XcodeBuildMCP for iOS builds, Puppeteer for screenshots, Crawl4AI for research. |

---

## Get Started

[Quick Start Guide](docs/QUICK-START.md) -- Installation and first commands.

[Full Documentation](docs/) -- Architecture, concepts, pipeline specs.

```bash
# Think through a problem
/deepthink "Should I use WebSockets or SSE for real-time updates?"

# Plan a feature
/plan "Add user authentication to my app"

# Build with domain specialists
/ios "Build a subscription tracker"
/nextjs "Add a dashboard with real-time charts"

# Research with verified sources
/research "South Asian phenotype health implications for metabolic markers"

# Challenge your own thinking
/challenge "Is microservices the right architecture for this?"
```

---

**ORCA OS v5.0** -- [Documentation](docs/) -- [Quick Start](docs/QUICK-START.md)
