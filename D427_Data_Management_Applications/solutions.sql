-- =====================================================================
-- D427 practice : SOLUTIONS
-- Sections 1-10 are meant to be worked in order against a fresh
-- `setup.sql` load (sections 7-10 change data/schema that later ones see).
-- Sections 11-13 stand alone: 11 builds its own `d427_drills` database,
-- 12 uses tables no other section touches, and 13 has no SQL (its answers are in 04-concepts-check.md).
-- Section 14 (mock assessment) starts from a FRESH setup.sql load again.
-- Statements marked "Expected to FAIL" are commented out; the error they raise is shown.
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
-- "Austin  OR  (Round Rock AND has phone)" - a different question: Priya (Austin,
-- no phone) sneaks in, so you get 5 rows instead of 4.

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
-- Expected to FAIL (the CHECK from 8.1 uses the column):
--   ALTER TABLE Song RENAME COLUMN DurationSec TO Seconds;
--   ERROR 3959: Check constraint 'Song_chk_1' uses column 'DurationSec', hence column cannot be dropped or renamed.
-- Drop the check, rename, and re-add the check in ONE statement (SHOW CREATE TABLE Song gives the check's name):
ALTER TABLE Song
  DROP CHECK Song_chk_1,
  RENAME COLUMN DurationSec TO Seconds,
  ADD CONSTRAINT Song_chk_1 CHECK (Seconds > 0);
-- Without a CHECK on the column, RENAME COLUMN alone (or CHANGE DurationSec Seconds INT) is enough.

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
-- 11. Writing tables from a specification (OA style)
--     Runs in its own database so it can reuse the OA's table names.
-- =====================================================================
DROP DATABASE IF EXISTS d427_drills;
CREATE DATABASE d427_drills;
USE d427_drills;

-- [11.1]
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
INSERT INTO LessonSchedule VALUES
  (1, 1, '2026-03-01 09:00:00'),
  (1, 1, '2026-03-02 09:00:00');
DELETE FROM Student WHERE ID = 1;
SELECT * FROM LessonSchedule;                 -- 2 rows, StudentID now NULL  (SET NULL)
DELETE FROM Horse WHERE ID = 1;
SELECT COUNT(*) AS LessonsLeft FROM LessonSchedule;   -- 0  (CASCADE)

-- [11.5]
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
--   ERROR 6125: Failed to add the foreign key constraint. Missing unique key ...
ALTER TABLE Breed ADD PRIMARY KEY (breedID);
ALTER TABLE Dog ADD CONSTRAINT fk_dog_breed FOREIGN KEY (breedID) REFERENCES Breed(breedID);
SHOW CREATE TABLE Dog;

-- [11.10]
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
-- There is no "ALTER FOREIGN KEY". Drop it by name, fix the column, add the new one.
-- (The practice tests' "ON DELETE SET TO NULL" is not valid MySQL; it's ON DELETE SET NULL.)
ALTER TABLE Exam DROP FOREIGN KEY fk_exam_patient;
ALTER TABLE Exam MODIFY patient_id INT;       -- SET NULL needs a nullable column
ALTER TABLE Exam ADD CONSTRAINT fk_exam_patient
  FOREIGN KEY (patient_id) REFERENCES Patient(patient_id) ON DELETE SET NULL;
DELETE FROM Patient WHERE patient_id = 1;
SELECT * FROM Exam;                           -- 1 row, patient_id NULL

-- [11.15]
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
USE d427;

-- =====================================================================
-- 12. OA-style query drills  (Book / YearSales, Passport / Visa, Compensation, student_grades)
-- =====================================================================
-- [12.1]
SELECT * FROM Book;

-- [12.2]
SELECT Title, Genre
FROM Book
WHERE Year = 2018;

-- [12.3]
SELECT Title
FROM Book
ORDER BY Title ASC;      -- ASC is the default; writing it costs nothing

-- [12.4]
SELECT Genre, COUNT(*) AS GenreCount
FROM Book
GROUP BY Genre
ORDER BY Genre DESC;
-- The NULL genre is its own group, and sorts LAST in DESC order.
-- The answer key's  SELECT DISTINCT Genre, COUNT(*) ... GROUP BY Genre  also works:
-- GROUP BY already makes each Genre unique, so DISTINCT does nothing.

-- [12.5]
SELECT COUNT(*) FROM Book WHERE Year = 2019;   -- a) 2
SELECT SUM(Cost) FROM Book;                    -- b)
SELECT MAX(Cost) FROM Book;                    -- c)

-- [12.6]
SELECT *
FROM Book
WHERE Cost > (SELECT AVG(Cost) FROM Book);   -- a) 1 row: one $125 book pulls the average up to 33.03

SELECT *
FROM Book
WHERE Cost < (SELECT AVG(Cost) FROM Book);   -- b) 12 rows
-- WHERE Cost > AVG(Cost) fails with ERROR 1111 (Invalid use of group function):
-- WHERE is checked one row at a time, before any aggregate exists.

-- [12.7]
-- "Title (if available)"  -> Book is the optional side.  "for all YearSales" -> keep every YearSales row.
SELECT YearSales.TotalSales, Book.Title
FROM Book
RIGHT JOIN YearSales ON Book.Year = YearSales.Year;

-- [12.8]
-- No "if available" / "regardless" wording, so the OA expects an INNER JOIN.
SELECT Book.Title, YearSales.TotalSales
FROM Book
INNER JOIN YearSales ON Book.Year = YearSales.Year;
-- The two books whose Year has no YearSales row (1989, 2017) drop out, and so does 2023.

-- [12.9]
-- "regardless of whether they had any sales" -> YearSales is optional; "for all Books" -> keep every book.
SELECT Book.Title, YearSales.TotalSales
FROM YearSales
RIGHT JOIN Book ON YearSales.Year = Book.Year;
-- Same thing written as a LEFT JOIN:  FROM Book LEFT JOIN YearSales ON ...

-- [12.10]
SELECT YearSales.TotalSales, Book.Title
FROM YearSales
LEFT JOIN Book ON Book.Year = YearSales.Year;
-- A RIGHT JOIN B  ==  B LEFT JOIN A. The table whose rows you keep is the one the arrow points at.

-- [12.11]
SELECT ys.Year
FROM YearSales ys
LEFT JOIN Book b ON b.Year = ys.Year
WHERE b.ID IS NULL;

-- [12.12]
SELECT Visa.VisaID, Passport.PassportHolderName
FROM Visa
LEFT JOIN Passport ON Visa.PassportID = Passport.PassportID
ORDER BY Visa.VisaID;

-- [12.13]
SELECT Passport.PassportHolderName, Visa.VisaType
FROM Passport
INNER JOIN Visa ON Visa.PassportID = Passport.PassportID
ORDER BY Passport.PassportHolderName;

-- [12.14]
SELECT VisaType, COUNT(*) AS VisaCount
FROM Visa
GROUP BY VisaType;

-- [12.15]
CREATE VIEW Visas_2023 AS
SELECT *
FROM Visa
WHERE YEAR(IssueDate) = 2023;
--  equivalent: WHERE IssueDate BETWEEN '2023-01-01' AND '2023-12-31'
--  (the BETWEEN form can use an index on IssueDate; wrapping the column in YEAR() can't)
SELECT * FROM Visas_2023;

-- [12.16]
SELECT p.PassportID, p.PassportHolderName
FROM Passport p
LEFT JOIN Visa v ON v.PassportID = p.PassportID
WHERE v.VisaID IS NULL;

-- [12.17]
-- a) Row subquery: returns ONE row with SEVERAL columns, compared with a row constructor.
SELECT Title, Genre, Year
FROM Book
WHERE (Genre, Year) = (SELECT Genre, Year FROM Book WHERE Title = 'Normal People');
-- b) Table subquery: returns SEVERAL rows, used with IN / EXISTS (or in FROM as a derived table).
SELECT Title, Year
FROM Book
WHERE Year IN (SELECT Year FROM YearSales WHERE Releases > 50);
-- (A scalar subquery, like the AVG in 12.6, returns exactly one row and one column.)

-- [12.18]
SELECT grade, COUNT(*) AS gradeCount
FROM student_grades
GROUP BY grade;

SELECT grade, COUNT(*) AS gradeCount
FROM student_grades
GROUP BY grade
HAVING gradeCount > 2;     -- MySQL allows the alias here; HAVING COUNT(*) > 2 works everywhere

-- [12.19]
SELECT Name FROM Compensation WHERE Salary = Bonus;    -- Sam Snead only
SELECT Name FROM Compensation WHERE Salary <> Bonus;   -- Maria Rodriguez only
-- Any comparison with NULL is UNKNOWN, and WHERE keeps only TRUE rows. Lisa, Ravi and Jiho
-- are in NEITHER result, even though "=" and "<>" look like they should cover everything.

-- [12.20]
UPDATE Compensation
SET Bonus = COALESCE(Bonus, 0) + 2000
WHERE Salary < 70000;
-- Bonus + 2000 would leave Ravi's bonus NULL (NULL + 2000 = NULL).
-- Jiho (NULL salary) isn't updated: NULL < 70000 is UNKNOWN.
SELECT Name, Salary, Bonus FROM Compensation ORDER BY ID;

-- [12.21]
INSERT INTO Book (Title, Genre, Year, Cost)
VALUES ('Circe', NULL, 2018, 15.00);      -- "No Data" is NULL, not the string 'No Data'
SELECT * FROM Book WHERE Genre IS NULL;

-- [12.22]
UPDATE Book SET Cost = Cost + 1  WHERE Cost <= 50;
UPDATE Book SET Cost = Cost + 10 WHERE Cost > 100;
SELECT Title, Cost FROM Book ORDER BY Cost DESC LIMIT 3;

-- =====================================================================
-- 13. Concepts check
-- =====================================================================
-- Nothing to run. The answers are in 04-concepts-check.md, folded under each question.

-- =====================================================================
-- 14. Mock assessment  (start from a FRESH load:  SOURCE /work/setup.sql;  or re-run it)
-- =====================================================================
-- [14.1]
CREATE TABLE Instructor (
  ID         SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  FirstName  VARCHAR(20) NOT NULL,
  LastName   VARCHAR(30) NOT NULL,
  HireDate   DATE NOT NULL,
  Rate       DECIMAL(5,2) NOT NULL DEFAULT 45.00 CHECK (Rate BETWEEN 20 AND 150)
);

-- [14.2]
ALTER TABLE LessonSchedule
  ADD COLUMN InstructorID SMALLINT UNSIGNED,
  ADD FOREIGN KEY (InstructorID) REFERENCES Instructor(ID) ON DELETE SET NULL;

-- [14.3]
INSERT INTO Instructor (FirstName, LastName, HireDate) VALUES
  ('Dale', 'Evans',  '2020-04-01'),
  ('Roy',  'Rogers', '2022-09-15');
INSERT INTO Instructor (FirstName, LastName, HireDate, Rate) VALUES
  ('Annie', 'Oakley', '2024-06-03', 60.00);

-- [14.4]
UPDATE LessonSchedule SET InstructorID = 1 WHERE HorseID IN (1, 2, 3);
UPDATE LessonSchedule SET InstructorID = 2 WHERE HorseID IN (4, 5, 6);
UPDATE LessonSchedule SET InstructorID = 3 WHERE InstructorID IS NULL;
SELECT InstructorID, COUNT(*) AS Lessons FROM LessonSchedule GROUP BY InstructorID;

-- [14.5]
SELECT ls.LessonDateTime, h.RegisteredName,
       CONCAT(s.FirstName, ' ', s.LastName) AS Student,
       CONCAT(i.FirstName, ' ', i.LastName) AS Instructor
FROM LessonSchedule ls
JOIN Horse      h ON h.ID = ls.HorseID
JOIN Instructor i ON i.ID = ls.InstructorID
LEFT JOIN Student s ON s.ID = ls.StudentID
ORDER BY ls.LessonDateTime;

-- [14.6]
SELECT CONCAT(i.FirstName, ' ', i.LastName) AS Instructor,
       COUNT(ls.HorseID)          AS Lessons,
       COUNT(ls.HorseID) * i.Rate AS Earnings
FROM Instructor i
LEFT JOIN LessonSchedule ls ON ls.InstructorID = i.ID
GROUP BY i.ID, i.FirstName, i.LastName, i.Rate
ORDER BY Earnings DESC, Instructor;

-- [14.7]
SELECT Breed, COUNT(*) AS Horses, ROUND(AVG(Height), 2) AS AvgHeight
FROM Horse
WHERE Breed IS NOT NULL
GROUP BY Breed
HAVING COUNT(*) > 1
ORDER BY AvgHeight DESC;

-- [14.8]
SELECT ID, RegisteredName, Height
FROM Horse
WHERE Height > (SELECT AVG(Height) FROM Horse)
ORDER BY Height DESC;

-- [14.9]
CREATE VIEW AustinStudentLessons AS
SELECT s.FirstName, s.LastName, ls.LessonDateTime, h.RegisteredName
FROM Student s
JOIN LessonSchedule ls ON ls.StudentID = s.ID
JOIN Horse h           ON h.ID = ls.HorseID
WHERE s.City = 'Austin';
SELECT * FROM AustinStudentLessons ORDER BY LessonDateTime;

-- [14.10]
CREATE INDEX idx_lesson_student ON LessonSchedule (StudentID);   -- speeds joins / lookups by student
-- (MySQL InnoDB already auto-creates an index for each FK column; naming one explicitly is still valid.)

-- [14.11]
UPDATE Student
SET Email = CONCAT(LOWER(FirstName), '.', LOWER(REPLACE(LastName, '''', '')), '@stable.example')
WHERE Email IS NULL;
SELECT ID, FirstName, LastName, Email FROM Student WHERE Email LIKE '%@stable.example';

-- [14.12]
DELETE FROM Horse
WHERE ID NOT IN (SELECT HorseID FROM LessonSchedule);   -- HorseID is NOT NULL, so NOT IN is safe here
SELECT COUNT(*) AS HorsesLeft FROM Horse;               -- 9
