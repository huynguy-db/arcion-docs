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
    ### Retrieve credentials from AWS Secrets Manager
    {{< hint "info" >}}
This feature is available from version 22.10.28.2.
    {{< /hint >}}

    You may want to store credentials like usernames and associated passwords in AWS Secrets Manager. In that case, you can tell Replicant to retrieve credentials from Secrets Manager instead of reading them from plain YAML files like above. 

    To fetch your credentials from AWS Secrets Manager, follow the steps below:

    1. Run Replicant with the argument `--use-sm-provider`. The argument can take the following two values:
   
       - **`AWS`**: Replicant will try to read secrets from AWS Secrets Manager.
       - **`NONE`**: Replicant will expect the secrets to be in plain YAML files instead of being managed by a Secrets Manager.

       Below is a sample Replicant command specifying AWS Secrets Manager:

        ```sh
        ./bin/replicant test-connection conf/conn/mysql_dst.yaml --validate conf/validate/validationchecks.json --use-sm-provider AWS
        ```

    2. In your connection configuration file, represent the value of each credential stored in AWS Secrets Manager using a URL. Notice the following about the structure of the URL:
        - Each URL should begin with `arcion-sm://`. This tells Replicant that a Secrets Manager holds the value.
        - The rest of the URL depends on where the key is stored in AWS Secrets Manager, the *key* being the *name* of the credential. For example, the `username` credential could have the following URL representation in the connection configuration file:

            ```YAML
            username: arcion-sm://connectionConfig/username
            ```

            In the URL above, there are two parts:
            - **`connectionConfig`** represents the secret name.
            - **`username`** is the secret key for which Replicant should retrieve the value from AWS Secrets Manager.

    Below is a sample connection configuration file where the `host`, `port`, `username`, and `password` credentials are managed by the AWS Secrets Manager:


    ```YAML
    type: BIGQUERY

    host: arcion-sm://connectionConfig/host
    port: arcion-sm://connectionConfig/port

    project-id: bigquerytest-268904
    auth-type: 0
    o-auth-service-acc-email: bigquerytest@bigquerytest-268904.iam.gserviceaccount.com
    o-auth-pvt-key-path: <path_to_oauth_private_key>
    location: US
    timeout: 500


    username: arcion-sm://connectionConfig/username
    password: arcion-sm://connectionConfig/password

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