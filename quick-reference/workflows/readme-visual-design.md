# Visual Design Spec — Quick Reference (OS 5.1)

**Version:** OS 5.1
**Last Updated:** 2025-12-05

Use this template to define clear, testable acceptance criteria for visual work. In OS 5.1, design QA is **automated** within pipelines via design-reviewer agents.

## OS 5.1 Integration

**Automatic Design QA:**
- Design QA agents run automatically in Phase 5 (after implementation)
- No manual design review commands needed
- Evidence captured automatically in `.claude/orchestration/evidence/`
- Design QA gate enforces ≥90 score

**Related commands (OS 5.1):**
- `/plan "feature"` → Include visual acceptance criteria in blueprint
- `/orca-{domain} "implement"` → Design QA runs automatically
- `/design-dna init/audit` → Initialize or audit design system

**Evidence locations (OS 5.1):**
- Screenshots: `.claude/orchestration/evidence/screenshots/`
- Design QA reports: `.claude/orchestration/evidence/design-qa-*.md`
- Gate scores: `.claude/orchestration/phase_state.json`

**Deprecated (OS 2.2):**
-  `/visual-smoke` → Use pipeline automatic checks
-  `/visual-iterate` → Use pipeline iteration (gate <90 triggers fix)
-  `/design-review` → Use automatic design-reviewer agents

---

## Example Spec (Fill-In Template)

### Scope
- URL(s):
  - http://localhost:3000/
  - http://localhost:3000/dashboard
- Views/components:
  - Header, Sidebar, KPI tiles, Charts (line + bar), CTA button
- Out of scope:
  - Authentication flows, settings panel

### Acceptance Criteria
- Hierarchy: H1 > H2 > body; CTA is primary focal element above the fold
- Spacing: 4/8/16/24/32 scale; no arbitrary pixel values
- Typography: Major Third scale; line length ~45–75ch for body
- Contrast: ≥ 4.5:1 for body text, ≥ 3:1 for large text and UI components
- Responsiveness: No horizontal scrolling at 1440×900, 768×1024, 375×812
- States: Hover, focus, active, and disabled visible and consistent
- Errors/empty/loading: present and visually distinct

### Tokens
- Colors (OKLCH or HEX):
  - Primary: oklch(0.65 0.17 260)
  - Text: oklch(0.25 0 0)
  - Surface: #FFFFFF
- Spacing scale: 4, 8, 12, 16, 24, 32, 48
- Type scale: 1.25 (Major Third)

### References
- Target screenshots / mocks:
  - `docs/design/mocks/home-desktop.png`
  - `docs/design/mocks/home-mobile.png`
- Brand/style guide:
  - `docs/design/style-guide.md`
- Known constraints:
  - Chart library has fixed legend width (200px)

---

## How To Use With Commands

1) Quick check
```
/visual-smoke http://localhost:3000 label=home
```
Produces desktop/tablet/mobile screenshots + console log under `.orchestration/evidence/…`.

2) Iterative polish (spec-driven)
```
/visual-iterate url=http://localhost:3000 spec_path=docs/design/home-spec.md max_iterations=5 label=home
```
Loop: navigate → screenshots → compare to spec → minimal edits → log → repeat.

3) Final gate
```
/design-review http://localhost:3000
```
Generates screenshots and a structured findings summary.

---

## Tips
- Keep specs small and explicit; ambiguity stalls iteration.
- Save “golden” target screenshots and link them for side‑by‑side comparison.
- Prefer tokens and global classes over ad‑hoc styles; it makes iteration safer.
- When blocked by auth/data, stub deterministic content and note it in iteration logs.
