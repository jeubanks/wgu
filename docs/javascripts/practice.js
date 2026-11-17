/* Random practice quiz for C949 (styles in viz.css, "Practice quiz").
   The page holds <div id="c949-quiz">; its Markdown content is what GitHub shows.
   Each quiz draws 10 questions from the generators below, filtered by the topic
   checkboxes. Every question is built from random values, so there's nothing to
   memorize: check an answer, read why, and start a new quiz to get new numbers.
   Conventions match the chapter pages (binary search mid = (low + high) // 2,
   max-heap root at index 0, BST duplicates go right, neighbors in alphabetical
   order, linear probing (h + i) % m). */
(function () {
  "use strict";
  var host = document.getElementById("c949-quiz");
  if (!host) return;

  /* ---------- helpers ---------- */
  function rnd(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function distinct(n, lo, hi) { var s = {}, out = []; while (out.length < n) { var v = rnd(lo, hi); if (!s[v]) { s[v] = true; out.push(v); } } return out; }
  function h(tag, attrs, parent, text) { var n = document.createElement(tag); Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); }); if (text !== undefined) n.textContent = text; if (parent) parent.appendChild(n); return n; }
  function norm(s) { return String(s).toLowerCase().replace(/[\[\]()]/g, "").split(/[\s,]+/).filter(Boolean).join(","); }
  function list(a) { return a.join(", "); }

  var CLASSES = ["O(1)", "O(log n)", "O(√n)", "O(n)", "O(n log n)", "O(n²)", "O(n³)", "O(2ⁿ)"];

  /* ---------- generators: each returns {topic, prompt, code?, kind, answer, options?, why} ---------- */
  var GEN = {};

  GEN.bigOSnippet = { topic: "bigo", make: function () {
    var K = rnd(2, 9), v = pick(["i", "k", "x"]), w = pick(["j", "m", "y"]);
    var T = [
      ["for " + v + " in range(n):\n    for " + w + " in range(" + K + "):\n        total += 1", "O(n)", "The inner loop runs " + K + " times whatever n is, so it's a constant factor: " + K + "n is O(n)."],
      ["for " + v + " in range(n):\n    for " + w + " in range(n):\n        total += 1", "O(n²)", "Nested loops over n multiply: n × n."],
      ["for " + v + " in range(n):\n    for " + w + " in range(" + v + "):\n        total += 1", "O(n²)", "The inner loop runs 0 + 1 + ... + (n − 1) = n(n − 1)/2 times in total: still O(n²)."],
      [v + " = n\nwhile " + v + " > 1:\n    " + v + " = " + v + " // " + K + "\n    total += 1", "O(log n)", "Dividing by a constant each pass means about log n passes."],
      [v + " = 1\nwhile " + v + " < n:\n    " + v + " = " + v + " * " + K + "\n    total += 1", "O(log n)", "Multiplying by a constant each pass reaches n after about log n passes."],
      ["for " + v + " in range(n):\n    " + w + " = 1\n    while " + w + " < n:\n        " + w + " = " + w + " * 2", "O(n log n)", "A halving/doubling loop (log n) inside a loop over n."],
      ["for " + v + " in range(n):\n    total += 1\nfor " + w + " in range(n):\n    total += 1", "O(n)", "Loops one after the other add: n + n = 2n, which is O(n)."],
      ["for " + v + " in range(" + (K * 100) + "):\n    total += 1", "O(1)", "The loop's bound doesn't depend on n: it always runs " + (K * 100) + " times."],
      ["for " + v + " in range(n):\n    for " + w + " in range(n):\n        for z in range(n):\n            total += 1", "O(n³)", "Three nested loops over n: n × n × n."],
      [v + " = 1\nwhile " + v + " * " + v + " <= n:\n    " + v + " += 1", "O(√n)", "The loop stops once " + v + "² passes n, so it runs about √n times."],
      ["def f(n):\n    if n <= 1:\n        return 1\n    return f(n - 1) + f(n - 1)", "O(2ⁿ)", "Two calls on n − 1: the number of calls doubles each level."],
      ["def f(n):\n    if n <= 1:\n        return 0\n    return f(n // " + K + ") + 1", "O(log n)", "One call on n // " + K + ": the calls divide n down to 1."],
      ["def f(n):\n    if n == 0:\n        return 0\n    return n + f(n - 1)", "O(n)", "One call on n − 1, with O(1) work each: n calls."],
      ["for x in items:          # n items\n    if x in other:       # other is a list of n items\n        count += 1", "O(n²)", "`x in other` searches a list: a hidden O(n) loop inside a loop over n."]
    ];
    var t = pick(T);
    return { prompt: "What is the Big-O of this code, in terms of n?", code: t[0], kind: "choice", options: CLASSES, answer: t[1], why: t[2] };
  } };

  GEN.bigOFact = { topic: "bigo", make: function () {
    var F = [
      ["Search a balanced BST of n keys", "O(log n)", "Each step goes down one level, and a balanced tree has about log n levels."],
      ["Search an unbalanced BST (keys inserted in sorted order), worst case", "O(n)", "The tree is a chain, so a search may visit every node."],
      ["Remove the max from a max-heap", "O(log n)", "The last item moves to the root and percolates down one level per swap."],
      ["Build a max-heap from n items with heapify", "O(n)", "Most nodes sit near the bottom and barely move, so the total is O(n)."],
      ["Look up a key in a hash table, average case", "O(1)", "The hash function computes the bucket directly."],
      ["Look up a key in a hash table, worst case", "O(n)", "If every key collides, the search scans them all."],
      ["Remove the last node of a singly-linked list with a tail pointer", "O(n)", "You need the node before the tail, which means walking from the head."],
      ["Prepend to an array-based list", "O(n)", "Every item shifts one place right."],
      ["Dequeue from a circular-array queue", "O(1)", "Only the front index and length change."],
      ["Merge sort, worst case", "O(n log n)", "log n levels of splitting, n work to merge on each level."],
      ["Quicksort, worst case", "O(n²)", "Every pivot is the smallest or largest value, so each partition only peels off one item."],
      ["Insertion sort on an already sorted list", "O(n)", "Each item is compared once and doesn't move."],
      ["Selection sort on an already sorted list", "O(n²)", "It still scans the whole unsorted part on every pass."],
      ["BFS on a graph with V vertices and E edges", "O(V + E)", "Each vertex is enqueued once and each adjacency list is scanned once."],
      ["Binary search on a sorted list, worst case", "O(log n)", "Each comparison halves the range."],
      ["Search a 2-3-4 tree of n keys", "O(log n)", "All leaves are at the same depth, and the height is O(log n)."]
    ];
    var f = pick(F), opts = ["O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n²)", "O(V + E)"];
    return { prompt: "What does this cost? " + f[0] + ".", kind: "choice", options: opts, answer: f[1], why: f[2] };
  } };

  GEN.binarySearch = { topic: "sort", make: function () {
    var n = rnd(9, 15), a = distinct(n, 1, 99).sort(function (x, y) { return x - y; });
    var present = Math.random() < 0.6, key;
    if (present) key = pick(a); else { do { key = rnd(1, 99); } while (a.indexOf(key) >= 0); }
    var lo = 0, hi = n - 1, mids = [], steps = [];
    while (lo <= hi) { var mid = Math.floor((lo + hi) / 2); mids.push(a[mid]); steps.push("low " + lo + ", high " + hi + ": mid " + mid + " holds " + a[mid]); if (a[mid] === key) break; if (a[mid] < key) lo = mid + 1; else hi = mid - 1; }
    return { prompt: "Binary search this sorted list for " + key + ", with mid = (low + high) // 2. Which values does items[mid] take, in order? Separate them with commas.", code: "index  " + a.map(function (_, i) { return String(i).padStart(3); }).join("") + "\nitems  " + a.map(function (v) { return String(v).padStart(3); }).join(""), kind: "text", answer: list(mids), why: steps.join(". ") + "." + (present ? "" : " low passes high: " + key + " isn't in the list.") };
  } };

  function heapInsert(a, x) { a = a.concat([x]); var i = a.length - 1, sw = 0; while (i > 0 && a[(i - 1) >> 1] < a[i]) { var p = (i - 1) >> 1, t = a[p]; a[p] = a[i]; a[i] = t; i = p; sw++; } return { a: a, sw: sw }; }
  GEN.heapInsert = { topic: "trees", make: function () {
    var vals = distinct(7, 5, 95), heap = [];
    vals.slice(0, 6).forEach(function (v) { heap = heapInsert(heap, v).a; });
    var x = vals[6], r = heapInsert(heap, x);
    return { prompt: "Insert " + x + " into this max-heap (root at index 0). What is the array afterward? Separate the values with spaces.", code: heap.join("  "), kind: "text", answer: r.a.join(" "), why: x + " goes in at index " + heap.length + ", then swaps with its parent while it's larger: " + r.sw + " swap" + (r.sw === 1 ? "" : "s") + "." };
  } };

  GEN.heapRemove = { topic: "trees", make: function () {
    var heap = []; distinct(7, 5, 95).forEach(function (v) { heap = heapInsert(heap, v).a; });
    var a = heap.slice(), top = a[0]; a[0] = a.pop(); var i = 0;
    for (;;) { var l = 2 * i + 1, r = 2 * i + 2, b = i; if (l < a.length && a[l] > a[b]) b = l; if (r < a.length && a[r] > a[b]) b = r; if (b === i) break; var t = a[i]; a[i] = a[b]; a[b] = t; i = b; }
    return { prompt: "Remove the max from this max-heap (root at index 0). What is the array afterward? Separate the values with spaces.", code: heap.join("  "), kind: "text", answer: a.join(" "), why: top + " is removed. The last value moves to the root and swaps with its larger child until both children are smaller." };
  } };

  function bstBuild(keys) { var root = null; keys.forEach(function (k) { var n = { k: k, l: null, r: null }; if (!root) { root = n; return; } var c = root; for (;;) { if (k < c.k) { if (!c.l) { c.l = n; return; } c = c.l; } else { if (!c.r) { c.r = n; return; } c = c.r; } } }); return root; }
  function pre(n) { return n ? [n.k].concat(pre(n.l), pre(n.r)) : []; }
  function post(n) { return n ? post(n.l).concat(post(n.r), [n.k]) : []; }
  function lvl(n) { var o = [], q = [n]; while (q.length) { var x = q.shift(); o.push(x.k); if (x.l) q.push(x.l); if (x.r) q.push(x.r); } return o; }
  function height(n) { return n ? 1 + Math.max(height(n.l), height(n.r)) : -1; }
  GEN.bst = { topic: "trees", make: function () {
    var keys = distinct(rnd(7, 9), 1, 99), t = bstBuild(keys), which = pick(["preorder", "postorder", "level-order", "height"]);
    var ans = which === "preorder" ? list(pre(t)) : which === "postorder" ? list(post(t)) : which === "level-order" ? list(lvl(t)) : String(height(t));
    return { prompt: "Insert these keys, in order, into an empty BST. " + (which === "height" ? "What is the tree's height (edges on the longest root-to-leaf path)?" : "What is its " + which + " traversal? Separate the keys with commas."), code: list(keys), kind: "text", answer: ans, why: which === "height" ? "Draw the tree: its deepest leaf is " + ans + " edges below the root." : which.charAt(0).toUpperCase() + which.slice(1) + ": " + { preorder: "node, left, right", postorder: "left, right, node", "level-order": "level by level, left to right" }[which] + "." };
  } };

  GEN.probe = { topic: "lists", make: function () {
    var m = pick([7, 10, 11, 13]), home = rnd(0, m - 1), keys = [], used = {};
    function addKey(k) { if (used[k]) return false; used[k] = true; keys.push(k); return true; }
    while (keys.length < 4) addKey(home + m * rnd(1, 8));
    while (keys.length < 5) addKey(rnd(1, 99));
    keys = shuffle(keys);
    var table = Array(m).fill(null), slot = -1, steps = [];
    keys.forEach(function (k, idx) { var h0 = k % m; for (var j = 0; j < m; j++) { var s = (h0 + j) % m; if (table[s] === null) { table[s] = k; if (idx === keys.length - 1) { slot = s; steps.push(k + " % " + m + " = " + h0 + ", lands in " + s); } return; } } });
    return { prompt: "A table with " + m + " buckets uses h = key % " + m + " and linear probing. Insert these keys in order. Which bucket does the last key, " + keys[keys.length - 1] + ", land in?", code: list(keys), kind: "text", answer: String(slot), why: "Each key tries its home bucket, then the next ones, wrapping around. " + steps.join("") + "." };
  } };

  GEN.sortPass = { topic: "sort", make: function () {
    var a = distinct(6, 1, 60), alg = pick(["selection", "insertion", "bubble"]), b = a.slice(), why;
    if (alg === "selection") { var s = 0; for (var j = 1; j < b.length; j++) if (b[j] < b[s]) s = j; var t = b[0]; b[0] = b[s]; b[s] = t; why = "Selection sort swaps the smallest value, " + b[0] + ", into position 0."; }
    else if (alg === "insertion") { var k = 1; while (k > 0 && b[k] < b[k - 1]) { var t2 = b[k]; b[k] = b[k - 1]; b[k - 1] = t2; k--; } why = "Insertion sort's first pass takes the item at index 1 and shifts it left past any larger item."; }
    else { for (var i = 0; i < b.length - 1; i++) if (b[i] > b[i + 1]) { var t3 = b[i]; b[i] = b[i + 1]; b[i + 1] = t3; } why = "Bubble sort swaps each out-of-order neighbor pair, left to right, so the largest value ends up last."; }
    return { prompt: "What is this list after the first pass of " + alg + " sort? Separate the values with spaces.", code: a.join("  "), kind: "text", answer: b.join(" "), why: why };
  } };

  GEN.radix = { topic: "sort", make: function () {
    var a = distinct(6, 1, 999), b = []; for (var d = 0; d < 10; d++) a.forEach(function (x) { if (x % 10 === d) b.push(x); });
    return { prompt: "What is this list after radix sort's first pass (by the ones digit)? Separate the values with spaces.", code: a.join("  "), kind: "text", answer: b.join(" "), why: "Put each number in bucket 0 to 9 by its last digit, keeping their order within a bucket, then read the buckets in order." };
  } };

  GEN.stackQueue = { topic: "lists", make: function () {
    var isStack = Math.random() < 0.5, items = [], ops = [], out = [], next = 1;
    for (var i = 0; i < 7; i++) {
      if (items.length && Math.random() < 0.4) { ops.push(isStack ? "Pop()" : "Dequeue()"); out.push(isStack ? items.pop() : items.shift()); }
      else { var v = next * rnd(2, 9); next++; items.push(v); ops.push((isStack ? "Push(" : "Enqueue(") + v + ")"); }
    }
    while (out.length < 2 && items.length) { ops.push(isStack ? "Pop()" : "Dequeue()"); out.push(isStack ? items.pop() : items.shift()); }
    return { prompt: "Starting with an empty " + (isStack ? "stack" : "queue") + ", run these operations. What do the " + (isStack ? "Pops" : "Dequeues") + " return, in order? Separate the values with commas.", code: ops.join("\n"), kind: "text", answer: list(out), why: isStack ? "A stack is last in, first out: each Pop returns the most recent Push still on it." : "A queue is first in, first out: each Dequeue returns the oldest item still in it." };
  } };

  GEN.graph = { topic: "graphs", make: function () {
    var V = "ABCDEF".split(""), E = {}, adj = {};
    V.forEach(function (v) { adj[v] = []; });
    function add(a, b) { var k = a < b ? a + b : b + a; if (a === b || E[k]) return; E[k] = true; adj[a].push(b); adj[b].push(a); }
    for (var i = 1; i < V.length; i++) add(V[i], V[rnd(0, i - 1)]);
    for (var e = 0; e < 3; e++) add(pick(V), pick(V));
    V.forEach(function (v) { adj[v].sort(); });
    var which = pick(["BFS", "recursive DFS"]), order = [], seen = {};
    if (which === "BFS") { var q = ["A"]; seen.A = true; while (q.length) { var x = q.shift(); order.push(x); adj[x].forEach(function (y) { if (!seen[y]) { seen[y] = true; q.push(y); } }); } }
    else (function dfs(x) { if (seen[x]) return; seen[x] = true; order.push(x); adj[x].forEach(dfs); })("A");
    return { prompt: "Run " + which + " from A on this undirected graph. Adjacency lists are in alphabetical order. What is the visit order? Separate the vertices with commas.", code: V.map(function (v) { return v + ": " + adj[v].join(", "); }).join("\n"), kind: "text", answer: list(order), why: which === "BFS" ? "BFS uses a queue: visit A, then its neighbors in order, then theirs." : "Recursive DFS visits a vertex, then calls itself on each unvisited neighbor in list order before moving on." };
  } };

  GEN.recursion = { topic: "recursion", make: function () {
    var k = pick([1, 2, 3]), base = rnd(0, 3), N = rnd(5, 9), op = pick(["+", "*"]);
    if (op === "*") { N = rnd(3, 5); base = Math.max(1, base); }
    function f(n) { if (n <= 0) return base; return op === "+" ? n + f(n - k) : n * f(n - k); }
    var calls = [], n = N; while (n > 0) { calls.push(n); n -= k; }
    return { prompt: "What does f(" + N + ") return?", code: "def f(n):\n    if n <= 0:\n        return " + base + "\n    return n " + op + " f(n - " + k + ")", kind: "text", answer: String(f(N)), why: "Expand the calls: " + calls.join(" " + op + " ") + " " + op + " " + base + " (the base case) = " + f(N) + "." };
  } };

  var TOPICS = [["bigo", "Big-O"], ["sort", "Searching and sorting"], ["lists", "Lists, stacks, queues, hashing"], ["trees", "Trees and heaps"], ["graphs", "Graphs"], ["recursion", "Recursion"]];

  /* ---------- UI ---------- */
  host.textContent = "";
  var box = h("div", { class: "pq" }, host);
  var top = h("div", { class: "pq-top" }, box);
  var fs = h("fieldset", { class: "pq-topics" }, top);
  h("legend", {}, fs, "Topics");
  var checks = {};
  TOPICS.forEach(function (t) { var id = "pq-t-" + t[0]; var l = h("label", { for: id }, fs); var c = h("input", { type: "checkbox", id: id }, l); c.checked = true; l.appendChild(document.createTextNode(" " + t[1])); checks[t[0]] = c; });
  var startBtn = h("button", { type: "button", class: "pq-btn primary" }, top, "Start a new quiz");
  var score = h("p", { class: "pq-score", "aria-live": "polite" }, box, "");
  var listEl = h("ol", { class: "pq-list" }, box);
  var right = 0, answered = 0, total = 0;

  function updateScore() {
    score.textContent = answered < total ? right + " right out of " + answered + " answered (" + total + " questions)" : "Done: " + right + " out of " + total + " right. Start a new quiz for new questions.";
  }
  function render(q, i) {
    var li = h("li", { class: "pq-q" }, listEl);
    h("p", { class: "pq-prompt" }, li, q.prompt);
    if (q.code) { var pre = h("pre", { class: "pq-code" }, li); h("code", {}, pre, q.code); }
    var fb = h("div", { class: "pq-feedback", "aria-live": "polite" });
    var done = false;
    function finish(ok, given) {
      if (done) return; done = true; answered++; if (ok) right++;
      li.classList.add(ok ? "is-right" : "is-wrong");
      fb.innerHTML = "";
      h("p", { class: "pq-verdict" }, fb, ok ? "Right." : "Not quite. The answer is " + q.answer + ".");
      h("p", { class: "pq-why" }, fb, q.why);
      updateScore();
    }
    if (q.kind === "choice") {
      var row = h("div", { class: "pq-options", role: "group", "aria-label": "Answer choices for question " + (i + 1) }, li);
      q.options.forEach(function (o) {
        var b = h("button", { type: "button", class: "pq-opt" }, row, o);
        b.addEventListener("click", function () { if (done) return; b.classList.add(o === q.answer ? "pq-opt-right" : "pq-opt-wrong"); if (o !== q.answer) Array.prototype.forEach.call(row.children, function (x) { if (x.textContent === q.answer) x.classList.add("pq-opt-right"); }); Array.prototype.forEach.call(row.children, function (x) { x.disabled = true; }); finish(o === q.answer); });
      });
    } else {
      var id = "pq-a-" + i, f = h("div", { class: "pq-answer" }, li);
      h("label", { for: id }, f, "Your answer");
      var inp = h("input", { type: "text", id: id, autocomplete: "off", spellcheck: "false" }, f);
      var chk = h("button", { type: "button", class: "pq-btn" }, f, "Check");
      function go() { if (done || !inp.value.trim()) return; inp.disabled = true; chk.disabled = true; finish(norm(inp.value) === norm(q.answer)); }
      chk.addEventListener("click", go);
      inp.addEventListener("keydown", function (e) { if (e.key === "Enter") go(); });
    }
    li.appendChild(fb);
  }
  function newQuiz() {
    var gens = Object.keys(GEN).filter(function (k) { return checks[GEN[k].topic].checked; });
    listEl.textContent = ""; right = answered = 0;
    if (!gens.length) { total = 0; score.textContent = "Pick at least one topic."; return; }
    total = 10;
    var order = [];
    while (order.length < total) order = order.concat(shuffle(gens));
    order.slice(0, total).forEach(function (k, i) { render(GEN[k].make(), i); });
    updateScore();
  }
  startBtn.addEventListener("click", newQuiz);
  newQuiz();
})();
