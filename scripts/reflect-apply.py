#!/usr/bin/env python3
"""
reflect-apply.py
================

Apply learned rules to CLAUDE.md or Workshop preferences.
Part of the /reflect command system for institutional learning.

Intended install location:
  ~/.claude/scripts/reflect-apply.py

Usage:
  # Add rule to CLAUDE.md
  python3 ~/.claude/scripts/reflect-apply.py add \\
    --rule "Always use TypeScript strict mode" \\
    --target claude_md

  # Add soft learning to Workshop
  python3 ~/.claude/scripts/reflect-apply.py add \\
    --rule "Prefer composition over inheritance" \\
    --target workshop

  # Archive a rule
  python3 ~/.claude/scripts/reflect-apply.py archive \\
    --rule-id rule-20251127-001 \\
    --reason "Switched to different pattern"

  # Remove a rule entirely
  python3 ~/.claude/scripts/reflect-apply.py remove \\
    --rule-id rule-20251127-001

  # List all rules
  python3 ~/.claude/scripts/reflect-apply.py list
"""

from __future__ import annotations

import argparse
import os
import re
import subprocess
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple


LEARNED_RULES_SECTION = """## Learned Rules (via /reflect)
<!-- Auto-managed by /reflect - manual edits may be overwritten -->

### Active Rules

### Archived Rules
<!-- Rules no longer active but kept for history -->
"""


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


def find_claude_md(project_root: Path) -> Optional[Path]:
    """
    Find the project CLAUDE.md file.

    Searches in order:
    1. <project_root>/CLAUDE.md
    2. <project_root>/.claude/CLAUDE.md

    Returns None if not found.
    """
    candidates = [
        project_root / "CLAUDE.md",
        project_root / ".claude" / "CLAUDE.md",
    ]

    for path in candidates:
        if path.exists():
            return path

    return None


def generate_rule_id() -> str:
    """
    Generate a unique rule ID in format: rule-YYYYMMDD-NNN

    Returns the next available ID for today's date.
    """
    today = datetime.now().strftime("%Y%m%d")
    return f"rule-{today}-001"


def get_next_rule_id(existing_rules: List[Dict[str, str]]) -> str:
    """
    Get the next available rule ID based on existing rules.

    Args:
        existing_rules: List of existing rule dictionaries with 'id' keys

    Returns:
        Next available rule ID for today
    """
    today = datetime.now().strftime("%Y%m%d")
    prefix = f"rule-{today}-"

    # Find all rules from today
    today_rules = [r["id"] for r in existing_rules if r["id"].startswith(prefix)]

    if not today_rules:
        return f"{prefix}001"

    # Extract sequence numbers and find max
    sequences = []
    for rule_id in today_rules:
        match = re.search(r"-(\d{3})$", rule_id)
        if match:
            sequences.append(int(match.group(1)))

    if not sequences:
        return f"{prefix}001"

    next_seq = max(sequences) + 1
    return f"{prefix}{next_seq:03d}"


def parse_claude_md_rules(content: str) -> Tuple[List[Dict[str, str]], List[Dict[str, str]]]:
    """
    Parse existing rules from CLAUDE.md content.

    Returns:
        Tuple of (active_rules, archived_rules)
        Each rule is a dict with keys: id, text, learned_date, archived_date, archived_reason
    """
    active_rules = []
    archived_rules = []

    # Find Learned Rules section
    section_match = re.search(
        r"## Learned Rules \(via /reflect\)(.+?)(?=^## [^#]|\Z)",
        content,
        re.MULTILINE | re.DOTALL
    )

    if not section_match:
        return (active_rules, archived_rules)

    section_content = section_match.group(0)

    # Parse Active Rules
    active_match = re.search(
        r"### Active Rules\s*\n+(.*?)(?=### Archived Rules|\Z)",
        section_content,
        re.DOTALL
    )

    if active_match:
        active_text = active_match.group(1)
        for match in re.finditer(
            r"- \*\*\[([^\]]+)\]\*\* (.+?)\s*\(learned:\s*([^\)]+)\)",
            active_text,
            re.MULTILINE
        ):
            active_rules.append({
                "id": match.group(1),
                "text": match.group(2).strip(),
                "learned_date": match.group(3).strip(),
            })

    # Parse Archived Rules
    archived_match = re.search(
        r"### Archived Rules\s*\n(?:<!--.*?-->\s*)?(.*)",
        section_content,
        re.DOTALL
    )

    if archived_match:
        archived_text = archived_match.group(1)
        for match in re.finditer(
            r"- \*\*\[([^\]]+)\]\*\* ([^\(]+)\(archived: ([^,]+), reason: ([^\)]+)\)",
            archived_text
        ):
            archived_rules.append({
                "id": match.group(1),
                "text": match.group(2).strip(),
                "archived_date": match.group(3),
                "archived_reason": match.group(4),
            })

    return (active_rules, archived_rules)


def ensure_learned_rules_section(content: str) -> str:
    """
    Ensure the Learned Rules section exists in CLAUDE.md.

    If section doesn't exist, adds it at the end of the file.
    Returns modified content.
    """
    # Check if section already exists
    if re.search(r"## Learned Rules \(via /reflect\)", content):
        return content

    # Add section at the end
    if not content.endswith("\n"):
        content += "\n"

    content += "\n" + LEARNED_RULES_SECTION
    return content


def check_conflicts(new_rule: str, existing_rules: List[Dict[str, str]]) -> List[str]:
    """
    Check if new rule conflicts with existing rules.

    Returns list of conflicting rule IDs (currently just checks for duplicates).
    """
    conflicts = []
    new_rule_lower = new_rule.lower()

    for rule in existing_rules:
        if rule["text"].lower() == new_rule_lower:
            conflicts.append(rule["id"])

    return conflicts


def add_rule_to_claude_md(
    claude_md_path: Path,
    rule_text: str,
    check_conflicts_flag: bool = True
) -> Tuple[bool, str]:
    """
    Add a new rule to CLAUDE.md Active Rules section.

    Returns:
        Tuple of (success: bool, message: str)
    """
    if not claude_md_path.exists():
        return (False, f"CLAUDE.md not found at: {claude_md_path}")

    # Read existing content
    content = claude_md_path.read_text()

    # Ensure section exists
    content = ensure_learned_rules_section(content)

    # Parse existing rules
    active_rules, archived_rules = parse_claude_md_rules(content)

    # Check for conflicts
    if check_conflicts_flag:
        conflicts = check_conflicts(rule_text, active_rules)
        if conflicts:
            return (False, f"Rule conflicts with existing rule(s): {', '.join(conflicts)}")

    # Generate new rule ID
    rule_id = get_next_rule_id(active_rules + archived_rules)
    learned_date = datetime.now().strftime("%Y-%m-%d")

    # Create new rule line
    new_rule_line = f"- **[{rule_id}]** {rule_text} (learned: {learned_date})\n"

    # Find Active Rules section and add rule
    def add_to_active(match):
        section = match.group(0)
        # Insert after "### Active Rules\n"
        header_end = section.find("### Active Rules\n") + len("### Active Rules\n")
        return section[:header_end] + new_rule_line + section[header_end:]

    content = re.sub(
        r"### Active Rules\s*\n",
        lambda m: m.group(0) + new_rule_line,
        content,
        count=1
    )

    # Write back to file
    claude_md_path.write_text(content)

    return (True, f"Added rule [{rule_id}] to {claude_md_path}")


def archive_rule(
    claude_md_path: Path,
    rule_id: str,
    reason: str
) -> Tuple[bool, str]:
    """
    Archive an active rule (move to Archived Rules section).

    Returns:
        Tuple of (success: bool, message: str)
    """
    if not claude_md_path.exists():
        return (False, f"CLAUDE.md not found at: {claude_md_path}")

    content = claude_md_path.read_text()
    active_rules, archived_rules = parse_claude_md_rules(content)

    # Find the rule to archive
    rule_to_archive = None
    for rule in active_rules:
        if rule["id"] == rule_id:
            rule_to_archive = rule
            break

    if not rule_to_archive:
        return (False, f"Rule [{rule_id}] not found in Active Rules")

    # Remove from Active Rules
    active_pattern = rf"- \*\*\[{re.escape(rule_id)}\]\*\*[^\n]+\n"
    content = re.sub(active_pattern, "", content)

    # Add to Archived Rules
    archived_date = datetime.now().strftime("%Y-%m-%d")
    archived_line = (
        f"- **[{rule_id}]** {rule_to_archive['text']} "
        f"(archived: {archived_date}, reason: {reason})\n"
    )

    # Insert into Archived Rules section (after the comment)
    content = re.sub(
        r"(### Archived Rules\s*\n(?:<!--.*?-->\s*)?)",
        rf"\1{archived_line}",
        content
    )

    claude_md_path.write_text(content)
    return (True, f"Archived rule [{rule_id}] in {claude_md_path}")


def remove_rule(claude_md_path: Path, rule_id: str) -> Tuple[bool, str]:
    """
    Remove a rule entirely from CLAUDE.md (both Active and Archived).

    Returns:
        Tuple of (success: bool, message: str)
    """
    if not claude_md_path.exists():
        return (False, f"CLAUDE.md not found at: {claude_md_path}")

    content = claude_md_path.read_text()

    # Remove from both Active and Archived sections
    pattern = rf"- \*\*\[{re.escape(rule_id)}\]\*\*[^\n]+\n"
    new_content = re.sub(pattern, "", content)

    if new_content == content:
        return (False, f"Rule [{rule_id}] not found")

    claude_md_path.write_text(new_content)
    return (True, f"Removed rule [{rule_id}] from {claude_md_path}")


def add_workshop_preference(
    project_root: Path,
    preference_text: str
) -> Tuple[bool, str]:
    """
    Add a preference to Workshop using the workshop CLI.

    Returns:
        Tuple of (success: bool, message: str)
    """
    workspace = project_root / ".claude" / "memory"

    if not workspace.exists():
        return (False, f"Workshop workspace not found: {workspace}")

    # Check if workshop CLI is available
    try:
        subprocess.run(
            ["workshop", "--version"],
            check=True,
            capture_output=True,
            text=True,
        )
    except (subprocess.CalledProcessError, FileNotFoundError):
        return (False, "workshop CLI not found on PATH")

    # Add preference with [/reflect] tag
    tagged_text = f"[/reflect] {preference_text}"

    try:
        result = subprocess.run(
            [
                "workshop",
                "--workspace", str(workspace),
                "preference",
                tagged_text,
                "--category", "code_style"
            ],
            capture_output=True,
            text=True,
            check=True,
        )
        return (True, f"Added preference to Workshop: {preference_text[:50]}...")
    except subprocess.CalledProcessError as e:
        return (False, f"Workshop command failed: {e.stderr}")


def list_rules(claude_md_path: Optional[Path]) -> Tuple[bool, str]:
    """
    List all rules from CLAUDE.md.

    Returns:
        Tuple of (success: bool, output: str)
    """
    if not claude_md_path or not claude_md_path.exists():
        return (False, "CLAUDE.md not found")

    content = claude_md_path.read_text()
    active_rules, archived_rules = parse_claude_md_rules(content)

    output = []
    output.append("=== Active Rules ===")
    if not active_rules:
        output.append("(no active rules)")
    else:
        for rule in active_rules:
            output.append(f"[{rule['id']}] {rule['text']}")
            output.append(f"  Learned: {rule['learned_date']}")

    output.append("\n=== Archived Rules ===")
    if not archived_rules:
        output.append("(no archived rules)")
    else:
        for rule in archived_rules:
            output.append(f"[{rule['id']}] {rule['text']}")
            output.append(f"  Archived: {rule['archived_date']} - {rule['archived_reason']}")

    return (True, "\n".join(output))


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Apply learned rules to CLAUDE.md or Workshop preferences"
    )

    subparsers = parser.add_subparsers(dest="command", help="Command to execute")

    # Add command
    add_parser = subparsers.add_parser("add", help="Add a new rule")
    add_parser.add_argument("--rule", required=True, help="Rule text to add")
    add_parser.add_argument(
        "--target",
        choices=["claude_md", "workshop"],
        required=True,
        help="Target for the rule (CLAUDE.md or Workshop)"
    )
    add_parser.add_argument(
        "--no-conflict-check",
        action="store_true",
        help="Skip conflict checking"
    )

    # Archive command
    archive_parser = subparsers.add_parser("archive", help="Archive an active rule")
    archive_parser.add_argument("--rule-id", required=True, help="Rule ID to archive")
    archive_parser.add_argument("--reason", required=True, help="Reason for archiving")

    # Remove command
    remove_parser = subparsers.add_parser("remove", help="Remove a rule entirely")
    remove_parser.add_argument("--rule-id", required=True, help="Rule ID to remove")

    # List command
    list_parser = subparsers.add_parser("list", help="List all rules")

    args = parser.parse_args(argv)

    if not args.command:
        parser.print_help()
        return 1

    project_root = get_project_root()
    claude_md_path = find_claude_md(project_root)

    # Execute command
    if args.command == "add":
        if args.target == "claude_md":
            if not claude_md_path:
                print("Error: CLAUDE.md not found in project", file=sys.stderr)
                return 1

            success, message = add_rule_to_claude_md(
                claude_md_path,
                args.rule,
                check_conflicts_flag=not args.no_conflict_check
            )
        else:  # workshop
            success, message = add_workshop_preference(project_root, args.rule)

        print(message)
        return 0 if success else 1

    elif args.command == "archive":
        if not claude_md_path:
            print("Error: CLAUDE.md not found in project", file=sys.stderr)
            return 1

        success, message = archive_rule(claude_md_path, args.rule_id, args.reason)
        print(message)
        return 0 if success else 1

    elif args.command == "remove":
        if not claude_md_path:
            print("Error: CLAUDE.md not found in project", file=sys.stderr)
            return 1

        success, message = remove_rule(claude_md_path, args.rule_id)
        print(message)
        return 0 if success else 1

    elif args.command == "list":
        success, output = list_rules(claude_md_path)
        print(output)
        return 0 if success else 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
