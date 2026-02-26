/**
 * Reasoning Stats Handler
 *
 * Computes aggregates from stored session data.
 * All data labeled as 'observable' (countable facts) or 'self_assessed' (Claude's self-reports).
 * Self-assessed data MUST include a caveat string.
 *
 * Supports per-project scoping via projectPath.
 */
import { promises as fs } from 'fs';
import { existsSync } from 'fs';
import * as path from 'path';
import { resolveSessionsDir, ensureDirectories } from '../session/persistence.js';
import { buildErrorResponse } from './shared.js';
// Store filename -> operation type mapping (reverse of persistence.ts STORE_FILES)
const FILE_TO_OPERATION = {
    'thoughts.jsonl': 'thought',
    'mental-models.jsonl': 'mental_model',
    'debugging.jsonl': 'debug',
    'decisions.jsonl': 'decide',
    'meta.jsonl': 'meta',
    'systems.jsonl': 'systems',
    'creative.jsonl': 'creative_thinking',
    'visual.jsonl': 'visual_reasoning',
    'checkpoints.jsonl': 'checkpoint',
    'scientific.jsonl': 'scientific_method',
    'collaborative.jsonl': 'collaborative_reasoning',
    'socratic.jsonl': 'socratic_method',
    'argumentation.jsonl': 'structured_argumentation',
    'tree.jsonl': 'tree_of_thought',
    'beam.jsonl': 'beam_search',
    'mcts.jsonl': 'mcts',
    'graph.jsonl': 'graph_of_thought',
    'orchestration.jsonl': 'orchestration_suggest',
    'research.jsonl': 'research',
    'analogical.jsonl': 'analogical_reasoning',
    'causal.jsonl': 'causal_analysis',
    'statistical.jsonl': 'statistical_reasoning',
    'simulation.jsonl': 'simulation',
    'optimization.jsonl': 'optimization',
    'ethical.jsonl': 'ethical_analysis',
    'dashboard.jsonl': 'visual_dashboard',
    'pdr.jsonl': 'pdr_reasoning',
    'custom-framework.jsonl': 'custom_framework',
    'code-execution.jsonl': 'code_execution',
    'ooda.jsonl': 'ooda_loop',
    'ulysses.jsonl': 'ulysses_protocol',
    'notebook-create.jsonl': 'notebook_create',
    'notebook-cell.jsonl': 'notebook_add_cell',
    'notebook-run.jsonl': 'notebook_run_cell',
    'notebook-export.jsonl': 'notebook_export',
    'audit.jsonl': 'audit',
};
/**
 * List all session directories, scoped by projectPath.
 */
async function getSessionIds(projectPath) {
    const sessionsDir = resolveSessionsDir(projectPath);
    if (!existsSync(sessionsDir)) {
        return [];
    }
    const entries = await fs.readdir(sessionsDir, { withFileTypes: true });
    return entries.filter(e => e.isDirectory()).map(e => e.name);
}
/**
 * Load a single session's data for stats computation.
 * Loads metadata + counts entries per operation type.
 * For reflex/counterfactual queries, also parses meta entries.
 */
async function loadSessionData(sessionId, deep, projectPath) {
    const sessionsDir = resolveSessionsDir(projectPath);
    const sessionDir = path.join(sessionsDir, sessionId);
    if (!existsSync(sessionDir))
        return null;
    const data = {
        id: sessionId,
        operationCounts: {},
        entries: [],
    };
    // Load metadata
    const metaPath = path.join(sessionDir, 'session.json');
    if (existsSync(metaPath)) {
        try {
            const raw = await fs.readFile(metaPath, 'utf8');
            const meta = JSON.parse(raw);
            data.createdAt = meta.createdAt;
            data.title = meta.title;
            data.tags = meta.tags;
            data.projectPath = meta.projectPath;
        }
        catch {
            // Skip metadata parse failures
        }
    }
    // Count entries per JSONL file
    const files = await fs.readdir(sessionDir);
    for (const file of files) {
        if (!file.endsWith('.jsonl'))
            continue;
        const operation = FILE_TO_OPERATION[file];
        if (!operation)
            continue;
        const filepath = path.join(sessionDir, file);
        try {
            const content = await fs.readFile(filepath, 'utf8');
            const lines = content.trim().split('\n').filter(l => l.length > 0);
            data.operationCounts[operation] = lines.length;
            // For deep queries, parse meta entries for reflex/counterfactual data
            if (deep && (file === 'meta.jsonl' || file === 'thoughts.jsonl')) {
                for (const line of lines) {
                    try {
                        const entry = JSON.parse(line);
                        data.entries.push({
                            content: entry.content || {},
                            timestamp: entry.timestamp || 0,
                            operation,
                        });
                    }
                    catch {
                        // Skip malformed lines
                    }
                }
            }
        }
        catch {
            // Skip unreadable files
        }
    }
    return data;
}
/**
 * Filter sessions by date range.
 */
function filterByDateRange(sessions, dateRange) {
    if (!dateRange)
        return sessions;
    const from = dateRange.from ? new Date(dateRange.from).getTime() : 0;
    const to = dateRange.to ? new Date(dateRange.to).getTime() : Infinity;
    return sessions.filter(s => {
        const created = s.createdAt || 0;
        return created >= from && created <= to;
    });
}
/**
 * Compute overview stats.
 */
function computeOverview(sessions) {
    const operationFrequency = {};
    let firstDate = Infinity;
    let lastDate = 0;
    const sessionsByMonth = {};
    for (const session of sessions) {
        // Aggregate operation counts
        for (const [op, count] of Object.entries(session.operationCounts)) {
            operationFrequency[op] = (operationFrequency[op] || 0) + count;
        }
        // Track date range
        if (session.createdAt) {
            if (session.createdAt < firstDate)
                firstDate = session.createdAt;
            if (session.createdAt > lastDate)
                lastDate = session.createdAt;
            const month = new Date(session.createdAt).toISOString().substring(0, 7);
            sessionsByMonth[month] = (sessionsByMonth[month] || 0) + 1;
        }
    }
    // Sort operation frequency descending
    const sortedOps = Object.entries(operationFrequency)
        .sort(([, a], [, b]) => b - a)
        .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});
    return {
        totalSessions: sessions.length,
        dateRange: {
            first: firstDate === Infinity ? null : new Date(firstDate).toISOString().substring(0, 10),
            last: lastDate === 0 ? null : new Date(lastDate).toISOString().substring(0, 10),
        },
        operationFrequency: {
            dataType: 'observable',
            data: sortedOps,
        },
        sessionsByMonth: {
            dataType: 'observable',
            data: sessionsByMonth,
        },
    };
}
/**
 * Compute reflex distribution from meta entries.
 */
function computeReflexDistribution(sessions) {
    const reflexCounts = {};
    let totalReflexes = 0;
    let caughtCount = 0;
    for (const session of sessions) {
        for (const entry of session.entries) {
            const reflexes = entry.content.reflexesObserved;
            if (reflexes && Array.isArray(reflexes)) {
                for (const r of reflexes) {
                    reflexCounts[r.reflex] = (reflexCounts[r.reflex] || 0) + 1;
                    totalReflexes++;
                    if (r.caught)
                        caughtCount++;
                }
            }
        }
    }
    return {
        reflexDistribution: {
            dataType: 'self_assessed',
            caveat: 'Reflex observations are self-reported by Claude. Approximately 80% of LLM self-reports may be confabulated pattern-matching rather than genuine access.',
            data: reflexCounts,
            total: totalReflexes,
            catchRate: totalReflexes > 0 ? caughtCount / totalReflexes : 0,
        },
    };
}
/**
 * Compute counterfactual gaps from meta entries.
 */
function computeCounterfactualGaps(sessions) {
    const gaps = [];
    for (const session of sessions) {
        for (const entry of session.entries) {
            const cf = entry.content.defaultCounterfactual;
            if (cf && cf.gap) {
                gaps.push({
                    session: session.id,
                    gap: cf.gap,
                    timestamp: entry.timestamp,
                });
            }
        }
    }
    // Sort by timestamp descending (most recent first)
    gaps.sort((a, b) => b.timestamp - a.timestamp);
    return {
        counterfactualGaps: {
            dataType: 'observable',
            count: gaps.length,
            recent: gaps.slice(0, 10),
        },
    };
}
/**
 * Handle reasoning_stats operation.
 * When projectPath is provided, scopes to that project only.
 * When absent, computes global aggregate across all sessions.
 */
export async function handleReasoningStats(args, _session) {
    const content = (args.content || {});
    const query = content.query || 'overview';
    const needsDeepParse = query === 'reflex_distribution' || query === 'counterfactual_gaps' || query === 'overview';
    const projectPath = args.projectPath;
    try {
        // Ensure directories exist for the target scope
        ensureDirectories(projectPath);
        // Load sessions scoped by projectPath
        const sessionIds = await getSessionIds(projectPath);
        const sessionDataPromises = sessionIds.map(id => loadSessionData(id, needsDeepParse, projectPath));
        const allSessions = (await Promise.all(sessionDataPromises)).filter((s) => s !== null);
        // Apply date range filter
        const filtered = filterByDateRange(allSessions, content.dateRange);
        let stats = {};
        switch (query) {
            case 'overview': {
                const overview = computeOverview(filtered);
                const reflexes = computeReflexDistribution(filtered);
                const gaps = computeCounterfactualGaps(filtered);
                stats = { ...overview, ...reflexes, ...gaps };
                break;
            }
            case 'operation_frequency': {
                stats = computeOverview(filtered);
                break;
            }
            case 'reflex_distribution': {
                stats = {
                    totalSessions: filtered.length,
                    ...computeReflexDistribution(filtered),
                };
                break;
            }
            case 'session_timeline': {
                const overview = computeOverview(filtered);
                stats = {
                    totalSessions: filtered.length,
                    dateRange: overview.dateRange,
                    sessionsByMonth: overview.sessionsByMonth,
                };
                break;
            }
            case 'counterfactual_gaps': {
                stats = {
                    totalSessions: filtered.length,
                    ...computeCounterfactualGaps(filtered),
                };
                break;
            }
            default: {
                stats = computeOverview(filtered);
                break;
            }
        }
        return {
            content: [{
                    type: 'text',
                    text: JSON.stringify({
                        status: 'stats',
                        query,
                        scope: projectPath ? projectPath : 'global',
                        stats,
                    }),
                }],
        };
    }
    catch (err) {
        return buildErrorResponse({
            status: 'error',
            error: 'Failed to compute stats: ' + (err instanceof Error ? err.message : String(err)),
        });
    }
}
//# sourceMappingURL=stats.js.map