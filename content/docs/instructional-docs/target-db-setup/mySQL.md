---
title: mySQL
weight: 3
bookHidden: true
---
# Destination mySQL

## I. Setup Connection Configuration

1. From Replicant's ```Home``` directory, navigate to the sample mySQL connection configuration file
    ```BASH
    vi conf/conn/mysql_dst.yaml
    ```
2. Make the necessary changes as follows:
    ```YAML
    type: MYSQL

    host: localhost #Replace localhost with your MySQL host
    port: 57565 #Replace the 57565 with the port of your host

    username: "replicant" #Replace replicant with the username of your user that connects to your MySQL server
    password: "Replicant#123"  #Replace Replicant#123 with your user's password

    max-connections: 30 #Specify the maximum number of connections replicant can open in MySQL
    ```

## II. Setup Applier Configuration

1. Navigate to the mySQL sample applier configuration file
    ```BASH
    vi conf/dst/mysql.yaml
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
