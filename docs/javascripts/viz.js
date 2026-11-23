/* Diagrams and interactive benches for the study pages (styles: viz.css).

   A page asks for one with a placeholder whose Markdown content is the fallback
   GitHub shows:

     <div class="viz" data-viz="linked-list" markdown>
     *On the site, this is an interactive diagram.*
     </div>

   Kinds (BUILDERS below): linked-list, stack-queue, hash-probe, heap, sort,
   loop-grid, growth-chart, cost-spectrum, chapter-map, and the static figures
   allocation, huffman, tree-shapes.

   On C949 pages it also turns growth classes in table cells (O(1), O(log n),
   O(n), O(n log n), O(n²), O(2ⁿ), O(n!)) into color-coded chips. The colors are
   one per class across the site, always next to the class's text. */
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var counter = 0;
  function uid(p) { counter += 1; return p + counter; }
  function el(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (parent) parent.appendChild(n);
    return n;
  }
  function h(tag, attrs, parent, text) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (text !== undefined) n.textContent = text;
    if (parent) parent.appendChild(n);
    return n;
  }
  function txt(parent, x, y, s, attrs) {
    var a = Object.assign({ x: x, y: y }, attrs || {});
    var t = el("text", a, parent); t.textContent = s; return t;
  }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, reduce ? 0 : ms); }); }
  function arrowMarker(svg, id, color) {
    var defs = svg.querySelector("defs") || el("defs", {}, svg);
    var m = el("marker", { id: id, viewBox: "0 0 10 10", refX: 9, refY: 5, markerWidth: 8, markerHeight: 8, orient: "auto-start-reverse" }, defs);
    el("path", { d: "M0,0 L10,5 L0,10 z", fill: color }, m);
    return "url(#" + id + ")";
  }

  /* ---------------- growth classes ---------------- */
  function lnGamma(z) {
    var c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
    if (z < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * z)) - lnGamma(1 - z);
    z -= 1; var x = c[0]; for (var i = 1; i < 9; i++) x += c[i] / (z + i);
    var t = z + 7.5; return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
  }
  var CLASSES = [
    { id: "1", name: "O(1)", f: function () { return 1; } },
    { id: "2", name: "O(log n)", f: function (n) { return Math.max(1, Math.log2(n)); } },
    { id: "3", name: "O(n)", f: function (n) { return n; } },
    { id: "4", name: "O(n log n)", f: function (n) { return n * Math.max(1, Math.log2(n)); } },
    { id: "5", name: "O(n²)", f: function (n) { return n * n; } },
    { id: "6", name: "O(2ⁿ)", f: function (n) { return Math.pow(2, n); } },
    { id: "7", name: "O(n!)", f: function (n) { return Math.exp(lnGamma(n + 1)); } }
  ];
  var CLASS_ID = { "1": "1", "log n": "2", "n": "3", "n log n": "4", "n²": "5", "n^2": "5", "2ⁿ": "6", "2^n": "6", "n!": "7" };
  function fmt(v) {
    if (!isFinite(v)) return "≫ 10^300";
    if (v >= 1e7) return v.toExponential(1).replace("e+", " × 10^");
    return Math.round(v).toLocaleString("en-US");
  }
  function chip(name) {
    var m = /^O\((.+)\)$/.exec(name);
    var id = m ? CLASS_ID[m[1]] : null;
    return '<span class="viz-chip"' + (id ? ' data-c="' + id + '"' : "") + ">" + name + "</span>";
  }

  /* Chips in C949 table cells. Skips quiz tables (they hold inputs) and code. */
  function chips() {
    if (!/\/c949\//.test(location.pathname)) return;
    var re = /O\((n log n|log n|n²|n\^2|2ⁿ|2\^n|n!|n|1)\)/g;
    document.querySelectorAll(".md-typeset table td").forEach(function (td) {
      if (td.closest(".viz") || td.closest("table").querySelector("input, select, button")) return;
      var walker = document.createTreeWalker(td, NodeFilter.SHOW_TEXT, null);
      var nodes = [];
      while (walker.nextNode()) {
        var n = walker.currentNode;
        if (n.parentElement.closest("code, a, .viz-chip")) continue;
        if (re.test(n.nodeValue)) nodes.push(n);
        re.lastIndex = 0;
      }
      nodes.forEach(function (n) {
        var frag = document.createDocumentFragment(), s = n.nodeValue, last = 0, m;
        re.lastIndex = 0;
        while ((m = re.exec(s))) {
          if (m.index > last) frag.appendChild(document.createTextNode(s.slice(last, m.index)));
          var sp = document.createElement("span");
          sp.className = "viz-chip"; sp.setAttribute("data-c", CLASS_ID[m[1]]); sp.textContent = m[0];
          frag.appendChild(sp);
          last = m.index + m[0].length;
        }
        if (last < s.length) frag.appendChild(document.createTextNode(s.slice(last)));
        n.parentNode.replaceChild(frag, n);
      });
    });
  }

  /* ---------------- bench frame ---------------- */
  function bench(root, title, hint, viewBox, label) {
    root.textContent = "";
    var b = h("div", { class: "viz-bench" }, root);
    var head = h("div", { class: "viz-head" }, b);
    h("p", { class: "viz-title" }, head, title);
    if (hint) h("span", { class: "viz-hint" }, head, hint);
    var controls = h("div", { class: "viz-controls" }, b);
    var stage = h("div", { class: "viz-stage", tabindex: "0", role: "group", "aria-label": title + ": diagram" }, b);
    var svg = el("svg", { viewBox: viewBox, role: "img", "aria-label": label }, stage);
    var narr = h("div", { class: "viz-narr" }, b);
    var left = h("div", {}, narr);
    var say = h("p", { class: "viz-say", "aria-live": "polite" }, left);
    var code = h("div", { class: "viz-code" }, left);
    var tally = h("div", { class: "viz-tally" }, narr);
    return { b: b, controls: controls, svg: svg, say: say, code: code, tally: tally };
  }
  function btn(parent, label, cls) { var x = h("button", { type: "button", class: "viz-btn" + (cls ? " " + cls : "") }, parent, label); return x; }
  function spacer(parent) { h("span", { class: "viz-spacer" }, parent); }
  function field(parent, label, input) { var id = uid("vz-f"); var l = h("label", { class: "viz-field", for: id }, parent, label + " "); input.id = id; l.appendChild(input); return input; }
  function numberInput(value, min, max) { var i = document.createElement("input"); i.type = "number"; i.value = value; i.min = min; i.max = max; return i; }
  function select(options, value) { var s = document.createElement("select"); options.forEach(function (o) { var op = document.createElement("option"); op.value = o[0]; op.textContent = o[1]; if (o[0] === value) op.selected = true; s.appendChild(op); }); return s; }
  function tallyRow(tally, label) { h("span", { class: "viz-lbl" }, tally, label); var big = h("span", { class: "viz-big" }, tally, "0"); return big; }

  /* ---------------- linked list ---------------- */
  function linkedList(root) {
    var B = bench(root, "Singly-linked list, step by step", "Pick an operation, then step through it. Watch which pointers change.", "0 0 780 230", "A singly-linked list with head and tail pointers");
    var ops = [["prepend", "Prepend"], ["append", "Append"], ["insertAfter", "Insert after 7"], ["removeLast", "Remove last"], ["search", "Search for 1"]];
    var opBtns = ops.map(function (o) { var b = btn(B.controls, o[1]); b.dataset.op = o[0]; return b; });
    spacer(B.controls);
    var back = btn(B.controls, "← Back"), next = btn(B.controls, "Next step →", "primary"), reset = btn(B.controls, "Reset");
    var hops = tallyRow(B.tally, "Pointer hops so far");
    var cost = h("span", {}, B.tally);
    var svg = B.svg;
    var mA = arrowMarker(svg, uid("la"), "var(--viz-ink)"), mH = arrowMarker(svg, uid("lh"), "var(--viz-accent)"), mF = arrowMarker(svg, uid("lf"), "var(--viz-good)");
    var gArrows = el("g", {}, svg), gNodes = el("g", {}, svg), gPtr = el("g", {}, svg);
    var W = 86, H = 44, GAP = 52, X0 = 40, Y0 = 92, ids = 10, animateIn = false;
    function start() { return [{ id: 1, v: 4 }, { id: 2, v: 7 }, { id: 3, v: 1 }, { id: 4, v: 6 }]; }
    var list = start(), frames = [], fi = 0, pending = null;
    function pos(i) { return X0 + i * (W + GAP); }
    function layout(arr) { return arr.map(function (n, i) { return { id: n.id, v: n.v, x: pos(i), y: Y0 }; }); }
    function chain(arr) { return arr.map(function (n, i) { return [n.id, arr[i + 1] ? arr[i + 1].id : null]; }); }
    function frame(nodes, o) {
      // head and tail default to the ends of the linked row, not a new node waiting below it
      var row = nodes.filter(function (n) { return n.y === Y0; }).sort(function (a, b) { return a.x - b.x; });
      return Object.assign({ nodes: nodes, links: null, cur: null, mark: {}, hops: 0, head: row.length ? row[0].id : null, tail: row.length ? row[row.length - 1].id : null }, o);
    }
    function draw(f) {
      var seen = {};
      f.nodes.forEach(function (n) {
        seen[n.id] = true;
        var g = gNodes.querySelector('[data-id="' + n.id + '"]');
        if (!g) {
          g = el("g", { class: "vz-node vz-move", "data-id": n.id }, gNodes);
          el("rect", { x: 0, y: 0, width: W, height: H, rx: 8 }, g);
          el("line", { class: "split", x1: W * 0.62, y1: 0, x2: W * 0.62, y2: H }, g);
          txt(g, W * 0.31, H / 2 + 6, String(n.v), { "text-anchor": "middle" });
          el("circle", { class: "dot", cx: W * 0.81, cy: H / 2, r: 4 }, g);
          if (animateIn) { g.style.transform = "translate(" + n.x + "px," + (n.y + 40) + "px)"; g.style.opacity = 0; g.getBoundingClientRect(); }
        }
        g.setAttribute("class", "vz-node vz-move" + (f.mark[n.id] ? " " + f.mark[n.id] : ""));
        g.style.transform = "translate(" + n.x + "px," + n.y + "px)";
        g.style.opacity = f.mark[n.id] === "gone" && f.fade ? 0.3 : 1;
      });
      Array.prototype.forEach.call(gNodes.querySelectorAll(".vz-node"), function (g) { if (!seen[g.dataset.id]) g.remove(); });
      gArrows.textContent = "";
      var byId = {}; f.nodes.forEach(function (n) { byId[n.id] = n; });
      var links = f.links || chain(f.nodes.filter(function (n) { return n.y === Y0; }).sort(function (a, b) { return a.x - b.x; }));
      links.forEach(function (l) {
        var A = byId[l[0]]; if (!A) return;
        var sx = A.x + W * 0.81, sy = A.y + H / 2;
        if (l[1] == null) {
          el("path", { class: "vz-arrow", d: "M" + sx + "," + sy + " L" + (A.x + W + 30) + "," + sy, "marker-end": mA }, gArrows);
          txt(gArrows, A.x + W + 34, sy + 4, "null", { class: "vz-muted" });
          return;
        }
        var Bn = byId[l[1]], d;
        if (Math.abs(A.y - Bn.y) < 2) d = "M" + sx + "," + sy + " L" + (Bn.x - 2) + "," + (Bn.y + H / 2);
        else {
          var below = Bn.y > A.y, bx = Bn.x + W * 0.4, by = below ? Bn.y - 2 : Bn.y + H + 2;
          d = "M" + sx + "," + sy + " C " + (sx + 24) + "," + sy + " " + bx + "," + ((sy + by) / 2) + " " + bx + "," + by;
        }
        el("path", { class: "vz-arrow" + (l[2] ? " " + l[2] : ""), d: d, "marker-end": l[2] === "hot" ? mH : l[2] === "fresh" ? mF : mA }, gArrows);
      });
      gPtr.textContent = "";
      function ptr(id, label, below) {
        var n = byId[id]; if (!n) return;
        var g = el("g", { class: "vz-ptr" }, gPtr), x = n.x + W / 2;
        if (below) { txt(g, x, n.y + H + 40, label, { "text-anchor": "middle" }); el("line", { x1: x, y1: n.y + H + 26, x2: x, y2: n.y + H + 4, "marker-end": mH }, g); }
        else { txt(g, x, n.y - 34, label, { "text-anchor": "middle" }); el("line", { x1: x, y1: n.y - 30, x2: x, y2: n.y - 4, "marker-end": mH }, g); }
      }
      ptr(f.head, "head", false);
      if (f.tail === f.head) ptr(f.tail, "tail", true); else ptr(f.tail, "tail", false);
      if (f.cur) ptr(f.cur, "cur", true);
      B.say.innerHTML = f.text; B.code.textContent = f.code || "";
      hops.textContent = f.hops;
      cost.innerHTML = f.cost ? chip(f.cost) : "";
      next.disabled = fi >= frames.length - 1; back.disabled = fi <= 0;
    }
    function rnd() { return 2 + Math.floor(Math.random() * 8); }
    var OPS = {
      prepend: function () {
        if (list.length >= 5) return null;
        var v = rnd(), id = ++ids, L = list, nn = { id: id, v: v }, base = layout(L), low = { id: id, v: v, x: X0 - 10, y: Y0 + 80 };
        return { after: [nn].concat(L), frames: [
          frame(base, { text: "Prepend <b>" + v + "</b>." }),
          frame(base.concat([low]), { mark: mk(id, "new"), links: chain(L).concat([[id, null]]), text: "Make a new node holding <b>" + v + "</b>. Its next pointer starts as null.", code: "node = Node(" + v + ")" }),
          frame(base.concat([low]), { mark: mk(id, "new"), links: chain(L).concat([[id, L[0].id, "fresh"]]), text: "Point the new node at the current head (<b>" + L[0].v + "</b>).", code: "node.next = head" }),
          frame(base.concat([low]), { mark: mk(id, "new"), links: chain(L).concat([[id, L[0].id, "fresh"]]), head: id, text: "Move <b>head</b> to the new node. Three steps, however long the list is.", code: "head = node", cost: "O(1)" }),
          frame(layout([nn].concat(L)), { text: "The list is now <b>" + [nn].concat(L).map(function (n) { return n.v; }).join(" → ") + "</b>. Prepend is O(1).", cost: "O(1)" })
        ] };
      },
      append: function () {
        if (list.length >= 5) return null;
        var v = rnd(), id = ++ids, L = list, T = L[L.length - 1], base = layout(L), low = { id: id, v: v, x: pos(L.length), y: Y0 + 80 };
        var ch = chain(L).slice(0, -1);
        return { after: L.concat([{ id: id, v: v }]), frames: [
          frame(base, { text: "Append <b>" + v + "</b>, using the tail pointer." }),
          frame(base.concat([low]), { mark: mk(id, "new"), links: chain(L).concat([[id, null]]), text: "Make a new node holding <b>" + v + "</b>.", code: "node = Node(" + v + ")" }),
          frame(base.concat([low]), { mark: mk(id, "new"), links: ch.concat([[T.id, id, "fresh"], [id, null]]), text: "Point the old tail (<b>" + T.v + "</b>) at it. No walking: tail already knows where the end is.", code: "tail.next = node" }),
          frame(base.concat([low]), { mark: mk(id, "new"), links: ch.concat([[T.id, id, "fresh"], [id, null]]), tail: id, text: "Move <b>tail</b> to the new node.", code: "tail = node", cost: "O(1)" }),
          frame(layout(L.concat([{ id: id, v: v }])), { text: "Done in O(1). Without a tail pointer, you'd walk all n nodes first: O(n).", cost: "O(1)" })
        ] };
      },
      insertAfter: function () {
        var L = list, k = L.findIndex(function (n) { return n.v === 7; });
        if (k < 0 || L.length >= 5) return null;
        var v = rnd(), id = ++ids, cur = L[k], succ = L[k + 1], base = layout(L), ch = chain(L);
        var out = L.slice(0, k + 1).concat([{ id: id, v: v }], L.slice(k + 1));
        var low = { id: id, v: v, x: pos(k) + (W + GAP) / 2, y: Y0 + 80 };
        var without = ch.filter(function (l) { return l[0] !== cur.id; });
        var m2 = mk(cur.id, "cur"); m2[id] = "new";
        return { after: out, frames: [
          frame(base, { cur: cur.id, mark: mk(cur.id, "cur"), text: "Insert <b>" + v + "</b> after the node holding 7. We already have that node as <b>cur</b>." }),
          frame(base.concat([low]), { cur: cur.id, mark: m2, links: ch.concat([[id, null]]), text: "Make the new node.", code: "node = Node(" + v + ")" }),
          frame(base.concat([low]), { cur: cur.id, mark: m2, links: ch.concat([[id, succ ? succ.id : null, "fresh"]]), text: "First, point the new node at cur's successor" + (succ ? " (<b>" + succ.v + "</b>)" : "") + ". Do this before the next step, or the rest of the list is lost.", code: "node.next = cur.next" }),
          frame(base.concat([low]), { cur: cur.id, mark: m2, links: without.concat([[cur.id, id, "fresh"], [id, succ ? succ.id : null, "fresh"]]), text: "Then point cur at the new node.", code: "cur.next = node", cost: "O(1)" }),
          frame(layout(out), { text: "Done in O(1). Finding cur by its value first would cost O(n).", cost: "O(1)" })
        ] };
      },
      removeLast: function () {
        var L = list; if (L.length < 2) return null;
        var base = layout(L), fr = [frame(base, { text: "Remove the last node. The new tail must be the node <i>before</i> it, and nodes only point forward." })];
        for (var i = 0; i < L.length - 1; i++) {
          (function (i) {
            fr.push(frame(base, { cur: L[i].id, mark: mk(L[i].id, "cur"), links: chain(L).map(function (l) { return l[0] === L[i].id ? [l[0], l[1], "hot"] : l; }), hops: i,
              text: i < L.length - 2 ? "cur holds <b>" + L[i].v + "</b>. Is cur.next the tail? No. Keep walking." : "cur holds <b>" + L[i].v + "</b>, and cur.next is the tail. Found the node before it after <b>" + i + "</b> hops.",
              code: i === 0 ? "cur = head" : "cur = cur.next" }));
          })(i);
        }
        var p = L[L.length - 2], t = L[L.length - 1], out = L.slice(0, -1), m = mk(p.id, "cur"); m[t.id] = "gone";
        fr.push(frame(base, { cur: p.id, mark: m, fade: true, links: chain(out).slice(0, -1).concat([[p.id, null]]), tail: p.id, hops: L.length - 2, text: "Unlink it: cur.next = null, and tail = cur. The walk is what makes this O(n).", code: "cur.next = None\ntail = cur", cost: "O(n)" }));
        fr.push(frame(layout(out), { hops: L.length - 2, text: "Done. In a doubly-linked list, tail.prev skips the walk, so it's O(1) there.", cost: "O(n)" }));
        return { after: out, frames: fr };
      },
      search: function () {
        var L = list, base = layout(L), fr = [frame(base, { text: "Search for <b>1</b>, starting at head.", code: "cur = head" })], found = false;
        for (var i = 0; i < L.length && !found; i++) {
          var hit = L[i].v === 1;
          fr.push(frame(base, { cur: L[i].id, mark: mk(L[i].id, hit ? "new" : "cur"), hops: i, text: hit ? "cur holds <b>1</b>: found after " + i + " hops." : "cur holds <b>" + L[i].v + "</b>, not 1. Follow next.", code: hit ? "return cur" : "cur = cur.next", cost: hit ? (i === 0 ? "O(1)" : "O(n)") : null }));
          found = hit;
        }
        if (!found) fr.push(frame(base, { hops: L.length, text: "Reached null: 1 isn't in the list. That's the worst case: O(n).", cost: "O(n)" }));
        return { after: L, frames: fr };
      }
    };
    function mk(id, cls) { var m = {}; m[id] = cls; return m; }
    function run(name) {
      var r = OPS[name]();
      if (!r) { B.say.innerHTML = name === "removeLast" ? "Only one node is left. Press Reset." : "This diagram holds five nodes at most. Press Reset or remove one."; return; }
      frames = r.frames; fi = 0; pending = r.after; draw(frames[0]);
    }
    opBtns.forEach(function (b) { b.addEventListener("click", function () { run(b.dataset.op); }); });
    next.addEventListener("click", function () { if (fi < frames.length - 1) { fi++; draw(frames[fi]); if (fi === frames.length - 1 && pending) list = pending; } });
    back.addEventListener("click", function () { if (fi > 0) { fi--; draw(frames[fi]); } });
    reset.addEventListener("click", function () { list = start(); frames = [frame(layout(list), { text: "Reset to <b>4 → 7 → 1 → 6</b>." })]; fi = 0; draw(frames[0]); });
    frames = [frame(layout(list), { text: "The list holds <b>4 → 7 → 1 → 6</b>, with <b>head</b> and <b>tail</b> pointers. Choose an operation above, then press Next step." })];
    draw(frames[0]);
    animateIn = true;
  }

  /* ---------------- stack and circular-array queue ---------------- */
  function stackQueue(root) {
    var B = bench(root, "A stack, and a queue in a circular array", "Every operation here is O(1): nothing ever shifts.", "0 0 780 250", "A stack drawn as a vertical pile, and a queue stored in an array of 8 slots that wraps around");
    var push = btn(B.controls, "Push", "primary"), pop = btn(B.controls, "Pop");
    h("span", { class: "viz-spacer" }, B.controls);
    var enq = btn(B.controls, "Enqueue", "primary"), deq = btn(B.controls, "Dequeue"), reset = btn(B.controls, "Reset");
    var moved = tallyRow(B.tally, "Items shifted");
    h("span", {}, B.tally).innerHTML = chip("O(1)");
    var svg = B.svg, mH = arrowMarker(svg, uid("sq"), "var(--viz-accent)");
    var gS = el("g", {}, svg), gQ = el("g", {}, svg);
    var SIZE = 8, CW = 56, QX = 270, QY = 110;
    var stack, queue, front, length, letter;
    var LET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    function nextLetter() { var s = LET[letter % 26]; letter += 1; return s; }
    function init() { stack = ["A", "B"]; queue = Array(SIZE).fill(null); queue[5] = "C"; queue[6] = "D"; queue[7] = "E"; front = 5; length = 3; letter = 5; }
    function draw(mark) {
      mark = mark || {};
      gS.textContent = ""; gQ.textContent = "";
      txt(gS, 30, 26, "Stack", { class: "vz-cap" });
      for (var i = 0; i < 5; i++) {
        var y = 200 - i * 34, has = i < stack.length;
        var g = el("g", { class: "vz-cell" + (has ? " full" : "") + (has && i === stack.length - 1 && mark.stack ? " " + mark.stack : "") }, gS);
        el("rect", { x: 40, y: y, width: 100, height: 30, rx: 6 }, g);
        if (has) txt(g, 90, y + 21, stack[i], { class: "v", "text-anchor": "middle" });
      }
      if (stack.length) {
        var ty = 200 - (stack.length - 1) * 34 + 15;
        var p = el("g", { class: "vz-ptr" }, gS);
        el("line", { x1: 190, y1: ty, x2: 146, y2: ty, "marker-end": mH }, p); txt(p, 196, ty + 4, "top");
      }
      txt(gQ, QX, 26, "Queue: an array of " + SIZE + " slots", { class: "vz-cap" });
      for (var j = 0; j < SIZE; j++) {
        var x = QX + j * CW;
        var g2 = el("g", { class: "vz-cell" + (queue[j] ? " full" : "") + (mark.q === j ? " " + mark.qcls : "") }, gQ);
        el("rect", { x: x, y: QY, width: CW - 6, height: 44, rx: 6 }, g2);
        if (queue[j]) txt(g2, x + (CW - 6) / 2, QY + 28, queue[j], { class: "v", "text-anchor": "middle" });
        txt(g2, x + (CW - 6) / 2, QY + 62, String(j), { class: "i", "text-anchor": "middle" });
      }
      var fx = QX + front * CW + (CW - 6) / 2, nxt = (front + length) % SIZE, nx = QX + nxt * CW + (CW - 6) / 2;
      var pf = el("g", { class: "vz-ptr" }, gQ);
      txt(pf, fx, QY - 34, "front", { "text-anchor": "middle" }); el("line", { x1: fx, y1: QY - 30, x2: fx, y2: QY - 4, "marker-end": mH }, pf);
      if (length < SIZE) {
        var pn = el("g", { class: "vz-ptr" }, gQ);
        txt(pn, nx, QY + 104, "next slot", { "text-anchor": "middle" }); el("line", { x1: nx, y1: QY + 90, x2: nx, y2: QY + 68, "marker-end": mH }, pn);
      }
    }
    function say(t, c) { B.say.innerHTML = t; B.code.textContent = c || ""; }
    push.addEventListener("click", function () {
      if (stack.length >= 5) { say("The diagram holds five items. Pop one first."); return; }
      var v = nextLetter(); stack.push(v); draw({ stack: "new" });
      say("Push <b>" + v + "</b>: it goes on top. Nothing below it moves.", "stack.append('" + v + "')");
    });
    pop.addEventListener("click", function () {
      if (!stack.length) { say("The stack is empty: popping it is an error."); return; }
      var v = stack.pop(); draw();
      say("Pop returns <b>" + v + "</b>, the most recent push: last in, first out.", "stack.pop()  # '" + v + "'");
    });
    enq.addEventListener("click", function () {
      if (length >= SIZE) { say("The array is full. A bounded queue refuses the item; an unbounded one would copy everything to a bigger array (O(n), but rare)."); return; }
      var slot = (front + length) % SIZE, v = nextLetter();
      queue[slot] = v; length += 1; draw({ q: slot, qcls: "new" });
      say("Enqueue <b>" + v + "</b> at (front + length) % " + SIZE + " = (" + front + " + " + (length - 1) + ") % " + SIZE + " = <b>" + slot + "</b>." + (slot < front ? " It wrapped around to the start." : ""), "slot = (front + length) % " + SIZE + "   # " + slot + "\nlength += 1");
    });
    deq.addEventListener("click", function () {
      if (!length) { say("The queue is empty: dequeuing it is an error."); return; }
      var v = queue[front], old = front; queue[front] = null; front = (front + 1) % SIZE; length -= 1; draw({ q: old, qcls: "gone" });
      say("Dequeue returns <b>" + v + "</b> from index " + old + ", the oldest item: first in, first out. front moves to (" + old + " + 1) % " + SIZE + " = <b>" + front + "</b>.", "front = (front + 1) % " + SIZE + "   # " + front + "\nlength -= 1");
    });
    reset.addEventListener("click", function () { init(); draw(); say("Reset. The queue starts near the end of the array, so the next enqueue wraps around."); });
    init(); draw(); moved.textContent = "0";
    say("Push and pop work at the top of the stack. The queue keeps a <b>front</b> index and a length, so its items can wrap around the end of the array.");
  }

  /* ---------------- hash table probing ---------------- */
  function hashProbe(root) {
    var N = 13;
    var B = bench(root, "Hash table: watch the probes", N + " buckets, h = key % " + N + ". Keys 5, 18, and 31 all start at bucket 5.", "0 0 780 190", "A hash table with " + N + " buckets");
    var strat = "linear", table, busy = false;
    var grp = h("span", { class: "viz-field", role: "group", "aria-label": "Collision strategy" }, B.controls);
    var sBtns = [["linear", "Linear"], ["quadratic", "Quadratic"], ["double", "Double hashing"]].map(function (s) {
      var b = btn(grp, s[1]); b.dataset.strat = s[0]; b.setAttribute("aria-pressed", String(s[0] === strat)); return b;
    });
    var key = field(B.controls, "Key", numberInput(44, 0, 999));
    var ins = btn(B.controls, "Insert", "primary"), rnd = btn(B.controls, "Random key"), reset = btn(B.controls, "Reset");
    var load = tallyRow(B.tally, "Load factor");
    var probesLbl = h("span", { class: "viz-lbl" }, B.tally, "Last insert: 0 probes");
    var svg = B.svg, SW = 52, X0 = 70, Y0 = 70;
    txt(svg, 10, Y0 + 30, "bucket", { class: "vz-cap" });
    var keyT = txt(svg, 10, 34, "", { class: "vz-cap" });
    var slots = [];
    for (var i = 0; i < N; i++) {
      var s = el("g", { class: "vz-slot", transform: "translate(" + (X0 + i * SW) + "," + Y0 + ")" }, svg);
      el("rect", { x: 0, y: 0, width: SW - 6, height: 50, rx: 7 }, s);
      var k = txt(s, (SW - 6) / 2, 32, "", { class: "k", "text-anchor": "middle" });
      txt(s, (SW - 6) / 2, 70, String(i), { class: "ix", "text-anchor": "middle" });
      slots.push({ s: s, k: k });
    }
    var pathG = el("g", {}, svg);
    var F = { linear: "probe(i) = (h + i) % " + N, quadratic: "probe(i) = (h + i + i²) % " + N, double: "probe(i) = (h + i·h2) % " + N + ", h2 = 7 − key % 7" };
    function seq(k) { var h0 = k % N, h2 = 7 - (k % 7); return function (i) { return strat === "linear" ? (h0 + i) % N : strat === "quadratic" ? (h0 + i + i * i) % N : (h0 + i * h2) % N; }; }
    function place(k) { var p = seq(k); for (var i = 0; i < N; i++) { var j = p(i); if (table[j] === null) { table[j] = k; return; } } }
    function paint(marks) {
      marks = marks || {};
      slots.forEach(function (o, i) { o.k.textContent = table[i] === null ? "" : table[i]; o.s.setAttribute("class", "vz-slot" + (table[i] !== null ? " full" : "") + (marks[i] ? " " + marks[i] : "")); });
      load.textContent = (table.filter(function (x) { return x !== null; }).length / N).toFixed(2);
    }
    function doReset() { table = Array(N).fill(null); [5, 18, 31].forEach(place); paint(); pathG.textContent = ""; keyT.textContent = ""; B.say.innerHTML = "Insert 44: 44 % " + N + " = 5, which is taken. See where each strategy sends it."; B.code.textContent = F[strat]; probesLbl.textContent = "Last insert: 0 probes"; }
    function insert(k) {
      if (busy) return; busy = true; pathG.textContent = "";
      var p = seq(k), h0 = k % N, log = [], prev = null, i = 0;
      keyT.textContent = "key " + k + ": h = " + k + " % " + N + " = " + h0 + (strat === "double" ? ", h2 = 7 − " + (k % 7) + " = " + (7 - k % 7) : "");
      (function stepProbe() {
        if (i >= N) { B.say.innerHTML = "No free bucket was found for <b>" + k + "</b>" + (strat === "quadratic" ? ": quadratic probing can miss empty buckets" : "") + ". The table needs to resize."; busy = false; return; }
        var j = p(i);
        if (prev !== null) {
          var x1 = X0 + prev * SW + (SW - 6) / 2, x2 = X0 + j * SW + (SW - 6) / 2, lift = 26 + Math.min(40, Math.abs(x2 - x1) / 8);
          el("path", { d: "M" + x1 + "," + (Y0 - 4) + " C " + x1 + "," + (Y0 - lift) + " " + x2 + "," + (Y0 - lift) + " " + x2 + "," + (Y0 - 4), fill: "none", stroke: "var(--viz-accent)", "stroke-width": 2, "stroke-dasharray": "4 3" }, pathG);
        }
        prev = j;
        if (table[j] === null) {
          table[j] = k; var m = {}; m[j] = "landed"; paint(m);
          log.push("i=" + i + " → " + j + " ✓");
          B.say.innerHTML = "<b>" + k + "</b> lands in bucket <b>" + j + "</b> after <b>" + i + "</b> collision" + (i === 1 ? "" : "s") + "." + (i >= 3 ? " Long probe runs like this are why a full table slows down." : "");
          B.code.textContent = F[strat] + "\n" + log.join("   ");
          probesLbl.textContent = "Last insert: " + (i + 1) + " probe" + (i ? "s" : "");
          busy = false; return;
        }
        var t = {}; t[j] = "taken"; paint(t);
        log.push("i=" + i + " → " + j + " ✗");
        B.say.innerHTML = "Try bucket <b>" + j + "</b>: it holds " + table[j] + ". Probe again.";
        B.code.textContent = F[strat] + "\n" + log.join("   ");
        i += 1; setTimeout(stepProbe, reduce ? 0 : 650);
      })();
    }
    sBtns.forEach(function (b) { b.addEventListener("click", function () { if (busy) return; strat = b.dataset.strat; sBtns.forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); }); doReset(); }); });
    ins.addEventListener("click", function () { insert(Math.max(0, Math.min(999, parseInt(key.value, 10) || 0))); });
    rnd.addEventListener("click", function () { var v = Math.floor(Math.random() * 100); key.value = v; insert(v); });
    reset.addEventListener("click", function () { if (!busy) doReset(); });
    doReset();
  }

  /* ---------------- max-heap ---------------- */
  function heap(root) {
    var B = bench(root, "Max-heap: the tree and the array are the same thing", "Insert percolates up; remove-max percolates down. Both views move together. New values are random.", "0 0 780 330", "A max-heap drawn as a tree, and the same heap as an array");
    var ins = btn(B.controls, "Insert a random value", "primary"), rem = btn(B.controls, "Remove max"), reset = btn(B.controls, "Reset");
    var swapsEl = tallyRow(B.tally, "Swaps on the last operation");
    h("span", {}, B.tally).innerHTML = chip("O(log n)");
    B.code.remove();
    var svg = B.svg, gE = el("g", {}, svg), gN = el("g", {}, svg), gA = el("g", {}, svg);
    txt(svg, 20, 246, "The same heap as an array (the index is under each cell):", { class: "vz-cap" });
    var ids = 0, items, busy = false;
    function start() { return [50, 30, 40, 10, 20, 35].map(function (v) { ids += 1; return { id: ids, v: v }; }); }
    function tp(i) { var lvl = Math.floor(Math.log2(i + 1)), first = Math.pow(2, lvl) - 1, w = 740 / Math.pow(2, lvl); return [20 + w * (i - first) + w / 2, 30 + lvl * 58]; }
    function ap(i) { return [40 + i * 48, 258]; }
    function draw(mark) {
      mark = mark || {}; gE.textContent = "";
      for (var i = 1; i < items.length; i++) { var a = tp(Math.floor((i - 1) / 2)), b = tp(i); el("line", { class: "vz-edge", x1: a[0], y1: a[1], x2: b[0], y2: b[1] }, gE); }
      var live = {}; items.forEach(function (n) { live[n.id] = true; });
      Array.prototype.forEach.call(gN.querySelectorAll(".vz-hn"), function (g) { if (!live[g.dataset.id]) g.remove(); });
      Array.prototype.forEach.call(gA.querySelectorAll(".vz-cell"), function (g) { if (!live[g.dataset.id]) g.remove(); });
      items.forEach(function (n, i) {
        var p = tp(i), g = gN.querySelector('.vz-hn[data-id="' + n.id + '"]');
        if (!g) { g = el("g", { class: "vz-hn vz-move", "data-id": n.id }, gN); el("circle", { r: 20 }, g); txt(g, 0, 6, String(n.v), { "text-anchor": "middle" }); g.style.transform = "translate(" + p[0] + "px," + p[1] + "px)"; }
        g.setAttribute("class", "vz-hn vz-move" + (mark[i] ? " " + mark[i] : "")); g.style.transform = "translate(" + p[0] + "px," + p[1] + "px)";
        var q = ap(i), c = gA.querySelector('.vz-cell[data-id="' + n.id + '"]');
        if (!c) { c = el("g", { class: "vz-cell full vz-move", "data-id": n.id }, gA); el("rect", { width: 42, height: 38, rx: 6 }, c); txt(c, 21, 25, String(n.v), { class: "v", "text-anchor": "middle" }); txt(c, 21, 54, "", { class: "i", "text-anchor": "middle" }); c.style.transform = "translate(" + q[0] + "px," + q[1] + "px)"; }
        c.setAttribute("class", "vz-cell full vz-move" + (mark[i] ? " " + mark[i] : "")); c.style.transform = "translate(" + q[0] + "px," + q[1] + "px)";
        c.querySelector("text.i").textContent = i;
      });
    }
    function swap(a, b) { var t = items[a]; items[a] = items[b]; items[b] = t; }
    function say(t) { B.say.innerHTML = t; }
    async function insert(v) {
      if (busy) return;
      if (items.length >= 15) { say("This diagram holds 15 values. Remove one or reset."); return; }
      busy = true; var swaps = 0; swapsEl.textContent = 0;
      ids += 1; items.push({ id: ids, v: v }); var i = items.length - 1, m = {};
      m[i] = "cur"; draw(m); say("Add <b>" + v + "</b> at the end: index " + i + ", the next free spot on the bottom level."); await sleep(900);
      while (i > 0) {
        var p = Math.floor((i - 1) / 2); m = {}; m[i] = "cur"; m[p] = "cmp"; draw(m);
        say("The parent of " + i + " is (" + i + " − 1) // 2 = <b>" + p + "</b>, holding " + items[p].v + ". Is " + items[i].v + " bigger?"); await sleep(900);
        if (items[i].v <= items[p].v) { say(items[i].v + " ≤ " + items[p].v + ": the heap property holds. Stop after <b>" + swaps + "</b> swap" + (swaps === 1 ? "" : "s") + "."); break; }
        swap(i, p); swaps += 1; swapsEl.textContent = swaps; i = p; m = {}; m[i] = "cur"; draw(m); say("Yes: swap them. " + items[i].v + " moves up to index " + i + "."); await sleep(900);
      }
      if (i === 0) say("<b>" + items[0].v + "</b> reached the root after <b>" + swaps + "</b> swaps. At most one swap per level: O(log n).");
      draw(); busy = false;
    }
    async function removeMax() {
      if (busy || !items.length) return; busy = true; var swaps = 0; swapsEl.textContent = 0;
      var top = items[0].v; draw({ 0: "cur" }); say("Remove the max, <b>" + top + "</b>, from the root."); await sleep(900);
      var last = items.pop(); if (!items.length) { draw(); busy = false; return; }
      items[0] = last; draw({ 0: "cur" }); say("Move the last value, <b>" + last.v + "</b>, into the root. Now push it down."); await sleep(900);
      var i = 0;
      for (;;) {
        var l = 2 * i + 1, r = 2 * i + 2, big = i, m = {}; m[i] = "cur";
        if (l < items.length) { m[l] = "cmp"; if (items[l].v > items[big].v) big = l; }
        if (r < items.length) { m[r] = "cmp"; if (items[r].v > items[big].v) big = r; }
        draw(m); say(l < items.length ? "The children of " + i + " are at " + l + " and " + r + ". Compare " + items[i].v + " with the larger child." : "Index " + i + " has no children."); await sleep(900);
        if (big === i) { say(items[i].v + " is at least as big as its children. Done after <b>" + swaps + "</b> swap" + (swaps === 1 ? "" : "s") + ": O(log n)."); break; }
        swap(i, big); swaps += 1; swapsEl.textContent = swaps; i = big; m = {}; m[i] = "cur"; draw(m); await sleep(700);
      }
      draw(); busy = false;
    }
    ins.addEventListener("click", function () {
      var have = {}; items.forEach(function (n) { have[n.v] = true; });
      var v; do { v = 1 + Math.floor(Math.random() * 98); } while (have[v]);
      insert(v);
    });
    rem.addEventListener("click", removeMax);
    reset.addEventListener("click", function () { if (busy) return; gN.textContent = ""; gA.textContent = ""; items = start(); draw(); say("Root at index 0. The children of index i are at 2i + 1 and 2i + 2, and its parent is at (i − 1) // 2."); });
    items = start(); draw(); say("Root at index 0. The children of index i are at 2i + 1 and 2i + 2, and its parent is at (i − 1) // 2.");
  }

  /* ---------------- sorting ---------------- */
  function sort(root) {
    var B = bench(root, "Sorting: count the work, see the case", "Run one sort on sorted, random, and reversed input: that's its best, average, and worst case.", "0 0 780 220", "Bars being sorted by height");
    var alg = field(B.controls, "Sort", select([["bubble", "Bubble"], ["selection", "Selection"], ["insertion", "Insertion"], ["merge", "Merge"]], "insertion"));
    var inp = field(B.controls, "Input", select([["random", "Random"], ["sorted", "Already sorted"], ["reversed", "Reversed"]], "random"));
    spacer(B.controls);
    var play = btn(B.controls, "Play", "primary"), stepB = btn(B.controls, "Step"), reset = btn(B.controls, "Reset");
    var cmpEl = tallyRow(B.tally, "Comparisons");
    var mvLbl = h("span", { class: "viz-lbl" }, B.tally, "");
    var caseEl = h("span", {}, B.tally);
    B.code.remove();
    var svg = B.svg, N = 12, BW = 52, X0 = 80, BASE = 200;
    var gen, timer = null, cmp = 0, mv = 0, bars = [];
    function input() {
      var v = [3, 9, 1, 7, 12, 5, 10, 2, 8, 11, 4, 6];
      if (inp.value === "sorted") return v.slice().sort(function (a, b) { return a - b; });
      if (inp.value === "reversed") return v.slice().sort(function (a, b) { return b - a; });
      return v;
    }
    function upd() { cmpEl.textContent = cmp; mvLbl.textContent = "Moves: " + mv + " · n = " + N + ", n² = " + N * N; }
    function build() {
      svg.textContent = ""; bars = [];
      var d = input();
      d.forEach(function (v, i) {
        var g = el("g", { class: "vz-bar vz-move" }, svg), hgt = v * 14;
        el("rect", { x: 0, y: BASE - hgt, width: BW - 10, height: hgt, rx: 3 }, g);
        txt(g, (BW - 10) / 2, BASE + 14, String(v), { "text-anchor": "middle" });
        g.style.transform = "translate(" + (X0 + i * BW) + "px,0)";
        bars[i] = g;
      });
      cmp = mv = 0; upd(); caseEl.innerHTML = "";
      gen = ALGOS[alg.value](d.slice());
    }
    function lay(id, mark) { id.forEach(function (bid, i) { var g = bars[bid]; g.style.transform = "translate(" + (X0 + i * BW) + "px,0)"; g.setAttribute("class", "vz-bar vz-move" + (mark[i] ? " " + mark[i] : "")); }); }
    function o(k, v) { var m = {}; m[k] = v; return m; }
    function o2(a, b, v) { var m = {}; m[a] = v; m[b] = v; return m; }
    var ALGOS = {
      bubble: function* (a) { var id = a.map(function (_, i) { return i; }), n = a.length, t; for (var i = 0; i < n - 1; i++) { var sw = false; for (var j = 0; j < n - 1 - i; j++) { yield { id: id, mark: o2(j, j + 1, "cmp"), c: 1, say: "Compare " + a[j] + " and " + a[j + 1] + "." }; if (a[j] > a[j + 1]) { t = a[j]; a[j] = a[j + 1]; a[j + 1] = t; t = id[j]; id[j] = id[j + 1]; id[j + 1] = t; sw = true; yield { id: id, mark: o2(j, j + 1, "swp"), m: 1, say: "Out of order: swap them." }; } } if (!sw) { yield { id: id, done: true, say: "A pass with no swaps means the list is sorted, so it stops early." }; return; } } yield { id: id, done: true }; },
      selection: function* (a) { var id = a.map(function (_, i) { return i; }), n = a.length, t; for (var i = 0; i < n - 1; i++) { var m = i; for (var j = i + 1; j < n; j++) { var mk = {}; mk[m] = "swp"; mk[j] = "cmp"; yield { id: id, mark: mk, c: 1, say: "Smallest so far: " + a[m] + ". Compare it with " + a[j] + "." }; if (a[j] < a[m]) m = j; } if (m !== i) { t = a[i]; a[i] = a[m]; a[m] = t; t = id[i]; id[i] = id[m]; id[m] = t; } yield { id: id, mark: o(i, "swp"), m: 1, say: "Swap " + a[i] + " into position " + i + "." }; } yield { id: id, done: true }; },
      insertion: function* (a) { var id = a.map(function (_, i) { return i; }), t; for (var i = 1; i < a.length; i++) { var j = i; while (j > 0) { yield { id: id, mark: o2(j - 1, j, "cmp"), c: 1, say: "Is " + a[j] + " smaller than " + a[j - 1] + "?" }; if (a[j] >= a[j - 1]) break; t = a[j]; a[j] = a[j - 1]; a[j - 1] = t; t = id[j]; id[j] = id[j - 1]; id[j - 1] = t; yield { id: id, mark: o(j - 1, "swp"), m: 1, say: "Yes: shift it one place left." }; j--; } } yield { id: id, done: true }; },
      merge: function* (a) {
        var id = a.map(function (_, i) { return i; });
        function* ms(lo, hi) {
          if (hi - lo < 2) return;
          var mid = (lo + hi) >> 1; yield* ms(lo, mid); yield* ms(mid, hi);
          var L = [], R = [], k, i = 0, j = 0;
          for (k = lo; k < mid; k++) L.push([a[k], id[k]]);
          for (k = mid; k < hi; k++) R.push([a[k], id[k]]);
          k = lo;
          while (i < L.length && j < R.length) {
            yield { id: id, mark: o2(lo + i, mid + j, "cmp"), c: 1, say: "Merge: compare " + L[i][0] + " and " + R[j][0] + "." };
            var take = L[i][0] <= R[j][0] ? L[i++] : R[j++]; a[k] = take[0]; id[k] = take[1]; k++;
          }
          while (i < L.length) { a[k] = L[i][0]; id[k] = L[i][1]; i++; k++; }
          while (j < R.length) { a[k] = R[j][0]; id[k] = R[j][1]; j++; k++; }
          var mk = {}; for (var t = lo; t < hi; t++) mk[t] = "swp";
          yield { id: id, mark: mk, m: hi - lo, say: "Merged positions " + lo + " to " + (hi - 1) + "." };
        }
        yield* ms(0, a.length); yield { id: id, done: true };
      }
    };
    var EXPECT = {
      bubble: { sorted: "O(n)", random: "O(n²)", reversed: "O(n²)" }, selection: { sorted: "O(n²)", random: "O(n²)", reversed: "O(n²)" },
      insertion: { sorted: "O(n)", random: "O(n²)", reversed: "O(n²)" }, merge: { sorted: "O(n log n)", random: "O(n log n)", reversed: "O(n log n)" }
    };
    var CASE = { sorted: "best case", random: "average case", reversed: "worst case" };
    function step() {
      var r = gen.next(); if (r.done) { stop(); return false; }
      var s = r.value; if (s.c) cmp += s.c; if (s.m) mv += s.m; upd();
      if (s.done) {
        var all = {}; s.id.forEach(function (_, i) { all[i] = "done"; }); lay(s.id, all);
        B.say.innerHTML = (s.say ? s.say + " " : "") + "Sorted with <b>" + cmp + "</b> comparisons.";
        var c = alg.value === "selection" ? "always" : alg.value === "merge" ? "every case" : CASE[inp.value];
        caseEl.innerHTML = chip(EXPECT[alg.value][inp.value]) + ' <span class="viz-lbl">' + c + "</span>";
        stop(); return false;
      }
      lay(s.id, s.mark || {}); if (s.say) B.say.textContent = s.say;
      return true;
    }
    function stop() { clearInterval(timer); timer = null; play.textContent = "Play"; }
    play.addEventListener("click", function () { if (timer) { stop(); return; } play.textContent = "Pause"; timer = setInterval(function () { if (!step()) stop(); }, reduce ? 60 : 380); });
    stepB.addEventListener("click", function () { stop(); step(); });
    reset.addEventListener("click", function () { stop(); build(); B.say.textContent = "Press Play. Yellow bars are being compared; blue bars just moved."; });
    alg.addEventListener("change", function () { stop(); build(); });
    inp.addEventListener("change", function () { stop(); build(); });
    build(); B.say.textContent = "Press Play. Yellow bars are being compared; blue bars just moved.";
  }

  /* ---------------- loop tracer: one dot per run of the busiest line ---------------- */
  function loopGrid(root) {
    var PAT = {
      single: { name: "Single loop", code: "for i in range(n):\n    work()", rows: function (n) { return [n]; }, big: "O(n)" },
      nested: { name: "Nested loops", code: "for i in range(n):\n    for j in range(n):\n        work()", rows: function (n) { return Array(n).fill(n); }, big: "O(n²)" },
      dependent: { name: "Inner loop runs i times", code: "for i in range(n):\n    for j in range(i):\n        work()", rows: function (n) { var r = []; for (var i = 0; i < n; i++) r.push(i); return r; }, big: "O(n²)" },
      halving: { name: "Halving loop", code: "i = n\nwhile i > 1:\n    i = i // 2\n    work()", rows: function (n) { var c = 0, i = n; while (i > 1) { i = Math.floor(i / 2); c++; } return [c]; }, big: "O(log n)" },
      nlogn: { name: "Halving inside a loop", code: "for i in range(n):\n    j = n\n    while j > 1:\n        j = j // 2\n        work()", rows: function (n) { var c = 0, j = n; while (j > 1) { j = Math.floor(j / 2); c++; } return Array(n).fill(c); }, big: "O(n log n)" },
      shrinking: { name: "Shrinking inner loop", code: "i = n\nwhile i > 0:\n    for j in range(i):\n        work()\n    i = i // 2", rows: function (n) { var r = [], i = n; while (i > 0) { r.push(i); i = Math.floor(i / 2); } return r; }, big: "O(n)" }
    };
    var B = bench(root, "Loop tracer: one dot per run of the busiest line", "Each row is one pass of the outer loop. Count the dots, then double n.", "0 0 780 340", "Dots showing how many times the innermost line runs");
    var pat = field(B.controls, "Pattern", select(Object.keys(PAT).map(function (k) { return [k, PAT[k].name]; }), "dependent"));
    var nSel = field(B.controls, "n", select([["4", "4"], ["8", "8"], ["16", "16"]], "8"));
    spacer(B.controls);
    var play = btn(B.controls, "Trace it", "primary");
    var total = tallyRow(B.tally, "Runs of work()");
    var bigEl = h("span", {}, B.tally);
    var cmpEl = h("span", { class: "viz-lbl" }, B.tally, "");
    var svg = B.svg, timer = null;
    function counts(p) { return [4, 8, 16].map(function (n) { return [n, PAT[p].rows(n).reduce(function (a, b) { return a + b; }, 0)]; }); }
    function render(animate) {
      clearInterval(timer);
      var p = pat.value, n = +nSel.value, rows = PAT[p].rows(n);
      var maxCols = Math.max(1, Math.max.apply(null, rows)), D = Math.min(18, Math.floor(600 / maxCols)), R = Math.max(3, D / 2 - 2);
      var height = Math.max(120, 50 + rows.length * D + 20);
      svg.setAttribute("viewBox", "0 0 780 " + height);
      svg.textContent = "";
      var g = el("g", { class: "vz-dotg" }, svg), dots = [];
      rows.forEach(function (c, r) {
        txt(svg, 120, 44 + r * D + D / 2 + 4, rows.length > 1 ? "pass " + (r + 1) : "", { class: "vz-cap", "text-anchor": "end" });
        for (var k = 0; k < c; k++) dots.push(el("circle", { cx: 140 + k * D + D / 2, cy: 44 + r * D + D / 2, r: R, class: animate ? "off" : "" }, g));
        if (c === 0) txt(svg, 140, 44 + r * D + D / 2 + 4, "0 runs", { class: "vz-cap" });
      });
      txt(svg, 20, 24, PAT[p].name + ", n = " + n + ": " + dots.length + " dot" + (dots.length === 1 ? "" : "s"), { class: "vz-cap" });
      B.code.textContent = PAT[p].code;
      bigEl.innerHTML = chip(PAT[p].big);
      var cs = counts(p);
      cmpEl.textContent = "n = 4, 8, 16 → " + cs.map(function (c) { return c[1]; }).join(", ") + " runs";
      B.say.innerHTML = rows.length > 1 ? "The busiest line runs <b>" + dots.length + "</b> times: " + rows.join(" + ") + ". " + note(p) : "The busiest line runs <b>" + dots.length + "</b> times. " + note(p);
      if (!animate) { total.textContent = dots.length; return; }
      var i = 0; total.textContent = 0;
      timer = setInterval(function () { var stepN = Math.max(1, Math.ceil(dots.length / 40)); for (var s = 0; s < stepN && i < dots.length; s++, i++) dots[i].setAttribute("class", ""); total.textContent = i; if (i >= dots.length) clearInterval(timer); }, reduce ? 1 : 45);
    }
    function note(p) {
      return {
        single: "One run per item: doubling n doubles the dots.",
        nested: "An n × n square: doubling n quadruples the dots.",
        dependent: "A triangle: about half of the n × n square, which is still O(n²).",
        halving: "Each pass halves i, so only log₂ n passes fit.",
        nlogn: "n rows of log₂ n dots each.",
        shrinking: "Each row is half the one above, so the total stays under 2n. That's O(n), not O(n log n)."
      }[p];
    }
    pat.addEventListener("change", function () { render(false); });
    nSel.addEventListener("change", function () { render(false); });
    play.addEventListener("click", function () { render(true); });
    render(false);
  }

  /* ---------------- growth chart ---------------- */
  function growthChart(root) {
    root.textContent = "";
    var b = h("div", { class: "viz-bench" }, root);
    var head = h("div", { class: "viz-head" }, b);
    h("p", { class: "viz-title" }, head, "How fast each growth class grows");
    h("span", { class: "viz-hint" }, head, "Hover the chart to read every class at one n. Click a class to hide it.");
    var controls = h("div", { class: "viz-controls" }, b);
    var range = document.createElement("input"); range.type = "range"; range.min = 8; range.max = 64; range.value = 20;
    field(controls, "Largest n", range);
    var nv = h("b", {}, controls, "20");
    var grp = h("span", { class: "viz-field", role: "group", "aria-label": "Vertical scale" }, controls);
    var linB = btn(grp, "Linear scale"), logB = btn(grp, "Log scale");
    linB.setAttribute("aria-pressed", "true"); logB.setAttribute("aria-pressed", "false");
    var leg = h("div", { class: "viz-legend" }, b);
    var wrap = h("div", { class: "viz-chart", tabindex: "0", role: "group", "aria-label": "Growth chart" }, b);
    var svg = el("svg", { viewBox: "0 0 760 360", role: "img", "aria-label": "Steps needed by each growth class as n grows" }, wrap);
    svg.style.width = "100%"; svg.style.minWidth = "34rem"; svg.style.height = "auto"; svg.style.display = "block";
    var tip = h("div", { class: "viz-tip" }, wrap); tip.hidden = true;
    var det = h("details", {}, b); h("summary", {}, det, "Show as a table");
    var tw = h("div", { style: "overflow-x:auto", tabindex: "0", role: "group", "aria-label": "Growth classes as a table" }, det), table = h("table", {}, tw);
    var W = 760, H = 360, M = { l: 70, r: 96, t: 16, b: 40 }, pw = W - M.l - M.r, ph = H - M.t - M.b;
    var nMax = 20, log = false, on = {};
    CLASSES.forEach(function (c) {
      on[c.id] = true;
      var x = h("button", { type: "button", "aria-pressed": "true" }, leg, c.name);
      x.style.setProperty("--viz-sw", "var(--viz-c" + c.id + ")");
      x.addEventListener("click", function () { on[c.id] = !on[c.id]; x.setAttribute("aria-pressed", String(on[c.id])); render(); });
    });
    function niceTicks(max) { var raw = max / 5, mag = Math.pow(10, Math.floor(Math.log10(raw))), step = [1, 2, 5, 10].map(function (s) { return s * mag; }).find(function (s) { return s >= raw; }), out = []; for (var v = 0; v <= max; v += step) out.push(v); return out; }
    function render() {
      svg.textContent = "";
      var yMax = Math.max(10, nMax * nMax * 1.05), yLog = 15;
      function sx(n) { return M.l + ((n - 1) / (nMax - 1)) * pw; }
      function sy(v) { return log ? M.t + ph - (Math.log10(Math.max(1, v)) / yLog) * ph : M.t + ph - (Math.min(v, yMax) / yMax) * ph; }
      var grid = el("g", { class: "vz-grid" }, svg), axis = el("g", { class: "vz-axis" }, svg);
      var ticks = log ? [0, 3, 6, 9, 12, 15].map(function (p) { return [Math.pow(10, p), p === 0 ? "1" : "10^" + p]; }) : niceTicks(yMax).map(function (v) { return [v, v.toLocaleString("en-US")]; });
      ticks.forEach(function (t) { var y = sy(t[0]); el("line", { x1: M.l, x2: M.l + pw, y1: y, y2: y }, grid); txt(axis, M.l - 8, y + 4, t[1], { "text-anchor": "end" }); });
      var xt = niceTicks(nMax).filter(function (v) { return v >= 1; }); if (xt.indexOf(1) < 0) xt.unshift(1);
      xt.forEach(function (v) { txt(axis, sx(v), M.t + ph + 20, String(v), { "text-anchor": "middle" }); });
      txt(axis, M.l + pw / 2, H - 4, "n (input size)", { "text-anchor": "middle" });
      txt(axis, 14, M.t + ph / 2, log ? "steps (log scale)" : "steps", { "text-anchor": "middle", transform: "rotate(-90 14 " + (M.t + ph / 2) + ")" });
      var sg = el("g", { class: "vz-series" }, svg), labels = [];
      CLASSES.forEach(function (c) {
        if (!on[c.id]) return;
        var d = "", exitN = null, last = null, stepN = nMax > 30 ? 0.25 : 0.1;
        for (var n = 1; n <= nMax; n += stepN) {
          var v = c.f(n), over = log ? Math.log10(Math.max(1, v)) > yLog : v > yMax;
          if (over) { exitN = n; d += "L" + sx(n).toFixed(1) + "," + M.t; break; }
          d += (d ? "L" : "M") + sx(n).toFixed(1) + "," + sy(v).toFixed(1); last = v;
        }
        if (!exitN) { last = c.f(nMax); d += "L" + sx(nMax).toFixed(1) + "," + sy(last).toFixed(1); }
        el("path", { d: d, stroke: "var(--viz-c" + c.id + ")" }, sg);
        labels.push(exitN ? { x: sx(exitN), y: M.t + 2, text: c.name + " ↑", top: true } : { x: sx(nMax) + 8, y: sy(last) + 4, text: c.name });
      });
      var right = labels.filter(function (l) { return !l.top; }).sort(function (a, b2) { return b2.y - a.y; });
      right.forEach(function (l, i) { l.y = Math.min(l.y, M.t + ph + 4); if (i && right[i - 1].y - l.y < 14) l.y = right[i - 1].y - 14; txt(svg, l.x, l.y, l.text, { class: "vz-lbl" }); });
      var tops = labels.filter(function (l) { return l.top; }).sort(function (a, b2) { return a.x - b2.x; });
      tops.forEach(function (l, i) { if (i && l.x - tops[i - 1].x < 62) l.x = tops[i - 1].x + 62; txt(svg, l.x + 4, l.y + 10, l.text, { class: "vz-lbl" }); });
      var xh = el("line", { class: "vz-xh", y1: M.t, y2: M.t + ph, visibility: "hidden" }, svg);
      var hit = el("rect", { class: "vz-hit", x: M.l, y: M.t, width: pw, height: ph }, svg);
      function hide() { tip.hidden = true; xh.setAttribute("visibility", "hidden"); }
      hit.addEventListener("pointermove", function (e) {
        var r = svg.getBoundingClientRect(), px = (e.clientX - r.left) * (W / r.width), n = Math.round(1 + ((px - M.l) / pw) * (nMax - 1));
        if (n < 1 || n > nMax) { hide(); return; }
        xh.setAttribute("x1", sx(n)); xh.setAttribute("x2", sx(n)); xh.setAttribute("visibility", "visible");
        tip.innerHTML = '<div class="row"><b>n = ' + n + "</b><span></span></div>" + CLASSES.filter(function (c) { return on[c.id]; }).map(function (c) { return '<div class="row"><span><span class="sw" style="background:var(--viz-c' + c.id + ')"></span>' + c.name + "</span><span>" + fmt(c.f(n)) + "</span></div>"; }).join("");
        tip.hidden = false;
        var box = wrap.getBoundingClientRect(), left = e.clientX - box.left + wrap.scrollLeft + 14;
        if (left + 200 > box.width + wrap.scrollLeft) left -= 228;
        tip.style.left = left + "px"; tip.style.top = Math.max(0, e.clientY - box.top - 20) + "px";
      });
      hit.addEventListener("pointerleave", hide);
      var ns = [1, 2, 4, 8, 16, 32, 64].filter(function (n) { return n <= nMax; });
      table.innerHTML = '<thead><tr><th scope="col">Class</th>' + ns.map(function (n) { return '<th scope="col">n = ' + n + "</th>"; }).join("") + "</tr></thead><tbody>" + CLASSES.map(function (c) { return "<tr><td>" + c.name + "</td>" + ns.map(function (n) { return "<td>" + fmt(c.f(n)) + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody>";
    }
    range.addEventListener("input", function () { nMax = +range.value; nv.textContent = nMax; render(); });
    linB.addEventListener("click", function () { log = false; linB.setAttribute("aria-pressed", "true"); logB.setAttribute("aria-pressed", "false"); render(); });
    logB.addEventListener("click", function () { log = true; logB.setAttribute("aria-pressed", "true"); linB.setAttribute("aria-pressed", "false"); render(); });
    render();
  }

  /* ---------------- cost spectrum ---------------- */
  function costSpectrum(root) {
    root.textContent = "";
    var box = h("div", { class: "viz-spectrum" }, root);
    h("div", { class: "viz-eyebrow" }, box, "The cost spectrum: steps for n = 1,000");
    var ol = h("ol", {}, box), n = 1000, max = 7;
    CLASSES.forEach(function (c) {
      var v = c.f(n), w = Math.min(100, Math.max(2, (Math.log10(Math.max(1, v)) / max) * 100));
      var li = h("li", {}, ol);
      li.innerHTML = chip(c.name) + '<span style="--viz-dot:var(--viz-c' + c.id + ')"><span class="bar" style="width:' + w + '%"></span></span><span class="verdict">' + (v > 1e7 ? "off the scale" : fmt(v) + (v === 1 ? " step" : " steps")) + "</span>";
    });
  }

  /* ---------------- static figures ---------------- */
  function figure(root, title, viewBox, label) {
    root.textContent = "";
    var f = h("div", { class: "viz-figure", tabindex: "0", role: "group", "aria-label": title }, root);
    h("p", { class: "viz-title" }, f, title);
    var svg = el("svg", { viewBox: viewBox, role: "img", "aria-label": label, class: "vz-static" }, f);
    return el("g", { class: "vz-static" }, svg);
  }
  function box(g, x, y, w, ht, t, size) { el("rect", { class: "box", x: x, y: y, width: w, height: ht, rx: 5 }, g); if (t !== undefined) txt(g, x + w / 2, y + ht / 2 + (size || 14) / 3, String(t), { class: "tx", "text-anchor": "middle", "font-size": size || 14 }); }
  function node(g, x, y, t, r, size) { el("circle", { class: "nd", cx: x, cy: y, r: r || 12 }, g); txt(g, x, y + (size || 11) / 3 + 1, String(t), { class: "tx", "text-anchor": "middle", "font-size": size || 11 }); }
  function line(g, x1, y1, x2, y2) { el("line", { class: "ln", x1: x1, y1: y1, x2: x2, y2: y2 }, g); }

  function allocation(root) {
    var g = figure(root, "Sequential vs linked allocation", "0 0 400 200", "An array as one block of adjacent cells with consecutive addresses, and a linked list as nodes scattered in memory joined by arrows");
    var svg = g.ownerSVGElement, m = arrowMarker(svg, uid("al"), "var(--viz-ink)");
    txt(g, 10, 18, "Array: one block. Address of item i = start + i × size", { class: "vz-cap" });
    [3, 8, 5, 2, 9].forEach(function (v, i) { box(g, 10 + i * 56, 28, 56, 34, v, 15); txt(g, 38 + i * 56, 78, String(1000 + i * 4), { class: "vz-cap", "text-anchor": "middle" }); });
    txt(g, 10, 112, "Linked list: nodes anywhere, joined by pointers", { class: "vz-cap" });
    var P = [[14, 128], [130, 158], [64, 172], [250, 126], [300, 166]];
    [3, 8, 5, 2, 9].forEach(function (v, i) {
      box(g, P[i][0], P[i][1], 44, 24, v, 13);
      if (i < 4) el("line", { x1: P[i][0] + 44, y1: P[i][1] + 12, x2: P[i + 1][0] - 2, y2: P[i + 1][1] + 12, stroke: "var(--viz-ink)", "stroke-width": 1.4, "marker-end": m }, g);
    });
  }
  function huffman(root) {
    var g = figure(root, "The Huffman tree for MISSISSIPPI", "0 0 400 250", "A Huffman tree: the root 11 splits into S with count 4 on the 0 branch and a node of 7 on the 1 branch; 7 splits into a node of 3 on 0 and I with count 4 on 1; 3 splits into M with count 1 on 0 and P with count 2 on 1");
    var N = { root: [200, 26, "11"], S: [110, 90, "S 4"], n7: [290, 90, "7"], n3: [230, 154, "3"], I: [350, 154, "I 4"], M: [190, 210, "M 1"], P: [270, 210, "P 2"] };
    [["root", "S", "0"], ["root", "n7", "1"], ["n7", "n3", "0"], ["n7", "I", "1"], ["n3", "M", "0"], ["n3", "P", "1"]].forEach(function (e) {
      var a = N[e[0]], b = N[e[1]]; line(g, a[0], a[1], b[0], b[1]);
      txt(g, (a[0] + b[0]) / 2 + (e[2] === "0" ? -14 : 8), (a[1] + b[1]) / 2, e[2], { class: "acc", "font-size": 13 });
    });
    Object.keys(N).forEach(function (k) { var n = N[k]; node(g, n[0], n[1], n[2], 18, 12); });
    [["S", "code 0"], ["I", "code 11"], ["M", "code 100"], ["P", "code 101"]].forEach(function (c) { var n = N[c[0]]; txt(g, n[0], n[1] + 34, c[1], { class: "vz-cap", "text-anchor": "middle" }); });
  }
  function treeShapes(root) {
    var g = figure(root, "Tree shapes", "0 0 400 175", "Three small binary trees labeled full, complete, and perfect");
    [["Full", [[0, 0], [-1, 1], [1, 1], [-1.5, 2], [-0.5, 2]], [[0, 1], [0, 2], [1, 3], [1, 4]], "every node has 0 or 2 children"],
     ["Complete", [[0, 0], [-1, 1], [1, 1], [-1.5, 2], [-0.5, 2], [0.5, 2]], [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5]], "levels full; last fills from the left"],
     ["Perfect", [[0, 0], [-1, 1], [1, 1], [-1.5, 2], [-0.5, 2], [0.5, 2], [1.5, 2]], [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]], "every level completely full"]
    ].forEach(function (s, k) {
      var cx = 66 + k * 134, pp = s[1].map(function (p) { return [cx + p[0] * 28, 22 + p[1] * 42]; });
      s[2].forEach(function (e) { line(g, pp[e[0]][0], pp[e[0]][1], pp[e[1]][0], pp[e[1]][1]); });
      pp.forEach(function (p) { el("circle", { class: "nd", cx: p[0], cy: p[1], r: 9 }, g); });
      txt(g, cx, 136, s[0], { class: "tx", "text-anchor": "middle", "font-size": 13 });
      txt(g, cx, 154, s[3], { class: "vz-cap", "text-anchor": "middle", "font-size": 11 });
    });
  }


  /* ---------------- shared small-tree helpers (BST, AVL) ---------------- */
  var tid = 0;
  function tnode(k) { tid += 1; return { id: tid, k: k, l: null, r: null }; }
  function theight(n) { return n ? 1 + Math.max(theight(n.l), theight(n.r)) : -1; }
  function tlayout(root, W, top, dy) {
    var order = [];
    (function walk(n, d) { if (!n) return; walk(n.l, d + 1); order.push([n, d]); walk(n.r, d + 1); })(root, 0);
    var step = Math.min(70, (W - 80) / Math.max(1, order.length - 1)), x0 = W / 2 - step * (order.length - 1) / 2, pos = {};
    order.forEach(function (o, i) { pos[o[0].id] = { x: x0 + i * step, y: top + o[1] * dy }; });
    return pos;
  }
  function tdraw(gE, gN, root, pos, mark, notes) {
    mark = mark || {}; notes = notes || {};
    gE.textContent = "";
    (function edges(n) { if (!n) return; [n.l, n.r].forEach(function (c) { if (c) { el("line", { class: "vz-edge", x1: pos[n.id].x, y1: pos[n.id].y, x2: pos[c.id].x, y2: pos[c.id].y }, gE); edges(c); } }); })(root);
    var live = {};
    (function nodes(n) {
      if (!n) return; live[n.id] = true;
      var g = gN.querySelector('.vz-hn[data-id="' + n.id + '"]'), p = pos[n.id];
      if (!g) { g = el("g", { class: "vz-hn vz-move", "data-id": n.id }, gN); el("circle", { r: 19 }, g); txt(g, 0, 6, "", { "text-anchor": "middle", class: "k" }); txt(g, 24, -14, "", { class: "vz-cap note" }); g.style.transform = "translate(" + p.x + "px," + p.y + "px)"; }
      g.querySelector("text.k").textContent = n.k;
      g.querySelector("text.note").textContent = notes[n.id] !== undefined ? notes[n.id] : "";
      g.setAttribute("class", "vz-hn vz-move" + (mark[n.id] ? " " + mark[n.id] : ""));
      g.style.transform = "translate(" + p.x + "px," + p.y + "px)";
      nodes(n.l); nodes(n.r);
    })(root);
    Array.prototype.forEach.call(gN.querySelectorAll(".vz-hn"), function (g) { if (!live[g.dataset.id]) g.remove(); });
  }

  /* ---------------- binary search tree ---------------- */
  function bst(root) {
    var B = bench(root, "Binary search tree: search, insert, remove, traverse", "New keys are random. Pick a key from the tree to search for or remove.", "0 0 780 300", "A binary search tree");
    var insB = btn(B.controls, "Insert a random key", "primary");
    var keySel = field(B.controls, "Key", select([], ""));
    var findB = btn(B.controls, "Search"), remB = btn(B.controls, "Remove");
    spacer(B.controls);
    var travs = [["inorder", "Inorder"], ["preorder", "Preorder"], ["postorder", "Postorder"], ["level", "Level order"]].map(function (x) { var b = btn(B.controls, x[1]); b.dataset.t = x[0]; return b; });
    var reset = btn(B.controls, "Reset");
    var stepsEl = tallyRow(B.tally, "Nodes visited");
    var hEl = h("span", { class: "viz-lbl" }, B.tally, "");
    var svg = B.svg, gE = el("g", {}, svg), gN = el("g", {}, svg);
    var tree, busy = false;
    function insertKey(r, k) { if (!r) return tnode(k); if (k < r.k) r.l = insertKey(r.l, k); else r.r = insertKey(r.r, k); return r; }
    function keys(n, out) { if (n) { keys(n.l, out); out.push(n.k); keys(n.r, out); } return out; }
    function count(n) { return n ? 1 + count(n.l) + count(n.r) : 0; }
    function draw(mark) {
      var pos = tlayout(tree, 780, 34, 58); tdraw(gE, gN, tree, pos, mark);
      var ks = keys(tree, []);
      keySel.textContent = ""; ks.forEach(function (k) { var o = document.createElement("option"); o.value = k; o.textContent = k; keySel.appendChild(o); });
      hEl.textContent = "Height " + theight(tree) + " · " + ks.length + " keys";
    }
    function build() { tree = null; [50, 30, 70, 20, 40, 60, 80].forEach(function (k) { tree = insertKey(tree, k); }); gN.textContent = ""; draw(); }
    function say(t, c) { B.say.innerHTML = t; B.code.textContent = c || ""; }
    function mk(id, cls) { var m = {}; m[id] = cls; return m; }
    async function walkTo(k, verb) {
      var n = tree, seen = 0, parent = null;
      while (n) {
        seen += 1; stepsEl.textContent = seen; draw(mk(n.id, "cur"));
        if (k === n.k) { say(verb + " " + k + ": found it after " + seen + " comparison" + (seen === 1 ? "" : "s") + ".", "node.key == " + k); await sleep(700); return { node: n, parent: parent, seen: seen }; }
        say(k + (k < n.k ? " < " : " > ") + n.k + ": go " + (k < n.k ? "left" : "right") + ".", k < n.k ? "node = node.left" : "node = node.right");
        await sleep(750); parent = n; n = k < n.k ? n.l : n.r;
      }
      return { node: null, parent: parent, seen: seen };
    }
    async function doInsert() {
      if (busy) return;
      if (count(tree) >= 15 || theight(tree) >= 5) { say("This diagram holds 15 keys and 5 levels at most. Remove some or reset."); return; }
      busy = true;
      var have = {}; keys(tree, []).forEach(function (k) { have[k] = true; });
      var k; do { k = 1 + Math.floor(Math.random() * 98); } while (have[k]);
      var r = await walkTo(k, "Insert");
      tree = insertKey(tree, k);
      var nn = (function find(n) { return !n ? null : n.k === k ? n : find(k < n.k ? n.l : n.r); })(tree);
      draw(mk(nn.id, "new"));
      say("Insert <b>" + k + "</b>: the search stepped off the tree below " + r.parent.k + ", so " + k + " becomes its " + (k < r.parent.k ? "left" : "right") + " child, a new leaf. O(h).", "parent." + (k < r.parent.k ? "left" : "right") + " = Node(" + k + ")");
      busy = false;
    }
    async function doSearch() {
      if (busy || !keySel.value) return; busy = true;
      await walkTo(+keySel.value, "Search for"); busy = false;
    }
    function removeKey(r, k) {
      if (!r) return null;
      if (k < r.k) r.l = removeKey(r.l, k); else if (k > r.k) r.r = removeKey(r.r, k);
      else { if (!r.l) return r.r; if (!r.r) return r.l; var s = r.r; while (s.l) s = s.l; r.k = s.k; r.r = removeKey(r.r, s.k); }
      return r;
    }
    async function doRemove() {
      if (busy || !keySel.value) return;
      if (count(tree) <= 1) { say("Keep at least one key. Press Reset to start over."); return; }
      busy = true;
      var k = +keySel.value, r = await walkTo(k, "Remove"), n = r.node;
      if (!n.l && !n.r) {
        draw(mk(n.id, "cmp")); say("<b>" + k + "</b> is a leaf: just remove it.", "parent." + (r.parent && k < r.parent.k ? "left" : "right") + " = None"); await sleep(900);
      } else if (!n.l || !n.r) {
        var c = n.l || n.r; var m = mk(n.id, "cmp"); m[c.id] = "cur"; draw(m);
        say("<b>" + k + "</b> has one child, " + c.k + ": the child takes its place.", "parent's link = node's only child"); await sleep(1100);
      } else {
        var s = n.r, m2 = mk(n.id, "cmp"); m2[s.id] = "cur"; draw(m2);
        say("<b>" + k + "</b> has two children. Find its successor: go right once, to " + s.k + "…", "succ = node.right"); await sleep(1000);
        while (s.l) { s = s.l; m2 = mk(n.id, "cmp"); m2[s.id] = "cur"; draw(m2); say("…then left as far as possible: " + s.k + ".", "succ = succ.left"); await sleep(900); }
        say("Copy " + s.k + " into the node, then remove the old " + s.k + ", which has no left child.", "node.key = succ.key"); await sleep(1100);
      }
      tree = removeKey(tree, k); draw();
      say("Removed <b>" + k + "</b>. The tree still follows the BST rule.");
      busy = false;
    }
    async function traverse(kind) {
      if (busy) return; busy = true;
      var order = [];
      if (kind === "level") { var q = [tree]; while (q.length) { var x = q.shift(); order.push(x); if (x.l) q.push(x.l); if (x.r) q.push(x.r); } }
      else (function walk(n) { if (!n) return; if (kind === "preorder") order.push(n); walk(n.l); if (kind === "inorder") order.push(n); walk(n.r); if (kind === "postorder") order.push(n); })(tree);
      var done = {}, out = [];
      var rule = { inorder: "left, node, right", preorder: "node, left, right", postorder: "left, right, node", level: "level by level, left to right" }[kind];
      for (var i = 0; i < order.length; i++) {
        done[order[i].id] = "new"; var m = Object.assign({}, done); m[order[i].id] = "cur"; draw(m);
        out.push(order[i].k); stepsEl.textContent = i + 1;
        say(kind.charAt(0).toUpperCase() + kind.slice(1) + " (" + rule + "): visit <b>" + order[i].k + "</b>.", out.join(", "));
        await sleep(600);
      }
      draw(done);
      say(kind.charAt(0).toUpperCase() + kind.slice(1) + " visits every node once: O(n)." + (kind === "inorder" ? " In a BST, that's sorted order." : ""), out.join(", "));
      busy = false;
    }
    insB.addEventListener("click", doInsert); findB.addEventListener("click", doSearch); remB.addEventListener("click", doRemove);
    travs.forEach(function (b) { b.addEventListener("click", function () { traverse(b.dataset.t); }); });
    reset.addEventListener("click", function () { if (busy) return; build(); stepsEl.textContent = 0; say("Reset. Smaller keys go left, larger keys go right, at every node."); });
    build(); say("Smaller keys go left, larger keys go right, at every node. Each step of a search goes down one level, so it costs O(h).");
  }

  /* ---------------- AVL rotation cases ---------------- */
  function avl(root) {
    var CASES = {
      ll: { name: "Left-left", keys: [50, 40, 35] }, rr: { name: "Right-right", keys: [15, 25, 35] },
      lr: { name: "Left-right", keys: [60, 45, 52] }, rl: { name: "Right-left", keys: [20, 70, 41] }
    };
    var B = bench(root, "AVL trees: the four rotation cases", "Each case inserts three keys. Watch the balance factors (left height − right height).", "0 0 780 260", "A small AVL tree being rebalanced");
    var cBtns = Object.keys(CASES).map(function (c) { var b = btn(B.controls, CASES[c].name); b.dataset.c = c; return b; });
    spacer(B.controls);
    var back = btn(B.controls, "← Back"), next = btn(B.controls, "Next step →", "primary");
    var rotEl = tallyRow(B.tally, "Rotations");
    var svg = B.svg, gE = el("g", {}, svg), gN = el("g", {}, svg);
    var frames = [], fi = 0;
    function clone(n) { return n ? { id: n.id, k: n.k, l: clone(n.l), r: clone(n.r) } : null; }
    function ins(r, k) { if (!r) return tnode(k); if (k < r.k) r.l = ins(r.l, k); else r.r = ins(r.r, k); return r; }
    function bfs(n, acc) { if (n) { var b = theight(n.l) - theight(n.r); acc[n.id] = (b > 0 ? "+" : "") + b; bfs(n.l, acc); bfs(n.r, acc); } return acc; }
    function rotR(y) { var x = y.l; y.l = x.r; x.r = y; return x; }
    function rotL(x) { var y = x.r; x.r = y.l; y.l = x; return y; }
    function snap(t, text, code, mark, rots) { frames.push({ t: clone(t), text: text, code: code || "", mark: mark || {}, rots: rots }); }
    function build(c) {
      frames = []; fi = 0; gN.textContent = "";
      var ks = CASES[c].keys, t = null;
      ks.forEach(function (k, i) { t = ins(t, k); snap(t, "Insert <b>" + k + "</b>" + (i < 2 ? "." : ". Now check the balance factors on the way back up."), "insert(" + k + ")", {}, 0); });
      var top = t, m = {}; m[top.id] = "cmp";
      var b = theight(top.l) - theight(top.r);
      var zig = b > 0 ? (ks[2] > top.l.k) : (ks[2] < top.r.k);
      snap(t, "<b>" + top.k + "</b> has balance factor " + (b > 0 ? "+2: too heavy on the left" : "−2: too heavy on the right") + ". The new key went " + (b > 0 ? "left" : "right") + ", then " + (zig ? (b > 0 ? "right" : "left") + ": a zigzag, so two rotations." : (b > 0 ? "left" : "right") + ": a straight line, so one rotation."), "", m, 0);
      var rots = 0;
      if (zig) {
        if (b > 0) { top.l = rotL(top.l); snap(top, "First, a <b>left rotation</b> at " + clone(top.l.l).k + " turns the zigzag into a straight line.", "node.left = rotate_left(node.left)", m, ++rots); }
        else { top.r = rotR(top.r); snap(top, "First, a <b>right rotation</b> at " + clone(top.r.r).k + " turns the zigzag into a straight line.", "node.right = rotate_right(node.right)", m, ++rots); }
      }
      t = b > 0 ? rotR(top) : rotL(top);
      snap(t, "A <b>" + (b > 0 ? "right" : "left") + " rotation</b> at " + top.k + " moves " + t.k + " up. Every balance factor is back to −1, 0, or +1, and the keys are still in BST order.", b > 0 ? "root = rotate_right(node)" : "root = rotate_left(node)", {}, ++rots);
      show();
    }
    function show() {
      var f = frames[fi];
      tdraw(gE, gN, f.t, tlayout(f.t, 780, 44, 70), f.mark, bfs(f.t, {}));
      B.say.innerHTML = f.text; B.code.textContent = f.code; rotEl.textContent = f.rots;
      next.disabled = fi >= frames.length - 1; back.disabled = fi <= 0;
    }
    cBtns.forEach(function (b) { b.addEventListener("click", function () { cBtns.forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); }); build(b.dataset.c); }); });
    next.addEventListener("click", function () { if (fi < frames.length - 1) { fi++; show(); } });
    back.addEventListener("click", function () { if (fi > 0) { fi--; show(); } });
    cBtns[0].setAttribute("aria-pressed", "true"); build("ll");
  }

  /* ---------------- static: red-black tree, treap, set operations ---------------- */
  function rbTree(root) {
    var g = figure(root, "A red-black tree", "0 0 400 250", "A red-black tree: 13 black at the root; children 8 red and 17 red; 8's children 1 and 11 black; 17's children 15 and 25 black; 25's right child 27 red");
    var P = { 13: [200, 26, "B"], 8: [110, 90, "R"], 17: [290, 90, "R"], 1: [60, 156, "B"], 11: [160, 156, "B"], 15: [240, 156, "B"], 25: [340, 156, "B"], 27: [370, 214, "R"] };
    [[13, 8], [13, 17], [8, 1], [8, 11], [17, 15], [17, 25], [25, 27]].forEach(function (e) { line(g, P[e[0]][0], P[e[0]][1], P[e[1]][0], P[e[1]][1]); });
    Object.keys(P).forEach(function (k) {
      var p = P[k], red = p[2] === "R";
      el("circle", { cx: p[0], cy: p[1], r: 17, fill: red ? "var(--viz-bad)" : "var(--viz-ink)", stroke: red ? "var(--viz-bad)" : "var(--viz-ink)", "stroke-width": 1.5 }, g);
      txt(g, p[0], p[1] + 5, k, { "text-anchor": "middle", "font-weight": 600, "font-size": 13, fill: "var(--viz-surface)" });
      txt(g, p[0], p[1] + 31, red ? "red" : "black", { class: "vz-cap", "text-anchor": "middle", "font-size": 11 });
    });
  }
  function treap(root) {
    var g = figure(root, "A treap: BST order by key, heap order by priority", "0 0 400 200", "A treap. Root key 50 priority 93; its children key 30 priority 71 and key 70 priority 64; 30's children key 20 priority 12 and key 40 priority 55; 70's right child key 80 priority 30");
    var P = { 50: [200, 30, 93], 30: [110, 96, 71], 70: [290, 96, 64], 20: [60, 166, 12], 40: [160, 166, 55], 80: [340, 166, 30] };
    [[50, 30], [50, 70], [30, 20], [30, 40], [70, 80]].forEach(function (e) { line(g, P[e[0]][0], P[e[0]][1], P[e[1]][0], P[e[1]][1]); });
    Object.keys(P).forEach(function (k) { var p = P[k]; el("rect", { class: "box", x: p[0] - 34, y: p[1] - 19, width: 68, height: 38, rx: 8 }, g); txt(g, p[0], p[1] - 2, "key " + k, { class: "tx", "text-anchor": "middle", "font-size": 12.5 }); txt(g, p[0], p[1] + 13, "pri " + p[2], { class: "acc", "text-anchor": "middle", "font-size": 12 }); });
  }
  function setOps(root) {
    root.textContent = "";
    var f = h("div", { class: "viz-figure", tabindex: "0", role: "group", "aria-label": "Set operations" }, root);
    h("p", { class: "viz-title" }, f, "Set operations on A = {1, 2, 3, 4, 5} and B = {4, 5, 6, 7}");
    var row = h("div", { class: "viz-venns" }, f);
    [["Union A ∪ B", "u", "both circles shaded: 1 to 7"], ["Intersection A ∩ B", "i", "only the overlap shaded: 4 and 5"], ["Difference A − B", "d", "A outside the overlap shaded: 1, 2, 3"]].forEach(function (s) {
      var svg = el("svg", { viewBox: "0 0 200 160", role: "img", "aria-label": s[0] + ": " + s[2], class: "vz-static" }, row);
      var g = el("g", { class: "vz-static" }, svg), defs = el("defs", {}, svg);
      var cx = 100, ax = cx - 28, bx = cx + 28, cy = 72, r = 52, id = uid("vs"), fill = "var(--viz-accent)";
      var cpA = el("clipPath", { id: id + "a" }, defs); el("circle", { cx: ax, cy: cy, r: r }, cpA);
      if (s[1] === "u") { el("circle", { cx: ax, cy: cy, r: r, fill: fill, opacity: .28 }, g); el("circle", { cx: bx, cy: cy, r: r, fill: fill, opacity: .28 }, g); }
      if (s[1] === "i") el("circle", { cx: bx, cy: cy, r: r, fill: fill, opacity: .35, "clip-path": "url(#" + id + "a)" }, g);
      if (s[1] === "d") { var mask = el("mask", { id: id + "m" }, defs); el("rect", { x: 0, y: 0, width: 200, height: 160, fill: "#fff" }, mask); el("circle", { cx: bx, cy: cy, r: r, fill: "#000" }, mask); el("circle", { cx: ax, cy: cy, r: r, fill: fill, opacity: .35, mask: "url(#" + id + "m)" }, g); }
      el("circle", { cx: ax, cy: cy, r: r, fill: "none", stroke: "var(--viz-ink)", "stroke-width": 1.5 }, g);
      el("circle", { cx: bx, cy: cy, r: r, fill: "none", stroke: "var(--viz-ink)", "stroke-width": 1.5 }, g);
      txt(g, ax - 34, cy - 38, "A", { class: "tx", "font-size": 14 }); txt(g, bx + 26, cy - 38, "B", { class: "tx", "font-size": 14 });
      txt(g, ax - 24, cy + 5, "1 2 3", { class: "tx", "text-anchor": "middle", "font-size": 13 });
      txt(g, cx, cy + 5, "4 5", { class: "tx", "text-anchor": "middle", "font-size": 13 });
      txt(g, bx + 24, cy + 5, "6 7", { class: "tx", "text-anchor": "middle", "font-size": 13 });
      txt(g, cx, 150, s[0], { class: "vz-cap", "text-anchor": "middle", "font-size": 13 });
    });
  }



  /* ---------------- graph helpers ---------------- */
  function gNodeDraw(g, x, y, label, cls) {
    var n = el("g", { class: "vz-hn" + (cls ? " " + cls : ""), transform: "translate(" + x + "," + y + ")" }, g);
    el("circle", { r: 18 }, n); txt(n, 0, 6, String(label), { "text-anchor": "middle" });
    return n;
  }
  function strip(g, x, y, label, items, mark) {
    txt(g, x, y - 8, label, { class: "vz-cap" });
    if (!items.length) { txt(g, x, y + 22, "(empty)", { class: "vz-cap" }); return; }
    items.forEach(function (v, i) {
      var c = el("g", { class: "vz-cell full" + (mark && mark[i] ? " " + mark[i] : "") }, g);
      el("rect", { x: x + i * 36, y: y, width: 32, height: 32, rx: 5 }, c);
      txt(c, x + i * 36 + 16, y + 21, String(v), { class: "v", "text-anchor": "middle" });
    });
  }

  /* ---------------- BFS and DFS ---------------- */
  function graphSearch(root) {
    var P = { 1: [70, 70], 2: [200, 70], 3: [330, 70], 4: [70, 190], 5: [200, 190], 6: [330, 190], 7: [265, 270] };
    var E = [[1, 2], [1, 4], [2, 3], [2, 5], [3, 6], [4, 5], [5, 6], [5, 7], [6, 7]];
    var ADJ = {}; Object.keys(P).forEach(function (v) { ADJ[v] = []; });
    E.forEach(function (e) { ADJ[e[0]].push(e[1]); ADJ[e[1]].push(e[0]); });
    Object.keys(ADJ).forEach(function (v) { ADJ[v].sort(function (a, b) { return a - b; }); });
    var B = bench(root, "Breadth-first and depth-first search", "Neighbors are taken in increasing order. Pick a search and a start vertex, then step.", "0 0 780 310", "An undirected graph with vertices 1 to 7 being searched");
    var alg = field(B.controls, "Search", select([["bfs", "BFS (queue)"], ["dfs", "DFS (stack)"], ["rdfs", "DFS (recursive)"]], "bfs"));
    var start = field(B.controls, "Start at", select(Object.keys(P).map(function (v) { return [v, v]; }), "1"));
    spacer(B.controls);
    var back = btn(B.controls, "← Back"), next = btn(B.controls, "Next step →", "primary"), play = btn(B.controls, "Play");
    var orderEl = tallyRow(B.tally, "Vertices visited");
    var svg = B.svg, frames = [], fi = 0, timer = null;
    function build() {
      frames = []; fi = 0;
      var s = +start.value, visited = [], seen = {};
      function snap(o) { frames.push(Object.assign({ visited: visited.slice(), seen: Object.assign({}, seen) }, o)); }
      if (alg.value === "bfs") {
        var q = [s]; seen[s] = true;
        snap({ cur: null, box: q.slice(), boxLabel: "Queue (front on the left)", text: "Put " + s + " in the queue and mark it discovered.", code: "queue = [" + s + "]" });
        while (q.length) {
          var v = q.shift(); visited.push(v); var added = [];
          ADJ[v].forEach(function (w) { if (!seen[w]) { seen[w] = true; q.push(w); added.push(w); } });
          snap({ cur: v, box: q.slice(), boxLabel: "Queue (front on the left)", fresh: added,
            text: "Dequeue and visit <b>" + v + "</b>. " + (added.length ? "Newly discovered neighbors go to the back of the queue: " + added.join(", ") + "." : "All its neighbors were already discovered."),
            code: "visit " + v + (added.length ? "; enqueue " + added.join(", ") : "") });
        }
      } else if (alg.value === "dfs") {
        var st = [s];
        snap({ cur: null, box: st.slice(), boxLabel: "Stack (top on the right)", text: "Push " + s + " onto the stack.", code: "stack = [" + s + "]" });
        while (st.length) {
          var u = st.pop();
          if (visited.indexOf(u) >= 0) { snap({ cur: u, skip: true, box: st.slice(), boxLabel: "Stack (top on the right)", text: "Pop " + u + ": already visited, so skip it.", code: "pop " + u + " (skip)" }); continue; }
          visited.push(u); seen[u] = true;
          ADJ[u].forEach(function (w) { st.push(w); });
          snap({ cur: u, box: st.slice(), boxLabel: "Stack (top on the right)", fresh: ADJ[u].slice(),
            text: "Pop and visit <b>" + u + "</b>, then push all its neighbors in order: " + ADJ[u].join(", ") + ". The last one pushed is popped next.", code: "visit " + u + "; push " + ADJ[u].join(", ") });
        }
      } else {
        var calls = [];
        snap({ cur: null, box: [], boxLabel: "Call stack (newest on the right)", text: "Call dfs(" + s + ").", code: "dfs(" + s + ")" });
        (function dfs(v) {
          calls.push(v);
          if (visited.indexOf(v) >= 0) { snap({ cur: v, skip: true, box: calls.slice(), boxLabel: "Call stack (newest on the right)", text: "dfs(" + v + "): " + v + " is already visited. Return.", code: "return" }); calls.pop(); return; }
          visited.push(v); seen[v] = true;
          snap({ cur: v, box: calls.slice(), boxLabel: "Call stack (newest on the right)", text: "dfs(" + v + "): visit <b>" + v + "</b>, then call dfs on each neighbor in order: " + ADJ[v].join(", ") + ".", code: "visit " + v });
          ADJ[v].forEach(function (w) { if (visited.indexOf(w) < 0) dfs(w); });
          calls.pop();
        })(s);
        snap({ cur: null, box: [], boxLabel: "Call stack (newest on the right)", text: "Every call has returned.", code: "" });
      }
      var f = frames[frames.length - 1];
      f.text += " <b>Visit order: " + f.visited.join(", ") + ".</b> Every vertex and edge was handled once: O(V + E).";
      show();
    }
    function show() {
      var f = frames[fi]; svg.textContent = "";
      var gE = el("g", {}, svg), gN = el("g", {}, svg), gR = el("g", {}, svg);
      E.forEach(function (e) { el("line", { class: "vz-edge", x1: P[e[0]][0], y1: P[e[0]][1], x2: P[e[1]][0], y2: P[e[1]][1] }, gE); });
      Object.keys(P).forEach(function (v) {
        v = +v; var cls = f.cur === v ? "cur" : f.visited.indexOf(v) >= 0 ? "done" : f.seen[v] ? "cmp" : "";
        gNodeDraw(gN, P[v][0], P[v][1], v, cls);
      });
      strip(gR, 430, 70, f.boxLabel, f.box);
      txt(gR, 430, 150, "Visit order", { class: "vz-cap" });
      txt(gR, 430, 176, f.visited.join(", ") || "(none yet)", { class: "vz-lbl" });
      txt(gR, 430, 230, "Key: blue ring = current, yellow ring = discovered (waiting),", { class: "vz-cap" });
      txt(gR, 430, 248, "green = visited", { class: "vz-cap" });
      B.say.innerHTML = f.text; B.code.textContent = f.code || ""; orderEl.textContent = f.visited.length;
      next.disabled = fi >= frames.length - 1; back.disabled = fi <= 0;
    }
    function stop() { clearInterval(timer); timer = null; play.textContent = "Play"; }
    next.addEventListener("click", function () { stop(); if (fi < frames.length - 1) { fi++; show(); } });
    back.addEventListener("click", function () { stop(); if (fi > 0) { fi--; show(); } });
    play.addEventListener("click", function () { if (timer) { stop(); return; } play.textContent = "Pause"; timer = setInterval(function () { if (fi >= frames.length - 1) { stop(); return; } fi++; show(); }, reduce ? 80 : 900); });
    alg.addEventListener("change", function () { stop(); build(); });
    start.addEventListener("change", function () { stop(); build(); });
    build();
  }

  /* ---------------- Dijkstra ---------------- */
  function dijkstra(root) {
    var P = { 1: [60, 150], 2: [200, 60], 3: [200, 240], 4: [350, 60], 5: [350, 240], 6: [470, 150] };
    var E = [[1, 2, 4], [1, 3, 1], [3, 2, 2], [2, 4, 5], [3, 4, 8], [3, 5, 3], [5, 4, 1], [4, 6, 2], [5, 6, 6]];
    var V = Object.keys(P).map(Number);
    var B = bench(root, "Dijkstra's shortest path, one relaxation at a time", "A directed graph with weights. Ties go to the lower-numbered vertex.", "0 0 780 300", "A weighted directed graph with vertices 1 to 6 and a distance table");
    var start = field(B.controls, "Start at", select(V.map(function (v) { return [String(v), String(v)]; }), "1"));
    var target = field(B.controls, "Show path to", select(V.map(function (v) { return [String(v), String(v)]; }), "6"));
    spacer(B.controls);
    var back = btn(B.controls, "← Back"), next = btn(B.controls, "Next step →", "primary"), play = btn(B.controls, "Play");
    var relaxEl = tallyRow(B.tally, "Edges relaxed");
    var svg = B.svg, mk = arrowMarker(svg, uid("dj"), "var(--viz-muted)"), mkH = arrowMarker(svg, uid("djh"), "var(--viz-accent)");
    var frames = [], fi = 0, timer = null;
    function fmtD(d) { return d === Infinity ? "∞" : String(d); }
    function build() {
      frames = []; fi = 0;
      var s = +start.value, dist = {}, pred = {}, unv = V.slice(), done = [], relaxed = 0;
      V.forEach(function (v) { dist[v] = Infinity; pred[v] = null; }); dist[s] = 0;
      function snap(o) { frames.push(Object.assign({ dist: Object.assign({}, dist), pred: Object.assign({}, pred), done: done.slice(), relaxed: relaxed }, o)); }
      snap({ text: "Every distance starts at ∞, except the start vertex " + s + ", at 0.", code: "dist[" + s + "] = 0" });
      while (unv.length) {
        unv.sort(function (a, b) { return dist[a] - dist[b] || a - b; });
        var c = unv.shift(); done.push(c);
        if (dist[c] === Infinity) { snap({ cur: c, text: "Remove " + c + ": its distance is ∞, so it can't be reached from " + s + ".", code: "" }); continue; }
        snap({ cur: c, text: "Remove the unvisited vertex with the smallest distance: <b>" + c + "</b> (" + dist[c] + "). Now relax its outgoing edges.", code: "current = " + c });
        E.filter(function (e) { return e[0] === c; }).forEach(function (e) {
          var nd = dist[c] + e[2], better = nd < dist[e[1]], old = dist[e[1]];
          relaxed += 1;
          if (better) { dist[e[1]] = nd; pred[e[1]] = c; }
          snap({ cur: c, edge: e, better: better, text: "Edge " + c + "→" + e[1] + " (weight " + e[2] + "): " + dist[c] + " + " + e[2] + " = " + nd + (better ? " beats " + fmtD(old) + ", so " + e[1] + "'s distance becomes " + nd + " and its predecessor " + c + "." : " doesn't beat " + fmtD(old) + ". No change."), code: "if " + dist[c] + " + " + e[2] + " < " + fmtD(old) + ": " + (better ? "update" : "keep") });
        });
      }
      snap({ final: true, text: "Every vertex is done. Follow the predecessors back from the target to read its shortest path. With the unsorted list zyBooks uses, that's O(V²).", code: "" });
      show();
    }
    function path(f, t) { var p = [], v = +t, guard = 0; if (f.dist[v] === Infinity) return []; while (v !== null && guard++ < 10) { p.unshift(v); v = f.pred[v]; } return p; }
    function show() {
      var f = frames[fi]; svg.textContent = "";
      svg.appendChild(svg.querySelector("defs") || el("defs", {})); arrowMarker(svg, mk.slice(5, -1), "var(--viz-muted)"); arrowMarker(svg, mkH.slice(5, -1), "var(--viz-accent)");
      var onPath = {}; if (f.final) { var pp = path(f, target.value); for (var i = 0; i + 1 < pp.length; i++) onPath[pp[i] + "-" + pp[i + 1]] = true; }
      var gE = el("g", {}, svg), gN = el("g", {}, svg), gT = el("g", {}, svg);
      E.forEach(function (e) {
        var a = P[e[0]], b = P[e[1]], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.sqrt(dx * dx + dy * dy), ux = dx / L, uy = dy / L;
        var hot = f.edge === e || onPath[e[0] + "-" + e[1]];
        el("line", { x1: a[0] + ux * 20, y1: a[1] + uy * 20, x2: b[0] - ux * 22, y2: b[1] - uy * 22, stroke: hot ? "var(--viz-accent)" : "var(--viz-muted)", "stroke-width": hot ? 3 : 1.6, "marker-end": hot ? mkH : mk }, gE);
        var mx = (a[0] + b[0]) / 2 - uy * 12, my = (a[1] + b[1]) / 2 + ux * 12;
        txt(gE, mx, my + 4, String(e[2]), { class: "vz-lbl", "text-anchor": "middle" });
      });
      V.forEach(function (v) { gNodeDraw(gN, P[v][0], P[v][1], v, f.cur === v ? "cur" : f.done.indexOf(v) >= 0 ? "done" : f.edge && f.edge[1] === v ? "cmp" : ""); });
      var x0 = 540; txt(gT, x0, 40, "Vertex", { class: "vz-cap" }); txt(gT, x0 + 70, 40, "Distance", { class: "vz-cap" }); txt(gT, x0 + 150, 40, "Pred.", { class: "vz-cap" });
      V.forEach(function (v, i) {
        var y = 70 + i * 34, g = el("g", { class: "vz-cell full" + (f.edge && f.edge[1] === v && f.better ? " new" : "") }, gT);
        el("rect", { x: x0 - 8, y: y - 20, width: 220, height: 30, rx: 5 }, g);
        txt(g, x0, y, String(v), { class: "v" }); txt(g, x0 + 70, y, fmtD(f.dist[v]), { class: "v" }); txt(g, x0 + 150, y, f.pred[v] === null ? "–" : String(f.pred[v]), { class: "v" });
      });
      if (f.final) { var p2 = path(f, target.value); txt(gT, x0, 292, p2.length ? "Path to " + target.value + ": " + p2.join(" → ") + " (" + f.dist[+target.value] + ")" : target.value + " can't be reached", { class: "vz-lbl" }); }
      B.say.innerHTML = f.text; B.code.textContent = f.code || ""; relaxEl.textContent = f.relaxed;
      next.disabled = fi >= frames.length - 1; back.disabled = fi <= 0;
    }
    function stop() { clearInterval(timer); timer = null; play.textContent = "Play"; }
    next.addEventListener("click", function () { stop(); if (fi < frames.length - 1) { fi++; show(); } });
    back.addEventListener("click", function () { stop(); if (fi > 0) { fi--; show(); } });
    play.addEventListener("click", function () { if (timer) { stop(); return; } play.textContent = "Pause"; timer = setInterval(function () { if (fi >= frames.length - 1) { stop(); return; } fi++; show(); }, reduce ? 80 : 1000); });
    start.addEventListener("change", function () { stop(); build(); });
    target.addEventListener("change", function () { show(); });
    build();
  }

  /* ---------------- 2-3-4 tree ---------------- */
  function btree(root) {
    var B = bench(root, "2-3-4 tree: insert with preemptive split", "New keys are random. Full nodes on the way down split before the insert moves past them.", "0 0 780 260", "A 2-3-4 tree");
    var ins = btn(B.controls, "Insert a random key", "primary");
    var keySel = field(B.controls, "Key", select([], ""));
    var find = btn(B.controls, "Search");
    spacer(B.controls);
    var reset = btn(B.controls, "Reset");
    var splitsEl = tallyRow(B.tally, "Splits on the last insert");
    var hEl = h("span", { class: "viz-lbl" }, B.tally, "");
    var svg = B.svg, tree, busy = false;
    function leaf(keys) { return { keys: keys.slice(), kids: [] }; }
    function clone(n) { return { keys: n.keys.slice(), kids: n.kids.map(clone) }; }
    function allKeys(n, out) { if (!n.kids.length) { out.push.apply(out, n.keys); return out; } n.keys.forEach(function (k, i) { allKeys(n.kids[i], out); out.push(k); }); allKeys(n.kids[n.kids.length - 1], out); return out; }
    function height(n) { return n.kids.length ? 1 + height(n.kids[0]) : 0; }
    function draw(t, hl, hlKey) {
      svg.textContent = "";
      var levels = [];
      (function walk(n, d) { (levels[d] = levels[d] || []).push(n); n.kids.forEach(function (c) { walk(c, d + 1); }); })(t, 0);
      var pos = new Map(), NW = function (n) { return 22 + n.keys.length * 30; };
      var leaves = levels[levels.length - 1], totalW = leaves.reduce(function (a, n) { return a + NW(n) + 18; }, -18), x = 390 - totalW / 2;
      leaves.forEach(function (n) { pos.set(n, { x: x + NW(n) / 2, y: 30 + (levels.length - 1) * 70 }); x += NW(n) + 18; });
      for (var d = levels.length - 2; d >= 0; d--) levels[d].forEach(function (n) { var a = pos.get(n.kids[0]), b = pos.get(n.kids[n.kids.length - 1]); pos.set(n, { x: (a.x + b.x) / 2, y: 30 + d * 70 }); });
      var gE = el("g", {}, svg), gN = el("g", {}, svg);
      levels.forEach(function (lv) { lv.forEach(function (n) {
        var p = pos.get(n), w = NW(n);
        n.kids.forEach(function (c, i) { var q = pos.get(c); el("line", { class: "vz-edge", x1: p.x - w / 2 + 11 + i * 30, y1: p.y + 14, x2: q.x, y2: q.y - 14 }, gE); });
        var g = el("g", { class: "vz-cell full" + (hl === n ? " cur" : "") }, gN);
        el("rect", { x: p.x - w / 2, y: p.y - 15, width: w, height: 30, rx: 6 }, g);
        n.keys.forEach(function (k, i) { txt(g, p.x - w / 2 + 26 + i * 30, p.y + 6, String(k), { class: "v", "text-anchor": "middle", "font-weight": k === hlKey ? 700 : 600, fill: k === hlKey ? "var(--viz-accent)" : "var(--viz-ink)" }); });
      }); });
      var ks = allKeys(tree, []); keySel.textContent = ""; ks.forEach(function (k) { var o = document.createElement("option"); o.value = k; o.textContent = k; keySel.appendChild(o); });
      hEl.textContent = ks.length + " keys · height " + height(tree);
    }
    function say(t, c) { B.say.innerHTML = t; B.code.textContent = c || ""; }
    function splitChild(parent, i) {
      var c = parent.kids[i], mid = c.keys[1], L = { keys: [c.keys[0]], kids: c.kids.slice(0, 2) }, R = { keys: [c.keys[2]], kids: c.kids.slice(2) };
      parent.keys.splice(i, 0, mid); parent.kids.splice(i, 1, L, R); return mid;
    }
    async function insert() {
      if (busy) return;
      var ks = allKeys(tree, []);
      if (ks.length >= 18 || height(tree) >= 3) { say("This diagram holds 18 keys and 4 levels at most. Press Reset."); return; }
      busy = true; var splits = 0; splitsEl.textContent = 0;
      var have = {}; ks.forEach(function (k) { have[k] = true; }); var k; do { k = 1 + Math.floor(Math.random() * 98); } while (have[k]);
      if (tree.keys.length === 3) {
        var mid = tree.keys[1]; draw(tree, tree); say("Insert <b>" + k + "</b>. The root is full, so split it first: " + mid + " becomes a new root, and the tree grows one level.", "split root"); await sleep(1200);
        tree = { keys: [], kids: [tree] }; splitChild(tree, 0); splits++; splitsEl.textContent = splits; draw(tree, tree); await sleep(1000);
      }
      var n = tree;
      while (n.kids.length) {
        var i = 0; while (i < n.keys.length && k > n.keys[i]) i++;
        draw(tree, n); say("At [" + n.keys.join(" ") + "]: " + k + " goes to child " + i + ".", "next_node: child " + i); await sleep(900);
        if (n.kids[i].keys.length === 3) {
          var m = n.kids[i].keys[1]; draw(tree, n.kids[i]); say("That child [" + n.kids[i].keys.join(" ") + "] is full: split it. " + m + " moves up into this node.", "split child " + i); await sleep(1100);
          splitChild(n, i); splits++; splitsEl.textContent = splits; draw(tree, n); await sleep(900);
          i = 0; while (i < n.keys.length && k > n.keys[i]) i++;
        }
        n = n.kids[i];
      }
      n.keys.push(k); n.keys.sort(function (a, b) { return a - b; });
      draw(tree, n, k);
      say("The leaf has room: <b>" + k + "</b> goes in, in sorted order. " + (splits ? splits + " split" + (splits === 1 ? "" : "s") + " on the way down." : "No splits were needed.") + " All leaves stay at the same depth.", "leaf.insert(" + k + ")");
      busy = false;
    }
    async function search() {
      if (busy || !keySel.value) return; busy = true;
      var k = +keySel.value, n = tree, steps = 0;
      for (;;) {
        steps++; var i = 0; while (i < n.keys.length && k > n.keys[i]) i++;
        if (n.keys[i] === k) { draw(tree, n, k); say("Found <b>" + k + "</b> after visiting " + steps + " node" + (steps === 1 ? "" : "s") + ". A 2-3-4 tree's height is O(log n), so search is O(log n).", "found"); break; }
        draw(tree, n); say("At [" + n.keys.join(" ") + "]: " + k + " is " + (i === 0 ? "smaller than " + n.keys[0] : i === n.keys.length ? "larger than " + n.keys[i - 1] : "between " + n.keys[i - 1] + " and " + n.keys[i]) + ", so go to child " + i + ".", "child " + i);
        await sleep(900); n = n.kids[i];
      }
      busy = false;
    }
    function start() { tree = { keys: [25, 50], kids: [leaf([8, 14]), leaf([33]), leaf([61, 77, 90])] }; draw(tree); say("Each node holds 1 to 3 keys and has one more child than keys. Press Insert to add a random key; the right leaf is already full."); splitsEl.textContent = 0; }
    ins.addEventListener("click", insert); find.addEventListener("click", search);
    reset.addEventListener("click", function () { if (!busy) start(); });
    start();
  }

  /* ---------------- chapter cards ---------------- */
  var GLYPHS = {
    "01": function (s) { var P = [[110, 14], [60, 44], [160, 44], [130, 74], [190, 74]]; [[0, 1], [0, 2], [2, 3], [2, 4]].forEach(function (e) { line(s, P[e[0]][0], P[e[0]][1], P[e[1]][0], P[e[1]][1]); }); ["11", "S", "7", "M", "P"].forEach(function (v, i) { node(s, P[i][0], P[i][1], v); }); txt(s, 78, 26, "0", { class: "acc", "font-size": 11 }); txt(s, 140, 26, "1", { class: "acc", "font-size": 11 }); },
    "02": function (s, m) { [4, 7, 1].forEach(function (v, i) { box(s, 12 + i * 70, 26, 44, 30, v); el("line", { x1: 56 + i * 70, y1: 41, x2: 80 + i * 70, y2: 41, stroke: "var(--viz-ink)", "stroke-width": 1.5, "marker-end": m }, s); }); },
    "03": function (s, m) { ["D", "C", "B", "A"].forEach(function (v, i) { box(s, 40, 4 + i * 18, 56, 16, v, 11); }); el("line", { x1: 140, y1: 12, x2: 100, y2: 12, stroke: "var(--viz-accent)", "stroke-width": 1.5, "marker-end": m }, s); txt(s, 146, 16, "top", { class: "acc", "font-size": 12 }); },
    "04": function (s) { [null, 5, 18, 31, null, 9, null].forEach(function (v, i) { box(s, 8 + i * 30, 28, 26, 26, v === null ? "" : v, 10); }); el("path", { d: "M50 62 C 60 74, 72 74, 80 62", fill: "none", stroke: "var(--viz-accent)", "stroke-width": 1.5 }, s); el("path", { d: "M80 62 C 90 74, 102 74, 110 62", fill: "none", stroke: "var(--viz-accent)", "stroke-width": 1.5 }, s); },
    "05": function (s) { var P = [[110, 14], [60, 44], [160, 44], [35, 74], [85, 74], [185, 74]]; [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5]].forEach(function (e) { line(s, P[e[0]][0], P[e[0]][1], P[e[1]][0], P[e[1]][1]); }); [40, 20, 60, 10, 30, 70].forEach(function (v, i) { node(s, P[i][0], P[i][1], v); }); },
    "06": function (s) { var P = [[110, 14], [60, 44], [160, 44], [35, 74]]; [[0, 1], [0, 2], [1, 3]].forEach(function (e) { line(s, P[e[0]][0], P[e[0]][1], P[e[1]][0], P[e[1]][1]); }); [20, 10, 30, 5].forEach(function (v, i) { node(s, P[i][0], P[i][1], v); }); el("path", { d: "M150 18 A 40 30 0 0 1 172 54", fill: "none", stroke: "var(--viz-accent)", "stroke-width": 1.5 }, s); },
    "08": function (s) { el("circle", { cx: 90, cy: 44, r: 30, fill: "var(--viz-accent)", opacity: .2, stroke: "var(--viz-ink)", "stroke-width": 1.5 }, s); el("circle", { cx: 130, cy: 44, r: 30, fill: "var(--viz-accent)", opacity: .2, stroke: "var(--viz-ink)", "stroke-width": 1.5 }, s); txt(s, 110, 48, "∩", { class: "tx", "text-anchor": "middle", "font-size": 13 }); },
    "07": function (s) { var P = [[110, 14], [60, 44], [160, 44], [35, 74], [85, 74]]; [[0, 1], [0, 2], [1, 3], [1, 4]].forEach(function (e) { line(s, P[e[0]][0], P[e[0]][1], P[e[1]][0], P[e[1]][1]); }); [50, 30, 40, 10, 20].forEach(function (v, i) { node(s, P[i][0], P[i][1], v); }); },
    "09": function (s) { var P = [[30, 20], [100, 14], [180, 30], [60, 70], [150, 72]]; [[0, 1], [1, 2], [0, 3], [3, 4], [1, 4], [2, 4]].forEach(function (e) { line(s, P[e[0]][0], P[e[0]][1], P[e[1]][0], P[e[1]][1]); }); "ABCDE".split("").forEach(function (v, i) { node(s, P[i][0], P[i][1], v); }); },
    "10": function (s) { box(s, 80, 8, 60, 22, "20 40", 11); box(s, 14, 52, 50, 22, "5 12", 11); box(s, 85, 52, 50, 22, "25 31", 11); box(s, 156, 52, 50, 22, "47 60", 11); line(s, 90, 30, 39, 52); line(s, 110, 30, 110, 52); line(s, 130, 30, 181, 52); },
    "11": function (s) { [["1", 2], ["2", 4], ["3", 10], ["4", 20], ["5", 40], ["6", 70]].forEach(function (b, i) { el("rect", { x: 30 + i * 28, y: 78 - b[1], width: 18, height: b[1], rx: 2, fill: "var(--viz-c" + b[0] + ")" }, s); }); line(s, 24, 78, 200, 78); },
    "12": function (s) { txt(s, 20, 30, "for i in range(n):", { class: "tx", "font-size": 12 }); txt(s, 40, 50, "if x > m:", { class: "tx", "font-size": 12 }); txt(s, 60, 70, "m = x", { class: "tx", "font-size": 12 }); },
    "21": function (s) { var P = [[110, 14], [60, 44], [160, 44], [35, 74], [85, 74]]; [[0, 1], [0, 2], [1, 3], [1, 4]].forEach(function (e) { line(s, P[e[0]][0], P[e[0]][1], P[e[1]][0], P[e[1]][1]); }); ["f(4)", "f(3)", "f(2)", "f(2)", "f(1)"].forEach(function (v, i) { node(s, P[i][0], P[i][1], v, 15, 9); }); }
  };
  /* Topic page number -> the glyph that pictures it (pages follow the course study guide's competencies). */
  var PAGE_GLYPH = { "01": "21", "02": "11", "03": "11", "04": "11", "05": "03", "06": "02", "07": "04", "08": "05", "09": "09", "10": "12", "11": "08" };
  function chapterMap(root) {
    var items = Array.prototype.slice.call(root.querySelectorAll("li")).map(function (li) {
      var a = li.querySelector("a"); if (!a) return null;
      var full = li.textContent.replace(a.textContent, "").replace(/^\s*:\s*/, "").trim();
      return { href: a.getAttribute("href"), title: a.textContent.trim(), sub: full };
    }).filter(Boolean);
    if (!items.length) return;
    var grid = h("div", { class: "viz-cards" });
    items.forEach(function (it) {
      var m = /(\d\d)-[^/]*\/?$/.exec(it.href.replace(/\/$/, "")), key = m ? (PAGE_GLYPH[m[1]] || m[1]) : "";
      var title = it.title.replace(/^[\d–-]+\.\s*/, ""), num = (/^([\d–-]+)\./.exec(it.title) || [, ""])[1];
      var a = h("a", { class: "viz-card", href: it.href }, grid);
      h("span", { class: "num" }, a, num ? "Page " + num : "");
      var svg = el("svg", { viewBox: "0 0 220 86", "aria-hidden": "true", focusable: "false" }, a);
      var g = el("g", { class: "vz-static" }, svg), mk = arrowMarker(svg, uid("cm"), "var(--viz-ink)");
      (GLYPHS[key] || GLYPHS["12"])(g, mk);
      h("span", { class: "ttl" }, a, title.charAt(0).toUpperCase() + title.slice(1));
      h("span", { class: "sub" }, a, it.sub);
    });
    root.textContent = "";
    root.appendChild(grid);
  }

  var BUILDERS = {
    "linked-list": linkedList, "stack-queue": stackQueue, "hash-probe": hashProbe, heap: heap, sort: sort,
    "loop-grid": loopGrid, "growth-chart": growthChart, "cost-spectrum": costSpectrum, "chapter-map": chapterMap,
    allocation: allocation, huffman: huffman, "tree-shapes": treeShapes,
    bst: bst, avl: avl, "rb-tree": rbTree, treap: treap, "set-ops": setOps,
    "graph-search": graphSearch, dijkstra: dijkstra, btree: btree
  };
  document.querySelectorAll(".viz[data-viz]").forEach(function (root) {
    var f = BUILDERS[root.getAttribute("data-viz")];
    if (!f) return;
    try { f(root); } catch (e) { if (window.console) console.error("viz " + root.getAttribute("data-viz"), e); }
  });
  chips();
})();
