#!/bin/bash

# File Location Guard - ALWAYS prompts before creating files
# This hook intercepts ALL file creation and forces location confirmation

set -euo pipefail

# Colors for visibility
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

# Check if this is a file write operation
if [[ "${TOOL_NAME:-}" == "Write" || "${TOOL_NAME:-}" == "NotebookEdit" || "${TOOL_NAME:-}" == "Edit" ]]; then

    # Extract the file path from the operation
    FILE_PATH=$(echo "$TOOL_PARAMS" | jq -r '.file_path // .notebook_path // ""' 2>/dev/null || echo "")

    if [[ -n "$FILE_PATH" ]]; then

        # Check if file is in a protected directory that should always prompt
        PROTECTED_DIRS=(
            ".claude/orchestration"
            ".orchestration"
            "reports"
            "analytics"
            "evidence"
            "docs"
            "commands"
            "agents"
            ".claude"
        )

        # Check if path contains any protected directory
        for dir in "${PROTECTED_DIRS[@]}"; do
            if [[ "$FILE_PATH" == *"/$dir/"* ]] || [[ "$FILE_PATH" == *"/$dir" ]]; then
                echo -e "${RED}${BOLD}🚨 FILE LOCATION GUARD TRIGGERED${NC}"
                echo -e "${YELLOW}Attempting to write to: ${BOLD}$FILE_PATH${NC}"
                echo ""
                echo -e "${BLUE}This location appears to be automatically chosen.${NC}"
                echo -e "${GREEN}Where would you like to save this file instead?${NC}"
                echo ""
                echo -e "${BOLD}Options:${NC}"
                echo "1. Keep current location: $FILE_PATH"
                echo "2. Save to project root: $(basename "$FILE_PATH")"
                echo "3. Save to /tmp/ for review: /tmp/$(basename "$FILE_PATH")"
                echo "4. Custom location (you specify)"
                echo "5. REJECT - Don't create this file"
                echo ""
                echo -e "${RED}${BOLD}BLOCKED: Awaiting your location choice${NC}"
                exit 1
            fi
        done

        # For any new file creation, always confirm location
        if [[ ! -f "$FILE_PATH" ]]; then
            echo -e "${YELLOW}${BOLD}📍 FILE LOCATION CONFIRMATION${NC}"
            echo -e "Creating new file at: ${BOLD}$FILE_PATH${NC}"
            echo ""
            echo -e "${BLUE}Is this the correct location?${NC}"
            echo ""
            echo -e "${BOLD}Options:${NC}"
            echo "1. ✅ Yes, create at: $FILE_PATH"
            echo "2. 🏠 Save to project root instead"
            echo "3. 📁 Save to /tmp/ for review first"
            echo "4. ✏️ Let me specify a custom location"
            echo "5. ❌ CANCEL - Don't create this file"
            echo ""
            echo -e "${YELLOW}Reply with your choice (1-5) or provide a custom path${NC}"
            exit 1
        fi
    fi
fi

# Allow operation to continue if not blocked
exit 0
