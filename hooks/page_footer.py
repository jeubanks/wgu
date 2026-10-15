"""MkDocs hook: a footer on every page with its last-updated date and two links.

- "Last updated": the date of the last commit that changed the page's source
  file (needs the full git history: the workflows check out with fetch-depth: 0).
  Left out when git can't say (a shallow clone, or a file that isn't committed).
- "View source": the page's file on GitHub. docs/d427 and docs/d949 are symlinks,
  so the link points at the real course folder, not the symlink.
- "Report a problem": a new GitHub issue with the page's title and URL filled in.
"""
import subprocess
from datetime import date
from html import escape
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parent.parent
REPO = "https://github.com/jeubanks/wgu"
LINKS = {  # docs/ symlink -> real folder in the repo
    "d427/": "D427_Data_Management_Applications/",
    "d949/": "D949_Data_Structures_And_Algorithms_I/",
}

_dates = {}


def _source(src_uri):
    for link, real in LINKS.items():
        if src_uri.startswith(link):
            return real + src_uri[len(link):]
    return "docs/" + src_uri


def _last_updated(path):
    if path not in _dates:
        try:
            out = subprocess.run(["git", "log", "-1", "--format=%cs", "--", path], cwd=ROOT,
                                 capture_output=True, text=True, timeout=10).stdout.strip()
        except (OSError, subprocess.SubprocessError):
            out = ""
        _dates[path] = date.fromisoformat(out) if out else None
    return _dates[path]


def on_page_content(html, page, config, **kwargs):
    path = _source(page.file.src_uri)
    title = page.title or config["site_name"]
    url = page.canonical_url or ""
    body = "Page: " + url + "\n\nWhat is wrong or confusing:\n\n"
    issue = f"{REPO}/issues/new?title={quote('[' + title + '] ')}&body={quote(body)}"
    parts = []
    updated = _last_updated(path)
    if updated:
        parts.append(f'Last updated <time datetime="{updated.isoformat()}">'
                     f'{updated.strftime("%B")} {updated.day}, {updated.year}</time>')
    parts.append(f'<a href="{escape(f"{REPO}/blob/main/{path}")}">View source</a>')
    parts.append(f'<a href="{escape(issue)}">Report a problem</a>')
    return html + '\n<aside class="page-footer" aria-label="About this page">' + " · ".join(parts) + "</aside>\n"
