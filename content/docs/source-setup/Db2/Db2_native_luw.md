---
title: Native LUW
weight: 2
bookHidden: false
---

# Source IBM Db2 with Native LUW

You may want to use [db2ReadLog API](https://www.ibm.com/docs/en/db2/11.1?topic=apis-db2readlog-read-log-records) to read log records from the Db2 database logs, or query the Log Manager for current log state information. This page describes how to do that in Arcion when using Db2 as source.

## I. Check Permissions

1. The user should have read access on all the databases, schemas, and tables to be replicated.

2. The user should have read access to following system tables and views:

    a. `SYSIBM.SYSTABLES`

    b. `SYSIBM.SQLTABLETYPES`

    c. `SYSIBM.SYSCOLUMNS`

    d. `SYSIBM.SYSTABCONST`

    e. `SYSIBM.SQLCOLUMNS`
    
    f. `SYSCAT.COLUMNS` (required for [`fetch-schemas`](/docs/running-replicant/#fetch-schemas) mode).

3. The user should have execute permissions on the following system procedures:

    a. `SYSIBM.SQLTABLES`

    b. `SYSIBM.SQLCOLUMNS`

    c. `SYSIBM.SQLPRIMARYKEYS`

    d. `SYSIBM.SQLSTATISTICS`

{{< hint "info" >}}
Users need these permissions only once at the start of a fresh replication.
{{< /hint >}}

## II. Create the Heartbeat Table

For CDC replication, you must create the heartbeat table on the Source database with the following DDL:

```SQL
CREATE TABLE "tpch"."replicate_io_cdc_heartbeat"("timestamp" BIGINT NOT NULL, 
CONSTRAINT "cdc_heartbeat_id_default_default" PRIMARY KEY("timestamp"))
```

## III. Enable CDC-based Replication

If you're performing CDC-based replication from the source Db2 server, please follow the steps below:

### On system running source Db2 server:

1. For any tables being replicated, run the following command:

    ```SQL
    ALTER TABLE <TABLE> DATA CAPTURE CHANGES
    ```

2. Check if the database is recoverable by running the followingg command:

    ```shell
    db2 get db cfg for <DATABASE> show detail | grep -i "logarch"
    ```
    If either `LOGARCHMETH1` or `LOGARCHMETH2` is set, the database is already recoverable.

    {{< hint "info" >}}Skip the next step if the database is already recoverable.{{< /hint >}}

3. Update the db2 logging method by running the following command:

    ```shell
    db2 update db cfg for <DATABASE> using LOGARCHMETH1 LOGRETAIN
    ```
    Updating the logging methods leaves the database in a *Backup Pending* state. To recover from this, you need to backup the database with:
    ```shell
    db2 backup db <DATABASE> to <DESTINATION>
    ```
### On system running Arcion Replicant:

{{< hint "info" >}}Skip steps 2-6 if Replicant is running from the same system as the source Db2 database.{{< /hint >}}

1. Configure the `JAVA_OPTS` environment variable with:
    ```shell
    export JAVA_OPTS=-Djava.library.path=lib
    ```

2. Install Db2 Data Server Client Prerequisites by running the following commands:

    ```shell
    sudo dpkg --add-architecture i386
    sudo apt install libaio1 libstdc++6:i386 libpam0g:i386
    sudo apt install binutils
    ```
3. Install Db2 Data Server Client:

    a. Download latest version of [Db2 Data Server Client from IBM](https://www.ibm.com/support/pages/download-initial-version-115-clients-and-drivers).

    b. Extract and start the installer by running `db2_setup`.

    c. Select **Custom** installation.

    d. Check the **Base Application Development tools** option on page 2 of the installation wizard.
    
    e. Leave remaining options as default and complete the installation.

4. Catalog the source Db2 Server node by running the following:

    ```shell
    db2 catalog tcpip node <NODE_NAME> remote <REMOTE> server <PORT>
    ```

5. Catalog the source Db2 database:

    ```shell
    db2 catalog database <DATABASE> at node <NODE_NAME>
    ```

6. Finally, test the connection with:

    ```shell
    db2 connect to <DATABASE> user <USER>
    ```

## III. Configure Replicant

You also need to configure Replicant's Db2 connection configuration file:

1. Add a new property called `node`, representing the name of the Db2 node you're connecting to. It can go anywhere in the root of the file. The default node name is the Db2 user’s name. For example, below is a part of the configuration file with Db2 server connection info where we've added the `node`:

    ```yaml
    type: DB2

    database: tpch
    host: localhost
    port: 50002

    node: db2inst1

    username: replicant
    password: "Replicant#123"

    max-connections: 30

    max-retries: 10
    retry-wait-duration-ms: 1000
    ```

2. Set the value of `cdc-log-storage` to `READ_LOG`. This tells Replicant that you want to use the native db2ReadLog as the CDC log reader:

    ```yaml
    cdc-log-config:
        cdc-log-storage: READ_LOG
    ```


## IV. Set up Extractor Configuration

1. From `$REPLICANT_HOME`, navigate to the Extractor configuration file:
   ```BASH
   vi conf/src/db2.yaml
   ```

2. The Extractor configuration file has three parts:

    - Parameters related to snapshot mode.
    - Parameters related to delta snapshot mode.
    - Parameters related to realtime mode.

    ### Parameters related to snapshot mode
    For snapshot mode, you can make use of the following sample:

    ```YAML
    snapshot:
      threads: 16
      fetch-size-rows: 5_000

      _traceDBTasks: true
      #fetch-schemas-from-system-tables: true

      per-table-config:
      - catalog: tpch
        schema: db2user
        tables:
          lineitem:
            row-identifier-key: [l_orderkey, l_linenumber]
    ```

    ### Parameters related to delta snapshot mode
    For delta delta snapshot mode, you can make use of the following sample:

    ```YAML
    delta-snapshot:
      #threads: 32
      #fetch-size-rows: 10_000

      #min-job-size-rows: 1_000_000
      max-jobs-per-chunk: 32
      _max-delete-jobs-per-chunk: 32

      delta-snapshot-key: last_update_time
      delta-snapshot-interval: 10
      delta-snapshot-delete-interval: 10
      _traceDBTasks: true
      replicate-deletes: false
    
      per-table-config:
        - catalog: tpch
          schema: db2user
          tables:
            #      testTable
            #        split-key: split-key-column
            #        split-hints:
            #          row-count-estimate: 100000 
            #          split-key-min-value: 1 
            #          split-key-max-value: 60_000
            #        delta-snapshot-key: delta-snapshot-key-column
            #        row-identifier-key: [col1, col2]
            #        update-key: [col1, col2]
            partsupp:
              split-key: partkey
    ```

    ### Parameters related to realtime mode
    For realtime mode, you can make use of the following sample:
    
    ```YAML
    realtime:
      #threads: 1
      #fetch-size-rows: 10000
      _traceDBTasks: true
      #fetch-interval-s: 0
      replicate-empty-string-as-null: true

    #  start-position:
    #    commit-time: '2020-08-24 08:16:38.019002'
    # idempotent-replay: false

      heartbeat:
        enable: true
        catalog: tpch
        schema: db2user
        #table-name: replicate_io_cdc_heartbeat
        #column-name: timestamp
        interval-ms: 10000
    ```

    In the sample above, notice the following details:
    
    - The parameter `commit-time` specifies the timestamp in UTC under `start-position`, which indicates the starting log position for realtime replication. To get a timestamp in UTC, you can execute the following query:

      ```SQL
      SELECT CURRENT TIMESTAMP - CURRENT TIMEZONE AS UTC_TIMESTAMP FROM SYSIBM.SYSDUMMY1
      ```
    - If you've set `message-format` to `DELIMITED`, set `replicate-empty-string-as-null` to `true`.

For a detailed explanation of configuration parameters in the Extractor file, read [Extractor Reference]({{< ref "/docs/references/extractor-reference" >}} "Extractor Reference").