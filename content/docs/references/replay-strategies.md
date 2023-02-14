---
pageTitle: Replay strategies for realtime replication
title: Replay strategies
description: "Learn how Arcion captures CDC changes for realtime data ingestion into BigQuery and Databricks."
bookHidden: false
weight: 12
---

# Replay strategies for BigQuery and Databricks targets

Replay strategies are how Arcion implements CDC changes and applies them in realtime to the target.

## Overview
All replay startegies append a special column called `OPERATION_TYPE` to each operation to identify the nature of operation. An operation can be either an insert (I), an update (U), or a delete (D) operation.

Replay strategies apply to the following targets:

- [BigQuery]({{< ref "docs/target-setup/bigquery" >}}) 
- [Databricks]({{< ref "docs/target-setup/databricks" >}})

Replicant automatically chooses the best replay strategy to use. So you don't always have to explicitly specify it.

You can set the replay strategy using the `replay-strategy` realtime parameter. Arcion supports the following replay strategies for realtime BigQuery and Databricks targets:

### `NONE`
When a set of upcoming operations arrives, the Applier buffers the operation and applies the buffered batch if upcoming operation and buffered operation has different operation type. In case of _update-update_, it applies the buffered operation if `SET` or `WHERE` statements are different.

### `INSERT_DELETE`
In this strategy, Replicant takes the following approach to operations:

- Every insert is applied as an insert. 
- Every delete is applied as a delete. 
- Every update is broken down into insert + delete. 

Replicant also introduces a special column called `REPLICATE_IO_VERSION_METADATA`. Version column of delete is lesser than versioning column of insert. All rows having version lesser than delete operations are deleted if matched.

### `INSERT_MERGE`
Same as [`INSERT_DELETE`](#insert_delete) but deletes are deleted using `MERGE` statement instead of `DELETE` statement.

### `IN_MEMORY_MERGE`
Requires only updated columns for logging. A checksum of each operation in a buffered batch is maintained in memory to resolve conflicting operations. For example, update over insert or insert over delete. These conflicting opers which are meant to apply on the same row are resolved in memory. Once resolved, they are applied as [`MERGE` strategy](#merge) only.

### `MERGE`
Requires FULL logging for after image. `MERGE` statement performs insert/update/delete based on value of `OPERATION_TYPE` column for each row matching with temporary table row. This could lead to cyclic dependency exception. This is resolved by executing `MERGE` statement with complex queries managing cyclic dependency with group subqueries. This complex subqueries can be enabled by default by setting `enable-dependency-tracking` to `true`.