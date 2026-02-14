/**
 * Lockfile for Concurrent Git Operations
 *
 * Prevents corruption when 5-8 parallel subagents create checkpoints
 * simultaneously. Uses .git/orca-record.lock as a simple file-based lock.
 *
 * Lock protocol:
 *   1. Try to create lockfile (exclusive)
 *   2. If exists, poll every 100ms up to timeout (default 5s)
 *   3. On acquire: execute operation, then release
 *   4. Release always happens, even on error
 */

import { existsSync, writeFileSync, unlinkSync, readFileSync } from "fs";
import { join } from "path";

const DEFAULT_TIMEOUT_MS = 5000;
const POLL_INTERVAL_MS = 100;
const STALE_LOCK_THRESHOLD_MS = 30000; // 30s -- locks older than this are stale

/**
 * Acquire a lockfile. Blocks until acquired or timeout.
 * Returns true if lock was acquired, false if timed out.
 */
export function acquireLock(gitDir: string, timeoutMs?: number): boolean {
  const lockPath = getLockPath(gitDir);
  const timeout = timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const deadline = Date.now() + timeout;

  while (Date.now() < deadline) {
    // Check for stale lock
    if (existsSync(lockPath)) {
      if (isLockStale(lockPath)) {
        // Stale lock -- remove and try again
        try { unlinkSync(lockPath); } catch { /* race condition OK */ }
      }
    }

    // Try to create lockfile exclusively
    if (tryCreateLock(lockPath)) {
      return true;
    }

    // Wait and retry
    sleepSync(POLL_INTERVAL_MS);
  }

  return false;
}

/**
 * Release the lockfile.
 */
export function releaseLock(gitDir: string): void {
  const lockPath = getLockPath(gitDir);
  try {
    if (existsSync(lockPath)) {
      unlinkSync(lockPath);
    }
  } catch {
    // Best effort -- file may have been removed by another process
  }
}

/**
 * Execute a function while holding the lock.
 * Guarantees lock release even if the function throws.
 *
 * This is the primary API for callers:
 *   await withLock(gitDir, async () => { ... git operations ... });
 */
export async function withLock<T>(
  gitDir: string,
  fn: () => T | Promise<T>,
  timeoutMs?: number
): Promise<T> {
  const acquired = acquireLock(gitDir, timeoutMs);
  if (!acquired) {
    throw new Error(
      `Failed to acquire orca-record lock after ${timeoutMs ?? DEFAULT_TIMEOUT_MS}ms`
    );
  }

  try {
    return await fn();
  } finally {
    releaseLock(gitDir);
  }
}

// ============================================================================
// INTERNAL
// ============================================================================

function getLockPath(gitDir: string): string {
  return join(gitDir, "orca-record.lock");
}

/**
 * Try to create the lockfile atomically.
 * Uses writeFileSync with wx flag (exclusive create -- fails if exists).
 */
function tryCreateLock(lockPath: string): boolean {
  try {
    const lockData = JSON.stringify({
      pid: process.pid,
      timestamp: Date.now(),
    });
    writeFileSync(lockPath, lockData, { flag: "wx" });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a lockfile is stale (older than threshold).
 */
function isLockStale(lockPath: string): boolean {
  try {
    const raw = readFileSync(lockPath, "utf-8");
    const data = JSON.parse(raw);
    if (typeof data.timestamp === "number") {
      return Date.now() - data.timestamp > STALE_LOCK_THRESHOLD_MS;
    }
  } catch {
    // Can't read/parse -- assume not stale
  }
  return false;
}

/**
 * Synchronous sleep using Atomics.wait (Bun-compatible).
 * Falls back to busy-wait if SharedArrayBuffer is unavailable.
 */
function sleepSync(ms: number): void {
  try {
    const sab = new SharedArrayBuffer(4);
    const view = new Int32Array(sab);
    Atomics.wait(view, 0, 0, ms);
  } catch {
    // Fallback: busy-wait (less efficient but always works)
    const end = Date.now() + ms;
    while (Date.now() < end) {
      // spin
    }
  }
}
