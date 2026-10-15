/* Interactive quiz for D427 Part 4 (concepts check).
   hooks/quiz.py puts the answer keys on the page as JSON (#quiz-data). Each key
   comes from an <!-- answer:ID ... --> comment that sits right after its part,
   so the part's content is everything between that comment and the previous one.
   Progress is saved in localStorage; the page still works if storage is blocked. */
(function () {
  "use strict";

  var dataEl = document.getElementById("quiz-data");
  if (!dataEl) return;
  var DATA = JSON.parse(dataEl.textContent);
  var content = document.querySelector(".md-content article") || document.querySelector(".md-content");
  if (!content) return;

  /* ---------- Saved answers ---------- */

  // state[partId] = {v: [value per item], r: [true | false | null per item]}
  var state = {};
  var storageOk = true;
  try { state = JSON.parse(localStorage.getItem(DATA.storage) || "{}") || {}; } catch (e) { storageOk = false; state = {}; }

  function save() {
    try { localStorage.setItem(DATA.storage, JSON.stringify(state)); } catch (e) { storageOk = false; }
  }

  function stateFor(part) {
    var s = state[part.id];
    if (!s || !Array.isArray(s.v) || !Array.isArray(s.r) || s.r.length !== part.items) {
      s = state[part.id] = { v: [], r: [] };
      for (var i = 0; i < part.items; i++) { s.v.push(part.kind === "choice" ? [] : ""); s.r.push(null); }
    }
    return s;
  }

  /* ---------- Helpers ---------- */

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function button(cls, text, onClick) {
    var b = el("button", "md-button " + (cls || ""), text);
    b.type = "button";
    b.addEventListener("click", onClick);
    return b;
  }

  // A label like "`NULL = NULL`" shows the backticked parts as code.
  function richLabel(text) {
    var span = el("span", "quiz-blank__label");
    text.split(/`([^`]*)`/).forEach(function (piece, i) {
      if (piece) span.appendChild(i % 2 ? el("code", null, piece) : document.createTextNode(piece));
    });
    return span;
  }

  function norm(s) {
    return String(s).toLowerCase().replace(/\s+/g, "").replace(/[;.]+$/, "");
  }

  function matches(value, answers) {
    var v = norm(value);
    return answers.some(function (a) {
      var n = norm(a);
      if (v === n) return true;
      // 15 and 15.0 are the same number.
      return v !== "" && n !== "" && !isNaN(v) && !isNaN(n) && Number(v) === Number(n);
    });
  }


  /* ---------- Finding each part on the page ---------- */

  var anchors = {};
  var walker = document.createTreeWalker(content, NodeFilter.SHOW_COMMENT);
  for (var node = walker.nextNode(); node; node = walker.nextNode()) {
    var m = /^\s*answer:(\S+)/.exec(node.data);
    if (m) anchors[m[1]] = node;
  }

  function isKey(n) { return n.nodeType === 8 && /^\s*answer:/.test(n.data); }

  // The elements of a part: from just after the previous key (or the question's
  // first paragraph) up to the key.
  function partBlock(anchor) {
    var start = anchor.parentNode.tagName === "P" ? anchor.parentNode : anchor;
    var li = start.parentNode;
    var block = [];
    for (var n = start.previousSibling; n && n !== li.firstElementChild; n = n.previousSibling) {
      if (isKey(n) || (n.nodeType === 1 && n.tagName === "P" && n.childNodes.length === 1 && isKey(n.firstChild))) break;
      if (n.nodeType === 1) block.unshift(n);
    }
    return { start: start, li: li, elements: block };
  }

  function answerBox(li) {
    var boxes = li.querySelectorAll(":scope > details");
    for (var i = 0; i < boxes.length; i++) {
      var s = boxes[i].querySelector("summary");
      if (s && s.textContent.trim() === "Answer") return boxes[i];
    }
    return null;
  }

  function showAnswer(part) {
    if (!part.answerBox) return;
    part.answerBox.open = true;
    part.answerBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
    part.answerBox.querySelector("summary").focus({ preventScroll: true });
  }

  /* ---------- Feedback line ---------- */

  function feedback(part, s) {
    var box = el("div", "quiz-feedback");
    box.setAttribute("tabindex", "-1");
    var done = s.r.filter(function (r) { return r !== null; }).length;
    if (!done) return box;
    var right = s.r.filter(function (r) { return r === true; }).length;
    var all = right === s.r.length;
    var text;
    if (done < s.r.length) {
      // Some items were reopened by "Retry only what I missed".
      box.appendChild(el("span", null, right + " of " + s.r.length + " right so far."));
      return box;
    }
    box.classList.add(all ? "quiz-feedback--ok" : "quiz-feedback--bad");
    if (part.kind === "written") {
      text = all ? "✓ Marked as got it." : "✗ Marked as missed.";
    } else if (part.kind === "choice") {
      text = all ? "✓ Correct." : "✗ Not quite. The answer is " + part.answer.join(" and ") + ".";
    } else if (s.r.length === 1) {
      text = all ? "✓ Correct." : "✗ Not quite. The answer is " + firstAnswer(part, 0) + ".";
    } else {
      text = all ? "✓ All " + right + " right." : "✗ " + right + " of " + s.r.length + " right.";
    }
    box.appendChild(el("span", null, text + " "));
    if (part.answerBox && part.kind !== "written") {
      box.appendChild(button("quiz-link", "See the explanation", function () { showAnswer(part); }));
    }
    return box;
  }

  function firstAnswer(part, i) {
    return part.kind === "blanks" ? part.blanks[i].answers[0] : part.answers[i][0];
  }

  /* ---------- Multiple choice ---------- */

  function setupChoice(part) {
    var options = [];
    part.block.elements.forEach(function (e) {
      var m = e.tagName === "P" && /^([A-Z])\.\s/.exec(e.textContent);
      if (m) options.push({ letter: m[1], p: e });
    });
    part.options = options;
    var group = el("div", "quiz-options");
    group.setAttribute("role", "group");
    group.setAttribute("aria-label", part.answer.length > 1
      ? "Choices for " + part.id + ", pick " + part.answer.length
      : "Choices for " + part.id);
    options.forEach(function (o) {
      var b = el("button", "quiz-option");
      b.type = "button";
      b.appendChild(el("span", "quiz-option__letter", o.letter));
      var body = el("span", "quiz-option__text");
      Array.prototype.forEach.call(o.p.childNodes, function (c) { body.appendChild(c.cloneNode(true)); });
      // Drop the "A. " the letter badge already shows.
      var first = body.firstChild;
      if (first && first.nodeType === 3) first.data = first.data.replace(/^\s*[A-Z]\.\s*/, "");
      b.appendChild(body);
      b.addEventListener("click", function () { pick(part, o.letter); });
      o.button = b;
      group.appendChild(b);
      o.p.hidden = true;
    });
    part.ui.appendChild(group);
    if (part.answer.length > 1) {
      part.checkBtn = button("md-button--primary", "Check", function () { gradeChoice(part); });
      part.hint = el("span", "quiz-hint", "Pick " + part.answer.length + ".");
      var row = el("div", "quiz-actions");
      row.appendChild(part.checkBtn);
      row.appendChild(part.hint);
      part.ui.appendChild(row);
    }
  }

  function pick(part, letter) {
    var s = stateFor(part);
    if (s.r[0] !== null) return;
    if (part.answer.length === 1) {
      s.v[0] = [letter];
      gradeChoice(part);
      return;
    }
    var chosen = s.v[0];
    var i = chosen.indexOf(letter);
    if (i >= 0) chosen.splice(i, 1); else chosen.push(letter);
    renderPart(part);
  }

  function gradeChoice(part) {
    var s = stateFor(part), chosen = s.v[0].slice().sort();
    if (chosen.length !== part.answer.length) {
      part.hint.textContent = "Pick " + part.answer.length + " (you have " + chosen.length + ").";
      return;
    }
    s.r[0] = chosen.join() === part.answer.slice().sort().join();
    graded(part);
  }

  function renderChoice(part, s) {
    var done = s.r[0] !== null;
    part.options.forEach(function (o) {
      var chosen = s.v[0].indexOf(o.letter) >= 0;
      var right = part.answer.indexOf(o.letter) >= 0;
      var b = o.button;
      b.classList.toggle("is-chosen", chosen && !done);
      b.classList.toggle("is-correct", done && right);
      b.classList.toggle("is-wrong", done && chosen && !right);
      b.setAttribute("aria-pressed", chosen ? "true" : "false");
      b.setAttribute("aria-disabled", done ? "true" : "false");
      var label = o.letter + (done && right ? ", correct answer" : "") + (done && chosen && !right ? ", your answer, wrong" : "");
      b.querySelector(".quiz-option__letter").setAttribute("aria-label", label);
    });
    if (part.checkBtn) part.checkBtn.parentNode.hidden = done;
  }

  /* ---------- Blanks and tables ---------- */

  // A dropdown or a text box for one item.
  function control(part, i, options, label) {
    var c;
    if (options) {
      c = el("select", "quiz-select");
      c.appendChild(new Option("Choose…", ""));
      options.forEach(function (o) { c.appendChild(new Option(o, o)); });
    } else {
      c = el("input", "quiz-input");
      c.type = "text";
      c.spellcheck = false;
      c.setAttribute("autocomplete", "off");
      c.setAttribute("autocapitalize", "off");
      c.addEventListener("keydown", function (e) {
        if (e.key === "Enter") { e.preventDefault(); gradeItems(part); }
      });
    }
    c.setAttribute("aria-label", label);
    c.addEventListener(options ? "change" : "input", function () {
      stateFor(part).v[i] = c.value;
      save();
    });
    return c;
  }

  function slot(part, i, options, label) {
    var wrap = el("span", "quiz-slot");
    var c = control(part, i, options, label);
    var mark = el("span", "quiz-mark");
    wrap.appendChild(c);
    wrap.appendChild(mark);
    part.slots.push({ wrap: wrap, control: c, mark: mark });
    return wrap;
  }

  function setupBlanks(part) {
    part.slots = [];
    var list = el("div", "quiz-blanks");
    part.blanks.forEach(function (b, i) {
      var row = el("label", "quiz-blank");
      if (b.label) row.appendChild(richLabel(b.label));
      row.appendChild(slot(part, i, b.options, (b.label || "Answer") + " for " + part.id));
      list.appendChild(row);
    });
    part.ui.appendChild(list);
    addCheckRow(part);
  }

  function setupTable(part) {
    part.slots = [];
    var table = null;
    part.block.elements.forEach(function (e) {
      var t = e.tagName === "TABLE" ? e : e.querySelector("table");
      if (t) table = t;
    });
    if (!table) { console.warn("quiz: no table for", part.id); return false; }
    var heads = Array.prototype.map.call(table.querySelectorAll("thead th"), function (th) { return th.textContent.trim(); });
    var cells = [];
    Array.prototype.forEach.call(table.tBodies[0].rows, function (tr) {
      Array.prototype.forEach.call(tr.cells, function (td, c) {
        if (!td.textContent.trim()) cells.push({ td: td, tr: tr, col: c });
      });
    });
    if (cells.length !== part.answers.length) { console.warn("quiz: cell count differs for", part.id); return false; }
    var columns = [];
    cells.forEach(function (x) { if (columns.indexOf(x.col) < 0) columns.push(x.col); });
    columns.sort(function (a, b) { return a - b; });
    cells.forEach(function (x, i) {
      // Name the row by the cells before this one, like "a) Country names, ...".
      var rowName = Array.prototype.slice.call(x.tr.cells, 0, x.col).map(function (td) {
        return td.textContent.trim();
      }).join(" ").slice(0, 80);
      var colName = heads[x.col] || "Answer";
      var options = part.groups ? part.groups[columns.indexOf(x.col)] : null;
      x.td.classList.add("quiz-cell");
      x.td.appendChild(slot(part, i, options, colName + ": " + rowName));
    });
    addCheckRow(part);
    return true;
  }

  function addCheckRow(part) {
    var row = el("div", "quiz-actions");
    part.checkBtn = button("md-button--primary", "Check", function () { gradeItems(part); });
    part.hint = el("span", "quiz-hint");
    row.appendChild(part.checkBtn);
    row.appendChild(part.hint);
    part.ui.appendChild(row);
  }

  function gradeItems(part) {
    var s = stateFor(part);
    var open = [];
    part.slots.forEach(function (x, i) { if (s.r[i] === null) open.push(i); });
    if (!open.length) return;
    var empty = open.filter(function (i) { return !String(part.slots[i].control.value).trim(); });
    if (empty.length) {
      part.hint.textContent = open.length === 1 ? "Fill in the blank first."
        : "Fill in every blank first (" + empty.length + " still empty).";
      part.slots[empty[0]].control.focus();
      return;
    }
    open.forEach(function (i) {
      var value = part.slots[i].control.value;
      s.v[i] = value;
      var answers = part.kind === "blanks" ? part.blanks[i].answers : part.answers[i];
      s.r[i] = matches(value, answers);
    });
    graded(part);
  }

  function renderItems(part, s) {
    part.slots.forEach(function (x, i) {
      var r = s.r[i];
      if (x.control.value !== s.v[i]) x.control.value = s.v[i] || "";
      x.control.disabled = r !== null;
      x.wrap.classList.toggle("is-correct", r === true);
      x.wrap.classList.toggle("is-wrong", r === false);
      x.mark.textContent = r === true ? "✓" : r === false ? "✗ " + firstAnswer(part, i) : "";
      x.mark.setAttribute("aria-label", r === true ? "correct" : r === false ? "wrong, the answer is " + firstAnswer(part, i) : "");
    });
    var open = s.r.some(function (r) { return r === null; });
    part.checkBtn.parentNode.hidden = !open;
    if (!open) part.hint.textContent = "";
  }

  /* ---------- Written answers ---------- */

  function setupWritten(part) {
    var area = el("textarea", "quiz-written");
    area.rows = 3;
    area.placeholder = "Write your answer, then compare it with the model answer.";
    area.setAttribute("aria-label", "Your answer for " + part.id);
    area.addEventListener("input", function () { stateFor(part).v[0] = area.value; save(); });
    part.area = area;
    var row = el("div", "quiz-actions");
    part.revealBtn = button("", "Show the model answer", function () {
      part.revealed = true;
      showAnswer(part);
      renderPart(part);
      part.gotBtn.focus({ preventScroll: true });
    });
    part.gotBtn = button("quiz-self quiz-self--ok", "Got it", function () { mark(part, true); });
    part.missBtn = button("quiz-self quiz-self--bad", "Missed it", function () { mark(part, false); });
    [part.revealBtn, part.gotBtn, part.missBtn].forEach(function (b) { row.appendChild(b); });
    part.ui.appendChild(area);
    part.ui.appendChild(row);
  }

  function mark(part, ok) {
    var s = stateFor(part);
    s.v[0] = part.area.value;
    s.r[0] = ok;
    graded(part);
  }

  function renderWritten(part, s) {
    if (part.area.value !== s.v[0]) part.area.value = s.v[0] || "";
    var shown = part.revealed || s.r[0] !== null;
    part.revealBtn.hidden = shown;
    part.gotBtn.hidden = part.missBtn.hidden = !shown;
    part.gotBtn.setAttribute("aria-pressed", s.r[0] === true ? "true" : "false");
    part.missBtn.setAttribute("aria-pressed", s.r[0] === false ? "true" : "false");
  }

  /* ---------- Rendering and score ---------- */

  function renderPart(part) {
    var s = stateFor(part);
    if (part.kind === "choice") renderChoice(part, s);
    else if (part.kind === "written") renderWritten(part, s);
    else renderItems(part, s);
    var fb = feedback(part, s);
    if (part.feedback) part.ui.replaceChild(fb, part.feedback); else part.ui.appendChild(fb);
    part.feedback = fb;
  }

  function questionDone(q) {
    return parts.every(function (p) {
      return p.question !== q || stateFor(p).r.every(function (r) { return r !== null; });
    });
  }

  function graded(part) {
    save();
    renderPart(part);
    renderSummary();
    if (part.kind !== "written" && questionDone(part.question) && part.answerBox) part.answerBox.open = true;
    if (questionDone(part.question)) {
      // Every part answered: progress.js marks the question done.
      document.dispatchEvent(new CustomEvent("d427:solved", { detail: { label: part.question } }));
    }
    if (part.kind !== "written") part.feedback.focus({ preventScroll: true });
  }

  var parts = [];
  DATA.parts.forEach(function (part) {
    var anchor = anchors[part.id];
    if (!anchor) { console.warn("quiz: no answer comment on the page for", part.id); return; }
    part.block = partBlock(anchor);
    part.answerBox = answerBox(part.block.li);
    part.ui = el("div", "quiz-part quiz-part--" + part.kind);
    part.ui.id = "quiz-" + part.id.replace(/[^\w-]/g, "-");
    part.block.start.parentNode.insertBefore(part.ui, part.block.start.nextSibling);
    var ok = true;
    if (part.kind === "choice") setupChoice(part);
    else if (part.kind === "blanks") setupBlanks(part);
    else if (part.kind === "table") ok = setupTable(part);
    else setupWritten(part);
    if (!ok) { part.ui.remove(); return; }
    parts.push(part);
    renderPart(part);
  });
  if (!parts.length) return;

  /* ---------- Summary at the top ---------- */

  var summary = el("section", "quiz-summary");
  summary.setAttribute("tabindex", "-1");
  summary.setAttribute("aria-label", "Your score");
  var scoreLine = el("p", "quiz-summary__score");
  scoreLine.setAttribute("aria-live", "polite");
  var bar = el("div", "quiz-summary__bar");
  bar.setAttribute("aria-hidden", "true");
  var barOk = el("span", "quiz-summary__ok"), barBad = el("span", "quiz-summary__bad");
  bar.appendChild(barOk);
  bar.appendChild(barBad);
  var note = el("p", "quiz-summary__note");
  var actions = el("div", "quiz-actions");
  var retryBtn = button("md-button--primary", "Retry only what I missed", retryMissed);
  var resetBtn = button("", "Reset", resetAll);
  actions.appendChild(retryBtn);
  actions.appendChild(resetBtn);
  summary.appendChild(el("p", "quiz-summary__title", "Quiz mode"));
  summary.appendChild(scoreLine);
  summary.appendChild(bar);
  summary.appendChild(actions);
  summary.appendChild(note);
  var heading = content.querySelector("h2");
  if (heading) heading.parentNode.insertBefore(summary, heading); else content.prepend(summary);

  function totals() {
    var t = { items: 0, right: 0, wrong: 0 };
    parts.forEach(function (p) {
      stateFor(p).r.forEach(function (r) {
        t.items++;
        if (r === true) t.right++;
        else if (r === false) t.wrong++;
      });
    });
    return t;
  }

  function renderSummary() {
    var t = totals(), answered = t.right + t.wrong;
    scoreLine.textContent = "";
    scoreLine.appendChild(el("strong", null, t.right + " of " + t.items));
    scoreLine.appendChild(document.createTextNode(" right · " + answered + " answered" +
      (t.wrong ? " · " + t.wrong + " missed" : "")));
    barOk.style.width = (100 * t.right / t.items) + "%";
    barBad.style.width = (100 * t.wrong / t.items) + "%";
    retryBtn.disabled = !t.wrong;
    retryBtn.textContent = "Retry only what I missed" + (t.wrong ? " (" + t.wrong + ")" : "");
    resetBtn.disabled = !answered && !parts.some(function (p) { return p.kind === "written" && stateFor(p).v[0]; });
    note.textContent = storageOk
      ? "Pick or type an answer under each part, then Check. Your answers are saved in this browser."
      : "Your browser is blocking storage, so answers won't be kept after you leave the page.";
  }

  function retryMissed() {
    var first = null, questions = {};
    parts.forEach(function (p) {
      var s = stateFor(p);
      s.r.forEach(function (r, i) {
        if (r !== false) return;
        s.r[i] = null;
        if (p.kind === "choice") s.v[i] = [];
        else if (p.kind !== "written") s.v[i] = "";
        questions[p.question] = true;
        if (!first) first = p;
      });
      p.revealed = false;
    });
    parts.forEach(function (p) {
      if (questions[p.question] && p.answerBox) p.answerBox.open = false;
      renderPart(p);
    });
    save();
    renderSummary();
    if (first) {
      var target = firstOpenControl(first);
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      target.focus({ preventScroll: true });
    }
  }

  function firstOpenControl(part) {
    if (part.kind === "choice") return part.options[0].button;
    if (part.kind === "written") return part.area;
    var s = stateFor(part);
    for (var i = 0; i < part.slots.length; i++) if (s.r[i] === null) return part.slots[i].control;
    return part.checkBtn;
  }

  function resetAll() {
    if (!window.confirm("Clear all your answers on this page?")) return;
    state = {};
    save();
    parts.forEach(function (p) {
      p.revealed = false;
      if (p.answerBox) p.answerBox.open = false;
      renderPart(p);
    });
    renderSummary();
    summary.focus();
  }

  renderSummary();
})();
