/**
 * bambu-3mf MCP Server
 *
 * 8 tools for Bambu Studio 3MF print settings manipulation
 * and OrcaSlicer CLI analysis.
 * Transport: stdio
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
} from '@modelcontextprotocol/sdk/types.js';

import {
  listPresets,
  readSettings,
  applyPreset,
  updateSettings,
  sliceAnalyze,
  sliceCompare,
  sliceBatch,
  readOrcaConfigTool,
} from './tools.js';

const VERSION = '2.0.0';

class Bambu3MFServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      { name: 'bambu-3mf', version: VERSION },
      { capabilities: { tools: {} } }
    );
    this.setupHandlers();
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: this.getTools(),
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      try {
        const result = await this.dispatch(name, args || {});
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: 'text' as const, text: JSON.stringify({ error: message }) }],
          isError: true,
        };
      }
    });
  }

  private getTools(): Tool[] {
    return [
      // --- Original 4 tools ---
      {
        name: 'list_presets',
        description:
          'Scan ~/3D-Models/_presets/ and return available filament and process presets.',
        inputSchema: {
          type: 'object' as const,
          properties: {
            type: {
              type: 'string',
              enum: ['filament', 'process', 'all'],
              description: 'Filter by preset type. Default: "all"',
            },
          },
        },
      },
      {
        name: 'read_settings',
        description:
          'Extract print settings from a 3MF file or a JSON preset file. ' +
          'For JSON presets, returns settings as project_settings with filament_count 0. ' +
          'Gcode blocks are always excluded.',
        inputSchema: {
          type: 'object' as const,
          properties: {
            path: { type: 'string', description: 'Absolute path to a .3mf or .json preset file' },
            filament_slot: { type: 'number', description: '0-indexed filament slot. Default: all slots.' },
            keys: { type: 'array', items: { type: 'string' }, description: 'Specific keys to return.' },
          },
          required: ['path'],
        },
      },
      {
        name: 'apply_preset',
        description:
          'Merge a preset JSON into a 3MF file at a specific filament slot. ' +
          'Creates backup. Modifies BOTH project_settings AND filament_settings. ' +
          'NEVER touches gcode blocks.',
        inputSchema: {
          type: 'object' as const,
          properties: {
            path: { type: 'string', description: 'Absolute path to the .3mf file' },
            preset: { type: 'string', description: 'Preset name or absolute path to JSON' },
            filament_slot: { type: 'number', description: '0-indexed filament slot' },
            output_path: { type: 'string', description: 'Output path. Default: overwrite with backup.' },
          },
          required: ['path', 'preset', 'filament_slot'],
        },
      },
      {
        name: 'update_settings',
        description:
          'Surgical key-value override on a 3MF file. Creates backup. ' +
          'NEVER touches gcode blocks.',
        inputSchema: {
          type: 'object' as const,
          properties: {
            path: { type: 'string', description: 'Absolute path to the .3mf file' },
            settings: {
              type: 'object',
              additionalProperties: { type: 'string' },
              description: 'Key-value pairs to update',
            },
            filament_slot: { type: 'number', description: '0-indexed filament slot' },
            output_path: { type: 'string', description: 'Output path. Default: overwrite with backup.' },
          },
          required: ['path', 'settings', 'filament_slot'],
        },
      },

      // --- New slicer tools ---
      {
        name: 'slice_analyze',
        description:
          'Run OrcaSlicer CLI on a 3MF file to get baseline print metrics: ' +
          'estimated time, filament weight/length, cost, and warnings. ' +
          'Returns helpful error with install instructions if OrcaSlicer is not installed.',
        inputSchema: {
          type: 'object' as const,
          properties: {
            path: { type: 'string', description: 'Absolute path to the .3mf file' },
          },
          required: ['path'],
        },
      },
      {
        name: 'slice_compare',
        description:
          'Compare current 3MF settings against preset profiles by running actual ' +
          'OrcaSlicer slices. Returns metrics for each profile with time/weight deltas ' +
          'and a recommendation. Returns helpful error if OrcaSlicer is not installed.',
        inputSchema: {
          type: 'object' as const,
          properties: {
            path: { type: 'string', description: 'Absolute path to the .3mf file' },
            presets: {
              type: 'array',
              items: { type: 'string' },
              description: 'Preset names to compare. Default: all available presets.',
            },
          },
          required: ['path'],
        },
      },
      {
        name: 'slice_batch',
        description:
          'Calculate batch production estimates for N units of a 3MF model. ' +
          'Returns total time, filament usage, cost, and comparison vs current settings. ' +
          'Returns helpful error if OrcaSlicer is not installed.',
        inputSchema: {
          type: 'object' as const,
          properties: {
            path: { type: 'string', description: 'Absolute path to the .3mf file' },
            quantity: { type: 'number', description: 'Number of units to produce' },
            preset: { type: 'string', description: 'Preset name. Default: current settings.' },
          },
          required: ['path', 'quantity'],
        },
      },
      {
        name: 'read_orca_config',
        description:
          'Parse the Orca_print.config XML from inside a 3MF file. Returns slicer-specific ' +
          'metadata: filament type, nozzle diameter, layer height, infill density, wall loops, ' +
          'support settings, and previous slice info. Does NOT require OrcaSlicer CLI.',
        inputSchema: {
          type: 'object' as const,
          properties: {
            path: { type: 'string', description: 'Absolute path to the .3mf file' },
            keys: {
              type: 'array',
              items: { type: 'string' },
              description: 'Specific keys to return. Default: all known keys.',
            },
          },
          required: ['path'],
        },
      },
    ];
  }

  private async dispatch(toolName: string, args: Record<string, unknown>): Promise<unknown> {
    switch (toolName) {
      // Original tools
      case 'list_presets':
        return listPresets(args.type as 'filament' | 'process' | 'all' | undefined);
      case 'read_settings':
        return readSettings(
          args.path as string,
          args.filament_slot as number | undefined,
          args.keys as string[] | undefined
        );
      case 'apply_preset':
        return applyPreset(
          args.path as string,
          args.preset as string,
          args.filament_slot as number,
          args.output_path as string | undefined
        );
      case 'update_settings':
        return updateSettings(
          args.path as string,
          args.settings as Record<string, string>,
          args.filament_slot as number,
          args.output_path as string | undefined
        );

      // New slicer tools
      case 'slice_analyze':
        return sliceAnalyze(args.path as string);
      case 'slice_compare':
        return sliceCompare(
          args.path as string,
          args.presets as string[] | undefined
        );
      case 'slice_batch':
        return sliceBatch(
          args.path as string,
          args.quantity as number,
          args.preset as string | undefined
        );
      case 'read_orca_config':
        return readOrcaConfigTool(
          args.path as string,
          args.keys as string[] | undefined
        );

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error(`bambu-3mf MCP v${VERSION} started (8 tools)`);
  }
}

const server = new Bambu3MFServer();
server.run().catch(console.error);
