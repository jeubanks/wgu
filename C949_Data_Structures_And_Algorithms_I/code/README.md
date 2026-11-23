# Practice in code

Optional. The [study guide](../README.md) pages are the main path; these lessons let you build the same structures in Python, if you want to. 44 exercises in seven lessons: Big-O, linked lists, stacks and queues, hash tables, trees and heaps, searching and sorting, graphs, and tracing pseudocode by hand.

Each lesson page has a short intro, the lesson code, and the exercises. You write your answers in the matching `lessonN.py` file and run it to check them. Hints and solutions are folded under each exercise.

## Lessons

- **[Lesson 1: Big-O by experiment](01-big-o.md)**: timing code, classifying loops, recursion
- **[Lesson 2: Linked lists, stacks, and queues](02-lists-stacks-queues.md)**
- **[Lesson 3: Hash tables](03-hash-tables.md)**: chaining, probing, and hashing strings
- **[Lesson 4: BSTs, traversals, and heaps](04-trees-heaps.md)**
- **[Lesson 5: Searching and sorting](05-searching-sorting.md)**
- **[Lesson 6: Graphs](06-graphs.md)**: optional, mostly beyond this course
- **[Lesson 7: Tracing pseudocode](07-tracing.md)**: paper only, no code to write

## Suggested order

Start with Lesson 7, then 1, 2, 5, 3, and 4. Lesson 6 is optional.

Big-O and tracing come up all through the course, so they go first. Lesson 7 needs nothing but paper and a pencil.

## Getting started

Requires **Python 3.10+**. Get the files with Git, or download the repository as a ZIP from GitHub:

```bash
git clone https://github.com/jeubanks/wgu.git
cd wgu/C949_Data_Structures_And_Algorithms_I/c949-practice
```

Then, for each lesson:

1. Open `lessonN.py`. The lesson code at the top is complete. Read it, and run it with `python lessonN.py --demo`.
2. Each exercise is a function that raises `NotImplementedError`, or a variable set to `None` (the paper traces). Replace it with your answer.
3. Run `python lessonN.py` to check your work:

```
  ✓  2.1 trace stack and queue
  ✗  2.2 reverse  tail not updated
  ·  2.3 is_balanced  (not started)

1/5 passing
```

See [Running the checks](../c949-practice/README.md) for running the checks with pytest.

> [!TIP]
> Do the paper traces on paper first. The checks tell you whether you're right, but working it out by hand is the skill you're practicing.


## Run Python online

No Python on your computer? These free sites run Python in the browser. Free tiers and limits change, so check a site's current terms if you plan to rely on it.

| Site | Use it for | Notes |
|---|---|---|
| [Python Tutor](https://pythontutor.com/visualize.html) | Watching code run one line at a time, with every variable, the call stack, and the arrows between objects drawn for you | Best for tracing recursion, linked lists, and trees. Short programs only. No account needed. |
| [GitHub Codespaces](https://github.com/codespaces) | Running these lessons exactly as written: `python lesson2.py` and `pytest` | Opens this repository in VS Code in your browser. Free GitHub accounts get a monthly allowance of hours. The only option here that runs the lesson files, which import `_checker.py`, without changes. |
| [Google Colab](https://colab.research.google.com/) | Trying functions in a notebook | Needs a Google account. To use a lesson, paste `_checker.py` into the first cell, then the lesson file into the next. |
| [Programiz](https://www.programiz.com/python-programming/online-compiler/) | Quick one-file experiments | No account needed. |
| [OnlineGDB](https://www.onlinegdb.com/online_python_compiler) | One file, with a debugger that steps through it | No account needed for basic use. |
| [Trinket](https://trinket.io/python) | Small projects with more than one file | Add `_checker.py` as a second file next to the lesson. The free tier has limits. |

To open the lessons in Codespaces: on the repository's GitHub page, choose **Code**, then **Codespaces**, then **Create codespace**. In its terminal, run:

```bash
cd C949_Data_Structures_And_Algorithms_I/c949-practice
python lesson1.py
```
