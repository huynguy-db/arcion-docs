---
pageTitle: General configuration for Replicate Row Verificator
title: General Configuration
description: "Set up a general configuration to use Replicate Row Verificator."
weight: 3
---

# General configuration for Replicate Row Verificator
Use the following parameters to configure how the Row Verificator operates. You can find a sample configuration `general.yaml` in the `conf/general/` directory of your Row Verificator download.

## `threads`
The number of threads the Verificator uses.

## `global-decimal-scale`
The number of digits after the decimal point that the Verificator must verify for decimal values. The Verificator uses this value for all decimal columns. You can also specify this parameter at table-column level. In that case, the table-level `globa-decimal-scale` value overrides this global `global-decimal-scale` value.

_Default: `0`._

## `global-microsecond-precision`
The number of digits of microsecond value the Verificator verifies for timestamp values. The Verificator uses this value for all timestamp columns and decimal columns. The default value is 0. You can also specify this parameter at table-column level. In that case, the table-level `global-microsecond-precision` value overrides this global `global-microsecond-precision` value.

_Default: `0`._

## `storage-location`
The directory where the Verificator stores reports. If you don't set this parameter, the Verificator creates a directory `report` inside `data/VERIFICATOR_ID/ directory`. <!-- TODO: LINK TO VERIFICATOR_ID DOCS - >

## `src-global-condition`
A particular `WHERE` clause that can apply to all source tables when loading data into filter rows. Use the clause directly. You don't need to include _`WHERE`_. 

The data filters through the rules you specify in [the filter configuration file]. After this filtering process, the Verificator applies the `WHERE` clause on that data.

## `dst-global-condition`
Same as [`src-global-condition](#src-global-condition) for target tables.

## `max-rows-in-report`
The maximum number of unmatched rows that the Verificator can store in report files. If you want to see all unmatched rows, do not set this parameter or set it to `0`.

_By default, supports unlimited number of unmatched rows._

## `trace-level` _[v21.02.22.1]_
The verbosity level of the trace. You can set the following verbosity levels: 
- `ALL`
- `DEBUG`
- `INFO`
- `WARN`
- `ERROR`
- `FATAL`
- `OFF` 

_Default: `INFO`._

## `data-dir` 
The location of the data directory where the Verificator stores trace file.

_Default: `BASE_DIR/REPLICATION_ID/`._

## `verification-summary-file-name` _[v21.03.18.1]
Name of the verification summary file.

_Default: `verification_summary.txt`._

## `src-varchar-expr` _[v21.02.24.1]_
An expression to use on VARCHAR columns.

You can use any expression on all VARCHAR columns. The Verificator uses these columns in the order-by list during data extraction. The expression follows this format:

```sql
LOWER($) , TRIM(ISNULL($, ‘ ’))
```

During execution, the actual VARCHAR column name replaces the `$` character in the preceding format. If you write only `$`, then the default column is used without any wrapping. 

By default, a database-specific version of the following format is used:

```sql	
CONVERT(VARBINARY(max), TRIM(ISNULL($, ' ')))
```

## `dst-varchar-expr` _[v21.02.24.1]_
Same as [`src-varchar-expr`](#src-varchar-expr-v2102241) for target database.

## `global-check-row-count-only`
`true` or `false`.

If `true`, the Verificator only verifies if it finds the number of rows equal in both source and target database. If `false`, the Verificator follows the default behavior and compares every column of every row.

## `check-row-count-only`
Behaves in the same manner as [`global-check-row-count-only`](#global-check-row-count-only). However, you can only use it for a per-table basis. If you set this parameter at table level, the table-level value overrides the global value of  [`global-check-row-count-only`](#global-check-row-count-only).

## `global-delta-verify-key`
Timestamp column that holds the CREATE DATE value. The Verificator uses this value for all tables.

## `global-delta-verify–interval-ms`
The millisecond interval when verificator checks for inserted rows. The Verificator uses this value for all tables.

## `src-per-table-config`
Parameter to specify configurations for each table and column, facilitating the comparison process. You only need to specify this parameter for source tables and columns. The Verificator automatically maps the source tables and columns for destination.

<dl class="dl-indent">
<dt><code>catalog</code></dt>
<dd>
The source catlog name.
</dd>
<dt><code>schema</code></dt>
<dd>
The source schema name.
</dd>

<dt><code>tables</code></dt>
<dd>
You can specify multiple source tables under this section using the following parameters:

<dl class="dl-indent">
<dt><code>row-identifier-key</code></dt>
<dd>
List of column(s) that can order the source table. These columns can be primary keys or any set of keys that uniquely identifies each row. The Verificator maps these columns using [the mapper configuration file](LINK_TO_MAPPER_FILE) to the target table. The Verificator also uses identical columns on the target so that it's possible to order both tables on the same sets of columns. </dd>

<dt><code>priority</code></dt>
<dd>
An integer value. Sets the verification priority.

You can set `priority` for every table to prioritize those tables in the verification process. The greater the value of `priority` for a table, the higher the chance for the Verificator to verify that table. 

_Default: `0`._ </dd>

<dt><code>per-column-config</code> (optional)</dt>
<dd>
Specifies configuration for each column in a table.

Every table contains an associated `per-column-config`. This is an optional parameter.

<dl class="dl-indent">
<dt><code>decimal-scale</code></dt>
<dd>
The local decimal scale value for a particular column. 

If you set this parameter, the Verificator prefers this value over [global-decimal-scale](#global-decimal-scale). </dd>

<dt><code>microsecond-precision</code><dt>
<dd>
The local microsecond precision value for a particular column. 

If you set this parameter, the Verificator prefers this value over [global-decimal-scale](#global-decimal-scale).</dd>

<dt><code>src-expr</code> <i>v[21.03.18.1]</i><dt>
<dd>

SQL expression to wrap source column name in SELECT statement. The SQL expression follows this format:

```SQL
to_date($,'YYYY-MM_DD')
```

In the preceding format, the source column name replaces the `$` character. By default, raw column name is used.</dd>

<dt><code>dst-expr</code> <i>v[21.03.18.1]</i><dt>
<dd>

SQL expression to wrap target column name in SELECT statement. The SQL expression follows the same format as `src-expr`.</dd>

<dt><code>check-row-count-only</code></dt> 
<dd>

Functions exactly like the preceding parameter but applies to each table.</dd>

<dt><code>delta-verify-key</code></dt> 
<dd>

Timestamp column that holds the CREATE DATE value</dd>

<dt><code>delta-verify–interval-ms</code></dt> 
<dd>

Millisecond interval at which the Verificator checks for new rows.</dd>

</dd>

</dl>
</dd>

</dl>
