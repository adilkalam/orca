/**
 * Persistence Layer - Global storage at ~/.orca-cognition/
 *
 * All sessions: ~/.orca-cognition/sessions/{sessionId}/
 * Global index: ~/.orca-cognition/index.jsonl (cross-project search)
 *
 * projectPath is stored in session metadata for attribution but does NOT
 * affect storage location. All machine-readable data is global.
 *
 * Append-only JSONL format for each store type.
 * Prevents corruption and allows streaming reads.
 */

import { promises as fs } from 'fs';
import { existsSync, mkdirSync, appendFileSync, writeFileSync } from 'fs';
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
// PATH RESOLUTION - Always global (~/.orca-cognition/)
// ============================================================================

/**
 * Resolve the base cognition directory. Always global.
 * _projectPath accepted for backward compatibility but ignored.
 */
export function resolveBaseDir(_projectPath?: string): string {
  return GLOBAL_BASE_DIR;
}

/**
 * Resolve the sessions directory. Always global.
 */
export function resolveSessionsDir(_projectPath?: string): string {
  return path.join(GLOBAL_BASE_DIR, 'sessions');
}

// ============================================================================
// DIRECTORY MANAGEMENT
// ============================================================================

/**
 * Ensure all required directories exist.
 * _projectPath accepted for backward compatibility but ignored.
 */
export function ensureDirectories(_projectPath?: string): void {
  if (!existsSync(GLOBAL_BASE_DIR)) {
    mkdirSync(GLOBAL_BASE_DIR, { recursive: true });
  }
  const sessionsDir = path.join(GLOBAL_BASE_DIR, 'sessions');
  if (!existsSync(sessionsDir)) {
    mkdirSync(sessionsDir, { recursive: true });
  }
}

/**
 * Get the directory path for a session. Always global.
 * _projectPath accepted for backward compatibility but ignored.
 */
function getSessionDir(sessionId: string, _projectPath?: string): string {
  return path.join(GLOBAL_BASE_DIR, 'sessions', sessionId);
}

/**
 * Ensure session directory exists.
 * _projectPath accepted for backward compatibility but ignored.
 */
function ensureSessionDir(sessionId: string, _projectPath?: string): string {
  const sessionDir = getSessionDir(sessionId);
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
}

/**
 * Save protocol state to protocol.json
 * Called after checkpoint modifies protocol state.
 */
export function saveProtocolState(session: SessionState): void {
  if (!session.protocolState) return;

  const projectPath = session.metadata.projectPath;
  const sessionDir = ensureSessionDir(session.id, projectPath);
  const protocolPath = path.join(sessionDir, 'protocol.json');

  const ps = session.protocolState;
  const data = {
    constraints: Object.fromEntries(ps.constraints),
    nextConstraintId: ps.nextConstraintId,
    phasesCompleted: [...ps.phasesCompleted],
    ...(ps.command ? { command: ps.command } : {}),
  };

  writeFileSync(protocolPath, JSON.stringify(data, null, 2));

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
 * Load session from filesystem. Always from global storage.
 * _projectPath accepted for backward compatibility but ignored.
 */
export async function loadSession(sessionId: string, _projectPath?: string): Promise<SessionState | null> {
  return loadSessionFromDir(sessionId);
}

/**
 * Load session from global storage directory.
 */
async function loadSessionFromDir(sessionId: string): Promise<SessionState | null> {
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

    // Load protocol state if exists
    const protocolPath = path.join(sessionDir, 'protocol.json');
    if (existsSync(protocolPath)) {
      try {
        const protocolContent = await fs.readFile(protocolPath, 'utf8');
        const ps = JSON.parse(protocolContent);
        session.protocolState = {
          constraints: new Map(Object.entries(ps.constraints || {})),
          nextConstraintId: ps.nextConstraintId || 1,
          phasesCompleted: [...(ps.phasesCompleted || [])],
          ...(ps.command ? { command: ps.command } : {}),
        };
      } catch {
        console.error('Failed to load protocol state for session ' + sessionId);
      }
    }

    return session;
  } catch (err) {
    console.error('Failed to load session ' + sessionId + ':', err);
    return null;
  }
}

/**
 * Export complete session to session directory.
 * Called when nextThoughtNeeded: false
 */
export async function exportSession(session: SessionState): Promise<string> {
  ensureDirectories();

  const exportData = session.toExport();
  const sessionDir = ensureSessionDir(session.id);
  const exportPath = path.join(sessionDir, 'export.json');

  await fs.writeFile(exportPath, JSON.stringify(exportData, null, 2));

  return exportPath;
}

/**
 * Import session from export data.
 */
export async function importSession(data: SessionExport): Promise<SessionState> {
  ensureDirectories();

  const session = SessionState.fromExport(data);

  // Save metadata
  await saveSessionMetadata(session);

  // Save all stores to JSONL files
  const sessionDir = ensureSessionDir(session.id);

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
 * Check if session exists in global storage.
 * _projectPath accepted for backward compatibility but ignored.
 */
export function sessionExists(sessionId: string, _projectPath?: string): boolean {
  const globalDir = getSessionDir(sessionId);
  const globalMeta = path.join(globalDir, 'session.json');
  return existsSync(globalMeta);
}

/**
 * List all session IDs from global storage.
 * _projectPath accepted for backward compatibility but ignored.
 */
export async function listSessions(_projectPath?: string): Promise<string[]> {
  const sessionsDir = resolveSessionsDir();
  ensureDirectories();

  try {
    const entries = await fs.readdir(sessionsDir, { withFileTypes: true });
    return entries
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name);
  } catch {
    return [];
  }
}
