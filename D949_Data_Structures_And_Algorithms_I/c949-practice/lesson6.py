"""Lesson 6: Graphs.

Run `python lesson6.py` to check your work (`--demo` also runs the lesson code).
"""
import heapq
from collections import deque

from _checker import need, run


# ---------------------------------------------------------------- lesson code
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


# ------------------------------------------------------------------ exercises

# 6.1 Trace (paper first). Run Dijkstra by hand from 'S' on W2 and give the
# final distance to every vertex.
W2 = {'S': {'A': 7, 'B': 2}, 'A': {'T': 1}, 'B': {'A': 3, 'T': 8}, 'T': {}}
TRACE_6_1 = None   # {'S': 0, 'A': ?, 'B': ?, 'T': ?}


def shortest_path(g, start, goal):
    """6.2 Vertex list of a fewest-edges path (BFS + predecessor map). None if unreachable."""
    raise NotImplementedError


def dfs_iter(g, start):
    """6.3 DFS with an explicit stack, same visit order as the recursive dfs."""
    raise NotImplementedError


def count_components(g):
    """6.4 Number of connected components in an undirected graph."""
    raise NotImplementedError


def topo_sort(g):
    """6.5 Kahn's algorithm. Edge X -> Y means X comes before Y. Raise ValueError on a cycle."""
    raise NotImplementedError


def to_matrix(g):
    """6.6 Return (sorted_names, adjacency_matrix) with 1 where an edge exists."""
    raise NotImplementedError


# --------------------------------------------------------------------- checks
def check_6_1():
    """6.1 trace Dijkstra"""
    assert dict(need(TRACE_6_1)) == dijkstra(W2, 'S'), f'{TRACE_6_1} is not right'


def check_6_2():
    """6.2 shortest_path"""
    assert shortest_path(graph, 'A', 'F') == ['A', 'C', 'F']
    assert shortest_path(graph, 'D', 'C') == ['D', 'B', 'A', 'C']
    assert shortest_path({'X': [], 'Y': []}, 'X', 'Y') is None


def check_6_3():
    """6.3 dfs_iter"""
    assert dfs_iter(graph, 'A') == dfs(graph, 'A')
    assert dfs_iter(graph, 'F') == dfs(graph, 'F')


def check_6_4():
    """6.4 count_components"""
    islands = {1: [2], 2: [1], 3: [], 4: [5], 5: [4]}
    assert count_components(islands) == 3
    assert count_components(graph) == 1


def check_6_5():
    """6.5 topo_sort"""
    tasks = {'shop': ['cook'], 'cook': ['eat'], 'set_table': ['eat'], 'eat': []}
    order = topo_sort(tasks)
    assert sorted(order) == sorted(tasks)
    assert order.index('shop') < order.index('cook') < order.index('eat')
    assert order.index('set_table') < order.index('eat')
    try:
        topo_sort({'a': ['b'], 'b': ['a']})
    except ValueError:
        pass
    else:
        raise AssertionError('a cycle should raise ValueError')


def check_6_6():
    """6.6 to_matrix"""
    names, m = to_matrix(graph)
    assert names == ['A', 'B', 'C', 'D', 'E', 'F']
    assert m[0] == [0, 1, 1, 0, 0, 0]
    assert all(m[i][j] == m[j][i] for i in range(6) for j in range(6)), 'not symmetric'


CHECKS = [check_6_1, check_6_2, check_6_3, check_6_4, check_6_5, check_6_6]

if __name__ == '__main__':
    run(CHECKS, demo)
