# MySQL error decoder

[← Exercise index](exercises.md)

MySQL's error messages are short, and on the assessment you have to fix the statement on your own. Every error the exercises show (on purpose, or as a common mistake) is here: the message, what it means, and the usual fix. The number after `ERROR` is the quickest way to find yours.

The `'...'` in each message stands for the table, column, or value MySQL names in the real one.

<!-- errors -->
## Writing queries

### ERROR 1055

`Expression #n of SELECT list is not in GROUP BY clause and contains nonaggregated column '...' ... incompatible with sql_mode=only_full_group_by`

**What it means:** With GROUP BY, every column in SELECT must be grouped or inside an aggregate.

**Usual fix:** Add the column to GROUP BY, or wrap it in an aggregate. Don't change sql_mode: D427 expects this rule.

**Comes up in:** [Setup: Troubleshooting](README.md#troubleshooting)

### ERROR 1064

`You have an error in your SQL syntax; check the manual ... near '...'`

**What it means:** MySQL couldn't parse the statement. The text after `near` is where it got confused.

**Usual fix:** Look just before the quoted text: a missing comma, an unclosed parenthesis or quote, a misspelled keyword, or a reserved word used as a name (like `Order`).

### ERROR 1111

`Invalid use of group function`

**What it means:** An aggregate (COUNT, SUM, AVG...) is used where a single row's value is expected, usually in WHERE.

**Usual fix:** Filter on aggregates with HAVING, or compare with a subquery: `WHERE Cost > (SELECT AVG(Cost) FROM Book)`.

**Comes up in:** [3.10](01-queries.md), [4.8](01-queries.md), [12.6](03-assessment-drills.md)

### ERROR 1146

`Table '...' doesn't exist`

**What it means:** The table or view name isn't in the current database.

**Usual fix:** Check the spelling and the database (`USE d427;`), and that the table or view was created (or not dropped).

**Comes up in:** [9.2](02-changing-data.md), [9.4](02-changing-data.md)

### ERROR 1222

`The used SELECT statements have a different number of columns`

**What it means:** The SELECTs joined by UNION return different numbers of columns.

**Usual fix:** Make every SELECT in the UNION return the same columns, in the same order.

**Comes up in:** [T.7](later-advanced-sql.md)

## Changing data

### ERROR 1136

`Column count doesn't match value count at row 1`

**What it means:** An INSERT gives a different number of values than columns.

**Usual fix:** With no column list, give a value for every column in table order. Better: list the columns you're filling in.

**Comes up in:** [7.9](02-changing-data.md)

### ERROR 1364

`Field '...' doesn't have a default value`

**What it means:** An INSERT leaves out a NOT NULL column that has no DEFAULT.

**Usual fix:** Give the column a value, or give it a DEFAULT in the table definition.

**Comes up in:** [7.9](02-changing-data.md)

## Keys and constraints

### ERROR 1062

`Duplicate entry '...' for key '...'`

**What it means:** A row would repeat a value in a PRIMARY KEY or UNIQUE column.

**Usual fix:** Use a value that isn't taken. When adding a key to existing rows, fix the duplicates first.

**Comes up in:** [11.8](03-assessment-drills.md), [11.15](03-assessment-drills.md), [11.17](03-assessment-drills.md), [11.18](03-assessment-drills.md)

### ERROR 1075

`Incorrect table definition; there can be only one auto column and it must be defined as a key`

**What it means:** An AUTO_INCREMENT column isn't part of a key, or there are two of them.

**Usual fix:** Make the AUTO_INCREMENT column the primary key (or part of one). Remove AUTO_INCREMENT before changing that key.

**Comes up in:** [11.17](03-assessment-drills.md)

### ERROR 1264

`Out of range value for column '...' at row 1`

**What it means:** The value doesn't fit the column's type, like 300 in a TINYINT UNSIGNED (0 to 255) or -40 in any UNSIGNED column.

**Usual fix:** Pick the smallest type whose range covers every allowed value, signed if it can go below 0.

**Comes up in:** [11.21](03-assessment-drills.md), [11.22](03-assessment-drills.md)

### ERROR 3819

`Check constraint '...' is violated.`

**What it means:** A row fails a CHECK condition. Adding a CHECK also tests the rows already in the table.

**Usual fix:** Fix the value, or the rows that break the rule before adding it. Name constraints (`CONSTRAINT name CHECK (...)`) so they're easy to drop.

**Comes up in:** [11.1](03-assessment-drills.md), [11.6](03-assessment-drills.md), [11.10](03-assessment-drills.md), [11.11](03-assessment-drills.md)

### ERROR 3959

`Check constraint '...' uses column '...', hence column cannot be dropped or renamed.`

**What it means:** A CHECK refers to the column you're dropping or renaming.

**Usual fix:** Drop the CHECK first (`DROP CHECK name`; `SHOW CREATE TABLE` shows its name), change the column, then add the CHECK back.

**Comes up in:** [8.4](02-changing-data.md)

## Foreign keys

### ERROR 1451

`Cannot delete or update a parent row: a foreign key constraint fails (...)`

**What it means:** Other rows still point at the row you're deleting or changing, and the foreign key's rule is RESTRICT (also the default, when no rule is given).

**Usual fix:** Delete or change the child rows first, or give the foreign key ON DELETE CASCADE / SET NULL if that's what should happen.

**Comes up in:** [7.3](02-changing-data.md), [7.6](02-changing-data.md), [11.13](03-assessment-drills.md), [11.20](03-assessment-drills.md)

### ERROR 1452

`Cannot add or update a child row: a foreign key constraint fails (...)`

**What it means:** The foreign key value has no matching row in the parent table.

**Usual fix:** Add the parent row first, or use a value that exists. NULL is allowed if the column allows it.

**Comes up in:** [7.3](02-changing-data.md), [11.7](03-assessment-drills.md)

### ERROR 1822

`Failed to add the foreign key constraint. Missing index for constraint '...' in the referenced table '...'`

**What it means:** The referenced column isn't a primary key or unique (MySQL 8.0's wording).

**Usual fix:** Point the foreign key at the parent's primary key, or add a PRIMARY KEY or UNIQUE to that column first.

**Comes up in:** [11.9](03-assessment-drills.md)

### ERROR 1830

`Column '...' cannot be NOT NULL: needed in a foreign key constraint '...' SET NULL`

**What it means:** ON DELETE SET NULL needs a column that can hold NULL.

**Usual fix:** Remove NOT NULL from the foreign key column (`MODIFY col type`), then add the foreign key.

**Comes up in:** [11.3](03-assessment-drills.md)

### ERROR 3780

`Referencing column '...' and referenced column '...' in foreign key constraint '...' are incompatible.`

**What it means:** The foreign key column's type doesn't match the referenced column's, UNSIGNED included.

**Usual fix:** Give the foreign key column exactly the referenced column's type (for example both `SMALLINT UNSIGNED`).

**Comes up in:** [8.6](02-changing-data.md)

### ERROR 6125

`Failed to add the foreign key constraint. Missing unique key for constraint '...' in the referenced table '...'`

**What it means:** The same problem as 1822, in MySQL 8.4's wording: the referenced column isn't a primary key or unique.

**Usual fix:** Point the foreign key at the parent's primary key, or add a PRIMARY KEY or UNIQUE to that column first.

**Comes up in:** [11.9](03-assessment-drills.md)

## Views

### ERROR 1369

`CHECK OPTION failed '...'`

**What it means:** A change through a view WITH CHECK OPTION would make the row disappear from the view.

**Usual fix:** Change the row so it still matches the view's WHERE, or change the base table directly.

**Comes up in:** [T.7](later-advanced-sql.md)

## Connection

### ERROR 1045

`Access denied for user '...'@'...' (using password: YES)`

**What it means:** MySQL didn't accept the user name and password.

**Usual fix:** Use the password the server was set up with. With the Docker setup, it's the one the container was first created with.

**Comes up in:** [Setup: Troubleshooting](README.md#troubleshooting)

### ERROR 2002

`Can't connect to local MySQL server through socket '...'`

**What it means:** The client couldn't reach the server: it isn't running yet, or it's somewhere else.

**Usual fix:** Wait for the server to finish starting (see Setup, step 3), or connect to 127.0.0.1 and the right port.

**Comes up in:** [Setup: Troubleshooting](README.md#troubleshooting)
<!-- /errors -->
