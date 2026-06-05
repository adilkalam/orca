#!/usr/bin/env python3
"""
shopify-code-index.py v1.0
==========================

Shopify theme code indexer for ORCA-OS with:
- Section-aware Liquid parsing (schema blocks, render/include refs, comments)
- CSS chunking (selectors, custom properties, @media, @keyframes)
- JSON template parsing (section references, settings schema)
- FTS5 full-text search
- Cross-reference tracking (render, include, section_type)
- Schema settings extraction for fast setting lookup

Usage:
    # Sync Shopify theme with language-aware chunking
    python3 ~/.claude/scripts/shopify-code-index.py sync

    # Full-text search
    python3 ~/.claude/scripts/shopify-code-index.py search "product"

    # Symbol search (sections, settings, CSS props)
    python3 ~/.claude/scripts/shopify-code-index.py symbol "color"

    # Cross-reference lookup
    python3 ~/.claude/scripts/shopify-code-index.py refs "product-card"

    # Schema settings search
    python3 ~/.claude/scripts/shopify-code-index.py schema --type color

    # Show status
    python3 ~/.claude/scripts/shopify-code-index.py status

Install location: ~/.claude/scripts/shopify-code-index.py
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sqlite3
import subprocess
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple


# ============================================================
# CONFIGURATION
# ============================================================

SCHEMA_VERSION = "1.0.0"

# File patterns to index
FILE_PATTERNS = [
    "**/*.liquid",
    "**/*.css",
    "**/*.json",
]

# Directories/files to exclude
EXCLUDES = [
    "node_modules",
    ".git",
    "config/settings_data.json",
    "__pycache__",
    ".claude",
]


# ============================================================
# DATA CLASSES
# ============================================================

@dataclass
class CodeChunk:
    """Represents a parsed code chunk with metadata."""
    content: str
    chunk_type: str
    name: str
    start_line: int
    end_line: int
    language: str
    symbols: List[str] = field(default_factory=list)


@dataclass
class CrossReference:
    """Represents a cross-reference between files."""
    source_file: str
    source_line: int
    target_name: str
    ref_type: str  # render, include, section_type


@dataclass
class SchemaSetting:
    """Represents a schema setting extracted from a section."""
    section_file: str
    setting_id: str
    setting_type: str
    setting_label: Optional[str]
    default_value: Optional[str]
    block_type: Optional[str]  # None for section-level settings


# ============================================================
# CHUNKERS
# ============================================================

class LiquidChunker:
    """
    Liquid file chunker with section-aware parsing.
    Extracts: schema blocks, comment blocks, template body, render/include refs.
    """

    LANGUAGE = "liquid"

    # Patterns for cross-references
    RENDER_PATTERN = re.compile(r"""\{%-?\s*render\s+['"]([^'"]+)['"]""")
    INCLUDE_PATTERN = re.compile(r"""\{%-?\s*include\s+['"]([^'"]+)['"]""")

    # Schema block boundaries
    SCHEMA_START = re.compile(r"""\{%-?\s*schema\s*-?%\}""")
    SCHEMA_END = re.compile(r"""\{%-?\s*endschema\s*-?%\}""")

    # Comment block boundaries
    COMMENT_START = re.compile(r"""\{%-?\s*comment\s*-?%\}""")
    COMMENT_END = re.compile(r"""\{%-?\s*endcomment\s*-?%\}""")

    def chunk(self, content: str, file_path: str) -> Tuple[List[CodeChunk], List[CrossReference], List[SchemaSetting]]:
        chunks = []
        refs = []
        settings = []
        lines = content.split("\n")

        # Extract section name from filename
        section_name = Path(file_path).stem

        # Find schema blocks
        schema_ranges = self._find_block_ranges(lines, self.SCHEMA_START, self.SCHEMA_END)
        for start, end in schema_ranges:
            block_content = "\n".join(lines[start:end + 1])
            chunks.append(CodeChunk(
                content=block_content,
                chunk_type="schema",
                name=f"{section_name}:schema",
                start_line=start + 1,
                end_line=end + 1,
                language=self.LANGUAGE,
                symbols=[section_name],
            ))
            # Parse schema JSON for settings
            schema_settings = self._parse_schema_json(lines, start, end, file_path)
            settings.extend(schema_settings)

        # Find comment blocks
        comment_ranges = self._find_block_ranges(lines, self.COMMENT_START, self.COMMENT_END)
        for start, end in comment_ranges:
            block_content = "\n".join(lines[start:end + 1])
            chunks.append(CodeChunk(
                content=block_content,
                chunk_type="comment",
                name=f"{section_name}:comment",
                start_line=start + 1,
                end_line=end + 1,
                language=self.LANGUAGE,
            ))

        # Template body: everything outside schema and comment blocks
        excluded_ranges = sorted(schema_ranges + comment_ranges, key=lambda r: r[0])
        body_ranges = self._get_body_ranges(lines, excluded_ranges)
        for start, end in body_ranges:
            body_content = "\n".join(lines[start:end + 1])
            if body_content.strip():
                chunks.append(CodeChunk(
                    content=body_content,
                    chunk_type="template",
                    name=section_name,
                    start_line=start + 1,
                    end_line=end + 1,
                    language=self.LANGUAGE,
                    symbols=[section_name],
                ))

        # Extract cross-references from entire file
        for i, line in enumerate(lines):
            for match in self.RENDER_PATTERN.finditer(line):
                target = match.group(1)
                refs.append(CrossReference(
                    source_file=file_path,
                    source_line=i + 1,
                    target_name=target,
                    ref_type="render",
                ))
            for match in self.INCLUDE_PATTERN.finditer(line):
                target = match.group(1)
                refs.append(CrossReference(
                    source_file=file_path,
                    source_line=i + 1,
                    target_name=target,
                    ref_type="include",
                ))

        # Add section name as a symbol
        if not chunks:
            # File had no schema/comment blocks -- treat entire file as template
            chunks.append(CodeChunk(
                content=content,
                chunk_type="template",
                name=section_name,
                start_line=1,
                end_line=len(lines),
                language=self.LANGUAGE,
                symbols=[section_name],
            ))

        return chunks, refs, settings

    def _find_block_ranges(
        self, lines: List[str], start_re: re.Pattern, end_re: re.Pattern
    ) -> List[Tuple[int, int]]:
        ranges = []
        i = 0
        while i < len(lines):
            if start_re.search(lines[i]):
                start = i
                for j in range(i, len(lines)):
                    if end_re.search(lines[j]):
                        ranges.append((start, j))
                        i = j + 1
                        break
                else:
                    # No closing tag found -- take rest of file
                    ranges.append((start, len(lines) - 1))
                    break
            else:
                i += 1
        return ranges

    def _get_body_ranges(
        self, lines: List[str], excluded: List[Tuple[int, int]]
    ) -> List[Tuple[int, int]]:
        if not excluded:
            return [(0, len(lines) - 1)]

        ranges = []
        prev_end = 0
        for start, end in excluded:
            if prev_end < start:
                ranges.append((prev_end, start - 1))
            prev_end = end + 1
        if prev_end < len(lines):
            ranges.append((prev_end, len(lines) - 1))
        return ranges

    def _parse_schema_json(
        self, lines: List[str], start: int, end: int, file_path: str
    ) -> List[SchemaSetting]:
        """Extract settings from {% schema %} JSON block."""
        settings = []
        # Find JSON content between the tags
        json_lines = []
        in_json = False
        for i in range(start, end + 1):
            line = lines[i]
            if self.SCHEMA_START.search(line):
                # Take content after the tag on the same line
                after = self.SCHEMA_START.sub("", line).strip()
                if after:
                    json_lines.append(after)
                in_json = True
                continue
            if self.SCHEMA_END.search(line):
                before = self.SCHEMA_END.sub("", line).strip()
                if before:
                    json_lines.append(before)
                break
            if in_json:
                json_lines.append(line)

        json_str = "\n".join(json_lines).strip()
        if not json_str:
            return settings

        try:
            schema = json.loads(json_str)
        except json.JSONDecodeError:
            return settings

        # Extract section-level settings
        for s in schema.get("settings", []):
            if s.get("type") == "header":
                continue
            settings.append(SchemaSetting(
                section_file=file_path,
                setting_id=s.get("id", ""),
                setting_type=s.get("type", ""),
                setting_label=s.get("label", None),
                default_value=json.dumps(s.get("default")) if "default" in s else None,
                block_type=None,
            ))

        # Extract block-level settings
        for block in schema.get("blocks", []):
            block_type = block.get("type", "unknown")
            for s in block.get("settings", []):
                if s.get("type") == "header":
                    continue
                settings.append(SchemaSetting(
                    section_file=file_path,
                    setting_id=s.get("id", ""),
                    setting_type=s.get("type", ""),
                    setting_label=s.get("label", None),
                    default_value=json.dumps(s.get("default")) if "default" in s else None,
                    block_type=block_type,
                ))

        return settings


class CSSChunker:
    """
    CSS chunker with rule-level parsing.
    Extracts: selector blocks, @media blocks, @keyframes, custom properties.
    """

    LANGUAGE = "css"

    # Custom property pattern
    CUSTOM_PROP_PATTERN = re.compile(r"(--[\w-]+)\s*:")
    # Class selector pattern
    CLASS_SELECTOR_PATTERN = re.compile(r"\.([\w-]+)")
    # ID selector pattern
    ID_SELECTOR_PATTERN = re.compile(r"#([\w-]+)")
    # @keyframes pattern
    KEYFRAMES_PATTERN = re.compile(r"@keyframes\s+([\w-]+)")
    # @media pattern
    MEDIA_PATTERN = re.compile(r"@media\s+")

    def chunk(self, content: str, file_path: str) -> Tuple[List[CodeChunk], List[CrossReference], List[SchemaSetting]]:
        chunks = []
        symbols = []
        lines = content.split("\n")

        # Extract top-level rules by brace matching
        i = 0
        while i < len(lines):
            line = lines[i].strip()

            # Skip empty lines and comments
            if not line or line.startswith("/*"):
                # Skip block comments
                if line.startswith("/*"):
                    while i < len(lines) and "*/" not in lines[i]:
                        i += 1
                i += 1
                continue

            # Detect rule start
            if "{" in line or (i + 1 < len(lines) and "{" in lines[i + 1].strip()):
                start_line = i
                brace_count = 0
                started = False

                for j in range(i, len(lines)):
                    for char in lines[j]:
                        if char == "{":
                            brace_count += 1
                            started = True
                        elif char == "}":
                            brace_count -= 1

                    if started and brace_count == 0:
                        block_content = "\n".join(lines[start_line:j + 1])
                        chunk_type, name = self._classify_rule(lines[start_line].strip(), block_content)
                        chunk_symbols = self._extract_symbols(block_content)

                        chunks.append(CodeChunk(
                            content=block_content,
                            chunk_type=chunk_type,
                            name=name,
                            start_line=start_line + 1,
                            end_line=j + 1,
                            language=self.LANGUAGE,
                            symbols=chunk_symbols,
                        ))
                        i = j + 1
                        break
                else:
                    i += 1
            else:
                # Non-rule line (e.g., standalone custom property or import)
                i += 1

        return chunks, [], []

    def _classify_rule(self, first_line: str, content: str) -> Tuple[str, str]:
        """Classify a CSS rule and extract its name."""
        if self.KEYFRAMES_PATTERN.match(first_line):
            match = self.KEYFRAMES_PATTERN.match(first_line)
            return "keyframes", match.group(1)
        if self.MEDIA_PATTERN.match(first_line):
            # Extract media query
            return "media", first_line.split("{")[0].strip()
        if first_line.startswith("@"):
            return "at-rule", first_line.split("{")[0].strip()

        # Regular selector
        selector = first_line.split("{")[0].strip()
        return "selector", selector

    def _extract_symbols(self, content: str) -> List[str]:
        """Extract all symbol names from a CSS block."""
        symbols = []
        for match in self.CUSTOM_PROP_PATTERN.finditer(content):
            symbols.append(match.group(1))
        for match in self.CLASS_SELECTOR_PATTERN.finditer(content.split("{")[0]):
            symbols.append(f".{match.group(1)}")
        for match in self.ID_SELECTOR_PATTERN.finditer(content.split("{")[0]):
            symbols.append(f"#{match.group(1)}")
        for match in self.KEYFRAMES_PATTERN.finditer(content):
            symbols.append(match.group(1))
        return list(set(symbols))


class JSONTemplateParser:
    """
    JSON template and settings_schema parser.
    Extracts: section references from templates, settings from settings_schema.
    """

    LANGUAGE = "json"

    def chunk(self, content: str, file_path: str) -> Tuple[List[CodeChunk], List[CrossReference], List[SchemaSetting]]:
        chunks = []
        refs = []
        settings = []

        try:
            data = json.loads(content)
        except json.JSONDecodeError:
            # If JSON is invalid, store as a single chunk
            lines = content.split("\n")
            chunks.append(CodeChunk(
                content=content,
                chunk_type="json_invalid",
                name=Path(file_path).stem,
                start_line=1,
                end_line=len(lines),
                language=self.LANGUAGE,
            ))
            return chunks, refs, settings

        filename = Path(file_path).name
        rel_dir = str(Path(file_path).parent)

        # templates/*.json -- section references
        if "templates" in rel_dir and isinstance(data, dict):
            sections = data.get("sections", {})
            order = data.get("order", [])

            for section_id, section_data in sections.items():
                section_type = section_data.get("type", "unknown") if isinstance(section_data, dict) else "unknown"
                section_json = json.dumps(section_data, indent=2)
                chunks.append(CodeChunk(
                    content=section_json,
                    chunk_type="json_section",
                    name=f"{Path(file_path).stem}:{section_id}",
                    start_line=1,
                    end_line=section_json.count("\n") + 1,
                    language=self.LANGUAGE,
                    symbols=[section_id, section_type],
                ))
                # Cross-reference to the section type
                refs.append(CrossReference(
                    source_file=file_path,
                    source_line=1,
                    target_name=section_type,
                    ref_type="section_type",
                ))

            if order:
                order_json = json.dumps({"order": order}, indent=2)
                chunks.append(CodeChunk(
                    content=order_json,
                    chunk_type="json_order",
                    name=f"{Path(file_path).stem}:order",
                    start_line=1,
                    end_line=order_json.count("\n") + 1,
                    language=self.LANGUAGE,
                    symbols=[f"order:{o}" for o in order],
                ))

        # config/settings_schema.json -- settings groups
        elif filename == "settings_schema.json" and isinstance(data, list):
            for idx, group in enumerate(data):
                group_name = group.get("name", f"group_{idx}") if isinstance(group, dict) else f"group_{idx}"
                group_json = json.dumps(group, indent=2)
                chunks.append(CodeChunk(
                    content=group_json,
                    chunk_type="json_settings",
                    name=f"settings_schema:{group_name}",
                    start_line=1,
                    end_line=group_json.count("\n") + 1,
                    language=self.LANGUAGE,
                    symbols=[group_name],
                ))
                # Extract settings from group
                if isinstance(group, dict):
                    for s in group.get("settings", []):
                        if isinstance(s, dict) and s.get("type") != "header":
                            settings.append(SchemaSetting(
                                section_file=file_path,
                                setting_id=s.get("id", ""),
                                setting_type=s.get("type", ""),
                                setting_label=s.get("label", None),
                                default_value=json.dumps(s.get("default")) if "default" in s else None,
                                block_type=None,
                            ))

        # Other JSON files -- store as single chunk
        else:
            lines = content.split("\n")
            chunks.append(CodeChunk(
                content=content,
                chunk_type="json_config",
                name=Path(file_path).stem,
                start_line=1,
                end_line=len(lines),
                language=self.LANGUAGE,
                symbols=[Path(file_path).stem],
            ))

        return chunks, refs, settings


# Chunker registry by file extension
CHUNKERS = {
    ".liquid": LiquidChunker(),
    ".css": CSSChunker(),
    ".json": JSONTemplateParser(),
}


def get_chunker(file_path: str):
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


def get_db_path(project_root: Path) -> Path:
    """Get path to shopify-code.db for project."""
    return project_root / ".claude" / "memory" / "shopify-code.db"


def get_schema_sql() -> str:
    """Database schema for shopify-code.db."""
    return """
    CREATE TABLE IF NOT EXISTS code_chunks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        file_path TEXT NOT NULL,
        chunk_type TEXT NOT NULL,
        name TEXT,
        content TEXT NOT NULL,
        start_line INTEGER,
        end_line INTEGER,
        language TEXT NOT NULL,
        project_path TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS symbols (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        symbol_type TEXT NOT NULL,
        file_path TEXT NOT NULL,
        line_number INTEGER,
        project_path TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cross_references (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source_file TEXT NOT NULL,
        source_line INTEGER,
        target_name TEXT NOT NULL,
        ref_type TEXT NOT NULL,
        project_path TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS schema_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        section_file TEXT NOT NULL,
        setting_id TEXT NOT NULL,
        setting_type TEXT NOT NULL,
        setting_label TEXT,
        default_value TEXT,
        block_type TEXT,
        project_path TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_chunks_file ON code_chunks(file_path);
    CREATE INDEX IF NOT EXISTS idx_chunks_type ON code_chunks(chunk_type);
    CREATE INDEX IF NOT EXISTS idx_symbols_name ON symbols(name);
    CREATE INDEX IF NOT EXISTS idx_symbols_type ON symbols(symbol_type);
    CREATE INDEX IF NOT EXISTS idx_refs_target ON cross_references(target_name);
    CREATE INDEX IF NOT EXISTS idx_refs_source ON cross_references(source_file);
    CREATE INDEX IF NOT EXISTS idx_settings_type ON schema_settings(setting_type);
    CREATE INDEX IF NOT EXISTS idx_settings_id ON schema_settings(setting_id);

    CREATE VIRTUAL TABLE IF NOT EXISTS code_chunks_fts USING fts5(
        content, name, chunk_type,
        content=code_chunks, content_rowid=id
    );

    CREATE VIRTUAL TABLE IF NOT EXISTS symbols_fts USING fts5(
        name, symbol_type,
        content=symbols, content_rowid=id
    );

    CREATE TABLE IF NOT EXISTS sync_metadata (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        last_sync TEXT,
        schema_version TEXT
    );
    """


def ensure_schema(db_path: Path) -> None:
    """Initialize or upgrade shopify-code.db schema."""
    db_path.parent.mkdir(parents=True, exist_ok=True)
    con = sqlite3.connect(str(db_path))
    try:
        con.executescript(get_schema_sql())
        con.execute(
            "INSERT OR REPLACE INTO sync_metadata (id, schema_version) VALUES (1, ?)",
            (SCHEMA_VERSION,)
        )
        con.commit()
    finally:
        con.close()


# ============================================================
# SYNC
# ============================================================

def sync_project(project_root: Path, db_path: Path) -> Dict[str, int]:
    """Index Shopify theme files into shopify-code.db."""
    import glob as globmod
    from datetime import datetime

    stats = {"files": 0, "chunks": 0, "symbols": 0, "refs": 0, "settings": 0}
    project_str = str(project_root)

    ensure_schema(db_path)
    con = sqlite3.connect(str(db_path))

    try:
        # Clear existing data for this project
        for table in ["code_chunks", "symbols", "cross_references", "schema_settings"]:
            con.execute(f"DELETE FROM {table} WHERE project_path = ?", (project_str,))

        # Rebuild FTS tables
        con.execute("DELETE FROM code_chunks_fts")
        con.execute("DELETE FROM symbols_fts")
        con.commit()

        processed_files = set()

        for pattern in FILE_PATTERNS:
            for file_path in globmod.glob(str(project_root / pattern), recursive=True):
                if file_path in processed_files:
                    continue
                if any(ex in file_path for ex in EXCLUDES):
                    continue

                processed_files.add(file_path)
                rel_path = os.path.relpath(file_path, project_root)

                try:
                    content = Path(file_path).read_text(encoding="utf-8")
                except Exception as e:
                    print(f"  Skip {rel_path}: {e}", file=sys.stderr)
                    continue

                chunker = get_chunker(file_path)
                if not chunker:
                    continue

                stats["files"] += 1
                chunks, refs, settings = chunker.chunk(content, rel_path)

                # Insert chunks
                for chunk in chunks:
                    cursor = con.execute("""
                        INSERT INTO code_chunks
                        (file_path, chunk_type, name, content, start_line, end_line, language, project_path)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        rel_path, chunk.chunk_type, chunk.name, chunk.content,
                        chunk.start_line, chunk.end_line, chunk.language, project_str,
                    ))
                    chunk_id = cursor.lastrowid
                    stats["chunks"] += 1

                    # FTS insert
                    con.execute("""
                        INSERT INTO code_chunks_fts (rowid, content, name, chunk_type)
                        VALUES (?, ?, ?, ?)
                    """, (chunk_id, chunk.content, chunk.name, chunk.chunk_type))

                    # Insert symbols
                    for sym in chunk.symbols:
                        sym_cursor = con.execute("""
                            INSERT INTO symbols
                            (name, symbol_type, file_path, line_number, project_path)
                            VALUES (?, ?, ?, ?, ?)
                        """, (sym, chunk.chunk_type, rel_path, chunk.start_line, project_str))
                        sym_id = sym_cursor.lastrowid
                        stats["symbols"] += 1

                        # FTS insert for symbol
                        con.execute("""
                            INSERT INTO symbols_fts (rowid, name, symbol_type)
                            VALUES (?, ?, ?)
                        """, (sym_id, sym, chunk.chunk_type))

                # Insert cross-references
                for ref in refs:
                    con.execute("""
                        INSERT INTO cross_references
                        (source_file, source_line, target_name, ref_type, project_path)
                        VALUES (?, ?, ?, ?, ?)
                    """, (ref.source_file, ref.source_line, ref.target_name, ref.ref_type, project_str))
                    stats["refs"] += 1

                # Insert schema settings
                for setting in settings:
                    con.execute("""
                        INSERT INTO schema_settings
                        (section_file, setting_id, setting_type, setting_label, default_value, block_type, project_path)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    """, (
                        setting.section_file, setting.setting_id, setting.setting_type,
                        setting.setting_label, setting.default_value, setting.block_type, project_str,
                    ))
                    stats["settings"] += 1

        # Update sync metadata
        con.execute(
            "UPDATE sync_metadata SET last_sync = ? WHERE id = 1",
            (datetime.now().isoformat(),)
        )
        con.commit()

    finally:
        con.close()

    return stats


# ============================================================
# SEARCH FUNCTIONS
# ============================================================

def search_chunks(db_path: Path, query: str, limit: int = 10) -> List[Dict]:
    """Full-text search across all indexed content."""
    con = sqlite3.connect(str(db_path))
    try:
        # Sanitize query for FTS5
        fts_query = " ".join(
            f'"{word}"' for word in query.split() if word.strip()
        )
        rows = con.execute("""
            SELECT c.file_path, c.chunk_type, c.name, c.start_line, c.end_line,
                   c.language, snippet(code_chunks_fts, 0, '>>>', '<<<', '...', 40) as match_text
            FROM code_chunks_fts f
            JOIN code_chunks c ON c.id = f.rowid
            WHERE code_chunks_fts MATCH ?
            ORDER BY rank
            LIMIT ?
        """, (fts_query, limit)).fetchall()

        return [
            {
                "file_path": r[0],
                "chunk_type": r[1],
                "name": r[2],
                "start_line": r[3],
                "end_line": r[4],
                "language": r[5],
                "match_text": r[6],
            }
            for r in rows
        ]
    finally:
        con.close()


def search_symbols(db_path: Path, query: str, limit: int = 20) -> List[Dict]:
    """Search extracted symbols."""
    con = sqlite3.connect(str(db_path))
    try:
        # Try FTS first
        fts_query = " ".join(
            f'"{word}"' for word in query.split() if word.strip()
        )
        rows = con.execute("""
            SELECT s.name, s.symbol_type, s.file_path, s.line_number
            FROM symbols_fts f
            JOIN symbols s ON s.id = f.rowid
            WHERE symbols_fts MATCH ?
            ORDER BY rank
            LIMIT ?
        """, (fts_query, limit)).fetchall()

        # Fallback to LIKE if FTS returns nothing
        if not rows:
            rows = con.execute("""
                SELECT name, symbol_type, file_path, line_number
                FROM symbols
                WHERE name LIKE ?
                ORDER BY name
                LIMIT ?
            """, (f"%{query}%", limit)).fetchall()

        return [
            {
                "name": r[0],
                "symbol_type": r[1],
                "file_path": r[2],
                "line_number": r[3],
            }
            for r in rows
        ]
    finally:
        con.close()


def search_refs(db_path: Path, target_name: str, limit: int = 20) -> List[Dict]:
    """Find all cross-references to a given target."""
    con = sqlite3.connect(str(db_path))
    try:
        rows = con.execute("""
            SELECT source_file, source_line, target_name, ref_type
            FROM cross_references
            WHERE target_name LIKE ?
            ORDER BY source_file, source_line
            LIMIT ?
        """, (f"%{target_name}%", limit)).fetchall()

        return [
            {
                "source_file": r[0],
                "source_line": r[1],
                "target_name": r[2],
                "ref_type": r[3],
            }
            for r in rows
        ]
    finally:
        con.close()


def search_schema(
    db_path: Path,
    setting_type: Optional[str] = None,
    setting_id: Optional[str] = None,
    block_type: Optional[str] = None,
    limit: int = 20,
) -> List[Dict]:
    """Search schema settings with optional filters."""
    con = sqlite3.connect(str(db_path))
    try:
        conditions = []
        params: List[Any] = []

        if setting_type:
            conditions.append("setting_type = ?")
            params.append(setting_type)
        if setting_id:
            conditions.append("setting_id LIKE ?")
            params.append(f"%{setting_id}%")
        if block_type:
            conditions.append("block_type = ?")
            params.append(block_type)

        where = " AND ".join(conditions) if conditions else "1=1"
        params.append(limit)

        rows = con.execute(f"""
            SELECT section_file, setting_id, setting_type, setting_label, default_value, block_type
            FROM schema_settings
            WHERE {where}
            ORDER BY section_file, setting_id
            LIMIT ?
        """, params).fetchall()

        return [
            {
                "section_file": r[0],
                "setting_id": r[1],
                "setting_type": r[2],
                "setting_label": r[3],
                "default_value": r[4],
                "block_type": r[5],
            }
            for r in rows
        ]
    finally:
        con.close()


def get_status(db_path: Path) -> Dict:
    """Get database status."""
    if not db_path.exists():
        return {"exists": False}

    con = sqlite3.connect(str(db_path))
    try:
        result = {"exists": True, "path": str(db_path)}

        # File counts by language
        rows = con.execute("""
            SELECT language, COUNT(DISTINCT file_path) FROM code_chunks GROUP BY language
        """).fetchall()
        result["files_by_type"] = {r[0]: r[1] for r in rows}

        # Total counts
        result["total_chunks"] = con.execute("SELECT COUNT(*) FROM code_chunks").fetchone()[0]
        result["total_symbols"] = con.execute("SELECT COUNT(*) FROM symbols").fetchone()[0]
        result["total_refs"] = con.execute("SELECT COUNT(*) FROM cross_references").fetchone()[0]
        result["total_settings"] = con.execute("SELECT COUNT(*) FROM schema_settings").fetchone()[0]

        # Last sync
        row = con.execute("SELECT last_sync, schema_version FROM sync_metadata WHERE id = 1").fetchone()
        if row:
            result["last_sync"] = row[0]
            result["schema_version"] = row[1]

        return result
    finally:
        con.close()


# ============================================================
# CLI
# ============================================================

def main():
    parser = argparse.ArgumentParser(
        description="shopify-code-index v1.0 - Shopify theme code indexer"
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    # sync
    sync_parser = subparsers.add_parser("sync", help="Index Shopify theme files")
    sync_parser.add_argument("--project", type=str, help="Project path (default: auto-detect)")

    # search
    search_parser = subparsers.add_parser("search", help="Full-text search across theme code")
    search_parser.add_argument("query", help="Search query")
    search_parser.add_argument("--limit", type=int, default=10)
    search_parser.add_argument("--json", action="store_true")

    # symbol
    symbol_parser = subparsers.add_parser("symbol", help="Search symbols (sections, settings, CSS props)")
    symbol_parser.add_argument("query", help="Symbol name to search")
    symbol_parser.add_argument("--limit", type=int, default=20)
    symbol_parser.add_argument("--json", action="store_true")

    # refs
    refs_parser = subparsers.add_parser("refs", help="Cross-reference lookup")
    refs_parser.add_argument("name", help="Target name to find references for")
    refs_parser.add_argument("--limit", type=int, default=20)
    refs_parser.add_argument("--json", action="store_true")

    # schema
    schema_parser = subparsers.add_parser("schema", help="Search schema settings")
    schema_parser.add_argument("--type", dest="setting_type", help="Filter by setting type")
    schema_parser.add_argument("--id", dest="setting_id", help="Filter by setting ID")
    schema_parser.add_argument("--block", dest="block_type", help="Filter by block type")
    schema_parser.add_argument("--limit", type=int, default=20)
    schema_parser.add_argument("--json", action="store_true")

    # status
    status_parser = subparsers.add_parser("status", help="Show shopify-code.db status")
    status_parser.add_argument("--json", action="store_true")

    args = parser.parse_args()

    project_root = Path(args.project) if hasattr(args, "project") and args.project else get_project_root()
    db_path = get_db_path(project_root)

    if args.command == "sync":
        stats = sync_project(project_root, db_path)
        print(f"Synced shopify-code.db: {db_path}")
        print(f"  Files: {stats['files']}")
        print(f"  Chunks: {stats['chunks']}")
        print(f"  Symbols: {stats['symbols']}")
        print(f"  Cross-refs: {stats['refs']}")
        print(f"  Schema settings: {stats['settings']}")

    elif args.command == "search":
        if not db_path.exists():
            print(f"shopify-code.db not found: {db_path}", file=sys.stderr)
            print("Run: /shopify-code sync", file=sys.stderr)
            return 1

        results = search_chunks(db_path, args.query, args.limit)
        if args.json:
            print(json.dumps(results, indent=2))
        else:
            print(f"Search results for: {args.query}")
            print("=" * 60)
            for r in results:
                print(f"[{r['chunk_type']}] {r['name'] or 'unnamed'}")
                print(f"  File: {r['file_path']}:{r['start_line']}-{r['end_line']}")
                print(f"  Match: {r['match_text']}")
                print()
            if not results:
                print("No results found.")

    elif args.command == "symbol":
        if not db_path.exists():
            print(f"shopify-code.db not found: {db_path}", file=sys.stderr)
            return 1

        results = search_symbols(db_path, args.query, args.limit)
        if args.json:
            print(json.dumps(results, indent=2))
        else:
            print(f"Symbol search results for: {args.query}")
            print("=" * 60)
            for r in results:
                print(f"[{r['symbol_type']}] {r['name']}")
                print(f"  File: {r['file_path']}:{r['line_number'] or '?'}")
                print()
            if not results:
                print("No symbols found.")

    elif args.command == "refs":
        if not db_path.exists():
            print(f"shopify-code.db not found: {db_path}", file=sys.stderr)
            return 1

        results = search_refs(db_path, args.name, args.limit)
        if args.json:
            print(json.dumps(results, indent=2))
        else:
            print(f"Cross-references for: {args.name}")
            print("=" * 60)
            for r in results:
                print(f"[{r['ref_type']}] {r['source_file']}:{r['source_line']}")
                print(f"  Target: {r['target_name']}")
                print()
            if not results:
                print("No references found.")

    elif args.command == "schema":
        if not db_path.exists():
            print(f"shopify-code.db not found: {db_path}", file=sys.stderr)
            return 1

        results = search_schema(
            db_path,
            setting_type=args.setting_type,
            setting_id=args.setting_id,
            block_type=args.block_type,
            limit=args.limit,
        )
        if args.json:
            print(json.dumps(results, indent=2))
        else:
            filters = []
            if args.setting_type:
                filters.append(f"type={args.setting_type}")
            if args.setting_id:
                filters.append(f"id={args.setting_id}")
            if args.block_type:
                filters.append(f"block={args.block_type}")
            filter_str = f" ({', '.join(filters)})" if filters else ""
            print(f"Schema settings{filter_str}")
            print("=" * 60)
            for r in results:
                block_str = f" [block: {r['block_type']}]" if r["block_type"] else ""
                default_str = f" = {r['default_value']}" if r["default_value"] else ""
                label_str = f" ({r['setting_label']})" if r["setting_label"] else ""
                print(f"[{r['setting_type']}] {r['setting_id']}{label_str}{default_str}{block_str}")
                print(f"  Section: {r['section_file']}")
                print()
            if not results:
                print("No settings found.")

    elif args.command == "status":
        status = get_status(db_path)
        if args.json:
            print(json.dumps(status, indent=2))
        else:
            if not status["exists"]:
                print(f"shopify-code.db: Not initialized")
                print(f"Expected: {db_path}")
                print()
                print("Run: /shopify-code sync")
                return 0

            print(f"shopify-code.db: {status['path']}")
            print(f"Schema version: {status.get('schema_version', 'unknown')}")
            print(f"Last sync: {status.get('last_sync', 'never')}")
            print()
            print("Files by type:")
            for lang, count in status.get("files_by_type", {}).items():
                print(f"  {lang}: {count}")
            print()
            print(f"Total chunks: {status['total_chunks']}")
            print(f"Total symbols: {status['total_symbols']}")
            print(f"Total cross-references: {status['total_refs']}")
            print(f"Total schema settings: {status['total_settings']}")

    return 0


if __name__ == "__main__":
    sys.exit(main() or 0)
