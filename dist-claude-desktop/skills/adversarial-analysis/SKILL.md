---
name: adversarial-analysis
description: Systematically attack a proposal across six phases (pre-mortem, assumption audit, edge-case storm, counter-arguments, failure-mode catalog, synthesis) before committing to it, ending in a GO/NO-GO verdict. Use for architecture decisions, choosing between major alternatives, significant refactors, new dependencies, migrations, or any irreversible choice.
---

# Adversarial Analysis — Six-Phase Stress-Test

Proposals that survive adversarial scrutiny are more robust. This is a reference framework you apply directly through reasoning — no external tool required (though if the `cognition` MCP is available, structuring the phases as `thought` calls adds a persisted audit trail).

## Phase 1: Pre-mortem

"It's 6 months from now. This failed. Why?" Imagine the failure vividly, identify 5-7 distinct failure scenarios, trace each to a root cause, note which were preventable.

```
### Pre-mortem
- [Failure scenario]: [Root cause]
```

## Phase 2: Assumption audit

List every assumption, explicit and implicit. Rate confidence H/M/L. For each: "if wrong, what breaks?" Prioritize low-confidence, high-impact assumptions.

```
### Assumptions (confidence: H/M/L)
| Assumption | Confidence | If Wrong |
```

## Phase 3: Edge-case storm

Generate 10+ breaking scenarios: boundary conditions, rare-but-possible inputs, hostile actors, scale extremes (0, 1, many, millions), timing/ordering issues, resource exhaustion, integration failures.

## Phase 4: Counter-arguments

"A senior engineer thinks this is wrong. Their case:" Steel-man the opposition — the strongest possible case against, precedents where similar approaches failed, what a skeptic would demand as proof.

## Phase 5: Failure-mode catalog

Component by component: how it fails, blast radius (contained vs. cascading), detection mechanism.

```
### Failure Modes
| Component | How It Fails | Blast Radius | Detection |
```

## Phase 6: Synthesis

Critical weaknesses (must address, with mitigation each), significant concerns (should address), verdict (GO / CONDITIONAL GO / NO GO), confidence level, one-line rationale.

## Full output template

```
# Challenge: [Proposal]

## The Attack
### Causal Failure Map · ### Assumption Audit · ### Counter-Arguments

## What the Analysis Caught
| Weakness | Source | Severity | Mitigation |

## Verdict
**[GO / CONDITIONAL GO / NO GO]** (confidence: X.X)
[2-4 sentences: the real risk picture, what would change the verdict]
**Required Mitigations (if CONDITIONAL GO):** 1. ...
```

## Quick mode

Time-limited: Phase 1 only, extract top 3 risks into a likelihood/impact/mitigation table, give a one-line verdict (proceed with caution / needs more analysis / red flags present).

## Anti-patterns

Don't: rush through phases, accept vague "it might fail" without specifics, skip steel-manning the counter-arguments, ignore low-probability/high-impact failures, let optimism bias filter out uncomfortable findings.

Do: be genuinely adversarial, quantify where possible, name specific failure modes, give actionable mitigations, render an honest verdict.

## When to use

Architecture decisions, choosing between major alternatives, significant refactors, new dependencies, migrations, irreversible choices. Skip or use quick mode for easily-reversible, small-scope, or genuinely time-critical work (but note the skip explicitly rather than silently omitting it).

Related skills: `challenge` / `adversarial` (the same framework wired to the `cognition` MCP tool for persisted, multi-turn sessions).
