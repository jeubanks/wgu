# Part 2: Changing data and tables

[← Exercise index](exercises.md) · Solutions: [`solutions.sql`](solutions.sql)

These sections change the data and the tables. Do them in order: later exercises expect the earlier ones to be done. To start over, run `SOURCE /work/setup.sql;` (or the path to your copy of `setup.sql` if MySQL is installed on your computer). Section 7 also has a **Try it** box on each exercise, so you can practice in your browser; Sections 8 to 10 need MySQL.

**In this part:** [7. Modifying data](#7-modifying-data) · [8. CREATE / ALTER / DROP](#8-create--alter--drop) · [9. Views and indexes](#9-views-and-indexes) · [10. From design to tables](#10-from-design-to-tables)

## 7. Modifying data

### Movie and Rating

- **7.1**\
  **Uses:** Movie *(already in the database, from `setup.sql`)*

  Add this movie to the **Movie** table:

  | ID | Title | Genre | RatingCode | ReleaseYear | Minutes | Gross |
  |---|---|---|---|---|---|---|
  | *(leave out)* | Dune | Sci-Fi | PG-13 | 2021 | 155 | 108327830 |

  Don't give an ID; let MySQL choose it. What ID did MySQL give *Dune*? *(check: 1 new row)*

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

- **7.2**\
  **Uses:** Movie *(already in the database, from `setup.sql`)*

  For any movie whose Genre is NULL, set the Genre to 'Indie' and the ReleaseYear to 2026. *(check: 1 row changed)*

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

- **7.3**\
  **Uses:** Rating, Movie *(already in the database, from `setup.sql`)*

  Both of these statements will fail. Run each one and read the error message:
  - Try to delete the 'PG' rating from the Rating table.
  - Try to add a movie with the Title 'Bad' and the RatingCode 'XX' (a rating that does not exist). Leave out every other column.

  Which constraint stops each one? What error number does MySQL show for each one?

  <!-- solution:7.3 -->
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

- **7.4**\
  **Uses:** Student *(already in the database, from `setup.sql`)*

  Add these two students to the **Student** table using a single INSERT statement:

  | FirstName | LastName | City | Email |
  |---|---|---|---|
  | Ava | Nguyen | Austin | ava@example.com |
  | Ethan | Brooks | Georgetown | ethan@example.com |

  Leave out every other column: ID, Street, State, Zip, and Phone. After the insert, look at the two new rows. What State did they get, and why? *(check: 2 new rows)*

  <!-- solution:7.4 -->
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

- **7.5**\
  **Uses:** Employee, Department *(already in the database, from `setup.sql`)*

  Give everyone in the Support department a 5% raise. In your WHERE clause, find the department by its **name** ("Support"). Do not type the DeptID number 30 directly. *(check: 3 rows changed)*

  <!-- solution:7.5 -->
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

- **7.6**\
  **Uses:** LessonSchedule *(already in the database, from `setup.sql`)*

  Delete all lessons that are scheduled before 2026-02-02. *(check: 10 lessons should be left)*

  <!-- solution:7.6 -->
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

**What ON DELETE does.** When a parent row is deleted, the foreign key's ON DELETE rule decides what happens to its child rows. Exercises 7.7 and 7.8 let you find out which rule two of the `setup.sql` foreign keys use. Here are the three rules on two small made-up tables (they aren't in `setup.sql`): each Ride's BusID points at a Bus, and the Red line bus is deleted.

<!-- delete-diagram
table: Bus(BusID, Route) = 10, Red line; 20, Blue line
table: Ride(RideID, BusID, Departs) = 1, 10, 08:00; 2, 10, 12:30; 3, 10, 17:15; 4, 20, 09:00
parent: Bus | BusID, Route
child: Ride | RideID, BusID, Departs
fk: BusID -> BusID
delete: BusID = 10
CASCADE: `FOREIGN KEY (BusID) REFERENCES Bus(BusID) ON DELETE CASCADE`: the delete is passed on, and the Red line's rides are deleted with it.
SET NULL: `... ON DELETE SET NULL`: the rides stay, but their BusID becomes NULL. (The column must allow NULL.)
RESTRICT: `... ON DELETE RESTRICT`: the delete is refused while any ride points at the bus. A foreign key with no ON DELETE clause works the same way (MySQL's default, NO ACTION).
-->
- `ON DELETE CASCADE`: deleting the parent deletes its child rows too.
- `ON DELETE SET NULL`: the child rows stay, and their foreign key becomes NULL.
- `ON DELETE RESTRICT` (or no ON DELETE clause): the DELETE fails with ERROR 1451 while child rows point at the parent.
<!-- /delete-diagram -->

- **7.7**\
  **Uses:** Horse, LessonSchedule *(already in the database, from `setup.sql`)*

  This exercise shows what a foreign key does when you delete a row:
  - Count how many lessons the horse Midnight (ID 9) has.
  - Delete the horse Midnight.
  - Count Midnight's lessons again.

  What happened to the lessons? Which foreign key action caused this? *(check: 1 lesson before, 0 after)*

  <!-- delete-diagram
  parent: Horse | ID, RegisteredName | ID IN (8, 9)
  child: LessonSchedule | HorseID, LessonDateTime | HorseID IN (8, 9)
  fk: HorseID -> ID
  delete: ID = 9
  in: solution
  CASCADE: `LessonSchedule.HorseID` is `ON DELETE CASCADE`, so deleting Midnight deleted her lesson too.
  -->
  <!-- /delete-diagram -->

  <!-- solution:7.7 -->
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

- **7.8**\
  **Uses:** Student, LessonSchedule *(already in the database, from `setup.sql`)*

  Delete the student Jamal Carter (ID 2). Then look at the LessonSchedule table. What happened to his lesson? Which foreign key action caused this? *(check: 2 lessons should now have a NULL StudentID)*

  <!-- delete-diagram
  parent: Student | ID, FirstName | ID IN (2, 3)
  child: LessonSchedule | StudentID, LessonDateTime | LessonDateTime >= '2026-02-02' AND (StudentID IN (2, 3) OR StudentID IS NULL)
  fk: StudentID -> ID
  delete: ID = 2
  in: solution
  SET NULL: `LessonSchedule.StudentID` is `ON DELETE SET NULL`, so Jamal's lesson stays with a NULL StudentID, next to the open slot that already had none. (The lessons left after 7.6.)
  -->
  <!-- /delete-diagram -->

  <!-- solution:7.8 -->
  <details>
  <summary>Hint</summary>

  - Same idea as 7.7, but look at the ON DELETE rule for StudentID.
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

### Guest: adding, changing, and deleting

These exercises use a small scratch table named Guest that no other exercise uses. You create it in 7.9.

- **7.9**\
  **Creates:** Guest

  Create a table named **Guest** with these columns, in this order:
  - `GuestID`: a whole number from 0 to 65 thousand that MySQL fills in automatically (auto-increment). It is the primary key.
  - `FullName`: text up to 40 characters. It is required (cannot be NULL).
  - `City`: text up to 20 characters.
  - `Visits`: a whole number from 0 to 255. It is required (cannot be NULL). If no value is given, it should be 0.

  For each whole-number column, use the smallest integer type that holds its whole range.

  Then try two ways to write an INSERT. Add these two guests to the **Guest** table:

  | GuestID | FullName | City | Visits |
  |---|---|---|---|
  | *(leave out)* | Ana Ruiz | Austin | 3 |
  | *(leave out)* | Ben Cho | Dallas | *(leave out)* |

  - Add Ana Ruiz **without** a column list. With no column list you must give a value for every column, in the table's order. What do you put for GuestID so MySQL still picks the number?
  - Add Ben Cho **with** a column list, and leave Visits out. What does he get for Visits?
  - Try to add a guest with only a City: `INSERT INTO Guest (City) VALUES ('Waco');`. It fails. Why?
  - Try `INSERT INTO Guest VALUES ('Cara Lin', 'Austin', 5);`. It fails too. Why?

  *(2 rows)*

  <!-- solution:7.9 -->
  <details>
  <summary>Hint</summary>

  - A range that starts at 0 means UNSIGNED. 0 to 65 thousand fits SMALLINT UNSIGNED, and 0 to 255 fits TINYINT UNSIGNED.
  - `AUTO_INCREMENT PRIMARY KEY` lets MySQL number the rows, and `NOT NULL DEFAULT 0` makes Visits required but filled in when you leave it out.
  - With no column list, the VALUES must cover every column, in the order the table defines them. Writing NULL (or DEFAULT) for an AUTO_INCREMENT column lets MySQL choose the number.
  - A column you leave out of the column list gets its DEFAULT. A NOT NULL column with no DEFAULT can't be left out.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
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
  ```

  </details>
  <!-- /solution -->

- **7.10**\
  **Uses:** Guest *(from 7.9)*

  Choosing your own AUTO_INCREMENT value. Add these two guests, one at a time:

  | GuestID | FullName | City | Visits |
  |---|---|---|---|
  | **100** | Cara Lin | Austin | 5 |
  | *(leave out)* | Dev Patel | Houston | *(leave out)* |

  You give Cara Lin's GuestID yourself; Dev Patel gets his from MySQL. What GuestID does he get, and why not 3?

  *(4 rows)*

  <!-- solution:7.10 -->
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

- **7.11**\
  **Uses:** Guest *(from 7.9)*

  Check before you delete. You want to remove every guest who has never visited (Visits is 0).
  - First write a **SELECT** with the WHERE clause you plan to use, and look at which rows it returns.
  - When the rows look right, change `SELECT *` to `DELETE` and keep the same WHERE.

  Why is this a good habit? *(2 rows, then check: 2 guests left)*

  <!-- solution:7.11 -->
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
  -- A DELETE can't be undone. The SELECT shows you exactly what will go first.
  ```

  </details>
  <!-- /solution -->

- **7.12**\
  **Uses:** Guest *(from 7.9)*

  > **ⓘ Note:** This changes **every row** in the existing Guest table, and there's no undo.

  UPDATE with no WHERE. Run `UPDATE Guest SET Visits = Visits + 1;` with **no** WHERE clause. How many rows did MySQL say it changed? Look at the table.

  There's no undo for this: every guest's Visits went up. Why do people say to always write the WHERE (or the SELECT from 7.11) first? *(check: 2 rows changed; Ana Ruiz now has 4 visits and Cara Lin 6)*

  <!-- solution:7.12 -->
  <details>
  <summary>Hint</summary>

  - Without a WHERE, an UPDATE changes every row in the table.
  - The client prints how many rows were changed, like "Rows matched: 2  Changed: 2".

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  UPDATE Guest SET Visits = Visits + 1;         -- Rows matched: 2  Changed: 2
  SELECT * FROM Guest;                          -- Ana Ruiz 4, Cara Lin 6
  -- Some tools turn on "safe updates" mode, which refuses an UPDATE or DELETE without a WHERE
  -- on a key column, for exactly this reason.
  ```

  </details>
  <!-- /solution -->

- **7.13**\
  **Uses:** Guest *(from 7.9)*

  DELETE versus TRUNCATE. Both remove every row from a table, but they aren't the same:
  - Run `DELETE FROM Guest;` with **no** WHERE, and count the rows.
  - Add this guest, then look at the table. What GuestID did he get?

    | GuestID | FullName | City | Visits |
    |---|---|---|---|
    | *(leave out)* | Eli Moss | Austin | *(leave out)* |

  - Now run `TRUNCATE TABLE Guest;` and add this guest. What GuestID did she get?

    | GuestID | FullName | City | Visits |
    |---|---|---|---|
    | *(leave out)* | Fay Wong | Dallas | *(leave out)* |

  - What does TRUNCATE do that DELETE doesn't?

  *(check: 0 rows after the DELETE; Eli Moss gets GuestID 102; Fay Wong gets GuestID 1)*

  <!-- solution:7.13 -->
  <details>
  <summary>Hint</summary>

  - `DELETE FROM Guest;` removes the rows but keeps the AUTO_INCREMENT counter where it was.
  - TRUNCATE empties the table by re-creating it, which also restarts its AUTO_INCREMENT counter at 1.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  DELETE FROM Guest;                            -- no WHERE: every row
  SELECT COUNT(*) AS Guests FROM Guest;         -- 0
  INSERT INTO Guest (FullName, City) VALUES ('Eli Moss', 'Austin');
  SELECT * FROM Guest;                          -- GuestID 102: the counter kept going after 101
  TRUNCATE TABLE Guest;
  INSERT INTO Guest (FullName, City) VALUES ('Fay Wong', 'Dallas');
  SELECT * FROM Guest;                          -- GuestID 1: TRUNCATE reset the counter
  -- TRUNCATE is DDL and is also faster on big tables, but it can't have a WHERE:
  -- it always removes everything.
  ```

  </details>
  <!-- /solution -->

---

## 8. CREATE / ALTER / DROP

### Song and Playlist

- **8.1**\
  **Creates:** Song

  Create a table named **Song** with these columns:
  - `ID`: a whole number from 0 to 16 million that MySQL fills in automatically (auto-increment). It is the primary key.
  - `Title`: text up to 60 characters. It is required (cannot be NULL).
  - `Artist`: text up to 60 characters. It is required (cannot be NULL).
  - `ReleaseYear`: a whole number from 0 to 9,999.
  - `Genre`: text up to 20 characters. If no genre is given, it should be 'Pop'.
  - `DurationSec`: the song's length in seconds, a whole number from 1 to 65 thousand. It must be greater than 0.

  Add one UNIQUE rule that covers Title and Artist together: no two songs can have both the same Title and the same Artist. The same Title by a different Artist is allowed.

  After you create the table, add these two songs:

  | ID | Title | Artist | ReleaseYear | Genre | DurationSec |
  |---|---|---|---|---|---|
  | *(leave out)* | Bohemian Rhapsody | Queen | 1975 | *(leave out)* | 354 |
  | *(leave out)* | Clocks | Coldplay | 2002 | *(leave out)* | 307 |

  Check that both songs got 'Pop' as their Genre. *(2 rows)*

  <!-- solution:8.1 -->
  <details>
  <summary>Hint</summary>

  - 0 to 16 million fits MEDIUMINT UNSIGNED. 0 to 9,999 and 1 to 65 thousand both need SMALLINT UNSIGNED: TINYINT stops at 255.
  - UNSIGNED still allows 0, so DurationSec also needs `CHECK (DurationSec > 0)`.
  - `AUTO_INCREMENT`, `NOT NULL`, `DEFAULT 'Pop'`, and the CHECK all go on the column definitions.
  - "Not the same Title and the same Artist" is one UNIQUE constraint over both columns: `UNIQUE (Title, Artist)`.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
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
  ```

  </details>
  <!-- /solution -->

- **8.2**\
  **Uses:** Song *(from 8.1)*

  > **ⓘ Note:** You **change** the Song table you made in 8.1 by adding a column. You don't create a new table.

  Add a new column named `Album` to the Song table. It should hold text up to 60 characters, and it should appear right after the `Artist` column.

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

- **8.3**\
  **Uses:** Song *(from 8.1)*

  > **ⓘ Note:** You **change** the Genre column of the Song table from 8.1.

  Change the `Genre` column so it can hold up to 30 characters instead of 20. **Make sure it still uses 'Pop' as the default.** Afterward, run `DESCRIBE Song` and check that Genre shows `varchar(30)` with the default `Pop`. It is easy to lose the default by mistake.

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

- **8.4**\
  **Uses:** Song *(from 8.1)*

  > **ⓘ Note:** You **rename** a column in the Song table from 8.1.

  Rename the `DurationSec` column to `Seconds`.
  - Try a plain rename first. It fails because of the CHECK you added in 8.1. Read the error. It gives the check's name, `Song_chk_1`.
  - Then do the rename so the rule still holds: `Seconds` must be greater than 0. Give the check the same name, `Song_chk_1`.
  - Run `SHOW CREATE TABLE Song` and check that the CHECK now uses `Seconds`.

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
  -- Without a CHECK on the column, RENAME COLUMN alone (or CHANGE DurationSec Seconds SMALLINT UNSIGNED) is enough.
  ```

  </details>
  <!-- /solution -->

- **8.5**\
  **Uses:** Song *(from 8.1)*

  > **ⓘ Note:** You **remove** a column from the Song table from 8.1.

  Remove the `Album` column. Then run `DESCRIBE Song` to see the table's columns. *(6 columns)*

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

- **8.6**\
  **Uses:** Song *(from 8.1)*\
  **Creates:** Playlist, PlaylistSong

  A playlist holds many songs, and a song can be on many playlists. You'll build this with two new tables: **Playlist**, and a linking table **PlaylistSong** that connects playlists to the songs from 8.1.

  **a)** Create the **Playlist** table:
  - `ID`: a whole number from 0 to 255 that MySQL fills in automatically (auto-increment). It is the primary key.
  - `Name`: text up to 40 characters. It is required (cannot be NULL).
  - `Created`: a date. It is required.

  **b)** Create the **PlaylistSong** table. Each row puts one song on one playlist:
  - `PlaylistID`: the same type as Playlist's `ID`. It is required. It is a **foreign key** to Playlist's `ID`.
  - `SongID`: the same type as Song's `ID`. It is required. It is a **foreign key** to Song's `ID`.
  - `Position`: the song's place in the playlist (1, 2, 3, …), a small whole number from 0 to 255. It is required.

  The primary key is **PlaylistID and SongID together** (a composite primary key), so the same song can't be on the same playlist twice.

  Each foreign key needs a delete rule:
  - If a **playlist** is deleted, its rows in PlaylistSong are deleted too.
  - If a **song** is deleted, its rows in PlaylistSong are deleted too.

  **c)** Add this playlist to **Playlist**:

  | ID | Name | Created |
  |---|---|---|
  | *(leave out)* | Road Trip | 2026-10-01 |

  Then put both songs from 8.1 on it by adding these rows to **PlaylistSong**:

  | PlaylistID | SongID | Position |
  |---|---|---|
  | 1 | 1 | 1 |
  | 1 | 2 | 2 |

  **d)** Show the playlist's songs with three columns: the playlist's Name, the Position, and the song's Title. Sort by Position. *(2 rows)*

  <!-- solution:8.6 -->
  <details>
  <summary>Hint</summary>

  - Create Playlist first. A foreign key can only point to a table that already exists.
  - Write `PRIMARY KEY (PlaylistID, SongID)` on its own line. Then add one `FOREIGN KEY (...) REFERENCES ...` line for each foreign key, each ending with `ON DELETE CASCADE`.
  - For d), join three tables: Playlist to PlaylistSong on the playlist ID, and PlaylistSong to Song on the song ID.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
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
  ```

  </details>
  <!-- /solution -->

### Movie and Director

- **8.7**\
  **Uses:** Movie *(already in the database, from `setup.sql`)*\
  **Creates:** Director

  > **ⓘ Note:** You don't create Movie here. You **change** the existing Movie table by adding a DirectorID column that points to your new Director table.

  Each movie can have a director. You'll create a new **Director** table and link the existing **Movie** table (the one `setup.sql` built) to it.

  **a)** Create the **Director** table:
  - `ID`: a whole number from 0 to 65 thousand that MySQL fills in automatically (auto-increment). It is the primary key.
  - `Name`: text up to 50 characters. It is required (cannot be NULL).

  Then add these two directors:

  | ID | Name |
  |---|---|
  | *(leave out)* | Denis Villeneuve |
  | *(leave out)* | Christopher Nolan |

  **b)** Using **one** `ALTER TABLE` statement, make two changes to the **Movie** table:
  - Add a column named `DirectorID`: a whole number, the same type as Director's `ID`. It can be NULL, because most movies won't have a director yet.
  - Add a **foreign key** named `fk_movie_director` on DirectorID that points to Director's `ID`.

  **c)** Set the DirectorID of *Arrival* and *Dune* to Denis Villeneuve (ID 1), and of *Interstellar* to Christopher Nolan (ID 2).

  **d)** Show two columns for every movie that has a director: the movie's Title, and the director's Name with the column name `Director`. *(3 rows)*

  <!-- solution:8.7 -->
  <details>
  <summary>Hint</summary>

  - One ALTER TABLE can have several parts separated by commas: `ADD COLUMN ...` and `ADD CONSTRAINT name FOREIGN KEY ...`.
  - The new DirectorID column must have the same type as Director.ID.
  - For d), an inner join between Movie and Director keeps only the movies that have a director.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
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
  ```

  </details>
  <!-- /solution -->

### EmployeeArchive

- **8.8**\
  **Uses:** Employee *(already in the database, from `setup.sql`)*\
  **Creates:** EmployeeArchive

  *(Optional: goes beyond what the D427 practice tests ask.)* Create a table named **EmployeeArchive**:
  - `EmpID`: the same type as the Employee table's `EmpID` (run `DESCRIBE Employee;` to see it). It is the primary key. (Not auto-increment: you'll copy each employee's existing EmpID.)
  - `FullName`: text up to 70 characters. It is required.
  - `Salary`: a decimal number, DECIMAL(10,2), like the Employee table's Salary.
  - `ArchivedOn`: a date. It is required.

  Then fill it using **one** `INSERT … SELECT` statement that copies every employee in the Support department (DeptID 30):
  - EmpID and Salary come straight from Employee.
  - FullName is the first and last name joined with a space, like `Radia Perlman`.
  - ArchivedOn is today's date.

  *(3 rows)*

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
  ```

  </details>
  <!-- /solution -->

- **8.9**\
  **Uses:** EmployeeArchive *(from 8.8)*, Song *(from 8.1)*

  > **ⓘ Note:** You **rename** and then **drop** the EmployeeArchive table you made in 8.8.

  This exercise uses the EmployeeArchive table from 8.8. If you skipped 8.8, do its CREATE TABLE step first.
  - Rename the EmployeeArchive table to FormerEmployee. Run `SHOW TABLES` to check the new name.
  - Delete (drop) the FormerEmployee table.
  - Write a DROP statement that does not cause an error when the table is already gone. Run it to check.
  - Why would `DROP TABLE Song` fail right now?

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

- **9.1**\
  **Uses:** LessonSchedule, Horse, Student *(already in the database, from `setup.sql`)*\
  **Creates:** view LessonDetail

  Create a view named **LessonDetail** with these four columns, in this order:
  - `LessonDateTime` from LessonSchedule
  - `Horse`: the horse's RegisteredName
  - `FirstName` and `LastName`: the student's first and last name

  The view must include every lesson, even a lesson that has no student assigned. Then select from the view to find the lessons that have no student. *(2 rows)*

  <!-- solution:9.1 -->
  <details>
  <summary>Hint</summary>

  - `CREATE VIEW name AS SELECT ...`. The SELECT needs a LEFT JOIN to Student, like 5.9.
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

- **9.2**\
  **Uses:** view LessonDetail *(from 9.1)*, LessonSchedule *(from `setup.sql`)*

  > **ⓘ Note:** You **change** the LessonDetail view you made in 9.1. You don't make a new view.

  Use `ALTER VIEW` to change the LessonDetail view so it also shows each horse's **Breed**, right after the Horse column. Then do these steps:
  - Count the rows in LessonDetail.
  - Add this lesson to the **LessonSchedule table** (not to the view):

    | HorseID | StudentID | LessonDateTime |
    |---|---|---|
    | 1 | 1 | 2026-03-01 10:00:00 |

    Look for it in LessonDetail and count the rows again.
  - Delete that lesson from LessonSchedule, and count the rows in the view once more.
  - Finally, try `ALTER VIEW NoSuchView AS SELECT 1;` and read the error.

  You never changed the view itself. Why did its rows change when you changed the table? *(check: the view has 9 lessons, then 10, then 9)*

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

- **9.3**\
  **Uses:** Department, Employee *(already in the database, from `setup.sql`)*\
  **Creates:** view DeptSummary

  Create a view named **DeptSummary** with one row per department and these four columns:
  - `DeptID` and `DeptName` from Department
  - `Headcount`: the number of employees in the department
  - `AvgSalary`: the department's average salary, rounded to 2 decimal places

  The view must include every department, even one with no employees (its Headcount is 0). Then select from the view to show the departments that have 3 or more employees, sorted by AvgSalary from highest to lowest. *(3 rows)*

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

- **9.4**\
  **Uses:** view DeptSummary *(from 9.3)*

  > **ⓘ Note:** You **replace** the DeptSummary view you made in 9.3. You don't make a new view.

  Management wants DeptSummary to show only departments that **have** employees. Change the view with `CREATE OR REPLACE VIEW` this time, and keep the same four columns. Then select everything from it, sorted by DeptID. Legal should be gone. *(5 rows)*

  Then answer this: what's the difference between `CREATE OR REPLACE VIEW` and `ALTER VIEW`? When would you choose one over the other?

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

- **9.5**\
  **Uses:** Employee *(already in the database, from `setup.sql`)*\
  **Creates:** index idx_employee_lastname

  Work with an index on the Employee table:
  - Create an index named `idx_employee_lastname` on the LastName column.
  - Use `SHOW INDEX FROM Employee` to see it.
  - Use `EXPLAIN` on a search by last name, such as `WHERE LastName = 'Knuth'`. Check that MySQL uses your index.

  <!-- solution:9.5 -->
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

- **9.6**\
  **Uses:** Movie *(already in the database, from `setup.sql`)*\
  **Creates:** index idx_movie_genre_year

  *(Optional: goes beyond what the D427 practice tests ask.)* Create one index named `idx_movie_genre_year` that covers two columns of the Movie table: Genre first, then ReleaseYear (a composite index).
  - Use `EXPLAIN` on a query that filters on both columns, such as the Titles of Sci-Fi movies released in 2015 or later.
  - Would a query that filters **only** on ReleaseYear be able to use this index well? Why or why not?

  <!-- solution:9.6 -->
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

- **9.7**\
  **Uses:** Movie *(from `setup.sql`)*, index idx_movie_genre_year *(from 9.6)*

  > **ⓘ Note:** You **drop** the index you made in 9.6. The Movie table itself stays.

  Delete (drop) the `idx_movie_genre_year` index you made in 9.6. Run `SHOW INDEX FROM Movie` to check that it's gone.

  <!-- solution:9.7 -->
  <details>
  <summary>Hint</summary>

  - `DROP INDEX name ON Movie;`

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  DROP INDEX idx_movie_genre_year ON Movie;
  SHOW INDEX FROM Movie;
  ```

  </details>
  <!-- /solution -->

---

## 10. From design to tables

- **10.1**\
  **Creates:** Customer, Product, an orders table, and an order-lines table *(you choose the names for the last two)*

  Create tables for this design:
  - A **Customer** has a name and an email. The email is required, and no two customers can have the same email.
  - A customer can place many **Orders**. Each order has an order date.
  - An order can contain many **Products**, and a product can appear on many orders. Each product has a name and a unit price. The unit price must be 0 or more.
  - Each time a product appears on an order, it has a quantity. The quantity must be greater than 0.

  Use these column types:
  - Customer name and product name: text up to 50 characters, required
  - Email: text up to 60 characters
  - Order date: a date, required
  - Unit price: DECIMAL(8,2), required
  - Quantity: a whole number from 1 to 255, required
  - Customer IDs: whole numbers from 0 to 16 million, auto-increment
  - Product IDs: whole numbers from 0 to 65 thousand, auto-increment
  - Order IDs: whole numbers from 0 to 4 billion, auto-increment
  - A foreign key column has the same type as the ID it points to.

  You decide the primary keys, the foreign keys, and what should happen when a row is deleted. Don't name a table `Order`: ORDER is a reserved word in SQL. The solution names the tables Customer, Product, CustOrder, and OrderLine.

  Then add this data. The column names below are the ones the solution uses. Use your own if you named your columns differently.

  One customer:

  | CustomerID | Name | Email |
  |---|---|---|
  | *(leave out)* | Pat Lee | pat@example.com |

  Two products:

  | ProductID | Name | UnitPrice |
  |---|---|---|
  | *(leave out)* | Widget | 2.50 |
  | *(leave out)* | Gadget | 10.00 |

  One order for Pat Lee (CustomerID 1):

  | OrderID | CustomerID | OrderDate |
  |---|---|---|
  | *(leave out)* | 1 | 2026-10-01 |

  Both products on that order (OrderID 1). Widget is ProductID 1 and Gadget is ProductID 2:

  | OrderID | ProductID | Quantity |
  |---|---|---|
  | 1 | 1 | 4 |
  | 1 | 2 | 1 |

  Finally, write a query that shows three columns: the OrderID, the customer's Name, and the order's total cost as `OrderTotal` (each Quantity times its product's UnitPrice, added up). *(1 row: OrderTotal 20.00)*

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
  ```

  </details>
  <!-- /solution -->

- **10.2**\
  **Creates:** NF_Student, NF_Instructor, NF_Course, NF_Enrollment

  Here is a table that is not normalized:

  `Enrollment(StudentID, StudentName, CourseID, CourseTitle, InstructorID, InstructorName, InstructorOffice, Grade)`

  Its primary key is StudentID and CourseID together. Each course has exactly one instructor, and a student gets one Grade per course. Split it into tables that are in third normal form (3NF), and create those tables. Start each table's name with `NF_` (for example, `NF_Student`). Use these column types:
  - StudentID: a whole number from 0 to 16 million
  - InstructorID: a whole number from 0 to 65 thousand
  - CourseID: a 6-character code, like `D427`
  - StudentName and InstructorName: text up to 50 characters, required
  - CourseTitle: text up to 60 characters, required
  - InstructorOffice: text up to 10 characters
  - Grade: 2 characters, like `A-`

  Give every new table a primary key, and add a foreign key wherever one table refers to another. Also list the partial dependencies and the transitive dependencies that you removed. *(4 tables)*

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
  ```

  </details>
  <!-- /solution -->

---

[← Exercise index](exercises.md)
