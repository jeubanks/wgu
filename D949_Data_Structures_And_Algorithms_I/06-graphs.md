# Lesson 6: Graphs

> [!NOTE]
> This lesson is optional. Graph algorithms are mostly beyond this course, but BFS and DFS use the queues and stacks from Lesson 2.

A graph is a set of vertices joined by edges. In an undirected graph an edge goes both ways. In a directed graph each edge goes one way, and in a weighted graph each edge has a cost.

The lesson stores graphs as adjacency lists: a dict from each vertex to its neighbors. An adjacency matrix is the other common form: a V × V grid with a 1 wherever an edge exists.

Three ways to explore a graph:

- **Breadth-first search (BFS)** uses a queue. It visits everything one edge away, then two edges away, and so on. O(V + E).
- **Depth-first search (DFS)** follows one path as far as it goes before backing up. The lesson writes it with recursion, which uses the call stack. O(V + E).
- **Dijkstra's algorithm** finds the cheapest path from one vertex to every other in a weighted graph, as long as no weight is negative. It uses a priority queue.

Your file: `c949-practice/lesson6.py`. Run `python lesson6.py` to check your answers, and `python lesson6.py --demo` to also run the lesson code.

<!-- lesson-code -->
<details>
<summary>Lesson code</summary>

```python
graph = {                       # adjacency list, undirected
    'A': ['B', 'C'],
    'B': ['A', 'D', 'E'],
    'C': ['A', 'F'],
    'D': ['B'],
    'E': ['B', 'F'],
    'F': ['C', 'E'],
}


def bfs(g, start):              # O(V + E)
    visited, order = {start}, []
    q = deque([start])
    while q:
        v = q.popleft()
        order.append(v)
        for w in g[v]:
            if w not in visited:
                visited.add(w)
                q.append(w)
    return order


def dfs(g, start, visited=None):  # recursion = an implicit stack
    if visited is None:
        visited = []
    visited.append(start)
    for w in g[start]:
        if w not in visited:
            dfs(g, w, visited)
    return visited


weighted = {
    'A': {'B': 4, 'C': 1},
    'B': {'D': 1},
    'C': {'B': 2, 'D': 5},
    'D': {},
}


def dijkstra(g, start):        # O((V + E) log V), non-negative weights only
    dist = {v: float('inf') for v in g}
    dist[start] = 0
    pq = [(0, start)]
    while pq:
        d, v = heapq.heappop(pq)
        if d > dist[v]:
            continue                       # stale entry, already improved
        for w, weight in g[v].items():
            nd = d + weight
            if nd < dist[w]:
                dist[w] = nd
                heapq.heappush(pq, (nd, w))
    return dist


def demo():
    print(bfs(graph, 'A'))           # ['A', 'B', 'C', 'D', 'E', 'F']
    print(dfs(graph, 'A'))           # ['A', 'B', 'D', 'E', 'F', 'C']
    print(dijkstra(weighted, 'A'))   # {'A': 0, 'B': 3, 'C': 1, 'D': 4}
```

</details>
<!-- /lesson-code -->

## Exercises

- **6.1**\
  **In:** `TRACE_6_1` *(paper first)*

  Run Dijkstra's algorithm by hand from `'S'` on this directed, weighted graph. Give the final distance to every vertex, as a dict.

  ```python
  W2 = {'S': {'A': 7, 'B': 2}, 'A': {'T': 1}, 'B': {'A': 3, 'T': 8}, 'T': {}}
  ```

  `'S': {'A': 7, ...}` means an edge from S to A that costs 7.

  <!-- solution:6.1 -->
  <details>
  <summary>Hint</summary>

  - Keep a table of best-known distances: S starts at 0, everything else at infinity.
  - Each step, take the unfinished vertex with the smallest distance, then check whether going through it shortens the way to its neighbors.

  </details>

  <details>
  <summary>Solution</summary>

  ```python
  W2 = {'S': {'A': 7, 'B': 2}, 'A': {'T': 1}, 'B': {'A': 3, 'T': 8}, 'T': {}}

  TRACE_6_1 = {'S': 0, 'A': 5, 'B': 2, 'T': 6}
  ```

  </details>
  <!-- /solution -->

- **6.2**\
  **In:** `shortest_path(g, start, goal)`

  Return the vertices on a path from `start` to `goal` that uses the fewest edges, as a list.

  - Use BFS, and a dict that records how you reached each vertex.
  - Return None if `goal` can't be reached.

  <!-- solution:6.2 -->
  <details>
  <summary>Hint</summary>

  - BFS reaches every vertex by a fewest-edges path first.
  - Record which vertex discovered each one, then walk back from the goal.

  </details>

  <details>
  <summary>Solution</summary>

  ```python
  def shortest_path(g, start, goal):
      """6.2 Vertex list of a fewest-edges path (BFS + predecessor map). None if unreachable."""
      prev = {start: None}
      q = deque([start])
      while q:
          v = q.popleft()
          if v == goal:
              path = []
              while v is not None:
                  path.append(v)
                  v = prev[v]
              return path[::-1]
          for w in g[v]:
              if w not in prev:
                  prev[w] = v
                  q.append(w)
      return None
  ```

  </details>
  <!-- /solution -->

- **6.3**\
  **In:** `dfs_iter(g, start)`

  Write DFS with an explicit stack instead of recursion.

  - Return the vertices in the same visit order as the lesson's recursive `dfs`.

  <!-- solution:6.3 -->
  <details>
  <summary>Hint</summary>

  - A stack hands back the last item pushed.
  - To visit neighbors in list order, push them in reverse order.

  </details>

  <details>
  <summary>Solution</summary>

  ```python
  def dfs_iter(g, start):
      """6.3 DFS with an explicit stack, same visit order as the recursive dfs."""
      visited, stack = [], [start]
      while stack:
          v = stack.pop()
          if v in visited:
              continue
          visited.append(v)
          for w in reversed(g[v]):
              if w not in visited:
                  stack.append(w)
      return visited
  ```

  </details>
  <!-- /solution -->

- **6.4**\
  **In:** `count_components(g)`

  Return the number of connected components in an undirected graph: groups of vertices joined to each other, but not to the rest.

  <!-- solution:6.4 -->
  <details>
  <summary>Hint</summary>

  - Loop over every vertex. Each one you haven't seen yet starts a new component.
  - The lesson's `bfs` returns everything reachable from a vertex: mark all of it as seen.

  </details>

  <details>
  <summary>Solution</summary>

  ```python
  def count_components(g):
      """6.4 Number of connected components in an undirected graph."""
      seen, count = set(), 0
      for v in g:
          if v not in seen:
              count += 1
              seen.update(bfs(g, v))
      return count
  ```

  </details>
  <!-- /solution -->

- **6.5**\
  **In:** `topo_sort(g)`

  Return a topological order of a directed graph with Kahn's algorithm.

  - An edge from X to Y means X comes before Y.
  - Raise `ValueError` if the graph has a cycle.

  <!-- solution:6.5 -->
  <details>
  <summary>Hint</summary>

  - Count the incoming edges of each vertex. The ones with none can go first.
  - When you output a vertex, take its edges away. Which vertices drop to zero?
  - If you output fewer vertices than the graph has, the rest are stuck in a cycle.

  </details>

  <details>
  <summary>Solution</summary>

  ```python
  def topo_sort(g):
      """6.5 Kahn's algorithm. Edge X -> Y means X comes before Y. Raise ValueError on a cycle."""
      indeg = {v: 0 for v in g}
      for v in g:
          for w in g[v]:
              indeg[w] += 1
      q = deque(sorted(v for v in g if indeg[v] == 0))
      order = []
      while q:
          v = q.popleft()
          order.append(v)
          for w in g[v]:
              indeg[w] -= 1
              if indeg[w] == 0:
                  q.append(w)
      if len(order) != len(g):
          raise ValueError('cycle')
      return order
  ```

  </details>
  <!-- /solution -->

- **6.6**\
  **In:** `to_matrix(g)`

  Turn an adjacency list into an adjacency matrix.

  - Return `(sorted_names, matrix)`. Row and column `i` stand for `sorted_names[i]`.
  - Put a 1 where an edge exists, and 0 everywhere else.

  Then answer, on paper: for a graph with V vertices and only a few edges, which takes less memory, the adjacency list or the matrix? Give the Big-O of each.

  <!-- solution:6.6 -->
  <details>
  <summary>Hint</summary>

  - Sort the names first, then give each name its row and column number.
  - Start from a grid of zeros and set a 1 for each edge.
  - Count what each one stores: one entry per what?

  </details>

  <details>
  <summary>Solution</summary>

  ```python
  def to_matrix(g):
      """6.6 Return (sorted_names, adjacency_matrix) with 1 where an edge exists."""
      names = sorted(g)
      idx = {v: i for i, v in enumerate(names)}
      m = [[0] * len(names) for _ in names]
      for v in g:
          for w in g[v]:
              m[idx[v]][idx[w]] = 1
      return names, m
  ```

  </details>
  <!-- /solution -->

  <details>
  <summary>Answer</summary>

  The adjacency list. It stores one entry per vertex plus one per edge: O(V + E). The matrix always has V × V cells, O(V²), even when almost all of them are 0.

  The matrix wins when the graph is dense, or when you need a fast "is there an edge from A to B?" check, which is O(1) in a matrix.

  </details>
