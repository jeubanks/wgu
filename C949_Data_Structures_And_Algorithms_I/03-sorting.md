# 3. Sorting

This page is part of the **Explains Algorithms** competency. You'll learn how each common sort works, what drives its best, average and worst case, and how to recognize it in code.

## Words to know

- **Pass:** one trip through the list, or through its unsorted part. Simple sorts are traced pass by pass.
- **Stable:** items with equal keys keep their original order. Sorting `5a 2 5b` (two 5s, told apart by letter) stably gives `2 5a 5b`, never `2 5b 5a`.
- **In place:** uses only O(1) extra memory. That's about memory, not order: a sort can be stable without being in place, or the reverse.
- **Comparison sort:** orders items only by comparing two at a time, and can't beat O(n log n) on average. Radix, counting and bucket sort look at digits or value ranges instead.

The examples start from `29 4 17 8 42 11`. In the diagram below, compare sorted and reversed input.

<div class="viz" data-viz="sort" markdown>

*On the site, an interactive diagram here runs bubble, selection, insertion, and merge sort on sorted, random, and reversed input, and counts the comparisons.*

</div>

## Selection sort

Find the smallest item in the unsorted part and swap it to the front of that part.

<!-- figure
row: start | 29 4 17 8 42 11
row: pass 1 | *4 *29 17 8 42 11 | swap 4 with 29
row: pass 2 | .4 *8 17 *29 42 11 | swap 8 with 29
-->
```text
start    29  4 17  8 42 11
pass 1    4 29 17  8 42 11     swap 4 with 29
pass 2    4  8 17 29 42 11     swap 8 with 29
```
<!-- /figure -->

**Best, average, worst:** O(n²) every time. It scans the whole unsorted part to be sure it found the smallest, even on sorted input.

## Insertion sort

Take the next item and shift it left past every bigger item in the sorted part, like sorting a hand of cards.

<!-- figure
row: start | 29 4 17 8 42 11
row: i = 1 | *4 29 17 8 42 11 | 4 moves past 29
row: i = 2 | 4 *17 29 8 42 11 | 17 stops at 4
-->
```text
start    29  4 17  8 42 11
i = 1     4 29 17  8 42 11     4 moves past 29
i = 2     4 17 29  8 42 11     17 stops at 4
```
<!-- /figure -->

- **Best:** O(n), on sorted input: each item is compared once. Nearly sorted is close.
- **Average and worst:** O(n²). Reversed input is worst: every item travels to the front.

## Bubble sort

Compare each pair of neighbors and swap them if they're out of order. Each pass carries the largest remaining item to the end.

<!-- figure
row: start | 29 4 17 8 42 11
row: pass 1 | 4 17 8 29 11 *42 | 42 bubbled up
-->
```text
start     29  4 17  8 42 11
pass 1     4 17  8 29 11 42     42 bubbled up
```
<!-- /figure -->

- **Best:** O(n), only for the version that stops after a pass with no swaps. Without that check, O(n²) always.
- **Average and worst:** O(n²).

## Shell sort

Insertion sort on items a **gap** apart, then smaller gaps, ending with gap 1: plain insertion sort, now fast on a nearly sorted list. This guide uses gaps that are powers of 2 minus 1, below the length (for 100 items: 63, 31, 15, 7, 3, 1).

**Best** O(n log n) on sorted input; **average** about O(n^1.5), depending on the gaps; **worst** O(n²) with poor gaps.

## Quicksort

Pick a **pivot**, then **partition**: smaller values to the left, larger to the right. Then quicksort each side. Many books pivot on the last item; zyBooks and these pages use the **middle** item, at (low + high) // 2. To partition:

1. `low` moves right while its item is smaller than the pivot.
2. `high` moves left while its item is bigger than the pivot.
3. If `low >= high`, stop: `high` ends the left part. Otherwise swap the two items, step both indexes once, and repeat.

<!-- figure
index: yes
row: start | 24 7 61 *15 38 3 50 | pivot 15
row: swap | *3 7 61 15 38 *24 50 | low stopped at 24, high at 3
row: swap | 3 7 *15 *61 38 24 50 | low stopped at 61, high at 15
row: done | 3 7 15 // 61 38 24 50 | low passed high
-->
```text
start    24  7 61 15 38  3 50     pivot 15
swap      3  7 61 15 38 24 50     low stopped at 24, high at 3
swap      3  7 15 61 38 24 50     low stopped at 61, high at 15
done      3  7 15 | 61 38 24 50   low passed high
```
<!-- /figure -->

- **Best and average:** O(n log n). Good pivots split near the middle: about log n levels of O(n) work.
- **Worst:** O(n²), when every pivot is the smallest or largest value left, so each partition peels off one item. With a last-item pivot, sorted input does this.

## Merge sort

Split the list in half, merge sort each half, then **merge** the sorted halves by repeatedly taking the smaller front item.

<!-- figure
row: split | 29 4 17 // 8 42 11
row: sort halves | 4 17 29 // 8 11 42
row: merge | 4 8 11 17 29 42
-->
```text
split          29  4 17 | 8 42 11
sort halves     4 17 29 | 8 11 42
merge           4  8 11 17 29 42
```
<!-- /figure -->

**Best, average, worst:** O(n log n), always: halving gives log₂ n levels, and each level merges all n items. It needs O(n) extra memory for merging.

## Heap sort

Build a max-heap in place (see [heaps](08-trees-heaps.md)), then repeat: swap the root, the largest item, with the heap's last item, shrink the heap by one, and percolate the new root down.

<!-- figure
index: yes
row: max-heap | *42 29 17 8 4 11 | largest at index 0
row: swap | *11 29 17 8 4 *42 | 42 is done
row: percolate | 29 11 17 8 4 .42 | 11 swaps with 29
-->
```text
index         0  1  2  3  4  5
max-heap     42 29 17  8  4 11     largest at index 0
swap         11 29 17  8  4 42     42 is done
percolate    29 11 17  8  4 42     11 swaps with 29
```
<!-- /figure -->

**Best, average, worst:** O(n log n): n rounds of an O(log n) percolate.

## Radix sort

Sort non-negative integers one digit at a time, ones digit first. Each pass drops every number into one of 10 **buckets** by that digit, then reads buckets 0 to 9 back in order.

<!-- figure
row: start | 170 45 802 2 66
row: ones | 170 802 2 45 66
row: tens | 802 2 45 66 170
row: hundreds | 2 45 66 170 802 | sorted
-->
```text
start      170  45 802   2  66
ones       170 802   2  45  66
tens       802   2  45  66 170
hundreds     2  45  66 170 802     sorted
```
<!-- /figure -->

**Best, average, worst:** O(nk), where the biggest value has k digits: k passes over n items.

## Counting and bucket sort

- **Counting sort:** for integers in a small range of k values, count each value, then write each one out that many times. O(n + k) in every case.
- **Bucket sort:** spread values into buckets by range, sort each bucket, and join them. O(n + k) best and average, when values spread evenly; O(n²) worst, when everything lands in one bucket.

## All sorts at a glance

| Sort | Best | Average | Worst | Stable | In place |
|---|---|---|---|---|---|
| Selection | O(n²) | O(n²) | O(n²) | No | Yes |
| Insertion | O(n) | O(n²) | O(n²) | Yes | Yes |
| Bubble (early stop) | O(n) | O(n²) | O(n²) | Yes | Yes |
| Shell | O(n log n) | ~O(n^1.5) | O(n²) | No | Yes |
| Quicksort | O(n log n) | O(n log n) | O(n²) | No | Yes |
| Merge | O(n log n) | O(n log n) | O(n log n) | Yes | No |
| Heap | O(n log n) | O(n log n) | O(n log n) | No | Yes |
| Radix | O(nk) | O(nk) | O(nk) | Yes | No |
| Counting | O(n + k) | O(n + k) | O(n + k) | Yes | No |
| Bucket | O(n + k) | O(n + k) | O(n²) | Yes* | No |

\* if each bucket's sort is stable.

## Spot the sort

| Clue in the code | Sort |
|---|---|
| inner loop tracks the smallest index; one swap per pass | Selection |
| inner `while` walking left (`j -= 1`) past bigger items | Insertion |
| swaps neighbors `items[j]`, `items[j + 1]`; big values bubble up | Bubble |
| a shrinking `gap` | Shell |
| `pivot`, `partition`, `split` | Quicksort |
| halves repeatedly, then merges into a temporary list | Merge |
| `heapify`, `percolate_down`, `2 * i + 1` | Heap |
| digit places, `% 10`, 10 buckets | Radix |
| a `count` list indexed by value | Counting |
| buckets filled by value range, each sorted | Bucket |

## Questions

- **3.1** Students sorted by name are then sorted by grade. Which property keeps students with the same grade in name order?

  A. In place

  B. Stable

  C. Comparison-based

  <!-- answer:3.1 choice: B -->

  <details>
  <summary>Answer</summary>

  - **B.** Stable sorts never reorder equal keys, so name order survives within each grade.

  </details>

- **3.2** Start from `15 6 40 2 23 9` each time. Write each list with spaces.

  | Sort | List |
  |---|---|
  | Selection sort, after pass 1 | |
  | Bubble sort, after pass 1 | |
  | Insertion sort, after i = 1, 2 and 3 | |

  <!-- answer:3.2a-c table: 2 6 40 15 23 9; 6 15 2 23 9 40; 2 6 15 40 23 9 -->

  <details>
  <summary>Answer</summary>

  - **Selection:** the smallest, 2, swaps with 15.
  - **Bubble:** 15↔6, 40↔2, 40↔23, 40↔9: 40 ends last.
  - **Insertion:** 6 moves before 15, 40 stays, 2 moves to the front.

  </details>

- **3.3** Quicksort's partition, middle item as pivot, on `36 12 50 21 8 44 17`.

  **a)** What is the pivot?

  <!-- answer:3.3a blanks: 21 -->

  **b)** What is the list after partitioning? Separate the values with spaces.

  <!-- answer:3.3b blanks: 17 12 8 21 50 44 36 | 17, 12, 8, 21, 50, 44, 36 -->

  <details>
  <summary>Answer</summary>

  - **a)** Index (0 + 6) // 2 = 3 holds **21**.
  - **b)** low stops at 36, high at 17: swap. low stops at 50, high at 8: swap. Both stop on 21 at index 3, so it's done.

  </details>

- **3.4** Merge sort on `40 5 22 17 8 31 2 60`.

  **a)** What are the two sorted halves just before the last merge? Separate the values with spaces.

  <!-- answer:3.4a blanks: Left => 5 17 22 40; Right => 2 8 31 60 -->

  **b)** How many levels of halving does merge sort need for 32 items?

  <!-- answer:3.4b blanks: 5 -->

  <details>
  <summary>Answer</summary>

  - **a)** `40 5 22 17` and `8 31 2 60`, each sorted.
  - **b)** 32 → 16 → 8 → 4 → 2 → 1: log₂ 32 = **5**.

  </details>

- **3.5** Radix sort on `305 18 62 941 7 120`.

  **a)** What is the list after the ones-digit pass? Separate the values with spaces.

  <!-- answer:3.5a blanks: 120 941 62 305 7 18 | 120, 941, 62, 305, 7, 18 -->

  **b)** How many passes does it take in all?

  <!-- answer:3.5b blanks: 3 -->

  <details>
  <summary>Answer</summary>

  - **a)** Buckets 0: 120, 1: 941, 2: 62, 5: 305, 7: 7, 8: 18.
  - **b)** The largest, 941, has 3 digits: **3** passes.

  </details>

- **3.6** Give the Big-O.

  | Situation | Big-O |
  |---|---|
  | Bubble sort with the early stop, on sorted input | |
  | Selection sort, on sorted input | |
  | Quicksort when every pivot is the largest value left | |
  | Heap sort's worst case | |

  <!-- answer:3.6a-d table [O(n), O(n log n), O(n²)]: O(n); O(n²); O(n²); O(n log n) -->

  <details>
  <summary>Answer</summary>

  - One swap-free pass ends bubble sort; selection sort always scans.
  - A max-value pivot peels off one item per partition: n levels of O(n).

  </details>

- **3.7** Name each sort.

  **a)**

  ```python
  def mystery(items):
      for i in range(1, len(items)):
          j = i
          while j > 0 and items[j - 1] > items[j]:
              items[j - 1], items[j] = items[j], items[j - 1]
              j -= 1
  ```

  <!-- answer:3.7a blanks: [Selection, Insertion, Bubble, Quicksort, Merge, Radix, Bucket] => Insertion -->

  **b)**

  ```python
  def mystery2(items):
      groups = [[] for _ in range(10)]
      for x in items:
          groups[x * 10 // (max(items) + 1)].append(x)
      for g in groups:
          g.sort()
      return [x for g in groups for x in g]
  ```

  <!-- answer:3.7b blanks: [Selection, Insertion, Bubble, Quicksort, Merge, Radix, Bucket] => Bucket -->

  <details>
  <summary>Answer</summary>

  - **a) Insertion.** It swaps neighbors, but each inner `while` starts at `i` and walks left until the item fits.
  - **b) Bucket.** Values are grouped by range, not by a digit, and each group is sorted.

  </details>

- **3.8** Which sort fits?

  | Job | Sort |
  |---|---|
  | A list that's almost sorted already | |
  | Guaranteed O(n log n), O(1) extra memory | |
  | Guaranteed O(n log n), stable | |

  <!-- answer:3.8a-c table [Insertion, Quicksort, Merge, Heap]: Insertion; Heap; Merge -->

  <details>
  <summary>Answer</summary>

  - Insertion sort nears O(n) when few items are out of place.
  - Heap sort is O(n log n) always and in place; merge sort is O(n log n) always and stable. Quicksort's worst case is O(n²).

  </details>
