"""MkDocs hook: a folded "Show tables" ER diagram for D427 exercises.

The exercise files stay unchanged. At build time, under each exercise whose
`**Uses:**` line names tables "from `setup.sql`", this adds a collapsed block
with a Mermaid erDiagram of just those tables and the foreign keys between them
(drawn by D427_Data_Management_Applications/build_diagrams.py from setup.sql).

Part 1 and Section 12 have no Uses lines; there each `### Movie and Rating`
style heading names the tables, so the block goes under the heading instead.

Only tables setup.sql builds are drawn. Tables from earlier exercises
(*(from 8.1)*), the d427_drills copies in Section 11, and anything an
exercise **Creates:** are left out, so a diagram never shows a table the
learner is asked to create or design.
"""
import importlib.util
import re
from pathlib import Path

COURSE = Path(__file__).resolve().parent.parent / "D427_Data_Management_Applications"
PAGES = {"d427/01-queries.md", "d427/02-changing-data.md",
         "d427/03-assessment-drills.md", "d427/05-mock-assessment.md"}

ITEM = re.compile(r"^- \*\*(\d+\.\d+)\*\*")
HEADING = re.compile(r"^### (.+)$")
SECTION = re.compile(r"^## ")
USES = re.compile(r"^(?P<indent>\s*)\*\*Uses:\*\*(?P<text>.*?)(?:\\|<br>)?$")
CREATES = re.compile(r"^\s*\*\*Creates:\*\*(?P<text>.*?)(?:\\|<br>)?$")
NOTE = re.compile(r"\*\([^*]*\)\*")  # *(from `setup.sql`)*
FENCE = re.compile(r"^\s*(```|~~~)")


def _load_builder():
    spec = importlib.util.spec_from_file_location("build_diagrams", COURSE / "build_diagrams.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


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


def _block(builder, schema, names, indent):
    tables = {n: schema[n] for n in schema if n in names}  # setup.sql order
    title = "Tables used: " + ", ".join(tables)
    diagram = builder.er_diagram(tables, title)
    body = [f"{indent}    ```mermaid"]
    body += [f"{indent}    {line}" if line else "" for line in diagram.split("\n")]
    body += [f"{indent}    ```"]
    head = f'{indent}??? tables "Show tables"'
    caption = (f"{indent}    The {'table' if len(tables) == 1 else 'tables'} as `setup.sql` "
               "builds them. [How to read the diagram](README.md#the-practice-database)")
    return ["", head, "", caption, ""] + body + [""]


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


def _add_diagrams(markdown, builder, schema):
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
        if creates:
            names = [n for n in names if n not in _names(creates["text"], schema)]
        if not names:
            continue
        # After the paragraph that holds the Uses (and Creates) line.
        while j + 1 < end and lines[j + 1].strip():
            j += 1
        inserts[j] = _block(builder, schema, names, match["indent"])

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
            inserts[i] = _block(builder, schema, names, "")

    out = []
    for i, line in enumerate(lines):
        out.append(line)
        out += inserts.get(i, [])
    return "\n".join(out)


def on_page_markdown(markdown, page, **kwargs):
    if page.file.src_uri not in PAGES:
        return markdown
    builder = _load_builder()
    return _add_diagrams(markdown, builder, builder.read_schema())
