# Pipeline Model

OS 4.2 uses a **multi-lane pipeline architecture** to handle different types of development work. Each "lane" is a domain-specific pipeline with its own agents, phases, and gates.

## Core Concepts

### Lanes (Domain Pipelines)

A **lane** is a complete pipeline for a specific development domain:

| Lane | Domain | Entry Point |
|------|--------|-------------|
| iOS | Native iOS (Swift/SwiftUI/UIKit) | `/ios` |
| Next.js | Next.js frontend | `/nextjs` |
| Expo | React Native/Expo mobile | `/expo` |
| Data | Data analysis and research | via `/orca` |
| SEO | SEO content pipeline | via `/orca` |
| Design | Design system work | via `/orca` |
| OS-Dev | OS configuration (LOCAL only) | `/orca-os-dev` |

The main `/orca` command auto-detects domain and routes to the appropriate lane.

### Phases

Every lane follows a similar phase structure:

```
Request
    ↓
[Phase 0: Memory-First Context]     ← Workshop + code-index.db
    ↓
[Phase 0.5: Complexity Classification]
    ↓
 SIMPLE → [Light Orchestrator] → Done

 MEDIUM/COMPLEX:
    ↓
[Phase 1: Team Confirmation]        ← User approves agents
    ↓
[Phase 2: ProjectContext Query]     ← ContextBundle
    ↓
[Phase 3: Planning/Architecture]    ← Grand Architect
    ↓
[Phase 4: Implementation]           ← Specialists
    ↓
[Phase 5: Gates & Verification]     ← Standards + Tests
    ↓
[Phase 6: Completion & Learning]    ← Save history
```

### Agent Roles

OS 4.2 enforces strict role separation:

#### Orchestrators (Never Write Code)
- **Commands**: `/orca`, `/ios`, `/nextjs`, etc.
- **Grand Architects**: `ios-grand-architect`, `nextjs-grand-architect`, etc.
- **Light Orchestrators**: `ios-light-orchestrator`, `nextjs-light-orchestrator`, etc.

Orchestrators:
- Classify complexity
- Query context (memory + ProjectContext)
- Delegate to specialists via `Task` tool
- Track phase state
- Never use `Edit`/`Write` tools

#### Specialists (Implement Changes)
Domain experts that do the actual work:
- `ios-swiftui-specialist`, `ios-uikit-specialist`
- `nextjs-builder`, `tailwind-specialist`, `shadcn-specialist`
- `expo-builder`, `react-state-specialist`
- etc.

Specialists:
- Receive scoped tasks from orchestrators
- Read and edit files
- Report changes back to orchestrator
- Tag assumptions with RA tags

#### Gates (Validate Quality)
Verification agents that check work:
- `ios-standards-enforcer`, `ios-verification`
- `nextjs-standards-enforcer`, `nextjs-design-reviewer`, `nextjs-verification-agent`
- `expo-verification-agent`, `design-token-guardian`
- etc.

Gates:
- Run tests, linters, checks
- Score against standards
- Report PASS/CAUTION/FAIL
- Never fix issues (report only)

In some lanes (starting with Next.js), gates are backed by **programmatic enforcement**:

- Design QA gates require:
  - A structured design review report saved under `.claude/orchestration/evidence/`
  - Explicit coverage declaration and pixel measurements
  - Evidence paths recorded in `phase_state.gates.design_qa.evidence_paths`
  - A pre-tool hook (`hooks/gate-enforcement.sh`) that blocks any attempt
    to set `gate_decision: "PASS"` without valid evidence.

- Verification gates require:
  - `verification.commands_run` in `phase_state` to list the exact commands
    the agent claims to have executed (e.g. `npm run lint`, `npm run build`)
  - A hook that checks each claimed command against a Bash command log and
    blocks `verification_status: "pass"` if those commands were never actually run.

This keeps "PASS" decisions grounded in **real artifacts and commands on disk**, not just model self-reporting.

## The Orchestrator-Specialist-Gate Pattern

```
                    
                       Orchestrator  
                      (coordinates)  
                    
                             
              
                                          
            
        Specialist  Specialist  Specialist
           (CSS)     (Liquid)      (JS)   
            
                                         
             
                            
                    
                          Gate       
                      (validates)    
                    
```

1. **Orchestrator** receives task, classifies complexity, gathers context
2. **Orchestrator** delegates to appropriate **Specialists** via `Task` tool
3. **Specialists** implement changes and report back
4. **Orchestrator** sends changes to **Gate** for validation
5. **Gate** reports pass/fail; if fail, orchestrator may request corrective pass
6. **Orchestrator** logs outcome and returns summary to user

## State Preservation

Pipelines preserve state across interruptions using `phase_state.json`:

```json
{
  "domain": "ios",
  "task": "Add haptic feedback to save button",
  "phase": "implementation",
  "status": "in_progress",
  "complexity_tier": "simple",
  "context": { ... },
  "implementation": { ... },
  "gates": { ... }
}
```

When user interrupts (questions, clarifications):
1. Orchestrator reads `phase_state.json`
2. Acknowledges interruption
3. Processes new information
4. Resumes from appropriate phase
5. Does NOT abandon pipeline or switch to direct implementation

## See Also

- [Complexity Routing](complexity-routing.md) - How tasks are classified and routed
- [Memory Systems](memory-systems.md) - How context flows into pipelines
- [Response Awareness](response-awareness.md) - How assumptions are tracked
