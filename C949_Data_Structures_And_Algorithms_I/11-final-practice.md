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

  <!-- answer:11.1a blanks: 16 -->

  ```
  x = 50
  count = 0
  while x > 1
     x = x // 3
     count = count + 1
  ```

  **b)** Fill in the values when the loop ends.

  | Question | Answer |
  |---|---|
  | `count` | |
  | `x` | |
  | How many times `x > 1` is checked, counting the last check that fails | |

  <!-- answer:11.1b-d table: 3; 1; 4 -->

  <details>
  <summary>Answer</summary>

  - **a)** Odd i subtracts i, even i adds i². i = 1: 0 − 1 = −1. i = 2: −1 + 4 = 3. i = 3: 3 − 3 = 0. i = 4: 0 + 16 = **16**.
  - **b)** 50 // 3 = 16, 16 // 3 = 5, 5 // 3 = 1: three passes, so `count` is **3** and `x` is **1**. The check runs before each of the 3 passes and once more, when 1 > 1 is false: **4** checks.

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

  **a)** What does `halves(11)` print? Separate the numbers with spaces.

  <!-- answer:11.2a blanks: 11 5 2 1 1 3 8 19 -->

  **b)** What is the largest number of `halves` frames on the call stack at the same time?

  <!-- answer:11.2b blanks: 5 -->

  **c)** While `halves(0)` is running, what is n in the frame just below it on the stack?

  <!-- answer:11.2c blanks: 1 -->

  **d)** What is the Big-O of `halves(n)`?

  <!-- answer:11.2d blanks: [O(1), O(log n), O(n), O(2ⁿ)] => O(log n) -->

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

  - **a)** The first print runs on the way down and the second on the way back up: **11 5 2 1 1 3 8 19**.
  - **b)** The calls on 11, 5, 2, 1, and 0 are all waiting at once when `halves(0)` runs: **5** frames.
  - **c)** The frame below the top is the call that made it, `halves(1)`: n is **1**.
  - **d)** **O(log n).** Each call halves n, so there are about log₂ n calls, each doing O(1) work.

  </details>

- **11.3** Recursive Fibonacci, with F(0) = 0 and F(1) = 1.

  ```python
  def fib(n):
      if n <= 1:
          return n
      return fib(n - 1) + fib(n - 2)
  ```

  **a)** What does `fib(6)` return?

  <!-- answer:11.3a blanks: 8 -->

  **b)** How many calls to `fib` happen in all for `fib(6)`, counting the first one?

  <!-- answer:11.3b blanks: 25 -->

  **c)** What is the Big-O of this `fib(n)`?

  <!-- answer:11.3c blanks: [O(log n), O(n), O(n²), O(2ⁿ)] => O(2ⁿ) -->

  <details>
  <summary>Answer</summary>

  - **a)** The sequence from F(0) is 0, 1, 1, 2, 3, 5, 8, so F(6) is **8**.
  - **b)** Let calls(n) be the calls to compute F(n): calls(0) = calls(1) = 1, and calls(n) = calls(n − 1) + calls(n − 2) + 1. That gives 1, 1, 3, 5, 9, 15, **25**.
  - **c)** **O(2ⁿ).** Each call makes two more, and the same values are recomputed again and again, so the call count roughly doubles as n grows.

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

  | Key | Comparisons |
  |---|---|
  | 25 | |
  | 7 | |
  | 50 | |

  <!-- answer:11.4a-c table: 5; 3; 7 -->

  **d)** Searching for 7, which index does linear search return?

  <!-- answer:11.4d blanks: 2 -->

  <details>
  <summary>Answer</summary>

  - **25:** it checks 18, 42, 7, 63, then finds 25 at index 4: **5** comparisons.
  - **7:** it finds 7 at index 2 on the third check, so **3**. It stops there and never sees the second 7.
  - **50:** it isn't in the list, so linear search checks all **7** items. A missing key is the worst case.
  - **d)** **2**, the index of the first 7.

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

  **a)** Searching for 60, which values does `items[mid]` take, in order? Write them separated by commas.

  <!-- answer:11.5a blanks: 34, 52, 68, 60 | 34,52,68,60 -->

  **b)** What index does the search return?

  <!-- answer:11.5b blanks: 10 -->

  **c)** At most how many comparisons does binary search need for a sorted list of 2,000 items?

  <!-- answer:11.5c blanks: 11 -->

  <details>
  <summary>Answer</summary>

  - **a)** low 0, high 12: mid 6, 34. 60 > 34, so low = 7. mid (7 + 12) // 2 = 9, 52. 60 > 52, so low = 10. mid (10 + 12) // 2 = 11, 68. 60 < 68, so high = 10. mid (10 + 10) // 2 = 10, 60. Found. **34, 52, 68, 60.**
  - **b)** **10**.
  - **c)** ⌊log₂ 2000⌋ + 1 = 10 + 1 = **11**, since 2¹⁰ = 1,024 ≤ 2,000 < 2,048 = 2¹¹.

  </details>

- **11.6** Simple sorts, pass by pass. Start from `41 16 58 23 9 34` each time.

  **a)** What is the list after insertion sort finishes i = 3 (the outer loop starts at i = 1)? Separate the values with spaces.

  <!-- answer:11.6a blanks: 16 23 41 58 9 34 | 16, 23, 41, 58, 9, 34 -->

  **b)** Insertion sort moves the item left one swap at a time. How many swaps does it make at i = 4?

  <!-- answer:11.6b blanks: 4 -->

  **c)** What is the list after two passes of bubble sort (each pass compares neighbors from left to right)? Separate the values with spaces.

  <!-- answer:11.6c blanks: 16 23 9 34 41 58 | 16, 23, 9, 34, 41, 58 -->

  <details>
  <summary>Answer</summary>

  - **a)** i = 1: 16 moves left past 41, giving `16 41 58 23 9 34`. i = 2: 58 is bigger than 41, so nothing moves. i = 3: 23 moves left past 58 and 41, and stops at 16: **16 23 41 58 9 34**.
  - **b)** At i = 4, 9 is smaller than 58, 41, 23, and 16, so it swaps 4 times to reach the front: **4**.
  - **c)** Pass 1 swaps 41↔16, 58↔23, 58↔9, 58↔34: `16 41 23 9 34 58`. Pass 2 swaps 41↔23, 41↔9, 41↔34, and leaves 41 and 58: **16 23 9 34 41 58**.

  </details>

- **11.7** Quicksort's partition. In this version the pivot is the middle element, at index (low + high) // 2. `low` moves right while its item is smaller than the pivot. `high` moves left while its item is bigger than the pivot. If they've met or crossed, the partition is done; otherwise swap the two items, step both indexes one place, and repeat. The list is `52 19 76 40 88 23 61`.

  **a)** What is the pivot?

  <!-- answer:11.7a blanks: 40 -->

  **b)** What is the list after partitioning? Separate the values with spaces.

  <!-- answer:11.7b blanks: 23 19 40 76 88 52 61 | 23, 19, 40, 76, 88, 52, 61 -->

  **c)** Partition returns `high`, the last index of the left part. What index does it return?

  <!-- answer:11.7c blanks: 2 -->

  <details>
  <summary>Answer</summary>

  - **a)** The middle index is (0 + 6) // 2 = 3, which holds **40**.
  - **b)** low stops at 52 (index 0). high skips 61 and stops at 23 (index 5). Swap them: `23 19 76 40 88 52 61`, then low = 1, high = 4. low skips 19 and stops at 76 (index 2). high skips 88 and stops at 40 (index 3). Swap them: `23 19 40 76 88 52 61`, then low = 3, high = 2. low stops at 76, high stops at 40. They've crossed, so it's done: **23 19 40 76 88 52 61**.
  - **c)** high is **2**. The left part is 23 19 40 (indexes 0 to 2), and the right part is 76 88 52 61.

  </details>

- **11.8** Heapify and heap sort, with a max-heap whose root is at index 0. Heapify percolates down each index from n // 2 − 1 back to 0. Each heap sort round then swaps the root with the last unsorted item and percolates the new root down through the unsorted part. The list is `12 5 17 8 21 3 14 9`.

  **a)** At which index does heapify start?

  <!-- answer:11.8a blanks: 3 -->

  **b)** What is the array after heapify? Separate the values with spaces.

  <!-- answer:11.8b blanks: 21 12 17 9 5 3 14 8 | 21, 12, 17, 9, 5, 3, 14, 8 -->

  **c)** Heap sort then does its first two rounds (end index 7, then 6). What is the whole array afterward, sorted part included?

  <!-- answer:11.8c blanks: 14 12 8 9 5 3 17 21 | 14, 12, 8, 9, 5, 3, 17, 21 -->

  <details>
  <summary>Answer</summary>

  - **a)** 8 // 2 − 1 = **3**.
  - **b)** Index 3: 8 swaps with its child 9. Index 2: 17 beats 3 and 14, so it stays. Index 1: 5 swaps with the larger child, 21. Index 0: 12 swaps with 21, then beats 9 and 5: stop. **21 12 17 9 5 3 14 8**.
  - **c)** Round 1: swap 21 and 8. 8 percolates down through indexes 0 to 6: it swaps with 17, then with 14. That gives `17 12 14 9 5 3 8 21`. Round 2: swap 17 and 8. 8 percolates down through indexes 0 to 5: it swaps with 14, then beats 3. **14 12 8 9 5 3 17 21**.

  </details>

- **11.9** Radix sort and bucket sort.

  **a)** Radix sort on `318 47 205 96 41 730 18`. What is the list after the second pass (by the tens digit)? Separate the values with spaces.

  <!-- answer:11.9a blanks: 205 318 18 730 41 47 96 | 205, 318, 18, 730, 41, 47, 96 -->

  **b)** How many passes does radix sort make on this list in all?

  <!-- answer:11.9b blanks: 3 -->

  **c)** Bucket sort uses 4 buckets for values from 0 to 79, putting x in bucket ⌊x × 4 / 80⌋. Which bucket does 39 go in?

  <!-- answer:11.9c blanks: 1 -->

  **d)** Which bucket does 60 go in?

  <!-- answer:11.9d blanks: 3 -->

  <details>
  <summary>Answer</summary>

  - **a)** First pass, by ones digit: `730 41 205 96 47 318 18`. Second pass, by tens digit, keeping that order within each bucket: bucket 0 holds 205, 1 holds 318 then 18, 3 holds 730, 4 holds 41 then 47, and 9 holds 96. Read in order: **205 318 18 730 41 47 96**. 318 stays ahead of 18 because it came first in the last pass. The hundreds pass fixes that.
  - **b)** The largest value, 730, has 3 digits: **3** passes.
  - **c)** ⌊39 × 4 / 80⌋ = ⌊1.95⌋ = **1**: the bucket for 20 to 39.
  - **d)** ⌊60 × 4 / 80⌋ = ⌊3⌋ = **3**: the bucket for 60 to 79.

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

  <!-- answer:11.10a blanks: [Selection, Insertion, Bubble, Shell, Counting, Radix] => Selection -->

  **b)** Which sort is Code B?

  <!-- answer:11.10b blanks: [Selection, Insertion, Bubble, Shell, Counting, Radix] => Counting -->

  **c)** A stable sort sorts these items by their number only: `3a 1b 3c 2d 1e`. What is the result? Separate the items with spaces.

  <!-- answer:11.10c blanks: 1b 1e 2d 3a 3c | 1b, 1e, 2d, 3a, 3c -->

  **d)** Is each sort stable?

  | Sort | Stable? |
  |---|---|
  | Selection | |
  | Merge | |
  | Heap | |
  | Radix | |

  <!-- answer:11.10d-g table [Yes, No]: No; Yes; No; Yes -->

  <details>
  <summary>Answer</summary>

  - **a)** **Selection.** The inner loop only tracks the index of the smallest item left, and there's one swap per pass, after the inner loop.
  - **b)** **Counting.** `tally` is a list indexed by the values themselves, and nothing compares two items.
  - **c)** Equal numbers keep their starting order: 1b came before 1e, and 3a before 3c. **1b 1e 2d 3a 3c**.
  - **d)** Selection sort's long-distance swap can jump an item past an equal one, so it's **not** stable. Merge sort is stable when ties take the left item first. Heap sort is **not** stable. Radix sort is stable, and it has to be: each pass relies on the order the last pass left.

  </details>

- **11.11** Counting pairs.

  ```python
  count = 0
  for i in range(n):
      for j in range(i + 1, n):
          count += 1
  ```

  **a)** What is `count` at the end when n = 8?

  <!-- answer:11.11a blanks: 28 -->

  **b)** What is the Big-O?

  <!-- answer:11.11b blanks: [O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ)] => O(n²) -->

  <details>
  <summary>Answer</summary>

  - **a)** For i = 0 to 7 the inner loop runs 7, 6, 5, 4, 3, 2, 1, 0 times: 7 + 6 + ... + 1 = **28**, one for each pair i < j.
  - **b)** **O(n²).** The total is (n − 1) + ... + 1 = n(n − 1) / 2. The inner loop shrinks as i grows, but that only halves the total: it's about n²/2, and the ½ drops. Check by doubling: n = 16 gives 120 and n = 32 gives 496, about 4 times as many.

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

  <!-- answer:11.12a blanks: 31 -->

  **b)** What is the Big-O?

  <!-- answer:11.12b blanks: [O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ)] => O(n) -->

  <details>
  <summary>Answer</summary>

  - **a)** i takes the values 1, 2, 4, 8, and 16 (32 isn't less than 32). The inner loop runs that many times each: 1 + 2 + 4 + 8 + 16 = **31**.
  - **b)** **O(n).** The outer loop runs log₂ n times, but the inner loops aren't all n long. They add up to 1 + 2 + 4 + ... which stays under n. Multiplying log n × n would overestimate. Doubling n doubles the count (63 for n = 64, 127 for n = 128).

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

  <!-- answer:11.13a blanks: 15 -->

  **b)** How many calls to `r` happen in total for `r(5)`, counting the first one?

  <!-- answer:11.13b blanks: 6 -->

  **c)** What is the Big-O of `r(n)`?

  <!-- answer:11.13c blanks: [O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ)] => O(n²) -->

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

  <!-- answer:11.13d blanks: [O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ)] => O(n) -->

  <details>
  <summary>Answer</summary>

  - **a)** Each call adds its own n: 5 + 4 + 3 + 2 + 1 + 0 = **15**.
  - **b)** r(5), r(4), r(3), r(2), r(1), r(0): **6** calls.
  - **c)** **O(n²).** There are n + 1 calls, but they don't do the same work: the loops run n, n − 1, ..., 1 times, which adds up to n(n + 1) / 2.
  - **d)** **O(n).** The loops run n, n/2, n/4, ... times, which adds up to under 2n. There are log n calls, but the work halves each time.

  </details>

- **11.14** Best, average, and worst cases. Give the Big-O of each.

  | Situation | Big-O |
  |---|---|
  | Bubble sort with an early stop, on a list that's already sorted | |
  | Insertion sort on a list sorted in reverse | |
  | Heap sort on a list that's already sorted | |
  | Binary search when the key is the first middle item checked | |
  | Linear search when the key isn't in the list | |
  | Quicksort that always picks the first item as pivot, on a list that's already sorted | |
  | Merge sort on a list that's already sorted | |
  | Searching a BST built by inserting 1, 2, 3, ..., n in that order, for n | |
  | Hash table search when every key landed in the same bucket | |

  <!-- answer:11.14a-i table [O(1), O(log n), O(n), O(n log n), O(n²)]: O(n); O(n²); O(n log n); O(1); O(n); O(n²); O(n log n); O(n); O(n) -->

  <details>
  <summary>Answer</summary>

  - Bubble sort with the early stop makes one pass with no swaps, then stops: **O(n)**.
  - A reversed list is insertion sort's worst case: every item moves all the way to the front, **O(n²)**.
  - Heap sort is O(n log n) in every case, so sorted input doesn't help: **O(n log n)**.
  - Binary search's best case is one comparison: **O(1)**.
  - A missing key makes linear search check all n items: **O(n)**.
  - A first-item pivot on sorted input puts everything on one side, so each partition peels off one item: n levels of O(n) work, **O(n²)**.
  - Merge sort always halves and merges the same way: **O(n log n)** in every case.
  - Sorted inserts make each key the right child of the last, a chain n long, so the search walks all of it: **O(n)**.
  - One bucket holding every key turns a lookup into a scan of n keys: **O(n)**, against the usual O(1) average.

  </details>

- **11.15** Pick the ADT that fits each job best.

  | Job | ADT |
  |---|---|
  | Badge numbers of people inside a building, each at most once, in no order | |
  | Looking up a country's capital by the country's name | |
  | Raffle tickets in a jar, where one person can hold several identical tickets | |
  | Support tickets, where the most urgent one is handled next | |
  | A recipe's steps, kept in the order they were written | |
  | An editor's undo history, where the latest change is undone first | |
  | Print jobs, printed in the order they were sent | |

  <!-- answer:11.15a-g table [List, Stack, Queue, Bag, Set, Priority queue, Dictionary]: Set; Dictionary; Bag; Priority queue; List; Stack; Queue -->

  <details>
  <summary>Answer</summary>

  - Badge numbers are distinct and unordered: a **set**.
  - A capital is found by its country: a **dictionary**, which maps keys to values.
  - Tickets can repeat and have no order: a **bag**.
  - The most urgent ticket comes out first, whatever order they arrived in: a **priority queue**.
  - Steps keep the order they were added in: a **list**.
  - The newest change comes off first: a **stack** (LIFO).
  - The oldest job comes out first: a **queue** (FIFO).

  </details>

- **11.16** What `pop()` removes. Each structure starts empty, and 4, 9, 2, 7 are added in that order with the add operation shown. Then the remove operation runs once.

  **a)** What value does the remove return?

  | Structure | Add | Remove | Returns |
  |---|---|---|---|
  | Stack on a Python list | `append` | `pop()` | |
  | Queue on a Python list | `append` | `pop(0)` | |
  | `collections.deque` | `append` | `popleft()` | |
  | `collections.deque` | `appendleft` | `pop()` | |
  | Priority queue with `heapq` | `heappush` | `heappop` | |

  <!-- answer:11.16a-e table: 7; 4; 4; 4; 2 -->

  **b)** What is the Big-O of each remove on a structure holding n items?

  | Remove | Big-O |
  |---|---|
  | `list.pop()` | |
  | `list.pop(0)` | |
  | `deque.popleft()` | |
  | `heapq.heappop` | |

  <!-- answer:11.16f-i table [O(1), O(log n), O(n)]: O(1); O(n); O(1); O(log n) -->

  <details>
  <summary>Answer</summary>

  - **a)**
    - `pop()` takes a list's last item, the newest: **7** (LIFO).
    - `pop(0)` and `popleft()` take the front, the oldest: **4** (FIFO).
    - `appendleft` puts each new item at the front, so the deque reads 7 2 9 4, and `pop()` takes the right end: **4**.
    - `heapq` is a min-heap, so `heappop` returns the smallest: **2**, whatever order the items came in.
  - **b)** Taking a list's last item moves nothing: **O(1)**. `pop(0)` shifts every other item one place left: **O(n)**. A deque is built to add and remove at both ends in **O(1)**. `heappop` moves the last item to the root and percolates it down one level at a time: **O(log n)**.

  </details>

- **11.17** Array-based lists. An empty array-based list starts with an array of size 2. When the array is full, the next append doubles its size and copies every item over first. Nine items are appended.

  **a)** How many times does the array resize?

  <!-- answer:11.17a blanks: 3 -->

  **b)** How many item copies do the resizes make in all?

  <!-- answer:11.17b blanks: 14 -->

  **c)** What is the array's size at the end?

  <!-- answer:11.17c blanks: 16 -->

  **d)** Next, a new item is inserted at index 2. How many items shift one place right?

  <!-- answer:11.17d blanks: 7 -->

  <details>
  <summary>Answer</summary>

  - **a)** 3. The 3rd append finds 2 items in 2 slots and resizes to 4. The 5th resizes to 8, and the 9th to 16.
  - **b)** 2 + 4 + 8 = 14.
  - **c)** 16.
  - **d)** 7. The items at indexes 2 to 8 each move one place right. The array has room, so there's no resize.

  </details>

- **11.18** A doubly-linked list holds `6 ⇄ 2 ⇄ 9 ⇄ 4`, with `head` at 6 and `tail` at 4. These run in order:

  1. Remove(the node holding 6)
  2. Append 7
  3. InsertAfter(the node holding 9, a new node holding 5)
  4. Remove(the node holding 4)
  5. Prepend 3

  **a)** What does the list hold now, from head to tail? Write the values separated by commas.

  <!-- answer:11.18a blanks: 3, 2, 9, 5, 7 | 3,2,9,5,7 -->

  **b)** Which values do the node holding 5's `prev` and `next` pointers point to?

  <!-- answer:11.18b blanks: prev => 9; next => 7 -->

  <details>
  <summary>Answer</summary>

  - Step 1 removes the head: `2 ⇄ 9 ⇄ 4`. Step 2: `2 ⇄ 9 ⇄ 4 ⇄ 7`.
  - Step 3: `2 ⇄ 9 ⇄ 5 ⇄ 4 ⇄ 7`. Step 4 links 5 and 7 to each other: `2 ⇄ 9 ⇄ 5 ⇄ 7`.
  - **a)** Step 5: **3, 2, 9, 5, 7**.
  - **b)** `prev` is **9** and `next` is **7**. Removing 4 set `5.next = 7` and `7.prev = 5`.

  </details>

- **11.19** Deques and stacks.

  **a)** These run in order. What do the two pops return, in order? Write them separated by a comma.

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

  <!-- answer:11.19a blanks: 8, 3 | 8,3 -->

  **b)** What is `d[-1]` afterward?

  <!-- answer:11.19b blanks: 5 -->

  **c)** A stack evaluates the postfix expression `4 7 2 - * 3 +`. Each number is pushed. Each operator pops the right operand, then the left operand, and pushes the result. What is the final value?

  <!-- answer:11.19c blanks: 23 -->

  <details>
  <summary>Answer</summary>

  - **a)** After the three pushes, the deque is `8 5 3`, front to back. `popleft()` returns **8**, leaving `5 3`. `appendleft(1)` gives `1 5 3`, and `pop()` returns **3**.
  - **b)** The deque is `1 5`, so the last item is **5**.
  - **c)** Push 4, 7, 2. `-` pops 2 and 7 and pushes 7 − 2 = 5. `*` pops 5 and 4 and pushes 20. Push 3. `+` pops 3 and 20 and pushes **23**.

  </details>

- **11.20** Hash tables.

  **a)** A table has 13 buckets, uses h = key % 13, and resolves collisions with linear probing, trying `(h + i) % 13` for i = 0, 1, 2, .... Starting empty, insert 27, 16, 40, 29, and 12, in that order. Which bucket does each key land in?

  | Key | Bucket |
  |---|---|
  | 27 | |
  | 16 | |
  | 40 | |
  | 29 | |
  | 12 | |

  <!-- answer:11.20a table: 1; 3; 2; 4; 12 -->

  **b)** Then search for 53, which isn't in the table. How many buckets does the search check before it stops?

  <!-- answer:11.20b blanks: 5 -->

  **c)** A string hash starts at 5. For each character, it multiplies the hash so far by 3 and adds the character's code, where a = 1, b = 2, and c = 3. The result is taken modulo 10. Which bucket does `cab` go in?

  <!-- answer:11.20c blanks: 7 -->

  **d)** A table that uses chaining has 8 buckets and holds 20 items. What is its load factor?

  <!-- answer:11.20d blanks: 2.5 | 5/2 -->

  <details>
  <summary>Answer</summary>

  - **a)** 27 % 13 = 1: bucket **1**. 16 % 13 = 3: bucket **3**. 40 % 13 = 1 is taken, so it tries 2: **2**. 29 % 13 = 3 is taken, so it tries 4: **4**. 12 % 13 = 12, which is empty: **12**.
  - **b)** 53 % 13 = 1. The search checks 1 (27), 2 (40), 3 (16), 4 (29), and then 5, which is empty, so 53 can't be further on: **5** buckets. Colliding keys pile up in a run, which is why linear probing slows as the table fills.
  - **c)** 5 × 3 + 3 = 18 for `c`. 18 × 3 + 1 = 55 for `a`. 55 × 3 + 2 = 167 for `b`. 167 % 10 = **7**.
  - **d)** 20 / 8 = **2.5**, the average chain length. Only chaining allows a load factor above 1.

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

  **a)** Fill in each answer.

  | Question | Answer |
  |---|---|
  | How many internal nodes | |
  | The tree's height | |
  | The depth of P | |
  | How many edges | |

  <!-- answer:11.21a table: 3; 2; 2; 5 -->

  **b)** Is the tree each shape?

  | Shape | Yes or no |
  |---|---|
  | Full | |
  | Complete | |
  | Perfect | |

  <!-- answer:11.21b table [Yes, No]: No; Yes; No -->

  <details>
  <summary>Answer</summary>

  - **a)** The internal nodes are K, E, and S: **3**. The deepest nodes (B, G, P) are 2 edges below K: height **2**, and P's depth is **2**. The tree has 6 nodes, so it has 6 − 1 = **5** edges.
  - **b)** S has one child, so the tree isn't **full**. Level 1 is full, and the last level's nodes (B, G, P) are as far left as possible, so it **is complete**. It isn't full, so it isn't **perfect**.

  </details>

- **11.22** Rebuilding a BST. A BST's preorder traversal is 58, 24, 13, 37, 30, 81, 66, 72, 92.

  **a)** What is its postorder traversal? Separate the keys with commas.

  <!-- answer:11.22a blanks: 13, 30, 37, 24, 72, 66, 92, 81, 58 | 13,30,37,24,72,66,92,81,58 -->

  **b)** What is the tree's height?

  <!-- answer:11.22b blanks: 3 -->

  **c)** How many leaves does the tree have?

  <!-- answer:11.22c blanks: 4 -->

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

  - **a)** Left subtree (13, 30, 37, 24), right subtree (72, 66, 92, 81), then the root: **13, 30, 37, 24, 72, 66, 92, 81, 58**.
  - **b)** 30 and 72 are 3 edges below 58: height **3**.
  - **c)** 13, 30, 72, and 92 have no children: **4**.

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

  <!-- answer:11.23a blanks: 49 -->

  **b)** Remove 40. Which key replaces it at the root?

  <!-- answer:11.23b blanks: 47 -->

  **c)** What is the preorder traversal after removing 40? Separate the keys with commas.

  <!-- answer:11.23c blanks: 47, 18, 9, 27, 65, 52, 49, 58, 80 | 47,18,9,27,65,52,49,58,80 -->

  <details>
  <summary>Answer</summary>

  - **a)** 52 has a left subtree. Left once to 47, then right as far as possible, to **49**.
  - **b)** 40 has two children. Its successor: right once to 65, then left as far as possible: 52, then 47. 47 has no left child, so the successor is **47**. 47 is copied into the root.
  - **c)** The old 47 node has one child, 49, so 49 moves up to become 52's left child: **47, 18, 9, 27, 65, 52, 49, 58, 80**.

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

  **a)** Count indexes from 0, as this kit does.

  | Question | Answer |
  |---|---|
  | Index of the left child of index 2 | |
  | Index of the right child of index 2 | |
  | Index of the parent of index 7 | |
  | Value of 22's parent | |

  <!-- answer:11.24a-d table: 5; 6; 3; 40 -->

  **b)** Now number the same nodes from 1, as the course study guide (in your course resources) does, so 90 is at position 1.

  | Question | Answer |
  |---|---|
  | Position of 85 | |
  | Position of 85's left child | |
  | Position of 22's parent | |

  <!-- answer:11.24e-g table: 3; 6; 4 -->

  **c)** How does a heap reach a node's parent and children?

  A. By arithmetic on the node's array index

  B. By following pointers stored in each node

  C. It can't. A heap only gives access to its root

  <!-- answer:11.24h choice: A -->

  <details>
  <summary>Answer</summary>

  - **a)** From 0, the children of i are 2i + 1 and 2i + 2, and the parent is ⌊(i − 1) / 2⌋. Children of 2: **5** and **6**. Parent of 7: ⌊6 / 2⌋ = **3**. 22 is at index 8, whose parent is ⌊7 / 2⌋ = 3, holding **40**.
  - **b)** From 1, every position is one more: 85 is at **3**. The children of p are 2p and 2p + 1, so 85's left child is at **6** (80, the same node as index 5). 22 is at position 9, and the parent is ⌊9 / 2⌋ = **4**, which is 40 again. The two numberings name the same tree.
  - **c)** **A.** A heap is an array, so moving to a parent or child is one calculation. The heap rule only limits which value you remove: the root.

  </details>

- **11.25** A priority queue on a min-heap. A lower number means higher priority. The heap is stored in an array with the root at index 0, and it holds `4 9 7 15 12 10 20`.

  **a)** Enqueue 6. What is the array afterward? Separate the values with spaces.

  <!-- answer:11.25a blanks: 4 6 7 9 12 10 20 15 | 4, 6, 7, 9, 12, 10, 20, 15 -->

  **b)** How many swaps did that percolate-up take?

  <!-- answer:11.25b blanks: 2 -->

  **c)** Then dequeue once. What does it return, and what is the array afterward?

  <!-- answer:11.25c blanks: Returns => 4; Array => 6 9 7 15 12 10 20 | 6, 9, 7, 15, 12, 10, 20 -->

  **d)** Then peek. What does it return, and how many items does the queue hold afterward?

  <!-- answer:11.25d blanks: Returns => 6; Items => 7 -->

  <details>
  <summary>Answer</summary>

  - **a)** 6 goes in at index 7. Its parent, index 3, holds 15: 6 < 15, swap. Its new parent, index 1, holds 9: swap. Its new parent, index 0, holds 4, which is smaller: stop. **4 6 7 9 12 10 20 15**.
  - **b)** **2** swaps.
  - **c)** Dequeue returns the root, **4**. The last value, 15, moves to the root. Its children are 6 and 7: swap with the smaller, 6. At index 1, its children are 9 and 12: swap with 9. At index 3, it has no children: stop. **6 9 7 15 12 10 20**.
  - **d)** Peek returns the root without removing it: **6**. The queue still holds **7** items.

  </details>

- **11.26** Sets. X = {3, 8, 14, 21, 30} and Y = {8, 11, 21, 27}.

  **a)** What is X − Y? List it in increasing order, separated by commas.

  <!-- answer:11.26a blanks: 3, 14, 30 | 3,14,30 -->

  **b)** Build X ∪ Y by adding every element of X to an empty set, then every element of Y. How many of those add calls leave the result unchanged?

  <!-- answer:11.26b blanks: 2 -->

  **c)** What is `X ^ Y` in Python? List it in increasing order, separated by commas.

  <!-- answer:11.26c blanks: 3, 11, 14, 27, 30 | 3,11,14,27,30 -->

  **d)** Which set is a subset of X?

  A. {8, 11}

  B. {30, 3, 14}

  C. {21, 22}

  <!-- answer:11.26d choice: B -->

  <details>
  <summary>Answer</summary>

  - **a)** Take out the elements Y shares with X (8 and 21): **3, 14, 30**.
  - **b)** X's 5 elements all go in. Then Y's 8 and 21 are already there, so those two adds do nothing: **2**.
  - **c)** `^` is the symmetric difference: elements in exactly one of the sets. Drop the shared 8 and 21: **3, 11, 14, 27, 30**.
  - **d)** **B.** 30, 3, and 14 are all in X, and order doesn't matter. 11 and 22 aren't in X.

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

  **a)** Answer each question about the graph.

  | Question | Answer |
  |---|---|
  | How many edges does the graph have? | |
  | How many incoming edges does C have? | |
  | What is C's degree, counting incoming and outgoing edges? | |
  | Is the graph cyclic? (Yes or No) | |

  <!-- answer:11.27a-d table: 6; 2; 4; Yes -->

  **e)** The matrix isn't symmetric. What does that tell you?

  A. The graph is directed: some edges go one way only, like A → B with no B → A

  B. The graph is weighted, so some entries should be larger than 1

  C. The graph is disconnected, because E's row is all 0s

  <!-- answer:11.27e choice: A -->

  <details>
  <summary>Answer</summary>

  - **a)** The edges are A → B, A → D, B → C, C → A, C → E, and D → C: **6**, one for each 1 in the matrix.
    - C's column has 1s in rows B and D: **2** incoming edges.
    - C's row has 1s in columns A and E, so 2 outgoing edges. 2 + 2 = **4**.
    - A → B → C → A starts and ends at A, so the graph is cyclic: **Yes**.
  - **e)** **A.** An undirected edge would put a 1 in both (X, Y) and (Y, X). Row A, column B is 1, but row B, column A is 0, so that edge goes one way. A 0/1 matrix says nothing about weights, and E having no outgoing edges doesn't make the matrix lopsided by itself.

  </details>

- **11.28** Breadth-first search. Use this undirected graph. Take neighbors in alphabetical order. Separate vertices with commas.

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

  <!-- answer:11.28a blanks: K, G, J, F, H, L, M | K,G,J,F,H,L,M -->

  **b)** What is the distance from K to M, in edges?

  <!-- answer:11.28b blanks: 4 -->

  **c)** What is in the queue, front to back, right after G is visited and its new neighbors are enqueued?

  <!-- answer:11.28c blanks: J, F, H | J,F,H -->

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

  - **a)** **K, G, J, F, H, L, M**.
  - **b)** K → G → H → L → M: **4** edges.
  - **c)** **J, F, H**. J was enqueued when K was visited, and F and H join behind it.

  </details>

- **11.29** Depth-first search on a directed graph, using the recursive DFS from [page 9](09-sets-graphs.md): visit a vertex, then call DFS on each unvisited neighbor. Take each vertex's outgoing edges in alphabetical order. Separate vertices with commas.

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

  <!-- answer:11.29a blanks: P, Q, R, T, S | P,Q,R,T,S -->

  **b)** What is the largest number of DFS calls on the call stack at the same time?

  <!-- answer:11.29b blanks: 3 -->

  **c)** What is the visit order starting at S?

  <!-- answer:11.29c blanks: S, Q, R, T | S,Q,R,T -->

  <details>
  <summary>Answer</summary>

  - **a)** P's first neighbor is Q. Q's first is R, which has no outgoing edges, so its call returns. Back at Q, the next is T, whose only neighbor R is visited. Back at P, the next is S, and both of S's neighbors are visited. **P, Q, R, T, S**.
  - **b)** dfs(P), dfs(Q) and dfs(R) are waiting at once, and later dfs(P), dfs(Q) and dfs(T). dfs(S) is called straight from dfs(P): **3**.
  - **c)** S goes to Q, Q to R, then Q to T. P has no incoming edges, so it's never reached: **S, Q, R, T**. In a directed graph, the start vertex decides what DFS can reach.

  </details>

- **11.30** Python types and operators.

  **a)** What does each Python expression give?

  | Expression | Value |
  |---|---|
  | `19 / 4` | |
  | `-19 // 4` | |
  | `-19 % 4` | |
  | `2 * 3 ** 2` | |
  | `not 3 > 5 and 2 == 2.0` | |

  <!-- answer:11.30a table: 4.75; -5; 1; 18; True -->

  **b)** What does this print? Give both numbers.

  ```python
  a = [6, 7]
  b = a
  b.append(3)
  c = a + [4]
  c.append(5)
  print(len(a), len(c))
  ```

  <!-- answer:11.30b blanks: len(a) => 3; len(c) => 5 -->

  **c)** Which of these can be a key in a Python `dict`?

  A. `[1, 2]`

  B. `(1, 2)`

  C. `{1, 2}`

  <!-- answer:11.30c choice: B -->

  <details>
  <summary>Answer</summary>

  - **a)** `/` always gives a float: **4.75**. `//` rounds down, toward negative infinity, so −4.75 becomes **−5**. The remainder then has to make −5 × 4 + r = −19, so `-19 % 4` is **1**. `**` goes first: 2 × 9 = **18**. `3 > 5` is False, `not` makes it True, and `2 == 2.0` is True, so the whole thing is **True**.
  - **b)** `b = a` names the same list, so appending through `b` makes `a` hold 3 items. `a + [4]` builds a new list, so appending 5 to `c` doesn't touch `a`. It prints `3 5`.
  - **c)** **B.** Keys must be hashable. A tuple is immutable, but a list and a set can change, so they can't be keys.

  </details>
