# Quick Reference: /plan Command (OS 4.1)

The `/plan` command creates blueprint-quality requirements specs before implementation.

---

## Basic Usage

```bash
/plan Add dark mode toggle to settings
```

This creates a requirements folder at `.claude/requirements/YYYY-MM-DD-HHMM-dark-mode/` and guides you through discovery questions.

---

## Planning Tiers

| Flag | Depth | Questions | Best For |
|------|-------|-----------|----------|
| `-tweak` | Quick | 2-3 scope only | Small changes, config updates |
| (none) | Standard | 10 total | Most features |
| `-complex` | Deep | 10 + risk assessment | Architecture, refactors |

```bash
/plan -tweak Fix button padding          # Quick: ~2 min
/plan Add user preferences page          # Standard: ~5 min
/plan -complex Migrate to OAuth2         # Deep: ~10 min
```

---

## Cognition Analysis Flags

Add reasoning analysis **before** discovery questions:

| Flag | Analysis Type | Use When |
|------|---------------|----------|
| `--visual` | UI flows, layouts | UI/UX features |
| `--systems` | Architecture, data flow | Integrations, backends |
| `--debug` | Root cause analysis | Bug investigations |
| `--model` | First principles | Foundational decisions |
| `--creative` | Brainstorming | New feature exploration |
| `--causal` | Cause-effect chains | Debugging complex issues |
| `--decide` | Trade-off analysis | Choosing between options |
| **`--deepthink`** | **Full 8-step pipeline** | **Architectural decisions, migrations, high-risk features** |

```bash
/plan --visual Add onboarding wizard
/plan --systems Migrate database to PostgreSQL
/plan -complex --debug Fix intermittent checkout failures
/plan --deepthink Implement real-time collaboration   # Full pipeline
```

### When to Use --deepthink

Use `--deepthink` for the most rigorous planning analysis:

- Database migrations
- Authentication system changes
- Multi-service integrations
- Major refactors
- Features with many unknowns
- High-risk production changes

It runs ORIENT→ANTICIPATE→GENERATE→EVALUATE→COMMIT automatically, producing:
- Systems map with integration points
- Pre-mortem failure analysis → `#POISON_PATH` tags
- Implementation approaches → `#PATH_DECISION` tags
- Adversarial critique → `#COMPLETION_DRIVE` tags
- Requirements commitments → acceptance criteria

---

## What Gets Created

```
.claude/requirements/2025-12-05-1430-dark-mode/
  00-initial-request.md         # Your original request
  00-cognition-analysis.md      # (if single --flag used)
  00-deepthink-analysis.md      # (if --deepthink used - full pipeline output)
  01-discovery-questions.md     # 5 high-level questions
  02-discovery-answers.md       # Your answers
  03-context-findings.md        # Codebase analysis
  04-detail-questions.md        # 5 technical questions
  05-detail-answers.md          # Your answers
  06-requirements-spec.md       # Final blueprint
  metadata.json                 # Progress tracking
```

---

## The Flow

```
1. /plan "Add dark mode"
   |
   v
2. [If --flag] Run cognition-mcp analysis
   |
   v
3. Discovery Questions (5 yes/no)
   - Smart defaults provided
   - Answer via interactive prompts
   |
   v
4. Context Analysis
   - Scans codebase
   - Identifies relevant files
   - Notes patterns/risks
   |
   v
5. Detail Questions (5 technical)
   - Tied to specific code paths
   - Architecture decisions
   |
   v
6. Generate Spec
   - Problem statement
   - Requirements list
   - RA-tagged decisions
   - Acceptance criteria
```

---

## After Planning

The command suggests your next step:

```
Spec complete: .claude/requirements/.../06-requirements-spec.md
Tier: default
Domain detected: nextjs

Suggested next step:
  /nextjs Implement requirement dark-mode
```

The tier carries through: `-tweak` plan = `-tweak` execution.

---

## Response Awareness Tags

The spec includes RA tags for implementation:

| Tag | Meaning |
|-----|---------|
| `#PATH_DECISION` | Architectural choice already made |
| `#COMPLETION_DRIVE` | Assumption needing verification |
| `#POISON_PATH` | Pattern to avoid |
| `#CONTEXT_DEGRADED` | Needs extra context gathering |

Grand architects respect these tags and don't re-decide settled `#PATH_DECISION` items.

---

## Tips

1. **Use tiers appropriately**: `-tweak` for small stuff, `-complex` for risky changes
2. **Add cognition flags** for non-obvious tasks
3. **Answer with defaults** when uncertain - defaults are smart
4. **Review the spec** before running `/orca-*`
5. **Spec is source of truth** - implementation follows it

---

## Examples

```bash
# Quick config change
/plan -tweak Update API endpoint URL

# Standard feature
/plan Add user avatar upload

# Complex with systems analysis
/plan -complex --systems Add real-time notifications

# Bug with debugging analysis
/plan --debug Fix cart total calculation error

# UI with visual reasoning
/plan --visual Redesign checkout flow

# Full deepthink pipeline for architectural decisions
/plan --deepthink Implement multi-tenant architecture

# Deepthink with complex tier for maximum rigor
/plan -complex --deepthink Migrate from REST to GraphQL
```

---

*Part of ORCA OS 4.1*
