# ORCA-OS Documentation

**Version:** OS 6.2
**Last Updated:** 2026-02-13

Welcome to the ORCA-OS documentation. This document serves as the entry point and navigation hub for all ORCA-OS documentation.

---

## Quick Start

New to ORCA-OS? Start here:

1. **[Why ORCA Architecture](concepts/why-orca-architecture.md)** - Design philosophy
2. **[Pipeline Model](concepts/pipeline-model.md)** - Multi-lane pipeline architecture
3. **[Complexity Routing](concepts/complexity-routing.md)** - Four-tier routing (light/default/tweak/complex)
4. **[Memory Systems](concepts/memory-systems.md)** - Workshop, code-index.db, and ProjectContext

---

## Core Concepts

Foundational concepts that power ORCA-OS:

| Document | Description |
|----------|-------------|
| [Pipeline Model](concepts/pipeline-model.md) | Multi-lane pipeline architecture with phases and gates |
| [Complexity Routing](concepts/complexity-routing.md) | Four-tier task routing: light, default, tweak, complex |
| [Memory Systems](concepts/memory-systems.md) | Workshop + code-index.db + ProjectContext integration |
| [Response Awareness](concepts/response-awareness.md) | RA tagging system for tracking assumptions |
| [Skills](concepts/skills.md) | Reusable knowledge packages for agents |
| [Cognition MCP](concepts/cognition-mcp.md) | Structured reasoning via cognition-mcp |
| [Self-Improvement](concepts/self-improvement.md) | Agent learning loops and reflexion |
| [Improvement Bus](concepts/improvement-bus.md) | Unified event stream for system improvements |
| [Why ORCA Architecture](concepts/why-orca-architecture.md) | Design philosophy and justification |
| [Dependency Graph](concepts/dependency-graph.md) | Agent and command dependencies |
| [LLM Introspection Analysis](concepts/llm-introspection-analysis.md) | Research on LLM self-observation |

---

## Pipeline Documentation

Each development lane has its own pipeline with specific agents, phases, and gates:

### Core Development Lanes

| Lane | Pipeline Doc | Entry Command |
|------|-------------|---------------|
| iOS (Swift/SwiftUI) | [ios-pipeline.md](pipelines/ios-pipeline.md) | `/ios` |
| Next.js | [nextjs-pipeline.md](pipelines/nextjs-pipeline.md) | `/nextjs` |
| Expo/React Native | [expo-pipeline.md](pipelines/expo-pipeline.md) | `/expo` |
| Django + React | [django-react-pipeline.md](pipelines/django-react-pipeline.md) | `/django-react` |

### Supporting Lanes

| Lane | Pipeline Doc | Entry Command |
|------|-------------|---------------|
| OS Development | [os-dev-pipeline.md](pipelines/os-dev-pipeline.md) | `/orca-os-dev` |
| Requirements | [requirements-pipeline.md](pipelines/requirements-pipeline.md) | `/plan` |
| Research | [research-pipeline.md](pipelines/research-pipeline.md) | `/research` |
| SEO Content | [seo-pipeline.md](pipelines/seo-pipeline.md) | `/seo` |
| SEO Optimizer | [seo-optimizer-pipeline.md](pipelines/seo-optimizer-pipeline.md) | via `/seo` |
| Data Analysis | [data-pipeline.md](pipelines/data-pipeline.md) | via `/orca` |
| Design | [design-pipeline.md](pipelines/design-pipeline.md) | via `/orca` |
| Audit | [audit-pipeline.md](pipelines/audit-pipeline.md) | `/audit` |
| Typography | [typography-pipeline.md](pipelines/typography-pipeline.md) | `/typography` |
| Pipeline Creation | [orca-pipeline-pipeline.md](pipelines/orca-pipeline-pipeline.md) | `/orca-pipeline` |

---

## Reference Documentation

Technical specifications and standards:

| Document | Description |
|----------|-------------|
| [Graduated Gate Scoring](reference/graduated-gate-scoring.md) | Gate thresholds and scoring methodology |
| [MCP Project Config](reference/mcp-project-config.md) | Project-scoped MCP configuration |
| [MCP Scoping Strategy](reference/mcp-scoping-strategy.md) | How MCPs are scoped to projects |
| [Telemetry Standard](reference/telemetry-standard.md) | Logging and telemetry conventions (deprecated -- use orca-record) |
| [OS Dependency Graph](reference/os-dependency-graph.yaml) | Source of truth for all agents, commands, and pipelines |

---

## Quick References

For day-to-day usage, see the quick-reference guides:

- **[ORCA Commands](../quick-reference/ORCA-OS/ORCA-commands.md)** - All 33 commands
- **[ORCA Agents](../quick-reference/ORCA-OS/ORCA-agents.md)** - All 112 agents
- **[ORCA Architecture](../quick-reference/ORCA-OS/ORCA-architecture.md)** - System architecture overview
- **[ORCA MCPs](../quick-reference/ORCA-OS/ORCA-mcps.md)** - MCP server reference
- **[ORCA Verification](../quick-reference/ORCA-OS/ORCA-verification.md)** - Verification patterns
- **[ORCA Memory](../quick-reference/ORCA-OS/ORCA-memory.md)** - Memory systems guide
- **[ORCA Learning](../quick-reference/ORCA-OS/ORCA-learning.md)** - Learning and self-improvement

### Workflow Guides

- [iOS Workflow](../quick-reference/workflows/readme-ios.md)
- [Next.js Workflow](../quick-reference/workflows/readme-nextjs.md)
- [Expo Workflow](../quick-reference/workflows/readme-expo.md)
- [Django-React Workflow](../quick-reference/workflows/readme-django-react.md)
- [Research Workflow](../quick-reference/workflows/readme-research.md)
- [SEO Content Workflow](../quick-reference/workflows/readme-seo-content.md)
- [Data Workflow](../quick-reference/workflows/readme-data.md)
- [Audit Workflow](../quick-reference/workflows/readme-audit.md)
- [OS-Dev Workflow](../quick-reference/workflows/readme-os-dev.md)
- [SEO Optimizer Workflow](../quick-reference/workflows/readme-seo-optimizer.md)
- [Visual Design Workflow](../quick-reference/workflows/readme-visual-design.md)
- [Orca Pipeline Workflow](../quick-reference/workflows/readme-orca-pipeline.md)

---

## Agent Roster

See [agent-index.md](agent-index.md) for the complete agent inventory. 112 agents across 11 domains:

| Domain | Count | Directory |
|--------|-------|-----------|
| iOS | 19 | `agents/iOS/` |
| Next.js | 15 | `agents/nextjs/` |
| Django-React | 13 | `agents/django-react/` |
| Expo/React Native | 12 | `agents/expo/` |
| Dev (cross-domain) | 12 | `agents/dev/` |
| OS-Dev | 11 | `agents/os-dev/` |
| Audit | 8 | `agents/audit/` |
| Research | 7 | `agents/research/` |
| Typography | 6 | `agents/typography/` |
| SEO | 5 | `agents/seo/` |
| Data | 4 | `agents/data/` |

---

## Changelog

See [changelog.md](changelog.md) for version history and recent changes.

---

## Documentation Structure

```
docs/
+-- DOCUMENTATION.md       <- You are here
+-- agent-index.md         <- Agent roster
+-- changelog.md           <- Version history
+-- concepts/              <- Core concepts (11 docs)
+-- pipelines/             <- Lane-specific pipelines (14 docs)
+-- reference/             <- Technical specifications
```

---

_ORCA-OS v6.0 | See [quick-reference/](../quick-reference/) for day-to-day guides_
