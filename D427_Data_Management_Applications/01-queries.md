# Part 1: Querying data

[← Exercise index](exercises.md) · Solutions: [`solutions.sql`](solutions.sql)

These sections only read data, so you can redo any exercise at any time.

**In this part:** [1. SELECT basics](#1-select-basics) · [2. Filtering](#2-filtering) · [3. Built-in functions](#3-built-in-functions) · [4. Aggregates, GROUP BY, HAVING](#4-aggregates-group-by-having) · [5. Joins](#5-joins) · [6. Subqueries](#6-subqueries)

## 1. SELECT basics


### Movie

- **1.1** Show all columns for every movie in the Movie table. *(12 rows)*

  <!-- solution:1.1 -->
  <details>
  <summary>Hint</summary>

  - `*` selects every column.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT * FROM Movie;
  ```

  </details>
  <!-- /solution -->

- **1.2** Show the Title and ReleaseYear of every movie. Sort the list so the newest movie is first. If two movies came out in the same year, sort those movies by Title from A to Z. One movie has no release year (NULL). Where does it show up in your list? *(12 rows)*

  <!-- solution:1.2 -->
  <details>
  <summary>Hint</summary>

  - Sort on two columns, separated by a comma: `ORDER BY col1 DESC, col2 ASC`.
  - MySQL puts NULLs first in ascending order and last in descending order.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT Title, ReleaseYear
  FROM Movie
  ORDER BY ReleaseYear DESC, Title ASC;
  -- Note: NULLs sort FIRST in ASC and LAST in DESC in MySQL.
  ```

  </details>
  <!-- /solution -->

- **1.3** Show each Genre from the Movie table only once, with no repeats. One movie has no genre (NULL), and DISTINCT keeps NULL as one of the values. *(5 rows)*

  <!-- solution:1.3 -->
  <details>
  <summary>Hint</summary>

  - The `DISTINCT` keyword goes right after SELECT.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT DISTINCT Genre FROM Movie;
  ```

  </details>
  <!-- /solution -->

- **1.4** Show the Title and Gross of the three movies that earned the most money (the highest Gross). *(3 rows)*

  <!-- solution:1.4 -->
  <details>
  <summary>Hint</summary>

  - Sort by Gross from highest to lowest, then keep only the first rows with `LIMIT`.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT Title, Gross
  FROM Movie
  ORDER BY Gross DESC
  LIMIT 3;
  ```

  </details>
  <!-- /solution -->

### Employee

- **1.5** Show the FirstName, LastName, and Salary of every employee who earns more than 150,000. *(4 rows)*

  <!-- solution:1.5 -->
  <details>
  <summary>Hint</summary>

  - Filter with WHERE and `>`. Write the number without the comma: 150000.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT FirstName, LastName, Salary
  FROM Employee
  WHERE Salary > 150000;
  ```

  </details>
  <!-- /solution -->

- **1.6** For every employee, show two columns:
  - `FullName`: the first name and last name joined together with a space between them, in one column.
  - `MonthlyPay`: the yearly Salary divided by 12, rounded to 2 decimal places.

  Sort the list so the highest monthly pay is first. *(15 rows)*

  <!-- solution:1.6 -->
  <details>
  <summary>Hint</summary>

  - `CONCAT(a, ' ', b)` joins strings together, and `ROUND(x, 2)` rounds to 2 decimal places.
  - Name each expression with `AS`. You can sort by that name in ORDER BY.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT CONCAT(FirstName, ' ', LastName) AS FullName,
         ROUND(Salary / 12, 2)            AS MonthlyPay
  FROM Employee
  ORDER BY MonthlyPay DESC;   -- aliases are allowed in ORDER BY (not in WHERE)
  ```

  </details>
  <!-- /solution -->

---

## 2. Filtering


### Movie

- **2.1** Show the movies that came out in 2014, 2015, or 2016. Use `BETWEEN` to do this. *(6 rows)*

  <!-- solution:2.1 -->
  <details>
  <summary>Hint</summary>

  - `BETWEEN low AND high` includes both ends.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT Title, ReleaseYear FROM Movie
  WHERE ReleaseYear BETWEEN 2014 AND 2016;      -- inclusive on both ends
  ```

  </details>
  <!-- /solution -->

- **2.2** Show the movies that are rated G or PG. Use `IN` to do this. *(4 rows)*

  <!-- solution:2.2 -->
  <details>
  <summary>Hint</summary>

  - `col IN ('a', 'b')` is a short way to write `col = 'a' OR col = 'b'`.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT Title, RatingCode FROM Movie
  WHERE RatingCode IN ('G', 'PG');
  ```

  </details>
  <!-- /solution -->

- **2.3** Show the movies whose title starts with the word "The" (for example, "The Matrix"). *(3 rows)*

  <!-- solution:2.3 -->
  <details>
  <summary>Hint</summary>

  - Use `LIKE` with `%`, which matches any number of characters.
  - Put a space after "The" in the pattern, or a title like "Theory" would match too.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT Title FROM Movie
  WHERE Title LIKE 'The %';
  ```

  </details>
  <!-- /solution -->

### Student

- **2.4** Show the students whose last name has the letter "a" as its **second** letter (for example, "Garcia"). *(3 rows)*

  <!-- solution:2.4 -->
  <details>
  <summary>Hint</summary>

  - In a LIKE pattern, `_` matches exactly one character and `%` matches any number of characters.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT FirstName, LastName FROM Student
  WHERE LastName LIKE '_a%';                     -- _ = exactly one char, % = zero or more
  ```

  </details>
  <!-- /solution -->

- **2.5** Show the students who live in Austin or in Round Rock **and** who have a phone number.
  - After it works, remove the parentheses from your WHERE clause and run it again.
  - Explain why the result is different. *(4 rows)*

  <!-- solution:2.5 -->
  <details>
  <summary>Hint</summary>

  - AND is evaluated before OR. Use parentheses to keep the two cities together.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT FirstName, LastName, City, Phone FROM Student
  WHERE (City = 'Austin' OR City = 'Round Rock')
    AND Phone IS NOT NULL;
  -- AND binds tighter than OR. Drop the parentheses and you get
  -- "Austin  OR  (Round Rock AND has phone)" - a different question: Priya (Austin,
  -- no phone) sneaks in, so you get 5 rows instead of 4.
  ```

  </details>
  <!-- /solution -->

### Employee

- **2.6** Show the employees who do not have an email address (their Email is NULL). *(2 rows)*

  <!-- solution:2.6 -->
  <details>
  <summary>Hint</summary>

  - `= NULL` never matches anything. Use `IS NULL`.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT EmpID, FirstName, LastName FROM Employee
  WHERE Email IS NULL;                           -- "= NULL" never matches anything
  ```

  </details>
  <!-- /solution -->

### Horse

- **2.7** Show the horses whose breed is **not** Quarter Horse. Include horses whose breed is unknown (NULL).
  - First, write the query without doing anything special for NULL. Count the rows.
  - Then fix the query so the horse with an unknown breed is included. Compare the two results. *(8 rows)*

  <!-- solution:2.7 -->
  <details>
  <summary>Hint</summary>

  - When Breed is NULL, `Breed <> 'Quarter Horse'` is UNKNOWN, not TRUE, so WHERE drops that row.
  - Add a second condition with OR to keep the horse whose breed is NULL.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT RegisteredName, Breed FROM Horse
  WHERE Breed <> 'Quarter Horse' OR Breed IS NULL;
  -- Without the IS NULL test, 'Blue Ribbon' disappears: NULL <> 'x' is UNKNOWN, not TRUE.
  ```

  </details>
  <!-- /solution -->

---

## 3. Built-in functions


### Student

- **3.1** For every student, show their last name in all capital letters, and the number of letters in their first name. *(8 rows)*

  <!-- solution:3.1 -->
  <details>
  <summary>Hint</summary>

  - `UPPER()` turns text into capital letters, and `LENGTH()` counts characters.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT UPPER(LastName) AS LastUpper,
         LENGTH(FirstName) AS FirstLen
  FROM Student;
  ```

  </details>
  <!-- /solution -->

- **3.2** For every student who has a phone number, show the phone number in this format: `(512) 555-0101`. The Phone column stores only the 10 digits, with no spaces or symbols. Leave out students who have no phone number. *(6 rows)*

  <!-- solution:3.2 -->
  <details>
  <summary>Hint</summary>

  - `SUBSTRING(Phone, start, length)` returns part of a string. Positions start at 1.
  - Glue the pieces and the symbols together with `CONCAT()`.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT FirstName, LastName,
         CONCAT('(', SUBSTRING(Phone, 1, 3), ') ',
                     SUBSTRING(Phone, 4, 3), '-',
                     SUBSTRING(Phone, 7, 4)) AS FormattedPhone
  FROM Student
  WHERE Phone IS NOT NULL;
  ```

  </details>
  <!-- /solution -->

### Employee

- **3.3** For every employee, show how many full years they have worked here as of 2026-10-01. Use `TIMESTAMPDIFF` to do this. Sort the list so the employee who has worked here the longest is first. *(15 rows)*

  <!-- solution:3.3 -->
  <details>
  <summary>Hint</summary>

  - `TIMESTAMPDIFF(YEAR, start, end)` counts the whole years between two dates. Use '2026-10-01' as the end date.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT FirstName, LastName, HireDate,
         TIMESTAMPDIFF(YEAR, HireDate, '2026-10-01') AS YearsOfService
  FROM Employee
  ORDER BY YearsOfService DESC;
  ```

  </details>
  <!-- /solution -->

### LessonSchedule

- **3.4** For every lesson in LessonSchedule, show:
  - the HorseID
  - only the date part of LessonDateTime
  - only the time part of LessonDateTime
  - the name of the day of the week (for example, "Monday")

  Sort the lessons from earliest to latest. *(12 rows)*

  <!-- solution:3.4 -->
  <details>
  <summary>Hint</summary>

  - `DATE()`, `TIME()`, and `DAYNAME()` each take a DATETIME value and return one part of it.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT HorseID,
         DATE(LessonDateTime)      AS LessonDate,
         TIME(LessonDateTime)      AS LessonTime,
         DAYNAME(LessonDateTime)   AS DayOfWeek
  FROM LessonSchedule
  ORDER BY LessonDateTime;
  ```

  </details>
  <!-- /solution -->

### Movie

- **3.5** For every movie, show the Title, the Minutes, and a new column named `LengthClass`. Fill in `LengthClass` using these rules:
  - "Short" if the movie is less than 100 minutes
  - "Standard" if the movie is 100 to 139 minutes
  - "Long" if the movie is 140 minutes or more
  - "Unknown" if Minutes is NULL

  *(12 rows)*

  <!-- solution:3.5 -->
  <details>
  <summary>Hint</summary>

  - Use a `CASE WHEN ... THEN ... ELSE ... END` expression.
  - CASE uses the first WHEN that is true, so check for NULL first.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT Title, Minutes,
         CASE
           WHEN Minutes IS NULL THEN 'Unknown'
           WHEN Minutes < 100   THEN 'Short'
           WHEN Minutes < 140   THEN 'Standard'
           ELSE                      'Long'
         END AS LengthClass
  FROM Movie;
  ```

  </details>
  <!-- /solution -->

- **3.6** For every movie, show the Title and the Genre. If the Genre is NULL, show the word "Unclassified" instead. *(12 rows)*

  <!-- solution:3.6 -->
  <details>
  <summary>Hint</summary>

  - `COALESCE(col, 'something')` returns 'something' when col is NULL. (`IFNULL` works the same way.)

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT Title, COALESCE(Genre, 'Unclassified') AS Genre   -- IFNULL(Genre,'Unclassified') also fine
  FROM Movie;
  ```

  </details>
  <!-- /solution -->

- **3.7** For every movie, show the Title and the Gross in millions of dollars, rounded to one decimal place. For example, Arrival's Gross of 100,546,139 should show as 100.5. Leave out movies with no Gross (NULL). Sort the list so the largest amount is first. *(11 rows)*

  <!-- solution:3.7 -->
  <details>
  <summary>Hint</summary>

  - Divide by 1000000, then round with `ROUND(..., 1)`.
  - Leave out the NULL gross with `IS NOT NULL`.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT Title, ROUND(Gross / 1000000, 1) AS GrossMillions
  FROM Movie
  WHERE Gross IS NOT NULL
  ORDER BY GrossMillions DESC;
  ```

  </details>
  <!-- /solution -->

---

## 4. Aggregates, GROUP BY, HAVING

> [!NOTE]
> **WHERE or HAVING?** Both clauses filter. The difference is *when* they filter.
>
> - **WHERE** filters single rows, *before* they are grouped. Use it when the condition is about one row's own values: "employees hired after 2020", "movies whose genre is not NULL".
> - **HAVING** filters whole groups, *after* GROUP BY. Use it when the condition is about a group's **count, total, average, minimum, or maximum**: "departments **with 3 or more** employees", "genres **whose average** length is over 2 hours".
>
> **How to spot a HAVING question:** look for "each [group] that has / with / whose [count, total, or average] …". If the condition only makes sense after you've counted or added something up, it goes in HAVING. An aggregate like `COUNT(*)` or `AVG(Salary)` can't go in WHERE: MySQL rejects it with ERROR 1111.
>
> A query can use both. The clauses always come in this order:
>
> ```sql
> SELECT   ...
> FROM     ...
> WHERE    ...   -- 1. throw out rows
> GROUP BY ...   -- 2. put the rows that are left into groups
> HAVING   ...   -- 3. throw out groups
> ORDER BY ...   -- 4. sort what's left
> ```

### Movie

- **4.1** Write one query that returns one row with two numbers:
  - the total number of movies
  - the number of movies that have a rating (RatingCode is not NULL)

  Why are the two numbers different? *(1 row)*

  <!-- solution:4.1 -->
  <details>
  <summary>Hint</summary>

  - `COUNT(*)` counts rows. `COUNT(column)` counts only the rows where that column is not NULL.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT COUNT(*)          AS TotalMovies,
         COUNT(RatingCode) AS RatedMovies     -- COUNT(col) skips NULLs
  FROM Movie;
  ```

  </details>
  <!-- /solution -->

- **4.2** For each genre, show the total Gross of all its movies. Sort the list so the largest total is first. Leave out movies whose genre is NULL. *(4 rows)*

  <!-- solution:4.2 -->
  <details>
  <summary>Hint</summary>

  - "Leave out movies whose genre is NULL" is about single rows, so it goes in WHERE.
  - Then GROUP BY Genre and add up the Gross with `SUM()`.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT Genre, SUM(Gross) AS TotalGross
  FROM Movie
  WHERE Genre IS NOT NULL
  GROUP BY Genre
  ORDER BY TotalGross DESC;
  ```

  </details>
  <!-- /solution -->

### Employee

- **4.3** Write one query that returns one row with these four numbers for all employees: the average salary (rounded to 2 decimal places), the lowest salary, the highest salary, and the total of all salaries. *(1 row)*

  <!-- solution:4.3 -->
  <details>
  <summary>Hint</summary>

  - `AVG`, `MIN`, `MAX`, and `SUM` can all go in one SELECT. Without GROUP BY, they summarize the whole table as one row.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT ROUND(AVG(Salary), 2) AS AvgSalary,
         MIN(Salary)           AS MinSalary,
         MAX(Salary)           AS MaxSalary,
         SUM(Salary)           AS Payroll
  FROM Employee;
  ```

  </details>
  <!-- /solution -->

- **4.4** Show how many employees are in each DeptID. What happens to the employee who has no department? *(6 rows)*

  <!-- solution:4.4 -->
  <details>
  <summary>Hint</summary>

  - GROUP BY DeptID, and use `COUNT(*)` to count each group.
  - Look for a row whose DeptID is NULL.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT DeptID, COUNT(*) AS Headcount
  FROM Employee
  GROUP BY DeptID;      -- employees with NULL DeptID form their own group
  ```

  </details>
  <!-- /solution -->

- **4.5** Show each DeptID where the average salary of its employees is more than 120,000. *(3 rows)*

  <!-- solution:4.5 -->
  <details>
  <summary>Hint</summary>

  - "More than 120,000" is about each department's **average**, not about one employee's salary.
  - A condition on an aggregate like `AVG(Salary)` goes in HAVING, after GROUP BY.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT DeptID, ROUND(AVG(Salary), 2) AS AvgSalary
  FROM Employee
  GROUP BY DeptID
  HAVING AVG(Salary) > 120000;
  -- WHERE filters rows before grouping; HAVING filters groups after.
  ```

  </details>
  <!-- /solution -->

- **4.6** This one needs **both** WHERE and HAVING. For each DeptID, count the employees who were hired on or after 2018-01-01. Show only the departments where that count is 2 or more. Name the count column RecentHires.
  - Which condition goes in WHERE, and which goes in HAVING? Why?
  - Then remove the WHERE clause and run it again. Why do you get more rows?

  *(3 rows, then 5 rows)*

  <!-- solution:4.6 -->
  <details>
  <summary>Hint</summary>

  - "Hired on or after 2018-01-01" is about one employee's row, so it goes in WHERE.
  - "2 or more" is about the group's count, so it goes in HAVING.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT DeptID, COUNT(*) AS RecentHires
  FROM Employee
  WHERE HireDate >= '2018-01-01'      -- about ONE employee's row  -> WHERE (before grouping)
  GROUP BY DeptID
  HAVING COUNT(*) >= 2;               -- about the GROUP's count   -> HAVING (after grouping)
  -- Without the WHERE, every employee is counted, so more departments reach 2:
  SELECT DeptID, COUNT(*) AS Headcount
  FROM Employee
  GROUP BY DeptID
  HAVING COUNT(*) >= 2;               -- 5 rows
  ```

  </details>
  <!-- /solution -->

### LessonSchedule

- **4.7** Using the LessonSchedule table, show each HorseID that has two or more lessons scheduled. (Each row in LessonSchedule is one lesson. Its HorseID column holds the ID of a horse in the Horse table.) *(3 rows)*

  <!-- solution:4.7 -->
  <details>
  <summary>Hint</summary>

  - "Two or more lessons" is a count of each horse's lessons. You only know it after you GROUP BY HorseID.
  - So the condition goes in HAVING, not WHERE.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT HorseID, COUNT(*) AS Lessons
  FROM LessonSchedule
  GROUP BY HorseID
  HAVING COUNT(*) >= 2;
  -- "two or more lessons" is a COUNT per horse, which only exists after GROUP BY, so it's HAVING.
  -- WHERE COUNT(*) >= 2 fails with ERROR 1111 (Invalid use of group function).
  ```

  </details>
  <!-- /solution -->

### Student

- **4.8** Show how many students live in each combination of State and City. Sort the list by State, then by City. *(5 rows)*

  <!-- solution:4.8 -->
  <details>
  <summary>Hint</summary>

  - You can GROUP BY two columns: `GROUP BY State, City`.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT State, City, COUNT(*) AS Students
  FROM Student
  GROUP BY State, City
  ORDER BY State, City;
  ```

  </details>
  <!-- /solution -->

---

## 5. Joins


### Employee and Department

- **5.1** Show each employee's first name and last name next to the name of their department. Use an inner join. One employee is missing from the result. Who is it, and why are they missing? *(14 rows)*

  <!-- solution:5.1 -->
  <details>
  <summary>Hint</summary>

  - Join the tables on the column they share: `ON Employee.DeptID = Department.DeptID`.
  - An inner join keeps only the rows that have a match in both tables.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT e.FirstName, e.LastName, d.DeptName
  FROM Employee e
  INNER JOIN Department d ON e.DeptID = d.DeptID;   -- Hedy Lamarr (NULL dept) is dropped
  ```

  </details>
  <!-- /solution -->

- **5.2** Show every department name and how many employees work in it. **Include departments that have no employees.** Make sure the Legal department shows 0, not 1. *(6 rows)*

  <!-- solution:5.2 -->
  <details>
  <summary>Hint</summary>

  - Start FROM Department and LEFT JOIN Employee, so a department with no employees still appears.
  - `COUNT(*)` gives Legal a 1, because it counts the row of NULLs the outer join creates. Count a column from Employee instead, like `COUNT(e.EmpID)`.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT d.DeptName, COUNT(e.EmpID) AS Headcount     -- COUNT(*) would give Legal a 1
  FROM Department d
  LEFT JOIN Employee e ON e.DeptID = d.DeptID
  GROUP BY d.DeptID, d.DeptName
  ORDER BY Headcount DESC, d.DeptName;
  ```

  </details>
  <!-- /solution -->

- **5.3** Write exercise 5.2 again, but use a `RIGHT JOIN` this time. You should get the same result. *(6 rows)*

  <!-- solution:5.3 -->
  <details>
  <summary>Hint</summary>

  - `A LEFT JOIN B` gives the same rows as `B RIGHT JOIN A`. Swap the order of the tables.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT d.DeptName, COUNT(e.EmpID) AS Headcount
  FROM Employee e
  RIGHT JOIN Department d ON e.DeptID = d.DeptID
  GROUP BY d.DeptID, d.DeptName
  ORDER BY Headcount DESC, d.DeptName;
  ```

  </details>
  <!-- /solution -->

- **5.4** Show every employee's full name next to their manager's full name. The manager is also in the Employee table, so you will need to join the Employee table to itself (a self-join). Include employees who do not have a manager. *(15 rows)*

  <!-- solution:5.4 -->
  <details>
  <summary>Hint</summary>

  - Use the Employee table twice, with two aliases like `Employee e` and `Employee m`, and join on `e.ManagerID = m.EmpID`.
  - A LEFT JOIN keeps the employees whose ManagerID is NULL.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT CONCAT(e.FirstName, ' ', e.LastName) AS Employee,
         CONCAT(m.FirstName, ' ', m.LastName) AS Manager
  FROM Employee e
  LEFT JOIN Employee m ON e.ManagerID = m.EmpID
  ORDER BY e.EmpID;
  -- CONCAT with any NULL argument returns NULL, so top-level managers show NULL.
  ```

  </details>
  <!-- /solution -->

- **5.5** Show the employees whose manager works in a **different** department than they do. Show four columns: the employee's name, the employee's department, the manager's name, and the manager's department. *(2 rows)*

  <!-- solution:5.5 -->
  <details>
  <summary>Hint</summary>

  - You need Employee twice (the employee and the manager) and Department twice (one for each person's department).

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT CONCAT(e.FirstName, ' ', e.LastName) AS Employee, ed.DeptName AS EmpDept,
         CONCAT(m.FirstName, ' ', m.LastName) AS Manager,  md.DeptName AS MgrDept
  FROM Employee e
  JOIN Employee   m  ON e.ManagerID = m.EmpID
  JOIN Department ed ON e.DeptID    = ed.DeptID
  JOIN Department md ON m.DeptID    = md.DeptID
  WHERE e.DeptID <> m.DeptID;
  ```

  </details>
  <!-- /solution -->

- **5.6** MySQL does not support `FULL OUTER JOIN`. Write a query that gives the same result as a full outer join between Employee and Department. Your result must include both Hedy Lamarr (who has no department) and Legal (which has no employees). *(16 rows)*

  <!-- solution:5.6 -->
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
  <!-- /solution -->

### Movie and Rating

- **5.7** Show each movie's Title next to its RatingDescription from the Rating table. Include movies that have no rating. *(12 rows)*

  <!-- solution:5.7 -->
  <details>
  <summary>Hint</summary>

  - "Include movies that have no rating" means every movie is kept. Put Movie on the left of a LEFT JOIN.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT m.Title, r.RatingDescription
  FROM Movie m
  LEFT JOIN Rating r ON m.RatingCode = r.RatingCode;
  ```

  </details>
  <!-- /solution -->

- **5.8** Show the ratings that no movie uses. Do this with a `LEFT JOIN` and an `IS NULL` check. *(1 row)*

  <!-- solution:5.8 -->
  <details>
  <summary>Hint</summary>

  - LEFT JOIN from Rating to Movie. A rating that no movie uses gets NULL in every Movie column.
  - Keep only those rows with `WHERE m.ID IS NULL`.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT r.RatingCode, r.RatingDescription
  FROM Rating r
  LEFT JOIN Movie m ON m.RatingCode = r.RatingCode
  WHERE m.ID IS NULL;
  ```

  </details>
  <!-- /solution -->

### Horse, Student, and LessonSchedule

- **5.9** Show the lesson schedule with these columns: LessonDateTime, the horse's RegisteredName, and the student's FirstName and LastName. Sort the list by date and time, then by horse name. Only include lessons that have a student assigned. *(11 rows)*

  <!-- solution:5.9 -->
  <details>
  <summary>Hint</summary>

  - You need three tables: LessonSchedule in the middle, joined to Horse and to Student.
  - Inner joins drop the lesson whose StudentID is NULL, which is what you want here.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT ls.LessonDateTime, h.RegisteredName, s.FirstName, s.LastName
  FROM LessonSchedule ls
  INNER JOIN Horse   h ON ls.HorseID   = h.ID
  INNER JOIN Student s ON ls.StudentID = s.ID
  ORDER BY ls.LessonDateTime, h.RegisteredName;
  ```

  </details>
  <!-- /solution -->

- **5.10** Do the same as 5.9, but this time also include the lesson that has no student assigned. *(12 rows)*

  <!-- solution:5.10 -->
  <details>
  <summary>Hint</summary>

  - Change only the join to Student. Which side of that join has to be kept?

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT ls.LessonDateTime, h.RegisteredName, s.FirstName, s.LastName
  FROM LessonSchedule ls
  INNER JOIN Horse   h ON ls.HorseID   = h.ID
  LEFT  JOIN Student s ON ls.StudentID = s.ID
  ORDER BY ls.LessonDateTime, h.RegisteredName;
  ```

  </details>
  <!-- /solution -->

- **5.11** Show the horses that have no lessons scheduled. *(1 row)*

  <!-- solution:5.11 -->
  <details>
  <summary>Hint</summary>

  - LEFT JOIN Horse to LessonSchedule, then keep the rows where the lesson side is NULL.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT h.ID, h.RegisteredName
  FROM Horse h
  LEFT JOIN LessonSchedule ls ON ls.HorseID = h.ID
  WHERE ls.HorseID IS NULL;
  ```

  </details>
  <!-- /solution -->

- **5.12** If every horse could be paired with every student, how many pairs would there be? Use a `CROSS JOIN` to find out. *(1 row: 80)*

  <!-- solution:5.12 -->
  <details>
  <summary>Hint</summary>

  - A cross join has no ON clause. Count the rows it returns with `COUNT(*)`.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT COUNT(*) AS Pairings
  FROM Horse CROSS JOIN Student;     -- 10 horses x 8 students = 80
  ```

  </details>
  <!-- /solution -->

---

## 6. Subqueries


### Employee and Department

- **6.1** Show the employees who earn more than the average salary of all employees. *(7 rows)*

  <!-- solution:6.1 -->
  <details>
  <summary>Hint</summary>

  - Put a subquery that returns the average, `(SELECT AVG(Salary) FROM Employee)`, on the right side of the comparison.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT FirstName, LastName, Salary
  FROM Employee
  WHERE Salary > (SELECT AVG(Salary) FROM Employee);
  ```

  </details>
  <!-- /solution -->

- **6.2** Show the employees who earn more than the average salary **of their own department**. This needs a correlated subquery, which is a subquery that uses a value from the outer query. *(5 rows)*

  <!-- solution:6.2 -->
  <details>
  <summary>Hint</summary>

  - Give the outer table and the subquery's table different aliases, then match them inside the subquery: `WHERE e2.DeptID = e.DeptID`.
  - The subquery runs again for every employee, using that employee's department.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT e.FirstName, e.LastName, e.DeptID, e.Salary
  FROM Employee e
  WHERE e.Salary > (SELECT AVG(e2.Salary)
                    FROM Employee e2
                    WHERE e2.DeptID = e.DeptID);     -- correlated: re-evaluated per row
  ```

  </details>
  <!-- /solution -->

- **6.3** For each department, show the employee who earns the most money, along with the department name. *(5 rows)*

  <!-- solution:6.3 -->
  <details>
  <summary>Hint</summary>

  - Compare each employee's salary with the MAX salary in their own department. This is a correlated subquery, like 6.2.
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
  <!-- /solution -->

- **6.4** Each department has a total payroll (the sum of the salaries of everyone in it). Show the DeptIDs whose total payroll is higher than the average total payroll of all departments. Use a subquery in the FROM clause (a derived table) to do this. *(2 rows)*

  <!-- solution:6.4 -->
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
  <!-- /solution -->

- **6.5** Show the names of the departments that have at least one employee who was hired after 2020-01-01. Use `EXISTS` to do this. *(3 rows)*

  <!-- solution:6.5 -->
  <details>
  <summary>Hint</summary>

  - EXISTS is true when its subquery returns at least one row. The subquery has to match employees to the outer query's department.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT d.DeptName
  FROM Department d
  WHERE EXISTS (SELECT 1 FROM Employee e
                WHERE e.DeptID = d.DeptID AND e.HireDate > '2020-01-01');
  ```

  </details>
  <!-- /solution -->

### Movie

- **6.6** Show the movies that are longer than the average length of the Sci-Fi movies. *(4 rows)*

  <!-- solution:6.6 -->
  <details>
  <summary>Hint</summary>

  - The subquery needs its own WHERE, so it averages only the Sci-Fi movies.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT Title, Genre, Minutes
  FROM Movie
  WHERE Minutes > (SELECT AVG(Minutes) FROM Movie WHERE Genre = 'Sci-Fi');
  ```

  </details>
  <!-- /solution -->

### Student and LessonSchedule

- **6.7** Show the students who have at least one lesson. Use `IN` with a subquery. *(7 rows)*

  <!-- solution:6.7 -->
  <details>
  <summary>Hint</summary>

  - The subquery returns the list of StudentIDs that appear in LessonSchedule.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT ID, FirstName, LastName
  FROM Student
  WHERE ID IN (SELECT StudentID FROM LessonSchedule);
  ```

  </details>
  <!-- /solution -->

- **6.8** Show the students who have **no** lessons. Use `NOT IN` with a subquery.
  - Your first try will return zero rows. Work out why.
  - Then fix it in two different ways. One of the ways should use `NOT EXISTS`. *(1 row)*

  <!-- solution:6.8 -->
  <details>
  <summary>Hint</summary>

  - One lesson has no student, so the subquery's list contains a NULL. `x NOT IN (1, 2, NULL)` can never be TRUE.
  - Fix 1: leave the NULL out inside the subquery. Fix 2: use `NOT EXISTS` with a subquery that matches on the student's ID.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  -- The trap: this returns ZERO rows, because LessonSchedule.StudentID contains a NULL.
  --   x NOT IN (1, 2, NULL)  ==  x<>1 AND x<>2 AND x<>NULL  ==  UNKNOWN
  SELECT ID, FirstName, LastName
  FROM Student
  WHERE ID NOT IN (SELECT StudentID FROM LessonSchedule);

  -- Correct (either works):
  SELECT ID, FirstName, LastName
  FROM Student
  WHERE ID NOT IN (SELECT StudentID FROM LessonSchedule WHERE StudentID IS NOT NULL);

  SELECT s.ID, s.FirstName, s.LastName
  FROM Student s
  WHERE NOT EXISTS (SELECT 1 FROM LessonSchedule ls WHERE ls.StudentID = s.ID);
  ```

  </details>
  <!-- /solution -->

---

[← Exercise index](exercises.md)
