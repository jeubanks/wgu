# 2. Searching

This page is part of the **Explains Algorithms** competency. You'll learn to trace linear and binary search, say why binary search needs sorted input, and give each search's Big-O.

## Linear search

Check each item in order, from the first, until you find the key or run out of items. It works on any list, sorted or not.

```python
def linear_search(items, key):
    for i in range(len(items)):
        if items[i] == key:
            return i          # stop at the first match
    return -1                 # not there
```

**Best** O(1): the key is first. **Average** O(n): about n / 2 comparisons. **Worst** O(n): the key is last or missing.

## Binary search

Think of a printed dictionary: open near the middle, see whether your word comes before or after that page, and ignore the other half. Binary search compares the key with the middle item and drops the half that can't hold it.

The list must be **sorted**. Only then does "bigger than the middle item" mean "to the right". Unsorted, it can miss a key that's there.

### The steps

Start with `low = 0` and `high` at the last index. While `low <= high`, compute `mid = (low + high) // 2`:

- `items[mid] == key`: found, return `mid`.
- `items[mid] < key`: the key can only be right of mid, so `low = mid + 1`.
- `items[mid] > key`: the key can only be left of mid, so `high = mid - 1`.

When `low` passes `high`, the range is empty: return −1.

```python
def binary_search(items, key):
    low, high = 0, len(items) - 1
    while low <= high:
        mid = (low + high) // 2
        if items[mid] < key:
            low = mid + 1
        elif items[mid] > key:
            high = mid - 1
        else:
            return mid
    return -1
```

### A trace

Searching for 26 (faded cells are out of range). Write one line per step:

<!-- figure
array: 4 11 19 26 33 47 52 64 78
step: Step 1 | 0 8 4
step: Step 2 | 0 3 1
step: Step 3 | 2 3 2
step: Step 4 | 3 3 3
-->
```text
index    0   1   2   3   4   5   6   7   8
items    4  11  19  26  33  47  52  64  78
```
<!-- /figure -->

| Step | low | high | mid | items[mid] | Result |
|---|---|---|---|---|---|
| 1 | 0 | 8 | 4 | 33 | 26 < 33, so high = 3 |
| 2 | 0 | 3 | 1 | 11 | 26 > 11, so low = 2 |
| 3 | 2 | 3 | 2 | 19 | 26 > 19, so low = 3 |
| 4 | 3 | 3 | 3 | 26 | found: return 3 |

### Big-O

Each step halves the range, so binary search makes at most **⌊log₂ n⌋ + 1** comparisons: 20 for a million items, where linear search could need a million.

- **Best:** O(1), the first middle item is the key.
- **Average and worst:** O(log n), found late or missing.

It also needs O(1) index access; a linked list must walk to the middle, so use linear search there.

### The recursive form

```python
def binary_search(items, key, low, high):
    if low > high:
        return -1                       # base case: empty range
    mid = (low + high) // 2
    if items[mid] == key:
        return mid                      # base case: found
    if items[mid] < key:
        return binary_search(items, key, mid + 1, high)
    return binary_search(items, key, low, mid - 1)
```

Still O(log n) time, but the waiting calls use O(log n) stack memory where the loop uses O(1). See [tracing code](01-tracing-code.md) for recursion.

## Interpolation search

Binary search with a smarter guess: it uses the key's value to estimate where it should sit, like opening a phone book near the back for "W". On sorted, evenly spread values it averages O(log log n); on lopsided values the guesses go wrong, and the worst case is O(n).

## Big-O summary

| Search | Needs sorted input | Best | Average | Worst |
|---|---|---|---|---|
| Linear | No | O(1) | O(n) | O(n) |
| Binary | Yes | O(1) | O(log n) | O(log n) |
| Interpolation | Yes | O(1) | O(log log n) | O(n) |

## Questions

- **2.1** Why must the list be sorted for binary search?

  A. So the middle index can be computed with `//`

  B. So one comparison with the middle item rules out a half

  C. So the search can stop at the first match

  <!-- answer:2.1 choice: B -->

  <details>
  <summary>Answer</summary>

  - **B.** Sorted, everything right of the middle is at least as big, so one comparison rules out a half.

  </details>

- **2.2** Binary search on this sorted list:

  <!-- figure
  index: yes
  row: items | 2 8 15 21 30 36 44 59 63 70
  -->
  ```text
  index    0   1   2   3   4   5   6   7   8   9
  items    2   8  15  21  30  36  44  59  63  70
  ```
  <!-- /figure -->

  **a)** Searching for 63, which values does `items[mid]` take, in order? Separate them with commas.

  <!-- answer:2.2a blanks: 30, 59, 63 | 30,59,63 -->

  **b)** Searching for 5, which values does `items[mid]` take?

  <!-- answer:2.2b blanks: 30, 8, 2 | 30,8,2 -->

  **c)** What does the search for 5 return?

  <!-- answer:2.2c blanks: -1 | −1 -->

  <details>
  <summary>Answer</summary>

  - **a)** mid 4 (30): low = 5. mid 7 (59): low = 8. mid 8 (63): found.
  - **b)** mid 4 (30): high = 3. mid 1 (8): high = 0. mid 0 (2): low = 1.
  - **c)** low passed high: **−1**.

  </details>

- **2.3** `linear_search` on `7 3 9 3 5`.

  **a)** What does searching for 3 return?

  <!-- answer:2.3a blanks: 1 -->

  **b)** How many comparisons does searching for 6 make?

  <!-- answer:2.3b blanks: 5 -->

  <details>
  <summary>Answer</summary>

  - **a)** **1**: it returns at the first match.
  - **b)** **5**: 6 is missing, so every item is checked.

  </details>

- **2.4** At most how many comparisons does binary search make on 500 sorted items?

  <!-- answer:2.4 blanks: 9 -->

  <details>
  <summary>Answer</summary>

  - 256 ≤ 500 < 512, so ⌊log₂ 500⌋ = 8, plus 1: **9**.

  </details>

- **2.5** Give the Big-O.

  | Situation | Big-O |
  |---|---|
  | Linear search, key is first | |
  | Linear search, key missing | |
  | Binary search, key missing | |

  <!-- answer:2.5a-c table [O(1), O(log n), O(n)]: O(1); O(n); O(log n) -->

  <details>
  <summary>Answer</summary>

  - Linear: 1 comparison if the first item matches, n if missing. Binary halves the range until it's empty.

  </details>

- **2.6** Which search fits?

  | Job | Search |
  |---|---|
  | One lookup in an unsorted list | |
  | Many lookups in a large sorted Python list | |
  | A lookup in a sorted linked list | |

  <!-- answer:2.6a-c table [Linear, Binary]: Linear; Binary; Linear -->

  <details>
  <summary>Answer</summary>

  - Sorting first (O(n log n)) costs more than one O(n) scan.
  - Binary search needs sorted data and O(1) index access; a linked list has no index.

  </details>

- **2.7** What is this, and what is its worst case?

  ```python
  def find(a, x):
      lo, hi = 0, len(a) - 1
      while lo <= hi:
          m = (lo + hi) // 2
          if a[m] == x:
              return m
          if a[m] < x:
              lo = m + 1
          else:
              hi = m - 1
      return -1
  ```

  A. Linear search, O(n)

  B. Binary search, O(log n)

  C. Binary search, O(n log n)

  <!-- answer:2.7 choice: B -->

  <details>
  <summary>Answer</summary>

  - **B.** A `lo`/`hi` range, a middle check, and one end moved past the middle: binary search, halving each pass.

  </details>
