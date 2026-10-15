#!/usr/bin/env python3
"""Write the MySQL error decoder in errors.md from the errors the kit mentions.

The exercises show real MySQL errors on purpose (a delete a foreign key refuses,
a value out of range...). This finds every `ERROR nnnn` in solutions.sql and the
exercise pages, notes which exercises show it, and writes one entry per error
between the `<!-- errors -->` markers in errors.md: the message, what it means,
the usual fix, and where it comes up. After adding an error to an exercise, run:

    python3 build_errors.py

CI fails if errors.md is out of date, or if an error has no entry in ERRORS below.

Every error in ERRORS gets an entry, even if no exercise shows it. "Comes up in"
lists only the SQL exercises: there, MySQL shows the error anyway when you run the
statement. The concepts check (answered without running SQL) isn't listed, since
naming an error next to its question would hint at the answer.
"""
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
OUT = HERE / "errors.md"
BLOCK = re.compile(r"<!-- errors -->\n.*?<!-- /errors -->", re.S)
ERROR = re.compile(r"ERROR (\d{4})")
LABEL = re.compile(r"^-- \[(\d+\.\d+)\]\s*$")
ITEM = re.compile(r"^- \*\*([\dT]+\.\d+)\*\*")
NOT_LISTED = {"04-concepts-check.md"}  # pages whose questions an error would hint at

# What each error means and the usual fix. The message is MySQL 8.4's wording,
# with '...' where it names your table, column, or value.
ERRORS = {
    "1045": ("Connection", "Access denied for user '...'@'...' (using password: YES)",
             "MySQL didn't accept the user name and password.",
             "Use the password the server was set up with. With the Docker setup, it's the one the container was first created with."),
    "2002": ("Connection", "Can't connect to local MySQL server through socket '...'",
             "The client couldn't reach the server: it isn't running yet, or it's somewhere else.",
             "Wait for the server to finish starting (see Setup, step 3), or connect to 127.0.0.1 and the right port."),
    "1064": ("Writing queries", "You have an error in your SQL syntax; check the manual ... near '...'",
             "MySQL couldn't parse the statement. The text after `near` is where it got confused.",
             "Look just before the quoted text: a missing comma, an unclosed parenthesis or quote, a misspelled keyword, or a reserved word used as a name (like `Order`)."),
    "1111": ("Writing queries", "Invalid use of group function",
             "An aggregate (COUNT, SUM, AVG...) is used where a single row's value is expected, usually in WHERE.",
             "Filter on aggregates with HAVING, or compare with a subquery: `WHERE Cost > (SELECT AVG(Cost) FROM Book)`."),
    "1055": ("Writing queries", "Expression #n of SELECT list is not in GROUP BY clause and contains nonaggregated column '...' ... incompatible with sql_mode=only_full_group_by",
             "With GROUP BY, every column in SELECT must be grouped or inside an aggregate.",
             "Add the column to GROUP BY, or wrap it in an aggregate. Don't change sql_mode: D427 expects this rule."),
    "1222": ("Writing queries", "The used SELECT statements have a different number of columns",
             "The SELECTs joined by UNION return different numbers of columns.",
             "Make every SELECT in the UNION return the same columns, in the same order."),
    "1146": ("Writing queries", "Table '...' doesn't exist",
             "The table or view name isn't in the current database.",
             "Check the spelling and the database (`USE d427;`), and that the table or view was created (or not dropped)."),
    "1136": ("Changing data", "Column count doesn't match value count at row 1",
             "An INSERT gives a different number of values than columns.",
             "With no column list, give a value for every column in table order. Better: list the columns you're filling in."),
    "1364": ("Changing data", "Field '...' doesn't have a default value",
             "An INSERT leaves out a NOT NULL column that has no DEFAULT.",
             "Give the column a value, or give it a DEFAULT in the table definition."),
    "1062": ("Keys and constraints", "Duplicate entry '...' for key '...'",
             "A row would repeat a value in a PRIMARY KEY or UNIQUE column.",
             "Use a value that isn't taken. When adding a key to existing rows, fix the duplicates first."),
    "1264": ("Keys and constraints", "Out of range value for column '...' at row 1",
             "The value doesn't fit the column's type, like 300 in a TINYINT UNSIGNED (0 to 255) or -40 in any UNSIGNED column.",
             "Pick the smallest type whose range covers every allowed value, signed if it can go below 0."),
    "3819": ("Keys and constraints", "Check constraint '...' is violated.",
             "A row fails a CHECK condition. Adding a CHECK also tests the rows already in the table.",
             "Fix the value, or the rows that break the rule before adding it. Name constraints (`CONSTRAINT name CHECK (...)`) so they're easy to drop."),
    "3959": ("Keys and constraints", "Check constraint '...' uses column '...', hence column cannot be dropped or renamed.",
             "A CHECK refers to the column you're dropping or renaming.",
             "Drop the CHECK first (`DROP CHECK name`; `SHOW CREATE TABLE` shows its name), change the column, then add the CHECK back."),
    "1075": ("Keys and constraints", "Incorrect table definition; there can be only one auto column and it must be defined as a key",
             "An AUTO_INCREMENT column isn't part of a key, or there are two of them.",
             "Make the AUTO_INCREMENT column the primary key (or part of one). Remove AUTO_INCREMENT before changing that key."),
    "1451": ("Foreign keys", "Cannot delete or update a parent row: a foreign key constraint fails (...)",
             "Other rows still point at the row you're deleting or changing, and the foreign key's rule is RESTRICT (also the default, when no rule is given).",
             "Delete or change the child rows first, or give the foreign key ON DELETE CASCADE / SET NULL if that's what should happen."),
    "1452": ("Foreign keys", "Cannot add or update a child row: a foreign key constraint fails (...)",
             "The foreign key value has no matching row in the parent table.",
             "Add the parent row first, or use a value that exists. NULL is allowed if the column allows it."),
    "1822": ("Foreign keys", "Failed to add the foreign key constraint. Missing index for constraint '...' in the referenced table '...'",
             "The referenced column isn't a primary key or unique (MySQL 8.0's wording).",
             "Point the foreign key at the parent's primary key, or add a PRIMARY KEY or UNIQUE to that column first."),
    "6125": ("Foreign keys", "Failed to add the foreign key constraint. Missing unique key for constraint '...' in the referenced table '...'",
             "The same problem as 1822, in MySQL 8.4's wording: the referenced column isn't a primary key or unique.",
             "Point the foreign key at the parent's primary key, or add a PRIMARY KEY or UNIQUE to that column first."),
    "3780": ("Foreign keys", "Referencing column '...' and referenced column '...' in foreign key constraint '...' are incompatible.",
             "The foreign key column's type doesn't match the referenced column's, UNSIGNED included.",
             "Give the foreign key column exactly the referenced column's type (for example both `SMALLINT UNSIGNED`)."),
    "1830": ("Foreign keys", "Column '...' cannot be NOT NULL: needed in a foreign key constraint '...' SET NULL",
             "ON DELETE SET NULL needs a column that can hold NULL.",
             "Remove NOT NULL from the foreign key column (`MODIFY col type`), then add the foreign key."),
    "1369": ("Views", "CHECK OPTION failed '...'",
             "A change through a view WITH CHECK OPTION would make the row disappear from the view.",
             "Change the row so it still matches the view's WHERE, or change the base table directly."),
}
GROUPS = ["Writing queries", "Changing data", "Keys and constraints", "Foreign keys", "Views", "Connection"]


def _pages():
    """{label: page} for every exercise, and the pages in order."""
    where = {}
    for path in sorted(HERE.glob("0[0-9]-*.md")) + [HERE / "later-advanced-sql.md"]:
        for line in path.read_text().splitlines():
            m = ITEM.match(line)
            if m:
                where[m[1]] = path.name
    return where


def find():
    """{code: [(label or page, page)]}, in the order they come up."""
    where = _pages()
    seen = {}

    def add(code, label, page):
        refs = seen.setdefault(code, [])
        if (label, page) not in refs:
            refs.append((label, page))

    label = None
    for line in (HERE / "solutions.sql").read_text().splitlines():
        m = LABEL.match(line)
        if m:
            label = m[1]
        for e in ERROR.finditer(line):
            if label and where.get(label) not in NOT_LISTED:
                add(e[1], label, where.get(label, "solutions.sql"))
    for path in sorted(HERE.glob("0[0-9]-*.md")) + [HERE / "later-advanced-sql.md", HERE / "README.md"]:
        if path.name in NOT_LISTED:
            for e in ERROR.finditer(path.read_text()):
                seen.setdefault(e[1], [])  # known, but not listed
            continue
        label = None
        for line in path.read_text().splitlines():
            m = ITEM.match(line)
            if m:
                label = m[1]
            for e in ERROR.finditer(line):
                if path.name == "README.md":
                    add(e[1], "Setup: Troubleshooting", "README.md#troubleshooting")
                elif label:
                    add(e[1], label, path.name)
    return seen


def _link(label, page):
    return f"[{label}]({page})"


def render(found):
    out = []
    for group in GROUPS:
        codes = [c for c in sorted(ERRORS) if ERRORS[c][0] == group]
        if not codes:
            continue
        out += [f"## {group}", ""]
        for code in codes:
            _, message, means, fix = ERRORS[code]
            refs = sorted(found.get(code, []), key=lambda r: [int(x) if x.isdigit() else 0
                                                              for x in re.findall(r"\d+", r[0])] or [999])
            out += [f"### ERROR {code}", "",
                    f"`{message}`", "",
                    f"**What it means:** {means}", "",
                    f"**Usual fix:** {fix}", ""]
            if refs:
                out += ["**Comes up in:** " + ", ".join(_link(label, page) for label, page in refs), ""]
    return "\n".join(out).rstrip() + "\n"


def main():
    found = find()
    unknown = sorted(set(found) - set(ERRORS))
    if unknown:
        sys.exit(f"build_errors.py: add an ERRORS entry for {', '.join(unknown)}")
    text = OUT.read_text()
    new = BLOCK.sub(lambda _: "<!-- errors -->\n" + render(found) + "<!-- /errors -->", text)
    if new != text:
        OUT.write_text(new)
    print(f"errors.md: {len(ERRORS)} errors")


if __name__ == "__main__":
    main()
