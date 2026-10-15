#!/usr/bin/env python3
"""CI check: every page of the built site has no axe-core accessibility violations.

Serves the built site (`mkdocs build` first), opens every page in headless
Chromium with Playwright, in the light and the dark color scheme, opens every
folded box (so hints, solutions, and diagrams are checked too), and runs axe-core.
Material's color transitions are turned off first: scanning mid-transition
reports colors that never really show. Fails if any page has a violation.

axe-core comes from cdnjs at a pinned version, checked against its SHA-256.

    pip install -r requirements-ci.txt && python3 -m playwright install --with-deps chromium
    python3 scripts/check_a11y.py site            # add --channel chrome to use an installed Chrome
"""
import argparse
import functools
import hashlib
import http.server
import socketserver
import sys
import tempfile
import threading
import urllib.request
from pathlib import Path

AXE_URL = "https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js"
AXE_SHA256 = "b511cd9dec01c76f4b2ad1723b66b6db37d4c2eb4ed199076e1829d9ee7b75e3"
SCHEMES = ("default", "slate")
BASE = "/wgu/"  # site_url's path in mkdocs.yml


def axe_source():
    data = urllib.request.urlopen(AXE_URL, timeout=30).read()
    digest = hashlib.sha256(data).hexdigest()
    if digest != AXE_SHA256:
        sys.exit(f"axe-core download doesn't match its pinned SHA-256 ({digest}); not running it.")
    return data.decode("utf-8")


class _Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def serve(site):
    """Serve site/ under /wgu/ on a free port, in a background thread. Returns the base URL."""
    root = Path(tempfile.mkdtemp(prefix="a11y-"))
    (root / BASE.strip("/")).symlink_to(site.resolve(), target_is_directory=True)
    handler = functools.partial(_Quiet, directory=str(root))
    server = socketserver.TCPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    return f"http://127.0.0.1:{server.server_address[1]}{BASE}"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("site", nargs="?", default="site")
    ap.add_argument("--channel", help="a browser channel, e.g. chrome, instead of Playwright's Chromium")
    args = ap.parse_args()
    site = Path(args.site).resolve()
    pages = sorted(p.relative_to(site).parent.as_posix() for p in site.rglob("index.html"))
    if not pages:
        sys.exit(f"No pages under {site}; run `mkdocs build` first.")

    from playwright.sync_api import sync_playwright

    axe = axe_source()
    base = serve(site)
    problems = 0
    with sync_playwright() as pw:
        browser = pw.chromium.launch(channel=args.channel) if args.channel else pw.chromium.launch()
        page = browser.new_page(viewport={"width": 1280, "height": 900})
        for rel in pages:
            url = base + ("" if rel == "." else rel + "/")
            for scheme in SCHEMES:
                page.goto(url, wait_until="load")
                page.wait_for_timeout(500)  # the site's scripts add the quiz, runner, and diagrams
                page.add_style_tag(content="*, *::before, *::after { transition: none !important; "
                                           "animation: none !important; }")
                page.evaluate("""scheme => {
                    document.body.setAttribute("data-md-color-scheme", scheme);
                    document.querySelectorAll("details").forEach(d => { d.open = true; });
                    window.dispatchEvent(new Event("resize"));
                }""", scheme)
                page.wait_for_timeout(300)
                page.evaluate(axe)
                found = page.evaluate("async () => (await axe.run(document, {resultTypes: ['violations']})).violations"
                                      ".map(v => ({id: v.id, impact: v.impact, help: v.help,"
                                      " nodes: v.nodes.slice(0, 3).map(n => n.target.join(' '))}))")
                for v in found:
                    problems += 1
                    print(f"{rel} [{scheme}] {v['id']} ({v['impact']}): {v['help']}")
                    for target in v["nodes"]:
                        print(f"    {target}")
        browser.close()
    print(f"Checked {len(pages)} pages in {len(SCHEMES)} color schemes: {problems} accessibility problem(s).")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
