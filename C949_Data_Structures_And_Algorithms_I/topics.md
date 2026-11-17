# Topic map

This page lists every topic in the C949 course study guide (in your WGU course resources), grouped by the course's three competencies, and shows where this guide covers each one. Use it as a checklist: once you can explain a topic and answer its questions without looking, move on.

For a quick review of what each topic costs, use the [Big-O cheat sheet](big-o.md). For hands-on practice, the optional [code lessons](code/README.md) have you build several of these structures yourself.

## Explains Algorithms

| Topic | Where |
|---|---|
| What makes something an algorithm: zyBooks' characteristics (unambiguity, finiteness, well-defined inputs and outputs, effectiveness, feasibility, language independence) | [1. Introduction](01-introduction.md#what-makes-something-an-algorithm) |
| Qualities of a good algorithm: correctness, simplicity, modularity, maintainability, robustness, extensibility | [1. Introduction](01-introduction.md#what-makes-something-an-algorithm) |
| Kinds of algorithms: brute force, recursive, backtracking, divide and conquer, greedy, dynamic programming, randomized, searching, sorting, hashing, encryption | [1. Introduction](01-introduction.md#kinds-of-algorithms) |
| Greedy algorithms and dynamic programming | [1. Introduction](01-introduction.md#greedy-algorithms) |
| Recursion: base case, recursive case, the call stack, tracing factorial | [21. Recursion](21-recursion.md); [11. Recursion's Big-O](11-algorithm-analysis.md#pattern-10-recursion) |
| Linear and binary search, including tracing binary search's mid values | [11. Searching](11-algorithm-analysis.md#searching); [Cheat sheet](big-o.md#searching) |
| Interpolation search | [11. Searching](11-algorithm-analysis.md#interpolation-search); [Cheat sheet](big-o.md#searching) |
| Breadth-first and depth-first search | [9. Graphs](09-graphs.md#breadth-first-search-bfs) |
| Sorting: bubble, selection, insertion, shell, merge, quick, heap, counting, radix, and bucket sort, their best, average, and worst cases, and recognizing each one in code | [11. Sorting](11-algorithm-analysis.md#sorting); [Cheat sheet](big-o.md#sorting) |
| Big-O: growth rates, best, average, and worst case, and the rules for simplifying | [Cheat sheet](big-o.md#growth-rates-slowest-to-fastest) |
| Finding the Big-O of code: nested and dependent loops, halving loops, hidden costs, recursion | [11. Algorithm analysis](11-algorithm-analysis.md) |

## Determines Data Structure Impact

| Topic | Where |
|---|---|
| Data types (primitive, composite, user-defined) and enumerations | [1. Introduction](01-introduction.md#data-types-data-structures-and-adts) |
| Data types vs data structures vs ADTs | [1. Introduction](01-introduction.md#data-types-data-structures-and-adts) |
| Records | [1. Introduction](01-introduction.md#data-types-data-structures-and-adts) |
| Arrays, and Python's list methods | [2. Lists](02-lists.md#array-based-lists); [12–20](12-programming-concepts.md#what-pythons-built-ins-cost) |
| Linked lists: singly, doubly, and circular | [2. Lists](02-lists.md) |
| Stacks | [3. Stacks and queues](03-stacks-queues.md#the-stack-adt) |
| Queues and deques | [3. Stacks and queues](03-stacks-queues.md#the-queue-adt) |
| Bags | [1. Introduction](01-introduction.md#abstract-data-types-adts); [Cheat sheet](big-o.md#hash-tables-maps-and-sets) |
| Hash tables: hash functions, keys, collisions, chaining, probing, computing `key % N` by hand | [4. Hash tables](04-hash-tables.md) |
| Dictionaries and maps, and Python's dict methods | [4. Hash tables](04-hash-tables.md#the-map-adt); [12–20](12-programming-concepts.md#what-pythons-built-ins-cost) |
| Trees: binary trees, BSTs, full, complete, perfect, and balanced trees, BST removal, traversals | [5. Trees](05-trees.md) |
| AVL and red-black trees | [6. Balanced trees](06-balanced-trees.md) |
| B-trees | [10. B-trees](10-b-trees.md) |
| Heaps: percolate up and down, child and parent indexes, heapify | [7. Heaps and treaps](07-heaps-treaps.md) |
| Sets and set operations (union, intersection, difference) | [8. Sets](08-sets.md) |
| Graphs: kinds, adding and removing vertices and edges, Dijkstra vs Bellman-Ford | [9. Graphs](09-graphs.md) |

## Applies Algorithms

| Topic | Where |
|---|---|
| Static vs dynamic variables and allocation | [12–20](12-programming-concepts.md#static-and-dynamic-strong-and-weak) |
| Strongly vs weakly typed languages | [12–20](12-programming-concepts.md#static-and-dynamic-strong-and-weak) |
| Assignment operators and precedence | [12–20](12-programming-concepts.md#operators) |
| Loops: for, while, do-while, nested, break, continue, pass | [12–20](12-programming-concepts.md#loops-and-range) |
| Branching: if, elif, else, switch, and, or, not | [12–20](12-programming-concepts.md#branching) |
| Classes: attributes, methods, constructors, inheritance, encapsulation, polymorphism | [12–20](12-programming-concepts.md#classes) |
| Garbage collection, reference counting, memory allocation | [12–20](12-programming-concepts.md#memory-management) |
| Linked vs sequential allocation | [2. Lists](02-lists.md#sequential-and-linked-allocation) |
| Data flow diagrams | [12–20](12-programming-concepts.md#data-flow-diagrams) |
