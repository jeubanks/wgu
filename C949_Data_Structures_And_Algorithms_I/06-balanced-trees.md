# 6. Balanced trees

A plain BST is only fast when its height stays small. If you insert keys in sorted order, the tree becomes a chain, and every operation is O(n) ([chapter 5](05-trees.md#height-depends-on-insertion-order)). A **balanced** search tree checks its shape after every insert and remove, and fixes it with small local moves called **rotations**, so its height stays O(log n) no matter what order the keys arrive in.

This page follows zyBooks chapter 6: AVL trees (the balance rule, rotations, insertion, removal) and red-black trees (the rules, rotations, insertion, removal), plus the subtree key counts the chapter's labs add. Both kinds of tree are BSTs, so search works exactly as before. Only insert and remove change.

## Rotations

A **rotation** rearranges a node and one of its children so the child moves up and the node moves down, while keeping the BST order. zyBooks says a rotation is done **at** a node: the node that moves down.

- A **right rotation** at a node moves its **left** child up into its place. The node needs a left child.
- A **left rotation** at a node moves its **right** child up into its place. The node needs a right child.

<!-- figure
title: Right rotation at Y
tree: Before :: Y{X{A@t, B@t}, C@t}
tree: After: X moved up :: X{A@t, Y{B@t, C@t}}
flow: yes
-->
```text
right rotation at Y

        Y                 X
       / \               / \
      X   C     →       A   Y
     / \                   / \
    A   B                 B   C
```
<!-- /figure -->

<!-- figure
title: Left rotation at X
tree: Before :: X{A@t, Y{B@t, C@t}}
tree: After: Y moved up :: Y{X{A@t, B@t}, C@t}
flow: yes
-->
```text
left rotation at X

        X                     Y
       / \                   / \
      A   Y        →        X   C
         / \               / \
        B   C             A   B
```
<!-- /figure -->

- Keys are in the same order before and after: A < X < B < Y < C.
- The middle subtree B changes parents: it was X's right child and becomes Y's left child (or the reverse).
- Whatever pointed to the rotated node (its parent, or the tree's root) now points to the child that moved up.
- Only a few pointers change, so a rotation is **O(1)**.

zyBooks writes a right rotation at a node in three steps:

1. Set the node's left child to its left child's right subtree (B).
2. Set the old left child's right child to the node.
3. Make the node's parent point to the old left child. If the node was the root, the old left child becomes the root.

A left rotation is the mirror image.

## AVL trees

An **AVL tree** is a BST that is **height balanced**: at every node, the heights of the left and right subtrees differ by 0 or 1. It's named for its inventors, Adelson-Velsky and Landis.

Each node's **balance factor** is

> balance factor = height of the left subtree − height of the right subtree

A one-node subtree has height 0, and a missing (null) subtree counts as height **−1**. In an AVL tree every balance factor is −1, 0, or 1. A node at **+2** leans too far left; at **−2**, too far right. One such node anywhere means the whole tree isn't an AVL tree.

<!-- figure
title: The BST from inserting 50, 30, 70, 20, 40, 45, with each balance factor
tree: 50 ^+2{30 ^−1{20 ^0, 40 ^−1{, 45 ^0}}, 70 ^0}
-->
```text
            50
          /    \
        30      70
       /  \
     20    40
             \
              45
```
<!-- /figure -->

| Node | Left height | Right height | Balance factor |
|---|---|---|---|
| 50 | 2 | 0 | +2: out of balance |
| 30 | 0 | 1 | −1 |
| 40 | −1 (no left child) | 0 | −1 |
| 20, 45, 70 | −1 (leaf) | −1 (leaf) | 0 |

### Storing heights in the nodes

zyBooks' AVL node stores its own subtree **height**, so a balance factor takes O(1) to compute: read the two children's heights (−1 for a null child) and subtract.

A node's height is the larger of its children's heights, plus 1. When a node is inserted or removed, only the heights on the path from its parent up to the root can change, so they're updated in that order, bottom up. Each one needs its children's heights to be right already.

Example: a tree has 26 at the root, with 12 and 38 as leaves. Insert 31 as 38's left child.

| Node | Height | Balance factor |
|---|---|---|
| 31 (new leaf) | 0 | −1 − (−1) = 0 |
| 38 | 1 (was 0) | 0 − (−1) = +1 |
| 26 | 2 (was 1) | 0 − 1 = −1 |
| 12 | 0 (unchanged) | 0 |

### Inserting into an AVL tree

zyBooks' AVL insert:

1. Insert the key as in any BST. Like zyBooks' BST, the tree holds distinct keys, so inserting a key that's already there does nothing.
2. Walk from the new node's **parent** up to the root, and **rebalance** each node on the way.

Rebalancing one node:

1. Update its height.
2. Compute its balance factor.
3. If the balance factor is +2 or −2, look at the child on the heavy side, and rotate:

| Node's balance factor | Heavy child's balance factor | Case | Fix |
|---|---|---|---|
| +2 | left child is +1 | Left-left | one **right** rotation at the node |
| +2 | left child is −1 | Left-right | **left** rotation at the left child, then **right** rotation at the node |
| −2 | right child is −1 | Right-right | one **left** rotation at the node |
| −2 | right child is +1 | Right-left | **right** rotation at the right child, then **left** rotation at the node |

The child's sign tells you the shape. When it matches the node's sign, the path to the new key is a straight line, and one rotation fixes it. When the signs are opposite, the path is a zigzag. The first rotation turns the zigzag into a straight line, and the second fixes the line.

zyBooks' code only checks for the zigzag. If the child leans the opposite way, it does the double rotation, and otherwise a single one. So a child at 0 also gets a single rotation. That can't happen right after an insert, but it can after a removal.

**Trace:** insert 50, 30, 70, 20, 40, 45 into an empty AVL tree.

1. Inserting 50, 30, 70, 20, 40 leaves every balance factor at −1, 0, or 1. No rotations.
2. Insert 45. The BST walk goes 50 → 30 → 40, and 45 becomes 40's right child.
3. Rebalance 40: height 1, balance factor −1. Fine.
4. Rebalance 30: height 2, balance factor 0 − 1 = −1. Fine.
5. Rebalance 50: height 3, balance factor 2 − 0 = **+2**. Its left child 30 is at **−1**: the left-right case.
6. Rotate left at 30. 40 moves up into 30's place, and 30 becomes 40's left child.
7. Rotate right at 50. 40 moves up to the root. 40's right child, 45, moves over to become 50's left child.

<!-- figure
tree: 40{30{20}, 50{45, 70}}
-->
```text
          40
        /    \
      30      50
     /       /  \
   20      45    70
```
<!-- /figure -->

The tree has height 2, and every balance factor is −1, 0, or 1. The balance factors drawn earlier are this same tree before the fix.

<div class="viz" data-viz="avl" markdown>

*On the site, an interactive diagram here steps through each of the four AVL cases: the insert, the balance factors, and the rotations.*

</div>

After an insert, the rotations at the first unbalanced node bring that subtree back to the height it had before the insert. The loop still calls rebalance on every node up to the root, but none of the rest needs a rotation.

Insert is **O(log n)**: one walk down to find the spot, one walk back up, and at most two O(1) rotations per node. It needs only a few temporary references, so its extra space is **O(1)**.

### Removing from an AVL tree

zyBooks' AVL remove:

1. Remove the node as in any BST. For a node with **two children**, zyBooks uses the **successor**: copy the successor's key into the node, then remove the successor node (which has at most one child).
2. Walk from the removed node's **parent** up to the root, and rebalance each node, the same way as for insert.

Unlike insert, removal can need rotations at several nodes on the way up, since a rotation can leave its subtree one level shorter. Every node with a balance factor of ±2 gets its rotations. It's still one rebalance per level, so removal is **O(log n)** time and **O(1)** extra space.

**Trace:** start from the AVL tree below and remove 10.

<!-- figure
tree: Before :: 20{10, 30{25, 35}}
tree: After removing 10 :: 30{20{, 25}, 35}
flow: yes
-->
```text
before                after removing 10

     20                     30
    /  \                   /  \
  10    30               20    35
       /  \                \
     25    35               25
```
<!-- /figure -->

1. 10 is a leaf, so it's removed.
2. Rebalance its parent, 20: left height −1, right height 1, balance factor **−2**.
3. The right child, 30, is at **0**. That isn't +1, so this isn't the zigzag case: one **left rotation** at 20.
4. 30 moves up to the root. Its old left child, 25, becomes 20's right child.
5. 20 had no parent, so the walk ends. Balance factors: 30 is +1, 20 is −1, 25 and 35 are 0.

From the same starting tree, removing **20** instead uses the successor. Go right once to 30, then left as far as possible, to 25. 25 is copied into the root, and the old 25 leaf is removed. Rebalancing 30 (balance factor −1) and then the root (−1) needs no rotations.

### How tall can an AVL tree get?

An AVL tree doesn't keep the minimum possible height. Keeping that after every change would mean rearranging much of the tree. AVL trees settle for local rotations, and zyBooks notes the worst case is still within about 1.5 times the minimum height. So the height is **O(log n)**.

More exactly, an AVL tree with n nodes has height under about 1.44 log₂ n. For 1,000 nodes, that's at most about 14 levels, against 999 for a chain. In practice AVL trees come out much closer to the minimum.

## Red-black trees

A **red-black tree** is a BST where every node is colored red or black, following these rules:

1. Every node is red or black.
2. The **root** is black.
3. A **red** node's children are both **black**: no two reds in a row on any path.
4. A null child counts as a black leaf, called a **null leaf**.
5. Every path from a node down to any of its null leaves has the **same number of black nodes**.

Null leaves aren't stored. You draw them in when you check rule 5. When zyBooks counts black nodes on a path, it counts the starting node (if black) and the null leaf at the end.

<div class="viz" data-viz="rb-tree" markdown>

```text
          13 (B)
         /      \
     8 (R)      17 (R)
     /   \       /   \
  1 (B) 11 (B) 15 (B) 25 (B)
                        \
                        27 (R)
```

</div>

Every path from 13 down to a null leaf has **3** black nodes: 13, one of 1, 11, 15, or 25, and the null leaf. No red node has a red child.

Coloring every node black only works when every null leaf is at the same depth. Most BSTs can't be made red-black trees that way.

Rules 3 and 5 together keep the tree balanced enough: the longest path (alternating red and black) can be at most twice as long as the shortest (all black). So the height is at most **2 log₂(n + 1)**: O(log n).

### Rotations in a red-black tree

Red-black trees use the same left and right rotations as AVL trees, done "at" a node. A rotation moves nodes and doesn't change any colors. The insert and remove algorithms recolor nodes in separate steps.

### Inserting into a red-black tree

Insert the key as in any BST (the tree keeps distinct keys), color the new node **red**, and then balance it. Red doesn't change any path's black count, so rule 5 still holds. Only rules 2 and 3 can break.

zyBooks' balance steps for a node, with its **parent**, **grandparent** (the parent's parent), and **uncle** (the parent's sibling):

1. If the node is the root, color it black. Done.
2. If the parent is black, nothing is broken. Done.
3. If the parent **and** the uncle are both red: color the parent and uncle black, and the grandparent red. Then balance the grandparent with these same steps, since it may now be a red node under a red parent. Done.
4. The uncle is black or null. If the node and its parent form a **zigzag**, straighten it with a rotation at the parent:
  - The node is a right child and the parent is a left child: rotate **left** at the parent.
  - The node is a left child and the parent is a right child: rotate **right** at the parent.

  The old parent is now below the node. Treat the old parent as "the node" for step 5.
5. Color the parent black and the grandparent red. Then, if the node is a left child, rotate **right** at the grandparent; otherwise rotate **left** at the grandparent.

So an insert needs either recoloring only, one rotation (a straight line), or two rotations (a zigzag).

**Trace:** insert 8, 4, 6, 2, 1 into an empty red-black tree.

| Insert | What happens | Tree afterward |
|---|---|---|
| 8 | It's the root: color it black. | 8B |
| 4 | Parent 8 is black. Nothing to do. | 8B, left child 4R |
| 6 | 6 is 4's right child; 4 is red and 8's left child. Uncle: null (black). Zigzag: rotate left at 4, so 4 is now below 6. Color 6 black and 8 red. 4 is a left child, so rotate right at 8. | 6B, children 4R and 8R |
| 2 | 2 is 4's left child. Parent 4 and uncle 8 are both red: color them black and 6 red. Balance 6: it's the root, so color it black. | 6B, children 4B and 8B; 2R under 4 |
| 1 | 1 is 2's left child. Parent 2 is red, uncle (4's right child) is null. Straight line: color 2 black and 4 red. 1 is a left child, so rotate right at 4. | below |

<!-- figure
tree: 6@b{2@b{1@r, 4@r}, 8@b}
-->
```text
            6 (B)
           /     \
       2 (B)     8 (B)
       /   \
    1 (R)  4 (R)
```
<!-- /figure -->

Every path from 6 to a null leaf has 3 black nodes, and no red node has a red child.

### Removing from a red-black tree

zyBooks' red-black remove:

1. If the node has **two children**, zyBooks uses the **predecessor** (the largest key in the left subtree: go left once, then right as far as possible). Save the predecessor's key, remove the predecessor node with these same steps, then copy the saved key into the node. Done.
2. If the node is **black**, first **prepare for removal**: restructure the tree so taking one black node off its paths won't break rule 5.
3. Remove the node with the plain BST removal. It has at most one child here.
4. If the root ended up red, color it black.

zyBooks' AVL removal uses the successor, but its red-black removal uses the predecessor. Removing a red node never needs preparation, since it doesn't change any path's black count.

Preparing to remove a black node checks six cases in order. In the table, "sibling" means the sibling of the node being prepared. After any case that rotates, look the sibling up again.

1. **The node is red, or it's the root.**
  - Do nothing, and stop.
2. **The sibling is red.**
  - Swap colors so the sibling turns black and the parent turns red.
  - Rotate at the parent in the node's direction: left when the node is on the left, right when it's on the right.
  - Keep checking the cases below.
3. **The parent is black, and both of the sibling's children are black.**
  - Make the sibling red.
  - The missing black has moved up a level, so run these cases again on the **parent**, and stop here.
4. **The parent is red, and both of the sibling's children are black.**
  - Swap colors: the parent becomes black and the sibling red. Stop.
5. **The node is on the left; the sibling's inner (left) child is red and its outer (right) child is black.**
  - Make the sibling red and that inner child black.
  - Rotate right at the sibling, so the red child is now on the outside.
  - Keep checking.
6. **The node is on the right; the sibling's inner (right) child is red and its outer (left) child is black.**
  - The mirror of case 5: make the sibling red and that inner child black, then rotate left at the sibling.
  - Keep checking.

If none of cases 1, 3, or 4 stopped it, finish with:

1. Give the sibling the parent's color, then make the parent black.
2. Make the sibling's outer child black (its right child when the node is on the left, its left child when the node is on the right), and rotate at the parent in the node's direction. The sibling moves up into the parent's place.

A null child counts as black in every check.

**Trace 1:** remove 20 from a tree of three black nodes: 30 at the root, 20 and 40 as its children.

1. 20 is black, so prepare it. Case 1: no, it's black and has a parent.
2. Case 2: the sibling 40 is black. No.
3. Case 3: the parent 30 is black, and 40's children are both null (black). Yes: color 40 red, then prepare 30.
4. Preparing 30: case 1, it's the root. Stop.
5. Remove 20. The tree is 30 (black) with right child 40 (red). Every path has 2 black nodes.

**Trace 2:** remove 20 from this tree. Every path from 30 has 3 black nodes.

<!-- figure
tree: Before :: 30@b{20@b, 40@b{35@r}}
tree: After case 5 (rotate right at 40) :: 30@b{20@b, 35@b{, 40@r}}
tree: After the final steps, with 20 removed :: 35@b{30@b, 40@b}
flow: yes
-->
```text
before                 after case 5               after the final steps,
                       (rotate right at 40)       with 20 removed

     30 (B)                30 (B)                       35 (B)
    /      \              /      \                     /      \
 20 (B)   40 (B)       20 (B)   35 (B)              30 (B)   40 (B)
          /                         \
       35 (R)                      40 (R)
```
<!-- /figure -->

1. Case 1: 20 is black with a parent. No.
2. Case 2: sibling 40 is black. No.
3. Cases 3 and 4: 40's left child, 35, is red. No.
4. Case 5: 40's left child is red, its right child is null (black), and 20 is a left child. Yes: color 40 red and 35 black, and rotate right at 40. The sibling is now 35.
5. Case 6: 20 isn't a right child. No.
6. Final steps: 35 takes the parent's color (black), and the parent 30 is colored black. 20 is a left child, so color 35's right child (40) black and rotate left at 30.
7. Remove 20, now a leaf under 30. Every path from 35 has 3 black nodes again.

Removal is **O(log n)**: a walk down, then at most a few recolorings and rotations per level on the way back up.

## Subtree key counts

The chapter's labs add a **subtree key count** to each node of an AVL tree and a red-black tree: how many keys sit in the subtree below and including that node. A node's count is 1 + its left child's count + its right child's count (a null child counts 0).

Like an AVL height, the counts have to be updated after anything that changes a subtree: an insert, a remove, or a rotation.

With the counts, you can find the **nth key** in sorted order, with n starting at **0** for the smallest key, in O(log n) instead of walking the whole tree. Start at the root. Let L be the left child's count:

- n < L: the key is in the left subtree. Go left, same n.
- n = L: this node holds it.
- n > L: go right, with n − (L + 1).

**Trace:** find the key at n = 3 in this tree. Counts are in brackets.

<!-- figure
tree: 14 ^[8]{7 ^[4]{3 ^[1], 10 ^[2]{, 12 ^[1]}}, 22 ^[3]{18 ^[1], 27 ^[1]}}
-->
```text
               14 [8]
             /        \
         7 [4]        22 [3]
        /     \       /     \
     3 [1]  10 [2]  18 [1]  27 [1]
               \
              12 [1]
```
<!-- /figure -->

1. At 14, L = 4. 3 < 4: go left, n stays 3.
2. At 7, L = 1. 3 > 1: go right, n = 3 − 2 = 1.
3. At 10, L = 0. 1 > 0: go right, n = 1 − 1 = 0.
4. At 12, L = 0. 0 = 0: the key is **12**.

Check: in sorted order the keys are 3, 7, 10, 12, ..., and 12 is at position 3 counting from 0.

## AVL or red-black?

| Feature | AVL tree | Red-black tree |
|---|---|---|
| Balance rule | Subtree heights differ by at most 1 | The five color rules |
| Stored in each node | Its subtree height | Its color |
| Height | O(log n): within about 1.5 times the minimum | O(log n): at most 2 log₂(n + 1) |
| Search, insert, remove | O(log n) | O(log n) |
| Two-children removal uses (zyBooks) | Successor | Predecessor |
| Rotations | More, to keep the stricter balance | Fewer; mostly recoloring |
| Best for | Searching more than changing | Frequent inserts and removes (used by many standard libraries' sorted maps and sets) |

## Big-O summary

| Operation | AVL tree | Red-black tree | Plain BST, worst case |
|---|---|---|---|
| Search | O(log n) | O(log n) | O(n) |
| Insert | O(log n) | O(log n) | O(n) |
| Remove | O(log n) | O(log n) | O(n) |
| One rotation | O(1) | O(1) | |
| Compute a balance factor from stored heights | O(1) | | |
| Find the nth key, with subtree key counts | O(log n) | O(log n) | O(n) |

Insert and remove in both trees use O(1) extra space: a fixed number of temporary references.

## Questions

- **6.1** Balance factors. Keys 40, 20, 60, 10, 30, 25 were inserted into a **plain** BST (no rebalancing), in that order.

  | Node | Balance factor |
  |---|---|
  | 40 | |
  | 20 | |
  | 30 | |
  | 60 | |

  <!-- answer:6.1a-d table: 2 | +2; -1 | −1; 1 | +1; 0 -->

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

  - **10, 20, 30:** a chain going right; 10 is at −2 and its right child 20 is at −1. Right-right case: a **left** rotation at 10.
  - **30, 20, 10:** a chain going left; 30 is at +2 and its left child 20 is at +1. Left-left case: a **right** rotation at 30.
  - **30, 10, 20:** 30 is at +2, but its left child 10 is at −1: a zigzag, the **left-right** case. Rotate left at 10, then right at 30.
  - **50, 30, 70, 60, 80, 75:** 75 becomes 80's left child. Walking up, 80 is at +1 and 70 at −1, and 50 is at −2 (right height 2, left 0). 50's right child 70 is at −1, the same sign: right-right, a **left** rotation at 50, and 70 becomes the root.

  </details>

- **6.3** AVL insert, start to finish. Insert 40, 20, 60, 10, 30, 25 into an empty **AVL** tree.

  **a)** Which key is the root afterward?

  <!-- answer:6.3a blanks: 30 -->

  **b)** What is the tree's height?

  <!-- answer:6.3b blanks: 2 -->

  <details>
  <summary>Answer</summary>

  - Inserting 25 makes 40's balance factor +2 (question 6.1), and its left child 20 is at −1: a left-right case. Rotate left at 20, then right at 40.
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
  - It's the number of **black** nodes that matches on every path. Red counts can differ.
  - The longest path is at most twice the shortest, so the height is at most 2 log₂(n + 1).

  </details>

- **6.5** Red-black insert. A new red node's parent is red, and its uncle is also red. What happens next?

  A. Rotate at the grandparent and stop.

  B. Recolor the parent and uncle black and the grandparent red, then check the grandparent.

  C. Color the new node black and stop.

  <!-- answer:6.5 choice: B -->

  <details>
  <summary>Answer</summary>

  **B.** A red uncle means recoloring is enough locally. The grandparent turning red may break rule 3 one level up, so the balance steps repeat there. Rotations are for a black or null uncle.

  </details>

- **6.6** AVL removal. Keys 60, 40, 80, 30, 50, 70, 90, 55 were inserted into an empty AVL tree, which gave this tree with no rotations:

  <!-- figure
  tree: 60{40{30, 50{, 55}}, 80{70, 90}}
  -->
  ```text
            60
          /    \
        40      80
       /  \    /  \
     30    50 70   90
             \
              55
  ```
  <!-- /figure -->

  **a)** Remove 60, using zyBooks' AVL removal. Which key is at the root afterward?

  <!-- answer:6.6a blanks: 70 -->

  **b)** Next, remove 90 from that result. Which rotation fixes the tree?

  <!-- answer:6.6b blanks: [Left, Right, Left-right, Right-left] => Left-right -->

  **c)** Which key is at the root after removing 90?

  <!-- answer:6.6c blanks: 50 -->

  <details>
  <summary>Answer</summary>

  - **a)** 60 has two children, so zyBooks' AVL removal uses the successor: right once to 80, then left to **70**. 70 is copied into the root and the old 70 leaf is removed. Rebalancing 80 (−1) and the root (+1) needs no rotation.
  - **b)** Removing 90 leaves 80 as a leaf. The root, 70, now has left height 2 and right height 0: **+2**. Its left child 40 has left height 0 and right height 1: **−1**. Opposite signs make a zigzag: **left-right**. Rotate left at 40, then right at 70.
  - **c)** The left rotation at 40 moves 50 up; the right rotation at 70 moves 50 to the root. **50** ends up with 40 (holding 30) on its left and 70 (holding 55 and 80) on its right.

  </details>

- **6.7** Red-black insert, start to finish. Insert 15, 10, 5, 20, 25, 22 into an empty red-black tree.

  **a)** Which key is at the root afterward?

  <!-- answer:6.7a blanks: 10 -->

  **b)** What color is 20 afterward?

  <!-- answer:6.7b blanks: [Red, Black] => Red -->

  **c)** How many rotations did all six inserts take in total?

  <!-- answer:6.7c blanks: 2 -->

  <details>
  <summary>Answer</summary>

  - 15 becomes the black root. 10 goes under a black parent: nothing to do.
  - 5: parent 10 is red, uncle (15's right) is null. A straight line on the left: color 10 black and 15 red, rotate right at 15. **Rotation 1.** 10 is the root, with red 5 and 15.
  - 20: parent 15 and uncle 5 are both red. Color them black and 10 red; balancing 10, the root, colors it black again.
  - 25: parent 20 is red, uncle (15's left) is null. A straight line on the right: color 20 black and 15 red, rotate left at 15. **Rotation 2.** 20 now has 15 and 25 below it, both red.
  - 22: becomes 25's left child. Parent 25 and uncle 15 are both red: color them black and 20 red. Balancing 20: its parent 10 is black, so stop.
  - **a)** **10**. **b)** **Red**, from the last recoloring. **c)** **2**.

  </details>

- **6.8** Red-black removal. Remove 50 from this red-black tree, using zyBooks' algorithm.

  <!-- figure
  tree: 50@b{30@r{20@b, 40@b}, 70@b}
  -->
  ```text
             50 (B)
            /      \
        30 (R)    70 (B)
        /    \
    20 (B)  40 (B)
  ```
  <!-- /figure -->

  **a)** Which key ends up in the node that held 50?

  <!-- answer:6.8a blanks: 40 -->

  **b)** While the node being taken out of the tree is prepared for removal, which case stops the checks?

  <!-- answer:6.8b blanks: [Case 1, Case 2, Case 3, Case 4, Case 5, Case 6] => Case 4 -->

  **c)** What color is 30 afterward?

  <!-- answer:6.8c blanks: [Red, Black] => Black -->

  <details>
  <summary>Answer</summary>

  - **a)** 50 has two children, and zyBooks' red-black removal uses the **predecessor**: left once to 30, then right as far as possible, to **40**. The 40 node is removed, then 40 is copied into the root.
  - **b)** The 40 node is black, so it's prepared first. Case 1: no, it's black with a parent. Case 2: its sibling 20 is black. Case 3: the parent 30 is red. **Case 4:** the parent is red and both of 20's children are null (black). Color 30 black and 20 red, and stop.
  - **c)** **Black**, from case 4. The final tree is 40 (black) at the root, 30 (black) with red 20 on the left, and 70 (black) on the right. Every path has 3 black nodes.

  </details>

- **6.9** Subtree key counts. Each node stores its subtree key count.

  <!-- figure
  tree: 33{17{9, 25}, 48{41, 56{52}}}
  -->
  ```text
            33
          /    \
        17      48
       /  \    /  \
      9   25  41   56
                  /
                52
  ```
  <!-- /figure -->

  **a)** What is the subtree key count stored at 17?

  <!-- answer:6.9a blanks: 3 -->

  **b)** Which key does the nth-key search return for n = 5, with n starting at 0 for the smallest key?

  <!-- answer:6.9b blanks: 48 -->

  <details>
  <summary>Answer</summary>

  - **a)** 17's subtree holds 17, 9, and 25: **3**.
  - **b)** At 33, the left count is 3. 5 > 3, so go right with n = 5 − 4 = 1. At 48, the left count (41) is 1. 1 = 1, so the answer is **48**. Check: the sorted keys are 9, 17, 25, 33, 41, 48, ..., and 48 is at position 5.

  </details>
