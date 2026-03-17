/**
 * bambu-3mf MCP - Orca_print.config XML Parser
 *
 * Parses the Metadata/Orca_print.config file inside 3MF archives.
 * Uses regex for the flat XML structure -- no new dependencies needed.
 * Complements read_settings which handles JSON config files.
 */
import type { OrcaConfig } from './types.js';
/**
 * Read and parse the Orca_print.config XML from a 3MF file.
 *
 * @param path  Absolute path to the .3mf file
 * @param keys  Optional list of specific keys to return (returns all if omitted)
 */
export declare function readOrcaConfig(path: string, keys?: string[]): Promise<OrcaConfig>;
//# sourceMappingURL=orca-config.d.ts.map