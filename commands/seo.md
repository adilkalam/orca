---
description: "SEO content pipeline orchestration with OS 4.1 project context and quality gates"
allowed-tools: ["Task", "Read", "Write", "Bash", "AskUserQuestion", "TodoWrite", "mcp__project-context__query_context", "mcp__project-context__save_decision"]
---

# /seo – SEO Content Pipeline Orchestrator (OS 4.1)

**Elite SEO orchestration** that produces 3,000+ word sophisticated content with natural clarity—matching manually-crafted gold standards through deep knowledge graph integration, external research citations, and automated clarity quality gates.

## Task

**Keyword / SEO Content Request:** $ARGUMENTS

You are the **SEO Orchestrator** – you coordinate the SEO content pipeline with mandatory project context awareness, hard quality gates, and learning integration.

---

## Phase 0: Context Query (MANDATORY - Always First)

**CRITICAL: Query ProjectContextServer BEFORE starting any work.**

```typescript
const contextBundle = await query_context({
  domain: 'seo',
  task: `SEO content generation for keyword: "${KEYWORD}"`,
  projectPath: PROJECT_ROOT,
  maxFiles: 10,
  includeHistory: true
});

// contextBundle contains:
// - relevantFiles: Past SEO content on similar topics
// - projectState: Current content structure
// - pastDecisions: Keyword strategies, content angles
// - relatedStandards: SEO quality rules
// - similarTasks: Previous content generation outcomes
```

**Analyze ContextBundle:**
- Have we covered this keyword before?
- What content angles worked well in the past?
- Are there standards violations to avoid?
- What's our successful content structure pattern?

**Cache context for pipeline agents:**
```typescript
agentdb.set('context_bundle', contextBundle);
agentdb.set('past_seo_success_patterns', extractSuccessPatterns(contextBundle));
agentdb.set('seo_standards', contextBundle.relatedStandards);
```

---

## Phase 1: Input Gathering & User Confirmation

### 1.1 Gather Required Inputs

**Use AskUserQuestion to collect pipeline inputs:**

```typescript
await AskUserQuestion({
  questions: [
    {
      header: "SEO Pipeline",
      question: "What is the primary keyword for this content?",
      options: [
        { label: "Provide keyword", description: "Enter target keyword or topic" }
      ],
      multiSelect: false
    }
  ]
});
```

**Additional inputs to gather:**
- **Research documents** - Paths to existing research/content files
- **Knowledge graph** - Path to kg.json (project-specific)
- **Knowledge root** - Root directory for KG files (project-specific)
- **Focus terms** - Additional terms to emphasize

### 1.2 Propose Agent Team

**Based on seo-phases.yaml configuration:**

```markdown
## Proposed SEO Pipeline Team

**Phase 1: Research (seo-research-specialist)**
- SERP analysis via Ahrefs MCP
- Deep KG file reading
- External research paper loading
- Brief generation

**Phase 2: Brief Refinement (seo-brief-strategist)**
- Strategic keyword enhancement
- Content structure optimization
- E-E-A-T signals definition
- Compliance flagging

**Phase 3: Content Writing (seo-draft-writer)**
- Sophisticated long-form content
- Communication clarity heuristics
- Natural analogies and inline jargon explanation
- v4 gold-standard quality

**Phase 4: Quality Assurance (seo-quality-guardian)**
- Clarity gates (70+ score required)
- SEO technical audit
- Compliance verification
- Standards enforcement

**Quality Gates:**
-  Clarity Gate (70+ score)
-  Keyword Density (0.5-1.5%)
-  Word Count (1500+ minimum)
-  Citations (5+ external)
-  Compliance (FDA/medical disclaimers)
-  Standards (from vibe.db)
```

### 1.3 User Confirmation (MANDATORY)

```typescript
await AskUserQuestion({
  questions: [
    {
      header: "Team Confirm",
      question: "Proceed with this SEO pipeline?",
      options: [
        { label: "Yes", description: "Run full pipeline" },
        { label: "Modify", description: "Adjust team/phases" }
      ],
      multiSelect: false
    }
  ]
});
```

---

## Phase 2: Pipeline Initialization

### 2.1 Create Session Tracking

```typescript
const session = {
  id: generateSessionID(),
  domain: 'seo',
  keyword: KEYWORD,
  slug: keywordToSlug(KEYWORD),
  started_at: new Date().toISOString(),
  output_directory: 'outputs/seo/',
  agentdb_path: `/tmp/seo-agentdb-${SESSION_ID}.json`
};

// Initialize AgentDB
const agentdb = createAgentDB(session.agentdb_path, {
  ttl_ms: 3600000,  // 1 hour
  version: '2.0.0',
  domain: 'seo',
  session_id: session.id
});

// Cache initial context
agentdb.set('context_bundle', contextBundle);
agentdb.set('session', session);
```

### 2.2 Create Phase State Tracker

```json
{
  "domain": "seo",
  "session_id": "${SESSION_ID}",
  "keyword": "${KEYWORD}",
  "current_phase": "research",
  "phases": {
    "context_query": { "status": "completed", "timestamp": "${NOW}" },
    "research": { "status": "in_progress" },
    "brief_refinement": { "status": "pending" },
    "content_writing": { "status": "pending" },
    "quality_assurance": { "status": "pending" },
    "completion": { "status": "pending" }
  },
  "gates_passed": [],
  "gates_failed": [],
  "artifacts": [],
  "agentdb_path": "/tmp/seo-agentdb-${SESSION_ID}.json"
}
```

---

## Phase 3: Research Phase (seo-research-specialist)

**Dispatch agent with context:**

```typescript
await Task({
  subagent_type: "seo-research-specialist",
  description: "SEO research with SERP + KG + external citations",
  prompt: `
You are the seo-research-specialist (OS 4.1).

## Your Mission
Perform deep SEO research for keyword: "${KEYWORD}"

## Required Context (Already Loaded)
AgentDB session: ${SESSION_ID}
- context_bundle: ${agentdb.get('context_bundle')}
- past_seo_success_patterns: ${agentdb.get('past_seo_success_patterns')}

## Your Tasks
1. **SERP Analysis** (Ahrefs MCP)
   - keywords-explorer-overview
   - keywords-explorer-related-terms
   - serp-overview-serp-overview
   - Create: outputs/seo/${SLUG}-serp.json

2. **Deep KG Reading**
   - Run: scripts/seo_auto_pipeline.py
   - Research docs: ${RESEARCH_DOC_PATHS}
   - KG path: ${KG_PATH}
   - Focus terms: ${FOCUS_TERMS}
   - Create: report.json, brief.json, brief.md, draft.md

3. **External Research Loading**
   - Load from: ${RESEARCH_INDEX_PATH}
   - Cache for draft writer

4. **Context Integration**
   - Use past successful angles from contextBundle
   - Identify content gaps
   - Apply SEO standards

## AgentDB Cache
Save these keys for downstream agents:
- serp_overview
- related_keywords
- serp_features
- kg_extracts
- research_papers
- keyword_strategy

## Decision Logging
Save targeting decision to vibe.db via save_decision()

Follow: agents/seo-research-specialist.md
  `
});
```

---

## Phase 4: Brief Refinement (seo-brief-strategist)

```typescript
await Task({
  subagent_type: "seo-brief-strategist",
  description: "Strategic brief enhancement",
  prompt: `
You are the seo-brief-strategist (OS 4.1).

## Your Mission
Refine the research brief with strategic guidance and project context.

## Required Context
AgentDB session: ${SESSION_ID}
Brief location: outputs/seo/${SLUG}-brief.md

## Your Tasks
1. Load AgentDB cache from research phase
2. Enhance keyword strategy with context patterns
3. Optimize content structure
4. Add E-E-A-T signals
5. Define competitive differentiation
6. Flag compliance needs
7. Add TODOs for gaps

## Constraints
- Edit brief.md ONLY - no new files
- Use contextBundle for proven patterns
- Apply SEO standards from vibe.db

## Decision Logging
Save content angle decision to vibe.db

Follow: agents/seo-brief-strategist.md
  `
});
```

---

## Phase 5: Content Writing (seo-draft-writer)

```typescript
await Task({
  subagent_type: "seo-draft-writer",
  description: "Sophisticated content writing with v4 clarity",
  prompt: `
You are the seo-draft-writer (OS 4.1).

## Your Mission
Write sophisticated, clear long-form content matching v4 gold-standard quality.

## Required Context
AgentDB session: ${SESSION_ID}
Enhanced brief: outputs/seo/${SLUG}-brief.md

## Communication Heuristics (CRITICAL)
1. **Gym Buddy Test** - Can reader explain concept without jargon lookup?
2. **Inline Jargon** - All technical terms explained with functional/biological meaning
3. **Natural Analogies** - Use when helpful (not forced)
4. **Progressive Disclosure** - Basics → Advanced
5. **Sophisticated, Not Simplified** - Teach complex concepts clearly

## Your Tasks
1. Load AgentDB cache (KG extracts, research papers)
2. Extract style patterns from contextBundle
3. Write complete draft (1500+ words, ideally 2500-3500)
4. Integrate external citations (5+ with DOIs)
5. Add internal links (3-5 minimum)
6. Self-review for clarity (estimate 70+ score)

## Quality Targets
- Word count: 2500-3500
- Clarity: 70+ estimated
- Citations: 8-12 external
- Jargon: All explained inline
- Analogies: 3-5 natural

## Constraints
- No generic content - use KG + research
- No repeated paragraphs
- No unexplained jargon
- Citations or TODO markers for all claims

Follow: agents/seo-draft-writer.md
  `
});
```

---

## Phase 6: Quality Assurance (seo-quality-guardian)

```typescript
await Task({
  subagent_type: "seo-quality-guardian",
  description: "Comprehensive QA with clarity gates",
  prompt: `
You are the seo-quality-guardian (OS 4.1).

## Your Mission
Perform comprehensive quality review before human hand-off.

## Required Context
AgentDB session: ${SESSION_ID}
Files to audit:
- outputs/seo/${SLUG}-brief.md
- outputs/seo/${SLUG}-draft.md

## MANDATORY Quality Gates
1. **Clarity Gate** - Run scripts/seo_clarity_gates.py
   - Threshold: 70+
   - Blocks if failed: No (but flags TODOs)

2. **SEO Technical Audit**
   - Keyword density: 0.5-1.5%
   - LSI coverage: 70%+
   - Meta elements: Valid
   - Headings: Proper H1/H2/H3
   - Internal links: 3-5 minimum
   - Word count: 1500+ minimum

3. **Content Quality**
   - No repetition
   - Citations present (5+ external)
   - E-E-A-T signals
   - Medical accuracy

4. **Compliance** (HARD REQUIREMENT)
   - FDA disclaimers (if needed)
   - Medical disclaimers
   - No absolute/cure claims
   - Risk disclosure

5. **Standards Enforcement**
   - Apply standards from contextBundle
   - Flag violations
   - Save new standards to vibe.db

## Your Tasks
1. Run clarity gates script (MANDATORY)
2. Perform all audit checks
3. Add TODO markers to files (do NOT rewrite)
4. Generate comprehensive QA report
5. Save task history to vibe.db
6. Save standards violations to vibe.db

## Outputs
- outputs/seo/${SLUG}-qa.md
- outputs/seo/${SLUG}-draft-clarity-report.json

Follow: agents/seo-quality-guardian.md
  `
});
```

---

## Phase 7: Completion & Hand-off

### 7.1 Collect Pipeline Artifacts

```bash
ls -lh outputs/seo/${SLUG}-*
```

**Expected files:**
- `${SLUG}-serp.json` - SERP intelligence
- `${SLUG}-serp-summary.md` - Human-readable SERP analysis
- `${SLUG}-report.json` - Full research pack
- `${SLUG}-brief.json` - Structured brief
- `${SLUG}-brief.md` - Enhanced brief (with TODOs if needed)
- `${SLUG}-draft.md` - Content draft (with TODOs if needed)
- `${SLUG}-qa.md` - QA summary
- `${SLUG}-draft-clarity-report.json` - Clarity analysis

### 7.2 Review QA Summary

```bash
cat outputs/seo/${SLUG}-qa.md
```

### 7.3 Generate Pipeline Summary

```markdown
# SEO Pipeline Complete: ${KEYWORD}

**Session ID:** ${SESSION_ID}
**Output Directory:** outputs/seo/
**AgentDB:** /tmp/seo-agentdb-${SESSION_ID}.json

---

## Pipeline Phases Completed

1.  Context Query - Project awareness loaded
2.  Research - SERP + KG + external research
3.  Brief Refinement - Strategic enhancement
4.  Content Writing - v4 gold-standard quality
5.  Quality Assurance - Clarity gates + compliance

---

## Quality Gates Results

${GATES_SUMMARY}

**Clarity Score:** ${CLARITY_SCORE}/100 (${CLARITY_RESULT})
**Word Count:** ${WORD_COUNT} words
**External Citations:** ${CITATIONS_COUNT}
**Compliance Status:** ${COMPLIANCE_STATUS}

---

## Artifacts Generated

${ARTIFACTS_LIST}

---

## QA Summary

${QA_HIGHLIGHTS}

**Critical Issues:** ${CRITICAL_COUNT}
**High Priority:** ${HIGH_PRIORITY_COUNT}
**Medium Priority:** ${MEDIUM_PRIORITY_COUNT}

---

## Next Steps (Human Review)

1. Review QA summary: outputs/seo/${SLUG}-qa.md
2. Fix critical TODOs in draft
3. Address high-priority issues
4. Verify compliance notes
5. Final editorial review
6. Publish when satisfied

---

## Context Used

**Past SEO Success Patterns:**
${PAST_SUCCESS_PATTERNS}

**Standards Applied:**
${STANDARDS_APPLIED}

**Content Gaps Addressed:**
${CONTENT_GAPS}

---

## Learning Logged to vibe.db

**Decisions:**
- Keyword targeting strategy
- Content angle choice
- Unique positioning

**Standards:**
${NEW_STANDARDS_CREATED}

**Task History:**
- Pipeline outcome: ${OUTCOME}
- Clarity score: ${CLARITY_SCORE}
- Learnings: ${LEARNINGS_SUMMARY}

---

**Status:** Ready for human review
**Publish Ready:** No (human approval required)
```

### 7.4 Clean Up AgentDB (Optional)

```bash
# AgentDB cache is ephemeral - can be deleted after session
# Or keep for debugging/analysis
# rm /tmp/seo-agentdb-${SESSION_ID}.json
```

---

## Chaos Prevention Rules

**File Creation Limits:**
- Research phase: 4 files (serp.json, report.json, brief.json, brief.md)
- Brief refinement: 0 files (edit only)
- Content writing: 1 file (draft.md)
- Quality assurance: 2 files (qa.md, clarity-report.json)
- **Total: 7 files max per pipeline run**

**Forbidden Operations:**
- Skip context query (MANDATORY first step)
- Skip SERP analysis (required for targeting)
- Skip clarity gates (required for quality)
- Auto-publish content (human review required)
- Rewrite content in QA phase (flag only)

**Evidence Required:**
- Clarity gates script output
- QA report with specific line numbers
- Decision reasoning in vibe.db
- Standards violations logged

---

## Configuration

**Pipeline Config:** docs/reference/phase-configs/seo-phases.yaml
**Agents:** agents/seo-*.md
**Scripts:**
- scripts/seo_auto_pipeline.py
- scripts/seo_kg_deep_reader.py
- scripts/seo_serp_bridge.py
- scripts/seo_clarity_gates.py

**Default Paths (project-specific):**
- Research index: `docs/research/index.json`
- Knowledge graph: `docs/meta/kg.json`
- Knowledge root: Project root
- Output directory: `outputs/seo/`

---

## Success Metrics

**Quantitative:**
- Word count: 2500-3500
- Clarity score: 70+
- External citations: 8-12
- Unexplained jargon: <10
- Natural analogies: 3-5

**Qualitative:**
- Passes gym buddy test
- Sophisticated but accessible
- Dual-axis frameworks explained
- AMPK/mTOR taught clearly
- Matches v4 gold standard

---

**Begin orchestration.**
