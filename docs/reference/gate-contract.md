# Dev-Lane Standards Score Contract

**Status:** Canonical. The single shared definition of the dev-lane standards-score gate,
defined ONCE here and referenced by the lane commands — never re-specified per command
(`#POISON_PATH` — that duplication is what lets contracts diverge). Sibling to
`docs/reference/design-lane.md` (which owns the design-lane gate and the shared
`attempts` / `escalated` loop-control convention).

**Spec:** `.orca/requirements/2026-07-03-1938-orca-audit-remediation/06-requirements-spec.md`
(FR-4.1..FR-4.4; the per-lane enforcement calibration is Section 6).

---

## The contract

When a dev lane's standards-enforcer gate resolves, the orchestrator writes the result to
`{project}/.orca/orchestration/phase_state.json` under `gates.standards`:

```json
{
  "gates": {
    "standards": {
      "score": 93,
      "threshold": 90,
      "gate_decision": "PASS",
      "lane": "ios"
    }
  }
}
```

| Field | Type | Meaning |
|---|---|---|
| `score` | integer | The standards-enforcer's 0-100 code-quality score. REQUIRED and numeric on a PASS. |
| `threshold` | integer | The pass floor. Defaults to `90` when absent. |
| `gate_decision` | `"PASS"` \| `"BLOCK"` | `PASS` only when `score >= threshold`. |
| `lane` | string | The dev lane: `ios`, `expo`, `django-react` (and `nextjs` once restored). |

---

## Which lanes adopt it

| Lane | Command | Standards enforcer | Adopted |
|---|---|---|---|
| iOS | `/ios` | `ios-standards-enforcer` | Yes |
| Expo | `/expo` | `expo-standards-enforcer` | Yes |
| Django + React | `/django-react` | `django-react-standards-enforcer` | Yes (two-stack, see below) |
| Next.js | `/nextjs` | `nextjs-standards-enforcer` | Deferred to Phase 5 (command being restored) |

Lanes that have NOT adopted the contract simply omit `gates.standards`; the hook does
nothing when the object is absent (adoption is additive, never retroactive breakage).

**Out of scope (calibration boundary, FR-4.4 / Section 6):** planning commands
(`/requirements`, `/enhance`), verb-skill cognition loops, and research prose gates get
NO numeric score gate. Do not "helpfully" extend this contract to them.

---

## Anti-fabrication enforcement (the hook)

`hooks/gate-enforcement.sh` reads the candidate `phase_state.json` on every `Write`/`Edit`
to that file. When `gates.standards.gate_decision == "PASS"` it enforces two invariants:

1. **`score` present and numeric** — a PASS with an absent or non-numeric score is a
   *fabricated* PASS and is BLOCKED (exit 2). A PASS without a score asserts quality with
   no measurement behind it.
2. **`score >= threshold`** — a PASS with `score < threshold` (default 90) is BLOCKED
   (exit 2). This makes each lane's "hard block < 90" prose mechanically real rather than
   advisory.

When `gate_decision` is anything other than `PASS`, or when there is no `gates.standards`
object at all, the hook does nothing — non-adopting lanes and honest BLOCK writes are
never affected.

---

## Two-stack rule (Django + React)

`django-react-standards-enforcer` scores two stacks independently. The single `score` the
hook checks is the **worse of the two** so a failing stack cannot be masked by a passing
one:

```json
{
  "gates": {
    "standards": {
      "score": 88,
      "backend_score": 94,
      "frontend_score": 88,
      "threshold": 90,
      "gate_decision": "BLOCK",
      "lane": "django-react"
    }
  }
}
```

`score = min(backend_score, frontend_score)`. Keep `backend_score` and `frontend_score`
as detail fields for the operator, but the enforced number is the minimum — either stack
below 90 blocks.

---

## Retry / escalation convention (shared with the design lane)

The corrective-pass loop uses the same `attempts` convention the design lane defines in
`docs/reference/design-lane.md` (`gates.design_lane.attempts`): the orchestrator
increments `gates.standards.attempts` on each builder respawn after a BLOCK. A lane may
cap retries and set `escalated: true` when it surfaces unresolved findings to the user
rather than looping forever. The score gate itself only checks `score` vs `threshold` on a
PASS write; `attempts` / `escalated` are the loop-control fields (see the design-lane doc
for the canonical semantics).

---

## Related docs

- **Design lane (sibling contract):** `docs/reference/design-lane.md`
- **Hook:** `hooks/gate-enforcement.sh` (the `Dev-Lane Standards Score Gate` block)
- **Verification quick reference:** `quick-reference/ORCA-OS/ORCA-verification.md`
- **Graduated gate scoring:** `docs/reference/graduated-gate-scoring.md`
