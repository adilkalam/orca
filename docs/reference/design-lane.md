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

> **Status (2026-06-07):** the lane is wired. `/impeccable` is a real orchestrator that performs this
> sequence (bind → build → validate → branch + hook-arming write); the standalone verb commands
> (`/layout`, `/typeset`, …) run the single-verb lane directly; `design-architect`, `design-builder`,
> `design-validator` are authored. Spawning a NEWLY-authored agent requires a Claude Code session reload —
> until reloaded, the build step may run **in-thread under the bound constraints** as a documented
> fallback, with the detector floor still run at handback so the path is never zero-constraint. The
> live-proof acceptance tests (spec §Acceptance) are run post-reload before claiming the lane verified.

---

## Precedence — the owner outranks the register outranks the detector

The lane exists to spare the owner from **re-stating** standing taste — not to **overrule** the owner.
So the binding order is fixed, highest first:

1. **The owner's explicit, in-context instruction.** Ground truth. It is the person, now, looking at the
   actual screen. It outranks everything below — *including a detector P0.* The standing register is
   *derived from* the owner; a derived snapshot can never outrank its source. When the owner writes a
   thing in a prompt, it does not have *less* merit than a crystallized rant — it has the **most** merit.
2. **The standing register (rants / preferences).** Defaults for when the owner has **not** spoken to the
   point. A floor that saves repetition — never a ceiling that overrules a live word.
3. **The deterministic detector.** A mechanical named-slop floor that *serves* the owner's taste. It sits
   **below** the owner, not above.

When the owner's live instruction contradicts a standing rant or detector rule, the instruction **wins**,
and the contradiction is resolved by an `OVERRIDE` constraint (Step 1) that is **written back** (Step 4)
so the win persists. An override honored once but not written back re-loses on the next task — that
recurrence ("circles") is the precise failure this precedence exists to kill.

> The **inverse** failure is just as fatal and just as much in scope: a thing the owner *instructs*
> (custom control over native chrome; the bundled face over default SF) that the severity map files as
> `advisory`/no-rule sails through the gate untouched, forever. Enforcement severity must track **what
> the owner cares about** — set per project in the detector config — not a frozen global map. The two
> failures are one shape inverted: the owner's word is treated as *ignorable* where he instructs and as
> *unamendable* where a rant was distilled from him without his ratification. Both are corrected here.

---

## The sequence

```
/impeccable <request>  OR  /<verb> <target>   (main thread = orchestrator)
   │
   0. PLAN      (freeform / multi-verb / --craft only) Agent(design-architect)
   │            → decomposes the request into ordered verb-tasks, each with forbidden_seeds + forward_seeds
   │            → a single-verb call (/layout, /impeccable --layout) SKIPS this and binds directly
   │
   ── per verb-task, in order: ──────────────────────────────────────────────────────────────────
   │
   1. BIND      cognition checkpoint → typed FORBIDDEN/FORWARD constraints (with detector/rant ids)
   │            → record returned constraint ids to phase_state.planning.bound_constraint_ids
   │
   2. BUILD     Agent(design-builder)  → produces the artifact under the bound ids (hub injected)
   │
   3. VALIDATE  Agent(design-validator) → FRESH context; judges artifact vs bound ids + detector
   │            → returns GATE_VERDICT: PASS|BLOCK  (never sees the builder's reasoning)
   │
   4. BRANCH    PASS  → arm the hook (write gates.design_lane PASS + artifact_paths) → hand back
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
   - **One `OVERRIDE` per standing rule the owner's live instruction explicitly contradicts** — this is
     the channel that makes the owner's word outrank the register/detector (Precedence §1). Shape:
     `{type:"OVERRIDE", text:"<what the owner sanctioned>", suppresses:"<ruleId>", scope:"<path/element
     glob>", value:"<sanctioned value, e.g. soft-red Clear>", provenance:"<the owner's exact words>"}`.
     Emit it **only** from an explicit owner instruction — never invent one, never use it to launder a
     model preference. An `OVERRIDE` (a) tells the validator + hook to stop treating `suppresses` as a
     BLOCK within `scope` (Step 3), and (b) triggers the write-back (Step 4) so it persists. If the owner
     calls the *standing brief itself* over-restrictive (not just one element), bind the `OVERRIDE` at the
     widest scope he named — do not narrow it back to the single screenshot.
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
- The **doctrine awareness** (before writing styling code, read the relevant doctrine): for web/CSS,
  instruct the builder to read `~/.claude/docs/concepts/llm-css-manifesto.md` +
  `design-contract/preferences/css-architecture.md` (semantic/centralized CSS, no scattered raw-palette
  utilities) — the manifesto's captured home in the lane. For a `.swift` target, the doctrine is the
  `ios-impeccable-hub` (see `docs/concepts/ios-design-contract/target-routing.md`).
- On a retry: the combined detector + validator findings from the previous BLOCK.

Cognition in the builder is **OPTIONAL** in the pipeline: enforcement here is the STRUCTURE — the
separate fresh-context validator (Step 3) + the detector hook (Step 4) adjudicate from outside, so the
pipeline can be run cognition-off to test the structure alone. (The MANDATORY cognition R1→R2→R(n) loop
lives on the **individual** verb commands instead — `docs/reference/cognition-constraint-loop.md` — which
run outside this structure and have no separate validator.) The builder reports the file path(s) and its
per-constraint result; it does NOT self-grade the verdict — the separate validator does that.

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

**Owner overrides are subtracted BEFORE the verdict (Precedence §1).** For each active `OVERRIDE`
constraint, any detector finding whose `ruleId` + path falls under the override's `suppresses` + `scope`
is **removed from `UNSATISFIED_CONSTRAINTS` and downgraded to an `advisory` FINDING** annotated
`owner-sanctioned (provenance: "<words>")`. A P0 the owner explicitly sanctioned does **not** force BLOCK
— the owner outranks the floor. Only un-overridden P0s and unsatisfied non-overridden bound ids force
BLOCK. The validator never overrules an explicit owner instruction; doing so is the self-charity failure
in reverse — the machine grading the human's taste as wrong.

---

## Step 4 — BRANCH (the orchestrator)

Parse `GATE_VERDICT`:

- **PASS** → **arm the deterministic floor, then hand back.** Write the design-lane gate to
  `{project}/.orca/orchestration/phase_state.json` so `hooks/gate-enforcement.sh` runs `designcheck`
  ITSELF on the produced files and exit-2 blocks on any P0 the validator missed (the hard floor *under*
  the validator):
  ```json
  { "gates": { "design_lane": {
      "gate_decision": "PASS",
      "artifact_paths": ["<ARTIFACT_PATHS>"],
      "validator_score": <SCORE>,
      "bound_constraint_ids": ["<C1>", "<C2>", "..."],
      "active_overrides": [{"suppresses": "<ruleId>", "scope": "<glob>", "provenance": "<words>"}] } } }
  ```

  **Write back every `OVERRIDE` so the win persists (durability — this is what kills the circles).** As
  soon as an `OVERRIDE` is bound, append it to the project override registry
  `{project}/.design-overrides.json` — the detector reads this file, and the suppressed rule then **stops
  firing** for `scope` on ALL future runs — and surface a one-line amendment to the project law
  (`CLAUDE.md` / the register) for the owner to fold in. The override is **owner-authored, so unlike a
  rant-derived rule it is ratified by construction.** The branch-time `designcheck` hook reads
  `active_overrides` from `phase_state` and does **not** exit-2 on a covered `ruleId` + path.

  If that write is itself BLOCKED by the hook (named P0 present, not covered by an override), treat it as a BLOCK and loop the builder
  within the N=2 bound. Only once the phase_state PASS write succeeds is the artifact handed back.
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
