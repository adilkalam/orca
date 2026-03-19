# ORCA-OS

**Orchestrated Reasoning & Coordination Architecture for Claude Code**

ORCA-OS transforms Claude Code from a coding assistant into a sophisticated multi-agent operating system with memory, self-improvement, and domain-specific orchestration.

---

## What's Inside

- **Specialized Agents** across 11 domains (Next.js, iOS, Expo, Django-React, Research, Data, 3D Printing, Creative Design, Typography, OS-Dev, Orca-Pipeline)
- **Slash Commands** for orchestration, planning, thinking, and design review
- **Persistent Memory** via Workshop and project-context MCP
- **Session Recording** via orca-record (captures tool calls, file changes across sessions)
- **Self-Improvement System** that learns rules from your interactions
- **49 Reasoning Operations** via cognition-mcp
- **Deep Thinking** via RVRY MCP (`/deepthink`, `/problem-solve`)


---

## Quick Start

### Requirements

- **Node.js** v18+ and npm
- **Python 3.10+** (required for web scraping MCP)
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
3. Install ORCA-OS files to `~/.claude`
4. Configure MCP servers in `~/.claude.json`
5. Initialize memory systems

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
| `/deepthink` | Depth-first exploration with route-based modes (via RVRY) |
| `/problem-solve` | Convergent 8-step decision pipeline (via RVRY) |
| `/challenge` | Adversarial analysis of proposals |

### Utility
| Command | Description |
|---------|-------------|
| `/audit` | Multi-agent due diligence code auditing |
| `/reflect` | Learn rules from session interactions |
| `/self-improve` | Process improvement signals from reflection |
| `/root-cause` | Structured root cause analysis |
| `/enhance` | Transform vague prompts into structured requests |
| `/clone-website` | Analyze and spec website cloning |
| `/continue` | Resume interrupted pipeline execution |
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
| `/design` | 3D printing (OpenSCAD, STL), creative design thinking |
| `/illustrate` | Measured Adobe Photoshop/Illustrator execution |
| `/orca-os-dev` | ORCA-OS development (for contributors) |
| `/orca-pipeline` | Create new domain pipelines |

## Design & Memory Commands

| Command | Description |
|---------|-------------|
| `/design-dna` | Initialize and manage design system tokens |
| `/design-review` | Visual quality gate using design reviewer agents |
| `/project-memory` | Workshop memory management (decisions, gotchas) |
| `/memory-search` | Unified search across all memory systems |
| `/project-code` | Code context management (semantic search) |
| `/session-save` | Save session context for next time |
| `/session-resume` | Resume saved session context |

---

## Agents by Domain

| Domain | Agents | Purpose |
|--------|--------|---------|
| iOS | 19 | Native iOS/macOS development with SwiftUI, UIKit |
| Next.js | 15 | Web development with React, TypeScript, CSS, design systems |
| Django-React | 13 | Full-stack Django + React TypeScript |
| Expo | 12 | React Native mobile development |
| Dev (shared) | 12 | Cross-cutting specialists (a11y, performance, security, design) |
| OS-Dev | 11 | ORCA-OS development and maintenance |
| Research | 7 | Deep research with citations and fact-checking |
| Typography | 6 | Font editing, TTF export, exploration tools |
| Data | 4 | Analytics, competitive analysis |
| 3D Printing | -- | Skills + MCP driven (bambu-3mf, openscad-mcp, print-prep skill) |
| Creative Design | -- | Skills + MCP driven (adb-mcp, adobe-execution skill) |

---

## MCP Servers

### Core (Auto-Configured)

- **context7** - Up-to-date library documentation
- **sequential-thinking** - Multi-step reasoning
- **cognition-mcp** - 49 reasoning operations + recording layer integration
- **project-context** - Project memory and semantic search
- **orca-record** - Session recording CLI (captures tool calls, file changes, injects history)
- **crawl4ai** - Web scraping & research (Docker-based, powers `/research`)
- **RVRY** - Deep thinking and problem solving (`/deepthink`, `/problem-solve`)

### Optional (User Prompted)

- **bambu-3mf** - Bambu Studio 3MF print settings (8 tools: presets, slicing, analysis)
- **openscad-mcp** - 3D modeling with OpenSCAD (render, analyze STL, compare)
- **chrome-devtools** - Browser debugging, screenshots, design review
- **XcodeBuildMCP** - iOS/macOS build automation
- **Adobe Photoshop + Illustrator** - Creative tools (requires uv, Adobe apps)

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
│   ├── os-dev/       # ORCA-OS development
│   ├── research/     # Research pipeline agents
│   ├── typography/   # Font and type specialists
│   └── data/         # Analytics agents
├── bin/              # CLI tools
│   └── orca-record   # Session recording binary
├── commands/         # Slash commands
├── skills/           # Reusable behavior patterns
│   ├── print-prep/   # Bambu Studio settings oracle
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
│   ├── cognition-mcp/
│   ├── bambu-3mf/    # Bambu Studio 3MF manipulation
│   └── bambu-mcp-agent/  # 3MF analysis agent (Python)
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

**Manual (conversation-level).** The `/reflect` command extracts learning signals from your interactions:

```bash
/reflect                    # Analyze recent session
/reflect learn "rule"       # Add a new rule
/reflect status             # Show active rules
/reflect unlearn "rule-id"  # Remove a rule
```

Rules from `/reflect` are stored in your project's CLAUDE.md. Standards from gate failures are stored in Workshop and loaded via ProjectContext MCP.

---

## Workflow Guide

See `quick-reference/` for detailed usage patterns:
- `cognition.md` -- Thinking and reasoning commands
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

ORCA-OS v7.0

---

## License

MIT License - See LICENSE file for details.

---

Built with Claude Code. Powered by Opus 4.6.
