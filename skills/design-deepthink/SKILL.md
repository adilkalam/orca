---
name: design-deepthink
description: Distilled design wisdom for /deepthink --design exploration
license: internal
---

# Design-Deepthink Skill

Loaded by `/deepthink --design` for structured design exploration.

## 1. AI Slop Anti-Patterns (7 Patterns)

Detect and flag these in design analysis:

| Pattern | Detection Criteria |
|---------|-------------------|
| Generic dashboards | Centered hero + 2-3 gradient cards + charts with no identity |
| Copy-paste template feel | Obvious clone of library defaults without customization |
| Color soup | 3+ accents, uncoordinated hues, no semantic meaning |
| Flattened hierarchy | Same weight/size throughout, sections only separated by whitespace |
| Over-animated UI | Every hover zooms/bounces, 300ms+ transitions |
| Generic AI aesthetics | Overused fonts (Inter, Roboto), cliched purple gradients |
| Same design across projects | Output could belong to any project (lacks identity) |

## 2. Design QA Criteria

### Visual Hierarchy Scoring
- **Pass**: Clear heading/body/meta distinctions, 3+ type weights in use
- **Fail**: Flat hierarchy, no clear entry point, competing focal points

### Spacing/Alignment Checklist
- 4px or 8px base grid adherence
- Consistent vertical rhythm between sections
- Optical vs mathematical alignment considered
- No arbitrary pixel values outside spacing scale

### Color/Contrast Requirements
- Token compliance: No raw hex when tokens exist
- WCAG AA minimum (4.5:1 body, 3:1 large text)
- Semantic usage: Accent means something, not decoration

### Responsive Breakpoints
- 375px (mobile), 768px (tablet), 1440px (desktop), 1920px (wide)
- Touch targets: 44px minimum
- Layout reflow without horizontal scroll

## 3. Design-DNA Priority Rules

When multiple design sources exist:

| Priority | Source | Notes |
|----------|--------|-------|
| 1 (highest) | JSON | `.claude/design-dna/*.json`, `design-dna.json` |
| 2 | Markdown | `design-system.md`, `.claude/design-dna/README.md` |
| 3 | CSS comments | Files with `@design-token:` or `@design-rule:` |

**Enforcement**:
- Where tokens exist, ad-hoc values are FORBIDDEN
- Token naming: `--color-<role>`, `--space-<scale>`, `--font-<role>`
- JSON rules are machine-parseable law; Markdown is advisory

## 4. Context Instructions

### Project Design Files (Auto-Read in DESIGN Mode)
1. `design-dna.json` (project root)
2. `.claude/design-dna/` directory (all files)
3. `design-system.md` (project root)
4. `css/design-system-tokens.css` (if exists)

### Interpreting design-dna.json
- `colors`: Semantic roles (primary, secondary, accent, surface)
- `typography`: Scale and roles (display, heading, body, caption)
- `spacing`: Base grid and named values (section, component, gap)
- `patterns`: Named layouts (hero, card-grid, dashboard-shell)

### When No Design-DNA Exists
1. Note absence as a constraint
2. Use `frontend-aesthetics` skill principles
3. Recommend design-dna creation as a next step
4. Document choices made for future codification

---

_Related: `design-qa-skill`, `design-dna-skill`, `frontend-aesthetics`_
