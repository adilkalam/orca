/**
 * Transcript Flush Polling
 *
 * Waits for Claude Code to finish writing the transcript JSONL file.
 * Polls for file existence, growth, and completeness.
 * Max wait: 3 seconds, polling interval: 100ms.
 */

import { existsSync, statSync, readFileSync } from "fs";

interface FlushResult {
  success: boolean;
  path: string | null;
  size: number;
}

/**
 * Wait for a transcript file to be flushed and complete.
 *
 * @param transcriptPath - Path to the JSONL transcript file
 * @param maxWaitMs - Maximum time to wait (default 3000ms)
 * @param intervalMs - Polling interval (default 100ms)
 * @returns FlushResult with success status and file info
 */
export async function waitForTranscriptFlush(
  transcriptPath: string,
  maxWaitMs: number = 3000,
  intervalMs: number = 100
): Promise<FlushResult> {
  const startTime = Date.now();
  let lastSize = -1;
  let stableCount = 0;
  const stableThreshold = 3; // File must be stable for 3 consecutive checks

  while (Date.now() - startTime < maxWaitMs) {
    if (!existsSync(transcriptPath)) {
      await sleep(intervalMs);
      continue;
    }

    try {
      const stat = statSync(transcriptPath);
      const currentSize = stat.size;

      if (currentSize === lastSize && currentSize > 0) {
        stableCount++;
        if (stableCount >= stableThreshold) {
          // File has been stable -- check if last line is valid JSON
          if (isLastLineComplete(transcriptPath)) {
            return { success: true, path: transcriptPath, size: currentSize };
          }
        }
      } else {
        stableCount = 0;
        lastSize = currentSize;
      }
    } catch {
      // File might be in the process of being written
    }

    await sleep(intervalMs);
  }

  // Timeout -- return whatever we have
  if (existsSync(transcriptPath)) {
    try {
      const stat = statSync(transcriptPath);
      return { success: stat.size > 0, path: transcriptPath, size: stat.size };
    } catch {
      return { success: false, path: transcriptPath, size: 0 };
    }
  }

  return { success: false, path: null, size: 0 };
}

/**
 * Check if the last line of the file is complete JSON (sentinel detection).
 */
function isLastLineComplete(filePath: string): boolean {
  try {
    const content = readFileSync(filePath, "utf-8");
    const lines = content.trimEnd().split("\n");
    if (lines.length === 0) return false;

    const lastLine = lines[lines.length - 1].trim();
    if (!lastLine) return false;

    JSON.parse(lastLine);
    return true;
  } catch {
    return false;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
