# Adversarial Analysis

RULE: Before implementing any significant proposal, systematically attack it to find weaknesses.

## The Principle

Proposals that survive adversarial scrutiny are more robust. This skill provides a 6-phase framework for stress-testing ideas before commitment.

## Loading This Skill

Agents can load via:
```yaml
required_skills:
  - adversarial-analysis
```

Or dynamically invoke:
```
skill: adversarial-analysis
```

---

## The 6-Phase Framework

### Phase 1: Pre-mortem

> "It's 6 months from now. This failed. Why?"

Assume complete failure and work backwards. What went wrong?

**Process:**
1. Vividly imagine the failure state
2. Identify 5-7 distinct failure scenarios
3. Trace each back to root causes
4. Note which causes were preventable

**Output format:**
```
### Pre-mortem
> "It's 6 months from now. This failed. Why?"
- [Failure scenario 1]: [Root cause]
- [Failure scenario 2]: [Root cause]
- [Failure scenario 3]: [Root cause]
```

---

### Phase 2: Assumption Audit

Every proposal rests on assumptions. Surface and stress-test them.

**Process:**
1. List every assumption (explicit and implicit)
2. Rate confidence: H (high) / M (medium) / L (low)
3. For each, answer: "If wrong, what breaks?"

**Output format:**
```
### Assumptions (confidence: H/M/L)
| Assumption | Confidence | If Wrong |
|------------|------------|----------|
| [Assumption 1] | M | [Impact if false] |
| [Assumption 2] | L | [Impact if false] |
| [Assumption 3] | H | [Impact if false] |
```

Prioritize low-confidence, high-impact assumptions for deeper analysis.

---

### Phase 3: Edge Case Storm

Generate 10+ scenarios that could break the proposal.

**Process:**
1. Think about boundary conditions
2. Consider rare but possible inputs
3. Imagine hostile actors
4. Consider scale extremes (0, 1, many, millions)
5. Consider timing/ordering issues
6. Consider resource exhaustion
7. Consider integration failures

**Output format:**
```
### Edge Cases
- [Breaking scenario 1]
- [Breaking scenario 2]
- [Breaking scenario 3]
... (minimum 10)
```

---

### Phase 4: Counter-Arguments

> "A senior engineer thinks this is wrong. Their case:"

Steel-man the opposition. Build the strongest possible case against.

**Process:**
1. Adopt an adversarial persona
2. Find the most compelling reasons to reject
3. Identify precedents where similar approaches failed
4. Note what a skeptic would demand as proof

**Output format:**
```
### Counter-Arguments
> "A senior engineer thinks this is wrong. Their case:"
- [Argument 1]: [Evidence/reasoning]
- [Argument 2]: [Evidence/reasoning]
- [Argument 3]: [Evidence/reasoning]
```

---

### Phase 5: Failure Mode Catalog

Component-by-component failure analysis.

**Process:**
1. Identify each major component
2. Determine how each could fail
3. Assess blast radius (contained vs cascading)
4. Identify detection mechanisms

**Output format:**
```
### Failure Modes
| Component | How It Fails | Blast Radius | Detection |
|-----------|--------------|--------------|-----------|
| [Component 1] | [Failure mode] | [Impact scope] | [How to detect] |
| [Component 2] | [Failure mode] | [Impact scope] | [How to detect] |
```

---

### Phase 6: Synthesis

Integrate findings into actionable recommendations.

**Process:**
1. Identify critical weaknesses (must address before proceeding)
2. Identify significant concerns (should address)
3. Render verdict: GO / CONDITIONAL GO / NO GO
4. State confidence level

**Output format:**
```
### Synthesis

**Critical Weaknesses (must address):**
1. [Weakness] - Mitigation: [Action]
2. [Weakness] - Mitigation: [Action]

**Significant Concerns (should address):**
1. [Concern] - Mitigation: [Action]

**Verdict:** [GO / CONDITIONAL GO / NO GO]
**Confidence:** [High / Medium / Low]
**Rationale:** [1-2 sentences explaining verdict]
```

---

## Full Output Template

```markdown
## Adversarial Analysis: [Proposal Summary]

### Pre-mortem
> "It's 6 months from now. This failed. Why?"
- [Failure 1]
- [Failure 2]
- [Failure 3]

### Assumptions (confidence: H/M/L)
| Assumption | Confidence | If Wrong |
|------------|------------|----------|
| ... | ... | ... |

### Edge Cases
- [Scenario 1]
- [Scenario 2]
... (10+)

### Counter-Arguments
> "A senior engineer thinks this is wrong. Their case:"
- [Argument 1]
- [Argument 2]

### Failure Modes
| Component | How It Fails | Blast Radius | Detection |
|-----------|--------------|--------------|-----------|
| ... | ... | ... | ... |

### Synthesis
**Critical Weaknesses (must address):**
1. [Weakness] - Mitigation: [Action]

**Significant Concerns (should address):**
1. [Concern] - Mitigation: [Action]

**Verdict:** [GO / CONDITIONAL GO / NO GO]
**Confidence:** [High / Medium / Low]
**Rationale:** [Explanation]
```

---

## Using cognition-mcp

For rigorous analysis, use cognition-mcp to store structured analysis:

```
mcp__cognition-mcp__cognition
  operation: "thought"
  thought: "Beginning adversarial analysis of [proposal]. Phase 1: Pre-mortem..."
  thoughtNumber: 1
  totalThoughts: 12
  nextThoughtNeeded: true
```

Structure as 2 thoughts per phase (analysis + output), allowing revision and branching as needed.

---

## Quick Mode (Phase 1 + Top 3 Risks)

When time is limited, run Phase 1 only and extract top 3 risks:

```markdown
## Quick Adversarial Analysis: [Proposal Summary]

### Pre-mortem
> "It's 6 months from now. This failed. Why?"
- [Failure 1]
- [Failure 2]
- [Failure 3]

### Top 3 Risks
1. **[Risk]** - Likelihood: [H/M/L], Impact: [H/M/L]
2. **[Risk]** - Likelihood: [H/M/L], Impact: [H/M/L]
3. **[Risk]** - Likelihood: [H/M/L], Impact: [H/M/L]

**Quick Verdict:** [Proceed with caution / Needs more analysis / Red flags present]
```

---

## Deep Mode (+ Cognition Integration)

For critical decisions, after completing all 6 phases, invoke:

```
/think --model inversion [proposal]
```

This adds mental model analysis (thinking backwards from failure) to complement the adversarial framework.

---

## Anti-Patterns

DON'T:
- Rush through phases
- Accept vague "it might fail" without specifics
- Skip the steel-man counter-arguments
- Ignore low-probability, high-impact failures
- Let optimism bias filter out uncomfortable findings

DO:
- Be genuinely adversarial
- Quantify where possible
- Name specific failure modes
- Provide actionable mitigations
- Render an honest verdict

---

## Integration with Other Skills

- **search-before-edit**: Search for similar past failures before analysis
- **debugging-first**: If analyzing a fix, debug the original issue first
- **linter-loop-limits**: Don't iterate forever on edge case generation

---

## When to Use

**Use adversarial analysis when:**
- Making architecture decisions
- Choosing between major alternatives
- Proposing significant refactors
- Introducing new dependencies
- Planning migrations
- Making irreversible choices

**Skip (or use quick mode) when:**
- Changes are easily reversible
- Scope is small and contained
- Time pressure is extreme (but document the skip)
