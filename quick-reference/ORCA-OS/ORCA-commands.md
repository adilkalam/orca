# OS 6.2 Commands Quick Reference

**Last Updated:** 2026-02-17
**Version:** OS 6.2
**Total Commands:** 39 (+ orca-record CLI with 16 subcommands)

---

## Routing Modes

All `/orca-*` lane commands support four execution modes:

| Mode | Flag | Path | Gates | Use Case |
|------|------|------|-------|----------|
| **Light** | `--light` | Light orchestrator | YES | Confident users, skip confirmation |
| **Default** | (none) | Light + Confirmation | YES | Most work |
| **Tweak** | `-tweak` | Builder direct | NO | Speed iteration |
| **Complex** | `--complex` | Full pipeline | YES | Architecture work |

---

## Lane Orchestrator Commands (12)

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

# Auto-discover keyword (omit --keyword to trigger discovery)
/seo --optimize url https://example.com/article
/seo --optimize draft /path/to/draft.md

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

### `/typography` - Typography/Font Management Lane
```bash
/typography "Reduce terminal curl on DomaineSansCustom"      # Default: with checkpoints
/typography --tweak "Make the period rounder in Calibre"     # Tweak: direct to specialist
/typography --complex "Create Light and Bold via stroke offsetting"
/typography "Export DomaineSansCustom to TTF for Epson"
/typography "Recommend fonts for technical documentation"

# Typography Explorer (interactive testing tool)
/typography --explorer                       # Auto-detect format and context
/typography --explorer --nextjs              # Generate as Next.js React components
/typography --explorer --html                # Generate as standalone HTML
/typography --explorer --context store       # E-commerce product UI context
/typography --explorer --context markdown    # Article/documentation context
```
**Agents:** typography-orchestrator, glyph-editor, ttf-exporter, typography-advisor, typography-explorer-generator, path-guardian
**Workflows:** glyph editing (fontTools), TTF export (Epson LabelWorks), font selection/pairing, explorer generation


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
/orca-pipeline analytics "Data analytics pipeline"    # Full 5-phase wizard
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
/plan --problem-solve "Complex architectural decision"   # Full 8-step pipeline
/plan -complex --problem-solve "Migrate to GraphQL"      # Max rigor
```
**Cognition Flags:** `--visual`, `--systems`, `--debug`, `--model`, `--creative`, `--causal`, `--decide`, `--problem-solve`
**Tier Flags:** `-tweak` (quick), (none) (standard), `-complex` (deep)
Creates: `.claude/requirements/<id>/06-requirements-spec.md`

---

## Reasoning Commands (6)

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
/think --deep "Complex problem needing extended analysis"  # Extended thinking
/think --deep --decide "Major architecture decision"  # Combined deep + decide
```
**Operations:** --seq, --model, --debug, --creative, --visual, --meta, --science, --collab, --decide, --socratic, --argue, --systems, --research, --analogy, --causal, --stats, --sim, --optimize, --tree, --beam, --mcts, --graph, --ooda, --ulysses

**Mental Models (--model):** five-whys, fermi-estimation, abstraction-laddering, steelmanning, rubber-duck, opportunity-cost, constraint-relaxation, time-horizon-shifting, impact-effort-grid, assumption-surfacing, trade-off-matrix, decomposition, inversion, pre-mortem, first-principles

**Enhancements:** --checkpoint, --model <name>, --diagram <type>, --session <id>
**NEW: --deep flag:** Extended thinking mode (8-12+ thoughts with review/synthesis checkpoints, branching enabled)
**MCP:** cognition-mcp
**Meta Modes:** Standard (process-level) + Substrate Observation (V1-V6 reflection insights)
**Templates:** `quick-reference/thinking-models/*.md`
**Persistence:** Appends to daily log `.claude/cognition/YYYYMMDD-daily.md` + Workshop entry
**Handoff Guidance:** Includes "Next Steps" section with contextual command recommendations

### `/contemplate` - Reasoning Strategy Advisor
```bash
/contemplate "Should we use microservices?"
/contemplate "How to debug this failure?"
```
Recommends which /think operations to use.
**NEW: Problem-Type Detection:** Classifies problems (EXPLORATION, COMPOSITIONAL, AGGREGATION, ARITHMETIC, CODE, DECISION, RISK, STRATEGIC) with evidence-backed routing table
**Routing:** Maps problem types to optimal techniques (e.g., Tree-of-Thought for exploration: 74% vs 4%)
**Persistence:** Appends to daily log `.claude/cognition/YYYYMMDD-daily.md` + Workshop entry
**Handoff Guidance:** Includes "Next Steps" section with contextual command recommendations


### `/ultra-think` - Deep Multi-Dimensional Analysis
```bash
/ultra-think "complex architectural problem"
```
**Persistence:** Creates `.claude/cognition/YYYYMMDD-HHMM-<slug>.md` + Workshop entry

### `/deepthink` - Depth-First Exploration
```bash
/deepthink "Why does user retention drop after day 3?"
/deepthink --light "Quick question about caching"
/deepthink --rigorous "Major architectural exploration"
```
Depth-first exploration with constraint chain (default) and route-based modes (MAP, INVERT, PERSPECTIVES, EDGES, META, DEEP).
**Modes:** --light (quick, no constraints), (default with constraint chain), --rigorous (constraint chain + full pre-mortem per mode)
**Constraint Chain:** After each mode, generates constraints (FORWARD, FORBIDDEN, QUESTION) that must be addressed (RESOLVED, ACKNOWLEDGED, DEFERRED) before finishing. Hard block if unresolved. DEFERRED items shown in final output.
**Enhanced Modes:** MAP (systems + causal), INVERT (pre-mortem + reflexion), PERSPECTIVES (collaborative + steelmanning), EDGES (creative + analogical), DEEP (self-consistency via 3 parallel chains)
**External Verification:** 6-question self-check including external-facing critique (64.5% blind spot reversal)
**MCP:** cognition-mcp, sequential-thinking
**Persistence:** Creates `.claude/cognition/YYYYMMDD-HHMM-<slug>.md` + Workshop entry
**Handoff Guidance:** Includes "Next Steps" section with contextual command recommendations

### `/problem-solve` - Convergent 8-Step Decision Pipeline
```bash
/problem-solve "How should we architect the notification system?"
/problem-solve --quick "Which database: PostgreSQL vs MongoDB?"
/problem-solve --strategic "3-year platform modernization"
```
Runs full ORIENT→ANTICIPATE→GENERATE→EVALUATE→COMMIT cycle for convergent decisions.
**Variants:** --quick (3 steps), --risk (4 steps), --strategic (5 steps), --incident (3 steps)
**NEW: Phase Gates:** 4 verification checkpoints (after ORIENT, ANTICIPATE, GENERATE, EVALUATE) with PASS/SOFT FAIL/HARD FAIL status to catch errors early
**Gate Protocol:** 3 questions per gate, soft fails warn but continue, hard fails stop for correction
**MCP:** cognition-mcp, sequential-thinking
**Persistence:** Creates `.claude/cognition/YYYYMMDD-HHMM-<slug>.md` + Workshop entry
**Handoff Guidance:** Includes "Next Steps" section with contextual command recommendations

### `/challenge` - Adversarial Proposal Analysis
```bash
/challenge "Use microservices for this feature"
/challenge --quick "Add caching layer"
/challenge --deep "Migrate to serverless"
```
Systematically attacks proposals using cognition-mcp.
**Modes:** --quick (causal_analysis), default (+ argumentation + decide), --deep (+ simulation + ethical)
**MCP:** cognition-mcp (sessions persisted to ~/.orca-cognition/)
**Persistence:** Creates `.claude/cognition/YYYYMMDD-HHMM-<slug>.md` + Workshop entry

---

## Audit Commands (1)

### `/audit` - Due Diligence Multi-Agent Auditing
```bash
/audit                           # Quick health check (~5 min, 3 agents)
/audit --comprehensive           # Full due diligence (~45-60 min, 8 agents)
/audit --core                    # Core dimensions (~15 min, 5 agents)
/audit --item design-system      # Focused audit on specific area
/audit --item page /checkout
/audit --since abc1234           # Incremental since commit
/audit --verbose                 # Full findings (default: TL;DR)
```
**Architecture:** Multi-agent parallel execution for thorough analysis
**Agents:** audit-structure-specialist, audit-dependency-specialist, audit-security-specialist (Phase 1)
**Dimensions:** Structure (0.10), Dependencies (0.15), Security (0.20), Patterns (0.10), Documentation (0.10), Tests (0.15), Architecture (0.15), Design (0.05)
**Output:** `.claude/audit/YYYY-MM-DD-<scope>.md` + `audit-index.json`
**Scoring:** Weighted average of dimension scores (0-100), grade A-F, risk level
**Finding Format:** AUD-YYYY-NNN with type, severity, location, recommendation, effort
**Integration:** `/orca fix AUD-YYYY-NNN` to route fixes to appropriate lane
**MCP:** cognition-mcp (audit operation)

---

## Utility Commands (15)

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
**Persistence:** Creates `.claude/cognition/YYYYMMDD-HHMM-<slug>.md` + Workshop entry

### `/design` - Creative Design Thinking
```bash
/design "Create a brutalist poster for a tech conference"
/design "Design a parametric vase in OpenSCAD with organic curves"
/design "Illustrator logo: geometric animal mark for a coffee brand"
```
Multi-phase creative design exploration for visual/3D work. Scaffolds: FRAME (parse brief, constraints, success criteria) -> EXPLORE (3-5 design directions) -> DEVELOP (executable concepts with tool operations) -> EVALUATE (structured crit against brief criteria) -> ITERATE (lessons, loop back).
**MCP:** cognition-mcp
**Integration:** Bridges thinking to Photoshop, Illustrator, OpenSCAD tool execution
**Persistence:** Appends to daily log `.claude/cognition/YYYYMMDD-daily.md` + Workshop entry
**Related:** `/think --creative` (non-design creative thinking), `/design-review` (UI audit), `/illustrate` (measured execution)

### `/illustrate` - Measured Adobe Execution
```bash
/illustrate "Create a poster with title, subtitle, and body text"
/illustrate "Add a logo in the top-right corner with the company name below it"
/illustrate "Layout a business card: name, title, email, phone, logo"
```
Measured execution in Photoshop/Illustrator with mandatory self-review. Phases: SURVEY (read canvas, existing layers) -> PLAN (spatial budget, proportional positions) -> EXECUTE (create with verify-after-place loop) -> REVIEW (visual self-review via get_document_image) -> CORRECT (fix issues).
**MCP:** adobe-photoshop, adobe-illustrator
**Skill:** adobe-execution (always-on guardrails)
**Integration:** Works standalone or with `/design` output (toolOperations from DEVELOP phase)
**Related:** `/design` (cognitive design thinking), `/design-review` (UI audit)

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
/memory-search "auth decisions"     # Search across Workshop + code-index.db
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
/reflect --source recording         # Analyze from recording.db
/reflect learn "Always check types" # Add rule
/reflect status                     # View rules
```

### `/self-improve` - Improvement Bus
```bash
/self-improve                       # Run improvement cycle
/self-improve --dry-run             # Preview only
```

### `/project-setup` - Project Conventions Wizard
```bash
/project-setup                      # Initialize CLAUDE.md (same as init)
/project-setup init                 # Full initialization flow
/project-setup update               # Update existing CLAUDE.md
/project-setup audit                # Check CLAUDE.md health
```
Guided wizard for project structure decisions. Detects project type (ios, nextjs, react, python, flutter, react-native, generic), observes existing patterns, asks 4 focused questions (2 shared + 2 type-specific), and generates CLAUDE.md with actionable rules.
**Features:** Auto-detects sacred paths per framework, handles existing CLAUDE.md (merge/replace/cancel), saves decisions to ProjectContext.

---

## Recording Commands (4)

Slash commands that wrap the orca-record CLI for easy checkpoint navigation.

### `/checkpoints` - Explore Checkpoints
```bash
/checkpoints                    # Last 10 checkpoints
/checkpoints 25                 # Last 25 checkpoints
/checkpoints --session sess-abc # Filter to specific session
```
Shows numbered list of checkpoints with timestamps and file change summaries.

### `/restore` - Restore to Checkpoint
```bash
/restore                        # Show checkpoint list
/restore 2                      # Restore to checkpoint #2
/restore abc123def456           # Restore by checkpoint ID
```
Restores working directory files to a checkpoint state. Shows files affected and `claude --continue` hint.

### `/continue` - Session Resume Info
```bash
/continue                       # List recent sessions
/continue sess-19c6983c46029c7  # Specific session info
```
Shows `claude --continue` commands for resuming previous sessions.

### `/orca-status` - Recording Status
```bash
/orca-status                    # Current session status
```
Shows session ID, state, checkpoint count, and shadow branch info.

## Recording Layer (orca-record CLI)

`orca-record` is a Bun-compiled binary that handles session recording, git-backed checkpoints, and rewind. It runs automatically via Claude Code hooks. Deployed to `~/.claude/bin/orca-record`.

### Hook Commands (invoked automatically)

| Command | Hook | Purpose |
|---------|------|---------|
| `orca-record prompt-submit` | UserPromptSubmit (async) | Snapshot git status, start/continue session |
| `orca-record stop` | Stop | Wait for transcript flush, copy transcript, diff files, create checkpoint |
| `orca-record pre-task` | PreToolUse[Task] | Capture pre-task file state for subagent checkpoints |
| `orca-record post-task` | PostToolUse[Task] | Diff against pre-task state, create task checkpoint |
| `orca-record post-todo` | PostToolUse[TodoWrite] | Incremental checkpoint within subagent context |

### Git Hook Commands (installed per-project)

| Command | Git Hook | Purpose |
|---------|----------|---------|
| `orca-record prepare-commit-msg` | prepare-commit-msg | Inject `ORCA-Checkpoint` trailer into commit message |
| `orca-record post-commit` | post-commit | Condense shadow branch to `orca/checkpoints/v1` orphan branch |

### User Commands

| Command | Purpose |
|---------|---------|
| `orca-record status` | Show current session recording state (IDLE/ACTIVE/ACTIVE_COMMITTED/ENDED) |
| `orca-record version` | Show CLI version |
| `orca-record checkpoints` | List all checkpoints in current session with timestamps and file changes |
| `orca-record rewind <id>` | Restore code and cognitive state to a specific checkpoint |
| `orca-record condense` | Manually trigger shadow branch condensation |
| `orca-record install-hooks` | Install orca-record git hooks in current project |
| `orca-record uninstall-hooks` | Remove orca-record git hooks from current project |
| `orca-record link <commit>` | Show bidirectional commit-to-checkpoint linking |
| `orca-record history` | Query session history from recording database |

### Storage

- **Database:** `.orca/recording.db` (per-project SQLite, gitignored)
- **Shadow branches:** `orca/<HEAD[:7]>-<wt[:6]>` (temporary, per-session)
- **Orphan branch:** `orca/checkpoints/v1` (permanent checkpoint storage)
- **Session state:** `.git/orca-sessions/<session-id>.json`

---

## Skills (Always-On Knowledge)

Skills are passive knowledge that shape Claude's responses when relevant context is detected. They do not require commands to activate.

### `adobe-execution`
Measure-place-verify guardrails for Adobe Photoshop and Illustrator MCP work. Prevents blind placement, text fragmentation, coordinate confusion. Forces visual self-review.
**Activates when:** Adobe Photoshop or Illustrator MCP tools are called
**Location:** `~/.claude/skills/adobe-execution/SKILL.md`

---

## Command Architecture

### Role Boundaries
- Orchestrators NEVER write code
- Only coordinate agents via Task tool
- Read phase_state.json for resumption

### Recording Context Injection (OS 6.2)

All lane orchestrator commands inject prior session context from `.orca/recording.db`
before delegating to agents:

- `/orca` queries centrally via `recording_query` + `recording_explain`, passes
  `RECORDING_CONTEXT` to domain grand-architects in delegation prompts
- Domain commands (`/nextjs`, `/ios`, `/expo`, `/shopify`, `/django-react`,
  `/orca-os-dev`, `/seo`) check for inherited context first; if invoked directly
  (not via `/orca`), they query `.orca/recording.db` independently
- All recording context is OPTIONAL -- silently skipped if `.orca/recording.db`
  does not exist

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
| `/orca-os-dev` | os-dev-architect, os-dev-builder, os-dev-standards-enforcer, os-dev-verification |
| `/orca-pipeline` | orca-pipeline-orchestrator, orca-pipeline-researcher, orca-pipeline-generator |
| `/typography` | typography-orchestrator, glyph-editor, ttf-exporter, typography-advisor, typography-explorer-generator, path-guardian |

---

_Source of truth: `docs/reference/os-dependency-graph.yaml`_
_Last sync: 2026-02-16_
