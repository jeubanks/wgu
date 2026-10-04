"""Lesson 5: Searching and sorting.

Run `python lesson5.py` to check your work (`--demo` also runs the lesson code).
"""
import random
import sys
import time

from _checker import need, run


# ---------------------------------------------------------------- lesson code
def binary_search(a, target):                  # O(log n), a must be sorted
    lo, hi = 0, len(a) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if a[mid] == target:
            return mid
        if a[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1


def bubble_sort(a):                             # O(n^2), stable
    n = len(a)
    for i in range(n - 1):
        swapped = False
        for j in range(n - 1 - i):
            if a[j] > a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]
                swapped = True
        if not swapped:                         # best case O(n)
            break


def selection_sort(a):                          # O(n^2) always
    for i in range(len(a) - 1):
        m = i
        for j in range(i + 1, len(a)):
            if a[j] < a[m]:
                m = j
        a[i], a[m] = a[m], a[i]


def insertion_sort(a):                          # O(n^2), O(n) if nearly sorted
    for i in range(1, len(a)):
        key, j = a[i], i - 1
        while j >= 0 and a[j] > key:
            a[j + 1] = a[j]
            j -= 1
        a[j + 1] = key


def merge_sort(a):                              # O(n log n), O(n) extra
    if len(a) <= 1:
        return a
    mid = len(a) // 2
    left, right = merge_sort(a[:mid]), merge_sort(a[mid:])
    out, i, j = [], 0, 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:                 # <= keeps it stable
            out.append(left[i])
            i += 1
        else:
            out.append(right[j])
            j += 1
    return out + left[i:] + right[j:]


def quicksort(a, lo=0, hi=None):                # avg O(n log n), worst O(n^2)
    if hi is None:
        hi = len(a) - 1
    if lo >= hi:
        return
    pivot = a[hi]                               # Lomuto partition, last item as pivot
    i = lo
    for j in range(lo, hi):
        if a[j] < pivot:
            a[i], a[j] = a[j], a[i]
            i += 1
    a[i], a[hi] = a[hi], a[i]
    quicksort(a, lo, i - 1)
    quicksort(a, i + 1, hi)


def demo():
    data = [29, 10, 14, 37, 13]
    for sort in (bubble_sort, selection_sort, insertion_sort, quicksort):
        d = data[:]
        sort(d)
        print(sort.__name__, d)                 # all [10, 13, 14, 29, 37]
    print('merge_sort', merge_sort(data))
    print(binary_search([10, 13, 14, 29, 37], 29))  # 3
    # 5.7: quicksort on random vs already-sorted input
    sys.setrecursionlimit(10000)
    r = [random.random() for _ in range(2000)]
    for label, d in (('random', r[:]), ('sorted', sorted(r))):
        start = time.perf_counter()
        quicksort(d)
        print(f'quicksort {label}: {time.perf_counter() - start:.4f}s')


# ------------------------------------------------------------------ exercises

# 5.1 Trace (paper first). Write the array after each OUTER pass on [5, 2, 9, 1, 6].
TRACE_5_1_SELECTION = [[1, 2, 9, 5, 6], [1, 2, 9, 5, 6], [1, 2, 5, 9, 6], [1, 2, 5, 6, 9]]
TRACE_5_1_INSERTION = [[2, 5, 9, 1, 6], [2, 5, 9, 1, 6], [1, 2, 5, 9, 6], [1, 2, 5, 6, 9]]

# 5.2 Trace (paper first). Binary search for 23 in the list below.
# Which values does a[mid] take, in order?
SEARCH_LIST = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
TRACE_5_2 = [16, 56, 23]


def binary_search_rec(a, target, lo=0, hi=None):
    """5.3 Recursive binary search; -1 if missing."""
    if hi is None:
        hi = len(a) - 1
    if lo > hi:
        return -1
    mid = (lo + hi) // 2
    if a[mid] == target:
        return mid
    if a[mid] < target:
        return binary_search_rec(a, target, mid + 1, hi)
    return binary_search_rec(a, target, lo, mid - 1)


def count_inversions(a):
    """5.4 Return (sorted_list, count) where count = pairs i < j with a[i] > a[j]. O(n log n)."""
    if len(a) <= 1:
        return list(a), 0
    mid = len(a) // 2
    left, x = count_inversions(a[:mid])
    right, y = count_inversions(a[mid:])
    out, i, j, inv = [], 0, 0, x + y
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            out.append(left[i])
            i += 1
        else:
            out.append(right[j])
            j += 1
            inv += len(left) - i             # right[j] jumps every remaining left item
    return out + left[i:] + right[j:], inv


def radix_sort(a):
    """5.5 LSD radix sort for non-negative ints. Return a new sorted list."""
    exp = 1
    while a and max(a) // exp > 0:
        buckets = [[] for _ in range(10)]
        for x in a:
            buckets[(x // exp) % 10].append(x)
        a = [x for b in buckets for x in b]
        exp *= 10
    return list(a)


def merge_sort_key(a, key):
    """5.6 Stable merge sort by key(item). Return a new list."""
    if len(a) <= 1:
        return list(a)
    m = len(a) // 2
    left, right = merge_sort_key(a[:m], key), merge_sort_key(a[m:], key)
    out, i, j = [], 0, 0
    while i < len(left) and j < len(right):
        if key(left[i]) <= key(right[j]):       # <= takes the left item on ties
            out.append(left[i])
            i += 1
        else:
            out.append(right[j])
            j += 1
    return out + left[i:] + right[j:]


# 5.7 Run `python lesson5.py --demo` and explain why quicksort is so much
# slower on already-sorted input. (No check; see Solutions in the guide.)


# --------------------------------------------------------------------- checks
def check_5_1():
    """5.1 trace selection and insertion passes"""
    sel = [list(x) for x in need(TRACE_5_1_SELECTION)]
    ins = [list(x) for x in need(TRACE_5_1_INSERTION)]
    assert sel == [[1, 2, 9, 5, 6], [1, 2, 9, 5, 6], [1, 2, 5, 9, 6], [1, 2, 5, 6, 9]], 'selection trace is off'
    assert ins == [[2, 5, 9, 1, 6], [2, 5, 9, 1, 6], [1, 2, 5, 9, 6], [1, 2, 5, 6, 9]], 'insertion trace is off'


def check_5_2():
    """5.2 trace binary search"""
    assert list(need(TRACE_5_2)) == [16, 56, 23], f'{TRACE_5_2} is not right'


def check_5_3():
    """5.3 binary_search_rec"""
    a = [1, 3, 5, 7, 9, 11]
    assert binary_search_rec(a, 7) == 3
    assert binary_search_rec(a, 4) == -1
    assert all(binary_search_rec(a, x) == i for i, x in enumerate(a))


def check_5_4():
    """5.4 count_inversions"""
    assert count_inversions([2, 4, 1, 3, 5]) == ([1, 2, 3, 4, 5], 3)
    assert count_inversions([5, 4, 3, 2, 1])[1] == 10
    assert count_inversions([])[1] == 0


def check_5_5():
    """5.5 radix_sort"""
    assert radix_sort([170, 45, 75, 90, 802, 24, 2, 66]) == [2, 24, 45, 66, 75, 90, 170, 802]
    data = [random.randrange(10_000) for _ in range(200)]
    assert radix_sort(data[:]) == sorted(data)


def check_5_6():
    """5.6 merge_sort_key is stable"""
    pairs = [('b', 1), ('a', 2), ('c', 1), ('d', 2)]
    assert merge_sort_key(pairs, key=lambda p: p[1]) == [('b', 1), ('c', 1), ('a', 2), ('d', 2)]


CHECKS = [check_5_1, check_5_2, check_5_3, check_5_4, check_5_5, check_5_6]

if __name__ == '__main__':
    run(CHECKS, demo)
