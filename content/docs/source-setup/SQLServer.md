---
title: Microsoft SQL Server
weight: 11
bookHidden: false
---

# Source Microsoft SQL Server

The extracted `replicant-cli` will be referred to as the `$REPLICANT_HOME` directory in the proceeding steps.

## I. Set up Replicant Windows Agent

To intsall and set up [SQL Server Agent to use as CDC Extractor](#specify-cdc-extractor), please follow the instructions in [Replicant SQL Server Agent Installation](/docs/references/source-prerequisites/sqlserver/#windows-agent-installation).

## II. Check Permissions

You need to verify that the necessary permissions are in place on source SQL Server in order to perform replication. To know about the permissions, see [SQL Server User Permissions](/docs/references/source-prerequisites/sqlserver/#sql-server-user-permissions).

## III. Set up Connection Configuration

1. From `$REPLICANT_HOME`, navigate to the sample connection configuration file:

   ```BASH
   vi conf/conn/sqlserver.yaml
   ```

2. Make the necessary changes as follows:

   ```YAML
   type: SQLSERVER

   extractor: {CHANGE|LOG}

   host: localhost
   port: 1433

   username: 'USERNAME'
   password: 'PASSWORD'
   database: 'tpcc'

   max-connections: MAX_NUMBER_OF_CONNECTIONS

   #ssl:
   #  enable: true
   #  hostname-verification: false
   ```

   Replace the following:

   - *`USERNAME`*: the username to connect to the SQL Server
   - *`PASSWORD`*: the password associated with *`USERNAME`*
   - *`MAX_NUMBER_OF_CONNECTIONS`*: the maximum number of connections Replicant would use to fetch data from source—for example, `30`

    ### Specify CDC Extractor
    For your Source SQL Server, you can choose from two CDC Extractors. You can specify the Extractor to use by setting the `extractor` parameter in the connection configuration file to any of the following values:  
    
      - `CHANGE`: The default value. With this value set, SQL Server Change Tracking is used for real-time replication. In this case, you don't need to follow [the documentation for Replicant SQL Server Agent](#i-set-up-replicant-windows-agent).

        {{< details title="Enable Change Tracking" open=false >}}
  To use SQL Server Change Tracking for realtime, all databases and tables must have change tracking enabled:
  - To enable Change Tracking on a database, execute the following SQL command:
    ```SQL
    ALTER DATABASE database_name SET CHANGE_TRACKING = ON  
    (CHANGE_RETENTION = 2 DAYS, AUTO_CLEANUP = ON)
    ```
      Replace *`database_name`* with the name of the database you want Change Tracking enabled on.

  - To enable Change Tracking on table, execute the following SQL command for each table being replicated:
    ```SQL
    ALTER TABLE table_name ENABLE CHANGE_TRACKING
    ```
      Replace *`table_name`* with the name of the table you want Change Tracking enabled on.
        {{< /details >}}
      
      - `LOG`: Uses the Replicant SQL Server Agent as CDC Extractor. In this case, please follow the [Replicant SQL Server Agent docs](/docs/references/source-prerequisites/sqlserver/#windows-agent-installation).

    ### Specify authentication protocol for connection
   
    - To specify an authentication protocol for the connection, set the `auth-type` parameter in the connection cofiguration file to any of the following values:
      - `NATIVE` 
      - `NLTM`
    
      Default authentication protocol will always be `NATIVE` if you don't explicitly set the `auth-type` parameter.
    - In case of `NLTM` as `auth-type`, provide the `username` in `DOMAIN\USER` format—for example, `domain\replicant`.

    ### Use KeyStore for credentials
    Replicant supports consuming login credentials from a _credentials store_ rather than having users specify them in plain text configuration file. Instead of specifying username and password as above, you can keep them in a KeyStore and provide its details in the connection configuration file like below:

    ```YAML
    credentials-store:
      type: {PKCS12|JKS|JCEKS}
        path: PATH_TO_KEYSTORE_FILE
        key-prefix: PREFIX_OF_THE_KEYSTORE_ENTRY
        password: KEYSTORE_PASSWORD
    ```

    Replace the following:

    - *`PATH_TO_KEYSTORE_FILE`*: the path to your KeyStore file.
    - *`PREFIX_OF_THE_KEYSTORE_ENTRY`*: you should create entries in the credential store for `username` and `password` configs using a prefix and specify the prefix here. For example, you can create keystore entries with aliases `sqlserver_username` and `sqlserver_password`. You can then specify the prefix here as `sqlserver_`.
    - *`KEYSTORE_PASSWORD`*: the KeyStore password. This is optional. If you don’t want to specify the KeyStore password here, then you must use the UUID from your license file as the KeyStore password. Remember to keep your license file somewhere safe in order to keep this password secure.

## IV. Set up Extractor Configuration

1. From `$REPLICANT_HOME`, navigate to the applier configuration file:
   ```BASH
   vi conf/src/sqlserver.yaml
   ```
2. Make the necessary changes as follows:

   ```YAML
   snapshot:
     threads: 16
     fetch-size-rows: 5_000

     _traceDBTasks: true
   #  min-job-size-rows: 1_000_000
   #  max-jobs-per-chunk: 32

   #  per-table-config:
   #  - catalog: tpch      
   #    schema: dbo
   #    tables:
   #      lineitem:
   #        row-identifier-key: [l_orderkey, l_linenumber]
   #        split-key: l_orderkey
   #        split-hints:
   #          row-count-estimate: 15000
   #          split-key-min-value: 1
   #          split-key-max-value: 60000

   realtime:
    # agent-connection:
    #   enable: true #Enable reading files from the remote server over a socket.
    #   host: # Host running remote SQL Server CDC agent
    #   username: # Specified in `domain\user` format.
    #   password:
    #   port:
     threads: 4
     fetch-size-rows: 10000
     fetch-duration-per-extractor-slot-s: 3
   ```

   * The `agent-connection` field is optional. It defines the parameters used to connect to the socket-based file server.
     * The user can be either local to the remote system or a domain account, but must have read/write access to the directory on the remote system where transaction files are written. This is configured as the staging directory on the remote system.

For a detailed explanation of configuration parameters in the extractor file, read [Extractor Reference]({{< ref "/docs/references/extractor-reference" >}} "Extractor Reference").
