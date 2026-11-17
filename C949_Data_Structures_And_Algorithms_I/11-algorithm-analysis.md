# 11. Algorithm analysis: finding Big-O by tracing

You can work out the Big-O of almost any code the same way: count how many times its busiest line runs, as a formula in n, then keep only the part that grows fastest. This page shows that method and works through every pattern the course uses, with a trace of each one.

The searching and sorting sections of zyBooks chapter 11 will be added to this page. Their costs are on the [Big-O cheat sheet](big-o.md#sorting) until then.

## The method

1. **Name n.** What is the input size? The length of the list, the number in a loop bound, the number of nodes. If there are two separate inputs, name both (n and m).
2. **Find the busiest line.** Usually the innermost line of the deepest loop. Everything else runs fewer times, so it can't change the answer.
3. **Count how many times it runs.** Trace it for a small n (like 8 or 16) in a table, then write the count as a formula in n.
4. **Simplify.** Drop constant factors and smaller terms: 3n² + 5n + 2 becomes O(n²).
5. **Check the cases.** If the code can stop early (a `return` or `break` inside a loop), the best and worst cases differ. Trace both.

### What counts as one step

A **constant-time** operation takes the same time whatever n is. These are O(1):

- Assigning a variable, arithmetic, and comparing two values
- Reading or writing `a[i]` by index
- Calling `append`, `pop()` from the end, or `len()` on a Python list
- Looking up a key in a dict or set (on average)
- A `return`, or a function call itself (but not the work inside the function)

These look like one line, but they are **not** constant:

- `x in some_list`, `some_list.index(x)`, `some_list.count(x)`: O(n), a hidden loop
- `some_list[a:b]`, `some_list.copy()`: O(length copied)
- `some_list.insert(0, x)`, `some_list.pop(0)`: O(n), everything shifts
- `sorted(some_list)`, `some_list.sort()`: O(n log n)
- Calling a function that has its own loop: whatever that function costs

## Pattern 1: a single loop

```python
total = 0                # 1 time
for x in items:          # n times
    total += x           # n times  ← busiest line
return total             # 1 time
```

The loop body runs once per item: n times. The other lines run once. Total: n + n + 2 = 2n + 2, which is **O(n)**.

The constant inside a loop doesn't matter. All three of these are O(n):

| Loop | Times the body runs | Big-O |
|---|---|---|
| `for i in range(n):` | n | O(n) |
| `for i in range(0, n, 2):` | n / 2 | O(n) |
| `for i in range(3 * n):` | 3n | O(n) |

A loop whose bound **isn't** n is constant, however big the number: `for i in range(10):` runs 10 times for any n, so it's **O(1)**.

## Pattern 2: loops one after another

```python
for i in range(n):       # n times
    print(i)
for j in range(n):       # n times
    print(j)
```

Sequential blocks **add**: n + n = 2n, which is **O(n)**. When the blocks differ, the biggest one wins: an O(n) loop followed by an O(n²) loop is O(n + n²) = **O(n²)**.

## Pattern 3: nested loops

```python
for i in range(n):           # n times
    for j in range(n):       # n times for each i
        print(i, j)          # n × n times  ← busiest line
```

Nested loops **multiply**: the inner loop runs n times for each of the n passes of the outer loop. n × n = **O(n²)**. Three nested loops over n are O(n³).

Over two different inputs, keep both sizes:

```python
for x in list_a:             # n items
    for y in list_b:         # m items
        print(x, y)          # n × m times
```

That's **O(n·m)**, not O(n²): the lists can have different lengths.

## Pattern 4: an inner loop that depends on the outer one

```python
for i in range(n):
    for j in range(i):       # runs i times, and i keeps changing
        print(i, j)
```

The inner loop's length changes with i, so trace it. For n = 8:

```text
i              0  1  2  3  4  5  6  7
inner passes   0  1  2  3  4  5  6  7    total 28
```

Total: 0 + 1 + 2 + ... + 7 = 28. In general, 0 + 1 + ... + (n − 1) = **n(n − 1) / 2**, which is about n²/2. Drop the ½: **O(n²)**.

> [!TIP]
> "The inner loop only goes up to i, so it's faster" is true, but only by a constant factor: it does half the work of the full n × n loop. Half of n² is still O(n²).

## Pattern 5: a loop that halves or doubles

```python
i = n
while i > 1:
    i = i // 2               # i is cut in half each pass
    print(i)
```

Trace it for n = 16:

```text
pass              1  2  3  4
i after the pass  8  4  2  1    stops: 4 passes
```

4 passes, and 2⁴ = 16. The number of passes is how many times n can be halved before reaching 1: **log₂ n**. So this is **O(log n)**. Doubling up to n is the same:

```python
i = 1
while i < n:
    i = i * 2                # 1, 2, 4, 8, 16, ...
```

Also log₂ n passes: **O(log n)**. Any loop that **multiplies or divides** its variable by a constant (2, 3, 10) is O(log n); one that **adds or subtracts** a constant is O(n). Binary search is this pattern: each comparison halves the part of the list still in play.

## Pattern 6: a halving loop inside a linear loop

```python
for i in range(n):           # n times
    j = n
    while j > 1:             # log₂ n times for each i
        j = j // 2
```

Multiply, as with any nesting: n × log₂ n = **O(n log n)**. For n = 8 that's 8 × 3 = 24 passes. Merge sort, heap sort, and quicksort's average case all land here.

## Pattern 7: a shrinking inner loop (a trap)

```python
i = n
while i > 0:
    for j in range(i):       # i passes, and i halves each time
        print(j)
    i = i // 2
```

It looks like Pattern 6, so the guess is O(n log n). Trace it for n = 16 instead:

```text
i              16   8   4   2   1
inner passes   16   8   4   2   1    total 31
```

Total: 16 + 8 + 4 + 2 + 1 = 31, which is just under 2n. Each round does half the work of the one before, and n + n/2 + n/4 + ... never reaches 2n. So it's **O(n)**. When the inner work shrinks, trace before you multiply.

## Pattern 8: stopping early, and best vs worst case

```python
def find(items, target):
    for i in range(len(items)):
        if items[i] == target:
            return i                 # stops the loop
    return -1
```

How many passes depends on the input, not just on n:

| Case | When it happens | Passes | Big-O |
|---|---|---|---|
| Best | the target is the first item | 1 | O(1) |
| Average | the target is somewhere in the middle | about n / 2 | O(n) |
| Worst | the target is last, or missing | n | O(n) |

Whenever code can stop early, give each case. When a question says only "the Big-O", it means the worst case.

## Pattern 9: hidden loops

```python
for x in list_a:                 # n times
    if x in list_b:              # `in` on a list is a loop over m items
        print(x)
```

The `in` hides a loop, so this is nested: **O(n·m)**, or O(n²) when both lists have n items. Making `list_b` a set turns that `in` into an O(1) lookup, and the whole thing becomes O(n).

The same goes for slicing inside a loop or a recursive call: `items[1:]` copies the list each time, so a function that recurses on `items[1:]` does O(n) work per call.

## Pattern 10: recursion

For a recursive function, count the **calls** and the **work done in each call**. Big-O = (number of calls) × (work per call), when every call does the same work.

### One call on n − 1: O(n)

```python
def factorial(n):
    if n == 0:
        return 1                    # base case
    return n * factorial(n - 1)     # one call, on n − 1
```

`factorial(4)` calls `factorial(3)`, which calls `factorial(2)`, and so on down to `factorial(0)`: 5 calls, each doing O(1) work. n + 1 calls: **O(n)**. It also uses O(n) memory, because all those calls wait on the call stack at once.

### One call on n / 2: O(log n)

```python
def halves(n):
    if n <= 1:
        return 1
    return halves(n // 2) + 1
```

16 → 8 → 4 → 2 → 1: 5 calls. The calls follow Pattern 5's halving: **O(log n)**. Recursive binary search works the same way.

### Two calls on n − 1: O(2ⁿ)

```python
def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)
```

Each call makes two more, so the calls form a tree that roughly doubles at each level:

```
                    fib(5)
           ┌──────────┴──────────┐
        fib(4)                 fib(3)
      ┌───┴───┐              ┌───┴───┐
   fib(3)   fib(2)        fib(2)   fib(1)
   ┌─┴─┐    ┌─┴─┐         ┌─┴─┐
 f(2) f(1) f(1) f(0)     f(1) f(0)
 ┌─┴─┐
f(1) f(0)
```

`fib(5)` makes 15 calls; `fib(6)` makes 25; `fib(20)` makes 21,891. The count grows exponentially: **O(2ⁿ)**. (Storing each answer the first time, as [dynamic programming](01-introduction.md#dynamic-programming) does, cuts it to O(n).)

### Split in half, then do linear work: O(n log n)

Merge sort calls itself on each half, then merges in O(n). Halving gives log₂ n levels of calls, and each level merges n items in total: **O(n log n)**.

| Shape of the recursion | Big-O |
|---|---|
| One call on n − 1, O(1) work each | O(n) |
| One call on n / 2, O(1) work each | O(log n) |
| Two calls on n − 1 | O(2ⁿ) |
| Two calls on n / 2, O(n) work each (merge sort) | O(n log n) |

## A shortcut: double n and watch the count

If you can count the steps for some n, count them again for 2n. How the count changes tells you the class:

| When n doubles, the count... | Example: n = 8 → 16 | Big-O |
|---|---|---|
| stays the same | 1 → 1 | O(1) |
| goes up by a fixed amount | 3 → 4 | O(log n) |
| doubles | 8 → 16 | O(n) |
| a bit more than doubles | 24 → 64 | O(n log n) |
| about quadruples | 28 → 120 | O(n²) |
| explodes | 67 → 3,193 (`fib` calls) | O(2ⁿ) |

## Questions

Trace each one before you answer. Each question has a count to work out and a Big-O to pick.

- **11.1** Two blocks.

  ```python
  count = 0
  for i in range(n):
      count += 1
  for j in range(n):
      for k in range(5):
          count += 1
  ```

  **a)** What is `count` at the end when n = 8?

  <!-- answer:11.1a blanks: 48 -->

  **b)** What is the Big-O?

  <!-- answer:11.1b blanks: [O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ)] => O(n) -->

  <details>
  <summary>Answer</summary>

  - **a)** The first loop adds 8. The nested loops add 8 × 5 = 40. Total 48.
  - **b)** **O(n).** The count is n + 5n = 6n. The inner loop runs 5 times whatever n is, so it's a constant factor, not a second n.

  </details>

- **11.2** Multiplying by 3.

  ```python
  count = 0
  i = 1
  while i < n:
      for j in range(n):
          count += 1
      i = i * 3
  ```

  **a)** What is `count` at the end when n = 27?

  <!-- answer:11.2a blanks: 81 -->

  **b)** What is the Big-O?

  <!-- answer:11.2b blanks: [O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ)] => O(n log n) -->

  <details>
  <summary>Answer</summary>

  - **a)** i takes the values 1, 3, and 9 (27 isn't less than 27): 3 passes of the outer loop, each adding 27. Total 81.
  - **b)** **O(n log n).** The outer loop multiplies i by 3, so it runs log₃ n times (Pattern 5). The inner loop runs n times for each. The base of the log doesn't matter.

  </details>

- **11.3** A growing inner loop.

  ```python
  count = 0
  for i in range(1, n + 1):
      j = 1
      while j <= i:
          count += 1
          j += 1
  ```

  **a)** What is `count` at the end when n = 4?

  <!-- answer:11.3a blanks: 10 -->

  **b)** What is the Big-O?

  <!-- answer:11.3b blanks: [O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ)] => O(n²) -->

  <details>
  <summary>Answer</summary>

  - **a)** For i = 1, 2, 3, 4 the inner loop runs 1, 2, 3, 4 times: 10.
  - **b)** **O(n²).** 1 + 2 + ... + n = n(n + 1) / 2 (Pattern 4).

  </details>

- **11.4** A square-root loop.

  ```python
  count = 0
  i = 1
  while i * i <= n:
      count += 1
      i += 1
  ```

  **a)** What is `count` at the end when n = 16?

  <!-- answer:11.4a blanks: 4 -->

  **b)** What is the Big-O?

  <!-- answer:11.4b blanks: [O(1), O(log n), O(√n), O(n), O(n²)] => O(√n) -->

  <details>
  <summary>Answer</summary>

  - **a)** i = 1, 2, 3, 4 pass the check (16 ≤ 16); i = 5 fails (25 > 16). 4 passes.
  - **b)** **O(√n).** The loop stops when i² passes n, which is when i passes √n. It adds 1 each time, so it isn't O(log n), but it stops long before n.

  </details>

- **11.5** A shrinking inner loop.

  ```python
  count = 0
  i = n
  while i > 0:
      for j in range(i):
          count += 1
      i = i // 2
  ```

  **a)** What is `count` at the end when n = 32?

  <!-- answer:11.5a blanks: 63 -->

  **b)** What is the Big-O?

  <!-- answer:11.5b blanks: [O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ)] => O(n) -->

  <details>
  <summary>Answer</summary>

  - **a)** 32 + 16 + 8 + 4 + 2 + 1 = 63.
  - **b)** **O(n).** The total is always under 2n (Pattern 7). Multiplying "log n rounds × up to n each" overestimates, because the rounds shrink.

  </details>

- **11.6** Hidden work. Both lists have n items.

  ```python
  common = []
  for x in list_a:
      if x in list_b:
          common.append(x)
  ```

  **a)** What is the Big-O?

  <!-- answer:11.6a blanks: [O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ)] => O(n²) -->

  **b)** What change makes it O(n)?

  A. Use `while` instead of `for`

  B. Turn `list_b` into a set before the loop

  C. Sort `list_a` first

  <!-- answer:11.6b choice: B -->

  <details>
  <summary>Answer</summary>

  - **a)** **O(n²).** `x in list_b` searches a list: O(n), once for each of the n items in `list_a`.
  - **b)** **B.** A set lookup is O(1) on average, so the loop does n × O(1) work. Building the set is O(n) once. Sorting `list_a` changes nothing about the `in` search.

  </details>

- **11.7** Recursion.

  ```python
  def g(n):
      if n <= 0:
          return
      g(n - 1)
      g(n - 1)
  ```

  **a)** How many calls to `g` happen in total for `g(3)`, counting the first one?

  <!-- answer:11.7a blanks: 15 -->

  **b)** What is the Big-O of `g(n)`?

  <!-- answer:11.7b blanks: [O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ)] => O(2ⁿ) -->

  **c)** What is the Big-O of this one?

  ```python
  def h(n):
      if n <= 1:
          return 0
      return h(n // 2) + 1
  ```

  <!-- answer:11.7c blanks: [O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ)] => O(log n) -->

  <details>
  <summary>Answer</summary>

  - **a)** g(0) is 1 call. g(1) is itself plus two g(0)s: 3. g(2) is 1 + 3 + 3 = 7. g(3) is 1 + 7 + 7 = **15**.
  - **b)** **O(2ⁿ).** Two calls on n − 1: the count roughly doubles each time n goes up by 1 (it's 2ⁿ⁺¹ − 1).
  - **c)** **O(log n).** One call on n // 2: the calls halve n down to 1.

  </details>

- **11.8** Best and worst case.

  ```python
  def first_negative(items):
      for x in items:
          if x < 0:
              return x
      return None
  ```

  | Input | Big-O |
  |---|---|
  | The first item is negative (best case) | |
  | No item is negative (worst case) | |
  | Only the last item is negative | |

  <!-- answer:11.8a-c table [O(1), O(log n), O(n), O(n²)]: O(1); O(n); O(n) -->

  <details>
  <summary>Answer</summary>

  - The loop stops at the first negative number. If that's the first item, it's one pass: O(1).
  - If there's no negative number, or only the last one is, it checks all n items: O(n).

  </details>
