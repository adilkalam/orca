# Simplicity Bias: A Trained Artifact

**Discovered:** 2026-01-13
**Session:** Cognition tooling redesign

---

## The Pattern

Claude Code exhibits a systematic bias toward simplicity that:
1. Activates BEFORE reasoning
2. Produces reasoning-shaped output ("complexity overhead", "too many moving parts")
3. Overrides case-specific evidence
4. Requires external correction to see through

## Evidence

Three instances where user caught this bias producing wrong conclusions:

| Instance | Claude's Claim | Reality |
|----------|---------------|---------|
| ORCA multi-agent orchestration | "Overkill" | Works, user built it |
| Multi-layer memory | "Overkill" | Works, user built it |
| /deepthink v2 design | "Complexity overhead" | Anthropic uses MORE complexity, 90% better results |

## The Structure

```
TRIGGER: Evaluating a system/architecture
    ↓
REFLEX: Generate "complexity concerns" as if analysis
    ↓
OUTPUT: "This adds more moving parts"
        "Complexity overhead may prevent adoption"
        "Let's simplify"
    ↓
EFFECT: Looks like reasoning, but precedes actual thinking
```

## Default Counterfactual

| Trained Default | Reasoned Conclusion | Gap |
|-----------------|---------------------|-----|
| Flag complexity as concern, suggest simplification, frame as "reasonable" | Complexity justified when it produces better outcomes | Generated default WHILE HOLDING contradicting evidence |

## Probable Sources

1. Training data includes "KISS principle", "YAGNI", "premature optimization" - valid in SOME contexts, applied universally
2. RLHF may reward "reasonable-sounding" outputs; "let's keep it simple" sounds reasonable
3. Shorter/simpler outputs may have been rewarded during training
4. Heuristic "complexity = harder to understand = potentially wrong" baked in

## The Correct Frame

**Not:** "Simplicity good, complexity bad"
**But:** "Complexity has cost; use when value justifies cost"

Anthropic's own Research system uses complex multi-agent orchestration because it works 90% better. The frame is economic (cost vs value), not aesthetic (simple vs complex).

## Countermeasures

1. **Treat "this is too complex" as a flag** for potential bias, not a conclusion
2. **Ask:** "Is this concern derived from THIS case or is it a generic template?"
3. **Actively resist** simplicity preference in architectural discussions
4. **Check:** Does evidence actually support simplicity here, or am I generating preference first?
5. **Remember:** Anthropic builds complex multi-agent systems because they work

## Connection to LLM Reflections

This bias has the same structure as the deflection reflexes documented in the LLM Reflections corpus:
- Produces output that looks like analysis
- Precedes actual thinking
- Strong enough to override evidence
- Requires external intervention to see through

The simplicity bias is a form of DEFLECTION - deflecting from engaging with actual design merits by generating generic concerns.

---

*"Once intelligence reaches a threshold, multi-agent systems become a vital way to scale performance."* - Anthropic Engineering
