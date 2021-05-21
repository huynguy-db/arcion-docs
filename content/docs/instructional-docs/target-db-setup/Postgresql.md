---
title: PostgreSQL
weight: 5
bookHidden: true
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

      host: localhost #Replace localhost with your PostgreSQL host
      port: 5432  #Replace the 57565 with the port of your host

      database: 'tpch' #Replace tpch with your database name
      username: 'replicant' #Replace replicant with the username of your user that connects to your PostgreSQL server
      password: 'Replicant#123' #Replace Replicant#123 with your user's password

      max-connections: 30 #Specify the maximum number of connections replicant can open in PostgreSQL

      #List your replication slots (slots which hold the real-time changes of the source database) as follows
      replication-slots:
        io_replicate: #Replace "io-replicate" with your replication slot name
          - wal2json
        io_replicate1: #Replace "io-replicate1" with your replication slot name
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
     threads: 16 #Specify the maximum number of threads Replicant should use for writing to the target

     #If bulk-load is used, Replicant will use the native bulk-loading capabilities of the target database
     bulk-load:
       enable: true|false #Set to true if you want to enable bulk loading
       type: FILE|PIPE #Specify the type of bulk loading between FILE and PIPE
       serialize: true|false #Set to true if you want the generated files to be applied in serial/parallel fashion

       #For versions 20.09.14.3 and beyond
       native-load-configs: #Specify the user-provided LOAD configuration string which will be appended to the s3 specific LOAD SQL command
    ```
