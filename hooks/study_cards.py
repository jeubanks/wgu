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

Pages stay plain Markdown, so GitHub shows the same content without cards.
"""
import fnmatch
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import courses  # noqa: E402

H1 = re.compile(r"(<h1\b[^>]*>.*?</h1>)\s*", re.S)
LEAD = re.compile(r"\A<p>(?P<lead>.*?)</p>\s*", re.S)
LEARN = re.compile(r"\A<p>After this page you can:</p>\s*<ul>(?P<items>.*?)</ul>\s*", re.S)
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

    lead = LEAD.match(rest)
    lead_html = ""
    if lead:
        lead_html = f'<p class="wgu-lead">{lead["lead"]}</p>'
        rest = rest[lead.end():]
    learn = LEARN.match(rest)
    learn_html = ""
    if learn:
        learn_html = ('<p class="wgu-learn-title">After this page you can:</p>'
                      f'<ul class="wgu-learn">{learn["items"]}</ul>')
        rest = rest[learn.end():]

    words = len(TAGS.sub(" ", rest.split('<h2 id="questions"')[0]).split())
    minutes = max(1, round(words / 200))
    count = _questions.get(page.file.src_uri, 0)
    meta = [f"{minutes} min read"]
    if count:
        meta.append(f"{count} question{'s' if count != 1 else ''}")
    meta_html = '<div class="wgu-meta">' + "".join(f"<span>{x}</span>" for x in meta) + "</div>"

    hero = (f'<header class="wgu-hero"><span class="wgu-eyebrow">{eyebrow}</span>'
            f"{h1}{lead_html}{learn_html}{meta_html}</header>")

    chunks = H2.split(rest)
    out, k = [chunks[0]], 0
    for chunk in chunks[1:]:
        if chunk.startswith('<h2 id="questions"'):
            out.append(f'<section class="wgu-questions">{chunk}</section>')
            continue
        k += 1
        badge = f'<span class="wgu-secnum" aria-hidden="true">{number}.{k}</span>' if number else ""
        chunk = H2_OPEN.sub(lambda h: f"<h2{h['attrs']}>{badge}", chunk, count=1)
        out.append(f'<section class="wgu-card">{chunk}</section>')

    accent_attr = f' data-accent="{accent}"' if accent else ""
    return f'{before}<div class="wgu-cards"{accent_attr}>{hero}{"".join(out)}</div>'
