/**
 * Checkpoint Handler - Accept-Store-Echo Pattern + Protocol State Management
 *
 * Core pattern: accept-store-echo (unchanged content always stored).
 * Enhancement: When protocol fields are present, MCP manages constraint state,
 * evaluates gates, and auto-persists at harvest. This is FREE computation
 * (runs in MCP process, not in context window).
 *
 * Note: Checkpoints do not have nextThoughtNeeded - they are state saves mid-chain.
 */
import { validateOperationContent } from '../../schema.js';
import { getSessionManager } from '../../session/manager.js';
import { saveProtocolState } from '../../session/persistence.js';
import { buildResponse, buildErrorResponse } from '../shared.js';
import { renderRichHarvest } from './harvest-renderer.js';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
/**
 * Check if checkpoint content includes any protocol state fields.
 */
function hasProtocolFields(content) {
    return !!(content.phase ||
        content.command ||
        content.addConstraints ||
        content.resolveConstraints ||
        content.acknowledgeConstraints ||
        content.markAsked ||
        content.deferConstraints ||
        content.gateCheck);
}
/**
 * Process protocol state updates from checkpoint content.
 * Returns a summary object for the response.
 */
function processProtocolState(session, content) {
    const state = session.getOrCreateProtocolState();
    // Set command if provided
    if (content.command) {
        state.command = content.command;
    }
    // Track phase completion
    if (content.phase) {
        if (!state.phasesCompleted.includes(content.phase)) {
            state.phasesCompleted.push(content.phase);
        }
    }
    // Add new constraints with auto-assigned IDs
    if (content.addConstraints) {
        for (const c of content.addConstraints) {
            const id = `C${state.nextConstraintId++}`;
            state.constraints.set(id, {
                id,
                type: c.type,
                text: c.text,
                status: 'active',
            });
        }
    }
    // Resolve constraints
    if (content.resolveConstraints) {
        for (const id of content.resolveConstraints) {
            const constraint = state.constraints.get(id);
            if (constraint) {
                constraint.status = 'resolved';
            }
        }
    }
    // Acknowledge constraints
    if (content.acknowledgeConstraints) {
        for (const id of content.acknowledgeConstraints) {
            const constraint = state.constraints.get(id);
            if (constraint) {
                constraint.status = 'acknowledged';
            }
        }
    }
    // Defer constraints with reason
    if (content.deferConstraints) {
        for (const d of content.deferConstraints) {
            const constraint = state.constraints.get(d.id);
            if (constraint) {
                constraint.status = 'deferred';
                constraint.deferReason = d.reason;
            }
        }
    }
    // Mark BLOCKING_UNKNOWN constraints as having been asked to user
    if (content.markAsked) {
        for (const id of content.markAsked) {
            const constraint = state.constraints.get(id);
            if (constraint && constraint.type === 'BLOCKING_UNKNOWN') {
                constraint.userAsked = true;
            }
        }
    }
    // Build response summary
    const allConstraints = Array.from(state.constraints.values());
    const activeConstraints = allConstraints.filter(c => c.status === 'active');
    const resolvedCount = allConstraints.filter(c => c.status === 'resolved').length;
    const deferredCount = allConstraints.filter(c => c.status === 'deferred').length;
    // Check for BLOCKING_UNKNOWN constraints that require user input
    const blockingUnknowns = activeConstraints.filter(c => c.type === 'BLOCKING_UNKNOWN' && !c.userAsked);
    const mustAskUser = blockingUnknowns.length > 0;
    // Evaluate gate if requested
    const gateStatus = evaluateGate(state, content);
    // Generate next suggestion
    let nextSuggestion;
    if (mustAskUser) {
        nextSuggestion = `STOP: ${blockingUnknowns.length} BLOCKING unknown(s) require user clarification before proceeding. Call AskUserQuestion, then resolve constraints.`;
    }
    else if (activeConstraints.length > 0 && content.phase === 'harvest') {
        nextSuggestion = `${activeConstraints.length} active constraint(s) remain. Address before harvest.`;
    }
    else if (activeConstraints.length > 0) {
        nextSuggestion = `${activeConstraints.length} active constraint(s): ${activeConstraints.map(c => c.id).join(', ')}`;
    }
    return {
        protocolState: {
            activeConstraints: allConstraints.map(c => ({
                id: c.id,
                type: c.type,
                text: c.text,
                status: c.status,
            })),
            resolvedCount,
            deferredCount,
            gateStatus: gateStatus.status,
            blocked: gateStatus.blocked || mustAskUser, // Block if unknowns need asking
            phasesCompleted: [...state.phasesCompleted],
            ...(nextSuggestion ? { nextSuggestion } : {}),
            // CRITICAL: Tell Claude explicitly to ask user
            ...(mustAskUser ? {
                mustAskUser: true,
                blockingUnknowns: blockingUnknowns.map(c => ({ id: c.id, text: c.text })),
            } : {}),
        },
    };
}
/**
 * Evaluate gate status based on protocol state and gate check input.
 */
function evaluateGate(state, content) {
    if (!content.gateCheck) {
        // No gate check requested - just report blocked status
        const activeCount = Array.from(state.constraints.values())
            .filter(c => c.status === 'active').length;
        const isHarvest = content.phase === 'harvest';
        return {
            status: null,
            blocked: isHarvest && activeCount > 0,
        };
    }
    const { selfCheckPassed, depthGatePassed } = content.gateCheck;
    const activeCount = Array.from(state.constraints.values())
        .filter(c => c.status === 'active').length;
    const isHarvest = content.phase === 'harvest';
    // Gate evaluation logic
    if (!selfCheckPassed || !depthGatePassed) {
        return { status: 'HARD_FAIL', blocked: true };
    }
    if (isHarvest && activeCount > 0) {
        return { status: 'SOFT_FAIL', blocked: true };
    }
    if (activeCount > 0) {
        return { status: 'SOFT_FAIL', blocked: false };
    }
    return { status: 'PASS', blocked: false };
}
// ============================================================================
// STORE KEY TO OPERATION NAME MAPPING (FR-3, TR-2)
// ============================================================================
const STORE_TO_OPERATION = {
    thoughts: 'thought',
    mentalModels: 'mental_model',
    debugging: 'debug',
    decisions: 'decide',
    meta: 'meta',
    systems: 'systems',
    creative: 'creative_thinking',
    visual: 'visual_reasoning',
    checkpoints: 'checkpoint',
    scientific: 'scientific_method',
    collaborative: 'collaborative_reasoning',
    socratic: 'socratic_method',
    argumentation: 'structured_argumentation',
    tree: 'tree_of_thought',
    beam: 'beam_search',
    mcts: 'mcts',
    graph: 'graph_of_thought',
    orchestration: 'orchestration_suggest',
    research: 'research',
    analogical: 'analogical_reasoning',
    causal: 'causal_analysis',
    statistical: 'statistical_reasoning',
    simulation: 'simulation',
    optimization: 'optimization',
    ethical: 'ethical_analysis',
    dashboard: 'visual_dashboard',
    pdr: 'pdr_reasoning',
    customFramework: 'custom_framework',
    codeExecution: 'code_execution',
    ooda: 'ooda_loop',
    ulysses: 'ulysses_protocol',
    notebookCreate: 'notebook_create',
    notebookCell: 'notebook_add_cell',
    notebookRun: 'notebook_run_cell',
    notebookExport: 'notebook_export',
    audit: 'audit',
};
/**
 * Render raw JSON export of session data (FR-3, TR-2).
 * Returns JSON string with format_version, metadata, stores, and protocolState.
 */
function renderRawJSON(session, harvestContent) {
    const stores = {};
    for (const storeKey of Object.keys(session.stores)) {
        const entries = session.stores[storeKey];
        if (!entries || entries.length === 0)
            continue;
        const operationName = STORE_TO_OPERATION[storeKey] || storeKey;
        stores[storeKey] = entries.map(entry => ({
            operation: operationName,
            request: { operation: operationName, ...entry.content },
            stored: entry,
        }));
    }
    // Build protocol state for export
    let protocolExport;
    if (session.protocolState) {
        const constraints = [];
        for (const [, c] of session.protocolState.constraints) {
            constraints.push({
                id: c.id,
                type: c.type,
                text: c.text,
                status: c.status,
                deferReason: c.deferReason,
            });
        }
        protocolExport = {
            constraints,
            phasesCompleted: [...session.protocolState.phasesCompleted],
        };
    }
    const raw = {
        format_version: 1,
        sessionId: session.id,
        metadata: {
            title: session.metadata.title,
            tags: session.metadata.tags,
            command: session.protocolState?.command || 'session',
            projectPath: session.metadata.projectPath || null,
            createdAt: session.metadata.createdAt,
            duration: session.getDuration(),
        },
        stores,
        protocolState: protocolExport || null,
    };
    return JSON.stringify(raw, null, 2);
}
/**
 * Auto-persist session summary when phase is 'harvest'.
 * Writes 99-harvest.md to sessionFolder (human-readable).
 * Writes 99-raw.json to ~/.orca-cognition/sessions/{sessionId}/ (machine-readable).
 * No flat file backup -- session folder is the single human-readable location.
 */
function autoPersistHarvest(session, content, _projectPath) {
    if (content.phase !== 'harvest')
        return null;
    try {
        // Collect follow-up questions from content + auto-extract deferred constraints
        const followUpQuestions = [];
        // Explicit follow-ups from harvest content
        if (content.followUpQuestions) {
            for (const fq of content.followUpQuestions) {
                followUpQuestions.push({
                    question: fq.question,
                    command: fq.command,
                    source: 'harvest-explicit',
                    rationale: fq.rationale,
                });
            }
        }
        // Auto-extract deferred constraints as follow-up questions
        if (session.protocolState) {
            for (const c of session.protocolState.constraints.values()) {
                if (c.status === 'deferred') {
                    const alreadyCovered = followUpQuestions.some(fq => fq.question.toLowerCase().includes(c.text.toLowerCase().slice(0, 30)));
                    if (!alreadyCovered) {
                        followUpQuestions.push({
                            question: `Verify: ${c.text}`,
                            command: '/think',
                            source: 'deferred-constraint',
                            rationale: c.deferReason || 'Deferred constraint from previous session',
                        });
                    }
                }
            }
        }
        // Render rich harvest using the dedicated renderer
        const md = renderRichHarvest(session, content, followUpQuestions.length > 0 ? followUpQuestions : undefined);
        // Write 99-raw.json to global session dir (machine-readable)
        const globalSessionDir = join(homedir(), '.orca-cognition', 'sessions', session.id);
        if (!existsSync(globalSessionDir)) {
            mkdirSync(globalSessionDir, { recursive: true });
        }
        const rawJson = renderRawJSON(session, content);
        writeFileSync(join(globalSessionDir, '99-raw.json'), rawJson, 'utf-8');
        // Write 99-harvest.md to sessionFolder (human-readable) or fallback to global
        let harvestFile;
        let sessionFolderFile;
        if (content.sessionFolder && existsSync(content.sessionFolder)) {
            harvestFile = join(content.sessionFolder, '99-harvest.md');
            writeFileSync(harvestFile, md, 'utf-8');
            sessionFolderFile = harvestFile;
        }
        else {
            // Fallback: write harvest to global session dir
            harvestFile = join(globalSessionDir, '99-harvest.md');
            writeFileSync(harvestFile, md, 'utf-8');
        }
        return {
            persisted: true,
            file: harvestFile,
            sessionFolderFile,
            followUpQuestions: followUpQuestions.length > 0 ? followUpQuestions : undefined,
        };
    }
    catch {
        // Auto-persist errors must not crash the checkpoint operation
        return { persisted: false };
    }
}
export async function handleCheckpoint(args, session) {
    const manager = getSessionManager();
    // 1. VALIDATE structure (not content)
    const validation = validateOperationContent('checkpoint', args.content);
    if (!validation.success) {
        return buildErrorResponse({
            status: 'error',
            error: validation.error,
            hint: validation.hint,
            sessionContext: {
                sessionId: session.id,
                entryCount: session.getCount('checkpoints'),
                totalEntries: session.getTotalCount(),
                sessionDuration: session.getDuration(),
                continuation: null,
            },
        });
    }
    const checkpointContent = validation.data;
    // 2. STORE unchanged (add timestamp)
    const entry = {
        content: checkpointContent, // UNCHANGED
        quality: args.quality, // UNCHANGED
        timestamp: Date.now(),
        ...(args.tokenEstimate !== undefined ? { tokenEstimate: args.tokenEstimate } : {}),
    };
    // 3. PERSIST to filesystem
    await manager.addEntry(session, 'checkpoints', entry);
    // 4. Process protocol state if protocol fields are present
    let extra;
    if (hasProtocolFields(checkpointContent)) {
        const protocolResult = processProtocolState(session, checkpointContent);
        // CRITICAL: Persist protocol state to disk so it survives session reload
        saveProtocolState(session);
        // Auto-persist at harvest
        const persistResult = autoPersistHarvest(session, checkpointContent, args.projectPath);
        if (persistResult) {
            protocolResult.autoPersist = persistResult;
            // Surface follow-up questions at top level for easy access
            if (persistResult.followUpQuestions) {
                protocolResult.followUpQuestions = persistResult.followUpQuestions;
            }
        }
        extra = protocolResult;
    }
    // 5. ECHO unchanged + context + protocol state (respects verbose flag)
    return buildResponse(checkpointContent, args, session, 'checkpoints', 'stored', null, extra);
}
//# sourceMappingURL=checkpoint.js.map