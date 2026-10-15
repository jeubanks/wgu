"""Translate a course's MySQL setup.sql into SQLite, for in-browser and build-time use.

Used by hooks/sql_runner.py (the Try it boxes' sample data), hooks/concept_diagrams.py
(rows for the pictures), and scripts/check_sql_runner.py (CI). Only CREATE TABLE
types change; INSERTs run as they are.
"""
import re

TYPES = [
    (re.compile(r"\bAUTO_INCREMENT\b", re.I), ""),
    (re.compile(r"\b(?:TINY|SMALL|MEDIUM|BIG)?INT(?:\(\d+\))?(?:\s+UNSIGNED)?\b", re.I), "INTEGER"),
    # REAL, not NUMERIC: with NUMERIC, 158000 is stored as a whole number and
    # Salary / 12 does integer division.
    (re.compile(r"\b(?:DECIMAL|NUMERIC|FLOAT|DOUBLE)(?:\(\d+(?:,\s*\d+)?\))?(?:\s+UNSIGNED)?", re.I), "REAL"),
    # MySQL's default collation ignores case when comparing text; NOCASE does the same.
    (re.compile(r"\b(?:VAR)?CHAR\(\d+\)", re.I), "TEXT COLLATE NOCASE"),
    (re.compile(r"\b(?:DATETIME|DATE|TIMESTAMP)\b"), "TEXT"),
    (re.compile(r"\)\s*ENGINE\s*=\s*\w+[^;]*;", re.I), ");"),
]
CREATE_TABLE = re.compile(r"^CREATE TABLE .*?^\);", re.M | re.S | re.I)
DATABASE_LINE = re.compile(r"^(?:DROP DATABASE|CREATE DATABASE|USE)\b.*$", re.M | re.I)


def to_sqlite(sql):
    """setup.sql (MySQL) -> a script SQLite can run."""
    def table(match):
        text = match[0]
        for pattern, repl in TYPES:
            text = pattern.sub(repl, text)
        return text

    return CREATE_TABLE.sub(table, DATABASE_LINE.sub("", sql))
