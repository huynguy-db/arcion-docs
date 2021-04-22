---
title: PostgreSQL
weight: 5
---
# Destination PostgreSQL

## I. Setup Connection Configuration

1. From Replicant's ```Home``` directory, navigate to the sample postgreSQL connection configuration file
    ```BASH
    vi conf/conn/postgresql.yaml
    ```
2. Make the necessary changes as follows:  
    ```YAML
      type: POSTGRESQL

      host: localhost
      port: 5432

      database: 'tpch'
      username: 'replicant'
      password: 'Replicant#123'

      max-connections: 30
      max-retries: 10
      retry-wait-duration-ms: 1000

      replication-slots:
        io_replicate:
          - wal2json
        io_replicate1:
          - wal2json

      #log-reader-type: SQL [SQL|STREAM]
    ```

## II. Setup Applier Configuration

1. Navigate to the PostGreSql sample applier configuration file
    ```BASH
    vi conf/dst/postgresql.yaml    
    ```
2. Make the necessary changes as follows:
    ```YAML
    snapshot:
     threads: 16

     bulk-load:
       enable: true
       type: FILE   # PIPE, FILE
    ```
