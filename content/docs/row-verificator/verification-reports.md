---
pageTitle: Understand the reports Replicate Row Verificator generates
title: Generated reports
description: "Learn about the reports Replicate Row Verificator generates."
weight: 10
---

# Generated reports
This section discusses the reports Replicate Row Verificator generates after a verification process. 

## Generated files
The Verificator generates the following files:

### In `verify` mode

<dl class="dl-indent">
<dt>

`RowCount-Match`
</dt>
<dd>
Lists tables whose row-counts match along with each table's row-count. Each table in this list possesses the same name as the corresponding source table name.
</dd>

<dt>

`RowCount-Match-Success`
</dt>
<dd>

Lists tables whose row-counts match _and_ holds the same identical data. The list also contains the row-count of each table like [`RowCount-Match`](#1-rowcount-match). Each table in this list possesses the same name as the corresponding source table name.
</dd>

<dt>

`RowCount-NoMatch`
</dt>
<dd>
Contains those tables whose row-counts do not match. The Verificator lists both source and target table names with their individual row-counts.
</dd>

<dt>

`verification_summary`
</dt>
<dd>

This file represents the final dashboard that you see in the CLI.


`verification_summary` contains the following details: 

- A summary of the number of rows in source and target.
- Status about whether or not all source and target rows match. 
- Count of source or target exclusive rows.
- Count of changed rows for all tables.
- Count of rows that the Verificator fails to verify.
</dd>
</dl>

### In `delta-verify` mode

The `delta-verify` mode creates the file `Missing-rows` in the `data/` directory of [your Verificator download folder]({{< relref "setup-guide#6-get-the-verificator-release" >}}). The path for that file is `data/VERIFICATION_ID/reports/`, where `VERIFICATION_ID` represents [the specific ID for the verification job]({{< relref "verification-id" >}}). The file follows an identical structure of what you see on the [Verificator dashboard]({{< relref "dashboard" >}}):

<dl class="dl-indent">
<dt>

Table name
</dt>
<dd>

Lists the target database tables that contain missing rows.
</dd>

<dt>

Start timestamp
</dt>
<dd>

The timestamp the Verificator starts checking for row changes and verification for a table.
</dd>
<dt>

End timestamp
</dt>
<dd>
The timestamp the Verificator stops checking for row changes and verification for a table.
</dd>
<dt>

Missing primary keys
</dt>
<dd>

Lists all the missing primary keys in the corresponding table.
</dd>
</dl>

The following example shows one record of a `delta-verify` report:

```
catalog.table   2022-12-20 21:13:01.0   2023-01-23 12:05:17.0   [8,9,11]
```
## Generated folders
The Verificator creates folders for each table. The name of each folder follows the name as the corresponding source table name.

Each folder contains the following files. In the following file names, `SRC_DB` and `DST_DB` corresponds to the source and destination database names respectively.

### In `verify` mode

<dl class="dl-indent">
<dt>

`SRC_DB_exclusive`
</dt>
<dd>
It contains rows/ records which are exclusively present in the table of the source database.  Only values of row-identifier keys are printed and for other columns placeholder “V“ is used.
</dd>

<dt>

`DST_DB_exclusive`
</dt>
<dd>

Contains the exclusive rows or records that in the table of the target database. Only values of `row-identifier-key`s are printed. For other columns, the Verificator uses `V` as placeholder.
</dd>

<dt>

`changed_rows` *[v21.02.22.1]*
</dt>
<dd>

A CSV file. It contains rows or records having the same `row-identifier-key`, but different value for some other column value. 

The file always contains the key or `row-identifier-key` columns. The file also contains the mismatched column values. The file prints the matched column values as `M`, and adds a newline as separator between each pair. 
</dd>
<dt>

`skipped_rows` *[v21.02.22.1]*
</dt>
<dd>

A CSV file. Contains those rows or records that the Verificator fails to process. 

For every row that the Verificator fails to process, corresponding source or target row pair the key/row-identifier-key columns are printed. For all other columns, the file uses `V` as the placeholder. The file adds a newline as separator between each pair.
</dd>

### In `delta-verify` mode
The `delta-verify` mode creates reports of each verification job in the `data/` directory 
of [your Verificator download folder]({{< relref "setup-guide#6-get-the-verificator-release" >}}). Each report lives in the path `data/VERIFICATION_ID/reports/`, where `VERIFICATION_ID` represents [the specific ID for the verification job]({{< relref "verification-id" >}}).