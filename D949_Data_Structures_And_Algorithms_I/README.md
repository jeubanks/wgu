# WGU C949 Data Structures and Algorithms I: Study Kit

A study guide, a plain-English Big-O primer, and hands-on Python practice for WGU's **C949 Data Structures and Algorithms I**. It's built around the course's Objective Assessment (OA): what the exam weights, how it asks questions, and the skills that trip people up, especially Big-O and tracing pseudocode by hand.

> Unofficial. Not affiliated with or endorsed by Western Governors University. Always check your zyBooks chapters and course materials. Where this kit and the course disagree, the course wins on exam day.

## What's inside

```
.
├── README.md
├── C949 Study Guide.pdf             # Main guide: exam blueprint, every topic, exam traps
├── C949 Big-O Made Easy.pdf         # Big-O decoder, 15 worked examples, sort reference table
├── C949 Python Practice.pdf         # 7 lessons with exercises and full solutions
└── c949-practice/
    ├── lesson1.py … lesson7.py      # Your work: lesson code + empty exercise stubs + checks
    ├── solutions/                   # Finished versions of every lesson file
    ├── tests/                       # pytest suite (same checks as the lesson files)
    ├── _checker.py, conftest.py     # Plumbing; no need to edit
    ├── pytest.ini
    └── README.md                    # Practice-specific instructions
```

### The guides (PDFs)

| File | What it covers | Start here if… |
| --- | --- | --- |
| **C949 Study Guide** | Exam blueprint and competency weights, programming basics, Big-O, tracing pseudocode, recursion, searching and sorting, lists/stacks/queues/ADTs, hash tables, trees and heaps, graphs, common exam traps | You want the whole course in one place |
| **Big-O Made Easy** | A five-step method for finding the Big-O of any code, a loop-counting cheat sheet, 15 worked examples, the class Big-O worksheet decoded, best/average/worst tables for every sort, 12 practice problems | Big-O is the part that isn't clicking |
| **Python Practice** | Build each data structure yourself, then practice: Big-O experiments, linked lists, stacks, queues, hash tables, BSTs, heaps, sorts, graphs, and pseudocode tracing drills | You learn by doing |

### The practice code (`c949-practice/`)

Each lesson file contains working lesson code at the top and exercises below it. Code exercises start as functions that raise `NotImplementedError`; paper-trace exercises are variables set to `None` that you fill in with your answer.

## Getting started

Requires **Python 3.10+**.

```bash
git clone <this-repo-url>
cd <repo>/c949-practice
python lesson1.py          # check your progress on Lesson 1
python lesson1.py --demo   # also run the lesson's example code
```

Sample output:

```
  ✓  2.1 trace stack and queue
  ✗  2.2 reverse  tail not updated
  ·  2.3 is_balanced  (not started)

1/5 passing
```

### With pytest

```bash
pip install pytest
pytest                        # every lesson; unstarted exercises show as skipped
pytest tests/test_lesson4.py  # one lesson
pytest -k reverse             # one exercise by name
pytest --solutions            # run the same checks against the answer key
```

## Suggested study order

| Priority | Material | Why |
| --- | --- | --- |
| 1 | Study Guide: *Exam blueprint* | See what the exam weights before you study |
| 2 | Take the course pre-assessment | Use its coaching report to find your weak areas |
| 3 | Big-O Made Easy, plus Lessons 7 and 1 | Big-O and tracing feed into most exam questions |
| 4 | Lessons 2 and 5 | Stacks, queues, lists, searching, and sorting |
| 5 | Lessons 3 and 4 | Hash tables, trees, and heaps |
| 6 | Lesson 6 (optional) | Graph algorithms are mostly beyond this exam |

Retake the pre-assessment once you can trace code on paper without guessing.

## Exam blueprint at a glance

| Competency | Weight |
| --- | --- |
| Applies Algorithms | 40% |
| Determines Data Structure Impact | 31% |
| Explains Algorithms | 29% |

The exam shows code as pseudocode or Python. The full topic list and zyBooks chapter map are in the Study Guide.

## Recommended reading

**[A Common-Sense Guide to Data Structures and Algorithms, Second Edition](https://pragprog.com/titles/jwdsal2/a-common-sense-guide-to-data-structures-and-algorithms-second-edition/)** by Jay Wengrow (The Pragmatic Bookshelf). It explains Big-O and the core data structures in plain English, which makes it a strong companion to this kit. The publisher sells the ebook DRM-free, and one purchase includes PDF and EPUB. The author has also published [Python-specific editions](https://www.commonsensedev.com/books), which match the language this course uses.

### EPUB readers

| Platform | Reader | Install |
| --- | --- | --- |
| Linux | [Foliate](https://johnfactotum.github.io/foliate/) | `sudo apt install foliate` (Ubuntu), `sudo dnf install foliate` (Fedora), or `flatpak install flathub com.github.johnfactotum.Foliate` |
| macOS | Apple Books | Built in; double-click the `.epub` |
| Windows | [Thorium Reader](https://www.edrlab.org/software/thorium-reader/) | Free from the Microsoft Store or the EDRLab site |
| Any | [Calibre](https://calibre-ebook.com/) | Free on all three; also converts between ebook formats |

## Notes

- **Exam conventions:** following the class Big-O worksheet, the sort tables use O(n) for radix sort and O(n) for bucket sort's average case. Textbooks often write O(nk) and O(n + k).
- **Verified code:** every lesson example and solution in `c949-practice/` was run against its checks (43 passing in `pytest --solutions`).
- **Course materials not included:** the official WGU course study guide and Big-O worksheet belong to WGU and are not redistributed here; get them from your course resources.

## Contributing

Found a mistake or a confusing explanation? Open an issue or a pull request. Corrections that match the current zyBooks content are especially welcome.
