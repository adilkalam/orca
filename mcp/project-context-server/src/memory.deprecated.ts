/**
 * Memory Store Implementation
 *
 * Manages vibe.db - the project's persistent memory
 * Stores: decisions, standards, task history, events
 */

import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { mkdirSync } from 'fs';
import type {
  Decision,
  Standard,
  TaskHistory,
  MemoryStore,
} from './types.js';

export class MemoryStoreImpl implements MemoryStore {
  private db: Database.Database | null = null;
  private projectPath: string | null = null;

  /**
   * Initialize database for a project (public method for interface)
   */
  async initializeDb(projectPath: string): Promise<void> {
    this.getDb(projectPath);
  }

  /**
   * Initialize database for a project
   */
  private getDb(projectPath?: string): Database.Database {
    if (projectPath && projectPath !== this.projectPath) {
      this.projectPath = projectPath;
      const dbPath = join(projectPath, '.claude', 'memory', 'vibe.db');

      // Ensure directory exists before creating database
      mkdirSync(dirname(dbPath), { recursive: true });

      this.db = new Database(dbPath);
      this.initSchema();
    }

    if (!this.db) {
      throw new Error('Database not initialized - call with projectPath first');
    }

    return this.db;
  }

  /**
   * Create vibe.db schema
   */
  private initSchema(): void {
    if (!this.db) return;

    // Decisions table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS decisions (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        domain TEXT NOT NULL,
        decision TEXT NOT NULL,
        reasoning TEXT NOT NULL,
        context TEXT,
        tags TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_decisions_domain ON decisions(domain);
      CREATE INDEX IF NOT EXISTS idx_decisions_timestamp ON decisions(timestamp);
    `);

    // Standards table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS standards (
        id TEXT PRIMARY KEY,
        what_happened TEXT NOT NULL,
        cost TEXT NOT NULL,
        rule TEXT NOT NULL,
        domain TEXT NOT NULL,
        created TEXT NOT NULL,
        enforced_count INTEGER DEFAULT 0
      );
      CREATE INDEX IF NOT EXISTS idx_standards_domain ON standards(domain);
    `);

    // Task history table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS task_history (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        domain TEXT NOT NULL,
        task TEXT NOT NULL,
        outcome TEXT NOT NULL,
        learnings TEXT,
        files_modified TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_task_history_domain ON task_history(domain);
      CREATE INDEX IF NOT EXISTS idx_task_history_timestamp ON task_history(timestamp);
      CREATE VIRTUAL TABLE IF NOT EXISTS task_history_fts USING fts5(
        task, learnings, content=task_history, content_rowid=rowid
      );
    `);

    // Events table (for future use)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        type TEXT NOT NULL,
        data TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
      CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);
    `);
  }

  async saveDecision(
    decision: Omit<Decision, 'id' | 'timestamp'>
  ): Promise<void> {
    const db = this.getDb();
    const id = `decision_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO decisions (id, timestamp, domain, decision, reasoning, context, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      timestamp,
      decision.domain,
      decision.decision,
      decision.reasoning,
      decision.context || null,
      decision.tags ? JSON.stringify(decision.tags) : null
    );
  }

  async queryDecisions(query: string, limit = 10): Promise<Decision[]> {
    const db = this.getDb();

    const stmt = db.prepare(`
      SELECT * FROM decisions
      WHERE decision LIKE ? OR reasoning LIKE ? OR context LIKE ?
      ORDER BY timestamp DESC
      LIMIT ?
    `);

    const pattern = `%${query}%`;
    const rows = stmt.all(pattern, pattern, pattern, limit) as any[];

    return rows.map((row) => ({
      id: row.id,
      timestamp: new Date(row.timestamp),
      domain: row.domain,
      decision: row.decision,
      reasoning: row.reasoning,
      context: row.context,
      tags: row.tags ? JSON.parse(row.tags) : undefined,
    }));
  }

  async saveStandard(
    standard: Omit<Standard, 'id' | 'created'>
  ): Promise<void> {
    const db = this.getDb();
    const id = `standard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const created = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO standards (id, what_happened, cost, rule, domain, created, enforced_count)
      VALUES (?, ?, ?, ?, ?, ?, 0)
    `);

    stmt.run(
      id,
      standard.what_happened,
      standard.cost,
      standard.rule,
      standard.domain,
      created
    );
  }

  async queryStandards(domain: string): Promise<Standard[]> {
    const db = this.getDb();

    const stmt = db.prepare(`
      SELECT * FROM standards
      WHERE domain = ? OR domain = 'global'
      ORDER BY enforced_count DESC, created DESC
    `);

    const rows = stmt.all(domain) as any[];

    return rows.map((row) => ({
      id: row.id,
      what_happened: row.what_happened,
      cost: row.cost,
      rule: row.rule,
      domain: row.domain,
      created: new Date(row.created),
      enforced_count: row.enforced_count,
    }));
  }

  async saveTaskHistory(
    task: Omit<TaskHistory, 'id' | 'timestamp'>
  ): Promise<void> {
    const db = this.getDb();
    const id = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO task_history (id, timestamp, domain, task, outcome, learnings, files_modified)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      timestamp,
      task.domain,
      task.task,
      task.outcome,
      task.learnings || null,
      task.files_modified ? JSON.stringify(task.files_modified) : null
    );
  }

  async queryTaskHistory(query: string, limit = 10): Promise<TaskHistory[]> {
    const db = this.getDb();

    // Use FTS for semantic search
    const stmt = db.prepare(`
      SELECT th.* FROM task_history th
      JOIN task_history_fts fts ON th.rowid = fts.rowid
      WHERE task_history_fts MATCH ?
      ORDER BY th.timestamp DESC
      LIMIT ?
    `);

    const rows = stmt.all(query, limit) as any[];

    return rows.map((row) => ({
      id: row.id,
      timestamp: new Date(row.timestamp),
      domain: row.domain,
      task: row.task,
      outcome: row.outcome as 'success' | 'failure' | 'partial',
      learnings: row.learnings,
      files_modified: row.files_modified
        ? JSON.parse(row.files_modified)
        : undefined,
    }));
  }
}
