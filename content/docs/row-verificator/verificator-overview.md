---
pageTitle: Row Verificator
title: Overview
description: "Use Arcion's row verification software to verify snapshot data and find missing primary keys on target among JDBC-compliant databases."
weight: 1
---

# Replicate Row Verificator
Arcion provides a row validation software that allows you to verify snapshot data among JDBC-compliant databases. The Verificator also allows you to find missing primary keys on the target for JDBC-compliant databases.

## Overview
The Verificator can operate in two modes:

<dl class="dl-indent">
<dt>

`verify`
</dt>
<dd>

This mode verifies snapshot data among JDBC-compliant databases. The Verificator compares the matching records across both sides using standard database techniques that allows the Verificator to work in a memory-friendly manner. 

The Verificator works well for tables with primary keys. If a table doesn't possess a primary key, you need to provide `row-identifier-key` columns for the table in the general configuration. `row-identifier-key` columns for a table logically identifies unique rows in that table. Make sure to provide the same column ordering for both source and target database so that the Verificator can match both sides with identical parameters. If a table doesn't possess any primary key and you don't supply a `row-identifier-key` for such a table, the Verificator only reports row count mismatches for that table.
</dd>
<dt>

`delta-verify`
</dt>
<dd>
This mode allows you to find out missing primary keys on target data among JDBC-compliant databases. This mode depends on a timestamp column that holds the value for CREATE DATE for that row. The Verificator compares primary keys for any new rows if the row count for the range of the CREATE COLUMN column does not match.
</dd>
</dl>


<!-- TODO: FIX THIS PARAGRAPH LATER -->
<!-- Verificator takes various command line arguments.  which there are connection configurations of both databases to be compared. In all descriptions below, the documentation refers “source” to the first database in the command line, and “destination” to the second database in the command line. -->

## Supported pipelines
<!-- Add links to source and target pages -->
- [Microsoft SQL Server]({{< ref "docs/sources/source-setup/sqlserver" >}}) to [SingleStore]({{< ref "docs/targets/target-setup/singlestore" >}})
- [IBM Db2]({{< ref "docs/sources/source-setup/db2" >}}) to [SingleStore]({{< ref "docs/targets/target-setup/singlestore" >}})
- [Oracle]({{< ref "docs/sources/source-setup/oracle" >}}) to [Oracle]({{< ref "docs/targets/target-setup/oracle" >}})


<!-- For Delta verify mode>


