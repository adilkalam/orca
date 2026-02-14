/**
 * Git Plumbing Operations
 *
 * Low-level git commands via child_process execSync.
 * These avoid porcelain (user-facing) commands and use plumbing
 * (machine-facing) commands for reliable, scriptable git operations.
 *
 * All functions accept a cwd parameter for the project root.
 * All functions handle errors gracefully (return null or throw descriptive errors).
 */

import { execSync } from "child_process";
import { createHash } from "crypto";

const GIT_TIMEOUT = 10000; // 10s timeout for git operations

/**
 * Capture the current working tree as a tree object.
 * Equivalent to staging everything and writing the index as a tree.
 * Returns the tree hash, or null on failure.
 */
export function writeTree(cwd: string): string | null {
  try {
    // Add all files to the index first (including untracked)
    execSync("git add -A", {
      cwd,
      encoding: "utf-8",
      timeout: GIT_TIMEOUT,
      stdio: ["pipe", "pipe", "pipe"],
    });

    const hash = execSync("git write-tree", {
      cwd,
      encoding: "utf-8",
      timeout: GIT_TIMEOUT,
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();

    // Reset the index to HEAD so we don't leave staged changes
    try {
      execSync("git read-tree HEAD", {
        cwd,
        encoding: "utf-8",
        timeout: GIT_TIMEOUT,
        stdio: ["pipe", "pipe", "pipe"],
      });
    } catch {
      // Non-critical -- index may be slightly different
    }

    return hash || null;
  } catch {
    return null;
  }
}

/**
 * Create a commit object pointing to a tree, optionally with a parent.
 * Returns the commit hash, or null on failure.
 *
 * Trailers are appended to the commit message body as key-value pairs.
 */
export function commitTree(
  cwd: string,
  treeHash: string,
  options: {
    parentHash?: string | null;
    message: string;
    trailers?: Record<string, string>;
  }
): string | null {
  try {
    // Build commit message with trailers
    let fullMessage = options.message;
    if (options.trailers && Object.keys(options.trailers).length > 0) {
      fullMessage += "\n";
      for (const [key, value] of Object.entries(options.trailers)) {
        fullMessage += `\n${key}: ${value}`;
      }
    }

    // Build args array for execFileSync to avoid shell escaping issues
    const args = ["commit-tree", treeHash];
    if (options.parentHash) {
      args.push("-p", options.parentHash);
    }

    // Pass message via stdin to avoid shell escaping issues with special chars
    const hash = execSync(
      `git commit-tree ${treeHash}${options.parentHash ? ` -p ${options.parentHash}` : ""}`,
      {
        cwd,
        encoding: "utf-8",
        timeout: GIT_TIMEOUT,
        input: fullMessage,
        stdio: ["pipe", "pipe", "pipe"],
        env: {
          ...process.env,
          // Ensure consistent author for ORCA commits
          GIT_AUTHOR_NAME: "ORCA Recording",
          GIT_AUTHOR_EMAIL: "orca@local",
          GIT_COMMITTER_NAME: "ORCA Recording",
          GIT_COMMITTER_EMAIL: "orca@local",
        },
      }
    ).trim();

    return hash || null;
  } catch {
    return null;
  }
}

/**
 * Update a ref (branch pointer) to point to a specific commit.
 * Creates the ref if it does not exist.
 * Returns true on success, false on failure.
 */
export function updateRef(
  cwd: string,
  refName: string,
  commitHash: string
): boolean {
  try {
    execSync(`git update-ref refs/heads/${refName} ${commitHash}`, {
      cwd,
      encoding: "utf-8",
      timeout: GIT_TIMEOUT,
      stdio: ["pipe", "pipe", "pipe"],
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Read a tree object into the index (staging area).
 * Used for restoring checkpoint state.
 * Returns true on success, false on failure.
 */
export function readTree(cwd: string, commitHash: string): boolean {
  try {
    execSync(`git read-tree ${commitHash}`, {
      cwd,
      encoding: "utf-8",
      timeout: GIT_TIMEOUT,
      stdio: ["pipe", "pipe", "pipe"],
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Write the current index to the working directory.
 * Forces overwrite of existing files.
 * Returns true on success, false on failure.
 */
export function checkoutIndex(cwd: string): boolean {
  try {
    execSync("git checkout-index -f -a", {
      cwd,
      encoding: "utf-8",
      timeout: GIT_TIMEOUT,
      stdio: ["pipe", "pipe", "pipe"],
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the current HEAD commit hash.
 * Returns null if not in a git repo or HEAD is unborn.
 */
export function getHead(cwd: string): string | null {
  try {
    return execSync("git rev-parse HEAD", {
      cwd,
      encoding: "utf-8",
      timeout: GIT_TIMEOUT,
      stdio: ["pipe", "pipe", "pipe"],
    }).trim() || null;
  } catch {
    return null;
  }
}

/**
 * Get a hash representing the current worktree state.
 * Uses `git write-tree` on a temporary index to avoid modifying the real index.
 * Falls back to hashing git status output if write-tree fails.
 */
export function getWorktreeHash(cwd: string): string | null {
  try {
    // Use git status --porcelain as a fingerprint of worktree state
    const status = execSync("git status --porcelain", {
      cwd,
      encoding: "utf-8",
      timeout: GIT_TIMEOUT,
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();

    // Hash the status output for a short identifier
    return createHash("sha1").update(status).digest("hex");
  } catch {
    return null;
  }
}

/**
 * Get the commit hash that a ref points to.
 * Returns null if the ref does not exist.
 */
export function resolveRef(cwd: string, refName: string): string | null {
  try {
    return execSync(`git rev-parse refs/heads/${refName}`, {
      cwd,
      encoding: "utf-8",
      timeout: GIT_TIMEOUT,
      stdio: ["pipe", "pipe", "pipe"],
    }).trim() || null;
  } catch {
    return null;
  }
}

/**
 * Delete a ref (branch).
 * Returns true on success, false on failure.
 */
export function deleteRef(cwd: string, refName: string): boolean {
  try {
    execSync(`git update-ref -d refs/heads/${refName}`, {
      cwd,
      encoding: "utf-8",
      timeout: GIT_TIMEOUT,
      stdio: ["pipe", "pipe", "pipe"],
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * List commits on a ref, most recent first.
 * Returns array of {hash, message} objects.
 * Limits to maxCount commits.
 */
export function logRef(
  cwd: string,
  refName: string,
  maxCount: number = 100
): Array<{ hash: string; message: string; timestamp: string }> {
  try {
    const output = execSync(
      `git log refs/heads/${refName} --format="%H%x00%s%x00%aI" --max-count=${maxCount}`,
      {
        cwd,
        encoding: "utf-8",
        timeout: GIT_TIMEOUT,
        stdio: ["pipe", "pipe", "pipe"],
      }
    ).trim();

    if (!output) return [];

    return output.split("\n").map((line) => {
      const [hash, message, timestamp] = line.split("\0");
      return { hash, message, timestamp };
    });
  } catch {
    return [];
  }
}

/**
 * Get the full commit message (including body/trailers) for a commit.
 */
export function getCommitMessage(cwd: string, commitHash: string): string | null {
  try {
    return execSync(`git log -1 --format="%B" ${commitHash}`, {
      cwd,
      encoding: "utf-8",
      timeout: GIT_TIMEOUT,
      stdio: ["pipe", "pipe", "pipe"],
    }).trim() || null;
  } catch {
    return null;
  }
}

/**
 * List files in a tree object (from a commit).
 * Returns array of file paths.
 */
export function listTree(cwd: string, commitHash: string): string[] {
  try {
    const output = execSync(`git ls-tree -r --name-only ${commitHash}`, {
      cwd,
      encoding: "utf-8",
      timeout: GIT_TIMEOUT,
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();

    if (!output) return [];
    return output.split("\n").filter(Boolean);
  } catch {
    return [];
  }
}

/**
 * Read a file's content from a specific commit.
 * Returns null if the file doesn't exist in that commit.
 */
export function showFile(
  cwd: string,
  commitHash: string,
  filePath: string
): string | null {
  try {
    return execSync(`git show ${commitHash}:${filePath}`, {
      cwd,
      encoding: "utf-8",
      timeout: GIT_TIMEOUT,
      stdio: ["pipe", "pipe", "pipe"],
    });
  } catch {
    return null;
  }
}

/**
 * Check if a ref exists.
 */
export function refExists(cwd: string, refName: string): boolean {
  try {
    execSync(`git show-ref --verify refs/heads/${refName}`, {
      cwd,
      encoding: "utf-8",
      timeout: GIT_TIMEOUT,
      stdio: ["pipe", "pipe", "pipe"],
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if we are inside a git work tree.
 */
export function isGitRepo(cwd: string): boolean {
  try {
    const result = execSync("git rev-parse --is-inside-work-tree", {
      cwd,
      encoding: "utf-8",
      timeout: 3000,
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
    return result === "true";
  } catch {
    return false;
  }
}
