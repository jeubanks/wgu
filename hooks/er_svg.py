"""Draw an ER diagram as inline SVG (used by hooks/er_diagrams.py on the site).

Each table is a box: the name on a navy header bar, then one row per column
with the column name, a general type, and PK / FK / UK chips. Each foreign
key is a line from the FK column's row to the referenced column's row, with
crow's-foot ends and the join condition as its label. Colors come from CSS
classes in docs/stylesheets/wgu.css, so the diagram follows light and dark mode.

The layout is simple on purpose (the d427 schemas are small): each group of
connected tables is one row, the table with the most links in the middle, and
each table is shifted up or down so the rows a line joins line up.
"""
from html import escape

ROW = 26          # column row height
HEAD = 32         # header bar height
PAD = 12          # padding inside a box
COL_GAP = 14      # between name, type and chips
MONO = 7.8        # Roboto Mono 13px, per character
TYPE_CH = 6.6     # 12px type text, per character (generous)
TITLE_CH = 8.8    # 14px bold title, per character (generous)
LABEL_CH = 6.7    # Roboto Mono 11px, per character
CHIP_W, CHIP_GAP = 24, 4
TABLE_GAP = 40    # between groups and lone tables
END = 26          # room for the cardinality marks at each end of a line
LOOP = 30         # how far a self-reference loop sticks out


def _keys(table, col):
    keys = []
    if col.name in table.primary_key:
        keys.append("PK")
    if any(fk.column == col.name for fk in table.foreign_keys):
        keys.append("FK")
    if col.name in table.unique:
        keys.append("UK")
    return keys


class Box:
    """One table, measured and placed."""

    def __init__(self, table, compact=False):
        self.table, self.compact = table, compact
        cols = table.columns
        if compact:
            cols = [c for c in cols if {'PK', 'FK'} & set(_keys(table, c))]
        self.rows = [(c.name, c.type, _keys(table, c)) for c in cols]
        self.hidden = len(table.columns) - len(cols)
        name_w = max(len(r[0]) for r in self.rows) * MONO
        type_w = max(len(r[1]) for r in self.rows) * TYPE_CH
        chips = max(len(r[2]) for r in self.rows)
        chip_w = chips * CHIP_W + max(chips - 1, 0) * CHIP_GAP
        self.name_x = PAD
        self.type_x = PAD + name_w + COL_GAP
        self.chip_x = self.type_x + type_w + COL_GAP
        self.w = max(self.chip_x + chip_w + PAD, len(table.name) * TITLE_CH + 2 * PAD)
        self.h = HEAD + ROW * (len(self.rows) + (1 if self.hidden else 0))
        self.x = self.y = 0

    def row_y(self, column):
        """Middle of the row for this column (absolute)."""
        i = next(i for i, r in enumerate(self.rows) if r[0] == column)
        return self.y + HEAD + ROW * i + ROW / 2

    def svg(self):
        t, out = self.table, []
        cls = "er-table er-neighbor" if self.compact else "er-table"
        out.append(f'<g class="{cls}" transform="translate({self.x:.1f},{self.y:.1f})">')
        clip = f"{{id}}-{t.name}"
        out.append(f'<clipPath id="{clip}"><rect width="{self.w:.1f}" height="{self.h}" rx="6"/></clipPath>')
        out.append(f'<rect class="er-box" width="{self.w:.1f}" height="{self.h}" rx="6"/>')
        out.append(f'<g clip-path="url(#{clip})">')
        out.append(f'<rect class="er-head" width="{self.w:.1f}" height="{HEAD}"/>')
        for i in range(1, len(self.rows) + (1 if self.hidden else 0), 2):
            out.append(f'<rect class="er-stripe" y="{HEAD + ROW * i}" width="{self.w:.1f}" height="{ROW}"/>')
        out.append("</g>")
        out.append(f'<rect class="er-border" width="{self.w:.1f}" height="{self.h}" rx="6"/>')
        out.append(f'<text class="er-title" x="{self.w / 2:.1f}" y="{HEAD / 2 + 5}" '
                   f'text-anchor="middle">{escape(t.name)}</text>')
        for i, (name, typ, keys) in enumerate(self.rows):
            y = HEAD + ROW * i
            key_cls = " er-key" if keys else ""
            out.append(f'<text class="er-col{key_cls}" x="{self.name_x}" y="{y + 17}">{escape(name)}</text>')
            out.append(f'<text class="er-type" x="{self.type_x:.1f}" y="{y + 17}">{escape(typ)}</text>')
            for k, key in enumerate(keys):
                cx = self.chip_x + k * (CHIP_W + CHIP_GAP)
                out.append(f'<rect class="er-chip er-{key.lower()}" x="{cx:.1f}" y="{y + 5}" '
                           f'width="{CHIP_W}" height="16" rx="8"/>')
                out.append(f'<text class="er-chip-text er-{key.lower()}" x="{cx + CHIP_W / 2:.1f}" '
                           f'y="{y + 16.5}" text-anchor="middle">{key}</text>')
        if self.hidden:
            y = HEAD + ROW * len(self.rows)
            more = f"+ {self.hidden} more column{'s' if self.hidden > 1 else ''}"
            out.append(f'<text class="er-more" x="{self.name_x}" y="{y + 17}">{more}</text>')
        out.append("</g>")
        return "\n".join(out)


def _marks(x, y, d, kind):
    """Cardinality marks at a line end. d = +1 if the line leaves to the right."""
    out = []
    if kind in ("one", "zero_one"):
        out.append(f'<path class="er-mark" d="M{x + d * 8:.1f},{y - 7:.1f} V{y + 7:.1f}"/>')
    if kind == "one":
        out.append(f'<path class="er-mark" d="M{x + d * 14:.1f},{y - 7:.1f} V{y + 7:.1f}"/>')
    if kind == "zero_one":
        out.append(f'<circle class="er-ring" cx="{x + d * 18:.1f}" cy="{y:.1f}" r="4.5"/>')
    if kind == "many":
        tip = x + d * 13
        out.append(f'<path class="er-mark" d="M{x:.1f},{y - 8:.1f} L{tip:.1f},{y:.1f} '
                   f'L{x:.1f},{y + 8:.1f} M{x:.1f},{y:.1f} H{tip:.1f}"/>')
        out.append(f'<circle class="er-ring" cx="{x + d * 19:.1f}" cy="{y:.1f}" r="4.5"/>')
    return out


def _label(x, y, lines, anchor="middle"):
    """Join condition: first line above the line, second below."""
    out = []
    for i, text in enumerate(lines):
        ty = y - 6 if i == 0 else y + 15
        out.append(f'<text class="er-label" x="{x:.1f}" y="{ty:.1f}" text-anchor="{anchor}">'
                   f'{escape(text)}</text>')
    return out


def _order(names, links):
    """Order a connected group so the table with the most links is in the middle."""
    degree = {n: sum(n in (a, b) for a, b in links if a != b) for n in names}
    if len(names) < 3:
        return names
    hub = max(names, key=lambda n: degree[n])
    rest = [n for n in names if n != hub]
    half = len(rest) // 2
    return rest[:half] + [hub] + rest[half:]


def _groups(tables):
    """Connected groups of tables (by foreign keys), in table order."""
    parent = {n: n for n in tables}

    def find(n):
        while parent[n] != n:
            n = parent[n]
        return n

    for t in tables.values():
        for fk in t.foreign_keys:
            if fk.parent in tables:
                parent[find(t.name)] = find(fk.parent)
    groups = {}
    for n in tables:
        groups.setdefault(find(n), []).append(n)
    return list(groups.values())


def er_svg(tables, title, description, compact=(), max_width=720):
    """Inline SVG for {name: Table}. Tables named in compact show only key columns."""
    boxes = {n: Box(t, n in compact) for n, t in tables.items()}
    links = [(t.name, fk) for t in tables.values() for fk in t.foreign_keys if fk.parent in tables]
    pairs = [(c, fk.parent) for c, fk in links]

    def label_lines(child, fk):
        return [f"{child}.{fk.column}", f"= {fk.parent}.{fk.parent_column}"]

    def label_w(child, fk):
        return max(len(s) for s in label_lines(child, fk)) * LABEL_CH

    shapes, lines, y_cursor, width = [], [], 0, 0
    lone, groups = [], []
    for g in _groups(tables):
        (groups if len(g) > 1 or any(c == p for c, p in pairs if c == g[0]) else lone).append(g)

    # Each connected group is one row.
    for g in groups:
        order = _order(g, pairs)
        x = 0
        placed = []
        for i, name in enumerate(order):
            box = boxes[name]
            if i:
                prev = boxes[order[i - 1]]
                between = [(c, fk) for c, fk in links
                           if {c, fk.parent} == {prev.table.name, name}]
                gap = max([label_w(c, fk) + 2 * END for c, fk in between] + [TABLE_GAP])
                x = prev.x + prev.w + gap
            box.x = x
            # Line up this box's linked row with an already placed table's row.
            box.y = 0
            for c, fk in links:
                if c == fk.parent:
                    continue
                if c == name and fk.parent in placed:
                    box.y = boxes[fk.parent].row_y(fk.parent_column) - (box.row_y(fk.column) - box.y)
                    break
                if fk.parent == name and c in placed:
                    box.y = boxes[c].row_y(fk.column) - (box.row_y(fk.parent_column) - box.y)
                    break
            placed.append(name)
        top = min(boxes[n].y for n in order)
        for n in order:
            boxes[n].y += y_cursor - top
        right = max(boxes[n].x + boxes[n].w for n in order)
        # Self-references loop out on the right of the right-most table.
        for c, fk in links:
            if c == fk.parent and c in order:
                b = boxes[c]
                right = max(right, b.x + b.w + LOOP + 12 + label_w(c, fk))
        width = max(width, right)
        y_cursor = max(boxes[n].y + boxes[n].h for n in order) + TABLE_GAP

    # Tables with no foreign keys: wrap them into rows.
    x, row_h = 0, 0
    for (name,) in lone:
        box = boxes[name]
        if x and x + box.w > max_width:
            y_cursor += row_h + TABLE_GAP
            x, row_h = 0, 0
        box.x, box.y = x, y_cursor
        x += box.w + TABLE_GAP
        row_h = max(row_h, box.h)
        width = max(width, box.x + box.w)
    if lone:
        y_cursor += row_h + TABLE_GAP
    height = y_cursor - TABLE_GAP

    for child, fk in links:
        cb, pb = boxes[child], boxes[fk.parent]
        col = cb.table.column(fk.column)
        parent_kind = "one" if col.not_null else "zero_one"
        dashed = "" if fk.column in cb.table.primary_key else " er-dashed"
        cy, py = cb.row_y(fk.column), pb.row_y(fk.parent_column)
        if child == fk.parent:
            x0 = cb.x + cb.w
            xl = x0 + LOOP
            lines.append(f'<path class="er-line{dashed}" d="M{x0:.1f},{cy:.1f} H{xl:.1f} '
                         f'V{py:.1f} H{x0:.1f}"/>')
            lines += _marks(x0, cy, 1, "many") + _marks(x0, py, 1, parent_kind)
            mid = (cy + py) / 2
            lines += [f'<text class="er-label" x="{xl + 6:.1f}" y="{mid + (i * 14) - 3:.1f}">{escape(s)}</text>'
                      for i, s in enumerate(label_lines(child, fk))]
            continue
        if cb.x > pb.x:   # parent on the left
            x0, x1, d = pb.x + pb.w, cb.x, 1
        else:
            x0, x1, d = pb.x, cb.x + cb.w, -1
        # Bend near the child end, so the label sits on the long straight part.
        xm = x1 - d * (END + 6)
        path = f"M{x0:.1f},{py:.1f} H{xm:.1f} V{cy:.1f} H{x1:.1f}" if abs(cy - py) > 0.5 \
            else f"M{x0:.1f},{py:.1f} H{x1:.1f}"
        lines.append(f'<path class="er-line{dashed}" d="{path}"/>')
        lines += _marks(x0, py, d, parent_kind) + _marks(x1, cy, -d, "many")
        lines += _label((x0 + xm) / 2 if abs(cy - py) > 0.5 else (x0 + x1) / 2, py, label_lines(child, fk))

    shapes = [b.svg() for b in boxes.values()]
    m = 4  # margin so strokes aren't clipped
    w, h = width + 2 * m, height + 2 * m
    return (f'<svg class="er-svg" role="img" aria-labelledby="{{id}}-t {{id}}-d" '
            f'width="{w:.0f}" height="{h:.0f}" viewBox="{-m} {-m} {w:.0f} {h:.0f}">'
            f'<title id="{{id}}-t">{escape(title)}</title><desc id="{{id}}-d">{escape(description)}</desc>\n'
            + "\n".join(lines + shapes) + "\n</svg>")
