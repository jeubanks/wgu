# 10. B-trees

A B-tree lets each node hold several sorted keys and have several children, so the tree stays short and wide. Every leaf sits at the same depth. The tree keeps that shape in two ways: an insert splits full nodes on the way down, and a remove gives 1-key nodes more keys on the way down. zyBooks teaches the idea with the **2-3-4 tree**, a B-tree of order 4, and this page follows its rules and names.

## B-trees

A **B-tree of order m** is a search tree where:

- A node holds up to **m − 1 keys** and has up to **m children**. The order is the largest number of children a node can have.
- All keys are distinct.
- A node's keys are sorted, smallest on the left.
- An internal node with N keys has exactly **N + 1 children**.
- For each key in an internal node, every key in the subtree to its left is smaller, and every key in the subtree to its right is larger.
- **All leaves are at the same depth.**

An order 3 B-tree, so each node has 1 or 2 keys and up to 3 children:

```text
              12   28
           /     |     \
        4  9    17     33  40
```

- The root has 2 keys, so it has 3 children.
- 4 and 9 are below 12, 17 is between 12 and 28, and 33 and 40 are above 28.
- All three leaves are at depth 1.

Children of the same internal node don't need the same number of keys. In an order 5 B-tree, one child can hold 1 key and its sibling 4.

### Order: zyBooks vs other books

- zyBooks (like Knuth) defines the order as the **maximum number of children**. An order m node has at most m − 1 keys.
- Some books (CLRS, for one) use a **minimum degree** t instead. Every node except the root then has between t − 1 and 2t − 1 keys. A 2-3-4 tree is the t = 2 case.
- Many books also require each non-root node to be at least half full (at least ⌈m/2⌉ children). zyBooks' list of rules doesn't state that. Its insert and remove algorithms keep 2-3-4 trees valid without it.
- Check which definition a question uses before counting keys.

### 2-3-4 trees

A **2-3-4 tree** is a B-tree of order 4. Each node has 1, 2, or 3 keys, and an internal node has 2, 3, or 4 children, which gives the tree its name.

| Keys in the node | Children (internal node) | zyBooks' name |
|---|---|---|
| 1 | 2 | 2-node |
| 2 | 3 | 3-node |
| 3 | 4 | 4-node, also called **full** |

A **leaf** has no children. zyBooks numbers the keys and children in a node from 0:

```text
              key 0     key 1     key 2
           [   20    |   40    |   60   ]
           /         |         |         \
      child 0     child 1    child 2    child 3
      (< 20)     (20 to 40) (40 to 60)  (> 60)
```

- A node with 1 key uses key 0 and children 0 and 1.
- A node with 2 keys uses keys 0 and 1 and children 0, 1, and 2.
- A full node uses everything.

A **subtree** is one node plus everything below it. Cut out any node of a 2-3-4 tree along with everything below it, and the piece follows every 2-3-4 rule on its own. Part of a node, or a node without all of its descendants, is not a subtree.

### Height

zyBooks counts height in edges, as in [chapter 5](05-trees.md#binary-trees): a tree that is only a root has height 0. Every leaf is at the same depth, so that depth is the height.

A 2-3-4 tree of height h holds between 2^(h+1) − 1 keys (every node a 2-node) and 4^(h+1) − 1 keys (every node full). For height 2, that's 7 to 63 keys. Either way the height grows like log n, so the height is **O(log n)**.

### Why use a higher order?

Each level multiplies the number of keys a tree can hold by up to m. A full order 100 B-tree of height 2 holds 100³ − 1 = 999,999 keys, so any key is at most 3 nodes from the top. Databases and file systems use high-order B-trees for this reason: each node fits one disk block, and reading a block is far slower than searching the keys inside it. Fewer levels means fewer block reads.

## The 2-3-4 tree classes

zyBooks builds its 2-3-4 tree in Python with two classes. You don't need to know the code, but the method names show up in zyBooks' explanations:

- **Node234** holds a list of 3 keys, a list of 4 children, and `key_count`, the number of keys in use.
- **Tree234** holds the `root`. An empty tree's root is `None`.
- `has_key(key)` says whether the node holds the key.
- `next_node(key)` returns the child to visit next when looking for a key (the table under [Search](#search)).
- `insert_key_with_children(key, left, right)` puts a key into a node that has room, in sorted position, and attaches the children on either side of it.
- `remove_key(index)` takes out one key and one child.
- `get_min_key(node)` follows child 0 down to a leaf and returns that leaf's key 0: the smallest key in the subtree.
- `key_swap(node, old, new)` finds key `old` in a subtree and overwrites it with `new`.

## Search

**What it's for:** find the node that holds a key, or report that no node does.

**How it works,** starting at the root:

1. If the node is `None`, the key isn't in the tree. Return `None`.
2. If the node holds the key, return the node.
3. Otherwise pick a child with the first condition that's true, and repeat from step 1 with that child:

| Condition, checked in order | Child to visit |
|---|---|
| key < key 0 | child 0 |
| the node has 1 key, or key < key 1 | child 1 |
| the node has 2 keys, or key < key 2 | child 2 |
| none of the above | child 3 |

zyBooks writes the search recursively, with a helper that takes the key and the current node. A loop works the same way.

**Trace.** Search this tree for 45, then for 65:

```text
                   50
               /        \
            30            70
          /    \        /    \
      10 20   40 45    60    80 90
```

```text
search 45
  node (50)       45 ≠ 50.  45 < 50, so go to child 0
  node (30)       45 ≠ 30.  not < 30, and the node has 1 key, so go to child 1
  node (40 45)    45 = key 1. Found: return this node.     3 nodes visited

search 65
  node (50)       65 ≠ 50.  not < 50, 1 key, so go to child 1
  node (70)       65 ≠ 70.  65 < 70, so go to child 0
  node (60)       65 ≠ 60.  it's a leaf, so its child 1 is None
  None            return None: 65 isn't in the tree.       3 nodes visited
```

**Big-O:**

- Best case **O(1)**: the key is in the root.
- Average and worst case **O(log n)**: one node per level, and the height is O(log n). Each node has at most 3 keys, so the work inside a node is O(1).

## Insert

**What it's for:** add a new key and keep every 2-3-4 rule true.

New keys always go into a **leaf**. A leaf with 3 keys has no room. zyBooks makes sure the insert never reaches a full leaf by **splitting** full nodes on the way down.

### The split operation

Splitting a full node (keys 0, 1, 2 and children 0 to 3):

1. Key 0 becomes a new node, with children 0 and 1.
2. Key 2 becomes a new node, with children 2 and 3.
3. Key 1, the middle key, moves **up**:
  - **Non-root node:** key 1 goes into the parent, with the two new nodes as its left and right children. The tree has one more node than before.
  - **Root:** key 1 becomes a new root by itself, with the two new nodes as its children. The tree has two more nodes than before, and its **height grows by 1**. This is the only way a 2-3-4 tree gets taller.

The split returns the node that received the middle key, and the insert continues down from there. A split moves a fixed number of keys and pointers: **O(1)**.

A non-root split. Inserting 35 reaches the full node (30 40 50) and splits it first:

```text
before                                after the split, then 35 added

        20     60                         20   40   60
      /    |      \                     /    |    |    \
     5  30 40 50   80                  5  30 35   50    80
```

40 moved up into the parent. 30 and 50 became separate nodes. Then 35 continued down to the node holding 30.

### Insert with preemptive split

zyBooks calls its algorithm the **preemptive split** insertion scheme. Starting at the root:

1. If the tree is empty, make a root holding the key. Done.
2. If the current node already holds the key, stop: duplicates aren't inserted.
3. If the current node is **full**, split it, and continue from the node that got the middle key (its parent, or the new root).
4. If the node is not a leaf, go to the child that `next_node` picks, and repeat from step 2.
5. The node is a leaf with room. Insert the key in sorted position.

Because every full node on the path is split before the insert moves past it:

- A split never overfills the parent. Any full parent was already split one step earlier.
- The insert never reaches a full leaf, so the new key always fits.

A full node is split even when the new key's leaf has room. That's what makes the split *preemptive*.

**Trace.** Insert 30, 10, 50, 20, 40, 70, 60, 80, 90, 45 into an empty 2-3-4 tree:

```text
insert 30, 10, 50     a single leaf fills up:        10 30 50

insert 20             the root is full: split it, 30 moves up. 20 goes left.
                                30
                             /      \
                          10 20      50

insert 40, 70         both go into the right leaf, which fills up.
                                30
                             /      \
                          10 20    40 50 70

insert 60             (40 50 70) is full: split it, 50 moves up. 60 goes right.
                               30   50
                             /    |    \
                          10 20   40   60 70

insert 80             goes into the right leaf.
                               30   50
                             /    |    \
                          10 20   40   60 70 80

insert 90             (60 70 80) is full: split it, 70 moves up.
                              30  50  70
                            /    |   |   \
                         10 20  40   60  80 90

insert 45             the ROOT is full: split it, 50 becomes the new root.
                      The leaf (40) had room, but the full root splits anyway.
                                   50
                               /        \
                            30            70
                          /    \        /    \
                      10 20   40 45    60    80 90
```

Four splits in all. Only the last one split the root, so the height went from 1 to 2 there.

### Other insertion schemes

zyBooks mentions, without teaching, a second way: go down to the leaf without splitting anything. If the leaf is full, split it, which may overfill the parent, so split the parent, and so on back up toward the root. Many other books use this bottom-up version. For the same keys it can produce a different tree than the preemptive scheme, so use zyBooks' top-down version for zyBooks' questions.

**Big-O:** an insert always walks from the root to a leaf, and each split is O(1), so insert is **O(log n)** in the best, average, and worst case. (An insert that finds a duplicate in the root stops right away, but it adds nothing.)

<div class="viz" data-viz="btree" markdown>

*On the site, an interactive diagram here inserts random keys into a 2-3-4 tree with preemptive splits, and searches it step by step.*

</div>

## Rotations and fusion

Removal needs ways to give a node with only 1 key more keys. zyBooks uses two: rotation and fusion.

### Rotation

A 2-3-4 **rotation** moves one key between two adjacent siblings by way of their parent. Three nodes change, and no node is created or deleted.

- A **right rotation on a node**: the node loses its largest key, which moves up into the parent. The parent key between the node and its **right** sibling moves down into that right sibling, as its new key 0. The node's last child moves over to become the right sibling's new child 0.
- A **left rotation on a node**: the node loses its smallest key, which moves up into the parent. The parent key between the node and its **left** sibling moves down into that left sibling, as its new last key. The node's child 0 moves over to become the left sibling's new last child.

The node being rotated must have at least 2 keys, so it still has one afterward.

```text
right rotation on (10 20 30)                left rotation on (50 60)

        40                  30                    40                   50
      /    \       →      /    \                /    \       →       /    \
 10 20 30   50         10 20   40 50          10    50 60         10 40    60
```

The name says which way the key travels: in a right rotation, a key ends up in the right sibling. These are different from BST rotations in [chapter 6](06-balanced-trees.md#rotations), which move a parent and child up and down. Other books call this step **borrowing**, a **transfer**, or **redistribution**.

A rotation changes a fixed number of keys and pointers, so it's **O(1)**. It never changes the tree's height.

### Fusion

When neither sibling has a key to spare, **fusion** combines three keys into one full node: the keys of two adjacent siblings that have 1 key each, and the parent key between them. Fusion is a split run backward.

**Non-root fusion.** The parent must have at least 2 keys, so it still has one after giving one up. The fused node takes the left sibling's two children and the right sibling's two children, in order.

```text
fuse 10 and 50

        30   70                         70
      /    |    \          →          /    \
    10    50     90             10 30 50     90
```

The parent lost 30, and the tree has one node fewer.

**Root fusion.** When the root has 1 key and both of its children have 1 key each, all three keys go into the root, and the root takes the four grandchildren as its children. This is the only way a 2-3-4 tree gets shorter: the height drops by 1.

```text
fuse the root

        40
      /    \           →        20  40  60
    20      60
```

zyBooks' root fusion reuses the root node, so no new node is created. Each fusion is **O(1)**.

Names differ between books here. zyBooks' **fusion** is what most other books call a **merge**. zyBooks uses the word **merge** for the bigger step in the next section.

## Remove

### Merge

In zyBooks, **merge** means: take a node that has only 1 key and give it more, using a rotation or a fusion. The node's parent must have at least 2 keys, or be the root.

1. If the node's **left** sibling has 2 or more keys, do a **right rotation on the left sibling**. The node ends up with 2 keys.
2. Otherwise, if the node's **right** sibling has 2 or more keys, do a **left rotation on the right sibling**. The node ends up with 2 keys.
3. Otherwise both siblings (or the only sibling) have 1 key, so **fuse**. Fuse with the right sibling if there's no left sibling, otherwise with the left sibling. The node ends up with 3 keys. If the parent is the root with 1 key, this is a root fusion.

zyBooks checks the left sibling first. A node with a 2-key sibling on each side gets its key from the left.

### Remove with preemptive merge

A key can only be removed directly from a **leaf that has at least 2 keys**. zyBooks' **preemptive merge** scheme makes sure of that by merging every 1-key node it visits on the way down:

1. **Special case:** if the root is a leaf with 1 key, remove the key by setting the root to `None` (or report that the key isn't there).
2. Start at the root. At each node:
  - If the node isn't the root and has 1 key, **merge** it first.
  - If the node holds the key and is a **leaf**, remove the key from it. Done.
  - If the node holds the key and is **internal**, find the key's **successor**: the smallest key in the child just to the right of the key. Save it, remove the successor from the tree with a new remove call from the root, then find the original key again and overwrite it with the saved successor. Done.
  - Otherwise go to the child that `next_node` picks.
3. If the search falls off the bottom, the key isn't in the tree.

The successor is always in a leaf, so its removal ends at a leaf. zyBooks uses the successor. Some books use the **predecessor** (the largest key to the left) instead, and either gives a valid tree.

The root is never merged, so it's the only node on the removal path that can still have 1 key when the removal passes through it.

**Trace.** Start from this tree, then remove 50, then remove 30:

```text
                   50
               /        \
            25            75
          /    \        /    \
      10 15    30    60 65   80 90
```

```text
remove 50
  root (50)       holds 50, internal. Successor = smallest key right of 50 = 60.
                  Save 60, then remove 60 starting from the root:
    root (50)     60 not here. Go to child 1.
    node (75)     1 key, not the root: merge. No right sibling, and the left
                  sibling (25) has 1 key, so fuse. The parent is the root with
                  1 key: root fusion. Root becomes (25 50 75).
    root (25 50 75)  60 not here. 50 < 60 < 75: go to child 2.
    node (60 65)  holds 60 and is a leaf: remove it. Node becomes (65).
  Find 50 again (now in the root) and overwrite it with 60.

                25   60   75
             /     |    |     \
         10 15    30    65    80 90

remove 30
  root            30 not here. 25 < 30 < 60: go to child 1.
  node (30)       1 key: merge. Left sibling (10 15) has 2 keys:
                  right rotation on (10 15). 15 moves up, 25 moves down.
                  Root becomes (15 60 75), node becomes (25 30).
  node (25 30)    holds 30 and is a leaf: remove it.

                15   60   75
             /     |    |     \
           10     25    65    80 90
```

The first removal shrank the tree (root fusion), and the second used a rotation.

**Big-O:** a removal walks down the tree, possibly twice (once for the key, once for its successor), doing O(1) work per level. That's **O(log n)** in the best, average, and worst case.

## Big-O summary

| Operation | Best | Average | Worst |
|---|---|---|---|
| Search | O(1): key in the root | O(log n) | O(log n) |
| Insert (preemptive split) | O(log n) | O(log n) | O(log n) |
| Remove (preemptive merge) | O(log n) | O(log n) | O(log n) |
| Split one node | O(1) | O(1) | O(1) |
| One rotation | O(1) | O(1) | O(1) |
| One fusion (root or non-root) | O(1) | O(1) | O(1) |
| Height of the tree | O(log n) | O(log n) | O(log n) |

For a B-tree of a larger order m, each node holds up to m − 1 keys, so a step inside one node costs O(m) (or O(log m) with binary search). With m fixed, that's a constant, and every operation above is still O(log n).

## Questions

- **10.1** B-tree order. Fill in the largest number of keys and children a node can have.

  | Order | Max keys per node | Max children per node |
  |---|---|---|
  | 3 | | |
  | 5 | | |
  | 8 | | |

  <!-- answer:10.1a-f table: 2; 3; 4; 5; 7; 8 -->

  <details>
  <summary>Answer</summary>

  - zyBooks defines the order as the maximum number of children, so the max children column equals the order: **3**, **5**, **8**.
  - A node has one fewer key than children: **2**, **4**, **7**.

  </details>

- **10.2** Valid 2-3-4 trees.

  ```text
  Tree A                          Tree B

          30   60                         25   50
        /    |    \                     /         \
     10 20   40    70                5 15        35 45
                  /  \
                65    80

  Tree C                          Tree D

            40                            20   45
         /      \                      /    |     \
    10 20 30    55 70               5 10  25 50   60 75
  ```

  **a)** Which tree is a valid 2-3-4 tree?

  A. Tree A

  B. Tree B

  C. Tree C

  D. Tree D

  <!-- answer:10.2a choice: C -->

  **b)** In a 2-3-4 tree, how many keys does a 3-node hold?

  <!-- answer:10.2b blanks: 2 -->

  <details>
  <summary>Answer</summary>

  - **a)** **C.** Its root has 1 key and 2 children, its leaves are both at depth 1, and every key is on the correct side.
    - Tree A: the leaves (10 20) and (40) are at depth 1, but 65 and 80 are at depth 2. All leaves must be at the same depth.
    - Tree B: the root has 2 keys, so it needs 3 children. It has 2.
    - Tree D: 50 is in the middle child of (20 45), so it must be between 20 and 45. It's larger than 45.
  - **b)** **2.** The number in the name counts children: a 3-node has 3 children and 2 keys.

  </details>

- **10.3** Search this 2-3-4 tree.

  ```text
                         40
                /                  \
            15  25               60  75  90
          /   |    \          /    |     |    \
       5 10   20   30 35   45 50  65 70  80    95
  ```

  **a)** Searching for 70 reaches the node (60 75 90). Which of its children does the search visit next?

  <!-- answer:10.3a blanks: [Child 0, Child 1, Child 2, Child 3] => Child 1 -->

  **b)** Searching for 33, how many nodes does the search visit?

  <!-- answer:10.3b blanks: 3 -->

  **c)** What does the search for 33 return?

  A. The node (30 35)

  B. `None`

  C. The root

  <!-- answer:10.3c choice: B -->

  <details>
  <summary>Answer</summary>

  - **a)** **Child 1.** 70 is not less than 60, but it is less than 75 (key 1), so the search goes to child 1, the node (65 70), and finds it there.
  - **b)** **3.** The root (40): 33 < 40, child 0. Node (15 25): 33 is not less than 15 or 25, and the node has 2 keys, so child 2. Node (30 35): no match.
  - **c)** **B.** (30 35) is a leaf, so the next child is `None`, and the search returns `None`. It returns a node only when that node holds the key.

  </details>

- **10.4** Insert 18, 6, 12, 24, 3, 9, 30, 15, 27, 36, 33, 2, in that order, into an empty 2-3-4 tree. Use zyBooks' preemptive split.

  **a)** What key or keys are in the root at the end? Separate them with spaces.

  <!-- answer:10.4a blanks: 24 -->

  **b)** What keys are in the root's child 0 at the end? Separate them with spaces.

  <!-- answer:10.4b blanks: 6 12 | 6, 12 -->

  **c)** What is the tree's height at the end?

  <!-- answer:10.4c blanks: 2 -->

  **d)** How many splits happen in all?

  <!-- answer:10.4d blanks: 5 -->

  <details>
  <summary>Answer</summary>

  - 18, 6, 12 fill the root: (6 12 18).
  - 24: the root is full. Split: 12 moves up. Root (12), leaves (6) and (18 24). Split 1.
  - 3, 9 go left: (3 6 9). 30 goes right: (18 24 30).
  - 15: the root (12) has room. Its child (18 24 30) is full: split, 24 moves up. Root (12 24), leaves (3 6 9), (15 18), (30). Split 2.
  - 27 and 36 go into the right leaf: (27 30 36).
  - 33: the right leaf is full: split, 30 moves up. Root (12 24 30), leaves (3 6 9), (15 18), (27), (33 36). Split 3.
  - 2: the root is full: split, 24 becomes the new root over (12) and (30). Split 4. Then (12)'s child (3 6 9) is full: split, 6 moves up into (12), giving (6 12). Split 5. 2 goes into (3), giving (2 3).
  - **a)** **24**. **b)** **6 12**. **c)** Height **2**: root, one middle level, leaves. **d)** **5** splits.

  ```text
                       24
                 /            \
             6   12             30
           /   |    \         /    \
        2 3    9   15 18    27     33 36
  ```

  </details>

- **10.5** Preemptive split. Start from this 2-3-4 tree each time.

  ```text
            20      50
         /      |       \
      5 10   30 35 40   60 70
  ```

  **a)** Insert 38. What keys are in the root afterward? Separate them with spaces.

  <!-- answer:10.5a blanks: 20 35 50 | 20, 35, 50 -->

  **b)** Which leaf holds 38 afterward? Give its keys, separated by spaces.

  <!-- answer:10.5b blanks: 38 40 | 38, 40 -->

  **c)** Starting again from the tree shown, insert 65 instead. What happens?

  A. 65 goes into the leaf (60 70), and no node splits.

  B. The leaf (60 70) splits first, then 65 goes in.

  C. The root splits, and the tree's height grows by 1.

  <!-- answer:10.5c choice: A -->

  <details>
  <summary>Answer</summary>

  - **a)** The root (20 50) has room. 38 is between 20 and 50, so the insert goes to child 1, (30 35 40), which is full. Split it: 35 moves up into the root, giving **20 35 50**.
  - **b)** The insert continues from the root. 38 is between 35 and 50: child 2, which is the new node (40). 38 goes in front of 40: **38 40**.
  - **c)** **A.** The path is the root (2 keys) and then (60 70) (2 keys). Neither is full, so nothing splits.

  </details>

- **10.6** Merges. Start from this 2-3-4 tree each time.

  ```text
             30     50     70
          /      |      |      \
        10      40    60 65     80
  ```

  Which operation does a zyBooks merge use on each node?

  | Node merged | Operation |
  |---|---|
  | (10) | |
  | (40) | |
  | (80) | |

  <!-- answer:10.6a-c table [Left rotation, Right rotation, Fusion]: Fusion; Left rotation; Right rotation -->

  **d)** After merging (40), what keys are in the root? Separate them with spaces.

  <!-- answer:10.6d blanks: 30 60 70 | 30, 60, 70 -->

  <details>
  <summary>Answer</summary>

  - **(10):** no left sibling, and the right sibling (40) has 1 key. **Fusion**: 10, 30, and 40 become one node.
  - **(40):** the left sibling (10) has 1 key. The right sibling (60 65) has 2, so a **left rotation** on (60 65).
  - **(80):** the left sibling (60 65) has 2 keys, so a **right rotation** on (60 65).
  - **d)** The left rotation on (60 65) moves 60 up into the root and the parent key 50 down into (40). The root becomes **30 60 70**, the merged node (40 50), and the sibling (65).

  </details>

- **10.7** Remove 40 from this 2-3-4 tree with zyBooks' preemptive merge.

  ```text
                   40      70
              /        |        \
            20         55        85  95
           /  \       /  \     /   |    \
         10    30   50    60  80   90    99
  ```

  **a)** Which key replaces 40?

  <!-- answer:10.7a blanks: 50 -->

  Two merges happen along the way. Which operation does each use?

  | Merge | Operation |
  |---|---|
  | First merge | |
  | Second merge | |

  <!-- answer:10.7b-c table [Left rotation, Right rotation, Fusion]: Left rotation; Fusion -->

  **d)** What keys are in the root at the end? Separate them with spaces.

  <!-- answer:10.7d blanks: 50 85 | 50, 85 -->

  **e)** What key or keys are in the root's child 1 at the end?

  <!-- answer:10.7e blanks: 70 -->

  <details>
  <summary>Answer</summary>

  - **a)** 40 is in an internal node, so it's replaced by its successor, the smallest key in the child to its right: follow (55) down its child 0 to **50**.
  - The algorithm saves 50 and removes it, starting from the root:
    - The root (40 70) isn't merged. 50 is between 40 and 70: go to child 1, (55).
    - (55) has 1 key: merge. Its left sibling (20) has 1 key, and its right sibling (85 95) has 2, so a **left rotation** on (85 95). 85 moves up and 70 moves down. Root (40 85), node (55 70), sibling (95).
    - 50 < 55: go to child 0, (50). It has 1 key: merge. No left sibling, and the right sibling (60) has 1 key, so **fusion** with the parent key 55: node (50 55 60). The parent becomes (70).
    - (50 55 60) is a leaf holding 50: remove it, leaving (55 60).
  - Then 40 is found in the root and overwritten with 50.
  - **d)** The root is **50 85**. **e)** Its child 1 is **70**, with children (55 60) and (80).

  ```text
                   50      85
              /        |        \
            20         70        95
           /  \       /  \      /   \
         10    30  55 60  80   90    99
  ```

  </details>

- **10.8** Big-O for a 2-3-4 tree with n keys.

  | Operation | Big-O |
  |---|---|
  | Search, worst case | |
  | Search, when the key is in the root | |
  | Insert with preemptive split | |
  | Remove with preemptive merge | |
  | Split one full node | |
  | One rotation or fusion | |
  | The tree's height | |

  <!-- answer:10.8a-g table [O(1), O(log n), O(n), O(n log n)]: O(log n); O(1); O(log n); O(log n); O(1); O(1); O(log n) -->

  <details>
  <summary>Answer</summary>

  - All leaves are at the same depth and each node has at least 2 children, so the height is **O(log n)**.
  - Search, insert, and remove each walk one path from the root, with O(1) work per node: **O(log n)**. A search that matches in the root stops at once: **O(1)**.
  - A split, rotation, or fusion moves a fixed number of keys and pointers: **O(1)**.

  </details>
