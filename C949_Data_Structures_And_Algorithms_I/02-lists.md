# 2. Lists

A **list** is an ADT for items kept in order. (An ADT, or abstract data type, is defined by the operations it supports. How the data is stored is left open.) A list's operations are append (add at the end), prepend (add at the front), insert after an item, remove, search, and traverse (visit every item in order). This chapter builds a list two ways, with linked nodes and with an array. The two ways have very different costs.

## Singly-linked lists

A singly-linked list is a chain of **nodes**. Each node holds one item (its data) and a pointer to the next node. The list keeps a `head` pointer to the first node and a `tail` pointer to the last. The last node's next pointer is null.

<!-- figure
list: 3 8 5 2
-->
```
head                    tail
 ↓                       ↓
[3] → [8] → [5] → [2] → null
```
<!-- /figure -->

The nodes aren't stored side by side in memory, so you can't jump straight to item i. Every operation starts from `head` (or `tail`) and follows pointers.

### Append and prepend

**Append** (add at the end):

- Empty list: point both `head` and `tail` at the new node.
- Otherwise: set `tail.next` to the new node, then move `tail` to it.

**Prepend** (add at the front):

- Empty list: point both `head` and `tail` at the new node.
- Otherwise: set the new node's `next` to `head`, then move `head` to it.

Both are O(1): they take a few pointer changes, however long the list is. Without a `tail` pointer, append is O(n), because you have to walk the whole list to find the end. Check which kind of list a question describes. Some materials assume a list with only a `head`.

**Insert at position i** (rather than after a node you already have) is O(n): walk i nodes from the head first, then insert.

### Insert after

**InsertAfter(curNode, newNode)** puts a new node right after a node you already have:

1. Set `newNode.next` to `curNode.next`.
2. Set `curNode.next` to `newNode`.
3. If `curNode` was the tail, move `tail` to `newNode`.

The order of steps 1 and 2 matters. If you do step 2 first, you lose the rest of the list. When you already have `curNode`, InsertAfter is O(1). Finding `curNode` first (by searching for a value) is O(n).

### Search

**Search** starts at `head` and follows `next` pointers until it finds the item or reaches null.

- Best case: the item is the head. O(1).
- Average and worst case: O(n). The worst case is an item at the end, or one that isn't there.

### Remove

In a singly-linked list, each node points only forward. To remove a node, you change the node **before** it. zyBooks writes this as **RemoveAfter(curNode)**: remove the node after `curNode` (or the head, when `curNode` is null).

- Removing the head: move `head` to `head.next`. If the list is now empty, set `tail` to null too.
- Removing the node after `curNode`: set `curNode.next` to the node after that. If the removed node was the tail, move `tail` to `curNode`.

If you have the node before it, removal is O(1). Removing the **last** node is still O(n), even with a `tail` pointer. The new tail is the node before the old one, and the only way to find that node is to walk from the head.

<div class="viz" data-viz="linked-list" markdown>

*On the site, an interactive diagram here steps through prepend, append, insert after, remove last, and search on a singly-linked list.*

</div>

## Doubly-linked lists

A **doubly-linked list** gives each node two pointers: `next` and `prev`. The head's `prev` and the tail's `next` are null.

<!-- figure
list: 3 8 5 2
double: yes
-->
```
null ← [3] ⇄ [8] ⇄ [5] ⇄ [2] → null
```
<!-- /figure -->

The extra pointer costs memory, and every insert or remove has to update pointers in both directions. In return, you get two things:

- **Remove(curNode)** is O(1) for any node you have, including the tail, because the node knows its own predecessor (the node before it). Set `pred.next = succ` and `succ.prev = pred`, where `pred` and `succ` are the nodes before and after `curNode`. If `curNode` was the head or tail, move `head` or `tail` instead.
- You can traverse backward, from `tail` along the `prev` pointers.

**InsertAfter(curNode, newNode)** sets four pointers: `newNode.next = succ`, `newNode.prev = curNode`, `curNode.next = newNode`, and `succ.prev = newNode`.

## Circular lists

In a **circular** linked list, the tail's `next` points back to the head instead of null (and in a doubly-linked circular list, the head's `prev` points to the tail). The list has no end, so a traversal starts at the head and stops when it gets back to the head. Circular lists fit things that repeat in turns, like players in a game or a round-robin task scheduler.

> [!TIP]
> To watch pointers change, paste a small `Node` class and a few appends into [Python Tutor](https://pythontutor.com/visualize.html). It draws each node as a box and each `next` pointer as an arrow, and steps through one line at a time. It's free, with no account needed. The [Practice in code](code/README.md#run-python-online) page lists other free sites.

## Traversal

**Traversal** visits every node once: start at `head`, process the node, move to `next`, and stop at null. It's O(n). A doubly-linked list can also be traversed in **reverse**, from `tail` along `prev`.

## Sorting linked lists

**Insertion sort** works on a linked list without moving any data. It unlinks each node and relinks it in its correct place in the sorted part.

- **Doubly-linked:** like the array version, each node is compared backward from its old position. Best case O(n) when the list is already sorted; average and worst O(n²).
- **Singly-linked:** you can't walk backward, so each node's place is found by searching forward from the head. That flips the best and worst cases. An **already sorted** list is a worst case, O(n²), because every node walks the whole sorted part. A list in **descending** order is the best case, O(n), because every node goes to the front.

Algorithms that jump straight to positions by index, like quicksort and shell sort, are a poor fit for linked lists. **Merge sort** works well on them.

## Dummy nodes

A **dummy node** (also called a sentinel) is a node with no real data that always sits at the front of the list, even when the list is "empty". The real items start at `dummy.next`.

With a dummy node, `head` never changes and is never null. Append, prepend, and remove then need no special cases for an empty list or for removing the first item, because every real node has a node before it. A doubly-linked list can use a dummy at each end.

## Recursion on linked lists

A linked list has a recursive shape: a list is either empty, or a node followed by a smaller list. That means you can write list algorithms recursively:

- **Search:** if the node is null, the item isn't there. If the node holds the item, return it. Otherwise, search starting from `node.next`.
- **Print in reverse:** print the rest of the list (recursively), then print this node. The calls go all the way to the end before anything prints.

Each call handles one node, so both take O(n) time. They also use O(n) stack space for the calls.

## Array-based lists

An **array-based list** keeps its items in an array, from index 0 up, plus a count of how many there are. The array is usually bigger than the count, so there's room to grow.

| Operation | How | Cost |
|---|---|---|
| Read or write item i | Go straight to index i | O(1) |
| Append | Put the item at index `length`, add 1 to the length | O(1), unless the array is full |
| Append to a full array | Allocate a bigger array (usually double the size), copy every item over, then append | O(n) for that one append |
| Prepend | Shift every item one place right, then put the new item at index 0 | O(n) |
| Insert at index i | Shift items i and up one place right | O(n) |
| Remove at index i | Shift every item after i one place left | O(n); removing the last item is O(1) |
| Search | Check items in order | O(n) |

### Sequential and linked allocation

Arrays and linked lists show the two ways to lay out a list in memory:

- **Sequential allocation** (arrays): items sit next to each other in one block. Any item's address is the block's start plus i times the item size, so reading item i is O(1). But the block has a fixed size, and inserting in the middle means shifting.
- **Linked allocation** (linked lists): each node is allocated on its own, anywhere in memory, and holds a pointer to the next. The list grows one node at a time with no copying, and inserts need no shifting, but finding item i means following i pointers.

Doubling the array when it's full makes resizes rare. After a resize to size 2n, the next n appends cost O(1) each. Averaged over all appends, each one costs O(1). That average is called **amortized** O(1), and it's how Python's `list.append` works.

<div class="viz" data-viz="allocation" markdown>

*On the site, a drawing here compares an array's single block of memory with a linked list's scattered nodes.*

</div>

## Big-O summary

| Operation | Singly-linked (with tail) | Doubly-linked | Array-based |
|---|---|---|---|
| Read item i | O(n) | O(n) | O(1) |
| Append | O(1) | O(1) | O(1) amortized, O(n) when it resizes |
| Prepend | O(1) | O(1) | O(n) |
| Insert after a node or index you have | O(1) | O(1) | O(n) |
| Remove the first item | O(1) | O(1) | O(n) |
| Remove the last item | O(n) | O(1) | O(1) |
| Remove a given node | O(n) | O(1) | O(n) |
| Search | O(1) best, O(n) average and worst | same | same |

## Questions

- **2.1** Tracing a singly-linked list. A list holds `3 → 8 → 5`, with `head` at 3 and `tail` at 5. These run in order:

  1. Prepend 1
  2. Append 9
  3. RemoveAfter(the node holding 8)
  4. InsertAfter(the node holding 3, a new node holding 4)

  **a)** What does the list hold now, from head to tail? Write the values separated by commas.

  <!-- answer:2.1a blanks: 1, 3, 4, 8, 9 | 1,3,4,8,9 -->

  **b)** Which values are at the head and the tail?

  <!-- answer:2.1b blanks: Head => 1; Tail => 9 -->

  <details>
  <summary>Answer</summary>

  - After step 1: `1 → 3 → 8 → 5`. After step 2: `1 → 3 → 8 → 5 → 9`.
  - Step 3 removes the node **after** 8, which is 5: `1 → 3 → 8 → 9`.
  - Step 4: `1 → 3 → 4 → 8 → 9`.
  - **b)** Head 1, tail 9. Neither the removal nor the insert changed the ends.

  </details>

- **2.2** Pick the Big-O of each operation on a **singly-linked list with head and tail pointers**, holding n items.

  | Operation | Big-O |
  |---|---|
  | Append | |
  | Prepend | |
  | Remove the last item | |
  | Search for a value (worst case) | |
  | Insert after a node you already have | |
  | Remove the first item | |

  <!-- answer:2.2a-f table [O(1), O(log n), O(n)]: O(1); O(1); O(n); O(n); O(1); O(1) -->

  <details>
  <summary>Answer</summary>

  - Append, prepend, insert after, and remove first are all O(1). Each takes a fixed number of pointer changes.
  - Removing the last item is O(n): the new tail is the node before it, and finding that node means walking from the head.
  - Searching is O(n) in the worst case, when the value is last or missing.

  </details>

- **2.3** Doubly-linked lists.

  **a)** To remove node `cur` from the middle of a doubly-linked list, with `pred` before it and `succ` after it, which two pointers change?

  A. `pred.next = succ` and `succ.prev = pred`

  B. `cur.next = null` and `cur.prev = null`

  C. `pred.prev = succ` and `succ.next = pred`

  <!-- answer:2.3a choice: A -->

  **b)** What is the Big-O of removing the tail of a doubly-linked list?

  <!-- answer:2.3b blanks: O(1) -->

  **c)** What does a doubly-linked list cost compared with a singly-linked one?

  A. Searching becomes O(log n).

  B. One more pointer per node, and more pointers to update on insert and remove.

  C. Append becomes O(n).

  <!-- answer:2.3c choice: B -->

  <details>
  <summary>Answer</summary>

  - **a)** **A.** Linking the two neighbors to each other skips over `cur`. Clearing `cur`'s own pointers is optional cleanup.
  - **b)** O(1). The tail's `prev` node becomes the new tail.
  - **c)** **B.**

  </details>

- **2.4** Array-based lists. An array-based list has an array of size 4, and it holds 4 items. It doubles the array when it's full.

  **a)** You append a fifth item. How many items are copied into the new array before the append?

  <!-- answer:2.4a blanks: 4 -->

  **b)** What is the new array's size?

  <!-- answer:2.4b blanks: 8 -->

  **c)** Pick the Big-O of each operation on an array-based list of n items.

  | Operation | Big-O |
  |---|---|
  | Read item i | |
  | Prepend | |
  | Append, averaged over many appends | |
  | Append, when the array is full | |
  | Remove the last item | |

  <!-- answer:2.4c-g table [O(1), O(log n), O(n)]: O(1); O(n); O(1); O(n); O(1) -->

  <details>
  <summary>Answer</summary>

  - **a)** 4. Every existing item moves to the new array.
  - **b)** 8.
  - **c)** Read is O(1) (direct index). Prepend is O(n) (every item shifts right). Append is O(1) amortized, because resizes are rare, but the append that triggers a resize is O(n). Removing the last item shifts nothing, so it's O(1).

  </details>

- **2.5** Circular lists and dummy nodes.

  **a)** In a circular singly-linked list, where does the tail's `next` point?

  A. Null

  B. The head

  C. The tail itself

  <!-- answer:2.5a choice: B -->

  **b)** Why put a dummy node at the front of a linked list?

  A. It makes search O(1).

  B. The head is never null, so insert and remove need no special cases for an empty list or the first item.

  C. It stores the list's length.

  <!-- answer:2.5b choice: B -->

  <details>
  <summary>Answer</summary>

  - **a)** **B.** A traversal stops when it gets back to the head, not at null.
  - **b)** **B.** Every real node then has a node before it, so the same code handles every position.

  </details>

- **2.6** Sorting linked lists.

  **a)** Insertion sort on a **singly**-linked list finds each node's place by searching from the head. Which input is its best case, O(n)?

  A. Already sorted in ascending order

  B. Sorted in descending order

  C. Random order

  <!-- answer:2.6a choice: B -->

  **b)** What is insertion sort's worst case on a linked list?

  <!-- answer:2.6b blanks: O(n^2) | O(n²) | O(n*n) -->

  <details>
  <summary>Answer</summary>

  - **a)** **B.** Each node in a descending list is smaller than everything sorted so far, so its place is found at the head in one step. An already-sorted list is the slow case here, because each node walks the whole sorted part.
  - **b)** O(n²).

  </details>

- **2.7** Allocation and missing tail pointers.

  **a)** A singly-linked list keeps only a `head` pointer, no `tail`. What is the Big-O of appending an item?

  <!-- answer:2.7a blanks: O(n) -->

  **b)** Which kind of allocation does each describe?

  | Description | Allocation |
  |---|---|
  | Item i's address is computed from the start address and i | |
  | Each item is stored on its own, with a pointer to the next | |
  | Growing past the reserved space means copying everything to a new block | |

  <!-- answer:2.7b-d table [Sequential, Linked]: Sequential; Linked; Sequential -->

  <details>
  <summary>Answer</summary>

  - **a)** O(n). Without `tail`, the only way to find the last node is to walk from the head.
  - **b)** Computed addresses and copying to a bigger block are sequential allocation (arrays). Separately stored nodes with pointers are linked allocation.

  </details>
