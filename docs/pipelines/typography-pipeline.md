# Typography Domain Pipeline

**Status:** OS 5.0 Pipeline (Typography)
**Last Updated:** 2026-02-03
**Deployment:** Global (~/.claude/)

---

## Overview

The typography pipeline handles font library management workflows:
- **Glyph editing** - Surgical contour modifications with fontTools
- **TTF export** - OTF to TTF conversion for Epson LabelWorks
- **Font selection** - Recommendations and pairing suggestions
- **Typography exploration** - Generate interactive testing tools for font decisions

It combines:
- OS 5.0 primitives (phase_state.json, Workshop memory)
- Domain-specific agents for font operations
- Interactive checkpoints (backup, batch confirmation)
- Path verification against CLAUDE.md canonical rules
- Workshop memory persistence after every operation

---

## Scope & Domain

Use this pipeline when:
- Editing glyphs (contour modifications, stroke adjustments, terminal edits)
- Exporting fonts to TTF for Epson LabelWorks
- Selecting fonts for projects or getting pairing recommendations
- Comparing typefaces

Do NOT use for:
- General design work (use design pipeline)
- Web typography CSS (use webdev pipeline)
- Font installation or system font management

---

## Entry Point

```
/typography [--tweak|--complex|--explorer] <task description>
```

Examples:
```bash
/typography Reduce terminal curl on DomaineSansCustom lowercase
/typography --tweak Make the period rounder in Calibre Regular
/typography Export DomaineSansCustom to TTF for Epson
/typography --complex Create Light and Bold weights via stroke offsetting
/typography Recommend fonts for technical documentation

# Explorer mode (typography testing tool generation)
/typography --explorer                       # Auto-detect format and context
/typography --explorer --nextjs              # Generate as Next.js components
/typography --explorer --html                # Generate as standalone HTML
/typography --explorer --context store       # E-commerce product UI context
/typography --explorer --context markdown    # Article/documentation context
```

---

## Agents

| Agent | Weight | Role |
|-------|--------|------|
| `typography-orchestrator` | Light | Entry point, routing, checkpoints, memory |
| `glyph-editor` | Heavy | fontTools-based glyph modifications |
| `ttf-exporter` | Medium | OTF to TTF conversion |
| `typography-advisor` | Light | Font selection and recommendations |
| `typography-explorer-generator` | Heavy | Generate interactive typography testing tools |
| `path-guardian` | Gate | Path validation, sacred collection protection |

---

## Explorer Mode (`--explorer`)

The explorer mode generates interactive typography testing tools for rapid font exploration and decision-making.

### Usage

```bash
/typography --explorer                       # Auto-detect format and context
/typography --explorer --nextjs              # Generate as Next.js app
/typography --explorer --html                # Generate as standalone HTML
/typography --explorer --context store       # E-commerce UI context
/typography --explorer --context markdown    # Article/documentation context
```

### Format Options

| Format | Output | Best For |
|--------|--------|----------|
| `--nextjs` | `tools/typography-explorer/` React components | Next.js projects, hot reload |
| `--html` | `tools/typography-explorer.html` single file | Any project, zero deps |
| (auto) | Detects from `next.config.*` | Default behavior |

### Context Types

| Context | UI Elements | Use Case |
|---------|-------------|----------|
| `store` | Product titles, prices, sizes | E-commerce product cards |
| `markdown` | H1-H4, body, mono, blockquotes | Articles, documentation |
| (auto) | Detects from project structure | Default behavior |

### Generated Controls

Each text element gets a control panel with:
- **Family** - Font family selector
- **Weight** - 100-900 weight selector
- **Size** - Slider with px display
- **Spacing** - Letter-spacing slider (em)
- **Style** - Normal / Italic toggle

### Features

- Dark/light theme toggle
- Current values indicator (fixed badge)
- Real-time preview
- Relative font paths (works from `tools/` directory)

### Agent

Uses `typography-explorer-generator` to:
1. Scan project for fonts in `public/fonts/`
2. Generate `@font-face` rules for all weights/styles
3. Create control panels per element
4. Build preview area matching target UI context

---

## Complexity Tiers

### --tweak (Simple)
- Single glyph adjustment or quick question
- Direct routing to specialist
- No checkpoints
- Example: "Make the period rounder in Calibre Regular"

### Default (Standard)
- Single font family operation
- Full workflow with checkpoints
- Checkpoints: backup + batch
- Example: "Export DomaineSansCustom to TTF"

### --complex (Complex)
- Multi-font or experimental operations
- Full pipeline with all agents
- Checkpoints: backup + per-weight preview + batch
- Example: "Create Light and Bold weights via stroke offsetting"

---

## Pipeline Architecture

```
Request (Typography task)
    |
/typography (Command)
    |
[Phase 1: Classification]
    |
[Phase 2: Context & Validation] --> path-guardian
    |
[Phase 3: Backup Checkpoint] <-- USER APPROVAL
    |
    +--[Glyph Editing]--------> glyph-editor
    |
    +--[TTF Export]-----------> ttf-exporter
    |
    +--[Font Selection]-------> typography-advisor
    |
[Phase 4: Batch Checkpoint] <-- USER APPROVAL (if multi-weight)
    |
[Phase 5: Batch Execution]
    |
[Phase 6: Path Verification] --> path-guardian
    |
[Phase 7: Memory Persistence] --> Workshop
    |
[Phase 8: Completion]
```

---

## Phase Definitions

### Phase 1: Classification

**Agent:** typography-orchestrator

Tasks:
- Parse request for complexity tier (--tweak, default, --complex)
- Classify workflow type (glyph_edit, ttf_export, font_selection)
- Identify target fonts and operations

Outputs:
- `complexity_tier`
- `workflow_type`
- `target_fonts`
- `operation_summary`

### Phase 2: Context & Validation

**Agent:** typography-orchestrator + path-guardian

Tasks:
- Read CLAUDE.md for current rules
- Validate paths via path-guardian
- Check for sacred collection violations

Outputs:
- `claude_md_rules`
- `path_validation_status`
- `sacred_collection_check`

### Phase 3: Backup Checkpoint

**Agent:** typography-orchestrator

**CHECKPOINT - Requires user approval**

Tasks:
- Propose backup location
- Get user confirmation
- Create timestamped backup

Outputs:
- `backup_path`
- `backup_manifest`

### Phase 4: Specialist Execution

**Agents:** glyph-editor | ttf-exporter | typography-advisor

Tasks vary by workflow type:
- **glyph_edit:** Contour modification, proof generation
- **ttf_export:** OTF to TTF conversion, name table modification
- **font_selection:** Query font-index.json, return recommendations

Outputs:
- Workflow-specific results (see agent docs)

### Phase 5: Batch Checkpoint

**Agent:** typography-orchestrator

**CHECKPOINT - Requires user approval** (if multi-weight)

Tasks:
- List all weights to be processed
- Get user confirmation
- Option to preview single weight first

Outputs:
- `batch_manifest`
- `affected_weights`

### Phase 6: Path Verification

**Agent:** path-guardian

Tasks:
- Verify all output paths
- Check for anti-patterns
- Confirm no sacred collection writes

Outputs:
- `verification_status`
- `warnings`
- `blocked_paths`

### Phase 7: Memory Persistence

**Agent:** typography-orchestrator

Tasks:
- Record operation to Workshop memory
- Include all relevant metadata

Outputs:
- `workshop_entry`
- `task_summary`

### Phase 8: Completion

**Agent:** typography-orchestrator

Tasks:
- Generate completion report
- Clean up temp files
- Return summary to user

Outputs:
- `final_report`
- `cleanup_status`

---

## Checkpoint Details

### Backup Checkpoint

**When:** Before any font modification

```
AskUserQuestion:
  question: "Create backup before modifying fonts?"
  options:
    - "Yes, create backup" -> proceed
    - "Change location" -> prompt for path
    - "Skip backup" -> proceed with warning
```

Backup format: `.claude/backups/{date}-{font}-pre-{operation}/`

### Batch Checkpoint

**When:** Operation affects multiple weights

```
AskUserQuestion:
  question: "Apply to all {N} weights?"
  options:
    - "Yes, apply to all" -> proceed with batch
    - "Preview one first" -> run on single weight, then re-ask
    - "Cancel" -> abort
```

---

## Sacred Collections

These collections are **READ-ONLY** with **NO OVERRIDE**:

| Collection | Path Pattern |
|------------|--------------|
| Adobe | `[Adobe]*/**` |
| FontShop 100 Best | `[FontShop]*/**` |
| Google Fonts | `Google Fonts/**` |
| Nerd Fonts | `Nerd Fonts/**` |
| Icons | `Icons/**` |

Any attempt to modify these results in **BLOCKED** status.

---

## Canonical Paths

| Output Type | Canonical Path |
|-------------|----------------|
| TTF exports | `/_Epson-TTF/` |
| Working files | `/.claude/temp/` |
| Backups | `/.claude/backups/` |
| Archive | `/.archived/` |

Non-canonical paths trigger **WARNING** (user can override).

---

## Workshop Memory

**Persistence:** ALWAYS (after every operation)

### Record Schema

```yaml
operation:
  timestamp: ISO-8601
  type: glyph_edit | ttf_export | font_selection
  font_family: string
  weights_affected: [string]
  glyphs_modified: [string] | null
  paths_input: [string]
  paths_output: [string]
  backup_path: string | null
  outcome: success | partial | failure
  notes: string
```

### Workshop Commands

```bash
# After every task
workshop note "Typography: {operation} on {font}"

# For decisions
workshop decision "{what}" -r "{why}"

# For gotchas
workshop gotcha "{issue}"
```

---

## Phase State Contract

Location: `.claude/orchestration/phase_state.json`

For `domain: "typography"`:

```json
{
  "domain": "typography",
  "current_phase": "classification | context_validation | backup | glyph_editing | ttf_export | font_selection | batch_confirmation | batch_execution | path_verification | memory_persistence | completion",
  "complexity_tier": "tweak | default | complex",
  "workflow_type": "glyph_edit | ttf_export | font_selection | mixed",
  "phases": {
    "classification": { "status": "completed", ... },
    "context_validation": { "status": "completed", ... },
    ...
  },
  "checkpoints": {
    "backup": { "approved": true, "path": "..." },
    "batch": { "approved": true, "weights": [...] }
  },
  "artifacts": [
    ".claude/temp/proof-before.png",
    ".claude/temp/proof-after.png",
    "/_Epson-TTF/Font-Regular.ttf"
  ]
}
```

See `docs/reference/phase-configs/typography-phase-config.yaml` for full schema.
