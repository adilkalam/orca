/**
 * bambu-3mf MCP - OrcaSlicer CLI Wrapper
 *
 * Discovers, executes, and parses OrcaSlicer CLI output.
 * Uses child_process.execFile (NOT exec) to avoid shell injection.
 * No new npm dependencies -- Node built-ins only.
 */
import { execFile } from 'child_process';
import { existsSync } from 'fs';
import { readdir, readFile, mkdtemp, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { promisify } from 'util';
import { isGcodeKey } from './zip-utils.js';
const execFileAsync = promisify(execFile);
/** Default timeout for slicer operations (120 seconds). */
const SLICER_TIMEOUT = 120000;
/** Default filament cost per gram (PLA, ~$30/kg). */
const DEFAULT_COST_PER_GRAM = 0.03;
/** Keys to skip when converting JSON presets to INI format. */
const SKIP_KEYS = ['from', 'inherits', 'is_custom_defined', 'name', 'version'];
/** Cached CLI path (null = not searched yet, string = found, false = searched but not found). */
let cachedCliPath = null;
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
export function findOrcaSlicerCli() {
    if (cachedCliPath !== null) {
        return cachedCliPath === false ? null : cachedCliPath;
    }
    // 1. Environment variable
    const envPath = process.env.ORCASLICER_PATH;
    if (envPath && existsSync(envPath)) {
        cachedCliPath = envPath;
        return envPath;
    }
    // 2. Common macOS .app locations
    const homeDir = process.env.HOME || '';
    const appLocations = [
        '/Applications/OrcaSlicer.app/Contents/MacOS/OrcaSlicer',
        `${homeDir}/Applications/OrcaSlicer.app/Contents/MacOS/OrcaSlicer`,
        `${homeDir}/3d-models/OrcaSlicer/build/arm64/OrcaSlicer/OrcaSlicer.app/Contents/MacOS/OrcaSlicer`,
    ];
    for (const loc of appLocations) {
        if (existsSync(loc)) {
            cachedCliPath = loc;
            return loc;
        }
    }
    // 3. PATH lookup -- check common names synchronously via existsSync on
    //    well-known locations. We avoid spawning `which` here to stay sync.
    //    The CLI is typically only at the .app path on macOS, so falling
    //    through to null is expected when not installed.
    const pathDirs = (process.env.PATH || '').split(':');
    const names = ['orcaslicer', 'OrcaSlicer', 'OrcaSlicer-cli'];
    for (const dir of pathDirs) {
        for (const name of names) {
            const candidate = join(dir, name);
            if (existsSync(candidate)) {
                cachedCliPath = candidate;
                return candidate;
            }
        }
    }
    cachedCliPath = false;
    return null;
}
/**
 * Return the searched locations list for error messages.
 */
export function searchedLocations() {
    const homeDir = process.env.HOME || '~';
    return [
        'PATH (orcaslicer, OrcaSlicer, OrcaSlicer-cli)',
        '/Applications/OrcaSlicer.app/Contents/MacOS/OrcaSlicer',
        `${homeDir}/Applications/OrcaSlicer.app/Contents/MacOS/OrcaSlicer`,
        'ORCASLICER_PATH environment variable',
    ];
}
/**
 * Return a structured error object when CLI is not found.
 */
export function slicerNotFoundError() {
    return {
        error: `OrcaSlicer CLI not found. Searched: ${searchedLocations().join(', ')}`,
        hint: 'Install OrcaSlicer from https://github.com/SoftFever/OrcaSlicer/releases or set ORCASLICER_PATH environment variable.',
        install_guide: 'After installing, the CLI is typically at: /Applications/OrcaSlicer.app/Contents/MacOS/OrcaSlicer',
        searched: searchedLocations(),
    };
}
/**
 * Execute OrcaSlicer CLI on a 3MF file and return parsed metrics.
 *
 * @param filePath    Absolute path to the .3mf file
 * @param outputDir   Directory for slicer output (auto-created temp dir if omitted)
 * @param profileIni  Path to a .ini settings file to load
 * @param timeout     Timeout in ms (default: 120000)
 */
export async function runSlicer(filePath, outputDir, profileIni, timeout = SLICER_TIMEOUT) {
    const cliPath = findOrcaSlicerCli();
    if (!cliPath) {
        throw new Error('OrcaSlicer CLI not found');
    }
    if (!existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
    }
    // Create temp dir if none provided
    const useTemp = !outputDir;
    const outDir = outputDir || (await mkdtemp(join(tmpdir(), 'orcaslicer-')));
    try {
        // Build args list
        const args = [
            '--slice', '0',
            '--export-slicedata', outDir,
        ];
        if (profileIni && existsSync(profileIni)) {
            args.push('--load-settings', profileIni);
        }
        args.push(filePath);
        // Execute with execFile (no shell, no injection)
        const { stdout, stderr } = await execFileAsync(cliPath, args, {
            timeout,
            maxBuffer: 10 * 1024 * 1024, // 10MB
        });
        return await parseSlicerOutput(outDir, stdout, stderr);
    }
    finally {
        // Clean up temp dir
        if (useTemp) {
            await rm(outDir, { recursive: true, force: true }).catch(() => { });
        }
    }
}
/**
 * Parse slicer output using dual strategy: JSON file first, regex text fallback.
 */
export async function parseSlicerOutput(outputDir, stdout, stderr) {
    const warnings = [];
    // Strategy 1: Look for JSON file in output directory
    try {
        const files = await readdir(outputDir);
        const jsonFiles = files.filter((f) => f.endsWith('.json'));
        if (jsonFiles.length > 0) {
            const raw = await readFile(join(outputDir, jsonFiles[0]), 'utf-8');
            const data = JSON.parse(raw);
            const fromJson = extractFromJson(data, warnings);
            if (fromJson.estimated_time_minutes !== null) {
                return fromJson;
            }
        }
    }
    catch {
        // Fall through to text parsing
    }
    // Strategy 2: Parse stdout/stderr with regex
    const combined = `${stdout}\n${stderr}`;
    const timeMinutes = extractTimeFromText(combined);
    const weightGrams = extractWeightFromText(combined);
    const lengthMeters = extractLengthFromText(combined);
    const costUsd = weightGrams !== null ? Math.round(weightGrams * DEFAULT_COST_PER_GRAM * 100) / 100 : null;
    // Extract warnings from output
    const warningLines = combined
        .split('\n')
        .filter((line) => /warning|error/i.test(line))
        .map((line) => line.trim())
        .slice(0, 5);
    warnings.push(...warningLines);
    return {
        estimated_time_minutes: timeMinutes,
        estimated_time_formatted: formatTime(timeMinutes),
        filament_weight_grams: weightGrams,
        filament_length_meters: lengthMeters,
        estimated_cost_usd: costUsd,
        warnings,
    };
}
/** Extract metrics from a JSON data structure. */
function extractFromJson(data, warnings) {
    const timeMinutes = data.estimated_time_minutes ??
        data.time_minutes ??
        null;
    const weightGrams = data.filament_weight_grams ??
        data.weight_grams ??
        null;
    const lengthMeters = data.filament_length_meters ??
        data.length_meters ??
        null;
    const costUsd = weightGrams !== null ? Math.round(weightGrams * DEFAULT_COST_PER_GRAM * 100) / 100 : null;
    return {
        estimated_time_minutes: timeMinutes,
        estimated_time_formatted: formatTime(timeMinutes),
        filament_weight_grams: weightGrams,
        filament_length_meters: lengthMeters,
        estimated_cost_usd: costUsd,
        warnings,
    };
}
/** Extract time estimate in minutes from text output. */
export function extractTimeFromText(text) {
    const patterns = [
        {
            re: /estimated\s+time[:\s]+(\d+)\s*h(?:ours?)?\s*(\d+)\s*m(?:in(?:utes?)?)?/i,
            handler: (m) => parseInt(m[1], 10) * 60 + parseInt(m[2], 10),
        },
        {
            re: /estimated\s+time[:\s]+(\d+)\s*m(?:in(?:utes?)?)/i,
            handler: (m) => parseInt(m[1], 10),
        },
        {
            re: /time[:\s]+(\d+)\s*h(?:ours?)?\s*(\d+)\s*m(?:in(?:utes?)?)/i,
            handler: (m) => parseInt(m[1], 10) * 60 + parseInt(m[2], 10),
        },
        {
            re: /time[:\s]+(\d+)\s*m(?:in(?:utes?)?)/i,
            handler: (m) => parseInt(m[1], 10),
        },
        {
            re: /(\d+)\s*h(?:ours?)?\s*(\d+)\s*m(?:in(?:utes?)?)/i,
            handler: (m) => parseInt(m[1], 10) * 60 + parseInt(m[2], 10),
        },
        {
            re: /(\d+)\s*m(?:in(?:utes?)?)/i,
            handler: (m) => parseInt(m[1], 10),
        },
    ];
    for (const { re, handler } of patterns) {
        const match = text.match(re);
        if (match) {
            return handler(match);
        }
    }
    return null;
}
/** Extract filament weight in grams from text output. */
export function extractWeightFromText(text) {
    const patterns = [
        /filament\s+weight[:\s]+(\d+\.?\d*)\s*g(?:rams?)?/i,
        /weight[:\s]+(\d+\.?\d*)\s*g(?:rams?)?/i,
        /(\d+\.?\d*)\s*g(?:rams?)?\s+filament/i,
    ];
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            const val = parseFloat(match[1]);
            if (!isNaN(val))
                return val;
        }
    }
    return null;
}
/** Extract filament length in meters from text output. */
function extractLengthFromText(text) {
    const patterns = [
        /filament\s+length[:\s]+(\d+\.?\d*)\s*m(?:eters?)?/i,
        /length[:\s]+(\d+\.?\d*)\s*m(?:eters?)?/i,
        /(\d+\.?\d*)\s*m(?:eters?)?\s+filament/i,
    ];
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            const val = parseFloat(match[1]);
            if (!isNaN(val))
                return val;
        }
    }
    return null;
}
/** Format time in minutes as human-readable string. */
export function formatTime(minutes) {
    if (minutes === null)
        return null;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours > 0 && mins > 0)
        return `${hours}h ${mins}m`;
    if (hours > 0)
        return `${hours}h`;
    if (mins > 0)
        return `${mins}m`;
    return '0m';
}
/** Format time delta as signed human-readable string. */
export function formatTimeDelta(minutes) {
    const sign = minutes < 0 ? '-' : '+';
    const abs = Math.abs(minutes);
    const hours = Math.floor(abs / 60);
    const mins = Math.round(abs % 60);
    if (hours > 0 && mins > 0)
        return `${sign}${hours}h ${mins}m`;
    if (hours > 0)
        return `${sign}${hours}h`;
    return `${sign}${mins}m`;
}
/**
 * Convert a JSON preset to a temporary .ini file content string.
 * Filters out gcode keys and metadata keys.
 */
export function jsonPresetToIni(preset) {
    return Object.entries(preset)
        .filter(([key]) => !SKIP_KEYS.includes(key) && !isGcodeKey(key))
        .map(([key, value]) => {
        const val = Array.isArray(value) ? value[0] : value;
        return `${key} = ${val}`;
    })
        .join('\n');
}
//# sourceMappingURL=slicer.js.map