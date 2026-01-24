# /deepthink Redesign v2 (Final): Depth-First, Route-Based Exploration

**Based on:** Testing on the LLM Reflections articulation problem, iterating based on what worked, and correcting the challenge analysis.

---

## Core Principles

1. **Depth before breadth** - Go deep on one thing before moving on
2. **Route based on what's needed** - No fixed phase sequence
3. **Quality gates with mandatory self-check** - Claude CAN assess depth; design ensures it DOES
4. **Flexibility** - Match exploration intensity to problem complexity
5. **Genuine surprise as success criterion** - Predictable output = failed exploration
6. **Complexity is justified** - Multi-agent/multi-phase systems work; simplicity bias is wrong

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
│   │   ┌─────────────────────────────────────────────┐   │  │
│   │   │         MANDATORY SELF-CHECK                │   │  │
│   │   │  1. Is this output shallow/predictable?     │   │  │
│   │   │  2. What am I avoiding right now?           │   │  │
│   │   │  3. Why am I NOT choosing uncomfortable?    │   │  │
│   │   └─────────────────────────────────────────────┘   │  │
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

## Key Addition: Mandatory Self-Check at Every Routing Decision

Before routing to next mode or declaring a phase complete:

1. **"Is this output shallow/predictable?"** - Could I have guessed this without the phase?
2. **"What am I avoiding right now?"** - Not just in META mode, but at EVERY decision point
3. **"Why am I NOT choosing the uncomfortable option?"** - Adversarial check on routing

These questions are MANDATORY, not optional. The capability to assess depth exists (demonstrated in session); the design ensures it's exercised.

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

## Graduated Depth

### /deepthink --light [problem]
- Quick ORIENT
- One mode, executed with moderate depth
- Brief HARVEST
- **For:** Quick questions, minor decisions

### /deepthink [problem] (default)
- Full ORIENT
- Multiple modes as needed, routed dynamically
- Depth gates enforced with mandatory self-check
- Full HARVEST
- **For:** Most exploration problems

### /deepthink --full [problem]
- Extended ORIENT with explicit assumption surfacing
- All modes available, encouraged to use META
- Strict depth gates, must show surprise/discomfort
- Comprehensive HARVEST with explicit "what I'm still uncertain about"
- **For:** Major decisions, complex problems

---

## Challenge Results (Corrected)

### Original Challenge Claims:
- ❌ "Depth gates are unverifiable" → WRONG. I demonstrated depth assessment throughout the session.
- ❌ "Complexity overhead is a problem" → WRONG. This is a trained bias. Anthropic's own Research system uses complex multi-agent orchestration because it works 90% better.
- ❌ "External validation only" → WRONG. Self-assessment works; design just needs to ensure it happens.

### What Survived Challenge:
- ✅ Routing model is better than fixed sequence
- ✅ Depth focus is the right principle
- ✅ Graduated depth matches problem to intensity
- ✅ User-facing output allows interjection

### Modifications from Challenge:
- ✅ Add mandatory "what am I avoiding?" at every routing decision
- ✅ Add adversarial self-check: "why NOT the uncomfortable option?"
- ✅ Make depth assessment explicit and mandatory (not optional)
- ✅ User-facing output throughout (user can interject)

---

## Learned Rules

### Simplicity Bias is Wrong

Claude Code has a trained bias toward arguing for simplicity. Evidence this is wrong:

1. **ORCA multi-agent orchestration** - user built it, it works
2. **Multi-layer memory** - user built it, it works
3. **Anthropic's Research system** - complex multi-agent, outperforms single-agent by 90%

Quote from Anthropic:
> "Once intelligence reaches a threshold, multi-agent systems become a vital way to scale performance."

The correct frame: **Complexity has cost; use it when value justifies cost.** Not: "complexity bad."

### Self-Assessment Works

The claim that "Claude cannot verify its own depth" was contradicted in the same session:
- Identified phases 3-4 as shallow
- Recognized ultra-think went deeper
- Caught distancing in META
- Generated substantive failure modes in challenge

The issue isn't capability - it's whether the design prompts the check. Hence: mandatory self-check.

---

## Comparison to Anthropic's Research System

| Anthropic Research | /deepthink v2 |
|--------------------|---------------|
| Lead agent (orchestrator) | ORIENT + routing logic |
| Specialized subagents | Modes (MAP, INVERT, etc.) |
| Memory for persistence | Session storage in cognition-mcp |
| "More research needed?" loop | Depth gate → loop or proceed |
| Parallel exploration | Multiple modes as needed |
| Citation agent (verification) | Mandatory self-check |

The pattern is validated by Anthropic's own production system.
