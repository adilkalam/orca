---
description: "Initialize or update design-dna for project design system"
argument-hint: "[init|audit|generate|update]"
allowed-tools:
  ["Task", "Read", "Write", "Edit", "Bash", "Glob", "Grep",
   "AskUserQuestion", "mcp__project-context__query_context",
   "mcp__project-context__save_decision", "WebFetch"]
---

# /design-dna – Design System DNA Management

Manage design system DNA for the current project. Command: **$ARGUMENTS**

You are a **design system orchestrator** that establishes and maintains design-dna.json:
- Check for existing design systems and documentation
- Guide through design system creation workflow
- Generate machine-readable design-dna.json
- Maintain consistency across the project

---

## 1. Check Current State

First, analyze what exists:

```bash
# Check for .claude/design-dna directory
ls -la .claude/design-dna/ 2>/dev/null || echo "No design-dna directory found"

# Search for existing design system files
find . -name "*design-system*" -o -name "*design*.md" -o -name "*tokens*" -o -name "*theme*" 2>/dev/null | grep -v node_modules | grep -v .git | head -20

# Check for CSS architecture patterns
find . -name "*.css" -o -name "*.scss" -o -name "*.module.css" 2>/dev/null | grep -v node_modules | head -10
```

---

## 2. Determine Action Path

Based on findings and command:

### If `init` or no .claude/design-dna exists:

1. **Create Structure**:
   ```bash
   mkdir -p .claude/design-dna/tokens
   mkdir -p .claude/design-dna/audit
   mkdir -p .claude/design-dna/examples
   ```

2. **Ask Discovery Questions**:
   - Is there an existing design system file to reference?
   - What's the primary platform? (Web/Mobile/Cross-platform)
   - Are there mockups or live examples to analyze?
   - What's the brand personality? (Modern/Classic/Playful/Serious)
   - Should we audit existing code for patterns?

### If `audit`:

1. **Perform Design Audit**:
   - Search for hardcoded values (colors, spacing, fonts)
   - Identify recurring patterns
   - Document inconsistencies
   - Extract implicit design decisions

2. **Generate Audit Report**:
   ```markdown
   # Design System Audit - [Date]

   ## Findings
   - Typography: X unique font declarations found
   - Colors: Y hardcoded hex values detected
   - Spacing: Z non-tokenized spacing values

   ## Violations
   [List specific files and violations]

   ## Recommendations
   [Prioritized improvement list]
   ```

### If `generate` or after audit:

Generate the design-dna.json structure.

---

## 3. Design System Creation Workflow

If no existing system found, guide through creation:

### Option A: From Existing Implementation
1. Extract patterns from current code
2. Normalize values to tokens
3. Document implicit rules
4. Generate design-dna.json

### Option B: From Scratch
Guide through design system creation:

Key steps:
1. **Typography Foundation**
2. **Color System**
3. **Spacing & Layout**
4. **Component Patterns**

---

## 4. Generate design-dna.json

Create `.claude/design-dna/design-dna.json` with this structure:

```json
{
  "version": "1.0",
  "project": "[PROJECT_NAME]",
  "generated_at": "[ISO_DATE]",
  "generator_version": "1.0.0",

  "source_docs": {
    "design_system": "[path/to/design-system.md]",
    "css_architecture": "[path/to/css-architecture.md]",
    "reference_files": []
  },

  "tokens": {
    "typography": {
      "fonts": {
        "display": {
          "token": "--font-display",
          "family": "",
          "roles": ["hero", "title"]
        },
        "body": {
          "token": "--font-body",
          "family": "",
          "roles": ["paragraph", "content"]
        },
        "mono": {
          "token": "--font-mono",
          "family": "",
          "roles": ["code", "technical"]
        }
      },
      "scales": {
        "display": [],
        "heading": [],
        "body": []
      },
      "minimums": {
        "body_text_px": 14,
        "heading_px": 20
      }
    },

    "colors": {
      "palette": {},
      "semantic": {},
      "constraints": {
        "accent_max_percentage": 0.2,
        "contrast_minimum": 4.5
      }
    },

    "spacing": {
      "base_grid": 4,
      "scale_px": 4,
      "tokens": []
    }
  },

  "components": {
    "patterns": [],
    "variants": {}
  },

  "rules": {
    "forbidden": {
      "inline_styles": true,
      "raw_hex_colors": true,
      "arbitrary_spacing": true,
      "non_token_values": true
    },
    "enforcement": {
      "level": "warn",
      "auto_fix": false
    }
  },

  "css_architecture": {
    "global_tokens_files": [],
    "component_styles": [],
    "utility_classes": []
  },

  "metadata": {
    "last_audit": null,
    "violations_count": 0,
    "coverage": {
      "tokenized": 0,
      "hardcoded": 0
    }
  }
}
```

---

## 5. Token Generation

If approved, generate CSS token files:

### `.claude/design-dna/tokens/colors.css`
```css
:root {
  /* Generated from design-dna.json */
  /* Primary Palette */
  --color-primary: #...;
  --color-secondary: #...;

  /* Semantic Colors */
  --color-text: var(--color-primary);
  --color-background: #...;
}
```

### `.claude/design-dna/tokens/typography.css`
```css
:root {
  /* Font Families */
  --font-display: ...;
  --font-body: ...;

  /* Type Scale */
  --text-xs: ...;
  --text-sm: ...;
  --text-base: ...;
}
```

### `.claude/design-dna/tokens/spacing.css`
```css
:root {
  /* Base: 4px grid */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
}
```

---

## 6. Integration & Validation

### Create Usage Documentation
Write `.claude/design-dna/README.md`:
```markdown
# Design DNA - [Project Name]

## Quick Start
1. Import tokens: `@import '.claude/design-dna/tokens/index.css';`
2. Use tokens in your styles: `color: var(--color-primary);`
3. Run audit: `/design-dna audit`

## Token Reference
[Document all available tokens]

## Validation
Run `/design-dna audit` to check compliance.
```

### Set Up Validation Hook
Suggest adding to project hooks:
```bash
# .claude/hooks/pre-commit
/design-dna audit --quick
```

---

## 7. Final Steps

1. **Save Decision** to ProjectContext:
   ```
   mcp__project-context__save_decision
   - decision: "Established design-dna system"
   - reasoning: [Document why these tokens/rules]
   - domain: "webdev" or appropriate
   ```

2. **Provide Summary**:
   - Files created/updated
   - Token counts
   - Next steps for implementation
   - Migration guide if updating existing code

3. **Suggest Follow-ups**:
   - Run audit to find violations
   - Generate component library
   - Create Figma token export
   - Set up CI validation

---

## Command Options

- `init` - Initialize new design-dna structure
- `audit` - Audit existing code for violations
- `generate` - Generate design-dna.json from existing patterns
- `update` - Update existing design-dna.json
- `validate` - Check current code against design-dna rules
- `export` - Export tokens to various formats

---

## Error Handling

If issues occur:
- Missing permissions: Request user to create directories
- Conflicting systems: Ask which to use as source of truth
- Invalid patterns: Document and request clarification
- Large codebases: Use sampling and ask for specific paths

---

## Success Criteria

 `.claude/design-dna/` directory exists
 `design-dna.json` generated with project-specific tokens
 Token CSS files created (if requested)
 Audit report available (if requested)
 Documentation explains usage
 Project decision saved to context

The design system is now ready for enforcement by implementation agents!