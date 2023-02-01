---
pageTitle: Documentation for YugabyteSQL Target connector
title: YugabyteSQL
description: "Ingest data into YugabyteSQL in minutes with seamless schema conversion using Arcion Yugabyte connector."

bookHidden: false
---
# Destination YugabyteSQL

The extracted `replicant-cli` will be referred to as the `$REPLICANT_HOME` directory in the proceeding steps.

## I. Set up connection configuration

1. From `$REPLICANT_HOME`, navigate to the sample YugabyteSQL connection configuration file:
    ```BASH
    vi conf/conn/yugabytesql.yaml
    ```
2. If you store your connection credentials in AWS Secrets Manager, you can tell Replicant to retrieve them. For more information, see [Retrieve credentials from AWS Secrets Manager](/docs/references/secrets-manager). 
    
    Otherwise, you can put your credentials like usernames and passwords in plain form like the sample below:

    ```YAML
    type: YUGABYTESQL

    host: HOSTNAME
    port: PORT_NUMBER

    database: 'DATABASE_NAME'
    username: 'USERNAME'
    password: 'PASSWORD'

    max-connections: 30
    max-retries: 10
    retry-wait-duration-ms: 1000

    socket-timeout-s: 60
    ```

    Replace the following:
    
    - *`HOSTNAME`*: the hostname of the YugabyteDB cluster
    - *`PORT_NUMBER`*: the port number (default port is `5433`)
    - *`DATABASE_NAME`*: the name of the database you're connecting to (default is `yugabyte`)
    - *`USERNAME`*: the username for the YugabyteDB database
    - *`PASSWORD`*: the password associated with *`USERNAME`*

    The timeout value `socket-timeout-s` is used for socket read operations. The timeout is specified in seconds and a value of zero means that it is disabled.

    Pay attention to the following before proceeding to the next steps:
    - Make sure the specified user has `CREATE TABLE` on the catalogs/schemas into which replicated tables should be created.
    - If you want Replicant to create catalogs/schemas for you on the target YugabyteSQL system, then you also need to grant `CREATE DATABASE`/`CREATE SCHEMA` privileges to the user.
    - If this user does not have `CREATE DATABASE` privilege, then create a database manually with name `io` and grant all privileges for it to the user specified here. Replicant uses this database for internal checkpointing and metadata management.  

        {{< hint "info" >}} The database or schema of your choice on a different instance of your choice name can be configured using the metadata config feature. For more information, see [Metadata Configuration](/docs/references/metadata-reference).{{< /hint >}}

## II. Configure mapper file (optional)
If you want to define data mapping from source to your target YugabyteSQL, specify the mapping rules in the mapper file. The following is a sample mapper configuration for a **Oracle-to-YugabyteSQL** pipeline:

```YAML
rules:
  [tpch, public]:
    source:
    - "tpch"
convert-case: DEFAULT
```

For more information on how to define the mapping rules and run Replicant CLI with the mapper file, see [Mapper Configuration]({{< ref "/docs/references/mapper-reference" >}}).

## III. Set up Applier configuration

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
