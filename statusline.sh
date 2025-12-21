#!/usr/bin/env node
"use strict";

const fs = require("fs");
const { execSync } = require("child_process");

// --- input ---
const input = readJSON(0); // stdin
const transcript = input.transcript_path;

// Session ID removed per user request

const model = input.model || {};
const name = `\x1b[95m${String(model.display_name ?? "")}\x1b[0m`.trim();
const CONTEXT_WINDOW = 200_000;

// Get current folder and git branch
function getCurrentFolder() {
  try {
    const cwd = process.cwd();
    return cwd.split("/").pop() || cwd;
  } catch {
    return "";
  }
}

function getGitBranch() {
  try {
    return execSync("git branch --show-current", { encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

function getGitStatus() {
  try {
    const status = execSync("git status --porcelain", { encoding: "utf8" });
    const lines = status.trim().split("\n").filter(Boolean);

    let modified = 0;
    let staged = 0;

    lines.forEach((line) => {
      const statusCode = line.substring(0, 2);
      if (statusCode[0] !== " " && statusCode[0] !== "?") staged++;
      else if (statusCode[1] !== " ") modified++;
    });

    return { modified, staged };
  } catch {
    return "";
  }
}

function getGitAheadBehind() {
  try {
    const result = execSync(
      "git rev-list --left-right --count HEAD...@{upstream}",
      {
        encoding: "utf8",
        stderr: "ignore",
      },
    ).trim();
    const [ahead, behind] = result.split("\t").map(Number);

    return { ahead: ahead || 0, behind: behind || 0 };
  } catch {
    return { ahead: 0, behind: 0 };
  }
}

function getCpuUsage() {
  try {
    if (process.platform === "darwin") {
      const topOutput = execSync("top -l 1 -n 0 | grep 'CPU usage'", {
        encoding: "utf8",
      });
      const match = topOutput.match(/(\d+\.\d+)% user/);
      if (match) {
        const cpuPercent = parseFloat(match[1]);
        const color =
          cpuPercent >= 80 ? "\x1b[31m" : cpuPercent >= 50 ? "\x1b[33m" : "\x1b[32m";
        return `${color}CPU:${cpuPercent.toFixed(1)}%\x1b[0m`;
      }
    }
    return "";
  } catch {
    return "";
  }
}

function getGpuUsage() {
  try {
    if (process.platform === "darwin") {
      // Use ioreg to get GPU utilization on macOS
      const gpuOutput = execSync(
        "ioreg -r -d 1 -w 0 -c IOAccelerator | grep PerformanceStatistics | cut -d = -f 2 | tr -d ' '",
        { encoding: "utf8", stderr: "ignore" }
      ).trim();

      if (gpuOutput) {
        try {
          const stats = JSON.parse(gpuOutput);
          const utilization = stats["Device Utilization %"] || stats["GPU Activity"] || 0;
          const gpuPercent = Math.round(utilization);
          const color =
            gpuPercent >= 80 ? "\x1b[31m" : gpuPercent >= 50 ? "\x1b[33m" : "\x1b[32m";
          return `${color}GPU:${gpuPercent}%\x1b[0m`;
        } catch {
          return "";
        }
      }
    }
    return "";
  } catch {
    return "";
  }
}

function getMemoryUsage() {
  try {
    if (process.platform === "darwin") {
      const vmStat = execSync("vm_stat", { encoding: "utf8" });
      const pageSize = parseInt(
        vmStat.match(/page size of (\d+) bytes/)?.[1] || "4096",
      );

      const freePages = parseInt(
        vmStat.match(/Pages free:\s+(\d+)/)?.[1] || "0",
      );
      const activePages = parseInt(
        vmStat.match(/Pages active:\s+(\d+)/)?.[1] || "0",
      );
      const inactivePages = parseInt(
        vmStat.match(/Pages inactive:\s+(\d+)/)?.[1] || "0",
      );
      const wiredPages = parseInt(
        vmStat.match(/Pages wired down:\s+(\d+)/)?.[1] || "0",
      );

      const totalPages = freePages + activePages + inactivePages + wiredPages;
      const usedPages = totalPages - freePages;
      const usagePercent = Math.round((usedPages / totalPages) * 100);

      const color =
        usagePercent >= 90 ? "\x1b[31m" : usagePercent >= 75 ? "\x1b[33m" : "\x1b[32m";
      return `${color}MEM:${usagePercent}%\x1b[0m`;
    }
    return "";
  } catch {
    return "";
  }
}

// Shell level removed per user request

function getDockerContainers() {
  try {
    const containers = execSync("docker ps -q 2>/dev/null | wc -l", {
      encoding: "utf8",
    }).trim();
    const count = parseInt(containers);

    if (count > 0) {
      const color = count >= 5 ? "\x1b[33m" : "\x1b[36m"; // Yellow if 5+, cyan otherwise
      return `${color}docker:${count}\x1b[0m`;
    }
    return "";
  } catch {
    return "";
  }
}

function isPythonProject() {
  try {
    const cwd = process.cwd();
    return (
      fs.existsSync(`${cwd}/requirements.txt`) ||
      fs.existsSync(`${cwd}/pyproject.toml`) ||
      fs.existsSync(`${cwd}/setup.py`) ||
      fs.existsSync(`${cwd}/Pipfile`)
    );
  } catch {
    return false;
  }
}

function getPythonVenv() {
  if (!isPythonProject()) return "";

  // First check environment variable (if activated in Claude Code's context)
  const venvPath = process.env.VIRTUAL_ENV;
  if (venvPath) {
    return venvPath.split("/").pop();
  }

  // Otherwise check for common venv directory names
  const cwd = process.cwd();
  const commonVenvNames = [".venv", "venv", "env", ".env"];

  for (const name of commonVenvNames) {
    const venvDir = `${cwd}/${name}`;
    // Check if it's a valid venv by looking for activate script
    if (
      fs.existsSync(`${venvDir}/bin/activate`) ||
      fs.existsSync(`${venvDir}/Scripts/activate`)
    ) {
      return name;
    }
  }

  return "";
}

const folder = getCurrentFolder();
const branch = getGitBranch();
const gitStatus = getGitStatus();
const gitAheadBehind = getGitAheadBehind();
const venv = getPythonVenv();
const cpu = getCpuUsage();
const gpu = getGpuUsage();
const memory = getMemoryUsage();
const dockerContainers = getDockerContainers();

// Row 1 components
const folderInfo = folder ? `\x1b[36m${folder}\x1b[0m` : "";

// Row 2 components (git status line)
const branchInfo = branch ? `\x1b[32m${branch}\x1b[0m` : "";
const venvInfo = venv ? `\x1b[33mvenv:${venv}\x1b[0m` : "";
const dockerInfo = dockerContainers ? dockerContainers : "";

// Build git status bracket: [mod:X staged:Y ahead:Z]
const gitBracketParts = [];
if (gitStatus.modified > 0) gitBracketParts.push(`\x1b[33mmod:${gitStatus.modified}\x1b[0m`);
if (gitStatus.staged > 0) gitBracketParts.push(`\x1b[32mstaged:${gitStatus.staged}\x1b[0m`);
if (gitAheadBehind.ahead > 0) gitBracketParts.push(`\x1b[32mahead:${gitAheadBehind.ahead}\x1b[0m`);
if (gitAheadBehind.behind > 0) gitBracketParts.push(`\x1b[31mbehind:${gitAheadBehind.behind}\x1b[0m`);
const gitBracket = gitBracketParts.length > 0 ? `[${gitBracketParts.join(" ")}]` : "";

const cpuInfo = cpu ? cpu : "";
const gpuInfo = gpu ? gpu : "";
const memoryInfo = memory ? memory : "";

const separator = " \x1b[90m•\x1b[0m ";
const systemParts = [cpuInfo, gpuInfo, memoryInfo].filter(Boolean);
const gitParts = [
  branchInfo,
  gitBracket,
  venvInfo,
  dockerInfo,
].filter(Boolean);

const row2Parts = [...systemParts, ...gitParts].filter(Boolean);
const row2 = row2Parts.length > 0 ? row2Parts.join(separator) : "";

// --- helpers ---
function readJSON(fd) {
  try {
    return JSON.parse(fs.readFileSync(fd, "utf8"));
  } catch {
    return {};
  }
}
function color(p) {
  if (p >= 90) return "\x1b[31m"; // red
  if (p >= 70) return "\x1b[33m"; // yellow
  return "\x1b[32m"; // green
}
const comma = (n) =>
  new Intl.NumberFormat("en-US").format(
    Math.max(0, Math.floor(Number(n) || 0)),
  );

function usedTotal(u) {
  return (
    (u?.input_tokens ?? 0) +
    (u?.output_tokens ?? 0) +
    (u?.cache_read_input_tokens ?? 0) +
    (u?.cache_creation_input_tokens ?? 0)
  );
}

function syntheticModel(j) {
  const m = String(j?.message?.model ?? "").toLowerCase();
  return m === "<synthetic>" || m.includes("synthetic");
}

function assistantMessage(j) {
  return j?.message?.role === "assistant";
}

function subContext(j) {
  return j?.isSidechain === true;
}

function contentNoResponse(j) {
  const c = j?.message?.content;
  return (
    Array.isArray(c) &&
    c.some(
      (x) =>
        x &&
        x.type === "text" &&
        /no\s+response\s+requested/i.test(String(x.text)),
    )
  );
}

function parseTs(j) {
  const t = j?.timestamp;
  const n = Date.parse(t);
  return Number.isFinite(n) ? n : -Infinity;
}

// Find the newest main-context entry by timestamp (not file order)
function newestMainUsageByTimestamp() {
  if (!transcript) return null;
  let latestTs = -Infinity;
  let latestUsage = null;

  let lines;
  try {
    lines = fs.readFileSync(transcript, "utf8").split(/\r?\n/);
  } catch {
    return null;
  }

  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    if (!line) continue;

    let j;
    try {
      j = JSON.parse(line);
    } catch {
      continue;
    }
    const u = j.message?.usage;
    if (
      subContext(j) ||
      syntheticModel(j) ||
      j.isApiErrorMessage === true ||
      usedTotal(u) === 0 ||
      contentNoResponse(j) ||
      !assistantMessage(j)
    )
      continue;

    const ts = parseTs(j);
    if (ts > latestTs) {
      latestTs = ts;
      latestUsage = u;
    } else if (ts == latestTs && usedTotal(u) > usedTotal(latestUsage)) {
      latestUsage = u;
    }
  }
  return latestUsage;
}

// --- compute/print ---
const usage = newestMainUsageByTimestamp();
if (!usage) {
  const row1 = `${name} \x1b[90m│\x1b[0m ${folderInfo} \x1b[90m│\x1b[0m \x1b[36mcontext window usage starts after your first question.\x1b[0m`;
  console.log(row2 ? `${row1}\n${row2}` : row1);
  process.exit(0);
}

const used = usedTotal(usage);
const pct =
  CONTEXT_WINDOW > 0 ? Math.round((used * 1000) / CONTEXT_WINDOW) / 10 : 0;

const usagePercentLabel = `${color(pct)}📊 ${pct.toFixed(1)}%\x1b[0m`;
const usageCountLabel = `\x1b[90m(${comma(used)}/${comma(
  CONTEXT_WINDOW,
)})\x1b[0m`;

// Row 1: Model | Folder | Chart Icon (used/total) percentage
const row1 = `${name} \x1b[90m│\x1b[0m ${folderInfo} \x1b[90m│\x1b[0m ${usagePercentLabel} ${usageCountLabel}`;

// Row 2: CPU MEM | git status
console.log(row2 ? `${row1}\n${row2}` : row1);