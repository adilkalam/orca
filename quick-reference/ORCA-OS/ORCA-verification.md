# Verification & Evidence Quick Reference (OS 7.0)

**Version:** OS 7.0
**Last Updated:** 2026-02-07

Verification in OS 7.0 is **automated** within pipelines. Gates use graduated scoring (PASS/WARN/ERROR/BLOCK), not binary pass/fail.

### Research Backing

The verification system draws on two research-backed patterns:

- **Reflexion** (Shinn et al., NeurIPS 2023): Agents that reflect on task feedback and persist lessons achieve 88% pass@1 on HumanEval vs 67% baseline. ORCA's gate-failure-to-Workshop-gotcha-to-save_standard loop implements this pattern.
- **Chain-of-Verification (CoVe)** (Dhuliawala et al., Meta AI 2023): Generating verification questions and answering them independently doubles factual precision. ORCA's standards-enforcer agents operate independently from builders -- they score without fixing, preventing self-confirming verification.

---

## Verification Workflow

Every pipeline follows this three-stage verification sequence:

1. **Standards Enforcer Gate** -- Code-level quality audit (score 0-100, graduated decision)
2. **Design/UI Gate** -- Visual or UI quality review (where applicable)
3. **Verification Agent** -- Build, test, and lint execution (mechanical pass/fail)

### Per-Domain Flows

| Domain | Standards Gate | Design/UI Gate | Verification Agent | Verification Phase |
|--------|---------------|----------------|--------------------|--------------------|
| Next.js | `nextjs-standards-enforcer` (Phase 4) | `nextjs-design-reviewer` (Phase 3) | `nextjs-verification-agent` (Phase 6) | Phase 6 |
| iOS | `ios-standards-enforcer` (Phase 5) | `ios-ui-reviewer` (Phase 6, code-only) | `ios-verification` (Phase 7) | Phase 7 |
| Expo | Specialized gates (design tokens, a11y, perf, security) | `expo-aesthetics-specialist` | `expo-verification-agent` (Phase 7) | Phase 7 |
| OS-Dev | `os-dev-standards-enforcer` | N/A | `os-dev-verification` | After standards gate |
| Django+React | `django-react-standards-enforcer` (Phase 6) | N/A | `django-react-verification` (Phase 8) | Phase 8 |

---

## Graduated Gate Scoring

All gates use the graduated scoring standard defined in `docs/reference/graduated-gate-scoring.md`.

| Score Range | Gate Decision | Behavior | User Action |
|-------------|---------------|----------|-------------|
| >= 90 | **PASS** | Continue pipeline | None |
| 80-89 | **WARN** | Continue, note issues | Optional fix |
| 70-79 | **ERROR** | Pause, suggest fixes | User decides: fix or proceed |
| < 70 | **BLOCK** | Stop pipeline | Must fix before continuing |

### Threshold Presets

| Preset | PASS | WARN | ERROR | BLOCK |
|--------|------|------|-------|-------|
| strict | >=95 | 85-94 | 75-84 | <75 |
| standard | >=90 | 80-89 | 70-79 | <70 |
| lenient | >=85 | 75-84 | 65-74 | <65 |

Individual gates may customize these baselines (e.g., a11y uses 95/85/70, security uses 95/90/80).

### Net Positive Auto-Promotion

When a score is 80-89 (WARN) but the change is clearly beneficial:
- Zero [Critical] violations
- At most 2 [Improvement] violations
- Feature/enhancement (not bugfix)
- No security violations

Then WARN promotes to PASS. See `docs/reference/graduated-gate-scoring.md` for full rules.

---

## Verification Agents by Domain

### Next.js (`nextjs-verification-agent`)

**Phase:** 6 (after standards and design QA gates)
**Model:** Haiku (lightweight)
**Checks:**
- `npm run lint` (ESLint -- TypeScript style gate)
- `npm run test` (Jest/Vitest)
- `npm run build` (Next.js production build)
- Chain of Verification (CoVe) table with domain-specific questions

**Status values:** `pass`, `fail`, `partial`

### iOS (`ios-verification`)

**Phase:** 7 (after standards and UI review gates)
**Model:** Haiku (lightweight)
**Checks:**
- `xcodebuild build` (all targets)
- `xcodebuild test` (test plan execution)
- Visual verification via XcodeBuildMCP (`screenshot`, `describe_ui`)
- Pixel measurement with zero-tolerance alignment protocol
- CoVe table with iOS-specific questions

**Special capability:** Only iOS agent with simulator access (XcodeBuildMCP).

### Expo (`expo-verification-agent`)

**Phase:** 7 (after design token, a11y, performance, and security gates)
**Model:** Haiku (lightweight)
**Checks:**
- `npx expo doctor` (health check)
- `npm run lint` / `npm run test`
- Build verification (`npm run build` or `eas build --local`)
- CoVe table with Expo/React Native-specific questions

**Status values:** `pass`, `fail`, `partial`

### OS-Dev (`os-dev-verification`)

**Phase:** After standards gate
**Model:** Haiku (lightweight)
**Checks:**
- JSON/YAML syntax validation (`jq`, YAML linter)
- Markdown/agent frontmatter structure
- CLI smoke check (non-destructive)
- CoVe table with OS-Dev-specific questions (tools format, model convention, path safety)

**Status values:** `PASS`, `FAIL`

### Django+React (`django-react-verification`)

**Phase:** 8 (after standards gate)
**Checks:**
- Backend: `uv run ruff check .`, `uv run mypy .`, `uv run pytest`, `manage.py check`
- Frontend: `bun run lint`, `bun run tsc --noEmit`, `bun run test`, `bun run build`
- CoVe table with full-stack questions (N+1 queries, type matching, auth)

**Status values:** `PASS`, `CAUTION`, `FAIL`

---

## Chain of Verification (CoVe)

All verification agents apply CoVe before rendering final status:

1. **Generate questions** -- 3-5 domain-specific verification questions based on actual changes
2. **Answer independently** -- Examine code/files directly, not by trusting the builder
3. **Aggregate** -- CoVe table with YES/NO/UNCERTAIN per question
4. **Determine status** -- All YES = PASS, any NO = FAIL, only UNCERTAIN = CAUTION

The CoVe table is **mandatory** in all verification output. Build/test success alone is insufficient.

---

## Design-Lane Deterministic Floor (`hooks/gate-enforcement.sh`)

The design lanes (`/impeccable` web, `/ios-impeccable` iOS) sit under a hard deterministic floor in the
gate-enforcement hook. When a phase_state write claims a design gate PASS, the hook re-runs the named-slop
detector ITSELF on the claimed `artifact_paths` and exit-2 BLOCKS on any P0 the validator missed. A
clean-PASS claim is mechanically falsified by named slop.

### Both lanes armed (web + iOS)

The hook fires when ANY of `gates.design_qa`, `gates.design_lane`, or `gates.ios_design_lane` is PASS.
It selects the detector per lane: a **pure iOS-design PASS** (`ios_design_lane` PASS with no web design
PASS) runs the Swift detector (`swiftdesigncheck`, env `SWIFT_DESIGN_DETECTOR_BIN`); otherwise the web
CSS detector (`designcheck.js`, env `DESIGN_DETECTOR_PATH`). This prevents running the CSS detector on
Swift sources. Both detector paths are env-overridable with the same var names the validators use, so the
hook and the validator resolve identically.

- **Web detector missing** → FAIL-OPEN: loud stderr note, no block (a missing detector must not hard-block
  every write in every project).
- **Swift detector missing** → NOT a silent pass and NOT a hard block: a loud
  `WARN: swiftdesigncheck not found; iOS design floor skipped` plus an auditable sidecar marker
  `.orca/orchestration/temp/ios-floor-status = skipped-no-detector`. The `ios-design-validator` already
  failed CLOSED upstream if the binary was absent, so the floor need not re-block here. The orchestrator
  mirrors this on the phase_state side as `gates.ios_design_lane.floor: "skipped-no-detector"`.

### Validator fail-closed (web parity with iOS)

The `design-validator` (web) keys its verdict off the detector exit code and is **fail-closed**, matching
`ios-design-validator`:

- `EXIT=0` (clean) or `EXIT=2` (findings) → the detector produced a verdict; proceed.
- Any other exit (`1`, `127`, ...) → `GATE_VERDICT: BLOCK` with
  `UNSATISFIED_CONSTRAINTS: ["DETECTOR-ERROR"]`, then STOP. No fall-through to a read-the-file PASS.
- Detector binary / `node` missing → `GATE_VERDICT: BLOCK` with
  `UNSATISFIED_CONSTRAINTS: ["DETECTOR-UNAVAILABLE"]`, then STOP.

A design PASS now requires the detector to have actually run; a detector that did not run is a BLOCK,
never a silent pass.

### Scope-aware owner overrides

The hook honors owner overrides (`{project}/.design-overrides.json` + `active_overrides` in phase_state).
A detector finding is treated as covered ONLY IF an active override has `suppresses == finding-id` AND a
**non-empty** `scope` glob (`**` / `*` / `?`, compiled to an anchored regex over the full path) that
MATCHES the finding's file path. An empty/missing `scope` suppresses NOTHING — the narrowing invariant
(`docs/concepts/design-overrides-schema.md`).

### Attempts cap (N=2, then escalate)

The lane caps builder retries at N=2. A design gate PASS written with `gates.<lane>.attempts > 2` and no
sibling `gates.<lane>.escalated: true` is BLOCKED (exit 2) — the lane never silently ships a runaway loop.
`escalated: true` is the sanctioned exit and is set only after the orchestrator surfaces the unresolved
findings to the user.

---

## Dev-Lane Standards Score Gate (`hooks/gate-enforcement.sh`)

Separate from the design-lane floor above, the dev lanes carry a **numeric** standards-score gate. The
canonical contract lives in `docs/reference/gate-contract.md`: on the standards-enforcer result each lane
writes

```json
{ "gates": { "standards": { "score": 93, "threshold": 90, "gate_decision": "PASS", "lane": "ios" } } }
```

to `phase_state.json`. When `gates.standards.gate_decision == "PASS"`, `hooks/gate-enforcement.sh`
exit-2 BLOCKS if the `score` is absent or non-numeric (a fabricated PASS — a PASS with no measurement) or
if `score < threshold` (default 90). This makes each lane's "hard block < 90" prose mechanically real.
When the decision is not PASS, or there is no `gates.standards` object, the hook does nothing (non-adopting
lanes are unaffected).

**Adopting lanes:** iOS (`/ios`), Expo (`/expo`), Django + React (`/django-react`). **Next.js (`/nextjs`)
adopts the same contract in Phase 5** when the command is restored. Planning commands, verb-skill cognition
loops, and research prose gates are explicitly OUT of this numeric gate (calibration boundary, FR-4.4).

**Django + React two-stack rule:** the enforced `score` is `min(backend_score, frontend_score)` (with
`backend_score` / `frontend_score` kept as detail fields), so a single failing stack blocks.

The corrective-pass loop increments `gates.standards.attempts`, mirroring the design-lane `attempts`
convention (`docs/reference/design-lane.md`).

---

## Where Evidence Lives

```
<project>/.claude/
  memory/
    code-index.db              # Local code/doc context with embeddings
  orchestration/
    phase_state.json           # Gate results, verification status
    evidence/                  # Final artifacts
      screenshots/             # UI evidence
      audit-*.md               # Audit reports (from /audit)
      verification-*.md        # Verification reports
    temp/                      # Working files (clean up after)
  requirements/                # Planning outputs
    YYYY-MM-DD-HHMM-<slug>/
      06-requirements-spec.md
```

---

## Manual Verification (Edge Cases Only)

Use manual verification ONLY when:
- Working outside pipeline (rare)
- Testing edge cases not covered by automated checks
- Debugging verification failures

### Manual Evidence Capture

```bash
# Build logs (Next.js/Expo)
npm run build 2>&1 | tee .orca/orchestration/evidence/build-$(date +%Y%m%d-%H%M%S).log

# Test logs
npm run test 2>&1 | tee .orca/orchestration/evidence/test-$(date +%Y%m%d-%H%M%S).log

# iOS build
xcodebuild clean build 2>&1 | tee .orca/orchestration/evidence/build-$(date +%Y%m%d-%H%M%S).log

# iOS tests
xcodebuild test 2>&1 | tee .orca/orchestration/evidence/test-$(date +%Y%m%d-%H%M%S).log

# iOS screenshots
xcrun simctl io booted screenshot .orca/orchestration/evidence/screenshots/after-$(date +%s).png
```

---

## Verification Failures (Troubleshooting)

### Gate Score in WARN Range (80-89)
Pipeline continues. Issues are logged for optional fix. Net Positive may promote to PASS.

### Gate Score in ERROR Range (70-79)
Pipeline pauses. User is asked: "Found X issues. Fix now or proceed anyway?"
- Fix: Orchestrator delegates to builder for corrective pass, then re-runs gate.
- Proceed: Issues logged, pipeline continues.

### Gate Score BLOCK (< 70)
Pipeline stops. Must fix issues before continuing. No user override.

### Build/Test Failure
- Verification agent reports FAIL with specific error output
- Orchestrator delegates back to builder agent to fix
- Re-runs verification after fix

---

## Response Awareness Tags

Tags recorded automatically in `/requirements` output and scanned by standards enforcers:

- `#COMPLETION_DRIVE` -- Assumptions made without explicit requirements
- `#CARGO_CULT` -- Patterns followed without clear justification
- `#PATH_DECISION` -- Explicit decisions (documented, not penalized)
- `#POISON_PATH` -- Flagged anti-patterns
- `#CONTEXT_DEGRADED` -- Known missing context

`/audit "last 10 tasks"` analyzes these tags for patterns across sessions.

---

## Deploy-Safety Guard (repo <-> ~/.claude drift)

Deployment can drift in BOTH directions: the repo is the source of truth, but some deployed files in `~/.claude` are knowingly newer than the repo (a live redesign shipped straight to `~/.claude`). A naive repo -> `~/.claude` rsync would destroy that live work. Two artifacts protect against this:

- **`scripts/deploy-protected.txt`** -- the canonical protected list consumed by every deploy path. It names the SC-1 cognition-direct command family (`think`, `deepthink`, `problem-solve`, `challenge`, `meta`, `root-cause`, `adversarial`, `think-model`, `contemplate`, `solve`, `autonomous`). These files are NEVER synced in either direction. The list is wired into the manual sync block (`CLAUDE.md`) and `hooks/auto-deploy.sh` as an `--exclude-from` scoped to the `commands/` dir.
- **`scripts/deploy-diff.sh`** -- a content-based (`cksum`, not mtime) drift check. For each of `commands agents skills hooks scripts docs/reference docs/pipelines bin` it walks both the repo and `~/.claude` and classifies every file:

| Class | Meaning |
|-------|---------|
| SAME | content identical on both sides |
| REPO-NEWER | content differs; repo side looks newer |
| DEPLOYED-NEWER | content differs; deployed side looks newer -- do NOT clobber |
| REPO-ONLY | in repo, not deployed |
| DEPLOYED-ONLY | deployed, not in repo |
| PROTECTED | basename matches `deploy-protected.txt`; reported only, never actioned |

Usage:
```bash
bash scripts/deploy-diff.sh                 # full per-class listing
bash scripts/deploy-diff.sh --quiet         # summary counts only
bash scripts/deploy-diff.sh --protected-list <path>   # override the protected list
```

Exit is non-zero when any NON-protected drift class is non-empty, so `verify-health.sh` can consume the exit code. **DEPLOYED-NEWER on a non-protected file means reconcile before deploying; direction is the owner's call.** PROTECTED files (SC-1) are excluded from the drift exit code and never synced.

---

## orca-lint (repo reality checker)

`scripts/orca-lint.py` is a stdlib-only Python 3 reality checker for the ORCA-OS repo itself (no pip deps). It is the acceptance instrument for the audit-remediation program: it independently rediscovers dead references, phantom agents, graph miscounts, and version drift so regressions are visible. It runs from any working directory (paths resolve against the repo root).

### The seven checks

| Check | What it flags |
|-------|---------------|
| **DEAD-FILE** | Path references in `commands/*.md`, `agents/**/*.md`, `skills/*/SKILL.md` that resolve to nothing. Only paths inside inline backticks or markdown links are considered (bare prose, table cells, and fenced code blocks are ignored). A `~/.claude/X` ref counts as satisfied when the repo-relative `X` exists (the repo is source of truth). |
| **DEAD-AGENT** | `subagent_type=`/`subagent_type:` values and backtick roster names that have no matching agent file. Inventory-driven (every `agents/**/*.md` basename); Claude Code built-ins (`Explore`, `general-purpose`, ...) are allowlisted. |
| **COLLISION** | `commands/<n>.md` that collides with `skills/<n>/` (Claude merges the namespace and the skill wins). |
| **GRAPH** | `docs/reference/os-dependency-graph.yaml`: every file/agent/skill named exists; each lane's `agent_count` == listed agents == `agents/<lane>/` directory reality; `used_by` edges name existing commands. |
| **VERSION** | `OS x.y` strings in `commands/*.md` and `docs/**` that differ from the canonical version read from the `CLAUDE.md` footer. Historical surfaces (`docs/research/`, `changelog.md`, `era:`-tagged docs) are excluded. |
| **FRONTMATTER** | Agent `tools:` given as a YAML list instead of a comma-separated string; a `model:` key in agent frontmatter; command frontmatter with an unclosed `---` block. |
| **DRIFT** | Delegates to `scripts/deploy-diff.sh --quiet` and surfaces its summary. **Informational only** -- never affects the exit code. |

### Output and flags

Findings print as `file:line: [CATEGORY] message`, followed by per-category counts (active / baseline / informational).

- default: run all checks, print findings, **exit 0** (non-fatal) so first runs on a dirty tree are usable.
- `--strict`: exit non-zero if ANY non-baseline, non-informational finding exists.
- `--baseline <path>` (default `scripts/orca-lint-baseline.txt`): suppress listed known findings from the failure set; suppressed findings still print, tagged `[BASELINE]`. The match key is a normalized `category|identifier` line -- the format and per-category identifier normalization are documented in the baseline file header.
- `--no-drift`: skip the DRIFT check (used by verify-health; drift is informational anyway).
- `--json`: machine-readable output.

### Baseline (known debt)

`scripts/orca-lint-baseline.txt` seeds the pre-existing findings from the 2026-07-03 command-surface audit (dead hub path, phantom nextjs agents, archived orchestrator tiers, graph miscounts, `OS 7.0` strings, ...). It is **known debt to be burned down by later remediation phases**: as each item is fixed, its line is removed; the end-state goal is a header-only baseline. On today's tree `orca-lint.py --strict --baseline scripts/orca-lint-baseline.txt` exits 0 (only a NEW finding flips it).

### Wired into verify-health

`verify-health.sh` runs orca-lint as check section 6 with `--strict --baseline ... --no-drift`. Known debt is suppressed, so the health tally stays green; only a new (non-baseline) finding fails the check.

```bash
python3 scripts/orca-lint.py                                   # all checks, non-fatal
python3 scripts/orca-lint.py --strict --baseline scripts/orca-lint-baseline.txt
python3 scripts/orca-lint.py --json                            # machine output
```

---

## Related Docs

- **Gate Scoring Standard:** `docs/reference/graduated-gate-scoring.md`
- **Commands:** `quick-reference/ORCA-OS/ORCA-commands.md`
- **Agents:** `quick-reference/ORCA-OS/ORCA-agents.md`
- **Architecture:** `quick-reference/ORCA-OS/ORCA-architecture.md`
- **Recording:** `quick-reference/ORCA-OS/ORCA-recording.md`

---

_OS 7.0 verification is automatic, graduated, and evidence-based. Manual verification is rarely needed._
