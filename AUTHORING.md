# Authoring guide

How the course pages are written, what the site build does with them, and how to add a course. D427 (`D427_Data_Management_Applications/`) is the model: every feature below is in use there, so when in doubt, copy what it does.

The rule behind all of it: **the Markdown stays readable on GitHub.** Everything the site adds (folded hints, quizzes, diagrams, the SQL runner, progress tracking) comes from build hooks in `hooks/` reading plain Markdown and hidden HTML comments. Nothing here needs a special editor.

## Contents

- [Preview and checks](#preview-and-checks)
- [Adding a course](#adding-a-course)
- [Writing exercises](#writing-exercises)
- [Hints and solutions (`solutions.sql`)](#hints-and-solutions-solutionssql)
- [Quiz answer keys](#quiz-answer-keys)
- [Diagrams](#diagrams)
- [SQL runner](#sql-runner)
- [Progress tracking](#progress-tracking)
- [Glossary tooltips](#glossary-tooltips)
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
| Site builds, links resolve | `mkdocs build --strict`, `scripts/check_links.py site`, and `scripts/check_sql_runner.py` (every Try it solution runs in SQLite) |
| setup.sql + solutions.sql run on MySQL 8.4 | D427's `setup.sql`, then all of its `solutions.sql` (add steps for each new SQL course) |
| Exercise files match solutions.sql | `build_solutions.py`, `build_diagrams.py`, and `build_errors.py` leave no changes |

Run the same things locally before pushing. If you edit `solutions.sql` or a `CREATE TABLE` in `setup.sql`, run `python3 build_solutions.py` / `python3 build_diagrams.py` in the course folder and commit what they change.

## Adding a course

1. **Make the folder** at the repo root, named like the existing ones (`D949_Data_Structures_And_Algorithms_I`).
2. **Link it into the site:** `ln -s ../D949_Data_Structures_And_Algorithms_I docs/d949`. The short name (`d949`) is the course's *slug*: its URL path and the key for its settings.
3. **Add its pages to `nav:`** in `mkdocs.yml`, and a card for it on `docs/index.md`.
4. **Add it under `extra.courses`** in `mkdocs.yml`. With only `folder`, it's published as plain pages:

   ```yaml
   extra:
     courses:
       d949:
         folder: D949_Data_Structures_And_Algorithms_I
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
         quiz: 04-concepts-check.md    # interactive answer keys
   ```

   `hooks/courses.py` reads these; every hook that uses one says so in its docstring.

6. **Add its SQL to CI** if it has a `setup.sql` and `solutions.sql`: copy the MySQL steps in `.github/workflows/checks.yml` for the new folder.

## Writing exercises

An exercise is a top-level list item that starts with its bold label. The build finds exercises by this pattern, so keep it exact: `- **7.3**`, a space or a backslash line break, then the text.

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
- **Table specs, not SQL.** When the learner builds a table, describe each column in words, the way the assessment does. The `CREATE TABLE` goes in the solution. In teaching sections, use plain wording ("a whole number from 0 to 65 thousand"). In assessment drills, use the assessment's wording ("integer with range 0 to 65 thousand").
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

On the quiz page (`quiz:` in the course settings), each question part has a hidden comment right after it, with a machine-readable answer. `hooks/quiz.py` checks every key against the Markdown and `docs/javascripts/quiz.js` adds the controls.

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
- Saved answers are stored per page (`d427-quiz:04`). Renaming a part's id loses saved answers for that part.
- Give every table a header for each column, including the label column ("Part"), for screen readers.

## Diagrams

### "Show tables" ER diagrams

Generated from `setup.sql`; nothing to write. `er_diagrams.pages` lists the pages that get a folded "Show tables" diagram under each exercise's **Uses:** line, showing those tables and the tables they link to. `er_diagrams.readme` names the page whose `<!-- er-diagram -->` ... `<!-- /er-diagram -->` Mermaid block (written by `build_diagrams.py`, so GitHub renders it) becomes the full SVG diagram on the site.

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

- **Only read-only queries.** Changing data and tables should be practiced on real MySQL. List exceptions inside a section under `skip`, with the reason the learner sees.
- The course's first runner page gets the full "SQLite, not MySQL" note; other pages get a short one under each section.
- Every runner solution must also run in SQLite, and return a result table for Check to compare. `scripts/check_sql_runner.py` checks this in CI. If a solution needs a MySQL function SQLite lacks, add it to `FUNCTIONS` in both `docs/javascripts/sql-runner.js` and the check script (the check fails if the two lists differ), or put the exercise in `skip`.
- A failed Check shows the rows yours has that the answer doesn't, and (folded, since it shows part of the answer) the rows the answer has that yours doesn't.

## Progress tracking

With `progress:` set, every exercise on the `pages` glob gets a **Done** checkbox, and the `overview` page gets a progress bar per page under its `## Contents` heading, plus a **Continue with ...** button to the first exercise not marked Done. A passing Check in a Try it box, or a fully answered quiz question, ticks the box. Progress is saved in the browser under `<slug>-progress`.

## Other D427 pages

- **`errors.md`** (error decoder) is generated by `build_errors.py`. Don't edit between its `<!-- errors -->` markers.
- **`cheatsheet.md`** is written by hand, inside a `<div class="cheatsheet" markdown>` that gives it compact print styles. Run every statement you add on MySQL 8.4.
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

- **Never give away the answer.** Specs, hints, diagrams, and notes must not reveal which rows come back, which type to use, or which rule applies. Put `CREATE TABLE` statements in solutions, and use made-up tables (or `in: solution`) for pictures.
- **Verify on real MySQL.** Every solution and every "expected to fail" error comes from an actual MySQL 8.4 run.
- **Keep GitHub readable.** If a feature would leave the `.md` confusing on GitHub, give it plain-text fallback content.
- **Accessibility.** Diagrams get alt text (the hooks add `<title>`/`<desc>`), tables get headers, and new colors meet 4.5:1 contrast in both light and dark mode.
- **Update [`ROADMAP.md`](ROADMAP.md)** in each PR: move what you finished to Done and add what you found.
