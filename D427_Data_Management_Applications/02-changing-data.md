# Part 2: Changing data and tables

[← Exercise index](exercises.md) · Solutions: [`solutions.sql`](solutions.sql)

These sections change the data and the tables. Do them in order: later exercises expect the earlier ones to be done. To start over, run `SOURCE /work/setup.sql;`.

**In this part:** [7. Modifying data](#7-modifying-data) · [8. CREATE / ALTER / DROP](#8-create--alter--drop) · [9. Views and indexes](#9-views-and-indexes) · [10. From design to tables](#10-from-design-to-tables)

## 7. Modifying data

- **7.1** Add the movie *Dune* to the Movie table with these values: Genre Sci-Fi, rating PG-13, released in 2021, 155 minutes long, and Gross 108327830. Do not give it an ID. Let MySQL choose the ID. What ID did MySQL give it? *(check: 1 new row)*

  <!-- solution:7.1 -->
  <details>
  <summary>Solution</summary>

  ```sql
  INSERT INTO Movie (Title, Genre, RatingCode, ReleaseYear, Minutes, Gross)
  VALUES ('Dune', 'Sci-Fi', 'PG-13', 2021, 155, 108327830);
  SELECT * FROM Movie WHERE Title = 'Dune';    -- ID 13 assigned by AUTO_INCREMENT
  ```

  </details>
  <!-- /solution -->

- **7.2** Add two students using a single INSERT statement:
  - Ava Nguyen, who lives in Austin, with the email ava@example.com
  - Ethan Brooks, who lives in Georgetown, with the email ethan@example.com

  Do not give a value for State. After the insert, look at the two new rows. What State did they get, and why? *(check: 2 new rows)*

  <!-- solution:7.2 -->
  <details>
  <summary>Solution</summary>

  ```sql
  INSERT INTO Student (FirstName, LastName, City, Email) VALUES
    ('Ava',   'Nguyen', 'Austin',     'ava@example.com'),
    ('Ethan', 'Brooks', 'Georgetown', 'ethan@example.com');
  SELECT ID, FirstName, LastName, City, State FROM Student WHERE ID > 8;  -- State = 'TX' (DEFAULT)
  ```

  </details>
  <!-- /solution -->

- **7.3** Give everyone in the Support department a 5% raise. In your WHERE clause, find the department by its **name** ("Support"). Do not type the DeptID number 30 directly. *(check: 3 rows changed)*

  <!-- solution:7.3 -->
  <details>
  <summary>Solution</summary>

  ```sql
  UPDATE Employee
  SET Salary = Salary * 1.05
  WHERE DeptID = (SELECT DeptID FROM Department WHERE DeptName = 'Support');
  SELECT FirstName, LastName, Salary FROM Employee WHERE DeptID = 30;
  ```

  </details>
  <!-- /solution -->

- **7.4** For any movie whose Genre is NULL, set the Genre to 'Indie' and the ReleaseYear to 2026. *(check: 1 row changed)*

  <!-- solution:7.4 -->
  <details>
  <summary>Solution</summary>

  ```sql
  UPDATE Movie
  SET Genre = 'Indie', ReleaseYear = 2026
  WHERE Genre IS NULL;
  SELECT ID, Title, Genre, ReleaseYear FROM Movie WHERE ID = 12;
  ```

  </details>
  <!-- /solution -->

- **7.5** Delete all lessons that are scheduled before 2026-02-02. *(check: 10 lessons should be left)*

  <!-- solution:7.5 -->
  <details>
  <summary>Solution</summary>

  ```sql
  DELETE FROM LessonSchedule
  WHERE LessonDateTime < '2026-02-02';
  SELECT COUNT(*) AS LessonsLeft FROM LessonSchedule;     -- 12 - 2 = 10
  ```

  </details>
  <!-- /solution -->

- **7.6** This exercise shows what a foreign key does when you delete a row:
  - Count how many lessons the horse Midnight (ID 9) has.
  - Delete the horse Midnight.
  - Count Midnight's lessons again.

  What happened to the lessons? Which foreign key action caused this? *(check: 1 lesson before, 0 after)*

  <!-- solution:7.6 -->
  <details>
  <summary>Solution</summary>

  ```sql
  SELECT COUNT(*) AS MidnightLessons FROM LessonSchedule WHERE HorseID = 9;   -- 1
  DELETE FROM Horse WHERE ID = 9;
  SELECT COUNT(*) AS MidnightLessons FROM LessonSchedule WHERE HorseID = 9;   -- 0  (ON DELETE CASCADE)
  ```

  </details>
  <!-- /solution -->

- **7.7** Delete the student Jamal Carter (ID 2). Then look at the LessonSchedule table. What happened to his lesson? Which foreign key action caused this? *(check: 2 lessons should now have a NULL StudentID)*

  <!-- solution:7.7 -->
  <details>
  <summary>Solution</summary>

  ```sql
  DELETE FROM Student WHERE ID = 2;
  SELECT * FROM LessonSchedule WHERE StudentID IS NULL;    -- Jamal's 2/4 lesson now has NULL (SET NULL)
  ```

  </details>
  <!-- /solution -->

- **7.8** This exercise shows how a transaction can undo changes:
  - Start a transaction.
  - Delete all movies rated R.
  - Count the movies.
  - Run `ROLLBACK`.
  - Count the movies again.

  *(check: 10 movies during the transaction, 13 after the rollback)*

  <!-- solution:7.8 -->
  <details>
  <summary>Solution</summary>

  ```sql
  START TRANSACTION;
  DELETE FROM Movie WHERE RatingCode = 'R';
  SELECT COUNT(*) AS DuringTxn FROM Movie;    -- 10
  ROLLBACK;
  SELECT COUNT(*) AS AfterRollback FROM Movie; -- 13 again
  ```

  </details>
  <!-- /solution -->

- **7.9** Both of these statements will fail. Run each one and read the error message:
  - Try to delete the 'PG' rating from the Rating table.
  - Try to add a movie with the RatingCode 'XX' (a rating that does not exist).

  Which constraint stops each one? What error number does MySQL show for each one?

  <!-- solution:7.9 -->
  <details>
  <summary>Solution</summary>

  ```sql
  -- Expected to FAIL - run it to see the error, then move on:
  --   DELETE FROM Rating WHERE RatingCode = 'PG';
  --   ERROR 1451: Cannot delete or update a parent row: a foreign key constraint fails
  -- Movie.RatingCode's FK has no ON DELETE clause, so the default (RESTRICT / NO ACTION) applies.
  -- Likewise, inserting a child row whose FK value has no parent fails with ERROR 1452:
  --   INSERT INTO Movie (Title, RatingCode) VALUES ('Bad', 'XX');
  SELECT COUNT(*) AS PGStillThere FROM Rating WHERE RatingCode = 'PG';
  ```

  </details>
  <!-- /solution -->

---

## 8. CREATE / ALTER / DROP

- **8.1** Create a table named **Song** with these columns:
  - `ID`: a whole number that MySQL fills in automatically (auto-increment). It is the primary key.
  - `Title`: text up to 60 characters. It is required (cannot be NULL).
  - `Artist`: text up to 60 characters. It is required (cannot be NULL).
  - `ReleaseYear`: a small whole number (SMALLINT).
  - `Genre`: text up to 20 characters. If no genre is given, it should be 'Pop'.
  - `DurationSec`: a whole number. It must be greater than 0.

  Two songs must not have the same Title **and** the same Artist. After you create the table, add two songs without giving a Genre. Check that both songs got 'Pop' as their Genre. *(2 rows)*

  <!-- solution:8.1 -->
  <details>
  <summary>Solution</summary>

  ```sql
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
  ```

  </details>
  <!-- /solution -->

- **8.2** Add a new column named `Album` to the Song table. It should hold text up to 60 characters, and it should appear right after the `Artist` column.

  <!-- solution:8.2 -->
  <details>
  <summary>Solution</summary>

  ```sql
  ALTER TABLE Song ADD COLUMN Album VARCHAR(60) AFTER Artist;
  ```

  </details>
  <!-- /solution -->

- **8.3** Change the `Genre` column so it can hold up to 30 characters instead of 20. **Make sure it still uses 'Pop' as the default.** (Check this afterward. It is easy to lose the default by mistake.)

  <!-- solution:8.3 -->
  <details>
  <summary>Solution</summary>

  ```sql
  ALTER TABLE Song MODIFY COLUMN Genre VARCHAR(30) DEFAULT 'Pop';
  -- MODIFY replaces the whole definition: omit DEFAULT here and the default is lost.
  ```

  </details>
  <!-- /solution -->

- **8.4** Rename the `DurationSec` column to `Seconds`. Your first try will fail because of the CHECK you added in 8.1. Read the error. Then do the rename in a way that keeps the rule that the value must be greater than 0. (Hint: `SHOW CREATE TABLE Song;` shows the name MySQL gave the check.)

  <!-- solution:8.4 -->
  <details>
  <summary>Solution</summary>

  ```sql
  -- Expected to FAIL (the CHECK from 8.1 uses the column):
  --   ALTER TABLE Song RENAME COLUMN DurationSec TO Seconds;
  --   ERROR 3959: Check constraint 'Song_chk_1' uses column 'DurationSec', hence column cannot be dropped or renamed.
  -- Drop the check, rename, and re-add the check in ONE statement (SHOW CREATE TABLE Song gives the check's name):
  ALTER TABLE Song
    DROP CHECK Song_chk_1,
    RENAME COLUMN DurationSec TO Seconds,
    ADD CONSTRAINT Song_chk_1 CHECK (Seconds > 0);
  -- Without a CHECK on the column, RENAME COLUMN alone (or CHANGE DurationSec Seconds INT) is enough.
  ```

  </details>
  <!-- /solution -->

- **8.5** Remove the `Album` column. Then run `DESCRIBE Song` to see the table's columns. *(6 columns)*

  <!-- solution:8.5 -->
  <details>
  <summary>Solution</summary>

  ```sql
  ALTER TABLE Song DROP COLUMN Album;
  DESCRIBE Song;
  ```

  </details>
  <!-- /solution -->

- **8.6** Create two new tables:
  - **Playlist**, with the columns ID, Name, and Created (a date).
  - **PlaylistSong**, which connects playlists to songs. It has the columns PlaylistID, SongID, and Position (the song's place in the playlist). Its primary key is made of both PlaylistID and SongID together (a composite primary key).

  If a playlist is deleted, its rows in PlaylistSong should be deleted too. If a song is deleted, its rows in PlaylistSong should also be deleted. After you create the tables, add one playlist that has both songs in it. Then show the songs in the playlist in order by Position. *(2 rows)*

  <!-- solution:8.6 -->
  <details>
  <summary>Solution</summary>

  ```sql
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
  ```

  </details>
  <!-- /solution -->

- **8.7** Create a table named **EmployeeArchive** with the columns EmpID (the primary key), FullName, Salary, and ArchivedOn (a date). Then fill it using **one** `INSERT … SELECT` statement that copies every employee in the Support department. Use today's date for ArchivedOn. *(3 rows)*

  <!-- solution:8.7 -->
  <details>
  <summary>Solution</summary>

  ```sql
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
  ```

  </details>
  <!-- /solution -->

- **8.8** This exercise adds a new table and connects it to Movie:
  - Create a table named **Director** with the columns ID and Name.
  - Add two directors: Denis Villeneuve and Christopher Nolan.
  - Using **one** `ALTER TABLE` statement, add a `DirectorID` column to the Movie table, and also add a foreign key on that column that points to Director. Give the foreign key a name.
  - Set the director of *Arrival* and *Dune* to Villeneuve, and the director of *Interstellar* to Nolan.
  - Show each of these movies' titles next to its director's name.

  *(3 rows)*

  <!-- solution:8.8 -->
  <details>
  <summary>Solution</summary>

  ```sql
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
  ```

  </details>
  <!-- /solution -->

- **8.9** Rename the EmployeeArchive table to FormerEmployee. Then delete (drop) the FormerEmployee table. Write the DROP statement so that it does not cause an error if you run it a second time. Also answer this: why would `DROP TABLE Song` fail right now?

  <!-- solution:8.9 -->
  <details>
  <summary>Solution</summary>

  ```sql
  RENAME TABLE EmployeeArchive TO FormerEmployee;   -- or ALTER TABLE ... RENAME TO ...
  SHOW TABLES;
  DROP TABLE FormerEmployee;
  DROP TABLE IF EXISTS FormerEmployee;              -- IF EXISTS: no error the second time
  -- DROP TABLE Song would FAIL: PlaylistSong references it. Drop children first.
  ```

  </details>
  <!-- /solution -->

---

## 9. Views and indexes

- **9.1** Create a view named **LessonDetail** with the columns LessonDateTime, Horse (the horse's RegisteredName), FirstName, and LastName. The view must include lesson times that have no student assigned. Then use the view to find the lessons that have no student. *(2 rows)*

  <!-- solution:9.1 -->
  <details>
  <summary>Solution</summary>

  ```sql
  CREATE VIEW LessonDetail AS
  SELECT ls.LessonDateTime, h.RegisteredName AS Horse,
         s.FirstName, s.LastName
  FROM LessonSchedule ls
  JOIN Horse h        ON ls.HorseID   = h.ID
  LEFT JOIN Student s ON ls.StudentID = s.ID;
  SELECT * FROM LessonDetail WHERE FirstName IS NULL;
  ```

  </details>
  <!-- /solution -->

- **9.2** Create a view named **DeptSummary** with the columns DeptID, DeptName, Headcount (the number of employees), and AvgSalary. The view must include every department, even one with no employees. Then use the view to show the departments that have 3 or more employees. *(3 rows)*

  <!-- solution:9.2 -->
  <details>
  <summary>Solution</summary>

  ```sql
  CREATE VIEW DeptSummary AS
  SELECT d.DeptID, d.DeptName,
         COUNT(e.EmpID)          AS Headcount,
         ROUND(AVG(e.Salary), 2) AS AvgSalary
  FROM Department d
  LEFT JOIN Employee e ON e.DeptID = d.DeptID
  GROUP BY d.DeptID, d.DeptName;
  SELECT * FROM DeptSummary WHERE Headcount >= 3 ORDER BY AvgSalary DESC;
  ```

  </details>
  <!-- /solution -->

- **9.3** This exercise shows how `WITH CHECK OPTION` protects a view:
  - Create a view named **SupportStaff** that shows only the employees in DeptID 30. Add `WITH CHECK OPTION` to the view.
  - Through the view, give employee 12 (EmpID 12) a raise of 1,000.
  - Then, through the view, try to move employee 12 to DeptID 20. Read the error message.
  - Finally, answer this: can you UPDATE rows through the DeptSummary view from 9.2? Why or why not?

  <!-- solution:9.3 -->
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
  <!-- /solution -->

- **9.4** Create an index on the LastName column of the Employee table. Use `SHOW INDEX` to see the index. Then use `EXPLAIN` to check that a search by last name uses your index.

  <!-- solution:9.4 -->
  <details>
  <summary>Solution</summary>

  ```sql
  CREATE INDEX idx_employee_lastname ON Employee (LastName);
  SHOW INDEX FROM Employee;
  EXPLAIN SELECT * FROM Employee WHERE LastName = 'Knuth';    -- key: idx_employee_lastname
  ```

  </details>
  <!-- /solution -->

- **9.5** Create one index that covers two columns of the Movie table: Genre and ReleaseYear, in that order (a composite index). Use `EXPLAIN` on a query that filters on both columns. Then answer this: would a query that filters **only** on ReleaseYear be able to use this index well? Why or why not?

  <!-- solution:9.5 -->
  <details>
  <summary>Solution</summary>

  ```sql
  CREATE INDEX idx_movie_genre_year ON Movie (Genre, ReleaseYear);
  EXPLAIN SELECT Title FROM Movie WHERE Genre = 'Sci-Fi' AND ReleaseYear >= 2015;
  -- A query on ReleaseYear ALONE cannot use this index efficiently: leftmost-prefix rule.
  ```

  </details>
  <!-- /solution -->

- **9.6** Delete (drop) the index you made in 9.5 and the SupportStaff view.

  <!-- solution:9.6 -->
  <details>
  <summary>Solution</summary>

  ```sql
  DROP INDEX idx_movie_genre_year ON Movie;
  DROP VIEW SupportStaff;
  SHOW INDEX FROM Movie;
  ```

  </details>
  <!-- /solution -->

---

## 10. From design to tables

- **10.1** Create tables for this design:
  - A **Customer** has a name and an email. The email is required, and no two customers can have the same email.
  - A customer can place many **Orders**. Each order has an order date.
  - An order can contain many **Products**, and a product can appear on many orders. Each product has a name and a unit price. The unit price must be 0 or more.
  - Each time a product appears on an order, it has a quantity. The quantity must be greater than 0.

  You decide the primary keys, the foreign keys, and what should happen when a row is deleted. Then add one customer, two products, and one order that has both products on it. Finally, write a query that calculates the total cost of the order. *(1 row: 20.00)*

  <!-- solution:10.1 -->
  <details>
  <summary>Solution</summary>

  ```sql
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
  ```

  </details>
  <!-- /solution -->

- **10.2** Here is a table that is not normalized:

  `Enrollment(StudentID, StudentName, CourseID, CourseTitle, InstructorID, InstructorName, InstructorOffice, Grade)`

  Its primary key is StudentID and CourseID together. Split it into tables that are in third normal form (3NF), and create those tables. Start each table's name with `NF_` (for example, `NF_Student`). Also list the partial dependencies and the transitive dependencies that you removed. *(4 tables)*

  <!-- solution:10.2 -->
  <details>
  <summary>Solution</summary>

  ```sql
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
  ```

  </details>
  <!-- /solution -->

---

[← Exercise index](exercises.md)
