# 4. Hash tables

A hash table finds an item by its key in O(1) on average: it computes where the item belongs instead of searching for it. It's how Python's `dict` and `set` work, and the reason they're so fast.

## The map ADT

A **map** (also called a dictionary or associative array) stores **key-value pairs** and looks up a value by its key. Keys are unique: putting a key that's already there replaces its value.

| Operation | What it does |
|---|---|
| Insert(key, value) | Add the pair, or replace the value if the key exists |
| Get(key) | Return the key's value, or report that it's missing |
| Remove(key) | Remove the pair |
| Contains(key) | True if the key is in the map |

A map can be built on a hash table (O(1) on average) or on a binary search tree (O(log n) on average, with keys kept in sorted order).

## How a hash table works

A hash table is an array of **buckets**. A **hash function** turns a key into a bucket index. The simplest one, the **modulo hash**, is `key % N`, where N is the number of buckets:

- Insert 47 into a table of 10 buckets: 47 % 10 = 7, so it goes in bucket 7.
- Searching for 47 computes the same index and looks only in bucket 7.

Two different keys can hash to the same bucket: 17 % 10 is 7 too. That's a **collision**, and it can't be avoided, because there are far more possible keys than buckets. A hash table needs a plan for collisions. There are two families: **chaining** and **open addressing** (probing).

## Chaining

With **chaining**, each bucket holds a list of the items that hashed to it.

- Insert: hash the key, and add the item to that bucket's list (after checking the key isn't already there).
- Search and remove: hash the key, and search only that bucket's list.

With a good hash function, items spread evenly, the lists stay short, and each operation is O(1) on average. In the worst case, every key lands in the same bucket, and the table is one long list: O(n).

## Open addressing: probing

With **open addressing**, each bucket holds at most one item. If a key's bucket is taken, the table **probes**: it tries other buckets in a fixed order until it finds a free one. Search follows the same order until it finds the key, or reaches a bucket that has never held anything.

### Linear probing

Try the next bucket, then the one after that, wrapping around the end: bucket `(h + i) % N` for i = 0, 1, 2, ...

Example: 10 buckets, h = key % 10. Insert 43, 13, 53, then 23:

| Key | Home bucket | Buckets tried | Lands in |
|---|---|---|---|
| 43 | 3 | 3 | 3 |
| 13 | 3 | 3, 4 | 4 |
| 53 | 3 | 3, 4, 5 | 5 |
| 23 | 3 | 3, 4, 5, 6 | 6 |

Linear probing tends to build **clusters**: long runs of full buckets that keep growing, because any key that hashes into a cluster lands at its end.

**Removing needs care.** If 13 were removed and its bucket simply emptied, a search for 53 would start at 3, find bucket 4 empty, and wrongly stop. So buckets have two kinds of empty:

- **Empty-since-start:** never used. A search can stop here: the key isn't in the table.
- **Empty-after-removal:** an item was removed. A search keeps going past it, and an insert may reuse it.

### Quadratic probing

Jump farther each time, to break up clusters: bucket `(h + c1·i + c2·i²) % N` for i = 0, 1, 2, ..., where c1 and c2 are constants the table picks. With c1 = 1 and c2 = 1, the offsets from the home bucket are 0, 2, 6, 12, ...

### Double hashing

Use a **second hash function** to choose the step size: bucket `(h1(key) + i·h2(key)) % N`. Keys with the same home bucket usually have different steps, so they follow different paths. h2 must never return 0, or the probe would stay in one bucket. A common choice is `h2(key) = p − (key % p)` for a prime p smaller than N.

## Resizing and the load factor

The **load factor** is the number of items divided by the number of buckets. It measures how full the table is:

- With chaining, it's the average list length. It can go above 1.
- With probing, it can't go above 1, and probes get long as it nears 1.

When the load factor passes a threshold (often around 0.75 for probing), the table **resizes**: it allocates a bigger array, usually a prime number about twice the old size, and **rehashes** every item into it. Items can't just be copied to the same index, because the index depends on N. A resize is O(n), but it's rare, so inserts stay O(1) on average.

## Hash functions

A good hash function is:

- **Deterministic:** the same key always gives the same index. Otherwise a stored key could never be found again.
- **Uniform:** keys spread evenly over the buckets, so collisions are rare.
- **Fast** to compute, since it runs on every insert, search, and remove.

- **Modulo hash:** `key % N`. Simple and fast. A prime N spreads keys better, since keys often share factors with a round number like 100.
- **Mid-square hash:** square the key, take some digits (or bits) from the middle of the result, and take that modulo N. The middle digits depend on every digit of the key. Example: 453² = 205209, and its middle two digits are 52.
- **Multiplicative string hash:** start from an initial value, and for each character, multiply the hash so far by a constant and add the character's code: `hash = hash * multiplier + code(c)`. Then take it modulo N. Each character's position matters, so anagrams like "stop" and "pots" get different hashes.

### Computing a modulo by hand

Questions often give a hash function like `key % 1009` and ask where a key goes. On a calculator without a `%` key:

1. Divide: 3045 ÷ 1009 = 3.0178...
2. Keep the whole-number part: 3.
3. Multiply it back and subtract: 3045 − 3 × 1009 = 3045 − 3027 = **18**.

So key 3045 goes in bucket 18. (Equivalently: take the fractional part, 0.0178..., and multiply it by 1009, then round.)

### Direct hashing

**Direct hashing** uses the key itself as the index: `h(key) = key`. There are no collisions, and every operation is O(1) even in the worst case. But it only works when keys are small non-negative integers, and it needs one bucket for every possible key, which wastes memory when keys are spread out.

## Cryptographic and password hashing

Hashing is also used for security, with different goals:

- A **cryptographic hash function** (like SHA-256) is **one-way**: easy to compute, but infeasible to reverse or to find two inputs with the same hash. A small change to the input changes the hash completely. It's used to check that a file wasn't altered, and in digital signatures.
- **Password hashing:** a site stores the hash of each password, not the password. At login, it hashes what you typed and compares the hashes. A random **salt**, stored with each user, is added to the password before hashing, so two users with the same password get different hashes, and precomputed tables of common passwords don't work. Password hash functions (like bcrypt) are deliberately **slow**, to make guessing millions of passwords expensive.

## Python's dict and set

A Python `dict` is a hash table using open addressing. `d[key]`, `d[key] = value`, `del d[key]`, and `key in d` are all O(1) on average. A `set` is the same, holding keys without values.

Keys must be **hashable**: immutable types like numbers, strings, and tuples. A list can't be a key, because changing it would change its hash and lose its bucket.

Checking `x in some_list` is O(n); checking `x in some_set` is O(1) on average. Turning a list into a set first is a common speedup when you check membership many times.

## Big-O summary

| Operation | Best | Average | Worst |
|---|---|---|---|
| Insert | O(1) | O(1) | O(n) |
| Search | O(1) | O(1) | O(n) |
| Remove | O(1) | O(1) | O(n) |
| Resize (rehash) | O(n) | O(n) | O(n) |
| Direct hashing, any operation | O(1) | O(1) | O(1) |

The worst case happens when many keys collide: one long chain, or one long probe sequence. A poor hash function, or a table that's too full, makes it likely.

## Questions

- **4.1** Chaining. A hash table has 7 buckets, uses `key % 7`, and resolves collisions with chaining.

  **a)** Which bucket does each key go in?

  | Key | Bucket |
  |---|---|
  | 15 | |
  | 22 | |
  | 9 | |
  | 30 | |
  | 6 | |

  <!-- answer:4.1a-e table: 1; 1; 2; 2; 6 -->

  **b)** After inserting all five, how many keys does a search for 22 compare against, at most?

  <!-- answer:4.1b blanks: 2 -->

  <details>
  <summary>Answer</summary>

  - **a)** 15 % 7 = 1, 22 % 7 = 1, 9 % 7 = 2, 30 % 7 = 2, 6 % 7 = 6.
  - **b)** 2: bucket 1 holds 15 and 22, and the search only looks in that bucket.

  </details>

- **4.2** Linear probing. A table has 10 buckets, uses `key % 10`, and resolves collisions with linear probing. Starting empty, insert 41, 21, 31, 5, and 11, in that order.

  **a)** Which bucket does each key land in?

  | Key | Bucket |
  |---|---|
  | 41 | |
  | 21 | |
  | 31 | |
  | 5 | |
  | 11 | |

  <!-- answer:4.2a-e table: 1; 2; 3; 5; 4 -->

  **b)** Now 21 is removed. A search for 11 starts at its home bucket. How many buckets does it look at to find 11?

  <!-- answer:4.2b blanks: 4 -->

  **c)** What is bucket 2 marked as after the removal?

  A. Empty-since-start

  B. Empty-after-removal

  <!-- answer:4.2c choice: B -->

  <details>
  <summary>Answer</summary>

  - **a)** 41 → 1. 21 → 1 is taken, so 2. 31 → 1, 2 taken, so 3. 5 → 5. 11 → 1, 2, 3 taken, 4 is free.
  - **b)** 4: buckets 1 (41), 2 (removed, keep going), 3 (31), and 4 (11).
  - **c)** **B.** If it were marked empty-since-start, the search would stop at bucket 2 and wrongly report 11 missing.

  </details>

- **4.3** Quadratic and double hashing. Both tables have 11 buckets.

  **a)** Quadratic probing uses `(h + i + i²) % 11` with h = key % 11. Key 14 has buckets 3 and 5 already full. Which bucket does it land in?

  <!-- answer:4.3a blanks: 9 -->

  **b)** Double hashing uses h1 = key % 11 and h2 = 7 − (key % 7), with probe `(h1 + i·h2) % 11`. Key 25 finds buckets 3 and 6 full. Which bucket does it land in?

  <!-- answer:4.3b blanks: 9 -->

  **c)** Why must h2 never be 0 in double hashing?

  A. Division by zero

  B. Every probe would land on the same bucket.

  C. The key would be lost.

  <!-- answer:4.3c choice: B -->

  <details>
  <summary>Answer</summary>

  - **a)** h = 3. i = 0: 3 (full). i = 1: 3 + 1 + 1 = 5 (full). i = 2: 3 + 2 + 4 = 9.
  - **b)** h1 = 3 and h2 = 7 − 4 = 3. i = 0: 3 (full). i = 1: 6 (full). i = 2: 9.
  - **c)** **B.** A step of 0 never moves away from the home bucket.

  </details>

- **4.4** Load factor and resizing.

  **a)** A table holds 12 items in 16 buckets. What is its load factor?

  <!-- answer:4.4a blanks: 0.75 | .75 | 3/4 -->

  **b)** Why must every item be rehashed when a table resizes, rather than copied to the same index?

  A. The items' keys change.

  B. The index depends on the number of buckets, so it changes when N changes.

  C. Rehashing removes duplicates.

  <!-- answer:4.4b choice: B -->

  **c)** What is the Big-O of one resize of a table with n items?

  <!-- answer:4.4c blanks: O(n) -->

  <details>
  <summary>Answer</summary>

  - **a)** 12 / 16 = 0.75.
  - **b)** **B.** With `key % N`, a new N gives a new index.
  - **c)** O(n): every item is rehashed once.

  </details>

- **4.5** Pick the Big-O of each operation on a hash table with n items.

  | Operation | Big-O |
  |---|---|
  | Search, average case | |
  | Search, worst case | |
  | Insert, average case | |
  | Remove, worst case | |
  | Search with direct hashing, worst case | |
  | Python `x in some_list` | |
  | Python `x in some_set`, average case | |

  <!-- answer:4.5a-g table [O(1), O(log n), O(n)]: O(1); O(n); O(1); O(n); O(1); O(n); O(1) -->

  <details>
  <summary>Answer</summary>

  - Hash tables are O(1) on average and O(n) in the worst case, when every key collides.
  - Direct hashing has no collisions, so it's O(1) even in the worst case.
  - A list is searched item by item, O(n). A set is a hash table, O(1) on average.

  </details>

- **4.6** Hash functions.

  **a)** A mid-square hash squares the key and takes the middle two digits of the 6-digit result. What does it give for key 512?

  <!-- answer:4.6a blanks: 21 -->

  **b)** What makes direct hashing impractical for keys like 9-digit ID numbers?

  A. Collisions are too common.

  B. It needs a bucket for every possible key: a billion buckets.

  C. It's O(n).

  <!-- answer:4.6b choice: B -->

  <details>
  <summary>Answer</summary>

  - **a)** 512² = 262144, whose middle two digits are 21.
  - **b)** **B.** Direct hashing has no collisions at all, but the array must cover the whole key range.

  </details>

- **4.7** Password hashing.

  **a)** Why do sites add a random salt to each password before hashing it?

  A. So the hash can be reversed later

  B. So two users with the same password get different hashes, and precomputed tables don't work

  C. To make the hash shorter

  <!-- answer:4.7a choice: B -->

  **b)** Why are password hash functions made deliberately slow?

  A. To save memory

  B. To make guessing many passwords expensive for an attacker

  C. To avoid collisions

  <!-- answer:4.7b choice: B -->

  <details>
  <summary>Answer</summary>

  - **a)** **B.** A cryptographic hash can't be reversed at all; the salt defends against lookups of precomputed hashes.
  - **b)** **B.** A real user hashes one password once, so slowness costs them little, while an attacker trying millions of guesses pays it millions of times.

  </details>

- **4.8** Hash functions by hand.

  **a)** A table uses `key % 101`. Which bucket does key 7777 go in?

  <!-- answer:4.8a blanks: 0 -->

  **b)** Which property would a hash function lack if it used the current time as part of the index?

  A. Uniform

  B. Deterministic

  C. Fast

  <!-- answer:4.8b choice: B -->

  <details>
  <summary>Answer</summary>

  - **a)** 7777 ÷ 101 = 77 exactly, so the remainder is 0: bucket 0.
  - **b)** **B.** The same key would hash to a different bucket at a different time, so a stored key couldn't be found again.

  </details>
