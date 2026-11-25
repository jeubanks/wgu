# 4. Algorithm analysis

Algorithm analysis estimates how a program's running time grows as its input grows.

After this page you can:

- Simplify an exact step count to its Big-O
- Find the Big-O of loops and recursive code
- Tell best, average, and worst case apart

## What Big-O measures

**Big-O** describes how the work grows when the input grows. It ignores exact counts and keeps only the shape: O(n) means doubling the input roughly doubles the work, and O(n²) means doubling it roughly quadruples the work.

> [!IMPORTANT]
> **Key idea:** Big-O tells you how the work grows as n grows, not how many steps the code takes.

To get a Big-O from an exact count of steps:

- **Drop constant factors.** 3n is O(n). A loop that runs n / 2 times is still O(n).
- **Keep only the fastest-growing term.** 3n² + 5n + 2 is O(n²).
- **Ignore the base of a log.** log₂ n and log₁₀ n differ by a constant factor, so both are O(log n).

## Growth classes

From slowest-growing (best) to fastest-growing (worst):

| Big-O | Name | Example |
|---|---|---|
| O(1) | Constant | Reading `a[i]`, pushing on a stack |
| O(log n) | Logarithmic | Binary search: the range halves each step |
| O(n) | Linear | Linear search: one pass over the items |
| O(n log n) | Linearithmic | Merge sort: log n levels, n work per level |
| O(n²) | Quadratic | Selection sort: a loop inside a loop |
| O(2ⁿ) | Exponential | Naive recursive Fibonacci |
| O(n!) | Factorial | Trying every ordering of n items |

<div class="viz" data-viz="growth-chart" markdown>

*On the site, an interactive chart here plots each growth class as n grows.*

</div>

## Best, average and worst case

Some code does different amounts of work on inputs of the same size. The **best case** is the luckiest input of size n (not a small n), the **average case** a typical random input, and the **worst case** the input that makes it run longest. When a question asks only for "the Big-O", it means the worst case.

> [!IMPORTANT]
> **Key idea:** Best, average and worst case compare different inputs of the same size n.

## Finding the Big-O of code

1. **Name n**, the input size.
2. **Find the busiest line**, usually the innermost line of the deepest loop.
3. **Count how often it runs** as a formula in n.
4. **Simplify**: drop constants and smaller terms.
5. **Check for early exits.** A `return` or `break` in a loop splits best from worst case.

Assigning, arithmetic, comparing, `a[i]`, `append` and `len()` are each one O(1) step.

> [!IMPORTANT]
> **Key idea:** The Big-O of code is how often its busiest line runs, written as a formula in n and simplified.

<div class="viz" data-viz="loop-grid" markdown>

*On the site, an interactive tracer here draws one dot per run of the busiest line.*

</div>

### Single loop

```python
for x in items:
    total += x
```

The body runs once per item: **O(n)**. A loop with a fixed bound, like `range(10)`, is O(1) whatever n is.

### Sequential loops

```python
for x in items:
    print(x)
for x in items:
    print(x * 2)
```

Blocks one after another **add**: 2n, **O(n)**. The biggest block wins: O(n) then O(n²) is O(n²).

### Nested loops

```python
for i in range(n):
    for j in range(n):
        print(i, j)
```

Nested loops **multiply**: n × n, **O(n²)**. Over two different lists of sizes n and m, it's O(n·m).

### Dependent inner loop

```python
for i in range(n):
    for j in range(i):
        print(i, j)
```

The inner loop runs 0, 1, …, n − 1 times: n(n − 1) / 2 in all, about n² / 2. **O(n²)**.

### Halving or doubling

```python
i = n
while i > 1:
    i = i // 2
```

Each pass halves i, so the loop runs log₂ n times: **O(log n)**. Here's n = 8, with the faded part thrown away:

<!-- figure
row: start | 1 2 3 4 5 6 7 8 | i = 8
row: pass 1 | 1 2 3 4 .5 .6 .7 .8 | i = 4
row: pass 2 | 1 2 .3 .4 .5 .6 .7 .8 | i = 2
row: pass 3 | *1 .2 .3 .4 .5 .6 .7 .8 | i = 1, stop
-->
```text
start    1 2 3 4 5 6 7 8    i = 8
pass 1   1 2 3 4 - - - -    i = 4
pass 2   1 2 - - - - - -    i = 2
pass 3  [1]- - - - - - -    i = 1, stop
```
<!-- /figure -->

3 passes, and 2³ = 8. A loop that **multiplies or divides** its variable by a constant is O(log n); one that **adds or subtracts** a constant is O(n).

### Halving inside a linear loop

```python
for x in items:
    j = n
    while j > 1:
        j = j // 2
```

n passes, each doing log n work: **O(n log n)**.

Careful: if the *inner* loop's length halves each round (n, n/2, n/4, …), the total is under 2n: **O(n)**. When inner work shrinks, add it up instead of multiplying.

### Early exit

```python
def find(items, target):
    for i in range(len(items)):
        if items[i] == target:
            return i
    return -1
```

Best **O(1)**: the target is first. Average **O(n)**: about n / 2 checks. Worst **O(n)**: last or missing.

### Hidden loops

Some single lines hide a loop:

| Line | Cost |
|---|---|
| `x in some_list`, `.index(x)`, `.count(x)` | O(n): checks items one by one |
| `some_list[a:b]`, `.copy()` | O(length copied) |
| `.pop(0)`, `.insert(0, x)` | O(n): every other item shifts; a `collections.deque`'s `popleft()` is O(1) |
| `sorted(some_list)`, `.sort()` | O(n log n) |
| `x in some_set`, `d[key]` | O(1) on average: a hash lookup |

```python
for x in list_a:
    if x in list_b:
        print(x)
```

The `in` is an inner loop: O(n·m). With `list_b` a set, it's O(n).

### Recursion

Count the **calls**, then multiply by the work each call does.

| Shape | Big-O |
|---|---|
| One call on n − 1 (factorial) | O(n) |
| One call on n // 2 (recursive binary search) | O(log n) |
| Two calls on n − 1 and n − 2 (naive Fibonacci) | O(2ⁿ) |
| Two calls on n / 2, plus O(n) merging (merge sort) | O(n log n): log n levels of n work |

```python
def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)
```

Each call makes two more. `fib(4)` makes 9 calls:

<!-- figure
nary: fib(4){fib(3){fib(2){fib(1), fib(0)}, fib(1)}, fib(2){fib(1), fib(0)}}
-->
```text
              fib(4)
          /          \
      fib(3)        fib(2)
      /    \        /    \
  fib(2) fib(1) fib(1) fib(0)
  /    \
fib(1) fib(0)
```
<!-- /figure -->

The same values get recomputed, and the tree nearly doubles each time n goes up by one. Recursion also uses memory for every call waiting on the call stack: factorial needs O(n).

## Big-O summary

| Pattern | Big-O |
|---|---|
| Fixed number of steps | O(1) |
| Loop that halves or doubles its variable | O(log n) |
| Single loop, or loops one after another | O(n) |
| Halving loop inside a linear loop | O(n log n) |
| Nested loops, including a dependent inner loop | O(n²), or O(n·m) over two inputs |
| Early exit | best O(1), worst the full loop |
| Two recursive calls on n − 1 and n − 2 | O(2ⁿ) |

## Questions

- **4.1** Each expression counts an algorithm's steps. What is its Big-O?

  **a)** 4n³ + 100n² + 7

  A. O(n²)

  B. O(4n³)

  C. O(n³)

  D. O(n⁵)

  <!-- answer:4.1a choice: C -->

  **b)** 2ⁿ + n⁵

  A. O(2ⁿ)

  B. O(n⁵)

  C. O(n⁵ · 2ⁿ)

  D. O(n²)

  <!-- answer:4.1b choice: A -->

  **c)** 8 log₂ n + 3

  A. O(1)

  B. O(n)

  C. O(8 log n)

  D. O(log n)

  <!-- answer:4.1c choice: D -->

  <details>
  <summary>Answer</summary>

  - Keep the fastest-growing term and drop its constant.
  - **a)** **C, O(n³).** A keeps the term with the bigger coefficient; coefficients don't matter, powers do.
  - **b)** **A, O(2ⁿ).** An exponential outgrows any power of n. B treats it like a polynomial; D misreads 2ⁿ as n².
  - **c)** **D, O(log n).** C forgets to drop the 8.

  </details>

- **4.2** Algorithm A takes 1000n steps. Algorithm B takes n² / 2 steps. Which statement is true?

  A. B is always faster, because n² / 2 has the smaller constant

  B. A is faster once n is past 2000

  C. A is faster only while n is under 2000

  D. They tie, because both constants get dropped

  <!-- answer:4.2 choice: B -->

  <details>
  <summary>Answer</summary>

  - **B.** A is O(n) and B is O(n²). 1000n < n² / 2 exactly when n > 2000; past that, n² pulls ahead. C has the crossover backward.

  </details>

- **4.3** Two loops, one after the other.

  ```python
  count = 0
  for i in range(n):
      count += 1
  for i in range(0, n, 3):
      count += 1
  ```

  **a)** What is `count` at the end when n = 6?

  A. 6

  B. 8

  C. 9

  D. 12

  <!-- answer:4.3a choice: B -->

  **b)** What is the Big-O of this code, in terms of n?

  A. O(n²)

  B. O(n log n)

  C. O(log n)

  D. O(n)

  <!-- answer:4.3b choice: D -->

  <details>
  <summary>Answer</summary>

  - **a)** **B, 8.** The first loop adds 6. The second visits 0 and 3, adding 2. C counts 6 too, but `range` stops before n.
  - **b)** **D, O(n).** Sequential blocks add: about n + n/3. A multiplies them as if nested.

  </details>

- **4.4** An inner loop that starts at i.

  ```python
  count = 0
  for i in range(n):
      for j in range(i, n):
          count += 1
  ```

  **a)** What is `count` at the end when n = 5?

  A. 10

  B. 15

  C. 20

  D. 25

  <!-- answer:4.4a choice: B -->

  **b)** What is the Big-O of this code, in terms of n?

  A. O(n²)

  B. O(n)

  C. O(n log n)

  D. O(log n)

  <!-- answer:4.4b choice: A -->

  <details>
  <summary>Answer</summary>

  - **a)** **B, 15.** For i = 0 to 4 the inner loop runs 5, 4, 3, 2, 1 times. A is what `range(i + 1, n)` would give; D ignores that the inner loop shrinks.
  - **b)** **A, O(n²).** n + (n − 1) + … + 1 = n(n + 1) / 2. The inner loop shrinks by one each time, not by half, so C doesn't apply.

  </details>

- **4.5** A loop variable that's multiplied by 3 each time.

  ```python
  count = 0
  i = 1
  while i < n:
      i = i * 3
      count += 1
  ```

  **a)** What is `count` at the end when n = 81?

  A. 4

  B. 5

  C. 27

  D. 80

  <!-- answer:4.5a choice: A -->

  **b)** What is the Big-O of this code, in terms of n?

  A. O(n)

  B. O(1)

  C. O(log n)

  D. O(n log n)

  <!-- answer:4.5b choice: C -->

  <details>
  <summary>Answer</summary>

  - **a)** **A, 4.** i goes 1 → 3 → 9 → 27 → 81, and the check `81 < 81` fails. B is what `i <= n` would give.
  - **b)** **C, O(log n).** Multiplying by a constant gives log₃ n passes; the base doesn't matter. A treats it like adding 3 each pass.

  </details>

- **4.6** Emptying a list from the front.

  ```python
  while items:
      x = items.pop(0)
      print(x)
  ```

  **a)** What is the Big-O of this loop when `items` is a list of n items?

  A. O(1)

  B. O(n)

  C. O(n log n)

  D. O(n²)

  <!-- answer:4.6a choice: D -->

  **b)** Which change makes the whole loop O(n)?

  A. Sort `items` first

  B. Replace the `while` with a `for` loop that calls `items.pop(0)`

  C. Make `items` a `collections.deque` and call `items.popleft()`

  D. Replace `items.pop(0)` with `items.remove(items[0])`

  <!-- answer:4.6b choice: C -->

  <details>
  <summary>Answer</summary>

  - **a)** **D, O(n²).** The loop runs n times, and each `pop(0)` shifts every remaining item: a hidden inner loop. B misses that hidden loop.
  - **b)** **C.** `deque.popleft()` is O(1), so n of them cost O(n). D looks different, but `remove` searches and then shifts too.

  </details>

- **4.7** This function checks a list of n items for a repeated value.

  ```python
  def has_repeat(items):
      for i in range(len(items)):
          for j in range(i + 1, len(items)):
              if items[i] == items[j]:
                  return True
      return False
  ```

  **a)** What is its best-case Big-O?

  A. O(1)

  B. O(log n)

  C. O(n)

  D. O(n²)

  <!-- answer:4.7a choice: A -->

  **b)** What is its worst-case Big-O?

  A. O(1)

  B. O(log n)

  C. O(n)

  D. O(n²)

  <!-- answer:4.7b choice: D -->

  <details>
  <summary>Answer</summary>

  - **a)** **A.** If the first two items match, it returns after one comparison. C assumes the outer loop must finish once; the `return` can end it on the first pass.
  - **b)** **D.** If no value repeats, it compares all n(n − 1) / 2 pairs.

  </details>

- **4.8** Each call makes two calls on n − 1.

  ```python
  def f(n):
      if n <= 1:
          return 1
      return f(n - 1) + f(n - 1)
  ```

  **a)** How many calls to `f` happen in all for `f(3)`, counting the first?

  A. 3

  B. 4

  C. 7

  D. 8

  <!-- answer:4.8a choice: C -->

  **b)** What is the Big-O of this code, in terms of n?

  A. O(2ⁿ)

  B. O(n)

  C. O(n log n)

  D. O(n²)

  <!-- answer:4.8b choice: A -->

  <details>
  <summary>Answer</summary>

  - **a)** **C, 7.** One call to `f(3)`, two to `f(2)`, four to `f(1)`. B counts only the bottom level; A one call per level.
  - **b)** **A, O(2ⁿ).** The calls double at every level. C is merge sort's shape, but its calls work on n / 2, not n − 1.

  </details>

- **4.9** For each of n names, a function binary-searches a sorted list of n names. What is its worst-case Big-O?

  A. O(log n)

  B. O(n log n)

  C. O(n)

  D. O(n²)

  <!-- answer:4.9 choice: B -->

  <details>
  <summary>Answer</summary>

  - **B, O(n log n).** n searches, each O(log n): nested work multiplies. D treats each search as a linear scan.

  </details>
