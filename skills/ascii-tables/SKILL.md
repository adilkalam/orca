---
name: table
description: Markdown table generation with pixel-perfect alignment via mandatory post-processing
---

# ASCII Table Alignment Skill

## THE PROBLEM

LLMs cannot align markdown tables correctly because:

1. **Token-by-token generation** - No spatial awareness during output
2. **Variable character widths** - Even in monospace fonts:
   - CJK characters = 2 cells wide
   - Emoji = variable width
   - Combining characters = 0 width
3. **No backtracking** - Cannot adjust previous output based on later content

**No amount of prompt engineering fixes this.** The problem is fundamental to how LLMs generate text.

---

## THE SOLUTION

Two-phase approach:

1. **Generation Phase** (LLM) - Focus on content, not alignment
2. **Formatting Phase** (Script) - wcwidth-based column alignment

---

## MANDATORY PROTOCOL

<CRITICAL-PROTOCOL>

When generating markdown tables, you MUST follow this protocol:

### Step 1: Generate Table Content

Focus on correctness and completeness. Do NOT waste effort on manual alignment.

```markdown
| Column A | Column B | Column C |
|---|---|---|
| Short | Much longer content here | X |
| Another row | Data | More data |
```

### Step 2: Run Formatter (MANDATORY)

After generating any markdown table, you MUST run:

```bash
python3 ~/.claude/scripts/md-table-formatter.py /path/to/file.md
```

Or for stdin/stdout:

```bash
echo "table content" | python3 ~/.claude/scripts/md-table-formatter.py
```

### Step 3: Verify Output

Check stderr for verification report:

```
TABLE_FORMAT_CHECK:
- Tables processed: N
- Column widths: [W1, W2, W3, ...]
- Status: ALIGNED
```

</CRITICAL-PROTOCOL>

---

## GENERATION GUIDELINES

When creating table content:

1. **Use simple separators** - `|---|---|---|` not `|:---:|:---:|:---:|`
2. **Content first** - Get the data right, formatting comes later
3. **One table at a time** - Easier to verify
4. **Preserve semantics** - Formatter only adjusts spacing

### What the Formatter Does

- Calculates display width of each cell using wcwidth
- Finds maximum width for each column
- Pads cells with spaces to align columns
- Normalizes separator rows

### What the Formatter Does NOT Do

- Change cell content
- Reorder rows/columns
- Add/remove cells
- Touch non-table content

---

## EXAMPLES

### Before Formatting

```markdown
| Name | Description | Price |
|---|---|---|
| Widget | A small widget | $10.00 |
| Super Mega Deluxe Widget Pro | The ultimate widget | $99.99 |
| X | Minimal | $1 |
```

### After Formatting

```markdown
| Name                         | Description          | Price  |
|------------------------------|----------------------|--------|
| Widget                       | A small widget       | $10.00 |
| Super Mega Deluxe Widget Pro | The ultimate widget  | $99.99 |
| X                            | Minimal              | $1     |
```

### Unicode Example (Before)

```markdown
| Language | Greeting | Notes |
|---|---|---|
| English | Hello | Common |
| Japanese | こんにちは | Formal |
| Emoji | Hello! 👋 | Casual |
```

### Unicode Example (After)

```markdown
| Language | Greeting   | Notes  |
|----------|------------|--------|
| English  | Hello      | Common |
| Japanese | こんにちは | Formal |
| Emoji    | Hello! 👋  | Casual |
```

---

## ERROR HANDLING

### No Input Provided

```
Usage: md-table-formatter.py <file.md>
       cat file.md | md-table-formatter.py
```

### Malformed Table

Tables with inconsistent column counts are skipped with a warning:

```
WARNING: Skipping malformed table at line 15 (inconsistent column count)
```

---

## INTEGRATION WITH OTHER SKILLS

- **alignment-verification**: Use TABLE_FORMAT_CHECK pattern for verification output
- **using-loaded-knowledge**: Follow the mandatory protocol pattern (no skipping steps)

---

## WHEN TO APPLY

**ALWAYS apply when:**
- Generating any markdown table
- Editing existing markdown tables
- Copying tables from external sources

**DO NOT SKIP because:**
- "The table is small" - Even 2x2 tables benefit
- "I'll be careful" - Manual alignment always fails
- "It looks okay" - Subjective, not measured

---

## FAILURE MODES THIS PREVENTS

### Failure: Manual Alignment Drift

```
| Name | Age |
|---|---|
| Alice | 30 |
| Bob | 25 |       <-- Looks aligned in editor
| Charlie | 35 |   <-- Breaks in different font
```

### Failure: Copy-Paste Corruption

Tables from external sources have unpredictable spacing. Formatter normalizes them.

### Note: Unicode Width Calculation

CJK characters are 2 cells wide. The formatter uses wcwidth if available, or a pure-Python fallback that handles common cases correctly.

---

## ANTI-PATTERNS (FORBIDDEN)

| Phrase | Why Rejected |
|--------|--------------|
| "I'll align it manually" | Manual alignment always fails across fonts/viewers |
| "Looks aligned to me" | Subjective; run formatter for verification |
| "Too small to matter" | Consistency requires no exceptions |
| "I forgot to run the formatter" | Protocol is MANDATORY, not optional |

---

## VERIFICATION

After formatting, the script reports to stderr:

```
TABLE_FORMAT_CHECK:
- Tables processed: 2
- Table 1: 3 columns, widths [28, 22, 8]
- Table 2: 4 columns, widths [12, 15, 10, 8]
- Status: ALIGNED
```

This format follows the ALIGNMENT_CHECK pattern from alignment-verification skill.

---

## DEPENDENCIES

**Required:**
- Python 3.x (standard library only)

**Optional (for better CJK/emoji support):**
- wcwidth library - install with one of:
  - `pip3 install --user wcwidth` (user install)
  - `pipx install wcwidth` (via pipx)
  - The script works without it using a pure-Python fallback

**Script location:**
- `~/.claude/scripts/md-table-formatter.py`

---

**Last Updated:** 2026-02-04
**Purpose:** Eliminate markdown table misalignment through mandatory post-processing
**Success Metric:** Zero misaligned tables in generated output
