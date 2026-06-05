---
description: "Evidence-based due diligence auditing with direct verification protocols"
argument-hint: "[--comprehensive | --core | --item <target> | --documentation [--comprehensive]] [--since <commit>] [--verbose]"
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
  - Write
  - mcp__cognition-mcp__cognition
  - mcp__project-context__query_context
  - AskUserQuestion
---

# /audit - Due Diligence Codebase Auditing

**Philosophy:** Investor-grade quality assessment. This command evaluates **quality**, **consistency**, and **risk** through direct evidence-based verification. Every finding includes the claim checked, the verification performed, and the result.

**Independent from pipelines:** `/audit` is NOT a gate or verification agent. It's a standalone diagnostic tool that runs independently of `/ios`, `/nextjs`, etc.

**Direct execution:** All verification is performed directly by the executing agent using a structured process schema. No subagent delegation. Evidence trails make verification work transparent and gaps detectable.

---

## Verbose Flag

Include `verbose: false` in every cognition MCP call from /audit. This is a multi-call command; the minimal ACK response saves tokens.

## Command Modes

```bash
# Quick health check (~10 min) - 3 core dimensions
/audit

# Full due diligence audit (~60-90 min) - all dimensions
/audit --comprehensive

# Core dimensions only (~25 min) - 5 dimensions
/audit --core

# Focused audit on specific area (~10-15 min)
/audit --item design-system
/audit --item page /checkout
/audit --item data
/audit --item module auth
/audit --item infra

# Deep documentation verification (~20-30 min) - samples key docs, all 6 ops
/audit --documentation

# Exhaustive documentation verification (no time limit) - every file, every line
/audit --documentation --comprehensive

# Incremental audit since commit
/audit --since abc1234

# Verbosity
/audit --verbose  # Full findings (default: TL;DR only)
```

**Invalid combinations:** `--documentation --since` is not supported (error: documentation verification requires full file reads, not diffs).

---

## Quality Dimensions

| # | Dimension | Weight | Execution Order |
|---|-----------|--------|-----------------|
| 1 | Structure Quality | 0.10 | 1st |
| 2 | Security Posture | 0.20 | 2nd |
| 3 | Dependency Health | 0.15 | 3rd |
| 4 | Pattern Consistency | 0.10 | 4th |
| 5 | Architecture Health | 0.15 | 5th |
| 6 | Test Quality | 0.15 | 6th |
| 7 | Documentation Quality | 0.10 | 7th |
| 8 | Design Integrity | 0.05* | 8th |

*Design Integrity only applies to UI projects; weight redistributed if N/A.

### Mode Mapping

| Mode | Dimensions |
|------|------------|
| quick | Structure, Security, Dependencies |
| core | + Patterns, Documentation |
| comprehensive | All 8 (7 for non-UI) |

---

## Execution Flow

### Phase 0: Parse and Configure (~1 min)

1. **Parse Arguments**
   - Extract mode: quick/core/comprehensive/item/documentation
   - Extract target: path for --item mode
   - Extract commit: sha for --since mode
   - Extract verbosity flag
   - Check for `--documentation` flag:
     ```
     isDocAudit = args.includes('--documentation')
     isDocComprehensive = isDocAudit && args.includes('--comprehensive')
     ```
   - If `isDocAudit && args.includes('--since')`: ERROR "Documentation verification requires full file reads, not diffs. Remove --since flag."
   - If `isDocAudit`: run Documentation Sub-Pipeline (Phase 2D), skip standard dimensions

2. **Detect Project Type**
   ```typescript
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
       ? ['structure', 'security', 'dependencies', 'patterns', 'architecture', 'tests', 'documentation', 'design']
       : ['structure', 'security', 'dependencies', 'patterns', 'architecture', 'tests', 'documentation']
   }[mode];
   ```

4. **Initialize**
   ```bash
   mkdir -p .orca/audit/temp/
   ```

5. **Cognition Checkpoint: Enter**
   ```typescript
   { operation: "checkpoint", content: {
     command: "audit", phase: "enter",
     summary: "Audit starting: mode=${mode}, projectType=${projectType}, dimensions=${dimensions.length}"
   }}
   ```

### Phase 1: Discovery (~2-3 min)

Establish the project map that all dimensions reference.

1. **File tree scan**
   ```bash
   find . -type f -not -path '*/node_modules/*' -not -path '*/.git/*' -not -path '*/dist/*' -not -path '*/.next/*' -not -path '*/build/*' -not -path '*/__pycache__/*' | head -2000
   ```

2. **Source file inventory**: Count files by extension, identify primary language(s), locate key config files.

3. **Identify key infrastructure**:
   - Package manager: package.json, Podfile, requirements.txt, go.mod, Cargo.toml
   - Framework config: next.config.*, tsconfig.json, app.json, manage.py
   - Test config: jest.config.*, pytest.ini, .swiftpm, vitest.config.*
   - CI/CD: .github/workflows/, .gitlab-ci.yml, Jenkinsfile

4. **Cognition Checkpoint: Discovery**
   ```typescript
   { operation: "checkpoint", content: {
     phase: "discovery",
     summary: "Project: ${projectType}, ${fileCount} source files, lang: ${primaryLang}",
     keyFindings: ["framework", "test framework", "CI setup", "notable structure"]
   }}
   ```

**Context principle:** Retain only the project map summary after this phase, not raw file listings.

### Phase 2: Dimension Execution (SEQUENTIAL)

Execute dimensions one at a time in fixed order. Each dimension follows the DISCOVER -> VERIFY -> RECORD protocol.

**Execution order** (optimized for dependency and context):

```
Structure -> Security -> Dependencies -> Patterns -> Architecture -> Tests -> Documentation -> Design
```

- Structure establishes codebase map all others reference
- Security and Dependencies are grep/bash-heavy, low context
- Patterns and Architecture use the structure map
- Documentation references all prior findings
- Design is last, conditional on UI project

#### Evidence Trail Format

Every verification step produces evidence in this format:

```markdown
### [FINDING|CLEAN]: [title]
- **Claim**: [what was expected or asserted]
- **Verification**: [what command/read was performed to check]
- **Result**: [FINDING with details | CLEAN with what was confirmed]
- **Location**: [file:line]
- **Deduction**: -N ([rule_name]) | 0
```

This format is mandatory. A CLEAN result without stating what verification was performed is invalid. The evidence IS the work product -- gaps in evidence are visible gaps in verification.

#### Per-Dimension Protocols

---

#### 2a. Structure Quality (weight: 0.10)

**DISCOVER:**
- Glob all source files by extension
- `wc -l` on source files to find giants (>500 lines)
- `find` for directory depth and organization patterns

**VERIFY (produce evidence for each):**

| Check | Method | Deduction |
|-------|--------|-----------|
| Giant files (>500 lines) | `wc -l` on all source files, list those exceeding 500 | -5 each (cap -20) |
| Dead code files | For each source file, grep for inbound imports. File with 0 imports across codebase = dead | -5 each (cap -25) |
| Naming inconsistency | Extract naming convention per directory (camelCase, snake_case, PascalCase). Flag directories with mixed conventions | -3 each (cap -20) |
| Poor organization | Check max directory depth, files in root that belong in subdirs, scattered concerns | -5 to -15 |

**RECORD:**
- Write evidence to `.orca/audit/temp/structure.md`
- Cognition checkpoint with phase: "structure", score, key findings

---

#### 2b. Security Posture (weight: 0.20)

**DISCOVER:**
- Grep for secret patterns across source files
- Grep for HTTP (non-HTTPS) endpoints
- Find request handlers and check for input validation

**VERIFY (produce evidence for each):**

| Check | Method | Deduction |
|-------|--------|-----------|
| Exposed secrets | Grep for: `sk[_-]live`, `pk[_-]live`, `AKIA`, `password\s*=\s*['"][^'"]+['"]`, `apiKey\s*[:=]\s*['"][^'"]+['"]`, `.env` files committed. Exclude test fixtures, .env.example, env var references | -25 each (CRITICAL, caps dimension score at 50) |
| HTTP endpoints | Grep for `http://` in source (exclude localhost, test files). Each non-local HTTP endpoint is a finding | -10 each (cap -30) |
| Missing input validation | Read request handler files, check for sanitization/validation before use of req.body, req.params, request.data | -5 each (cap -20) |
| Insecure storage | Grep for localStorage/sessionStorage with sensitive data patterns (token, password, secret, key) | -15 each |

**RECORD:**
- Write evidence to `.orca/audit/temp/security.md`
- Cognition checkpoint with phase: "security", score, key findings

---

#### 2c. Dependency Health (weight: 0.15)

**DISCOVER:**
- Identify package manager (npm, pip, bundler, cargo, swift-pm, go-mod)
- Run audit command for detected package manager

**VERIFY (produce evidence for each):**

| Check | Method | Deduction |
|-------|--------|-----------|
| Critical vulnerabilities | `npm audit --json 2>/dev/null` or `pip-audit 2>/dev/null` or equivalent. Parse output for severity levels | -15 each |
| High vulnerabilities | Same audit output, high severity | -8 each |
| Outdated (>1 year) | `npm outdated 2>/dev/null` or equivalent. Flag packages >1 year behind latest | -5 each (cap -20) |
| Unused dependencies | For each dependency in package file, grep source for import/require. No references = unused | -2 each (cap -10) |

**Note:** If audit tools are not installed or fail, note this in evidence and skip with a deferred finding.

**RECORD:**
- Write evidence to `.orca/audit/temp/dependencies.md`
- Cognition checkpoint with phase: "dependencies", score, key findings

---

#### 2d. Pattern Consistency (weight: 0.10)

**DISCOVER:**
- Read 8-12 representative source files from different directories
- Identify dominant patterns for error handling, state management, API calls, component structure

**VERIFY (produce evidence for each):**

| Check | Method | Deduction |
|-------|--------|-----------|
| Anti-patterns | Check for: god files (>10 exports), deeply nested callbacks (>3 levels), prop drilling (>3 levels), any-type usage in TypeScript | -5 each (cap -25) |
| Inconsistent error handling | Identify dominant error pattern (try-catch, .catch, Result type). Flag files using different pattern | -3 each (cap -15) |
| Mixed paradigms | Check for mixed state management (Redux + Context + Zustand), mixed HTTP clients (fetch + axios), mixed test frameworks | -5 each (cap -20) |
| Style inconsistency | Beyond linting: inconsistent file organization, inconsistent export patterns, inconsistent naming across directories | -2 each (cap -10) |

**RECORD:**
- Write evidence to `.orca/audit/temp/patterns.md`
- Cognition checkpoint with phase: "patterns", score, key findings

---

#### 2e. Architecture Health (weight: 0.15)

**DISCOVER:**
- Map module boundaries from directory structure
- Grep for import/require statements to build dependency graph sketch
- Identify architectural pattern (feature-based, layer-based, MVC, etc.)

**VERIFY (produce evidence for each):**

| Check | Method | Deduction |
|-------|--------|-----------|
| Circular dependencies | Trace import chains between modules. A imports B imports C imports A = circular | -10 each (no cap) |
| High coupling | Count cross-boundary imports per module. >10 inbound imports from other modules = high coupling | -5 each (cap -20) |
| Low cohesion | Files within a module that don't share concerns (e.g., auth module with a utility function for dates) | -5 each (cap -15) |
| Boundary violations | UI components importing directly from data layer, shared utilities importing from feature modules | -5 each (cap -20) |

**RECORD:**
- Write evidence to `.orca/audit/temp/architecture.md`
- Cognition checkpoint with phase: "architecture", score, key findings

---

#### 2f. Test Quality (weight: 0.15)

**DISCOVER:**
- Glob for test files (*.test.*, *.spec.*, *_test.*, tests/, __tests__/)
- Find test configuration and coverage reports
- Count test files vs source files

**VERIFY (produce evidence for each):**

| Check | Method | Deduction |
|-------|--------|-----------|
| Low coverage | Compare test file count to source file count. Check for coverage reports. <60% estimated coverage | -10 (if <60%) |
| Missing assertions | Read 5-10 test files, check for meaningful assertions (not just `expect(true)` or smoke tests with no assertions) | -5 per file with no assertions (cap -20) |
| Shared state | Grep test files for global mutable state, missing beforeEach cleanup, shared database connections | -5 each (cap -15) |
| Flakiness indicators | Grep test files for setTimeout, sleep, Date.now, Math.random usage that indicates timing-dependent tests | -3 each (cap -15) |

**RECORD:**
- Write evidence to `.orca/audit/temp/tests.md`
- Cognition checkpoint with phase: "tests", score, key findings

---

#### 2g. Documentation Quality (weight: 0.10)

**DISCOVER:**
- Glob for doc files: README.md, docs/, *.md, API documentation
- Identify documented vs undocumented modules
- Check doc file modification dates vs source file dates

**VERIFY (produce evidence for each):**

| Check | Method | Deduction |
|-------|--------|-----------|
| Missing critical docs | Check for: README.md, setup/install instructions, API documentation for public endpoints, CONTRIBUTING.md for OSS | -10 each (no cap) |
| Stale documentation | Compare doc file mtime to source file mtime. Docs older than source by >6 months = stale | -5 each (cap -20) |
| Inaccurate claims | Spot-check 3-5 concrete claims in docs against actual code (API endpoints, config options, setup steps) | -8 each (cap -25) |
| Incomplete documentation | Key exported functions/components with no JSDoc/docstring. Modules with no README | -3 each (cap -15) |

**RECORD:**
- Write evidence to `.orca/audit/temp/documentation.md`
- Cognition checkpoint with phase: "documentation", score, key findings

---

#### 2h. Design Integrity (weight: 0.05, UI projects only)

**Skip condition:** If `projectType === 'cli'` or no UI framework detected, skip this dimension and redistribute weight.

**DISCOVER:**
- Find design token files (CSS custom properties, theme files, tailwind config)
- Glob for component directories
- Find CSS/style files

**VERIFY (produce evidence for each):**

| Check | Method | Deduction |
|-------|--------|-----------|
| Hardcoded values | Grep for hex colors (#xxx, #xxxxxx), pixel values in style props, hardcoded font sizes that should use tokens | -3 each (cap -15) |
| Inconsistent components | Compare 3-5 similar components (buttons, inputs, cards) for structural consistency | -5 each (cap -15) |
| Missing accessibility | Grep for `<img` without `alt`, interactive elements without `aria-label`, buttons with only icons and no accessible name | -3 each (cap -15) |
| Token compliance | If a design token system exists, check that components use tokens rather than raw values | -3 each (cap -15) |

**RECORD:**
- Write evidence to `.orca/audit/temp/design.md`
- Cognition checkpoint with phase: "design", score, key findings

---

### Phase 2D: Documentation Sub-Pipeline (`--documentation`)

When `--documentation` is specified, the standard dimension pipeline is bypassed entirely. The main agent performs all documentation verification directly.

#### Architecture

```
/audit --documentation [--comprehensive]
    |
    v
Phase 0: Parse flags, detect project type, init temp
    |
    v
Phase 2D-1: Build Inventory (direct bash/glob, ~1-2 min)
    Ground-truth counts AND item names
    |
    v
Phase 2D-2: Per-File Verification (direct, sequential)
    6 OPs per file with explicit evidence
    |
    v
Phase 2D-3: Self-Validation
    Coverage, suspicious patterns, evidence spot-check
    |
    v
Phase 2D-4: Deduplicate into Root Causes
    |
    v
Phase 3: Report (.orca/audit/YYYY-MM-DD-documentation.md)
```

#### Phase 2D-1: Build Inventory

Compute all ground-truth data BEFORE reading any doc file:

```bash
# Agent counts per domain
for dir in agents/*/; do
  domain=$(basename "$dir")
  count=$(ls "$dir"*.md 2>/dev/null | wc -l)
  echo "$domain: $count"
done

# Command list
ls commands/*.md 2>/dev/null | sed 's|commands/||;s|\.md||'

# Hook list
ls hooks/*.sh 2>/dev/null

# MCP server directories
ls -d mcp/*/ 2>/dev/null

# Skill directories
ls -d skills/*/ 2>/dev/null

# Canonical version
grep -i "Version.*OS\|OS.*[0-9]\+\.[0-9]" CLAUDE.md | head -1
```

**Critical requirement:** Enumerate item NAMES, not just counts. The inventory must include the list of agent names, command names, etc. This enables OP-6 set-diff verification.

Store inventory in `.orca/audit/temp/inventory.md` as a structured reference.

#### Phase 2D-2: Per-File Verification

**File selection:**
- **Sampled mode** (default `--documentation`): Always-verify set of key docs -- README.md, CLAUDE.md, CONTRIBUTING.md, all docs/**/*.md, all quick-reference/**/*.md, all dist/*.md, all docs/reference/phase-configs/*.yaml
- **Comprehensive mode** (`--documentation --comprehensive`): Every doc file in inventory

**For each file, apply all 6 verification operations with explicit evidence:**

**OP-1: Count Verification**
Extract every number adjacent to a countable noun (e.g., "133 agents", "14 domains", "37 commands"). Compare each to the ground-truth value from the inventory. Produce evidence:
```
OP-1 | FINDING: ORCA-architecture.md:34 claims "8 audit agents" but inventory shows 0
OP-1 | CLEAN: ORCA-agents.md:12 claims "18 iOS agents" -- verified 18 files in agents/iOS/
```

**OP-2: Link/Path Verification**
Resolve every markdown link `[text](path)` and backtick-enclosed file path. Check target exists. For agent name references in pipeline docs, verify the agent file exists at `agents/<domain>/<name>.md`. Produce evidence:
```
OP-2 | FINDING: seo-optimizer-pipeline.md:23 references "seo-structure-architect" -- agents/seo/seo-structure-architect.md NOT FOUND
OP-2 | CLEAN: ios-pipeline.md:45 links to "../reference/ios-phase-config.yaml" -- file exists
```

**OP-3: Command/Flag Verification**
Check every backtick-enclosed `/command` and `--flag` reference. Verify the command exists at `commands/<name>.md`. For flags, grep the command spec for the flag. Produce evidence:
```
OP-3 | FINDING: ORCA-commands.md:379 claims "/reflect --source" but commands/reflect.md contains no --source flag
OP-3 | CLEAN: ORCA-commands.md:100 references "/audit --comprehensive" -- flag documented in commands/audit.md
```

**OP-4: Version String Verification**
Check every `OS X.Y`, `vX.Y.Z`, `Version: X.Y` pattern against the canonical version from CLAUDE.md. Produce evidence:
```
OP-4 | FINDING: README.md:1 says "ORCA-OS v6.4" but canonical version is OS 7.0
OP-4 | CLEAN: ORCA-commands.md:5 says "OS 7.0" -- matches canonical
```

**OP-5: Infrastructure Verification**
Check every backtick-enclosed path reference (hooks, scripts, config files, directories). Verify the target exists on the filesystem. Produce evidence:
```
OP-5 | FINDING: os-dev-pipeline.md:301 references "logs/README.md" -- file does not exist
OP-5 | CLEAN: audit-pipeline.md:50 references "docs/reference/phase-configs/" -- directory exists
```

**OP-6: List Completeness**
For every table or list that enumerates items from a canonical source (agent lists, command lists, MCP lists), extract the documented items and set-diff against the ground-truth item names from inventory. Report PHANTOM items (in doc, not in reality) and MISSING items (in reality, not in doc). Produce evidence:
```
OP-6 | FINDING: seo-optimizer-pipeline.md lists agents [seo-structure-architect, seo-meta-optimizer, seo-keyword-strategist] -- NONE exist in agents/seo/. PHANTOM: all 3
OP-6 | CLEAN: ORCA-agents.md iOS section lists 18 agents -- matches agents/iOS/ exactly, 0 phantom, 0 missing
```

**After each file:** Record all evidence, release file content from context.

#### Phase 2D-3: Self-Validation

After all files are processed, perform structural self-validation:

**Validation 1: COVERAGE CHECK (comprehensive mode only)**
```
If filesVerified / totalDocFiles < 0.95:
  META-WARNING: INCOMPLETE_COVERAGE
  "Comprehensive mode but only covered N% of files (verified/total)"
```

**Validation 2: SUSPICIOUS PATTERNS**
```
If score > 90 && rootCauses.length === 0:
  META-WARNING: SUSPICIOUSLY_CLEAN
  "Score of N with zero root causes -- verify all 6 operations were genuinely performed"
```

**Validation 3: OPERATION COVERAGE**
```
For each OP (1-6), count how many times it was triggered.
If any OP has zero triggers across all files:
  META-WARNING: SKIPPED_OPERATIONS (severity: critical)
  "OP-N was never triggered -- this suggests entire verification categories were skipped"
```

**Validation 4: EVIDENCE SPOT-CHECK**
```
Pick 3 files marked fully CLEAN at random.
Re-read each file. Find one non-trivial claim (agent name, count, path, flag).
Independently verify it.
If any spot-check fails:
  META-WARNING: VERIFICATION_QUALITY_CONCERN
  "Spot-check found unverified claim in file marked CLEAN -- review all CLEAN verdicts"
```

#### Phase 2D-4: Deduplicate into Root Causes

Group findings by root cause. Key: `operation:canonicalSourceId:expectedValue`.

Example: 5 files claiming "131 agents" when actual is 123 = ONE root cause (RC-001), 5 instances.

Rank root causes by instance count (descending).

---

### Phase 3: Aggregation and Scoring (~2 min)

1. **Collect dimension evidence** from temp files and checkpoints

2. **Calculate weighted score**
   ```
   weights = { structure: 0.10, security: 0.20, dependencies: 0.15, patterns: 0.10,
               architecture: 0.15, tests: 0.15, documentation: 0.10, design: 0.05 }

   // Redistribute design weight if N/A
   if (!dimensions.includes('design')):
     redistributeWeight = weights.design / dimensions.length
     for each dim in dimensions: weights[dim] += redistributeWeight
     delete weights.design

   overallScore = SUM(dimensionScore * dimensionWeight)
   ```

3. **Rank findings by severity**
   ```
   severityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
   allFindings.sort by severityOrder[severity]
   ```

4. **Assign stable finding IDs**
   ```
   For each finding:
     hash = sha256("${type}:${location}:${title}").slice(0, 8)
     Check .orca/audit/audit-index.json for existing ID
     If exists: reuse ID, update lastSeen
     If new: assign AUD-${year}-${counter}
   ```

### Phase 4: Report Generation (~2 min)

1. **Generate Markdown Report**

   Write to `.orca/audit/YYYY-MM-DD-<mode>.md`:

   ```markdown
   # Due Diligence Audit: [Project Name]

   **Date:** YYYY-MM-DD | **Score:** N/100 (Grade) | **Risk:** Level
   **Mode:** Quick|Core|Comprehensive | **Dimensions:** N

   ## TL;DR
   - N critical, N high, N medium, N low findings
   - [Weakest dimension] needs attention (N/100)
   - [Strongest dimension] in good shape (N/100)

   ## Recommendation
   [PROCEED | PROCEED WITH MINOR FIXES | ACQUIRE WITH REMEDIATION PLAN | SIGNIFICANT REMEDIATION REQUIRED | DO NOT PROCEED]

   ## Score Trend
   [Previous scores if audit-index.json exists]

   ## Quality Scorecards

   ### [Dimension]: N/100 (Grade)
   [Key findings with evidence]

   ## Findings by Severity

   ### Critical (N)

   #### AUD-YYYY-NNN: [title]
   - **Dimension:** [name] | **Effort:** [trivial|small|medium|large]
   - **Location:** `file:line`
   - **Evidence:** [what was found]
   - **Verification:** [what check was performed]
   - **Recommendation:** [fix suggestion]
   - **First Seen:** YYYY-MM-DD | **Status:** NEW|RECURRING

   ## Evidence Summary
   | Dimension | Files Scanned | Files Read | Checks Performed | Findings |
   |-----------|--------------|------------|------------------|----------|
   [per-dimension methodology]
   ```

2. **Update Audit Index**

   Write to `.orca/audit/audit-index.json` with audit history, finding persistence, and trend data.

3. **Display Terminal Summary**

   ```
   DUE DILIGENCE AUDIT COMPLETE

   Scope: [Mode] ([N] dimensions)
   Score: N/100 (Grade) | Risk: Level

   Dimension Scores:
     Structure:      N/100 (Grade)
     Security:       N/100 (Grade) [<- ATTENTION if lowest]
     Dependencies:   N/100 (Grade)
     [...]

   Findings:
   - N critical [BLOCK RELEASE if any]
   - N high
   - N medium
   - N low

   Top Priority:
     AUD-YYYY-NNN: [title] ([dimension])

   Recommendation: [recommendation]

   Report: .orca/audit/YYYY-MM-DD-<mode>.md
   ```

   For `--documentation` mode, use the documentation-specific terminal summary format:

   ```
   DOCUMENTATION VERIFICATION AUDIT COMPLETE

   Mode: Sampled|Comprehensive
   Score: N/100 (Grade) | Risk: Level
   Files Verified: N of M (N%)

   Root Causes: N
     RC-001: [title] (N instances)
     RC-002: [title] (N instances)

   Operations:
     OP-1 Count Verification:    N checks, N findings
     OP-2 Link Verification:     N checks, N findings
     OP-3 Command/Flag:          N checks, N findings
     OP-4 Version String:        N checks, N findings
     OP-5 Infrastructure:        N checks, N findings
     OP-6 List Completeness:     N checks, N findings

   Report: .orca/audit/YYYY-MM-DD-documentation.md
   ```

---

## Scoring System

### Dimension Scores: 0-100

Each dimension starts at 100 with deductions per finding:

**Structure:**
- dead_code_file: -5 each (max -25)
- naming_inconsistency: -3 each (max -20)
- giant_file_500plus: -5 each (max -20)
- poor_organization: -5 to -15

**Security:**
- exposed_secret: -25 each (CRITICAL - caps score at 50)
- insecure_storage: -15 each
- http_endpoint: -10 each (max -30)
- missing_validation: -5 each (max -20)

**Dependencies:**
- critical_vulnerability: -15 each
- high_vulnerability: -8 each
- outdated_1year: -5 each (max -20)
- unused_dependency: -2 each (max -10)

**Patterns:**
- anti_pattern: -5 each (max -25)
- inconsistent_error_handling: -3 each (max -15)
- mixed_paradigms: -5 each (max -20)
- style_inconsistency: -2 each (max -10)

**Architecture:**
- circular_dependency: -10 each (no cap)
- high_coupling: -5 each (max -20)
- low_cohesion: -5 each (max -15)
- boundary_violation: -5 each (max -20)

**Tests:**
- low_coverage: -10 (if <60%)
- missing_assertions: -5 per file (max -20)
- shared_state: -5 each (max -15)
- flakiness_indicator: -3 each (max -15)

**Documentation:**
- missing_critical_doc: -10 each (no cap)
- stale_documentation: -5 each (max -20)
- inaccurate_claim: -8 each (max -25)
- incomplete_documentation: -3 each (max -15)

**Design (UI only):**
- hardcoded_value: -3 each (max -15)
- inconsistent_component: -5 each (max -15)
- missing_accessibility: -3 each (max -15)
- token_violation: -3 each (max -15)

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

## Context Management

Each dimension follows a **Scan-Verify-Release** cycle to manage context:

1. **SCAN** (low context): Bash/grep commands return file paths and counts. ~500-1000 tokens.
2. **VERIFY** (controlled context): Read specific files for evidence. Budget ~5000-8000 tokens of file content per dimension.
3. **RELEASE** (context recovery): Write evidence to temp file. After checkpoint, raw file contents are no longer needed in context.

**What persists across dimensions** (running state, ~2000-3000 tokens):
- Project map from Phase 1
- Running findings list (compact: id, location, severity, deduction only)
- Running dimension scores

**What does NOT persist:**
- Raw file contents from previous dimensions
- Detailed evidence (written to temp files)

---

## Incremental Mode (--since)

When `--since <commit>` is specified:

1. Get changed files: `git diff --name-only <commit>..HEAD`
2. Scope all dimension checks to only analyze changed files
3. Compare against last full audit from audit-index.json
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
4. **Multiple matches:** Prompt user with AskUserQuestion
5. **No matches:** Error with suggestions

Run all applicable dimensions scoped to the matched files/directory only.

---

## Guardrails

- Audit NEVER modifies code (read-only inspection)
- Audit findings are SUGGESTIONS, not automatic fixes
- Scores are indicative, not absolute quality measures
- Finding IDs are stable across audits (via content hash)
- Audit runs independently of pipeline gates
- Every CLEAN verdict must include verification evidence
- Every FINDING must include the claim, verification method, and result

---

## Cleanup

After report generation:
```bash
rm -rf .orca/audit/temp/
```

---

## Response Awareness

During audit execution:

- `#COMPLETION_DRIVE`: Note when guessing vs. verifying finding severity
- `#PATH_DECISION`: Document why certain files were sampled vs. skipped
- `#POISON_PATH`: Avoid false positives that waste user time

---

## Begin Execution

Execute for: **$ARGUMENTS**
