# 9. Sets and graphs

Part of *Determines Data Structure Impact*. You'll combine sets with Python's operators, describe graphs, pick an adjacency list or matrix, and trace BFS and DFS.

## Sets

A **set** holds each item at most once, in no order, like a sign-in sheet where signing twice doesn't count twice. Adding a duplicate changes nothing, and {8, 3, 12} equals {12, 8, 3}. Python's `set` is a [hash table](07-hash-tables.md), so items must be hashable (not lists).

```python
s = {3, 1, 4}
s.add(1)        # already there: no change
s.discard(9)    # missing: no error
s.remove(9)     # missing: KeyError
4 in s          # True, O(1) on average
empty = set()   # {} is an empty dict
```

### Set operations

<div class="viz" data-viz="set-ops" markdown>

*On the site: each operation shaded on two circles.*

</div>

With X = {7, 19, 23, 40} and Y = {19, 31, 40, 58}:

| Operation | Keeps | Example | Python |
|---|---|---|---|
| **Union** | items in either | {7, 19, 23, 31, 40, 58} | <code>X &#124; Y</code> |
| **Intersection** | items in both | {19, 40} | `X & Y` |
| **Difference** X − Y | items in X, not Y | {7, 23} | `X - Y` |
| **Symmetric difference** | items in exactly one | {7, 23, 31, 58} | `X ^ Y` |

Each builds a new set. Difference depends on order: Y − X is {31, 58}. "What they don't share" is the symmetric difference, not X − Y.

S1 is a **subset** of S2 when every item of S1 is in S2 (`S1 <= S2`). Every set is a subset of itself.

## Graphs

A **graph** is a set of **vertices** joined by **edges**, like towns joined by roads.

<!-- figure
nodes: A 0 0, B 1 0, C 2 0, D 0 1, E 1 1
edges: A-B, A-D, B-C, B-E, C-E, D-E
-->
```text
   A --- B --- C
   |     |   /
   D --- E
```
<!-- /figure -->

| Term | Meaning | Here |
|---|---|---|
| **Adjacent** | joined by an edge | A and B |
| **Degree** | edges touching a vertex | B: 3 |
| **Path** | a chain of edges | A → D → E (length 2) |
| **Cycle** | a path back to its start | B → C → E → B |
| **Connected** | every vertex reaches every other | yes |

- **Directed:** each edge is a one-way arrow, like a web link.
- **Weighted:** each edge carries a cost; a path's length is the sum of its weights.

### Networks, not hierarchies

A tree is **hierarchical**: one root, and every other node has exactly one parent. A graph has no root and no levels, any vertex can link to any other, and cycles are allowed. It's a **network**. A tree is just a connected graph with no cycles. (The course study guide's design table calls graphs hierarchical; they aren't.)

## Adjacency list vs adjacency matrix

An **adjacency list** gives each vertex a list of its neighbors. For the graph above:

```python
graph = {"A": ["B", "D"], "B": ["A", "C", "E"], "C": ["B", "E"],
         "D": ["A", "E"], "E": ["B", "C", "D"]}
```

An **adjacency matrix** is a V × V grid with a 1 where row X and column Y are joined:

<!-- figure
grid: A B C D E / A: 0 *1 0 *1 0 / B: *1 0 *1 0 *1 / C: 0 *1 0 0 *1 / D: *1 0 0 0 *1 / E: 0 *1 *1 *1 0
-->
```text
     A  B  C  D  E
  A  0  1  0  1  0
  B  1  0  1  0  1
  C  0  1  0  0  1
  D  1  0  0  0  1
  E  0  1  1  1  0
```
<!-- /figure -->

| Feature | List | Matrix |
|---|---|---|
| Space | O(V + E) | O(V²) |
| Is X joined to Y? | O(degree of X), up to O(V) | O(1) |
| X's neighbors | O(degree of X) | O(V), the whole row |

Most graphs are **sparse** (few edges per vertex), so lists are usual. A matrix suits a **dense** graph.

## BFS and DFS

Both visit every vertex reachable from a start, tracking which are seen, taking neighbors alphabetically.

<div class="viz" data-viz="graph-search" markdown>

*On the site: step through BFS and DFS.*

</div>

**Breadth-first search** spreads like a ripple, 1 edge out, then 2. With a **queue** (`collections.deque`): dequeue a vertex, visit it, enqueue its unseen neighbors. From A:

| Visit | Enqueue | Queue after |
|---|---|---|
| A | B, D | B, D |
| B | C, E | D, C, E |
| D, C, E | (none new) | empty |

Order: A, B, D, C, E. BFS finds the path with the fewest edges.

**Depth-first search** is a maze walk: go as deep as possible, then back up to the last fork. Recursively: visit the vertex, then call DFS on each unseen neighbor.

<!-- figure
call: dfs(A) | visit A
call: >dfs(B) | visit B
call: >>dfs(C) | visit C
call: >>>dfs(E) | visit E
call: >>>>dfs(D) | visit D, then back up
-->
```text
dfs(A)
  dfs(B)
    dfs(C)
      dfs(E)
        dfs(D)
```
<!-- /figure -->

Order: A, B, C, E, D. A version with an explicit **stack** can give a different order.

## Other graph algorithms

See the [appendix](beyond-the-guide.md): [Dijkstra](beyond-the-guide.md#dijkstras-algorithm) and [Bellman-Ford](beyond-the-guide.md#bellman-ford) find shortest paths, [Kruskal](beyond-the-guide.md#minimum-spanning-tree-kruskal) builds a minimum spanning tree, and [topological sort](beyond-the-guide.md#topological-sort) orders tasks so every edge points forward.

## Big-O summary

| Operation | Best | Average | Worst | Why |
|---|---|---|---|---|
| Set `add`, `remove`, `in` | O(1) | O(1) | O(n) | one hash lookup; worst if all items share a bucket |
| Union; intersection or difference | O(n + m); O(n) | same | same | add every item; look up each of X's items |
| BFS or DFS, adjacency list | O(V + E) | same | same | each vertex once, each list once (matrix: O(V²)) |

## Questions

- **9.1** P = {3, 5, 9, 11} and Q = {5, 11, 13}. Give each result in increasing order, separated by commas.

  | Expression | Result |
  |---|---|
  | <code>P &#124; Q</code> | |
  | `P & Q` | |
  | `P - Q` | |
  | `P ^ Q` | |

  <!-- answer:9.1a-d table: 3, 5, 9, 11, 13 | 3,5,9,11,13; 5, 11 | 5,11; 3, 9 | 3,9; 3, 9, 13 | 3,9,13 -->

  <details>
  <summary>Answer</summary>

  - Intersection is the shared 5 and 11. `P - Q` drops them from P; `P ^ Q` drops them from the union.

  </details>

- **9.2** `s = {2, 6}`.

  **a)** Which line raises an error?

  A. `s.add(2)`

  B. `s.discard(8)`

  C. `s.remove(8)`

  <!-- answer:9.2a choice: C -->

  **b)** What does `len({4, 4, 9, 9, 9})` return?

  <!-- answer:9.2b blanks: 2 -->

  <details>
  <summary>Answer</summary>

  - **a)** **C.** `remove` raises `KeyError` on a missing item; `discard` doesn't.
  - **b)** A set keeps one copy of each value, {4, 9}: **2**.

  </details>

- **9.3** Which is true?

  A. Every graph has a root vertex.

  B. A graph can contain cycles; a tree is a connected graph without them.

  C. Graphs are hierarchical, like trees.

  <!-- answer:9.3 choice: B -->

  <details>
  <summary>Answer</summary>

  - **B.** A graph is a network: no root, no levels, cycles allowed.

  </details>

- **9.4** A road map has 40,000 intersections, each with 3 or 4 roads. Which storage fits better?

  A. Adjacency matrix: edge checks are O(1)

  B. Adjacency list: the graph is sparse, and a matrix needs 1.6 billion cells

  <!-- answer:9.4 choice: B -->

  <details>
  <summary>Answer</summary>

  - **B.** At most 80,000 edges is tiny next to 40,000² cells.

  </details>

- **9.5** Use this undirected graph. Take neighbors alphabetically; separate vertices with commas.

  <!-- figure
  nodes: S 1 0, P 0 1, Q 1 1, R 2 1, T 0 2, U 2 2
  edges: P-Q, P-T, Q-R, Q-S, R-U, T-U
  -->
  ```text
           S
           |
     P --- Q --- R
     |           |
     T --------- U
  ```
  <!-- /figure -->

  **a)** The degree of Q?

  <!-- answer:9.5a blanks: 3 -->

  **b)** Is it a tree?

  <!-- answer:9.5b blanks: [Yes, No] => No -->

  **c)** BFS order from P?

  <!-- answer:9.5c blanks: P, Q, T, R, S, U | P,Q,T,R,S,U -->

  **d)** Recursive DFS order from P?

  <!-- answer:9.5d blanks: P, Q, R, U, T, S | P,Q,R,U,T,S -->

  <details>
  <summary>Answer</summary>

  - **a)** Q touches P, R, S: **3**. **b)** P → Q → R → U → T → P is a cycle, so **No**.
  - **c)** P enqueues Q, T. Q enqueues R, S. T enqueues U. **P, Q, T, R, S, U**.
  - **d)** P → Q → R → U → T, then back up to Q for S. **P, Q, R, U, T, S**.

  </details>

- **9.6** This code walks a graph stored as an adjacency list.

  ```python
  def walk(graph, start):
      seen = {start}
      todo = deque([start])
      while todo:
          v = todo.popleft()
          print(v)
          for w in graph[v]:
              if w not in seen:
                  seen.add(w)
                  todo.append(w)
  ```

  **a)** Which traversal is it?

  A. BFS

  B. DFS

  <!-- answer:9.6a choice: A -->

  **b)** Its worst-case Big-O?

  A. O(V)

  B. O(V + E)

  C. O(V²)

  <!-- answer:9.6b choice: B -->

  <details>
  <summary>Answer</summary>

  - **a)** **A.** `append` plus `popleft` makes `todo` a queue.
  - **b)** **B.** Each vertex is dequeued once and each list scanned once; `seen` makes each check O(1).

  </details>
