# OS 5.2 Agents Quick Reference

**Last Updated:** 2026-02-03
**Version:** OS 5.2
**Total Agents:** 124

> **Scope Note:** This quick-reference covers all 124 agents across 13 domains. See `docs/reference/os-dependency-graph.yaml` for complete registry.

---

## Agent Architecture (OS 5.2)

**All Agents Use Opus 4.6:**
- Grand architects (coordination & architecture)
- Builders (implementation)
- Specialists (domain-specific work)
- Gates (verification & enforcement)

**Role Boundaries:**
- Orchestrators NEVER write code (coordinate via Task tool only)
- Agents (builders, specialists) do the actual work
- Gates enforce quality standards (numerical scores)

---

## Agent Count by Domain

| Domain | Count | Location |
|--------|-------|----------|
| iOS | 19 | `agents/iOS/` |
| Next.js | 15 | `agents/nextjs/` |
| Django-React | 13 | `agents/django-react/` |
| Expo | 12 | `agents/expo/` |
| Dev (cross-cutting) | 12 | `agents/dev/` |
| OS-Dev | 11 | `agents/os-dev/` |
| Audit | 8 | `agents/audit/` |
| Shopify | 8 | `agents/shopify/` |
| Research | 7 | `agents/research/` |
| Typography | 6 | `agents/typography/` |
| SEO | 5 | `agents/seo/` |
| KG | 4 | `agents/kg/` |
| Data | 4 | `agents/data/` |
| **TOTAL** | **124** | |

---

## iOS Pipeline (19 Agents)

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
| `design-dna-guardian` | Design system compliance | >=90 |

**MCP Requirements:** XcodeBuildMCP

---

## Next.js Pipeline (15 Agents)

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
| `nextjs-layout-analyzer` | Structure-first layout analysis |
| `nextjs-layout-specialist` | Complex layout implementation |
| `nextjs-css-specialist` | Semantic CSS, @layer, design tokens |
| `nextjs-css-architecture-gate` | CSS architecture validation |
| `tailwind-specialist` | Tailwind CSS (auto-detected; in `agents/dev/`) |
| `shadcn-specialist` | shadcn/ui components (auto-detected; in `agents/dev/`) |
| `nextjs-typescript-specialist` | TypeScript best practices |
| `nextjs-performance-specialist` | Bundle optimization, lazy loading |
| `nextjs-seo-specialist` | SEO optimization |
| `nextjs-accessibility-specialist` | WCAG compliance, semantic HTML |

### Gates
| Agent | Purpose | Threshold |
|-------|---------|-----------|
| `nextjs-standards-enforcer` | Code standards, token usage | >=90 |
| `nextjs-design-reviewer` | Design QA, visual compliance | >=90 |
| `nextjs-verification-agent` | Build/test/lint verification | PASS/FAIL |

**MCP Requirements:** chrome-devtools, puppeteer

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

## SEO Pipeline (5 Agents)

| Agent | Purpose |
|-------|---------|
| `seo-research-specialist` | SERP analysis, keyword research |
| `seo-brief-strategist` | Content strategy and brief generation |
| `seo-draft-writer` | Long-form SEO content creation |
| `seo-quality-guardian` | SEO content quality assurance |
| `seo-optimizer` | Content optimization against SERP competitors |

**MCP Requirements:** ahrefs, crawl4ai

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

## OS-Dev Pipeline (6 Agents)

### Orchestration
| Agent | Purpose |
|-------|---------|
| `os-dev-grand-architect` | OS architecture planning and coordination |
| `os-dev-architect` | Implementation planning |
| `os-dev-light-orchestrator` | Default/tweak mode coordination |

### Implementation
| Agent | Purpose |
|-------|---------|
| `os-dev-builder` | Agent/command development |

### Gates
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

## Shopify Pipeline (8 Agents)

### Orchestration
| Agent | Purpose |
|-------|---------|
| `shopify-grand-architect` | Shopify lane coordination and planning |
| `shopify-light-orchestrator` | Default/tweak mode coordination |

### Implementation
| Agent | Purpose |
|-------|---------|
| `shopify-liquid-specialist` | Liquid templating, objects, filters, logic |
| `shopify-section-builder` | Section development, schema, blocks |
| `shopify-js-specialist` | JavaScript for Shopify themes |
| `shopify-css-specialist` | CSS and design tokens for Shopify themes |

### Gates
| Agent | Purpose |
|-------|---------|
| `shopify-theme-checker` | Theme quality and linting |
| `shopify-ui-reviewer` | Visual validation via Puppeteer |

---

## KG Pipeline (4 Agents)

Knowledge-graph-augmented research agents for OBDN research.

| Agent | Purpose |
|-------|---------|
| `kg-lead-agent` | Lead researcher, planning and coordination |
| `kg-query-subagent` | KG query specialist |
| `kg-mechanism-subagent` | Mechanism path mapping |
| `kg-answer-writer` | KG-grounded answer writing |

---

## Audit Pipeline (8 Agents)

Specialist agents for due-diligence audits. Run in parallel via `/audit` command.

### Core Specialists (Phase 1)
| Agent | Purpose | Weight |
|-------|---------|--------|
| `audit-structure-specialist` | Dead code, naming, giant files, organization | medium |
| `audit-dependency-specialist` | Vulnerabilities, outdated, unused, licenses | medium |
| `audit-security-specialist` | Exposed secrets, insecure storage, HTTP, validation | heavy |

### Extended Specialists (Phase 2)
| Agent | Purpose | Weight |
|-------|---------|--------|
| `audit-pattern-specialist` | Pattern consistency, anti-patterns, style conformity | medium |
| `audit-documentation-specialist` | Doc accuracy, completeness, freshness | medium |
| `audit-test-specialist` | Coverage, test quality, isolation, flakiness | medium |
| `audit-architecture-specialist` | Circular deps, coupling, cohesion, boundaries | medium |
| `audit-design-specialist` | Design tokens, UI consistency (UI projects only) | medium |

**Output:** JSON to `.claude/audit/temp/<agent>.json`
**Scoring:** Deduction-based (100 - rule violations)
**Conditional:** `audit-design-specialist` only runs for UI projects (Next.js, Expo, iOS)

---

## Cross-Cutting Agents (12 Agents)

Located in `agents/dev/`. These agents work across multiple pipelines:

| Agent | Used By | Purpose |
|-------|---------|---------|
| `a11y-enforcer` | Expo, Next.js | WCAG 2.2 compliance |
| `crash-analyzer` | All lanes | Cross-domain crash and error analysis |
| `debt-eliminator` | All lanes | Technical debt identification and prioritization |
| `design-system-architect` | All UI lanes | Design token and component system |
| `design-token-guardian` | Expo, Next.js | Token enforcement, no hardcoded values |
| `performance-enforcer` | Expo, Next.js | Bundle size, performance budgets |
| `performance-prophet` | Expo | Predictive performance analysis |
| `screenshot-analyzer` | All UI lanes | Screenshot analysis and visual comparison |
| `security-specialist` | Expo, iOS | OWASP Mobile Top 10, secure storage |
| `shadcn-specialist` | Next.js | shadcn/ui components (auto-detected) |
| `tailwind-specialist` | Next.js | Tailwind CSS (auto-detected) |
| `version-shield` | All lanes | Dependency version management and breaking changes |

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
  iOS/              # 19 agents
  nextjs/           # 15 agents
  django-react/     # 13 agents
  expo/             # 12 agents
  dev/              # 12 agents (cross-cutting)
  os-dev/           # 11 agents (os-dev-* + orca-pipeline-*)
  audit/            # 8 agents
  shopify/          # 8 agents
  research/         # 7 agents
  typography/       # 6 agents
  seo/              # 5 agents
  kg/               # 4 agents
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
_Last sync: 2026-02-06_
