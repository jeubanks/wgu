#!/usr/bin/env python3
"""Copy each hint and answer in solutions.sql into the exercise files as folded blocks.

solutions.sql is the source of truth. After changing a hint or an answer there, run:

    python3 build_solutions.py

For every exercise label like `-- [5.3]` in solutions.sql, this puts collapsible
"Hint" and "Solution" blocks under exercise **5.3** in the 0N-*.md files.
Lines that start with `-- Hint:` become the hint (one bullet per line); the rest
of the label's lines become the solution. A label with only hints (like the
concepts check) gets just a Hint block, placed above the exercise's own Answer.
Blocks it wrote before are replaced, so running it again is always safe.
"""
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
PARTS = sorted(HERE.glob("0[0-9]-*.md"))

LABEL = re.compile(r"^-- \[(\d+\.\d+)\]\s*$")
HINT = re.compile(r"^-- Hint:\s*(.*)$")
SECTION_RULE = re.compile(r"^-- =+\s*$")
ITEM = re.compile(r"^- \*\*(\d+\.\d+)\*\*")
BLOCK = re.compile(r"\n*  <!-- solution:[\d.]+ -->\n.*?  <!-- /solution -->\n", re.S)


def read_solutions():
    """Return {label: (hints, sql)} from solutions.sql."""
    answers, label, hints, buf = {}, None, [], []

    def flush():
        if label:
            answers[label] = (hints, "\n".join(buf).strip("\n"))

    for line in (HERE / "solutions.sql").read_text().splitlines():
        m = LABEL.match(line)
        if m:
            flush()
            label, hints, buf = m.group(1), [], []
        elif SECTION_RULE.match(line):
            flush()
            label, hints, buf = None, [], []
        elif label:
            h = HINT.match(line)
            if h:
                hints.append(h.group(1))
            else:
                buf.append(line)
    flush()
    return answers


def block(label, hints, sql):
    parts = [f"  <!-- solution:{label} -->"]
    if hints:
        parts += ["  <details>", "  <summary>Hint</summary>", ""]
        parts += [f"  - {h}" for h in hints]
        parts += ["", "  </details>"]
    if sql.strip():
        if hints:
            parts.append("")
        body = [("  " + l) if l.strip() else "" for l in sql.splitlines()]
        parts += ["  <details>", "  <summary>Solution</summary>", "", "  ```sql"]
        parts += body
        parts += ["  ```", "", "  </details>"]
    parts.append("  <!-- /solution -->")
    return parts


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
    answers = read_solutions()
    used = set()
    for path in PARTS:
        old = path.read_text()
        new = build(old, answers, used)
        if new != old:
            path.write_text(new)
        print(f"{path.name}: {new.count('<summary>Hint</summary>')} hints, "
              f"{new.count('<summary>Solution</summary>')} solutions")
    unused = sorted(set(answers) - used, key=lambda s: tuple(map(int, s.split("."))))
    if unused:
        print("No exercise found for:", ", ".join(unused), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
