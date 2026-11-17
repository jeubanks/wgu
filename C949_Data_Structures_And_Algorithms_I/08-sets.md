# 8. Sets

A **set** holds distinct items with no particular order, and answers one question fast: is this item in it? Duplicates are ignored, and the classic set operations (union, intersection, difference) combine two sets into a new one.

## The set ADT

| Operation | What it does |
|---|---|
| Add(x) | Put x in the set. If it's already there, nothing changes. |
| Remove(x) | Take x out. |
| Contains(x) | True if x is in the set. |
| Size | How many items it holds. |

Compared with the other ADTs:

- A **list** keeps order and allows duplicates.
- A **bag** allows duplicates and counts them.
- A **map** pairs each key with a value; a set is like a map's keys alone.

## Set operations

<div class="viz" data-viz="set-ops" markdown>

*On the site, a drawing here shows union, intersection, and difference as shaded overlapping circles.*

</div>

With A = {1, 2, 3, 4, 5} and B = {4, 5, 6, 7}:

| Operation | Contains | Example | Python |
|---|---|---|---|
| **Union** A ∪ B | everything in A, B, or both | {1, 2, 3, 4, 5, 6, 7} | <code>A &#124; B</code> or `A.union(B)` |
| **Intersection** A ∩ B | only what's in both | {4, 5} | `A & B` or `A.intersection(B)` |
| **Difference** A − B | what's in A but not in B | {1, 2, 3} | `A - B` or `A.difference(B)` |
| **Symmetric difference** | what's in exactly one of them | {1, 2, 3, 6, 7} | `A ^ B` |
| **Subset** | is every item of one in the other? | {4, 5} ⊆ B is true | `{4, 5} <= B` or `.issubset(B)` |

Order matters for difference: A − B is {1, 2, 3}, but B − A is {6, 7}.

Two more operations build a new set from one set:

- **Filter** keeps the items that pass a test: the even items of A are {2, 4}. In Python, `{x for x in A if x % 2 == 0}`.
- **Map** applies a function to every item: multiplying A's items by 10 gives {10, 20, 30, 40, 50}. In Python, `{x * 10 for x in A}`. Mapping can make the result smaller, when two items map to the same value.

## Building a set

### On a hash table

Store each item as a key in a hash table ([chapter 4](04-hash-tables.md)). Add, remove, and contains are each O(1) on average. Union and intersection loop over the items, checking membership in the other set:

- Union of sets of sizes n and m: O(n + m).
- Intersection: loop over the smaller set and check each item in the larger: O(min(n, m)).
- Difference A − B: loop over A: O(n).

The items come out in no useful order. Python's `set` works this way.

### On a binary search tree

Store the items as keys in a balanced BST ([chapter 6](06-balanced-trees.md)). Add, remove, and contains are each O(log n), slower than hashing, but an inorder traversal gives the items in **sorted order**, and "the smallest item bigger than x" is a quick question. Use this when the order matters.

## Python's set

```python
s = {3, 1, 4}
s.add(1)          # already there: no change
s.add(5)          # {1, 3, 4, 5}
s.remove(9)       # KeyError: 9 isn't in the set
s.discard(9)      # no error: discard ignores missing items
x = s.pop()       # removes and returns some item (no guarantee which)
4 in s            # True, in O(1) on average
empty = set()     # {} would make an empty dict, not a set
```

- Items must be hashable (immutable): numbers, strings, and tuples work; lists don't.
- `set(some_list)` removes duplicates from a list in O(n).
- A `frozenset` is a set that can't change, so it can itself be a dict key or a set item.

## Big-O summary

| Operation | Hash-table set | Balanced-BST set |
|---|---|---|
| Add, remove, contains | O(1) average, O(n) worst | O(log n) |
| Union (sizes n and m) | O(n + m) | O(n + m) |
| Intersection | O(min(n, m)) | O(n + m), walking both in order |
| Difference A − B | O(n) | O(n + m) |
| List the items in sorted order | O(n log n): sort them first | O(n): inorder traversal |

## Questions

- **8.1** Set operations. A = {1, 2, 3, 4, 5} and B = {4, 5, 6, 7}. List each result in increasing order, separated by commas.

  | Operation | Result |
  |---|---|
  | A ∪ B | |
  | A ∩ B | |
  | A − B | |
  | B − A | |
  | Symmetric difference of A and B | |

  <!-- answer:8.1a-e table: 1, 2, 3, 4, 5, 6, 7 | 1,2,3,4,5,6,7; 4, 5 | 4,5; 1, 2, 3 | 1,2,3; 6, 7 | 6,7; 1, 2, 3, 6, 7 | 1,2,3,6,7 -->

  <details>
  <summary>Answer</summary>

  - Union: everything, **1, 2, 3, 4, 5, 6, 7**. Intersection: what both share, **4, 5**.
  - A − B: A without 4 and 5, **1, 2, 3**. B − A: B without 4 and 5, **6, 7**.
  - Symmetric difference: everything except the shared 4 and 5, **1, 2, 3, 6, 7**.

  </details>

- **8.2** Filter and map on A = {1, 2, 3, 4, 5}.

  **a)** Filter A to keep the odd numbers. What's the result, in increasing order?

  <!-- answer:8.2a blanks: 1, 3, 5 | 1,3,5 -->

  **b)** Map every item x of {−2, −1, 1, 2} to x². How many items does the result have?

  <!-- answer:8.2b blanks: 2 -->

  <details>
  <summary>Answer</summary>

  - **a)** **1, 3, 5**.
  - **b)** −2 and 2 both map to 4, and −1 and 1 both map to 1. A set keeps each value once: {1, 4}, **2** items.

  </details>

- **8.3** Python's set.

  **a)** `s = {1, 2, 3}`. Which call raises an error?

  A. `s.discard(7)`

  B. `s.remove(7)`

  C. `s.add(2)`

  <!-- answer:8.3a choice: B -->

  **b)** What does `len(set([4, 4, 2, 9, 2, 4]))` return?

  <!-- answer:8.3b blanks: 3 -->

  **c)** Which line makes an empty set?

  A. `s = {}`

  B. `s = set()`

  C. `s = []`

  <!-- answer:8.3c choice: B -->

  <details>
  <summary>Answer</summary>

  - **a)** **B.** `remove` raises `KeyError` for a missing item; `discard` doesn't; adding an existing item changes nothing.
  - **b)** The distinct values are 4, 2, and 9: **3**.
  - **c)** **B.** `{}` is an empty dict, and `[]` an empty list.

  </details>

- **8.4** Choosing how to build a set.

  | Operation | Hash-table set | Balanced-BST set |
  |---|---|---|
  | Contains, average | | |
  | Add, average | | |
  | List all items in sorted order | | |

  <!-- answer:8.4a-f table [O(1), O(log n), O(n), O(n log n)] [O(1), O(log n), O(n), O(n log n)]: O(1); O(log n); O(1); O(log n); O(n log n); O(n) -->

  <details>
  <summary>Answer</summary>

  - Hashing makes contains and add O(1) on average; a balanced BST walks one path, O(log n).
  - A hash table keeps no order, so its items must be sorted first: O(n log n). A BST's inorder traversal is already sorted: O(n).

  </details>
