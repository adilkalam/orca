/**
 * bambu-3mf MCP - Tool Implementations
 *
 * 4 tools for Bambu Studio 3MF settings manipulation.
 */
import { readdir, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join, resolve, basename } from 'path';
import { DEFAULT_PRESETS_DIR, GCODE_KEYS } from './types.js';
import { read3MF, write3MF, stripGcodeKeys, mergeIntoProjectSettings, mergeIntoFilamentSettings, guardGcodeKeys, } from './zip-utils.js';
/** list_presets - Scan presets directory. */
export async function listPresets(type = 'all') {
    const presetsDir = DEFAULT_PRESETS_DIR;
    const results = [];
    const dirs = [];
    if (type === 'all' || type === 'filament') {
        dirs.push({ dir: join(presetsDir, 'filaments'), presetType: 'filament' });
    }
    if (type === 'all' || type === 'process') {
        dirs.push({ dir: join(presetsDir, 'process'), presetType: 'process' });
    }
    for (const { dir, presetType } of dirs) {
        if (!existsSync(dir))
            continue;
        const files = await readdir(dir);
        for (const file of files) {
            if (!file.endsWith('.json'))
                continue;
            const filePath = join(dir, file);
            try {
                const raw = await readFile(filePath, 'utf-8');
                const preset = JSON.parse(raw);
                const keys = Object.keys(preset).filter((k) => !GCODE_KEYS.includes(k));
                results.push({
                    name: preset.name || basename(file, '.json'),
                    path: filePath,
                    type: presetType,
                    keys,
                });
            }
            catch { /* skip malformed */ }
        }
    }
    return results;
}
/** read_settings - Extract settings from a 3MF or JSON preset file. */
export async function readSettings(path, filamentSlot, keys) {
    const absPath = resolve(path);
    // Plain JSON preset files: read directly instead of treating as zip
    if (absPath.endsWith('.json')) {
        const raw = await readFile(absPath, 'utf-8');
        let parsed = stripGcodeKeys(JSON.parse(raw));
        if (keys && keys.length > 0) {
            const filtered = {};
            for (const key of keys) {
                if (key in parsed)
                    filtered[key] = parsed[key];
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
        const filtered = {};
        for (const key of keys) {
            if (key in projectSettings)
                filtered[key] = projectSettings[key];
        }
        projectSettings = filtered;
    }
    let filamentSettings = {};
    if (filamentSlot !== undefined) {
        if (contents.filamentSettings[filamentSlot]) {
            filamentSettings[filamentSlot] = stripGcodeKeys(contents.filamentSettings[filamentSlot]);
        }
    }
    else {
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
export async function applyPreset(path, preset, filamentSlot, outputPath) {
    const absPath = resolve(path);
    let presetPath;
    if (existsSync(preset)) {
        presetPath = resolve(preset);
    }
    else {
        presetPath = await findPreset(preset);
    }
    const presetRaw = await readFile(presetPath, 'utf-8');
    const presetSettings = JSON.parse(presetRaw);
    guardGcodeKeys(presetSettings);
    const contents = await read3MF(absPath);
    if (filamentSlot < 0 || filamentSlot >= contents.filamentCount) {
        throw new Error(`Filament slot ${filamentSlot} out of range. ` +
            `This 3MF has ${contents.filamentCount} slots (0-${contents.filamentCount - 1}).`);
    }
    const applied = mergeIntoProjectSettings(contents.projectSettings, presetSettings, filamentSlot, contents.filamentCount);
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
export async function updateSettings(path, settings, filamentSlot, outputPath) {
    const absPath = resolve(path);
    guardGcodeKeys(settings);
    const contents = await read3MF(absPath);
    if (filamentSlot < 0 || filamentSlot >= contents.filamentCount) {
        throw new Error(`Filament slot ${filamentSlot} out of range. ` +
            `This 3MF has ${contents.filamentCount} slots (0-${contents.filamentCount - 1}).`);
    }
    const settingsForMerge = {};
    for (const [key, value] of Object.entries(settings)) {
        settingsForMerge[key] = value;
    }
    const applied = mergeIntoProjectSettings(contents.projectSettings, settingsForMerge, filamentSlot, contents.filamentCount);
    const filamentMerge = {};
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
async function findPreset(name) {
    const dirs = [
        join(DEFAULT_PRESETS_DIR, 'filaments'),
        join(DEFAULT_PRESETS_DIR, 'process'),
    ];
    for (const dir of dirs) {
        if (!existsSync(dir))
            continue;
        const files = await readdir(dir);
        for (const file of files) {
            if (!file.endsWith('.json'))
                continue;
            if (basename(file, '.json') === name)
                return join(dir, file);
            try {
                const filePath = join(dir, file);
                const raw = await readFile(filePath, 'utf-8');
                const preset = JSON.parse(raw);
                if (preset.name === name)
                    return filePath;
            }
            catch { /* skip */ }
        }
    }
    throw new Error(`Preset not found: "${name}". ` +
        `Searched in ${DEFAULT_PRESETS_DIR}/filaments/ and ${DEFAULT_PRESETS_DIR}/process/`);
}
//# sourceMappingURL=tools.js.map