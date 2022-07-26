---
title: Google BigQuery
weight: 13
bookHidden: false
---
# Source Google BigQuery

The extracted `replicant-cli` will be referred to as the `$REPLICANT_HOME` directory in the proceeding steps.

## I. Setup Connection Configuration

1. From `$REPLICANT_HOME`, navigate to the sample connection configuration file:
    ```BASH
    vi conf/conn/bigquery_src.yaml
    ```

2. Make the necessary changes as follows:
    ```YAML
    type: BIGQUERY

    host: https://www.googleapis.com/bigquery/v2
    port: 443
    project-id: <bigquery_projectID>
    auth-type: 0
    o-auth-service-acc-email: <your_service_account@your_project.iam.gserviceaccount.com>
    o-auth-pvt-key-path: <path_to_oauth_private_key>
    location: US
    timeout: 500

    username: "<your_username>"
    password: "<your_password>"

    max-connections: 20

    max-retries: 10
    retry-wait-duration-ms: 1000
    ```

## II. Setup Extractor Configuration

1. From `$REPLICANT_HOME`, navigate to the Extractor configuration file:

    ```BASH
    vi conf/src/bigquery.yaml
    ```
2. The configuration file has two parts:

    - Parameters related to snapshot mode.
    - Parameters related to delta-snapshot mode.

    ### Parameters related to snapshot mode
    For snapshot mode, make the necessary changes as follows:

    ```YAML
    snapshot:
      threads: 32
      fetch-size-rows: 10_000

      min-job-size-rows: 1_000_000
    #  max-jobs-per-chunk: 32
      per-table-config:
        - schema: tpch
          tables:
            partsupp:
              split-key: ps_partkey
            supplier:
              split-key: s_suppkey
            orders:
              split-key: o_orderkey
            nation:
              split-key: n_regionkey
    ```
    ### Parameters related to delta-snapshot mode
    For operating in delta-snapshot mode, use the `delta-snapshot` section to specify your configuration. Below is a sample config:

    ```YAML
    delta-snapshot:
      threads: 16
      fetch-size-rows: 10_000

    #  min-job-size-rows: 1_000_000
    # max-jobs-per-chunk: 32
    # _max-delete-jobs-per-chunk: 32

    #  delta-snapshot-interval: 10
    #  replicate-deletes: true
    #  split-key: last_update_time
    #  delta-snapshot-key: last_update_time
    #  row-identifier-key: [last_update_time]

    #  per-table-config:
    #  - schema: tpch
    #    tables:
    #      testTable:
    #        split-key: split-key-column  # Any numeric/timestamp column with sufficiently large number of distincts
    #        split-hints:
    #          row-count-estimate: 100000  # Estimated row count, if supplied replicant will leverage
    #          split-key-min-value: 1      # Lower bound of split key value
    #          split-key-max-value: 60_000 # Upper bound of split key value, if supplied replicant will leverage and avoid querying source database for the same
    #        delta-snapshot-key: delta-snapshot-key-column  # A monotonic increasing numeric/timestamp column which gets new value on each INSERT/UPDATE
    #        row-identifier-key: [col1, col2]   # A set of columns which uniquely identify a row
    #        update-key: [col1, col2]  # A set of columns which replicant should use to perform deletes/updates during incremental replication
    #      partsupp:
    #        row-identifier-key: [last_update_time]
    #      customer:
    #        split-key: custkey
    #        row-identifier-key: [last_update_time]
    ```

For a detailed explanation of configuration parameters in the Extractor file, read [Extractor Reference]({{< ref "/docs/references/extractor-reference" >}} "Extractor Reference").