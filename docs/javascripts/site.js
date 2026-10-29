/* Small site-wide fixes.
   - Accessibility: Material's search box is a dialog without a name; give it one.
   - Printing: remember which folded boxes the reader opened (Material opens
     them all for printing), and label each tab of a tabbed set (wgu.css prints
     every tab, without the tab bar, and always in light colors). */
(function () {
  var search = document.querySelector(".md-search[role=dialog]");
  if (search && !search.hasAttribute("aria-label")) search.setAttribute("aria-label", "Search the site");

  // Accessibility: code blocks' toolbars are <nav> landmarks with no name, so
  // number them. Material adds them after page load, so wait for its document$.
  function codeNavs() {
    document.querySelectorAll(".md-typeset .md-code__nav").forEach(function (nav, i) {
      nav.setAttribute("aria-label", "Code block " + (i + 1) + " actions");
    });
  }

  // Accessibility: boxes that scroll sideways (wide diagrams and tables) must be
  // reachable by keyboard, so they can be scrolled with the arrow keys. Each gets
  // a unique name: the diagram's own title, or a numbered "Table".
  function scrollables() {
    var tables = 0, seen = {};
    document.querySelectorAll(".md-typeset .er-wide, .md-typeset .md-typeset__scrollwrap").forEach(function (el) {
      var isTable = !el.classList.contains("er-wide");
      if (isTable) tables += 1;
      var scrolls = el.scrollWidth > el.clientWidth;  // the same test axe uses: even 1px scrolls
      if (scrolls) {
        var title = el.querySelector("svg title");
        var name = isTable ? "Table " + tables : (title ? title.textContent.trim() : "Diagram");
        seen[name] = (seen[name] || 0) + 1;
        if (seen[name] > 1) name += " (" + seen[name] + ")";
        el.setAttribute("tabindex", "0");
        el.setAttribute("role", "region");
        el.setAttribute("aria-label", name + " (scrolls sideways)");
      } else if (el.getAttribute("role") === "region") {
        el.removeAttribute("tabindex");
        el.removeAttribute("role");
        el.removeAttribute("aria-label");
      }
    });
  }

  // A table's width can change after the first check (the web font arriving,
  // say), so check again whenever a box or what's in it changes size. Material
  // adds the table wrappers itself, so this runs from init, after it has.
  var watchQueued = false;
  var watcher = window.ResizeObserver && new ResizeObserver(function () {
    if (watchQueued) return;
    watchQueued = true;
    requestAnimationFrame(function () { watchQueued = false; scrollables(); });
  });
  function watchSizes() {
    if (!watcher) return;
    document.querySelectorAll(".md-typeset .er-wide, .md-typeset .md-typeset__scrollwrap").forEach(function (el) {
      watcher.observe(el);
      if (el.firstElementChild) watcher.observe(el.firstElementChild);
    });
  }

  // An exercise's own Show tables box (hooks/er_diagrams.py) starts empty:
  // opening it copies in the diagram from its heading's box, with the ids
  // renamed (er3w-t -> er3c1w-t) so the copy's labels point at itself.
  var copies = 0;
  function fillCopy(d) {
    var slot = d.querySelector(".er-copy:empty");
    if (!slot) return;
    var source = document.getElementById("er" + slot.dataset.erFrom);
    var box = source && source.closest("details");
    if (!box) return;
    copies += 1;
    var html = "";
    Array.prototype.forEach.call(box.children, function (el) { if (el.tagName !== "SUMMARY") html += el.outerHTML; });
    slot.innerHTML = html.replace(new RegExp("\\ber" + slot.dataset.erFrom + "(?![0-9])", "g"), "er" + slot.dataset.erFrom + "c" + copies);
    watchSizes();
  }
  document.addEventListener("toggle", function (e) {
    if (e.target.tagName === "DETAILS" && e.target.open) fillCopy(e.target);
  }, true);

  function init() { codeNavs(); scrollables(); watchSizes(); }
  if (window.document$ && window.document$.subscribe) window.document$.subscribe(function () { setTimeout(init, 0); });
  else init();
  var resizeTimer;
  window.addEventListener("resize", function () { clearTimeout(resizeTimer); resizeTimer = setTimeout(scrollables, 200); });
  // Folded boxes only get a width when they open.
  document.addEventListener("toggle", scrollables, true);

  // Material opens every folded box before printing. Remember which boxes the
  // reader had open (data-was-open), so wgu.css can print only those open.
  var printing = false;
  function markOpen(d) { if (d.open) d.setAttribute("data-was-open", ""); else d.removeAttribute("data-was-open"); }
  document.querySelectorAll(".md-typeset details").forEach(markOpen);
  document.addEventListener("toggle", function (e) {
    if (!printing && e.target.tagName === "DETAILS") markOpen(e.target);
  }, true);

  window.addEventListener("beforeprint", function () {
    printing = true;
    document.querySelectorAll(".md-typeset .tabbed-set").forEach(function (set) {
      var labels = set.querySelectorAll(":scope > .tabbed-labels > label");
      var blocks = set.querySelectorAll(":scope > .tabbed-content > .tabbed-block");
      blocks.forEach(function (block, i) {
        if (!labels[i] || block.querySelector(":scope > .print-tab-label")) return;
        var p = document.createElement("p");
        p.className = "print-tab-label";
        p.textContent = labels[i].textContent.trim();
        block.insertBefore(p, block.firstChild);
      });
    });
  });
  window.addEventListener("afterprint", function () {
    // Material closes the boxes again; their toggle events arrive a moment later.
    setTimeout(function () { printing = false; }, 500);
    document.querySelectorAll(".print-tab-label").forEach(function (p) { p.remove(); });
  });
})();
