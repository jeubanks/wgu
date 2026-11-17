# 12–20. Python refresher

zyBooks chapters 12 to 20 teach Python itself: variables, types, branching, strings, loops, functions, lists and dictionaries, and classes. This page covers only what the data-structure chapters lean on: reading Python code accurately, and knowing what Python's built-in operations cost.

## Reading Python code

### Variables and types

| Type | Example | Notes |
|---|---|---|
| `int` | `42`, `-7` | Any size; no overflow |
| `float` | `3.5`, `1e-3` | |
| `bool` | `True`, `False` | |
| `str` | `"cat"`, `'cat'` | Immutable: methods return a new string |
| `list` | `[3, 1, 2]` | Ordered and changeable: an array-based list |
| `tuple` | `(3, 1, 2)` | Ordered and immutable |
| `dict` | `{"a": 1, "b": 2}` | Key-value pairs: a hash table |
| `set` | `{3, 1, 2}` | Distinct items, no order: a hash table |
| `None` | `None` | "No value", like a null pointer |

Operators that trip people up:

- `/` always gives a float: `7 / 2` is `3.5`. `//` is floor division: `7 // 2` is `3`. Binary search's `mid = (lo + hi) // 2` uses it.
- `%` is the remainder: `7 % 2` is `1`. It's the modulo in hash functions and circular arrays.
- `**` is a power: `2 ** 10` is `1024`.
- `==` compares values. `is` checks whether two names refer to the same object, used for `x is None`.

### Branching

```python
if x > 10:
    ...
elif x > 5:       # checked only if the first condition was False
    ...
else:
    ...
```

Only the first branch whose condition is true runs. Indentation, not braces, shows what's inside.

### Loops and range

`range(start, stop, step)` counts from `start` **up to but not including** `stop`:

| Call | Values |
|---|---|
| `range(5)` | 0, 1, 2, 3, 4 |
| `range(2, 6)` | 2, 3, 4, 5 |
| `range(1, 10, 3)` | 1, 4, 7 |
| `range(5, 0, -1)` | 5, 4, 3, 2, 1 |

So `for i in range(n)` runs n times. Pseudocode often says "for i from 1 to 10", which includes 10: watch for the difference when tracing.

A `while` loop runs as long as its condition is true, and checks it before each pass. `break` leaves the loop; `continue` skips to the next pass.

### Functions and recursion

```python
def total(items):
    if not items:              # base case: an empty list
        return 0
    return items[0] + total(items[1:])
```

A function without a `return` gives back `None`. A recursive function needs a base case that stops it, and each call must get closer to it.

### Classes

Data structures are written as classes. `__init__` runs when an object is created, and `self` is the object itself:

```python
class Node:
    def __init__(self, data):
        self.data = data
        self.next = None       # no next node yet

head = Node(3)
head.next = Node(8)            # 3 → 8
```

Variables hold **references** to objects. `a = head` doesn't copy the node; `a` and `head` now name the same node, and changing `a.data` changes `head.data`.

## What Python's built-ins cost

`list` is an array-based list, and `dict` and `set` are hash tables, so they cost what [Chapter 2](02-lists.md) and [Chapter 4](04-hash-tables.md) say.

| Operation | Big-O | Why |
|---|---|---|
| `lst[i]`, `lst[i] = x` | O(1) | Direct index |
| `lst.append(x)` | O(1) amortized | Occasional resize |
| `lst.pop()` | O(1) | Removes the last item: nothing shifts |
| `lst.pop(0)`, `lst.insert(0, x)` | O(n) | Every other item shifts |
| `x in lst`, `lst.index(x)` | O(n) | Linear search |
| `lst[a:b]` (slice) | O(b − a) | Copies those items |
| `len(lst)` | O(1) | The length is stored |
| `lst.sort()`, `sorted(lst)` | O(n log n) | Timsort, a stable merge-insertion hybrid |
| `d[key]`, `d[key] = v`, `key in d` | O(1) average, O(n) worst | Hash table |
| `x in s` for a set | O(1) average, O(n) worst | Hash table |
| `deque.append`, `deque.popleft` | O(1) | `collections.deque` is built for both ends |
| `s1 + s2` for strings | O(len(s1) + len(s2)) | Builds a new string |

Two consequences to watch for in code:

- **Slices hide work.** `total(items[1:])` above copies the rest of the list on every call, so the whole function is O(n²), not O(n). Passing an index instead keeps it O(n).
- **Strings are immutable.** Building a string with `s = s + c` in a loop copies it every time: O(n²) overall. `"".join(pieces)` is O(n).

## Questions

- **12.1** Reading Python.

  **a)** What values does `range(3, 12, 4)` produce? Write them separated by commas.

  <!-- answer:12.1a blanks: 3, 7, 11 | 3,7,11 -->

  **b)** What is `17 // 5`, and what is `17 % 5`?

  <!-- answer:12.1b blanks: 17 // 5 => 3; 17 % 5 => 2 -->

  **c)** How many times does the loop body run?

  ```python
  i = 1
  while i < 50:
      i = i * 3
  ```

  <!-- answer:12.1c blanks: 4 -->

  <details>
  <summary>Answer</summary>

  - **a)** 3, 7, 11. The next would be 15, which is past the stop of 12.
  - **b)** 17 // 5 = 3, and 17 % 5 = 2, since 17 = 3 × 5 + 2.
  - **c)** 4: i goes 1 → 3 → 9 → 27 → 81, and the check fails at 81.

  </details>

- **12.2** References.

  ```python
  a = Node(5)
  b = a
  b.data = 9
  print(a.data)
  ```

  What does this print?

  <!-- answer:12.2 blanks: 9 -->

  <details>
  <summary>Answer</summary>

  9. `b = a` makes `b` refer to the same node as `a`. There's only one node, so changing it through `b` changes what `a` sees.

  </details>

- **12.3** Pick the Big-O of each Python operation, on a list, dict, or set of n items.

  | Operation | Big-O |
  |---|---|
  | `lst.append(x)`, averaged | |
  | `lst.insert(0, x)` | |
  | `lst.pop()` | |
  | `x in lst` | |
  | `x in some_set`, average | |
  | `d[key] = value`, average | |
  | `lst.sort()` | |

  <!-- answer:12.3a-g table [O(1), O(log n), O(n), O(n log n)]: O(1); O(n); O(1); O(n); O(1); O(1); O(n log n) -->

  <details>
  <summary>Answer</summary>

  - A list is an array: the end is cheap, the front shifts everything, and searching checks each item.
  - Sets and dicts are hash tables: O(1) on average.
  - Python's sort is O(n log n).

  </details>

- **12.4** Hidden costs.

  ```python
  def total(items):
      if not items:
          return 0
      return items[0] + total(items[1:])
  ```

  **a)** What is this function's Big-O for a list of n items?

  <!-- answer:12.4a blanks: O(n^2) | O(n²) | O(n*n) -->

  **b)** What causes it?

  A. The recursion itself

  B. `items[1:]` copies the rest of the list on every call.

  C. The `+` on numbers

  <!-- answer:12.4b choice: B -->

  <details>
  <summary>Answer</summary>

  - **a)** O(n²). There are n calls, and the slices copy n − 1, n − 2, ..., 1 items, which adds up to about n²/2.
  - **b)** **B.** Passing a starting index instead of a slice makes each call O(1), and the whole function O(n).

  </details>
