"""MkDocs hook: an in-browser SQL runner (SQLite via sql.js) for D427's read-only queries.

The exercise files stay plain Markdown. On each page in PAGES this hook adds:

- a note near the top saying the runner is SQLite, not MySQL, and how they differ;
- a JSON blob with the sample data (setup.sql, translated to SQLite) and the
  solution query for each exercise (from solutions.sql, via build_solutions.py).

docs/javascripts/sql-runner.js finds each exercise on the page and adds the editor.
Only read-only queries get it: Part 1 (sections 1-6) and Section 12 in Part 3.
Changing data and tables should be practiced on real MySQL, so Part 2, Section 11,
and 12.20-12.22 don't. SKIP lists the exercises that are left out, with the reason
shown in place of the box.
"""
import importlib.util
import json
import re
from pathlib import Path

COURSE = Path(__file__).resolve().parent.parent / "D427_Data_Management_Applications"
PAGES = {
    "d427/01-queries.md": range(1, 7),        # Part 1 = sections 1-6
    "d427/03-assessment-drills.md": (12,),    # Section 12 only; Section 11 builds tables
}
SKIP = {
    "12.20": "This one changes data, so do it on MySQL.",
    "12.21": "This one changes data, so do it on MySQL.",
    "12.22": "This one changes data, so do it on MySQL.",
}

NOTE = """
!!! info "Try the queries in your browser (SQLite)"

    Each exercise below has a **Try it** box. Type a query, press **Run** (or Ctrl+Enter),
    and **Check** compares your result with the solution's. Every run starts from a
    fresh copy of the `setup.sql` data, so nothing you run can break it.

    The box runs **SQLite**, not MySQL, so use it for practice only. The exam uses
    **MySQL 8.4**, and Part 2 (changing data and tables) should be done there.
    Text comparisons ignore case, like MySQL, and common MySQL functions are added
    (`CONCAT`, `DATEDIFF`, `TIMESTAMPDIFF`, `YEAR`, `MONTH`, `DAYNAME`, `IF`, `LEFT`, ...).
    Where they still differ:

    - **GROUP BY:** SQLite lets you SELECT a column that is neither grouped nor inside an aggregate.
      MySQL 8.4 stops with ERROR 1055.
    - **Division:** `7 / 2` is `3` here (whole numbers) and `3.5000` in MySQL.
      The money and salary columns are stored as decimals, so `Salary / 12` works the same.
    - **Decimals** show without trailing zeros: `17500` here, `17500.00` in MySQL.
    - **`||`** joins strings here; in MySQL it means OR. Use `CONCAT`.
    - **Errors** are SQLite's wording, with no MySQL error numbers.
    - Functions that aren't added (for example `DATE_FORMAT`, `DATE_ADD ... INTERVAL`) give "no such function".
"""


SECTION_NOTE = """
!!! info "Try the queries in your browser (SQLite)"

    Exercises 12.1 to 12.19 have a **Try it** box, like Part 1's. It runs **SQLite**
    on a fresh copy of the `setup.sql` data, so use it for practice only: the exam uses
    MySQL 8.4. See Part 1's note for where SQLite and MySQL differ. Exercises 12.20 to
    12.22 change data, so do those on MySQL.
"""


def _read_solutions(sections):
    spec = importlib.util.spec_from_file_location("build_solutions", COURSE / "build_solutions.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return {
        label: sql
        for label, (_hints, sql) in module.read_solutions().items()
        if int(label.split(".")[0]) in sections and sql.strip() and label not in SKIP
    }


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


def _to_sqlite(sql):
    def table(match):
        text = match[0]
        for pattern, repl in TYPES:
            text = pattern.sub(repl, text)
        return text

    return CREATE_TABLE.sub(table, DATABASE_LINE.sub("", sql))


def on_page_markdown(markdown, page, **kwargs):
    sections = PAGES.get(page.file.src_uri)
    if sections is None:
        return markdown
    if 1 in sections:
        # After the "In this part:" line, so the note sits right above section 1.
        head, sep, rest = markdown.partition("\n## ")
        return head.rstrip("\n") + "\n" + NOTE + "\n" + sep + rest
    # Right under each section's heading.
    for n in sections:
        heading = re.search(rf"^## {n}\..*$", markdown, re.M)
        if heading:
            at = heading.end()
            markdown = markdown[:at] + "\n" + SECTION_NOTE + markdown[at:]
    return markdown


def on_page_content(html, page, **kwargs):
    sections = PAGES.get(page.file.src_uri)
    if sections is None:
        return html
    data = {
        "setup": _to_sqlite((COURSE / "setup.sql").read_text()),
        "solutions": _read_solutions(sections),
        "skip": {label: why for label, why in SKIP.items() if int(label.split(".")[0]) in sections},
    }
    blob = json.dumps(data).replace("</", "<\\/")
    return html + f'\n<script type="application/json" id="sql-runner-data">{blob}</script>\n'
