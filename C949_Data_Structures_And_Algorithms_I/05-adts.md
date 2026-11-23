# 5. Abstract data types

An abstract data type names what a collection does and leaves how it's stored to a data structure.

After this page you can:

- Tell a data type, data structure, and ADT apart
- Use each common ADT's Python commands
- Predict what `pop()` removes from each structure

## Data type, data structure, ADT

| Level | What it describes | Examples |
|---|---|---|
| **Data type** | One kind of value | `int`, `float`, `bool`, `str` |
| **Data structure** | How many values are laid out in memory | Array, linked list, hash table, tree, heap |
| **Abstract data type (ADT)** | Only behavior: which operations exist and what they promise | List, stack, queue, set, dictionary |

An ADT is a contract: a stack promises "last in, first out" and says nothing about arrays or nodes. A data structure is one way to keep the promise. Swap the structure and code using the ADT still works, but its speed may change.

> [!IMPORTANT]
> **Key idea:** An ADT is the promise of what operations do, and a data structure is one way to keep that promise.

## The ADTs, one card each

### List

- **What:** items in a set order, reached by position. Duplicates allowed.
- **Different:** read, insert, or remove at any index.
- **Built on:** a dynamic array (Python) or a linked list.
- **Python:** `a = []`, `a.append(x)`, `a.insert(i, x)`, `a.pop()` (last item), `a.pop(i)`, `a.remove(x)` (first x), `a[i]`. Costs are on [the lists page](06-lists-stacks-queues.md#arrays-and-python-lists).

### Tuple

- **What:** an ordered, indexed group, like `(40.7, -74.0)`.
- **Different:** **immutable**, so it can't be changed after it's made. That's why it can be a dictionary key.
- **Built on:** a fixed-size array.
- **Python:** `t = (1, 2)`, `t[0]`, `t[1:]`, `len(t)`, `t.count(x)`, `t.index(x)`.

### Stack

- **What:** last in, first out (LIFO), like a pile of plates.
- **Different:** you only touch the top.
- **Built on:** the end of an array, or the head of a linked list.
- **Python:** a `list`. `s.append(x)` pushes, `s.pop()` pops, `s[-1]` peeks.

### Queue

- **What:** first in, first out (FIFO), like a checkout line.
- **Different:** in at the back, out at the front.
- **Built on:** a linked list (head is the front) or a circular array.
- **Python:** `collections.deque`: `q.append(x)` enqueues, `q.popleft()` dequeues, `q[0]` peeks. A `list` with `pop(0)` works but is O(n), since every other item shifts left.

### Deque

- **What:** a double-ended queue ("deck"): add and remove at both ends.
- **Different:** it can act as a stack or a queue.
- **Built on:** a doubly linked list (Python's links small blocks) or a circular array.
- **Python:** `from collections import deque`, then `d.append(x)`, `d.appendleft(x)`, `d.pop()` (right end), `d.popleft()` (left end). All O(1).

### Bag

- **What:** no order, duplicates allowed, like a bag of marbles.
- **Different:** a set that keeps repeats.
- **Built on:** an array, a linked list, or a hash table of counts.
- **Python:** no built-in bag. Use a `list` and ignore its order, or `collections.Counter`: `c["red"] += 1`.

### Set

- **What:** unique items, no order.
- **Different:** adding an item that's already there does nothing.
- **Built on:** a hash table (Python) or a balanced BST.
- **Python:** `s = set()` (`{}` is an empty dict), `s.add(x)`, `s.remove(x)` (error if missing), `s.discard(x)` (no error), `x in s`. Union and friends are on [the sets page](09-sets-graphs.md).

### Priority queue

- **What:** the highest-priority item comes out first, whatever the arrival order.
- **Different:** order comes from priority, not arrival.
- **Built on:** a [heap](08-trees-heaps.md).
- **Python:** `heapq.heappush(h, x)`, `heapq.heappop(h)`, `h[0]` peeks. `heapq` is a **min-heap**: the smallest comes out first. For largest-first, push `-x` and negate what comes out.

### Dictionary (map)

- **What:** key-value pairs; you look up a value by its key.
- **Different:** keys are unique; values can repeat.
- **Built on:** a [hash table](07-hash-tables.md) (Python) or a BST.
- **Python:** `d = {}`, `d[k] = v` adds or replaces, `d[k]` (error if missing), `d.get(k, default)`, `k in d`, `del d[k]`, `d.pop(k)`. `d.keys()`, `d.values()`, `d.items()` return views; `list()` turns one into a list. Keys must be immutable: a string or tuple, not a list.

## What `pop()` removes

Add 40, then 15, then 70 to each. The highlighted cell comes out next.

> [!IMPORTANT]
> **Key idea:** Each ADT is defined by which item it gives back next, so the same three adds can come out in different orders.

<!-- figure
title: After adding 40, then 15, then 70
row: stack: s.pop() | 40 15 *70 | the newest, 70
row: queue: q.popleft() | *40 15 70 | the oldest, 40
row: deque: d.pop() / d.popleft() | *40 15 *70 | 70 from the right, 40 from the left
row: heapq: heappop(h) | *15 40 70 | the smallest, 15
-->
```text
stack: s.pop()                 40 15 [70]     the newest, 70
queue: q.popleft()            [40] 15 70      the oldest, 40
deque: d.pop() / d.popleft()  [40] 15 [70]    70 from the right, 40 from the left
heapq: heappop(h)             [15] 40 70      the smallest, 15
```
<!-- /figure -->

| Structure | Call | Removes | Cost |
|---|---|---|---|
| Stack (`list`) | `pop()` | The newest item (top) | O(1) |
| Queue (`deque`) | `popleft()` | The oldest item (front) | O(1) |
| Queue (`list`) | `pop(0)` | The oldest item (front) | O(n) |
| Deque | `pop()` / `popleft()` | Right end / left end | O(1) |
| Priority queue (`heapq`) | `heappop(h)` | The smallest item | O(log n) |
| Dictionary | `pop(k)` | Key k's pair, returning its value | O(1) average |

The course study guide (in your course resources) names a linked list as the base for queues and deques. That's one valid build, but in Python use `collections.deque`, not a `list` with `pop(0)`.

## Design properties

**Ordered**: items keep a reliable sequence. **Indexed**: you can jump to an item by position or key.

> [!IMPORTANT]
> **Key idea:** Being ordered and being indexed are separate properties, so check each one on its own for every structure.

| Structure | Ordered? | Indexed? | Duplicates? | Shape | Insert | Delete | Search |
|---|---|---|---|---|---|---|---|
| Array (`list`) | Yes | Yes | Yes | Linear | O(1) end, O(n) middle | O(1) end, O(n) middle | O(n) |
| Singly linked list | Yes | No | Yes | Linear | O(1) head or tail | O(1) head, O(n) others | O(n) |
| Doubly linked list | Yes | No | Yes | Linear | O(1) ends or beside a node | O(1) for a node you have | O(n) |
| Stack | By arrival | Top only | Yes | Linear | O(1) | O(1) | O(n) |
| Queue | By arrival | Front only | Yes | Linear | O(1) | O(1) | O(n) |
| Deque | By arrival | Both ends | Yes | Linear | O(1) | O(1) | O(n) |
| Hash table / `dict` | No (`dict` keeps insertion order) | By key | Keys no | Flat (buckets) | O(1) avg, O(n) worst | O(1) avg, O(n) worst | O(1) avg, O(n) worst |
| Set | No | No | No | Flat (buckets) | O(1) avg, O(n) worst | O(1) avg, O(n) worst | O(1) avg, O(n) worst |
| BST | Sorted (inorder) | No | Yes, they go right | Hierarchical | O(log n) avg, O(n) worst | O(log n) avg, O(n) worst | O(log n) avg, O(n) worst |
| Heap | Parent beats children | Yes (array) | Yes | Hierarchical | O(log n) | O(log n) root | O(n) |
| Graph | No | No | No repeated edges | Network | O(1) add edge | Depends on storage | O(V + E) traverse |

Two common claims are wrong:

- **Heaps are indexed.** A heap is an array, and you reach a node's parent and children by index arithmetic.
- **Graphs aren't hierarchical.** Trees are. A graph has no root and can have cycles.

## Linear, hierarchical, and network structures

**Linear** structures keep items in one line: each has at most one item before it and one after. Arrays, linked lists, stacks, queues, and deques are linear. Searching an unsorted one is O(n).

> [!IMPORTANT]
> **Key idea:** The shape comes from how items connect: a single line, one parent per node, or links to any number of others.

**Hierarchical** structures are trees: one root, every other node has exactly one parent, and there are no cycles. BSTs and heaps are hierarchical. A balanced tree of n nodes is about log n levels tall, which is where O(log n) comes from.

**Network** structures are graphs: vertices joined by edges, with no root and no parent rule. A vertex can link to any number of others, and edges can loop back to the start.

## Questions

- **5.1** Data type, data structure, or ADT?

  **a)** Which one is an ADT?

  A. Hash table

  B. Heap

  C. `str`

  D. Dictionary

  <!-- answer:5.1a choice: D -->

  **b)** Which one is a data structure?

  A. Stack

  B. Heap

  C. Priority queue

  D. Dictionary

  <!-- answer:5.1b choice: B -->

  **c)** Which labels `str`, hash table, and stack, in that order?

  A. Data type, data structure, ADT

  B. Data type, ADT, data structure

  C. Data structure, data structure, ADT

  D. ADT, data structure, ADT

  <!-- answer:5.1c choice: A -->

  <details>
  <summary>Answer</summary>

  - `str` is a kind of value: a data type.
  - Stack, dictionary, and priority queue only promise behavior: ADTs.
  - A hash table and a heap are memory layouts: data structures.
  - **a)** **D.** A is the structure Python builds a dictionary on, not the ADT itself.
  - **b)** **B.** C is the ADT a heap usually builds; the names are easy to swap.
  - **c)** **A.** B swaps the last two: the table is how it's stored, the stack is what it promises.

  </details>

- **5.2** What does this print?

  ```python
  s = []
  s.append(8)
  s.append(3)
  s.append(5)
  s.pop()
  s.append(1)
  print(s.pop(), s[-1])
  ```

  A. `1 5`

  B. `3 1`

  C. `1 3`

  D. `1 1`

  <!-- answer:5.2 choice: C -->

  <details>
  <summary>Answer</summary>

  - **C.** `[8, 3, 5]`, then `pop()` removes 5, the last item. Appending 1 gives `[8, 3, 1]`. `pop()` returns 1, leaving `[8, 3]`, so `s[-1]` is 3.
  - A forgets the first `pop()`. D reads `s[-1]` before the `pop()`, but arguments run left to right.

  </details>

- **5.3** What does `d` hold at the end, left to right?

  ```python
  from collections import deque
  d = deque([6, 2, 9])
  d.appendleft(4)
  d.append(7)
  d.popleft()
  d.pop()
  d.appendleft(1)
  ```

  A. `6 2 9 1`

  B. `1 6 2 9`

  C. `1 2 9 7`

  D. `2 9 4 1`

  <!-- answer:5.3 choice: B -->

  <details>
  <summary>Answer</summary>

  - **B.** The two appends give `4 6 2 9 7`. `popleft()` removes 4 and `pop()` removes 7: `6 2 9`. Then `appendleft(1)`: `1 6 2 9`.
  - C treats `pop()` as taking from the left too; it takes from the right.

  </details>

- **5.4** These calls run on an empty list `h`:

  ```python
  import heapq
  heapq.heappush(h, 12)
  heapq.heappush(h, 30)
  heapq.heappush(h, 5)
  heapq.heappush(h, 18)
  a = heapq.heappop(h)
  b = heapq.heappop(h)
  ```

  What are `a` and `b`?

  A. a = 12, b = 30

  B. a = 30, b = 18

  C. a = 18, b = 5

  D. a = 5, b = 12

  <!-- answer:5.4 choice: D -->

  <details>
  <summary>Answer</summary>

  - **D.** `heapq` is a min-heap, so `heappop` returns the smallest value left: 5, then 12.
  - B is a max-heap's answer. A is arrival order, C newest first.

  </details>

- **5.5** Pick the ADT that fits each job best.

  **a)** Help-line calls, answered in arrival order

  A. Queue

  B. Stack

  C. Priority queue

  D. Bag

  <!-- answer:5.5a choice: A -->

  **b)** An editor's Undo command

  A. Queue

  B. Set

  C. Stack

  D. Priority queue

  <!-- answer:5.5b choice: C -->

  **c)** Raffle tickets in a drum, several per person

  A. Set

  B. Tuple

  C. Dictionary

  D. Bag

  <!-- answer:5.5c choice: D -->

  <details>
  <summary>Answer</summary>

  - **a)** **A.** Arrival order is first in, first out. B would answer the newest caller first.
  - **b)** **C.** Undo reverses the most recent edit first. A would undo the oldest edit.
  - **c)** **D.** No order, repeats allowed. A drops repeats, so each person would hold one ticket.

  </details>

- **5.6** Shapes.

  **a)** Which labels a doubly linked list, a max-heap, and cities joined by roads, in that order?

  A. Linear, linear, network

  B. Linear, hierarchical, network

  C. Linear, hierarchical, hierarchical

  D. Hierarchical, hierarchical, network

  <!-- answer:5.6a choice: B -->

  **b)** Which one is not linear?

  A. Deque

  B. Stack

  C. Binary search tree

  D. Doubly linked list

  <!-- answer:5.6b choice: C -->

  <details>
  <summary>Answer</summary>

  - **a)** **B.** A list keeps items in one line; a heap is a tree; roads form a graph, with no root and loops allowed. A goes by the heap's array storage, not its shape.
  - **b)** **C.** A BST is a tree: hierarchical. D's two pointers per node still keep one line.

  </details>

- **5.7** What does this print?

  ```python
  d = {"red": 1, "blue": 2}
  d["green"] = 3
  d["red"] = 4
  del d["blue"]
  print(d.get("blue", 0), len(d), d["red"])
  ```

  A. `0 2 4`

  B. `0 3 4`

  C. `0 2 1`

  D. `2 3 4`

  <!-- answer:5.7 choice: A -->

  <details>
  <summary>Answer</summary>

  - **A.** `d["red"] = 4` replaces the value; keys are unique. After `del`, the keys are "red" and "green", so `len(d)` is 2. `get` returns its default, 0, for a missing key.
  - B counts a second "red" key; C keeps the old value.

  </details>

- **5.8** Pick the Big-O, for n items.

  **a)** `a.pop(0)` on a `list`

  A. O(1)

  B. O(n)

  C. O(log n)

  D. O(n log n)

  <!-- answer:5.8a choice: B -->

  **b)** `heapq.heappop(h)`

  A. O(log n)

  B. O(1)

  C. O(n)

  D. O(n log n)

  <!-- answer:5.8b choice: A -->

  **c)** `d[k]` on a dict when every key collides

  A. O(1)

  B. O(log n)

  C. O(n log n)

  D. O(n)

  <!-- answer:5.8c choice: D -->

  <details>
  <summary>Answer</summary>

  - **a)** **B.** `pop(0)` shifts every other item left. A is a `deque`'s `popleft()`.
  - **b)** **A.** `heappop` sinks the new root one level at a time. B is the cost of peeking at `h[0]`, not of removing it.
  - **c)** **D.** If every key shares one bucket, a lookup checks them all. A is the average case.

  </details>

- **5.9** Read this code.

  ```python
  s = {4, 7, 4, 2, 7}
  s.add(2)
  s.discard(9)
  print(len(s))
  ```

  **a)** What does it print?

  A. 5

  B. 2

  C. 3

  D. 6

  <!-- answer:5.9a choice: C -->

  **b)** What would `s.remove(9)` do in place of `s.discard(9)`?

  A. The same thing

  B. Raise a `KeyError`

  C. Remove the last item added

  D. Return `False` and leave the set unchanged

  <!-- answer:5.9b choice: B -->

  <details>
  <summary>Answer</summary>

  - **a)** **C.** The set holds one each of 2, 4, and 7. The `add` and `discard` change nothing. A counts the duplicates in the literal.
  - **b)** **B.** `remove` raises an error for a missing item; `discard` doesn't. D is how some other languages report it.

  </details>
