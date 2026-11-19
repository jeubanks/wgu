# 5. Trees

A tree stores data in a hierarchy instead of a line. A binary search tree uses that shape to search quickly. Each comparison rules out one side of the tree, so a search skips most of the data, the way binary search skips half of a sorted list.

This page follows zyBooks chapter 5: binary tree terms, where trees are used, binary search trees (search, insert, remove, traversal, height), parent references, recursion, and tries.

## Binary trees

A **binary tree** is made of nodes, where each node has up to two children: a **left child** and a **right child**.

<!-- figure
tree: 62{31{15, 47{, 52}}, 84{73, 96}}
levels: root, depth 0 | depth 1 | depth 2 | depth 3 (52 is a leaf)
-->
```text
              62            ← root (depth 0)
            /    \
          31      84        ← depth 1
         /  \    /  \
       15   47  73   96     ← depth 2
              \
               52           ← depth 3, a leaf
```
<!-- /figure -->

| Term | Meaning | In the tree above |
|---|---|---|
| **Root** | The one node with no parent, at the top | 62 |
| **Parent, child** | A node and the nodes directly below it | 31 is the parent of 15 and 47 |
| **Leaf** | A node with no children | 15, 52, 73, 96 |
| **Internal node** | A node with at least one child | 62, 31, 84, 47 |
| **Edge** | The link between a parent and a child | 7 edges for 8 nodes |
| **Ancestors** | The parent, its parent, and so on up to the root | 47, 31, and 62 for 52 |
| **Descendants** | The children, their children, and so on down | 15, 47, and 52 for 31 |
| **Subtree** | Any node plus all of its descendants. That node is the subtree's root. | 47 and 52 form the subtree rooted at 47 |
| **Depth** of a node | Edges from the root down to it | 52 has depth 3 |
| **Level** | All the nodes at one depth | Level 1 is 31 and 84 |
| **Height** of the tree | The largest depth of any node | 3 |

A tree with just one node has height 0. That one node is both the root and a leaf. zyBooks gives an empty tree (no nodes) height −1, which is what the height algorithm below returns for a null subtree.

Every tree is a subtree of itself: it's the subtree rooted at its own root.

### Tree shapes

<div class="viz" data-viz="tree-shapes" markdown>

*On the site, a drawing here shows a full, a complete, and a perfect binary tree.*

</div>

| Shape | Rule |
|---|---|
| **Full** | Every node has 0 or 2 children, never 1. |
| **Complete** | Every level is full except possibly the last, and the last level's nodes are as far left as possible. |
| **Perfect** | Every internal node has 2 children, and every leaf is at the same level. A perfect tree is also full and complete. |
| **Balanced** | For every node, the heights of its left and right subtrees differ by at most 1. (Chapter 6.) |

A complete tree has no gaps when you read it level by level, which is why a heap ([chapter 7](07-heaps-treaps.md)) can store one in an array.

## Where trees are used

- **File systems:** the root directory is the root node. Files are always leaves. A directory is an internal node unless it's empty, and then it's a leaf too. A directory can hold any number of entries, so a file system tree isn't a binary tree: each node needs a variable number of children.
- **Binary space partitioning (BSP):** a BSP tree splits a region of space into two parts, then splits each part again. Each node stores one region's boundary and the objects inside it. A game or graphics engine looks up the camera's position in the tree and skips every region the screen doesn't touch, so it only checks the nearby objects. The splits don't have to be down the middle, and BSP works in 3-D as well as 2-D.
- **Storing collections:** most trees in the course (BSTs, AVL and red-black trees, heaps) hold a collection of keys in a shape that makes search, insert, and remove fast.

## Binary search trees (BSTs)

A **binary search tree** is a binary tree with an ordering rule, for every node:

- every key in its **left** subtree is **smaller**, and
- every key in its **right** subtree is **larger**.

The rule applies to whole subtrees, not just children. In the tree above, 52 is in the left subtree of 62, so it must be less than 62, and it is. It's also in the right subtree of 31 and of 47, so it must be greater than both, and it is.

In zyBooks, a BST holds **distinct keys**: no duplicates.

### Search

Start at the root. If the key matches, you're done. If it's smaller, go left; if it's larger, go right. Stop when you find it, or when you step off the tree (a null child), which means it isn't there.

<!-- figure
tree: Search for 52: 62, 31, 47, 52, found :: 62@h{31@h{15, 47@h{, 52@h}}, 84{73, 96}}
tree: Search for 40: 62, 31, 47, then a null child :: 62@h{31@h{15, 47@h{"null"@x, 52}}, 84{73, 96}}
-->
```text
search for 52:  62 → 52 < 62, go left → 31 → 52 > 31, go right → 47 → 52 > 47, go right → 52 found
search for 40:  62 → go left → 31 → go right → 47 → 40 < 47, go left → null: not in the tree
```
<!-- /figure -->

- **Search for 52:** 52 < 62, go left to 31. 52 > 31, go right to 47. 52 > 47, go right: 52 found.
- **Search for 40:** 40 < 62, go left to 31. 40 > 31, go right to 47. 40 < 47, go left: a null child, so 40 isn't in the tree.

zyBooks says a search **visits** a node when it reads that node's key. The search for 52 visits 4 nodes. Each step goes down one level, so a search makes at most **height + 1** comparisons: O(h).

A tree with the smallest possible height keeps that number small. A BST of 1,000,000 nodes can have height 19, so a search needs at most 20 comparisons. A linked list of the same keys can need 1,000,000.

### Successor and predecessor

A BST orders its keys from smallest to largest. A node's **successor** is the next key in that order, and its **predecessor** is the one before.

To find a node's successor:

1. If the node has a right subtree, go right once, then left as far as possible. That node is the successor. It can be the right child itself, when the right child has no left child.
2. If it has no right subtree, go up until you come up from a **left** child. That parent is the successor. If you reach the root without doing that, the node is the largest key and has no successor.

The predecessor is the mirror image: left once, then right as far as possible; or, with no left subtree, go up until you come up from a right child.

In the tree above:

- Successor of 47: right once to 52, which has no left child. **52.**
- Successor of 52: no right subtree. Go up to 47 (came from its right), to 31 (came from its right), to 62 (came from its **left**). **62.**
- Predecessor of 73: no left subtree. Go up to 84 (came from its left), to 62 (came from its **right**). **62.**
- Successor of 96: it's the largest key, so none.

### Insert

Search for the new key. Where the search steps off the tree, put the new node there, as a leaf.

Inserting 40 into the tree above:

1. 40 < 62, and 62 has a left child: move to 31.
2. 40 > 31, and 31 has a right child: move to 47.
3. 40 < 47, and 47's left child is null: 40 becomes 47's left child.

Inserting into an empty tree makes the new node the root.

zyBooks splits this into two methods. **insert_node** does the walk above. **insert_key** first searches for the key, does nothing if it's already there, and otherwise makes a new node and calls insert_node. That check is how the tree keeps its keys distinct.

Insert visits one node per level: O(h) time, which is O(log n) when the tree is short and O(n) when it's a chain. It uses a few variables however big the tree is: O(1) extra space.

### Remove

Find the node, then:

| The node has | What happens |
|---|---|
| **No children** (a leaf) | Its parent's pointer to it becomes null. If it was the root, the tree is now empty. |
| **One child** | Its parent points straight to that child instead. If it was the root, the child becomes the root. |
| **Two children** | Find its **successor** (right once, then left as far as possible). Copy the successor's key into the node. Then remove the successor from the right subtree. The successor has no left child, so that second removal is one of the two easy cases. |

zyBooks always uses the successor for the two-children case.

Removing each node from the tree above, starting fresh each time:

- **Remove 15 (a leaf):** 31's left pointer becomes null. Preorder afterward: 62, 31, 47, 52, 84, 73, 96.
- **Remove 47 (one child):** 31's right pointer now goes to 52. Preorder afterward: 62, 31, 15, 52, 84, 73, 96.
- **Remove 31 (two children):**
  1. Find the successor: right once to 47. 47 has no left child, so 47 is the successor.
  2. Copy 47 into 31's node. The tree now has 47 in two places.
  3. Remove the old 47 from the right subtree. It has one child, 52, so 52 moves up into its place.

  Preorder afterward: 62, 47, 15, 52, 84, 73, 96.

In the worst case, remove walks from the root to a leaf to find the node, then down again to find the successor. That's still O(h) time, with O(1) extra space.

### Height depends on insertion order

The same keys can make very different trees:

<!-- figure
tree: Insert 4, 2, 6, 1, 3, 5, 7: height 2 :: 4{2{1, 3}, 6{5, 7}}
tree: Insert 1, 2, 3, 4, 5, 6, 7: height 6 :: 1{, 2{, 3{, 4{, 5{, 6{, 7}}}}}}
-->
```text
insert 4, 2, 6, 1, 3, 5, 7            insert 1, 2, 3, 4, 5, 6, 7

         4                             1
       /   \                            \
      2     6                            2
     / \   / \                            \
    1   3 5   7                            3 ...  (a chain down to 7)

height 2                               height 6
```
<!-- /figure -->

| Shape | Height for n nodes | Search, insert, remove |
|---|---|---|
| As short as possible (every level full except maybe the last) | ⌊log₂ n⌋ | O(log n) |
| A chain (keys inserted in sorted order) | n − 1 | O(n) |

Inserting keys in random order tends to keep the height near the minimum. Inserting them sorted, or nearly sorted, gives a height near n − 1. If you have all the keys before you start, shuffling them first keeps the tree short.

So a plain BST is O(log n) on average and O(n) in the worst case. Balanced trees (chapter 6) fix the worst case.

### Computing the height

zyBooks computes a tree's height recursively:

- A null subtree has height −1.
- Otherwise, the height is 1 + the larger of the left and right subtrees' heights.

The −1 makes a leaf come out as 1 + max(−1, −1) = 0. The function calls itself once per node and once per null child, so it's O(n). The order of the two recursive calls doesn't matter.

Tracing it on the tree at the top of the page. Each call finishes after both of its children's calls:

| Call | Left height | Right height | Returns |
|---|---|---|---|
| height(15) | −1 (null) | −1 (null) | 0 |
| height(52) | −1 | −1 | 0 |
| height(47) | −1 (null) | 0 (52) | 1 |
| height(31) | 0 (15) | 1 (47) | 2 |
| height(73) | −1 | −1 | 0 |
| height(96) | −1 | −1 | 0 |
| height(84) | 0 (73) | 0 (96) | 1 |
| height(62) | 2 (31) | 1 (84) | **3** |

<div class="viz" data-viz="bst" markdown>

*On the site, an interactive diagram here inserts random keys into a BST, searches for and removes keys step by step, and animates the four traversals.*

</div>

### Traversals

A **traversal** visits every node once: O(n). To **visit** a node means to do something with it: print its key, add it to a list, count it. zyBooks passes that action in as a **visitor** object, so one traversal function can print, count, or collect without being rewritten.

The name says where the node itself goes:

| Traversal | Order | For the tree at the top of the page |
|---|---|---|
| **Inorder** | left subtree, **node**, right subtree | 15, 31, 47, 52, 62, 73, 84, 96 |
| **Reverse inorder** | right subtree, **node**, left subtree | 96, 84, 73, 62, 52, 47, 31, 15 |
| **Preorder** | **node**, left subtree, right subtree | 62, 31, 15, 47, 52, 84, 73, 96 |
| **Postorder** | left subtree, right subtree, **node** | 15, 52, 47, 31, 73, 96, 84, 62 |

An inorder traversal of a BST always gives the keys in **sorted order**, smallest first. Reverse inorder gives them largest first. Preorder is how you'd copy a tree (parents before children), and postorder how you'd delete one (children before parents).

A preorder traversal of a BST also lists the keys in an order that rebuilds the same tree when you insert them one by one: each parent goes in before its children.

zyBooks' chapter 5 covers those four. A fifth, **level order**, goes level by level, left to right, using a queue: 62, 31, 84, 15, 47, 73, 96, 52. It's the same idea as breadth-first search on a graph.

## Parent references

A BST node can also store a **parent** reference. Balanced trees (chapter 6) use it to move up to a node's parent, grandparent, or sibling in O(1).

The downside is extra bookkeeping. Every insert and remove that relinks a child also has to set that child's parent reference.

- **Insert:** after making the new node a child of some node P, set the new node's parent to P. A new root gets parent null.
- **Remove:** zyBooks uses a helper, **replace_child(current_child, new_child)**, on the removed node's parent. It swaps whichever child pointer points at current_child to point at new_child, and sets new_child's parent (when new_child isn't null). If the node being removed is the root, the new root's parent is set to null instead.

Removing 47 from the tree at the top, with parent references: 47's parent is 31, so the tree calls 31.replace_child(47, 52). 31's right pointer now goes to 52, and 52's parent becomes 31.

> [!TIP]
> [Python Tutor](https://pythontutor.com/visualize.html) can draw a small BST as you build it. Paste a `Node` class and a recursive insert, then step through to see which way each key goes and when the recursion returns.

## BST recursion

Searching a tree comes down to searching one of its subtrees, so BST algorithms can be written recursively.

**Recursive search** takes a node and a key. It has two base cases:

1. The node is null: return null (not found).
2. The key matches the node's key: return the node.

Otherwise it calls itself on the left child (key is smaller) or the right child (key is larger). Searching the tree at the top for 52 makes 4 calls: on 62, 31, 47, and 52.

**Get parent** finds a node's parent without parent references. It walks down like a search, but at each node it checks the node's **children**: if either child is the target node, the current node is the parent. The base cases are a null subtree (return null) and finding the parent. The root has no parent, so asking for the root's parent returns null.

**Recursive insert** compares the new key with the current node. If the child on that side is null, the new node goes there. Otherwise it calls itself on that child.

**Recursive remove** finds the node and its parent, then handles the same cases as the table above. For two children it copies the successor's key, then calls itself to remove the successor, which has at most one child. So one removal makes at most two remove calls.

## Tries

A **trie** (said "try"), also called a **prefix tree**, stores a set of strings. Each node below the root stands for one character, and a node has at most one child per character. A string is a path from the root. Strings that start the same share the start of their path.

In zyBooks, each string's end is marked by its own **terminal node**: an extra child, with no character, under the string's last character. Every inserted string has exactly one terminal node, and zyBooks counts the terminal nodes as nodes.

<!-- figure
nary: Words cat, car, cart, do, dog. $ marks the end of a word :: root{c{a{t{$}, r{$, t{$}}}}, d{o{$, g{$}}}}
-->
```text
words: cat, car, cart, do, dog          $ = terminal node

            (root)
           /      \
          c        d
          |        |
          a        o
         / \      / \
        t   r    $   g
        |  / \       |
        $ $   t      $
              |
              $
```
<!-- /figure -->

That's 8 character nodes plus 5 terminal nodes: 13 nodes below the root.

### Insert

Start at the root. For each character, move to the child for that character, making the child first if it doesn't exist. After the last character, add a terminal node if there isn't one.

Inserting `card` into the trie above:

1. `c`: the root has a `c` child. Move to it.
2. `a`: `c` has an `a` child. Move to it.
3. `r`: `a` has an `r` child. Move to it.
4. `d`: `r` has no `d` child. Make one and move to it.
5. Add a terminal node under `d`.

Two new nodes. Inserting a string that's already in the trie makes none.

### Search

Start at the root and follow one child per character. If a child is missing, the string isn't there. After the last character, return the terminal child, or null if there is none.

Searching the trie above for `ca` reaches the `a` node, but `a` has no terminal child, so `ca` isn't in the trie, even though `cat` and `car` are.

### Remove

Removing a string deletes its terminal node, then deletes each node above it, bottom up, that is left with no children. It stops at the first node that still has a child, and it never deletes the root. zyBooks does this recursively: go down one character per call, remove the terminal node at the bottom, then on the way back up remove any child that now has 0 children.

Removing `dog` from the trie above:

1. Walk down: root → `d` → `o` → `g`.
2. At `g`, the string has ended. Remove `g`'s terminal node.
3. Back at `o`: its child `g` now has 0 children, so remove `g`.
4. Back at `d`: its child `o` still has a child (the terminal node for `do`), so keep it.
5. Back at the root: its child `d` still has a child, so keep it.

Two nodes are removed, and `do` is still in the trie. Removing a string that isn't there changes nothing.

### Cost

Each node finds a child by character in O(1) (a dictionary lookup). So insert, search, and remove are all **O(m)** for a string of length m, however many strings the trie holds. Tries are best at **prefix search**: every word starting with `ca` is below the `c → a` path. Autocomplete and predictive text work this way.

## Big-O summary

| Operation | Balanced BST | Unbalanced BST (worst case) |
|---|---|---|
| Search | O(log n) | O(n) |
| Insert | O(log n) | O(n) |
| Remove | O(log n) | O(n) |
| Find the minimum or maximum (go left or right as far as possible) | O(log n) | O(n) |
| Find a successor or predecessor | O(log n) | O(n) |
| Any traversal | O(n) | O(n) |
| Compute the height (recursive) | O(n) | O(n) |

Search, insert, and remove are all O(h) for a tree of height h, and use O(1) extra space when written as loops. Best case for a search: O(1), when the key is the root. A trie's insert, search, and remove are O(m) for a string of length m.

## Questions

- **5.1** Tree vocabulary. Use this tree:

  <!-- figure
  tree: M{D{B, H{F}}, R{, W}}
  -->
  ```text
            M
          /   \
         D     R
        / \     \
       B   H     W
          /
         F
  ```
  <!-- /figure -->

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

  <!-- figure
  tree: Tree A :: 1{2, 3}
  tree: Tree B :: 1{2{4}, 3}
  tree: Tree C :: 1{2{4, 5}, 3}
  -->
  ```text
  Tree A          Tree B          Tree C
     1               1               1
    / \             / \             / \
   2   3           2   3           2   3
                  /               / \
                 4               4   5
  ```
  <!-- /figure -->

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

- **5.3** Build a BST by inserting 64, 31, 82, 17, 45, 70, 96, 40, in that order, into an empty tree.

  **a)** What is its height?

  <!-- answer:5.3a blanks: 3 -->

  **b)** What is its postorder traversal? Separate the keys with commas.

  <!-- answer:5.3b blanks: 17, 40, 45, 31, 70, 96, 82, 64 | 17,40,45,31,70,96,82,64 -->

  **c)** Which keys does a search for 75 compare against, in order?

  <!-- answer:5.3c blanks: 64, 82, 70 | 64,82,70 -->

  <details>
  <summary>Answer</summary>

  - **a)** 40 hangs below 45, below 31, below 64: depth **3**, the deepest node.
  - **b)** Left subtree (17, then 40, 45, 31), right subtree (70, 96, 82), then the root: **17, 40, 45, 31, 70, 96, 82, 64**.
  - **c)** 75 > 64: right to 82. 75 < 82: left to 70. 75 > 70: right, which is null. **64, 82, 70**, and 75 isn't there.

  </details>

- **5.4** Removing from a BST. Start each time from the tree in 5.3.

  **a)** Remove 31, which has two children. Which key replaces it?

  <!-- answer:5.4a blanks: 40 -->

  **b)** Remove 17, a leaf. What is the preorder traversal afterward? Separate the keys with commas.

  <!-- answer:5.4b blanks: 64, 31, 45, 40, 82, 70, 96 | 64,31,45,40,82,70,96 -->

  <details>
  <summary>Answer</summary>

  - **a)** The successor: right once to 45, then left as far as possible, to **40**. 40 is copied into 31's node, and the old 40 leaf is removed.
  - **b)** 17 just disappears: **64, 31, 45, 40, 82, 70, 96**.

  </details>

- **5.5** Height and cost.

  **a)** What is the smallest possible height of a binary tree with 1,000 nodes?

  <!-- answer:5.5a blanks: 9 -->

  **b)** Keys 1 to 1,000 are inserted into a BST in increasing order. What is the Big-O of searching it?

  <!-- answer:5.5b blanks: [O(1), O(log n), O(n), O(n log n)] => O(n) -->

  **c)** Which traversal lists a BST's keys in sorted order, smallest first?

  <!-- answer:5.5c blanks: [Preorder, Inorder, Postorder, Reverse inorder] => Inorder -->

  <details>
  <summary>Answer</summary>

  - **a)** ⌊log₂ 1000⌋ = **9**: a tree of height 9 holds up to 2¹⁰ − 1 = 1,023 nodes.
  - **b)** **O(n).** Each new key is bigger than all the others, so the tree is a chain of height 999.
  - **c)** **Inorder**: left (smaller), node, right (larger). Reverse inorder gives largest first.

  </details>

- **5.6** Tries. A zyBooks trie, with a terminal node for each string, holds `sun`, `sum`, `sung`, and `so`.

  **a)** Counting terminal nodes, how many nodes are below the root?

  <!-- answer:5.6a blanks: 10 -->

  **b)** What is the Big-O of searching a trie for a word of length m?

  <!-- answer:5.6b blanks: [O(1), O(log n), O(m), O(n)] => O(m) -->

  <details>
  <summary>Answer</summary>

  - **a)** Character nodes: s → u → n, m (both under u), g (under n), and o (under s). That's s, u, n, m, g, o: 6. Each of the 4 strings adds one terminal node, under n, m, g, and o. 6 + 4 = **10**.
  - **b)** **O(m)**: one step per character, however many words the trie holds.

  </details>

- **5.7** Successors and predecessors. Use this BST:

  <!-- figure
  tree: 45{22{12, 35{30, 40}}, 70{58{, 64}, 88}}
  -->
  ```text
              45
            /    \
          22      70
         /  \    /  \
       12   35  58   88
           /  \   \
         30   40   64
  ```
  <!-- /figure -->

  **a)** What is the successor of 40?

  <!-- answer:5.7a blanks: 45 -->

  **b)** What is the successor of 22?

  <!-- answer:5.7b blanks: 30 -->

  **c)** What is the predecessor of 30?

  <!-- answer:5.7c blanks: 22 -->

  <details>
  <summary>Answer</summary>

  - **a)** 40 has no right subtree. Go up: to 35 (came from its right), to 22 (came from its right), to 45 (came from its **left**). The successor is **45**.
  - **b)** 22 has a right subtree. Right once to 35, then left as far as possible, to 30. The successor is **30**.
  - **c)** 30 has no left subtree. Go up: to 35 (came from its left), to 22 (came from its **right**). The predecessor is **22**.

  The inorder traversal confirms all three: 12, 22, 30, 35, 40, 45, 58, 64, 70, 88.

  </details>

- **5.8** Computing height. Build a BST by inserting 40, 20, 60, 10, 70, 5, 65, 1, in that order, into an empty tree. Use zyBooks' recursive height function, where a null subtree has height −1.

  **a)** What does the function return for the root?

  <!-- answer:5.8a blanks: 4 -->

  **b)** What does it return for the node with key 60?

  <!-- answer:5.8b blanks: 2 -->

  **c)** The same 8 keys are inserted into a new BST in decreasing order: 70, 65, 60, 40, 20, 10, 5, 1. What is that tree's height?

  <!-- answer:5.8c blanks: 7 -->

  <details>
  <summary>Answer</summary>

  The tree:

  <!-- figure
  tree: 40{20{10{5{1}}}, 60{, 70{65}}}
  -->
  ```text
              40
            /    \
          20      60
         /          \
       10            70
       /            /
      5           65
     /
    1
  ```
  <!-- /figure -->

  - **a)** Leaves (1 and 65) return 0. 5 returns 1 + max(0, −1) = 1, 10 returns 2, and 20 returns 3. On the right, 70 returns 1 + max(0, −1) = 1 and 60 returns 1 + max(−1, 1) = 2. The root returns 1 + max(3, 2) = **4**.
  - **b)** **2**, from part a: 60 → 70 → 65 is 2 edges.
  - **c)** Each key is smaller than all before it, so each goes to the left of the last: a chain of 8 nodes, height 8 − 1 = **7**.

  </details>

- **5.9** Trie removal. A zyBooks trie, with a terminal node for each string, holds `pen`, `pet`, `pets`, and `peg`. Do the parts in order, each on the result of the one before.

  **a)** Remove `pet`. How many nodes are removed?

  <!-- answer:5.9a blanks: 1 -->

  **b)** Then remove `pets`. How many nodes are removed?

  <!-- answer:5.9b blanks: 3 -->

  **c)** Then insert `pe`. How many new nodes are made?

  <!-- answer:5.9c blanks: 1 -->

  <details>
  <summary>Answer</summary>

  - **a)** `pet`'s terminal node, under t, is removed. t still has the child s, so nothing else goes: **1**.
  - **b)** `pets`'s terminal node, under s, is removed. Then s has 0 children, so it's removed. Then t has 0 children, so it's removed. e still has n and g, so it stays: **3**.
  - **c)** p and e already exist. e has no terminal child, so one is added: **1**.

  </details>
