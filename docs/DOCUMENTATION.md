# ORCA-OS Documentation

**Version:** OS 4.2
**Last Updated:** 2025-12-24

Welcome to the ORCA-OS documentation. This document serves as the entry point and navigation hub for all ORCA-OS documentation.

---

## Quick Start

New to ORCA-OS? Start here:

1. **[Why ORCA Architecture](concepts/why-orca-architecture.md)** - Understand why the system is designed this way
2. **[Pipeline Model](concepts/pipeline-model.md)** - Learn the multi-lane pipeline architecture
3. **[Complexity Routing](concepts/complexity-routing.md)** - Three-tier routing (tweak/default/complex)
4. **[Memory Systems](concepts/memory-systems.md)** - Workshop, vibe.db, and ProjectContext

---

## Core Concepts

Foundational concepts that power ORCA-OS:

| Document | Description |
|----------|-------------|
| [Pipeline Model](concepts/pipeline-model.md) | Multi-lane pipeline architecture with phases and gates |
| [Complexity Routing](concepts/complexity-routing.md) | Three-tier task routing: tweak, default, complex |
| [Memory Systems](concepts/memory-systems.md) | Workshop + vibe.db + ProjectContext integration |
| [Response Awareness](concepts/response-awareness.md) | RA tagging system for tracking assumptions |
| [Skills](concepts/skills.md) | Reusable knowledge packages for agents |
| [Cognition MCP](concepts/cognition-mcp.md) | Structured reasoning via cognition-mcp |
| [Self-Improvement](concepts/self-improvement.md) | Agent learning loops and reflexion |
| [Improvement Bus](concepts/improvement-bus.md) | Unified event stream for system improvements |
| [Why ORCA Architecture](concepts/why-orca-architecture.md) | Design philosophy and justification |

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
| SEO Content | [seo-pipeline.md](pipelines/seo-pipeline.md) | `/seo` |
| Research | [research-pipeline.md](pipelines/research-pipeline.md) | `/research` |
| Data Analysis | [data-pipeline.md](pipelines/data-pipeline.md) | via `/orca` |
| Design | [design-pipeline.md](pipelines/design-pipeline.md) | via `/orca` |

---

## Reference Documentation

Technical specifications and standards:

| Document | Description |
|----------|-------------|
| [Graduated Gate Scoring](reference/graduated-gate-scoring.md) | Gate thresholds and scoring methodology |
| [MCP Project Config](reference/mcp-project-config.md) | Project-scoped MCP configuration |
| [MCP Scoping Strategy](reference/mcp-scoping-strategy.md) | How MCPs are scoped to projects |
| [Telemetry Standard](reference/telemetry-standard.md) | Logging and telemetry conventions |
| [Dependency Graph](concepts/dependency-graph.md) | Agent and command dependencies |

---

## Quick References

For day-to-day usage, see the quick-reference guides:

- **[ORCA Commands](../quick-reference/ORCA-OS/ORCA-commands.md)** - All 31 commands
- **[ORCA Agents](../quick-reference/ORCA-OS/ORCA-agents.md)** - All 97 agents
- **[ORCA Architecture](../quick-reference/ORCA-OS/ORCA-architecture.md)** - System architecture overview
- **[ORCA MCPs](../quick-reference/ORCA-OS/ORCA-mcps.md)** - MCP server reference
- **[ORCA Verification](../quick-reference/ORCA-OS/ORCA-verification.md)** - Verification patterns

### Workflow Guides

- [iOS Workflow](../quick-reference/workflows/readme-ios.md)
- [Next.js Workflow](../quick-reference/workflows/readme-nextjs.md)
- [Expo Workflow](../quick-reference/workflows/readme-expo.md)
- [Django-React Workflow](../quick-reference/workflows/readme-django-react.md)
- [Research Workflow](../quick-reference/workflows/readme-research.md)
- [SEO Content Workflow](../quick-reference/workflows/readme-seo-content.md)

---

## Research & Background

Background research that informed ORCA-OS design:

- [Prompts Research](prompts-research/README.md) - Collected research on agent prompting
- [LLM Introspection Analysis](concepts/llm-introspection-analysis.md) - Analysis of LLM self-awareness
- [LLM Reflection on Constraints](LLM-Reflection-On-Constraint-As-Source.md) - Constraint philosophy

---

## Agent Roster

See [agents.md](agents.md) for the complete agent inventory, or browse by lane:

- `agents/iOS/` - 19 iOS agents
- `agents/dev/` - Next.js, Django-React, OS-Dev agents
- `agents/expo/` - 11 Expo/React Native agents
- `agents/seo/` - 4 SEO content agents
- `agents/research/` - 7 research agents
- `agents/data/` - 4 data analysis agents

---

## Changelog

See [changelog.md](changelog.md) for version history and recent changes.

---

## Documentation Structure

```
docs/
├── DOCUMENTATION.md       ← You are here
├── agents.md              ← Agent roster
├── changelog.md           ← Version history
├── concepts/              ← Core concepts
│   ├── pipeline-model.md
│   ├── complexity-routing.md
│   ├── memory-systems.md
│   └── ...
├── pipelines/             ← Lane-specific pipelines
│   ├── ios-pipeline.md
│   ├── nextjs-pipeline.md
│   └── ...
├── reference/             ← Technical specifications
│   ├── graduated-gate-scoring.md
│   └── ...
├── research/              ← Background research
└── prompts-research/      ← Prompting research
```

---

_Part of ORCA-OS v4.2 | See [quick-reference/](../quick-reference/) for day-to-day guides_
