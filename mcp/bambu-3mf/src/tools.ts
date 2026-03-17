/**
 * bambu-3mf MCP - Tool Implementations
 *
 * 8 tools for Bambu Studio 3MF settings manipulation and OrcaSlicer analysis.
 */

import { readdir, readFile, writeFile, mkdtemp, rm } from 'fs/promises';
import { existsSync } from 'fs';
import { join, resolve, basename } from 'path';
import { tmpdir } from 'os';
import type {
  PresetInfo,
  ReadSettingsResult,
  WriteResult,
  Settings,
  SliceMetrics,
  BatchMetrics,
  OrcaConfig,
} from './types.js';
import { DEFAULT_PRESETS_DIR, GCODE_KEYS } from './types.js';
import {
  read3MF,
  write3MF,
  stripGcodeKeys,
  mergeIntoProjectSettings,
  mergeIntoFilamentSettings,
  guardGcodeKeys,
} from './zip-utils.js';
import {
  findOrcaSlicerCli,
  slicerNotFoundError,
  runSlicer,
  formatTime,
  formatTimeDelta,
  jsonPresetToIni,
} from './slicer.js';
import { readOrcaConfig } from './orca-config.js';

// ===========================================================================
// Original 4 tools (unchanged)
// ===========================================================================

/** list_presets - Scan presets directory. */
export async function listPresets(
  type: 'filament' | 'process' | 'all' = 'all'
): Promise<PresetInfo[]> {
  const presetsDir = DEFAULT_PRESETS_DIR;
  const results: PresetInfo[] = [];

  const dirs: Array<{ dir: string; presetType: 'filament' | 'process' }> = [];
  if (type === 'all' || type === 'filament') {
    dirs.push({ dir: join(presetsDir, 'filaments'), presetType: 'filament' });
  }
  if (type === 'all' || type === 'process') {
    dirs.push({ dir: join(presetsDir, 'process'), presetType: 'process' });
  }

  for (const { dir, presetType } of dirs) {
    if (!existsSync(dir)) continue;
    const files = await readdir(dir);
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      const filePath = join(dir, file);
      try {
        const raw = await readFile(filePath, 'utf-8');
        const preset = JSON.parse(raw) as Record<string, unknown>;
        const keys = Object.keys(preset).filter(
          (k) => !(GCODE_KEYS as readonly string[]).includes(k)
        );
        results.push({
          name: (preset.name as string) || basename(file, '.json'),
          path: filePath,
          type: presetType,
          keys,
        });
      } catch { /* skip malformed */ }
    }
  }

  return results;
}

/** read_settings - Extract settings from a 3MF or JSON preset file. */
export async function readSettings(
  path: string,
  filamentSlot?: number,
  keys?: string[]
): Promise<ReadSettingsResult> {
  const absPath = resolve(path);

  // Plain JSON preset files: read directly instead of treating as zip
  if (absPath.endsWith('.json')) {
    const raw = await readFile(absPath, 'utf-8');
    let parsed = stripGcodeKeys(JSON.parse(raw) as Settings);
    if (keys && keys.length > 0) {
      const filtered: Settings = {};
      for (const key of keys) {
        if (key in parsed) filtered[key] = parsed[key];
      }
      parsed = filtered;
    }
    return {
      project_settings: parsed,
      filament_settings: {},
      filament_count: 0,
    };
  }

  const contents = await read3MF(absPath);

  let projectSettings = stripGcodeKeys(contents.projectSettings);

  if (keys && keys.length > 0) {
    const filtered: Settings = {};
    for (const key of keys) {
      if (key in projectSettings) filtered[key] = projectSettings[key];
    }
    projectSettings = filtered;
  }

  let filamentSettings: Record<number, Settings> = {};
  if (filamentSlot !== undefined) {
    if (contents.filamentSettings[filamentSlot]) {
      filamentSettings[filamentSlot] = stripGcodeKeys(contents.filamentSettings[filamentSlot]);
    }
  } else {
    for (const [slotStr, settings] of Object.entries(contents.filamentSettings)) {
      filamentSettings[parseInt(slotStr, 10)] = stripGcodeKeys(settings);
    }
  }

  return {
    project_settings: projectSettings,
    filament_settings: filamentSettings,
    filament_count: contents.filamentCount,
  };
}

/** apply_preset - Merge a preset JSON into a 3MF file. */
export async function applyPreset(
  path: string,
  preset: string,
  filamentSlot: number,
  outputPath?: string
): Promise<WriteResult> {
  const absPath = resolve(path);

  let presetPath: string;
  if (existsSync(preset)) {
    presetPath = resolve(preset);
  } else {
    presetPath = await findPreset(preset);
  }

  const presetRaw = await readFile(presetPath, 'utf-8');
  const presetSettings = JSON.parse(presetRaw) as Settings;
  guardGcodeKeys(presetSettings);

  const contents = await read3MF(absPath);

  if (filamentSlot < 0 || filamentSlot >= contents.filamentCount) {
    throw new Error(
      `Filament slot ${filamentSlot} out of range. ` +
      `This 3MF has ${contents.filamentCount} slots (0-${contents.filamentCount - 1}).`
    );
  }

  const applied = mergeIntoProjectSettings(
    contents.projectSettings, presetSettings, filamentSlot, contents.filamentCount
  );
  mergeIntoFilamentSettings(contents.filamentSettings, presetSettings, filamentSlot);

  const backupPath = await write3MF(absPath, contents, outputPath);

  return {
    success: true,
    backup_path: backupPath,
    settings_applied: applied,
    output_path: outputPath || absPath,
  };
}

/** update_settings - Surgical key-value override on a 3MF file. */
export async function updateSettings(
  path: string,
  settings: Record<string, string>,
  filamentSlot: number,
  outputPath?: string
): Promise<WriteResult> {
  const absPath = resolve(path);
  guardGcodeKeys(settings);

  const contents = await read3MF(absPath);

  if (filamentSlot < 0 || filamentSlot >= contents.filamentCount) {
    throw new Error(
      `Filament slot ${filamentSlot} out of range. ` +
      `This 3MF has ${contents.filamentCount} slots (0-${contents.filamentCount - 1}).`
    );
  }

  const settingsForMerge: Settings = {};
  for (const [key, value] of Object.entries(settings)) {
    settingsForMerge[key] = value;
  }

  const applied = mergeIntoProjectSettings(
    contents.projectSettings, settingsForMerge, filamentSlot, contents.filamentCount
  );

  const filamentMerge: Settings = {};
  for (const [key, value] of Object.entries(settings)) {
    filamentMerge[key] = [value];
  }
  mergeIntoFilamentSettings(contents.filamentSettings, filamentMerge, filamentSlot);

  const backupPath = await write3MF(absPath, contents, outputPath);

  return {
    success: true,
    backup_path: backupPath,
    settings_applied: applied,
    output_path: outputPath || absPath,
  };
}

/** Find a preset by name in the default presets directory. */
async function findPreset(name: string): Promise<string> {
  const dirs = [
    join(DEFAULT_PRESETS_DIR, 'filaments'),
    join(DEFAULT_PRESETS_DIR, 'process'),
  ];

  for (const dir of dirs) {
    if (!existsSync(dir)) continue;
    const files = await readdir(dir);
    for (const file of files) {
      if (!file.endsWith('.json')) continue;
      if (basename(file, '.json') === name) return join(dir, file);
      try {
        const filePath = join(dir, file);
        const raw = await readFile(filePath, 'utf-8');
        const preset = JSON.parse(raw) as Record<string, unknown>;
        if (preset.name === name) return filePath;
      } catch { /* skip */ }
    }
  }

  throw new Error(
    `Preset not found: "${name}". ` +
    `Searched in ${DEFAULT_PRESETS_DIR}/filaments/ and ${DEFAULT_PRESETS_DIR}/process/`
  );
}

// ===========================================================================
// New slicer tools (4 new tools)
// ===========================================================================

/**
 * slice_analyze - Run OrcaSlicer on current settings to get baseline metrics.
 *
 * Returns informative error with install instructions when CLI is absent.
 */
export async function sliceAnalyze(
  path: string
): Promise<SliceMetrics | ReturnType<typeof slicerNotFoundError>> {
  if (!findOrcaSlicerCli()) {
    return slicerNotFoundError();
  }

  const absPath = resolve(path);
  return runSlicer(absPath);
}

/**
 * slice_compare - Compare current settings against preset profiles via actual slicing.
 *
 * @param path     Absolute path to the .3mf file
 * @param presets  Optional list of preset names to compare (uses all available if omitted)
 */
export async function sliceCompare(
  path: string,
  presets?: string[]
): Promise<Record<string, unknown>> {
  if (!findOrcaSlicerCli()) {
    return slicerNotFoundError();
  }

  const absPath = resolve(path);

  // Slice with current settings first
  const current = await runSlicer(absPath);
  const results: Record<string, unknown> = { current };

  // Determine which presets to compare
  const presetNames = presets && presets.length > 0 ? presets : await getAvailablePresetNames();

  // Slice with each preset
  for (const presetName of presetNames) {
    let iniPath: string | null = null;
    let tempIniCreated = false;

    try {
      // Try to find preset and convert to INI
      iniPath = await createTempIniFromPreset(presetName);
      tempIniCreated = true;

      const presetMetrics = await runSlicer(absPath, undefined, iniPath);

      // Compute delta vs current
      const delta: Record<string, unknown> = { ...presetMetrics };
      if (
        current.estimated_time_minutes !== null &&
        presetMetrics.estimated_time_minutes !== null
      ) {
        const timeDiff = presetMetrics.estimated_time_minutes - current.estimated_time_minutes;
        delta.time_delta_minutes = timeDiff;
        delta.time_delta_formatted = formatTimeDelta(timeDiff);
      }
      if (
        current.filament_weight_grams !== null &&
        presetMetrics.filament_weight_grams !== null
      ) {
        delta.weight_delta_grams =
          Math.round((presetMetrics.filament_weight_grams - current.filament_weight_grams) * 100) / 100;
      }

      results[presetName] = delta;
    } catch (err) {
      results[presetName] = {
        error: err instanceof Error ? err.message : String(err),
      };
    } finally {
      // Clean up temp INI
      if (tempIniCreated && iniPath) {
        await rm(iniPath, { force: true }).catch(() => {});
      }
    }
  }

  // Generate recommendation
  results.recommendation = generateRecommendation(
    current,
    results as Record<string, SliceMetrics & { time_delta_minutes?: number }>
  );

  return results;
}

/**
 * slice_batch - Calculate batch production metrics for N units.
 *
 * @param path      Absolute path to the .3mf file
 * @param quantity  Number of units to produce
 * @param preset    Optional preset name (uses current settings if omitted)
 */
export async function sliceBatch(
  path: string,
  quantity: number,
  preset?: string
): Promise<BatchMetrics | ReturnType<typeof slicerNotFoundError>> {
  if (!findOrcaSlicerCli()) {
    return slicerNotFoundError();
  }

  if (quantity < 1 || !Number.isInteger(quantity)) {
    throw new Error('Quantity must be a positive integer');
  }

  const absPath = resolve(path);

  // Get baseline (current) metrics
  const baseline = await runSlicer(absPath);

  // Get profile metrics
  let profileResult: SliceMetrics;
  let profileName: string;

  if (preset) {
    profileName = preset;
    let iniPath: string | null = null;
    try {
      iniPath = await createTempIniFromPreset(preset);
      profileResult = await runSlicer(absPath, undefined, iniPath);
    } finally {
      if (iniPath) {
        await rm(iniPath, { force: true }).catch(() => {});
      }
    }
  } else {
    profileName = 'current';
    profileResult = baseline;
  }

  // Calculate batch metrics
  const timePerUnit = profileResult.estimated_time_minutes;
  if (timePerUnit === null) {
    throw new Error('Could not determine time per unit from slicer output');
  }

  const weightPerUnit = profileResult.filament_weight_grams;
  const costPerUnit = profileResult.estimated_cost_usd;

  const totalTimeMinutes = timePerUnit * quantity;
  const totalTimeHours = Math.round((totalTimeMinutes / 60) * 10) / 10;

  // Format total time
  const days = Math.floor(totalTimeHours / 24);
  const hours = Math.round(totalTimeHours % 24);
  const totalTimeFormatted =
    days > 0
      ? `${days} day${days > 1 ? 's' : ''}, ${hours} hours`
      : `${totalTimeHours} hours`;

  // Format per-unit time
  const perUnitTime = formatTime(timePerUnit) || '0m';

  // Compute comparison vs current
  let comparison = 'baseline';
  if (preset && baseline.estimated_time_minutes !== null) {
    const totalDelta = (timePerUnit - baseline.estimated_time_minutes) * quantity;
    comparison = `${formatTimeDelta(totalDelta)} vs. current settings`;
  }

  return {
    quantity,
    profile: profileName,
    total_time_hours: totalTimeHours,
    total_time_formatted: totalTimeFormatted,
    total_filament_kg:
      weightPerUnit !== null ? Math.round((weightPerUnit * quantity) / 1000 * 100) / 100 : null,
    total_cost_usd:
      costPerUnit !== null ? Math.round(costPerUnit * quantity * 100) / 100 : null,
    per_unit_time: perUnitTime,
    comparison_vs_current: comparison,
  };
}

/**
 * read_orca_config - Parse Orca_print.config XML from a 3MF file.
 *
 * Delegates to orca-config module. Does NOT require slicer CLI.
 */
export async function readOrcaConfigTool(
  path: string,
  keys?: string[]
): Promise<OrcaConfig> {
  return readOrcaConfig(path, keys);
}

// ===========================================================================
// Helpers for slicer tools
// ===========================================================================

/** Get available preset names from the presets directory. */
async function getAvailablePresetNames(): Promise<string[]> {
  const names: string[] = [];
  const dirs = [
    join(DEFAULT_PRESETS_DIR, 'filaments'),
    join(DEFAULT_PRESETS_DIR, 'process'),
  ];

  for (const dir of dirs) {
    if (!existsSync(dir)) continue;
    const files = await readdir(dir);
    for (const file of files) {
      if (file.endsWith('.json')) {
        names.push(basename(file, '.json'));
      }
    }
  }

  return names;
}

/**
 * Create a temporary .ini file from a JSON preset.
 * Returns the path to the temp .ini file.
 */
async function createTempIniFromPreset(presetName: string): Promise<string> {
  const presetPath = await findPreset(presetName);
  const raw = await readFile(presetPath, 'utf-8');
  const preset = JSON.parse(raw) as Settings;
  const iniContent = jsonPresetToIni(preset);

  const tmpDir = await mkdtemp(join(tmpdir(), 'orca-ini-'));
  const iniPath = join(tmpDir, `${presetName}.ini`);
  await writeFile(iniPath, iniContent, 'utf-8');

  return iniPath;
}

/** Generate a recommendation string from comparison results. */
function generateRecommendation(
  current: SliceMetrics,
  results: Record<string, SliceMetrics & { time_delta_minutes?: number }>
): string {
  if (current.estimated_time_minutes === null) {
    return 'Unable to generate recommendation: missing time estimate for current settings.';
  }

  let fastestName = '';
  let fastestTime = current.estimated_time_minutes;

  for (const [name, metrics] of Object.entries(results)) {
    if (name === 'current' || name === 'recommendation') continue;
    if (
      metrics &&
      typeof metrics === 'object' &&
      'estimated_time_minutes' in metrics &&
      metrics.estimated_time_minutes !== null &&
      metrics.estimated_time_minutes < fastestTime
    ) {
      fastestTime = metrics.estimated_time_minutes;
      fastestName = name;
    }
  }

  if (!fastestName) {
    return 'Current settings are already the fastest option among compared profiles.';
  }

  const savings = current.estimated_time_minutes - fastestTime;
  if (savings > 30) {
    return (
      `Recommendation: Use ${fastestName} profile. ` +
      `Saves ${formatTimeDelta(-savings).replace(/^[+-]/, '')} per unit compared to current settings.`
    );
  }
  if (savings > 0) {
    return (
      `All profiles have similar print times. ` +
      `${fastestName} saves ${formatTimeDelta(-savings).replace(/^[+-]/, '')} per unit. ` +
      `Consider quality requirements when choosing.`
    );
  }

  return 'Current settings are already well-optimized.';
}
