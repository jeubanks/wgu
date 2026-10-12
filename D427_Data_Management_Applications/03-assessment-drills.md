# Part 3: Assessment drills

[← Exercise index](exercises.md) · Solutions: [`solutions.sql`](solutions.sql)

Built from the D427 practice tests and the D427 Challenge. These sections don't depend on Parts 1 and 2, so you can do them at any time.

**In this part:** [11. Writing tables from a specification](#11-writing-tables-from-a-specification) · [12. Assessment-style queries](#12-assessment-style-queries)

## 11. Writing tables from a specification

On the assessment, the table-building questions describe each column in words, like *"integer with range 0 to 65 thousand, auto increment, primary key"*. You have to turn that wording into the right data type and constraints. This section practices exactly that.

These exercises use the same table names as the assessment (Horse, Student, Customer, and so on), so they run in a separate database to keep them away from the `d427` tables. Start the section with:

```sql
DROP DATABASE IF EXISTS d427_drills;
CREATE DATABASE d427_drills;
USE d427_drills;
```

Run `USE d427;` when you finish the section. You can redo the section at any time by running the three lines above again.

> [!TIP]
> Every exercise here also includes a statement that **should fail**. Run it, read the error, and make sure you understand which rule stopped it.

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

> [!IMPORTANT]
> When you are done, run `USE d427;`.

---

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

> [!TIP]
> The wording in this section copies the assessment on purpose. Pay attention to phrases like **"if available"** and **"regardless of whether"**. They tell you which table is optional, so they decide which kind of join you need. When a question has neither phrase, the assessment expects an **inner join**, even if it says "for all books."

> [!IMPORTANT]
> Exercises 12.1 to 12.19 only read data (12.15 creates a view). Exercises 12.20 to 12.22 change data, so do them last.

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

---

[← Exercise index](exercises.md)
