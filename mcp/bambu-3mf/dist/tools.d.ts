/**
 * bambu-3mf MCP - Tool Implementations
 *
 * 8 tools for Bambu Studio 3MF settings manipulation and OrcaSlicer analysis.
 */
import type { PresetInfo, ReadSettingsResult, WriteResult, SliceMetrics, BatchMetrics, OrcaConfig } from './types.js';
import { slicerNotFoundError } from './slicer.js';
/** list_presets - Scan presets directory. */
export declare function listPresets(type?: 'filament' | 'process' | 'all'): Promise<PresetInfo[]>;
/** read_settings - Extract settings from a 3MF or JSON preset file. */
export declare function readSettings(path: string, filamentSlot?: number, keys?: string[]): Promise<ReadSettingsResult>;
/** apply_preset - Merge a preset JSON into a 3MF file. */
export declare function applyPreset(path: string, preset: string, filamentSlot: number, outputPath?: string): Promise<WriteResult>;
/** update_settings - Surgical key-value override on a 3MF file. */
export declare function updateSettings(path: string, settings: Record<string, string>, filamentSlot: number, outputPath?: string): Promise<WriteResult>;
/**
 * slice_analyze - Run OrcaSlicer on current settings to get baseline metrics.
 *
 * Returns informative error with install instructions when CLI is absent.
 */
export declare function sliceAnalyze(path: string): Promise<SliceMetrics | ReturnType<typeof slicerNotFoundError>>;
/**
 * slice_compare - Compare current settings against preset profiles via actual slicing.
 *
 * @param path     Absolute path to the .3mf file
 * @param presets  Optional list of preset names to compare (uses all available if omitted)
 */
export declare function sliceCompare(path: string, presets?: string[]): Promise<Record<string, unknown>>;
/**
 * slice_batch - Calculate batch production metrics for N units.
 *
 * @param path      Absolute path to the .3mf file
 * @param quantity  Number of units to produce
 * @param preset    Optional preset name (uses current settings if omitted)
 */
export declare function sliceBatch(path: string, quantity: number, preset?: string): Promise<BatchMetrics | ReturnType<typeof slicerNotFoundError>>;
/**
 * read_orca_config - Parse Orca_print.config XML from a 3MF file.
 *
 * Delegates to orca-config module. Does NOT require slicer CLI.
 */
export declare function readOrcaConfigTool(path: string, keys?: string[]): Promise<OrcaConfig>;
//# sourceMappingURL=tools.d.ts.map