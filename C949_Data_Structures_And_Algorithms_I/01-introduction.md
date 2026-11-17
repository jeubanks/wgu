# 1. Introduction to data structures and algorithms

This chapter sets up the words the rest of the course uses: what an algorithm is, the main kinds of algorithms, data types, data structures, abstract data types, and efficiency. It then works through the design ideas zyBooks chapter 1 covers: compression with Huffman codes, heuristics, greedy algorithms, and dynamic programming.

## Data structures and algorithms

A **data structure** is a layout for data in memory plus the operations that work on that layout. Typical operations read or change an item, look for an item, add one, or take one out. The basic ones in this course:

| Data structure | How it's organized |
|---|---|
| Record | A group of subitems, called fields, each with a name, like a student's name, ID, and GPA |
| Array | An ordered collection of elements, each reached directly by its position (index) |
| Linked list | An ordered list of nodes, where each node holds data and a reference to the next node |
| Binary tree | Nodes that each hold data and have up to two children, a left child and a right child |
| Hash table | Unordered items, each mapped (hashed) to a location in an array |
| Heap | A tree where each node's key is greater than or equal to its children's keys (max-heap), or less than or equal to them (min-heap) |
| Graph | Items (vertices) joined by connections (edges) |

An **algorithm** is a step-by-step procedure for a computational problem or a calculation. The steps don't have to be code: plain English, pseudocode, and even a circuit can all express one.

A **computational problem** has three parts:

- **Input:** the data the algorithm is given.
- **Question:** what you want to know about the input, which a computer can answer.
- **Output:** the form the answer takes.

For example, the input is a list of temperatures, the question is how many of them are below freezing, and the output is one integer.

### Choosing a data structure

The right structure depends on the data and on which operations the program does most. Each structure makes some operations cheap and others expensive, so the choice is a trade-off.

Inserting into the middle shows the trade-off. An array keeps its items side by side, so every item after the new spot has to shift over one place first:

```text
array before:   [K, P, R, T, W, Z]      insert M at index 2
shift Z, W, T, R right one place each   (4 shifts)
array after:    [K, P, M, R, T, W, Z]
```

A linked list needs no shifting. Make a node for M, point it at R, then point P's node at M. The other nodes don't move. Inserting at the end of an array needs no shifts, and inserting at the front of an array shifts every item.

### Algorithms for data structures

The algorithm for an operation depends on the structure. Appending to an array and appending to a linked list are different procedures:

- **Array append:** make the array one element larger, then put the new item in the last element.
- **Linked list append:** if the list is empty, point both the head and the tail at the new node. Otherwise, point the tail node's next reference at the new node, then point the tail at the new node. Either way, add 1 to the stored length.

Algorithms also use data structures to hold their own working data. A program that reports the three highest test scores might keep a short list of the best scores so far, sorted from high to low. Each new score that beats the last one in the list replaces it, and the list is sorted again.

The structure decides how fast an algorithm can be. Binary search is O(log n) on a sorted array because it can jump to the middle item in one step. On a linked list, getting to the middle takes O(n) steps, so the same idea is no faster than reading every item.

### What makes something an algorithm

zyBooks points to a list of characteristics every algorithm should have. Other books word the list differently: some say "definiteness" for unambiguity, and some add "generality" (it works for every input of the right kind). This guide uses zyBooks' names.

| Characteristic | Meaning |
|---|---|
| **Unambiguity** | Every step is clear, with only one way to read it. |
| **Finiteness** | It always stops after a finite number of steps. No endless loops. |
| **Well-defined inputs** | The inputs it takes, if any, are clearly stated. |
| **Well-defined outputs** | It produces at least one clearly stated output. |
| **Effectiveness** | Every step is basic enough to actually carry out, in finite time. |
| **Feasibility** | It can run with the resources actually available. |
| **Language independence** | The steps can be written in any language, plain English or code, and give the same result. |

Beyond those, a **good** algorithm is correct (right output for every valid input), simple, and easy to understand and maintain. It's modular (built from small, separate steps), robust (handles unexpected input sensibly), and extensible (others can build on it).

### Kinds of algorithms

Algorithms are often grouped by the strategy they use:

| Kind | Strategy | Examples |
|---|---|---|
| **Brute force** | Try every possible answer | Checking every pair of items; trying every route |
| **Recursive** | Solve a smaller copy of the same problem, down to a base case | Factorial, tree traversals |
| **Backtracking** | Build an answer step by step, and undo a step when it leads to a dead end | Sudoku, mazes, the N-queens puzzle |
| **Divide and conquer** | Split into independent parts, solve each, combine the results | Merge sort, quicksort, binary search |
| **Greedy** | Take the best-looking choice at each step, never undo it | Making change, activity selection, Huffman coding, Dijkstra's shortest path |
| **Dynamic programming** | Solve overlapping subproblems once each, and store the answers | Fibonacci with stored terms, longest common substring, Bellman-Ford |
| **Randomized** | Use random choices as part of the method | Quicksort with a random pivot |
| **Searching** | Find a target in a collection | Linear search, binary search |
| **Sorting** | Put items in order | Insertion sort, merge sort |
| **Hashing** | Turn data into a fixed-size value used as an index or fingerprint | Hash tables, password hashing |
| **Encryption** | Turn data into a form only the right key can read | AES, RSA |

Divide and conquer and dynamic programming both split a problem into subproblems. In divide and conquer, the subproblems don't overlap, so there's nothing to reuse. In dynamic programming they do overlap, so it stores their answers.

Many real problems reduce to a few well-known algorithms. Comparing two DNA samples for their longest shared stretch is a longest common substring problem. Checking whether a part number is in a sorted parts catalog is binary search. Finding the quickest walking route between two buildings is Dijkstra's shortest path on a graph of paths.

### Efficiency and hard problems

An algorithm's efficiency is usually measured by its runtime, and how that runtime grows as the input grows. It's written in Big-O, which keeps only the term that dominates for large inputs. The [Big-O cheat sheet](big-o.md) lists the growth rates and the rules for working one out.

zyBooks calls an algorithm **efficient** when its runtime grows no faster than a polynomial in the input size: O(n), O(n²), O(n³), and so on. O(2ⁿ) is not efficient.

**NP-complete** problems are a group of problems for which nobody knows an efficient algorithm. Three facts describe them:

- Nobody has found an efficient algorithm for any NP-complete problem.
- Nobody has proven that an efficient algorithm is impossible.
- If an efficient algorithm is found for one NP-complete problem, every NP-complete problem can be solved efficiently.

One NP-complete problem is the **clique** decision problem: given a graph and a number K, is there a group of K vertices that are all joined to each other? In a friendship network, that asks whether K people all know one another. Another is deciding whether there's a route through every city on a map that's shorter than a given length.

Once a programmer knows a problem is NP-complete, they can stop hunting for a fast exact algorithm. Instead, they write a heuristic: an algorithm that quickly finds a good answer that may not be the best.

## Data types, data structures, and ADTs

These three ideas sit at different levels:

| Level | What it describes | Examples |
|---|---|---|
| **Data type** | One kind of value, how it's stored, and what you can do with it. Built into the language. | `int`, `float`, `char`, `bool` |
| **Data structure** | How many values are organized in memory, built from data types | Array, linked list, tree, hash table |
| **Abstract data type** | Only the behavior: which operations exist and what they do, with no storage details | List, stack, queue, set, map |

Data types come in a few flavors:

- **Primitive:** single values the language provides: integers, floating-point numbers, characters, booleans.
- **Composite:** built from other types. An array holds many values of one type. A **record** (a `struct` in C; a class, `namedtuple`, or `dataclass` in Python) holds named fields of different types, like a student's name, ID, and GPA.
- **User-defined:** types the programmer makes, like classes and **enumerations**. An enumeration (`enum`) is a type with a fixed set of named constants, like `NORTH, EAST, SOUTH, WEST`. It makes code clearer and stops a variable from holding a value outside the set.

## Abstract data types (ADTs)

An **abstract data type** is defined by what you can ask it to do, not by how it does it. A list ADT promises "append, remove, search, and keep items in order". It says nothing about arrays or nodes. A data structure is one way to build it, and the same ADT can be built on different structures. Code that calls the ADT's operations works the same whichever one is underneath, so the programmer doesn't need to know which it is.

zyBooks' common ADTs and the structures each is usually built on:

| ADT | What it does | Usually built on |
|---|---|---|
| List | Holds items in order | Array, linked list |
| Dynamic array | Holds items in order, with access by index | Array |
| Stack | Items are pushed onto the top and popped from the top | Linked list, array |
| Queue | Items are added at the back and removed from the front | Linked list, array |
| Deque | Items are added and removed at both the front and the back | Linked list, array |
| Bag | Holds items in no particular order, duplicates allowed | Array, linked list |
| Set | Holds distinct items, in no particular order | Binary search tree, hash table |
| Priority queue | A queue where higher-priority items sit closer to the front | Heap |
| Dictionary (map) | Associates (maps) keys with values | Hash table, binary search tree |

Two of these are easy to mix up by their rules on order and duplicates:

| ADT | Ordered? | Duplicates? |
|---|---|---|
| List | Yes, in the order items were added | Allowed |
| Priority queue | Yes, by priority | Allowed |
| Bag | No | Allowed |
| Set | No | Not allowed |

### Abstraction

**Abstraction** lets you use a thing through a simple outside view and ignore how it works inside. An ADT is an example: its operations are the outside view, and the data structure is the hidden inside. Code that uses a stack only calls push and pop, so the stack can switch from a linked list to an array without that code changing.

Abstraction lets a programmer think about which ADT fits the job. Say a program keeps a playlist of the 10 most recent songs, adds each new song at one end, drops the oldest from the other, and sometimes shows the songs newest first. A queue handles adding and dropping, but a queue has no operation for walking through the items backward. A list does, so the list ADT is the better fit.

Abstraction doesn't hide everything. The hidden structure decides the **runtime**, so you have to look inside to measure or speed it up. A list built on an array reads item i in O(1), and one built on a linked list takes O(n). The program's behavior is the same; its speed isn't.

### ADTs in standard libraries

You rarely have to build common ADTs yourself: each major language ships them in its standard library. In some languages you choose the structure behind an ADT; in others the library makes that choice.

| Language | Library | Some of the ADTs it provides |
|---|---|---|
| Python | Python standard library | list, set, dict, deque |
| C++ | Standard Template Library (STL) | vector, list, deque, queue, stack, set, map |
| Java | Java Collections Framework (JCF) | Collection, Set, List, Map, Queue, Deque |

## Huffman compression

**Compression** rewrites data so it needs fewer bits, which saves disk space and transfer time. The trick is to spend few bits on common items and more bits on rare ones.

Uncompressed text in ASCII uses 8 bits for every character. A compression **dictionary** lists a code for each character, made for this particular text. **Huffman coding** builds that dictionary with a binary tree.

How to build the codes:

1. Count how often each character appears. This is the **character frequency table**.
2. Make a leaf node for each character, holding its count, and put every leaf in a priority queue where a lower count means a higher priority.
3. Remove the two nodes with the lowest counts. Make a new parent node with the first one removed as its **left** child and the second as its **right** child. The parent's count is the sum of theirs. Put the parent back in the queue.
4. Repeat step 3 until one node is left. It's the root of the Huffman tree.
5. Read each character's code from the path from the root to its leaf: append 0 for each left branch and 1 for each right branch.

A worked example on the text `MISSISSIPPI` (11 characters):

| Character | Count |
|---|---|
| I | 4 |
| S | 4 |
| P | 2 |
| M | 1 |

- Remove M (1), then P (2). Join them under a parent of 3: M on the left, P on the right.
- The queue now holds 3, I (4), and S (4). Remove 3, then I. Join them into 7: the 3 node on the left, I on the right.
- Remove S (4), then 7. Join them into the root, 11: S on the left, 7 on the right.

```text
            11
          0/  \1
          S    7
             0/ \1
             3   I
           0/ \1
           M   P
```

The codes are S = `0`, I = `11`, M = `100`, P = `101`. The encoded text takes 4×1 + 4×2 + 2×3 + 1×3 = 21 bits. In 8-bit ASCII, the same 11 characters take 88 bits. Even a fixed-length code of 2 bits per character (enough for four characters) needs 22.

Three things to know:

- **No code is the start of another.** Every character sits at a leaf, so no code is a prefix of another code. The decoder never needs separators.
- **Ties can give different trees.** When two nodes have the same count, either can come out of the queue first. The codes change, but the total number of bits doesn't.
- **The dictionary has to travel with the data.** The decoder needs the tree (or the codes) to read the bits, and that adds to the size. So Huffman coding pays off mainly on large files.

<div class="viz" data-viz="huffman" markdown>

*On the site, a drawing here shows this Huffman tree, with each code read off its branches.*

</div>

### Compressing and decompressing

To **compress**, build the codes, then go through the text one character at a time and append each character's code.

To **decompress**, start at the root and read the bits one at a time:

1. On a 0, move to the left child. On a 1, move to the right child.
2. If the node you reach is a leaf, append its character to the result and go back to the root.
3. Repeat until there are no bits left.

Decoding `100110101` with the `MISSISSIPPI` tree:

| Bits read | Path | Reaches | Result so far |
|---|---|---|---|
| `100` | right, left, left | M | M |
| `11` | right, right | I | MI |
| `0` | left | S | MIS |
| `101` | right, left, right | P | MISP |

## Heuristics

Finding the best (optimal) answer can take more time or memory than is available. A **heuristic** trades some quality for speed: it settles for an answer that may not be the best or may not be exact. A **heuristic algorithm** uses that trade to get a nearly-best answer fast.

### The knapsack problem

A knapsack can carry a limited weight. Each item has a weight and a value. The goal is the most valuable load that stays within the weight limit. In the **0-1 knapsack problem**, you can take at most one of each item. Trying every combination finds the best load, but with n items there are 2ⁿ combinations.

zyBooks' heuristic for the 0-1 knapsack takes the most valuable items first:

1. Sort the items by value, highest first.
2. Go through them in that order. If an item fits in the remaining weight, take it and subtract its weight.
3. Stop at the first item that doesn't fit.

A lighter item further down the list is never tried, even if it would fit.

Example: the limit is 20 lb, and the items are 10 lb worth $50, 8 lb worth $48, 6 lb worth $42, and 4 lb worth $12.

| Step | Item (by value) | Remaining before | Fits? | Remaining after | Total value |
|---|---|---|---|---|---|
| 1 | 10 lb, $50 | 20 | Yes | 10 | $50 |
| 2 | 8 lb, $48 | 10 | Yes | 2 | $98 |
| 3 | 6 lb, $42 | 2 | No: stop | 2 | $98 |

The heuristic returns $98. The best load is 10 + 6 + 4 = 20 lb, worth $104. The heuristic is fast and close to the best, but it isn't optimal.

### Self-adjusting heuristics

A **self-adjusting heuristic** reshapes a data structure in response to the operations done on it. AVL trees and red-black trees rebalance themselves this way as items are added and removed (chapter 6).

The **move-to-front** heuristic speeds up repeated searches in a list. After a linear search finds an item, move it to the front. Items searched for often then sit near the front, where they're found in few comparisons.

Example: the list is `8, 3, 6, 1, 9`.

| Search for | List before | Comparisons | List after |
|---|---|---|---|
| 1 | 8, 3, 6, 1, 9 | 4 | 1, 8, 3, 6, 9 |
| 1 | 1, 8, 3, 6, 9 | 1 | 1, 8, 3, 6, 9 |
| 9 | 1, 8, 3, 6, 9 | 5 | 9, 1, 8, 3, 6 |

It works best when the same keys are searched for again and again. If every search is for a different key, moving items to the front doesn't help.

## Greedy algorithms

A **greedy algorithm** builds an answer one step at a time, always taking the option that looks best right now, and never going back. Because it ignores what a choice does to the options left later, the result is sometimes optimal and sometimes not.

### Making change

Make 63 cents with as few coins as possible, using quarters (25), dimes (10), nickels (5), and pennies (1). The greedy method takes the largest coin that still fits, as many times as it fits, then moves to the next coin:

| Coin | Remaining before | Coins taken | Remaining after |
|---|---|---|---|
| 25 | 63 | 2 | 13 |
| 10 | 13 | 1 | 3 |
| 5 | 3 | 0 | 3 |
| 1 | 3 | 3 | 0 |

That's 6 coins, and with US coins the greedy answer is always the fewest.

With other coins, greedy can fail. With coins 1, 3, and 4, making 6 greedily gives 4 + 1 + 1 (3 coins), but 3 + 3 (2 coins) is better. The greedy choice of 4 couldn't be undone.

### Fractional knapsack

The **fractional knapsack problem** lets you take part of an item: any fraction from 0.0 to 1.0 of it, for that fraction of its weight and value. Greedy is not always optimal for the 0-1 knapsack, but it **is** optimal for the fractional knapsack:

1. Sort the items by value-to-weight ratio, highest first.
2. Take whole items in that order while the next whole item fits.
3. When the next item doesn't fit, take the fraction of it that fills the remaining weight, and stop.

Same items as the heuristic example, 20 lb limit:

| Item | Value per lb |
|---|---|
| 6 lb, $42 | 7 |
| 8 lb, $48 | 6 |
| 10 lb, $50 | 5 |
| 4 lb, $12 | 3 |

| Step | Item | Remaining before | Taken | Remaining after | Total value |
|---|---|---|---|---|---|
| 1 | 6 lb, $42 | 20 | All | 14 | $42 |
| 2 | 8 lb, $48 | 14 | All | 6 | $90 |
| 3 | 10 lb, $50 | 6 | 6/10 = 0.6 of it, worth $30 | 0 | $120 |

Every chosen item is taken whole except possibly the last, so the number of items chosen is at most the number available.

### Activity selection

In the **activity selection problem**, each activity has a start time and a finish time. The goal is the largest set of activities with no time conflicts. Greedy finds the optimal answer:

1. Sort the activities by finish time, earliest first.
2. Choose the first one. It becomes the current activity.
3. Go through the rest in order. Choose an activity if it starts at or after the current activity finishes, and make it the current activity. Skip it otherwise.

An activity that starts at the exact moment the current one finishes doesn't conflict.

Example, already sorted by finish time:

| Activity | Start | Finish | Current finishes at | Chosen? |
|---|---|---|---|---|
| A | 1 | 3 | (first) | Yes |
| B | 2 | 5 | 3 | No: starts at 2, before 3 |
| C | 4 | 6 | 3 | Yes |
| D | 6 | 8 | 6 | Yes: starts at 6, when C finishes |
| E | 5 | 9 | 8 | No |
| F | 8 | 10 | 8 | Yes |

The answer is A, C, D, F: 4 activities. The activity that finishes first is always chosen.

## Dynamic programming

**Dynamic programming** breaks a problem into smaller pieces, saves the answer to each piece the first time it's worked out, and builds the full answer from those saved results. It pays off when the same pieces would otherwise be worked out again and again.

Splitting a problem into subproblems alone isn't dynamic programming. Merge sort splits too, but it never reuses an answer.

### Fibonacci numbers

zyBooks numbers the terms from 0: F(0) = 0, F(1) = 1, and F(n) = F(n − 1) + F(n − 2).

Plain recursion recomputes the same terms many times. Computing F(6) recursively makes 25 calls:

| Term | Times it's computed for F(6) |
|---|---|
| F(5) | 1 |
| F(4) | 2 |
| F(3) | 3 |
| F(2) | 5 |
| F(1) | 8 |
| F(0) | 5 |

The number of calls grows exponentially: O(2ⁿ).

The dynamic programming version keeps only the two most recent terms, `previous` and `current`, and loops from 1 up to n − 1. Each pass computes `next = previous + current`, then shifts: `previous` takes `current`'s value and `current` takes `next`'s.

| Pass i | next | previous after | current after |
|---|---|---|---|
| (start) | | 0 | 1 |
| 1 | 1 | 1 | 1 |
| 2 | 2 | 1 | 2 |
| 3 | 3 | 2 | 3 |
| 4 | 5 | 3 | 5 |
| 5 | 8 | 5 | 8 |

F(6) = 8, after n − 1 = 5 passes. Each term is computed once, so the loop is O(n).

### Longest common substring

A **substring** is a run of characters next to each other: `REA` is a substring of `BREAD`. The **longest common substring** algorithm finds the longest substring that appears in both of two strings.

zyBooks uses a matrix of integers with one row per character of the first string (N rows) and one column per character of the second (M columns). The entry at row i, column j is the length of the longest common substring that **ends** at character i of the first string and character j of the second.

Fill the matrix one row at a time, top to bottom, left to right within each row:

- If the two characters **match**, the entry is 1 + the entry diagonally up and to the left. Use 0 for an up-left entry that's outside the matrix (row 0 or column 0).
- If they **don't match**, the entry is 0.

The **largest entry** is the length of the longest common substring. Its row is where the substring ends in the first string, so the substring is the characters ending there, counting back by the length. If two entries tie for largest, there are two longest common substrings. zyBooks' code updates the largest entry only when a new entry is strictly larger, so it returns the first one it finds (the one ending in the earliest row).

`BREAD` (rows) against `TREAT` (columns):

```text
      T  R  E  A  T
  B   0  0  0  0  0
  R   0  1  0  0  0     R = R: 1 + up-left 0 = 1
  E   0  0  2  0  0     E = E: 1 + up-left 1 = 2
  A   0  0  0  3  0     A = A: 1 + up-left 2 = 3
  D   0  0  0  0  0
```

The largest entry is 3, in row 3 (the `A` of `BREAD`, counting from 0). The longest common substring is the 3 characters ending there: `REA`.

The algorithm fills N × M entries, so it's O(NM) time. Storing the whole matrix is O(NM) space.

A space-saving version uses the fact that each row only looks at the row above it. An implementation can keep a single row of M entries, plus three variables: the up-left value (saved before it's overwritten), the largest entry so far, and the row index where it was found. It still fills N × M entries, so the time stays O(NM), but the space drops to O(M). It still finds the substring's length and where the substring ends.

One common use is comparing long DNA strings (made of the letters A, C, G, and T) to find shared stretches. Those strings can be billions of characters long, so both the O(NM) time and the space saving matter.

### Longest common subsequence

A **subsequence** keeps characters in their order but can skip some: `ACE` is a subsequence of `ABCDE`, but not a substring. The **longest common subsequence** (LCS) of two strings is the longest one that's a subsequence of both.

zyBooks' lab builds the same N × M matrix as the substring algorithm, with one rule changed:

- If the two characters **match**, the entry is 1 + the entry up and to the left (same as the substring).
- If they **don't match**, the entry is the larger of the entry above and the entry to the left.

Use 0 for any entry outside the matrix. Entries never get smaller moving right or down, so the largest entry is the bottom-right one, and it's the LCS length.

`CART` (rows) against `CHAT` (columns):

```text
      C  H  A  T
  C   1  1  1  1     C = C: 1 + 0. The rest of the row copies from the left.
  A   1  1  2  2     A = A: 1 + up-left 1 = 2
  R   1  1  2  2     no matches: larger of above and left
  T   1  1  2  3     T = T: 1 + up-left 2 = 3
```

The LCS length is 3 (`CAT`). Like the substring matrix, it's O(NM) time. Trying every subsequence instead would be exponential. Two strings can have more than one LCS of the same length.

## Big-O summary

| Operation | Big-O |
|---|---|
| Insert at an index in an array (shifting) | O(n) |
| Insert after a known node in a linked list | O(1) |
| Append to a linked list with a tail reference | O(1) |
| Build a character frequency table for a text of n characters | O(n) |
| Build a Huffman tree for k distinct characters (heap-based priority queue) | O(k log k) |
| Decompress b bits of Huffman code | O(b) |
| 0-1 knapsack by trying every combination of n items | O(2ⁿ) |
| 0-1 knapsack heuristic, fractional knapsack, activity selection (sorting dominates) | O(n log n) |
| Linear search with move-to-front | O(n) worst case |
| Fibonacci, plain recursion | O(2ⁿ) |
| Fibonacci, storing the two previous terms | O(n) time, O(1) space |
| Longest common substring, full matrix | O(NM) time, O(NM) space |
| Longest common substring, one row | O(NM) time, O(M) space |
| Longest common subsequence | O(NM) time |

## Questions

- **1.1** ADTs and data structures.

  **a)** Label each one an **ADT** (what it does) or a **data structure** (how it's stored).

  | Name | ADT or data structure |
  |---|---|
  | Stack | |
  | Linked list | |
  | Priority queue | |
  | Array | |
  | Dictionary | |
  | Hash table | |
  | Bag | |
  | Binary tree | |

  <!-- answer:1.1a table [ADT, Data structure]: ADT; Data structure; ADT; Data structure; ADT; Data structure; ADT; Data structure -->

  **b)** Which data structure is the usual way to build a priority queue?

  A. Linked list

  B. Heap

  C. Hash table

  D. Record

  <!-- answer:1.1b choice: B -->

  <details>
  <summary>Answer</summary>

  - **a)** ADTs: Stack, Priority queue, Dictionary, Bag. Data structures: Linked list, Array, Hash table, Binary tree. An ADT names operations; a data structure is a way of laying data out in memory.
  - **b)** **B.** A heap keeps the highest-priority item at the root, so peeking is O(1) and removing it is O(log n).

  </details>

- **1.2** Abstraction.

  **a)** A program uses a queue only through `enqueue` and `dequeue`. The queue is changed from a linked list to an array. What has to change in the program?

  A. Nothing: it only uses the ADT's operations

  B. Every call to `enqueue` and `dequeue`

  C. The program must now track the array's size

  <!-- answer:1.2a choice: A -->

  **b)** A list ADT is built on an array in one program and on a linked list in another. What does reading item i cost in each? Answer in Big-O.

  <!-- answer:1.2b blanks: Array => O(1); Linked list => O(n) -->

  <details>
  <summary>Answer</summary>

  - **a)** **A.** That's the point of abstraction: code that uses only the ADT's operations doesn't depend on how it's built.
  - **b)** Array: O(1), since the address of item i can be computed directly. Linked list: O(n), since you have to follow i pointers from the head.

  </details>

- **1.3** Huffman coding. A text has these character counts:

  | Character | Count |
  |---|---|
  | A | 7 |
  | B | 3 |
  | C | 2 |
  | D | 1 |

  **a)** How many bits long is each character's Huffman code?

  | Character | Code length in bits |
  |---|---|
  | A | |
  | B | |
  | C | |
  | D | |

  <!-- answer:1.3a table: 1; 2; 3; 3 -->

  **b)** How many bits does the whole encoded text take?

  <!-- answer:1.3b blanks: 22 -->

  **c)** How many bits would it take with a fixed-length code of 2 bits per character?

  <!-- answer:1.3c blanks: 26 -->

  **d)** How many bits would it take uncompressed, in 8-bit ASCII?

  <!-- answer:1.3d blanks: 104 -->

  <details>
  <summary>Answer</summary>

  - Join D (1) and C (2) into 3. Join that with B (3) into 6. Join that with A (7) into the root, 13.
  - **a)** A is one branch from the root: 1 bit. B is two down: 2 bits. C and D are three down: 3 bits each.
  - **b)** 7×1 + 3×2 + 2×3 + 1×3 = 22 bits.
  - **c)** 13 characters × 2 bits = 26 bits.
  - **d)** 13 characters × 8 bits = 104 bits.

  </details>

- **1.4** Greedy algorithms.

  **a)** Using coins worth 25, 10, 5, and 1, how many coins does the greedy algorithm use to make 41 cents?

  <!-- answer:1.4a blanks: 4 -->

  **b)** Using coins worth 1, 5, and 6, the greedy algorithm makes 10 cents as 6 + 1 + 1 + 1 + 1. What is the fewest coins that can make 10 cents?

  <!-- answer:1.4b blanks: 2 -->

  **c)** Which statement about greedy algorithms is true?

  A. They always find the best answer, but slowly.

  B. They take the best-looking choice at each step and never undo it, so they're fast but not always right.

  C. They try every possible answer and keep the best one.

  <!-- answer:1.4c choice: B -->

  <details>
  <summary>Answer</summary>

  - **a)** 25 + 10 + 5 + 1: 4 coins.
  - **b)** 5 + 5: 2 coins. Taking the 6 first leaves 4, which only 1s can make.
  - **c)** **B.** Option C describes brute force.

  </details>

- **1.5** Dynamic programming.

  **a)** What makes an algorithm dynamic programming?

  A. It picks the best-looking choice at each step.

  B. It splits the input in half and never combines the halves.

  C. It stores the answers to subproblems so each one is solved only once.

  <!-- answer:1.5a choice: C -->

  **b)** What is the length of the longest common subsequence of `BANANA` and `ATANA`?

  <!-- answer:1.5b blanks: 4 -->

  **c)** What is the Big-O of the LCS table method for strings of lengths n and m?

  <!-- answer:1.5c blanks: O(nm) | O(n*m) | O(mn) | O(m*n) -->

  **d)** The plain recursive Fibonacci function, with F(0) = 0 and F(1) = 1, is called to compute F(5). How many times is F(2) computed?

  <!-- answer:1.5d blanks: 3 -->

  <details>
  <summary>Answer</summary>

  - **a)** **C.** Option A is greedy.
  - **b)** 4, for example `AANA`. A length of 5 would have to be all of `ATANA`, but `BANANA` has no T.
  - **c)** O(nm): one cell per pair of positions, each filled in O(1).
  - **d)** 3. F(5) calls F(4) and F(3). F(4) calls F(3) and F(2). Each of the two F(3) calls makes one F(2) call, so F(2) is computed 1 + 2 = 3 times. The stored-terms version computes it once.

  </details>

- **1.6** Heuristics and hard problems.

  **a)** Which describes a heuristic?

  A. A way of storing subproblem answers

  B. An algorithm that's guaranteed to find the best answer

  C. A fast rule of thumb that usually finds a good answer, but not always the best

  <!-- answer:1.6a choice: C -->

  **b)** Which is true of NP-complete problems?

  A. They have been proven to have no efficient algorithm.

  B. No efficient algorithm is known, but none has been proven impossible.

  C. They can all be solved in O(n log n).

  <!-- answer:1.6b choice: B -->

  **c)** Someone finds a polynomial-time algorithm for one NP-complete problem. What follows?

  A. Every NP-complete problem can be solved efficiently.

  B. Only that one problem becomes efficient to solve.

  C. Nothing, since efficient means O(n) or faster.

  <!-- answer:1.6c choice: A -->

  <details>
  <summary>Answer</summary>

  - **a)** **C.** Option A is dynamic programming, and a heuristic gives up the guarantee in B.
  - **b)** **B.** Whether NP-complete problems have efficient algorithms is one of the big open questions in computer science.
  - **c)** **A.** NP-complete problems stand or fall together. And zyBooks counts any polynomial runtime as efficient, not only O(n).

  </details>

- **1.7** What makes an algorithm.

  **a)** Which characteristic does each description break?

  | Description | Characteristic it breaks |
  |---|---|
  | A loop that never stops for some inputs | |
  | A step that says "pick a good number" | |
  | Steps that only make sense as Python code and can't be stated any other way | |
  | A procedure that finishes but never reports a result | |

  <!-- answer:1.7a table [Unambiguity, Finiteness, Well-defined inputs, Well-defined outputs, Effectiveness, Feasibility, Language independence]: Finiteness; Unambiguity; Language independence; Well-defined outputs -->

  **b)** Which kind of algorithm does each description fit?

  | Description | Kind |
  |---|---|
  | Solves Sudoku by placing digits and undoing them when a rule breaks | |
  | Sorts by splitting the list in half, sorting each half, and merging | |
  | Tries every possible password until one works | |
  | Fills a table with the answers to smaller subproblems and reuses them | |
  | Always takes the largest coin that still fits | |

  <!-- answer:1.7b table [Brute force, Backtracking, Divide and conquer, Greedy, Dynamic programming, Randomized]: Backtracking; Divide and conquer; Brute force; Dynamic programming; Greedy -->

  <details>
  <summary>Answer</summary>

  - **a)** The endless loop breaks finiteness. "Pick a good number" can be read more than one way, so it breaks unambiguity. Steps tied to one programming language break language independence. No result breaks well-defined outputs.
  - **b)** Sudoku with undo is backtracking. Split, sort, and merge is divide and conquer (merge sort). Trying every password is brute force. A table of subproblem answers is dynamic programming. Largest coin first is greedy.

  </details>

- **1.8** Data types, data structures, and ADTs.

  **a)** Label each one.

  | Name | Kind |
  |---|---|
  | `bool` | |
  | Queue | |
  | Linked list | |
  | `float` | |
  | Map | |
  | Hash table | |

  <!-- answer:1.8a table [Data type, Data structure, ADT]: Data type; ADT; Data structure; Data type; ADT; Data structure -->

  **b)** A variable `direction` should only ever hold NORTH, EAST, SOUTH, or WEST. Which user-defined type fits?

  A. A record

  B. An enumeration

  C. An array

  <!-- answer:1.8b choice: B -->

  **c)** Which describes a record?

  A. A fixed group of named fields, which can have different types

  B. A list of values that must all have the same type

  C. A collection with no duplicates

  <!-- answer:1.8c choice: A -->

  <details>
  <summary>Answer</summary>

  - **a)** `bool` and `float` are data types. Queue and Map are ADTs: behavior only. Linked list and hash table are data structures: ways of storing data.
  - **b)** **B.** An enumeration limits a variable to a fixed set of named constants.
  - **c)** **A.** Option B describes an array, and C a set.

  </details>

- **1.9** Longest common substring, the zyBooks way. The first string `MARKET` labels the rows (indexes 0 to 5), and the second string `PARKED` labels the columns.

  **a)** What is the largest entry in the matrix?

  <!-- answer:1.9a blanks: 4 -->

  **b)** What is the longest common substring?

  <!-- answer:1.9b blanks: ARKE -->

  **c)** At which row index of `MARKET` is the largest entry?

  <!-- answer:1.9c blanks: 4 -->

  **d)** The space-saving version keeps one row of the matrix. What is its space complexity, for a first string of length N and a second of length M?

  A. O(1)

  B. O(M)

  C. O(NM)

  <!-- answer:1.9d choice: B -->

  <details>
  <summary>Answer</summary>

  - The matches that matter run along one diagonal: A at row 1 is 1, R at row 2 is 1 + 1 = 2, K at row 3 is 3, and E at row 4 is 4. Every other entry is 0, and the `T` row has no matches.
  - **a)** 4.
  - **b)** `ARKE`: the 4 characters of `MARKET` ending at the largest entry's row.
  - **c)** Row 4, the `E`. The largest entry's row is where the substring ends in the first string.
  - **d)** **B.** One row has M entries. The time is still O(NM), since every entry is still computed.

  </details>

- **1.10** Activity selection. Use the zyBooks greedy method on these activities:

  | Activity | Start | Finish |
  |---|---|---|
  | U | 8 | 16 |
  | Q | 10 | 12 |
  | T | 13 | 15 |
  | P | 9 | 11 |
  | S | 12 | 14 |
  | R | 11 | 13 |

  **a)** How many activities does the algorithm choose?

  <!-- answer:1.10a blanks: 3 -->

  **b)** Which activities does it choose, in the order it chooses them?

  | Order | Activity |
  |---|---|
  | First | |
  | Second | |
  | Third | |

  <!-- answer:1.10b table: P; R; T -->

  **c)** What does the algorithm sort the activities by?

  A. Start time, earliest first

  B. Length, shortest first

  C. Finish time, earliest first

  <!-- answer:1.10c choice: C -->

  <details>
  <summary>Answer</summary>

  - Sorted by finish time: P (11), Q (12), R (13), S (14), T (15), U (16).
  - P is chosen first. Q starts at 10, before P finishes at 11: skip. R starts at 11, when P finishes: choose. S starts at 12, before R finishes at 13: skip. T starts at 13, when R finishes: choose. U starts at 8: skip.
  - **a)** 3.
  - **b)** P, R, T.
  - **c)** **C.** Taking the activity that frees up the earliest leaves the most time for the rest.

  </details>

- **1.11** Knapsacks. The weight limit is 10 lb. The items are 8 lb worth $40, 5 lb worth $30, 4 lb worth $26, and 4 lb worth $10.

  **a)** zyBooks' 0-1 knapsack heuristic takes the most valuable items first. What total value does it reach?

  <!-- answer:1.11a blanks: 40 | $40 -->

  **b)** What is the best total value possible if each item is taken whole or not at all?

  <!-- answer:1.11b blanks: 56 | $56 -->

  **c)** What total value does the greedy fractional knapsack algorithm reach?

  <!-- answer:1.11c blanks: 61 | $61 -->

  <details>
  <summary>Answer</summary>

  - **a)** $40. The 8 lb item is the most valuable, so it goes in first, leaving 2 lb. No other item weighs 2 lb or less.
  - **b)** $56: the 5 lb and the 4 lb $26 items, 9 lb in all. So the heuristic is not optimal here.
  - **c)** $61. By value per lb: 4 lb $26 (6.5), 5 lb $30 (6), 8 lb $40 (5), 4 lb $10 (2.5). Take the 4 lb $26 item (6 lb left), then the 5 lb item (1 lb left), then 1/8 of the 8 lb item, worth $5. $26 + $30 + $5 = $61.

  </details>

- **1.12** Move-to-front. A list starts as `12, 5, 30, 7, 19, 2`. Each search is a linear search from the front, and the found item then moves to the front.

  **a)** How many comparisons does each search make?

  | Search | Comparisons |
  |---|---|
  | 7 | |
  | 7 | |
  | 2 | |
  | 7 | |

  <!-- answer:1.12a table: 4; 1; 6; 2 -->

  **b)** What is the first item in the list after all four searches?

  <!-- answer:1.12b blanks: 7 -->

  <details>
  <summary>Answer</summary>

  - **a)** 7 is fourth: 4 comparisons, and the list becomes `7, 12, 5, 30, 19, 2`. 7 is now first: 1 comparison. 2 is last: 6 comparisons, and the list becomes `2, 7, 12, 5, 30, 19`. 7 is second: 2 comparisons.
  - **b)** 7. The last search moves it back to the front: `7, 2, 12, 5, 30, 19`.

  </details>
