"""Translate a course's MySQL setup.sql into SQLite, for in-browser and build-time use.

Used by hooks/sql_runner.py (the Try it boxes' sample data), hooks/concept_diagrams.py
(rows for the pictures), and scripts/check_sql_runner.py (CI). Only CREATE TABLE
types change; INSERTs run as they are. docs/javascripts/sql-runner.js makes the
same CREATE TABLE changes (createTables) to what learners type; keep the two in step.
"""
import re

INT = r"(?:TINY|SMALL|MEDIUM|BIG)?INT(?:EGER)?(?:\s*\(\d+\))?(?:\s+UNSIGNED)?"
# An AUTO_INCREMENT key becomes SQLite's AUTOINCREMENT, which, like MySQL, never
# hands out a number again after its row is deleted (the counter is sqlite_sequence).
AUTO_KEY = re.compile(rf"\b{INT}(\s+NOT\s+NULL)?\s+(?:AUTO_INCREMENT\s+PRIMARY\s+KEY|PRIMARY\s+KEY\s+AUTO_INCREMENT)\b", re.I)
TYPES = [
    (AUTO_KEY, r"INTEGER PRIMARY KEY AUTOINCREMENT\1"),
    (re.compile(r"\bAUTO_INCREMENT\b", re.I), ""),
    (re.compile(rf"\b{INT}\b", re.I), "INTEGER"),
    # REAL, not NUMERIC: with NUMERIC, 158000 is stored as a whole number and
    # Salary / 12 does integer division.
    (re.compile(r"\b(?:DECIMAL|NUMERIC|FLOAT|DOUBLE)(?:\(\d+(?:,\s*\d+)?\))?(?:\s+UNSIGNED)?", re.I), "REAL"),
    # MySQL's default collation ignores case when comparing text; NOCASE does the same.
    (re.compile(r"\b(?:VAR)?CHAR\(\d+\)", re.I), "TEXT COLLATE NOCASE"),
    (re.compile(r"\b(?:DATETIME|DATE|TIMESTAMP)\b", re.I), "TEXT"),
]
CREATE_TABLE = re.compile(r"\bCREATE\s+TABLE\b", re.I)
DATABASE_LINE = re.compile(r"^(?:DROP DATABASE|CREATE DATABASE|USE)\b.*$", re.M | re.I)


def _auto_key_at_table_level(body):
    """`id INT NOT NULL AUTO_INCREMENT, ..., PRIMARY KEY (id)` -> the inline form."""
    key = re.search(r",\s*PRIMARY\s+KEY\s*\(\s*`?(\w+)`?\s*\)", body, re.I)
    if not key:
        return body
    column = re.compile(rf"(\b{key[1]}`?\s+){INT}(\s+NOT\s+NULL)?\s+AUTO_INCREMENT\b", re.I)
    if not column.search(body):
        return body
    body = column.sub(r"\1INTEGER PRIMARY KEY AUTOINCREMENT\2", body, count=1)
    key = re.search(r",\s*PRIMARY\s+KEY\s*\(\s*`?(\w+)`?\s*\)", body, re.I)  # positions moved
    return body[:key.start()] + body[key.end():]


def create_tables(sql):
    """Each CREATE TABLE's column types and keys, MySQL -> SQLite; the rest unchanged."""
    out, at = [], 0
    for match in CREATE_TABLE.finditer(sql):
        if match.start() < at:
            continue
        start = sql.find("(", match.end())
        if start < 0:
            break
        depth, end = 0, start
        while end < len(sql):
            depth += {"(": 1, ")": -1}.get(sql[end], 0)
            if depth == 0:
                break
            end += 1
        body = _auto_key_at_table_level(sql[start:end + 1])
        for pattern, repl in TYPES:
            body = pattern.sub(repl, body)
        # Table options after the closing parenthesis (ENGINE=..., CHARSET=...).
        stop = sql.find(";", end)
        stop = len(sql) if stop < 0 else stop
        out += [sql[at:start], body]
        options = re.match(r"\s*(ENGINE|DEFAULT|CHARSET|COLLATE|AUTO_INCREMENT)\b", sql[end + 1:stop], re.I)
        at = stop if options else end + 1
    out.append(sql[at:])
    return "".join(out)


def create_statements(sql):
    """{table name: its CREATE TABLE statement as written}, for SHOW CREATE TABLE."""
    out = {}
    for match in re.finditer(r"\bCREATE\s+TABLE\s+`?(\w+)`?\s*\(", sql, re.I):
        stop = sql.find(";", match.end())
        out[match[1]] = sql[match.start():len(sql) if stop < 0 else stop].strip()
    return out


def to_sqlite(sql):
    """setup.sql (MySQL) -> a script SQLite can run."""
    return create_tables(DATABASE_LINE.sub("", sql))
