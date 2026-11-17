# Big-O cheat sheet

Every data structure and algorithm in the course on one page. **Best**, **average**, and **worst** are running times; **space** is extra memory beyond the input. n is the number of items. In graphs, V is the number of vertices and E the number of edges.

Following the course's Big-O worksheet, radix sort is listed as O(n) and bucket sort's average as O(n). Textbooks often write O(nk) and O(n + k), where k is the number of digits or buckets.

## Growth rates, slowest to fastest

| Big-O | Name | Example |
|---|---|---|
| O(1) | Constant | Reading `a[i]`, push or pop on a stack |
| O(log n) | Logarithmic | Binary search: the problem halves each step |
| O(n) | Linear | Linear search: one pass over the items |
| O(n log n) | Linearithmic | Merge sort: log n levels, O(n) work on each |
| O(n²) | Quadratic | Selection sort: a loop inside a loop |
| O(2ⁿ) | Exponential | Naive recursive Fibonacci |
| O(n!) | Factorial | Trying every ordering of n items |

**Rules for working it out:**

- Drop constants and smaller terms: 3n² + 5n + 2 is O(n²).
- Steps one after another add, and the biggest term wins: O(n) then O(n²) is O(n²).
- Nested loops multiply: a loop over n inside a loop over n is O(n²). Over two different inputs, it's O(n·m).
- A loop that halves (or doubles) its variable each pass runs O(log n) times.
- A recursive function that calls itself once on n − 1 is O(n) deep. One that calls itself twice on n − 1 is O(2ⁿ).

## Lists, stacks, queues, and deques

| Operation | Array (Python list) | Singly-linked list | Doubly-linked list |
|---|---|---|---|
| Read or write item i | O(1) | O(n) | O(n) |
| Search for a value | O(n) | O(n) | O(n) |
| Append at the end | O(1) on average, O(n) when the array must grow | O(1) with a tail pointer | O(1) |
| Prepend at the front | O(n): every item shifts | O(1) | O(1) |
| Insert after a node you already have | O(n): items shift | O(1) | O(1) |
| Remove the first item | O(n): every item shifts | O(1) | O(1) |
| Remove the last item | O(1) | O(n): you need the node before it | O(1) |
| Remove a node you already have | O(n) | O(n): you need its predecessor | O(1) |

| Structure | Operations | Cost |
|---|---|---|
| Stack (linked list or array) | push, pop, peek | O(1) each (array push: O(1) on average) |
| Queue (linked list, or circular array) | enqueue, dequeue, peek | O(1) each |
| Deque | push and pop at either end | O(1) each |
| Any of these | search for a value | O(n) |

## Hash tables, maps, and sets

| Operation | Best | Average | Worst |
|---|---|---|---|
| Insert | O(1) | O(1) | O(n): every key collides |
| Search | O(1) | O(1) | O(n) |
| Remove | O(1) | O(1) | O(n) |
| Resize (rehash every item) | O(n) | O(n) | O(n) |

The average case needs a good hash function and a low load factor. A Python `dict` or `set` is a hash table. A set built on a BST costs what the BST costs.

## Trees and heaps

| Structure | Search | Insert | Remove | Notes |
|---|---|---|---|---|
| Binary search tree (BST) | O(log n) average, O(n) worst | O(log n) average, O(n) worst | O(log n) average, O(n) worst | Worst case: keys inserted in sorted order make a chain. Best case for search: the key is at the root, O(1). |
| AVL tree | O(log n) | O(log n) | O(log n) | Stays balanced with rotations. Height is at most about 1.44 log n. |
| Red-black tree | O(log n) | O(log n) | O(log n) | Stays balanced with rotations and recoloring. Height is at most 2 log n. |
| 2-3-4 tree / B-tree | O(log n) | O(log n) | O(log n) | All leaves at the same depth. |
| Treap | O(log n) average, O(n) worst | O(log n) average, O(n) worst | O(log n) average, O(n) worst | A BST on keys and a heap on random priorities. |
| Max-heap or min-heap | O(n) | O(log n) | remove max (or min): O(log n) | Peek at the max (or min): O(1). Building a heap from n items: O(n). |

A tree with n nodes has height at least ⌊log₂ n⌋, and at most n − 1. Any traversal (inorder, preorder, postorder, level order) visits every node once: O(n).

## Searching

| Algorithm | Best | Average | Worst | Space | Needs |
|---|---|---|---|---|---|
| Linear search | O(1) | O(n) | O(n) | O(1) | Nothing |
| Binary search | O(1) | O(log n) | O(log n) | O(1) loop, O(log n) recursive | A sorted list with O(1) access by index |

## Sorting

| Sort | Best | Average | Worst | Space | Stable | How it works |
|---|---|---|---|---|---|---|
| Selection | O(n²) | O(n²) | O(n²) | O(1) | No | Find the smallest unsorted item, swap it into place |
| Insertion | O(n) | O(n²) | O(n²) | O(1) | Yes | Take the next item and shift it left into the sorted part. Best case: already sorted. |
| Bubble | O(n) | O(n²) | O(n²) | O(1) | Yes | Swap out-of-order neighbors. Best case: sorted, with an early stop when a pass makes no swaps. |
| Shell | O(n log n) | Depends on the gaps | O(n²) | O(1) | No | Insertion sort on items a gap apart, with shrinking gaps. With gaps 2ᵏ − 1, worst O(n^1.5). |
| Merge | O(n log n) | O(n log n) | O(n log n) | O(n) | Yes | Split in half, sort each half, merge |
| Quicksort | O(n log n) | O(n log n) | O(n²) | O(log n) | No | Partition around a pivot. Worst case: the pivot is always the smallest or largest item. |
| Heap sort | O(n log n) | O(n log n) | O(n log n) | O(1) | No | Build a max-heap, then remove the max n times |
| Radix | O(n) | O(n) | O(n) | O(n) | Yes | Sort by one digit at a time, least significant first, into 10 buckets |
| Bucket | O(n) | O(n) | O(n²) | O(n) | Yes, with a stable sort in each bucket | Spread items into buckets by value, sort each bucket. Worst case: everything lands in one bucket. |

**Quickselect** (find the k-th smallest item): O(n) on average, O(n²) at worst.

## Graphs

| Algorithm | Time | Notes |
|---|---|---|
| Breadth-first search (BFS) | O(V + E) | A queue. Finds fewest-edge paths. |
| Depth-first search (DFS) | O(V + E) | A stack, or recursion |
| Dijkstra's shortest path | O((V + E) log V) with a priority queue, O(V²) with an unsorted list | No negative edge weights |
| Bellman-Ford shortest path | O(V·E) | Allows negative weights, and detects negative cycles |
| Topological sort | O(V + E) | Directed graphs with no cycles |
| Prim's or Kruskal's minimum spanning tree | O(E log V) | Undirected, connected, weighted graphs |
| Floyd-Warshall all-pairs shortest path | O(V³) | Every vertex to every other |

| Representation | Space | Is there an edge from A to B? | List A's neighbors |
|---|---|---|---|
| Adjacency list | O(V + E) | O(degree of A) | O(degree of A) |
| Adjacency matrix | O(V²) | O(1) | O(V) |
