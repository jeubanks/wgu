# 6. Balanced trees

A plain BST is only fast when it's bushy. Insert keys in sorted order and it becomes a chain, and every operation is O(n) ([chapter 5](05-trees.md#height-depends-on-insertion-order)). A **balanced** search tree checks its shape after every insert and remove, and fixes it with small local moves called **rotations**, so its height stays O(log n) no matter what order the keys arrive in.

This chapter covers the two the course uses: AVL trees and red-black trees. Both are BSTs, so search works exactly as before. Only insert and remove change.

## Rotations

A **rotation** rearranges a parent and one child so the child moves up and the parent moves down, while keeping the BST order.

```text
right rotation at Y                       left rotation at X

        Y                 X                  X                     Y
       / \               / \                / \                   / \
      X   C     →       A   Y              A   Y        →        X   C
     / \                   / \                / \               / \
    A   B                 B   C              B   C             A   B
```

- Keys are in the same order before and after: A < X < B < Y < C.
- The middle subtree B changes parents: it was X's right child and becomes Y's left child (or the reverse).
- Only a few pointers change, so a rotation is **O(1)**.

## AVL trees

An **AVL tree** is a BST where, at every node, the heights of the left and right subtrees differ by at most 1.

Each node's **balance factor** is

> balance factor = height of the left subtree − height of the right subtree

with an empty subtree counting as height −1. In an AVL tree every balance factor is −1, 0, or 1. A node at **+2** leans too far left; at **−2**, too far right.

```text
BST from inserting 40, 20, 60, 10, 30, 25         balance factors

            40                                     40: left height 2, right 0  → +2  ✗
          /    \                                   20: left 0, right 1         → −1
        20      60                                 30: left 0, right −1        → +1
       /  \                                        10, 25, 60: leaves          →  0
     10    30
          /
        25
```

### Inserting into an AVL tree

1. Insert the key as in any BST.
2. Walk back up toward the root, updating each node's height.
3. At the **first** node whose balance factor becomes +2 or −2, rotate. Which rotation depends on where the new key went:

| New key went into | Name | Fix |
|---|---|---|
| the **left** child's **left** subtree | Left-left | one **right** rotation at the unbalanced node |
| the **right** child's **right** subtree | Right-right | one **left** rotation at the unbalanced node |
| the **left** child's **right** subtree | Left-right | **left** rotation at the left child, then **right** rotation at the node |
| the **right** child's **left** subtree | Right-left | **right** rotation at the right child, then **left** rotation at the node |

The first two cases are a straight line and need one rotation. The last two are a zigzag, and need two: the first turns the zigzag into a straight line, and the second fixes the line.

Example: in the tree above, 25 went into 40's left child's (20's) **right** subtree, a left-right case. Rotate left at 20 (30 moves up), then right at 40 (30 moves up again). 30 becomes the root, with 20 and 40 below it.

<div class="viz" data-viz="avl" markdown>

*On the site, an interactive diagram here steps through each of the four AVL cases: the insert, the balance factors, and the rotations.*

</div>

One rotation fixes the tree after an insert: the rotated subtree ends up the same height it was before the insert, so nothing above it changes.

### Removing from an AVL tree

Remove as in any BST, then walk up to the root, updating heights and rotating wherever a balance factor reaches ±2. Unlike insert, a removal can need rotations at several nodes on the way up, but at most one fix per level, so it's still O(log n).

### How tall can an AVL tree get?

An AVL tree with n nodes has height under about 1.44 log₂ n. For 1,000 nodes, that's at most about 14 levels, against 999 for a chain.

## Red-black trees

A **red-black tree** is a BST where every node is colored red or black, following these rules:

1. Every node is red or black.
2. The **root** is black.
3. A **red** node's children are both **black**: no two reds in a row on any path.
4. Null children count as black leaves.
5. Every path from a node down to its null leaves passes through the **same number of black nodes** (the node's *black height*).

```text
          13 (B)
         /      \
     8 (R)      17 (R)
     /   \       /   \
  1 (B) 11 (B) 15 (B) 25 (B)
                        \
                        27 (R)
```

Every path from 13 down to a null leaf passes through 2 black nodes below 13 (counting the null leaf), and no red node has a red child.

Rules 3 and 5 together keep the tree balanced enough: the longest path (alternating red and black) can be at most twice as long as the shortest (all black). So the height is at most **2 log₂(n + 1)**.

<div class="viz" data-viz="rb-tree" markdown>

*On the site, a drawing here shows the red-black tree above, with each node's color written beside it.*

</div>

### Inserting into a red-black tree

1. Insert the key as in any BST, and color the new node **red**. (Red doesn't change any path's black count, so rule 5 still holds.)
2. If its parent is black, you're done.
3. If its parent is also red, rule 3 is broken. Look at the **uncle** (the parent's sibling):
    - **Uncle red:** recolor. The parent and uncle become black, and the grandparent becomes red. Then check the grandparent the same way, since it may now be red under a red parent.
    - **Uncle black (or null):** rotate, as in the AVL cases (one rotation for a straight line, two for a zigzag), then recolor so the node that moved up is black and its two children are red.
4. Finally, make the root black.

Removal also ends with recoloring and at most three rotations, but its cases are longer. The course focuses on the rules and on insert.

## AVL or red-black?

| Feature | AVL tree | Red-black tree |
|---|---|---|
| Balance rule | Subtree heights differ by at most 1 | The five color rules |
| Height | under about 1.44 log₂ n | at most 2 log₂(n + 1) |
| Search, insert, remove | O(log n) | O(log n) |
| Rotations | More, to keep the stricter balance | Fewer; mostly recoloring |
| Best for | Searching more than changing | Frequent inserts and removes (used by many standard libraries' sorted maps and sets) |

## Big-O summary

| Operation | AVL tree | Red-black tree | Plain BST, worst case |
|---|---|---|---|
| Search | O(log n) | O(log n) | O(n) |
| Insert | O(log n) | O(log n) | O(n) |
| Remove | O(log n) | O(log n) | O(n) |
| One rotation | O(1) | O(1) | |

## Questions

- **6.1** Balance factors. Keys 40, 20, 60, 10, 30, 25 were inserted into a **plain** BST (no rebalancing), in that order.

  | Node | Balance factor |
  |---|---|
  | 40 | |
  | 20 | |
  | 30 | |
  | 60 | |

  <!-- answer:6.1a-d table: 2; -1; 1; 0 -->

  <details>
  <summary>Answer</summary>

  - **40:** left subtree (20, 10, 30, 25) has height 2; right (60) has height 0. 2 − 0 = **2**.
  - **20:** left (10) has height 0; right (30, 25) has height 1. **−1**.
  - **30:** left (25) has height 0; right is empty, −1. **1**.
  - **60:** a leaf, −1 − (−1) = **0**.

  </details>

- **6.2** AVL rotations. Each sequence is inserted into an empty AVL tree.

  | Inserted, in order | Rotation needed |
  |---|---|
  | 10, 20, 30 | |
  | 30, 20, 10 | |
  | 30, 10, 20 | |
  | 50, 30, 70, 60, 80, 75 | |

  <!-- answer:6.2a-d table [Left, Right, Left-right, Right-left]: Left; Right; Left-right; Left -->

  <details>
  <summary>Answer</summary>

  - **10, 20, 30:** a chain going right; 10 is at −2. Right-right case: a **left** rotation at 10.
  - **30, 20, 10:** a chain going left; 30 is at +2. Left-left case: a **right** rotation at 30.
  - **30, 10, 20:** 20 went into 30's left child's right subtree: a zigzag, the **left-right** case.
  - **50, 30, 70, 60, 80, 75:** after 75, 50 is at −2 (right height 2, left 0), and 75 went into 50's right child's (70's) **right** subtree, under 80. Right-right: a **left** rotation at 50, and 70 becomes the root.

  </details>

- **6.3** AVL insert, start to finish. Insert 40, 20, 60, 10, 30, 25 into an empty **AVL** tree.

  **a)** Which key is the root afterward?

  <!-- answer:6.3a blanks: 30 -->

  **b)** What is the tree's height?

  <!-- answer:6.3b blanks: 2 -->

  <details>
  <summary>Answer</summary>

  - Inserting 25 makes 40's balance factor +2 (question 6.1), a left-right case. Rotate left at 20, then right at 40.
  - **a)** **30** moves up to the root, with 20 (holding 10 and 25) on its left and 40 (holding 60) on its right.
  - **b)** **2**.

  </details>

- **6.4** Red-black rules. True or false?

  | Statement | True or false |
  |---|---|
  | The root is always black. | |
  | A red node can have a red child. | |
  | A newly inserted node is colored red. | |
  | Every path from a node to its null leaves has the same number of red nodes. | |
  | A red-black tree's height is at most about 2 log₂ n. | |

  <!-- answer:6.4a-e table [True, False]: True; False; True; False; True -->

  <details>
  <summary>Answer</summary>

  - The root is black, red nodes have only black children, and new nodes start red, so they don't change any path's black count.
  - It's the number of **black** nodes that matches on every path, not red ones.
  - The longest path is at most twice the shortest, so the height is at most 2 log₂(n + 1).

  </details>

- **6.5** Red-black insert. A new red node's parent is red, and its uncle is also red. What happens next?

  A. Rotate at the grandparent and stop.

  B. Recolor the parent and uncle black and the grandparent red, then check the grandparent.

  C. Color the new node black and stop.

  <!-- answer:6.5 choice: B -->

  <details>
  <summary>Answer</summary>

  **B.** A red uncle means recoloring is enough locally. The grandparent turning red may break rule 3 one level up, so the check repeats there. Rotations are for a black uncle.

  </details>
