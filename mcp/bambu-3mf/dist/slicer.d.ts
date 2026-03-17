/**
 * bambu-3mf MCP - OrcaSlicer CLI Wrapper
 *
 * Discovers, executes, and parses OrcaSlicer CLI output.
 * Uses child_process.execFile (NOT exec) to avoid shell injection.
 * No new npm dependencies -- Node built-ins only.
 */
import type { SliceMetrics, Settings } from './types.js';
/**
 * Find the OrcaSlicer CLI binary.
 *
 * Search order:
 * 1. ORCASLICER_PATH environment variable
 * 2. Common macOS .app locations
 * 3. PATH via `which`
 *
 * Caches result for session lifetime.
 */
export declare function findOrcaSlicerCli(): string | null;
/**
 * Return the searched locations list for error messages.
 */
export declare function searchedLocations(): string[];
/**
 * Return a structured error object when CLI is not found.
 */
export declare function slicerNotFoundError(): {
    error: string;
    hint: string;
    install_guide: string;
    searched: string[];
};
/**
 * Execute OrcaSlicer CLI on a 3MF file and return parsed metrics.
 *
 * @param filePath    Absolute path to the .3mf file
 * @param outputDir   Directory for slicer output (auto-created temp dir if omitted)
 * @param profileIni  Path to a .ini settings file to load
 * @param timeout     Timeout in ms (default: 120000)
 */
export declare function runSlicer(filePath: string, outputDir?: string, profileIni?: string, timeout?: number): Promise<SliceMetrics>;
/**
 * Parse slicer output using dual strategy: JSON file first, regex text fallback.
 */
export declare function parseSlicerOutput(outputDir: string, stdout: string, stderr: string): Promise<SliceMetrics>;
/** Extract time estimate in minutes from text output. */
export declare function extractTimeFromText(text: string): number | null;
/** Extract filament weight in grams from text output. */
export declare function extractWeightFromText(text: string): number | null;
/** Format time in minutes as human-readable string. */
export declare function formatTime(minutes: number | null): string | null;
/** Format time delta as signed human-readable string. */
export declare function formatTimeDelta(minutes: number): string;
/**
 * Convert a JSON preset to a temporary .ini file content string.
 * Filters out gcode keys and metadata keys.
 */
export declare function jsonPresetToIni(preset: Settings): string;
//# sourceMappingURL=slicer.d.ts.map