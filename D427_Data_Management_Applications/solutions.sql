-- =====================================================================
-- D427 practice : SOLUTIONS
-- Sections 1-10 are meant to be worked in order against a fresh
-- `setup.sql` load (sections 7-9 change data/schema that later ones see).
-- Section 11 (mock assessment) starts from a FRESH setup.sql load again.
-- There is usually more than one correct answer; these are one each.
-- =====================================================================
USE d427;

-- =====================================================================
-- 1. SELECT basics
-- =====================================================================
-- [1.1]
SELECT * FROM Movie;

-- [1.2]
SELECT Title, ReleaseYear
FROM Movie
ORDER BY ReleaseYear DESC, Title ASC;
-- Note: NULLs sort FIRST in ASC and LAST in DESC in MySQL.

-- [1.3]
SELECT DISTINCT Genre FROM Movie;

-- [1.4]
SELECT FirstName, LastName, Salary
FROM Employee
WHERE Salary > 150000;

-- [1.5]
SELECT Title, Gross
FROM Movie
ORDER BY Gross DESC
LIMIT 3;

-- [1.6]
SELECT CONCAT(FirstName, ' ', LastName) AS FullName,
       ROUND(Salary / 12, 2)            AS MonthlyPay
FROM Employee
ORDER BY MonthlyPay DESC;   -- aliases are allowed in ORDER BY (not in WHERE)

-- =====================================================================
-- 2. Filtering: comparison, BETWEEN, IN, LIKE, NULL, AND/OR
-- =====================================================================
-- [2.1]
SELECT Title, ReleaseYear FROM Movie
WHERE ReleaseYear BETWEEN 2014 AND 2016;      -- inclusive on both ends

-- [2.2]
SELECT Title, RatingCode FROM Movie
WHERE RatingCode IN ('G', 'PG');

-- [2.3]
SELECT Title FROM Movie
WHERE Title LIKE 'The %';

-- [2.4]
SELECT FirstName, LastName FROM Student
WHERE LastName LIKE '_a%';                     -- _ = exactly one char, % = zero or more

-- [2.5]
SELECT EmpID, FirstName, LastName FROM Employee
WHERE Email IS NULL;                           -- "= NULL" never matches anything

-- [2.6]
SELECT RegisteredName, Breed FROM Horse
WHERE Breed <> 'Quarter Horse' OR Breed IS NULL;
-- Without the IS NULL test, 'Blue Ribbon' disappears: NULL <> 'x' is UNKNOWN, not TRUE.

-- [2.7]
SELECT FirstName, LastName, City, Phone FROM Student
WHERE (City = 'Austin' OR City = 'Round Rock')
  AND Phone IS NOT NULL;
-- AND binds tighter than OR. Drop the parentheses and you get
-- "Austin  OR  (Round Rock AND has phone)" - a different question.

-- =====================================================================
-- 3. Built-in functions
-- =====================================================================
-- [3.1]
SELECT UPPER(LastName) AS LastUpper,
       LENGTH(FirstName) AS FirstLen
FROM Student;

-- [3.2]
SELECT FirstName, LastName, HireDate,
       TIMESTAMPDIFF(YEAR, HireDate, '2026-10-01') AS YearsOfService
FROM Employee
ORDER BY YearsOfService DESC;

-- [3.3]
SELECT HorseID,
       DATE(LessonDateTime)      AS LessonDate,
       TIME(LessonDateTime)      AS LessonTime,
       DAYNAME(LessonDateTime)   AS DayOfWeek
FROM LessonSchedule
ORDER BY LessonDateTime;

-- [3.4]
SELECT Title, Minutes,
       CASE
         WHEN Minutes IS NULL THEN 'Unknown'
         WHEN Minutes < 100   THEN 'Short'
         WHEN Minutes < 140   THEN 'Standard'
         ELSE                      'Long'
       END AS LengthClass
FROM Movie;

-- [3.5]
SELECT Title, COALESCE(Genre, 'Unclassified') AS Genre   -- IFNULL(Genre,'Unclassified') also fine
FROM Movie;

-- [3.6]
SELECT Title, ROUND(Gross / 1000000, 1) AS GrossMillions
FROM Movie
WHERE Gross IS NOT NULL
ORDER BY GrossMillions DESC;

-- [3.7]
SELECT FirstName, LastName,
       CONCAT('(', SUBSTRING(Phone, 1, 3), ') ',
                   SUBSTRING(Phone, 4, 3), '-',
                   SUBSTRING(Phone, 7, 4)) AS FormattedPhone
FROM Student
WHERE Phone IS NOT NULL;

-- =====================================================================
-- 4. Aggregates, GROUP BY, HAVING
-- =====================================================================
-- [4.1]
SELECT COUNT(*)          AS TotalMovies,
       COUNT(RatingCode) AS RatedMovies     -- COUNT(col) skips NULLs
FROM Movie;

-- [4.2]
SELECT ROUND(AVG(Salary), 2) AS AvgSalary,
       MIN(Salary)           AS MinSalary,
       MAX(Salary)           AS MaxSalary,
       SUM(Salary)           AS Payroll
FROM Employee;

-- [4.3]
SELECT DeptID, COUNT(*) AS Headcount
FROM Employee
GROUP BY DeptID;      -- employees with NULL DeptID form their own group

-- [4.4]
SELECT Genre, SUM(Gross) AS TotalGross
FROM Movie
WHERE Genre IS NOT NULL
GROUP BY Genre
ORDER BY TotalGross DESC;

-- [4.5]
SELECT DeptID, ROUND(AVG(Salary), 2) AS AvgSalary
FROM Employee
GROUP BY DeptID
HAVING AVG(Salary) > 120000;
-- WHERE filters rows before grouping; HAVING filters groups after.

-- [4.6]
SELECT HorseID, COUNT(*) AS Lessons
FROM LessonSchedule
GROUP BY HorseID
HAVING COUNT(*) >= 2;

-- [4.7]
SELECT State, City, COUNT(*) AS Students
FROM Student
GROUP BY State, City
ORDER BY State, City;

-- =====================================================================
-- 5. Joins
-- =====================================================================
-- [5.1]
SELECT e.FirstName, e.LastName, d.DeptName
FROM Employee e
INNER JOIN Department d ON e.DeptID = d.DeptID;   -- Hedy Lamarr (NULL dept) is dropped

-- [5.2]
SELECT m.Title, r.RatingDescription
FROM Movie m
LEFT JOIN Rating r ON m.RatingCode = r.RatingCode;

-- [5.3]
SELECT d.DeptName, COUNT(e.EmpID) AS Headcount     -- COUNT(*) would give Legal a 1
FROM Department d
LEFT JOIN Employee e ON e.DeptID = d.DeptID
GROUP BY d.DeptID, d.DeptName
ORDER BY Headcount DESC, d.DeptName;

-- [5.4]
SELECT r.RatingCode, r.RatingDescription
FROM Rating r
LEFT JOIN Movie m ON m.RatingCode = r.RatingCode
WHERE m.ID IS NULL;

-- [5.5]
SELECT ls.LessonDateTime, h.RegisteredName, s.FirstName, s.LastName
FROM LessonSchedule ls
INNER JOIN Horse   h ON ls.HorseID   = h.ID
INNER JOIN Student s ON ls.StudentID = s.ID
ORDER BY ls.LessonDateTime, h.RegisteredName;

-- [5.6]
SELECT ls.LessonDateTime, h.RegisteredName, s.FirstName, s.LastName
FROM LessonSchedule ls
INNER JOIN Horse   h ON ls.HorseID   = h.ID
LEFT  JOIN Student s ON ls.StudentID = s.ID
ORDER BY ls.LessonDateTime, h.RegisteredName;

-- [5.7]
SELECT CONCAT(e.FirstName, ' ', e.LastName) AS Employee,
       CONCAT(m.FirstName, ' ', m.LastName) AS Manager
FROM Employee e
LEFT JOIN Employee m ON e.ManagerID = m.EmpID
ORDER BY e.EmpID;
-- CONCAT with any NULL argument returns NULL, so top-level managers show NULL.

-- [5.8]
SELECT CONCAT(e.FirstName, ' ', e.LastName) AS Employee, ed.DeptName AS EmpDept,
       CONCAT(m.FirstName, ' ', m.LastName) AS Manager,  md.DeptName AS MgrDept
FROM Employee e
JOIN Employee   m  ON e.ManagerID = m.EmpID
JOIN Department ed ON e.DeptID    = ed.DeptID
JOIN Department md ON m.DeptID    = md.DeptID
WHERE e.DeptID <> m.DeptID;

-- [5.9]
SELECT d.DeptName, COUNT(e.EmpID) AS Headcount
FROM Employee e
RIGHT JOIN Department d ON e.DeptID = d.DeptID
GROUP BY d.DeptID, d.DeptName
ORDER BY Headcount DESC, d.DeptName;

-- [5.10]
SELECT h.ID, h.RegisteredName
FROM Horse h
LEFT JOIN LessonSchedule ls ON ls.HorseID = h.ID
WHERE ls.HorseID IS NULL;

-- [5.11]
SELECT COUNT(*) AS Pairings
FROM Horse CROSS JOIN Student;     -- 10 horses x 8 students = 80

-- [5.12]
-- MySQL has no FULL OUTER JOIN; emulate it with LEFT JOIN UNION RIGHT JOIN.
SELECT e.FirstName, e.LastName, d.DeptName
FROM Employee e LEFT JOIN Department d ON e.DeptID = d.DeptID
UNION
SELECT e.FirstName, e.LastName, d.DeptName
FROM Employee e RIGHT JOIN Department d ON e.DeptID = d.DeptID;

-- =====================================================================
-- 6. Subqueries
-- =====================================================================
-- [6.1]
SELECT FirstName, LastName, Salary
FROM Employee
WHERE Salary > (SELECT AVG(Salary) FROM Employee);

-- [6.2]
SELECT Title, Genre, Minutes
FROM Movie
WHERE Minutes > (SELECT AVG(Minutes) FROM Movie WHERE Genre = 'Sci-Fi');

-- [6.3]
SELECT ID, FirstName, LastName
FROM Student
WHERE ID IN (SELECT StudentID FROM LessonSchedule);

-- [6.4]
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

-- [6.5]
SELECT e.FirstName, e.LastName, e.DeptID, e.Salary
FROM Employee e
WHERE e.Salary > (SELECT AVG(e2.Salary)
                  FROM Employee e2
                  WHERE e2.DeptID = e.DeptID);     -- correlated: re-evaluated per row

-- [6.6]
SELECT d.DeptName, e.FirstName, e.LastName, e.Salary
FROM Employee e
JOIN Department d ON e.DeptID = d.DeptID
WHERE e.Salary = (SELECT MAX(e2.Salary) FROM Employee e2 WHERE e2.DeptID = e.DeptID)
ORDER BY e.Salary DESC;

-- [6.7]
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

-- [6.8]
SELECT d.DeptName
FROM Department d
WHERE EXISTS (SELECT 1 FROM Employee e
              WHERE e.DeptID = d.DeptID AND e.HireDate > '2020-01-01');

-- =====================================================================
-- 7. Modifying data: INSERT, UPDATE, DELETE, transactions
-- =====================================================================
-- [7.1]
INSERT INTO Movie (Title, Genre, RatingCode, ReleaseYear, Minutes, Gross)
VALUES ('Dune', 'Sci-Fi', 'PG-13', 2021, 155, 108327830);
SELECT * FROM Movie WHERE Title = 'Dune';    -- ID 13 assigned by AUTO_INCREMENT

-- [7.2]
INSERT INTO Student (FirstName, LastName, City, Email) VALUES
  ('Ava',   'Nguyen', 'Austin',     'ava@example.com'),
  ('Ethan', 'Brooks', 'Georgetown', 'ethan@example.com');
SELECT ID, FirstName, LastName, City, State FROM Student WHERE ID > 8;  -- State = 'TX' (DEFAULT)

-- [7.3]
UPDATE Employee
SET Salary = Salary * 1.05
WHERE DeptID = (SELECT DeptID FROM Department WHERE DeptName = 'Support');
SELECT FirstName, LastName, Salary FROM Employee WHERE DeptID = 30;

-- [7.4]
UPDATE Movie
SET Genre = 'Indie', ReleaseYear = 2026
WHERE Genre IS NULL;
SELECT ID, Title, Genre, ReleaseYear FROM Movie WHERE ID = 12;

-- [7.5]
DELETE FROM LessonSchedule
WHERE LessonDateTime < '2026-02-02';
SELECT COUNT(*) AS LessonsLeft FROM LessonSchedule;     -- 12 - 2 = 10

-- [7.6]
SELECT COUNT(*) AS MidnightLessons FROM LessonSchedule WHERE HorseID = 9;   -- 1
DELETE FROM Horse WHERE ID = 9;
SELECT COUNT(*) AS MidnightLessons FROM LessonSchedule WHERE HorseID = 9;   -- 0  (ON DELETE CASCADE)

-- [7.7]
DELETE FROM Student WHERE ID = 2;
SELECT * FROM LessonSchedule WHERE StudentID IS NULL;    -- Jamal's 2/4 lesson now has NULL (SET NULL)

-- [7.8]
START TRANSACTION;
DELETE FROM Movie WHERE RatingCode = 'R';
SELECT COUNT(*) AS DuringTxn FROM Movie;    -- 10
ROLLBACK;
SELECT COUNT(*) AS AfterRollback FROM Movie; -- 13 again

-- [7.9]
-- Expected to FAIL - run it to see the error, then move on:
--   DELETE FROM Rating WHERE RatingCode = 'PG';
--   ERROR 1451: Cannot delete or update a parent row: a foreign key constraint fails
-- Movie.RatingCode's FK has no ON DELETE clause, so the default (RESTRICT / NO ACTION) applies.
-- Likewise, inserting a child row whose FK value has no parent fails with ERROR 1452:
--   INSERT INTO Movie (Title, RatingCode) VALUES ('Bad', 'XX');
SELECT COUNT(*) AS PGStillThere FROM Rating WHERE RatingCode = 'PG';

-- =====================================================================
-- 8. Defining structure: CREATE / ALTER / DROP
-- =====================================================================
-- [8.1]
CREATE TABLE Song (
  ID           INT          AUTO_INCREMENT,
  Title        VARCHAR(60)  NOT NULL,
  Artist       VARCHAR(60)  NOT NULL,
  ReleaseYear  SMALLINT,
  Genre        VARCHAR(20)  DEFAULT 'Pop',
  DurationSec  INT          CHECK (DurationSec > 0),
  PRIMARY KEY (ID),
  UNIQUE (Title, Artist)
);
INSERT INTO Song (Title, Artist, ReleaseYear, DurationSec) VALUES
  ('Bohemian Rhapsody', 'Queen', 1975, 354),
  ('Clocks', 'Coldplay', 2002, 307);
SELECT * FROM Song;

-- [8.2]
ALTER TABLE Song ADD COLUMN Album VARCHAR(60) AFTER Artist;

-- [8.3]
ALTER TABLE Song MODIFY COLUMN Genre VARCHAR(30) DEFAULT 'Pop';
-- MODIFY replaces the whole definition: omit DEFAULT here and the default is lost.

-- [8.4]
ALTER TABLE Song RENAME COLUMN DurationSec TO Seconds;
-- Older syntax that also works: ALTER TABLE Song CHANGE DurationSec Seconds INT;

-- [8.5]
ALTER TABLE Song DROP COLUMN Album;
DESCRIBE Song;

-- [8.6]
CREATE TABLE Playlist (
  ID       INT AUTO_INCREMENT PRIMARY KEY,
  Name     VARCHAR(40) NOT NULL,
  Created  DATE NOT NULL
);
CREATE TABLE PlaylistSong (
  PlaylistID  INT NOT NULL,
  SongID      INT NOT NULL,
  Position    TINYINT UNSIGNED NOT NULL,
  PRIMARY KEY (PlaylistID, SongID),
  FOREIGN KEY (PlaylistID) REFERENCES Playlist(ID) ON DELETE CASCADE,
  FOREIGN KEY (SongID)     REFERENCES Song(ID)     ON DELETE CASCADE
);
INSERT INTO Playlist (Name, Created) VALUES ('Road Trip', '2026-10-01');
INSERT INTO PlaylistSong VALUES (1, 1, 1), (1, 2, 2);
SELECT p.Name, ps.Position, s.Title
FROM Playlist p
JOIN PlaylistSong ps ON ps.PlaylistID = p.ID
JOIN Song s          ON s.ID = ps.SongID
ORDER BY ps.Position;

-- [8.7]
CREATE TABLE EmployeeArchive (
  EmpID       INT PRIMARY KEY,
  FullName    VARCHAR(70)   NOT NULL,
  Salary      DECIMAL(10,2),
  ArchivedOn  DATE          NOT NULL
);
INSERT INTO EmployeeArchive (EmpID, FullName, Salary, ArchivedOn)
SELECT EmpID, CONCAT(FirstName, ' ', LastName), Salary, CURDATE()
FROM Employee
WHERE DeptID = 30;
SELECT * FROM EmployeeArchive;

-- [8.8]
CREATE TABLE Director (
  ID    INT AUTO_INCREMENT PRIMARY KEY,
  Name  VARCHAR(50) NOT NULL
);
INSERT INTO Director (Name) VALUES ('Denis Villeneuve'), ('Christopher Nolan');
ALTER TABLE Movie
  ADD COLUMN DirectorID INT,
  ADD CONSTRAINT fk_movie_director FOREIGN KEY (DirectorID) REFERENCES Director(ID);
UPDATE Movie SET DirectorID = 1 WHERE Title IN ('Arrival', 'Dune');
UPDATE Movie SET DirectorID = 2 WHERE Title = 'Interstellar';
SELECT m.Title, d.Name AS Director
FROM Movie m JOIN Director d ON m.DirectorID = d.ID;

-- [8.9]
RENAME TABLE EmployeeArchive TO FormerEmployee;   -- or ALTER TABLE ... RENAME TO ...
SHOW TABLES;
DROP TABLE FormerEmployee;
DROP TABLE IF EXISTS FormerEmployee;              -- IF EXISTS: no error the second time
-- DROP TABLE Song would FAIL: PlaylistSong references it. Drop children first.

-- =====================================================================
-- 9. Views and indexes
-- =====================================================================
-- [9.1]
CREATE VIEW LessonDetail AS
SELECT ls.LessonDateTime, h.RegisteredName AS Horse,
       s.FirstName, s.LastName
FROM LessonSchedule ls
JOIN Horse h        ON ls.HorseID   = h.ID
LEFT JOIN Student s ON ls.StudentID = s.ID;
SELECT * FROM LessonDetail WHERE FirstName IS NULL;

-- [9.2]
CREATE VIEW DeptSummary AS
SELECT d.DeptID, d.DeptName,
       COUNT(e.EmpID)          AS Headcount,
       ROUND(AVG(e.Salary), 2) AS AvgSalary
FROM Department d
LEFT JOIN Employee e ON e.DeptID = d.DeptID
GROUP BY d.DeptID, d.DeptName;
SELECT * FROM DeptSummary WHERE Headcount >= 3 ORDER BY AvgSalary DESC;

-- [9.3]
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

-- [9.4]
CREATE INDEX idx_employee_lastname ON Employee (LastName);
SHOW INDEX FROM Employee;
EXPLAIN SELECT * FROM Employee WHERE LastName = 'Knuth';    -- key: idx_employee_lastname

-- [9.5]
CREATE INDEX idx_movie_genre_year ON Movie (Genre, ReleaseYear);
EXPLAIN SELECT Title FROM Movie WHERE Genre = 'Sci-Fi' AND ReleaseYear >= 2015;
-- A query on ReleaseYear ALONE cannot use this index efficiently: leftmost-prefix rule.

-- [9.6]
DROP INDEX idx_movie_genre_year ON Movie;
DROP VIEW SupportStaff;
SHOW INDEX FROM Movie;

-- =====================================================================
-- 10. Design: ER description / normalization -> tables
-- =====================================================================
-- [10.1]
CREATE TABLE Customer (
  CustomerID  INT AUTO_INCREMENT PRIMARY KEY,
  Name        VARCHAR(50) NOT NULL,
  Email       VARCHAR(60) NOT NULL UNIQUE
);
CREATE TABLE Product (
  ProductID   INT AUTO_INCREMENT PRIMARY KEY,
  Name        VARCHAR(50)   NOT NULL,
  UnitPrice   DECIMAL(8,2)  NOT NULL CHECK (UnitPrice >= 0)
);
CREATE TABLE CustOrder (                 -- "Order" is a reserved word
  OrderID     INT AUTO_INCREMENT PRIMARY KEY,
  CustomerID  INT  NOT NULL,
  OrderDate   DATE NOT NULL,
  FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID)
);
CREATE TABLE OrderLine (                 -- resolves the M:N between orders and products
  OrderID     INT NOT NULL,
  ProductID   INT NOT NULL,
  Quantity    INT NOT NULL CHECK (Quantity > 0),
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
-- Original: Enrollment(StudentID, StudentName, CourseID, CourseTitle,
--                      InstructorID, InstructorName, InstructorOffice, Grade)
-- Key = (StudentID, CourseID).
--   Partial dependencies (violate 2NF): StudentID -> StudentName ;
--                                       CourseID  -> CourseTitle, InstructorID
--   Transitive dependency (violates 3NF): CourseID -> InstructorID -> InstructorName, InstructorOffice
CREATE TABLE NF_Student    (StudentID INT PRIMARY KEY, StudentName VARCHAR(50) NOT NULL);
CREATE TABLE NF_Instructor (InstructorID INT PRIMARY KEY, InstructorName VARCHAR(50) NOT NULL,
                            InstructorOffice VARCHAR(10));
CREATE TABLE NF_Course     (CourseID CHAR(6) PRIMARY KEY, CourseTitle VARCHAR(60) NOT NULL,
                            InstructorID INT,
                            FOREIGN KEY (InstructorID) REFERENCES NF_Instructor(InstructorID));
CREATE TABLE NF_Enrollment (StudentID INT, CourseID CHAR(6), Grade CHAR(2),
                            PRIMARY KEY (StudentID, CourseID),
                            FOREIGN KEY (StudentID) REFERENCES NF_Student(StudentID),
                            FOREIGN KEY (CourseID)  REFERENCES NF_Course(CourseID));
SHOW TABLES LIKE 'NF\_%';

-- =====================================================================
-- 11. Mock assessment  (start from a FRESH load:  SOURCE setup.sql  or re-run it)
-- =====================================================================
-- [11.1]
CREATE TABLE Instructor (
  ID         SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  FirstName  VARCHAR(20) NOT NULL,
  LastName   VARCHAR(30) NOT NULL,
  HireDate   DATE NOT NULL,
  Rate       DECIMAL(5,2) NOT NULL DEFAULT 45.00 CHECK (Rate BETWEEN 20 AND 150)
);

-- [11.2]
ALTER TABLE LessonSchedule
  ADD COLUMN InstructorID SMALLINT UNSIGNED,
  ADD FOREIGN KEY (InstructorID) REFERENCES Instructor(ID) ON DELETE SET NULL;

-- [11.3]
INSERT INTO Instructor (FirstName, LastName, HireDate) VALUES
  ('Dale', 'Evans',  '2020-04-01'),
  ('Roy',  'Rogers', '2022-09-15');
INSERT INTO Instructor (FirstName, LastName, HireDate, Rate) VALUES
  ('Annie', 'Oakley', '2024-06-03', 60.00);

-- [11.4]
UPDATE LessonSchedule SET InstructorID = 1 WHERE HorseID IN (1, 2, 3);
UPDATE LessonSchedule SET InstructorID = 2 WHERE HorseID IN (4, 5, 6);
UPDATE LessonSchedule SET InstructorID = 3 WHERE InstructorID IS NULL;
SELECT InstructorID, COUNT(*) AS Lessons FROM LessonSchedule GROUP BY InstructorID;

-- [11.5]
SELECT ls.LessonDateTime, h.RegisteredName,
       CONCAT(s.FirstName, ' ', s.LastName) AS Student,
       CONCAT(i.FirstName, ' ', i.LastName) AS Instructor
FROM LessonSchedule ls
JOIN Horse      h ON h.ID = ls.HorseID
JOIN Instructor i ON i.ID = ls.InstructorID
LEFT JOIN Student s ON s.ID = ls.StudentID
ORDER BY ls.LessonDateTime;

-- [11.6]
SELECT CONCAT(i.FirstName, ' ', i.LastName) AS Instructor,
       COUNT(ls.HorseID)          AS Lessons,
       COUNT(ls.HorseID) * i.Rate AS Earnings
FROM Instructor i
LEFT JOIN LessonSchedule ls ON ls.InstructorID = i.ID
GROUP BY i.ID, i.FirstName, i.LastName, i.Rate
ORDER BY Earnings DESC, Instructor;

-- [11.7]
SELECT Breed, COUNT(*) AS Horses, ROUND(AVG(Height), 2) AS AvgHeight
FROM Horse
WHERE Breed IS NOT NULL
GROUP BY Breed
HAVING COUNT(*) > 1
ORDER BY AvgHeight DESC;

-- [11.8]
SELECT ID, RegisteredName, Height
FROM Horse
WHERE Height > (SELECT AVG(Height) FROM Horse)
ORDER BY Height DESC;

-- [11.9]
CREATE VIEW AustinStudentLessons AS
SELECT s.FirstName, s.LastName, ls.LessonDateTime, h.RegisteredName
FROM Student s
JOIN LessonSchedule ls ON ls.StudentID = s.ID
JOIN Horse h           ON h.ID = ls.HorseID
WHERE s.City = 'Austin';
SELECT * FROM AustinStudentLessons ORDER BY LessonDateTime;

-- [11.10]
CREATE INDEX idx_lesson_student ON LessonSchedule (StudentID);   -- speeds joins / lookups by student
-- (MySQL InnoDB already auto-creates an index for each FK column; naming one explicitly is still valid.)

-- [11.11]
UPDATE Student
SET Email = CONCAT(LOWER(FirstName), '.', LOWER(REPLACE(LastName, '''', '')), '@stable.example')
WHERE Email IS NULL;
SELECT ID, FirstName, LastName, Email FROM Student WHERE Email LIKE '%@stable.example';

-- [11.12]
DELETE FROM Horse
WHERE ID NOT IN (SELECT HorseID FROM LessonSchedule);   -- HorseID is NOT NULL, so NOT IN is safe here
SELECT COUNT(*) AS HorsesLeft FROM Horse;               -- 9
