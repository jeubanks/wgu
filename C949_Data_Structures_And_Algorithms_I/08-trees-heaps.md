# 8. Trees and heaps

A tree stores data in a hierarchy: one root, children below, no cycles. This page is part of *Determines Data Structure Impact*. After it, you can name a tree's parts, search and change a binary search tree, list traversals, and work a heap by index.

## Tree vocabulary

In a **binary tree**, each node has at most two children, a left and a right.

<!-- figure
tree: 62{31{15, 47{, 52}}, 84{73, 96}}
levels: root, depth 0 | depth 1 | depth 2 | depth 3
-->
```text
              62            depth 0
            /    \
          31      84        depth 1
         /  \    /  \
       15   47  73   96     depth 2
              \
               52           depth 3
```
<!-- /figure -->

| Term | Meaning | Above |
|---|---|---|
| **Root** | The one node with no parent | 62 |
| **Parent, child** | A node and those directly below it, joined by an **edge** | 31 is 47's parent |
| **Siblings** | Children of the same parent | 73 and 96 |
| **Leaf** | No children | 15, 52, 73, 96 |
| **Internal node** | At least one child | 62, 31, 84, 47 |
| **Subtree** | A node and everything below it | 47 and 52 |
| **Depth** | Edges from the root to a node | 52: 3 |
| **Level** | All nodes at one depth | Level 1: 31, 84 |
| **Height** | The largest depth in the tree | 3 |

Depth and height count **edges**, not nodes. One node alone has height 0; an empty tree, −1.

### Full, complete and perfect

| Shape | Rule |
|---|---|
| **Full** | Every node has 0 or 2 children. |
| **Complete** | Every level is full except maybe the last, which fills from the left. |
| **Perfect** | Every internal node has 2 children and all leaves share one level. |

<div class="viz" data-viz="tree-shapes" markdown>

*On the site, a drawing here shows full, complete and perfect trees.*

</div>

## Binary search trees

A **BST** adds a rule at every node: the left subtree is all **smaller**, the right all **larger** (duplicates go right). One comparison picks a side and skips the other.

### Search and insert

**Search:** from the root, go left if smaller, right if larger, until you find the key or step off the tree (not there).

**Insert:** search, and add a leaf where the search steps off.

<!-- figure
tree: Insert 40: the search path is highlighted :: 62@h{31@h{15, 47@h{40@h, 52}}, 84{73, 96}}
-->
```text
         62*
       /    \
     31*     84
    /  \    /  \
  15   47* 73   96
      /  \
    40*   52
```
<!-- /figure -->

### Remove

Find the node, then:

| The node has | Do this |
|---|---|
| **No children** | Its parent's link becomes null. |
| **One child** | Its parent links straight to that child, subtree and all. |
| **Two children** | Copy in its **successor** (right once, then left as far as possible), then remove the successor, which has at most one child. |

Removing a node never deletes its children (some summaries say it does); they're reattached. Removing 62: its successor 73 is copied into the root, and the 73 leaf removed.

<!-- figure
tree: Before :: 62@h{31{15, 47{, 52}}, 84@h{73@h, 96}}
tree: After :: 73@h{31{15, 47{, 52}}, 84{, 96}}
flow: yes
-->
```text
before                  after
     62*                     73
    /   \                   /  \
  31     84*              31    84
 / \    /  \             / \      \
15  47 73*  96          15  47     96
      \                       \
       52                      52
```
<!-- /figure -->

### Insertion order sets the height

<!-- figure
tree: Insert 4, 2, 6, 1, 3, 5, 7: height 2 :: 4{2{1, 3}, 6{5, 7}}
tree: Insert 1 to 7 in order: height 6 :: 1{, 2{, 3{, 4{, 5{, 6{, 7}}}}}}
-->
```text
       4              1
     /   \             \
    2     6             2
   / \   / \             \
  1   3 5   7             3 ... down to 7
```
<!-- /figure -->

Search, insert and remove are O(h), one step per level. Random order keeps h near log₂ n; sorted input makes a chain, h = n − 1.

## Traversals

A traversal visits each node once: O(n). Its name says when a node comes relative to its subtrees; numbers show visit order:

<!-- figure
tree: Preorder: F B A D G I :: F^1{B^2{A^3, D^4}, G^5{, I^6}}
tree: Inorder: A B D F G I :: F^4{B^2{A^1, D^3}, G^5{, I^6}}
tree: Postorder: A D B I G F :: F^6{B^3{A^1, D^2}, G^5{, I^4}}
tree: Level-order: F B G A D I :: F^1{B^2{A^4, D^5}, G^3{, I^6}}
-->
```text
        F               preorder     F B A D G I
      /   \             inorder      A B D F G I
     B     G            postorder    A D B I G F
    / \     \           level-order  F B G A D I
   A   D     I
```
<!-- /figure -->

| Traversal | Order | Trick |
|---|---|---|
| **Preorder** | node, left, right | Trace around the tree counterclockwise from the root; list a node as you pass its **left** side. |
| **Inorder** | left, node, right | List it as you pass **under** it. On a BST: sorted order. |
| **Postorder** | left, right, node | List it as you pass its **right** side. |
| **Level-order** | row by row, left to right | Read it like a page (a queue). |

<div class="viz" data-viz="bst" markdown>

*On the site, an interactive BST here animates insert, search, remove and the traversals.*

</div>

## Heaps

A **max-heap** is a complete binary tree where every parent is **≥** its children, so the largest key is at the root. A **min-heap** flips that. There's no left-right rule, so finding an arbitrary key is O(n).

### Stored in an array

A complete tree has no gaps read level by level, so a heap is a plain array in that order, and parents and children are reached **by index** (some summaries say they aren't). zyBooks and this kit put the root at index 0; the course study guide puts it at 1.

| From index i | Root at 0 (this kit) | Root at 1 |
|---|---|---|
| Left child | 2i + 1 | 2i |
| Right child | 2i + 2 | 2i + 1 |
| Parent | (i − 1) // 2 | i // 2 |
| Node 45 below | i = 1: children 3, 4; parent 0 | i = 2: children 4, 5; parent 1 |

<!-- figure
heap: 72 45 63 30 41 50 18
-->
```text
index   0  1  2  3  4  5  6              72
array  72 45 63 30 41 50 18            /    \
                                     45      63
                                    /  \    /  \
                                  30   41  50   18
```
<!-- /figure -->

### Insert: percolate up

Append the key, then swap it with its parent while it's larger. Inserting 68:

<!-- figure
index: yes
row: append 68 | 72 45 63 30 41 50 18 *68 | parent 30
row: swap | 72 45 63 *68 41 50 18 *30 | parent 45
row: swap | 72 *68 63 *45 41 50 18 30 | parent 72: stop
-->
```text
append 68   72 45 63 30 41 50 18 68   parent 30
swap        72 45 63 68 41 50 18 30   parent 45
swap        72 68 63 45 41 50 18 30   parent 72: stop
```
<!-- /figure -->

### Remove the root: percolate down

Save the root, move the **last** item there, and swap it with its **larger** child while it's smaller. Removing 72:

<!-- figure
index: yes
row: 18 to root | *18 45 63 30 41 50 | children 45, 63
row: swap with 63 | *63 45 *18 30 41 50 | child 50
row: swap with 50 | 63 45 *50 30 41 *18 | no children: stop
-->
```text
18 to root     18 45 63 30 41 50   children 45, 63
swap with 63   63 45 18 30 41 50   child 50
swap with 50   63 45 50 30 41 18   no children: stop
```
<!-- /figure -->

A min-heap flips the comparisons. **Heapify** builds a heap from an unsorted array by percolating down each internal node, index n // 2 − 1 back to 0: O(n).

<div class="viz" data-viz="heap" markdown>

*On the site, an interactive max-heap here shows insert and remove on the tree and array together.*

</div>

## Priority queues and `heapq`

A **priority queue** dequeues the highest-priority item first. It's usually a heap: enqueue inserts, dequeue removes the root, peek reads it.

Python's `heapq` works on a plain list as a **min-heap**: `heappop` returns the **smallest**.

```python
import heapq
h = []
for x in [5, 8, 2]:
    heapq.heappush(h, x)   # O(log n)
h[0]                       # 2: peek, O(1)
heapq.heappop(h)           # 2, the smallest: O(log n)
nums = [6, 1, 4]
heapq.heapify(nums)        # turn a list into a heap, O(n)
```

For a max-heap, push `-x` and negate what comes out.

## Big-O summary

| Operation | Best | Average | Worst |
|---|---|---|---|
| BST search, insert, remove | O(1): at the root | O(log n): random order | O(n): a chain |
| Traversal (any) | O(n) | O(n) | O(n) |
| Heap insert | O(1): no swaps | O(log n) | O(log n): climbs to the root |
| Heap remove root | O(1): no swaps | O(log n) | O(log n): sinks to a leaf |
| Heap peek | O(1) | O(1) | O(1) |
| Search a heap for any key | O(1) | O(n) | O(n) |
| Heapify | O(n) | O(n) | O(n) |

## Questions

- **8.1** Use this tree for 8.1 to 8.3:

  <!-- figure
  tree: 50{30{20{10}, 40}, 70{, 80}}
  -->
  ```text
           50
         /    \
       30      70
      /  \       \
    20    40      80
   /
  10
  ```
  <!-- /figure -->

  | Question | Answer |
  |---|---|
  | The root | |
  | How many leaves | |
  | The tree's height | |
  | The depth of 40 | |
  | Is it complete? (yes or no) | |

  <!-- answer:8.1a-e table: 50; 3; 3; 2; no -->

  <details>
  <summary>Answer</summary>

  - Root **50**; leaves 10, 40, 80: **3**. Longest path 50 → 30 → 20 → 10: **3** edges. 40 is **2** down.
  - **No:** level 2 has a gap where 70's left child would be, yet 10 sits on a level below it.

  </details>

- **8.2** Traversals of the 8.1 tree. Separate keys with commas.

  **a)** Preorder

  <!-- answer:8.2a blanks: 50, 30, 20, 10, 40, 70, 80 | 50,30,20,10,40,70,80 -->

  **b)** Postorder

  <!-- answer:8.2b blanks: 10, 20, 40, 30, 80, 70, 50 | 10,20,40,30,80,70,50 -->

  **c)** Level-order

  <!-- answer:8.2c blanks: 50, 30, 70, 20, 40, 80, 10 | 50,30,70,20,40,80,10 -->

  <details>
  <summary>Answer</summary>

  - **a)** 50, then its left subtree, then its right.
  - **b)** Left subtree, right subtree, then 50.
  - **c)** Row by row: 50; 30, 70; 20, 40, 80; 10.

  </details>

- **8.3** Removing from the 8.1 BST, starting fresh each time.

  **a)** Remove 30. Which key takes its place?

  <!-- answer:8.3a blanks: 40 -->

  **b)** Remove 20. How many nodes are left in the tree?

  <!-- answer:8.3b blanks: 6 -->

  <details>
  <summary>Answer</summary>

  - **a)** **40**, 30's successor: right once, and 40 has no left child.
  - **b)** **6.** 20 has one child, so 30 links straight to 10. Only 20 is removed.

  </details>

- **8.4** A max-heap is stored as `90 70 85 30 60 50 80`, root at index 0.

  | Question | Answer |
  |---|---|
  | Left child's index, from index 2 | |
  | Right child's value, from index 2 | |
  | Parent's index, from index 4 | |
  | Left child's index from index 3, root at 1 | |

  <!-- answer:8.4a-d table: 5; 80; 1; 6 -->

  <details>
  <summary>Answer</summary>

  - From 0: left child 2 × 2 + 1 = **5**; right child 6 holds **80**; parent (4 − 1) // 2 = **1**.
  - From 1: left child 2 × 3 = **6**.

  </details>

- **8.5** Start from the 8.4 heap each time. Separate values with spaces.

  **a)** Insert 88. What is the array afterward?

  <!-- answer:8.5a blanks: 90 88 85 70 60 50 80 30 | 90, 88, 85, 70, 60, 50, 80, 30 -->

  **b)** Remove the root. What is the array afterward?

  <!-- answer:8.5b blanks: 85 70 80 30 60 50 | 85, 70, 80, 30, 60, 50 -->

  <details>
  <summary>Answer</summary>

  - **a)** 88 enters at index 7, swaps past 30 and 70, and stops under 90.
  - **b)** 80 moves to the root, swaps with the larger child 85, then beats 50.

  </details>

- **8.6** What does this print?

  ```python
  import heapq
  h = []
  for x in [7, 3, 9, 1]:
      heapq.heappush(h, x)
  print(heapq.heappop(h), heapq.heappop(h), h[0])
  ```

  <!-- answer:8.6 blanks: 1 3 7 -->

  <details>
  <summary>Answer</summary>

  - `heapq` is a min-heap: pops give 1, then 3, and the smallest left, 7, is at `h[0]`.

  </details>

- **8.7** Pick the Big-O.

  | Operation | Big-O |
  |---|---|
  | BST search, average | |
  | BST search, keys inserted in sorted order | |
  | Inorder traversal | |
  | Max-heap insert, worst | |
  | Read a max-heap's largest key | |
  | Heapify n items | |

  <!-- answer:8.7a-f table [O(1), O(log n), O(n), O(n log n)]: O(log n); O(n); O(n); O(log n); O(1); O(n) -->

  <details>
  <summary>Answer</summary>

  - A random BST is about log n tall; sorted input makes a chain, n − 1 tall. A traversal visits all n nodes.
  - Insert climbs at most the height; the max sits at index 0; heapify is O(n) since most nodes start low.

  </details>
