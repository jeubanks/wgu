# 6. Lists, stacks, and queues

Keep items in a row or a chain of nodes, then add and remove them at the ends or in the middle.

After this page you can:

- Trace inserts and removals in arrays and linked lists
- Trace stack, queue, and deque operations by hand
- Give the Big-O of each operation on each structure

## Arrays and Python lists

An array keeps its items side by side in one block of memory. Item i's address is the start plus i times the item size, so `a[i]` is O(1). Inserting in the middle is slower, because it shifts every later item right first:

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

> [!IMPORTANT]
> **Key idea:** An array is fast to read by index, but inserting or deleting in the middle moves all the items after it.

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

> [!IMPORTANT]
> **Key idea:** In a linked list, inserting after a node you already have is quick, but reaching that node means walking from the head.

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

**Insert after** a node `cur` you already have, in O(1):

1. Set `new.next = cur.next`.
2. Set `cur.next = new`.
3. If `cur` was the tail, move `tail` to the new node.

The order matters: setting `cur.next` first loses the only pointer to the rest of the list.

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

**Remove** a node, depending on where it is:

- **In the middle:** the node **before** it points past it (`prev.next = prev.next.next`). Finding that node takes a walk: O(n).
- **The head:** move `head` to `head.next`. O(1).
- **The tail:** O(n) even with a tail pointer, because the new tail is the node before it, found by walking.

**Search:** walk from `head` until you find the value or reach `None`. Best O(1) (it's the head); average and worst O(n) (near the end, or missing).

<div class="viz" data-viz="linked-list" markdown>

*On the site, an interactive diagram here steps through prepend, append, insert after, remove last, and search on a singly linked list.*

</div>

## Doubly linked lists

Each node also has a `prev` pointer to the node before it.

> [!IMPORTANT]
> **Key idea:** With a `prev` pointer on every node, you can walk backward and remove a node you already have without searching for the one before it, but each node takes more memory and each change updates more pointers.

<!-- figure
list: 3 8 5 2
double: yes
-->
```text
None ← [3] ⇄ [8] ⇄ [5] ⇄ [2] → None
```
<!-- /figure -->

What changes:

- **Remove** any node you have, the tail included, in O(1): `cur.prev.next = cur.next` and `cur.next.prev = cur.prev`.
- **Insert after** `cur` changes four pointers: the new node's `next` and `prev`, `cur.next`, and the old successor's `prev`.
- You can walk backward from `tail`.

In a **circular** list, the tail's `next` points back to the head, so a walk stops when it returns to `head`, not at `None`. It suits taking turns.

## Stacks

A **stack** is last in, first out (LIFO). **Push** adds on top, **pop** removes and returns the top, and **peek** reads the top without removing it. Popping an empty stack is an error.

> [!IMPORTANT]
> **Key idea:** A stack returns the newest item, so put its top at an end where adding and removing are both O(1).

Put the top where adding and removing are both O(1):

- On a Python `list`, the top is the **end**: `append(x)`, `pop()`, `s[-1]`. All O(1) (append amortized).
- On a singly linked list, the top is the **head**: popping the tail would be O(n).

Stacks handle "most recent first" jobs: undo, matching brackets, the call stack.

## Queues

A **queue** is first in, first out (FIFO). **Enqueue** adds at the back, **dequeue** removes and returns the front, and **peek** reads the front.

> [!IMPORTANT]
> **Key idea:** A queue returns the oldest item, so it needs a structure that can remove the front without moving the rest.

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

That's O(n) per dequeue. These all take O(1):

- **In Python:** use `collections.deque`. `append(x)` enqueues, `popleft()` dequeues, and `q[0]` peeks.
- **A linked queue** enqueues at the tail and dequeues at the head.
- **An array queue** uses a **circular array**: it moves a `front` index (wrapping with `%`) and leaves the items in place.

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

- **6.1** Start with `a = [10, 20, 30, 40, 50]`.

  **a)** When `a.insert(1, 15)` runs, how many items shift one place right?

  A. 1

  B. 3

  C. 4

  D. 5

  <!-- answer:6.1a choice: C -->

  **b)** After that insert, what is the index of 40?

  A. 4

  B. 3

  C. 5

  D. 2

  <!-- answer:6.1b choice: A -->

  **c)** Another list's array has 8 slots, all full. When one more item is appended, how many items are copied to the new array?

  A. 1

  B. 8

  C. 9

  D. 16

  <!-- answer:6.1c choice: B -->

  <details>
  <summary>Answer</summary>

  - **a)** **C.** 20, 30, 40, and 50 shift right to open index 1. D shifts 10 too, but it sits before the gap.
  - **b)** **A.** 40 moves from index 3 to 4. B is its old index.
  - **c)** **B.** All 8 are copied, then the new item goes in. C copies the new item too; D is the new array's size.

  </details>

- **6.2** A singly linked list holds `4 → 9 → 1`, with `head` at 4 and `tail` at 1. These run in order:

  1. Prepend 7
  2. Append 3
  3. Remove the node holding 9
  4. Insert 6 after the node holding 1

  **a)** What does the list hold, head to tail?

  A. `7 → 4 → 1 → 3 → 6`

  B. `4 → 1 → 6 → 7 → 3`

  C. `7 → 9 → 1 → 6 → 3`

  D. `7 → 4 → 1 → 6 → 3`

  <!-- answer:6.2a choice: D -->

  **b)** Which values are at the head and the tail?

  A. Head 7, tail 3

  B. Head 7, tail 6

  C. Head 4, tail 3

  D. Head 7, tail 1

  <!-- answer:6.2b choice: A -->

  <details>
  <summary>Answer</summary>

  - Steps 1 and 2: `7 → 4 → 9 → 1 → 3`. Step 3 points 4 past 9: `7 → 4 → 1 → 3`.
  - Step 4: `7 → 4 → 1 → 6 → 3`. Node 1 wasn't the tail, so `tail` stays at 3.
  - **a)** **D.** A treats 1 as still the tail. C removes the node before 9 instead of 9.
  - **b)** **A.** B moves `tail` after step 4, which is only right when inserting after the tail.

  </details>

- **6.3** What is the Big-O of each operation on n items?

  **a)** Removing the tail of a singly linked list that has a tail pointer

  A. O(1)

  B. O(log n)

  C. O(n)

  D. O(n log n)

  <!-- answer:6.3a choice: C -->

  **b)** Removing the tail of a doubly linked list that has a tail pointer

  A. O(1)

  B. O(log n)

  C. O(n)

  D. O(n log n)

  <!-- answer:6.3b choice: A -->

  **c)** Reading the middle item of a linked list

  A. O(1)

  B. O(log n)

  C. O(n)

  D. O(n log n)

  <!-- answer:6.3c choice: C -->

  **d)** Reading the middle item of a Python list

  A. O(1)

  B. O(log n)

  C. O(n)

  D. O(n log n)

  <!-- answer:6.3d choice: A -->

  **e)** `a.append(x)` on a Python list, averaged over many appends

  A. O(1)

  B. O(log n)

  C. O(n)

  D. O(n log n)

  <!-- answer:6.3e choice: A -->

  <details>
  <summary>Answer</summary>

  - **a)** **C.** The new tail is the node before the old one, and finding it means walking from the head. A assumes the tail pointer is enough.
  - **b)** **A.** The tail's `prev` leads straight to the new tail.
  - **c)** **C.** A linked list follows pointers one node at a time.
  - **d)** **A.** An array computes the item's address. C treats it as a walk.
  - **e)** **A.** Resizes are rare, so their copying averages out to O(1) per append. C is the cost of the one append that resizes.

  </details>

- **6.4** Which steps correctly insert the node `new` after the node `cur` in a singly linked list?

  A. `new.next = cur.next`, then `cur.next = new`

  B. `cur.next = new`, then `new.next = cur.next`

  C. `cur.next = new`, then `new.next = None`

  D. Either order of A's two lines works

  <!-- answer:6.4 choice: A -->

  <details>
  <summary>Answer</summary>

  **A.** In B, `cur.next` is overwritten first, so `new.next = cur.next` points `new` at itself and the rest of the list is lost. C cuts the list off after `new`.

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

  **a)** What do the three Pops return, in order?

  A. `6, 1, 8`

  B. `1, 3, 8`

  C. `1, 8, 3`

  D. `3, 8, 1`

  <!-- answer:6.5a choice: B -->

  **b)** What does Peek return?

  A. 1

  B. 3

  C. 6

  D. 8

  <!-- answer:6.5b choice: C -->

  <details>
  <summary>Answer</summary>

  - **a)** **B.** After pushing 6 and 1, Pop returns 1. Pushing 8 and 3 gives `6 8 3`; the Pops return 3, then 8. A treats it as a queue. D does all the pushes before any pops.
  - **b)** **C.** Only 6 is left. D is the last value popped, which is gone.

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

  A. `5 2`

  B. `4 5`

  C. `2 4`

  D. `2 9`

  <!-- answer:6.6 choice: D -->

  <details>
  <summary>Answer</summary>

  - **D.** The first `popleft()` removes 5, the oldest. The queue is `2 9 4`. `popleft()` returns 2, and the front is then 9.
  - C reads `q[0]` as the back; `q[0]` is the front.

  </details>

- **6.7** Each pair adds with the first call and removes with the second, on a `deque`. Which two pairs make it behave as a stack?

  A. Only `append` / `pop`

  B. `append` / `popleft` and `appendleft` / `pop`

  C. `append` / `pop` and `appendleft` / `popleft`

  D. `append` / `pop` and `append` / `popleft`

  <!-- answer:6.7 choice: C -->

  <details>
  <summary>Answer</summary>

  - **C.** Adding and removing at the same end gives the newest item back: a stack.
  - B is the two queue pairs: adding at one end and removing at the other gives the oldest back. A misses that the left end works the same way.

  </details>

- **6.8** Doubly linked and circular lists.

  **a)** How many pointers change when you insert a node between two others in a doubly linked list?

  A. 4

  B. 2

  C. 3

  D. 6

  <!-- answer:6.8a choice: A -->

  **b)** A loop walks a circular singly linked list from `head`. When does it stop?

  A. When `cur.next` is `None`

  B. When it gets back to `head`

  C. Never

  D. When `cur` is `None`

  <!-- answer:6.8b choice: B -->

  <details>
  <summary>Answer</summary>

  - **a)** **A.** The new node's `next` and `prev`, the node before's `next`, and the node after's `prev`. B is the singly linked count.
  - **b)** **B.** No `next` is ever `None`, so A and D would loop forever.

  </details>
