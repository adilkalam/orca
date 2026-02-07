# Quick Reference: Telemetry (OS 5.1)

**Last Updated:** 2026-01-24
**Version:** OS 5.1

Telemetry tracks pipeline execution for debugging and performance analysis.

---

## What Exists (v1)

| Event | When | Data Captured |
|-------|------|---------------|
| `pipeline_start` | Lane command starts | Domain, task, mode (tweak/default/complex) |
| `gate_result` | Gate completes | Score, decision, issue count |
| `pipeline_end` | Pipeline completes | Status, duration, files modified |

**Notes:**
- `pipeline_start` and `pipeline_end` are emitted by `scripts/utilities/telemetry-emit.sh`.
- `gate_result` events are emitted inline by orchestrator commands (via echo/append to the trace file), not by `telemetry-emit.sh`.
- Delegation events are planned for Phase 2.

---

## Where It's Stored

```
.claude/telemetry/
  sessions/
    trace-nextjs-20260124T143022-a7b3.jsonl   # Event stream (JSONL format)
  index.json                                   # Session lookup
```

**Not committed to git** - add `.claude/telemetry/` to `.gitignore`.

---

## What Triggers It

Telemetry is emitted by orchestrator commands (`/nextjs`, `/ios`, `/expo`, `/django-react`, `/orca-os-dev`, `/shopify`):

```bash
# At pipeline start
{"type": "pipeline_start", "trace_id": "nextjs-20260124T143022-a7b3", "data": {"domain": "nextjs", "task": "add button", "mode": "default"}}

# After each gate runs
{"type": "gate_result", "trace_id": "...", "data": {"gate": "nextjs-standards-enforcer", "score": 87, "decision": "WARN", "issues_count": 3}}

# At pipeline end
{"type": "pipeline_end", "trace_id": "...", "data": {"status": "success", "duration_sec": 45, "files_modified": 3}}
```

---

## Trace ID Format

```
{domain}-{timestamp}-{random}
nextjs-20260124T143022-a7b3
```

The trace ID flows through the entire pipeline.

---

## Viewing Telemetry (Trace Viewer)

Use the trace viewer script for human-readable output:

```bash
# View most recent trace
~/.claude/scripts/telemetry-viewer.sh --recent

# List all available traces
~/.claude/scripts/telemetry-viewer.sh --list

# View specific trace by ID
~/.claude/scripts/telemetry-viewer.sh nextjs-20260124T143022-a7b3
```

**Example output:**

```
=== Trace: nextjs-20260124T143022-a7b3 ===

PIPELINE START: nextjs | default | add dark mode toggle

GATES:
  nextjs-standards-enforcer: 87 [WARN] (3 issues)
  nextjs-design-reviewer: 92 [PASS] (0 issues)

PIPELINE END: success | 45s | 3 files
```

**Requirements:** The viewer requires `jq` for JSON parsing.

---

## Debugging Failed Pipelines

When a pipeline fails, the orchestrator outputs a viewer hint:

```
Debug with: ~/.claude/scripts/telemetry-viewer.sh <trace-id>
```

Use this to see gate scores and identify what failed.

---

## Retention

| Data | Kept For |
|------|----------|
| Session traces | 7 days |

Cleanup runs via `scripts/telemetry-cleanup.sh`.

---

## Initialization

The `session-start.sh` hook creates the telemetry structure:

```bash
mkdir -p .claude/telemetry/sessions
```

---

## Planned (Phase 2)

The following features are planned for future implementation:

- **Delegation auto-capture:** Hook-based tracking of agent-to-agent delegations
- **File change tracking:** Track which files are modified during pipelines
- **Metrics aggregation:** Daily/weekly gate score trends
- **Session summaries:** JSON summary with complexity signals
- **Smart Router training:** Use telemetry data to improve `/plan` routing

---

*Part of ORCA OS 5.1*
