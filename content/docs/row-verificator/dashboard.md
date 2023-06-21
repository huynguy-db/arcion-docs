---
pageTitle: Learn about the Verificator dashboard 
title: Dashboard
description: "The Verificator shows important information on the dashboard about the verification process."
weight: 7
---

# Information dashboard
The Verificator generates a dashboard illustrating various pieces of data on the verification process. The dashboard contains the following columns:

## `verify` mode

<dl class="dl-indent">
<dt>

`SOURCE_DATABSE_NAME`
</dt>
<dd>

Lists all the source database tables that the Verificator has verified. The column 
name depends on the source database name—for example, `SQLSERVER`.
</dd>
<dt>

`TARGET_DATABSE_NAME`
</dt>
<dd>

Lists all the target database tables that the Verificator has verified against respective source database tables. The column name depends on the target database—for example, `SINGLESTORE`.
</dd>

<dt>

`Src Total`
</dt>
<dd>
Lists all the rows in the corresponding table of the source database.
</dd>
<dt>

`Dst Total`
</dt>
<dd>
Lists all the rows in the corresponding table of the target database.
</dd>

<dt>

`Success`
</dt>
<dd>

Represents the success value for the verification of each corresponding source and target database tables.

<dl class="dl-indent">
<dt>&#10004;</dt>
<dd>The Verificator has found identical data across the source and target database tables.</dd>
<dt>&#10007;</dt>
<dd>The Verificator has found data mismatches across source and the target database tables.</dd>
<dt>-</dt>
<dd>The Verificator has only performed row-count matching for the source and target database tables.</dd>
</dl>

</dd>

<dt>

`Matches`
</dt>
<dd>Lists the row-count matches.</dd>

<dt>

`Src Excl`
</dt>
<dd>
Number of source-exclusive rows. These rows exist on the source database but not on the target database.
</dd>

<dt>

`Dst Excl`
</dt>
<dd>
Number of target-exclusive rows. These rows exist on the target database but not on the source database.
</dd>

<dt>

`Changed`
</dt>
<dd>
A particular primary key exists on both source and target database but some of the column values have changed. This column lists the number of those changes.
</dd>
<dt>

`Skipped`
</dt>
<dd>
Shows how many rows the Verificator has skipped due to processing problems.
</dd>
</dl>

## `delta-verify` mode
<dl class="dl-indent">
<dt>

`SOURCE_DATABSE_NAME`
</dt>
<dd>

Lists all the source database tables that the Verificator has verified. The column 
name depends on the source database name—for example, `SQLSERVER`.
</dd>
<dt>

`TARGET_DATABSE_NAME`
</dt>
<dd>

Lists all the target database tables that the Verificator has verified against respective source database tables. The column name depends on the target database—for example, `SINGLESTORE`.
</dd>

<dt>

`Curent Delta Window`
</dt>
<dd>

Shows the timestamp window the Verificator has completed verification for. For example, if the window value is `[06/20/2023 10:00, 06/20/2023 15:00]`, the Verificator has completed verification for all rows created or changed in that timeframe.
</dd>
<dt>

`Src Total`
</dt>
<dd>
Lists all the rows in the corresponding table of the source database.
</dd>
<dt>

`Dst Total`
</dt>
<dd>
Lists all the rows in the corresponding table of the target database.
</dd>
</dl>

If the Verificator finds mismatches in the row count, you can find more information on the missing rows in [the `Missing-rows` report file]({{< relref "verification-reports#in-delta-verify-mode" >}}).