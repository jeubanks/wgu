# Part 2: Changing data and tables

[← Exercise index](exercises.md) · Solutions: [`solutions.sql`](solutions.sql)

These sections change the data and the tables. Do them in order: later exercises expect the earlier ones to be done. To start over, run `SOURCE /work/setup.sql;`.

**In this part:** [7. Modifying data](#7-modifying-data) · [8. CREATE / ALTER / DROP](#8-create--alter--drop) · [9. Views and indexes](#9-views-and-indexes) · [10. From design to tables](#10-from-design-to-tables)

## 7. Modifying data


### Movie and Rating

- **7.1** Add the movie *Dune* to the Movie table with these values: Genre Sci-Fi, rating PG-13, released in 2021, 155 minutes long, and Gross 108327830. Do not give it an ID. Let MySQL choose the ID. What ID did MySQL give it? *(check: 1 new row)*

  <!-- solution:7.1 -->
  <details>
  <summary>Hint</summary>

  - List the columns you are filling in. If you leave ID out, MySQL assigns the next number.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  INSERT INTO Movie (Title, Genre, RatingCode, ReleaseYear, Minutes, Gross)
  VALUES ('Dune', 'Sci-Fi', 'PG-13', 2021, 155, 108327830);
  SELECT * FROM Movie WHERE Title = 'Dune';    -- ID 13 assigned by AUTO_INCREMENT
  ```

  </details>
  <!-- /solution -->

- **7.2** For any movie whose Genre is NULL, set the Genre to 'Indie' and the ReleaseYear to 2026. *(check: 1 row changed)*

  <!-- solution:7.2 -->
  <details>
  <summary>Hint</summary>

  - One UPDATE can set two columns: `SET a = ..., b = ...`. Use `IS NULL`, not `= NULL`.

  </details>

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

- **7.3** This exercise shows how a transaction can undo changes:
  - Start a transaction.
  - Delete all movies rated R.
  - Count the movies.
  - Run `ROLLBACK`.
  - Count the movies again.

  *(check: 10 movies during the transaction, 13 after the rollback)*

  <!-- solution:7.3 -->
  <details>
  <summary>Hint</summary>

  - `START TRANSACTION;` begins the transaction. Changes aren't permanent until `COMMIT`, and `ROLLBACK` undoes them.

  </details>

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

- **7.4** Both of these statements will fail. Run each one and read the error message:
  - Try to delete the 'PG' rating from the Rating table.
  - Try to add a movie with the RatingCode 'XX' (a rating that does not exist).

  Which constraint stops each one? What error number does MySQL show for each one?

  <!-- solution:7.4 -->
  <details>
  <summary>Hint</summary>

  - Rating is the parent table and Movie is the child table. Which one does each statement break?
  - Errors 1451 and 1452 are both foreign key errors. Read which one talks about a parent row and which one about a child row.

  </details>

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

### Student

- **7.5** Add two students using a single INSERT statement:
  - Ava Nguyen, who lives in Austin, with the email ava@example.com
  - Ethan Brooks, who lives in Georgetown, with the email ethan@example.com

  Do not give a value for State. After the insert, look at the two new rows. What State did they get, and why? *(check: 2 new rows)*

  <!-- solution:7.5 -->
  <details>
  <summary>Hint</summary>

  - One INSERT can add several rows: `VALUES (...), (...)`.
  - Leave State out of the column list, and MySQL uses its DEFAULT.

  </details>

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

### Employee and Department

- **7.6** Give everyone in the Support department a 5% raise. In your WHERE clause, find the department by its **name** ("Support"). Do not type the DeptID number 30 directly. *(check: 3 rows changed)*

  <!-- solution:7.6 -->
  <details>
  <summary>Hint</summary>

  - Raise the salary with `SET Salary = Salary * 1.05`.
  - Find the DeptID with a subquery on Department: `WHERE DeptID = (SELECT DeptID FROM Department WHERE ...)`.

  </details>

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

### Horse, Student, and LessonSchedule

- **7.7** Delete all lessons that are scheduled before 2026-02-02. *(check: 10 lessons should be left)*

  <!-- solution:7.7 -->
  <details>
  <summary>Hint</summary>

  - Compare LessonDateTime with '2026-02-02'. A date with no time means midnight at the start of that day.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  DELETE FROM LessonSchedule
  WHERE LessonDateTime < '2026-02-02';
  SELECT COUNT(*) AS LessonsLeft FROM LessonSchedule;     -- 12 - 2 = 10
  ```

  </details>
  <!-- /solution -->

- **7.8** This exercise shows what a foreign key does when you delete a row:
  - Count how many lessons the horse Midnight (ID 9) has.
  - Delete the horse Midnight.
  - Count Midnight's lessons again.

  What happened to the lessons? Which foreign key action caused this? *(check: 1 lesson before, 0 after)*

  <!-- solution:7.8 -->
  <details>
  <summary>Hint</summary>

  - Look at the HorseID foreign key with `SHOW CREATE TABLE LessonSchedule;`. What does its ON DELETE say?

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT COUNT(*) AS MidnightLessons FROM LessonSchedule WHERE HorseID = 9;   -- 1
  DELETE FROM Horse WHERE ID = 9;
  SELECT COUNT(*) AS MidnightLessons FROM LessonSchedule WHERE HorseID = 9;   -- 0  (ON DELETE CASCADE)
  ```

  </details>
  <!-- /solution -->

- **7.9** Delete the student Jamal Carter (ID 2). Then look at the LessonSchedule table. What happened to his lesson? Which foreign key action caused this? *(check: 2 lessons should now have a NULL StudentID)*

  <!-- solution:7.9 -->
  <details>
  <summary>Hint</summary>

  - Same idea as 7.8, but look at the ON DELETE rule for StudentID.
  - One lesson already had no student before you started.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  DELETE FROM Student WHERE ID = 2;
  SELECT * FROM LessonSchedule WHERE StudentID IS NULL;    -- Jamal's 2/4 lesson now has NULL (SET NULL)
  ```

  </details>
  <!-- /solution -->

### Adding and deleting: more practice

These exercises use a small scratch table named Guest that no other exercise uses. Create it first:

```sql
CREATE TABLE Guest (
  GuestID   INT AUTO_INCREMENT PRIMARY KEY,
  FullName  VARCHAR(40) NOT NULL,
  City      VARCHAR(20),
  Visits    INT NOT NULL DEFAULT 0
);
```

- **7.10** Two ways to write an INSERT:
  - Add Ana Ruiz from Austin, with 3 visits, **without** a column list. With no column list you must give a value for every column, in the table's order. What do you put for GuestID so MySQL still picks the number?
  - Add Ben Cho from Dallas **with** a column list, and leave Visits out. What does he get for Visits?
  - Try to add a guest with only a City: `INSERT INTO Guest (City) VALUES ('Waco');`. It fails. Why?
  - Try `INSERT INTO Guest VALUES ('Cara Lin', 'Austin', 5);`. It fails too. Why?

  *(2 rows)*

  <!-- solution:7.10 -->
  <details>
  <summary>Hint</summary>

  - With no column list, the VALUES must cover every column, in the order the table defines them. Writing NULL (or DEFAULT) for an AUTO_INCREMENT column lets MySQL choose the number.
  - A column you leave out of the column list gets its DEFAULT. A NOT NULL column with no DEFAULT can't be left out.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  CREATE TABLE Guest (
    GuestID   INT AUTO_INCREMENT PRIMARY KEY,
    FullName  VARCHAR(40) NOT NULL,
    City      VARCHAR(20),
    Visits    INT NOT NULL DEFAULT 0
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
  ```

  </details>
  <!-- /solution -->

- **7.11** Choosing your own AUTO_INCREMENT value:
  - Add Cara Lin from Austin with 5 visits, and give her GuestID **100** yourself.
  - Add Dev Patel from Houston without giving an ID. What GuestID does he get, and why not 3?

  *(4 rows)*

  <!-- solution:7.11 -->
  <details>
  <summary>Hint</summary>

  - You can give an AUTO_INCREMENT column a value yourself, as long as it isn't already used.
  - MySQL's next number is always one more than the highest ID it has seen so far.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  INSERT INTO Guest (GuestID, FullName, City, Visits) VALUES (100, 'Cara Lin', 'Austin', 5);
  INSERT INTO Guest (FullName, City) VALUES ('Dev Patel', 'Houston');
  SELECT * FROM Guest;                          -- Dev Patel is 101: the counter jumped past 100
  ```

  </details>
  <!-- /solution -->

- **7.12** Check before you delete. You want to remove every guest who has never visited (Visits is 0).
  - First write a **SELECT** with the WHERE clause you plan to use, and look at which rows it returns.
  - When the rows look right, change `SELECT *` to `DELETE` and keep the same WHERE.

  Why is this a good habit? *(2 rows, then check: 2 guests left)*

  <!-- solution:7.12 -->
  <details>
  <summary>Hint</summary>

  - Write the WHERE once, in a SELECT. If the rows it returns are the ones you want gone, swap `SELECT *` for `DELETE`.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT * FROM Guest WHERE Visits = 0;         -- Ben Cho and Dev Patel
  DELETE FROM Guest WHERE Visits = 0;
  SELECT * FROM Guest;                          -- Ana Ruiz and Cara Lin are left
  -- A DELETE can't be undone outside a transaction. The SELECT shows you exactly what will go first.
  ```

  </details>
  <!-- /solution -->

- **7.13** Delete with a subquery, inside a transaction so you can undo it:
  - Count the lessons in LessonSchedule.
  - Start a transaction. Using a subquery, delete every lesson taken by a student who lives in Austin. (The city is in Student, but the rows you're deleting are in LessonSchedule.) Write it as a SELECT first, like in 7.12.
  - Count the lessons again, then run ROLLBACK and count once more.
  - Why does `StudentID = (subquery)` fail here, while `StudentID IN (subquery)` works?

  *(4 rows in the SELECT; check: 9 lessons, then 5, then 9 after the rollback)*

  <!-- solution:7.13 -->
  <details>
  <summary>Hint</summary>

  - The subquery finds the IDs of the students who live in Austin: `SELECT ID FROM Student WHERE City = 'Austin'`.
  - The subquery returns several IDs, so compare with IN. `=` only works when a subquery returns exactly one value.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT COUNT(*) AS Lessons FROM LessonSchedule;                   -- 9
  START TRANSACTION;
  SELECT * FROM LessonSchedule
  WHERE StudentID IN (SELECT ID FROM Student WHERE City = 'Austin'); -- 4 rows
  DELETE FROM LessonSchedule
  WHERE StudentID IN (SELECT ID FROM Student WHERE City = 'Austin');
  SELECT COUNT(*) AS Lessons FROM LessonSchedule;                   -- 5
  ROLLBACK;
  SELECT COUNT(*) AS Lessons FROM LessonSchedule;                   -- 9 again
  -- Expected to FAIL (four students live in Austin, so the subquery returns more than one value):
  --   DELETE FROM LessonSchedule WHERE StudentID = (SELECT ID FROM Student WHERE City = 'Austin');
  --   ERROR 1242: Subquery returns more than 1 row
  ```

  </details>
  <!-- /solution -->

- **7.14** DELETE versus TRUNCATE. Both remove every row from a table:
  - Start a transaction, run `DELETE FROM Guest;` with **no** WHERE, and count the rows. Then ROLLBACK and count again.
  - Start another transaction, run `TRUNCATE TABLE Guest;`, then ROLLBACK and count again. What's different?
  - Add Eli Moss from Austin without an ID. What GuestID does he get? What would he have gotten after a DELETE instead?

  *(check: 0, then 2 after the first rollback; 0 after the TRUNCATE rollback; Eli Moss gets GuestID 1)*

  <!-- solution:7.14 -->
  <details>
  <summary>Hint</summary>

  - DELETE is DML, so a transaction can undo it. TRUNCATE is DDL: it commits right away.
  - TRUNCATE empties the table by re-creating it, which also restarts its AUTO_INCREMENT counter.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  START TRANSACTION;
  DELETE FROM Guest;                            -- no WHERE: every row
  SELECT COUNT(*) AS Guests FROM Guest;         -- 0
  ROLLBACK;
  SELECT COUNT(*) AS Guests FROM Guest;         -- 2: the DELETE was undone
  START TRANSACTION;
  TRUNCATE TABLE Guest;
  ROLLBACK;
  SELECT COUNT(*) AS Guests FROM Guest;         -- 0: ROLLBACK can't undo a TRUNCATE
  INSERT INTO Guest (FullName, City) VALUES ('Eli Moss', 'Austin');
  SELECT * FROM Guest;                          -- GuestID 1: TRUNCATE reset the counter
  -- After a DELETE of every row, the counter would have kept going, and Eli Moss would be 102.
  ```

  </details>
  <!-- /solution -->

---

## 8. CREATE / ALTER / DROP


### Song and Playlist

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
  <summary>Hint</summary>

  - `AUTO_INCREMENT`, `NOT NULL`, `DEFAULT 'Pop'`, and `CHECK (DurationSec > 0)` all go on the column definitions.
  - "Not the same Title and the same Artist" is one UNIQUE constraint over both columns: `UNIQUE (Title, Artist)`.

  </details>

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
  <summary>Hint</summary>

  - `ALTER TABLE ... ADD COLUMN ...` can end with `AFTER column_name`.

  </details>

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
  <summary>Hint</summary>

  - `ALTER TABLE ... MODIFY COLUMN` replaces the column's whole definition. Anything you leave out, like the DEFAULT, is lost.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  ALTER TABLE Song MODIFY COLUMN Genre VARCHAR(30) DEFAULT 'Pop';
  -- MODIFY replaces the whole definition: omit DEFAULT here and the default is lost.
  ```

  </details>
  <!-- /solution -->

- **8.4** Rename the `DurationSec` column to `Seconds`. Your first try will fail because of the CHECK you added in 8.1. Read the error. Then do the rename in a way that keeps the rule that the value must be greater than 0.

  <!-- solution:8.4 -->
  <details>
  <summary>Hint</summary>

  - `SHOW CREATE TABLE Song;` shows the name MySQL gave the check.
  - One ALTER TABLE can do several things, separated by commas: drop the check, rename the column, and add the check back using the new name.

  </details>

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
  <summary>Hint</summary>

  - `ALTER TABLE ... DROP COLUMN ...`

  </details>

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
  <summary>Hint</summary>

  - Create Playlist first, because PlaylistSong points to it.
  - Write `PRIMARY KEY (PlaylistID, SongID)` on its own line, and give both foreign keys `ON DELETE CASCADE`.

  </details>

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

### Movie and Director

- **8.7** This exercise adds a new table and connects it to Movie:
  - Create a table named **Director** with the columns ID and Name.
  - Add two directors: Denis Villeneuve and Christopher Nolan.
  - Using **one** `ALTER TABLE` statement, add a `DirectorID` column to the Movie table, and also add a foreign key on that column that points to Director. Give the foreign key a name.
  - Set the director of *Arrival* and *Dune* to Villeneuve, and the director of *Interstellar* to Nolan.
  - Show each of these movies' titles next to its director's name.

  *(3 rows)*

  <!-- solution:8.7 -->
  <details>
  <summary>Hint</summary>

  - One ALTER TABLE can have several parts separated by commas: `ADD COLUMN ...` and `ADD CONSTRAINT name FOREIGN KEY ...`.
  - The new DirectorID column must have the same type as Director.ID.

  </details>

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

### EmployeeArchive

- **8.8** Create a table named **EmployeeArchive** with the columns EmpID (the primary key), FullName, Salary, and ArchivedOn (a date). Then fill it using **one** `INSERT … SELECT` statement that copies every employee in the Support department. Use today's date for ArchivedOn. *(3 rows)*

  <!-- solution:8.8 -->
  <details>
  <summary>Hint</summary>

  - `INSERT INTO table (columns) SELECT ... FROM ... WHERE ...` has no VALUES keyword.
  - `CURDATE()` returns today's date, and `CONCAT()` builds FullName.

  </details>

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

- **8.9** Rename the EmployeeArchive table to FormerEmployee. Then delete (drop) the FormerEmployee table. Write the DROP statement so that it does not cause an error if you run it a second time. Also answer this: why would `DROP TABLE Song` fail right now?

  <!-- solution:8.9 -->
  <details>
  <summary>Hint</summary>

  - Use `RENAME TABLE old TO new;` and `DROP TABLE IF EXISTS ...;`.
  - For the last question: which table has a foreign key that points to Song?

  </details>

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


### LessonSchedule

- **9.1** Create a view named **LessonDetail** with the columns LessonDateTime, Horse (the horse's RegisteredName), FirstName, and LastName. The view must include lesson times that have no student assigned. Then use the view to find the lessons that have no student. *(2 rows)*

  <!-- solution:9.1 -->
  <details>
  <summary>Hint</summary>

  - `CREATE VIEW name AS SELECT ...`. The SELECT needs a LEFT JOIN to Student, like 5.10.
  - Rename the RegisteredName column with `AS Horse`.

  </details>

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

- **9.2** Change the LessonDetail view so it also shows each horse's **Breed**, right after the Horse column. Use `ALTER VIEW`.
  - Count the rows in LessonDetail.
  - Add a lesson to the **LessonSchedule table** (not to the view): horse 1, student 1, at 2026-03-01 10:00. Look for it in LessonDetail and count the rows again.
  - Delete that lesson from LessonSchedule, and count the rows in the view once more.
  - Finally, try `ALTER VIEW NoSuchView AS SELECT 1;` and read the error.

  Why did the view change when you changed the table? *(check: the view has 9 lessons, then 10, then 9)*

  <!-- solution:9.2 -->
  <details>
  <summary>Hint</summary>

  - `ALTER VIEW name AS SELECT ...` replaces the view's whole query, so write the full SELECT again with the new column added.
  - A view stores only its query, not its rows. Each time you select from it, MySQL runs that query on the tables as they are right now.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
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
  ```

  </details>
  <!-- /solution -->

### Employee and Department

- **9.3** Create a view named **DeptSummary** with the columns DeptID, DeptName, Headcount (the number of employees), and AvgSalary. The view must include every department, even one with no employees. Then use the view to show the departments that have 3 or more employees. *(3 rows)*

  <!-- solution:9.3 -->
  <details>
  <summary>Hint</summary>

  - The view's SELECT is the LEFT JOIN with GROUP BY from 5.2, plus an AVG.
  - Once the view exists, you query it like a table: `SELECT * FROM DeptSummary WHERE ...`.

  </details>

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

- **9.4** Management wants DeptSummary to show only departments that **have** employees. Change the view with `CREATE OR REPLACE VIEW` this time, then select everything from it. Legal should be gone.
  - What's the difference between `CREATE OR REPLACE VIEW` and `ALTER VIEW`? When would you choose one over the other?

  *(5 rows)*

  <!-- solution:9.4 -->
  <details>
  <summary>Hint</summary>

  - Which kind of join keeps departments with no employees? Switch to the kind that doesn't.
  - `CREATE OR REPLACE VIEW` takes a complete SELECT, just like CREATE VIEW.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
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
  ```

  </details>
  <!-- /solution -->

- **9.5** This exercise shows how `WITH CHECK OPTION` protects a view:
  - Create a view named **SupportStaff** that shows only the employees in DeptID 30. Add `WITH CHECK OPTION` to the view.
  - Through the view, give employee 12 (EmpID 12) a raise of 1,000.
  - Then, through the view, try to move employee 12 to DeptID 20. Read the error message.
  - Finally, answer this: can you UPDATE rows through the DeptSummary view from 9.3? Why or why not?

  <!-- solution:9.5 -->
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
  <!-- /solution -->

- **9.6** Create an index on the LastName column of the Employee table. Use `SHOW INDEX` to see the index. Then use `EXPLAIN` to check that a search by last name uses your index.

  <!-- solution:9.6 -->
  <details>
  <summary>Hint</summary>

  - `CREATE INDEX name ON Employee (LastName);`, then `SHOW INDEX FROM Employee;`.
  - In the EXPLAIN output, the `key` column shows which index MySQL used.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  CREATE INDEX idx_employee_lastname ON Employee (LastName);
  SHOW INDEX FROM Employee;
  EXPLAIN SELECT * FROM Employee WHERE LastName = 'Knuth';    -- key: idx_employee_lastname
  ```

  </details>
  <!-- /solution -->

### Movie

- **9.7** Create one index that covers two columns of the Movie table: Genre and ReleaseYear, in that order (a composite index). Use `EXPLAIN` on a query that filters on both columns. Then answer this: would a query that filters **only** on ReleaseYear be able to use this index well? Why or why not?

  <!-- solution:9.7 -->
  <details>
  <summary>Hint</summary>

  - List both columns in the index, in order: `ON Movie (Genre, ReleaseYear)`.
  - Think of a phone book sorted by last name, then first name. Can it help you find everyone whose first name is Ana?

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  CREATE INDEX idx_movie_genre_year ON Movie (Genre, ReleaseYear);
  EXPLAIN SELECT Title FROM Movie WHERE Genre = 'Sci-Fi' AND ReleaseYear >= 2015;
  -- A query on ReleaseYear ALONE cannot use this index efficiently: leftmost-prefix rule.
  ```

  </details>
  <!-- /solution -->

### Cleaning up

- **9.8** Delete (drop) the index you made in 9.7 and the SupportStaff view.

  <!-- solution:9.8 -->
  <details>
  <summary>Hint</summary>

  - `DROP INDEX name ON Movie;` and `DROP VIEW name;`

  </details>

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
  <summary>Hint</summary>

  - You need four tables: Customer, Orders, Product, and a linking table for the many-to-many between orders and products.
  - The linking table holds Quantity, and its primary key is (OrderID, ProductID).
  - `ORDER` is a reserved word in SQL, so don't name a table Order.

  </details>

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
  <summary>Hint</summary>

  - A partial dependency is a column that depends on only part of the key (only StudentID, or only CourseID).
  - A transitive dependency is a column that depends on another non-key column. For example, InstructorName depends on InstructorID.
  - Give each kind of fact its own table: students, courses, instructors, and enrollments (with the Grade).

  </details>

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
