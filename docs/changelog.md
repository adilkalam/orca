# Changelog

## v4.0.0 - 2025-12-21

### Major Version Upgrade

This release marks a major upgrade with significant enhancements across the entire system.

---

## v3.2.1 - 2025-12-21

### New Features

#### DeepThink Planning Pipeline (`/plan --deepthink`)

**Full 8-step pipeline adapted for requirements planning:**
- ORIENT: Orchestration assessment + systems mapping of affected components
- ANTICIPATE: Pre-mortem analysis → identifies `#POISON_PATH` tags
- GENERATE: Tree of thought for implementation approaches → `#PATH_DECISION` tags
- EVALUATE: Decision framework + adversarial challenge → `#COMPLETION_DRIVE` tags
- COMMIT: Ulysses protocol for requirements commitments → acceptance criteria

**When to use:**
- Database migrations
- Authentication system changes
- Multi-service integrations
- Major refactors
- High-risk production changes

**Usage:**
```bash
/plan --deepthink Implement real-time collaboration
/plan -complex --deepthink Migrate from REST to GraphQL
```

**Output:** Creates `00-deepthink-analysis.md` in requirements folder with full pipeline output. Discovery questions reference insights from analysis. Spec inherits RA tags and requirements commitments.

**Rule of thumb:** Use `/deepthink` to decide IF you should do something. Use `/plan --deepthink` to define WHAT and HOW before implementing.

### Documentation Updates

- Updated `commands/plan.md` with Section 0.2 (DeepThink Planning Pipeline)
- Updated `quick-reference/readme-plan.md` with --deepthink flag
- Updated `docs/concepts/cognition-mcp.md` with /plan integration section
- Updated `quick-reference/guide-think-complex.md` with automated pipelines
- Updated `quick-reference/ORCA-OS/ORCA-commands.md` with cognition flags

---

## v3.1.0 - 2025-12-05

### Major Features

#### Unified Improvement Bus
- **Single event stream**: All improvement sources write to `.claude/improvement-events/improvement_event.jsonl`
- **Explicit routing**: Events dispatched to appropriate sinks (agent patterns, gate checklists, workshop standards)
- **Cross-layer propagation**: Reflexions can become agent patterns, CoVe failures become mandatory checks
- **New command**: `/self-improve` processes pending events, supports `--dry-run` and `--domain` flags

#### Reflexion-as-Constraint Pattern
- Orchestrators synthesize reflexion gotchas into constraint bullets
- Constraints injected into `phase_state.plan.constraints` for source agents only
- Builder agents receive "Active Constraints" section in delegation prompts
- Prevents context bloat: agents only see their own past failures

#### CoVe Question Mining
- Verification agents persist CoVe tables to `phase_state.gates.verification`
- Questions with NO answers emitted to improvement bus
- Questions failing 2+ times become **mandatory checks** in `.claude/agent-knowledge/{agent}/mandatory_checks.json`
- Future verification runs automatically include mandatory checks

### Agent Updates
- Gate agents (8): Now emit improvement events on CAUTION/FAIL
- Verification agents (5): Persist CoVe tables, load mandatory checks, emit failed questions
- Orchestrator commands: Load reflexions and inject scoped constraints

### New Files
- `docs/concepts/improvement-bus.md` - Full architecture and event schema
- `commands/self-improve.md` - Manual trigger for improvement bus processing

### Technical Changes
- Version bump to 3.1.0
- Improvement event schema documented with routing rules
- Mandatory checks schema: `.claude/agent-knowledge/{agent}/mandatory_checks.json`

---

## v3.0.0 - 2025-12-05

### Major Features

#### Telemetry Infrastructure
- **Hook-based initialization**: session-start.sh creates `.claude/telemetry/` structure
- **Event schema**: pipeline_start, delegation, gate_result, pipeline_end events
- **Retention policy**: 7 days for sessions, 30 days for metrics
- **Cleanup script**: `scripts/telemetry-cleanup.sh`

#### Reflexion-Enhanced Gates (Research: Shinn et al., NeurIPS 2023)
- Gates generate verbal reflections on CAUTION/FAIL decisions
- Reflections stored in Workshop: `workshop gotcha "reflexion: ..." -t reflexion -t {domain}`
- Memory-first context loads prior reflections for similar tasks
- Enables learning from past failures without retraining
- Applied to: nextjs-standards-enforcer, ios-standards-enforcer, expo-verification-agent, os-dev-standards-enforcer, and all design reviewers

#### Chain of Verification / CoVe (Research: Meta AI, arXiv:2309.11495)
- Verification agents generate 3-5 specific verification questions
- Questions answered independently to prevent confirmation bias
- Results aggregated into verification table with YES/NO/UNCERTAIN
- 2x precision improvement on fact-checking (per Meta research)
- Applied to: nextjs-verification-agent, ios-verification, expo-verification-agent, os-dev-verification

#### Clear Thought Integration with /plan
- `/plan` now supports Clear Thought flags for pre-discovery analysis
- New flags: `--visual`, `--systems`, `--debug`, `--model`, `--creative`, `--causal`, `--decide`
- Analysis runs before discovery questions, producing smarter targeted questions
- Output saved to `00-clear-thought-analysis.md` in requirements folder
- Key insights become RA-tagged items in spec (#PATH_DECISION, #COMPLETION_DRIVE, etc.)
- Flags combine with tier flags: `/plan -complex --systems "database migration"`

### Technical Changes
- All version references updated from 2.4.x to 3.0.0
- Telemetry standard documented in `docs/reference/telemetry-standard.md`
- Research basis documented in `.claude/research/reports/ai-self-improvement-techniques-report.md`

### Breaking Changes
None. All changes are additive.

---

## v2.4.2 (2025-11-29) – Clear Thought Integration

### Reasoning MCPs

**Clear Thought MCP Added:**
- 38 structured reasoning operations via single `clear_thought` tool
- Operations: sequential thinking, mental models, debugging, creative, visual, systems thinking, causal analysis, OODA loop, Ulysses protocol, and more
- Session management (export/import) for long-running reasoning

**Stochastic Thinking MCP Added:**
- Probabilistic algorithms: MDPs, MCTS, Multi-Armed Bandits, Bayesian optimization, HMMs
- Decision-making under uncertainty

### New Commands

**`/clear-thought` - Unified Reasoning:**
- 27 flags organized by category (core, collaborative, analysis, patterns, strategic, session)
- `--help` displays full flag reference
- Examples: `--seq`, `--model`, `--debug`, `--collab`, `--decide`, `--tree`, `--ooda`, `--ulysses`

**`/think` - Reasoning Strategy Advisor:**
- Analyzes problems and recommends which thinking tools to use
- Provides multi-phase reasoning sequences with ready-to-copy prompts
- Suggests stochastic tools when probability/uncertainty is involved

### Quick References

- `quick-reference/readme-clear-thought.md` - Full flag reference
- `quick-reference/readme-research.md` - Research lane (8 agents)
- Expanded `readme-data.md` and `readme-seo.md`

### Next.js Verification Update

- ESLint-based TypeScript style gate now explicit in `nextjs-verification-agent`
- Lint command resolution: `npm run lint` → `npx eslint` → not configured
- Order enforced: lint → tests → build

### Documentation Sync

- README.md updated: 85 agents, v2.4.1 references
- docs/readme.md: Added `/think` and `/clear-thought` commands
- quick-reference/os2-commands.md: New Reasoning Commands section
- quick-reference/mcps.md: Clear Thought + Stochastic MCPs documented

---

## v2.4.1 (2025-11-28) – Agent Enrichment

### Universal Skills

**5 New Skills Extracted from Competitor System Prompts:**
- `cursor-code-style` - Variable naming, control flow, comments (from Cursor)
- `lovable-pitfalls` - 7 common mistakes to avoid (from Lovable)
- `search-before-edit` - Mandatory grep before file modification
- `linter-loop-limits` - 3-strike rule for linter loops (from Cursor)
- `debugging-first` - Debug tools before code changes (from Replit)

All skills use explicit DO/DON'T format with concrete examples.

### Agent Enrichment

**All 85 agents enriched with:**
- Knowledge Loading section - check `.claude/agent-knowledge/{agent}/patterns.json`
- Required Skills References - wire to 5 universal skills
- Lane-specific patterns (inline):
  - Next.js: V0/Lovable design rules (max 5 colors, max 2 fonts, WCAG contrast, <50 line components)
  - iOS: Swift-agents patterns (iOS version checks, @MainActor, SwiftData)
  - Expo: React Native best practices (FlatList, StyleSheet.create, platform conventions)
  - Research: Perplexity citation format (inline citations, 10K word reports)

### Agent-Level Learning System

**New file-based learning infrastructure:**
- `.claude/agent-knowledge/` directory with README and schema
- 5 sample `patterns.json` files for priority agents
- Pattern lifecycle: candidate → promoted (85% success, 10+ occurrences)
- 15 builder agents have Knowledge Persistence footers

### Agent Count Update

- **Previous:** 82 agents
- **New:** 84 agents (+2 count corrections)

### Documentation

- Updated `docs/agents.md` with enrichment info
- Updated `docs/concepts/skills.md` with universal skills
- Updated `docs/concepts/self-improvement.md` with agent-level learning
- Updated `quick-reference/os2-agents.md`

---

## v2.4.0 (2025-11-27)

### Response Awareness Simplification

**RA is Instrumentation, Not Scoring**
- Clarified that RA tags are diagnostic breadcrumbs, not compliance metrics
- Gates MAY downgrade to CAUTION/FAIL for high-risk unresolved tags
- Gates MUST NOT derive standalone "RA accuracy percentages"
- Final quality comes from tests, builds, measurements—not tag counts

**Core RA Tags Defined**
- `#COMPLETION_DRIVE` - assumed behavior without confirmation
- `#PATH_DECISION` / `#PATH_RATIONALE` - architectural choices with reasoning
- `#POISON_PATH` - flagged anti-patterns or unsafe framing
- `#Potential_Issue` - out-of-scope problems noticed
- Additional tags documented for lane-specific use

### Next.js CSS Architecture Refactor Mode

**New Sub-Mode Under `--complex`**
- Structural CSS/layout refactors now have a dedicated mode
- Relaxes "edit, don't rewrite" for style/layout layers when refactoring
- Allows targeted rewrites of CSS modules, layout components, global styles

**New Gate: `nextjs-css-architecture-gate`**
- Scores structural CSS quality (0-100)
- Checks: global CSS minimization, Tailwind/shadcn adoption, duplication, naming
- Runs alongside standards-enforcer and design-reviewer in refactor mode

### Three-Tier Planning (`/plan`)

**Flags Added to `/plan`**
- `-tweak`: Quick planning (2-3 scope questions, minimal spec)
- (default): Standard planning (5+5 questions, full spec)
- `-complex`: Deep planning (extended analysis, risk assessment, multi-phase)

**Tier Passthrough**
- Spec metadata includes `tier` field
- `/orca-*` reads tier and matches execution depth
- Symmetry: `-tweak` plan → `-tweak` execution

**Auto-Detection**
- `/plan` analyzes task and recommends tier
- User can override recommendation

### Documentation Updates

- Updated all pipeline docs to v2.4
- Updated all phase-configs to reflect three-tier routing
- Clarified RA instrumentation vs scoring throughout

---

## v2.3.1 (2025-11-27)

### Anthropic Best Practices Alignment

**Extended Thinking Triggers**
- Grand-architects now use thinking prompts for complex decisions
- Medium tasks: "Let me think through the architecture..."
- Complex tasks: "Think harder about implications, dependencies..."
- Added to: `ios-grand-architect`, `nextjs-grand-architect`, `expo-grand-orchestrator`

**Complexity Detection Heuristics**
- `/{domain}` commands now detect task complexity before delegation
- Heuristics: file count estimates, scope indicators, concern count
- Team size scales with complexity tier (1-2 → 3-5 → 5-10 agents)
- Added to: `/ios`, `/nextjs`, `/expo`

### Agent Self-Improvement System

**Outcome Recording**
- Grand-architects record task outcomes at pipeline end
- Schema: `{task_id, domain, agents_used, outcome, issues, files_modified}`
- Storage: Workshop `task_history` entries
- Enables pattern recognition across executions

**Pattern Analysis**
- `/audit` now includes self-improvement analysis
- Identifies recurring issues (3+ occurrences same agent + issue type)
- Generates improvement proposals in Pantheon-inspired schema
- User approval required before applying changes

**New Scripts**
- `scripts/analyze-patterns.py` - Query Workshop, identify patterns, generate proposals
- `scripts/apply-improvement.py` - Apply approved improvements to agent YAML

**Self-Improvement Loop**
```
Execute → Record Outcome → Analyze Patterns → Propose Improvement
    → User Approves → Apply to Agent → Measure Impact
```

See [Self-Improvement](concepts/self-improvement.md) for details.

### Bug Fixes

**Critical: Agent Tools Format**
- Fixed silent failure where agents completed with 0 tool uses
- Root cause: YAML array format (`tools:\n  - Task`) doesn't work
- Fix: Comma-separated strings (`tools: Task, Read, Edit`)
- Applied to all 68 agents

### Documentation

- New: `docs/concepts/self-improvement.md`
- Updated: `docs/concepts/complexity-routing.md` (team scaling)
- Updated: `docs/changelog.md` (this file)

---

## v2.3 (2025-11-25)

### New Features

**Complexity Routing**
- Automatic simple/medium/complex classification
- Heuristics based on file count, keywords, and scope

**Light Orchestrators**
- Fast path for simple tasks
- `-tweak` flag forces light path
- Skip team confirmation, gates, verification
- Per-domain: `ios-light-orchestrator`, `nextjs-light-orchestrator`, `expo-light-orchestrator`

**Deep Audit Mode**
- `--audit` flag for review without implementation
- Per-domain audit squads
- Clarify focus areas with user
- Produce audit report with findings and follow-up tasks

**Spec Gating**
- Complex tasks blocked without requirements spec
- Spec created by `/plan`, stored at `.claude/requirements/<id>/06-requirements-spec.md`
- Medium tasks: spec recommended
- Simple tasks: spec not needed

**Memory-First Context**
- Check Workshop + vibe.db before ProjectContext
- Surfaces past decisions and gotchas early
- Reduces token usage and latency

**Response Awareness (RA) Integration**
- `ra_events` field in `phase_state.json`
- RA tags: `#COMPLETION_DRIVE`, `#CARGO_CULT`, `#PATH_DECISION`, `#POISON_PATH`, `#TOKEN_VIOLATION`
- Gates report `ra_status` in output
- `/audit` mines RA events across tasks

**New Commands**
- `/root-cause` - Multi-lane diagnostic investigation
- Domain audit: `/ios --audit`, `/nextjs --audit`, etc.

### Lane Updates

**All Lanes (iOS, Next.js, Expo)**
- Upgraded to v2.3 with complexity routing
- Added light orchestrators
- Added `--audit` mode
- Added RA integration to specialists and gates
- Memory-first context pattern

**OS-Dev Lane**
- New lane for OS configuration work
- LOCAL to claude-vibe-config repo only
- NOT wired into main `/orca` routing
- Components: grand-architect, architect, builder, standards-enforcer, verification

**Specialist Pipelines (Data, SEO, Design)**
- Updated to v2.3 patterns
- Route directly to specialists (no grand-architect)

### Agent Changes

- Light orchestrators added (4 new agents)
- RA tagging added to all specialists
- RA status checking added to all gates
- Agent tools format standardized (comma-separated strings)

### Technical Changes

- `phase_state.json` schema updated with `ra_events`, `complexity_tier`
- Phase configs updated with `memory_first: true`, complexity routing
- Gate output includes `ra_status` field

### Documentation

- Complete docs overhaul
- New `docs/concepts/` with core mental models
- Clean `docs/pipelines/` per lane
- Archived pre-v2.3 docs to `.archive/`

### Breaking Changes

None. v2.3 is backward compatible with v2.2.

---

## v2.2 (2025-11-24)

Initial multi-lane orchestration release.

- Domain-specific pipelines (iOS, Next.js, Expo, Data, SEO, Design)
- Grand architect pattern (Opus coordination)
- Specialist agents per domain
- Gate and verification patterns
- ProjectContext MCP integration
- Phase state management
- Team confirmation before execution
- State preservation across interruptions

---

## v2.1 and Earlier

Pre-orchestration versions. See `.archive/` for historical context.
