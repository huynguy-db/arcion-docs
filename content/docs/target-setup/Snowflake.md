---
title: Snowflake
weight: 10
bookHidden: false
---
# Destination Snowflake

The extracted `replicant-cli` will be referred to as the `$REPLICANT_HOME` directory in the proceeding steps.

## I. Setup Connection Configuration

1. From `$REPLICANT_HOME`, navigate to the sample Snowflake connection configuration file:
    ```BASH
    vi conf/conn/snowlflake.yaml
    ```
2. The configuration file has two parts:

    - Parameters related to target Snowflake server connection.
    - Parameters related to stage configuration.

    ### Parameters related to target Snowflake server connection
    For connecting to your target Cockroach server, you can configure the following parameters:

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
    - Make sure the specified user has `CREATE TABLE` and `CREATE STAGE` privileges on the catalogs/schemas into which replicated tables should be created.
    - If you want Replicant to create catalogs/schemas for you on the target PostgresSQL system, then you also need to grant `CREATE DATABASE`/`CREATE SCHEMA` privileges to the user.
    - If this user does not have `CREATE DATABASE` privilege, then create a database manually with name `blitzz` and grant all privileges for it to the user specified here. Replicant uses this database for internal checkpointing and metadata management.

    ### Additional parameters
    - `credential-store`: Replicant supports consuming `username` and `password` configurations from a _credentials store_ rather than having users specify them in plain text config file. You can use keystores to store your credentials related to your Snowflake server connections.The following parameters are available:

        - `type`: Type of the keystore. Allowed types are `PKCS12`, `JKS`, and `JCEKS`. 
        - `path` : Location of the key-store.
        - `key-prefix`:  You should create entries in the credential store for your configs using a prefix and specify the prefix here. For example, you can create keystore entries with aliases `snowflake1_username` and `snowflake1_password`. You can then specify the prefix here as `snowflake1_`.
        - `password`: This field is optional. If you don't specify the keystore password here, then you must use the UUID from your license file as the keystore password. Remember to keep your license file somewhere safe in order to keep this password secure.

    ### Parameters related to stage configuration
    - `stage`: By default, Replicant uses Snowflake’s native stage for bulk loading. But it's possible to use a native or an external stage like Azure to hold the data files and then load them on the target Snowflake server from there. This section allows you to specify the details Replicant needs to connect to and use a specific stage.

    - `type`*[v21.06.14.1]*: The stage type. Allowed stages are `NATIVE`, `S3`, and `AZURE`.
    - `root-dir`: Specify a directory on stage which can be used to stage bulk-load files.
    -`conn-url`*[v21.06.14.1]*: URL for the stage. For example, if stage is `S3`, specify bucket name; for `AZURE`, specify container name.
    - `key-id` : This config is valid for `S3` stage type only. Access Key ID for AWS account hosting s3.
    - `account-name`*[v21.06.14.1]* : This config is valid for `AZURE` type only. Name of the ADLS storage account.
    -`secret-key`*[v21.06.14.1]*: This config is valid for both `S3` and `AZURE` types. For example, Secret Access Key for AWS account hosting s3 or ADLS account.
    - `token`*[v21.06.14.1]*:  This config is valid for `AZURE` type only. Indicates the SAS token for Azure storage.

## II. Setup Applier Configuration

1. From `$REPLICANT_HOME`, naviagte to the sample Snowflake applier configuration file:
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
  For a detailed explanation of configuration parameters in the applier file, read [Applier Reference]({{< ref "/docs/references/applier-reference" >}} "Applier Reference").