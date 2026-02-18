/**
 * bambu-3mf MCP - Type Definitions
 */
/** The 6 gcode keys that must NEVER be modified */
export declare const GCODE_KEYS: readonly ["change_filament_gcode", "layer_change_gcode", "machine_end_gcode", "machine_start_gcode", "time_lapse_gcode", "wrapping_detection_gcode"];
export type GcodeKey = typeof GCODE_KEYS[number];
/** Default presets directory */
export declare const DEFAULT_PRESETS_DIR: string;
/** A single setting value - either a scalar string or per-slot string array */
export type SettingValue = string | string[];
/** Settings object - flat key-value map from config files */
export type Settings = Record<string, SettingValue>;
/** Preset metadata returned by list_presets */
export interface PresetInfo {
    name: string;
    path: string;
    type: 'filament' | 'process';
    keys: string[];
}
/** Result from read_settings */
export interface ReadSettingsResult {
    project_settings: Settings;
    filament_settings: Record<number, Settings>;
    filament_count: number;
}
/** Result from write operations */
export interface WriteResult {
    success: boolean;
    backup_path: string;
    settings_applied: string[];
    output_path: string;
}
/** Parsed 3MF structure */
export interface ThreeMFContents {
    zip: import('jszip');
    projectSettings: Settings;
    filamentSettings: Record<number, Settings>;
    filamentCount: number;
    filePaths: string[];
}
//# sourceMappingURL=types.d.ts.map