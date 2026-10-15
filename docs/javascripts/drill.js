/* Spec-to-type drill (D427 drill.md): endless random column specs, in the
   assessment's wording, to turn into a MySQL type. Mounts on #spec-drill.
   Everything runs in the browser; the score is saved per browser only. */
(function () {
  var root = document.getElementById("spec-drill");
  if (!root) return;
  var KEY = "d427-drill";

  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }
  function int(lo, hi) { return lo + Math.floor(Math.random() * (hi - lo + 1)); }

  // [name, signed min, signed max, unsigned max, and the same three as exact text]
  // (BIGINT's limits are past what a JavaScript number holds exactly).
  var INTS = [
    ["TINYINT", -128, 127, 255, "-128", "127", "255"],
    ["SMALLINT", -32768, 32767, 65535, "-32,768", "32,767", "65,535"],
    ["MEDIUMINT", -8388608, 8388607, 16777215, "-8,388,608", "8,388,607", "16,777,215"],
    ["INT", -2147483648, 2147483647, 4294967295, "-2,147,483,648", "2,147,483,647", "4,294,967,295"],
    ["BIGINT", -9.3e18, 9.3e18, 1.9e19, "-9,223,372,036,854,775,808", "9,223,372,036,854,775,807",
     "18,446,744,073,709,551,615"],
  ];
  var WORDS = [[1e9, " billion"], [1e6, " million"], [1e3, " thousand"]];

  function say(n) { // 65000 -> "65 thousand", 300 -> "300"
    var a = Math.abs(n);
    for (var i = 0; i < WORDS.length; i++) {
      if (a >= WORDS[i][0] && a % WORDS[i][0] === 0) return (n < 0 ? "-" : "") + a / WORDS[i][0] + WORDS[i][1];
    }
    return n.toLocaleString("en-US");
  }
  function smallestUnsigned(max) { return INTS.filter(function (t) { return t[3] >= max; })[0]; }
  function smallestSigned(min, max) { return INTS.filter(function (t) { return t[1] <= min && t[2] >= max; })[0]; }

  // Tops near each type's limit: some just under it, some just past it.
  var UNSIGNED_TOPS = [100, 200, 255, 256, 300, 1000, 5000, 40000, 65000, 65535, 70000, 100000,
                       1000000, 16000000, 17000000, 100000000, 4000000000, 5000000000];
  var SIGNED = [[-100, 100], [-128, 127], [-200, 200], [-1000, 1000], [-30000, 30000],
                [-32768, 32767], [-40000, 40000], [-8000000, 8000000], [-10000000, 10000000]];
  var ORDINAL = ["", "", "first", "second", "third"];

  var KINDS = [
    function unsignedRange() {
      var top = pick(UNSIGNED_TOPS), t = smallestUnsigned(top);
      var wording = pick(["integer with range 0 to " + say(top), "integer ranging from 0 to " + say(top),
                          "integer from 0 to " + say(top)]);
      var below = INTS[INTS.indexOf(t) - 1];
      return { spec: wording, answers: [t[0] + " UNSIGNED"],
               why: "A range that starts at 0 means UNSIGNED. " + t[0] + " UNSIGNED holds 0 to " +
                    t[6] + (below ? "; " + below[0] + " UNSIGNED stops at " + below[6] + "." : ".") };
    },
    function signedRange() {
      var r = pick(SIGNED), t = smallestSigned(r[0], r[1]);
      return { spec: "integer with range " + say(r[0]) + " to " + say(r[1]), answers: [t[0], t[0] + " SIGNED"],
               why: "The range goes below 0, so it's signed (no UNSIGNED). " + t[0] + " holds " +
                    t[4] + " to " + t[5] + "." };
    },
    function plainInteger() {
      return pick([
        { spec: "integer", answers: ["INT", "INTEGER"], why: "Plain \"integer\" with no range means INT." },
        { spec: "positive integer", answers: ["INT UNSIGNED", "INTEGER UNSIGNED"],
          why: "\"Positive integer\" means INT UNSIGNED. (UNSIGNED still allows 0; add CHECK (col > 0) if 0 isn't allowed.)" },
      ]);
    },
    function money() {
      var whole = int(2, 6), max = Math.pow(10, whole) - 1;
      var p = whole + 2;
      return { spec: "decimal value up to $" + max.toLocaleString("en-US") + ".99, with 2 digits for cents",
               answers: ["DECIMAL(" + p + ",2)", "NUMERIC(" + p + ",2)"],
               why: "Count the digits: " + whole + " before the point and 2 after is " + p + " in all, so DECIMAL(" + p + ",2)." };
    },
    function digits() {
      var p = int(3, 9), s = int(1, Math.min(4, p - 1));
      var max = "9".repeat(p - s) + "." + "9".repeat(s);
      return pick([
        { spec: "number with " + p + " significant digits and " + s + " decimal place" + (s === 1 ? "" : "s"),
          answers: ["DECIMAL(" + p + "," + s + ")", "NUMERIC(" + p + "," + s + ")"],
          why: "DECIMAL(p,s): p digits in all, s of them after the point (largest value " + max + ")." },
        { spec: "decimal number with " + p + " digits total and " + s + " decimal place" + (s === 1 ? "" : "s"),
          answers: ["DECIMAL(" + p + "," + s + ")", "NUMERIC(" + p + "," + s + ")"],
          why: "DECIMAL(p,s): p digits in all, s of them after the point (largest value " + max + ")." },
      ]);
    },
    function text() {
      var n = pick([2, 3, 5, 10, 15, 20, 30, 40, 50, 60, 100, 255]);
      return pick([
        { spec: "fixed-length string of " + n + " chars", answers: ["CHAR(" + n + ")"],
          why: "Fixed length means CHAR: every value is padded to " + n + " characters." },
        { spec: "variable-length string with max " + n + " chars", answers: ["VARCHAR(" + n + ")"],
          why: "Variable length means VARCHAR, sized to the longest allowed value." },
      ]);
    },
    function dates() {
      return pick([
        { spec: "date", answers: ["DATE"], why: "A date with no time is DATE." },
        { spec: "date and time", answers: ["DATETIME", "TIMESTAMP"], why: "A date with a time is DATETIME (TIMESTAMP also works)." },
      ]);
    },
  ];
  var WEIGHTS = [5, 3, 1, 2, 2, 2, 1]; // integers matter most on the assessment

  function next() {
    var bag = [];
    KINDS.forEach(function (k, i) { for (var j = 0; j < WEIGHTS[i]; j++) bag.push(k); });
    return pick(bag)();
  }

  function norm(s) { return String(s).toUpperCase().replace(/\s+/g, " ").replace(/\s*([(),])\s*/g, "$1").trim(); }

  /* ---------- Constraint wording: pick the SQL that matches a phrase ---------- */

  // [category, assessment-style phrase, the SQL it means, why]
  var CONSTRAINTS = [
    ["value", "State — fixed-length string of 2 chars, not NULL", "NOT NULL", "\"Not NULL\" (required) is NOT NULL."],
    ["value", "State — fixed-length string of 2 chars, default \"TX\"", "DEFAULT 'TX'", "\"Default v\" is DEFAULT v: the value a row gets when the INSERT leaves the column out."],
    ["value", "Rate — DECIMAL(5,2), default 45.00", "DEFAULT 45.00", "\"Default v\" is DEFAULT v."],
    ["value", "Breed — must be one of the following: Paint, Saddlebred", "CHECK (Breed IN ('Paint', 'Saddlebred'))", "\"Must be one of\" is a CHECK with IN and the allowed values."],
    ["value", "Height — must be ≥ 10.0 and ≤ 20.0", "CHECK (Height BETWEEN 10.0 AND 20.0)", "A range rule is a CHECK; BETWEEN includes both ends."],
    ["value", "Rate — must be from 20 to 150 (inclusive)", "CHECK (Rate BETWEEN 20 AND 150)", "\"From a to b (inclusive)\" is CHECK (... BETWEEN a AND b)."],
    ["value", "Quantity — must be greater than 0", "CHECK (Quantity > 0)", "A rule on the value is a CHECK. UNSIGNED alone still allows 0."],
    ["value", "BirthDate — date, must be ≥ Jan 1, 2015", "CHECK (BirthDate >= '2015-01-01')", "A rule on the value is a CHECK; write the date as a string."],
    ["value", "Email — no two students can have the same email", "UNIQUE", "\"No two rows can share a value\" is UNIQUE (NULLs are still allowed)."],
    ["key", "ID — integer, auto increment, primary key", "AUTO_INCREMENT PRIMARY KEY", "MySQL numbers the rows (AUTO_INCREMENT), and the column identifies each row (PRIMARY KEY)."],
    ["key", "CourseCode and Section together identify each row", "PRIMARY KEY (CourseCode, Section)", "Two columns that identify a row together are a composite primary key, written on its own line."],
    ["key", "HorseID — foreign key that references Horse(ID)", "FOREIGN KEY (HorseID) REFERENCES Horse(ID)", "A column that holds another table's key is a FOREIGN KEY ... REFERENCES."],
    ["action", "If a horse is deleted, its lessons are deleted too", "ON DELETE CASCADE", "Passing the delete on to the child rows is ON DELETE CASCADE."],
    ["action", "If a student is deleted, their lessons stay, with no student", "ON DELETE SET NULL", "Keeping the child rows but clearing the link is ON DELETE SET NULL (the column must allow NULL)."],
    ["action", "A patient who still has exams must not be deletable", "ON DELETE RESTRICT", "Refusing the delete is ON DELETE RESTRICT (also what happens with no rule)."],
    ["action", "If a team's code changes, its players' TeamCode should change automatically", "ON UPDATE CASCADE", "Following a change to the parent's key is ON UPDATE CASCADE."],
  ];

  function constraintPrompt() {
    var item = pick(CONSTRAINTS);
    var same = CONSTRAINTS.filter(function (c) { return c[0] === item[0] && c[2] !== item[2]; });
    var other = CONSTRAINTS.filter(function (c) { return c[0] !== item[0]; });
    var options = [item[2]];
    function add(from) {
      from = from.slice();
      while (options.length < 4 && from.length) {
        var c = from.splice(Math.floor(Math.random() * from.length), 1)[0];
        if (options.indexOf(c[2]) < 0) options.push(c[2]);
      }
    }
    add(same);
    add(other);
    options.sort(function () { return Math.random() - 0.5; });
    return { spec: item[1], answer: item[2], options: options, why: item[3] };
  }

  /* ---------- Saved score, one per mode ---------- */

  var MODES = {
    types: { label: "Column types", intro: "Type the MySQL type for this column spec." },
    constraints: { label: "Constraint wording", intro: "Pick the SQL this part of a spec turns into." },
  };
  var empty = function () { return { right: 0, total: 0, streak: 0, best: 0 }; };
  var stats = { mode: "types", types: empty(), constraints: empty() };
  try {
    var saved = JSON.parse(localStorage.getItem(KEY) || "null");
    if (saved && saved.types) stats = saved;
    else if (saved && typeof saved.total === "number") stats.types = saved;  // the single-mode format
  } catch (e) { /* storage blocked */ }
  if (!MODES[stats.mode]) stats.mode = "types";
  function save() { try { localStorage.setItem(KEY, JSON.stringify(stats)); } catch (e) { /* storage blocked */ } }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  /* ---------- UI ---------- */

  root.textContent = "";
  var modes = el("div", "drill-modes");
  modes.setAttribute("role", "group");
  modes.setAttribute("aria-label", "Drill");
  var modeButtons = {};
  Object.keys(MODES).forEach(function (m) {
    var b = el("button", "drill-mode", MODES[m].label);
    b.type = "button";
    b.addEventListener("click", function () { setMode(m); });
    modeButtons[m] = b;
    modes.appendChild(b);
  });

  var card = el("div", "drill-card");
  var intro = el("p", "drill-intro");
  var prompt = el("p", "drill-prompt");
  var label = el("label", "drill-label", "MySQL type");
  var input = el("input", "drill-input");
  input.type = "text";
  input.id = "drill-answer";
  input.autocomplete = "off";
  input.spellcheck = false;
  input.setAttribute("autocapitalize", "characters");
  input.placeholder = "e.g. SMALLINT UNSIGNED";
  label.htmlFor = input.id;
  var choices = el("div", "drill-choices");
  choices.setAttribute("role", "group");
  choices.setAttribute("aria-label", "Choices");
  var buttons = el("div", "drill-buttons");
  var checkBtn = el("button", "md-button md-button--primary", "Check");
  var nextBtn = el("button", "md-button", "Next");
  var showBtn = el("button", "md-button", "Show answer");
  [checkBtn, nextBtn, showBtn].forEach(function (b) { b.type = "button"; buttons.appendChild(b); });
  var feedback = el("p", "drill-feedback");
  feedback.setAttribute("role", "status");
  feedback.setAttribute("aria-live", "polite");
  var score = el("p", "drill-score");
  var reset = el("button", "drill-reset", "Reset score");
  reset.type = "button";
  card.append(intro, prompt, label, input, choices, buttons, feedback, score, reset);
  root.append(modes, card);

  var current = null, answered = false;

  function mine() { return stats[stats.mode]; }

  function showScore() {
    var s = mine();
    score.textContent = s.total
      ? s.right + " of " + s.total + " right · streak " + s.streak + " · best streak " + s.best
      : "Answer to start a streak.";
  }

  function record(ok) {
    var s = mine();
    s.total += 1;
    if (ok) { s.right += 1; s.streak += 1; s.best = Math.max(s.best, s.streak); }
    else s.streak = 0;
  }

  function finish(ok, text) {
    answered = true;
    feedback.textContent = (ok ? "✓ " : "✗ ") + text;
    feedback.className = "drill-feedback " + (ok ? "drill-feedback--ok" : "drill-feedback--bad");
    checkBtn.disabled = true;
    showBtn.disabled = true;
    input.disabled = true;
    choices.querySelectorAll("button").forEach(function (b) {
      b.disabled = true;
      if (b.dataset.answer === "1") b.classList.add("drill-choice--answer");
    });
    nextBtn.focus({ preventScroll: true });
    showScore();
    save();
  }

  function load() {
    var types = stats.mode === "types";
    current = types ? next() : constraintPrompt();
    answered = false;
    intro.textContent = MODES[stats.mode].intro;
    prompt.textContent = "";
    prompt.append(types ? "Column spec: " : "The spec says: ");
    prompt.appendChild(el("strong", null, "“" + current.spec + "”"));
    label.hidden = input.hidden = checkBtn.hidden = !types;
    choices.hidden = types;
    input.value = "";
    input.disabled = false;
    choices.textContent = "";
    if (!types) {
      current.options.forEach(function (opt) {
        var b = el("button", "drill-choice", opt);
        b.type = "button";
        if (opt === current.answer) b.dataset.answer = "1";
        b.addEventListener("click", function () {
          if (answered) return;
          var ok = opt === current.answer;
          if (!ok) b.classList.add("drill-choice--wrong");
          record(ok);
          finish(ok, (ok ? "Right. " : "It's " + current.answer + ". ") + current.why);
        });
        choices.appendChild(b);
      });
    }
    feedback.textContent = "";
    feedback.className = "drill-feedback";
    checkBtn.disabled = false;
    showBtn.disabled = false;
    showScore();
    (types ? input : choices.querySelector("button")).focus({ preventScroll: true });
  }

  function setMode(m) {
    stats.mode = m;
    Object.keys(modeButtons).forEach(function (k) { modeButtons[k].setAttribute("aria-pressed", String(k === m)); });
    save();
    load();
  }

  checkBtn.addEventListener("click", function () {
    if (answered || stats.mode !== "types") return;
    if (!input.value.trim()) {
      feedback.textContent = "Type a MySQL type first.";
      feedback.className = "drill-feedback drill-feedback--bad";
      input.focus();
      return;
    }
    var ok = current.answers.some(function (a) { return norm(a) === norm(input.value); });
    record(ok);
    finish(ok, (ok ? "Right. " : "The answer is " + current.answers[0] + ". ") + current.why);
  });
  showBtn.addEventListener("click", function () {
    if (answered) return;
    record(false);
    finish(false, "The answer is " + (current.answers ? current.answers[0] : current.answer) + ". " + current.why);
  });
  nextBtn.addEventListener("click", load);
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); (answered ? nextBtn : checkBtn).click(); }
  });
  reset.addEventListener("click", function () {
    stats[stats.mode] = empty();
    save();
    showScore();
  });

  setMode(stats.mode);
})();
