---
name: simplify
description: "Design-simplification router (individual/tweak commands). Flags: --adapt, --clarify, --distill. Each flag runs the in-thread cognition constraint loop (R1 constraints -> R2 work -> evaluate -> loop N=2). Cognition is mandatory here — this is NOT the /impeccable pipeline."
argument-hint: "[--adapt|--clarify|--distill] <target>"
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
  - Bash
  - Skill
  - AskUserQuestion
  - mcp__cognition-mcp__cognition
---

# /simplify — Design Simplification Router (individual commands)

Tweak entry for the simplification verbs. Each flag is an **individual command** run OUTSIDE the
`/impeccable` pipeline — no separate validator agent, so the **cognition constraint loop IS the
enforcement** (mandatory). Zero loop logic of its own (`#POISON_PATH` duplication): the loop is defined
once at `~/.claude/docs/reference/cognition-constraint-loop.md`.

## Parse flag (exactly one required)

| Flag | Verb / craft skill |
|------|--------------------|
| `--adapt` | `adapt` |
| `--clarify` | `clarify` |
| `--distill` | `distill` |

If no flag or an unrecognized flag: print this table, ask the user to pick. Do not guess. Do not run.

## Run — the in-thread cognition constraint loop

**Target routing (`#PATH_DECISION` — one rule, not 5 copies):** apply
`~/.claude/docs/concepts/ios-design-contract/target-routing.md`. If the TARGET ends in `.swift`, load
`Skill("ios-impeccable-hub")` (instead of `impeccable-hub`) and use the Swift detector below; otherwise
keep the CSS path unchanged.

Run the loop at `~/.claude/docs/reference/cognition-constraint-loop.md` with `VERB = <flag>`, loading
`Skill("impeccable-hub")` (the aesthetic; `Skill("ios-impeccable-hub")` for a `.swift` target — see routing
above) + `Skill("<flag>")` (craft spine):

1. **R1 BIND** — cognition `checkpoint` emits the typed FORBIDDEN/FORWARD constraints; capture the ids.
2. **R2 WORK** — edit the target in-thread under the bound ids, applying the craft + the user's critique
   verbatim (FR-6). Before writing styling code, read the relevant doctrine: the CSS manifesto
   (`~/.claude/docs/concepts/llm-css-manifesto.md`) for web; the loaded `ios-impeccable-hub` for a
   `.swift` target (per the routing rule above).
3. **EVALUATE** — check every bound constraint + run the detector self-check (`.swift` →
   `swiftdesigncheck detect --json <file>`; else `designcheck.js detect --json <file>` — see the routing
   rule); record a cognition `thought`.
4. **R(n) LOOP** — fix + re-evaluate until none unsatisfied. **MAX N=2**, then escalate. You may NOT
   claim done with an open constraint.

Cognition is the enforcement on this path — no separate validator agent (that is the `/impeccable`
pipeline). Read the loop file for the full step-by-step; do not paraphrase it here.

## Handback

Aesthetic capture is owner-gated — see ~/.claude/docs/reference/design-lane.md (Aesthetic capture). No closing capture question.
