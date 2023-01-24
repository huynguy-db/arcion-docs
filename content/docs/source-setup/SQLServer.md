---
pageTitle: Documentation for SQL Server Source connector
title: Microsoft SQL Server
description: "Set SQL Server as data Source in data pipelines. Use our in-house CDC extractor, or Change Tracking for fast, real-time replication."

bookHidden: false
---

# Source Microsoft SQL Server

The extracted `replicant-cli` will be referred to as the `$REPLICANT_HOME` directory in the proceeding steps.

## I. Set up Replicant Windows Agent

To intsall and set up [SQL Server Agent to use as CDC Extractor](#specify-cdc-extractor), please follow the instructions in [Replicant SQL Server Agent Installation](/docs/references/source-prerequisites/sqlserver/#windows-agent-installation).

## II. Check Permissions

You need to verify that the necessary permissions are in place on source SQL Server in order to perform replication. To know about the permissions, see [SQL Server User Permissions](/docs/references/source-prerequisites/sqlserver/#sql-server-user-permissions).

## III. Set up Connection Configuration

1. From `$REPLICANT_HOME`, navigate to the sample connection configuration file:

   ```BASH
   vi conf/conn/sqlserver.yaml
   ```

2. If you store your connection credentials in AWS Secrets Manager, you can tell Replicant to retrieve them. For more information, see [Retrieve credentials from AWS Secrets Manager](/docs/references/secrets-manager). 

    Otherwise, you can put your credentials in plain form like the sample below:

   ```YAML
   type: SQLSERVER

   extractor: {CHANGE|LOG}

   host: localhost
   port: 1433

   username: 'USERNAME'
   password: 'PASSWORD'
   database: 'tpcc'

   max-connections: MAX_NUMBER_OF_CONNECTIONS

   #ssl:
   #  enable: true
   #  hostname-verification: false
   ```

   Replace the following:

   - *`USERNAME`*: the username to connect to the SQL Server
   - *`PASSWORD`*: the password associated with *`USERNAME`*
   - *`MAX_NUMBER_OF_CONNECTIONS`*: the maximum number of connections Replicant would use to fetch data from source—for example, `30`

    {{< hint "warning" >}}
  
  If you're hosting SQL Server on Azure, you must set the following parameter to `true` in the connection configuration file:

  ```YAML
  is_azure: true
  ```
    {{< /hint >}}

    ### Specify CDC Extractor
    For your Source SQL Server, you can choose from two CDC Extractors. You can specify the Extractor to use by setting the `extractor` parameter in the connection configuration file to any of the following values:  
    
      - `CHANGE`: The default value. With this value set, SQL Server Change Tracking is used for real-time replication. In this case, you don't need to follow [the documentation for Replicant SQL Server Agent](#i-set-up-replicant-windows-agent).

        {{< details title="Enable Change Tracking" open=false >}}
  To use SQL Server Change Tracking for realtime, all databases and tables must have change tracking enabled:
  - To enable Change Tracking on a database, execute the following SQL command:
    ```SQL
    ALTER DATABASE database_name SET CHANGE_TRACKING = ON  
    (CHANGE_RETENTION = 2 DAYS, AUTO_CLEANUP = ON)
    ```
      Replace *`database_name`* with the name of the database you want Change Tracking enabled on.

  - To enable Change Tracking on table, execute the following SQL command for each table being replicated:
    ```SQL
    ALTER TABLE table_name ENABLE CHANGE_TRACKING
    ```
      Replace *`table_name`* with the name of the table you want Change Tracking enabled on.
        {{< /details >}}
      
      - `LOG`: Uses the Replicant SQL Server Agent as CDC Extractor. In this case, please follow the [Replicant SQL Server Agent docs](/docs/references/source-prerequisites/sqlserver/#windows-agent-installation).

    ### Specify authentication protocol for connection
   
    - To specify an authentication protocol for the connection, set the `auth-type` parameter in the connection cofiguration file to any of the following values:
      - `NATIVE` 
      - `NLTM`
    
      Default authentication protocol will always be `NATIVE` if you don't explicitly set the `auth-type` parameter.
    - In case of `NLTM` as `auth-type`, provide the `username` in `DOMAIN\USER` format—for example, `domain\replicant`.

    ### Use KeyStore for credentials
    Replicant supports consuming login credentials from a _credentials store_ rather than having users specify them in plain text configuration file. Instead of specifying username and password as above, you can keep them in a KeyStore and provide its details in the connection configuration file like below:

    ```YAML
    credentials-store:
      type: {PKCS12|JKS|JCEKS}
        path: PATH_TO_KEYSTORE_FILE
        key-prefix: PREFIX_OF_THE_KEYSTORE_ENTRY
        password: KEYSTORE_PASSWORD
    ```

    Replace the following:

    - *`PATH_TO_KEYSTORE_FILE`*: the path to your KeyStore file.
    - *`PREFIX_OF_THE_KEYSTORE_ENTRY`*: you should create entries in the credential store for `username` and `password` configs using a prefix and specify the prefix here. For example, you can create keystore entries with aliases `sqlserver_username` and `sqlserver_password`. You can then specify the prefix here as `sqlserver_`.
    - *`KEYSTORE_PASSWORD`*: the KeyStore password. This is optional. If you don’t want to specify the KeyStore password here, then you must use the UUID from your license file as the KeyStore password. Remember to keep your license file somewhere safe in order to keep this password secure.

## IV. Set up Extractor Configuration
To configure replication mode according to your requirements, specify your configuration in the Extractor configuration file. You can find a sample Extractor configuration file `sqlserver.yaml` in the `$REPLICANT_HOME/conf/src` directory. For a detailed explanation of configuration parameters in the Extractor file, see [Extractor Reference]({{< ref "/docs/references/extractor-reference" >}} "Extractor Reference").

You can configure the following replication modes by specifying the parameters under their respective sections in the configuration file:

- `snapshot`
- `realtime`
- `delta-snapshot`
  
See the following sections for more information.

For more information about different Replicant modes, see [Running Replicant]({{< ref "running-replicant" >}}).

### `snapshot` mode

The following is a sample configuration for operating in `snapshot` mode:

```YAML
snapshot:
  threads: 16
  fetch-size-rows: 5_000

  _traceDBTasks: true
  min-job-size-rows: 1_000_000
  max-jobs-per-chunk: 32

  per-table-config:
  - catalog: tpch      
    schema: dbo
    tables:
      lineitem:
        row-identifier-key: [l_orderkey, l_linenumber]
        split-key: l_orderkey
        split-hints:
          row-count-estimate: 15000
          split-key-min-value: 1
          split-key-max-value: 60000
```
For more information about the configuration parameters for `snapshot` mode, see [Snapshot Mode]({{< ref "/docs/references/extractor-reference#snapshot-mode" >}})

### `delta-snapshot` mode
The following is a sample configuration for operating in `delta-snapshot` mode:

```YAML
delta-snapshot:
  threads: 32
  fetch-size-rows: 10_000

  min-job-size-rows: 1_000_000
  max-jobs-per-chunk: 32
  _max-delete-jobs-per-chunk: 32

  delta-snapshot-key: col1
  delta-snapshot-interval: 10
  
  per-table-config:
  - catalog: tpch
    schema: public
    tables:
      part:
        delta-snapshot-key: last_update_time
      lineitem:
        delta-snapshot-key: last_update_time
        row-identifier-key: [l_orderkey, l_linenumber]
```
For more information about the configuration parameters for `delta-snapshot` mode, see [Delta snapshot mode]({{< ref "/docs/references/extractor-reference#delta-snapshot-mode" >}}).

### `realtime` mode

#### Create the heartbeat table 
For [`full` mode replication]({{< ref "docs/running-replicant#replicant-full-mode" >}}), you need to create a heartbeat table. For example:

```SQL
CREATE TABLE "tpcc"."dbo"."replicate_io_cdc_heartbeat"("timestamp" BIGINT NOT NULL, PRIMARY KEY("timestamp"))
```

#### Specify `realtime` mode parameters
The following is a sample configuration for operating in `realtime` mode:

```YAML
realtime:
  threads: 4
  fetch-size-rows: 10000
  fetch-duration-per-extractor-slot-s: 3
  heartbeat:
    enable: true
    catalog: "tpcc"
    schema: "dbo"
    interval-ms: 10000
```
For more information about the configuration parameters for `realtime` mode, see [Realtime Mode]({{< ref "/docs/references/extractor-reference#realtime-mode" >}}).


