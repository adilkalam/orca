/**
 * bambu-3mf MCP Server
 *
 * 4 tools for Bambu Studio 3MF print settings manipulation.
 * Transport: stdio
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type Tool,
} from '@modelcontextprotocol/sdk/types.js';

import { listPresets, readSettings, applyPreset, updateSettings } from './tools.js';

const VERSION = '1.0.0';

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
          'Extract print settings from a 3MF file. Gcode blocks are always excluded.',
        inputSchema: {
          type: 'object' as const,
          properties: {
            path: { type: 'string', description: 'Absolute path to the .3mf file' },
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
    ];
  }

  private async dispatch(toolName: string, args: Record<string, unknown>): Promise<unknown> {
    switch (toolName) {
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
      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error(`bambu-3mf MCP v${VERSION} started`);
  }
}

const server = new Bambu3MFServer();
server.run().catch(console.error);
