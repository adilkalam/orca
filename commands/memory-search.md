---
description: "Federated search across all memory stores (Workshop, code-index.db, cognition harvests, auto-memory, Learned Rules, recording)"
argument-hint: "<query>"
---

# /memory-search - Unified Memory Search

Search across all memory systems in one command.

**Command:** `/memory-search $ARGUMENTS`

## What It Searches (federated)

The unified script federates across every durable memory store, so a "why did we
choose X" answer surfaces regardless of which store it lives in:

1. **Workshop** (decisions, notes, gotchas, learnings) -- via the `workshop` CLI
2. **code-index.db** (code chunks, symbols, functions, classes)
3. **Cognition harvests** (`.orca/cognition/**` -- cognition session summaries)
4. **Claude auto-memory** (`~/.claude/projects/<slug>/memory/MEMORY.md` + linked files)
5. **CLAUDE.md Learned Rules** ledger
6. **orca-record checkpoints** (prompt summaries from `.orca/recording.db`)
7. **Research Index** (optional, if the project has a research-sync script)

## Execution

### Step 1: Parse Query

Extract the search query from arguments. If empty, show help.

### Step 2: Federated search (primary)

The unified script covers Workshop + code-index.db + cognition + auto-memory + Learned
Rules + recording in one call:

```bash
python3 ~/.claude/scripts/memory-search-unified.py "$QUERY" --mode all --top-k 10 2>/dev/null \
  || echo "unified search unavailable"
```

### Step 4: Search Research Index (if exists)

If the project has a research-sync script (e.g., `.claude/scripts/research-sync.py`), also search research chunks:

```bash
# Only run if research-sync script exists in the project
if [ -f .claude/scripts/research-sync.py ]; then
  python3 .claude/scripts/research-sync.py search "$QUERY" --limit 10 2>/dev/null || true
fi
```

### Step 5: Present Unified Results

Format the output clearly:

```
Memory Search: "<query>"

=== WORKSHOP (Decisions/Notes) ===

[Results from workshop search, or "No matches found"]

=== CODE (code-index.db) ===

[Results from code-index hsearch, formatted as:]

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
  - code-index.db: code chunks, symbols, functions, classes

Usage:
  /memory-search <query>

Examples:
  /memory-search authentication
  /memory-search "error handling"
  /memory-search routing

Related commands:
  /project-memory   - Manage Workshop entries
  /project-code     - Manage code-index.db code index
```

## Error Handling

- If Workshop not initialized: Show "Run: /project-memory init"
- If code-index.db not found: Show "Run: /project-code sync"
- If both fail: Show both suggestions
