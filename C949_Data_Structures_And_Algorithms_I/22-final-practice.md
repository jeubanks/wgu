# Final practice

40 new questions that mix every chapter, for when you've worked through the guide. They don't repeat any question or example from the chapters, so they show whether you can apply each idea on your own.

- Work each one on paper first, then check it.
- Each question says which convention it uses, like the heap's root index or the order neighbors are taken in.
- The folded **Answer** under each question explains every part.
- Your answers and **Done** marks are saved in this browser, and the contents page shows your progress.

For unlimited practice with new numbers every time, try the [practice quiz](practice-quiz.md).

## Questions

- **22.1** Algorithm basics.

  **a)** zyBooks calls an algorithm efficient when its runtime grows no faster than a polynomial. Is each runtime efficient?

  | Runtime | Efficient? |
  |---|---|
  | O(n⁵) | |
  | O(2ⁿ) | |
  | O(n log n) | |
  | O(3ⁿ) | |

  <!-- answer:22.1a table [Yes, No]: Yes; No; Yes; No -->

  **b)** Divide and conquer and dynamic programming both split a problem into subproblems. What sets dynamic programming apart?

  A. Its subproblems overlap, so it stores their answers and reuses them.

  B. It always splits the input exactly in half.

  C. It takes the best-looking choice at each step.

  <!-- answer:22.1b choice: A -->

  **c)** Which of these is not one of the three parts of a computational problem?

  A. The input

  B. The question

  C. The output

  D. The programming language

  <!-- answer:22.1c choice: D -->

  <details>
  <summary>Answer</summary>

  - **a)** O(n⁵) and O(n log n) are no worse than a polynomial, so they're efficient. O(2ⁿ) and O(3ⁿ) are exponential, so they aren't.
  - **b)** **A.** Merge sort's halves never share work, so there's nothing to store. Option C describes greedy algorithms.
  - **c)** **D.** A computational problem is its input, its question, and the form of its output. An algorithm for it can be written in any language.

  </details>

- **22.2** Tree terms and shapes. Use this tree:

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

  <!-- answer:22.2a table: 3; 2; 2; 5 -->

  **b)** Is the tree each shape?

  | Shape | Yes or no |
  |---|---|
  | Full | |
  | Complete | |
  | Perfect | |

  <!-- answer:22.2b table [Yes, No]: No; Yes; No -->

  <details>
  <summary>Answer</summary>

  - **a)** The internal nodes are K, E, and S: **3**. The deepest nodes (B, G, P) are 2 edges below K: height **2**, and P's depth is **2**. The tree has 6 nodes, so it has 6 − 1 = **5** edges.
  - **b)** S has one child, so the tree isn't **full**. Level 1 is full, and the last level's nodes (B, G, P) are as far left as possible, so it **is complete**. It isn't full, so it isn't **perfect**.

  </details>

- **22.3** Graph terms. This adjacency matrix stores a graph. The row is the from-vertex and the column is the to-vertex, so a 1 in row A, column B means an edge A → B.

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
  | What is C's degree, counting incoming and outgoing edges (zyBooks' definition)? | |
  | Is the graph cyclic? (Yes or No) | |

  <!-- answer:22.3a-d table: 6; 2; 4; Yes -->

  **e)** The matrix isn't symmetric. What does that tell you?

  A. The graph is directed: some edges go one way only, like A → B with no B → A

  B. The graph is weighted, so some entries should be larger than 1

  C. The graph is disconnected, because E's row is all 0s

  <!-- answer:22.3e choice: A -->

  <details>
  <summary>Answer</summary>

  - **a)** The edges are A → B, A → D, B → C, C → A, C → E, and D → C: **6**, one for each 1 in the matrix.
    - C's column has 1s in rows B and D: **2** incoming edges.
    - C's row has 1s in columns A and E, so 2 outgoing edges. 2 + 2 = **4**.
    - A → B → C → A starts and ends at A, so the graph is cyclic: **Yes**.
  - **e)** **A.** An undirected edge would put a 1 in both (X, Y) and (Y, X). Row A, column B is 1, but row B, column A is 0, so that edge goes one way. A 0/1 matrix says nothing about weights, and E having no outgoing edges doesn't make the matrix lopsided by itself.

  </details>

- **22.4** Linear search. The list is not sorted:

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

  <!-- answer:22.4a-c table: 5; 3; 7 -->

  **d)** Searching for 7, which index does linear search return?

  <!-- answer:22.4d blanks: 2 -->

  <details>
  <summary>Answer</summary>

  - **25:** it checks 18, 42, 7, 63, then finds 25 at index 4: **5** comparisons.
  - **7:** it finds 7 at index 2 on the third check, so **3**. It stops there and never sees the second 7.
  - **50:** it isn't in the list, so linear search checks all **7** items. A missing key is the worst case.
  - **d)** **2**, the index of the first 7.

  </details>

- **22.5** Pick the ADT that fits each job best.

  | Job | ADT |
  |---|---|
  | Badge numbers of people inside a building, each at most once, in no order | |
  | Looking up a country's capital by the country's name | |
  | Raffle tickets in a jar, where one person can hold several identical tickets | |
  | Support tickets, where the most urgent one is handled next | |
  | A recipe's steps, kept in the order they were written | |

  <!-- answer:22.5a-e table [List, Bag, Set, Priority queue, Dictionary]: Set; Dictionary; Bag; Priority queue; List -->

  <details>
  <summary>Answer</summary>

  - Badge numbers are distinct and unordered: a **set**.
  - A capital is found by its country: a **dictionary**, which maps keys to values.
  - Tickets can repeat and have no order: a **bag**.
  - The most urgent ticket comes out first, whatever order they arrived in: a **priority queue**.
  - Steps keep the order they were added in: a **list**.

  </details>

- **22.6** Rebuilding a BST. A BST's preorder traversal is 58, 24, 13, 37, 30, 81, 66, 72, 92.

  **a)** What is its postorder traversal? Separate the keys with commas.

  <!-- answer:22.6a blanks: 13, 30, 37, 24, 72, 66, 92, 81, 58 | 13,30,37,24,72,66,92,81,58 -->

  **b)** What is the tree's height?

  <!-- answer:22.6b blanks: 3 -->

  **c)** How many leaves does the tree have?

  <!-- answer:22.6c blanks: 4 -->

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

- **22.7** Breadth-first search. Use this undirected graph. Take neighbors in alphabetical order. Separate vertices with commas.

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

  <!-- answer:22.7a blanks: K, G, J, F, H, L, M | K,G,J,F,H,L,M -->

  **b)** What is the distance from K to M, in edges?

  <!-- answer:22.7b blanks: 4 -->

  **c)** What is in the queue, front to back, right after G is visited and its new neighbors are enqueued?

  <!-- answer:22.7c blanks: J, F, H | J,F,H -->

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

- **22.8** Binary search. The list is sorted. Use `mid = (low + high) // 2`.

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

  <!-- answer:22.8a blanks: 34, 52, 68, 60 | 34,52,68,60 -->

  **b)** What index does the search return?

  <!-- answer:22.8b blanks: 10 -->

  **c)** At most how many comparisons does binary search need for a sorted list of 2,000 items?

  <!-- answer:22.8c blanks: 11 -->

  <details>
  <summary>Answer</summary>

  - **a)** low 0, high 12: mid 6, 34. 60 > 34, so low = 7. mid (7 + 12) // 2 = 9, 52. 60 > 52, so low = 10. mid (10 + 12) // 2 = 11, 68. 60 < 68, so high = 10. mid (10 + 10) // 2 = 10, 60. Found. **34, 52, 68, 60.**
  - **b)** **10**.
  - **c)** ⌊log₂ 2000⌋ + 1 = 10 + 1 = **11**, since 2¹⁰ = 1,024 ≤ 2,000 < 2,048 = 2¹¹.

  </details>

- **22.9** Huffman coding. A text has these character counts:

  | Character | Count |
  |---|---|
  | A | 7 |
  | B | 6 |
  | C | 5 |
  | D | 2 |
  | E | 1 |

  Build the tree the zyBooks way. The first node removed becomes the left child, and the second the right child. A left branch adds 0 to a code, and a right branch adds 1.

  **a)** What is each character's code?

  | Character | Code |
  |---|---|
  | A | |
  | B | |
  | C | |
  | D | |
  | E | |

  <!-- answer:22.9a table: 11; 10; 01; 001; 000 -->

  **b)** How many bits does the whole encoded text take?

  <!-- answer:22.9b blanks: 45 -->

  **c)** Decode the bits `1011001`.

  <!-- answer:22.9c blanks: BAD -->

  <details>
  <summary>Answer</summary>

  - Remove E (1), then D (2). Join them into 3: E on the left, D on the right.
  - The queue holds 3, C (5), B (6), and A (7). Remove 3, then C. Join them into 8: the 3 node on the left, C on the right.
  - The queue holds B (6), A (7), and 8. Remove B, then A. Join them into 13: B on the left, A on the right.
  - Remove 8, then 13. Join them into the root, 21: 8 on the left, 13 on the right.
  - **a)** A = `11`, B = `10`, C = `01`, D = `001`, E = `000`.
  - **b)** 7×2 + 6×2 + 5×2 + 2×3 + 1×3 = 45 bits.
  - **c)** `10` is B, `11` is A, and `001` is D: **BAD**.

  </details>

- **22.10** Successors and removal. Use this BST. For a node with two children, remove uses the successor, as zyBooks does.

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

  <!-- answer:22.10a blanks: 49 -->

  **b)** Remove 40. Which key replaces it at the root?

  <!-- answer:22.10b blanks: 47 -->

  **c)** What is the preorder traversal after removing 40? Separate the keys with commas.

  <!-- answer:22.10c blanks: 47, 18, 9, 27, 65, 52, 49, 58, 80 | 47,18,9,27,65,52,49,58,80 -->

  <details>
  <summary>Answer</summary>

  - **a)** 52 has a left subtree. Left once to 47, then right as far as possible, to **49**.
  - **b)** 40 has two children. Its successor: right once to 65, then left as far as possible: 52, then 47. 47 has no left child, so the successor is **47**. 47 is copied into the root.
  - **c)** The old 47 node has one child, 49, so 49 moves up to become 52's left child: **47, 18, 9, 27, 65, 52, 49, 58, 80**.

  </details>

- **22.11** Depth-first search on a directed graph. Take each vertex's outgoing edges in alphabetical order. Separate vertices with commas.

  <!-- figure
  nodes: P 0 0.6, Q 1.3 0, S 1.3 1.2, R 2.6 0, T 2.6 1.2
  edges: P>Q, P>S, Q>R, Q>T, S>Q, S>T, T>R
  -->
  ```text
  P → Q      Q → R      S → Q      T → R
  P → S      Q → T      S → T
  ```
  <!-- /figure -->

  **a)** Run zyBooks' stack-based DFS from P: pop a vertex, and if it's new, visit it and push all its neighbors in list order. What is the visit order?

  <!-- answer:22.11a blanks: P, S, T, R, Q | P,S,T,R,Q -->

  **b)** How many pops happen in all, counting the ones that are skipped, until the stack is empty?

  <!-- answer:22.11b blanks: 8 -->

  **c)** What is the visit order of the recursive DFS from P?

  <!-- answer:22.11c blanks: P, Q, R, T, S | P,Q,R,T,S -->

  <details>
  <summary>Answer</summary>

  - **a)** The stack's top is on the right.

    | Pop | Visited? | Action | Stack afterward |
    |---|---|---|---|
    | P | new | visit P, push Q, S | Q, S |
    | S | new | visit S, push Q, T | Q, Q, T |
    | T | new | visit T, push R | Q, Q, R |
    | R | new | visit R | Q, Q |
    | Q | new | visit Q, push R, T | Q, R, T |
    | T | yes | skip | Q, R |
    | R | yes | skip | Q |
    | Q | yes | skip | empty |

    **P, S, T, R, Q**.

  - **b)** Count the rows: **8** pops, 5 visits and 3 skips. Every push gets popped once: 1 + 2 + 2 + 1 + 0 + 2 = 8 pushes.
  - **c)** P's first neighbor is Q. Q's first is R, which has no outgoing edges. Back at Q, the next is T, whose only neighbor R is visited. Back at P, the next is S, and both of S's neighbors are visited. **P, Q, R, T, S**.

  </details>

- **22.12** An inner loop that starts at i.

  ```python
  count = 0
  for i in range(n):
      for j in range(i, n):
          count += 1
  ```

  **a)** What is `count` at the end when n = 6?

  <!-- answer:22.12a blanks: 21 -->

  **b)** What is the Big-O?

  <!-- answer:22.12b blanks: [O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ)] => O(n²) -->

  <details>
  <summary>Answer</summary>

  - **a)** For i = 0, 1, 2, 3, 4, 5 the inner loop runs 6, 5, 4, 3, 2, 1 times: 6 + 5 + 4 + 3 + 2 + 1 = **21**.
  - **b)** **O(n²).** The total is n + (n − 1) + ... + 1 = n(n + 1) / 2. The inner loop shrinks as i grows, but that only halves the total: it's about n²/2, and the ½ drops. Check by doubling: n = 12 gives 78 and n = 24 gives 300, about 4 times as many.

  </details>

- **22.13** Fractional knapsack. The weight limit is 12 lb. Use the greedy fractional knapsack algorithm on these items:

  | Item | Weight | Value |
  |---|---|---|
  | A | 5 lb | $40 |
  | B | 6 lb | $30 |
  | C | 4 lb | $36 |
  | D | 3 lb | $6 |

  **a)** Which item does the algorithm take first?

  <!-- answer:22.13a blanks: [A, B, C, D] => C -->

  **b)** The last item it takes is only partly taken. What fraction of it is taken?

  <!-- answer:22.13b blanks: 0.5 | .5 | 1/2 -->

  **c)** What is the total value of the load?

  <!-- answer:22.13c blanks: 91 | $91 -->

  <details>
  <summary>Answer</summary>

  - By value per lb: C ($9), A ($8), B ($5), D ($2).
  - **a)** **C**, the highest value per lb. It leaves 8 lb.
  - **b)** A fits whole, leaving 3 lb. B weighs 6 lb, so 3/6 = **0.5** of it is taken, worth $15.
  - **c)** $36 + $40 + $15 = **$91**. D is never reached.

  </details>

- **22.14** Tries. A zyBooks trie, with a terminal node for each string, holds `ten`, `tent`, `tea`, `to`, and `top`. Do the parts in order, each on the result of the one before.

  **a)** Counting terminal nodes, how many nodes are below the root?

  <!-- answer:22.14a blanks: 12 -->

  **b)** Insert `team`. How many new nodes are made?

  <!-- answer:22.14b blanks: 2 -->

  **c)** Then remove `top`. How many nodes are removed?

  <!-- answer:22.14c blanks: 2 -->

  **d)** After those steps, which search finds its string?

  A. `te`

  B. `to`

  C. `top`

  <!-- answer:22.14d choice: B -->

  <details>
  <summary>Answer</summary>

  - **a)** Character nodes: t; e and o under t; n and a under e; t under n; p under o. That's 7. Each of the 5 strings adds one terminal node, under n, t, a, o, and p. 7 + 5 = **12**.
  - **b)** t, e, and a already exist. a has no `m` child, so m is made, then a terminal node under it: **2**.
  - **c)** `top`'s terminal node, under p, is removed. Then p has 0 children, so it's removed. o still has its terminal node for `to`, so it stays: **2**.
  - **d)** **B.** o still has a terminal child. e never had one, so `te` was never in the trie, and `top` was just removed.

  </details>

- **22.15** Dijkstra's algorithm. Run it on this directed graph, starting at A. If two vertices ever tie for the smallest distance, take the one that comes first alphabetically.

  <!-- figure
  nodes: A 0 0.7, B 1.4 0, C 1.4 1.4, D 2.8 0, E 2.8 1.4, F 4.2 0.7
  edges: A>B 6, A>C 2, C>B 3, C>D 7 @0.28, C>E 9, B>D 1, B>E 5 @0.28, D>E 2, D>F 6, E>F 1
  -->
  ```text
  A → B  6      C → B  3      B → D  1      D → E  2
  A → C  2      C → D  7      B → E  5      D → F  6
                C → E  9                    E → F  1
  ```
  <!-- /figure -->

  **a)** What is each vertex's final distance?

  <!-- answer:22.15a blanks: B => 5; C => 2; D => 6; E => 8; F => 9 -->

  **b)** What is the shortest path from A to F? Separate the vertices with commas.

  <!-- answer:22.15b blanks: A, C, B, D, E, F | A,C,B,D,E,F -->

  **c)** How many times does E's distance change during the run, counting the first change from ∞?

  <!-- answer:22.15c blanks: 3 -->

  **d)** What is the Big-O of zyBooks' version, which finds the next vertex by scanning an unsorted list?

  <!-- answer:22.15d blanks: [O(V + E), O(V²), O(V·E), O(V³)] => O(V²) -->

  <details>
  <summary>Answer</summary>

  | Remove | Updates | B | C | D | E | F |
  |---|---|---|---|---|---|---|
  | A (0) | B = 6, C = 2 | 6 | 2 | ∞ | ∞ | ∞ |
  | C (2) | B: 2 + 3 = 5 < 6. D = 9. E = 11 | 5 | 2 | 9 | 11 | ∞ |
  | B (5) | D: 5 + 1 = 6 < 9. E: 5 + 5 = 10 < 11 | 5 | 2 | 6 | 10 | ∞ |
  | D (6) | E: 6 + 2 = 8 < 10. F = 12 | 5 | 2 | 6 | 8 | 12 |
  | E (8) | F: 8 + 1 = 9 < 12 | 5 | 2 | 6 | 8 | 9 |
  | F (9) | (no outgoing edges) | 5 | 2 | 6 | 8 | 9 |

  - **a)** **B 5, C 2, D 6, E 8, F 9.**
  - **b)** Follow predecessors back from F: E, D, B, C, A. Reversed: **A, C, B, D, E, F**, length 2 + 3 + 1 + 2 + 1 = 9.
  - **c)** E goes ∞ → 11 → 10 → 8: **3** changes.
  - **d)** **O(V²).** Each of the V removals scans up to V unvisited vertices.

  </details>

- **22.16** A doubling loop with a growing inner loop.

  ```python
  count = 0
  i = 1
  while i < n:
      for j in range(i):
          count += 1
      i = i * 2
  ```

  **a)** What is `count` at the end when n = 32?

  <!-- answer:22.16a blanks: 31 -->

  **b)** What is the Big-O?

  <!-- answer:22.16b blanks: [O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ)] => O(n) -->

  <details>
  <summary>Answer</summary>

  - **a)** i takes the values 1, 2, 4, 8, and 16 (32 isn't less than 32). The inner loop runs that many times each: 1 + 2 + 4 + 8 + 16 = **31**.
  - **b)** **O(n).** The outer loop runs log₂ n times, but the inner loops aren't all n long. They add up to 1 + 2 + 4 + ... which stays under n. Multiplying log n × n would overestimate. Doubling n doubles the count (63 for n = 64, 127 for n = 128).

  </details>

- **22.17** Dynamic programming. Use the strings `TRACE` and `CRATE`.

  **a)** What is the length of their longest common substring?

  <!-- answer:22.17a blanks: 2 -->

  **b)** What is the length of their longest common subsequence?

  <!-- answer:22.17b blanks: 3 -->

  **c)** The plain recursive Fibonacci function, with F(0) = 0 and F(1) = 1, is called to compute F(7). How many calls are made in all, counting the first one?

  <!-- answer:22.17c blanks: 41 -->

  **d)** What is the Big-O runtime of the Fibonacci version that keeps only the two previous terms?

  <!-- answer:22.17d blanks: [O(1), O(n), O(n^2), O(2^n)] => O(n) -->

  <details>
  <summary>Answer</summary>

  - **a)** 2: `RA` appears in both. No run of 3 does: `RAC` and `ACE` aren't in `CRATE`, and `RAT` isn't in `TRACE`.
  - **b)** 3: `RAE` keeps its order in both strings. The 4-letter subsequences of `CRATE` are `CRAT`, `CRAE`, `CRTE`, `CATE`, and `RATE`. In `TRACE`, only E comes after the C, so the first four fail, and the T comes before the R, so `RATE` fails too.
  - **c)** 41. Let calls(n) be the calls to compute F(n): calls(0) = calls(1) = 1, and calls(n) = calls(n − 1) + calls(n − 2) + 1. That gives 1, 1, 3, 5, 9, 15, 25, 41.
  - **d)** O(n). The loop computes each term once.

  </details>

- **22.18** AVL insert. Keys 35, 20, 60, 10, 50, 70, 55 were inserted into an empty AVL tree, which gave this tree with no rotations:

  <!-- figure
  tree: 35{20{10}, 60{50{, 55}, 70}}
  -->
  ```text
            35
          /    \
        20      60
       /       /  \
     10      50    70
               \
                55
  ```
  <!-- /figure -->

  **a)** Give each node's balance factor (left height − right height, with a null subtree at height −1).

  | Node | Balance factor |
  |---|---|
  | 35 | |
  | 60 | |
  | 50 | |

  <!-- answer:22.18a table: -1 | −1; 1 | +1; -1 | −1 -->

  **b)** Now insert 52. Walking up from 52's parent, which node is the first with a balance factor of +2 or −2?

  <!-- answer:22.18b blanks: 50 -->

  **c)** Which case fixes that node?

  <!-- answer:22.18c blanks: [Left-left, Left-right, Right-right, Right-left] => Right-left -->

  **d)** What is the tree's preorder traversal after the fix? Separate the keys with commas.

  <!-- answer:22.18d blanks: 35, 20, 10, 60, 52, 50, 55, 70 | 35,20,10,60,52,50,55,70 -->

  <details>
  <summary>Answer</summary>

  - **a)** 35: left height 1, right height 2: **−1**. 60: left height 1 (50, 55), right height 0: **+1**. 50: left −1, right 0: **−1**.
  - **b)** 52 > 35, < 60, > 50, < 55, so 52 becomes 55's left child. 55 is at +1. 50 has left height −1 and right height 1: **−2**. The first unbalanced node is **50**.
  - **c)** 50 is at −2, and its right child 55 is at +1. Opposite signs make a zigzag: **right-left**. Rotate right at 55, then left at 50.
  - **d)** 52 moves up into 50's place, with 50 on its left and 55 on its right. 60 is now at +1 and 35 at −1, so nothing else rotates: **35, 20, 10, 60, 52, 50, 55, 70**.

  </details>

- **22.19** Bellman-Ford. Run it on this directed graph, starting at S. Each pass processes the vertices in the order C, A, B, S.

  <!-- figure
  nodes: S 0 0.6, A 1.4 0, B 1.4 1.2, C 2.8 0.6
  edges: S>A 5, S>B 8, B>A -4, A>C 2, B>C 6
  -->
  ```text
  S → A   5      B → A  −4      A → C   2
  S → B   8                     B → C   6
  ```
  <!-- /figure -->

  **a)** What are the distances after the **second** pass?

  <!-- answer:22.19a blanks: A => 4; B => 8; C => 7 -->

  **b)** What is C's final distance?

  <!-- answer:22.19b blanks: 6 -->

  **c)** Now add one more edge, C → B with weight −5, and run the algorithm again. What does it return?

  A. True, with new shorter distances

  B. False, because a negative edge weight cycle can be reached

  C. False, because the graph has more than one negative edge

  <!-- answer:22.19c choice: B -->

  <details>
  <summary>Answer</summary>

  - **a)** Pass 1: C, A, and B are still ∞, so nothing relaxes from them. Then S sets A = 5 and B = 8. Pass 2: C is still ∞. A sets C = 5 + 2 = 7. B sets A = 8 − 4 = 4 (better than 5), and B → C gives 14, no better than 7. S changes nothing. **A 4, B 8, C 7.**
  - **b)** Pass 3 (the last of V − 1 = 3): A → C gives 4 + 2 = **6** < 7. The check pass finds nothing to improve, so the algorithm returns True. The path is S → B → A → C.
  - **c)** **B.** The cycle B → A → C → B has length −4 + 2 − 5 = −7. After the 3 passes, the check pass still finds an edge that shortens a distance, so the algorithm returns False. Several negative edges are fine on their own. Only a negative cycle makes it return False.

  </details>

- **22.20** Recursion with a loop in each call.

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

  <!-- answer:22.20a blanks: 15 -->

  **b)** How many calls to `r` happen in total for `r(5)`, counting the first one?

  <!-- answer:22.20b blanks: 6 -->

  **c)** What is the Big-O of `r(n)`?

  <!-- answer:22.20c blanks: [O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ)] => O(n²) -->

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

  <!-- answer:22.20d blanks: [O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ)] => O(n) -->

  <details>
  <summary>Answer</summary>

  - **a)** Each call adds its own n: 5 + 4 + 3 + 2 + 1 + 0 = **15**.
  - **b)** r(5), r(4), r(3), r(2), r(1), r(0): **6** calls.
  - **c)** **O(n²).** There are n + 1 calls, but they don't do the same work: the loops run n, n − 1, ..., 1 times, which adds up to n(n + 1) / 2.
  - **d)** **O(n).** The loops run n, n/2, n/4, ... times, which adds up to under 2n. There are log n calls, but the work shrinks each time, like Pattern 7.

  </details>

- **22.21** A doubly-linked list holds `6 ⇄ 2 ⇄ 9 ⇄ 4`, with `head` at 6 and `tail` at 4. These run in order:

  1. Remove(the node holding 6)
  2. Append 7
  3. InsertAfter(the node holding 9, a new node holding 5)
  4. Remove(the node holding 4)
  5. Prepend 3

  **a)** What does the list hold now, from head to tail? Write the values separated by commas.

  <!-- answer:22.21a blanks: 3, 2, 9, 5, 7 | 3,2,9,5,7 -->

  **b)** Which values do the node holding 5's `prev` and `next` pointers point to?

  <!-- answer:22.21b blanks: prev => 9; next => 7 -->

  <details>
  <summary>Answer</summary>

  - Step 1 removes the head: `2 ⇄ 9 ⇄ 4`. Step 2: `2 ⇄ 9 ⇄ 4 ⇄ 7`.
  - Step 3: `2 ⇄ 9 ⇄ 5 ⇄ 4 ⇄ 7`. Step 4 links 5 and 7 to each other: `2 ⇄ 9 ⇄ 5 ⇄ 7`.
  - **a)** Step 5: **3, 2, 9, 5, 7**.
  - **b)** `prev` is **9** and `next` is **7**. Removing 4 set `5.next = 7` and `7.prev = 5`.

  </details>

- **22.22** Red-black rules. A null child counts as a black null leaf.

  <!-- figure
  tree: Tree A :: 40@b{25@r{18@b, 31@b}, 52@b{, 60@r}}
  tree: Tree B :: 40@b{25@b, 52@r}
  tree: Tree C :: 40@b{25@b, 52@b{47@r{, 49@r}}}
  tree: Tree D :: 40@r{25@b, 52@b}
  -->
  ```text
  Tree A                          Tree B
           40 (B)                          40 (B)
          /      \                        /      \
      25 (R)    52 (B)                25 (B)    52 (R)
      /    \        \
  18 (B)  31 (B)   60 (R)

  Tree C                          Tree D
           40 (B)                          40 (R)
          /      \                        /      \
      25 (B)    52 (B)                25 (B)    52 (B)
                /
            47 (R)
                \
               49 (R)
  ```
  <!-- /figure -->

  **a)** For each tree, is it a valid red-black tree? If not, which rule does it break?

  | Tree | Verdict |
  |---|---|
  | A | |
  | B | |
  | C | |
  | D | |

  <!-- answer:22.22a table [Valid, Red root, Red with red child, Unequal black counts]: Valid; Unequal black counts; Red with red child; Red root -->

  **b)** In tree A, how many black nodes are on every path from 40 down to a null leaf? Count 40 and the null leaf.

  <!-- answer:22.22b blanks: 3 -->

  <details>
  <summary>Answer</summary>

  - **A: valid.** The root is black, neither red node (25, 60) has a red child, and every path has 3 black nodes.
  - **B: unequal black counts.** 40 → 25 → null has 3 black nodes, but 40 → 52 → null has only 2.
  - **C: red with red child.** 47 is red, and so is its child 49. (The black counts are all 3, so that rule holds.)
  - **D: red root.** The root must be black.
  - **b)** For example, 40 → 25 → 18 → null: 40, 18, and the null leaf are black. 40 → 52 → 60 → null: 40, 52, and the null leaf. **3** on every path.

  </details>

- **22.23** Topological sort. Use this directed acyclic graph:

  <!-- figure
  nodes: V 0 0.6, U 1.3 0, X 1.3 1.2, W 0 1.8, Y 2.6 1.8, Z 2.6 0
  edges: V>U, V>X, W>X, W>Y, X>Y, U>Z, Y>Z
  -->
  ```text
  V → U      W → X      U → Z      W → Y
  V → X      X → Y      Y → Z
  ```
  <!-- /figure -->

  **a)** Run zyBooks' algorithm. The collection is a stack, first filled in the order U, V, W, X, Y, Z, and `pop()` takes the last vertex added. What is the result? Separate the vertices with commas.

  <!-- answer:22.23a blanks: W, V, X, Y, U, Z | W,V,X,Y,U,Z -->

  **b)** Is each ordering a valid topological sort?

  | Ordering | Valid? |
  |---|---|
  | V, W, U, X, Y, Z | |
  | W, X, V, U, Y, Z | |
  | V, U, Z, W, X, Y | |
  | W, V, U, X, Y, Z | |

  <!-- answer:22.23b-e table [Valid, Invalid]: Valid; Invalid; Invalid; Valid -->

  <details>
  <summary>Answer</summary>

  - **a)** Counts: U 1, V 0, W 0, X 2, Y 2, Z 2. V and W start at 0, so the stack starts as V, W.

    | Stack | Pop | Result | Changes |
    |---|---|---|---|
    | V, W | W | W | X 2→1, Y 2→1 |
    | V | V | W, V | U→0 push, X→0 push |
    | U, X | X | W, V, X | Y→0 push |
    | U, Y | Y | W, V, X, Y | Z 2→1 |
    | U | U | W, V, X, Y, U | Z→0 push |
    | Z | Z | W, V, X, Y, U, Z | |

    **W, V, X, Y, U, Z**.

  - **b)**
    - V, W, U, X, Y, Z: every edge points forward. **Valid.**
    - W, X, V, U, Y, Z: the edge V → X points backward. **Invalid.**
    - V, U, Z, W, X, Y: the edge Y → Z points backward. **Invalid.**
    - W, V, U, X, Y, Z: every edge points forward. **Valid.**

  </details>

- **22.24** Best, average, and worst cases. Give the Big-O of each.

  | Situation | Big-O |
  |---|---|
  | Bubble sort with an early stop, on a list that's already sorted | |
  | Insertion sort on a list sorted in reverse | |
  | Heap sort on a list that's already sorted | |
  | Binary search when the key is the first middle item checked | |
  | Linear search when the key isn't in the list | |

  <!-- answer:22.24a-e table [O(1), O(log n), O(n), O(n log n), O(n²)]: O(n); O(n²); O(n log n); O(1); O(n) -->

  <details>
  <summary>Answer</summary>

  - Bubble sort with the early stop makes one pass with no swaps, then stops: **O(n)**.
  - A reversed list is insertion sort's worst case: every item moves all the way to the front, **O(n²)**.
  - Heap sort is O(n log n) in every case, so sorted input doesn't help: **O(n log n)**.
  - Binary search's best case is one comparison: **O(1)**.
  - A missing key makes linear search check all n items: **O(n)**.

  </details>

- **22.25** Array-based lists. An empty array-based list starts with an array of size 2. When the array is full, the next append doubles its size and copies every item over first. Nine items are appended.

  **a)** How many times does the array resize?

  <!-- answer:22.25a blanks: 3 -->

  **b)** How many item copies do the resizes make in all?

  <!-- answer:22.25b blanks: 14 -->

  **c)** What is the array's size at the end?

  <!-- answer:22.25c blanks: 16 -->

  **d)** Next, a new item is inserted at index 2. How many items shift one place right?

  <!-- answer:22.25d blanks: 7 -->

  <details>
  <summary>Answer</summary>

  - **a)** 3. The 3rd append finds 2 items in 2 slots and resizes to 4. The 5th resizes to 8, and the 9th to 16.
  - **b)** 2 + 4 + 8 = 14.
  - **c)** 16.
  - **d)** 7. The items at indexes 2 to 8 each move one place right. The array has room, so there's no resize.

  </details>

- **22.26** A priority queue on a min-heap. A lower number means higher priority. The heap is stored in an array with the root at index 0, and it holds `4 9 7 15 12 10 20`.

  **a)** Enqueue 6. What is the array afterward? Separate the values with spaces.

  <!-- answer:22.26a blanks: 4 6 7 9 12 10 20 15 | 4, 6, 7, 9, 12, 10, 20, 15 -->

  **b)** How many swaps did that percolate-up take?

  <!-- answer:22.26b blanks: 2 -->

  **c)** Then dequeue once. What does it return, and what is the array afterward?

  <!-- answer:22.26c blanks: Returns => 4; Array => 6 9 7 15 12 10 20 | 6, 9, 7, 15, 12, 10, 20 -->

  **d)** Then peek. What does it return, and how many items does the queue hold afterward?

  <!-- answer:22.26d blanks: Returns => 6; Items => 7 -->

  <details>
  <summary>Answer</summary>

  - **a)** 6 goes in at index 7. Its parent, index 3, holds 15: 6 < 15, swap. Its new parent, index 1, holds 9: swap. Its new parent, index 0, holds 4, which is smaller: stop. **4 6 7 9 12 10 20 15**.
  - **b)** **2** swaps.
  - **c)** Dequeue returns the root, **4**. The last value, 15, moves to the root. Its children are 6 and 7: swap with the smaller, 6. At index 1, its children are 9 and 12: swap with 9. At index 3, it has no children: stop. **6 9 7 15 12 10 20**.
  - **d)** Peek returns the root without removing it: **6**. The queue still holds **7** items.

  </details>

- **22.27** Kruskal's minimum spanning tree. Run it on this undirected graph:

  <!-- figure
  nodes: A 0 0.6, B 1.3 0, C 1.3 1.2, D 2.6 0, E 2.6 1.2, F 3.9 0.6
  edges: A-B 4, A-C 8, B-C 2, B-D 6, C-D 3, C-E 9, D-E 5, D-F 10, E-F 7
  -->
  ```text
  A–B  4      B–C  2      C–D  3      D–E   5
  A–C  8      B–D  6      C–E  9      D–F  10
                                      E–F   7
  ```
  <!-- /figure -->

  **a)** Kruskal's algorithm takes the edges lightest first. Is each of the first six edges added to the tree or skipped?

  | Edge | Added or skipped? |
  |---|---|
  | B–C (2) | |
  | C–D (3) | |
  | A–B (4) | |
  | D–E (5) | |
  | B–D (6) | |
  | E–F (7) | |

  <!-- answer:22.27a-f table [Added, Skipped]: Added; Added; Added; Added; Skipped; Added -->

  **g)** What is the tree's total weight?

  <!-- answer:22.27g blanks: 21 -->

  **h)** What is the Big-O of Kruskal's algorithm?

  <!-- answer:22.27h blanks: [O(V + E), O(V²), O(E log E), O(V·E)] => O(E log E) -->

  <details>
  <summary>Answer</summary>

  - **a)**
    - B–C, C–D, and A–B each join two different sets: **added**. The set is now {A, B, C, D}.
    - D–E adds E: **added**.
    - B–D has both ends in {A, B, C, D, E}, so it would close a cycle: **skipped**.
    - E–F adds F: **added**. The tree now has 5 edges for 6 vertices, so every later edge is skipped.
  - **g)** 2 + 3 + 4 + 5 + 7 = **21**.
  - **h)** **O(E log E).** Sorting the edges, or running them through a priority queue, costs O(E log E).

  </details>

- **22.28** Simple sorts, pass by pass. Start from `41 16 58 23 9 34` each time.

  **a)** What is the list after insertion sort finishes i = 3 (the outer loop starts at i = 1)? Separate the values with spaces.

  <!-- answer:22.28a blanks: 16 23 41 58 9 34 | 16, 23, 41, 58, 9, 34 -->

  **b)** Insertion sort moves the item left one swap at a time. How many swaps does it make at i = 4?

  <!-- answer:22.28b blanks: 4 -->

  **c)** What is the list after two passes of bubble sort (each pass compares neighbors from left to right)? Separate the values with spaces.

  <!-- answer:22.28c blanks: 16 23 9 34 41 58 | 16, 23, 9, 34, 41, 58 -->

  <details>
  <summary>Answer</summary>

  - **a)** i = 1: 16 moves left past 41, giving `16 41 58 23 9 34`. i = 2: 58 is bigger than 41, so nothing moves. i = 3: 23 moves left past 58 and 41, and stops at 16: **16 23 41 58 9 34**.
  - **b)** At i = 4, 9 is smaller than 58, 41, 23, and 16, so it swaps 4 times to reach the front: **4**.
  - **c)** Pass 1 swaps 41↔16, 58↔23, 58↔9, 58↔34: `16 41 23 9 34 58`. Pass 2 swaps 41↔23, 41↔9, 41↔34, and leaves 41 and 58: **16 23 9 34 41 58**.

  </details>

- **22.29** Deques and stacks.

  **a)** Starting with an empty deque, these run in order. What do the two Pops return, in order? Write them separated by a comma.

  ```
  PushBack(5)
  PushFront(8)
  PushBack(3)
  PopFront()
  PushFront(1)
  PopBack()
  ```

  <!-- answer:22.29a blanks: 8, 3 | 8,3 -->

  **b)** What does PeekBack return afterward?

  <!-- answer:22.29b blanks: 5 -->

  **c)** A stack evaluates the postfix expression `4 7 2 - * 3 +`. Each number is pushed. Each operator pops the right operand, then the left operand, and pushes the result. What is the final value?

  <!-- answer:22.29c blanks: 23 -->

  <details>
  <summary>Answer</summary>

  - **a)** After the three pushes, the deque is `8 5 3`, front to back. PopFront returns **8**, leaving `5 3`. PushFront(1) gives `1 5 3`, and PopBack returns **3**.
  - **b)** The deque is `1 5`, so the back is **5**.
  - **c)** Push 4, 7, 2. `-` pops 2 and 7 and pushes 7 − 2 = 5. `*` pops 5 and 4 and pushes 20. Push 3. `+` pops 3 and 20 and pushes **23**.

  </details>

- **22.30** Heapify and heap sort, using zyBooks' max-heap `heap_sort` with the root at index 0. The list is `12 5 17 8 21 3 14 9`.

  **a)** At which index does heapify start?

  <!-- answer:22.30a blanks: 3 -->

  **b)** What is the array after heapify? Separate the values with spaces.

  <!-- answer:22.30b blanks: 21 12 17 9 5 3 14 8 | 21, 12, 17, 9, 5, 3, 14, 8 -->

  **c)** Heap sort then does its first two rounds (end index 7, then 6). What is the whole array afterward, sorted part included?

  <!-- answer:22.30c blanks: 14 12 8 9 5 3 17 21 | 14, 12, 8, 9, 5, 3, 17, 21 -->

  **d)** How many times does `heap_sort` call `percolate_down` on this 8-item list, in all?

  <!-- answer:22.30d blanks: 11 -->

  <details>
  <summary>Answer</summary>

  - **a)** 8 // 2 − 1 = **3**.
  - **b)** Index 3: 8 swaps with its child 9. Index 2: 17 beats 3 and 14, so it stays. Index 1: 5 swaps with the larger child, 21. Index 0: 12 swaps with 21, then beats 9 and 5: stop. **21 12 17 9 5 3 14 8**.
  - **c)** Round 1: swap 21 and 8. 8 percolates down through indexes 0 to 6: it swaps with 17, then with 14. That gives `17 12 14 9 5 3 8 21`. Round 2: swap 17 and 8. 8 percolates down through indexes 0 to 5: it swaps with 14, then beats 3. **14 12 8 9 5 3 17 21**.
  - **d)** Heapify calls it 8 // 2 = 4 times, and the sorting loop 8 − 1 = 7 times: **11**.

  </details>

- **22.31** B-trees and 2-3-4 trees.

  **a)** Use zyBooks' definition: the order is the largest number of children a node can have.

  | Question | Answer |
  |---|---|
  | Most keys a node can hold in a B-tree of order 6 | |
  | Most children a node can have in a B-tree of order 6 | |
  | Children of an internal node that holds 3 keys | |

  <!-- answer:22.31a-c table: 5; 6; 4 -->

  Insert 40, 15, 70, 25, 55, 85, 10, 30, 60, 65, 20, 5, in that order, into an empty 2-3-4 tree. Use zyBooks' preemptive split: split every full node on the way down, even when the leaf has room.

  **d)** What key or keys are in the root at the end, and how many splits happen in all?

  <!-- answer:22.31d blanks: Root => 40; Splits => 4 -->

  **e)** Which leaf holds 65 at the end? Give its keys, separated by spaces.

  <!-- answer:22.31e blanks: 55 60 65 | 55, 60, 65 -->

  **f)** In the final tree, a search for 62 returns `None`. How many nodes does it visit, counting the root and the last node it checks?

  <!-- answer:22.31f blanks: 3 -->

  <details>
  <summary>Answer</summary>

  - **a)** An order 6 node has up to **6** children and one fewer key: **5**. An internal node with N keys has N + 1 children: **4**.
  - 40, 15, 70 fill the root: (15 40 70).
  - 25: the root is full. Split: 40 moves up. Root (40), leaves (15 25) and (70). Split 1.
  - 55 and 85 go right: (55 70 85). 10 goes left: (10 15 25).
  - 30: the root has room. Its child (10 15 25) is full: split, 15 moves up. Root (15 40), and 30 joins (25): (25 30). Split 2.
  - 60: the child (55 70 85) is full: split, 70 moves up. Root (15 40 70), and 60 joins (55): (55 60). Split 3.
  - 65: the root is full: split, 40 becomes the new root over (15) and (70). Split 4. 65 then goes to (55 60), which has room: (55 60 65).
  - 20 joins (25 30): (20 25 30). 5 joins (10): (5 10). No node on either path is full, so no more splits.

  <!-- figure
  btree: 40{15{5 10, 20 25 30}, 70{55 60 65, 85}}
  -->
  ```text
                     40
              /             \
            15                70
          /    \           /      \
       5 10   20 25 30   55 60 65   85
  ```
  <!-- /figure -->

  - **d)** Root **40**, **4** splits.
  - **e)** **55 60 65**.
  - **f)** Root (40): 62 > 40, child 1. Node (70): 62 < 70, child 0. Leaf (55 60 65): no match, and a leaf has no children. **3** nodes.

  </details>

- **22.32** Quicksort's partition, the zyBooks way. The pivot is the middle element, at index (low + high) // 2. `low` moves right while its item is smaller than the pivot. `high` moves left while its item is bigger than the pivot. If they've met or crossed, the partition is done; otherwise swap the two items, step both indexes one place, and repeat. The list is `52 19 76 40 88 23 61`.

  **a)** What is the pivot?

  <!-- answer:22.32a blanks: 40 -->

  **b)** What is the list after partitioning? Separate the values with spaces.

  <!-- answer:22.32b blanks: 23 19 40 76 88 52 61 | 23, 19, 40, 76, 88, 52, 61 -->

  **c)** Partition returns `high`, the last index of the left part. What index does it return?

  <!-- answer:22.32c blanks: 2 -->

  <details>
  <summary>Answer</summary>

  - **a)** The middle index is (0 + 6) // 2 = 3, which holds **40**.
  - **b)** low stops at 52 (index 0). high skips 61 and stops at 23 (index 5). Swap them: `23 19 76 40 88 52 61`, then low = 1, high = 4. low skips 19 and stops at 76 (index 2). high skips 88 and stops at 40 (index 3). Swap them: `23 19 40 76 88 52 61`, then low = 3, high = 2. low stops at 76, high stops at 40. They've crossed, so it's done: **23 19 40 76 88 52 61**.
  - **c)** high is **2**. The left part is 23 19 40 (indexes 0 to 2), and the right part is 76 88 52 61.

  </details>

- **22.33** Hash tables.

  **a)** A table has 13 buckets, uses h = key % 13, and resolves collisions with quadratic probing, trying `(h + i + i²) % 13` for i = 0, 1, 2, .... Starting empty, insert 27, 40, 14, and 53, in that order. Which bucket does each key land in?

  | Key | Bucket |
  |---|---|
  | 27 | |
  | 40 | |
  | 14 | |
  | 53 | |

  <!-- answer:22.33a table: 1; 3; 7; 0 -->

  **b)** A string hash starts at 5. For each character, it multiplies the hash so far by 3 and adds the character's code, where a = 1, b = 2, and c = 3. The result is taken modulo 10. Which bucket does `cab` go in?

  <!-- answer:22.33b blanks: 7 -->

  **c)** A table that uses chaining has 8 buckets and holds 20 items. What is its load factor?

  <!-- answer:22.33c blanks: 2.5 | 5/2 -->

  <details>
  <summary>Answer</summary>

  - **a)** All four keys have h = 1. 27 takes bucket 1. 40: i = 1 gives 1 + 1 + 1 = 3. 14: buckets 1 and 3 are full, and i = 2 gives 1 + 2 + 4 = 7. 53: buckets 1, 3, and 7 are full, and i = 3 gives (1 + 3 + 9) % 13 = 0.
  - **b)** 5 × 3 + 3 = 18 for `c`. 18 × 3 + 1 = 55 for `a`. 55 × 3 + 2 = 167 for `b`. 167 % 10 = **7**.
  - **c)** 20 / 8 = **2.5**, the average chain length. Only chaining allows a load factor above 1.

  </details>

- **22.34** Treap insert and delete. Each node is written key:priority, and the priorities form a max-heap. Insert F, which gets priority 75.

  <!-- figure
  tree: L:88{D:52{A:15, H:47}, V:70{, Z:20}}
  -->
  ```text
            L:88
           /    \
       D:52      V:70
       /   \        \
    A:15   H:47     Z:20
  ```
  <!-- /figure -->

  **a)** Before any rotation, F is a new leaf. Which node is its parent?

  <!-- answer:22.34a blanks: H -->

  **b)** Which rotations restore the heap rule, in order?

  <!-- answer:22.34b blanks: First [Left at H, Right at H, Left at D, Right at D, Left at L, Right at L] => Right at H; Second [Left at H, Right at H, Left at D, Right at D, Left at L, Right at L] => Left at D -->

  **c)** After the insert, give each node's key.

  <!-- answer:22.34c blanks: F's parent => L; F's left child => D; F's right child => H -->

  **d)** Then delete D the zyBooks way (set its priority to −∞ and rotate it down). How many rotations happen before D is a leaf?

  <!-- answer:22.34d blanks: 1 -->

  <details>
  <summary>Answer</summary>

  - **a)** F < L, so go left. F > D, so go right. F < H, so go left. F becomes **H**'s left child.
  - **b)** 75 > 47, and F is a left child: **right rotation at H**. Now F is D's right child, and 75 > 52: **left rotation at D**. Now F is L's left child, and 88 ≥ 75: stop.
  - **c)** F's parent is **L**. D came down to F's left, still holding A:15, and H came down to F's right. The keys still read A D F H L V Z in order.
  - **d)** D's only child is A:15, so one right rotation at D brings A up. D is now a leaf and is cut off: **1** rotation. F's left child becomes A.

  </details>

- **22.35** Tracing recursion and the call stack.

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

  <!-- answer:22.35a blanks: 11 5 2 1 1 3 8 19 -->

  **b)** What is the largest number of `halves` frames on the call stack at the same time?

  <!-- answer:22.35b blanks: 5 -->

  **c)** While `halves(0)` is running, what is n in the frame just below it on the stack?

  <!-- answer:22.35c blanks: 1 -->

  **d)** What is the Big-O of `halves(n)`?

  <!-- answer:22.35d blanks: [O(1), O(log n), O(n), O(2ⁿ)] => O(log n) -->

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

- **22.36** Radix sort and bucket sort.

  **a)** Radix sort on `318 47 205 96 41 730 18`. What is the list after the second pass (by the tens digit)? Separate the values with spaces.

  <!-- answer:22.36a blanks: 205 318 18 730 41 47 96 | 205, 318, 18, 730, 41, 47, 96 -->

  **b)** How many passes does radix sort make on this list in all?

  <!-- answer:22.36b blanks: 3 -->

  **c)** Bucket sort uses 4 buckets for values from 0 to 79, putting x in bucket ⌊x × 4 / 80⌋. Which bucket does 39 go in?

  <!-- answer:22.36c blanks: 1 -->

  **d)** Which bucket does 60 go in?

  <!-- answer:22.36d blanks: 3 -->

  <details>
  <summary>Answer</summary>

  - **a)** First pass, by ones digit: `730 41 205 96 47 318 18`. Second pass, by tens digit, keeping that order within each bucket: bucket 0 holds 205, 1 holds 318 then 18, 3 holds 730, 4 holds 41 then 47, and 9 holds 96. Read in order: **205 318 18 730 41 47 96**. 318 stays ahead of 18 because it came first in the last pass. The hundreds pass fixes that.
  - **b)** The largest value, 730, has 3 digits: **3** passes.
  - **c)** ⌊39 × 4 / 80⌋ = ⌊1.95⌋ = **1**: the bucket for 20 to 39.
  - **d)** ⌊60 × 4 / 80⌋ = ⌊3⌋ = **3**: the bucket for 60 to 79.

  </details>

- **22.37** Python types and operators.

  **a)** What does each Python expression give?

  | Expression | Value |
  |---|---|
  | `17 / 4` | |
  | `-17 // 4` | |
  | `-17 % 4` | |
  | `2 * 3 ** 2` | |
  | `not 3 > 5 and 2 == 2.0` | |

  <!-- answer:22.37a table: 4.25; -5; 3; 18; True -->

  **b)** What does this print? Give both numbers.

  ```python
  a = [1, 2]
  b = a
  b.append(3)
  c = a + [4]
  c.append(5)
  print(len(a), len(c))
  ```

  <!-- answer:22.37b blanks: len(a) => 3; len(c) => 5 -->

  **c)** Which of these can be a key in a Python `dict`?

  A. `[1, 2]`

  B. `(1, 2)`

  C. `{1, 2}`

  <!-- answer:22.37c choice: B -->

  <details>
  <summary>Answer</summary>

  - **a)** `/` always gives a float: **4.25**. `//` rounds down, toward negative infinity, so −4.25 becomes **−5**. The remainder then has to make −5 × 4 + r = −17, so `-17 % 4` is **3**. `**` goes first: 2 × 9 = **18**. `3 > 5` is False, `not` makes it True, and `2 == 2.0` is True, so the whole thing is **True**.
  - **b)** `b = a` names the same list, so appending through `b` makes `a` hold 3 items. `a + [4]` builds a new list, so appending 5 to `c` doesn't touch `a`. It prints `3 5`.
  - **c)** **B.** Keys must be hashable. A tuple is immutable, but a list and a set can change, so they can't be keys.

  </details>

- **22.38** Sets. X = {3, 8, 14, 21, 30} and Y = {8, 11, 21, 27}.

  **a)** What is X − Y? List it in increasing order, separated by commas.

  <!-- answer:22.38a blanks: 3, 14, 30 | 3,14,30 -->

  **b)** zyBooks builds X ∪ Y by adding every element of X to an empty result, then every element of Y. How many of those add calls leave the result unchanged?

  <!-- answer:22.38b blanks: 2 -->

  **c)** Map X with the function "x % 7" (the remainder after dividing by 7). How many elements does the result have?

  <!-- answer:22.38c blanks: 4 -->

  **d)** Which set is a subset of X?

  A. {8, 11}

  B. {30, 3, 14}

  C. {21, 22}

  <!-- answer:22.38d choice: B -->

  <details>
  <summary>Answer</summary>

  - **a)** Take out the elements Y shares with X (8 and 21): **3, 14, 30**.
  - **b)** X's 5 elements all go in. Then Y's 8 and 21 are already there, so those two adds do nothing: **2**.
  - **c)** 3 → 3, 8 → 1, 14 → 0, 21 → 0, 30 → 2. 14 and 21 both give 0, and a set keeps one copy: {0, 1, 2, 3}, **4** elements.
  - **d)** **B.** 30, 3, and 14 are all in X, and order doesn't matter. 11 and 22 aren't in X.

  </details>

- **22.39** Permutations and subsets.

  ```python
  def perms(rest, built):
      if rest == "":
          print(built)
          return
      for i in range(len(rest)):
          perms(rest[:i] + rest[i + 1:], built + rest[i])

  def sums(items, total):
      if not items:
          print(total)
          return
      sums(items[1:], total + items[0])   # take the first item
      sums(items[1:], total)              # skip it
  ```

  **a)** `perms("wxyz", "")` prints 24 lines. What is the 9th line?

  <!-- answer:22.39a blanks: xywz -->

  **b)** List everything `sums([2, 5, 9], 0)` prints, in order, separated by commas.

  <!-- answer:22.39b blanks: 16, 7, 11, 2, 14, 5, 9, 0 | 16,7,11,2,14,5,9,0 -->

  **c)** How many lines does `sums` print for a list of 7 items?

  <!-- answer:22.39c blanks: 128 -->

  **d)** Which Big-O fits the number of lines `perms` prints for a string of n different letters?

  <!-- answer:22.39d blanks: [O(n²), O(2ⁿ), O(n!), O(nⁿ)] => O(n!) -->

  <details>
  <summary>Answer</summary>

  - **a)** The loop tries the letters in order, so lines 1 to 6 start with w (3! = 6 of them) and lines 7 to 12 start with x. Under x, the rest is "wyz", which gives xwyz, xwzy, xywz, ... in that order. Line 9 is the third of those: **xywz**.
  - **b)** Each call takes the first item before skipping it. Take 2, take 5: 9 taken gives 16, skipped gives 7. Take 2, skip 5: 11, 2. Skip 2, take 5: 14, 5. Skip 2, skip 5: 9, 0. **16, 7, 11, 2, 14, 5, 9, 0**.
  - **c)** Each item is either taken or skipped: 2⁷ = **128**.
  - **d)** **O(n!).** There are n choices for the first letter, n − 1 for the second, and so on: n! lines.

  </details>

- **22.40** Recognize the sort, and stability.

  ```python
  # Code A
  def mystery_a(items):
      for i in range(1, len(items)):
          j = i
          while j > 0 and items[j - 1] > items[j]:
              items[j - 1], items[j] = items[j], items[j - 1]
              j -= 1
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

  <!-- answer:22.40a blanks: [Selection, Insertion, Bubble, Shell, Counting, Radix] => Insertion -->

  **b)** Which sort is Code B?

  <!-- answer:22.40b blanks: [Selection, Insertion, Bubble, Shell, Counting, Radix] => Counting -->

  **c)** A stable sort sorts these items by their number only: `3a 1b 3c 2d 1e`. What is the result? Separate the items with spaces.

  <!-- answer:22.40c blanks: 1b 1e 2d 3a 3c | 1b, 1e, 2d, 3a, 3c -->

  **d)** Is each sort stable?

  | Sort | Stable? |
  |---|---|
  | Selection | |
  | Merge | |
  | Heap | |
  | Radix | |

  <!-- answer:22.40d-g table [Yes, No]: No; Yes; No; Yes -->

  <details>
  <summary>Answer</summary>

  - **a)** **Insertion.** The inner `while` loop moves left (`j -= 1`), swapping while the item before is bigger.
  - **b)** **Counting.** `tally` is a list indexed by the values themselves, and nothing compares two items.
  - **c)** Equal numbers keep their starting order: 1b came before 1e, and 3a before 3c. **1b 1e 2d 3a 3c**.
  - **d)** Selection sort's long-distance swap can jump an item past an equal one, so it's **not** stable. Merge sort is stable when ties take the left item first. Heap sort is **not** stable. Radix sort is stable, and it has to be: each pass relies on the order the last pass left.

  </details>
