*[DDL]: Data Definition Language: statements that create, change, or remove database objects (CREATE, ALTER, DROP, TRUNCATE).
*[DML]: Data Manipulation Language: statements that work with the rows in tables (INSERT, UPDATE, DELETE, and often SELECT).
*[DQL]: Data Query Language: SELECT. zyBooks files it separately; many sources group it with DML.
*[PK]: Primary key: the column (or columns) whose value is different for every row and identifies it. Never NULL.
*[FK]: Foreign key: a column that holds a value of another table's primary key, linking the two rows.
*[CHECK]: CHECK constraint: a condition every row must meet, like CHECK (Price >= 0). A row that fails it is rejected.
*[UNIQUE]: UNIQUE constraint: no two rows can have the same value in the column. NULLs are allowed, and several rows can be NULL.
*[AUTO_INCREMENT]: MySQL gives each new row the next whole number in this column, so you don't have to supply it.
*[cardinality]: How many rows on each side of a relationship can be linked: one-to-one, one-to-many, or many-to-many.
*[Cardinality]: How many rows on each side of a relationship can be linked: one-to-one, one-to-many, or many-to-many.
*[unary]: A relationship between an entity and itself, like an employee who manages other employees.
*[Unary]: A relationship between an entity and itself, like an employee who manages other employees.
*[ternary]: A relationship that links three entities at once, like a supplier supplying a part to a project.
*[Ternary]: A relationship that links three entities at once, like a supplier supplying a part to a project.
*[entity]: A person, place, thing, or event you store data about. Each entity becomes a table.
*[ER diagram]: Entity-relationship diagram: a drawing of the entities, their attributes, and the relationships between them.
*[subquery]: A query nested inside another query, in parentheses.
*[correlated subquery]: A subquery that uses a column from the outer query, so it runs again for each outer row.
*[self-join]: A join of a table with itself, using two aliases (like Employee E and Employee M).
*[cross join]: Every row of one table paired with every row of the other: 5 rows × 4 rows = 20 rows.
*[materialized view]: A view whose results are stored like a table and must be refreshed when the base tables change. MySQL doesn't have them.
*[aggregate function]: A function that turns many rows into one value: COUNT, SUM, AVG, MIN, MAX. All except COUNT(*) skip NULLs.
*[composite primary key]: A primary key made of two or more columns together.
*[linking table]: A table that turns a many-to-many relationship into two one-to-many ones. It holds a foreign key to each side.
*[schema]: The structure of a database: its tables, columns, data types, and constraints. In MySQL, also another word for a database.
*[InnoDB]: MySQL's default storage engine. It supports transactions and enforces foreign keys.
*[normalization]: Splitting tables so each fact is stored once, which avoids update, insert, and delete anomalies.
*[2NF]: Second normal form: 1NF, and every non-key column depends on the whole primary key, not just part of it.
*[3NF]: Third normal form: 2NF, and no non-key column depends on another non-key column.
*[sparse index]: An index with one entry per block of rows (not per row). The table must be sorted on the indexed column.
