# Verification & Evidence Quick Reference (OS 4.2)

**Version:** OS 4.3
**Last Updated:** 2026-01-23

Verification in OS 4.2 is **automated** within pipelines. This guide covers manual verification for edge cases.

## Automated Verification

### How Verification Works Now

**Automatic in Pipelines:**
1. `/nextjs` → Implementation → **Standards Gate (≥90)** → **Design QA Gate (≥90)** → **Build/Test Verification (automatic)** → Done
2. `/ios` → Implementation → **Standards Gate (≥90)** → **UI Review Gate (≥90)** → **xcodebuild + tests (automatic)** → Done
3. `/expo` → Implementation → **Design Tokens** → **A11y** → **Performance** → **Security** → **Build/Test (automatic)** → Done

**What Changed from OS 2.4 → OS 4.2:**
-  No more manual `/finalize` script
-  Verification agents run automatically in Phase 6
-  Evidence captured automatically in `.claude/orchestration/evidence/`
-  Build/test results stored in phase_state.json
-  Gate scores enforced (≥90 or fail)

### Where Evidence Lives

```
<project>/.claude/
 project/
    phase_state.json          # Gate results, verification status
    vibe.db                    # Task history
 orchestration/
    evidence/                  # Final artifacts
       screenshots/           # UI evidence
       audit-*.md             # Audit reports (from /audit)
       verification-*.md      # Verification reports
    temp/                      # Working files (clean up after)
 requirements/                  # Planning outputs
     YYYY-MM-DD-HHMM-<slug>/
         06-requirements-spec.md
```

## Verification Agents (Automatic)

### Next.js Verification (`nextjs-verification-agent`)
**Runs:** Phase 6 (after gates pass)
**Checks:**
- `npm run build` succeeds
- `npm run test` passes
- `npm run lint` passes
- Reports results to orchestrator
- Stores evidence in phase_state.json

### iOS Verification (`ios-verification`)
**Runs:** Phase 7 (after gates pass)
**Checks:**
- `xcodebuild build` succeeds (all targets)
- `xcodebuild test` passes
- Swift syntax errors caught
- Reports results to orchestrator
- Stores evidence in phase_state.json

### Expo Verification (`expo-verification-agent`)
**Runs:** Phase 6 (after gates pass)
**Checks:**
- `expo doctor` health check
- `npm run build` or `eas build --local` succeeds
- `npm run test` passes
- Bundle size within budget
- Reports results to orchestrator
- Stores evidence in phase_state.json

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

# Screenshots (if MCP not available)
# Next.js:
# Visit http://localhost:3000, take screenshot, save to .claude/orchestration/evidence/screenshots/

# iOS:
xcrun simctl io booted screenshot .claude/orchestration/evidence/screenshots/after-$(date +%s).png
```

## Quality Gates

### Standards Gate (≥90 required)
**Agent:** domain-standards-enforcer
**Measures:**
- Code quality
- Best practices compliance
- No inline styles
- Design token usage
- No arbitrary values

**Result:** Numerical score
- ≥90 → PASS (continue)
- <90 → FAIL (iterate)

### Design QA Gate (≥90 required, UI only)
**Agent:** domain-design-reviewer / domain-ui-reviewer
**Measures:**
- Visual consistency
- Design system compliance
- Responsive behavior
- Typography hierarchy
- Spacing correctness

**Result:** Numerical score
- ≥90 → PASS (continue)
- <90 → FAIL (iterate)

### Build/Test Gate (PASS required)
**Agent:** domain-verification
**Measures:**
- Build succeeds
- All tests pass
- Linting passes
- No compilation errors

**Result:** PASS/FAIL
- PASS → Continue to completion
- FAIL → Block pipeline, fix issues

## Response Awareness Tags

Tags now recorded automatically in `/plan` output:

```markdown
## Assumptions

#COMPLETION_DRIVE: Assumed dark mode applies to all routes. User mentioned "main app" but didn't specify if auth pages are included. VALIDATE during implementation.

## Implementation Path

#PATH_DECISION: Chose Tailwind dark: classes over CSS variables because Tailwind integrates better with existing design system. Alternative: CSS custom properties (rejected - requires refactoring existing components).
```

**Meta-Audit:**
`/audit "last 10 tasks"` analyzes these tags for patterns:
- Scope creep (#CARGO_CULT)
- Premature completion (#RESOLUTION_PRESSURE)
- Unvalidated assumptions (#COMPLETION_DRIVE)

## Typical Flows

### Frontend Feature (Next.js)
```bash
# 1. Plan
/plan "Add dark mode toggle"

# 2. Implement (automatic verification)
/nextjs "Implement requirement 2025-11-24-1430-dark-mode using that spec"

# Pipeline automatically:
# - Confirms team (AskUserQuestion)
# - Implements feature
# - Runs standards gate (≥90)
# - Runs design QA gate (≥90)
# - Runs build/test verification
# - Reports results

# 3. Later: Meta-audit
/audit "last 5 tasks"
```

### iOS Feature
```bash
# 1. Plan
/plan "Add biometric authentication"

# 2. Implement (automatic verification)
/ios "Implement requirement 2025-11-24-1500-biometric-auth using that spec"

# Pipeline automatically:
# - Confirms team
# - Implements feature
# - Runs standards gate (≥90)
# - Runs UI review gate (≥90)
# - Runs xcodebuild + tests
# - Reports results
```

### Quick Fix (No Planning)
```bash
# Direct implementation for trivial tasks
/nextjs "Fix typo in homepage title"

# Pipeline still runs:
# - Team confirmation
# - Implementation
# - Standards gate
# - Build verification
```

## Verification Failures (Troubleshooting)

### Build Fails
**What happens:**
- Verification agent reports FAIL
- Orchestrator asks: "Build failed with error X. How should I proceed?"
- User clarifies issue
- Orchestrator delegates back to builder agent to fix
- Re-runs verification

**State preservation:** Pipeline continues from where it failed.

### Gate Score <90
**What happens:**
- Gate agent reports score (e.g., 85/100)
- Orchestrator delegates to builder to fix issues
- Re-runs gate
- Must reach ≥90 to pass

**Example:**
```
Standards Gate: 85/100
Issues:
- 3 inline styles found
- 2 arbitrary values used
- 1 magic number

Action: Delegating to nextjs-builder to fix...
[Builder fixes issues]
Standards Gate Re-run: 92/100 → PASS
```

### Screenshot Missing (UI Work)
**What happens:**
- Design QA gate flags missing visual evidence
- Orchestrator delegates to capture screenshot
- Evidence stored in `.claude/orchestration/evidence/screenshots/`
- Gate re-runs

## Deprecated Workflows (OS 2.2)

### Old Way (Manual)
```bash
 bash scripts/finalize.sh
 bash scripts/capture-build.sh
 bash scripts/capture-tests.sh
 Manual evidence collection
 Manual gate checking
```

### New Way (Automatic)
```bash
 /plan "feature"
 /orca-{domain} "implement requirement <id>"
 Verification happens automatically
 Evidence captured automatically
 Gates enforced automatically
```

## When Manual Verification Still Needed

**Almost never.** But if you must:

1. **Debugging gate failures:** Run build/test manually to see full output
2. **Pre-pipeline testing:** Quick sanity check before starting pipeline
3. **External tool integration:** Tools not integrated with verification agents

**For everything else:** Trust the pipeline.

## Related Docs

- **Commands:** `quick-reference/ORCA-OS/ORCA-commands.md`
- **Agents:** `quick-reference/ORCA-OS/ORCA-agents.md`
- **Architecture:** `quick-reference/ORCA-OS/ORCA-architecture.md`
- **Quality Gates:** `docs/reference/standards-gate.md`, `docs/reference/design-qa-gate.md`

---

_OS 3.1 verification is automatic, enforced, and evidence-based. Manual verification is rarely needed._
