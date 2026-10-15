# WGU Study Kits

Unofficial practice material for WGU courses, published at **[jeubanks.github.io/wgu](https://jeubanks.github.io/wgu/)**. Not affiliated with or endorsed by Western Governors University.

| Course | What's there |
|---|---|
| [D427 Data Management – Applications](D427_Data_Management_Applications/) | 151 MySQL exercises with hints and solutions, a concepts-check quiz, a final practice set, ER and join diagrams, and SQL you can run in the browser. [Setup](D427_Data_Management_Applications/README.md) · [Start here](D427_Data_Management_Applications/exercises.md) |
| [D949 Data Structures and Algorithms I](D949_Data_Structures_And_Algorithms_I/) | Python lessons with pytest checks. [Start here](D949_Data_Structures_And_Algorithms_I/README.md) |

## Layout

| Path | What it is |
|---|---|
| `D427_…/`, `D949_…/` | The courses: exercise pages (Markdown), SQL or Python, and their build scripts |
| `docs/` | The site's own pages, styles, and scripts; `docs/d427` and `docs/d949` are symlinks to the course folders |
| `hooks/` | MkDocs build hooks that add the interactive parts (quiz, SQL runner, diagrams, progress) |
| `mkdocs.yml` | Site settings, including each course's features (`extra.courses`) |
| `overrides/`, `includes/` | Theme additions (link previews) and the glossary tooltips |
| `scripts/` | CI helpers and one-off generators |
| [`AUTHORING.md`](AUTHORING.md) | How to write pages, use each feature, and add a course |
| [`ROADMAP.md`](ROADMAP.md) | What's planned next, and what's done |

## Working on it

```bash
python3 -m venv .venv && .venv/bin/pip install -r requirements-docs.txt
.venv/bin/mkdocs serve
```

Then open `http://127.0.0.1:8000/wgu/`. Changes go through pull requests; CI builds the site, checks links, runs the SQL on MySQL 8.4, and checks that generated files are up to date. Merging to `main` publishes the site.

Found a mistake? Use **Report a problem** at the bottom of any page.
