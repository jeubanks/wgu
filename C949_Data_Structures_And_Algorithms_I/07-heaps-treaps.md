# 7. Heaps and treaps

A heap keeps its largest (or smallest) item where you can grab it in O(1), and fixes itself in O(log n) after every change. That makes a heap the usual way to build a **priority queue**, and it's the basis of **heap sort**. A treap borrows the heap's rule to keep a BST balanced on average.

## Heaps

A **max-heap** is a **complete** binary tree ([chapter 5](05-trees.md#tree-shapes)) where every node's key is **greater than or equal to** its children's keys. Since that holds at every level, a node is also greater than or equal to everything below it, so the largest key is always at the root. A **min-heap** is the same with "less than or equal to", so the smallest is at the root.

A heap is not a BST. It has no left-smaller, right-larger rule. It only compares each parent with its children, so searching a heap for an arbitrary key is O(n).

Because the tree is complete, a heap with N nodes has the smallest possible height, about log₂ N. Insert and remove both keep the tree complete, so it stays that short.

### Stored in an array

A complete tree has no gaps when read level by level, so a heap is stored in an array (a Python list) in that order: top to bottom, and left to right within each level. There are no node objects and no pointers. zyBooks puts the root at index 0 and uses these formulas to move between nodes:

| From index i | Index |
|---|---|
| Left child | 2i + 1 |
| Right child | 2i + 2 |
| Parent | (i − 1) // 2 |

<!-- figure
heap: 72 45 63 30 41 50 18
-->
```text
array    72 45 63 30 41 50 18       as a tree:          72
index     0  1  2  3  4  5  6                        /      \
                                                   45        63
                                                  /  \      /  \
                                                30   41    50   18
```
<!-- /figure -->

Index 1 (45) has children at 3 and 4 (30 and 41), and its parent is at (1 − 1) // 2 = 0.

- The parent formula is never used on the root. Index 0 has no parent.
- If a child index is past the end of the array, that child doesn't exist. A node whose left child index is past the end is a leaf.

### Insert: percolate up

1. Append the new key to the end of the array. The end of the array is the next open spot on the bottom level, so the tree stays complete.
2. While the new key is bigger than its parent, swap it with its parent.
3. Stop when the new key is less than or equal to its parent, or when it reaches the root.

zyBooks calls step 2 a **percolate-up**. Inserting 68 into the heap above:

<!-- figure
index: yes
row: append 68 | 72 45 63 30 41 50 18 *68 | parent is index 3 (30)
row: 68 > 30: swap | 72 45 63 *68 41 50 18 *30 | parent is index 1 (45)
row: 68 > 45: swap | 72 *68 63 *45 41 50 18 30 | parent is index 0 (72). 68 ≤ 72: stop
-->
```text
append 68 at index 7     72 45 63 30 41 50 18 68     parent is index 3 (30)
68 > 30: swap            72 45 63 68 41 50 18 30     parent is index 1 (45)
68 > 45: swap            72 68 63 45 41 50 18 30     parent is index 0 (72)
68 <= 72: stop
```
<!-- /figure -->

Two swaps: `72 68 63 45 41 50 18 30`.

### Remove the max: percolate down

A heap's remove always removes the root.

1. Save the root. It's the value you return.
2. Pop the **last** item of the array and put it at the root. The array shrinks by one, and the tree stays complete.
3. While that item is smaller than one of its children, swap it with the **larger** child. Swapping with the larger child keeps the child that moves up bigger than its new sibling.
4. Stop when the item is greater than or equal to both children, or when it has no children.

zyBooks calls step 3 a **percolate-down**. Removing the max from `72 45 63 30 41 50 18`:

<!-- figure
index: yes
row: 18 to the root | *18 45 63 30 41 50 | save 72. Children: 45 and 63
row: 63 is larger, 18 < 63: swap | *63 45 *18 30 41 50 | children: 50 (index 6 is gone)
row: 18 < 50: swap | 63 45 *50 30 41 *18 | index 5 has no children: stop
-->
```text
save 72, move 18 to the root    18 45 63 30 41 50     children: 45 and 63
63 is larger, 18 < 63: swap     63 45 18 30 41 50     children: 50 (index 6 is gone)
18 < 50: swap                   63 45 50 30 41 18     index 5 has no children: stop
```
<!-- /figure -->

The method returns 72, and the heap is `63 45 50 30 41 18`.

Each swap moves one level, and the tree has about log₂ n levels, so both operations are **O(log n)** in the worst case.

<div class="viz" data-viz="heap" markdown>

*On the site, an interactive diagram here inserts random values into a max-heap and removes the max, showing the tree and the array moving together.*

</div>

### Min-heaps

A min-heap runs the same code with the comparisons flipped. Percolate up while the new key is **smaller** than its parent, and percolate down by swapping with the **smaller** child. Use a min-heap when a lower number means more urgent, such as a support line that serves number 1 next.

## Heap sort

### Heapify: building a heap

**Heapify** turns a whole unsorted array into a max-heap. It percolates **down** every internal node (a node with at least one child), starting with the internal node that has the largest index and working back to the root. Each leaf is already a heap of one item, so heapify skips the leaves.

- With N items, the largest internal node index is **N // 2 − 1**.
- So heapify does N // 2 percolate-downs, one for each index from N // 2 − 1 down to 0.
- With 1 item, the largest internal node index is −1. There are no internal nodes, so heapify does nothing.

Heapifying `15 22 9 30 11 40 7`: N = 7, so the internal nodes are indexes 2, 1, and 0.

<!-- figure
index: yes
row: start | 15 22 9 30 11 40 7
row: i = 2 | 15 22 *40 30 11 *9 7 | 9 swaps with its larger child, 40
row: i = 1 | 15 *30 40 *22 11 9 7 | 22 swaps with its larger child, 30
row: i = 0 | *40 30 *15 22 11 9 7 | 15 swaps with 40, then beats 9 and 7: stop
-->
```text
start                15 22  9 30 11 40  7
percolate down i=2   15 22 40 30 11  9  7     9 swaps with its larger child, 40
percolate down i=1   15 30 40 22 11  9  7     22 swaps with its larger child, 30
percolate down i=0   40 30 15 22 11  9  7     15 swaps with 40, then beats 9 and 7: stop
```
<!-- /figure -->

Heapify looks like n log n work. But most nodes are near the bottom and move only a short distance, so building a heap this way is **O(n)**.

An array sorted in descending order is already a max-heap, so heapify makes no swaps on it. An array sorted in ascending order is a min-heap. It isn't a max-heap unless all its values are equal.

### Sorting

Heap sort builds a max-heap inside the array it's sorting. An **end index** marks where the heap part of the array stops.

1. Heapify the array. Set the end index to the last index, n − 1.
2. Swap the root (the max) with the item at the end index. The max is now in its final place.
3. Percolate the new root down, inside the heap part only (indexes 0 to end − 1).
4. Subtract 1 from the end index. Repeat steps 2 to 4 until the end index is 0.

Sorting the heap built above, `40 30 15 22 11 9 7`:

| End index | Swap | Heap part after percolating down | Sorted part |
|---|---|---|---|
| 6 | 40 and 7 | `30 22 15 7 11 9` | `40` |
| 5 | 30 and 9 | `22 11 15 7 9` | `30 40` |
| 4 | 22 and 9 | `15 11 9 7` | `22 30 40` |
| 3 | 15 and 7 | `11 7 9` | `15 22 30 40` |
| 2 | 11 and 9 | `9 7` | `11 15 22 30 40` |
| 1 | 9 and 7 | `7` | `9 11 15 22 30 40` |

```python
def percolate_down(items, i, size):
    while 2 * i + 1 < size:
        biggest = i
        for child in (2 * i + 1, 2 * i + 2):
            if child < size and items[child] > items[biggest]:
                biggest = child
        if biggest == i:
            return                      # bigger than or equal to both children
        items[i], items[biggest] = items[biggest], items[i]
        i = biggest

def heap_sort(items):
    n = len(items)
    for i in range(n // 2 - 1, -1, -1):    # heapify
        percolate_down(items, i, n)
    for end in range(n - 1, 0, -1):        # move the max to the end, n - 1 times
        items[0], items[end] = items[end], items[0]
        percolate_down(items, 0, end)
```

- **Calls to percolate_down:** n // 2 for heapify, plus n − 1 for the sorting loop. With 7 items, that's 3 + 6 = 9.
- **Best, average, worst:** O(n log n): n − 1 removals, each O(log n).
- **Memory:** in place, O(1) extra. Two loops, no recursion.
- **Stable:** no.
- **Spot it in code:** a loop from `n // 2 - 1` down to 0, then a loop that swaps `items[0]` with `items[end]`.
- **Descending order:** use a min-heap instead. The smallest item goes to the end each round.

## Priority queues

A **priority queue** is a queue where every item has a priority, and higher-priority items sit closer to the front. zyBooks defines it like this:

- **Enqueue** puts the new item behind every item of equal or higher priority, and ahead of every item of lower priority. So items with equal priority leave in the order they arrived (first in, first out).
- **Dequeue** removes and returns the item at the front, which has the highest priority.

Each queue decides what "higher priority" means. Often a **lower number means higher priority**, so priority 1 is served before priority 4.

A trace, where a lower number means higher priority. The second 6 is written 6′:

| Operation | Queue afterward, front to end |
|---|---|
| Enqueue 6 | 6 |
| Enqueue 9 | 6, 9 |
| Enqueue 2 | 2, 6, 9 |
| Enqueue 6 (a second 6) | 2, 6, 6′, 9 (the new 6 goes behind the old one) |
| Dequeue: returns 2 | 6, 6′, 9 |

| Operation | What it does | With a heap |
|---|---|---|
| Enqueue | Add an item in its place | O(log n): heap insert |
| Dequeue | Remove and return the front item | O(log n): heap remove |
| Peek | Return the front item without removing it | O(1): read the root |
| IsEmpty | True if the queue has no items | O(1) |
| GetLength | Return the number of items | O(1) |

A priority queue is usually built on a heap, though it doesn't have to be. With a sorted list, dequeue is O(1) but enqueue is O(n). An unsorted list is the reverse. A heap makes both O(log n). Use a max-heap when a bigger number means higher priority, and a min-heap when a smaller number does.

A plain heap doesn't keep equal-priority items in arrival order. To get the first-in, first-out rule, store an arrival counter with each item and use the counter to break ties.

### Where the priority comes from

- **From the item itself:** each object carries its own priority, such as a customer record with a priority field. Enqueue only needs the object.
- **Enqueue with priority:** an `EnqueueWithPriority(item, priority)` operation takes the priority as an argument and stores it alongside the item. The objects don't need a priority field at all.

## Priority queues in Python

zyBooks uses the `PriorityQueue` class from the `queue` module:

```python
from queue import PriorityQueue

jobs = PriorityQueue()
jobs.put(17)          # enqueue
jobs.put(4)
jobs.put(9)
print(jobs.qsize())   # 3
print(jobs.get())     # 4: removes and returns the smallest
```

| Method | What it does |
|---|---|
| `put(item)` | Enqueue an item. |
| `get()` | Remove and return the highest-priority item, which is the **smallest**. |
| `qsize()` | Return the number of items. |

- `PriorityQueue` compares items with the `<` operator, so the smallest item comes out first.
- Calling `get()` on an empty queue doesn't return anything or raise an error. It waits for another thread to put an item, so a single-threaded program hangs. Check `qsize() > 0` before you call `get()`.
- To use a separate priority, put a tuple: `put((priority, item))`. Tuples compare by their first element first.

To change the order, wrap each item in a class whose `__lt__` method defines what "comes first" means. This wrapper makes the **largest** value come out first:

```python
class Largest:
    def __init__(self, value):
        self.value = value

    def __lt__(self, other):
        return self.value > other.value   # "less than" now means "bigger"

pq = PriorityQueue()
for x in [8, 3, 11]:
    pq.put(Largest(x))
print(pq.get().value)   # 11
```

The `heapq` module does the same job on a plain list, without a class. It's also a **min-heap**. Use `heapq.heappush(h, x)`, `heapq.heappop(h)` (removes the smallest), `heapq.heapify(lst)` in O(n), and `h[0]` to peek. For a max-heap, push negated values.

## Treaps

A BST built from keys that arrive in random order stays close to balanced. Keys don't always arrive in random order, so a **treap** adds the randomness itself. The name blends *tree* and *heap*.

Each node has two values:

- a **main key**, which follows the **BST** rule, and
- a **priority**, a random number chosen when the node is inserted, which follows the **heap** rule.

zyBooks uses a **max-heap** for the priorities, so the highest priority is at the root. This page does the same.

A treap moves a node up or down with **rotations** ([chapter 6](06-balanced-trees.md#rotations)), never with swaps. A swap would break the BST order, and a rotation keeps it.

### Search

A treap is a BST, so search is a plain BST search by main key. The priorities are ignored.

### Insert

1. Insert the key as a new leaf, using the BST rules.
2. Give it a random priority.
3. While the new node's priority is higher than its parent's, **rotate at the parent** to move the node up. Use a **right** rotation if the node is a left child, and a **left** rotation if it's a right child.
4. Stop when the parent's priority is greater than or equal to the node's, or when the node reaches the root.

Each node below is written key:priority. Here is the insert of J, which gets priority 82:

<!-- figure
tree: Start :: M:90{E:60{B:30, H:40}, T:75}
tree: J goes in as H's right child :: M:90{E:60{B:30, H:40{, J:82}}, T:75}
tree: 82 > 40: left rotation at H :: M:90{E:60{B:30, J:82{H:40}}, T:75}
tree: 82 > 60: left rotation at E. Then 82 ≤ 90: stop :: M:90{J:82{E:60{B:30, H:40}}, T:75}
flow: yes
-->
```text
start                        J goes in as H's right child
       M:90                          M:90
      /    \                        /    \
   E:60    T:75                  E:60    T:75
   /   \                         /   \
 B:30  H:40                    B:30  H:40
                                        \
                                        J:82

82 > 40: left rotation at H      82 > 60: left rotation at E      82 <= 90: stop
          M:90                             M:90
         /    \                           /    \
      E:60    T:75                     J:82    T:75
      /   \                            /
    B:30  J:82                      E:60
          /                         /   \
        H:40                      B:30  H:40
```
<!-- /figure -->

J's parent is now M, with priority 90, so the insert is done after two left rotations. The keys still read B E H J M T in order.

### Delete

zyBooks removes a node by pushing it down to a leaf first:

1. Set the node's priority to **−∞**, the lowest possible, so it belongs at the bottom.
2. While the node has a child, rotate at the node so its **higher-priority child** moves up into its place. With two children, use a left rotation if the right child's priority is higher, and a right rotation if the left child's is. With one child, rotate that child up.
3. When the node is a leaf, cut it off.

Moving the higher-priority child up keeps the heap rule, because the child that comes up has a priority at least as high as the child that stays below it.

Deleting E from the treap above:

<!-- figure
tree: E gets −∞. Its children are B:30 and H:40 :: M:90{J:82{E:-inf{B:30, H:40}}, T:75}
tree: H (40) beats B (30): left rotation at E :: M:90{J:82{H:40{E:-inf{B:30}}}, T:75}
tree: Only child B: right rotation at E :: M:90{J:82{H:40{B:30{, E:-inf}}}, T:75}
tree: E is a leaf: remove it :: M:90{J:82{H:40{B:30}}, T:75}
flow: yes
-->
```text
E gets -inf                   H (40) beats B (30):          only child B:
children B:30 and H:40        left rotation at E            right rotation at E
          M:90                       M:90                         M:90
         /    \                     /    \                       /    \
      J:82    T:75               J:82    T:75                 J:82    T:75
      /                          /                            /
   E:-inf                      H:40                         H:40
   /    \                      /                            /
 B:30   H:40               E:-inf                         B:30
                            /                                \
                          B:30                              E:-inf

E is a leaf: remove it    M:90 ( J:82 ( H:40 ( B:30 ) ), T:75 )
```
<!-- /figure -->

zyBooks also mentions a second way. Do a normal BST delete (copy the successor in), then percolate down with rotations. Setting the priority to −∞ is simpler.

### Height

Because the priorities are random, the treap has the shape it would have if the keys had arrived in random order, whatever order they really came in. Keys inserted in sorted order won't build a chain unless the random priorities also happen to come out sorted. So the height is O(log n) **on average**, and there are no balance factors or colors to maintain. The worst case is still O(n), but it's very unlikely.

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
| Build from n items (heapify) | O(n) | |
| Heap sort | O(n log n) best, average, and worst | |

A heap-based priority queue: enqueue and dequeue O(log n); peek, IsEmpty, and GetLength O(1).

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

  90 is removed. The last value, 50, moves to the root. Its children are 70 and 80, so it swaps with the larger, 80. At index 2, it has no children left. **80 70 50 30 60**.

  </details>

- **7.4** Heapify and heap sort.

  **a)** Build a max-heap from `3 9 2 7 5 8` with heapify. What is the array?

  <!-- answer:7.4a blanks: 9 7 8 3 5 2 | 9, 7, 8, 3, 5, 2 -->

  **b)** What is the Big-O of heapify on n items?

  <!-- answer:7.4b blanks: [O(1), O(log n), O(n), O(n log n)] => O(n) -->

  <details>
  <summary>Answer</summary>

  - **a)** Percolate down index 2 (2 swaps with 8), index 1 (9 stays), then index 0 (3 swaps with 9, then with 7): **9 7 8 3 5 2**.
  - **b)** **O(n)**, because most nodes sit near the bottom and move only a short distance.

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

  B. It rotates up until its parent's priority is higher or equal.

  C. The parent's priority is changed to match.

  <!-- answer:7.6b choice: B -->

  **c)** What is a treap's search cost on average, and in the worst case?

  <!-- answer:7.6c blanks: Average => O(log n); Worst => O(n) -->

  <details>
  <summary>Answer</summary>

  - **a)** `heapq` is a min-heap, so it pops the smallest: **1**.
  - **b)** **B.** Rotations move the node up, keeping the BST order, until the heap order holds.
  - **c)** Random priorities keep the tree balanced on average, so search is **O(log n)**. Nothing prevents a bad shape, though, so the worst case is **O(n)**.

  </details>

- **7.7** Heap sort, using the `heap_sort` code above.

  **a)** A heap has 11 nodes. What is the index of its last internal node, where heapify starts?

  <!-- answer:7.7a blanks: 4 -->

  **b)** `heap_sort` runs on a list of 11 items. How many times does it call `percolate_down` in all?

  <!-- answer:7.7b blanks: 15 -->

  **c)** Heapify `26 14 31 8 19 42 5` into a max-heap. What is the array? Separate the values with spaces.

  <!-- answer:7.7c blanks: 42 19 31 8 14 26 5 | 42, 19, 31, 8, 14, 26, 5 -->

  **d)** Heap sort then does its first round (end index 6): swap, then percolate down. What is the whole array afterward, sorted part included?

  <!-- answer:7.7d blanks: 31 19 26 8 14 5 42 | 31, 19, 26, 8, 14, 5, 42 -->

  <details>
  <summary>Answer</summary>

  - **a)** 11 // 2 − 1 = **4**.
  - **b)** Heapify calls it 11 // 2 = 5 times, and the sorting loop 11 − 1 = 10 times: **15**.
  - **c)** Index 2: 31 swaps with 42. Index 1: 14 swaps with 19. Index 0: 26 swaps with 42, then with 31. **42 19 31 8 14 26 5**.
  - **d)** 42 swaps with 5, the item at index 6. Then 5 percolates down through indexes 0 to 5: it swaps with 31 (the larger of 19 and 31), then with 26. **31 19 26 8 14 5 42**.

  </details>

- **7.8** Insert R into this treap (key:priority, priorities form a max-heap). R gets priority 60.

  <!-- figure
  tree: P:95{F:70{C:45, K:20}, W:50{S:35}}
  -->
  ```text
             P:95
            /    \
        F:70      W:50
        /   \     /
     C:45  K:20  S:35
  ```
  <!-- /figure -->

  **a)** Before any rotation, R is a new leaf. Which node is its parent?

  <!-- answer:7.8a blanks: S -->

  **b)** Which rotations restore the heap rule, in order?

  <!-- answer:7.8b blanks: First [Left at S, Right at S, Left at W, Right at W, Left at P, Right at P] => Right at S; Second [Left at S, Right at S, Left at W, Right at W, Left at P, Right at P] => Right at W -->

  **c)** After the insert, give each node's key.

  <!-- answer:7.8c blanks: R's parent => P; R's right child => W; W's left child => S -->

  <details>
  <summary>Answer</summary>

  - **a)** R > P, so go right. R < W, so go left. R < S, so go left. R becomes **S**'s left child.
  - **b)** 60 > 35, and R is a left child: **right rotation at S**. Now R is W's left child, and 60 > 50: **right rotation at W**. Now R is P's right child, and 95 ≥ 60: stop.
  - **c)** R's parent is **P**. W came down to R's right, so R's right child is **W**, and S is still **W**'s left child. The tree is P:95 with children F:70 and R:60. R:60 has right child W:50, and W:50 has left child S:35.

  </details>

- **7.9** Delete N from this treap, the zyBooks way (set its priority to −∞ and rotate it down).

  <!-- figure
  tree: G:90{C:55, N:80{J:40, T:65{Q:30}}}
  -->
  ```text
           G:90
          /    \
      C:55      N:80
               /    \
            J:40    T:65
                    /
                  Q:30
  ```
  <!-- /figure -->

  **a)** What is the first rotation?

  <!-- answer:7.9a blanks: [Left at N, Right at N, Left at G, Right at G] => Left at N -->

  **b)** How many rotations happen before N is a leaf?

  <!-- answer:7.9b blanks: 3 -->

  **c)** After N is removed, give each node's key.

  <!-- answer:7.9c blanks: T's left child => J; J's right child => Q -->

  <details>
  <summary>Answer</summary>

  - **a)** N's children are J:40 and T:65. T has the higher priority, and it's the right child, so a **left rotation at N** brings T up. N becomes T's left child, and T's old left child, Q, becomes N's right child.
  - **b)** Now N's children are J:40 and Q:30. J is higher, so a right rotation at N brings J up. N's only child is now Q, so a left rotation at N brings Q up. N is a leaf. **3** rotations.
  - **c)** G:90 has children C:55 and T:65. T's left child is **J**:40, and J's right child is **Q**:30. The keys still read C G J Q T in order, and every parent's priority is higher than its children's.

  </details>

- **7.10** The priority queue ADT and Python's `PriorityQueue`.

  **a)** A priority queue where a lower number means higher priority holds, front to end: `15 40 40 70`. A new item with priority 40 is enqueued. Where does it go?

  A. Ahead of the first 40.

  B. Between the two 40s.

  C. Behind the second 40, ahead of 70.

  D. Behind 70.

  <!-- answer:7.10a choice: C -->

  **b)** `pq = PriorityQueue()`, then `pq.put(47)`, `pq.put(12)`, `pq.put(30)`, and `pq.put(25)`. Then `x = pq.get()`. What are `x` and `pq.qsize()`?

  <!-- answer:7.10b blanks: x => 12; pq.qsize() => 3 -->

  **c)** `pq` is an empty `PriorityQueue`. A single-threaded program calls `pq.get()`. What happens?

  A. It returns `None`.

  B. It raises an exception.

  C. It waits forever for an item, so the program hangs.

  <!-- answer:7.10c choice: C -->

  <details>
  <summary>Answer</summary>

  - **a)** **C.** A new item goes behind every item of equal or higher priority, so equal priorities leave first in, first out.
  - **b)** `PriorityQueue` returns the smallest item first: **x is 12**. Four items went in and one came out: **qsize() is 3**.
  - **c)** **C.** By default, `get()` blocks until an item is available. With no other thread to put one, it never returns.

  </details>
