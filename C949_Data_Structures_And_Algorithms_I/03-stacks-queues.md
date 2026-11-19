# 3. Stacks and queues

Stacks and queues are lists that let you add and remove items only at the ends. Limiting them this way makes each operation O(1), and you always know the order the items will come out in.

## The stack ADT

A **stack** is **last in, first out** (LIFO). The item you remove is always the one added most recently, like the top plate on a stack of plates. Push 1, then 2, then 3, and the first Pop gives back 3, the next gives 2, and the last gives 1.

| Operation | What it does |
|---|---|
| Push(x) | Put x on top |
| Pop() | Remove and return the top item |
| Peek() | Return the top item without removing it |
| IsEmpty() | True if there are no items |
| GetLength() | The number of items |

Popping or peeking an empty stack is an error. Stacks show up wherever the most recent item has to be handled first. Examples include undo in an editor, the Back button in a browser, matching parentheses, evaluating postfix expressions, and the call stack that tracks function calls (which is how recursion works).

### Stacks built on linked lists

Use the list's **head** as the top of the stack. Push and pop both happen at the top, so the top must be an end where removing is cheap. In a singly-linked list, removing the head is O(1). Removing the tail is O(n), because you have to walk from the head to find the node before the tail.

- Push: prepend the new node. O(1).
- Pop: remove the head node and return its data. O(1).
- Peek: return the head's data. O(1).

### Stacks built on arrays

Use the **end** of the array as the top, and keep a count of items in `length`. Adding or removing the last item of an array never moves the other items, which is why the top goes there.

- Push: store the item at index `length`, and add 1 to `length`.
- Pop: subtract 1 from `length`, and return the item at that index.

For example, with `A B C` stored and `length` 3, a push of D stores it at index 3 and makes `length` 4. A pop then sets `length` back to 3 and returns the item at index 3, which is D.

Both are O(1). When the array is full, what happens depends on the kind of stack:

- A **bounded** stack has a fixed maximum length, so the push fails.
- Any other stack resizes the array: it allocates a bigger one and copies every item over. That one push is O(n). Resizes are rare, so pushes are still O(1) amortized (averaged over many pushes).

## The queue ADT

A **queue** is **first in, first out** (FIFO). Items leave in the order they arrived, like people in a line at a store. Enqueue 1, then 2, then 3, and the first Dequeue gives back 1, then 2, then 3.

| Operation | What it does |
|---|---|
| Enqueue(x) | Add x at the back |
| Dequeue() | Remove and return the item at the front |
| Peek() | Return the front item without removing it |
| IsEmpty(), GetLength() | As for a stack |

Queues hold work that is waiting its turn, such as print jobs, requests to a server, and the vertices waiting to be visited in a breadth-first search.

### Queues built on linked lists

A queue works at both ends: items go in at one end and come out at the other. Enqueue at the **tail** and dequeue at the **head**:

- Enqueue: append. O(1) with a tail pointer.
- Dequeue: remove the head. O(1).

Adding at either end of a singly-linked list with a tail pointer is O(1), but only the head can be removed in O(1). So the removing end, the front of the queue, goes at the head. If you swapped the ends, dequeue would have to remove the tail, which is O(n) in a singly-linked list.

### Queues built on arrays

Dequeuing from index 0 of an array would shift every other item left, which is O(n). Instead, an array-based queue leaves the items where they are and moves the front. It keeps a **front index** and a **length**. When the back reaches the end of the array, new items wrap around and fill the free slots at the start. This layout is called a **circular array** (or ring buffer).

- The front item is at `front`.
- Enqueue puts the new item at `(front + length) % size`, then adds 1 to `length`.
- Dequeue takes the item at `front`, sets `front` to `(front + 1) % size`, and subtracts 1 from `length`.

The `%` (remainder) operator makes the index wrap back to 0: an index one past the last slot has remainder 0 when divided by the size. For example, with an array of size 5:

| Step | front | length | Array (index 0 to 4) |
|---|---|---|---|
| Start | 3 | 2 | `_ _ _ A B` |
| Enqueue C: goes to (3 + 2) % 5 = 0 | 3 | 3 | `C _ _ A B` |
| Dequeue: takes A, front becomes 4 | 4 | 2 | `C _ _ _ B` |

Every operation is O(1), and nothing ever shifts. When `length` reaches the array's size, the queue is full. A bounded queue refuses the new item. An unbounded queue allocates a bigger array and copies the items over in queue order, starting from `front`.

<div class="viz" data-viz="stack-queue" markdown>

*On the site, an interactive diagram here pushes and pops a stack, and enqueues and dequeues a queue stored in a circular array.*

</div>

## The deque ADT

A **deque** (double-ended queue, pronounced "deck") lets you add and remove at **both** ends. Its operations are PushFront, PushBack, PopFront, PopBack, PeekFront, and PeekBack. A deque can act as either a stack or a queue. If you build it on a doubly-linked list or a circular array, all of these operations are O(1).

A typical use is checking whether a word is a palindrome (the same forwards and backwards):

1. Put the word's letters in a deque.
2. PopFront one letter and PopBack one letter, and compare them.
3. If they differ, the word isn't a palindrome. If they match, repeat step 2 until one letter or none is left.

For "level", the pairs are l and l, then e and e, and the middle v is left over, so it's a palindrome.

## Stacks and queues in Python

- A Python `list` makes a good **stack**: `append(x)` pushes, `pop()` pops from the end, and `items[-1]` peeks. All three are O(1) (append is amortized).
- A Python `list` makes a poor **queue**: `pop(0)` removes the first item and shifts all the others left, which is O(n).
- For a queue or a deque, use `collections.deque`: `append`, `appendleft`, `pop`, and `popleft` are all O(1).
- The `queue` module's `Queue` class is a FIFO queue built for passing work safely between threads. `put(x)` enqueues and `get()` dequeues.

## Big-O summary

| Operation | Linked-list version | Array version |
|---|---|---|
| Stack push | O(1) | O(1) amortized, O(n) when it resizes |
| Stack pop, peek | O(1) | O(1) |
| Queue enqueue | O(1) | O(1) amortized (circular array), O(n) when it resizes |
| Queue dequeue, peek | O(1) | O(1) (circular array) |
| Deque, at either end | O(1) (doubly-linked) | O(1) (circular array) |
| Search for a value | O(n) | O(n) |

## Questions

- **3.1** Tracing a stack. Starting with an empty stack:

  ```
  Push(4)
  Push(7)
  Pop()
  Push(2)
  Push(9)
  Pop()
  Peek()
  ```

  **a)** What do the two Pops return, in order? Write them separated by a comma.

  <!-- answer:3.1a blanks: 7, 9 | 7,9 -->

  **b)** What does Peek return?

  <!-- answer:3.1b blanks: 2 -->

  <details>
  <summary>Answer</summary>

  - After Push 4 and Push 7, the top is 7, so the first Pop returns **7**. The stack is now `4`.
  - Push 2 and Push 9 make it `4 2 9`, with 9 on top. The second Pop returns **9**.
  - **b)** The top is now **2**.

  </details>

- **3.2** Tracing a queue. Starting with an empty queue:

  ```
  Enqueue(4)
  Enqueue(7)
  Dequeue()
  Enqueue(2)
  Enqueue(9)
  Dequeue()
  Peek()
  ```

  **a)** What do the two Dequeues return, in order?

  <!-- answer:3.2a blanks: 4, 7 | 4,7 -->

  **b)** What does Peek return?

  <!-- answer:3.2b blanks: 2 -->

  <details>
  <summary>Answer</summary>

  - The first Dequeue returns **4**, the first item in. The queue is now `7`.
  - After the Enqueues it's `7 2 9`, so the second Dequeue returns **7**.
  - **b)** The front is now **2**.

  </details>

- **3.3** A circular-array queue. The array has size 6. `front` is 4, and `length` is 2, so the items are at indexes 4 and 5.

  **a)** Enqueue puts the next item at what index?

  <!-- answer:3.3a blanks: 0 -->

  **b)** After that enqueue, a Dequeue runs. What is `front` afterward?

  <!-- answer:3.3b blanks: 5 -->

  **c)** What is `length` afterward?

  <!-- answer:3.3c blanks: 2 -->

  <details>
  <summary>Answer</summary>

  - **a)** (4 + 2) % 6 = 0. The item wraps around to the start.
  - **b)** Dequeue takes the item at index 4, and `front` becomes (4 + 1) % 6 = 5.
  - **c)** 2 + 1 − 1 = 2.

  </details>

- **3.4** Pick the ADT that fits each job best.

  | Job | ADT |
  |---|---|
  | An editor's Undo command | |
  | Print jobs, printed in the order they were sent | |
  | Checking that every `(` has a matching `)` | |
  | Checking a word is a palindrome by comparing letters from both ends | |
  | The vertices waiting to be visited in a breadth-first search | |

  <!-- answer:3.4a-e table [Stack, Queue, Deque]: Stack; Queue; Stack; Deque; Queue -->

  <details>
  <summary>Answer</summary>

  - Undo and parentheses matching need the most recent item first, so they use a **stack**.
  - Print jobs and BFS handle items in arrival order, so they use a **queue**.
  - The palindrome check removes from both ends, so it uses a **deque**.

  </details>

- **3.5** Pick the Big-O of each operation, with n items stored.

  | Operation | Big-O |
  |---|---|
  | Push on a stack built on a linked list | |
  | Dequeue from a queue built on a linked list (head is the front) | |
  | Dequeue from a circular-array queue | |
  | Python `list.pop(0)` | |
  | Python `collections.deque.popleft()` | |
  | Push on an array-based stack whose array is full and must resize | |

  <!-- answer:3.5a-f table [O(1), O(log n), O(n)]: O(1); O(1); O(1); O(n); O(1); O(n) -->

  <details>
  <summary>Answer</summary>

  - Linked-list push and dequeue change a few pointers at the head, so they're O(1).
  - The circular array only moves its `front` index, so dequeue is O(1).
  - `list.pop(0)` shifts every remaining item left, so it's O(n). That's why you should use `deque.popleft()`, which is O(1), for a queue.
  - A push that has to resize copies all n items, so it's O(n). Averaged over many pushes, push is still O(1).

  </details>

- **3.6** A stack is built on a singly-linked list with head and tail pointers. Why does it push and pop at the head?

  A. Both ends would be O(1), so it doesn't matter.

  B. Removing the head is O(1), but removing the tail is O(n), since the node before the tail has to be found.

  C. The head is the only place a new node can go.

  <!-- answer:3.6 choice: B -->

  <details>
  <summary>Answer</summary>

  **B.** Pushing at either end is O(1). Pop must remove from the same end as push, though, and only the head can be removed in O(1).

  </details>
