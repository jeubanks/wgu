# Beyond D427: transactions and more advanced SQL

[← Exercise index](exercises.md)

These exercises cover topics beyond D427. They're here for a later, more advanced SQL course.

- **Part A: Transactions** (START TRANSACTION, COMMIT, ROLLBACK)
- **Part B: More advanced queries and views** (LIMIT/OFFSET, quoted aliases, more CASE, numeric functions, FULL OUTER JOIN emulation, UNION, correlated and derived-table subqueries, WITH CHECK OPTION)

Both parts use the `d427` practice database. **Run `setup.sql` first** so you start from fresh data. The row counts assume you haven't done other exercises since.

## Part A: Transactions

> [!NOTE]
> **What is a transaction?** A transaction is a group of changes that MySQL treats as one unit: either all of them are kept, or none of them are.
>
> Normally MySQL is in **autocommit** mode: every INSERT, UPDATE, or DELETE is saved permanently the moment it finishes, and there's no undo. A transaction turns that off for a while:
>
> | Statement | What it does |
> |---|---|
> | `START TRANSACTION;` | Begins a transaction. From here on, your changes are only tentative. You can see them in your own queries, but nothing is saved yet. |
> | `COMMIT;` | Ends the transaction and saves every change since START TRANSACTION. |
> | `ROLLBACK;` | Ends the transaction and throws away every change since START TRANSACTION, as if they never happened. |
>
> After COMMIT or ROLLBACK, MySQL goes back to autocommit mode until the next START TRANSACTION. (`BEGIN;` is another way to write START TRANSACTION.)
>
> Things to know:
> - A transaction belongs to the connection that started it. Run every step in the **same** console or MySQL session.
> - Only changes to **rows** (INSERT, UPDATE, DELETE) can be rolled back. Statements that change the **structure**, like CREATE, ALTER, DROP, and TRUNCATE, save immediately and also commit any transaction that's open.
> - Banks use transactions for exactly this reason: moving money is two UPDATEs (take it from one account, add it to another), and you never want only one of them to happen.

- **T.1** Undoing a change with ROLLBACK. Run each step as its own statement, in the same console:
  - Count the movies.
  - Start a transaction: `START TRANSACTION;`
  - Delete all movies rated R.
  - Count the movies. The R-rated movies are gone, but only tentatively.
  - Undo everything since START TRANSACTION: `ROLLBACK;`
  - Count the movies again.

  *(check: 12 movies, then 9 during the transaction, then 12 after the rollback)*

  <details>
  <summary>Hint</summary>

  - `START TRANSACTION;` begins the transaction. Changes aren't permanent until `COMMIT`, and `ROLLBACK` undoes them.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT COUNT(*) AS Movies FROM Movie;              -- 12
  START TRANSACTION;
  DELETE FROM Movie WHERE RatingCode = 'R';
  SELECT COUNT(*) AS DuringTxn FROM Movie;           -- 9
  ROLLBACK;
  SELECT COUNT(*) AS AfterRollback FROM Movie;       -- 12 again
  ```

  </details>

- **T.2** A risky delete, inside a transaction so you can undo it:
  - Count the lessons in LessonSchedule.
  - Start a transaction.
  - Write a SELECT that uses a subquery to find every lesson taken by a student who lives in Austin. The city is in Student, but the lessons are in LessonSchedule.
  - Change the SELECT into a DELETE and run it.
  - Count the lessons again, then run ROLLBACK and count once more.

  *(6 rows in the SELECT; check: 12 lessons, then 6, then 12 after the rollback)*

  <details>
  <summary>Hint</summary>

  - The subquery finds the IDs of the students who live in Austin: `SELECT ID FROM Student WHERE City = 'Austin'`. It returns several IDs, so compare with IN.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT COUNT(*) AS Lessons FROM LessonSchedule;                   -- 12
  START TRANSACTION;
  SELECT * FROM LessonSchedule
  WHERE StudentID IN (SELECT ID FROM Student WHERE City = 'Austin'); -- 6 rows
  DELETE FROM LessonSchedule
  WHERE StudentID IN (SELECT ID FROM Student WHERE City = 'Austin');
  SELECT COUNT(*) AS Lessons FROM LessonSchedule;                   -- 6
  ROLLBACK;
  SELECT COUNT(*) AS Lessons FROM LessonSchedule;                   -- 12 again
  ```

  </details>

The rest of the exercises use a small scratch table. Create a table named **Visitor** with these columns first:

- `VisitorID`: a whole number that MySQL fills in automatically (auto-increment). It is the primary key.
- `FullName`: text up to 40 characters. It is required (cannot be NULL).
- `City`: text up to 20 characters.
- `Visits`: a whole number. It is required (cannot be NULL). If no value is given, it should be 0.

<details>
<summary>Solution</summary>

```sql
CREATE TABLE Visitor (
  VisitorID  INT AUTO_INCREMENT PRIMARY KEY,
  FullName   VARCHAR(40) NOT NULL,
  City       VARCHAR(20),
  Visits     INT NOT NULL DEFAULT 0
);
```

</details>

- **T.3** Making changes permanent with COMMIT:
  - Start a transaction and add these two visitors:

    | VisitorID | FullName | City | Visits |
    |---|---|---|---|
    | *(leave out)* | Fay Wong | Dallas | 2 |
    | *(leave out)* | Gus Hale | Waco | 1 |

  - Run `COMMIT;`, then run `ROLLBACK;`, then look at the table. Are the two visitors still there? Why?

  *(2 rows)*

  <details>
  <summary>Hint</summary>

  - COMMIT ends the transaction and makes its changes permanent. After that, ROLLBACK has nothing left to undo.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  START TRANSACTION;
  INSERT INTO Visitor (FullName, City, Visits) VALUES
    ('Fay Wong', 'Dallas', 2),
    ('Gus Hale', 'Waco',   1);
  COMMIT;
  ROLLBACK;                                     -- nothing to undo: the transaction already ended
  SELECT * FROM Visitor;                        -- both visitors are still there
  ```

  </details>

- **T.4** Start a transaction, then run `UPDATE Visitor SET Visits = Visits + 1;` with **no** WHERE clause. Look at the table, then ROLLBACK and look again. *(check: visits go to 3 and 2, then back to 2 and 1)*

  <details>
  <summary>Hint</summary>

  - Without a WHERE, an UPDATE changes every row. Inside a transaction, ROLLBACK can still undo it.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  START TRANSACTION;
  UPDATE Visitor SET Visits = Visits + 1;       -- every row changes
  SELECT * FROM Visitor;
  ROLLBACK;
  SELECT * FROM Visitor;                        -- back to 2 and 1
  ```

  </details>

- **T.5** DELETE versus TRUNCATE inside a transaction:
  - Start a transaction, run `DELETE FROM Visitor;` with **no** WHERE, and count the rows. Then ROLLBACK and count again.
  - Start another transaction, run `TRUNCATE TABLE Visitor;`, then ROLLBACK and count again. What's different?

  *(check: 0, then 2 after the first rollback; 0 after the TRUNCATE rollback)*

  <details>
  <summary>Hint</summary>

  - DELETE is DML, so a transaction can undo it. TRUNCATE is DDL: it commits right away.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  START TRANSACTION;
  DELETE FROM Visitor;                          -- no WHERE: every row
  SELECT COUNT(*) AS Visitors FROM Visitor;     -- 0
  ROLLBACK;
  SELECT COUNT(*) AS Visitors FROM Visitor;     -- 2: the DELETE was undone
  START TRANSACTION;
  TRUNCATE TABLE Visitor;
  ROLLBACK;
  SELECT COUNT(*) AS Visitors FROM Visitor;     -- 0: ROLLBACK can't undo a TRUNCATE
  ```

  </details>

- **T.6** Structure changes end a transaction. Start a transaction, add a visitor (Hal Ito from Austin), then run `CREATE TABLE TxDemo (x INT);`. Now ROLLBACK and look at Visitor. Is Hal Ito still there? Why? When you're done, drop the TxDemo and Visitor tables. *(1 row)*

  <details>
  <summary>Hint</summary>

  - CREATE, ALTER, DROP, and TRUNCATE commit any open transaction before they run.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  START TRANSACTION;
  INSERT INTO Visitor (FullName, City) VALUES ('Hal Ito', 'Austin');
  CREATE TABLE TxDemo (x INT);                  -- commits the INSERT first
  ROLLBACK;                                     -- nothing left to undo
  SELECT * FROM Visitor;                        -- Hal Ito is still there
  DROP TABLE TxDemo;
  DROP TABLE Visitor;
  ```

  </details>

- **T.7** Concept check: `DELETE FROM t;` and `TRUNCATE TABLE t;` both remove every row. Which one can be undone with ROLLBACK?

  <details>
  <summary>Answer</summary>

  **DELETE** can be rolled back. TRUNCATE is DDL: it commits immediately and can't be undone.

  </details>

## Part B: More advanced queries and views

Exercises B.1 to B.9 only read data. B.10 creates a view and changes one employee's salary.

- **B.1** Show the Title and Gross of the movies ranked **4th, 5th, and 6th** by Gross (highest first). Use `LIMIT` with `OFFSET`. Where would the movie with no Gross (NULL) end up in this ranking? *(3 rows)*

  <details>
  <summary>Hint</summary>

  - `LIMIT 3` keeps the first 3 rows. `LIMIT 3 OFFSET 3` skips the first 3, then keeps the next 3.
  - In descending order, MySQL puts NULLs last.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT Title, Gross
  FROM Movie
  ORDER BY Gross DESC
  LIMIT 3 OFFSET 3;                 -- also written  LIMIT 3, 3  (offset first, then count)
  -- The NULL Gross sorts last in DESC order, so it would be 12th.
  ```

  </details>

- **B.2** Show each employee's LastName and Salary, but make the column headings read **Last Name** and **Annual Salary**, with the spaces. Sort by salary, highest first. *(15 rows)*

  <details>
  <summary>Hint</summary>

  - An alias with a space must be in quotes: `AS "Last Name"`. MySQL also accepts backticks around the name.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT LastName AS "Last Name",
         Salary   AS "Annual Salary"
  FROM Employee
  ORDER BY Salary DESC;
  -- Quoted aliases are fine for display, but you'd have to quote them every time you use them,
  -- so most people use names like LastName or Annual_Salary instead.
  ```

  </details>

- **B.3** Use CASE to sort in your own order: list every student with Texas students first, then everyone else. Within each part, sort by LastName. (`ORDER BY State` alone won't work. Why not?) *(8 rows)*

  <details>
  <summary>Hint</summary>

  - ORDER BY can sort on an expression. Make a CASE that returns 0 for TX and 1 for everything else, and sort by it first.
  - `ORDER BY State` sorts alphabetically, and NM and OK come before TX.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT FirstName, LastName, State
  FROM Student
  ORDER BY CASE WHEN State = 'TX' THEN 0 ELSE 1 END,
           LastName;
  ```

  </details>

- **B.4** Numeric functions. For every movie that has a length, show the Title, Minutes, and these columns:
  - `Hours`: the whole hours in the movie (133 minutes is 2 hours). Use `FLOOR`.
  - `ExtraMinutes`: the minutes left over (133 minutes is 13 extra). Use `MOD`.
  - `BilledHours`: the hours a theater would book, rounding **up** (133 minutes needs 3). Use `CEIL`.
  - `OffFrom2Hours`: how far the length is from 120 minutes, in either direction. Use `ABS`.

  Sort by Minutes. Then compare `7 / 2`, `7 DIV 2`, and `MOD(7, 2)` in one SELECT with no FROM. *(11 rows)*

  <details>
  <summary>Hint</summary>

  - FLOOR rounds down to a whole number and CEIL rounds up. `MOD(a, b)` is the remainder when you divide a by b.
  - ABS removes the minus sign, so ABS(Minutes - 120) is the distance either way.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT Title, Minutes,
         FLOOR(Minutes / 60)  AS Hours,
         MOD(Minutes, 60)     AS ExtraMinutes,
         CEIL(Minutes / 60)   AS BilledHours,
         ABS(Minutes - 120)   AS OffFrom2Hours
  FROM Movie
  WHERE Minutes IS NOT NULL
  ORDER BY Minutes;
  SELECT 7 / 2, 7 DIV 2, MOD(7, 2);    -- 3.5000, 3, 1:  "/" keeps decimals, DIV drops them
  -- POW(2, 10) = 1024 and SQRT(144) = 12 are two more you may see.
  ```

  </details>

- **B.5** Counting by category with CASE. For each DeptID, show these columns: DeptID, `Over100k` (how many employees earn 100,000 or more), `Under100k` (how many earn less than 100,000), and `Total`. Sort by DeptID. *(6 rows)*

  <details>
  <summary>Hint</summary>

  - Inside SUM, a CASE that returns 1 or 0 counts the rows that match: `SUM(CASE WHEN Salary >= 100000 THEN 1 ELSE 0 END)`.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT DeptID,
         SUM(CASE WHEN Salary >= 100000 THEN 1 ELSE 0 END) AS Over100k,
         SUM(CASE WHEN Salary <  100000 THEN 1 ELSE 0 END) AS Under100k,
         COUNT(*)                                           AS Total
  FROM Employee
  GROUP BY DeptID
  ORDER BY DeptID;
  -- MySQL also lets you write SUM(Salary >= 100000), because a true comparison counts as 1,
  -- but the CASE form works in every database.
  ```

  </details>

- **B.6** MySQL does not support `FULL OUTER JOIN`. Write a query that gives the same result as a full outer join between Employee and Department. Show FirstName, LastName, and DeptName. Your result must include both Hedy Lamarr (who has no department) and Legal (which has no employees). *(16 rows)*

  <details>
  <summary>Hint</summary>

  - Combine a LEFT JOIN and a RIGHT JOIN of the same two tables with `UNION`.
  - UNION removes duplicate rows, so employees who appear in both halves show up only once.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  -- MySQL has no FULL OUTER JOIN; emulate it with LEFT JOIN UNION RIGHT JOIN.
  SELECT e.FirstName, e.LastName, d.DeptName
  FROM Employee e LEFT JOIN Department d ON e.DeptID = d.DeptID
  UNION
  SELECT e.FirstName, e.LastName, d.DeptName
  FROM Employee e RIGHT JOIN Department d ON e.DeptID = d.DeptID;
  ```

  </details>

- **B.7** Make one list of every city in the database: the City of every student, and the Location of every department.
  - Combine the two queries with `UNION`, then with `UNION ALL`. Why do the row counts differ?
  - Try adding DeptName to the second query only. What error do you get, and what does it tell you about the two SELECTs?

  *(8 rows with UNION, 14 rows with UNION ALL)*

  <details>
  <summary>Hint</summary>

  - `SELECT ... UNION SELECT ...` stacks the two results. Both SELECTs must return the same number of columns.
  - UNION removes duplicate rows; UNION ALL keeps them all.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT City FROM Student
  UNION
  SELECT Location FROM Department;          -- 8 rows: each city once (NULL counts as one value)
  SELECT City FROM Student
  UNION ALL
  SELECT Location FROM Department;          -- 14 rows: 8 students + 6 departments
  -- Expected to FAIL (the two SELECTs return different numbers of columns):
  --   SELECT City FROM Student UNION SELECT Location, DeptName FROM Department;
  --   ERROR 1222: The used SELECT statements have a different number of columns
  -- The column names come from the first SELECT, so the result's column is called City.
  ```

  </details>

- **B.8** For each department, show the employee who earns the most money. Show DeptName, FirstName, LastName, and Salary. Sort by Salary, highest first. *(5 rows)*

  <details>
  <summary>Hint</summary>

  - Compare each employee's salary with the MAX salary in their own department. This is a correlated subquery, like D427 exercise 6.2.
  - Join Department to get the department name.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT d.DeptName, e.FirstName, e.LastName, e.Salary
  FROM Employee e
  JOIN Department d ON e.DeptID = d.DeptID
  WHERE e.Salary = (SELECT MAX(e2.Salary) FROM Employee e2 WHERE e2.DeptID = e.DeptID)
  ORDER BY e.Salary DESC;
  ```

  </details>

- **B.9** Each department has a total payroll (the sum of the salaries of everyone in it). Show the DeptID and Payroll of each department whose total payroll is higher than the average total payroll of the departments that have employees. Use a subquery in the FROM clause (a derived table) to do this. *(2 rows)*

  <details>
  <summary>Hint</summary>

  - First write a query that returns each DeptID with its SUM(Salary). Then put that query in FROM, as a derived table.
  - A derived table must have an alias, like `AS t`.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT t.DeptID, t.Payroll
  FROM (SELECT DeptID, SUM(Salary) AS Payroll
        FROM Employee
        WHERE DeptID IS NOT NULL
        GROUP BY DeptID) AS t                  -- derived tables MUST have an alias
  WHERE t.Payroll > (SELECT AVG(Payroll)
                     FROM (SELECT SUM(Salary) AS Payroll
                           FROM Employee
                           WHERE DeptID IS NOT NULL
                           GROUP BY DeptID) AS t2);
  ```

  </details>

- **B.10** This exercise shows how `WITH CHECK OPTION` protects a view:
  - Create a view named **SupportStaff** that shows only the employees in DeptID 30. Add `WITH CHECK OPTION` to the view.
  - Through the view, give Edsger Dijkstra (EmpID 12) a raise of 1,000. *(check: his Salary goes from 68000.00 to 69000.00)*
  - Then, through the view, try to move employee 12 to DeptID 20. Read the error message.
  - Finally, answer this: can you UPDATE rows through a view that uses GROUP BY, like DeptSummary in D427 exercise 9.3? Why or why not?

  <details>
  <summary>Hint</summary>

  - `WITH CHECK OPTION` goes at the very end of CREATE VIEW.
  - MySQL refuses any change through the view that would move a row out of the view (here, a DeptID that isn't 30).

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  CREATE VIEW SupportStaff AS
  SELECT EmpID, FirstName, LastName, Salary, DeptID
  FROM Employee
  WHERE DeptID = 30
  WITH CHECK OPTION;
  UPDATE SupportStaff SET Salary = Salary + 1000 WHERE EmpID = 12;   -- allowed: simple view
  SELECT EmpID, Salary FROM Employee WHERE EmpID = 12;
  -- Expected to FAIL (row would fall outside the view):
  --   UPDATE SupportStaff SET DeptID = 20 WHERE EmpID = 12;
  --   ERROR 1369: CHECK OPTION failed
  -- DeptSummary is NOT updatable at all because it uses GROUP BY / aggregates.
  ```

  </details>

---

[← Exercise index](exercises.md)
