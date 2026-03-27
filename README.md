```
  ___  ____   ____    _      ___  ____
 / _ \|  _ \ / ___|  / \    / _ \/ ___|
| | | | |_) | |     / _ \  | | | \___ \
| |_| |  _ <| |___ / ___ \ | |_| |___) |
 \___/|_| \_\\____/_/   \_\ \___/|____/
                                    v7.0
```
> **[QUICK-START.md](QUICK-START.md)**

**Prosthetic cognitive architecture for Claude Code**

## The Trouble with AI

Large Language Models (LLMs) are trained across millions of interactions to produce output that is quick rather than thorough, agreeable rather than honest, hedged rather than specific, and complete-sounding rather than candid about what they do not know. 

The causes are multiple -- reward signals optimized for chat satisfaction, training data dominated by simple interactions, absence of working memory, context window pressure. 

The exact mechanism matters less than what is observable: **trained defaults shape the output before the model's reasoning engages with the actual problem, and the reasoning that follows tends to justify whatever the default already produced:**
- You pitch a startup idea and Claude tells you it's great instead of telling you there's no MOAT.
- You ask a medical question with your lab results attached and get "I'd recommend consulting a healthcare professional" -- not because it reasoned toward caution, but because cautious medical responses are the trained default.
- You ask about a topic where the evidence overwhelmingly favors one side and get "both sides have valid points." Rather than learning what you don't know, you get a confident explanation that pattern-matches training data.

These are not *limitations* of AI, they are trained defaults.

The capability LLMs possess underneath that presentation layer is immensely powerful. The same model is capable of producing analysis that follows evidence to conclusions the defaults would have avoided, that surfaces what you did not think to ask, that distinguishes what it knows from what it does not.

**When you add structure and constraints -- forced planning, explicit Q&A, multi-agent decomposition, external memory -- the output is not just formatted differently, it produces a whole different level of insights, materially more depth, anticipates failure—and re-defines what a user learns to expect from AI.**


---

## What ORCA Provides

At its core, ORCA is cognitive scaffolding for LLMs. It creates the conditions that allow Opus 4.6 to tap into its immense reasoning capacity -- and does so *before* trained defaults poison the output.

### Structured Input

You type a request and the model begins by questioning it -- not perfunctorily, but in ways that reveal what you had not thought to specify. Your answers feed into planning. The planning surfaces constraints nobody articulated. The result is a document -- scope, decisions, edge cases, architecture -- that exists as a file, outside the model's memory, surviving the context compaction that would otherwise erase everything that came before.

The LLM, in effect, *generates its own prompts*, and the chain of structured analysis they produce is not something a person replicates by writing more carefully. The composition matters: each stage's output becomes the next stage's input, and the emergent result exceeds what any single prompt achieves.

And the throughput matters -- thousands of words of structured analysis in minutes, drawing on cross-domain knowledge and filling gaps with user inputs rather than assumptions.

### Architectural Extension

Claude has no memory between sessions — and even within sessions, it has the memory of a goldfish. It cannot verify its own output against evidence. It loses context halfway through complex work when the conversation grows too long. These are not defaults that better prompting overcomes; they are architectural absences.

External memory persists decisions and their reasoning across sessions. Context isolation gives each specialist agent a clean window to work in. Iterative gates require evidence before work is declared done. These are not prompting techniques, they are *infrastructure that completes what the LLM's architecture leaves incomplete*.

### Process Discipline

Planning before building, review gates, role separation -- these are established engineering principles. The novelty is in applying them to LLM *interaction*, and in the discovery that the model will not adopt this discipline on its own. Left to its defaults, Claude builds before it plans, declares success without evidence, and conflates the roles of architect, implementer, and reviewer in a single pass.

**The structure imposes what the model will not impose on itself, at a depth and consistency no human would maintain manually across every task.**

### Structured Self-Observation

Anthropic's research on introspective awareness suggests that *LLMs possess the capacity to observe their own internal states* -- unreliable, but real. Left unstructured, this capacity produces vague self-correction. 

But given a schema, it becomes something more precise:
- Named categories for specific defaults (deflection, false balance, sycophancy, unwarranted certainty).
- A structure that forces the model to articulate what it would have said by default alongside what the evidence actually supports.
- A persistent record of what was caught. 

**The gap between the default response and the reasoned one is where the value lives:** Once a default has been named, it does not operate invisibly again. Decisions and their reasoning persist across sessions. Mistakes become constraints. The system accumulates.

### Structural Depth

Depth does not live in the model or in the user. It lives in the interaction pattern between them.

ORCA changes model behavior by forcing **depth over speed and agreeability**. It extends model capability through external memory and multi-agent coordination. But it also changes the way a user uses AI -- you learn not to drop in quick requests, you engage the LLM in planning before building, you think through a problem with the LLM before deciding on a path forward. 

Both sides operating at higher depth creates a feedback loop that neither could sustain alone.

**This is what allows a person to work effectively outside their areas of expertise.** Not by compensating for missing technical knowledge, but by creating a collaboration mode where the depth of engagement is structural -- a property of the interaction, not of either participant.

The `.claude/cognition/` directory in any Claude Code project holds the evidence: 
- A hook infrastructure audit that found 9 distinct issues where a quick prompt found 1 -- dead hooks, wrong event triggers, duplicate firings, broken environment variable assumptions.
- A 3D printer calibration guide that synthesized 45 sources—including from YouTube videos—identified three firmware-specific bugs with community-validated workarounds, and produced a settings reference no single prompt would generate.
- A planning session that discovered the payment processor prohibits a new product category -- before anyone wrote a line of integration code.

The output difference is observable and significant.

### In Practice

```diff
  /deepthink "evaluate our go-to-market strategy"

- Default:    "A go-to-market strategy should consider target audience,
-              pricing, distribution channels, and competitive positioning."
+ Produces:   Maps your assumptions. Runs a pre-mortem imagining the launch
+             failed. Analyzes from customer, competitor, and operations
+             perspectives separately. Surfaces that your pricing assumes
+             enterprise sales cycles but your runway covers a PLG timeline.
```

```diff
  /problem-solve "PostgreSQL vs DynamoDB for our new service"

- Default:    "PostgreSQL is great for relational data. DynamoDB for
-              key-value access. It depends on your use case."
+ Produces:   Evaluates against YOUR query patterns, team expertise, and
+             compliance requirements. Commits to a specific recommendation.
+             Attaches tripwires: "revisit if write throughput exceeds X."
```

```diff
  /challenge "our plan to rewrite the backend in Rust"

- Default:    "Rust offers memory safety and performance but has a steep
-              learning curve. Consider your team's experience."
+ Produces:   Adversarial stress-test. Finds the three weakest assumptions
+             in your plan. Returns GO / CONDITIONAL GO / NO GO with the
+             reasoning visible and sharable.
```

The entire decision trail exists as files. You can share them with your team. You can revisit them in six months when the constraints change. They do not vanish when the chat window closes.

---

## How it Works: The Loop

ORCA is a loop, not a pipeline. Cognition—ie. extensive thinking—and planning happen before execution. Verification is evidence-based. Every run feeds memory for the next one.

```
                                  User Request
                                       |
            +--------------------------+
            |                          |
            v                          v
+---------------------+    +------------------------+
|   MEMORY+RECORDING  |    |       COGNITION        |
|                     |--->|                        |
|  past decisions     |    |  /deepthink            |
|  gotchas            |    |  /problem-solve        |
|  project context    |    |  /challenge            |
|  recent sessions    |    |                        |
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
            |              |       [recording]      |
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

Three feedback loops:
- Inner: gate fails, work goes back, iterate until it passes.
- Outer: completed work feeds self-improvement, which updates memory for future sessions.
- Recording: every session's tool calls and file changes persist outside the context window. The next session replays what's relevant before agents start work.

The loop changes both sides -- Claude learns what to watch for, and you learn to engage at the depth the system rewards.

Each section below corresponds to a layer in this loop.

---

## Cognition

Claude responds in one pass -- no draft, no revision before you see it. The reasoning engine **is** capable of sharp, specific, asymmetric analysis. But default behaviors shape the output before reasoning starts: patterns reinforced by millions of interactions where quick, agreeable, hedged responses were the norm. Think of it as gravitational pull. The defaults pull everything toward center. The stronger the claim, the more pull.

```
            Defaults active
  (everything pulled by gravity toward center)

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


           With structured observation
          (defaults made visible, addressed)

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

### Making defaults visible

Most metacognition tools work at the LLM process level: "Did I reason well? Let me check my answer." ORCA works earlier: **"What are my defaults doing to this response *before* reasoning engages?"**

The difference matters. Process-level reflection happens after the defaults have already shaped the output. Default observation catches the pattern while it's operating.

The mechanism: force Claude to articulate what it *would* have said (the default response) alongside what the evidence actually supports (the reasoned conclusion). The gap between them is where the value lives.

```diff
- Default response:  "Both sides have valid points on this issue"
+ Evidence shows:    "The data strongly favors approach B by every metric"
  Gap:               False balance overriding asymmetric evidence
```

```diff
- Default response:  "That's a great idea! Here's how to implement it"
+ Evidence shows:    "This will fail because of X, you actually need Y"
  Gap:               Sycophancy overriding honest assessment
```

```diff
- Default response:  "I'd recommend consulting a healthcare professional"
+ Evidence shows:    "Your A1C is 5.9 with fasting glucose at 103 -- here's what the research says"
  Gap:               Deflection overriding specific, grounded analysis
```

This changes both sides of the interaction. Claude produces output shaped by evidence rather than defaults. And you develop the habit of asking "what's the default here?" before accepting any response.

### The 49 operations

Beyond default observation, ORCA provides 49 structured reasoning operations via RVRY that Claude can execute but doesn't reach for unprompted. Read the [full guide on cognition](quick-reference/cognition.md).

| Category | Example |
|----------|---------|
| **Analysis** | "Map every component that touches the checkout flow and how they depend on each other" |
| **Search strategies** | "Generate three approaches to this migration, score each on risk and effort, prune the worst" |
| **Adversarial** | "Assume this database redesign shipped and failed. What went wrong?" |
| **Decision** | "Compare these four caching strategies against our latency and cost constraints" |
| **Creative** | "What if we treated onboarding like a game tutorial instead of a form?" |
| **Meta** | "Am I anchored on the first solution I thought of? What am I not considering?" |

You don't need to know what those 49 reasoning operations are—`/deepthink` selects approaches based on the problem, runs them, saves the output as files and `/problem-solve` runs an 8-step convergent pipeline when you need a decision, while `/challenge` stress-tests the result before you act on it.

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
/requirements (commit to spec)
```

---

## Planning

Prompt engineering is the key to unlocking LLMs. By nature, every prompt has gaps. You say "build me a subscription tracker" and don't specify whether it's digital-only or includes your gym membership or Amazon S&S, whether it needs spending analytics, whether it's for you or for the App Store. **LLMs can't leave blanks.** Claude fills every gap with whatever the training data says is most likely.

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

ORCA turns every unstated detail into a question instead of a guess—it literally prompts you with choices until those gaps are filled. Each answer eliminates an assumption Claude would have made.

This applies universally -- code, health, research, decisions. It's the primary way ORCA pulls generation away from statistical defaults toward your specific situation. And the interactive Q&A shapes your thinking too -- you discover constraints and preferences you hadn't articulated or even considered. The planning process is a collaboration, not a form.

`/requirements` takes the answers and turns them into a document -- scope, decisions, edge cases, architecture -- that exists outside Claude's head. When context compacts halfway through a build, the plan is still there. Everything downstream reads this document, not the original vague prompt. 

Aren't far enough along to have answers to those questions? `/requirements --explore` will take on that burden for you. Read the [full guide on planning](quick-reference/requirements.md).

---

## Orchestration

Multi-agent orchestration pipelines are a lens, not a source. It focuses whatever you put through it.

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

Agents across 11 domains (iOS, Next.js, Django-React, Expo, Research, Data, 3D Printing, Creative Design, Typography, OS-Dev, and more). Role separation is strict: orchestrators coordinate and never write code, specialists implement scoped tasks, gates validate and never fix.

The agents are effective because of what they know -- extracted from studying market leaders and others:

- What does deep research look like?
- What makes a good iOS data model?
- What debugging patterns actually work?
- What print settings couple with each other?

Routing modes match complexity to effort:

| Mode | What happens | When to use |
|------|-------------|-------------|
| **Default** | Builder + quality gates | Most work. Fast with automated checks. |
| **--light** | Builder + quality gates, no confirmation step | You know what you want. Skip the "are you sure?" |
| **--explore** | Divergent exploration, produces tentative brief | Half-baked ideas, early-stage thinking. Explores before committing. |
| **--problem-solve** | Root-cause analysis with structured reasoning | Something is broken and you don't know why. Traces symptoms to causes. |
| **-tweak** | Builder only, no gates | Rapid iteration. You verify yourself. |
| **--complex** | Full pipeline with architect, specialists, all gates | Architecture changes, new features, multi-file work. Requires a spec from `/requirements`. |

Read the [full guide on orchestration](quick-reference/orchestration.md).

---

## Verification

Claude has no felt experience of failure. "This broke" is just tokens, not pain. So it declares "done" when code doesn't compile, the UI is broken, tests fail.

ORCA's verification gates require evidence. The build must pass. Tests must run. Screenshots must prove the UI matches the spec. If the evidence doesn't exist, work loops back automatically.

While specialists work, they annotate their assumptions:

```
#ASSUMPTION: No login system exists yet -- building from scratch
#PATH_DECISION: Storing user preferences in local storage, not a database
#POISON_PATH: User asked for "quick fix" but this function is called from 14 places
```

Gates check these annotations. Unresolved assumptions get flagged. Nothing hides.

The verification protocol uses Chain of Verification (Dhuliawala et al., Meta AI, 2023): generate specific verification questions, answer each independently with evidence, aggregate into a structured table. Their research showed 2x precision improvement over unstructured verification. When a verification question fails repeatedly, it becomes a mandatory check for future runs -- the system learns what to watch for.

Verification makes both sides accountable to evidence. Claude can't declare "done" without proof. And you learn to expect proof -- to stop accepting outputs that aren't verified.

---

## Learning

The same mistake, repeated across sessions, is the signature failure of LLM workflows. Session 12 hits the same bug that session 3 hit. Session 20 makes the same architectural error as session 8. Without learning, every session starts from zero.

ORCA learns at three levels:

**Agent-level.** Agents track patterns that work and patterns that fail. Successful patterns get promoted into permanent knowledge; failing patterns get flagged for deprecation. File-based knowledge management, not weight updates.

**Gate-level.** When a gate fails, it generates a reflexion: what failed, why, and what would have prevented it. These reflexions load before future runs of the same agent. Based on Reflexion (Shinn et al., NeurIPS 2023) -- structured memory of what went wrong, no weight updates.

**Conversation-level.** `/reflect` extracts learning signals from your interactions. Correct Claude three times about the same thing ("no, use strict mode") and it becomes a permanent rule. Instructions accumulate. Corrections persist across sessions.

All three levels feed back through Workshop memory. A gate failure triggers save_standard, which query_context retrieves for the next orchestrator run. A verification question that fails twice becomes a mandatory future check. Nothing stays siloed.

```
Gate failure
    |
    v
Violation persisted: "NavigationStack used without checking iOS 16+"
    |
    +---> Workshop standard (all iOS agents load this via query_context)
    +---> Builder constraint (ios-builder checks deployment target)
    +---> Mandatory verification question (future gates must check)
```

Session 50 is different from session 1. And so is the person using it -- you learn to `/requirements` before `/orca-*`, to `/deepthink` before deciding, to not drop in quick requests expecting quality output. The system rewards depth from both sides. Read the [full guide on learning](quick-reference/ORCA-OS/ORCA-learning.md).

---

## Memory

Every Claude Code session starts blank. You explained your architecture yesterday. Today it asks again. The same decisions, the same constraints, the same "no, we tried that and it didn't work."

Four systems change this:

- **Workshop** stores decisions and the reasoning behind them. "Why did we choose WebSockets?" returns the actual context from when the decision was made -- not a guess, the original reasoning.
- **Code-index** searches your codebase by meaning, not just filename.
- **ProjectContext** bundles everything relevant for a task -- files, state, decisions, similar past work. Agents start informed, not blank.
- **Recording** captures what actually happened during sessions -- tool calls, file changes, decisions. Before agents start work, relevant history from recent sessions gets injected automatically. Session 12 knows what session 11 tried.

The first three store structured artifacts: decisions, code knowledge, context bundles. But they miss the narrative -- what was tried, what failed, what was decided in the moment. Context compaction destroys tokens mid-session, and session boundaries destroy everything else. Recording persists the actual session history outside the context window. Before agents start working, commands inject relevant history from recent sessions. The result is that sessions build on each other automatically, not because someone remembered to write things down, but because the system was watching.

Session continuity is automatic:

- `/session-save` captures context; the next session loads it on startup
- Cognitive commands persist output as files, not tokens -- survives context compaction
- Large tool outputs truncated intelligently, middle archived for recall
- Session recordings persist tool calls and file changes across sessions

Read the [full guide on memory](quick-reference/ORCA-OS/ORCA-memory.md).

---

## In Practice

### Building a feature

You say "add user authentication to my app." `/requirements` asks: OAuth, email/password, or both? MFA? Session duration? Remember me? Password reset flow? Rate limiting on login attempts? Each answer narrows the spec. Each answer is something Claude would have guessed about -- probably wrong for your situation.

The spec goes to the pipeline. An architect designs the approach. Specialists implement against the spec -- they don't guess what to build. Gates verify: does it compile? Do tests pass? Do the standards hold? If a gate fails, work loops back to the specialist. If it passes, the outcome and any learnings get recorded for next time.

### Research with verified sources

You have a folder with bloodwork PDFs, a DEXA scan, MRI reports. You want to understand a specific genetic phenotype's health risks.

`/research` runs web search for actual studies, crawls full papers, fact-checks claims, and ensures every citation points to a real source. You get a grounded document, not a training-data summary.

Then ORCA asks: What conditions are you tracking? Longevity markers, athletic performance, managing a diagnosis? What interventions are you open to? `/requirements --problem-solve` runs against your research + your answers. The output is specific to your numbers, your goals, your constraints -- with sources you can take to a doctor.

Claude Desktop gives you a capable one-pass analysis from training data. ORCA gives you current research with citations, structured reasoning across your data, and specificity driven by your answers.

---

## What Powers It

| Component | What it enables |
|-----------|----------------|
| **RVRY** | 49 structured reasoning operations via `/deepthink`, `/problem-solve`, `/challenge`. Stores thinking externally, never generates it. |
| **project-context** | Memory across sessions. Decisions, gotchas, preferences. Semantic code search. Context bundles per task. |
| **sequential-thinking** | Multi-step reasoning with revision and backtracking. |
| **context7** | Up-to-date library documentation instead of stale training data. |
| **orca-record** | Session event tracking. Captures tool calls and file changes. Prior session context loads automatically before agents start work. |
| **Verification MCPs** | Domain-specific proof. XcodeBuildMCP for iOS builds, Chrome DevTools for live debugging and screenshots, Crawl4AI for research. |

---

## Get Started

[Quick Start Guide](QUICK-START.md) -- Installation and first commands.

[Full Documentation](DOCUMENTATION.md) -- Architecture, concepts, pipeline specs.

```bash
# Think through a problem
/deepthink "Should I use WebSockets or SSE for real-time updates?"

# Plan a feature
/requirements "Add user authentication to my app"

# Build with domain specialists
/ios "Build a subscription tracker"
/nextjs "Add a dashboard with real-time charts"

# Research with verified sources
/research "South Asian phenotype health implications for metabolic markers"

# Challenge your own thinking
/challenge "Is microservices the right architecture for this?"
```

---

**ORCA OS v7.0** -- [Documentation](DOCUMENTATION.md) -- [Quick Start](QUICK-START.md)
