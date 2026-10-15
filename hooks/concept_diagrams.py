"""MkDocs hook: join, ON DELETE, and self-join pictures, drawn from a course's setup.sql rows.

Courses turn it on with `concept_diagrams: true` in mkdocs.yml (extra.courses).

An exercise file describes a picture in an HTML comment, which GitHub hides,
and keeps plain text for GitHub readers up to the closing comment:

    <!-- join-diagram
    from: Employee e | FirstName, DeptID | EmpID IN (7, 8, 10, 15)
    join: Department d | DeptID, DeptName | DeptID IN (20, 30, 60)
    on: e.DeptID = d.DeptID
    select: e.FirstName, d.DeptName
    INNER: Caption for the INNER JOIN tab (Markdown).
    LEFT: ...
    RIGHT: ...
    -->
    Text that GitHub shows instead.
    <!-- /join-diagram -->

`from` and `join` are: table and alias | columns to show | which rows (a WHERE
condition). Each INNER / LEFT / RIGHT line adds a tab with that join.

    <!-- delete-diagram
    parent: Student | ID, FirstName | ID IN (1, 3)
    child: LessonSchedule | StudentID, LessonDateTime | StudentID IN (1, 3)
    fk: StudentID -> ID
    delete: ID = 1
    CASCADE: ...
    SET NULL: ...
    RESTRICT: ...
    -->

Each rule line adds a tab: the rows before and after `DELETE FROM parent WHERE delete`.

    <!-- tree-diagram
    rows: Employee | EmpID, FirstName, ManagerID
    parent: ManagerID -> EmpID
    label: FirstName
    caption: Text above the picture (Markdown).
    -->

A table whose foreign key points at its own primary key (the setup for a
self-join), drawn as an org chart next to its rows. No tabs.

On the site the whole block, fallback text included, becomes the tabs. The rows
come from setup.sql (loaded into SQLite with hooks/sqlite_setup.py),
so the pictures stay true to the data. The SVG is drawn by hooks/concept_svg.py.

Optional lines, for both kinds:

- `table: Bus(BusID, Route) = 10, Red; 20, Blue` makes up a table for this
  picture only (an illustration that no exercise uses). The which-rows part of
  `from:` / `parent:` can then be left out.
- `fold: Title` puts the tabs in a folded tip box.
- `in: solution` moves the picture into the exercise's Solution box, the next
  one after the comment. `heading: Text` replaces its bold heading there
  ("The foreign key at work:"). Use it when the picture is the answer. Leave the
  fallback text empty: GitHub readers have the solution's SQL comments.
"""
import importlib.util
import re
import sqlite3
import sys
from pathlib import Path

HOOKS = Path(__file__).resolve().parent
sys.path.insert(0, str(HOOKS))  # concept_svg imports er_svg
for _name in ("er_svg", "concept_svg", "sqlite_setup"):  # mkdocs serve reloads this hook; pick up edits
    sys.modules.pop(_name, None)

import concept_svg  # noqa: E402
import courses  # noqa: E402  (course settings from mkdocs.yml: extra.courses)
import sqlite_setup  # noqa: E402

BLOCK = re.compile(r"^(?P<indent>[ \t]*)<!-- (?P<kind>join|delete|tree)-diagram\n(?P<spec>.*?)^[ \t]*-->\n"
                   r".*?^[ \t]*<!-- /(?P=kind)-diagram -->[ \t]*$", re.M | re.S)
JOINS = ("INNER", "LEFT", "RIGHT")
RULES = ("CASCADE", "SET NULL", "RESTRICT")
PLACEHOLDER = re.compile(r'<div class="cd-diagram" data-cd="(\d+)"></div>')
SVG_WIDTH = re.compile(r'<svg [^>]*\bwidth="(\d+)"')
DATETIME = re.compile(r"^(\d{4}-\d\d-\d\d \d\d:\d\d):00$")

LEGENDS = {
    "join": [("match", "matched rows"), ("kept", "kept with no match: the other side is NULL"),
             ("dropped", "no match, left out")],
    "delete": [("match", "foreign key link"), ("dropped", "row deleted"), ("changed", "set to NULL")],
}

_pages = {}  # page src_uri -> list of (wide, narrow) SVGs


def _db(course):
    db = sqlite3.connect(":memory:")
    db.executescript(sqlite_setup.to_sqlite(course.setup_sql.read_text()))
    return db


def _show(value):
    if isinstance(value, str) and DATETIME.match(value):
        return DATETIME.match(value)[1]  # drop the :00 seconds to save width
    return value


def _rows(db, table, cols, where):
    rows = db.execute(f"SELECT {', '.join(cols)} FROM {table} WHERE {where} ORDER BY 1").fetchall()
    if not rows:
        raise ValueError(f"no rows in {table} WHERE {where}")
    return [tuple(_show(v) for v in r) for r in rows]


def _spec(text):
    """'key: value' lines -> dict, keeping the order of the tab lines. `table:` lines -> a list."""
    spec = {"table": []}
    for line in text.strip().splitlines():
        key, _, value = line.strip().partition(":")
        if key.strip() == "table":
            spec["table"].append(value.strip())
        else:
            spec[key.strip()] = value.strip()
    return spec


MADE_UP = re.compile(r"^(\w+)\(([^)]*)\)\s*=\s*(.+)$")


def _value(text):
    text = text.strip()
    if text == "NULL":
        return None
    return int(text) if re.fullmatch(r"-?\d+", text) else text


def _make_tables(db, tables):
    """Create the made-up `table:` tables, for this picture only."""
    for line in tables:
        m = MADE_UP.match(line)
        if not m:
            raise ValueError(f"table: expects Name(col, ...) = v, v; v, v: {line}")
        name, cols = m[1], [c.strip() for c in m[2].split(",")]
        rows = [[_value(v) for v in row.split(",")] for row in m[3].split(";")]
        if any(len(r) != len(cols) for r in rows):
            raise ValueError(f"table {name}: each row needs {len(cols)} values")
        db.execute(f"DROP TABLE IF EXISTS temp.{name}")
        db.execute(f"CREATE TEMP TABLE {name} ({', '.join(cols)})")
        db.executemany(f"INSERT INTO temp.{name} VALUES ({', '.join('?' * len(cols))})", rows)


def _source(value):
    """'Employee e | FirstName, DeptID | EmpID IN (...)' -> (table, alias, cols, where)."""
    parts = [p.strip() for p in value.split("|")]
    name, cols = parts[0], parts[1]
    where = parts[2] if len(parts) > 2 else "1 = 1"
    table, _, alias = name.partition(" ")
    return table, alias.strip() or table, [c.strip() for c in cols.split(",")], where


def _describe_row(cols, row):
    return ", ".join(f"{c} {concept_svg._text(v)}" for c, v in zip(cols, row))


class Join:
    """Rows of one join, with which rows match and what the join keeps."""

    def __init__(self, db, spec, kind):
        lt, la, lcols, lwhere = _source(spec["from"])
        rt, ra, rcols, rwhere = _source(spec["join"])
        on_l, on_r = (s.strip().split(".") for s in spec["on"].split("="))
        if on_l[0] != la or on_r[0] != ra:
            raise ValueError(f"'on' must be {la}.column = {ra}.column: {spec['on']}")
        self.kind = kind
        self.left_title = f"{lt} {la}" if la != lt else lt
        self.right_title = f"{rt} {ra}" if ra != rt else rt
        self.left_cols, self.right_cols = lcols, rcols
        self.left_key, self.right_key = lcols.index(on_l[1]), rcols.index(on_r[1])
        self.left_rows = _rows(db, lt, lcols, lwhere)
        self.right_rows = _rows(db, rt, rcols, rwhere)
        self.on = spec["on"]
        self.pairs = [(i, j) for i, l in enumerate(self.left_rows) for j, r in enumerate(self.right_rows)
                      if l[self.left_key] is not None and l[self.left_key] == r[self.right_key]]
        matched_l = {i for i, _ in self.pairs}
        matched_r = {j for _, j in self.pairs}
        keep_l, keep_r = kind == "LEFT", kind == "RIGHT"
        self.left_states = ["" if i in matched_l else ("kept" if keep_l else "dropped")
                            for i in range(len(self.left_rows))]
        self.right_states = ["" if j in matched_r else ("kept" if keep_r else "dropped")
                             for j in range(len(self.right_rows))]

        select = [s.strip().split(".") for s in spec["select"].split(",")]
        self.result_cols = [".".join(s) for s in select]

        def pick(l, r):
            out = []
            for alias, col in select:
                row, cols = (l, lcols) if alias == la else (r, rcols)
                out.append(None if row is None else row[cols.index(col)])
            return tuple(out)

        self.result = [pick(self.left_rows[i], self.right_rows[j]) for i, j in self.pairs]
        self.result_states = [""] * len(self.result)
        if keep_l:
            for i in range(len(self.left_rows)):
                if i not in matched_l:
                    self.result.append(pick(self.left_rows[i], None))
                    self.result_states.append("kept")
        if keep_r:
            for j in range(len(self.right_rows)):
                if j not in matched_r:
                    self.result.append(pick(None, self.right_rows[j]))
                    self.result_states.append("kept")

    def describe(self):
        parts = [f"{self.left_title} rows: "
                 + "; ".join(_describe_row(self.left_cols, r) for r in self.left_rows) + ".",
                 f"{self.right_title} rows: "
                 + "; ".join(_describe_row(self.right_cols, r) for r in self.right_rows) + ".",
                 f"Rows match on {self.on}."]
        for title, cols, rows, states in ((self.left_title, self.left_cols, self.left_rows, self.left_states),
                                          (self.right_title, self.right_cols, self.right_rows, self.right_states)):
            for row, state in zip(rows, states):
                if state:
                    what = "kept, with NULLs for the other table" if state == "kept" else "left out"
                    parts.append(f"No match for {title} row {_describe_row(cols, row)}: {what}.")
        parts.append(f"Result, {len(self.result)} rows: "
                     + "; ".join(_describe_row(self.result_cols, r) for r in self.result) + ".")
        return " ".join(parts)


class DeleteCase:
    """A parent row and its child rows before and after a DELETE, under one rule."""

    def __init__(self, db, spec, rule):
        pt, _, pcols, pwhere = _source(spec["parent"])
        ct, _, ccols, cwhere = _source(spec["child"])
        fk, parent_col = (s.strip() for s in spec["fk"].split("->"))
        self.rule = rule
        self.parent_title, self.child_title = pt, ct
        self.parent_cols, self.child_cols = pcols, ccols
        self.parent_key, self.child_key = pcols.index(parent_col), ccols.index(fk)
        self.parent_rows = _rows(db, pt, pcols, pwhere)
        child_rows = _rows(db, ct, ccols, cwhere)
        gone = {r[0] for r in db.execute(f"SELECT {parent_col} FROM {pt} WHERE {spec['delete']}")}
        self.statement = f"DELETE FROM {pt} WHERE {spec['delete']};"
        self.error = rule == "RESTRICT"

        def links(rows):
            return [(ci, pi) for ci, c in enumerate(rows) for pi, p in enumerate(self.parent_rows)
                    if c[self.child_key] is not None and c[self.child_key] == p[self.parent_key]]

        hit = [c[self.child_key] in gone for c in child_rows]
        self.before = ([""] * len(self.parent_rows), child_rows, [""] * len(child_rows), {}, links(child_rows))
        parent_after = ["deleted" if p[self.parent_key] in gone else "" for p in self.parent_rows]
        if rule == "CASCADE":
            states = ["deleted" if h else "" for h in hit]
            self.after = (parent_after, child_rows, states, {},
                          [(ci, pi) for ci, pi in links(child_rows) if not hit[ci]])
            self.after_label = "After: the child rows are deleted too"
        elif rule == "SET NULL":
            rows = [tuple(None if (h and j == self.child_key) else v for j, v in enumerate(c))
                    for c, h in zip(child_rows, hit)]
            marks = {(ci, self.child_key): "changed" for ci, h in enumerate(hit) if h}
            self.after = (parent_after, rows, [""] * len(rows), marks, links(rows))
            self.after_label = "After: the child rows stay, with no parent"
        else:
            self.after = self.before
            self.after_label = "After: ERROR 1451, nothing is deleted"
        self.gone, self.hit = gone, hit
        self.child_rows = child_rows

    def describe(self):
        parent = "; ".join(_describe_row(self.parent_cols, r) for r in self.parent_rows)
        children = "; ".join(_describe_row(self.child_cols, r) for r in self.child_rows)
        n = sum(self.hit)
        effect = {
            "CASCADE": f"The parent row and its {n} child rows are deleted.",
            "SET NULL": f"The parent row is deleted. Its {n} child rows stay, "
                        f"with {self.child_cols[self.child_key]} set to NULL.",
            "RESTRICT": "The DELETE fails with ERROR 1451 and no rows change.",
        }[self.rule]
        return (f"{self.parent_title} rows: {parent}. {self.child_title} rows: {children}. "
                f"Statement: {self.statement} {effect}")


class Tree:
    """A table that points at itself, as parent links between its rows."""

    def __init__(self, db, spec):
        table, _, cols, where = _source(spec["rows"])
        self.parent_col, self.key_col = (s.strip() for s in spec["parent"].split("->"))
        label = spec.get("label", cols[1])
        self.title, self.cols = table, cols
        self.rows = _rows(db, table, cols, where)
        ki, pi, li = cols.index(self.key_col), cols.index(self.parent_col), cols.index(label)
        ids = [r[ki] for r in self.rows]
        self.names = {r[ki]: _text(r[li]) for r in self.rows}
        self.parent = {r[ki]: (r[pi] if r[pi] in ids else None) for r in self.rows}
        self.children = {i: [r[ki] for r in self.rows if self.parent[r[ki]] == i] for i in ids}
        self.roots = [i for i in ids if self.parent[i] is None]
        self.order, self.depth = [], {}

        def walk(n, d):
            self.order.append(n)
            self.depth[n] = d
            for k in self.children[n]:
                walk(k, d + 1)

        for r in self.roots:
            walk(r, 0)
        if len(self.order) != len(ids):
            raise ValueError(f"tree-diagram: {table} has a loop in {self.parent_col}")

    def describe(self):
        parts = []
        for n in self.order:
            p = self.parent[n]
            who = f"{self.names[n]} ({self.key_col} {n})"
            parts.append(f"{who} has no {self.parent_col}, so is at the top." if p is None
                         else f"{who} has {self.parent_col} {p}, which points at {self.names[p]}.")
        return f"{self.title} rows, drawn as a chart: " + " ".join(parts)


def _text(value):
    return concept_svg._text(value)


def _expand(match, db, diagrams, pending):
    indent, kind, spec = match["indent"], match["kind"], _spec(match["spec"])
    _make_tables(db, spec["table"])
    if kind == "tree":
        return _expand_tree(indent, spec, db, diagrams, pending)
    tabs = [k for k in spec if k in (JOINS if kind == "join" else RULES)]
    if not tabs:
        raise ValueError(f"{kind}-diagram has no tabs: {spec}")
    out = []
    pad = indent
    if "fold" in spec:
        out += [f'{indent}??? tip "{spec["fold"]}"', ""]
        pad = indent + "    "
    for tab in tabs:
        if kind == "join":
            case = Join(db, spec, tab)
            label = f"{tab} JOIN"
            title = f"{tab} JOIN of {case.left_title} and {case.right_title}"
            if spec["table"]:
                title += " (made-up tables)"
            diagrams.append(concept_svg.join_svg(case, title, case.describe()))
        else:
            case = DeleteCase(db, spec, tab)
            label = f"ON DELETE {tab}"
            title = ("Made-up tables: " if spec["table"] else "") + f"ON DELETE {tab}: deleting a {case.parent_title} row that has {case.child_title} rows"
            diagrams.append(concept_svg.delete_svg(case, title, case.describe()))
        out += [f'{pad}=== "{label}"', "", f"{pad}    {spec[tab]}", "",
                f'{pad}    <div class="cd-diagram" data-cd="{len(diagrams) - 1}"></div>', ""]
    legend = "".join(f'<span class="cd-key-{k}">{text}</span>' for k, text in LEGENDS[kind])
    if spec["table"]:
        legend += '<span class="cd-made-up">Made-up tables for illustration, not in <code>setup.sql</code></span>'

    out.append(f'{pad}<p class="cd-legend">{legend}</p>')
    if spec.get("in") == "solution":
        pending.append((spec.get("heading", "The foreign key at work:"), out))
        return f"{indent}<!-- cd-pending {len(pending) - 1} -->"
    return "\n".join(out)


def _expand_tree(indent, spec, db, diagrams, pending):
    tree = Tree(db, spec)
    title = ("Made-up table: " if spec["table"] else "") + \
        f"{tree.title} as a chart: each {tree.parent_col} points at another row's {tree.key_col}"
    diagrams.append(concept_svg.tree_svg(tree, title, tree.describe()))
    pad = indent
    out = []
    if "fold" in spec:
        out += [f'{indent}??? tip "{spec["fold"]}"', ""]
        pad = indent + "    "
    if spec.get("caption"):
        out += [f"{pad}{spec['caption']}", ""]
    out.append(f'{pad}<div class="cd-diagram" data-cd="{len(diagrams) - 1}"></div>')
    if spec["table"]:
        out += ["", f'{pad}<p class="cd-legend"><span class="cd-made-up">Made-up table for illustration, '
                    f'not in <code>setup.sql</code></span></p>']
    if spec.get("in") == "solution":
        pending.append((spec.get("heading", "The foreign key at work:"), out))
        return f"{indent}<!-- cd-pending {len(pending) - 1} -->"
    return "\n".join(out)


PENDING = re.compile(r"^(?P<indent>[ \t]*)<!-- cd-pending (?P<n>\d+) -->$")


def _into_solutions(markdown, pending):
    """Move each `in: solution` picture to the end of the next Solution box."""
    lines = markdown.split("\n")
    for i in range(len(lines) - 1, -1, -1):  # backwards, so earlier indexes stay put
        m = PENDING.match(lines[i])
        if not m:
            continue
        indent = m["indent"]
        start = next((k for k in range(i, len(lines))
                      if lines[k].strip() == "<summary>Solution</summary>"), None)
        if start is None:
            raise ValueError("in: solution, but no Solution box after the picture")
        end = next(k for k in range(start, len(lines)) if lines[k] == f"{indent}</details>")
        heading, block = pending[int(m["n"])]
        lines[end:end] = ["", f"{indent}**{heading}**", ""] + block + [""]
        del lines[i]
    return "\n".join(lines)


def on_config(config, **kwargs):
    courses.load(config)


def on_page_markdown(markdown, page, **kwargs):
    course, _name = courses.for_page(page.file.src_uri)
    if course is None or not course.concept_diagrams or not BLOCK.search(markdown):
        return markdown
    db, diagrams, pending = _db(course), [], []
    markdown = BLOCK.sub(lambda m: _expand(m, db, diagrams, pending), markdown)
    markdown = _into_solutions(markdown, pending)
    _pages[page.file.src_uri] = diagrams
    return markdown


def on_page_content(html, page, **kwargs):
    diagrams = _pages.pop(page.file.src_uri, None)
    if not diagrams:
        return html

    def diagram(match):
        n = match[1]
        wide, narrow = diagrams[int(n)]
        wide, narrow = wide.replace("{id}", f"cd{n}w"), narrow.replace("{id}", f"cd{n}n")
        width = int(SVG_WIDTH.search(wide)[1])
        # Like the ER diagrams (hooks/er_diagrams.py), but these never scroll:
        # the narrow layout takes over whenever the wide one doesn't fit.
        return (f'<div class="cd-diagram" id="cd{n}">'
                f'<style>@container (max-width: {width - 1}px) {{ '
                f'#cd{n} .er-wide {{ display: none; }} #cd{n} .er-stacked {{ display: block; }} }}</style>'
                f'<div class="er-wide">{wide}</div><div class="er-stacked">{narrow}</div></div>')

    return PLACEHOLDER.sub(diagram, html)
