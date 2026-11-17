# 7. Heaps and treaps

A heap keeps its largest (or smallest) item where you can grab it in O(1), and fixes itself in O(log n) after every change. That makes it the natural way to build a **priority queue**, and the engine of **heap sort**. A treap borrows the heap's rule to keep a BST balanced on average.

## Heaps

A **max-heap** is a **complete** binary tree ([chapter 5](05-trees.md#tree-shapes)) where every node's key is **greater than or equal to** its children's keys. So the largest key is always at the root. A **min-heap** is the same with "less than or equal to", so the smallest is at the root.

A heap is not a BST: there's no left-smaller, right-larger rule, only parent-versus-children. Searching a heap for an arbitrary key is O(n).

### Stored in an array

A complete tree has no gaps when read level by level, so a heap is stored in an array (a Python list) in that order, with no pointers at all. With the root at index 0:

| From index i | Index |
|---|---|
| Left child | 2i + 1 |
| Right child | 2i + 2 |
| Parent | (i − 1) // 2 |

```text
array    90 70 80 30 60 50          as a tree:        90
index     0  1  2  3  4  5                          /    \
                                                  70      80
                                                 /  \    /
                                               30   60  50
```

Index 1 (70) has children at 3 and 4 (30 and 60), and its parent is at (1 − 1) // 2 = 0. Some books start the root at index 1 instead; then the children are 2i and 2i + 1, and the parent i // 2. Check which one a question uses.

### Insert: percolate up

1. Put the new key at the end of the array: the next open spot on the bottom level, which keeps the tree complete.
2. While it's bigger than its parent, swap it with its parent.

Inserting 85 into the heap above: it goes at index 6. Its parent is index 2, holding 80. 85 > 80, so swap. Now at index 2, its parent is index 0, holding 90. 85 < 90, so stop. One swap: `90 70 85 30 60 50 80`.

### Remove the max: percolate down

1. The answer is the root.
2. Move the **last** key into the root (the array shrinks by one, and the tree stays complete).
3. While it's smaller than one of its children, swap it with the **larger** child. (Swapping with the larger child keeps that child bigger than its new sibling.)

Removing the max from `90 70 80 30 60 50`: return 90. 50 moves to the root. Its children are 70 and 80; swap with 80. At index 2 it has no children: stop. The heap is `80 70 50 30 60`.

Each swap moves one level, and a complete tree has about log₂ n levels, so both operations are **O(log n)**.

<div class="viz" data-viz="heap" markdown>

*On the site, an interactive diagram here inserts random values into a max-heap and removes the max, showing the tree and the array moving together.*

</div>

### Building a heap: heapify

To turn a whole unsorted array into a heap, percolate **down** each internal node, starting with the last one (index n // 2 − 1) and working back to the root. Leaves are already heaps of one item, so they're skipped.

```text
start                3 9 2 7 5 8        internal nodes: indexes 2, 1, 0
percolate down i=2   3 9 8 7 5 2        2 swaps with its child 8
percolate down i=1   3 9 8 7 5 2        9 is bigger than 7 and 5: no change
percolate down i=0   9 7 8 3 5 2        3 swaps with 9, then with 7
```

It looks like n log n work, but most nodes are near the bottom and move only a little: building a heap this way is **O(n)**.

## Priority queues

A **priority queue** is an ADT where every item has a priority, and dequeue always removes the highest-priority item, whatever order they arrived in. Emergency rooms, print queues with urgent jobs, and Dijkstra's shortest-path algorithm all use one.

| Operation | What it does | With a heap |
|---|---|---|
| Enqueue | Add an item with its priority | O(log n) |
| Dequeue | Remove and return the highest-priority item | O(log n) |
| Peek | Return the highest-priority item | O(1) |
| IsEmpty, GetLength | | O(1) |

A sorted list would make dequeue O(1) but enqueue O(n); an unsorted list the reverse. A heap makes both O(log n).

Items with equal priority aren't guaranteed to come out in arrival order. To make them, store a counter alongside the priority and use it to break ties.

### Priority queues in Python

- The `heapq` module turns a plain list into a **min-heap**: `heapq.heappush(h, x)`, `heapq.heappop(h)` (removes the smallest), `heapq.heapify(lst)` in O(n), and `h[0]` to peek. For a max-heap, push negated values.
- `queue.PriorityQueue` wraps the same idea for passing work between threads: `put((priority, item))` and `get()`. The smallest priority number comes out first.

## Heap sort

Heap sort uses a max-heap inside the array being sorted:

1. Heapify the array: O(n).
2. Swap the root (the max) with the last item of the heap part. The max is now in its final place at the end.
3. Shrink the heap part by one, and percolate the new root down.
4. Repeat until the heap part is one item.

After the first round on `3 9 2 7 5 8` (heapified to `9 7 8 3 5 2`): swap 9 to the end, then percolate 2 down: `8 7 2 3 5 | 9`.

- **Best, average, worst:** O(n log n): n removals, each O(log n).
- **Memory:** in place, O(1) extra. **Stable:** no.

## Treaps

A **treap** is a BST where each node also gets a random **priority** when it's inserted. The keys follow the BST rule, and the priorities follow the **heap** rule. This page puts higher priorities on top, as in a max-heap; some books use a min-heap instead, which works the same way upside down.

- **Insert:** insert by key as in any BST, as a leaf, with a random priority. Then, while its priority is higher than its parent's, **rotate** it up (a right rotation if it's a left child, a left rotation if it's a right child). Rotations keep the BST order and fix the heap order.
- **Remove:** rotate the node down, each time toward its higher-priority child, until it's a leaf, then cut it off.

Because the priorities are random, the tree's shape is as if the keys had been inserted in random order, whatever order they really came in. That makes the height O(log n) **on average**, with no balance factors or colors to maintain. The worst case is still O(n), but it's very unlikely.

<div class="viz" data-viz="treap" markdown>

*On the site, a drawing here shows a small treap, with each node's key and priority.*

</div>

## Big-O summary

| Operation | Max-heap or min-heap | Treap |
|---|---|---|
| Peek at the max (min) | O(1) | |
| Insert | O(log n) | O(log n) average, O(n) worst |
| Remove the max (min) | O(log n) | |
| Search for any key | O(n) | O(log n) average, O(n) worst |
| Remove any key | | O(log n) average, O(n) worst |
| Build from n items | O(n) | |
| Heap sort | O(n log n) | |

## Questions

- **7.1** Index math, root at index 0.

  | Question | Index |
  |---|---|
  | Left child of index 4 | |
  | Right child of index 4 | |
  | Parent of index 9 | |
  | Parent of index 2 | |

  <!-- answer:7.1a-d table: 9; 10; 4; 0 -->

  <details>
  <summary>Answer</summary>

  - 2 × 4 + 1 = **9**, and 2 × 4 + 2 = **10**.
  - (9 − 1) // 2 = **4**, and (2 − 1) // 2 = **0**.

  </details>

- **7.2** Insert into the max-heap `90 70 80 30 60 50`.

  **a)** Insert 85. What is the array afterward? Separate the values with spaces.

  <!-- answer:7.2a blanks: 90 70 85 30 60 50 80 | 90, 70, 85, 30, 60, 50, 80 -->

  **b)** How many swaps did it take?

  <!-- answer:7.2b blanks: 1 -->

  <details>
  <summary>Answer</summary>

  85 goes in at index 6. Its parent, index 2, holds 80: swap. Its new parent, index 0, holds 90, which is bigger: stop. **1** swap, giving **90 70 85 30 60 50 80**.

  </details>

- **7.3** Remove the max from the max-heap `90 70 80 30 60 50`. What is the array afterward?

  <!-- answer:7.3 blanks: 80 70 50 30 60 | 80, 70, 50, 30, 60 -->

  <details>
  <summary>Answer</summary>

  90 is removed. The last value, 50, moves to the root. Its children are 70 and 80; it swaps with the larger, 80. At index 2, it has no children left. **80 70 50 30 60**.

  </details>

- **7.4** Heapify and heap sort.

  **a)** Build a max-heap from `3 9 2 7 5 8` with heapify. What is the array?

  <!-- answer:7.4a blanks: 9 7 8 3 5 2 | 9, 7, 8, 3, 5, 2 -->

  **b)** What is the Big-O of heapify on n items?

  <!-- answer:7.4b blanks: [O(1), O(log n), O(n), O(n log n)] => O(n) -->

  <details>
  <summary>Answer</summary>

  - **a)** Percolate down index 2 (2 swaps with 8), index 1 (9 stays), then index 0 (3 swaps with 9, then with 7): **9 7 8 3 5 2**.
  - **b)** **O(n)**, because most nodes sit near the bottom and barely move.

  </details>

- **7.5** Priority queues.

  | Operation on a heap-based priority queue | Big-O |
  |---|---|
  | Peek | |
  | Enqueue | |
  | Dequeue | |
  | Search for an item with a given value | |

  <!-- answer:7.5a-d table [O(1), O(log n), O(n), O(n log n)]: O(1); O(log n); O(log n); O(n) -->

  <details>
  <summary>Answer</summary>

  - The top item is at the root: O(1).
  - Enqueue percolates up and dequeue percolates down, one level per swap: O(log n).
  - A heap has no left-right order, so finding an arbitrary value means checking every item: O(n).

  </details>

- **7.6** Python and treaps.

  **a)** `h = [5, 1, 8, 3]`, then `heapq.heapify(h)`. What does `heapq.heappop(h)` return?

  <!-- answer:7.6a blanks: 1 -->

  **b)** A new treap node's priority is higher than its parent's. What happens?

  A. It's removed and inserted again.

  B. It rotates up until its parent's priority is higher.

  C. The parent's priority is changed to match.

  <!-- answer:7.6b choice: B -->

  **c)** What is a treap's search cost on average, and in the worst case?

  <!-- answer:7.6c blanks: Average => O(log n); Worst => O(n) -->

  <details>
  <summary>Answer</summary>

  - **a)** `heapq` is a min-heap, so it pops the smallest: **1**.
  - **b)** **B.** Rotations move it up while keeping the BST order, until the heap order holds.
  - **c)** Random priorities make the tree balanced on average, **O(log n)**, but nothing forbids a bad shape: **O(n)** in the worst case.

  </details>
