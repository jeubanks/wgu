#!/usr/bin/env python3
"""Copy hints, answers, and lesson code from the Python files into the exercise pages.

The Python files are the source of truth. After changing one, run:

    python3 build_solutions.py

For each lesson page 0N-*.md, this reads c949-practice/lessonN.py and
c949-practice/solutions/lessonN.py and writes three kinds of generated block:

- `<!-- lesson-code -->` ... `<!-- /lesson-code -->`: the lesson code from the
  top of lessonN.py (between its "lesson code" and "exercises" rules), folded.
- Under each exercise **N.M**, folded Hint and Solution blocks between
  `<!-- solution:N.M -->` and `<!-- /solution -->`.

In the solutions file, the exercise region runs from the "exercises" (or
"answers") rule to the "checks" rule. Each top-level statement there belongs
to an exercise label, found in this order:

1. a def or class whose docstring starts with the label (`'''2.2 Reverse ...'''`);
2. otherwise the last label comment above it: `# 2.1 Trace ...`, `# 1.3b ...`,
   or a bare `# [7.5]` marker.

A label's statements, in file order, make its Solution. Comment lines
`# Hint N.M: text` become its Hint, one bullet each. A label with only hints
gets just a Hint block, placed above the exercise's own hand-written Answer.
Blocks from an earlier run are replaced, so running it again is always safe.
"""
import ast
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
CODE = HERE / "c949-practice"
PAGES = sorted(HERE.glob("0[0-9]-*.md"))

RULE = re.compile(r"^# -+ ?(\w[\w ]*)$")
LABEL_COMMENT = re.compile(r"^# (?:\[(\d+\.\d+)\]|(\d+\.\d+)[a-z]?\b)")
HINT = re.compile(r"^# Hint (\d+\.\d+):\s*(.*)$")
DOC_LABEL = re.compile(r"^(\d+\.\d+)[a-z]?\b")
ITEM = re.compile(r"^- \*\*(\d+\.\d+)\*\*")
BLOCK = re.compile(r"\n*  <!-- solution:[\d.]+ -->\n.*?  <!-- /solution -->\n", re.S)
LESSON_BLOCK = re.compile(r"<!-- lesson-code -->\n.*?<!-- /lesson-code -->", re.S)


def regions(lines):
    """Line numbers (1-based) of the lesson-code, exercise, and checks rules."""
    found = {}
    for i, line in enumerate(lines, 1):
        m = RULE.match(line)
        if m:
            found[m.group(1).strip()] = i
    return found


def lesson_code(path):
    """The lesson code at the top of a lesson file, or '' if it has none."""
    lines = path.read_text().splitlines()
    r = regions(lines)
    if "lesson code" not in r:
        return ""
    end = r.get("exercises", r.get("answers"))
    return "\n".join(lines[r["lesson code"]:end - 1]).strip("\n")


def read_solutions(path):
    """Return {label: (hints, code)} from one solutions file."""
    text = path.read_text()
    lines = text.splitlines()
    r = regions(lines)
    start = r.get("exercises", r.get("answers"))
    end = r["checks"]

    hints, code = {}, {}
    for line in lines[start:end - 1]:
        h = HINT.match(line)
        if h:
            hints.setdefault(h.group(1), []).append(h.group(2))

    # Label comments by line, to find the one above each statement.
    marks = []
    for i in range(start, end):
        m = LABEL_COMMENT.match(lines[i - 1])
        if m and not HINT.match(lines[i - 1]):
            marks.append((i, m.group(1) or m.group(2)))

    for node in ast.parse(text).body:
        if not (start < node.lineno < end):
            continue
        label = None
        if isinstance(node, (ast.FunctionDef, ast.ClassDef)):
            doc = ast.get_docstring(node) or ""
            m = DOC_LABEL.match(doc)
            if m:
                label = m.group(1)
        if label is None:
            above = [lab for i, lab in marks if i < node.lineno]
            if not above:
                sys.exit(f"{path.name}:{node.lineno}: no exercise label above this")
            label = above[-1]
        src = "\n".join(lines[node.lineno - 1:node.end_lineno])
        code.setdefault(label, []).append(src)

    labels = set(hints) | set(code)
    return {lab: (hints.get(lab, []), "\n\n".join(code.get(lab, []))) for lab in labels}


def block(label, hints, code):
    parts = [f"  <!-- solution:{label} -->"]
    if hints:
        parts += ["  <details>", "  <summary>Hint</summary>", ""]
        parts += [f"  - {h}" for h in hints]
        parts += ["", "  </details>"]
    if code.strip():
        if hints:
            parts.append("")
        body = [("  " + l) if l.strip() else "" for l in code.splitlines()]
        parts += ["  <details>", "  <summary>Solution</summary>", "", "  ```python"]
        parts += body
        parts += ["  ```", "", "  </details>"]
    parts.append("  <!-- /solution -->")
    return parts


def lesson_block(code):
    return "\n".join([
        "<!-- lesson-code -->",
        "<details>",
        "<summary>Lesson code</summary>",
        "",
        "```python",
        code,
        "```",
        "",
        "</details>",
        "<!-- /lesson-code -->",
    ])


def ends_item(line):
    """True if this line is past the end of the current exercise item."""
    return bool(
        ITEM.match(line)
        or line.startswith(("## ", "### ", "---", "> ", "[", "<!-- lesson-code"))
        or (line and not line.startswith((" ", "- ")))
    )


def build(text, answers, used, code):
    if code:
        text = LESSON_BLOCK.sub(lambda _: lesson_block(code), text)
    text = BLOCK.sub("\n", text)              # drop blocks from a previous run
    lines = text.split("\n")
    out, i = [], 0
    while i < len(lines):
        m = ITEM.match(lines[i])
        if not m:
            out.append(lines[i])
            i += 1
            continue
        label = m.group(1)
        j = i + 1
        while j < len(lines) and not ends_item(lines[j]):
            j += 1
        item = lines[i:j]
        trailing = 0
        while item and item[-1].strip() == "":
            item.pop()
            trailing += 1
        if label in answers:
            new = block(label, *answers[label])
            used.add(label)
            if "  <details>" in item:         # hand-written Answer: hint goes above it
                k = item.index("  <details>")
                item[k:k] = new + [""]
            else:
                item += [""] + new
        out.extend(item)
        out.extend([""] * trailing)
        i = j
    return "\n".join(out)


def main():
    failed = False
    for path in PAGES:
        n = path.name[1]
        answers = read_solutions(CODE / "solutions" / f"lesson{n}.py")
        code = lesson_code(CODE / f"lesson{n}.py")
        used = set()
        old = path.read_text()
        new = build(old, answers, used, code)
        if new != old:
            path.write_text(new)
        print(f"{path.name}: {new.count('<summary>Hint</summary>')} hints, "
              f"{new.count('<summary>Solution</summary>')} solutions")
        unused = sorted(set(answers) - used, key=lambda s: tuple(map(int, s.split("."))))
        if unused:
            print(f"  no exercise on the page for: {', '.join(unused)}", file=sys.stderr)
            failed = True
    if failed:
        sys.exit(1)


if __name__ == "__main__":
    main()
