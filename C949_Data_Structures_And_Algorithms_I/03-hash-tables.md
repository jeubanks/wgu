# Lesson 3: Hash tables

A hash table stores items in an array of slots, called buckets. A hash function turns each key into a bucket number, so finding a key means computing its hash and looking in one place instead of searching everything. That's O(1) on average.

Two keys can hash to the same bucket. That's a collision, and the lesson shows two ways to handle it:

- **Chaining:** each bucket holds a list of the items that hashed there.
- **Linear probing:** each bucket holds one item. If a key's bucket is full, try the next one, and the next, until one is free.

The load factor is the number of items divided by the number of buckets. As it grows, collisions get more common and operations slow down, so the lesson's chaining table grows itself when the load factor passes 0.75.

Probing needs care when removing. The lesson marks a removed slot as "empty after removal" rather than "empty since start", so a later search keeps going past it.

Your file: `c949-practice/lesson3.py`. Run `python lesson3.py` to check your answers, and `python lesson3.py --demo` to also run the lesson code.

<!-- lesson-code -->
<details>
<summary>Lesson code</summary>

```python
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
```

</details>
<!-- /lesson-code -->

## Exercises

- **3.1**\
  **In:** `TRACE_3_1` *(paper first)*

  A 10-slot table uses `key % 10` as its hash function, with linear probing.

  Insert 15, 25, 35, 6, and 16, in that order. Which slot does each one land in?
  Give the slots as a list, in insert order.

  <!-- solution:3.1 -->
  <details>
  <summary>Hint</summary>

  - Each key starts at `key % 10`. If that slot is taken, try the next one.
  - Fill in a row of 10 slots as you go.

  </details>

  <details>
  <summary>Solution</summary>

  ```python
  TRACE_3_1 = [5, 6, 7, 8, 9]
  ```

  </details>
  <!-- /solution -->

- **3.2**\
  **In:** `class QuadraticProbingTable`

  Write `insert(key)` for a table that uses quadratic probing.

  - Attempt `i` (starting at 0) tries slot `(key % n + i*i) % n`, instead of linear probing's `(key % n + i) % n`.
  - Return the slot the key went into.
  - The class extends the lesson's `LinearProbingTable`, so `search` and `remove` are already there.

  <!-- solution:3.2 -->
  <details>
  <summary>Hint</summary>

  - Start from `LinearProbingTable.insert` in the lesson code. Only the slot formula changes.
  - `i` counts the attempts: 0, 1, 2, ... The offset is `i` squared, not `i`.

  </details>

  <details>
  <summary>Solution</summary>

  ```python
  class QuadraticProbingTable(LinearProbingTable):
      """3.2 Probe (key % n + i*i) % n instead of (key % n + i) % n."""

      def insert(self, key):
          n = len(self.table)
          for i in range(n):
              j = (key % n + i * i) % n
              if self.table[j] is EMPTY_SINCE_START or self.table[j] is EMPTY_AFTER_REMOVAL:
                  self.table[j] = key
                  return j
          raise OverflowError('no slot found')
  ```

  </details>
  <!-- /solution -->

- **3.3**\
  **In:** `string_hash(s, size)`

  Hash a string with a polynomial hash.

  - Start with `h = 0`.
  - For each character, `h = h * 31 + ord(ch)`, then take it `% size`.
  - Return `h`.

  <!-- solution:3.3 -->
  <details>
  <summary>Hint</summary>

  - Start with `h = 0` and update it once per character.
  - Take `% size` inside the loop, on every step, not only at the end.

  </details>

  <details>
  <summary>Solution</summary>

  ```python
  def string_hash(s, size):
      """3.3 Polynomial hash: h = h * 31 + ord(ch), mod size each step."""
      h = 0
      for ch in s:
          h = (h * 31 + ord(ch)) % size
      return h
  ```

  </details>
  <!-- /solution -->

- **3.4**\
  **In:** `first_duplicate(items)`

  Return the first item that appears a second time, scanning left to right.

  - O(n), using a set.
  - Return None if there's no duplicate.

  <!-- solution:3.4 -->
  <details>
  <summary>Hint</summary>

  - A set answers "have I seen this?" in O(1) on average.
  - Check before you add.

  </details>

  <details>
  <summary>Solution</summary>

  ```python
  def first_duplicate(items):
      """3.4 First item seen twice, in O(n) with a set. None if no duplicate."""
      seen = set()
      for x in items:
          if x in seen:
              return x
          seen.add(x)
      return None
  ```

  </details>
  <!-- /solution -->

- **3.5**\
  **In:** `two_sum(nums, target)`

  Return an index pair `(i, j)` where `nums[i] + nums[j] == target` and `i < j`.

  - One pass through the list, using a dict.
  - Return None if there's no such pair.

  <!-- solution:3.5 -->
  <details>
  <summary>Hint</summary>

  - For each number `x`, the partner you need is `target - x`.
  - Keep the numbers you've already passed in a dict, from value to index.

  </details>

  <details>
  <summary>Solution</summary>

  ```python
  def two_sum(nums, target):
      """3.5 Index pair (i, j) with nums[i] + nums[j] == target, one pass with a dict."""
      seen = {}
      for i, x in enumerate(nums):
          if target - x in seen:
              return (seen[target - x], i)
          seen[x] = i
      return None
  ```

  </details>
  <!-- /solution -->

- **3.6**\
  **In:** the lesson's `ChainingHashTable` *(read, no code to write)*

  Its check already passes: it tests the lesson code. Read `put` and `_resize`, then answer:

  - Starting from `ChainingHashTable(3)`, how many buckets are there after 100 different keys are put in?
  - Why can the load factor never be above 0.75 once `put` returns?

  <details>
  <summary>Answer</summary>

  - **255 buckets.** Each resize makes the table twice as big plus one, and it happens as soon as the load factor passes 0.75: 3 → 7 → 15 → 31 → 63 → 127 → 255. The last resize happens at the 96th key, since 96 / 127 is just over 0.75.
  - `put` checks the load factor right after it adds a new key, and resizes before returning if it's over 0.75. The new table has more than twice as many buckets, so the load factor drops to under half of what it was.

  </details>
