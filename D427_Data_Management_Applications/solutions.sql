-- =====================================================================
-- D427 practice : SOLUTIONS
-- Sections 1-10 are meant to be worked in order against a fresh
-- `setup.sql` load (sections 7-10 change data/schema that later ones see).
-- Sections 11-13 stand alone: 11 builds its own `d427_drills` database,
-- 12 uses tables no other section touches, and 13 has no SQL (its answers are in 04-concepts-check.md).
-- Section 14 (final practice) starts from a FRESH setup.sql load again.
-- Statements marked "Expected to FAIL" are commented out; the error they raise is shown.
-- This file is the source of truth for the folded Hint and Solution blocks in
-- the 0N-*.md exercise files. Lines starting with "-- Hint:" become the hint.
-- After editing it, run:  python3 build_solutions.py
-- There is usually more than one correct answer; these are one each.
-- =====================================================================
USE d427;

-- =====================================================================
-- 1. SELECT basics
-- =====================================================================
-- [1.1]
-- Hint: `*` selects every column.
SELECT * FROM Movie;

-- [1.2]
-- Hint: Sort on two columns, separated by a comma: `ORDER BY col1 DESC, col2 ASC`.
-- Hint: MySQL puts NULLs first in ascending order and last in descending order.
SELECT Title, ReleaseYear
FROM Movie
ORDER BY ReleaseYear DESC, Title ASC;
-- Note: NULLs sort FIRST in ASC and LAST in DESC in MySQL.

-- [1.3]
-- Hint: The `DISTINCT` keyword goes right after SELECT.
SELECT DISTINCT Genre FROM Movie;

-- [1.4]
-- Hint: Sort by Gross from highest to lowest, then keep only the first rows with `LIMIT`.
SELECT Title, Gross
FROM Movie
ORDER BY Gross DESC
LIMIT 3;

-- [1.5]
-- Hint: Filter with WHERE and `>`. Write the number without the comma: 150000.
SELECT FirstName, LastName, Salary
FROM Employee
WHERE Salary > 150000;

-- [1.6]
-- Hint: `CONCAT(a, ' ', b)` joins strings together, and `ROUND(x, 2)` rounds to 2 decimal places.
-- Hint: Name each expression with `AS`. You can sort by that name in ORDER BY.
SELECT CONCAT(FirstName, ' ', LastName) AS FullName,
       ROUND(Salary / 12, 2)            AS MonthlyPay
FROM Employee
ORDER BY MonthlyPay DESC;   -- aliases are allowed in ORDER BY (not in WHERE)

-- =====================================================================
-- 2. Filtering: comparison, BETWEEN, IN, LIKE, NULL, AND/OR
-- =====================================================================
-- [2.1]
-- Hint: `BETWEEN low AND high` includes both ends.
SELECT Title, ReleaseYear FROM Movie
WHERE ReleaseYear BETWEEN 2014 AND 2016;      -- inclusive on both ends

-- [2.2]
-- Hint: `col IN ('a', 'b')` is a short way to write `col = 'a' OR col = 'b'`.
SELECT Title, RatingCode FROM Movie
WHERE RatingCode IN ('G', 'PG');

-- [2.3]
-- Hint: Use `LIKE` with `%`, which matches any number of characters.
-- Hint: Put a space after "The" in the pattern, or a title like "Theory" would match too.
SELECT Title FROM Movie
WHERE Title LIKE 'The %';

-- [2.4]
-- Hint: `NOT BETWEEN` and `NOT LIKE` are the opposites of BETWEEN and LIKE.
-- Hint: One movie has no ReleaseYear. A comparison with NULL is UNKNOWN, and NOT UNKNOWN is still UNKNOWN.
SELECT Title, ReleaseYear
FROM Movie
WHERE ReleaseYear NOT BETWEEN 2014 AND 2016;      -- 5 rows: the NULL year is in neither result
SELECT Title
FROM Movie
WHERE Title NOT LIKE 'The %';                     -- 9 rows

-- [2.5]
-- Hint: In a LIKE pattern, `_` matches exactly one character and `%` matches any number of characters.
SELECT FirstName, LastName FROM Student
WHERE LastName LIKE '_a%';                     -- _ = exactly one char, % = zero or more

-- [2.6]
-- Hint: AND is evaluated before OR. Use parentheses to keep the two cities together.
SELECT FirstName, LastName, City, Phone FROM Student
WHERE (City = 'Austin' OR City = 'Round Rock')
  AND Phone IS NOT NULL;                                   -- 4 rows
SELECT FirstName, LastName, City, Phone FROM Student
WHERE City = 'Austin' OR City = 'Round Rock'
  AND Phone IS NOT NULL;                                   -- 5 rows
-- AND binds tighter than OR. Drop the parentheses and you get
-- "Austin  OR  (Round Rock AND has phone)" - a different question: Priya (Austin,
-- no phone) sneaks in, so you get 5 rows instead of 4.

-- [2.7]
-- Hint: `City NOT IN ('Austin', 'Round Rock')` means `City <> 'Austin' AND City <> 'Round Rock'`.
-- Hint: When City is NULL, both of those comparisons are UNKNOWN, so the row is dropped. Add a second condition with OR.
SELECT FirstName, LastName, City
FROM Student
WHERE City NOT IN ('Austin', 'Round Rock');               -- 2 rows: Sofia (NULL city) is missing
SELECT FirstName, LastName, City
FROM Student
WHERE City NOT IN ('Austin', 'Round Rock') OR City IS NULL;   -- 3 rows

-- [2.8]
-- Hint: `= NULL` never matches anything. Use `IS NULL`.
SELECT EmpID, FirstName, LastName FROM Employee
WHERE Email IS NULL;                           -- "= NULL" never matches anything

-- [2.9]
-- Hint: When Breed is NULL, `Breed <> 'Quarter Horse'` is UNKNOWN, not TRUE, so WHERE drops that row.
-- Hint: Add a second condition with OR to keep the horse whose breed is NULL.
SELECT RegisteredName, Breed FROM Horse
WHERE Breed <> 'Quarter Horse';                       -- 7 rows: 'Blue Ribbon' (NULL breed) is missing
SELECT RegisteredName, Breed FROM Horse
WHERE Breed <> 'Quarter Horse' OR Breed IS NULL;      -- 8 rows
-- Without the IS NULL test, 'Blue Ribbon' disappears: NULL <> 'x' is UNKNOWN, not TRUE.

-- =====================================================================
-- 3. Built-in functions
-- =====================================================================
-- [3.1]
-- Hint: `UPPER()` turns text into capital letters, and `LENGTH()` counts characters.
SELECT UPPER(LastName) AS LastUpper,
       LENGTH(FirstName) AS FirstLen
FROM Student;

-- [3.2]
-- Hint: `SUBSTRING(Phone, start, length)` returns part of a string. Positions start at 1.
-- Hint: Glue the pieces and the symbols together with `CONCAT()`.
SELECT FirstName, LastName,
       CONCAT('(', SUBSTRING(Phone, 1, 3), ') ',
                   SUBSTRING(Phone, 4, 3), '-',
                   SUBSTRING(Phone, 7, 4)) AS FormattedPhone
FROM Student
WHERE Phone IS NOT NULL;

-- [3.3]
-- Hint: `REPLACE(text, 'find', 'replace with')` changes every match. `TRIM()` removes spaces from both ends.
SELECT LOWER(LastName) AS LastLower,
       REPLACE(Email, '@example.com', '@stable.example') AS NewEmail
FROM Student
WHERE Email IS NOT NULL;
SELECT CONCAT('[', TRIM('   Round Rock  '), ']') AS Trimmed,     -- [Round Rock]
       CONCAT('[', '   Round Rock  ', ']')       AS NotTrimmed;  -- [   Round Rock  ]
-- TRIM removes spaces at the start and end only, never the space inside "Round Rock".

-- [3.4]
-- Hint: `TIMESTAMPDIFF(YEAR, start, end)` counts the whole years between two dates. Use '2026-10-01' as the end date.
SELECT FirstName, LastName, HireDate,
       TIMESTAMPDIFF(YEAR, HireDate, '2026-10-01') AS YearsOfService
FROM Employee
ORDER BY YearsOfService DESC;

-- [3.5]
-- Hint: `DATEDIFF(later, earlier)` returns the number of days between two dates.
-- Hint: MONTH() returns the month as a number from 1 to 12, so June to August is 6 to 8.
SELECT FirstName, LastName, HireDate,
       DATEDIFF('2026-10-01', HireDate) AS DaysEmployed
FROM Employee
WHERE HireDate >= '2019-01-01'
ORDER BY HireDate;
SELECT FirstName, LastName, HireDate
FROM Employee
WHERE MONTH(HireDate) BETWEEN 6 AND 8;
-- YEAR() and DAY() work the same way.

-- [3.6]
-- Hint: `DATE()`, `TIME()`, and `DAYNAME()` each take a DATETIME value and return one part of it.
SELECT HorseID,
       DATE(LessonDateTime)      AS LessonDate,
       TIME(LessonDateTime)      AS LessonTime,
       DAYNAME(LessonDateTime)   AS DayOfWeek
FROM LessonSchedule
ORDER BY LessonDateTime;

-- [3.7]
-- Hint: Use a `CASE WHEN ... THEN ... ELSE ... END` expression.
-- Hint: CASE uses the first WHEN that is true, so check for NULL first.
SELECT Title, Minutes,
       CASE
         WHEN Minutes IS NULL THEN 'Unknown'
         WHEN Minutes < 100   THEN 'Short'
         WHEN Minutes < 140   THEN 'Standard'
         ELSE                      'Long'
       END AS LengthClass
FROM Movie;

-- [3.8]
-- Hint: In the simple form, the column goes right after CASE, and each WHEN gives just a value: `CASE RatingCode WHEN 'G' THEN 'Everyone' ...`.
-- Hint: The simple form compares with `=`, and NULL = NULL is never true.
SELECT Title, RatingCode,
       CASE RatingCode
         WHEN 'G'     THEN 'Everyone'
         WHEN 'PG'    THEN 'Parental guidance'
         WHEN 'PG-13' THEN 'Teens and up'
         WHEN 'R'     THEN 'Adults'
         ELSE              'Not rated'
       END AS Audience
FROM Movie;
SELECT CASE NULL WHEN NULL THEN 'matched' ELSE 'no match' END;   -- 'no match'
-- The simple form tests RatingCode = 'G', RatingCode = 'PG', and so on. WHEN NULL would test
-- RatingCode = NULL, which is never true, so the NULL rating has to be caught by ELSE
-- (or by the searched form: CASE WHEN RatingCode IS NULL THEN ...).

-- [3.9]
-- Hint: `COALESCE(col, 'something')` returns 'something' when col is NULL. (`IFNULL` works the same way.)
SELECT Title, COALESCE(Genre, 'Unclassified') AS Genre   -- IFNULL(Genre,'Unclassified') also fine
FROM Movie;

-- [3.10]
-- Hint: Divide by 1000000, then round with `ROUND(..., 1)`.
-- Hint: Leave out the NULL gross with `IS NOT NULL`.
SELECT Title, ROUND(Gross / 1000000, 1) AS GrossMillions
FROM Movie
WHERE Gross IS NOT NULL
ORDER BY GrossMillions DESC;

-- =====================================================================
-- 4. Aggregates, GROUP BY, HAVING
-- =====================================================================
-- [4.1]
-- Hint: `COUNT(*)` counts rows. `COUNT(column)` counts only the rows where that column is not NULL.
SELECT COUNT(*)          AS TotalMovies,
       COUNT(RatingCode) AS RatedMovies     -- COUNT(col) skips NULLs
FROM Movie;

-- [4.2]
-- Hint: `COUNT(DISTINCT column)` counts the different non-NULL values.
-- Hint: DISTINCT in a SELECT list keeps NULL as one of the values, but COUNT never counts NULL.
SELECT COUNT(*)                   AS Movies,       -- 12
       COUNT(Genre)               AS WithGenre,    -- 11
       COUNT(DISTINCT Genre)      AS Genres,       -- 4
       COUNT(DISTINCT RatingCode) AS Ratings       -- 4
FROM Movie;

-- [4.3]
-- Hint: "Leave out movies whose genre is NULL" is about single rows, so it goes in WHERE.
-- Hint: Then GROUP BY Genre and add up the Gross with `SUM()`.
SELECT Genre, SUM(Gross) AS TotalGross
FROM Movie
WHERE Genre IS NOT NULL
GROUP BY Genre
ORDER BY TotalGross DESC;

-- [4.4]
-- Hint: `AVG`, `MIN`, `MAX`, and `SUM` can all go in one SELECT. Without GROUP BY, they summarize the whole table as one row.
SELECT ROUND(AVG(Salary), 2) AS AvgSalary,
       MIN(Salary)           AS MinSalary,
       MAX(Salary)           AS MaxSalary,
       SUM(Salary)           AS Payroll
FROM Employee;

-- [4.5]
-- Hint: GROUP BY DeptID, and use `COUNT(*)` to count each group.
-- Hint: Look for a row whose DeptID is NULL.
SELECT DeptID, COUNT(*) AS Headcount
FROM Employee
GROUP BY DeptID;      -- employees with NULL DeptID form their own group

-- [4.6]
-- Hint: "More than 120,000" is about each department's **average**, not about one employee's salary.
-- Hint: A condition on an aggregate like `AVG(Salary)` goes in HAVING, after GROUP BY.
SELECT DeptID, ROUND(AVG(Salary), 2) AS AvgSalary
FROM Employee
GROUP BY DeptID
HAVING AVG(Salary) > 120000;
-- WHERE filters rows before grouping; HAVING filters groups after.

-- [4.7]
-- Hint: "Hired on or after 2018-01-01" is about one employee's row, so it goes in WHERE.
-- Hint: "2 or more" is about the group's count, so it goes in HAVING.
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

-- [4.8]
-- Hint: "Two or more lessons" is a count of each horse's lessons. You only know it after you GROUP BY HorseID.
-- Hint: So the condition goes in HAVING, not WHERE.
SELECT HorseID, COUNT(*) AS Lessons
FROM LessonSchedule
GROUP BY HorseID
HAVING COUNT(*) >= 2;
-- "two or more lessons" is a COUNT per horse, which only exists after GROUP BY, so it's HAVING.
-- WHERE COUNT(*) >= 2 fails with ERROR 1111 (Invalid use of group function).

-- [4.9]
-- Hint: You can GROUP BY two columns: `GROUP BY State, City`.
SELECT State, City, COUNT(*) AS Students
FROM Student
GROUP BY State, City
ORDER BY State, City;

-- =====================================================================
-- 5. Joins
-- =====================================================================
-- [5.1]
-- Hint: Join the tables on the column they share: `ON Employee.DeptID = Department.DeptID`.
-- Hint: An inner join keeps only the rows that have a match in both tables.
SELECT e.FirstName, e.LastName, d.DeptName
FROM Employee e
INNER JOIN Department d ON e.DeptID = d.DeptID;   -- Hedy Lamarr (NULL dept) is dropped

-- [5.2]
-- Hint: Start FROM Department and LEFT JOIN Employee, so a department with no employees still appears.
-- Hint: `COUNT(*)` gives Legal a 1, because it counts the row of NULLs the outer join creates. Count a column from Employee instead, like `COUNT(e.EmpID)`.
SELECT d.DeptName, COUNT(e.EmpID) AS Headcount     -- COUNT(*) would give Legal a 1
FROM Department d
LEFT JOIN Employee e ON e.DeptID = d.DeptID
GROUP BY d.DeptID, d.DeptName
ORDER BY Headcount DESC, d.DeptName;

-- [5.3]
-- Hint: `A LEFT JOIN B` gives the same rows as `B RIGHT JOIN A`. Swap the order of the tables.
SELECT d.DeptName, COUNT(e.EmpID) AS Headcount
FROM Employee e
RIGHT JOIN Department d ON e.DeptID = d.DeptID
GROUP BY d.DeptID, d.DeptName
ORDER BY Headcount DESC, d.DeptName;

-- [5.4]
-- Hint: Use the Employee table twice, with two aliases like `Employee e` and `Employee m`, and join on `e.ManagerID = m.EmpID`.
-- Hint: A LEFT JOIN keeps the employees whose ManagerID is NULL.
SELECT CONCAT(e.FirstName, ' ', e.LastName) AS Employee,
       CONCAT(m.FirstName, ' ', m.LastName) AS Manager
FROM Employee e
LEFT JOIN Employee m ON e.ManagerID = m.EmpID
ORDER BY e.EmpID;
-- CONCAT with any NULL argument returns NULL, so top-level managers show NULL.

-- [5.5]
-- Hint: You need Employee twice (the employee and the manager) and Department twice (one for each person's department).
SELECT CONCAT(e.FirstName, ' ', e.LastName) AS Employee, ed.DeptName AS EmpDept,
       CONCAT(m.FirstName, ' ', m.LastName) AS Manager,  md.DeptName AS MgrDept
FROM Employee e
JOIN Employee   m  ON e.ManagerID = m.EmpID
JOIN Department ed ON e.DeptID    = ed.DeptID
JOIN Department md ON m.DeptID    = md.DeptID
WHERE e.DeptID <> m.DeptID;

-- [5.6]
-- Hint: "Include movies that have no rating" means every movie is kept. Put Movie on the left of a LEFT JOIN.
SELECT m.Title, r.RatingDescription
FROM Movie m
LEFT JOIN Rating r ON m.RatingCode = r.RatingCode;

-- [5.7]
-- Hint: LEFT JOIN from Rating to Movie. A rating that no movie uses gets NULL in every Movie column.
-- Hint: Keep only those rows with `WHERE m.ID IS NULL`.
SELECT r.RatingCode, r.RatingDescription
FROM Rating r
LEFT JOIN Movie m ON m.RatingCode = r.RatingCode
WHERE m.ID IS NULL;

-- [5.8]
-- Hint: You need three tables: LessonSchedule in the middle, joined to Horse and to Student.
-- Hint: Inner joins drop the lesson whose StudentID is NULL, which is what you want here.
SELECT ls.LessonDateTime, h.RegisteredName, s.FirstName, s.LastName
FROM LessonSchedule ls
INNER JOIN Horse   h ON ls.HorseID   = h.ID
INNER JOIN Student s ON ls.StudentID = s.ID
ORDER BY ls.LessonDateTime, h.RegisteredName;

-- [5.9]
-- Hint: Change only the join to Student. Which side of that join has to be kept?
SELECT ls.LessonDateTime, h.RegisteredName, s.FirstName, s.LastName
FROM LessonSchedule ls
INNER JOIN Horse   h ON ls.HorseID   = h.ID
LEFT  JOIN Student s ON ls.StudentID = s.ID
ORDER BY ls.LessonDateTime, h.RegisteredName;

-- [5.10]
-- Hint: LEFT JOIN Horse to LessonSchedule, then keep the rows where the lesson side is NULL.
SELECT h.ID, h.RegisteredName
FROM Horse h
LEFT JOIN LessonSchedule ls ON ls.HorseID = h.ID
WHERE ls.HorseID IS NULL;

-- [5.11]
-- Hint: A cross join has no ON clause. Count the rows it returns with `COUNT(*)`.
SELECT COUNT(*) AS Pairings
FROM Horse CROSS JOIN Student;     -- 10 horses x 8 students = 80

-- =====================================================================
-- 6. Subqueries
-- =====================================================================
-- [6.1]
-- Hint: Put a subquery that returns the average, `(SELECT AVG(Salary) FROM Employee)`, on the right side of the comparison.
SELECT FirstName, LastName, Salary
FROM Employee
WHERE Salary > (SELECT AVG(Salary) FROM Employee);

-- [6.2]
-- Hint: Give the outer table and the subquery's table different aliases, then match them inside the subquery: `WHERE e2.DeptID = e.DeptID`.
-- Hint: The subquery runs again for every employee, using that employee's department.
SELECT e.FirstName, e.LastName, e.DeptID, e.Salary
FROM Employee e
WHERE e.Salary > (SELECT AVG(e2.Salary)
                  FROM Employee e2
                  WHERE e2.DeptID = e.DeptID);     -- correlated: re-evaluated per row

-- [6.3]
-- Hint: EXISTS is true when its subquery returns at least one row. The subquery has to match employees to the outer query's department.
SELECT d.DeptName
FROM Department d
WHERE EXISTS (SELECT 1 FROM Employee e
              WHERE e.DeptID = d.DeptID AND e.HireDate > '2020-01-01');

-- [6.4]
-- Hint: The subquery needs its own WHERE, so it averages only the Sci-Fi movies.
SELECT Title, Genre, Minutes
FROM Movie
WHERE Minutes > (SELECT AVG(Minutes) FROM Movie WHERE Genre = 'Sci-Fi');

-- [6.5]
-- Hint: The subquery returns the list of StudentIDs that appear in LessonSchedule.
SELECT ID, FirstName, LastName
FROM Student
WHERE ID IN (SELECT StudentID FROM LessonSchedule);

-- [6.6]
-- Hint: One lesson has no student, so the subquery's list contains a NULL. `x NOT IN (1, 2, NULL)` can never be TRUE.
-- Hint: Fix 1: leave the NULL out inside the subquery. Fix 2: use `NOT EXISTS` with a subquery that matches on the student's ID.
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

-- =====================================================================
-- 7. Modifying data: INSERT, UPDATE, DELETE
-- =====================================================================
-- [7.1]
-- Hint: List the columns you are filling in. If you leave ID out, MySQL assigns the next number.
INSERT INTO Movie (Title, Genre, RatingCode, ReleaseYear, Minutes, Gross)
VALUES ('Dune', 'Sci-Fi', 'PG-13', 2021, 155, 108327830);
SELECT * FROM Movie WHERE Title = 'Dune';    -- ID 13 assigned by AUTO_INCREMENT

-- [7.2]
-- Hint: One UPDATE can set two columns: `SET a = ..., b = ...`. Use `IS NULL`, not `= NULL`.
UPDATE Movie
SET Genre = 'Indie', ReleaseYear = 2026
WHERE Genre IS NULL;
SELECT ID, Title, Genre, ReleaseYear FROM Movie WHERE ID = 12;

-- [7.3]
-- Hint: Rating is the parent table and Movie is the child table. Which one does each statement break?
-- Hint: Errors 1451 and 1452 are both foreign key errors. Read which one talks about a parent row and which one about a child row.
-- Expected to FAIL - run it to see the error, then move on:
--   DELETE FROM Rating WHERE RatingCode = 'PG';
--   ERROR 1451: Cannot delete or update a parent row: a foreign key constraint fails
-- Movie.RatingCode's FK has no ON DELETE clause, so the default (RESTRICT / NO ACTION) applies.
-- Likewise, inserting a child row whose FK value has no parent fails with ERROR 1452:
--   INSERT INTO Movie (Title, RatingCode) VALUES ('Bad', 'XX');
SELECT COUNT(*) AS PGStillThere FROM Rating WHERE RatingCode = 'PG';

-- [7.4]
-- Hint: One INSERT can add several rows: `VALUES (...), (...)`.
-- Hint: Leave State out of the column list, and MySQL uses its DEFAULT.
INSERT INTO Student (FirstName, LastName, City, Email) VALUES
  ('Ava',   'Nguyen', 'Austin',     'ava@example.com'),
  ('Ethan', 'Brooks', 'Georgetown', 'ethan@example.com');
SELECT ID, FirstName, LastName, City, State FROM Student WHERE ID > 8;  -- State = 'TX' (DEFAULT)

-- [7.5]
-- Hint: Raise the salary with `SET Salary = Salary * 1.05`.
-- Hint: Find the DeptID with a subquery on Department: `WHERE DeptID = (SELECT DeptID FROM Department WHERE ...)`.
UPDATE Employee
SET Salary = Salary * 1.05
WHERE DeptID = (SELECT DeptID FROM Department WHERE DeptName = 'Support');
SELECT FirstName, LastName, Salary FROM Employee WHERE DeptID = 30;

-- [7.6]
-- Hint: Compare LessonDateTime with '2026-02-02'. A date with no time means midnight at the start of that day.
DELETE FROM LessonSchedule
WHERE LessonDateTime < '2026-02-02';
SELECT COUNT(*) AS LessonsLeft FROM LessonSchedule;     -- 12 - 2 = 10

-- [7.7]
-- Hint: Look at the HorseID foreign key with `SHOW CREATE TABLE LessonSchedule;`. What does its ON DELETE say?
SELECT COUNT(*) AS MidnightLessons FROM LessonSchedule WHERE HorseID = 9;   -- 1
DELETE FROM Horse WHERE ID = 9;
SELECT COUNT(*) AS MidnightLessons FROM LessonSchedule WHERE HorseID = 9;   -- 0  (ON DELETE CASCADE)

-- [7.8]
-- Hint: Same idea as 7.7, but look at the ON DELETE rule for StudentID.
-- Hint: One lesson already had no student before you started.
DELETE FROM Student WHERE ID = 2;
SELECT * FROM LessonSchedule WHERE StudentID IS NULL;    -- Jamal's 2/4 lesson now has NULL (SET NULL)

-- [7.9]
-- Hint: A range that starts at 0 means UNSIGNED. 0 to 65 thousand fits SMALLINT UNSIGNED, and 0 to 255 fits TINYINT UNSIGNED.
-- Hint: `AUTO_INCREMENT PRIMARY KEY` lets MySQL number the rows, and `NOT NULL DEFAULT 0` makes Visits required but filled in when you leave it out.
-- Hint: With no column list, the VALUES must cover every column, in the order the table defines them. Writing NULL (or DEFAULT) for an AUTO_INCREMENT column lets MySQL choose the number.
-- Hint: A column you leave out of the column list gets its DEFAULT. A NOT NULL column with no DEFAULT can't be left out.
CREATE TABLE Guest (
  GuestID   SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,   -- 0..65,535
  FullName  VARCHAR(40) NOT NULL,
  City      VARCHAR(20),
  Visits    TINYINT UNSIGNED NOT NULL DEFAULT 0            -- 0..255
);
INSERT INTO Guest VALUES (NULL, 'Ana Ruiz', 'Austin', 3);       -- NULL -> next AUTO_INCREMENT value
INSERT INTO Guest (FullName, City) VALUES ('Ben Cho', 'Dallas'); -- Visits gets its DEFAULT, 0
SELECT * FROM Guest;
-- Expected to FAIL (FullName is NOT NULL and has no DEFAULT):
--   INSERT INTO Guest (City) VALUES ('Waco');
--   ERROR 1364: Field 'FullName' doesn't have a default value
-- Expected to FAIL (no column list, so MySQL wants 4 values but got 3):
--   INSERT INTO Guest VALUES ('Cara Lin', 'Austin', 5);
--   ERROR 1136: Column count doesn't match value count at row 1
-- Listing the columns is safer: the INSERT still works if someone adds a column to the table later.

-- [7.10]
-- Hint: You can give an AUTO_INCREMENT column a value yourself, as long as it isn't already used.
-- Hint: MySQL's next number is always one more than the highest ID it has seen so far.
INSERT INTO Guest (GuestID, FullName, City, Visits) VALUES (100, 'Cara Lin', 'Austin', 5);
INSERT INTO Guest (FullName, City) VALUES ('Dev Patel', 'Houston');
SELECT * FROM Guest;                          -- Dev Patel is 101: the counter jumped past 100

-- [7.11]
-- Hint: Write the WHERE once, in a SELECT. If the rows it returns are the ones you want gone, swap `SELECT *` for `DELETE`.
SELECT * FROM Guest WHERE Visits = 0;         -- Ben Cho and Dev Patel
DELETE FROM Guest WHERE Visits = 0;
SELECT * FROM Guest;                          -- Ana Ruiz and Cara Lin are left
-- A DELETE can't be undone. The SELECT shows you exactly what will go first.

-- [7.12]
-- Hint: Without a WHERE, an UPDATE changes every row in the table.
-- Hint: The client prints how many rows were changed, like "Rows matched: 2  Changed: 2".
UPDATE Guest SET Visits = Visits + 1;         -- Rows matched: 2  Changed: 2
SELECT * FROM Guest;                          -- Ana Ruiz 4, Cara Lin 6
-- Some tools turn on "safe updates" mode, which refuses an UPDATE or DELETE without a WHERE
-- on a key column, for exactly this reason.

-- [7.13]
-- Hint: `DELETE FROM Guest;` removes the rows but keeps the AUTO_INCREMENT counter where it was.
-- Hint: TRUNCATE empties the table by re-creating it, which also restarts its AUTO_INCREMENT counter at 1.
DELETE FROM Guest;                            -- no WHERE: every row
SELECT COUNT(*) AS Guests FROM Guest;         -- 0
INSERT INTO Guest (FullName, City) VALUES ('Eli Moss', 'Austin');
SELECT * FROM Guest;                          -- GuestID 102: the counter kept going after 101
TRUNCATE TABLE Guest;
INSERT INTO Guest (FullName, City) VALUES ('Fay Wong', 'Dallas');
SELECT * FROM Guest;                          -- GuestID 1: TRUNCATE reset the counter
-- TRUNCATE is DDL and is also faster on big tables, but it can't have a WHERE:
-- it always removes everything.

-- =====================================================================
-- 8. Defining structure: CREATE / ALTER / DROP
-- =====================================================================
-- [8.1]
-- Hint: 0 to 16 million fits MEDIUMINT UNSIGNED. 0 to 9,999 and 1 to 65 thousand both need SMALLINT UNSIGNED: TINYINT stops at 255.
-- Hint: UNSIGNED still allows 0, so DurationSec also needs `CHECK (DurationSec > 0)`.
-- Hint: `AUTO_INCREMENT`, `NOT NULL`, `DEFAULT 'Pop'`, and the CHECK all go on the column definitions.
-- Hint: "Not the same Title and the same Artist" is one UNIQUE constraint over both columns: `UNIQUE (Title, Artist)`.
CREATE TABLE Song (
  ID           MEDIUMINT UNSIGNED  AUTO_INCREMENT,               -- 0..16,777,215
  Title        VARCHAR(60)         NOT NULL,
  Artist       VARCHAR(60)         NOT NULL,
  ReleaseYear  SMALLINT UNSIGNED,                                -- 0..65,535 (TINYINT stops at 255)
  Genre        VARCHAR(20)         DEFAULT 'Pop',
  DurationSec  SMALLINT UNSIGNED   CHECK (DurationSec > 0),      -- UNSIGNED allows 0; the CHECK doesn't
  PRIMARY KEY (ID),
  UNIQUE (Title, Artist)
);
INSERT INTO Song (Title, Artist, ReleaseYear, DurationSec) VALUES
  ('Bohemian Rhapsody', 'Queen', 1975, 354),
  ('Clocks', 'Coldplay', 2002, 307);
SELECT * FROM Song;

-- [8.2]
-- Hint: `ALTER TABLE ... ADD COLUMN ...` can end with `AFTER column_name`.
ALTER TABLE Song ADD COLUMN Album VARCHAR(60) AFTER Artist;

-- [8.3]
-- Hint: `ALTER TABLE ... MODIFY COLUMN` replaces the column's whole definition. Anything you leave out, like the DEFAULT, is lost.
ALTER TABLE Song MODIFY COLUMN Genre VARCHAR(30) DEFAULT 'Pop';
-- MODIFY replaces the whole definition: omit DEFAULT here and the default is lost.

-- [8.4]
-- Hint: `SHOW CREATE TABLE Song;` shows the name MySQL gave the check.
-- Hint: One ALTER TABLE can do several things, separated by commas: drop the check, rename the column, and add the check back using the new name.
-- Expected to FAIL (the CHECK from 8.1 uses the column):
--   ALTER TABLE Song RENAME COLUMN DurationSec TO Seconds;
--   ERROR 3959: Check constraint 'Song_chk_1' uses column 'DurationSec', hence column cannot be dropped or renamed.
-- Drop the check, rename, and re-add the check in ONE statement (SHOW CREATE TABLE Song gives the check's name):
ALTER TABLE Song
  DROP CHECK Song_chk_1,
  RENAME COLUMN DurationSec TO Seconds,
  ADD CONSTRAINT Song_chk_1 CHECK (Seconds > 0);
-- Without a CHECK on the column, RENAME COLUMN alone (or CHANGE DurationSec Seconds SMALLINT UNSIGNED) is enough.

-- [8.5]
-- Hint: `ALTER TABLE ... DROP COLUMN ...`
ALTER TABLE Song DROP COLUMN Album;
DESCRIBE Song;

-- [8.6]
-- Hint: Create Playlist first. A foreign key can only point to a table that already exists.
-- Hint: Write `PRIMARY KEY (PlaylistID, SongID)` on its own line. Then add one `FOREIGN KEY (...) REFERENCES ...` line for each foreign key, each ending with `ON DELETE CASCADE`.
-- Hint: For d), join three tables: Playlist to PlaylistSong on the playlist ID, and PlaylistSong to Song on the song ID.
CREATE TABLE Playlist (
  ID       TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,   -- 0..255
  Name     VARCHAR(40) NOT NULL,
  Created  DATE NOT NULL
);
CREATE TABLE PlaylistSong (
  PlaylistID  TINYINT UNSIGNED NOT NULL,     -- same type as Playlist.ID
  SongID      MEDIUMINT UNSIGNED NOT NULL,   -- same type as Song.ID
  Position    TINYINT UNSIGNED NOT NULL,
  PRIMARY KEY (PlaylistID, SongID),
  FOREIGN KEY (PlaylistID) REFERENCES Playlist(ID) ON DELETE CASCADE,
  FOREIGN KEY (SongID)     REFERENCES Song(ID)     ON DELETE CASCADE
);
-- The foreign key columns must have the same type as the columns they point to. A mismatch (INT for SongID)
-- fails with ERROR 3780: Referencing column 'SongID' and referenced column 'ID' ... are incompatible.
INSERT INTO Playlist (Name, Created) VALUES ('Road Trip', '2026-10-01');
INSERT INTO PlaylistSong VALUES (1, 1, 1), (1, 2, 2);
SELECT p.Name, ps.Position, s.Title
FROM Playlist p
JOIN PlaylistSong ps ON ps.PlaylistID = p.ID
JOIN Song s          ON s.ID = ps.SongID
ORDER BY ps.Position;

-- [8.7]
-- Hint: One ALTER TABLE can have several parts separated by commas: `ADD COLUMN ...` and `ADD CONSTRAINT name FOREIGN KEY ...`.
-- Hint: The new DirectorID column must have the same type as Director.ID.
-- Hint: For d), an inner join between Movie and Director keeps only the movies that have a director.
CREATE TABLE Director (
  ID    SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,   -- 0..65,535
  Name  VARCHAR(50) NOT NULL
);
INSERT INTO Director (Name) VALUES ('Denis Villeneuve'), ('Christopher Nolan');
ALTER TABLE Movie
  ADD COLUMN DirectorID SMALLINT UNSIGNED,          -- same type as Director.ID
  ADD CONSTRAINT fk_movie_director FOREIGN KEY (DirectorID) REFERENCES Director(ID);
UPDATE Movie SET DirectorID = 1 WHERE Title IN ('Arrival', 'Dune');
UPDATE Movie SET DirectorID = 2 WHERE Title = 'Interstellar';
SELECT m.Title, d.Name AS Director
FROM Movie m JOIN Director d ON m.DirectorID = d.ID;   -- the inner join skips movies with no director

-- [8.8]
-- Hint: `INSERT INTO table (columns) SELECT ... FROM ... WHERE ...` has no VALUES keyword.
-- Hint: `CURDATE()` returns today's date, and `CONCAT()` builds FullName.
CREATE TABLE EmployeeArchive (
  EmpID       INT PRIMARY KEY,       -- DESCRIBE Employee shows EmpID is int
  FullName    VARCHAR(70)   NOT NULL,
  Salary      DECIMAL(10,2),
  ArchivedOn  DATE          NOT NULL
);
INSERT INTO EmployeeArchive (EmpID, FullName, Salary, ArchivedOn)
SELECT EmpID, CONCAT(FirstName, ' ', LastName), Salary, CURDATE()
FROM Employee
WHERE DeptID = 30;
SELECT * FROM EmployeeArchive;

-- [8.9]
-- Hint: Use `RENAME TABLE old TO new;` and `DROP TABLE IF EXISTS ...;`.
-- Hint: For the last question: which table has a foreign key that points to Song?
RENAME TABLE EmployeeArchive TO FormerEmployee;   -- or ALTER TABLE ... RENAME TO ...
SHOW TABLES;
DROP TABLE FormerEmployee;
DROP TABLE IF EXISTS FormerEmployee;              -- IF EXISTS: no error the second time
-- DROP TABLE Song would FAIL: PlaylistSong references it. Drop children first.

-- =====================================================================
-- 9. Views and indexes
-- =====================================================================
-- [9.1]
-- Hint: `CREATE VIEW name AS SELECT ...`. The SELECT needs a LEFT JOIN to Student, like 5.9.
-- Hint: Rename the RegisteredName column with `AS Horse`.
CREATE VIEW LessonDetail AS
SELECT ls.LessonDateTime, h.RegisteredName AS Horse,
       s.FirstName, s.LastName
FROM LessonSchedule ls
JOIN Horse h        ON ls.HorseID   = h.ID
LEFT JOIN Student s ON ls.StudentID = s.ID;
SELECT * FROM LessonDetail WHERE FirstName IS NULL;

-- [9.2]
-- Hint: `ALTER VIEW name AS SELECT ...` replaces the view's whole query, so write the full SELECT again with the new column added.
-- Hint: A view stores only its query, not its rows. Each time you select from it, MySQL runs that query on the tables as they are right now.
ALTER VIEW LessonDetail AS
SELECT ls.LessonDateTime, h.RegisteredName AS Horse, h.Breed,
       s.FirstName, s.LastName
FROM LessonSchedule ls
JOIN Horse h        ON ls.HorseID   = h.ID
LEFT JOIN Student s ON ls.StudentID = s.ID;
SELECT COUNT(*) AS Lessons FROM LessonDetail;                    -- 9
INSERT INTO LessonSchedule (HorseID, StudentID, LessonDateTime)
VALUES (1, 1, '2026-03-01 10:00:00');
SELECT * FROM LessonDetail WHERE LessonDateTime = '2026-03-01 10:00:00';
SELECT COUNT(*) AS Lessons FROM LessonDetail;                    -- 10: the view sees the new row
DELETE FROM LessonSchedule
WHERE HorseID = 1 AND LessonDateTime = '2026-03-01 10:00:00';
SELECT COUNT(*) AS Lessons FROM LessonDetail;                    -- 9 again
-- The view stores no rows of its own. It re-runs its SELECT every time, so it always
-- matches the tables underneath it.
-- Expected to FAIL (ALTER VIEW only changes a view that already exists):
--   ALTER VIEW NoSuchView AS SELECT 1;
--   ERROR 1146: Table 'd427.NoSuchView' doesn't exist

-- [9.3]
-- Hint: The view's SELECT is the LEFT JOIN with GROUP BY from 5.2, plus an AVG.
-- Hint: Once the view exists, you query it like a table: `SELECT * FROM DeptSummary WHERE ...`.
CREATE VIEW DeptSummary AS
SELECT d.DeptID, d.DeptName,
       COUNT(e.EmpID)          AS Headcount,
       ROUND(AVG(e.Salary), 2) AS AvgSalary
FROM Department d
LEFT JOIN Employee e ON e.DeptID = d.DeptID
GROUP BY d.DeptID, d.DeptName;
SELECT * FROM DeptSummary WHERE Headcount >= 3 ORDER BY AvgSalary DESC;

-- [9.4]
-- Hint: Which kind of join keeps departments with no employees? Switch to the kind that doesn't.
-- Hint: `CREATE OR REPLACE VIEW` takes a complete SELECT, just like CREATE VIEW.
CREATE OR REPLACE VIEW DeptSummary AS
SELECT d.DeptID, d.DeptName,
       COUNT(e.EmpID)          AS Headcount,
       ROUND(AVG(e.Salary), 2) AS AvgSalary
FROM Department d
INNER JOIN Employee e ON e.DeptID = d.DeptID      -- was LEFT JOIN: Legal (no employees) drops out
GROUP BY d.DeptID, d.DeptName;
SELECT * FROM DeptSummary ORDER BY DeptID;        -- 5 rows
-- Both statements replace the view's whole query.
--   ALTER VIEW                fails if the view doesn't exist (ERROR 1146, see 9.2).
--   CREATE OR REPLACE VIEW    creates the view if it's missing, or replaces it if it's there.
-- So CREATE OR REPLACE is handy in a script you run again and again; ALTER VIEW makes it
-- clear you're changing something that should already exist.

-- [9.5]
-- Hint: `CREATE INDEX name ON Employee (LastName);`, then `SHOW INDEX FROM Employee;`.
-- Hint: In the EXPLAIN output, the `key` column shows which index MySQL used.
CREATE INDEX idx_employee_lastname ON Employee (LastName);
SHOW INDEX FROM Employee;
EXPLAIN SELECT * FROM Employee WHERE LastName = 'Knuth';    -- key: idx_employee_lastname

-- [9.6]
-- Hint: List both columns in the index, in order: `ON Movie (Genre, ReleaseYear)`.
-- Hint: Think of a phone book sorted by last name, then first name. Can it help you find everyone whose first name is Ana?
CREATE INDEX idx_movie_genre_year ON Movie (Genre, ReleaseYear);
EXPLAIN SELECT Title FROM Movie WHERE Genre = 'Sci-Fi' AND ReleaseYear >= 2015;
-- A query on ReleaseYear ALONE cannot use this index efficiently: leftmost-prefix rule.

-- [9.7]
-- Hint: `DROP INDEX name ON Movie;`
DROP INDEX idx_movie_genre_year ON Movie;
SHOW INDEX FROM Movie;

-- =====================================================================
-- 10. Design: ER description / normalization -> tables
-- =====================================================================
-- [10.1]
-- Hint: You need four tables: Customer, Orders, Product, and a linking table for the many-to-many between orders and products.
-- Hint: The linking table holds Quantity, and its primary key is (OrderID, ProductID).
-- Hint: `ORDER` is a reserved word in SQL, so don't name a table Order.
CREATE TABLE Customer (
  CustomerID  MEDIUMINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,   -- 0..16,777,215
  Name        VARCHAR(50) NOT NULL,
  Email       VARCHAR(60) NOT NULL UNIQUE
);
CREATE TABLE Product (
  ProductID   SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,    -- 0..65,535
  Name        VARCHAR(50)   NOT NULL,
  UnitPrice   DECIMAL(8,2)  NOT NULL CHECK (UnitPrice >= 0)
);
CREATE TABLE CustOrder (                 -- "Order" is a reserved word
  OrderID     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,         -- 0..4,294,967,295
  CustomerID  MEDIUMINT UNSIGNED NOT NULL,
  OrderDate   DATE NOT NULL,
  FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID)
);
CREATE TABLE OrderLine (                 -- resolves the M:N between orders and products
  OrderID     INT UNSIGNED NOT NULL,
  ProductID   SMALLINT UNSIGNED NOT NULL,
  Quantity    TINYINT UNSIGNED NOT NULL CHECK (Quantity > 0),
  PRIMARY KEY (OrderID, ProductID),
  FOREIGN KEY (OrderID)   REFERENCES CustOrder(OrderID) ON DELETE CASCADE,
  FOREIGN KEY (ProductID) REFERENCES Product(ProductID)
);
INSERT INTO Customer (Name, Email) VALUES ('Pat Lee', 'pat@example.com');
INSERT INTO Product (Name, UnitPrice) VALUES ('Widget', 2.50), ('Gadget', 10.00);
INSERT INTO CustOrder (CustomerID, OrderDate) VALUES (1, '2026-10-01');
INSERT INTO OrderLine VALUES (1, 1, 4), (1, 2, 1);
SELECT o.OrderID, c.Name, SUM(ol.Quantity * p.UnitPrice) AS OrderTotal
FROM CustOrder o
JOIN Customer  c  ON c.CustomerID = o.CustomerID
JOIN OrderLine ol ON ol.OrderID   = o.OrderID
JOIN Product   p  ON p.ProductID  = ol.ProductID
GROUP BY o.OrderID, c.Name;     -- 4*2.50 + 1*10.00 = 20.00

-- [10.2]
-- Hint: A partial dependency is a column that depends on only part of the key (only StudentID, or only CourseID).
-- Hint: A transitive dependency is a column that depends on another non-key column. For example, InstructorName depends on InstructorID.
-- Hint: Give each kind of fact its own table: students, courses, instructors, and enrollments (with the Grade).
-- Original: Enrollment(StudentID, StudentName, CourseID, CourseTitle,
--                      InstructorID, InstructorName, InstructorOffice, Grade)
-- Key = (StudentID, CourseID).
--   Partial dependencies (violate 2NF): StudentID -> StudentName ;
--                                       CourseID  -> CourseTitle, InstructorID
--   Transitive dependency (violates 3NF): CourseID -> InstructorID -> InstructorName, InstructorOffice
CREATE TABLE NF_Student    (StudentID MEDIUMINT UNSIGNED PRIMARY KEY, StudentName VARCHAR(50) NOT NULL);
CREATE TABLE NF_Instructor (InstructorID SMALLINT UNSIGNED PRIMARY KEY, InstructorName VARCHAR(50) NOT NULL,
                            InstructorOffice VARCHAR(10));
CREATE TABLE NF_Course     (CourseID CHAR(6) PRIMARY KEY, CourseTitle VARCHAR(60) NOT NULL,
                            InstructorID SMALLINT UNSIGNED,
                            FOREIGN KEY (InstructorID) REFERENCES NF_Instructor(InstructorID));
CREATE TABLE NF_Enrollment (StudentID MEDIUMINT UNSIGNED, CourseID CHAR(6), Grade CHAR(2),
                            PRIMARY KEY (StudentID, CourseID),
                            FOREIGN KEY (StudentID) REFERENCES NF_Student(StudentID),
                            FOREIGN KEY (CourseID)  REFERENCES NF_Course(CourseID));
SHOW TABLES LIKE 'NF\_%';

-- =====================================================================
-- 11. Writing tables from a specification (practice-test style)
--     Runs in its own database so it can reuse the practice tests' table names.
-- =====================================================================
DROP DATABASE IF EXISTS d427_drills;
CREATE DATABASE d427_drills;
USE d427_drills;

-- [11.1]
-- Hint: 0 to 65 thousand fits SMALLINT UNSIGNED (0 to 65,535).
-- Hint: "3 significant digits and 1 decimal place" is DECIMAL(3,1).
-- Hint: "Must be one of" is `CHECK (Breed IN (...))`. In a CHECK, write the date as a string: '2015-01-01'.
-- "integer with range 0 to 65 thousand"            -> SMALLINT UNSIGNED (0..65,535)
-- "3 significant digits and 1 decimal place"       -> DECIMAL(3,1)  (precision = total digits)
CREATE TABLE Horse (
  ID              SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  RegisteredName  VARCHAR(15) NOT NULL,
  Breed           VARCHAR(20) CHECK (Breed IN ('Egyptian Arab', 'Holsteiner', 'Quarter Horse', 'Paint', 'Saddlebred')),
  Height          DECIMAL(3,1) CHECK (Height >= 10.0 AND Height <= 20.0),
  BirthDate       DATE CHECK (BirthDate >= '2015-01-01')
);
INSERT INTO Horse (RegisteredName, Breed, Height, BirthDate)
VALUES ('Babe', 'Quarter Horse', 15.3, '2015-02-10');
-- Expected to FAIL (Height out of range):
--   INSERT INTO Horse (RegisteredName, Breed, Height, BirthDate) VALUES ('Goliath', 'Paint', 21.0, '2018-01-01');
--   ERROR 3819: Check constraint 'Horse_chk_2' is violated.
SELECT * FROM Horse;
SHOW CREATE TABLE d427.Horse;

-- [11.2]
-- Hint: 0 to 16 million fits MEDIUMINT UNSIGNED (0 to 16,777,215).
-- Hint: "Fixed-length string of 2 chars" is CHAR(2). State needs both `NOT NULL` and `DEFAULT 'TX'`.
-- "integer with range 0 to 16 million" -> MEDIUMINT UNSIGNED (0..16,777,215)
CREATE TABLE Student (
  ID         SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  FirstName  VARCHAR(20) NOT NULL,
  LastName   VARCHAR(30) NOT NULL,
  Street     VARCHAR(50) NOT NULL,
  City       VARCHAR(20) NOT NULL,
  State      CHAR(2)     NOT NULL DEFAULT 'TX',
  Zip        MEDIUMINT UNSIGNED NOT NULL,
  Phone      CHAR(10)    NOT NULL,
  Email      VARCHAR(30) UNIQUE
);
INSERT INTO Student (FirstName, LastName, Street, City, Zip, Phone, Email)
VALUES ('Rosie', 'Hewitt', '1 Main St', 'Austin', 78701, '5125550101', 'rosie@example.com');
SELECT ID, FirstName, State FROM Student;     -- State = 'TX' from the DEFAULT

-- [11.3]
-- Hint: A foreign key column must have exactly the same type as the column it points to (here, SMALLINT UNSIGNED).
-- Hint: Write `PRIMARY KEY (HorseID, LessonDateTime)` on its own line. Each FOREIGN KEY gets its own ON DELETE rule.
CREATE TABLE LessonSchedule (
  HorseID         SMALLINT UNSIGNED NOT NULL,
  StudentID       SMALLINT UNSIGNED,            -- must allow NULL, or SET NULL is impossible
  LessonDateTime  DATETIME NOT NULL,
  PRIMARY KEY (HorseID, LessonDateTime),
  FOREIGN KEY (HorseID)   REFERENCES Horse(ID)   ON DELETE CASCADE,
  FOREIGN KEY (StudentID) REFERENCES Student(ID) ON DELETE SET NULL
);
-- FK columns must have the SAME type as the column they reference (SMALLINT UNSIGNED here).
-- Declaring StudentID NOT NULL fails:
--   ERROR 1830: Column 'StudentID' cannot be NOT NULL: needed in a foreign key constraint ... SET NULL

-- [11.4]
-- Hint: Add both lessons with one INSERT. Then do the two DELETEs one at a time, and look at LessonSchedule after each one.
INSERT INTO LessonSchedule VALUES
  (1, 1, '2026-03-01 09:00:00'),
  (1, 1, '2026-03-02 09:00:00');
DELETE FROM Student WHERE ID = 1;
SELECT * FROM LessonSchedule;                 -- 2 rows, StudentID now NULL  (SET NULL)
DELETE FROM Horse WHERE ID = 1;
SELECT COUNT(*) AS LessonsLeft FROM LessonSchedule;   -- 0  (CASCADE)

-- [11.5]
-- Hint: "Positive integer" is INT UNSIGNED.
-- Hint: Up to 19,999.99 is 5 digits before the point and 2 after: DECIMAL(7,2). Use a CHECK to keep it from 0 to 19999.99.
-- Hint: Don't add PRIMARY KEY or NOT NULL. The spec doesn't ask for them.
-- "positive integer"                         -> INT UNSIGNED
-- "up to $19,999.99 with 2 digits for cents" -> DECIMAL(7,2): 5 digits before the point + 2 after
CREATE TABLE Customer (
  CustomerID     INT UNSIGNED,
  FirstName      VARCHAR(50),
  MiddleInitial  CHAR(1),
  LastName       VARCHAR(50),
  DateOfBirth    DATE,
  CreditLimit    DECIMAL(7,2) CHECK (CreditLimit >= 0 AND CreditLimit <= 19999.99)
);
-- The practice-test key writes  DECIMAL(7,2) UNSIGNED CHECK (CreditLimit <= 19999.99).
-- That works too, but MySQL warns (1681) that UNSIGNED on DECIMAL is deprecated.
-- "Do not add any additional constraints": no PRIMARY KEY, no NOT NULL - the spec didn't ask.
DESCRIBE Customer;

-- [11.6]
-- Hint: 0 to 255 fits TINYINT UNSIGNED.
-- Hint: "5 digits total and 1 decimal place" is DECIMAL(5,1).
-- Hint: "No value" means NULL. A CHECK rejects a row only when the check is FALSE, and a check on NULL is UNKNOWN.
CREATE TABLE Country (
  ID                  TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,    -- 0..255
  CountryName         VARCHAR(100),
  Continent           VARCHAR(50) CHECK (Continent IN ('Africa', 'Asia', 'Europe', 'North America',
                                                       'South America', 'Oceania', 'Antarctica')),
  PopulationMillions  DECIMAL(5,1) CHECK (PopulationMillions BETWEEN 0.1 AND 9999.9),
  IndependenceDate    DATE CHECK (IndependenceDate >= '1800-01-01')
);
INSERT INTO Country (CountryName, Continent, PopulationMillions, IndependenceDate) VALUES
  ('Canada',  'North America', NULL,  '1867-07-01'),    -- "<No Value>" means NULL
  ('Brazil',  'South America', 214.3, '1822-09-07'),
  ('Germany', 'Europe',        83.2,  '1871-01-18');
-- A CHECK only rejects FALSE. NULL makes the check UNKNOWN, which passes - so Canada is accepted.
-- Expected to FAIL:
--   INSERT INTO Country (CountryName, Continent) VALUES ('Atlantis', 'Atlantic');
--   ERROR 3819: Check constraint 'Country_chk_1' is violated.
SELECT * FROM Country;

-- [11.7]
-- Hint: Create Genre first. A foreign key can only point to a table that already exists.
-- Hint: In Book, add `FOREIGN KEY (GenreCode) REFERENCES Genre(GenreCode)`.
CREATE TABLE Genre (
  GenreCode         VARCHAR(5) PRIMARY KEY,
  GenreDescription  VARCHAR(40)
);
CREATE TABLE Book (
  Title      VARCHAR(30),
  GenreCode  VARCHAR(5),
  FOREIGN KEY (GenreCode) REFERENCES Genre(GenreCode)
);
INSERT INTO Genre VALUES ('FIC', 'Fiction');
INSERT INTO Book VALUES ('Beloved', 'FIC');
-- Expected to FAIL (no such parent row):
--   INSERT INTO Book VALUES ('Dune', 'SCI');
--   ERROR 1452: Cannot add or update a child row: a foreign key constraint fails
SELECT * FROM Book;

-- [11.8]
-- Hint: The statement is `ALTER TABLE ... ADD PRIMARY KEY (...)`.
-- Hint: A primary key must be unique. Look at the PetIDs you just added.
CREATE TABLE Pet (
  PetID      INT,
  Name       VARCHAR(30),
  Breed      VARCHAR(30),
  Birthdate  DATE
);
INSERT INTO Pet VALUES (1, 'Rex', 'Beagle', '2020-05-01'),
                       (2, 'Bella', 'Poodle', '2021-07-12'),
                       (2, 'Milo', 'Pug', '2022-02-20');
-- Expected to FAIL (two rows have PetID 2):
--   ALTER TABLE Pet ADD PRIMARY KEY (PetID);
--   ERROR 1062: Duplicate entry '2' for key 'Pet.PRIMARY'
UPDATE Pet SET PetID = 3 WHERE Name = 'Milo';
ALTER TABLE Pet ADD PRIMARY KEY (PetID);
DESCRIBE Pet;                                 -- PetID: Key = PRI, Null = NO

-- [11.9]
-- Hint: A foreign key can only point to a column that is a primary key or has a UNIQUE index.
-- Hint: Fix Breed with `ALTER TABLE ... ADD PRIMARY KEY`. Name the foreign key with `ADD CONSTRAINT fk_dog_breed FOREIGN KEY ...`.
CREATE TABLE Breed (
  breedID           INT,
  breedDescription  VARCHAR(40)
);
CREATE TABLE Dog (
  dogID      INT PRIMARY KEY,
  name       VARCHAR(30),
  breedID    INT,
  birthdate  DATE
);
-- Expected to FAIL (Breed.breedID is not a primary key or unique):
--   ALTER TABLE Dog ADD FOREIGN KEY (breedID) REFERENCES Breed(breedID);
--   MySQL 8.0:  ERROR 1822: Failed to add the foreign key constraint. Missing index for constraint ...
--   MySQL 8.4+: ERROR 6125: Failed to add the foreign key constraint. Missing unique key ...
ALTER TABLE Breed ADD PRIMARY KEY (breedID);
ALTER TABLE Dog ADD CONSTRAINT fk_dog_breed FOREIGN KEY (breedID) REFERENCES Breed(breedID);
SHOW CREATE TABLE Dog;

-- [11.10]
-- Hint: `ALTER TABLE ... ADD CONSTRAINT MgrIDCheck CHECK (...)`
-- Hint: When you add a CHECK, MySQL also checks the rows that are already in the table.
-- Hint: Remove the check with `ALTER TABLE ... DROP CHECK MgrIDCheck`.
CREATE TABLE Department (
  DeptID     INT PRIMARY KEY,
  DeptName   VARCHAR(50),
  ManagerID  INT
);
INSERT INTO Department VALUES (1, 'Sales', 2100), (2, 'Legal', 1500);
-- Expected to FAIL (existing row 'Legal' already breaks the rule):
--   ALTER TABLE Department ADD CONSTRAINT MgrIDCheck CHECK (ManagerID >= 2000);
--   ERROR 3819: Check constraint 'MgrIDCheck' is violated.
UPDATE Department SET ManagerID = 2500 WHERE DeptID = 2;
ALTER TABLE Department ADD CONSTRAINT MgrIDCheck CHECK (ManagerID >= 2000);
-- Expected to FAIL:
--   INSERT INTO Department VALUES (3, 'Finance', 1999);
--   ERROR 3819: Check constraint 'MgrIDCheck' is violated.
ALTER TABLE Department DROP CHECK MgrIDCheck;   -- naming the constraint is what makes this easy
INSERT INTO Department VALUES (3, 'Finance', 1999);
SELECT * FROM Department;

-- [11.11]
-- Hint: "Less than 80 with 1 decimal place" needs 2 digits before the point and 1 after: DECIMAL(3,1). That type allows up to 99.9, so a CHECK has to enforce "less than 80".
-- Hint: "Positive" means the CHECK also needs `>= 0`.
CREATE TABLE Automobile (
  ID     INT PRIMARY KEY,
  Make   VARCHAR(30),
  Model  VARCHAR(30),
  Year   INT
);
-- DECIMAL(3,1) holds up to 99.9, so the CHECK is what enforces "less than 80".
ALTER TABLE Automobile
  ADD SafetyRating DECIMAL(3,1) CHECK (SafetyRating >= 0 AND SafetyRating < 80);
-- "less than or equal to 7.9 with one decimal place" -> DECIMAL(2,1)
ALTER TABLE Automobile
  ADD EngineSize DECIMAL(2,1) CHECK (EngineSize >= 0 AND EngineSize <= 7.9);
INSERT INTO Automobile VALUES (1, 'Toyota', 'Camry', 2024, 79.9, 2.5);
-- Expected to FAIL:
--   INSERT INTO Automobile VALUES (2, 'Honda', 'Civic', 2024, 80.0, 2.0);
--   ERROR 3819: Check constraint 'Automobile_chk_1' is violated.
SELECT * FROM Automobile;

-- [11.12]
-- Hint: Create the table first: two NOT NULL columns and one DATE column, no primary key.
-- Hint: `MODIFY col definition` keeps the name. `CHANGE old_name new_name definition` renames the column.
-- Hint: Both replace the whole definition, so write NOT NULL again.
CREATE TABLE Movie (
  MovieID      INT NOT NULL,
  MovieName    VARCHAR(25) NOT NULL,
  ReleaseDate  DATE
);
-- a) Same name, longer type. MODIFY (or CHANGE with the name twice) replaces the WHOLE
--    definition, so restate NOT NULL or the column silently becomes nullable.
ALTER TABLE Movie MODIFY MovieName VARCHAR(50) NOT NULL;
--    equivalent:  ALTER TABLE Movie CHANGE MovieName MovieName VARCHAR(50) NOT NULL;
-- b) New name AND type: CHANGE old new definition
ALTER TABLE Movie CHANGE MovieName CanadianMovieName VARCHAR(50) NOT NULL;
DESCRIBE Movie;

-- [11.13]
-- Hint: "Must not be deletable" is `ON DELETE RESTRICT`.
-- Hint: To name a foreign key, write `CONSTRAINT fk_exam_patient` in front of `FOREIGN KEY`.
CREATE TABLE Patient (
  patient_id  INT PRIMARY KEY,
  first_name  VARCHAR(20),
  last_name   VARCHAR(30),
  birthdate   DATE
);
CREATE TABLE Exam (
  exam_id      INT AUTO_INCREMENT,
  exam_date    DATE NOT NULL,
  exam_reason  VARCHAR(250),
  patient_id   INT NOT NULL,
  PRIMARY KEY (exam_id),
  CONSTRAINT fk_exam_patient FOREIGN KEY (patient_id) REFERENCES Patient(patient_id) ON DELETE RESTRICT
);
INSERT INTO Patient VALUES (1, 'Ana', 'Silva', '1990-03-14'), (2, 'Ben', 'Okoro', '1985-11-02');
INSERT INTO Exam (exam_date, exam_reason, patient_id) VALUES ('2026-09-30', 'Annual physical', 1);
-- Expected to FAIL (patient 1 still has an exam):
--   DELETE FROM Patient WHERE patient_id = 1;
--   ERROR 1451: Cannot delete or update a parent row: a foreign key constraint fails
DELETE FROM Patient WHERE patient_id = 2;     -- no exams, so this one is allowed
SELECT COUNT(*) AS Patients FROM Patient;     -- 1

-- [11.14]
-- Hint: You can't edit a foreign key: drop it with `ALTER TABLE Exam DROP FOREIGN KEY fk_exam_patient;` and add a new one.
-- Hint: ON DELETE SET NULL needs a column that allows NULL. Change patient_id with MODIFY before you add the new foreign key.
-- There is no "ALTER FOREIGN KEY". Drop it by name, fix the column, add the new one.
-- (The practice tests' "ON DELETE SET TO NULL" is not valid MySQL; it's ON DELETE SET NULL.)
ALTER TABLE Exam DROP FOREIGN KEY fk_exam_patient;
ALTER TABLE Exam MODIFY patient_id INT;       -- SET NULL needs a nullable column
ALTER TABLE Exam ADD CONSTRAINT fk_exam_patient
  FOREIGN KEY (patient_id) REFERENCES Patient(patient_id) ON DELETE SET NULL;
DELETE FROM Patient WHERE patient_id = 1;
SELECT * FROM Exam;                           -- 1 row, patient_id NULL

-- [11.15]
-- Hint: A unique index is CREATE INDEX with the word UNIQUE in front of INDEX.
-- Hint: Remove it with `DROP INDEX name ON Student;`.
INSERT INTO Student (FirstName, LastName, Street, City, Zip, Phone, Email) VALUES
  ('Jamal', 'Carter', '22 Oak Ave',  'Round Rock', 78664, '5125550102', 'jamal@example.com'),
  ('Priya', 'Nair',   '300 Elm Blvd','Austin',     78702, '5125550103', 'priya@example.com');
CREATE UNIQUE INDEX idx_student_phone ON Student (Phone);
-- Expected to FAIL (Phone already used by Jamal):
--   INSERT INTO Student (FirstName, LastName, Street, City, Zip, Phone)
--   VALUES ('Noah', 'Kim', '12 Maple Dr', 'Round Rock', 78665, '5125550102');
--   ERROR 1062: Duplicate entry '5125550102' for key 'Student.idx_student_phone'
SHOW INDEX FROM Student;
DROP INDEX idx_student_phone ON Student;      -- or: ALTER TABLE Student DROP INDEX idx_student_phone;
-- A UNIQUE constraint and a unique index are the same thing in MySQL: Email's UNIQUE shows up
-- in SHOW INDEX as an index named Email.

-- [11.16]
-- Hint: `ALTER VIEW name AS SELECT ...` replaces the view's whole query.
-- Hint: `DROP VIEW IF EXISTS` doesn't fail if the view is already gone.
CREATE VIEW StudentContact AS
SELECT FirstName, LastName, Phone
FROM Student;
ALTER VIEW StudentContact AS
SELECT FirstName, LastName, Phone, Email
FROM Student;
-- CREATE OR REPLACE VIEW StudentContact AS ...  does the same thing (and works if the view doesn't exist yet).
SELECT * FROM StudentContact ORDER BY LastName;    -- 2 rows, 4 columns
DROP VIEW StudentContact;
DROP VIEW IF EXISTS StudentContact;           -- no error the second time

-- [11.17]
-- Hint: A primary key can't have the same value twice. Look at CourseCode for the row you're adding.
-- Hint: One ALTER TABLE can do two things, separated by a comma: `DROP PRIMARY KEY, ADD PRIMARY KEY (...)`.
-- Hint: Horse's ID is AUTO_INCREMENT. MySQL requires an AUTO_INCREMENT column to be part of a key.
CREATE TABLE CourseSection (
  CourseCode  CHAR(6) PRIMARY KEY,
  Section     TINYINT UNSIGNED NOT NULL,
  Room        VARCHAR(10)
);
INSERT INTO CourseSection VALUES ('D427', 1, 'A101'), ('C175', 1, 'B205');
-- Expected to FAIL (D427 is already in the primary key column):
--   INSERT INTO CourseSection VALUES ('D427', 2, 'A102');
--   ERROR 1062: Duplicate entry 'D427' for key 'CourseSection.PRIMARY'
ALTER TABLE CourseSection
  DROP PRIMARY KEY,
  ADD PRIMARY KEY (CourseCode, Section);       -- a table has only one primary key, so there's no name to give
INSERT INTO CourseSection VALUES ('D427', 2, 'A102');
SELECT * FROM CourseSection ORDER BY CourseCode, Section;
-- Expected to FAIL (Horse.ID is AUTO_INCREMENT, and an auto-increment column must be a key):
--   ALTER TABLE Horse DROP PRIMARY KEY;
--   ERROR 1075: Incorrect table definition; there can be only one auto column and it must be defined as a key
-- To change it, remove AUTO_INCREMENT first (MODIFY ID SMALLINT UNSIGNED NOT NULL), or drop and add the key
-- in the same statement.

-- [11.18]
-- Hint: `ALTER TABLE ... ADD CONSTRAINT name UNIQUE (column)`.
-- Hint: MySQL keeps a UNIQUE constraint as a unique index with the same name, so you can remove it either with DROP INDEX or with DROP CONSTRAINT.
ALTER TABLE Country ADD CONSTRAINT uq_country_name UNIQUE (CountryName);
-- Expected to FAIL:
--   INSERT INTO Country (CountryName, Continent) VALUES ('Brazil', 'South America');
--   ERROR 1062: Duplicate entry 'Brazil' for key 'Country.uq_country_name'
SHOW INDEX FROM Country;                      -- a unique index named uq_country_name
ALTER TABLE Country DROP INDEX uq_country_name;
--  equivalent (MySQL 8.0.19+):  ALTER TABLE Country DROP CONSTRAINT uq_country_name;
-- UNIQUE vs PRIMARY KEY: a table has ONE primary key but can have many UNIQUE constraints,
-- and a UNIQUE column can hold NULLs (as many as you like), while a primary key column can't.

-- [11.19]
-- Hint: `ALTER TABLE Dog DROP FOREIGN KEY fk_dog_breed;`
-- Hint: When you add a foreign key, MySQL creates an index on that column (if there isn't one already). Dropping the foreign key leaves that index behind.
ALTER TABLE Dog DROP FOREIGN KEY fk_dog_breed;
SHOW CREATE TABLE Dog;                        -- KEY `fk_dog_breed` (`breedID`) is still there: it's the index
INSERT INTO Dog VALUES (1, 'Biscuit', 99, '2023-04-01');   -- allowed: nothing checks breedID any more
ALTER TABLE Dog DROP INDEX fk_dog_breed;
SHOW INDEX FROM Dog;                          -- only PRIMARY

-- [11.20]
-- Hint: Put `ON UPDATE CASCADE` on the foreign key, the same way you'd write an ON DELETE rule.
-- Hint: A foreign key with no ON UPDATE (or no ON DELETE) rule uses RESTRICT for it.
CREATE TABLE Team (
  TeamCode  CHAR(3) PRIMARY KEY,
  TeamName  VARCHAR(30) NOT NULL
);
CREATE TABLE Player (
  PlayerID  INT PRIMARY KEY,
  Name      VARCHAR(30) NOT NULL,
  TeamCode  CHAR(3),
  FOREIGN KEY (TeamCode) REFERENCES Team(TeamCode) ON UPDATE CASCADE
);
INSERT INTO Team VALUES ('AUS', 'Austin FC');
INSERT INTO Player VALUES (1, 'Sam Diaz', 'AUS'), (2, 'Lee Park', 'AUS');
UPDATE Team SET TeamCode = 'ATX' WHERE TeamCode = 'AUS';
SELECT * FROM Player;                         -- both players now say ATX (CASCADE)
-- Expected to FAIL (Book's foreign key to Genre has no ON UPDATE rule, so it's RESTRICT):
--   UPDATE Genre SET GenreCode = 'FICT' WHERE GenreCode = 'FIC';
--   ERROR 1451: Cannot delete or update a parent row: a foreign key constraint fails
-- Expected to FAIL (Player's foreign key has no ON DELETE rule, so deletes are RESTRICT):
--   DELETE FROM Team WHERE TeamCode = 'ATX';
--   ERROR 1451: Cannot delete or update a parent row: a foreign key constraint fails
-- ON UPDATE and ON DELETE are separate rules. You can give a foreign key both, e.g.
--   FOREIGN KEY (TeamCode) REFERENCES Team(TeamCode) ON UPDATE CASCADE ON DELETE SET NULL

-- [11.21]
-- Hint: A range that goes below 0 needs a signed type, so leave out UNSIGNED.
-- Hint: -128 to 127 is exactly TINYINT. -32 thousand to 32 thousand fits SMALLINT (-32,768 to 32,767).
CREATE TABLE WeatherReading (
  ReadingID   MEDIUMINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,   -- 0..16,777,215
  TempC       TINYINT NOT NULL,                                -- -128..127
  ElevationM  SMALLINT                                         -- -32,768..32,767
);
INSERT INTO WeatherReading (TempC, ElevationM) VALUES (-40, -86), (35, 4421);
SELECT * FROM WeatherReading;
-- Expected to FAIL (200 is past TINYINT's 127):
--   INSERT INTO WeatherReading (TempC) VALUES (200);
--   ERROR 1264: Out of range value for column 'TempC' at row 1
-- With TempC TINYINT UNSIGNED, the -40 reading fails the same way: UNSIGNED can't hold negatives.

-- [11.22]
-- Hint: Compare each range's top with the type limits: 255, 65,535, 16,777,215, and about 4.29 billion for UNSIGNED.
-- Hint: 0 to 5 billion is past INT UNSIGNED, so it needs BIGINT UNSIGNED.
CREATE TABLE Bin (
  BinID          SMALLINT UNSIGNED PRIMARY KEY,     -- 300 is past TINYINT UNSIGNED's 255
  Quantity       MEDIUMINT UNSIGNED NOT NULL,       -- 70,000 is past SMALLINT UNSIGNED's 65,535
  LifetimeScans  BIGINT UNSIGNED NOT NULL           -- 5 billion is past INT UNSIGNED's ~4.29 billion
);
INSERT INTO Bin VALUES (300, 70000, 5000000000);
SELECT * FROM Bin;
-- With TINYINT UNSIGNED, SMALLINT UNSIGNED, and INT UNSIGNED instead, the INSERT fails on the first column that
-- doesn't fit:  ERROR 1264: Out of range value for column 'BinID' at row 1
USE d427;

-- =====================================================================
-- 12. Practice-test query drills  (Book / YearSales, Passport / Visa, Compensation, student_grades)
-- =====================================================================
-- [12.1]
-- Hint: "Without directly referencing any column names" means `*`.
SELECT * FROM Book;

-- [12.2]
-- Hint: List the columns in SELECT in the order asked: Title, then Genre.
SELECT Title, Genre
FROM Book
WHERE Year = 2018;

-- [12.3]
-- Hint: `ORDER BY Title ASC`. ASC is the default, but writing it makes your intent clear.
SELECT Title
FROM Book
ORDER BY Title ASC;      -- ASC is the default; writing it costs nothing

-- [12.4]
-- Hint: "Unique Genre values and the number of books with each" means GROUP BY Genre with COUNT(*). Name the count with `AS GenreCount`.
-- Hint: Reverse alphabetical order (Z–A) is DESC.
SELECT Genre, COUNT(*) AS GenreCount
FROM Book
GROUP BY Genre
ORDER BY Genre DESC;
-- The NULL genre is its own group, and sorts LAST in DESC order.
-- The answer key's  SELECT DISTINCT Genre, COUNT(*) ... GROUP BY Genre  also works:
-- GROUP BY already makes each Genre unique, so DISTINCT does nothing.

-- [12.5]
-- Hint: Each part is a one-line query with one aggregate function: COUNT, SUM, or MAX.
SELECT COUNT(*) FROM Book WHERE Year = 2019;   -- a) 2
SELECT SUM(Cost) FROM Book;                    -- b)
SELECT MAX(Cost) FROM Book;                    -- c)

-- [12.6]
-- Hint: Compare Cost with a subquery that returns the average: `(SELECT AVG(Cost) FROM Book)`.
-- Hint: WHERE is checked one row at a time, before any average exists. That's why `WHERE Cost > AVG(Cost)` fails.
SELECT *
FROM Book
WHERE Cost > (SELECT AVG(Cost) FROM Book);   -- a) 1 row: one $125 book pulls the average up to 33.03

SELECT *
FROM Book
WHERE Cost < (SELECT AVG(Cost) FROM Book);   -- b) 12 rows
-- WHERE Cost > AVG(Cost) fails with ERROR 1111 (Invalid use of group function):
-- WHERE is checked one row at a time, before any aggregate exists.

-- [12.7]
-- Hint: "Title (if available)" means Book is the optional side. "For all YearSales" means every YearSales row is kept.
-- Hint: If you write Book first, the table you keep, YearSales, is on the RIGHT.
-- "Title (if available)"  -> Book is the optional side.  "for all YearSales" -> keep every YearSales row.
SELECT YearSales.TotalSales, Book.Title
FROM Book
RIGHT JOIN YearSales ON Book.Year = YearSales.Year;

-- [12.8]
-- Hint: There's no "if available" or "regardless of" wording, so the practice tests expect an INNER JOIN.
-- No "if available" / "regardless" wording, so the practice tests expect an INNER JOIN.
SELECT Book.Title, YearSales.TotalSales
FROM Book
INNER JOIN YearSales ON Book.Year = YearSales.Year;
-- The two books whose Year has no YearSales row (1989, 2017) drop out, and so does 2023.

-- [12.9]
-- Hint: "Regardless of whether they had any sales" means YearSales is the optional side, and every book is kept.
-- Hint: Join the two tables on Year.
-- "regardless of whether they had any sales" -> YearSales is optional; "for all Books" -> keep every book.
SELECT Book.Title, YearSales.TotalSales
FROM YearSales
RIGHT JOIN Book ON YearSales.Year = Book.Year;
-- Same thing written as a LEFT JOIN:  FROM Book LEFT JOIN YearSales ON ...

-- [12.10]
-- Hint: `A RIGHT JOIN B` gives the same rows as `B LEFT JOIN A`. Swap the order of the tables.
SELECT YearSales.TotalSales, Book.Title
FROM YearSales
LEFT JOIN Book ON Book.Year = YearSales.Year;
-- A RIGHT JOIN B  ==  B LEFT JOIN A. The table whose rows you keep is the one the arrow points at.

-- [12.11]
-- Hint: LEFT JOIN from YearSales to Book, then keep the rows where the Book side is NULL.
SELECT ys.Year
FROM YearSales ys
LEFT JOIN Book b ON b.Year = ys.Year
WHERE b.ID IS NULL;

-- [12.12]
-- Hint: a) Compare two columns at once: `WHERE (Genre, Year) = (subquery)`. The subquery must return exactly one row with two columns.
-- Hint: b) This subquery returns many rows, so use it with IN: `WHERE Year IN (SELECT Year FROM YearSales WHERE ...)`.
-- a) Row subquery: returns ONE row with SEVERAL columns, compared with a row constructor.
SELECT Title, Genre, Year
FROM Book
WHERE (Genre, Year) = (SELECT Genre, Year FROM Book WHERE Title = 'Normal People');
-- b) Table subquery: returns SEVERAL rows, used with IN / EXISTS (or in FROM as a derived table).
SELECT Title, Year
FROM Book
WHERE Year IN (SELECT Year FROM YearSales WHERE Releases > 50);
-- (A scalar subquery, like the AVG in 12.6, returns exactly one row and one column.)

-- [12.13]
-- Hint: "All visas" are kept, and the passport holder's name is the optional ("if available") side.
-- Hint: Two visas have a NULL PassportID. Their name should show as NULL.
SELECT Visa.VisaID, Passport.PassportHolderName
FROM Visa
LEFT JOIN Passport ON Visa.PassportID = Passport.PassportID
ORDER BY Visa.VisaID;

-- [12.14]
-- Hint: "Unassigned visas should not appear" means you want only the matching rows: an INNER JOIN.
SELECT Passport.PassportHolderName, Visa.VisaType
FROM Passport
INNER JOIN Visa ON Visa.PassportID = Passport.PassportID
ORDER BY Passport.PassportHolderName;

-- [12.15]
-- Hint: GROUP BY VisaType, with COUNT(*).
SELECT VisaType, COUNT(*) AS VisaCount
FROM Visa
GROUP BY VisaType;

-- [12.16]
-- Hint: `CREATE VIEW Visas_2023 AS SELECT * FROM Visa WHERE ...`
-- Hint: `YEAR(IssueDate)` returns just the year. A date range with BETWEEN works too.
CREATE VIEW Visas_2023 AS
SELECT *
FROM Visa
WHERE YEAR(IssueDate) = 2023;
--  equivalent: WHERE IssueDate BETWEEN '2023-01-01' AND '2023-12-31'
--  (the BETWEEN form can use an index on IssueDate; wrapping the column in YEAR() can't)
SELECT * FROM Visas_2023;

-- [12.17]
-- Hint: Same pattern as 12.11: LEFT JOIN, then keep the rows where the Visa side is NULL.
SELECT p.PassportID, p.PassportHolderName
FROM Passport p
LEFT JOIN Visa v ON v.PassportID = p.PassportID
WHERE v.VisaID IS NULL;

-- [12.18]
-- Hint: The first query is GROUP BY grade, with COUNT(*).
-- Hint: "Only the grades that have a count greater than 2" is a condition on each group's count. Which clause filters groups?
SELECT grade, COUNT(*) AS gradeCount
FROM student_grades
GROUP BY grade;

SELECT grade, COUNT(*) AS gradeCount
FROM student_grades
GROUP BY grade
HAVING gradeCount > 2;     -- MySQL allows the alias here; HAVING COUNT(*) > 2 works everywhere

-- [12.19]
-- Hint: Any comparison with NULL is UNKNOWN, and WHERE keeps only the rows where the condition is TRUE.
-- Hint: Look at which people have a NULL salary or a NULL bonus.
SELECT Name FROM Compensation WHERE Salary = Bonus;    -- Sam Snead only
SELECT Name FROM Compensation WHERE Salary <> Bonus;   -- Maria Rodriguez only
-- Any comparison with NULL is UNKNOWN, and WHERE keeps only TRUE rows. Lisa, Ravi and Jiho
-- are in NEITHER result, even though "=" and "<>" look like they should cover everything.

-- [12.20]
-- Hint: `Bonus + 2000` is NULL when Bonus is NULL.
-- Hint: `COALESCE(Bonus, 0)` turns a NULL bonus into 0 before you add to it.
UPDATE Compensation
SET Bonus = COALESCE(Bonus, 0) + 2000
WHERE Salary < 70000;
-- Bonus + 2000 would leave Ravi's bonus NULL (NULL + 2000 = NULL).
-- Jiho (NULL salary) isn't updated: NULL < 70000 is UNKNOWN.
SELECT Name, Salary, Bonus FROM Compensation ORDER BY ID;

-- [12.21]
-- Hint: "No Data" means NULL. Write NULL without quotes. `'No Data'` in quotes would store those words.
INSERT INTO Book (Title, Genre, Year, Cost)
VALUES ('Circe', NULL, 2018, 15.00);      -- "No Data" is NULL, not the string 'No Data'
SELECT * FROM Book WHERE Genre IS NULL;

-- [12.22]
-- Hint: `SET Cost = Cost + 1` adds to the current value. Use `<=` for "$50 or less".
-- Hint: Circe, the book you added in 12.21, counts too.
UPDATE Book SET Cost = Cost + 1  WHERE Cost <= 50;
UPDATE Book SET Cost = Cost + 10 WHERE Cost > 100;
SELECT Title, Cost FROM Book ORDER BY Cost DESC LIMIT 3;

-- =====================================================================
-- 13. Concepts check
-- =====================================================================
-- Nothing to run. The answers are in 04-concepts-check.md, folded under each question.
-- These labels hold only the hints, which build_solutions.py folds in above each Answer.

-- [13.1]
-- Hint: DDL statements create, change, or remove database objects like tables, views, and indexes. DML statements work with the rows inside tables.

-- [13.2]
-- Hint: Ask three questions: Is it text, a whole number, or a number with decimals? Is it always the same length? How big can it get?
-- Hint: Whole-number ranges: TINYINT UNSIGNED 0–255, SMALLINT UNSIGNED 0–65,535, MEDIUMINT UNSIGNED 0–16,777,215, INT UNSIGNED 0–4,294,967,295.
-- Hint: A range that goes below 0 needs a signed type (leave out UNSIGNED). Signed TINYINT is -128 to 127.

-- [13.3]
-- Hint: A primary key must be different for every row and should never change. A foreign key holds a value of another table's primary key.

-- [13.4]
-- Hint: CASCADE passes the delete on to the child rows. SET NULL keeps the child rows but clears the link. RESTRICT refuses the delete.

-- [13.5]
-- Hint: For each join, ask: whose rows are guaranteed to be in the result, even when there's no match on the other side?

-- [13.6]
-- Hint: Look at the creators who have no content: Alice, Dan, and Eva. They're in the result with NULL titles. Which table's rows were all kept?

-- [13.7]
-- Hint: An outer join uses LEFT, RIGHT, or FULL JOIN. For the first question, it also has to join to a *different* table.
-- Hint: A self-join joins a table to itself, using two aliases.

-- [13.8]
-- Hint: Find the table whose rows must all appear ("all patients", "all YearSales"). Is it on the left or the right of JOIN?
-- Hint: With no "if available" or "regardless" wording, it's INNER.

-- [13.9]
-- Hint: "Materialized" means the results are actually saved, not worked out again each time.

-- [13.10]
-- Hint: An index is a sorted list of one column's values, each with a pointer to its row. Does the change alter that column's values, or add or remove rows?
-- Hint: Dense means one entry per row. Sparse means one entry per block of rows.

-- [13.11]
-- Hint: Entities are the nouns you'd store rows for. Words like "two" and "four" tell you how many, not what.
-- Hint: A relationship's degree is how many entity types take part in it: one (unary), two (binary), or three (ternary).

-- [13.12]
-- Hint: NULL means "unknown". Comparing anything with an unknown value, or adding to it, gives unknown.
-- Hint: Every aggregate function except COUNT(*) skips NULLs.

-- [13.13]
-- Hint: All of these words come up in Sections 3 to 7 and in the practice tests.


-- =====================================================================
-- 14. Final practice  (start from a FRESH load:  SOURCE /work/setup.sql;  or re-run it)
-- =====================================================================
-- [14.1]
-- Hint: Turn each description into a type the same way as in Section 11. For ID, which integer type is the smallest one that reaches 65 thousand?
-- Hint: "5 digits total and 2 decimal places" is DECIMAL(5,2). Rate also needs NOT NULL, a DEFAULT, and a CHECK with BETWEEN.
CREATE TABLE Instructor (
  ID         SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  FirstName  VARCHAR(20) NOT NULL,
  LastName   VARCHAR(30) NOT NULL,
  HireDate   DATE NOT NULL,
  Rate       DECIMAL(5,2) NOT NULL DEFAULT 45.00 CHECK (Rate BETWEEN 20 AND 150)
);

-- [14.2]
-- Hint: Use exactly the type you gave Instructor.ID in 14.1, UNSIGNED included.
-- Hint: One ALTER TABLE can ADD COLUMN and ADD FOREIGN KEY, separated by a comma. The rule is ON DELETE SET NULL.
ALTER TABLE LessonSchedule
  ADD COLUMN InstructorID SMALLINT UNSIGNED,
  ADD FOREIGN KEY (InstructorID) REFERENCES Instructor(ID) ON DELETE SET NULL;

-- [14.3]
-- Hint: To use the default rate, leave Rate out of the column list. Annie has her own rate, so her INSERT has to include Rate.
INSERT INTO Instructor (FirstName, LastName, HireDate) VALUES
  ('Dale', 'Evans',  '2020-04-01'),
  ('Roy',  'Rogers', '2022-09-15');
INSERT INTO Instructor (FirstName, LastName, HireDate, Rate) VALUES
  ('Annie', 'Oakley', '2024-06-03', 60.00);

-- [14.4]
-- Hint: Use three UPDATEs, in the order given. The last one uses `WHERE InstructorID IS NULL`.
-- Hint: Then GROUP BY InstructorID with COUNT(*).
UPDATE LessonSchedule SET InstructorID = 1 WHERE HorseID IN (1, 2, 3);
UPDATE LessonSchedule SET InstructorID = 2 WHERE HorseID IN (4, 5, 6);
UPDATE LessonSchedule SET InstructorID = 3 WHERE InstructorID IS NULL;
SELECT InstructorID, COUNT(*) AS Lessons FROM LessonSchedule GROUP BY InstructorID;

-- [14.5]
-- Hint: Join four tables. Only the join to Student needs to be a LEFT JOIN.
SELECT ls.LessonDateTime, h.RegisteredName,
       CONCAT(s.FirstName, ' ', s.LastName) AS Student,
       CONCAT(i.FirstName, ' ', i.LastName) AS Instructor
FROM LessonSchedule ls
JOIN Horse      h ON h.ID = ls.HorseID
JOIN Instructor i ON i.ID = ls.InstructorID
LEFT JOIN Student s ON s.ID = ls.StudentID
ORDER BY ls.LessonDateTime;

-- [14.6]
-- Hint: LEFT JOIN Instructor to LessonSchedule, GROUP BY the instructor, and multiply the lesson count by Rate.
-- Hint: Sort by two things: earnings DESC, then name.
SELECT CONCAT(i.FirstName, ' ', i.LastName) AS Instructor,
       COUNT(ls.HorseID)          AS Lessons,
       COUNT(ls.HorseID) * i.Rate AS Earnings
FROM Instructor i
LEFT JOIN LessonSchedule ls ON ls.InstructorID = i.ID
GROUP BY i.ID, i.FirstName, i.LastName, i.Rate
ORDER BY Earnings DESC, Instructor;

-- [14.7]
-- Hint: "Each breed that has more than one horse" is a condition on each group's count. Which clause filters groups?
-- Hint: Leaving out NULL breeds is about single rows, so that part goes in WHERE.
SELECT Breed, COUNT(*) AS Horses, ROUND(AVG(Height), 2) AS AvgHeight
FROM Horse
WHERE Breed IS NOT NULL
GROUP BY Breed
HAVING COUNT(*) > 1
ORDER BY AvgHeight DESC;

-- [14.8]
-- Hint: Compare Height with a subquery that returns the average height.
SELECT ID, RegisteredName, Height
FROM Horse
WHERE Height > (SELECT AVG(Height) FROM Horse)
ORDER BY Height DESC;

-- [14.9]
-- Hint: Inside the view, join Student, LessonSchedule, and Horse, and filter on City.
-- Hint: Sort when you select from the view, not inside the view.
CREATE VIEW AustinStudentLessons AS
SELECT s.FirstName, s.LastName, ls.LessonDateTime, h.RegisteredName
FROM Student s
JOIN LessonSchedule ls ON ls.StudentID = s.ID
JOIN Horse h           ON h.ID = ls.HorseID
WHERE s.City = 'Austin';
SELECT * FROM AustinStudentLessons ORDER BY LessonDateTime;

-- [14.10]
-- Hint: You look lessons up by StudentID in LessonSchedule. Put an index on that column.
CREATE INDEX idx_lesson_student ON LessonSchedule (StudentID);   -- speeds joins / lookups by student
-- (MySQL InnoDB already auto-creates an index for each FK column; naming one explicitly is still valid.)

-- [14.11]
-- Hint: Use UPDATE with CONCAT() and LOWER(), only for the students whose Email IS NULL.
UPDATE Student
SET Email = CONCAT(LOWER(FirstName), '.', LOWER(REPLACE(LastName, '''', '')), '@stable.example')
WHERE Email IS NULL;
SELECT ID, FirstName, LastName, Email FROM Student WHERE Email LIKE '%@stable.example';

-- [14.12]
-- Hint: Delete the horses whose ID is NOT IN the list of HorseIDs in LessonSchedule.
-- Hint: NOT IN is safe here because HorseID can never be NULL. Compare this with 6.6.
DELETE FROM Horse
WHERE ID NOT IN (SELECT HorseID FROM LessonSchedule);   -- HorseID is NOT NULL, so NOT IN is safe here
SELECT COUNT(*) AS HorsesLeft FROM Horse;               -- 9
