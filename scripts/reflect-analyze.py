#!/usr/bin/env python3
"""
Reflect Analysis Script - Extract learning signals from JSONL transcripts

Parses Claude Code session transcripts to identify corrections, instructions,
and feedback patterns that should be promoted to persistent rules.

Usage:
    python3 scripts/reflect-analyze.py [--days 30] [--project PATH]
"""

import json
import os
import re
import sys
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import argparse
import hashlib


# Signal patterns and their severity
SIGNAL_PATTERNS = {
    "correction": {
        "keywords": [
            r"\bno[,\s]", r"\bdon't\b", r"\bstop\b", r"\binstead\b",
            r"\bactually\b", r"\bwrong\b", r"\bnot that\b", r"\bno\s+that's\b",
            r"\bthat's\s+not\b", r"\bincorrect\b", r"\bavoid\b"
        ],
        "severity": "high",
        "threshold": 1
    },
    "instruction": {
        "keywords": [
            r"\balways\b", r"\bnever\b", r"\bmake sure\b", r"\bremember to\b",
            r"\bfrom now on\b", r"\bmust\b", r"\bshould\b", r"\bensure\b",
            r"\bdon't forget\b", r"\bplease\b.*\balways\b", r"\bkeep\b.*\bmind\b"
        ],
        "severity": "medium",
        "threshold": 2
    },
    "positive_feedback": {
        "keywords": [
            r"\bperfect\b", r"\bgreat\b", r"\bexactly\b", r"\bgood\b",
            r"\byes\b", r"\bthat's\s+right\b", r"\bcorrect\b", r"\bnice\b",
            r"\bexcellent\b", r"\bwell done\b"
        ],
        "severity": "low",
        "threshold": 3
    },
    "negative_feedback": {
        "keywords": [
            r"\bbroke\b", r"\bfailed\b", r"\berror\b", r"\bwrong\b",
            r"\bbad\b", r"\bissue\b", r"\bproblem\b", r"\bbroken\b",
            r"\bdoesn't\s+work\b", r"\bnot\s+working\b"
        ],
        "severity": "high",
        "threshold": 1
    }
}


def get_project_transcript_dir(project_path: str) -> Path:
    """
    Convert project path to ~/.claude/projects/ transcript directory format.

    Example:
        /Users/name/my-project -> ~/.claude/projects/-Users-name-my-project
    """
    # Normalize the project path
    project_path = os.path.abspath(os.path.expanduser(project_path))

    # Convert to transcript dir format (replace / with -)
    transcript_name = project_path.replace(os.sep, '-')
    if transcript_name.startswith('-'):
        transcript_name = transcript_name[1:]

    # Build full path to transcript directory
    claude_dir = Path.home() / '.claude' / 'projects' / transcript_name
    return claude_dir


def find_jsonl_files(transcript_dir: Path, days: int = 30) -> List[Path]:
    """
    Find JSONL files in transcript directory modified within the last N days.
    """
    if not transcript_dir.exists():
        return []

    cutoff_date = datetime.now() - timedelta(days=days)
    jsonl_files = []

    for file_path in transcript_dir.glob('*.jsonl'):
        # Check modification time
        mtime = datetime.fromtimestamp(file_path.stat().st_mtime)
        if mtime >= cutoff_date:
            jsonl_files.append(file_path)

    return sorted(jsonl_files, key=lambda p: p.stat().st_mtime, reverse=True)


def parse_jsonl_transcript(path: Path) -> List[Dict]:
    """
    Parse JSONL transcript file and extract user messages.

    Returns list of message dicts with content and timestamp.
    """
    messages = []

    try:
        with open(path, 'r', encoding='utf-8') as f:
            for line in f:
                if not line.strip():
                    continue

                try:
                    entry = json.loads(line)

                    # Extract user messages from the conversation
                    if entry.get('type') == 'message':
                        msg = entry.get('message', {})
                        if msg.get('role') == 'user':
                            content = msg.get('content', '')

                            # Handle both string and list content formats
                            if isinstance(content, list):
                                content = ' '.join(
                                    item.get('text', '')
                                    for item in content
                                    if item.get('type') == 'text'
                                )

                            if content:
                                messages.append({
                                    'content': content,
                                    'timestamp': entry.get('timestamp', ''),
                                    'file': path.name
                                })

                except json.JSONDecodeError:
                    continue

    except Exception as e:
        print(f"Error parsing {path}: {e}", file=sys.stderr)

    return messages


def extract_signals(messages: List[Dict]) -> List[Dict]:
    """
    Extract learning signals from user messages using pattern matching.

    Returns list of signal dicts with type, content, severity, etc.
    """
    signals = []

    for msg in messages:
        content = msg['content'].lower()
        timestamp = msg.get('timestamp', '')

        # Check each signal type
        for signal_type, config in SIGNAL_PATTERNS.items():
            for pattern in config['keywords']:
                matches = re.finditer(pattern, content, re.IGNORECASE)
                for match in matches:
                    # Extract context around the match (± 100 chars)
                    start = max(0, match.start() - 100)
                    end = min(len(msg['content']), match.end() + 100)
                    context = msg['content'][start:end].strip()

                    # Generate stable ID based on content hash
                    signal_id = hashlib.md5(
                        f"{signal_type}:{context[:200]}".encode()
                    ).hexdigest()[:8]

                    signals.append({
                        'id': f"sig-{signal_id}",
                        'type': signal_type,
                        'content': context,
                        'severity': config['severity'],
                        'threshold': config['threshold'],
                        'timestamp': timestamp,
                        'file': msg.get('file', '')
                    })

    return signals


def load_journal(project_path: str) -> Dict:
    """
    Load or initialize the reflect journal from .claude/orchestration/temp/
    """
    project_path = os.path.abspath(os.path.expanduser(project_path))
    journal_path = Path(project_path) / '.claude' / 'orchestration' / 'temp' / 'reflect-journal.json'

    # Ensure directory exists
    journal_path.parent.mkdir(parents=True, exist_ok=True)

    if journal_path.exists():
        try:
            with open(journal_path, 'r', encoding='utf-8') as f:
                journal = json.load(f)
                # Ensure required fields exist
                if 'signals' not in journal:
                    journal['signals'] = []
                if 'learned_rules' not in journal:
                    journal['learned_rules'] = []
                return journal
        except Exception as e:
            print(f"Error loading journal: {e}", file=sys.stderr)

    # Initialize new journal
    project_name = Path(project_path).name
    return {
        'version': '1.0',
        'project': project_name,
        'signals': [],
        'learned_rules': []
    }


def save_journal(project_path: str, journal: Dict) -> None:
    """Save journal to .claude/orchestration/temp/reflect-journal.json"""
    project_path = os.path.abspath(os.path.expanduser(project_path))
    journal_path = Path(project_path) / '.claude' / 'orchestration' / 'temp' / 'reflect-journal.json'

    # Ensure directory exists
    journal_path.parent.mkdir(parents=True, exist_ok=True)

    with open(journal_path, 'w', encoding='utf-8') as f:
        json.dump(journal, f, indent=2, ensure_ascii=False)


def update_journal(journal: Dict, new_signals: List[Dict]) -> Dict:
    """
    Merge new signals into journal, incrementing occurrence counts.

    Signals are matched by ID (based on content hash).
    """
    # Build lookup dict of existing signals
    existing = {sig['id']: sig for sig in journal['signals']}

    today = datetime.now().strftime('%Y-%m-%d')

    for new_sig in new_signals:
        sig_id = new_sig['id']

        if sig_id in existing:
            # Increment occurrence count
            existing[sig_id]['occurrences'] += 1
            existing[sig_id]['last_seen'] = today

            # Update content if newer version is longer/more detailed
            if len(new_sig['content']) > len(existing[sig_id]['content']):
                existing[sig_id]['content'] = new_sig['content']
        else:
            # Add new signal
            existing[sig_id] = {
                'id': sig_id,
                'type': new_sig['type'],
                'content': new_sig['content'],
                'occurrences': 1,
                'first_seen': today,
                'last_seen': today,
                'severity': new_sig['severity'],
                'threshold': new_sig['threshold'],
                'status': 'pending'
            }

    # Update journal signals
    journal['signals'] = list(existing.values())

    return journal


def identify_patterns(journal: Dict) -> List[Dict]:
    """
    Identify signals that meet promotion threshold.

    Returns list of patterns ready to be promoted to rules.
    """
    patterns = []

    for signal in journal['signals']:
        # Skip if already promoted or dismissed
        if signal['status'] != 'pending':
            continue

        # Check if meets threshold
        if signal['occurrences'] >= signal['threshold']:
            patterns.append({
                'id': signal['id'],
                'type': signal['type'],
                'content': signal['content'],
                'occurrences': signal['occurrences'],
                'severity': signal['severity'],
                'first_seen': signal['first_seen'],
                'last_seen': signal['last_seen']
            })

    # Sort by severity (high > medium > low) then by occurrences
    severity_order = {'high': 3, 'medium': 2, 'low': 1}
    patterns.sort(
        key=lambda p: (severity_order.get(p['severity'], 0), p['occurrences']),
        reverse=True
    )

    return patterns


def main():
    parser = argparse.ArgumentParser(
        description='Analyze JSONL transcripts for learning signals'
    )
    parser.add_argument(
        '--days',
        type=int,
        default=30,
        help='Number of days to look back (default: 30)'
    )
    parser.add_argument(
        '--project',
        type=str,
        default=os.getcwd(),
        help='Project path (default: current directory)'
    )
    parser.add_argument(
        '--output',
        type=str,
        choices=['json', 'summary'],
        default='summary',
        help='Output format (default: summary)'
    )

    args = parser.parse_args()

    # Get project path
    project_path = os.path.abspath(os.path.expanduser(args.project))

    # Load existing journal
    journal = load_journal(project_path)

    # Find transcript directory
    transcript_dir = get_project_transcript_dir(project_path)

    if not transcript_dir.exists():
        print(f"No transcript directory found at: {transcript_dir}", file=sys.stderr)
        print(f"Looking for transcripts from project: {project_path}", file=sys.stderr)
        sys.exit(1)

    # Find JSONL files
    jsonl_files = find_jsonl_files(transcript_dir, days=args.days)

    if not jsonl_files:
        print(f"No JSONL files found in the last {args.days} days", file=sys.stderr)
        sys.exit(1)

    # Parse transcripts and extract messages
    all_messages = []
    for jsonl_path in jsonl_files:
        messages = parse_jsonl_transcript(jsonl_path)
        all_messages.extend(messages)

    # Extract signals
    new_signals = extract_signals(all_messages)

    # Update journal
    journal = update_journal(journal, new_signals)

    # Save updated journal
    save_journal(project_path, journal)

    # Identify patterns meeting threshold
    patterns = identify_patterns(journal)

    # Output results
    if args.output == 'json':
        output = {
            'journal_updated': True,
            'total_signals': len(journal['signals']),
            'new_signals_found': len(new_signals),
            'patterns_ready': patterns,
            'files_analyzed': len(jsonl_files),
            'messages_analyzed': len(all_messages)
        }
        print(json.dumps(output, indent=2, ensure_ascii=False))
    else:
        # Summary output
        print(f"\n=== Reflect Analysis Summary ===\n")
        print(f"Project: {journal['project']}")
        print(f"Files analyzed: {len(jsonl_files)}")
        print(f"Messages analyzed: {len(all_messages)}")
        print(f"New signals found: {len(new_signals)}")
        print(f"Total signals tracked: {len(journal['signals'])}\n")

        if patterns:
            print(f"=== {len(patterns)} Patterns Ready for Promotion ===\n")
            for i, pattern in enumerate(patterns, 1):
                print(f"{i}. [{pattern['severity'].upper()}] {pattern['type']}")
                print(f"   Occurrences: {pattern['occurrences']}")
                print(f"   Content: {pattern['content'][:100]}...")
                print(f"   First seen: {pattern['first_seen']}, Last seen: {pattern['last_seen']}")
                print()
        else:
            print("No patterns ready for promotion yet.\n")

        # Show signal type breakdown
        signal_counts = {}
        for sig in journal['signals']:
            signal_counts[sig['type']] = signal_counts.get(sig['type'], 0) + 1

        print("=== Signal Breakdown ===")
        for sig_type, count in sorted(signal_counts.items()):
            print(f"  {sig_type}: {count}")
        print()

    return 0


if __name__ == '__main__':
    sys.exit(main())
