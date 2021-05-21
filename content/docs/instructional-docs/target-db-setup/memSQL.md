---
title: MemSQL
weight: 2
bookHidden: true
---
# Destination memSQL

## Prerequisites
You must have a user configured in memSQL for replication with `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `CREATE`, `DROP` permissions on application databases.

If memsql user does not have create database permission then you must create a database named `io_replicate` and provide `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `CREATE`, `DROP` privileges to memsql user.

## I. Setup Connection Configuration

1. From Replicant's ```Home``` directory, navigate to the sample memSQL connection configuration file
    ```BASH
    vi conf/conn/memsql.yaml
    ```

2. Make the necessary changes as follows:
    ```YAML
    type: MEMSQL

    host: localhost #Replace localhost with address to your MemSQL host
    port: 3306 #Replace default port 3306 if needed

    username: 'replicant' #Replace replicant with your memSQL user
    password: 'Replicant#123' #Replace Replicant#123 with your user's password

    max-connections: 30 #Specify the maximum number of connections replicant can open in MemSQL
    ```

## Setup Applier Configuration

Edit the applier configurations if required.  

1. 1. From ```HOME```, navigate to the Applier Configuration File:
   ```BASH
   vi conf/dst/memsql.yaml
   ```

2. Make the necessary changes as follows:
    ```YAML
    snapshot:
      table-store: COLUMN #Applied to all tables; can be overridden for certain tables if needed in the per-table-config section below
      per-table-config:
        catalog: tpch
          tables:
            MemSQL_orders: #Replace MemSQL_orders with the name of the specific table you are configuring for in memSQL
            table-store: COLUMN #Enter the table's store (ROW/COLUMN etc.)
            sort-key: [MemSQL_orderkey] #If applicable, replace MemSQL_orderkey with a list of columns to be created as the sort key
            shard-key: [c2] #If applicable, replace c2 with a list of columns to be created as the shared key

    realtime:
      #replay-shard-key-update-as-delete-insert: true
      #retry-failed-txn-idempotently: true
    ```
