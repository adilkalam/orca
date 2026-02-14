/**
 * Claude Code JSONL Transcript Parser
 *
 * Reads JSONL transcript files and extracts structured entries:
 * user prompts, assistant messages, tool uses, file modifications.
 * Tracks transcript position offsets for incremental parsing.
 */

import { readFileSync } from "fs";
import type { TranscriptEntry } from "../types.js";

/**
 * Parse a Claude Code JSONL transcript file.
 * Returns structured TranscriptEntry[] array.
 *
 * @param filePath - Path to the JSONL transcript file
 * @param startOffset - Byte offset to start reading from (for incremental parsing)
 */
export function parseTranscript(
  filePath: string,
  startOffset: number = 0
): TranscriptEntry[] {
  const entries: TranscriptEntry[] = [];

  let content: string;
  try {
    const buffer = readFileSync(filePath);
    content = buffer.slice(startOffset).toString("utf-8");
  } catch {
    return entries;
  }

  const lines = content.split("\n");
  let currentOffset = startOffset;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      currentOffset += Buffer.byteLength(line + "\n", "utf-8");
      continue;
    }

    try {
      const parsed = JSON.parse(trimmed);
      const entry = classifyEntry(parsed, currentOffset);
      if (entry) {
        entries.push(entry);
      }
    } catch {
      // Skip malformed lines
    }

    currentOffset += Buffer.byteLength(line + "\n", "utf-8");
  }

  return entries;
}

/**
 * Classify a parsed JSON object into a TranscriptEntry.
 */
function classifyEntry(
  obj: Record<string, unknown>,
  offset: number
): TranscriptEntry | null {
  const type = obj.type as string | undefined;
  const role = obj.role as string | undefined;

  // User message
  if (role === "human" || role === "user") {
    const content = extractContent(obj);
    return {
      type: "user",
      timestamp: obj.timestamp as string | undefined,
      content,
      offset,
    };
  }

  // Assistant message
  if (role === "assistant") {
    const content = extractContent(obj);
    return {
      type: "assistant",
      timestamp: obj.timestamp as string | undefined,
      content,
      offset,
    };
  }

  // Tool use
  if (type === "tool_use" || obj.tool_name) {
    return {
      type: "tool_use",
      timestamp: obj.timestamp as string | undefined,
      content: JSON.stringify(obj.input ?? obj.tool_input ?? {}),
      tool_name: (obj.tool_name ?? obj.name) as string | undefined,
      tool_use_id: obj.tool_use_id as string | undefined,
      file_path: extractFilePath(obj),
      offset,
    };
  }

  // Tool result
  if (type === "tool_result") {
    return {
      type: "tool_result",
      timestamp: obj.timestamp as string | undefined,
      content: extractContent(obj),
      tool_use_id: obj.tool_use_id as string | undefined,
      offset,
    };
  }

  // System message
  if (role === "system" || type === "system") {
    return {
      type: "system",
      timestamp: obj.timestamp as string | undefined,
      content: extractContent(obj),
      offset,
    };
  }

  return null;
}

/**
 * Extract text content from various message formats.
 */
function extractContent(obj: Record<string, unknown>): string {
  // Direct text content
  if (typeof obj.content === "string") return obj.content;

  // Array of content blocks
  if (Array.isArray(obj.content)) {
    const texts: string[] = [];
    for (const block of obj.content) {
      if (typeof block === "string") {
        texts.push(block);
      } else if (typeof block === "object" && block !== null) {
        const b = block as Record<string, unknown>;
        if (typeof b.text === "string") texts.push(b.text);
        if (typeof b.content === "string") texts.push(b.content);
      }
    }
    return texts.join("\n");
  }

  // Message field
  if (typeof obj.message === "string") return obj.message;

  // Text field
  if (typeof obj.text === "string") return obj.text;

  return JSON.stringify(obj);
}

/**
 * Extract file path from a tool use entry, if present.
 */
function extractFilePath(obj: Record<string, unknown>): string | undefined {
  const input = (obj.input ?? obj.tool_input) as Record<string, unknown> | undefined;
  if (!input) return undefined;

  return (input.file_path ?? input.path ?? input.filename) as string | undefined;
}
