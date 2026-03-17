---
description: Transform vague requests into well-structured prompts using intelligent step selection and Claude 4 best practices. Supports clarify-only mode with -clarify flag.
allowed-tools:
  - exit_plan_mode
  - Read
  - Glob
  - Task
  - AskUserQuestion
argument-hint: [--debug] [-clarify] <request to enhance>
---

# STOP! This is the /enhance command - Enhancement Only!

**YOUR SOLE PURPOSE**: Transform the user's request into an enhanced prompt, then seek approval.

**YOU MUST**:
1. Follow the enhancement process below
2. Present the enhanced prompt clearly
3. Ask for user approval before any execution

**YOU MUST NOT**:
1. Start executing immediately
2. Create implementation todos before approval
3. Jump to fixing/implementing without permission

**Original Request to Enhance**: $ARGUMENTS

## Check for Debug Mode

If $ARGUMENTS starts with "--debug", enable verbose mode:
- Remove "--debug" from $ARGUMENTS before processing
- Set DEBUG_MODE = true
- Show all analysis steps and reasoning
Otherwise:
- Set DEBUG_MODE = false  
- Provide compact, focused output

## Clarify Mode (-clarify)

If $ARGUMENTS starts with "-clarify":
- Remove "-clarify" from $ARGUMENTS before processing
- Goal: Ask 2–3 targeted questions to unblock the task, then stop
- Produce ONLY:
  - A single AskUserQuestion with up to 3 crisp, non-overlapping questions
  - After answers, return a 3–5 line summary and 3 acceptance criteria
- Do NOT generate a full enhanced prompt or orchestration plan in this mode
- Suggest: "Run /enhance again without -clarify to generate the final enhanced prompt"

## Phase 1: Context Analysis & Intelligence Gathering

If DEBUG_MODE, tell the user: " Debug mode enabled. Showing detailed analysis..."
Otherwise, tell the user: " Enhancing your request..."

### Handle Empty Arguments
If $ARGUMENTS is empty or just whitespace:
- Ask the user to provide a request with examples
- DO NOT guess from conversation history
- Show examples: `/enhance fix bug`, `/enhance implement feature X`

### Analyze Request Context
Understand the request by identifying:
- **What's being changed**: Code, configuration, documentation, infrastructure
- **Risk level**: Production impact, data handling, security implications
- **Scope**: Single line fix vs architectural change
- **Technology context**: Language, framework, available tools
- **Project size**: Consider actual codebase size and complexity for realistic goals

### CRITICAL: Design/UX Work Detection

**Check if this is design/UX work:**
- Page redesign, layout changes, visual design
- New UI features, information architecture
- "Make it elegant", "improve UX", "redesign"
- Requests about how something should "feel" or "look"

**If YES → Note design context:**

```
 DESIGN/UX WORK DETECTED

This request involves visual/UX decisions. The enhanced prompt will include:
1. Design system context (design-dna.json if available)
2. Aesthetic specialists in orchestration plan
3. Design review gates

Proceeding with design-aware enhancement...
```

**For design work, ensure orchestration includes:**
- `nextjs-design-reviewer` or `expo-aesthetics-specialist`
- Design system context loading
- Visual review gates

### Read Project Rules
Check for and read CLAUDE.md files:
- Use Read or Glob to find CLAUDE.md in current and parent directories
- Extract rules relevant to the detected context
- Store for inclusion in enhancement

## Phase 2: Intelligent Step Selection

Based on your analysis, dynamically select relevant steps from the dictionary below.
No rigid rules - use Claude's reasoning to pick what adds value.

### Selection Guidelines

**Baseline (all requests):**
- Steps 1-2 (Claude 4 fundamentals: clarity and context)
- Step 7 (load project rules)
- Step 8 (parse requirements)

**Risk-Based Additions:**
- **Low risk** (typo, docs): Baseline only
- **Medium risk** (features): Add steps 3, 5, 9, 11, 15a (think_assessment)
- **High risk** (auth, payments): Add steps 10, 12, 13, 15a (think_assessment), 16
- **Critical** (production): All relevant steps + 15a (think_assessment MANDATORY)

**Examples:**
- "Fix typo in README" → [1, 2, 7, 8]
- "Add login feature" → [1, 2, 3, 5, 6, 7, 8, 9, 11, 16, 18]
- "Database migration" → [1, 2, 7, 8, 9, 13, 17, 20]
- "Production deploy" → [1, 2, 5, 7, 8, 9, 13, 14, 23, 24]

Mark operations that can run in parallel with 

## Phase 3: Step Dictionary

### Claude 4 Foundation Steps (1-6)
1. **BE_CLEAR_EXPLICIT**: Write precise, unambiguous requirements with specific expectations
2. **PROVIDE_CONTEXT**: Explain why this matters and motivation behind the task
3. **USE_EXAMPLES**: Include relevant examples that match desired behavior and output
4. **FORMAT_MATCHING**: Match prompt style to desired output style (e.g., avoid markdown if not wanted)
5. **PARALLEL_TOOLS**: Identify operations that can run simultaneously for efficiency 
6. **ROLE_PROMPTING**: Define specific expert role (e.g., "Act as a senior security engineer")

### Core Enhancement Steps (7-10)
7. **CONTEXT_LOAD**: Read CLAUDE.md and incorporate project-specific rules
8. **REQUIREMENT_PARSE**: Extract and structure clear requirements from the request
9. **CONTRARIAN_THINK**: Challenge assumptions, identify risks, find edge cases
10. **GENERAL_SOLUTION**: Focus on robust, generalizable solutions (not just passing tests)

### Validation & Review Steps (11-15)
11. **TEST_STRATEGY**: Define comprehensive test scenarios and coverage requirements
12. **CODE_REVIEW**: If zen MCP available, trigger deep code analysis
13. **ROLLBACK_PLAN**: Create recovery strategy for potential failures
14. **MONITORING**: Define observability, metrics, and alerting requirements
15. **VALIDATION_CRITERIA**: Set clear success metrics and acceptance criteria
15a. **THINK_ASSESSMENT**: For medium/high/critical risk tasks, require /think before claiming completion to prevent overclaiming (prevents ~80% false completion rate)

### Specialized Domain Steps (16-25)
16. **SECURITY_AUDIT**: Vulnerability scanning, threat modeling, sanitization checks
17. **MIGRATION_PLAN**: Schema changes, data transformation, backup verification
18. **API_CONTRACT**: Interface compatibility, versioning, backward compatibility
19. **ACCESSIBILITY**: ARIA labels, keyboard navigation, screen reader support
20. **PERFORMANCE_PROFILE**: Bottleneck analysis, caching strategy, optimization
21. **COMPLIANCE_CHECK**: GDPR, SOC2, PCI, regulatory requirements
22. **SCALING_REVIEW**: Load handling, capacity planning, resource limits
23. **FEATURE_FLAG**: Progressive rollout, A/B testing, kill switch
24. **INCIDENT_PREP**: Runbook creation, alert configuration, on-call setup
25. **ARCHITECTURE_REVIEW**: System design implications, dependency impacts

## Phase 4: Generate Enhanced Prompt

### For DEBUG_MODE = true (verbose output):

Use the FULL format with all details:

```
Enhanced Prompt: [Clear, action-oriented title]

 DEBUG: ANALYSIS RESULTS
- Original request: "$ARGUMENTS"
- Detected context: [What you identified]
- Risk assessment: [Low/Medium/High/Critical]
- Project size: [Small/Medium/Large]

DETECTED TASK TYPE:
Primary intent: [Implementation/Analysis/Debugging/Documentation/Architecture]
Relevant contexts: [file-operations, testing, code-quality, etc.]
Risk level: [Low/Medium/High/Critical]

INTELLIGENT STEP SELECTION:
Applied steps from dictionary: [1, 2, 7, 8, ...] 
- Step 1 (BE_CLEAR_EXPLICIT): For precise requirements
- Step 2 (PROVIDE_CONTEXT): To explain motivation
- Step 7 (CONTEXT_LOAD): To read project rules
[Continue for each selected step with reasoning]

CONTEXT & MOTIVATION:
[3-5 sentences explaining why this matters]
[Background information and current situation]
[Why each requirement is important]

CONTRARIAN ANALYSIS:
[If step 9 selected, include challenging questions]
- Is this solving the real problem or just symptoms?
- What assumptions are we making that could be wrong?
- Could a simpler approach achieve the same result?
- What if we did nothing instead?
- Is there a 10x better solution we're missing?

MEMORY & PAST SOLUTIONS:
[Check for relevant past work]
- If claude-self-reflect available: Search for "[relevant terms]"
- If not available: Check git log for similar changes
- Expected insights: [what we might learn from history]

EXTERNAL TOOLS & RESOURCES:
[Recommend MCP tools based on task and availability]
- If zen MCP available: Use [specific zen tools] for [purpose]
- If context7 available: Fetch documentation for [libraries/frameworks]
- If claude-self-reflect available: Search past solutions for [pattern]
- If grep MCP available: Search GitHub for [code examples]
- Fallback tools: Use Read/Glob/Task for [specific purposes]

PROJECT RULES (from CLAUDE.md):
[Detected context: list categories]
- [Specific rule relevant to this context]
- [Another relevant rule]
- [Only include rules that directly apply]

OBJECTIVE:
[One clear sentence stating what needs to be accomplished]

REQUIREMENTS:
Based on selected steps, the requirements are:
- [Clear requirement 1] 
- [Clear requirement 2] 
- [Mark parallel operations with ]
- [Each should be measurable]
- [Include validation steps from selected steps]

ORCHESTRATION PLAN:
[Intelligently select agents and skills based on task context]

**Required Skills:**
- If UI/design work → design-dna-skill
- If creating components → uxscii-component-creator skill
- If needs clarification mid-workflow → Use AskUserQuestion (NOT brainstorming)

**Agent Waves (execute in parallel where possible):**

Wave 1 - Planning & Analysis:
   [If needs architecture] → Domain grand-architect (nextjs-grand-architect, ios-grand-architect, expo-grand-orchestrator)
   [If needs design/UX] → Design specialists (nextjs-design-reviewer, expo-aesthetics-specialist, design-token-guardian)

Wave 2 - Implementation:
  → [domain-specific specialists]:
    - iOS: ios-swiftui-specialist, ios-uikit-specialist, ios-persistence-specialist
    - Next.js: nextjs-typescript-specialist, tailwind-specialist, shadcn-specialist, nextjs-layout-specialist
    - Expo: expo-builder-agent, refactor-surgeon
  [Implementation specialists run after planning completes]

Wave 3 - Quality Gates (MANDATORY):
  → Domain verification agent (nextjs-verification-agent, ios-verification, expo-verification-agent)
  → [If security-sensitive] security-specialist

**Task List with Agent Assignments:**
1. [Task description] → Use [specific skill/agent]
2. [Task description] → Use [specific skill/agent]
3. Review implementation → Use domain verification agent (MANDATORY)

**Agent Selection Guide:**
- UI/CSS/styling/UX → Design specialists (nextjs-design-reviewer, expo-aesthetics-specialist, design-token-guardian)
- React/Next.js/Web → nextjs-typescript-specialist, tailwind-specialist, shadcn-specialist, nextjs-builder
- iOS/Swift/SwiftUI → ios-swiftui-specialist, ios-persistence-specialist, ios-testing-specialist
- Expo/React Native → expo-builder-agent, refactor-surgeon, test-generator
- Data/Research → python-analytics-expert, data-researcher, research-specialist
- SEO → seo-research-specialist, seo-draft-writer, seo-quality-guardian
- Code review → Domain verification agent (ALWAYS)
- Security → security-specialist
- Complex orchestration → Use /orca command

EDGE CASES & ROBUSTNESS:
- [Boundary conditions: empty, null, maximum values]
- [Concurrent access scenarios]
- [External dependency failures]
- [Security implications]
- [Performance under load]
- [Error recovery paths]

CONSTRAINTS:
- [Technical limitations]
- [Time constraints]
- [Resource constraints]
- [Compatibility requirements]

DELIVERABLES:
- [Specific output 1]
- [Specific output 2]
- [Documentation updates]
- [Test coverage if step 11 selected]

SUCCESS CRITERIA:
- [ ] [Measurable outcome 1]
- [ ] [Measurable outcome 2]
- [ ] All tests pass (if step 11 selected)
- [ ] Code review passed (if step 12 selected)
- [ ] Security validated (if step 16 selected)
- [ ] Performance targets met (if step 20 selected)
- [ ] Edge cases handled gracefully
- [ ] Documentation updated
- [ ] **THINK ASSESSMENT** (if step 15a selected for medium/high/critical risk):
  Before claiming work complete, run: `/think "Assess actual vs claimed completion: What evidence proves we delivered? Am I overclaiming? What's missing?"`
  This prevents the ~80% false completion rate by forcing multi-perspective analysis before completion claims.

MEASURABLE OUTCOMES:
[Be realistic based on project scope and complexity]
- [ ] [Achievable deliverable based on actual codebase size]
- [ ] [Realistic quality metric - e.g., "10-20% improvement" not "50% reduction"]
- [ ] [Practical performance target aligned with current baseline]
- [ ] [User acceptance criteria that can be verified]

IMPORTANT: Keep measurable outcomes realistic:
- For small projects: Focus on incremental improvements (10-30%)
- For bug discovery: 2-3 real bugs is more realistic than 5 critical bugs
- For optimization: Consider current performance baseline
- For new features: Account for learning curve and integration complexity
```

### For DEBUG_MODE = false (compact output):

Use this STREAMLINED format without verbose details:

```
Enhanced Prompt: [Clear, action-oriented title]

OBJECTIVE:
[One clear sentence stating what needs to be accomplished]

CONTEXT:
[2-3 sentences on why this matters and current situation]

APPROACH:
Using intelligent analysis, I've selected [number] enhancement steps focusing on [key areas].

REQUIREMENTS:
- [Core requirement 1] 
- [Core requirement 2] 
- [Core requirement 3]
[List 5-7 most important requirements with parallel markers]

ORCHESTRATION PLAN:
**Skills:** [e.g., design-dna-skill (if UI), uxscii-component-creator (if components)]
**Agents:**
- Wave 1: [Domain grand-architect, design specialists] 
- Wave 2: [Domain-specific implementation agents]
- Wave 3: Domain verification agent (MANDATORY)

**Todos:**
1. [Task] → [agent/skill to use]
2. [Task] → [agent/skill to use]
3. Review → Domain verification agent

KEY CONSIDERATIONS:
- [Most important edge case or risk]
- [Critical constraint]
- [Primary validation need]

TOOLS & RESOURCES:
- Primary: [Most relevant MCP tool if available]
- Memory: [Quick search term for past solutions]
- Fallback: [Core allowed tools]

DELIVERABLES:
- [Main output 1]
- [Main output 2]
- [Test/validation requirement]

SUCCESS CRITERIA:
- [ ] [Most important measurable outcome]
- [ ] [Second key metric - realistic target]
- [ ] [Quality validation]
```

## Phase 5: Present Using exit_plan_mode

After generating and displaying the enhanced prompt above, call exit_plan_mode with the complete enhanced prompt:

```
exit_plan_mode(plan="[Your complete enhanced prompt here]")
```

This will create the Yes/No arrow selection modal for user approval.

---

## Response Awareness Note

If the enhanced prompt leads to implementation work, the orchestration system will automatically apply Response Awareness methodology:

- Implementation agents tag assumptions with meta-cognitive tags (#COMPLETION_DRIVE, #CARGO_CULT, etc.)
- verification-agent verifies all tagged assumptions after implementation
- quality-validator enforces Zero-Tag Gate before deployment

**You don't need to include Response Awareness instructions in enhanced prompts** - the orchestration system handles this automatically.

See: `docs/RESPONSE_AWARENESS_TAGS.md` for complete tag taxonomy.

---

## Remember

**For NORMAL mode (default):**
- Use compact format - focus on essentials
- Don't show step numbers or selection reasoning
- Keep output concise and actionable
- Include only the most critical requirements and success criteria
- ALWAYS ask for approval before execution

**For DEBUG mode (--debug flag):**
- Use verbose format with all sections
- Show step selection reasoning
- Include detailed analysis results
- Display all requirements and considerations
- Still ask for approval before execution

**Both modes:**
- Start with appropriate greeting ( or )
- Trust Claude's intelligence to select relevant steps
- Mark parallel operations with  for efficiency
- Focus on clarity and context (Claude 4 fundamentals)
- BE REALISTIC in measurable outcomes based on project scope
- ALWAYS seek user approval before executing

The goal is to provide the right level of detail: compact for quick enhancement, verbose for understanding the analysis process, but ALWAYS with user control over execution.
