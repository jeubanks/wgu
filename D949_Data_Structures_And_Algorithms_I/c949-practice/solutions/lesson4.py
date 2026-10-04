"""Lesson 4: BSTs, traversals, and heaps.

Run `python lesson4.py` to check your work (`--demo` also runs the lesson code).
"""
import heapq
from collections import deque

from _checker import need, run


# ---------------------------------------------------------------- lesson code
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

# ------------------------------------------------------------------ exercises

# 4.1 Trace (paper first). Insert TREE_KEYS into an empty BST and draw it.
# Give its preorder list and its height.
TRACE_4_1_PREORDER = [40, 20, 10, 30, 25, 60, 50, 70]
TRACE_4_1_HEIGHT = 3


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


def is_bst(node, lo=float('-inf'), hi=float('inf')):
    """4.3 True if the tree is a valid BST. Pass a (lo, hi) range down."""
    if node is None:
        return True
    if not (lo <= node.key < hi):
        return False
    return is_bst(node.left, lo, node.key) and is_bst(node.right, node.key, hi)


def kth_smallest(root, k):
    """4.4 The k-th smallest key (k starts at 1)."""
    return inorder(root)[k - 1]


# 4.5 Insert 1 through 7, in order, into a new BST. What is its height?
HEIGHT_4_5 = 6

# 4.6 Trace (paper first). Insert 4, 10, 3, 5, 1 into an empty MaxHeap.
# Write the array after the LAST insert.
TRACE_4_6 = [10, 5, 3, 4, 1]


def k_largest(nums, k):
    """4.7 The k largest values, largest first, using heapq holding at most k items."""
    heap = []
    for x in nums:
        heapq.heappush(heap, x)
        if len(heap) > k:
            heapq.heappop(heap)              # drop the smallest of the k+1
    return sorted(heap, reverse=True)


# --------------------------------------------------------------------- checks
def check_4_1():
    """4.1 trace BST preorder and height"""
    t = build_bst(TREE_KEYS)
    assert list(need(TRACE_4_1_PREORDER)) == preorder(t.root), 'preorder is off'
    assert need(TRACE_4_1_HEIGHT) == height(t.root), 'height is off (a leaf is 0)'


def check_4_2():
    """4.2 level_order"""
    t = build_bst(TREE_KEYS)
    assert level_order(t.root) == [40, 20, 60, 10, 30, 50, 70, 25]
    assert level_order(None) == []


def check_4_3():
    """4.3 is_bst"""
    assert is_bst(build_bst(TREE_KEYS).root)
    bad = TreeNode(10)
    bad.left = TreeNode(5)
    bad.left.right = TreeNode(12)   # 12 is in 10's LEFT subtree
    assert not is_bst(bad), 'checking only direct children misses this'


def check_4_4():
    """4.4 kth_smallest"""
    root = build_bst(TREE_KEYS).root
    assert kth_smallest(root, 1) == 10
    assert kth_smallest(root, 3) == 25


def check_4_5():
    """4.5 degenerate BST height"""
    assert need(HEIGHT_4_5) == height(build_bst(range(1, 8)).root)


def check_4_6():
    """4.6 trace MaxHeap"""
    h = MaxHeap()
    for x in (4, 10, 3, 5, 1):
        h.insert(x)
    assert list(need(TRACE_4_6)) == h.a, f'{TRACE_4_6} is not right'


def check_4_7():
    """4.7 k_largest"""
    assert k_largest([3, 1, 9, 7, 5, 8], 3) == [9, 8, 7]
    assert k_largest([4], 1) == [4]


CHECKS = [check_4_1, check_4_2, check_4_3, check_4_4, check_4_5, check_4_6, check_4_7]

if __name__ == '__main__':
    run(CHECKS, demo)
