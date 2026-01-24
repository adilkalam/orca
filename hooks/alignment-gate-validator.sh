#!/usr/bin/env bash
# alignment-gate-validator.sh
# Validates alignment claims have zero-tolerance measurement data
# Used by design QA gates to enforce alignment verification protocol

GATE_OUTPUT="$1"

if [ -z "$GATE_OUTPUT" ] || [ ! -f "$GATE_OUTPUT" ]; then
  echo "Usage: alignment-gate-validator.sh <gate_output_file>"
  exit 1
fi

# Patterns that indicate alignment claims
ALIGNMENT_CLAIMS=(
  "centered"
  "aligned"
  "in line"
  "in-line"
  "same height"
  "same width"
  "equal spacing"
  "evenly spaced"
  "horizontally centered"
  "vertically centered"
)

# Forbidden tolerance language (zero tolerance policy)
FORBIDDEN_PATTERNS=(
  "within tolerance"
  "close enough"
  "approximately"
  "roughly aligned"
  "roughly centered"
  "acceptable deviation"
  "within [0-9]+ ?px"
  "tolerance:"
  "acceptable margin"
)

# Check for forbidden tolerance language FIRST
for pattern in "${FORBIDDEN_PATTERNS[@]}"; do
  if grep -qiE "$pattern" "$GATE_OUTPUT"; then
    echo "BLOCKED: Found forbidden tolerance language matching '$pattern'"
    echo ""
    echo "Alignment is BINARY. There is no tolerance."
    echo "Report exact measurements. ALIGNED: YES (0px) or ALIGNED: NO (exact deviation)."
    exit 1
  fi
done

# Check if any alignment claims exist
HAS_ALIGNMENT_CLAIM=false
FOUND_CLAIM=""
for claim in "${ALIGNMENT_CLAIMS[@]}"; do
  if grep -qi "$claim" "$GATE_OUTPUT"; then
    HAS_ALIGNMENT_CLAIM=true
    FOUND_CLAIM="$claim"
    break
  fi
done

# If alignment claim exists, require ALIGNMENT_CHECK block
if [ "$HAS_ALIGNMENT_CLAIM" = true ]; then
  if ! grep -q "ALIGNMENT_CHECK:" "$GATE_OUTPUT"; then
    echo "BLOCKED: Found alignment claim ('$FOUND_CLAIM') without ALIGNMENT_CHECK block"
    echo ""
    echo "All alignment claims require measurement data."
    echo "Include an ALIGNMENT_CHECK block with:"
    echo "  - Task: [what alignment]"
    echo "  - Type: [alignment type]"
    echo "  - Elements measured: [with pixel values]"
    echo "  - ALIGNED: YES/NO"
    echo "  - Max deviation: Xpx"
    exit 1
  fi
  
  # Validate required fields in ALIGNMENT_CHECK
  REQUIRED_FIELDS=("Task:" "Type:" "ALIGNED:" "Max deviation:")
  for field in "${REQUIRED_FIELDS[@]}"; do
    if ! grep -q "$field" "$GATE_OUTPUT"; then
      echo "BLOCKED: ALIGNMENT_CHECK missing required field: $field"
      exit 1
    fi
  done
  
  # Ensure ALIGNED is YES or NO, not qualified
  if grep -qiE "ALIGNED:.*\b(maybe|possibly|probably|approximately|roughly|almost)\b" "$GATE_OUTPUT"; then
    echo "BLOCKED: ALIGNED must be YES or NO, not qualified"
    echo ""
    echo "Alignment is binary. Either elements are in line (YES) or they're not (NO)."
    exit 1
  fi
  
  echo "PASS: Alignment claims properly documented with ALIGNMENT_CHECK block"
else
  echo "PASS: No alignment claims found (no verification needed)"
fi

exit 0
