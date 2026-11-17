# Topic map

Every topic in the C949 course study guide (in your WGU course resources), grouped by the course's three competencies, and where this guide covers it. Use it as a checklist: when you can explain a topic and work its questions without looking, move on.

Topics marked *coming* are in chapters not written yet. Until then, the [Big-O cheat sheet](big-o.md) has their costs, and the optional [code lessons](code/README.md) build several of them.

## Explains Algorithms

| Topic | Where |
|---|---|
| What makes something an algorithm: finiteness, definiteness, input, output, effectiveness, generality | [1. Introduction](01-introduction.md#what-makes-something-an-algorithm) |
| Qualities of a good algorithm: correctness, simplicity, modularity, maintainability, robustness, extensibility | [1. Introduction](01-introduction.md#what-makes-something-an-algorithm) |
| Kinds of algorithms: brute force, recursive, backtracking, divide and conquer, greedy, dynamic programming, randomized, searching, sorting, hashing, encryption | [1. Introduction](01-introduction.md#kinds-of-algorithms) |
| Greedy algorithms and dynamic programming | [1. Introduction](01-introduction.md#greedy-algorithms) |
| Recursion: base case, recursive case, the call stack, tracing factorial | [12–20. Programming concepts](12-programming-concepts.md#functions-and-recursion); 21. Recursion *(coming)* |
| Linear and binary search, including tracing binary search's mid values | [Cheat sheet](big-o.md#searching); 11. Searching and algorithm analysis *(coming)*; code [Lesson 5](code/05-searching-sorting.md) |
| Interpolation search | [Cheat sheet](big-o.md#searching); 11 *(coming)* |
| Breadth-first and depth-first search | [Cheat sheet](big-o.md#graphs); 9. Graphs *(coming)* |
| Sorting: bubble, selection, insertion, shell, merge, quick, heap, counting, radix, and bucket sort, their best, average, and worst cases, and recognizing each one in code | [Cheat sheet](big-o.md#sorting); 11 *(coming)* |
| Big-O: growth rates, best, average, and worst case, and the rules for simplifying | [Cheat sheet](big-o.md#growth-rates-slowest-to-fastest) |

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
| Trees: binary trees, BSTs, full, complete, perfect, and balanced trees, BST removal, traversals | [Cheat sheet](big-o.md#trees-and-heaps); 5. Trees *(coming)* |
| AVL and red-black trees | [Cheat sheet](big-o.md#trees-and-heaps); 6. Balanced trees *(coming)* |
| B-trees | [Cheat sheet](big-o.md#trees-and-heaps); 10. B-trees *(coming)* |
| Heaps: percolate up and down, child and parent indexes, heapify | [Cheat sheet](big-o.md#trees-and-heaps); 7. Heaps and treaps *(coming)* |
| Sets and set operations (union, intersection, difference) | [Cheat sheet](big-o.md#hash-tables-maps-and-sets); 8. Sets *(coming)* |
| Graphs: kinds, adding and removing vertices and edges, Dijkstra vs Bellman-Ford | [Cheat sheet](big-o.md#graphs); 9. Graphs *(coming)* |

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
