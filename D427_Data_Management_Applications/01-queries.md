# Part 1: Querying data

[← Exercise index](exercises.md) · Solutions: [`solutions.sql`](solutions.sql)

These sections only read data, so you can redo any exercise at any time.

**In this part:** [1. SELECT basics](#1-select-basics) · [2. Filtering](#2-filtering) · [3. Built-in functions](#3-built-in-functions) · [4. Aggregates, GROUP BY, HAVING](#4-aggregates-group-by-having) · [5. Joins](#5-joins) · [6. Subqueries](#6-subqueries)

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

---

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

---

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

---

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

---

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

---

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

---

[← Exercise index](exercises.md)
