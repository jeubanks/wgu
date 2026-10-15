"""MkDocs hook: a folded "Show tables" ER diagram for course exercises.

Which courses and pages get them is set in mkdocs.yml (extra.courses: er_diagrams).

The exercise files stay unchanged. At build time, under each exercise whose
`**Uses:**` line names tables "from `setup.sql`", this adds a collapsed block
with an ER diagram (inline SVG from hooks/er_svg.py) of those tables plus the
tables one foreign key away, shown compact and in gray. When none of them are
linked by a foreign key, there's no diagram: a lone box adds nothing.
The schema comes from the course's setup.sql via its build_diagrams.py (D427's is
D427_Data_Management_Applications/build_diagrams.py).

On the Setup page (README.md) the Mermaid diagram, which is there for GitHub,
is swapped for the same tables drawn as SVG.

Part 1 and Section 12 have no Uses lines; there each `### Movie and Rating`
style heading names the tables, so the block goes under the heading instead.

Only tables setup.sql builds are drawn. Tables from earlier exercises
(*(from 8.1)*), the d427_drills copies in Section 11, and anything an
exercise **Creates:** are left out, so a diagram never shows a table the
learner is asked to create or design.
"""
import importlib.util
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import courses  # noqa: E402  (course settings from mkdocs.yml: extra.courses)


ITEM = re.compile(r"^- \*\*(\d+\.\d+)\*\*")
HEADING = re.compile(r"^### (.+)$")
SECTION = re.compile(r"^## ")
USES = re.compile(r"^(?P<indent>\s*)\*\*Uses:\*\*(?P<text>.*?)(?:\\|<br>)?$")
CREATES = re.compile(r"^\s*\*\*Creates:\*\*(?P<text>.*?)(?:\\|<br>)?$")
NOTE = re.compile(r"\*\([^*]*\)\*")  # *(from `setup.sql`)*
FENCE = re.compile(r"^\s*(```|~~~)")


def _load(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


_er_svg = _load("er_svg", Path(__file__).resolve().parent / "er_svg.py")


def _load_builder(course):
    return _load(f"build_diagrams_{course.slug}", course.folder / "build_diagrams.py")


def _names(text, schema):
    """Table names from setup.sql that appear as words in text, in text order."""
    words = re.findall(r"\w+", text)
    return [w for w in dict.fromkeys(words) if w in schema]


def _from_setup(uses, schema):
    """Tables in a Uses line whose note says they come from setup.sql.

    'LessonSchedule, Horse *(from `setup.sql`)*, Instructor *(from 14.1)*'
    -> LessonSchedule, Horse. A note covers the names written before it.
    """
    tables, start = [], 0
    for note in NOTE.finditer(uses):
        if "setup.sql" in note[0]:
            group = re.sub(r"\bview\s+\w+|\bindex\s+\w+", "", uses[start:note.start()])
            tables += _names(group, schema)
        start = note.end()
    return tables


def _neighbors(schema, names):
    """setup.sql tables one foreign key away from any of names (either direction)."""
    out = set()
    for t in schema.values():
        for fk in t.foreign_keys:
            if t.name in names and fk.parent not in names:
                out.add(fk.parent)
            if fk.parent in names and t.name not in names:
                out.add(t.name)
    return out


def _has_links(tables):
    return any(fk.parent in tables for t in tables.values() for fk in t.foreign_keys)


def _block(builder, schema, names, indent, diagrams, excluded=()):
    """A folded "Show tables" block, or [] when the tables have no relationships."""
    neighbors = _neighbors(schema, names) - set(excluded)
    tables = {n: schema[n] for n in schema if n in names or n in neighbors}  # setup.sql order
    if not _has_links(tables):
        return []
    used = [n for n in tables if n in names]
    title = "Tables used: " + ", ".join(used)
    diagrams.append(_svg(builder, tables, title, compact=neighbors))
    head = f'{indent}??? tables "Show tables"'
    caption = f"{indent}    The {'table' if len(used) == 1 else 'tables'} as `setup.sql` builds them"
    if neighbors:
        caption += ", with the tables they're linked to in gray (key columns only)"
    caption += ". [How to read the diagram](README.md#the-practice-database)"
    return ["", head, "", caption, "", f'{indent}    <div class="er-diagram" data-er="{len(diagrams) - 1}"></div>', ""]


def _svg(builder, tables, title, compact=()):
    """Both layouts: (side by side, stacked for narrow screens)."""
    description = builder.describe(tables)
    return (_er_svg.er_svg(tables, title, description, compact=compact),
            _er_svg.er_svg_stacked(tables, title, description, compact=compact))


def _exercises(lines):
    """Yield (start, end) line ranges of each `- **N.N**` exercise."""
    starts = [i for i, line in enumerate(lines) if ITEM.match(line)]
    for n, start in enumerate(starts):
        end = starts[n + 1] if n + 1 < len(starts) else len(lines)
        for j in range(start + 1, end):
            if HEADING.match(lines[j]) or SECTION.match(lines[j]):
                end = j
                break
        yield start, end


def _add_diagrams(markdown, builder, schema, diagrams):
    lines = markdown.split("\n")
    inserts = {}  # line index -> lines to insert after it

    # Per exercise, from its Uses line.
    for start, end in _exercises(lines):
        uses = creates = None
        for j in range(start, end):
            if FENCE.match(lines[j]):
                break
            uses = uses or (USES.match(lines[j]) and (j, USES.match(lines[j])))
            creates = creates or CREATES.match(lines[j])
        if not uses:
            continue
        j, match = uses
        names = _from_setup(match["text"], schema)
        created = _names(creates["text"], schema) if creates else []
        names = [n for n in names if n not in created]
        if not names:
            continue
        # After the paragraph that holds the Uses (and Creates) line.
        while j + 1 < end and lines[j + 1].strip():
            j += 1
        inserts[j] = _block(builder, schema, names, match["indent"], diagrams, created)

    # Per heading, where none of the heading's exercises has a Uses line.
    for i, line in enumerate(lines):
        heading = HEADING.match(line)
        if not heading:
            continue
        end = next((k for k in range(i + 1, len(lines))
                    if HEADING.match(lines[k]) or SECTION.match(lines[k])), len(lines))
        if any(USES.match(l) or CREATES.match(l) for l in lines[i:end]):
            continue
        names = _names(heading[1], schema)
        if names:
            inserts[i] = _block(builder, schema, names, "", diagrams)

    out = []
    for i, line in enumerate(lines):
        out.append(line)
        out += inserts.get(i, [])
    return "\n".join(out)


README_BLOCK = re.compile(r"<!-- er-diagram -->\n```mermaid\n.*?```\n<!-- /er-diagram -->", re.S)
PLACEHOLDER = re.compile(r'<div class="er-diagram" data-er="(\d+)"></div>')
_pages = {}  # page src_uri -> list of (wide, stacked) SVGs, from on_page_markdown to on_page_content
SVG_WIDTH = re.compile(r'<svg [^>]*\bwidth="(\d+)"')
# The stacked layout takes over when the side-by-side one doesn't fit and
# the space is phone or small-tablet width. Wider than that, it scrolls.
NARROW = 600


def on_config(config, **kwargs):
    courses.load(config)


def on_page_markdown(markdown, page, **kwargs):
    uri = page.file.src_uri
    course, name = courses.for_page(uri)
    if course is None or (name not in course.er_pages and name != course.er_readme):
        return markdown
    builder = _load_builder(course)
    schema = builder.read_schema()
    diagrams = _pages[uri] = []
    if name == course.er_readme:
        # GitHub shows the Mermaid version; the site shows the same tables as SVG.
        diagrams.append(_svg(builder, schema, f"The {course.slug} practice database"))
        return README_BLOCK.sub('<div class="er-diagram" data-er="0"></div>', markdown)
    return _add_diagrams(markdown, builder, schema, diagrams)


def on_page_content(html, page, **kwargs):
    diagrams = _pages.pop(page.file.src_uri, None)
    if not diagrams:
        return html
    def diagram(match):
        n = match[1]
        wide, stacked = diagrams[int(n)]
        wide, stacked = wide.replace("{id}", f"er{n}w"), stacked.replace("{id}", f"er{n}s")
        width = min(int(SVG_WIDTH.search(wide)[1]), NARROW)
        # A container query per diagram, since each one switches at its own width.
        return (f'<div class="er-diagram" id="er{n}">'
                f'<style>@container (max-width: {width - 1}px) {{ '
                f'#er{n} .er-wide {{ display: none; }} #er{n} .er-stacked {{ display: block; }} }}</style>'
                f'<div class="er-wide">{wide}</div><div class="er-stacked">{stacked}</div></div>')

    return PLACEHOLDER.sub(diagram, html)
