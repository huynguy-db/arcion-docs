---
title: Google BigQuery
weight: 16
bookHidden: false
---
# Destination Google BigQuery

The extracted `replicant-cli` will be referred to as the `$REPLICANT_HOME` directory in the proceeding steps.

## I. Setup Connection Configuration

1. From `$REPLICANT_HOME`, navigate to the sample connection configuration file:
    ```BASH
    vi conf/conn/bigquery.yaml
    ```

2. Make the necessary changes as follows:
    ```YAML
    type: BIGQUERY

    host: https://www.googleapis.com/bigquery/v2
    port: 443
    project-id: bigquerytest-268904
    auth-type: 0
    o-auth-service-acc-email: bigquerytest@bigquerytest-268904.iam.gserviceaccount.com
    o-auth-pvt-key-path: <path_to_oauth_private_key>
    location: US
    timeout: 500


    username: "xxx"
    password: "xxxx"

    max-connections: 20


    max-retries: 10
    retry-wait-duration-ms: 1000
    ```

## II. Setup Applier Configuration

1. From `$REPLICANT_HOME`, navigate to the applier configuration file:
    ```BASH
    vi conf/dst/bigquery.yaml
    ```
2. Make the necessary changes as follows:

    ```YAML
    snapshot:
      threads: 16

      batch-size-rows: 100_000_000
      txn-size-rows: 1_000_000_000

      bulk-load:
        enable: true
        type: FILE
        save-file-on-error: true
        serialize: true

      #deferred-delete: true
      #optimized-upsert: true
      use-quoted-identifiers: false
    ```
3. If you want to operate in realtime mode, you can make use of the following parameters:

    ```YAML
    # transactional mode config
    # realtime:
    #   threads: 1
    #   batch-size-rows: 1000
    #   replay-consistency: global
    #   txn-group-count: 100
    #   _oper-queue-size-rows: 20000
    #   skip-upto-cursors: #last failed cursor

    ```

For a detailed explanation of configuration parameters in the applier file, read [Applier Reference]({{< ref "/docs/references/applier-reference" >}} "Applier Reference").