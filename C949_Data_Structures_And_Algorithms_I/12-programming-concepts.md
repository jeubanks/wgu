# 12–20. Programming concepts

Chapters 12 to 20 of the course textbook teach Python itself: variables, types, branching, strings, loops, functions, lists and dictionaries, and classes. This page covers the parts the rest of the course relies on:

- reading code accurately, in Python and in the C-style syntax that pseudocode often borrows
- how languages handle types and memory
- the basics of classes
- what Python's built-in operations cost

## Reading Python code

### Variables and types

| Type | Example | Notes |
|---|---|---|
| `int` | `42`, `-7` | Any size; no overflow (a value too big to store) |
| `float` | `3.5`, `1e-3` | |
| `bool` | `True`, `False` | |
| `str` | `"cat"`, `'cat'` | Immutable: methods return a new string |
| `list` | `[3, 1, 2]` | Ordered and changeable: an array-based list |
| `tuple` | `(3, 1, 2)` | Ordered and immutable |
| `dict` | `{"a": 1, "b": 2}` | Key-value pairs: a hash table |
| `set` | `{3, 1, 2}` | Distinct items, no order: a hash table |
| `None` | `None` | "No value", like a null pointer |

### Static and dynamic, strong and weak

Two separate questions describe how a language treats types. A language gets one answer to each, so the two pairs combine in any way.

- **Static or dynamic:** *when* is a variable's type (and, for fixed-size data, its memory) decided?
  - A **statically** typed language decides before the program runs, at compile time (when the code is translated for the machine). In C or Java, `int x = 10;` fixes x as an int, and x can never hold a string.
  - A **dynamically** typed language decides while the program runs. In Python, `x = 10` followed by `x = "ten"` is fine, and a list can grow at run time.
- **Strong or weak:** does the language **convert** between types on its own?
  - A **strongly** typed language refuses. In Python, `10 + "5"` is an error, and you must write `10 + int("5")`.
  - A **weakly** typed language converts silently. In JavaScript, `10 + "5"` is the string `"105"`.

Python is dynamically **and** strongly typed. Java is statically and strongly typed. JavaScript and PHP are dynamically and weakly typed.

Memory has the same before-or-during split as static and dynamic typing:

- **Static allocation** reserves a fixed amount of memory, known before the program runs. A C array declared as `int scores[100];` always takes room for 100 ints.
- **Dynamic allocation** reserves memory while the program runs, and releases it when it's no longer needed. The memory comes from the **heap**, a pool the program draws from as it goes (`malloc` in C, `new` in Java, and every object in Python). This heap is unrelated to the heap data structure. A Python list that grows to hold a million items gets that memory only as it grows.

### Operators

Operators that trip people up:

- `/` always gives a float: `7 / 2` is `3.5`. `//` is floor division: `7 // 2` is `3`. Binary search's `mid = (lo + hi) // 2` uses it.
- `%` is the remainder: `7 % 2` is `1`. It's the modulo in hash functions and circular arrays.
- `**` is a power: `2 ** 10` is `1024`.
- `==` compares values. `is` checks whether two names refer to the same object. You'll see it in `x is None`.
- **Compound assignment** updates a variable in place: `x += 3` means `x = x + 3`. The same works for `-=`, `*=`, `/=`, `//=`, `%=`, and `**=`.
- C-style languages (and a lot of pseudocode) write `&&`, `||`, and `!` where Python writes `and`, `or`, and `not`.

**Precedence** decides which operator in an expression runs first when there are no parentheses, the way multiplication comes before addition in math. In this table, a lower level number runs first. Operators on the same line go left to right, except `**`, which goes right to left:

| Level | Operators |
|---|---|
| 1 | `( )` parentheses |
| 2 | `**` exponent |
| 3 | unary `-` and `+` |
| 4 | `*`, `/`, `//`, `%` |
| 5 | `+`, `-` |
| 6 | comparisons: `<`, `<=`, `>`, `>=`, `==`, `!=` |
| 7 | `not` |
| 8 | `and` |
| 9 | `or` |
| 10 | assignment: `=`, `+=`, ... |

So `2 + 3 * 4` is 14, `6 / 2 * 3` is 9.0 (left to right), and `-3 ** 2` is −9, because `**` binds tighter than the minus sign.

One way to picture precedence is as a tree. The operator that runs first sits lowest, and each operator works on the results below it. For `7 - 2 * 3`, the `*` runs first and gives 6, then `7 - 6` gives 1:

<!-- figure
nary: -{7, *{2, 3}}
-->
```text
      -
     / \
    7   *
       / \
      2   3
```
<!-- /figure -->

### Branching

```python
if x > 10:
    ...
elif x > 5:       # checked only if the first condition was False
    ...
else:
    ...
```

Only the first branch whose condition is true runs. Indentation shows which lines belong to each branch. Python doesn't use braces.

Many other languages have a **switch** (or case) statement. It computes one expression, then jumps to the case whose value matches. Each case usually ends with `break`. Without it, execution **falls through**: it keeps going and runs the next case's code too, even though that case's value didn't match. For example, if case 1 has no `break` and the value is 1, case 1's code runs and then case 2's code runs as well. Python 3.10 added a similar `match` statement.

### Loops and range

`range(start, stop, step)` counts from `start` **up to but not including** `stop`:

| Call | Values |
|---|---|
| `range(5)` | 0, 1, 2, 3, 4 |
| `range(2, 6)` | 2, 3, 4, 5 |
| `range(1, 10, 3)` | 1, 4, 7 |
| `range(5, 0, -1)` | 5, 4, 3, 2, 1 |

So `for i in range(n)` runs n times. Pseudocode often says "for i from 1 to 10", which includes 10. A common mistake when tracing is to include the stop value: `range(1, 10)` ends at 9.

A `while` loop runs as long as its condition is true, and checks it before each pass, so it can run zero times. For example, `while x > 100:` with x = 5 never runs its body. A **do-while** loop (in C, C++, and Java, not Python) checks *after* each pass, so its body always runs at least once.

- `break` leaves the loop at once.
- `continue` skips the rest of this pass and goes on to the next one.
- `pass` does nothing. It fills a spot where Python needs a statement, like an empty `if` branch.

### Functions and recursion

```python
def total(items):
    if not items:              # base case: an empty list
        return 0
    return items[0] + total(items[1:])
```

This function adds up a list by adding the first item to the total of the rest. A recursive function needs a base case that stops it, and each call must get closer to it. Here each call passes a list one item shorter, so the calls end at the empty list:

- `total([4, 5])` is `4 + total([5])`
- `total([5])` is `5 + total([])`
- `total([])` is `0`, the base case

The calls go down to the base case, and the sums come back up:

<!-- figure
call: total([4, 5]) | | 4 + 5 = 9
call: >total([5]) | | 5 + 0 = 5
call: >>total([]) | base case | 0
-->
```text
total([4, 5])
  total([5])
    total([])
    returns 0
  returns 5 + 0 = 5
returns 4 + 5 = 9
```
<!-- /figure -->

So `total([4, 5])` is 4 + 5 + 0 = 9. A function without a `return` gives back `None`.

### Classes

A class is a template for making objects that hold related data together, the way one blueprint can build many houses. Data structures are written as classes: a linked list node holds a value and a link to the next node. `__init__` runs when an object is created, and `self` is the object being set up:

```python
class Node:
    def __init__(self, data):
        self.data = data
        self.next = None       # no next node yet

head = Node(3)
head.next = Node(8)            # 3 → 8
```

Variables hold **references** to objects, like an address written on a slip of paper. `a = head` copies the address, so there is still only one node. `a` and `head` now name the same node, and changing `a.data` changes `head.data`.

The parts of a class:

- **Attributes:** the data each object holds (`self.data`, `self.next`).
- **Methods:** functions defined in the class that work on that data.
- **Constructor:** the method that sets up a new object: `__init__` in Python, a method named after the class in C++ and Java.
- **Destructor:** cleanup when an object is destroyed: `~ClassName()` in C++. Python has `__del__`, but rarely needs it.

Three ideas build on classes:

- **Inheritance:** a new class is based on an existing one, and gets its attributes and methods without rewriting them: `class Dog(Animal):`.
- **Encapsulation:** hiding an object's internals so other code goes through its methods. The methods can then check every change, so outside code can't put the object in a bad state.
  - C++ and Java use `private`, `protected`, and `public`.
  - Python uses naming conventions: `_balance` means "internal". `__balance` is name-mangled: Python quietly renames it, which makes it harder to reach from outside.
- **Polymorphism:** one call works on different classes, each with its own version. To **override** a method is to write a new version of it in a child class. If `Dog` and `Cat` both override `Animal.speak()`, then `animal.speak()` runs whichever one the object really is.

<!-- figure
title: Dog and Cat both inherit from Animal, and each overrides speak()
nary: Animal{Dog, Cat}
-->
```text
       Animal
       /    \
     Dog    Cat
```
<!-- /figure -->

### Memory management

- **Garbage collection:** the language finds objects nothing refers to any more and frees their memory automatically (Python, Java). In C, the programmer frees memory with `free`.
- **Reference counting:** each object keeps a count of how many references point to it. When the count drops to zero, the object is freed at once. Python does this, plus a garbage collector that catches objects that refer to each other in a cycle.
- **Sequential and linked allocation:** arrays take one block of memory, items side by side; linked lists take one small block per node, joined by pointers. [Chapter 2](02-lists.md#sequential-and-linked-allocation) compares them.

### Data flow diagrams

A **data flow diagram** (DFD) shows how data moves through a system, without any code. It has four parts:

| Part | Drawn as | Example |
|---|---|---|
| **External entity** | A rectangle | A customer, another system |
| **Process** | A circle or rounded rectangle | "Check out", "Calculate total" |
| **Data store** | An open-ended rectangle | The orders database, a cart |
| **Data flow** | A labeled arrow | "Order details" from the customer to "Check out" |

A DFD can help you choose data structures. A store that's read by key many times suggests a hash table. A store whose items must stay in order suggests a list or a tree.

## What Python's built-ins cost

`list` is an array-based list, and `dict` and `set` are hash tables, so they cost what [Chapter 2](02-lists.md) and [Chapter 4](04-hash-tables.md) say.

| Operation | Big-O | Why |
|---|---|---|
| `lst[i]`, `lst[i] = x` | O(1) | Direct index |
| `lst.append(x)` | O(1) amortized | Occasional resize |
| `lst.pop()` | O(1) | Removes the last item: nothing shifts |
| `lst.pop(0)`, `lst.insert(0, x)` | O(n) | Every other item shifts |
| `x in lst`, `lst.index(x)`, `lst.count(x)` | O(n) | Linear search |
| `lst.remove(x)` | O(n) | Finds the first x, then shifts the rest left |
| `lst.extend(other)` | O(k) for k new items | Appends each one |
| `lst.reverse()`, `lst.copy()` | O(n) | Touches every item |
| `lst[a:b]` (slice) | O(b − a) | Copies those items |
| `len(lst)` | O(1) | The length is stored |
| `lst.sort()`, `sorted(lst)` | O(n log n) | Timsort, a stable merge-insertion hybrid |
| `d[key]`, `d[key] = v`, `key in d`, `del d[key]` | O(1) average, O(n) worst | Hash table |
| `d.get(key, default)`, `d.pop(key, default)`, `d.setdefault(key, v)` | O(1) average | Like `d[key]`, but return a default instead of raising `KeyError` (`setdefault` also stores it) |
| `for k, v in d.items()`, `d.keys()`, `d.values()` | O(n) to loop over | Every pair once |
| `x in s` for a set | O(1) average, O(n) worst | Hash table |
| `deque.append`, `deque.popleft` | O(1) | `collections.deque` is built for both ends |
| `s1 + s2` for strings | O(len(s1) + len(s2)) | Builds a new string |

Two consequences to watch for in code:

- **Slices hide work.** `lst[a:b]` copies b − a items. A slice inside a loop or a recursive call pays for that copy on every pass, so count it when you add up the work.
- **Strings are immutable.** `s = s + c` can't add to `s` in place. It builds a new string and copies all of `s` into it. Doing that in a loop copies the growing string every time: O(n²) overall. `"".join(pieces)` works out the total length once and copies each piece once, so it's O(n).

## Questions

- **12.1** Reading Python.

  **a)** What values does `range(3, 12, 4)` produce? Write them separated by commas.

  <!-- answer:12.1a blanks: 3, 7, 11 | 3,7,11 -->

  **b)** What is `17 // 5`, and what is `17 % 5`?

  <!-- answer:12.1b blanks: 17 // 5 => 3; 17 % 5 => 2 -->

  **c)** How many times does the loop body run?

  ```python
  i = 1
  while i < 50:
      i = i * 3
  ```

  <!-- answer:12.1c blanks: 4 -->

  <details>
  <summary>Answer</summary>

  - **a)** 3, 7, 11. The next would be 15, which is past the stop of 12.
  - **b)** 17 // 5 = 3, and 17 % 5 = 2, since 17 = 3 × 5 + 2.
  - **c)** 4: i goes 1 → 3 → 9 → 27 → 81, and the check fails at 81.

  </details>

- **12.2** References.

  ```python
  a = Node(5)
  b = a
  b.data = 9
  print(a.data)
  ```

  What does this print?

  <!-- answer:12.2 blanks: 9 -->

  <details>
  <summary>Answer</summary>

  9. `b = a` makes `b` refer to the same node as `a`. There's only one node, so changing it through `b` changes what `a` sees.

  </details>

- **12.3** Pick the Big-O of each Python operation, on a list, dict, or set of n items.

  | Operation | Big-O |
  |---|---|
  | `lst.append(x)`, averaged | |
  | `lst.insert(0, x)` | |
  | `lst.pop()` | |
  | `x in lst` | |
  | `x in some_set`, average | |
  | `d[key] = value`, average | |
  | `lst.sort()` | |

  <!-- answer:12.3a-g table [O(1), O(log n), O(n), O(n log n)]: O(1); O(n); O(1); O(n); O(1); O(1); O(n log n) -->

  <details>
  <summary>Answer</summary>

  - A list is an array: the end is cheap, the front shifts everything, and searching checks each item.
  - Sets and dicts are hash tables: O(1) on average.
  - Python's sort is O(n log n).

  </details>

- **12.4** Hidden costs.

  ```python
  def total(items):
      if not items:
          return 0
      return items[0] + total(items[1:])
  ```

  **a)** What is this function's Big-O for a list of n items?

  <!-- answer:12.4a blanks: O(n^2) | O(n²) | O(n*n) -->

  **b)** What causes it?

  A. The recursion itself

  B. `items[1:]` copies the rest of the list on every call.

  C. The `+` on numbers

  <!-- answer:12.4b choice: B -->

  <details>
  <summary>Answer</summary>

  - **a)** O(n²). There are n calls, and the slices copy n − 1, n − 2, ..., 1 items, which adds up to about n²/2.
  - **b)** **B.** Passing a starting index instead of a slice makes each call O(1), and the whole function O(n).

  </details>

- **12.5** Types and languages.

  **a)** Label each language's typing.

  | Language | Static or dynamic | Strong or weak |
  |---|---|---|
  | Python | | |
  | Java | | |
  | JavaScript | | |

  <!-- answer:12.5a table [Static, Dynamic] [Strong, Weak]: Dynamic; Strong; Static; Strong; Dynamic; Weak -->

  **b)** What does Python do with `10 + "5"`?

  A. Gives 15

  B. Gives "105"

  C. Raises an error

  <!-- answer:12.5b choice: C -->

  <details>
  <summary>Answer</summary>

  - **a)** Python: dynamic, strong. Java: static, strong. JavaScript: dynamic, weak.
  - **b)** **C.** Python won't convert between a number and a string on its own: that's strong typing. JavaScript would give "105".

  </details>

- **12.6** Precedence. What does each Python expression give?

  | Expression | Value |
  |---|---|
  | `2 + 3 * 4 ** 2` | |
  | `-2 ** 2` | |
  | `10 - 4 - 3` | |
  | `2 ** 3 ** 2` | |

  <!-- answer:12.6a-d table: 50; -4; 3; 512 -->

  <details>
  <summary>Answer</summary>

  - `4 ** 2` is 16, then `3 * 16` is 48, then `2 + 48` is **50**.
  - `**` binds tighter than the minus: `-(2 ** 2)` is **−4**.
  - Subtraction goes left to right: `(10 - 4) - 3` is **3**.
  - `**` goes right to left: `2 ** (3 ** 2)` is `2 ** 9`, **512**.

  </details>

- **12.7** Loops and classes.

  **a)** Which loop always runs its body at least once?

  A. `while`

  B. `for`

  C. do-while

  <!-- answer:12.7a choice: C -->

  **b)** Match each idea to its description.

  | Description | Idea |
  |---|---|
  | `Dog` gets all of `Animal`'s methods without rewriting them | |
  | `balance` can only be changed through `deposit()` and `withdraw()` | |
  | `shape.area()` runs the circle's or the square's version, depending on the object | |

  <!-- answer:12.7b-d table [Inheritance, Encapsulation, Polymorphism]: Inheritance; Encapsulation; Polymorphism -->

  **c)** In Python, when is an object freed under reference counting?

  A. When the program ends

  B. When no references to it remain

  C. When `del` is called on any variable

  <!-- answer:12.7c choice: B -->

  <details>
  <summary>Answer</summary>

  - **a)** **C.** A do-while checks its condition after the body. `while` and `for` can run zero times.
  - **b)** Getting a parent's methods is inheritance. Hiding `balance` behind methods is encapsulation. One call running different versions is polymorphism.
  - **c)** **B.** `del` removes one reference; the object is freed only when its count reaches zero.

  </details>

- **12.8** Data flow diagrams. Which part of a DFD is each item?

  | Item | DFD part |
  |---|---|
  | A shopper using the website | |
  | "Calculate shipping" | |
  | The product catalog database | |
  | An arrow labeled "payment details" | |

  <!-- answer:12.8a-d table [External entity, Process, Data store, Data flow]: External entity; Process; Data store; Data flow -->

  <details>
  <summary>Answer</summary>

  The shopper is outside the system: an external entity. "Calculate shipping" transforms data: a process. The catalog holds data: a data store. The labeled arrow is a data flow.

  </details>
