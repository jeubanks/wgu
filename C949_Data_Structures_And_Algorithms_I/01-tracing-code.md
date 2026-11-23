# 1. Tracing code

Tracing means running code by hand and writing down what every variable holds.

After this page you can:

- Read pseudocode loops, operators, and indentation correctly
- Trace a loop with a variable table
- Trace recursive calls with a call stack or call list

## Reading pseudocode

> [!IMPORTANT]
> **Key idea:** Before you trace anything, pin down exactly which values a loop covers, because pseudocode ranges include both ends.

Pseudocode mostly reads like Python, with a few differences:

| Pseudocode | Means | Python |
|---|---|---|
| `for i from 1 to 5` | 1, 2, 3, 4, 5: **both ends included** | `range(1, 6)` |
| `for i from 0 to n - 1` | n passes, starting at 0 | `range(n)` |
| `a % b` | remainder: `17 % 5` is 2 | `a % b` |
| `a // b` or `floor(a / b)` | divide, drop the fraction: `17 // 5` is 3 | `a // b` |
| `output x`, `display x` | print x | `print(x)` |
| `else if` | checked only if the earlier tests were false | `elif` |

- **Indentation shows the body.** Lines indented under a `for`, `while` or `if` belong to it.
- `=` stores a value. `==` compares two values.
- **Indexes count from 0** unless the question says otherwise.

## The variable table

Write one column per variable. Add a row each time the loop checks its condition, **including the last check, the one that fails**. Run the body one line at a time, updating a value the moment it changes.

> [!IMPORTANT]
> **Key idea:** A loop's condition is always checked one more time than its body runs, since the final check is the one that fails.

```
total = 0
k = 1
while k <= 7
   total = total + k
   k = k + 3
output total
```

| Check | k <= 7? | total | k |
|---|---|---|---|
| start | | 0 | 1 |
| 1 | 1 <= 7: yes | 1 | 4 |
| 2 | 4 <= 7: yes | 5 | 7 |
| 3 | 7 <= 7: yes | 12 | 10 |
| 4 | 10 <= 7: **no**, exit | | |

The output is 12. The body ran 3 times, but the condition was checked 4 times.

## Loop traces

### Nested loops

The inner loop starts over on every pass of the outer loop. Trace a block of rows under each outer value.

> [!IMPORTANT]
> **Key idea:** Trace one pass at a time: an inner loop restarts on every outer pass, `break` ends the whole loop, and `continue` ends only the current pass.

```
for i from 1 to 2
   for j from i to 3
      output i * j
```

| i | j values | output |
|---|---|---|
| 1 | 1, 2, 3 | 1, 2, 3 |
| 2 | 2, 3 | 4, 6 |

The output is 1, 2, 3, 4, 6. The inner loop runs 3 times, then 2.

### break and continue

- `break` leaves the loop at once. No more passes happen.
- `continue` skips the rest of this pass and goes to the next one.

```
for n from 1 to 8
   if n % 5 == 0
      break
   if n % 2 == 0
      continue
   output n
```

n = 1 outputs 1. n = 2 is even, so `continue` skips its output. n = 3 outputs 3, and n = 4 is skipped. At n = 5, `break` ends the loop, so 6, 7 and 8 never run. The output is 1, 3.

## Tracing recursion

### Base case and recursive case

A **recursive** function calls itself on a smaller input. The **base case** answers directly and stops the calls. The **recursive case** calls the function on a smaller input and uses the answer. Each call must get closer to the base case.

> [!IMPORTANT]
> **Key idea:** Calls pile up until one reaches the base case, then the answers flow back up, deepest call first.

```
Factorial(n)
   if n <= 1
      return 1
   return n * Factorial(n - 1)
```

### The call stack

Every call gets a **frame** holding its own n. A call waits for the call it made, so frames stack up and only the top one runs. While `Factorial(1)` runs, inside `Factorial(3)`:

<!-- figure
frame: Factorial(1) | n = 1 | top: running, base case
frame: Factorial(2) | n = 2 | waiting for Factorial(1)
frame: Factorial(3) | n = 3 | waiting for Factorial(2)
frame: the caller | |
-->
```text
Factorial(1)   n = 1   top: running, base case
Factorial(2)   n = 2   waiting for Factorial(1)
Factorial(3)   n = 3   waiting for Factorial(2)
the caller
```
<!-- /figure -->

When the top frame returns, it's removed and the one below carries on. So code **before** the recursive call runs on the way down, and code **after** it runs on the way back up, deepest call first.

### The indented call list

On a whiteboard, write each call indented under its caller. Go down to the base case, then fill in the returns from the bottom up.

<!-- figure
call: Factorial(4) | | 4 * 6 = 24
call: >Factorial(3) | | 3 * 2 = 6
call: >>Factorial(2) | | 2 * 1 = 2
call: >>>Factorial(1) | base case | 1
-->
```text
Factorial(4)                 returns 4 * 6 = 24
  Factorial(3)               returns 3 * 2 = 6
    Factorial(2)             returns 2 * 1 = 2
      Factorial(1)  base     returns 1
```
<!-- /figure -->

One call per level and n levels: O(n) time and O(n) frames.

### Fibonacci: two calls per call

The Fibonacci numbers start F(0) = 0 and F(1) = 1. Each later one is the sum of the two before: 0, 1, 1, 2, 3, 5, ...

```
Fib(n)
   if n <= 1
      return n
   return Fib(n - 1) + Fib(n - 2)
```

Each call makes two calls, so the calls form a tree. `Fib(4)`, with what each call returns:

<!-- figure
nary: Fib(4)=3{Fib(3)=2{Fib(2)=1{Fib(1)=1, Fib(0)=0}, Fib(1)=1}, Fib(2)=1{Fib(1)=1, Fib(0)=0}}
-->
```text
                       Fib(4)=3
                 /                 \
           Fib(3)=2               Fib(2)=1
          /        \              /       \
     Fib(2)=1    Fib(1)=1    Fib(1)=1   Fib(0)=0
     /      \
Fib(1)=1  Fib(0)=0
```
<!-- /figure -->

The left side finishes before the right side starts, and each node adds its two children. That's 9 calls, with `Fib(2)` worked out twice. The call count roughly doubles as n grows: O(2ⁿ) time, but only O(n) stack depth, since one path is on the stack at a time.

### Infinite recursion and stack overflow

If the calls never reach a base case, they never stop:

```
Drop(n)
   if n == 0
      return 0
   return Drop(n - 3)
```

`Drop(6)` goes 6, 3, 0 and stops. `Drop(5)` goes 5, 2, −1, ... and jumps past 0 forever. Each call adds a frame, and running out of stack space is a **stack overflow**. Python stops at its recursion limit (usually 1000) and raises `RecursionError`. A base case of `if n <= 0` catches every path.

## Big-O summary

| Code shape | Best | Average | Worst | What decides it |
|---|---|---|---|---|
| One loop over n items | O(n) | O(n) | O(n) | Always n passes |
| A loop that can `break` early | O(1) | O(n) | O(n) | Best: exits on the first pass. Worst: never exits early |
| Nested loops, each over n | O(n²) | O(n²) | O(n²) | n inner passes for each outer pass |
| One recursive call on n − 1 | O(n) | O(n) | O(n) | n levels of calls |
| Two recursive calls on n − 1 and n − 2 | O(2ⁿ) | O(2ⁿ) | O(2ⁿ) | The call tree doubles at each level |

For more drills, see the [tracing lesson](code/07-tracing.md).

## Questions

- **1.1** Ranges.

  **a)** How many times does the body of `for i from 2 to 9` run?

  A. 7

  B. 8

  C. 9

  D. 10

  <!-- answer:1.1a choice: B -->

  **b)** Which Python loop runs over the same values?

  A. `for i in range(1, 9)`

  B. `for i in range(2, 9)`

  C. `for i in range(1, 10)`

  D. `for i in range(2, 10)`

  <!-- answer:1.1b choice: D -->

  <details>
  <summary>Answer</summary>

  - **a)** **B. 8**: 2 through 9 with both ends is 9 − 2 + 1. A, 7, is 9 − 2 without the +1.
  - **b)** **D.** `range` stops before its second number, so it needs 10 to include 9. B stops at 8.

  </details>

- **1.2** Make a variable table.

  ```
  a = 1
  b = 0
  while a < 20
     b = b + a
     a = a * 3
  output a, b
  ```

  **a)** What are a and b at the output?

  A. a = 9, b = 4

  B. a = 27, b = 39

  C. a = 27, b = 13

  D. a = 81, b = 40

  <!-- answer:1.2a choice: C -->

  **b)** How many times is `a < 20` checked?

  A. 4

  B. 3

  C. 5

  D. 2

  <!-- answer:1.2b choice: A -->

  <details>
  <summary>Answer</summary>

  | Check | a < 20? | b | a |
  |---|---|---|---|
  | 1 | 1: yes | 1 | 3 |
  | 2 | 3: yes | 4 | 9 |
  | 3 | 9: yes | 13 | 27 |
  | 4 | 27: no | | |

  - **a)** **C.** a is 27 and b is 13. B adds the new a to b, running the two body lines in the wrong order.
  - **b)** **A. 4**: three passes plus the check that fails. B, 3, forgets that last check.

  </details>

- **1.3** Nested loops.

  ```
  for i from 1 to 3
     for j from 1 to i
        output j
  ```

  **a)** What does it output, in order?

  A. 1, 1, 2, 1, 2, 3

  B. 1, 2, 3, 2, 3, 3

  C. 1, 2, 2, 3, 3, 3

  D. 1, 2, 3, 1, 2, 3

  <!-- answer:1.3a choice: A -->

  **b)** How many times does `output j` run?

  A. 3

  B. 6

  C. 9

  D. 10

  <!-- answer:1.3b choice: B -->

  <details>
  <summary>Answer</summary>

  - **a)** **A.** i = 1 gives 1. i = 2 gives 1, 2. i = 3 gives 1, 2, 3. C outputs i instead of j.
  - **b)** **B.** 1 + 2 + 3 = 6. C, 9, treats the inner loop as always running 3 times.

  </details>

- **1.4** break and continue. What is the output?

  ```
  total = 0
  for k from 1 to 10
     if k % 3 == 0
        continue
     if k > 7
        break
     total = total + k
  output total
  ```

  A. 12

  B. 27

  C. 28

  D. 19

  <!-- answer:1.4 choice: D -->

  <details>
  <summary>Answer</summary>

  - **D.** 3 and 6 are skipped: 1 + 2 + 4 + 5 + 7 = 19. At k = 8 the `continue` test fails (8 % 3 is 2), and 8 > 7 breaks the loop.
  - B adds 8 before breaking. C forgets that `continue` skips 3 and 6.

  </details>

- **1.5** Trace the calls.

  ```
  Bits(n)
     if n <= 1
        return n
     return Bits(n // 2) + n % 2
  ```

  **a)** What does `Bits(13)` return?

  A. 1

  B. 2

  C. 3

  D. 4

  <!-- answer:1.5a choice: C -->

  **b)** How many calls are made in all, counting the first?

  A. 4

  B. 3

  C. 5

  D. 2

  <!-- answer:1.5b choice: A -->

  <details>
  <summary>Answer</summary>

  - **a)** **C. 3.** The calls are on 13, 6, 3, 1. `Bits(1)` returns 1, `Bits(3)` = 1 + 1 = 2, `Bits(6)` = 2 + 0 = 2, `Bits(13)` = 2 + 1 = 3. B drops the first call's `13 % 2`.
  - **b)** **A. 4** calls. B, 3, leaves out the first.

  </details>

- **1.6** Fibonacci, using `Fib` from this page.

  **a)** What does `Fib(6)` return?

  A. 3

  B. 5

  C. 8

  D. 13

  <!-- answer:1.6a choice: C -->

  **b)** How many calls does `Fib(5)` make in all, counting the first?

  A. 15

  B. 9

  C. 25

  D. 5

  <!-- answer:1.6b choice: A -->

  <details>
  <summary>Answer</summary>

  - **a)** **C.** 0, 1, 1, 2, 3, 5, 8: F(6) is 8. B is F(5) and D is F(7): the count started one off.
  - **b)** **A.** The calls for n are 1 plus the calls for n − 1 and n − 2. For n = 0 to 5: 1, 1, 3, 5, 9, 15. D is the value of `Fib(5)`, not its calls.

  </details>

- **1.7** Which call never finishes?

  ```
  Steps(n)
     if n == 1
        return 0
     return 1 + Steps(n - 2)
  ```

  **a)** Which call causes infinite recursion?

  A. Neither

  B. `Steps(7)`

  C. `Steps(8)`

  D. Both

  <!-- answer:1.7a choice: C -->

  **b)** What does `Steps(7)` return?

  A. 4

  B. 3

  C. 2

  D. 0

  <!-- answer:1.7b choice: B -->

  <details>
  <summary>Answer</summary>

  - **a)** **C.** 8, 6, 4, 2, 0, −2, ... stays even, so it never lands on 1. Python raises `RecursionError`. A assumes `n - 2` always reaches the base case.
  - **b)** **B.** 7, 5, 3, 1: three calls each add 1, then the base case returns 0. A, 4, counts the calls instead.

  </details>

- **1.8** Work after the call. What does `Show(3)` output, in order?

  ```
  Show(n)
     if n == 0
        return
     Show(n - 1)
     output n
  ```

  A. 3, 2, 1

  B. 0, 1, 2, 3

  C. 3, 2, 1, 0

  D. 1, 2, 3

  <!-- answer:1.8 choice: D -->

  <details>
  <summary>Answer</summary>

  - **D.** The output comes after the recursive call, so it runs on the way back up, deepest call first. A is the order if `output n` came before the call. B forgets the base case returns without output.

  </details>
