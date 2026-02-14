/**
 * Dual-Layer Redaction Engine
 *
 * Layer 1: Shannon entropy check on alphanumeric sequences
 * Layer 2: Regex pattern matching for known secret formats
 *
 * JSONL-aware: parses JSON, walks tree, skips known-safe fields,
 * redacts string values. Redaction happens BEFORE any data hits
 * SQLite or git storage.
 */

import { isHighEntropy } from "./entropy.js";
import { SECRET_PATTERNS } from "./patterns.js";
import type { RedactionResult } from "../types.js";

// Fields that should never be redacted (structural, not sensitive)
const SAFE_FIELDS = new Set([
  "id",
  "type",
  "event_type",
  "hook_type",
  "timestamp",
  "created_at",
  "started_at",
  "ended_at",
  "session_id",
  "tool_name",
  "tool_use_id",
  "state",
  "status",
  "version",
  "name",
  "role",
  "model",
  "stop_reason",
  "stop_sequence",
]);

/**
 * Redact secrets from a plain string using both layers.
 */
export function redactString(input: string): RedactionResult {
  let result = input;
  let count = 0;
  const typesFound = new Set<string>();

  // Layer 2: Pattern matching (run first -- more specific)
  for (const pattern of SECRET_PATTERNS) {
    // Reset regex state since they use /g flag
    pattern.pattern.lastIndex = 0;
    const matches = result.match(pattern.pattern);
    if (matches) {
      for (const match of matches) {
        result = result.replace(match, `[REDACTED:${pattern.type}]`);
        count++;
        typesFound.add(pattern.type);
      }
    }
  }

  // Layer 1: Entropy check on remaining alphanumeric sequences
  const alnumRuns = result.match(/[a-zA-Z0-9+/=_-]{10,}/g);
  if (alnumRuns) {
    for (const run of alnumRuns) {
      // Skip if already redacted
      if (run.includes("REDACTED")) continue;

      const check = isHighEntropy(run);
      if (check.isSecret) {
        result = result.replace(run, "[REDACTED:high_entropy]");
        count++;
        typesFound.add("high_entropy");
      }
    }
  }

  return {
    redacted: result,
    count,
    types: Array.from(typesFound),
  };
}

/**
 * Walk a JSON object tree and redact string values.
 * Skips known-safe fields (id, timestamp, type, etc.).
 */
function walkAndRedact(
  obj: unknown,
  parentKey: string | null,
  stats: { count: number; types: Set<string> }
): unknown {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === "string") {
    // Skip safe fields
    if (parentKey && SAFE_FIELDS.has(parentKey)) return obj;

    // Skip short strings (unlikely to be secrets)
    if (obj.length < 8) return obj;

    const result = redactString(obj);
    stats.count += result.count;
    for (const t of result.types) stats.types.add(t);
    return result.redacted;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => walkAndRedact(item, parentKey, stats));
  }

  if (typeof obj === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      result[key] = walkAndRedact(value, key, stats);
    }
    return result;
  }

  // Numbers, booleans -- pass through
  return obj;
}

/**
 * Redact secrets from a JSON string (single JSON object or JSONL).
 * Returns the redacted string and a report.
 */
export function redactJson(input: string): RedactionResult {
  const stats = { count: 0, types: new Set<string>() };

  try {
    // Try parsing as single JSON object
    const parsed = JSON.parse(input);
    const redacted = walkAndRedact(parsed, null, stats);
    return {
      redacted: JSON.stringify(redacted),
      count: stats.count,
      types: Array.from(stats.types),
    };
  } catch {
    // Try parsing as JSONL (one JSON object per line)
    const lines = input.split("\n");
    const redactedLines: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        redactedLines.push(line);
        continue;
      }

      try {
        const parsed = JSON.parse(trimmed);
        const redacted = walkAndRedact(parsed, null, stats);
        redactedLines.push(JSON.stringify(redacted));
      } catch {
        // Not valid JSON -- redact as plain string
        const result = redactString(trimmed);
        stats.count += result.count;
        for (const t of result.types) stats.types.add(t);
        redactedLines.push(result.redacted);
      }
    }

    return {
      redacted: redactedLines.join("\n"),
      count: stats.count,
      types: Array.from(stats.types),
    };
  }
}

/**
 * Redact a hook input object. Returns a new object with secrets removed.
 */
export function redactHookInput(input: Record<string, unknown>): {
  redacted: Record<string, unknown>;
  report: RedactionResult;
} {
  const stats = { count: 0, types: new Set<string>() };
  const redacted = walkAndRedact(input, null, stats) as Record<string, unknown>;
  return {
    redacted,
    report: {
      redacted: JSON.stringify(redacted),
      count: stats.count,
      types: Array.from(stats.types),
    },
  };
}
