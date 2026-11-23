"""MkDocs hook: the "study cards" layout for a course's topic pages.

With `cards:` in a course's settings (mkdocs.yml, extra.courses), each page
matching `pages` gets:

- a header card: an eyebrow ("Explains Algorithms · Page 2"), the title, the
  lead sentence, the "After this page you can:" list, and a meta row
  (reading time and question count);
- one card per `##` section, with a section number badge (2.1, 2.2, ...);
  the Questions section isn't wrapped, since each question is its own card;
- `data-accent` on the page wrapper, so the competency's color runs through it.

    cards:
      pages: "[0-9][0-9]-*.md"
      label: Page
      groups:                      # accent key -> title and page numbers
        explains: {title: Explains Algorithms, pages: [1, 2, 3, 4]}
      badges: true                 # number badges on section headings (2.1, 2.2, ...)
      reading: true                # "N min read" in the meta row
      sections: false              # "N sections" in the meta row
      noun: question               # what the meta row counts ("12 questions")

A "← Back" link paragraph right after the title moves to the bottom of the
header card, and an "**In this part:**" paragraph of links becomes jump chips.

Pages stay plain Markdown, so GitHub shows the same content without cards.
"""
import fnmatch
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import courses  # noqa: E402

H1 = re.compile(r"(<h1\b[^>]*>.*?</h1>)\s*", re.S)
NAV = re.compile(r"\A<p>(?P<nav><a href=\"[^\"]*\">← .*?)</p>\s*", re.S)
JUMP = re.compile(r"\A<p><strong>In this part:</strong>(?P<links>.*?)</p>\s*", re.S)
LINK = re.compile(r"<a\b[^>]*>.*?</a>", re.S)
LEAD = re.compile(r"\A<p>(?P<lead>.*?)</p>\s*", re.S)
LEARN = re.compile(r"\A<p>(?P<title>After this (?:page|part) you can:)</p>\s*<ul>(?P<items>.*?)</ul>\s*", re.S)
H2 = re.compile(r"(?=<h2\b)")
H2_OPEN = re.compile(r"<h2\b(?P<attrs>[^>]*)>")
QUESTION = re.compile(r"^- \*\*\d+\.\d+\*\*", re.M)
TAGS = re.compile(r"<[^>]+>")

_questions = {}


def on_config(config, **kwargs):
    courses.load(config)


def _setup(page):
    course, name = courses.for_page(page.file.src_uri)
    if course is None or not course.cards:
        return None, None
    if not fnmatch.fnmatch(name, course.cards.get("pages", "*.md")):
        return None, None
    return course, name


def on_page_markdown(markdown, page, **kwargs):
    course, _ = _setup(page)
    if course is not None:
        _questions[page.file.src_uri] = len(QUESTION.findall(markdown))
    return markdown


def _group(cards, number):
    for key, group in (cards.get("groups") or {}).items():
        if number in (group.get("pages") or []):
            return key, group.get("title", "")
    return None, ""


def on_page_content(html, page, **kwargs):
    course, name = _setup(page)
    if course is None:
        return html
    m = H1.search(html)
    if not m:
        return html
    before, h1, rest = html[:m.start()], m.group(1), html[m.end():]

    number = int(re.match(r"\d+", name).group()) if re.match(r"\d+", name) else None
    accent, title = _group(course.cards, number)
    label = course.cards.get("label", "Page")
    eyebrow = " · ".join(x for x in (title or course.slug.upper(), f"{label} {number}" if number else "") if x)

    nav = NAV.match(rest)
    nav_html = ""
    if nav:
        nav_html = f'<p class="wgu-nav">{nav["nav"]}</p>'
        rest = rest[nav.end():]
    lead = LEAD.match(rest)
    lead_html = ""
    if lead:
        lead_html = f'<p class="wgu-lead">{lead["lead"]}</p>'
        rest = rest[lead.end():]
    # The learn list and the "In this part" links can come in either order.
    jump_html = learn_html = ""
    for _ in range(2):
        jump = None if jump_html else JUMP.match(rest)
        if jump:
            links = "".join(LINK.findall(jump["links"]))
            jump_html = f'<p class="wgu-learn-title">In this part</p><nav class="wgu-jump" aria-label="In this part">{links}</nav>'
            rest = rest[jump.end():]
        learn = None if learn_html else LEARN.match(rest)
        if learn:
            learn_html = (f'<p class="wgu-learn-title">{learn["title"]}</p>'
                          f'<ul class="wgu-learn">{learn["items"]}</ul>')
            rest = rest[learn.end():]

    words = len(TAGS.sub(" ", rest.split('<h2 id="questions"')[0]).split())
    minutes = max(1, round(words / 200))
    count = _questions.get(page.file.src_uri, 0)
    noun = course.cards.get("noun", "question")
    meta = [f"{minutes} min read"] if course.cards.get("reading", True) else []
    sections = len(H2.findall(rest)) - (1 if '<h2 id="questions"' in rest else 0)
    if course.cards.get("sections") and sections > 1:
        meta.append(f"{sections} sections")
    if count:
        meta.append(f"{count} {noun}{'s' if count != 1 else ''}")
    meta_html = '<div class="wgu-meta">' + "".join(f"<span>{x}</span>" for x in meta) + "</div>"

    hero = (f'<header class="wgu-hero"><span class="wgu-eyebrow">{eyebrow}</span>'
            f"{h1}{lead_html}{learn_html}{jump_html}{meta_html}{nav_html}</header>")

    chunks = H2.split(rest)
    out, k = [chunks[0]], 0
    for chunk in chunks[1:]:
        if chunk.startswith('<h2 id="questions"'):
            out.append(f'<section class="wgu-questions">{chunk}</section>')
            continue
        k += 1
        badge = (f'<span class="wgu-secnum" aria-hidden="true">{number}.{k}</span>'
                 if number and course.cards.get("badges", True) else "")
        chunk = H2_OPEN.sub(lambda h: f"<h2{h['attrs']}>{badge}", chunk, count=1)
        out.append(f'<section class="wgu-card">{chunk}</section>')

    accent_attr = f' data-accent="{accent}"' if accent else ""
    return f'{before}<div class="wgu-cards"{accent_attr}>{hero}{"".join(out)}</div>'
