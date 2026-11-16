# D949 Data Structures and Algorithms I: Python Practice

44 exercises in seven lessons: Big-O, linked lists, stacks and queues, hash tables, trees and heaps, searching and sorting, graphs, and tracing pseudocode by hand.

Each lesson page has a short intro, the lesson code, and the exercises. You write your answers in the matching `lessonN.py` file and run it to check them. Hints and solutions are folded under each exercise.

## Contents

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
cd wgu/D949_Data_Structures_And_Algorithms_I/c949-practice
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

Tick **Done** on an exercise once its line shows ✓. See [Python practice](c949-practice/README.md) for running the checks with pytest.

> [!TIP]
> Do the paper traces on paper first. The checks tell you whether you're right, but working it out by hand is the skill you're practicing.
