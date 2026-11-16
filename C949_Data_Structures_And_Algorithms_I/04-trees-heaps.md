# Lesson 4: BSTs, traversals, and heaps

A binary search tree (BST) keeps every key in a node's left subtree smaller than the node, and every key in its right subtree larger (in the lesson's code, equal keys go right). Searching, inserting, and removing walk one path from the root down, so they take O(h), where h is the tree's height. In a balanced tree h is about log n, but a lopsided tree can be as tall as it has nodes.

Height counts edges: a single node has height 0, and an empty tree has height -1.

A traversal visits every node once, in an order you choose:

- **Inorder:** left subtree, node, right subtree.
- **Preorder:** node, left subtree, right subtree.
- **Postorder:** left subtree, right subtree, node.

A max-heap is a complete binary tree where every parent is at least as large as its children, so the largest value is always at the root. It's stored in an array with no gaps. The lesson's `MaxHeap` puts the root at index 0, so the children of index `i` are `2i + 1` and `2i + 2`. Insert and remove-max each move one value up or down one path, so both are O(log n).

Your file: `c949-practice/lesson4.py`. Run `python lesson4.py` to check your answers, and `python lesson4.py --demo` to also run the lesson code.

<!-- lesson-code -->
<details>
<summary>Lesson code</summary>

```python
class TreeNode:
    def __init__(self, key):
        self.key = key
        self.left = None
        self.right = None


class BST:
    def __init__(self):
        self.root = None

    def insert(self, key):                     # O(h)
        if self.root is None:
            self.root = TreeNode(key)
            return
        cur = self.root
        while True:
            if key < cur.key:
                if cur.left is None:
                    cur.left = TreeNode(key)
                    return
                cur = cur.left
            else:
                if cur.right is None:
                    cur.right = TreeNode(key)
                    return
                cur = cur.right

    def search(self, key):                     # O(h)
        cur = self.root
        while cur and cur.key != key:
            cur = cur.left if key < cur.key else cur.right
        return cur

    def remove(self, key):
        self.root = self._remove(self.root, key)

    def _remove(self, node, key):
        if node is None:
            return None
        if key < node.key:
            node.left = self._remove(node.left, key)
        elif key > node.key:
            node.right = self._remove(node.right, key)
        else:
            if node.left is None:
                return node.right              # 0 or 1 child: splice up
            if node.right is None:
                return node.left
            succ = node.right                  # 2 children: in-order successor
            while succ.left:
                succ = succ.left
            node.key = succ.key
            node.right = self._remove(node.right, succ.key)
        return node


def inorder(n):   return inorder(n.left) + [n.key] + inorder(n.right) if n else []    # noqa: E704
def preorder(n):  return [n.key] + preorder(n.left) + preorder(n.right) if n else []  # noqa: E704
def postorder(n): return postorder(n.left) + postorder(n.right) + [n.key] if n else []  # noqa: E704


def height(n):
    if n is None:
        return -1                              # empty tree; a leaf has height 0
    return 1 + max(height(n.left), height(n.right))


class MaxHeap:
    def __init__(self):
        self.a = []

    def insert(self, x):                       # O(log n)
        self.a.append(x)
        i = len(self.a) - 1
        while i > 0:
            parent = (i - 1) // 2
            if self.a[i] <= self.a[parent]:
                break
            self.a[i], self.a[parent] = self.a[parent], self.a[i]
            i = parent

    def remove_max(self):                      # O(log n)
        top = self.a[0]
        last = self.a.pop()
        if self.a:
            self.a[0] = last
            self._down(0)
        return top

    def _down(self, i):
        n = len(self.a)
        while True:
            left, right, big = 2 * i + 1, 2 * i + 2, i
            if left < n and self.a[left] > self.a[big]:
                big = left
            if right < n and self.a[right] > self.a[big]:
                big = right
            if big == i:
                return
            self.a[i], self.a[big] = self.a[big], self.a[i]
            i = big


def build_bst(keys):
    t = BST()
    for k in keys:
        t.insert(k)
    return t


def demo():
    t = build_bst((50, 30, 70, 20, 40, 60, 80))
    print(inorder(t.root))    # [20, 30, 40, 50, 60, 70, 80]
    print(preorder(t.root))   # [50, 30, 20, 40, 70, 60, 80]
    print(postorder(t.root))  # [20, 40, 30, 60, 80, 70, 50]
    print(height(t.root))     # 2
    t.remove(50)
    print(t.root.key)         # 60: the successor replaced the root
    h = MaxHeap()
    for x in (5, 3, 8, 1, 9, 2):
        h.insert(x)
    print(h.a)                # [9, 8, 5, 1, 3, 2]
    print(h.remove_max(), h.a)  # 9 [8, 3, 5, 1, 2]


# The tree used by exercises 4.1-4.4.
TREE_KEYS = (40, 20, 60, 10, 30, 50, 70, 25)
```

</details>
<!-- /lesson-code -->

## Exercises

Exercises 4.1 to 4.4 use the tree you get by inserting `TREE_KEYS` into an empty BST, in order:

```python
TREE_KEYS = (40, 20, 60, 10, 30, 50, 70, 25)
```

- **4.1**\
  **In:** `TRACE_4_1_PREORDER`, `TRACE_4_1_HEIGHT` *(paper first)*

  Insert `TREE_KEYS` into an empty BST and draw the tree. Then give:

  - its preorder traversal, as a list
  - its height

  <!-- solution:4.1 -->
  <details>
  <summary>Hint</summary>

  - Every insert starts at the root: smaller keys go left, larger keys go right.
  - Preorder visits a node, then its left subtree, then its right subtree.
  - Height counts edges on the longest path from the root down to a leaf. A single leaf has height 0.

  </details>

  <details>
  <summary>Solution</summary>

  ```python
  TRACE_4_1_PREORDER = [40, 20, 10, 30, 25, 60, 50, 70]

  TRACE_4_1_HEIGHT = 3
  ```

  </details>
  <!-- /solution -->

- **4.2**\
  **In:** `level_order(root)`

  Return the tree's keys level by level, top to bottom and left to right.

  - Use `collections.deque` as a queue.
  - An empty tree (`root` is None) gives `[]`.

  <!-- solution:4.2 -->
  <details>
  <summary>Hint</summary>

  - Start the queue with the root, if there is one.
  - Take nodes from the left end of the queue, and add their children left first, then right.

  </details>

  <details>
  <summary>Solution</summary>

  ```python
  def level_order(root):
      """4.2 Keys level by level, using collections.deque as a queue."""
      out, q = [], deque([root] if root else [])
      while q:
          n = q.popleft()
          out.append(n.key)
          if n.left:
              q.append(n.left)
          if n.right:
              q.append(n.right)
      return out
  ```

  </details>
  <!-- /solution -->

- **4.3**\
  **In:** `is_bst(node, lo, hi)`

  Return True if the tree is a valid BST.

  - Pass a `(lo, hi)` range down the tree as you recurse.
  - The check includes a tree whose parent-child pairs all look right, but that still breaks the BST rule.

  <!-- solution:4.3 -->
  <details>
  <summary>Hint</summary>

  - Comparing each node only with its own children isn't enough: every key in the left subtree must be smaller than the root, however deep it is.
  - Going left, the current key becomes the new upper limit. Going right, it becomes the new lower limit.

  </details>

  <details>
  <summary>Solution</summary>

  ```python
  def is_bst(node, lo=float('-inf'), hi=float('inf')):
      """4.3 True if the tree is a valid BST. Pass a (lo, hi) range down."""
      if node is None:
          return True
      if not (lo <= node.key < hi):
          return False
      return is_bst(node.left, lo, node.key) and is_bst(node.right, node.key, hi)
  ```

  </details>
  <!-- /solution -->

- **4.4**\
  **In:** `kth_smallest(root, k)`

  Return the k-th smallest key in the BST. `k` starts at 1.

  <!-- solution:4.4 -->
  <details>
  <summary>Hint</summary>

  - Which traversal visits a BST's keys in sorted order?

  </details>

  <details>
  <summary>Solution</summary>

  ```python
  def kth_smallest(root, k):
      """4.4 The k-th smallest key (k starts at 1)."""
      return inorder(root)[k - 1]
  ```

  </details>
  <!-- /solution -->

- **4.5**\
  **In:** `HEIGHT_4_5` *(paper first)*

  Insert 1, 2, 3, 4, 5, 6, 7, in that order, into a new BST.
  What is its height?

  <!-- solution:4.5 -->
  <details>
  <summary>Hint</summary>

  - Draw it. Where does each new key go, when it's larger than every key already in the tree?

  </details>

  <details>
  <summary>Solution</summary>

  ```python
  HEIGHT_4_5 = 6
  ```

  </details>
  <!-- /solution -->

- **4.6**\
  **In:** `TRACE_4_6` *(paper first)*

  Insert 4, 10, 3, 5, 1, in that order, into an empty `MaxHeap` from the lesson code.
  Give its array after the last insert.

  <!-- solution:4.6 -->
  <details>
  <summary>Hint</summary>

  - Add the new value at the end of the array, then swap it with its parent while the parent is smaller.
  - The lesson's MaxHeap keeps the root at index 0, so the parent of index `i` is `(i - 1) // 2`.

  </details>

  <details>
  <summary>Solution</summary>

  ```python
  TRACE_4_6 = [10, 5, 3, 4, 1]
  ```

  </details>
  <!-- /solution -->

- **4.7**\
  **In:** `k_largest(nums, k)`

  Return the k largest values in `nums`, largest first.

  - Use `heapq`, and never hold more than k items in the heap at once (plus one, briefly).

  <!-- solution:4.7 -->
  <details>
  <summary>Hint</summary>

  - `heapq` is a min-heap: `heap[0]` is always the smallest item.
  - When the heap grows past k items, pop one. Which one goes, and why is that the right one to drop?

  </details>

  <details>
  <summary>Solution</summary>

  ```python
  def k_largest(nums, k):
      """4.7 The k largest values, largest first, using heapq holding at most k items."""
      heap = []
      for x in nums:
          heapq.heappush(heap, x)
          if len(heap) > k:
              heapq.heappop(heap)              # drop the smallest of the k+1
      return sorted(heap, reverse=True)
  ```

  </details>
  <!-- /solution -->
