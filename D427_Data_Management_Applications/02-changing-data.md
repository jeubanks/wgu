# Part 2: Changing data and tables

[← Exercise index](exercises.md) · Solutions: [`solutions.sql`](solutions.sql)

These sections change the data and the tables. Do them in order: later exercises expect the earlier ones to be done. To start over, run `SOURCE /work/setup.sql;`.

**In this part:** [7. Modifying data](#7-modifying-data) · [8. CREATE / ALTER / DROP](#8-create--alter--drop) · [9. Views and indexes](#9-views-and-indexes) · [10. From design to tables](#10-from-design-to-tables)

## 7. Modifying data

- **7.1** Add the movie *Dune* to the Movie table with these values: Genre Sci-Fi, rating PG-13, released in 2021, 155 minutes long, and Gross 108327830. Do not give it an ID. Let MySQL choose the ID. What ID did MySQL give it? *(check: 1 new row)*

- **7.2** Add two students using a single INSERT statement:
  - Ava Nguyen, who lives in Austin, with the email ava@example.com
  - Ethan Brooks, who lives in Georgetown, with the email ethan@example.com

  Do not give a value for State. After the insert, look at the two new rows. What State did they get, and why? *(check: 2 new rows)*

- **7.3** Give everyone in the Support department a 5% raise. In your WHERE clause, find the department by its **name** ("Support"). Do not type the DeptID number 30 directly. *(check: 3 rows changed)*

- **7.4** For any movie whose Genre is NULL, set the Genre to 'Indie' and the ReleaseYear to 2026. *(check: 1 row changed)*

- **7.5** Delete all lessons that are scheduled before 2026-02-02. *(check: 10 lessons should be left)*

- **7.6** This exercise shows what a foreign key does when you delete a row:
  - Count how many lessons the horse Midnight (ID 9) has.
  - Delete the horse Midnight.
  - Count Midnight's lessons again.

  What happened to the lessons? Which foreign key action caused this? *(check: 1 lesson before, 0 after)*

- **7.7** Delete the student Jamal Carter (ID 2). Then look at the LessonSchedule table. What happened to his lesson? Which foreign key action caused this? *(check: 2 lessons should now have a NULL StudentID)*

- **7.8** This exercise shows how a transaction can undo changes:
  - Start a transaction.
  - Delete all movies rated R.
  - Count the movies.
  - Run `ROLLBACK`.
  - Count the movies again.

  *(check: 10 movies during the transaction, 13 after the rollback)*

- **7.9** Both of these statements will fail. Run each one and read the error message:
  - Try to delete the 'PG' rating from the Rating table.
  - Try to add a movie with the RatingCode 'XX' (a rating that does not exist).

  Which constraint stops each one? What error number does MySQL show for each one?

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

- **8.2** Add a new column named `Album` to the Song table. It should hold text up to 60 characters, and it should appear right after the `Artist` column.

- **8.3** Change the `Genre` column so it can hold up to 30 characters instead of 20. **Make sure it still uses 'Pop' as the default.** (Check this afterward. It is easy to lose the default by mistake.)

- **8.4** Rename the `DurationSec` column to `Seconds`. Your first try will fail because of the CHECK you added in 8.1. Read the error. Then do the rename in a way that keeps the rule that the value must be greater than 0. (Hint: `SHOW CREATE TABLE Song;` shows the name MySQL gave the check.)

- **8.5** Remove the `Album` column. Then run `DESCRIBE Song` to see the table's columns. *(6 columns)*

- **8.6** Create two new tables:
  - **Playlist**, with the columns ID, Name, and Created (a date).
  - **PlaylistSong**, which connects playlists to songs. It has the columns PlaylistID, SongID, and Position (the song's place in the playlist). Its primary key is made of both PlaylistID and SongID together (a composite primary key).

  If a playlist is deleted, its rows in PlaylistSong should be deleted too. If a song is deleted, its rows in PlaylistSong should also be deleted. After you create the tables, add one playlist that has both songs in it. Then show the songs in the playlist in order by Position. *(2 rows)*

- **8.7** Create a table named **EmployeeArchive** with the columns EmpID (the primary key), FullName, Salary, and ArchivedOn (a date). Then fill it using **one** `INSERT … SELECT` statement that copies every employee in the Support department. Use today's date for ArchivedOn. *(3 rows)*

- **8.8** This exercise adds a new table and connects it to Movie:
  - Create a table named **Director** with the columns ID and Name.
  - Add two directors: Denis Villeneuve and Christopher Nolan.
  - Using **one** `ALTER TABLE` statement, add a `DirectorID` column to the Movie table, and also add a foreign key on that column that points to Director. Give the foreign key a name.
  - Set the director of *Arrival* and *Dune* to Villeneuve, and the director of *Interstellar* to Nolan.
  - Show each of these movies' titles next to its director's name.

  *(3 rows)*

- **8.9** Rename the EmployeeArchive table to FormerEmployee. Then delete (drop) the FormerEmployee table. Write the DROP statement so that it does not cause an error if you run it a second time. Also answer this: why would `DROP TABLE Song` fail right now?

---

## 9. Views and indexes

- **9.1** Create a view named **LessonDetail** with the columns LessonDateTime, Horse (the horse's RegisteredName), FirstName, and LastName. The view must include lesson times that have no student assigned. Then use the view to find the lessons that have no student. *(2 rows)*

- **9.2** Create a view named **DeptSummary** with the columns DeptID, DeptName, Headcount (the number of employees), and AvgSalary. The view must include every department, even one with no employees. Then use the view to show the departments that have 3 or more employees. *(3 rows)*

- **9.3** This exercise shows how `WITH CHECK OPTION` protects a view:
  - Create a view named **SupportStaff** that shows only the employees in DeptID 30. Add `WITH CHECK OPTION` to the view.
  - Through the view, give employee 12 (EmpID 12) a raise of 1,000.
  - Then, through the view, try to move employee 12 to DeptID 20. Read the error message.
  - Finally, answer this: can you UPDATE rows through the DeptSummary view from 9.2? Why or why not?

- **9.4** Create an index on the LastName column of the Employee table. Use `SHOW INDEX` to see the index. Then use `EXPLAIN` to check that a search by last name uses your index.

- **9.5** Create one index that covers two columns of the Movie table: Genre and ReleaseYear, in that order (a composite index). Use `EXPLAIN` on a query that filters on both columns. Then answer this: would a query that filters **only** on ReleaseYear be able to use this index well? Why or why not?

- **9.6** Delete (drop) the index you made in 9.5 and the SupportStaff view.

---

## 10. From design to tables

- **10.1** Create tables for this design:
  - A **Customer** has a name and an email. The email is required, and no two customers can have the same email.
  - A customer can place many **Orders**. Each order has an order date.
  - An order can contain many **Products**, and a product can appear on many orders. Each product has a name and a unit price. The unit price must be 0 or more.
  - Each time a product appears on an order, it has a quantity. The quantity must be greater than 0.

  You decide the primary keys, the foreign keys, and what should happen when a row is deleted. Then add one customer, two products, and one order that has both products on it. Finally, write a query that calculates the total cost of the order. *(1 row: 20.00)*

- **10.2** Here is a table that is not normalized:

  `Enrollment(StudentID, StudentName, CourseID, CourseTitle, InstructorID, InstructorName, InstructorOffice, Grade)`

  Its primary key is StudentID and CourseID together. Split it into tables that are in third normal form (3NF), and create those tables. Start each table's name with `NF_` (for example, `NF_Student`). Also list the partial dependencies and the transitive dependencies that you removed. *(4 tables)*

---

[← Exercise index](exercises.md)
