/**
 * Persistence Layer - JSONL read/write to ~/.orca-cognition/
 *
 * Append-only JSONL format for each store type.
 * Prevents corruption and allows streaming reads.
 */
import { promises as fs } from 'fs';
import { existsSync, mkdirSync, appendFileSync } from 'fs';
import * as path from 'path';
import { homedir } from 'os';
import { SessionState } from './state.js';
// Base directory for all cognition data
const BASE_DIR = path.join(homedir(), '.orca-cognition');
const SESSIONS_DIR = path.join(BASE_DIR, 'sessions');
const EXPORTS_DIR = path.join(BASE_DIR, 'exports');
// Store type to filename mapping
const STORE_FILES = {
    thoughts: 'thoughts.jsonl',
    mentalModels: 'mental-models.jsonl',
    debugging: 'debugging.jsonl',
    decisions: 'decisions.jsonl',
    meta: 'meta.jsonl',
    systems: 'systems.jsonl',
    // Phase 1: Core stores
    creative: 'creative.jsonl',
    visual: 'visual.jsonl',
    checkpoints: 'checkpoints.jsonl',
    scientific: 'scientific.jsonl',
    // Phase 1: Collaborative stores
    collaborative: 'collaborative.jsonl',
    socratic: 'socratic.jsonl',
    argumentation: 'argumentation.jsonl',
    // Phase 2: Pattern stores
    tree: 'tree.jsonl',
    beam: 'beam.jsonl',
    mcts: 'mcts.jsonl',
    graph: 'graph.jsonl',
    orchestration: 'orchestration.jsonl',
    // Phase 3: Analysis stores
    research: 'research.jsonl',
    analogical: 'analogical.jsonl',
    causal: 'causal.jsonl',
    statistical: 'statistical.jsonl',
    simulation: 'simulation.jsonl',
    optimization: 'optimization.jsonl',
    ethical: 'ethical.jsonl',
    dashboard: 'dashboard.jsonl',
    pdr: 'pdr.jsonl',
    customFramework: 'custom-framework.jsonl',
    codeExecution: 'code-execution.jsonl',
    // Phase 4: Strategic stores
    ooda: 'ooda.jsonl',
    ulysses: 'ulysses.jsonl',
    // Phase 4: Notebook stores
    notebookCreate: 'notebook-create.jsonl',
    notebookCell: 'notebook-cell.jsonl',
    notebookRun: 'notebook-run.jsonl',
    notebookExport: 'notebook-export.jsonl',
};
/**
 * Ensure all required directories exist.
 */
export function ensureDirectories() {
    if (!existsSync(BASE_DIR)) {
        mkdirSync(BASE_DIR, { recursive: true });
    }
    if (!existsSync(SESSIONS_DIR)) {
        mkdirSync(SESSIONS_DIR, { recursive: true });
    }
    if (!existsSync(EXPORTS_DIR)) {
        mkdirSync(EXPORTS_DIR, { recursive: true });
    }
}
/**
 * Get the directory path for a session.
 */
function getSessionDir(sessionId) {
    return path.join(SESSIONS_DIR, sessionId);
}
/**
 * Ensure session directory exists.
 */
function ensureSessionDir(sessionId) {
    const sessionDir = getSessionDir(sessionId);
    if (!existsSync(sessionDir)) {
        mkdirSync(sessionDir, { recursive: true });
    }
    return sessionDir;
}
/**
 * Save session metadata to session.json
 */
export async function saveSessionMetadata(session) {
    const sessionDir = ensureSessionDir(session.id);
    const metadataPath = path.join(sessionDir, 'session.json');
    await fs.writeFile(metadataPath, JSON.stringify(session.metadata, null, 2));
}
/**
 * Append a single entry to the appropriate JSONL file.
 * This is the core of append-only persistence.
 */
export function appendEntry(sessionId, storeType, entry) {
    const sessionDir = ensureSessionDir(sessionId);
    const filename = STORE_FILES[storeType];
    const filepath = path.join(sessionDir, filename);
    // Append single JSON line
    const line = JSON.stringify(entry) + '\n';
    appendFileSync(filepath, line, 'utf8');
}
/**
 * Load session from filesystem.
 * Returns null if session doesn't exist.
 */
export async function loadSession(sessionId) {
    const sessionDir = getSessionDir(sessionId);
    if (!existsSync(sessionDir)) {
        return null;
    }
    const metadataPath = path.join(sessionDir, 'session.json');
    if (!existsSync(metadataPath)) {
        return null;
    }
    try {
        // Load metadata
        const metadataContent = await fs.readFile(metadataPath, 'utf8');
        const metadata = JSON.parse(metadataContent);
        // Create session
        const session = new SessionState(metadata.id, metadata.title, metadata.tags);
        session.metadata = metadata;
        // Load each store from JSONL files
        for (const [storeType, filename] of Object.entries(STORE_FILES)) {
            const filepath = path.join(sessionDir, filename);
            if (existsSync(filepath)) {
                const content = await fs.readFile(filepath, 'utf8');
                const lines = content.trim().split('\n').filter(line => line.length > 0);
                for (const line of lines) {
                    try {
                        const entry = JSON.parse(line);
                        session.stores[storeType].push(entry);
                    }
                    catch {
                        // Skip malformed lines
                        console.error('Malformed JSONL line in ' + filepath);
                    }
                }
            }
        }
        return session;
    }
    catch (err) {
        console.error('Failed to load session ' + sessionId + ':', err);
        return null;
    }
}
/**
 * Export complete session to exports directory.
 * Called when nextThoughtNeeded: false
 */
export async function exportSession(session) {
    ensureDirectories();
    const exportData = session.toExport();
    const exportPath = path.join(EXPORTS_DIR, session.id + '.json');
    await fs.writeFile(exportPath, JSON.stringify(exportData, null, 2));
    return exportPath;
}
/**
 * Import session from export data.
 */
export async function importSession(data) {
    ensureDirectories();
    const session = SessionState.fromExport(data);
    // Save metadata
    await saveSessionMetadata(session);
    // Save all stores to JSONL files
    const sessionDir = ensureSessionDir(session.id);
    for (const [storeType, entries] of Object.entries(session.stores)) {
        if (entries.length > 0) {
            const filename = STORE_FILES[storeType];
            const filepath = path.join(sessionDir, filename);
            const content = entries.map((e) => JSON.stringify(e)).join('\n') + '\n';
            await fs.writeFile(filepath, content);
        }
    }
    return session;
}
/**
 * Check if session exists.
 */
export function sessionExists(sessionId) {
    const sessionDir = getSessionDir(sessionId);
    const metadataPath = path.join(sessionDir, 'session.json');
    return existsSync(metadataPath);
}
/**
 * List all session IDs.
 */
export async function listSessions() {
    ensureDirectories();
    try {
        const entries = await fs.readdir(SESSIONS_DIR, { withFileTypes: true });
        return entries
            .filter(entry => entry.isDirectory())
            .map(entry => entry.name);
    }
    catch {
        return [];
    }
}
//# sourceMappingURL=persistence.js.map