---
description: "Typography pipeline - glyph editing, TTF export, font selection, exploration tools"
argument-hint: "[--tweak|--complex|--explorer] <task description>"
allowed-tools:
  - Task
  - Read
  - Grep
  - Glob
  - Bash
  - Write
  - Edit
  - AskUserQuestion
  - TodoWrite
---

# /typography - Font Library Management Pipeline

**REQUEST:** $ARGUMENTS

---

## Overview

This command orchestrates typography workflows for the Fonts library:
- **Glyph editing** - Surgical contour modifications with fontTools
- **TTF export** - OTF to TTF conversion for Epson LabelWorks
- **Font selection** - Recommendations and pairing suggestions
- **Typography Explorer** - Generate interactive testing tools for real-time typography exploration

## Mandatory Pre-Flight

Before ANY operation:

1. **Read CLAUDE.md** - Source of truth for paths and rules
2. **Check sacred collections** - NEVER modify [Adobe], [FontShop], Google Fonts, Nerd Fonts, Icons
3. **Verify paths** - Use canonical paths from CLAUDE.md

## Complexity Routing

Parse `$ARGUMENTS` for complexity tier:

| Flag | Tier | Routing |
|------|------|---------|
| `--tweak` | Simple | Direct to specialist, no checkpoints |
| (none) | Default | Full workflow with backup + batch checkpoints |
| `--complex` | Complex | Full pipeline with per-weight previews |
| `--explorer` | Tool Generation | Generate typography exploration tool |

---

## Explorer Mode (`--explorer`)

When `$ARGUMENTS` contains `--explorer`, route to the typography-explorer-generator agent.

### Usage

```bash
/typography --explorer                    # Generate typography tester (auto-detect format)
/typography --explorer --nextjs           # Generate as Next.js app
/typography --explorer --html             # Generate as standalone HTML
/typography --explorer --context store    # For store/product UI context
/typography --explorer --context markdown # For article/markdown context
```

### Format Detection

1. If `--nextjs` flag present: Generate Next.js React components
2. If `--html` flag present: Generate standalone HTML file
3. Otherwise, auto-detect:
   - Check for `next.config.*` in project root
   - If found: Next.js format
   - Otherwise: HTML format

### Context Detection

1. If `--context store` flag: Generate store/e-commerce UI context
2. If `--context markdown` flag: Generate article/markdown context
3. Otherwise, auto-detect from project structure:
   - Look for `data/products.json` or `shop/` directory: store context
   - Look for `content/`, `posts/`, or markdown files: markdown context
   - Default to markdown if unclear

### Delegate to Explorer Generator

```
Task(typography-explorer-generator): Generate typography exploration tool
  CONTEXT:
  - Format: {nextjs | html}
  - Context: {store | markdown}
  - Project root: {cwd}
  - Font directory: {detected_font_path}

  OUTPUTS:
  - Next.js: tools/typography-explorer/ directory
  - HTML: tools/typography-explorer.html single file
```

The agent will:
1. Scan project for available fonts
2. Generate @font-face rules for all weights/styles
3. Create control panels for each typographic element
4. Build the preview area replicating the target UI context
5. Wire up real-time JavaScript controls
6. Add dark/light theme toggle
7. Add current values indicator badge

## Workflow Classification

Analyze the request to determine workflow type:

| Keywords | Workflow | Primary Agent |
|----------|----------|---------------|
| glyph, contour, stroke, curve, terminal, edit, modify | `glyph_edit` | glyph-editor |
| ttf, export, epson, convert, labelworks | `ttf_export` | ttf-exporter |
| recommend, pair, suggest, compare, select, what font | `font_selection` | typography-advisor |
| `--explorer` flag | `explorer_generation` | typography-explorer-generator |

## Execution Flow

### 1. Classification

```yaml
classification:
  complexity_tier: tweak | default | complex
  workflow_type: glyph_edit | ttf_export | font_selection | mixed
  target_fonts: [list of font families]
  operation_summary: "brief description"
```

### 2. Context & Validation

Read CLAUDE.md and validate:
- Target paths are canonical
- Target fonts are not sacred
- Backup location is correct

Delegate path validation to `path-guardian`:

```
Task(path-guardian): Validate paths for typography operation
  - Input paths: {input_paths}
  - Output paths: {output_paths}
  - Check sacred collections
  - Verify canonical paths
```

### 3. Backup Checkpoint (if editing/exporting)

**CHECKPOINT - Requires user approval:**

```
AskUserQuestion:
  question: "Create backup before modifying fonts?"
  header: "Backup Checkpoint"
  options:
    - label: "Yes, create backup"
      description: "Backup to .claude/backups/{date}-{font}-pre-{operation}/"
    - label: "Change location"
      description: "Specify different backup path"
    - label: "Skip backup"
      description: "Proceed without backup (not recommended)"
```

If approved, create backup:
```bash
BACKUP_DIR=".claude/backups/$(date +%Y-%m-%d)-{FontFamily}-pre-{operation}"
mkdir -p "$BACKUP_DIR"
cp -r "{source_path}"/* "$BACKUP_DIR/"
```

### 4. Delegate to Specialist

Based on workflow_type, delegate to appropriate agent:

**Glyph Editing:**
```
Task(glyph-editor): {operation_summary}
  CONTEXT:
  - Font family: {font_family}
  - Target glyphs: {glyphs}
  - Edit type: {contour_modification | stroke_adjustment | terminal_edit}
  - Weights: {weight_list}
  - Backup path: {backup_path}
  
  CONSTRAINTS:
  - Read CLAUDE.md for rules
  - Generate proof images before/after
  - Use nominalWidthX delta for CFF width encoding
  - Apply weight plateau for Semibold+
```

**TTF Export:**
```
Task(ttf-exporter): {operation_summary}
  CONTEXT:
  - Source fonts: {otf_paths}
  - Output path: {canonical_ttf_path}
  - Weights to export: {weight_list}
  
  CONSTRAINTS:
  - Each weight needs UNIQUE family name
  - Modify name table (nameID 1, 4, 6, 16, 17)
  - Use canonical path: /_Epson-TTF/ (or foundry-specific)
```

**Font Selection:**
```
Task(typography-advisor): {query}
  CONTEXT:
  - Use case: {use_case}
  - Style preferences: {preferences}
  - Constraints: {language_support | weight_range | optical_sizes}
  
  DATA SOURCES:
  - font-index.json
  - FONT-INDEX.md
```

### 5. Batch Checkpoint (if multi-weight)

If operation affects multiple weights:

**CHECKPOINT - Requires user approval:**

```
AskUserQuestion:
  question: "Apply to all {N} weights?"
  header: "Batch Checkpoint"
  options:
    - label: "Yes, apply to all"
      description: "Process: {weight_list}"
    - label: "Preview one first"
      description: "Run on {first_weight} only, then confirm"
    - label: "Cancel"
      description: "Abort batch operation"
```

### 6. Path Verification

After all writes, verify via path-guardian:

```
Task(path-guardian): Final path verification
  - Verify all output paths
  - Check for nested directories
  - Confirm no sacred collection modifications
```

### 7. Workshop Memory Persistence

**ALWAYS record to Workshop after task completion:**

```bash
# Record the operation
workshop note "Typography: {operation_summary} on {font_family}"

# If significant decision made
workshop decision "{decision}" -r "{reasoning}"

# If gotcha discovered
workshop gotcha "{issue_description}"
```

Record schema:
```yaml
operation:
  timestamp: {ISO-8601}
  type: glyph_edit | ttf_export | font_selection
  font_family: {name}
  weights_affected: [{list}]
  glyphs_modified: [{list}] | null
  paths_input: [{list}]
  paths_output: [{list}]
  backup_path: {path} | null
  outcome: success | partial | failure
  notes: {summary}
```

### 8. Completion

Return summary to user:

```markdown
## Typography Operation Complete

**Operation:** {operation_summary}
**Font Family:** {font_family}
**Weights:** {weight_count} processed
**Outcome:** {success | partial | failure}

### Files Modified
- {path_1}
- {path_2}
...

### Backup Location
{backup_path}

### Workshop Memory
Recorded: {workshop_entry_summary}

### Next Steps
{recommendations}
```

---

## Error Handling

### Sacred Collection Violation
```
ERROR: Cannot modify sacred collection
Collection: {collection_name}
Action: BLOCKED (no override available)

Sacred collections are read-only:
- [Adobe] Fonts
- [FontShop] 100 Best Fonts
- Google Fonts
- Nerd Fonts
- Icons
```

### Non-Canonical Path Warning
```
WARNING: Non-canonical output path
Path: {path}
Expected: {canonical_path}

Proceed anyway? (warn-proceed mode)
```

### Backup Required
```
WARNING: No backup exists for this font
Recommendation: Create backup before editing

Backup command:
  mkdir -p ".claude/backups/{date}-{font}-pre-edit"
  cp -r "{source}" ".claude/backups/{date}-{font}-pre-edit/"
```

---

## Examples

### Glyph Editing
```
/typography Reduce the curl on terminals in DomaineSansCustom (a, c, e, f, g, j, r, s, t, y)
/typography --tweak Make the period rounder in Calibre Regular
/typography --complex Create Light and Bold weights for GT Cinetype Mono via stroke offsetting
```

### TTF Export
```
/typography Export DomaineSansCustom to TTF for Epson LabelWorks
/typography --complex Export all Klim fonts to TTF with proper naming
```

### Font Selection
```
/typography Recommend a sans-serif to pair with Tiempos for editorial
/typography --tweak What's similar to Circular but more geometric?
/typography Compare Founders Grotesk vs Calibre for UI design
```

### Typography Explorer
```
/typography --explorer                       # Auto-detect format and context
/typography --explorer --nextjs              # Force Next.js React components
/typography --explorer --html                # Force standalone HTML
/typography --explorer --context store       # E-commerce product UI
/typography --explorer --context markdown    # Article/documentation UI
/typography --explorer --nextjs --context store  # Combined flags
```

---

## Pipeline Reference

See `.claude/docs/pipelines/typography-pipeline.md` for full documentation.
See `.claude/docs/reference/phase-configs/typography-phase-config.yaml` for phase state contract.
