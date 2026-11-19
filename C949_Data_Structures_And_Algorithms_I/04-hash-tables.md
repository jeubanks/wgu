# 4. Hash tables

A hash table finds an item by its key in O(1) time on average. Instead of searching for the item, it computes where the item belongs. Python's `dict` and `set` are hash tables, which is why they're so fast.

## The map ADT

A **map** (also called a dictionary or associative array) stores **key-value pairs** and looks up a value by its key. A phone book is a map: the key is a name, and the value is that person's number. Keys are unique, so inserting a key that's already in the map replaces its value.

| Operation | What it does |
|---|---|
| Insert(key, value) | Add the pair, or replace the value if the key exists |
| Get(key) | Return the key's value, or report that it's missing |
| Remove(key) | Remove the pair |
| Contains(key) | True if the key is in the map |

You can build a map on a hash table (O(1) on average) or on a binary search tree (O(log n) on average, with the keys kept in sorted order).

## How a hash table works

A hash table is an array of **buckets**. A **hash function** turns a key into a bucket index. The simplest one, the **modulo hash**, is `key % N`, where N is the number of buckets:

- Insert 47 into a table of 10 buckets: 47 % 10 = 7, so it goes in bucket 7.
- A search for 47 computes the same index and looks only in bucket 7.

Two different keys can hash to the same bucket: 17 % 10 is also 7. That's called a **collision**. Collisions can't be avoided, because there are far more possible keys than buckets, so every hash table needs a way to handle them. The two families of approaches are **chaining** and **open addressing** (probing).

## Chaining

With **chaining**, each bucket holds a list of the items that hashed to it. With 10 buckets, 47 and 17 both hash to 7, so bucket 7 holds the list 47, 17.

- Insert: hash the key, check that the key isn't already in that bucket's list, and add the item to the list.
- Search and remove: hash the key, and search only that bucket's list.

With a good hash function, items spread evenly and the lists stay short, so each operation is O(1) on average. In the worst case, every key lands in the same bucket and the table becomes one long list, so each operation is O(n).

## Open addressing: probing

With **open addressing**, each bucket holds at most one item. If a key's bucket is taken, the table **probes**, which means it tries other buckets in a fixed order until it finds a free one. A search follows the same order until it finds the key or reaches a bucket that has never held anything. It can stop at that bucket because an insert of the key would have stopped there too: if the key were in the table, the search would have reached it before this bucket.

### Linear probing

Start at the key's home bucket h (the index the hash function gives). If it's taken, try the next bucket, then the one after that, wrapping around at the end of the array. The table tries bucket `(h + i) % N` for i = 0, 1, 2, ...

Example: 10 buckets, h = key % 10. Insert 43, 13, 53, then 23:

| Key | Home bucket | Buckets tried | Lands in |
|---|---|---|---|
| 43 | 3 | 3 | 3 |
| 13 | 3 | 3, 4 | 4 |
| 53 | 3 | 3, 4, 5 | 5 |
| 23 | 3 | 3, 4, 5, 6 | 6 |

Linear probing tends to build **clusters**, which are long runs of full buckets, like buckets 3 to 6 above. Any key that hashes anywhere into a cluster walks past its end and lands in the next free bucket. That makes the cluster one bucket longer, which makes it even more likely to catch the next key.

Removing an item needs care. In the table above, suppose 13 is removed and bucket 4 is simply emptied. A search for 53 would start at bucket 3, find bucket 4 empty, and wrongly stop, even though 53 is in bucket 5. To prevent this, buckets have two kinds of empty:

- **Empty-since-start:** the bucket has never been used. A search can stop here, because the key isn't in the table.
- **Empty-after-removal:** an item was removed from the bucket. A search keeps going past it, and an insert may reuse it.

### Quadratic probing

To break up clusters, jump farther each time, so a key that collides moves quickly away from the crowded area. The table tries bucket `(h + c1·i + c2·i²) % N` for i = 0, 1, 2, ..., where c1 and c2 are constants the table picks. With c1 = 1 and c2 = 1, the offset from the home bucket is i + i²:

| i | Offset i + i² |
|---|---|
| 0 | 0 |
| 1 | 1 + 1 = 2 |
| 2 | 2 + 4 = 6 |
| 3 | 3 + 9 = 12 |

### Double hashing

Use a **second hash function** to choose the step size. The first hash, h1, gives the home bucket, as before. The second, h2, says how far to jump on each collision. The table tries bucket `(h1(key) + i·h2(key)) % N` for i = 0, 1, 2, ...

Keys with the same home bucket usually have different step sizes, so they follow different paths instead of piling up in one cluster. h2 must never return 0, or the probe would stay in one bucket. A common choice is `h2(key) = p − (key % p)` for a prime p smaller than N. Because `key % p` is at most p − 1, this h2 is always at least 1.

Example: N = 11, h1 = key % 11, and h2 = 7 − (key % 7). Key 15 has h1 = 4 and h2 = 7 − 1 = 6, so it tries buckets 4, then 10, then (4 + 12) % 11 = 5, and so on.

<div class="viz" data-viz="hash-probe" markdown>

*On the site, an interactive diagram here inserts keys into a 13-bucket table and animates linear probing, quadratic probing, and double hashing.*

</div>

## Resizing and the load factor

The **load factor** is the number of items divided by the number of buckets. It measures how full the table is: 6 items in 10 buckets is a load factor of 0.6.

- With chaining, it's the average list length. It can go above 1.
- With probing, it can't go above 1, and probe sequences get long as it gets close to 1.

When the load factor passes a threshold (often around 0.75 for probing), the table **resizes**:

1. Allocate a bigger array, usually a prime number of buckets about twice the old size.
2. **Rehash** every item: run the hash function again with the new N, and insert the item at the new index.

Items can't just be copied to the same index, because the index depends on N. With `key % N`, key 17 is in bucket 7 of a 10-bucket table, but in bucket 17 of a 23-bucket table. A resize is O(n), but resizes are rare, so inserts stay O(1) on average.

## Hash functions

A good hash function is:

- **Deterministic:** the same key always gives the same index. Otherwise a stored key could never be found again.
- **Uniform:** keys spread evenly over the buckets, so collisions are rare.
- **Fast** to compute, since it runs on every insert, search, and remove.

Three common hash functions:

- **Modulo hash:** `key % N`. It's simple and fast. A prime N spreads keys better than a round number like 100, because keys often share factors with round numbers.
- **Mid-square hash:** square the key, take some digits (or bits) from the middle of the result, and take that modulo N. The middle digits depend on every digit of the key. Example: 453² = 205209, and its middle two digits are 52.
- **Multiplicative string hash:** start from an initial value, and for each character, multiply the hash so far by a constant and add the character's code: `hash = hash * multiplier + code(c)`. Then take the result modulo N. Each character's position affects the result, so anagrams like "stop" and "pots" get different hashes.
  - Small example, with initial value 0, multiplier 10, and made-up codes a = 1 and b = 2. "ab" gives 0 × 10 + 1 = 1, then 1 × 10 + 2 = 12. "ba" gives 21. The first character gets multiplied more times, so swapping letters changes the hash.

### Computing a modulo by hand

Questions often give a hash function like `key % 1009` and ask where a key goes. The remainder is what's left after taking out as many whole 1009s as fit. On a calculator without a `%` key, for key 3045:

1. Divide: 3045 ÷ 1009 = 3.0178...
2. Keep the whole-number part: 3.
3. Multiply it back and subtract: 3045 − 3 × 1009 = 3045 − 3027 = **18**.

So key 3045 goes in bucket 18. (Another way: multiply the fractional part, 0.0178..., by 1009, then round.)

### Direct hashing

**Direct hashing** uses the key itself as the index: `h(key) = key`, so key 42 goes in bucket 42. Two different keys always get different buckets, so there are no collisions, and every operation is O(1) even in the worst case. Direct hashing only works when keys are small non-negative integers, though. It needs one bucket for every possible key, which wastes memory when the keys are spread out.

## Cryptographic and password hashing

Hashing is also used for security, where the goals are different:

- A **cryptographic hash function** (like SHA-256) is **one-way**. It's easy to compute, but it's infeasible to reverse or to find two inputs with the same hash. A small change to the input changes the hash completely. Cryptographic hashes are used to check that a file wasn't altered, and in digital signatures.
- **Password hashing:** a site stores the hash of each password instead of the password itself. At login, the site hashes what you typed and compares the two hashes. Before hashing, the site adds a random **salt** to the password and stores the salt with the user. The salt means two users with the same password get different hashes, and precomputed tables of common passwords don't work. Password hash functions (like bcrypt) are deliberately **slow**, to make guessing millions of passwords expensive.

## Python's dict and set

A Python `dict` is a hash table using open addressing. `d[key]`, `d[key] = value`, `del d[key]`, and `key in d` are all O(1) on average. A `set` works the same way but holds keys without values.

Keys must be **hashable**, which means immutable types like numbers, strings, and tuples. A list can't be a key: Python gives lists no hash at all, because a list can change, and a key that changed after it was stored would leave it in the wrong bucket.

Checking `x in some_list` is O(n). Checking `x in some_set` is O(1) on average. If you check membership many times, turning the list into a set first is a common speedup.

## Big-O summary

| Operation | Best | Average | Worst |
|---|---|---|---|
| Insert | O(1) | O(1) | O(n) |
| Search | O(1) | O(1) | O(n) |
| Remove | O(1) | O(1) | O(n) |
| Resize (rehash) | O(n) | O(n) | O(n) |
| Direct hashing, any operation | O(1) | O(1) | O(1) |

The worst case happens when many keys collide and form one long chain or one long probe sequence. A poor hash function or a table that's too full makes this more likely.

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
  - **b)** 2. Bucket 1 holds 15 and 22, and the search only looks in that bucket.

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

  - **a)** 41 → 1. 21 → 1 is taken, so 2. 31 → 1 and 2 are taken, so 3. 5 → 5. 11 → 1, 2, and 3 are taken, and 4 is free.
  - **b)** 4. It looks at buckets 1 (41), 2 (removed, keep going), 3 (31), and 4 (11).
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
  - **c)** O(n). Every item is rehashed once.

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
  - A list is searched item by item, so it's O(n). A set is a hash table, so it's O(1) on average.

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

  - **a)** **B.** A cryptographic hash can't be reversed at all. The salt protects against lookups in tables of precomputed hashes.
  - **b)** **B.** A real user's password is hashed once per login, so the slowness costs them little. An attacker trying millions of guesses pays that cost millions of times.

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

  - **a)** 7777 ÷ 101 = 77 exactly, so the remainder is 0, and the key goes in bucket 0.
  - **b)** **B.** The same key would hash to a different bucket at a different time, so a stored key couldn't be found again.

  </details>
