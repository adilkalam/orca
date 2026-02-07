#!/usr/bin/env python3
"""
md-table-formatter.py
=====================

Format markdown tables with pixel-perfect column alignment using wcwidth
for accurate character width calculation.

Intended install location:
  ~/.claude/scripts/md-table-formatter.py

Usage:
  # File mode (modifies in-place)
  python3 ~/.claude/scripts/md-table-formatter.py path/to/file.md

  # Stdin mode (outputs to stdout)
  cat file.md | python3 ~/.claude/scripts/md-table-formatter.py

Features:
  - Uses wcwidth for accurate display width (handles CJK, emoji, etc.)
  - Falls back to pure-Python width calculation if wcwidth not installed
  - Processes multiple tables per file
  - Preserves non-table content unchanged
  - Reports verification to stderr

Exit codes:
  0 - Success
  1 - Error (no input, file not found, etc.)
"""

from __future__ import annotations

import re
import sys
import unicodedata
from pathlib import Path
from typing import List, Tuple

# Try to import wcwidth, fall back to pure-Python implementation
_USE_WCWIDTH = False
try:
    from wcwidth import wcswidth, wcwidth as wc
    _USE_WCWIDTH = True
except ImportError:
    pass


def _fallback_char_width(char: str) -> int:
    """
    Pure-Python fallback for character width calculation.
    Handles common cases without external dependencies.
    """
    if len(char) != 1:
        return sum(_fallback_char_width(c) for c in char)

    # ASCII printable characters
    code = ord(char)
    if 0x20 <= code < 0x7F:
        return 1

    # Control characters
    if code < 0x20 or code == 0x7F:
        return 0

    # Use Unicode East Asian Width property
    ea = unicodedata.east_asian_width(char)

    # Wide (W) and Fullwidth (F) characters are width 2
    if ea in ('W', 'F'):
        return 2

    # Ambiguous (A) - treat as 1 in Western context
    # Narrow (Na), Halfwidth (H), Neutral (N) - width 1

    # Check for combining characters (zero width)
    category = unicodedata.category(char)
    if category in ('Mn', 'Mc', 'Me'):  # Mark, Nonspacing/Spacing Combining/Enclosing
        return 0

    # Default to 1
    return 1


def display_width(text: str) -> int:
    """
    Calculate the display width of a string.

    Uses wcwidth if available, otherwise falls back to pure-Python implementation.

    Handles:
    - CJK characters (width 2)
    - Combining characters (width 0)
    - Control characters (width 0)
    - Regular ASCII (width 1)
    """
    if _USE_WCWIDTH:
        # wcswidth returns -1 if string contains non-printable chars
        w = wcswidth(text)
        if w >= 0:
            return w

        # Fallback: sum individual character widths
        total = 0
        for char in text:
            cw = wc(char)
            if cw >= 0:
                total += cw
        return total
    else:
        # Pure-Python fallback
        return sum(_fallback_char_width(char) for char in text)


def pad_to_width(text: str, target_width: int) -> str:
    """Pad a string with spaces to achieve the target display width."""
    current_width = display_width(text)
    padding_needed = target_width - current_width
    if padding_needed > 0:
        return text + ' ' * padding_needed
    return text


def is_table_line(line: str) -> bool:
    """Check if a line is part of a markdown table."""
    stripped = line.strip()
    return stripped.startswith('|') and stripped.endswith('|')


def is_separator_line(line: str) -> bool:
    """Check if a line is a table separator (|---|---|)."""
    stripped = line.strip()
    if not (stripped.startswith('|') and stripped.endswith('|')):
        return False
    # Remove pipes and check if only dashes, colons, and spaces remain
    content = stripped[1:-1]
    cells = content.split('|')
    for cell in cells:
        cell = cell.strip()
        # Valid separator cell: dashes with optional colons for alignment
        if not re.match(r'^:?-+:?$', cell):
            return False
    return True


def parse_table_row(line: str) -> List[str]:
    """Parse a table row into cells, stripping whitespace."""
    stripped = line.strip()
    # Remove leading and trailing pipes
    if stripped.startswith('|'):
        stripped = stripped[1:]
    if stripped.endswith('|'):
        stripped = stripped[:-1]
    
    # Split by pipe and strip each cell
    cells = [cell.strip() for cell in stripped.split('|')]
    return cells


def format_table(lines: List[str]) -> Tuple[List[str], List[int]]:
    """
    Format a markdown table with aligned columns.
    
    Returns:
        Tuple of (formatted_lines, column_widths)
    """
    if not lines:
        return [], []
    
    # Parse all rows
    rows: List[List[str]] = []
    separator_indices: List[int] = []
    
    for i, line in enumerate(lines):
        if is_separator_line(line):
            separator_indices.append(i)
            rows.append([])  # Placeholder for separator
        else:
            rows.append(parse_table_row(line))
    
    # Check for consistent column count
    column_counts = [len(row) for row in rows if row]  # Exclude empty (separator) rows
    if not column_counts:
        return lines, []
    
    # Use maximum column count (some rows might have fewer)
    num_columns = max(column_counts)
    
    # Normalize rows to have same column count
    for i, row in enumerate(rows):
        if row:  # Not a separator
            while len(row) < num_columns:
                row.append('')
    
    # Calculate max width for each column
    column_widths: List[int] = [0] * num_columns
    for row in rows:
        if row:  # Not a separator
            for j, cell in enumerate(row):
                if j < num_columns:
                    w = display_width(cell)
                    column_widths[j] = max(column_widths[j], w)
    
    # Ensure minimum width of 3 for readability
    column_widths = [max(w, 3) for w in column_widths]
    
    # Format output
    formatted: List[str] = []
    
    for i, row in enumerate(rows):
        if i in separator_indices:
            # Build separator line (add 2 for the spaces around cell content)
            sep_parts = ['|']
            for w in column_widths:
                sep_parts.append('-' * (w + 2))
                sep_parts.append('|')
            formatted.append(''.join(sep_parts))
        else:
            # Build data row
            parts = ['|']
            for j, cell in enumerate(row):
                if j < num_columns:
                    padded = pad_to_width(cell, column_widths[j])
                    parts.append(' ' + padded + ' ')
                    parts.append('|')
            formatted.append(''.join(parts))
    
    return formatted, column_widths


def extract_tables(content: str) -> List[Tuple[int, int, List[str]]]:
    """
    Extract all markdown tables from content.
    
    Returns:
        List of (start_line, end_line, table_lines) tuples
    """
    lines = content.split('\n')
    tables: List[Tuple[int, int, List[str]]] = []
    
    i = 0
    while i < len(lines):
        if is_table_line(lines[i]):
            # Found start of a table
            start = i
            table_lines = [lines[i]]
            i += 1
            
            # Collect all consecutive table lines
            while i < len(lines) and is_table_line(lines[i]):
                table_lines.append(lines[i])
                i += 1
            
            # Only consider it a table if it has at least 2 lines (header + separator or data)
            if len(table_lines) >= 2:
                tables.append((start, i - 1, table_lines))
        else:
            i += 1
    
    return tables


def format_content(content: str) -> Tuple[str, List[dict]]:
    """
    Format all markdown tables in content.
    
    Returns:
        Tuple of (formatted_content, table_info_list)
    """
    tables = extract_tables(content)
    
    if not tables:
        return content, []
    
    lines = content.split('\n')
    table_info: List[dict] = []
    
    # Process tables in reverse order to preserve line numbers
    for start, end, table_lines in reversed(tables):
        formatted_lines, column_widths = format_table(table_lines)
        
        if formatted_lines:
            # Replace original lines with formatted ones
            lines[start:end + 1] = formatted_lines
            table_info.insert(0, {
                'line': start + 1,  # 1-indexed for human readability
                'columns': len(column_widths),
                'widths': column_widths,
            })
    
    return '\n'.join(lines), table_info


def print_verification(table_info: List[dict], file=sys.stderr) -> None:
    """Print verification report to stderr."""
    print("\nTABLE_FORMAT_CHECK:", file=file)
    print(f"- Tables processed: {len(table_info)}", file=file)
    
    for i, info in enumerate(table_info, 1):
        print(f"- Table {i}: {info['columns']} columns, widths {info['widths']}", file=file)
    
    status = "ALIGNED" if table_info else "NO_TABLES"
    print(f"- Status: {status}", file=file)


def print_usage() -> None:
    """Print usage information."""
    print("""Usage: md-table-formatter.py <file.md>
       cat file.md | md-table-formatter.py

Format markdown tables with pixel-perfect column alignment.

Options:
  <file.md>  - Format tables in file (modifies in-place)
  (stdin)    - Read from stdin, write to stdout

Examples:
  python3 md-table-formatter.py README.md
  echo '| A | B |\\n|---|---|\\n| 1 | 2 |' | python3 md-table-formatter.py
""", file=sys.stderr)


def main() -> int:
    # Determine input mode
    if len(sys.argv) > 1:
        # File mode
        file_path = Path(sys.argv[1])
        
        if sys.argv[1] in ('-h', '--help'):
            print_usage()
            return 0
        
        if not file_path.exists():
            print(f"ERROR: File not found: {file_path}", file=sys.stderr)
            return 1
        
        content = file_path.read_text(encoding='utf-8')
        formatted, table_info = format_content(content)
        
        # Write back to file
        file_path.write_text(formatted, encoding='utf-8')
        
        print_verification(table_info)
        print(f"\nFormatted: {file_path}", file=sys.stderr)
        
    elif not sys.stdin.isatty():
        # Stdin mode
        content = sys.stdin.read()
        formatted, table_info = format_content(content)
        
        # Output to stdout
        print(formatted)
        
        # Verification to stderr
        print_verification(table_info)
        
    else:
        # No input
        print_usage()
        return 1
    
    return 0


if __name__ == '__main__':
    sys.exit(main())
