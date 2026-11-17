"""MkDocs hook: redirect pages for a course's old URLs.

Two settings in mkdocs.yml (extra.courses) make old links keep working:

- `old_slugs`: the course's earlier slugs. Every page gets a twin at the old
  slug that forwards to it: with c949's old_slugs [d949], /wgu/d949/01-big-o/
  goes to /wgu/c949/01-big-o/.
- `moved`: pages that moved inside the course, old file -> new file, like
  `01-big-o.md: code/01-big-o.md`. The old URL (under the slug and every old
  slug) forwards to the new page.

Each redirect page keeps the #anchor, so links to one exercise still land on it.
"""
import html
import posixpath
import sys
from pathlib import Path

from mkdocs.exceptions import PluginError

sys.path.insert(0, str(Path(__file__).resolve().parent))
import courses  # noqa: E402  (course settings from mkdocs.yml: extra.courses)

PAGE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Moved to {target}</title>
<link rel="canonical" href="{target}">
<meta name="robots" content="noindex">
<script>location.replace({target_js} + location.hash);</script>
<meta http-equiv="refresh" content="0; url={target}">
</head>
<body>
<p>This page moved to <a href="{target}">{target}</a>.</p>
</body>
</html>
"""


def on_config(config, **kwargs):
    courses.load(config)


def _url_dir(md):
    """The site directory of a page: a/README.md -> a, a/b.md -> a/b."""
    stem = posixpath.splitext(md)[0]
    head, name = posixpath.split(stem)
    return head if name in ("README", "index") else stem


def _write(site, src, dst):
    """A page at site/src/index.html that forwards to site/dst/ (both relative to site)."""
    out = site / src / "index.html"
    if out.exists():
        return
    up = len([p for p in src.split("/") if p])
    target = "../" * up + (dst.strip("/") + "/" if dst.strip("/") else "")
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(PAGE.format(target=html.escape(target), target_js=repr(target)))


def on_post_build(config, **kwargs):
    site = Path(config["site_dir"])
    for course in courses.get():
        for old, new in course.moved.items():
            if not (site / course.slug / _url_dir(new) / "index.html").exists():
                raise PluginError(f"extra.courses.{course.slug}.moved: {new} isn't a page")
            for slug in (course.slug, *course.old_slugs):
                _write(site, f"{slug}/{_url_dir(old)}", f"{course.slug}/{_url_dir(new)}")
        root = site / course.slug
        for page in root.rglob("index.html"):
            rel = page.parent.relative_to(root).as_posix()
            rel = "" if rel == "." else rel
            for old in course.old_slugs:
                _write(site, posixpath.join(old, rel), posixpath.join(course.slug, rel))
