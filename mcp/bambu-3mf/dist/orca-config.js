/**
 * bambu-3mf MCP - Orca_print.config XML Parser
 *
 * Parses the Metadata/Orca_print.config file inside 3MF archives.
 * Uses regex for the flat XML structure -- no new dependencies needed.
 * Complements read_settings which handles JSON config files.
 */
import JSZip from 'jszip';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { resolve } from 'path';
/** Known keys we extract from Orca_print.config. */
const KNOWN_KEYS = {
    filament_type: 'filament_type',
    nozzle_diameter: 'nozzle_diameter',
    layer_height: 'layer_height',
    sparse_infill_density: 'infill_density',
    wall_loops: 'wall_loops',
    support_enable: 'support_enabled',
};
/**
 * Read and parse the Orca_print.config XML from a 3MF file.
 *
 * @param path  Absolute path to the .3mf file
 * @param keys  Optional list of specific keys to return (returns all if omitted)
 */
export async function readOrcaConfig(path, keys) {
    const absPath = resolve(path);
    if (!existsSync(absPath)) {
        throw new Error(`3MF file not found: ${absPath}`);
    }
    const data = await readFile(absPath);
    const zip = await JSZip.loadAsync(data);
    const result = {
        filament_type: null,
        nozzle_diameter: null,
        layer_height: null,
        infill_density: null,
        wall_loops: null,
        support_enabled: null,
        previously_sliced: false,
        last_estimate: null,
        raw: {},
    };
    // Check for slice_info.config to detect previous slicing
    const sliceInfoFile = zip.file('Metadata/slice_info.config');
    if (sliceInfoFile) {
        result.previously_sliced = true;
        try {
            const sliceInfoText = await sliceInfoFile.async('string');
            result.last_estimate = extractTimeEstimate(sliceInfoText);
        }
        catch {
            // Non-fatal: just mark as previously sliced without estimate
        }
    }
    // Parse Orca_print.config
    const orcaConfigFile = zip.file('Metadata/Orca_print.config');
    if (!orcaConfigFile) {
        return filterKeys(result, keys);
    }
    const xmlText = await orcaConfigFile.async('string');
    // Parse flat XML with regex: <option key="x">value</option>
    const optionRegex = /<option\s+key="([^"]+)">(.*?)<\/option>/g;
    let match;
    while ((match = optionRegex.exec(xmlText)) !== null) {
        const xmlKey = match[1];
        const xmlValue = match[2];
        // Always store in raw
        result.raw[xmlKey] = xmlValue;
        // Map to known fields
        const mappedField = KNOWN_KEYS[xmlKey];
        if (mappedField) {
            switch (mappedField) {
                case 'filament_type':
                    result.filament_type = xmlValue || null;
                    break;
                case 'nozzle_diameter':
                    result.nozzle_diameter = xmlValue ? `${xmlValue}mm` : null;
                    break;
                case 'layer_height':
                    result.layer_height = xmlValue ? `${xmlValue}mm` : null;
                    break;
                case 'infill_density': {
                    if (xmlValue) {
                        const density = parseFloat(xmlValue);
                        if (!isNaN(density)) {
                            result.infill_density =
                                density === Math.floor(density) ? `${Math.floor(density)}%` : `${density.toFixed(1)}%`;
                        }
                    }
                    break;
                }
                case 'wall_loops': {
                    if (xmlValue) {
                        const loops = parseInt(xmlValue, 10);
                        if (!isNaN(loops))
                            result.wall_loops = loops;
                    }
                    break;
                }
                case 'support_enabled':
                    result.support_enabled = xmlValue
                        ? ['true', '1', 'yes'].includes(xmlValue.toLowerCase())
                        : null;
                    break;
            }
        }
    }
    return filterKeys(result, keys);
}
/** Filter result to only requested keys. */
function filterKeys(config, keys) {
    if (!keys || keys.length === 0)
        return config;
    const filtered = {
        filament_type: null,
        nozzle_diameter: null,
        layer_height: null,
        infill_density: null,
        wall_loops: null,
        support_enabled: null,
        previously_sliced: false,
        last_estimate: null,
        raw: {},
    };
    for (const key of keys) {
        if (key in config && key !== 'raw') {
            filtered[key] = config[key];
        }
        // Also filter raw keys
        if (key in config.raw) {
            filtered.raw[key] = config.raw[key];
        }
    }
    return filtered;
}
/** Extract a time estimate from slice_info.config text. */
function extractTimeEstimate(text) {
    const patterns = [
        /(\d+)\s*h(?:ours?)?\s*(\d+)\s*m(?:in(?:utes?)?)?/i,
        /(\d+)\s*m(?:in(?:utes?)?)?/i,
        /(\d+)\s*h(?:ours?)?/i,
    ];
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            if (match.length >= 3 && match[2]) {
                return `${match[1]}h ${match[2]}m`;
            }
            const val = match[1];
            if (/h/i.test(match[0]))
                return `${val}h`;
            return `${val}m`;
        }
    }
    return null;
}
//# sourceMappingURL=orca-config.js.map