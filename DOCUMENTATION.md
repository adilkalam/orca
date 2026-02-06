# ORCA-OS Documentation

**Version:** OS 5.1
**Last Updated:** 2026-02-06

Welcome to the ORCA-OS documentation. This document serves as the entry point and navigation hub for all ORCA-OS documentation.

---

## Quick Start

New to ORCA-OS? Start here:

1. **[README](README.md)** - What ORCA is and why it exists
2. **[Quick Start Guide](QUICK-START.md)** - Installation and first commands
3. **[Why ORCA Architecture](docs/concepts/why-orca-architecture.md)** - Design philosophy
4. **[Pipeline Model](docs/concepts/pipeline-model.md)** - Multi-lane pipeline architecture
5. **[Complexity Routing](docs/concepts/complexity-routing.md)** - Three-tier routing (tweak/default/complex)

---

## Core Concepts

Foundational concepts that power ORCA-OS:

| Document | Description |
|----------|-------------|
| [Pipeline Model](docs/concepts/pipeline-model.md) | Multi-lane pipeline architecture with phases and gates |
| [Complexity Routing](docs/concepts/complexity-routing.md) | Three-tier task routing: tweak, default, complex |
| [Memory Systems](docs/concepts/memory-systems.md) | Workshop + code-index.db + ProjectContext integration |
| [Response Awareness](docs/concepts/response-awareness.md) | RA tagging system for tracking assumptions |
| [Skills](docs/concepts/skills.md) | Reusable knowledge packages for agents |
| [Cognition MCP](docs/concepts/cognition-mcp.md) | Structured reasoning via cognition-mcp |
| [Self-Improvement](docs/concepts/self-improvement.md) | Agent learning loops and reflexion |
| [Improvement Bus](docs/concepts/improvement-bus.md) | Unified event stream for system improvements |
| [Why ORCA Architecture](docs/concepts/why-orca-architecture.md) | Design philosophy and justification |
| [Dependency Graph](docs/concepts/dependency-graph.md) | Agent and command dependencies |
| [LLM Introspection Analysis](docs/concepts/llm-introspection-analysis.md) | Research on LLM self-observation |

---

## Pipeline Documentation

Each development lane has its own pipeline with specific agents, phases, and gates:

### Core Development Lanes

| Lane | Pipeline Doc | Entry Command |
|------|-------------|---------------|
| iOS (Swift/SwiftUI) | [ios-pipeline.md](docs/pipelines/ios-pipeline.md) | `/ios` |
| Next.js | [nextjs-pipeline.md](docs/pipelines/nextjs-pipeline.md) | `/nextjs` |
| Expo/React Native | [expo-pipeline.md](docs/pipelines/expo-pipeline.md) | `/expo` |
| Django + React | [django-react-pipeline.md](docs/pipelines/django-react-pipeline.md) | `/django-react` |

### Supporting Lanes

| Lane | Pipeline Doc | Entry Command |
|------|-------------|---------------|
| OS Development | [os-dev-pipeline.md](docs/pipelines/os-dev-pipeline.md) | `/orca-os-dev` |
| Requirements | [requirements-pipeline.md](docs/pipelines/requirements-pipeline.md) | `/plan` |
| Research | [research-pipeline.md](docs/pipelines/research-pipeline.md) | `/research` |
| SEO Content | [seo-pipeline.md](docs/pipelines/seo-pipeline.md) | `/seo` |
| SEO Optimizer | [seo-optimizer-pipeline.md](docs/pipelines/seo-optimizer-pipeline.md) | via `/seo` |
| Data Analysis | [data-pipeline.md](docs/pipelines/data-pipeline.md) | via `/orca` |
| Design | [design-pipeline.md](docs/pipelines/design-pipeline.md) | via `/orca` |
| Audit | [audit-pipeline.md](docs/pipelines/audit-pipeline.md) | `/audit` |
| Typography | [typography-pipeline.md](docs/pipelines/typography-pipeline.md) | `/typography` |
| Pipeline Creation | [orca-pipeline-pipeline.md](docs/pipelines/orca-pipeline-pipeline.md) | `/orca-pipeline` |

---

## Reference Documentation

Technical specifications and standards:

| Document | Description |
|----------|-------------|
| [Graduated Gate Scoring](docs/reference/graduated-gate-scoring.md) | Gate thresholds and scoring methodology |
| [MCP Project Config](docs/reference/mcp-project-config.md) | Project-scoped MCP configuration |
| [MCP Scoping Strategy](docs/reference/mcp-scoping-strategy.md) | How MCPs are scoped to projects |
| [Telemetry Standard](docs/reference/telemetry-standard.md) | Logging and telemetry conventions |
| [OS Dependency Graph](docs/reference/os-dependency-graph.yaml) | Source of truth for all agents, commands, and pipelines |

---

## Quick References

For day-to-day usage, see the quick-reference guides:

- **[ORCA Commands](quick-reference/ORCA-OS/ORCA-commands.md)** - All 31 commands
- **[ORCA Agents](quick-reference/ORCA-OS/ORCA-agents.md)** - All 111 agents
- **[ORCA Architecture](quick-reference/ORCA-OS/ORCA-architecture.md)** - System architecture overview
- **[ORCA MCPs](quick-reference/ORCA-OS/ORCA-mcps.md)** - MCP server reference
- **[ORCA Verification](quick-reference/ORCA-OS/ORCA-verification.md)** - Verification patterns
- **[ORCA Memory](quick-reference/ORCA-OS/ORCA-memory.md)** - Memory systems guide
- **[ORCA Learning](quick-reference/ORCA-OS/ORCA-learning.md)** - Learning and self-improvement

### Workflow Guides

- [iOS Workflow](quick-reference/workflows/readme-ios.md)
- [Next.js Workflow](quick-reference/workflows/readme-nextjs.md)
- [Expo Workflow](quick-reference/workflows/readme-expo.md)
- [Django-React Workflow](quick-reference/workflows/readme-django-react.md)
- [Research Workflow](quick-reference/workflows/readme-research.md)
- [SEO Content Workflow](quick-reference/workflows/readme-seo-content.md)
- [Data Workflow](quick-reference/workflows/readme-data.md)
- [Audit Workflow](quick-reference/workflows/readme-audit.md)
- [OS-Dev Workflow](quick-reference/workflows/readme-os-dev.md)

---

## Agent Roster

See [agents.md](docs/agents.md) for the complete agent inventory. 111 agents across 11 domains:

| Domain | Count | Directory |
|--------|-------|-----------|
| iOS | 19 | `agents/iOS/` |
| Next.js | 15 | `agents/nextjs/` |
| Django-React | 13 | `agents/django-react/` |
| Expo/React Native | 12 | `agents/expo/` |
| Dev (cross-domain) | 11 | `agents/dev/` |
| OS-Dev | 11 | `agents/os-dev/` |
| Audit | 8 | `agents/audit/` |
| Research | 7 | `agents/research/` |
| Typography | 6 | `agents/typography/` |
| SEO | 5 | `agents/seo/` |
| Data | 4 | `agents/data/` |

---

## Changelog

See [changelog.md](docs/changelog.md) for version history and recent changes.

---

## Documentation Structure

```
DOCUMENTATION.md        <- You are here
README.md               <- What ORCA is and why
QUICK-START.md          <- Installation and first commands
docs/
  agents.md             <- Agent roster
  changelog.md          <- Version history
  concepts/             <- Core concepts (11 docs)
  pipelines/            <- Lane-specific pipelines (14 docs)
  reference/            <- Technical specifications
quick-reference/
  ORCA-OS/              <- System reference guides
  workflows/            <- Per-lane workflow guides
```

---

_ORCA-OS v5.1 | [Quick Start](QUICK-START.md) | [README](README.md)_
