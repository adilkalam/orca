# Graduated Gate Scoring Standard (OS 4.2)

**Version:** 3.0.0
**Status:** Active
**Effective:** Phase 1 of OS 4.2 migration

---

## Overview

All gate agents (enforcers, reviewers, validators) MUST use this graduated scoring standard instead of binary pass/fail.

This replaces the previous "90 threshold" binary gate with a graduated system that gives users control over strictness.

---

## Score Tiers

| Score Range | Gate Decision | Behavior | User Action Required |
|-------------|---------------|----------|---------------------|
| >= 90 | **PASS** | Continue pipeline | None |
| 80-89 | **WARN** | Continue, note issues | Optional fix |
| 70-79 | **ERROR** | Pause, suggest fixes | User decides: fix or proceed |
| < 70 | **BLOCK** | Stop pipeline | Must fix before continuing |

---

## Gate Decision Semantics

### PASS (Score >= 90)
- No critical issues
- Minor improvements may be noted but don't block
- Pipeline continues automatically
- Output: `gate_decision: "PASS"`

### WARN (Score 80-89)
- Issues found but not critical
- Pipeline continues but issues are logged
- User notified: "X issues found, consider fixing"
- Output: `gate_decision: "WARN", issues: [...]`

### ERROR (Score 70-79)
- Significant issues that should be addressed
- Pipeline pauses for user decision
- Present: "Found X issues. Fix now or proceed anyway?"
- If user says "proceed": continue with issues logged
- If user says "fix": trigger corrective pass
- Output: `gate_decision: "ERROR", issues: [...], awaiting_user_decision: true`

### BLOCK (Score < 70)
- Critical issues that cannot be ignored
- Pipeline stops
- Must fix before continuing
- No user override available
- Output: `gate_decision: "BLOCK", issues: [...], blocking: true`

---

## Scoring Methodology

### Base Score
Start at 100, deduct based on violations:

### Deduction Scale
| Severity | Points Deducted | Examples |
|----------|-----------------|----------|
| Critical | -15 to -25 | Security vulnerability, broken functionality, missing required props |
| High | -10 to -15 | Design token violation, pattern anti-pattern, accessibility failure |
| Medium | -5 to -10 | Code style violation, minor inconsistency |
| Low | -1 to -5 | Suggestions, nice-to-haves |

### Severity Classification

**Critical (always deduct -15 to -25):**
- Security vulnerabilities (exposed secrets, injection risks)
- Functionality broken (app won't build/run)
- Accessibility blockers (missing labels on interactive elements)
- Data loss risks

**High (always deduct -10 to -15):**
- Design token violations (inline styles where tokens exist)
- Architecture violations (wrong RSC/client boundaries)
- WCAG AA failures (contrast, touch targets)
- Pattern violations (documented anti-patterns)

**Medium (always deduct -5 to -10):**
- Code style inconsistencies
- Missing error handling
- Suboptimal patterns (not anti-patterns)
- Documentation gaps

**Low (always deduct -1 to -5):**
- Naming suggestions
- Optional enhancements
- Future improvement opportunities

---

## Gate-Specific Thresholds

Different gates may have different base sensitivities:

### Standards Enforcer
- Default threshold: standard (90/80/70)
- Focuses on: code patterns, architecture, TypeScript

### Design Reviewer
- Default threshold: standard (90/80/70)
- Focuses on: visual consistency, spacing, typography

### A11y Enforcer
- Default threshold: strict (95/85/70)
- Reason: accessibility failures cause App Store rejection
- Focuses on: labels, contrast, touch targets

### Security Specialist
- Default threshold: strict (95/90/80)
- Reason: security issues are high-impact
- Focuses on: secrets, injection, auth

### Performance Enforcer
- Default threshold: lenient (85/75/65)
- Reason: performance is often iterative
- Focuses on: bundle size, render performance

---

## User-Configurable Thresholds

Users can override thresholds via:

### Project-level (`.claude/config.json`)
```json
{
  "gate_thresholds": {
    "default": "standard",
    "standards": "strict",
    "design": "lenient",
    "a11y": "strict"
  }
}
```

### Command-level flag
```bash
/nextjs --gates=lenient "fix the button"
/nextjs --gates=strict "implement checkout"
```

### Threshold Presets
| Preset | PASS | WARN | ERROR | BLOCK |
|--------|------|------|-------|-------|
| strict | >=95 | 85-94 | 75-84 | <75 |
| standard | >=90 | 80-89 | 70-79 | <70 |
| lenient | >=85 | 75-84 | 65-74 | <65 |

---

## Triage Labels (OS 3.1)

All violations MUST include a triage label for quick scanning:

| Severity | Triage Label | Usage |
|----------|--------------|-------|
| Critical | [Critical] | Must fix, blocks pipeline |
| High | [Critical] | Must fix, blocks pipeline |
| Medium | [Improvement] | Should fix, doesn't block |
| Low | [Nit] | Nice to have, optional |

### Triage Label Output Format

Each violation in human-readable output MUST use this format:

```
{label} {file}:{line} - {message}
```

Example:
```
[Critical] src/auth/AuthService.ts:42 - SQL injection vulnerability in user input
[Improvement] src/hooks/useAuth.ts:128 - Missing error boundary for API call
[Nit] src/utils/helpers.ts:15 - Consider extracting to separate utility
```

This enables quick visual scanning and prioritization of violations.

---

## Output Format

All gates MUST output in this format:

```yaml
gate_result:
  gate_name: "nextjs-standards-enforcer"
  score: 85
  gate_decision: "WARN"  # PASS | WARN | ERROR | BLOCK
  threshold_used: "standard"

  violations:
    - severity: "high"
      triage_label: "[Critical]"
      file: "src/components/Button.tsx"
      line: 42
      rule: "design-token-required"
      message: "Inline color #333 should use var(--color-text)"
      suggested_fix: "Replace #333 with var(--color-text)"

    - severity: "medium"
      triage_label: "[Improvement]"
      file: "src/components/Button.tsx"
      line: 15
      rule: "component-size"
      message: "Component exceeds 50 lines (67 lines)"
      suggested_fix: "Extract helper functions or split component"

  summary:
    critical: 0
    high: 1
    medium: 1
    low: 0
    total: 2

  # For ERROR decisions only
  awaiting_user_decision: false

  # For BLOCK decisions only
  blocking: true
  must_fix:
    - "Address high-severity design token violation before proceeding"

  # Net Positive override (if applicable)
  net_positive_override: false
  promotion_reason: null
```

---

## Net Positive Philosophy (OS 3.1)

Focus on whether the change improves overall quality, not perfection.

**Principle:** A few [Nit] issues don't block a solid improvement. Consider the change holistically, not just individual violations.

### Net Positive Auto-Promotion

When ALL of the following conditions are met:
1. Score is 80-89 (WARN range)
2. Zero [Critical] violations
3. At most 2 [Improvement] violations
4. Change type is feature/enhancement (NOT bugfix)
5. No security-related violations

Then: Promote `gate_decision` from WARN to PASS.

**Output when applied:**
```yaml
gate_decision: PASS
net_positive_override: true
promotion_reason: "Score 85 with 0 Critical, 1 Improvement - net positive feature"
```

### Lane-Specific Exceptions

| Lane | Net Positive Enabled | Reason |
|------|---------------------|--------|
| iOS | Yes | Standard gate behavior |
| Next.js | Yes | Standard gate behavior |
| OS-Dev | Yes (with safety override) | Safety violations still BLOCK |
| Django+React | **No** | 90/100 hard block for type safety |
| Security | **No** | All security gates strict |

---

## Migration Notes

### From OS 2.4 Binary Gates

Old behavior:
- Score >= 90: PASS
- Score < 90: FAIL (retry)

New behavior:
- Score >= 90: PASS (same)
- Score 80-89: WARN (continue with notes)
- Score 70-79: ERROR (user decides)
- Score < 70: BLOCK (must fix)

### Backward Compatibility

- Default threshold is "standard" (same as old 90 threshold for PASS)
- Gates that previously returned PASS still return PASS
- Gates that previously returned FAIL now return WARN/ERROR/BLOCK depending on score
- No breaking changes to phase_state.json structure

---

## Implementation Checklist

Gates updated (OS 4.2):
- [x] nextjs-standards-enforcer
- [x] nextjs-design-reviewer
- [x] nextjs-css-architecture-gate
- [x] ios-standards-enforcer
- [x] ios-ui-reviewer
- [x] os-dev-standards-enforcer
- [x] a11y-enforcer (STRICT threshold)
- [x] performance-enforcer (LENIENT threshold)
- [x] security-specialist (STRICT threshold)
- [x] expo-aesthetics-specialist
- [x] design-token-guardian
- [x] research-consistency-gate

---

*Part of OS 4.2 Phase 1: Foundation*
