/**
 * bambu-3mf MCP - Tool Implementations
 *
 * 4 tools for Bambu Studio 3MF settings manipulation.
 */
import type { PresetInfo, ReadSettingsResult, WriteResult } from './types.js';
/** list_presets - Scan presets directory. */
export declare function listPresets(type?: 'filament' | 'process' | 'all'): Promise<PresetInfo[]>;
/** read_settings - Extract settings from a 3MF file. */
export declare function readSettings(path: string, filamentSlot?: number, keys?: string[]): Promise<ReadSettingsResult>;
/** apply_preset - Merge a preset JSON into a 3MF file. */
export declare function applyPreset(path: string, preset: string, filamentSlot: number, outputPath?: string): Promise<WriteResult>;
/** update_settings - Surgical key-value override on a 3MF file. */
export declare function updateSettings(path: string, settings: Record<string, string>, filamentSlot: number, outputPath?: string): Promise<WriteResult>;
//# sourceMappingURL=tools.d.ts.map