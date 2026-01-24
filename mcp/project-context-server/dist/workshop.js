/**
 * Workshop Client
 *
 * Wraps Workshop CLI for reading/writing session memory.
 * Workshop handles: decisions, gotchas, learnings, task history
 *
 * This keeps code-index.db focused on code context only (chunks, components, embeddings)
 */
import { exec } from 'child_process';
import { promisify } from 'util';
import Database from 'better-sqlite3';
import { existsSync, lstatSync, readdirSync, readFileSync, symlinkSync, rmdirSync } from 'fs';
import { join, dirname } from 'path';
import { platform } from 'os';
import { fileURLToPath } from 'url';
const execAsync = promisify(exec);
// Default decay config (OFF by default for backward compatibility)
const DEFAULT_DECAY_CONFIG = {
    enabled: false,
    halfLifeDays: 90,
    minimumScore: 0.01,
};
/**
 * Calculate decay score for a timestamp
 * Uses exponential decay: score = 0.5^(days / halfLife)
 */
export function calculateDecay(timestamp, config) {
    if (!config.enabled)
        return 1.0;
    const now = Date.now();
    const created = timestamp.getTime();
    const daysSinceCreation = (now - created) / (1000 * 60 * 60 * 24);
    // Clamp negative days (future timestamps) to 0
    if (daysSinceCreation < 0)
        return 1.0;
    const score = Math.pow(0.5, daysSinceCreation / config.halfLifeDays);
    return Math.max(score, config.minimumScore);
}
/**
 * Apply decay to a list of entries with timestamps
 * Returns entries sorted by decayed score (highest first)
 */
export function applyDecay(entries, config) {
    return entries
        .map(entry => {
        // Parse metadata to check for pinned status
        let metadata = {};
        if (entry.entry_metadata) {
            try {
                metadata = JSON.parse(entry.entry_metadata);
            }
            catch { }
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
function tokenizeQuery(query) {
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who', 'whom', 'how', 'when', 'where', 'why']);
    return query
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, ' ') // Remove special chars
        .split(/\s+/)
        .filter(word => word.length >= 3 && !stopWords.has(word));
}
/**
 * Build a SQL WHERE clause for tokenized word matching.
 * Returns [clause, params] where clause matches ANY word in content OR reasoning.
 */
function buildTokenizedWhereClause(tokens, fieldName = 'content', includeReasoning = true) {
    if (tokens.length === 0) {
        return ['1=1', []]; // Match all if no tokens
    }
    const conditions = [];
    const params = [];
    for (const token of tokens) {
        if (includeReasoning) {
            conditions.push(`(${fieldName} LIKE '%' || ? || '%' OR reasoning LIKE '%' || ? || '%')`);
            params.push(token, token);
        }
        else {
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
function loadDecayConfig(projectPath) {
    // Try project-specific config first
    const projectConfigPath = join(projectPath, '.claude', 'config', 'memory.json');
    if (existsSync(projectConfigPath)) {
        try {
            const config = JSON.parse(readFileSync(projectConfigPath, 'utf-8'));
            return { ...DEFAULT_DECAY_CONFIG, ...config.decay };
        }
        catch (error) {
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
    }
    catch (error) {
        console.error(`[WorkshopClient] Failed to load package config:`, error);
    }
    return DEFAULT_DECAY_CONFIG;
}
export class WorkshopClient {
    workspacePath;
    projectPath;
    decayConfig;
    constructor(projectPath) {
        this.projectPath = projectPath;
        // Workshop uses .claude/memory as workspace
        this.workspacePath = `${projectPath}/.claude/memory`;
        // Load decay configuration
        this.decayConfig = loadDecayConfig(projectPath);
        if (this.decayConfig.enabled) {
            console.error(`[WorkshopClient] Memory decay enabled: ${this.decayConfig.halfLifeDays}-day half-life`);
        }
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
     * When decay is enabled, applies time-weighted scoring
     * Uses tokenized word matching for broader recall (matches ANY word)
     */
    async queryDecisions(query, limit = 10) {
        const db = this.openDatabase();
        if (!db)
            return [];
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
            const rows = db.prepare(sql).all(...whereParams, fetchLimit);
            let results = rows.map(row => {
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
                    entry_metadata: row.entry_metadata, // Keep for decay processing
                };
            });
            // Apply decay if enabled
            if (this.decayConfig.enabled) {
                const decayed = applyDecay(results, this.decayConfig);
                results = decayed.slice(0, limit).map(item => {
                    const { entry_metadata, ...rest } = item;
                    return rest;
                });
            }
            else {
                results = results.slice(0, limit).map(item => {
                    const { entry_metadata, ...rest } = item;
                    return rest;
                });
            }
            return results;
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
     * When decay is enabled, applies time-weighted scoring
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
            let results = rows.map(row => {
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
                    entry_metadata: row.entry_metadata, // Keep for decay processing
                };
            });
            // Apply decay if enabled
            if (this.decayConfig.enabled) {
                const decayed = applyDecay(results, this.decayConfig);
                results = decayed.map(item => {
                    const { entry_metadata, ...rest } = item;
                    return rest;
                });
            }
            else {
                results = results.map(item => {
                    const { entry_metadata, ...rest } = item;
                    return rest;
                });
            }
            return results;
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
     * When decay is enabled, applies time-weighted scoring
     * Uses tokenized word matching for broader recall (matches ANY word)
     */
    async queryTaskHistory(query, limit = 10) {
        const db = this.openDatabase();
        if (!db)
            return [];
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
            const rows = db.prepare(sql).all(...whereParams, fetchLimit);
            let results = rows.map(row => {
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
                    entry_metadata: row.entry_metadata, // Keep for decay processing
                };
            });
            // Apply decay if enabled
            if (this.decayConfig.enabled) {
                const decayed = applyDecay(results, this.decayConfig);
                results = decayed.slice(0, limit).map(item => {
                    const { entry_metadata, ...rest } = item;
                    return rest;
                });
            }
            else {
                results = results.slice(0, limit).map(item => {
                    const { entry_metadata, ...rest } = item;
                    return rest;
                });
            }
            return results;
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