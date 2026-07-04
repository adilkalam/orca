---
description: "Full design orchestration lane. Runnable with ANY design-verb flag (--layout --typeset --colorize --bolder --quieter --delight --harden --polish --optimize --adapt --clarify --distill --overdrive --animation --threejs) and the setup flags (--craft --teach --document --extract). DEFAULT MODE IS FLAG-FREE — /impeccable clean up the pricing page classifies the request, plans it with the design-architect, and runs each verb-task through the shared design lane (bind → build → validate → branch). Mirrors the /nextjs orchestrator: this command DELEGATES; it never writes design artifacts itself."
argument-hint: "<freeform request> | --<verb> <target> | --craft <feature> | --teach | --document | --extract [rants|<target>]"
license: Apache 2.0. Based on Anthropic's frontend-design skill + Paul Bakaus's Impeccable. See NOTICE.md for attribution.
allowed-tools:
  - Agent
  - AskUserQuestion
  - mcp__cognition-mcp__cognition
  - mcp__project-context__query_context
  - mcp__project-context__save_decision
  - mcp__project-context__save_task_history
  - Read
  - Bash
  - Grep
  - Glob
---

## STOP — ORCHESTRATOR ONLY

**Before anything else, read this.** `/impeccable` is the design lane orchestrator. It exists to run the
**shared design lane** (`~/.claude/docs/reference/design-lane.md`) by DELEGATING to agents. It does the
**bind** (a cognition checkpoint), **spawns** the architect / builder / validator via `Agent()`,
**branches** on the verdict, and **writes phase_state**. It does **not** write design artifacts itself.

**NEVER acceptable:**
- "This is small, I'll just edit the file myself."
- Using `Edit`/`Write` to change a component, page, or stylesheet.
- Spawning a builder/validator and then also hand-grading its work yourself.

**ALWAYS required:**
1. Load the hub register.
2. BIND typed FORBIDDEN/FORWARD constraints via a cognition `checkpoint`.
3. BUILD via `Agent(design-builder)`; VALIDATE via `Agent(design-validator)` (fresh context).
4. BRANCH: PASS → arm the hook + hand back; BLOCK → loop the builder (MAX N=2) → escalate.

**If you are about to `Edit`/`Write` a design artifact, STOP. Delegate to `design-builder`.**

The build work itself can run in-thread under the bound constraints ONLY as a documented fallback when a
new `Agent()` is not yet spawnable in this session (pre-reload). Even then, the detector floor runs at
handback so the path is never zero-constraint. Announce the fallback when you take it.

---

# /impeccable — Design Lane Orchestrator

The durable design knowledge lives in ONE place — the `impeccable-hub` skill + the
`docs/concepts/design-contract/` collection it points to. The bind → build → validate → branch sequence
lives in ONE place — `~/.claude/docs/reference/design-lane.md`. This command loads the hub, parses the
verb, and **runs that lane**. It carries **zero** copies of rants / voice-anchors / preferences
(`#POISON_PATH` re-inlining).

## 0. Load the hub (every invocation)

`Skill("impeccable-hub")` — the register: the `interfaces-that-feel` felt-state spine, the voice anchors,
the rants (refusals), the preferences (positive moves), the detector contract. Read the task-relevant
refs under `~/.claude/docs/concepts/design-contract/` when you reach for a move. Loading the hub is what
ends the repetition tax — the rules are present by construction.

## 1. Parse the flag

| Argument | Route |
|---|---|
| `--layout`, `--typeset`, `--colorize`, `--bolder`, `--quieter`, `--delight`, `--harden`, `--polish`, `--optimize`, `--adapt`, `--clarify`, `--distill`, `--overdrive`, `--animation`, `--threejs` | **Single-verb lane** (§3) — skip the architect; run the lane once for that verb. |
| no flag (freeform) | **Default mode** (§2) — classify, then architect-plan + per-task lane. |
| `--craft "<feature>"` | **Feature build** (§4) — `/shape` + comp pick, then the lane. |
| `--teach` / `--document` / `--extract` | **Setup/maintenance** (§5). |

The standalone verb commands (`/layout`, `/typeset`, …) are the same single-verb lane reachable directly;
`/impeccable --<verb>` and `/<verb>` are equivalent (same lane, same enforcement).

---

## 2. Default mode (freeform) — classify → plan → run

`/impeccable <whatever you want done>`. State the classification in one line, then proceed (don't stop to
ask unless genuinely ambiguous).

| Request is… | Route |
|---|---|
| improve / fix / clean up / polish an **existing** surface | **improve-existing** → architect plan (multi-verb) → run the lane per task (§3) |
| build / create / add a **new** feature | **build-new** → `--craft` (§4) |
| no `PRODUCT.md` / `DESIGN.md` yet | **setup** → `--teach` then `--document` (§5) |

**improve-existing:**

1. **Context.** Read `{project}/.claude/PRODUCT.md` + `DESIGN.md` if present. If absent, do NOT block —
   run on the global register and note once: *"No project contract — running on the global register; run
   `/impeccable --teach` to make it project-specific."*
2. **Plan.** Spawn the architect to decompose the request into ordered verb-tasks:
   ```
   Agent({ subagent_type: "design-architect", description: "Plan design verb-tasks",
     prompt: "=== CONTEXT BUNDLE (INHERITED) ===\nDO_NOT_QUERY: true\n<hub register content>\nPRODUCT/DESIGN paths: <…>\n===\nREQUEST: $ARGUMENTS\nDecompose into ordered verb-tasks with forbidden_seeds + forward_seeds + override_seeds per task. Class-scope the sweep (resolve every call site of the pattern, not just the file pointed at; enumerate touched vs left in NOTES). Emit override_seeds ONLY from an explicit owner instruction (provenance = his literal words). Return the TASKS/ORDER block." })
   ```
   Read its `TASKS` + `ORDER` (and any `override_seeds` per task — these are the owner-sanctioned
   suppressions you thread through the lane in §3).
3. **Run the lane per task, in order** (§3 for each verb-task, using the architect's `forbidden_seeds` /
   `forward_seeds` as the bind inputs and its `target` as the build target).
4. **Close** with the rant-capture handback (§6).

---

## 3. The single-verb lane (the executable sequence)

This is the shared lane from `~/.claude/docs/reference/design-lane.md`, performed. Run it for one verb on
one target. **Do every step; do not skip the bind, the validator, or the phase_state write.**

**Inputs:** `VERB` (the flag/architect task), `TARGET` (file paths), `FORBIDDEN_SEEDS` + `FORWARD_SEEDS`
(from the architect, or derived here for a direct single-verb call from the verb's rant focus +
`voice-anchors.md`), `OVERRIDE_SEEDS` (the architect's `override_seeds`, or — for a direct single-verb
call — any standing rule the user's live instruction explicitly contradicts; default empty), `USER_SHAPE`
(the user's verbatim critique, if any — FR-6).

> **Precedence — owner > register > detector** (`~/.claude/docs/reference/design-lane.md` §Precedence).
> The owner's explicit, in-context instruction outranks the standing register AND the detector floor —
> *including a P0*. When his live word contradicts a standing rule, you bind an `OVERRIDE` (below), the
> validator subtracts it before the verdict, and you write it back at BRANCH so the win persists. An
> override honored once but not written back re-loses next task ("circles") — write-back is what kills it.

**Step 1 — BIND (you, the orchestrator).** Emit a real cognition checkpoint that binds the typed
constraints; record the returned ids.
```
mcp__cognition-mcp__cognition({
  operation: "checkpoint", projectPath: <repo root>, verbose: false,
  sessionTitle: "design lane: <verb> on <target>", sessionTags: ["design-lane","<verb>"],
  content: {
    command: "/impeccable --<verb>", phase: "bind",
    addConstraints: [
      { type: "FORBIDDEN", text: "<slop> (detector:<ruleId> | rant:<id>)" },   // one per FORBIDDEN_SEED
      { type: "FORWARD",   text: "<felt-state obligation>" },                   // one per FORWARD_SEED
      { type: "OVERRIDE",  text: "<what the owner sanctioned>", suppresses: "<ruleId>",
        scope: "<path/element glob>", value: "<sanctioned value, e.g. soft-red Clear>",
        provenance: "<the owner's exact words>" }                              // one per OVERRIDE_SEED — ONLY from an explicit owner instruction; never invent one
    ]
  }
})
```
Emit an `OVERRIDE` **only** from an explicit owner instruction (provenance = his literal words) — never
invent one, never use it to launder a model preference. If the owner calls the *standing brief itself*
over-restrictive (not just one element), bind the `OVERRIDE` at the widest scope he named.

Capture `protocolState.activeConstraints` (ids `C1`, `C2`, …). Write them to phase_state and serialize the
typed constraints as `BOUND_CONSTRAINTS` for the validator (id + type + statement + detector_rule), and
collect the `OVERRIDE` constraints as `ACTIVE_OVERRIDES` (each `{suppresses, scope, value, provenance}`)
for the builder + validator + the BRANCH write-back:
```bash
mkdir -p .orca/orchestration
# write/merge planning.bound_constraint_ids + a bound-constraints JSON (use jq or a heredoc)
```
**Skipped bind → no ids → the validator returns BLOCK (NO-BOUND-CONSTRAINTS). Never skip it.**

**Step 2 — BUILD.** Spawn the builder (single-level). In the pipeline, enforcement is the STRUCTURE
(separate validator + hook), so cognition in the builder is **optional** — the pipeline can be run
cognition-off to test the structure alone (the mandatory cognition loop lives on the individual verb
commands, not here). Inject the hub AND the CSS manifesto awareness:
```
Agent({ subagent_type: "design-builder", description: "Build <verb> on <target>",
  prompt: "=== DESIGN HUB (INJECTED) ===\n<hub register content>\n===\n=== DESIGN AWARENESS (CSS manifesto) ===\nBefore writing CSS, read ~/.claude/docs/concepts/llm-css-manifesto.md + design-contract/preferences/css-architecture.md. The stylesheet IS the design document: semantic/centralized CSS in named role+token classes; no scattered raw-palette utilities.\n===\nTASK: <verb intent> on <TARGET>\nBOUND_CONSTRAINTS: <the typed JSON>\nACTIVE_OVERRIDES: <the ACTIVE_OVERRIDES JSON, may be empty — owner-sanctioned suppressions; within an override's scope the suppressed rule does NOT apply, honor the owner's sanctioned value>\nUSER_SHAPE: <verbatim critique, if any>\nVERB_SKILL: <Skill name from architect verb→skill map>\nImprove the file(s) in place under the bound ids (internal cognition self-check optional — the pipeline's validator + hook are the enforcement). Report ARTIFACT_PATHS + CONSTRAINTS_ADDRESSED + SELF_CHECK." })
```
Read `ARTIFACT_PATHS`.

**Step 3 — VALIDATE.** Spawn the validator (single-level, FRESH context — give it ONLY the artifact paths
+ bound constraints + hub; NEVER the builder's reasoning). Tell it to point the detector at the project
override registry so file-based suppression works regardless of the validator's cwd:
```
Agent({ subagent_type: "design-validator", description: "Validate <verb> output",
  prompt: "=== DESIGN HUB (INJECTED) ===\n<hub register content>\n===\nARTIFACT_PATH: <ARTIFACT_PATHS>\nBOUND_CONSTRAINTS: <the typed JSON>\nACTIVE_OVERRIDES: <the ACTIVE_OVERRIDES JSON, may be empty — subtract owner-sanctioned findings (rule==suppresses within scope) BEFORE the verdict; a P0 the owner sanctioned does NOT force BLOCK>\nBefore running the detector, export DESIGN_OVERRIDES_PATH={project}/.design-overrides.json so the detector self-suppresses owner overrides from the registry file regardless of your cwd.\nRun the detector, judge bound ids, emit the GATE_VERDICT block." })
```
Parse `GATE_VERDICT`.

**Step 4 — BRANCH.**
- **BLOCK** → re-spawn `design-builder` with `PRIOR_FINDINGS` = the validator's
  `UNSATISFIED_CONSTRAINTS` + `FINDINGS`, then re-validate. **MAX N=2 retries.** After the 2nd failed
  retry, **ESCALATE to the user** with the unresolved findings named. Track the counter in phase_state.
  Never silently ship; never loop unbounded.
- **PASS** → **write back the overrides, then arm the deterministic floor.**

  First, **write back each `OVERRIDE` so the win persists** (durability — this is what kills the circles).
  As soon as an `OVERRIDE` is bound, append it to `{project}/.design-overrides.json` so the suppressed rule
  stops firing for its scope on all future runs, and surface a one-line owner-ratified amendment to the
  project law. The override is owner-authored — ratified by construction. Write it BEFORE the phase_state
  PASS write so the branch-time hook honors it. **One canonical entry shape everywhere**
  (`docs/concepts/design-overrides-schema.md`): `{suppresses, scope, value, provenance, created}`. **Dedup
  on `suppresses` + `scope`** (skip the append when a matching entry already exists) and write
  **atomically** (jq to a tmp file, then `mv` into place — never a partial in-place edit):
  ```bash
  # .design-overrides.json is a FLAT JSON array at {project}/.design-overrides.json.
  f="{project}/.design-overrides.json"
  [ -f "$f" ] || printf '[]' > "$f"
  # For each ACTIVE_OVERRIDES item, dedup on (suppresses + scope) then atomic-write:
  tmp="$(mktemp)"
  jq --arg suppresses "<ruleId>" --arg scope "<glob>" --arg value "<sanctioned value>" \
     --arg provenance "<owner's exact words>" --arg created "$(date -u +%Y-%m-%dT%H:%M:%SZ)" '
     if any(.[]; .suppresses == $suppresses and .scope == $scope) then .
     else . + [{suppresses: $suppresses, scope: $scope, value: $value,
                provenance: $provenance, created: $created}] end
  ' "$f" > "$tmp" && mv "$tmp" "$f"
  ```
  A non-empty `scope` is REQUIRED — an empty scope suppresses NOTHING (the narrowing invariant). Never
  write an override with an empty/missing scope.

  Then **arm the deterministic floor**: write the design-lane gate to phase_state so
  `hooks/gate-enforcement.sh` runs `designcheck` itself on the artifacts and exit-2 blocks on any P0
  (this is the hard floor under the validator) — **including `active_overrides` so the branch-time hook
  does NOT exit-2 on a covered `ruleId` + path**. Include `attempts` (the current builder-retry count,
  0-2) so the hook's N=2 retry cap (FR-3.7) is enforced; set `escalated: true` ONLY after surfacing the
  unresolved findings to the user (the sanctioned exit past the cap) — otherwise the hook exit-2 blocks a
  PASS written with `attempts > 2`:
  ```bash
  # merge into .orca/orchestration/phase_state.json:
  # { "gates": { "design_lane": {
  #     "gate_decision": "PASS",
  #     "artifact_paths": [<ARTIFACT_PATHS>],
  #     "validator_score": <SCORE>,
  #     "bound_constraint_ids": [<C1,C2,...>],
  #     "attempts": <retry count, 0-2>,
  #     "active_overrides": [{"suppresses": "<ruleId>", "scope": "<glob>", "provenance": "<words>"}, ...] } } }
  ```
  If that phase_state write is BLOCKED by the hook (the detector found a named P0 the validator missed,
  NOT covered by an override), treat it as a BLOCK and loop the builder (within the N=2 bound). Only once
  the phase_state PASS write succeeds is the artifact handed back (§6).

---

## 4. --craft (feature build)

`/impeccable --craft "<feature>"`. Net-new needs discovery + a visual target before code:
1. **Preconditions:** `PRODUCT.md` (else `--teach`) + `DESIGN.md` (else `--document`).
2. **/shape** discovery interview (3 rounds) — per-feature commitments. Do not skip.
3. **Visual direction comp:** generate 1–3 reference comps; the user picks one; its ingredients become the
   visual contract for the build.
4. **Run the lane** (§3) with the feature as the build target and the comp ingredients + shape commitments
   fed into the builder prompt. Validate → branch (N=2 → escalate).
Full flow: `~/.claude/docs/concepts/impeccable-reference/craft.md`.

---

## 5. Setup / maintenance flags

- **`--teach`** → write `{project}/.claude/PRODUCT.md` (strategic context) via the structured discovery
  interview, then hand off to `--document`. Full flow: `impeccable-reference` + `product-template.md`.
- **`--document`** → handled by `/document` (generates `.claude/DESIGN.md`, the Stitch-spec visual
  contract). Reachable as `/impeccable --document` or `/document`.
- **`--extract`** → pull reusable tokens/components into the design system
  (`impeccable-reference/extract.md`). **`--extract rants`** → sweep
  `{project}/.orca/design-rants-pending.md` into the global rant catalog
  (`impeccable-reference/extract-rants.md`); rsync `docs/` after.

---

## 6. Closing handback (rant-capture)

After the lane clears (PASS handed back) OR a flag flow completes, ask verbatim:

> "Returned to bench. Anything here you'd rant about?"

If the user responds, append to `{project}/.orca/design-rants-pending.md` (create `.orca/` if absent;
never write to `~/.claude/` or ORCA-OS source):
```
## YYYY-MM-DD HH:MM — impeccable
[user's response verbatim]
```
Swept later via `/impeccable --extract rants`.

**Escalation:** if the user critiques the output, route to `/recraft "<critique>"` (classifies scope and
re-runs the right slice of the lane); it does NOT regenerate code from rules.

---

## The honest ceiling

The lane raises the floor — rules present (hub), adjudication external (fresh validator + detector hook),
no named slop, no forged gate, no silent no-op. It does **not** manufacture taste: the validator's
judgment + **the user's eye** is the taste ceiling.
