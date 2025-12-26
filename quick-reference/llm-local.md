# Local LLM Setup

Workshop uses local LLM for quality session extraction. Without it, imports use heuristic extraction which produces noisy/fragmented entries.

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

**Keep it running** - vibe.db embeddings and Workshop extraction both need it.

---

## Pull Required Models

```bash
# Embeddings model (required for vibe.db)
ollama pull nomic-embed-text

# Chat model (required for Workshop extraction)
ollama pull mistral

# Verify both installed
ollama list
```

---

## Verify Setup

```bash
# Check server is running
curl -s http://localhost:11434/api/tags | jq -r '.models[].name'

# Should show:
#   nomic-embed-text:latest
#   mistral:latest
```

Done. The `session-end.sh` hook auto-detects Ollama.

---

## Priority Order

```
Session End Hook
    │
    ▼
1. Ollama (port 11434) - if chat model available
    │
    ▼
2. LM Studio (port 1234) - fallback
    │
    ▼
3. Heuristic - no LLM (lowest quality)
```

---

## Ollama Models

| Model | Size | Use |
|-------|------|-----|
| `nomic-embed-text` | 274 MB | vibe.db embeddings (already installed) |
| `mistral` | 4.2 GB | Workshop extraction (INSTALL THIS) |
| `llama3` | 4.7 GB | Alternative chat model |
| `phi3` | 2.2 GB | Smaller/faster option |

```bash
# Install recommended chat model
ollama pull mistral

# Or smaller option
ollama pull phi3
```

---

## Verification

```bash
# Check Ollama is running
curl -s http://localhost:11434/api/tags | grep -o '"name":"[^"]*"'

# Should show both:
#   "name":"nomic-embed-text:latest"  (embeddings)
#   "name":"mistral:latest"           (chat - for Workshop)

# Test Workshop import manually
workshop --workspace .claude/memory import --llm-local --llm-endpoint http://localhost:11434/v1

# Check extraction quality
workshop --workspace .claude/memory recent
```

---

## Manual Import Commands

```bash
# With Ollama (preferred)
workshop --workspace .claude/memory import --llm-local --llm-endpoint http://localhost:11434/v1 --execute

# With LM Studio
workshop --workspace .claude/memory import --llm-local --execute

# Heuristic only (no LLM)
workshop --workspace .claude/memory import --execute

# Preview (no --execute)
workshop --workspace .claude/memory import --llm-local --llm-endpoint http://localhost:11434/v1
```

---

## Troubleshooting

**"heuristic extraction" in session end:**
- No chat model installed. Run: `ollama pull mistral`

**Ollama not detected:**
- Check running: `ollama list`
- Start if needed: `ollama serve`

**Only nomic-embed-text showing:**
- That's for embeddings (vibe.db). You need a chat model too.
- Run: `ollama pull mistral`

---

## Files

| File | Purpose |
|------|---------|
| `hooks/session-end.sh` | Auto-detects Ollama/LM Studio, runs import |
| `.claude/memory/workshop.db` | Where extractions are stored |
| `~/.claude/scripts/vibe-sync.py` | Uses Ollama for embeddings |

---

## Summary

| Component | Ollama Model | Port |
|-----------|--------------|------|
| **vibe.db** (code search) | `nomic-embed-text` | 11434 |
| **Workshop** (session extraction) | `mistral` | 11434 |

Both use Ollama. One install, unified stack.

---

_Last Updated: 2025-12-17_
