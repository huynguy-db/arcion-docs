---
title: Snowflake
weight: 10
bookHidden: false
---

# Source Snowflake

The extracted `replicant-cli` will be referred to as the `$REPLICANT_HOME` directory in the proceeding steps.

## I. Create Streams
To create streams for tracking individual table changes for CDC, follow the instructions in [Streams](/docs/references/source-prerequisites/snowflake/#streams).

## II. Create Stage Table

To create stage table as an intermediate buffer of the CDC process, follow the instructions in [Stage Tables](/docs/references/source-prerequisites/snowflake/#stage-tables).


## III. Set up Connection Configuration

1. From `$REPLICANT_HOME`, navigate to the sample connection configuration file:

   ```BASH
   vi conf/conn/snowflake.yaml
   ```

2. The configuration file has two parts:

    - Parameters related to source Snowflake server connection.
    - Parameters related to stage configuration.

    ### Parameters related to target Snowflake server connection
    For connecting to your source Snowflake server, you can configure the following parameters:

    ```YAML
    type: SNOWFLAKE

    host: replicate_partner.snowflakecomputing.com #Enter your Snowflake host
    port: 3306  #Replace the 3306 with the port of your host
    warehouse: "demo_wh" #Snowflake warehouse

    username: "xxx" #Username to connect to Snowflake server
    password: "xxxx"

    max-connections: 20 #Specify the maximum number of connections replicant can open in Snowflake
    max-retries: 10
    retry-wait-duration-ms: 1000
    ```
    - Make sure the specified user has `CREATE TABLE` and `CREATE STREAM` privileges on the catalogs/schemas from which tables need to be replicated.

    ### Additional parameters
    - `credential-store`: Replicant supports consuming `username` and `password` configurations from a _credentials store_ rather than having users specify them in plain text config file. You can use keystores to store your credentials related to your Snowflake server connections.The following parameters are available:

        - `type`: Type of the keystore. Allowed types are `PKCS12`, `JKS`, and `JCEKS`. 
        - `path` : Location of the key-store.
        - `key-prefix`:  You should create entries in the credential store for your configs using a prefix and specify the prefix here. For example, you can create keystore entries with aliases `snowflake1_username` and `snowflake1_password`. You can then specify the prefix here as `snowflake1_`.
        - `password`: This field is optional. If you don't specify the keystore password here, then you must use the UUID from your license file as the keystore password. Remember to keep your license file somewhere safe in order to keep the password secure.

    ### Parameters related to stage configuration
    - `stage`: By default, Replicant uses Snowflake’s native stage for bulk loading. But it's also possible to use an external stage like Azure. This section allows you to specify the details Replicant needs to connect to and use a specific stage.

    - `type`*[v21.06.14.1]*: The stage type. Allowed stages are `NATIVE`, `S3`, and `AZURE`.
    - `root-dir`: Specify a directory on stage which can be used to stage bulk-load files.
    -`conn-url`*[v21.06.14.1]*: URL for the stage. For example, if stage is `S3`, specify bucket name; for `AZURE`, specify container name.
    - `key-id` : This config is valid for `S3` stage type only. Access Key ID for AWS account hosting s3.
    - `account-name`*[v21.06.14.1]* : This config is valid for `AZURE` type only. Name of the ADLS storage account.
    -`secret-key`*[v21.06.14.1]*: This config is valid for both `S3` and `AZURE` types. For example, Secret Access Key for AWS account hosting s3 or ADLS account.
    - `token`*[v21.06.14.1]*:  This config is valid for `AZURE` type only. Indicates the SAS token for Azure storage.


## IV. Set up Extractor Configuration

1. From `$REPLICANT_HOME`, navigate to the Applier configuration file:
   ```BASH
   vi conf/src/snowflake.yaml
   ```
2. Make the necessary changes as follows:

  ```YAML
  snapshot:
    threads: 32
      #  fetch-size-rows: 5_000

      #  min-job-size-rows: 1_000_000
      #  max-jobs-per-chunk: 32

      #native-extract-options:
      #control-chars:
      #delimiter: ','
      #quote: '"'
      #escape: "\u0000"
      #null-string: "NULL"
    #line-end: "\n"

    _traceDBTasks : true

    per-table-config:
      - catalog: DEMO_DB
        schema: tpch
        tables:
          orders:
  #        num-jobs: 2
  #        split-hints:
  #          row-count-estimate: 15000

  realtime:
    threads: 8
    fetch-size-rows: 10000
    _traceDBTasks: true
    #fetch-interval-s: 0
    #create-stream: true
    #create-stage-table: true
  ```

For a detailed explanation of configuration parameters in the extractor file, read [Extractor Reference]({{< ref "/docs/references/extractor-reference" >}} "Extractor Reference").
