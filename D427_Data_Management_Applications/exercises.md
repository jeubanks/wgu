# D427 Data Management – Applications: MySQL Practice

This file has 136 exercises that cover the D427 topics: writing queries, using built-in functions, grouping and totals, joins, subqueries, changing data, creating and changing tables, constraints, views, indexes, and turning a database design into tables.

Sections 11 to 13 are built from the D427 practice tests and the D427 Challenge. Section 11 has you write tables from the assessment's column descriptions, Section 12 drills the assessment's query wording, and Section 13 is a multiple-choice concepts check. The last section is a mock assessment. It uses the same kind of tables as the lab questions on the real assessment (Horse, Student, and LessonSchedule).

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

**Do Sections 1 to 10 in order.** Sections 1 to 6 only read data, so they never change anything. Sections 7 to 10 change the data and the tables, and later exercises expect that you already did the earlier ones.

Sections 11 to 13 don't depend on Sections 1 to 10, so you can do them at any time:

- Section 11 builds its own tables in a separate database named `d427_drills`.
- Section 12 uses its own tables in `d427`, which no other section changes.
- Section 13 needs no SQL at all.

Before you start Section 14, run `setup.sql` again so you begin with fresh data.

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

Section 12 also uses six smaller tables (Book, YearSales, Passport, Visa, Compensation, and student_grades). They are described at the start of that section.

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

## 11. Writing tables from a specification

On the assessment, the table-building questions describe each column in words, like *"integer with range 0 to 65 thousand, auto increment, primary key"*. You have to turn that wording into the right data type and constraints. This section practices exactly that.

These exercises use the same table names as the assessment (Horse, Student, Customer, and so on), so they run in a separate database to keep them away from the `d427` tables. Start the section with:

```sql
DROP DATABASE IF EXISTS d427_drills;
CREATE DATABASE d427_drills;
USE d427_drills;
```

Run `USE d427;` when you finish the section. You can redo the section at any time by running the three lines above again.

Every exercise here also includes a statement that **should fail**. Run it, read the error, and make sure you understand which rule stopped it.

- **11.1** Create the **Horse** table:
  - ID — integer with range 0 to 65 thousand, auto increment, primary key
  - RegisteredName — variable-length string with max 15 chars, not NULL
  - Breed — variable-length string with max 20 chars, must be one of the following: Egyptian Arab, Holsteiner, Quarter Horse, Paint, Saddlebred
  - Height — number with 3 significant digits and 1 decimal place, must be ≥ 10.0 and ≤ 20.0
  - BirthDate — date, must be ≥ Jan 1, 2015

  Add the horse Babe (Quarter Horse, height 15.3, born 2015-02-10) without giving an ID. Then try to add a horse named Goliath (Paint, height 21.0, born 2018-01-01), which should fail. Finally, compare your table with the one `setup.sql` built by running `SHOW CREATE TABLE d427.Horse;`. *(1 row)*
- **11.2** Create the **Student** table:
  - ID — integer with range 0 to 65 thousand, auto increment, primary key
  - FirstName — variable-length string with max 20 chars, not NULL
  - LastName — variable-length string with max 30 chars, not NULL
  - Street — variable-length string with max 50 chars, not NULL
  - City — variable-length string with max 20 chars, not NULL
  - State — fixed-length string of 2 chars, not NULL, default "TX"
  - Zip — integer with range 0 to 16 million, not NULL
  - Phone — fixed-length string of 10 chars, not NULL
  - Email — variable-length string with max 30 chars, must be unique

  Add the student Rosie Hewitt, 1 Main St, Austin, zip 78701, phone 5125550101, email rosie@example.com. Do not give a State. What State did she get? *(1 row)*
- **11.3** Create the **LessonSchedule** table:
  - HorseID — integer with range 0 to 65 thousand, not NULL, foreign key references Horse(ID)
  - StudentID — integer with range 0 to 65 thousand, foreign key references Student(ID)
  - LessonDateTime — date/time, not NULL
  - The primary key is (HorseID, LessonDateTime).
  - If a row is deleted from Horse, the rows with the same horse ID should be deleted from LessonSchedule automatically.
  - If a row is deleted from Student, the same student IDs should be set to NULL in LessonSchedule automatically.

  Then answer: why must StudentID allow NULL? Try declaring it `NOT NULL` and read the error.
- **11.4** Test the two foreign key rules from 11.3:
  - Add two lessons for Babe (horse 1) and Rosie (student 1): one at 2026-03-01 09:00 and one at 2026-03-02 09:00.
  - Delete Rosie from Student. Look at LessonSchedule.
  - Delete Babe from Horse. Count the lessons.

  *(check: 2 lessons with a NULL StudentID after the first delete, 0 lessons after the second)*
- **11.5** Create the **Customer** table. Do not add any constraints beyond what is stated.
  - CustomerID — positive integer
  - FirstName — variable-length string with up to 50 characters
  - MiddleInitial — fixed-length string with 1 character
  - LastName — variable-length string with up to 50 characters
  - DateOfBirth — date
  - CreditLimit — positive decimal value representing a cost of up to $19,999.99, with 2 digits for cents

  Use `DESCRIBE Customer;` to check your work. *(6 columns)*
- **11.6** Create the **Country** table:
  - ID — primary key, auto increment, integer ranging from 0 to 255
  - CountryName — variable-length string with max 100 characters
  - Continent — variable-length string with max 50 characters; must be one of: 'Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania', 'Antarctica'
  - PopulationMillions — decimal number with 5 digits total and 1 decimal place; must be between 0.1 and 9999.9
  - IndependenceDate — date; must be on or after Jan 1, 1800

  Add these three countries. Canada's population has no value.

  | CountryName | Continent | PopulationMillions | IndependenceDate |
  |---|---|---|---|
  | Canada | North America | *(no value)* | 1867-07-01 |
  | Brazil | South America | 214.3 | 1822-09-07 |
  | Germany | Europe | 83.2 | 1871-01-18 |

  Then try to add a country named Atlantis on the continent 'Atlantic', which should fail. Why did Canada's missing population **not** break the BETWEEN check? *(3 rows)*
- **11.7** The **Genre** table has these columns:
  - GenreCode — variable-length string with max 5 characters, primary key
  - GenreDescription — variable-length string with max 40 characters

  Create the Genre table. Then create the **Book** table with these columns, and make GenreCode a foreign key to the GenreCode column in Genre:
  - Title — variable-length string, maximum 30 characters
  - GenreCode — variable-length string, maximum 5 characters

  Add the genre ('FIC', 'Fiction') and the book ('Beloved', 'FIC'). Then try to add the book ('Dune', 'SCI'), which should fail. *(1 row)*
- **11.8** Create the **Pet** table with no primary key:
  - PetID — integer
  - Name — variable-length string, max 30
  - Breed — variable-length string, max 30
  - Birthdate — date

  Add these pets: (1, Rex, Beagle, 2020-05-01), (2, Bella, Poodle, 2021-07-12), (2, Milo, Pug, 2022-02-20). Now write a statement that modifies the Pet table to make PetID the primary key. It fails. Why? Fix the data so Milo has PetID 3, then add the primary key. *(check: `DESCRIBE Pet` shows PRI on PetID)*
- **11.9** Create these two tables exactly as described. Notice that breedID is **not** a primary key in Breed.
  - **Breed**: breedID — integer; breedDescription — variable-length string, max 40
  - **Dog**: dogID — integer, primary key; name — variable-length string, max 30; breedID — integer; birthdate — date

  Write a statement to make the breedID column in Dog a foreign key to the breedID column in Breed. It fails. Read the error, fix Breed, and try again. This time, give the foreign key the name `fk_dog_breed`.
- **11.10** Create the **Department** table: DeptID — integer, primary key; DeptName — variable-length string, max 50; ManagerID — integer. Add the departments (1, 'Sales', 2100) and (2, 'Legal', 1500).
  - Add a constraint named **MgrIDCheck** that makes sure ManagerID is always 2000 or above. It fails. Why?
  - Change Legal's ManagerID to 2500 and add the constraint again.
  - Try to add the department (3, 'Finance', 1999). It should fail.
  - Remove the MgrIDCheck constraint by name, then add Finance again.

  *(3 rows)*
- **11.11** Create the **Automobile** table: ID — integer, primary key; Make — variable-length string, max 30; Model — variable-length string, max 30; Year — integer. Then add two columns, each with its own ALTER TABLE statement:
  - SafetyRating — a positive number that is less than 80 with 1 decimal place
  - EngineSize — a positive decimal value less than or equal to 7.9 with one decimal place

  Add the car (1, 'Toyota', 'Camry', 2024, 79.9, 2.5). Then try to add (2, 'Honda', 'Civic', 2024, 80.0, 2.0), which should fail. If the data type already limits the size, why do you still need a CHECK? *(1 row)*
- **11.12** Create this table:

  ```sql
  CREATE TABLE Movie (
    MovieID      INT NOT NULL,
    MovieName    VARCHAR(25) NOT NULL,
    ReleaseDate  DATE
  );
  ```

  - Change the MovieName column so it can hold up to 50 characters. **Keep the name MovieName, and keep it NOT NULL.**
  - Then rename the column to CanadianMovieName, keeping VARCHAR(50) and NOT NULL.
  - Run `DESCRIBE Movie;`. Is the column still NOT NULL? (If not, you lost it in the first step. MODIFY and CHANGE replace the whole column definition.)
- **11.13** Create the **Patient** table: patient_id — integer, primary key; first_name — variable-length string, max 20; last_name — variable-length string, max 30; birthdate — date.

  Create the **Exam** table: exam_id — integer, auto increment, primary key; exam_date — date, not NULL; exam_reason — variable-length string with 250 characters; patient_id — integer, not NULL, foreign key to Patient. Name the foreign key `fk_exam_patient`. **A patient who still has exams must not be deletable.**

  Add patients (1, 'Ana', 'Silva', '1990-03-14') and (2, 'Ben', 'Okoro', '1985-11-02'), and one exam for patient 1 on 2026-09-30 for an 'Annual physical'. Then try to delete each patient. *(check: patient 1's delete fails; patient 2's delete works; 1 patient left)*
- **11.14** The clinic changes its rule: when a patient is deleted, their exams should stay, but with no patient (NULL). Change the Exam table to follow this new rule, then delete patient 1. There is no statement that edits a foreign key in place, so think about what you have to remove and add, and what has to change about the patient_id column first. *(check: 1 exam left, with a NULL patient_id)*
- **11.15** Add two more students:
  - Jamal Carter, 22 Oak Ave, Round Rock, zip 78664, phone 5125550102, email jamal@example.com
  - Priya Nair, 300 Elm Blvd, Austin, zip 78702, phone 5125550103, email priya@example.com

  Then:
  - Create a **unique index** named `idx_student_phone` on the Phone column.
  - Try to add a student with Jamal's phone number. It should fail.
  - Run `SHOW INDEX FROM Student;`. Which index did MySQL create for you because Email is UNIQUE?
  - Drop `idx_student_phone`.
- **11.16** Create a view named **StudentContact** with the columns FirstName, LastName, and Phone from Student. Then **change** the view with ALTER VIEW so it also includes Email. Select everything from the view, sorted by LastName. Finally, delete (drop) the view, and write the DROP statement so it does not cause an error if you run it a second time. *(2 rows, 4 columns)*

When you are done, run `USE d427;`.

## 12. Assessment-style queries

These exercises use the Book, YearSales, Passport, Visa, Compensation, and student_grades tables in `d427`. If `SHOW TABLES;` doesn't list them, your copy of the database is older than these exercises, so run `setup.sql` again.

```
YearSales(Year PK, TotalSales, Releases)
Book(ID PK AI, Title, Genre, Year, Cost)          -- Year is NOT a foreign key
Passport(PassportID PK, PassportHolderName, Nationality, IssueDate, ExpiryDate)
Visa(VisaID PK, PassportID FK->Passport, Country, VisaType, IssueDate, ExpiryDate)
Compensation(ID PK, Name, Salary, Bonus)
student_grades(studentID PK, lastName, grade)
```

The data has these unusual rows on purpose:

- a book with no genre ("No Data")
- two books whose Year has no row in YearSales
- a sales year that has no books
- two visas that are not assigned to any passport
- a passport that has no visas
- salaries and bonuses that are NULL

The wording in this section copies the assessment on purpose. Pay attention to phrases like **"if available"** and **"regardless of whether"**. They tell you which table is optional, so they decide which kind of join you need. When a question has neither phrase, the assessment expects an **inner join**, even if it says "for all books."

Exercises 12.1 to 12.19 only read data (12.15 creates a view). Exercises 12.20 to 12.22 change data, so do them last.

- **12.1** Write a query to return all data from the Book table without directly referencing any column names. *(13 rows)*
- **12.2** Write a query to retrieve the Title and Genre values for all records in the Book table with a Year value of 2018. Make sure your result returns the columns in the order given. *(4 rows)*
- **12.3** Write a query to display all Title values in alphabetical order A–Z. *(13 rows)*
- **12.4** Write a query to output the unique Genre values and the number of books with each genre value from the Book table as GenreCount. Sort the results by Genre in reverse alphabetical order (Z–A). Where does the book with no genre show up? *(6 rows)*
- **12.5** Write three separate queries:
  - a) How many books have a Year value of 2019? *(1 row: 2)*
  - b) What is the total of all costs in the Book table? *(1 row: 429.38)*
  - c) How much does the most expensive book cost? *(1 row: 125.00)*
- **12.6** Write a query to pull all data for books that cost more than the average cost. Then do the same for books that cost less than the average. Also try `WHERE Cost > AVG(Cost)` and read the error. Why doesn't it work? *(1 row, then 12 rows)*
- **12.7** Write a query to display both the TotalSales and the Title (if available) for all YearSales. Make sure your result returns the columns in the order given. *(12 rows)*
- **12.8** Write a query to display both the Title and the TotalSales for all books. Make sure your result returns the columns in the order given. *(11 rows)*
- **12.9** Write a query to display both the Title and TotalSales, regardless of whether they had any sales, for all books. *(13 rows)*
- **12.10** Write 12.7 again, but use a LEFT JOIN this time. You should get the same 12 rows. *(12 rows)*
- **12.11** Show the years in YearSales that have no books. *(1 row)*
- **12.12** Write a query to display all visas and the name of the passport holder (if available). Display the VisaID and the PassportHolderName. Order by VisaID. *(8 rows)*
- **12.13** Write a query to return the PassportHolderName and VisaType. Unassigned visas should not appear in the results. Sort the results by PassportHolderName. *(6 rows)*
- **12.14** Write a query to display each unique VisaType along with the number of visas issued under that type. *(3 rows)*
- **12.15** Write a statement to create a view called **Visas_2023** that retrieves all visas issued in the year 2023 from the Visa table. Then select everything from the view. Can you write the filter two different ways? *(4 rows)*
- **12.16** Show the passports that have no visas. *(1 row)*
- **12.17** The course guide asks you to know the difference between a **row subquery** and a **table subquery**.
  - a) Using a **row subquery**, show the Title, Genre, and Year of every book that has the same Genre **and** the same Year as 'Normal People'. Compare both columns at once. *(2 rows)*
  - b) Using a **table subquery**, show the Title and Year of every book published in a year that had more than 50 releases (from YearSales). *(4 rows)*
  - In your own words: what does each kind of subquery return, and how is that different from the scalar subquery you wrote in 12.6?
- **12.18** Using the student_grades table:
  - Write a query to count how many students have each grade (A, B, and C). Name the count gradeCount. *(3 rows)*
  - Add a clause to the query so it shows only the grades that have a count greater than 2. *(1 row)*
- **12.19** Look at the Compensation table. Before you run anything, predict which names each query returns:
  - `SELECT Name FROM Compensation WHERE Salary = Bonus;`
  - `SELECT Name FROM Compensation WHERE Salary <> Bonus;`

  Run them. There are 5 people, but the two results together contain only 2 names. Where did the other three go? *(1 row, then 1 row)*
- **12.20** Add 2000 to the bonus of every person with a salary less than 70000. Ravi Patel has no bonus yet (NULL). After your update, he should have a bonus of 2000, not NULL. *(check: 2 rows changed)*
- **12.21** Add the book Circe to the Book table: Genre "No Data", Year 2018, Cost 15.00. Do not give an ID. Then show the books that have no genre. *(2 rows)*
- **12.22** Write two UPDATE statements:
  - Add $1 (for charity) to the cost of any book that costs $50 or less.
  - Add $10 (for charity) to the cost of any book that costs more than $100.

  *(check: 13 rows changed, then 1 row changed; An Atlas of Rare Maps now costs 135.00)*

## 13. Concepts check

About half of the assessment is multiple choice. These questions cover the concepts the practice tests ask about. Write down your answers, then check them against the Section 13 answers in `solutions.sql`. You don't need to run any SQL for this section, but you can test any answer you're unsure of.

- **13.1** Label each statement as **DDL** (Data Definition Language) or **DML** (Data Manipulation Language): `CREATE TABLE`, `INSERT`, `ALTER TABLE`, `UPDATE`, `CREATE INDEX`, `DELETE`, `DROP VIEW`, `CREATE VIEW`, `TRUNCATE TABLE`, `SELECT`.
  - Which one statement modifies existing data in a table?
  - Which one statement makes every change to a table's structure?
  - Which describes the difference between them: (a) DDL defines structure, DML manages the data inside that structure; (b) DDL manipulates data, DML defines the schema; (c) they are the same thing?
- **13.2** Pick the best MySQL data type for each column:
  - a) Country names, like "Canada" or "Germany": TEXT, CHAR(60), VARCHAR(56), or CHAR(255)?
  - b) A two-letter state code, like "TX"
  - c) A price of up to $9,999.99
  - d) "integer ranging from 0 to 255"
  - e) "integer with range 0 to 65 thousand"
  - f) "integer with range 0 to 16 million"
  - g) A date of birth
  - h) The date and time a lesson starts
  - i) "number with 3 significant digits and 1 decimal place"
  - j) A 10-digit phone number stored with no symbols. Why is INT a bad choice here?
  - k) Which data type represents numbers with fractional values: Integer, Decimal, Character, or Binary?
- **13.3** Choosing keys:
  - The Book table has the columns genre VARCHAR(20), pages INT, author_id CHAR(3), and isbn_number VARCHAR(20). Which column should be the primary key, and which should be the foreign key?
  - The Exam table has exam_id, exam_date, exam_reason, and patient_id. Which column is the primary key, and which is the foreign key?
  - Why is a column like first_name or birthdate a poor primary key?
- **13.4** The Invoice table has `FOREIGN KEY (customer_id) REFERENCES Customer(customer_id)`. A customer who has invoices is deleted. What happens to that customer's invoices if the foreign key says:
  - a) `ON DELETE CASCADE`
  - b) `ON DELETE SET NULL`
  - c) `ON DELETE RESTRICT`
  - d) nothing at all (no ON DELETE clause)
  - e) One practice test writes `ON DELETE SET TO NULL`. What does MySQL do with that?
  - f) One practice test also declares `customer_id INT NOT NULL UNIQUE`. What does the UNIQUE say about how many invoices a customer can have?
- **13.5** Table A is joined with Table B. Which rows are **always** included in the result for each join below?
  - a) A INNER JOIN B
  - b) A LEFT JOIN B
  - c) A RIGHT JOIN B
  - d) A FULL OUTER JOIN B (and does MySQL support FULL OUTER JOIN directly?)
  - e) A CROSS JOIN B, when A has 5 rows and B has 4 rows. How many rows?
- **13.6** Here are two tables:

  ```
  Creator                                  Content
  creator_id | name                        content_id | creator_id | title
  -----------+--------------               -----------+------------+---------------------------
           1 | Alice Johnson                        1 |         10 | Understanding Databases
           2 | Bob Smith                            2 |         10 | Advanced SQL Tips
           3 | Carla Brown                          3 |          2 | Intro to Media Production
           4 | Dan White                            4 |          2 | The Role of Producers
           5 | Eva Green                            5 |          3 | How to Host a Podcast
  ```

  Which join, written as `FROM Creator ___ JOIN Content ON Creator.creator_id = Content.creator_id`, produces this result: FULL, RIGHT, LEFT, INNER, or CROSS?

  ```
  name          | title
  --------------+---------------------------
  Alice Johnson | NULL
  Bob Smith     | Intro to Media Production
  Bob Smith     | The Role of Producers
  Carla Brown   | How to Host a Podcast
  Dan White     | NULL
  Eva Green     | NULL
  ```

  How many rows would each of the other four joins return?
- **13.7** Which query performs an **outer join** of the Book table with a **different** table? For each wrong answer, say what's wrong with it.
  - a) `SELECT B.Title, A.Name FROM Book B, Author A WHERE B.AuthorID = A.ID;`
  - b) `SELECT B.Title, A.Name FROM Book B LEFT JOIN Book MB ON B.ID = MB.ID, Author A;`
  - c) `SELECT B.Title, A.Name FROM Book B RIGHT JOIN Author A ON B.AuthorID = A.ID;`
  - d) `SELECT B.Title, A.Name FROM Book B INNER JOIN Author A ON B.AuthorID = A.ID;`

  Then: which of these performs an **outer self-join** on the Employee table?
  - e) `SELECT E.LastName, M.LastName FROM Employee E LEFT JOIN Employee M ON E.ManagerID = M.EmpID;`
  - f) `SELECT E.LastName, M.LastName FROM Employee E INNER JOIN Employee M ON E.ManagerID = M.EmpID;`
  - g) `SELECT E.LastName, D.DeptName FROM Employee E LEFT JOIN Department D ON E.DeptID = D.DeptID;`
- **13.8** Fill in the blank with LEFT, RIGHT, or INNER:
  - a) "List all patients, regardless of whether they had an exam": `FROM Patient ___ JOIN Exam ON ...`
  - b) "List all model types, regardless of whether a model was assigned to that type": `FROM Models ___ JOIN Model_Type ON ...`
  - c) "Display the Title (if available) and TotalSales for all YearSales": `FROM Book ___ JOIN YearSales ON ...`
  - d) "List all model IDs, the model type they are assigned, and their hourly fees": `FROM Models ___ JOIN Model_Type ON ...`
- **13.9** Views:
  - Which **two** are true about a **materialized view**? (a) It is a base table. (b) It is stored. (c) It must be refreshed whenever its base tables change. (d) Its results are stored as a temporary table.
  - Is a regular (non-materialized) view's data stored on disk? What happens each time you select from it?
  - Does MySQL support materialized views?
  - Why can't you UPDATE rows through a view that uses GROUP BY?
- **13.10** Indexes. True or false?
  - a) An index on a column in Table B must be updated when a new row is added to Table B.
  - b) An index on Table B's LastName column must be updated when a different column in Table B is updated.
  - c) An index must be updated when another table is joined with Table B.
  - d) A **dense** index has an entry for every row in the table.
  - e) A **sparse** index has an entry for every row in the table.
  - f) Indexes make SELECT ... WHERE faster, but they make INSERT, UPDATE, and DELETE slower.
  - g) A **hash** index is good for equality searches (`=`) but not for range searches (`BETWEEN`, `<`).
  - h) A **bitmap** index works best on columns with many distinct values, like Email.
  - i) When a query returns most of the rows in a table, a full table scan can be faster than using an index.
  - j) In MySQL, `CREATE INDEX` is a DML statement.
- **13.11** Entity-relationship modeling:
  - a) "Children living within the boundaries of two school districts will be attending one of four different schools." How many entities are in this sentence? Name them.
  - b) "A person can have many skills." What is the cardinality of the relationship between Person and Skill? What extra fact would you need before you could be sure? How would you build a many-to-many relationship as tables?
  - c) "Each patient in a hospital is prescribed a unique treatment plan composed of medications sourced from various pharmaceutical companies. Doctors create each treatment plan." Which entity has a direct relationship with Patient: Treatment Plan, Pharmaceutical Company, Hospital, or Doctor?
  - d) Name the **degree** (unary, binary, or ternary) and the **cardinality** of each relationship:
    - An employee manages other employees.
    - A person is married to one other person, and both are in the Person table.
    - A course can be a prerequisite for other courses, and can have several prerequisites of its own.
    - A student enrolls in many courses, and a course has many students.
    - A supplier supplies a part to a project.
  - e) When an ER diagram becomes tables, what does each of these become: an entity, an attribute, a one-to-many relationship, a many-to-many relationship?
- **13.12** NULLs and aggregates:
  - a) What do `NULL = NULL`, `NULL <> 5`, and `5 + NULL` return?
  - b) A column has the values 10, NULL, and 20. What do COUNT(*), COUNT(column), SUM(column), and AVG(column) return?
  - c) Which aggregate function gives the number of rows that have a non-NULL value in a given column?
  - d) Why can't an aggregate function appear in a WHERE clause? What do you use instead?
- **13.13** Fill in the blank:
  - a) A(n) _____ is a query that is nested inside another query.
  - b) The _____ condition of a JOIN usually compares a foreign key with the primary key it references.
  - c) The _____ function combines two columns (or strings) into one.
  - d) The _____ keyword removes duplicate rows from a result.
  - e) The _____ clause filters groups after GROUP BY.
  - f) If ORDER BY doesn't say ASC or DESC, the sort order is _____.
  - g) In MySQL, NULLs sort _____ in ascending order.
  - h) `DELETE FROM t;` and `TRUNCATE TABLE t;` both remove every row. Which one can be undone with ROLLBACK?

---

## 14. Mock assessment

**Run `setup.sql` again before you start this section.** Try to answer these questions without looking at the solutions. Give yourself about 60 minutes.

- **14.1** Create a table named **Instructor** with these columns:
  - `ID`: a small, unsigned whole number (SMALLINT UNSIGNED) that MySQL fills in automatically. It is the primary key.
  - `FirstName`: text up to 20 characters. It is required.
  - `LastName`: text up to 30 characters. It is required.
  - `HireDate`: a date. It is required.
  - `Rate`: a decimal number, DECIMAL(5,2). It is required. If no rate is given, it should be 45.00. It must be between 20 and 150.
- **14.2** Add a column named `InstructorID` to the LessonSchedule table, with a foreign key that points to the Instructor table. If an instructor is deleted, their lessons should stay in the table, but with no instructor (NULL).
- **14.3** Add these three instructors:
  - Dale Evans, hired 2020-04-01, using the default rate
  - Roy Rogers, hired 2022-09-15, using the default rate
  - Annie Oakley, hired 2024-06-03, with a rate of 60.00
- **14.4** Assign instructors to lessons:
  - Dale teaches every lesson on horses 1, 2, and 3.
  - Roy teaches every lesson on horses 4, 5, and 6.
  - Annie teaches every lesson that still has no instructor.

  Then show how many lessons each instructor has. *(3 rows)*
- **14.5** Show every lesson with these columns: the date and time, the horse's name, the student's full name, and the instructor's full name. If a lesson has no student, the student name should be NULL. Sort the lessons from earliest to latest. *(12 rows)*
- **14.6** For each instructor, show their full name, how many lessons they teach, and how much they earn (the number of lessons multiplied by their rate). Sort the list so the instructor who earns the most is first. If two instructors earn the same amount, sort them by name. *(3 rows)*
- **14.7** For each breed that has more than one horse, show the breed, the number of horses, and the average height (rounded to 2 decimal places). Leave out horses whose breed is unknown (NULL). Sort the list so the breed with the tallest average height is first. *(4 rows)*
- **14.8** Show the horses that are taller than the average height of all horses. Sort the list so the tallest horse is first. *(4 rows)*
- **14.9** Create a view named **AustinStudentLessons** with the columns FirstName, LastName, LessonDateTime, and RegisteredName. The view should show only the lessons taken by students who live in Austin. Then select everything from the view, sorted from earliest to latest lesson. *(6 rows)*
- **14.10** Create an index that makes it faster to find all the lessons for a given student.
- **14.11** Some students have no email address. For each of them, set their email to their first name, a period, their last name, and then `@stable.example`, all in lowercase. For example, a student named Maria Lopez would get `maria.lopez@stable.example`. *(check: 1 row changed)*
- **14.12** Delete every horse that has no lessons scheduled. Then show how many horses are left. *(1 row: 9)*
