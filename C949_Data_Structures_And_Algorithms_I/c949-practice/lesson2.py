"""Lesson 2: Linked lists, stacks, and queues.

Run `python lesson2.py` to check your work (`--demo` also runs the lesson code).
"""
from _checker import need, run


# ---------------------------------------------------------------- lesson code
class Node:
    def __init__(self, data):
        self.data = data
        self.next = None


class LinkedList:
    def __init__(self):
        self.head = None
        self.tail = None

    def append(self, data):              # O(1) thanks to tail
        node = Node(data)
        if self.head is None:
            self.head = self.tail = node
        else:
            self.tail.next = node
            self.tail = node

    def prepend(self, data):             # O(1)
        node = Node(data)
        node.next = self.head
        self.head = node
        if self.tail is None:
            self.tail = node

    def search(self, key):               # O(n)
        cur = self.head
        while cur:
            if cur.data == key:
                return cur
            cur = cur.next
        return None

    def remove(self, key):               # O(n): find the predecessor
        prev, cur = None, self.head
        while cur and cur.data != key:
            prev, cur = cur, cur.next
        if cur is None:
            return False
        if prev is None:
            self.head = cur.next
        else:
            prev.next = cur.next
        if cur is self.tail:
            self.tail = prev
        return True

    def __iter__(self):
        cur = self.head
        while cur:
            yield cur.data
            cur = cur.next


class Stack:                     # LIFO
    def __init__(self):
        self.top = None
        self.size = 0

    def push(self, data):
        node = Node(data)
        node.next = self.top
        self.top = node
        self.size += 1

    def pop(self):
        if self.top is None:
            raise IndexError('pop from empty stack')
        node = self.top
        self.top = node.next
        self.size -= 1
        return node.data

    def peek(self):
        return None if self.top is None else self.top.data

    def is_empty(self):
        return self.top is None


class Queue:                     # FIFO
    def __init__(self):
        self.list = LinkedList()

    def enqueue(self, data):
        self.list.append(data)

    def dequeue(self):
        node = self.list.head
        if node is None:
            raise IndexError('dequeue from empty queue')
        self.list.head = node.next
        if self.list.head is None:
            self.list.tail = None
        return node.data

    def is_empty(self):
        return self.list.head is None


def demo():
    lst = LinkedList()
    for x in (2, 3, 4):
        lst.append(x)
    lst.prepend(1)
    lst.remove(3)
    print(list(lst))                    # [1, 2, 4]
    s = Stack()
    for x in 'abc':
        s.push(x)
    print(s.pop(), s.pop(), s.peek())   # c b a
    q = Queue()
    for x in 'abc':
        q.enqueue(x)
    print(q.dequeue(), q.dequeue())     # a b


# ------------------------------------------------------------------ exercises

# 2.1 Trace (paper first). What do s.peek() and q.dequeue() return?
#
#   s = Stack(); q = Queue()
#   for x in (1, 2, 3, 4):
#       s.push(x); q.enqueue(x)
#   s.pop(); q.dequeue()
#   s.push(5); q.enqueue(5)
#   print(s.peek(), q.dequeue())
TRACE_2_1 = None   # (peek_value, dequeue_value)


def reverse(lst):
    """2.2 Reverse a LinkedList in place: O(n) time, O(1) space. Fix head and tail."""
    raise NotImplementedError


def is_balanced(text):
    """2.3 True when every ( [ { has a matching closer, in order. Use Stack."""
    raise NotImplementedError


def eval_postfix(expr):
    """2.4 Evaluate a space-separated postfix expression with a stack."""
    raise NotImplementedError


class QueueFromStacks:
    """2.5 A FIFO queue built from two Python lists used as stacks."""

    def __init__(self):
        raise NotImplementedError

    def enqueue(self, x):
        raise NotImplementedError

    def dequeue(self):
        raise NotImplementedError


# --------------------------------------------------------------------- checks
def check_2_1():
    """2.1 trace stack and queue"""
    assert tuple(need(TRACE_2_1)) == (5, 2), f'{TRACE_2_1} is not right'


def check_2_2():
    """2.2 reverse"""
    r = LinkedList()
    for x in (1, 2, 3, 4):
        r.append(x)
    reverse(r)
    assert list(r) == [4, 3, 2, 1], list(r)
    assert r.tail.data == 1, 'tail not updated'
    empty = LinkedList()
    reverse(empty)
    assert list(empty) == []


def check_2_3():
    """2.3 is_balanced"""
    assert is_balanced('{[()()]}')
    assert not is_balanced('([)]')
    assert not is_balanced('((')
    assert not is_balanced('))')
    assert is_balanced('')


def check_2_4():
    """2.4 eval_postfix"""
    assert eval_postfix('3 4 + 2 *') == 14
    assert eval_postfix('5 1 2 + 4 * + 3 -') == 14
    assert eval_postfix('10 4 -') == 6


def check_2_5():
    """2.5 QueueFromStacks"""
    qq = QueueFromStacks()
    for x in (1, 2, 3):
        qq.enqueue(x)
    assert qq.dequeue() == 1
    qq.enqueue(4)
    assert [qq.dequeue(), qq.dequeue(), qq.dequeue()] == [2, 3, 4]


CHECKS = [check_2_1, check_2_2, check_2_3, check_2_4, check_2_5]

if __name__ == '__main__':
    run(CHECKS, demo)
