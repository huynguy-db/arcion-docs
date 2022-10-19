---
title: PostgreSQL
weight: 5
bookHidden: false
---
# Destination PostgreSQL

The extracted `replicant-cli` will be referred to as the `$REPLICANT_HOME` directory in the proceeding steps.

## I. Set up Connection Configuration

1. From `$REPLICANT_HOME`, navigate to the sample PostgreSQL connection configuration file:
    ```BASH
    vi conf/conn/postgresql_dst.yaml
    ```
2. Make the necessary changes as follows:

    ```YAML
      type: POSTGRESQL

      host: localhost #Replace localhost with your PostgreSQL host
      port: 5432  #Replace the 57565 with the port of your host

      database: 'tpch' #Replace tpch with your database name
      username: 'replicant' #Replace replicant with the username of your user that connects to your PostgreSQL server
      password: 'Replicant#123' #Replace Replicant#123 with your user's password

      max-connections: 30 #Specify the maximum number of connections Replicant can open in PostgreSQL
      socket-timeout-s: 60 #The timeout value for socket read operations. The timeout is in seconds and a value of zero means that it is disabled.
      max-retries: 10 #Number of times any operation on the system will be re-attempted on failures.
      retry-wait-duration-ms: 1000 #Duration in milliseconds replicant should wait before performing then next retry of a 
    ```

    - Make sure the specified user has `CREATE TABLE` privilege on the catalogs/schemas into which replicated tables should be created.
    - If you want Replicant to create catalogs/schemas for you on the target PostgresSQL system, then you also need to grant `CREATE DATABASE`/`CREATE SCHEMA` privileges to the user.
    - If this user does not have `CREATE DATABASE` privilege, then create a database manually with name `io` and grant all privileges for it to the user specified here. Replicant uses this database for internal checkpointing and metadata management.  

        {{< hint "info" >}} The database/schema of your choice on a different instance of your choice name can be configured using the metadata config feature. For more information, see [Metadata Configuration](/docs/references/metadata-reference).{{< /hint >}}

        {{< hint "info" >}} The `socket-timeout-s` parameter has been introduced in *v22.02.12.16* and isn't available in previous versions.{{< /hint >}}
## II. Set up Applier Configuration

1. From `$REPLICANT_HOME`, naviagte to the sample PostgreSQL applier configuration file:
    ```BASH
    vi conf/dst/postgresql.yaml    
    ```
2. The configuration file has two parts:

    - Parameters related to snapshot mode.
    - Parameters related to realtime mode.

    ### Parameters related to snapshot mode
    For snapshot mode, below is a sample configuration:

    ```YAML
    snapshot:
      threads: 16
      batch-size-rows: 5_000
      txn-size-rows: 1_000_000
      skip-tables-on-failures: false

      map-bit-to-boolean: false

      bulk-load:
        enable: true
        type: FILE # FILE or PIPE

      _traceDBTasks: true
      use-quoted-identifiers: true
    ```
    
      - `map-bit-to-boolean`: Tells Replicant whether to map `bit(1)` and `varbit(1)` data types from Source to `boolean` on Target:

        - `true`: map `bit(1)`/`varbit(1)` data types from Source to `boolean` on Target Yugabyte
        - `false`: map `bit(1)`/`varbit(1)` data types from Source to `bit(1)`/`varbit(1)` on Target Yugabyte

        *Default: `false`.*

    ### Parameters related to realtime mode
    If you want to operate in realtime mode, you can use the `realtime` section to specify your configuration. For example:

    ```YAML
    realtime:
      threads: 8
      txn-size-rows: 10000
      batch-size-rows: 1000
      skip-tables-on-failures : false

      use-quoted-identifiers: true
    ```
    
For a detailed explanation of configuration parameters in the applier file, see [Applier Reference]({{< ref "/docs/references/applier-reference" >}} "Applier Reference").