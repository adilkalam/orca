# `.design-overrides.json` — the per-project owner-override registry

The design lanes (`docs/reference/design-lane.md` §Precedence) put the owner's
explicit, in-context instruction **above** both the standing register (rants /
preferences) and the deterministic detector. When the owner sanctions something
a standing rule names as slop, that win must **persist** — otherwise it re-loses
on the next task ("circles"). The persistence mechanism is a per-project
`{project}/.design-overrides.json`, written back at BRANCH time (lane Step 4) and
read by **both** detectors (web `design-detector`, iOS `swift-design-detector`)
plus the gate hook (`hooks/gate-enforcement.sh`).

This file is the **single shared contract**. Both detectors implement the schema,
the path-resolution convention, and the glob semantics defined here **identically**.

---

## Schema

`.design-overrides.json` is a **flat JSON array** of override entries:

```jsonc
[
  {
    "suppresses": "off-palette-hue",          // REQUIRED: the rule id this override outranks
    "scope": "**/Features/Vitals/**",          // REQUIRED: a path glob the suppression applies to
    "value": "soft-red Clear",                 // OPTIONAL: the sanctioned value (documentation)
    "provenance": "make the alert chip red — it's a warning", // OPTIONAL: the owner's exact words
    "created": "2026-06-23T18:04:00Z"          // OPTIONAL: ISO timestamp the override was bound
  }
]
```

| Field | Required | Meaning |
| --- | --- | --- |
| `suppresses` | **yes** | The rule id (`finding.antipattern` / `ruleId`) the owner's instruction outranks. |
| `scope` | **yes** | A path glob (`**` / `*` / `?`) the suppression is bounded to. **Must be non-empty.** |
| `value` | no | The sanctioned value, recorded for the human (e.g. `soft-red Clear`). Not matched against. |
| `provenance` | no | The owner's exact words that authorized the override. Carried into the validator's advisory annotation. |
| `created` | no | ISO 8601 timestamp the override was written back. |

A missing/empty/unparseable file is **not** an error — both detectors fall back to
an empty array `[]` and behave exactly as if no overrides exist. The override file
**never** crashes a detector.

---

## The suppression rule — BOTH, and a non-empty scope (the accessibility floor)

A finding is suppressed **if and only if** an override entry exists where:

1. `override.suppresses === finding.ruleId` (exact rule-id equality), **AND**
2. `override.scope` is **non-empty** AND the finding's file path matches `override.scope`
   under the glob semantics below.

Both conditions are required. **An override with a missing or empty `scope`
suppresses NOTHING** — it does not suppress "everything". This is the safety
floor: a malformed or over-broad override fails **closed-to-firing** (the rule
keeps firing) rather than silently un-protecting the whole codebase. Suppression
is always **narrowing** — it removes a single named rule for a single named path
scope, never a blanket mute.

The suppression removes the finding from the detector's **exit-code-bearing** set
(the CLI is a binary floor: a covered finding stops contributing to the `exit 2`).
The validator separately *downgrades* a covered finding to an `advisory` FINDING
annotated `owner-sanctioned` for the human (lane Step 3) — that is a presentation
concern layered on top of this binary suppression, not a replacement for it.

---

## Path-resolution convention (identical in both detectors)

Both detectors resolve the override file in this order, first hit wins:

1. **Explicit flag** — `--overrides <path>` on the CLI.
2. **Environment variable** — `DESIGN_OVERRIDES_PATH` (web) / `SWIFT_DESIGN_OVERRIDES` (iOS).
3. **Walk-up** from the scanned file's directory toward the repo root, looking for
   `.design-overrides.json`.
4. **Default** — `{cwd}/.design-overrides.json`.
5. If none of the above resolves to a readable, parseable file → empty `[]`.

> Note: the web detector loads the override registry **once** at module top
> (Node-only, `IS_BROWSER`-guarded), keyed off `DESIGN_OVERRIDES_PATH` else
> `{cwd}/.design-overrides.json`, because its module-level rules are loaded the
> same way. The iOS detector resolves per scan with the full walk-up (its config
> already resolves that way). Both honor the same explicit→env→walk-up→default→`[]`
> intent; the divergence is only *when* resolution runs, never the semantics.

---

## Glob semantics (authoritative — both detectors conform)

The glob matcher is the iOS detector's `GlobMatcher` (`Config.swift`). The web
detector ports the **same** semantics. A glob is compiled to an anchored regex
(`^…$`) matched against the **full** path string:

| Token | Matches |
| --- | --- |
| `**` | Any run of characters **including** path separators (`/`). A trailing `/` after `**` is swallowed, so `**/Foo` also matches `Foo` at the root. |
| `*` | Any run of characters **except** a path separator. |
| `?` | Exactly one character except a path separator. |
| any other char | Itself, regex-escaped. |

Because the match is against the full path, a leading `**/` is the idiomatic way to
make a glob path-position-independent (`**/Features/Vitals/**` matches the scope
wherever the repo is checked out). An empty `scope` compiles to nothing and — per
the safety rule above — matches **nothing** (it never short-circuits to "match all").

---

## What overrides CANNOT un-protect (the accessibility floor, web side)

The web detector's accessibility-class rules — `low-contrast`, `cramped-padding`,
`tight-leading`, `tiny-text` — are already **advisory** and **never block** (they
never contribute to `exit 2`). An override therefore **cannot** un-protect them:
there is no block to suppress. The override mechanism only ever subtracts from the
**blocking** (P0 / exit-2) set, so the human-accessibility floor is structurally
beyond its reach. State this plainly to the owner: sanctioning a brand color does
not, and cannot, switch off a contrast warning.

---

## Provenance — owner-authored, ratified by construction

Unlike a rant-derived detector rule (distilled from the owner but not explicitly
ratified per-use), an override is **authored by the owner in the moment**. It is
ratified by construction. That is precisely why it outranks the register: the
register is a derived snapshot; the override is the source speaking now. An
override is emitted **only** from an explicit owner instruction — never invented,
never used to launder a model preference (lane Step 1).

---

## See also

- `docs/reference/design-lane.md` §Precedence + Steps 1, 3, 4 — when/why an override is bound and written back.
- `docs/concepts/ios-design-contract/detector-config-schema.md` — the **separate** per-project `.design-detector.swift.json` (token-dir scoping + per-rule `severity`). The override registry and the detector config are distinct files with distinct jobs.
- `mcp/design-detector/README.md` — web detector `DESIGN_OVERRIDES_PATH` behavior.
