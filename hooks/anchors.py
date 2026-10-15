"""MkDocs hook: a link anchor on every exercise, like #ex-7-3 for exercise 7.3.

An exercise is a list item whose first paragraph starts with its bold label
(see AUTHORING.md). This gives that <li> an id, so a link can point straight at
one exercise: d427/02-changing-data/#ex-7-3. The error decoder links this way,
and the overview's Continue button jumps to the first exercise not marked Done.
Labels with letters (T.3) become lowercase (#ex-t-3). Works on every course page.

Each id is also added to the page's present_anchor_ids, which MkDocs checks
links against after every page is built. Without that, MkDocs reports links to
#ex-... anchors as missing, since it only sees the ids in the Markdown output.

It also adds one search entry per exercise (titled "Exercise 7.3 · <page>", with
the start of its text), linked to its anchor, so searching "7.3" finds the
exercise itself, not just the section it's in.
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import courses  # noqa: E402  (course settings from mkdocs.yml: extra.courses)

EXERCISE = re.compile(r"<li>(\s*<p><strong>)([0-9A-Za-z]+\.\d+)(</strong>)")
TAG = re.compile(r"<[^>]+>")
SNIPPET = 240  # characters of each exercise's text in its search entry

_entries = []  # search entries, collected per page and added in on_post_build


def anchor(label):
    """The anchor id for an exercise label: 7.3 -> ex-7-3."""
    return "ex-" + label.lower().replace(".", "-")


def on_config(config, **kwargs):
    courses.load(config)
    _entries.clear()


DETAILS = re.compile(r"</?details\b[^>]*>")


def _without_folded(html):
    """html with every <details> box removed (Show tables, Hint, Solution, Answer)."""
    out, depth, at = [], 0, 0
    for m in DETAILS.finditer(html):
        if depth == 0:
            out.append(html[at:m.start()])
        depth += -1 if m[0].startswith("</") else 1
        depth = max(depth, 0)
        at = m.end()
    if depth == 0:
        out.append(html[at:])
    return "".join(out)


def _snippet(html):
    """The exercise's own text, without its folded boxes, up to the next exercise."""
    end = html.find('<li id="ex-')
    text = " ".join(TAG.sub(" ", _without_folded(html[:end if end > 0 else len(html)])).split())
    return text if len(text) <= SNIPPET else text[:SNIPPET].rsplit(" ", 1)[0] + " …"


def on_page_content(html, page, **kwargs):
    course, _name = courses.for_page(page.file.src_uri)
    if course is None:
        return html
    seen = set()

    def add_id(m):
        label = m[2]
        if label in seen:  # a label repeated on one page keeps only the first anchor
            return m[0]
        seen.add(label)
        if page.present_anchor_ids is not None:
            page.present_anchor_ids.add(anchor(label))  # so MkDocs' anchor check knows it
        return f'<li id="{anchor(label)}">{m[1]}{m[2]}{m[3]}'

    html = EXERCISE.sub(add_id, html)
    for m in re.finditer(r'<li id="(ex-[0-9a-z-]+)">', html):
        label = html[m.end():].split("</strong>", 1)[0].rsplit(">", 1)[-1]
        _entries.append({
            "location": f"{page.url}#{m[1]}",
            "title": f"Exercise {label} · {page.title}",
            "text": _snippet(html[m.end():]),
        })
    return html


def on_post_build(config, **kwargs):
    """Add the exercise entries to the search index MkDocs wrote."""
    index_path = Path(config["site_dir"]) / "search" / "search_index.json"
    if not index_path.exists() or not _entries:
        return
    index = json.loads(index_path.read_text(encoding="utf-8"))
    index["docs"].extend(_entries)
    index_path.write_text(json.dumps(index, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
