# Cognition Constraint Loop — the ONE definition every INDIVIDUAL design command runs

**Status:** Canonical. The single shared definition for **standalone / individual** design commands
(`/layout`, `/typeset`, `/colorize`, `/bolder`, `/quieter`, `/delight`, `/overdrive`, `/harden`,
`/polish`, `/optimize`, `/adapt`, `/clarify`, `/distill`, `/animate`, and the routers `/refine`,
`/simplify`, `/fortify` per flag). Defined ONCE here; **never copy-pasted** into command/skill files
(`#POISON_PATH` duplication) — each individual command points to this file.

## Why this exists (the pipeline vs the individual command)

There are two enforcement structures, and they are different on purpose:

| | Enforcement | Cognition |
|---|---|---|
| **`/impeccable` pipeline** (architect → builder → validator → branch → hook) | the **structure**: a separate fresh-context `design-validator` + the deterministic detector hook adjudicate from OUTSIDE the worker | **OPTIONAL** — can run without it |
| **Individual command** (a bare verb / router flag, run for tweaking) | runs in-thread; there is NO separate validator agent — so the **cognition loop is the only thing forcing the constraints** | **MANDATORY — every single one** |

An individual command that skips this loop is back to "suggest, don't enforce" — the exact zero-constraint
failure. So this loop is non-negotiable for standalone use.

## The loop (run this, in-thread)

```
/<verb> <target>   (runs in the main thread — this IS the worker; no subagents)

  0. LOAD     Skill("impeccable-hub") (the aesthetic) + Skill("<verb>") (the craft spine).
  │           For a .swift TARGET, load Skill("ios-impeccable-hub") instead of impeccable-hub
  │           (see docs/concepts/ios-design-contract/target-routing.md).
  │           Read {project}/.claude/PRODUCT.md + DESIGN.md if present (do not block if absent).
  │           Before writing styling code, read the relevant doctrine: for web/CSS,
  │           ~/.claude/docs/concepts/llm-css-manifesto.md + design-contract/preferences/css-architecture.md
  │           (semantic/centralized CSS); for a .swift target, the loaded ios-impeccable-hub.
  │
  1. R1 BIND  cognition checkpoint → typed FORBIDDEN/FORWARD constraints for THIS verb on THIS target,
  │           each citing a detector rule id or banned-rule id. Capture the returned ids (C1, C2, …).
  │
  2. R2 WORK  do the edit in-thread under the bound ids, applying the verb's craft + the user's
  │           verbatim critique (FR-6).
  │
  3. EVALUATE check the artifact against EVERY bound constraint, and run the detector self-check:
  │           node /Users/adilkalam/ORCA-OS/mcp/design-detector/bin/designcheck.js detect --json <file> 2>&1; echo "EXIT=$?"
  │           Record a cognition `thought`: per constraint id → satisfied | unsatisfied (one line of evidence).
  │
  4. R(n)     if ANY bound constraint is unsatisfied OR the detector reports a blocking finding →
  │           fix and re-evaluate. MAX N=2 rounds. You may NOT claim done with an open constraint
  │           (#POISON_PATH). After N=2, ESCALATE to the user with the unresolved constraints named.
  │
  5. HANDBACK aesthetic capture is owner-gated — see ~/.claude/docs/reference/design-lane.md
              (Aesthetic capture). No closing capture question.
```

### R1 — the bind (the enforcement entry)

A real `cognition` call:
```
mcp__cognition-mcp__cognition({
  operation: "checkpoint", projectPath: <repo root>, verbose: false,
  sessionTitle: "<verb> on <target>", sessionTags: ["design","<verb>"],
  content: { command: "/<verb>", phase: "bind", addConstraints: [
    { type: "FORBIDDEN", text: "<named slop this verb can trip> (detector:<ruleId> | banned:<id>)" },
    { type: "FORWARD",   text: "<felt-state obligation derived from voice-anchors.md + the task>" }
  ]})
})
```
Draw rule ids from `docs/concepts/design-contract/detector-rules.json` (`tailwind-palette-utilities`,
`reflex-fonts`, `geist-imports`, `purple-pink-gradients`, `gradient-text`, `side-stripe-borders`,
`inset-highlight-shadow`, `default-ease-transition`, `bouncy-easing`). `utility-sprawl` is ADVISORY — do
not bind it as a hard FORBIDDEN. Skipping R1 leaves nothing to satisfy → you must not proceed to a
"done" claim.

### R(n) — the loop is the gate

The pass/fail check is against the R1 constraints you recorded. "Done" requires every bound constraint
satisfied (or escalated at N=2). The cognition `thought` trail is the evidence the loop actually ran.

## The honest ceiling

This loop raises the floor — rules present (hub), constraints forced (cognition), no named slop
(detector self-check). It does not manufacture taste; the user's eye is the ceiling. For larger / net-new
work where an external judge is wanted, use the `/impeccable` **pipeline** (`design-lane.md`) instead —
that adds the separate validator + the hook floor on top.
