/**
 * Persistence Layer - Per-project + global fallback storage
 *
 * Per-project: {projectPath}/.claude/.cognition/sessions/{sessionId}/
 * Global fallback: ~/.orca-cognition/sessions/ (unattributed sessions)
 * Global index: ~/.orca-cognition/index.jsonl (cross-project search)
 *
 * Append-only JSONL format for each store type.
 * Prevents corruption and allows streaming reads.
 */

import { promises as fs } from 'fs';
import { existsSync, mkdirSync, appendFileSync } from 'fs';
import * as path from 'path';
import { homedir } from 'os';
import type { SessionMetadata, SessionStores, SessionExport, StoredEntry } from '../types.js';
import { SessionState } from './state.js';

// Global base directory (fallback for unattributed sessions)
const GLOBAL_BASE_DIR = path.join(homedir(), '.orca-cognition');
const GLOBAL_INDEX_PATH = path.join(GLOBAL_BASE_DIR, 'index.jsonl');

// Store type to filename mapping
const STORE_FILES: Record<keyof SessionStores, string> = {
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
  // Codebase audit store
  audit: 'audit.jsonl',
};

// ============================================================================
// PATH RESOLUTION - Per-project or global
// ============================================================================

/**
 * Resolve the base cognition directory for a project or global.
 */
export function resolveBaseDir(projectPath?: string): string {
  if (projectPath) {
    return path.join(projectPath, '.claude', '.cognition');
  }
  return GLOBAL_BASE_DIR;
}

/**
 * Resolve the sessions directory for a project or global.
 */
export function resolveSessionsDir(projectPath?: string): string {
  return path.join(resolveBaseDir(projectPath), 'sessions');
}

/**
 * Resolve the exports directory for a project or global.
 */
export function resolveExportsDir(projectPath?: string): string {
  return path.join(resolveBaseDir(projectPath), 'exports');
}

// ============================================================================
// DIRECTORY MANAGEMENT
// ============================================================================

/**
 * Ensure all required directories exist.
 */
export function ensureDirectories(projectPath?: string): void {
  const baseDir = resolveBaseDir(projectPath);
  const sessionsDir = resolveSessionsDir(projectPath);
  const exportsDir = resolveExportsDir(projectPath);

  if (!existsSync(baseDir)) {
    mkdirSync(baseDir, { recursive: true });
  }
  if (!existsSync(sessionsDir)) {
    mkdirSync(sessionsDir, { recursive: true });
  }
  if (!existsSync(exportsDir)) {
    mkdirSync(exportsDir, { recursive: true });
  }

  // Always ensure global base exists (for index.jsonl)
  if (projectPath && !existsSync(GLOBAL_BASE_DIR)) {
    mkdirSync(GLOBAL_BASE_DIR, { recursive: true });
  }
}

/**
 * Get the directory path for a session.
 */
function getSessionDir(sessionId: string, projectPath?: string): string {
  return path.join(resolveSessionsDir(projectPath), sessionId);
}

/**
 * Ensure session directory exists.
 */
function ensureSessionDir(sessionId: string, projectPath?: string): string {
  const sessionDir = getSessionDir(sessionId, projectPath);
  if (!existsSync(sessionDir)) {
    mkdirSync(sessionDir, { recursive: true });
  }
  return sessionDir;
}

// ============================================================================
// GLOBAL INDEX - Cross-project session registry
// ============================================================================

/**
 * Global index entry for cross-project search.
 */
interface GlobalIndexEntry {
  sessionId: string;
  projectPath?: string;
  title: string;
  tags: string[];
  createdAt: number;
  lastAccessedAt: number;
  status: 'active' | 'complete';
}

/**
 * Append/update entry in global index.
 * Called on every session metadata save.
 */
export function updateGlobalIndex(metadata: SessionMetadata): void {
  // Ensure global base directory exists
  if (!existsSync(GLOBAL_BASE_DIR)) {
    mkdirSync(GLOBAL_BASE_DIR, { recursive: true });
  }

  const entry: GlobalIndexEntry = {
    sessionId: metadata.id,
    projectPath: metadata.projectPath,
    title: metadata.title,
    tags: metadata.tags,
    createdAt: metadata.createdAt,
    lastAccessedAt: metadata.lastAccessedAt,
    status: metadata.status,
  };

  const line = JSON.stringify(entry) + '\n';
  appendFileSync(GLOBAL_INDEX_PATH, line, 'utf8');
}

// ============================================================================
// SESSION PERSISTENCE
// ============================================================================

/**
 * Save session metadata to session.json
 */
export async function saveSessionMetadata(session: SessionState): Promise<void> {
  const projectPath = session.metadata.projectPath;
  const sessionDir = ensureSessionDir(session.id, projectPath);
  const metadataPath = path.join(sessionDir, 'session.json');
  await fs.writeFile(metadataPath, JSON.stringify(session.metadata, null, 2));

  // Update global index for cross-project discovery
  updateGlobalIndex(session.metadata);
}

/**
 * Append a single entry to the appropriate JSONL file.
 * This is the core of append-only persistence.
 */
export function appendEntry(
  sessionId: string,
  storeType: keyof SessionStores,
  entry: StoredEntry<unknown>,
  projectPath?: string
): void {
  const sessionDir = ensureSessionDir(sessionId, projectPath);
  const filename = STORE_FILES[storeType];
  const filepath = path.join(sessionDir, filename);

  // Append single JSON line
  const line = JSON.stringify(entry) + '\n';
  appendFileSync(filepath, line, 'utf8');
}

/**
 * Load session from filesystem.
 * Checks project-local first, then global fallback.
 * Returns null if session doesn't exist in either location.
 */
export async function loadSession(sessionId: string, projectPath?: string): Promise<SessionState | null> {
  // Try project-local first
  if (projectPath) {
    const local = await loadSessionFromDir(sessionId, projectPath);
    if (local) return local;
  }

  // Fallback to global
  const global = await loadSessionFromDir(sessionId, undefined);
  return global;
}

/**
 * Load session from a specific directory (project-local or global).
 */
async function loadSessionFromDir(sessionId: string, projectPath?: string): Promise<SessionState | null> {
  const sessionDir = getSessionDir(sessionId, projectPath);

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
    const metadata: SessionMetadata = JSON.parse(metadataContent);

    // Create session
    const session = new SessionState(metadata.id, metadata.title, metadata.tags, metadata.projectPath);
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
            session.stores[storeType as keyof SessionStores].push(entry);
          } catch {
            // Skip malformed lines
            console.error('Malformed JSONL line in ' + filepath);
          }
        }
      }
    }

    return session;
  } catch (err) {
    console.error('Failed to load session ' + sessionId + ':', err);
    return null;
  }
}

/**
 * Export complete session to exports directory.
 * Called when nextThoughtNeeded: false
 */
export async function exportSession(session: SessionState): Promise<string> {
  const projectPath = session.metadata.projectPath;
  ensureDirectories(projectPath);

  const exportData = session.toExport();
  const exportsDir = resolveExportsDir(projectPath);
  const exportPath = path.join(exportsDir, session.id + '.json');

  await fs.writeFile(exportPath, JSON.stringify(exportData, null, 2));

  return exportPath;
}

/**
 * Import session from export data.
 */
export async function importSession(data: SessionExport): Promise<SessionState> {
  const projectPath = data.metadata.projectPath;
  ensureDirectories(projectPath);

  const session = SessionState.fromExport(data);

  // Save metadata
  await saveSessionMetadata(session);

  // Save all stores to JSONL files
  const sessionDir = ensureSessionDir(session.id, projectPath);

  for (const [storeType, entries] of Object.entries(session.stores)) {
    if (entries.length > 0) {
      const filename = STORE_FILES[storeType as keyof SessionStores];
      const filepath = path.join(sessionDir, filename);
      const content = entries.map((e: unknown) => JSON.stringify(e)).join('\n') + '\n';
      await fs.writeFile(filepath, content);
    }
  }

  return session;
}

/**
 * Check if session exists (project-local or global).
 */
export function sessionExists(sessionId: string, projectPath?: string): boolean {
  // Check project-local first
  if (projectPath) {
    const localDir = getSessionDir(sessionId, projectPath);
    const localMeta = path.join(localDir, 'session.json');
    if (existsSync(localMeta)) return true;
  }

  // Check global
  const globalDir = getSessionDir(sessionId, undefined);
  const globalMeta = path.join(globalDir, 'session.json');
  return existsSync(globalMeta);
}

/**
 * List all session IDs for a project (or global).
 */
export async function listSessions(projectPath?: string): Promise<string[]> {
  const sessionsDir = resolveSessionsDir(projectPath);
  ensureDirectories(projectPath);

  try {
    const entries = await fs.readdir(sessionsDir, { withFileTypes: true });
    return entries
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name);
  } catch {
    return [];
  }
}
