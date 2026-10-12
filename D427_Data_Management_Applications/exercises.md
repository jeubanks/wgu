# D427 Data Management – Applications: MySQL Practice

This file has 85 hands-on exercises that cover the D427 topics: writing queries, using built-in functions, grouping and totals, joins, subqueries, changing data, creating and changing tables, constraints, views, indexes, and turning a database design into tables. The last section is a mock assessment. It uses the same kind of tables as the lab questions on the real assessment (Horse, Student, and LessonSchedule).

The files in this folder:

| File | What it is |
|---|---|
| `setup.sql` | Creates a database named `d427` and fills it with sample data. You can run it again at any time to reset everything back to the start. |
| `exercises.md` | This file. Most exercises tell you how many rows your answer should return, so you can check your own work. |
| `solutions.sql` | One worked answer for each exercise. Each answer is labeled with its number, like `-- [1.1]`. Many answers include notes about common mistakes. |

## Getting started

See `README.md` for how to set up the container and load the data. After you are connected to MySQL, you can reset the database at any time by running this command inside the MySQL client:

```sql
SOURCE /work/setup.sql;
```

**Do the sections in order.** Sections 1 to 6 only read data, so they never change anything. Sections 7 to 10 change the data and the tables, and later exercises expect that you already did the earlier ones. Before you start Section 11, run `setup.sql` again so you begin with fresh data.

### How to read each exercise

The note in parentheses at the end of an exercise tells you how many rows your query should return. For example, *(12 rows)* means your result should have 12 rows. If you get a different number, look at your query again before you check the solution.

Some exercises change data instead of returning rows. For those, the note in parentheses tells you what to check afterward.

## The tables

Here is a short summary of every table in the database. These short labels are used below:

- **PK** = primary key (the column or columns that uniquely identify each row)
- **AI** = auto-increment (MySQL fills in the next number for you)
- **FK** = foreign key (the column points to a row in another table)
- **UNIQUE** = no two rows can have the same value
- **CHECK** = a rule the value must follow
- **DEFAULT** = the value used when you don't give one

```
Department(DeptID PK, DeptName UNIQUE, Budget, Location)
Employee(EmpID PK AI, FirstName, LastName, Email UNIQUE, Salary, HireDate,
         DeptID FK->Department ON DELETE SET NULL, ManagerID FK->Employee)

Horse(ID PK AI, RegisteredName, Breed CHECK, Height CHECK, BirthDate CHECK)
Student(ID PK AI, FirstName, LastName, Street, City, State DEFAULT 'TX', Zip, Phone, Email UNIQUE)
LessonSchedule(HorseID FK->Horse ON DELETE CASCADE,
               StudentID FK->Student ON DELETE SET NULL,
               LessonDateTime,  PK(HorseID, LessonDateTime))

Rating(RatingCode PK, RatingDescription)
Movie(ID PK AI, Title, Genre, RatingCode FK->Rating, ReleaseYear, Minutes, Gross)
```

The sample data includes some unusual rows on purpose:

- an employee who is not in any department
- a department that has no employees
- a movie that has only an ID and a Title (every other column is NULL)
- a rating that no movie uses
- a horse that has no lessons
- a student who has no lessons
- a lesson time that has no student assigned

Many exercises are built around these rows, because these are the cases where SQL queries most often give the wrong answer.

---

## 1. SELECT basics

- **1.1** Show all columns for every movie in the Movie table. *(12 rows)*
- **1.2** Show the Title and ReleaseYear of every movie. Sort the list so the newest movie is first. If two movies came out in the same year, sort those movies by Title from A to Z. One movie has no release year (NULL). Where does it show up in your list? *(12 rows)*
- **1.3** Show each Genre from the Movie table only once, with no repeats. *(5 rows)*
- **1.4** Show the FirstName, LastName, and Salary of every employee who earns more than 150,000. *(4 rows)*
- **1.5** Show the Title and Gross of the three movies that earned the most money (the highest Gross). *(3 rows)*
- **1.6** For every employee, show two columns:
  - `FullName`: the first name and last name joined together with a space between them, in one column.
  - `MonthlyPay`: the yearly Salary divided by 12, rounded to 2 decimal places.

  Sort the list so the highest monthly pay is first. *(15 rows)*

## 2. Filtering

- **2.1** Show the movies that came out in 2014, 2015, or 2016. Use `BETWEEN` to do this. *(6 rows)*
- **2.2** Show the movies that are rated G or PG. Use `IN` to do this. *(4 rows)*
- **2.3** Show the movies whose title starts with the word "The" (for example, "The Matrix"). *(3 rows)*
- **2.4** Show the students whose last name has the letter "a" as its **second** letter (for example, "Garcia"). *(3 rows)*
- **2.5** Show the employees who do not have an email address (their Email is NULL). *(2 rows)*
- **2.6** Show the horses whose breed is **not** Quarter Horse. Include horses whose breed is unknown (NULL).
  - First, write the query without doing anything special for NULL. Count the rows.
  - Then fix the query so the horse with an unknown breed is included. Compare the two results. *(8 rows)*
- **2.7** Show the students who live in Austin or in Round Rock **and** who have a phone number.
  - After it works, remove the parentheses from your WHERE clause and run it again.
  - Explain why the result is different. *(4 rows)*

## 3. Built-in functions

- **3.1** For every student, show their last name in all capital letters, and the number of letters in their first name. *(8 rows)*
- **3.2** For every employee, show how many full years they have worked here as of 2026-10-01. Use `TIMESTAMPDIFF` to do this. Sort the list so the employee who has worked here the longest is first. *(15 rows)*
- **3.3** For every lesson in LessonSchedule, show:
  - the HorseID
  - only the date part of LessonDateTime
  - only the time part of LessonDateTime
  - the name of the day of the week (for example, "Monday")

  Sort the lessons from earliest to latest. *(12 rows)*
- **3.4** For every movie, show the Title, the Minutes, and a new column named `LengthClass`. Fill in `LengthClass` using these rules:
  - "Short" if the movie is less than 100 minutes
  - "Standard" if the movie is 100 to 139 minutes
  - "Long" if the movie is 140 minutes or more
  - "Unknown" if Minutes is NULL

  *(12 rows)*
- **3.5** For every movie, show the Title and the Genre. If the Genre is NULL, show the word "Unclassified" instead. *(12 rows)*
- **3.6** For every movie, show the Title and the Gross in millions of dollars, rounded to one decimal place. For example, 108,327,830 should show as 108.3. Leave out movies with no Gross (NULL). Sort the list so the largest amount is first. *(11 rows)*
- **3.7** For every student who has a phone number, show the phone number in this format: `(512) 555-0101`. The Phone column stores only the 10 digits, with no spaces or symbols. Leave out students who have no phone number. *(6 rows)*

## 4. Aggregates, GROUP BY, HAVING

- **4.1** Write one query that returns one row with two numbers:
  - the total number of movies
  - the number of movies that have a rating (RatingCode is not NULL)

  Why are the two numbers different? *(1 row)*
- **4.2** Write one query that returns one row with these four numbers for all employees: the average salary (rounded to 2 decimal places), the lowest salary, the highest salary, and the total of all salaries. *(1 row)*
- **4.3** Show how many employees are in each DeptID. What happens to the employee who has no department? *(6 rows)*
- **4.4** For each genre, show the total Gross of all its movies. Sort the list so the largest total is first. Leave out movies whose genre is NULL. *(4 rows)*
- **4.5** Show each DeptID where the average salary is more than 120,000. *(3 rows)*
- **4.6** Show each HorseID that has two or more lessons scheduled. *(3 rows)*
- **4.7** Show how many students live in each combination of State and City. Sort the list by State, then by City. *(5 rows)*

## 5. Joins

- **5.1** Show each employee's first name and last name next to the name of their department. Use an inner join. One employee is missing from the result. Who is it, and why are they missing? *(14 rows)*
- **5.2** Show each movie's Title next to its RatingDescription from the Rating table. Include movies that have no rating. *(12 rows)*
- **5.3** Show every department name and how many employees work in it. **Include departments that have no employees.** Make sure the Legal department shows 0, not 1. *(6 rows)*
- **5.4** Show the ratings that no movie uses. Do this with a `LEFT JOIN` and an `IS NULL` check. *(1 row)*
- **5.5** Show the lesson schedule with these columns: LessonDateTime, the horse's RegisteredName, and the student's FirstName and LastName. Sort the list by date and time, then by horse name. Only include lessons that have a student assigned. *(11 rows)*
- **5.6** Do the same as 5.5, but this time also include the lesson that has no student assigned. *(12 rows)*
- **5.7** Show every employee's full name next to their manager's full name. The manager is also in the Employee table, so you will need to join the Employee table to itself (a self-join). Include employees who do not have a manager. *(15 rows)*
- **5.8** Show the employees whose manager works in a **different** department than they do. Show four columns: the employee's name, the employee's department, the manager's name, and the manager's department. *(2 rows)*
- **5.9** Write exercise 5.3 again, but use a `RIGHT JOIN` this time. You should get the same result. *(6 rows)*
- **5.10** Show the horses that have no lessons scheduled. *(1 row)*
- **5.11** If every horse could be paired with every student, how many pairs would there be? Use a `CROSS JOIN` to find out. *(1 row: 80)*
- **5.12** MySQL does not support `FULL OUTER JOIN`. Write a query that gives the same result as a full outer join between Employee and Department. Your result must include both Hedy Lamarr (who has no department) and Legal (which has no employees). Hint: combine two queries with `UNION`. *(16 rows)*

## 6. Subqueries

- **6.1** Show the employees who earn more than the average salary of all employees. *(7 rows)*
- **6.2** Show the movies that are longer than the average length of the Sci-Fi movies. *(4 rows)*
- **6.3** Show the students who have at least one lesson. Use `IN` with a subquery. *(7 rows)*
- **6.4** Show the students who have **no** lessons. Use `NOT IN` with a subquery.
  - Your first try will return zero rows. Work out why. (Hint: one lesson has no student.)
  - Then fix it in two different ways. One of the ways should use `NOT EXISTS`. *(1 row)*
- **6.5** Show the employees who earn more than the average salary **of their own department**. This needs a correlated subquery, which is a subquery that uses a value from the outer query. *(5 rows)*
- **6.6** For each department, show the employee who earns the most money, along with the department name. *(5 rows)*
- **6.7** Each department has a total payroll (the sum of the salaries of everyone in it). Show the DeptIDs whose total payroll is higher than the average total payroll of all departments. Use a subquery in the FROM clause (a derived table) to do this. *(2 rows)*
- **6.8** Show the names of the departments that have at least one employee who was hired after 2020-01-01. Use `EXISTS` to do this. *(3 rows)*

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
- **8.4** Rename the `DurationSec` column to `Seconds`.
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

## 11. Mock assessment

**Run `setup.sql` again before you start this section.** Try to answer these questions without looking at the solutions. Give yourself about 60 minutes.

- **11.1** Create a table named **Instructor** with these columns:
  - `ID`: a small, unsigned whole number (SMALLINT UNSIGNED) that MySQL fills in automatically. It is the primary key.
  - `FirstName`: text up to 20 characters. It is required.
  - `LastName`: text up to 30 characters. It is required.
  - `HireDate`: a date. It is required.
  - `Rate`: a decimal number, DECIMAL(5,2). It is required. If no rate is given, it should be 45.00. It must be between 20 and 150.
- **11.2** Add a column named `InstructorID` to the LessonSchedule table, with a foreign key that points to the Instructor table. If an instructor is deleted, their lessons should stay in the table, but with no instructor (NULL).
- **11.3** Add these three instructors:
  - Dale Evans, hired 2020-04-01, using the default rate
  - Roy Rogers, hired 2022-09-15, using the default rate
  - Annie Oakley, hired 2024-06-03, with a rate of 60.00
- **11.4** Assign instructors to lessons:
  - Dale teaches every lesson on horses 1, 2, and 3.
  - Roy teaches every lesson on horses 4, 5, and 6.
  - Annie teaches every lesson that still has no instructor.

  Then show how many lessons each instructor has. *(3 rows)*
- **11.5** Show every lesson with these columns: the date and time, the horse's name, the student's full name, and the instructor's full name. If a lesson has no student, the student name should be NULL. Sort the lessons from earliest to latest. *(12 rows)*
- **11.6** For each instructor, show their full name, how many lessons they teach, and how much they earn (the number of lessons multiplied by their rate). Sort the list so the instructor who earns the most is first. If two instructors earn the same amount, sort them by name. *(3 rows)*
- **11.7** For each breed that has more than one horse, show the breed, the number of horses, and the average height (rounded to 2 decimal places). Leave out horses whose breed is unknown (NULL). Sort the list so the breed with the tallest average height is first. *(4 rows)*
- **11.8** Show the horses that are taller than the average height of all horses. Sort the list so the tallest horse is first. *(4 rows)*
- **11.9** Create a view named **AustinStudentLessons** with the columns FirstName, LastName, LessonDateTime, and RegisteredName. The view should show only the lessons taken by students who live in Austin. Then select everything from the view, sorted from earliest to latest lesson. *(6 rows)*
- **11.10** Create an index that makes it faster to find all the lessons for a given student.
- **11.11** Some students have no email address. For each of them, set their email to their first name, a period, their last name, and then `@stable.example`, all in lowercase. For example, a student named Maria Lopez would get `maria.lopez@stable.example`. *(check: 1 row changed)*
- **11.12** Delete every horse that has no lessons scheduled. Then show how many horses are left. *(1 row: 9)*
