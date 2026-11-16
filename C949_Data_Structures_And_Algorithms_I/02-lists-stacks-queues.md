# Lesson 2: Linked lists, stacks, and queues

A linked list is a chain of nodes, each holding a value and a pointer to the next node. The list keeps a `head` (the first node) and, in this lesson, a `tail` (the last), so adding at either end is O(1). Finding a value still means walking from the head, which is O(n).

A stack is last in, first out: `push` adds to the top and `pop` takes from the top. A queue is first in, first out: `enqueue` adds at the back and `dequeue` takes from the front. The lesson builds both on linked nodes, so every one of those operations is O(1).

Your file: `c949-practice/lesson2.py`. Run `python lesson2.py` to check your answers, and `python lesson2.py --demo` to also run the lesson code.

<!-- lesson-code -->
<details>
<summary>Lesson code</summary>

```python
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
```

</details>
<!-- /lesson-code -->

## Exercises

- **2.1**\
  **In:** `TRACE_2_1` *(paper first)*

  Using the lesson's `Stack` and `Queue`, what does the last line print?
  Give the two values as a tuple: `(peek_value, dequeue_value)`.

  ```python
  s = Stack(); q = Queue()
  for x in (1, 2, 3, 4):
      s.push(x); q.enqueue(x)
  s.pop(); q.dequeue()
  s.push(5); q.enqueue(5)
  print(s.peek(), q.dequeue())
  ```

  <!-- solution:2.1 -->
  <details>
  <summary>Hint</summary>

  - A stack is last in, first out. A queue is first in, first out.
  - Track both on paper, one line per operation.

  </details>

  <details>
  <summary>Solution</summary>

  ```python
  TRACE_2_1 = (5, 2)
  ```

  </details>
  <!-- /solution -->

- **2.2**\
  **In:** `reverse(lst)`

  Reverse a `LinkedList` in place.

  - O(n) time and O(1) extra space: don't build a new list.
  - Update both `head` and `tail`.

  <!-- solution:2.2 -->
  <details>
  <summary>Hint</summary>

  - Walk the list with three pointers: the previous node, the current one, and the next one.
  - Save `cur.next` before you change it, or you lose the rest of the list.
  - The old head ends up as the new tail.

  </details>

  <details>
  <summary>Solution</summary>

  ```python
  def reverse(lst):
      """2.2 Reverse a LinkedList in place: O(n) time, O(1) space. Fix head and tail."""
      prev, cur = None, lst.head
      lst.tail = lst.head
      while cur:
          nxt = cur.next
          cur.next = prev
          prev, cur = cur, nxt
      lst.head = prev
  ```

  </details>
  <!-- /solution -->

- **2.3**\
  **In:** `is_balanced(text)`

  Return True when every `(`, `[`, and `{` in the text has a matching closer, in the right order.

  - Use the lesson's `Stack`.
  - Ignore every other character.
  - `'{[()()]}'` is balanced. `'([)]'`, `'(('`, and `'))'` aren't.

  <!-- solution:2.3 -->
  <details>
  <summary>Hint</summary>

  - Push each opener. On a closer, the top of the stack must be its matching opener.
  - Watch for a closer that arrives when the stack is empty.
  - When the text ends, what must be true of the stack?

  </details>

  <details>
  <summary>Solution</summary>

  ```python
  def is_balanced(text):
      """2.3 True when every ( [ { has a matching closer, in order. Use Stack."""
      pairs = {')': '(', ']': '[', '}': '{'}
      s = Stack()
      for ch in text:
          if ch in '([{':
              s.push(ch)
          elif ch in pairs:
              if s.is_empty() or s.pop() != pairs[ch]:
                  return False
      return s.is_empty()
  ```

  </details>
  <!-- /solution -->

- **2.4**\
  **In:** `eval_postfix(expr)`

  Evaluate a postfix expression whose tokens are separated by spaces, using a stack.

  - The operators are `+`, `-`, `*`, and `/`.
  - Example: `'3 4 + 2 *'` is (3 + 4) × 2, which is 14.

  <!-- solution:2.4 -->
  <details>
  <summary>Hint</summary>

  - Numbers go on the stack. An operator pops two values and pushes the result.
  - The first value popped is the right-hand operand. That matters for `-` and `/`.

  </details>

  <details>
  <summary>Solution</summary>

  ```python
  def eval_postfix(expr):
      """2.4 Evaluate a space-separated postfix expression with a stack."""
      s = Stack()
      for tok in expr.split():
          if tok in '+-*/':
              b = s.pop()                      # right operand comes off first
              a = s.pop()
              if tok == '+':
                  s.push(a + b)
              elif tok == '-':
                  s.push(a - b)
              elif tok == '*':
                  s.push(a * b)
              else:
                  s.push(a / b)
          else:
              s.push(float(tok))
      return s.pop()
  ```

  </details>
  <!-- /solution -->

- **2.5**\
  **In:** `class QueueFromStacks`

  Build a first-in, first-out queue from two Python lists, using each list only as a stack (`append` and `pop()` from the end).

  - Fill in `__init__`, `enqueue(x)`, and `dequeue()`.

  <!-- solution:2.5 -->
  <details>
  <summary>Hint</summary>

  - Use one list for items coming in and one for items going out.
  - Only move items into the outgoing list when it's empty. Moving them flips their order.

  </details>

  <details>
  <summary>Solution</summary>

  ```python
  class QueueFromStacks:
      """2.5 A FIFO queue built from two Python lists used as stacks."""

      def __init__(self):
          self.inbox, self.outbox = [], []

      def enqueue(self, x):
          self.inbox.append(x)

      def dequeue(self):
          if not self.outbox:
              while self.inbox:
                  self.outbox.append(self.inbox.pop())
          return self.outbox.pop()
  ```

  </details>
  <!-- /solution -->
