#!/usr/bin/env python3
"""
ORCA-OS Documentation Validator

Validates that quick-reference documentation stays in sync with
os-dependency-graph.yaml (source of truth).

Checks:
1. Agent counts match between graph and ORCA-agents.md
2. MCP naming patterns are consistent (mcp__X-mcp__Y not mcp__X__Y)
3. Version references are consistent across files

Usage:
  python3 validate-docs.py           # Run all checks
  python3 validate-docs.py --fix     # Auto-fix simple issues (dates, versions)
  python3 validate-docs.py --quiet   # Only show errors, not warnings
"""

import argparse
import os
import re
import sys
from pathlib import Path
from datetime import datetime

# Colors for terminal output
RED = '\033[91m'
YELLOW = '\033[93m'
GREEN = '\033[92m'
RESET = '\033[0m'
BOLD = '\033[1m'

def find_repo_root():
    """Find the ORCA-OS repo root."""
    current = Path(__file__).resolve().parent.parent
    if (current / 'docs' / 'reference' / 'os-dependency-graph.yaml').exists():
        return current
    # Fallback
    return Path('/Users/adilkalam/ORCA-OS')

REPO_ROOT = find_repo_root()

def parse_yaml_counts(graph_path: Path) -> dict:
    """Parse agent counts from os-dependency-graph.yaml."""
    counts = {}
    in_counts_section = False
    in_agents_by_domain = False

    with open(graph_path, 'r') as f:
        for line in f:
            if line.strip() == 'counts:':
                in_counts_section = True
                continue
            if in_counts_section:
                if line.strip().startswith('total_agents:'):
                    counts['total'] = int(line.split(':')[1].strip())
                if line.strip() == 'agents_by_domain:':
                    in_agents_by_domain = True
                    continue
                if in_agents_by_domain:
                    # End of section detection
                    if line.strip() and not line.startswith(' ') and not line.startswith('\t'):
                        break
                    match = re.match(r'\s+(\w[\w-]*):\s*(\d+)', line)
                    if match:
                        domain = match.group(1)
                        count = int(match.group(2))
                        counts[domain] = count

    return counts

def parse_quick_ref_counts(agents_md_path: Path) -> dict:
    """Parse agent counts from ORCA-agents.md."""
    counts = {}

    with open(agents_md_path, 'r') as f:
        content = f.read()

    # Find total in header
    total_match = re.search(r'\*\*Total Agents:\*\*\s*(\d+)', content)
    if total_match:
        counts['total'] = int(total_match.group(1))

    # Find counts table
    table_pattern = r'\|\s*(\w[\w-]*)\s*\|\s*(\d+)\s*\|'
    for match in re.finditer(table_pattern, content):
        domain = match.group(1).lower()
        count = int(match.group(2))
        # Normalize domain names
        domain_map = {
            'ios': 'ios',
            'next.js': 'nextjs',
            'nextjs': 'nextjs',
            'django-react': 'django-react',
            'expo': 'expo',
            'research': 'research',
            'seo': 'seo',
            'data': 'data',
            'os-dev': 'os-dev',
            'orca-pipeline': 'orca-pipeline',
            'audit': 'audit',
            'cross-cutting': 'cross-cutting',
        }
        normalized = domain_map.get(domain, domain)
        if normalized != 'domain':  # Skip header row
            counts[normalized] = count

    return counts

def check_mcp_naming(commands_dir: Path) -> list:
    """Check for MCP naming inconsistencies."""
    issues = []

    # Pattern: mcp__X__Y should be mcp__X-mcp__Y for hyphenated names
    bad_pattern = re.compile(r'mcp__cognition__')  # Should be mcp__cognition-mcp__

    for md_file in commands_dir.glob('*.md'):
        with open(md_file, 'r') as f:
            content = f.read()

        for match in bad_pattern.finditer(content):
            line_num = content[:match.start()].count('\n') + 1
            issues.append({
                'file': str(md_file.relative_to(REPO_ROOT)),
                'line': line_num,
                'issue': 'MCP naming: mcp__cognition__ should be mcp__cognition-mcp__',
                'severity': 'warning'
            })

    return issues

def check_version_references(docs_dir: Path) -> list:
    """Check for stale version references."""
    issues = []

    # Expected current version
    current_version = '4.3'
    old_versions = ['4.0', '4.1', '4.2']

    files_to_check = [
        docs_dir / 'concepts' / 'memory-systems.md',
        docs_dir / 'concepts' / 'cognition-mcp.md',
    ]

    for file_path in files_to_check:
        if not file_path.exists():
            continue
        with open(file_path, 'r') as f:
            content = f.read()

        for old_ver in old_versions:
            pattern = re.compile(rf'OS\s+{re.escape(old_ver)}(?!\.\d)')
            for match in pattern.finditer(content):
                line_num = content[:match.start()].count('\n') + 1
                issues.append({
                    'file': str(file_path.relative_to(REPO_ROOT)),
                    'line': line_num,
                    'issue': f'Stale version reference: OS {old_ver} (current: {current_version})',
                    'severity': 'warning'
                })

    return issues

def check_last_sync_dates(quick_ref_dir: Path) -> list:
    """Check if Last sync dates are older than a week."""
    issues = []
    today = datetime.now()

    for md_file in quick_ref_dir.glob('ORCA-*.md'):
        with open(md_file, 'r') as f:
            content = f.read()

        # Look for "Last sync: YYYY-MM-DD" or "_Last sync: YYYY-MM-DD_"
        match = re.search(r'Last sync:\s*(\d{4}-\d{2}-\d{2})', content)
        if match:
            sync_date = datetime.strptime(match.group(1), '%Y-%m-%d')
            days_old = (today - sync_date).days
            if days_old > 7:
                issues.append({
                    'file': str(md_file.relative_to(REPO_ROOT)),
                    'line': content[:match.start()].count('\n') + 1,
                    'issue': f'Last sync date is {days_old} days old',
                    'severity': 'info'
                })

    return issues

def validate_all(quiet: bool = False) -> tuple[list, list, list]:
    """Run all validation checks."""
    errors = []
    warnings = []
    info = []

    graph_path = REPO_ROOT / 'docs' / 'reference' / 'os-dependency-graph.yaml'
    agents_md = REPO_ROOT / 'quick-reference' / 'ORCA-OS' / 'ORCA-agents.md'
    commands_dir = REPO_ROOT / 'commands'
    docs_dir = REPO_ROOT / 'docs'
    quick_ref_dir = REPO_ROOT / 'quick-reference' / 'ORCA-OS'

    # Check 1: Agent counts
    if graph_path.exists() and agents_md.exists():
        graph_counts = parse_yaml_counts(graph_path)
        qr_counts = parse_quick_ref_counts(agents_md)

        # Note: Quick-ref intentionally excludes internal lanes (kg, shopify)
        # So we expect: graph_total = qr_total + kg + shopify
        internal_lanes = {'kg', 'shopify'}
        internal_total = sum(graph_counts.get(lane, 0) for lane in internal_lanes)

        expected_public_total = graph_counts.get('total', 0) - internal_total
        actual_qr_total = qr_counts.get('total', 0)

        if expected_public_total != actual_qr_total:
            errors.append({
                'file': 'quick-reference/ORCA-OS/ORCA-agents.md',
                'line': 0,
                'issue': f'Agent count mismatch: expected {expected_public_total} public agents, found {actual_qr_total}',
                'severity': 'error'
            })

    # Check 2: MCP naming
    if commands_dir.exists():
        mcp_issues = check_mcp_naming(commands_dir)
        for issue in mcp_issues:
            warnings.append(issue)

    # Check 3: Version references
    if docs_dir.exists():
        version_issues = check_version_references(docs_dir)
        for issue in version_issues:
            warnings.append(issue)

    # Check 4: Sync dates
    if quick_ref_dir.exists() and not quiet:
        date_issues = check_last_sync_dates(quick_ref_dir)
        for issue in date_issues:
            info.append(issue)

    return errors, warnings, info

def print_results(errors: list, warnings: list, info: list):
    """Print validation results."""
    if errors:
        print(f"\n{RED}{BOLD}ERRORS ({len(errors)}):{RESET}")
        for e in errors:
            print(f"  {RED}[ERROR]{RESET} {e['file']}:{e['line']} - {e['issue']}")

    if warnings:
        print(f"\n{YELLOW}{BOLD}WARNINGS ({len(warnings)}):{RESET}")
        for w in warnings:
            print(f"  {YELLOW}[WARN]{RESET} {w['file']}:{w['line']} - {w['issue']}")

    if info:
        print(f"\n{BOLD}INFO ({len(info)}):{RESET}")
        for i in info:
            print(f"  [INFO] {i['file']}:{i['line']} - {i['issue']}")

    if not errors and not warnings:
        print(f"\n{GREEN}{BOLD}All documentation checks passed!{RESET}")

    print()

def main():
    parser = argparse.ArgumentParser(description='ORCA-OS Documentation Validator')
    parser.add_argument('--fix', action='store_true', help='Auto-fix simple issues')
    parser.add_argument('--quiet', action='store_true', help='Only show errors')
    args = parser.parse_args()

    print(f"{BOLD}ORCA-OS Documentation Validator{RESET}")
    print(f"Repository: {REPO_ROOT}")
    print("-" * 50)

    errors, warnings, info = validate_all(quiet=args.quiet)

    if args.quiet:
        info = []
        warnings = []

    print_results(errors, warnings, info)

    # Exit code: 1 if errors, 0 otherwise (warnings don't fail)
    sys.exit(1 if errors else 0)

if __name__ == '__main__':
    main()
