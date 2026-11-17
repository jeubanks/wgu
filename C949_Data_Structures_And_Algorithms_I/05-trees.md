# 5. Trees

A tree stores data in a hierarchy instead of a line. A binary search tree puts that shape to work: every comparison throws away one side of the tree, so a search can skip most of the data, the way binary search skips half a sorted list.

## Binary trees

A **binary tree** is made of nodes, where each node has up to two children: a **left child** and a **right child**.

```text
              50            ← root (depth 0)
            /    \
          25      75        ← depth 1
         /  \    /  \
       10   30  60   90     ← depth 2
           /
         27                 ← depth 3, a leaf
```

| Term | Meaning | In the tree above |
|---|---|---|
| **Root** | The one node with no parent, at the top | 50 |
| **Parent, child** | A node and the nodes directly below it | 25 is the parent of 10 and 30 |
| **Leaf** | A node with no children | 10, 27, 60, 90 |
| **Internal node** | A node with at least one child | 50, 25, 75, 30 |
| **Edge** | The link between a parent and a child | 7 edges for 8 nodes |
| **Ancestors** | The parent, its parent, and so on up to the root | 30, 25, and 50 for 27 |
| **Depth** of a node | Edges from the root down to it | 27 has depth 3 |
| **Level** | All the nodes at one depth | Level 1 is 25 and 75 |
| **Height** of the tree | The largest depth of any node: edges on the longest root-to-leaf path | 3 |

A tree with just one node has height 0. (By the same rule, an empty tree is usually given height −1.)

### Tree shapes

<div class="viz" data-viz="tree-shapes" markdown>

*On the site, a drawing here shows a full, a complete, and a perfect binary tree.*

</div>

| Shape | Rule |
|---|---|
| **Full** | Every node has 0 or 2 children, never 1. |
| **Complete** | Every level is full except possibly the last, and the last level's nodes are as far left as possible. |
| **Perfect** | Every internal node has 2 children, and every leaf is at the same depth. A perfect tree is also full and complete. |
| **Balanced** | For every node, the heights of its left and right subtrees differ by at most 1. (Chapter 6.) |

A complete tree has no gaps when you read it level by level, which is why a heap ([chapter 7](07-heaps-treaps.md)) can store one in an array.

### Where trees are used

- **File systems:** folders contain files and other folders.
- **Binary space partitioning (BSP):** a game or graphics engine splits space into regions, then splits those again, so it only has to check the objects near the camera.
- **Search trees** for fast lookup, which is the rest of this chapter.

## Binary search trees (BSTs)

A **binary search tree** is a binary tree with an ordering rule, for every node:

- every key in its **left** subtree is **smaller**, and
- every key in its **right** subtree is **larger**.

The rule applies to whole subtrees, not just children. In the tree above, 27 is in the left subtree of 50, so it must be less than 50, and it is.

### Search

Start at the root. If the key matches, you're done. If it's smaller, go left; if it's larger, go right. Stop when you find it, or when you step off the tree (a null child), which means it isn't there.

```text
search for 27:  50 → 27 < 50, go left → 25 → 27 > 25, go right → 30 → 27 < 30, go left → 27 found
search for 65:  50 → go right → 75 → go left → 60 → go right → null: not in the tree
```

Each step goes down one level, so a search makes at most **height + 1** comparisons: O(h).

### Insert

Search for the new key. Where the search steps off the tree, put the new node there, as a leaf. Inserting 27 into the tree above (before 27 was there) follows 50 → 25 → 30, then 30's left child is null, so 27 becomes 30's left child. O(h).

### Remove

Find the node, then:

| The node has | What happens |
|---|---|
| **No children** (a leaf) | Remove it: its parent's pointer becomes null. |
| **One child** | Its child takes its place: the parent points straight to the child. |
| **Two children** | Copy in its **successor** (the smallest key in its right subtree: go right once, then left as far as possible), then remove the successor from the right subtree. The successor has no left child, so that second removal is one of the easy cases. |

Removing 25 from the tree above: its successor is 27 (right once to 30, then left to 27). 27 replaces 25, and the old 27 leaf goes away. The tree's preorder becomes 50, 27, 10, 30, 75, 60, 90.

Some books use the **predecessor** instead (the largest key in the left subtree). Either keeps the BST rule.

### Height depends on insertion order

The same keys can make very different trees:

```text
insert 4, 2, 6, 1, 3, 5, 7            insert 1, 2, 3, 4, 5, 6, 7

         4                             1
       /   \                            \
      2     6                            2
     / \   / \                            \
    1   3 5   7                            3 ...  (a chain down to 7)

height 2                               height 6
```

| Shape | Height for n nodes | Search, insert, remove |
|---|---|---|
| As balanced as possible | ⌊log₂ n⌋ | O(log n) |
| A chain (keys inserted in sorted order) | n − 1 | O(n) |

So a plain BST is O(log n) on average and O(n) in the worst case. Balanced trees (chapter 6) fix the worst case.

<div class="viz" data-viz="bst" markdown>

*On the site, an interactive diagram here inserts random keys into a BST, searches for and removes keys step by step, and animates the four traversals.*

</div>

### Traversals

A **traversal** visits every node once: O(n). The name says where the node itself goes:

| Traversal | Order | For the tree above |
|---|---|---|
| **Inorder** | left subtree, **node**, right subtree | 10, 25, 27, 30, 50, 60, 75, 90 |
| **Preorder** | **node**, left subtree, right subtree | 50, 25, 10, 30, 27, 75, 60, 90 |
| **Postorder** | left subtree, right subtree, **node** | 10, 27, 30, 25, 60, 90, 75, 50 |
| **Level order** | level by level, left to right (uses a queue) | 50, 25, 75, 10, 30, 60, 90, 27 |

An inorder traversal of a BST always gives the keys in **sorted order**. Preorder is how you'd copy a tree (parents before children), and postorder how you'd delete one (children before parents).

### Recursion and parent pointers

BST algorithms are naturally recursive: searching a tree is searching one of its subtrees, and the base case is an empty subtree. The traversals above are each three lines of recursion.

Some BSTs also store a **parent pointer** in each node. It makes moving up the tree O(1) (handy for finding a successor without starting from the root), at the cost of one more pointer to update on every insert and remove.

## Tries

A **trie** (said "try") stores strings by their characters. Each edge is one character, so every word is a path from the root, and words with the same start share the start of their path. A node is marked when a word ends there.

```text
words: cat, car, cart, do, dog

        (root)
        /    \
       c      d
       |      |
       a      o*        * = a word ends here
      / \     |
     t*  r*   g*
         |
         t*
```

8 nodes below the root hold all five words, because `ca` and `car` and `do` are shared.

- **Insert, search:** O(m) for a word of length m, however many words are stored.
- **Prefix search** is the strength: every word starting with `ca` is below the `c → a` path. That's how autocomplete works.

## Big-O summary

| Operation | Balanced BST | Unbalanced BST (worst case) |
|---|---|---|
| Search | O(log n) | O(n) |
| Insert | O(log n) | O(n) |
| Remove | O(log n) | O(n) |
| Find the minimum or maximum (go left or right as far as possible) | O(log n) | O(n) |
| Any traversal | O(n) | O(n) |

Best case for a search: O(1), when the key is the root. A trie's search and insert are O(m) for a key of length m.

## Questions

- **5.1** Tree vocabulary. Use this tree:

  ```text
            M
          /   \
         D     R
        / \     \
       B   H     W
          /
         F
  ```

  | Question | Answer |
  |---|---|
  | The root | |
  | How many leaves | |
  | The tree's height | |
  | The depth of F | |
  | The parent of H | |

  <!-- answer:5.1a-e table: M; 3; 3; 3; D -->

  <details>
  <summary>Answer</summary>

  - The root is **M**. The leaves are B, F, and W: **3**.
  - The longest root-to-leaf path is M → D → H → F, 3 edges: height **3**, and F's depth is **3**.
  - H's parent is **D**.

  </details>

- **5.2** Shapes. Is each tree full, complete, and perfect?

  ```text
  Tree A          Tree B          Tree C
     1               1               1
    / \             / \             / \
   2   3           2   3           2   3
                  /               / \
                 4               4   5
  ```

  | Tree | Full? | Complete? | Perfect? |
  |---|---|---|---|
  | A | | | |
  | B | | | |
  | C | | | |

  <!-- answer:5.2a-i table [Yes, No] [Yes, No] [Yes, No]: Yes; Yes; Yes; No; Yes; No; Yes; Yes; No -->

  <details>
  <summary>Answer</summary>

  - **A:** every node has 0 or 2 children, every level is full, and both leaves are at depth 1: full, complete, and perfect.
  - **B:** node 2 has one child, so it isn't full. The last level is filled from the left, so it's complete. Not perfect.
  - **C:** every node has 0 or 2 children, so it's full. The last level is filled from the left, so it's complete. Leaves are at depths 1 and 2, so it isn't perfect.

  </details>

- **5.3** Build a BST by inserting 50, 25, 75, 10, 30, 60, 90, 27, in that order, into an empty tree.

  **a)** What is its height?

  <!-- answer:5.3a blanks: 3 -->

  **b)** What is its postorder traversal? Separate the keys with commas.

  <!-- answer:5.3b blanks: 10, 27, 30, 25, 60, 90, 75, 50 | 10,27,30,25,60,90,75,50 -->

  **c)** Which keys does a search for 65 compare against, in order?

  <!-- answer:5.3c blanks: 50, 75, 60 | 50,75,60 -->

  <details>
  <summary>Answer</summary>

  - **a)** 27 hangs below 30, below 25, below 50: depth **3**, the deepest node.
  - **b)** Left subtree (10, then 27, 30, 25), right subtree (60, 90, 75), then the root: **10, 27, 30, 25, 60, 90, 75, 50**.
  - **c)** 65 > 50: right to 75. 65 < 75: left to 60. 65 > 60: right, which is null. **50, 75, 60**, and 65 isn't there.

  </details>

- **5.4** Removing from a BST. Start each time from the tree in 5.3.

  **a)** Remove 25, which has two children. Which key replaces it?

  <!-- answer:5.4a blanks: 27 -->

  **b)** Remove 10, a leaf. What is the preorder traversal afterward? Separate the keys with commas.

  <!-- answer:5.4b blanks: 50, 25, 30, 27, 75, 60, 90 | 50,25,30,27,75,60,90 -->

  <details>
  <summary>Answer</summary>

  - **a)** The successor: right once to 30, then left as far as possible, to **27**.
  - **b)** 10 just disappears: **50, 25, 30, 27, 75, 60, 90**.

  </details>

- **5.5** Height and cost.

  **a)** What is the smallest possible height of a binary tree with 1,000 nodes?

  <!-- answer:5.5a blanks: 9 -->

  **b)** Keys 1 to 1,000 are inserted into a BST in increasing order. What is the Big-O of searching it?

  <!-- answer:5.5b blanks: [O(1), O(log n), O(n), O(n log n)] => O(n) -->

  **c)** Which traversal lists a BST's keys in sorted order?

  <!-- answer:5.5c blanks: [Preorder, Inorder, Postorder, Level order] => Inorder -->

  <details>
  <summary>Answer</summary>

  - **a)** ⌊log₂ 1000⌋ = **9**: a tree of height 9 holds up to 2¹⁰ − 1 = 1,023 nodes.
  - **b)** **O(n).** Each new key is bigger than all the others, so the tree is a chain of height 999.
  - **c)** **Inorder**: left (smaller), node, right (larger).

  </details>

- **5.6** Tries. A trie holds `sun`, `sum`, `sung`, and `so`.

  **a)** How many nodes are below the root?

  <!-- answer:5.6a blanks: 6 -->

  **b)** What is the Big-O of searching a trie for a word of length m?

  <!-- answer:5.6b blanks: [O(1), O(log n), O(m), O(n)] => O(m) -->

  <details>
  <summary>Answer</summary>

  - **a)** s → u → n, m (both under u), g (under n), and o (under s): s, u, n, m, g, o is **6** nodes.
  - **b)** **O(m)**: one step per character, however many words the trie holds.

  </details>
