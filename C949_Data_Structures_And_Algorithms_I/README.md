# WGU C949 Data Structures and Algorithms I: Study Guide

A concise study guide for WGU's C949 Data Structures and Algorithms I, organized by the three competencies in the course study guide. Each page explains one group of topics in plain words, with a drawn example and best, average, and worst-case Big-O. Each page ends with questions so you can check yourself.

You can read it online at **[jeubanks.github.io/wgu](https://jeubanks.github.io/wgu/c949/)**. On the site, the questions check your answers, and you can track which ones you've finished.

<div class="viz" data-viz="cost-spectrum" markdown>

*On the site, a chart here compares how much work each growth class does for 1,000 items.*

</div>

> Unofficial. Not affiliated with or endorsed by Western Governors University. Always check your zyBooks chapters and course materials. Where this guide and the course disagree, the course wins.

## Contents

<div class="viz" data-viz="chapter-map" markdown>

- **[1. Tracing code](01-tracing-code.md)**: reading pseudocode, variable tables for loops, tracing recursion on the call stack
- **[2. Searching](02-searching.md)**: linear search and binary search, step by step
- **[3. Sorting](03-sorting.md)**: the major sorts, their best, average, and worst cases, and how to spot each one in code
- **[4. Algorithm analysis](04-algorithm-analysis.md)**: growth rates, best, average, and worst case, and finding the Big-O of code
- **[5. ADTs and design properties](05-adts.md)**: every ADT with its Python commands, what pop() removes, and how the structures compare
- **[6. Lists, stacks, and queues](06-lists-stacks-queues.md)**: arrays, singly and doubly linked lists, stacks, queues, and deques
- **[7. Hash tables](07-hash-tables.md)**: hashing with modulo, chaining, probing, and Python's dict
- **[8. Trees and heaps](08-trees-heaps.md)**: tree terms, binary search trees, traversals, heaps and their index math, priority queues
- **[9. Sets and graphs](09-sets-graphs.md)**: set operations, graph terms, adjacency lists and matrices, BFS and DFS
- **[10. Programming basics](10-programming-basics.md)**: data types, operators and precedence, branching, loops, classes, and memory
- **[Final practice](11-final-practice.md)**: questions that mix every page, for when you've finished the guide

</div>

Pages 1–4 cover **Explains Algorithms**, pages 5–9 cover **Determines Data Structure Impact**, and page 10 covers **Applies Algorithms**, which also draws on pages 1–9.

[Beyond the guide](beyond-the-guide.md) briefly covers the zyBooks topics that aren't on the course study guide's list: balanced trees, B-trees, shortest paths, greedy algorithms, dynamic programming, and more. Know what each one is and what it costs.

The [Big-O cheat sheet](big-o.md) puts every structure and algorithm on one printable page, with best, average, and worst cases.

The [topic map](topics.md) is a checklist. It lists every topic in the course study guide by competency and shows where this guide covers it.

For practice with new numbers every time, the [practice quiz](practice-quiz.md) builds a random 10-question quiz from the topics you pick, and checks each answer.

If you want more practice, the optional [Practice in code](code/README.md) section has seven Python lessons where you build these structures yourself and run checks on your code. [Lesson 7: Tracing pseudocode](code/07-tracing.md) needs only paper, and you can do it at any point.

## How to use this guide

1. Work through the pages in order. Each one is short.
2. Answer the questions at the end of each page without looking back. Each one tells you right away whether you got it right, and the folded **Answer** explains why.
3. Practice tracing on paper or a whiteboard. Write down every variable at every step, because one skipped step changes the answer.
4. Keep the [Big-O cheat sheet](big-o.md) open. For each operation, learn the best, average, and worst case, and what causes each: "searching a BST is O(log n) on average, and O(n) when the keys went in already sorted."

The course materials show code as pseudocode or Python. The full topic list is in the course study guide, in your WGU course resources. Take the course pre-assessment early, and use its coaching report to decide which pages to focus on.

## Recommended reading

**[A Common-Sense Guide to Data Structures and Algorithms, Second Edition](https://pragprog.com/titles/jwdsal2/a-common-sense-guide-to-data-structures-and-algorithms-second-edition/)** by Jay Wengrow (The Pragmatic Bookshelf). It explains Big-O and the core data structures in plain English. The publisher sells the ebook DRM-free, and one purchase includes both PDF and EPUB. The author has also published [Python-specific editions](https://www.commonsensedev.com/books), which use the same language as this course.

### EPUB readers

| Platform | Reader | Install |
| --- | --- | --- |
| Linux | [Foliate](https://johnfactotum.github.io/foliate/) | `sudo apt install foliate` (Ubuntu), `sudo dnf install foliate` (Fedora), or `flatpak install flathub com.github.johnfactotum.Foliate` |
| macOS | Apple Books | Built in; double-click the `.epub` |
| Windows | [Thorium Reader](https://www.edrlab.org/software/thorium-reader/) | Free from the Microsoft Store or the EDRLab site |
| Any | [Calibre](https://calibre-ebook.com/) | Free on all three; also converts between ebook formats |

## What's inside

```
.
├── README.md                        # This page: the guide's contents
├── 01-tracing-code.md … 10-programming-basics.md
│                                    # Topic pages: the idea, Big-O, questions
├── 11-final-practice.md             # Mixed questions from every page
├── beyond-the-guide.md              # Brief notes on topics outside the course study guide
├── big-o.md                         # Big-O cheat sheet
├── code/                            # Optional Python lessons (pages)
├── build_solutions.py               # Copies hints, solutions, and lesson code into code/
└── c949-practice/                   # The Python lesson files, solutions, and checks
```

## Notes

- The cheat sheet uses the course study guide's Big-O conventions, such as O(n·k) for radix sort and O(n + k) for bucket and counting sort.
- Topics come from the course study guide in your course resources. The [topic map](topics.md) shows where each study-guide topic is covered here.
- Every lesson example and solution in `c949-practice/` has been run against its checks (43 pass in `pytest --solutions`).
- The WGU course study guide, Big-O worksheet, and other course PDFs belong to WGU and are not included here. Get them from your course resources.

## Contributing

Found a mistake or a confusing explanation? Open an issue or a pull request. Corrections backed by the course materials are especially welcome.
