"""MkDocs hook: redirect pages for a course's old URL paths.

A course that was renamed lists its old slugs in mkdocs.yml (extra.courses:
old_slugs). After the build, every page of the course gets a small HTML page at
its old path that sends the browser to the new one, keeping any #anchor, so old
links and bookmarks keep working: c949 with old_slugs [d949] turns
/wgu/d949/01-big-o/#ex-1-2 into /wgu/c949/01-big-o/#ex-1-2.
"""
import html
import posixpath
import sys
from pathlib import Path

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


def on_post_build(config, **kwargs):
    site = Path(config["site_dir"])
    for course in courses.get():
        if not course.old_slugs:
            continue
        new_root = site / course.slug
        for page in new_root.rglob("index.html"):
            rel = page.parent.relative_to(new_root).as_posix()
            for old in course.old_slugs:
                out = site / old / rel / "index.html"
                if out.exists():
                    continue
                # Relative, so it works under any site_url: up from old/rel, into slug/rel.
                depth = 1 + (0 if rel == "." else rel.count("/") + 1)
                target = "../" * depth + posixpath.join(course.slug, rel if rel != "." else "", "")
                target = target.replace("/./", "/")
                out.parent.mkdir(parents=True, exist_ok=True)
                out.write_text(PAGE.format(target=html.escape(target),
                                           target_js=repr(target)))
