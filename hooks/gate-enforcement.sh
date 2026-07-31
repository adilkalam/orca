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

# Design-lane deterministic floor: the named-slop detectors.
# Absolute defaults resolve cross-project (they point at the ORCA-OS repo so the
# floor works in any orchestration project, not just inside this repo). Both are
# env-overridable with the SAME env var names the validators use, so the hook and
# the validator resolve identically.
#   - Web CSS detector (designcheck.js): invoked via `node` (NOT a published npx pkg).
#   - iOS Swift detector (swiftdesigncheck): invoked directly. FR-3.2 arms the iOS
#     floor here; SWIFT_DESIGN_DETECTOR_BIN matches ios-design-validator.md.
DESIGNCHECK_BIN="${DESIGN_DETECTOR_PATH:-/Users/adilkalam/ORCA-OS/mcp/design-detector/bin/designcheck.js}"
SWIFTDESIGNCHECK_BIN="${SWIFT_DESIGN_DETECTOR_BIN:-/Users/adilkalam/ORCA-OS/mcp/swift-design-detector/bin/swiftdesigncheck}"

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

if [[ "$TOOL_NAME" =~ ^(Write|Edit|MultiEdit)$ ]]; then
    FILE_PATH=$(echo "$TOOL_PARAMS" | jq -r '.file_path // ""' 2>/dev/null || echo "")

    # Suffix match, not exact equality: Claude Code passes ABSOLUTE file_paths,
    # so comparing against the relative $PHASE_STATE literal never fired on real
    # writes. Any path ending in .orca/orchestration/phase_state.json is the
    # phase state.
    if [[ "$FILE_PATH" == *.orca/orchestration/phase_state.json ]]; then
        # Content extraction per tool: .content (Write) / .new_string (Edit) /
        # joined .edits[].new_string (MultiEdit, best-effort -- an edit patch is
        # NOT guaranteed to reconstruct the full JSON; the lane mandates
        # Write-with-full-content as the guarantee, this is defense-in-depth).
        CONTENT=$(echo "$TOOL_PARAMS" | jq -r '.content // .new_string // ((.edits // []) | map(.new_string // "") | join("\n"))' 2>/dev/null || echo "")

        if [ -n "$CONTENT" ]; then
            mkdir -p "$PHASE_TEMP_DIR" 2>/dev/null || true
            CANDIDATE_JSON="$PHASE_TEMP_DIR/phase_state.candidate.json"
            printf "%s" "$CONTENT" > "$CANDIDATE_JSON"

            # ── Non-canonical design gate-key guard ──
            # The ONLY canonical design-lane gate keys are gates.design_lane and
            # gates.ios_design_lane (docs/reference/design-lane.md). Variant keys
            # (e.g. gates.ios_design_lane_T5_polish) previously bypassed every
            # design check below -- the proven 68-variant bypass. Deterministic
            # reject; per-tier detail belongs INSIDE the canonical gate object.
            VARIANT_GATE_KEYS=$(jq -r '(.gates // {}) | keys[] | select(test("^(ios_)?design_lane.+"))' "$CANDIDATE_JSON" 2>/dev/null | tr '\n' ' ')
            if [ -n "${VARIANT_GATE_KEYS// /}" ]; then
                echo -e "${RED}DESIGN GATE KEY BLOCKED${NC}"
                echo ""
                echo "Non-canonical design gate key(s) in phase_state write: ${VARIANT_GATE_KEYS}"
                echo "The ONLY canonical design gate keys are:"
                echo "  gates.design_lane      (web)"
                echo "  gates.ios_design_lane  (iOS)"
                echo "Write the canonical key; per-tier detail belongs inside the gate"
                echo "object, not in the key name. See docs/reference/design-lane.md."
                echo ""
                echo -e "${RED}#POISON_PATH: Variant design gate key bypassing the canonical floor${NC}"
                exit 2
            fi

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

            # T0 (tweak) writes NO phase_state and is exempt by construction;
            # this floor guards the T1/T2 canonical gate writes
            # (gates.design_lane / gates.ios_design_lane -- design-lane.md).
            #
            # When a phase_state write claims a design gate PASS -- via EITHER
            # the legacy gates.design_qa.gate_decision OR the canonical
            # design-lane gates -- the model cannot also have the detector find
            # blocking slop in the produced artifacts. We run the detector
            # OURSELVES on the claimed artifact paths and BLOCK (exit 2) if it
            # reports blocking findings. With severity-aware detector exits,
            # detector exit 2 means BLOCKING findings only (at least one with
            # severity P0/P1); advisory-only runs exit 0 and never block. This
            # is a deterministic floor: a clean-PASS claim is mechanically
            # falsified by named slop.
            DESIGN_QA_DECISION=$(jq -r '.gates.design_qa.gate_decision // empty' "$CANDIDATE_JSON" 2>/dev/null || echo "")
            DESIGN_LANE_DECISION=$(jq -r '.gates.design_lane.gate_decision // empty' "$CANDIDATE_JSON" 2>/dev/null || echo "")
            IOS_DESIGN_LANE_DECISION=$(jq -r '.gates.ios_design_lane.gate_decision // empty' "$CANDIDATE_JSON" 2>/dev/null || echo "")

            if [ "$DESIGN_QA_DECISION" = "PASS" ] || [ "$DESIGN_LANE_DECISION" = "PASS" ] || [ "$IOS_DESIGN_LANE_DECISION" = "PASS" ]; then
                # Per-lane detector selection (FR-3.2): a PURE iOS-design PASS
                # (ios_design_lane PASS with NO web design PASS) scans .swift files,
                # so use the Swift detector; otherwise the web CSS detector. This
                # prevents running designcheck.js on Swift sources (and vice versa).
                DETECTOR_BIN="$DESIGNCHECK_BIN"
                DETECTOR_IS_SWIFT=false
                if [ "$IOS_DESIGN_LANE_DECISION" = "PASS" ] && [ "$DESIGN_LANE_DECISION" != "PASS" ] && [ "$DESIGN_QA_DECISION" != "PASS" ]; then
                    DETECTOR_BIN="$SWIFTDESIGNCHECK_BIN"
                    DETECTOR_IS_SWIFT=true
                fi

                # FR-3.7 attempts cap: the lane allows MAX N=2 builder retries, then
                # ESCALATE. A PASS written with attempts > 2 and no escalation flag is
                # a runaway loop silently shipping -> BLOCK. gates.<lane>.escalated=true
                # is the sanctioned exit (the orchestrator surfaced the unresolved
                # findings to the user). These are the canonical lane fields.
                DL_ATTEMPTS=$(jq -r '.gates.design_lane.attempts // 0' "$CANDIDATE_JSON" 2>/dev/null || echo "0")
                DL_ESCALATED=$(jq -r '.gates.design_lane.escalated // false' "$CANDIDATE_JSON" 2>/dev/null || echo "false")
                IDL_ATTEMPTS=$(jq -r '.gates.ios_design_lane.attempts // 0' "$CANDIDATE_JSON" 2>/dev/null || echo "0")
                IDL_ESCALATED=$(jq -r '.gates.ios_design_lane.escalated // false' "$CANDIDATE_JSON" 2>/dev/null || echo "false")

                if { [ "$DESIGN_LANE_DECISION" = "PASS" ] && [ "$DL_ATTEMPTS" -gt 2 ] 2>/dev/null && [ "$DL_ESCALATED" != "true" ]; } || \
                   { [ "$IOS_DESIGN_LANE_DECISION" = "PASS" ] && [ "$IDL_ATTEMPTS" -gt 2 ] 2>/dev/null && [ "$IDL_ESCALATED" != "true" ]; }; then
                    echo -e "${RED}🚫 DESIGN LANE FLOOR BLOCKED${NC}"
                    echo ""
                    echo "A design gate is PASS after more than 2 builder retries (attempts > 2)"
                    echo "with no escalation. The lane caps retries at N=2, then ESCALATES to the"
                    echo "user -- it never silently ships a runaway loop."
                    echo "Set gates.<lane>.escalated = true only after surfacing the unresolved"
                    echo "findings to the user; otherwise fix the findings and reset attempts."
                    echo ""
                    echo -e "${RED}#POISON_PATH: Design PASS past the N=2 retry cap without escalation${NC}"
                    exit 2
                fi

                # FAIL-OPEN if the WEB detector binary is missing: a missing detector
                # must not hard-block every write in every project. Loud stderr note,
                # allow (exit 0 fall-through), do not block.
                # For the iOS (Swift) detector the handling differs (FR-3.2): the
                # ios-design-validator already failed CLOSED upstream if the binary was
                # absent, so here we do NOT silent-pass and do NOT hard-block -- we emit
                # a loud WARN and drop an auditable sidecar marker instead.
                if [ ! -f "$DETECTOR_BIN" ]; then
                    if [ "$DETECTOR_IS_SWIFT" = "true" ]; then
                        echo "WARN: swiftdesigncheck not found; iOS design floor skipped" >&2
                        echo "  $DETECTOR_BIN" >&2
                        mkdir -p "$PHASE_TEMP_DIR" 2>/dev/null || true
                        printf '%s' "skipped-no-detector" > "$PHASE_TEMP_DIR/ios-floor-status"
                    else
                        echo -e "${YELLOW}⚠️  design-lane floor: detector not found at${NC}" >&2
                        echo "  $DETECTOR_BIN" >&2
                        echo "Skipping deterministic slop check (fail-open, not blocking)." >&2
                    fi
                else
                    # Collect claimed artifact paths from the web design-lane, the
                    # iOS design-lane (FR-3.2 -- now armed), and the legacy design_qa
                    # gate: artifact_paths plus evidence_paths arrays, de-duplicated.
                    # These are the produced files the PASS claims to have validated.
                    ARTIFACT_PATHS=$(jq -r '
                        [
                          (.gates.design_lane.artifact_paths[]?     // empty),
                          (.gates.design_lane.evidence_paths[]?      // empty),
                          (.gates.ios_design_lane.artifact_paths[]?  // empty),
                          (.gates.ios_design_lane.evidence_paths[]?  // empty),
                          (.gates.design_qa.artifact_paths[]?        // empty),
                          (.gates.design_qa.evidence_paths[]?        // empty)
                        ] | unique | .[]
                    ' "$CANDIDATE_JSON" 2>/dev/null || echo "")

                    # Owner-override registry (design-lane.md §Precedence + Step 4).
                    # The hook re-runs the detector ITSELF; it MUST honor the same
                    # write-back the validator did, or it re-blocks a validator-
                    # passed artifact (re-creating the circles this lane kills).
                    # 1. Export BOTH override-path vars so whichever detector this
                    #    block selected ($DETECTOR_BIN -- web designcheck.js OR the
                    #    Swift swiftdesigncheck) self-suppresses against
                    #    {project}/.design-overrides.json. The iOS floor is now armed
                    #    (FR-3.2): an ios_design_lane PASS runs swiftdesigncheck here.
                    PROJECT_OVERRIDES="$PWD/.design-overrides.json"
                    export DESIGN_OVERRIDES_PATH="$PROJECT_OVERRIDES"
                    export SWIFT_DESIGN_OVERRIDES="$PROJECT_OVERRIDES"

                    # 2. Scope-aware defensive fallback (FR-3.3): collect the
                    #    active_overrides the validator recorded onto the candidate
                    #    phase_state (both lane gates) as {suppresses, scope} objects.
                    #    Below, a reported slop id is treated as covered ONLY IF an
                    #    active override has suppresses == the finding id AND a
                    #    NON-EMPTY scope glob that MATCHES the finding's file path.
                    #    Empty/missing scope suppresses NOTHING (the narrowing
                    #    invariant, docs/concepts/design-overrides-schema.md). This
                    #    fallback covers the case where the registry file lagged the
                    #    phase_state write.
                    ACTIVE_OVERRIDES_JSON=$(jq -c '
                        [
                          (.gates.design_lane.active_overrides[]? // empty),
                          (.gates.ios_design_lane.active_overrides[]? // empty)
                        ]
                        | map({suppresses: (.suppresses // ""), scope: (.scope // "")})
                        | map(select(.suppresses != "" and .scope != ""))
                    ' "$CANDIDATE_JSON" 2>/dev/null || echo "[]")
                    [ -z "$ACTIVE_OVERRIDES_JSON" ] && ACTIVE_OVERRIDES_JSON="[]"

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
                    # the authoritative signal: 2 = blocking findings (severity
                    # P0/P1; advisory-only runs exit 0 upstream), 0 = clean or
                    # advisory-only.
                    # Stream contract (BOTH detectors' real contract -- see
                    # main.swift and detect-antipatterns.mjs): findings JSON goes
                    # to STDERR; STDOUT carries "[]" on clean runs. So capture
                    # the streams SEPARATELY (stderr to a temp file) -- the old
                    # 2>&1 mixed warning noise into the JSON, broke jq, and the
                    # parse failure was silently swallowed to clean.
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

                        # Web detector runs via node; the Swift wrapper runs directly.
                        # DETECT_STDOUT is "[]" on clean runs (kept for the record);
                        # the findings body on exit 2 lives in the stderr capture.
                        DETECT_ERR_FILE="$PHASE_TEMP_DIR/design-floor-detector.stderr"
                        if [ "$DETECTOR_IS_SWIFT" = "true" ]; then
                            DETECT_STDOUT=$("$DETECTOR_BIN" detect --json "$artifact_path" 2>"$DETECT_ERR_FILE")
                        else
                            DETECT_STDOUT=$(node "$DETECTOR_BIN" detect --json "$artifact_path" 2>"$DETECT_ERR_FILE")
                        fi
                        DETECT_EXIT=$?

                        if [ "$DETECT_EXIT" -eq 2 ]; then
                            # Findings JSON is on the STDERR capture for BOTH
                            # detectors (their documented contract). Strip any
                            # warning noise ahead of the JSON body: it starts at
                            # the first line beginning with '['.
                            DETECT_FINDINGS=$(awk '/^\[/{body=1} body{print}' "$DETECT_ERR_FILE" 2>/dev/null)

                            # Scope-aware defensive subtraction (FR-3.3): the registry
                            # export above already self-suppresses, but if that file
                            # lagged the write we must not re-block a covered id. A
                            # finding is covered ONLY IF an active override has
                            # suppresses == finding.antipattern AND a NON-EMPTY scope
                            # glob that MATCHES the finding's file path (glob **/*/?
                            # compiled to an anchored regex over the full path; empty
                            # scope suppresses nothing -- the narrowing invariant).
                            JQ_PARSE_OK=true
                            UNCOVERED_IDS=$(printf '%s' "$DETECT_FINDINGS" \
                                | jq -r --argjson ov "$ACTIVE_OVERRIDES_JSON" --arg apath "$artifact_path" '
                                    def glob2re:
                                      gsub("\\*\\*/"; "ZQXGLOB1")
                                      | gsub("\\*\\*"; "ZQXGLOB2")
                                      | gsub("\\*"; "ZQXGLOB3")
                                      | gsub("\\?"; "ZQXGLOB4")
                                      | gsub("(?<c>[.+(){}\\[\\]^$|\\\\])"; "\\" + .c)
                                      | gsub("ZQXGLOB1"; "(.*/)?")
                                      | gsub("ZQXGLOB2"; ".*")
                                      | gsub("ZQXGLOB3"; "[^/]*")
                                      | gsub("ZQXGLOB4"; "[^/]")
                                      | "^" + . + "$";
                                    ( . // [] ) as $findings
                                    | [ $findings[]
                                        | . as $f
                                        | ($f.file // $apath) as $path
                                        | select(
                                            [ $ov[]
                                              | select(.suppresses == $f.antipattern and .scope != "")
                                              | (.scope | glob2re) as $re
                                              | ($path | test($re))
                                            ] | any | not
                                          )
                                        | $f.antipattern
                                      ] | unique | join(", ")' \
                                    2>/dev/null) || JQ_PARSE_OK=false
                            # If EVERY reported id is covered by an active override
                            # (within its scope), treat the artifact as clean and
                            # continue (no BLOCK).
                            if [ "$JQ_PARSE_OK" = "true" ] && [ -z "$UNCOVERED_IDS" ]; then
                                continue
                            fi
                            # Unparseable findings NEVER downgrade to clean: the
                            # exit code is authoritative, so an exit-2 with a
                            # broken findings body still BLOCKS (the old 2>&1
                            # capture swallowed exactly this case to clean).
                            if [ "$JQ_PARSE_OK" != "true" ]; then
                                UNCOVERED_IDS="(findings JSON unparseable -- raw detector stderr: $DETECT_ERR_FILE)"
                            fi
                            SLOP_IDS="$UNCOVERED_IDS"

                            DETECTOR_NAME="designcheck"
                            if [ "$DETECTOR_IS_SWIFT" = "true" ]; then
                                DETECTOR_NAME="swiftdesigncheck"
                            fi
                            echo -e "${RED}🚫 DESIGN LANE FLOOR BLOCKED${NC}"
                            echo ""
                            echo "${DETECTOR_NAME} found blocking findings (severity P0/P1) in a claimed-clean design PASS:"
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
                        # missing-binary case is already handled above. Surface
                        # the separately-captured stderr so the failure is
                        # diagnosable instead of vanishing with the temp file.
                        if [ "$DETECT_EXIT" -ne 0 ]; then
                            echo -e "${YELLOW}⚠️  design-lane floor: detector exited ${DETECT_EXIT} on${NC}" >&2
                            echo "  $artifact_path (fail-open, not blocking). Detector stderr:" >&2
                            tail -n 20 "$DETECT_ERR_FILE" >&2 2>/dev/null || true
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

            # ==================================================
            # Dev-Lane Standards Score Gate (Anti-Fabrication)
            # ==================================================

            # Dev lanes (ios / expo / django-react; nextjs adopts in a later
            # phase) write a canonical standards-score contract to phase_state:
            #   gates.standards = { score:<int>, threshold:90,
            #                       gate_decision:"PASS|BLOCK", lane:"<domain>" }
            # (docs/reference/gate-contract.md). When that gate is PASS the score
            # must be present, numeric, and >= threshold: a PASS with no numeric
            # score is a fabricated PASS, and a sub-threshold PASS contradicts the
            # lane's "hard block < 90" rule. Either case BLOCKS (exit 2). Lanes
            # that have NOT adopted the contract (no gates.standards object) are
            # untouched -- the gate is inert unless gate_decision == PASS.
            STANDARDS_DECISION=$(jq -r '.gates.standards.gate_decision // empty' "$CANDIDATE_JSON" 2>/dev/null || echo "")

            if [ "$STANDARDS_DECISION" = "PASS" ]; then
                STANDARDS_SCORE=$(jq -r '.gates.standards.score // empty' "$CANDIDATE_JSON" 2>/dev/null || echo "")
                STANDARDS_THRESHOLD=$(jq -r '.gates.standards.threshold // 90' "$CANDIDATE_JSON" 2>/dev/null || echo "90")
                STANDARDS_LANE=$(jq -r '.gates.standards.lane // "unknown"' "$CANDIDATE_JSON" 2>/dev/null || echo "unknown")

                # threshold defaults to 90 when absent / non-numeric.
                if ! [[ "$STANDARDS_THRESHOLD" =~ ^-?[0-9]+$ ]]; then
                    STANDARDS_THRESHOLD=90
                fi

                # score MUST be a non-empty integer; anything else is a fabricated PASS.
                if ! [[ "$STANDARDS_SCORE" =~ ^-?[0-9]+$ ]]; then
                    echo -e "${RED}STANDARDS SCORE GATE BLOCKED${NC}"
                    echo ""
                    echo "gates.standards.gate_decision = PASS on the ${STANDARDS_LANE} lane but"
                    echo "gates.standards.score is absent or non-numeric (got: '${STANDARDS_SCORE}')."
                    echo "A PASS with no numeric score is a fabricated PASS."
                    echo ""
                    echo "Write the score the standards-enforcer returned, e.g.:"
                    echo '  gates.standards = { "score": 93, "threshold": 90, "gate_decision": "PASS", "lane": "'"${STANDARDS_LANE}"'" }'
                    echo "See docs/reference/gate-contract.md"
                    echo ""
                    echo -e "${RED}#POISON_PATH: Standards PASS with no numeric score${NC}"
                    exit 2
                fi

                # sub-threshold PASS is not allowed (makes "hard block < 90" real).
                if [ "$STANDARDS_SCORE" -lt "$STANDARDS_THRESHOLD" ]; then
                    echo -e "${RED}STANDARDS SCORE GATE BLOCKED${NC}"
                    echo ""
                    echo "gates.standards.gate_decision = PASS on the ${STANDARDS_LANE} lane but the"
                    echo "score ${STANDARDS_SCORE} is below the threshold ${STANDARDS_THRESHOLD}."
                    echo "The lane hard-blocks a standards score under threshold; fix the"
                    echo "violations and re-gate, or record gate_decision = BLOCK."
                    echo "See docs/reference/gate-contract.md"
                    echo ""
                    echo -e "${RED}#POISON_PATH: Standards PASS below the numeric threshold${NC}"
                    exit 2
                fi
            fi
        fi
    fi
fi

# All checks passed
exit 0
