/* D427 exercise progress: a "Done" checkbox on each exercise, and a progress bar
   per part on the overview page. The list of parts and exercises comes from
   hooks/progress.py (#ex-progress-data). Progress lives in localStorage only.
   sql-runner.js sends a "d427:solved" event when a Check passes; that ticks the box. */
(function () {
  var el = document.getElementById("ex-progress-data");
  if (!el) return;
  var DATA = JSON.parse(el.textContent);
  var KEY = "d427-progress";

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY) || "{}") || {}; } catch (e) { return {}; }
  }
  function save(done) {
    try { localStorage.setItem(KEY, JSON.stringify(done)); } catch (e) { /* storage blocked */ }
  }
  var done = load();
  var known = {};
  DATA.parts.forEach(function (p) { p.labels.forEach(function (l) { known[l] = true; }); });

  var boxes = {};
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
    li.classList.toggle("ex-is-done", box.checked);
  });

  document.addEventListener("d427:solved", function (e) {
    if (e.detail && known[e.detail.label]) set(e.detail.label, true);
  });

  if (!DATA.overview) return;
  var panel = document.getElementById("ex-progress");
  if (!panel) return;

  function render() {
    done = load();
    panel.querySelectorAll(".ex-progress-row, .ex-progress-total, .ex-progress-reset").forEach(function (n) { n.remove(); });
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
    if (finished) {
      var reset = document.createElement("button");
      reset.type = "button";
      reset.className = "md-button ex-progress-reset";
      reset.textContent = "Reset progress";
      reset.addEventListener("click", function () {
        if (!window.confirm("Clear the Done marks on every D427 exercise in this browser?")) return;
        done = {};
        save(done);
        render();
      });
      panel.appendChild(reset);
    }
  }
  render();
  window.addEventListener("storage", function (e) { if (e.key === KEY) render(); });
})();
