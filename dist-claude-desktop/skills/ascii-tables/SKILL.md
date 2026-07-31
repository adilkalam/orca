---
name: ascii-tables
description: Produce pixel-perfect, correctly aligned markdown tables by running a post-processing formatter script after generating table content. Use whenever you are about to output, edit, or paste in a markdown table — LLMs cannot align table columns correctly by generating them token-by-token.
---

# ASCII Table Alignment

## The problem

Models cannot align markdown tables correctly during generation: no spatial awareness across tokens, variable character widths (CJK = 2 cells, emoji = variable, combining marks = 0), and no backtracking. Manual alignment always drifts.

## The solution

Two phases:
1. **Generation** — write the table content, don't waste effort on manual spacing.
2. **Formatting** — run the bundled `scripts/md-table-formatter.py` script, which uses `wcwidth`-aware column-width calculation to pad every cell correctly.

## Protocol

1. Generate the table normally, using simple separators (`|---|---|---|`, not `|:---:|:---:|`).
2. In the code-execution environment, run:
   ```bash
   python3 scripts/md-table-formatter.py /path/to/file.md
   ```
   or, for inline content:
   ```bash
   echo "$TABLE_CONTENT" | python3 scripts/md-table-formatter.py
   ```
3. Check the `TABLE_FORMAT_CHECK` report the script prints to stderr (tables processed, column widths, status `ALIGNED`).
4. Use the formatted output as the final table.

If the code-execution environment is unavailable in a given conversation (e.g. Skills aren't enabled), fall back to generating the table as cleanly as possible and note that exact alignment couldn't be verified.

## What the formatter does / does not do

Does: calculate display width per cell (wcwidth if installed, pure-Python Unicode-East-Asian-Width fallback otherwise), pad cells to the max column width, normalize separator rows.

Does not: change cell content, reorder rows/columns, add/remove cells, touch non-table content.

## When to apply

Always, for any markdown table you generate or edit — including small ones. "It looks aligned" is not a substitute for running the formatter; alignment that looks right in one font/viewer breaks in another.
