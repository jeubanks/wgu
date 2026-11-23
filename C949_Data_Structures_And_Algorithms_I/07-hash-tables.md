# 7. Hash tables

A hash table computes where a key belongs instead of searching for it, so lookups are O(1) on average. This page is part of *Determines Data Structure Impact*. After it, you can hash keys by hand, place them with chaining or linear probing, and use Python's `dict` and `set`, which are hash tables.

## Hashing a key to an index

A hash table is an array of **buckets**. A **hash function** turns a key into a bucket index. The simplest is the **modulo hash**, `key % N`, where N is the number of buckets. With N = 10, key 47 goes in bucket 7, and a search for 47 looks only in bucket 7.

- **By hand:** 3045 % 1009: 3045 ÷ 1009 = 3.01..., so subtract 3 × 1009: 3045 − 3027 = **18**.
- **Negative keys:** Python's `%` with a positive N always gives 0 to N − 1. `-13 % 10` is 7, because −13 = −2 × 10 + 7. Some languages give −3, so their tables add N.
- **String keys:** turn the characters into a number, then take `% N`. Summing codes: `ord('a')` + `ord('b')` = 97 + 98 = 195, and 195 % 10 = 5. A sum ignores order, so real string hashes also weigh position (say, `h = h * 31 + code`). Python's `hash()` handles it.

Key 17 also lands in bucket 7. Two keys in one bucket is a **collision**. Possible keys outnumber buckets, so every table must handle them.

## Chaining

With **chaining**, each bucket holds a list of the items that hashed to it. Inserting 12, 7, 20 and 32 into 5 buckets with `key % 5`:

<!-- figure
title: Chaining with N = 5: each bucket is a list
row: bucket 0 | 20
row: bucket 1 | .–
row: bucket 2 | 12 7 32
row: bucket 3 | .–
row: bucket 4 | .–
-->
```text
bucket 0:  [20]
bucket 1:  []
bucket 2:  [12, 7, 32]
bucket 3:  []
bucket 4:  []
```
<!-- /figure -->

Insert, search and remove work only on the key's bucket list. A search for 32 compares against 12, 7, then 32. Spread evenly, lists stay short: O(1) on average. All in one bucket: O(n).

## Open addressing

With **open addressing**, each bucket holds one item. If the home bucket is taken, the table **probes** other buckets in a fixed order.

### Linear probing

Try the home bucket h, then the next, wrapping at the end: bucket `(h + i) % m` for i = 0, 1, 2, ..., with m buckets. Inserting 43, 13, 53, then 23 into 10 buckets:

<!-- figure
index: yes
row: insert 43 | .– .– .– *43 .– .– .– .– .– .–
row: insert 13 | .– .– .– 43 *13 .– .– .– .– .–
row: insert 53 | .– .– .– 43 13 *53 .– .– .– .–
row: insert 23 | .– .– .– 43 13 53 *23 .– .– .–
-->
```text
index        0  1  2  3  4  5  6  7  8  9
insert 43    -  -  - 43  -  -  -  -  -  -
insert 13    -  -  - 43 13  -  -  -  -  -
insert 53    -  -  - 43 13 53  -  -  -  -
insert 23    -  -  - 43 13 53 23  -  -  -
```
<!-- /figure -->

- **Search** follows the same path until it finds the key or a never-used bucket.
- **Remove** marks the bucket **empty-after-removal**, not truly empty. If bucket 4 above were just emptied, a search for 53 would stop there and miss it. Searches pass removed buckets; inserts may reuse them.
- Full runs like buckets 3 to 6 are **clusters**, and they grow as keys pile onto their ends.

**Quadratic probing** jumps farther each try, `(h + c1·i + c2·i²) % m`, to break up clusters. **Double hashing** takes its step size from a second hash function, `(h1 + i·h2) % m`; h2 must never be 0.

<div class="viz" data-viz="hash-probe" markdown>

*On the site, an interactive diagram here animates linear probing, quadratic probing and double hashing in a 13-bucket table.*

</div>

## Load factor and resizing

The **load factor** is items ÷ buckets: 6 items in 10 buckets is 0.6. With chaining it can pass 1. With probing it can't, and probe paths grow as it nears 1.

Past a threshold (often 0.75), the table **resizes**: about twice the buckets, and every item **rehashed**, since the index depends on N (17 is in bucket 7 of 10, but bucket 17 of 23). A resize is O(n) but rare, so inserts stay O(1) on average.

## Python's dict and set

A `dict` stores key-value pairs; a `set` holds keys alone. Keys are unique: assigning to an existing key replaces its value.

| Command | What it does |
|---|---|
| `d = {"a": 1}`, `d[k] = v` | Make a dict; insert or replace |
| `d[k]` | k's value, or `KeyError` if missing |
| `d.get(k, default)` | k's value, or `default` (None if omitted) |
| `k in d` | True if k is a key |
| `del d[k]`, `d.pop(k)` | Remove k (`pop` returns its value) |
| `d.keys()`, `d.values()`, `d.items()` | Keys, values, (key, value) pairs |
| `set()`, `add`, `remove`, `discard` | Make a set, add, remove (`discard` doesn't complain if missing) |

A key must be **hashable**, meaning immutable: numbers, strings, tuples of those. A list, dict or set can't be a key, since it could change. `x in some_list` is O(n); `x in some_set` is O(1) on average.

## Big-O summary

| Operation | Best | Average | Worst |
|---|---|---|---|
| Insert, search, remove | O(1) | O(1) | O(n): every key collides into one chain or cluster |
| Resize (rehash) | O(n) | O(n) | O(n) |

## Questions

- **7.1** Chaining. A table has 7 buckets, uses `key % 7`, and chains collisions. Insert 15, 22, 9, 30 and 6.

  **a)** Which buckets do the keys go in, in that order?

  A. 2, 2, 3, 3, 7

  B. 1, 1, 2, 2, 6

  C. 1, 2, 3, 4, 6

  D. 2, 3, 1, 4, 0

  <!-- answer:7.1a choice: B -->

  **b)** After all five are in, a search for 29 (not in the table) compares against how many keys?

  A. 1

  B. 0

  C. 2

  D. 5

  <!-- answer:7.1b choice: C -->

  <details>
  <summary>Answer</summary>

  - **a)** **B.** Take each remainder: 15 % 7 = 1, 22 % 7 = 1, 9 % 7 = 2, 30 % 7 = 2, 6 % 7 = 6. D is the quotient (`//`) instead; C probes for a free bucket, which chaining never does.
  - **b)** **C, 2.** 29 % 7 = 1, so only bucket 1's list, 15 and 22, is checked. D searches every key, as a plain list would.

  </details>

- **7.2** Linear probing. A table has 10 buckets and probes `(key % 10 + i) % 10`. Insert 41, 21, 31, 5 and 11, in that order.

  **a)** Which buckets do the keys land in, in that order?

  A. 1, 1, 1, 5, 1

  B. 4, 2, 3, 0, 1

  C. 2, 3, 4, 6, 5

  D. 1, 2, 3, 5, 4

  <!-- answer:7.2a choice: D -->

  **b)** Now 21 is removed. How many buckets does a search for 11 look at?

  A. 4

  B. 2

  C. 3

  D. 1

  <!-- answer:7.2b choice: A -->

  <details>
  <summary>Answer</summary>

  - **a)** **D.** 41 → 1. 21 → 1 is taken, so 2. 31 → 3. 5 → 5. 11 → 1, 2, 3 are taken, so 4. C starts probing at i = 1, skipping the home bucket; A forgets that a bucket holds only one key.
  - **b)** **A, 4:** buckets 1, 2 (empty-after-removal, so keep going), 3, and 4. B stops at bucket 2 as if it were never used, and misses 11.

  </details>

- **7.3** By hand.

  **a)** A table uses `key % 101`. Which bucket does 7777 go in?

  A. 101

  B. 77

  C. 0

  D. 76

  <!-- answer:7.3a choice: C -->

  **b)** What does `print(-17 % 5)` show in Python?

  A. 3

  B. -2

  C. 2

  D. -4

  <!-- answer:7.3b choice: A -->

  **c)** What is the load factor of 12 items in 16 buckets?

  A. 0

  B. 1.33

  C. 0.25

  D. 0.75

  <!-- answer:7.3c choice: D -->

  <details>
  <summary>Answer</summary>

  - **a)** **C, 0.** 7777 = 77 × 101 exactly. A subtracts 76 × 101 and stops, but 101 isn't a bucket in 0 to 100.
  - **b)** **A, 3**, since −17 = −4 × 5 + 3. B is the remainder some other languages give; D is `-17 // 5`.
  - **c)** **D.** 12 / 16 = 0.75. B divides buckets by items; A is `12 // 16`.

  </details>

- **7.4** Pick the Big-O for n items.

  **a)** Hash table search, worst case?

  A. O(1)

  B. O(n)

  C. O(log n)

  D. O(n log n)

  <!-- answer:7.4a choice: B -->

  **b)** One resize?

  A. O(1)

  B. O(log n)

  C. O(n)

  D. O(n²)

  <!-- answer:7.4b choice: C -->

  **c)** `x in some_list`, then `x in some_set` on average?

  A. O(n), then O(1)

  B. O(1), then O(1)

  C. O(n), then O(n)

  D. O(log n), then O(1)

  <!-- answer:7.4c choice: A -->

  <details>
  <summary>Answer</summary>

  - **a)** **B.** Every key can collide into one chain or cluster. A is the average case.
  - **b)** **C.** A resize rehashes all n items. A confuses it with the average insert, which stays O(1) because resizes are rare.
  - **c)** **A.** A list is scanned item by item; a set hashes to one bucket. D treats the list as if it were sorted and binary searched.

  </details>

- **7.5** Python dicts.

  **a)** What does this print?

  ```python
  ages = {"Ana": 30, "Bo": 25}
  ages["Ana"] = 31
  ages["Cy"] = 40
  del ages["Bo"]
  print(len(ages), ages["Ana"], ages.get("Bo", -1))
  ```

  A. `3 31 -1`

  B. `2 30 -1`

  C. `2 31 None`

  D. `2 31 -1`

  <!-- answer:7.5a choice: D -->

  **b)** Which can't be a dict key?

  A. `(4, 5)`

  B. `[4, 5]`

  C. `"id"`

  D. `45`

  <!-- answer:7.5b choice: B -->

  <details>
  <summary>Answer</summary>

  - **a)** **D.** "Ana" is replaced, "Cy" added, "Bo" removed, and `get` returns the default given. B keeps the old value, but assigning to an existing key replaces it.
  - **b)** **B.** A list can change, so it isn't hashable. A tuple of numbers can't change, so A is fine.

  </details>

- **7.6** Which structures fit these jobs best, in order: count how many times each word appears; track which usernames are taken; keep songs in play order, with repeats?

  A. set, dict, list

  B. list, set, dict

  C. dict, set, list

  D. dict, list, set

  <!-- answer:7.6 choice: C -->

  <details>
  <summary>Answer</summary>

  - **C.** Each word has a count: key-value pairs, a **dict**. Only membership matters for usernames: a **set**. Order and repeats matter for songs: a **list**. D would drop repeated songs.

  </details>
