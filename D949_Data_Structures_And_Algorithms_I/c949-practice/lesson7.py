"""Lesson 7: Tracing pseudocode.

Paper-only drills: trace each one in the guide (Python Practice tab, Lesson 7)
with a variable table, then type your answers into the variables below.
Run `python lesson7.py` to check them. Each check compares your answer with a
Python translation of the pseudocode, which you can read after you answer.
"""
from _checker import need, run

# ------------------------------------------------------------------ answers
# 7.1 While loop: values of x and i when the loop ends.
ANSWER_7_1 = None   # (x, i)

# 7.2 Branching: final value of x.
ANSWER_7_2 = None

# 7.3 For loop with remainder: everything output, in order.
ANSWER_7_3 = None   # list

# 7.4 Nested loops with n = 4: final count, and the Big-O as a string.
ANSWER_7_4 = None   # (count, 'O(...)')

# 7.5 Recursion: what Mystery(7) returns.
ANSWER_7_5 = None

# 7.6 List scan: final m.
ANSWER_7_6 = None

# 7.7 Heap, root at index 1: (left child value, right child value) of index 2,
# the parent value of index 6, and whether it is a valid max-heap (True/False).
ANSWER_7_7 = None   # ((left, right), parent, is_valid)

# 7.8 Recursion with output on both sides: everything PrintDown(3) outputs.
ANSWER_7_8 = None   # list

# 7.9 Stack: the two popped values, then what Peek shows.
ANSWER_7_9 = None   # ((first_pop, second_pop), peek)


# ---------------------------------------- Python translations (read after!)
def trace_7_1():
    x, i = 0, 1
    while i < 10:
        x = x + i
        i = i * 2
    return (x, i)


def trace_7_2():
    x = 28
    if x > 10 and x < 20:
        x = 20
    elif x < 30:
        x = 25
    elif x < 50:
        x = 100
    else:
        x = 500
    return x


def trace_7_3():
    return [i for i in range(1, 11) if i % 3 == 0]   # 'from 1 to 10' includes 10


def trace_7_4(n=4):
    count = 0
    for i in range(n):          # 0 to n - 1
        for j in range(i):      # 0 to i - 1
            count += 1
    return count


def mystery(n):
    if n <= 0:
        return 0
    return n + mystery(n - 2)


def trace_7_6():
    lst = [3, 8, 1, 6]
    m = lst[0]
    for item in lst:
        if item > m:
            m = item
    return m


HEAP_7_7 = [0, 50, 30, 40, 10, 20, 35]   # index 0 unused


def trace_7_7():
    h = HEAP_7_7
    children = (h[2 * 2], h[2 * 2 + 1])
    parent = h[6 // 2]
    valid = all(h[i // 2] >= h[i] for i in range(2, len(h)))
    return (children, parent, valid)


def trace_7_8():
    out = []

    def print_down(n):
        if n == 0:
            return
        out.append(n)
        print_down(n - 1)
        out.append(n)

    print_down(3)
    return out


def trace_7_9():
    s, pops = [], []
    s.append(5)
    s.append(2)
    pops.append(s.pop())
    s.append(7)
    s.append(1)
    pops.append(s.pop())
    return (tuple(pops), s[-1])


# --------------------------------------------------------------------- checks
def _same(answer, expected, hint):
    assert need(answer) == expected, f'{answer!r} is not right. {hint}'


def check_7_1():
    """7.1 while loop"""
    _same(tuple(need(ANSWER_7_1)), trace_7_1(), 'Write one row per pass, including the final failed check.')


def check_7_2():
    """7.2 branching"""
    _same(ANSWER_7_2, trace_7_2(), 'Only the first true branch runs.')


def check_7_3():
    """7.3 for loop with remainder"""
    _same(list(need(ANSWER_7_3)), trace_7_3(), "'from 1 to 10' includes both ends.")


def check_7_4():
    """7.4 nested loops"""
    count, big_o = need(ANSWER_7_4)
    assert count == trace_7_4(), f'count {count} is not right. Count inner passes for i = 0, 1, 2, 3.'
    from _checker import big_o as norm
    assert norm(big_o) == 'o(n^2)', f'{big_o} is not right. A loop inside a loop over n.'


def check_7_5():
    """7.5 recursion"""
    _same(ANSWER_7_5, mystery(7), 'Expand 7 + Mystery(5) + ... until n <= 0.')


def check_7_6():
    """7.6 list scan"""
    _same(ANSWER_7_6, trace_7_6(), 'm only changes when an item is bigger.')


def check_7_7():
    """7.7 heap index math (root at 1)"""
    (left, right), parent, valid = need(ANSWER_7_7)
    _same(((left, right), parent, valid), trace_7_7(), 'Children 2i and 2i + 1; parent i // 2.')


def check_7_8():
    """7.8 recursion output order"""
    _same(list(need(ANSWER_7_8)), trace_7_8(), 'Each call outputs before AND after the smaller call.')


def check_7_9():
    """7.9 stack operations"""
    (a, b), peek = need(ANSWER_7_9)
    _same(((a, b), peek), trace_7_9(), 'Pop removes the newest item.')


CHECKS = [check_7_1, check_7_2, check_7_3, check_7_4, check_7_5,
          check_7_6, check_7_7, check_7_8, check_7_9]

if __name__ == '__main__':
    run(CHECKS)
