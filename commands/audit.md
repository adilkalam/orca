---
description: "Proactive codebase auditing across 10 quality dimensions"
argument-hint: "[--comprehensive | --core | --item <target>] [--verbose]"
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
  - mcp__cognition__cognition
  - mcp__project-context__query_context
  - AskUserQuestion
---

# /audit - Codebase Quality Auditing

**Philosophy:** Proactive quality surfacing. This command finds both problems (bugs, risks) AND opportunities (improvements, optimizations) across the codebase.

**Independent from pipelines:** `/audit` is NOT a gate or verification agent. It's a standalone diagnostic tool that runs independently of `/ios`, `/nextjs`, etc.

**Cognition-powered:** Uses the `audit` operation in cognition-mcp to structure findings with baseline expectations and current state analysis.

---

## Command Modes

```bash
# Quick health check (~2 min) - architecture, security, performance red flags
/audit

# Full production audit with all 10 dimensions (~25 min)
/audit --comprehensive

# Core 5 dimensions only (~10 min)
/audit --core

# Focused audit on specific area (~5 min)
/audit --item design-system
/audit --item page /checkout
/audit --item data
/audit --item module auth
/audit --item infra

# Verbosity
/audit --verbose  # Full findings (default: TL;DR only)
```

---

## Audit Dimensions

### Core 5 (for --core)
1. **Architecture** - Component structure, coupling, patterns, modularity
2. **Security** - Vulnerabilities, secrets exposure, injection risks, auth flaws
3. **Performance** - Bundle size, query efficiency, render performance, caching
4. **Types** - TypeScript strictness, `any` usage, type coverage, safety
5. **Standards** - Lane standards compliance, CLAUDE.md adherence, conventions

### Extended 5 (added for --comprehensive)
6. **Accessibility** - WCAG compliance, semantic HTML, ARIA, keyboard nav
7. **Dependencies** - Outdated packages, vulnerabilities, unused deps, licenses
8. **Documentation** - API docs, README quality, code comments, onboarding
9. **Design System** - Token usage consistency, component patterns, branding
10. **Test Coverage** - Unit, integration, e2e gaps, flaky tests, missing cases

---

## Execution Flow

### Step 1: Parse Arguments

Extract mode and target:
- Default (no flags): `quick` mode
- `--comprehensive`: All 10 dimensions
- `--core`: Core 5 dimensions only
- `--item <target>`: Focused audit on specific area
- `--verbose`: Include full findings (not just TL;DR)

### Step 2: Determine Dimensions to Audit

Based on mode:
- `quick`: Architecture + Security + Performance (fast red flags)
- `core`: Core 5 dimensions
- `comprehensive`: All 10 dimensions
- `item`: Relevant dimensions for the target type

**Item type detection:**
- `design-system`, `tokens`, `components` → Design System + Architecture
- `page`, `route`, `/path` → Architecture + Performance + Accessibility + Design System
- `data`, `database`, `queries` → Architecture + Performance + Security
- `module`, `service`, `api` → All core 5
- `infra`, `config`, `ci` → Security + Standards + Dependencies

### Step 3: Load Baseline Expectations

Query project standards and design-dna for baseline:

```typescript
// Query project standards
const standards = await mcp__project_context__query_context({
  domain: "standards",
  task: "Retrieve all standards, decisions, and quality rules",
  projectPath: process.cwd(),
  maxFiles: 5,
  includeHistory: true
});

// For design system audits, load design-dna
if (dimensions.includes('Design System')) {
  // Check for design-dna files
  const designDnaFiles = glob('.claude/design-dna/*.json');
  // Read design-dna.json for token/component expectations
}

// For Next.js projects, load CLAUDE.md
const claudeMd = read('CLAUDE.md');
```

### Step 4: Gather Current State

For each dimension, inspect the codebase:

**Architecture:**
```typescript
// Analyze component structure
const components = glob('**/*.tsx', '**/*.swift', '**/*.py');
// Check coupling, circular deps, layer violations
// Use Grep to find problematic patterns
```

**Security:**
```typescript
// Search for common vulnerabilities
grep('API_KEY|SECRET|PASSWORD', '**/*.{ts,js,py}');
// Check for SQL injection risks
grep('execute.*\\+|query.*\\+', '**/*.{ts,py}');
// Hardcoded credentials
grep('password.*=.*["\']', '**/*.{ts,js,py}');
```

**Performance:**
```typescript
// Bundle size (for web)
bash('du -sh dist/ build/ .next/');
// Large files
bash('find . -type f -size +500k');
// Unoptimized queries (n+1)
grep('forEach.*await|for.*await', '**/*.{ts,js,py}');
```

**Types (TypeScript):**
```typescript
grep(': any\\b|as any', '**/*.{ts,tsx}');
// Check tsconfig.json strictness
```

**Standards:**
```typescript
// Compare against lane standards
// Check naming conventions, file organization
```

**Dependencies:**
```typescript
bash('npm outdated || pip list --outdated');
bash('npm audit || safety check');
```

**Documentation:**
```typescript
// Check for README, API docs
// Count files with/without header comments
```

**Test Coverage:**
```typescript
bash('npm test -- --coverage || pytest --cov');
```

### Step 5: Generate Findings with Cognition MCP

For each issue found, create a structured finding:

```typescript
const findings: AuditFinding[] = [
  {
    id: "AUD-2025-001",  // Generated from hash
    type: "bug",  // bug, risk, improvement, optimization
    severity: "critical",  // critical, high, medium, low
    dimension: "Security",
    title: "Hardcoded API key in config file",
    description: "Production API key found in src/config/api.ts (line 15)",
    location: "src/config/api.ts:15",
    recommendation: "Move to environment variable: process.env.API_KEY",
    effort: "trivial",  // trivial, small, medium, large
    evidence: "const API_KEY = 'sk-live-abc123...'",
    fixCommand: "/orca fix AUD-2025-001"
  }
];
```

**Finding ID generation:**
```typescript
function generateFindingId(finding: Partial<AuditFinding>): string {
  const hash = createHash('sha256')
    .update(`${finding.type}:${finding.location}:${finding.title}`)
    .digest('hex')
    .substring(0, 8);
  
  // Get next counter from audit-index.json
  const index = loadAuditIndex();
  const counter = String(index.findings.length + 1).padStart(3, '0');
  const year = new Date().getFullYear();
  
  return `AUD-${year}-${counter}`;
}
```

### Step 6: Calculate Score

```typescript
interface AuditSummary {
  score: number;  // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  topPriorities: string[];
}

// Scoring algorithm
const baseScore = 100;
const deductions = {
  critical: 15,  // -15 per critical
  high: 8,       // -8 per high
  medium: 3,     // -3 per medium
  low: 1         // -1 per low
};

const score = Math.max(0, baseScore - (
  criticalCount * deductions.critical +
  highCount * deductions.high +
  mediumCount * deductions.medium +
  lowCount * deductions.low
));

// Grade mapping
const grade = 
  score >= 90 ? 'A' :
  score >= 80 ? 'B' :
  score >= 70 ? 'C' :
  score >= 60 ? 'D' : 'F';
```

### Step 7: Use Cognition MCP to Store Audit

```typescript
await mcp__cognition__cognition({
  operation: "audit",
  content: {
    scope: "quick" | "comprehensive" | "core" | "item",
    target: targetPath || undefined,
    
    baseline: {
      source: "CLAUDE.md, design-dna.json, standards",
      expectations: [
        "TypeScript strict mode enabled",
        "No hardcoded secrets",
        "Bundle size < 500KB",
        "Test coverage > 80%"
      ]
    },
    
    currentState: {
      summary: "Next.js app with 45 components, 12K LOC, TypeScript strict: false",
      observations: [
        "15 components use 'any' type",
        "2 hardcoded API keys found",
        "Bundle size: 1.2MB (gzipped: 350KB)",
        "Test coverage: 45%"
      ]
    },
    
    findings: findings,
    
    summary: {
      score: 72,
      grade: "C",
      criticalCount: 2,
      highCount: 5,
      mediumCount: 12,
      lowCount: 8,
      topPriorities: [
        "AUD-2025-001: Remove hardcoded API keys",
        "AUD-2025-003: Enable TypeScript strict mode"
      ]
    },
    
    nextThoughtNeeded: false
  }
});
```

### Step 8: Generate Markdown Report

Create `.claude/audit/YYYY-MM-DD-<scope>.md`:

```markdown
# Audit: [Scope]

**Date:** 2025-12-23 | **Score:** 72/100 (C) | **Duration:** 2m 15s

## TL;DR
- 2 critical, 5 high, 12 medium, 8 low findings
- Top priority: Remove hardcoded API keys (security)
- Quick fix: `/orca fix AUD-2025-001`

## New Since Last Audit
- [AUD-2025-015] Bundle size increased 40% since last week
- [AUD-2025-018] New dependency with known vulnerability

## Findings by Severity

### Critical (2)

#### AUD-2025-001: Hardcoded API key in config
- **Type:** bug | **Dimension:** Security
- **Location:** `src/config/api.ts:15`
- **Description:** Production API key hardcoded in source
- **Recommendation:** Move to environment variable
- **Effort:** trivial
- **Fix:** `/orca fix AUD-2025-001`
- **Evidence:**
  ```typescript
  const API_KEY = 'sk-live-abc123...';
  ```

### High (5)
...

### Medium (12)
...

### Low (8)
...

## Improvements & Optimizations
[Non-bug findings that could enhance quality]

### Performance Optimizations
- [AUD-2025-020] Image optimization opportunity (30% reduction)
- [AUD-2025-021] Bundle splitting could improve load time

### Code Quality Improvements
- [AUD-2025-025] TypeScript strict mode adoption path
- [AUD-2025-026] Test coverage gaps in auth module

## Action Summary
| Priority | Finding | Effort | Command |
|----------|---------|--------|---------|
| 1 | AUD-2025-001 | trivial | `/orca fix AUD-2025-001` |
| 2 | AUD-2025-003 | small | `/orca fix AUD-2025-003` |
| 3 | AUD-2025-007 | medium | `/orca fix AUD-2025-007` |

## Dimensions Audited
- ✓ Architecture (score: 85/100)
- ✓ Security (score: 60/100) ← needs attention
- ✓ Performance (score: 75/100)

## Next Steps
1. Address 2 critical security findings immediately
2. Plan TypeScript strict migration
3. Increase test coverage in auth module
4. Re-run audit after fixes: `/audit --core`
```

### Step 9: Update Audit Index

Maintain `.claude/audit/audit-index.json`:

```json
{
  "lastUpdated": "2025-12-23T13:30:00Z",
  "audits": [
    {
      "id": "2025-12-23-quick",
      "date": "2025-12-23T13:30:00Z",
      "scope": "quick",
      "score": 72,
      "findings": ["AUD-2025-001", "AUD-2025-003", "..."]
    }
  ],
  "findings": {
    "AUD-2025-001": {
      "hash": "abc12345",
      "type": "bug",
      "severity": "critical",
      "title": "Hardcoded API key in config",
      "firstSeen": "2025-12-23",
      "lastSeen": "2025-12-23",
      "status": "open"
    }
  }
}
```

**Finding tracking logic:**
- Hash finding content (type + location + title)
- Check if hash exists in index
- If exists: update `lastSeen`, keep ID
- If new: assign new ID, set `firstSeen`
- This enables "New since last audit" section

### Step 10: Display Summary

```
 CODEBASE AUDIT COMPLETE

Scope: Quick (3 dimensions)
Score: 72/100 (C)
Duration: 2m 15s

Findings:
- 2 critical
- 5 high
- 12 medium
- 8 low

Top Priority:
  AUD-2025-001: Remove hardcoded API keys (security)
  → /orca fix AUD-2025-001

Report saved: .claude/audit/2025-12-23-quick.md
Index updated: .claude/audit/audit-index.json

Next: Address critical findings, then re-run /audit --core
```

---

## /orca fix Integration

The `/audit` command generates `/orca fix <finding-id>` commands.

When user runs `/orca fix AUD-2025-001`:

1. `/orca` reads `.claude/audit/audit-index.json`
2. Finds the finding details
3. Routes to appropriate lane based on file location
4. Passes finding context (location, recommendation) to lane orchestrator

This is handled by updates to `commands/orca.md` (see TR-4 in requirements spec).

---

## --item Fuzzy Matching

When user specifies `--item <target>`:

1. **Exact match:** Check if path exists
   ```typescript
   if (fs.existsSync(target)) { /* use target */ }
   ```

2. **Partial path match:** Search for matching paths
   ```typescript
   const matches = glob(`**/*${target}*`);
   ```

3. **Module name match:** Search imports/exports
   ```typescript
   grep(`from.*${target}|import.*${target}`, '**/*.{ts,tsx,js,jsx}');
   ```

4. **Multiple matches:** Prompt user
   ```typescript
   AskUserQuestion({
     question: "Multiple matches found. Which did you mean?",
     options: matches.map(m => ({ label: m, description: "Audit this file/module" }))
   });
   ```

5. **No matches:** Error with suggestions
   ```
   No matches for "aut". Did you mean:
   - auth (src/auth/)
   - layout (src/components/layout/)
   - data (src/data/)
   ```

---

## Guardrails

- Audit NEVER modifies code (read-only inspection)
- Audit findings are SUGGESTIONS, not automatic fixes
- Scores are indicative, not absolute quality measures
- Finding IDs are stable across audits (via content hash)
- Audit runs independently of pipeline gates

---

## Memory Integration

After audit completes, optionally record learnings:

```typescript
// If recurring patterns found
mcp__project_context__save_standard({
  what_happened: "Frequent API key hardcoding in config files",
  cost: "2 security incidents in past month",
  rule: "NEVER hardcode secrets. Always use environment variables.",
  domain: "security"
});
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
