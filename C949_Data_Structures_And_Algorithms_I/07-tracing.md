# Lesson 7: Tracing pseudocode

Tracing means running code by hand, one line at a time, and writing down what every variable holds. It's how you find out what unfamiliar code does, and it's the quickest way to check your own Big-O reasoning.

Use a variable table: one column per variable, and a new row each time a loop goes around or a value changes. For recursion, write each call on its own line, indented under the call that made it, and fill in its return value when it finishes.

The snippets here are pseudocode, written the way course materials often show it:

- `for i from 1 to 10` includes both 1 and 10.
- `%` is the remainder after division.
- Indentation shows what's inside a loop or an `if`.

Your file: `c949-practice/lesson7.py`. There's no code to write: trace each snippet on paper, then type your answer into the matching variable and run `python lesson7.py`.

> [!WARNING]
> `lesson7.py` also has a Python translation of every snippet, below the answer variables. Reading it first gives the answers away, so trace on paper first.

## Exercises

- **7.1**\
  **In:** `ANSWER_7_1`, as `(x, i)`

  What are x and i when the loop ends?

  ```
  x = 0
  i = 1
  while i < 10
     x = x + i
     i = i * 2
  ```

  <!-- solution:7.1 -->
  <details>
  <summary>Hint</summary>

  - Write a variable table: one row per pass, including the final check that fails.

  </details>

  <details>
  <summary>Solution</summary>

  ```python
  ANSWER_7_1 = (15, 16)

  def trace_7_1():
      x, i = 0, 1
      while i < 10:
          x = x + i
          i = i * 2
      return (x, i)
  ```

  </details>
  <!-- /solution -->

- **7.2**\
  **In:** `ANSWER_7_2`

  What is x at the end?

  ```
  x = 28
  if x > 10 and x < 20
     x = 20
  else if x < 30
     x = 25
  else if x < 50
     x = 100
  else
     x = 500
  ```

  <!-- solution:7.2 -->
  <details>
  <summary>Hint</summary>

  - Only the first branch whose condition is true runs.

  </details>

  <details>
  <summary>Solution</summary>

  ```python
  ANSWER_7_2 = 25

  def trace_7_2():
      x = 28
      if x > 10 and x < 20:
          x = 20
      elif x < 30:
          x = 25
      elif x < 50:
          x = 100
      else:
          x = 500
      return x
  ```

  </details>
  <!-- /solution -->

- **7.3**\
  **In:** `ANSWER_7_3`, as a list

  What does this output, in order?

  ```
  for i from 1 to 10
     if i % 3 == 0
        output i
  ```

  <!-- solution:7.3 -->
  <details>
  <summary>Hint</summary>

  - "from 1 to 10" includes both ends.
  - `%` gives the remainder after division.

  </details>

  <details>
  <summary>Solution</summary>

  ```python
  ANSWER_7_3 = [3, 6, 9]

  def trace_7_3():
      return [i for i in range(1, 11) if i % 3 == 0]   # 'from 1 to 10' includes 10
  ```

  </details>
  <!-- /solution -->

- **7.4**\
  **In:** `ANSWER_7_4`, as `(count, 'O(...)')`

  With n = 4, what is count at the end?
  And what is the Big-O of this code, in terms of n?

  ```
  count = 0
  for i from 0 to n - 1
     for j from 0 to i - 1
        count = count + 1
  ```

  <!-- solution:7.4 -->
  <details>
  <summary>Hint</summary>

  - Count the inner passes for i = 0, 1, 2, 3 separately, then add them.
  - The Big-O is about how the count grows with n, not the count for n = 4.

  </details>

  <details>
  <summary>Solution</summary>

  ```python
  ANSWER_7_4 = (6, 'O(n^2)')

  def trace_7_4(n=4):
      count = 0
      for i in range(n):          # 0 to n - 1
          for j in range(i):      # 0 to i - 1
              count += 1
      return count
  ```

  </details>
  <!-- /solution -->

- **7.5**\
  **In:** `ANSWER_7_5`

  What does Mystery(7) return?

  ```
  Mystery(n)
     if n <= 0
        return 0
     return n + Mystery(n - 2)
  ```

  <!-- solution:7.5 -->
  <details>
  <summary>Hint</summary>

  - Expand the calls one at a time: Mystery(7) is 7 + Mystery(5), and so on, until n <= 0.

  </details>

  <details>
  <summary>Solution</summary>

  ```python
  ANSWER_7_5 = 16

  def mystery(n):
      if n <= 0:
          return 0
      return n + mystery(n - 2)
  ```

  </details>
  <!-- /solution -->

- **7.6**\
  **In:** `ANSWER_7_6`

  What is m at the end?

  ```
  list = [3, 8, 1, 6]
  m = list[0]
  for each item in list
     if item > m
        m = item
  ```

  <!-- solution:7.6 -->
  <details>
  <summary>Hint</summary>

  - m only changes when an item is bigger than m.

  </details>

  <details>
  <summary>Solution</summary>

  ```python
  ANSWER_7_6 = 8

  def trace_7_6():
      lst = [3, 8, 1, 6]
      m = lst[0]
      for item in lst:
          if item > m:
              m = item
      return m
  ```

  </details>
  <!-- /solution -->

- **7.7**\
  **In:** `ANSWER_7_7`, as `((left, right), parent, is_valid)`

  A heap is stored in an array with its root at index 1. Index 0 is unused.

  ```
  index:   1   2   3   4   5   6
  value:  50  30  40  10  20  35
  ```

  - What are the values of the left and right children of index 2?
  - What is the value of the parent of index 6?
  - Is this a valid max-heap? (True or False)

  <!-- solution:7.7 -->
  <details>
  <summary>Hint</summary>

  - With the root at index 1, the children of index i are 2i and 2i + 1, and its parent is i // 2.
  - In a max-heap, every parent is at least as large as its children.

  </details>

  <details>
  <summary>Solution</summary>

  ```python
  ANSWER_7_7 = ((10, 20), 40, True)

  HEAP_7_7 = [0, 50, 30, 40, 10, 20, 35]   # index 0 unused

  def trace_7_7():
      h = HEAP_7_7
      children = (h[2 * 2], h[2 * 2 + 1])
      parent = h[6 // 2]
      valid = all(h[i // 2] >= h[i] for i in range(2, len(h)))
      return (children, parent, valid)
  ```

  </details>
  <!-- /solution -->

- **7.8**\
  **In:** `ANSWER_7_8`, as a list

  What does PrintDown(3) output, in order?

  ```
  PrintDown(n)
     if n == 0
        return
     output n
     PrintDown(n - 1)
     output n
  ```

  <!-- solution:7.8 -->
  <details>
  <summary>Hint</summary>

  - Each call outputs before AND after its smaller call.
  - Draw the calls as a stack, and write down each output as it happens.

  </details>

  <details>
  <summary>Solution</summary>

  ```python
  ANSWER_7_8 = [3, 2, 1, 1, 2, 3]

  def trace_7_8():
      out = []

      def print_down(n):
          if n == 0:
              return
          out.append(n)
          print_down(n - 1)
          out.append(n)

      print_down(3)
      return out
  ```

  </details>
  <!-- /solution -->

- **7.9**\
  **In:** `ANSWER_7_9`, as `((first_pop, second_pop), peek)`

  Starting from an empty stack s, what do the two Pops return, and what does the Peek show?

  ```
  Push(s, 5)
  Push(s, 2)
  Pop(s)
  Push(s, 7)
  Push(s, 1)
  Pop(s)
  Peek(s)
  ```

  <!-- solution:7.9 -->
  <details>
  <summary>Hint</summary>

  - Pop removes the newest item. Peek looks at it without removing it.

  </details>

  <details>
  <summary>Solution</summary>

  ```python
  ANSWER_7_9 = ((2, 1), 7)

  def trace_7_9():
      s, pops = [], []
      s.append(5)
      s.append(2)
      pops.append(s.pop())
      s.append(7)
      s.append(1)
      pops.append(s.pop())
      return (tuple(pops), s[-1])
  ```

  </details>
  <!-- /solution -->
