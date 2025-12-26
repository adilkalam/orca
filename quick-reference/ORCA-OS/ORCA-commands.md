# OS 4.2 Commands Quick Reference

**Last Updated:** 2025-12-25
**Version:** OS 4.2
**Total Commands:** 32

---

## Three-Tier Routing

All `/orca-*` lane commands support three execution modes:

| Mode | Flag | Path | Gates | Use Case |
|------|------|------|-------|----------|
| **Default** | (none) | Light + Gates | YES | Most work |
| **Tweak** | `-tweak` | Light (pure) | NO | Speed iteration |
| **Complex** | `--complex` | Full pipeline | YES | Architecture work |

---

## Lane Orchestrator Commands (6)

### `/ios` - iOS Lane
```bash
/ios "fix button padding"           # Default: light + gates
/ios -tweak "try animation"         # Tweak: no gates
/ios --complex "auth flow"          # Complex: full pipeline
```
**Agents:** ios-grand-architect, ios-builder, ios-standards-enforcer, ios-ui-reviewer, ios-verification
**MCP:** XcodeBuildMCP

### `/nextjs` - Next.js Lane
```bash
/nextjs "fix spacing"               # Default: light + gates
/nextjs -tweak "try padding"        # Tweak: no gates
/nextjs --complex "dark mode"       # Complex: full pipeline
```
**Agents:** nextjs-grand-architect, nextjs-builder, nextjs-standards-enforcer, nextjs-design-reviewer
**Auto-detected specialists:** tailwind-specialist (if tailwind.config.*), shadcn-specialist (if components.json or components/ui/)

### `/django-react` - Django + React TypeScript Lane
```bash
/django-react "add user profile API"       # Default: light + gates
/django-react -tweak "try new endpoint"    # Tweak: no gates
/django-react --complex "auth system"      # Complex: full pipeline
```
**Agents:** django-react-grand-architect, django-react-builder, django-react-standards-enforcer, django-react-verification

### `/expo` - Expo/React Native Lane
```bash
/expo "fix button styling"
/expo -tweak "try different colors"
/expo --complex "offline sync"
```
**Agents:** expo-grand-orchestrator, expo-builder-agent, expo-verification-agent

### `/seo` - SEO Content Lane
```bash
/seo "keyword research for peptides"

# Optimize existing content
/seo --optimize draft /path/to/draft.md --keyword "target keyword"
/seo --optimize url https://example.com/article --keyword "target keyword"

# Combined: create content then optimize
/seo --with-optimize "target keyword"
```
**Agents:** seo-research-specialist, seo-brief-strategist, seo-draft-writer, seo-quality-guardian, seo-optimizer
**MCP:** ahrefs, crawl4ai

### `/research` - Deep Research Lane
```bash
/research "How do mTOR inhibitors work?"
/research --deep "Complete mechanism analysis"
```
**Agents:** research-web-search-subagent, research-site-crawler-subagent, research-answer-writer, research-fact-checker
**MCP:** crawl4ai

### `/orca-os-dev` - OS Development Lane
```bash
/orca-os-dev "add new specialist agent"
/orca-os-dev "update ios pipeline"
```
**Agents:** os-dev-architect, os-dev-builder, os-dev-standards-enforcer, os-dev-verification

### `/orca` - Universal Router
```bash
/orca "task description"
/orca --audit                     # Audit last 5 tasks
/orca --audit "last 10 tasks"     # Audit with scope
/orca --audit "iOS work"          # Audit specific domain
```
Detects domain and routes to appropriate lane command.
**Special Mode:** `--audit` runs Response-Aware behavior analysis instead of pipeline execution.

### `/orca-pipeline` - Pipeline Creation Wizard
```bash
/orca-pipeline ml-ops "ML model deployment"           # Full 5-phase wizard
/orca-pipeline --quick data-analysis                   # Template Gallery mode
```
Meta-pipeline for creating new domain pipelines. 5 phases: Interview → Research → Blueprint → Generate → Validate.
**Agents:** orca-pipeline-orchestrator, orca-pipeline-researcher, orca-pipeline-architect, orca-pipeline-generator, orca-pipeline-validator
**Quick Mode Templates:** hybrid (8 agents), research-heavy (7), build-heavy (5), minimal (4)

---

## Planning Commands (1)

### `/plan` - Unified Requirements + RA Blueprint
```bash
/plan "Add dark mode support"
/plan --visual "UI redesign"
/plan --systems "Database migration"
/plan --debug "Fix checkout bug"
/plan --deepthink "Complex architectural decision"   # Full 8-step pipeline
/plan -complex --deepthink "Migrate to GraphQL"      # Max rigor
```
**Cognition Flags:** `--visual`, `--systems`, `--debug`, `--model`, `--creative`, `--causal`, `--decide`, `--deepthink`
**Tier Flags:** `-tweak` (quick), (none) (standard), `-complex` (deep)
Creates: `.claude/requirements/<id>/06-requirements-spec.md`

---

## Reasoning Commands (5)

### `/think` - Enhanced Cognitive Scaffolding
```bash
/think --debug "Why is this test flaky?"
/think --model five-whys "Why do users drop off?"
/think --model pre-mortem "How could this migration fail?"
/think --visual --diagram sequence "API auth flow"
/think --creative "Ideas for onboarding"
/think --decide "Microservices vs monolith"
/think --checkpoint extended --seq "Plan refactoring"
/think --meta "What is my training doing here?"  # Substrate observation mode
```
**Operations:** --seq, --model, --debug, --creative, --visual, --meta, --science, --collab, --decide, --socratic, --argue, --systems, --research, --analogy, --causal, --stats, --sim, --optimize, --tree, --beam, --mcts, --graph, --ooda, --ulysses

**Mental Models (--model):** five-whys, fermi-estimation, abstraction-laddering, steelmanning, rubber-duck, opportunity-cost, constraint-relaxation, time-horizon-shifting, impact-effort-grid, assumption-surfacing, trade-off-matrix, decomposition, inversion, pre-mortem, first-principles

**Enhancements:** --checkpoint, --model <name>, --diagram <type>, --session <id>
**MCP:** cognition-mcp
**Meta Modes:** Standard (process-level) + Substrate Observation (V1-V6 reflection insights)
**Templates:** `quick-reference/mental-models/*.md`

### `/contemplate` - Reasoning Strategy Advisor
```bash
/contemplate "Should we use microservices?"
/contemplate "How to debug this failure?"
```
Recommends which /think operations to use.


### `/ultra-think` - Deep Multi-Dimensional Analysis
```bash
/ultra-think "complex architectural problem"
```

### `/deepthink` - Automated 8-Step Complex Problem Pipeline
```bash
/deepthink "How should we architect the notification system?"
/deepthink "What's causing our performance regression?"
```
Runs full ORIENT→ANTICIPATE→GENERATE→EVALUATE→COMMIT cycle.
**MCP:** cognition-mcp

### `/challenge` - Adversarial Proposal Analysis
```bash
/challenge "Use microservices for this feature"
/challenge --quick "Add caching layer"
/challenge --deep "Migrate to serverless"
```
Systematically attacks proposals using cognition-mcp.
**Modes:** --quick (causal_analysis), default (+ argumentation + decide), --deep (+ simulation + ethical)
**MCP:** cognition-mcp (sessions persisted to ~/.orca-cognition/)

---

## Audit Commands (1)

### `/audit` - Codebase Quality Auditing
```bash
/audit                           # Quick health check (~2 min)
/audit --comprehensive           # All 10 dimensions (~25 min)
/audit --core                    # Core 5 dimensions (~10 min)
/audit --item design-system      # Focused audit on specific area
/audit --item page /checkout
/audit --verbose                 # Full findings (default: TL;DR)
```
**Operations:** Proactive quality surfacing across 10 dimensions
**Dimensions (Core 5):** Architecture, Security, Performance, Types, Standards
**Dimensions (Extended 5):** Accessibility, Dependencies, Documentation, Design System, Test Coverage
**Output:** `.claude/audit/YYYY-MM-DD-<scope>.md` + `audit-index.json`
**Finding Format:** AUD-YYYY-NNN with type, severity, location, recommendation, effort, fixCommand
**Integration:** `/orca fix AUD-YYYY-NNN` to route fixes to appropriate lane
**MCP:** cognition-mcp (audit operation)

---

## Utility Commands (12)

### `/enhance` - Prompt Enhancement
```bash
/enhance "make the UI better"
/enhance -clarify "fix the bug"
```

### `/root-cause` - Root Cause Analysis
```bash
/root-cause "Tests failing intermittently"
/root-cause "Build errors on CI"
```

### `/design-dna` - Design System Management
```bash
/design-dna init                    # First-time setup
/design-dna audit                   # Check current state
/design-dna generate "spacing"      # Generate tokens
```

### `/design-review` - UI/UX Audit
```bash
/design-review                      # Full design review
```

### `/design-review-from-screenshot` - Screenshot-Based Design Review
```bash
/design-review-from-screenshot /path/to/screenshot.png
```
Performs design review from a screenshot image. Useful for reviewing mockups or external designs.

### `/clone-website` - Website Cloning
```bash
/clone-website https://example.com
```

### `/session-save` / `/session-resume`
```bash
/session-save                       # Save context
/session-resume                     # Resume context
```

### `/project-memory` - Workshop Interface
```bash
/project-memory status              # Current state
/project-memory why "auth"          # Query decisions
/project-memory recent              # Recent activity
```

### `/memory-search` - Unified Memory Search
```bash
/memory-search "auth decisions"     # Search across Workshop + vibe.db
```
Searches all memory systems for relevant context and decisions.

### `/project-code` - Code Intelligence
```bash
/project-code sync                  # Index codebase
/project-code search "auth"         # Search code
/project-code symbol "UserService"  # Find symbols
```

### `/reflect` - Self-Improvement
```bash
/reflect                            # Analyze recent work
/reflect learn "Always check types" # Add rule
/reflect status                     # View rules
```

### `/self-improve` - Improvement Bus
```bash
/self-improve                       # Run improvement cycle
/self-improve --dry-run             # Preview only
```

---

## Command Architecture

### Role Boundaries
- Orchestrators NEVER write code
- Only coordinate agents via Task tool
- Read phase_state.json for resumption

### Quality Gates
- Standards: >=90 to pass
- Design QA: >=90 to pass
- Build/Test: PASS/FAIL

### State Preservation
All orchestrators maintain state in `.claude/orchestration/phase_state.json`

---

## Command Locations

### Source (ORCA-OS Repo)
```
$ORCA_OS_PATH/commands/
```

### Deployed (Global)
```
~/.claude/commands/
```

---

## Command-Agent Dependencies

| Command | Primary Agents |
|---------|----------------|
| `/ios` | ios-grand-architect, ios-builder, ios-verification |
| `/nextjs` | nextjs-grand-architect, nextjs-builder, nextjs-verification-agent |
| `/django-react` | django-react-grand-architect, django-react-builder, django-react-verification |
| `/expo` | expo-grand-orchestrator, expo-builder-agent, expo-verification-agent |
| `/research` | research-web-search-subagent, research-site-crawler-subagent, research-answer-writer |
| `/seo` | seo-research-specialist, seo-brief-strategist, seo-draft-writer, seo-optimizer |
| `/orca-os-dev` | os-dev-architect, os-dev-builder, os-dev-standards-enforcer |
| `/orca-pipeline` | orca-pipeline-orchestrator, orca-pipeline-researcher, orca-pipeline-generator |

---

_Source of truth: `docs/reference/os-dependency-graph.yaml`_
_Last sync: 2025-12-25_
