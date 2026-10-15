"""MkDocs hook: data for D427 exercise progress tracking (docs/javascripts/progress.js).

Every D427 page gets a small JSON blob listing each part's title, page URL, and
exercise labels (1.1, 1.2, ...), read from the 0N-*.md files at build time so the
totals always match the pages. progress.js adds a "Done" checkbox to each
exercise and draws a progress bar per part on the overview page (exercises.md),
under its "## Contents" heading. Progress is saved in the browser only.
"""
import json
import re
from pathlib import Path

COURSE = Path(__file__).resolve().parent.parent / "D427_Data_Management_Applications"
OVERVIEW = "d427/exercises.md"
ITEM = re.compile(r"^- \*\*(\d+\.\d+)\*\*", re.M)
TITLE = re.compile(r"^# (.+)$", re.M)

PANEL = """
<div class="ex-progress" id="ex-progress" markdown>
<p class="ex-progress-note">Tick <strong>Done</strong> on an exercise when you've finished it.
A passing <strong>Check</strong> in a Try it box ticks it for you. Progress is saved in this browser only.</p>
</div>
"""


def _parts():
    parts = []
    for path in sorted(COURSE.glob("0[0-9]-*.md")):
        text = path.read_text()
        labels = ITEM.findall(text)
        if not labels:
            continue
        parts.append({
            "title": TITLE.search(text)[1].strip(),
            "url": path.stem + "/",
            "labels": labels,
        })
    return parts


def on_page_markdown(markdown, page, **kwargs):
    if page.file.src_uri != OVERVIEW:
        return markdown
    heading = re.search(r"^## Contents\s*$", markdown, re.M)
    if not heading:
        return markdown
    at = heading.end()
    return markdown[:at] + "\n" + PANEL + markdown[at:]


def on_page_content(html, page, **kwargs):
    if not page.file.src_uri.startswith("d427/"):
        return html
    data = {"overview": page.file.src_uri == OVERVIEW, "parts": _parts()}
    blob = json.dumps(data).replace("</", "<\\/")
    return html + f'\n<script type="application/json" id="ex-progress-data">{blob}</script>\n'
