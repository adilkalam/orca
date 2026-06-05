# Quick Reference: /plan Command (OS 5.1)

The `/plan` command creates blueprint-quality requirements specs before implementation.

---

## Basic Usage

```bash
/plan Add dark mode toggle to settings
```

This creates a requirements folder at `.claude/requirements/YYYY-MM-DD-HHMM-dark-mode/` and guides you through discovery questions.

---

## Planning Tiers

| Flag | Depth | Questions | Output | Best For |
|------|-------|-----------|--------|----------|
| `--tweak` | Quick | 2-3 scope only | Committed spec | Small changes, config updates |
| (none) | Standard | 10 total | Committed spec | Most features |
| `--complex` | Deep | 10 + risk assessment | Committed spec | Architecture, refactors |
| `--explore` | Exploratory | 2-3 after exploration | Tentative brief | Half-baked ideas, early thinking |
| `--problem-solve` | Convergent | 8-step analysis + 10 | Committed spec | Architectural decisions, migrations |

```bash
/plan "Fix button padding" --tweak                 # Quick
/plan "Add user preferences page"                  # Standard
/plan "Migrate to OAuth2" --complex                # Deep
/plan "What if we added AI chat?" --explore        # Exploratory
/plan "Implement multi-tenant auth" --problem-solve  # Convergent analysis
```

### Explore vs Standard Planning

**Use `--explore` when:**
- Idea is half-baked, not sure if worth building
- Want to think through implications before committing
- Need Go/No-Go decision criteria first

**Use standard tiers when:**
- Know you're building this feature
- Ready to commit to requirements
- Need actionable spec for implementation

---

## Additional Flags

| Flag | Purpose | Use When |
|------|---------|----------|
| `--debug` | Root cause analysis before planning | Bug investigations |
| `--from-brief` | Convert exploration brief to committed spec | After `--explore`, ready to commit |

```bash
/plan "Fix login timeout bug" --debug
/plan --from-brief                    # Auto-detect most recent brief
/plan --from-brief <path>             # Use specific brief
```


### When to Use --problem-solve

Use `--problem-solve` for the most rigorous planning analysis:

- Database migrations
- Authentication system changes
- Multi-service integrations
- Major refactors
- Features with many unknowns
- High-risk production changes

It runs a convergent decision pipeline automatically, producing:
- Systems map with integration points
- Pre-mortem failure analysis -> `#POISON_PATH` tags
- Implementation approaches -> `#PATH_DECISION` tags
- Adversarial critique -> `#COMPLETION_DRIVE` tags
- Requirements commitments -> acceptance criteria

---

## Exploratory Planning (--explore)

For ideas you're not sure about, use `--explore` to think through before committing.

### How It Works

```
/plan --explore "What if we added real-time collaboration?"
   |
   v
1. Creates requirements folder (same as standard)
   |
   v
2. Runs FULL deepthink exploration:
   - MAP: Systems mapping, integration points
   - INVERT: Pre-mortem, what could fail
   - PERSPECTIVES: Stakeholder concerns
   - EDGES: Creative alternatives
   (runs ALL relevant modes, not bounded)
   |
   v
3. Saves exploration to .claude/cognition/
   |
   v
4. Asks 2-3 targeted questions (not generic)
   |
   v
5. Generates 06-exploration-brief.md
   (TENTATIVE, not committed)
```

### Exploration Brief Structure

The output has 5 required sections:

1. **Opportunity** - Why consider this?
2. **Key Unknowns** - What we'd need to learn
3. **Rough Shape** - High-level approach if we proceed
4. **Risks & Concerns** - What could go wrong
5. **Go/No-Go Criteria** [REQUIRED] - How to decide

### After Exploration

```
Exploration complete: .claude/requirements/.../06-exploration-brief.md
Status: exploratory (NOT committed)

Next steps:
  - Review brief and Go/No-Go criteria
  - If proceeding: /plan --from-brief
  - If more exploration: /deepthink "[specific question]"
  - If abandoning: Archive this requirement
```

---

## Converting Briefs to Specs (--from-brief)

When ready to commit after exploration, use `--from-brief`:

```bash
/plan --from-brief                    # Auto-detects most recent brief
/plan --from-brief <path>             # Use specific brief (for older briefs)
```

### What Happens

1. **Auto-detect** (no path): Finds most recent `06-exploration-brief.md`, confirms with you
2. Reads the exploration brief
3. Uses brief content as context (not starting fresh)
4. Runs discovery questions (5) informed by Key Unknowns
5. Runs detail questions (5) informed by Rough Shape
6. Generates `06-requirements-spec.md` (COMMITTED)
6. Metadata includes `convertedFrom` reference

### Key Point

The brief's exploration becomes INPUT to the standard flow. Questions build on what's already known, not repeat it.

---

## Mutual Exclusivity

`--explore` cannot combine with other tier flags:

```bash
# VALID
/plan --explore "idea"
/plan --explore --visual "UI idea"      # Targeted exploration
/plan --explore --systems "arch idea"   # Systems-focused exploration

# INVALID (will error)
/plan --explore -tweak "idea"           # Conflicting workflows
/plan --explore -complex "idea"         # Conflicting workflows
/plan --explore --problem-solve "idea"  # Divergent vs convergent conflict
```

---

## What Gets Created

```
.claude/requirements/2025-12-05-1430-dark-mode/
  00-initial-request.md         # Your original request
  00-cognition-analysis.md      # (if single --flag used)
  00-problem-solve-analysis.md  # (if --problem-solve used - full pipeline output)
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

# Full problem-solve pipeline for architectural decisions
/plan --problem-solve Implement multi-tenant architecture

# Problem-solve with complex tier for maximum rigor
/plan -complex --problem-solve Migrate from REST to GraphQL

# Exploratory planning for half-baked ideas
/plan --explore What if we added AI-powered search?

# Targeted exploration with systems focus
/plan --explore --systems Should we switch to event sourcing?

# Convert exploration to committed spec
/plan --from-brief .claude/requirements/2025-12-05-1430-ai-search/06-exploration-brief.md
```

---

*Part of ORCA OS 5.1*
