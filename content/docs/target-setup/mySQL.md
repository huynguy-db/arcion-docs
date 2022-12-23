---
pageTitle: Ingest data into MySQL
title: MySQL
description: "Using Arcion's high-performance replication engine, load data into MySQL. Securely connect with necessary permissions and enable native-fast bulk-loading."
weight: 9
bookHidden: false   
---
# Destination MySQL

The extracted `replicant-cli` will be referred to as the `$REPLICANT_HOME` directory in the proceeding steps.

## I. Prerequisites
Pay attention to the following before configuring MySQL as the Target system:

- Make sure the specified user has `CREATE TABLE` and `CREATE TEMPORARY TABLE` privileges on the catalogs/schemas into which replicated tables should be created.
- If you want Replicant to create catalogs/schemas for you on the target MySQL system, then you also need to grant `CREATE DATABASE`/`CREATE SCHEMA` privileges to the user.
- If this user does not have `CREATE DATABASE` privilege, then create a database manually with name `io_blitzz` and grant all privileges for it to the user specified here. Replicant uses this database for internal checkpointing and metadata management.

## II. Set up Connection Configuration

1. From `$REPLICANT_HOME`, navigate to the sample MySQL connection configuration file:
    ```BASH
    vi conf/conn/mysql_dst.yaml
    ```
2. You can establish connection with Target MySQL using either SSL or plain username and password.

    ### Connect using username and password
    If you store your connection credentials in AWS Secrets Manager, you can tell Replicant to retrieve them. For more information, see [Retrieve credentials from AWS Secrets Manager](/docs/references/secrets-manager). 
        
      Otherwise, you can put your credentials like usernames and passwords in plain form like the sample below:
      ```YAML
      type: MYSQL

      host: HOSTNAME
      port: PORT_NUMBER
      
      username: "USERNAME"
      password: "PASSWORD" 

      max-connections: 30 #Specify the maximum number of connections replicant can open in MySQL
      max-retries: 10 #Number of times any operation on the system will be re-attempted on failures.
      retry-wait-duration-ms: 1000 #Duration in milliseconds replicant should wait before performing then next retry of a failed operation
      ```
      Replace the following:
      - *`HOSTNAME`*: the hostname of the Target MySQL host
      - *`PORT_NUMBER`*: the relevant port number of the MySQL host
      - *`USERNAME`*: the username credential that connects to the MySQL host
      - *`PASSWORD`*: the password associated with *`USERNAME`*

      ### Connect using SSL
      If you use SSL for connection, you don't need to provide the `host`, `port`, `username`, and `password` parameters separately like the preceeding sample. Rather, specify a single connection URL that connects to the MySQL server containing the necessary credentials. You can specify this URL with the `url` parameter in the connection configuration file.

      The connection URL has the following syntax:

      ```
      mysql://HOST:PORT/?user=USERNAME&password=PASSWORD&useSSL=true&allowPublicKeyRetrieval=true
      ``` 

      Replace the following:
      - *`HOST`*: the hostname of the Target MySQL server
      - *`PORT`*: the relevant port number of the MySQL host
      - *`USERNAME`*: the username credential that connects to the MySQL host
      - *`PASSWORD`*: the password associated with *`USERNAME`*

      The following is a sample that uses SSL connection:

      ```YAML
      type: MYSQL

      url: "mysql://localhost:3306/?user=replicant&password=replicant123&useSSL=true&allowPublicKeyRetrieval=true"

      max-connections: 30
      max-retries: 10 
      retry-wait-duration-ms: 1000
      ```

## III. Set up Applier Configuration

1. From `$REPLICANT_HOME`, naviagte to the sample MySQL applier configuration file:
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

For a detailed explanation of configuration parameters in the applier file, read [Applier Reference]({{< ref "/docs/references/applier-reference" >}} "Applier Reference").
