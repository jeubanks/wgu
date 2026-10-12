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

  <!-- solution:11.1 -->
  <details>
  <summary>Solution</summary>

  ```sql
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
  ```

  </details>
  <!-- /solution -->

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

  <!-- solution:11.2 -->
  <details>
  <summary>Solution</summary>

  ```sql
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
  ```

  </details>
  <!-- /solution -->

- **11.3** Create the **LessonSchedule** table:
  - HorseID — integer with range 0 to 65 thousand, not NULL, foreign key references Horse(ID)
  - StudentID — integer with range 0 to 65 thousand, foreign key references Student(ID)
  - LessonDateTime — date/time, not NULL
  - The primary key is (HorseID, LessonDateTime).
  - If a row is deleted from Horse, the rows with the same horse ID should be deleted from LessonSchedule automatically.
  - If a row is deleted from Student, the same student IDs should be set to NULL in LessonSchedule automatically.

  Then answer: why must StudentID allow NULL? Try declaring it `NOT NULL` and read the error.

  <!-- solution:11.3 -->
  <details>
  <summary>Solution</summary>

  ```sql
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
  ```

  </details>
  <!-- /solution -->

- **11.4** Test the two foreign key rules from 11.3:
  - Add two lessons for Babe (horse 1) and Rosie (student 1): one at 2026-03-01 09:00 and one at 2026-03-02 09:00.
  - Delete Rosie from Student. Look at LessonSchedule.
  - Delete Babe from Horse. Count the lessons.

  *(check: 2 lessons with a NULL StudentID after the first delete, 0 lessons after the second)*

  <!-- solution:11.4 -->
  <details>
  <summary>Solution</summary>

  ```sql
  INSERT INTO LessonSchedule VALUES
    (1, 1, '2026-03-01 09:00:00'),
    (1, 1, '2026-03-02 09:00:00');
  DELETE FROM Student WHERE ID = 1;
  SELECT * FROM LessonSchedule;                 -- 2 rows, StudentID now NULL  (SET NULL)
  DELETE FROM Horse WHERE ID = 1;
  SELECT COUNT(*) AS LessonsLeft FROM LessonSchedule;   -- 0  (CASCADE)
  ```

  </details>
  <!-- /solution -->

- **11.5** Create the **Customer** table. Do not add any constraints beyond what is stated.
  - CustomerID — positive integer
  - FirstName — variable-length string with up to 50 characters
  - MiddleInitial — fixed-length string with 1 character
  - LastName — variable-length string with up to 50 characters
  - DateOfBirth — date
  - CreditLimit — positive decimal value representing a cost of up to $19,999.99, with 2 digits for cents

  Use `DESCRIBE Customer;` to check your work. *(6 columns)*

  <!-- solution:11.5 -->
  <details>
  <summary>Solution</summary>

  ```sql
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
  ```

  </details>
  <!-- /solution -->

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

  <!-- solution:11.6 -->
  <details>
  <summary>Solution</summary>

  ```sql
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
  ```

  </details>
  <!-- /solution -->

- **11.7** The **Genre** table has these columns:
  - GenreCode — variable-length string with max 5 characters, primary key
  - GenreDescription — variable-length string with max 40 characters

  Create the Genre table. Then create the **Book** table with these columns, and make GenreCode a foreign key to the GenreCode column in Genre:
  - Title — variable-length string, maximum 30 characters
  - GenreCode — variable-length string, maximum 5 characters

  Add the genre ('FIC', 'Fiction') and the book ('Beloved', 'FIC'). Then try to add the book ('Dune', 'SCI'), which should fail. *(1 row)*

  <!-- solution:11.7 -->
  <details>
  <summary>Solution</summary>

  ```sql
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
  ```

  </details>
  <!-- /solution -->

- **11.8** Create the **Pet** table with no primary key:
  - PetID — integer
  - Name — variable-length string, max 30
  - Breed — variable-length string, max 30
  - Birthdate — date

  Add these pets: (1, Rex, Beagle, 2020-05-01), (2, Bella, Poodle, 2021-07-12), (2, Milo, Pug, 2022-02-20). Now write a statement that modifies the Pet table to make PetID the primary key. It fails. Why? Fix the data so Milo has PetID 3, then add the primary key. *(check: `DESCRIBE Pet` shows PRI on PetID)*

  <!-- solution:11.8 -->
  <details>
  <summary>Solution</summary>

  ```sql
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
  ```

  </details>
  <!-- /solution -->

- **11.9** Create these two tables exactly as described. Notice that breedID is **not** a primary key in Breed.
  - **Breed**: breedID — integer; breedDescription — variable-length string, max 40
  - **Dog**: dogID — integer, primary key; name — variable-length string, max 30; breedID — integer; birthdate — date

  Write a statement to make the breedID column in Dog a foreign key to the breedID column in Breed. It fails. Read the error, fix Breed, and try again. This time, give the foreign key the name `fk_dog_breed`.

  <!-- solution:11.9 -->
  <details>
  <summary>Solution</summary>

  ```sql
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
  ```

  </details>
  <!-- /solution -->

- **11.10** Create the **Department** table: DeptID — integer, primary key; DeptName — variable-length string, max 50; ManagerID — integer. Add the departments (1, 'Sales', 2100) and (2, 'Legal', 1500).
  - Add a constraint named **MgrIDCheck** that makes sure ManagerID is always 2000 or above. It fails. Why?
  - Change Legal's ManagerID to 2500 and add the constraint again.
  - Try to add the department (3, 'Finance', 1999). It should fail.
  - Remove the MgrIDCheck constraint by name, then add Finance again.

  *(3 rows)*

  <!-- solution:11.10 -->
  <details>
  <summary>Solution</summary>

  ```sql
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
  ```

  </details>
  <!-- /solution -->

- **11.11** Create the **Automobile** table: ID — integer, primary key; Make — variable-length string, max 30; Model — variable-length string, max 30; Year — integer. Then add two columns, each with its own ALTER TABLE statement:
  - SafetyRating — a positive number that is less than 80 with 1 decimal place
  - EngineSize — a positive decimal value less than or equal to 7.9 with one decimal place

  Add the car (1, 'Toyota', 'Camry', 2024, 79.9, 2.5). Then try to add (2, 'Honda', 'Civic', 2024, 80.0, 2.0), which should fail. If the data type already limits the size, why do you still need a CHECK? *(1 row)*

  <!-- solution:11.11 -->
  <details>
  <summary>Solution</summary>

  ```sql
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
  ```

  </details>
  <!-- /solution -->

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

  <!-- solution:11.12 -->
  <details>
  <summary>Solution</summary>

  ```sql
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
  ```

  </details>
  <!-- /solution -->

- **11.13** Create the **Patient** table: patient_id — integer, primary key; first_name — variable-length string, max 20; last_name — variable-length string, max 30; birthdate — date.

  Create the **Exam** table: exam_id — integer, auto increment, primary key; exam_date — date, not NULL; exam_reason — variable-length string with 250 characters; patient_id — integer, not NULL, foreign key to Patient. Name the foreign key `fk_exam_patient`. **A patient who still has exams must not be deletable.**

  Add patients (1, 'Ana', 'Silva', '1990-03-14') and (2, 'Ben', 'Okoro', '1985-11-02'), and one exam for patient 1 on 2026-09-30 for an 'Annual physical'. Then try to delete each patient. *(check: patient 1's delete fails; patient 2's delete works; 1 patient left)*

  <!-- solution:11.13 -->
  <details>
  <summary>Solution</summary>

  ```sql
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
  ```

  </details>
  <!-- /solution -->

- **11.14** The clinic changes its rule: when a patient is deleted, their exams should stay, but with no patient (NULL). Change the Exam table to follow this new rule, then delete patient 1. There is no statement that edits a foreign key in place, so think about what you have to remove and add, and what has to change about the patient_id column first. *(check: 1 exam left, with a NULL patient_id)*

  <!-- solution:11.14 -->
  <details>
  <summary>Solution</summary>

  ```sql
  -- There is no "ALTER FOREIGN KEY". Drop it by name, fix the column, add the new one.
  -- (The practice tests' "ON DELETE SET TO NULL" is not valid MySQL; it's ON DELETE SET NULL.)
  ALTER TABLE Exam DROP FOREIGN KEY fk_exam_patient;
  ALTER TABLE Exam MODIFY patient_id INT;       -- SET NULL needs a nullable column
  ALTER TABLE Exam ADD CONSTRAINT fk_exam_patient
    FOREIGN KEY (patient_id) REFERENCES Patient(patient_id) ON DELETE SET NULL;
  DELETE FROM Patient WHERE patient_id = 1;
  SELECT * FROM Exam;                           -- 1 row, patient_id NULL
  ```

  </details>
  <!-- /solution -->

- **11.15** Add two more students:
  - Jamal Carter, 22 Oak Ave, Round Rock, zip 78664, phone 5125550102, email jamal@example.com
  - Priya Nair, 300 Elm Blvd, Austin, zip 78702, phone 5125550103, email priya@example.com

  Then:
  - Create a **unique index** named `idx_student_phone` on the Phone column.
  - Try to add a student with Jamal's phone number. It should fail.
  - Run `SHOW INDEX FROM Student;`. Which index did MySQL create for you because Email is UNIQUE?
  - Drop `idx_student_phone`.

  <!-- solution:11.15 -->
  <details>
  <summary>Solution</summary>

  ```sql
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
  ```

  </details>
  <!-- /solution -->

- **11.16** Create a view named **StudentContact** with the columns FirstName, LastName, and Phone from Student. Then **change** the view with ALTER VIEW so it also includes Email. Select everything from the view, sorted by LastName. Finally, delete (drop) the view, and write the DROP statement so it does not cause an error if you run it a second time. *(2 rows, 4 columns)*

  <!-- solution:11.16 -->
  <details>
  <summary>Solution</summary>

  ```sql
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
  ```

  </details>
  <!-- /solution -->

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

  <!-- solution:12.1 -->
  <details>
  <summary>Solution</summary>

  ```sql
  SELECT * FROM Book;
  ```

  </details>
  <!-- /solution -->

- **12.2** Write a query to retrieve the Title and Genre values for all records in the Book table with a Year value of 2018. Make sure your result returns the columns in the order given. *(4 rows)*

  <!-- solution:12.2 -->
  <details>
  <summary>Solution</summary>

  ```sql
  SELECT Title, Genre
  FROM Book
  WHERE Year = 2018;
  ```

  </details>
  <!-- /solution -->

- **12.3** Write a query to display all Title values in alphabetical order A–Z. *(13 rows)*

  <!-- solution:12.3 -->
  <details>
  <summary>Solution</summary>

  ```sql
  SELECT Title
  FROM Book
  ORDER BY Title ASC;      -- ASC is the default; writing it costs nothing
  ```

  </details>
  <!-- /solution -->

- **12.4** Write a query to output the unique Genre values and the number of books with each genre value from the Book table as GenreCount. Sort the results by Genre in reverse alphabetical order (Z–A). Where does the book with no genre show up? *(6 rows)*

  <!-- solution:12.4 -->
  <details>
  <summary>Solution</summary>

  ```sql
  SELECT Genre, COUNT(*) AS GenreCount
  FROM Book
  GROUP BY Genre
  ORDER BY Genre DESC;
  -- The NULL genre is its own group, and sorts LAST in DESC order.
  -- The answer key's  SELECT DISTINCT Genre, COUNT(*) ... GROUP BY Genre  also works:
  -- GROUP BY already makes each Genre unique, so DISTINCT does nothing.
  ```

  </details>
  <!-- /solution -->

- **12.5** Write three separate queries:
  - a) How many books have a Year value of 2019? *(1 row: 2)*
  - b) What is the total of all costs in the Book table? *(1 row: 429.38)*
  - c) How much does the most expensive book cost? *(1 row: 125.00)*

  <!-- solution:12.5 -->
  <details>
  <summary>Solution</summary>

  ```sql
  SELECT COUNT(*) FROM Book WHERE Year = 2019;   -- a) 2
  SELECT SUM(Cost) FROM Book;                    -- b)
  SELECT MAX(Cost) FROM Book;                    -- c)
  ```

  </details>
  <!-- /solution -->

- **12.6** Write a query to pull all data for books that cost more than the average cost. Then do the same for books that cost less than the average. Also try `WHERE Cost > AVG(Cost)` and read the error. Why doesn't it work? *(1 row, then 12 rows)*

  <!-- solution:12.6 -->
  <details>
  <summary>Solution</summary>

  ```sql
  SELECT *
  FROM Book
  WHERE Cost > (SELECT AVG(Cost) FROM Book);   -- a) 1 row: one $125 book pulls the average up to 33.03

  SELECT *
  FROM Book
  WHERE Cost < (SELECT AVG(Cost) FROM Book);   -- b) 12 rows
  -- WHERE Cost > AVG(Cost) fails with ERROR 1111 (Invalid use of group function):
  -- WHERE is checked one row at a time, before any aggregate exists.
  ```

  </details>
  <!-- /solution -->

- **12.7** Write a query to display both the TotalSales and the Title (if available) for all YearSales. Make sure your result returns the columns in the order given. *(12 rows)*

  <!-- solution:12.7 -->
  <details>
  <summary>Solution</summary>

  ```sql
  -- "Title (if available)"  -> Book is the optional side.  "for all YearSales" -> keep every YearSales row.
  SELECT YearSales.TotalSales, Book.Title
  FROM Book
  RIGHT JOIN YearSales ON Book.Year = YearSales.Year;
  ```

  </details>
  <!-- /solution -->

- **12.8** Write a query to display both the Title and the TotalSales for all books. Make sure your result returns the columns in the order given. *(11 rows)*

  <!-- solution:12.8 -->
  <details>
  <summary>Solution</summary>

  ```sql
  -- No "if available" / "regardless" wording, so the OA expects an INNER JOIN.
  SELECT Book.Title, YearSales.TotalSales
  FROM Book
  INNER JOIN YearSales ON Book.Year = YearSales.Year;
  -- The two books whose Year has no YearSales row (1989, 2017) drop out, and so does 2023.
  ```

  </details>
  <!-- /solution -->

- **12.9** Write a query to display both the Title and TotalSales, regardless of whether they had any sales, for all books. *(13 rows)*

  <!-- solution:12.9 -->
  <details>
  <summary>Solution</summary>

  ```sql
  -- "regardless of whether they had any sales" -> YearSales is optional; "for all Books" -> keep every book.
  SELECT Book.Title, YearSales.TotalSales
  FROM YearSales
  RIGHT JOIN Book ON YearSales.Year = Book.Year;
  -- Same thing written as a LEFT JOIN:  FROM Book LEFT JOIN YearSales ON ...
  ```

  </details>
  <!-- /solution -->

- **12.10** Write 12.7 again, but use a LEFT JOIN this time. You should get the same 12 rows. *(12 rows)*

  <!-- solution:12.10 -->
  <details>
  <summary>Solution</summary>

  ```sql
  SELECT YearSales.TotalSales, Book.Title
  FROM YearSales
  LEFT JOIN Book ON Book.Year = YearSales.Year;
  -- A RIGHT JOIN B  ==  B LEFT JOIN A. The table whose rows you keep is the one the arrow points at.
  ```

  </details>
  <!-- /solution -->

- **12.11** Show the years in YearSales that have no books. *(1 row)*

  <!-- solution:12.11 -->
  <details>
  <summary>Solution</summary>

  ```sql
  SELECT ys.Year
  FROM YearSales ys
  LEFT JOIN Book b ON b.Year = ys.Year
  WHERE b.ID IS NULL;
  ```

  </details>
  <!-- /solution -->

- **12.12** Write a query to display all visas and the name of the passport holder (if available). Display the VisaID and the PassportHolderName. Order by VisaID. *(8 rows)*

  <!-- solution:12.12 -->
  <details>
  <summary>Solution</summary>

  ```sql
  SELECT Visa.VisaID, Passport.PassportHolderName
  FROM Visa
  LEFT JOIN Passport ON Visa.PassportID = Passport.PassportID
  ORDER BY Visa.VisaID;
  ```

  </details>
  <!-- /solution -->

- **12.13** Write a query to return the PassportHolderName and VisaType. Unassigned visas should not appear in the results. Sort the results by PassportHolderName. *(6 rows)*

  <!-- solution:12.13 -->
  <details>
  <summary>Solution</summary>

  ```sql
  SELECT Passport.PassportHolderName, Visa.VisaType
  FROM Passport
  INNER JOIN Visa ON Visa.PassportID = Passport.PassportID
  ORDER BY Passport.PassportHolderName;
  ```

  </details>
  <!-- /solution -->

- **12.14** Write a query to display each unique VisaType along with the number of visas issued under that type. *(3 rows)*

  <!-- solution:12.14 -->
  <details>
  <summary>Solution</summary>

  ```sql
  SELECT VisaType, COUNT(*) AS VisaCount
  FROM Visa
  GROUP BY VisaType;
  ```

  </details>
  <!-- /solution -->

- **12.15** Write a statement to create a view called **Visas_2023** that retrieves all visas issued in the year 2023 from the Visa table. Then select everything from the view. Can you write the filter two different ways? *(4 rows)*

  <!-- solution:12.15 -->
  <details>
  <summary>Solution</summary>

  ```sql
  CREATE VIEW Visas_2023 AS
  SELECT *
  FROM Visa
  WHERE YEAR(IssueDate) = 2023;
  --  equivalent: WHERE IssueDate BETWEEN '2023-01-01' AND '2023-12-31'
  --  (the BETWEEN form can use an index on IssueDate; wrapping the column in YEAR() can't)
  SELECT * FROM Visas_2023;
  ```

  </details>
  <!-- /solution -->

- **12.16** Show the passports that have no visas. *(1 row)*

  <!-- solution:12.16 -->
  <details>
  <summary>Solution</summary>

  ```sql
  SELECT p.PassportID, p.PassportHolderName
  FROM Passport p
  LEFT JOIN Visa v ON v.PassportID = p.PassportID
  WHERE v.VisaID IS NULL;
  ```

  </details>
  <!-- /solution -->

- **12.17** The course guide asks you to know the difference between a **row subquery** and a **table subquery**.
  - a) Using a **row subquery**, show the Title, Genre, and Year of every book that has the same Genre **and** the same Year as 'Normal People'. Compare both columns at once. *(2 rows)*
  - b) Using a **table subquery**, show the Title and Year of every book published in a year that had more than 50 releases (from YearSales). *(4 rows)*
  - In your own words: what does each kind of subquery return, and how is that different from the scalar subquery you wrote in 12.6?

  <!-- solution:12.17 -->
  <details>
  <summary>Solution</summary>

  ```sql
  -- a) Row subquery: returns ONE row with SEVERAL columns, compared with a row constructor.
  SELECT Title, Genre, Year
  FROM Book
  WHERE (Genre, Year) = (SELECT Genre, Year FROM Book WHERE Title = 'Normal People');
  -- b) Table subquery: returns SEVERAL rows, used with IN / EXISTS (or in FROM as a derived table).
  SELECT Title, Year
  FROM Book
  WHERE Year IN (SELECT Year FROM YearSales WHERE Releases > 50);
  -- (A scalar subquery, like the AVG in 12.6, returns exactly one row and one column.)
  ```

  </details>
  <!-- /solution -->

- **12.18** Using the student_grades table:
  - Write a query to count how many students have each grade (A, B, and C). Name the count gradeCount. *(3 rows)*
  - Add a clause to the query so it shows only the grades that have a count greater than 2. *(1 row)*

  <!-- solution:12.18 -->
  <details>
  <summary>Solution</summary>

  ```sql
  SELECT grade, COUNT(*) AS gradeCount
  FROM student_grades
  GROUP BY grade;

  SELECT grade, COUNT(*) AS gradeCount
  FROM student_grades
  GROUP BY grade
  HAVING gradeCount > 2;     -- MySQL allows the alias here; HAVING COUNT(*) > 2 works everywhere
  ```

  </details>
  <!-- /solution -->

- **12.19** Look at the Compensation table. Before you run anything, predict which names each query returns:
  - `SELECT Name FROM Compensation WHERE Salary = Bonus;`
  - `SELECT Name FROM Compensation WHERE Salary <> Bonus;`

  Run them. There are 5 people, but the two results together contain only 2 names. Where did the other three go? *(1 row, then 1 row)*

  <!-- solution:12.19 -->
  <details>
  <summary>Solution</summary>

  ```sql
  SELECT Name FROM Compensation WHERE Salary = Bonus;    -- Sam Snead only
  SELECT Name FROM Compensation WHERE Salary <> Bonus;   -- Maria Rodriguez only
  -- Any comparison with NULL is UNKNOWN, and WHERE keeps only TRUE rows. Lisa, Ravi and Jiho
  -- are in NEITHER result, even though "=" and "<>" look like they should cover everything.
  ```

  </details>
  <!-- /solution -->

- **12.20** Add 2000 to the bonus of every person with a salary less than 70000. Ravi Patel has no bonus yet (NULL). After your update, he should have a bonus of 2000, not NULL. *(check: 2 rows changed)*

  <!-- solution:12.20 -->
  <details>
  <summary>Solution</summary>

  ```sql
  UPDATE Compensation
  SET Bonus = COALESCE(Bonus, 0) + 2000
  WHERE Salary < 70000;
  -- Bonus + 2000 would leave Ravi's bonus NULL (NULL + 2000 = NULL).
  -- Jiho (NULL salary) isn't updated: NULL < 70000 is UNKNOWN.
  SELECT Name, Salary, Bonus FROM Compensation ORDER BY ID;
  ```

  </details>
  <!-- /solution -->

- **12.21** Add the book Circe to the Book table: Genre "No Data", Year 2018, Cost 15.00. Do not give an ID. Then show the books that have no genre. *(2 rows)*

  <!-- solution:12.21 -->
  <details>
  <summary>Solution</summary>

  ```sql
  INSERT INTO Book (Title, Genre, Year, Cost)
  VALUES ('Circe', NULL, 2018, 15.00);      -- "No Data" is NULL, not the string 'No Data'
  SELECT * FROM Book WHERE Genre IS NULL;
  ```

  </details>
  <!-- /solution -->

- **12.22** Write two UPDATE statements:
  - Add $1 (for charity) to the cost of any book that costs $50 or less.
  - Add $10 (for charity) to the cost of any book that costs more than $100.

  *(check: 13 rows changed, then 1 row changed; An Atlas of Rare Maps now costs 135.00)*

  <!-- solution:12.22 -->
  <details>
  <summary>Solution</summary>

  ```sql
  UPDATE Book SET Cost = Cost + 1  WHERE Cost <= 50;
  UPDATE Book SET Cost = Cost + 10 WHERE Cost > 100;
  SELECT Title, Cost FROM Book ORDER BY Cost DESC LIMIT 3;
  ```

  </details>
  <!-- /solution -->

---

[← Exercise index](exercises.md)
