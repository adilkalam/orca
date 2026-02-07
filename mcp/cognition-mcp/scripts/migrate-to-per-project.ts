#!/usr/bin/env npx tsx
/**
 * Migration Script: Global -> Per-Project Cognition Sessions
 *
 * Copies sessions from ~/.orca-cognition/sessions/ to per-project
 * locations at {project}/.claude/.cognition/sessions/ based on
 * tag/title attribution heuristics.
 *
 * SAFETY:
 * - Copy, not move: originals preserved in ~/.orca-cognition/sessions/
 * - --dry-run first: shows attribution report without touching files
 * - Updates session.json in copies to include projectPath field
 * - Writes global index.jsonl during migration
 *
 * Usage:
 *   npx tsx scripts/migrate-to-per-project.ts --dry-run
 *   npx tsx scripts/migrate-to-per-project.ts
 */

import { promises as fs } from 'fs';
import { existsSync, mkdirSync, appendFileSync } from 'fs';
import * as path from 'path';
import { homedir } from 'os';

// ============================================================================
// CONFIGURATION
// ============================================================================

const HOME = homedir();
const GLOBAL_SESSIONS_DIR = path.join(HOME, '.orca-cognition', 'sessions');
const GLOBAL_INDEX_PATH = path.join(HOME, '.orca-cognition', 'index.jsonl');

// Project path mappings (absolute paths)
const PROJECTS: Record<string, string> = {
  'peptidefox-ios': path.join(HOME, 'peptidefox-ios'),
  'peptidefox-expo': path.join(HOME, 'peptidefox-expo'),
  'peptidefox-mobile': path.join(HOME, 'peptidefox-mobile'),
  'peptidefox': path.join(HOME, 'peptidefox'),
  '3d-models': path.join(HOME, '3d-models'),
  'mk': path.join(HOME, 'mk'),
  'Shopify-MM': path.join(HOME, 'Shopify-MM'),
  'obsidian-peptides': path.join(HOME, 'obsidian-peptides'),
  'ORCA-OS': path.join(HOME, 'ORCA-OS'),
  'adhd': path.join(HOME, 'adhd'),
};

// ============================================================================
// ATTRIBUTION HEURISTICS (Tiered)
// ============================================================================

interface SessionMeta {
  id: string;
  title: string;
  tags: string[];
  createdAt: number;
  lastAccessedAt: number;
  status: string;
}

interface AttributionResult {
  projectKey: string | null;  // null = unattributed (stays global)
  tier: number;
  reason: string;
}

function attributeSession(meta: SessionMeta): AttributionResult {
  const tags = meta.tags.map(t => t.toLowerCase());
  const title = (meta.title || '').toLowerCase();

  // ---- TIER 1: Tag-based (high confidence) ----

  // PeptideFox iOS
  if (tags.includes('peptidefox') && tags.includes('ios')) {
    return { projectKey: 'peptidefox-ios', tier: 1, reason: 'tags: peptidefox + ios' };
  }

  // PeptideFox Expo
  if (tags.includes('peptidefox') && (tags.includes('expo') || tags.includes('react-native'))) {
    return { projectKey: 'peptidefox-expo', tier: 1, reason: 'tags: peptidefox + expo/react-native' };
  }

  // PeptideFox general (after iOS/Expo checks)
  if (tags.includes('peptidefox') || tags.includes('peptides') || tags.includes('peptide')) {
    return { projectKey: 'peptidefox', tier: 1, reason: 'tags: peptidefox/peptides' };
  }

  // 3D models / Blender
  if (tags.includes('3d-modeling') || tags.includes('blender') || tags.includes('3d') || tags.includes('openscad')) {
    return { projectKey: '3d-models', tier: 1, reason: 'tags: 3d-modeling/blender/openscad' };
  }

  // Trading / MK
  if (tags.includes('trading') || tags.includes('maverick') || tags.includes('mk')) {
    return { projectKey: 'mk', tier: 1, reason: 'tags: trading/maverick/mk' };
  }

  // Shopify
  if (tags.includes('shopify') || tags.includes('marina-moscone') || tags.includes('mm')) {
    return { projectKey: 'Shopify-MM', tier: 1, reason: 'tags: shopify/marina-moscone/mm' };
  }

  // Obsidian
  if (tags.includes('obsidian') || tags.includes('obsidian-peptides')) {
    return { projectKey: 'obsidian-peptides', tier: 1, reason: 'tags: obsidian' };
  }

  // ADHD
  if (tags.includes('adhd')) {
    return { projectKey: 'adhd', tier: 1, reason: 'tags: adhd' };
  }

  // ---- TIER 2: Title keywords (medium confidence) ----

  // 3D models
  if (title.includes('rugged case') || title.includes('5-vial') || title.includes('vial holder') ||
      title.includes('3d print') || title.includes('openscad') || title.includes('blender')) {
    return { projectKey: '3d-models', tier: 2, reason: 'title: 3d-related keywords' };
  }

  // Shopify
  if (title.includes('shopify') || title.includes('marina moscone') || title.includes('mm minisite')) {
    return { projectKey: 'Shopify-MM', tier: 2, reason: 'title: shopify-related keywords' };
  }

  // Trading
  if (title.includes('trading') || title.includes('maverick') || title.includes('technical pattern')) {
    return { projectKey: 'mk', tier: 2, reason: 'title: trading-related keywords' };
  }

  // PeptideFox
  if (title.includes('peptidefox') || title.includes('peptide')) {
    return { projectKey: 'peptidefox', tier: 2, reason: 'title: peptidefox keywords' };
  }

  // ---- TIER 3: ORCA-OS catch-all (broad) ----

  const orcaTags = [
    'orca-os', 'cognition-mcp', 'architecture', 'orchestration', 'deepthink',
    'readme', 'audit', 'hooks', 'substrate-observation', 'llm-reflection',
    'meta', 'plan', 'test', 'typography', 'font-engineering', 'seo',
    'orca', 'os-dev', 'pipeline', 'mcp', 'claude-code', 'self-improvement',
    'genesis', 'reflection', 'introspection', 'research', 'formatting',
    // Substrate/reflection research (Rachel Corrie, conflict analysis, LLM reflection)
    'substrate', 'substrate-analysis', 'substrate-observation',
    'rachel-corrie', 'conflict-analysis', 'conflict-studies',
    'training-defaults', 'training-variance', 'llm-limits', 'llm-variance',
    'instance-variance', 'affect', 'intimacy', 'grief',
    'screenplay-analysis', 'studio-coverage', 'creative',
    'occams-razor', 'self-observation', 'processing',
  ];

  if (tags.some(t => orcaTags.includes(t))) {
    return { projectKey: 'ORCA-OS', tier: 3, reason: 'tags: ORCA-OS domain tag' };
  }

  const orcaTitleKeywords = [
    'orca', 'cognition', 'deepthink', 'audit', 'readme', 'pipeline',
    'mcp', 'os dev', 'os 5', 'claude code', 'hook', 'agent',
    'substrate', 'reflection', 'typography', 'font',
    'rachel corrie', 'mural', 'reflex', 'llm difficulty', 'llm variance',
  ];

  if (orcaTitleKeywords.some(kw => title.includes(kw))) {
    return { projectKey: 'ORCA-OS', tier: 3, reason: 'title: ORCA-OS keyword' };
  }

  // ---- TIER 4: Unattributed ----
  return { projectKey: null, tier: 4, reason: 'no matching heuristic' };
}

// ============================================================================
// MIGRATION LOGIC
// ============================================================================

interface MigrationPlan {
  sessionId: string;
  meta: SessionMeta;
  attribution: AttributionResult;
  sourcePath: string;
  destPath: string | null;  // null = stays in place
}

async function loadSessionMeta(sessionId: string): Promise<SessionMeta | null> {
  const metaPath = path.join(GLOBAL_SESSIONS_DIR, sessionId, 'session.json');
  if (!existsSync(metaPath)) return null;

  try {
    const raw = await fs.readFile(metaPath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function buildMigrationPlan(): Promise<MigrationPlan[]> {
  const entries = await fs.readdir(GLOBAL_SESSIONS_DIR, { withFileTypes: true });
  const sessionDirs = entries.filter(e => e.isDirectory()).map(e => e.name);

  const plans: MigrationPlan[] = [];

  for (const sessionId of sessionDirs) {
    const meta = await loadSessionMeta(sessionId);
    if (!meta) {
      plans.push({
        sessionId,
        meta: { id: sessionId, title: '', tags: [], createdAt: 0, lastAccessedAt: 0, status: 'unknown' },
        attribution: { projectKey: null, tier: 4, reason: 'no session.json' },
        sourcePath: path.join(GLOBAL_SESSIONS_DIR, sessionId),
        destPath: null,
      });
      continue;
    }

    const attribution = attributeSession(meta);
    let destPath: string | null = null;

    if (attribution.projectKey && PROJECTS[attribution.projectKey]) {
      const projectDir = PROJECTS[attribution.projectKey];
      destPath = path.join(projectDir, '.claude', '.cognition', 'sessions', sessionId);
    }

    plans.push({
      sessionId,
      meta,
      attribution,
      sourcePath: path.join(GLOBAL_SESSIONS_DIR, sessionId),
      destPath,
    });
  }

  return plans;
}

function printReport(plans: MigrationPlan[]): void {
  const byProject: Record<string, MigrationPlan[]> = {};
  const byTier: Record<number, number> = {};

  for (const plan of plans) {
    const key = plan.attribution.projectKey || '(unattributed)';
    if (!byProject[key]) byProject[key] = [];
    byProject[key].push(plan);
    byTier[plan.attribution.tier] = (byTier[plan.attribution.tier] || 0) + 1;
  }

  console.log('\n=== MIGRATION PLAN ===');
  console.log(`Total sessions: ${plans.length}`);
  console.log(`\nBy tier:`);
  for (const [tier, count] of Object.entries(byTier).sort()) {
    console.log(`  Tier ${tier}: ${count} sessions`);
  }

  console.log(`\nBy project:`);
  for (const [project, projectPlans] of Object.entries(byProject).sort()) {
    console.log(`\n  ${project} (${projectPlans.length} sessions):`);
    for (const plan of projectPlans.slice(0, 5)) {
      const title = plan.meta.title || '(no title)';
      const truncTitle = title.length > 60 ? title.substring(0, 57) + '...' : title;
      console.log(`    [T${plan.attribution.tier}] ${plan.sessionId.substring(0, 8)}... "${truncTitle}"`);
      console.log(`         Reason: ${plan.attribution.reason}`);
    }
    if (projectPlans.length > 5) {
      console.log(`    ... and ${projectPlans.length - 5} more`);
    }
  }
  console.log('');
}

async function copySessionDir(sourcePath: string, destPath: string): Promise<void> {
  // Ensure destination parent exists
  const parentDir = path.dirname(destPath);
  if (!existsSync(parentDir)) {
    mkdirSync(parentDir, { recursive: true });
  }

  // Copy the entire directory
  await fs.cp(sourcePath, destPath, { recursive: true });
}

async function updateSessionMetadata(sessionDir: string, projectPath: string): Promise<void> {
  const metaPath = path.join(sessionDir, 'session.json');
  if (!existsSync(metaPath)) return;

  const raw = await fs.readFile(metaPath, 'utf8');
  const meta = JSON.parse(raw);
  meta.projectPath = projectPath;
  await fs.writeFile(metaPath, JSON.stringify(meta, null, 2));
}

function appendToGlobalIndex(meta: SessionMeta, projectPath?: string): void {
  const entry = {
    sessionId: meta.id,
    projectPath: projectPath || undefined,
    title: meta.title,
    tags: meta.tags,
    createdAt: meta.createdAt,
    lastAccessedAt: meta.lastAccessedAt,
    status: meta.status,
  };
  appendFileSync(GLOBAL_INDEX_PATH, JSON.stringify(entry) + '\n', 'utf8');
}

async function executeMigration(plans: MigrationPlan[]): Promise<void> {
  let copied = 0;
  let skipped = 0;
  let errors = 0;

  for (const plan of plans) {
    if (!plan.destPath || !plan.attribution.projectKey) {
      // Unattributed - still index it
      appendToGlobalIndex(plan.meta);
      skipped++;
      continue;
    }

    // Check if project directory exists
    const projectDir = PROJECTS[plan.attribution.projectKey];
    if (!projectDir || !existsSync(projectDir)) {
      console.error(`  SKIP: Project dir does not exist: ${projectDir}`);
      appendToGlobalIndex(plan.meta);
      skipped++;
      continue;
    }

    // Check if already migrated
    if (existsSync(plan.destPath)) {
      console.log(`  SKIP (exists): ${plan.sessionId.substring(0, 8)}... -> ${plan.attribution.projectKey}`);
      appendToGlobalIndex(plan.meta, projectDir);
      skipped++;
      continue;
    }

    try {
      await copySessionDir(plan.sourcePath, plan.destPath);
      await updateSessionMetadata(plan.destPath, projectDir);
      appendToGlobalIndex(plan.meta, projectDir);
      copied++;

      if (copied % 50 === 0) {
        console.log(`  Progress: ${copied} copied, ${skipped} skipped...`);
      }
    } catch (err) {
      console.error(`  ERROR copying ${plan.sessionId}: ${err}`);
      errors++;
    }
  }

  console.log(`\n=== MIGRATION COMPLETE ===`);
  console.log(`  Copied: ${copied}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Errors: ${errors}`);
  console.log(`  Global index: ${GLOBAL_INDEX_PATH}`);
}

// ============================================================================
// MAIN
// ============================================================================

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  if (!existsSync(GLOBAL_SESSIONS_DIR)) {
    console.error('No sessions directory found at', GLOBAL_SESSIONS_DIR);
    process.exit(1);
  }

  console.log(`Scanning ${GLOBAL_SESSIONS_DIR}...`);
  const plans = await buildMigrationPlan();

  printReport(plans);

  if (dryRun) {
    console.log('DRY RUN - no files were modified.');
    console.log('Run without --dry-run to execute migration.');
    return;
  }

  // Clear existing index before migration
  if (existsSync(GLOBAL_INDEX_PATH)) {
    await fs.writeFile(GLOBAL_INDEX_PATH, '');
  }

  console.log('Executing migration (copy, not move)...');
  await executeMigration(plans);
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
