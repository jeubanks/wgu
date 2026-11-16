# Lesson 5: Searching and sorting

Linear search checks items one by one: O(n). Binary search needs a sorted list. It compares the target with the middle item and throws away the half that can't hold it, so it takes O(log n) comparisons.

The lesson code has five sorts:

| Sort | Time | Notes |
|---|---|---|
| Bubble | O(n²) | Swaps neighbors that are out of order. Stable. |
| Selection | O(n²) | Always, even on sorted input. |
| Insertion | O(n²) | O(n) when the input is already nearly sorted. Stable. |
| Merge | O(n log n) | Splits in half, sorts each half, merges. Needs O(n) extra space. Stable. |
| Quicksort | O(n log n) on average, O(n²) at worst | Partitions around a pivot, then sorts each side in place. |

A stable sort keeps items with equal keys in their original order. That matters when you sort by one field after another.

Radix sort doesn't compare items at all: it sorts numbers digit by digit, using buckets. Following the course's Big-O worksheet, this kit lists it as O(n). Textbooks often write O(nk), where k is the number of digits.

Your file: `c949-practice/lesson5.py`. Run `python lesson5.py` to check your answers, and `python lesson5.py --demo` to also run the lesson code.

<!-- lesson-code -->
<details>
<summary>Lesson code</summary>

```python
def binary_search(a, target):                  # O(log n), a must be sorted
    lo, hi = 0, len(a) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if a[mid] == target:
            return mid
        if a[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1


def bubble_sort(a):                             # O(n^2), stable
    n = len(a)
    for i in range(n - 1):
        swapped = False
        for j in range(n - 1 - i):
            if a[j] > a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]
                swapped = True
        if not swapped:                         # best case O(n)
            break


def selection_sort(a):                          # O(n^2) always
    for i in range(len(a) - 1):
        m = i
        for j in range(i + 1, len(a)):
            if a[j] < a[m]:
                m = j
        a[i], a[m] = a[m], a[i]


def insertion_sort(a):                          # O(n^2), O(n) if nearly sorted
    for i in range(1, len(a)):
        key, j = a[i], i - 1
        while j >= 0 and a[j] > key:
            a[j + 1] = a[j]
            j -= 1
        a[j + 1] = key


def merge_sort(a):                              # O(n log n), O(n) extra
    if len(a) <= 1:
        return a
    mid = len(a) // 2
    left, right = merge_sort(a[:mid]), merge_sort(a[mid:])
    out, i, j = [], 0, 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:                 # <= keeps it stable
            out.append(left[i])
            i += 1
        else:
            out.append(right[j])
            j += 1
    return out + left[i:] + right[j:]


def quicksort(a, lo=0, hi=None):                # avg O(n log n), worst O(n^2)
    if hi is None:
        hi = len(a) - 1
    if lo >= hi:
        return
    pivot = a[hi]                               # Lomuto partition, last item as pivot
    i = lo
    for j in range(lo, hi):
        if a[j] < pivot:
            a[i], a[j] = a[j], a[i]
            i += 1
    a[i], a[hi] = a[hi], a[i]
    quicksort(a, lo, i - 1)
    quicksort(a, i + 1, hi)


def demo():
    data = [29, 10, 14, 37, 13]
    for sort in (bubble_sort, selection_sort, insertion_sort, quicksort):
        d = data[:]
        sort(d)
        print(sort.__name__, d)                 # all [10, 13, 14, 29, 37]
    print('merge_sort', merge_sort(data))
    print(binary_search([10, 13, 14, 29, 37], 29))  # 3
    # 5.7: quicksort on random vs already-sorted input
    sys.setrecursionlimit(10000)
    r = [random.random() for _ in range(2000)]
    for label, d in (('random', r[:]), ('sorted', sorted(r))):
        start = time.perf_counter()
        quicksort(d)
        print(f'quicksort {label}: {time.perf_counter() - start:.4f}s')
```

</details>
<!-- /lesson-code -->

## Exercises

- **5.1**\
  **In:** `TRACE_5_1_SELECTION`, `TRACE_5_1_INSERTION` *(paper first)*

  Sort `[5, 2, 9, 1, 6]` with the lesson's `selection_sort`, and again with its `insertion_sort`.

  - For each sort, write the array after each pass of the outer loop.
  - That's 4 arrays per sort.

  <!-- solution:5.1 -->
  <details>
  <summary>Hint</summary>

  - Selection sort: each pass finds the smallest item left and swaps it into the next place.
  - Insertion sort: each pass takes the next item and shifts it left into the sorted part.
  - Write down the array after every pass, even a pass where nothing moves.

  </details>

  <details>
  <summary>Solution</summary>

  ```python
  TRACE_5_1_SELECTION = [[1, 2, 9, 5, 6], [1, 2, 9, 5, 6], [1, 2, 5, 9, 6], [1, 2, 5, 6, 9]]

  TRACE_5_1_INSERTION = [[2, 5, 9, 1, 6], [2, 5, 9, 1, 6], [1, 2, 5, 9, 6], [1, 2, 5, 6, 9]]
  ```

  </details>
  <!-- /solution -->

- **5.2**\
  **In:** `TRACE_5_2` *(paper first)*

  Binary search for 23 in this list. Which values does `a[mid]` take, in order?

  ```python
  SEARCH_LIST = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
  ```

  <!-- solution:5.2 -->
  <details>
  <summary>Hint</summary>

  - `mid = (lo + hi) // 2` works on indexes, not values.
  - Write lo, hi, and mid for each step.

  </details>

  <details>
  <summary>Solution</summary>

  ```python
  SEARCH_LIST = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]

  TRACE_5_2 = [16, 56, 23]
  ```

  </details>
  <!-- /solution -->

- **5.3**\
  **In:** `binary_search_rec(a, target, lo=0, hi=None)`

  Write binary search recursively, with no loops.

  - Return the target's index, or -1 if it isn't in the list.

  <!-- solution:5.3 -->
  <details>
  <summary>Hint</summary>

  - Two base cases: the range is empty, or `a[mid]` is the target.
  - Recurse on one half by moving `lo` or `hi` past `mid`.

  </details>

  <details>
  <summary>Solution</summary>

  ```python
  def binary_search_rec(a, target, lo=0, hi=None):
      """5.3 Recursive binary search; -1 if missing."""
      if hi is None:
          hi = len(a) - 1
      if lo > hi:
          return -1
      mid = (lo + hi) // 2
      if a[mid] == target:
          return mid
      if a[mid] < target:
          return binary_search_rec(a, target, mid + 1, hi)
      return binary_search_rec(a, target, lo, mid - 1)
  ```

  </details>
  <!-- /solution -->

- **5.4**\
  **In:** `count_inversions(a)`

  An inversion is a pair of indexes `i < j` where `a[i] > a[j]`.
  Return `(sorted_list, count)`: the sorted list, and how many inversions `a` has.

  - It must run in O(n log n), so checking every pair is too slow.
  - Example: `[2, 4, 1, 3, 5]` has 3 inversions.

  <!-- solution:5.4 -->
  <details>
  <summary>Hint</summary>

  - Build it on merge sort: count the inversions in each half, then the ones the merge finds.
  - When the merge takes an item from the right half, how many items still waiting in the left half are bigger than it?

  </details>

  <details>
  <summary>Solution</summary>

  ```python
  def count_inversions(a):
      """5.4 Return (sorted_list, count) where count = pairs i < j with a[i] > a[j]. O(n log n)."""
      if len(a) <= 1:
          return list(a), 0
      mid = len(a) // 2
      left, x = count_inversions(a[:mid])
      right, y = count_inversions(a[mid:])
      out, i, j, inv = [], 0, 0, x + y
      while i < len(left) and j < len(right):
          if left[i] <= right[j]:
              out.append(left[i])
              i += 1
          else:
              out.append(right[j])
              j += 1
              inv += len(left) - i             # right[j] jumps every remaining left item
      return out + left[i:] + right[j:], inv
  ```

  </details>
  <!-- /solution -->

- **5.5**\
  **In:** `radix_sort(a)`

  Sort a list of non-negative integers with least-significant-digit (LSD) radix sort.

  - Return a new sorted list.

  <!-- solution:5.5 -->
  <details>
  <summary>Hint</summary>

  - Sort by the ones digit, then the tens digit, and so on, using 10 buckets.
  - Keep each bucket in the order items arrived, and read the buckets out from 0 to 9.
  - Stop once you've passed the largest number's highest digit.

  </details>

  <details>
  <summary>Solution</summary>

  ```python
  def radix_sort(a):
      """5.5 LSD radix sort for non-negative ints. Return a new sorted list."""
      exp = 1
      while a and max(a) // exp > 0:
          buckets = [[] for _ in range(10)]
          for x in a:
              buckets[(x // exp) % 10].append(x)
          a = [x for b in buckets for x in b]
          exp *= 10
      return list(a)
  ```

  </details>
  <!-- /solution -->

- **5.6**\
  **In:** `merge_sort_key(a, key)`

  Write a stable merge sort that orders items by `key(item)`.

  - Return a new list.
  - Items with equal keys must keep their original order.

  <!-- solution:5.6 -->
  <details>
  <summary>Hint</summary>

  - Start from the lesson's `merge_sort`, and compare `key(x)` instead of `x`.
  - Stable means items with equal keys keep their input order. On a tie, which half holds the earlier item?

  </details>

  <details>
  <summary>Solution</summary>

  ```python
  def merge_sort_key(a, key):
      """5.6 Stable merge sort by key(item). Return a new list."""
      if len(a) <= 1:
          return list(a)
      m = len(a) // 2
      left, right = merge_sort_key(a[:m], key), merge_sort_key(a[m:], key)
      out, i, j = [], 0, 0
      while i < len(left) and j < len(right):
          if key(left[i]) <= key(right[j]):       # <= takes the left item on ties
              out.append(left[i])
              i += 1
          else:
              out.append(right[j])
              j += 1
      return out + left[i:] + right[j:]
  ```

  </details>
  <!-- /solution -->

- **5.7**\
  **In:** nothing to fill in *(no check)*

  Run `python lesson5.py --demo`. It times `quicksort` on 2,000 random numbers, and then on the same numbers already sorted.

  - Why is it so much slower on the sorted list?

  <!-- solution:5.7 -->
  <details>
  <summary>Hint</summary>

  - Look at which item the lesson's `quicksort` picks as its pivot.
  - On sorted input, how many items end up on each side of that pivot?

  </details>
  <!-- /solution -->

  <details>
  <summary>Answer</summary>

  The lesson's `quicksort` uses the last item as its pivot. On sorted input, that's always the largest item left, so every partition puts all the other items on one side and none on the other. Each call only shrinks the range by one, so the work adds up to n + (n - 1) + ... + 1, which is O(n²), and the recursion goes n calls deep.

  Picking a random pivot, or the median of the first, middle, and last items, avoids this.

  </details>
