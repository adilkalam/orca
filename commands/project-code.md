---
description: "Manage code context (vibe.db). Subcommands: status, sync, search, symbol, files, docs"
---

# Code Context Management (vibe.db)

Parse the user's command to determine which action to take:

**Command:** `/project-code $ARGUMENTS`

## What is vibe.db?

vibe.db stores **code intelligence** for your project:
- **Code chunks** - Functions, classes, methods with their code
- **Symbols** - Extracted function/class names for fast lookup
- **Embeddings** - Semantic vectors for similarity search (when enabled)

This is separate from Workshop (session memory for decisions/gotchas).

## Subcommand Routing

### 1. Status (default, no args, or `status`)
**Trigger:** `/project-code` or `/project-code status`

Show vibe.db status:

```bash
if [ -f ".claude/memory/vibe.db" ]; then
    echo "vibe.db: .claude/memory/vibe.db"
    python3 ~/.claude/scripts/vibe-sync.py status
else
    echo "vibe.db: Not initialized"
    echo ""
    echo "Run: /project-code sync"
fi
```

---

### 2. Sync Code (`sync`)
**Trigger:** `/project-code sync`

Index/sync code into vibe.db:

```bash
python3 ~/.claude/scripts/vibe-sync.py sync
```

Show the sync results. If it's the first sync, this will create the database.

---

### 3. Initialize (`init`)
**Trigger:** `/project-code init`

Initialize vibe.db (same as sync but explicit):

```bash
python3 ~/.claude/scripts/vibe-sync.py init
```

---

### 4. Hybrid Search (`search <query>`)
**Trigger:** `/project-code search <query>`

Search code using hybrid search (semantic + symbol + fulltext):

```bash
python3 ~/.claude/scripts/vibe-sync.py hsearch "<query>" --limit 10
```

Display results clearly with file paths, symbol names, and relevance scores.

---

### 5. Symbol Search (`symbol <name>`)
**Trigger:** `/project-code symbol <name>`

Fast lookup by function/class name:

```bash
python3 ~/.claude/scripts/vibe-sync.py symbol "<name>" --limit 10
```

---

### 6. Find Files (`files <pattern>`)
**Trigger:** `/project-code files <pattern>`

Search for files matching a pattern in the index:

```bash
python3 ~/.claude/scripts/vibe-sync.py search "<pattern>" --limit 20
```

---

### 7. Library Docs (`docs <library> [topic]`)
**Trigger:** `/project-code docs <library>` or `/project-code docs <library> <topic>`

Fetch external library documentation from Context7.

**Step 1: Search for libraries**

Call `mcp__context7__resolve-library-id` with the library name.

**Step 2: Present results in table format**

Display ALL matching libraries in a table:

```
Library Documentation Search: "<library>"


| # | Library ID              | Snippets | Score | Reputation | Description           |
|---|-------------------------|----------|-------|------------|-----------------------|
| 1 | /vercel/next.js         | 1,847    | 95    | High       | React framework       |
| 2 | /vercel/next.js/v14.0.0 | 1,203    | 88    | High       | Next.js v14 specific  |
| 3 | /nextjs/docs            | 892      | 72    | Medium     | Community docs        |

Which library to fetch? (Enter number, or 'cancel')
```

**Step 3: Wait for user confirmation**

Use AskUserQuestion to let user pick which library (by number) to fetch.

**Step 4: Fetch documentation**

Once confirmed, call `mcp__context7__get-library-docs` with:
- `context7CompatibleLibraryID`: The selected library ID
- `topic`: The topic from the command (if provided)
- `mode`: "code" for API/examples, "info" for conceptual guides

Display the fetched documentation clearly formatted.

**Examples:**
- `/project-code docs next.js` → Search, show table, confirm, fetch general docs
- `/project-code docs expo camera` → Search for "expo", confirm, fetch with topic "camera"
- `/project-code docs swiftui navigation` → Search for "swiftui", confirm, fetch navigation docs

---

### 8. Help (`help` or `--help`)
**Trigger:** `/project-code help`

Show available subcommands:

```
Code Context Commands (/project-code)


Local Code (vibe.db):
  /project-code                   Show vibe.db status
  /project-code sync              Index code into vibe.db
  /project-code search <query>    Hybrid search (semantic + symbol + fulltext)
  /project-code symbol <name>     Fast symbol lookup (function/class names)
  /project-code files <pattern>   Search indexed files

External Docs (Context7):
  /project-code docs <library>           Search & fetch library documentation
  /project-code docs <library> <topic>   Fetch docs for specific topic

Architecture:
  vibe.db stores CODE INTELLIGENCE (chunks, symbols, embeddings)
  Workshop stores SESSION MEMORY (decisions, gotchas, learnings)
  Context7 provides LIBRARY DOCUMENTATION (external packages/frameworks)

Examples:
  /project-code sync                    # Index your codebase
  /project-code search "user auth"      # Find auth-related code
  /project-code symbol createUser       # Find createUser function
  /project-code docs next.js routing    # Fetch Next.js routing docs
  /project-code docs expo camera        # Fetch Expo camera docs
```

---

## Error Handling

- If vibe-sync.py not found: Show path `~/.claude/scripts/vibe-sync.py`
- If vibe.db doesn't exist: Suggest `/project-code sync`
- If search returns no results: Suggest different query or sync first
