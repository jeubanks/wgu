# 8. Sets

A **set** holds distinct items with no particular order, and answers one question fast: is this item in it? Duplicates are ignored, and the classic set operations (union, intersection, difference) combine two sets into a new one.

## The set ADT

A set ADT holds **distinct** elements: no element is ever in it twice. Adding an element that's already there does nothing, however many times you try.

- A set is **unordered**. Two sets with the same elements are **equal sets**, whatever order the elements were added in: {8, 3, 12} equals {12, 8, 3}.
- A set's **length** is the number of elements in it. zyBooks also calls it the set's **cardinality**.
- If a set doesn't contain some element, then either it was never added, or a remove came after the last add.

The common operations, with zyBooks' names:

| Operation | What it does |
|---|---|
| add(x) | Put x in the set. If it's already there, nothing changes. |
| remove(x) | Take x out. If it isn't there, nothing changes. |
| contains(x) | True if x is in the set, False otherwise. |
| get_length() | How many elements the set holds. |
| is_subset_of(other) | True if every element of this set is also in other. |
| union(other), intersection(other), difference(other) | Build and return a **new** set. Neither input changes. |
| filter(predicate), map(function) | Build and return a new set from this one. |

The ADT only says what each operation does. Its speed depends on the data structure underneath, and a set can be built on several (a hash table or a BST, below).

Compared with the other ADTs:

- A **list** keeps order and allows duplicates.
- A **bag** allows duplicates and counts them.
- A **map** pairs each key with a value; a set is like a map's keys alone.

## Subsets

S1 is a **subset** of S2 if S2 contains each of S1's elements. One element of S1 missing from S2 is enough to say no.

```text
S2 = {6, 13, 21, 34, 40}

{13, 40}       every element is in S2       → a subset of S2
{6, 21, 50}    50 is not in S2              → not a subset of S2
S2 itself      every element is in S2       → a subset of S2
```

- Every set is a subset of itself, so two equal sets are subsets of each other.
- If S1 is a subset of S2, S1 can't have more elements than S2: its length is ≤ S2's length.
- To check, loop over S1 and look each element up in S2. The loop can stop at the first element that's missing.

## Set operations

<div class="viz" data-viz="set-ops" markdown>

*On the site, a drawing here shows union, intersection, and difference as shaded overlapping circles.*

</div>

With X = {7, 19, 23, 40} and Y = {19, 31, 40, 58}:

| Operation | Contains | Example | Python |
|---|---|---|---|
| **Union** X ∪ Y | everything in X, Y, or both | {7, 19, 23, 31, 40, 58} | <code>X &#124; Y</code> or `X.union(Y)` |
| **Intersection** X ∩ Y | only what's in both | {19, 40} | `X & Y` or `X.intersection(Y)` |
| **Difference** X − Y | what's in X but not in Y | {7, 23} | `X - Y` or `X.difference(Y)` |
| **Symmetric difference** | what's in exactly one of them | {7, 23, 31, 58} | `X ^ Y` |
| **Subset** | is every item of one in the other? | {19, 40} ⊆ Y is true | `{19, 40} <= Y` or `.issubset(Y)` |

zyBooks covers union, intersection, difference, and subset. Symmetric difference is an extra that Python provides.

Union and intersection are **commutative**: X ∪ Y = Y ∪ X, and X ∩ Y = Y ∩ X. Difference is not: X − Y is {7, 23}, but Y − X is {31, 58}.

### How zyBooks builds each result

Each operation starts with a new, empty result set and adds to it. Adding a duplicate does nothing, so the result never repeats an element.

| Operation | Steps |
|---|---|
| X ∪ Y | Add every element of X to the result. Then add every element of Y. |
| X ∩ Y | For each element of X: if it's in Y, add it to the result. |
| X − Y | For each element of X: if it's **not** in Y, add it to the result. |

Union, step by step, for the X and Y above:

```text
result = {}
add X's elements 7, 19, 23, 40     → {7, 19, 23, 40}
add Y's 19                         → already there, no change
add Y's 31                         → {7, 19, 23, 40, 31}
add Y's 40                         → already there, no change
add Y's 58                         → {7, 19, 23, 40, 31, 58}
```

A few rules follow from the definitions, for any sets X and Y:

- X ∪ X = X, and X ∩ X = X. X − X is the empty set.
- If X and Y share no elements, X ∩ Y is empty and X − Y is all of X.

## Filter and map

Both build a new set from one set, by calling a function once on every element.

- **Filter** keeps the elements that pass a test. The test is a **filter predicate**: a function that takes an element and returns True (keep it) or False (leave it out).
- **Map** applies a function F to every element and adds each returned value to the result.

With W = {14, 24, 31, 46, 51}:

```text
filter with "is greater than 30":
  14 → False   24 → False   31 → True   46 → True   51 → True
  result: {31, 46, 51}

map with "ones digit":
  14 → 4   24 → 4   31 → 1   46 → 6   51 → 1
  result: {4, 1, 6}     (4 and 1 come back twice, but a set keeps one copy)
```

In Python, `{x for x in W if x > 30}` filters, and `{x % 10 for x in W}` maps.

What the results can look like, for a set of length N:

- The function is called **exactly N times**, once per element, by both filter and map.
- A filter's result is a subset of the original, with length anywhere from 0 to N.
- A map's result has length from 1 to N when N ≥ 1. It's shorter than N when two elements map to the same value. It's empty only when the original set is empty.

## Building a set

### On a hash table

Store each item as a key in a hash table ([chapter 4](04-hash-tables.md)). Add, remove, and contains are each O(1) on average. Union and intersection loop over the items, checking membership in the other set:

- Union of sets of sizes n and m: O(n + m).
- Intersection X ∩ Y, the zyBooks way (loop over X): O(n). Python's built-in loops over the smaller set instead: O(min(n, m)).
- Difference X − Y: loop over X: O(n).

The items come out in no useful order. Python's `set` works this way.

### On a binary search tree: the zyBooks Set class

zyBooks builds its `Set` class on a binary search tree ([chapter 5](05-trees.md)), one element per node. It points out that real code would reach for a balanced BST ([chapter 6](06-balanced-trees.md)) or a hash table to get better speed, but a plain BST is enough to build every operation.

**The key function.** You can pass the constructor a **get-key function**: given an element, it returns the key the BST sorts by. The BST compares keys with `<`, `>`, and `==`. With no argument, the default is `lambda el: el`, so each element is its own key. A set of student records could pass `lambda s: s.id` to key them by ID. The sets that union, intersection, and the others return use the same get-key function as the set they came from.

**The nodes.** Each `BSTNode` stores its element in `data`, plus `left`, `right`, and **`parent`** references. The parent reference is what lets the class find a successor and iterate without recursion. Each node also has three helpers:

- `count()` returns the number of nodes in its subtree, recursively.
- `get_successor()` returns the node that comes next in sorted order (rules below).
- `replace_child(current, new)` swaps one of its children for another node and fixes that node's parent reference.

The examples below use this tree, built by adding 30, 15, 45, 10, 20, 40, 50, 25 in that order:

```text
          30
        /    \
      15      45
     /  \    /  \
   10   20  40   50
          \
          25
```

#### add

Search for the new element's key first. If it's found, return **False** and change nothing: that's how the set stays distinct. Otherwise insert a new leaf the usual BST way (smaller keys go left, others go right) and return **True**.

Adding 20 again to the tree above returns False, and the length stays 8.

#### Successor

`get_successor()` has two cases:

| The node has | Its successor is |
|---|---|
| A right child | The leftmost node of its right subtree: go right once, then left as far as possible. |
| No right child | Up the tree. Climb while the current node is its parent's **right** child. The first time you climb from a **left** child, that parent is the successor. If you reach the root without doing that, there's no successor: the node holds the largest key. |

Successor of 25, which has no right child:

```text
25 is 20's right child   → climb to 20
20 is 15's right child   → climb to 15
15 is 30's left child    → stop: the successor is 30
```

Successor of 20: it has a right child, so go right to 25, then left as far as possible. 25 has no left child, so the successor is 25.

#### Iterating

`__iter__()` finds the minimum node (start at the root, go left until there's no left child) and returns a `BSTIterator` holding it. Each call to the iterator's `__next__()` (`next()` in Python before version 3) returns the current node's element, then moves to that node's successor. When the successor is `None`, iteration stops.

The iterator only keeps one node reference at a time. It visits the elements in **ascending order of their keys**:

```text
start at 10 → 15 → 20 → 25 → 30 → 40 → 45 → 50 → None: stop
```

#### remove

`remove(key)` searches for the node, then removes it. A missing key does nothing. The node falls into one of four cases, checked in this order:

| Case | The node is | What happens |
|---|---|---|
| 1 | An internal node with **two children** | Find its successor and save the successor's data. Remove the successor node (recursively, with these same cases). Then copy the saved data into this node. |
| 2 | The **root**, with 0 or 1 child | The child (or `None`) becomes the new root, and its parent reference is cleared. |
| 3 | A non-root node with a **left child only** | Its parent's `replace_child` swaps it for that left child. |
| 4 | A non-root node with a **right child only**, or a **leaf** | Its parent's `replace_child` swaps it for that right child, which is `None` for a leaf. |

The successor in case 1 has no left child (it's the leftmost node of a right subtree), so removing it is always case 4.

Removing 15 from the tree above:

```text
15 has two children → case 1
successor of 15: right to 20, no left child → 20; save 20
remove the old 20 node: it has a right child only → case 4, 25 takes its place
copy 20 into the node that held 15

          30
        /    \
      20      45
     /  \    /  \
   10   25  40   50
```

#### Length, union, and the rest

- `__len__()` returns `storage_root.count()`, which visits every node: **O(n)**. The class doesn't keep a running count.
- `union`, `intersection`, `difference`, `filter`, and `map` iterate over the set and call `add` (and `search` on the other set), exactly as in the tables above.

With a balanced BST, add, remove, and contains are each O(log n). With the plain BST in zyBooks' class, they're O(h) for tree height h, which is O(n) when elements are added in sorted order. In exchange for being slower than hashing, the BST gives the elements in **sorted order**, and "the smallest element bigger than x" is a quick question.

## Python's set

```python
s = {3, 1, 4}
s.add(1)          # already there: no change
s.add(5)          # {1, 3, 4, 5}
s.remove(9)       # KeyError: 9 isn't in the set
s.discard(9)      # no error: discard ignores missing items
x = s.pop()       # removes and returns some item (no guarantee which)
4 in s            # True, in O(1) on average
len(s)            # the set's length
empty = set()     # {} would make an empty dict, not a set
```

- A `for` loop over a set visits the items in **neither sorted order nor insertion order**. It follows the hash table's internal layout.
- zyBooks' table of Python set operations says `remove` has no effect on a missing item. That's how the set ADT's remove behaves, and how Python's `discard` behaves. Python's `remove` raises `KeyError` instead.
- Items must be hashable (immutable): numbers, strings, and tuples work; lists don't.
- `set(some_list)` removes duplicates from a list in O(n).
- A `frozenset` is a set that can't change, so it can itself be a dict key or a set item.

## Big-O summary

n is the length of the set (X, for the two-set operations), and m is the length of the other set Y. The two-set rows assume zyBooks' algorithms above.

| Operation | Hash-table set | Balanced-BST set |
|---|---|---|
| Add, remove, contains | O(1) average, O(n) worst | O(log n) |
| Length | O(1): Python stores the count | O(n) in zyBooks' Set, which counts the nodes |
| Union X ∪ Y | O(n + m) | O((n + m) log(n + m)) |
| Intersection X ∩ Y | O(n) (Python's: O(min(n, m))) | O(n log m) |
| Difference X − Y | O(n) | O(n log(n + m)) |
| Is X a subset of Y | O(n) | O(n log m) |
| Filter, map | O(n) | O(n log n) |
| List the items in sorted order | O(n log n): sort them first | O(n): iterate with successors |

With zyBooks' plain (unbalanced) BST, replace each log with the tree's height, up to n.

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

  - **a)** **B.** Python's `remove` raises `KeyError` for a missing item; `discard` doesn't; adding an existing item changes nothing.
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

- **8.5** zyBooks' BST-based Set. Elements 41, 17, 63, 8, 29, 52, 77, 34 are added, in that order, to an empty `Set` with the default get-key function.

  **a)** What does `add(29)` return next?

  <!-- answer:8.5a blanks: [True, False] => False -->

  **b)** What does `len()` return after that call?

  <!-- answer:8.5b blanks: 8 -->

  **c)** Which element is in the successor of the node holding 34?

  <!-- answer:8.5c blanks: 41 -->

  **d)** Now `remove(17)` is called. Which element ends up in the node that held 17?

  <!-- answer:8.5d blanks: 29 -->

  **e)** During that removal, which case removes the successor's old node?

  <!-- answer:8.5e blanks: [Case 1, Case 2, Case 3, Case 4] => Case 4 -->

  **f)** What is the tree's preorder traversal after `remove(17)`? Separate the elements with commas.

  <!-- answer:8.5f blanks: 41, 29, 8, 34, 63, 52, 77 | 41,29,8,34,63,52,77 -->

  <details>
  <summary>Answer</summary>

  The tree before any removal:

  ```text
            41
          /    \
        17      63
       /  \    /  \
      8   29  52   77
            \
            34
  ```

  - **a)** **False.** `add` searches first, finds 29, and leaves the set unchanged.
  - **b)** **8.** The failed add didn't change anything, and `count()` visits all 8 nodes.
  - **c)** **41.** 34 has no right child, so climb. 34 is 29's right child: climb to 29. 29 is 17's right child: climb to 17. 17 is 41's left child: stop.
  - **d)** **29.** 17 has two children (case 1). Its successor is the leftmost node of its right subtree: right to 29, which has no left child.
  - **e)** **Case 4.** The old 29 node has a right child only (34), so 34 takes its place under 17's node.
  - **f)** 29 is copied into 17's node, with 8 on its left and 34 on its right: **41, 29, 8, 34, 63, 52, 77**.

  </details>

- **8.6** Subsets and set rules. Is each statement true or false?

  | Statement | True or false |
  |---|---|
  | {12, 30} is a subset of {30, 45, 12}. | |
  | {12, 30, 45} is a subset of {12, 30}. | |
  | {3, 9, 11} is a subset of {3, 9, 11}. | |
  | If X is a subset of Y, X's length can be greater than Y's. | |
  | X ∪ Y = Y ∪ X for any sets X and Y. | |
  | X − Y = Y − X for any sets X and Y. | |
  | If X = {2, 6} and Y = {5, 8, 13}, then X − Y = X. | |

  <!-- answer:8.6a-g table [True, False]: True; False; True; False; True; False; True -->

  <details>
  <summary>Answer</summary>

  - **a)** **True.** Both 12 and 30 are in the second set. Order doesn't matter.
  - **b)** **False.** 45 isn't in {12, 30}.
  - **c)** **True.** Every set is a subset of itself.
  - **d)** **False.** Every element of X is in Y, so X has at most as many elements as Y.
  - **e)** **True.** Union is commutative.
  - **f)** **False.** Difference is not commutative: {1, 2} − {2} is {1}, but {2} − {1, 2} is empty.
  - **g)** **True.** The sets share no elements, so nothing is taken out of X.

  </details>

- **8.7** Filter, map, and iteration.

  **a)** A set of length 12 is filtered. Give the smallest and the largest possible length of the result.

  <!-- answer:8.7a blanks: Smallest => 0; Largest => 12 -->

  **b)** A set of length 9 is mapped with a function F that calls no other functions. How many times is F called?

  <!-- answer:8.7b blanks: 9 -->

  **c)** In what order does a `for` loop visit the items of a Python `set`?

  A. Sorted order, smallest first

  B. The order the items were added

  C. Neither of these

  <!-- answer:8.7c choice: C -->

  **d)** What is the Big-O of `len()` on zyBooks' BST-based `Set` holding n elements?

  <!-- answer:8.7d blanks: [O(1), O(log n), O(n), O(n log n)] => O(n) -->

  <details>
  <summary>Answer</summary>

  - **a)** **0** if no element passes the predicate, and **12** if every element does.
  - **b)** **9.** Map calls F once for each element, even when some results repeat.
  - **c)** **C.** Python's set is a hash table, and the loop follows its internal layout.
  - **d)** **O(n).** `__len__()` calls `count()` on the root, which visits every node.

  </details>
