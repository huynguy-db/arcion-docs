---
pageTitle: Type-2 CDC support in Arcion 
title: Type-2 CDC
description: "Learn how to use Type-2 CDC for Snowflake and Databricks in Arcion."
bookHidden: false
weight: 5
---

# Use Type-2 CDC

From version 22.07.19.3 onwards, Arcion supports Type-2 CDC. Type-2 CDC enables a target to possess a history of all transactions performed in the source.

## Supported platforms
Arcion supports Type-2 CDC for the following targets:

- [Databricks]({{< ref "docs/target-setup/databricks" >}})
- [Snowflake]({{< ref "docs/target-setup/snowflake" >}})

## Limitations
Support for Type-2 CDC possesses the following limitations: 
- Type-2 CDC works on sources that support CDC.
- Type-2 CDC works in [`realtime`]({{< ref "docs/running-replicant#replicant-realtime-mode" >}}) and [`full`]({{< ref "docs/running-replicant#replicant-full-mode" >}}) modes.

## Configuration

### `cdc-metadata-type`
`cdc-metadata-type` allows you to configure how CDC-based replication works, for example, enabling Type-2 CDC instead of normal CDC. It supports the following values:

<dl class="dl-indent">
<dt>

`NONE`
</dt>
<dd>

Default value of `cdc-metadata-type`. CDC works in the normal manner.
</dd>

<dt>

`TYPE2_CDC`</dt>
<dd>

With this value, all operations become append only and Arcion uses Type-2 CDC.  

Type-2 CDC enables a target to possess a history of all transactions performed in the source. For example:

- An INSERT in the source appears as an INSERT in the target.
- An UPDATE in the source appears as an INSERT in the target with additional metadata like operation performed, time of operation, and so on.
- A DELETE in the source appears as an INSERT in the target. For example, INSERT with OPER_TYPE as DELETE.

Arcion supports the following metadata related to source-specific fields:

- `USER_QUERY_TIMESTAMP`: Time when the user on source fires a query.
- `EXTRACTION_TIMESTAMP`: Time when Replicant detects the DML from logs.
- `OPERATION_TYPE`: Type of the operation (INSERT, UPDATE, or DELETE).

You must enable *enable full row logging* in the source to use Type-2 CDC. For more instructions on how to enable Type-2 CDC, see [Enable Type-2 CDC](#enable-type-2-cdc).

</dd>

<dt>

`ADD_METADATA_CDC`</dt>
<dd>
With this value, insert, update, and delete operations work in the normal manner but each row contains two additional fields: 

- `ARCION_SOURCE_EXTRACTION_TIMESTAMP`
- `ARCION_SOURCE_OPERATION_TYPE`. 

Each update operation updates the preceding fields and insert operation inserts a new row with the preceding fields.
</dd>

## Enable Type-2 CDC
1. Add the following two parameters under the `realtime` section of the Applier configuration file:

    ```YAML
    realtime:
      enable-type2-cdc: true
      replay-strategy: NONE
    ```

2. In the Extractor configuration file of source, add the following parameter under the `snapshot` section:

    ```YAML
    snapshot:
      csv-publish-method: READ
    ```