#!/usr/bin/env python3
"""Fail if any page in the built site links to a relative path that doesn't exist.

mkdocs --strict checks Markdown links, but not links written as raw HTML,
so one of those once 404'd on the live site. Links to an exercise anchor
(`#ex-7-3`, from hooks/anchors.py) must also find that anchor on the page.
Run this after `mkdocs build`:

    python3 scripts/check_links.py [site]
"""
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ATTRS = {"href", "src"}


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.found = []

    def handle_starttag(self, tag, attrs):
        for name, value in attrs:
            if name in ATTRS and value:
                self.found.append((tag, value, self.getpos()[0]))


def is_relative(url):
    """True for links like `../d427/` or `img.png`; False for `https:`, `//`, `#`, `/`."""
    parts = urlsplit(url)
    return not (parts.scheme or parts.netloc or url.startswith(("#", "/")))


def target_exists(page, url):
    parts = urlsplit(url)
    path = unquote(parts.path)
    if not path:  # just a query string, e.g. "?x=1"
        return True
    target = (page.parent / path).resolve()
    if target.is_dir():
        target = target / "index.html"
    if not target.is_file():
        return False
    if parts.fragment.startswith("ex-"):  # an exercise anchor must exist on that page
        return f'id="{parts.fragment}"' in _text(target)
    return True


_cache = {}


def _text(path):
    if path not in _cache:
        _cache[path] = path.read_text(encoding="utf-8")
    return _cache[path]


def main():
    site = Path(sys.argv[1] if len(sys.argv) > 1 else "site").resolve()
    pages = sorted(site.rglob("index.html"))
    if not pages:
        sys.exit(f"No index.html pages under {site}; run `mkdocs build` first.")

    broken = 0
    for page in pages:
        parser = Links()
        parser.feed(page.read_text(encoding="utf-8"))
        for tag, url, line in parser.found:
            if is_relative(url) and not target_exists(page, url):
                broken += 1
                print(f"{page.relative_to(site)}:{line}: <{tag}> -> {url}")

    print(f"Checked {len(pages)} pages: {broken} broken relative link(s).")
    sys.exit(1 if broken else 0)


if __name__ == "__main__":
    main()
