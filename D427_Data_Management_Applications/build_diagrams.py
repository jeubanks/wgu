#!/usr/bin/env python3
"""Draw Mermaid ER diagrams of the practice database from setup.sql.

setup.sql is the source of truth. After changing a CREATE TABLE there, run:

    python3 build_diagrams.py

This rewrites the diagram between the `<!-- er-diagram -->` markers in
README.md, so it renders on GitHub. On the site, hooks/er_diagrams.py uses
read_schema() here and hooks/er_svg.py to draw the same diagram (and the small
per-exercise "Show tables" diagrams) as styled SVG instead.

The diagrams show columns, keys (PK, FK, UK = unique) and relationships.
Types are general (int, decimal, string, date, datetime) on purpose:
Section 11 has learners pick the exact MySQL types for these same tables.
"""
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

HERE = Path(__file__).resolve().parent
README = HERE / "README.md"
MARKERS = re.compile(r"(<!-- er-diagram -->\n).*?(<!-- /er-diagram -->)", re.S)

CREATE_TABLE = re.compile(r"^CREATE TABLE\s+(\w+)\s*\((.*?)^\)[^;]*;", re.M | re.S | re.I)
# The comment line right under a "-- -----" rule names the schema below it.
SCHEMA_HEADING = re.compile(r"^-- -{10,}\n-- (.+)$", re.M)
FOREIGN_KEY = re.compile(r"FOREIGN KEY\s*\((\w+)\)\s*REFERENCES\s+(\w+)\s*\((\w+)\)", re.I)
INLINE_REFERENCES = re.compile(r"\bREFERENCES\s+(\w+)\s*\((\w+)\)", re.I)
TABLE_KEY = re.compile(r"^(PRIMARY KEY|UNIQUE(?: KEY| INDEX)?)\s*(?:\w+\s*)?\(([^)]*)\)", re.I)
TYPES = [
    (re.compile(r"^(?:TINY|SMALL|MEDIUM|BIG)?INT(?:EGER)?\b", re.I), "int"),
    (re.compile(r"^(?:DECIMAL|NUMERIC|FLOAT|DOUBLE|REAL)\b", re.I), "decimal"),
    (re.compile(r"^(?:VAR)?CHAR\b|^(?:TINY|MEDIUM|LONG)?TEXT\b|^ENUM\b", re.I), "string"),
    (re.compile(r"^(?:DATETIME|TIMESTAMP)\b", re.I), "datetime"),
    (re.compile(r"^DATE\b", re.I), "date"),
    (re.compile(r"^TIME\b", re.I), "time"),
    (re.compile(r"^YEAR\b", re.I), "year"),
]


@dataclass
class Column:
    name: str
    type: str
    not_null: bool = False


@dataclass
class ForeignKey:
    column: str
    parent: str
    parent_column: str


@dataclass
class Table:
    name: str
    schema: str
    columns: list = field(default_factory=list)
    primary_key: list = field(default_factory=list)
    unique: set = field(default_factory=set)
    foreign_keys: list = field(default_factory=list)

    def column(self, name):
        return next(c for c in self.columns if c.name.lower() == name.lower())


def _split_items(body):
    """Split a CREATE TABLE body on commas that aren't inside parentheses or quotes."""
    items, depth, quote, buf = [], 0, False, []
    for ch in body:
        if ch == "'":
            quote = not quote
        elif not quote and ch == "(":
            depth += 1
        elif not quote and ch == ")":
            depth -= 1
        elif not quote and depth == 0 and ch == ",":
            items.append("".join(buf).strip())
            buf = []
            continue
        buf.append(ch)
    items.append("".join(buf).strip())
    return [i for i in items if i]


def _general_type(sql_type):
    for pattern, name in TYPES:
        if pattern.match(sql_type):
            return name
    return sql_type.split("(")[0].lower()


def _schema_label(heading):
    """'Company schema: Department / ...' -> 'Company schema'."""
    return re.split(r"[:(]", heading)[0].strip()


def read_schema(path=HERE / "setup.sql"):
    """Return {table name: Table} for every CREATE TABLE in setup.sql, in file order."""
    sql = path.read_text()
    headings = [(m.start(), _schema_label(m[1])) for m in SCHEMA_HEADING.finditer(sql)]
    tables = {}
    for match in CREATE_TABLE.finditer(sql):
        schema = next((label for pos, label in reversed(headings) if pos < match.start()), "")
        table = Table(match[1], schema)
        body = re.sub(r"--[^\n]*", "", match[2])
        for item in _split_items(body):
            fk = FOREIGN_KEY.match(item)
            key = TABLE_KEY.match(item)
            if fk:
                table.foreign_keys.append(ForeignKey(fk[1], fk[2], fk[3]))
            elif key:
                cols = [c.strip().strip("`") for c in key[2].split(",")]
                if key[1].upper().startswith("PRIMARY"):
                    table.primary_key = cols
                elif len(cols) == 1:
                    table.unique.add(cols[0])
            elif re.match(r"^(?:CONSTRAINT|CHECK|INDEX|KEY)\b", item, re.I):
                continue
            else:
                name, sql_type = item.split(None, 2)[:2]
                rest = item.upper()
                table.columns.append(Column(name, _general_type(sql_type), "NOT NULL" in rest))
                if "PRIMARY KEY" in rest:
                    table.primary_key = [name]
                if re.search(r"\bUNIQUE\b", rest):
                    table.unique.add(name)
                ref = INLINE_REFERENCES.search(item)
                if ref:
                    table.foreign_keys.append(ForeignKey(name, ref[1], ref[2]))
        for col in table.primary_key:
            table.column(col).not_null = True
        tables[table.name] = table
    return tables


def _attribute(table, col):
    keys = []
    if col.name in table.primary_key:
        keys.append("PK")
    if any(fk.column == col.name for fk in table.foreign_keys):
        keys.append("FK")
    if col.name in table.unique:
        keys.append("UK")
    # Mermaid always draws an attribute as `type name keys`, in that order. Put the
    # column name in the type slot and the type in the name slot, so the boxes read
    # Name | Type | Keys like CREATE TABLE, MySQL Workbench and dbdiagram.io.
    return f"    {col.name} {col.type}" + (f" {', '.join(keys)}" if keys else "")


def _relationships(tables):
    """(parent, child, fk, mermaid line) for every foreign key between the given tables."""
    out = []
    for child in tables.values():
        for fk in child.foreign_keys:
            if fk.parent not in tables:
                continue
            col = child.column(fk.column)
            parent_end = "||" if col.not_null else "|o"
            child_end = "o|" if fk.column in child.unique else "o{"
            # Solid line: the FK is part of the child's primary key (identifying).
            line = "--" if fk.column in child.primary_key else ".."
            out.append((fk.parent, child.name, fk,
                        f'  {fk.parent} {parent_end}{line}{child_end} {child.name} : '
                        f'"{child.name}.{fk.column} = {fk.parent}.{fk.parent_column}"'))
    return out


def _description(tables, relationships):
    names = list(tables)
    listed = names[0] if len(names) == 1 else ", ".join(names[:-1]) + " and " + names[-1]
    parts = [f"Entity-relationship diagram of the {listed} "
             f"{'table' if len(names) == 1 else 'tables'} from setup.sql, "
             "with each column's general type and its keys."]
    for parent, child, fk, _ in relationships:
        how = "exactly one" if tables[child].column(fk.column).not_null else "at most one"
        other = "other " if parent == child else ""
        parts.append(f"{fk.column} in {child} refers to {how} {other}{parent} row.")
    if not relationships and len(names) > 1:
        parts.append("No foreign keys connect them.")
    return " ".join(parts)


def describe(tables):
    """Alt text for a diagram of {name: Table}: the tables and each foreign key."""
    return _description(tables, _relationships(tables))


def er_diagram(tables, title, by_schema=False):
    """Mermaid erDiagram source for the given {name: Table}, in the given order."""
    relationships = _relationships(tables)
    lines = ["erDiagram", f"  accTitle: {title}", f"  accDescr: {_description(tables, relationships)}"]
    if by_schema:
        # Left to right, so the separate schemas stack top to bottom
        # instead of making one very wide row.
        lines.append("  direction LR")
    schema = None
    for table in tables.values():
        if by_schema and table.schema != schema:
            schema = table.schema
            lines += ["", f"  %% {schema}"]
        lines.append(f"  {table.name} {{")
        lines += [_attribute(table, col) for col in table.columns]
        lines.append("  }")
        for parent, child, _, rel in relationships:
            # Each relationship right after the later of its two tables.
            if table.name in (parent, child) and (parent == child or
                    list(tables).index(table.name) == max(list(tables).index(parent), list(tables).index(child))):
                lines.append(rel)
    return "\n".join(lines)


def readme_block(tables):
    diagram = er_diagram(tables, "The d427 practice database", by_schema=True)
    return f"```mermaid\n{diagram}\n```\n"


def main():
    tables = read_schema()
    text = README.read_text()
    if not MARKERS.search(text):
        sys.exit("README.md has no <!-- er-diagram --> ... <!-- /er-diagram --> markers")
    new = MARKERS.sub(lambda m: m[1] + readme_block(tables) + m[2], text)
    if new != text:
        README.write_text(new)
        print("README.md: diagram updated")
    else:
        print("README.md: diagram already up to date")


if __name__ == "__main__":
    main()
