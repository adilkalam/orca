# ORCA-OS Scripts

Core scripts that power ORCA-OS functionality.

---

## Root Scripts

| Script | Purpose |
|--------|---------|
| `code-index.py` | Code and documentation index (code-index.db) |
| `memory-search-unified.py` | Unified search across memory systems |
| `reflect-analyze.py` | Analyze patterns from session history (`/reflect`) |
| `reflect-apply.py` | Apply learned patterns to CLAUDE.md (`/reflect`) |
| `telemetry-emit.sh` | Emit telemetry events |
| `telemetry-cleanup.sh` | Clean old telemetry data |
| `validate-design-review-evidence.sh` | Validate design review evidence files |

---

## `/utilities/` - Utility Scripts

General-purpose utilities for development workflows.

| Script | Purpose |
|--------|---------|
| `capture-screenshot.sh` | Capture screenshots for evidence |
| `capture-browser.sh` | Capture browser state |
| `capture-build.sh` | Capture build output |
| `capture-simulator.sh` | Capture iOS simulator state |
| `capture-tests.sh` | Capture test results |
| `evidence-utils.sh` | Evidence collection helpers |
| `eval-run.sh` | Run evaluations |
| `perf-log.sh` | Log performance metrics |
| `perf-report.sh` | Generate performance reports |
| `quick-confirm.sh` | Quick confirmation prompts |
| `test-enforcement.sh` | Enforce test requirements |
| `verify-file-organization.sh` | Verify file structure |
| `install-git-hooks.sh` | Install git hooks |
| `md-to-pdf.sh` | Convert Markdown to PDF |

---

## Usage Examples

### Memory & Search
```bash
# Sync code to code-index.db
python3 scripts/code-index.py sync

# Search across memory systems
python3 scripts/memory-search-unified.py "search query"
```

### Reflection System
```bash
# Analyze patterns from recent sessions
python3 scripts/reflect-analyze.py

# Apply learned patterns
python3 scripts/reflect-apply.py
```

### Utilities
```bash
# Capture screenshot evidence
bash scripts/utilities/capture-screenshot.sh

# Convert markdown to PDF
bash scripts/utilities/md-to-pdf.sh docs/my-doc.md
```

---

## Dependencies

- **Python 3.8+** for `.py` scripts
- **Bash** for `.sh` scripts
- **Ollama** (optional) for local LLM embeddings in code-index

See `quick-reference/llm-local.md` for Ollama setup.
