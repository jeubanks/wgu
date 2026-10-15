#!/usr/bin/env python3
"""CI check: every SQL runner solution still runs in SQLite, the way the browser runs it.

For each course with `sql_runner` in mkdocs.yml (extra.courses), this loads the
course's setup.sql into SQLite with hooks/sqlite_setup.py (the same translation
the site uses), adds the MySQL functions that docs/javascripts/sql-runner.js
adds, applies its query rewrites, and runs the solution of every exercise that
gets a Try it box. It fails if a solution errors or returns no result table (Check
would have nothing to compare), if a `skip` label isn't a runner exercise, if
this file's function list and sql-runner.js's have drifted apart, or if the sql.js
files on the CDN don't match the hashes pinned in sql-runner.js.

    python3 scripts/check_sql_runner.py
"""
import base64
import calendar
import hashlib
import importlib.util
import math
import re
import sqlite3
import sys
import urllib.request
from datetime import date, datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "hooks"))
import courses  # noqa: E402
import sqlite_setup  # noqa: E402

RUNNER_JS = ROOT / "docs" / "javascripts" / "sql-runner.js"

# ---------- The MySQL functions sql-runner.js adds (keep the two in step) ----------

DATE = re.compile(r"^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?")


def _date(value):
    m = DATE.match(str(value)) if value is not None else None
    if not m:
        return None
    y, mo, d, h, mi, s = (int(g or 0) for g in m.groups())
    try:
        return datetime(y, mo, d, h, mi, s)
    except ValueError:
        return None


def _part(fn):
    return lambda v: (lambda d: None if d is None else fn(d))(_date(v))


def _concat(*args):
    return None if any(a is None for a in args) else "".join(str(a) for a in args)


def _concat_ws(sep, *args):
    return None if sep is None else str(sep).join(str(a) for a in args if a is not None)


def _num(f):
    return lambda *a: None if any(x is None for x in a) else f(*a)


def _timestampdiff(unit, a, b):
    x, y = _date(a), _date(b)
    if not x or not y:
        return None
    unit = str(unit).upper()
    spans = {"SECOND": 1, "MINUTE": 60, "HOUR": 3600, "DAY": 86400, "WEEK": 604800}
    if unit in spans:
        return math.trunc((y - x).total_seconds() / spans[unit])
    months = (y.year - x.year) * 12 + (y.month - x.month)
    rest_x = ((x.day * 24 + x.hour) * 60 + x.minute) * 60 + x.second
    rest_y = ((y.day * 24 + y.hour) * 60 + y.minute) * 60 + y.second
    if months > 0 and rest_y < rest_x:
        months -= 1
    if months < 0 and rest_y > rest_x:
        months += 1
    return {"MONTH": months, "QUARTER": math.trunc(months / 3), "YEAR": math.trunc(months / 12)}[unit]


def _datediff(a, b):
    x, y = _date(a), _date(b)
    return (x.date() - y.date()).days if x and y else None


FUNCTIONS = {
    "CONCAT": (-1, _concat),
    "CONCAT_WS": (-1, _concat_ws),
    "MYSQL_IF": (3, lambda c, a, b: a if c is not None and float(c) != 0 else b),
    "MYSQL_LEFT": (2, _num(lambda s, n: str(s)[:max(0, int(n))])),
    "MYSQL_RIGHT": (2, _num(lambda s, n: str(s)[-int(n):] if n > 0 else "")),
    "CHAR_LENGTH": (1, _num(lambda s: len(str(s)))),
    "LOCATE": (2, _num(lambda sub, s: str(s).find(str(sub)) + 1)),
    "LCASE": (1, _num(lambda s: str(s).lower())),
    "UCASE": (1, _num(lambda s: str(s).upper())),
    "TRUNCATE": (2, _num(lambda x, d: math.trunc(x * 10 ** d) / 10 ** d)),
    "MOD": (2, lambda a, b: None if a is None or b is None or float(b) == 0 else math.fmod(a, b)),
    "FLOOR": (1, _num(math.floor)),
    "CEIL": (1, _num(math.ceil)),
    "CEILING": (1, _num(math.ceil)),
    "POWER": (2, _num(lambda a, b: a ** b)),
    "POW": (2, _num(lambda a, b: a ** b)),
    "SQRT": (1, lambda x: None if x is None or x < 0 else math.sqrt(x)),
    "DATEDIFF": (2, _datediff),
    "TIMESTAMPDIFF": (3, _timestampdiff),
    "YEAR": (1, _part(lambda d: d.year)),
    "MONTH": (1, _part(lambda d: d.month)),
    "DAY": (1, _part(lambda d: d.day)),
    "DAYOFMONTH": (1, _part(lambda d: d.day)),
    "HOUR": (1, _part(lambda d: d.hour)),
    "MINUTE": (1, _part(lambda d: d.minute)),
    "SECOND": (1, _part(lambda d: d.second)),
    "QUARTER": (1, _part(lambda d: (d.month + 2) // 3)),
    "DAYOFWEEK": (1, _part(lambda d: (d.weekday() + 1) % 7 + 1)),
    "DAYNAME": (1, _part(lambda d: calendar.day_name[d.weekday()])),
    "MONTHNAME": (1, _part(lambda d: calendar.month_name[d.month])),
    "CURDATE": (0, lambda: date.today().isoformat()),
    "NOW": (0, lambda: datetime.now().strftime("%Y-%m-%d %H:%M:%S")),
}

# ---------- The query rewrites sql-runner.js makes (toSqlite) ----------

TOKENS = re.compile(r"""('(?:[^'\\]|''|\\.)*'|"(?:[^"\\]|""|\\.)*"|`[^`]*`|--[^\n]*|#[^\n]*|/\*[\s\S]*?\*/)""")


def to_sqlite_query(sql):
    out = []
    for i, part in enumerate(TOKENS.split(sql)):
        if i % 2:
            if part.startswith("#"):
                part = "--" + part[1:]
            elif part.startswith('"'):
                part = "'" + part[1:-1].replace('""', '"').replace("'", "''") + "'"
            out.append(part)
            continue
        part = re.sub(r"\bTIMESTAMPDIFF\s*\(\s*([A-Za-z]+)\s*,", r"TIMESTAMPDIFF('\1',", part, flags=re.I)
        part = re.sub(r"\bLEFT\s*\(", "MYSQL_LEFT(", part, flags=re.I)
        part = re.sub(r"\bRIGHT\s*\(", "MYSQL_RIGHT(", part, flags=re.I)
        part = re.sub(r"\bIF\s*\(", "MYSQL_IF(", part, flags=re.I)
        out.append(part)
    return "".join(out)


def _statements(sql):
    """Split a script into statements, like sql.js's iterateStatements."""
    buf, out = "", []
    for line in sql.splitlines(keepends=True):
        buf += line
        if sqlite3.complete_statement(buf):
            if buf.strip():
                out.append(buf)
            buf = ""
    if buf.strip() and not re.fullmatch(r"(\s|--[^\n]*)*", buf):
        out.append(buf)
    return out


def run(setup, sql):
    """(number of result tables, error or None) for one solution on fresh data."""
    db = sqlite3.connect(":memory:")
    for name, (nargs, fn) in FUNCTIONS.items():
        db.create_function(name, nargs, fn)
    db.executescript(setup)
    tables = 0
    try:
        for stmt in _statements(to_sqlite_query(sql)):
            cur = db.execute(stmt)
            if cur.description:
                cur.fetchall()
                tables += 1
    except sqlite3.Error as err:
        return tables, str(err)
    finally:
        db.close()
    return tables, None


def _js_functions():
    text = RUNNER_JS.read_text()
    body = text[text.index("var FUNCTIONS = {"):]
    body = body[:body.index("\n  };")]
    return set(re.findall(r"^    ([A-Z_]+):", body, re.M))


def _pinned_sqljs():
    """Problems with sql.js's pinned hashes in sql-runner.js, checked against the CDN."""
    text = RUNNER_JS.read_text()
    base = re.search(r'var SQLJS = "([^"]+)"', text)[1]
    sri = re.search(r'var SQLJS_SCRIPT_SRI = "sha512-([^"]+)"', text)[1]
    wasm = re.search(r'var SQLJS_WASM_SHA256 = "([0-9a-f]{64})"', text)[1]
    problems = []
    for name, want, digest in (("sql-wasm.min.js", sri, lambda b: base64.b64encode(hashlib.sha512(b).digest()).decode()),
                               ("sql-wasm.wasm", wasm, lambda b: hashlib.sha256(b).hexdigest())):
        try:
            got = digest(urllib.request.urlopen(base + name, timeout=30).read())
        except OSError as err:
            problems.append(f"couldn't download {base + name}: {err}")
            continue
        if got != want:
            problems.append(f"{name} on the CDN doesn't match the hash pinned in sql-runner.js")
    return problems


def _mkdocs_config():
    import yaml

    class Loader(yaml.SafeLoader):
        pass

    # mkdocs.yml uses !!python/name tags (emoji settings); they don't matter here.
    Loader.add_multi_constructor("tag:yaml.org,2002:python/", lambda loader, suffix, node: None)
    return yaml.load((ROOT / "mkdocs.yml").read_text(), Loader=Loader)


def main():
    failures = []
    js, py = _js_functions(), set(FUNCTIONS)
    if js != py:
        failures.append(f"function lists differ: only in sql-runner.js {sorted(js - py)}, "
                        f"only here {sorted(py - js)}")

    failures += _pinned_sqljs()

    runner_hook = importlib.util.spec_from_file_location("sql_runner", ROOT / "hooks" / "sql_runner.py")
    hook = importlib.util.module_from_spec(runner_hook)
    runner_hook.loader.exec_module(hook)

    total = 0
    for course in courses.load(_mkdocs_config()):
        if not course.runner_pages:
            continue
        setup = sqlite_setup.to_sqlite(course.setup_sql.read_text())
        sections = {n for s in course.runner_pages.values() for n in s}
        solutions = hook.read_solutions(course, sections)
        for label in course.runner_skip:
            if int(label.split(".")[0]) not in sections:
                failures.append(f"{course.slug} {label}: in skip, but its section has no Try it boxes")
        for page, page_sections in course.runner_pages.items():
            labels = [label for label in solutions if int(label.split(".")[0]) in page_sections]
            if not labels:
                failures.append(f"{course.slug} {page}: no runner exercises in sections {list(page_sections)}")
            for label in labels:
                total += 1
                tables, error = run(setup, solutions[label])
                if error:
                    failures.append(f"{course.slug} {label}: {error}")
                elif not tables:
                    failures.append(f"{course.slug} {label}: returns no result table for Check to compare")

    for f in failures:
        print("FAIL", f)
    print(f"Checked {total} SQL runner solution(s): {len(failures)} problem(s).")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
