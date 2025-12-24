# Agent Roster - OS 4.0

**Total: 90 agents** across 6 domains + cross-cutting specialists.

## Agent Enrichment (v4.0)

All agents have been enriched with patterns extracted from competitor system prompts:

**Universal Skills (all agents reference these):**
- `cursor-code-style` - Variable naming, control flow, comments
- `lovable-pitfalls` - 7 common mistakes to avoid
- `search-before-edit` - Mandatory grep before modifying files
- `linter-loop-limits` - 3-strike rule for linter loops
- `debugging-first` - Debug tools before code changes

**Lane-Specific Patterns:**
- Next.js: V0/Lovable design rules (color limits, component sizes, contrast ratios)
- iOS: Swift-agents patterns (iOS version checks, @MainActor usage)
- Expo: React Native best practices (FlatList, StyleSheet.create, platform conventions)
- Research: Perplexity citation format (inline citations, 10K word reports)

**Agent-Level Learning:**
- Agents can discover and record patterns to `.claude/agent-knowledge/{agent}/patterns.json`
- Patterns promoted when success rate >= 85% with 10+ occurrences
- Builder agents have Knowledge Persistence footers for self-improvement

## iOS Lane (19 agents)

| Agent | Role |
|-------|------|
| `ios-grand-architect` | Opus orchestrator, coordinates full pipeline |
| `ios-light-orchestrator` | Fast path for simple tasks |
| `ios-architect` | Planning and architecture |
| `ios-builder` | Primary implementation |
| `ios-standards-enforcer` | Standards gate |
| `ios-verification` | Verification gate |
| `ios-swiftui-specialist` | SwiftUI implementation |
| `ios-uikit-specialist` | UIKit implementation |
| `ios-accessibility-specialist` | Accessibility compliance |
| `ios-performance-specialist` | Performance optimization |
| `ios-security-specialist` | Security review |
| `ios-persistence-specialist` | Data persistence (SwiftData, Core Data) |
| `ios-networking-specialist` | Networking and API integration |
| `ios-testing-specialist` | Swift Testing and test design |
| `ios-ui-testing-specialist` | UI testing |
| `ios-spm-config-specialist` | SPM and Xcode config |
| `ios-fastlane-specialist` | Fastlane and CI/CD |
| `ios-ui-reviewer` | UI/UX review |
| `design-dna-guardian` | Design system compliance |

## Next.js Lane (16 agents)

| Agent | Role |
|-------|------|
| `nextjs-grand-architect` | Opus orchestrator |
| `nextjs-light-orchestrator` | Fast path for simple tasks |
| `nextjs-architect` | Planning and architecture |
| `nextjs-builder` | Primary implementation |
| `nextjs-standards-enforcer` | Standards gate |
| `nextjs-css-architecture-gate` | CSS/layout architecture gate |
| `nextjs-verification-agent` | Verification gate |
| `nextjs-typescript-specialist` | TypeScript patterns |
| `tailwind-specialist` | Tailwind CSS |
| `shadcn-specialist` | shadcn/ui components |
| `nextjs-layout-specialist` | Layout and structure |
| `nextjs-layout-analyzer` | Layout analysis |
| `nextjs-performance-specialist` | Performance optimization |
| `nextjs-accessibility-specialist` | Accessibility compliance |
| `nextjs-seo-specialist` | SEO optimization |
| `nextjs-design-reviewer` | Design review |

## Expo Lane (11 agents)

| Agent | Role |
|-------|------|
| `expo-grand-orchestrator` | Opus orchestrator |
| `expo-light-orchestrator` | Fast path for simple tasks |
| `expo-architect-agent` | Planning and architecture |
| `expo-builder-agent` | Primary implementation |
| `expo-verification-agent` | Verification gate |
| `expo-aesthetics-specialist` | Design and aesthetics |
| `api-guardian` | API contracts and integration |
| `bundle-assassin` | Bundle size optimization |
| `impact-analyzer` | Change impact analysis |
| `refactor-surgeon` | Safe refactoring |
| `test-generator` | Test generation |

## Django-React Lane (13 agents)

| Agent | Role |
|-------|------|
| `django-react-grand-architect` | Opus orchestrator |
| `django-react-light-orchestrator` | Fast path for simple tasks |
| `django-react-architect` | Planning and architecture |
| `django-react-builder` | Primary implementation |
| `django-react-standards-enforcer` | Standards gate |
| `django-react-verification` | Verification gate |
| `django-master` | Django backend specialist |
| `django-api-specialist` | DRF API specialist |
| `django-security-specialist` | Security specialist |
| `react-typescript-wizard` | React TypeScript frontend |
| `react-state-specialist` | State management |
| `react-testing-specialist` | Testing specialist |
| `api-contract-specialist` | API contracts |

## Research Lane (7 agents)

Orchestrated directly by `/research` command (flat hierarchy).

| Agent | Role |
|-------|------|
| `research-web-search-subagent` | WebSearch + Crawl4AI for content extraction |
| `research-site-crawler-subagent` | Crawl4AI site crawling specialist |
| `research-answer-writer` | Structured answer writer (standard mode) |
| `research-deep-writer` | Long-form academic writer (deep mode) |
| `research-citation-gate` | Citation insertion and audit |
| `research-consistency-gate` | Consistency and limitations gate |
| `research-fact-checker` | Optional fact validation gate |

## SEO Lane (4 agents)

| Agent | Role |
|-------|------|
| `seo-research-specialist` | SEO research |
| `seo-brief-strategist` | Content briefs |
| `seo-draft-writer` | SEO content writing |
| `seo-quality-guardian` | SEO quality review |

## Data Lane (4 agents)

| Agent | Role |
|-------|------|
| `python-analytics-expert` | Python data analysis |
| `data-researcher` | Data research |
| `research-specialist` | General research |
| `competitive-analyst` | Competitive analysis |

## Cross-Cutting Specialists (9 agents)

| Agent | Role |
|-------|------|
| `a11y-enforcer` | Accessibility enforcement |
| `performance-enforcer` | Performance checks |
| `performance-prophet` | Performance prediction |
| `security-specialist` | Security audit |
| `design-token-guardian` | Design token compliance |
| `design-system-architect` | Design system architecture |
| `crash-analyzer` | Crash analysis |
| `debt-eliminator` | Technical debt reduction |
| `version-shield` | Version compatibility |

## Agent Roles

### Orchestrators (Never Write Code)
- Grand architects (Opus 4.5)
- Light orchestrators (Opus 4.5, fast path)
- Coordinate via `Task` tool only
- Classify complexity, gather context, delegate

### Specialists (Implement Changes)
- Domain experts
- Use `Read`, `Edit`, `Write` tools
- Report changes back to orchestrator
- Tag assumptions with RA tags

### Gates (Validate Only)
- Standards enforcers
- Verification agents
- Use `Read`, `Bash` for checks
- Report PASS/CAUTION/FAIL
- Never fix issues

## Agent Definition Location

Agent definitions live in `agents/`:
```
agents/
  iOS/              # iOS specialists
  dev/              # Next.js, Django-React
  expo/             # Expo specialists
  research/         # Research specialists
  data/             # Data specialists
  seo/              # SEO specialists
  *.md              # Cross-cutting specialists
```

Each agent is a markdown file with YAML frontmatter:
```yaml
---
name: agent-name
description: What the agent does
tools: Read, Edit, MultiEdit, Grep, Glob, Bash
---

# Agent Title

Agent instructions...
```

**Note:** All agents use Opus 4.5 (default). No model line needed. Tools MUST be comma-separated strings, NOT YAML arrays.
