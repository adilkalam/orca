# Design Lane — the canonical tier model + governance spec

**Status:** Canonical. The single shared definition of how design work routes (the tier model), how
authority resolves (precedence), and how taste gets recorded (aesthetic capture). Defined ONCE here;
**never copy-pasted into command files** (`#POISON_PATH` — that duplication is what bloated
impeccable/recraft/motion-design). Every design command, skill, and agent points to this file and
supplies only its task-specific inputs.

**Sibling contract:** `~/.claude/docs/reference/gate-contract.md` — the shared dev-lane
standards-score gate (`gates.standards`) enforced by the same `~/.claude/hooks/gate-enforcement.sh`;
it reuses the `attempts` / `escalated` convention this doc defines.

**Orchestration legality:** a lane command runs in the **main thread**, so it is the orchestrator and
may legally spawn single-level `Agent()` subagents (flat pattern,
`~/.claude/docs/reference/flatten-orchestration-pattern.md`). No spawned agent sub-spawns.

---

## The tier model — three ways in, biased toward fast

Design requests are not one size. The lane has three tiers; the cost of the machinery must never
exceed the cost of the mistake it prevents.

### T0 — `--tweak` (in-thread, ZERO agent spawns)

For the smallest class of change: nudge a spacing value, swap one color token, fix one alignment seam.

- The lane command **inlines the banned-core excerpts in its own body** — T0 never relies on
  `Skill()` loading. The rules are present because the command text carries them.
- The main agent edits directly, in-thread.
- The detector runs inline as a **REPORT** — it informs, it never blocks.
- **NO phase_state writes. NO gates. NO capture prompt.** The owner is the verifier — a live
  simulator or localhost is assumed to be in front of him.
- The hook floor **NEVER applies to T0** — by construction, since T0 writes no phase_state.

### T1 — direct (THE DEFAULT for well-defined single-verb requests)

The default tier. A well-defined single-verb request (`/refine --contrast <target>`,
`/impeccable --typeset <file>`, a clearly-scoped "make this header breathe") runs T1:

- The **main agent builds in-thread**. The owner's verbatim brief stays in the working context by
  construction — no re-encoding, no delegation telephone.
- Then exactly **ONE fresh-context judge** is spawned: `Agent(design-validator)` for web,
  `Agent(ios-design-validator)` for `.swift` targets. The judge receives the artifact paths + the
  bound constraints + the hub aesthetic; it never sees the build reasoning.
- On **BLOCK**: the main agent fixes in-thread and re-judges. **MAX N=2** fix rounds, then escalate
  to the owner with the diff and revert instructions.
- The main agent writes the canonical gate — `gates.design_lane` (web) / `gates.ios_design_lane`
  (iOS) — to `{project}/.orca/orchestration/phase_state.json` **using the Write tool with full
  content (NEVER Bash)**. The hook floor applies: `~/.claude/hooks/gate-enforcement.sh` runs the
  detector itself on the artifact paths and exit-2 blocks any un-overridden P0 the judge missed.

### T2 — full (freeform / multi-verb / thin brief / explicit `--full`)

The heavy tier: `Agent(design-architect)` decomposes the request into ordered verb-tasks, then
**builder -> validator per task** (`design-builder`/`design-validator`, or the `ios-design-*`
siblings for `.swift` targets).

- The builder receives the owner's **RAW VERBATIM message** — never a summary of it.
- Before each BUILD the orchestrator captures `STASH_SHA=$(git stash create)`. An escalation
  handback includes the diff AND the revert instruction `git checkout $STASH_SHA -- <paths>`.
- Per task: bind typed constraints -> BUILD -> VALIDATE (fresh context) -> BRANCH. On BLOCK, loop
  the builder with the combined findings, **MAX N=2**, then escalate.
- `escalated: true` in the gate object is the **sanctioned exit** for a gate whose attempts exceeded
  N=2 — set only after surfacing the unresolved findings, the diff, and the revert instructions to
  the owner. A PASS written with `attempts > 2` and no sibling `escalated: true` is BLOCKED by the
  hook (the lane never silently ships a runaway loop).
- **On a task escalation, remaining planned tasks HALT pending the owner.** Never plough through the
  rest of the plan on top of a disputed artifact.
- The hook floor applies (same gate write + enforcement as T1).

### Routing

- **Explicit flags are deterministic:** `--tweak` -> T0, `--full` -> T2, a single `--<verb>` -> T1.
- **The default heuristic is bias-to-fast.** When in doubt, route DOWN a tier. Wrong-fast is caught
  instantly by the owner's live eye on the simulator/localhost; wrong-slow burns 20 minutes of
  machinery on a one-line change. The expensive failure is the slow one.

In every tier the orchestrating agent **never grades its own output as the gate**. T0 has no gate at
all (the owner is the gate); T1/T2 adjudicate externally (fresh-context judge + detector floor).

---

## Precedence — the owner outranks the aesthetic outranks the detector

The lane exists to spare the owner from **re-stating** standing taste — never to overrule him. The
binding order is fixed, highest first:

1. **The owner's explicit, in-context instruction.** Ground truth. The person, now, looking at the
   actual screen. It outranks everything below — *including a detector P0.* The aesthetic is
   *derived from* the owner; a derived snapshot can never outrank its source.
2. **The aesthetic** — the owner's standing taste collection:
   `~/.claude/docs/concepts/design-contract/banned/` + `preferences/` + `voice-anchors.md` (and the
   iOS sibling under `~/.claude/docs/concepts/ios-design-contract/`). Defaults for when the owner
   has **not** spoken to the point. A floor that saves repetition — never a ceiling over a live word.
3. **The deterministic detector defaults** (`detector-rules.json` / `detector-rules.swift.json`).
   A mechanical named-slop floor that *serves* the owner's taste. It sits below both.

**Owner overrides transit the bind as FORWARD constraints** in the pipe-delimited form:

```
OWNER-OVERRIDE|suppresses=<ruleId>|scope=<glob>|value=<sanctioned value>|provenance=<owner verbatim words> (<YYYY-MM-DD>)
```

The `provenance` field is the trailing remainder of the string — everything after `provenance=`,
verbatim owner words plus the date in parentheses. Emit an override **only** from an explicit owner
instruction; never invent one, never use it to launder a model preference. The parse spec is live in
the lane commands and validators (split on `|`; the `key=value` fields are `suppresses`, `scope`,
`value`; `provenance=` is LAST and consumes the remainder, including any further pipes).

Mechanics that make the win persist:

- The validator **subtracts owner-sanctioned findings BEFORE the verdict**: a detector finding whose
  `ruleId` + path fall under an override's `suppresses` + `scope` is removed from
  `UNSATISFIED_CONSTRAINTS` and downgraded to an `advisory` finding annotated
  `owner-sanctioned (provenance: "<words>")`. A P0 the owner sanctioned does not force BLOCK.
- Every honored override is **written back** to the project registry
  `{project}/.design-overrides.json` (canonical entry shape:
  `~/.claude/docs/concepts/design-overrides-schema.md` — `{suppresses, scope, value, provenance,
  created}`; dedup on `suppresses` + `scope`; atomic write; a non-empty `scope` is REQUIRED). The
  write-back is **IMMEDIATE at bind** — the registry entry is appended when the override is bound,
  not deferred to a later PASS (a BLOCKed or escalated task must not re-lose an owner instruction).
  The detectors read this registry and self-suppress on future runs. An override honored once but not
  written back re-loses on the next task — that recurrence is the precise failure precedence kills.
- Enforcement severity **tracks what the owner cares about, set per project** (the per-project
  detector config / severity overrides), not a frozen global map. The inverse failure — a thing the
  owner repeatedly instructs filed as advisory, sailing through the gate forever — is equally fatal.

---

## Aesthetic capture (owner-gated)

**This section is the single home for the capture protocol.** All commands and skills reference it;
none re-state it.

Writes to aesthetic files — `~/.claude/docs/concepts/design-contract/banned/` (and the iOS sibling),
`preferences/`, a project's `DESIGN.md`, or `{project}/.orca/aesthetic-pending.md` — happen ONLY
when:

- **(a) The owner explicitly asks** — "ban this", "add to the aesthetic", "note this"; or
- **(b) The owner expressed a strong correction** and the agent **proposes the EXACT entry text and
  waits for approval** before writing anything.

**Entry schema.** Every entry carries:

- The owner's **VERBATIM words** — never a paraphrase.
- An **explicit scope** — defaults to the context it was said in (a project, a feature, a
  component). It widens to global ONLY on explicit owner say-so.
- A **severity** from the controlled enum: `P0 | P1 | advisory`.
- The **date**.

**No dramatization.** No "sins", no emotional-state annotations, no all-caps editorial headings.
Severity lives in the enum, not in prose.

**Session-end disclosure.** Any session that wrote aesthetic entries ends its final handback with a
one-line list of what was written and where.

**Pending ledger.** `{project}/.orca/aesthetic-pending.md` is the per-project pending ledger (sweep
tools also read the legacy `design-rants-pending.md` if present). Pending entries are swept and
catalogued via `/impeccable --extract aesthetic`
(`~/.claude/docs/concepts/impeccable-reference/extract-aesthetic.md`).

**There is NO per-turn capture question.** The old closing-handback footer question is abolished.
Capture is owner-gated, not solicited.

---

## Shared mechanics (T1/T2 — the gated tiers)

### The bind

The orchestrator binds typed constraints before building: one `FORBIDDEN` per named-slop pattern the
task can trip (citing `detector:<ruleId>` or `banned:<id>`), one or more `FORWARD` felt-state /
composition obligations drawn at runtime from `voice-anchors.md` + `persona.md` + the task, plus any
`OWNER-OVERRIDE` FORWARD constraints (format above). Record the bound ids to
`{project}/.orca/orchestration/phase_state.json` under `planning.bound_constraint_ids`. A skipped
bind is structural failure: the validator returns `GATE_VERDICT: BLOCK` with
`UNSATISFIED_CONSTRAINTS: ["NO-BOUND-CONSTRAINTS"]`. Interactive refinement (`/live`
element-by-element, mid-build critique) stays **in-thread**; the owner's critique travels verbatim.

### The judge (validator contract)

The fresh-context judge receives ONLY the artifact paths + the bound constraints + the hub
aesthetic — never the build reasoning. It runs the detector
(web: `node /Users/adilkalam/ORCA-OS/mcp/design-detector/bin/designcheck.js detect --json <path>`;
Swift: `/Users/adilkalam/ORCA-OS/mcp/swift-design-detector/bin/swiftdesigncheck detect --json
<path>`; both: EXIT 2 = findings on STDERR). **Swift v1 takes ONE file per invocation** — passing
plural paths to a single `swiftdesigncheck` call is an EXIT 1 DETECTOR-ERROR; the judge loops the
artifact files, one invocation each, and aggregates the findings before judging. It then maps
findings to bound FORBIDDEN ids, judges FORWARD
obligations, subtracts owner overrides, and emits the machine verdict:

```
GATE_VERDICT: PASS|BLOCK
SCORE: <0-100>
UNSATISFIED_CONSTRAINTS: [<bound-id>, ...]
FINDINGS: [{"id": "...", "severity": "P0|P1|advisory", "where": "...", "note": "..."}, ...]
```

`GATE_VERDICT` is the ONLY field the orchestrator branches on — `PASS` or `BLOCK`, never empty,
never "WARN". The judge is **hard-on-named-slop, advisory-on-taste**: pure taste beyond the bound
ids is noted `advisory` and does not by itself force BLOCK. A persona-sourced FORWARD id, once
bound, is binding like any bound id; persona material NOT bound stays advisory.

### The gate write + hook floor

The canonical gate objects are `gates.design_lane` (web) and `gates.ios_design_lane` (iOS) in
`{project}/.orca/orchestration/phase_state.json`, written with the Write tool (full content, NEVER
Bash):

```json
{ "gates": { "design_lane": {
    "gate_decision": "PASS",
    "artifact_paths": ["<paths>"],
    "validator_score": <SCORE>,
    "bound_constraint_ids": ["<C1>", "..."],
    "attempts": <n>,
    "active_overrides": [{"suppresses": "<ruleId>", "scope": "<glob>", "provenance": "<words>"}] } } }
```

`~/.claude/hooks/gate-enforcement.sh` re-runs the detector on `artifact_paths` and exit-2 blocks any
P0 not covered by an `active_overrides` entry (matched on `suppresses` + a non-empty `scope` glob).
If the gate write itself is blocked, treat it as a BLOCK and loop within the N=2 bound; only after a
successful PASS write is the artifact handed back.

---

## The honest ceiling (state it, never hide it)

- **Guaranteed:** rules present structurally (T0 inlines them; T1/T2 load the hub); adjudication
  external on the gated tiers (fresh judge + detector floor + hook); no named slop; no forged gate;
  no silent no-op; escalations arrive with the diff and revert instructions.
- **NOT guaranteed:** good taste — irreducibly the judge's judgment + **the owner's eye is the taste
  ceiling**. The lane raises the floor and externalizes judgment; it does not manufacture taste.
