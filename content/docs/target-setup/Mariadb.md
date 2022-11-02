---
pageTitle: Use MariaDB as Target
title: MariaDB
description: "Learn how to securely connect to, ensure database privileges on, and load data into MariaDB using Arcion."
weight: 9
bookHidden: false
---
# Destination Maria Database

The extracted `replicant-cli` will be referred to as the `$REPLICANT_HOME` directory in the proceeding steps.

## I. Set up Connection Configuration

1. From `$REPLICANT_HOME`, navigate to the sample MariaDB connection configuration file:
    ```BASH
    vi conf/conn/mariadb_dst.yaml
    ```
2. Make the necessary changes as follows:
    ```YAML
    type: MARIADB

    host: localhost #Replace localhost with your MariaDB host
    port: 57565 #Replace the 57565 with the port of your host

    username: "replicant" #Replace replicant with the username of your user that connects to your MariaDB server
    password: "Replicant#123" #Replace Replicant#123 with your user's password

    max-connections: 30 #Specify the maximum number of connections replicant can open in MariaDB
    max-retries: 10 #Number of times any operation on the system will be re-attempted on failures.
    retry-wait-duration-ms: 1000 #Duration in milliseconds replicant should wait before performing then next retry of a failed operation

    ```
    - Make sure the specified user has `CREATE TABLE` and `CREATE TEMPORARY TABLE` privileges on the catalogs/schemas into which replicated tables should be created.
    - If you want Replicant to create catalogs/schemas for you on the target MariaDB system, then you also need to grant `CREATE DATABASE`/`CREATE SCHEMA` privileges to the user.
    - If this user does not have `CREATE DATABASE` privilege, then create a database manually with name `io_blitzz` and grant all privileges for it to the user specified here. Replicant uses this database for internal checkpointing and metadata management.  

        {{< hint "info" >}} The database/schema of your choice on a different instance of your choice name can be configured using the metadata config feature. For more information, see [Metadata Configuration](/docs/references/metadata-reference).{{< /hint >}}

## II. Set up Applier Configuration

1. From `$REPLICANT_HOME`, naviagte to the sample MariaDB applier configuration file:
    ```BASH
    vi conf/dst/mariadb.yaml    
    ```
2. Make the necessary changes as follows:

    ```YAML
    snapshot:
      threads: 32 #Specify the maximum number of threads Replicant should use for writing to the target
      batch-size-rows: 10_000 #Specify the size of a batch
      txn-size-rows: 1_000_000 #Determines the unit of an applier-side job

    #If bulk-load is used, Replicant will use the native bulk-loading capabilities of the target database
    bulk-load:
      enable: true|false #Set to true if you want to enable bulk loading
      type: FILE|PIPE #Specify the type of bulk loading between FILE and PIPE
      serialize: true|false #Set to true if you want the generated files to be applied in serial/parallel fashion

      #For versions 20.09.14.3 and beyond
      native-load-configs: #Specify the user-provided LOAD configuration string which will be appended to the s3 specific LOAD SQL command
    ```

For a detailed explanation of configuration parameters in the applier file, read [Applier Reference]({{< ref "/docs/references/applier-reference" >}} "Applier Reference").