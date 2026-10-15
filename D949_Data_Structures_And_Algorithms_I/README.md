# WGU C949 Data Structures and Algorithms I: Practice Kit

Hands-on Python practice for WGU's **C949 Data Structures and Algorithms I**. It's built around the course's Objective Assessment (OA): what the exam weights, how it asks questions, and the skills that trip people up, especially Big-O and tracing pseudocode by hand.

Read it online at **[jeubanks.github.io/wgu](https://jeubanks.github.io/wgu/d949/)**.

> Unofficial. Not affiliated with or endorsed by Western Governors University. Always check your zyBooks chapters and course materials. Where this kit and the course disagree, the course wins on exam day.

## What's inside

```
.
├── README.md
└── c949-practice/
    ├── lesson1.py … lesson7.py      # Your work: lesson code + empty exercise stubs + checks
    ├── solutions/                   # Finished versions of every lesson file
    ├── tests/                       # pytest suite (same checks as the lesson files)
    ├── _checker.py, conftest.py     # Plumbing; no need to edit
    ├── pytest.ini
    └── README.md                    # Practice-specific instructions
```

### The practice code (`c949-practice/`)

Build each data structure yourself, then practice: Big-O experiments, linked lists, stacks, queues, hash tables, BSTs, heaps, sorts, graphs, and pseudocode tracing drills. Each lesson file contains working lesson code at the top and exercises below it. Code exercises start as functions that raise `NotImplementedError`; paper-trace exercises are variables set to `None` that you fill in with your answer.

## Getting started

Requires **Python 3.10+**.

```bash
git clone https://github.com/jeubanks/wgu.git
cd wgu/D949_Data_Structures_And_Algorithms_I/c949-practice
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
| 1 | [Exam blueprint](#exam-blueprint-at-a-glance) | See what the exam weights before you study |
| 2 | Take the course pre-assessment | Use its coaching report to find your weak areas |
| 3 | Lessons 7 and 1, plus the course Big-O worksheet | Big-O and tracing feed into most exam questions |
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

The exam shows code as pseudocode or Python. The full topic list and zyBooks chapter map are in the course study guide in your WGU course resources.

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
- **Course materials not included:** the WGU course study guide, Big-O worksheet, and other course PDFs belong to WGU and are not redistributed here. Get them from your course resources.

## Contributing

Found a mistake or a confusing explanation? Open an issue or a pull request. Corrections that match the current zyBooks content are especially welcome.
