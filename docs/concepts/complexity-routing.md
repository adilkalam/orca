# Complexity Routing - Four-Tier Structure

**Version:** OS 7.1 | **Last Updated:** 2026-07-04

OS 7.1 uses **four-tier routing** to optimize for speed while maintaining quality gates.
All tiers run FLAT: the domain command is the orchestrator in the main thread and spawns
specialists single-level (`docs/reference/flatten-orchestration-pattern.md`). The
orchestrator-agent tier (light-orchestrators, grand-architects) was archived 2026-05-27.

## Four-Tier Routing Table

| Mode | Flag | Path | Gates | Use Case |
|------|------|------|-------|----------|
| **Light** | `--light` | Command light path | YES | Confident users, skip confirmation |
| **Default** | (none) | Light path + Confirmation | YES | Most work -- fast with quality |
| **Tweak** | `--tweak` | Builder direct | NO | Speed iteration, user verifies |
| **Complex** | `--complex` | Full pipeline (architect + all gates) | YES | Architecture, multi-file, specs |

**Key Inversion:** Default now runs gates. Previous versions skipped them.

## Default Mode (Light + Confirmation + Gates)

Most tasks take this path. User confirms the proposed team before execution. Fast execution with automated quality checks.

**Indicators:**
- 1-5 files affected
- Single screen/section changes
- UI tweaks, component updates
- Copy/label changes
- Simple logic changes

**Route:** Confirmation → domain command runs the light path in the main thread (builder → gates) → done

**Gates run (domain-specific):**
- Next.js: `nextjs-standards-enforcer` (gates.standards, >= 90 hook-enforced) + `design-validator` (web design floor, UI-affecting tasks)
- iOS: `ios-standards-enforcer` + `ios-ui-reviewer`
- Expo: `expo-standards-enforcer` + `a11y-enforcer` + `performance-enforcer`

## Light Mode (`--light`)

Same as default but skips the team confirmation step. For confident users who know the pipeline.

**Use when:**
- You know the task is straightforward
- You want to skip the confirmation dialog
- You trust the default agent team

**Route:** Command light path → builder → gates → done (no confirmation)

## Tweak Mode (`--tweak`)

Pure speed path. User explicitly accepts responsibility for verification.

**Use when:**
- Rapid iteration
- Exploring options
- Minor adjustments
- You'll verify yourself

**Route:** Builder direct → done (skip gates)

## Complex Mode (`--complex`)

Full pipeline with domain-architect planning (`nextjs-architect`, `ios-architect`, `expo-architect-agent`, `django-react-architect`), sequenced by the domain command in the main thread.

**Indicators:**
- Multiple screens/flows
- Architecture/data layer changes
- New feature with state management
- Security/auth/payments
- Major refactoring
- Keywords: "implement", "build", "create", "refactor" + feature/system

**Route:** Full pipeline with spec requirement

## Team Scaling by Mode

Team size scales with routing mode:

| Mode | Files | Agents | Team Composition |
|------|-------|--------|------------------|
| Light | 1-5 | 2-4 | Command light path: builder + gates (no confirmation) |
| Default | 1-5 | 2-4 | Confirmation + builder + gates |
| Tweak | 1-3 | 1-2 | Builder direct |
| Complex | 5+ | 5-10 | Domain architect + builders + all gates (command-sequenced) |

### Extended Thinking (Complex Mode)

The command (main thread) uses thinking prompts for complex coordination:

- "Let me think through the architecture and delegation strategy..."
- "Think harder about the implications, dependencies, and potential failure modes..."

This aligns with Anthropic best practices for complex reasoning tasks.

## Flags Reference

### No Flag (Default)

Light path WITH confirmation and quality gates:

```bash
/ios "fix button padding"
/nextjs "update header text"
/expo "adjust card spacing"
```

Fast execution + automated quality checks. Best for most work.

### `--light` Flag

Light path WITH gates, WITHOUT confirmation:

```bash
/ios --light "fix button padding"
/nextjs --light "update header text"
/expo --light "adjust card spacing"
```

Same execution as default but skips the team confirmation dialog.

### `--tweak` Flag

Light path WITHOUT gates (pure speed):

```bash
/ios --tweak "fix button padding"
/nextjs --tweak "update header text"
/expo --tweak "adjust card spacing"
```

Use when iterating quickly and you'll verify yourself.

### `--complex` Flag

Force the full pipeline (domain architect + all gates):

```bash
/ios --complex "implement new auth flow"
/nextjs --complex "build checkout module"
/expo --complex "create new navigation system"
```

Auto-triggered for architectural/multi-file work. Requires spec.

### `--audit` Flag

Review-only mode (no implementation):

```bash
/ios --audit              # Deep iOS codebase audit
/nextjs --audit           # Deep Next.js audit
/expo --audit             # Deep Expo codebase audit
```

Audit mode:
- Clarifies focus areas with user
- Assembles domain-specific audit squad
- Agents analyze code via Read/Grep/Glob
- Produces audit report with findings
- Suggests follow-up tasks
- **Never modifies code**

### Spec Gating (Complex Mode)

Complex tasks are blocked without a requirements spec:

```
 BLOCKED: Complex task requires a spec.

Run first:
  /requirements "description of the feature"

Then return with:
  /ios "implement requirement <id>"
```

Specs live at: `.orca/requirements/<id>/06-requirements-spec.md`

Created by `/requirements`, consumed by the domain commands.

## Routing Flow

```
Parse Arguments
    
     Contains "--light"? → Command light path (LIGHT MODE - gates, no confirmation)
    
     Contains "--tweak"? → Builder Direct (TWEAK MODE - no gates)
    
     Contains "--complex"? → Full pipeline (architect + all gates, with confirmation)
    
     Contains "--audit"? → Audit Mode
    
     Otherwise (default):
        
        Team Confirmation
            
             Confirmed → Command light path (DEFAULT MODE - with gates)
            
             Complexity detected:
                
                 Has spec? → Full pipeline (architect + all gates)
                
                 No spec? → BLOCKED (run /requirements first)
```

## Lane Light Paths (flat pattern)

The light-orchestrator agent tier was archived 2026-05-27. Default/light/tweak modes are
run by the domain COMMAND itself, in the main thread, spawning builder + gates
single-level:

| Lane | Light path owner | Gates |
|------|------------------|-------|
| iOS | `/ios` command (main thread) | `ios-standards-enforcer`, `ios-ui-reviewer` |
| Next.js | `/nextjs` command (main thread) | `nextjs-standards-enforcer`, `design-validator` (design floor) |
| Expo | `/expo` command (main thread) | `expo-standards-enforcer`, `a11y-enforcer`, `performance-enforcer` |
| Django-React | `/django-react` command (main thread) | `django-react-standards-enforcer` |
| OS-Dev | `/orca-os-dev` command (main thread) | `os-dev-standards-enforcer` |

Light path behavior:
- **LIGHT mode**: builder → gates → report (no confirmation)
- **DEFAULT mode**: confirmation → builder → gates → report
- **TWEAK mode**: builder direct → report (skip gates)
- Quick context (direct file read, minimal ProjectContext)
- Ephemeral phase_state (scores for current run only)

## See Also

- [Pipeline Model](pipeline-model.md) - Full pipeline architecture
- [Memory Systems](memory-systems.md) - How context is gathered
