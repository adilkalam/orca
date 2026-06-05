# Design Lane — the ONE bind → build → validate → branch sequence

**Status:** Canonical. The single shared definition every design verb references (FR-8). Defined ONCE
here; **never copy-pasted into command files** (`#POISON_PATH` — that duplication is what bloated
impeccable/recraft/motion-design). A design command points to this file and supplies the task +
flag-specific inputs.

**Spec:** `.orca/requirements/2026-06-03-2251-design-system-totality-rethink/06-requirements-spec.md`
(FR-3/4/5/6/8). **Orchestration legality:** the command runs in the **main thread**, so it is the
orchestrator and may legally spawn single-level `Agent()` subagents. The builder and validator are
single-level spawns; neither sub-spawns (flat pattern,
`docs/reference/flatten-orchestration-pattern.md`).

> **Status of this lane (2026-06-03):** the agents (`design-builder`, `design-validator`) are authored
> in-repo but are NOT yet deployed and a new agent is not spawnable until a Claude Code session reload.
> The lane is therefore **built, pending post-reload live proof** — do not claim it is live-verified.

---

## The sequence

```
/<design verb>  (main thread = orchestrator)
   │
   1. BIND      cognition checkpoint → typed FORBIDDEN/FORWARD constraints (with detector/rant ids)
   │            → record returned constraint ids to phase_state.planning.bound_constraint_ids
   │
   2. BUILD     Agent(design-builder)  → produces the artifact under the bound ids (hub preloaded)
   │
   3. VALIDATE  Agent(design-validator) → FRESH context; judges artifact vs bound ids + detector
   │            → returns GATE_VERDICT: PASS|BLOCK  (never sees the builder's reasoning)
   │
   4. BRANCH    PASS  → hand back
                BLOCK → loop to step 2 with combined findings, MAX N=2, then ESCALATE to user
```

The orchestrator **never judges its own output** — that re-enables the self-charity failure
(`#POISON_PATH`). Adjudication is external: the deterministic detector + a separate fresh-context
validator.

---

## Step 1 — BIND (the orchestrator, main thread)

A skill *request* gets routed around toward the generic-default attractor. The bind is not a request: it
loads felt-state context AND emits typed constraints whose ids downstream steps consume.

1. **Load the hub.** `Skill("impeccable-hub")` — the single home for the register (voice anchors, rants,
   preferences, detector contract). The hub points to the canonical refs; read the task-relevant rants
   (a dashboard trips `colors`/`alignment-spacing`/`rounded-corners`; a marketing hero trips
   `gradients`/`fonts`).
2. **Emit the bind checkpoint.** A real `cognition` tool call, `operation: "checkpoint"`, with
   `command: "/<verb>"`, `phase: "bind"`, and an `addConstraints` array:
   - One `FORBIDDEN` per slop pattern the task can trip, each citing its source:
     `{type:"FORBIDDEN", text:"<slop> (detector:<ruleId> | rant:<id>)"}`. Draw ruleIds from
     `detector-rules.json` (`tailwind-palette-utilities`, `tailwind-hex-values`, `reflex-fonts`,
     `geist-imports`, `purple-pink-gradients`, `gradient-text`, `side-stripe-borders`,
     `inset-highlight-shadow`, `default-ease-transition`, `bouncy-easing`). `utility-sprawl` is ADVISORY
     — never bind it as a hard FORBIDDEN.
   - One or more `FORWARD` items derived AT RUNTIME from `voice-anchors.md` + the task — the felt-state
     obligations this interface must satisfy: `{type:"FORWARD", text:"<felt-state obligation>"}`.
3. **Record the returned ids (load-bearing linkage).** The checkpoint response returns
   `protocolState.activeConstraints` with auto-assigned ids (`C1`, `C2`, …). Write them to
   `{project}/.orca/orchestration/phase_state.json` under `planning.bound_constraint_ids` (create the
   file/dirs if absent). Also serialize the typed constraints (id + type + statement + detector_rule) to
   a small JSON the validator receives as `BOUND_CONSTRAINTS` — the shape in
   `.orca/orchestration/temp/phase0-proof/bound-constraints.example.json`.

**Skipped bind → no bound ids.** The validator then returns `GATE_VERDICT: BLOCK` with
`UNSATISFIED_CONSTRAINTS: ["NO-BOUND-CONSTRAINTS"]` (FR-4). The penalty is structural — there is nothing
to validate against, so the gate cannot pass. Never a silent ship.

### Interactive refinement stays IN-THREAD (FR-6)

Full separation governs the *build-then-judge* cycle only. `/live` element-by-element iteration and the
user's mid-build critique stay **in-thread**: the orchestrator carries the user's shape/critique verbatim
into the builder prompt so felt-state nuance is not lost to isolation. `#PATH_DECISION`

---

## Step 2 — BUILD (Agent: design-builder, single-level)

Spawn `Agent(design-builder)` with:
- The task description + the chosen flag's intent.
- `BOUND_CONSTRAINTS` (the typed ids from step 1) — it must satisfy these.
- The user's in-thread shape/critique (FR-6), verbatim.
- The hub: by default **inject the hub content into the prompt** (the reload-safe path; the builder also
  declares `skills: [impeccable-hub]` frontmatter as a post-reload optimization once preload is proven).
- On a retry: the combined detector + validator findings from the previous BLOCK.

The builder produces the artifact and reports the file path(s). It does NOT self-grade.

---

## Step 3 — VALIDATE (Agent: design-validator, single-level, FRESH context)

Spawn `Agent(design-validator)` with ONLY:
- `ARTIFACT_PATH` — the produced file path(s).
- `BOUND_CONSTRAINTS` — the typed ids from step 1.
- (the hub, via prompt-injection / `skills: [impeccable-hub]`).

It does **NOT** receive the builder's reasoning — external-ness is the point. The validator runs the
local detector, maps findings → bound FORBIDDEN ids, judges FORWARD constraints, and emits the machine
verdict contract:

```
GATE_VERDICT: PASS|BLOCK
SCORE: <0-100>
UNSATISFIED_CONSTRAINTS: [<bound-id>, ...]
FINDINGS: [{"id": "...", "severity": "P0|P1|advisory", "where": "...", "note": "..."}, ...]
```

`GATE_VERDICT` is the ONLY field the orchestrator branches on (`PASS` or `BLOCK`, never empty, never
"WARN"). See `agents/design/design-validator.md` for the full procedure and
`.orca/orchestration/temp/phase0-proof/validator-agent.prompt.md` for the proven contract.

**Validator scope is honest (FR-5):** hard-on-named-slop (detector P0 + unsatisfied bound ids),
advisory-on-taste. Pure taste beyond the bound constraints is noted `advisory` and does not by itself
force BLOCK. **The user's eye remains the taste ceiling.** The detector/validator are never sold as a
quality guarantee.

---

## Step 4 — BRANCH (the orchestrator)

Parse `GATE_VERDICT`:

- **PASS** → proceed to handback.
- **BLOCK** → loop back to **step 2 (BUILD)**, feeding the builder the combined
  `UNSATISFIED_CONSTRAINTS` + `FINDINGS`. **MAX N = 2 retries.** After the 2nd failed retry, **ESCALATE
  to the user** with the unresolved findings named explicitly. Never silently ship; never infinite-loop
  (acceptance test 7 — loud, not silent).

Track the retry counter in `phase_state.planning` (or a lane-local field) so the bound is enforced
across the loop.

---

## The honest ceiling (state it, never hide it — §7 of the spec)

- **Guaranteed:** rules present (the hub loads structurally); adjudication external (separate validator +
  detector floor + the gated Phase-3 hook, once live); no named slop; no forged gate (anti-fabrication,
  Phase 3); no silent no-op.
- **NOT guaranteed:** good taste — irreducibly the validator's judgment + **the user's eye**. The lane
  raises the floor and externalizes judgment; it does not manufacture taste.

---

## Deferred to Phase 3 (gated on a live exit-2 block-proof — NOT part of this lane yet)

A `Stop`/`SubagentStop` hook that runs the detector ITSELF on produced files and blocks handback on any
P0 via **exit 2 / `decision:"block"`** (NEVER exit 1), plus anti-fabrication that cross-checks the
validator actually ran (the `bash-commands.log` pattern). The proven gate pattern is at
`.orca/orchestration/temp/phase0-proof/design-handback-gate.test.sh`. This hook is the hard *floor under*
the lane; the lane's spine does not depend on it.
