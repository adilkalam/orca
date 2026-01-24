#!/usr/bin/env bash
# Auto-deploy hook for ORCA-OS
# Triggers after Edit/Write to deployable directories
# Syncs changes to ~/.claude automatically
#
# SACRED DEPLOYMENT LAWS:
# 1. NEVER deploy to ~/.claude root - ALWAYS to subdirectories
# 2. NEVER deploy archive or deprecated files
# 3. NEVER create archive/deprecated in ~/.claude

# Read JSON from stdin (Claude Code passes hook data via stdin, not args)
HOOK_INPUT=$(cat)

# Extract tool name and file path from JSON
TOOL_NAME=$(echo "$HOOK_INPUT" | jq -r '.tool_name // empty')
FILE_PATH=$(echo "$HOOK_INPUT" | jq -r '.tool_input.file_path // empty')

# Fallback to args for manual testing
if [[ -z "$TOOL_NAME" ]]; then
    TOOL_NAME="$1"
fi
if [[ -z "$FILE_PATH" ]]; then
    FILE_PATH="$2"
fi

# Only run for Edit or Write tools
if [[ "$TOOL_NAME" != "Edit" && "$TOOL_NAME" != "Write" && "$TOOL_NAME" != "MultiEdit" ]]; then
    exit 0
fi

# Check if the file is in a deployable directory
DEPLOYABLE_DIRS="agents commands docs hooks quick-reference scripts skills"
SHOULD_DEPLOY=false

for dir in $DEPLOYABLE_DIRS; do
    if [[ "$FILE_PATH" == *"/ORCA-OS/$dir/"* ]]; then
        SHOULD_DEPLOY=true
        DEPLOY_DIR="$dir"
        break
    fi
done

if [[ "$SHOULD_DEPLOY" != "true" ]]; then
    exit 0
fi

# Deploy the specific directory
# Note: ORCA_OS_PATH should be set in your environment, or defaults to ~/ORCA-OS
ORCA_OS_PATH="${ORCA_OS_PATH:-$HOME/ORCA-OS}"
SOURCE="$ORCA_OS_PATH/$DEPLOY_DIR/"
DEST="$HOME/.claude/$DEPLOY_DIR/"

# SAFEGUARD: Skip if deploying archive/deprecated files (warning only, no block)
if [[ "$FILE_PATH" == *"archive"* ]] || [[ "$FILE_PATH" == *"deprecated"* ]]; then
    echo "WARNING: Skipping archive/deprecated file - not deployed"
    exit 0
fi

# SAFEGUARD: Ensure DEST is a subdirectory, not root (warning only, no block)
if [[ "$DEST" == "$HOME/.claude/" ]] || [[ -z "$DEPLOY_DIR" ]]; then
    echo "WARNING: Cannot deploy to ~/.claude root - skipping"
    exit 0
fi

rsync -av --exclude='.archive' --exclude='.archived' --exclude='_archive' --exclude='archive/' --exclude='*deprecated*' "$SOURCE" "$DEST" 2>/dev/null

if [[ $? -eq 0 ]]; then
    echo "AUTO-DEPLOYED: $DEPLOY_DIR/ -> ~/.claude/$DEPLOY_DIR/"
else
    echo "WARNING: Deploy failed for $DEPLOY_DIR/ - continuing anyway"
fi

# Always exit 0 to not block Claude operations
exit 0
