# ORCA-OS

**Orchestrated Reasoning & Coordination Architecture for Claude Code**

ORCA-OS transforms Claude Code from a coding assistant into a sophisticated multi-agent operating system with memory, self-improvement, and domain-specific orchestration.

---

## What's Inside

- **72 Specialized Agents** across 10 domains (cross-domain, data, design, dev, django-react, expo, iOS, nextjs, research, typography)
- **33 Slash Commands** for orchestration, planning, reasoning, and design
- **55 Skills** -- reusable behavior patterns loaded on demand
- **Persistent Memory** via Workshop and project-context MCP
- **Session Recording** via orca-record (captures tool calls, file changes across sessions)
- **Self-Improvement System** that learns rules from your interactions
- **Structured reasoning substrate** (cognition-mcp) powering the `/impeccable` design family
- **Metacognitive observation** via RVRY MCP (`/meta`)


---

## Quick Start

### Requirements

- **Node.js** v18+ and npm
- **Python 3.10+** (optional, for the Crawl4AI research MCP)
- **Bun** (optional, for session recording -- https://bun.sh)
- **Claude Code CLI** (`npm install -g @anthropic-ai/claude-code`)

### Install

```bash
# Clone the repository
git clone https://github.com/adilkalam/orca-os.git
cd orca-os

# Run the installer
./dist/install.sh
```

The installer will:
1. Check prerequisites
2. Backup any existing `~/.claude` configuration
3. Prompt you to select build lanes (opt-in; see below)
4. Install ORCA-OS files to `~/.claude`
5. Configure MCP servers in `~/.claude.json`
6. Initialize memory systems

### Lane Selection

The installer prompts which build lanes to install. The **core** -- orchestration, cognition, design, and the shared dev + cross-domain agents -- always installs. The selectable lanes are opt-in (Research defaults ON):

- iOS
- Expo
- Next.js
- Django + React
- Data
- Typography
- Research (default ON)

### Upgrade

Already have ORCA-OS? Use the fast upgrade path:

```bash
cd orca-os
git pull
./dist/install.sh --upgrade
```

Upgrade mode:
- Auto-backups without prompting
- Skips unchanged dependencies
- Preserves your optional MCP choices
- Completes in ~10-30 seconds

### Verify Installation

```bash
# Restart Claude Code
claude

# Check available commands
/help

# Try planning a task
/requirements "hello world"
```

---

## Core Commands

### Planning & Requirements
| Command | Description |
|---------|-------------|
| `/requirements` | Structured requirements gathering with cognition flags |
| `/project-setup` | Initialize CLAUDE.md with project conventions |

### Thinking & Reasoning
| Command | Description |
|---------|-------------|
| `/shimmer` | SHIMMER self-observation with an integrated answer (via cognition-mcp) |
| `/meta` | Sustained metacognitive substrate observation (via RVRY) |

### Utility
| Command | Description |
|---------|-------------|
| `/audit` | Evidence-based due diligence code auditing |
| `/self-improve` | Show Workshop memory stats and recent activity |
| `/enhance` | Transform vague prompts into structured requests |
| `/clone-website` | Analyze and spec website cloning |
| `/continue` | Resume info for previous recording sessions |
| `/document` | Generate a DESIGN.md visual contract from code |
| `/orca-status` | System status and diagnostics |

## Domain Orchestrators

| Command | Domain |
|---------|--------|
| `/orca` | Universal router - detects domain and routes appropriately |
| `/nextjs` | Next.js frontend development |
| `/ios` | Native iOS (Swift/SwiftUI) |
| `/expo` | React Native / Expo |
| `/django-react` | Django + React fullstack |
| `/research` | Deep research with citations |
| `/typography` | Font editing, TTF export, exploration tools |
| `/illustrate` | Measured Adobe Photoshop/Illustrator execution |

## Design & Memory Commands

| Command | Description |
|---------|-------------|
| `/impeccable` | Create distinctive, production-grade frontend interfaces |
| `/recraft` | Redo/recraft an interface; route by scope |
| `/refine` | Design-refinement router (--animate, --bolder, --colorize, --delight, --layout, --overdrive, --quieter, --typeset) |
| `/simplify` | Design-simplification router (--adapt, --clarify, --distill) |
| `/fortify` | Design-hardening router (--harden, --optimize, --polish) |
| `/motion-design` | Heavy motion/animation orchestrator |
| `/design-audit` | Technical quality audit (a11y, performance, responsive, anti-patterns) |
| `/design-critique` | UX critique with visual hierarchy and cognitive-load scoring |
| `/project-memory` | Workshop memory management (decisions, gotchas) |
| `/memory-search` | Unified search across all memory systems |
| `/project-code` | Code context management (semantic search) |
| `/session-save` | Save session context for next time |
| `/session-resume` | Resume saved session context |

---

## Agents by Domain

| Domain | Agents | Purpose |
|--------|--------|---------|
| iOS | 16 | Native iOS/macOS development with SwiftUI, UIKit |
| Django-React | 11 | Full-stack Django + React TypeScript |
| Expo | 10 | React Native mobile development |
| Next.js | 8 | Web development with React, TypeScript, CSS |
| Dev (shared) | 8 | Cross-cutting specialists (a11y, performance, security) |
| Research | 7 | Deep research with citations and fact-checking |
| Typography | 5 | Font editing, TTF export, exploration tools |
| Data | 4 | Analytics, competitive analysis |
| Design | 2 | Design lane specialists |
| Cross-domain | 1 | Shared orchestration helper |

Creative Design work is skills + MCP driven (the optional Adobe Photoshop/Illustrator MCP plus the `adobe-execution` skill). The `print-prep` skill ships as standalone print-settings guidance.

---

## MCP Servers

### Core (Auto-Configured)

- **context7** - Up-to-date library documentation (npx on-demand)
- **sequential-thinking** - Multi-step reasoning (npx on-demand)
- **project-context** - Project memory and semantic code search (built from bundled source)
- **cognition-mcp** - structured reasoning substrate (49 operations); powers the design lanes' constraint-loop reasoning (`/impeccable`, `/refine`, `/fortify`, `/simplify`) (built from bundled source)
- **RVRY** - Sustained metacognitive observation; powers `/meta` (installed via `npx @rvry/mcp setup`)

ORCA-OS also ships **orca-record**, a session-recording CLI (a bundled binary, not an MCP server) that captures tool calls and file changes per session.

### Optional (User Prompted)

- **chrome-devtools** - Browser debugging, screenshots, design review (npx)
- **XcodeBuildMCP** - iOS/macOS build automation (npx)
- **Crawl4AI** - Web scraping & research, powers `/research` (Docker)
- **Adobe Photoshop + Illustrator** - Creative tools (requires uv + adb-mcp, Adobe apps)

---

## Architecture

```
~/.claude/
├── agents/           # Specialized agents
│   ├── iOS/          # iOS specialists
│   ├── nextjs/       # Next.js web development
│   ├── django-react/ # Django + React specialists
│   ├── expo/         # React Native agents
│   ├── dev/          # Cross-cutting specialists
│   ├── design/       # Design lane specialists
│   ├── cross-domain/ # Shared orchestration helper
│   ├── research/     # Research pipeline agents
│   ├── typography/   # Font and type specialists
│   └── data/         # Analytics agents
├── bin/              # CLI tools
│   └── orca-record   # Session recording binary
├── commands/         # Slash commands
├── skills/           # Reusable behavior patterns
│   ├── print-prep/   # Print-settings guidance (advice only)
│   └── adobe-execution/  # Photoshop/Illustrator guardrails
├── hooks/            # Session lifecycle hooks
├── scripts/          # Utility scripts
├── docs/             # Documentation
│   ├── pipelines/    # Pipeline specifications
│   ├── concepts/     # Core concept docs
│   └── reference/    # Technical specifications
├── quick-reference/  # Quick reference guides
├── mcp/              # Custom MCP servers
│   ├── project-context-server/
│   └── cognition-mcp/
└── memory/           # Workshop database
```

---

## Memory Systems

ORCA-OS includes persistent memory across sessions:

### Workshop (Session Memory)
```bash
/project-memory status          # Check memory state
/project-memory search "topic"  # Search past decisions
/project-memory why "topic"     # Understand past choices
```

### Project Context (Semantic Search)
- Automatic context loading via MCP
- Tracks decisions, standards, and task history
- Semantic search across codebase

### Recording Layer (Session History)
- orca-record captures tool calls and file changes per session
- Stored in `.orca/recording.db` (per-project, gitignored)
- Recent session history injected before agents start work
- cognition-mcp provides 7 recording operations for querying history

---

## Self-Improvement

ORCA learns at two levels:

**Automatic (gate-level).** When a quality gate fails, the violation is persisted as a standard in Workshop memory. Future runs in the same domain load these standards automatically via `query_context`, so builders see past failures as constraints. No manual intervention needed.

**Manual (conversation-level).** The `/self-improve` command surfaces Workshop memory statistics and recent activity so you can review what the system has learned:

```bash
/self-improve   # Show Workshop memory stats and recent activity
```

Learned rules are stored in your project's CLAUDE.md. Standards from gate failures are stored in Workshop and loaded via ProjectContext MCP.

---

## Workflow Guide

See `quick-reference/` for detailed usage patterns:
- `requirements.md` -- Planning and requirements
- `orchestration.md` -- Multi-agent execution
- `research.md` -- Research with verified sources

---

## Customization

### Adding Custom Agents

Create `~/.claude/agents/my-domain/my-agent.md`:

```markdown
---
description: "What this agent does"
tools: Read, Edit, Grep, Glob, Bash
---

# My Custom Agent

Instructions for the agent...
```

### Adding Custom Commands

Create `~/.claude/commands/my-command.md`:

```markdown
---
description: "What this command does"
argument-hint: "<required arg>"
---

# /my-command

Instructions when command is invoked...
```

---

## Troubleshooting

### Commands Not Appearing

1. Restart Claude Code
2. Check if files exist in `~/.claude/commands/`
3. Verify no syntax errors in command markdown files

### MCP Server Issues

```bash
# Check MCP status
/mcp

# Debug MCP startup
claude --mcp-debug
```

### Memory Not Working

```bash
# Check Workshop status
workshop --workspace ~/.claude/memory summary

# Re-initialize if needed
workshop --workspace ~/.claude/memory init
```

### Agents Not Running

Verify agent YAML format. Tools must be comma-separated strings:
```yaml
# Correct
tools: Read, Edit, MultiEdit, Grep, Glob, Bash

# Wrong (causes silent failures)
tools: ["Read", "Edit", "MultiEdit"]
```

---

## Uninstallation

```bash
# Remove ORCA-OS
rm -rf ~/.claude

# Restore backup (if created during install)
mv ~/.claude-backup-* ~/.claude
```

---

## Support

- **Documentation**: `~/.claude/docs/` and `~/.claude/quick-reference/`
- **Issues**: https://github.com/adilkalam/orca-os/issues

---

## Version

ORCA-OS v7.1.0

---

## License

MIT License - See LICENSE file for details.

---

Built with Claude Code.
