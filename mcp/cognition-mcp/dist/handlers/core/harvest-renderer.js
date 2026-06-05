/**
 * Rich Harvest Renderer - Comprehensive session log renderer
 *
 * Renders all session data (30+ store types) into a rich markdown document
 * matching the RVRY engine log format: <details> blocks for content,
 * constraint state per checkpoint, gate results inline, and full
 * analytical text preserved.
 *
 * Called by autoPersistHarvest in checkpoint.ts at harvest phase.
 */
// ============================================================================
// STORE LABEL MAPPING (display labels only)
// ============================================================================
export const STORE_LABELS = {
    thoughts: 'Thought',
    mentalModels: 'Mental Model',
    debugging: 'Debug',
    decisions: 'Decision',
    meta: 'Meta',
    systems: 'Systems Map',
    creative: 'Creative Thinking',
    visual: 'Visual Reasoning',
    checkpoints: 'Checkpoint',
    scientific: 'Scientific Method',
    collaborative: 'Collaborative Reasoning',
    socratic: 'Socratic Method',
    argumentation: 'Structured Argumentation',
    tree: 'Tree of Thought',
    beam: 'Beam Search',
    mcts: 'MCTS',
    graph: 'Graph of Thought',
    orchestration: 'Orchestration',
    research: 'Research',
    analogical: 'Analogical Reasoning',
    causal: 'Causal Analysis',
    statistical: 'Statistical Reasoning',
    simulation: 'Simulation',
    optimization: 'Optimization',
    ethical: 'Ethical Analysis',
    dashboard: 'Dashboard',
    pdr: 'PDR Reasoning',
    customFramework: 'Custom Framework',
    codeExecution: 'Code Execution',
    ooda: 'OODA Loop',
    ulysses: 'Ulysses Protocol',
    notebookCreate: 'Notebook Create',
    notebookCell: 'Notebook Cell',
    notebookRun: 'Notebook Run',
    notebookExport: 'Notebook Export',
    audit: 'Audit',
};
// ============================================================================
// TOKEN ESTIMATION
// ============================================================================
function estimateTokens(entry) {
    if (entry.tokenEstimate && entry.tokenEstimate > 0) {
        return { tokens: entry.tokenEstimate, source: 'reported' };
    }
    const json = JSON.stringify(entry.content);
    return { tokens: Math.ceil(json.length / 4), source: 'estimated' };
}
// ============================================================================
// TIME FORMATTING
// ============================================================================
function formatAbsoluteTime(timestamp) {
    const d = new Date(timestamp);
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    const s = String(d.getSeconds()).padStart(2, '0');
    return `${h}:${m}:${s}`;
}
function formatRelativeTime(elapsedMs) {
    const totalSeconds = Math.floor(elapsedMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    if (minutes > 0) {
        return `+${minutes}m ${seconds}s`;
    }
    return `+${seconds}s`;
}
function formatDuration(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
}
// ============================================================================
// TYPE-SPECIFIC RENDERERS
// Each returns the FULL content for display inside a <details> block.
// ============================================================================
function renderThought(c) {
    const lines = [];
    if (c.branchId)
        lines.push(`**Branch**: ${c.branchId}`);
    if (c.isRevision)
        lines.push(`**Revises**: Thought ${c.revisesThought}`);
    if (c.thoughtNumber || c.totalThoughts) {
        lines.push(`**Progress**: ${c.thoughtNumber || '?'}/${c.totalThoughts || '?'}`);
    }
    lines.push('');
    if (c.thought)
        lines.push(String(c.thought));
    return lines.join('\n');
}
function renderMentalModel(c) {
    const lines = [];
    if (c.modelName)
        lines.push(`**Model**: ${c.modelName}`);
    if (c.problem)
        lines.push(`**Problem**: ${c.problem}`);
    if (c.setup)
        lines.push(`\n**Setup**: ${c.setup}`);
    if (Array.isArray(c.steps) && c.steps.length > 0) {
        lines.push('\n**Steps**:');
        for (const s of c.steps)
            lines.push(`- ${s}`);
    }
    if (Array.isArray(c.rootCauses) && c.rootCauses.length > 0) {
        lines.push('\n**Root Causes**:');
        for (const rc of c.rootCauses) {
            lines.push(`- ${rc.failure}: ${rc.cause} (preventable: ${rc.preventable})`);
        }
    }
    if (c.reasoning)
        lines.push(`\n**Reasoning**: ${c.reasoning}`);
    if (c.conclusion)
        lines.push(`\n**Conclusion**: ${c.conclusion}`);
    return lines.join('\n');
}
function renderCheckpointContent(c) {
    const lines = [];
    if (c.summary)
        lines.push(String(c.summary));
    if (Array.isArray(c.keyFindings) && c.keyFindings.length > 0) {
        lines.push('\n**Key Findings**:');
        for (const f of c.keyFindings)
            lines.push(`- ${f}`);
    }
    if (Array.isArray(c.openQuestions) && c.openQuestions.length > 0) {
        lines.push('\n**Open Questions**:');
        for (const q of c.openQuestions)
            lines.push(`- ${q}`);
    }
    if (Array.isArray(c.nextSteps) && c.nextSteps.length > 0) {
        lines.push('\n**Next Steps**:');
        for (const s of c.nextSteps)
            lines.push(`- ${s}`);
    }
    return lines.join('\n');
}
function renderDecision(c) {
    const lines = [];
    if (c.statement)
        lines.push(`**Decision**: ${c.statement}`);
    if (Array.isArray(c.options)) {
        lines.push('\n**Options**:');
        for (const opt of c.options) {
            lines.push(`\n  **${opt.name}**: ${opt.description}`);
            if (opt.pros?.length)
                lines.push(`  - Pros: ${opt.pros.join(', ')}`);
            if (opt.cons?.length)
                lines.push(`  - Cons: ${opt.cons.join(', ')}`);
        }
    }
    if (Array.isArray(c.criteria) && c.criteria.length > 0) {
        lines.push(`\n**Criteria**: ${c.criteria.join(', ')}`);
    }
    if (c.weights)
        lines.push(`**Weights**: ${JSON.stringify(c.weights)}`);
    if (c.scores)
        lines.push(`**Scores**: ${JSON.stringify(c.scores)}`);
    if (c.analysis)
        lines.push(`\n**Analysis**: ${c.analysis}`);
    if (c.choice)
        lines.push(`\n**Choice**: ${c.choice}`);
    if (c.confidence !== undefined)
        lines.push(`**Confidence**: ${c.confidence}`);
    return lines.join('\n');
}
function renderMeta(c) {
    const lines = [];
    if (c.process)
        lines.push(`**Process**: ${c.process}`);
    if (Array.isArray(c.observations) && c.observations.length > 0) {
        lines.push('\n**Observations**:');
        for (const o of c.observations)
            lines.push(`- ${o}`);
    }
    if (Array.isArray(c.adjustments) && c.adjustments.length > 0) {
        lines.push('\n**Adjustments**:');
        for (const a of c.adjustments)
            lines.push(`- ${a}`);
    }
    if (c.insights)
        lines.push(`\n**Insights**: ${c.insights}`);
    if (c.effectiveness !== undefined)
        lines.push(`**Effectiveness**: ${c.effectiveness}`);
    if (c.defaultCounterfactual) {
        const dc = c.defaultCounterfactual;
        lines.push('\n**Default Counterfactual**:');
        lines.push(`  - Trained default: ${dc.trainedDefault}`);
        lines.push(`  - Reasoned conclusion: ${dc.reasonedConclusion}`);
        lines.push(`  - Gap: ${dc.gap}`);
    }
    if (Array.isArray(c.reflexesObserved) && c.reflexesObserved.length > 0) {
        lines.push('\n**Reflexes Observed**:');
        for (const r of c.reflexesObserved) {
            lines.push(`- ${r.reflex}: ${r.description} (caught: ${r.caught})`);
        }
    }
    if (c.arcPosition)
        lines.push(`**Arc Position**: ${c.arcPosition}`);
    return lines.join('\n');
}
function renderSystems(c) {
    const lines = [];
    if (c.system)
        lines.push(`**System**: ${c.system}`);
    if (Array.isArray(c.components) && c.components.length > 0) {
        lines.push('\n**Components**:');
        for (const comp of c.components) {
            lines.push(`- **${comp.name}**: ${comp.function}`);
        }
    }
    if (Array.isArray(c.relationships) && c.relationships.length > 0) {
        lines.push('\n**Relationships**:');
        for (const rel of c.relationships) {
            lines.push(`- ${rel.from} -> ${rel.to} (${rel.type})`);
        }
    }
    if (Array.isArray(c.feedbackLoops) && c.feedbackLoops.length > 0) {
        lines.push('\n**Feedback Loops**:');
        for (const loop of c.feedbackLoops)
            lines.push(`- ${loop}`);
    }
    return lines.join('\n');
}
function renderCollaborative(c) {
    const lines = [];
    if (c.topic)
        lines.push(`**Topic**: ${c.topic}`);
    if (Array.isArray(c.perspectives)) {
        lines.push('\n**Perspectives**:');
        for (const p of c.perspectives) {
            lines.push(`\n  **${p.role}**: ${p.viewpoint}`);
            if (p.arguments?.length) {
                for (const a of p.arguments)
                    lines.push(`  - ${a}`);
            }
        }
    }
    if (Array.isArray(c.commonGround) && c.commonGround.length > 0) {
        lines.push('\n**Common Ground**:');
        for (const cg of c.commonGround)
            lines.push(`- ${cg}`);
    }
    if (Array.isArray(c.tensions) && c.tensions.length > 0) {
        lines.push('\n**Tensions**:');
        for (const t of c.tensions)
            lines.push(`- ${t}`);
    }
    if (c.synthesis)
        lines.push(`\n**Synthesis**: ${c.synthesis}`);
    return lines.join('\n');
}
function renderCreative(c) {
    const lines = [];
    if (c.prompt)
        lines.push(`**Prompt**: ${c.prompt}`);
    if (Array.isArray(c.techniques) && c.techniques.length > 0) {
        lines.push(`**Techniques**: ${c.techniques.join(', ')}`);
    }
    if (Array.isArray(c.ideas) && c.ideas.length > 0) {
        lines.push('\n**Ideas**:');
        for (const idea of c.ideas) {
            lines.push(`\n  - **${idea.idea}**`);
            lines.push(`    Potential: ${idea.potential}`);
            if (idea.challenges?.length)
                lines.push(`    Challenges: ${idea.challenges.join(', ')}`);
        }
    }
    if (c.synthesis)
        lines.push(`\n**Synthesis**: ${c.synthesis}`);
    return lines.join('\n');
}
function renderArgumentation(c) {
    const lines = [];
    if (c.claim)
        lines.push(`**Claim**: ${c.claim}`);
    if (Array.isArray(c.premises) && c.premises.length > 0) {
        lines.push('\n**Premises**:');
        for (const p of c.premises)
            lines.push(`- ${p}`);
    }
    if (Array.isArray(c.evidence) && c.evidence.length > 0) {
        lines.push('\n**Evidence**:');
        for (const e of c.evidence) {
            lines.push(`- ${e.point} [${e.strength}]${e.source ? ` (${e.source})` : ''}`);
        }
    }
    if (Array.isArray(c.counterarguments) && c.counterarguments.length > 0) {
        lines.push('\n**Counterarguments**:');
        for (const ca of c.counterarguments) {
            lines.push(`- ${ca.point}`);
            lines.push(`  Rebuttal: ${ca.rebuttal}`);
        }
    }
    if (c.conclusion)
        lines.push(`\n**Conclusion**: ${c.conclusion}`);
    return lines.join('\n');
}
function renderTree(c) {
    const lines = [];
    if (c.root)
        lines.push(`**Root**: ${c.root}`);
    if (Array.isArray(c.branches) && c.branches.length > 0) {
        lines.push('\n**Branches**:');
        for (const b of c.branches) {
            const evalStr = typeof b.evaluation === 'string' ? b.evaluation : (b.evaluation ? JSON.stringify(b.evaluation) : '');
            lines.push(`- [${b.id}] ${b.thought}${b.score !== undefined ? ` (score: ${b.score})` : ''}${evalStr ? ` -- ${evalStr}` : ''}`);
        }
    }
    if (Array.isArray(c.bestPath) && c.bestPath.length > 0) {
        lines.push(`\n**Best Path**: ${c.bestPath.join(' -> ')}`);
    }
    if (Array.isArray(c.pruned) && c.pruned.length > 0) {
        lines.push(`**Pruned**: ${c.pruned.join(', ')}`);
    }
    if (c.synthesis)
        lines.push(`\n**Synthesis**: ${c.synthesis}`);
    return lines.join('\n');
}
function renderCausal(c) {
    const lines = [];
    if (c.phenomenon)
        lines.push(`**Phenomenon**: ${c.phenomenon}`);
    if (Array.isArray(c.causes) && c.causes.length > 0) {
        lines.push('\n**Causes**:');
        for (const cause of c.causes) {
            lines.push(`- ${cause.factor} [${cause.type}, ${cause.strength}]${cause.evidence ? ` -- ${cause.evidence}` : ''}`);
        }
    }
    if (Array.isArray(c.effects) && c.effects.length > 0) {
        lines.push('\n**Effects**:');
        for (const e of c.effects) {
            lines.push(`- ${e.outcome} (${e.likelihood}, ${e.timeframe})`);
        }
    }
    if (Array.isArray(c.chains) && c.chains.length > 0) {
        lines.push('\n**Causal Chains**:');
        for (const chain of c.chains) {
            lines.push(`- ${chain.sequence.join(' -> ')} (p=${chain.probability})`);
        }
    }
    if (Array.isArray(c.interventions) && c.interventions.length > 0) {
        lines.push('\n**Interventions**:');
        for (const i of c.interventions)
            lines.push(`- ${i}`);
    }
    return lines.join('\n');
}
function renderSimulation(c) {
    const lines = [];
    if (c.scenario)
        lines.push(`**Scenario**: ${c.scenario}`);
    if (Array.isArray(c.initialConditions) && c.initialConditions.length > 0) {
        lines.push('\n**Initial Conditions**:');
        for (const ic of c.initialConditions) {
            lines.push(`- ${ic.variable}: ${ic.value}`);
        }
    }
    if (Array.isArray(c.steps) && c.steps.length > 0) {
        lines.push('\n**Steps**:');
        for (const s of c.steps) {
            lines.push(`${s.step}. ${s.action} -> ${s.outcome}`);
        }
    }
    if (c.finalState)
        lines.push(`\n**Final State**: ${c.finalState}`);
    if (Array.isArray(c.insights) && c.insights.length > 0) {
        lines.push('\n**Insights**:');
        for (const i of c.insights)
            lines.push(`- ${i}`);
    }
    if (Array.isArray(c.alternativeOutcomes) && c.alternativeOutcomes.length > 0) {
        lines.push('\n**Alternative Outcomes**:');
        for (const ao of c.alternativeOutcomes)
            lines.push(`- ${ao}`);
    }
    return lines.join('\n');
}
function renderUlysses(c) {
    const lines = [];
    if (c.goal)
        lines.push(`**Goal**: ${c.goal}`);
    if (Array.isArray(c.temptations) && c.temptations.length > 0) {
        lines.push('\n**Temptations**:');
        for (const t of c.temptations) {
            lines.push(`- ${t.temptation} (trigger: ${t.trigger}, risk: ${t.risk})`);
        }
    }
    if (Array.isArray(c.commitments) && c.commitments.length > 0) {
        lines.push('\n**Commitments**:');
        for (const cm of c.commitments) {
            lines.push(`- ${cm.commitment} (enforcement: ${cm.enforcement})`);
        }
    }
    if (Array.isArray(c.safeguards) && c.safeguards.length > 0) {
        lines.push('\n**Safeguards**:');
        for (const sg of c.safeguards) {
            lines.push(`- ${sg.safeguard} (trigger: ${sg.trigger})`);
        }
    }
    if (c.escapeHatch)
        lines.push(`\n**Escape Hatch**: ${c.escapeHatch}`);
    return lines.join('\n');
}
function renderOODA(c) {
    const lines = [];
    if (c.situation)
        lines.push(`**Situation**: ${c.situation}`);
    if (c.iteration !== undefined)
        lines.push(`**Iteration**: ${c.iteration}`);
    if (c.observe) {
        const obs = c.observe;
        lines.push('\n**Observe**:');
        if (obs.environment)
            lines.push(`  Environment: ${obs.environment}`);
        if (obs.data?.length) {
            for (const d of obs.data)
                lines.push(`  - ${d}`);
        }
        if (obs.changes?.length) {
            lines.push('  Changes:');
            for (const ch of obs.changes)
                lines.push(`  - ${ch}`);
        }
    }
    if (c.orient) {
        const ori = c.orient;
        lines.push('\n**Orient**:');
        if (ori.analysis)
            lines.push(`  ${ori.analysis}`);
        if (ori.mentalModels?.length)
            lines.push(`  Models: ${ori.mentalModels.join(', ')}`);
    }
    if (c.decide) {
        const dec = c.decide;
        lines.push('\n**Decide**:');
        if (dec.selectedOption)
            lines.push(`  Selected: ${dec.selectedOption}`);
        if (dec.reasoning)
            lines.push(`  Reasoning: ${dec.reasoning}`);
    }
    if (c.act) {
        const act = c.act;
        lines.push('\n**Act**:');
        if (act.action)
            lines.push(`  Action: ${act.action}`);
        if (act.implementation?.length) {
            for (const impl of act.implementation)
                lines.push(`  - ${impl}`);
        }
        if (act.feedback)
            lines.push(`  Feedback: ${act.feedback}`);
    }
    return lines.join('\n');
}
function renderOrchestration(c) {
    const lines = [];
    if (c.task)
        lines.push(`**Task**: ${c.task}`);
    if (c.complexity)
        lines.push(`**Complexity**: ${c.complexity}`);
    if (Array.isArray(c.suggestedOperations) && c.suggestedOperations.length > 0) {
        lines.push('\n**Suggested Operations**:');
        for (const op of c.suggestedOperations) {
            lines.push(`${op.order}. ${op.operation}: ${op.reason}`);
        }
    }
    if (c.recommendation)
        lines.push(`\n**Recommendation**: ${c.recommendation}`);
    return lines.join('\n');
}
// ============================================================================
// GENERIC FALLBACK RENDERER
// ============================================================================
function renderGeneric(c) {
    const lines = [];
    const textValue = c.text;
    for (const [key, value] of Object.entries(c)) {
        if (key === 'text' || key === 'nextThoughtNeeded')
            continue;
        if (value === undefined || value === null)
            continue;
        if (typeof value === 'string') {
            lines.push(`**${key}**: ${value}`);
        }
        else if (Array.isArray(value)) {
            lines.push(`\n**${key}**:`);
            for (const item of value) {
                if (typeof item === 'string') {
                    lines.push(`- ${item}`);
                }
                else {
                    lines.push(`- ${JSON.stringify(item)}`);
                }
            }
        }
        else if (typeof value === 'object') {
            lines.push(`\n**${key}**: ${JSON.stringify(value)}`);
        }
        else {
            lines.push(`**${key}**: ${String(value)}`);
        }
    }
    if (textValue) {
        lines.push('');
        lines.push(String(textValue));
    }
    return lines.join('\n');
}
// ============================================================================
// STORE-TO-RENDERER DISPATCH
// ============================================================================
const RENDERERS = {
    thoughts: renderThought,
    mentalModels: renderMentalModel,
    checkpoints: renderCheckpointContent,
    decisions: renderDecision,
    meta: renderMeta,
    systems: renderSystems,
    collaborative: renderCollaborative,
    creative: renderCreative,
    argumentation: renderArgumentation,
    tree: renderTree,
    causal: renderCausal,
    simulation: renderSimulation,
    ulysses: renderUlysses,
    ooda: renderOODA,
    orchestration: renderOrchestration,
};
export function renderEntryContent(storeKey, content) {
    const renderer = RENDERERS[storeKey] || renderGeneric;
    return renderer(content);
}
// ============================================================================
// CHECKPOINT HEADER LINE (gate + constraints inline, like RVRY)
// ============================================================================
function renderCheckpointHeader(c) {
    const parts = [];
    if (c.phase)
        parts.push(`**Phase**: ${c.phase}`);
    if (c.gateCheck) {
        const gc = c.gateCheck;
        const selfStr = gc.selfCheckPassed ? 'PASS' : 'FAIL';
        const depthStr = gc.depthGatePassed ? 'PASS' : 'FAIL';
        parts.push(`**Gate**: self=${selfStr}, depth=${depthStr}`);
    }
    if (Array.isArray(c.addConstraints) && c.addConstraints.length > 0) {
        parts.push(`**+${c.addConstraints.length} constraints**`);
    }
    if (Array.isArray(c.resolveConstraints) && c.resolveConstraints.length > 0) {
        parts.push(`**Resolved**: ${c.resolveConstraints.join(', ')}`);
    }
    return parts.join(' | ');
}
/**
 * Render a comprehensive harvest document from session state.
 *
 * Format matches RVRY engine logs: <details> blocks for content,
 * inline gate/constraint state per checkpoint, full analytical text.
 */
export function renderRichHarvest(session, harvestContent, followUpQuestions) {
    const now = new Date();
    const command = session.protocolState?.command || 'session';
    const commandLabel = command === 'deepthink' ? 'DeepThink'
        : command === 'problem-solve' ? 'ProblemSolve'
            : command === 'challenge' ? 'Challenge'
                : command === 'think' ? 'Think'
                    : command === 'meta' ? 'Meta'
                        : command;
    const summaryText = harvestContent.summary || harvestContent.text || 'analysis';
    const dateFormatted = `${now.toISOString().slice(0, 10)} ${now.toISOString().slice(11, 16)}`;
    // ---- Collect all entries across all stores into a flat timeline ----
    const timeline = [];
    let totalTokens = 0;
    const storeTypesUsed = new Set();
    for (const storeKey of Object.keys(session.stores)) {
        const entries = session.stores[storeKey];
        if (!entries || entries.length === 0)
            continue;
        storeTypesUsed.add(storeKey);
        for (const entry of entries) {
            const { tokens, source } = estimateTokens(entry);
            totalTokens += tokens;
            timeline.push({
                storeKey,
                label: STORE_LABELS[storeKey] || storeKey,
                entry,
                tokens,
                tokenSource: source,
            });
        }
    }
    timeline.sort((a, b) => a.entry.timestamp - b.entry.timestamp);
    const durationMs = session.getDuration();
    // Count rounds (thoughts = analytical rounds)
    const thoughtCount = timeline.filter(t => t.storeKey === 'thoughts').length;
    // ---- Build markdown ----
    const sections = [];
    // HEADER
    sections.push(`# ${commandLabel}: ${summaryText.slice(0, 120)}`);
    sections.push('');
    sections.push(`**Date**: ${dateFormatted}`);
    sections.push(`**Session ID**: ${session.id}`);
    sections.push(`**Command**: /${command}`);
    sections.push(`**Duration**: ${formatDuration(durationMs)}`);
    if (thoughtCount > 0) {
        sections.push(`**Rounds**: ${thoughtCount}`);
    }
    sections.push(`**Tokens**: ~${totalTokens} total (${timeline.some(t => t.tokenSource === 'reported') ? 'mixed reported/estimated' : 'estimated'})`);
    sections.push('');
    sections.push('---');
    sections.push('');
    // EXECUTIVE SUMMARY
    sections.push('## Summary');
    sections.push('');
    sections.push(harvestContent.summary || '(No summary provided)');
    sections.push('');
    sections.push('---');
    sections.push('');
    // Timeline section removed -- individual rounds are persisted as separate files
    // by persistRoundFile() in shared.ts. The harvest is a summary only.
    // CONSTRAINT EVOLUTION (if protocol state exists)
    if (session.protocolState && session.protocolState.constraints.size > 0) {
        sections.push('## Constraint Evolution');
        sections.push('');
        sections.push('| ID | Type | Text | Status | Reason |');
        sections.push('|---|---|---|---|---|');
        for (const [, constraint] of session.protocolState.constraints) {
            const pc = constraint;
            sections.push(`| ${pc.id} | ${pc.type} | ${pc.text} | ${pc.status} | ${pc.deferReason || ''} |`);
        }
        sections.push('');
        const allConstraints = Array.from(session.protocolState.constraints.values());
        const byStatus = {};
        for (const pc of allConstraints) {
            byStatus[pc.status] = (byStatus[pc.status] || 0) + 1;
        }
        const statusEntries = Object.entries(byStatus).map(([s, n]) => `${s}: ${n}`).join(', ');
        sections.push(`**Summary**: ${statusEntries}`);
        sections.push('');
        if (session.protocolState.phasesCompleted.length > 0) {
            sections.push(`**Phases completed**: ${session.protocolState.phasesCompleted.join(', ')}`);
            sections.push('');
        }
        sections.push('---');
        sections.push('');
    }
    // KEY FINDINGS (aggregated from all checkpoints, deduplicated)
    const allCheckpoints = session.getAll('checkpoints');
    const findingsSet = new Set();
    for (const cp of allCheckpoints) {
        if (cp.content?.keyFindings) {
            for (const f of cp.content.keyFindings)
                findingsSet.add(f);
        }
    }
    if (harvestContent.keyFindings) {
        for (const f of harvestContent.keyFindings)
            findingsSet.add(f);
    }
    if (findingsSet.size > 0) {
        sections.push('## Key Findings');
        sections.push('');
        for (const f of findingsSet)
            sections.push(`- ${f}`);
        sections.push('');
    }
    // FOLLOW-UP QUESTIONS
    if (followUpQuestions && followUpQuestions.length > 0) {
        sections.push('## Follow-Up Questions');
        sections.push('');
        for (let i = 0; i < followUpQuestions.length; i++) {
            const fq = followUpQuestions[i];
            sections.push(`${i + 1}. \`${fq.command} "${fq.question}"\``);
            sections.push(`   _${fq.source === 'deferred-constraint' ? 'From deferred constraint' : 'Rationale'}: ${fq.rationale || 'See findings above'}_`);
        }
        sections.push('');
    }
    // RECOVERY
    sections.push('## Recovery');
    sections.push('');
    sections.push('```');
    sections.push(`/think --import ${session.id}`);
    sections.push('```');
    return sections.join('\n');
}
//# sourceMappingURL=harvest-renderer.js.map