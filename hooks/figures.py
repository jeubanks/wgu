"""MkDocs hook: drawn figures (trees, B-trees, graphs, lists, arrays) from a short spec.

A page describes a figure in an HTML comment, which GitHub hides, and keeps a
plain-text drawing for GitHub readers up to the closing comment:

    <!-- figure
    tree: 62{31{15, 47{, 52}}, 84{73, 96}}
    -->
    ```text
    (the ASCII drawing GitHub shows)
    ```
    <!-- /figure -->

On the site the whole block becomes one inline SVG per panel, styled by the
.dsf rules in docs/stylesheets/viz.css (light and dark). It works inside list
items: indent the comment like the rest of the item.

Lines in the comment:

- `title: Text` goes above the figure.
- `tree: SPEC` draws a binary tree. Children go in braces, left then right; leave
  a side empty for a missing child: `47{, 52}` has only a right child.
- `@x` on a label draws it as plain text (a note hanging under its parent).
- `nary: SPEC` draws any tree with children evenly under each parent (tries,
  recursion trees). A single child sits straight below.
- `btree: SPEC` draws a B-tree: each label is a node's keys, `20 60{5, 30 40 50, 80}`.
- `Caption :: SPEC` on any of those three adds a caption under that panel.
  Several panel lines make a row of panels (they wrap on phones).
- `flow: yes` puts an arrow between panels (before → after).
- `levels: a | b | c` writes a note at the right of each level of the first tree.
- `nodes: A 0 0, B 1 0, ...` and `edges: A-B, A>B 4, C>D -3 ~30` draw a graph:
  positions in grid units, `-` undirected, `>` directed, then an optional weight
  and an optional `~bend` in pixels (a curved edge; negative bends the other way).
  `@0.3` moves a straight edge's weight from the middle to 30% of the way along,
  so two crossing edges keep their weights apart.
- `list: 3 8 5 2` draws a singly linked list with head and tail; `double: yes`
  makes it doubly linked.
- `heap: 72 45 63` draws the array with its indexes above the same heap as a tree.
- `row: Label | 29 4 *17 8 | note` (one per row) draws array rows whose cells line
  up in columns: `*v` highlights a cell, `.v` fades it, `//` draws a split.
  `index: yes` numbers the columns.
- `grid: Caption :: A B C / A: 0 4 9 / B: ∞ 0 2` draws a matrix or DP table:
  column heads, then labeled rows (`*v` highlights). Several make a row of panels.
- `call: >>label | note | returns x` (one per call) draws a chain of recursive
  calls; each `>` indents one level. `frame: label | vars | note` (top first)
  draws a call stack.
- `array: 3 9 14 ...` and `step: Label | low high mid` (one per step) draw an
  array with each step's search range; cells outside the range fade.

Labels in a tree spec: `"quoted labels"` may hold braces and commas. A label can
end with flags: `@h` highlight (a path: edges between two
highlighted nodes light up too), `@r` red, `@b` black (red-black trees), `@t` a subtree triangle,
and `^note` a small note beside the node. `K:P` (key:priority) draws a treap node.
Each SVG gets an aria-label that spells out the structure.
"""
import re
from html import escape

BLOCK = re.compile(r"^(?P<indent>[ \t]*)<!-- figure\n(?P<spec>.*?)^[ \t]*-->\n"
                   r".*?^[ \t]*<!-- /figure -->[ \t]*$", re.M | re.S)
PLACEHOLDER = re.compile(r'(?:<p>)?<div class="dsf-slot" data-dsf="(\d+)"></div>(?:</p>)?')
_pages = {}

CH = 7.8      # px per character at 13px, 600 weight (generous)
R = 18        # node circle radius
GAP = 14      # between neighboring nodes


# ---------------------------------------------------------------- parsing
class Node:
    def __init__(self, label):
        self.flags, self.note = set(), ""
        m = re.match(r"^(.*?)((?:\s*[@^]\S+)*)$", label.strip())
        base, rest = m[1].strip(), m[2]
        for tok in re.findall(r"[@^]\S+", rest):
            if tok[0] == "@":
                self.flags.add(tok[1:])
            else:
                self.note = tok[1:]
        self.label = base.strip('"')
        self.kids = []          # Node or None (missing child)

    def real_kids(self):
        return [k for k in self.kids if k is not None]


def parse_tree(s):
    s = s.strip()
    pos = 0

    def label():
        nonlocal pos
        out, quoted = [], False
        while pos < len(s):
            c = s[pos]
            if c == '"':
                quoted = not quoted
            elif not quoted and c in "{},":
                break
            out.append(c)
            pos += 1
        return "".join(out)

    def node():
        nonlocal pos
        text = label()
        if not text.strip():
            return None
        n = Node(text)
        if pos < len(s) and s[pos] == "{":
            pos += 1
            while True:
                n.kids.append(node())
                if s[pos] == ",":
                    pos += 1
                    continue
                if s[pos] == "}":
                    pos += 1
                    break
                raise ValueError(f"figure: expected , or }} at {pos} in {s!r}")
        return n

    root = node()
    if pos != len(s):
        raise ValueError(f"figure: trailing text at {pos} in {s!r}")
    return root


# ---------------------------------------------------------------- sizes
def _w(text, size=13):
    return len(text) * CH * size / 13


def is_treap(n):
    return re.fullmatch(r"[^:\s]+:\S+", n.label) is not None


def node_size(n, kind):
    if "x" in n.flags:
        return _w(n.label, 12) + 10, 20
    if kind == "btree":
        return 16 + 28 * len(n.label.split()), 30
    if "t" in n.flags:
        return 40, 40
    if is_treap(n):
        k, p = n.label.split(":")
        return max(56, _w(max(k, prettify(p), key=len)) + 22), 42
    if len(n.label) <= 3:
        return 2 * R, 2 * R
    return _w(n.label) + 20, 32


def prettify(p):
    return {"-inf": "−∞", "inf": "∞"}.get(p, p.replace("-", "−"))


# ---------------------------------------------------------------- layout
def walk(n, d=0):
    if n is None:
        return
    yield n, d
    for k in n.kids:
        yield from walk(k, d + 1)


def layout_binary(root, kind):
    """In-order layout: each node gets its own column, so left and right stay left and right."""
    order = []

    def ino(n, d):
        if n is None:
            return
        kids = n.kids + [None] * (2 - len(n.kids))
        ino(kids[0], d + 1)
        order.append((n, d))
        ino(kids[1], d + 1)

    ino(root, 0)
    step = max(node_size(n, kind)[0] for n, _ in order) + GAP
    step = max(step, 46)
    return {id(n): (i * step, d) for i, (n, d) in enumerate(order)}


def layout_tidy(root, kind):
    """Each subtree gets the width of its children side by side; parents center over them."""
    widths = {}

    def width(n):
        kids = n.real_kids()
        own = node_size(n, kind)[0] + GAP
        w = max(own, sum(width(k) for k in kids)) if kids else own
        widths[id(n)] = w
        return w

    width(root)
    pos = {}

    def place(n, left, d):
        kids = n.real_kids()
        if kids:
            total = sum(widths[id(k)] for k in kids)
            x = left + (widths[id(n)] - total) / 2
            xs = []
            for k in kids:
                place(k, x, d + 1)
                xs.append(pos[id(k)][0])
                x += widths[id(k)]
            pos[id(n)] = ((xs[0] + xs[-1]) / 2, d)
        else:
            pos[id(n)] = (left + widths[id(n)] / 2, d)

    place(root, 0, 0)
    return pos


# ---------------------------------------------------------------- svg helpers
def svg_open(w, h, label):
    # Shrinks to fit a narrow screen, but not below 70%: past that the text gets
    # too small, so the figure's box scrolls sideways instead.
    return (f'<svg class="dsf-svg" viewBox="0 0 {w:.0f} {h:.0f}" width="{w:.0f}" '
            f'style="min-width: {w * 0.7:.0f}px" role="img" aria-label="{escape(label)}">')


def text(x, y, s, cls="dsf-t", anchor="middle", size=None):
    sz = f' font-size="{size}"' if size else ""
    return f'<text class="{cls}" x="{x:.1f}" y="{y:.1f}" text-anchor="{anchor}"{sz}>{escape(str(s))}</text>'


def arrow_defs(mid):
    return (f'<defs><marker id="{mid}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" '
            f'markerHeight="7" orient="auto-start-reverse"><path class="dsf-head" d="M0 0L10 5L0 10z"/></marker></defs>')


# ---------------------------------------------------------------- trees
def describe_tree(root, kind):
    def name(n):
        if kind == "btree":
            return "[" + ", ".join(n.label.split()) + "]"
        s = n.label
        if is_treap(n):
            k, p = s.split(":")
            s = f"{k} (priority {prettify(p)})"
        if "r" in n.flags:
            s += " red"
        if "b" in n.flags:
            s += " black"
        if "t" in n.flags:
            s = "subtree " + s
        if "h" in n.flags:
            s += " (highlighted)"
        if n.note:
            s += f" [{n.note}]"
        return s

    parts = []
    for n, _ in walk(root):
        if not n.real_kids():
            continue
        if kind == "tree":
            kids = n.kids + [None] * (2 - len(n.kids))
            bits = [f"{side} {name(k)}" for side, k in zip(("left", "right"), kids) if k is not None]
        else:
            bits = [name(k) for k in n.real_kids()]
        parts.append(f"{name(n)} has children " + " and ".join(bits) if kind != "tree"
                     else f"{name(n)}: " + ", ".join(bits))
    what = {"tree": "Binary tree", "nary": "Tree", "btree": "B-tree"}[kind]
    if not parts:
        return f"{what} with one node, {name(root)}"
    return f"{what} with root {name(root)}. " + ". ".join(parts) + "."


def draw_tree(root, kind, levels=None):
    pos = layout_binary(root, kind) if kind == "tree" else layout_tidy(root, kind)
    rb = any(f in n.flags for n, _ in walk(root) for f in ("r", "b"))
    treap = any(is_treap(n) for n, _ in walk(root))
    dy = 74 if treap else (70 if kind == "btree" else 64)
    nodes = list(walk(root))
    pad = 10
    xs = [pos[id(n)][0] for n, _ in nodes]
    half = {id(n): node_size(n, kind)[0] / 2 for n, _ in nodes}
    minx = min(pos[id(n)][0] - half[id(n)] - (_w(n.note, 11) + 6 if n.note else 0) for n, _ in nodes)
    maxx = max(pos[id(n)][0] + half[id(n)] + (_w(n.note, 11) + 6 if n.note else 0) for n, _ in nodes)
    depth = max(d for _, d in nodes)
    # a note beside the root sits above it, so leave room for it at the top
    top = 26 + (8 if root.note else 0)
    note_w = max((_w(t, 12) for t in levels or []), default=0)
    W = maxx - minx + 2 * pad + (note_w + 24 if levels else 0)
    H = top + depth * dy + 26
    ox = pad - minx

    def P(n):
        x, d = pos[id(n)]
        return x + ox, top + d * dy

    leftside = {id(k): pos[id(k)][0] < pos[id(n)][0] for n, _ in nodes for k in n.real_kids()}
    out = []
    # edges
    for n, _ in nodes:
        x1, y1 = P(n)
        w = node_size(n, kind)[0]
        for i, k in enumerate(n.kids):
            if k is None:
                continue
            x2, y2 = P(k)
            if "x" in k.flags:
                sx = x1 - w / 2 + 8 + 28 * i if kind == "btree" else x1
                sy = y1 + (15 if kind == "btree" else node_size(n, kind)[1] / 2)
                out.append(f'<line class="dsf-e dsf-dash" x1="{sx:.1f}" y1="{sy:.1f}" x2="{x2:.1f}" y2="{y2 - 12:.1f}"/>')
            elif kind == "btree":
                cx = x1 - w / 2 + 8 + 28 * i
                out.append(f'<line class="dsf-e" x1="{cx:.1f}" y1="{y1 + 15:.1f}" x2="{x2:.1f}" y2="{y2 - 15:.1f}"/>')
            else:
                hot = " dsf-eh" if "h" in n.flags and "h" in k.flags else ""
                out.append(f'<line class="dsf-e{hot}" x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}"/>')
    # nodes
    for n, _ in nodes:
        x, y = P(n)
        w, h = node_size(n, kind)
        if "x" in n.flags:
            out.append(text(x, y + 4, n.label, "dsf-cap", size=12))
        elif kind == "btree":
            keys = n.label.split()
            out.append(f'<rect class="dsf-n" x="{x - w / 2:.1f}" y="{y - h / 2:.1f}" width="{w:.1f}" height="{h}" rx="6"/>')
            for i in range(1, len(keys)):
                sx = x - w / 2 + 8 + 28 * i
                out.append(f'<line class="dsf-div" x1="{sx:.1f}" y1="{y - h / 2 + 5:.1f}" x2="{sx:.1f}" y2="{y + h / 2 - 5:.1f}"/>')
            for i, k in enumerate(keys):
                out.append(text(x - w / 2 + 22 + 28 * i, y + 4.5, k))
        elif "t" in n.flags:
            out.append(f'<path class="dsf-tri" d="M{x:.1f} {y - 18:.1f}L{x + 20:.1f} {y + 20:.1f}L{x - 20:.1f} {y + 20:.1f}Z"/>')
            out.append(text(x, y + 12, n.label))
        elif is_treap(n):
            k, p = n.label.split(":")
            out.append(f'<rect class="dsf-n" x="{x - w / 2:.1f}" y="{y - h / 2:.1f}" width="{w:.1f}" height="{h}" rx="8"/>')
            out.append(text(x, y - 3, k))
            out.append(text(x, y + 13, prettify(p), "dsf-acc", size=12))
        else:
            cls = "dsf-n" + (" dsf-red" if "r" in n.flags else " dsf-black" if "b" in n.flags else "")
            if "h" in n.flags or n.label == "$":
                cls += " dsf-hit"
            if len(n.label) <= 3:
                out.append(f'<circle class="{cls}" cx="{x:.1f}" cy="{y:.1f}" r="{R}"/>')
            else:
                out.append(f'<rect class="{cls}" x="{x - w / 2:.1f}" y="{y - h / 2:.1f}" width="{w:.1f}" height="{h}" rx="{h / 2}"/>')
            out.append(text(x, y + 4.5, n.label, "dsf-t" + (" dsf-on" if rb and cls != "dsf-n" else "")))
        if n.note:
            # put the note on the side away from the edge up to the parent
            if leftside.get(id(n)):
                out.append(text(x - w / 2 - 3, y - h / 2 + 2, n.note, "dsf-note", "end", 12))
            else:
                out.append(text(x + w / 2 + 3, y - h / 2 + 2, n.note, "dsf-note", "start", 12))
    if levels:
        lx = maxx + ox + 24
        for d, t in enumerate(levels):
            if d <= depth:
                out.append(text(lx, top + d * dy + 4, t, "dsf-cap", "start", 12))
    return W, H, "".join(out)


# ---------------------------------------------------------------- graph
def draw_graph(nodes_spec, edges_spec, mid):
    unit = 86
    pts = {}
    for item in nodes_spec.split(","):
        name, x, y = item.split()
        pts[name] = (float(x) * unit, float(y) * unit)
    minx = min(p[0] for p in pts.values()); miny = min(p[1] for p in pts.values())
    maxx = max(p[0] for p in pts.values()); maxy = max(p[1] for p in pts.values())
    bends = [abs(int(b)) for b in re.findall(r"~(-?\d+)", edges_spec)]
    pad = R + 16 + max(bends + [0]) / 2
    W, H = maxx - minx + 2 * pad, maxy - miny + 2 * pad

    def P(n):
        return pts[n][0] - minx + pad, pts[n][1] - miny + pad

    edges, desc, directed = [], [], False
    for item in [e.strip() for e in edges_spec.split(",") if e.strip()]:
        m = re.fullmatch(r"(\S+?)([->])(\S+)(?:\s+(-?[\d.]+))?(?:\s+~(-?\d+))?(?:\s+@([\d.]+))?", item)
        if not m:
            raise ValueError(f"figure: bad edge {item!r}")
        a, kind, b, wt, bend = m[1], m[2], m[3], m[4], int(m[5] or 0)
        directed |= kind == ">"
        (x1, y1), (x2, y2) = P(a), P(b)
        dx, dy = x2 - x1, y2 - y1
        L = (dx * dx + dy * dy) ** .5
        ux, uy = dx / L, dy / L
        nx, ny = -uy, ux                      # normal
        cx, cy = (x1 + x2) / 2 + nx * bend, (y1 + y2) / 2 + ny * bend
        # trim the ends to the circles, along the curve's end tangents
        def trim(px, py, qx, qy, r):
            vx, vy = qx - px, qy - py
            l = (vx * vx + vy * vy) ** .5
            return px + vx / l * r, py + vy / l * r
        sx, sy = trim(x1, y1, cx, cy, R + 1)
        ex, ey = trim(x2, y2, cx, cy, R + (3 if kind == ">" else 1))
        mk = f' marker-end="url(#{mid})"' if kind == ">" else ""
        if bend:
            edges.append(f'<path class="dsf-e dsf-g" d="M{sx:.1f} {sy:.1f}Q{cx:.1f} {cy:.1f} {ex:.1f} {ey:.1f}"{mk}/>')
            lx, ly = (x1 + 2 * cx + x2) / 4, (y1 + 2 * cy + y2) / 4
        else:
            edges.append(f'<line class="dsf-e dsf-g" x1="{sx:.1f}" y1="{sy:.1f}" x2="{ex:.1f}" y2="{ey:.1f}"{mk}/>')
            at = float(m[6] or 0.5)          # where the weight sits along the edge
            lx, ly = x1 + (x2 - x1) * at, y1 + (y2 - y1) * at
        if wt is not None:
            label = wt.replace("-", "−")
            bw = _w(label, 12) + 10
            edges.append(f'<rect class="dsf-wbg" x="{lx - bw / 2:.1f}" y="{ly - 10:.1f}" width="{bw:.1f}" height="19" rx="9"/>')
            edges.append(text(lx, ly + 4, label, "dsf-w", size=12))
        desc.append(f"{a} {'to' if kind == '>' else '–'} {b}" + (f" weight {label}" if wt is not None else ""))
    out = [arrow_defs(mid)] + edges
    for n in pts:
        x, y = P(n)
        out.append(f'<circle class="dsf-n" cx="{x:.1f}" cy="{y:.1f}" r="{R}"/>')
        out.append(text(x, y + 4.5, n))
    label = (f"{'Directed' if directed else 'Undirected'} graph with vertices {', '.join(pts)}. "
             f"Edges: {'; '.join(desc)}.")
    return W, H, "".join(out), label


# ---------------------------------------------------------------- list, heap, array
def draw_list(values, double, mid):
    bw, bh, gap = max(46, max(_w(v) for v in values) + 18), 34, 40
    x0, y = 12, 44
    n = len(values)
    W = x0 + n * (bw + gap) + 40 + (52 if double else 0)
    if double:
        x0 += 52
    out = [arrow_defs(mid)]
    for i, v in enumerate(values):
        x = x0 + i * (bw + gap)
        out.append(f'<rect class="dsf-n" x="{x}" y="{y}" width="{bw}" height="{bh}" rx="6"/>')
        out.append(text(x + bw / 2, y + bh / 2 + 4.5, v))
        nx = x + bw + gap
        if double:
            out.append(f'<line class="dsf-e dsf-g" x1="{x + bw + 2}" y1="{y + 11}" x2="{nx - 4}" y2="{y + 11}" marker-end="url(#{mid})"/>')
            out.append(f'<line class="dsf-e dsf-g" x1="{x - 2}" y1="{y + bh - 11}" x2="{x - gap + 4 if i else x - 30}" y2="{y + bh - 11}" marker-end="url(#{mid})"/>')
        else:
            out.append(f'<line class="dsf-e dsf-g" x1="{x + bw + 2}" y1="{y + bh / 2}" x2="{nx - 4}" y2="{y + bh / 2}" marker-end="url(#{mid})"/>')
    end = x0 + n * (bw + gap)
    out.append(text(end + 12, y + bh / 2 + 4.5, "null", "dsf-cap", size=12))
    if double:
        out.append(text(x0 - 46, y + bh / 2 + 4.5, "null", "dsf-cap", size=12))
    for i, lab in ((0, "head"), (n - 1, "tail")):
        cx = x0 + i * (bw + gap) + bw / 2
        out.append(text(cx, 14, lab, "dsf-acc", size=12))
        out.append(f'<line class="dsf-e dsf-g" x1="{cx}" y1="{19}" x2="{cx}" y2="{y - 4}" marker-end="url(#{mid})"/>')
    kind = "Doubly linked list" if double else "Singly linked list"
    label = f"{kind}: {', '.join(values)}. Head is {values[0]}, tail is {values[-1]}, and the last node points to null."
    return W + (12 if double else 0), y + bh + 12, "".join(out), label


def cells(values, x0, y, cw=36, fade=(), accent=()):
    out = []
    for i, v in enumerate(values):
        cls = "dsf-n" + (" dsf-fade" if i in fade else "") + (" dsf-hit" if i in accent else "")
        out.append(f'<rect class="{cls}" x="{x0 + i * cw:.1f}" y="{y}" width="{cw}" height="32"/>')
        out.append(text(x0 + i * cw + cw / 2, y + 20.5, v, "dsf-t" + (" dsf-fadet" if i in fade else "")))
    return out


def draw_heap(values):
    cw = 36
    n = len(values)
    out = [text(6, 20, "index", "dsf-cap", "start", 11)]
    x0 = 50
    for i in range(n):
        out.append(text(x0 + i * cw + cw / 2, 20, i, "dsf-cap", size=11))
    out += cells(values, x0, 28, cw)
    # tree from the array
    nodes = [Node(v) for v in values]
    for i, nd in enumerate(nodes):
        nd.kids = [nodes[j] if j < n else None for j in (2 * i + 1, 2 * i + 2)]
        while nd.kids and nd.kids[-1] is None:
            nd.kids.pop()
    tw, th, body = draw_tree(nodes[0], "tree")
    W = max(x0 + n * cw + 10, tw)
    tx = (W - tw) / 2
    out.append(f'<g transform="translate({tx:.1f},80)">{body}</g>')
    label = (f"A heap stored as the array {', '.join(values)} at indexes 0 to {n - 1}, and the same heap drawn as a tree. "
             + describe_tree(nodes[0], "tree"))
    return W, 80 + th, "".join(out), label


def draw_array(values, steps):
    cw = 36
    n = len(values)
    labw = max([_w(s[0], 12) for s in steps] + [_w("index", 11)]) + 14
    x0 = labw
    out = [text(6, 20, "index", "dsf-cap", "start", 11)]
    for i in range(n):
        out.append(text(x0 + i * cw + cw / 2, 20, i, "dsf-cap", size=11))
    y = 28
    desc = []
    for lab, lo, hi, md in steps:
        out.append(text(6, y + 20.5, lab, "dsf-cap", "start", 12))
        out += cells(values, x0, y, cw, fade=[i for i in range(n) if i < lo or i > hi], accent=[md])
        marks = {}
        for name, i in (("low", lo), ("high", hi), ("mid", md)):
            marks.setdefault(i, []).append(name)
        for i, names in marks.items():
            # one label per line, so two markers on the same cell don't run into a neighbor's
            for k, name in enumerate(names):
                out.append(text(x0 + i * cw + cw / 2, y + 46 + 14 * k, name, "dsf-acc", size=11))
        desc.append(f"{lab}: low {lo}, high {hi}, mid {md} (value {values[md]})")
        y += 62 + 14 * (max(len(v) for v in marks.values()) - 1)
    label = f"Sorted array {', '.join(values)} at indexes 0 to {n - 1}. " + ". ".join(desc) + "."
    return x0 + n * cw + 10, y - 6, "".join(out), label


# ---------------------------------------------------------------- rows of cells
def cell_text(v):
    """`*v` highlights a cell, `.v` fades it, `//` is a divider."""
    if v == "//":
        return "|", ""
    if v.startswith("*") and len(v) > 1:
        return v[1:], "hit"
    if v.startswith(".") and len(v) > 1:
        return v[1:], "fade"
    return v, ""


def draw_rows(rows, index):
    """rows: (label, [values], note). Cells line up in columns across rows."""
    parsed = [(lab, [cell_text(v) for v in vals], note) for lab, vals, note in rows]
    ncol = max(len(v) for _, v, _ in parsed)
    widest = max(len(t) for _, v, _ in parsed for t, _ in v if t != "|")
    cw = max(36, widest * CH + 14)
    labw = max([_w(l, 12) for l, _, _ in parsed if l] + [_w("index", 11) if index else 0, 0])
    x0 = labw + 16 if labw else 6
    y = 28 if index else 6
    out, desc = [], []
    if index:
        out.append(text(6, 20, "index", "dsf-cap", "start", 11))
        longest = max((v for _, v, _ in parsed), key=lambda v: sum(t != "|" for t, _ in v))
        for k in range(sum(t != "|" for t, _ in longest)):
            out.append(text(x0 + col_x(longest, k, cw) + cw / 2, 20, k, "dsf-cap", size=11))
    notew = 0
    for lab, vals, note in parsed:
        if lab:
            out.append(text(6, y + 20.5, lab, "dsf-cap", "start", 12))
        x = x0
        for t, st in vals:
            if t == "|":
                out.append(f'<line class="dsf-split" x1="{x + 6:.1f}" y1="{y - 4}" x2="{x + 6:.1f}" y2="{y + 36}"/>')
                x += 12
                continue
            cls = "dsf-n" + (" dsf-hit" if st == "hit" else " dsf-fade" if st == "fade" else "")
            out.append(f'<rect class="{cls}" x="{x:.1f}" y="{y}" width="{cw:.1f}" height="32"/>')
            out.append(text(x + cw / 2, y + 20.5, t, "dsf-t" + (" dsf-fadet" if st == "fade" else "")))
            x += cw
        if note:
            out.append(text(x + 14, y + 20.5, note, "dsf-cap", "start", 12))
            notew = max(notew, x + 14 + _w(note, 12) - x0)
        desc.append((lab + ": " if lab else "") + " ".join(t for t, _ in vals) + (f" ({note})" if note else ""))
        y += 42
    width = x0 + max(ncol * cw + 12, notew) + 10
    return width, y - 4, "".join(out), "Rows of an array. " + ". ".join(desc) + "."


def col_x(vals, k, cw):
    x, seen = 0, 0
    for t, _ in vals:
        if t == "|":
            x += 12
            continue
        if seen == k:
            return x
        x += cw
        seen += 1
    return x


# ---------------------------------------------------------------- grids (matrices, DP tables)
def draw_grid(spec):
    """`A B C / A: 0 4 9 / B: ∞ 0 2`: column heads, then labeled rows. `*v` highlights."""
    parts = [p.strip() for p in spec.split(" / ")]
    heads = parts[0].split()
    rows = []
    for p in parts[1:]:
        lab, _, vals = p.partition(":")
        rows.append((lab.strip(), [cell_text(v) for v in vals.split()]))
    widest = max([len(h) for h in heads] + [len(t) for _, r in rows for t, _ in r])
    cw = max(32, widest * CH + 12)
    labw = max(_w(l) for l, _ in rows) + 14
    out = []
    for j, h in enumerate(heads):
        out.append(text(labw + j * cw + cw / 2, 18, h, "dsf-t"))
    y = 26
    for lab, vals in rows:
        out.append(text(labw - 10, y + cw / 2 + 4.5, lab, "dsf-t", "end"))
        for j, (t, st) in enumerate(vals):
            cls = "dsf-n dsf-sq" + (" dsf-hit" if st == "hit" else "")
            out.append(f'<rect class="{cls}" x="{labw + j * cw:.1f}" y="{y}" width="{cw:.1f}" height="{cw:.1f}"/>')
            out.append(text(labw + j * cw + cw / 2, y + cw / 2 + 4.5, t, "dsf-t"))
        y += cw
    label = "Table with columns " + ", ".join(heads) + ". " + ". ".join(
        f"Row {lab}: " + ", ".join(t for t, _ in vals) for lab, vals in rows) + "."
    return labw + len(heads) * cw + 8, y + 6, "".join(out), label


# ---------------------------------------------------------------- call chains and stack frames
def draw_calls(calls, mid):
    """calls: (depth, label, note, returns). Each call is a pill, one step right of its caller."""
    step, rowh = 26, 42
    pillw = max(_w(c[1]) for c in calls) + 22
    notew = max([_w(c[2], 12) for c in calls if c[2]] + [0])
    retw = max([_w(c[3], 12) for c in calls if c[3]] + [0])
    maxd = max(c[0] for c in calls)
    nx = 12 + maxd * step + pillw + 14
    rx = nx + (notew + 24 if notew else 0)
    out, desc = [arrow_defs(mid)], []
    out.append(text(12, 14, "calls go down", "dsf-cap", "start", 11))
    if retw:
        out.append(text(rx, 14, "returns go back up", "dsf-cap", "start", 11))
    for i, (d, lab, note, ret) in enumerate(calls):
        x, y = 12 + d * step, 24 + i * rowh
        out.append(f'<rect class="dsf-n" x="{x}" y="{y}" width="{pillw:.1f}" height="30" rx="15"/>')
        out.append(text(x + pillw / 2, y + 19.5, lab))
        if i:
            px = 12 + calls[i - 1][0] * step + 14
            out.append(f'<path class="dsf-e dsf-g" d="M{px} {y - rowh + 30}V{y + 15}H{x - 3}" marker-end="url(#{mid})"/>')
        if note:
            out.append(text(nx, y + 19.5, note, "dsf-cap", "start", 12))
        if ret:
            out.append(text(rx, y + 19.5, ret, "dsf-acc", "start", 12))
        desc.append(f"{lab}" + (f", {note}" if note else "") + (f", returns {ret.removeprefix('returns ')}" if ret else ""))
    if retw and len(calls) > 1:
        ax = rx + retw + 14
        out.append(f'<line class="dsf-e dsf-g" x1="{ax:.1f}" y1="{24 + (len(calls) - 1) * rowh + 15}" x2="{ax:.1f}" y2="{39}" marker-end="url(#{mid})"/>')
        rx += 20
    W = max(rx + retw + 12, rx - 20 + _w("returns go back up", 11) + 8) if retw else (nx + notew + 12)
    return W, 24 + len(calls) * rowh, "".join(out), "Recursive calls, each made by the one before it: " + "; ".join(desc) + "."


def draw_frames(frames):
    """frames: (label, vars, note), top of the stack first."""
    w1 = max(_w(f[0]) for f in frames) + 24
    w2 = max([_w(f[1]) for f in frames] + [0]) + 24
    out = []
    y = 6
    for i, (lab, vars_, note) in enumerate(frames):
        top = i == 0
        out.append(f'<rect class="dsf-n{" dsf-hit" if top else ""}" x="6" y="{y}" width="{w1 + w2:.1f}" height="32" rx="4"/>')
        out.append(text(18, y + 20.5, lab, "dsf-t", "start"))
        if vars_:
            out.append(text(6 + w1 + 6, y + 20.5, vars_, "dsf-cap", "start", 13))
        if note:
            out.append(text(6 + w1 + w2 + 14, y + 20.5, note, "dsf-acc" if top else "dsf-cap", "start", 12))
        y += 36
    notew = max([_w(f[2], 12) for f in frames] + [0])
    label = "Call stack, top first: " + "; ".join(", ".join(x for x in f if x) for f in frames) + "."
    return 6 + w1 + w2 + 14 + notew + 10, y + 2, "".join(out), label


# ---------------------------------------------------------------- the block
def parse_spec(text_):
    lines = []
    for raw in text_.splitlines():
        if not raw.strip():
            continue
        key, _, val = raw.strip().partition(":")
        lines.append((key.strip(), val.strip()))
    return lines


def render(spec_text, n):
    lines = parse_spec(spec_text)
    opts = {k: v for k, v in lines}
    panels = []   # (svg, caption)
    mid = f"dsf{n}"
    title = opts.get("title")
    levels = [t.strip() for t in opts["levels"].split("|")] if "levels" in opts else None
    for i, (k, v) in enumerate(lines):
        if k in ("tree", "nary", "btree"):
            cap, _, body = v.rpartition("::")
            root = parse_tree(body)
            W, H, inner = draw_tree(root, k, levels if not panels else None)
            label = describe_tree(root, k)
            if cap.strip():
                label = cap.strip() + ". " + label
            panels.append((svg_open(W, H, label) + inner + "</svg>", cap.strip()))
    if "nodes" in opts:
        W, H, inner, label = draw_graph(opts["nodes"], opts.get("edges", ""), mid)
        panels.append((svg_open(W, H, label) + inner + "</svg>", opts.get("caption", "")))
    if "list" in opts:
        W, H, inner, label = draw_list(opts["list"].split(), opts.get("double") == "yes", mid)
        panels.append((svg_open(W, H, label) + inner + "</svg>", opts.get("caption", "")))
    if "heap" in opts:
        W, H, inner, label = draw_heap(opts["heap"].split())
        panels.append((svg_open(W, H, label) + inner + "</svg>", opts.get("caption", "")))
    if "array" in opts:
        steps = []
        for k, v in lines:
            if k == "step":
                lab, _, nums = v.partition("|")
                lo, hi, md = (int(x) for x in nums.split())
                steps.append((lab.strip(), lo, hi, md))
        W, H, inner, label = draw_array(opts["array"].split(), steps)
        panels.append((svg_open(W, H, label) + inner + "</svg>", opts.get("caption", "")))
    rows = [v for k, v in lines if k == "row"]
    if rows:
        parsed = []
        for v in rows:
            bits = [b.strip() for b in v.split("|")]
            parsed.append((bits[0], bits[1].split(), bits[2] if len(bits) > 2 else ""))
        W, H, inner, label = draw_rows(parsed, opts.get("index") == "yes")
        panels.append((svg_open(W, H, label) + inner + "</svg>", opts.get("caption", "")))
    for k, v in lines:
        if k == "grid":
            cap, _, body = v.rpartition("::")
            W, H, inner, label = draw_grid(body)
            if cap.strip():
                label = cap.strip() + ". " + label
            panels.append((svg_open(W, H, label) + inner + "</svg>", cap.strip()))
    calls = [v for k, v in lines if k == "call"]
    if calls:
        parsed = []
        for v in calls:
            d = len(v) - len(v.lstrip(">"))
            bits = [b.strip() for b in v.lstrip(">").split("|")] + ["", ""]
            parsed.append((d, bits[0], bits[1], bits[2]))
        W, H, inner, label = draw_calls(parsed, mid)
        panels.append((svg_open(W, H, label) + inner + "</svg>", opts.get("caption", "")))
    frames = [v for k, v in lines if k == "frame"]
    if frames:
        parsed = [tuple(([b.strip() for b in v.split("|")] + ["", ""])[:3]) for v in frames]
        W, H, inner, label = draw_frames(parsed)
        panels.append((svg_open(W, H, label) + inner + "</svg>", opts.get("caption", "")))
    if not panels:
        raise ValueError("figure: nothing to draw in:\n" + spec_text)
    flow = opts.get("flow") == "yes"
    parts = []
    for i, (svg, cap) in enumerate(panels):
        capt = f'<span class="dsf-pcap">{escape(cap)}</span>' if cap else ""
        panel = f'<span class="dsf-panel">{svg}{capt}</span>'
        if i and flow:
            # the arrow travels with the panel it points at, so a wrapped row still reads
            panel = f'<span class="dsf-step"><span class="dsf-flow" aria-hidden="true">→</span>{panel}</span>'
        parts.append(panel)
    head = f'<span class="dsf-title">{escape(title)}</span>' if title else ""
    # Focusable so keyboard users can scroll a figure that's wider than a phone.
    name = title or next((c for _, c in panels if c), "Drawing")
    group = f' tabindex="0" role="group" aria-label="{escape(name)}"' 
    return f'<div class="dsf"{group}>{head}<span class="dsf-row">{"".join(parts)}</span></div>'


def on_page_markdown(markdown, page, **kwargs):
    if "<!-- figure" not in markdown:
        return markdown
    figs = []

    def sub(m):
        figs.append(render(m["spec"], f"{len(_pages)}x{len(figs)}"))
        return f'{m["indent"]}<div class="dsf-slot" data-dsf="{len(figs) - 1}"></div>'

    markdown = BLOCK.sub(sub, markdown)
    _pages[page.file.src_uri] = figs
    return markdown


def on_page_content(html, page, **kwargs):
    figs = _pages.pop(page.file.src_uri, None)
    if not figs:
        return html
    return PLACEHOLDER.sub(lambda m: figs[int(m[1])], html)
