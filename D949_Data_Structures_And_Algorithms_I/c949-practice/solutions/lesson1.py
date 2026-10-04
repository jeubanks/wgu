"""Lesson 1: Big-O by experiment.

Run `python lesson1.py` to check your work, or `python lesson1.py --demo`
to also run the timing demo from the lesson.
"""
import time

from _checker import big_o, need, run


# ---------------------------------------------------------------- lesson code
def time_it(func, n):
    data = list(range(n))
    start = time.perf_counter()
    func(data)
    return time.perf_counter() - start


def linear(data):            # O(n): one pass
    total = 0
    for x in data:
        total += x
    return total


def quadratic(data):         # O(n^2): loop inside a loop
    count = 0
    for a in data:
        for b in data:
            count += 1
    return count


def halving(data):           # O(log n): problem halves each step
    n, steps = len(data), 0
    while n > 1:
        n //= 2
        steps += 1
    return steps


def demo():
    for n in (500, 1000, 2000):
        print(n, f'linear={time_it(linear, n):.5f}s',
              f'quadratic={time_it(quadratic, n):.5f}s')
    print(halving(list(range(1_000_000))))   # 19


# ------------------------------------------------------------------ exercises

# 1.1 Classify (paper first). Fill in the Big-O of each snippet as a string,
# e.g. 'O(n)', 'O(log n)', 'O(n^2)', 'O(n*m)'.
#
#   a: for i in range(n):          b: i = 1
#          for j in range(10):          while i < n:
#              print(i, j)                  i *= 2
#
#   c: for i in range(n):          d: for x in list_a:
#          for j in range(i):              for y in list_b:
#              print(i, j)                     print(x, y)
ANSWERS_1_1 = {'a': 'O(n)', 'b': 'O(log n)', 'c': 'O(n^2)', 'd': 'O(n*m)'}


def binary_search_max_comparisons(n):
    """1.2 Most comparisons binary search can need on n items."""
    steps = 0
    while n > 0:
        steps += 1
        n //= 2
    return steps


def fib(n):
    """1.3a Naive recursive Fibonacci."""
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)


# 1.3b How many calls does fib(20) make in total? (Count them with a global
# counter, then write the number here.)
FIB_20_CALLS = 21891


def fib_memo(n, memo=None):
    """1.3c Fibonacci in O(n) using a dict cache."""
    if memo is None:
        memo = {}
    if n < 2:
        return n
    if n not in memo:
        memo[n] = fib_memo(n - 1, memo) + fib_memo(n - 2, memo)
    return memo[n]


def sum_list(items):
    """1.4 Recursive sum, no loops."""
    if not items:
        return 0
    return items[0] + sum_list(items[1:])


# --------------------------------------------------------------------- checks
def check_1_1():
    """1.1 classify snippets"""
    expected = {'a': 'o(n)', 'b': 'o(logn)', 'c': 'o(n^2)', 'd': 'o(nm)'}
    for k, want in expected.items():
        got = big_o(ANSWERS_1_1[k])
        assert got == want, f'snippet {k}: {ANSWERS_1_1[k]!r} is not right'


def check_1_2():
    """1.2 binary_search_max_comparisons"""
    assert binary_search_max_comparisons(1024) == 11
    assert binary_search_max_comparisons(1) == 1
    assert binary_search_max_comparisons(1_000_000) == 20


def check_1_3():
    """1.3 fib, call count, fib_memo"""
    assert fib(20) == 6765
    assert need(FIB_20_CALLS) == 21891, 'recount the calls to fib(20)'
    assert fib_memo(20) == 6765
    assert fib_memo(90) == 2880067194370816120


def check_1_4():
    """1.4 sum_list"""
    assert sum_list([4, 5, 6]) == 15
    assert sum_list([]) == 0


CHECKS = [check_1_1, check_1_2, check_1_3, check_1_4]

if __name__ == '__main__':
    run(CHECKS, demo)
