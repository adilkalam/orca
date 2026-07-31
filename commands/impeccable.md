---
description: "Design lane — three tiers, biased toward fast. T0 --tweak: in-thread edit + inline detector report, zero agent spawns. T1 --<verb> (THE DEFAULT for a well-defined single-verb request): build in-thread under bound constraints, then ONE fresh-context judge (design-validator). T2 --full / freeform multi-verb: design-architect plan, then design-builder -> design-validator per task. Canon: ~/.claude/docs/reference/design-lane.md. Setup flags: --craft --teach --document --extract."
argument-hint: "<freeform request> | --tweak <small edit> | --<verb> <target> | --full <request> | --craft <feature> | --teach | --document | --extract [aesthetic|<target>]"
license: Apache 2.0. Based on Anthropic's frontend-design skill + Paul Bakaus's Impeccable. See NOTICE.md for attribution.
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

# /impeccable — Design Lane (three tiers)

The canon is `~/.claude/docs/reference/design-lane.md` — the tier model, the precedence order
(owner > aesthetic > detector), the aesthetic-capture protocol, and the shared T1/T2 mechanics
(bind / judge / gate write / hook floor) are defined THERE, once. This command routes a request to a
tier and executes it. It restates nothing from the canon except the T0 banned-core (§2 —
deliberately inlined so T0 never depends on a skill load).

## 1. Routing

Explicit flags are deterministic:

| Argument | Tier |
|---|---|
| `--tweak` | **T0** (§2) |
| `--layout` `--typeset` `--colorize` `--bolder` `--quieter` `--delight` `--harden` `--polish` `--optimize` `--adapt` `--clarify` `--distill` `--overdrive` `--animation` `--threejs` | **T1** (§3) for that verb |
| `--full` | **T2** (§4) |
| `--craft "<feature>"` | Feature setup (§6), then **T2** |
| `--teach` / `--document` / `--extract` | Setup / maintenance (§6) |

Freeform (no flag): classify in one line, then go —
- a well-defined **single-verb** intent ("make this header breathe" -> quieter/typeset) -> **T1**;
- **multi-verb / thin brief / whole-page** ("clean up the pricing page") -> **T2**.

**BIAS-TO-FAST** (canon §Routing): when in doubt, route DOWN a tier. Wrong-fast is caught instantly
by the owner's live eye on localhost; wrong-slow burns 20 minutes of machinery on a one-line change.
The expensive failure is the slow one.

The standalone verb *skills* (`/layout`, `/typeset`, ...) are in-thread craft references WITHOUT the
judge or the detector floor — useful mid-conversation, but NOT an enforced path. Enforcement (fresh
judge + gate + hook floor) exists only here: `/impeccable --<verb>` (T1) or T2.

## 2. T0 — `--tweak` (in-thread, ZERO agent spawns)

Nudge a spacing value, swap one color token, fix one alignment seam. **NO agent spawns, NO
phase_state writes, NO gates, NO capture question.** The owner is looking at the live surface; he is
the verifier.

1. The banned-core below is the floor — present because this command text carries it; do NOT rely on
   `Skill()` loading. Loading `~/.claude/skills/impeccable-hub/SKILL.md` is encouraged when depth is
   needed, but never assumed.
2. Make the edit(s) directly with `Edit`/`Write`.
3. Run the detector inline as a REPORT on the changed files:
   ```bash
   node /Users/adilkalam/ORCA-OS/mcp/design-detector/bin/designcheck.js detect --json <changed files>
   ```
   Report findings to the owner one line each, blocking findings named first. **NEVER block, NEVER
   loop** — the owner decides.

### T0 banned-core (inlined — the only lane content this file deliberately carries)

P0 — the named-slop floor (blocking at the gated tiers; at T0, name them loudly):

- `tailwind-palette-utilities` — default-palette color utilities (`bg-blue-500`, `text-emerald-600`) — the SaaS-monoculture palette; color comes from brand/material tokens, never the utility palette.
- `tailwind-hex-values` — Tailwind 500-shade hexes pasted verbatim (`#3b82f6`, `#ef4444`, ...) — the copied-from-Tailwind fingerprint.
- `reflex-fonts` — a reflex-list face in `font-family` (Geist, Inter, Roboto, Space Grotesk, Playfair, ...) — the signal of defaulting; run the hub's font-selection procedure before naming any font.
- `geist-imports` — importing Geist (`next/font`, fonts.vercel.com) — the typography decision skipped entirely.
- `purple-pink-gradients` — AI-purple/magenta/pink gradient washes — the era's most tired tell, and physically painful to the colorblind owner.
- `gradient-text` — gradient-filled headline text via `background-clip: text` — decorative slop.
- `side-stripe-borders` — thick left/right accent-stripe borders — the template callout tell.
- `inset-highlight-shadow` — inset white highlight fake-bevel (`box-shadow: inset ... rgba(255,255,255,...)`) — the pre-Squarespace 3D-button stack.

Advisory tier (report, never block): `default-ease-transition` (`transition: all` + default ease),
`bouncy-easing` (overshoot cubic-bezier), `utility-sprawl` (6+ utilities in one className —
scattered design authority). Full corpus:
`~/.claude/docs/concepts/design-contract/detector-rules.json` + `banned/`.

## 3. T1 — direct (THE DEFAULT)

The main agent builds in-thread; ONE fresh-context judge adjudicates. The owner's brief stays
verbatim in the working context by construction — no delegation telephone, no re-encoding.

1. **Load.** `Skill` the hub (`~/.claude/skills/impeccable-hub/SKILL.md`) + the verb skill for the
   classified verb.
2. **BIND** (canon §The bind). A real cognition checkpoint; record the returned ids:
   ```
   mcp__cognition-mcp__cognition({ operation: "checkpoint", projectPath: <repo root>, verbose: false,
     sessionTitle: "design lane: <verb> on <target>", sessionTags: ["design-lane","<verb>"],
     content: { command: "/impeccable --<verb>", phase: "bind",
       addConstraints: [
         { type: "FORBIDDEN", text: "<slop> (detector:<ruleId> | banned:<id>)" },  // named slop this verb can trip
         { type: "FORWARD",   text: "<felt-state / composition obligation>" },     // from preferences/ + persona.md + the task
         { type: "FORWARD",   text: "OWNER-OVERRIDE|suppresses=<ruleId>|scope=<glob>|value=<sanctioned value>|provenance=<owner verbatim words> (<YYYY-MM-DD>)" }  // ONLY from an explicit owner instruction; never invent one
       ] } })
   ```
   **Override write-back is IMMEDIATE at bind** (not deferred to PASS): append each OWNER-OVERRIDE
   to `{project}/.design-overrides.json` — canonical entry shape `{suppresses, scope, value,
   provenance, created}`, jq dedup on `suppresses` + `scope`, atomic tmp-then-`mv` write, per
   `~/.claude/docs/concepts/design-overrides-schema.md`. A non-empty `scope` is REQUIRED — an empty
   scope suppresses NOTHING.
3. **BUILD** in-thread (`Edit`/`Write`/`MultiEdit`), under the bound ids.
4. **JUDGE** — exactly ONE spawn; NO builder spawn (there is no re-encoding to protect against):
   ```
   Agent({ subagent_type: "design-validator", description: "Judge <verb> on <target>",
     prompt: "ARTIFACT_PATHS: <paths>\nBOUND_CONSTRAINTS: <ids + full constraint texts>\nACTIVE_OVERRIDES: <the OWNER-OVERRIDE constraints, may be empty>\nBefore running the detector, export DESIGN_OVERRIDES_PATH={project}/.design-overrides.json so it self-suppresses owner overrides from the registry regardless of your cwd.\nRun the detector, judge the bound ids, emit the GATE_VERDICT block." })
   ```
5. **BRANCH.**
   - **PASS** -> write the canonical gate `gates.design_lane` into
     `{project}/.orca/orchestration/phase_state.json` — **using the Write tool with the full merged
     JSON content, NEVER via Bash** (the hook floor inspects Write content; this is load-bearing):
     ```json
     { "gates": { "design_lane": {
         "gate_decision": "PASS", "artifact_paths": ["<paths>"], "validator_score": <SCORE>,
         "bound_constraint_ids": ["C1", "..."], "attempts": <n>,
         "active_overrides": [{"suppresses": "<ruleId>", "scope": "<glob>", "provenance": "<words>"}] } } }
     ```
     If the hook blocks the write (a P0 the judge missed, not covered by an override), treat it as a
     BLOCK below. Only after a successful PASS write is the artifact handed back.
   - **BLOCK** -> fix in-thread from the named findings, re-judge. **MAX N=2 judge rounds total**,
     then **ESCALATE**: show the diff, offer revert (`git checkout -- <paths>` if the pre-state was
     clean, else the stash-snapshot flow from §4), and set `escalated: true` in the gate when the
     owner accepts a partial result.

**OWNER-OVERRIDE parse spec (stated once, for every consumer):** an override is a constraint whose
text starts `OWNER-OVERRIDE|`. Split on `|`: the `key=value` fields are `suppresses`, `scope`,
`value`; `provenance=` is LAST and consumes the remainder of the string, including any further pipes.

## 4. T2 — full (freeform multi-verb / thin brief / `--full`)

1. **Plan.** Spawn the architect (T2 is the only tier that uses it):
   ```
   Agent({ subagent_type: "design-architect", description: "Plan design verb-tasks",
     prompt: "=== CONTEXT BUNDLE (INHERITED) ===\nDO_NOT_QUERY: true\n<hub aesthetic content>\nPRODUCT/DESIGN paths: <...>\n===\nREQUEST (owner verbatim): <the owner's raw message text>\nDecompose into ordered verb-tasks with forbidden_seeds + forward_seeds + override_seeds (OWNER-OVERRIDE| pipe format, ONLY from an explicit owner instruction). Class-scope the sweep (every call site of the pattern, not just the file pointed at; enumerate touched vs left in NOTES). Return the TASKS/ORDER block." })
   ```
2. **Per task, in ORDER:**
   1. **BIND** exactly as §3 step 2, seeded from the architect's task (overrides write back
      IMMEDIATELY when bound, not only on PASS).
   2. **Snapshot.** `STASH_SHA=$(git stash create)` — record it in the task log under
      `.orca/orchestration/temp/`. This is the revert handle for escalation.
   3. **BUILD.** The builder prompt MUST contain the owner's ORIGINAL REQUEST VERBATIM — copy the
      raw message text; summaries and re-encodings are ABOLISHED:
      ```
      Agent({ subagent_type: "design-builder", description: "Build <verb> on <target>",
        prompt: "OWNER_REQUEST_VERBATIM: <the owner's raw message text, unedited>\nTASK: <verb intent> on <target>\nBOUND_CONSTRAINTS: <ids + full constraint texts>\nACTIVE_OVERRIDES: <OWNER-OVERRIDE constraints, may be empty — within an override's scope the suppressed rule does NOT apply>\nHUB: read ~/.claude/skills/impeccable-hub/SKILL.md if not injected above\nVERB_SKILL: <skill from the architect's verb->skill map>\nBuild in place under the bound ids. Report ARTIFACT_PATHS + CONSTRAINTS_ADDRESSED + SELF_CHECK." })
      ```
   4. **JUDGE.** `Agent(design-validator)` fresh-context, exactly as §3 step 4.
   5. **BRANCH.**
      - **PASS** -> confirm the override write-back happened at bind (same jq dedup mechanics), then
        write `gates.design_lane` via the Write tool (§3 step 5 — same shape, same NEVER-Bash rule).
      - **BLOCK** -> re-spawn the builder with `PRIOR_FINDINGS` (the judge's
        `UNSATISFIED_CONSTRAINTS` + `FINDINGS`) + the verbatim owner request AGAIN. **MAX N=2**,
        then **ESCALATE**: show the diff + the revert instruction
        `git checkout $STASH_SHA -- <paths>`, and **HALT the remaining ORDER tasks** pending the
        owner. `escalated: true` in the gate is the sanctioned exit — the hook requires it for any
        gate whose `attempts` exceeded 2; set it only after surfacing the unresolved findings, the
        diff, and the revert instructions to the owner.

## 5. Aesthetic capture

Owner-gated, per the canon (`~/.claude/docs/reference/design-lane.md`, Aesthetic capture): writes to
the aesthetic happen ONLY when the owner explicitly asks, or on a strong correction with the exact
entry text proposed and approved first. Entries carry his VERBATIM words, an explicit said-in scope,
a severity from the `P0 | P1 | advisory` enum, and the date. A session that wrote entries discloses
them in one line at the end. There is NO per-turn capture question.

## 6. Setup / maintenance flags

- **`--craft "<feature>"`** — net-new needs discovery + a visual target before code: require
  `PRODUCT.md` (else `--teach`) + `DESIGN.md` (else `--document`); run the `/shape` discovery
  interview (3 rounds); generate 1-3 reference comps and let the owner pick; then run **T2** with
  the comp ingredients + shape commitments in the builder prompt. Full flow:
  `~/.claude/docs/concepts/impeccable-reference/craft.md`.
- **`--teach`** — write `{project}/.claude/PRODUCT.md` (strategic context) via the structured
  discovery interview, then hand off to `--document` (`impeccable-reference` + `product-template.md`).
- **`--document`** — handled by `/document` (generates `.claude/DESIGN.md`, the visual contract).
- **`--extract`** — pull reusable tokens/components into the design system
  (`~/.claude/docs/concepts/impeccable-reference/extract.md`). **`--extract aesthetic`** — sweep
  `{project}/.orca/aesthetic-pending.md` into the global banned catalog
  (`~/.claude/docs/concepts/impeccable-reference/extract-aesthetic.md`); rsync `docs/` after.

## The honest ceiling

Canon §The honest ceiling: the lane guarantees the floor — rules present structurally, external
adjudication on the gated tiers, no named slop, no forged gate, escalations that arrive with the
diff and revert instructions. It does NOT manufacture taste — the judge's judgment + the owner's eye
is the taste ceiling. If the owner critiques the output, route to `/recraft "<critique>"`.
