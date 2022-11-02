---
pageTitle: Documentation for SingleStore Source connector
title: SingleStore
description: "Set up SingleStore as Source for zero-maintenance data pipelines using Arcion SingleStore connector."
weight: 7
bookHidden: false
---

# Source SingleStore

The extracted `replicant-cli` will be referred to as the `$REPLICANT_HOME` directory in the proceeding steps.

## I. Set up Connection Configuration

1. From `$REPLICANT_HOME`, navigate to the sample connection configuration file:

   ```BASH
   vi conf/conn/singlestore.yaml
   ```

2. Make the necessary changes as follows:

   ```YAML
    type: SINGLESTORE

    host: localhost #Replace localhost with address to your SingleStore host
    port: 3306 #Replace default port 3306 if needed

    username: 'replicant' #Replace replicant with your SingleStore user
    password: 'Replicant#123' #Replace Replicant#123 with your user's password

    max-connections: 30 #Maximum number of connections replicant can open in SingleStore 
    max-retries: 10
    retry-wait-duration-ms: 1000
    ```
   
## II. Set up Extractor Configuration

1. From `$REPLICANT_HOME`, navigate to the Extractor configuration file:
   ```BASH
   vi conf/src/singlestore.yaml
   ```
    a. For snapshot mode, make the necessary changes as follows in the `snapshot` section of the configuration file:

    ```YAML
    snapshot:
      #threads: 32
      #fetch-size-rows: 10_000

      #min-job-size-rows: 1_000_000
      max-jobs-per-chunk: 32
      #verify-row-count: false
      _traceDBTasks: true

      per-table-config:
      - catalog: tpch
        tables:
    #     testTable
    #       split-key: split-key-column
          part:
            split-key: partkey
          partsupp:
            split-key: partkey
          supplier:
          orders:
            split-key: orderkey
          lineitem:
            row-identifier-key: [l_orderkey, l_linenumber]
            split-key: l_orderkey
    #        split-hints:
    #          row-count-estimate: 15000
    #          split-key-min-value: 1
    #          split-key-max-value: 60_000
    ```

    b. For delta snapshot mode, you can add `delta-snapshot-key` column to SingleStore tables if not present already with the following `ALTER` (and `UPDATE`) statement per table.

    ```SQL
    ALTER TABLE tpch.LINEITEM_CS ADD COLUMN replicate_io_delta_snapshot_key TIMESTAMP NOT NULL DEFAULT current_timestamp ON UPDATE current_timestamp;
    ```
    ```SQL
    UPDATE tpch.LINEITEM_CS set replicate_io_delta_snapshot_key = current_timestamp;
    ```
    Then make the necessary changes as follows in the `delta-snapshot` section of the configuration file:

    ```YAML
    delta-snapshot:
      #threads: 32
      #fetch-size-rows: 10_000

      #min-job-size-rows: 1_000_000
      max-jobs-per-chunk: 32
      _max-delete-jobs-per-chunk: 32

      delta-snapshot-key: last_update_time
      delta-snapshot-interval: 10
      delta-snapshot-delete-interval: 10
      _traceDBTasks: true
      replicate-deletes: false

      per-table-config:
      - schema: tpch
        tables:
    #      testTable
    #        split-key: split-key-column  # Any numeric/timestamp column with sufficiently large number of distincts
    #        split-hints:
    #          row-count-estimate: 100000  # Estimated row count, if supplied replicant will leverage
    #          split-key-min-value: 1      #Lower bound of split key value
    #          split-key-max-value: 60_000 #Upper bound of split key value, if supplied replicant will leverage and avoid querying source database for the same
    #        delta-snapshot-key: delta-snapshot-key-column  # A monotonic increasing numeric/timestamp column which gets new value on each INSERT/UPDATE
    #        row-identifier-key: [col1, col2]   # A set of columns which uniquely identify a row
    #        update-key: [col1, col2]  # A set of columns which replicant should use to perform deletes/updates during incremental replication

          part:
            split-key: partkey
          partsupp:
            split-key: partkey
          supplier:
          orders:
            split-key: orderkey
          parts_view:
            update-key: [partkey]
            delta-snapshot-key: last_update_time
            split-key: last_update_time
          partsupp_macro:
            update-key: [partkey]
            delta-snapshot-key: last_update_time
            split-key: last_update_time
    ```

For a detailed explanation of configuration parameters in the extractor file, read [Extractor Reference]({{< ref "/docs/references/extractor-reference" >}} "Extractor Reference").