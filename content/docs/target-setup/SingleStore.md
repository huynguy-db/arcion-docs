---
title: SingleStore
weight: 8
bookHidden: false
---
# Destination SingleStore

The extracted `replicant-cli` will be referred to as the `$REPLICANT_HOME` directory in the proceeding steps.

## Prerequisites
You must have a user configured in SingleStore for replication with `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `CREATE`, `DROP` permissions on application databases.

If SingleStore user does not have create database permission then you must create a database named `io_replicate` and provide `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `CREATE`, `DROP` privileges to SingleStore user.

## I. Setup Connection Configuration

1. From `$REPLICANT_HOME`, navigate to the sample SingleStore connection configuration file:
    ```BASH
    vi conf/conn/singlestore.yaml
    ```

2. Make the necessary changes as follows:
    ```YAML
    type: SINGLESTORE

    host: localhost #Replace localhost with address to your SingleStore host
    port: 3306 #Replace default port 3306 if needed

    username: 'replicant' #Replace replicant with your SingleStore user
    password: 'Replicant#123' #Replace Replicant#123 with your user's password

    max-connections: 30 #Maximum number of connections replicant can open in SingleStore 
    max-retries: 10
    retry-wait-duration-ms: 1000
    ```

## II. Setup Applier Configuration

Edit the applier configurations if required.  

1. From `$REPLICANT_HOME`, navigate to the sample Applier Configuration File:
   ```BASH
   vi conf/dst/singlestore.yaml
   ```

2. Make the necessary changes as follows:
    ```YAML
    snapshot:
      table-store: COLUMN #Applied to all tables; can be overridden for certain tables if needed in the per-table-config section below
      per-table-config:
        catalog: tpch
          tables:
            singlestore_orders: #Replace this with the name of the specific table you are configuring for in SingleStore
            table-store: COLUMN #Enter the table's store (ROW/COLUMN etc.)
            sort-key: [singlestore_orderkey] #If applicable, replace singlestore_orderkey with a list of columns to be created as the sort key
            shard-key: [c2] #If applicable, replace c2 with a list of columns to be created as the shared key

    realtime:
      #replay-shard-key-update-as-delete-insert: true
      #retry-failed-txn-idempotently: true
    ```

3. Below is a sample applier file with commonly used configuration parameters:
    ```YAML
    snapshot:
      threads: 32
    #  batch-size-rows: 10_000
    #  txn-size-rows: 1_000_000

      bulk-load:
        enable: true
        type: FILE
        #native-load-configs: "ERRORS HANDLE 'singlestore_load_error'" #User provided SingleStore LOAD configs. These will be appended to the generated LOAD SQL command.

      #table-store: ROW
      #init-constraint-post-snapshot: false

      per-table-config:
      - catalog: tpch
        tables:
          singlestore_orders:
            table-store: COLUMN
            sort-key: [singlestore_orderkey]
            #shard-key: [c2]
          partsupp:
            #table-type: REGULAR | REFERENCE
            table-store: ROW
          partsupp_macro_delta:
            table-store: COLUMN
            sort-key: [partkey, suppkey]

    realtime:
      threads: 8
      txn-size-rows: 10000
      batch-size-rows: 1000
      _oper-queue-size-rows: 20000
    # replay-shard-key-update-as-delete-insert: true
    # retry-failed-txn-idempotently: true
    ```
For a detailed explanation of configuration parameters in the applier file, read: [Applier Reference]({{< ref "/docs/references/applier-reference" >}} "Applier Reference")
