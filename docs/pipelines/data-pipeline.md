# Data / Analytics Domain Pipeline

**Status:** OS 4.2 Pipeline (DataPipeline)
**Last Updated:** 2025-11-27

---

## Overview

The data/analytics pipeline handles work where the primary output is:
- Data understanding (what exists, how good it is).
- Analyses and models (what patterns exist and what they mean).
- Decision-support artifacts (briefs, dashboards, metrics, reports).

It combines:
- OS 4.2 primitives (ProjectContextServer, `phase_state.json`, vibe.db, Workshop)
- Memory-first context (Workshop + vibe.db before ProjectContext)
- Data/analytics agents:
  - `data-researcher` (lead)
  - `research-specialist`
  - `python-analytics-expert`
  - `competitive-analyst`
- Modern data engineering/analytics practices

**Note:** The data pipeline is specialist-based (no grand-architect). Tasks route through `/orca` which delegates to `data-researcher` to lead the workflow.

---

## Scope & Domain

Use this pipeline when:
- The request is primarily about **data**:
  - “Help me understand churn drivers in this dataset.”
  - “Compare performance across cohorts / segments / campaigns.”
  - “Design or refine a data pipeline or analysis for this product.”
  - “Evaluate data quality and whether we can answer X.”
- Outputs are:
  - Findings reports and briefs.
  - Python/SQL analysis code.
  - Data-driven recommendations.

If the work is primarily:
- Web/frontend/UI → use the **webdev** pipeline.
- SEO/content → use the **seo** pipeline.
- Mobile (Expo/iOS) → use **expo** or **ios** pipelines and call data agents
  only when needed.

---

## Phase State Contract (`phase_state.json`)

All data pipeline work shares a common phase state file:

```text
.claude/orchestration/phase_state.json
```

For `domain: "data"`, the contract is:

- Top-level:
  - `domain`: must be `"data"`.
  - `current_phase`: one of:
    - `"context_query"`, `"requirements_scoping"`,
      `"data_inventory_quality"`, `"analysis_plan"`,
      `"implementation"`, `"analysis_synthesis"`,
      `"verification"`, `"completion"`.
  - `phases`: object keyed by phase name (see below).
  - `gates_passed` / `gates_failed`: arrays of gate identifiers
    (e.g. `"data_quality"`, `"analysis_rigor"`, `"overall_quality"`).
  - `artifacts`: list of repo-relative paths to important artifacts
    (reports, specs, notebooks/scripts).

Each phase SHOULD write a structured entry under `phases.<phase_name>`:

- `context_query`
  - `status`: `"pending" | "in_progress" | "completed" | "blocked"`.
  - `timestamp`: ISO string when completed.
  - `summary`: short summary of project/data context.
- `requirements_scoping`
  - `status`.
  - `scoped_questions`: list of concrete questions/decisions.
  - `data_requirements`: list of required data sources/fields.
- `data_inventory_quality`
  - `status`.
  - `data_sources`: list of identified sources.
  - `data_quality_snapshot`: short text on completeness/accuracy/recency.
  - `caveats`: known limitations.
- `analysis_plan`
  - `status`.
  - `analysis_plan_path`: path to plan doc (if created).
- `implementation`
  - `status`.
  - `code_paths`: list of scripts/notebooks modified or added.
  - `notes`: short description of what was implemented.
- `analysis_synthesis`
  - `status`.
  - `findings_report`: path to detailed findings.
  - `summary_brief`: path to brief.
- `verification`
  - `status`.
  - `quality_score`: 0–100 score (see rubric).
  - `gate_status`: `"PASS" | "CAUTION" | "FAIL" | "BLOCK"`.
- `completion`
  - `status`.
  - `outcome`: `"success" | "partial" | "failure"`.
  - `learnings`: short text (what worked, what didn’t).

Agents in this pipeline (`data-researcher`, `research-specialist`,
`python-analytics-expert`) MUST update the appropriate entries when their
phase work completes.

---

## Pipeline Architecture

```text
Request (Data / Analytics)
    ↓
/orca (Data Orchestrator)
    ↓
[Phase 1: Context Query] ← MANDATORY (ProjectContextServer)
    ↓
[Phase 2: Requirements & Scoping (data-researcher)]
    ↓
[Phase 3: Data Inventory & Quality (data-researcher)]
    ↓
[Phase 4: Analysis Plan (research-specialist)]
    ↓
[Phase 5: Implementation (python-analytics-expert)] (optional)
    ↓
[Phase 6: Analysis & Synthesis (research-specialist)]
    ↓
[Phase 7: Verification & Quality Gate]
    ↓
[Phase 8: Completion & Handoff]
```

---

## Phase Definitions

### Phase 1: Context Query (MANDATORY)

**Agent:** ProjectContextServer (MCP tool)  
**Invoker:** `/orca`

Loads a **ContextBundle** with:
- `relevantFiles`: existing data/analysis code, notebooks, schemas, docs.
- `projectState`: known data stores, pipelines, tools.
- `pastDecisions`: previous analyses and decisions.
- `relatedStandards`: data/analytics standards and best-practices.

Artifacts:
- ContextBundle snapshot stored in `phase_state.json`.
- Optional: event logged to `vibe.db.events`.

---

### Phase 2: Requirements & Scoping

**Agent:** `data-researcher`

Tasks:
- Restate the user’s request as concrete questions and decisions.
- Identify:
  - What needs to be answered now vs later.
  - Initial data requirements (sources, fields, time windows).

Artifacts:
- Scoped questions and data requirements recorded in `phase_state.json`.

---

### Phase 3: Data Inventory & Quality Assessment

**Agent:** `data-researcher`

Tasks:
- Inventory actual available data sources in the project.
- Assess:
  - Completeness, accuracy, recency, relevance.
  - Key caveats and risks (e.g. limited historical depth, missing labels).

Artifacts:
- Data sources list and quality snapshot in `phase_state.json`.
- Optional: `outputs/data/data-inventory-*.md` if a detailed inventory doc is needed.

Gate:
- `data_quality_gate` (informational) – used to flag serious quality concerns.

---

### Phase 4: Analysis Plan

**Agent:** `research-specialist`

Tasks:
- Design an analysis plan tailored to:
  - The scoped questions.
  - The available data and its quality.
- Plan may include:
  - Metrics and aggregations to compute.
  - Cohort/segment definitions.
  - Statistical checks or modeling approaches.
  - Visualization and reporting targets.

Artifacts:
- Plan doc: `.claude/orchestration/specs/data-analysis-plan-YYYY-MM-DD.md`.
- Path recorded in `phase_state.json`.

---

### Phase 5: Implementation (Optional)

**Agent:** `python-analytics-expert`

This phase is optional:
- Use it when there is **new code** to write or refactor
  (scripts/notebooks/pipelines).
- Skip when the goal is purely conceptual or can be answered via ad-hoc
  queries without durable code.

Tasks:
- Implement or adjust Python/SQL code to realize the analysis plan.
- Follow:
  - `DATA_ENGINEERING_AND_ANALYTICS_BEST_PRACTICES.md`.
  - Project-specific patterns (e.g. lakehouse, medallion).

Artifacts:
- Updated/created code files.
- Notes and run instructions in `phase_state.json`.

---

### Phase 6: Analysis & Synthesis

**Agent:** `research-specialist`

Tasks:
- Run the analysis (using implementation from Phase 5 or ad-hoc queries).
- Interpret results:
  - Answer the scoped questions.
  - Highlight patterns, anomalies, and uncertainties.
- Produce:
  - A detailed findings report.
  - A shorter summary brief for stakeholders.

Artifacts:
- `outputs/data/findings-*.md`
- `outputs/data/summary-brief-*.md`
- Paths recorded in `phase_state.json`.

Gate:
- `analysis_rigor_gate` (informational) – qualitative assessment of rigor.

---

### Phase 7: Verification & Quality Gate

**Agent:** `research-specialist`

Tasks:
- Evaluate the work against the **Data & Analytics Rubric**:
  - `.claude/orchestration/reference/quality-rubrics/data-analytics-rubric.md`
- Produce:
  - Overall `quality_score` (0–100).
  - `gate_status` (`PASS`, `CAUTION`, `FAIL`, `BLOCK`).
  - Notes on gaps or follow-ups.

Artifacts:
- Quality assessment stored in `phase_state.json`.
- Optional: short QA note appended to summary brief.

Gate:
- `overall_quality_gate` (threshold recommended: 75).

---

### Phase 8: Completion & Handoff

**Agent:** `/orca` + ProjectContextServer integrations

Tasks:
- Confirm:
  - All relevant phases have completed or been intentionally skipped.
  - Findings and summary briefs are stored and discoverable.
  - Quality gate status is clear to stakeholders.
- Save task history:
  - Domain: `"data"`.
  - Task description.
  - Outcome and quality score.
  - Key artifacts and code paths.
- Optionally record standards/learnings into `vibe.db` for future runs.

Artifacts:
- Task history entry in `vibe.db`.
- Final summary for the user and future context.
