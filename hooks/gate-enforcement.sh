#!/usr/bin/env bash
# Gate Enforcement Hook
# Enforces Blueprint Gate, Pattern Violations, and Context Proof
# NOTE: This hook intentionally exits 1 on gate failures to block operations

set -o pipefail

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Paths
# Gate runner removed -- pattern violation checks moved to os-dev-standards-enforcer agent.
# The original runner.js was never built (shared-context-server renamed to project-context-server
# and no gates/ directory exists). Pattern violation detection for CSS/style files is now handled
# at the agent level rather than via a hook-based node script.
GATE_RUNNER=""
PHASE_STATE=".orca/orchestration/phase_state.json"
PHASE_DIR="$(dirname "$PHASE_STATE")"
PHASE_TEMP_DIR="$PHASE_DIR/temp"
DESIGN_EVIDENCE_VALIDATOR="$HOME/.claude/scripts/validate-design-review-evidence.sh"
BASH_LOG="$PHASE_DIR/temp/bash-commands.log"

# Design-lane deterministic floor: the named-slop detector (designcheck).
# Absolute path resolves cross-project (it points at the ORCA-OS repo so the
# floor works in any orchestration project, not just inside this repo).
# `npx designcheck` is NOT a published package -- we invoke the local node bin.
DESIGNCHECK_BIN="/Users/adilkalam/ORCA-OS/mcp/design-detector/bin/designcheck.js"

# Read JSON from stdin (Claude Code passes hook data via stdin)
HOOK_INPUT=$(cat)

# Extract tool name and params from JSON
TOOL_NAME=$(echo "$HOOK_INPUT" | jq -r '.tool_name // empty' 2>/dev/null || echo "")
TOOL_PARAMS=$(echo "$HOOK_INPUT" | jq -r '.tool_input // empty' 2>/dev/null || echo "")

# Early exit: if no phase_state.json, this project doesn't use pipelines
if [ ! -f "$PHASE_STATE" ]; then
    exit 0
fi

# Gate runner check: GATE_RUNNER is empty (removed -- see comment above).
# Pattern violation detection is now handled by os-dev-standards-enforcer agent.
GATE_RUNNER_EXISTS=false
if [ -n "$GATE_RUNNER" ] && [ -f "$GATE_RUNNER" ]; then
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
        exit 2
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
            exit 2
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
                exit 2
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

    if [[ "$FILE_PATH" == .orca/orchestration/evidence/design-review-* ]]; then
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
                    exit 2
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
                    echo "- Save a structured design-review report under .orca/orchestration/evidence/"
                    echo "- Record its path in gates.design_qa.evidence_paths"
                    echo ""
                    echo -e "${RED}#POISON_PATH: Design gate PASS without explicit evidence paths${NC}"
                    exit 2
                fi

                # Validate each referenced evidence file
                # Use a while-read loop to preserve paths with spaces if needed.
                # NOTE: the loop runs in a pipe subshell, so its `exit 2` only
                # terminates the subshell. We capture that exit status and
                # re-exit from the parent so the BLOCK actually reaches the hook
                # harness (pre-existing pipe-subshell escape, fixed here).
                echo "$EVIDENCE_PATHS" | while IFS= read -r evidence_path; do
                    [ -z "$evidence_path" ] && continue

                    if [ ! -f "$evidence_path" ]; then
                        echo -e "${RED}🚫 DESIGN GATE BLOCKED${NC}"
                        echo ""
                        echo "Referenced design review evidence file does not exist:"
                        echo "  $evidence_path"
                        echo ""
                        echo -e "${RED}#POISON_PATH: Design gate PASS with missing evidence file${NC}"
                        exit 2
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
                        exit 2
                    fi
                done
                EVIDENCE_LOOP_EXIT=$?
                if [ "$EVIDENCE_LOOP_EXIT" -ne 0 ]; then
                    exit "$EVIDENCE_LOOP_EXIT"
                fi
            fi

            # ==================================================
            # Design Lane Deterministic Floor (Anti-Fabrication)
            # ==================================================

            # When a phase_state write claims a design gate PASS -- via EITHER
            # the legacy gates.design_qa.gate_decision OR the new design-lane
            # gates.design_lane.gate_decision -- the model cannot also have the
            # detector find named P0 slop in the produced artifacts. We run the
            # detector OURSELVES on the claimed artifact paths and BLOCK (exit 2)
            # if it reports dirty (detector exit 2). This is a deterministic
            # floor: a clean-PASS claim is mechanically falsified by named slop.
            DESIGN_QA_DECISION=$(jq -r '.gates.design_qa.gate_decision // empty' "$CANDIDATE_JSON" 2>/dev/null || echo "")
            DESIGN_LANE_DECISION=$(jq -r '.gates.design_lane.gate_decision // empty' "$CANDIDATE_JSON" 2>/dev/null || echo "")

            if [ "$DESIGN_QA_DECISION" = "PASS" ] || [ "$DESIGN_LANE_DECISION" = "PASS" ]; then
                # FAIL-OPEN if the detector binary is missing: a missing detector
                # must not hard-block every write in every project. Loud stderr
                # note, allow (exit 0 fall-through), do not block.
                if [ ! -f "$DESIGNCHECK_BIN" ]; then
                    echo -e "${YELLOW}⚠️  design-lane floor: detector not found at${NC}" >&2
                    echo "  $DESIGNCHECK_BIN" >&2
                    echo "Skipping deterministic slop check (fail-open, not blocking)." >&2
                else
                    # Collect claimed artifact paths from the new design-lane
                    # artifact_paths plus the existing evidence_paths arrays
                    # (both gates), de-duplicated. These are the produced files
                    # the PASS claims to have validated.
                    ARTIFACT_PATHS=$(jq -r '
                        [
                          (.gates.design_lane.artifact_paths[]? // empty),
                          (.gates.design_lane.evidence_paths[]?  // empty),
                          (.gates.design_qa.artifact_paths[]?    // empty),
                          (.gates.design_qa.evidence_paths[]?    // empty)
                        ] | unique | .[]
                    ' "$CANDIDATE_JSON" 2>/dev/null || echo "")

                    # No artifact paths on a claimed design PASS -> cannot verify
                    # -> BLOCK (the PASS is unfalsifiable without produced files).
                    if [ -z "$ARTIFACT_PATHS" ]; then
                        echo -e "${RED}🚫 DESIGN LANE FLOOR BLOCKED${NC}"
                        echo ""
                        echo "A design gate is marked PASS but no artifact paths were provided."
                        echo "Provide the produced artifact paths under one of:"
                        echo "- gates.design_lane.artifact_paths[]"
                        echo "- gates.design_lane.evidence_paths[]"
                        echo "- gates.design_qa.evidence_paths[]"
                        echo "so the detector can verify them."
                        echo ""
                        echo -e "${RED}#POISON_PATH: Design PASS claimed with no artifacts to verify${NC}"
                        exit 2
                    fi

                    # Run the detector on each claimed artifact. The EXIT CODE is
                    # the authoritative signal: 2 = dirty (named P0 slop), 0 =
                    # clean. Findings text may land on stdout or stderr, so we
                    # capture both with 2>&1 only to surface the named ids.
                    # A pipe subshell would swallow our exit, so iterate over a
                    # here-string (no subshell) and exit directly from parent.
                    while IFS= read -r artifact_path; do
                        [ -z "$artifact_path" ] && continue

                        # Skip non-existent / non-file paths: the evidence-path
                        # existence check above already guards design_qa; for the
                        # design-lane floor a missing file cannot be scanned, so
                        # we treat absence as unverifiable -> BLOCK.
                        if [ ! -f "$artifact_path" ]; then
                            echo -e "${RED}🚫 DESIGN LANE FLOOR BLOCKED${NC}"
                            echo ""
                            echo "Claimed design artifact does not exist (cannot verify):"
                            echo "  $artifact_path"
                            echo ""
                            echo -e "${RED}#POISON_PATH: Design PASS references a missing artifact${NC}"
                            exit 2
                        fi

                        DETECT_OUT=$(node "$DESIGNCHECK_BIN" detect --json "$artifact_path" 2>&1)
                        DETECT_EXIT=$?

                        if [ "$DETECT_EXIT" -eq 2 ]; then
                            SLOP_IDS=$(printf '%s' "$DETECT_OUT" \
                                | jq -r '[.[].antipattern] | unique | join(", ")' 2>/dev/null || echo "")
                            [ -z "$SLOP_IDS" ] && SLOP_IDS="unknown-p0"

                            echo -e "${RED}🚫 DESIGN LANE FLOOR BLOCKED${NC}"
                            echo ""
                            echo "designcheck found P0 slop in a claimed-clean design PASS:"
                            echo "  $artifact_path"
                            echo "  named slop: $SLOP_IDS"
                            echo ""
                            echo "A design gate cannot be PASS while the detector reports named"
                            echo "anti-patterns. Fix the slop, then re-mark the gate."
                            echo ""
                            echo -e "${RED}#POISON_PATH: Clean design PASS contradicted by detector slop${NC}"
                            exit 2
                        fi

                        # Any non-0, non-2 exit means the detector could not run
                        # cleanly (crash, bad path). FAIL-OPEN with a loud note so
                        # we do not block every write on a broken detector; the
                        # missing-binary case is already handled above.
                        if [ "$DETECT_EXIT" -ne 0 ]; then
                            echo -e "${YELLOW}⚠️  design-lane floor: detector exited ${DETECT_EXIT} on${NC}" >&2
                            echo "  $artifact_path (fail-open, not blocking)." >&2
                        fi
                    done <<< "$ARTIFACT_PATHS"
                fi
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
                    # Same pipe-subshell escape applies here: capture and re-exit.
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
                            exit 2
                        fi
                    done
                    VERIFY_LOOP_EXIT=$?
                    if [ "$VERIFY_LOOP_EXIT" -ne 0 ]; then
                        exit "$VERIFY_LOOP_EXIT"
                    fi
                fi
            fi
        fi
    fi
fi

# All checks passed
exit 0
