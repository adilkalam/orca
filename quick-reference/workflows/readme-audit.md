# /audit Quick Reference

**Type:** Standalone Diagnostic (Agentless)
**Entrypoint:** `/audit [--comprehensive | --core | --item <target> | --documentation [--comprehensive]] [--since <commit>] [--verbose]`

---

## 1. TL;DR

```bash
/audit                        # Quick health check (~10 min, 3 dimensions)
/audit --core                 # Core analysis (~25 min, 5 dimensions)
/audit --comprehensive        # Full due diligence (~60-90 min, 8 dimensions)
/audit --item design-system   # Focused audit on specific area
/audit --item page /checkout  # Audit specific page/route
/audit --documentation        # Doc verification (~20-30 min, sampled key docs)
/audit --documentation --comprehensive  # Exhaustive doc verification (every file)
/audit --since abc1234        # Incremental since commit
/audit --verbose              # Full findings (default: TL;DR only)
```

**Zero agents.** All verification is performed directly by the executing agent using evidence-based protocols. No subagent delegation.

---

## 2. Quality Dimensions

| # | Dimension | Weight | Execution Order |
|---|-----------|--------|-----------------|
| 1 | Structure Quality | 0.10 | 1st |
| 2 | Security Posture | 0.20 | 2nd |
| 3 | Dependency Health | 0.15 | 3rd |
| 4 | Pattern Consistency | 0.10 | 4th |
| 5 | Architecture Health | 0.15 | 5th |
| 6 | Test Quality | 0.15 | 6th |
| 7 | Documentation Quality | 0.10 | 7th |
| 8 | Design Integrity* | 0.05 | 8th |

*Design only for UI projects; weight redistributed if N/A.

---

## 3. Mode Mapping

| Mode | Dimensions | Execution | Duration |
|------|------------|-----------|----------|
| quick (default) | Structure, Security, Dependencies | Sequential direct verification, 3 dimensions | ~10 min |
| core | + Patterns, Documentation | Sequential direct verification, 5 dimensions | ~25 min |
| comprehensive | All 8 (7 for non-UI) | Sequential direct verification, all dimensions | ~60-90 min |
| item | Varies by target | Scoped verification on matched files/directory | ~10-15 min |
| documentation | 6 verification ops | Direct 6-OP verification against filesystem truth | ~20-30 min |
| documentation --comprehensive | 6 ops, all files | Direct 6-OP verification, every doc file | No limit |

---

## 4. Execution Flow

```
Phase 0: Parse args, detect project type, init temp
    |
Phase 1: Discovery -- file tree scan, infrastructure map
    |
Phase 2: Sequential Dimension Execution (DISCOVER -> VERIFY -> RECORD)
    |    Evidence trail per dimension, Scan-Verify-Release context cycle
Phase 3: Aggregation -- weighted scores, severity ranking, stable IDs
    |
Phase 4: Report -- markdown to .claude/audit/, update index, cleanup
```

---

## 5. Evidence Trail

Every verification step produces structured evidence. A verdict without stating what verification was performed is invalid.

```
[FINDING|CLEAN]: [title]
  Claim:        [what was expected]
  Verification: [what command/read was performed]
  Result:       [details or confirmation]
  Location:     [file:line]
  Deduction:    -N (rule_name) | 0
```

Written to `.claude/audit/temp/<dimension>.md` per dimension, aggregated into the final report.

---

## 6. Output Locations

| Artifact | Location |
|----------|----------|
| Report | `.claude/audit/YYYY-MM-DD-<mode>.md` |
| Index | `.claude/audit/audit-index.json` |
| Temp (during run) | `.claude/audit/temp/` (cleaned up after report) |

---

## 7. Grade Mapping

| Score | Grade | Risk | Recommendation |
|-------|-------|------|----------------|
| 90-100 | A | Low | PROCEED |
| 80-89 | B | Low | PROCEED WITH MINOR FIXES |
| 70-79 | C | Medium | ACQUIRE WITH REMEDIATION PLAN |
| 60-69 | D | High | SIGNIFICANT REMEDIATION REQUIRED |
| <60 | F | Critical | DO NOT PROCEED |

---

## 8. Key Deduction Rules

| Dimension | Rule | Deduction | Cap |
|-----------|------|-----------|-----|
| Security (0.20) | exposed_secret | -25 each | Caps at 50 |
| Security | http_endpoint | -10 each | -30 |
| Dependencies (0.15) | critical_vulnerability | -15 each | None |
| Dependencies | outdated_1year | -5 each | -20 |
| Architecture (0.15) | circular_dependency | -10 each | None |
| Architecture | boundary_violation | -5 each | -20 |

Full deduction tables in `commands/audit.md`.

---

## 9. Finding IDs

Format: `AUD-2026-001` (prefix-year-sequence). IDs persist via content hash: `sha256(type:location:title)`.

---

## 10. Incremental Mode

`/audit --since abc1234` scopes all dimension checks to changed files only. Reports show NEW findings, RESOLVED findings, and UNCHANGED context from last full audit. Use for CI/PR reviews.

---

## 11. Documentation Verification Mode

`/audit --documentation` verifies documentation **content** against filesystem ground truth using 6 mechanical operations:

| OP | Operation | What It Catches |
|----|-----------|----------------|
| 1 | Count Verification | "131 agents" when actual is 123 |
| 2 | Link Target | Broken `[text](path)` links |
| 3 | Command/Flag | References to `/plan` (does not exist) |
| 4 | Version String | Stale "OS 6.4" references |
| 5 | Infrastructure | Paths to removed systems |
| 6 | List Completeness | Tables missing items or listing phantoms |

The executing agent builds a ground-truth inventory (counts AND item names), then runs all 6 OPs per file sequentially. Self-validation catches coverage gaps and suspicious clean scores. Findings are deduplicated into root causes (5 files with wrong count = 1 root cause, 5 instances).

`--documentation --since` is not supported.

---

## 12. Example Report Header

```
# Due Diligence Audit: MyProject

**Date:** 2026-01-22 | **Score:** 78/100 (C) | **Risk:** Medium
**Mode:** Comprehensive | **Dimensions:** 8

## TL;DR
- 2 critical, 5 high, 12 medium, 8 low findings
- Security posture needs attention (65/100)
- Strong test coverage (88/100)

## Recommendation
ACQUIRE WITH REMEDIATION PLAN
```

---

## 13. Tips and Guardrails

**Usage tips:**
1. Start with quick (`/audit`) for daily health checks
2. Go comprehensive pre-release for full due diligence
3. Track trends via audit-index.json score history
4. Use `--item` for focused deep dives, `--since` for PR reviews

**Guardrails:**
- Audit NEVER modifies code (read-only inspection)
- Every CLEAN verdict must include verification evidence
- Every FINDING must include the claim, verification method, and result
- Independent of `/orca-*` pipelines -- does not block development
- Context managed via Scan-Verify-Release cycle per dimension

---

_Version: OS 7.0 | Audit v2.0 (agentless)_
