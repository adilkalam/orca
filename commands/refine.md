---
name: refine
description: "Thin design-refinement router. Flags map to skills: --animate, --bolder, --colorize, --delight, --layout, --overdrive, --quieter, --typeset."
argument-hint: "--<flag> <target>"
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - Bash
  - Skill
  - AskUserQuestion
---

# /refine — Design Refinement Router

Thin category router. Parses one flag, loads the matching skill, applies guidance to the user's target, rant-captures at handback.

For heavy motion work use `/motion-design` directly — this command's `--animate` is a light pass-through.

## Parse flag

Accepted flags (exactly one required):

| Flag | Skill invoked |
|------|---------------|
| `--animate` | `Skill("animate")` |
| `--bolder` | `Skill("bolder")` |
| `--colorize` | `Skill("colorize")` |
| `--delight` | `Skill("delight")` |
| `--layout` | `Skill("layout")` |
| `--overdrive` | `Skill("overdrive")` |
| `--quieter` | `Skill("quieter")` |
| `--typeset` | `Skill("typeset")` |

If no flag is provided, or an unrecognized flag is provided: print the flag list above, ask the user to pick. Do not guess. Do not run.

**`--animate` invokes the `animate` skill (light pass-through). It does NOT invoke `/motion-design`. If the user wants the heavy pipeline, they call `/motion-design` directly.**

**`--overdrive` invokes the `overdrive` skill. It is not promoted to a standalone command.**

## Entry: mandatory skill loading

Before any work, invoke via the Skill tool in this order:

1. Invoke `Skill("impeccable-hub")` — the baseline register. The hub carries the `interfaces-that-feel` felt-state spine PLUS the full register (17 voice anchors, the rants as refusals, the preferences as positive moves, the detector contract). Loading it is what ends the repetition tax — the rules are present by construction. Required for every `/refine` invocation; cannot be skipped.
2. Invoke `Skill("<flag>")` — where `<flag>` is the parsed flag value (e.g. `Skill("bolder")` for `--bolder`).

These are directives, not suggestions.

## Context gathering

1. Read the project contract if present — `{current-project}/.claude/PRODUCT.md` (strategic context) + `{current-project}/.claude/DESIGN.md` (visual contract).
2. **If absent, do NOT block.** Run on the hub's global register (the rants + preferences + voice-anchors still prevent slop) and note once: *"No project contract found — running on the global register; run `/impeccable --teach` to make this project-specific."* Frictionless on any project is the point.
3. If the user's target is ambiguous (vague selector, multiple possible pages/components): ask **one** clarifying question. Do not guess.

## Work

Apply the loaded skill's guidance to the user's target. The skill's own procedures drive the work — do not duplicate or paraphrase skill logic here. If the hub baseline and the flag skill conflict, the hub baseline wins on felt-state questions; the flag skill wins on its domain mechanics.


## Handback — externalized adjudication (the shared lane)

`/refine` edits existing UI, so the edited artifact is judged by the separate validator, not self-graded. Run the shared design lane at `~/.claude/docs/reference/design-lane.md` — the `bind → build → validate → branch` sequence is defined ONCE there; do NOT copy its steps here (`#POISON_PATH` duplication). In brief: the deterministic detector floor runs on the edited artifact, then `Agent(design-validator)` (fresh context) judges it against the bound constraints and returns `GATE_VERDICT: PASS|BLOCK`. On BLOCK, loop (MAX N=2) then escalate to the user. Read the lane file for the full step-by-step.

The validator's judgment + the user's eye is the taste ceiling — the lane raises the floor (no named slop), it does not manufacture taste.

## Handback — rant-capture

After implementation, ask verbatim:

> Returned to bench. Anything here you'd rant about?

If the user responds with rant content, append to `{current-project}/.orca/design-rants-pending.md` with a timestamp header:

```markdown
## {ISO-8601 timestamp} — /refine --<flag>

{user's rant, verbatim}
```

Create the file if it does not exist. Never write directly to `~/.claude/` or the ORCA-OS source tree.

If nothing to rant, say so and stop.
