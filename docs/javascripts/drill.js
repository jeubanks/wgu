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

  var stats = { right: 0, total: 0, streak: 0, best: 0 };
  try { var saved = JSON.parse(localStorage.getItem(KEY) || "null"); if (saved) stats = saved; } catch (e) { /* storage blocked */ }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(stats)); } catch (e) { /* storage blocked */ } }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  root.textContent = "";
  var card = el("div", "drill-card");
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
  card.append(prompt, label, input, buttons, feedback, score, reset);
  root.appendChild(card);

  var current = null, answered = false;

  function showScore() {
    score.textContent = stats.total
      ? stats.right + " of " + stats.total + " right · streak " + stats.streak + " · best streak " + stats.best
      : "Answer to start a streak.";
  }

  function load() {
    current = next();
    answered = false;
    prompt.textContent = "";
    prompt.append("Column spec: ");
    prompt.appendChild(el("strong", null, "“" + current.spec + "”"));
    input.value = "";
    input.disabled = false;
    feedback.textContent = "";
    feedback.className = "drill-feedback";
    checkBtn.disabled = false;
    showBtn.disabled = false;
    input.focus({ preventScroll: true });
  }

  function finish(ok, text) {
    answered = true;
    feedback.textContent = (ok ? "✓ " : "✗ ") + text;
    feedback.className = "drill-feedback " + (ok ? "drill-feedback--ok" : "drill-feedback--bad");
    checkBtn.disabled = true;
    showBtn.disabled = true;
    input.disabled = true;
    nextBtn.focus({ preventScroll: true });
    showScore();
    save();
  }

  checkBtn.addEventListener("click", function () {
    if (answered) return;
    if (!input.value.trim()) {
      feedback.textContent = "Type a MySQL type first.";
      feedback.className = "drill-feedback drill-feedback--bad";
      input.focus();
      return;
    }
    var ok = current.answers.some(function (a) { return norm(a) === norm(input.value); });
    stats.total += 1;
    if (ok) { stats.right += 1; stats.streak += 1; stats.best = Math.max(stats.best, stats.streak); }
    else stats.streak = 0;
    finish(ok, (ok ? "Right. " : "The answer is " + current.answers[0] + ". ") + current.why);
  });
  showBtn.addEventListener("click", function () {
    if (answered) return;
    stats.total += 1;
    stats.streak = 0;
    finish(false, "The answer is " + current.answers[0] + ". " + current.why);
  });
  nextBtn.addEventListener("click", load);
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); (answered ? nextBtn : checkBtn).click(); }
  });
  card.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && answered && e.target !== input && e.target.tagName !== "BUTTON") { e.preventDefault(); load(); }
  });
  reset.addEventListener("click", function () {
    stats = { right: 0, total: 0, streak: 0, best: 0 };
    save();
    showScore();
  });

  showScore();
  load();
})();
