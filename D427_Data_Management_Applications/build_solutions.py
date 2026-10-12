#!/usr/bin/env python3
"""Copy each answer in solutions.sql into the exercise files as a folded block.

solutions.sql is the source of truth. After changing an answer there, run:

    python3 build_solutions.py

For every exercise label like `-- [5.3]` in solutions.sql, this puts a
collapsible "Solution" block under exercise **5.3** in the 0N-*.md files.
Blocks it wrote before are replaced, so running it again is always safe.
"""
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
PARTS = sorted(HERE.glob("0[0-9]-*.md"))

LABEL = re.compile(r"^-- \[(\d+\.\d+)\]\s*$")
SECTION_RULE = re.compile(r"^-- =+\s*$")
ITEM = re.compile(r"^- \*\*(\d+\.\d+)\*\*")
BLOCK = re.compile(r"\n*  <!-- solution:[\d.]+ -->\n.*?  <!-- /solution -->\n", re.S)


def read_solutions():
    """Return {label: sql} from solutions.sql."""
    answers, label, buf = {}, None, []

    def flush():
        if label:
            answers[label] = "\n".join(buf).strip("\n")

    for line in (HERE / "solutions.sql").read_text().splitlines():
        m = LABEL.match(line)
        if m:
            flush()
            label, buf = m.group(1), []
        elif SECTION_RULE.match(line):
            flush()
            label, buf = None, []
        elif label:
            buf.append(line)
    flush()
    return answers


def block(label, sql):
    body = "\n".join(("  " + l) if l.strip() else "" for l in sql.splitlines())
    return (
        f"\n  <!-- solution:{label} -->\n"
        "  <details>\n"
        "  <summary>Solution</summary>\n\n"
        "  ```sql\n"
        f"{body}\n"
        "  ```\n\n"
        "  </details>\n"
        "  <!-- /solution -->\n"
    )


def ends_item(line):
    """True if this line is past the end of the current exercise item."""
    return bool(
        ITEM.match(line)
        or line.startswith(("## ", "---", "> ", "["))
        or (line and not line.startswith((" ", "- ")))
    )


def build(text, answers, used):
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
        out.extend(item)
        if label in answers:
            out.extend(block(label, answers[label]).rstrip("\n").split("\n"))
            used.add(label)
        out.extend([""] * trailing)
        i = j
    return "\n".join(out)


def main():
    answers = read_solutions()
    used = set()
    for path in PARTS:
        old = path.read_text()
        new = build(old, answers, used)
        if new != old:
            path.write_text(new)
        print(f"{path.name}: {len(re.findall(r'<!-- solution:', new))} solutions")
    unused = sorted(set(answers) - used, key=lambda s: tuple(map(int, s.split("."))))
    if unused:
        print("No exercise found for:", ", ".join(unused), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
