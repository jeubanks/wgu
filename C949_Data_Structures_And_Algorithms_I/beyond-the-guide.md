# Beyond the guide

These come up in the zyBooks chapters but aren't in the course study guide's topic list. Know what each one is and its Big-O; you don't need to trace them step by step.

## AVL trees

An AVL tree is a [BST](08-trees-heaps.md) that keeps itself balanced. Every node has a **balance factor**: the height of its left subtree minus the height of its right subtree, counting a missing subtree as height −1. In an AVL tree every balance factor is −1, 0 or 1.

After an insert or remove:

1. Walk back up toward the root, checking balance factors.
2. If a node reaches +2 or −2, fix it with a **rotation**: a child moves up into the node's place and the node moves down, while the keys stay in BST order.

A node that leans left-left or right-right needs one rotation; left-right or right-left needs two.

<!-- figure
title: Right rotation at Y
tree: Before :: Y{X{A@t, B@t}, C@t}
tree: After :: X{A@t, Y{B@t, C@t}}
flow: yes
-->
```text
        Y                 X
       / \               / \
      X   C     →       A   Y
     / \                   / \
    A   B                 B   C
```
<!-- /figure -->

**Big-O:** search, insert and remove are O(log n) in the average and worst case, because the height stays O(log n). One rotation is O(1).

## Red-black trees

A red-black tree is another self-balancing BST. It paints each node red or black and keeps these rules:

1. The root is black.
2. A red node's children are black: no two reds in a row.
3. Every path from a node down to a null leaf passes the same number of black nodes. (Null leaves count as black.)

New nodes go in red, then recoloring and rotations repair any broken rule. The rules keep the longest path at most twice the shortest, so the height is at most 2 log₂(n + 1). Its balance is looser than AVL's, so it rotates less often.

**Big-O:** search, insert and remove are O(log n) in the average and worst case.

## B-trees and 2-3-4 trees

A B-tree node holds several sorted keys, which split a search several ways. In a B-tree of **order m**, a node has up to m children and m − 1 keys, a node with k keys has k + 1 children, and all leaves sit at the same depth. A **2-3-4 tree** is order 4: each node holds 1, 2 or 3 keys.

New keys go into a leaf. A full node is **split**:

1. Its middle key moves up into the parent.
2. The keys on either side become two nodes.

When the root splits, the tree grows one level taller at the top.

<!-- figure
btree: Full node :: 20 40 60
btree: After the split :: 40{20, 60}
flow: yes
-->
```text
  20 40 60      →        40
                        /  \
                      20    60
```
<!-- /figure -->

**Big-O:** search, insert and remove are O(log n) in the average and worst case.

## Treaps

A treap is a BST by key and a max-heap by a **random priority** given to each node when it's inserted.

- **Insert:** add it as a normal BST leaf, then rotate the node up while its priority beats its parent's.
- **Delete:** rotate the node down until it's a leaf, then remove it.

The random priorities make the tree's shape as if the keys had arrived in random order.

**Big-O:** O(log n) expected for search, insert and remove; O(n) worst case if the priorities come out badly.

## Tries

A trie stores strings one character per level. Each path from the root spells a prefix, and a node is marked when a whole word ends there. Words that share a prefix share a path.

<!-- figure
nary: Stores car, cat and do (✓ marks a word's end) :: root{c{a{"r ✓", "t ✓"}}, d{"o ✓"}}
-->
```text
        root
        /  \
       c    d
       |    |
       a    o ✓
      / \
    r ✓  t ✓
```
<!-- /figure -->

**Big-O:** search and insert are O(L) for a word of length L, however many words the trie holds. Listing every word with a given prefix starts with an O(L) walk to the prefix.

## Dijkstra's algorithm

Finds the shortest path from one start vertex to every other vertex, when no edge weight is negative.

1. Set every distance to ∞, and the start's to 0.
2. Repeatedly take the unvisited vertex with the smallest distance. Its distance is now final.
3. **Relax** each of its edges: if its distance plus the edge weight beats the neighbor's distance, update the neighbor and record the current vertex as its predecessor.

It's greedy: once a vertex is taken, it's never revisited, which is why a negative edge can fool it.

**Big-O:** O(V²) with an unsorted list of unvisited vertices; O((V + E) log V) with a binary heap.

## Bellman-Ford

Solves the same problem as Dijkstra but allows negative edge weights.

1. Relax every edge in the graph. That's one pass.
2. Make V − 1 passes in all, since a shortest path has at most V − 1 edges.
3. Make one extra pass. If it still shortens a distance, there's a **negative cycle**, so no shortest path exists.

**Big-O:** O(V·E) in every case.

## Topological sort

Orders the vertices of a **directed acyclic graph** so every edge X → Y has X before Y, like listing courses so each comes after its prerequisites. One method:

1. Count each vertex's incoming edges.
2. Output a vertex whose count is 0.
3. Subtract 1 from the count of each vertex it points to.
4. Repeat steps 2 and 3 until no vertex with count 0 is left.

A graph usually has several valid orders, and none if it has a cycle.

**Big-O:** O(V + E).

## Minimum spanning tree (Kruskal)

A **minimum spanning tree** of a connected, weighted, undirected graph is a set of V − 1 edges that connects every vertex with the smallest total weight. It isn't a shortest-path map: two vertices can be farther apart inside the tree than in the graph.

**Kruskal's algorithm:**

1. Sort the edges, cheapest first.
2. Take the next edge. Keep it unless its two ends are already connected by kept edges, which would close a cycle.
3. Repeat step 2 until V − 1 edges are kept.

Sets of connected vertices track this; keeping an edge merges two sets.

**Big-O:** O(E log E), from sorting the edges.

## Floyd-Warshall

Finds the shortest distance between **every** pair of vertices, in a V × V matrix.

1. Start with each edge's weight, 0 on the diagonal, and ∞ elsewhere.
2. Pick a vertex K and check every pair X, Y. If going X → K → Y is shorter than the current entry, replace it.
3. Repeat step 2 with every vertex as K.

It allows negative edges but not negative cycles.

**Big-O:** O(V³) time and O(V²) space.

## Huffman coding

Huffman coding compresses text by giving common characters short bit codes and rare ones long codes.

1. Count each character's frequency.
2. Put a leaf per character in a priority queue, lowest count first.
3. Remove the two lowest, join them under a new parent holding their sum, and put the parent back. Repeat until one node is left.
4. Read each code from the root: 0 for left, 1 for right.

<!-- figure
nary: MISSISSIPPI: S = 0, I = 11, M = 100, P = 101 :: 11{S, 7{3{M, P}, I}}
-->
```text
        11
       /  \
      S    7
          / \
         3   I
        / \
       M   P
```
<!-- /figure -->

Every character is a leaf, so no code is the start of another and the bits need no separators. MISSISSIPPI takes 21 bits instead of 88 in 8-bit ASCII.

**Big-O:** counting is O(n) for n characters; building the tree is O(k log k) for k distinct characters with a heap.

## Greedy algorithms

A greedy algorithm takes the option that looks best right now, and never goes back.

- **Making change:** take the largest coin that fits, as many times as it fits. With US coins that gives the fewest coins. With coins 1, 3 and 4, making 6 greedily gives 4 + 1 + 1, though 3 + 3 is better.
- **Fractional knapsack:** you may take part of an item. Sort by value per pound, take whole items while they fit, then a fraction of the next. Greedy is optimal here.
- **Activity selection:** to fit the most non-overlapping activities, sort by finish time and take each activity that starts after the last chosen one finishes. Also optimal.

**Big-O:** O(n log n) for each of the last two, from sorting.

## Dynamic programming

Dynamic programming solves each smaller subproblem once, saves the answer, and builds the full answer from saved results. It pays off when plain recursion would solve the same subproblem again and again.

- **Fibonacci:** plain recursion recomputes the same values, O(2ⁿ). **Memoizing** saves each one the first time:

  ```python
  memo = {0: 0, 1: 1}
  def fib(n):
      if n not in memo:
          memo[n] = fib(n - 1) + fib(n - 2)
      return memo[n]
  ```

  Each value is computed once: O(n). A loop that keeps only the last two values is O(n) time and O(1) space.

- **Longest common subsequence:** the longest string of characters that appears, in order but not necessarily side by side, in both strings. CART and CHAT share CAT. Fill an N × M table, one entry per pair of characters:
  - **If they match:** 1 + the entry up and to the left.
  - **If not:** the larger of the entry above and the entry to the left.

  The bottom-right entry is the length. A **substring** instead must be unbroken, so a mismatch resets the entry to 0.

**Big-O:** LCS is O(NM) time and space.

## Heuristics

A heuristic gives up a guaranteed best answer to get a good one fast.

- **0-1 knapsack:** each item is taken whole or not at all. Trying every combination is exact but O(2ⁿ). A heuristic that takes the most valuable items first while they fit is O(n log n), but can miss the best load.
- **Move-to-front:** after a linear search finds an item, move it to the front of the list. Items searched for often drift to the front and are found in few comparisons. This is a **self-adjusting** heuristic.

**Big-O:** move-to-front search is O(1) best (the item is in front) and O(n) worst.

## Recursive exploration

Recursion can list every possibility. Each call makes one choice, then calls itself for the rest; a base case is one complete possibility.

- **Permutations** (every ordering): n choices for the first spot, n − 1 for the next, so n! results.
- **Subsets:** each item is in or out, so 2ⁿ results.

  ```python
  def subsets(items, picked):
      if not items:
          print(picked)
          return
      subsets(items[1:], picked + [items[0]])   # with the first item
      subsets(items[1:], picked)                # without it
  ```

**Big-O:** permutations give n! results and subsets give 2ⁿ, so the time grows at least that fast: O(n!) and O(2ⁿ).

## Big-O at a glance

| Topic | Operation | Big-O |
|---|---|---|
| AVL, red-black, B-tree | search, insert, remove | O(log n) worst case |
| Treap | search, insert, remove | O(log n) expected, O(n) worst |
| Trie | search, insert a word of length L | O(L) |
| Dijkstra | single-source shortest paths | O(V²) list; O((V + E) log V) heap |
| Bellman-Ford | single-source, negative weights | O(V·E) |
| Topological sort | order a DAG | O(V + E) |
| Kruskal | minimum spanning tree | O(E log E) |
| Floyd-Warshall | all-pairs shortest paths | O(V³) |
| Huffman | build the tree for k characters | O(k log k) |
| Greedy | fractional knapsack, activity selection | O(n log n) |
| Dynamic programming | Fibonacci with memo; LCS | O(n); O(NM) |
| Heuristics | 0-1 knapsack exact vs heuristic | O(2ⁿ) vs O(n log n) |
| Recursive exploration | permutations; subsets | O(n!); O(2ⁿ) |
