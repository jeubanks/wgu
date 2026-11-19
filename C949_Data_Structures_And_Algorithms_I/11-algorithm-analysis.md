# 11. Searching and algorithm analysis

This chapter covers three things, in the same order as zyBooks chapter 11:

1. **Searching:** linear search and binary search, and why one is O(n) and the other O(log n).
2. **Finding Big-O by tracing:** count how many times the busiest line of code runs, as a formula in n, then keep only the part that grows fastest. Ten worked patterns, from a single loop to recursion.
3. **Sorting:** how each of the ten sorts works, what it costs in the best, average, and worst case, and how to recognize it in code.

## Searching

### Linear search

Check each item in order, from the first, until you find the key or run out of items.

```python
def linear_search(items, key):
    for i in range(len(items)):
        if items[i] == key:
            return i          # found: stop here
    return -1                 # checked everything: not there
```

| Case | When | Comparisons | Big-O |
|---|---|---|---|
| Best | the key is the first item | 1 | O(1) |
| Average | the key is somewhere in the middle | about n / 2 | O(n) |
| Worst | the key is last, or missing | n | O(n) |

Linear search works on any list, sorted or not, because it needs nothing from the data.

### Binary search

Binary search needs a **sorted** list. It compares the key with the middle item, then throws away the half that can't hold the key:

1. Set `low` to 0 and `high` to the last index.
2. While `low <= high`: compute `mid = (low + high) // 2` and compare the key with `items[mid]`.
  - Equal: found it at `mid`.
  - The key is bigger: it can only be to the right, so `low = mid + 1`.
  - The key is smaller: it can only be to the left, so `high = mid - 1`.
3. If `low` passes `high`, the range is empty: the key isn't there.

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

A trace, searching for 75 in an 11-item list:

<!-- figure
array: 3 9 14 22 31 40 57 68 75 82 96
step: Step 1 | 0 10 5
step: Step 2 | 6 10 8
-->
```text
index    0   1   2   3   4   5   6   7   8   9  10
items    3   9  14  22  31  40  57  68  75  82  96
```
<!-- /figure -->

| Step | low | high | mid | items[mid] | Result |
|---|---|---|---|---|---|
| 1 | 0 | 10 | (0 + 10) // 2 = 5 | 40 | 75 > 40, so low = 6 |
| 2 | 6 | 10 | (6 + 10) // 2 = 8 | 75 | found at index 8 |

Binary search needed two comparisons here, where linear search would need nine. Each step halves the range that's left, so the number of steps is how many times n can be halved. Binary search makes at most **⌊log₂ n⌋ + 1** comparisons.

| n | Most comparisons, linear search | Most comparisons, binary search |
|---|---|---|
| 11 | 11 | 4 |
| 1,000 | 1,000 | 10 |
| 1,000,000 | 1,000,000 | 20 |

| Case | When | Big-O |
|---|---|---|
| Best | the key is the first middle item checked | O(1) |
| Average and worst | the key is found late, or is missing | O(log n) |

> [!TIP]
> Questions often ask which values `items[mid]` takes in the first and second steps. Write `low`, `high`, and `mid` on a line for each step, as in the trace above, and use the integer division `//`: (0 + 10) // 2 is 5, and (6 + 10) // 2 is 8.

### Interpolation search

Interpolation search is like binary search, but with a better guess. Instead of checking the middle, it uses the key's value to guess where the key *should* be, the way you'd open a phone book near the back for "W". On sorted data whose values are spread evenly, it takes O(log log n) steps on average. On lopsided data the guesses can be bad, and the worst case is O(n).

## Finding Big-O by tracing

You can work out the Big-O of almost any code the same way: count how many times its busiest line runs, as a formula in n, then keep only the part that grows fastest.

### The method

1. **Name n.** What is the input size? The length of the list, the number in a loop bound, the number of nodes. If there are two separate inputs, name both (n and m).
2. **Find the busiest line.** Usually the innermost line of the deepest loop. Everything else runs fewer times, so it can't change the answer.
3. **Count how many times it runs.** Trace it for a small n (like 8 or 16) in a table, then write the count as a formula in n.
4. **Simplify.** Drop constant factors and smaller terms: 3n² + 5n + 2 becomes O(n²).
5. **Check the cases.** If the code can stop early (a `return` or `break` inside a loop), the best and worst cases differ. Trace both.

#### What counts as one step

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

Try the method on the loop tracer below. Each dot is one run of the busiest line, and each row is one pass of the outer loop, so the shape of the dots is the shape of the cost: a line, a square, a triangle, a short row.

<div class="viz" data-viz="loop-grid" markdown>

*On the site, an interactive loop tracer here draws one dot per run of the busiest line, for six of the patterns on this page.*

</div>

### Pattern 1: a single loop

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

A loop whose bound **isn't** n is constant, however big the bound is: `for i in range(10):` runs 10 times for any n, so it's **O(1)**.

### Pattern 2: loops one after another

```python
for i in range(n):       # n times
    print(i)
for j in range(n):       # n times
    print(j)
```

Sequential blocks **add**: n + n = 2n, which is **O(n)**. When the blocks differ, the biggest one wins: an O(n) loop followed by an O(n²) loop is O(n + n²) = **O(n²)**.

### Pattern 3: nested loops

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

### Pattern 4: an inner loop that depends on the outer one

```python
for i in range(n):
    for j in range(i):       # runs i times, and i keeps changing
        print(i, j)
```

The inner loop's length changes with i, so trace it. For n = 8:

| i | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | Total |
|---|---|---|---|---|---|---|---|---|---|
| Inner passes | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 28 |

Total: 0 + 1 + 2 + ... + 7 = 28. In general, 0 + 1 + ... + (n − 1) = **n(n − 1) / 2**, which is about n²/2. Drop the ½: **O(n²)**.

> [!TIP]
> "The inner loop only goes up to i, so it's faster" is true, but only by a constant factor: it does half the work of the full n × n loop. Half of n² is still O(n²).

### Pattern 5: a loop that halves or doubles

```python
i = n
while i > 1:
    i = i // 2               # i is cut in half each pass
    print(i)
```

Trace it for n = 16:

| Pass | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| i after the pass | 8 | 4 | 2 | 1: stop after 4 passes |

4 passes, and 2⁴ = 16. The number of passes is how many times n can be halved before reaching 1: **log₂ n**. So this is **O(log n)**. Doubling up to n is the same:

```python
i = 1
while i < n:
    i = i * 2                # 1, 2, 4, 8, 16, ...
```

Also log₂ n passes: **O(log n)**. Any loop that **multiplies or divides** its variable by a constant (2, 3, 10) is O(log n); one that **adds or subtracts** a constant is O(n). Binary search is this pattern: each comparison halves the part of the list still in play.

### Pattern 6: a halving loop inside a linear loop

```python
for i in range(n):           # n times
    j = n
    while j > 1:             # log₂ n times for each i
        j = j // 2
```

Multiply, as with any nesting: n × log₂ n = **O(n log n)**. For n = 8 that's 8 × 3 = 24 passes. Merge sort, heap sort, and quicksort's average case all land here.

### Pattern 7: a shrinking inner loop (a trap)

```python
i = n
while i > 0:
    for j in range(i):       # i passes, and i halves each time
        print(j)
    i = i // 2
```

It looks like Pattern 6, so the guess is O(n log n). Trace it for n = 16 instead:

| i | 16 | 8 | 4 | 2 | 1 | Total |
|---|---|---|---|---|---|---|
| Inner passes | 16 | 8 | 4 | 2 | 1 | 31 |

Total: 16 + 8 + 4 + 2 + 1 = 31, which is just under 2n. Each round does half the work of the one before, and n + n/2 + n/4 + ... never reaches 2n. So it's **O(n)**. When the inner work shrinks, trace before you multiply.

### Pattern 8: stopping early, and best vs worst case

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

Sorting shows the same thing. Run a sort on input that's already sorted, random, and reversed, and count the comparisons:

<div class="viz" data-viz="sort" markdown>

*On the site, an interactive diagram here runs bubble, selection, insertion, and merge sort on sorted, random, and reversed input, and counts the comparisons.*

</div>

### Pattern 9: hidden loops

```python
for x in list_a:                 # n times
    if x in list_b:              # `in` on a list is a loop over m items
        print(x)
```

The `in` hides a loop, so this is nested: **O(n·m)**, or O(n²) when both lists have n items. Making `list_b` a set turns that `in` into an O(1) lookup, and the whole thing becomes O(n).

The same goes for slicing inside a loop or a recursive call: `items[1:]` copies the list each time, so a function that recurses on `items[1:]` does O(n) work per call.

### Pattern 10: recursion

For a recursive function, count the **calls** and the **work done in each call**. Big-O = (number of calls) × (work per call), when every call does the same work.

#### One call on n − 1: O(n)

```python
def factorial(n):
    if n == 0:
        return 1                    # base case
    return n * factorial(n - 1)     # one call, on n − 1
```

`factorial(4)` calls `factorial(3)`, which calls `factorial(2)`, and so on down to `factorial(0)`: 5 calls, each doing O(1) work. n + 1 calls: **O(n)**. It also uses O(n) memory, because all those calls wait on the call stack at once.

#### One call on n / 2: O(log n)

```python
def halves(n):
    if n <= 1:
        return 1
    return halves(n // 2) + 1
```

16 → 8 → 4 → 2 → 1: 5 calls. The calls follow Pattern 5's halving: **O(log n)**. Recursive binary search works the same way.

#### Two calls on n − 1: O(2ⁿ)

```python
def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)
```

Each call makes two more, so the calls form a tree that roughly doubles at each level:

<!-- figure
nary: fib(5){fib(4){fib(3){fib(2){fib(1), fib(0)}, fib(1)}, fib(2){fib(1), fib(0)}}, fib(3){fib(2){fib(1), fib(0)}, fib(1)}}
-->
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
<!-- /figure -->

`fib(5)` makes 15 calls; `fib(6)` makes 25; `fib(20)` makes 21,891. The count grows exponentially: **O(2ⁿ)**. (Storing each answer the first time, as [dynamic programming](01-introduction.md#dynamic-programming) does, cuts it to O(n).)

#### Split in half, then do linear work: O(n log n)

Merge sort calls itself on each half, then merges in O(n). Halving gives log₂ n levels of calls, and each level merges n items in total: **O(n log n)**.

| Shape of the recursion | Big-O |
|---|---|
| One call on n − 1, O(1) work each | O(n) |
| One call on n / 2, O(1) work each | O(log n) |
| Two calls on n − 1 | O(2ⁿ) |
| Two calls on n / 2, O(n) work each (merge sort) | O(n log n) |

### A shortcut: double n and watch the count

If you can count the steps for some n, count them again for 2n. How the count changes tells you the class:

| When n doubles, the count... | Example: n = 8 → 16 | Big-O |
|---|---|---|
| stays the same | 1 → 1 | O(1) |
| goes up by a fixed amount | 3 → 4 | O(log n) |
| doubles | 8 → 16 | O(n) |
| a bit more than doubles | 24 → 64 | O(n log n) |
| about quadruples | 28 → 120 | O(n²) |
| explodes | 67 → 3,193 (`fib` calls) | O(2ⁿ) |

## Sorting

### Words to know first

- **Comparison sort:** decides the order only by comparing two items at a time (`a < b`). Selection, insertion, bubble, shell, quick, merge, and heap sort are comparison sorts. No comparison sort can beat O(n log n) on average.
- **Non-comparison sort:** never compares two items. It looks inside each one instead, at its digits or its value range. Radix, counting, and bucket sort work this way, which is how they can run in close to O(n), but only on numbers (or things that can be turned into numbers).
- **Fast sort:** zyBooks calls a sort *fast* when its average case is O(n log n) or better: quicksort, merge sort, heap sort, and radix sort. Selection, insertion, bubble, and shell sort are not.
- **Stable:** items with equal keys stay in their original order. That matters when you sort by one field, then another.
- **In place:** uses only O(1) extra memory. Merge sort needs a second list, so it isn't in place.

### Selection sort

Find the smallest item in the unsorted part, and swap it to the front of that part. The sorted part grows by one item per pass.

<!-- figure
row: start | 29 4 17 8 42 11
row: pass 1 | *4 *29 17 8 42 11 | smallest is 4: swap it with 29
row: pass 2 | .4 *8 17 *29 42 11 | smallest of the rest is 8: swap it with 29
row: pass 3 | .4 .8 *11 29 42 *17 | and so on; faded items are sorted
-->
```text
start    29  4 17  8 42 11
pass 1    4 29 17  8 42 11     smallest is 4: swap it with 29
pass 2    4  8 17 29 42 11     smallest of the rest is 8: swap it with 29
pass 3    4  8 11 29 42 17
...
```
<!-- /figure -->

Selection sort always scans the whole unsorted part to be sure it found the smallest, even when the list is already sorted: n − 1 + n − 2 + ... + 1 comparisons, every time.

- **Best, average, worst:** O(n²), O(n²), O(n²). There's no fast case.
- **Spot it in code:** an inner loop that tracks the index of the smallest value (`index_smallest`), then one swap after the inner loop ends.

### Insertion sort

Take the next item, and shift it left past every bigger item in the sorted part, like sorting a hand of cards.

<!-- figure
row: start | 29 4 17 8 42 11
row: i = 1 | *4 29 17 8 42 11 | 4 moves left past 29
row: i = 2 | 4 *17 29 8 42 11 | 17 moves left past 29, stops at 4
row: i = 3 | 4 *8 17 29 42 11 | 8 moves left past 29 and 17, and so on
-->
```text
start    29  4 17  8 42 11
i = 1     4 29 17  8 42 11     4 moves left past 29
i = 2     4 17 29  8 42 11     17 moves left past 29, stops at 4
i = 3     4  8 17 29 42 11     8 moves left past 29 and 17
...
```
<!-- /figure -->

- **Best:** O(n), when the list is already sorted: each item is compared once and doesn't move. Nearly sorted lists are almost as fast.
- **Average and worst:** O(n²). The worst case is a reversed list, where every item moves all the way to the front.
- **Stable:** yes.
- **Spot it in code:** an inner `while` loop that moves left (`j -= 1`) while the item before is bigger, swapping or shifting as it goes.

### Bubble sort

Walk through the list comparing neighbors, and swap any pair that's out of order. Each pass carries the largest remaining item to the end, like a bubble rising.

<!-- figure
row: start | 29 4 17 8 42 11
row: pass 1 | 4 17 8 29 11 *42 | 42 has bubbled to the end
-->
```text
start     29  4 17  8 42 11
pass 1     4 17  8 29 11 42     42 has bubbled to the end
```
<!-- /figure -->

- **Best:** O(n), but only for the version that stops when a pass makes no swaps (the list is sorted). Without that check, it's O(n²) every time.
- **Average and worst:** O(n²).
- **Stable:** yes.
- **Spot it in code:** compares `items[j]` with `items[j + 1]` and swaps them, inside two nested loops.

### Shell sort

Shell sort speeds up insertion sort by first sorting items that are far apart. With a **gap** of 3, it treats the list as 3 interleaved lists (indexes 0, 3, 6, ...; 1, 4, 7, ...; 2, 5, 8, ...) and insertion-sorts each one. Then it repeats with smaller gaps. The last gap is always 1. That final pass is a plain insertion sort, and it's quick because the list is now nearly sorted.

<!-- figure
index: yes
row: start, gap 3 | *45 13 70 *2 88 31 *59 7 24 | one interleaved list: 45, 2, 59
row: after gap 3 | *2 7 24 *45 13 31 *59 88 70 | that list is now 2, 45, 59
row: after gap 1 | 2 7 13 24 31 45 59 70 88 | sorted
-->
```text
start, gap 3    45 13 70  2 88 31 59  7 24
                 ↑        ↑        ↑          one interleaved list: 45, 2, 59 → 2, 45, 59
after gap 3      2  7 24 45 13 31 59 88 70
after gap 1      2  7 13 24 31 45 59 70 88
```
<!-- /figure -->

Any gaps work as long as the last is 1. zyBooks suggests powers of 2 minus 1, largest first, below the list's length: for 100 items, 63, 31, 15, 7, 3, 1.

- **Best:** O(n log n), on sorted input.
- **Average:** about O(n^1.5) with gaps like these. It depends on the gaps.
- **Worst:** O(n²), with poor gaps (such as halving the gap each time).
- **Stable:** no, because items jump over each other across the gap.
- **Spot it in code:** a `gap` or `interval` variable, and an insertion sort that steps by `gap` instead of 1.

### Quicksort

Pick a **pivot**, then **partition**: move every value smaller than the pivot to the left side and every larger value to the right. Then sort each side the same way, recursively.

zyBooks picks the **middle** element as the pivot, and partitions with two indexes:

1. `low` starts at the left and moves right while its item is smaller than the pivot.
2. `high` starts at the right and moves left while its item is bigger than the pivot.
3. If they've met or crossed, the partition is done: `high` is the last index of the left part. Otherwise, swap the two items, step both indexes one place, and repeat.

<!-- figure
index: yes
row: start | 24 7 61 *15 38 3 50 | pivot = middle item = 15
row: swap | *3 7 61 15 38 *24 50 | low stopped at 24 (not < 15), high at 3 (not > 15)
row: swap | 3 7 *15 *61 38 24 50 | low stopped at 61, high at 15
row: done | 3 7 15 // 61 38 24 50 | low passed high: left part and right part
-->
```text
start    24  7 61 15 38  3 50       pivot = middle item = 15
         low stops at 24 (not < 15), high stops at 3 (not > 15): swap them
          3  7 61 15 38 24 50
         low stops at 61, high stops at 15: swap them
          3  7 15 61 38 24 50
         low passes high: done. Left part 3 7 15, right part 61 38 24 50
```
<!-- /figure -->

- **Best and average:** O(n log n). Good pivots split each range roughly in half, so there are about log n levels of partitioning, each O(n).
- **Worst:** O(n²), when every pivot is the smallest or largest value, so each partition only peels off one item. With a last-item pivot, an already sorted list does this. (The optional code lesson's quicksort uses the last item, which is why its demo slows down on sorted input.)
- **Memory:** in place, plus O(log n) for the recursion on average.
- **Stable:** no.
- **Spot it in code:** the words `pivot` and `partition`, and two recursive calls on the parts.

### Merge sort

Split the list in half, sort each half recursively, then **merge** the two sorted halves by repeatedly taking the smaller front item.

<!-- figure
row: split | 29 4 17 // 8 42 11
row: sort each half | 4 17 29 // 8 11 42
row: merge | 4 8 11 17 29 42 | take the smaller front item each time
-->
```text
split    29  4 17 | 8 42 11
sort      4 17 29 | 8 11 42
merge    take 4, 8, 11, 17, 29, 42 (the smaller front item each time)
```
<!-- /figure -->

- **Best, average, worst:** O(n log n), always: log n levels of splitting, and each level merges n items in total.
- **Memory:** O(n) extra, for the merged lists. It doesn't sort in place.
- **Stable:** yes, when ties take the left item first.
- **Spot it in code:** splits at `mid`, two recursive calls, then a merge loop with two indexes walking two halves into a temporary list.

### Heap sort

Build a max-heap from the list (O(n)), then remove the max n times, each time putting it at the end of the list (O(log n) each).

- **Best, average, worst:** O(n log n).
- **Memory:** in place. **Stable:** no.
- **Spot it in code:** `heapify`, `percolate_down` or `sift_down`, and child indexes `2 * i + 1` and `2 * i + 2`.

### Radix sort

Sort non-negative integers one digit at a time, starting from the ones digit. Each pass puts every number into one of 10 **buckets** by the digit it's looking at, then reads the buckets back in order, 0 to 9. After the pass for the largest number's last digit, the list is sorted.

<!-- figure
row: start | 170 45 75 90 802 24 2 66
row: by ones digit | 170 90 802 2 24 45 75 66 | buckets 0: 170 90, 2: 802 2, 4: 24, ...
row: by tens digit | 802 2 24 45 66 170 75 90
row: by hundreds digit | 2 24 45 66 75 90 170 802 | sorted
-->
```text
start              170  45  75  90 802  24   2  66
by ones digit      170  90 802   2  24  45  75  66     buckets 0: 170 90   2: 802 2   4: 24 ...
by tens digit      802   2  24  45  66 170  75  90
by hundreds digit    2  24  45  66  75  90 170 802
```
<!-- /figure -->

Each pass must keep the order from the pass before (append to the end of each bucket), or it undoes the earlier digits.

**Negative numbers:** sorting by digits sorts by absolute value. zyBooks' fix: after the digit passes, split the result into negatives and non-negatives, reverse the negatives, and put them first.

- **Best, average, worst:** O(n·k), where k is the number of digits in the largest number. When k is a small constant, that's O(n). The course study guide writes O(n·k); some worksheets write O(n).
- **Memory:** O(n) for the buckets. **Stable:** yes.
- **Spot it in code:** a loop over digit places (`pow_10 *= 10`), `// pow_10 % 10` to get a digit, and 10 buckets.

### Counting sort

For integers in a small range of k values: count how many times each value occurs, then write each value out that many times.

- **Best, average, worst:** O(n + k). **Memory:** O(k) for the counts.
- **Spot it in code:** a `count` list indexed by the values themselves, `count[x] += 1`.

### Bucket sort

Spread the numbers into k buckets by value range, sort each bucket (often with insertion sort), then join the buckets in order. With a maximum value of M, number x goes in bucket ⌊x × k / (M + 1)⌋. With 5 buckets and M = 99, the buckets hold 0 to 19, 20 to 39, and so on, so 57 goes in bucket ⌊57 × 5 / 100⌋ = 2.

- **Best and average:** O(n + k), when the values are spread evenly so each bucket gets a few.
- **Worst:** O(n²): every value lands in one bucket, and that bucket's sort does all the work.
- **Spot it in code:** a list of buckets indexed by a value range calculation, a sort on each bucket, and the buckets joined at the end.

### Quickselect

Quickselect finds the k-th smallest item (k starts at 0) without sorting the whole list. It partitions like quicksort, then recurses into **only the side that holds index k**.

- **Best and average:** O(n): the work halves each time, n + n/2 + n/4 + ... < 2n (like Pattern 7 above).
- **Worst:** O(n²), with bad pivots, as for quicksort.

### Sorting in Python

Python's `sorted(items)` returns a new sorted list, and `items.sort()` sorts in place. Both are stable and O(n log n). Two options change the order:

- `reverse=True` sorts largest first.
- `key=` gives a function to sort by: `sorted(words, key=len)` sorts by length, and `sorted(people, key=lambda p: p.age)` by an attribute.

### All ten at a glance

| Sort | Best | Average | Worst | Extra memory | Stable |
|---|---|---|---|---|---|
| Selection | O(n²) | O(n²) | O(n²) | O(1) | No |
| Insertion | O(n) | O(n²) | O(n²) | O(1) | Yes |
| Bubble (with early stop) | O(n) | O(n²) | O(n²) | O(1) | Yes |
| Shell | O(n log n) | about O(n^1.5) | O(n²) | O(1) | No |
| Quicksort | O(n log n) | O(n log n) | O(n²) | O(log n) | No |
| Merge | O(n log n) | O(n log n) | O(n log n) | O(n) | Yes |
| Heap | O(n log n) | O(n log n) | O(n log n) | O(1) | No |
| Radix | O(n·k) | O(n·k) | O(n·k) | O(n) | Yes |
| Counting | O(n + k) | O(n + k) | O(n + k) | O(k) | Yes |
| Bucket | O(n + k) | O(n + k) | O(n²) | O(n + k) | Yes, with a stable sort in each bucket |

Try selection, insertion, bubble, and merge sort on the [sorting bench above](#pattern-8-stopping-early-and-best-vs-worst-case): run each on sorted and reversed input and compare the comparison counts with this table.

## Questions

Trace each one before you answer. Many questions ask you to work out a count and then pick a Big-O.

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

- **11.9** Binary search. The list is sorted:

  <!-- figure
  index: yes
  row: items | 3 9 14 22 31 40 57 68 75 82 96
  -->
  ```text
  index    0   1   2   3   4   5   6   7   8   9  10
  items    3   9  14  22  31  40  57  68  75  82  96
  ```
  <!-- /figure -->

  **a)** Searching for 10, which values does `items[mid]` take, in order? Write them separated by commas.

  <!-- answer:11.9a blanks: 40, 14, 3, 9 | 40,14,3,9 -->

  **b)** What does the search return?

  <!-- answer:11.9b blanks: -1 -->

  **c)** At most how many comparisons does binary search need for a sorted list of 1,000 items?

  <!-- answer:11.9c blanks: 10 -->

  <details>
  <summary>Answer</summary>

  - **a)** low 0, high 10: mid 5, 40. 10 < 40, so high = 4. mid (0 + 4) // 2 = 2, 14. 10 < 14, so high = 1. mid (0 + 1) // 2 = 0, 3. 10 > 3, so low = 1. mid (1 + 1) // 2 = 1, 9. 10 > 9, so low = 2. **40, 14, 3, 9.**
  - **b)** low (2) has passed high (1), so the range is empty: **−1**, not found.
  - **c)** ⌊log₂ 1000⌋ + 1 = 9 + 1 = **10**.

  </details>

- **11.10** Simple sorts. Start from `12 3 45 7 30 21` each time.

  | Sort, after its first pass | List (separated by spaces) |
  |---|---|
  | Selection sort | |
  | Bubble sort | |

  <!-- answer:11.10a-b table: 3 12 45 7 30 21; 3 12 7 30 21 45 -->

  <details>
  <summary>Answer</summary>

  - **Selection:** the smallest value, 3, swaps with the first item, 12: `3 12 45 7 30 21`.
  - **Bubble:** compare neighbors left to right and swap any pair out of order: 12↔3, then 45↔7, 45↔30, 45↔21. The largest, 45, ends up last: `3 12 7 30 21 45`.

  </details>

- **11.11** Shell sort.

  **a)** Using zyBooks' suggestion (powers of 2 minus 1, largest first, below the list's length), which gaps does shell sort use for a list of 40 items? Separate them with commas.

  <!-- answer:11.11a blanks: 31, 15, 7, 3, 1 | 31,15,7,3,1 -->

  **b)** What is the list `60 14 85 9 33 72 5 48` after the gap-3 pass?

  <!-- answer:11.11b blanks: 5 14 72 9 33 85 60 48 | 5, 14, 72, 9, 33, 85, 60, 48 -->

  <details>
  <summary>Answer</summary>

  - **a)** 2ᵏ − 1 below 40: 1, 3, 7, 15, 31. Largest first: **31, 15, 7, 3, 1**.
  - **b)** The three interleaved lists are indexes 0, 3, 6 (60, 9, 5 → 5, 9, 60), indexes 1, 4, 7 (14, 33, 48, already in order), and indexes 2, 5 (85, 72 → 72, 85). Put back: **5 14 72 9 33 85 60 48**.

  </details>

- **11.12** Quicksort's partition, the zyBooks way (middle element as the pivot). The list is `24 7 61 15 38 3 50`.

  **a)** What is the pivot?

  <!-- answer:11.12a blanks: 15 -->

  **b)** What is the list after partitioning? Separate the values with spaces.

  <!-- answer:11.12b blanks: 3 7 15 61 38 24 50 | 3, 7, 15, 61, 38, 24, 50 -->

  **c)** What is quicksort's worst case, and what causes it?

  A. O(n log n), when the pivot is the median

  B. O(n²), when each pivot is the smallest or largest value left

  C. O(n), when the list is already sorted

  <!-- answer:11.12c choice: B -->

  <details>
  <summary>Answer</summary>

  - **a)** The middle index is (0 + 6) // 2 = 3, which holds **15**.
  - **b)** low stops at 24, high stops at 3: swap. low stops at 61, high stops at 15: swap. Now low has passed high: **3 7 15 61 38 24 50**, with 3, 7, 15 on the left.
  - **c)** **B.** Each partition then peels off one item, so there are n levels of O(n) work.

  </details>

- **11.13** Radix sort. The list is `53 7 210 38 91 4`. What is it after the first pass (by the ones digit)? Separate the values with spaces.

  <!-- answer:11.13 blanks: 210 91 53 4 7 38 | 210, 91, 53, 4, 7, 38 -->

  <details>
  <summary>Answer</summary>

  By ones digit: bucket 0 holds 210, 1 holds 91, 3 holds 53, 4 holds 4, 7 holds 7, and 8 holds 38. Read the buckets in order: **210 91 53 4 7 38**.

  </details>

- **11.14** Bucket sort and quickselect.

  **a)** Bucket sort uses 5 buckets for values from 0 to 99, putting x in bucket ⌊x × 5 / 100⌋. Which bucket does 80 go in?

  <!-- answer:11.14a blanks: 4 -->

  **b)** Quickselect with k = 2 (k starts at 0) on `31 8 54 17 90 26`. What value does it return?

  <!-- answer:11.14b blanks: 26 -->

  **c)** What is quickselect's average case?

  <!-- answer:11.14c blanks: [O(1), O(log n), O(n), O(n log n), O(n²)] => O(n) -->

  <details>
  <summary>Answer</summary>

  - **a)** ⌊80 × 5 / 100⌋ = ⌊4⌋ = **4**: the bucket for 80 to 99.
  - **b)** k = 2 asks for the third-smallest value. Sorted, the list would be 8, 17, 26, ...: **26**.
  - **c)** **O(n)**: it only recurses into one side, so the work is about n + n/2 + n/4 + ..., under 2n.

  </details>

- **11.15** Best, average, and worst cases.

  | Situation | Big-O |
  |---|---|
  | Insertion sort on a list that's already sorted | |
  | Selection sort on a list that's already sorted | |
  | Merge sort's worst case | |
  | Bucket sort when every value lands in one bucket | |
  | Quicksort's average case | |

  <!-- answer:11.15a-e table [O(n), O(n log n), O(n²)]: O(n); O(n²); O(n log n); O(n²); O(n log n) -->

  <details>
  <summary>Answer</summary>

  - Insertion sort compares each item once and moves nothing: O(n). Selection sort still scans the whole unsorted part every pass: O(n²).
  - Merge sort is O(n log n) in every case.
  - One full bucket leaves the bucket's own sort (often insertion sort) doing all the work: O(n²).
  - Quicksort averages O(n log n).

  </details>

- **11.16** Recognize the sort from clues in its code.

  | Clue in the code | Sort |
  |---|---|
  | `gap` shrinks each round, with an insertion sort that steps by `gap` | |
  | `pivot`, `partition`, and two recursive calls | |
  | compares `items[j]` with `items[j + 1]` and swaps them | |
  | `// pow_10 % 10`, and 10 buckets | |
  | tracks `index_smallest` in an inner loop, then one swap | |
  | splits at `mid`, two recursive calls, then a loop with two indexes into a temporary list | |

  <!-- answer:11.16a-f table [Selection, Insertion, Bubble, Shell, Quicksort, Merge, Radix, Bucket]: Shell; Quicksort; Bubble; Radix; Selection; Merge -->

  <details>
  <summary>Answer</summary>

  Shrinking gaps are shell sort. Pivot and partition are quicksort. Neighbor swaps are bubble sort. Digits and 10 buckets are radix sort. Tracking the smallest index is selection sort. Split, recurse, and merge is merge sort.

  </details>
