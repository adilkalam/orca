---
name: ios-impeccable
description: "iOS/SwiftUI design lane orchestrator — the SwiftUI sibling of /impeccable. Runs an ADDITIVE design overlay alongside the /ios correctness gates: classifies a SwiftUI design request, plans it with the ios-design-architect, then runs each verb-task through the SHARED design lane (bind -> ios-design-builder -> ios-design-validator -> branch, N=2 -> escalate). Verb subset v1: layout, typeset, colorize, bolder, quieter, delight, harden, polish, distill, adapt, clarify, animate (excludes overdrive/threejs — no clean SwiftUI analogue). This command DELEGATES; it never writes SwiftUI artifacts itself."
argument-hint: "<freeform SwiftUI request> | --<verb> <View.swift>"
license: Apache 2.0. Based on Anthropic's frontend-design skill + Paul Bakaus's Impeccable, adapted for iOS/SwiftUI. See NOTICE.md for attribution.
allowed-tools:
  - Agent
  - Task
  - Skill
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

**Before anything else, read this.** `/ios-impeccable` is the iOS/SwiftUI design lane orchestrator. It
exists to run the **shared design lane** (`~/.claude/docs/reference/design-lane.md`) for `.swift` targets
by DELEGATING to the three `ios-design` agents. It does the **bind** (a cognition checkpoint), **spawns**
the architect / builder / validator via `Agent()`, **branches** on the verdict, and **writes phase_state**.
It does **not** write SwiftUI artifacts itself.

**NEVER acceptable:**
- "This is small, I'll just edit the View myself."
- Using `Edit`/`Write` to change a SwiftUI view, component, or token file.
- Spawning a builder/validator and then also hand-grading its work yourself.

**ALWAYS required:**
1. Load the iOS hub register.
2. BIND typed FORBIDDEN/FORWARD constraints via a cognition `checkpoint`.
3. BUILD via `Agent(ios-design-builder)`; VALIDATE via `Agent(ios-design-validator)` (fresh context).
4. BRANCH: PASS → write the lane gate + hand back; BLOCK → loop the builder (MAX N=2) → escalate.

**If you are about to `Edit`/`Write` a SwiftUI artifact, STOP. Delegate to `ios-design-builder`.**

The build work itself can run in-thread under the bound constraints ONLY as a documented fallback when a
new `Agent()` is not yet spawnable in this session (pre-reload). Even then, the Swift detector floor runs
at handback so the path is never zero-constraint. Announce the fallback when you take it.

---

# /ios-impeccable — iOS/SwiftUI Design Lane Orchestrator

This command is the SwiftUI sibling of `/impeccable`. The durable iOS design knowledge lives in ONE place
— the `ios-impeccable-hub` skill + the `docs/concepts/ios-design-contract/` collection it points to. The
bind → build → validate → branch sequence lives in ONE place — `~/.claude/docs/reference/design-lane.md`
(REUSED, not duplicated; this command does NOT re-implement the lane logic). This command loads the iOS
hub, parses the verb, and **runs that lane** against `.swift` targets. It carries **zero** copies of
rants / voice-anchors / preferences (`#POISON_PATH` re-inlining).

## Additive composition (the whole point)

`/ios-impeccable` is an **OVERLAY**, not a replacement. It composes with `/ios`:
- `/ios` keeps owning correctness / architecture / build / visual (`ios-standards-enforcer`,
  `ios-ui-reviewer`, `ios-verification`) — UNCHANGED.
- `/ios-impeccable` owns aesthetic / felt-state / design-DNA (the blue-only palette law + the SwiftUI
  refusals). Its `ios-design-validator` fills the `design-dna-guardian` role for iOS.

Run them together: `/ios` for the build, `/ios-impeccable` for the design overlay. Neither blocks the
other.

## 0. Load the iOS hub (every invocation)

`Skill("ios-impeccable-hub")` — the iOS register: the felt-state spine pointer (`interfaces-that-feel`),
the voice anchors, the blue-only palette law, the SwiftUI rants (refusals), the preferences (positive
moves), and the Swift detector contract. Read the task-relevant refs under
`~/.claude/docs/concepts/ios-design-contract/` when you reach for a move. Loading the hub is what ends the
repetition tax — the rules are present by construction.

## 1. Parse the argument

| Argument | Route |
|---|---|
| `--layout`, `--typeset`, `--colorize`, `--bolder`, `--quieter`, `--delight`, `--harden`, `--polish`, `--distill`, `--adapt`, `--clarify`, `--animate` | **Single-verb lane** (§3) — skip the architect; run the lane once for that verb on the named `.swift` target. |
| no flag (freeform) | **Default mode** (§2) — classify, then architect-plan + per-task lane. |

**Excluded from v1** (`#PATH_DECISION`, per the requirements spec): `--overdrive` and `--threejs`. There is
no clean SwiftUI analogue (Metal/SceneKit is out of scope for this lane). If the user asks for one, say so
and offer the nearest v1 verb (`delight`/`animate` for motion energy).

---

## 2. Default mode (freeform) — classify → plan → run

`/ios-impeccable <whatever you want done to a SwiftUI surface>`. State the classification in one line, then
proceed (don't stop to ask unless genuinely ambiguous).

1. **Context.** Read `{project}/.claude/CLAUDE.md §6` (the blue-only palette law + typography + tokens +
   motion/dark-mode) and the token files under `{project}/PeptideFox/DesignSystem/Tokens/` if present. If
   absent, do NOT block — run on the iOS hub register and note it once.
2. **Plan.** Spawn the architect to decompose the request into ordered verb-tasks:
   ```
   Agent({ subagent_type: "ios-design-architect", description: "Plan SwiftUI design verb-tasks",
     prompt: "=== CONTEXT BUNDLE (INHERITED) ===\nDO_NOT_QUERY: true\n<iOS hub register content>\nCLAUDE.md §6 + token paths: <…>\n===\nREQUEST: $ARGUMENTS\nDecompose into ordered verb-tasks (v1 subset only) with forbidden_seeds + forward_seeds + override_seeds per task. Class-scope the sweep (resolve every call site of the pattern, not just the View pointed at; enumerate touched vs left in NOTES). Emit override_seeds ONLY from an explicit owner instruction (provenance = his literal words). Return the TASKS/ORDER block." })
   ```
   Read its `TASKS` + `ORDER` (and any `override_seeds` per task — the owner-sanctioned suppressions you
   thread through the lane in §3).
3. **Run the lane per task, in order** (§3 for each verb-task, using the architect's `forbidden_seeds` /
   `forward_seeds` as the bind inputs and its `target` as the build target).
4. **Close** with the rant-capture handback (§5).

---

## 3. The single-verb lane (the executable sequence — REUSES design-lane.md)

This is the shared lane from `~/.claude/docs/reference/design-lane.md`, performed for a `.swift` target.
Run it for one verb on one View. **Do every step; do not skip the bind, the validator, or the phase_state
write.**

**Inputs:** `VERB` (the flag/architect task), `TARGET` (`.swift` file paths), `FORBIDDEN_SEEDS` +
`FORWARD_SEEDS` (from the architect, or derived here for a direct single-verb call from the verb's rant
focus + the iOS hub), `OVERRIDE_SEEDS` (the architect's `override_seeds`, or — for a direct single-verb
call — any standing rule the user's live instruction explicitly contradicts; default empty), `USER_SHAPE`
(the user's verbatim critique, if any).

> **Precedence — owner > register > detector** (`~/.claude/docs/reference/design-lane.md` §Precedence).
> The owner's explicit, in-context instruction outranks the standing register AND the Swift detector floor
> — *including a P0, including the blue-only law*. When his live word contradicts a standing rule, you
> bind an `OVERRIDE` (below), the validator subtracts it before the verdict, and you write it back at
> BRANCH so the win persists. An override honored once but not written back re-loses next task ("circles")
> — write-back is what kills it.

**Step 1 — BIND (you, the orchestrator).** Emit a real cognition checkpoint that binds the typed
constraints; record the returned ids.
```
mcp__cognition-mcp__cognition({
  operation: "checkpoint", projectPath: <repo root>, verbose: false,
  sessionTitle: "ios design lane: <verb> on <target>", sessionTags: ["ios-design-lane","<verb>"],
  content: {
    command: "/ios-impeccable --<verb>", phase: "bind",
    addConstraints: [
      { type: "FORBIDDEN", text: "<slop> (detector:<swiftRuleId> | rant:<id>)" },   // one per FORBIDDEN_SEED
      { type: "FORWARD",   text: "<felt-state obligation>" },                         // one per FORWARD_SEED
      { type: "OVERRIDE",  text: "<what the owner sanctioned>", suppresses: "<swiftRuleId>",
        scope: "<path/element glob>", value: "<sanctioned value, e.g. soft-red Clear>",
        provenance: "<the owner's exact words>" }                                    // one per OVERRIDE_SEED — ONLY from an explicit owner instruction; never invent one
    ]
  }
})
```
Draw Swift rule ids from `docs/concepts/ios-design-contract/detector-rules.swift.json`: P0 (block)
`off-palette-hue`, `raw-hex-outside-tokens`, `hue-coded-category`, `tailwind-palette-hex`, `gradient-fill`,
`display-font-below-floor`; **owner-instructed P0 (block) for this project** `system-font-reflex`,
`ios-default-reflex`; P1 (advisory) `magic-number-spacing`, `shadow-reflex`, `spring-overshoot`,
`mono-fatigue`. Emit an `OVERRIDE` **only** from an explicit owner instruction (provenance = his literal
words) — never invent one, never use it to launder a model preference. If the owner calls the *standing
brief itself* over-restrictive (e.g. "this is too strict, use color, soft red for Clear"), bind the
`OVERRIDE` at the widest scope he named. Capture `protocolState.activeConstraints` (ids `C1`, `C2`, …).
Write them to phase_state and serialize the typed constraints as `BOUND_CONSTRAINTS` for the validator (id
+ type + statement + detector_rule), and collect the `OVERRIDE` constraints as `ACTIVE_OVERRIDES` (each
`{suppresses, scope, value, provenance}`) for the builder + validator + the BRANCH write-back:
```bash
mkdir -p {project}/.orca/orchestration
# write/merge planning.bound_constraint_ids + a bound-constraints JSON into
# {project}/.orca/orchestration/phase_state.json
```
**Skipped bind → no ids → the validator returns BLOCK (NO-BOUND-CONSTRAINTS). Never skip it.**

**Step 2 — BUILD.** Spawn the builder (single-level). Inject the iOS hub (the reload-safe default):
```
Agent({ subagent_type: "ios-design-builder", description: "Build <verb> on <target>",
  prompt: "=== iOS DESIGN HUB (INJECTED) ===\n<iOS hub register content>\n===\nTASK: <verb intent> on <TARGET>\nBOUND_CONSTRAINTS: <the typed JSON>\nACTIVE_OVERRIDES: <the ACTIVE_OVERRIDES JSON, may be empty — owner-sanctioned suppressions; within an override's scope the suppressed rule does NOT apply, honor the owner's sanctioned value>\nUSER_SHAPE: <verbatim critique, if any>\nVERB_SKILL: <Skill name from architect verb→skill map>\nBuild/improve the .swift file(s) in place under the bound ids. Reject web reflexes (OKLCH/gap/CSS/px) — the token layer IS the design document on iOS. Self-check with swiftdesigncheck (NOT designcheck.js). Report ARTIFACT_PATHS + CONSTRAINTS_ADDRESSED + SELF_CHECK." })
```
Read `ARTIFACT_PATHS`.

**Step 3 — VALIDATE.** Spawn the validator (single-level, FRESH context — give it ONLY the artifact paths
+ bound constraints + hub; NEVER the builder's reasoning). Tell it to point the Swift detector at the
project override registry so file-based suppression works regardless of the validator's cwd:
```
Agent({ subagent_type: "ios-design-validator", description: "Validate <verb> output",
  prompt: "=== iOS DESIGN HUB (INJECTED) ===\n<iOS hub register content>\n===\nARTIFACT_PATH: <ARTIFACT_PATHS>\nBOUND_CONSTRAINTS: <the typed JSON>\nACTIVE_OVERRIDES: <the ACTIVE_OVERRIDES JSON, may be empty — subtract owner-sanctioned findings (rule==suppresses within scope) BEFORE the verdict; a P0 the owner sanctioned does NOT force BLOCK>\nBefore running the detector, export SWIFT_DESIGN_OVERRIDES={project}/.design-overrides.json so swiftdesigncheck self-suppresses owner overrides from the registry file regardless of your cwd.\nRun swiftdesigncheck, judge bound ids, emit the GATE_VERDICT block." })
```
Parse `GATE_VERDICT`.

**Step 4 — BRANCH.**
- **BLOCK** → re-spawn `ios-design-builder` with `PRIOR_FINDINGS` = the validator's
  `UNSATISFIED_CONSTRAINTS` + `FINDINGS`, then re-validate. **MAX N=2 retries.** After the 2nd failed
  retry, **ESCALATE to the user** with the unresolved findings named. Track the counter in phase_state.
  Never silently ship; never loop unbounded.
- **PASS** → **write back the overrides, then write the lane gate.**

  First, **write back each `OVERRIDE` so the win persists** (durability — this is what kills the circles).
  As soon as an `OVERRIDE` is bound, append it to `{project}/.design-overrides.json` so the suppressed rule
  stops firing for its scope on all future runs, and surface a one-line owner-ratified amendment to the
  project law. The override is owner-authored — ratified by construction. Write it BEFORE the phase_state
  PASS write so the branch-time hook honors it. **One canonical entry shape everywhere**
  (`docs/concepts/design-overrides-schema.md`): `{suppresses, scope, value, provenance, created}`. **Dedup
  on `suppresses` + `scope`** (skip the append when a matching entry already exists) and write
  **atomically** (jq to a tmp file, then `mv` into place — never a partial in-place edit). The Swift
  detector self-suppresses from this file via `SWIFT_DESIGN_OVERRIDES`:
  ```bash
  # .design-overrides.json is a FLAT JSON array at {project}/.design-overrides.json.
  f="{project}/.design-overrides.json"
  [ -f "$f" ] || printf '[]' > "$f"
  # For each ACTIVE_OVERRIDES item, dedup on (suppresses + scope) then atomic-write:
  tmp="$(mktemp)"
  jq --arg suppresses "<swiftRuleId>" --arg scope "<glob>" --arg value "<sanctioned value>" \
     --arg provenance "<owner's exact words>" --arg created "$(date -u +%Y-%m-%dT%H:%M:%SZ)" '
     if any(.[]; .suppresses == $suppresses and .scope == $scope) then .
     else . + [{suppresses: $suppresses, scope: $scope, value: $value,
                provenance: $provenance, created: $created}] end
  ' "$f" > "$tmp" && mv "$tmp" "$f"
  ```
  A non-empty `scope` is REQUIRED — an empty scope suppresses NOTHING (the narrowing invariant). Never
  write an override with an empty/missing scope.

  Then write the iOS design-lane gate to `{project}/.orca/orchestration/phase_state.json`. The branch-time
  hook floor is now **armed for iOS** (`hooks/gate-enforcement.sh`, FR-3.2): on this write the hook runs
  `swiftdesigncheck` ITSELF on `artifact_paths` and exit-2 blocks on any P0 the validator missed —
  **including `active_overrides` so it does NOT exit-2 on a covered `ruleId` + path** (matched by
  `suppresses` + a non-empty `scope` glob). Include `attempts` so the hook's N=2 retry cap (FR-3.7) is
  enforced:
  ```json
  { "gates": { "ios_design_lane": {
      "gate_decision": "PASS",
      "artifact_paths": ["<ARTIFACT_PATHS>"],
      "validator_score": "<SCORE>",
      "bound_constraint_ids": ["<C1>", "<C2>", "..."],
      "attempts": "<retry count, 0-2>",
      "active_overrides": [{"suppresses": "<swiftRuleId>", "scope": "<glob>", "provenance": "<words>"}, ...] } } }
  ```
  **When `swiftdesigncheck` is absent** on the host, the hook does NOT silent-pass and does NOT hard-block:
  it emits a loud `WARN: swiftdesigncheck not found; iOS design floor skipped` and drops a sidecar marker
  `.orca/orchestration/temp/ios-floor-status = skipped-no-detector`. Mirror that on the phase_state side —
  write `gates.ios_design_lane.floor: "skipped-no-detector"` into this same gate write so the skip is
  recorded in phase_state, not just the sidecar:
  ```json
  { "gates": { "ios_design_lane": { "gate_decision": "PASS", "floor": "skipped-no-detector", "...": "..." } } }
  ```
  Only once the phase_state PASS write succeeds is the artifact handed back (§5).

---

## 4. Visual verification (iOS — MANDATORY after a PASS that changed a View)

A SwiftUI artifact is not done until it is seen. After the lane PASSes on a View change, follow the
project's MANDATORY visual verification loop (CLAUDE.md): build via `mcp__XcodeBuildMCP__buildProject`,
run in the simulator, navigate to the changed screen, capture a screenshot, compare to the request, check
for regressions. Build passing ≠ visually correct.

---

## 5. Closing handback (rant-capture)

After the lane clears (PASS handed back), ask verbatim:

> "Returned to bench. Anything here you'd rant about?"

If the user responds, append to `{project}/.orca/design-rants-pending.md` (create `.orca/` if absent;
never write to `~/.claude/` or ORCA-OS source):
```
## YYYY-MM-DD HH:MM — ios-impeccable
[user's response verbatim]
```

---

## The honest ceiling

The lane raises the floor — rules present (the iOS hub), adjudication external (fresh
`ios-design-validator` + the Swift detector), no named slop, no forged gate, no silent no-op. It does
**not** manufacture taste: the validator's judgment + **the user's eye** (and on color, the owner's
colorblind eye on a bright screen) is the taste ceiling. And it does NOT replace `/ios` — it overlays it.

The detector defaults are PeptideFox-tuned (the blue-only palette law); to run against another brand,
override `SWIFT_DESIGN_RULES`, `SWIFT_DESIGN_CONFIG`, and `SWIFT_DESIGN_DETECTOR_BIN`.
