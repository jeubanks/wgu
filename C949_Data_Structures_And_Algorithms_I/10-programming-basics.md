# 10. Programming basics

Types, operators, branching, loops, classes and memory, for the **Applies Algorithms** competency. After this page you'll be able to predict what an expression gives, read a class, and say when an object's memory is freed.

## Data types

A **data type** says what kind of value a variable holds. Java names the type; Python works it out from the value.

| Type | Holds | Java | Python |
|---|---|---|---|
| boolean | true or false | `boolean done = true;` | `done = True` (`bool`) |
| byte | an 8-bit whole number, −128 to 127 | `byte b = 10;` | none: use `int` |
| int | a 32-bit whole number in Java | `int count = 10;` | `count = 10` (`int`, any size) |
| char | one character | `char c = 'a';` | none: `'a'` is a string of length 1 |
| float | a 32-bit decimal | `float f = 3.14f;` | none: Python's `float` is 64-bit |
| double | a 64-bit decimal | `double d = 3.14;` | `d = 3.14` (`float`) |
| String | text | `String s = "hi";` | `s = "hi"` (`str`) |

Python has no byte, char or 32-bit float type. Its `int` never overflows, and its `float` is Java's `double`.

### Static and dynamic, strong and weak

- **Static or dynamic: when is a variable's type fixed?** **Statically typed** languages fix it before the program runs: in Java, `int x = 10;` means x only ever holds ints. **Dynamically typed** languages decide while it runs: in Python, `x = 10` and then `x = "ten"` is fine.
- **Strong or weak: will it convert types on its own?** **Strongly typed** languages refuse: in Python, `10 + "5"` raises a `TypeError`. **Weakly typed** languages convert quietly: in JavaScript, `10 + "5"` is `"105"`.

Python is dynamic and strong. Java is static and strong. JavaScript is dynamic and weak.

## Assignment and comparison

- `=` **assigns**: `x = 5` stores 5 in x.
- `==` **compares**: `x == 5` gives `True` or `False`.
- **Compound assignment**: `x += 3` means `x = x + 3`. Likewise `-=`, `*=`, `/=`, `//=`, `%=`.

## Operators and precedence

| Expression | Value | Why |
|---|---|---|
| `7 / 2` | `3.5` | `/` always gives a float: `8 / 2` is `4.0` |
| `7 // 2` | `3` | Floor division rounds down |
| `-7 // 2` | `-4` | Down means toward −∞ |
| `7 % 2` | `1` | Remainder: 7 = 3 × 2 + 1 |
| `2 ** 5` | `32` | Power |

**Precedence** decides which operator runs first without parentheses. Higher rows run first. Within a row, operators go left to right, except `**`, which goes right to left.

| Order | Operators |
|---|---|
| 1 | `( )` |
| 2 | `**` |
| 3 | unary `-`, as in `-x` |
| 4 | `*`, `/`, `//`, `%` |
| 5 | `+`, `-` |
| 6 | `<`, `<=`, `>`, `>=`, `==`, `!=` |
| 7 | `not` |
| 8 | `and` |
| 9 | `or` |

**Example 1:** `4 + 6 // 4 * 2`. `//` and `*` share a row, so left to right: `6 // 4` is 1, `1 * 2` is 2, then `4 + 2` is **6**. Drawn as a tree, the operator that runs first sits lowest:

<!-- figure
nary: +{4, *{//{6, 4}, 2}}
-->
```text
      +
     / \
    4   *
       / \
     //   2
    /  \
   6    4
```
<!-- /figure -->

**Example 2:** `not 3 > 5 and 2 == 2`. Comparisons run first: False and True. Then `not False` is True, and `True and True` is **True**.

## Branching

```python
if score >= 90:
    grade = "A"
elif score >= 80:      # checked only if the first test was False
    grade = "B"
else:
    grade = "C"
```

Only the **first** true branch runs, so 95 gets "A".

- `and` needs both sides true, `or` needs either, and `not` flips a value.
- **Short-circuiting:** Python stops once it knows the answer. In `a and b`, a False a means b never runs. In `a or b`, a True a means b never runs. So `if i < len(items) and items[i] > 0:` never uses an index that's out of range.

## Loops

`range(start, stop, step)` counts from start up to, **but not including**, stop: `range(2, 6)` is 2, 3, 4, 5, and `range(3, 0, -1)` is 3, 2, 1.

- `while condition:` checks before every pass, so it can run zero times.
- `break` leaves the loop, `continue` jumps to the next pass, and `pass` does nothing (it fills a spot that needs a statement).
- **Python has no do-while.** A do-while (Java, C) checks after the body, so it always runs at least once. Python writes `while True:` with a `break` at the end.

## Classes

A **class** is a blueprint, and each **object** made from it holds its own data.

```python
class Account:
    def __init__(self, owner, balance=0):   # constructor
        self.owner = owner                   # attributes
        self.balance = balance

    def deposit(self, amount):               # method
        self.balance += amount

acct = Account("Ana")    # runs __init__
acct.deposit(50)         # balance is now 50
```

- The **constructor** `__init__` runs when an object is created. Java's constructor is named after the class and called with `new`.
- **Attributes** are the object's data. **Methods** are the class's functions.
- `self` is the object the method was called on.
- **Inheritance:** `class Savings(Account):` gets Account's attributes and methods, and can add or **override** some.

A variable holds a **reference** to an object, like an address, not the object itself. After `b = a`, both names refer to one object, so a change through `b` shows through `a`.

## Memory

- **Allocation** reserves memory for a new object: `new` in Java, and every object creation in Python.
- A **pointer** stores a memory address (C: `int *p`). Java and Python use **references**, which point at objects without address arithmetic.
- **Null** means "refers to nothing": `null` in Java, `None` in Python. A linked list's last node has `next = None`.
- **Garbage collection** frees objects nothing refers to any more (Java, Python). C programmers call `free`.
- **Reference counting:** each Python object counts the references to it, and is freed when the count reaches 0. `del x` removes one reference, not the object.

**Sequential allocation** puts items side by side in one block, like an array, so item i's address is computed directly: O(1). **Linked allocation** gives each item its own node with a pointer to the next, so reaching item i follows i pointers: O(n).

<!-- figure
title: The same three items, sequential and linked
row: array | 4 9 2
list: 4 9 2
-->
```text
array:  [ 4 | 9 | 2 ]
linked: head -> 4 -> 9 -> 2 -> None
```
<!-- /figure -->

[Lists, stacks and queues](06-lists-stacks-queues.md) compares them in detail.

## Big-O summary

| Operation | Best | Average | Worst | Why |
|---|---|---|---|---|
| Read item i, sequential | O(1) | O(1) | O(1) | Address arithmetic |
| Reach item i, linked | O(1) | O(n) | O(n) | Follow i pointers |
| `x in some_list` | O(1) | O(n) | O(n) | Best: x is first. Worst: last or missing |

## Questions

- **10.1** Data types.

  | Description | Java type |
  |---|---|
  | One letter, like `'Q'` | |
  | A 64-bit decimal | |
  | An 8-bit whole number | |
  | true or false | |

  <!-- answer:10.1a-d table [boolean, byte, int, char, float, double, String]: char; double; byte; boolean -->

  <details>
  <summary>Answer</summary>

  - `char`, then `double` (a `float` is only 32-bit), then `byte`, then `boolean`.

  </details>

- **10.2** Typing.

  **a)** `y = 4` followed by `y = "four"` runs without an error. What does that show?

  A. Static typing

  B. Dynamic typing

  C. Weak typing

  <!-- answer:10.2a choice: B -->

  **b)** What does Python do with `"3" * 2 + 1`?

  A. Gives 7

  B. Gives "331"

  C. Raises a TypeError

  <!-- answer:10.2b choice: C -->

  <details>
  <summary>Answer</summary>

  - **a)** **B.** The variable's type changed while running. Weak typing is about converting values.
  - **b)** **C.** `"3" * 2` is `"33"`, and Python is strongly typed, so `"33" + 1` won't convert either side.

  </details>

- **10.3** What does each Python expression give?

  | Expression | Value |
  |---|---|
  | `17 // 5` | |
  | `17 % 5` | |
  | `9 / 3` | |
  | `-9 // 2` | |
  | `2 + 3 * 4 % 5` | |
  | `2 ** 3 ** 2` | |

  <!-- answer:10.3a-f table: 3; 2; 3.0; -5; 4; 512 -->

  <details>
  <summary>Answer</summary>

  - 17 = 3 × 5 + 2, so **3** and **2**. `/` always gives a float: **3.0**. −4.5 rounds down to **−5**.
  - `3 * 4` is 12, `12 % 5` is 2, `2 + 2` is **4**.
  - `**` goes right to left: `2 ** 9` is **512**.

  </details>

- **10.4** Branching.

  ```python
  x = 12
  if x > 5:
      x = x - 5
  elif x > 3:
      x = x * 10
  if x % 2 == 1 or x / 0 > 1:
      x = x + 100
  print(x)
  ```

  **a)** What does it print?

  <!-- answer:10.4a blanks: 107 -->

  **b)** Why doesn't `x / 0` raise an error?

  A. Python treats division by zero as 0.

  B. `or` stops once its left side is True.

  C. Comparisons run before division.

  <!-- answer:10.4b choice: B -->

  <details>
  <summary>Answer</summary>

  - **a)** x becomes 7, and the `elif` is skipped, since only the first true branch runs. 7 % 2 is 1, so x becomes **107**.
  - **b)** **B.** Short-circuiting: the left side is True, so the right side never runs.

  </details>

- **10.5** Loops.

  **a)** How many times does this loop body run?

  ```python
  n = 0
  while n > 0:
      n = n - 1
  ```

  <!-- answer:10.5a blanks: 0 -->

  **b)** Which loop always runs its body at least once?

  A. Python's `while`

  B. Python's `for`

  C. A do-while, as in Java

  <!-- answer:10.5b choice: C -->

  **c)** What values does `range(10, 2, -3)` give? Separate them with commas.

  <!-- answer:10.5c blanks: 10, 7, 4 | 10,7,4 -->

  <details>
  <summary>Answer</summary>

  - **a)** **0.** `while` checks first, and `0 > 0` is False.
  - **b)** **C.** It checks after the body.
  - **c)** **10, 7, 4.** The next, 1, is past the stop.

  </details>

- **10.6** Classes and references.

  ```python
  class Box:
      def __init__(self, size):
          self.size = size

      def grow(self):
          self.size = self.size * 2

  p = Box(3)
  q = p
  q.grow()
  r = Box(3)
  print(p.size, r.size)
  ```

  **a)** What does it print?

  <!-- answer:10.6a blanks: p.size => 6; r.size => 3 -->

  **b)** What runs when `Box(3)` is called?

  A. `grow`

  B. `__init__`, the constructor

  C. Nothing until a method is called

  <!-- answer:10.6b choice: B -->

  <details>
  <summary>Answer</summary>

  - **a)** `q = p` copies the reference, so `q.grow()` doubles their one shared box: **6**. `r` is a separate box: **3**.
  - **b)** **B.** Creating an object runs `__init__`.

  </details>

- **10.7** Memory.

  ```python
  a = [1, 2]
  b = a
  del a
  ```

  **a)** After `del a`, is the list freed?

  A. Yes: `del` frees the object.

  B. No: `b` still refers to it, so its reference count is 1.

  <!-- answer:10.7a choice: B -->

  **b)** Which allocation reads item i in O(1)?

  A. Sequential

  B. Linked

  <!-- answer:10.7b choice: A -->

  <details>
  <summary>Answer</summary>

  - **a)** **B.** `del a` removes one reference. The list is freed when its count reaches 0.
  - **b)** **A.** Side by side, the address is computed directly. Linked follows i pointers.

  </details>
