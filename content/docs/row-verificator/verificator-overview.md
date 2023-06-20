---
pageTitle: Row Verificator
title: Overview
description: "Use Arcion's row verification software to verify snapshot data and find missing primary keys on target among JDBC-compliant databases."
weight: 1
---

# Replicate Row Verificator
Arcion provides a row validation software that allows you to verify snapshot data among JDBC-compliant databases.

## Overview
The Verificator compares the matching records across both sides using standard database techniques that allows the Verificator to work in a memory-friendly manner. 

The Verificator works well for tables with primary keys. If a table doesn't possess a primary key, you need to provide `row-identifier-key` columns for the table in the general configuration. `row-identifier-key` columns for a table logically identifies unique rows in that table. Make sure to provide the same column ordering for both source and target database so that the Verificator can match both sides with identical parameters. If a table doesn't possess any primary key and you don't supply a `row-identifier-key` for such a table, the Verificator only reports row count mismatches for that table.

The Verificator can operate in two modes:

<dl class="dl-indent">
<dt>

`verify`
</dt>
<dd>

This mode verifies snapshot data among JDBC-compliant databases _offline_. Offline means that both source and target databases must stay in read-only mode. This ensures that source doesn't continuously get insert, update, or delete operations. The data in source database must remain constant while the Verificator performs verification.


</dd>
<dt>

`delta-verify`
</dt>
<dd>

Unlike `verify` mode, this mode works in a continuous manner and doesn't require the databases to stay offline. In this mode, the Verificator waits for new rows and checks for corresponding missing data on the target database.

This mode depends on a timestamp column that holds the value for CREATE DATE for that row. The Verificator compares primary keys for any new rows if the row count for the range of the CREATE COLUMN column does not match.
</dd>
</dl>

## Supported pipelines

### `verify` mode
- [Microsoft SQL Server]({{< ref "docs/sources/source-setup/sqlserver" >}}) to [SingleStore]({{< ref "docs/targets/target-setup/singlestore" >}})
- [IBM Db2]({{< ref "docs/sources/source-setup/db2" >}}) to [SingleStore]({{< ref "docs/targets/target-setup/singlestore" >}})
- [Oracle]({{< ref "docs/sources/source-setup/oracle" >}}) to [Oracle]({{< ref "docs/targets/target-setup/oracle" >}})

### `delta-verify` mode
Only [MySQL]({{< ref "docs/sources/source-setup/mysql" >}})-to-[Databricks]({{< ref "docs/targets/target-setup/databricks" >}}) pipeline is supported.


