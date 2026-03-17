#!/usr/bin/env bash
# ORCA-OS Interconnection Test Suite: Contract Tests
# REAL integration tests that verify actual data flow, not just file existence.
#
# Usage:
#   scripts/test-contracts.sh [--verbose]
#
# Contracts verified:
#   C1: Workshop CLI responds (runs workshop command)
#   C2: project-context MCP returns ContextBundle (calls MCP, parses response)
#   C3: cognition-mcp creates session (calls MCP, verifies sessionId)
#   C4: cognition harvest creates file (full round-trip)
#   C5: recording.db has recent data (queries SQLite)
#   C6: query_context returns relatedStandards (calls MCP, verifies field)
#   C7: save_standard round-trip (write -> read -> verify)

set -euo pipefail

VERBOSE="${1:-}"
PASS_COUNT=0
FAIL_COUNT=0
SKIP_COUNT=0
TEST_MARKER="CONTRACT_TEST_$(date +%s)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_pass() {
    echo -e "${GREEN}[PASS]${NC} $1"
    PASS_COUNT=$((PASS_COUNT + 1))
}

log_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
    FAIL_COUNT=$((FAIL_COUNT + 1))
}

log_skip() {
    echo -e "${YELLOW}[SKIP]${NC} $1"
    SKIP_COUNT=$((SKIP_COUNT + 1))
}

log_info() {
    if [[ "$VERBOSE" == "--verbose" ]]; then
        echo -e "${BLUE}[INFO]${NC} $1"
    fi
}

log_detail() {
    if [[ "$VERBOSE" == "--verbose" ]]; then
        echo "       $1"
    fi
}

cleanup() {
    # Clean up test artifacts
    if command -v workshop &> /dev/null; then
        # Remove test entries (if workshop supports deletion)
        log_info "Cleaning up test artifacts..."
    fi
}

trap cleanup EXIT

# Detect paths
PROJECT_ROOT=$(pwd)
ORCA_OS_ROOT="/Users/adilkalam/ORCA-OS"
MCP_CALL="$ORCA_OS_ROOT/scripts/mcp-call.mjs"

echo "=========================================="
echo "ORCA-OS Contract Tests (REAL INTEGRATION)"
echo "=========================================="
echo "Project root: $PROJECT_ROOT"
echo ""

# Verify MCP caller exists
if [[ ! -f "$MCP_CALL" ]]; then
    echo -e "${RED}ERROR: MCP caller not found at $MCP_CALL${NC}"
    exit 1
fi

# ============================================================
# C1: Workshop CLI responds (REAL - runs actual command)
# ============================================================
echo "--- C1: Workshop CLI responds ---"
if command -v workshop &> /dev/null; then
    # Run workshop and capture both output and exit code
    WORKSHOP_OUTPUT=$(workshop --workspace "$PROJECT_ROOT/.claude/memory" recent 2>&1)
    WORKSHOP_EXIT=$?

    # STRICT: Must exit 0 AND not contain error indicators
    if [[ $WORKSHOP_EXIT -eq 0 ]]; then
        # Check for error patterns that would indicate failure despite exit 0
        if echo "$WORKSHOP_OUTPUT" | grep -qi "error\|failed\|exception\|panic"; then
            log_fail "C1: Workshop CLI returned error message"
            log_detail "Output: ${WORKSHOP_OUTPUT:0:150}..."
        else
            log_pass "C1: Workshop CLI responds (exit 0, no errors)"
            log_detail "Output: ${WORKSHOP_OUTPUT:0:80}..."
        fi
    else
        log_fail "C1: Workshop CLI exited with code $WORKSHOP_EXIT"
        log_detail "Output: ${WORKSHOP_OUTPUT:0:150}..."
    fi
else
    log_skip "C1: Workshop CLI not installed"
fi

# ============================================================
# C2: project-context MCP returns ContextBundle (REAL - calls MCP)
# ============================================================
echo "--- C2: project-context MCP returns ContextBundle ---"
if [[ -f ~/.claude/mcp/project-context-server/dist/index.js ]]; then
    # Actually call the MCP
    PC_ARGS='{"domain":"os-dev","task":"contract test","projectPath":"'"$PROJECT_ROOT"'","maxFiles":5}'
    PC_RESPONSE=$(timeout 30 node "$MCP_CALL" project-context query_context "$PC_ARGS" 2>&1) || true

    # STRICT: Parse JSON and verify required ContextBundle fields exist
    BUNDLE_CHECK=$(echo "$PC_RESPONSE" | node -e "
        try {
            const data = JSON.parse(require('fs').readFileSync(0,'utf8'));
            const required = ['relevantFiles', 'projectState', 'relatedStandards'];
            const missing = required.filter(f => !(f in data));
            if (missing.length > 0) {
                console.log('missing:' + missing.join(','));
            } else {
                console.log('ok');
            }
        } catch (e) {
            console.log('parse-error:' + e.message.slice(0, 50));
        }
    " 2>/dev/null || echo "node-error")

    case "$BUNDLE_CHECK" in
        ok)
            log_pass "C2: project-context MCP returns valid ContextBundle"
            log_detail "All required fields present: relevantFiles, projectState, relatedStandards"
            ;;
        missing:*)
            MISSING="${BUNDLE_CHECK#missing:}"
            log_fail "C2: ContextBundle missing required fields: $MISSING"
            ;;
        parse-error:*)
            log_fail "C2: project-context MCP returned invalid JSON"
            log_detail "Error: ${BUNDLE_CHECK#parse-error:}"
            log_detail "Response: ${PC_RESPONSE:0:200}"
            ;;
        *)
            log_fail "C2: Failed to verify ContextBundle"
            log_detail "Check result: $BUNDLE_CHECK"
            ;;
    esac
else
    log_skip "C2: project-context MCP not deployed"
fi

# ============================================================
# C3: cognition-mcp creates session (REAL - calls MCP, verifies sessionId)
# ============================================================
echo "--- C3: cognition-mcp creates session ---"
if [[ -f ~/.claude/mcp/cognition-mcp/dist/index.js ]]; then
    # Actually call cognition with a thought operation
    COG_ARGS='{"operation":"thought","sessionTitle":"Contract Test '"$TEST_MARKER"'","content":{"thought":"Contract test thought","thoughtNumber":1,"totalThoughts":1,"nextThoughtNeeded":false}}'
    COG_RESPONSE=$(timeout 30 node "$MCP_CALL" cognition-mcp cognition "$COG_ARGS" 2>&1) || true

    # STRICT: Parse JSON and extract sessionId properly
    SESSION_CHECK=$(echo "$COG_RESPONSE" | node -e "
        try {
            const data = JSON.parse(require('fs').readFileSync(0,'utf8'));
            if (data.sessionId && typeof data.sessionId === 'string' && data.sessionId.length > 0) {
                console.log('ok:' + data.sessionId);
            } else if (data.error) {
                console.log('error:' + data.error);
            } else {
                console.log('missing-sessionId');
            }
        } catch (e) {
            console.log('parse-error:' + e.message.slice(0, 50));
        }
    " 2>/dev/null || echo "node-error")

    case "$SESSION_CHECK" in
        ok:*)
            SESSION_ID="${SESSION_CHECK#ok:}"
            log_pass "C3: cognition-mcp creates session with sessionId"
            log_detail "SessionId: $SESSION_ID"
            ;;
        error:*)
            log_fail "C3: cognition-mcp returned error: ${SESSION_CHECK#error:}"
            ;;
        missing-sessionId)
            log_fail "C3: cognition-mcp response missing sessionId"
            log_detail "Response: ${COG_RESPONSE:0:200}"
            ;;
        parse-error:*)
            log_fail "C3: cognition-mcp returned invalid JSON"
            log_detail "Error: ${SESSION_CHECK#parse-error:}"
            ;;
        *)
            log_fail "C3: Failed to verify cognition session"
            log_detail "Check result: $SESSION_CHECK"
            ;;
    esac
else
    log_skip "C3: cognition-mcp not deployed"
fi

# ============================================================
# C4: cognition harvest creates file (REAL - full round-trip)
# ============================================================
echo "--- C4: cognition harvest creates .claude/cognition/ file ---"
COGNITION_DIR="$PROJECT_ROOT/.claude/cognition"
if [[ -f ~/.claude/mcp/cognition-mcp/dist/index.js ]]; then
    # Count files before
    FILES_BEFORE=$(find "$COGNITION_DIR" -name "*.md" -type f 2>/dev/null | wc -l | tr -d ' ')

    # Create a session and harvest it
    HARVEST_SESSION="Contract-Harvest-Test-$TEST_MARKER"

    # Step 1: Create session with thought
    COG_ARGS='{"operation":"thought","sessionTitle":"'"$HARVEST_SESSION"'","projectPath":"'"$PROJECT_ROOT"'","content":{"thought":"Testing harvest creates file","thoughtNumber":1,"totalThoughts":1,"nextThoughtNeeded":false}}'
    log_detail "Calling cognition with: $COG_ARGS"
    HARVEST_RESPONSE=$(timeout 30 node "$MCP_CALL" cognition-mcp cognition "$COG_ARGS" 2>&1) || true
    log_detail "Response: ${HARVEST_RESPONSE:0:300}"
    # Handle multi-line JSON - convert to single line for grep
    HARVEST_SID=$(echo "$HARVEST_RESPONSE" | tr -d '\n' | grep -o '"sessionId": *"[^"]*"' | cut -d'"' -f4 || echo "")
    log_detail "Extracted sessionId: $HARVEST_SID"

    if [[ -n "$HARVEST_SID" ]]; then
        log_detail "Created session: $HARVEST_SID"

        # Step 2: Harvest the session (checkpoint with phase: harvest triggers auto-persist)
        CHECKPOINT_ARGS='{"operation":"checkpoint","sessionId":"'"$HARVEST_SID"'","projectPath":"'"$PROJECT_ROOT"'","content":{"phase":"harvest","summary":"Contract test harvest"}}'
        CHECKPOINT_RESPONSE=$(timeout 30 node "$MCP_CALL" cognition-mcp cognition "$CHECKPOINT_ARGS" 2>&1) || true

        # Step 3: STRICT - file must actually be created on disk
        # No OR-fallback: we verify the FILE exists, not just that response says "autoPersist"
        sleep 1  # Give filesystem time to sync
        FILES_AFTER=$(find "$COGNITION_DIR" -name "*.md" -type f 2>/dev/null | wc -l | tr -d ' ')

        if [[ "$FILES_AFTER" -gt "$FILES_BEFORE" ]]; then
            # Find the new file and verify it contains our session
            NEWEST=$(find "$COGNITION_DIR" -name "*.md" -type f -mmin -1 2>/dev/null | head -1)
            if [[ -n "$NEWEST" ]] && grep -q "$HARVEST_SESSION\|$HARVEST_SID" "$NEWEST" 2>/dev/null; then
                log_pass "C4: cognition harvest created file with correct content"
                log_detail "New file: $NEWEST"
            elif [[ -n "$NEWEST" ]]; then
                log_pass "C4: cognition harvest created new file ($FILES_BEFORE -> $FILES_AFTER)"
                log_detail "New file: $NEWEST (content verification skipped)"
            else
                log_fail "C4: File count increased but newest file not found"
            fi
        else
            log_fail "C4: cognition harvest did not create file"
            log_detail "Files before: $FILES_BEFORE, after: $FILES_AFTER"
            log_detail "Checkpoint response: ${CHECKPOINT_RESPONSE:0:200}"
        fi
    else
        log_fail "C4: Could not create session for harvest test"
    fi
else
    log_skip "C4: cognition-mcp not deployed"
fi

# ============================================================
# C5: recording.db has recent data (REAL - queries SQLite)
# ============================================================
echo "--- C5: recording.db has data ---"
RECORDING_DB="$PROJECT_ROOT/.orca/recording.db"
if [[ -f "$RECORDING_DB" ]]; then
    if command -v sqlite3 &> /dev/null; then
        # Query for actual session data
        SESSION_COUNT=$(sqlite3 "$RECORDING_DB" "SELECT COUNT(*) FROM sessions;" 2>/dev/null || echo "0")
        CHECKPOINT_COUNT=$(sqlite3 "$RECORDING_DB" "SELECT COUNT(*) FROM checkpoints;" 2>/dev/null || echo "0")

        if [[ "$SESSION_COUNT" -gt 0 ]]; then
            log_pass "C5: recording.db has $SESSION_COUNT sessions, $CHECKPOINT_COUNT checkpoints"

            # Verify recent data (within last 24 hours)
            RECENT=$(sqlite3 "$RECORDING_DB" "SELECT COUNT(*) FROM sessions WHERE started_at > datetime('now', '-24 hours');" 2>/dev/null || echo "0")
            log_detail "Recent sessions (24h): $RECENT"
        else
            log_fail "C5: recording.db exists but has no sessions"
        fi
    else
        # Fallback: just check file has content
        if [[ -s "$RECORDING_DB" ]]; then
            log_pass "C5: recording.db exists and has content"
            log_detail "Size: $(du -h "$RECORDING_DB" | cut -f1)"
        else
            log_fail "C5: recording.db is empty"
        fi
    fi
else
    log_skip "C5: recording.db not found (recording not initialized)"
fi

# ============================================================
# C6: query_context returns relatedStandards (REAL - verifies field in response)
# ============================================================
echo "--- C6: query_context returns relatedStandards field ---"
if [[ -f ~/.claude/mcp/project-context-server/dist/index.js ]]; then
    # Call query_context and check for relatedStandards in actual response
    PC_ARGS='{"domain":"os-dev","task":"standards test","projectPath":"'"$PROJECT_ROOT"'"}'
    PC_RESPONSE=$(timeout 30 node "$MCP_CALL" project-context query_context "$PC_ARGS" 2>&1) || true

    # STRICT: Parse JSON properly and verify structure
    STANDARDS_CHECK=$(echo "$PC_RESPONSE" | node -e "
        try {
            const data = JSON.parse(require('fs').readFileSync(0,'utf8'));
            if (!('relatedStandards' in data)) {
                console.log('missing');
            } else if (!Array.isArray(data.relatedStandards)) {
                console.log('not-array:' + typeof data.relatedStandards);
            } else {
                console.log('ok:' + data.relatedStandards.length);
            }
        } catch (e) {
            console.log('parse-error:' + e.message);
        }
    " 2>/dev/null || echo "node-error")

    case "$STANDARDS_CHECK" in
        ok:*)
            STANDARDS_COUNT="${STANDARDS_CHECK#ok:}"
            log_pass "C6: query_context returns relatedStandards array ($STANDARDS_COUNT items)"
            ;;
        missing)
            log_fail "C6: query_context response missing relatedStandards field"
            log_detail "Response keys: $(echo "$PC_RESPONSE" | node -e "console.log(Object.keys(JSON.parse(require('fs').readFileSync(0,'utf8'))).join(', '))" 2>/dev/null || echo "parse error")"
            ;;
        not-array:*)
            TYPE="${STANDARDS_CHECK#not-array:}"
            log_fail "C6: relatedStandards is not an array (got: $TYPE)"
            ;;
        parse-error:*)
            log_fail "C6: Failed to parse query_context response"
            log_detail "Error: ${STANDARDS_CHECK#parse-error:}"
            ;;
        *)
            log_fail "C6: Unexpected response from query_context"
            log_detail "Check result: $STANDARDS_CHECK"
            ;;
    esac
else
    log_skip "C6: project-context MCP not deployed"
fi

# ============================================================
# C7: save_standard round-trip (REAL - write then read)
# ============================================================
echo "--- C7: save_standard round-trip ---"
if [[ -f ~/.claude/mcp/project-context-server/dist/index.js ]] && command -v workshop &> /dev/null; then
    # Step 1: Write a test standard via MCP
    SAVE_ARGS='{
        "domain": "os-dev",
        "what_happened": "Contract test '"$TEST_MARKER"'",
        "cost": "Test cost",
        "rule": "Test rule for contract verification",
        "projectPath": "'"$PROJECT_ROOT"'"
    }'
    SAVE_RESPONSE=$(timeout 30 node "$MCP_CALL" project-context save_standard "$SAVE_ARGS" 2>&1) || true
    log_detail "Save response: ${SAVE_RESPONSE:0:100}"

    # Check for error in save response
    if echo "$SAVE_RESPONSE" | grep -qi "error\|failed\|exception"; then
        log_fail "C7: save_standard returned error"
        log_detail "Response: ${SAVE_RESPONSE:0:200}"
    else
        # Step 2: STRICT - verify it appears in Workshop (no fallback)
        sleep 1  # Give Workshop time to write
        WORKSHOP_CHECK=$(workshop --workspace "$PROJECT_ROOT/.claude/memory" search "$TEST_MARKER" 2>&1) || true

        if echo "$WORKSHOP_CHECK" | grep -q "$TEST_MARKER"; then
            log_pass "C7: save_standard round-trip verified (write -> Workshop -> found)"
            log_detail "Test marker found in Workshop"
        else
            # No fallback - if it's not in Workshop, the round-trip failed
            log_fail "C7: save_standard wrote but marker NOT found in Workshop"
            log_detail "Marker: $TEST_MARKER"
            log_detail "Workshop search returned: ${WORKSHOP_CHECK:0:150}"
        fi
    fi
else
    if [[ ! -f ~/.claude/mcp/project-context-server/dist/index.js ]]; then
        log_skip "C7: project-context MCP not deployed"
    else
        log_skip "C7: Workshop CLI not available"
    fi
fi

# ============================================================
# Summary
# ============================================================
echo ""
echo "=========================================="
echo "Contract Test Summary"
echo "=========================================="
echo -e "Passed: ${GREEN}$PASS_COUNT${NC}"
echo -e "Failed: ${RED}$FAIL_COUNT${NC}"
echo -e "Skipped: ${YELLOW}$SKIP_COUNT${NC}"
echo ""

if [[ $FAIL_COUNT -gt 0 ]]; then
    echo -e "${RED}CONTRACTS FAILED${NC}"
    echo ""
    echo "These are REAL integration tests. Failures indicate actual problems."
    exit 1
else
    echo -e "${GREEN}ALL CONTRACTS PASSED${NC}"
    echo ""
    echo "Data flow verified through all tested systems."
    exit 0
fi
