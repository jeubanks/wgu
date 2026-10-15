"""MkDocs hook: data for exercise progress tracking (docs/javascripts/progress.js).

Courses turn it on in mkdocs.yml (extra.courses: progress), naming an overview
page and a glob of exercise pages. Every page of such a course gets a small JSON
blob listing each part's title, page URL, and exercise labels (1.1, 1.2, ...),
read from those pages at build time so the totals always match. progress.js adds
a "Done" checkbox to each exercise and draws a progress bar per part on the
overview page, under its "## Contents" heading. Progress is saved in the browser
only, under "<course>-progress".
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import courses  # noqa: E402  (course settings from mkdocs.yml: extra.courses)
ITEM = re.compile(r"^- \*\*(\d+\.\d+)\*\*", re.M)
TITLE = re.compile(r"^# (.+)$", re.M)

PANEL = """
<div class="ex-progress" id="ex-progress" markdown>
<p class="ex-progress-note">Tick <strong>Done</strong> on an exercise when you've finished it.
A passing <strong>Check</strong> in a Try it box ticks it for you. Progress is saved in this browser only.</p>
</div>
"""


def on_config(config, **kwargs):
    courses.load(config)


def _tracked(src_uri):
    course, name = courses.for_page(src_uri)
    return (course, name) if course is not None and course.progress_overview else (None, None)


def _parts(course):
    parts = []
    for path in sorted(course.folder.glob(course.progress_pages)):
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
    course, name = _tracked(page.file.src_uri)
    if course is None or name != course.progress_overview:
        return markdown
    heading = re.search(r"^## Contents\s*$", markdown, re.M)
    if not heading:
        return markdown
    at = heading.end()
    return markdown[:at] + "\n" + PANEL + markdown[at:]


def on_page_content(html, page, **kwargs):
    course, name = _tracked(page.file.src_uri)
    if course is None:
        return html
    data = {"key": f"{course.slug}-progress", "overview": name == course.progress_overview,
            "parts": _parts(course)}
    blob = json.dumps(data).replace("</", "<\\/")
    return html + f'\n<script type="application/json" id="ex-progress-data">{blob}</script>\n'
