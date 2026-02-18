/**
 * bambu-3mf MCP - ZIP Utilities
 *
 * JSZip wrapper for reading and writing 3MF files.
 * Enforces GCODE_KEYS blocklist on all write paths.
 */
import type { Settings, ThreeMFContents } from './types.js';
/**
 * Read and parse a 3MF file.
 */
export declare function read3MF(path: string): Promise<ThreeMFContents>;
/**
 * Write a modified 3MF to disk. Creates backup first.
 */
export declare function write3MF(originalPath: string, contents: ThreeMFContents, outputPath?: string): Promise<string>;
/** Filter out gcode keys from a settings object. */
export declare function stripGcodeKeys(settings: Settings): Settings;
/** Check if a key is a protected gcode key. */
export declare function isGcodeKey(key: string): boolean;
/** Validate that no gcode keys are present. Throws if any found. */
export declare function guardGcodeKeys(settings: Record<string, unknown>): void;
/**
 * Merge settings into project_settings at a specific filament slot.
 * NEVER touches gcode keys.
 */
export declare function mergeIntoProjectSettings(projectSettings: Settings, updates: Settings, filamentSlot: number, filamentCount: number): string[];
/**
 * Merge settings into filament_settings_N config.
 * Creates the config if it does not exist.
 * NEVER touches gcode keys.
 */
export declare function mergeIntoFilamentSettings(filamentSettings: Record<number, Settings>, updates: Settings, filamentSlot: number): void;
//# sourceMappingURL=zip-utils.d.ts.map