# D427 Data Management – Applications: MySQL Practice

85 hands-on exercises across the D427 competencies: querying, functions, aggregation, joins, subqueries, data modification, table definition and constraints, views, indexes, and turning a design into tables. The last section is a mock assessment in the style of the OA's lab items (Horse / Student / LessonSchedule).

Files:

| File | What it is |
|---|---|
| `setup.sql` | Builds database `d427` with sample data. Re-run any time to reset. |
| `exercises.md` | This file. Each item gives the expected row count so you can self-check. |
| `solutions.sql` | One worked answer per item, tagged `-- [1.1]` etc., with notes on the traps. |

## Getting started

See `README.md` for container setup and loading the data. Once connected, `SOURCE /work/setup.sql;` resets the database from inside the client.

**Work the sections in order.** Sections 1–6 only read data. Sections 7–10 change data and schema, and later items assume earlier ones were done. Before Section 11, reload `setup.sql`.

## The schema

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

The data has deliberate edge cases: an employee with no department, a department with no employees, a movie with all-NULL attributes, a rating no movie uses, a horse with no lessons, a student with no lessons, and a lesson slot with no student. Many exercises are built around them because that's where SQL answers go wrong.

---

## 1. SELECT basics

- **1.1** Show every column of every movie. *(12 rows)*
- **1.2** Show each movie's Title and ReleaseYear, newest first; break ties alphabetically by Title. Where does the NULL year end up? *(12)*
- **1.3** List each distinct Genre once. *(5)*
- **1.4** Show FirstName, LastName, Salary of employees earning more than 150,000. *(4)*
- **1.5** Show the three highest-grossing movies with their Gross. *(3)*
- **1.6** Show each employee's full name as one column `FullName` and their monthly pay (Salary / 12, rounded to cents) as `MonthlyPay`, highest first. *(15)*

## 2. Filtering

- **2.1** Movies released from 2014 through 2016, using BETWEEN. *(6)*
- **2.2** Movies rated G or PG, using IN. *(4)*
- **2.3** Movies whose title starts with the word "The". *(3)*
- **2.4** Students whose last name has "a" as its second letter. *(3)*
- **2.5** Employees who have no email address. *(2)*
- **2.6** Horses that are **not** Quarter Horses, including any whose breed is unknown. Try it first without handling NULL and compare. *(8)*
- **2.7** Students who live in Austin or Round Rock **and** have a phone number. Then remove your parentheses and explain the different result. *(5)*

## 3. Built-in functions

- **3.1** Each student's last name in uppercase and the number of characters in their first name. *(8)*
- **3.2** Each employee's whole years of service as of 2026-10-01 (`TIMESTAMPDIFF`), most senior first. *(15)*
- **3.3** For each lesson: HorseID, the date part, the time part, and the day-of-week name, in chronological order. *(12)*
- **3.4** Each movie's Title, Minutes, and a `LengthClass`: Short (<100), Standard (100–139), Long (140+), or Unknown when Minutes is NULL. *(12)*
- **3.5** Each movie's Title and Genre, showing "Unclassified" when Genre is NULL. *(12)*
- **3.6** Each movie's gross in millions rounded to one decimal, largest first, skipping NULLs. *(11)*
- **3.7** Students' phone numbers formatted as `(512) 555-0101`, skipping students with no phone. *(7)*

## 4. Aggregates, GROUP BY, HAVING

- **4.1** In one row: total number of movies and number of movies that have a rating. Why do they differ? *(1)*
- **4.2** In one row: average (2 decimals), minimum, maximum, and total salary. *(1)*
- **4.3** Headcount per DeptID. What happens to the employee with no department? *(6)*
- **4.4** Total Gross per genre, largest first, excluding NULL genre. *(4)*
- **4.5** DeptIDs whose average salary exceeds 120,000. *(3)*
- **4.6** HorseIDs that have two or more lessons scheduled. *(3)*
- **4.7** Number of students in each State/City combination, ordered by state then city. *(5)*

## 5. Joins

- **5.1** Each employee's name with their department name (inner join). Who disappears and why? *(14)*
- **5.2** Each movie's Title with its RatingDescription, keeping movies that have no rating. *(12)*
- **5.3** Every department name with its headcount, **including departments with zero employees**. Make sure Legal shows 0, not 1. *(6)*
- **5.4** Ratings that no movie uses (anti-join with LEFT JOIN … IS NULL). *(1)*
- **5.5** The lesson schedule: LessonDateTime, horse RegisteredName, student FirstName and LastName, ordered by date/time then horse name. Only lessons with an assigned student. *(11)*
- **5.6** Same as 5.5, but include lesson slots with no student assigned. *(12)*
- **5.7** Every employee with their manager's full name (self-join); keep employees without a manager. *(15)*
- **5.8** Employees whose manager works in a different department: employee name, employee dept, manager name, manager dept. *(2)*
- **5.9** Rewrite 5.3 using RIGHT JOIN. *(6)*
- **5.10** Horses that have no lessons. *(1)*
- **5.11** How many horse/student pairings are possible? (CROSS JOIN) *(1 row: 80)*
- **5.12** MySQL has no FULL OUTER JOIN. Emulate one between Employee and Department so you see both Hedy Lamarr (no dept) and Legal (no employees). *(16)*

## 6. Subqueries

- **6.1** Employees earning more than the company-wide average salary. *(7)*
- **6.2** Movies longer than the average length of Sci-Fi movies. *(4)*
- **6.3** Students who have at least one lesson, using IN. *(7)*
- **6.4** Students who have **no** lessons, using NOT IN. You'll get zero rows. Figure out why, then fix it two ways (one with NOT EXISTS). *(1)*
- **6.5** Employees earning more than the average of **their own** department (correlated subquery). *(5)*
- **6.6** The highest-paid employee in each department, with the department name. *(5)*
- **6.7** DeptIDs whose total payroll exceeds the average departmental payroll (use a derived table in FROM). *(2)*
- **6.8** Names of departments that have at least one employee hired after 2020-01-01, using EXISTS. *(3)*

## 7. Modifying data

- **7.1** Insert the movie *Dune* (Sci-Fi, PG-13, 2021, 155 minutes, Gross 108327830) without specifying an ID. What ID did it get? *(check: 1 row)*
- **7.2** Insert two students in a single INSERT: Ava Nguyen (Austin, ava@example.com) and Ethan Brooks (Georgetown, ethan@example.com). Don't give a State. What State did they get? *(check: 2 rows)*
- **7.3** Give everyone in the Support department a 5% raise. Look up the department by **name** in your WHERE, not by hard-coding 30. *(check: 3 rows)*
- **7.4** Set Genre to 'Indie' and ReleaseYear to 2026 for any movie whose Genre is NULL. *(1 row changed)*
- **7.5** Delete all lessons scheduled before 2026-02-02. *(10 lessons remain)*
- **7.6** Count Midnight's lessons, delete the horse Midnight (ID 9), count again. Which FK action did that? *(1, then 0)*
- **7.7** Delete student Jamal Carter (ID 2). What happened to his lesson? *(2 lessons with NULL StudentID)*
- **7.8** In a transaction, delete all R-rated movies, check the count, then ROLLBACK and check again. *(10 during, 13 after)*
- **7.9** Try to delete the 'PG' rating. Read the error. Then try inserting a movie with RatingCode 'XX'. Which constraint stops each one, and what are the error numbers?

## 8. CREATE / ALTER / DROP

- **8.1** Create table **Song**: `ID` auto-increment integer primary key; `Title` and `Artist` required strings (60); `ReleaseYear` small integer; `Genre` string (20) defaulting to 'Pop'; `DurationSec` integer that must be positive. The same Title + Artist must not appear twice. Insert two songs without a Genre and confirm the default. *(2)*
- **8.2** Add a column `Album` VARCHAR(60) positioned after `Artist`.
- **8.3** Widen `Genre` to VARCHAR(30) **and keep its default**.
- **8.4** Rename `DurationSec` to `Seconds`.
- **8.5** Drop `Album`, then DESCRIBE Song. *(6 columns)*
- **8.6** Create **Playlist** (ID, Name, Created date) and junction table **PlaylistSong** (PlaylistID, SongID, Position) with a composite primary key; deleting a playlist or a song removes its PlaylistSong rows. Add a playlist with both songs and list it in order. *(2)*
- **8.7** Create **EmployeeArchive** (EmpID PK, FullName, Salary, ArchivedOn) and fill it with one INSERT … SELECT copying the Support employees, using today's date. *(3)*
- **8.8** Create **Director** (ID, Name) with two directors (Denis Villeneuve, Christopher Nolan). Add a `DirectorID` column and a named foreign key to Movie with one ALTER. Assign Arrival and Dune to Villeneuve and Interstellar to Nolan, then list movie/director. *(3)*
- **8.9** Rename EmployeeArchive to FormerEmployee, then drop it. Write the drop so it wouldn't error if run twice. Why would `DROP TABLE Song` fail right now?

## 9. Views and indexes

- **9.1** Create view **LessonDetail** (LessonDateTime, Horse, FirstName, LastName) that includes unassigned slots. Use it to find lessons with no student. *(2)*
- **9.2** Create view **DeptSummary** (DeptID, DeptName, Headcount, AvgSalary) covering every department. Query departments with 3+ people. *(3)*
- **9.3** Create view **SupportStaff** over Employee rows in DeptID 30 `WITH CHECK OPTION`. Give EmpID 12 a 1,000 raise through the view. Then try moving EmpID 12 to DeptID 20 through the view and read the error. Can you UPDATE through DeptSummary? Why not?
- **9.4** Create an index on Employee(LastName). Use SHOW INDEX and EXPLAIN to confirm a lookup by last name uses it.
- **9.5** Create a composite index on Movie(Genre, ReleaseYear). EXPLAIN a query filtering on both. Would a query filtering only on ReleaseYear use it efficiently?
- **9.6** Drop that index and the SupportStaff view.

## 10. From design to tables

- **10.1** Implement this design: a **Customer** (name, unique required email) places many **Orders** (order date); an order contains many **Products** (name, unit price ≥ 0) and a product appears on many orders, each with a quantity > 0. Choose keys and FK actions. Add one customer, two products, and one order with two lines, then compute the order total. *(1 row: 20.00)*
- **10.2** Normalize to 3NF and create the tables:
  `Enrollment(StudentID, StudentName, CourseID, CourseTitle, InstructorID, InstructorName, InstructorOffice, Grade)`, key (StudentID, CourseID). Name the partial and transitive dependencies you removed. Prefix tables with `NF_`. *(4 tables)*

---

## 11. Mock assessment

**Reload `setup.sql` first.** Try these unassisted, about 60 minutes.

- **11.1** Create **Instructor**: `ID` small unsigned auto-increment PK; `FirstName` VARCHAR(20) and `LastName` VARCHAR(30), both required; `HireDate` required date; `Rate` DECIMAL(5,2), required, default 45.00, must be between 20 and 150.
- **11.2** Add an `InstructorID` column to LessonSchedule referencing Instructor. If an instructor is deleted, their lessons stay with no instructor.
- **11.3** Insert Dale Evans (hired 2020-04-01) and Roy Rogers (2022-09-15) at the default rate, and Annie Oakley (2024-06-03) at 60.00.
- **11.4** Assign Dale to all lessons on horses 1–3, Roy to horses 4–6, and Annie to everything else still unassigned. Show lessons per instructor. *(3)*
- **11.5** List every lesson with date/time, horse name, student full name (NULL if open), and instructor full name, chronologically. *(12)*
- **11.6** For each instructor: full name, number of lessons, and earnings (lessons × rate), highest earnings first. *(3)*
- **11.7** For each breed with more than one horse: breed, count, average height (2 decimals), tallest average first. Exclude unknown breed. *(4)*
- **11.8** Horses taller than the average horse height, tallest first. *(4)*
- **11.9** Create view **AustinStudentLessons** (FirstName, LastName, LessonDateTime, RegisteredName) of lessons taken by students who live in Austin. Select from it chronologically. *(6)*
- **11.10** Create an index that speeds up finding lessons for a given student.
- **11.11** For students with no email, set it to `first.last@stable.example` in lowercase. *(1 row)*
- **11.12** Delete every horse that has no lessons scheduled, and show how many horses remain. *(9)*
