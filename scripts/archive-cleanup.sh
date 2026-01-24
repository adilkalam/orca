#!/bin/bash
# scripts/archive-cleanup.sh
# ORCA-Mem: Remove archives older than 7 days
# Run via cron: 0 3 * * * ~/.claude/scripts/archive-cleanup.sh

set -uo pipefail

ARCHIVE_DIR="${HOME}/.claude/archives"
RETENTION_DAYS=7

if [ -d "$ARCHIVE_DIR" ]; then
  # Find and remove date directories older than retention period
  find "$ARCHIVE_DIR" -type d -mtime +$RETENTION_DAYS -exec rm -rf {} + 2>/dev/null || true
  
  # Also clean up any orphaned files
  find "$ARCHIVE_DIR" -type f -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
  
  echo "Cleaned archives older than $RETENTION_DAYS days"
  
  # Show current usage
  if [ -d "$ARCHIVE_DIR" ]; then
    USAGE=$(du -sh "$ARCHIVE_DIR" 2>/dev/null | cut -f1) || USAGE="unknown"
    COUNT=$(find "$ARCHIVE_DIR" -type f -name "*.txt" 2>/dev/null | wc -l | tr -d ' ') || COUNT=0
    echo "Archive stats: $USAGE total, $COUNT files"
  else
    echo "Archive dir empty or missing"
  fi
else
  echo "Archive directory does not exist: $ARCHIVE_DIR"
fi

exit 0
