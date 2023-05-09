---
pageTitle: Type-2 CDC support for Snowflake target in Arcion 
title: Type-2 CDC
description: "Learn how to use Type-2 CDC for Snowflake target in Arcion."
bookHidden: false
weight: 3
---

# Use Type-2 CDC

From version 22.07.19.3 onwards, Arcion supports Type-2 CDC for Snowflake as the Target.

## Overview 
Type-2 CDC enables a Target to have a history of all transactions performed in the Source. For example:

- An INSERT in the Source is an INSERT in the Target.
- An UPDATE in the Source is an INSERT in the Target with additional metadata like Operation Performed, Time of Operation, etc.
- A DELETE in the Source is an INSERT in the Target: INSERT with OPER_TYPE as DELETE.

Arcion supports the following metadata related to source-specific fields:

- `query_timestamp`: Time at which the user on Source fired a query.
- `extraction_timestamp`: Time at which Replicant detected the DML from logs.
- `OPER_TYPE`: Type of the operation (INSERT/UPDATE/DELETE).

The primary requirement for Type-2 CDC is to *enable full row logging* in the Source.

{{< hint "info" >}}
**Note:** Support for Type-2 CDC is limited to the following cases: 
- Sources that support CDC.
- `realtime` and `full` modes.
{{< /hint >}}

To enable Type-2 CDC for your Snowflake target, follow the steps below:

1. Add the following two parameters under the `realtime` section of the Snowflake Applier configuration file:

    ```YAML
    realtime:
        enable-type2-cdc: true
        replay-strategy: NONE
    ```

2. In the Extractor configuration file of Source, add the following parameter under the `snapshot` section:

    ```YAML
    snapshot:
        csv-publish-method: READ
    ```

For a detailed explanation of configuration parameters in the Applier file, see [Applier Reference]({{< ref "../../configuration-files/applier-reference" >}}).