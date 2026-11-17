# 1. Introduction to data structures and algorithms

This chapter sets up the words the rest of the course uses: data structures, algorithms, abstract data types, and efficiency. It also introduces three ways of designing algorithms: compression with Huffman codes, greedy choices, and dynamic programming.

## Data structures and algorithms

A **data structure** is a way of organizing data in memory so that some operations are fast. The basic ones in this course:

| Data structure | How it's organized |
|---|---|
| Record | A fixed group of named fields, like a student's name, ID, and GPA |
| Array | Items side by side in memory, reached by index in O(1) |
| Linked list | Nodes that each hold an item and a pointer to the next node |
| Binary tree | Nodes that each have up to two children, a left and a right |
| Hash table | An array of buckets; a hash function maps each key to a bucket |
| Heap | A tree where each parent is larger (max-heap) or smaller (min-heap) than its children |
| Graph | Vertices joined by edges |

An **algorithm** is a step-by-step procedure that solves a problem: searching, sorting, finding the shortest route. The two go together. An algorithm is written for a data structure, and the structure decides how fast the algorithm can be. Binary search is O(log n) on an array because it can jump to the middle item in one step. On a linked list, getting to the middle takes O(n) steps, so the same idea is no faster than reading every item.

### Efficiency

An algorithm's efficiency is how its running time (or memory) grows as the input grows. It's written in Big-O, which keeps only the term that dominates for large inputs. The [Big-O cheat sheet](big-o.md) lists the growth rates and the rules for working one out.

Some problems have no known efficient algorithm at all. **NP-complete** problems, like finding the shortest route that visits every city once, have no known algorithm that runs in polynomial time (O(n²), O(n³), and so on). Nobody has proven that none exists, either. For these, people settle for a heuristic: a fast answer that's good, but not guaranteed to be the best.

## Abstract data types (ADTs)

An **abstract data type** describes what a type of data does (its operations), not how it's stored. A list ADT promises "append, remove, search, and keep items in order". It says nothing about arrays or nodes. A data structure is one way to build it.

| ADT | What it does | Usually built on |
|---|---|---|
| List | Items in order; insert, remove, search | Array or linked list |
| Dynamic array | A list with O(1) access by index, that grows as needed | Array |
| Stack | Last in, first out: push and pop at the top | Linked list or array |
| Queue | First in, first out: enqueue at the back, dequeue at the front | Linked list or array |
| Deque | Push and pop at both ends | Linked list or array |
| Bag | Items in no order, duplicates allowed | Array or linked list |
| Set | Distinct items in no order; is x in it? | Hash table or binary search tree |
| Priority queue | Remove the highest-priority item first | Heap |
| Dictionary (map) | Look up a value by its key | Hash table or binary search tree |

Separating the ADT from its data structure is **abstraction**. Code that uses a stack only calls push and pop, so the stack can switch from a linked list to an array without that code changing. It's also why one ADT can have different costs: a list built on an array reads item i in O(1), and one built on a linked list takes O(n).

## Huffman compression

Text is normally stored with a fixed number of bits per character. Huffman coding gives frequent characters short codes and rare characters long ones, so the whole text takes fewer bits.

How to build the codes:

1. Count how often each character appears.
2. Make a leaf node for each character, holding its count.
3. Take the two nodes with the lowest counts, and join them under a new parent whose count is their sum.
4. Repeat step 3 until one node is left. It's the root of the Huffman tree.
5. Read each character's code from the path from the root to its leaf: 0 for each left branch, 1 for each right branch.

A worked example on the text `MISSISSIPPI` (11 characters):

| Character | Count |
|---|---|
| I | 4 |
| S | 4 |
| P | 2 |
| M | 1 |

- Join M (1) and P (2) into a node of 3.
- The lowest two are now that node (3) and one of I or S (4). Join them into 7.
- Join the last 4 with 7 into the root, 11.

One resulting set of codes: S = `0`, I = `11`, P = `101`, M = `100`. The encoded text takes 4×1 + 4×2 + 2×3 + 1×3 = 21 bits. With four characters, a fixed-length code needs 2 bits each, or 22 bits.

Two things to know:

- **No code is the start of another.** Every character sits at a leaf, so the decoder reads bits until it hits a leaf, writes that character, and starts again from the root. No separators are needed.
- **Ties can give different trees.** When two nodes have the same count, either order is fine. The codes change, but the total number of bits doesn't.

## Heuristics

A **heuristic** is a rule of thumb: it finds a good answer quickly, without promising the best one. Heuristics are used when the best answer would take too long to find, as with NP-complete problems.

Example: a knapsack holds 10 kg, and you want the most valuable load. Trying every combination of items is O(2ⁿ). A heuristic is "take the items with the best value per kg first, while they fit". It's fast, and usually close, but it can miss the best load.

A **self-adjusting heuristic** changes the data structure as it's used, betting that what was used recently will be used again. In a list, moving each found item to the front makes repeated searches for it fast.

## Greedy algorithms

A **greedy algorithm** builds an answer one step at a time, always taking the choice that looks best right now, and never going back.

Example: make 63 cents with as few coins as possible, using 25, 10, 5, and 1. Greedy takes the largest coin that fits each time: 25, 25, 10, 1, 1, 1. That's 6 coins, and it's the best possible with US coins.

Greedy is fast, but it's only correct for some problems. With coins 1, 3, and 4, making 6 greedily gives 4 + 1 + 1 (3 coins), but 3 + 3 (2 coins) is better. The greedy choice of 4 couldn't be undone. Problems where greedy is always right include Huffman coding, the fractional knapsack (where you can take part of an item), activity selection, and Dijkstra's shortest paths.

## Dynamic programming

**Dynamic programming** solves a problem by splitting it into smaller subproblems, solving each one only once, and storing the answers in a table so they can be reused. It works when the same subproblems come up again and again.

Fibonacci shows why it matters. Plain recursion, F(n) = F(n − 1) + F(n − 2), computes F(n − 2) twice, F(n − 3) three times, and so on: O(2ⁿ) calls. Storing each F(i) the first time it's found makes it O(n).

### Longest common subsequence

A **subsequence** keeps characters in their order but can skip some: `ACE` is a subsequence of `ABCDE`. The longest common subsequence (LCS) of two strings is the longest one that's a subsequence of both.

Dynamic programming fills a table where the cell for row i and column j holds the LCS length of the first i characters of one string and the first j of the other:

- If those two characters match, the cell is the one diagonally up-left, plus 1.
- If not, it's the larger of the cell above and the cell to the left.

The bottom-right cell is the answer. Filling an n × m table is O(nm), where trying every subsequence would be exponential.

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

  A. Every call to `enqueue` and `dequeue`

  B. Nothing: it only uses the ADT's operations

  C. The program must now track the array's size

  <!-- answer:1.2a choice: B -->

  **b)** A list ADT is built on an array in one program and on a linked list in another. What does reading item i cost in each? Answer in Big-O.

  <!-- answer:1.2b blanks: Array => O(1); Linked list => O(n) -->

  <details>
  <summary>Answer</summary>

  - **a)** **B.** That's the point of abstraction: code that uses only the ADT's operations doesn't depend on how it's built.
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

  <details>
  <summary>Answer</summary>

  - Join D (1) and C (2) into 3. Join that with B (3) into 6. Join that with A (7) into the root, 13.
  - **a)** A is one branch from the root: 1 bit. B is two down: 2 bits. C and D are three down: 3 bits each.
  - **b)** 7×1 + 3×2 + 2×3 + 1×3 = 22 bits.
  - **c)** 13 characters × 2 bits = 26 bits.

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

  B. It stores the answers to subproblems so each one is solved only once.

  C. It splits the input in half and never combines the halves.

  <!-- answer:1.5a choice: B -->

  **b)** What is the length of the longest common subsequence of `BANANA` and `ATANA`?

  <!-- answer:1.5b blanks: 4 -->

  **c)** What is the Big-O of the LCS table method for strings of lengths n and m?

  <!-- answer:1.5c blanks: O(nm) | O(n*m) | O(mn) | O(m*n) -->

  <details>
  <summary>Answer</summary>

  - **a)** **B.** Option A is greedy.
  - **b)** 4, for example `AANA`. A length of 5 would have to be all of `ATANA`, but `BANANA` has no T.
  - **c)** O(nm): one cell per pair of positions, each filled in O(1).

  </details>

- **1.6** Heuristics and hard problems.

  **a)** Which describes a heuristic?

  A. An algorithm that's guaranteed to find the best answer

  B. A fast rule of thumb that usually finds a good answer, but not always the best

  C. A way of storing subproblem answers

  <!-- answer:1.6a choice: B -->

  **b)** Which is true of NP-complete problems?

  A. They have been proven to have no efficient algorithm.

  B. No efficient algorithm is known, but none has been proven impossible.

  C. They can all be solved in O(n log n).

  <!-- answer:1.6b choice: B -->

  <details>
  <summary>Answer</summary>

  - **a)** **B.**
  - **b)** **B.** Whether NP-complete problems have efficient algorithms is one of the big open questions in computer science.

  </details>
