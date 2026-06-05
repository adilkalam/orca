# OS 7.0 Agents Quick Reference

**Last Updated:** 2026-06-03
**Version:** OS 7.1
**Total Agents:** 72

> **Scope Note:** This quick-reference covers all agents across 18 domains. See `docs/reference/os-dependency-graph.yaml` for complete registry.

---

## Agent Architecture (OS 7.0)

**All Agents Use Opus 4.6:**
- Grand architects (coordination & architecture)
- Builders (implementation)
- Specialists (domain-specific work)
- Gates (verification & enforcement)
- **Exception:** Verification agents may use Haiku for mechanical build/test checks

**Role Boundaries:**
- Orchestrators NEVER write code (coordinate via Task tool only)
- Agents (builders, specialists) do the actual work
- Gates enforce quality standards (numerical scores)

---

## Agent Count by Domain

| Domain | Count | Location |
|--------|-------|----------|
| iOS | 18 | `agents/iOS/` |
| Next.js | 17 | `agents/nextjs/` |
| Django-React | 13 | `agents/django-react/` |
| Expo | 12 | `agents/expo/` |
| RVRY | 7 | `agents/rvry/` |
| Dev (cross-cutting) | 13 | `agents/dev/` |
| OS-Dev | 11 | `agents/os-dev/` |
| Audit | 0 (agentless) | `commands/audit.md` |
| Research | 7 | `agents/research/` |
| Typography | 6 | `agents/typography/` |
| SEO | 4 | `agents/seo/` |
| SEO-Optimize | 1 | `agents/seo-optimize/` |
| AIO | 3 | `agents/aio/` |
| Data | 4 | `agents/data/` |
| Cross-Domain | 1 | `agents/cross-domain/` |
| Design | 2 | `agents/design/` |
| 3D Printing | 0 (MCP+skill) | bambu-3mf, openscad-mcp |
| Creative Design | 0 (MCP+skill) | adb-mcp (Photoshop, Illustrator) |
| **TOTAL** | **137** | |

---

## iOS Pipeline (18 Agents)

### Orchestration
| Agent | Purpose |
|-------|---------|
| `ios-grand-architect` | High-level architecture planning and coordination |
| `ios-architect` | Implementation planning and impact analysis |
| `ios-light-orchestrator` | Default/tweak mode coordination |

### Implementation
| Agent | Purpose |
|-------|---------|
| `ios-builder` | iOS implementation specialist |
| `ios-swiftui-specialist` | SwiftUI-specific features and best practices |
| `ios-uikit-specialist` | UIKit implementation for legacy/complex UI |
| `ios-persistence-specialist` | SwiftData/Core Data/GRDB data layer |
| `ios-networking-specialist` | URLSession, async/await networking |
| `ios-testing-specialist` | Swift Testing framework |
| `ios-ui-testing-specialist` | UI automation testing |
| `ios-performance-specialist` | Instruments, optimization |
| `ios-security-specialist` | Keychain, biometrics, secure storage |
| `ios-accessibility-specialist` | VoiceOver, accessibility compliance |
| `ios-fastlane-specialist` | CI/CD automation |
| `ios-spm-config-specialist` | Swift Package Manager configuration |

### Gates
| Agent | Purpose | Threshold |
|-------|---------|-----------|
| `ios-standards-enforcer` | Code standards, Swift 6 concurrency | >=90 |
| `ios-ui-reviewer` | Code-based UI review (no simulator) | >=90 |
| `ios-verification` | Build/test/visual verification (XcodeBuildMCP) | PASS/FAIL |

**MCP Requirements:** XcodeBuildMCP

---

## Next.js Pipeline (17 Agents)

### Orchestration
| Agent | Purpose |
|-------|---------|
| `nextjs-grand-architect` | Next.js architecture coordination and planning |
| `nextjs-architect` | Implementation planning |
| `nextjs-light-orchestrator` | Default/tweak mode coordination |

### Implementation
| Agent | Purpose |
|-------|---------|
| `nextjs-builder` | Next.js implementation specialist |
| `nextjs-typescript-specialist` | TypeScript best practices |
| `nextjs-performance-specialist` | Bundle optimization, lazy loading |
| `nextjs-seo-specialist` | SEO optimization |
| `nextjs-accessibility-specialist` | WCAG compliance, semantic HTML |

> **Note (2026-04-22 design-system fork):** The design, CSS, animation, 3D, and layout Next.js specialists (`nextjs-design-reviewer`, `nextjs-css-specialist`, `nextjs-css-architecture-gate`, `nextjs-animation-specialist`, `nextjs-3d-specialist`, `nextjs-layout-specialist`, `nextjs-layout-analyzer`) plus `design-system-architect`, `design-token-guardian`, `design-dna-guardian`, `tailwind-specialist`, and `shadcn-specialist` were archived. Design work now routes through the `/impeccable` skill system (see ORCA-skills.md). `/nextjs` pipeline is non-functional pending follow-up reshape.

### Gates
| Agent | Purpose | Threshold |
|-------|---------|-----------|
| `nextjs-standards-enforcer` | Code standards, token usage, feature completeness (loading/error/form/nav checks) | >=90 |
| `nextjs-verification-agent` | Build/test/lint verification | PASS/FAIL |

**MCP Requirements:** chrome-devtools

---

## Django-React Pipeline (13 Agents)

### Orchestration
| Agent | Purpose |
|-------|---------|
| `django-react-grand-architect` | High-level architecture planning and coordination |
| `django-react-architect` | Implementation planning and impact analysis |
| `django-react-light-orchestrator` | Default/tweak mode coordination |

### Implementation
| Agent | Purpose |
|-------|---------|
| `django-react-builder` | Full-stack implementation specialist |

### Backend Specialists
| Agent | Purpose |
|-------|---------|
| `django-master` | Django models, ORM, migrations, admin customization |
| `django-api-specialist` | Django REST Framework, serializers, viewsets, API design |
| `django-security-specialist` | JWT auth (simplejwt), permissions, CSRF, security hardening |

### Integration
| Agent | Purpose |
|-------|---------|
| `api-contract-specialist` | OpenAPI schema (drf-spectacular), TypeScript client (openapi-ts), type safety |

### Frontend Specialists
| Agent | Purpose |
|-------|---------|
| `react-typescript-wizard` | React 18+, hooks, TypeScript strict mode, component patterns |
| `react-state-specialist` | TanStack Query, Zustand, React Hook Form, Zod validation |
| `react-testing-specialist` | Jest, React Testing Library, Cypress E2E |

### Gates
| Agent | Purpose | Threshold |
|-------|---------|-----------|
| `django-react-standards-enforcer` | Python/Django + TypeScript/React standards | >=90 |
| `django-react-verification` | Build/test/lint verification | PASS/FAIL |

**MCP Requirements:** (none)

---

## Expo Pipeline (12 Agents)

### Orchestration
| Agent | Purpose |
|-------|---------|
| `expo-grand-orchestrator` | High-complexity coordinator |
| `expo-architect-agent` | Expo planning and impact analysis |
| `expo-light-orchestrator` | Default/tweak mode coordination |

### Implementation
| Agent | Purpose |
|-------|---------|
| `expo-builder-agent` | Expo/React Native implementation |
| `expo-aesthetics-specialist` | Visual polish and interaction design |

### Utility Agents
| Agent | Purpose |
|-------|---------|
| `api-guardian` | API contract validation |
| `bundle-assassin` | Bundle size optimization |
| `impact-analyzer` | Change impact prediction |
| `refactor-surgeon` | Safe refactoring |
| `test-generator` | Automated test generation |

### Gates
| Agent | Purpose | Threshold |
|-------|---------|-----------|
| `expo-standards-enforcer` | Architecture, RN patterns, design tokens | >=90 |
| `expo-verification-agent` | Build/test/expo doctor | PASS/FAIL |

---

## Research Pipeline (7 Agents)

Orchestrated directly by `/research` command (no lead agent).

### Subagents
| Agent | Purpose |
|-------|---------|
| `research-web-search-subagent` | Web search and discovery |
| `research-site-crawler-subagent` | Deep site crawling |

### Writing
| Agent | Purpose |
|-------|---------|
| `research-answer-writer` | Concise answer synthesis |
| `research-deep-writer` | Long-form research content |

### Gates
| Agent | Purpose |
|-------|---------|
| `research-fact-checker` | Claim verification |
| `research-citation-gate` | Citation quality |
| `research-consistency-gate` | Logical consistency |

**MCP Requirements:** crawl4ai

---

## SEO Pipeline (4 Agents)

| Agent | Purpose |
|-------|---------|
| `seo-research-specialist` | SERP analysis, keyword research |
| `seo-brief-strategist` | Content strategy and brief generation |
| `seo-draft-writer` | Long-form SEO content creation |
| `seo-quality-guardian` | SEO content quality assurance |

**MCP Requirements:** ahrefs, crawl4ai, cognition-mcp (--think)

> `seo-optimizer` was archived 2026-05-17 (`.archived/agents/seo-optimizer.md`).
> Optimization lives in the `/seo-optimize` and `/aio` lanes below -- see
> `.orca/requirements/2026-05-17-1903-seo-geo-optimization-capability/`.

---

## SEO-Optimize Lane (1 Agent)

Advisory technical-SEO optimization lane -- a command plus one working agent, not
an orchestrator-ceremony lane.

| Agent | Purpose |
|-------|---------|
| `seo-technical-advisor` | Turns deterministic technical-SEO detector findings + GSC/GA4 analytics into a prioritized, evidence-backed report; every recommendation traces to a detector `check_id` |

**MCP Requirements:** analytics-mcp, mcp-gsc

---

## AIO Lane (3 Agents)

Advisory GEO / generative-engine optimization lane, the deeper of the two
optimization surfaces -- a command plus a focused working agent set.

| Agent | Purpose |
|-------|---------|
| `geo-diagnose-recommend` | Core agent: detector GEO findings + doctrine-scored audit + measurement context into prioritized GEO recommendations, each tracing to a doctrine `rule_id` or detector `check_id` |
| `geo-rewrite` | Optional rewrite agent (on `--rewrite`); doctrine-aligned content rewrite -- the single deliberate feedback edge into content generation |
| `measurement-analyst` | Reads the AI-answer capture store via `scripts/aio-measurement/cli.py`; reports citation status + competitive gap; degrades gracefully to "no capture data yet" |

**MCP Requirements:** none (detector + measurement tool are local CLIs)

---

## Typography Pipeline (6 Agents)

Font library management for glyph editing, TTF export, font selection, and exploration tools.

### Orchestration
| Agent | Purpose |
|-------|---------|
| `typography-orchestrator` | Light orchestrator, routing, checkpoints, Workshop memory |

### Implementation
| Agent | Purpose |
|-------|---------|
| `glyph-editor` | Heavy - fontTools glyph modifications, contour editing, proof generation |
| `ttf-exporter` | Medium - OTF to TTF conversion for Epson LabelWorks |
| `typography-advisor` | Light - font selection, pairing recommendations |
| `typography-explorer-generator` | Heavy - generates interactive typography testing tools (Next.js or HTML) |

### Gates
| Agent | Purpose |
|-------|---------|
| `path-guardian` | Path validation, sacred collection protection |

**Workflows:** glyph_edit, ttf_export, font_selection, explorer_generation

---

## Data Pipeline (4 Agents)

| Agent | Purpose |
|-------|---------|
| `data-researcher` | Data discovery and exploration |
| `research-specialist` | Deep research, context gathering |
| `python-analytics-expert` | Python-based data analysis |
| `competitive-analyst` | Market and competitor research |

---



## RVRY Pipeline (7 Agents)

MCP-native reasoning orchestration engine with escape detection, prompt assembly, BYOK, and web interface.

### Orchestration
| Agent | Purpose |
|-------|---------|
| `rvry-grand-architect` | Tier-S orchestrator for complex mode, routes by complexity tier |
| `rvry-light-orchestrator` | Default/tweak mode coordination |
| `rvry-engine-architect` | Plans engine: state machine design, composition rule extraction, escape detection heuristics |

### Implementation
| Agent | Purpose |
|-------|---------|
| `rvry-engine-builder` | Implements engine: Bun+Hono, state machine, escape detection, prompt assembler, BYOK proxy, MCP transport |
| `rvry-web-builder` | Implements web: Auth.js, Next.js dashboard, streaming UI, Stripe |

### Gates
| Agent | Purpose | Threshold |
|-------|---------|-----------|
| `rvry-protocol-gate` | Code standards + protocol surface compliance | >=90 |
| `rvry-verification` | Domain gates: delta (divergence score), escape detection (FP <30%), streaming, trace | PASS/FAIL |

**Domain Gates:** delta-gate, escape-detection-gate, streaming-gate, trace-gate
**Stack:** Bun + Hono (engine), Next.js (web), Supabase Postgres, Auth.js

---


## OS-Dev + Orca-Pipeline (11 Agents)

Located in `agents/os-dev/`. Includes both OS-Dev (6) and Orca-Pipeline (5) agents.

### OS-Dev Orchestration
| Agent | Purpose |
|-------|---------|
| `os-dev-grand-architect` | OS architecture planning and coordination |
| `os-dev-architect` | Implementation planning |
| `os-dev-light-orchestrator` | Default/tweak mode coordination |

### OS-Dev Implementation
| Agent | Purpose |
|-------|---------|
| `os-dev-builder` | Agent/command development |

### OS-Dev Gates
| Agent | Purpose |
|-------|---------|
| `os-dev-standards-enforcer` | OS standards validation |
| `os-dev-verification` | Deployment verification |

---

## Orca-Pipeline (5 Agents)

Meta-pipeline for creating new domain pipelines. 5-phase wizard: Interview → Research → Blueprint → Generate → Validate.

### Orchestration
| Agent | Purpose |
|-------|---------|
| `orca-pipeline-orchestrator` | Wizard flow coordination, phase routing, checkpoints |

### Implementation
| Agent | Purpose |
|-------|---------|
| `orca-pipeline-researcher` | Bounded _explore/ search, web fallback (20 files max, 5 min) |
| `orca-pipeline-architect` | Blueprint design from interview + research findings |
| `orca-pipeline-generator` | Artifact file creation (command, docs, agents) |

### Validation
| Agent | Purpose |
|-------|---------|
| `orca-pipeline-validator` | Completeness verification via os-dependency-graph |

**Quick Mode Templates:** hybrid (8 agents), research-heavy (7), build-heavy (5), minimal (4)

---

## Audit Pipeline (Agentless)

`/audit` uses direct evidence-based verification protocols -- no subagents. Each verification step produces CLAIM + VERIFICATION EVIDENCE + RESULT, making gaps structurally visible.

**Dimensions:** Structure, Security, Dependencies, Patterns, Architecture, Tests, Documentation, Design
**Modes:** `--quick` (3 dimensions), `--core` (5), `--comprehensive` (all 8)
**Documentation:** `--documentation` runs specialized doc verification with evidence spot-checks
**Scoring:** Deduction-based (100 - rule violations), weighted aggregation
**Output:** `.orca/audit/YYYY-MM-DD-<mode>.md`

---

## Cross-Cutting Agents (13 Agents)

Located in `agents/dev/`. These agents work across multiple pipelines:

| Agent | Used By | Purpose |
|-------|---------|---------|
| `a11y-enforcer` | Expo, Next.js | WCAG 2.2 compliance |
| `crash-analyzer` | All lanes | Cross-domain crash and error analysis |
| `debt-eliminator` | All lanes | Technical debt identification and prioritization |
| `performance-enforcer` | Expo, Next.js | Bundle size, performance budgets |
| `performance-prophet` | Expo | Predictive performance analysis |
| `screenshot-analyzer` | All UI lanes | Screenshot analysis and visual comparison |
| `security-specialist` | Expo, iOS | OWASP Mobile Top 10, secure storage |
| `version-shield` | All lanes | Dependency version management and breaking changes |

---

## Cross-Domain Agents (1 Agent)

Located in `agents/cross-domain/`. These agents are spawned by light orchestrators across all lanes:

| Agent | Spawned By | Purpose |
|-------|------------|---------|
| `standards-persistence-agent` | All light orchestrators | Parses gate violation JSON, deduplicates against existing standards, persists via save_standard |

**Trigger:** Spawned as fire-and-forget background task when any gate agent returns ERROR or BLOCK.

**MCP Requirements:** project-context (save_standard + query_context)

**Note:** As of OS 7.0, all 12 gate agents also call `save_standard` directly on ERROR/BLOCK decisions. The standards-persistence-agent serves as a backup deduplication layer. See `gate_agents_with_save_standard` in `os-dependency-graph.yaml` for the full list.

---

## 3D Printing (MCP+Skill Driven, 0 Agents)

No dedicated agent directory. Capabilities provided by MCP servers and skills:

| MCP | Purpose |
|-----|----------|
| `bambu-3mf` | Bambu Studio 3MF settings manipulation, OrcaSlicer CLI analysis (8 tools) |
| `openscad-mcp` | OpenSCAD 3D rendering, STL analysis, model comparison |

**Command:** `/design` (routes to 3D workflows when OpenSCAD/3MF context detected)

---

## Creative Design (MCP+Skill Driven, 0 Agents)

No dedicated agent directory. Capabilities provided by MCP servers, skills, and commands:

| MCP | Purpose |
|-----|----------|
| `adobe-photoshop` | Adobe Photoshop document/layer/filter/text operations |
| `adobe-illustrator` | Adobe Illustrator scripting, document management, export |

**Commands:** `/design` (cognitive design thinking), `/illustrate` (measured Adobe execution)
**Skill:** `adobe-execution` (measure-place-verify guardrails)

---

## Design Lane (2 Agents)

Full-separation design lane (2026-06-03 design-system totality rethink, Phase 2). A thin orchestrator (the design command, main thread) binds typed FORBIDDEN/FORWARD constraints via a cognition `checkpoint`, spawns a **separate** builder, then a **separate fresh-context** validator, and branches on the verdict (N=2 → escalate). Shared lane definition: `docs/reference/design-lane.md` (referenced, never copy-pasted). Hub skill: `skills/impeccable/SKILL.md` (the register; points to `design-contract/` refs, no inlining).

| Agent | Purpose |
|-------|---------|
| `design-builder` | Separate producer. Builds the front-end artifact under the bound constraint ids; hub injected via prompt (reload-safe) / `skills: [impeccable]` (post-reload). Does NOT self-grade. |
| `design-validator` | Separate **fresh-context** judge. Runs the LOCAL detector (`node mcp/design-detector/bin/designcheck.js`), judges bound ids, returns `GATE_VERDICT: PASS\|BLOCK`. Hard-on-named-slop, advisory-on-taste. Never sees the builder's reasoning. |

> **Status (2026-06-03):** agents authored in-repo; a new agent is NOT spawnable until a Claude Code session reload, so the lane is **built, pending post-reload live proof** — not yet live-verified. Worked example: `/impeccable` (thin). The other 12 design commands are NOT yet converted (post-reload one-pass apply).

---

## Quality Gates (All Pipelines)

### Numerical Scoring
- **Standards Gate:** >=90 to pass
- **Design QA Gate:** >=90 to pass
- **Accessibility Gate:** >=90 to pass
- **Performance Gate:** Budget compliance

### Build/Test Gate
- **Result:** PASS/FAIL
- **Checks:** Build success, test pass, no console errors

---

## Agent Locations

### Global (Deployed to ~/.claude/)
```
~/.claude/agents/
  iOS/              # 18 agents
  nextjs/           # 17 agents
  django-react/     # 13 agents
  expo/             # 12 agents
  cross-domain/     # 1 agent (standards persistence)
  dev/              # 13 agents (cross-cutting)
  rvry/             # 7 agents
  os-dev/           # 11 agents (os-dev-* + orca-pipeline-*)
  audit/            # (agentless)
  research/         # 7 agents
  typography/       # 6 agents
  seo/              # 4 agents
  seo-optimize/     # 1 agent (advisory lane)
  aio/              # 3 agents (advisory lane)
  data/             # 4 agents
```

### Source (ORCA-OS Repo)
```
$ORCA_OS_PATH/agents/
  (same structure as above)
```

---

## Usage Examples

### iOS Feature
```bash
/ios "add haptic feedback"        # Default: light + gates
/ios -tweak "try animation"       # Tweak: no gates
/ios --complex "auth flow"        # Complex: full pipeline
```

### Next.js UI
```bash
/nextjs "fix button spacing"
/nextjs -tweak "try padding"
/nextjs --complex "dark mode"
```

---

_Source of truth: `docs/reference/os-dependency-graph.yaml`_
_Last sync: 2026-03-23_
