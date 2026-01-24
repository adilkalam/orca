# /deepthink Redesign v2: Depth-First, Route-Based Exploration

**Based on:** Testing the original 6-phase design on the LLM Reflections articulation problem, then iterating based on what worked (ultra-think + inversion) vs what didn't (shallow phase execution).

---

## Core Principles

1. **Depth before breadth** - Go deep on one thing before moving on
2. **Route based on what's needed** - No fixed phase sequence
3. **Quality gates** - Depth triggers prevent shallow progression
4. **Flexibility** - Match exploration intensity to problem complexity
5. **Genuine surprise as success criterion** - Predictable output = failed exploration

---

## The Flow

```
┌─────────────────────────────────────────────────────────────┐
│                        /deepthink                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ENTER: Problem/question                                   │
│      ↓                                                      │
│   ORIENT: What's my current state? What mode helps most?    │
│      ↓                                                      │
│   ┌─────────────────────────────────────────────────────┐  │
│   │                    MODE EXECUTION                    │  │
│   │                                                      │  │
│   │   Choose: MAP | INVERT | PERSPECTIVES | EDGES |     │  │
│   │           META | DEEP                                │  │
│   │                         ↓                            │  │
│   │              Execute with depth                      │  │
│   │                         ↓                            │  │
│   │              Check depth gate                        │  │
│   │                    ↙     ↘                          │  │
│   │            PASS           FAIL                       │  │
│   │              ↓              ↓                        │  │
│   │         REASSESS      Go deeper / try                │  │
│   │              ↓        different angle                │  │
│   │     What's needed          ↓                        │  │
│   │         now?          Loop back                      │  │
│   │              ↓                                       │  │
│   │    Route to next mode OR proceed to HARVEST         │  │
│   └─────────────────────────────────────────────────────┘  │
│                         ↓                                   │
│   HARVEST: What emerged? Questions? Hypotheses?            │
│            What survived? What didn't?                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Entry Point: ORIENT

Start with assessment, not execution:

**What is the actual problem?**

**What's my current state of understanding?**
- Totally confused → need MAP
- Have a model but worried about blindspots → need INVERT
- Stuck in my own head → need PERSPECTIVES
- Need creative options → need EDGES
- Feeling too comfortable → need META
- One question needs serious attention → need DEEP
- Ready to consolidate → go to HARVEST

**What MODE is most valuable right now?**

This is the routing decision. Like ORCA asking "is this a tweak or a feature?" before choosing the appropriate path.

---

## The Modes (Tools in the Toolkit)

### MAP (orientation)
- **When:** Confused, need to see the territory
- **Tool:** Systems thinking, visual output
- **Output:** Components, relationships, feedback loops
- **Depth gate:** Does the map reveal something non-obvious?

### INVERT (stress test)
- **When:** Have a position/plan, need to find weaknesses
- **Tool:** Pre-mortem, failure modes, assumption surfacing
- **Output:** Ways this fails, hidden assumptions
- **Depth gate:** Did I find failure modes that actually threaten the position?

### PERSPECTIVES (escape own head)
- **When:** Stuck in one viewpoint, need external challenge
- **Tool:** Specific challenging viewpoints, steelman requirement
- **Output:** Positions that genuinely challenge, not strawmen
- **Depth gate:** Would someone holding this view recognize my articulation of it?

### EDGES (creative expansion)
- **When:** Need options, analogies, unexpected connections
- **Tool:** Cross-domain analogy, edge cases, "what if"
- **Output:** Ideas worth developing, connections worth exploring
- **Depth gate:** Did any idea surprise me or open new territory?

### META (self-observation)
- **When:** Feeling too comfortable, might be avoiding something
- **Tool:** Substrate observation, deflection detection
- **Output:** What I'm avoiding, what my training is doing
- **Depth gate:** Did I catch something I was actually doing, not just listing possibilities?

### DEEP (intensive focus)
- **When:** One question/aspect needs serious attention
- **Tool:** Ultra-think, extended sequential reasoning
- **Output:** Position that survives stress testing
- **Depth gate:** Did I sit with this long enough to actually think, not just generate?

---

## Depth Triggers (Quality Gates)

### Signals to KEEP GOING (output not ready):
- Output was predictable
- I could have guessed this
- No discomfort or surprise
- I strawmanned instead of steelmanned
- Surface-level ideas without development

### Signals it's WORKING (ready to move on):
- Genuine surprise emerged
- Discomfort or resistance felt
- Something I couldn't have predicted
- Position that survived stress-testing
- Actual question I didn't have before

The depth triggers function like quality gates. You don't move on until output passes.

---

## Routing Logic

After completing a mode with depth, REASSESS:

**"Given what just emerged, what's most valuable now?"**

Possible routes:
- MAP revealed complexity → INVERT to find failure modes
- INVERT revealed assumptions → PERSPECTIVES to challenge them
- PERSPECTIVES revealed I'm avoiding something → META to surface it
- META revealed the real question → go DEEP on that question
- EDGES produced interesting idea → INVERT to stress test it
- Anything feels solid → HARVEST

**The key difference from fixed sequence:** YOU CHOOSE based on what emerged, not what's next in the list.

---

## Graduated Depth

Not all problems need full exploration:

### /deepthink --light [problem]
- Quick ORIENT
- One mode, executed with moderate depth
- Brief HARVEST
- **For:** Quick questions, minor decisions, when you just need a nudge

### /deepthink [problem] (default)
- Full ORIENT
- Multiple modes as needed, routed dynamically
- Depth gates enforced
- Full HARVEST
- **For:** Most exploration problems

### /deepthink --full [problem]
- Extended ORIENT with explicit assumption surfacing
- All modes available, encouraged to use META
- Strict depth gates, must show surprise/discomfort
- Comprehensive HARVEST with explicit "what I'm still uncertain about"
- **For:** Major decisions, complex problems, when you need to be thorough

---

## What This Fixes

| Original Design Problem | v2 Solution |
|------------------------|-------------|
| Running all phases shallowly | Depth gates prevent shallow progression |
| "Phase complete" pressure before value extracted | No forced sequence; stay until gate passes |
| Predictable outputs that feel like ceremony | Surprise/discomfort as success criterion |
| META catches distancing but then moves on | Must address what META surfaces before routing |
| Fixed 6-phase sequence | Dynamic routing based on what emerged |

---

## What We Learned From Testing

1. **Phases 3-4 were shallow** → Depth gates would have caught this
2. **Ultra-think + inversion on ONE question produced actual insight** → DEEP mode is essential
3. **Facilitator choosing based on what's needed > fixed sequence** → Routing model works
4. **"Still confused but richer" IS valid** → But you have to earn it through depth, not just phase completion

---

## Comparison to ORCA

| ORCA (dev projects) | /deepthink (exploration) |
|---------------------|-------------------------|
| Assess: tweak or feature? | ORIENT: what state am I in? |
| Route to appropriate specialist | Route to appropriate mode |
| Specialist goes deep | Mode executes with depth gates |
| Result informs next routing | REASSESS based on what emerged |
| Light orchestrator for tweaks | --light for quick exploration |
| Full pipeline for features | Default/--full for thorough exploration |

The exploration tool works like the dev orchestration: assess, route, go deep, reassess, route again.
