"""Course settings for the build hooks, read from `extra.courses` in mkdocs.yml.

Not a hook itself: the hooks import it and call load(config) from on_config.
Each course is a folder in the repo, symlinked into docs/ under its slug, and
turns on the build features it uses by listing pages for them:

    extra:
      courses:
        d427:                                   # slug: docs/d427 -> folder
          folder: D427_Data_Management_Applications
          progress:                             # Done boxes + overview bars
            overview: exercises.md
            pages: "0[0-9]-*.md"
          setup_sql: setup.sql                  # sample data for the features below
          er_diagrams:                          # "Show tables" diagrams
            readme: README.md                   # full diagram (also on GitHub)
            pages: [01-queries.md, ...]
          concept_diagrams: true                # join/delete/tree-diagram blocks
          sql_runner:                           # Try it boxes: page -> sections
            pages: {01-queries.md: [1, 2, 3, 4, 5, 6]}
            skip: {"12.20": "Why it's left out."}
            changes: [7]                        # sections whose exercises change data
          quiz: 04-concepts-check.md            # interactive answer keys

A course with only `folder` is published as plain pages. See AUTHORING.md.
"""
from dataclasses import dataclass, field
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


@dataclass
class Course:
    slug: str
    folder: Path
    progress_overview: str = None
    progress_pages: str = None
    setup_sql: Path = None
    er_readme: str = None
    er_pages: tuple = ()
    concept_diagrams: bool = False
    runner_pages: dict = field(default_factory=dict)
    runner_skip: dict = field(default_factory=dict)
    runner_changes: tuple = ()
    quiz: str = None

    def uri(self, page):
        """The docs/ path MkDocs uses for one of this course's pages."""
        return f"{self.slug}/{page}"

    def page(self, src_uri):
        """The course-relative page name, or None if src_uri isn't in this course."""
        prefix = self.slug + "/"
        return src_uri[len(prefix):] if src_uri.startswith(prefix) else None


_courses = None


def load(config):
    """Read the courses from the MkDocs config and return them.

    Every hook calls this from on_config; it re-reads each build, so edits to
    mkdocs.yml apply under `mkdocs serve` too.
    """
    global _courses
    raw = (config.get("extra") or {}).get("courses") or {}
    _courses = [_course(slug, settings or {}) for slug, settings in raw.items()]
    return _courses


def _course(slug, s):
    if "folder" not in s:
        raise ValueError(f"extra.courses.{slug}: 'folder' is required")
    folder = ROOT / s["folder"]
    if not folder.is_dir():
        raise ValueError(f"extra.courses.{slug}: folder {s['folder']} doesn't exist")
    progress = s.get("progress") or {}
    er = s.get("er_diagrams") or {}
    runner = s.get("sql_runner") or {}
    return Course(
        slug=slug,
        folder=folder,
        progress_overview=progress.get("overview"),
        progress_pages=progress.get("pages"),
        setup_sql=folder / s["setup_sql"] if s.get("setup_sql") else None,
        er_readme=er.get("readme"),
        er_pages=tuple(er.get("pages") or ()),
        concept_diagrams=bool(s.get("concept_diagrams")),
        runner_pages={page: tuple(sections) for page, sections in (runner.get("pages") or {}).items()},
        runner_skip={str(k): v for k, v in (runner.get("skip") or {}).items()},
        runner_changes=tuple(runner.get("changes") or ()),
        quiz=s.get("quiz"),
    )


def get():
    """The courses, after load(config) has run."""
    if _courses is None:
        raise RuntimeError("courses.load(config) hasn't run; call it from on_config")
    return _courses


def for_page(src_uri):
    """(course, course-relative page) for a docs/ path, or (None, None)."""
    for course in get():
        page = course.page(src_uri)
        if page is not None:
            return course, page
    return None, None
