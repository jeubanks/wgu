# Spec-to-type drill

[← Exercise index](exercises.md) · [SQL quick reference](quick-reference.md)

The D427 practice tests describe each column in words, like *"integer with range 0 to 65 thousand, not NULL, default 0"*, and you turn that into SQL. This drill gives you random practice in that wording, in two modes:

- **Column types:** integer ranges near each type's limits (signed and unsigned), decimals, fixed- and variable-length strings, and dates. Type the type, press **Check** (or Enter), and read why.
- **Constraint wording:** phrases like *"must be one of ..."*, *"default 'TX'"*, or *"must not be deletable"*. Pick the SQL they turn into.

<div id="spec-drill" class="spec-drill" markdown>

*The drill runs on the [website](https://jeubanks.github.io/wgu/d427/drill/). Here are some to try on paper:*

| Column spec | Type |
|---|---|
| integer with range 0 to 300 | `SMALLINT UNSIGNED` (300 is past TINYINT's 255) |
| integer with range -128 to 127 | `TINYINT` |
| integer with range 0 to 70 thousand | `MEDIUMINT UNSIGNED` (past SMALLINT's 65,535) |
| decimal value up to $9,999.99, with 2 digits for cents | `DECIMAL(6,2)` |
| variable-length string with max 40 chars | `VARCHAR(40)` |

</div>

Answers are matched the way you'd write them: case and spaces don't matter, and `INTEGER` / `NUMERIC` count the same as `INT` / `DECIMAL`. Each mode keeps its own score and streak, saved in this browser only. For the rules behind each answer, see [Reading a column spec](quick-reference.md#reading-a-column-spec) in the SQL quick reference.
