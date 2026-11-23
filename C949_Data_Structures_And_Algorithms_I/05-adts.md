# 5. Abstract data types

Part of the **Determines Data Structure Impact** competency. After this page you'll know each common ADT's rules and Python commands, what `pop()` removes from each, and how the structures compare.

## Data type, data structure, ADT

| Level | What it describes | Examples |
|---|---|---|
| **Data type** | One kind of value | `int`, `float`, `bool`, `str` |
| **Data structure** | How many values are laid out in memory | Array, linked list, hash table, tree, heap |
| **Abstract data type (ADT)** | Only behavior: which operations exist and what they promise | List, stack, queue, set, dictionary |

An ADT is a contract: a stack promises "last in, first out" and says nothing about arrays or nodes. A data structure is one way to keep the promise. Swap the structure and code using the ADT still works, but its speed may change.

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

**Hierarchical** structures are trees: one root, every other node has exactly one parent, and there are no cycles. BSTs and heaps are hierarchical. A balanced tree of n nodes is about log n levels tall, which is where O(log n) comes from.

**Network** structures are graphs: vertices joined by edges, with no root and no parent rule. A vertex can link to any number of others, and edges can loop back to the start.

## Questions

- **5.1** Label each one a data type, a data structure, or an ADT.

  | Name | Kind |
  |---|---|
  | `str` | |
  | Stack | |
  | Hash table | |
  | Dictionary | |
  | Heap | |
  | Priority queue | |

  <!-- answer:5.1a-f table [Data type, Data structure, ADT]: Data type; ADT; Data structure; ADT; Data structure; ADT -->

  <details>
  <summary>Answer</summary>

  - `str` is a kind of value: a data type.
  - Stack, dictionary, and priority queue only promise behavior: ADTs.
  - A hash table and a heap are memory layouts: data structures.

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

  <!-- answer:5.2 blanks: 1 3 | 1, 3 -->

  <details>
  <summary>Answer</summary>

  - `[8, 3, 5]`, then `pop()` removes 5, the last item.
  - Appending 1 gives `[8, 3, 1]`. `pop()` returns 1, leaving `[8, 3]`, so `s[-1]` is 3.

  </details>

- **5.3** What does `d` hold at the end? Write the values left to right, separated by commas.

  ```python
  from collections import deque
  d = deque([6, 2, 9])
  d.appendleft(4)
  d.append(7)
  d.popleft()
  d.pop()
  d.appendleft(1)
  ```

  <!-- answer:5.3 blanks: 1, 6, 2, 9 | 1,6,2,9 -->

  <details>
  <summary>Answer</summary>

  - The two appends give `4 6 2 9 7`.
  - `popleft()` removes 4 and `pop()` removes 7: `6 2 9`. Then `appendleft(1)`: `1 6 2 9`.

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

  <!-- answer:5.4 blanks: a => 5; b => 12 -->

  <details>
  <summary>Answer</summary>

  - `heapq` is a min-heap, so `heappop` returns the smallest value left: 5, then 12.

  </details>

- **5.5** Pick the ADT that fits each job best.

  | Job | ADT |
  |---|---|
  | Help-line calls, answered in arrival order | |
  | Looking up a book's title by its ISBN | |
  | The distinct ZIP codes in a day's orders | |
  | An editor's Undo command | |
  | Patients, treated most urgent first | |
  | An (x, y) pair that must never change | |
  | Raffle tickets in a drum, several per person | |

  <!-- answer:5.5a-g table [List, Tuple, Stack, Queue, Bag, Set, Priority queue, Dictionary]: Queue; Dictionary; Set; Stack; Priority queue; Tuple; Bag -->

  <details>
  <summary>Answer</summary>

  - Arrival order: **queue**. Newest first: **stack**. Most urgent first: **priority queue**.
  - By key: **dictionary**. Unique, unordered: **set**. Unchangeable: **tuple**. Repeats, unordered: **bag**.

  </details>

- **5.6** Label each structure's shape.

  | Structure | Shape |
  |---|---|
  | Doubly linked list | |
  | Max-heap | |
  | Cities joined by roads | |
  | Deque | |
  | Binary search tree | |

  <!-- answer:5.6a-e table [Linear, Hierarchical, Network]: Linear; Hierarchical; Network; Linear; Hierarchical -->

  <details>
  <summary>Answer</summary>

  - Lists and deques keep items in one line: linear.
  - Heaps and BSTs are trees: hierarchical.
  - Roads form a graph, with no root and loops allowed: network.

  </details>

- **5.7** What does this print? Fill in each value.

  ```python
  d = {"red": 1, "blue": 2}
  d["green"] = 3
  d["red"] = 4
  del d["blue"]
  print(d.get("blue", 0), len(d), d["red"])
  ```

  <!-- answer:5.7 blanks: get => 0; len => 2; red value => 4 -->

  <details>
  <summary>Answer</summary>

  - `d["red"] = 4` replaces the value; keys are unique.
  - After `del`, the keys are "red" and "green": `len(d)` is 2.
  - `get` returns its default, 0, for a missing key.

  </details>

- **5.8** Pick the Big-O of each, for n items.

  | Operation | Big-O |
  |---|---|
  | `q.popleft()` on a `deque` | |
  | `a.pop(0)` on a `list` | |
  | `heapq.heappop(h)` | |
  | `x in s` for a set, average case | |
  | `x in a` for a list, worst case | |
  | `d[k]` on a dict when every key collides | |

  <!-- answer:5.8a-f table [O(1), O(log n), O(n)]: O(1); O(n); O(log n); O(1); O(n); O(n) -->

  <details>
  <summary>Answer</summary>

  - `popleft` unlinks one end; `pop(0)` shifts every other item left.
  - `heappop` sinks the new root one level at a time.
  - Hashing goes straight to a bucket on average; if every key shares one bucket, a lookup checks them all. A list is checked item by item.

  </details>

- **5.9** Read this code.

  ```python
  s = {4, 7, 4, 2, 7}
  s.add(2)
  s.discard(9)
  print(len(s))
  ```

  **a)** What does it print?

  <!-- answer:5.9a blanks: 3 -->

  **b)** What would `s.remove(9)` do in place of `s.discard(9)`?

  A. The same thing

  B. Raise a `KeyError`

  C. Remove the last item added

  <!-- answer:5.9b choice: B -->

  <details>
  <summary>Answer</summary>

  - **a)** The set holds one each of 2, 4, and 7. The `add` and `discard` change nothing.
  - **b)** **B.** `remove` raises an error for a missing item; `discard` doesn't.

  </details>
