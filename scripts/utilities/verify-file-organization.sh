#!/usr/bin/env bash

# File Organization Verification Script
# Ensures main folder and docs/ folder follow strict rules

set -euo pipefail

echo "🔍 Verifying file organization..."
echo ""

ERRORS=0

# Check main folder - should ONLY have README, QUICK_REFERENCE, CHANGELOG
echo "Checking main folder..."
cd "$(dirname "$0")/.."

ALLOWED_MAIN="README.md QUICK_REFERENCE.md CHANGELOG.md"
for file in *.md; do
  if [[ ! " $ALLOWED_MAIN " =~ " $file " ]]; then
    echo "❌ Unexpected markdown file in main folder: $file"
    echo "   Only allowed: $ALLOWED_MAIN"
    ERRORS=$((ERRORS + 1))
  fi
done

if [ $ERRORS -eq 0 ]; then
  echo "✅ Main folder clean (only README, QUICK_REFERENCE, CHANGELOG)"
fi

echo ""

# Check docs/ for logs and temporary files
echo "Checking docs/ for forbidden files..."

# Check for completion logs
if ls docs/*-COMPLETE.md 2>/dev/null; then
  echo "❌ Found completion logs in docs/:"
  ls docs/*-COMPLETE.md
  echo "   Completion logs should be deleted (they're temporary session summaries)"
  ERRORS=$((ERRORS + 1))
fi

# Check for session logs
if ls docs/session-*.md 2>/dev/null; then
  echo "❌ Found session logs in docs/:"
  ls docs/session-*.md
  echo "   Session logs should be deleted or gitignored"
  ERRORS=$((ERRORS + 1))
fi

# Check for diagram temporary files
if ls docs/.diagram-*.md 2>/dev/null; then
  echo "❌ Found diagram temporary files in docs/:"
  ls docs/.diagram-*.md
  echo "   Diagram files should be deleted (temporary work files)"
  ERRORS=$((ERRORS + 1))
fi

# Check for .log files
if ls docs/*.log 2>/dev/null; then
  echo "❌ Found .log files in docs/:"
  ls docs/*.log
  echo "   Log files don't belong in documentation folder"
  ERRORS=$((ERRORS + 1))
fi

# Check for .txt files (usually temporary)
if ls docs/*.txt 2>/dev/null; then
  echo "❌ Found .txt files in docs/:"
  ls docs/*.txt
  echo "   Text files should be converted to markdown or deleted"
  ERRORS=$((ERRORS + 1))
fi

if [ $ERRORS -eq 0 ]; then
  echo "✅ docs/ folder clean (no logs, no temporary files)"
fi

echo ""

# Final result
if [ $ERRORS -eq 0 ]; then
  echo "✅ File organization verified successfully"
  exit 0
else
  echo "❌ File organization verification FAILED ($ERRORS errors)"
  echo ""
  echo "Fix these issues before claiming task complete."
  exit 1
fi
