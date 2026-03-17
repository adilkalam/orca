/**
 * bambu-3mf MCP - Type Definitions
 */

/** The 6 gcode keys that must NEVER be modified */
export const GCODE_KEYS = [
  'change_filament_gcode',
  'layer_change_gcode',
  'machine_end_gcode',
  'machine_start_gcode',
  'time_lapse_gcode',
  'wrapping_detection_gcode',
] as const;

export type GcodeKey = typeof GCODE_KEYS[number];

/** Default presets directory */
export const DEFAULT_PRESETS_DIR = `${process.env.HOME}/3D-Models/_presets`;

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

// ---------------------------------------------------------------------------
// Slicer types (OrcaSlicer CLI integration)
// ---------------------------------------------------------------------------

/** Metrics returned from a slicer operation. */
export interface SliceMetrics {
  estimated_time_minutes: number | null;
  estimated_time_formatted: string | null;
  filament_weight_grams: number | null;
  filament_length_meters: number | null;
  estimated_cost_usd: number | null;
  warnings: string[];
}

/** Parsed Orca_print.config metadata. */
export interface OrcaConfig {
  filament_type: string | null;
  nozzle_diameter: string | null;
  layer_height: string | null;
  infill_density: string | null;
  wall_loops: number | null;
  support_enabled: boolean | null;
  previously_sliced: boolean;
  last_estimate: string | null;
  /** All raw key-value pairs from the XML. */
  raw: Record<string, string>;
}

/** Batch production estimate result. */
export interface BatchMetrics {
  quantity: number;
  profile: string;
  total_time_hours: number;
  total_time_formatted: string;
  total_filament_kg: number | null;
  total_cost_usd: number | null;
  per_unit_time: string;
  comparison_vs_current: string;
}
