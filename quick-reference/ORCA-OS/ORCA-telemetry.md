# Quick Reference: Telemetry and Recording (OS 6.2)

**Last Updated:** 2026-02-16
**Version:** OS 6.2
**Status:** ACTIVE via recording layer (manual telemetry deprecated)

## Recording Layer (Active)

Session activity is captured automatically by the **orca-record** recording layer
via Claude Code hooks. The recording database (`.orca/recording.db`) stores session
history, prompts, file changes, and checkpoints.

### Recording Context Injection in Commands

OS 6.2 commands inject prior session context from the recording layer before
delegating to agents. This follows **Pattern A (command-layer injection)**:

**Flow:**
1. `/orca` queries `recording_query` for prior sessions related to the task
2. `/orca` calls `recording_explain` on the most relevant session
3. The narrative summary (max 500 chars) is passed as `RECORDING_CONTEXT`
4. Domain grand-architects receive this context in their delegation prompt

**Domain commands** (`/nextjs`, `/ios`, `/expo`, `/shopify`, `/django-react`,
`/orca-os-dev`, `/seo`) check for inherited `RECORDING_CONTEXT` first. If not
present (direct invocation without `/orca`), they query `.orca/recording.db`
independently.

**Key constraint:** Recording context is always OPTIONAL. Every guard checks
for `.orca/recording.db` existence first. Projects without the recording layer
skip silently.

### Operations Used

| Operation | Purpose |
|-----------|---------|
| `recording_query` | Find prior sessions by files, limit, state |
| `recording_explain` | Get narrative summary of a specific session |

## Legacy Telemetry (Deprecated)

Manual telemetry has been fully removed from all lane command files.
Legacy telemetry scripts (`telemetry-emit.sh`, `telemetry-viewer.sh`) remain in
`scripts/` for backward compatibility but are no longer invoked by any pipeline.

The section below is kept as historical reference only.

---

Telemetry previously tracked pipeline execution for debugging and performance analysis.

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

Telemetry is emitted by orchestrator commands (`/nextjs`, `/ios`, `/expo`, `/django-react`, `/orca-os-dev`):

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

## Phase 2 Status

The following features were planned for Phase 2. Most are now fulfilled by the recording layer:

- **Delegation auto-capture:** Fulfilled by `orca-record pre-task`/`post-task` hooks
- **File change tracking:** Fulfilled by `orca-record stop` (file diffs captured per session)
- **Session summaries:** Fulfilled by `recording_explain` (narrative summaries per session)
- **Metrics aggregation:** Not yet implemented (recording.db has raw data for future analysis)
- **Smart Router training:** Not yet implemented (recording data can feed future routing improvements)

---

*Part of ORCA OS 6.2*
