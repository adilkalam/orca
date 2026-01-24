#!/usr/bin/env bash

# File Location Guard - WARNING ONLY mode
# Logs warnings for files created in potentially wrong locations
# NEVER blocks operations (exit 0 always) - Claude cannot handle interactive input

set -uo pipefail

# Colors for visibility
YELLOW='\033[1;33m'
NC='\033[0m'

# Read JSON from stdin
HOOK_INPUT=$(cat)

# Extract tool name and file path
TOOL_NAME=$(echo "$HOOK_INPUT" | jq -r '.tool_name // empty' 2>/dev/null)
FILE_PATH=$(echo "$HOOK_INPUT" | jq -r '.tool_input.file_path // .tool_input.notebook_path // empty' 2>/dev/null)

# Only check for file write operations
if [[ "$TOOL_NAME" != "Write" && "$TOOL_NAME" != "NotebookEdit" && "$TOOL_NAME" != "Edit" ]]; then
    exit 0
fi

if [[ -z "$FILE_PATH" ]]; then
    exit 0
fi

# Check if path is in a location that might be a mistake
SUSPICIOUS_PATTERNS=(
    "/.claude/orchestration/[^/]*\\.md$"  # Files directly in orchestration (should be in temp/ or evidence/)
    "^/tmp/.*\\.(md|json|yaml)$"          # Temp files that should be in project
)

for pattern in "${SUSPICIOUS_PATTERNS[@]}"; do
    if [[ "$FILE_PATH" =~ $pattern ]]; then
        echo -e "${YELLOW}FILE-LOCATION-GUARD: Potentially misplaced file: $FILE_PATH${NC}"
        echo "Consider: .claude/orchestration/temp/ for working files"
        echo "Consider: .claude/orchestration/evidence/ for final artifacts"
        # WARNING ONLY - do not block
        break
    fi
done

# Always allow operation to continue
exit 0
