# 9. Graphs

A graph stores items and the connections between them, with no top, no bottom, and no fixed order. Lists, trees, and heaps are all special graphs. This chapter covers how to store a graph, how to walk through one (BFS and DFS), and the classic graph algorithms in zyBooks chapter 9: shortest paths, topological sort, minimum spanning trees, and all-pairs shortest paths.

## Graph basics

A **graph** is a set of **vertices** (also called nodes) joined by **edges**. A vertex is an item, like a city or a person. An edge is a connection between two vertices, like a road or a friendship.

```text
   A --- B
   |     |
   C --- D
   |     |
   E --- F --- G
```

| Term | Meaning | In the graph above |
|---|---|---|
| **Adjacent** | Two vertices joined by an edge | A and B are adjacent. A and D are not. |
| **Path** | A chain of edges you can follow, one after another, to get from one vertex to another | A → C → E → F |
| **Path length** | The number of edges on the path (in a weighted graph, the sum of the weights) | A → C → E → F has length 3 |
| **Distance** | The length of the **shortest** path between two vertices | A to F is 3. A to G is 4. |
| **Degree** | The number of edges that touch a vertex | C has degree 3. G has degree 1. |
| **Connected** | There is a path between every pair of vertices | This graph is connected. |
| **Disconnected** | At least one pair of vertices has no path between them | Remove the F–G edge and G is cut off. |

Every edge counts once, however you draw it. This graph has 7 vertices and 8 edges.

With V vertices and at most one edge per pair, an undirected graph can have at most V(V − 1) / 2 edges: every vertex can connect to the V − 1 others, and each edge is counted from both ends. Four vertices allow at most 4 · 3 / 2 = 6 edges.

### Kinds of graphs

| Kind | What it means | Example |
|---|---|---|
| **Undirected** | Edges go both ways | Friendships: if Ana is friends with Ben, Ben is friends with Ana |
| **Directed** (a digraph) | Each edge goes one way, from a starting vertex to a terminating vertex | Web page links, one-way streets, course prerequisites |
| **Unweighted** | Edges have no numbers on them | "Is there a link?" |
| **Weighted** | Each edge has a weight (cost) | Miles between cities, minutes of travel time |
| **Cyclic** | Has at least one cycle: a path that starts and ends at the same vertex | A → B → C → A |
| **Acyclic** | Has no cycles | A family tree |
| **DAG** | A directed acyclic graph | Prerequisites (a topological sort needs one) |
| **Sparse** | Only a small share of the possible edges exist | Road maps, social networks |
| **Dense** | Close to the maximum number of edges | Every city with a direct flight to every other |
| **Connected / disconnected** | Every pair of vertices has a path, or not | See the table above |

A tree is a connected, acyclic, undirected graph. A tree with n nodes always has n − 1 edges.

## Where graphs are used

zyBooks 9.2 shows graphs modeling real systems. The pattern is always the same: decide what the vertices are and what the edges are.

| Application | Vertices | Edges | Question the graph answers |
|---|---|---|---|
| Road navigation | Intersections and destinations | Road segments, weighted by distance or travel time | The shortest or fastest route |
| Flights | Airports | Flights, weighted by time or cost | The cheapest trip with connections |
| Product recommendations | Products | Products that are often bought together | What to suggest next: the products adjacent to what you bought |
| Social and professional networks | People | Friendships or business contacts | Who to introduce: people at distance 2 |

A road map only needs a vertex where roads meet or where a trip can start or end. A long road with no intersections is one edge, however long it is.

## Representing a graph

zyBooks 9.3 and 9.4 cover the two standard ways to store a graph. Both use this small undirected graph:

```text
   P --- Q
   |   /
   |  /
   R     S
```

### Adjacency list

Each vertex keeps a list of the vertices adjacent to it.

```text
P: Q, R
Q: P, R
R: P, Q
S: (empty)
```

In an undirected graph, every edge shows up **twice**: P–Q puts Q in P's list and P in Q's list.

- **Space:** O(V + E). One list per vertex, one entry per edge end.
- **Is there an edge from X to Y?** Walk X's list. That's O(degree of X), and a vertex can have up to V − 1 neighbors, so zyBooks calls it O(V).
- Most real graphs are sparse, so the adjacency list is the usual choice.

### Adjacency matrix

A V × V grid of 0s and 1s. The entry in row X, column Y is 1 if there's an edge from X to Y.

```text
      P  Q  R  S
   P  0  1  1  0
   Q  1  0  1  0
   R  1  1  0  0
   S  0  0  0  0
```

- An undirected graph's matrix is **symmetric**: row X, column Y matches row Y, column X.
- **Space:** O(V²), however few edges there are. A graph with 10,000 vertices needs 100,000,000 entries, mostly 0s if the graph is sparse.
- **Is there an edge from X to Y?** Look at one entry: O(1). That is the matrix's strength.
- The grid records which pairs are connected and nothing else. If each vertex also carries data, such as a city's population, keep the vertices in their own list beside the matrix.

### Adding and removing vertices and edges

| Operation | Adjacency list | Adjacency matrix |
|---|---|---|
| Add a vertex | O(1): add an empty list | O(V²): build a bigger matrix and copy the old one in |
| Remove a vertex | O(V + E): remove its list, then remove it from every other vertex's list | O(V²): rebuild the matrix without its row and column |
| Add an edge | O(1): append to a list (twice if undirected) | O(1): set one entry (two if undirected) |
| Remove an edge | O(V): find it in the list | O(1): clear one entry |
| Is there an edge from X to Y? | O(V) worst case | O(1) |
| List all neighbors of X | O(degree of X) | O(V): scan the whole row |
| Space | O(V + E) | O(V²) |

zyBooks treats the matrix as a fixed two-dimensional array, which is why adding or removing a vertex means building a new one.

## Breadth-first search (BFS)

A **graph traversal** visits every vertex in some order. To **visit** a vertex means to do something with it, like print it or add it to a list.

**What BFS is for:** visiting vertices in order of their distance from a start vertex: the start, then everything 1 edge away, then 2 edges away, and so on. That makes it the way to find the fewest-edge path in an unweighted graph. Social networks use it to suggest people at distance 2. A peer-to-peer network uses it to find the nearest computer that has a file.

**How it works** (zyBooks' version):

1. Put the start vertex in a queue and mark it **discovered**.
2. While the queue isn't empty:
  1. Dequeue a vertex and **visit** it.
  2. For each of its neighbors that hasn't been discovered yet, mark it discovered and enqueue it.

zyBooks calls the vertices waiting in the queue the **frontier**: discovered but not yet visited. Marking a vertex discovered when it's enqueued stops it from being enqueued twice.

**A trace** on the graph from the start of the chapter, starting at A. Neighbors are taken in alphabetical order.

```text
   A --- B
   |     |
   C --- D
   |     |
   E --- F --- G

Dequeue  Visit  Enqueue (newly discovered)  Queue afterward
A        A      B, C                        B, C
B        B      D                           C, D
C        C      E   (A and D already found) D, E
D        D      F                           E, F
E        E      (none)                      F
F        F      G                           G
G        G      (none)                      empty

BFS order: A, B, C, D, E, F, G
Distance:  0  1  1  2  2  3  4
```

D is 2 edges from A along two different paths. BFS finds it once, at distance 2, and never again.

zyBooks points out that a BFS order isn't unique: vertices at the same distance can come out in any order, depending on the order of each adjacency list. The questions on this page always take neighbors in alphabetical order, so there is one right answer.

| Case | Big-O | Why |
|---|---|---|
| Best, average, worst (a full traversal) | O(V + E) | Each vertex is enqueued and dequeued once, and each adjacency list is scanned once |
| Best, when searching for one vertex and stopping early | O(1) | The target is the start vertex |

## Depth-first search (DFS)

**What DFS is for:** exploring as far as possible down one path before backing up and trying another. It's used to find whether a path exists, to detect cycles, to explore mazes, and (in other books) to build a topological sort.

### DFS with a stack (zyBooks' version)

1. Push the start vertex onto a stack.
2. While the stack isn't empty:
  1. Pop a vertex.
  2. If it hasn't been visited: visit it, then push **all** of its neighbors onto the stack, in adjacency-list order.

A vertex can be on the stack more than once. The visited check after each pop skips the copies. Because the last neighbor pushed is the first one popped, this version explores neighbors from the **end** of each list first.

**A trace** on the same graph, starting at A, with alphabetical adjacency lists (A: B, C. B: A, D. C: A, D, E. D: B, C, F. E: C, F. F: D, E, G. G: F). The stack's top is on the right.

```text
Pop  Visited?  Action                 Stack afterward
A    new       visit A, push B, C     B, C
C    new       visit C, push A, D, E  B, A, D, E
E    new       visit E, push C, F     B, A, D, C, F
F    new       visit F, push D, E, G  B, A, D, C, D, E, G
G    new       visit G, push F        B, A, D, C, D, E, F
F    yes       skip                   B, A, D, C, D, E
E    yes       skip                   B, A, D, C, D
D    new       visit D, push B, C, F  B, A, D, C, B, C, F
F, C yes       skip both              B, A, D, C, B
B    new       visit B, push A, D     B, A, D, C, A, D
(every remaining pop is already visited)

DFS order (stack): A, C, E, F, G, D, B
```

### Recursive DFS

zyBooks also gives a recursive version that uses the call stack instead of an explicit one:

1. If the vertex has already been visited, return right away.
2. Otherwise, visit it, then call DFS on each neighbor, in adjacency-list order.

The recursive version takes neighbors from the **front** of each list, so on the same graph it gives a different order:

```text
visit A → first neighbor B
  visit B → B's neighbors: A (visited), D
    visit D → D's neighbors: B (visited), C
      visit C → C's neighbors: A, D (visited), E
        visit E → E's neighbors: C (visited), F
          visit F → F's neighbors: D, E (visited), G
            visit G

DFS order (recursive): A, B, D, C, E, F, G
```

Both orders are valid depth-first searches. Each goes as deep as it can before backing up. Many other books (and many instructors) trace DFS the recursive way. If a question says "push the neighbors onto a stack," use the stack version.

| Case | Big-O | Why |
|---|---|---|
| Best, average, worst (a full traversal) | O(V + E) | Each vertex is visited once and each adjacency list is scanned once |
| Space | O(V) for the recursive version, O(E) for zyBooks' stack, which can hold one entry per edge end | |

### BFS or DFS?

| Feature | BFS | DFS |
|---|---|---|
| Uses a | Queue | Stack, or recursion |
| Visits | Closest vertices first, level by level | One path to its end, then backs up |
| Finds the fewest-edge path? | Yes | No |
| Time | O(V + E) | O(V + E) |

<div class="viz" data-viz="graph-search" markdown>

*On the site, an interactive diagram here steps through BFS, stack-based DFS, and recursive DFS on a 7-vertex graph, showing the queue or stack and the visit order.*

</div>

## Directed graphs

zyBooks 9.7. In a **directed graph**, each edge has a direction: it goes from a **starting vertex** to a **terminating vertex**. Draw it as an arrow.

```text
   K -----> L
   ^        |
   |        v
   N <----- M -----> O
```

- **Adjacency is one-way.** L is adjacent to K, because there's an edge K → L. K isn't adjacent to L.
- A **path** follows the arrows. K → L → M → O is a path. O → M isn't.
- A **cycle** is a path that starts and ends at the same vertex. K → L → M → N → K is a cycle, so this graph is **cyclic**. A directed graph with no cycle is **acyclic**.
- An **outgoing edge** of a vertex starts there. An **incoming edge** ends there. M has one incoming edge (from L) and two outgoing edges (to N and O).
- zyBooks defines a vertex's **degree** as all the edges that touch it, incoming plus outgoing, so M's degree is 3. Many other books split this into **in-degree** (1 for M) and **out-degree** (2 for M). Topological sort uses the in-degree.

## Weighted graphs

zyBooks 9.8. A **weighted graph** gives each edge a number: a cost, distance, time, or capacity. It can be directed or undirected.

- In a weighted graph, the **path length** is the **sum of the weights** along the path.
- The **shortest path** is the one with the smallest sum. It can have more edges than another path.
- Add up the weights on the way around a cycle and you get its **cycle length**. When that total is negative, the cycle is a **negative edge weight cycle**.
- If a negative cycle can be reached, **no shortest path exists**: every trip around the cycle makes the path shorter, forever.

```text
   P --2--> Q --2--> R
   |                 ^
   +--------7--------+

P → R directly: 7.   P → Q → R: 2 + 2 = 4, the shorter path, even with more edges.
```

## The Graph class in zyBooks

zyBooks 9.9 builds the Python classes that every algorithm in the rest of the chapter uses. You don't need to memorize the code. The ideas that matter:

- A **Vertex** holds only a label.
- An **Edge** holds a from-vertex, a to-vertex, and a weight. Every Edge is **directed**.
- The **Graph** keeps two dictionaries: `from_edges` maps each vertex to its outgoing edges, and `to_edges` maps each vertex to its incoming edges. `from_edges` works like an adjacency list.
- An **undirected edge** is stored as two directed edges, one each way.
- Adding an edge that already exists does nothing: `add_directed_edge` checks first, so there are no duplicate edges.
- An unweighted edge gets a default weight of 1.

## Dijkstra's shortest path

**What it's for:** finding the shortest path from one start vertex to **every** other vertex, in a graph whose edge weights are all **0 or more**. It's how a map app picks a route.

For each vertex, Dijkstra's algorithm works out two things:

- **distance:** the length of the shortest path from the start.
- **predecessor:** the vertex just before it on that path.

**How it works** (zyBooks' version):

1. Set every vertex's distance to ∞ and its predecessor to None. Set the start vertex's distance to 0.
2. Put every vertex in a list of **unvisited** vertices.
3. While unvisited vertices remain:
  1. Remove the unvisited vertex with the **smallest** distance. Call it the current vertex.
  2. For each edge out of the current vertex: add the current vertex's distance to the edge's weight. If that total beats the neighbor's distance, update the neighbor's distance, and set its predecessor to the current vertex.

Step 3.2 is called **relaxing** an edge. To read a path afterward, start at the destination and follow predecessors back to the start, then reverse the list. A vertex whose distance is still ∞ (predecessor None) can't be reached from the start.

**A trace.** A directed graph, starting at S:

```text
   S ---4---> A ---1---> C ---3---> D
   |          ^          ^          ^
   1          2          5          8
   v          |          |          |
   B ---------+----------+----------+

Edges: S→A 4, S→B 1, B→A 2, B→C 5, B→D 8, A→C 1, C→D 3

Remove  Relax edges                          S   A   B   C   D
start                                        0   ∞   ∞   ∞   ∞
S (0)   S→A: 0+4=4 < ∞    S→B: 0+1=1 < ∞     0   4   1   ∞   ∞
B (1)   B→A: 1+2=3 < 4    B→C: 1+5=6 < ∞
        B→D: 1+8=9 < ∞                       0   3   1   6   9
A (3)   A→C: 3+1=4 < 6                       0   3   1   4   9
C (4)   C→D: 4+3=7 < 9                       0   3   1   4   7
D (7)   (no outgoing edges)                  0   3   1   4   7

Predecessors: A ← B, B ← S, C ← A, D ← C
Path to D: D ← C ← A ← B ← S, so S → B → A → C → D, length 7
```

The direct edge S → A costs 4, but S → B → A costs only 3. Dijkstra's algorithm finds it because it handles B (distance 1) before A.

**Why it's greedy:** every round it takes the closest unvisited vertex and treats that distance as final. With no negative weights that's safe: any other route to that vertex has to go through vertices that are already at least as far away.

### Negative edge weights break Dijkstra

Dijkstra's algorithm is safe when every weight is 0 or more. An unweighted graph counts too: give every edge a weight of 1. Once any edge is negative, a vertex that was already removed can turn out to have a shorter path, and the algorithm never goes back to fix it. Use Bellman-Ford instead.

```text
   X ---1---> Y ---2---> W ---2---> V
   |                     ^
   4                    -4
   v                     |
   Z --------------------+

Remove  Result                                 W   V
X (0)   Y = 1, Z = 4                           ∞   ∞
Y (1)   W = 1 + 2 = 3                          3   ∞
W (3)   V = 3 + 2 = 5                          3   5
Z (4)   Z→W: 4 + (−4) = 0 < 3, so W = 0        0   5
V (5)   (no outgoing edges)                    0   5
```

W's distance drops to 0 after W was already removed, and W is never processed again. So V keeps 5, while the real shortest path X → Z → W → V has length 4 − 4 + 2 = 2.

| Version | Best | Average | Worst | Notes |
|---|---|---|---|---|
| Unsorted list (zyBooks' `remove_min`) | O(V²) | O(V²) | O(V²) | V removals, each scanning up to V vertices, plus O(E) relaxations |
| Binary-heap priority queue (most other books) | O((V + E) log V) | O((V + E) log V) | O((V + E) log V) | Each removal and each distance update costs O(log V) |

The list version is better for dense graphs, where E is close to V². The heap version is better for sparse graphs.

<div class="viz" data-viz="dijkstra" markdown>

*On the site, an interactive diagram here runs Dijkstra's algorithm one relaxation at a time on a 6-vertex weighted graph, with a distance and predecessor table.*

</div>

## Bellman-Ford shortest path

**What it's for:** the same job as Dijkstra (shortest paths from one start vertex), but it **allows negative edge weights**, and it **detects negative cycles**.

**How it works** (zyBooks' version):

1. Set every distance to ∞ and every predecessor to None. Set the start vertex's distance to 0.
2. Repeat **V − 1** times (the main iterations):
  - Go through **every vertex**, in some fixed order. For each edge out of it, relax the edge exactly as Dijkstra does.
3. Then go through every edge one more time. If any edge can **still** shorten a distance, there's a negative cycle: return False. Otherwise return True.

Why V − 1 passes? A shortest path without a cycle has at most V − 1 edges. Each pass is sure to fix at least one more edge of every shortest path, wherever the vertex order puts it.

The final distances are the same for any vertex order. The table **after each pass** depends on the order, so zyBooks' questions always say which order to use.

**A trace** on the graph that fooled Dijkstra, starting at X, processing vertices in the order V, W, X, Y, Z:

```text
Pass 1
  V: distance ∞, nothing to relax from
  W: distance ∞, nothing to relax from
  X: X→Y: 0+1 = 1 < ∞, Y = 1 (pred X)   X→Z: 0+4 = 4 < ∞, Z = 4 (pred X)
  Y: Y→W: 1+2 = 3 < ∞, W = 3 (pred Y)
  Z: Z→W: 4−4 = 0 < 3, W = 0 (pred Z)
  After pass 1:  V ∞   W 0   X 0   Y 1   Z 4

Pass 2
  W: W→V: 0+2 = 2 < ∞, V = 2 (pred W)
  (no other change)
  After pass 2:  V 2   W 0   X 0   Y 1   Z 4

Passes 3 and 4: no change.
Check pass: no edge can improve anything, so there's no negative cycle. Return True.

Path to V: V ← W ← Z ← X, so X → Z → W → V, length 2
```

V was still ∞ after pass 1, because V came before W in the order. With a different order, it might have been finished in one pass.

### Detecting a negative cycle

```text
   A ---4---> B ---1---> C ---2---> D
              ^          |
              +----−3----+

Edges: A→B 4, B→C 1, C→B −3, C→D 2
Cycle B → C → B has length 1 − 3 = −2.
```

After the V − 1 = 3 passes (order A, B, C, D), the distances are A 0, B −2, C 1, D 3. In the check pass, B → C gives −2 + 1 = −1 < 1. A distance still improved, so a negative cycle exists, and the algorithm returns False. Every lap around the cycle would knock another 2 off.

| Case | Big-O | Why |
|---|---|---|
| Best, average, worst (zyBooks' code) | O(V·E) | V − 1 passes, and each pass relaxes all E edges |
| Best, with an early stop when a pass changes nothing (some books add this) | O(E) | One pass with no changes, then stop |

### Dijkstra (greedy) vs Bellman-Ford (dynamic programming)

| Feature | Dijkstra | Bellman-Ford |
|---|---|---|
| Strategy | **Greedy**: lock in the closest vertex each round, never revisit it | **Dynamic programming**: build the best paths of up to 1 edge, then up to 2 edges, and so on, reusing the results of the last pass |
| Negative edge weights | No | Yes |
| Finds negative cycles | No | Yes |
| Time | O(V²) with a list, O((V + E) log V) with a heap | O(V·E) |
| Use it when | All weights are 0 or more and you want speed | Some weights are negative |

## Topological sort

**What it's for:** ordering the vertices of a **directed acyclic graph** so that for every edge X → Y, X comes before Y. If edges mean "must happen before," a topological sort is an order you can do the tasks in: course prerequisites, build steps, a recipe.

- The graph must be **directed** (an undirected edge has no "before") and **acyclic** (in a cycle, every vertex would have to come before itself).
- It doesn't need weights.
- A DAG usually has **several** valid topological sorts.

To check an ordering, look at every edge X → Y. If X comes before Y for all of them, the ordering is valid. One edge going backward makes it invalid.

**How it works** (zyBooks' version, which other books call **Kahn's algorithm**):

1. Count each vertex's incoming edges (its in-degree).
2. Put every vertex with a count of 0 into a collection.
3. While the collection isn't empty:
  1. Remove a vertex and add it to the result.
  2. For each of its outgoing edges, subtract 1 from the to-vertex's count. If the count reaches 0, add that vertex to the collection.

zyBooks says the collection can be a queue, a stack, or a set: any of them gives a valid result. **zyBooks' code uses a stack** (a Python list, `pop()` from the end), filled first in the graph's vertex order. That choice decides which valid ordering comes out.

**A trace:**

```text
   A ---> C ---> E ---> F
          ^      ^
   B -----+      |
   |             |
   +----> D -----+

Edges: A→C, B→C, B→D, C→E, D→E, E→F
Counts: A 0, B 0, C 2, D 1, E 2, F 1

Stack (top on right)  Pop  Result so far     Count changes
A, B                  B    B                 C 2→1, D 1→0: push D
A, D                  D    B, D              E 2→1
A                     A    B, D, A           C 1→0: push C
C                     C    B, D, A, C        E 1→0: push E
E                     E    B, D, A, C, E     F 1→0: push F
F                     F    B, D, A, C, E, F

Result: B, D, A, C, E, F
```

With a queue instead of a stack, A would come out first: A, B, C, D, E, F. Both are valid.

Many other books build a topological sort with DFS instead: run DFS, record each vertex when it **finishes** (after all its descendants), then reverse that list. It's also O(V + E).

| Case | Big-O | Why |
|---|---|---|
| Best, average, worst | O(V + E) | Counting is O(V + E), each vertex enters and leaves the collection once, and each edge is followed once |
| Extra space | O(V) | The counts, the collection, and the result |

The last vertex in the result has no outgoing edges, and the first one has no incoming edges.

## Minimum spanning tree

**What it's for:** connecting every vertex of a **weighted, connected, undirected** graph using the cheapest possible set of edges, like laying the least cable to connect every building. The result is a **minimum spanning tree (MST)**:

- **spanning:** it reaches every vertex.
- **tree:** no cycles, so it has exactly **V − 1** edges.
- **minimum:** the smallest possible **sum of edge weights**.

If the graph is disconnected, no spanning tree exists. When several edges share a weight, there can be more than one MST, all with the same total.

### Kruskal's algorithm (the one zyBooks uses)

1. Put every edge in a priority queue (or a sorted list), lowest weight first.
2. Start with each vertex in its own set. Each set is a group of vertices already connected by chosen edges.
3. While edges remain: remove the lightest edge. If its two vertices are in **different** sets, add the edge to the tree and merge the two sets. If they're in the **same** set, skip it: it would close a cycle.

**A trace:**

```text
       A
    4 / \ 1
     /   \
    B --3-- C
    |     / |
    2   7   6
    |  /    |
    D --5-- E

Edge  Weight  Sets before                     Action
AC    1       {A} {B} {C} {D} {E}             add, merge to {A,C}
BD    2       {A,C} {B} {D} {E}               add, merge to {B,D}
BC    3       {A,C} {B,D} {E}                 add, merge to {A,B,C,D}
AB    4       {A,B,C,D} {E}                   skip: A and B are already connected
DE    5       {A,B,C,D} {E}                   add, merge to {A,B,C,D,E}
CE    6       {A,B,C,D,E}                     skip
CD    7       {A,B,C,D,E}                     skip

Tree: AC, BD, BC, DE.   4 edges for 5 vertices.   Total weight 1 + 2 + 3 + 5 = 11
```

Kruskal's algorithm is **greedy**: it always grabs the cheapest edge that doesn't make a cycle, and never takes one back. The lightest edge in the graph is always in the tree.

| Case | Big-O | Why |
|---|---|---|
| Best, average, worst | O(E log E) | Sorting (or adding and removing every edge from a priority queue) costs O(E log E). With a good set structure, each lookup and merge is close to O(1). |
| Extra space | O(V + E) | The edge queue, the vertex sets, and the result |

O(E log E) is the same as O(E log V), the form on the [cheat sheet](big-o.md#graphs): E is at most V², so log E is at most 2 log V.

**Prim's algorithm** is the other well-known MST algorithm. zyBooks doesn't cover it. It grows one tree from a start vertex, always adding the cheapest edge from the tree to a vertex not yet in it. It's also greedy and gives the same total weight.

## All pairs shortest path

**What it's for:** the shortest path length between **every** pair of vertices at once, stored in a V × V matrix. The entry at row X, column Y is the shortest distance **from X to Y**. The matrix holds only lengths. Rebuilding a path takes an extra step, shown below.

### Floyd-Warshall

Floyd-Warshall allows negative edge weights, but not negative cycles.

1. Fill the matrix with ∞.
2. Set every entry from a vertex to itself to 0.
3. For each edge X → Y, set entry (X, Y) to the edge's weight.
4. For each vertex K, in order (the main loop):
  - For every pair (X, Y): if going from X to K, then K to Y, is shorter than the current (X, Y) entry, replace the entry with that sum.

After the round for K, every entry is the shortest path that's allowed to pass through K and any vertex handled before it. After the last round, every path is allowed.

**A trace:**

```text
Edges: A→B 4, A→C 9, B→C 2, C→B −1

Start         K = A          K = B          K = C (final)
   A  B  C       A  B  C        A  B  C        A  B  C
A  0  4  9    A  0  4  9     A  0  4  6     A  0  4  6
B  ∞  0  2    B  ∞  0  2     B  ∞  0  2     B  ∞  0  2
C  ∞ −1  0    C  ∞ −1  0     C  ∞ −1  0     C  ∞ −1  0

K = A: no edge leads into A, so nothing can go through it.
K = B: A→B→C is 4 + 2 = 6 < 9, so (A, C) becomes 6.
K = C: A→C→B is 6 − 1 = 5, which doesn't beat 4. No change.
```

B and C have no path back to A, so their A column stays ∞.

### Rebuilding a path from the matrix

zyBooks rebuilds a path backward from the destination. To find the path from S to T:

1. Start at T.
2. Look at each edge U → (current vertex). If the distance from S to U, plus the edge's weight, equals the distance from S to the current vertex, that edge is on the path. Move to U.
3. Stop when you reach S, then reverse the edges you collected.

In the trace above, the path from A to C (length 6): C's incoming edges are A→C (0 + 9 ≠ 6) and B→C (4 + 2 = 6, yes). Move to B. B's incoming edges are A→B (0 + 4 = 4, yes) and C→B (6 − 1 = 5 ≠ 4). Reached A. The path is A → B → C.

| Case | Big-O | Why |
|---|---|---|
| Best, average, worst | O(V³) | Three nested loops over the vertices |
| Space | O(V²) | The matrix |

Floyd-Warshall is **dynamic programming**: each round builds on the matrix the last round left.

## Big-O summary

V is the number of vertices and E the number of edges. These match the [cheat sheet](big-o.md#graphs).

| Algorithm | Best | Average | Worst | Strategy |
|---|---|---|---|---|
| BFS (full traversal) | O(V + E) | O(V + E) | O(V + E) | Queue |
| DFS (full traversal) | O(V + E) | O(V + E) | O(V + E) | Stack or recursion |
| Dijkstra, unsorted list (zyBooks) | O(V²) | O(V²) | O(V²) | Greedy |
| Dijkstra, binary heap | O((V + E) log V) | O((V + E) log V) | O((V + E) log V) | Greedy |
| Bellman-Ford | O(V·E) | O(V·E) | O(V·E) | Dynamic programming |
| Topological sort | O(V + E) | O(V + E) | O(V + E) | In-degree counts |
| Kruskal's MST | O(E log E) | O(E log E) | O(E log E) | Greedy |
| Floyd-Warshall | O(V³) | O(V³) | O(V³) | Dynamic programming |

| Operation | Adjacency list | Adjacency matrix |
|---|---|---|
| Space | O(V + E) | O(V²) |
| Is there an edge from X to Y? | O(V) worst case (O(degree of X)) | O(1) |
| List X's neighbors | O(degree of X) | O(V) |
| Add a vertex | O(1) | O(V²) |
| Remove a vertex | O(V + E) | O(V²) |
| Add an edge | O(1) | O(1) |
| Remove an edge | O(V) | O(1) |

## Questions

- **9.1** Graph vocabulary. Use this undirected graph:

  ```text
     J ----- K        N
     |     / |        |
     |   /   |        |
     | /     |        O
     L ----- M
  ```

  | Question | Answer |
  |---|---|
  | How many vertices? | |
  | How many edges? | |
  | The degree of K | |
  | The distance from J to M | |
  | Is the graph connected? (Yes or No) | |
  | The most edges any undirected graph with this many vertices can have | |

  <!-- answer:9.1a-f table: 6; 6; 3; 2; No; 15 -->

  <details>
  <summary>Answer</summary>

  - J, K, L, M, N, O: **6** vertices. The edges are J–K, J–L, K–L, K–M, L–M, and N–O: **6**.
  - K touches J, L, and M: degree **3**.
  - J isn't adjacent to M, but J → K → M is 2 edges: distance **2**.
  - There's no path from J to N, so the graph is **not connected**.
  - 6 · 5 / 2 = **15**.

  </details>

- **9.2** Representations.

  **a)** Pick the Big-O of each operation, using the costs on this page.

  | Operation | Big-O |
  |---|---|
  | Space for an adjacency list | |
  | Space for an adjacency matrix | |
  | Check for an edge from X to Y in an adjacency matrix | |
  | Check for an edge from X to Y in an adjacency list (worst case) | |
  | Add an edge to an adjacency matrix | |
  | Add a vertex to an adjacency matrix | |
  | Remove a vertex from an adjacency list | |

  <!-- answer:9.2a-g table [O(1), O(V), O(V + E), O(V²)]: O(V + E); O(V²); O(1); O(V); O(1); O(V²); O(V + E) -->

  **b)** A graph has 50,000 vertices, and each vertex has about 4 edges. Which representation fits it better?

  A. Adjacency matrix, because checking for an edge is O(1)

  B. Adjacency list, because the graph is sparse and a matrix would need 2.5 billion entries

  C. Either one: they use the same space

  <!-- answer:9.2b choice: B -->

  <details>
  <summary>Answer</summary>

  - **a)** A list stores one entry per vertex and per edge end: **O(V + E)**. A matrix always has V × V entries: **O(V²)**. A matrix edge check reads one entry: **O(1)**. A list edge check walks X's list, which can hold up to V − 1 vertices: **O(V)**. Adding an edge to a matrix sets one entry: **O(1)**. Adding a vertex to a fixed-size matrix means building a bigger one and copying: **O(V²)**. Removing a vertex from a list means deleting it from every other list: **O(V + E)**.
  - **b)** **B.** About 100,000 edges is tiny next to the 50,000² entries a matrix needs. The list uses O(V + E) space.

  </details>

- **9.3** BFS and DFS. Use this undirected graph, with every adjacency list in alphabetical order. Separate the vertices with commas.

  ```text
     P --- Q --- R
     |     |     |
     S --- T --- U --- V
  ```

  **a)** What is the BFS visit order starting at P?

  <!-- answer:9.3a blanks: P, Q, S, R, T, U, V | P,Q,S,R,T,U,V -->

  **b)** What is the distance from P to V?

  <!-- answer:9.3b blanks: 4 -->

  **c)** What is the visit order of zyBooks' stack-based DFS starting at P? (Pop a vertex; if it's new, visit it and push all its neighbors in list order.)

  <!-- answer:9.3c blanks: P, S, T, U, V, R, Q | P,S,T,U,V,R,Q -->

  **d)** What is the visit order of the recursive DFS starting at P?

  <!-- answer:9.3d blanks: P, Q, R, U, T, S, V | P,Q,R,U,T,S,V -->

  <details>
  <summary>Answer</summary>

  The adjacency lists are P: Q, S. Q: P, R, T. R: Q, U. S: P, T. T: Q, S, U. U: R, T, V. V: U.

  - **a)** Visit P, enqueue Q and S. Visit Q, enqueue R and T. Visit S (T is already discovered). Visit R, enqueue U. Visit T. Visit U, enqueue V. Visit V. **P, Q, S, R, T, U, V**.
  - **b)** P → Q → R → U → V, or P → Q → T → U → V: **4** edges. BFS reached V last, at distance 4.
  - **c)** Pop P: visit, push Q, S. Pop S: visit, push P, T. Pop T: visit, push Q, S, U. Pop U: visit, push R, T, V. Pop V: visit, push U. Pop U and T: already visited. Pop R: visit, push Q, U. Pop U: skip. Pop Q: visit. **P, S, T, U, V, R, Q**.
  - **d)** P → Q (first neighbor) → R (Q's first unvisited) → U → T (U's first unvisited) → S. S's neighbors are all visited, so back up to U, whose last neighbor is V. **P, Q, R, U, T, S, V**.

  </details>

- **9.4** Dijkstra's algorithm. Run it on this directed graph, starting at H. When two vertices tie for the smallest distance, take the one that comes first in the order H, J, K, L, M, N.

  ```text
  H → J  7      J → L  2      L → M  1
  H → K  2      J → M  6      L → N  2
  K → J  3      K → L  8      M → N  3
  ```

  **a)** What is each vertex's final distance?

  <!-- answer:9.4a blanks: J => 5; K => 2; L => 7; M => 8; N => 9 -->

  **b)** In what order are the vertices removed from the unvisited list? Separate them with commas.

  <!-- answer:9.4b blanks: H, K, J, L, M, N | H,K,J,L,M,N -->

  **c)** What is the shortest path from H to N? Separate the vertices with commas.

  <!-- answer:9.4c blanks: H, K, J, L, N | H,K,J,L,N -->

  <details>
  <summary>Answer</summary>

  ```text
  Remove  Updates                                   J   K   L   M   N
  H (0)   J = 7, K = 2                              7   2   ∞   ∞   ∞
  K (2)   J: 2+3 = 5 < 7.  L: 2+8 = 10              5   2  10   ∞   ∞
  J (5)   L: 5+2 = 7 < 10.  M: 5+6 = 11             5   2   7  11   ∞
  L (7)   M: 7+1 = 8 < 11.  N: 7+2 = 9              5   2   7   8   9
  M (8)   N: 8+3 = 11, not < 9                      5   2   7   8   9
  N (9)   (no outgoing edges)
  ```

  - **a)** **J 5, K 2, L 7, M 8, N 9.**
  - **b)** **H, K, J, L, M, N**: always the smallest distance left.
  - **c)** N's predecessor is L, L's is J, J's is K, and K's is H. Reversed: **H, K, J, L, N**, length 2 + 3 + 2 + 2 = 9.

  </details>

- **9.5** Bellman-Ford. Run it on this directed graph, starting at Q. Each pass processes the vertices in the order Q, R, S, T.

  ```text
  Q → R   6        S → R  −2
  Q → S   3        R → T   4
                   S → T   7
  ```

  **a)** What are the distances after the **first** pass?

  <!-- answer:9.5a blanks: R => 1; S => 3; T => 10 -->

  **b)** What is T's final distance?

  <!-- answer:9.5b blanks: 5 -->

  **c)** How many main passes does zyBooks' code make on this graph, before the negative-cycle check?

  <!-- answer:9.5c blanks: 3 -->

  **d)** This graph passes the check. Suppose that on some other graph, the check pass finds an edge that still shortens a distance. What does that mean?

  A. The vertex order was wrong, so the algorithm should run again in another order

  B. A negative edge weight cycle can be reached, so no shortest path exists, and the algorithm returns False

  C. The graph has a negative edge, so Dijkstra's algorithm should be used instead

  <!-- answer:9.5d choice: B -->

  <details>
  <summary>Answer</summary>

  - **a)** Pass 1: Q sets R = 6 and S = 3. R sets T = 6 + 4 = 10. S sets R = 3 − 2 = 1 (better than 6), and S → T gives 3 + 7 = 10, which doesn't beat 10. T has no outgoing edges. **R 1, S 3, T 10.**
  - **b)** Pass 2: R → T gives 1 + 4 = 5 < 10. Pass 3 changes nothing. **5**, along Q → S → R → T.
  - **c)** V − 1 = 4 − 1 = **3**. zyBooks' code always makes all of them, even when a pass changes nothing.
  - **d)** **B.** After V − 1 passes, every shortest path is final unless there's a negative cycle. Dijkstra's algorithm can't handle negative weights at all.

  </details>

- **9.6** Topological sort. Use this directed acyclic graph:

  ```text
  Q → P      P → S      S → T      T → U
  Q → R      R → T      S → U
  ```

  **a)** Run zyBooks' algorithm. The collection is a stack, first filled in the order P, Q, R, S, T, U, and `pop()` takes the last vertex added. What is the result? Separate the vertices with commas.

  <!-- answer:9.6a blanks: Q, R, P, S, T, U | Q,R,P,S,T,U -->

  **b)** Is each ordering a valid topological sort?

  | Ordering | Valid? |
  |---|---|
  | Q, P, R, S, T, U | |
  | Q, R, P, S, U, T | |
  | P, Q, R, S, T, U | |
  | Q, P, S, R, T, U | |

  <!-- answer:9.6b-e table [Valid, Invalid]: Valid; Invalid; Invalid; Valid -->

  <details>
  <summary>Answer</summary>

  - **a)** Counts: P 1, Q 0, R 1, S 1, T 2, U 2. Only Q starts at 0.

    ```text
    Stack   Pop  Result              Changes
    Q       Q    Q                   P→0 push, R→0 push
    P, R    R    Q, R                T 2→1
    P       P    Q, R, P             S→0 push
    S       S    Q, R, P, S          T→0 push, U 2→1
    T       T    Q, R, P, S, T       U→0 push
    U       U    Q, R, P, S, T, U
    ```

    **Q, R, P, S, T, U**.

  - **b)**
    - Q, P, R, S, T, U: every edge points forward. **Valid.**
    - Q, R, P, S, U, T: the edge T → U points backward. **Invalid.**
    - P, Q, R, S, T, U: the edge Q → P points backward. **Invalid.**
    - Q, P, S, R, T, U: every edge points forward. **Valid.**

  </details>

- **9.7** Minimum spanning tree and all-pairs shortest paths.

  Kruskal's algorithm runs on this undirected graph:

  ```text
  P–Q  7      Q–S  2      S–T   8
  P–R  3      R–S  9      S–U   5
  Q–R  6      R–T  4      T–U  10
  ```

  **a)** What is the first edge added to the tree? (Write it like `XY`.)

  <!-- answer:9.7a blanks: QS | SQ -->

  **b)** What is the first edge skipped?

  <!-- answer:9.7b blanks: PQ | QP -->

  **c)** What is the tree's total weight?

  <!-- answer:9.7c blanks: 20 -->

  **d)** Floyd-Warshall runs on a different directed graph, with edges P → Q 5, Q → R 2, R → P −3, and P → R 9. What are these final matrix entries?

  <!-- answer:9.7d blanks: P to R => 7; R to Q => 2; Q to P => -1 | −1 -->

  <details>
  <summary>Answer</summary>

  - **a)** The lightest edge is Q–S (2). Q and S are in different sets, so **QS** is added.
  - **b)** Then P–R (3), R–T (4), S–U (5), and Q–R (6) are added. Q–R joins {Q, S, U} and {P, R, T}. The next edge, P–Q (7), has both ends in the same set: **PQ** is skipped.
  - **c)** 2 + 3 + 4 + 5 + 6 = **20**, with 5 edges for 6 vertices.
  - **d)**

    ```text
    Start          K = P          K = Q          K = R (final)
       P  Q  R        P  Q  R        P  Q  R        P  Q  R
    P  0  5  9     P  0  5  9     P  0  5  7     P  0  5  7
    Q  ∞  0  2     Q  ∞  0  2     Q  ∞  0  2     Q −1  0  2
    R −3  ∞  0     R −3  2  0     R −3  2  0     R −3  2  0
    ```

    - K = P: R → P → Q is −3 + 5 = 2.
    - K = Q: P → Q → R is 5 + 2 = 7 < 9.
    - K = R: Q → R → P is 2 − 3 = −1.
    - **P to R = 7, R to Q = 2, Q to P = −1.**

  </details>

- **9.8** Choosing an algorithm.

  **a)** Pick each algorithm's Big-O and its strategy.

  | Algorithm | Big-O | Strategy |
  |---|---|---|
  | BFS | | |
  | DFS | | |
  | Dijkstra, with zyBooks' unsorted list | | |
  | Bellman-Ford | | |
  | Topological sort | | |
  | Kruskal's MST | | |
  | Floyd-Warshall | | |

  <!-- answer:9.8a-n table [O(V + E), O(V²), O(V·E), O(E log E), O(V³)] [Greedy, Dynamic programming, Neither]: O(V + E); Neither; O(V + E); Neither; O(V²); Greedy; O(V·E); Dynamic programming; O(V + E); Neither; O(E log E); Greedy; O(V³); Dynamic programming -->

  **b)** A delivery app needs the cheapest route from one depot to every stop. Some edges carry a rebate, so their weight is negative, and there are no negative cycles. Which algorithm fits?

  A. Dijkstra's algorithm

  B. Bellman-Ford

  C. Breadth-first search

  D. Kruskal's algorithm

  <!-- answer:9.8b choice: B -->

  **c)** A game needs the fewest moves between two squares on a board, where every move costs the same. Which algorithm is the simplest fit?

  A. Breadth-first search

  B. Depth-first search

  C. Floyd-Warshall

  D. Topological sort

  <!-- answer:9.8c choice: A -->

  <details>
  <summary>Answer</summary>

  - **a)**
    - BFS and DFS touch every vertex and edge once: **O(V + E)**. They're traversals, so **neither** strategy.
    - zyBooks' Dijkstra scans the unvisited list V times: **O(V²)**. It locks in the closest vertex each round: **greedy**.
    - Bellman-Ford makes V − 1 passes over E edges: **O(V·E)**. Each pass builds on the last: **dynamic programming**.
    - Topological sort: **O(V + E)**, **neither**.
    - Kruskal sorts the edges: **O(E log E)** (the same as O(E log V)). It always takes the cheapest safe edge: **greedy**.
    - Floyd-Warshall has three nested loops over the vertices: **O(V³)**. Each round reuses the last matrix: **dynamic programming**.
  - **b)** **B.** Negative weights rule out Dijkstra. BFS ignores weights. Kruskal builds a spanning tree, which doesn't give shortest paths.
  - **c)** **A.** With equal costs, the fewest-edge path is the shortest, and BFS finds it in O(V + E).

  </details>
