# 10. Programming basics

Read and predict small programs: types, operators, branches, loops, classes, and memory.

After this page you can:

- Predict what a Python expression or short program gives
- Read a class and follow references to its objects
- Say how memory is allocated and when it's freed

## Data types

A **data type** says what kind of value a variable holds. Java names the type; Python works it out from the value.

> [!IMPORTANT]
> **Key idea:** A type limits what a value can hold and what you can do with it, and languages differ in which types they offer.

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

> [!IMPORTANT]
> **Key idea:** Settle which operator runs first before doing any arithmetic, since the order changes the answer.

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

> [!IMPORTANT]
> **Key idea:** A class is written once, and every object built from it keeps its own attributes while sharing the class's methods.

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

> [!IMPORTANT]
> **Key idea:** Memory is reserved when an object is made, and the language decides whether you free it by hand or it is freed for you.

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

- **10.1** Which Java type holds each value?

  **a)** A 64-bit number with a decimal part

  A. `float`

  B. `int`

  C. `byte`

  D. `double`

  <!-- answer:10.1a choice: D -->

  **b)** An 8-bit whole number

  A. `byte`

  B. `char`

  C. `int`

  D. `boolean`

  <!-- answer:10.1b choice: A -->

  **c)** One letter, like `'Q'`

  A. `String`

  B. `byte`

  C. `char`

  D. `int`

  <!-- answer:10.1c choice: C -->

  <details>
  <summary>Answer</summary>

  - **a)** **D, `double`.** A `float` is only 32-bit.
  - **b)** **A, `byte`.** An `int` is 32-bit. B fits the C language, whose `char` is 8-bit; Java's is 16-bit.
  - **c)** **C, `char`.** Single quotes mean one character in Java. A `String` uses double quotes.

  </details>

- **10.2** Types in Python.

  **a)** `y = 4` followed by `y = "four"` runs without an error. What does that show?

  A. Static typing

  B. Dynamic typing

  C. Weak typing

  D. Strong typing

  <!-- answer:10.2a choice: B -->

  **b)** What does Python do with `"3" * 2 + 1`?

  A. Gives 7

  B. Gives "331"

  C. Raises a TypeError

  D. Gives "33"

  <!-- answer:10.2b choice: C -->

  <details>
  <summary>Answer</summary>

  - **a)** **B.** The variable's type changed while running. Weak typing is about converting values.
  - **b)** **C.** `"3" * 2` is `"33"`, and Python is strongly typed, so `"33" + 1` won't convert either side.

  </details>

- **10.3** What is the value of each Python expression?

  **a)** `17 // 5` and `17 % 5`

  A. `3.4` and `2`

  B. `2` and `3`

  C. `4` and `2`

  D. `3` and `2`

  <!-- answer:10.3a choice: D -->

  **b)** `-9 // 2`

  A. `-5`

  B. `-4`

  C. `-4.5`

  D. `-5.0`

  <!-- answer:10.3b choice: A -->

  **c)** `2 + 3 * 4 % 5`

  A. `0`

  B. `4`

  C. `14`

  D. `2`

  <!-- answer:10.3c choice: B -->

  **d)** `2 ** 3 ** 2`

  A. `64`

  B. `12`

  C. `512`

  D. `18`

  <!-- answer:10.3d choice: C -->

  <details>
  <summary>Answer</summary>

  - **a)** **D.** 17 = 3 × 5 + 2. A is `/`, which gives `3.4`.
  - **b)** **A, `-5`.** −4.5 rounds down, toward −∞. B rounds toward zero. Two ints give an int, not D.
  - **c)** **B, `4`.** `3 * 4` is 12, `12 % 5` is 2, `2 + 2` is 4. A adds first: `(2 + 3) * 4 % 5`.
  - **d)** **C, `512`.** `**` goes right to left: `2 ** 9`. A goes left to right: `8 ** 2`.

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

  **a)** What happens when this code runs?

  A. It prints 7.

  B. It prints 70.

  C. It raises a ZeroDivisionError.

  D. It prints 107.

  <!-- answer:10.4a choice: D -->

  **b)** Why doesn't `x / 0` raise an error in this code?

  A. Python treats division by zero as 0.

  B. `or` stops once its left side is True.

  C. Comparisons run before division.

  D. Python returns infinity for `x / 0`.

  <!-- answer:10.4b choice: B -->

  <details>
  <summary>Answer</summary>

  - **a)** **D.** x becomes 7, and the `elif` is skipped, since only the first true branch runs. 7 % 2 is 1, so x becomes 107. B runs both branches.
  - **b)** **B.** Short-circuiting: the left side is True, so the right side never runs.

  </details>

- **10.5** Loops.

  **a)** How many times does this loop body run?

  ```python
  n = 0
  while n > 0:
      n = n - 1
  ```

  A. 0

  B. 1

  C. 2

  D. It never stops.

  <!-- answer:10.5a choice: A -->

  **b)** Which loop always runs its body at least once?

  A. Python's `while`

  B. Python's `for`

  C. A do-while, as in Java

  D. A `for` loop over `range(0)`

  <!-- answer:10.5b choice: C -->

  **c)** What values does `range(10, 2, -3)` give?

  A. 10, 7, 4, 1

  B. 10, 7, 4

  C. 7, 4, 1

  D. 10, 7

  <!-- answer:10.5c choice: B -->

  <details>
  <summary>Answer</summary>

  - **a)** **A.** `while` checks first, and `0 > 0` is False. B is a do-while.
  - **b)** **C.** It checks after the body.
  - **c)** **B.** The next value, 1, is past the stop. A keeps going past it.

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

  A. `6 3`

  B. `3 6`

  C. `3 3`

  D. `6 6`

  <!-- answer:10.6a choice: A -->

  **b)** What runs when `Box(3)` is called?

  A. `grow`

  B. `__init__`, the constructor

  C. Nothing until a method is called

  D. A method named `Box`

  <!-- answer:10.6b choice: B -->

  <details>
  <summary>Answer</summary>

  - **a)** **A.** `q = p` copies the reference, so `q.grow()` doubles their one shared box: 6. `r` is a separate box: 3. C treats `q = p` as a copy.
  - **b)** **B.** Creating an object runs `__init__`. D is Java's constructor.

  </details>

- **10.7** Memory.

  ```python
  a = [1, 2]
  b = a
  del a
  ```

  **a)** After `del a` runs, is the list freed from memory?

  A. Yes: `del` frees the object.

  B. Yes: `b = a` made a copy, so the original has no references.

  C. No: Python frees objects only when the program ends.

  D. No: `b` still refers to it, so its reference count is 1.

  <!-- answer:10.7a choice: D -->

  **b)** Which kind of memory allocation lets a program read item i in O(1)?

  A. Sequential

  B. Linked

  C. Both

  D. Neither

  <!-- answer:10.7b choice: A -->

  <details>
  <summary>Answer</summary>

  - **a)** **D.** `del a` removes one reference. The list is freed when its count reaches 0. A confuses removing a name with freeing the object.
  - **b)** **A.** Side by side, the address is computed directly. Linked follows i pointers.

  </details>
