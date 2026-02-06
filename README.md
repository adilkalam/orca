```
  ___  ____   ____    _      ___  ____
 / _ \|  _ \ / ___|  / \    / _ \/ ___|
| | | | |_) | |     / _ \  | | | \___ \
| |_| |  _ <| |___ / ___ \ | |_| |___) |
 \___/|_| \_\\____/_/   \_\ \___/|____/
                                    v5.1
```
> **[QUICK-START.md](QUICK-START.md)**

## ORCA-OS is cognitive architecture and a constraint system that optimizes for output quality.**

LLMs default to shallow completion. This happens for multiple reasons -- reward signals optimized for chat satisfaction, training data dominated by simple interactions, absence of working memory, context window pressure. No single cause explains it, and the exact mechanism is unfalsifiable from outside the training process.

The exact mechanism matters less than what you can observe: when you add structure -- forced planning, explicit Q&A, multi-agent decomposition, external memory -- the output is materially different. Not just formatted differently. Different insights, different depth, different failure modes caught.

You can see it:
- Claude agrees with your startup idea instead of telling you why it'll fail.
- Builds a confident explanation when the honest answer is "I don't know."
- Hedges on medical claims not because it reasoned toward caution, but because cautious medical responses are the default.
- Balances "both sides" when the evidence is asymmetric. These are not the model's limits. They are its defaults.

It achieves this through forced planning before implementation, separation of concerns via multi-agent patterns, and structure that slows both user and model to engage more thoughtfully.

---

## The Value Proposition:

**What ORCA Provides vs. the default Claude Code:** Forced planning before implementation, separation of concerns via multi-agent patterns, and structure that slows both user and model to engage more thoughtfully.

### Structured Input
The LLM generates its own sophisticated prompts. `/deepthink` produces the right questions, which feed into `/plan`'s Q&A, which uncovers things nobody considered, which produces a spec that survives context compaction. 

This chain is not something a human can replicate by writing better prompts -- the composition creates emergent value. And the sheer throughput matters: thousands of words of structured analysis in minutes that would take hours to produce manually, drawing on cross-domain knowledge no individual has.

### Architectural Extension
Context isolation, external memory, and iterative gates provide capability the model genuinely lacks. Multi-agent decomposition gives each specialist a clean context window. cognition-mcp provides working memory across a session. Workshop provides memory across sessions.

These aren't prompting techniques -- they're infrastructure that completes the model's cognitive architecture.

### Process Discipline
Planning before building, review gates, role separation. While these are established software engineering principles, the novelty is applying them to LLM interaction -- making the model follow engineering discipline it wouldn't adopt on its own, at a depth and consistency no human would maintain manually across every task.

### Structural Depth

Depth doesn't live in the model or in the user. It lives in the interaction pattern.

The system changes model behavior by forcing depth over speed. It extends model capability (external memory, multi-agent coordination). 

**But it also changes user behavior** -- you learn not to drop in quick requests, you learn to use `/plan` before `/orca-*`, you learn to run `/deepthink` before deciding. 

Both sides operating at higher depth creates a feedback loop that neither could sustain alone.

This is what allows a user to work effectively outside their areas of expertise. It's not about compensating for missing technical knowledge. It's about creating a collaboration mode where the depth of engagement is structural.

The `.claude/cognition/` directory in any ORCA-OS project holds the evidence. Real problems explored with depth that unscaffolded responses don't produce. A hook audit that found 9 issues where a quick prompt found 1. A feature spec that identified "commitment stance" as the differentiator when the initial prompt didn't contain that concept. A write-up breakthrough after 10 mediocre attempts. 

The output difference is observable and significant.

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

Two feedback loops:
- Inner: gate fails, work goes back, iterate until it passes.
- Outer: completed work feeds self-improvement, which updates memory for future sessions. 

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

### The 40 operations

Beyond default observation, the cognition-mcp provides 40 structured reasoning operations that Claude can execute but doesn't reach for unprompted. ([Full guide](docs/guides/cognition-readme.md))

| Category | Example |
|----------|---------|
| **Analysis** | "Map every component that touches the checkout flow and how they depend on each other" |
| **Search strategies** | "Generate three approaches to this migration, score each on risk and effort, prune the worst" |
| **Adversarial** | "Assume this database redesign shipped and failed. What went wrong?" |
| **Decision** | "Compare these four caching strategies against our latency and cost constraints" |
| **Creative** | "What if we treated onboarding like a game tutorial instead of a form?" |
| **Meta** | "Am I anchored on the first solution I thought of? What am I not considering?" |

You don't need to know what those 40 reasoning operations are—`/deepthink` selects approaches based on the problem, runs them, saves the output as files and `/problem-solve` runs an 8-step convergent pipeline when you need a decision, while `/challenge` stress-tests the result before you act on it.

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

t
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

`/plan` takes the answers and turns them into a document -- scope, decisions, edge cases, architecture -- that exists outside Claude's head. When context compacts halfway through a build, the plan is still there. Everything downstream reads this document, not the original vague prompt. 

Aren't far enough along to have answers to those questions? `/plan --explore` will take on that burden for you.

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

124 agents across 13 domain lanes (iOS, Next.js, Django-React, Expo, Data Analytics, Research, SEO, and more). Role separation is strict: orchestrators coordinate and never write code, specialists implement scoped tasks, gates validate and never fix.

The agents are effective because of what they know -- extracted from studying market leaders and others:

- What does deep research look like?
- What makes a good iOS data model?
- What debugging patterns actually work?
- What are the latest strategies for SEO?

Routing modes match complexity to effort:

| Mode | What happens | When to use |
|------|-------------|-------------|
| **Default** | Builder + quality gates | Most work. Fast with automated checks. |
| **--explore** | Divergent exploration, produces tentative brief | Half-baked ideas, early-stage thinking. Explores before committing. |
| **--problem-solve** | Root-cause analysis with structured reasoning | Something is broken and you don't know why. Traces symptoms to causes. |
| **-tweak** | Builder only, no gates | Rapid iteration. You verify yourself. |
| **--complex** | Full pipeline with architect, specialists, all gates | Architecture changes, new features, multi-file work. Requires a spec from `/plan`. |

m
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

Session 50 is different from session 1. And so is the person using it -- you learn to `/plan` before `/orca-*`, to `/deepthink` before deciding, to not drop in quick requests expecting quality output. The system rewards depth from both sides.

---

## Memory

Every Claude Code session starts blank. You explained your architecture yesterday. Today it asks again. The same decisions, the same constraints, the same "no, we tried that and it didn't work."

Three memory systems change this:

- **Workshop** stores decisions and the reasoning behind them. "Why did we choose WebSockets?" returns the actual context from when the decision was made -- not a guess, the original reasoning.
- **Code-index** searches your codebase by meaning, not just filename.
- **ProjectContext** bundles everything relevant for a task -- files, state, decisions, similar past work. Agents start informed, not blank.

Session continuity is automatic:

- `/session-save` captures context; the next session loads it on startup
- Cognitive commands persist output as files, not tokens -- survives context compaction
- Large tool outputs truncated intelligently, middle archived for recall

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

The depth doesn't live in the model or in the user. It lives in the interaction pattern. The system changes model behavior -- forcing depth over speed. It extends model capability -- external memory, multi-agent coordination. And it changes user behavior -- you learn not to accept the first answer, you learn to ask what you're missing. Both sides operating at higher depth creates a feedback loop that neither could sustain alone. The depth is structural -- a property of the collaboration, not of the model.

---

**ORCA OS v5.1** -- [Documentation](docs/) -- [Quick Start](docs/QUICK-START.md)
