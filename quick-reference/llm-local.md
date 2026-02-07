# Local LLM Setup

Local LLM models (Ollama) power code-index.db semantic search embeddings. Session event extraction uses a heuristic approach via the session-end hook -- no LLM is involved in that process.

---

## Install Ollama

**macOS:**
```bash
brew install ollama
```

**Or download directly:** https://ollama.com/download

---

## Launch Ollama

```bash
# Start the Ollama server (runs in background on port 11434)
ollama serve
```

Or launch the Ollama app (macOS menu bar) - it starts the server automatically.

**Keep it running** - code-index.db embeddings need it.

---

## Pull Required Model

```bash
# Embeddings model (required for code-index.db)
ollama pull nomic-embed-text

# Verify installed
ollama list
```

---

## Verify Setup

```bash
# Check server is running
curl -s http://localhost:11434/api/tags | jq -r '.models[].name'

# Should show:
#   nomic-embed-text:latest
```

Done. Ollama is now available for code-index.db embeddings.

---

## Ollama Models

| Model | Size | Use |
|-------|------|-----|
| `nomic-embed-text` | 274 MB | code-index.db embeddings (required) |

---

## Verification

```bash
# Check Ollama is running
curl -s http://localhost:11434/api/tags | grep -o '"name":"[^"]*"'

# Should show:
#   "name":"nomic-embed-text:latest"  (embeddings)
```

---

## Manual Import Commands

```bash
# Import session events (heuristic extraction)
workshop --workspace .claude/memory import --execute

# Preview without executing
workshop --workspace .claude/memory import
```

---

## Troubleshooting

**Ollama not detected:**
- Check running: `ollama list`
- Start if needed: `ollama serve`

**Code-index embeddings not working:**
- Ensure `nomic-embed-text` is pulled: `ollama pull nomic-embed-text`
- Ensure Ollama server is running on port 11434

---

## Files

| File | Purpose |
|------|---------|
| `hooks/session-end.sh` | Saves session events to Workshop via CLI (heuristic extraction) |
| `.claude/memory/workshop.db` | Where extractions are stored |
| `~/.claude/scripts/code-index.py` | Uses Ollama for embeddings |

---

## Summary

| Component | Ollama Model | Port |
|-----------|--------------|------|
| **code-index.db** (code search) | `nomic-embed-text` | 11434 |
| **Workshop** (session extraction) | N/A (heuristic) | N/A |

Ollama is used for code-index embeddings. Session extraction uses heuristic parsing with no LLM dependency.

---

_Last Updated: 2026-02-07_
