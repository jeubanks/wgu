# Part 5: Mock assessment

[← Exercise index](exercises.md) · Solutions: [`solutions.sql`](solutions.sql)

Do this part last, as a timed practice run.

## 14. Mock assessment

> [!IMPORTANT]
> **Run `setup.sql` again before you start this section.** Try to answer these questions without looking at the solutions. Give yourself about 60 minutes.

- **14.1** Create a table named **Instructor** with these columns:
  - `ID`: a small, unsigned whole number (SMALLINT UNSIGNED) that MySQL fills in automatically. It is the primary key.
  - `FirstName`: text up to 20 characters. It is required.
  - `LastName`: text up to 30 characters. It is required.
  - `HireDate`: a date. It is required.
  - `Rate`: a decimal number, DECIMAL(5,2). It is required. If no rate is given, it should be 45.00. It must be between 20 and 150.

  <!-- solution:14.1 -->
  <details>
  <summary>Hint</summary>

  - ID is `SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY`.
  - Rate needs `NOT NULL`, `DEFAULT 45.00`, and `CHECK (... BETWEEN 20 AND 150)`.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  CREATE TABLE Instructor (
    ID         SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    FirstName  VARCHAR(20) NOT NULL,
    LastName   VARCHAR(30) NOT NULL,
    HireDate   DATE NOT NULL,
    Rate       DECIMAL(5,2) NOT NULL DEFAULT 45.00 CHECK (Rate BETWEEN 20 AND 150)
  );
  ```

  </details>
  <!-- /solution -->

- **14.2** Add a column named `InstructorID` to the LessonSchedule table, with a foreign key that points to the Instructor table. Its type must be the same as Instructor's `ID` column. If an instructor is deleted, their lessons should stay in the table, but with no instructor (NULL).

  <!-- solution:14.2 -->
  <details>
  <summary>Hint</summary>

  - Instructor.ID is SMALLINT UNSIGNED, so InstructorID must be SMALLINT UNSIGNED too.
  - One ALTER TABLE can ADD COLUMN and ADD FOREIGN KEY, separated by a comma. The rule is ON DELETE SET NULL.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  ALTER TABLE LessonSchedule
    ADD COLUMN InstructorID SMALLINT UNSIGNED,
    ADD FOREIGN KEY (InstructorID) REFERENCES Instructor(ID) ON DELETE SET NULL;
  ```

  </details>
  <!-- /solution -->

- **14.3** Add these three instructors:
  - Dale Evans, hired 2020-04-01, using the default rate
  - Roy Rogers, hired 2022-09-15, using the default rate
  - Annie Oakley, hired 2024-06-03, with a rate of 60.00

  <!-- solution:14.3 -->
  <details>
  <summary>Hint</summary>

  - To use the default rate, leave Rate out of the column list. Annie has her own rate, so her INSERT has to include Rate.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  INSERT INTO Instructor (FirstName, LastName, HireDate) VALUES
    ('Dale', 'Evans',  '2020-04-01'),
    ('Roy',  'Rogers', '2022-09-15');
  INSERT INTO Instructor (FirstName, LastName, HireDate, Rate) VALUES
    ('Annie', 'Oakley', '2024-06-03', 60.00);
  ```

  </details>
  <!-- /solution -->

- **14.4** Assign instructors to lessons:
  - Dale teaches every lesson on horses 1, 2, and 3.
  - Roy teaches every lesson on horses 4, 5, and 6.
  - Annie teaches every lesson that still has no instructor.

  Then show how many lessons each instructor has. *(3 rows)*

  <!-- solution:14.4 -->
  <details>
  <summary>Hint</summary>

  - Use three UPDATEs, in the order given. The last one uses `WHERE InstructorID IS NULL`.
  - Then GROUP BY InstructorID with COUNT(*).

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  UPDATE LessonSchedule SET InstructorID = 1 WHERE HorseID IN (1, 2, 3);
  UPDATE LessonSchedule SET InstructorID = 2 WHERE HorseID IN (4, 5, 6);
  UPDATE LessonSchedule SET InstructorID = 3 WHERE InstructorID IS NULL;
  SELECT InstructorID, COUNT(*) AS Lessons FROM LessonSchedule GROUP BY InstructorID;
  ```

  </details>
  <!-- /solution -->

- **14.5** Show every lesson with these columns: the date and time, the horse's name, the student's full name, and the instructor's full name. If a lesson has no student, the student name should be NULL. Sort the lessons from earliest to latest. *(12 rows)*

  <!-- solution:14.5 -->
  <details>
  <summary>Hint</summary>

  - Join four tables. Only the join to Student needs to be a LEFT JOIN.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT ls.LessonDateTime, h.RegisteredName,
         CONCAT(s.FirstName, ' ', s.LastName) AS Student,
         CONCAT(i.FirstName, ' ', i.LastName) AS Instructor
  FROM LessonSchedule ls
  JOIN Horse      h ON h.ID = ls.HorseID
  JOIN Instructor i ON i.ID = ls.InstructorID
  LEFT JOIN Student s ON s.ID = ls.StudentID
  ORDER BY ls.LessonDateTime;
  ```

  </details>
  <!-- /solution -->

- **14.6** For each instructor, show their full name, how many lessons they teach, and how much they earn (the number of lessons multiplied by their rate). Sort the list so the instructor who earns the most is first. If two instructors earn the same amount, sort them by name. *(3 rows)*

  <!-- solution:14.6 -->
  <details>
  <summary>Hint</summary>

  - LEFT JOIN Instructor to LessonSchedule, GROUP BY the instructor, and multiply the lesson count by Rate.
  - Sort by two things: earnings DESC, then name.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT CONCAT(i.FirstName, ' ', i.LastName) AS Instructor,
         COUNT(ls.HorseID)          AS Lessons,
         COUNT(ls.HorseID) * i.Rate AS Earnings
  FROM Instructor i
  LEFT JOIN LessonSchedule ls ON ls.InstructorID = i.ID
  GROUP BY i.ID, i.FirstName, i.LastName, i.Rate
  ORDER BY Earnings DESC, Instructor;
  ```

  </details>
  <!-- /solution -->

- **14.7** For each breed that has more than one horse, show the breed, the number of horses, and the average height (rounded to 2 decimal places). Leave out horses whose breed is unknown (NULL). Sort the list so the breed with the tallest average height is first. *(4 rows)*

  <!-- solution:14.7 -->
  <details>
  <summary>Hint</summary>

  - "Each breed that has more than one horse" is a condition on each group's count. Which clause filters groups?
  - Leaving out NULL breeds is about single rows, so that part goes in WHERE.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT Breed, COUNT(*) AS Horses, ROUND(AVG(Height), 2) AS AvgHeight
  FROM Horse
  WHERE Breed IS NOT NULL
  GROUP BY Breed
  HAVING COUNT(*) > 1
  ORDER BY AvgHeight DESC;
  ```

  </details>
  <!-- /solution -->

- **14.8** Show the horses that are taller than the average height of all horses. Sort the list so the tallest horse is first. *(4 rows)*

  <!-- solution:14.8 -->
  <details>
  <summary>Hint</summary>

  - Compare Height with a subquery that returns the average height.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  SELECT ID, RegisteredName, Height
  FROM Horse
  WHERE Height > (SELECT AVG(Height) FROM Horse)
  ORDER BY Height DESC;
  ```

  </details>
  <!-- /solution -->

- **14.9** Create a view named **AustinStudentLessons** with the columns FirstName, LastName, LessonDateTime, and RegisteredName. The view should show only the lessons taken by students who live in Austin. Then select everything from the view, sorted from earliest to latest lesson. *(6 rows)*

  <!-- solution:14.9 -->
  <details>
  <summary>Hint</summary>

  - Inside the view, join Student, LessonSchedule, and Horse, and filter on City.
  - Sort when you select from the view, not inside the view.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  CREATE VIEW AustinStudentLessons AS
  SELECT s.FirstName, s.LastName, ls.LessonDateTime, h.RegisteredName
  FROM Student s
  JOIN LessonSchedule ls ON ls.StudentID = s.ID
  JOIN Horse h           ON h.ID = ls.HorseID
  WHERE s.City = 'Austin';
  SELECT * FROM AustinStudentLessons ORDER BY LessonDateTime;
  ```

  </details>
  <!-- /solution -->

- **14.10** Create an index that makes it faster to find all the lessons for a given student.

  <!-- solution:14.10 -->
  <details>
  <summary>Hint</summary>

  - You look lessons up by StudentID in LessonSchedule. Put an index on that column.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  CREATE INDEX idx_lesson_student ON LessonSchedule (StudentID);   -- speeds joins / lookups by student
  -- (MySQL InnoDB already auto-creates an index for each FK column; naming one explicitly is still valid.)
  ```

  </details>
  <!-- /solution -->

- **14.11** Some students have no email address. For each of them, set their email to their first name, a period, their last name, and then `@stable.example`, all in lowercase. For example, a student named Maria Lopez would get `maria.lopez@stable.example`. *(check: 1 row changed)*

  <!-- solution:14.11 -->
  <details>
  <summary>Hint</summary>

  - Use UPDATE with CONCAT() and LOWER(), only for the students whose Email IS NULL.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  UPDATE Student
  SET Email = CONCAT(LOWER(FirstName), '.', LOWER(REPLACE(LastName, '''', '')), '@stable.example')
  WHERE Email IS NULL;
  SELECT ID, FirstName, LastName, Email FROM Student WHERE Email LIKE '%@stable.example';
  ```

  </details>
  <!-- /solution -->

- **14.12** Delete every horse that has no lessons scheduled. Then show how many horses are left. *(1 row: 9)*

  <!-- solution:14.12 -->
  <details>
  <summary>Hint</summary>

  - Delete the horses whose ID is NOT IN the list of HorseIDs in LessonSchedule.
  - NOT IN is safe here because HorseID can never be NULL. Compare this with 6.8.

  </details>

  <details>
  <summary>Solution</summary>

  ```sql
  DELETE FROM Horse
  WHERE ID NOT IN (SELECT HorseID FROM LessonSchedule);   -- HorseID is NOT NULL, so NOT IN is safe here
  SELECT COUNT(*) AS HorsesLeft FROM Horse;               -- 9
  ```

  </details>
  <!-- /solution -->

---

[← Exercise index](exercises.md)
