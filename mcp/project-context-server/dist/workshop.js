/**
 * Workshop Client
 *
 * Wraps Workshop CLI for reading/writing session memory.
 * Workshop handles: decisions, gotchas, learnings, task history
 *
 * This keeps vibe.db focused on code context only (chunks, components, embeddings)
 */
import { exec } from 'child_process';
import { promisify } from 'util';
import Database from 'better-sqlite3';
import { existsSync, lstatSync, readdirSync, symlinkSync, rmdirSync } from 'fs';
import { join, dirname } from 'path';
import { platform } from 'os';
const execAsync = promisify(exec);
export class WorkshopClient {
    workspacePath;
    constructor(projectPath) {
        // Workshop uses .claude/memory as workspace
        this.workspacePath = `${projectPath}/.claude/memory`;
        // Attempt symlink creation (non-blocking, logs on failure)
        this.ensureWorkshopSymlink().catch(() => { });
    }
    getDbPath() {
        return join(this.workspacePath, 'workshop.db');
    }
    openDatabase() {
        const dbPath = this.getDbPath();
        if (!existsSync(dbPath)) {
            console.error(`[WorkshopClient] Database not found: ${dbPath}`);
            return null;
        }
        try {
            return new Database(dbPath, { readonly: true, fileMustExist: true });
        }
        catch (error) {
            console.error(`[WorkshopClient] Failed to open database: ${error.message}`);
            console.error(`[WorkshopClient] Database path: ${dbPath}`);
            return null;
        }
    }
    /**
     * Execute workshop command
     */
    async runWorkshop(args) {
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
        }
        catch (error) {
            console.error(`Workshop error: ${error.message}`);
            return '';
        }
    }
    /**
     * Save a decision to Workshop
     */
    async saveDecision(decision) {
        const tagsArg = decision.tags?.map((t) => `-t "${t}"`).join(' ') || '';
        const decisionText = `[${decision.domain}] ${decision.decision}`;
        await this.runWorkshop(`decision "${decisionText}" -r "${decision.reasoning}" ${tagsArg}`);
    }
    /**
     * Save a gotcha (standard/rule) to Workshop
     */
    async saveGotcha(standard) {
        const gotchaText = `[${standard.domain}] ${standard.rule} (Cost: ${standard.cost}. Cause: ${standard.what_happened})`;
        await this.runWorkshop(`gotcha "${gotchaText}" -t "${standard.domain}"`);
    }
    /**
     * Save task history as a note
     */
    async saveTaskHistory(task) {
        const filesStr = task.files_modified?.join(', ') || 'none';
        const noteText = `[${task.domain}] Task: ${task.task} | Outcome: ${task.outcome} | Files: ${filesStr}`;
        await this.runWorkshop(`note "${noteText}"`);
        // Save learnings separately if present
        if (task.learnings) {
            await this.runWorkshop(`note "[${task.domain}] Learning: ${task.learnings}"`);
        }
    }
    /**
     * Query decisions from Workshop using SQLite
     */
    async queryDecisions(query, limit = 10) {
        const db = this.openDatabase();
        if (!db)
            return [];
        try {
            const sql = `
        SELECT id, type, content, reasoning, timestamp, entry_metadata
        FROM entries
        WHERE type = 'decision'
          AND (content LIKE '%' || ? || '%' OR reasoning LIKE '%' || ? || '%')
        ORDER BY timestamp DESC
        LIMIT ?
      `;
            const rows = db.prepare(sql).all(query, query, limit);
            return rows.map(row => {
                let metadata = {};
                if (row.entry_metadata) {
                    try {
                        metadata = JSON.parse(row.entry_metadata);
                    }
                    catch { }
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
                };
            });
        }
        catch (error) {
            console.error(`[WorkshopClient] SQLite error in queryDecisions:`, error.message);
            console.error(`[WorkshopClient] Database path: ${this.getDbPath()}`);
            return [];
        }
        finally {
            db.close();
        }
    }
    /**
     * Query standards/gotchas from Workshop using SQLite
     */
    async queryStandards(domain) {
        const db = this.openDatabase();
        if (!db)
            return [];
        try {
            const sql = `
        SELECT id, type, content, reasoning, timestamp, entry_metadata
        FROM entries
        WHERE type = 'gotcha'
          AND content LIKE '%[' || ? || ']%'
        ORDER BY timestamp DESC
      `;
            const rows = db.prepare(sql).all(domain);
            return rows.map(row => {
                let metadata = {};
                if (row.entry_metadata) {
                    try {
                        metadata = JSON.parse(row.entry_metadata);
                    }
                    catch { }
                }
                return {
                    id: row.id,
                    created: new Date(row.timestamp),
                    domain,
                    what_happened: row.content || '',
                    cost: metadata.cost || '',
                    rule: row.reasoning || '',
                    enforced_count: 0,
                };
            });
        }
        catch (error) {
            console.error(`[WorkshopClient] SQLite error in queryStandards:`, error.message);
            console.error(`[WorkshopClient] Database path: ${this.getDbPath()}`);
            return [];
        }
        finally {
            db.close();
        }
    }
    /**
     * Query task history from Workshop using SQLite
     */
    async queryTaskHistory(query, limit = 10) {
        const db = this.openDatabase();
        if (!db)
            return [];
        try {
            const sql = `
        SELECT id, type, content, reasoning, timestamp, entry_metadata
        FROM entries
        WHERE type = 'note'
          AND content LIKE '%Task:%'
          AND content LIKE '%' || ? || '%'
        ORDER BY timestamp DESC
        LIMIT ?
      `;
            const rows = db.prepare(sql).all(query, limit);
            return rows.map(row => {
                let metadata = {};
                if (row.entry_metadata) {
                    try {
                        metadata = JSON.parse(row.entry_metadata);
                    }
                    catch { }
                }
                // Extract domain from content pattern "[domain] Task: ..."
                const domainMatch = row.content?.match(/^\[([^\]]+)\]/);
                const domain = domainMatch ? domainMatch[1] : 'unknown';
                // Determine outcome from content
                const outcomeMatch = row.content?.match(/outcome:\s*(success|failure|partial)/i);
                const outcome = outcomeMatch ? outcomeMatch[1].toLowerCase() : 'success';
                return {
                    id: row.id,
                    timestamp: new Date(row.timestamp),
                    domain,
                    task: row.content || '',
                    outcome: outcome,
                    files_modified: metadata.files_modified || [],
                    learnings: row.reasoning || '',
                };
            });
        }
        catch (error) {
            console.error(`[WorkshopClient] SQLite error in queryTaskHistory:`, error.message);
            console.error(`[WorkshopClient] Database path: ${this.getDbPath()}`);
            return [];
        }
        finally {
            db.close();
        }
    }
    /**
     * Get recent context from Workshop
     */
    async getRecentContext() {
        return await this.runWorkshop('context');
    }
    /**
     * Ensures .workshop symlink points to .claude/memory for CLI default behavior.
     * Safe: never overwrites directory with data.
     */
    async ensureWorkshopSymlink() {
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
                }
                else {
                    // Has data - DO NOT replace
                    console.error('[WorkshopClient] WARNING: .workshop has data, not replacing with symlink');
                    console.error('[WorkshopClient] To consolidate manually: mv .workshop/* .claude/memory/ && rm -rf .workshop && ln -s .claude/memory .workshop');
                }
            }
        }
        catch (error) {
            console.error(`[WorkshopClient] Symlink operation failed: ${error.message}`);
        }
    }
}
//# sourceMappingURL=workshop.js.map