#!/bin/bash
# Fast project type detection for auto-orchestration
# Optimized for speed - only checks file existence

set -e

OUTPUT_FILE=".claude/orchestration/temp/orchestration-context.md"

# Fast detection (file existence checks only)
detect_project_type() {
  # Perf: optional timing
  local _perf=0 _t0=0 _t1=0
  if [ -f "scripts/perf-log.sh" ]; then
    . scripts/perf-log.sh
    _perf=1
    _t0="$(now_ms)"
    perf_log detect_start
  fi
  # iOS/Swift
  if ls *.xcodeproj >/dev/null 2>&1 || ls *.xcworkspace >/dev/null 2>&1; then
    echo "ios"
    if [ "$_perf" = "1" ]; then _t1="$(now_ms)"; perf_log detect_end project_type=ios duration_ms=$(( _t1 - _t0 )); fi
    return
  fi

  # Frontend (React/Next.js)
  if [ -f "package.json" ]; then
    if grep -q "\"next\"" package.json 2>/dev/null; then
      echo "nextjs"
      if [ "$_perf" = "1" ]; then _t1="$(now_ms)"; perf_log detect_end project_type=nextjs duration_ms=$(( _t1 - _t0 )); fi
      return
    elif grep -q "\"react\"" package.json 2>/dev/null; then
      echo "react"
      if [ "$_perf" = "1" ]; then _t1="$(now_ms)"; perf_log detect_end project_type=react duration_ms=$(( _t1 - _t0 )); fi
      return
    fi
  fi

  # Python/Backend
  if [ -f "requirements.txt" ] || [ -f "pyproject.toml" ]; then
    echo "python"
    if [ "$_perf" = "1" ]; then _t1="$(now_ms)"; perf_log detect_end project_type=python duration_ms=$(( _t1 - _t0 )); fi
    return
  fi

  # Flutter
  if [ -f "pubspec.yaml" ]; then
    echo "flutter"
    if [ "$_perf" = "1" ]; then _t1="$(now_ms)"; perf_log detect_end project_type=flutter duration_ms=$(( _t1 - _t0 )); fi
    return
  fi

  # React Native
  if [ -f "package.json" ] && [ -d "ios" ] && [ -d "android" ]; then
    echo "react-native"
    if [ "$_perf" = "1" ]; then _t1="$(now_ms)"; perf_log detect_end project_type=react-native duration_ms=$(( _t1 - _t0 )); fi
    return
  fi

  # Unknown/Generic
  echo "unknown"
  if [ "$_perf" = "1" ]; then _t1="$(now_ms)"; perf_log detect_end project_type=unknown duration_ms=$(( _t1 - _t0 )); fi
}

# Get team for project type
get_agent_team() {
  case "$1" in
    ios)
      echo "swiftui-developer, swift-testing-specialist, ui-testing-expert, design-reviewer, accessibility-specialist"
      ;;
    nextjs|react)
      echo "nextjs-14-specialist, react-18-specialist, state-management-specialist, frontend-testing-specialist, design-system-architect, ui-engineer, design-reviewer, accessibility-specialist"
      ;;
    python)
      echo "backend-engineer, test-engineer, verification-agent"
      ;;
    flutter|react-native)
      echo "react-native-specialist, ui-testing-expert, design-reviewer, accessibility-specialist"
      ;;
    *)
      echo "system-architect, verification-agent"
      ;;
  esac
}

# Get verification workflow
get_verification() {
  case "$1" in
    ios)
      echo "quality-validator with iOS simulator screenshots + build verification"
      ;;
    nextjs|react)
      echo "quality-validator with browser screenshots + build verification"
      ;;
    python)
      echo "quality-validator with test output + functionality verification"
      ;;
    flutter|react-native)
      echo "quality-validator with emulator/simulator screenshots + build verification"
      ;;
    *)
      echo "quality-validator with evidence-based verification"
      ;;
  esac
}

# Detect project type
PROJECT_TYPE=$(detect_project_type)
AGENT_TEAM=$(get_agent_team "$PROJECT_TYPE")
VERIFICATION=$(get_verification "$PROJECT_TYPE")

# Create orchestration context file
cat > "$OUTPUT_FILE" << EOF
# Auto-Orchestration Mode (ACTIVE)

**Detected**: $PROJECT_TYPE project
**Agent Team**: $AGENT_TEAM
**Verification**: $VERIFICATION

---

## CRITICAL: You Are in Auto-Orchestration Mode

For EVERY user request, follow this workflow:

### 1. Code Changes → Use Specialized Agents
**Examples**: "Fix calculator view", "Add search bar", "Update design system"

**Process**:
1. Analyze the request and identify required agents
2. Dispatch specialized agents from: $AGENT_TEAM
3. Use quality-validator for final verification
4. Collect evidence when needed
5. Only present results when fully verified

### 2. Ideation → Suggest Commands
**Examples**: "How should I approach this?", "I need ideas", "Make this clearer"

**Response**: "For ideation, I recommend: /enhance, /concept, /brainstorm, or /clarify"

### 3. Questions → Answer Directly
**Examples**: "What does X do?", "How does Y work?", "Explain Z"

**Response**: Answer the question without orchestration

---

## Orchestration Rules

1. **Fast Classification** - Decide code/ideation/question in 1 second
2. **Use Specialized Agents** - Delegate to appropriate agents for multi-step work
3. **Evidence Required** - Verify work with tests, builds, or screenshots when needed
4. **Quality Validation** - Use quality-validator for final verification
5. **User Intent** - Focus on solving the user's actual problem

---

## $PROJECT_TYPE Specifics

**Available Agents**: $AGENT_TEAM
**Verification**: $VERIFICATION

When user requests $PROJECT_TYPE changes:
1. Analyze requirements and select appropriate agents
2. Available specialized agents: $AGENT_TEAM
3. Use quality-validator for final verification
4. Provide evidence when making significant changes

---

## Available Commands

- **/enhance** - Transform requests into well-structured implementations
- **/ultra-think** - Deep analysis and problem solving
- **/orca** - Multi-agent orchestration with quality gates

---

**This orchestration mode is ALWAYS ACTIVE.**
EOF

# Output context for session
cat "$OUTPUT_FILE"
