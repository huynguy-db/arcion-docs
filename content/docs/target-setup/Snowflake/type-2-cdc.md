---
pageTitle: Type-2 CDC support for Snowflake target in Arcion 
title: Type-2 CDC
description: "Learn how to use Type-2 CDC for Snowflake target in Arcion."
bookHidden: false
weight: 3
---

# Use Type-2 CDC

From version 22.07.19.3 onwards, Arcion supports Type-2 CDC for Snowflake as the target.

## Overview 
Type-2 CDC enables a target to possess a history of all transactions performed in the source. For example:

- An INSERT in the source appears as an INSERT in the target.
- An UPDATE in the source appears as an INSERT in the target with additional metadata like operation performed, time of operation, and so on.
- A DELETE in the source appears as an INSERT in the target. For example, INSERT with OPER_TYPE as DELETE.

Arcion supports the following metadata related to source-specific fields:

- `query_timestamp`: Time when the user on source fires a query.
- `extraction_timestamp`: Time when Replicant detects the DML from logs.
- `OPER_TYPE`: Type of the operation (INSERT, UPDATE, or DELETE).

You must enable *enable full row logging* in the source to use Type-2 CDC.

{{< hint "info" >}}
**Note:** Support for Type-2 CDC possesses the following limitations: 
- Type-2 CDC works on sources that support CDC.
- Type-2 CDC works in `realtime` and `full` modes.
{{< /hint >}}

To enable Type-2 CDC for your Snowflake target, follow these steps:

1. Add the following two parameters under the `realtime` section of the Snowflake Applier configuration file:

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

For a detailed explanation of configuration parameters in the Applier file, see [Applier Reference]({{< ref "/docs/references/applier-reference" >}}).