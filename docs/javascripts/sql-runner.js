/* In-browser SQL runner for D427 Part 1 (SQLite via sql.js).
   hooks/sql_runner.py puts the sample data and solution queries on the page as
   JSON (#sql-runner-data). This adds a "Try it" box to every exercise that has a
   solution. sql.js (~700 KB) is only downloaded on the first Run or Check. */
(function () {
  "use strict";

  var SQLJS = "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.14.1/";
  var STORAGE = "d427-sql:";

  var dataEl = document.getElementById("sql-runner-data");
  if (!dataEl) return;
  var DATA = JSON.parse(dataEl.textContent);

  /* ---------- Loading SQLite ---------- */

  var enginePromise = null;

  function loadEngine() {
    if (enginePromise) return enginePromise;
    enginePromise = new Promise(function (resolve, reject) {
      var script = document.createElement("script");
      script.src = SQLJS + "sql-wasm.min.js";
      script.crossOrigin = "anonymous";
      script.onload = function () {
        window.initSqlJs({ locateFile: function (file) { return SQLJS + file; } })
          .then(function (SQL) {
            // Build the sample data once; every run starts from a copy of it.
            var db = new SQL.Database();
            db.exec(DATA.setup);
            var image = db.export();
            db.close();
            resolve({ SQL: SQL, image: image });
          }, reject);
      };
      script.onerror = function () { reject(new Error("Couldn't download SQLite (sql.js). Check your connection.")); };
      document.head.appendChild(script);
    });
    enginePromise.catch(function () { enginePromise = null; });
    return enginePromise;
  }

  function freshDb(engine) {
    var db = new engine.SQL.Database(engine.image);
    addMySqlFunctions(db);
    return db;
  }

  /* ---------- MySQL compatibility ---------- */

  function parseDate(value) {
    if (value === null || value === undefined) return null;
    var m = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?/.exec(String(value));
    if (!m) return null;
    return {
      y: +m[1], mo: +m[2], d: +m[3], h: +(m[4] || 0), mi: +(m[5] || 0), s: +(m[6] || 0),
      ms: Date.UTC(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0)),
    };
  }

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  var DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July",
                "August", "September", "October", "November", "December"];

  function datePart(fn) {
    return function (v) { var d = parseDate(v); return d ? fn(d) : null; };
  }

  function timestampDiff(unit, a, b) {
    var x = parseDate(a), y = parseDate(b);
    if (!x || !y) return null;
    unit = String(unit).toUpperCase();
    var spans = { SECOND: 1e3, MINUTE: 6e4, HOUR: 36e5, DAY: 864e5, WEEK: 6048e5 };
    if (spans[unit]) return Math.trunc((y.ms - x.ms) / spans[unit]);
    var months = (y.y - x.y) * 12 + (y.mo - x.mo);
    // Only count a month once it is complete, like MySQL.
    var restX = ((x.d * 24 + x.h) * 60 + x.mi) * 60 + x.s;
    var restY = ((y.d * 24 + y.h) * 60 + y.mi) * 60 + y.s;
    if (months > 0 && restY < restX) months--;
    if (months < 0 && restY > restX) months++;
    if (unit === "MONTH") return months;
    if (unit === "QUARTER") return Math.trunc(months / 3);
    if (unit === "YEAR") return Math.trunc(months / 12);
    throw new Error("TIMESTAMPDIFF unit " + unit + " isn't supported here");
  }

  function variadic(fn) {
    // sql.js registers func.length as the argument count; -1 means "any".
    Object.defineProperty(fn, "length", { value: -1 });
    return fn;
  }

  function str(v) { return v === null ? null : String(v); }

  var FUNCTIONS = {
    // MySQL's CONCAT returns NULL if any argument is NULL (SQLite's skips NULLs).
    CONCAT: variadic(function () {
      var args = Array.prototype.slice.call(arguments);
      return args.some(function (a) { return a === null; }) ? null : args.join("");
    }),
    CONCAT_WS: variadic(function () {
      var args = Array.prototype.slice.call(arguments);
      if (args[0] === null) return null;
      return args.slice(1).filter(function (a) { return a !== null; }).join(args[0]);
    }),
    MYSQL_IF: function (cond, a, b) { return cond !== null && Number(cond) !== 0 ? a : b; },
    MYSQL_LEFT: function (s, n) { return s === null || n === null ? null : String(s).slice(0, Math.max(0, n)); },
    MYSQL_RIGHT: function (s, n) { return s === null || n === null ? null : (n > 0 ? String(s).slice(-n) : ""); },
    CHAR_LENGTH: function (s) { return s === null ? null : String(s).length; },
    LOCATE: function (sub, s) { return sub === null || s === null ? null : String(s).indexOf(String(sub)) + 1; },
    LCASE: function (s) { return s === null ? null : String(s).toLowerCase(); },
    UCASE: function (s) { return s === null ? null : String(s).toUpperCase(); },
    TRUNCATE: function (x, d) { if (x === null || d === null) return null; var f = Math.pow(10, d); return Math.trunc(x * f) / f; },
    MOD: function (a, b) { return a === null || b === null || Number(b) === 0 ? null : a % b; },
    FLOOR: function (x) { return x === null ? null : Math.floor(x); },
    CEIL: function (x) { return x === null ? null : Math.ceil(x); },
    CEILING: function (x) { return x === null ? null : Math.ceil(x); },
    POWER: function (a, b) { return a === null || b === null ? null : Math.pow(a, b); },
    POW: function (a, b) { return a === null || b === null ? null : Math.pow(a, b); },
    SQRT: function (x) { return x === null || x < 0 ? null : Math.sqrt(x); },
    DATEDIFF: function (a, b) {
      var x = parseDate(a), y = parseDate(b);
      return x && y ? Math.round((Date.UTC(x.y, x.mo - 1, x.d) - Date.UTC(y.y, y.mo - 1, y.d)) / 864e5) : null;
    },
    TIMESTAMPDIFF: timestampDiff,
    YEAR: datePart(function (d) { return d.y; }),
    MONTH: datePart(function (d) { return d.mo; }),
    DAY: datePart(function (d) { return d.d; }),
    DAYOFMONTH: datePart(function (d) { return d.d; }),
    HOUR: datePart(function (d) { return d.h; }),
    MINUTE: datePart(function (d) { return d.mi; }),
    SECOND: datePart(function (d) { return d.s; }),
    QUARTER: datePart(function (d) { return Math.ceil(d.mo / 3); }),
    DAYOFWEEK: datePart(function (d) { return new Date(d.ms).getUTCDay() + 1; }),
    DAYNAME: datePart(function (d) { return DAYS[new Date(d.ms).getUTCDay()]; }),
    MONTHNAME: datePart(function (d) { return MONTHS[d.mo - 1]; }),
    CURDATE: function () { var n = new Date(); return n.getFullYear() + "-" + pad(n.getMonth() + 1) + "-" + pad(n.getDate()); },
    NOW: function () {
      var n = new Date();
      return FUNCTIONS.CURDATE() + " " + pad(n.getHours()) + ":" + pad(n.getMinutes()) + ":" + pad(n.getSeconds());
    },
  };

  function addMySqlFunctions(db) {
    Object.keys(FUNCTIONS).forEach(function (name) { db.create_function(name, FUNCTIONS[name]); });
  }

  // Strings, quoted names, and comments, so the rewrites below only touch SQL code.
  var TOKENS = /('(?:[^'\\]|''|\\.)*'|"(?:[^"\\]|""|\\.)*"|`[^`]*`|--[^\n]*|#[^\n]*|\/\*[\s\S]*?\*\/)/;

  function toSqlite(sql) {
    return sql.split(TOKENS).map(function (part, i) {
      if (i % 2) {
        if (part[0] === "#") return "--" + part.slice(1);
        // MySQL reads "text" as a string; SQLite would look for a column first.
        if (part[0] === '"') return "'" + part.slice(1, -1).replace(/""/g, '"').replace(/'/g, "''") + "'";
        return part;
      }
      return part
        .replace(/\bTIMESTAMPDIFF\s*\(\s*([A-Za-z]+)\s*,/gi, "TIMESTAMPDIFF('$1',")
        // LEFT, RIGHT, and IF are keywords in SQLite, so they can't be function names.
        .replace(/\bLEFT\s*\(/gi, "MYSQL_LEFT(")
        .replace(/\bRIGHT\s*\(/gi, "MYSQL_RIGHT(")
        .replace(/\bIF\s*\(/gi, "MYSQL_IF(");
    }).join("");
  }

  /* ---------- Running and checking ---------- */

  // Runs every statement. Returns {results: [{columns, rows, ordered}], changed, error},
  // with a result for each statement that returns rows, up to the first error.
  function run(engine, sql) {
    var db = freshDb(engine);
    var results = [], changed = 0, error = null;
    try {
      for (var it = db.iterateStatements(toSqlite(sql)), step = it.next(); !step.done; step = it.next()) {
        var stmt = step.value, columns = stmt.getColumnNames(), rows = [];
        while (stmt.step()) rows.push(stmt.get());
        if (columns.length) {
          results.push({ columns: columns, rows: rows, ordered: sortsOutput(stmt.getSQL()) });
        } else {
          changed += db.getRowsModified();
        }
      }
    } catch (err) {
      error = err && err.message ? err.message : String(err);
    } finally {
      db.close();
    }
    return { results: results, changed: changed, error: error };
  }

  // True if the statement has its own ORDER BY (not just one inside a subquery).
  function sortsOutput(sql) {
    var outer = sql.replace(/--[^\n]*/g, "");
    while (/\([^()]*\)/.test(outer)) outer = outer.replace(/\([^()]*\)/g, "");
    return /\border\s+by\b/i.test(outer);
  }

  function sameValue(a, b) {
    if (a === null || b === null) return a === b;
    var x = Number(a), y = Number(b);
    if (a !== "" && b !== "" && !isNaN(x) && !isNaN(y)) {
      return Math.abs(x - y) <= 1e-9 * Math.max(1, Math.abs(x), Math.abs(y));
    }
    return String(a) === String(b);
  }

  function sameRows(r1, r2) {
    if (r1.length !== r2.length) return false;
    for (var i = 0; i < r1.length; i++) {
      for (var j = 0; j < r1[i].length; j++) if (!sameValue(r1[i][j], r2[i][j])) return false;
    }
    return true;
  }

  function rowKey(row) {
    return JSON.stringify(row.map(function (v) { return typeof v === "number" ? +v.toPrecision(9) : v; }));
  }

  function sorted(rows) {
    return rows.slice().sort(function (a, b) { var x = rowKey(a), y = rowKey(b); return x < y ? -1 : x > y ? 1 : 0; });
  }

  // "match", "order" (right rows, wrong order), or a reason it doesn't match.
  function compare(mine, expected) {
    if (mine.columns.length !== expected.columns.length) {
      return "Expected " + plural(expected.columns.length, "column") + ", yours has " + mine.columns.length + ".";
    }
    if (mine.rows.length !== expected.rows.length) {
      return "Expected " + plural(expected.rows.length, "row") + ", yours has " + mine.rows.length + ".";
    }
    if (expected.ordered && sameRows(mine.rows, expected.rows)) return "match";
    if (sameRows(sorted(mine.rows), sorted(expected.rows))) return expected.ordered ? "order" : "match";
    return "Same number of rows and columns, but some values are different.";
  }

  function plural(n, word) { return n + " " + word + (n === 1 ? "" : "s"); }

  var expectedCache = {};

  function expectedFor(engine, label) {
    if (!expectedCache[label]) {
      var seen = {};
      // A solution can show more than one query (a, b, "then"...). Drop repeats:
      // two fixes that give the same rows only need to be matched once.
      expectedCache[label] = run(engine, DATA.solutions[label]).results.filter(function (r) {
        var key = r.columns.length + ":" + sorted(r.rows).map(rowKey).join();
        if (seen[key]) return false;
        seen[key] = true;
        return true;
      });
    }
    return expectedCache[label];
  }

  function check(engine, label, mine) {
    var expected = expectedFor(engine, label);
    var verdicts = expected.map(function (exp) {
      var best = null;
      mine.forEach(function (m) {
        var v = compare(m, exp);
        if (v === "match" || (v === "order" && best !== "match") || best === null) best = v;
      });
      return best || "Run a SELECT first.";
    });
    var matched = verdicts.filter(function (v) { return v === "match"; }).length;
    if (matched === expected.length) {
      return { ok: true, text: expected.length > 1
        ? "Matches all " + expected.length + " of the solution's results."
        : "Matches the solution's result." };
    }
    if (expected.length === 1) {
      return { ok: false, text: verdicts[0] === "order"
        ? "Right rows, but in a different order. Check your ORDER BY."
        : verdicts[0] };
    }
    var missing = expected.filter(function (_, i) { return verdicts[i] !== "match"; }).map(function (r) {
      return plural(r.rows.length, "row") + " × " + plural(r.columns.length, "column");
    });
    return { ok: false, text: "This exercise has " + expected.length + " queries to write. " + matched +
      (matched === 1 ? " of yours matches" : " of yours match") + " so far. Still missing a result with " + missing.join(", and one with ") + "." };
  }

  /* ---------- UI ---------- */

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function renderTable(result, index, count) {
    var wrap = el("div", "sql-result");
    var caption = (count > 1 ? "Result " + (index + 1) + " · " : "") + plural(result.rows.length, "row");
    wrap.appendChild(el("div", "sql-result__caption", caption));
    var scroll = el("div", "sql-result__scroll");
    var table = el("table", "sql-table");
    var head = table.createTHead().insertRow();
    result.columns.forEach(function (c) { head.appendChild(el("th", null, c)); });
    var body = table.createTBody();
    result.rows.slice(0, 500).forEach(function (row) {
      var tr = body.insertRow();
      row.forEach(function (v) {
        var td = tr.insertCell();
        if (v === null) td.appendChild(el("span", "sql-null", "NULL"));
        else td.textContent = v instanceof Uint8Array ? "(binary)" : String(v);
        if (typeof v === "number") td.className = "sql-num";
      });
    });
    scroll.appendChild(table);
    wrap.appendChild(scroll);
    if (result.rows.length > 500) wrap.appendChild(el("div", "sql-result__caption", "Showing the first 500 rows."));
    return wrap;
  }

  function message(kind, text) {
    var m = el("div", "sql-message sql-message--" + kind);
    m.textContent = text;
    return m;
  }

  function build(label) {
    var box = el("details", "sql-try");
    box.appendChild(el("summary", null, "Try it (SQLite)"));
    var runner = el("div", "sql-runner");

    var editor = el("textarea", "sql-editor");
    editor.spellcheck = false;
    editor.wrap = "off";
    editor.setAttribute("autocapitalize", "off");
    editor.setAttribute("autocomplete", "off");
    editor.setAttribute("aria-label", "SQL for exercise " + label);
    editor.placeholder = "SELECT ...   (Ctrl+Enter to run)";
    try { editor.value = localStorage.getItem(STORAGE + label) || ""; } catch (e) { /* storage blocked */ }

    var actions = el("div", "sql-actions");
    var runBtn = el("button", "md-button md-button--primary", "Run");
    var checkBtn = el("button", "md-button", "Check");
    var clearBtn = el("button", "md-button", "Clear");
    [runBtn, checkBtn, clearBtn].forEach(function (b) { b.type = "button"; actions.appendChild(b); });
    var output = el("div", "sql-output");
    output.setAttribute("aria-live", "polite");

    runner.appendChild(editor);
    runner.appendChild(actions);
    runner.appendChild(output);
    box.appendChild(runner);

    function grow() {
      editor.rows = Math.max(3, Math.min(20, editor.value.split("\n").length + 1));
    }
    grow();

    function go(withCheck) {
      var sql = editor.value;
      if (!sql.trim()) {
        output.replaceChildren(message("info", "Type a query first."));
        return;
      }
      output.replaceChildren(message("info", "Loading SQLite…"));
      runBtn.disabled = checkBtn.disabled = true;
      loadEngine().then(function (engine) {
        var nodes = [], out = run(engine, sql);
        if (withCheck && !out.error) {
          var verdict = check(engine, label, out.results);
          nodes.push(message(verdict.ok ? "ok" : "bad", (verdict.ok ? "✓ " : "✗ ") + verdict.text));
          if (verdict.ok) {
            // progress.js ticks this exercise's Done box.
            document.dispatchEvent(new CustomEvent("d427:solved", { detail: { label: label } }));
          }
        }
        out.results.forEach(function (r, i) { nodes.push(renderTable(r, i, out.results.length)); });
        if (out.error) {
          nodes.push(message("bad", "SQLite error: " + out.error));
        } else if (!out.results.length) {
          nodes.push(message("info", out.changed
            ? "Done: " + plural(out.changed, "row") + " changed (only for this run)."
            : "Done. The query returned no result table."));
        }
        output.replaceChildren.apply(output, nodes);
      }, function (err) {
        output.replaceChildren(message("bad", err.message || String(err)));
      }).then(function () {
        runBtn.disabled = checkBtn.disabled = false;
      });
    }

    runBtn.addEventListener("click", function () { go(false); });
    checkBtn.addEventListener("click", function () { go(true); });
    clearBtn.addEventListener("click", function () {
      editor.value = "";
      output.replaceChildren();
      try { localStorage.removeItem(STORAGE + label); } catch (e) { /* storage blocked */ }
      grow();
      editor.focus();
    });
    editor.addEventListener("input", function () {
      grow();
      try { localStorage.setItem(STORAGE + label, editor.value); } catch (e) { /* storage blocked */ }
    });
    editor.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        go(false);
      } else if (e.key === "Tab" && !e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        editor.setRangeText("  ", editor.selectionStart, editor.selectionEnd, "end");
      }
    });
    box.addEventListener("toggle", function () { if (box.open) editor.focus({ preventScroll: true }); });
    return box;
  }

  // Each exercise is a list item that starts with its bold label, like **1.1**.
  document.querySelectorAll(".md-content li").forEach(function (li) {
    var first = li.firstElementChild;
    var strong = first && first.tagName === "P" ? first.firstElementChild : null;
    if (!strong || strong.tagName !== "STRONG" || first.firstChild !== strong) return;
    var label = strong.textContent.trim();
    var before = li.querySelector(":scope > details");
    var skip = DATA.skip || {};
    if (Object.prototype.hasOwnProperty.call(skip, label)) {
      var note = document.createElement("p");
      note.className = "sql-runner-skip";
      note.textContent = "Try it (SQLite) isn't available here. " + skip[label];
      li.insertBefore(note, before);
      return;
    }
    if (!Object.prototype.hasOwnProperty.call(DATA.solutions, label)) return;
    li.insertBefore(build(label), before);
  });
})();
