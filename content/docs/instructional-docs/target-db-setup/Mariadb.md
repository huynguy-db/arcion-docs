---
title: MariaDB
weight: 9
---
# Destination Maria Database  

## I. Setup Connection Configuration

1. From Replicant's ```Home``` directory, navigate to the sample Maria Database connection configuration file
    ```BASH
    vi conf/conn/mariadb_dst.yaml
    ```
2. Make the necessary changes as follows:
    ```YAML
    type: MARIADB

    host: localhost
    port: 57565

    username: "replicant"
    password: "Replicant#123"

    max-connections: 30

    max-retries: 10
    retry-wait-duration-ms: 1000
    ```

## II. Setup Applier Configuration

1. Navigate to the Maria Database sample Applier Configuration file
    ```BASH
    vi conf/dst/mariadb.yaml    
    ```
2. Make the necessary changes as follows:
    ```YAML
    snapshot:
      threads: 32
    #  batch-size-rows: 10_000
    #  txn-size-rows: 1_000_000

      bulk-load:
        enable: true
        type: FILE
    ```
