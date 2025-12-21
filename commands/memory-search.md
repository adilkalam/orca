---
description: "Unified search across all memory systems (Workshop + vibe.db)"
---

# /memory-search - Unified Memory Search

Search across all memory systems in one command.

**Command:** `/memory-search $ARGUMENTS`

## What It Searches

1. **Workshop** (decisions, notes, gotchas, learnings)
2. **vibe.db** (code chunks, symbols, functions, classes)
3. **Research Index** (if `.claude/scripts/research-sync.py` exists - markdown research docs with semantic search)

## Execution

### Step 1: Parse Query

Extract the search query from arguments. If empty, show help.

### Step 2: Search Workshop

```bash
workshop --workspace .claude/memory search "$QUERY" 2>/dev/null || echo "Workshop: No results or not initialized"
```

### Step 3: Search vibe.db (Code)

```bash
python3 ~/.claude/scripts/vibe-sync.py hsearch "$QUERY" --limit 10 2>/dev/null || echo "vibe.db: No results or not initialized"
```

### Step 4: Search Research Index (if exists)

If `.claude/scripts/research-sync.py` exists in the project, also search research chunks:

```bash
python3 .claude/scripts/research-sync.py search "$QUERY" --limit 10 2>/dev/null || true
```

### Step 5: Present Unified Results

Format the output clearly:

```
Memory Search: "<query>"

=== WORKSHOP (Decisions/Notes) ===

[Results from workshop search, or "No matches found"]

=== CODE (vibe.db) ===

[Results from vibe-sync hsearch, formatted as:]

| Type     | Name              | File                          | Score |
|----------|-------------------|-------------------------------|-------|
| function | handleAuth        | src/auth/jwt.ts:45            | 0.85  |
| class    | AuthService       | src/services/auth.ts:12       | 0.72  |

[Or "No matches found" / "Run /project-code sync first"]

=== RESEARCH (if indexed) ===

[Results from research-sync search, formatted as:]

| Type        | Title                              | Section              | Score |
|-------------|------------------------------------|--------------------- |-------|
| source_note | Sara Roy: If Israel Were Smart    | The WikiLeaks Cable  | 0.85  |
| reflection  | LLM Reflection V6                  | The Apparatus        | 0.72  |

[Or skip section if research-sync.py doesn't exist]
```

## Examples

```
/memory-search authentication
/memory-search "user login"
/memory-search routing
```

## Help

If no query provided:

```
/memory-search - Unified Memory Search

Searches across all memory systems:
  - Workshop: decisions, notes, gotchas, learnings
  - vibe.db: code chunks, symbols, functions, classes

Usage:
  /memory-search <query>

Examples:
  /memory-search authentication
  /memory-search "error handling"
  /memory-search routing

Related commands:
  /project-memory   - Manage Workshop entries
  /project-code     - Manage vibe.db code index
```

## Error Handling

- If Workshop not initialized: Show "Run: /project-memory init"
- If vibe.db not found: Show "Run: /project-code sync"
- If both fail: Show both suggestions
