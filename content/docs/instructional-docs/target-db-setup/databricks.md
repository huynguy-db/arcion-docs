---
title: Databricks Delta Lake
weight: 13
bookHidden: false
---
# Destination Databricks Delta Lake

The extracted `replicant-cli` will be referred to as the `$REPLICANT_HOME` directory in the proceeding steps.

## I. Setup Connection Configuration

1. From `$REPLICANT_HOME`, navigate to the sample connection configuration file:
    ```BASH
    vi conf/conn/databricks.yaml
    ```

2. Make the necessary changes as follows:

    ```YAML
    type: DATABRICKS_DELTALAKE
    host: localhost #Replace localhost with your Databricks host
    port: 43213  #Replace 43213 with the port of your Databricks cluster

    url: "jdbc:spark://<host>:<port>/<database-name>;transportMode=http;ssl=1;httpPath=<http-path>;AuthMech=3" #This url can be copied from databricks cluster info page

    username: "replicant"  #Replace replicant with the user that connects to your Databricks server                            
    password: "Replicant#123"  #Replace Replicant#123 with your user's password                                 
    max-connections: 30 #Maximum number of connections Replicant can open in Databricks

    #lob-store-path: "/LOB_STORAGE"

    stage: #Note: You must use DATABRICKS_DBFS or an external stage like S3 to hold the data files
      type: S3 | DATABRICKS_DBFS #Specify your stage type
      root-dir: "replicate-stage/databricks-stage" #Specify the path to a directory in S3 which can be used to stage bulk-load files
      conn-url: "replicate-stage" #Specify the conn-url for your stage; For S3 replace replicate-stage with your bucket name

      #For DATABRICKS_DBFS only
      use-credentials: true|false #Default is false; When true, you must set  host, port, username, and password in the connection configuration section

      #For S3 only:
      key-id: "<S3 access key>"  #Replace <S3 access key> with your S3 access key
      secret-key: "<S3 secret key>" #Replace <S3 secret key> with your S3 secret key

    max-retries: 100 #Enter the maximum number of times Replicant can re-attempt a failed operation
    retry-wait-duration-ms: 1000 #Enter the time Replicant should wait between each re-try of a failed operation
    ```

## II. Setup Applier Configuration

1. From `$REPLICANT_HOME`, navigate to the applier configuration file:
    ```BASH
    vi conf/dst/databricks.yaml
    ```
2. Make the necessary changes as follows:
    ```YAML
    snapshot:
      threads: 16 #Maximum number of threads Replicant should use for writing to the target

      #If bulk-load is used, Replicant will use the native bulk-loading capabilities of the target database
      bulk-load:
        enable: true|false #Set to true if you want to enable bulk loading
        type: PIPE|FILE #Specify the type of bulk loading between FILE and PIPE
        serialize: true|false #Set to true if you want the generated files to be applied in serial/parallel fashion

    realtime:
      threads: 4 #Maximum number of threads Replicant should use for writing to the target
    ```
