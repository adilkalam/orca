/**
 * Workshop Client
 *
 * Wraps Workshop CLI for reading/writing session memory.
 * Workshop handles: decisions, gotchas, learnings, task history
 *
 * This keeps code-index.db focused on code context only (chunks, components, embeddings)
 */

import { execSync, exec } from 'child_process';
import { promisify } from 'util';
import type { Decision, Standard, TaskHistory, DecayConfig } from './types.js';
import Database from 'better-sqlite3';
import { existsSync, lstatSync, readdirSync, readFileSync, symlinkSync, unlinkSync, rmdirSync } from 'fs';
import { join, dirname } from 'path';
import { platform } from 'os';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);

// Default decay config (OFF by default for backward compatibility)
const DEFAULT_DECAY_CONFIG: DecayConfig = {
  enabled: false,
  halfLifeDays: 90,
  minimumScore: 0.01,
  maxEntries: 500,
};

/**
 * Calculate decay score for a timestamp
 * Uses exponential decay: score = 0.5^(days / halfLife)
 */
export function calculateDecay(timestamp: Date, config: DecayConfig): number {
  if (!config.enabled) return 1.0;

  const now = Date.now();
  const created = timestamp.getTime();
  const daysSinceCreation = (now - created) / (1000 * 60 * 60 * 24);

  // Clamp negative days (future timestamps) to 0
  if (daysSinceCreation < 0) return 1.0;

  const score = Math.pow(0.5, daysSinceCreation / config.halfLifeDays);
  return Math.max(score, config.minimumScore);
}

/**
 * Apply decay to a list of entries with timestamps
 * Returns entries sorted by decayed score (highest first)
 */
export function applyDecay<T extends { timestamp?: Date; created?: Date; entry_metadata?: string }>(
  entries: T[],
  config: DecayConfig
): (T & { decayedScore: number; pinned: boolean })[] {
  return entries
    .map(entry => {
      // Parse metadata to check for pinned status
      let metadata: any = {};
      if ((entry as any).entry_metadata) {
        try {
          metadata = JSON.parse((entry as any).entry_metadata);
        } catch {}
      }

      const pinned = metadata.pinned === true;
      const ts = entry.timestamp || entry.created || new Date();
      const decayedScore = pinned ? 1.0 : calculateDecay(ts, config);

      return { ...entry, decayedScore, pinned };
    })
    .sort((a, b) => b.decayedScore - a.decayedScore);
}

/**
 * Tokenize a query into individual words for broader matching.
 * Filters out common stop words and short tokens.
 */
function tokenizeQuery(query: string): string[] {
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who', 'whom', 'how', 'when', 'where', 'why']);

  return query
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')  // Remove special chars
    .split(/\s+/)
    .filter(word => word.length >= 3 && !stopWords.has(word));
}

/**
 * Build a SQL WHERE clause for tokenized word matching.
 * Returns [clause, params] where clause matches ANY word in content OR reasoning.
 */
function buildTokenizedWhereClause(tokens: string[], fieldName: string = 'content', includeReasoning: boolean = true): [string, string[]] {
  if (tokens.length === 0) {
    return ['1=1', []];  // Match all if no tokens
  }

  const conditions: string[] = [];
  const params: string[] = [];

  for (const token of tokens) {
    if (includeReasoning) {
      conditions.push(`(${fieldName} LIKE '%' || ? || '%' OR reasoning LIKE '%' || ? || '%')`);
      params.push(token, token);
    } else {
      conditions.push(`${fieldName} LIKE '%' || ? || '%'`);
      params.push(token);
    }
  }

  // Match ANY token (OR logic for broader recall)
  return [`(${conditions.join(' OR ')})`, params];
}

/**
 * Load decay configuration from config file
 */
function loadDecayConfig(projectPath: string): DecayConfig {
  // Try project-specific config first
  const projectConfigPath = join(projectPath, '.claude', 'config', 'memory.json');
  if (existsSync(projectConfigPath)) {
    try {
      const config = JSON.parse(readFileSync(projectConfigPath, 'utf-8'));
      return { ...DEFAULT_DECAY_CONFIG, ...config.decay };
    } catch (error) {
      console.error(`[WorkshopClient] Failed to parse ${projectConfigPath}:`, error);
    }
  }

  // Try package config
  try {
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const packageConfigPath = join(__dirname, '..', 'config', 'memory.json');
    if (existsSync(packageConfigPath)) {
      const config = JSON.parse(readFileSync(packageConfigPath, 'utf-8'));
      return { ...DEFAULT_DECAY_CONFIG, ...config.decay };
    }
  } catch (error) {
    console.error(`[WorkshopClient] Failed to load package config:`, error);
  }

  return DEFAULT_DECAY_CONFIG;
}

export class WorkshopClient {
  private workspacePath: string;
  private projectPath: string;
  private decayConfig: DecayConfig;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
    // Workshop uses .claude/memory as workspace
    this.workspacePath = `${projectPath}/.claude/memory`;
    // Load decay configuration
    this.decayConfig = loadDecayConfig(projectPath);
    if (this.decayConfig.enabled) {
      console.error(`[WorkshopClient] Memory decay enabled: ${this.decayConfig.halfLifeDays}-day half-life`);
    }
    // Attempt symlink creation (non-blocking, logs on failure)
    this.ensureWorkshopSymlink().catch(() => {});
  }

  private getDbPath(): string {
    return join(this.workspacePath, 'workshop.db');
  }

  private openDatabase(): Database.Database | null {
    const dbPath = this.getDbPath();
    if (!existsSync(dbPath)) {
      console.error(`[WorkshopClient] Database not found: ${dbPath}`);
      return null;
    }
    try {
      return new Database(dbPath, { readonly: true, fileMustExist: true });
    } catch (error: any) {
      console.error(`[WorkshopClient] Failed to open database: ${error.message}`);
      console.error(`[WorkshopClient] Database path: ${dbPath}`);
      return null;
    }
  }

  private writeDatabase(): Database.Database | null {
    const dbPath = this.getDbPath();
    if (!existsSync(dbPath)) {
      console.error(`[WorkshopClient] Database not found: ${dbPath}`);
      return null;
    }
    try {
      return new Database(dbPath, { fileMustExist: true });
    } catch (error: any) {
      console.error(`[WorkshopClient] Failed to open database (rw): ${error.message}`);
      return null;
    }
  }

  /**
   * Auto-pin preference and antipattern entries that lack pinned metadata.
   * Called before prune() evaluates entries, so pinned entries survive pruning.
   */
  async pinRecentEntries(): Promise<void> {
    const db = this.writeDatabase();
    if (!db) return;

    try {
      // Find preference/antipattern entries without pinned metadata
      const rows = db.prepare(
        "SELECT id, entry_metadata FROM entries WHERE type IN ('preference', 'antipattern')"
      ).all() as { id: string; entry_metadata: string | null }[];

      const updateStmt = db.prepare('UPDATE entries SET entry_metadata = ? WHERE id = ?');

      for (const row of rows) {
        let metadata: Record<string, unknown> = {};
        if (row.entry_metadata) {
          try { metadata = JSON.parse(row.entry_metadata); } catch {}
        }
        if (metadata.pinned === true) continue;

        metadata.pinned = true;
        updateStmt.run(JSON.stringify(metadata), row.id);
      }
    } catch (error: any) {
      console.error(`[WorkshopClient] pinRecentEntries error: ${error.message}`);
    } finally {
      db.close();
    }
  }

  /**
   * Prune lowest-decay unpinned entries when count exceeds maxEntries.
   * Called after every write operation to enforce retention cap.
   */
  async prune(): Promise<void> {
    // Auto-pin preferences/antipatterns before evaluating for pruning
    await this.pinRecentEntries();

    const maxEntries = this.decayConfig.maxEntries ?? 500;
    const db = this.writeDatabase();
    if (!db) return;

    try {
      const countRow = db.prepare('SELECT count(*) as cnt FROM entries').get() as { cnt: number };
      if (countRow.cnt <= maxEntries) return;

      const rows = db.prepare(
        'SELECT id, timestamp, entry_metadata FROM entries'
      ).all() as { id: string; timestamp: string; entry_metadata: string | null }[];

      // Score each entry, skip pinned
      const scored: { id: string; score: number }[] = [];
      for (const row of rows) {
        let metadata: any = {};
        if (row.entry_metadata) {
          try { metadata = JSON.parse(row.entry_metadata); } catch {}
        }
        if (metadata.pinned === true) continue;

        const ts = new Date(row.timestamp);
        const score = calculateDecay(ts, this.decayConfig);
        scored.push({ id: row.id, score });
      }

      // Sort ascending by score (lowest = oldest/least relevant)
      scored.sort((a, b) => a.score - b.score);

      const toDelete = countRow.cnt - maxEntries;
      if (toDelete <= 0) return;

      const idsToDelete = scored.slice(0, toDelete).map(s => s.id);
      if (idsToDelete.length === 0) return;

      const placeholders = idsToDelete.map(() => '?').join(',');
      db.prepare(`DELETE FROM entries WHERE id IN (${placeholders})`).run(...idsToDelete);

      console.error(
        `[WorkshopClient] Pruned ${idsToDelete.length} entries (count was ${countRow.cnt}, max is ${maxEntries})`
      );
    } catch (error: any) {
      console.error(`[WorkshopClient] Prune error: ${error.message}`);
    } finally {
      db.close();
    }
  }

  /**
   * Execute workshop command
   */
  private async runWorkshop(args: string): Promise<string> {
    try {
      const cmd = `workshop --workspace "${this.workspacePath}" ${args}`;
      const { stdout, stderr } = await execAsync(cmd, {
        encoding: 'utf8',
        timeout: 10000,
      });
      if (stderr) {
        console.error(`Workshop stderr: ${stderr}`);
      }
      return stdout.trim();
    } catch (error: any) {
      console.error(`Workshop error: ${error.message}`);
      return '';
    }
  }

  /**
   * Save a decision to Workshop
   */
  async saveDecision(decision: {
    domain: string;
    decision: string;
    reasoning: string;
    context?: string;
    tags?: string[];
  }): Promise<void> {
    const tagsArg = decision.tags?.map((t) => `-t "${t}"`).join(' ') || '';
    const decisionText = `[${decision.domain}] ${decision.decision}`;

    await this.runWorkshop(
      `decision "${decisionText}" -r "${decision.reasoning}" ${tagsArg}`
    );
    await this.prune();
  }

  /**
   * Save a gotcha (standard/rule) to Workshop
   */
  async saveGotcha(standard: {
    what_happened: string;
    cost: string;
    rule: string;
    domain: string;
  }): Promise<void> {
    const gotchaText = `[${standard.domain}] ${standard.rule} (Cost: ${standard.cost}. Cause: ${standard.what_happened})`;

    await this.runWorkshop(`gotcha "${gotchaText}" -t "${standard.domain}"`);
    await this.prune();
  }

  /**
   * Save task history as a single merged note
   */
  async saveTaskHistory(task: {
    domain: string;
    task: string;
    outcome: string;
    learnings?: string;
    files_modified?: string[];
  }): Promise<void> {
    const filesStr = task.files_modified?.join(', ') || 'none';
    let noteText = `[${task.domain}] Task: ${task.task} | Outcome: ${task.outcome} | Files: ${filesStr}`;
    if (task.learnings) {
      noteText += ` | Learning: ${task.learnings}`;
    }

    await this.runWorkshop(
      `note "${noteText}" -t task-history -t "${task.domain}"`
    );
    await this.prune();
  }

  /**
   * Query decisions from Workshop using SQLite
   * When decay is enabled, applies time-weighted scoring
   * Uses tokenized word matching for broader recall (matches ANY word)
   */
  async queryDecisions(query: string, limit = 10): Promise<Decision[]> {
    const db = this.openDatabase();
    if (!db) return [];

    try {
      // Fetch more entries when decay is enabled to ensure good coverage after re-ranking
      const fetchLimit = this.decayConfig.enabled ? limit * 3 : limit;

      // Tokenize query for word-based matching
      const tokens = tokenizeQuery(query);
      const [whereClause, whereParams] = buildTokenizedWhereClause(tokens, 'content', true);

      const sql = `
        SELECT id, type, content, reasoning, timestamp, entry_metadata
        FROM entries
        WHERE type = 'decision'
          AND ${whereClause}
        ORDER BY timestamp DESC
        LIMIT ?
      `;
      const rows = db.prepare(sql).all(...whereParams, fetchLimit) as any[];

      let results: Decision[] = rows.map(row => {
        let metadata: any = {};
        if (row.entry_metadata) {
          try {
            metadata = JSON.parse(row.entry_metadata);
          } catch {}
        }

        // Extract domain from content pattern "[domain] decision text"
        const domainMatch = row.content?.match(/^\[([^\]]+)\]/);
        const domain = domainMatch ? domainMatch[1] : 'unknown';

        return {
          id: row.id,
          timestamp: new Date(row.timestamp),
          domain,
          decision: row.content || '',
          reasoning: row.reasoning || '',
          context: metadata.context,
          tags: metadata.tags || [],
          entry_metadata: row.entry_metadata, // Keep for decay processing
        } as Decision & { entry_metadata?: string };
      });

      // Apply decay if enabled
      if (this.decayConfig.enabled) {
        const decayed = applyDecay(results, this.decayConfig);
        results = decayed.slice(0, limit).map(item => {
          const { entry_metadata, ...rest } = item as any;
          return rest as Decision;
        });
      } else {
        results = results.slice(0, limit).map(item => {
          const { entry_metadata, ...rest } = item as any;
          return rest as Decision;
        });
      }

      return results;
    } catch (error: any) {
      console.error(`[WorkshopClient] SQLite error in queryDecisions:`, error.message);
      console.error(`[WorkshopClient] Database path: ${this.getDbPath()}`);
      return [];
    } finally {
      db.close();
    }
  }

  /**
   * Query standards/gotchas from Workshop using SQLite
   * When decay is enabled, applies time-weighted scoring
   */
  async queryStandards(domain: string): Promise<Standard[]> {
    const db = this.openDatabase();
    if (!db) return [];

    try {
      const sql = `
        SELECT id, type, content, reasoning, timestamp, entry_metadata
        FROM entries
        WHERE type = 'gotcha'
          AND content LIKE '%[' || ? || ']%'
        ORDER BY timestamp DESC
      `;
      const rows = db.prepare(sql).all(domain) as any[];

      let results: Standard[] = rows.map(row => {
        let metadata: any = {};
        if (row.entry_metadata) {
          try {
            metadata = JSON.parse(row.entry_metadata);
          } catch {}
        }

        return {
          id: row.id,
          created: new Date(row.timestamp),
          domain,
          what_happened: row.content || '',
          cost: metadata.cost || '',
          rule: row.reasoning || '',
          enforced_count: 0,
          entry_metadata: row.entry_metadata, // Keep for decay processing
        } as Standard & { entry_metadata?: string };
      });

      // Apply decay if enabled
      if (this.decayConfig.enabled) {
        const decayed = applyDecay(results, this.decayConfig);
        results = decayed.map(item => {
          const { entry_metadata, ...rest } = item as any;
          return rest as Standard;
        });
      } else {
        results = results.map(item => {
          const { entry_metadata, ...rest } = item as any;
          return rest as Standard;
        });
      }

      return results;
    } catch (error: any) {
      console.error(`[WorkshopClient] SQLite error in queryStandards:`, error.message);
      console.error(`[WorkshopClient] Database path: ${this.getDbPath()}`);
      return [];
    } finally {
      db.close();
    }
  }

  /**
   * Query task history from Workshop using SQLite
   * When decay is enabled, applies time-weighted scoring
   * Uses tokenized word matching for broader recall (matches ANY word)
   */
  async queryTaskHistory(query: string, limit = 10): Promise<TaskHistory[]> {
    const db = this.openDatabase();
    if (!db) return [];

    try {
      // Fetch more entries when decay is enabled to ensure good coverage after re-ranking
      const fetchLimit = this.decayConfig.enabled ? limit * 3 : limit;

      // Tokenize query for word-based matching
      const tokens = tokenizeQuery(query);
      const [whereClause, whereParams] = buildTokenizedWhereClause(tokens, 'content', false);

      const sql = `
        SELECT id, type, content, reasoning, timestamp, entry_metadata
        FROM entries
        WHERE type = 'note'
          AND content LIKE '%Task:%'
          AND ${whereClause}
        ORDER BY timestamp DESC
        LIMIT ?
      `;
      const rows = db.prepare(sql).all(...whereParams, fetchLimit) as any[];

      let results: TaskHistory[] = rows.map(row => {
        let metadata: any = {};
        if (row.entry_metadata) {
          try {
            metadata = JSON.parse(row.entry_metadata);
          } catch {}
        }

        // Extract domain from content pattern "[domain] Task: ..."
        const domainMatch = row.content?.match(/^\[([^\]]+)\]/);
        const domain = domainMatch ? domainMatch[1] : 'unknown';

        // Try new merged format: "[domain] Task: X | Outcome: Y | Files: Z | Learning: W"
        const taskMatch = row.content?.match(/Task:\s*(.+?)\s*\|/);
        const outcomeMatch = row.content?.match(/Outcome:\s*(success|failure|partial)/i);
        const filesMatch = row.content?.match(/Files:\s*(.+?)(?:\s*\|\s*Learning:|$)/);
        const learningsMatch = row.content?.match(/Learning:\s*(.+?)$/);

        const outcome = outcomeMatch ? outcomeMatch[1].toLowerCase() : 'success';
        const task = taskMatch ? taskMatch[1] : (row.content || '');
        const filesFromContent = filesMatch ? filesMatch[1].split(',').map((f: string) => f.trim()).filter(Boolean) : [];
        const learnings = learningsMatch ? learningsMatch[1] : (row.reasoning || '');

        return {
          id: row.id,
          timestamp: new Date(row.timestamp),
          domain,
          task,
          outcome: outcome as 'success' | 'failure' | 'partial',
          files_modified: filesFromContent.length > 0 ? filesFromContent : (metadata.files_modified || []),
          learnings,
          entry_metadata: row.entry_metadata, // Keep for decay processing
        } as TaskHistory & { entry_metadata?: string };
      });

      // Apply decay if enabled
      if (this.decayConfig.enabled) {
        const decayed = applyDecay(results, this.decayConfig);
        results = decayed.slice(0, limit).map(item => {
          const { entry_metadata, ...rest } = item as any;
          return rest as TaskHistory;
        });
      } else {
        results = results.slice(0, limit).map(item => {
          const { entry_metadata, ...rest } = item as any;
          return rest as TaskHistory;
        });
      }

      return results;
    } catch (error: any) {
      console.error(`[WorkshopClient] SQLite error in queryTaskHistory:`, error.message);
      console.error(`[WorkshopClient] Database path: ${this.getDbPath()}`);
      return [];
    } finally {
      db.close();
    }
  }

  /**
   * Get recent context from Workshop
   */
  async getRecentContext(): Promise<string> {
    return await this.runWorkshop('context');
  }

  /**
   * Ensures .workshop symlink points to .claude/memory for CLI default behavior.
   * Safe: never overwrites directory with data.
   */
  async ensureWorkshopSymlink(): Promise<void> {
    if (platform() === 'win32') {
      console.error('[WorkshopClient] Windows detected: symlink not auto-created');
      console.error('[WorkshopClient] Run manually: mklink /D .workshop .claude\\memory');
      return;
    }

    const projectPath = dirname(this.workspacePath); // Go up from .claude/memory
    const workshopPath = join(projectPath, '.workshop');
    const targetPath = '.claude/memory'; // Relative symlink

    try {
      if (!existsSync(workshopPath)) {
        // Case 1: .workshop doesn't exist - create symlink
        symlinkSync(targetPath, workshopPath);
        console.error(`[WorkshopClient] Created symlink: .workshop -> ${targetPath}`);
        return;
      }

      const stats = lstatSync(workshopPath);

      if (stats.isSymbolicLink()) {
        // Case 2: Already a symlink - verify target
        console.error('[WorkshopClient] .workshop symlink already exists');
        return;
      }

      if (stats.isDirectory()) {
        // Case 3: It's a directory
        const contents = readdirSync(workshopPath);
        if (contents.length === 0) {
          // Empty directory - safe to replace
          rmdirSync(workshopPath);
          symlinkSync(targetPath, workshopPath);
          console.error(`[WorkshopClient] Replaced empty .workshop with symlink`);
        } else {
          // Has data - DO NOT replace
          console.error('[WorkshopClient] WARNING: .workshop has data, not replacing with symlink');
          console.error('[WorkshopClient] To consolidate manually: mv .workshop/* .claude/memory/ && rm -rf .workshop && ln -s .claude/memory .workshop');
        }
      }
    } catch (error: any) {
      console.error(`[WorkshopClient] Symlink operation failed: ${error.message}`);
    }
  }
}
