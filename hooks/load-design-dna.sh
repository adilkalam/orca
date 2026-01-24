#!/usr/bin/env bash
# Design DNA Auto-Loader for SessionStart Hook
# Loads project-specific design taste and universal design principles

set -uo pipefail

DNA_DIR=".claude/design-dna"
OUTPUT_FILE=".claude-design-dna-context.md"

# Detect project-specific design DNA
detect_design_dna() {
  # Check for project-specific DNA based on directory markers
  # Customize this function for your projects

  # Example: Check for a specific project
  # if grep -q "myproject" <<< "$(pwd)" 2>/dev/null; then
  #   if [ -f "$DNA_DIR/myproject.json" ]; then
  #     echo "myproject"
  #     return
  #   fi
  # fi

  # Check for any project-specific DNA file matching current directory name
  local current_dir=$(basename "$(pwd)")
  if [ -f "$DNA_DIR/${current_dir}.json" ]; then
    echo "$current_dir"
    return
  fi

  # No project-specific DNA found
  echo "none"
}

# Extract key principles from Design DNA JSON
extract_dna_summary() {
  local dna_file="$1"

  if [ ! -f "$dna_file" ]; then
    return
  fi

  # Extract philosophy
  local philosophy=$(cat "$dna_file" | jq -r '.philosophy.aesthetic // "Not specified"' 2>/dev/null)
  local tagline=$(cat "$dna_file" | jq -r '.philosophy.tagline // ""' 2>/dev/null)

  # Extract key rules
  local base_grid=$(cat "$dna_file" | jq -r '.spacing.base_grid // "Not specified"' 2>/dev/null)
  local quality_standard=$(cat "$dna_file" | jq -r '.quality_standard // .philosophy.quality_standard // "Not specified"' 2>/dev/null)

  echo "**Aesthetic:** $philosophy"
  if [ -n "$tagline" ] && [ "$tagline" != "null" ]; then
    echo "**Tagline:** $tagline"
  fi
  echo "**Spacing Grid:** ${base_grid}px base unit"
  echo "**Quality Standard:** $quality_standard"
}

# Extract typography rules summary
extract_typography_summary() {
  local dna_file="$1"

  if [ ! -f "$dna_file" ]; then
    return
  fi

  echo ""
  echo "### Typography Rules"
  echo ""

  # Extract font decision tree (if exists)
  cat "$dna_file" | jq -r '.typography.decision_tree // {} | to_entries[] | "- **\(.key)**: \(.value.font) (\(.value.usage // .value.min_size // ""))"' 2>/dev/null | head -6 || true
}

# Extract color rules summary
extract_color_summary() {
  local dna_file="$1"

  if [ ! -f "$dna_file" ]; then
    return
  fi

  echo ""
  echo "### Color Rules"
  echo ""

  # Background
  local bg=$(cat "$dna_file" | jq -r '.colors.foundation.background // "Not specified"' 2>/dev/null)
  echo "- **Background:** $bg"

  # Text hierarchy
  local text_rule=$(cat "$dna_file" | jq -r '.colors.text_hierarchy.rule // ""' 2>/dev/null)
  if [ -n "$text_rule" ] && [ "$text_rule" != "null" ]; then
    echo "- **Text Hierarchy:** $text_rule"
  fi

  # Accent usage
  local accent_limit=$(cat "$dna_file" | jq -r '.colors.gold_accent.usage_limit // .colors.accent_usage_limit // ""' 2>/dev/null)
  if [ -n "$accent_limit" ] && [ "$accent_limit" != "null" ]; then
    echo "- **Accent Usage:** $accent_limit"
  fi
}

# Extract forbidden patterns
extract_forbidden() {
  local dna_file="$1"

  if [ ! -f "$dna_file" ]; then
    return
  fi

  echo ""
  echo "### Forbidden Patterns"
  echo ""

  cat "$dna_file" | jq -r '.forbidden[]? // empty' 2>/dev/null | while read -r pattern; do
    echo "- ❌ $pattern"
  done
}

# Extract critical rules
extract_critical_rules() {
  local dna_file="$1"

  if [ ! -f "$dna_file" ]; then
    return
  fi

  echo ""
  echo "### Critical Rules (INSTANT-FAIL if violated)"
  echo ""

  cat "$dna_file" | jq -r '.critical_rules // {} | to_entries[] | "- **\(.key)**: \(.value.description // .value.severity)"' 2>/dev/null || true
}

# Load and generate Design DNA context
load_design_dna() {
  local project_dna="$1"
  local universal_dna="$DNA_DIR/universal-taste.json"
  local project_dna_file=""

  # Check if Design DNA directory exists
  if [ ! -d "$DNA_DIR" ]; then
    echo "# Design DNA System: Not initialized"
    echo ""
    echo "Design DNA schemas will be created when needed."
    return
  fi

  # Start building context
  cat > "$OUTPUT_FILE" << 'HEADER'
# Design DNA System - Loaded Taste Profiles

**System:** Programmatic design taste enforcement via machine-readable schemas
**Status:** Active
**Purpose:** Ensure first-iteration designs match user's aesthetic and quality standards

---

## What is Design DNA?

Design DNA encodes **taste as enforceable constraints**:
- 🎨 **Typography rules**: Font families, sizes, weights, usage contexts
- 📐 **Spacing discipline**: Grid systems, token usage, hierarchy
- 🎨 **Color hierarchy**: Palettes, opacity scales, accent limits
- 🧩 **Component specs**: Structure, states, interaction patterns
- ✨ **Animation restraint**: Duration, easing, movement limits
- ⛔ **Forbidden patterns**: What to never do

**Philosophy:** Move from "preference" to "constraint" - catch taste violations programmatically before user sees them.

---

HEADER

  # Add project-specific DNA
  if [ "$project_dna" != "none" ]; then
    project_dna_file="$DNA_DIR/${project_dna}.json"

    if [ -f "$project_dna_file" ]; then
      cat >> "$OUTPUT_FILE" << EOF
## Project-Specific Design DNA: $project_dna

**Schema:** ${project_dna}.json
**Loaded:** ✅

$(extract_dna_summary "$project_dna_file")

$(extract_typography_summary "$project_dna_file")

$(extract_color_summary "$project_dna_file")

$(extract_critical_rules "$project_dna_file")

$(extract_forbidden "$project_dna_file")

---

EOF
    fi
  fi

  # Add universal taste principles
  if [ -f "$universal_dna" ]; then
    cat >> "$OUTPUT_FILE" << EOF
## Universal Design Principles (All Projects)

**Schema:** universal-taste.json
**Loaded:** ✅

### Core Philosophy

EOF

    # Extract core philosophy
    cat "$universal_dna" | jq -r '.core_philosophy | to_entries[] | "- **\(.key)**: \(.value)"' 2>/dev/null >> "$OUTPUT_FILE" || true

    cat >> "$OUTPUT_FILE" << 'EOF'

### Universal Principles

- **Mathematical Precision**: All spacing calculated, not eyeballed
- **Optical Alignment**: Visual center ≠ geometric center
- **Visual Hierarchy**: "Eyes test" - attention snaps to most important element
- **Typography Discipline**: Minimum readable sizes enforced
- **Color Hierarchy**: Opacity indicates importance
- **Spacing Discipline**: Consistent token usage, intentional hierarchy
- **Component Consistency**: Reusable patterns with all states defined
- **Animation Restraint**: Motion serves clarity, not spectacle
- **Accessibility Baseline**: WCAG AA minimum for all designs

---

EOF
  fi

  # Add usage instructions
  cat >> "$OUTPUT_FILE" << 'FOOTER'

## How Design DNA is Used

### Phase 1: Foundation (Active Now)
- ✅ **Design DNA schemas loaded** on session start
- ✅ **Design agents aware** of taste constraints (visual-designer, ui-engineer, swiftui-developer)
- ✅ **design-dna-linter** available for programmatic rule checking

### Phase 2: Hierarchical Enforcement (Next)
- 🔄 **style-translator** converts requests → Design DNA tokens
- 🔄 **design-compiler** generates code using tokens + DNA rules
- 🔄 **Pre-execution validation** prevents bad implementations

### Phase 3: Learning Loop (Future)
- 🔄 **Taste Playbook** learns patterns from feedback
- 🔄 **ACE curation** updates DNA when taste drifts
- 🔄 **Continuous improvement** from session data

### Phase 4: Visual Verification (Future)
- 🔄 **visual-reviewer-v2** combines DNA linter + screenshot verification
- 🔄 **Automated quality gates** before user review

---

## Available Agents

- **design-dna-linter**: Lint code against DNA rules (programmatic violations)
- **visual-designer**: Create designs following DNA constraints
- **ui-engineer**: Implement UIs using DNA tokens
- **swiftui-developer**: Build iOS UIs adhering to DNA rules
- **design-reviewer**: 7-phase visual QA (perceptual violations)

---

## Quality Standard

**Target:** 80-90% first-iteration acceptance rate
**Current:** Design DNA system ensures taste violations caught before user review
**Method:** Hybrid approach - programmatic rules + visual verification + learning playbooks

**Remember:** Design DNA doesn't replace human taste - it enforces guardrails so AI-generated designs stay within your aesthetic boundaries.

---

**Full Documentation:**
- `.claude/design-dna/*.json` - Design DNA schemas
- `agents/design-specialists/verification/design-dna-linter.md` - Linter documentation

FOOTER

  # Output context
  cat "$OUTPUT_FILE"
}

# Main execution
PROJECT_DNA=$(detect_design_dna)
load_design_dna "$PROJECT_DNA"

exit 0
