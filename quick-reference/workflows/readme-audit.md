# /audit Quick Reference

**Type:** Standalone Diagnostic
**Entrypoint:** `/audit [--comprehensive | --core | --item <target>] [--since <commit>] [--verbose]`

---

## 1. TL;DR

```bash
/audit                        # Quick health check (5 min, 3 dimensions)
/audit --core                 # Core analysis (15 min, 5 dimensions)
/audit --comprehensive        # Full due diligence (45-60 min, 8 dimensions)
/audit --item design-system   # Focused audit on specific area
/audit --item page /checkout  # Audit specific page/route
/audit --since abc1234        # Incremental since commit
/audit --verbose              # Full findings (default: TL;DR only)
```

---

## 2. Quality Dimensions

| # | Dimension | Agent | Weight |
|---|-----------|-------|--------|
| 1 | Structure Quality | audit-structure-specialist | 0.10 |
| 2 | Dependency Health | audit-dependency-specialist | 0.15 |
| 3 | Security Posture | audit-security-specialist | 0.20 |
| 4 | Pattern Consistency | audit-pattern-specialist | 0.10 |
| 5 | Documentation Quality | audit-documentation-specialist | 0.10 |
| 6 | Test Quality | audit-test-specialist | 0.15 |
| 7 | Architecture Health | audit-architecture-specialist | 0.15 |
| 8 | Design Integrity* | audit-design-specialist | 0.05 |

*Design only for UI projects; weight redistributed if N/A.

---

## 3. Mode Mapping

| Mode | Dimensions | Duration | Use When |
|------|------------|----------|----------|
| quick (default) | 1, 2, 3 | ~5 min | Quick health check |
| core | 1-5 | ~15 min | Regular assessment |
| comprehensive | All | ~45-60 min | Due diligence, pre-acquisition |
| item | Varies | ~5-10 min | Focused investigation |

---

## 4. Execution Flow

```
[Discovery] Parse args, detect project, init temp
     |
     v
[Parallel Execution] Spawn specialists (3-8 agents)
     |
     v
[Aggregation] Calculate scores, rank findings
     |
     v
[Report] Generate markdown, update index, cleanup
```

---

## 5. Output Locations

| Artifact | Location |
|----------|----------|
| Report | `.claude/audit/YYYY-MM-DD-<mode>.md` |
| Index | `.claude/audit/audit-index.json` |
| Temp (during run) | `.claude/audit/temp/` |

---

## 6. Grade Mapping

| Score | Grade | Risk | Recommendation |
|-------|-------|------|----------------|
| 90-100 | A | Low | PROCEED |
| 80-89 | B | Low | PROCEED WITH MINOR FIXES |
| 70-79 | C | Medium | ACQUIRE WITH REMEDIATION PLAN |
| 60-69 | D | High | SIGNIFICANT REMEDIATION REQUIRED |
| <60 | F | Critical | DO NOT PROCEED |

---

## 7. Key Deduction Rules

**Security (weight 0.20):**
- exposed_secret: -25 (caps score at 50)
- insecure_storage: -15
- http_endpoint: -10
- missing_validation: -5

**Dependencies (weight 0.15):**
- critical_vulnerability: -15
- high_vulnerability: -8
- outdated_1year: -5 (max -20)
- unused_dependency: -2 (max -10)

**Architecture (weight 0.15):**
- circular_dependency: -10 (no cap)
- high_coupling: -5 (max -20)
- boundary_violation: -5 (max -20)

---

## 8. Finding ID Format

```
AUD-2026-001
 |    |    |
 |    |    +-- Sequential number (per year)
 |    +------- Year
 +------------ Prefix (stable across audits)
```

IDs persist via content hash: `sha256(type:location:title)`

---

## 9. Incremental Mode

`/audit --since abc1234` analyzes only changed files since commit:

- Shows NEW findings in changed files
- Shows RESOLVED findings fixed since last audit
- Shows UNCHANGED context from last full audit

Use for CI/PR reviews.

---

## 10. Tips

1. **Start with quick** - Use `/audit` for daily health checks
2. **Go comprehensive pre-release** - Full audit before major releases
3. **Track trends** - Check audit-index.json for score history
4. **Focus on critical** - Address grade D/F dimensions first
5. **Use --item for deep dives** - Focused audits on problem areas
6. **Incremental for PRs** - `--since` flags new issues only

---

## 11. Example Report Header

```
# Due Diligence Audit: MyProject

**Date:** 2026-01-22 | **Score:** 78/100 (C) | **Risk:** Medium
**Duration:** 47m 23s | **Files Analyzed:** 234 (28 deep-read)

## TL;DR
- 2 critical, 5 high, 12 medium, 8 low findings
- Security posture needs attention (65/100)
- Strong test coverage (88/100)

## Recommendation
ACQUIRE WITH REMEDIATION PLAN
```

---

## 12. NOT a Pipeline Gate

`/audit` is **independent** of `/orca-*` pipelines:

- Does NOT block feature development
- Does NOT auto-fix issues
- Provides assessment for human decision-making
- Run it when YOU want quality visibility

---

_Version: OS 5.0 | Audit v1.0_
