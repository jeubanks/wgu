"""Draw join and ON DELETE pictures as inline SVG (used by hooks/concept_diagrams.py).

The tables use the same look as the ER diagrams in hooks/er_svg.py (navy header
bar, striped rows, the er-* classes in docs/stylesheets/wgu.css), but they hold
sample rows instead of column definitions:

- join_svg(): two tables with a line between each pair of matching rows, and the
  result table. Rows with no match are tinted when the join keeps them (their
  missing side shows NULL in the result) and faded and struck out when it drops them.
- delete_svg(): a parent row and its child rows before and after the parent is
  deleted, under one ON DELETE rule.

Each function returns two layouts: wide (side by side) and narrow (for phones).
"""
from html import escape

from er_svg import HEAD, PAD

ROW = 26          # data row height
COLHEAD = 22      # column-name row under the header bar
CH = 7.6          # Roboto Mono 12.5px, per character (generous)
TITLE_CH = 8.8    # 14px bold title, per character
CELL_GAP = 16     # between columns
LINK_GAP = 64     # between the two joined tables (the lines run here)
ARROW_GAP = 60    # between the joined tables and the result
NULL = None


def _text(value):
    return "NULL" if value is None else str(value)


class Grid:
    """A table of sample rows, measured and placed.

    states[i] is '', 'kept', 'dropped' or 'deleted' for row i.
    marks[(i, j)] is 'null' or 'changed' for one cell.
    """

    def __init__(self, title, columns, rows, states=None, marks=None, keys=()):
        self.title, self.columns, self.rows = title, columns, rows
        self.states = states or [""] * len(rows)
        self.marks = marks or {}
        self.keys = set(keys)  # column indexes shown in bold (the join columns)
        widths = []
        for j, col in enumerate(columns):
            cells = [len(col)] + [len(_text(r[j])) + (1 if r[j] is None else 0) for r in rows]
            widths.append(max(cells) * CH)
        self.col_x, x = [], PAD
        for w in widths:
            self.col_x.append(x)
            x += w + CELL_GAP
        self.w = max(x - CELL_GAP + PAD, len(title) * TITLE_CH + 2 * PAD)
        self.h = HEAD + COLHEAD + ROW * max(len(rows), 1)
        self.x = self.y = 0

    def row_y(self, i):
        """Middle of row i (absolute)."""
        return self.y + HEAD + COLHEAD + ROW * i + ROW / 2

    def svg(self, uid):
        out = [f'<g class="er-table cd-grid" transform="translate({self.x:.1f},{self.y:.1f})">']
        clip = f"{{id}}-{uid}"
        out.append(f'<clipPath id="{clip}"><rect width="{self.w:.1f}" height="{self.h}" rx="6"/></clipPath>')
        out.append(f'<rect class="er-box" width="{self.w:.1f}" height="{self.h}" rx="6"/>')
        out.append(f'<g clip-path="url(#{clip})">')
        out.append(f'<rect class="er-head" width="{self.w:.1f}" height="{HEAD}"/>')
        out.append(f'<rect class="er-stripe" y="{HEAD}" width="{self.w:.1f}" height="{COLHEAD}"/>')
        for i, state in enumerate(self.states):
            if state in ("kept", "dropped", "deleted"):
                out.append(f'<rect class="cd-row-{state}" y="{HEAD + COLHEAD + ROW * i}" '
                           f'width="{self.w:.1f}" height="{ROW}"/>')
        out.append("</g>")
        out.append(f'<rect class="er-border" width="{self.w:.1f}" height="{self.h}" rx="6"/>')
        out.append(f'<text class="er-title" x="{self.w / 2:.1f}" y="{HEAD / 2 + 5}" '
                   f'text-anchor="middle">{escape(self.title)}</text>')
        for j, col in enumerate(self.columns):
            out.append(f'<text class="cd-colhead" x="{self.col_x[j]:.1f}" y="{HEAD + 15}">{escape(col)}</text>')
        if not self.rows:
            out.append(f'<text class="er-more" x="{PAD}" y="{HEAD + COLHEAD + 17}">(no rows)</text>')
        for i, row in enumerate(self.rows):
            y = HEAD + COLHEAD + ROW * i
            faded = self.states[i] in ("dropped", "deleted")
            out.append(f'<g class="cd-faded">' if faded else "<g>")
            for j, value in enumerate(row):
                x = self.col_x[j]
                mark = self.marks.get((i, j))
                if value is None:
                    w = len("NULL") * CH + 8
                    cls = "cd-null cd-changed" if mark == "changed" else "cd-null"
                    out.append(f'<rect class="{cls}" x="{x - 4:.1f}" y="{y + 4}" width="{w:.1f}" '
                               f'height="{ROW - 8}" rx="4"/>')
                    out.append(f'<text class="cd-cell cd-null-text" x="{x:.1f}" y="{y + 17}">NULL</text>')
                    continue
                cls = "cd-cell cd-key" if j in self.keys else "cd-cell"
                out.append(f'<text class="{cls}" x="{x:.1f}" y="{y + 17}">{escape(_text(value))}</text>')
            if faded:
                out.append(f'<path class="cd-strike" d="M{PAD - 4},{y + ROW / 2} H{self.w - PAD + 4:.1f}"/>')
            out.append("</g>")
        out.append("</g>")
        return "\n".join(out)


def _link(x0, y0, x1, y1, cls="cd-link"):
    """A curved line between two rows, with a dot at each end."""
    mid = (x1 - x0) / 2
    return (f'<path class="{cls}" d="M{x0:.1f},{y0:.1f} C{x0 + mid:.1f},{y0:.1f} '
            f'{x1 - mid:.1f},{y1:.1f} {x1:.1f},{y1:.1f}"/>'
            f'<circle class="cd-dot" cx="{x0:.1f}" cy="{y0:.1f}" r="3"/>'
            f'<circle class="cd-dot" cx="{x1:.1f}" cy="{y1:.1f}" r="3"/>')


def _arrow(x0, y0, x1, y1):
    """A straight arrow, horizontal or vertical."""
    d = 1 if (x1 > x0 or y1 > y0) else -1
    if y0 == y1:
        head = f"M{x1 - d * 8:.1f},{y1 - 5:.1f} L{x1:.1f},{y1:.1f} L{x1 - d * 8:.1f},{y1 + 5:.1f}"
    else:
        head = f"M{x1 - 5:.1f},{y1 - d * 8:.1f} L{x1:.1f},{y1:.1f} L{x1 + 5:.1f},{y1 - d * 8:.1f}"
    return f'<path class="cd-arrow" d="M{x0:.1f},{y0:.1f} L{x1:.1f},{y1:.1f} {head}"/>'


def _label(x, y, text, cls="cd-label", anchor="start"):
    return f'<text class="{cls}" x="{x:.1f}" y="{y:.1f}" text-anchor="{anchor}">{escape(text)}</text>'


def _wrap(body, width, height, title, description):
    m = 4  # margin so strokes aren't clipped
    w, h = width + 2 * m, height + 2 * m
    return (f'<svg class="er-svg cd-svg" role="img" aria-labelledby="{{id}}-t {{id}}-d" '
            f'width="{w:.0f}" height="{h:.0f}" viewBox="{-m} {-m} {w:.0f} {h:.0f}">'
            f'<title id="{{id}}-t">{escape(title)}</title><desc id="{{id}}-d">{escape(description)}</desc>\n'
            + "\n".join(body) + "\n</svg>")


def join_svg(join, title, description):
    """(wide, narrow) SVGs for one join. join is a hooks/concept_diagrams.Join."""
    out = []
    for narrow in (False, True):
        left = Grid(join.left_title, join.left_cols, join.left_rows,
                    join.left_states, keys=[join.left_key])
        right = Grid(join.right_title, join.right_cols, join.right_rows,
                     join.right_states, keys=[join.right_key])
        result = Grid(f"Result: {len(join.result)} row{'s' * (len(join.result) != 1)}",
                      join.result_cols, join.result, join.result_states,
                      marks={(i, j): "null" for i, r in enumerate(join.result)
                             for j, v in enumerate(r) if v is None})
        gap = LINK_GAP - (16 if narrow else 0)
        right.x = left.w + gap
        body = [left.svg("l"), right.svg("r")]
        for i, j in join.pairs:
            body.insert(0, _link(left.w, left.row_y(i), right.x, right.row_y(j)))
        top = max(left.h, right.h)
        if narrow:
            mid = (left.w + gap / 2)
            result.y = top + 44
            body.append(_arrow(mid, top + 8, mid, result.y - 6))
            body.append(_label(mid + 10, top + 30, join.kind + " JOIN"))
            width = max(right.x + right.w, result.w)
        else:
            result.x = right.x + right.w + ARROW_GAP
            y = HEAD + COLHEAD / 2
            body.append(_arrow(right.x + right.w + 10, y, result.x - 8, y))
            width = result.x + result.w
        body.append(result.svg("res"))
        height = max(top, result.y + result.h)
        out.append(_wrap(body, width, height, title, description))
    return tuple(out)


def delete_svg(case, title, description):
    """(wide, narrow) SVGs for one ON DELETE rule. case is a hooks/concept_diagrams.DeleteCase."""
    out = []
    for narrow in (False, True):
        body, y = [], 0
        width = 0
        for step, (parent_states, child_rows, child_states, child_marks, links) in enumerate(
                [case.before, case.after]):
            label = "Before" if step == 0 else case.after_label
            body.append(_label(0, y + 13, label, "cd-step" + (" cd-error" if case.error and step else "")))
            y += 22
            parent = Grid(case.parent_title, case.parent_cols, case.parent_rows, parent_states,
                          keys=[case.parent_key])
            child = Grid(case.child_title, case.child_cols, child_rows, child_states, child_marks,
                         keys=[case.child_key])
            if narrow:
                # Parent above child; the lines run down a gutter on the right,
                # one lane per parent row so each child row's parent is clear.
                parent.y, child.y = y, y + parent.h + 18
                gutter = max(parent.w, child.w) + 18
                for ci, pi in links:
                    py, cy = parent.row_y(pi), child.row_y(ci)
                    lane = gutter + pi * 12
                    width = max(width, lane + 4)
                    body.insert(0, f'<path class="cd-link" d="M{child.w:.1f},{cy:.1f} H{lane:.1f} '
                                   f'V{py:.1f} H{parent.w:.1f}"/>'
                                   f'<circle class="cd-dot" cx="{child.w:.1f}" cy="{cy:.1f}" r="3"/>'
                                   f'<circle class="cd-dot" cx="{parent.w:.1f}" cy="{py:.1f}" r="3"/>')
                width = max(width, gutter + 4)
                y = child.y + child.h
            else:
                # Child on the left, its foreign key column pointing right at the parent.
                parent.x = child.w + LINK_GAP
                parent.y = child.y = y
                for ci, pi in links:
                    body.insert(0, _link(child.w, child.row_y(ci), parent.x, parent.row_y(pi)))
                width = max(width, parent.x + parent.w)
                y += max(parent.h, child.h)
            body += [child.svg(f"c{step}"), parent.svg(f"p{step}")]
            if step == 0:
                y += 14
                body.append(_arrow(16, y, 16, y + 34))
                body.append(_label(30, y + 22, case.statement, "cd-sql"))
                width = max(width, 30 + len(case.statement) * 7.2)
                y += 44
        out.append(_wrap(body, width, y, title, description))
    return tuple(out)
