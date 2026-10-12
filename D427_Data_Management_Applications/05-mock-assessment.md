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

---

[← Exercise index](exercises.md)
