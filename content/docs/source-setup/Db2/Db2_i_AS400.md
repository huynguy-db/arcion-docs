---
pageTitle: Documentation for Db2 Source on i Series AS/400
title: Native i Series AS/400
description: "Learn how Arcion offers realtime, distributed, CDC-based replication on Db2 i Series AS/400 platform."
weight: 2
bookHidden: false
---

# Source IBM Db2 on Native i Series AS/400

This page describes how to set up CDC-based replication from Source Db2 server on the IBM i AS/400 platform.


## I. Check Permissions

1. The user should have read access on all the databases, schemas, and tables to be replicated.

2. The user should have read access to following system tables and views:
  
    a. `QSYS2.SYSTABLES`

    b. `SYSIBM.SQLTABLETYPES`

    c. `QSYS2.SYSCOLUMNS`

    d. `QSYS2.SYSCSTCO`

    e. `SYSIBM.SQLCOLUMNS`

    f. `SYSIBM.COLUMNS` (required for for [`fetch-schemas`](/docs/running-replicant/#fetch-schemas) mode mode)

3. The user should have execute permissions on following system procedures:

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

## III. Enable CDC Replication

For enabling CDC-based replication, follow the steps described below.

### Configure Journal

1. Configure one journal for each library being replicated.

2.  You must configure journals with the following format options for CDC replication:

    a. Minimize entry data - data areas: NO

    b. Minimize entry data - database files: NO

    c. Minimize fixed portion of entries: NO

    d. Ensure that journals have commitment control enabled. If it's not, run the following command on the database server:

      ```SH
      STRCMTCTL LCKLVL(*CHG) CMTSCOPE(*JOB)  TEXT('Replication Group')
      ```

### Configure Replicant

Configure your Source Db2 connection configuration file for Replicant like the following:

```YAML
type: DB2
 
database: database
host: localhost
port: 446
 
username: replicant
password: "Replicant123"
 
transaction-store-location: "~/temp/"
transaction-store-cache-limit: 100000
 
platform: AS400
 
max-connections: 30
 
max-retries: 10
retry-wait-duration-ms: 1000
 
cdc-log-config:
  cdc-log-storage: READ_LOG
  journals:
  - journal-library: TESTSCH
    journal-name: QSQJRN
```

- `journals`: Represents the list of Db2 journals that Replicant will read CDC logs from.
- `journal-library`: The library (schema) that the journal is in.

#### Retrieve credentials from AWS Secrets Manager
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
type: DB2
 
database: database

host: arcion-sm://connectionConfig/host
port: arcion-sm://connectionConfig/port

username: arcion-sm://connectionConfig/username
password: arcion-sm://connectionConfig/password
 
transaction-store-location: "~/temp/"
transaction-store-cache-limit: 100000
 
platform: AS400
 
max-connections: 30
 
max-retries: 10
retry-wait-duration-ms: 1000
 
cdc-log-config:
  cdc-log-storage: READ_LOG
  journals:
  - journal-library: TESTSCH
    journal-name: QSQJRN
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