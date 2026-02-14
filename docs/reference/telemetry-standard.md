# Telemetry Standard (OS 6.0)

**Version:** 3.0.0 (spec document version; `index.json` uses data format version "2.5.0")
**Status:** Deprecated -- superseded by orca-record recording layer
**Effective:** OS 6.0

---

> **DEPRECATION NOTICE:** This telemetry system is superseded by the `orca-record` recording layer.
> The recording layer provides full session recording, git-backed checkpoints, secret redaction,
> and cognitive fusion via cognition-mcp. It captures all hook events automatically without
> requiring orchestrators to manually emit telemetry.
>
> **Migration:** Existing pipeline commands still reference `telemetry-emit.sh` and the scripts
> remain functional. New features should use `orca-record` instead. The recording database
> (`.orca/recording.db`) replaces `.claude/telemetry/` per-project storage.
>
> **New commands:** `orca-record status`, `orca-record history`, `orca-record checkpoints`

---

## Overview

All orchestrators and gates SHOULD emit telemetry events to enable:
- Pipeline debugging
- Performance tuning
- Gate score trending
- Complexity classification training data

Telemetry is stored in `.claude/telemetry/` (ephemeral, not committed to git).

---

## Project-Local Telemetry (CRITICAL)

**All telemetry MUST be written to the project where the pipeline is launched, NOT to ORCA-OS or `~/.claude`.**

### Rules

1. **ALWAYS use relative paths** - `.claude/telemetry/...` not `/Users/.../ORCA-OS/.claude/telemetry/...`
2. **ALWAYS use `pwd` at pipeline start** to confirm working directory
3. **NEVER hardcode absolute paths** in telemetry commands
4. **Requirements artifacts** go to `$PROJECT/.claude/requirements/`
5. **Phase state** goes to `$PROJECT/.claude/orchestration/phase_state.json`

### Verification

At pipeline start, orchestrators MUST:
```bash
# Verify we're in the intended project
pwd
# Should output the project root, e.g., ~/Desktop/mk

# Create telemetry directory in THIS project
mkdir -p .claude/telemetry/sessions
```

### Anti-Pattern

```bash
# WRONG - hardcoded path
echo '...' >> /path/to/project/.claude/telemetry/sessions/trace.jsonl

# RIGHT - relative to current project
echo '...' >> .claude/telemetry/sessions/trace-$TRACE_ID.jsonl
```

### Exception: /orca-os-dev

The `/orca-os-dev` command is LOCAL to ORCA-OS repo only and is NOT deployed globally. When working on OS configuration in ORCA-OS, telemetry correctly goes to ORCA-OS.

---

## Telemetry Directory Structure

```
.claude/telemetry/
  sessions/
    trace-{trace-id}.jsonl   # Event stream (flat file per trace)
  metrics/
    gate-scores.jsonl        # Aggregated gate scores over time
    delegation-times.jsonl   # Time spent per delegation
  index.json                 # Session index for quick lookup
```

---

## Trace ID Format

Every pipeline run generates a trace ID:

```
Format: {domain}-{timestamp}-{random}
Example: nextjs-20241204T143022-a7b3
```

Components:
- `domain`: Lane that initiated (nextjs, ios, expo, research, os-dev)
- `timestamp`: ISO 8601 compact format
- `random`: 4-character alphanumeric for uniqueness

---

## Event Types

### Pipeline Events

```jsonl
{"type": "pipeline_start", "trace_id": "nextjs-20241204T143022-a7b3", "ts": "2024-12-04T14:30:22Z", "data": {"domain": "nextjs", "task": "add dark mode toggle", "mode": "default"}}
{"type": "delegation", "trace_id": "...", "ts": "...", "data": {"from": "nextjs-grand-architect", "to": "nextjs-architect", "context_size_kb": 42, "reason": "planning phase"}}
{"type": "gate_result", "trace_id": "...", "ts": "...", "data": {"gate": "nextjs-standards-enforcer", "score": 87, "decision": "WARN", "issues_count": 3}}
{"type": "pipeline_end", "trace_id": "...", "ts": "...", "data": {"status": "success", "duration_sec": 45, "total_delegations": 5}}
```

**Emission notes:**
- `pipeline_start` and `pipeline_end` are emitted by `scripts/utilities/telemetry-emit.sh`.
- `gate_result` events are emitted inline by orchestrator commands (via echo/append to the trace file), NOT by `telemetry-emit.sh`.
- `delegation` events are documented here for Phase 2 but are not yet emitted by any script or agent.

### Event Schema

#### pipeline_start
```json
{
  "type": "pipeline_start",
  "trace_id": "string",
  "ts": "ISO8601",
  "data": {
    "domain": "string",
    "task": "string (first 100 chars)",
    "mode": "tweak | default | complex",
    "user_override": "boolean"
  }
}
```

#### delegation
```json
{
  "type": "delegation",
  "trace_id": "string",
  "ts": "ISO8601",
  "data": {
    "from": "agent name",
    "to": "agent name",
    "context_size_kb": "number",
    "context_keys": ["array of ContextBundle keys passed"],
    "reason": "string"
  }
}
```

#### gate_result
```json
{
  "type": "gate_result",
  "trace_id": "string",
  "ts": "ISO8601",
  "data": {
    "gate": "agent name",
    "score": "0-100",
    "decision": "PASS | WARN | ERROR | BLOCK",
    "threshold_used": "strict | standard | lenient",
    "issues_count": "number",
    "critical_count": "number",
    "retry_requested": "boolean"
  }
}
```

#### pipeline_end
```json
{
  "type": "pipeline_end",
  "trace_id": "string",
  "ts": "ISO8601",
  "data": {
    "status": "success | failed | cancelled | user_override",
    "duration_sec": "number",
    "total_delegations": "number",
    "gates_run": "number",
    "files_modified": "number",
    "user_prompts": "number (optional - how many times user was asked)"
  }
}
```

---

## Session Summary Format

Generated at pipeline end:

```json
{
  "trace_id": "nextjs-20241204T143022-a7b3",
  "domain": "nextjs",
  "task_summary": "add dark mode toggle",
  "started_at": "2024-12-04T14:30:22Z",
  "ended_at": "2024-12-04T14:31:07Z",
  "duration_sec": 45,
  "status": "success",

  "delegation_chain": [
    {"from": "nextjs-grand-architect", "to": "nextjs-architect", "context_kb": 42},
    {"from": "nextjs-architect", "to": "nextjs-builder", "context_kb": 38},
    {"from": "nextjs-builder", "to": "nextjs-standards-enforcer", "context_kb": 35}
  ],

  "gate_scores": {
    "nextjs-standards-enforcer": {"score": 87, "decision": "WARN"},
    "nextjs-design-reviewer": {"score": 92, "decision": "PASS"}
  },

  "metrics": {
    "total_tool_calls": 23,
    "files_read": 8,
    "files_modified": 3,
    "user_prompts": 1
  },

  "complexity_signals": {
    "files_touched": 3,
    "task_keywords": ["add", "toggle", "dark mode"],
    "estimated_complexity": "medium",
    "actual_outcome": "success"
  }
}
```

---

## Metrics Aggregation

### Gate Score Trends

`metrics/gate-scores.jsonl`:
```jsonl
{"date": "2024-12-04", "gate": "nextjs-standards-enforcer", "avg_score": 85.2, "pass_rate": 0.72, "warn_rate": 0.22, "error_rate": 0.06, "block_rate": 0.00, "samples": 18}
```

### Delegation Timing

`metrics/delegation-times.jsonl`:
```jsonl
{"date": "2024-12-04", "domain": "nextjs", "avg_duration_sec": 38, "avg_delegations": 4.2, "avg_context_kb": 35, "samples": 12}
```

---

## Retention Policy

- Session data: **7 days** (auto-cleanup)
- Aggregated metrics: **30 days**
- Never committed to git (add `.claude/telemetry/` to `.gitignore`)

---

## Usage by Orchestrators

### Emitting Events (Pseudo-code)

```
At pipeline start:
  1. Generate trace_id
  2. Write pipeline_start event to trace.jsonl
  3. Pass trace_id through delegation chain

At each delegation:
  1. Write delegation event with context size
  2. Pass trace_id to delegated agent

At each gate:
  1. Write gate_result event with score and decision

At pipeline end:
  1. Write pipeline_end event
  2. Generate session summary
```

### Reading Telemetry

For debugging:
```bash
# View recent sessions
cat .claude/telemetry/index.json

# View specific session trace
cat .claude/telemetry/sessions/trace-{trace-id}.jsonl

# View gate score trends
cat .claude/telemetry/metrics/gate-scores.jsonl | tail -10
```

---

## Future: Smart Router Training Data

The `complexity_signals` in session summaries will be used to train the Smart Router in Phase 2:

```
Input features:
- task_keywords
- estimated file count (from grep patterns)
- project size signals

Output labels:
- actual_outcome (success/fail)
- actual_complexity (based on delegations, time, gates)
```

---

## Implementation Checklist

Phase 1 (Foundation) - Complete:
- [x] Define telemetry standard (this document)
- [x] Create telemetry directory structure (via session-start.sh hook)
- [x] Add .claude/telemetry/ to .gitignore
- [x] Create index.json template (via session-start.sh hook)
- [x] Add event logging instructions to orchestrator commands
- [x] Add cleanup script for 7-day retention (scripts/telemetry-cleanup.sh)
- [x] Add gate_result emission to lane commands
- [x] Create trace viewer script (scripts/telemetry-viewer.sh)

Phase 2 (Intelligence) - Planned:
- [ ] Hook-based delegation auto-capture
- [ ] Hook-based file change tracking
- [ ] Build aggregation scripts for metrics
- [ ] Create complexity classifier training pipeline

---

*Part of OS 6.0*
