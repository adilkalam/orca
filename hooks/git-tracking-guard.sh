#!/usr/bin/env bash

# Git Tracking Guard - Warns when editing untracked files in critical projects
# Non-blocking: warns but allows operation to continue

# Only check Edit and Write operations
if [[ "${TOOL_NAME:-}" != "Edit" && "${TOOL_NAME:-}" != "Write" ]]; then
    exit 0
fi

# Critical projects that require git tracking awareness
# Add your project paths here
CRITICAL_PROJECTS=(
    "$HOME/ORCA-OS"
    # Add your other projects here, e.g.:
    # "$HOME/my-project"
)

# Extract file path from tool params
FILE_PATH=$(echo "${TOOL_PARAMS:-}" | jq -r '.file_path // ""' 2>/dev/null || echo "")

if [[ -z "$FILE_PATH" ]]; then
    exit 0
fi

# Check if file is in a critical project
PROJECT_ROOT=""
for proj in "${CRITICAL_PROJECTS[@]}"; do
    if [[ "$FILE_PATH" == "$proj"* ]]; then
        PROJECT_ROOT="$proj"
        break
    fi
done

# Not in a critical project, silent pass
if [[ -z "$PROJECT_ROOT" ]]; then
    exit 0
fi

# Check if the project has a git repo
if [[ ! -d "$PROJECT_ROOT/.git" ]]; then
    exit 0
fi

# Get relative path from project root
REL_PATH="${FILE_PATH#$PROJECT_ROOT/}"

# Check if file is tracked by git
cd "$PROJECT_ROOT" 2>/dev/null || exit 0

# git ls-files returns the file if tracked, empty if not
TRACKED=$(git ls-files "$REL_PATH" 2>/dev/null)

# Check if file is in .gitignore
IGNORED=$(git check-ignore "$REL_PATH" 2>/dev/null)

# Colors for warning visibility
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

if [[ -z "$TRACKED" ]]; then
    # File is NOT tracked
    if [[ -n "$IGNORED" ]]; then
        # File is gitignored
        echo -e "${YELLOW}[GIT-GUARD]${NC} File is ${BOLD}.gitignore'd${NC}: $REL_PATH"
        echo -e "${CYAN}  Changes won't be version controlled. Intentional?${NC}"
    else
        # File is untracked (not ignored, just new)
        echo -e "${YELLOW}[GIT-GUARD]${NC} Editing ${BOLD}UNTRACKED${NC} file: $REL_PATH"
        echo -e "${CYAN}  Consider: git add \"$REL_PATH\"${NC}"
    fi
fi

# Always exit 0 - this is a warning, not a blocker
exit 0
