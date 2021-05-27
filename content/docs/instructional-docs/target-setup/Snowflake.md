---
title: Snowflake
weight: 10
bookHidden: true
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

    host: replicate_partner.snowflakecomputing.com #Enter your Snowflake host
    port: 3306  #Replace the 3306 with the port of your host
    warehouse: "demo_wh" #Replace demo_wh with your warehouse name

    username: "xxx" #Replace xxx with the username of your user that connects to your MySQL server
    password: "xxxx" #Replace xxxx with your user's password

    max-connections: 20 #Specify the maximum number of connections replicant can open in Snowflake
    ```

## II. Setup Applier Configuration

1. Navigate to the sample Snowflake applier configuration file
    ```BASH
    vi conf/dst/snowlflake.yaml        
    ```
2. Make the necessary changes as follows:
    ```YAML
    snapshot:
      threads: 16 #Specify the maximum number of threads Replicant should use for writing to the target

      batch-size-rows: 100_000
      txn-size-rows: 1_000_000

      #If bulk-load is used, Replicant will use the native bulk-loading capabilities of the target database
      bulk-load:
        enable: true|false #Set to true if you want to enable bulk loading
        type: FILE|PIPE #Specify the type of bulk loading between FILE and PIPE
        serialize: true|false #Set to true if you want the generated files to be applied in serial/parallel fashion

        #For versions 20.09.14.3 and beyond
        native-load-configs: #Specify the user-provided LOAD configuration string which will be appended to the s3 specific LOAD SQL command

    realtime:
      threads: 8 #Specify the maximum number of threads Replicant should use for writing to the target
      max-retries-per-op: 30 #Specify the maximum amount of retries for a failed operation
      retry-wait-duration-ms: 5000 #Specify the time in milliseconds Replicant should wait before re-trying a failed operation
      cdc-stage-type: FILE #Enter your cdc-stage-type
    ```
