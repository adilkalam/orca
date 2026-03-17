#!/usr/bin/env node
/**
 * MCP Tool Caller - Invokes MCP tools and returns JSON results
 *
 * Usage:
 *   node scripts/mcp-call.mjs <server> <tool> [args-json]
 *
 * Examples:
 *   node scripts/mcp-call.mjs project-context query_context '{"domain":"os-dev","task":"test"}'
 *   node scripts/mcp-call.mjs cognition-mcp cognition '{"operation":"thought","content":{"thought":"test"}}'
 */

import { spawn } from 'child_process';
import { createInterface } from 'readline';
import { randomUUID } from 'crypto';

const [,, serverName, toolName, argsJson] = process.argv;

if (!serverName || !toolName) {
  console.error('Usage: mcp-call.mjs <server> <tool> [args-json]');
  process.exit(1);
}

// Server configurations
const servers = {
  'project-context': {
    command: 'node',
    args: [process.env.HOME + '/.claude/mcp/project-context-server/dist/index.js'],
    cwd: process.cwd()
  },
  'cognition-mcp': {
    command: 'node',
    args: [process.env.HOME + '/.claude/mcp/cognition-mcp/dist/index.js'],
    cwd: process.cwd()
  }
};

const serverConfig = servers[serverName];
if (!serverConfig) {
  console.error(`Unknown server: ${serverName}. Available: ${Object.keys(servers).join(', ')}`);
  process.exit(1);
}

// Parse tool arguments
let toolArgs = {};
if (argsJson) {
  try {
    toolArgs = JSON.parse(argsJson);
  } catch (e) {
    console.error(`Invalid JSON args: ${e.message}`);
    process.exit(1);
  }
}

// Start MCP server
const server = spawn(serverConfig.command, serverConfig.args, {
  cwd: serverConfig.cwd,
  stdio: ['pipe', 'pipe', 'pipe'],
  env: { ...process.env }
});

let responseBuffer = '';
let initialized = false;
let requestId = 1;

const rl = createInterface({ input: server.stdout });

rl.on('line', (line) => {
  try {
    const msg = JSON.parse(line);

    if (msg.id === 1 && !initialized) {
      // Initialize response received, now send tool call
      initialized = true;
      const callRequest = {
        jsonrpc: '2.0',
        id: ++requestId,
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: toolArgs
        }
      };
      server.stdin.write(JSON.stringify(callRequest) + '\n');
    } else if (msg.id === requestId) {
      // Tool response received
      if (msg.error) {
        console.error(JSON.stringify({ error: msg.error }));
        process.exit(1);
      } else {
        // Extract content from MCP response
        const content = msg.result?.content?.[0]?.text || msg.result;
        try {
          // Try to parse as JSON for cleaner output
          const parsed = typeof content === 'string' ? JSON.parse(content) : content;
          console.log(JSON.stringify(parsed, null, 2));
        } catch {
          console.log(typeof content === 'string' ? content : JSON.stringify(content));
        }
        server.kill();
        process.exit(0);
      }
    }
  } catch (e) {
    // Ignore non-JSON lines (stderr, logs)
  }
});

server.stderr.on('data', (data) => {
  // Suppress stderr unless debugging
  if (process.env.MCP_DEBUG) {
    console.error('[MCP stderr]', data.toString());
  }
});

server.on('error', (err) => {
  console.error(JSON.stringify({ error: err.message }));
  process.exit(1);
});

server.on('close', (code) => {
  if (code !== 0 && code !== null) {
    process.exit(code);
  }
});

// Send initialize request
const initRequest = {
  jsonrpc: '2.0',
  id: requestId,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'mcp-call', version: '1.0.0' }
  }
};

server.stdin.write(JSON.stringify(initRequest) + '\n');

// Timeout after 30 seconds
setTimeout(() => {
  console.error(JSON.stringify({ error: 'Timeout waiting for MCP response' }));
  server.kill();
  process.exit(1);
}, 30000);
