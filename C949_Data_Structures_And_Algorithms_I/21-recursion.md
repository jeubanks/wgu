# 21. Recursion

A recursive function solves a problem by calling itself on a smaller copy of the same problem. Each call shrinks the problem a little, until one call gets a version so small it can answer directly. Then the answers pass back up, one call at a time.

This page follows zyBooks chapter 21: recursive functions, recursive search, debugging with output statements, creating a recursive function, recursive math functions, and exploring all possibilities. It adds the call stack, infinite recursion, and recursion vs loops, which the course study guide also lists.

For the Big-O of a recursive function, see [Pattern 10: recursion](11-algorithm-analysis.md#pattern-10-recursion) in chapter 11. For more tracing practice, the optional code lesson [Tracing pseudocode](code/07-tracing.md) has drills that need only paper.

## Recursive functions

A **recursive function** is a function that calls itself. A call the function makes to itself is a **recursive call**.

```python
def ladder(rung):
    if rung == 0:
        print("ground")
    else:
        print("rung", rung)
        ladder(rung - 1)
```

`ladder(3)` prints:

```text
rung 3
rung 2
rung 1
ground
```

`ladder(3)` prints its line and calls `ladder(2)`. That call prints and calls `ladder(1)`, which calls `ladder(0)`. `ladder(0)` prints `ground` and makes no call. Then each call finishes, from the last one back to the first. That's 4 calls in all for `ladder(3)`.

A `for` loop would print the same lines more simply. `ladder` is here to show how recursion works. Recursion pays off on problems that contain smaller copies of themselves, like searching half a list or walking a tree.

### Base case and recursive case

Every recursive function has two parts:

- The **base case** answers directly, with no recursive call. The base case is what stops the recursion.
- The **recursive case** calls the function on a smaller problem, then uses that answer.

In zyBooks' code the two parts are usually one if-else, with the base case first and the recursive calls under `else`. A function can have more than one base case.

```python
def sum_to(n):
    if n == 0:                   # base case
        return 0
    return n + sum_to(n - 1)     # recursive case
```

`sum_to(n)` adds 1 + 2 + ... + n. Each call waits for the call below it, then adds its own n. The calls go down, and the returns come back up:

```text
sum_to(4)
  sum_to(3)
    sum_to(2)
      sum_to(1)
        sum_to(0)
        returns 0
      returns 1 + 0 = 1
    returns 2 + 1 = 3
  returns 3 + 3 = 6
returns 4 + 6 = 10
```

Each line that starts with `returns` belongs to the call above it at the same indent. `sum_to(4)` makes 5 calls: n = 4, 3, 2, 1, 0.

Two things make `sum_to` work:

- The recursive call gets a smaller n, so each call moves closer to the base case.
- The base case catches every path. Here, every n that's 0 or more counts down to exactly 0.

### The call stack

Each call to a function gets its own **stack frame**: a block of memory holding that call's parameters, local variables, and the place to return to. zyBooks describes this as each call getting its own namespace for its local variables. So the 5 calls to `sum_to` each have their own n, and changing one doesn't touch the others.

The frames sit on the **call stack**. A call pushes a frame, and a return pops it. The frame on top belongs to the call that's running. The others are waiting for the call above them to return.

At the deepest point of `sum_to(4)`:

```text
sum_to(0)   n = 0   ← top: running now
sum_to(1)   n = 1   waiting for sum_to(0)
sum_to(2)   n = 2   waiting for sum_to(1)
sum_to(3)   n = 3   waiting for sum_to(2)
sum_to(4)   n = 4   waiting for sum_to(3)
(the code that called sum_to(4))
```

`sum_to(0)` returns 0 and its frame pops. `sum_to(1)` is on top again, finishes 1 + 0, returns, and pops. This repeats until `sum_to(4)` returns 10 and the stack is back where it started.

The **depth of recursion** is how many calls have started but not yet returned. Here it reaches 5. The stack follows last in, first out, the same rule as the stack ADT in [chapter 3](03-stacks-queues.md#the-stack-adt).

Every frame takes memory, so a recursion d calls deep uses O(d) extra space, even when each call uses only O(1).

## Recursive search

Some algorithms are recursive by nature: one step of the algorithm is the whole algorithm again, on a smaller piece. zyBooks introduces the idea with a number-guessing game. You guess the middle of the range, hear "higher" or "lower", and play the same game again on the half that's left.

### Binary search

Binary search on a sorted list works the same way. Check the middle item. If it isn't the target, search only the half the target could be in. zyBooks' version passes the current window as `low` and `high`, and has two base cases:

```python
def find(items, target, low, high):
    mid = (low + high) // 2
    if items[mid] == target:     # base case 1: found it
        return mid
    if low == high:              # base case 2: one item left, and it isn't the target
        return -1
    if target < items[mid]:
        return find(items, target, low, mid)       # lower half, mid included
    return find(items, target, mid + 1, high)      # upper half
```

The first call covers the whole list: `find(items, target, 0, len(items) - 1)`.

Searching `[4, 9, 15, 23, 31, 42, 57, 68]` for 57:

```text
find(low=0, high=7)   mid=3, items[mid]=23
  find(low=4, high=7)   mid=5, items[mid]=42
    find(low=6, high=7)   mid=6, items[mid]=57
    returns 6
  returns 6
returns 6
```

57 > 23, so search 4 to 7. 57 > 42, so search 6 to 7. The middle is 57: found at index 6, after 3 calls. Each call passes the answer straight up.

Two details follow zyBooks' convention:

- The **lower half keeps mid**: `low` to `mid`, not `mid - 1`. That way the window never becomes empty, and "one item left" (`low == high`) is the only not-found base case. Some versions use `mid - 1` and stop when `low > high` instead. Both work.
- The **upper half must skip mid**: `mid + 1` to `high`. `//` rounds down, so in a window of 6 to 7, mid is 6. If the upper half were `mid` to `high`, the next window would be 6 to 7 again, forever. Skipping mid is safe because mid was just checked.

Each call halves the window, so binary search makes about log₂ n calls: O(log n). The [binary search section in chapter 11](11-algorithm-analysis.md#binary-search) has the loop version.

### Recursion on a linked list

A linked list is a node followed by a smaller linked list, so it fits recursion too. One of zyBooks' labs prints a list this way. This function counts the nodes:

```python
def count_nodes(node):
    if node is None:             # base case: past the end of the list
        return 0
    return 1 + count_nodes(node.next)
```

On a list `k → e → y`:

```text
count_nodes(k)
  count_nodes(e)
    count_nodes(y)
      count_nodes(None)
      returns 0
    returns 1 + 0 = 1
  returns 1 + 1 = 2
returns 1 + 2 = 3
```

Four calls for three nodes: one per node, plus one for the `None` at the end. Searching a list for a value is the same shape, with a second base case for finding it. [Chapter 5](05-trees.md#bst-recursion) does the same on binary search trees.

## Adding output statements for debugging

A bug in a recursive function is hard to see, because many calls are active at once. It helps to print what each call does. zyBooks adds a trick: pass an `indent` string that grows by a few spaces on each recursive call, and start every print with it. The output's indentation then shows how deep each line is.

```python
def find_debug(items, target, low, high, indent=""):
    print(f"{indent}find({low}, {high})")
    mid = (low + high) // 2
    if items[mid] == target:
        print(f"{indent}found at {mid}")
        pos = mid
    elif low == high:
        print(f"{indent}not found")
        pos = -1
    elif target < items[mid]:
        print(f"{indent}lower half")
        pos = find_debug(items, target, low, mid, indent + "   ")
    else:
        print(f"{indent}upper half")
        pos = find_debug(items, target, mid + 1, high, indent + "   ")
    print(f"{indent}returning {pos}")
    return pos
```

Searching the same list, `[4, 9, 15, 23, 31, 42, 57, 68]`, for 10, which isn't there:

```text
find(0, 7)
lower half
   find(0, 3)
   upper half
      find(2, 3)
      lower half
         find(2, 2)
         not found
         returning -1
      returning -1
   returning -1
returning -1
```

- The calls go down: windows 0 to 7, 0 to 3, 2 to 3, then 2 to 2.
- The window 2 to 3 keeps mid (index 2) in its lower half, so the last window is 2 to 2.
- The -1 then comes back up through every level.

If a base case returned the wrong value, you'd see it at the deepest `returning` line, and you'd see it carried up through the others.

Notes on the technique:

- It needs one extra parameter, the indent.
- Each call adds spaces when it passes the indent down. No call ever has to remove spaces, because each call has its own `indent` variable. The caller's `indent` is unchanged when the call returns.
- Once the bug is fixed, you can turn the prints into comments instead of deleting them, so they're ready the next time something breaks. For bigger programs, Python's `logging` module can switch debug output on and off without editing the code.

## Creating a recursive function

zyBooks builds a recursive function in two steps:

1. **Write the base case**, and test it. The base case is the one that returns without a recursive call. Leave the recursive case as a placeholder for now.
2. **Write the recursive case**, and test again.

For n factorial (n! = n × (n − 1) × ... × 1), step 1:

```python
def _factorial(n):
    if n <= 1:                   # base cases: 0! and 1! are both 1
        return 1
    return 0                     # FIXME: recursive case
```

Test the function with 0 and 1. Both return 1. Then step 2 replaces the placeholder:

```python
def _factorial(n):
    if n <= 1:                   # base cases: 0! and 1! are both 1
        return 1
    return n * _factorial(n - 1)
```

Tracing `_factorial(5)`:

```text
_factorial(5)
  _factorial(4)
    _factorial(3)
      _factorial(2)
        _factorial(1)
        returns 1
      returns 2 * 1 = 2
    returns 3 * 2 = 6
  returns 4 * 6 = 24
returns 5 * 24 = 120
```

5 calls, and 5! = 120.

### Outer and inner functions

Programmers often split a recursive function in two:

- An **outer** function that the rest of the program calls. It checks the input once.
- An **inner** function that does the recursion. Its name starts with `_`, which tells other programmers not to call it directly.

```python
def factorial(n):
    if n < 0:
        raise ValueError("n can't be negative")
    return _factorial(n)
```

The check runs once, not on every call. The inner function can also take extra parameters that only the recursion needs, like `low` and `high` in binary search, while the outer one keeps a simple signature.

### Before you write one

zyBooks suggests asking two questions first:

- Does the problem have a natural recursive solution? n! = n × (n − 1)! does. A formula with no smaller copy of itself inside doesn't.
- Is the recursive solution better than a loop? For factorial, no: a loop is just as short and uses less memory. For binary search, the recursive version is often easier to follow.

Python code uses recursion less often than code in many other languages, because loops are the usual Python habit. Recursion helps most when you can't know ahead of time how big or how branched the data is, which is the normal case for trees.

The two most common mistakes, both covered in [infinite recursion](#infinite-recursion-and-stack-overflow) below:

- Leaving out a base case that some input needs.
- Writing a recursive case that, for some inputs, never gets to a base case.

## Recursive math functions

### Fibonacci

The **Fibonacci sequence** starts 0, 1, and each number after that is the sum of the two before it: 0, 1, 1, 2, 3, 5, 8, 13, 21, ... Counting from index 0, fib(n) is the number at index n. It has two base cases:

```python
def fib(n):
    if n == 0:                   # base case 1
        return 0
    if n == 1:                   # base case 2
        return 1
    return fib(n - 1) + fib(n - 2)
```

Each call makes **two** calls, so the calls form a tree instead of a line. The call tree for `fib(4)`, with what each call returns:

```text
                       fib(4)=3
                 /                 \
           fib(3)=2               fib(2)=1
          /        \              /       \
     fib(2)=1    fib(1)=1    fib(1)=1   fib(0)=0
     /      \
fib(1)=1  fib(0)=0
```

- Read it top-down for the order of calls: `fib(4)` calls `fib(3)` first, and `fib(3)` finishes all of its calls before `fib(2)` on the right starts.
- Read it bottom-up for the returns: each node adds its two children's values.
- There are 9 calls. `fib(2)` runs twice, and the work it does is repeated each time.

That repeated work grows fast. The number of calls roughly doubles each time n goes up by 1 or 2: O(2ⁿ). Chapter 11's [Pattern 10](11-algorithm-analysis.md#pattern-10-recursion) counts it.

zyBooks also prints the sequence one step at a time by passing the last two numbers down to the next call. Passing them down removes the second call:

```python
def fib_fast(n, a=0, b=1):
    if n == 0:
        return a
    return fib_fast(n - 1, b, a + b)
```

```text
fib_fast(5, 0, 1)
  fib_fast(4, 1, 1)
    fib_fast(3, 1, 2)
      fib_fast(2, 2, 3)
        fib_fast(1, 3, 5)
          fib_fast(0, 5, 8)
          returns 5
        returns 5
      returns 5
    returns 5
  returns 5
returns 5
```

a and b walk along the sequence: (0, 1), (1, 1), (1, 2), (2, 3), (3, 5), (5, 8). When n reaches 0, a is the answer, and every call passes it straight up. That's n + 1 calls: O(n). Avoiding work on the same smaller problem twice is the idea behind [dynamic programming](01-introduction.md#dynamic-programming).

### Greatest common divisor (GCD)

The **GCD** of two positive whole numbers is the largest number that divides both evenly. Euclid's method, from around 300 BC, in the subtraction form zyBooks uses:

- If the two numbers are equal, that number is the GCD. (Base case.)
- Otherwise, subtract the smaller from the larger, and find the GCD of the new pair. (Recursive case.)

```python
def gcd(a, b):
    if a == b:                   # base case: equal numbers are the GCD
        return a
    if a < b:
        return gcd(a, b - a)
    return gcd(a - b, b)
```

```text
gcd(18, 30)
  gcd(18, 12)
    gcd(6, 12)
      gcd(6, 6)
      returns 6
    returns 6
  returns 6
returns 6
```

That's 4 calls. Both numbers must be at least 1, because with a 0 the subtraction never makes them equal. zyBooks' program checks this before the first call, which is the outer function's job.

Each call makes the larger number smaller, so `gcd(a, b)` makes at most max(a, b) calls. A faster form replaces subtraction with the remainder, `%`. It makes O(log n) calls for numbers up to n.

### Powers

base^exp is base multiplied by base^(exp − 1), and anything to the power 0 is 1:

```python
def power(base, exp):
    if exp == 0:
        return 1
    return base * power(base, exp - 1)
```

```text
power(3, 4)
  power(3, 3)
    power(3, 2)
      power(3, 1)
        power(3, 0)
        returns 1
      returns 3 * 1 = 3
    returns 3 * 3 = 9
  returns 3 * 9 = 27
returns 3 * 27 = 81
```

That's exp + 1 calls: O(exp). Python's `**` and `math.pow()` do this for you. The recursive version is for practice.

## Infinite recursion and stack overflow

**Infinite recursion** happens when the calls never reach a base case. There are two ways to cause it:

- There's no base case at all.
- There is one, but some inputs step over it.

```python
def down_by_two(n):
    if n == 0:
        return "done"
    return down_by_two(n - 2)
```

`down_by_two(4)` goes 4, 2, 0 and returns `"done"`. `down_by_two(5)` goes 5, 3, 1, −1, −3, ... It skips 0, and nothing else stops it.

Each call adds a frame, and the stack has a size limit. Running out of stack space is a **stack overflow**. Python stops runaway recursion before that happens, with a **recursion depth limit**:

- `sys.getrecursionlimit()` returns the limit, usually 1000.
- `sys.setrecursionlimit()` changes it.
- Going past it raises `RecursionError`, a kind of `RuntimeError`:

```text
RecursionError: maximum recursion depth exceeded in comparison
```

The fix is a base case that catches every path: `if n <= 0:` stops both 0 and −1.

Even a correct function hits the limit if the input is big enough. `sum_to(5000)` is correct, but it needs 5001 frames at once, so with the usual limit it raises `RecursionError`. A loop has no such limit.

## Work before and after the recursive call

Where you put a print, before or after the recursive call, decides the order of the output.

- Code **before** the call runs on the way **down**, in call order.
- Code **after** the call runs on the way **back up**, in reverse order, since the deepest call finishes first.

```python
def echo(n):
    if n == 0:
        return
    print("down", n)
    echo(n - 1)
    print("up", n)
```

`echo(3)` prints:

```text
down 3
down 2
down 1
up 1
up 2
up 3
```

Each call prints its "down" line, then waits for the whole call below it to finish, then prints its "up" line. So the "up" lines come out reversed. One of zyBooks' labs prints a number pattern that falls and then climbs back the same way.

The same rule explains why a postorder tree traversal visits children before their parent: the visit comes after both recursive calls.

## Recursive exploration of all possibilities

Recursion can try every possible arrangement or selection: every order of some letters, every subset of some items, every route through some cities. The choices form a tree:

- Each level of the tree is one choice.
- Each call makes one choice, then calls itself to make the rest.
- A base case is reached when every choice has been made. Each base case is one complete possibility, and it's usually printed or saved.

### Permutations

A **permutation** is one ordering of a set of items. n distinct items have n! permutations: n choices for the first, n − 1 for the second, and so on.

The function keeps two strings: the letters still to place, and the letters chosen so far. For each remaining letter, it moves that letter to the end of the chosen string and calls itself.

```python
def arrange(remaining, chosen):
    if remaining == "":                       # base case: nothing left to place
        print(chosen)
    else:
        for i in range(len(remaining)):       # try each remaining letter next
            rest = remaining[:i] + remaining[i + 1:]
            arrange(rest, chosen + remaining[i])
```

The tree for `arrange("pqr", "")`. Each node shows `remaining/chosen`:

```text
                         pqr/
           ┌──────────────┼──────────────┐
         qr/p           pr/q           pq/r         choose the 1st letter
       ┌──┴──┐        ┌──┴──┐        ┌──┴──┐
     r/pq   q/pr    r/qp   p/qr    q/rp   p/rq      choose the 2nd letter
      │      │       │      │       │      │
    /pqr   /prq    /qpr   /qrp    /rpq   /rqp       choose the 3rd letter: print
```

The calls go down the leftmost branch first, and the loop then tries the next letter at each level. The leaves, read left to right, are the output:

```text
pqr
prq
qpr
qrp
rpq
rqp
```

3! = 6 lines. The order follows the input: everything starting with `p` comes first, because the loop tries index 0 first.

zyBooks' word-scrambling example works on strings, the same way. Its shopping and travel examples use lists instead: move an item from the remaining list to the chosen list, recurse, then move it back. Putting it back undoes the choice so the loop can try the next item. Making a new list or string for each call, as `arrange` does, gets the same effect without undoing anything.

### Subsets

A **subset** is any selection of the items, in no particular order, from none of them to all of them. For each item there are two choices, in or out, so n items have 2ⁿ subsets.

```python
def subsets(items, picked):
    if not items:                             # base case: every item decided
        print(picked)
        return
    subsets(items[1:], picked + [items[0]])   # with the first item
    subsets(items[1:], picked)                # without it
```

Each call decides one item, then makes two calls:

```text
subsets([a, b], [])
  subsets([b], [a])
    subsets([], [a, b])     prints ['a', 'b']
    subsets([], [a])        prints ['a']
  subsets([b], [])
    subsets([], [b])        prints ['b']
    subsets([], [])         prints []
```

Output:

```text
['a', 'b']
['a']
['b']
[]
```

Swapping the two recursive calls lists the subsets in a different order. Either way, you get the same 2ⁿ subsets.

### Choosing k items

To list every group of exactly k items, the base case becomes "k items picked". To avoid listing the same group twice in different orders, each call picks only from the items **after** the last one picked:

```python
def choose(items, k, start, picked):
    if len(picked) == k:                      # base case: k items picked
        print(picked)
        return
    for i in range(start, len(items)):        # only items after the last one picked
        choose(items, k, i + 1, picked + [items[i]])
```

`choose(["w", "x", "y", "z"], 2, 0, [])` prints:

```text
['w', 'x']
['w', 'y']
['w', 'z']
['x', 'y']
['x', 'z']
['y', 'z']
```

zyBooks' shopping example fills a bag from a list of items, picking from **every** item not yet in the bag. That lists each group once for every order it can be picked in. For 2 of these 4 letters, it would print 4 × 3 = 12 lines, with each group twice, such as `w x` and `x w`. Using `start` cuts the output to the 6 groups above.

| Picking k of n items | Count | Formula |
|---|---|---|
| In order (every arrangement counts) | n × (n − 1) × ... for k terms | n! / (n − k)! |
| As a group (order doesn't matter) | that count divided by k! | n! / (k! (n − k)!) |

### All paths

zyBooks' last example lists every route through a set of cities, with each route's total distance. A route that visits every city once is a permutation of the cities. So the code is the permutation function with a different base case: when every city is on the path, add up the distances between neighboring cities and print the total. With n cities there are n! routes, which is why checking every route only works for small n.

## Recursion vs iteration

Any recursive function can be rewritten with a loop, and any loop can be rewritten with recursion. Here is `sum_to` as a loop:

```python
def sum_to_loop(n):
    total = 0
    for i in range(1, n + 1):
        total += i
    return total
```

| Question | Recursion | Loop |
|---|---|---|
| How does it stop? | A base case | The loop condition becomes false |
| How does it make progress? | Each call gets a smaller problem | A variable changes each pass |
| Extra memory | One stack frame per active call: O(depth) | Usually O(1) |
| Speed | Each call has some overhead | Usually a little faster |
| What goes wrong? | Infinite recursion ends in `RecursionError` | An infinite loop runs until it's stopped |
| Best fit | Trees, splitting in half, exploring every possibility | Counting, walking a list, running totals |

Choose recursion when the problem is made of smaller copies of itself and the recursive code is clearer. Choose a loop when a simple count or walk does the job, like factorial or `sum_to`.

## Big-O summary

| Function on this page | Calls | Time | Stack depth |
|---|---|---|---|
| `sum_to(n)`, `_factorial(n)`, `count_nodes` on n nodes | about n | O(n) | O(n) |
| `power(base, exp)` | exp + 1 | O(exp) | O(exp) |
| Recursive binary search on n items | about log₂ n | O(log n) | O(log n) |
| `fib(n)`, two calls each | grows exponentially | O(2ⁿ) | O(n) |
| `fib_fast(n)`, the last two numbers passed down | n + 1 | O(n) | O(n) |
| `gcd(a, b)` by subtraction | at most max(a, b) | O(max(a, b)) | O(max(a, b)) |
| All permutations of n items | n! leaves | O(n!) results | O(n) |
| All subsets of n items | 2ⁿ leaves | O(2ⁿ) results | O(n) |

The stack depth is the extra memory: one frame for each call that's waiting. A function whose calls form a tree, like `fib`, only has one path of the tree on the stack at a time, so its depth is the tree's height. Building or printing each permutation or subset also takes up to n steps, so the full cost is up to n times the number of results.

## Questions

- **21.1** Before and after.

  ```python
  def zigzag(word):
      if word == "":
          return
      print(word[0], end="")
      zigzag(word[1:])
      print(word[0], end="")
  ```

  **a)** What does `zigzag("tin")` print?

  <!-- answer:21.1a blanks: tinnit -->

  **b)** The first `print` is deleted, so only the one after the recursive call is left. What does `zigzag("tin")` print now?

  <!-- answer:21.1b blanks: nit -->

  <details>
  <summary>Answer</summary>

  - **a)** The calls are on `"tin"`, `"in"`, `"n"`, and `""`. On the way down, each prints its first letter: `t`, `i`, `n`. `zigzag("")` prints nothing. On the way back up, each prints its first letter again, deepest first: `n`, `i`, `t`. Together: **tinnit**.
  - **b)** Only the way back up is left, deepest call first: **nit**. Printing after the recursive call reverses the string.

  </details>

- **21.2** Counting calls.

  ```python
  def digit_sum(n):
      if n < 10:
          return n
      return n % 10 + digit_sum(n // 10)
  ```

  **a)** What does `digit_sum(40213)` return?

  <!-- answer:21.2a blanks: 10 -->

  **b)** How many times is `digit_sum` called in all, counting the first call?

  <!-- answer:21.2b blanks: 5 -->

  **c)** What is the Big-O of `digit_sum(n)`, in terms of the number n?

  <!-- answer:21.2c blanks: [O(1), O(log n), O(n), O(2ⁿ)] => O(log n) -->

  <details>
  <summary>Answer</summary>

  - **a)** Each call peels off the last digit with `% 10` and passes the rest down with `// 10`: 3 + 1 + 2 + 0 + 4 = **10**.
  - **b)** The calls are on 40213, 4021, 402, 40, and 4. 4 < 10 is the base case: **5** calls, one per digit.
  - **c)** **O(log n).** Each call divides n by 10, so the number of calls is the number of digits, about log₁₀ n.

  </details>

- **21.3** Something is missing.

  ```python
  def twos(n):                 # meant to return 2 to the power n
      return 2 * twos(n - 1)
  ```

  **a)** What happens when `twos(3)` runs?

  <!-- answer:21.3a blanks: [8, 0, RecursionError, IndexError] => RecursionError -->

  **b)** Which line, added at the start of the function, makes `twos(3)` return 8?

  A. `if n == 0: return 0`

  B. `if n == 0: return 1`

  C. `if n == 1: return 1`

  D. `if n < 0: return 2`

  <!-- answer:21.3b choice: B -->

  <details>
  <summary>Answer</summary>

  - **a)** There's no base case, so it calls `twos(2)`, `twos(1)`, `twos(0)`, `twos(-1)`, ... until Python's recursion limit raises a **RecursionError**.
  - **b)** **B.** 2⁰ = 1, so `twos(0)` returns 1, and the calls above it double it three times: 8.
    - A returns 0 from the bottom, and 2 × 0 is still 0.
    - C makes `twos(1)` return 1 instead of 2, so `twos(3)` returns 4.
    - D stops one level too low: `twos(-1)` returns 2, and four doublings give 32.

  </details>

- **21.4** Trace the returns.

  ```python
  def weave(a, b):
      if a == "":
          return b
      if b == "":
          return a
      return a[0] + b[0] + weave(a[1:], b[1:])
  ```

  `weave("abc", "XY")` makes three calls. Fill in what each one returns.

  | Call | Returns |
  |---|---|
  | `weave("abc", "XY")` | |
  | `weave("bc", "Y")` | |
  | `weave("c", "")` | |

  <!-- answer:21.4a-c table: aXbYc; bYc; c -->

  <details>
  <summary>Answer</summary>

  Fill the table from the bottom up, since the deepest call returns first.

  - `weave("c", "")`: b is empty, a base case. It returns a: **c**.
  - `weave("bc", "Y")`: `"b" + "Y" + "c"` = **bYc**.
  - `weave("abc", "XY")`: `"a" + "X" + "bYc"` = **aXbYc**.

  </details>

- **21.5** zyBooks-style binary search, using `find` from the Binary search section above, on this list:

  ```python
  items = [3, 8, 12, 20, 26, 33, 41, 50, 59]
  ```

  The first call is `find(items, 45, 0, 8)`.

  **a)** How many calls to `find` are made in all, counting the first?

  <!-- answer:21.5a blanks: 4 -->

  **b)** What are `low` and `high` in the last call?

  <!-- answer:21.5b blanks: low => 7; high => 7 -->

  **c)** What does the first call return?

  <!-- answer:21.5c blanks: -1 -->

  <details>
  <summary>Answer</summary>

  | Call | low | high | mid | items[mid] | Next |
  |---|---|---|---|---|---|
  | 1 | 0 | 8 | 4 | 26 | 45 > 26: upper half, 5 to 8 |
  | 2 | 5 | 8 | 6 | 41 | 45 > 41: upper half, 7 to 8 |
  | 3 | 7 | 8 | 7 | 50 | 45 < 50: lower half, 7 to 7, mid kept |
  | 4 | 7 | 7 | 7 | 50 | Not 45, and low == high: return −1 |

  - **a)** **4** calls.
  - **b)** **low 7, high 7.** zyBooks' lower half keeps mid, so the window shrinks to the single item 50.
  - **c)** **-1.** The last call returns −1, and every call above it passes it up.

  </details>

- **21.6** Every order.

  ```python
  def orders(left, built):
      if not left:
          print("".join(built))
          return
      for i in range(len(left)):
          orders(left[:i] + left[i + 1:], built + [left[i]])
  ```

  **a)** List everything `orders(["7", "1", "4"], [])` prints, in order, separated by commas.

  <!-- answer:21.6a blanks: 714, 741, 174, 147, 471, 417 | 714,741,174,147,471,417 -->

  **b)** How many lines does it print for a list of 5 different items?

  <!-- answer:21.6b blanks: 120 -->

  **c)** How many calls to `orders` are made in all for a list of 4 different items, counting the first call?

  <!-- answer:21.6c blanks: 65 -->

  <details>
  <summary>Answer</summary>

  - **a)** The loop tries the items in list order, so everything starting with 7 comes first, then 1, then 4. Under 7, the remaining list is `["1", "4"]`, giving 714 then 741. Under 1, it's `["7", "4"]`: 174, 147. Under 4, it's `["7", "1"]`: 471, 417. So: **714, 741, 174, 147, 471, 417**.
  - **b)** 5! = **120**.
  - **c)** Count the calls level by level. 1 call with 4 items left, 4 calls with 3 left, 4 × 3 = 12 with 2 left, 12 × 2 = 24 with 1 left, and 24 × 1 = 24 with none left. 1 + 4 + 12 + 24 + 24 = **65**.

  </details>

- **21.7** Every subset.

  ```python
  def pick(rest, taken):
      if rest == "":
          print(taken or "-")
          return
      pick(rest[1:], taken)              # skip the first letter
      pick(rest[1:], taken + rest[0])    # take it
  ```

  `taken or "-"` prints `-` for the empty subset.

  **a)** List everything `pick("mno", "")` prints, in order, separated by commas.

  <!-- answer:21.7a blanks: -, o, n, no, m, mo, mn, mno | -,o,n,no,m,mo,mn,mno -->

  **b)** How many lines does `pick` print for a string of 6 different letters?

  <!-- answer:21.7b blanks: 64 -->

  **c)** A shopping bag holds 3 of 5 different items. How many ways are there if the order you pick them in counts, as in zyBooks' shopping example? How many different groups of 3 are there?

  <!-- answer:21.7c blanks: Ordered => 60; Groups => 10 -->

  <details>
  <summary>Answer</summary>

  - **a)** Each call skips first, then takes, so "m skipped" comes before "m taken", and the same for n under each. With m and n both skipped, o skipped prints `-`, then o taken prints `o`. Then n taken: `n`, `no`. Then m taken, in the same pattern: `m`, `mo`, `mn`, `mno`. So: **-, o, n, no, m, mo, mn, mno**.
  - **b)** 2⁶ = **64**: each letter is either in or out.
  - **c)** Ordered: 5 × 4 × 3 = **60**. Groups: each group of 3 can be picked in 3! = 6 orders, so 60 / 6 = **10**.

  </details>

- **21.8** Two calls.

  ```python
  def tally(n):
      if n <= 0:
          return 1
      return tally(n - 1) + tally(n - 3)
  ```

  **a)** What does `tally(5)` return?

  <!-- answer:21.8a blanks: 9 -->

  **b)** How many calls to `tally` are made in all for `tally(5)`, counting the first?

  <!-- answer:21.8b blanks: 17 -->

  **c)** Which Big-O fits the number of calls as n grows?

  <!-- answer:21.8c blanks: [O(log n), O(n), O(n²), O(2ⁿ)] => O(2ⁿ) -->

  <details>
  <summary>Answer</summary>

  Work up from the base case. Any n ≤ 0 returns 1 in 1 call. For each larger n, add the two calls' values, and add their call counts plus 1 for the call itself:

  | n | tally(n) | Calls |
  |---|---|---|
  | 0 or less | 1 | 1 |
  | 1 | tally(0) + tally(−2) = 2 | 1 + 1 + 1 = 3 |
  | 2 | tally(1) + tally(−1) = 3 | 3 + 1 + 1 = 5 |
  | 3 | tally(2) + tally(0) = 4 | 5 + 1 + 1 = 7 |
  | 4 | tally(3) + tally(1) = 6 | 7 + 3 + 1 = 11 |
  | 5 | tally(4) + tally(2) = 9 | 11 + 5 + 1 = 17 |

  - **a)** **9.**
  - **b)** **17.**
  - **c)** **O(2ⁿ).** Each call makes two more, so the calls form a tree that keeps branching. The count grows by a constant factor (about 1.47) each time n goes up by 1: 119 calls for n = 10, 5,489 for n = 20. That's exponential growth. Of these choices, O(2ⁿ) is the one that bounds it, the same answer as for `fib`.

  </details>

- **21.9** Pick the Big-O of each function, for an input of size n (for `c` and `d`, n = `len(items)`, starting from i = 0).

  ```python
  def a(n):
      if n <= 1:
          return
      a(n - 1)
      a(n - 1)

  def b(n):
      if n <= 1:
          return 0
      return b(n // 3) + 1

  def c(items, i):
      if i == len(items):
          return
      for x in items:
          print(x)
      c(items, i + 1)

  def d(items, i):
      if i >= len(items):
          return 0
      return items[i] + d(items, i + 2)
  ```

  | Function | Big-O |
  |---|---|
  | `a(n)` | |
  | `b(n)` | |
  | `c(items, 0)` | |
  | `d(items, 0)` | |

  <!-- answer:21.9a-d table [O(log n), O(n), O(n²), O(2ⁿ), O(n!)]: O(2ⁿ); O(log n); O(n²); O(n) -->

  <details>
  <summary>Answer</summary>

  Count the calls, then the work in each call.

  - **a:** **O(2ⁿ).** Each call makes two calls on n − 1, so the number of calls doubles at each level: 2ⁿ⁻¹ + ... + 1 in all.
  - **b:** **O(log n).** One call on n / 3: the calls follow a dividing loop, about log₃ n of them. The base of the log doesn't matter.
  - **c:** **O(n²).** There are n + 1 calls, one for each i, and each one loops over all n items.
  - **d:** **O(n).** i goes up by 2, so there are about n / 2 calls, each doing O(1) work. Dropping the constant ½ leaves O(n).

  </details>
