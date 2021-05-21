---
title: MariaDB
weight: 9
bookHidden: true
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

    host: localhost #Replace localhost with your MariaDB host
    port: 57565 #Replace the 57565 with the port of your host

    username: "replicant" #Replace replicant with the username of your user that connects to your MariaDB server
    password: "Replicant#123" #Replace Replicant#123 with your user's password

    max-connections: 30 #Specify the maximum number of connections replicant can open in MariaDB
    ```

## II. Setup Applier Configuration

1. Navigate to the Maria Database sample Applier Configuration file
    ```BASH
    vi conf/dst/mariadb.yaml    
    ```
2. Make the necessary changes as follows:
    ```YAML
    snapshot:
      threads: 32 #Specify the maximum number of threads Replicant should use for writing to the target
      batch-size-rows: 10_000 #Specify the size of a batch
      txn-size-rows: 1_000_000 #Determines the unit of an applier-side job

    #If bulk-load is used, Replicant will use the native bulk-loading capabilities of the target database
    bulk-load:
      enable: true|false #Set to true if you want to enable bulk loading
      type: FILE|PIPE #Specify the type of bulk loading between FILE and PIPE
      serialize: true|false #Set to true if you want the generated files to be applied in serial/parallel fashion

      #For versions 20.09.14.3 and beyond
      native-load-configs: #Specify the user-provided LOAD configuration string which will be appended to the s3 specific LOAD SQL command
    ```
