/* Exercise progress: a "Done" checkbox on each exercise, a progress bar per part
   on the overview page, and a "To review" list there of exercises you missed (a
   failed Check, or a quiz question with a wrong part) until you get them right.
   Those exercises also get a "To review" tag next to their number on their page. The list of parts and exercises comes from
   hooks/progress.py (#ex-progress-data). Progress lives in localStorage only.
   sql-runner.js sends a "d427:solved" event when a Check passes; that ticks the box. */
(function () {
  var el = document.getElementById("ex-progress-data");
  if (!el) return;
  var DATA = JSON.parse(el.textContent);
  var KEY = DATA.key || "d427-progress";

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { return {}; }
  }
  function save(done) {
    try { localStorage.setItem(KEY, JSON.stringify(done)); } catch (e) { /* storage blocked */ }
  }
  var REVIEW = KEY + "-review";
  function loadReview() {
    try { return JSON.parse(localStorage.getItem(REVIEW) || "{}") || {}; } catch (e) { return {}; }
  }
  function saveReview(r) {
    try { localStorage.setItem(REVIEW, JSON.stringify(r)); } catch (e) { /* storage blocked */ }
  }
  var done = load();
  var known = {};
  DATA.parts.forEach(function (p) { p.labels.forEach(function (l) { known[l] = true; }); });

  var boxes = {}, labels = {};
  function set(label, value) {
    if (value) done[label] = true; else delete done[label];
    save(done);
    if (boxes[label]) {
      boxes[label].checked = !!value;
      boxes[label].closest("li").classList.toggle("ex-is-done", !!value);
    }
  }

  // Each exercise is a list item whose first paragraph starts with its bold label, like **1.1**.
  document.querySelectorAll(".md-content li").forEach(function (li) {
    var first = li.firstElementChild;
    var strong = first && first.tagName === "P" ? first.firstElementChild : null;
    if (!strong || strong.tagName !== "STRONG" || first.firstChild !== strong) return;
    var label = strong.textContent.trim();
    if (!known[label] || boxes[label]) return;
    var wrap = document.createElement("label");
    wrap.className = "ex-done";
    var box = document.createElement("input");
    box.type = "checkbox";
    box.checked = !!done[label];
    box.setAttribute("aria-label", "Mark exercise " + label + " done");
    box.addEventListener("change", function () { set(label, box.checked); });
    wrap.appendChild(box);
    wrap.appendChild(document.createTextNode(" Done"));
    first.insertBefore(wrap, strong);
    boxes[label] = box;
    labels[label] = strong;
    li.classList.toggle("ex-is-done", box.checked);
  });

  // A "To review" tag next to each exercise on the review list, on its own page.
  function markReview(label, on) {
    var strong = labels[label];
    if (!strong) return;
    var tag = strong.parentNode.querySelector(":scope > .ex-review-mark");
    if (on && !tag) {
      tag = document.createElement("span");
      tag.className = "ex-review-mark";
      tag.textContent = "To review";
      tag.title = "A Check failed or a quiz answer was wrong here. Get it right to clear this.";
      strong.after(tag);
    } else if (!on && tag) {
      tag.remove();
    }
  }
  Object.keys(loadReview()).forEach(function (label) { markReview(label, true); });

  document.addEventListener("d427:solved", function (e) {
    if (!e.detail || !known[e.detail.label]) return;
    set(e.detail.label, true);
    var review = loadReview();
    if (review[e.detail.label]) { delete review[e.detail.label]; saveReview(review); }
    markReview(e.detail.label, false);
  });
  document.addEventListener("d427:missed", function (e) {
    if (!e.detail || !known[e.detail.label]) return;
    var review = loadReview();
    review[e.detail.label] = true;
    saveReview(review);
    markReview(e.detail.label, true);
  });

  if (!DATA.overview) return;
  var panel = document.getElementById("ex-progress");
  if (!panel) return;

  function render() {
    done = load();
    panel.querySelectorAll(".ex-progress-row, .ex-progress-total, .ex-progress-reset, .ex-progress-next, .ex-review").forEach(function (n) { n.remove(); });
    var all = 0, finished = 0;
    DATA.parts.forEach(function (p) {
      var n = p.labels.filter(function (l) { return done[l]; }).length;
      all += p.labels.length;
      finished += n;
      var row = document.createElement("div");
      row.className = "ex-progress-row";
      var name = document.createElement("a");
      name.href = "../" + p.url;
      name.textContent = p.title;
      var bar = document.createElement("progress");
      bar.max = p.labels.length;
      bar.value = n;
      bar.setAttribute("aria-label", p.title + ": " + n + " of " + p.labels.length + " done");
      var count = document.createElement("span");
      count.className = "ex-progress-count";
      count.textContent = n + " / " + p.labels.length;
      row.append(name, bar, count);
      panel.appendChild(row);
    });
    var total = document.createElement("p");
    total.className = "ex-progress-total";
    total.textContent = finished + " of " + all + " exercises done.";
    panel.appendChild(total);

    // Continue: the first exercise not marked Done, in page order.
    var next = null;
    DATA.parts.some(function (p) {
      var label = p.labels.filter(function (l) { return !done[l]; })[0];
      if (label) next = { part: p, label: label };
      return !!label;
    });
    var go = document.createElement(next ? "a" : "p");
    go.className = "ex-progress-next" + (next ? " md-button md-button--primary" : "");
    if (next) {
      // Anchors come from hooks/anchors.py: 7.3 -> #ex-7-3.
      go.href = "../" + next.part.url + "#ex-" + next.label.toLowerCase().replace(".", "-");
      go.textContent = (finished ? "Continue with " : "Start with ") + next.label + " →";
      go.setAttribute("aria-label", (finished ? "Continue with exercise " : "Start with exercise ") +
        next.label + ", in " + next.part.title);
    } else {
      go.textContent = "Every exercise is marked Done.";
    }
    panel.appendChild(go);

    // To review: exercises you missed, in page order, each linked to its anchor.
    var review = loadReview();
    var missed = [];
    DATA.parts.forEach(function (p) {
      p.labels.forEach(function (l) { if (review[l]) missed.push({ part: p, label: l }); });
    });
    if (missed.length) {
      var box = document.createElement("div");
      box.className = "ex-review";
      var title = document.createElement("p");
      title.className = "ex-review__title";
      title.textContent = "To review (" + missed.length + "): ";
      box.appendChild(title);
      missed.forEach(function (m, i) {
        var a = document.createElement("a");
        a.href = "../" + m.part.url + "#ex-" + m.label.toLowerCase().replace(".", "-");
        a.textContent = m.label;
        a.setAttribute("aria-label", "Review exercise " + m.label + ", in " + m.part.title);
        title.appendChild(a);
        if (i < missed.length - 1) title.appendChild(document.createTextNode(", "));
      });
      var note = document.createElement("p");
      note.className = "ex-review__note";
      note.textContent = "A failed Check or a wrong quiz answer adds an exercise here; getting it right takes it off.";
      box.appendChild(note);
      var clear = document.createElement("button");
      clear.type = "button";
      clear.className = "drill-reset";
      clear.textContent = "Clear the list";
      clear.addEventListener("click", function () { saveReview({}); render(); });
      box.appendChild(clear);
      panel.appendChild(box);
    }
    if (finished) {
      var reset = document.createElement("button");
      reset.type = "button";
      reset.className = "md-button ex-progress-reset";
      reset.textContent = "Reset progress";
      reset.addEventListener("click", function () {
        if (!window.confirm("Clear the Done marks on every exercise in this course, in this browser?")) return;
        done = {};
        save(done);
        saveReview({});
        render();
      });
      panel.appendChild(reset);
    }
  }
  render();
  window.addEventListener("storage", function (e) { if (e.key === KEY || e.key === REVIEW) render(); });
})();
