---
title: YugabyteSQL
weight: 7
bookHidden: true
---
# Destination YugabyteSQL

## I. Setup Connection Configuration

1. From Replicant's ```Home``` directory, navigate to the sample memSQL connection configuration file
    ```BASH
    vi conf/conn/memsql.yaml
    ```
2. Make the necessary changes as follows:

    ```YAML
    type: YUGABYTESQL

    host: localhost #Replace localhost with your YugabyteSQL host
    port: 5433 #Replace the 57565 with the port of your host

    database: 'io' #Replace io with your database name
    username: 'replicant' #Replace replicant with the username of your user that connects to your YugabyteSQL server
    password: 'Replicant#123' #Replace Replicant#123 with your user's password

    max-connections: 30 #Specify the maximum number of connections replicant can open in PostgreSQL
    ```

## II. Setup Applier Configuration

1. Naviagte to the sample YugabyteSQL applier configuration file
    ```BASH
    vi conf/dst/yugabytesql.yaml
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
