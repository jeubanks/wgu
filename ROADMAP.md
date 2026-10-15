# Roadmap

The running list of improvements for this repo and its site. Work through it top to bottom, a few items per PR. Each PR updates this file: tick off what it finished (move it to **Done**, with the PR number) and add anything new it turned up.

D427 is the model course. Once its patterns are settled, other courses reuse them.

## Up next

- [ ] **Error message decoder**: a page generated from the error comments in `solutions.sql` (1451, 1452, 1264, 3819, 3780, 1364, 1136, 1055, ...): what each means, its usual cause, and which exercises show it.
- [ ] **Exam-day cheat sheet**: one printable page with integer and decimal ranges, join wording, FK delete rules, ALTER TABLE forms, and GROUP BY / HAVING rules.

## Backlog

### Studying

- [ ] **Continue where you left off**: a button on the Overview that jumps to the first exercise not marked Done, plus a link anchor on every exercise (`#ex-7-3`).
- [ ] **Spec-to-type drill**: endless random prompts ("integer with range 0 to 300", "decimal up to $9,999.99") answered and checked one after another.

### Keep it working

- [ ] **Row diff for multi-query exercises**: when an exercise expects several results, say which of yours lines up with which expected result, not just the closest pair.
- [ ] **Accessibility in CI**: run the axe-core scan on every PR so it stays at 0 violations.
- [ ] **Dependabot**: weekly update PRs for the pinned GitHub Actions and Python packages.
- [ ] **Integrity hash on sql.js**: so the browser refuses the file if the CDN ever serves something different.

### Waiting on a decision

- [ ] **Timed mode for the mock assessment**: a 60-minute timer, hints and solutions locked until you finish, then a self-scored result.

### Parked

- [ ] **D949**: run the Python lessons in the browser (Pyodide), and data-structure diagrams with the SVG renderer. Left alone for now.

## Done

- A failed Check shows extra rows, and (folded) missing rows; CI runs every SQL runner solution in SQLite (#18)
- `ROADMAP.md`, `AUTHORING.md`, a root README, and per-course settings in `mkdocs.yml` (`extra.courses`) (#16)
- Site published with MkDocs Material and GitHub Pages; WGU colors with a charcoal dark mode (#1)
- Local MySQL setup option and `setup.sql` download links (#2, #3)
- Tables written from specs instead of copied `CREATE TABLE` (#5)
- Learners choose integer sizes from stated ranges; reading-integer-specs box and drills 11.21–11.22; mock 14.1 in exam wording (#7, #8)
- SQL runner on Part 1 (#4) and Section 12 (#14)
- Interactive Part 4 quiz and glossary tooltips (#6)
- CI checks on every PR (#9); branch protection on `main`
- ER diagrams drawn as SVG from `setup.sql`, stacked on phones (#10, #11, #12)
- Join and FK delete-rule diagrams (#13); org-chart self-join diagrams (#14)
- Exercise progress tracking with per-part bars on the Overview (#14)
- Page footers, favicon and link previews, print styles, accessibility fixes (#15)
