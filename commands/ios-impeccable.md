---
name: ios-impeccable
description: "iOS/SwiftUI design lane — three tiers, biased toward fast; the SwiftUI sibling of /impeccable and an ADDITIVE overlay beside the /ios correctness gates. T0 --tweak: in-thread edit + inline swiftdesigncheck report, zero agent spawns. T1 --<verb> (THE DEFAULT for a well-defined single-verb request): build in-thread under bound constraints, then ONE fresh-context judge (ios-design-validator). T2 --full / freeform multi-verb: ios-design-architect plan, then ios-design-builder -> ios-design-validator per task. Verb subset v1 (12): layout, typeset, colorize, bolder, quieter, delight, harden, polish, distill, adapt, clarify, animate. Canon: ~/.claude/docs/reference/design-lane.md."
argument-hint: "<freeform SwiftUI request> | --tweak <small edit> | --<verb> <View.swift> | --full <request>"
license: Apache 2.0. Based on Anthropic's frontend-design skill + Paul Bakaus's Impeccable, adapted for iOS/SwiftUI. See NOTICE.md for attribution.
allowed-tools:
  - Agent
  - AskUserQuestion
  - Read
  - Write
  - Edit
  - MultiEdit
  - Grep
  - Glob
  - Bash
  - Skill
  - mcp__cognition-mcp__cognition
  - mcp__project-context__query_context
  - mcp__project-context__save_decision
  - mcp__project-context__save_task_history
---

# /ios-impeccable — iOS/SwiftUI Design Lane (three tiers)

The canon is `~/.claude/docs/reference/design-lane.md` — the tier model, the precedence order
(owner > aesthetic > detector), the aesthetic-capture protocol, and the shared T1/T2 mechanics are
defined THERE, once. This command routes a `.swift` design request to a tier and executes it with
the iOS deltas below. It restates nothing from the canon except the T0 banned-core (§2 —
deliberately inlined so T0 never depends on a skill load).

**Additive composition:** `/ios-impeccable` is an OVERLAY, not a replacement. `/ios` keeps owning
correctness / architecture / build / visual; this lane owns aesthetic / felt-state / design-DNA
(`ios-design-validator` fills the design-dna-guardian role for iOS). Neither blocks the other.

## 1. Routing

Explicit flags are deterministic:

| Argument | Tier |
|---|---|
| `--tweak` | **T0** (§2) |
| `--layout` `--typeset` `--colorize` `--bolder` `--quieter` `--delight` `--harden` `--polish` `--distill` `--adapt` `--clarify` `--animate` | **T1** (§3) for that verb |
| `--full` | **T2** (§4) |

Freeform (no flag): classify in one line, then go — a well-defined **single-verb** intent -> **T1**;
**multi-verb / thin brief / whole-screen** -> **T2**.

**BIAS-TO-FAST** (canon §Routing): when in doubt, route DOWN a tier. Wrong-fast is caught instantly
by the owner's live eye on the simulator; wrong-slow burns 20 minutes of machinery on a one-line
change.

**Excluded from the iOS subset:** `--overdrive` and `--threejs` (no clean SwiftUI analogue —
Metal/SceneKit is out of scope), and `--optimize` (also excluded — it was silently dropped from the
iOS verb list before; that exclusion is now explicit). If the owner asks for one, say so and offer
the nearest verb (`delight`/`animate` for motion energy, `harden`/`polish` for optimize-type asks).

The standalone verb *skills* (`/layout`, `/typeset`, ...) are in-thread craft references WITHOUT the
judge or the detector floor — NOT an enforced path. Enforcement (fresh judge + gate + hook floor)
exists only here: `/ios-impeccable --<verb>` (T1) or T2.

## 2. T0 — `--tweak` (in-thread, ZERO agent spawns)

Nudge a spacing token, swap one color token, fix one alignment seam in a View. **NO agent spawns, NO
phase_state writes, NO gates, NO capture question.** The owner is on the live simulator; he is the
verifier.

1. The banned-core below is the floor — present because this command text carries it; do NOT rely on
   `Skill()` loading. Loading `~/.claude/skills/ios-impeccable-hub/SKILL.md` is encouraged when
   depth is needed, but never assumed.
2. Make the edit(s) directly with `Edit`/`Write`.
3. Run the Swift detector inline as a REPORT — **once per changed file** (v1 is single-file; plural
   paths in one invocation = EXIT 1 DETECTOR-ERROR):
   ```bash
   for f in <changed .swift files>; do
     "${SWIFT_DESIGN_DETECTOR_BIN:-/Users/adilkalam/ORCA-OS/mcp/swift-design-detector/bin/swiftdesigncheck}" detect --json "$f"
   done
   ```
   Report findings to the owner one line each, blocking findings named first. **NEVER block, NEVER
   loop** — the owner decides.

### T0 banned-core (inlined — the only lane content this file deliberately carries)

P0 — the named-slop floor (blocking at the gated tiers; at T0, name them loudly):

- `off-palette-hue` — a chromatic hex whose hue leaves the blue band (205-245deg). Color-principle note (2026-07-02): duty-scoped supporting color is owner-sanctioned; treat pure band findings as advisory until the band logic is re-tuned — AI-purple/lavender/neon stay refused.
- `raw-hex-outside-tokens` — a raw `Color(hex:)`/`UIColor` literal in a view/feature file — color authority lives in the token layer; views consume tokens.
- `hue-coded-category` — a category encoded by giving each case its own hue — hue never carries meaning alone (the colorblind kernel); same color-principle caveat for ratified duty-scoped families.
- `tailwind-palette-hex` — a Tailwind-palette hex pasted into Swift — the canonical AI-slop fingerprint, not a brand color.
- `gradient-fill` — `LinearGradient`/`RadialGradient`/`AngularGradient` as a surface or text fill — use a solid token.
- `display-font-below-floor` — the display face (`heroInline`/Brown LL Inline) instantiated below the 24pt floor — Inline collapses below 28pt.
- `ios-default-reflex` (owner-instructed P0) — shipping the platform default where the brand demands custom: native `Menu`/`Picker`, default `.contextMenu` chrome, `.tint(.blue)` — use the custom compact control + the brand accent token.
- `system-font-reflex` (owner-instructed P0, per-project pinned — P1 in the rule file) — `Font.system(...)` / bare system text styles instead of the bundled brand face (`Font.primary`).
- `unjoined-unit-baseline` (owner-instructed P0) — a value entry (`TextField`) + unit label (`Text`) on a default-aligned `HStack`: center anchoring floats the unit off the figure's baseline; join on `.firstTextBaseline` with the placeholder in the entry's own font — never per-mount offset fudges.

Advisory tier (report, never block): `magic-number-spacing`, `shadow-reflex`, `spring-overshoot`,
`mono-fatigue`. Full corpus:
`~/.claude/docs/concepts/ios-design-contract/detector-rules.swift.json` + `banned/`.

## 3. T1 — direct (THE DEFAULT)

The main agent builds in-thread; ONE fresh-context judge adjudicates. The owner's brief stays
verbatim in the working context by construction — no delegation telephone, no re-encoding.

1. **Load.** `Skill` the iOS hub (`~/.claude/skills/ios-impeccable-hub/SKILL.md`) + the verb skill
   for the classified verb with `platform: swiftui` — read ONLY the skill's `## SwiftUI target`
   section, never the web craft body.
2. **BIND** (canon §The bind). A real cognition checkpoint; record the returned ids:
   ```
   mcp__cognition-mcp__cognition({ operation: "checkpoint", projectPath: <repo root>, verbose: false,
     sessionTitle: "ios design lane: <verb> on <target>", sessionTags: ["ios-design-lane","<verb>"],
     content: { command: "/ios-impeccable --<verb>", phase: "bind",
       addConstraints: [
         { type: "FORBIDDEN", text: "<slop> (detector:<swiftRuleId> | banned:<id>)" },  // from the banned-core above
         { type: "FORWARD",   text: "<felt-state / composition obligation>" },          // iOS hub delta: one-handed reach, Dynamic Type, the colorblind kernel
         { type: "FORWARD",   text: "OWNER-OVERRIDE|suppresses=<swiftRuleId>|scope=<glob>|value=<sanctioned value>|provenance=<owner verbatim words> (<YYYY-MM-DD>)" }  // ONLY from an explicit owner instruction; never invent one
       ] } })
   ```
   **OWNER-OVERRIDE parse spec:** an override is a constraint whose text starts `OWNER-OVERRIDE|`.
   Split on `|`: the `key=value` fields are `suppresses`, `scope`, `value`; `provenance=` is LAST
   and consumes the remainder of the string, including any further pipes.

   **Override write-back is IMMEDIATE at bind** (not deferred to PASS): append each OWNER-OVERRIDE
   to `{project}/.design-overrides.json` — canonical entry shape `{suppresses, scope, value,
   provenance, created}`, jq dedup on `suppresses` + `scope`, atomic tmp-then-`mv` write, per
   `~/.claude/docs/concepts/design-overrides-schema.md`. A non-empty `scope` is REQUIRED.
3. **BUILD** in-thread (`Edit`/`Write`/`MultiEdit`), under the bound ids. Reject web reflexes
   (OKLCH / `gap` / CSS units / Tailwind utilities) — the token layer IS the design document on iOS.
4. **JUDGE** — exactly ONE spawn; NO builder spawn:
   ```
   Agent({ subagent_type: "ios-design-validator", description: "Judge <verb> on <target>",
     prompt: "ARTIFACT_PATHS: <paths>\nBOUND_CONSTRAINTS: <ids + full constraint texts>\nACTIVE_OVERRIDES: <the OWNER-OVERRIDE constraints, may be empty>\nBefore running the detector, export SWIFT_DESIGN_OVERRIDES={project}/.design-overrides.json so swiftdesigncheck self-suppresses owner overrides regardless of your cwd.\nRun swiftdesigncheck ONCE PER artifact file (plural paths in one invocation = EXIT 1 DETECTOR-ERROR), aggregate findings, judge the bound ids, emit the GATE_VERDICT block." })
   ```
5. **BRANCH.**
   - **PASS** -> write the canonical gate `gates.ios_design_lane` into
     `{project}/.orca/orchestration/phase_state.json` — **using the Write tool with the full merged
     JSON content, NEVER via Bash** (the hook floor inspects Write content; this is load-bearing):
     ```json
     { "gates": { "ios_design_lane": {
         "gate_decision": "PASS", "artifact_paths": ["<paths>"], "validator_score": <SCORE>,
         "bound_constraint_ids": ["C1", "..."], "attempts": <n>,
         "active_overrides": [{"suppresses": "<swiftRuleId>", "scope": "<glob>", "provenance": "<words>"}] } } }
     ```
     The hook re-runs `swiftdesigncheck` on `artifact_paths` and exit-2 blocks any un-overridden P0;
     treat a blocked write as a BLOCK below. When the detector binary is absent on the host the hook
     WARNs loudly instead of silent-passing — mirror it by writing
     `"floor": "skipped-no-detector"` into this same gate object.
   - **BLOCK** -> fix in-thread from the named findings, re-judge. **MAX N=2 judge rounds total**,
     then **ESCALATE**: show the diff, offer revert (`git checkout -- <paths>` if the pre-state was
     clean, else the stash-snapshot flow from §4), and set `escalated: true` in the gate when the
     owner accepts a partial result.

## 4. T2 — full (freeform multi-verb / thin brief / `--full`)

1. **Plan.** Spawn the architect (T2 is the only tier that uses it):
   ```
   Agent({ subagent_type: "ios-design-architect", description: "Plan SwiftUI design verb-tasks",
     prompt: "=== CONTEXT BUNDLE (INHERITED) ===\nDO_NOT_QUERY: true\n<iOS hub aesthetic content>\nProject design law + token paths: <...>\n===\nREQUEST (owner verbatim): <the owner's raw message text>\nDecompose into ordered verb-tasks (iOS subset only) with forbidden_seeds + forward_seeds + override_seeds (OWNER-OVERRIDE| pipe format, ONLY from an explicit owner instruction). Class-scope the sweep (every call site of the pattern, not just the View pointed at; enumerate touched vs left in NOTES). Return the TASKS/ORDER block." })
   ```
2. **Per task, in ORDER:**
   1. **BIND** exactly as §3 step 2, seeded from the architect's task (overrides write back
      IMMEDIATELY when bound, not only on PASS).
   2. **Snapshot.** `STASH_SHA=$(git stash create)` — record it in the task log under
      `.orca/orchestration/temp/`. This is the revert handle for escalation.
   3. **BUILD.** The builder prompt MUST contain the owner's ORIGINAL REQUEST VERBATIM — copy the
      raw message text; summaries and re-encodings are ABOLISHED:
      ```
      Agent({ subagent_type: "ios-design-builder", description: "Build <verb> on <target>",
        prompt: "OWNER_REQUEST_VERBATIM: <the owner's raw message text, unedited>\nTASK: <verb intent> on <target>\nBOUND_CONSTRAINTS: <ids + full constraint texts>\nACTIVE_OVERRIDES: <OWNER-OVERRIDE constraints, may be empty — within an override's scope the suppressed rule does NOT apply>\nHUB: read ~/.claude/skills/ios-impeccable-hub/SKILL.md if not injected above\nVERB_SKILL: <skill from the architect's verb->skill map> (platform: swiftui — read ONLY the skill's SwiftUI target section)\nBuild the .swift file(s) in place under the bound ids. Reject web reflexes — the token layer IS the design document. Self-check with swiftdesigncheck, once per file. Report ARTIFACT_PATHS + CONSTRAINTS_ADDRESSED + SELF_CHECK." })
      ```
   4. **JUDGE.** `Agent(ios-design-validator)` fresh-context, exactly as §3 step 4 (once-per-file
      detector runs, aggregated).
   5. **BRANCH.**
      - **PASS** -> confirm the override write-back happened at bind (same jq dedup mechanics), then
        write `gates.ios_design_lane` via the Write tool (§3 step 5 — same shape, same NEVER-Bash
        rule).
      - **BLOCK** -> re-spawn the builder with `PRIOR_FINDINGS` (the judge's
        `UNSATISFIED_CONSTRAINTS` + `FINDINGS`) + the verbatim owner request AGAIN. **MAX N=2**,
        then **ESCALATE**: show the diff + the revert instruction
        `git checkout $STASH_SHA -- <paths>`, and **HALT the remaining ORDER tasks** pending the
        owner. `escalated: true` in the gate is the sanctioned exit — the hook requires it for any
        gate whose `attempts` exceeded 2; set it only after surfacing the unresolved findings, the
        diff, and the revert instructions to the owner.

## 5. Verification (who looks at the screen)

- **T0/T1:** the owner verifies on the live simulator by design — that is the tier contract; there
  is no agent verification step.
- **T2:** after the final task PASSes, offer an OPTIONAL final verification via the `/ios` lane's
  `ios-verification` agent if the owner asks (build + simulator + screenshot loop). Do not run it
  unasked.

## 6. Aesthetic capture

Owner-gated, per the canon (`~/.claude/docs/reference/design-lane.md`, Aesthetic capture): writes to
the aesthetic happen ONLY when the owner explicitly asks, or on a strong correction with the exact
entry text proposed and approved first. Entries carry his VERBATIM words, an explicit said-in scope,
a severity from the `P0 | P1 | advisory` enum, and the date. A session that wrote entries discloses
them in one line at the end. There is NO per-turn capture question.

## Contract sources + tuning

Project design law lives in the project's `.claude/CLAUDE.md` design section plus its token dirs
(e.g. `{project}/PeptideFox/DesignSystem/Tokens/` in the PeptideFox app — read whatever the target
project declares). If absent, do NOT block — run on the iOS hub aesthetic and note it once. The
detector defaults are brand-tuned; to run against another brand, override `SWIFT_DESIGN_RULES`,
`SWIFT_DESIGN_CONFIG`, and `SWIFT_DESIGN_DETECTOR_BIN`.

## The honest ceiling

Canon §The honest ceiling: the lane guarantees the floor — rules present structurally, external
adjudication on the gated tiers, no named slop, no forged gate, escalations that arrive with the
diff and revert instructions. It does NOT manufacture taste — the judge's judgment + the owner's eye
(and on color, the owner's colorblind eye on a bright screen) is the taste ceiling. And it does NOT
replace `/ios` — it overlays it.
