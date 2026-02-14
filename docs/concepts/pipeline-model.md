# Pipeline Model

**Version:** OS 6.0 | **Last Updated:** 2026-01-24

OS 6.0 uses a **multi-lane pipeline architecture** to handle different types of development work. Each "lane" is a domain-specific pipeline with its own agents, phases, and gates.

## Core Concepts

### Lanes (Domain Pipelines)

A **lane** is a complete pipeline for a specific development domain:

| Lane | Domain | Entry Point |
|------|--------|-------------|
| iOS | Native iOS (Swift/SwiftUI/UIKit) | `/ios` |
| Next.js | Next.js frontend | `/nextjs` |
| Django-React | Django + React full-stack | `/django-react` |
| Expo | React Native/Expo mobile | `/expo` |
| Research | Web research and synthesis | `/research` |
| SEO | SEO content pipeline | `/seo` |
| Data | Data analysis and research | (no dedicated command) |
| OS-Dev | OS configuration (LOCAL only) | `/orca-os-dev` |
| Orca-Pipeline | Meta-pipeline creation | `/orca-pipeline` |
| Audit | Due diligence audits | `/audit` |
| Typography | Font library management | `/typography` |

The main `/orca` command auto-detects domain and routes to the appropriate lane.

### Phases

Every lane follows a similar phase structure:

```
Request
    ↓
Parse flags
    ↓
 No flag (default) → [Light Orchestrator] → Builder → Gates → Done
    ↓
 -tweak → [Light Orchestrator] → Builder → Done (no gates)
    ↓
 --complex → [Grand Architect] → Full pipeline:
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

OS 6.0 enforces strict role separation:

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

## MCP Tool Propagation Limitation

MCP tools declared in agent YAML frontmatter (`tools:` field) are available to
that agent but do **not** propagate to subagents spawned via the `Task` tool.
This is a Claude Code platform constraint: each Task invocation creates an
isolated execution context without inheriting the parent's MCP connections.

**Workaround:** Subagents that need MCP functionality should call the MCP
server's REST API directly using `Bash` with `curl`. For example, the research
pipeline's crawler subagent uses:

```bash
curl -s "http://localhost:11235/md?url=<target>" | head -c 50000
```

instead of `mcp__crawl4ai__md`. This pattern -- Bash/curl to localhost -- is the
canonical workaround for any subagent that needs MCP data.

**Canonical example:** `agents/research/research-site-crawler-subagent.md`

## Recording Layer

OS 6.0 pipelines are observed by the **recording layer** (`orca-record` CLI + `.orca/recording.db`). Every pipeline session can be recorded, checkpointed, and rewound:

- **Session recording**: `orca-record start` / `orca-record stop` capture tool calls, decisions, and file changes to a per-project SQLite database
- **Git checkpoints**: `orca-record checkpoint` creates lightweight snapshots on a shadow git branch, enabling `orca-record rewind` to any prior state
- **Cognitive fusion**: 7 cognition-mcp recording operations (`recording_status`, `recording_query`, `recording_checkpoint`, `recording_compare`, `recording_quality`, `recording_explain`, `recording_rewind`) bridge structured reasoning with session history
- **Condensation**: `orca-record condense` compresses checkpoint history to the `orca/checkpoints/v1` orphan branch for long-term storage

Recording is orthogonal to pipeline phases -- it wraps around the entire session, not individual phases.

## See Also

- [Complexity Routing](complexity-routing.md) - How tasks are classified and routed
- [Memory Systems](memory-systems.md) - How context flows into pipelines
- [Response Awareness](response-awareness.md) - How assumptions are tracked
