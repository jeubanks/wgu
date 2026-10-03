-- =====================================================================
-- D427 Data Management - Applications : practice database
-- Run:  mysql -uroot -p < setup.sql      (safe to re-run; it rebuilds)
-- =====================================================================
DROP DATABASE IF EXISTS d427;
CREATE DATABASE d427;
USE d427;

-- ---------------------------------------------------------------------
-- Company schema: Department / Employee (self-referencing manager)
-- ---------------------------------------------------------------------
CREATE TABLE Department (
  DeptID     INT          PRIMARY KEY,
  DeptName   VARCHAR(40)  NOT NULL UNIQUE,
  Budget     DECIMAL(12,2),
  Location   VARCHAR(40)
);

CREATE TABLE Employee (
  EmpID      INT           AUTO_INCREMENT PRIMARY KEY,
  FirstName  VARCHAR(30)   NOT NULL,
  LastName   VARCHAR(30)   NOT NULL,
  Email      VARCHAR(60)   UNIQUE,
  Salary     DECIMAL(10,2) NOT NULL,
  HireDate   DATE          NOT NULL,
  DeptID     INT,
  ManagerID  INT,
  FOREIGN KEY (DeptID)    REFERENCES Department(DeptID) ON DELETE SET NULL,
  FOREIGN KEY (ManagerID) REFERENCES Employee(EmpID)
);

INSERT INTO Department VALUES
 (10, 'Engineering', 1500000.00, 'Reston'),
 (20, 'Sales',        800000.00, 'Denver'),
 (30, 'Support',      450000.00, 'Reston'),
 (40, 'Finance',      300000.00, 'New York'),
 (50, 'Research',     950000.00, NULL),
 (60, 'Legal',        250000.00, 'New York');   -- no employees (outer-join practice)

INSERT INTO Employee (EmpID, FirstName, LastName, Email, Salary, HireDate, DeptID, ManagerID) VALUES
 (1,  'Grace',   'Hopper',   'ghopper@corp.example',  210000, '2012-03-15', 10, NULL),
 (2,  'Alan',    'Turing',   'aturing@corp.example',  165000, '2015-07-01', 10, 1),
 (3,  'Ada',     'Lovelace', 'alovelace@corp.example',158000, '2016-01-11', 10, 1),
 (4,  'Linus',   'Torvalds', NULL,                     142000, '2019-09-23', 10, 2),
 (5,  'Margaret','Hamilton', 'mhamilton@corp.example',149500, '2018-05-30', 50, 1),
 (6,  'Dennis',  'Ritchie',  'dritchie@corp.example', 131000, '2020-02-17', 50, 5),
 (7,  'Barbara', 'Liskov',   'bliskov@corp.example',  175000, '2014-11-03', 20, NULL),
 (8,  'Ken',     'Thompson', 'kthompson@corp.example', 98000, '2021-06-14', 20, 7),
 (9,  'Frances', 'Allen',    'fallen@corp.example',    91000, '2022-08-01', 20, 7),
 (10, 'John',    'Backus',   NULL,                      72000, '2023-01-09', 30, 7),
 (11, 'Radia',   'Perlman',  'rperlman@corp.example',   76500, '2017-04-18', 30, 10),
 (12, 'Edsger',  'Dijkstra', 'edijkstra@corp.example',  68000, '2024-03-04', 30, 10),
 (13, 'Katherine','Johnson', 'kjohnson@corp.example',  118000, '2013-10-21', 40, NULL),
 (14, 'Donald',  'Knuth',    'dknuth@corp.example',    104000, '2019-12-02', 40, 13),
 (15, 'Hedy',    'Lamarr',   'hlamarr@corp.example',    88000, '2025-02-10', NULL, 1); -- no department

-- ---------------------------------------------------------------------
-- Riding stable schema (mirrors the style of D427 lab/assessment items)
-- ---------------------------------------------------------------------
CREATE TABLE Horse (
  ID              SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  RegisteredName  VARCHAR(15) NOT NULL,
  Breed           VARCHAR(20) CHECK (Breed IN ('Egyptian Arab','Holsteiner','Quarter Horse','Paint','Saddlebred')),
  Height          DECIMAL(3,1) CHECK (Height BETWEEN 10.0 AND 20.0),
  BirthDate       DATE CHECK (BirthDate >= '2015-01-01')
);

CREATE TABLE Student (
  ID         SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  FirstName  VARCHAR(20) NOT NULL,
  LastName   VARCHAR(30) NOT NULL,
  Street     VARCHAR(50),
  City       VARCHAR(20),
  State      CHAR(2) DEFAULT 'TX',
  Zip        MEDIUMINT UNSIGNED,
  Phone      CHAR(10),
  Email      VARCHAR(30) UNIQUE
);

CREATE TABLE LessonSchedule (
  HorseID         SMALLINT UNSIGNED NOT NULL,
  StudentID       SMALLINT UNSIGNED,
  LessonDateTime  DATETIME NOT NULL,
  PRIMARY KEY (HorseID, LessonDateTime),
  FOREIGN KEY (HorseID)   REFERENCES Horse(ID)   ON DELETE CASCADE,
  FOREIGN KEY (StudentID) REFERENCES Student(ID) ON DELETE SET NULL
);

INSERT INTO Horse (ID, RegisteredName, Breed, Height, BirthDate) VALUES
 (1, 'Babe',         'Quarter Horse', 15.3, '2015-02-10'),
 (2, 'Independence', 'Holsteiner',    16.0, '2017-03-13'),
 (3, 'Ellie',        'Saddlebred',    15.0, '2016-12-22'),
 (4, 'Champion',     'Paint',         14.2, '2019-05-02'),
 (5, 'Blue Ribbon',  NULL,            NULL, '2018-04-27'),
 (6, 'Sacred Stone', 'Egyptian Arab', 14.9, '2020-07-08'),
 (7, 'Prince',       'Quarter Horse', 15.7, '2021-03-30'),
 (8, 'Lady Luck',    'Holsteiner',    16.5, '2017-08-19'),
 (9, 'Midnight',     'Paint',         15.1, NULL),
 (10,'Not Ready',    'Saddlebred',    13.9, '2023-01-15');   -- no lessons

INSERT INTO Student (ID, FirstName, LastName, Street, City, State, Zip, Phone, Email) VALUES
 (1, 'Rosie',  'Hewitt',   '1 Main St',      'Austin',      'TX', 78701, '5125550101', 'rosie@example.com'),
 (2, 'Jamal',  'Carter',   '22 Oak Ave',     'Round Rock',  'TX', 78664, '5125550102', 'jamal@example.com'),
 (3, 'Priya',  'Nair',     '300 Elm Blvd',   'Austin',      'TX', 78702, '5125550103', NULL),
 (4, 'Miguel', 'Santos',   '45 Pine Rd',     'San Marcos',  'TX', 78666, NULL,         'miguel@example.com'),
 (5, 'Hannah', 'Becker',   '9 Cedar Ln',     'Tulsa',       'OK', 74103, '9185550105', 'hannah@example.com'),
 (6, 'Liam',   'O''Brien', '77 Birch Ct',    'Austin',      'TX', 78704, '5125550106', 'liam@example.com'),
 (7, 'Sofia',  'Rossi',    NULL,             NULL,          'NM', NULL,  '5055550107', 'sofia@example.com'),
 (8, 'Noah',   'Kim',      '12 Maple Dr',    'Round Rock',  'TX', 78665, '5125550108', 'noah@example.com');  -- no lessons

INSERT INTO LessonSchedule (HorseID, StudentID, LessonDateTime) VALUES
 (1, 1, '2026-02-01 09:00:00'),
 (1, 2, '2026-02-01 11:00:00'),
 (2, 1, '2026-02-02 10:00:00'),
 (3, 3, '2026-02-02 13:00:00'),
 (4, 4, '2026-02-03 09:00:00'),
 (5, 5, '2026-02-03 15:00:00'),
 (6, 2, '2026-02-04 08:30:00'),
 (6, NULL, '2026-02-04 14:00:00'),   -- open slot, no student assigned
 (7, 6, '2026-02-05 16:00:00'),
 (8, 7, '2026-02-06 10:00:00'),
 (2, 3, '2026-02-07 12:00:00'),
 (9, 1, '2026-02-08 09:30:00');

-- ---------------------------------------------------------------------
-- Movie schema (lookup table + NULL foreign key)
-- ---------------------------------------------------------------------
CREATE TABLE Rating (
  RatingCode         CHAR(5)     PRIMARY KEY,
  RatingDescription  VARCHAR(40) NOT NULL
);

CREATE TABLE Movie (
  ID          SMALLINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  Title       VARCHAR(60) NOT NULL,
  Genre       VARCHAR(20),
  RatingCode  CHAR(5),
  ReleaseYear SMALLINT,
  Minutes     SMALLINT,
  Gross       DECIMAL(12,2),
  FOREIGN KEY (RatingCode) REFERENCES Rating(RatingCode)
);

INSERT INTO Rating VALUES
 ('G',     'General audiences'),
 ('PG',    'Parental guidance suggested'),
 ('PG-13', 'Parents strongly cautioned'),
 ('R',     'Restricted'),
 ('NC-17', 'Adults only');   -- no movies use it

INSERT INTO Movie (ID, Title, Genre, RatingCode, ReleaseYear, Minutes, Gross) VALUES
 (1,  'Rogue One',              'Sci-Fi',    'PG-13', 2016, 133, 532177324),
 (2,  'Inside Out',             'Animation', 'PG',    2015,  95, 356461711),
 (3,  'The Martian',            'Sci-Fi',    'PG-13', 2015, 144, 228433663),
 (4,  'Toy Story',              'Animation', 'G',     1995,  81, 191796233),
 (5,  'The Shawshank Redemption','Drama',    'R',     1994, 142,  28341469),
 (6,  'Arrival',                'Sci-Fi',    'PG-13', 2016, 116, 100546139),
 (7,  'Spirited Away',          'Animation', 'PG',    2001, 125,  10055859),
 (8,  'Parasite',               'Thriller',  'R',     2019, 132,  53369749),
 (9,  'Hidden Figures',         'Drama',     'PG',    2016, 127, 169607287),
 (10, 'Interstellar',           'Sci-Fi',    'PG-13', 2014, 169, 188020017),
 (11, 'The Godfather',          'Drama',     'R',     1972, 175, 134966411),
 (12, 'Untitled Indie Project', NULL,        NULL,    NULL,  NULL, NULL);
