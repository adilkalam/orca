/**
 * bambu-3mf MCP - ZIP Utilities
 *
 * JSZip wrapper for reading and writing 3MF files.
 * Enforces GCODE_KEYS blocklist on all write paths.
 */

import JSZip from 'jszip';
import { readFile, writeFile, copyFile } from 'fs/promises';
import { existsSync } from 'fs';
import type { Settings, ThreeMFContents } from './types.js';
import { GCODE_KEYS } from './types.js';

/**
 * Read and parse a 3MF file.
 */
export async function read3MF(path: string): Promise<ThreeMFContents> {
  if (!existsSync(path)) {
    throw new Error(`3MF file not found: ${path}`);
  }

  const data = await readFile(path);
  const zip = await JSZip.loadAsync(data);

  const projectSettingsFile = zip.file('Metadata/project_settings.config');
  if (!projectSettingsFile) {
    throw new Error('No Metadata/project_settings.config found in 3MF');
  }
  const projectSettingsRaw = await projectSettingsFile.async('string');
  const projectSettings: Settings = JSON.parse(projectSettingsRaw);

  const filamentSettings: Record<number, Settings> = {};
  let filamentCount = 0;

  const filePaths = Object.keys(zip.files);

  for (const filePath of filePaths) {
    const match = filePath.match(/^Metadata\/filament_settings_(\d+)\.config$/);
    if (match) {
      const slotIndex = parseInt(match[1], 10);
      const file = zip.file(filePath);
      if (file) {
        const raw = await file.async('string');
        filamentSettings[slotIndex] = JSON.parse(raw);
        filamentCount = Math.max(filamentCount, slotIndex + 1);
      }
    }
  }

  // Also detect filament count from array settings
  for (const [, value] of Object.entries(projectSettings)) {
    if (Array.isArray(value) && value.length > filamentCount) {
      filamentCount = value.length;
    }
  }

  return { zip, projectSettings, filamentSettings, filamentCount, filePaths };
}

/**
 * Write a modified 3MF to disk. Creates backup first.
 */
export async function write3MF(
  originalPath: string,
  contents: ThreeMFContents,
  outputPath?: string
): Promise<string> {
  const target = outputPath || originalPath;

  const backupPath = originalPath.replace(/\.3mf$/i, '.backup.3mf');
  await copyFile(originalPath, backupPath);

  contents.zip.file(
    'Metadata/project_settings.config',
    JSON.stringify(contents.projectSettings, null, 4)
  );

  for (const [slotStr, settings] of Object.entries(contents.filamentSettings)) {
    contents.zip.file(
      `Metadata/filament_settings_${slotStr}.config`,
      JSON.stringify(settings, null, 4)
    );
  }

  const output = await contents.zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
  await writeFile(target, output);

  return backupPath;
}

/** Filter out gcode keys from a settings object. */
export function stripGcodeKeys(settings: Settings): Settings {
  const result: Settings = {};
  for (const [key, value] of Object.entries(settings)) {
    if (!isGcodeKey(key)) {
      result[key] = value;
    }
  }
  return result;
}

/** Check if a key is a protected gcode key. */
export function isGcodeKey(key: string): boolean {
  return (GCODE_KEYS as readonly string[]).includes(key);
}

/** Validate that no gcode keys are present. Throws if any found. */
export function guardGcodeKeys(settings: Record<string, unknown>): void {
  const violations = Object.keys(settings).filter(isGcodeKey);
  if (violations.length > 0) {
    throw new Error(
      `FORBIDDEN: Cannot modify gcode keys: ${violations.join(', ')}. ` +
      `These are machine-specific and must never be changed.`
    );
  }
}

/**
 * Merge settings into project_settings at a specific filament slot.
 * NEVER touches gcode keys.
 */
export function mergeIntoProjectSettings(
  projectSettings: Settings,
  updates: Settings,
  filamentSlot: number,
  filamentCount: number
): string[] {
  guardGcodeKeys(updates);

  const applied: string[] = [];
  const SKIP_KEYS = ['from', 'inherits', 'is_custom_defined', 'name', 'version'];

  for (const [key, value] of Object.entries(updates)) {
    if (isGcodeKey(key)) continue;
    if (SKIP_KEYS.includes(key)) continue;

    const existingValue = projectSettings[key];

    if (Array.isArray(value)) {
      const newValue = value[0];

      if (Array.isArray(existingValue)) {
        const arr = [...existingValue];
        while (arr.length < filamentCount) arr.push(arr[arr.length - 1] || '');
        arr[filamentSlot] = newValue;
        projectSettings[key] = arr;
      } else if (existingValue !== undefined) {
        projectSettings[key] = newValue;
      } else {
        const arr = new Array(filamentCount).fill('');
        arr[filamentSlot] = newValue;
        projectSettings[key] = arr;
      }
      applied.push(key);
    } else {
      if (Array.isArray(existingValue)) {
        const arr = [...existingValue];
        while (arr.length < filamentCount) arr.push(arr[arr.length - 1] || '');
        arr[filamentSlot] = value;
        projectSettings[key] = arr;
      } else {
        projectSettings[key] = value;
      }
      applied.push(key);
    }
  }

  return applied;
}

/**
 * Merge settings into filament_settings_N config.
 * Creates the config if it does not exist.
 * NEVER touches gcode keys.
 */
export function mergeIntoFilamentSettings(
  filamentSettings: Record<number, Settings>,
  updates: Settings,
  filamentSlot: number
): void {
  guardGcodeKeys(updates);

  if (!filamentSettings[filamentSlot]) {
    filamentSettings[filamentSlot] = {};
  }

  const config = filamentSettings[filamentSlot];

  for (const [key, value] of Object.entries(updates)) {
    if (isGcodeKey(key)) continue;
    config[key] = value;
  }
}
