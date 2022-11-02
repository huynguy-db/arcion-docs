---
pageTitle: Documentation for YugabyteSQL Target connector
title: YugabyteSQL
description: "Ingest data into YugabyteSQL in minutes with seamless schema conversion using Arcion Yugabyte connector."
weight: 2
bookHidden: false
---
# Destination YugabyteSQL

The extracted `replicant-cli` will be referred to as the `$REPLICANT_HOME` directory in the proceeding steps.

## I. Set up Connection Configuration

1. From `$REPLICANT_HOME`, navigate to the sample YugabyteSQL connection configuration file:
    ```BASH
    vi conf/conn/yugabytesql.yaml
    ```
2. Make the necessary changes as follows:

    ```YAML
    type: YUGABYTESQL

    host: localhost #Replace localhost with your YugabyteSQL host
    port: 5433 #Replace the 57565 with the port of your host

    username: 'replicant' #Replace replicant with the username of your user that connects to your YugabyteSQL server
    password: 'Replicant#123' #Replace Replicant#123 with your user's password

    max-connections: 30 #Specify the maximum number of connections replicant can open in YugabyteSQL
    max-retries: 10 #Number of times any operation on the system will be re-attempted on failures.
    retry-wait-duration-ms: 1000 #Duration in milliseconds replicant should wait before performing then next retry of a failed operation
    ```
    - Make sure the specified user has `CREATE TABLE` on the catalogs/schemas into which replicated tables should be created.
    - If you want Replicant to create catalogs/schemas for you on the target YugabyteSQL system, then you also need to grant `CREATE DATABASE`/`CREATE SCHEMA` privileges to the user.
    - If this user does not have `CREATE DATABASE` privilege, then create a database manually with name `io` and grant all privileges for it to the user specified here. Replicant uses this database for internal checkpointing and metadata management.  

        {{< hint "info" >}} The database/schema of your choice on a different instance of your choice name can be configured using the metadata config feature. For more information, see [Metadata Configuration](/docs/references/metadata-reference).{{< /hint >}}


## II. Set up Applier Configuration

1.  From `$REPLICANT_HOME`, naviagte to the sample YugabyteSQL Applier configuration file:

    ```BASH
    vi conf/dst/yugabytesql.yaml
    ```
2. The file contains the following sample snapshot configuration:

    ```YAML
    snapshot:
     threads: 16

     map-bit-to-boolean: true

     bulk-load:
       enable: true
       type: FILE #FILE or PIPE
       serialize: true

       #For versions 20.09.14.3 and beyond
       native-load-configs: #Specify the user-provided LOAD configuration string which will be appended to the s3 specific LOAD SQL command
    ```

      - `map-bit-to-boolean`: Tells Replicant whether to map `bit(1)` and `varbit(1)` data types from Source to `boolean` on Target:

        - `true`: map `bit(1)`/`varbit(1)` data types from Source to `boolean` on Target Yugabyte
        - `false`: map `bit(1)`/`varbit(1)` data types from Source to `bit(1)`/`varbit(1)` on Target Yugabyte

        *Default: `true`.*

For a detailed explanation of configuration parameters in the Applier file, see [Applier Reference]({{< ref "/docs/references/applier-reference" >}} "Applier Reference").
