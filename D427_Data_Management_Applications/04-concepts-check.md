# Part 4: Concepts check

[← Exercise index](exercises.md)

About half of the assessment is multiple choice. These questions cover the concepts the practice tests ask about.

> [!TIP]
> Write down your answer before you open the **Answer** under a question. You don't need to run any SQL for this part. Most of the tables in these questions are not in the `d427` database.

## 13. Concepts check

- **13.1** DDL and DML.

  **a)** Label each statement **DDL** (Data Definition Language) or **DML** (Data Manipulation Language). If a statement is neither, write **other**.

  | Statement | DDL, DML, or other |
  |---|---|
  | `CREATE TABLE` | |
  | `INSERT` | |
  | `ALTER TABLE` | |
  | `UPDATE` | |
  | `CREATE INDEX` | |
  | `DELETE` | |
  | `DROP VIEW` | |
  | `CREATE VIEW` | |
  | `TRUNCATE TABLE` | |
  | `SELECT` | |

  **b)** Which one statement in the table changes the values in rows that already exist?

  **c)** Which one statement in the table changes the structure of a table that already exists?

  **d)** Which sentence describes the difference between DDL and DML?

  A. DDL defines the structure, and DML manages the data inside that structure.

  B. DDL manipulates the data, and DML defines the schema.

  C. DDL and DML are the same thing.

  <!-- solution:13.1 -->
  <details>
  <summary>Hint</summary>

  - DDL statements create, change, or remove database objects like tables, views, and indexes. DML statements work with the rows inside tables.

  </details>
  <!-- /solution -->

  <details>
  <summary>Answer</summary>

  - **a)** DDL: `CREATE TABLE`, `ALTER TABLE`, `CREATE INDEX`, `DROP VIEW`, `CREATE VIEW`, `TRUNCATE TABLE`. DML: `INSERT`, `UPDATE`, `DELETE`.
  - `SELECT`: zyBooks files it under DQL (Data Query Language), and many sources group it with DML. Either label is fine. It is never DDL.
  - **b)** `UPDATE`
  - **c)** `ALTER TABLE`
  - **d)** **A.** DDL defines the structure, and DML manages the data inside it.

  </details>

- **13.2** Pick the best MySQL data type for each column. Write the full type with its size, like `VARCHAR(10)` or `DECIMAL(4,1)`.

  | | Column | Your type |
  |---|---|---|
  | **a)** | Country names, like "Canada" or "Germany". The longest country name has 56 characters. Choose TEXT, CHAR(60), VARCHAR(56), or CHAR(255). | |
  | **b)** | A two-letter state code, like "TX" | |
  | **c)** | A price of up to $9,999.99 | |
  | **d)** | "integer ranging from 0 to 255" | |
  | **e)** | "integer with range 0 to 65 thousand" | |
  | **f)** | "integer with range 0 to 16 million" | |
  | **g)** | A date of birth | |
  | **h)** | The date and time a lesson starts | |
  | **i)** | "number with 3 significant digits and 1 decimal place" | |
  | **j)** | A 10-digit phone number stored with no symbols. Also say why INT is a bad choice. | |

  **k)** Which data type represents numbers with fractional values?

  A. Integer

  B. Decimal

  C. Character

  D. Binary
  - k) Which data type represents numbers with fractional values: Integer, Decimal, Character, or Binary?

  <!-- solution:13.2 -->
  <details>
  <summary>Hint</summary>

  - Ask three questions: Is it text, a whole number, or a number with decimals? Is it always the same length? How big can it get?
  - Whole-number ranges: TINYINT UNSIGNED 0–255, SMALLINT UNSIGNED 0–65,535, MEDIUMINT UNSIGNED 0–16,777,215, INT UNSIGNED 0–4,294,967,295.

  </details>
  <!-- /solution -->

  <details>
  <summary>Answer</summary>

  | | Type | Why |
  |---|---|---|
  | a | `VARCHAR(56)` | Variable length, sized to the data. CHAR pads every value to full length; TEXT is for long documents. |
  | b | `CHAR(2)` | Always exactly 2 characters. |
  | c | `DECIMAL(6,2)` | 4 digits before the point + 2 after. |
  | d | `TINYINT UNSIGNED` | 0 to 255 |
  | e | `SMALLINT UNSIGNED` | 0 to 65,535 |
  | f | `MEDIUMINT UNSIGNED` | 0 to 16,777,215 |
  | g | `DATE` | |
  | h | `DATETIME` | `TIMESTAMP` also stores a date and time. |
  | i | `DECIMAL(3,1)` | Precision 3 = total digits, scale 1 = digits after the point (max 99.9). |
  | j | `CHAR(10)` | You never do math on a phone number, INT drops leading zeros, and 5125550101 is bigger than INT's maximum (2,147,483,647). |
  | k | **B.** Decimal | |

  </details>

- **13.3** Choosing keys.

  **a)** The Book table has the columns genre VARCHAR(20), pages INT, author_id CHAR(3), and isbn_number VARCHAR(20). Which column should be the primary key? Which column should be the foreign key?

  **b)** The Exam table has the columns exam_id, exam_date, exam_reason, and patient_id. Which column is the primary key? Which column is the foreign key?

  **c)** Why is a column like first_name or birthdate a poor primary key?

  <!-- solution:13.3 -->
  <details>
  <summary>Hint</summary>

  - A primary key must be different for every row and should never change. A foreign key holds a value of another table's primary key.

  </details>
  <!-- /solution -->

  <details>
  <summary>Answer</summary>

  - **a)** Primary key `isbn_number` (unique per book). Foreign key `author_id` (it points to an Author table).
  - **b)** Primary key `exam_id`. Foreign key `patient_id`.
  - **c)** `first_name` and `birthdate` aren't unique (two people can share them), so they can't identify a row.

  </details>

- **13.4** The Invoice table has `FOREIGN KEY (customer_id) REFERENCES Customer(customer_id)`. A customer who has invoices is deleted. What happens to that customer's invoices if the foreign key says:

  **a)** `ON DELETE CASCADE`

  **b)** `ON DELETE SET NULL`

  **c)** `ON DELETE RESTRICT`

  **d)** nothing at all (no ON DELETE clause)

  **e)** One practice test writes `ON DELETE SET TO NULL`. What does MySQL do with that?

  **f)** One practice test declares the Invoice table's column as `customer_id INT NOT NULL UNIQUE`. What does the UNIQUE say about how many invoices a customer can have?

  <!-- solution:13.4 -->
  <details>
  <summary>Hint</summary>

  - CASCADE passes the delete on to the child rows. SET NULL keeps the child rows but clears the link. RESTRICT refuses the delete.

  </details>
  <!-- /solution -->

  <details>
  <summary>Answer</summary>

  - a) **CASCADE:** the invoices are deleted too.
  - b) **SET NULL:** the invoices stay, with `customer_id` set to NULL. The column must allow NULL.
  - c) **RESTRICT:** the DELETE of the customer is refused (ERROR 1451), and nothing changes.
  - d) **No clause:** the same as RESTRICT. MySQL's default is NO ACTION, which InnoDB treats as RESTRICT.
  - e) It's a syntax error (ERROR 1064). The correct form is `ON DELETE SET NULL`. The practice test still expects the SET NULL behavior as the answer.
  - f) Each `customer_id` can appear only once, so a customer can have at most one invoice. That makes it a one-to-one relationship.

  </details>

- **13.5** Table A is joined with Table B. For each join, which rows are **always** in the result?

  **a)** A INNER JOIN B

  **b)** A LEFT JOIN B

  **c)** A RIGHT JOIN B

  **d)** A FULL OUTER JOIN B. Does MySQL support FULL OUTER JOIN directly?

  **e)** A CROSS JOIN B, when A has 5 rows and B has 4 rows. How many rows does it return?

  <!-- solution:13.5 -->
  <details>
  <summary>Hint</summary>

  - For each join, ask: whose rows are guaranteed to be in the result, even when there's no match on the other side?

  </details>
  <!-- /solution -->

  <details>
  <summary>Answer</summary>

  - a) Only the rows in A and B that match the join condition.
  - b) Every row in A, plus the matching rows of B (NULLs where B has no match).
  - c) Every row in B, plus the matching rows of A.
  - d) Every row from both tables. MySQL does **not** support FULL OUTER JOIN directly. You emulate it with `LEFT JOIN ... UNION ... RIGHT JOIN` (see exercise B.6 in [later-advanced-sql.md](later-advanced-sql.md)).
  - e) 5 × 4 = 20 rows.

  </details>

- **13.6** Here are two tables.

  **Creator**

  | creator_id | name |
  |---|---|
  | 1 | Alice Johnson |
  | 2 | Bob Smith |
  | 3 | Carla Brown |
  | 4 | Dan White |
  | 5 | Eva Green |

  **Content**

  | content_id | creator_id | title |
  |---|---|---|
  | 1 | 10 | Understanding Databases |
  | 2 | 10 | Advanced SQL Tips |
  | 3 | 2 | Intro to Media Production |
  | 4 | 2 | The Role of Producers |
  | 5 | 3 | How to Host a Podcast |

  This query returns the result below:

  ```sql
  SELECT name, title
  FROM Creator ___ JOIN Content ON Creator.creator_id = Content.creator_id;
  ```

  | name | title |
  |---|---|
  | Alice Johnson | NULL |
  | Bob Smith | Intro to Media Production |
  | Bob Smith | The Role of Producers |
  | Carla Brown | How to Host a Podcast |
  | Dan White | NULL |
  | Eva Green | NULL |

  **a)** Which join fills the blank?

  A. FULL

  B. RIGHT

  C. LEFT

  D. INNER

  E. CROSS

  **b)** How many rows would each of the other four joins return?

  <!-- solution:13.6 -->
  <details>
  <summary>Hint</summary>

  - Look at the creators who have no content: Alice, Dan, and Eva. They're in the result with NULL titles. Which table's rows were all kept?

  </details>
  <!-- /solution -->

  <details>
  <summary>Answer</summary>

  **a)** **C. LEFT JOIN.** Every Creator is kept, and Alice, Dan, and Eva get NULL titles.

  **b)** The other joins:
  - INNER: 3 rows
  - RIGHT: 5 rows (the two posts by creator_id 10 get a NULL name)
  - FULL: 8 rows (the 6 LEFT rows + the 2 unmatched Content rows). MySQL has no FULL JOIN, so this is the standard SQL answer.
  - CROSS: 5 × 5 = 25 rows. A true cross join has no ON condition. MySQL accepts `CROSS JOIN ... ON` and treats it as an INNER JOIN, which returns 3 rows.

  </details>

- **13.7** Outer joins and self-joins. Assume a Book table with an AuthorID column and an Author table with ID and Name columns. These two tables are not in `d427`.

  **a)** Which query performs an **outer join** of the Book table with a **different** table? For each wrong answer, say what's wrong with it.

  A. `SELECT B.Title, A.Name FROM Book B, Author A WHERE B.AuthorID = A.ID;`

  B. `SELECT B.Title, A.Name FROM Book B LEFT JOIN Book MB ON B.ID = MB.ID, Author A;`

  C. `SELECT B.Title, A.Name FROM Book B RIGHT JOIN Author A ON B.AuthorID = A.ID;`

  D. `SELECT B.Title, A.Name FROM Book B INNER JOIN Author A ON B.AuthorID = A.ID;`

  **b)** Which query performs an **outer self-join** on the Employee table?

  A. `SELECT E.LastName, M.LastName FROM Employee E LEFT JOIN Employee M ON E.ManagerID = M.EmpID;`

  B. `SELECT E.LastName, M.LastName FROM Employee E INNER JOIN Employee M ON E.ManagerID = M.EmpID;`

  C. `SELECT E.LastName, D.DeptName FROM Employee E LEFT JOIN Department D ON E.DeptID = D.DeptID;`

  <!-- solution:13.7 -->
  <details>
  <summary>Hint</summary>

  - An outer join uses LEFT, RIGHT, or FULL JOIN. For the first question, it also has to join to a *different* table.
  - A self-join joins a table to itself, using two aliases.

  </details>
  <!-- /solution -->

  <details>
  <summary>Answer</summary>

  **a)** **C** is the outer join with a different table.
  - A: an inner join written in the old comma style (the join condition is in WHERE).
  - B: it LEFT JOINs Book with **itself** (a self-join), then comma-joins Author with no condition, which is a cross join. MySQL runs it, but it isn't an outer join with Author. The practice-test key calls it "invalid". Either way it's the wrong answer.
  - D: an inner join.

  **b)** **A** is the outer self-join. B is an inner self-join, and C is an outer join with a different table.

  </details>

- **13.8** Fill in each blank with LEFT, RIGHT, or INNER.

  **a)** "List all patients, regardless of whether they had an exam": `FROM Patient ___ JOIN Exam ON ...`

  **b)** "List all model types, regardless of whether a model was assigned to that type": `FROM Models ___ JOIN Model_Type ON ...`

  **c)** "Display the Title (if available) and TotalSales for all YearSales": `FROM Book ___ JOIN YearSales ON ...`

  **d)** "List all model IDs, the model type they are assigned, and their hourly fees": `FROM Models ___ JOIN Model_Type ON ...`

  <!-- solution:13.8 -->
  <details>
  <summary>Hint</summary>

  - Find the table whose rows must all appear ("all patients", "all YearSales"). Is it on the left or the right of JOIN?
  - With no "if available" or "regardless" wording, it's INNER.

  </details>
  <!-- /solution -->

  <details>
  <summary>Answer</summary>

  - a) **LEFT**: Patient is on the left, and you keep all patients.
  - b) **RIGHT**: Model_Type is on the right, and you keep all model types.
  - c) **RIGHT**: YearSales is on the right; "if available" marks Book as the optional side.
  - d) **INNER**: there's no "if available" or "regardless" wording.

  </details>

- **13.9** Views.

  **a)** Which **two** statements are true about a **materialized view**?

  A. It is a base table.

  B. It is stored.

  C. It must be refreshed whenever its base tables change.

  D. Its results are stored as a temporary table.

  **b)** Is a regular (non-materialized) view's data stored on disk? What happens each time you select from it?

  **c)** Does MySQL support materialized views?

  **d)** Why can't you UPDATE rows through a view that uses GROUP BY?

  <!-- solution:13.9 -->
  <details>
  <summary>Hint</summary>

  - "Materialized" means the results are actually saved, not worked out again each time.

  </details>
  <!-- /solution -->

  <details>
  <summary>Answer</summary>

  - **a)** **B and C.** A materialized view is stored, and it must be refreshed when its base tables change.
  - **b)** No. A regular view stores only its query. Each SELECT from it re-runs that query against the base tables.
  - **c)** No. MySQL has no materialized views. You'd build one yourself as a table that you refresh.
  - **d)** Each row of a GROUP BY view is a summary of many base rows, so there is no single row to update.

  </details>

- **13.10** Indexes. Mark each statement **True** or **False**.

  | | Statement | True or False |
  |---|---|---|
  | **a)** | An index on a column in Table B must be updated when a new row is added to Table B. | |
  | **b)** | An index on Table B's LastName column must be updated when a different column in Table B is updated. | |
  | **c)** | An index must be updated when another table is joined with Table B. | |
  | **d)** | A **dense** index has an entry for every row in the table. | |
  | **e)** | A **sparse** index has an entry for every row in the table. | |
  | **f)** | Indexes make SELECT ... WHERE faster, but they make INSERT, UPDATE, and DELETE slower. | |
  | **g)** | A **hash** index is good for equality searches (`=`) but not for range searches (`BETWEEN`, `<`). | |
  | **h)** | A **bitmap** index works best on columns with many distinct values, like Email. | |
  | **i)** | When a query returns most of the rows in a table, a full table scan can be faster than using an index. | |
  | **j)** | In MySQL, `CREATE INDEX` is a DML statement. | |

  <!-- solution:13.10 -->
  <details>
  <summary>Hint</summary>

  - An index is a sorted list of one column's values, each with a pointer to its row. Does the change alter that column's values, or add or remove rows?
  - Dense means one entry per row. Sparse means one entry per block of rows.

  </details>
  <!-- /solution -->

  <details>
  <summary>Answer</summary>

  | | Answer | Why |
  |---|---|---|
  | a | True | Every new row needs an index entry (so does every deleted row). |
  | b | False | Only changes to the indexed column touch that index. |
  | c | False | Reading a table (a join) never changes an index. |
  | d | True | |
  | e | False | A sparse index has one entry per block (page) of rows, and the table must be sorted on the indexed column. |
  | f | True | Every write also has to maintain each index. |
  | g | True | |
  | h | False | Bitmap indexes suit columns with **few** distinct values (Gender, State, Yes/No). |
  | i | True | When most rows match, reading the table straight through beats jumping back and forth. |
  | j | False | CREATE INDEX defines structure, so it's DDL. |

  </details>

- **13.11** Entity-relationship modeling.

  **a)** "Children living within the boundaries of two school districts will be attending one of four different schools." How many entities are in this sentence? Name them.

  **b)** "A person can have many skills." What is the cardinality of the relationship between Person and Skill? What extra fact would you need before you could be sure? How would you build a many-to-many relationship as tables?

  **c)** "Each patient in a hospital is prescribed a unique treatment plan composed of medications sourced from various pharmaceutical companies. Doctors create each treatment plan." Which entity has a direct relationship with Patient?

  A. Treatment Plan

  B. Pharmaceutical Company

  C. Hospital

  D. Doctor

  **d)** Fill in the **degree** (unary, binary, or ternary) and the **cardinality** (one-to-one, one-to-many, or many-to-many) of each relationship.

  | Relationship | Degree | Cardinality |
  |---|---|---|
  | An employee manages other employees. | | |
  | A person is married to one other person, and both are in the Person table. | | |
  | A course can be a prerequisite for other courses, and can have several prerequisites of its own. | | |
  | A student enrolls in many courses, and a course has many students. | | |
  | A supplier supplies a part to a project. | | *(not asked)* |

  **e)** When an ER diagram becomes tables, what does each item become?

  | ER diagram item | Becomes |
  |---|---|
  | An entity | |
  | An attribute | |
  | A one-to-many relationship | |
  | A many-to-many relationship | |

  <!-- solution:13.11 -->
  <details>
  <summary>Hint</summary>

  - Entities are the nouns you'd store rows for. Words like "two" and "four" tell you how many, not what.
  - A relationship's degree is how many entity types take part in it: one (unary), two (binary), or three (ternary).

  </details>
  <!-- /solution -->

  <details>
  <summary>Answer</summary>

  - **a)** **3 entities:** Child, School District, and School. "Two" and "four" are counts, not entities.
  - **b)** As written, one person has many skills (one-to-many from Person to Skill). If a skill can belong to many people, which is almost always true, it is **many-to-many**. Build a many-to-many relationship with a linking table: `PersonSkill(PersonID FK, SkillID FK, PRIMARY KEY (PersonID, SkillID))`.
  - **c)** **A. Treatment Plan.** The patient is prescribed the plan. Doctors and companies relate to the plan, not directly to the patient.

  **d)**

  | Relationship | Degree | Cardinality |
  |---|---|---|
  | manages | Unary | One-to-many |
  | married to | Unary | One-to-one |
  | prerequisite | Unary | Many-to-many |
  | enrolls | Binary | Many-to-many |
  | supplier / part / project | Ternary (three entities in one relationship) | *(not asked)* |

  **e)**

  | ER diagram item | Becomes |
  |---|---|
  | An entity | A table |
  | An attribute | A column |
  | A one-to-many relationship | A foreign key in the "many" table |
  | A many-to-many relationship | A new linking table with two foreign keys (usually its composite primary key) |

  </details>

- **13.12** NULLs and aggregates.

  **a)** What do `NULL = NULL`, `NULL <> 5`, and `5 + NULL` return?

  **b)** A table has 3 rows. One column holds the values 10, NULL, and 20. What do COUNT(*), COUNT(column), SUM(column), and AVG(column) return?

  **c)** Which aggregate function gives the number of rows that have a non-NULL value in a given column?

  **d)** Why can't an aggregate function appear in a WHERE clause? What do you use instead?

  <!-- solution:13.12 -->
  <details>
  <summary>Hint</summary>

  - NULL means "unknown". Comparing anything with an unknown value, or adding to it, gives unknown.
  - Every aggregate function except COUNT(*) skips NULLs.

  </details>
  <!-- /solution -->

  <details>
  <summary>Answer</summary>

  - a) All three return **NULL** (UNKNOWN). Use `IS NULL` / `IS NOT NULL` to test for NULL.
  - b) COUNT(*) = **3**, COUNT(column) = **2**, SUM = **30**, AVG = **15**. AVG ignores the NULL; it does not count it as 0.
  - c) **COUNT(column)**
  - d) WHERE is checked one row at a time, before the rows are grouped, so no aggregate exists yet. Use **HAVING** to filter groups, or a subquery to compare against a total (exercise 12.6).

  </details>

- **13.13** Fill in each blank.

  **a)** A(n) _____ is a query that is nested inside another query.

  **b)** The _____ condition of a JOIN usually compares a foreign key with the primary key it references.

  **c)** The _____ function combines two columns (or strings) into one.

  **d)** The _____ keyword removes duplicate rows from a result.

  **e)** The _____ clause filters groups after GROUP BY.

  **f)** If ORDER BY doesn't say ASC or DESC, the sort order is _____.

  **g)** In MySQL, NULLs sort _____ in ascending order.

  **h)** `DELETE FROM t;` and `TRUNCATE TABLE t;` both remove every row. After _____, the next AUTO_INCREMENT value starts over at 1.

  <!-- solution:13.13 -->
  <details>
  <summary>Hint</summary>

  - All of these words come up in Sections 3 to 7 and in the practice tests.

  </details>
  <!-- /solution -->

  <details>
  <summary>Answer</summary>

  - a) subquery
  - b) ON
  - c) CONCAT()
  - d) DISTINCT
  - e) HAVING
  - f) ascending (ASC)
  - g) first
  - h) **TRUNCATE.** It empties the table by re-creating it, which resets the AUTO_INCREMENT counter. After a DELETE, the counter keeps going from where it was (exercise 7.13).

  </details>

---

[← Exercise index](exercises.md)
