# 2. Searching

Find a key in a list: check every item, or halve a sorted list until the key turns up.

After this page you can:

- Trace linear search and binary search by hand
- Say why binary search needs sorted input
- Give each search's best, average, and worst case

## Linear search

Check each item in order, from the first, until you find the key or run out of items. It works on any list, sorted or not.

> [!IMPORTANT]
> **Key idea:** Linear search asks nothing of the data, and pays for that by possibly checking every item.

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

> [!IMPORTANT]
> **Key idea:** Binary search throws away half of what's left with every comparison, which only makes sense when the list is in order.

The list must be **sorted**. Only then does "bigger than the middle item" mean "to the right". Unsorted, it can miss a key that's there.

### The steps

`low`, `high` and `mid` are **indexes**: positions in the list, counted from 0. `low` and `high` mark the ends of the part still being searched, and `mid` is its middle.

Start with `low = 0` and `high` at the **last index**. That's one less than the length of the list, since indexes start at 0: a list of 9 items has last index 8. While `low <= high`, compute `mid = (low + high) // 2`. To work out `mid`, add `low` and `high`, then divide by 2. The `//` rounds down: with `low` 2 and `high` 3, the sum is 5, and `5 // 2` is 2. Then compare `items[mid]`, the value at that index, with the key:

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

This trace searches for 26. Each row is one check. The blue cell is the middle item being checked, and faded cells have been ruled out. The labels under a row show where `low`, `mid` and `high` point. When they point to the same cell, they're stacked.

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

Here's the same trace as a table, the way to write it on paper, with one row per check. Python's `//` divides and rounds down to a whole number: in step 2, 3 divided by 2 is 1.5, so `mid` is 1.

| Step | low | high | mid = (low + high) // 2 | items[mid] | What happens |
|---|---|---|---|---|---|
| 1 | 0 | 8 | (0 + 8) // 2 = 4 | 33 | 26 is smaller, go left: high = 3 |
| 2 | 0 | 3 | (0 + 3) // 2 = 1 | 11 | 26 is bigger, go right: low = 2 |
| 3 | 2 | 3 | (2 + 3) // 2 = 2 | 19 | 26 is bigger, go right: low = 3 |
| 4 | 3 | 3 | (3 + 3) // 2 = 3 | 26 | Found: return 3 |

Going left sets `high` to mid − 1, and going right sets `low` to mid + 1. The search returns the index, 3, not the value.

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

> [!IMPORTANT]
> **Key idea:** Interpolation search is only as good as its guesses: evenly spread values make it faster than binary search, and lopsided values make it slower.

## Big-O summary

| Search | Needs sorted input | Best | Average | Worst |
|---|---|---|---|---|
| Linear | No | O(1) | O(n) | O(n) |
| Binary | Yes | O(1) | O(log n) | O(log n) |
| Interpolation | Yes | O(1) | O(log log n) | O(n) |

## Questions

- **2.1** After each check, binary search ignores half of the remaining items. Why is that safe only when the list is sorted?

  A. In an unsorted list, `(low + high) // 2` gives the wrong middle index

  B. In an unsorted list, the search can't stop at the first match

  C. In an unsorted list, the ignored half could still hold the key

  D. In an unsorted list, the key is never at the middle index

  <!-- answer:2.1 choice: C -->

  <details>
  <summary>Answer</summary>

  - **C.** In a sorted list, every item on the ignored side is too small or too big to be the key. In an unsorted list, the key could be on either side.
  - A is wrong because the middle index depends only on `low` and `high`, not on the order of the items. B describes something any search can do, and in D the key can be anywhere.

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

  **a)** Searching for 63, which values does `items[mid]` take, in order?

  A. 30, 59, 63

  B. 36, 63

  C. 30, 44, 59, 63

  D. 30, 8, 2

  <!-- answer:2.2a choice: A -->

  **b)** Searching for 5, which values does `items[mid]` take, in order?

  A. 30, 8

  B. 36, 15, 8, 2

  C. 30, 59, 63, 70

  D. 30, 8, 2

  <!-- answer:2.2b choice: D -->

  **c)** What number does the binary search for 5 return?

  A. 0

  B. −1

  C. 1

  D. 2

  <!-- answer:2.2c choice: B -->

  <details>
  <summary>Answer</summary>

  - **a)** **A.** mid 4 (30): low = 5. mid 7 (59): low = 8. mid 8 (63): found. B rounds mid up; C sets `low = mid` and forgets the +1; D moves the wrong end.
  - **b)** **D.** mid 4 (30): high = 3. mid 1 (8): high = 0. mid 0 (2): low = 1. A stops before the last check, when low and high are both 0. C moves the wrong end.
  - **c)** **B.** low passed high, so the function returns −1. C is where low ended, not a match.

  </details>

- **2.3** Let `items = [7, 3, 9, 3, 5]`, with indexes counted from 0. Use the `linear_search` function from this page.

  **a)** Which index does `linear_search(items, 3)` return?

  A. 1

  B. 2

  C. 3

  D. 4

  <!-- answer:2.3a choice: A -->

  **b)** How many times does `linear_search(items, 6)` run the check `items[i] == key`?

  A. 3

  B. 4

  C. 5

  D. 6

  <!-- answer:2.3b choice: C -->

  <details>
  <summary>Answer</summary>

  - **a)** **A.** The 3s are at indexes 1 and 3, and the search stops at the first one, index **1**. C is the index of the last 3, and also the value searched for. B counts positions from 1, and is also how many 3s there are.
  - **b)** **C.** 6 isn't in the list, so all **5** items are checked. B stops one item short.

  </details>

- **2.4** At most how many comparisons does binary search make on 500 sorted items?

  A. 8

  B. 9

  C. 10

  D. 250

  <!-- answer:2.4 choice: B -->

  <details>
  <summary>Answer</summary>

  - **B.** 256 ≤ 500 < 512, so ⌊log₂ 500⌋ = 8, plus 1: 9. A forgets the +1; D is linear search's average.

  </details>

- **2.5** What is the Big-O of each search on a list of n items?

  **a)** Linear search, when the key is the first item

  A. O(1)

  B. O(log n)

  C. O(n)

  D. O(n log n)

  <!-- answer:2.5a choice: A -->

  **b)** Linear search, when the key isn't in the list

  A. O(1)

  B. O(log n)

  C. O(n)

  D. O(n log n)

  <!-- answer:2.5b choice: C -->

  **c)** Binary search, when the key isn't in the list

  A. O(1)

  B. O(log n)

  C. O(n)

  D. O(n log n)

  <!-- answer:2.5c choice: B -->

  <details>
  <summary>Answer</summary>

  - **a)** **A.** One comparison if the first item matches.
  - **b)** **C.** A missing key means checking all n.
  - **c)** **B.** Binary search halves the range until it's empty. C is linear search's worst case, not binary's.

  </details>

- **2.6** Pick the best search for each job.

  **a)** You need one lookup in an unsorted Python list.

  A. Linear search

  B. Binary search

  C. Sort the items first, then use binary search

  D. Either one: they cost the same

  <!-- answer:2.6a choice: A -->

  **b)** You need many lookups in a large sorted Python list.

  A. Linear search

  B. Binary search

  C. Sort the items first, then use binary search

  D. Either one: they cost the same

  <!-- answer:2.6b choice: B -->

  **c)** You need one lookup in a sorted linked list.

  A. Linear search

  B. Binary search

  C. Sort the items first, then use binary search

  D. Either one: they cost the same

  <!-- answer:2.6c choice: A -->

  <details>
  <summary>Answer</summary>

  - **a)** **A.** One scan is O(n). C's sort alone costs O(n log n), more than the scan it saves.
  - **b)** **B.** The list is sorted and can be indexed, so each lookup is O(log n) in place of O(n). C sorts a list that's already sorted.
  - **c)** **A.** Binary search jumps to the middle by index, and a linked list has no index. B forgets the cost of walking there.

  </details>

- **2.7** Read this code.

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

  **a)** Which search does it perform?

  A. Interpolation search

  B. Linear search

  C. Recursive binary search

  D. Iterative binary search

  <!-- answer:2.7a choice: D -->

  **b)** What is its worst-case Big-O on n items?

  A. O(1)

  B. O(n)

  C. O(log n)

  D. O(n log n)

  <!-- answer:2.7b choice: C -->

  <details>
  <summary>Answer</summary>

  - **a)** **D.** A `lo`/`hi` range, a middle check, and one end moved past the middle, all in a `while` loop. C would call itself.
  - **b)** **C.** Each pass halves the range. B treats the `while` as running once per item.

  </details>
