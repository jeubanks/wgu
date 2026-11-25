# Roadmap

The running list of improvements for this repo and its site. Work through it top to bottom, a few items per PR. Each PR updates this file: tick off what it finished (move it to **Done**, with the PR number) and add anything new it turned up.

D427 is the model course. Once its patterns are settled, other courses reuse them.

## Up next


## Backlog

### Studying

Nothing here yet.

### Keep it working

Nothing here yet.

### Future additions

- [ ] **Drill: whole-table specs**: a third drill mode. A made-up multi-column table spec (types and constraints) to write as one CREATE TABLE. The checker splits the statement into columns and table-level clauses and judges each one: types, NOT NULL / DEFAULT / AUTO_INCREMENT / keys, CHECKs in their common equivalent forms, and foreign keys with their ON DELETE / ON UPDATE rules. Anything it can't verify says so and shows a model answer. A big item: most of the work is a lenient parser, tested with a few hundred generated specs answered in varied styles.

### Waiting on a decision

- [ ] **MySQL without installing it**: a dev container so "Open in Codespaces" starts MySQL 8.4 with `d427` loaded, linked from Setup and Part 2. Sections 8 to 10 need real MySQL (ALTER ... MODIFY, DROP CHECK, SHOW, EXPLAIN), so the SQLite runner can't cover them.
- [ ] **Restore points for Part 2**: a downloadable `.sql` per section (setup.sql plus the earlier solutions), so starting a section fresh is one SOURCE command.
- [ ] **Timed mode for the final practice**: a 60-minute timer, hints and solutions locked until you finish, then a self-scored result.

### Decided against

- **C949 Python runner in the browser (Pyodide)**: too heavy (about 10 MB per page load). The Practice in code page links free sites instead: Python Tutor for tracing, GitHub Codespaces for running the lessons and pytest unchanged, plus Colab, Programiz, OnlineGDB, and Trinket.
- **Self-host sql.js**: not needed. The runner loads it from cdnjs, pinned by hash and checked in CI.

### Parked

- [ ] **C949 diagrams**: linked lists, trees, heaps, and hash tables drawn with the SVG renderer. Must not show an exercise's answer (4.1, 4.6, and 3.1 are drawing exercises).

## Done

- C949 page 2: the binary search steps are a numbered list, one action per step, with **last index** in bold and explained as the length minus 1 (#80)
- C949 2.1 asks why ignoring half the items is safe only in a sorted list, with wrong choices that are plainly wrong. The old choice A, about computing the middle index, could pass as correct (#79)
- C949 page 2, binary search trace: the text explains the drawing (each row is one check, what blue and faded cells and the labels mean), says low, high and mid are indexes, and the table works out every mid and says why low or high moves (#78)
- C949 page 1, Tracing recursion: the factorial example now says what a factorial is and what n is, and follows `Factorial(3)` throughout. Tables show each call's own n going down and the answers coming back up, and both drawings show n for every call. The Fibonacci and infinite-recursion examples say what n is too (#77)
- C949 question clarity: terse or ambiguous prompts are now full questions that say what to find (2.3 asks which index `linear_search(items, 3)` returns, and 8.2 asks for each traversal by name). Questions that bundled several answers into one choice ("1 linear, 2 binary, 3 linear") now ask about one item at a time: 2.6, 2.7, 3.8, 4.7, 5.1, 5.6, 6.3, 7.4, and 7.6. Cards with several parts (both courses) now show each part as its own step: a divider, a square letter badge that turns green or red, a bold prompt, rounded choices, and short choices two across (#76)
- C949 menu: removed the duplicate top-level "Tracing pseudocode" entry. It opened the same page as Lesson 7 under Practice in code, and page 1 already links there. Links to it on the contents page and page 1 now say "Lesson 7: Tracing pseudocode", matching the menu. The loose items at the end of the C949 menu now sit under headers: Practice (final practice, practice quiz) right after the topic pages, then Practice in code, then Reference (Big-O cheat sheet, Beyond the guide, and the topic map last) (#75)
- Card and color cleanup:
  - **Cards ran together.** D427 exercise cards no longer sit inside section cards. Each section heading is now a banner, and the exercise cards sit on the page with their colored edge.
  - **Colors didn't match between elements.** Header and section cards, the quiz box, callouts, exercise cards, figures, benches, and tables now use one set of light and dark surfaces. Drawings inside a section card are insets.
  - **Muted text was hard to read.** It now has more contrast.
  - **D427 used one color per part.** It now uses a single blue, because C949's indigo, teal, and amber mean its competencies (#74)
- C949 drawing review: every drawing on every C949 page was put on one contact sheet and checked by script for overlapping or clipped text at desktop and phone widths. Fixed:
  - the tree-shapes captions (two lines each)
  - the memory-allocation drawing, whose linked nodes now zigzag without covering each other
  - stacked low/mid/high labels in binary-search traces
  - visit-order badges clipped above the root in traversal figures
  - contents cards, where page 1's f(n) labels overran their circles and pages 2–4 shared one picture; each page now has its own
  
  Drawings and benches wider than a phone now show an edge shadow on the side with more to scroll (#73)
- D427 parts use the study cards look too. Each part has a header card with an "After this part you can:" list, its "In this part" links as jump chips, section and exercise counts, and the exercise-index link. Each numbered section sits on a card, and Parts 1–3 have Key idea boxes (12 in all) that give the general rule without an exercise's answer. The hook takes `badges`, `reading`, `sections`, and `noun` settings per course (#72)
- C949 rebuilt as a concise study guide for the v5 course study guide: the 14 zyBooks-chapter pages (about 92,000 words) are now ten short topic pages grouped by competency: tracing code, searching, sorting, algorithm analysis, ADTs and design properties, lists/stacks/queues, hash tables, trees and heaps, sets and graphs, programming basics. Together with a 30-question final practice, they run about 27,000 words. New on the topic pages: one card per ADT with its Python commands, what `pop()` removes on each structure, a design-properties table, heap indexes counted from 0 and from 1, and a spot-the-sort table. Where the course study guide is wrong (graphs as hierarchies, heaps not indexed, BST delete), the pages teach the correct version. Topics outside the course study guide (balanced trees, B-trees, treaps, tries, shortest paths, MST, Huffman, greedy, DP) are condensed into a Beyond the guide appendix. Old chapter URLs redirect to the new pages. Saved C949 progress starts fresh (new `storage` prefix), and bad quiz keys now name their page. Every question on the topic pages and in the final practice (about 250 parts) is now four-option multiple choice whose wrong options come from common mistakes, and the random practice quiz is multiple choice the same way.

The pages use a new "study cards" look, picked from three mockups in `mockups/page-styles.html`:
- **Header card:** competency, learn list, reading time, and question count.
- **Section cards:** each section on its own card, with a number badge.
- **Key idea boxes:** one per teaching section.
- **Accent colors:** one per competency (indigo, teal, amber).
- **Step lists:** numbered circles.
- **Question cards:** rounded, with an accent edge.
- **Tables:** rounded, site-wide (#71)
- C949 chapter 1 questions are now concept questions in place of hand calculations. Huffman asks which characters get short codes, why no separators are needed, and what the decoder needs. Greedy asks when it's optimal. Dynamic programming asks why plain recursion is slow, with the Big-O of each method. Substring vs subsequence uses a table of string relationships and each table's mismatch rule. Activity selection and knapsacks ask why the greedy order works. Move-to-front asks what it does, when it helps, and its worst case (#70)
- Site colors: the "Soft contrast" palette, chosen from three mockups (`mockups/color-schemes.html`).
  - Light mode has a soft gray-white page in place of pure white, for less glare, with slate text at 13.5:1, darker bold, and navy headings.
  - Dark mode has a lifted charcoal page with full-strength text at 10.9:1 in place of Material's 82%-opacity gray, white bold, and near-white headings, so bold and headings stand out again.
  - Syntax-highlight colors and the quiz/runner blue were adjusted to keep 4.5:1 on the new backgrounds.
  - axe finds 0 problems on 39 pages in both schemes (#69)
- C949 simplification pass: every chapter reread as a first-time student would. Long sentences are split, terms are defined where they first appear, and the guide adds everyday analogies, "why this matters" lines, common-mistake notes, side-by-side tables, and 49 new drawings. The drawings cover BST insert and remove, trie changes, AVL heights, red-black insert cases and removal, linked-list steps, probing and rehashing, heap-vs-BST, the heap sort round, merge-sort splits, BFS and shortest-path trees, the MST, 2-3-4 splits, binary-search windows, and call chains. Written by one agent per chapter group, then checked by two independent reviewers who re-ran every new example. Their fixes covered a wrong rehash example, a false BST-removal note, an invalid red-black drawing, and a pre-existing giveaway in 12.4. List and array figures now size their boxes and markers to fit (#68)
- C949 clarity pass: chapters 1 to 12 and 21 rewritten to be easier to follow than the textbook. Each explanation now leads with the idea in plain words and a small example, then gives the rule, and adds the reason behind each step. "zyBooks says" attributions are gone except where a convention differs from other books, and the Fibonacci and LCS explanations are rewritten. Written by one agent per chapter group, checked by script (answer keys, figures, questions, and headings unchanged) and by an independent fact review, which also caught question 11.12 reusing the worked quicksort list, so 11.12 has a new list (#67)
- C949: every ASCII drawing and text trace is now a real drawing or table. A new build hook (`hooks/figures.py`) turns a short spec in each block into inline SVG: binary and general trees (with red-black colors, treap priorities, subtree triangles, highlighted paths, balance-factor and size notes), B-trees, graphs (directed, weighted, curved edges), linked lists, heaps with their arrays, array traces for searching and sorting, matrices for DP and Floyd-Warshall, and recursive call chains and stack frames. The plain-text drawing stays as GitHub's fallback. Traces that were really tables (BFS, DFS, Dijkstra, Bellman-Ford, topological sort, Kruskal, set operations, B-tree search and removal) are Markdown tables or numbered steps, and question graphs given as edge lists are drawn (#64)
- C949: a Run Python online section on Practice in code (Python Tutor, GitHub Codespaces, Colab, Programiz, OnlineGDB, Trinket, with what each is good for), and Python Tutor tips in chapters 2, 5, and 21 for watching pointers, trees, and the call stack (#62)
- C949 practice: a final practice page of 40 new questions mixing every chapter (written and independently verified by a workflow, one writer and one checker per chapter group), and a random practice quiz that builds 10 new questions each time from 12 generators (Big-O of code, Big-O facts, binary search mids, heap insert and remove, BST traversals, probing, sort passes, radix pass, stack and queue traces, BFS and DFS, recursion), with topic filters and instant feedback (#61)
- C949 diagrams for chapters 9 and 10: a graph-search bench (BFS, stack DFS, recursive DFS, with the queue, stack, or call stack), a Dijkstra bench (one relaxation at a time, with distances, predecessors, and the shortest path), and a 2-3-4 tree bench (random inserts with preemptive splits, and search), each on setups the questions don't use (#59)
- C949 aligned with zyBooks: chapters 1 and 5 to 8 checked against the zyBooks chapter text (conventions, missing topics, and wrong answers fixed, new questions added), new chapters 9 (graphs) and 10 (B-trees and 2-3-4 trees), and chapter 21 (recursion), which completes the guide. Written by a workflow of one agent per chapter, each followed by an independent agent that re-derived every answer in Python and checked the zyBooks fit and house rules (#58)
- C949 chapters 5 to 8: trees (shapes, BST search, insert, remove, traversals, tries), balanced trees (rotations, AVL balance factors and the four cases, red-black rules and insert), heaps and treaps (array indexes, percolate up and down, heapify, priority queues, heap sort, treaps), and sets (operations, filter and map, hash vs BST sets, Python's set), with 21 questions. New diagrams: a BST bench (random inserts, search, remove, animated traversals), an AVL bench (the four cases), and red-black, treap, and set-operation figures; the heap bench now inserts random values only (#57)
- C949 chapter 11 complete: searching (linear, binary with the ⌊log₂ n⌋ + 1 bound and mid-value traces, interpolation) and sorting (all ten sorts with traces, best/average/worst, stability, and code clues), following zyBooks' conventions (middle-element quicksort pivot, 2ᵏ − 1 shell gaps, bucket index ⌊x·k/(M + 1)⌋, 0-based quickselect), plus eight more questions (#56)
- Visual redesign: Space Grotesk headings with Inter and JetBrains Mono across the site; for C949, interactive benches (linked list, stack and circular queue, hash probing, max-heap, sorting, a loop tracer), a Big-O growth chart, a cost spectrum, chapter picture cards, static drawings (Huffman tree, memory allocation, tree shapes), and color-coded complexity chips in tables, all from `docs/javascripts/viz.js` (#55)
- C949 is now a study guide that follows the zyBooks chapters and covers the course study guide's topics (a topic map lists each one by competency, with where it's covered): chapters 1 to 4, an algorithm-analysis page (chapter 11: finding Big-O by tracing, ten worked patterns from loops to recursion), and a programming-concepts page (12 to 20), each explaining how every structure and operation works, with Big-O best/average/worst and interactive questions that tick Done; a Big-O cheat sheet for the whole course, following the course study guide's conventions (radix O(n·k), counting and bucket O(n + k)); the Python lessons moved to an optional Practice in code section, with redirects from their old URLs. The quiz hook now takes a glob of pages (#54)
- The course is C949, not D949: renamed the folder (`C949_Data_Structures_And_Algorithms_I`), its slug and URLs (`/wgu/c949/`), and every mention, including the social card. Old `/wgu/d949/...` links redirect to the new pages, anchors included (`old_slugs` in mkdocs.yml, `hooks/redirects.py`) (#53)
- C949 exercise pages: an overview with a progress bar per lesson, and one page per lesson (short intro, folded lesson code, exercise cards with Done boxes). Hints and solutions are generated from `c949-practice/solutions/` by `build_solutions.py`, which CI keeps in sync; CI also runs `pytest --solutions`. Lesson 7 has its own pseudocode, and 3.6, 5.7, and 6.6 have written answers, so nothing points to the WGU guide for content (#53)
- 11.25: name a CHECK inside CREATE TABLE, then change its rule (DROP CHECK + ADD CONSTRAINT under the same name, in one ALTER TABLE) (#52)
- Practice-test gaps filled: plain ALTER TABLE ADD PRIMARY KEY (11.23) and ADD FOREIGN KEY (11.24) drills, DELETE by ID (12.23), and counting attributes in an address (13.11f) (#51)
- Exercise text is easier to read: about 70 exercises across D427 that ran several instructions together now have a lead line and one bullet per step, with the row count on its own line (#50)
- Second prose pass (humanizer), deeper: about 30 small fixes, mostly solutions.sql comments that repeated their hints, plus run-ups and decorative bold across the D427 pages, errors.md, and the C949 overview (#49)
- Try it's TRUNCATE restarts the counter whatever case or backticks the table name is written in, so 7.13 gives MySQL's GuestIDs (#48)
- Prose pass for AI-writing tells (humanizer): a dozen small wording fixes across the D427 pages, solutions.sql comments, AUTHORING, and the C949 overview (#47)
- Try it runs SHOW TABLES, DESCRIBE, and SHOW CREATE TABLE (7.7's hint uses SHOW CREATE TABLE), showing setup.sql's CREATE TABLE and MySQL column types (#46)
- Part 1 and Section 12 put Show tables on its own line between the exercise label and the question, as Part 2 does under its Uses line (#45)
- Setup's Option C: DB Fiddle runs MySQL 8.4 online with nothing to install (tested with setup.sql, ALTER, SHOW, EXPLAIN, and a second database); Sections 8 to 11 and 14 say they need MySQL and link to Setup (#44)
- Try it boxes on Section 7 (INSERT, UPDATE, DELETE): each starts from the earlier exercises' solutions, Check compares the tables (and 7.9's column definitions), with foreign keys, AUTO_INCREMENT, and TRUNCATE behaving like MySQL; 6.6's NOT EXISTS solution drops its aliases (#43)
- Exercise 5.5 is a self-join only: it shows each person's DeptID instead of joining Department twice (#42)
- Exercise 5.3 now says that changing only LEFT to RIGHT isn't enough to get 5.2's rows (#40)
- No more Show tables box under the headings of Part 1 and Section 12: each exercise's own box is enough, and the first one under a heading holds the diagram (#39)
- Folding exercise cards: a chevron folds a card to one line, and a remembered "Collapse completed exercises" switch folds the ones marked Done; every exercise that reads `setup.sql` tables has its own Show tables button, including tables with no foreign keys (#38)
- Layout polish: one text size for a whole exercise card, tighter cards and tables on phones, rounded buttons, and a Sky Blue main button in dark mode (#37)
- Exercise cards: each exercise sits in its own card with its number as a badge, closed boxes shrink to one row of small buttons, and the page is wider on large screens; tables that scroll sideways get keyboard access again whenever their width changes (#36)
- Exercises 2.6, 2.9, 3.3, 3.5, 3.8, 4.7, 6.6, 12.6, 12.12, 12.18, and 12.19 now say how many separate queries to write, matching what Check expects; 3.3 b) is a single TRIM call, and 3.8 keeps its follow-up questions (#35)
- Exercises 2.7 and 4.7 now say to write two separate queries, matching their solutions (#34)
- Exercise 2.4 now says to write two separate queries (#33)
- A "To review" tag next to each missed exercise on its own page; MkDocs now knows the exercise anchors, so its missing-anchor notices are gone (it still reports real broken anchors) (#31)
- No references to the real assessment: wording points to the D427 practice tests; renamed the cheat sheet to SQL quick reference, Assessment drills to Practice-test drills, and Mock assessment to Final practice (pages and URLs) (#28); the same for C949's READMEs (#29)
- Search finds exercises by number (one search entry per exercise); a To review list on the Overview of missed exercises (#26)
- Dependabot's first updates merged: GitHub Actions to new majors, Playwright 1.63, newer MkDocs/Material minimums (#23, #24)
- Drill: a constraint-wording mode (multiple choice, its own score); Check pairs each of your results with a different expected one on multi-query exercises (#25)
- sql.js pinned by hash (SRI on the script, a SHA-256 check on the .wasm, both verified in CI), and Dependabot for Actions and Python packages (#22)
- CI runs every SQL quick reference statement on MySQL 8.4, and an axe-core accessibility scan of every page in light and dark mode (#21)
- Link anchors on every exercise, a Continue button on the Overview, error decoder links straight to exercises, and the spec-to-type drill (#20)
- MySQL error decoder (`errors.md`, 21 errors, generated by `build_errors.py`) and the SQL quick reference (then called the cheat sheet), every statement run on MySQL 8.4 (#19)
- A failed Check shows extra rows, and (folded) missing rows; CI runs every SQL runner solution in SQLite (#18)
- `ROADMAP.md`, `AUTHORING.md`, a root README, and per-course settings in `mkdocs.yml` (`extra.courses`) (#16)
- Site published with MkDocs Material and GitHub Pages; WGU colors with a charcoal dark mode (#1)
- Local MySQL setup option and `setup.sql` download links (#2, #3)
- Tables written from specs instead of copied `CREATE TABLE` (#5)
- Learners choose integer sizes from stated ranges; reading-integer-specs box and drills 11.21–11.22; final practice 14.1 in practice-test wording (#7, #8)
- SQL runner on Part 1 (#4) and Section 12 (#14)
- Interactive Part 4 quiz and glossary tooltips (#6)
- CI checks on every PR (#9); branch protection on `main`
- ER diagrams drawn as SVG from `setup.sql`, stacked on phones (#10, #11, #12)
- Join and FK delete-rule diagrams (#13); org-chart self-join diagrams (#14)
- Exercise progress tracking with per-part bars on the Overview (#14)
- Page footers, favicon and link previews, print styles, accessibility fixes (#15)
