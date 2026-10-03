# D427 Data Management – Applications: MySQL Practice Kit

Hands-on SQL practice for WGU **D427 Data Management – Applications**, run against a real MySQL 8.4 server in a container.

85 exercises cover the D427 skills: querying, built-in functions, aggregation, joins, subqueries, inserting/updating/deleting data, creating and altering tables with constraints, views, indexes, and turning a design into tables. The final section is a 12-task mock assessment written in the style of the OA's lab items (Horse / Student / LessonSchedule).

## What's in this folder

| File | Purpose |
|---|---|
| `README.md` | This file: setup, how to work through the exercises, troubleshooting. |
| `setup.sql` | Builds the `d427` database and loads the sample data. Re-run it any time to reset. |
| `exercises.md` | The exercises. Each one lists the expected row count so you can check yourself. |
| `solutions.sql` | One worked answer per exercise, labeled `-- [1.1]`, `-- [5.3]`, etc., with notes on the common traps. |

## Requirements

- Docker (Docker Desktop, Docker Engine, or Podman; see the Podman note below)
- About 600 MB of disk for the MySQL image
- Port 3306 free on your machine (only needed if you want to connect from a GUI tool)

The `mysql:8.4` image runs on both x86_64 and ARM64 (Apple Silicon).

## Setup

Run these commands from inside this folder.

### 1. Pull the MySQL image

```bash
docker pull mysql:8.4
```

### 2. Start the container

```bash
docker run -d --name d427 \
  -e MYSQL_ROOT_PASSWORD=d427pass \
  -p 3306:3306 \
  -v "$PWD":/work \
  mysql:8.4
```

- `--name d427` lets you refer to the container by name in the commands below.
- `MYSQL_ROOT_PASSWORD` sets the root password. It's a throwaway practice password; change it if you like and substitute it everywhere below.
- `-p 3306:3306` exposes MySQL to your machine for GUI clients.
- `-v "$PWD":/work` mounts this folder inside the container at `/work`, so the client can read `setup.sql` directly.

### 3. Wait for MySQL to finish initializing

The first start takes 15–60 seconds. MySQL starts a temporary server during initialization, then restarts, so wait for the real one (the line that reports `port: 3306`):

```bash
until docker logs d427 2>&1 | grep -q "ready for connections.*port: 3306"; do sleep 2; done; echo "MySQL is ready"
```

### 4. Load the practice database

```bash
docker exec -i -e MYSQL_PWD=d427pass d427 mysql -uroot < setup.sql
```

Passing the password through `MYSQL_PWD` avoids the "using a password on the command line is insecure" warning.

### 5. Connect and check

```bash
docker exec -it -e MYSQL_PWD=d427pass d427 mysql -uroot d427
```

At the `mysql>` prompt:

```sql
SHOW TABLES;
SELECT COUNT(*) FROM Employee;   -- should return 15
```

You should see seven tables: `Department`, `Employee`, `Horse`, `LessonSchedule`, `Movie`, `Rating`, `Student`.

## Day-to-day use

| Task | Command |
|---|---|
| Open a SQL prompt | `docker exec -it -e MYSQL_PWD=d427pass d427 mysql -uroot d427` |
| Reset the data from inside the prompt | `SOURCE /work/setup.sql;` |
| Reset the data from your shell | `docker exec -i -e MYSQL_PWD=d427pass d427 mysql -uroot < setup.sql` |
| Run a whole file of your own answers | `docker exec -i -e MYSQL_PWD=d427pass d427 mysql -uroot -t d427 < my-answers.sql` |
| Stop the container (data is kept) | `docker stop d427` |
| Start it again | `docker start d427` |
| Remove it completely | `docker rm -f d427` |

Handy commands at the `mysql>` prompt:

- `DESCRIBE Employee;` shows a table's columns and types.
- `SHOW CREATE TABLE Employee\G` shows the full definition including constraints and foreign keys.
- Ending a query with `\G` instead of `;` prints each row vertically, which helps with wide results.
- `SHOW WARNINGS;` explains a statement that reported warnings.

### Connecting from a GUI (optional)

MySQL Workbench, DBeaver, DataGrip, or the VS Code MySQL extension can connect with:

- Host: `127.0.0.1` (use this rather than `localhost`, which some clients treat as a local socket)
- Port: `3306`
- User: `root`
- Password: `d427pass`
- Database: `d427`

### Podman

Every command above works with `podman` in place of `docker`. On SELinux systems (Fedora, RHEL, Rocky), add `:Z` to the volume so the container can read the folder: `-v "$PWD":/work:Z`.

## The practice database

`setup.sql` creates three small schemas in one database:

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

The data includes edge cases on purpose, because that's where SQL answers most often go wrong:

- an employee with no department, and a department with no employees
- a movie whose attributes are all NULL, and a rating no movie uses
- a horse with no lessons, a student with no lessons, and a lesson slot with no student

## Working through the exercises

| Section | Topic | Changes data? |
|---|---|---|
| 1 | SELECT basics, ORDER BY, LIMIT, aliases | No |
| 2 | WHERE: BETWEEN, IN, LIKE, NULL, AND/OR | No |
| 3 | Built-in string, date, and numeric functions; CASE | No |
| 4 | Aggregates, GROUP BY, HAVING | No |
| 5 | Joins: inner, outer, self, anti-join, full outer emulation | No |
| 6 | Subqueries: scalar, IN, correlated, EXISTS, derived tables | No |
| 7 | INSERT, UPDATE, DELETE, transactions, FK actions | Yes |
| 8 | CREATE / ALTER / DROP TABLE, constraints | Yes |
| 9 | Views and indexes | Yes |
| 10 | Design and normalization to tables | Yes |
| 11 | Mock assessment (12 tasks, about 60 minutes) | Yes |

A few rules keep the expected row counts accurate:

1. **Work sections 1–10 in order.** Sections 7–10 change data and schema, and later exercises assume the earlier ones were done.
2. **Reload `setup.sql` before Section 11.** The mock assessment starts from fresh data.
3. **If you get lost, reset.** Re-running `setup.sql` rebuilds everything from scratch. To pick up in the middle of Section 7–10, reset and then run the earlier solutions from `solutions.sql` to bring the data back to that point.
4. **Check your row count before looking at the answer.** A wrong count usually means a NULL or join issue; the hint in the exercise often points at which one.

Some exercises are meant to fail so you can read the error (for example, deleting a parent row that other rows still reference). In `solutions.sql` those statements are commented out with the expected error shown.

## Troubleshooting

**`port is already allocated` when starting the container.** Something else is using 3306 (often a local MySQL). Map a different host port, such as `-p 3307:3306`, and use port 3307 in GUI clients. The `docker exec` commands are unaffected.

**`ERROR 2002: Can't connect to local MySQL server through socket`** right after starting. MySQL is still initializing; run the wait command in step 3.

**`ERROR 1045: Access denied for user 'root'`.** The password doesn't match the one the container was created with. The password is only set the first time the container is created, so if you changed it, run `docker rm -f d427` and start over from step 2.

**`ERROR 1055 ... incompatible with sql_mode=only_full_group_by`.** MySQL 8 requires every non-aggregated column in the SELECT list to appear in GROUP BY. That's the behavior D427 expects, so fix the query rather than changing the server setting.

**`Failed to open file '/work/setup.sql'`** when using `SOURCE`. The folder wasn't mounted. Recreate the container with the `-v "$PWD":/work` option, running the command from this folder.

**Starting completely over.** `docker rm -f d427`, then repeat steps 2–4.
