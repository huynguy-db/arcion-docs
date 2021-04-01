---
title: MemSQL
weight:2
---
# Destination memSQL

## I. Setup Connection Configuration

1. From Replicant's ```Home``` directory, navigate to the sample memSQL connection configuration file
    ```BASH
    vi conf/conn/memsql.yaml
    ```

2. Make the necessary changes as follows:
    ```YAML
    type: MEMSQL

    host: localhost #Replace localhost with your oracle host name
    port: 3306 #Replace the default port number 3306 if needed

    username: 'REPLICANT' #Replace REPLICANT with your username of the user that connects to your oracle server
    password: 'Replicant#123' #Replace Replicant#123 with the your user's password

    max-connections: 30 #Maximum number of connections replicant can open in Oracle
    ```

## Setup Applier Configuration

If you want to change the table definitions in destination memSQL, change the applier configurations with the proceeding steps:  

1. 1. From ```HOME```, navigate to the Applier Configuration File:
   ```BASH
   vi conf/dst/memsql.yaml
   ```

2. Make the necessary changes as follows:
    ```YAML
    per-table-config:
      catalog: tpch
        tables:
        MemSQL_orders: #Replace MemSQL_orders with the name of the specific table you are configuring for in memSQL
          table-store: COLUMN #Enter the table's store (ROW?COLUMN etc.)
          sort-key: [MemSQL_orderkey] #Replace MemSQL_orderkey with the sort key to be created for this table
          shard-key: [c2] #If applicable, replace [c2] with the shared key for this target table
    ```
