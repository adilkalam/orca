#!/bin/bash
# Gate Enforcement Hook
# Enforces Blueprint Gate, Pattern Violations, and Context Proof

set -e

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Paths
GATE_RUNNER="$HOME/.claude/mcp/shared-context-server/dist/gates/runner.js"
PHASE_STATE=".claude/orchestration/phase_state.json"
PHASE_DIR="$(dirname "$PHASE_STATE")"
PHASE_TEMP_DIR="$PHASE_DIR/temp"
DESIGN_EVIDENCE_VALIDATOR="$HOME/.claude/scripts/validate-design-review-evidence.sh"
BASH_LOG="$PHASE_DIR/temp/bash-commands.log"

# Check what triggered this hook
TRIGGER="${HOOK_TRIGGER:-unknown}"

# Check if gate runner exists (only needed for pattern violation checks)
GATE_RUNNER_EXISTS=false
if [ -f "$GATE_RUNNER" ]; then
    GATE_RUNNER_EXISTS=true
fi

# ==================================================
# Bash Tool Command Logging (for Verification Claims)
# ==================================================

# When agents use the Bash tool, log the exact commands executed so that
# verification_status claims in phase_state can be checked against actual
# commands run during the session.

if [[ "$TOOL_NAME" == "Bash" ]]; then
    CMD=$(echo "$TOOL_PARAMS" | jq -r '.command // ""' 2>/dev/null || echo "")
    if [ -n "$CMD" ]; then
        mkdir -p "$PHASE_TEMP_DIR" 2>/dev/null || true
        printf "%s\n" "$CMD" >> "$BASH_LOG"
    fi

    # ==================================================
    # ARCHIVE DEPLOYMENT GUARD (rule-004)
    # Block any command that would copy archive dirs to ~/.claude
    # ==================================================
    if [[ "$CMD" =~ (rsync|cp|mv).*(archive|deprecated).*~/.claude ]] || \
       [[ "$CMD" =~ (rsync|cp|mv).*~/.claude.*(archive|deprecated) ]] || \
       [[ "$CMD" =~ (rsync|cp|mv).*(_archive|\.archived|deprecated).*/\.claude ]] || \
       [[ "$CMD" =~ rsync.*commands/.*~/.claude/commands ]] && [[ ! "$CMD" =~ --exclude.*archive ]]; then
        echo -e "${RED}BLOCKED: ARCHIVE DEPLOYMENT ATTEMPT${NC}"
        echo ""
        echo "Command would deploy archived content to ~/.claude"
        echo "This pollutes the global config with ghost commands."
        echo ""
        echo "Blocked command: $CMD"
        echo ""
        echo -e "${YELLOW}Rule-004: Never deploy archived content${NC}"
        echo "Archived directories (_archive/, .archived-v1/, deprecated/) must NEVER"
        echo "be copied to ~/.claude. Use --exclude patterns or copy files individually."
        exit 1
    fi
fi

# ==================================================
# Blueprint Gate: Phase-Based Tool Enforcement
# ==================================================

if [[ "$TOOL_NAME" =~ ^(Write|Edit|MultiEdit|NotebookEdit)$ ]]; then
    # Check current phase
    CURRENT_PHASE=1
    if [ -f "$PHASE_STATE" ]; then
        CURRENT_PHASE=$(jq -r '.current_phase // 1' "$PHASE_STATE" 2>/dev/null || echo "1")
    fi

    # Phase 1: Code tools forbidden
    if [ "$CURRENT_PHASE" = "1" ]; then
        FILE_PATH=$(echo "$TOOL_PARAMS" | jq -r '.file_path // .notebook_path // ""' 2>/dev/null || echo "")

        # Check if it's a blueprint file (allowed)
        if [[ "$FILE_PATH" =~ ^00-blueprint/ ]]; then
            # Blueprint file - allowed
            exit 0
        fi

        # Check if it's code/implementation (forbidden)
        if [[ "$FILE_PATH" =~ ^(src/|components/|lib/|app/|pages/) ]]; then
            echo -e "${RED}🚫 BLUEPRINT GATE BLOCKED${NC}"
            echo ""
            echo -e "${YELLOW}Phase 1 = Blueprint Only${NC}"
            echo "Code tools (Write, Edit) are forbidden until blueprint is approved."
            echo ""
            echo "File attempted: $FILE_PATH"
            echo ""
            echo -e "${BLUE}What to do:${NC}"
            echo "1. Create blueprint in 00-blueprint/design-blueprint.md"
            echo "2. Get user approval"
            echo "3. User will advance to Phase 2"
            echo ""
            echo -e "${RED}#POISON_PATH: Trying to code before blueprint approved${NC}"
            exit 1
        fi
    fi
fi

# ==================================================
# Pattern Violation Detection
# ==================================================

# Only run pattern checks if gate runner exists
if [[ "$GATE_RUNNER_EXISTS" = "true" ]] && [[ "$TOOL_NAME" =~ ^(Write|Edit)$ ]] && [[ "${CHECK_PATTERNS:-true}" = "true" ]]; then
    FILE_PATH=$(echo "$TOOL_PARAMS" | jq -r '.file_path // ""' 2>/dev/null || echo "")

    # Only check CSS/style files
    if [[ "$FILE_PATH" =~ \.(css|scss|sass|tsx|jsx)$ ]]; then
        # Get file content
        CONTENT=$(echo "$TOOL_PARAMS" | jq -r '.content // .new_string // ""' 2>/dev/null || echo "")

        if [ -n "$CONTENT" ]; then
            # Run pattern violation detector
            VIOLATIONS=$(node "$GATE_RUNNER" pattern-check "$FILE_PATH" 2>&1 || echo "")

            if echo "$VIOLATIONS" | grep -q "BLOCKED"; then
                echo -e "${RED}🚫 PATTERN VIOLATION DETECTED${NC}"
                echo ""
                echo "$VIOLATIONS"
                echo ""
                echo -e "${RED}#POISON_PATH: Forbidden design patterns detected${NC}"
                exit 1
            elif echo "$VIOLATIONS" | grep -q "WARNING"; then
                echo -e "${YELLOW}⚠️  Pattern Warnings:${NC}"
                echo "$VIOLATIONS"
                # Don't block, just warn
            fi
        fi
    fi
fi

# ==================================================
# Design Review Evidence Enforcement
# ==================================================

# Enforce that design review evidence files follow a structured template
# with explicit pixel measurements. This runs whenever an agent attempts
# to write a design-review evidence file.

if [[ "$TOOL_NAME" =~ ^(Write|Edit)$ ]]; then
    FILE_PATH=$(echo "$TOOL_PARAMS" | jq -r '.file_path // ""' 2>/dev/null || echo "")

    if [[ "$FILE_PATH" == .claude/orchestration/evidence/design-review-* ]]; then
        # Only enforce if validator script is installed
        if [ -x "$DESIGN_EVIDENCE_VALIDATOR" ]; then
            mkdir -p "$PHASE_TEMP_DIR" 2>/dev/null || true
            CANDIDATE_FILE="$PHASE_TEMP_DIR/$(basename "$FILE_PATH").candidate.md"

            CONTENT=$(echo "$TOOL_PARAMS" | jq -r '.content // .new_string // ""' 2>/dev/null || echo "")

            if [ -n "$CONTENT" ]; then
                printf "%s" "$CONTENT" > "$CANDIDATE_FILE"

                if ! "$DESIGN_EVIDENCE_VALIDATOR" "$CANDIDATE_FILE" >/dev/null 2>&1; then
                    echo -e "${RED}🚫 DESIGN REVIEW EVIDENCE BLOCKED${NC}"
                    echo ""
                    echo "Design review evidence must include:"
                    echo "- COVERAGE DECLARATION section"
                    echo "- MEASUREMENTS section with explicit pixel values (e.g. 24px)"
                    echo "- PIXEL COMPARISON section"
                    echo "- VERIFICATION RESULT section"
                    echo ""
                    echo "File attempted: $FILE_PATH"
                    echo ""
                    echo -e "${RED}#POISON_PATH: Design review claimed without structured measurements${NC}"
                    exit 1
                fi
            fi
        fi
    fi
fi

# ==================================================
# Context Proof Gate
# ==================================================

# This is checked by specialist agents before work starts
# The hook just ensures phase_state has proof status

if [ -f "$PHASE_STATE" ]; then
    CONTEXT_PROOF=$(jq -r '.context_proof_passed // false' "$PHASE_STATE" 2>/dev/null || echo "false")

    if [ "$CONTEXT_PROOF" = "false" ] && [ "$CURRENT_PHASE" != "0" ]; then
        echo -e "${YELLOW}⚠️  Context proof not verified${NC}"
        echo "Agent should prove understanding of design system before starting work."
        # Don't block - just reminder
    fi
fi

# ==================================================
# Nextjs Design Gate Enforcement (Anti-Fabrication)
# ==================================================

# When phase_state.json is updated to mark the Nextjs design gate as PASS,
# require that at least one design-review evidence file is referenced and
# structurally valid. This makes PASS mechanically dependent on real
# measurements, not just language.

if [[ "$TOOL_NAME" =~ ^(Write|Edit)$ ]]; then
    FILE_PATH=$(echo "$TOOL_PARAMS" | jq -r '.file_path // ""' 2>/dev/null || echo "")

    if [ "$FILE_PATH" = "$PHASE_STATE" ]; then
        CONTENT=$(echo "$TOOL_PARAMS" | jq -r '.content // .new_string // ""' 2>/dev/null || echo "")

        if [ -n "$CONTENT" ]; then
            mkdir -p "$PHASE_TEMP_DIR" 2>/dev/null || true
            CANDIDATE_JSON="$PHASE_TEMP_DIR/phase_state.candidate.json"
            printf "%s" "$CONTENT" > "$CANDIDATE_JSON"

            # Only enforce when the design_qa gate is explicitly marked PASS.
            DESIGN_DECISION=$(jq -r '.gates.design_qa.gate_decision // empty' "$CANDIDATE_JSON" 2>/dev/null || echo "")

            if [ "$DESIGN_DECISION" = "PASS" ] && [ -x "$DESIGN_EVIDENCE_VALIDATOR" ]; then
                # Expect an evidence_paths array under gates.design_qa
                EVIDENCE_PATHS=$(jq -r '.gates.design_qa.evidence_paths[]? // empty' "$CANDIDATE_JSON" 2>/dev/null || echo "")

                if [ -z "$EVIDENCE_PATHS" ]; then
                    echo -e "${RED}🚫 DESIGN GATE BLOCKED${NC}"
                    echo ""
                    echo "design_qa.gate_decision = PASS but no gates.design_qa.evidence_paths were provided."
                    echo "Design reviewers must:"
                    echo "- Save a structured design-review report under .claude/orchestration/evidence/"
                    echo "- Record its path in gates.design_qa.evidence_paths"
                    echo ""
                    echo -e "${RED}#POISON_PATH: Design gate PASS without explicit evidence paths${NC}"
                    exit 1
                fi

                # Validate each referenced evidence file
                # Use a while-read loop to preserve paths with spaces if needed.
                echo "$EVIDENCE_PATHS" | while IFS= read -r evidence_path; do
                    [ -z "$evidence_path" ] && continue

                    if [ ! -f "$evidence_path" ]; then
                        echo -e "${RED}🚫 DESIGN GATE BLOCKED${NC}"
                        echo ""
                        echo "Referenced design review evidence file does not exist:"
                        echo "  $evidence_path"
                        echo ""
                        echo -e "${RED}#POISON_PATH: Design gate PASS with missing evidence file${NC}"
                        exit 1
                    fi

                    if ! "$DESIGN_EVIDENCE_VALIDATOR" "$evidence_path" >/dev/null 2>&1; then
                        echo -e "${RED}🚫 DESIGN GATE BLOCKED${NC}"
                        echo ""
                        echo "Referenced design review evidence file failed structural validation:"
                        echo "  $evidence_path"
                        echo ""
                        echo "Evidence must follow the standard template with:"
                        echo "- COVERAGE DECLARATION"
                        echo "- MEASUREMENTS (with px values)"
                        echo "- PIXEL COMPARISON"
                        echo "- VERIFICATION RESULT"
                        echo ""
                        echo -e "${RED}#POISON_PATH: Design gate PASS with invalid evidence${NC}"
                        exit 1
                    fi
                done
            fi

            # ==================================================
            # Nextjs Verification Enforcement (Anti-Fabrication)
            # ==================================================

            # When phase_state.json marks verification_status = "pass",
            # ensure that each claimed command in verification.commands_run
            # has actually been executed via the Bash tool in this session.

            VERIFICATION_STATUS=$(jq -r '.verification.verification_status // empty' "$CANDIDATE_JSON" 2>/dev/null || echo "")

            if [ "$VERIFICATION_STATUS" = "pass" ] && [ -f "$BASH_LOG" ]; then
                # Extract commands_run as one command per line
                CLAIMED_CMDS=$(jq -r '.verification.commands_run[]? // empty' "$CANDIDATE_JSON" 2>/dev/null || echo "")

                if [ -n "$CLAIMED_CMDS" ]; then
                    echo "$CLAIMED_CMDS" | while IFS= read -r claimed; do
                        [ -z "$claimed" ] && continue
                        # Require an exact line match in the Bash command log
                        if ! grep -Fqx "$claimed" "$BASH_LOG"; then
                            echo -e "${RED}🚫 VERIFICATION GATE BLOCKED${NC}"
                            echo ""
                            echo "verification_status = \"pass\" but the claimed command was not found in Bash command log:"
                            echo "  $claimed"
                            echo ""
                            echo "Agents must:"
                            echo "- Run verification commands (lint/test/build) via the Bash tool"
                            echo "- Record the exact commands in verification.commands_run"
                            echo ""
                            echo -e "${RED}#POISON_PATH: Verification PASS with unexecuted commands_run entry${NC}"
                            exit 1
                        fi
                    done
                fi
            fi
        fi
    fi
fi

# All checks passed
exit 0
