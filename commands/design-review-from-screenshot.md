---
description: >
  Run a focused design review using a reference screenshot and the project
  design system. Captures the current live UI with Puppeteer, analyzes both
  via visual-layout-analyzer, then asks frontend-design-reviewer-agent to
  compare and score.
allowed-tools: [
  "Task",
  "Read",
  "Grep",
  "Glob",
  "Bash",
  "ListMcpResourcesTool",
  "ReadMcpResourceTool",
  "mcp__puppeteer__puppeteer_connect_active_tab",
  "mcp__puppeteer__puppeteer_navigate",
  "mcp__puppeteer__puppeteer_screenshot",
  "mcp__puppeteer__puppeteer_click",
  "mcp__puppeteer__puppeteer_fill",
  "mcp__puppeteer__puppeteer_select",
  "mcp__puppeteer__puppeteer_hover",
  "mcp__puppeteer__puppeteer_evaluate"
]
---

# /design-review-from-screenshot — Visual Diff vs Design System

Use this command when you have a **reference screenshot** of the desired UI
state (mockup, past build, or design export) for a frontend route (typically
Nextjs/App Router) and want to:
- Ensure the current live UI still matches that visual reference.
- Validate the live UI against the project’s design-dna and design rules.
- Get a scored, OS 4.1–style Design QA report.

This command is primarily oriented toward the Nextjs/frontend lane. It:
1. Captures the current live UI with Puppeteer at matching breakpoints.
2. Runs `visual-layout-analyzer` on the reference (and optionally live)
   screenshots to produce structured layout + token mapping.
3. Calls `frontend-design-reviewer-agent` with both images and the analysis to
   compute a Design QA Score and gate.

---
## 1. Inputs

- Reference screenshot image:
  - Attached to the Claude Code session, or available at a file path.
- Target URL/route to review (default `http://localhost:3000`).
- Optional:
  - Label for this run (used in filenames).
  - Navigation steps or selectors to reach the relevant view.
  - Which breakpoints matter (desktop only vs desktop+mobile).

---
## 2. Capture Current Live UI (Puppeteer MCP)

Use the Puppeteer MCP tools to:
- Navigate to the target URL/route via `puppeteer_navigate`.
- Capture screenshots at viewport sizes matching the reference:
  - Desktop: `puppeteer_screenshot({ name: "live-desktop", width: 1440, height: 900 })`
  - Mobile: `puppeteer_screenshot({ name: "live-mobile", width: 375, height: 812 })`
- Save under:
  - `.claude/orchestration/evidence/screenshots/<ts>-<label>-live-{desktop|mobile}.png`

Use `puppeteer_evaluate` for diagnostics if helpful:
- Console errors: `puppeteer_evaluate({ script: "console.error.toString()" })`
- DOM state inspection

These artifacts become evidence for design QA but are not modified.

---
## 3. Analyze Reference & Live Screenshots

Next, invoke `visual-layout-analyzer` via `Task` to produce a structured
visual analysis aligned with the project’s design system:

- For the **reference screenshot** (required):
  - Generate:
    - `Visual Layout Tree` – hero/sections/cards/prose regions.
    - `Detected Components` – bento cards, prose containers, nav, etc.
    - `Token Candidates` – estimated typography/colors/spacing mapped into
      `design-dna` tokens where possible.

- For the **live screenshot(s)** (optional but recommended):
  - Optionally run `visual-layout-analyzer` again to produce a parallel
    analysis of the current UI.

Include:
- `design-dna.json` and authored design docs in context:
  - `design-system-vX.X.md`
  - `bento-system-vX.X.md`
  - `CSS-ARCHITECTURE.md`

The goal is to give downstream agents a machine-friendly view of what the
reference expresses and how the live UI aligns (or doesn’t).

---
## 4. Invoke Frontend Design Reviewer Agent

Call `nextjs-design-reviewer` via `Task` with a prompt that:
- Provides:
  - The reference screenshot path.
  - Live screenshot paths.
  - The visual-layout-analyzer outputs (for reference and, if available, live).
- Asks for:
  - A Design QA Score (0–100).
  - A gate: `PASS` / `CAUTION` / `FAIL`.
  - Specific differences between reference and live UI, mapped back to:
    - Layout/spacing.
    - Color/typography.
    - Component/structure (e.g. bento patterns).
    - Any violations of design-dna or CSS architecture rules.

Example:

```ts
Task({
  subagent_type: "nextjs-design-reviewer",
  prompt: `
Compare the reference screenshot and its visual-layout-analyzer output with
the current live UI screenshots and their analysis.

Goals:
- Identify visual differences in layout, spacing, color, typography, and
  component structure (including bento/prose patterns).
- Check compliance with design-dna.json and authored design docs.
- Compute a Design QA Score (0–100) and gate (PASS/CAUTION/FAIL).
- List specific mismatches with hints about likely files/areas to inspect.

You MUST:
- Produce a markdown report under .claude/orchestration/evidence/, with a
  filename like design-review-<route-or-slug>.md.
- Use the standard template sections (COVERAGE DECLARATION, MEASUREMENTS,
  PIXEL COMPARISON, VERIFICATION RESULT) at the top of the file, including
  explicit pixel measurements (e.g. 24px).
- When running as part of the Nextjs pipeline, record the evidence file path
  in phase_state.gates.design_qa.evidence_paths so the design gate can be
  mechanically enforced.
`
})
```

---
## 5. Summarize Findings

Report back to the user:
- Where the live UI matches the reference well.
- Where it diverges materially (especially regressions vs the design system).
- The Design QA Score and gate.
- Concrete recommendations for bringing the live UI back in line with:
  - The reference screenshot.
  - `design-dna.json` and the design-system/bento/CSS-ARCHITECTURE rules.

If appropriate, suggest follow-up:
```
/orca Address design review findings for <route>, using evidence at .claude/orchestration/evidence/design-review-<slug>.md
```
This runs the unified pipeline with Design QA findings as input.

---
## 6. OS 4.1 Integration (Nextjs Lane)

To integrate this command cleanly with the OS 4.1 Nextjs pipeline:

1. **Store Evidence**
   - Ensure screenshots and the Design QA summary are saved under:
     - `.claude/orchestration/evidence/screenshots/...`
     - `.claude/orchestration/evidence/design-review-<slug>.md`

2. **Context & Phase State**
   - When the user is ready to act on the findings:
     - Run `/orca` with a request like:
       - `"Implement design fixes for <route> based on design review at .claude/orchestration/evidence/design-review-<slug>.md"`
   - The grand architect and downstream agents should treat:
     - The Design QA score/gate as input to the **gates** phase.
     - The listed diffs as requirements for the implementation phase.

This keeps visual regression and design QA evidence aligned with the unified
pipeline's standards and design-review gates.
