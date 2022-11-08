---
pageTitle: Google BigQuery Target Connector Documentation
title: Google BigQuery
description: "Load terabyte-scale data into BigQuery. Build real-time data streams for real-time analytics and accelerate your business with Arcion BigQuery connector."
weight: 16
bookHidden: false
---
# Destination Google BigQuery

The extracted `replicant-cli` will be referred to as the `$REPLICANT_HOME` directory in the proceeding steps.

## I. Obtain the JDBC Driver for Google BigQuery

Replicant requires the JDBC driver for Google BigQuery as a dependency. To obtain the appropriate driver, follow the steps below: 

- Go to the [JDBC drivers for BigQuery page](https://cloud.google.com/bigquery/docs/reference/odbc-jdbc-drivers#current_jdbc_driver).
- From there, download the [latest JDBC 4.2-compatible JDBC driver ZIP](https://storage.googleapis.com/simba-bq-release/jdbc/SimbaJDBCDriverforGoogleBigQuery42_1.2.25.1029.zip).
- From the downloaded ZIP, locate and extract the `GoogleBigQueryJDBC42.jar` file.
- Put the `GoogleBigQueryJDBC42.jar` file inside `$REPLICANT_HOME/lib` directory.

## II. Set up Connection Configuration

1. From `$REPLICANT_HOME`, navigate to the sample connection configuration file:
    ```BASH
    vi conf/conn/bigquery.yaml
    ```

2. If you store your connection credentials in AWS Secrets Manager, you can tell Replicant to retrieve them. For more information, see [Retrieve credentials from AWS Secrets Manager](/docs/references/secrets-manager). 
    
    Otherwise, you can put your credentials like usernames and passwords in plain form like the sample below:
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

## III. Set up Applier Configuration

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