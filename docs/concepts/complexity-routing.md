# Complexity Routing – OS 4.2 Three-Tier Structure

OS 4.2 uses **three-tier routing** to optimize for speed while maintaining quality gates.

## Three-Tier Routing Table

| Mode | Flag | Path | Gates | Use Case |
|------|------|------|-------|----------|
| **Default** | (none) | Light + Gates | YES | Most work – fast with quality |
| **Tweak** | `-tweak` | Light (pure) | NO | Speed iteration, user verifies |
| **Complex** | `--complex` | Full pipeline | YES | Architecture, multi-file, specs |

**Key Inversion (v4.2):** Default now runs gates. Previous versions skipped them.

## Default Mode (Light + Gates)

Most tasks take this path. Fast execution with automated quality checks.

**Indicators:**
- 1-5 files affected
- Single screen/section changes
- UI tweaks, component updates
- Copy/label changes
- Simple logic changes

**Route:** Light orchestrator → builder → gates → done

**Gates run (domain-specific):**
- Next.js: `nextjs-standards-enforcer` + `nextjs-design-reviewer`
- iOS: `ios-standards-enforcer` + `ios-ui-reviewer`
- Expo: `design-token-guardian` + `expo-aesthetics-specialist`

## Tweak Mode (`-tweak`)

Pure speed path. User explicitly accepts responsibility for verification.

**Use when:**
- Rapid iteration
- Exploring options
- Minor adjustments
- You'll verify yourself

**Route:** Light orchestrator → builder → done (skip gates)

## Complex Mode (`--complex`)

Full pipeline with grand-architect planning.

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
| Default | 1-5 | 2-4 | Light orchestrator + builder + gates |
| Tweak | 1-3 | 1-2 | Light orchestrator + builder only |
| Complex | 5+ | 5-10 | Grand-architect + architect + builders + all gates |

### Extended Thinking (Complex Mode)

Grand-architects use thinking prompts for complex tasks:

- "Let me think through the architecture and delegation strategy..."
- "Think harder about the implications, dependencies, and potential failure modes..."

This aligns with Anthropic best practices for complex reasoning tasks.

## Flags Reference

### No Flag (Default)

Light path WITH quality gates:

```bash
/ios "fix button padding"
/nextjs "update header text"
/expo "adjust card spacing"
```

Fast execution + automated quality checks. Best for most work.

### `-tweak` Flag

Light path WITHOUT gates (pure speed):

```bash
/ios -tweak "fix button padding"
/nextjs -tweak "update header text"
/expo -tweak "adjust card spacing"
```

Use when iterating quickly and you'll verify yourself.

### `--complex` Flag

Force full pipeline with grand-architect:

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
  /plan "description of the feature"

Then return with:
  /ios "implement requirement <id>"
```

Specs live at: `.claude/requirements/<id>/06-requirements-spec.md`

Created by `/plan`, consumed by domain orchestrators.

## Routing Flow

```
Parse Arguments
    
     Contains "-tweak"? → Light Orchestrator (TWEAK MODE - no gates)
    
     Contains "--complex"? → Grand-Architect (full pipeline)
    
     Contains "--audit"? → Audit Mode
    
     Otherwise (default):
        
        Assess Complexity
            
             SIMPLE/MEDIUM → Light Orchestrator (DEFAULT MODE - with gates)
            
             COMPLEX (detected):
                
                 Has spec? → Grand-Architect (full pipeline)
                
                 No spec? → BLOCKED (run /plan first)
```

## Light Orchestrators

Handle default and tweak modes:

| Lane | Light Orchestrator | Gates |
|------|-------------------|-------|
| iOS | `ios-light-orchestrator` | `ios-standards-enforcer`, `ios-ui-reviewer` |
| Next.js | `nextjs-light-orchestrator` | `nextjs-standards-enforcer`, `nextjs-design-reviewer` |
| Expo | `expo-light-orchestrator` | `design-token-guardian`, `expo-aesthetics-specialist` |

Light orchestrators:
- **DEFAULT mode**: builder → gates → report
- **TWEAK mode**: builder → report (skip gates)
- Quick context (direct file read, minimal ProjectContext)
- Ephemeral phase_state (scores for current run only)
- No team confirmation ceremony

## See Also

- [Pipeline Model](pipeline-model.md) - Full pipeline architecture
- [Memory Systems](memory-systems.md) - How context is gathered
