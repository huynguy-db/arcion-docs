---
title: Snowflake
weight: 10
---
# Destination Snowflake

## I. Setup Connection Configuration

1. From Replicant's ```Home``` directory, navigate to the sample Snowflake connection configuration file
    ```BASH
    vi conf/conn/snowlflake.yaml
    ```
2. Make the necessary changes as follows:
    ```YAML
    type: SNOWFLAKE

    host: replicate_partner.snowflakecomputing.com
    port: 3306
    warehouse: "demo_wh"

    username: "xxx"
    password: "xxxx"

    max-connections: 20

    max-retries: 10
    retry-wait-duration-ms: 1000
    ```

## II. Setup Applier Configuration

1. Navigate to the sample Snowflake applier configuration file
    ```BASH
    vi conf/dst/snowlflake.yaml        
    ```
2. Make the necessary changes as follows:
    ```YAML
    snapshot:
      threads: 16

      batch-size-rows: 100_000
      txn-size-rows: 1_000_000

      bulk-load:
        enable: true
        type: FILE
        save-file-on-error: true

    realtime:
      threads: 8
      max-retries-per-op: 30
      retry-wait-duration-ms: 5000
      cdc-stage-type: FILE
    ```
