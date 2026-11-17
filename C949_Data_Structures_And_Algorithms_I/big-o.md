# Big-O cheat sheet

This page puts every data structure and algorithm in the course in one place. **Best**, **average**, and **worst** are running times; **space** is extra memory beyond the input. n is the number of items. In graphs, V is the number of vertices and E the number of edges.

Sorts that don't compare items use a second size, k. Depending on the sort, k is the number of digits (radix sort), the range of values (counting sort), or the number of buckets (bucket sort). This sheet follows the course study guide: radix sort is O(n·k) and bucket sort is O(n + k). Some course worksheets drop the k and write O(n). That's the same thing when k is a small constant.

## Growth rates, slowest to fastest

| Big-O | Name | Example |
|---|---|---|
| O(1) | Constant | Reading `a[i]`, push or pop on a stack |
| O(log log n) | Log-log | Interpolation search on evenly spread data |
| O(log n) | Logarithmic | Binary search: the problem halves each step |
| O(n) | Linear | Linear search: one pass over the items |
| O(n log n) | Linearithmic | Merge sort: log n levels, O(n) work on each |
| O(n²) | Quadratic | Selection sort: a loop inside a loop |
| O(2ⁿ) | Exponential | Naive recursive Fibonacci |
| O(n!) | Factorial | Trying every ordering of n items |

<div class="viz" data-viz="growth-chart" markdown>

*On the site, an interactive chart here plots every growth class as n grows, with a log-scale view and a table.*

</div>

**Rules for finding a Big-O** (the [algorithm analysis page](11-algorithm-analysis.md) traces an example of each):

- Drop constant factors: O(3n²) is O(n²), and O(n + 10) is O(n).
- Keep only the fastest-growing term: 5n³ + 2n² + 7 is O(n³), and 2ⁿ + n³ is O(2ⁿ), since an exponential grows faster than any polynomial.
- The base of a logarithm doesn't matter: O(log₂ n) and O(log₁₀ n) are both O(log n), because changing the base only multiplies by a constant.
- Steps one after another add, and the biggest term wins: O(n) then O(n²) is O(n²).
- Nested loops multiply: a loop over n inside a loop over n is O(n²). Over two different inputs, it's O(n·m).
- A loop that halves (or doubles) its loop variable on each pass runs O(log n) times.
- A recursive function that calls itself once on n − 1 goes O(n) calls deep. One that calls itself twice on n − 1 is O(2ⁿ).

## Lists, stacks, queues, and deques

| Operation | Array (Python list) | Singly-linked list | Doubly-linked list |
|---|---|---|---|
| Read or write item i | O(1) | O(n) | O(n) |
| Search for a value | O(n) | O(n) | O(n) |
| Append at the end | O(1) on average, O(n) when the array must grow | O(1) with a tail pointer; O(n) without one | O(1) |
| Prepend at the front | O(n): every item shifts | O(1) | O(1) |
| Insert after a node you already have | O(n): items shift | O(1) | O(1) |
| Insert at position i | O(n): items shift | O(n): walk to position i first | O(n) |
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

The average case needs a good hash function and a low load factor. A Python `dict` or `set` is a hash table. A set built on a BST has the same costs as the BST.

| Set operation (hash-table sets of sizes n and m) | Average |
|---|---|
| Add, remove, or check membership of one item | O(1) |
| Union | O(n + m) |
| Intersection | O(min(n, m)): check each item of the smaller set |
| Difference (A − B) | O(n) for A of size n |

A **bag** (multiset) allows duplicates. Python's `collections.Counter` is a bag: adding and counting an item are O(1) on average.

## Trees and heaps

| Tree | Search, insert, remove: average | Worst case | Kept short by |
|---|---|---|---|
| Binary search tree (BST) | O(log n) | O(n) | Nothing. Keys inserted in sorted order make a chain. |
| AVL tree | O(log n) | O(log n) | Rotations. Height stays under about 1.44 log n. |
| Red-black tree | O(log n) | O(log n) | Rotations and recoloring. Height stays under 2 log n. |
| 2-3-4 tree or B-tree | O(log n) | O(log n) | Splits and merges. Every leaf is at the same depth. |
| Treap | O(log n) | O(n) | Random priorities, so it's balanced on average. |

A BST search's best case is O(1), when the key is at the root.

| Heap operation (max-heap or min-heap) | Big-O |
|---|---|
| Peek at the max (or min) | O(1) |
| Insert | O(log n) |
| Remove the max (or min) | O(log n) |
| Search for any value | O(n) |
| Build a heap from n items (heapify) | O(n) |

A tree with n nodes has height at least ⌊log₂ n⌋, and at most n − 1. Any traversal (inorder, preorder, postorder, level order) visits every node once: O(n).

A heap is stored in an array with no gaps. With the root at index 0, the children of index i are at 2i + 1 and 2i + 2, and its parent is at (i − 1) // 2. (With the root at index 1: children 2i and 2i + 1, parent i // 2.)

To step through a heap one operation at a time, see [chapter 7](07-heaps-treaps.md#heaps).

<div class="viz" data-viz="tree-shapes" markdown>

*On the site, a drawing here shows full, complete, and perfect binary trees.*

</div>

## Searching

| Algorithm | Best | Average | Worst | Space | Needs |
|---|---|---|---|---|---|
| Linear search | O(1) | O(n) | O(n) | O(1) | Nothing |
| Binary search | O(1) | O(log n) | O(log n) | O(1) loop, O(log n) recursive | A sorted list with O(1) access by index |
| Interpolation search | O(1) | O(log log n) | O(n) | O(1) | A sorted list whose values are spread evenly; it guesses the position from the value |

## Sorting

| Sort | Best | Average | Worst | Space | Stable |
|---|---|---|---|---|---|
| Selection | O(n²) | O(n²) | O(n²) | O(1) | No |
| Insertion | O(n) | O(n²) | O(n²) | O(1) | Yes |
| Bubble | O(n) | O(n²) | O(n²) | O(1) | Yes |
| Shell | O(n log n) | about O(n^1.5) | O(n²) | O(1) | No |
| Merge | O(n log n) | O(n log n) | O(n log n) | O(n) | Yes |
| Quicksort | O(n log n) | O(n log n) | O(n²) | O(log n) | No |
| Heap sort | O(n log n) | O(n log n) | O(n log n) | O(1) | No |
| Counting | O(n + k) | O(n + k) | O(n + k) | O(n + k) | Yes |
| Radix | O(n·k) | O(n·k) | O(n·k) | O(n) | Yes |
| Bucket | O(n + k) | O(n + k) | O(n²) | O(n + k) | Yes, if each bucket's sort is |

How each sort works, and what causes its best and worst cases:

- **Selection:** find the smallest unsorted item and swap it into place. It scans the whole unsorted part every pass, so there's no faster case.
- **Insertion:** take the next item and shift it left into the sorted part. Best case: the list is already sorted.
- **Bubble:** swap neighbors that are out of order. Best case: a sorted list, with an early stop when a pass makes no swaps.
- **Shell:** insertion sort on items a gap apart, with shrinking gaps. The average depends on the gaps; halving the gap each time can give the O(n²) worst case.
- **Merge:** split in half, sort each half, then merge them.
- **Quicksort:** partition around a pivot (zyBooks uses the middle element), then sort each side. Worst case: the pivot is always the smallest or largest item.
- **Heap sort:** build a max-heap, then remove the max n times.
- **Counting:** count how many times each value occurs (k is the range of values), then place the items by their counts.
- **Radix:** sort by one digit at a time, least significant first, into 10 buckets (k is the number of digits).
- **Bucket:** spread items into k buckets by value, then sort each bucket. Worst case: everything lands in one bucket.

**Quickselect** (find the k-th smallest item): O(n) on average, O(n²) at worst.

Merge sort, quicksort, and binary search are **divide and conquer**: split the problem, solve the parts, combine. Counting, radix, and bucket sort are **non-comparison** sorts: they never compare two items, which is how they can run faster than O(n log n).

## Graphs

| Algorithm | Time | Notes |
|---|---|---|
| Breadth-first search (BFS) | O(V + E) | Uses a queue. Finds the paths with the fewest edges. |
| Depth-first search (DFS) | O(V + E) | Uses a stack, or recursion |
| Dijkstra's shortest path | O((V + E) log V) with a binary-heap priority queue, O(V²) with an unsorted list | Greedy. Edge weights can't be negative. |
| Bellman-Ford shortest path | O(V·E) | Dynamic programming. Allows negative weights and detects negative cycles. |
| Topological sort | O(V + E) | For directed graphs with no cycles |
| Prim's or Kruskal's minimum spanning tree | O(E log V), also written O(E log E): the same class, since E < V² | For undirected, connected, weighted graphs |
| Floyd-Warshall all-pairs shortest path | O(V³) | From every vertex to every other vertex |

| Representation | Space | Is there an edge from A to B? | List A's neighbors | Add a vertex | Remove a vertex |
|---|---|---|---|---|---|
| Adjacency list | O(V + E) | O(degree of A) | O(degree of A) | O(1) | O(V + E): its edges are in other vertices' lists |
| Adjacency matrix | O(V²) | O(1) | O(V) | O(V²): copy into a bigger matrix | O(V²) |

In a matrix, adding or removing one edge is O(1). In a list, adding an edge is O(1), but removing one means finding it in the list first.
