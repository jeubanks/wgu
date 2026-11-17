# WGU C949 Data Structures and Algorithms I: Study Guide

A study guide for WGU's C949 Data Structures and Algorithms I that follows the zyBooks chapters. For each data structure and algorithm, it explains how it works, step by step, and what it costs: the Big-O in the best, average, and worst case. Each chapter ends with questions to check yourself.

Read it online at **[jeubanks.github.io/wgu](https://jeubanks.github.io/wgu/c949/)**, where the questions check your answers and you can track which ones you've finished.

<div class="viz" data-viz="cost-spectrum" markdown>

*On the site, a chart here compares how much work each growth class does for 1,000 items.*

</div>

> Unofficial. Not affiliated with or endorsed by Western Governors University. Always check your zyBooks chapters and course materials. Where this guide and the course disagree, the course wins.

## Contents

Chapter numbers match the zyBooks chapters.

<div class="viz" data-viz="chapter-map" markdown>

- **[1. Introduction to data structures and algorithms](01-introduction.md)**: ADTs, Huffman compression, heuristics, greedy algorithms, dynamic programming
- **[2. Lists](02-lists.md)**: singly- and doubly-linked lists, circular lists, dummy nodes, array-based lists
- **[3. Stacks and queues](03-stacks-queues.md)**: stacks, queues, and deques, built on linked lists and on arrays
- **[4. Hash tables](04-hash-tables.md)**: chaining, linear and quadratic probing, double hashing, resizing, hash functions
- **[5. Trees](05-trees.md)**: binary trees and their shapes, binary search trees (search, insert, remove, traversals), tries
- **[6. Balanced trees](06-balanced-trees.md)**: rotations, AVL trees and balance factors, red-black trees
- **[7. Heaps and treaps](07-heaps-treaps.md)**: max- and min-heaps in an array, priority queues, heap sort, treaps
- **[8. Sets](08-sets.md)**: the set ADT, union, intersection, difference, filter and map, and Python's set
- **[9. Graphs](09-graphs.md)**: adjacency lists and matrices, BFS and DFS, directed and weighted graphs, Dijkstra, Bellman-Ford, topological sort, minimum spanning trees, all-pairs shortest paths
- **[10. B-trees](10-b-trees.md)**: B-trees of order m, 2-3-4 tree search, insert (splits), and remove (rotations and fusion)
- **[11. Searching and algorithm analysis](11-algorithm-analysis.md)**: linear and binary search, finding Big-O by tracing (ten worked patterns), and all ten sorts with their best, average, and worst cases
- **[12–20. Programming concepts](12-programming-concepts.md)**: reading code, static and dynamic typing, operators, loops, classes, memory management, data flow diagrams, and what Python's lists, dicts, and sets cost
- **[21. Recursion](21-recursion.md)**: base and recursive cases, the call stack, recursive search, debugging output, recursive math, and exploring all possibilities (permutations and subsets)

</div>

**Reference:** the [Big-O cheat sheet](big-o.md) puts every structure and algorithm in the course on one printable page, with best, average, and worst cases.

**Checklist:** the [topic map](topics.md) lists every topic in the course study guide, by competency, with where it's covered here.

**Optional:** [Practice in code](code/README.md) has seven Python lessons where you build these structures yourself, with checks. Its Lesson 7, [tracing pseudocode](code/07-tracing.md), needs only paper and fits in anywhere.

## How to use this guide

1. Read a chapter here alongside the zyBooks chapter with the same number.
2. Answer the questions at the end of the chapter without looking back. Each one tells you right away if you got it, and the folded **Answer** explains why.
3. Keep the [Big-O cheat sheet](big-o.md) open. Most questions come down to knowing what an operation costs and why.

Big-O questions ask about the **best**, **average**, and **worst** case. For each operation, learn all three, and the situation that causes each one: "searching a BST is O(log n) on average, and O(n) when the keys went in already sorted."

## Course competencies

The course is organized around three competencies:

- Applies Algorithms
- Determines Data Structure Impact
- Explains Algorithms

The course materials show code as pseudocode or Python. The full topic list and zyBooks chapter map are in the course study guide in your WGU course resources. Take the course pre-assessment early, and use its coaching report to pick which chapters to focus on.

## Recommended reading

**[A Common-Sense Guide to Data Structures and Algorithms, Second Edition](https://pragprog.com/titles/jwdsal2/a-common-sense-guide-to-data-structures-and-algorithms-second-edition/)** by Jay Wengrow (The Pragmatic Bookshelf). It explains Big-O and the core data structures in plain English. The publisher sells the ebook DRM-free, and one purchase includes PDF and EPUB. The author has also published [Python-specific editions](https://www.commonsensedev.com/books), which match the language this course uses.

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
├── 01-introduction.md … 12-programming-concepts.md
│                                    # Chapter pages: how it works, Big-O, questions
├── big-o.md                         # Big-O cheat sheet
├── code/                            # Optional Python lessons (pages)
├── build_solutions.py               # Copies hints, solutions, and lesson code into code/
└── c949-practice/                   # The Python lesson files, solutions, and checks
```

## Notes

- The cheat sheet follows the course study guide's Big-O conventions, like O(n·k) for radix sort and O(n + k) for bucket and counting sort.
- Topics come from the zyBooks chapters and the course study guide in your course resources. The [topic map](topics.md) shows where each study-guide topic is covered here.
- Every lesson example and solution in `c949-practice/` was run against its checks (43 passing in `pytest --solutions`).
- The WGU course study guide, Big-O worksheet, and other course PDFs belong to WGU and are not included here. Get them from your course resources.

## Contributing

Found a mistake or a confusing explanation? Open an issue or a pull request. Corrections that match the current zyBooks content are especially welcome.
