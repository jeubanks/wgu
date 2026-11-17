# Lesson 1: Big-O by experiment

Big-O describes how an algorithm's work grows as its input grows. It ignores constant factors and small terms, and keeps the part that dominates for large n: 3n + 20 steps is O(n), and n² + n is O(n²).

The lesson code times three functions on lists of growing size. When n doubles, a linear function takes about twice as long, and a quadratic one about four times as long. A function that halves its problem on every step barely changes at all.

Recursion shows up here too: a function that calls itself on a smaller input, with a base case that stops it. The same problem can be fast or extremely slow depending on whether it repeats work.

Your file: `c949-practice/lesson1.py`. Run `python lesson1.py` to check your answers, and `python lesson1.py --demo` to also run the timing demo.

<!-- lesson-code -->
<details>
<summary>Lesson code</summary>

```python
def time_it(func, n):
    data = list(range(n))
    start = time.perf_counter()
    func(data)
    return time.perf_counter() - start


def linear(data):            # O(n): one pass
    total = 0
    for x in data:
        total += x
    return total


def quadratic(data):         # O(n^2): loop inside a loop
    count = 0
    for a in data:
        for b in data:
            count += 1
    return count


def halving(data):           # O(log n): problem halves each step
    n, steps = len(data), 0
    while n > 1:
        n //= 2
        steps += 1
    return steps


def demo():
    for n in (500, 1000, 2000):
        print(n, f'linear={time_it(linear, n):.5f}s',
              f'quadratic={time_it(quadratic, n):.5f}s')
    print(halving(list(range(1_000_000))))   # 19
```

</details>
<!-- /lesson-code -->

## Exercises

- **1.1**\
  **In:** `ANSWERS_1_1` *(paper first)*

  Give the Big-O of each snippet as a string, like `'O(n)'`, `'O(log n)'`, `'O(n^2)'`, or `'O(n*m)'`:

  ```python
  # a
  for i in range(n):
      for j in range(10):
          print(i, j)

  # b
  i = 1
  while i < n:
      i *= 2

  # c
  for i in range(n):
      for j in range(i):
          print(i, j)

  # d
  for x in list_a:
      for y in list_b:
          print(x, y)
  ```

  <!-- solution:1.1 -->
  <details>
  <summary>Hint</summary>

  - Count how many times the innermost line runs as n grows.
  - Ask what happens to the loop variable on each pass: does it go up by a fixed step, or get multiplied?
  - When the inner loop's length depends on `i`, add up the inner passes: 0 + 1 + ... + (n - 1).
  - Two different lists have two different sizes. Don't call them both n.

  </details>

  <details>
  <summary>Solution</summary>

  ```python
  ANSWERS_1_1 = {'a': 'O(n)', 'b': 'O(log n)', 'c': 'O(n^2)', 'd': 'O(n*m)'}
  ```

  </details>
  <!-- /solution -->

- **1.2**\
  **In:** `binary_search_max_comparisons(n)`

  Return the most comparisons binary search can need to search n sorted items.

  <!-- solution:1.2 -->
  <details>
  <summary>Hint</summary>

  - Each comparison throws away half of what's left.
  - Work out small cases by hand first: n = 1, 2, 3, 4, 8. Look for the pattern.
  - A loop that does `n //= 2` counts halvings without needing `math.log`.

  </details>

  <details>
  <summary>Solution</summary>

  ```python
  def binary_search_max_comparisons(n):
      """1.2 Most comparisons binary search can need on n items."""
      steps = 0
      while n > 0:
          steps += 1
          n //= 2
      return steps
  ```

  </details>
  <!-- /solution -->

- **1.3**\
  **In:** `fib(n)`, `FIB_20_CALLS`, `fib_memo(n, memo=None)`

  Three parts:

  - **a.** Write `fib(n)` as a plain recursive Fibonacci: `fib(0)` is 0 and `fib(1)` is 1.
  - **b.** Count how many calls `fib(20)` makes in total, and set `FIB_20_CALLS` to that number.
  - **c.** Write `fib_memo(n)`, which runs in O(n) by caching results in a dict.

  <!-- solution:1.3 -->
  <details>
  <summary>Hint</summary>

  - `fib(n)` is `fib(n - 1) + fib(n - 2)`, with `n < 2` as the base case.
  - To count calls, add 1 to a global counter at the top of `fib`, and reset it to 0 before calling `fib(20)`.
  - For `fib_memo`, look in the dict before recursing, and store the result before returning it.

  </details>

  <details>
  <summary>Solution</summary>

  ```python
  def fib(n):
      """1.3a Naive recursive Fibonacci."""
      if n < 2:
          return n
      return fib(n - 1) + fib(n - 2)

  FIB_20_CALLS = 21891

  def fib_memo(n, memo=None):
      """1.3c Fibonacci in O(n) using a dict cache."""
      if memo is None:
          memo = {}
      if n < 2:
          return n
      if n not in memo:
          memo[n] = fib_memo(n - 1, memo) + fib_memo(n - 2, memo)
      return memo[n]
  ```

  </details>
  <!-- /solution -->

- **1.4**\
  **In:** `sum_list(items)`

  Return the sum of a list, using recursion and no loops.

  <!-- solution:1.4 -->
  <details>
  <summary>Hint</summary>

  - Base case: the empty list.
  - Otherwise: the first item plus the sum of the rest (`items[1:]`).

  </details>

  <details>
  <summary>Solution</summary>

  ```python
  def sum_list(items):
      """1.4 Recursive sum, no loops."""
      if not items:
          return 0
      return items[0] + sum_list(items[1:])
  ```

  </details>
  <!-- /solution -->
