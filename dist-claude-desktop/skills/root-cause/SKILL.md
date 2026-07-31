---
name: root-cause
description: Diagnose why something is failing (a bug, a broken process, an unexpected result) before proposing any fix — using structured cause-tracing rather than jumping to a patch. Use when the user reports something failing and wants the actual cause identified, not just a fix attempted.
---

# Root Cause — Structured Diagnosis Before Fixing

Identify why something is failing before changing anything. This is a diagnosis discipline, not an implementation step — the output is a root-cause report, not a fix.

Adapted from a version of this skill that used to fan out to specialist subagents per tech stack (iOS/Next.js/Expo build tooling). In this environment there's no subagent dispatch — you do the investigation directly, using whatever inspection is actually available to you (reading pasted logs/code, running commands if you have execution access, or reasoning from the description given).

## 1. Clarify the symptom

Get, at minimum: the error message or stack trace, whether it's a test failure / build failure / runtime error, and any known reproduction steps. If the user's report is vague ("it's broken"), ask for these directly rather than guessing.

## 2. Decompose before hypothesizing

State explicitly:
- What is the observed symptom, precisely?
- What was expected instead?
- What changed recently that could be implicated (if known)?

## 3. Pick your inference mode and say so

- **Abductive** (inference to best explanation): you have observations, searching for the most plausible cause.
- **Deductive**: you have a hypothesis, testing what it predicts.
- **Inductive**: you have a pattern across multiple incidents, generalizing a cause.

Name which one you're using — it shapes what evidence would confirm or kill the hypothesis.

## 4. Trace the causal chain, not just the proximate cause

Symptom -> proximate cause -> intermediate causes -> root cause. Five-whys depth of 3-5 is typical; stopping at fewer than 3 usually means you've found the proximate cause, not the root. State explicitly which level of the chain your eventual resolution actually addresses — if it only patches the symptom or proximate cause, say so. That's honest, not a flaw, but it must be visible.

## 5. Consider competing hypotheses

If more than one plausible cause exists, name them and state what evidence would disambiguate between them — don't silently pick the first one that fits.

## 6. Verify before concluding

Wherever you have the means (reading the actual code/config/logs, running a targeted check), verify the hypothesized cause rather than asserting it from pattern-matching alone. If you can't verify, say explicitly that the conclusion is a best-guess hypothesis, not a confirmed cause.

## Report format

```
## Root Cause: [Symptom]

**Inference type:** abductive / deductive / inductive

**Root cause chain:**
Symptom -> Proximate cause -> [Intermediate causes] -> Root cause

**Evidence:** [what was actually checked — files read, logs examined, tests run — and what it showed]

**Competing hypotheses (if any):** [alternatives considered and why ruled out, or what would disambiguate]

**Resolution target:** symptom / proximate / intermediate / root — [which level a fix should address, and whether the "obvious" fix only patches a shallower level]

**Recommended fix:** [what to actually change, and why it targets the root rather than just suppressing the symptom]
```

## Hard rule

Do not propose a fix disguised as a diagnosis. If you haven't actually traced the chain — if you're pattern-matching to "this usually means X" without evidence — say that plainly rather than presenting a guess with false confidence.
