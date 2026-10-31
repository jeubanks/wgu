/* In-browser SQL runner for D427 (SQLite via sql.js).
   hooks/sql_runner.py puts the sample data and solution queries on the page as
   JSON (#sql-runner-data). This adds a "Try it" box to every exercise that has a
   solution. sql.js (~700 KB) is only downloaded on the first Run or Check.
   In the sections listed in DATA.changes, the exercises change data: each box
   starts from the earlier exercises' solutions, and Check compares the tables. */
(function () {
  "use strict";

  var SQLJS = "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.14.1/";
  // Pinned hashes: the browser refuses the script if it doesn't match (SRI; cdnjs
  // publishes the same value), and the runner checks the .wasm itself before using
  // it (it matches npm's sql.js@1.14.1). Update both when changing the version.
  var SQLJS_SCRIPT_SRI = "sha512-X+JPrklGBa10Bd2gGqA4zJdu/ooxejxmGCCHFZlvfvEsOYYqV/Ke8T+ph3SvE77SdVvK9c5vL1IGnVCSnc1yqg==";
  var SQLJS_WASM_SHA256 = "438c88f666dc054ce4e9395f80fe9db4218b1a3c379960454880f048a7898aed";
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
      script.integrity = SQLJS_SCRIPT_SRI;
      script.crossOrigin = "anonymous";
      script.onload = function () {
        fetchWasm()
          .then(function (wasm) { return window.initSqlJs({ wasmBinary: wasm }); })
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

  // Download sql.js's .wasm and check it against the pinned SHA-256 before using it.
  function fetchWasm() {
    return fetch(SQLJS + "sql-wasm.wasm", { mode: "cors", credentials: "omit" })
      .then(function (res) {
        if (!res.ok) throw new Error("Couldn't download SQLite (sql.js). Check your connection.");
        return res.arrayBuffer();
      })
      .then(function (buf) {
        return crypto.subtle.digest("SHA-256", buf).then(function (digest) {
          var hex = Array.prototype.map.call(new Uint8Array(digest), function (b) {
            return ("0" + b.toString(16)).slice(-2);
          }).join("");
          if (hex !== SQLJS_WASM_SHA256) throw new Error("SQLite (sql.js) didn't match its pinned checksum, so it wasn't run.");
          return buf;
        });
      });
  }

  // A copy of the sample data, or of a later starting point (startImage).
  function freshDb(engine, image) {
    var db = new engine.SQL.Database(image || engine.image);
    db.run("PRAGMA foreign_keys = ON");  // off by default in SQLite; MySQL always checks them
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

  // CREATE TABLE, MySQL -> SQLite. Keep in step with hooks/sqlite_setup.py.
  var INT = "(?:TINY|SMALL|MEDIUM|BIG)?INT(?:EGER)?(?:\\s*\\(\\d+\\))?(?:\\s+UNSIGNED)?";
  var TYPES = [
    // An AUTO_INCREMENT key becomes AUTOINCREMENT, which, like MySQL, never hands
    // out a number again after its row is deleted (the counter is sqlite_sequence).
    [new RegExp("\\b" + INT + "(\\s+NOT\\s+NULL)?\\s+(?:AUTO_INCREMENT\\s+PRIMARY\\s+KEY|PRIMARY\\s+KEY\\s+AUTO_INCREMENT)\\b", "gi"), "INTEGER PRIMARY KEY AUTOINCREMENT$1"],
    [/\bAUTO_INCREMENT\b/gi, ""],
    [new RegExp("\\b" + INT + "\\b", "gi"), "INTEGER"],
    [/\b(?:DECIMAL|NUMERIC|FLOAT|DOUBLE)(?:\(\d+(?:,\s*\d+)?\))?(?:\s+UNSIGNED)?/gi, "REAL"],
    [/\b(?:VAR)?CHAR\(\d+\)/gi, "TEXT COLLATE NOCASE"],
    [/\b(?:DATETIME|DATE|TIMESTAMP)\b/gi, "TEXT"],
  ];
  var TABLE_KEY = /,\s*PRIMARY\s+KEY\s*\(\s*`?(\w+)`?\s*\)/i;

  function autoKeyAtTableLevel(body) {
    var key = TABLE_KEY.exec(body);
    if (!key) return body;
    var column = new RegExp("(\\b" + key[1] + "`?\\s+)" + INT + "(\\s+NOT\\s+NULL)?\\s+AUTO_INCREMENT\\b", "i");
    if (!column.test(body)) return body;
    body = body.replace(column, "$1INTEGER PRIMARY KEY AUTOINCREMENT$2");
    return body.replace(TABLE_KEY, "");
  }

  function createTables(sql) {
    var out = "", at = 0, re = /\bCREATE\s+TABLE\b/gi, m;
    while ((m = re.exec(sql))) {
      if (m.index < at) continue;
      var start = sql.indexOf("(", re.lastIndex);
      if (start < 0) break;
      var depth = 0, end = start;
      for (; end < sql.length; end++) {
        if (sql[end] === "(") depth++;
        else if (sql[end] === ")" && --depth === 0) break;
      }
      var body = autoKeyAtTableLevel(sql.slice(start, end + 1));
      TYPES.forEach(function (t) { body = body.replace(t[0], t[1]); });
      var stop = sql.indexOf(";", end);
      if (stop < 0) stop = sql.length;
      var options = /^\s*(ENGINE|DEFAULT|CHARSET|COLLATE|AUTO_INCREMENT)\b/i.test(sql.slice(end + 1, stop));
      out += sql.slice(at, start) + body;
      at = options ? stop : end + 1;
      re.lastIndex = at;
    }
    return out + sql.slice(at);
  }

  function toSqlite(sql) {
    return createTables(sql.split(TOKENS).map(function (part, i) {
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
        .replace(/\bIF\s*\(/gi, "MYSQL_IF(")
        // SQLite has no TRUNCATE: empty the table and restart its AUTO_INCREMENT counter.
        .replace(/\bTRUNCATE\s+(?:TABLE\s+)?([A-Za-z_]\w*)\s*(?=;|$)/gi,
          "DELETE FROM $1; DELETE FROM sqlite_sequence WHERE name = '$1'");
    }).join(""));
  }

  /* ---------- Running and checking ---------- */

  // Runs every statement. Returns {results: [{columns, rows, ordered}], changed, error},
  // with a result for each statement that returns rows, up to the first error.
  // With keep, the database stays open as .db, for Check to look at the tables.
  function run(engine, sql, image, keep) {
    var db = freshDb(engine, image);
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
      if (!keep) db.close();
    }
    return { results: results, changed: changed, error: error, db: keep ? db : null };
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

  // Rows in one result and not the other, counting repeats (a multiset difference).
  function diffRows(mine, expected) {
    var left = {};
    expected.rows.forEach(function (r) { var k = rowKey(r); left[k] = (left[k] || 0) + 1; });
    var extra = mine.rows.filter(function (r) {
      var k = rowKey(r);
      if (left[k]) { left[k] -= 1; return false; }
      return true;
    });
    var still = {};
    Object.keys(left).forEach(function (k) { still[k] = left[k]; });
    var missing = expected.rows.filter(function (r) {
      var k = rowKey(r);
      if (still[k]) { still[k] -= 1; return true; }
      return false;
    });
    return { columns: mine.columns, expColumns: expected.columns, missing: missing, extra: extra };
  }

  // The closest pair of (your result, an unmatched expected result) with the same
  // number of columns: the one with the fewest differing rows. Null if none line up.
  function bestDiff(mine, expected, verdicts) {
    var best = null;
    expected.forEach(function (exp, i) {
      if (verdicts[i] === "match" || verdicts[i] === "order") return;
      mine.forEach(function (m) {
        if (m.columns.length !== exp.columns.length) return;
        var d = diffRows(m, exp);
        if (!d.missing.length && !d.extra.length) return;
        if (!best || d.missing.length + d.extra.length < best.missing.length + best.extra.length) best = d;
      });
    });
    return best;
  }

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

  function ordinal(n) { return n + (n % 10 === 1 && n % 100 !== 11 ? "st" : n % 10 === 2 && n % 100 !== 12 ? "nd" : n % 10 === 3 && n % 100 !== 13 ? "rd" : "th"); }

  function check(engine, label, mine) {
    var expected = expectedFor(engine, label);
    // Pair each expected result with a different one of yours: exact matches first,
    // then "right rows, wrong order". One result of yours can't count twice.
    var pairedWith = expected.map(function () { return -1; });
    var used = mine.map(function () { return false; });
    var verdicts = expected.map(function () { return null; });
    ["match", "order"].forEach(function (want) {
      expected.forEach(function (exp, i) {
        if (pairedWith[i] >= 0) return;
        for (var j = 0; j < mine.length; j++) {
          if (!used[j] && compare(mine[j], exp) === want) {
            pairedWith[i] = j; used[j] = true; verdicts[i] = want;
            return;
          }
        }
      });
    });
    // What's left: the reason the closest unused result of yours doesn't match.
    expected.forEach(function (exp, i) {
      if (verdicts[i]) return;
      var free = mine.filter(function (_, j) { return !used[j]; });
      verdicts[i] = free.length ? compare(free[0], exp) : (mine.length ? null : "Run a SELECT first.");
    });
    var unused = mine.filter(function (_, j) { return !used[j]; });
    var diff = bestDiff(unused, expected, verdicts);
    var matched = verdicts.filter(function (v) { return v === "match"; }).length;

    if (matched === expected.length) {
      return { ok: true, text: expected.length > 1
        ? "Matches all " + expected.length + " of the solution's results."
        : "Matches the solution's result." };
    }
    if (expected.length === 1) {
      return { ok: false, diff: diff, text: verdicts[0] === "order"
        ? "Right rows, but in a different order. Check your ORDER BY."
        : verdicts[0] || "Run a SELECT first." };
    }
    var parts = [];
    expected.forEach(function (exp, i) {
      if (pairedWith[i] < 0) return;
      parts.push("your result " + (pairedWith[i] + 1) + (verdicts[i] === "order"
        ? " has the solution's " + ordinal(i + 1) + " rows, but in a different order"
        : " matches the solution's " + ordinal(i + 1)));
    });
    var missing = [];
    expected.forEach(function (exp, i) {
      if (pairedWith[i] < 0) missing.push("its " + ordinal(i + 1) + " (" + plural(exp.rows.length, "row") + " × " +
        plural(exp.columns.length, "column") + ")");
    });
    var text = "This exercise has " + expected.length + " queries to write. ";
    if (parts.length) text += parts.join("; ").replace(/^y/, "Y") + ". ";
    if (missing.length) text += "Still missing a result like " + missing.join(", and one like ") + ".";
    return { ok: false, diff: diff, text: text.trim() };
  }

  /* ---------- Exercises that change data ---------- */

  function section(label) { return +label.split(".")[0]; }
  function changes(label) { return (DATA.changes || []).indexOf(section(label)) >= 0; }

  // The data just before an exercise: the sample data plus the solutions of the
  // earlier exercises in its section, in page order. Built once per exercise.
  var startImages = {};
  function startImage(engine, label) {
    if (startImages[label]) return startImages[label];
    var image = engine.image, order = DATA.order || [];
    for (var i = 0; i < order.length && order[i] !== label; i++) {
      if (section(order[i]) !== section(label)) continue;
      var out = run(engine, DATA.solutions[order[i]], image, true);
      image = out.db.export();
      out.db.close();
    }
    startImages[label] = image;
    return image;
  }

  // {lowercased name: {name, columns, rows}} for every table in a database.
  function tables(db) {
    var out = {};
    var names = db.exec("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name");
    (names[0] ? names[0].values : []).forEach(function (row) {
      var name = row[0], res = db.exec('SELECT * FROM "' + name.replace(/"/g, '""') + '"');
      var columns = db.exec('PRAGMA table_info("' + name.replace(/"/g, '""') + '")')[0].values.map(function (c) { return c[1]; });
      out[name.toLowerCase()] = { name: name, columns: columns, rows: res[0] ? res[0].values : [] };
    });
    return out;
  }

  function sameTable(a, b) {
    if (!a || !b || a.columns.length !== b.columns.length) return false;
    var d = diffRows(a, b);
    return !d.missing.length && !d.extra.length;
  }

  // The columns each CREATE TABLE in a script defines, as MySQL reads them:
  // {lowercased table: [{name, type, notNull, dflt, auto, key}]}. Used to compare
  // a table the exercise creates with the solution's, without running MySQL.
  function columnSpecs(sql) {
    var specs = {}, code = sql.split(TOKENS).map(function (part, i) {
      return i % 2 && /^(--|#|\/\*)/.test(part) ? " " : part;
    }).join("");
    var re = /\bCREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?`?(\w+)`?\s*\(/gi, m;
    while ((m = re.exec(code))) {
      var depth = 1, at = re.lastIndex, parts = [], from = at;
      for (; at < code.length && depth; at++) {
        if (code[at] === "(") depth++;
        else if (code[at] === ")") depth--;
        else if (code[at] === "," && depth === 1) { parts.push(code.slice(from, at)); from = at + 1; }
      }
      parts.push(code.slice(from, at - 1));
      var cols = [], keys = [];
      parts.forEach(function (p) {
        p = p.trim();
        var key = /^PRIMARY\s+KEY\s*\(([^)]*)\)/i.exec(p);
        if (key) { keys = key[1].split(",").map(function (k) { return k.replace(/`/g, "").trim().toLowerCase(); }); return; }
        if (!p || /^(CONSTRAINT|FOREIGN|UNIQUE|CHECK|KEY|INDEX)\b/i.test(p)) return;
        var col = /^`?(\w+)`?\s+(\w+)\s*(\([^)]*\))?(\s+UNSIGNED)?/i.exec(p);
        if (!col) return;
        var type = col[2].toUpperCase().replace(/^INTEGER$/, "INT") +
          (/INT$/.test(col[2].toUpperCase()) ? "" : (col[3] || "").replace(/\s+/g, "")) + (col[4] ? " UNSIGNED" : "");
        var dflt = /\bDEFAULT\s+('(?:[^']|'')*'|\S+?)(?=\s|,|$)/i.exec(p);
        cols.push({
          name: col[1].toLowerCase(), shown: col[1], type: type,
          notNull: /\bNOT\s+NULL\b/i.test(p), key: /\bPRIMARY\s+KEY\b/i.test(p),
          auto: /\bAUTO_INCREMENT\b/i.test(p),
          dflt: dflt ? dflt[1].replace(/^'|'$/g, "").toUpperCase() : null,
        });
      });
      cols.forEach(function (c) { if (keys.indexOf(c.name) >= 0) c.key = true; if (c.key) c.notNull = true; });
      specs[m[1].toLowerCase()] = cols;
      re.lastIndex = at;
    }
    return specs;
  }

  var COLUMN_PARTS = [["type", "type"], ["notNull", "NOT NULL"], ["dflt", "DEFAULT"], ["auto", "AUTO_INCREMENT"], ["key", "primary key"]];

  // What differs between your CREATE TABLE and the solution's, without saying
  // what the solution has.
  function columnProblems(name, mine, theirs) {
    if (!mine) return [name + ": Check can't find your CREATE TABLE for it."];
    var names = function (cols) { return cols.map(function (c) { return c.name; }).join(","); };
    if (names(mine) !== names(theirs)) return [name + ": the columns or their order differ from what the exercise asks for."];
    var out = [];
    theirs.forEach(function (want, i) {
      var off = COLUMN_PARTS.filter(function (p) { return mine[i][p[0]] !== want[p[0]]; }).map(function (p) { return p[1]; });
      if (off.length) out.push(name + "." + want.shown + ": check its " + off.join(", ") + ".");
    });
    return out;
  }

  // Compares the tables after your statements with the tables after the solution's.
  function checkTables(engine, label, sql, db) {
    var image = startImage(engine, label);
    var before = freshDb(engine, image), start = tables(before);
    before.close();
    var sol = run(engine, DATA.solutions[label], image, true), want = tables(sol.db);
    sol.db.close();
    var mine = tables(db);
    var touched = Object.keys(want).filter(function (k) { return !sameTable(want[k], start[k]); });
    if (!touched.length) return { info: "This exercise doesn't change any data, so there's nothing for Check to compare. Run each statement and read what happens." };

    var problems = [], diffs = [];
    Object.keys(want).concat(Object.keys(mine)).forEach(function (k, i, all) {
      if (all.indexOf(k) !== i) return;
      var w = want[k], m = mine[k], name = (w || m).name;
      if (!w) { problems.push(name + ": the solution doesn't have this table."); return; }
      if (!m) { problems.push(name + ": your statements don't leave this table."); return; }
      if (m.columns.length !== w.columns.length) {
        problems.push(name + ": expected " + plural(w.columns.length, "column") + ", yours has " + m.columns.length + ".");
        return;
      }
      if (!sameTable(m, w)) {
        var d = diffRows(m, w);
        d.table = name;
        diffs.push(d);
        problems.push(name + ": " + (m.rows.length === w.rows.length
          ? "some values are different."
          : "expected " + plural(w.rows.length, "row") + ", yours has " + m.rows.length + "."));
      }
    });
    // A table the exercise creates: its columns too, as MySQL would define them.
    var theirSpecs = columnSpecs(DATA.solutions[label]), mySpecs = columnSpecs(sql);
    Object.keys(theirSpecs).forEach(function (k) {
      if (!start[k] && want[k]) problems = problems.concat(columnProblems(want[k].name, mySpecs[k], theirSpecs[k]));
    });
    if (!problems.length) return { ok: true, text: "Your tables match the ones the solution leaves." };
    return { ok: false, text: "Not quite: " + problems.join(" "), diffs: diffs };
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

  var DIFF_ROWS = 20;

  // What to fix, after a failed Check. Your extra rows come from your own result,
  // so they're shown. The missing rows are part of the answer, so they're folded.
  function renderDiff(diff) {
    var nodes = [];
    var where = diff.table ? diff.table + ": " : "";
    if (diff.extra.length) {
      var extra = el("div", "sql-diff sql-diff--extra");
      extra.appendChild(el("p", "sql-diff__title",
        where + plural(diff.extra.length, "row") + " in yours that the answer doesn't have:"));
      extra.appendChild(renderTable({ columns: diff.columns, rows: diff.extra.slice(0, DIFF_ROWS) }, 0, 1));
      if (diff.extra.length > DIFF_ROWS) extra.appendChild(el("p", "sql-result__caption", "Showing the first " + DIFF_ROWS + "."));
      nodes.push(extra);
    }
    if (diff.missing.length) {
      var missing = el("details", "sql-diff sql-diff--missing");
      missing.appendChild(el("summary", null,
        where + plural(diff.missing.length, "row") + " the answer has that yours doesn't (shows part of the answer)"));
      missing.appendChild(renderTable({ columns: diff.expColumns, rows: diff.missing.slice(0, DIFF_ROWS) }, 0, 1));
      if (diff.missing.length > DIFF_ROWS) missing.appendChild(el("p", "sql-result__caption", "Showing the first " + DIFF_ROWS + "."));
      nodes.push(missing);
    }
    return nodes;
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
    editor.placeholder = (changes(label) ? "INSERT / UPDATE / DELETE ..." : "SELECT ...") + "   (Ctrl+Enter to run)";
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
        var changing = changes(label);
        var nodes = [], out = run(engine, sql, changing ? startImage(engine, label) : null, changing);
        if (withCheck && !out.error) {
          var verdict = changing ? checkTables(engine, label, sql, out.db) : check(engine, label, out.results);
          if (verdict.info) {
            nodes.push(message("info", verdict.info));
          } else {
            nodes.push(message(verdict.ok ? "ok" : "bad", (verdict.ok ? "✓ " : "✗ ") + verdict.text));
            if (!verdict.ok) (verdict.diffs || (verdict.diff ? [verdict.diff] : [])).forEach(function (d) { nodes = nodes.concat(renderDiff(d)); });
            // progress.js ticks this exercise's Done box on a pass, and puts it on the
            // review list on a fail (until a later pass).
            document.dispatchEvent(new CustomEvent(verdict.ok ? "d427:solved" : "d427:missed", { detail: { label: label } }));
          }
        }
        if (out.db) out.db.close();
        out.results.forEach(function (r, i) { nodes.push(renderTable(r, i, out.results.length)); });
        if (out.error) {
          nodes.push(message("bad", "SQLite error: " + out.error));
        } else if (!out.results.length) {
          nodes.push(message("info", out.changed || changing
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
    // In front of the Hint: a Show tables box can come earlier, under the Uses line.
    var before = li.querySelector(":scope > details:not(.tables)");
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
