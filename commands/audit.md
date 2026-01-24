---
description: "Multi-agent due diligence auditing with parallel specialist execution"
argument-hint: "[--comprehensive | --core | --item <target>] [--since <commit>] [--verbose]"
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
  - Task
  - mcp__cognition__cognition
  - mcp__project-context__query_context
  - AskUserQuestion
---

# /audit - Due Diligence Codebase Auditing

**Philosophy:** Investor-grade quality assessment. This command evaluates **quality**, **consistency**, and **risk** - not just what exists. Parallel specialist agents provide deep analysis across multiple dimensions.

**Independent from pipelines:** `/audit` is NOT a gate or verification agent. It's a standalone diagnostic tool that runs independently of `/ios`, `/nextjs`, etc.

**Multi-agent architecture:** Spawns specialist agents in parallel for efficient, thorough analysis.

---

## Command Modes

```bash
# Quick health check (~5 min) - 3 core dimensions
/audit

# Full due diligence audit (~45-60 min) - all dimensions
/audit --comprehensive

# Core dimensions only (~15 min) - 5 dimensions
/audit --core

# Focused audit on specific area (~5-10 min)
/audit --item design-system
/audit --item page /checkout
/audit --item data
/audit --item module auth
/audit --item infra

# Incremental audit since commit
/audit --since abc1234

# Verbosity
/audit --verbose  # Full findings (default: TL;DR only)
```

---

## Quality Dimensions & Specialist Agents

| # | Dimension | Specialist Agent | Weight |
|---|-----------|------------------|--------|
| 1 | Structure Quality | audit-structure-specialist | 0.10 |
| 2 | Dependency Health | audit-dependency-specialist | 0.15 |
| 3 | Security Posture | audit-security-specialist | 0.20 |
| 4 | Pattern Consistency | audit-pattern-specialist | 0.10 |
| 5 | Documentation Quality | audit-documentation-specialist | 0.10 |
| 6 | Test Quality | audit-test-specialist | 0.15 |
| 7 | Architecture Health | audit-architecture-specialist | 0.15 |
| 8 | Design Integrity | audit-design-specialist | 0.05* |

*Design Integrity only applies to UI projects; weight redistributed if N/A.

### Mode Mapping

| Mode | Dimensions | Agents Spawned |
|------|------------|----------------|
| quick | Structure, Security, Dependencies | 3 |
| core | + Pattern, Documentation | 5 |
| comprehensive | All 8 (7 for non-UI) | 7-8 |

---

## Execution Flow

### Phase 1: Discovery (2-3 min)

1. **Parse Arguments**
   - Extract mode: quick/core/comprehensive/item
   - Extract target: path for --item mode
   - Extract commit: sha for --since mode
   - Extract verbosity flag

2. **Detect Project Type**
   ```typescript
   // Auto-detect project type
   const projectType =
     glob('next.config.*').length ? 'nextjs' :
     glob('app.json').length && read('app.json').includes('expo') ? 'expo' :
     glob('*.xcodeproj').length || glob('Package.swift').length ? 'ios' :
     glob('manage.py').length ? 'django' :
     'cli';
   ```

3. **Determine Applicable Dimensions**
   ```typescript
   const dimensions = {
     quick: ['structure', 'security', 'dependencies'],
     core: ['structure', 'security', 'dependencies', 'patterns', 'documentation'],
     comprehensive: projectType !== 'cli'
       ? ['structure', 'security', 'dependencies', 'patterns', 'documentation', 'tests', 'architecture', 'design']
       : ['structure', 'security', 'dependencies', 'patterns', 'documentation', 'tests', 'architecture']
   }[mode];
   ```

4. **Initialize Temp Directory**
   ```bash
   mkdir -p .claude/audit/temp/
   ```

### Phase 2: Parallel Agent Execution (30-45 min for comprehensive)

Spawn all applicable specialist agents in parallel using Task tool:

```typescript
// Spawn agents in parallel
const agentPromises = dimensions.map(dimension =>
  Task({
    subagent_type: `audit-${dimension}-specialist`,
    prompt: `Audit ${dimension} dimension for ${projectPath}.
             Project type: ${projectType}.
             Write JSON output to .claude/audit/temp/audit-${dimension}-specialist.json`,
    run_in_background: true
  })
);

// All agents run concurrently
// Each writes its JSON result to .claude/audit/temp/
```

**Agent Output Schema:**
Each agent produces JSON to `.claude/audit/temp/<agent>.json`:

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

### Phase 3: Aggregation (2-3 min)

1. **Collect All Results**
   ```typescript
   const results = [];
   for (const dim of dimensions) {
     const json = read(`.claude/audit/temp/audit-${dim}-specialist.json`);
     results.push(JSON.parse(json));
   }
   ```

2. **Calculate Overall Score**
   ```typescript
   const weights = {
     structure: 0.10,
     dependencies: 0.15,
     security: 0.20,
     patterns: 0.10,
     documentation: 0.10,
     tests: 0.15,
     architecture: 0.15,
     design: 0.05
   };

   // Redistribute weights if design not applicable
   if (!dimensions.includes('design')) {
     const redistributeWeight = weights.design / (dimensions.length);
     dimensions.forEach(d => weights[d] += redistributeWeight);
     delete weights.design;
   }

   // Calculate weighted average
   const overallScore = results.reduce((sum, r) => {
     return sum + (r.score * weights[r.dimension]);
   }, 0);
   ```

3. **Rank Findings by Severity**
   ```typescript
   const allFindings = results.flatMap(r => r.findings);
   const rankedFindings = allFindings.sort((a, b) => {
     const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
     return severityOrder[a.severity] - severityOrder[b.severity];
   });
   ```

4. **Assign Finding IDs**
   ```typescript
   // Load or create audit index
   const index = loadAuditIndex() || { findings: {}, audits: [] };

   rankedFindings.forEach((finding, i) => {
     const hash = sha256(`${finding.type}:${finding.location}:${finding.title}`).slice(0, 8);

     if (index.findings[hash]) {
       // Existing finding - keep ID, update lastSeen
       finding.id = index.findings[hash].id;
       index.findings[hash].lastSeen = today;
     } else {
       // New finding - assign new ID
       const counter = Object.keys(index.findings).length + 1;
       finding.id = `AUD-${year}-${String(counter).padStart(3, '0')}`;
       index.findings[hash] = {
         id: finding.id,
         firstSeen: today,
         lastSeen: today,
         status: 'open'
       };
     }
   });
   ```

### Phase 4: Report Generation (1-2 min)

1. **Generate Markdown Report**

   Write to `.claude/audit/YYYY-MM-DD-<mode>.md`:

   ```markdown
   # Due Diligence Audit: [Project Name]

   **Date:** 2026-01-22 | **Score:** 78/100 (C) | **Risk:** Medium
   **Duration:** 47m 23s | **Files Analyzed:** 234 (28 deep-read)

   ## TL;DR
   - 2 critical, 5 high, 12 medium, 8 low findings
   - Security posture needs attention (65/100)
   - Strong test coverage (88/100)
   - Documentation accuracy issues detected

   ## Recommendation
   ACQUIRE WITH REMEDIATION PLAN - Address critical security issues before production deployment.

   ## Score Trend
   72 → 75 → 78 (+6 over 3 audits)

   ## Quality Scorecards

   ### Security Posture: 65/100 (D)
   | Metric | Score | Issues |
   |--------|-------|--------|
   | Secrets handling | 40 | 1 exposed API key |
   | Auth patterns | 75 | Minor improvements |
   | Input validation | 80 | Good coverage |
   | Dependencies | 65 | 2 vulnerabilities |

   ## Findings by Severity

   ### Critical (2)

   #### AUD-2026-001: Hardcoded API key in config
   - **Dimension:** Security | **Effort:** trivial
   - **Location:** `src/config/api.ts:15`
   - **Evidence:**
     ```typescript
     const API_KEY = 'sk-live-abc123...';
     ```
   - **Recommendation:** Move to environment variable
   - **First Seen:** 2026-01-22 | **Status:** NEW

   ...
   ```

2. **Update Audit Index**

   Write to `.claude/audit/audit-index.json`:

   ```json
   {
     "lastUpdated": "ISO timestamp",
     "audits": [
       {
         "id": "2026-01-22-comprehensive",
         "date": "2026-01-22T15:30:00Z",
         "mode": "comprehensive",
         "overallScore": 78,
         "grade": "C",
         "findingCounts": {
           "critical": 2,
           "high": 5,
           "medium": 12,
           "low": 8
         },
         "dimensionScores": {
           "structure": 82,
           "dependencies": 71,
           "security": 65
         }
       }
     ],
     "findings": { ... },
     "trends": {
       "scoreHistory": [72, 75, 78],
       "findingsHistory": [
         { "date": "2026-01-15", "critical": 3, "high": 7 },
         { "date": "2026-01-22", "critical": 2, "high": 5 }
       ]
     }
   }
   ```

3. **Store in Cognition MCP**

   ```typescript
   await mcp__cognition__cognition({
     operation: "audit",
     content: {
       scope: mode,
       overallScore,
       dimensionScores: results.map(r => ({ dimension: r.dimension, score: r.score })),
       findings: rankedFindings,
       recommendation: getRecommendation(overallScore, rankedFindings)
     }
   });
   ```

4. **Display Summary**

   ```
   DUE DILIGENCE AUDIT COMPLETE

   Scope: Comprehensive (8 dimensions)
   Score: 78/100 (C) | Risk: Medium
   Duration: 47m 23s

   Dimension Scores:
     Structure:      82/100 (B)
     Dependencies:   71/100 (C)
     Security:       65/100 (D) <- ATTENTION
     Patterns:       85/100 (B)
     Documentation:  72/100 (C)
     Tests:          88/100 (B)
     Architecture:   80/100 (B)
     Design:         90/100 (A)

   Findings:
   - 2 critical (BLOCK RELEASE)
   - 5 high
   - 12 medium
   - 8 low

   Top Priority:
     AUD-2026-001: Hardcoded API key (Security)
     -> /orca fix AUD-2026-001

   Recommendation: ACQUIRE WITH REMEDIATION PLAN

   Report: .claude/audit/2026-01-22-comprehensive.md
   ```

---

## Scoring System

### Dimension Scores: 0-100

Each specialist calculates dimension score with specific deduction rules:

**Structure:**
- dead_code_file: -5 each (max -25)
- naming_inconsistency: -3 each (max -20)
- giant_file_500plus: -5 each (max -20)
- poor_organization: -5 to -15

**Dependencies:**
- critical_vulnerability: -15 each
- high_vulnerability: -8 each
- outdated_1year: -5 each (max -20)
- unused_dependency: -2 each (max -10)

**Security:**
- exposed_secret: -25 each (CRITICAL - caps score at 50)
- insecure_storage: -15 each
- http_endpoint: -10 each
- missing_validation: -5 each

### Overall Score

```
overallScore = SUM(dimensionScore * dimensionWeight)
```

### Grade Mapping

| Score | Grade | Risk Level | Recommendation |
|-------|-------|------------|----------------|
| 90-100 | A | Low | PROCEED |
| 80-89 | B | Low | PROCEED WITH MINOR FIXES |
| 70-79 | C | Medium | ACQUIRE WITH REMEDIATION PLAN |
| 60-69 | D | High | SIGNIFICANT REMEDIATION REQUIRED |
| 0-59 | F | Critical | DO NOT PROCEED / MAJOR OVERHAUL |

---

## Incremental Mode (--since)

When `--since <commit>` is specified:

1. Get changed files: `git diff --name-only <commit>..HEAD`
2. Filter specialists to only analyze changed files
3. Compare against last full audit
4. Report shows:
   - **New findings** in changed files
   - **Resolved findings** fixed since last audit
   - **Unchanged findings** from full audit (context)

---

## --item Fuzzy Matching

When user specifies `--item <target>`:

1. **Exact match:** Check if path exists
2. **Partial path match:** `glob(**/*${target}*)`
3. **Module name match:** Search imports/exports
4. **Multiple matches:** Prompt user with options
5. **No matches:** Error with suggestions

---

## Guardrails

- Audit NEVER modifies code (read-only inspection)
- Audit findings are SUGGESTIONS, not automatic fixes
- Scores are indicative, not absolute quality measures
- Finding IDs are stable across audits (via content hash)
- Audit runs independently of pipeline gates
- Specialists run in parallel for efficiency

---

## Cleanup

After report generation:
```bash
rm -rf .claude/audit/temp/
```

---

## Response Awareness

During audit execution:

- `#COMPLETION_DRIVE`: Note when guessing vs. verifying finding severity
- `#PATH_DECISION`: Document why certain dimensions were prioritized
- `#POISON_PATH`: Avoid false positives that waste user time

---

## Begin Execution

Execute for: **$ARGUMENTS**
