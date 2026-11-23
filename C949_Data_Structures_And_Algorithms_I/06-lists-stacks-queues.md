# 6. Lists, stacks, and queues

Part of the **Determines Data Structure Impact** competency. After this page you'll be able to trace arrays, linked lists, stacks, queues, and deques by hand, and say what each operation costs.

## Arrays and Python lists

An array keeps its items side by side in one block of memory. Item i's address is the start plus i times the item size, so `a[i]` is O(1). The catch: inserting in the middle shifts every later item right first:

<!-- figure
index: yes
row: before | K P R T W · | insert M at index 2
row: after | K P *M R T W | W, T, R each shifted right, back to front (3 shifts)
-->
```text
index:    0  1  2  3  4  5
before:  [K, P, R, T, W, ·]     insert M at index 2
after:   [K, P, M, R, T, W]     W, T, R shifted right (3 shifts)
```
<!-- /figure -->

Removing from the middle shifts the later items left. Both are O(n). The end is the cheap spot: `append` and `pop()` shift nothing.

A Python `list` is a **dynamic array** with spare slots. When they run out, `append` allocates an array about twice as big and copies every item over: O(n) for that one append. After growing to 2n slots, the next n appends are O(1), so averaged out each append is O(1) **amortized**.

### Sequential and linked allocation

- **Sequential allocation** (arrays): one block. Fast indexing; growing means copying, inserts mean shifting.
- **Linked allocation** (linked lists): each node sits anywhere in memory with a pointer to the next. No copying or shifting, but reaching item i follows i pointers.

<div class="viz" data-viz="allocation" markdown>

*On the site, a drawing here compares an array's single block of memory with a linked list's scattered nodes.*

</div>

## Singly linked lists

Each **node** holds a value and a `next` pointer. The list keeps `head` (first node) and `tail` (last node). The last node's `next` is `None`.

<!-- figure
list: 3 8 5 2
-->
```text
head                    tail
 ↓                       ↓
[3] → [8] → [5] → [2] → None
```
<!-- /figure -->

- **Prepend:** point the new node at `head`, then move `head` to it. O(1).
- **Append:** set `tail.next` to the new node, then move `tail` to it. O(1) with a tail pointer; O(n) without one, since you walk to the end first. In an empty list, both `head` and `tail` point at the new node.
- **Insert after** a node `cur` you already have: set `new.next = cur.next`, then `cur.next = new`. O(1). Do it in that order: setting `cur.next` first loses the only pointer to the rest of the list. If `cur` was the tail, move `tail` too.

<!-- figure
title: Insert 10 after the node holding 2
nodes: 6 0 0, 2 1 0, 7 2.4 0, 10 1.7 0.8
edges: 6>2, 2>10, 10>7
-->
```text
6 → 2       7
     ↘     ↗
       10
```
<!-- /figure -->

- **Remove:** the node **before** the one leaving points past it (`prev.next = prev.next.next`). Removing the head is O(1): move `head` to `head.next`. Removing the **tail** is O(n) even with a tail pointer, because the new tail is the node before it, found by walking.

- **Search:** walk from `head` until you find the value or reach `None`. Best O(1) (it's the head); average and worst O(n) (near the end, or missing).

<div class="viz" data-viz="linked-list" markdown>

*On the site, an interactive diagram here steps through prepend, append, insert after, remove last, and search on a singly linked list.*

</div>

## Doubly linked lists

Each node also has a `prev` pointer to the node before it.

<!-- figure
list: 3 8 5 2
double: yes
-->
```text
None ← [3] ⇄ [8] ⇄ [5] ⇄ [2] → None
```
<!-- /figure -->

It costs memory and more pointer updates. In return:

- **Remove** any node you have, the tail included, in O(1): `cur.prev.next = cur.next` and `cur.next.prev = cur.prev`.
- **Insert after** `cur` changes four pointers: the new node's `next` and `prev`, `cur.next`, and the old successor's `prev`.
- You can walk backward from `tail`.

In a **circular** list, the tail's `next` points back to the head, so a walk stops when it returns to `head`, not at `None`. It suits taking turns.

## Stacks

A **stack** is last in, first out (LIFO). **Push** adds on top, **pop** removes and returns the top, and **peek** reads the top without removing it. Popping an empty stack is an error.

Put the top where adding and removing are both O(1):

- On a Python `list`, the top is the **end**: `append(x)`, `pop()`, `s[-1]`. All O(1) (append amortized).
- On a singly linked list, the top is the **head**: popping the tail would be O(n).

Stacks handle "most recent first" jobs: undo, matching brackets, the call stack.

## Queues

A **queue** is first in, first out (FIFO). **Enqueue** adds at the back, **dequeue** removes and returns the front, and **peek** reads the front.

A `list` makes a poor queue. `pop(0)` takes the front, then every other item shifts left to close the gap:

<!-- figure
index: yes
row: before | *A B C D | pop(0) takes A
row: after | B C D · | B, C, D each shifted left (3 shifts)
-->
```text
index:    0  1  2  3
before:  [A, B, C, D]     pop(0) takes A
after:   [B, C, D, ·]     B, C, D shifted left (3 shifts)
```
<!-- /figure -->

That's O(n) per dequeue. Use `collections.deque`: `append(x)` enqueues, `popleft()` dequeues, `q[0]` peeks, all O(1). A linked queue enqueues at the tail and dequeues at the head. An array queue uses a **circular array**, moving a `front` index (wrapping with `%`) instead of the items.

<div class="viz" data-viz="stack-queue" markdown>

*On the site, an interactive diagram here pushes and pops a stack, and enqueues and dequeues a queue stored in a circular array.*

</div>

## Deques

A **deque** (double-ended queue) adds and removes at both ends in O(1). Python's `collections.deque` has `append`, `appendleft`, `pop`, and `popleft`; `d[0]` and `d[-1]` peek. It's built on a doubly linked list of blocks, so reaching the middle by index is O(n).

Add and remove at the same end, and it acts as a stack; at opposite ends, a queue.

## Big-O summary

| Operation | Python `list` | Singly linked (head and tail) | Doubly linked | `deque` |
|---|---|---|---|---|
| Read item i | O(1) | O(n) | O(n) | O(n) in the middle, O(1) at the ends |
| Add at end | O(1) amortized, O(n) on a resize | O(1) | O(1) | O(1) |
| Add at front | O(n) | O(1) | O(1) | O(1) |
| Remove at end | O(1) | O(n) | O(1) | O(1) |
| Remove at front | O(n) | O(1) | O(1) | O(1) |
| Insert or remove in the middle | O(n) | O(1) at a node you have, O(n) to find it | same | O(n) |
| Search | O(1) best, O(n) avg and worst | same | same | same |

## Questions

- **6.1** `a = [10, 20, 30, 40, 50]`.

  **a)** `a.insert(1, 15)` runs. How many items shift right?

  <!-- answer:6.1a blanks: 4 -->

  **b)** What is the index of 40 now?

  <!-- answer:6.1b blanks: 4 -->

  **c)** Another list's array has 8 slots, all full. When one more item is appended, how many items are copied to the new array?

  <!-- answer:6.1c blanks: 8 -->

  <details>
  <summary>Answer</summary>

  - **a)** 20, 30, 40, and 50 shift right to open index 1, so 40 moves from index 3 to **b)** 4.
  - **c)** All 8 are copied, then the new item goes in.

  </details>

- **6.2** A singly linked list holds `4 → 9 → 1`, with `head` at 4 and `tail` at 1. These run in order:

  1. Prepend 7
  2. Append 3
  3. Remove the node holding 9
  4. Insert 6 after the node holding 1

  **a)** What does the list hold, head to tail? Separate the values with commas.

  <!-- answer:6.2a blanks: 7, 4, 1, 6, 3 | 7,4,1,6,3 -->

  **b)** Which values are at the head and the tail?

  <!-- answer:6.2b blanks: Head => 7; Tail => 3 -->

  <details>
  <summary>Answer</summary>

  - Steps 1 and 2: `7 → 4 → 9 → 1 → 3`. Step 3 points 4 past 9: `7 → 4 → 1 → 3`.
  - Step 4: `7 → 4 → 1 → 6 → 3`. Node 1 wasn't the tail, so `tail` stays at 3.

  </details>

- **6.3** Pick the Big-O of each, for n items.

  | Operation | Big-O |
  |---|---|
  | Remove the tail of a singly linked list with a tail pointer | |
  | Remove the tail of a doubly linked list | |
  | Read the 50th item of a linked list | |
  | `a[50]` on a Python list | |
  | `a.insert(0, x)` on a Python list | |
  | Prepend to a singly linked list | |
  | `a.append(x)`, averaged over many appends | |

  <!-- answer:6.3a-g table [O(1), O(log n), O(n)]: O(n); O(1); O(n); O(1); O(n); O(1); O(1) -->

  <details>
  <summary>Answer</summary>

  - Singly linked tail removal walks to the node before the tail; doubly linked has `prev`.
  - A linked list follows pointers to reach an index; an array computes the address.
  - `insert(0, x)` shifts every item. Prepend and amortized append are O(1).

  </details>

- **6.4** You insert `new` after node `cur` in a singly linked list. Which order is correct?

  A. `cur.next = new`, then `new.next = cur.next`

  B. `new.next = cur.next`, then `cur.next = new`

  C. Either order works

  <!-- answer:6.4 choice: B -->

  <details>
  <summary>Answer</summary>

  **B.** In A, `cur.next` is overwritten first, so `new.next = cur.next` points `new` at itself and the rest of the list is lost.

  </details>

- **6.5** Starting with an empty stack:

  ```text
  Push(6)
  Push(1)
  Pop()
  Push(8)
  Push(3)
  Pop()
  Pop()
  Peek()
  ```

  **a)** What do the three Pops return, in order? Separate them with commas.

  <!-- answer:6.5a blanks: 1, 3, 8 | 1,3,8 -->

  **b)** What does Peek return?

  <!-- answer:6.5b blanks: 6 -->

  <details>
  <summary>Answer</summary>

  - After pushing 6 and 1, Pop returns **1**. Pushing 8 and 3 gives `6 8 3`; the Pops return **3**, then **8**.
  - **b)** Only 6 is left.

  </details>

- **6.6** What does this print?

  ```python
  from collections import deque
  q = deque()
  q.append(5)
  q.append(2)
  q.append(9)
  q.popleft()
  q.append(4)
  print(q.popleft(), q[0])
  ```

  <!-- answer:6.6 blanks: 2 9 | 2, 9 -->

  <details>
  <summary>Answer</summary>

  - The first `popleft()` removes 5, the oldest. The queue is `2 9 4`.
  - `popleft()` returns 2, and the front is then 9.

  </details>

- **6.7** Each row adds with the first call and removes with the second, on a `deque`. Does it behave as a stack or a queue?

  | Add / remove | Behaves as |
  |---|---|
  | `append` / `pop` | |
  | `append` / `popleft` | |
  | `appendleft` / `pop` | |
  | `appendleft` / `popleft` | |

  <!-- answer:6.7a-d table [Stack, Queue]: Stack; Queue; Queue; Stack -->

  <details>
  <summary>Answer</summary>

  - Adding and removing at the same end gives the newest item back: a stack.
  - Adding at one end and removing at the other gives the oldest back: a queue.

  </details>

- **6.8** Doubly linked and circular lists.

  **a)** How many pointers change when you insert a node between two others in a doubly linked list?

  <!-- answer:6.8a blanks: 4 | four -->

  **b)** A loop walks a circular singly linked list from `head`. When does it stop?

  A. When `cur.next` is `None`

  B. When it gets back to `head`

  C. Never

  <!-- answer:6.8b choice: B -->

  <details>
  <summary>Answer</summary>

  - **a)** The new node's `next` and `prev`, the node before's `next`, and the node after's `prev`.
  - **b)** **B.** No `next` is ever `None`, so checking for `None` would loop forever.

  </details>
