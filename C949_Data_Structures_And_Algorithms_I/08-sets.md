# 8. Sets

A **set** holds distinct items in no particular order. Think of the list of students who turned in homework: a name is either on it or not, and writing a name twice doesn't count it twice. A set is built to answer one question fast: is this item in the set? You'd use one to track which usernames are taken, or which web pages a program has already visited. The classic set operations (union, intersection, difference) combine two sets into a new one.

## The set ADT

An ADT (abstract data type) describes what a structure does, without saying how it's stored. The set ADT holds **distinct** elements, so no element is ever in it twice. Adding an element that's already there does nothing, however many times you try.

- A set is **unordered**. Two sets with the same elements are **equal sets**, whatever order the elements were added in. For example, {8, 3, 12} equals {12, 8, 3}.
- A set's **length** is the number of elements in it. Its formal name is the set's **cardinality**. {8, 3, 12} has length 3.
- If a set doesn't contain an element, then either the element was never added, or it was removed after it was last added.

The common operations, by the method names the course code uses:

| Operation | What it does |
|---|---|
| add(x) | Put x in the set. If it's already there, nothing changes. |
| remove(x) | Take x out. If it isn't there, nothing changes. |
| contains(x) | True if x is in the set, False otherwise. |
| get_length() | How many elements the set holds. |
| is_subset_of(other) | True if every element of this set is also in other. |
| union(other), intersection(other), difference(other) | Build and return a **new** set. Neither input changes. |
| filter(predicate), map(function) | Build and return a new set from this one. |

The ADT only says what each operation does. How fast each operation runs depends on the data structure underneath. A set can be built on several structures, such as a hash table or a BST (both covered below).

Compared with the other ADTs:

| ADT | Keeps order? | Allows duplicates? | Stores |
|---|---|---|---|
| **List** | yes | yes | items |
| **Bag** | no | yes, and counts them | items |
| **Set** | no | no | items |
| **Map** | no | no duplicate keys | key–value pairs |

A set is like a map's keys alone.

## Subsets

S1 is a **subset** of S2 if S2 contains every one of S1's elements. If even one element of S1 is missing from S2, S1 is not a subset.

With S2 = {6, 13, 21, 34, 40}:

| Set | Check | Subset of S2? |
|---|---|---|
| {13, 40} | every element is in S2 | yes |
| {6, 21, 50} | 50 is not in S2 | no |
| S2 itself | every element is in S2 | yes |

- Every set is a subset of itself, so two equal sets are subsets of each other.
- If S1 is a subset of S2, S1 can't have more elements than S2. Its length is ≤ S2's length.
- To check whether S1 is a subset, loop over S1 and look up each element in S2. The loop can stop at the first missing element.

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

The course covers union, intersection, difference, and subset. Symmetric difference is an extra one that Python provides.

Union and intersection are **commutative**, meaning the order of the two sets doesn't matter: X ∪ Y = Y ∪ X, and X ∩ Y = Y ∩ X. Difference is not commutative. X − Y is {7, 23}, but Y − X is {31, 58}.

Common mistake: reading X − Y as "everything the two sets don't share." That's the symmetric difference. X − Y keeps only elements from X, so nothing from Y ever appears in it.

### How zyBooks builds each result

Each operation is a short loop. It starts with a new, empty result set and adds to it. Adding a duplicate does nothing, so the result never repeats an element.

| Operation | Steps |
|---|---|
| X ∪ Y | Add every element of X to the result. Then add every element of Y. |
| X ∩ Y | For each element of X: if it's in Y, add it to the result. |
| X − Y | For each element of X: if it's **not** in Y, add it to the result. |

Union, step by step, for the X and Y above:

| Step | Result afterward |
|---|---|
| Start | { } |
| Add X's elements 7, 19, 23, 40 | {7, 19, 23, 40} |
| Add Y's 19 | already there, no change |
| Add Y's 31 | {7, 19, 23, 40, 31} |
| Add Y's 40 | already there, no change |
| Add Y's 58 | {7, 19, 23, 40, 31, 58} |

A few rules follow from the definitions, for any sets X and Y:

- X ∪ X = X, and X ∩ X = X. X − X is the empty set.
- If X and Y share no elements, X ∩ Y is empty and X − Y is all of X.

## Filter and map

Filter and map each build a new set from one set by calling a function once on every element.

- **Filter** keeps the elements that pass a test. The test is a **filter predicate**: a function that takes an element and returns True (keep it) or False (leave it out).
- **Map** applies a function F to every element and adds each returned value to the result.

With W = {14, 24, 31, 46, 51}:

| Element | 14 | 24 | 31 | 46 | 51 | Result |
|---|---|---|---|---|---|---|
| Filter with "is greater than 30" | False | False | True | True | True | {31, 46, 51} |
| Map with "ones digit" | 4 | 4 | 1 | 6 | 1 | {4, 1, 6} |

The map returns 4 and 1 twice each, but a set keeps one copy.

In Python, `{x for x in W if x > 30}` filters, and `{x % 10 for x in W}` maps.

What the results can look like, for a set of length N:

- The function is called **exactly N times**, once per element, by both filter and map.
- A filter's result is a subset of the original, with length anywhere from 0 to N.
- A map's result has length from 1 to N when N ≥ 1. The result is shorter than N when two elements map to the same value. It's empty only when the original set is empty.

## Building a set

### On a hash table

Store each item as a key in a hash table ([chapter 4](04-hash-tables.md)). Add, remove, and contains are each O(1) on average. Union and intersection loop over the items and check whether each one is in the other set:

- Union of sets of sizes n and m: O(n + m).
- Intersection X ∩ Y, the zyBooks way (loop over X): O(n). Python's built-in intersection loops over the smaller set instead: O(min(n, m)).
- Difference X − Y, looping over X: O(n).

The items come out in no useful order. Python's `set` works this way.

### On a binary search tree: the zyBooks Set class

zyBooks builds its `Set` class on a binary search tree ([chapter 5](05-trees.md)), one element per node. Real code would use a balanced BST ([chapter 6](06-balanced-trees.md)) or a hash table for better speed. A plain BST is still enough to build every operation, and it keeps the elements in sorted order.

**The key function.** A BST needs something to compare, but set elements can be whole records. So you can pass the constructor a **get-key function**. Given an element, this function returns the key the BST sorts by. The BST compares keys with `<`, `>`, and `==`.

- With no argument, the default is `lambda el: el`, so each element is its own key.
- A set of student records could pass `lambda s: s.id` to key them by ID.

The new sets returned by union, intersection, and the other operations use the same get-key function as the original set.

**The nodes.** Each `BSTNode` stores its element in `data`, plus `left`, `right`, and **`parent`** references. The parent reference lets the class find a node's successor and iterate without recursion. Each node also has three helpers:

- `count()` returns the number of nodes in its subtree, recursively.
- `get_successor()` returns the node that comes next in sorted order (rules below).
- `replace_child(current, new)` swaps one of its children for another node and fixes that node's parent reference.

The examples below use this tree, built by adding 30, 15, 45, 10, 20, 40, 50, 25 in that order:

<!-- figure
tree: 30{15{10, 20{, 25}}, 45{40, 50}}
-->
```text
          30
        /    \
      15      45
     /  \    /  \
   10   20  40   50
          \
          25
```
<!-- /figure -->

#### add

First, search for the new element's key. If the key is found, return **False** and change nothing. That's how the set stays distinct. Otherwise, insert a new leaf the usual BST way (smaller keys go left, others go right) and return **True**.

Adding 20 again to the tree above returns False, and the length stays 8.

Adding 35 instead returns True. The search goes 30 → 45 → 40, and 40 has no left child, so 35 becomes 40's left child:

<!-- figure
tree: Before :: 30{15{10, 20{, 25}}, 45{40, 50}}
tree: After add(35): the search path is highlighted :: 30@h{15{10, 20{, 25}}, 45@h{40@h{35@h}, 50}}
flow: yes
-->
```text
before                            after add(35)

          30                                30
        /    \                            /      \
      15      45                        15        45
     /  \     / \                      /  \       /  \
   10   20   40  50                  10   20     40   50
          \                                 \    /
          25                                25  35
```
<!-- /figure -->

#### Successor

`get_successor()` has two cases:

| The node has | Its successor is |
|---|---|
| A right child | The leftmost node of its right subtree: go right once, then left as far as possible. |
| No right child | Up the tree. Climb while the current node is its parent's **right** child. The first time you climb from a **left** child, that parent is the successor. If you reach the root without climbing from a left child, there's no successor, because the node holds the largest key. |

Successor of 25, which has no right child:

<!-- figure
tree: Climb from 25 until the climb comes from a left child :: 30@h{15@h{10, 20@h{, 25@h}}, 45{40, 50}}
-->
```text
25 is 20's right child   → climb to 20
20 is 15's right child   → climb to 15
15 is 30's left child    → stop: the successor is 30
```
<!-- /figure -->

1. 25 is 20's right child: climb to 20.
2. 20 is 15's right child: climb to 15.
3. 15 is 30's left child: stop. The successor is 30.

Successor of 20: 20 has a right child, so go right to 25, then left as far as possible. 25 has no left child, so the successor is 25.

#### Iterating

`__iter__()` finds the minimum node: start at the root and go left until there's no left child. It returns a `BSTIterator` holding that node. Each call to the iterator's `__next__()` (`next()` in Python before version 3) returns the current node's element, then moves to that node's successor. When the successor is `None`, iteration stops.

The iterator keeps only one node reference at a time. It visits the elements in **ascending order of their keys**:

<!-- figure
row: visits | 10 15 20 25 30 40 45 50 | then None: stop
-->
```text
start at 10 → 15 → 20 → 25 → 30 → 40 → 45 → 50 → None: stop
```
<!-- /figure -->

#### remove

`remove(key)` searches for the node with that key, then removes it. If the key is missing, nothing happens. The node falls into one of four cases, checked in this order. Case 1 uses the successor's data because the successor is the next larger key, so putting it in the node's place keeps the BST order.

| Case | The node is | What happens |
|---|---|---|
| 1 | An internal node with **two children** | Find its successor and save the successor's data. Remove the successor node (recursively, with these same cases). Then copy the saved data into this node. |
| 2 | The **root**, with 0 or 1 child | The child (or `None`) becomes the new root, and its parent reference is cleared. |
| 3 | A non-root node with a **left child only** | Its parent's `replace_child` swaps it for that left child. |
| 4 | A non-root node with a **right child only**, or a **leaf** | Its parent's `replace_child` swaps it for that right child, which is `None` for a leaf. |

The successor in case 1 has no left child, because it's the leftmost node of a right subtree. So removing the successor is always case 4.

Removing 15 from the original tree (without 35):

1. 15 has two children: case 1.
2. The successor of 15: go right to 20, which has no left child, so it's 20. Save 20.
3. Remove the old 20 node. It has a right child only (case 4), so 25 takes its place.
4. Copy 20 into the node that held 15.

<!-- figure
title: After removing 15
tree: 30{20{10, 25}, 45{40, 50}}
-->
```text
          30
        /    \
      20      45
     /  \    /  \
   10   25  40   50
```
<!-- /figure -->

#### Length, union, and the rest

- `__len__()` returns `storage_root.count()`, which visits every node: **O(n)**. The class doesn't keep a running count.
- `union`, `intersection`, `difference`, `filter`, and `map` iterate over the set and call `add` (and `search` on the other set), exactly as in the tables above.

With a balanced BST, add, remove, and contains are each O(log n). With the plain BST in zyBooks' class, they're O(h) for tree height h, which is O(n) when elements are added in sorted order. A BST is slower than hashing. In exchange, it gives you the elements in **sorted order**, and it can quickly find "the smallest element bigger than x."

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

- A `for` loop over a set visits the items in **neither sorted order nor insertion order**. The loop follows the hash table's internal layout.
- zyBooks' table of Python set operations says `remove` has no effect on a missing item. That matches the set ADT's remove and Python's `discard`. Python's `remove` raises `KeyError` instead.
- Items must be hashable (immutable). Numbers, strings, and tuples work. Lists don't.
- `set(some_list)` removes duplicates from a list in O(n).
- A `frozenset` is a set that can't change. Because it can't change, it can be a dict key or an item in another set.

## Big-O summary

Here n is the length of the set (X, for the two-set operations), and m is the length of the other set, Y. The two-set rows assume zyBooks' algorithms from above.

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

  - **a)** **B.** Python's `remove` raises `KeyError` for a missing item. `discard` doesn't, and adding an existing item changes nothing.
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

  - Hashing makes contains and add O(1) on average. A balanced BST walks one path from the root, so it's O(log n).
  - A hash table keeps no order, so you must sort its items first: O(n log n). A BST's inorder traversal is already sorted: O(n).

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

  <!-- figure
  tree: 41{17{8, 29{, 34}}, 63{52, 77}}
  -->
  ```text
            41
          /    \
        17      63
       /  \    /  \
      8   29  52   77
            \
            34
  ```
  <!-- /figure -->

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
