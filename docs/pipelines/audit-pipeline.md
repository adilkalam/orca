# Audit Pipeline

**Status:** OS 7.0 Standalone Diagnostic
**Type:** `audit` (NOT an /orca pipeline)
**Last Updated:** 2026-03-03

## Overview

The Audit pipeline is a **standalone due diligence tool** for investor-grade codebase quality assessment. Unlike `/orca-*` pipelines which gate feature development, `/audit` runs independently to evaluate quality, consistency, and risk.

**Authoritative command spec:** `commands/audit.md`

**Agentless architecture:** All verification is performed directly by the executing agent using structured per-dimension protocols. No subagent delegation. Every check produces a CLAIM, VERIFICATION, and RESULT triple, making verification work transparent and gaps detectable.

---

## Core Principles

1. **Read-only inspection** -- Audit NEVER modifies code.
2. **Direct execution** -- No subagents. The executing agent performs all checks sequentially.
3. **Evidence-based** -- Every finding and every clean verdict includes the verification performed.
4. **Weighted scoring** -- Security weighted highest (0.20), design lowest (0.05).
5. **Stable finding IDs** -- IDs persist across audits via content hash.
6. **Independent operation** -- Not tied to any /orca pipeline gates.

---

## Pipeline Architecture

```
/audit [--comprehensive | --core | --item | --documentation] [--since <commit>]
    |
    v
[Phase 0: Parse/Configure] (~1 min)
    Parse arguments, detect project type, determine dimensions, init temp
    |
    v
[Phase 1: Discovery] (~2-3 min)
    File tree scan, infrastructure detection, build project map
    |
    v
[Phase 2: Dimension Execution] (10-60 min)
    Sequential execution: DISCOVER -> VERIFY -> RECORD per dimension
    Every check produces: CLAIM + VERIFICATION + RESULT
    |
    v
[Phase 3: Report] (~2-3 min)
    Score, rank findings, assign IDs, generate report, update index, cleanup
```

---

## Quality Dimensions

| # | Dimension | Weight | Focus |
|---|-----------|--------|-------|
| 1 | Structure Quality | 0.10 | Dead code, naming, organization |
| 2 | Security Posture | 0.20 | Secrets, auth, validation |
| 3 | Dependency Health | 0.15 | Vulnerabilities, outdated, unused |
| 4 | Pattern Consistency | 0.10 | Anti-patterns, style violations |
| 5 | Architecture Health | 0.15 | Circular deps, coupling, boundaries |
| 6 | Test Quality | 0.15 | Coverage, assertions, flakiness |
| 7 | Documentation Quality | 0.10 | Stale, missing, inaccurate docs |
| 8 | Design Integrity | 0.05* | Tokens, components, consistency |

*Design Integrity only applies to UI projects; weight redistributed if N/A.

### Mode Mapping

| Mode | Dimensions | Duration |
|------|------------|----------|
| quick (default) | Structure, Security, Dependencies | ~10 min |
| core | + Patterns, Documentation | ~25 min |
| comprehensive | All 8 (7 for non-UI) | ~60-90 min |
| --item | Varies by target | ~10-15 min |
| --documentation | Documentation sub-pipeline (6 OPs) | ~20-30 min |

---

## Evidence Trail Format

Every verification step produces evidence in this structure:

```
[FINDING|CLEAN]: [title]
  Claim:        [what was expected or asserted]
  Verification: [what command/read was performed]
  Result:       [FINDING with details | CLEAN with confirmation]
  Location:     [file:line]
  Deduction:    -N (rule_name) | 0
```

A CLEAN result without stating the verification performed is invalid. Gaps in evidence are visible gaps in verification.

---

## Per-Dimension Protocols

Dimensions execute sequentially in fixed order. Each follows DISCOVER -> VERIFY -> RECORD. Evidence is written to `.claude/audit/temp/<dimension>.md` after each dimension.

**Execution order:** Structure -> Security -> Dependencies -> Patterns -> Architecture -> Tests -> Documentation -> Design

### Structure Quality (weight: 0.10)

| Check | Method | Deduction |
|-------|--------|-----------|
| Giant files (>500 lines) | `wc -l` on all source files | -5 each (cap -20) |
| Dead code files | Grep for inbound imports; 0 references = dead | -5 each (cap -25) |
| Naming inconsistency | Extract naming convention per directory, flag mixed | -3 each (cap -20) |
| Poor organization | Check directory depth, scattered concerns | -5 to -15 |

### Security Posture (weight: 0.20)

| Check | Method | Deduction |
|-------|--------|-----------|
| Exposed secrets | Grep for `sk[_-]live`, `AKIA`, hardcoded passwords/keys | -25 each (CRITICAL, caps at 50) |
| HTTP endpoints | Grep for `http://` in source (exclude localhost/tests) | -10 each (cap -30) |
| Missing validation | Read request handlers, check sanitization | -5 each (cap -20) |
| Insecure storage | Grep for localStorage/sessionStorage with sensitive patterns | -15 each |

### Dependency Health (weight: 0.15)

| Check | Method | Deduction |
|-------|--------|-----------|
| Critical vulnerabilities | `npm audit --json` or equivalent | -15 each |
| High vulnerabilities | Same audit output, high severity | -8 each |
| Outdated (>1 year) | `npm outdated` or equivalent | -5 each (cap -20) |
| Unused dependencies | Grep source for import/require of each dependency | -2 each (cap -10) |

### Pattern Consistency (weight: 0.10)

| Check | Method | Deduction |
|-------|--------|-----------|
| Anti-patterns | God files, deep nesting, prop drilling, any-type | -5 each (cap -25) |
| Inconsistent error handling | Identify dominant pattern, flag deviations | -3 each (cap -15) |
| Mixed paradigms | Mixed state management, HTTP clients, test frameworks | -5 each (cap -20) |
| Style inconsistency | Inconsistent exports, file organization, naming | -2 each (cap -10) |

### Architecture Health (weight: 0.15)

| Check | Method | Deduction |
|-------|--------|-----------|
| Circular dependencies | Trace import chains for cycles | -10 each (no cap) |
| High coupling | Count cross-boundary imports per module (>10 = high) | -5 each (cap -20) |
| Low cohesion | Files within a module that share no concerns | -5 each (cap -15) |
| Boundary violations | UI importing from data layer, shared importing features | -5 each (cap -20) |

### Test Quality (weight: 0.15)

| Check | Method | Deduction |
|-------|--------|-----------|
| Low coverage | Compare test file count to source count (<60%) | -10 |
| Missing assertions | Read test files, check for meaningful assertions | -5 per file (cap -20) |
| Shared state | Grep for global mutable state, missing cleanup | -5 each (cap -15) |
| Flakiness indicators | Grep for setTimeout, sleep, Date.now in tests | -3 each (cap -15) |

### Documentation Quality (weight: 0.10)

| Check | Method | Deduction |
|-------|--------|-----------|
| Missing critical docs | Check for README, setup instructions, API docs | -10 each (no cap) |
| Stale documentation | Compare doc mtime to source mtime (>6 months) | -5 each (cap -20) |
| Inaccurate claims | Spot-check 3-5 concrete claims against code | -8 each (cap -25) |
| Incomplete docs | Key exports with no JSDoc/docstring | -3 each (cap -15) |

### Design Integrity (weight: 0.05, UI only)

Skip if `projectType === 'cli'` or no UI framework detected; redistribute weight.

| Check | Method | Deduction |
|-------|--------|-----------|
| Hardcoded values | Grep for hex colors, pixel values in style props | -3 each (cap -15) |
| Inconsistent components | Compare 3-5 similar components for structure | -5 each (cap -15) |
| Missing accessibility | Grep for `<img` without `alt`, buttons without labels | -3 each (cap -15) |
| Token compliance | Check that components use tokens, not raw values | -3 each (cap -15) |

---

## Documentation Sub-Pipeline (--documentation)

When `--documentation` is specified, the standard dimension pipeline is bypassed. All documentation verification is performed directly using 6 structured operations. Two sub-modes: `--documentation` (sampled, ~20-30 min) and `--documentation --comprehensive` (exhaustive, no time limit). Combining `--documentation --since` is invalid.

### Phases

1. **Build Inventory** (~1-2 min): Enumerate ground-truth counts AND item names via bash/glob. Store in `.claude/audit/temp/inventory.md`.
2. **Per-File Verification** (sequential): Apply all 6 OPs per file with explicit evidence.
3. **Self-Validation**: Coverage, suspicious patterns, evidence spot-check.
4. **Root Cause Deduplication**: Group findings, rank by instance count.

### The 6 Verification Operations

| # | Operation | Trigger | Deduction |
|---|-----------|---------|-----------|
| OP-1 | Count Verification | Number adjacent to countable noun | -3 each |
| OP-2 | Link Target Verification | Markdown `[text](path)` links | -5 each |
| OP-3 | Command/Flag Verification | Backtick `/command` or `--flag` | -5 each |
| OP-4 | Version String Verification | `OS X.Y`, `vX.Y.Z` patterns | -1 each (cap -15) |
| OP-5 | Infrastructure Existence | Backtick-enclosed paths | -3 each |
| OP-6 | List Completeness | Tables/lists vs canonical sources | -3 per item (cap -25/list) |

### Self-Validation and Deduplication

After all files: (1) Coverage check -- comprehensive mode requires 95%+ file coverage. (2) Suspicious patterns -- score > 90 with zero root causes triggers META-WARNING. (3) Operation coverage -- any OP with zero runs is a critical META-WARNING. (4) Evidence spot-check -- re-read 3 CLEAN files, verify one claim each.

Then group findings by root cause key `operation:canonicalSourceId:expectedValue` and rank by instance count descending.

---

## Scoring System

Each dimension starts at 100 with deductions per finding (rules listed in per-dimension protocols above). Overall: `SUM(dimensionScore * dimensionWeight)`. If design is N/A, its weight (0.05) is redistributed equally.

### Grade Mapping

| Score | Grade | Risk Level | Recommendation |
|-------|-------|------------|----------------|
| 90-100 | A | Low | PROCEED |
| 80-89 | B | Low | PROCEED WITH MINOR FIXES |
| 70-79 | C | Medium | ACQUIRE WITH REMEDIATION PLAN |
| 60-69 | D | High | SIGNIFICANT REMEDIATION REQUIRED |
| 0-59 | F | Critical | DO NOT PROCEED / MAJOR OVERHAUL |

Finding IDs persist across audits via content hash: `sha256(type:location:title).slice(0,8)`. Format: `AUD-YYYY-NNN`. The audit index at `.claude/audit/audit-index.json` tracks firstSeen, lastSeen, and status for trend tracking.

---

## Incremental Mode (--since)

When `--since <commit>` is specified: get changed files via `git diff --name-only <commit>..HEAD`, scope all dimension checks to changed files only, compare against last full audit, and report NEW, RESOLVED, and UNCHANGED findings.

---

## Report Output

Standard reports: `.claude/audit/YYYY-MM-DD-<mode>.md` -- header, TL;DR, recommendation, score trend, per-dimension scorecards with evidence, findings ranked by severity.

Documentation reports: `.claude/audit/YYYY-MM-DD-documentation.md` -- root cause analysis and per-operation statistics.

---

## Guardrails

- Audit NEVER modifies code (read-only inspection).
- Audit findings are SUGGESTIONS, not automatic fixes.
- Scores are indicative, not absolute quality measures.
- Finding IDs are stable across audits (via content hash).
- Every CLEAN verdict must include verification evidence.
- Every FINDING must include the claim, verification method, and result.
- Temp files cleaned up after report generation.

---

## Response Awareness

During audit execution:

- `#COMPLETION_DRIVE`: Note when guessing vs. verifying finding severity.
- `#PATH_DECISION`: Document why certain files were sampled vs. skipped.
- `#POISON_PATH`: Avoid false positives that waste user time.

---

_Version: OS 7.0 | Audit Pipeline v2.0_
