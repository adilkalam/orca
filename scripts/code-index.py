#!/usr/bin/env python3
"""
code-index.py v2.1
==================

Code and documentation indexer for ORCA-OS with:
- Hybrid search (semantic + symbol + full-text with weighted ranking)
- Language-specific chunkers (TypeScript, Swift, Python, Markdown)
- Symbol extraction for function/class/agent/command search
- Agent and command markdown parsing with frontmatter support

Usage:
    # Sync current project with language-aware chunking
    python3 ~/.claude/scripts/code-index.py sync

    # Sync with embeddings (requires Ollama + nomic-embed-text)
    python3 ~/.claude/scripts/code-index.py sync --embeddings

    # Hybrid search (combines all search types)
    python3 ~/.claude/scripts/code-index.py hsearch "authentication flow"

    # Symbol search (function/class/agent names)
    python3 ~/.claude/scripts/code-index.py symbol "handleAuth"

    # Full-text search
    python3 ~/.claude/scripts/code-index.py search "authentication"

    # Vector/semantic search (requires embeddings)
    python3 ~/.claude/scripts/code-index.py vsearch "user login flow"

    # Initialize/upgrade schema
    python3 ~/.claude/scripts/code-index.py init

Install location: ~/.claude/scripts/code-index.py
"""

from __future__ import annotations

import argparse
import json
import os
import sqlite3
import struct
import subprocess
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional

# ============================================================
# CONFIGURATION
# ============================================================

SCHEMA_VERSION = "2.1.0"
EMBEDDING_MODEL = "nomic-embed-text"
EMBEDDING_DIM = 768  # nomic-embed-text dimension
OLLAMA_URL = "http://localhost:11434"

# Hybrid search weights (must sum to 1.0)
SEARCH_WEIGHTS = {
    "semantic": 0.4,   # Embedding similarity
    "symbol": 0.35,    # Function/class name match
    "fulltext": 0.25,  # FTS5 keyword match
}


# ============================================================
# LANGUAGE-SPECIFIC CHUNKERS
# ============================================================

import re
from dataclasses import dataclass
from typing import Tuple


@dataclass
class CodeChunk:
    """Represents a parsed code chunk with metadata."""
    content: str
    chunk_type: str  # function, class, component, method, export, etc.
    name: str        # Symbol name (function/class name)
    start_line: int
    end_line: int
    parent_name: Optional[str] = None  # For methods: the class they belong to
    language: str = "unknown"
    symbols: List[str] = None  # All symbols defined in this chunk

    def __post_init__(self):
        if self.symbols is None:
            self.symbols = [self.name] if self.name else []


class BaseChunker:
    """Base class for language-specific chunkers."""

    LANGUAGE = "unknown"

    def chunk(self, content: str, file_path: str) -> List[CodeChunk]:
        """Override in subclass to implement language-specific chunking."""
        raise NotImplementedError

    def _count_lines(self, text: str) -> int:
        return text.count('\n') + 1


class TypeScriptChunker(BaseChunker):
    """
    TypeScript/JavaScript chunker with AST-aware parsing.
    Extracts: functions, classes, React components, hooks, exports.
    """

    LANGUAGE = "typescript"

    # Regex patterns for TypeScript/JavaScript
    PATTERNS = {
        # Function declarations: function name(...) or async function name(...)
        "function": re.compile(
            r'^(?:export\s+)?(?:async\s+)?function\s+(\w+)',
            re.MULTILINE
        ),
        # Arrow functions: const name = (...) => or const name = async (...) =>
        "arrow_function": re.compile(
            r'^(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?\([^)]*\)\s*(?::\s*\w+(?:<[^>]+>)?)?\s*=>',
            re.MULTILINE
        ),
        # Class declarations
        "class": re.compile(
            r'^(?:export\s+)?(?:abstract\s+)?class\s+(\w+)',
            re.MULTILINE
        ),
        # Interface/Type declarations
        "interface": re.compile(
            r'^(?:export\s+)?(?:interface|type)\s+(\w+)',
            re.MULTILINE
        ),
        # React component (function component pattern)
        "component": re.compile(
            r'^(?:export\s+)?(?:const|function)\s+([A-Z]\w+)\s*[=:]\s*(?:React\.)?(?:FC|FunctionComponent|memo|forwardRef)?',
            re.MULTILINE
        ),
        # Hooks: const useXxx = () =>
        "hook": re.compile(
            r'^(?:export\s+)?(?:const|function)\s+(use[A-Z]\w+)',
            re.MULTILINE
        ),
        # Export default
        "export_default": re.compile(
            r'^export\s+default\s+(?:function\s+)?(\w+)?',
            re.MULTILINE
        ),
    }

    def chunk(self, content: str, file_path: str) -> List[CodeChunk]:
        chunks = []
        lines = content.split('\n')

        # Find all symbol positions
        symbols_found: List[Tuple[str, str, int, int]] = []  # (type, name, start, end)

        for chunk_type, pattern in self.PATTERNS.items():
            for match in pattern.finditer(content):
                name = match.group(1) if match.lastindex else None
                if not name:
                    continue

                start_pos = match.start()
                start_line = content[:start_pos].count('\n')

                # Find the end of this block (matching braces or next top-level)
                end_line = self._find_block_end(lines, start_line)

                symbols_found.append((chunk_type, name, start_line, end_line))

        # Sort by start line and remove overlaps (keep larger blocks)
        symbols_found.sort(key=lambda x: (x[2], -(x[3] - x[2])))

        covered_lines = set()
        for chunk_type, name, start_line, end_line in symbols_found:
            # Skip if this block's start is already covered
            if start_line in covered_lines:
                continue

            chunk_lines = lines[start_line:end_line + 1]
            chunk_content = '\n'.join(chunk_lines)

            # Extract all symbols in this chunk
            chunk_symbols = self._extract_symbols(chunk_content)

            chunks.append(CodeChunk(
                content=chunk_content,
                chunk_type=chunk_type,
                name=name,
                start_line=start_line + 1,  # 1-indexed
                end_line=end_line + 1,
                language=self.LANGUAGE,
                symbols=chunk_symbols,
            ))

            # Mark these lines as covered
            for line in range(start_line, end_line + 1):
                covered_lines.add(line)

        return chunks

    def _find_block_end(self, lines: List[str], start_line: int) -> int:
        """Find the end of a code block using brace matching."""
        brace_count = 0
        started = False

        for i in range(start_line, len(lines)):
            line = lines[i]
            for char in line:
                if char == '{':
                    brace_count += 1
                    started = True
                elif char == '}':
                    brace_count -= 1

            if started and brace_count == 0:
                return i

        # If no closing brace found, return a reasonable chunk
        return min(start_line + 50, len(lines) - 1)

    def _extract_symbols(self, content: str) -> List[str]:
        """Extract all symbol names from a chunk."""
        symbols = []
        for pattern in self.PATTERNS.values():
            for match in pattern.finditer(content):
                if match.lastindex and match.group(1):
                    symbols.append(match.group(1))
        return list(set(symbols))


class SwiftChunker(BaseChunker):
    """
    Swift chunker with AST-aware parsing.
    Extracts: structs, classes, functions, extensions, protocols.
    """

    LANGUAGE = "swift"

    PATTERNS = {
        # Struct declarations
        "struct": re.compile(
            r'^(?:public\s+|private\s+|internal\s+|fileprivate\s+)?struct\s+(\w+)',
            re.MULTILINE
        ),
        # Class declarations
        "class": re.compile(
            r'^(?:public\s+|private\s+|internal\s+|fileprivate\s+)?(?:final\s+)?class\s+(\w+)',
            re.MULTILINE
        ),
        # Function declarations
        "function": re.compile(
            r'^(?:\s*)(?:public\s+|private\s+|internal\s+|fileprivate\s+)?(?:static\s+)?(?:@\w+\s+)*func\s+(\w+)',
            re.MULTILINE
        ),
        # Protocol declarations
        "protocol": re.compile(
            r'^(?:public\s+|private\s+)?protocol\s+(\w+)',
            re.MULTILINE
        ),
        # Extension declarations
        "extension": re.compile(
            r'^(?:public\s+|private\s+)?extension\s+(\w+)',
            re.MULTILINE
        ),
        # Enum declarations
        "enum": re.compile(
            r'^(?:public\s+|private\s+|internal\s+)?enum\s+(\w+)',
            re.MULTILINE
        ),
        # Computed properties
        "property": re.compile(
            r'^(?:\s*)(?:public\s+|private\s+)?(?:static\s+)?(?:var|let)\s+(\w+)\s*:',
            re.MULTILINE
        ),
    }

    def chunk(self, content: str, file_path: str) -> List[CodeChunk]:
        chunks = []
        lines = content.split('\n')

        symbols_found: List[Tuple[str, str, int, int]] = []

        for chunk_type, pattern in self.PATTERNS.items():
            for match in pattern.finditer(content):
                name = match.group(1) if match.lastindex else None
                if not name:
                    continue

                start_pos = match.start()
                start_line = content[:start_pos].count('\n')
                end_line = self._find_block_end(lines, start_line)

                symbols_found.append((chunk_type, name, start_line, end_line))

        symbols_found.sort(key=lambda x: (x[2], -(x[3] - x[2])))

        covered_lines = set()
        for chunk_type, name, start_line, end_line in symbols_found:
            if start_line in covered_lines:
                continue

            chunk_lines = lines[start_line:end_line + 1]
            chunk_content = '\n'.join(chunk_lines)
            chunk_symbols = self._extract_symbols(chunk_content)

            chunks.append(CodeChunk(
                content=chunk_content,
                chunk_type=chunk_type,
                name=name,
                start_line=start_line + 1,
                end_line=end_line + 1,
                language=self.LANGUAGE,
                symbols=chunk_symbols,
            ))

            for line in range(start_line, end_line + 1):
                covered_lines.add(line)

        return chunks

    def _find_block_end(self, lines: List[str], start_line: int) -> int:
        """Find the end of a Swift code block."""
        brace_count = 0
        started = False

        for i in range(start_line, len(lines)):
            line = lines[i]
            for char in line:
                if char == '{':
                    brace_count += 1
                    started = True
                elif char == '}':
                    brace_count -= 1

            if started and brace_count == 0:
                return i

        return min(start_line + 50, len(lines) - 1)

    def _extract_symbols(self, content: str) -> List[str]:
        symbols = []
        for pattern in self.PATTERNS.values():
            for match in pattern.finditer(content):
                if match.lastindex and match.group(1):
                    symbols.append(match.group(1))
        return list(set(symbols))


class PythonChunker(BaseChunker):
    """
    Python chunker with indentation-aware parsing.
    Extracts: functions, classes, methods, decorators.
    """

    LANGUAGE = "python"

    PATTERNS = {
        # Function/method definitions
        "function": re.compile(
            r'^(?:@\w+.*\n)*def\s+(\w+)\s*\(',
            re.MULTILINE
        ),
        # Async function definitions
        "async_function": re.compile(
            r'^(?:@\w+.*\n)*async\s+def\s+(\w+)\s*\(',
            re.MULTILINE
        ),
        # Class definitions
        "class": re.compile(
            r'^class\s+(\w+)',
            re.MULTILINE
        ),
    }

    def chunk(self, content: str, file_path: str) -> List[CodeChunk]:
        chunks = []
        lines = content.split('\n')

        symbols_found: List[Tuple[str, str, int, int, Optional[str]]] = []

        # First pass: find classes
        for match in self.PATTERNS["class"].finditer(content):
            name = match.group(1)
            start_pos = match.start()
            start_line = content[:start_pos].count('\n')
            end_line = self._find_python_block_end(lines, start_line)
            symbols_found.append(("class", name, start_line, end_line, None))

        # Second pass: find functions (top-level and methods)
        for pattern_name in ["function", "async_function"]:
            for match in self.PATTERNS[pattern_name].finditer(content):
                name = match.group(1)
                start_pos = match.start()
                start_line = content[:start_pos].count('\n')

                # Determine if this is a method (inside a class)
                parent_class = self._find_parent_class(lines, start_line, symbols_found)

                end_line = self._find_python_block_end(lines, start_line)

                chunk_type = "method" if parent_class else pattern_name.replace("async_", "")
                symbols_found.append((chunk_type, name, start_line, end_line, parent_class))

        # Sort and deduplicate
        symbols_found.sort(key=lambda x: (x[2], -(x[3] - x[2])))

        covered_lines = set()
        for chunk_type, name, start_line, end_line, parent_class in symbols_found:
            if start_line in covered_lines and chunk_type != "class":
                continue

            chunk_lines = lines[start_line:end_line + 1]
            chunk_content = '\n'.join(chunk_lines)
            chunk_symbols = self._extract_symbols(chunk_content)

            chunks.append(CodeChunk(
                content=chunk_content,
                chunk_type=chunk_type,
                name=name,
                start_line=start_line + 1,
                end_line=end_line + 1,
                parent_name=parent_class,
                language=self.LANGUAGE,
                symbols=chunk_symbols,
            ))

            if chunk_type == "class":
                for line in range(start_line, end_line + 1):
                    covered_lines.add(line)

        return chunks

    def _find_python_block_end(self, lines: List[str], start_line: int) -> int:
        """Find the end of a Python block using indentation."""
        if start_line >= len(lines):
            return start_line

        # Get base indentation of the definition line
        base_indent = len(lines[start_line]) - len(lines[start_line].lstrip())

        for i in range(start_line + 1, len(lines)):
            line = lines[i]
            stripped = line.lstrip()

            # Skip empty lines and comments
            if not stripped or stripped.startswith('#'):
                continue

            current_indent = len(line) - len(stripped)

            # If we hit a line with same or less indentation, block ended
            if current_indent <= base_indent:
                return i - 1

        return len(lines) - 1

    def _find_parent_class(
        self,
        lines: List[str],
        func_line: int,
        symbols: List[Tuple]
    ) -> Optional[str]:
        """Find the class that contains this function (if any)."""
        func_indent = len(lines[func_line]) - len(lines[func_line].lstrip())

        for chunk_type, name, start, end, _ in symbols:
            if chunk_type == "class":
                class_indent = len(lines[start]) - len(lines[start].lstrip())
                if start < func_line <= end and func_indent > class_indent:
                    return name
        return None

    def _extract_symbols(self, content: str) -> List[str]:
        symbols = []
        for pattern in self.PATTERNS.values():
            for match in pattern.finditer(content):
                if match.lastindex and match.group(1):
                    symbols.append(match.group(1))
        return list(set(symbols))


class MarkdownChunker(BaseChunker):
    """
    Markdown chunker for agent specs, command docs, and documentation.
    Extracts: YAML frontmatter, sections (headers), code blocks.
    Designed for ORCA-OS agent/command markdown format.
    """

    LANGUAGE = "markdown"

    # Frontmatter keys that indicate document type
    AGENT_KEYS = {"name", "tools", "weight", "description"}
    COMMAND_KEYS = {"allowed-tools", "argument-hint", "description"}

    def chunk(self, content: str, file_path: str) -> List[CodeChunk]:
        chunks = []
        lines = content.split('\n')

        # Determine document type from path
        doc_type = self._infer_doc_type(file_path)

        # Parse YAML frontmatter (between --- markers)
        frontmatter, fm_end_line = self._parse_frontmatter(lines)
        if frontmatter:
            # Create chunk for frontmatter with extracted name
            name = frontmatter.get('name', Path(file_path).stem)
            chunk_type = "agent" if doc_type == "agent" else "command" if doc_type == "command" else "document"

            fm_content = '\n'.join(lines[0:fm_end_line + 1])
            chunks.append(CodeChunk(
                content=fm_content,
                chunk_type=chunk_type,
                name=name,
                start_line=1,
                end_line=fm_end_line + 1,
                language=self.LANGUAGE,
                symbols=self._extract_frontmatter_symbols(frontmatter),
            ))

        # Parse sections (## headers)
        sections = self._parse_sections(lines, fm_end_line)
        for section in sections:
            # Determine section type
            section_type = self._classify_section(section['title'])

            chunks.append(CodeChunk(
                content=section['content'],
                chunk_type=section_type,
                name=section['title'],
                start_line=section['start_line'],
                end_line=section['end_line'],
                parent_name=frontmatter.get('name') if frontmatter else None,
                language=self.LANGUAGE,
                symbols=[section['title']],
            ))

        return chunks

    def _infer_doc_type(self, file_path: str) -> str:
        """Infer document type from file path."""
        path_lower = file_path.lower()
        if 'agents/' in path_lower or path_lower.endswith('-agent.md'):
            return "agent"
        elif 'commands/' in path_lower:
            return "command"
        elif 'docs/' in path_lower:
            return "documentation"
        elif 'skills/' in path_lower:
            return "skill"
        return "markdown"

    def _parse_frontmatter(self, lines: List[str]) -> Tuple[Optional[Dict[str, Any]], int]:
        """Parse YAML frontmatter between --- markers."""
        if not lines or lines[0].strip() != '---':
            return None, -1

        end_idx = -1
        for i in range(1, len(lines)):
            if lines[i].strip() == '---':
                end_idx = i
                break

        if end_idx == -1:
            return None, -1

        # Parse YAML manually (simple key: value)
        frontmatter = {}
        current_key = None
        current_value_lines = []

        for line in lines[1:end_idx]:
            # Check for key: value pattern
            if ':' in line and not line.startswith(' ') and not line.startswith('\t'):
                # Save previous key if exists
                if current_key:
                    frontmatter[current_key] = self._parse_yaml_value(current_value_lines)

                parts = line.split(':', 1)
                current_key = parts[0].strip()
                value_part = parts[1].strip() if len(parts) > 1 else ''

                if value_part and value_part != '>':
                    current_value_lines = [value_part]
                else:
                    current_value_lines = []
            elif current_key and line.strip():
                # Continuation of previous value
                current_value_lines.append(line.strip().lstrip('- '))

        # Save last key
        if current_key:
            frontmatter[current_key] = self._parse_yaml_value(current_value_lines)

        return frontmatter, end_idx

    def _parse_yaml_value(self, value_lines: List[str]) -> Any:
        """Parse YAML value from lines."""
        if not value_lines:
            return ""
        if len(value_lines) == 1:
            return value_lines[0]
        return value_lines  # Return as list for multi-line/array values

    def _extract_frontmatter_symbols(self, frontmatter: Dict[str, Any]) -> List[str]:
        """Extract searchable symbols from frontmatter."""
        symbols = []
        if 'name' in frontmatter:
            symbols.append(frontmatter['name'])
        if 'tools' in frontmatter:
            tools = frontmatter['tools']
            if isinstance(tools, str):
                symbols.extend([t.strip() for t in tools.split(',')])
            elif isinstance(tools, list):
                symbols.extend(tools)
        if 'allowed-tools' in frontmatter:
            tools = frontmatter['allowed-tools']
            if isinstance(tools, list):
                symbols.extend(tools)
        return symbols

    def _parse_sections(self, lines: List[str], start_after: int) -> List[Dict]:
        """Parse markdown sections (## headers)."""
        sections = []
        current_section = None
        current_lines = []

        for i in range(start_after + 1, len(lines)):
            line = lines[i]

            # Check for header (## or ###)
            if line.startswith('## ') or line.startswith('# '):
                # Save previous section
                if current_section:
                    current_section['content'] = '\n'.join(current_lines)
                    current_section['end_line'] = i
                    sections.append(current_section)

                # Start new section
                header_level = 1 if line.startswith('# ') else 2
                title = line.lstrip('#').strip()
                current_section = {
                    'title': title,
                    'level': header_level,
                    'start_line': i + 1,
                    'end_line': i + 1,
                }
                current_lines = [line]
            elif current_section:
                current_lines.append(line)

        # Save last section
        if current_section:
            current_section['content'] = '\n'.join(current_lines)
            current_section['end_line'] = len(lines)
            sections.append(current_section)

        return sections

    def _classify_section(self, title: str) -> str:
        """Classify section type based on title."""
        title_lower = title.lower()
        if 'usage' in title_lower:
            return "usage"
        elif 'example' in title_lower:
            return "example"
        elif 'protocol' in title_lower or 'step' in title_lower:
            return "protocol"
        elif 'capabilit' in title_lower or 'feature' in title_lower:
            return "capabilities"
        elif 'output' in title_lower or 'format' in title_lower:
            return "output_format"
        elif 'constraint' in title_lower or 'rule' in title_lower or 'critical' in title_lower:
            return "constraints"
        return "section"


# Chunker registry
CHUNKERS: Dict[str, BaseChunker] = {
    ".ts": TypeScriptChunker(),
    ".tsx": TypeScriptChunker(),
    ".js": TypeScriptChunker(),
    ".jsx": TypeScriptChunker(),
    ".swift": SwiftChunker(),
    ".py": PythonChunker(),
    ".md": MarkdownChunker(),
}


def get_chunker(file_path: str) -> Optional[BaseChunker]:
    """Get the appropriate chunker for a file."""
    ext = Path(file_path).suffix.lower()
    return CHUNKERS.get(ext)


# ============================================================
# UTILITIES
# ============================================================

def get_project_root() -> Path:
    """Get project root from git or cwd."""
    try:
        result = subprocess.run(
            ["git", "rev-parse", "--show-toplevel"],
            capture_output=True, text=True, check=True
        )
        return Path(result.stdout.strip())
    except Exception:
        return Path.cwd()


def get_code_index_db_path(project_root: Path) -> Path:
    """Get path to code-index.db for project."""
    return project_root / ".claude" / "memory" / "code-index.db"


def ensure_schema(db_path: Path) -> None:
    """Initialize or upgrade code-index.db schema."""
    schema_sql = Path(__file__).parent.parent / ".claude" / "orchestration" / "temp" / "vibe-db-v2-schema.sql"

    # If schema file doesn't exist, use inline minimal schema
    if not schema_sql.exists():
        schema_sql_content = get_inline_schema()
    else:
        schema_sql_content = schema_sql.read_text()

    db_path.parent.mkdir(parents=True, exist_ok=True)

    con = sqlite3.connect(str(db_path))
    try:
        con.executescript(schema_sql_content)
        con.commit()
        print(f"Schema initialized: {db_path}")
    finally:
        con.close()


def get_inline_schema() -> str:
    """Enhanced schema v2.1 - CODE CONTEXT with symbols and hybrid search."""
    return """
    -- Project snapshots from ProjectContext MCP
    CREATE TABLE IF NOT EXISTS project_snapshots (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_path TEXT NOT NULL,
        snapshot_time TEXT NOT NULL DEFAULT (datetime('now')),
        structure_json TEXT,
        components_json TEXT,
        dependencies_json TEXT,
        metadata_json TEXT
    );

    -- Code chunks with embeddings (for semantic code search)
    CREATE TABLE IF NOT EXISTS code_chunks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_path TEXT NOT NULL,
        file_path TEXT NOT NULL,
        chunk_index INTEGER DEFAULT 0,
        content TEXT NOT NULL,
        language TEXT,
        chunk_type TEXT,
        name TEXT,                -- Symbol name (function/class name)
        parent_name TEXT,         -- Parent symbol (e.g., class for method)
        start_line INTEGER,
        end_line INTEGER,
        embedding BLOB,
        embedding_model TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
    );

    -- Symbol index for fast symbol search (function/class/export names)
    CREATE TABLE IF NOT EXISTS symbols (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_path TEXT NOT NULL,
        file_path TEXT NOT NULL,
        symbol_name TEXT NOT NULL,
        symbol_type TEXT,         -- function, class, component, hook, interface, etc.
        parent_symbol TEXT,       -- For methods: the class they belong to
        language TEXT,
        start_line INTEGER,
        end_line INTEGER,
        chunk_id INTEGER,         -- Reference to code_chunks table
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (chunk_id) REFERENCES code_chunks(id) ON DELETE CASCADE
    );

    -- Symbol name index for fast lookup
    CREATE INDEX IF NOT EXISTS idx_symbols_name ON symbols(symbol_name);
    CREATE INDEX IF NOT EXISTS idx_symbols_type ON symbols(symbol_type);
    CREATE INDEX IF NOT EXISTS idx_symbols_file ON symbols(file_path);

    -- Component registry (for component search)
    CREATE TABLE IF NOT EXISTS components (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_path TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT,
        file_path TEXT NOT NULL,
        props_json TEXT,
        dependencies_json TEXT,
        dependents_json TEXT,
        embedding BLOB,
        embedding_model TEXT,
        updated_at TEXT DEFAULT (datetime('now'))
    );

    -- File index for fast lookups
    CREATE TABLE IF NOT EXISTS file_index (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_path TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_type TEXT,
        size_bytes INTEGER,
        last_modified TEXT,
        content_hash TEXT,
        indexed_at TEXT DEFAULT (datetime('now'))
    );

    -- Sync events (internal tracking)
    CREATE TABLE IF NOT EXISTS sync_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_path TEXT,
        timestamp TEXT NOT NULL DEFAULT (datetime('now')),
        event_type TEXT NOT NULL,
        stats_json TEXT
    );

    -- Metadata
    CREATE TABLE IF NOT EXISTS metadata (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at TEXT DEFAULT (datetime('now'))
    );

    -- FTS for code chunks (includes symbol name)
    CREATE VIRTUAL TABLE IF NOT EXISTS code_chunks_fts USING fts5(
        content, file_path, chunk_type, name,
        content='code_chunks', content_rowid='id'
    );

    -- FTS for symbols
    CREATE VIRTUAL TABLE IF NOT EXISTS symbols_fts USING fts5(
        symbol_name, symbol_type, file_path,
        content='symbols', content_rowid='id'
    );

    -- FTS for components
    CREATE VIRTUAL TABLE IF NOT EXISTS components_fts USING fts5(
        name, type, file_path,
        content='components', content_rowid='id'
    );
    """


# ============================================================
# EMBEDDING FUNCTIONS (M4 Max via Ollama)
# ============================================================

def check_ollama_available() -> bool:
    """Check if Ollama is running and has the embedding model."""
    try:
        import urllib.request
        req = urllib.request.Request(f"{OLLAMA_URL}/api/tags")
        with urllib.request.urlopen(req, timeout=2) as resp:
            data = json.loads(resp.read())
            models = [m.get("name", "") for m in data.get("models", [])]
            return any(EMBEDDING_MODEL in m for m in models)
    except Exception:
        return False


def get_embedding(text: str) -> Optional[bytes]:
    """Generate embedding using Ollama (leverages M4 Max GPU/Neural Engine)."""
    try:
        import urllib.request

        payload = json.dumps({
            "model": EMBEDDING_MODEL,
            "prompt": text[:8000]  # Truncate to model limit
        }).encode()

        req = urllib.request.Request(
            f"{OLLAMA_URL}/api/embeddings",
            data=payload,
            headers={"Content-Type": "application/json"}
        )

        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read())
            embedding = data.get("embedding", [])

            if embedding:
                # Pack as float32 array for SQLite BLOB storage
                return struct.pack(f'{len(embedding)}f', *embedding)
    except Exception as e:
        print(f"Embedding failed: {e}", file=sys.stderr)

    return None


def blob_to_vector(blob: bytes) -> List[float]:
    """Convert BLOB back to float array."""
    n = len(blob) // 4  # float32 = 4 bytes
    return list(struct.unpack(f'{n}f', blob))


def cosine_similarity(a: List[float], b: List[float]) -> float:
    """Compute cosine similarity between two vectors."""
    import math
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = math.sqrt(sum(x * x for x in a))
    norm_b = math.sqrt(sum(x * x for x in b))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)


# ============================================================
# SYNC FUNCTIONS
# ============================================================

def sync_from_project_context(
    project_root: Path,
    db_path: Path,
    generate_embeddings: bool = False
) -> Dict[str, int]:
    """
    Enhanced sync with language-specific chunking and symbol extraction.

    Uses TypeScript, Swift, and Python chunkers for AST-aware parsing.
    Extracts symbols (function/class names) for symbol search.
    """
    stats = {"components": 0, "code_chunks": 0, "symbols": 0, "files": 0}

    con = sqlite3.connect(str(db_path))
    project_str = str(project_root)

    # File patterns to scan (language-specific)
    FILE_PATTERNS = [
        # TypeScript/JavaScript
        ("src/**/*.ts", "typescript"),
        ("src/**/*.tsx", "typescript"),
        ("src/**/*.js", "javascript"),
        ("src/**/*.jsx", "javascript"),
        ("app/**/*.ts", "typescript"),
        ("app/**/*.tsx", "typescript"),
        ("components/**/*.tsx", "typescript"),
        ("lib/**/*.ts", "typescript"),
        ("hooks/**/*.ts", "typescript"),
        ("utils/**/*.ts", "typescript"),
        # Swift
        ("**/*.swift", "swift"),
        # Python
        ("**/*.py", "python"),
        ("src/**/*.py", "python"),
        # Markdown (agents, commands, docs)
        ("agents/**/*.md", "markdown"),
        ("commands/*.md", "markdown"),
        ("docs/**/*.md", "markdown"),
        ("skills/*.md", "markdown"),
    ]

    try:
        import glob as globmod

        # Clear existing chunks and symbols for this project
        con.execute("DELETE FROM code_chunks WHERE project_path = ?", (project_str,))
        con.execute("DELETE FROM symbols WHERE project_path = ?", (project_str,))
        con.commit()

        processed_files = set()

        for pattern, language in FILE_PATTERNS:
            for file_path in globmod.glob(str(project_root / pattern), recursive=True):
                # Skip if already processed or in excluded dirs
                if file_path in processed_files:
                    continue
                if any(ex in file_path for ex in ['node_modules', '.git', '__pycache__', 'dist', 'build', '_explore', '.archived', 'crawl4ai-main']):
                    continue

                processed_files.add(file_path)
                rel_path = os.path.relpath(file_path, project_root)

                # Read file content
                try:
                    content = Path(file_path).read_text(encoding='utf-8')
                except Exception as e:
                    print(f"  Skip {rel_path}: {e}", file=sys.stderr)
                    continue

                stats["files"] += 1

                # Get language-specific chunker
                chunker = get_chunker(file_path)

                if chunker:
                    # Use language-specific chunking
                    chunks = chunker.chunk(content, rel_path)

                    for i, chunk in enumerate(chunks):
                        # Generate embedding if requested
                        embedding = None
                        if generate_embeddings and chunk.content:
                            # Include symbol name in embedding context
                            embed_text = f"{chunk.name}: {chunk.content[:2000]}"
                            embedding = get_embedding(embed_text)

                        # Insert code chunk
                        cursor = con.execute("""
                            INSERT INTO code_chunks
                            (project_path, file_path, chunk_index, content, language,
                             chunk_type, name, parent_name, start_line, end_line,
                             embedding, embedding_model, updated_at)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
                        """, (
                            project_str, rel_path, i, chunk.content, chunk.language,
                            chunk.chunk_type, chunk.name, chunk.parent_name,
                            chunk.start_line, chunk.end_line,
                            embedding, EMBEDDING_MODEL if embedding else None
                        ))
                        chunk_id = cursor.lastrowid
                        stats["code_chunks"] += 1

                        # Insert symbols for this chunk
                        for symbol_name in chunk.symbols:
                            con.execute("""
                                INSERT INTO symbols
                                (project_path, file_path, symbol_name, symbol_type,
                                 parent_symbol, language, start_line, end_line, chunk_id)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                            """, (
                                project_str, rel_path, symbol_name, chunk.chunk_type,
                                chunk.parent_name, chunk.language,
                                chunk.start_line, chunk.end_line, chunk_id
                            ))
                            stats["symbols"] += 1
                else:
                    # Fallback: simple chunking for unknown languages
                    chunk_content = content[:4000]
                    name = Path(file_path).stem

                    embedding = None
                    if generate_embeddings and chunk_content:
                        embedding = get_embedding(f"{name}: {chunk_content[:2000]}")

                    con.execute("""
                        INSERT INTO code_chunks
                        (project_path, file_path, chunk_index, content, language,
                         chunk_type, name, start_line, end_line,
                         embedding, embedding_model, updated_at)
                        VALUES (?, ?, 0, ?, ?, 'file', ?, 1, ?, ?, ?, datetime('now'))
                    """, (
                        project_str, rel_path, chunk_content, language,
                        name, content.count('\n') + 1,
                        embedding, EMBEDDING_MODEL if embedding else None
                    ))
                    stats["code_chunks"] += 1

        # Also sync legacy component patterns for backward compatibility
        for pattern, comp_type in [
            ("src/components/**/*.tsx", "component"),
            ("src/pages/**/*.tsx", "page"),
            ("src/app/**/*.tsx", "page"),
            ("components/**/*.tsx", "component"),
        ]:
            for file_path in globmod.glob(str(project_root / pattern), recursive=True):
                if any(ex in file_path for ex in ['node_modules', '.git', '_explore', '.archived', 'crawl4ai-main']):
                    continue

                rel_path = os.path.relpath(file_path, project_root)
                name = Path(file_path).stem

                try:
                    content = Path(file_path).read_text()[:4000]
                except Exception:
                    content = ""

                embedding = None
                if generate_embeddings and content:
                    embedding = get_embedding(f"{name}: {content[:2000]}")

                con.execute("""
                    INSERT OR REPLACE INTO components
                    (project_path, name, type, file_path, embedding, embedding_model, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
                """, (
                    project_str, name, comp_type, rel_path,
                    embedding, EMBEDDING_MODEL if embedding else None
                ))
                stats["components"] += 1

        con.commit()

        # Rebuild FTS indexes
        try:
            con.execute("INSERT INTO code_chunks_fts(code_chunks_fts) VALUES('rebuild')")
            con.execute("INSERT INTO symbols_fts(symbols_fts) VALUES('rebuild')")
            con.execute("INSERT INTO components_fts(components_fts) VALUES('rebuild')")
            con.commit()
        except Exception:
            pass  # FTS tables might not exist yet

        # Log sync event
        con.execute("""
            INSERT INTO sync_events (project_path, event_type, stats_json)
            VALUES (?, 'sync_v2', ?)
        """, (project_str, json.dumps(stats)))
        con.commit()

    finally:
        con.close()

    return stats


# ============================================================
# SEARCH FUNCTIONS
# ============================================================

def symbol_search(db_path: Path, query: str, limit: int = 20) -> List[Dict]:
    """
    Search for symbols (function/class/component names).
    Supports exact match, prefix match, and fuzzy match.
    """
    results = []
    con = sqlite3.connect(str(db_path))
    con.row_factory = sqlite3.Row

    try:
        # Exact match (highest priority)
        rows = con.execute("""
            SELECT s.*, c.content
            FROM symbols s
            LEFT JOIN code_chunks c ON s.chunk_id = c.id
            WHERE s.symbol_name = ?
            LIMIT ?
        """, (query, limit)).fetchall()

        for r in rows:
            results.append({
                "type": "symbol",
                "name": r["symbol_name"],
                "symbol_type": r["symbol_type"],
                "file_path": r["file_path"],
                "line": r["start_line"],
                "parent": r["parent_symbol"],
                "language": r["language"],
                "content": (r["content"] or "")[:200],
                "score": 1.0,
                "match_type": "exact"
            })

        # Prefix match
        if len(results) < limit:
            rows = con.execute("""
                SELECT s.*, c.content
                FROM symbols s
                LEFT JOIN code_chunks c ON s.chunk_id = c.id
                WHERE s.symbol_name LIKE ? AND s.symbol_name != ?
                LIMIT ?
            """, (f"{query}%", query, limit - len(results))).fetchall()

            for r in rows:
                results.append({
                    "type": "symbol",
                    "name": r["symbol_name"],
                    "symbol_type": r["symbol_type"],
                    "file_path": r["file_path"],
                    "line": r["start_line"],
                    "parent": r["parent_symbol"],
                    "language": r["language"],
                    "content": (r["content"] or "")[:200],
                    "score": 0.8,
                    "match_type": "prefix"
                })

        # Fuzzy/contains match
        if len(results) < limit:
            rows = con.execute("""
                SELECT s.*, c.content
                FROM symbols s
                LEFT JOIN code_chunks c ON s.chunk_id = c.id
                WHERE s.symbol_name LIKE ? AND s.symbol_name NOT LIKE ?
                LIMIT ?
            """, (f"%{query}%", f"{query}%", limit - len(results))).fetchall()

            for r in rows:
                results.append({
                    "type": "symbol",
                    "name": r["symbol_name"],
                    "symbol_type": r["symbol_type"],
                    "file_path": r["file_path"],
                    "line": r["start_line"],
                    "parent": r["parent_symbol"],
                    "language": r["language"],
                    "content": (r["content"] or "")[:200],
                    "score": 0.5,
                    "match_type": "contains"
                })

        # Case-insensitive match for camelCase
        if len(results) < limit:
            rows = con.execute("""
                SELECT s.*, c.content
                FROM symbols s
                LEFT JOIN code_chunks c ON s.chunk_id = c.id
                WHERE LOWER(s.symbol_name) LIKE LOWER(?)
                  AND s.symbol_name NOT LIKE ?
                  AND s.symbol_name NOT LIKE ?
                LIMIT ?
            """, (f"%{query}%", f"{query}%", f"%{query}%", limit - len(results))).fetchall()

            for r in rows:
                results.append({
                    "type": "symbol",
                    "name": r["symbol_name"],
                    "symbol_type": r["symbol_type"],
                    "file_path": r["file_path"],
                    "line": r["start_line"],
                    "parent": r["parent_symbol"],
                    "language": r["language"],
                    "content": (r["content"] or "")[:200],
                    "score": 0.4,
                    "match_type": "case_insensitive"
                })

    finally:
        con.close()

    # Sort by score and deduplicate
    seen = set()
    unique_results = []
    for r in sorted(results, key=lambda x: -x["score"]):
        key = (r["name"], r["file_path"], r["line"])
        if key not in seen:
            seen.add(key)
            unique_results.append(r)

    return unique_results[:limit]


def text_search(db_path: Path, query: str, limit: int = 10) -> List[Dict]:
    """FTS5 text search across code chunks and components."""
    results = []
    con = sqlite3.connect(str(db_path))
    con.row_factory = sqlite3.Row

    try:
        # Search code chunks with FTS
        try:
            rows = con.execute("""
                SELECT c.*, highlight(code_chunks_fts, 0, '>>>', '<<<') as highlight
                FROM code_chunks c
                JOIN code_chunks_fts ON c.id = code_chunks_fts.rowid
                WHERE code_chunks_fts MATCH ?
                LIMIT ?
            """, (query, limit)).fetchall()

            for r in rows:
                results.append({
                    "type": "code_chunk",
                    "name": r["name"],
                    "file_path": r["file_path"],
                    "chunk_type": r["chunk_type"],
                    "line": r["start_line"],
                    "highlight": r["highlight"][:200] if r["highlight"] else "",
                    "score": 1.0
                })
        except Exception:
            pass

        # Fallback: LIKE search on code chunks
        if len(results) < limit:
            try:
                pattern = f"%{query}%"
                rows = con.execute("""
                    SELECT * FROM code_chunks
                    WHERE content LIKE ? OR name LIKE ?
                    LIMIT ?
                """, (pattern, pattern, limit - len(results))).fetchall()

                for r in rows:
                    if not any(
                        x["file_path"] == r["file_path"] and x["line"] == r["start_line"]
                        for x in results
                    ):
                        results.append({
                            "type": "code_chunk",
                            "name": r["name"],
                            "file_path": r["file_path"],
                            "chunk_type": r["chunk_type"],
                            "line": r["start_line"],
                            "highlight": (r["content"] or "")[:100],
                            "score": 0.6
                        })
            except Exception:
                pass

        # Search components
        try:
            pattern = f"%{query}%"
            rows = con.execute("""
                SELECT * FROM components
                WHERE name LIKE ? OR file_path LIKE ? OR type LIKE ?
                LIMIT ?
            """, (pattern, pattern, pattern, limit)).fetchall()

            for r in rows:
                results.append({
                    "type": "component",
                    "name": r["name"],
                    "comp_type": r["type"],
                    "file_path": r["file_path"],
                    "score": 0.8
                })
        except Exception:
            pass

    finally:
        con.close()

    return results


def hybrid_search(
    db_path: Path,
    query: str,
    limit: int = 10,
    weights: Optional[Dict[str, float]] = None
) -> List[Dict]:
    """
    Hybrid search combining semantic, symbol, and full-text search.

    Results are ranked using weighted scoring:
    - semantic: Embedding similarity (0.4)
    - symbol: Function/class name match (0.35)
    - fulltext: FTS5 keyword match (0.25)

    Returns combined, deduplicated results sorted by final score.
    """
    if weights is None:
        weights = SEARCH_WEIGHTS

    all_results: Dict[str, Dict] = {}  # key: (file_path, line) -> result

    # 1. Symbol search (fast, high precision for function/class names)
    symbol_results = symbol_search(db_path, query, limit=limit * 2)
    for r in symbol_results:
        key = f"{r['file_path']}:{r.get('line', 0)}"
        if key not in all_results:
            all_results[key] = {
                "type": r["type"],
                "name": r.get("name", ""),
                "file_path": r["file_path"],
                "line": r.get("line"),
                "chunk_type": r.get("symbol_type"),
                "content": r.get("content", "")[:200],
                "scores": {"semantic": 0, "symbol": 0, "fulltext": 0},
                "match_types": []
            }
        all_results[key]["scores"]["symbol"] = r["score"]
        all_results[key]["match_types"].append(f"symbol:{r.get('match_type', 'match')}")

    # 2. Full-text search (good for keyword matches)
    text_results = text_search(db_path, query, limit=limit * 2)
    for r in text_results:
        key = f"{r['file_path']}:{r.get('line', 0)}"
        if key not in all_results:
            all_results[key] = {
                "type": r["type"],
                "name": r.get("name", ""),
                "file_path": r["file_path"],
                "line": r.get("line"),
                "chunk_type": r.get("chunk_type"),
                "content": r.get("highlight", "")[:200],
                "scores": {"semantic": 0, "symbol": 0, "fulltext": 0},
                "match_types": []
            }
        all_results[key]["scores"]["fulltext"] = r["score"]
        all_results[key]["match_types"].append("fulltext")

    # 3. Semantic/vector search (if embeddings available)
    try:
        semantic_results = vector_search(db_path, query, limit=limit * 2)
        for r in semantic_results:
            key = f"{r['file_path']}:{r.get('line', 0)}"
            if key not in all_results:
                all_results[key] = {
                    "type": r["type"],
                    "name": r.get("name", ""),
                    "file_path": r["file_path"],
                    "line": r.get("line"),
                    "chunk_type": r.get("chunk_type"),
                    "content": r.get("content", "")[:200],
                    "scores": {"semantic": 0, "symbol": 0, "fulltext": 0},
                    "match_types": []
                }
            all_results[key]["scores"]["semantic"] = r["score"]
            all_results[key]["match_types"].append("semantic")
    except Exception:
        pass  # Semantic search not available

    # 4. Calculate weighted final scores
    final_results = []
    for key, result in all_results.items():
        scores = result["scores"]
        final_score = (
            scores["semantic"] * weights.get("semantic", 0.4) +
            scores["symbol"] * weights.get("symbol", 0.35) +
            scores["fulltext"] * weights.get("fulltext", 0.25)
        )

        # Boost if matched by multiple search types
        match_count = sum(1 for s in scores.values() if s > 0)
        if match_count > 1:
            final_score *= (1 + 0.1 * (match_count - 1))

        final_results.append({
            "type": result["type"],
            "name": result["name"],
            "file_path": result["file_path"],
            "line": result["line"],
            "chunk_type": result["chunk_type"],
            "content": result["content"],
            "score": round(final_score, 3),
            "breakdown": {k: round(v, 3) for k, v in scores.items()},
            "match_types": result["match_types"]
        })

    # Sort by final score
    final_results.sort(key=lambda x: -x["score"])

    return final_results[:limit]


def vector_search(db_path: Path, query: str, limit: int = 10) -> List[Dict]:
    """Vector similarity search using embeddings."""
    if not check_ollama_available():
        print("Ollama not available. Run: ollama pull nomic-embed-text", file=sys.stderr)
        return []

    query_embedding = get_embedding(query)
    if not query_embedding:
        return []

    query_vec = blob_to_vector(query_embedding)
    results = []

    con = sqlite3.connect(str(db_path))
    con.row_factory = sqlite3.Row

    try:
        # Search components with embeddings
        rows = con.execute("""
            SELECT * FROM components WHERE embedding IS NOT NULL
        """).fetchall()

        for r in rows:
            if r["embedding"]:
                vec = blob_to_vector(r["embedding"])
                score = cosine_similarity(query_vec, vec)
                results.append({
                    "type": "component",
                    "name": r["name"],
                    "comp_type": r["type"],
                    "file_path": r["file_path"],
                    "score": score
                })

        # Search code chunks with embeddings
        rows = con.execute("""
            SELECT * FROM code_chunks WHERE embedding IS NOT NULL
        """).fetchall()

        for r in rows:
            if r["embedding"]:
                vec = blob_to_vector(r["embedding"])
                score = cosine_similarity(query_vec, vec)
                results.append({
                    "type": "code_chunk",
                    "file_path": r["file_path"],
                    "chunk_type": r["chunk_type"],
                    "content": (r["content"] or "")[:100],
                    "score": score
                })

        # Sort by score descending
        results.sort(key=lambda x: x["score"], reverse=True)

    finally:
        con.close()

    return results[:limit]


# ============================================================
# CLI
# ============================================================

def main():
    parser = argparse.ArgumentParser(
        description="vibe-sync v2.0 - Enhanced code context with hybrid search"
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    # init
    init_parser = subparsers.add_parser("init", help="Initialize/upgrade code-index.db schema")

    # sync
    sync_parser = subparsers.add_parser("sync", help="Sync project with language-aware chunking")
    sync_parser.add_argument("--embeddings", action="store_true", help="Generate embeddings (requires Ollama)")
    sync_parser.add_argument("--project", type=str, help="Project path (default: auto-detect)")

    # hsearch - hybrid search (NEW)
    hsearch_parser = subparsers.add_parser("hsearch", help="Hybrid search (semantic + symbol + text)")
    hsearch_parser.add_argument("query", help="Search query")
    hsearch_parser.add_argument("--limit", type=int, default=10)
    hsearch_parser.add_argument("--json", action="store_true")

    # symbol - symbol search (NEW)
    symbol_parser = subparsers.add_parser("symbol", help="Search function/class/component names")
    symbol_parser.add_argument("query", help="Symbol name to search")
    symbol_parser.add_argument("--limit", type=int, default=20)
    symbol_parser.add_argument("--json", action="store_true")

    # search - text search
    search_parser = subparsers.add_parser("search", help="Full-text search code-index.db")
    search_parser.add_argument("query", help="Search query")
    search_parser.add_argument("--limit", type=int, default=10)
    search_parser.add_argument("--json", action="store_true")

    # vsearch - vector search
    vsearch_parser = subparsers.add_parser("vsearch", help="Semantic/vector search code-index.db")
    vsearch_parser.add_argument("query", help="Search query")
    vsearch_parser.add_argument("--limit", type=int, default=10)
    vsearch_parser.add_argument("--json", action="store_true")

    # status
    status_parser = subparsers.add_parser("status", help="Show code-index.db status")

    args = parser.parse_args()

    project_root = Path(args.project) if hasattr(args, 'project') and args.project else get_project_root()
    db_path = get_code_index_db_path(project_root)

    if args.command == "init":
        ensure_schema(db_path)
        print(f"Initialized: {db_path}")

    elif args.command == "sync":
        ensure_schema(db_path)

        if args.embeddings and not check_ollama_available():
            print(f"Warning: Ollama not available. Run: ollama pull {EMBEDDING_MODEL}")
            print("Continuing without embeddings...")
            args.embeddings = False

        stats = sync_from_project_context(project_root, db_path, args.embeddings)
        print(f"Synced: {stats}")

    elif args.command == "hsearch":
        # Hybrid search (NEW)
        if not db_path.exists():
            print(f"code-index.db not found: {db_path}", file=sys.stderr)
            return 1

        results = hybrid_search(db_path, args.query, args.limit)

        if args.json:
            print(json.dumps(results, indent=2))
        else:
            print(f"Hybrid search results for: {args.query}")
            print("=" * 60)
            for r in results:
                match_str = ", ".join(r.get("match_types", []))
                print(f"[{r['chunk_type'] or r['type']}] {r['name'] or 'unnamed'}")
                print(f"  File: {r['file_path']}:{r.get('line', '?')}")
                print(f"  Score: {r['score']:.3f} (breakdown: {r.get('breakdown', {})})")
                print(f"  Matched by: {match_str}")
                if r.get('content'):
                    print(f"  Preview: {r['content'][:80]}...")
                print()

    elif args.command == "symbol":
        # Symbol search (NEW)
        if not db_path.exists():
            print(f"code-index.db not found: {db_path}", file=sys.stderr)
            return 1

        results = symbol_search(db_path, args.query, args.limit)

        if args.json:
            print(json.dumps(results, indent=2))
        else:
            print(f"Symbol search results for: {args.query}")
            print("=" * 60)
            for r in results:
                parent_str = f" (in {r['parent']})" if r.get('parent') else ""
                print(f"[{r['symbol_type']}] {r['name']}{parent_str}")
                print(f"  File: {r['file_path']}:{r['line']}")
                print(f"  Language: {r['language']} | Match: {r['match_type']} (score: {r['score']:.2f})")
                if r.get('content'):
                    first_line = r['content'].split('\n')[0][:60]
                    print(f"  Preview: {first_line}...")
                print()

    elif args.command == "search":
        if not db_path.exists():
            print(f"code-index.db not found: {db_path}", file=sys.stderr)
            return 1

        results = text_search(db_path, args.query, args.limit)

        if args.json:
            print(json.dumps(results, indent=2))
        else:
            for r in results:
                print(f"[{r['type']}] {r.get('name', r.get('file_path', ''))} (score: {r['score']:.2f})")
                if r.get('highlight'):
                    print(f"  {r['highlight'][:100]}")
                print()

    elif args.command == "vsearch":
        if not db_path.exists():
            print(f"code-index.db not found: {db_path}", file=sys.stderr)
            return 1

        results = vector_search(db_path, args.query, args.limit)

        if args.json:
            print(json.dumps(results, indent=2))
        else:
            for r in results:
                print(f"[{r['type']}] {r.get('name', r.get('file_path', ''))} (similarity: {r['score']:.3f})")
                print()

    elif args.command == "status":
        if not db_path.exists():
            print(f"code-index.db not found: {db_path}")
            return 1

        con = sqlite3.connect(str(db_path))
        try:
            counts = {}
            # Code context tables
            for table in ["components", "code_chunks", "symbols", "file_index", "sync_events", "project_snapshots"]:
                try:
                    row = con.execute(f"SELECT COUNT(*) FROM {table}").fetchone()
                    counts[table] = row[0]
                except Exception:
                    counts[table] = 0

            # Check embeddings
            try:
                row = con.execute("SELECT COUNT(*) FROM components WHERE embedding IS NOT NULL").fetchone()
                counts["with_embeddings"] = row[0]
            except Exception:
                counts["with_embeddings"] = 0

            try:
                row = con.execute("SELECT COUNT(*) FROM code_chunks WHERE embedding IS NOT NULL").fetchone()
                counts["chunks_with_embeddings"] = row[0]
            except Exception:
                counts["chunks_with_embeddings"] = 0

            # Symbol type breakdown
            symbol_types = {}
            try:
                rows = con.execute("""
                    SELECT symbol_type, COUNT(*) as cnt
                    FROM symbols
                    GROUP BY symbol_type
                    ORDER BY cnt DESC
                """).fetchall()
                for row in rows:
                    symbol_types[row[0] or "unknown"] = row[1]
            except Exception:
                pass

            # Language breakdown
            languages = {}
            try:
                rows = con.execute("""
                    SELECT language, COUNT(*) as cnt
                    FROM code_chunks
                    WHERE language IS NOT NULL
                    GROUP BY language
                    ORDER BY cnt DESC
                """).fetchall()
                for row in rows:
                    languages[row[0]] = row[1]
            except Exception:
                pass

            print(f"code-index.db v2.1 status: {db_path}")
            print(f"  Size: {db_path.stat().st_size / 1024:.1f} KB")
            print()
            print("Code Context:")
            print(f"  code_chunks: {counts['code_chunks']} ({counts['chunks_with_embeddings']} with embeddings)")
            print(f"  symbols: {counts['symbols']}")
            print(f"  components: {counts['components']} ({counts['with_embeddings']} with embeddings)")
            print()

            if symbol_types:
                print("Symbol Types:")
                for st, cnt in list(symbol_types.items())[:6]:
                    print(f"  {st}: {cnt}")
                print()

            if languages:
                print("Languages:")
                for lang, cnt in languages.items():
                    print(f"  {lang}: {cnt} chunks")
                print()

            print("Search Capabilities:")
            print(f"  Hybrid search: enabled (weights: {SEARCH_WEIGHTS})")
            print(f"  Symbol search: enabled ({counts['symbols']} symbols)")
            print(f"  Full-text search: enabled (FTS5)")
            if check_ollama_available():
                print(f"  Semantic search: enabled ({EMBEDDING_MODEL})")
            else:
                print(f"  Semantic search: disabled (run: ollama pull {EMBEDDING_MODEL})")

        finally:
            con.close()

    return 0


if __name__ == "__main__":
    sys.exit(main())
