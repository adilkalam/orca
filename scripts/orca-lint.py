#!/usr/bin/env python3
"""orca-lint.py -- ORCA-OS reality checker (stdlib-only, Python 3).

Single entry point. Seven checks over the ORCA-OS repo (run from anywhere; paths
resolve against the repo root, one level up from scripts/):

  DEAD-FILE   dead path references in commands/*.md, agents/**/*.md, skills/*/SKILL.md
  DEAD-AGENT  subagent_type / roster references to agents that do not exist
  COLLISION   commands/<n>.md that collide with skills/<n>/ (Claude merges the
              namespace; the skill wins)
  GRAPH       docs/reference/os-dependency-graph.yaml: every file/agent/skill named
              exists; each lane's agent_count == list length == directory reality;
              used_by edges name existing commands
  VERSION     'OS x.y' strings that differ from the canonical CLAUDE.md version
  FRONTMATTER agent 'tools:' must be a comma-string (not a YAML list), no 'model:'
              key; command frontmatter must be a parseable --- block
  DRIFT       repo <-> ~/.claude drift (delegates to scripts/deploy-diff.sh); a
              finding class marked INFORMATIONAL -- never fails --strict

Output: 'file:line: [CATEGORY] message' (line is best-effort; the ref's line when
known, else the file). Per-category counts follow. Default exit is 0 (non-fatal)
so the first runs on a dirty tree are usable.

Flags:
  --strict            exit non-zero if ANY non-baseline, non-informational finding exists
  --baseline <path>   suppress known findings from the failure set (default:
                      scripts/orca-lint-baseline.txt); suppressed findings still
                      print, tagged [BASELINE]
  --no-drift          skip the DRIFT check (used by verify-health; drift is
                      informational and never affects the exit code anyway)
  --json              machine-readable output

Baseline match key: 'category|identifier' (see scripts/orca-lint-baseline.txt for
the per-category identifier normalization). Comment (#) and blank lines ignored.
"""

import argparse
import json
import os
import re
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent

# --- category tokens (display -> baseline) -----------------------------------
CAT_DEAD_FILE = "DEAD-FILE"
CAT_DEAD_AGENT = "DEAD-AGENT"
CAT_COLLISION = "COLLISION"
CAT_GRAPH = "GRAPH"
CAT_VERSION = "VERSION"
CAT_FRONTMATTER = "FRONTMATTER"
CAT_DRIFT = "DRIFT"

CATEGORIES = [
    CAT_DEAD_FILE, CAT_DEAD_AGENT, CAT_COLLISION,
    CAT_GRAPH, CAT_VERSION, CAT_FRONTMATTER, CAT_DRIFT,
]


def bcat(cat):
    """Baseline token for a display category (lowercased)."""
    return cat.lower()


# --- path-reference recognition ----------------------------------------------
# A path token qualifies as a repo-artifact reference when it starts with a known
# repo prefix, or (extension branch) it has a config-ish extension and its first
# segment is a real top-level repo directory. Placeholders/URLs are skipped, so
# runtime artifacts (.orca/, .claude/) and prose never register.
REPO_PREFIXES = ("agents/", "commands/", "skills/", "hooks/",
                 "scripts/", "docs/", "~/.claude/")
KNOWN_EXT = (".md", ".sh", ".py", ".yaml", ".yml", ".json")
PLACEHOLDER_CHARS = set("*{}<>$()|`' \t\"")
# A path token abutting one of these is a truncated glob/template (e.g.
# 'corpus.v*.json', 'agents/{lane}/x.md') -- skip it rather than flag the stub.
GLOB_NEXT = set("*{<[?")
TOKEN_RE = re.compile(r"[~A-Za-z0-9][A-Za-z0-9._/~+-]*")


def repo_top_dirs():
    dirs = set()
    for entry in REPO.iterdir():
        if entry.is_dir() and not entry.name.startswith((".", "_")):
            dirs.add(entry.name)
    return dirs


_TOP_DIRS = repo_top_dirs()


def is_path_candidate(tok):
    if not tok or "/" not in tok:
        return False
    if tok.endswith("/"):
        return False  # bare directory mention, not a file reference
    if "://" in tok:
        return False
    if any(ch in tok for ch in PLACEHOLDER_CHARS):
        return False
    if tok.startswith(REPO_PREFIXES):
        return True
    if tok.endswith(KNOWN_EXT):
        first = tok.split("/", 1)[0]
        if first in _TOP_DIRS:
            return True
    return False


def path_exists(tok):
    """Repo is the source of truth: a ~/.claude/X ref is satisfied when the
    repo-relative X exists (or the literal deployed path exists)."""
    if tok.startswith("~/.claude/"):
        rel = tok[len("~/.claude/"):]
        if (REPO / rel).exists():
            return True
        return Path(os.path.expanduser(tok)).exists()
    clean = tok[2:] if tok.startswith("./") else tok
    return (REPO / clean).exists()


def extract_path_tokens(text):
    for m in TOKEN_RE.finditer(text):
        nxt = text[m.end()] if m.end() < len(text) else ""
        if nxt in GLOB_NEXT:
            continue
        tok = m.group(0).rstrip(".,:;")
        if tok:
            yield tok


# Real artifact references in prose live inside inline backticks or markdown
# links. Bare paths in prose, table cells, and fenced code blocks (examples,
# rsync snippets, React-hook names) are NOT references -- extracting only from
# these two spans keeps the DEAD-FILE check off "arbitrary prose".
INLINE_BACKTICK_RE = re.compile(r"`([^`\n]+)`")
MDLINK_RE = re.compile(r"\]\(([^)\n]+)\)")


def is_fence(line):
    stripped = line.lstrip()
    return stripped.startswith("```") or stripped.startswith("~~~")


def extract_referenced_tokens(lines):
    """Yield (lineno, token) for path tokens inside inline backticks / md-links,
    skipping fenced code blocks."""
    in_fence = False
    for lineno, line in enumerate(lines, start=1):
        if is_fence(line):
            in_fence = not in_fence
            continue
        if in_fence:
            continue
        spans = []
        spans += INLINE_BACKTICK_RE.findall(line)
        spans += MDLINK_RE.findall(line)
        for span in spans:
            for tok in extract_path_tokens(span):
                yield lineno, tok


# --- agent-reference recognition ---------------------------------------------
BUILTIN_AGENTS = {
    "general-purpose", "Explore", "explore", "output-style-setup",
    "statusline-setup", "Task", "code-reviewer",
}
ROLE_SUFFIXES = (
    "specialist", "reviewer", "architect", "builder", "enforcer", "guardian",
    "analyzer", "agent", "gate", "verification", "validator", "master",
    "wizard", "expert", "analyst", "surgeon", "assassin", "prophet", "shield",
    "eliminator", "checker", "advisor", "generator", "editor", "exporter",
    "explorer", "orchestrator", "researcher",
)
SUBAGENT_RE = re.compile(r"subagent_type\s*[:=]\s*[\"']?([A-Za-z][A-Za-z0-9_-]*)")
BACKTICK_AGENT_RE = re.compile(r"`([a-z][a-z0-9]*(?:-[a-z0-9]+)+)`")


def looks_like_agent_name(tok):
    return any(tok.endswith("-" + suf) for suf in ROLE_SUFFIXES)


def build_agent_inventory():
    names = set()
    adir = REPO / "agents"
    if not adir.is_dir():
        return names
    for path in adir.rglob("*.md"):
        low = str(path).lower()
        if "archive" in low or "deprecated" in low:
            continue
        names.add(path.stem)
    return names


# --- file collection ---------------------------------------------------------
def iter_scan_files():
    """Files scanned by DEAD-FILE / DEAD-AGENT / FRONTMATTER checks."""
    files = []
    cmd_dir = REPO / "commands"
    if cmd_dir.is_dir():
        files += sorted(cmd_dir.glob("*.md"))
    agent_dir = REPO / "agents"
    if agent_dir.is_dir():
        files += sorted(p for p in agent_dir.rglob("*.md")
                        if "archive" not in str(p).lower()
                        and "deprecated" not in str(p).lower())
    skills_dir = REPO / "skills"
    if skills_dir.is_dir():
        files += sorted(skills_dir.glob("*/SKILL.md"))
    return files


def relpath(path):
    try:
        return str(Path(path).resolve().relative_to(REPO))
    except ValueError:
        return str(path)


def read_lines(path):
    try:
        return Path(path).read_text(encoding="utf-8", errors="replace").splitlines()
    except OSError:
        return []


def mkfinding(cat, ident, filepath, line, msg, informational=False):
    return {
        "cat": cat, "bcat": bcat(cat), "ident": ident,
        "file": relpath(filepath), "line": line, "msg": msg,
        "informational": informational,
    }


# =============================================================================
# CHECK 1: DEAD FILE REFERENCES
# =============================================================================
def check_dead_files():
    findings = []
    seen = set()
    for path in iter_scan_files():
        rel = relpath(path)
        for lineno, tok in extract_referenced_tokens(read_lines(path)):
            if not is_path_candidate(tok):
                continue
            if path_exists(tok):
                continue
            key = (tok, rel)
            if key in seen:
                continue
            seen.add(key)
            findings.append(mkfinding(
                CAT_DEAD_FILE, tok, path, lineno,
                "references '%s' which does not exist" % tok))
    return findings


# =============================================================================
# CHECK 2: DEAD AGENT REFERENCES
# =============================================================================
def check_dead_agents(inventory):
    findings = []
    seen = set()

    def record(name, path, lineno, how):
        if name in inventory or name in BUILTIN_AGENTS:
            return
        rel = relpath(path)
        key = (name, rel)
        if key in seen:
            return
        seen.add(key)
        findings.append(mkfinding(
            CAT_DEAD_AGENT, name, path, lineno,
            "%s '%s' has no matching agent file" % (how, name)))

    for path in iter_scan_files():
        for lineno, line in enumerate(read_lines(path), start=1):
            for m in SUBAGENT_RE.finditer(line):
                name = m.group(1)
                nxt = line[m.end(1)] if m.end(1) < len(line) else ""
                if nxt in "{<" or name.endswith(("-", "_")):
                    continue  # template placeholder (e.g. orca-pipeline-<role>)
                record(name, path, lineno, "subagent_type")
            for m in BACKTICK_AGENT_RE.finditer(line):
                name = m.group(1)
                if looks_like_agent_name(name):
                    record(name, path, lineno, "roster ref")
    return findings


# =============================================================================
# CHECK 3: SKILL / COMMAND COLLISIONS
# =============================================================================
def check_collisions():
    findings = []
    cmd_dir = REPO / "commands"
    skills_dir = REPO / "skills"
    if not cmd_dir.is_dir() or not skills_dir.is_dir():
        return findings
    for cmd in sorted(cmd_dir.glob("*.md")):
        name = cmd.stem
        if (skills_dir / name).is_dir():
            findings.append(mkfinding(
                CAT_COLLISION, name, cmd, 1,
                "command '%s' collides with skills/%s/ (skill wins the namespace)"
                % (name, name)))
    return findings


# =============================================================================
# CHECK 4: DEPENDENCY-GRAPH VALIDATION
# =============================================================================
GRAPH_REL = "docs/reference/os-dependency-graph.yaml"


def graph_line_of(text_lines, needle):
    for i, line in enumerate(text_lines, start=1):
        if needle in line:
            return i
    return 1


def _dir_agent_count(agents_dir):
    d = REPO / agents_dir
    if not d.is_dir():
        return None
    return len([p for p in d.glob("*.md") if "archive" not in p.name.lower()])


def check_graph(inventory):
    graph_path = REPO / GRAPH_REL
    if not graph_path.is_file():
        return [mkfinding(CAT_GRAPH, "file:" + GRAPH_REL, graph_path, 1,
                          "dependency graph not found")]
    text_lines = read_lines(graph_path)
    findings = []
    seen = set()

    def add(ident, needle, msg):
        if ident in seen:
            return
        seen.add(ident)
        findings.append(mkfinding(
            CAT_GRAPH, ident, graph_path,
            graph_line_of(text_lines, needle), msg))

    try:
        import yaml
        data = yaml.safe_load(graph_path.read_text(encoding="utf-8"))
        _graph_structured(data, inventory, add)
    except Exception:
        # Tolerant fallback: line scan for path + agent-list references only.
        _graph_fallback(text_lines, inventory, add)
    return findings


def _graph_structured(data, inventory, add):
    def walk(node, key):
        if isinstance(node, dict):
            for k, v in node.items():
                if k == "hub_skill" and isinstance(v, str) and v:
                    if not (REPO / "skills" / v / "SKILL.md").is_file():
                        add("skill:" + v, v,
                            "skill '%s' has no skills/%s/SKILL.md" % (v, v))
                walk(v, k)
        elif isinstance(node, list):
            for item in node:
                if isinstance(item, str):
                    _graph_scalar(item, key, inventory, add)
                walk(item, key)
        elif isinstance(node, str):
            _graph_scalar(node, key, inventory, add)

    walk(data, None)

    if not isinstance(data, dict):
        return
    lanes = data.get("lanes")
    if isinstance(lanes, dict):
        for name, lane in lanes.items():
            _graph_count(name, lane, add)
    for section in ("cross_cutting", "cross_domain"):
        block = data.get(section)
        if isinstance(block, dict):
            _graph_count(section, block, add)


def _graph_scalar(value, key, inventory, add):
    if key == "agents":
        name = value.split()[0] if value else value
        if name and name not in inventory and name not in BUILTIN_AGENTS:
            add("agent:" + name, name,
                "graph lists agent '%s' with no matching agent file" % name)
        return
    if key == "skills" and "/" not in value:
        name = value.strip()
        if name and not (REPO / "skills" / name / "SKILL.md").is_file():
            add("skill:" + name, name,
                "graph names skill '%s' with no skills/%s/SKILL.md" % (name, name))
        return
    if key == "used_by" and value.startswith("/"):
        name = value[1:]
        if name and not (REPO / "commands" / (name + ".md")).is_file():
            add("used_by:/" + name, value,
                "used_by edge names command '%s' with no commands/%s.md"
                % (value, name))
        return
    for tok in extract_path_tokens(value):
        if is_path_candidate(tok) and not path_exists(tok):
            add("file:" + tok, tok,
                "graph references '%s' which does not exist" % tok)


def _graph_count(name, block, add):
    if not isinstance(block, dict):
        return
    agents = block.get("agents")
    declared = block.get("agent_count")
    agents_dir = block.get("agents_dir")
    if not isinstance(agents, list) or not isinstance(declared, int):
        return
    if not isinstance(agents_dir, str):
        return
    listed = len(agents)
    actual = _dir_agent_count(agents_dir)
    if actual is None:
        add("count:" + name, name + ":",
            "lane '%s' agents_dir '%s' missing (declared %d, listed %d)"
            % (name, agents_dir, declared, listed))
        return
    if not (declared == listed == actual):
        add("count:" + name, name + ":",
            "lane '%s' count mismatch: agent_count=%d, listed=%d, %s/=%d"
            % (name, declared, listed, agents_dir, actual))


AGENT_ITEM_RE = re.compile(r"^\s+-\s+([a-z][a-z0-9]*(?:-[a-z0-9]+)+)\s*(?:#.*)?$")


def _graph_fallback(text_lines, inventory, add):
    in_agents = False
    for line in text_lines:
        stripped = line.strip()
        if stripped.startswith("agents:"):
            in_agents = True
            continue
        if in_agents:
            m = AGENT_ITEM_RE.match(line)
            if m:
                name = m.group(1)
                if name not in inventory and name not in BUILTIN_AGENTS:
                    add("agent:" + name, name,
                        "graph lists agent '%s' with no matching agent file" % name)
                continue
            if stripped and not line.startswith(" "):
                in_agents = False
        for tok in extract_path_tokens(line):
            if is_path_candidate(tok) and not path_exists(tok):
                add("file:" + tok, tok,
                    "graph references '%s' which does not exist" % tok)


# =============================================================================
# CHECK 5: VERSION STRINGS
# =============================================================================
VERSION_RE = re.compile(r"(?<![A-Za-z])OS (\d+\.\d+)")
CANON_RE = re.compile(r"Version: OS (\d+\.\d+)")
# Historical / changelog surfaces legitimately name old versions; excluding them
# is a tightening (not a baselined false positive).
VERSION_SKIP_DIRS = ("docs/research/",)
VERSION_SKIP_NAMES = ("changelog.md", "CHANGELOG.md", "ORCA-Fundamentals.md")


def canonical_version():
    claude = REPO / "CLAUDE.md"
    if not claude.is_file():
        return None
    m = CANON_RE.search(claude.read_text(encoding="utf-8", errors="replace"))
    return m.group(1) if m else None


def _version_targets():
    targets = []
    cmd_dir = REPO / "commands"
    if cmd_dir.is_dir():
        targets += sorted(cmd_dir.glob("*.md"))
    docs_dir = REPO / "docs"
    if docs_dir.is_dir():
        for pat in ("*.md", "*.yaml", "*.yml"):
            targets += sorted(docs_dir.rglob(pat))
    return targets


def _version_skipped(rel):
    if any(rel.startswith(d) for d in VERSION_SKIP_DIRS):
        return True
    return os.path.basename(rel) in VERSION_SKIP_NAMES


def check_versions():
    canon = canonical_version()
    if not canon:
        return []
    findings = []
    seen = set()
    for path in _version_targets():
        rel = relpath(path)
        if _version_skipped(rel):
            continue
        lines = read_lines(path)
        if any(line.strip().startswith("era:") for line in lines[:8]):
            continue  # era-tagged historical doc
        for lineno, line in enumerate(lines, start=1):
            for m in VERSION_RE.finditer(line):
                ver = m.group(1)
                if ver == canon:
                    continue
                ident = "OS " + ver
                key = (ident, rel)
                if key in seen:
                    continue
                seen.add(key)
                findings.append(mkfinding(
                    CAT_VERSION, ident, path, lineno,
                    "'%s' differs from canonical 'OS %s'" % (ident, canon)))
    return findings


# =============================================================================
# CHECK 6: FRONTMATTER VALIDITY
# =============================================================================
def _frontmatter_block(lines):
    """Return (start_idx, end_idx) of the frontmatter body (exclusive of the ---
    fences), or None when there is no opening fence / no closing fence."""
    if not lines or lines[0].strip() != "---":
        return None
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            return (1, i)
    return "unclosed"


def check_frontmatter():
    findings = []
    # agents: tools must be an inline comma string; no model: key
    agent_dir = REPO / "agents"
    if agent_dir.is_dir():
        for path in sorted(p for p in agent_dir.rglob("*.md")
                           if "archive" not in str(p).lower()
                           and "deprecated" not in str(p).lower()):
            lines = read_lines(path)
            block = _frontmatter_block(lines)
            if block is None:
                continue
            if block == "unclosed":
                findings.append(mkfinding(
                    CAT_FRONTMATTER, relpath(path) + ":frontmatter", path, 1,
                    "frontmatter block has no closing ---"))
                continue
            start, end = block
            for i in range(start, end):
                raw = lines[i]
                if raw.startswith("model:"):
                    findings.append(mkfinding(
                        CAT_FRONTMATTER, relpath(path) + ":model", path, i + 1,
                        "agent frontmatter must not set a 'model:' key"))
                if raw.startswith("tools:"):
                    value = raw[len("tools:"):].strip()
                    if value.startswith("#"):
                        value = ""
                    is_list = False
                    if value.startswith("["):
                        is_list = True
                    elif value == "":
                        nxt = lines[i + 1].strip() if i + 1 < end else ""
                        if nxt.startswith("-"):
                            is_list = True
                    if is_list:
                        findings.append(mkfinding(
                            CAT_FRONTMATTER, relpath(path) + ":tools", path, i + 1,
                            "agent 'tools:' must be a comma-separated string, "
                            "not a YAML list"))
    # commands: frontmatter block must be parseable when present
    cmd_dir = REPO / "commands"
    if cmd_dir.is_dir():
        for path in sorted(cmd_dir.glob("*.md")):
            lines = read_lines(path)
            block = _frontmatter_block(lines)
            if block == "unclosed":
                findings.append(mkfinding(
                    CAT_FRONTMATTER, relpath(path) + ":frontmatter", path, 1,
                    "command frontmatter block has no closing ---"))
    return findings


# =============================================================================
# CHECK 7: DRIFT (informational; delegates to deploy-diff.sh)
# =============================================================================
def check_drift():
    script = REPO / "scripts" / "deploy-diff.sh"
    if not script.is_file():
        return [mkfinding(CAT_DRIFT, "drift", script, 1,
                          "scripts/deploy-diff.sh not found", informational=True)]
    try:
        proc = subprocess.run(
            ["bash", str(script), "--quiet"],
            cwd=str(REPO), capture_output=True, text=True, timeout=180)
    except Exception as exc:  # noqa: BLE001 - report, never abort the lint run
        return [mkfinding(CAT_DRIFT, "drift", script, 1,
                          "deploy-diff.sh failed to run: %s" % exc,
                          informational=True)]
    summary = ""
    for line in proc.stdout.splitlines():
        if line.startswith("DRIFT:") or line.startswith("OK:"):
            summary = line.strip()
    if not summary:
        summary = "deploy-diff exit=%d (no summary line)" % proc.returncode
    return [mkfinding(CAT_DRIFT, "drift", script, 1,
                      "%s [deploy-diff exit=%d]" % (summary, proc.returncode),
                      informational=True)]


# --- baseline ----------------------------------------------------------------
def load_baseline(path):
    keys = set()
    if not path:
        return keys
    p = Path(path)
    if not p.is_absolute():
        p = REPO / p
    if not p.is_file():
        return keys
    for line in p.read_text(encoding="utf-8", errors="replace").splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        keys.add(line)
    return keys


def finding_key(finding):
    return "%s|%s" % (finding["bcat"], finding["ident"])


# --- run + report ------------------------------------------------------------
def run_checks(no_drift):
    inventory = build_agent_inventory()
    findings = []
    findings += check_dead_files()
    findings += check_dead_agents(inventory)
    findings += check_collisions()
    findings += check_graph(inventory)
    findings += check_versions()
    findings += check_frontmatter()
    if not no_drift:
        findings += check_drift()
    return findings


def annotate(findings, baseline_keys):
    for f in findings:
        f["baselined"] = finding_key(f) in baseline_keys
    return findings


def is_failure(f):
    return not f["informational"] and not f["baselined"]


def print_text(findings):
    for f in sorted(findings, key=lambda x: (x["cat"], x["file"], x["line"])):
        tags = ""
        if f["baselined"]:
            tags += "[BASELINE] "
        elif f["informational"]:
            tags += "[INFO] "
        print("%s:%d: %s[%s] %s" % (f["file"], f["line"], tags, f["cat"], f["msg"]))
    print("")
    print("orca-lint category counts (active / baselined / informational):")
    for cat in CATEGORIES:
        rows = [f for f in findings if f["cat"] == cat]
        active = sum(1 for f in rows if is_failure(f))
        based = sum(1 for f in rows if f["baselined"])
        info = sum(1 for f in rows if f["informational"])
        print("  %-12s %3d active  %3d baseline  %3d info" % (cat, active, based, info))
    total_active = sum(1 for f in findings if is_failure(f))
    total_base = sum(1 for f in findings if f["baselined"])
    print("  %-12s %3d active  %3d baseline" % ("TOTAL", total_active, total_base))


def print_json(findings):
    payload = {
        "findings": findings,
        "counts": {
            cat: {
                "active": sum(1 for f in findings if f["cat"] == cat and is_failure(f)),
                "baseline": sum(1 for f in findings if f["cat"] == cat and f["baselined"]),
                "informational": sum(1 for f in findings if f["cat"] == cat and f["informational"]),
            } for cat in CATEGORIES
        },
        "active_total": sum(1 for f in findings if is_failure(f)),
    }
    print(json.dumps(payload, indent=2))


def main():
    parser = argparse.ArgumentParser(description="ORCA-OS reality checker")
    parser.add_argument("--strict", action="store_true",
                        help="exit non-zero on any non-baseline finding")
    parser.add_argument("--baseline", default="scripts/orca-lint-baseline.txt",
                        help="baseline file of known findings to suppress")
    parser.add_argument("--no-drift", action="store_true",
                        help="skip the DRIFT check (deploy-diff)")
    parser.add_argument("--json", action="store_true",
                        help="machine-readable output")
    args = parser.parse_args()

    baseline_keys = load_baseline(args.baseline)
    findings = run_checks(args.no_drift)
    annotate(findings, baseline_keys)

    if args.json:
        print_json(findings)
    else:
        print_text(findings)

    if args.strict and any(is_failure(f) for f in findings):
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
