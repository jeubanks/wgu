# Authoring guide

How the course pages are written, what the site build does with them, and how to add a course. D427 (`D427_Data_Management_Applications/`) is the model: every feature below is in use there, so when in doubt, copy what it does.

The Markdown stays readable on GitHub. Everything the site adds (folded hints, quizzes, diagrams, the SQL runner, progress tracking) comes from build hooks in `hooks/` reading plain Markdown and hidden HTML comments. Nothing here needs a special editor.

## Contents

- [Preview and checks](#preview-and-checks)
- [Adding a course](#adding-a-course)
- [Writing exercises](#writing-exercises)
- [Hints and solutions (`solutions.sql`)](#hints-and-solutions-solutionssql)
- [Quiz answer keys](#quiz-answer-keys)
- [Diagrams](#diagrams)
- [SQL runner](#sql-runner)
- [Progress tracking](#progress-tracking)
- [Python courses (C949)](#python-courses-c949)
- [Glossary tooltips](#glossary-tooltips)
- [Diagrams and interactive benches](#diagrams-and-interactive-benches-vizjs)
- [GitHub Markdown the build adapts](#github-markdown-the-build-adapts)
- [Rules](#rules)

## Preview and checks

```bash
python3 -m venv .venv && .venv/bin/pip install -r requirements-docs.txt
.venv/bin/mkdocs serve
```

The site is at `http://127.0.0.1:8000/wgu/`. `mkdocs serve` doesn't always pick up edits to the files in `hooks/`; restart it after changing one.

Every pull request runs these checks (`.github/workflows/checks.yml`), and `main` won't accept a merge until they pass:

| Check | What it runs |
|---|---|
| Site builds, links resolve | `mkdocs build --strict`, `scripts/check_links.py site` (pages and exercise anchors), `scripts/check_sql_runner.py` (every Try it solution runs in SQLite), and `scripts/check_a11y.py site` (axe-core finds no accessibility problems on any page, light or dark) |
| setup.sql + solutions.sql run on MySQL 8.4 | D427's `setup.sql`, then all of its `solutions.sql`, then every full statement on the SQL quick reference (`scripts/check_quick_reference.py`). Add steps for each new SQL course. |
| Exercise files match solutions.sql | `build_solutions.py`, `build_diagrams.py`, and `build_errors.py` leave no changes |

Run the same things locally before pushing. The accessibility check needs Playwright: `pip install -r requirements-ci.txt && python3 -m playwright install chromium` (or add `--channel chrome` to use an installed Chrome). If you edit `solutions.sql` or a `CREATE TABLE` in `setup.sql`, run `python3 build_solutions.py` / `python3 build_diagrams.py` in the course folder and commit what they change.

## Adding a course

1. **Make the folder** at the repo root, named like the existing ones (`C949_Data_Structures_And_Algorithms_I`).
2. **Link it into the site:** `ln -s ../C949_Data_Structures_And_Algorithms_I docs/c949`. The short name (`c949`) is the course's *slug*: its URL path and the key for its settings.
3. **Add its pages to `nav:`** in `mkdocs.yml`, and a card for it on `docs/index.md`.
4. **Add it under `extra.courses`** in `mkdocs.yml`. With only `folder`, it's published as plain pages:

   ```yaml
   extra:
     courses:
       c949:
         folder: C949_Data_Structures_And_Algorithms_I
   ```

5. **Turn on features** by adding their settings. Each is optional:

   ```yaml
       d427:
         folder: D427_Data_Management_Applications
         progress:                     # Done boxes and per-part bars
           overview: exercises.md      # the page that gets the bars
           pages: "0[0-9]-*.md"        # pages whose exercises are counted
         setup_sql: setup.sql          # sample data for diagrams and the runner
         er_diagrams:                  # "Show tables" diagrams
           readme: README.md           # page with the full diagram
           pages: [01-queries.md, 02-changing-data.md]
         concept_diagrams: true        # join / delete / tree diagram blocks
         sql_runner:                   # Try it boxes
           pages:
             01-queries.md: [1, 2, 3]  # page -> section numbers
           skip:
             "12.20": This one changes data, so do it on MySQL.
           changes: [7]                # sections whose exercises change data
         quiz: 04-concepts-check.md    # interactive answer keys (a file, or a glob of pages)
         old_slugs: [x123]             # old URL paths that redirect here, after a rename
         moved:                        # pages that moved inside the course
           old-page.md: new/page.md    # its old URL redirects to the new one
   ```

   `hooks/courses.py` reads these; every hook that uses one says so in its docstring.

   **Renaming a course:** rename the folder and the `docs/` symlink, change the slug, and list the old slug under `old_slugs`. `hooks/redirects.py` then writes a page at every old URL that forwards to the new one, keeping the `#anchor`. The progress saved in learners' browsers is keyed by slug, so it starts over.

6. **Add its SQL to CI** if it has a `setup.sql` and `solutions.sql`: copy the MySQL steps in `.github/workflows/checks.yml` for the new folder.

## Writing exercises

An exercise is a top-level list item that starts with its bold label. The build finds exercises by this pattern, so keep it exact: `- **7.3**`, a space or a backslash line break, then the text.

On screen, each exercise is a card with its label as a badge, and its closed boxes (Try it, Hint, Solution, Answer) sit in one row of small buttons; an open box takes the card's full width (`wgu.css`, "Exercise cards"). A chevron at each card's top right folds it to its first line, and a "Collapse completed exercises" switch under the page title folds the cards marked Done (`progress.js`; the switch is remembered). Print keeps the plain list, unfolded.

```markdown
- **7.3**\
  **Uses:** Rating, Movie *(already in the database, from `setup.sql`)*\
  **Creates:** Guest

  Both of these statements will fail. Run each one and read the error message:

  - Try to delete the 'PG' rating from the Rating table.
  - ...

  *(check: 1 new row)*
```

- **Label:** `section.number`. Sections are the `## 7. ...` headings. Labels must be unique across the course.
- **Anchor:** every exercise gets a link anchor from its label (`hooks/anchors.py`): `02-changing-data.md#ex-7-3`, or `#ex-t-3` for `T.3`. Link to exercises this way; the link check fails if the anchor doesn't exist.
- **Uses:** the tables the exercise reads or changes, each with where it came from in an italic note: `*(already in the database, from `setup.sql`)*` or `*(from 8.1)*`. Tables noted as coming from `setup.sql` get a "Show tables" diagram.
- **Creates:** the tables, views, or indexes the exercise makes.
- **Expected result** in italics at the end: `*(12 rows)*`, `*(check: ...)*`.
- **Table specs, not SQL.** When the learner builds a table, describe each column in words, the way the D427 practice tests do. The `CREATE TABLE` goes in the solution. In teaching sections, use plain wording ("a whole number from 0 to 65 thousand"). In the practice-test drills, use the practice tests' wording ("integer with range 0 to 65 thousand").
- **Integer columns state a range**, so the learner picks the size (TINYINT, SMALLINT, ...). A foreign key column says "the same type as ...'s ID".
- **Indent continuation lines by 2 spaces**, as GitHub does.

## Hints and solutions (`solutions.sql`)

`solutions.sql` is the source of truth for hints and answers. `build_solutions.py` copies them into the exercise pages as folded **Hint** and **Solution** blocks.

```sql
-- [7.9]
-- Hint: A range that starts at 0 means UNSIGNED.
-- Hint: `AUTO_INCREMENT PRIMARY KEY` lets MySQL number the rows.
CREATE TABLE Guest (
  GuestID   SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,   -- 0..65,535
  ...
);
-- Expected to FAIL (FullName is NOT NULL and has no DEFAULT):
--   INSERT INTO Guest (City) VALUES ('Waco');
--   ERROR 1364: Field 'FullName' doesn't have a default value
```

- `-- [N.M]` starts an exercise's block. Each `-- Hint:` line becomes one hint bullet. The rest is the solution.
- **Errors:** when an exercise shows a new MySQL error number, add it to `ERRORS` in `build_errors.py` (its message, what it means, and the usual fix) and run the script. It fails if an error has no entry. The concepts check isn't listed under "Comes up in", since naming the error would hint at the answer.
- **Every solution must run on MySQL 8.4**, from start to finish, after `setup.sql`. CI runs the whole file. Statements meant to fail are commented out, with the error MySQL gives (copy it from a real run).
- A label with only hints (like the concepts check) gets just a Hint block, above the exercise's own `<details><summary>Answer</summary>` block.
- In the `.md` files, the blocks sit between `<!-- solution:N.M -->` and `<!-- /solution -->`. Don't edit them by hand: run `build_solutions.py`.

## Quiz answer keys

On a quiz page (`quiz:` in the course settings: one file, or a glob like C949's `"[0-9][0-9]-*.md"` for a question section on every chapter), each question part has a hidden comment right after it, with a machine-readable answer. `hooks/quiz.py` checks every key against the Markdown and `docs/javascripts/quiz.js` adds the controls.

| Kind | Example | The learner gets |
|---|---|---|
| `choice` | `<!-- answer:13.1d choice: A -->` | buttons for the `A.` `B.` ... lines above; `B C` means pick both |
| `blanks` with options | `<!-- answer:13.8a blanks: [LEFT, RIGHT, INNER] => LEFT -->` | a dropdown |
| `blanks` labeled | `<!-- answer:13.6b blanks: INNER => 3; RIGHT => 5 -->` | a text box per label |
| `blanks` single | `<!-- answer:13.13c blanks: CONCAT() \| CONCAT -->` | one text box |
| `table` | `<!-- answer:13.2a-m table: VARCHAR(56); CHAR(2); ... -->` | a text box in each empty cell of the table above, in reading order |
| `table` with options | `<!-- answer:13.10a-j table [True, False]: True; False; ... -->` | a dropdown in each empty cell |
| `written` | `<!-- answer:13.3c written -->` | a box to write in, then "Got it" / "Missed it" |

- `|` separates accepted answers. Text answers ignore case and spaces.
- Options are separated by commas, so an option can't contain one.
- Saved answers are stored per page, by the first two characters of its file name (`d427-quiz:04`), so quiz pages in one course must start differently. Renaming a part's id loses saved answers for that part.
- Give every table a header for each column, including the label column ("Part"), for screen readers.

## Diagrams

### "Show tables" ER diagrams

Generated from `setup.sql`; nothing to write. `er_diagrams.pages` lists the pages that get a folded "Show tables" diagram under each exercise's **Uses:** line, showing those tables and the tables they link to. Where a page has no Uses lines (Part 1, Section 12), each `### Movie and Rating` style heading names the tables instead, and every exercise under it gets its own Show tables box between its label and its text, where a Uses line would put it: the first exercise's holds the diagram, and the others copy it in when opened (`site.js`). An exercise needs a `<!-- solution:N.N -->` marker to get one. `er_diagrams.readme` names the page whose `<!-- er-diagram -->` ... `<!-- /er-diagram -->` Mermaid block (written by `build_diagrams.py`, so GitHub renders it) becomes the full SVG diagram on the site.

### Join, delete, and self-join pictures

With `concept_diagrams: true`, a hidden comment describes a picture, and the plain text after it (up to the closing comment) is what GitHub shows instead:

```markdown
<!-- join-diagram
table: Driver(DriverID, Name, BusID) = 1, Ana, 10; 2, Ben, 10; 4, Dana, NULL
table: Bus(BusID, Route) = 10, Red line; 30, Green line
from: Driver d | DriverID, Name, BusID
join: Bus b | BusID, Route
on: d.BusID = b.BusID
select: d.Name, b.Route
INNER: Caption for the INNER JOIN tab.
LEFT: Caption for the LEFT JOIN tab.
-->
| Join | Rows it keeps |
|---|---|
| ... | ... |
<!-- /join-diagram -->
```

| Block | Draws | Lines |
|---|---|---|
| `join-diagram` | two tables, the matching rows linked, and the result | `from:` `join:` `on:` `select:`, then one `INNER:` / `LEFT:` / `RIGHT:` line per tab |
| `delete-diagram` | parent and child rows before and after a DELETE | `parent:` `child:` `fk: Child -> Parent` `delete: condition`, then one `CASCADE:` / `SET NULL:` / `RESTRICT:` line per tab |
| `tree-diagram` | a table that points at itself, as an org chart | `rows:` `parent: ManagerID -> EmpID` `label: FirstName`, optional `caption:` |

`from:`, `join:`, `parent:`, `child:`, and `rows:` are `Table alias | columns to show | which rows (a WHERE condition)`. Options for all three:

- `table: Name(col, ...) = v, v; v, v` makes up a table for this picture only. **Use made-up tables whenever real rows would answer an exercise.** Check the names aren't used by any exercise.
- `fold: Title` puts the picture in a folded tip box.
- `in: solution` moves it into the next Solution box (for pictures that *are* the answer). Leave the fallback text empty. `heading: Text` sets its heading there.

## SQL runner

`sql_runner.pages` maps a page to the section numbers whose exercises get a **Try it** box. It runs SQLite in the browser on `setup.sql` (translated by `hooks/sqlite_setup.py`), and **Check** compares the learner's result with the solution's.

- **Read-only queries, except in `changes` sections.** In a section listed under `changes` (D427's Section 7: INSERT, UPDATE, DELETE), each box starts from `setup.sql` plus the solutions of the section's earlier exercises, in page order, and Check compares every table after the learner's statements with the tables after the solution's. For a table the exercise creates, it also compares each column's type, NOT NULL, DEFAULT, AUTO_INCREMENT, and key, as written in the CREATE TABLE, and only says which ones differ. An exercise whose solution changes nothing (like 7.3, which is about errors) gets a note instead of a verdict. Foreign keys are on, AUTO_INCREMENT keeps counting past deleted rows like MySQL's, and TRUNCATE restarts it. Changing tables (ALTER, DROP CHECK, ...) behaves too differently in SQLite, so those sections stay on MySQL. List exceptions inside a section under `skip`, with the reason the learner sees.
- The course's first runner page gets the full "SQLite, not MySQL" note; other pages get a short one under each section.
- `SHOW TABLES`, `DESCRIBE`, and `SHOW CREATE TABLE` become SELECTs over SQLite's catalog (`showStatements` in `sql-runner.js`). For a table still as `setup.sql` built it, SHOW CREATE TABLE prints its CREATE TABLE from `setup.sql` and DESCRIBE its MySQL column types; the hook passes those statements to the page as `creates`.
- Every runner solution must also run in SQLite (a `changes` section's in order, each on the data the earlier ones left), and a read-only one must return a result table for Check to compare. `scripts/check_sql_runner.py` checks this in CI. If a solution needs a MySQL function SQLite lacks, add it to `FUNCTIONS` in both `docs/javascripts/sql-runner.js` and the check script (the check fails if the two lists differ), or put the exercise in `skip`.
- A failed Check shows the rows yours has that the answer doesn't, and (folded, since it shows part of the answer) the rows the answer has that yours doesn't.

## Progress tracking

With `progress:` set, every exercise on the `pages` glob gets a **Done** checkbox (exercises on other pages don't, so they can reuse labels), and the `overview` page gets a progress bar per page under its `## Contents` heading, plus a **Continue with ...** button to the first exercise not marked Done, and a **To review** list of exercises you missed (a failed Check, or a quiz question with a wrong part) until you get them right. `hooks/anchors.py` also adds one search entry per exercise, so searching its number finds it. A passing Check in a Try it box, or a fully answered quiz question, ticks the box. Progress is saved in the browser under `<slug>-progress`.

## Python courses (C949)

C949 is a concise study guide first, organized by the course study guide's three competencies: ten topic pages (`01-tracing-code.md` ... `10-programming-basics.md`), a mixed `11-final-practice.md`, and a `beyond-the-guide.md` appendix of brief notes on zyBooks topics outside the course study guide (it has no questions). Each topic page leads with the idea and a drawn example, gives best, average, and worst-case Big-O, and ends with a **Questions** section of quiz items. Keep pages short: no walkthroughs of zyBooks' own classes, and no zyBooks section order. The old chapter pages redirect to the topic pages (`moved:` in mkdocs.yml). Its optional Python lessons live in `code/`, with their own `build_solutions.py` (in the course folder) instead of a `solutions.sql`. Each lesson page `code/0N-*.md` pairs with `c949-practice/lessonN.py` and `c949-practice/solutions/lessonN.py`:

- **Exercises** use the same `- **N.M**` cards, with an `**In:**` line naming the function or variable to fill in. Trace exercises put the code to trace on the page.
- **Solutions** are the solutions file's statements between its `exercises` (or `answers`) rule and its `checks` rule. A def or class belongs to the label its docstring starts with (`2.2 Reverse ...`); anything else belongs to the last label comment above it (`# 2.1 Trace ...`, or a bare `# [7.5]`).
- **Hints** are comment lines in the solutions file: `# Hint 2.2: text`, one bullet each.
- **Lesson code**: a `<!-- lesson-code -->` `<!-- /lesson-code -->` pair on the page gets the lesson file's code (between its `lesson code` and `exercises` rules), folded.
- **No check:** an exercise with no Python answer (5.7, 3.6) gets a hand-written `<details><summary>Answer</summary>` block; its hints go above it.

Run `python3 build_solutions.py` in the course folder after changing a lesson or solutions file. CI fails if it would change anything, and runs `pytest --solutions` in `c949-practice/`.

## Diagrams and interactive benches (`viz.js`)

`docs/javascripts/viz.js` (styles in `docs/stylesheets/viz.css`) draws pictures and step-through "benches" from a placeholder. The Markdown inside it is what GitHub shows:

```markdown
<div class="viz" data-viz="hash-probe" markdown>

*On the site, an interactive diagram here inserts keys into a 13-bucket table and animates probing.*

</div>
```

| `data-viz` | What it draws | Used on |
|---|---|---|
| `linked-list` | Singly-linked list: prepend, append, insert after, remove last, search, step by step with pointer changes | C949 2 |
| `stack-queue` | A stack, and a queue in a circular array of 8 slots | C949 3 |
| `hash-probe` | 13 buckets; linear, quadratic, and double-hashing probes, animated | C949 4 |
| `heap` | Max-heap insert and remove-max, tree and array together | Cheat sheet |
| `sort` | Bubble, selection, insertion, and merge sort on sorted, random, or reversed input, counting comparisons | C949 11 |
| `loop-grid` | One dot per run of a loop's busiest line, for six loop patterns, n = 4, 8, 16 | C949 11 |
| `growth-chart` | The seven growth classes as n grows, linear or log scale, with a table view | Cheat sheet |
| `cost-spectrum` | Steps for n = 1,000 in each growth class | C949 contents |
| `chapter-map` | Turns the Markdown list inside it into picture cards (one drawing per chapter number) | C949 contents |
| `bst` | Binary search tree: random inserts, search and remove by picking a key, animated traversals | C949 5 |
| `avl` | The four AVL rotation cases, with balance factors | C949 6 |
| `graph-search` | BFS, stack DFS, and recursive DFS on a 7-vertex graph, with the queue, stack, or call stack | C949 9 |
| `dijkstra` | Dijkstra one relaxation at a time, with a distance and predecessor table and the shortest path | C949 9 |
| `btree` | 2-3-4 tree: random inserts with preemptive splits, and search | C949 10 |
| `allocation`, `huffman`, `tree-shapes` | Static drawings | C949 2, 1, cheat sheet |
| `rb-tree`, `treap`, `set-ops` | Static drawings | C949 6, 7, 8 |

For any other example drawing, use a [figure block](#drawn-figures-hooksfigurespy) instead of a new `data-viz` kind.

- **Never let a bench answer a question.** Give each bench a setup the page's questions don't use (C949's hash bench has 13 buckets; its questions use 7, 10, and 11), and limit inputs where a question could be reproduced (the loop tracer stops at n = 16; question 11.5 asks about n = 32).
- **Complexity chips:** on C949 pages, `viz.js` turns O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ), and O(n!) in table cells into colored chips, one color per class, the same colors as the growth chart. Quiz tables and code are skipped.
- Every bench works in light and dark, respects reduced motion, and narrates each step in a live region.

### Drawn figures (`hooks/figures.py`)

Every example drawing on the C949 pages (trees, B-trees, graphs, linked lists, array traces, matrices, recursive call chains) is a figure block: a short spec in an HTML comment, then a plain-text drawing that GitHub shows. The build turns the whole block into inline SVG, drawn on the server, so it needs no JavaScript and works in light and dark:

````markdown
<!-- figure
tree: 62{31{15, 47{, 52}}, 84{73, 96}}
-->
```text
        62
      /    \
    31      84
   ...
```
<!-- /figure -->
````

The spec lines (`tree:`, `nary:`, `btree:`, `nodes:`/`edges:`, `list:`, `heap:`, `array:`/`step:`, `row:`, `grid:`, `call:`, `frame:`) are documented at the top of `hooks/figures.py`. A block works inside a list item: indent it like the rest of the item. Each SVG gets an `aria-label` that spells out the structure.

- **Keep the text drawing.** It's what GitHub shows, and it's the record to check the spec against.
- **Never draw an ASCII picture without a spec.** A trace that's really a table (BFS queues, Dijkstra distances, sort passes with notes) can be a Markdown table instead.
- **A figure in a question shows only the question's input.** Path highlights (`@h`) and highlighted cells belong in worked examples and Answer boxes.
- Lay graphs out so no two weights sit on top of each other: bend one of a pair of opposite edges (`~-30`), or move a crossing edge's weight along it (`@0.3`).

### C949 practice quiz (`practice.js`)

`docs/javascripts/practice.js` fills `<div id="c949-quiz">` on `practice-quiz.md` with a random 10-question quiz. Each kind of question is a generator in `GEN` (a topic, a prompt, optional code, the answer, and why), built from random values with the chapters' conventions. To add a kind, add a generator and give it one of the topics in `TOPICS`. Nothing is saved; it's untimed, with instant feedback.

## Other D427 pages

- **`errors.md`** (error decoder) is generated by `build_errors.py`. Don't edit between its `<!-- errors -->` markers.
- **`quick-reference.md`** is written by hand, inside a `<div class="quick-reference" markdown>` that gives it compact print styles. CI runs every full statement on it (each ```sql block on sample tables, and each inline statement ending in `;` on a fresh table `t` with parent `p`; see `scripts/check_quick_reference.py` for their columns). Write examples as whole statements so they get checked.
- **`drill.md`** holds a `<div id="spec-drill">` that `docs/javascripts/drill.js` replaces with the drill. The Markdown inside it is the fallback GitHub shows. To add a kind of prompt, add a generator to `KINDS` in `drill.js`, with its weight in `WEIGHTS`.

## Glossary tooltips

`includes/glossary.md` defines abbreviations once for the whole site; hovering the word anywhere shows the definition:

```markdown
*[DDL]: Data Definition Language: statements that create, change, or remove database objects.
```

Add both capitalizations if a term starts sentences (`*[cardinality]:` and `*[Cardinality]:`).

## GitHub Markdown the build adapts

`hooks/details.py` turns GitHub-flavored Markdown into what MkDocs Material expects, so write it the GitHub way:

- `<details><summary>Hint</summary> ... </details>` becomes a folded box (Hint is blue, Solution and Answer are green).
- A trailing `\` is a line break.
- A list can start right after a paragraph, with no blank line.
- `> [!NOTE]`, `> [!TIP]`, `> [!IMPORTANT]`, `> [!WARNING]` become callout boxes.
- `<a href="file.sql" download>` becomes a download link that works from any page.

## Rules

- **Don't refer to the real assessment.** Say what the material is built from (the course's practice tests, the D427 Challenge, the course resources), never what the assessment contains, how it's worded, or what it expects. No "on the exam", "the OA asks", "same tables as the real assessment", or "exam-day" wording, so nothing here reads as sharing test content.
- **Never give away the answer.** Specs, hints, diagrams, and notes must not reveal which rows come back, which type to use, or which rule applies. Put `CREATE TABLE` statements in solutions, and use made-up tables (or `in: solution`) for pictures.
- **Verify on real MySQL.** Every solution and every "expected to fail" error comes from an actual MySQL 8.4 run.
- **Keep GitHub readable.** If a feature would leave the `.md` confusing on GitHub, give it plain-text fallback content.
- **Accessibility.** Diagrams get alt text (the hooks add `<title>`/`<desc>`), tables get headers, and new colors meet 4.5:1 contrast in both light and dark mode.
- **Update [`ROADMAP.md`](ROADMAP.md)** in each PR: move what you finished to Done and add what you found.
