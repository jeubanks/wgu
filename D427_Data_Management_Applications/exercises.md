# D427 Data Management – Applications: MySQL Practice

136 exercises that cover the D427 topics: writing queries, using built-in functions, grouping and totals, joins, subqueries, changing data, creating and changing tables, constraints, views, indexes, and turning a database design into tables.

Parts 3 and 4 are built from the D427 practice tests and the D427 Challenge. Part 5 is a mock assessment that uses the same kind of tables as the lab questions on the real assessment (Horse, Student, and LessonSchedule).

## Contents

- **[Part 1: Querying data](01-queries.md)**: only reads data
  - [1. SELECT basics](01-queries.md#1-select-basics)
  - [2. Filtering](01-queries.md#2-filtering)
  - [3. Built-in functions](01-queries.md#3-built-in-functions)
  - [4. Aggregates, GROUP BY, HAVING](01-queries.md#4-aggregates-group-by-having)
  - [5. Joins](01-queries.md#5-joins)
  - [6. Subqueries](01-queries.md#6-subqueries)
- **[Part 2: Changing data and tables](02-changing-data.md)**: do these in order
  - [7. Modifying data](02-changing-data.md#7-modifying-data)
  - [8. CREATE / ALTER / DROP](02-changing-data.md#8-create--alter--drop)
  - [9. Views and indexes](02-changing-data.md#9-views-and-indexes)
  - [10. From design to tables](02-changing-data.md#10-from-design-to-tables)
- **[Part 3: Assessment drills](03-assessment-drills.md)**: can be done at any time
  - [11. Writing tables from a specification](03-assessment-drills.md#11-writing-tables-from-a-specification)
  - [12. Assessment-style queries](03-assessment-drills.md#12-assessment-style-queries)
- **[Part 4: Concepts check](04-concepts-check.md)**: multiple choice, answers included
  - [13. Concepts check](04-concepts-check.md#13-concepts-check)
- **[Part 5: Mock assessment](05-mock-assessment.md)**: do this last
  - [14. Mock assessment](05-mock-assessment.md#14-mock-assessment)

## The files

| File | What it is |
|---|---|
| `setup.sql` | Creates a database named `d427` and fills it with sample data. You can run it again at any time to reset everything back to the start. |
| `exercises.md` | This page. |
| `01-queries.md` … `05-mock-assessment.md` | The exercises. Most of them tell you how many rows your answer should return, so you can check your own work. |
| `solutions.sql` | One worked answer for each SQL exercise. Each answer is labeled with its number, like `-- [1.1]`. Many answers include notes about common mistakes. The Part 4 answers aren't here: they're in `04-concepts-check.md`, folded under each question. |

## Getting started

See [`README.md`](README.md) for how to set up the container and load the data. After you are connected to MySQL, you can reset the database at any time by running this command inside the MySQL client:

```sql
SOURCE /work/setup.sql;
```

> [!IMPORTANT]
> - **Do Sections 1 to 10 in order.** Sections 1 to 6 only read data, so they never change anything. Sections 7 to 10 change the data and the tables, and later exercises expect that you already did the earlier ones.
> - **Sections 11 to 13 stand alone.** Section 11 builds its own tables in a separate database named `d427_drills`. Section 12 uses its own tables in `d427`, which no other section changes. Section 13 needs no SQL at all.
> - **Run `setup.sql` again before Section 14**, so you begin with fresh data.

### How to read each exercise

The note in parentheses at the end of an exercise tells you how many rows your query should return. For example, *(12 rows)* means your result should have 12 rows. If you get a different number, look at your query again before you check the solution.

Some exercises change data instead of returning rows. For those, the note in parentheses tells you what to check afterward.

## The tables

Here is a short summary of the main tables in the database. These short labels are used below:

| Label | Meaning |
|---|---|
| **PK** | primary key (the column or columns that uniquely identify each row) |
| **AI** | auto-increment (MySQL fills in the next number for you) |
| **FK** | foreign key (the column points to a row in another table) |
| **UNIQUE** | no two rows can have the same value |
| **CHECK** | a rule the value must follow |
| **DEFAULT** | the value used when you don't give one |

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

Section 12 also uses six smaller tables (Book, YearSales, Passport, Visa, Compensation, and student_grades). They are described at the start of [that section](03-assessment-drills.md#12-assessment-style-queries).

The sample data includes some unusual rows on purpose:

- an employee who is not in any department
- a department that has no employees
- a movie that has only an ID and a Title (every other column is NULL)
- a rating that no movie uses
- a horse that has no lessons
- a student who has no lessons
- a lesson time that has no student assigned

Many exercises are built around these rows, because these are the cases where SQL queries most often give the wrong answer.
