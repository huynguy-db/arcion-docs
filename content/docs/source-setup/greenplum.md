---
title: Greenplum
weight: 16
bookHidden: false
---
# Source Greenplum

The extracted `replicant-cli` will be referred to as the `$REPLICANT_HOME` directory in the proceeding steps.

## I. Set up Connection Configuration

1. From `$REPLICANT_HOME`, navigate to the sample connection configuration file:
    ```BASH
    vi conf/conn/greenplum.yaml
    ```

2. For connecting to your source Greenplum server, you can configure the following parameters:

    ```YAML
    type: GREENPLUM

    host: HOSTNAME
    port: PORT_NUMBER

    database: 'DATABASE_NAME'
    username: 'USERNAME'
    password: 'PASSWORD'

    max-connections: 30
    socket-timeout-s: 60

    max-retries: 10
    retry-wait-duration-ms: 1000
    ```

    Replace the following:
    - *`HOSTNAME`*: the hostname of your Greenplum host
    - *`PORT_NUMBER`*: the relevant port number of the Greenplum cluster
    - *`DATABASE_NAME`*: the name of the Greenplum database
    - *`USERNAME`*: the Greenplum database role name to connect as
    - *`PASSWORD`*: the password associated with *`USERNAME`*

## II. Set up Extractor Configuration

1. From `$REPLICANT_HOME`, navigate to the Extractor configuration file:
    ```BASH
    vi conf/src/greenplum.yaml
    ```
2. The configuration file has two parts:

    - Parameters related to snapshot mode.
    - Parameters related to delta snapshot mode.

    ### Parameters related to snapshot mode
    For snapshot mode, you can make use of the following sample:

      ```YAML
      snapshot:
        threads: 32
        fetch-size-rows: 10_000

        min-job-size-rows: 1_000_000
        max-jobs-per-chunk: 32
        _traceDBTasks: true

        lock:
          enable: false

      #  lock:
      #    enable: true
      #    scope: TABLE   # DATABASE, TABLE
      #    force: false
      #    timeout-sec: 5

      #  extraction-method: QUERY # Allowed values are QUERY, COPY
      #  native-extract-options:
      #    compression-type: "NONE" #Allowed values are GZIP and NONE. GZIP generates extracted files in compressed .gz format. Use GZIP only when extraction-method is set to COPY

        per-table-config:
          - catalog: tpch
            schema: public
            tables:
              lineitem:
                row-identifier-key: [l_orderkey, l_linenumber]
                split-key: l_orderkey
      #          extraction-method: QUERY # Allowed values are QUERY, COPY
      #          native-extract-options:
      #           compression-type: "NONE" #Allowed values are GZIP and NONE. GZIP generates extracted files in compressed .gz format. Use GZIP only when extraction-method is set to COPY
      #        split-hints:
      #          row-count-estimate: 15000
      #          split-key-min-value: 1
      #          split-key-max-value: 60_000
      ```

    {{< hint "warning" >}}
  - In the absence of a `split-key`, we use a generated key `gp_segment_id` for tables. This allows Replicant to split a table into multiple jobs, increasing parallelism.
  - In case of views or any other non-table object type, we don't support extraction using generated key. Replicant honors `split-key` only if the user explicitly provides it in the Extractor configuration file.
    {{< /hint >}}

    ### Parameters related to delta snapshot mode
    If you want to operate in delta snapshot mode, you can use the `delta-snapshot` section to specify your configuration. For example:

    ```YAML
    delta-snapshot:

      threads: 32
      fetch-size-rows: 10_000

      min-job-size-rows: 1_000_000
      max-jobs-per-chunk: 32

      delta-snapshot-key: last_update_time
      delta-snapshot-interval: 10
      delta-snapshot-delete-interval: 10
      _traceDBTasks: true
      #ddl-replication:
      #  enable: true # This config enables detection of DDLs fire on source.
                      # If this config is set to true then please enable and set appropriate value of delta-snapshot-detect-DDL-interval config.
      #  delta-snapshot-detect-ddl-interval: 5 # This config sets the value of DDL detection interval E.g if set to 5 then DDLs will be detected after every 5 delta-snapshot intervals
                                            # If DDLs are rare it is recommended to set large value.
      #replicate-deletes: false
    #  extraction-method: QUERY # Allowed values are QUERY, COPY
    #  native-extract-options:
    #    compression-type: "NONE" #Allowed values are GZIP and NONE. GZIP generates extracted files in compressed .gz format. Use GZIP only when extraction-method is set to COPY


      per-table-config:
      - catalog: tpch
        schema: public
        tables:
    #     testTable
    #       split-key: split-key-column
    #       delta-snapshot-key: delta-snapshot-key-column
    #       delta-snapshot-key-offset: '2019-10-05 13:23:45.890000'  ( delta snapshot key to start replication from)
    #       extraction-method: QUERY # Allowed values are QUERY, COPY
    #       native-extract-options:
    #         compression-type: "NONE" #Allowed values are GZIP and NONE. GZIP generates extracted files in compressed .gz format. Use GZIP only when extraction-method is set to COPY
          part:
            delta-snapshot-key: last_update_time
          partsupp:
            delta-snapshot-key: last_update_time
          supplier:
            delta-snapshot-key: last_update_time
          orders:
            delta-snapshot-key: last_update_time
          lineitem:
            delta-snapshot-key: last_update_time
            #row-identifier-key: [l_orderkey, l_linenumber]
    ```

For a detailed explanation of configuration parameters in the Extractor file, see [Extractor Reference]({{< ref "/docs/references/Extractor-reference" >}} "Extractor Reference").