# SQL quick reference

[← Exercise index](exercises.md) · [MySQL error decoder](errors.md)

The D427 rules and syntax, on one page. Print it (three pages) or keep it open while you practice. Every full statement here runs on MySQL 8.4, checked by CI on every change.

<div class="quick-reference" markdown>

## Reading a column spec

| The spec says | Write |
|---|---|
| integer with range 0 to *N* | the smallest UNSIGNED type that reaches *N* (table below) |
| integer with a range below 0 | the smallest signed type that fits both ends |
| integer (no range) | `INT` |
| positive integer | `INT UNSIGNED` (add `CHECK (col > 0)` if 0 isn't allowed) |
| *p* significant digits and *s* decimal places | `DECIMAL(p,s)`: *p* digits in all, *s* after the point |
| up to $9,999.99 | `DECIMAL(6,2)`: count the digits, 4 before + 2 after |
| fixed-length string of *n* chars | `CHAR(n)` |
| variable-length string, max *n* chars | `VARCHAR(n)` |
| date / date and time | `DATE` / `DATETIME` |
| auto increment, primary key | `AUTO_INCREMENT PRIMARY KEY` |
| not NULL · default *v* · must be one of ... | `NOT NULL` · `DEFAULT v` · `CHECK (col IN (...))` |
| must be between *a* and *b* | `CHECK (col BETWEEN a AND b)` |
| foreign key to Other(ID) | the same type as `Other.ID`, UNSIGNED included |

| Type | Signed | UNSIGNED |
|---|---|---|
| `TINYINT` | -128 to 127 | 0 to 255 |
| `SMALLINT` | -32,768 to 32,767 | 0 to 65,535 |
| `MEDIUMINT` | -8,388,608 to 8,388,607 | 0 to 16,777,215 |
| `INT` | about ±2.1 billion | 0 to 4,294,967,295 |
| `BIGINT` | about ±9.2 × 10¹⁸ | 0 to about 1.8 × 10¹⁹ |

Check the edges: 0 to 300 doesn't fit `TINYINT UNSIGNED` (255), so it's `SMALLINT UNSIGNED`.

## Creating tables

```sql
CREATE TABLE Lesson (
  ID         SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  HorseID    SMALLINT UNSIGNED NOT NULL,
  StudentID  SMALLINT UNSIGNED,
  StartsAt   DATETIME NOT NULL,
  Fee        DECIMAL(5,2) NOT NULL DEFAULT 45.00 CHECK (Fee BETWEEN 20 AND 150),
  UNIQUE (HorseID, StartsAt),
  CONSTRAINT fk_lesson_horse FOREIGN KEY (HorseID) REFERENCES Horse(ID) ON DELETE CASCADE,
  FOREIGN KEY (StudentID) REFERENCES Student(ID) ON DELETE SET NULL
);
```

- **Composite primary key:** `PRIMARY KEY (HorseID, StartsAt)` on its own line.
- **Name a constraint** (`CONSTRAINT name ...`) when you'll need to drop it later.
- **Create the parent table first.** A foreign key can only point at a table that exists, at its primary key or a UNIQUE column.

## Foreign key delete rules

| `ON DELETE ...` | Deleting a parent row that has child rows |
|---|---|
| `CASCADE` | deletes the child rows too |
| `SET NULL` | keeps the child rows, sets their foreign key to NULL (the column must allow NULL) |
| `RESTRICT` / `NO ACTION` / no rule | refuses the delete: ERROR 1451 |

`ON UPDATE` works the same way when the parent's key value changes.

## Changing tables

| To | Write |
|---|---|
| add a column | `ALTER TABLE t ADD COLUMN d VARCHAR(20) AFTER other;` |
| change a column's type (same name) | `ALTER TABLE t MODIFY c VARCHAR(50) NOT NULL;` |
| rename and retype a column | `ALTER TABLE t CHANGE old new VARCHAR(50) NOT NULL;` |
| rename a column only | `ALTER TABLE t RENAME COLUMN old TO new;` |
| drop a column | `ALTER TABLE t DROP COLUMN c;` |
| add a primary key | `ALTER TABLE t ADD PRIMARY KEY (c);` |
| add a foreign key | `ALTER TABLE t ADD CONSTRAINT fk_name FOREIGN KEY (x) REFERENCES p(id);` |
| add a unique rule | `ALTER TABLE t ADD CONSTRAINT uq_name UNIQUE (c);` |
| add a check | `ALTER TABLE t ADD CONSTRAINT ck_name CHECK (x > 0);` |
| drop a primary key | `ALTER TABLE t DROP PRIMARY KEY;` |
| drop a foreign key, unique rule, or check | `ALTER TABLE t DROP FOREIGN KEY fk_name;` · `ALTER TABLE t DROP INDEX uq_name;` · `ALTER TABLE t DROP CHECK ck_name;` |
| rename a table | `ALTER TABLE t RENAME TO t2;` |
| remove a table | `DROP TABLE t;` (children first, if foreign keys point at it) |

`MODIFY` and `CHANGE` replace the **whole** column definition: write `NOT NULL`, `DEFAULT`, and `UNSIGNED` again, or they're gone.

## Changing data

```sql
INSERT INTO Student (FirstName, LastName) VALUES ('Ana', 'Ruiz'), ('Ben', 'Cho');
INSERT INTO Archive (ID, Name) SELECT ID, FirstName FROM Student WHERE City = 'Austin';
UPDATE Student SET City = 'Dallas' WHERE ID = 3;
DELETE FROM Student WHERE ID = 3;
```

- **List the columns** in an INSERT. Leave out an AUTO_INCREMENT column, and any column you want to get its DEFAULT.
- **UPDATE and DELETE without WHERE change every row.** Run the WHERE as a SELECT first.
- **`TRUNCATE TABLE t`** removes every row and restarts AUTO_INCREMENT; **`DELETE FROM t`** keeps the counter.
- **NULL is a value you write without quotes.** `'NULL'` is the text N-U-L-L.

## Queries

```sql
SELECT   Genre, COUNT(*) AS Books, AVG(Cost) AS AvgCost
FROM     Book
WHERE    Year >= 2000            -- filters rows, before grouping
GROUP BY Genre
HAVING   COUNT(*) > 1            -- filters groups, after grouping
ORDER BY Books DESC, Genre       -- ASC is the default
LIMIT    5;
```

- **Clause order:** SELECT, FROM, JOIN ... ON, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT.
- **GROUP BY:** every column in SELECT is either grouped or inside an aggregate (else ERROR 1055).
- **Aggregates in WHERE don't work** (ERROR 1111). Use HAVING, or a subquery: `WHERE Cost > (SELECT AVG(Cost) FROM Book)`.
- **NULL:** test with `IS NULL` / `IS NOT NULL`; `= NULL` is never true. Every aggregate except `COUNT(*)` skips NULLs. `NOT IN` a list that contains NULL returns nothing.
- **`COALESCE(Bonus, 0)`** turns NULL into 0 before you do math with it.
- **Text patterns:** `LIKE 'A%'` (starts with A), `'%son'` (ends with son), `'_a%'` (second letter a).

## Joins: the wording tells you which

| The question says | Join | Kept |
|---|---|---|
| no "if available" or "regardless" | `A JOIN B ON ...` (INNER) | only rows that match |
| "...the B value **if available**" | `A LEFT JOIN B ON ...` | every A row; B columns NULL where no match |
| "every B, **regardless of whether** it has an A" | `A RIGHT JOIN B ON ...` (or `B LEFT JOIN A`) | every B row |
| "A rows **with no** B" | `A LEFT JOIN B ON ... WHERE B.key IS NULL` | A rows that have no match |
| a table and itself (employee and manager) | `Employee e LEFT JOIN Employee m ON e.ManagerID = m.EmpID` | every employee |

## Views and indexes

```sql
CREATE VIEW AustinStudents AS SELECT ID, FirstName FROM Student WHERE City = 'Austin';
ALTER VIEW AustinStudents AS SELECT ID, FirstName, LastName FROM Student WHERE City = 'Austin';
DROP VIEW IF EXISTS AustinStudents;
CREATE INDEX idx_student_city ON Student (City);
CREATE UNIQUE INDEX idx_student_email ON Student (Email);
DROP INDEX idx_student_city ON Student;
```

- A **view** is a saved SELECT. It stores no rows; querying it runs the SELECT. Sort when you select *from* the view.
- An **index** speeds up lookups on its column and slows down changes to it. A PRIMARY KEY, a UNIQUE rule, and a foreign key each get one automatically.

</div>
