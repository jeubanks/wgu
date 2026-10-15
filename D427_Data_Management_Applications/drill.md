# Spec-to-type drill

[← Exercise index](exercises.md) · [Cheat sheet](cheatsheet.md)

The assessment describes each column in words, like *"integer with range 0 to 65 thousand"*, and you choose the MySQL type. This drill gives you endless random specs in that wording to practice on: integer ranges near each type's limits (signed and unsigned), decimals, fixed- and variable-length strings, and dates. Type the type, press **Check** (or Enter), and read why.

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

Answers are matched the way you'd write them: case and spaces don't matter, and `INTEGER` / `NUMERIC` count the same as `INT` / `DECIMAL`. Your score and streak are saved in this browser only. For the rules behind each answer, see [Reading a column spec](cheatsheet.md#reading-a-column-spec) on the cheat sheet.
