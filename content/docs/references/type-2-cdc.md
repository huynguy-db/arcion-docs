---
pageTitle: Type-2 CDC support in Arcion 
title: Type-2 CDC
description: "Learn how to use Type-2 CDC for Snowflake and Databricks in Arcion."
bookHidden: false
weight: 18
---

# Use Type-2 CDC

From version 22.07.19.3 onwards, Arcion supports Type-2 CDC. Type-2 CDC enables a target to possess a history of all transactions performed in the source.

## Supported platforms
Arcion supports Type-2 CDC for the following targets:

- [Databricks]({{< ref "docs/target-setup/databricks" >}})
- [Snowflake]({{< ref "docs/target-setup/snowflake" >}})

## Overview

Type-2 CDC enables a target to possess a history of all transactions performed in the source. For example:

- An INSERT in the source appears as an INSERT in the target.
- An UPDATE in the source appears as an INSERT in the target with additional metadata like operation performed, time of operation, and so on.
- A DELETE in the source appears as an INSERT in the target. For example, INSERT with OPER_TYPE as DELETE.

Arcion supports the following metadata related to source-specific fields:

- `USER_QUERY_TIMESTAMP`: Time when the user on source fires a query.
- `EXTRACTION_TIMESTAMP`: Time when Replicant detects the DML from logs.
- `OPERATION_TYPE`: Type of the operation (INSERT, UPDATE, or DELETE).

You *must enable full row logging* in the source to use Type-2 CDC.

## Limitations
Support for Type-2 CDC possesses the following limitations: 
- Type-2 CDC works on sources that support CDC.
- Type-2 CDC works in [`realtime`]({{< ref "docs/running-replicant#replicant-realtime-mode" >}}) and [`full`]({{< ref "docs/running-replicant#replicant-full-mode" >}}) modes.

## Enable Type-2 CDC
1. Set [`cdc-metadata-type`]({{< relref "docs/references/applier-reference#cdc-metadata-type" >}}) and `replay-strategy` to the following values under the `realtime` section of the [Applier]({{< relref "applier-reference" >}}) configuration file:

    ```YAML
    realtime:
      cdc-metadata-type: TYPE2_CDC
      replay-strategy: NONE
    ```

2. In the [Extractor]({{< relref "extractor-reference" >}}) configuration file of source, set the following parameter under the `snapshot` section:

    ```YAML
    snapshot:
      csv-publish-method: READ
    ```