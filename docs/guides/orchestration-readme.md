# Orchestration: Multi-Agent Execution with Quality

---

## The Default Execution Model

Single-agent execution has no external oversight.

**One agent reads the task, implements it, and declares done.** All self-reported. No checkpoints verify alignment. No gates check quality. No state survives interruption.

```
REQUEST                     AGENT                      "DONE"
+--------+                 +-------+                  +------+
| Add    |     ------>     | Read  |     ------>     | Self |
| auth   |                 | Code  |                 | Rptd |
| flow   |                 | Edit  |                 |      |
+--------+                 +-------+                  +------+
                               |
                               v
                          (drift happens here)
                          (scope creep here)
                          (premature completion here)
```

**Drift is invisible.** Agent starts with goal X, shifts to easier goal Y. No waypoint catches this. You asked for authentication, you get half an auth flow and "improvements" to unrelated files.

**Completion is self-reported.** Agent declares done when it "feels" done. Not when tests pass. Not when acceptance criteria are met. When the model thinks it's finished.

**Progress is ephemeral.** Interrupt to ask a question? Context is lost. Agent restarts, re-discovers, or worse - continues with stale understanding.

These aren't skill issues. They're structural - single-agent lacks coordination infrastructure that teams take for granted.

---

## What Orchestration Provides

Orchestration provides **prosthetic project management** - external coordination that replaces what single-agent lacks.

| Missing | Prosthetic |
|---------|------------|
| External checkpoints | Phases with explicit transitions |
| Verified completion | Evidence-based gates (not self-reports) |
| Role clarity | Strict separation: orchestrators/builders/gates |
| Resumable progress | phase_state.json persists across interruptions |
| Quality enforcement | Gates score against standards, block if failing |

The key inversion: **work isn't done until evidence exists.** A builder claiming completion means nothing. A gate passing with evidence means done.

---

## The Core Workflow

Two commands cover most work:

```
/plan  -->  /orca-{domain}
  |              |
PLAN IT      BUILD IT
```

### /plan: Requirements First

For anything beyond trivial changes:

```bash
/plan Add user authentication
```

This runs:
1. **5 discovery questions** - scope, approach, constraints
2. **5 detail questions** - specific implementation choices
3. **Spec generation** - `.claude/requirements/.../06-requirements-spec.md`

The spec becomes the source of truth. Decisions are locked. The builder follows the plan, not its own ideas.

### /orca-{domain}: Execute

After planning (or for simple tasks, directly):

```bash
/nextjs Add dark mode toggle
/ios Fix button padding
/expo Implement onboarding flow
```

Orchestration:
1. Detects complexity (simple/medium/complex)
2. Routes to appropriate tier (see below)
3. Assembles agent team
4. Tracks phases in `phase_state.json`
5. Runs gates before completion
6. Saves learnings to memory

---

## Three-Tier Routing

Not all tasks need the same ceremony. ORCA-OS routes based on complexity:

| Mode | Flag | Team Size | Gates | Use Case |
|------|------|-----------|-------|----------|
| **Default** | (none) | 2-4 | YES | Most work - fast with quality |
| **Tweak** | `-tweak` | 1-2 | NO | Speed iteration, you verify |
| **Complex** | `--complex` | 5-10 | YES | Architecture, multi-file, risky |

### Default Mode (Light + Gates)

Best for standard features. Fast execution with quality checks.

```bash
/nextjs "add dark mode toggle"
```

**Route**: Light orchestrator -> builder -> gates -> done

Gates run automatically (standards + design review). If they fail, builder gets another pass.

### Tweak Mode (Pure Speed)

For rapid iteration when you'll verify yourself.

```bash
/ios -tweak "fix button padding"
```

**Route**: Light orchestrator -> builder -> done

No gates. You're accepting responsibility for quality. Use when exploring options or making minor adjustments.

### Complex Mode (Full Pipeline)

For architectural changes, multi-file refactors, security work.

```bash
/nextjs --complex "implement checkout flow"
```

**Route**: Grand architect -> specialists -> gates -> verification

**Requires a spec.** If you try `--complex` without running `/plan` first:

```
BLOCKED: Complex task requires a spec.

Run first:
  /plan "implement checkout flow"

Then return with:
  /nextjs "implement requirement checkout-flow"
```

This prevents diving into major work without planning.

---

## The Agent Team

Strict role separation prevents drift.

### Orchestrators (Coordinate, Never Code)

- `/orca`, `/ios`, `/nextjs`, `/expo` commands
- Grand architects: `ios-grand-architect`, `nextjs-grand-architect`, etc.
- Light orchestrators: `ios-light-orchestrator`, `nextjs-light-orchestrator`, etc.

**What they do**: Classify complexity, gather context, delegate to specialists, track phases.

**What they never do**: Use Edit/Write tools. Touch source code.

### Builders (Implement Changes)

- `ios-builder`, `nextjs-builder`, `expo-builder-agent`
- Specialists: `ios-swiftui-specialist`, `tailwind-specialist`, etc.

**What they do**: Read files, edit code, implement features.

**What they never do**: Coordinate other agents. Decide "while I'm here, I'll also..."

### Gates (Validate, Never Fix)

- `ios-standards-enforcer`, `nextjs-design-reviewer`
- `design-token-guardian`, `expo-aesthetics-specialist`

**What they do**: Score against standards, report pass/caution/fail.

**What they never do**: Apply fixes. If a gate fails, the builder gets another pass - the gate doesn't patch.

### Verification (Evidence, Not Claims)

- `ios-verification`, `nextjs-verification-agent`

**What they do**: Run builds, execute tests, take screenshots.

**What they never do**: Trust self-reports. "I ran the tests" means nothing. Evidence in `phase_state.verification.commands_run` means done.

```
                ORCHESTRATOR
               (coordinates)
                     |
         +----------+----------+
         |                     |
     BUILDER              BUILDER
    (implements)         (implements)
         |                     |
         +----------+----------+
                     |
                   GATE
                (validates)
                     |
               VERIFICATION
              (runs commands)
```

---

## When to Plan vs Go Direct

| Situation | Command |
|-----------|---------|
| "Fix typo in README" | `/nextjs -tweak "fix typo"` |
| "Update button colors" | `/nextjs "update button colors"` |
| "Add user profile screen" | `/plan` first, then `/ios` |
| "Implement payment flow" | `/plan --complex`, then `/nextjs --complex` |
| "How's our code quality?" | `/ios --audit` |

**Rule of thumb**: If you'd hesitate to start coding without thinking it through, run `/plan` first.

---

## Phase State

Work persists in `.claude/orchestration/phase_state.json`:

```json
{
  "domain": "ios",
  "task": "Add haptic feedback",
  "phase": "implementation",
  "complexity_tier": "simple",
  "gates": {
    "standards": { "score": 95, "status": "pass" },
    "design_qa": { "score": 88, "status": "caution" }
  }
}
```

If you interrupt a session, orchestrators read this and resume from the appropriate phase. Context isn't lost.

---

## Domain Lanes

| Domain | Command | Grand Architect | Light Orchestrator |
|--------|---------|-----------------|-------------------|
| iOS | `/ios` | `ios-grand-architect` | `ios-light-orchestrator` |
| Next.js | `/nextjs` | `nextjs-grand-architect` | `nextjs-light-orchestrator` |
| Expo | `/expo` | `expo-grand-orchestrator` | `expo-light-orchestrator` |
| Django+React | `/django-react` | `django-react-grand-architect` | `django-react-light-orchestrator` |
| SEO | `/seo` | (specialists) | - |
| Data | via `/orca` | (specialists) | - |

The main `/orca` command auto-detects domain based on project files and routes appropriately.

---

## Quick Reference

### Commands

```bash
# Planning
/plan "description"              # Standard planning
/plan -tweak "description"       # Quick scope only
/plan --complex "description"    # Deep analysis

# Execution
/nextjs "task"                   # Default (with gates)
/ios -tweak "task"               # Speed mode (no gates)
/expo --complex "task"           # Full pipeline

# Audit (no implementation)
/ios --audit                     # Review codebase quality
/audit                           # Multi-domain audit
```

### Flags

| Flag | Effect |
|------|--------|
| (none) | Default mode - light orchestrator + gates |
| `-tweak` | Speed mode - skip gates, user verifies |
| `--complex` | Full mode - grand architect, requires spec |
| `--audit` | Review only - produces report, no changes |

### Files

| Location | Purpose |
|----------|---------|
| `.claude/requirements/` | Specs from /plan |
| `.claude/orchestration/phase_state.json` | Current task state |
| `.claude/orchestration/evidence/` | Gate reports, audit logs |

---

## The Loop Closes

Orchestration saves learnings back to memory:

```
Memory loads context  --->  Orchestration executes  --->  Learnings save to memory
```

Task completion calls `save_task_history`. Gate failures become standards. Decisions get recorded. Future sessions start with this context.

This is why the three systems (cognition, memory, orchestration) work together:
- **Cognition** helps you think through the problem
- **Memory** ensures context persists
- **Orchestration** executes with quality and records what was learned

---

## See Also

- `docs/concepts/pipeline-model.md` - Full architecture reference
- `docs/concepts/complexity-routing.md` - Three-tier routing details
- `commands/plan.md` - Complete /plan specification
- `commands/orca.md` - Complete /orca specification

---

_Version: OS 5.0 | Orchestration is execution, made reliable._
