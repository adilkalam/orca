# Scripts Directory - OS 4.0 Structure

**Last Organized:** 2025-11-19

##  Current Organization

### `/os2-cleanup/` - OS 4.0 Cleanup Scripts
Essential cleanup scripts for migrating to OS 4.0:
- `cleanup-for-os2.sh` - Clean individual projects
- `cleanup-global-claude.sh` - Clean global ~/.claude
- `cleanup-home-directory.sh` - Clean home directory
- `project-cleanup-guide.md` - Cleanup documentation

### `/utilities/` - Active Utility Scripts
Useful utilities that still work with OS 4.0:
- `capture-*.sh` - Screenshot/build capture utilities
- `evidence-utils.sh` - Evidence collection
- `perf-*.sh` - Performance logging
- `eval-run.sh` - Evaluation runner
- `test-enforcement.sh` - Test enforcement
- `install-git-hooks.sh` - Git hook installer
- `verify-file-organization.sh` - File organization checker
- `quick-confirm.sh` - Quick confirmation utility
- `md-to-pdf.sh` - Convert Markdown files to styled PDFs using `md-to-pdf` and project CSS

### `/docs/` - Script Documentation
README files moved from scripts root:
- `README-Design-System-Workflow.md`
- `README-iOS-Stabilization.md`
- `README-Log-Locations.md`
- `statusline-README.md`

### `/analytics/` - Analytics Tools
(Preserved - may still be useful)

### `/lint/` - Linting Tools
(Preserved - may still be useful)

### `/.archived-v1/` - Legacy v1 Scripts
Archived scripts from pre-OS 4.0 systems:

**Migration/Deployment:**
- `migrate-to-claude-work.sh`
- `deploy-to-global.sh`
- `port-to-codex-cli.sh`
- `prepare-codex-cli-package.sh`

**Old Orchestration:**
- `orchestrator_firewall.sh`
- `finalize.sh`
- `safe-archive.sh`
- `verification-mode.sh`

**Old SEO System (replaced by agents):**
- `seo_auto_pipeline.py`
- `seo_clarity_gates.py`
- `seo_kg_deep_reader.py`
- `seo_metrics.py`
- `seo_serp_analysis.py`
- `seo_serp_bridge.py`
- `seo_templates.py`

**Old Memory System:**
- `memory-embed.py`
- `memory-index.py`
- `memory-search.py`
- `configure_vibe_memory_mcp.py`
- `setup-vibe-memory-project.sh`

**Old Design System:**
- `design-tweak.sh`
- `design_ui_guard.py`
- `design-system-viewer.sh`
- `generate-design-atlas.py`
- `find-ui-refs.py`

**iOS/Swift (project-specific):**
- `AutoTokenLint.swift`
- `DesignTokens.swift`
- `ui-guard.sh`

**Other Legacy:**
- `cleanup-daemon.ts`
- `statusline.js`
- `log_introspection.py`
- `install-ace-playbooks.sh`
- `codex-session-preamble.sh`
- `update-claude-project-mcps.py`

---

## Usage

### For OS 4.0 Migration:
```bash
# Clean a project
bash scripts/os2-cleanup/cleanup-for-os2.sh

# Clean global ~/.claude
bash scripts/os2-cleanup/cleanup-global-claude.sh

# Clean home directory
bash scripts/os2-cleanup/cleanup-home-directory.sh
```

### For Utilities:
```bash
# Capture screenshot
bash scripts/utilities/capture-screenshot.sh

# Convert Markdown to PDF (uses config/md-to-pdf.json + config/md-to-pdf.css)
bash scripts/utilities/md-to-pdf.sh path/to/file.md

# Run tests with enforcement
bash scripts/utilities/test-enforcement.sh
```

---

## Maintenance Notes

- **DO NOT** use scripts in `.archived-v1/` - they're for v1 systems
- **OS 4.0** uses agents and MCP servers, not Python scripts
- **Utilities** folder contains scripts that work with any system
- **Keep this organized** - new scripts should go in appropriate folders

---

_Scripts directory cleaned and organized for OS 4.0 architecture_
