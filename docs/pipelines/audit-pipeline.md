# Audit Pipeline

**Status:** OS 5.1 Standalone Diagnostic
**Type:** `audit` (NOT a /orca pipeline)
**Last Updated:** 2026-01-22

## Overview

The Audit pipeline is a **standalone due diligence tool** for investor-grade codebase quality assessment. Unlike `/orca-*` pipelines which gate feature development, `/audit` runs independently to evaluate quality, consistency, and risk.

**Key distinction:** `/audit` is NOT a gate or verification step in other pipelines. It's an independent diagnostic command that spawns parallel specialist agents for comprehensive analysis.

Use this command when you need:

- Pre-acquisition due diligence on a codebase
- Quality baseline before major refactoring
- Security posture assessment
- Technical debt inventory
- Trend tracking over time

**Multi-agent architecture:** Spawns up to 8 specialist agents in parallel for efficient, thorough analysis across multiple quality dimensions.

---

## Core Principles

1. **Read-only inspection** - Audit NEVER modifies code.
2. **Parallel execution** - Specialists run concurrently for efficiency.
3. **Weighted scoring** - Security weighted highest (0.20), design lowest (0.05).
4. **Stable finding IDs** - IDs persist across audits via content hash.
5. **Independent operation** - Not tied to any /orca pipeline gates.
6. **Investor-grade output** - Reports formatted for decision-makers.

---

## Pipeline Architecture

```
/audit [--comprehensive | --core | --item <target>] [--since <commit>]
    |
    v
[Phase 1: Discovery] (2-3 min)
    - Parse arguments (mode, target, verbosity)
    - Detect project type (nextjs, expo, ios, django, cli)
    - Determine applicable dimensions
    - Initialize temp directory
    |
    v
[Phase 2: Parallel Agent Execution] (5-45 min depending on mode)
    - Spawn specialist agents in parallel via Task tool
    - Each agent writes JSON to .claude/audit/temp/
    - Agents: structure, dependency, security, pattern,
      documentation, test, architecture, design
    |
    v
[Phase 3: Aggregation] (2-3 min)
    - Collect all agent JSON outputs
    - Calculate weighted overall score
    - Rank findings by severity
    - Assign stable finding IDs
    |
    v
[Phase 4: Report Generation] (1-2 min)
    - Generate markdown report
    - Update audit index (trend tracking)
    - Store in Cognition MCP
    - Display summary
    - Cleanup temp files
```

---

## Quality Dimensions & Specialist Agents

| # | Dimension | Specialist Agent | Weight | Focus |
|---|-----------|------------------|--------|-------|
| 1 | Structure Quality | audit-structure-specialist | 0.10 | Dead code, naming, organization |
| 2 | Dependency Health | audit-dependency-specialist | 0.15 | Vulnerabilities, outdated, unused |
| 3 | Security Posture | audit-security-specialist | 0.20 | Secrets, auth, validation |
| 4 | Pattern Consistency | audit-pattern-specialist | 0.10 | Anti-patterns, style violations |
| 5 | Documentation Quality | audit-documentation-specialist | 0.10 | Stale, missing, inaccurate docs |
| 6 | Test Quality | audit-test-specialist | 0.15 | Coverage, assertions, flakiness |
| 7 | Architecture Health | audit-architecture-specialist | 0.15 | Circular deps, coupling, boundaries |
| 8 | Design Integrity | audit-design-specialist | 0.05* | Tokens, components, consistency |

*Design Integrity only applies to UI projects; weight redistributed if N/A.

### Mode Mapping

| Mode | Dimensions | Agents Spawned | Duration |
|------|------------|----------------|----------|
| quick (default) | Structure, Security, Dependencies | 3 | ~5 min |
| core | + Pattern, Documentation | 5 | ~15 min |
| comprehensive | All 8 (7 for non-UI) | 7-8 | ~45-60 min |

---

## Scoring Methodology

### Dimension Scores (0-100)

Each specialist calculates a dimension score starting at 100, with deductions for issues:

**Example - Security Posture:**
- exposed_secret: -25 each (CRITICAL - caps score at 50)
- insecure_storage: -15 each
- http_endpoint: -10 each
- missing_validation: -5 each

### Overall Score Calculation

```
overallScore = SUM(dimensionScore * dimensionWeight)
```

If design dimension is not applicable, its weight (0.05) is redistributed equally among active dimensions.

### Grade Mapping

| Score | Grade | Risk Level | Recommendation |
|-------|-------|------------|----------------|
| 90-100 | A | Low | PROCEED |
| 80-89 | B | Low | PROCEED WITH MINOR FIXES |
| 70-79 | C | Medium | ACQUIRE WITH REMEDIATION PLAN |
| 60-69 | D | High | SIGNIFICANT REMEDIATION REQUIRED |
| 0-59 | F | Critical | DO NOT PROCEED / MAJOR OVERHAUL |

---

## Agent Output Schema

Each specialist produces JSON to `.claude/audit/temp/<agent>.json`:

```json
{
  "agent": "audit-security-specialist",
  "dimension": "security",
  "timestamp": "ISO timestamp",
  "projectType": "nextjs",
  "score": 78,
  "deductions": [
    {
      "rule": "exposed_secret",
      "points": -25,
      "count": 1,
      "locations": ["src/config/api.ts:15"]
    }
  ],
  "findings": [
    {
      "id": "AUD-2026-001",
      "type": "bug",
      "severity": "critical",
      "title": "Hardcoded API key in config",
      "location": "src/config/api.ts:15",
      "evidence": "const API_KEY = 'sk-live-...'",
      "recommendation": "Move to environment variable",
      "effort": "trivial"
    }
  ],
  "methodology": {
    "filesScanned": 45,
    "filesReadDeeply": 8,
    "patternsChecked": ["secrets", "auth", "validation"]
  },
  "confidence": 0.85
}
```

---

## Report Format

Reports are written to `.claude/audit/YYYY-MM-DD-<mode>.md`:

```markdown
# Due Diligence Audit: [Project Name]

**Date:** 2026-01-22 | **Score:** 78/100 (C) | **Risk:** Medium
**Duration:** 47m 23s | **Files Analyzed:** 234 (28 deep-read)

## TL;DR
- 2 critical, 5 high, 12 medium, 8 low findings
- Security posture needs attention (65/100)
- Strong test coverage (88/100)

## Recommendation
ACQUIRE WITH REMEDIATION PLAN

## Score Trend
72 -> 75 -> 78 (+6 over 3 audits)

## Quality Scorecards
[Per-dimension breakdown with metrics]

## Findings by Severity
[Ranked findings with IDs, locations, evidence, recommendations]
```

---

## Trend Tracking

The audit index at `.claude/audit/audit-index.json` tracks:

- All audits with timestamps, scores, finding counts
- Finding persistence (firstSeen, lastSeen, status)
- Score history for trend visualization
- Finding history for regression detection

Finding IDs are stable across audits via content hash (`sha256(type:location:title)`).

---

## Cognition MCP Integration

Audit results are stored in Cognition MCP for cross-project learning:

```typescript
await mcp__cognition__cognition({
  operation: "audit",
  content: {
    scope: mode,
    overallScore,
    dimensionScores,
    findings,
    recommendation
  }
});
```

---

## Incremental Mode (--since)

When `--since <commit>` is specified:

1. Get changed files: `git diff --name-only <commit>..HEAD`
2. Filter specialists to only analyze changed files
3. Compare against last full audit
4. Report shows: NEW findings, RESOLVED findings, UNCHANGED context

---

## Guardrails

- Audit NEVER modifies code (read-only inspection)
- Audit findings are SUGGESTIONS, not automatic fixes
- Scores are indicative, not absolute quality measures
- Finding IDs are stable across audits
- Specialists run in parallel for efficiency
- Temp files cleaned up after report generation

---

## Response Awareness

During audit execution:

- `#COMPLETION_DRIVE`: Note when guessing vs. verifying finding severity
- `#PATH_DECISION`: Document why certain dimensions were prioritized
- `#POISON_PATH`: Avoid false positives that waste user time

---

_Version: OS 5.1 | Audit Pipeline v1.0_
