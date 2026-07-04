#!/usr/bin/env python3
"""
memory-search-unified.py
========================

Unified memory search across:
- ProjectContextServer's per-project code-index.db
- Workshop's per-project workshop.db (via the `workshop` CLI)

Intended install location:
  ~/.claude/scripts/memory-search-unified.py

Usage:
  # Basic search
  python3 ~/.claude/scripts/memory-search-unified.py "authentication"

  # With options
  python3 ~/.claude/scripts/memory-search-unified.py "database schema" \\
    --mode all \\
    --top-k 20 \\
    --json

Modes (soft semantics):
- all        → search everything we can
- decisions  → focus on decisions/task-history
- events     → focus on events (if present)
- code/docs  → currently treated as aliases of "all" in this implementation
"""

from __future__ import annotations

import argparse
import json
import os
import sqlite3
import subprocess
import sys
from pathlib import Path
from typing import Any, Dict, List, Tuple


def get_project_root() -> Path:
  """
  Resolve the project root, preferring git toplevel when available.
  Falls back to current working directory.
  """
  try:
    result = subprocess.run(
      ["git", "rev-parse", "--show-toplevel"],
      check=True,
      capture_output=True,
      text=True,
    )
    root = result.stdout.strip()
    if root:
      return Path(root)
  except Exception:
    pass
  return Path(os.environ.get("PWD", os.getcwd()))


def search_vibe_db(
  project_root: Path, query: str, mode: str, top_k: int
) -> List[Dict[str, Any]]:
  """
  Search the per-project code-index.db if present.

  We keep this intentionally simple: use LIKE-based search across key text
  fields and return a small structured summary.
  """
  db_path = project_root / ".claude" / "memory" / "code-index.db"
  if not db_path.exists():
    return []

  results: List[Dict[str, Any]] = []
  con = sqlite3.connect(str(db_path))
  con.row_factory = sqlite3.Row
  pattern = f"%{query}%"

  try:
    # Decisions
    if mode in ("all", "decisions"):
      try:
        rows = con.execute(
          """
          SELECT id, timestamp, domain, decision, reasoning
          FROM decisions
          WHERE decision LIKE ? OR reasoning LIKE ?
          ORDER BY timestamp DESC
          LIMIT ?
          """,
          (pattern, pattern, top_k),
        ).fetchall()
        for r in rows:
          results.append(
            {
              "source": "vibe.decisions",
              "id": r["id"],
              "timestamp": r["timestamp"],
              "domain": r["domain"],
              "snippet": (r["decision"] or "")[:200],
            }
          )
      except Exception:
        pass

    # Task history
    if mode in ("all", "decisions"):
      try:
        rows = con.execute(
          """
          SELECT id, timestamp, domain, task, learnings
          FROM task_history
          WHERE task LIKE ? OR learnings LIKE ?
          ORDER BY timestamp DESC
          LIMIT ?
          """,
          (pattern, pattern, top_k),
        ).fetchall()
        for r in rows:
          results.append(
            {
              "source": "vibe.task_history",
              "id": r["id"],
              "timestamp": r["timestamp"],
              "domain": r["domain"],
              "snippet": (r["task"] or "")[:200],
            }
          )
      except Exception:
        pass

    # Events (if any)
    if mode in ("all", "events"):
      try:
        rows = con.execute(
          """
          SELECT id, timestamp, type, data
          FROM events
          WHERE type LIKE ? OR data LIKE ?
          ORDER BY timestamp DESC
          LIMIT ?
          """,
          (pattern, pattern, top_k),
        ).fetchall()
        for r in rows:
          results.append(
            {
              "source": "vibe.events",
              "id": r["id"],
              "timestamp": r["timestamp"],
              "event_type": r["type"],
              "snippet": (r["data"] or "")[:200],
            }
          )
      except Exception:
        pass
  finally:
    con.close()

  return results


def search_workshop(project_root: Path, query: str) -> Tuple[str, int]:
  """
  Use the `workshop` CLI to search the per-project Workshop DB, if available.
  Returns (output, returncode).
  """
  workspace = project_root / ".claude" / "memory"
  if not workspace.exists():
    return ("Workshop workspace not found (expected .claude/memory).", 1)

  if not shutil_which("workshop"):
    return ("`workshop` CLI not found on PATH.", 1)

  try:
    proc = subprocess.run(
      ["workshop", "--workspace", str(workspace), "search", query],
      capture_output=True,
      text=True,
      check=False,
    )
    output = proc.stdout.strip() or proc.stderr.strip()
    return (output, proc.returncode)
  except Exception as e:
    return (f"Workshop search failed: {e}", 1)


def shutil_which(cmd: str) -> bool:
  from shutil import which

  return which(cmd) is not None


def search_federated(project_root: Path, query: str, per_source: int = 5) -> Dict[str, List[str]]:
  """
  Best-effort read-only search across the memory stores the core search omits:
  cognition harvests (.orca/cognition), Claude auto-memory (MEMORY.md + linked files),
  the CLAUDE.md Learned Rules ledger, and orca-record checkpoints. Case-insensitive
  substring match. Every store is optional; a missing one yields an empty bucket.
  """
  import sqlite3

  q = query.lower()
  out: Dict[str, List[str]] = {
    "cognition": [], "auto_memory": [], "learned_rules": [], "recording": []
  }

  def scan_md(paths, bucket, label_root):
    for p in paths:
      try:
        text = p.read_text(errors="ignore")
      except Exception:
        continue
      for i, line in enumerate(text.splitlines(), 1):
        s = line.strip()
        if s and q in line.lower():
          rel = str(p).replace(str(label_root) + "/", "")
          out[bucket].append(f"{rel}:{i}: {s[:200]}")
          if len(out[bucket]) >= per_source:
            break

  # 1. Cognition sessions + harvests
  cog = project_root / ".orca" / "cognition"
  if cog.is_dir():
    scan_md(sorted(cog.rglob("*.md")), "cognition", project_root)

  # 2. Claude auto-memory (per-project MEMORY.md + linked files)
  slug = str(project_root).replace("/", "-")
  mem_dir = Path.home() / ".claude" / "projects" / slug / "memory"
  if mem_dir.is_dir():
    scan_md(sorted(mem_dir.rglob("*.md")), "auto_memory", mem_dir)

  # 3. CLAUDE.md Learned Rules ledger (and the rest of CLAUDE.md)
  claude_md = project_root / "CLAUDE.md"
  if claude_md.is_file():
    scan_md([claude_md], "learned_rules", project_root)

  # 4. orca-record checkpoints (prompt summaries) -- read-only, defensive
  rec = project_root / ".orca" / "recording.db"
  if rec.is_file():
    try:
      con = sqlite3.connect(f"file:{rec}?mode=ro", uri=True)
      cur = con.execute(
        "SELECT prompt_summary FROM checkpoints "
        "WHERE prompt_summary IS NOT NULL AND lower(prompt_summary) LIKE ? LIMIT ?",
        (f"%{q}%", per_source),
      )
      for row in cur.fetchall():
        if row and row[0]:
          out["recording"].append(str(row[0])[:200])
      con.close()
    except Exception:
      pass

  return out


def main(argv: list[str] | None = None) -> int:
  parser = argparse.ArgumentParser(
    description="Unified memory search across code-index.db and Workshop."
  )
  parser.add_argument("query", help="Search query string")
  parser.add_argument(
    "--mode",
    choices=["all", "code", "docs", "events", "decisions"],
    default="all",
    help="Search mode (soft semantics; defaults to 'all')",
  )
  parser.add_argument(
    "--top-k",
    type=int,
    default=10,
    help="Max results per source (vibe tables)",
  )
  parser.add_argument(
    "--json",
    action="store_true",
    help="Output JSON instead of human-readable text",
  )

  args = parser.parse_args(argv)
  root = get_project_root()

  vibe_results = search_vibe_db(root, args.query, args.mode, args.top_k)
  workshop_output, workshop_rc = search_workshop(root, args.query)
  federated = search_federated(root, args.query)

  if args.json:
    payload = {
      "query": args.query,
      "mode": args.mode,
      "project_root": str(root),
      "vibe": vibe_results,
      "workshop": {
        "workspace": str(root / ".claude" / "memory"),
        "returncode": workshop_rc,
        "output": workshop_output,
      },
      "federated": federated,
    }
    print(json.dumps(payload, indent=2, ensure_ascii=False))
    return 0

  # Human-readable output
  print(f"Unified memory search for: {args.query!r}")
  print(f"Project root: {root}")
  print()

  print("=== code-index.db (decisions/task history/events) ===")
  if not vibe_results:
    print("(no matches or code-index.db missing)")
  else:
    for r in vibe_results:
      print(f"- [{r['source']}] {r.get('timestamp','')} {r.get('domain','')}".strip())
      print(f"  {r.get('snippet','')}")
  print()

  print("=== Workshop search ===")
  print(workshop_output or "(no output)")
  print()

  labels = {
    "cognition": ".orca/cognition (sessions + harvests)",
    "auto_memory": "Claude auto-memory (MEMORY.md + linked)",
    "learned_rules": "CLAUDE.md (Learned Rules ledger)",
    "recording": "orca-record checkpoints",
  }
  for key, label in labels.items():
    print(f"=== {label} ===")
    hits = federated.get(key) or []
    if not hits:
      print("(no matches)")
    else:
      for h in hits:
        print(f"- {h}")
    print()

  return 0


if __name__ == "__main__":
  raise SystemExit(main())

