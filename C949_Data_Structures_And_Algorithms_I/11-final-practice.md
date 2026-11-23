# 11. Final practice

Thirty questions that mix all three competencies (explaining algorithms, judging a data structure's impact, and applying algorithms), for when you've worked through pages 1 to 10. They use their own numbers, so they show whether you can apply each idea on your own.

- Work each one on paper first, then check it.
- Each question says which convention it uses, like the heap's root index or the order neighbors are taken in.
- The folded **Answer** under each question explains every part.
- Your answers and **Done** marks are saved in this browser, and the contents page shows your progress.

Topics in [Beyond the guide](beyond-the-guide.md) aren't asked here. For unlimited practice with new numbers every time, try the [practice quiz](practice-quiz.md).

## Questions

- **11.1** Pseudocode traces. `for i from 1 to 4` includes both 1 and 4.

  ```
  total = 0
  for i from 1 to 4
     if i % 2 == 0
        total = total + i * i
     else
        total = total - i
  ```

  **a)** What is `total` at the end?

  A. 30

  B. 16

  C. 20

  D. 0

  <!-- answer:11.1a choice: B -->

  ```
  x = 50
  count = 0
  while x > 1
     x = x // 3
     count = count + 1
  ```

  **b)** What are `count` and `x` when the loop ends?

  A. `count` 4, `x` 0

  B. `count` 2, `x` 5

  C. `count` 3, `x` 1

  D. `count` 3, `x` 1.85

  <!-- answer:11.1b choice: C -->

  **c)** How many times is `x > 1` checked, counting the last check that fails?

  A. 2

  B. 3

  C. 5

  D. 4

  <!-- answer:11.1c choice: D -->

  <details>
  <summary>Answer</summary>

  - **a)** **B, 16.** Odd i subtracts i, even i adds i². i = 1: 0 − 1 = −1. i = 2: −1 + 4 = 3. i = 3: 3 − 3 = 0. i = 4: 0 + 16 = 16. D stops at 3, as if the range excluded 4.
  - **b)** **C.** 50 // 3 = 16, 16 // 3 = 5, 5 // 3 = 1: three passes. D uses `/` instead of `//`. A runs one pass too many.
  - **c)** **D, 4.** The check runs before each of the 3 passes and once more, when 1 > 1 is false. B forgets that last check.

  </details>

- **11.2** Tracing recursion and the call stack.

  ```python
  def halves(n):
      if n < 1:
          return 0
      print(n, end=" ")
      total = n + halves(n // 2)
      print(total, end=" ")
      return total
  ```

  **a)** What does `halves(11)` print?

  A. `11 5 2 1 1 3 8 19`

  B. `11 5 2 1 0 1 3 8 19`

  C. `11 5 2 1 19 8 3 1`

  D. `11 19 5 8 2 3 1 1`

  <!-- answer:11.2a choice: A -->

  **b)** What is the largest number of `halves` frames on the call stack at the same time?

  A. 4

  B. 6

  C. 5

  D. 11

  <!-- answer:11.2b choice: C -->

  **c)** While `halves(0)` is running, what is n in the frame just below it on the stack?

  A. 1

  B. 0

  C. 2

  D. 11

  <!-- answer:11.2c choice: A -->

  **d)** What is the Big-O of `halves(n)`?

  A. O(n)

  B. O(1)

  C. O(2ⁿ)

  D. O(log n)

  <!-- answer:11.2d choice: D -->

  <details>
  <summary>Answer</summary>

  <!-- figure
  call: halves(11) | prints 11 | total 11 + 8 = 19, prints 19
  call: >halves(5) | prints 5 | total 5 + 3 = 8, prints 8
  call: >>halves(2) | prints 2 | total 2 + 1 = 3, prints 3
  call: >>>halves(1) | prints 1 | total 1 + 0 = 1, prints 1
  call: >>>>halves(0) | base case | returns 0
  -->
  ```text
  halves(11)        prints 11
    halves(5)       prints 5
      halves(2)     prints 2
        halves(1)   prints 1
          halves(0) returns 0
        total = 1 + 0 = 1, prints 1
      total = 2 + 1 = 3, prints 3
    total = 5 + 3 = 8, prints 8
  total = 11 + 8 = 19, prints 19
  ```
  <!-- /figure -->

  - **a)** **A.** The first print runs on the way down and the second on the way back up. B prints the base case, which returns before printing. C prints the totals outermost first, but the innermost call finishes first.
  - **b)** **C, 5.** The calls on 11, 5, 2, 1, and 0 are all waiting at once when `halves(0)` runs. A forgets the base-case frame.
  - **c)** **A, 1.** The frame below the top is the call that made it, `halves(1)`. D is the bottom of the stack.
  - **d)** **D, O(log n).** Each call halves n, so there are about log₂ n calls, each doing O(1) work. A counts down by 1, not by halves.

  </details>

- **11.3** Recursive Fibonacci, with F(0) = 0 and F(1) = 1.

  ```python
  def fib(n):
      if n <= 1:
          return n
      return fib(n - 1) + fib(n - 2)
  ```

  **a)** What does `fib(6)` return?

  A. 5

  B. 8

  C. 13

  D. 21

  <!-- answer:11.3a choice: B -->

  **b)** How many calls to `fib` happen in all for `fib(6)`, counting the first one?

  A. 7

  B. 13

  C. 15

  D. 25

  <!-- answer:11.3b choice: D -->

  **c)** What is the Big-O of this `fib(n)`?

  A. O(n)

  B. O(2ⁿ)

  C. O(n²)

  D. O(log n)

  <!-- answer:11.3c choice: B -->

  <details>
  <summary>Answer</summary>

  - **a)** **B, 8.** The sequence from F(0) is 0, 1, 1, 2, 3, 5, 8. A and C count from the wrong starting index.
  - **b)** **D, 25.** Let calls(n) be the calls to compute F(n): calls(0) = calls(1) = 1, and calls(n) = calls(n − 1) + calls(n − 2) + 1. That gives 1, 1, 3, 5, 9, 15, 25. C is the count for `fib(5)`. A assumes each value is computed once.
  - **c)** **B, O(2ⁿ).** Each call makes two more, and the same values are recomputed again and again, so the call count roughly doubles as n grows. A would be true only if each value were computed once.

  </details>

- **11.4** Linear search. The list is not sorted:

  <!-- figure
  index: yes
  row: items | 18 42 7 63 25 7 90
  -->
  ```text
  index    0   1   2   3   4   5   6
  items   18  42   7  63  25   7  90
  ```
  <!-- /figure -->

  Linear search checks each item in order, from index 0, and stops at the first match.

  **a)** How many comparisons does a search for 7 make?

  A. 3

  B. 2

  C. 6

  D. 7

  <!-- answer:11.4a choice: A -->

  **b)** How many comparisons does a search for 50 make?

  A. 6

  B. 4

  C. 7

  D. 8

  <!-- answer:11.4b choice: C -->

  **c)** Searching for 7, which index does linear search return?

  A. 2

  B. 3

  C. 5

  D. 2 and 5

  <!-- answer:11.4c choice: A -->

  <details>
  <summary>Answer</summary>

  - **a)** **A, 3.** It finds 7 at index 2 on the third check and stops there, never seeing the second 7. B gives the index, not the count.
  - **b)** **C, 7.** 50 isn't in the list, so linear search checks all 7 items. A missing key is the worst case. A is the last index.
  - **c)** **A, 2**, the index of the first 7. B is the comparison count. D keeps searching after the first match.

  </details>

- **11.5** Binary search. The list is sorted. Use `mid = (low + high) // 2`.

  <!-- figure
  index: yes
  row: items | 2 5 11 16 23 29 34 41 47 52 60 68 75
  -->
  ```text
  index    0   1   2   3   4   5   6   7   8   9  10  11  12
  items    2   5  11  16  23  29  34  41  47  52  60  68  75
  ```
  <!-- /figure -->

  **a)** Searching for 60, which values does `items[mid]` take, in order?

  A. 34, 52, 60

  B. 34, 60

  C. 34, 52, 68

  D. 34, 52, 68, 60

  <!-- answer:11.5a choice: D -->

  **b)** What index does the search return?

  A. 11

  B. 10

  C. 9

  D. 60

  <!-- answer:11.5b choice: B -->

  **c)** At most how many comparisons does binary search need for a sorted list of 2,000 items?

  A. 10

  B. 1,000

  C. 11

  D. 12

  <!-- answer:11.5c choice: C -->

  <details>
  <summary>Answer</summary>

  - **a)** **D.** low 0, high 12: mid 6, 34. 60 > 34, so low = 7. mid (7 + 12) // 2 = 9, 52. 60 > 52, so low = 10. mid (10 + 12) // 2 = 11, 68. 60 < 68, so high = 10. mid (10 + 10) // 2 = 10, 60. Found. B rounds mid up. A sets low = mid instead of mid + 1.
  - **b)** **B, 10.** A counts positions from 1.
  - **c)** **C, 11.** ⌊log₂ 2000⌋ + 1 = 10 + 1, since 2¹⁰ = 1,024 ≤ 2,000 < 2,048 = 2¹¹. A forgets the + 1.

  </details>

- **11.6** Simple sorts, pass by pass. Start from `41 16 58 23 9 34` each time.

  **a)** What is the list after insertion sort finishes i = 3 (the outer loop starts at i = 1)?

  A. `16 41 58 23 9 34`

  B. `9 16 23 41 58 34`

  C. `16 23 41 58 9 34`

  D. `9 16 23 58 41 34`

  <!-- answer:11.6a choice: C -->

  **b)** Insertion sort moves the item left one swap at a time. How many swaps does it make at i = 4?

  A. 3

  B. 5

  C. 1

  D. 4

  <!-- answer:11.6b choice: D -->

  **c)** What is the list after two passes of bubble sort (each pass compares neighbors from left to right)?

  A. `16 23 9 34 41 58`

  B. `16 41 23 9 34 58`

  C. `16 9 23 34 41 58`

  D. `9 16 58 23 41 34`

  <!-- answer:11.6c choice: A -->

  <details>
  <summary>Answer</summary>

  - **a)** **C.** i = 1: 16 moves left past 41, giving `16 41 58 23 9 34`. i = 2: 58 is bigger than 41, so nothing moves. i = 3: 23 moves left past 58 and 41, and stops at 16. A stops after i = 2. D is three passes of selection sort.
  - **b)** **D, 4.** At i = 4, 9 is smaller than 58, 41, 23, and 16, so it swaps 4 times to reach the front. Only four items are ahead of it, so B is one too many. C is selection sort's one swap.
  - **c)** **A.** Pass 1 swaps 41↔16, 58↔23, 58↔9, 58↔34: `16 41 23 9 34 58`. Pass 2 swaps 41↔23, 41↔9, 41↔34, and leaves 41 and 58. B is one pass, C is three.

  </details>

- **11.7** Quicksort's partition. In this version the pivot is the middle element, at index (low + high) // 2. `low` moves right while its item is smaller than the pivot. `high` moves left while its item is bigger than the pivot. If they've met or crossed, the partition is done; otherwise swap the two items, step both indexes one place, and repeat. The list is `52 19 76 40 88 23 61`.

  **a)** What is the pivot?

  A. 52

  B. 40

  C. 61

  D. 76

  <!-- answer:11.7a choice: B -->

  **b)** What is the list after partitioning?

  A. `19 23 40 52 61 76 88`

  B. `23 19 40 76 88 52 61`

  C. `23 19 76 40 88 52 61`

  D. `19 23 40 76 88 52 61`

  <!-- answer:11.7b choice: B -->

  **c)** Partition returns `high`, the last index of the left part. What index does it return?

  A. 2

  B. 3

  C. 1

  D. 6

  <!-- answer:11.7c choice: A -->

  <details>
  <summary>Answer</summary>

  - **a)** **B, 40.** The middle index is (0 + 6) // 2 = 3. A is the first item and C the last, which other versions use.
  - **b)** **B.** low stops at 52 (index 0). high skips 61 and stops at 23 (index 5). Swap them: `23 19 76 40 88 52 61`, then low = 1, high = 4. low skips 19 and stops at 76 (index 2). high skips 88 and stops at 40 (index 3). Swap them, then low = 3, high = 2. low stops at 76, high stops at 40. They've crossed, so it's done. C stops after the first swap. A and D sort items, but partitioning only splits them.
  - **c)** **A, 2.** The left part is 23 19 40 (indexes 0 to 2), and the right part is 76 88 52 61. B is `low`, or the pivot's starting index.

  </details>

- **11.8** Heapify and heap sort, with a max-heap whose root is at index 0. Heapify percolates down each index from n // 2 − 1 back to 0. Each heap sort round then swaps the root with the last unsorted item and percolates the new root down through the unsorted part. The list is `12 5 17 8 21 3 14 9`.

  **a)** At which index does heapify start?

  A. 4

  B. 7

  C. 0

  D. 3

  <!-- answer:11.8a choice: D -->

  **b)** What is the array after heapify?

  A. `21 17 14 12 9 8 5 3`

  B. `21 17 14 9 8 3 12 5`

  C. `21 12 17 9 5 3 14 8`

  D. `17 21 14 9 5 3 12 8`

  <!-- answer:11.8b choice: C -->

  **c)** Heap sort then does its first two rounds (end index 7, then 6). What is the whole array afterward, sorted part included?

  A. `17 12 14 9 5 3 8 21`

  B. `14 12 17 9 5 3 8 21`

  C. `17 9 14 8 5 3 12 21`

  D. `14 12 8 9 5 3 17 21`

  <!-- answer:11.8c choice: D -->

  <details>
  <summary>Answer</summary>

  - **a)** **D.** 8 // 2 − 1 = 3, the last item with a child. A forgets the − 1.
  - **b)** **C.** Index 3: 8 swaps with its child 9. Index 2: 17 beats 3 and 14, so it stays. Index 1: 5 swaps with the larger child, 21. Index 0: 12 swaps with 21, then beats 9 and 5: stop. D goes from index 0 forward. B inserts the items one at a time. A is fully sorted, which a heap needn't be.
  - **c)** **D.** Round 1: swap 21 and 8. 8 percolates down through indexes 0 to 6: it swaps with 17, then with 14. That gives `17 12 14 9 5 3 8 21`. Round 2: swap 17 and 8. 8 percolates down through indexes 0 to 5: it swaps with 14, then beats 3. A stops after one round. B swaps without percolating. C swaps with the first child that beats it, not the larger child.

  </details>

- **11.9** Radix sort and bucket sort.

  **a)** Radix sort on `318 47 205 96 41 730 18`. What is the list after the second pass (by the tens digit)?

  A. `730 41 205 96 47 318 18`

  B. `18 41 47 96 205 318 730`

  C. `205 318 18 730 41 47 96`

  D. `205 18 318 730 41 47 96`

  <!-- answer:11.9a choice: C -->

  **b)** How many passes does radix sort make on this list in all?

  A. 7

  B. 3

  C. 2

  D. 10

  <!-- answer:11.9b choice: B -->

  **c)** Bucket sort uses 4 buckets for values from 0 to 79, putting x in bucket ⌊x × 4 / 80⌋. Which buckets do 39 and 60 go in?

  A. 1 and 3

  B. 2 and 3

  C. 2 and 4

  D. 1 and 2

  <!-- answer:11.9c choice: A -->

  <details>
  <summary>Answer</summary>

  - **a)** **C.** First pass, by ones digit: `730 41 205 96 47 318 18`. Second pass, by tens digit, keeping that order within each bucket: bucket 0 holds 205, 1 holds 318 then 18, 3 holds 730, 4 holds 41 then 47, and 9 holds 96. 318 stays ahead of 18 because it came first in the last pass. The hundreds pass fixes that. A is after one pass. D reorders within a bucket, which breaks stability.
  - **b)** **B.** The largest value, 730, has 3 digits. A gives one pass per item, D one per bucket.
  - **c)** **A.** ⌊39 × 4 / 80⌋ = ⌊1.95⌋ = 1, the bucket for 20 to 39. ⌊60 × 4 / 80⌋ = 3, the bucket for 60 to 79. B rounds 1.95 up instead of down. C numbers the buckets from 1.

  </details>

- **11.10** Recognize the sort, and stability.

  ```python
  # Code A
  def mystery_a(items):
      for i in range(len(items) - 1):
          small = i
          for j in range(i + 1, len(items)):
              if items[j] < items[small]:
                  small = j
          items[i], items[small] = items[small], items[i]
  ```

  ```python
  # Code B (every item is a whole number from 0 to biggest)
  def mystery_b(items, biggest):
      tally = [0] * (biggest + 1)
      for x in items:
          tally[x] += 1
      result = []
      for value in range(biggest + 1):
          result.extend([value] * tally[value])
      return result
  ```

  **a)** Which sort is Code A?

  A. Selection

  B. Insertion

  C. Bubble

  D. Shell

  <!-- answer:11.10a choice: A -->

  **b)** Which sort is Code B?

  A. Radix

  B. Bucket

  C. Counting

  D. Selection

  <!-- answer:11.10b choice: C -->

  **c)** A stable sort sorts these items by their number only: `3a 1b 3c 2d 1e`. What is the result?

  A. `1e 1b 2d 3c 3a`

  B. `1b 1e 2d 3c 3a`

  C. `1e 1b 2d 3a 3c`

  D. `1b 1e 2d 3a 3c`

  <!-- answer:11.10c choice: D -->

  **d)** Which of selection, merge, heap, and radix sort are stable?

  A. Selection and merge

  B. Merge and radix

  C. Heap and radix

  D. Merge, heap, and radix

  <!-- answer:11.10d choice: B -->

  <details>
  <summary>Answer</summary>

  - **a)** **A, Selection.** The inner loop only tracks the index of the smallest item left, and there's one swap per pass, after the inner loop. Insertion and bubble sort swap neighbors inside the inner loop.
  - **b)** **C, Counting.** `tally` is a list indexed by the values themselves, and nothing compares two items. Radix sort would go digit by digit.
  - **c)** **D.** Equal numbers keep their starting order: 1b came before 1e, and 3a before 3c. A reverses every tie.
  - **d)** **B.** Selection sort's long-distance swap can jump an item past an equal one, so it isn't stable. Merge sort is stable when ties take the left item first. Heap sort isn't stable either, so D fails. Radix sort has to be stable: each pass relies on the order the last pass left.

  </details>

- **11.11** Counting pairs.

  ```python
  count = 0
  for i in range(n):
      for j in range(i + 1, n):
          count += 1
  ```

  **a)** What is `count` at the end when n = 8?

  A. 28

  B. 36

  C. 64

  D. 56

  <!-- answer:11.11a choice: A -->

  **b)** What is the Big-O?

  A. O(n)

  B. O(n²)

  C. O(n log n)

  D. O(2ⁿ)

  <!-- answer:11.11b choice: B -->

  <details>
  <summary>Answer</summary>

  - **a)** **A, 28.** For i = 0 to 7 the inner loop runs 7, 6, 5, 4, 3, 2, 1, 0 times: 7 + 6 + ... + 1, one for each pair i < j. B starts j at i. D counts each pair twice, and C counts every (i, j).
  - **b)** **B, O(n²).** The total is (n − 1) + ... + 1 = n(n − 1) / 2. The inner loop shrinks as i grows, but that only halves the total: it's about n²/2, and the ½ drops. Check by doubling: n = 16 gives 120 and n = 32 gives 496, about 4 times as many.

  </details>

- **11.12** A doubling loop with a growing inner loop.

  ```python
  count = 0
  i = 1
  while i < n:
      for j in range(i):
          count += 1
      i = i * 2
  ```

  **a)** What is `count` at the end when n = 32?

  A. 63

  B. 5

  C. 31

  D. 160

  <!-- answer:11.12a choice: C -->

  **b)** What is the Big-O?

  A. O(n log n)

  B. O(log n)

  C. O(n²)

  D. O(n)

  <!-- answer:11.12b choice: D -->

  <details>
  <summary>Answer</summary>

  - **a)** i takes the values 1, 2, 4, 8, and 16 (32 isn't less than 32). The inner loop runs that many times each: 1 + 2 + 4 + 8 + 16 = 31: **C**. A also runs i = 32. B counts only the outer passes, and D multiplies 5 × 32.
  - **b)** **D, O(n).** The outer loop runs log₂ n times, but the inner loops aren't all n long. They add up to 1 + 2 + 4 + ... which stays under n. Multiplying log n × n, as in A, would overestimate. Doubling n doubles the count (63 for n = 64, 127 for n = 128).

  </details>

- **11.13** Recursion with a loop in each call.

  ```python
  def r(n):
      if n <= 0:
          return 0
      total = 0
      for i in range(n):
          total += 1
      return total + r(n - 1)
  ```

  **a)** What does `r(5)` return?

  A. 5

  B. 15

  C. 21

  D. 25

  <!-- answer:11.13a choice: B -->

  **b)** How many calls to `r` happen in total for `r(5)`, counting the first one?

  A. 5

  B. 7

  C. 15

  D. 6

  <!-- answer:11.13b choice: D -->

  **c)** What is the Big-O of `r(n)`?

  A. O(n²)

  B. O(n)

  C. O(2ⁿ)

  D. O(n log n)

  <!-- answer:11.13c choice: A -->

  **d)** This version calls itself on `n // 2` instead. What is its Big-O?

  ```python
  def s(n):
      if n <= 1:
          return 1
      total = 0
      for i in range(n):
          total += 1
      return total + s(n // 2)
  ```

  A. O(log n)

  B. O(n log n)

  C. O(n)

  D. O(n²)

  <!-- answer:11.13d choice: C -->

  <details>
  <summary>Answer</summary>

  - **a)** **B, 15.** Each call adds its own n: 5 + 4 + 3 + 2 + 1 + 0. D gives every call 5. C runs each loop once too often.
  - **b)** **D, 6.** r(5), r(4), r(3), r(2), r(1), r(0). A forgets the base-case call.
  - **c)** **A, O(n²).** There are n + 1 calls, but they don't do the same work: the loops run n, n − 1, ..., 1 times, which adds up to n(n + 1) / 2. B counts only the calls.
  - **d)** **C, O(n).** The loops run n, n/2, n/4, ... times, which adds up to under 2n. There are log n calls, but the work halves each time. B multiplies log n calls by n each.

  </details>

- **11.14** Best, average, and worst cases. Give the Big-O of each.

  **a)** Bubble sort with an early stop, on a list that's already sorted

  A. O(n²)

  B. O(1)

  C. O(n)

  D. O(n log n)

  <!-- answer:11.14a choice: C -->

  **b)** Heap sort on a list that's already sorted

  A. O(n log n)

  B. O(n)

  C. O(n²)

  D. O(log n)

  <!-- answer:11.14b choice: A -->

  **c)** Quicksort that always picks the first item as pivot, on a list that's already sorted

  A. O(n log n)

  B. O(n²)

  C. O(n)

  D. O(log n)

  <!-- answer:11.14c choice: B -->

  **d)** Searching a BST built by inserting 1, 2, 3, ..., n in that order, for n

  A. O(log n)

  B. O(1)

  C. O(n log n)

  D. O(n)

  <!-- answer:11.14d choice: D -->

  <details>
  <summary>Answer</summary>

  - **a)** **C, O(n).** With the early stop, bubble sort makes one pass with no swaps, then stops. A is its worst case.
  - **b)** **A, O(n log n).** Heap sort is O(n log n) in every case: heapify scrambles the sorted order anyway. B is what insertion sort would do.
  - **c)** **B, O(n²).** A first-item pivot on sorted input puts everything on one side, so each partition peels off one item: n levels of O(n) work. A is quicksort's average case.
  - **d)** **D, O(n).** Sorted inserts make each key the right child of the last, a chain n long, so the search walks all of it. A assumes a balanced tree.

  </details>

- **11.15** Pick the ADT that fits each job best.

  **a)** Badge numbers of people inside a building, each at most once, in no order

  A. Bag

  B. List

  C. Dictionary

  D. Set

  <!-- answer:11.15a choice: D -->

  **b)** Raffle tickets in a jar, where one person can hold several identical tickets

  A. Bag

  B. Set

  C. Queue

  D. List

  <!-- answer:11.15b choice: A -->

  **c)** Support tickets, where the most urgent one is handled next

  A. Queue

  B. Stack

  C. Priority queue

  D. Bag

  <!-- answer:11.15c choice: C -->

  **d)** An editor's undo history, where the latest change is undone first

  A. Queue

  B. Stack

  C. List

  D. Priority queue

  <!-- answer:11.15d choice: B -->

  <details>
  <summary>Answer</summary>

  - **a)** **D, set.** Badge numbers are distinct and unordered. A bag would allow repeats.
  - **b)** **A, bag.** Tickets can repeat and have no order. A set would merge identical tickets into one.
  - **c)** **C, priority queue.** The most urgent ticket comes out first, whatever order they arrived in. A queue would serve the oldest first.
  - **d)** **B, stack.** The newest change comes off first (LIFO). A queue is FIFO: it would undo the oldest change.

  </details>

- **11.16** What `pop()` removes. Each structure starts empty, and 4, 9, 2, 7 are added in that order. Then one remove runs.

  **a)** A `collections.deque` gets each item with `appendleft`, then `pop()` runs. What does it return?

  A. 7

  B. 4

  C. 9

  D. 2

  <!-- answer:11.16a choice: B -->

  **b)** A priority queue gets each item with `heapq.heappush`, then `heappop` runs. What does it return?

  A. 4

  B. 7

  C. 9

  D. 2

  <!-- answer:11.16b choice: D -->

  **c)** On a structure holding n items, which remove is O(n)?

  A. `list.pop()`

  B. `deque.popleft()`

  C. `list.pop(0)`

  D. `deque.pop()`

  <!-- answer:11.16c choice: C -->

  **d)** What is the Big-O of `heapq.heappop` on n items?

  A. O(log n)

  B. O(1)

  C. O(n)

  D. O(n log n)

  <!-- answer:11.16d choice: A -->

  <details>
  <summary>Answer</summary>

  - **a)** **B, 4.** `appendleft` puts each new item at the front, so the deque reads 7 2 9 4, and `pop()` takes the right end. A, 7, is what a list's `pop()` gives after `append`.
  - **b)** **D, 2.** `heapq` is a min-heap, so `heappop` returns the smallest, whatever order the items came in. A, 4, treats it as a queue.
  - **c)** **C.** `pop(0)` shifts every other item one place left. A list's last item and both ends of a deque come off in O(1).
  - **d)** **A, O(log n).** `heappop` moves the last item to the root and percolates it down one level at a time. B, O(1), is the cost of peeking at the root, not removing it.

  </details>

- **11.17** Array-based lists. An empty array-based list starts with an array of size 2. When the array is full, the next append doubles its size and copies every item over first. Nine items are appended.

  **a)** How many times does the array resize?

  A. 2

  B. 4

  C. 3

  D. 7

  <!-- answer:11.17a choice: C -->

  **b)** How many item copies do the resizes make in all?

  A. 6

  B. 14

  C. 16

  D. 30

  <!-- answer:11.17b choice: B -->

  **c)** What is the array's size at the end?

  A. 8

  B. 9

  C. 32

  D. 16

  <!-- answer:11.17c choice: D -->

  **d)** Next, a new item is inserted at index 2. How many items shift one place right?

  A. 7

  B. 6

  C. 8

  D. 9

  <!-- answer:11.17d choice: A -->

  <details>
  <summary>Answer</summary>

  - **a)** **C, 3.** The 3rd append finds 2 items in 2 slots and resizes to 4. The 5th resizes to 8, and the 9th to 16. A, 2, misses the resize on the 9th append.
  - **b)** **B, 14.** Each resize copies the items already there: 2 + 4 + 8. D, 30, counts the new sizes (4 + 8 + 16) instead of the items copied.
  - **c)** **D, 16.** A, 8, forgets that the 9th item doesn't fit in 8 slots.
  - **d)** **A, 7.** The items at indexes 2 to 8 each move one place right, and the array has room, so there's no resize. B, 6, starts counting at index 3.

  </details>

- **11.18** A doubly-linked list holds `6 ⇄ 2 ⇄ 9 ⇄ 4`, with `head` at 6 and `tail` at 4. These run in order:

  1. Remove(the node holding 6)
  2. Append 7
  3. InsertAfter(the node holding 9, a new node holding 5)
  4. Remove(the node holding 4)
  5. Prepend 3

  **a)** What does the list hold now, from head to tail?

  A. 3, 2, 5, 9, 7

  B. 2, 9, 5, 7, 3

  C. 3, 2, 9, 7, 5

  D. 3, 2, 9, 5, 7

  <!-- answer:11.18a choice: D -->

  **b)** Which values do the node holding 5's `prev` and `next` pointers point to?

  A. `prev` 9, `next` 4

  B. `prev` 9, `next` 7

  C. `prev` 7, `next` 9

  D. `prev` 2, `next` 9

  <!-- answer:11.18b choice: B -->

  <details>
  <summary>Answer</summary>

  - Step 1 removes the head: `2 ⇄ 9 ⇄ 4`. Step 2: `2 ⇄ 9 ⇄ 4 ⇄ 7`.
  - Step 3: `2 ⇄ 9 ⇄ 5 ⇄ 4 ⇄ 7`. Step 4 links 5 and 7 to each other: `2 ⇄ 9 ⇄ 5 ⇄ 7`.
  - **a)** **D.** Step 5 gives **3, 2, 9, 5, 7**. A puts 5 before 9, as InsertBefore would. B adds 3 at the tail instead of the head.
  - **b)** **B, `prev` 9 and `next` 7.** Removing 4 set `5.next = 7` and `7.prev = 5`. A is what's left if the remove forgets to relink 5.

  </details>

- **11.19** Deques and stacks.

  **a)** These run in order. What do the two pops return, in order?

  ```python
  from collections import deque
  d = deque()
  d.append(5)
  d.appendleft(8)
  d.append(3)
  d.popleft()
  d.appendleft(1)
  d.pop()
  ```

  A. 8, 3

  B. 5, 1

  C. 3, 1

  D. 8, 1

  <!-- answer:11.19a choice: A -->

  **b)** What is `d[-1]` afterward?

  A. 1

  B. 3

  C. 5

  D. 8

  <!-- answer:11.19b choice: C -->

  **c)** A stack evaluates the postfix expression `4 7 2 - * 3 +`. Each number is pushed. Each operator pops the right operand, then the left operand, and pushes the result. What is the final value?

  A. −17

  B. 29

  C. 20

  D. 23

  <!-- answer:11.19c choice: D -->

  <details>
  <summary>Answer</summary>

  - **a)** **A, 8 then 3.** After the three pushes, the deque is `8 5 3`, front to back. `popleft()` returns 8, leaving `5 3`. `appendleft(1)` gives `1 5 3`, and `pop()` returns 3. D treats `appendleft(1)` as `append`.
  - **b)** **C, 5.** The deque is `1 5`, so the last item is 5. A, 1, is the first item, `d[0]`.
  - **c)** **D, 23.** Push 4, 7, 2. `-` pops 2 and 7 and pushes 7 − 2 = 5. `*` pops 5 and 4 and pushes 20. Push 3. `+` pops 3 and 20 and pushes 23. A, −17, subtracts in pop order (2 − 7). C, 20, stops before the last `+`.

  </details>

- **11.20** Hash tables.

  **a)** A table has 13 buckets, uses h = key % 13, and resolves collisions with linear probing, trying `(h + i) % 13` for i = 0, 1, 2, .... Starting empty, insert 27, 16, 40, 29, and 12, in that order. Which buckets do they land in, in that order?

  A. 1, 3, 1, 3, 12

  B. 1, 3, 2, 4, 12

  C. 1, 3, 0, 2, 12

  D. 2, 1, 3, 4, 0

  <!-- answer:11.20a choice: B -->

  **b)** Then insert 38. Which bucket does it land in?

  A. 0

  B. 13

  C. 12

  D. 1

  <!-- answer:11.20b choice: A -->

  **c)** Then search for 53, which isn't in the table. How many buckets does the search check before it stops?

  A. 1

  B. 4

  C. 5

  D. 13

  <!-- answer:11.20c choice: C -->

  **d)** A string hash starts at 5. For each character, it multiplies the hash so far by 3 and adds the character's code, where a = 1, b = 2, and c = 3. The result is taken modulo 10. Which bucket does `cab` go in?

  A. 9

  B. 2

  C. 1

  D. 7

  <!-- answer:11.20d choice: D -->

  **e)** A table that uses chaining has 8 buckets and holds 20 items. What is its load factor?

  A. 0.4

  B. 2

  C. 2.5

  D. 3

  <!-- answer:11.20e choice: C -->

  <details>
  <summary>Answer</summary>

  - **a)** **B.** 27 % 13 = 1 and 16 % 13 = 3. 40 % 13 = 1 is taken, so it tries 2. 29 % 13 = 3 is taken, so it tries 4. 12 % 13 = 12 is empty. A skips the probing and puts two keys in one bucket. C probes downward, and D uses `//` instead of `%`.
  - **b)** **A, 0.** 38 % 13 = 12 is taken, and (12 + 1) % 13 wraps to 0. B, 13, forgets to wrap: there is no bucket 13.
  - **c)** **C, 5.** 53 % 13 = 1. The search checks 1 (27), 2 (40), 3 (16), 4 (29), and then 5, which is empty, so 53 can't be further on. B, 4, leaves out that last empty check. Colliding keys pile up in a run, which is why linear probing slows as the table fills.
  - **d)** **D, 7.** 5 × 3 + 3 = 18 for `c`. 18 × 3 + 1 = 55 for `a`. 55 × 3 + 2 = 167 for `b`. 167 % 10 = 7. A, 9, reads the string backward. B, 2, starts the hash at 0.
  - **e)** **C, 2.5.** 20 / 8 is the average chain length. B, 2, uses `//`. Only chaining allows a load factor above 1.

  </details>

- **11.21** Tree terms and shapes. Use this tree:

  <!-- figure
  tree: K{E{B, G}, S{P}}
  -->
  ```text
            K
          /   \
         E     S
        / \   /
       B   G P
  ```
  <!-- /figure -->

  **a)** What are the tree's height and the depth of P?

  A. Height 2, P at depth 2

  B. Height 3, P at depth 3

  C. Height 2, P at depth 1

  D. Height 3, P at depth 2

  <!-- answer:11.21a choice: A -->

  **b)** How many internal nodes and edges does it have?

  A. 2 internal nodes, 5 edges

  B. 3 internal nodes, 6 edges

  C. 2 internal nodes, 6 edges

  D. 3 internal nodes, 5 edges

  <!-- answer:11.21b choice: D -->

  **c)** Which describes the tree's shape?

  A. Full and complete, but not perfect

  B. Complete, but not full or perfect

  C. Full, but not complete or perfect

  D. None of full, complete, or perfect

  <!-- answer:11.21c choice: B -->

  <details>
  <summary>Answer</summary>

  - **a)** **A.** The deepest nodes (B, G, P) are 2 edges below K, so the height and P's depth are both 2. B counts nodes on the path instead of edges.
  - **b)** **D.** The internal nodes are K, E, and S. The tree has 6 nodes, so it has 6 − 1 = 5 edges. A leaves out the root, which is internal because it has children.
  - **c)** **B.** Level 1 is full, and the last level's nodes (B, G, P) are as far left as possible, so it's complete. S has one child, so it isn't full, and so it isn't perfect. A misses that full needs every node to have 0 or 2 children.

  </details>

- **11.22** Rebuilding a BST. A BST's preorder traversal is 58, 24, 13, 37, 30, 81, 66, 72, 92.

  **a)** What is its postorder traversal?

  A. 13, 24, 30, 37, 58, 66, 72, 81, 92

  B. 58, 24, 81, 13, 37, 66, 92, 30, 72

  C. 13, 30, 37, 24, 72, 66, 92, 81, 58

  D. 92, 72, 66, 81, 30, 37, 13, 24, 58

  <!-- answer:11.22a choice: C -->

  **b)** What are the tree's height and its number of leaves?

  A. Height 3, 4 leaves

  B. Height 4, 4 leaves

  C. Height 3, 2 leaves

  D. Height 2, 4 leaves

  <!-- answer:11.22b choice: A -->

  <details>
  <summary>Answer</summary>

  Inserting the keys in preorder rebuilds the same tree, since each parent goes in before its children:

  <!-- figure
  tree: 58{24{13, 37{30}}, 81{66{, 72}, 92}}
  -->
  ```text
            58
          /    \
        24      81
       /  \    /  \
     13   37  66   92
         /      \
       30        72
  ```
  <!-- /figure -->

  - **a)** **C.** Left subtree (13, 30, 37, 24), right subtree (72, 66, 92, 81), then the root. A is the inorder traversal, B is level order, and D visits right before left.
  - **b)** **A.** 30 and 72 are 3 edges below 58, and 13, 30, 72, and 92 have no children. B counts nodes on the path instead of edges.

  </details>

- **11.23** Successors and removal. Use this BST. For a node with two children, remove replaces its key with its successor's.

  <!-- figure
  tree: 40{18{9, 27}, 65{52{47{, 49}, 58}, 80}}
  -->
  ```text
              40
            /    \
          18      65
         /  \    /  \
        9   27  52   80
               /  \
             47    58
               \
                49
  ```
  <!-- /figure -->

  **a)** What is the predecessor of 52?

  A. 47

  B. 49

  C. 40

  D. 58

  <!-- answer:11.23a choice: B -->

  **b)** Remove 40. Which key replaces it at the root?

  A. 52

  B. 49

  C. 27

  D. 47

  <!-- answer:11.23b choice: D -->

  **c)** What is the preorder traversal after removing 40?

  A. 47, 18, 9, 27, 65, 52, 49, 58, 80

  B. 47, 18, 65, 9, 27, 52, 80, 49, 58

  C. 47, 65, 80, 52, 58, 49, 18, 27, 9

  D. 47, 18, 9, 27, 65, 52, 58, 49, 80

  <!-- answer:11.23c choice: A -->

  <details>
  <summary>Answer</summary>

  - **a)** **B, 49.** 52 has a left subtree. Left once to 47, then right as far as possible, to 49. A, 47, stops after the first step left.
  - **b)** **D, 47.** 40 has two children. Its successor: right once to 65, then left as far as possible: 52, then 47. 47 has no left child, so 47 is copied into the root. A, 52, stops one step early. C, 27, is the predecessor, not the successor.
  - **c)** **A.** The old 47 node has one child, 49, so 49 moves up to become 52's left child. B is level order, and C visits right before left. D hangs 49 under 58 instead of moving it into 47's old place.

  </details>

- **11.24** Heap index math. This max-heap is stored in an array:

  <!-- figure
  index: yes
  row: heap | 90 72 85 40 61 80 33 15 22
  -->
  ```text
  index    0   1   2   3   4   5   6   7   8
  heap    90  72  85  40  61  80  33  15  22
  ```
  <!-- /figure -->

  **a)** Count indexes from 0, as this kit does. What are the indexes of the children of index 2?

  A. 4 and 5

  B. 3 and 4

  C. 5 and 6

  D. 6 and 7

  <!-- answer:11.24a choice: C -->

  **b)** What value is stored at 22's parent?

  A. 61

  B. 72

  C. 15

  D. 40

  <!-- answer:11.24b choice: D -->

  **c)** Now number the same nodes from 1, as the course study guide (in your course resources) does, so 90 is at position 1. What are the positions of 85 and of 85's left child?

  A. 2 and 5

  B. 3 and 6

  C. 3 and 7

  D. 2 and 4

  <!-- answer:11.24c choice: B -->

  **d)** How does a heap reach a node's parent and children?

  A. By arithmetic on the node's array index

  B. By following pointers stored in each node

  C. It can't. A heap only gives access to its root

  D. By searching the array for the node's value

  <!-- answer:11.24d choice: A -->

  <details>
  <summary>Answer</summary>

  - **a)** **C, 5 and 6.** From 0, the children of i are 2i + 1 and 2i + 2. A uses the count-from-1 formulas (2i and 2i + 1) on 0-based indexes.
  - **b)** **D, 40.** 22 is at index 8, and the parent is ⌊(i − 1) / 2⌋ = ⌊7 / 2⌋ = 3, holding 40. A, 61, uses ⌊i / 2⌋ = 4, the count-from-1 formula. C, 15, is 22's sibling.
  - **c)** **B, 3 and 6.** From 1, every position is one more, so 85 is at 3. The children of p are 2p and 2p + 1, so the left child is at 6 (80, the same node as index 5). A keeps 85's 0-based index. The two numberings name the same tree.
  - **d)** **A.** A heap is an array, so moving to a parent or child is one calculation. The heap rule only limits which value you remove: the root.

  </details>

- **11.25** A priority queue on a min-heap. A lower number means higher priority. The heap is stored in an array with the root at index 0, and it holds `4 9 7 15 12 10 20`.

  **a)** Enqueue 6. What is the array afterward?

  A. 4 9 7 15 12 10 20 6

  B. 4 9 7 6 12 10 20 15

  C. 6 4 7 9 12 10 20 15

  D. 4 6 7 9 12 10 20 15

  <!-- answer:11.25a choice: D -->

  **b)** Then dequeue once. What does it return, and what is the array afterward?

  A. Returns 4, leaving 6 9 7 15 12 10 20

  B. Returns 4, leaving 6 15 7 9 12 10 20

  C. Returns 4, leaving 6 7 9 12 10 20 15

  D. Returns 15, leaving 4 6 7 9 12 10 20

  <!-- answer:11.25b choice: A -->

  **c)** Then peek. What does it return, and how many items does the queue hold afterward?

  A. Returns 7, 6 items left

  B. Returns 6, 6 items left

  C. Returns 6, 7 items left

  D. Returns 20, 7 items left

  <!-- answer:11.25c choice: C -->

  <details>
  <summary>Answer</summary>

  - **a)** **D.** 6 goes in at index 7. Its parent, index 3, holds 15: 6 < 15, swap. Its new parent, index 1, holds 9: swap. Its new parent, index 0, holds 4, which is smaller: stop, after 2 swaps. B stops after one swap, and C swaps past the smaller root.
  - **b)** **A.** Dequeue returns the root, 4. The last value, 15, moves to the root. Its children are 6 and 7: swap with the smaller, 6. At index 1, its children are 9 and 12: swap with 9. At index 3, it has no children: stop. C shifts everything left, as `pop(0)` would.
  - **c)** **C.** Peek returns the root, 6, without removing it, so the queue still holds 7 items. B removes it as a dequeue would.

  </details>

- **11.26** Sets. X = {3, 8, 14, 21, 30} and Y = {8, 11, 21, 27}.

  **a)** What is X − Y?

  A. {11, 27}

  B. {3, 14, 30}

  C. {8, 21}

  D. {3, 11, 14, 27, 30}

  <!-- answer:11.26a choice: B -->

  **b)** Build X ∪ Y by adding every element of X to an empty set, then every element of Y. How many of those add calls leave the result unchanged?

  A. 0

  B. 4

  C. 7

  D. 2

  <!-- answer:11.26b choice: D -->

  **c)** What is `X ^ Y` in Python?

  A. {8, 21}

  B. {3, 8, 11, 14, 21, 27, 30}

  C. {3, 11, 14, 27, 30}

  D. {3, 14, 30}

  <!-- answer:11.26c choice: C -->

  **d)** Which set is a subset of X?

  A. {8, 11}

  B. {30, 3, 14}

  C. {21, 22}

  D. {14, 27}

  <!-- answer:11.26d choice: B -->

  <details>
  <summary>Answer</summary>

  - **a)** **B.** Take out the elements Y shares with X (8 and 21). A is Y − X, and C is X ∩ Y.
  - **b)** **D, 2.** X's 5 elements all go in. Then Y's 8 and 21 are already there, so those two adds do nothing. B, 4, counts every add from Y.
  - **c)** **C.** `^` is the symmetric difference: elements in exactly one of the sets. Drop the shared 8 and 21. A reads `^` as "and", which is `&`.
  - **d)** **B.** 30, 3, and 14 are all in X, and order doesn't matter. 11, 22, and 27 aren't in X.

  </details>

- **11.27** Graph terms. This adjacency matrix stores a graph. The row is the from-vertex and the column is the to-vertex, so a 1 in row A, column B means an edge A → B.

  <!-- figure
  grid: A B C D E / A: 0 1 0 1 0 / B: 0 0 1 0 0 / C: 1 0 0 0 1 / D: 0 0 1 0 0 / E: 0 0 0 0 0
  -->
  ```text
        A  B  C  D  E
     A  0  1  0  1  0
     B  0  0  1  0  0
     C  1  0  0  0  1
     D  0  0  1  0  0
     E  0  0  0  0  0
  ```
  <!-- /figure -->

  **a)** How many edges does the graph have?

  A. 3

  B. 5

  C. 12

  D. 6

  <!-- answer:11.27a choice: D -->

  **b)** Which vertices have an edge into C?

  A. A and E

  B. A, B, D, and E

  C. B and D

  D. B, D, and E

  <!-- answer:11.27b choice: C -->

  **c)** Is the graph cyclic?

  A. No: no vertex has an edge to itself

  B. Yes: A → B → C → A

  C. No: E has no outgoing edges

  D. Yes: A → D → C → E → A

  <!-- answer:11.27c choice: B -->

  **d)** The matrix isn't symmetric. What does that tell you?

  A. The graph is directed: some edges go one way only, like A → B with no B → A

  B. The graph is weighted, so some entries should be larger than 1

  C. The graph is disconnected, because E's row is all 0s

  D. The graph has a self-loop, because a diagonal entry is 1

  <!-- answer:11.27d choice: A -->

  <details>
  <summary>Answer</summary>

  - **a)** **D, 6.** The edges are A → B, A → D, B → C, C → A, C → E, and D → C, one for each 1 in the matrix. A, 3, halves the count, as for an undirected graph.
  - **b)** **C.** C's column has 1s in rows B and D. A reads C's row, which holds its outgoing edges. With 2 in and 2 out, C's degree is 4.
  - **c)** **B.** A → B → C → A starts and ends at A. A confuses a cycle with a self-loop. D needs an edge E → A, but E's row is all 0s.
  - **d)** **A.** An undirected edge would put a 1 in both (X, Y) and (Y, X). Row A, column B is 1, but row B, column A is 0, so that edge goes one way. A 0/1 matrix says nothing about weights, and E having no outgoing edges doesn't make the matrix lopsided by itself.

  </details>

- **11.28** Breadth-first search. Use this undirected graph. Take neighbors in alphabetical order.

  <!-- figure
  nodes: F 0 0, G 1.2 0, H 2.4 0, J 0 1.2, K 1.2 1.2, L 2.4 1.2, M 3.6 1.2
  edges: F-G, G-H, F-J, G-J, G-K, H-L, J-K, L-M
  -->
  ```text
     F --- G --- H
     |   / |     |
     |  /  |     |
     | /   |     |
     J --- K     L --- M
  ```
  <!-- /figure -->

  **a)** What is the BFS visit order starting at K?

  A. K, G, J, F, H, L, M

  B. K, G, F, J, H, L, M

  C. K, J, G, F, H, L, M

  D. K, G, F, H, J, L, M

  <!-- answer:11.28a choice: A -->

  **b)** What is the distance from K to M, in edges?

  A. 3

  B. 5

  C. 6

  D. 4

  <!-- answer:11.28b choice: D -->

  **c)** What is in the queue, front to back, right after G is visited and its new neighbors are enqueued?

  A. F, H

  B. F, H, J

  C. J, F, H

  D. J, F, H, K

  <!-- answer:11.28c choice: C -->

  <details>
  <summary>Answer</summary>

  The adjacency lists are F: G, J. G: F, H, J, K. H: G, L. J: F, G, K. K: G, J. L: H, M. M: L.

  | Dequeue | Enqueue (newly discovered) | Queue afterward |
  |---|---|---|
  | K | G, J | G, J |
  | G | F, H (J and K are already discovered) | J, F, H |
  | J | (none) | F, H |
  | F | (none) | H |
  | H | L | L |
  | L | M | M |
  | M | (none) | empty |

  - **a)** **A.** B is depth-first: it goes from G to F before finishing K's neighbors. C takes neighbors in reverse order. D forgets that J was already waiting in the queue.
  - **b)** **D, 4.** K → G → H → L → M. B, 5, counts the vertices on the path instead of the edges.
  - **c)** **C.** J was enqueued when K was visited, and F and H join behind it. D enqueues K again, though it was already discovered.

  </details>

- **11.29** Depth-first search on a directed graph, using the recursive DFS from [page 9](09-sets-graphs.md): visit a vertex, then call DFS on each unvisited neighbor. Take each vertex's outgoing edges in alphabetical order.

  <!-- figure
  nodes: P 0 0.6, Q 1.3 0, S 1.3 1.2, R 2.6 0, T 2.6 1.2
  edges: P>Q, P>S, Q>R, Q>T, S>Q, S>T, T>R
  -->
  ```text
  P → Q      Q → R      S → Q      T → R
  P → S      Q → T      S → T
  ```
  <!-- /figure -->

  **a)** What is the visit order starting at P?

  A. P, Q, S, R, T

  B. P, Q, R, T, S

  C. P, S, T, R, Q

  D. P, Q, T, R, S

  <!-- answer:11.29a choice: B -->

  **b)** What is the largest number of DFS calls on the call stack at the same time?

  A. 3

  B. 2

  C. 4

  D. 5

  <!-- answer:11.29b choice: A -->

  **c)** What is the visit order starting at S?

  A. S, T, R, Q

  B. S, Q, T, R

  C. S, Q, R, T, P

  D. S, Q, R, T

  <!-- answer:11.29c choice: D -->

  <details>
  <summary>Answer</summary>

  - **a)** **B.** P's first neighbor is Q. Q's first is R, which has no outgoing edges, so its call returns. Back at Q, the next is T, whose only neighbor R is visited. Back at P, the next is S, and both of S's neighbors are visited. A is breadth-first, and C takes edges in reverse order.
  - **b)** **A, 3.** dfs(P), dfs(Q) and dfs(R) are waiting at once, and later dfs(P), dfs(Q) and dfs(T). dfs(S) is called straight from dfs(P). C, 4, calls dfs(R) again from T, but R is already visited.
  - **c)** **D.** S goes to Q, Q to R, then Q to T. P has no incoming edges, so it's never reached. C assumes DFS reaches every vertex. In a directed graph, the start vertex decides what DFS can reach.

  </details>

- **11.30** Python types and operators.

  **a)** What do `-19 // 4` and `-19 % 4` give?

  A. `-4` and `-3`

  B. `-5` and `-3`

  C. `-5` and `1`

  D. `-4` and `1`

  <!-- answer:11.30a choice: C -->

  **b)** What do `19 / 4` and `2 * 3 ** 2` give?

  A. `4` and `18`

  B. `4.75` and `18`

  C. `4.75` and `36`

  D. `4` and `36`

  <!-- answer:11.30b choice: B -->

  **c)** What does `not 3 > 5 and 2 == 2.0` give?

  A. `False`

  B. `TypeError`

  C. `None`

  D. `True`

  <!-- answer:11.30c choice: D -->

  **d)** What does this print?

  ```python
  a = [6, 7]
  b = a
  b.append(3)
  c = a + [4]
  c.append(5)
  print(len(a), len(c))
  ```

  A. `3 5`

  B. `2 4`

  C. `5 5`

  D. `3 4`

  <!-- answer:11.30d choice: A -->

  **e)** Which of these can be a key in a Python `dict`?

  A. `[1, 2]`

  B. `(1, 2)`

  C. `{1, 2}`

  D. `{1: 2}`

  <!-- answer:11.30e choice: B -->

  <details>
  <summary>Answer</summary>

  - **a)** **C.** `//` rounds down, toward negative infinity, so −4.75 becomes −5. The remainder then has to make −5 × 4 + r = −19, so it's 1. A truncates toward zero, as some other languages do.
  - **b)** **B.** `/` always gives a float, and `**` goes before `*`: 2 × 9. A is `//`, and C works left to right: (2 × 3)².
  - **c)** **D.** `not` binds looser than `>`, so `3 > 5` is False and `not` makes it True. `2 == 2.0` is True, since an int and a float with the same value are equal. A assumes they aren't.
  - **d)** **A.** `b = a` names the same list, so appending through `b` makes `a` hold 3 items. `a + [4]` builds a new list, so appending 5 to `c` doesn't touch `a`. B treats `b = a` as a copy.
  - **e)** **B.** Keys must be hashable. A tuple is immutable, but a list, a set, and a dict can change, so they can't be keys.

  </details>
