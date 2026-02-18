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
];
/** Default presets directory */
export const DEFAULT_PRESETS_DIR = `${process.env.HOME}/3D-Models/_presets`;
//# sourceMappingURL=types.js.map