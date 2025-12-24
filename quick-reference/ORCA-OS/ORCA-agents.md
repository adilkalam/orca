# OS 4.0 Agents Quick Reference

**Last Updated:** 2025-12-21
**Version:** OS 4.0.0
**Total Agents:** 90

---

## Agent Architecture (OS 4.0)

**All Agents Use Opus 4.5:**
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
| Next.js | 17 | `agents/dev/nextjs-*` + tailwind/shadcn-specialist |
| Django-React | 13 | `agents/dev/django-*`, `react-*`, `api-contract-*` |
| Expo | 11 | `agents/expo/` |
| Research | 8 | `agents/research/` |
| SEO | 4 | `agents/seo/` |
| Data | 4 | `agents/data/` |
| OS-Dev | 5 | `agents/dev/os-dev-*` |
| Cross-Cutting | 9 | `agents/` (root) |
| **TOTAL** | **89** | |

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
| `nextjs-layout-analyzer` | Structure-first layout analysis |
| `nextjs-layout-specialist` | Complex layout implementation |
| `nextjs-css-specialist` | Semantic CSS, @layer, design tokens |
| `nextjs-css-architecture-gate` | CSS architecture validation |
| `tailwind-specialist` | Tailwind CSS (auto-detected via tailwind.config.* or @import 'tailwindcss') |
| `shadcn-specialist` | shadcn/ui components (auto-detected via components.json or components/ui/) |
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

## Expo Pipeline (11 Agents)

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

---

## Data Pipeline (4 Agents)

| Agent | Purpose |
|-------|---------|
| `data-researcher` | Data discovery and exploration |
| `research-specialist` | Deep research, context gathering |
| `python-analytics-expert` | Python-based data analysis |
| `competitive-analyst` | Market and competitor research |

---

## OS-Dev Pipeline (5 Agents)

### ORCA-OS Development
| Agent | Purpose |
|-------|---------|
| `os-dev-grand-architect` | OS architecture planning |
| `os-dev-architect` | Implementation planning |
| `os-dev-builder` | Agent/command development |
| `os-dev-standards-enforcer` | OS standards validation |
| `os-dev-verification` | Deployment verification |

---

## Cross-Cutting Agents (11 Agents)

These agents work across multiple pipelines:

| Agent | Used By | Purpose |
|-------|---------|---------|
| `a11y-enforcer` | Expo, Next.js | WCAG 2.2 compliance |
| `crash-analyzer` | All lanes | Cross-domain crash and error analysis (NEW OS 3.1) |
| `debt-eliminator` | All lanes | Technical debt identification and prioritization (NEW OS 3.1) |
| `design-system-architect` | All UI lanes | Design token and component system |
| `design-token-guardian` | Expo, Next.js | Token enforcement, no hardcoded values |
| `performance-enforcer` | Expo, Next.js | Bundle size, performance budgets |
| `performance-prophet` | Expo | Predictive performance analysis |
| `security-specialist` | Expo, iOS | OWASP Mobile Top 10, secure storage |
| `shadcn-specialist` | Next.js, React | shadcn/ui components, CVA, Radix UI (auto-detected) |
| `tailwind-specialist` | Next.js, Expo | Tailwind CSS v4, utility composition (auto-detected) |
| `version-shield` | All lanes | Dependency version management and breaking changes (NEW OS 3.1) |

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
  dev/              # 21 agents (16 nextjs-* + 5 os-dev-*)
  django-react/     # 13 agents
  expo/             # 11 agents
  research/         # 8 agents
  seo/              # 4 agents
  data/             # 4 agents
  (root level)      # 9 cross-cutting agents
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
_Last sync: 2025-12-18_
