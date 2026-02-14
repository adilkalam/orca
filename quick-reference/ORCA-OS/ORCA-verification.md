# Verification & Evidence Quick Reference (OS 6.0)

**Version:** OS 6.0
**Last Updated:** 2026-02-07

Verification in OS 6.0 is **automated** within pipelines. Gates use graduated scoring (PASS/WARN/ERROR/BLOCK), not binary pass/fail.

### Research Backing

The verification system draws on two research-backed patterns:

- **Reflexion** (Shinn et al., NeurIPS 2023): Agents that reflect on task feedback and persist lessons achieve 88% pass@1 on HumanEval vs 67% baseline. ORCA's gate-failure-to-Workshop-gotcha-to-improvement-bus loop implements this pattern.
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
npm run build 2>&1 | tee .claude/orchestration/evidence/build-$(date +%Y%m%d-%H%M%S).log

# Test logs
npm run test 2>&1 | tee .claude/orchestration/evidence/test-$(date +%Y%m%d-%H%M%S).log

# iOS build
xcodebuild clean build 2>&1 | tee .claude/orchestration/evidence/build-$(date +%Y%m%d-%H%M%S).log

# iOS tests
xcodebuild test 2>&1 | tee .claude/orchestration/evidence/test-$(date +%Y%m%d-%H%M%S).log

# iOS screenshots
xcrun simctl io booted screenshot .claude/orchestration/evidence/screenshots/after-$(date +%s).png
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

Tags recorded automatically in `/plan` output and scanned by standards enforcers:

- `#COMPLETION_DRIVE` -- Assumptions made without explicit requirements
- `#CARGO_CULT` -- Patterns followed without clear justification
- `#PATH_DECISION` -- Explicit decisions (documented, not penalized)
- `#POISON_PATH` -- Flagged anti-patterns
- `#CONTEXT_DEGRADED` -- Known missing context

`/audit "last 10 tasks"` analyzes these tags for patterns across sessions.

---

## Related Docs

- **Gate Scoring Standard:** `docs/reference/graduated-gate-scoring.md`
- **Commands:** `quick-reference/ORCA-OS/ORCA-commands.md`
- **Agents:** `quick-reference/ORCA-OS/ORCA-agents.md`
- **Architecture:** `quick-reference/ORCA-OS/ORCA-architecture.md`
- **Telemetry:** `quick-reference/ORCA-OS/ORCA-telemetry.md`

---

_OS 6.0 verification is automatic, graduated, and evidence-based. Manual verification is rarely needed._
