"""MkDocs hook: an in-browser SQL runner (SQLite via sql.js) for read-only query exercises.

Courses turn it on in mkdocs.yml (extra.courses: sql_runner), listing which
sections of which pages get it, and which exercises to leave out (`skip`, with
the reason shown in place of the box). The exercise files stay plain Markdown.
On each listed page this hook adds:

- a note saying the runner is SQLite, not MySQL: the full note (how they differ)
  on the course's first runner page, a short one under each section on the others;
- a JSON blob with the sample data (setup.sql, translated to SQLite by
  hooks/sqlite_setup.py) and the solution query for each exercise (from
  solutions.sql, via the course's build_solutions.py).

docs/javascripts/sql-runner.js finds each exercise on the page and adds the editor.
Mostly read-only queries get it. The sections listed in `changes` change data:
there each box starts from setup.sql plus the solutions of the section's earlier
exercises, and Check compares the tables (and any new table's columns) with what
the solution leaves. Changing tables (ALTER, DROP CHECK, ...) is too different in
SQLite, so those sections stay on MySQL. scripts/check_sql_runner.py checks every
runner solution in CI.
"""
import importlib.util
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import courses  # noqa: E402  (course settings from mkdocs.yml: extra.courses)
import sqlite_setup  # noqa: E402

NOTE = """
!!! info "Try the queries in your browser (SQLite)"

    Each exercise below has a **Try it** box. Type a query, press **Run** (or Ctrl+Enter),
    and **Check** compares your result with the solution's. Every run starts from a
    fresh copy of the `setup.sql` data, so nothing you run can break it.

    The box runs **SQLite**, not MySQL, so use it for practice only. This kit is written
    for **MySQL 8.4**, and the exercises that change data and tables should be done there.
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

    The read-only exercises in this section have a **Try it** box. It runs **SQLite**
    on a fresh copy of the `setup.sql` data, so use it for practice only: this kit is written
    for MySQL 8.4. The first page with Try it boxes explains where SQLite and MySQL differ.
    Exercises that change data say so instead of having a box; do those on MySQL.
"""


CHANGES_NOTE = """
!!! info "Try the statements in your browser (SQLite)"

    Each exercise below has a **Try it** box that runs **SQLite** in your browser. It starts
    from the data as it should be just before that exercise: `setup.sql`, plus the solutions
    of the earlier exercises in this section. Nothing you run is kept, so a mistake can't
    break the next exercise. **Check** compares the tables your statements leave with the
    ones the solution leaves.

    It's for practice only: this kit is written for MySQL 8.4. Error messages are SQLite's
    wording, with no MySQL error numbers, so for 7.3 and 7.9 run the failing statements on
    MySQL too. Run each statement that should fail on its own: a run stops at the first error.
"""


def on_config(config, **kwargs):
    courses.load(config)


def _section(label):
    return int(label.split(".")[0])


def read_solutions(course, sections):
    """{label: solution SQL} for the runner exercises in these sections (also used by CI)."""
    spec = importlib.util.spec_from_file_location(f"build_solutions_{course.slug}",
                                                  course.folder / "build_solutions.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return {
        label: sql
        for label, (_hints, sql) in module.read_solutions().items()
        if _section(label) in sections and sql.strip() and label not in course.runner_skip
    }


def _runner(src_uri):
    course, page = courses.for_page(src_uri)
    if course is None or page not in course.runner_pages:
        return None, None, None
    return course, page, course.runner_pages[page]


def on_page_markdown(markdown, page, **kwargs):
    course, name, sections = _runner(page.file.src_uri)
    if course is None:
        return markdown
    if name == next(iter(course.runner_pages)):
        # The course's first runner page: the full note, right above its first section.
        head, sep, rest = markdown.partition("\n## ")
        return head.rstrip("\n") + "\n" + NOTE + "\n" + sep + rest
    # Other pages: a short note right under each runner section's heading.
    for n in sections:
        heading = re.search(rf"^## {n}\..*$", markdown, re.M)
        if heading:
            at = heading.end()
            note = CHANGES_NOTE if n in course.runner_changes else SECTION_NOTE
            markdown = markdown[:at] + "\n" + note + markdown[at:]
    return markdown


def on_page_content(html, page, **kwargs):
    course, _name, sections = _runner(page.file.src_uri)
    if course is None:
        return html
    data = {
        "setup": sqlite_setup.to_sqlite(course.setup_sql.read_text()),
        "solutions": read_solutions(course, sections),
        "skip": {label: why for label, why in course.runner_skip.items() if _section(label) in sections},
        "changes": [n for n in sections if n in course.runner_changes],
    }
    data["order"] = list(data["solutions"])  # page order, for the changes sections' start states
    blob = json.dumps(data).replace("</", "<\\/")
    return html + f'\n<script type="application/json" id="sql-runner-data">{blob}</script>\n'
