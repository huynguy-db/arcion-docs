---
pageTitle: Ingest data into Snowflake Iceberg tables with Arcion
title: Iceberg tables
description: "Learn how to use Snowflake Iceberg tables as data target with Arcion."
weight: 4
bookHidden: false
---

# Use Snowflake Iceberg Tables
{{< hint "info" >}}
**Note:** This feature is only available in [Arcion self-hosted CLI](https://www.arcion.io/self-hosted).
{{< /hint >}}

From version 23.01.05.3, Arcion supports [Snowflake Iceberg tables]((https://docs.snowflake.com/en/LIMITEDACCESS/tables-iceberg.html)) as target for both snapshot-based and realtime replication. To use Snowflake Iceberg tables as target, follow these instructions.

## Prerequisites

1. Create an Amazon S3 bucket if it doesn't exist.

2. Create external volume in Snowflake for your AWS S3 bucket using the `CREATE EXTERNAL VOLUME` command:

    ```SQL
    CREATE EXTERNAL VOLUME <volume_name>
        STORAGE_LOCATIONS =
        (
            (
            NAME = '<volume_name>'
            STORAGE_PROVIDER = 'S3'
            STORAGE_AWS_ROLE_ARN = '<iam_role>'
            STORAGE_BASE_URL = 's3://<bucket>[/<path>/]'
            )
        ); 
    ```

    Replace the following:

    - *`<volume_name>`*: the name of the new external volume
    - *`<iam_role>`*: the Amazon Resource Name (ARN) of the IAM role
    - *`<path>`*: an optional path that provides granular control over objects in the bucket 

For more information on granting Snowflake access to your Amazon S3 bucket, see [Accessing Amazon S3 Using External Volumes
](https://docs.snowflake.com/en/LIMITEDACCESS/table-external-volume-s3.html).

## Specify Iceberg as table type in Applier configuration file
<<<<<<< HEAD:content/docs/targets/target-setup/Snowflake/iceberg-tables.md
In [your Applier configuration file]({{< ref "setup-guide#ii-set-up-applier-configuration" >}}), you need to set the `table-type` property to `ICEBERG` under [the `per-table-config` configuration]({{< ref "docs/targets/configuration-files#per-table-config" >}}). For example, notice the following sample Applier configuration:
=======
In [your Applier configuration file]({{< ref "setup-guide#ii-set-up-applier-configuration" >}}), you need to set the `table-type` property to `ICEBERG` under [the `per-table-config` configuration]({{< ref "../../configuration-files/applier-reference#per-table-config" >}}). For example, look at the following sample Applier configuration:
>>>>>>> 2a1d529 ([WIP]refactor of docs):content/docs/targets/target-setup/Snowflake/iceberg-tables.md

```YAML
snapshot:
  threads: 8

  batch-size-rows: 600_000
  txn-size-rows: 600_000
  per-table-config:
  - catalog: "CATALOG"
    schema: "SCHEMA"
    tables:
      TABLE_NAME:
        table-type: ICEBERG

  bulk-load:
    enable: true
    type: FILE
    save-file-on-error: true
```

{{< hint "warning" >}} **Attention:** In realtime replication, Replicant first creates the destination tables with a one-time data snapshot to transfer all existing data from the source. In this "snapshot phase", Replicant needs to know beforehand whether or not you're using Iceberg tables. For this reason, you _must always_ use the `snapshot` section of the Applier configuration file to specify your `per-table-config` parameters, including the value of `table-type`. For more information about how different Replicant modes work, see [Running Replicant]({{< ref "docs/running-replicant" >}}).
{{< /hint >}}