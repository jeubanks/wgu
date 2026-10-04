"""Lesson 3: Hash tables.

Run `python lesson3.py` to check your work (`--demo` also runs the lesson code).
"""
from _checker import need, run


# ---------------------------------------------------------------- lesson code
class ChainingHashTable:
    def __init__(self, size=11):
        self.buckets = [[] for _ in range(size)]
        self.count = 0

    def _index(self, key):
        return hash(key) % len(self.buckets)

    def put(self, key, value):                 # O(1) average
        bucket = self.buckets[self._index(key)]
        for pair in bucket:
            if pair[0] == key:
                pair[1] = value                # update existing key
                return
        bucket.append([key, value])
        self.count += 1
        if self.count / len(self.buckets) > 0.75:
            self._resize()

    def get(self, key):                        # O(1) average
        for k, v in self.buckets[self._index(key)]:
            if k == key:
                return v
        raise KeyError(key)

    def remove(self, key):
        bucket = self.buckets[self._index(key)]
        for i, (k, _) in enumerate(bucket):
            if k == key:
                bucket.pop(i)
                self.count -= 1
                return
        raise KeyError(key)

    def _resize(self):                         # O(n), but rare
        old = [pair for bucket in self.buckets for pair in bucket]
        self.buckets = [[] for _ in range(len(self.buckets) * 2 + 1)]
        self.count = 0
        for k, v in old:
            self.put(k, v)


EMPTY_SINCE_START = None
EMPTY_AFTER_REMOVAL = object()


class LinearProbingTable:
    def __init__(self, size=11):
        self.table = [EMPTY_SINCE_START] * size

    def insert(self, key):
        n = len(self.table)
        start = key % n
        for i in range(n):
            j = (start + i) % n
            if self.table[j] is EMPTY_SINCE_START or self.table[j] is EMPTY_AFTER_REMOVAL:
                self.table[j] = key
                return j
        raise OverflowError('table full')

    def search(self, key):
        n = len(self.table)
        start = key % n
        for i in range(n):
            j = (start + i) % n
            if self.table[j] is EMPTY_SINCE_START:
                return None            # key was never placed past here
            if self.table[j] == key:
                return j
        return None

    def remove(self, key):
        j = self.search(key)
        if j is not None:
            self.table[j] = EMPTY_AFTER_REMOVAL


def demo():
    t = ChainingHashTable()
    for word in ('apple', 'pear', 'plum'):
        t.put(word, len(word))
    t.put('pear', 99)
    print(t.get('pear'), t.count)              # 99 3
    p = LinearProbingTable()
    print([p.insert(k) for k in (20, 31, 42)])  # [9, 10, 0]
    p.remove(31)
    print(p.search(42))                         # 0: probe passes the removed slot


# ------------------------------------------------------------------ exercises

# 3.1 Trace (paper first). A 10-slot table uses key % 10 with linear probing.
# Which slot does each of 15, 25, 35, 6, 16 land in? List the slots in order.
TRACE_3_1 = None   # e.g. [5, ?, ?, ?, ?]


class QuadraticProbingTable(LinearProbingTable):
    """3.2 Probe (key % n + i*i) % n instead of (key % n + i) % n."""

    def insert(self, key):
        raise NotImplementedError


def string_hash(s, size):
    """3.3 Polynomial hash: h = h * 31 + ord(ch), mod size each step."""
    raise NotImplementedError


def first_duplicate(items):
    """3.4 First item seen twice, in O(n) with a set. None if no duplicate."""
    raise NotImplementedError


def two_sum(nums, target):
    """3.5 Index pair (i, j) with nums[i] + nums[j] == target, one pass with a dict."""
    raise NotImplementedError


# --------------------------------------------------------------------- checks
def check_3_1():
    """3.1 trace linear probing"""
    assert list(need(TRACE_3_1)) == [5, 6, 7, 8, 9], f'{TRACE_3_1} is not right'
    t = LinearProbingTable(10)
    assert [t.insert(k) for k in (15, 25, 35, 6, 16)] == list(TRACE_3_1)


def check_3_2():
    """3.2 QuadraticProbingTable"""
    qp = QuadraticProbingTable(11)
    assert [qp.insert(k) for k in (20, 31, 42)] == [9, 10, 2]


def check_3_3():
    """3.3 string_hash"""
    assert string_hash('abc', 101) == (((97 * 31 + 98) * 31 + 99) % 101)
    assert string_hash('abc', 101) != string_hash('cba', 101)
    assert 0 <= string_hash('a long string of text', 13) < 13


def check_3_4():
    """3.4 first_duplicate"""
    assert first_duplicate([3, 1, 4, 1, 5, 9, 3]) == 1
    assert first_duplicate([1, 2, 3]) is None


def check_3_5():
    """3.5 two_sum"""
    assert two_sum([2, 7, 11, 15], 9) == (0, 1)
    assert two_sum([3, 2, 4], 6) == (1, 2)
    assert two_sum([1, 2], 7) is None


def check_3_6():
    """3.6 load factor after resizing (uses the lesson's ChainingHashTable)"""
    big = ChainingHashTable(3)
    for i in range(100):
        big.put(i, i * i)
    assert big.get(57) == 3249 and big.count == 100
    assert big.count / len(big.buckets) <= 0.75


CHECKS = [check_3_1, check_3_2, check_3_3, check_3_4, check_3_5, check_3_6]

if __name__ == '__main__':
    run(CHECKS, demo)
