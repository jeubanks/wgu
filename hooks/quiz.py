"""MkDocs hook: answer keys for the interactive quiz on D427 Part 4 (concepts check).

The Markdown keeps its Hint and Answer blocks. Each question part also has a
hidden HTML comment, right after the part, with a machine-readable key:

    <!-- answer:13.1d choice: A -->                  options "A. ..." above it; "B C" = pick both
    <!-- answer:13.8a blanks: [LEFT, RIGHT, INNER] => LEFT -->
    <!-- answer:13.6b blanks: INNER => 3; RIGHT => 5 -->       labelled text boxes
    <!-- answer:13.13c blanks: CONCAT() | CONCAT -->           one unlabelled text box
    <!-- answer:13.10a-j table [True, False]: True; False; ... -->
    <!-- answer:13.2a-j table: VARCHAR(56); CHAR(2); ... -->   text boxes
    <!-- answer:13.3c written -->                     write, then mark yourself

- `blanks` entries are separated by `;`. Each is `Label [options] => answers`;
  the label and the [options] (a dropdown) are optional.
- `table` fills the empty cells of the table above the comment, in reading order.
  With one [options] group per column that has empty cells, they're dropdowns.
- `|` separates accepted answers. Text answers ignore case and spaces.
- Options are separated by commas, so an option can't contain one.

This hook checks every key against the Markdown (the options exist, the table
has that many empty cells) and puts them on the page as JSON (#quiz-data).
docs/javascripts/quiz.js finds each comment in the page and adds the controls.
"""
import json
import re

from mkdocs.exceptions import PluginError

PAGE = "d427/04-concepts-check.md"
STORAGE = "d427-quiz:04"

KEY = re.compile(r"^[ \t]*<!-- answer:(?P<id>\S+) (?P<spec>.*?) -->[ \t]*$", re.M)
SPEC = re.compile(r"^(?P<kind>choice|blanks|table|written)(?P<groups>(?:\s*\[[^\]]*\])*)\s*(?::\s*(?P<body>.*))?$")
GROUP = re.compile(r"\[([^\]]*)\]")
BLANK = re.compile(r"^(?P<label>[^\[]*?)\s*(?:\[(?P<options>[^\]]*)\])?\s*=>\s*(?P<answers>.+)$")
QUESTION = re.compile(r"^- \*\*(?P<q>\d+\.\d+)\*\*", re.M)
OPTION = re.compile(r"^[ \t]*([A-Z])\. ", re.M)
TABLE_ROW = re.compile(r"^[ \t]*\|.*\|[ \t]*$")
TABLE_RULE = re.compile(r"^[ \t]*\|[\s|:-]+\|[ \t]*$")

_parts = {}


def _split(text, sep):
    return [s.strip() for s in text.split(sep) if s.strip()]


def _empty_cells(region):
    """(row, column) of each empty body cell in the last table of the region."""
    tables, current = [], []
    for line in region.split("\n"):
        if TABLE_ROW.match(line):
            current.append(line)
        elif current:
            tables.append(current)
            current = []
    if current:
        tables.append(current)
    if not tables:
        return None
    rows = [r for r in tables[-1][1:] if not TABLE_RULE.match(r)]  # drop the header and |---|
    return [
        (r, c)
        for r, row in enumerate(rows)
        for c, cell in enumerate(row.strip().strip("|").split("|"))
        if not cell.strip()
    ]


def _parse(pid, spec, region):
    def fail(why):
        raise PluginError(f"{PAGE}: answer key {pid}: {why}")

    m = SPEC.match(spec.strip())
    if not m:
        fail(f"can't read {spec!r}")
    kind, body = m["kind"], (m["body"] or "").strip()
    groups = [_split(g, ",") for g in GROUP.findall(m["groups"] or "")]
    part = {"id": pid, "kind": kind}

    if kind == "written":
        if body or groups:
            fail("`written` takes no answer")
        part["items"] = 1
    elif kind == "choice":
        letters = body.split()
        options = OPTION.findall(region)
        if not letters or any(l not in options for l in letters):
            fail(f"{body!r} isn't among the options {options} above it")
        part.update(answer=letters, items=1)
    elif kind == "blanks":
        blanks = []
        for entry in _split(body, ";"):
            b = BLANK.match(entry)
            label, options, answers = (b["label"], b["options"], b["answers"]) if b else ("", None, entry)
            blank = {"label": label.strip(), "answers": _split(answers, "|")}
            if options is not None:
                blank["options"] = _split(options, ",")
                if any(a not in blank["options"] for a in blank["answers"]):
                    fail(f"{answers!r} isn't one of {blank['options']}")
            blanks.append(blank)
        if not blanks:
            fail("no blanks")
        part.update(blanks=blanks, items=len(blanks))
    else:  # table
        cells = _empty_cells(region)
        answers = [_split(a, "|") for a in _split(body, ";")]
        if cells is None:
            fail("there's no table above it")
        if len(cells) != len(answers):
            fail(f"{len(answers)} answers for {len(cells)} empty cells")
        if groups:
            columns = sorted({c for _, c in cells})
            if len(groups) != len(columns):
                fail(f"{len(groups)} option groups for {len(columns)} columns with empty cells")
            for (_, c), alts in zip(cells, answers):
                options = groups[columns.index(c)]
                if any(a not in options for a in alts):
                    fail(f"{alts} isn't among {options}")
        part.update(groups=groups or None, answers=answers, items=len(answers))
    return part


def on_page_markdown(markdown, page, **kwargs):
    if page.file.src_uri != PAGE:
        return markdown
    parts, start = [], 0
    for m in KEY.finditer(markdown):
        pid = m["id"]
        # The part's text: since the previous key or the start of the question.
        questions = list(QUESTION.finditer(markdown, 0, m.start()))
        if not questions:
            raise PluginError(f"{PAGE}: answer key {pid} isn't inside a question")
        q = questions[-1]
        region = markdown[max(start, q.end()):m.start()]
        if any(p["id"] == pid for p in parts):
            raise PluginError(f"{PAGE}: answer key {pid} appears twice")
        part = _parse(pid, m["spec"], region)
        part["question"] = q["q"]
        parts.append(part)
        start = m.end()
    if not parts:
        raise PluginError(f"{PAGE}: no answer keys found")
    _parts[PAGE] = parts
    return markdown


def on_page_content(html, page, **kwargs):
    if page.file.src_uri != PAGE:
        return html
    blob = json.dumps({"storage": STORAGE, "parts": _parts[PAGE]}).replace("</", "<\\/")
    return html + f'\n<script type="application/json" id="quiz-data">{blob}</script>\n'
