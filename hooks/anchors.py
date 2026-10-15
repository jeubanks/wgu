"""MkDocs hook: a link anchor on every exercise, like #ex-7-3 for exercise 7.3.

An exercise is a list item whose first paragraph starts with its bold label
(see AUTHORING.md). This gives that <li> an id, so a link can point straight at
one exercise: d427/02-changing-data/#ex-7-3. The error decoder links this way,
and the overview's Continue button jumps to the first exercise not marked Done.
Labels with letters (T.3) become lowercase (#ex-t-3). Works on every course page.
"""
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import courses  # noqa: E402  (course settings from mkdocs.yml: extra.courses)

EXERCISE = re.compile(r"<li>(\s*<p><strong>)([0-9A-Za-z]+\.\d+)(</strong>)")


def anchor(label):
    """The anchor id for an exercise label: 7.3 -> ex-7-3."""
    return "ex-" + label.lower().replace(".", "-")


def on_config(config, **kwargs):
    courses.load(config)


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
        return f'<li id="{anchor(label)}">{m[1]}{m[2]}{m[3]}'

    return EXERCISE.sub(add_id, html)
