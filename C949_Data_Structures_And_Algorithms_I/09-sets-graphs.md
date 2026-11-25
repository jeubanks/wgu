# 9. Sets and graphs

Sets hold each item once; graphs join vertices with edges and are searched breadth-first or depth-first.

After this page you can:

- Combine sets with Python's set operators
- Describe a graph and choose an adjacency list or matrix
- Trace BFS and DFS from a start vertex

## Sets

A **set** holds each item at most once, in no order, like a sign-in sheet where signing twice doesn't count twice. Adding a duplicate changes nothing, and {8, 3, 12} equals {12, 8, 3}. Python's `set` is a [hash table](07-hash-tables.md), so items must be hashable (not lists).

> [!IMPORTANT]
> **Key idea:** A set cares only about whether an item is in it, and each set operation builds a new set from two others.

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

> [!IMPORTANT]
> **Key idea:** A graph models connections, and making edges one-way or giving them costs changes what a path means.

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

- **A tree is hierarchical:** it has one root, and every other node has exactly one parent.
- **A graph is a network:** it has no root and no levels, any vertex can link to any other, and cycles are allowed.

A tree is just a connected graph with no cycles. (The course study guide's design table calls graphs hierarchical; they aren't.)

## Adjacency list vs adjacency matrix

An **adjacency list** gives each vertex a list of its neighbors. For the graph above:

```python
graph = {"A": ["B", "D"], "B": ["A", "C", "E"], "C": ["B", "E"],
         "D": ["A", "E"], "E": ["B", "C", "D"]}
```

> [!IMPORTANT]
> **Key idea:** A matrix answers "are these two joined?" in one step but spends space on every possible pair, while a list spends space only on edges that exist.

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

> [!IMPORTANT]
> **Key idea:** BFS finishes every vertex at one distance before going farther, while DFS goes as deep as it can before backing up.

<div class="viz" data-viz="graph-search" markdown>

*On the site: step through BFS and DFS.*

</div>

**Breadth-first search** spreads like a ripple, 1 edge out, then 2. It uses a **queue** (`collections.deque`):

1. Put the start vertex in the queue and mark it seen.
2. Dequeue a vertex and visit it.
3. Enqueue each of its unseen neighbors, and mark them seen.
4. Repeat steps 2 and 3 until the queue is empty.

From A:

| Visit | Enqueue | Queue after |
|---|---|---|
| A | B, D | B, D |
| B | C, E | D, C, E |
| D, C, E | (none new) | empty |

Order: A, B, D, C, E. BFS finds the path with the fewest edges.

**Depth-first search** is a maze walk: go as deep as possible, then back up to the last fork. Recursively:

1. Visit the vertex.
2. Call DFS on each neighbor that's still unseen, one at a time.

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

- **9.1** P = {3, 5, 9, 11} and Q = {5, 11, 13}.

  **a)** What is <code>P &#124; Q</code>?

  A. {5, 11}

  B. {3, 9, 13}

  C. {3, 5, 5, 9, 11, 11, 13}

  D. {3, 5, 9, 11, 13}

  <!-- answer:9.1a choice: D -->

  **b)** What is `P & Q`?

  A. {3, 9, 13}

  B. {5, 11}

  C. {3, 5, 9, 11, 13}

  D. {3, 9}

  <!-- answer:9.1b choice: B -->

  **c)** What is `P - Q`?

  A. {3, 9}

  B. {13}

  C. {3, 9, 13}

  D. {5, 11}

  <!-- answer:9.1c choice: A -->

  **d)** What is `P ^ Q`?

  A. {3, 9}

  B. {3, 5, 9, 11, 13}

  C. {3, 9, 13}

  D. {5, 11}

  <!-- answer:9.1d choice: C -->

  <details>
  <summary>Answer</summary>

  - **a)** **D.** Everything in either, each once. C keeps duplicates, which a set never holds.
  - **b)** **B.** Only the items in both sets. A is the opposite: the items in exactly one set.
  - **c)** **A.** P's items with the shared 5 and 11 dropped. B is `Q - P`; difference depends on order.
  - **d)** **C.** Items in exactly one set: the union minus 5 and 11. A forgets Q's 13, which is `P - Q`.

  </details>

- **9.2** Sets in Python.

  **a)** If `s = {2, 6}`, which of these lines raises an error?

  A. `s.add(2)`

  B. `s.discard(8)`

  C. `s.remove(8)`

  D. `len(s)`

  <!-- answer:9.2a choice: C -->

  **b)** What does `len({4, 4, 9, 9, 9})` return?

  A. 2

  B. 5

  C. 3

  D. 1

  <!-- answer:9.2b choice: A -->

  <details>
  <summary>Answer</summary>

  - **a)** **C.** `remove` raises `KeyError` on a missing item; B's `discard` doesn't, and A's duplicate is just ignored.
  - **b)** **A.** A set keeps one copy of each value, {4, 9}: 2. B counts the duplicates.

  </details>

- **9.3** Which statement about graphs and trees is true?

  A. Every graph has a root vertex, like a tree.

  B. A graph can never contain a cycle.

  C. Graphs are hierarchical, with levels.

  D. A tree is a connected graph with no cycles.

  <!-- answer:9.3 choice: D -->

  <details>
  <summary>Answer</summary>

  - **D.** A graph is a network: no root, no levels, cycles allowed. A tree is the special case that is connected and has no cycles.

  </details>

- **9.4** A road map has 40,000 intersections, each with 3 or 4 roads. Which storage fits better?

  A. Matrix: 1.6 billion cells, but O(1) edge checks are worth it

  B. List: about 80,000 edges, far fewer than 1.6 billion matrix cells

  C. Matrix: with 3 or 4 roads each, the graph is dense

  D. Either: both need about the same memory for this graph

  <!-- answer:9.4 choice: B -->

  <details>
  <summary>Answer</summary>

  - **B.** At most 80,000 edges is tiny next to 40,000² cells, so the graph is sparse. A pays for 1.6 billion cells that are almost all empty.

  </details>

- **9.5** Use this undirected graph. Visit neighbors in alphabetical order.

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

  **a)** What is the degree of vertex Q?

  A. 2

  B. 3

  C. 4

  D. 6

  <!-- answer:9.5a choice: B -->

  **b)** Is this graph a tree, and why?

  A. Yes: every vertex is connected

  B. Yes: it has no cycles

  C. No: P, Q, R, U, T form a cycle

  D. No: S isn't connected

  <!-- answer:9.5b choice: C -->

  **c)** In what order does BFS visit the vertices, starting at P?

  A. P, Q, T, R, S, U

  B. P, Q, R, U, T, S

  C. P, T, U, R, Q, S

  D. P, Q, R, S, T, U

  <!-- answer:9.5c choice: A -->

  **d)** In what order does recursive DFS visit the vertices, starting at P?

  A. P, Q, T, R, S, U

  B. P, Q, S, R, U, T

  C. P, Q, R, S, T, U

  D. P, Q, R, U, T, S

  <!-- answer:9.5d choice: D -->

  <details>
  <summary>Answer</summary>

  - **a)** **B.** Q touches P, R and S. D counts every edge in the graph.
  - **b)** **C.** P → Q → R → U → T → P is a cycle. It is connected, but A forgets that a tree also needs no cycles.
  - **c)** **A.** P enqueues Q, T. Q enqueues R, S. T enqueues U. C pops from a stack instead of a queue; D just lists the vertices alphabetically.
  - **d)** **D.** P → Q → R → U → T, then back up to Q for S. B takes Q's neighbors out of alphabetical order.

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

  **a)** Which traversal does this code perform?

  A. BFS

  B. Recursive DFS

  C. DFS with a stack

  D. Topological sort

  <!-- answer:9.6a choice: A -->

  **b)** What is its worst-case Big-O, for V vertices and E edges?

  A. O(V)

  B. O(V + E)

  C. O(V²)

  D. O(V · E)

  <!-- answer:9.6b choice: B -->

  <details>
  <summary>Answer</summary>

  - **a)** **A.** `append` plus `popleft` makes `todo` a queue. C would pop from the same end it appends to.
  - **b)** **B.** Each vertex is dequeued once and each list scanned once; `seen` makes each check O(1). C is the cost with an adjacency matrix.

  </details>
