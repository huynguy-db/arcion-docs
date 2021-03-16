---
title: Oracle
---
# Destination: Oracle

## I. Setup Directory

1. Create a directory and give it ```READ``` and ```WRITE``` permissions in both Replicant's host user and the destination Oracle Server

From here onwards, the directory created in step one will be referred to as the ```Shared``` directory. This is only for reference purposes- you may name the directory as you wish.



## II. Setup Replicant User Permissions

  1. **TO BE REPLACED** Navigate to where these privileges are granted
  2. Grant the following privileges to the host replicant user
    ```BASH
    GRANT CREATE SCHEMA TO $USERNAME
    GRANT CREATE TABLE TO $USERNAME
    GRANT CREATE ANY DIRECTORY TO $USERNAME
    GRANT ALTER TABLE TO $USERNAME
    ```
    Note: If you do not want to grant the user the ```CREATE SCHEMA``` permission, manually create a schema named io_replicate, and the grant the other two permissions to Replicant's host user.

## III. Setup Connection Configuration

1. From ```HOME```, navigate to the sample connection configuration file

  ```BASH
  vi conf/conn/oracle_dst.yaml
  ```

2. Make the necessary changes to the connection configuration file as shown below:

    ```YAML
    type: ORACLE
    host: #Enter the hostname of the Oracle server
    port: #Enter the port number to connect to the server
    username: #Enter the username to connect to server
    credential-store: #Edit the following configurations if you wish to specify the username and password in a credential store instead of specifying the user details in plain text in the configuration file
      type: PKCS12 | JKS | JCEKS
      path: #Enter the location of the key-store
      Key-prefix: #Create entries in the credential store for username and password configs using a prefix and specify the prefix here
      Password: #Entering a keystore password here is optional;
      #however, if you do not specify the keystore password here,
      #you must use the UUID from your license file as the keystore password.
    max-connections: #Enter the maximum number of connections replicant would use to write data to the destination Oracle system.
    Service-name: #Enter the service name that contains the schema which is going to be replicated
    Stage: The ```shared``` directory must be specified in the stage configuration as below
      a.	type: SHARED_FS
      b.	root-dir: #Enter the path of the Shared Directory
    max-retries: #Enter the maximum number of time an operation will be re-attempted when an operation fails
    retry-wait-duration-ms: #Enter the duration, in milliseconds, replicant should wait before performing then next retry of a failed operation
    charset [20.12.04.4]: #Enter the charset value in the source database connection configuration

    ```

## IV. Setup Applier Configuration

1. From ```HOME```, navigate to the Applier Configuration File:
   ```BASH
   vi
   ```

2. For Replicant's snapshot mode, make the necessary changes as shown below.
   ```YAML
   snapshot:
     threads: #Enter the maximum number of threads Replicant should use while writing to the target database
     batch-size-rows: #Enter the appropriate size of a bath in accordance to your replication use case This configuration determines the size of a batch.
     txn-size-rows: #Enter the appropriate unit for each applier side job size????
     bulk-load: #Edit the following specifications to enable/configure Replicant to bulk loading into the target database
        enable: #Enter "True" to enable bulk loading
        type: #Enter the type of bulk loading; either FILE or PIPE based.
        serialize: #Enter true if you want the files generated to be applied in a serial/parallel fashion
        native-load-configs [20.09.14.3]: User provided LOAD config string. These will be appended to the target specific LOAD SQL command.
     use-quoted-identifiers: #Enter either true or false; Entering true will enable Replicant to quote catalog, schema, table, view, column names while creating and accessing them
     skip-tables-on-failures: #Enable this configuration if you want to skip a table that is failing to be replicated and continue replicating the remaining tables
     deferred-delete: #TBD
     init-indexes: #Change to false if you do not want to create indexes on the targetDB in the replication process
     #(By default, index initialization is enabled)
     init-indexes-post-snapshot: #Change to false if you want to indexes to be created prior to the snapshot rather than after (by default, indexes are created after the snapshot)
   	 user-role:
        init-user-role: #When enabled, this configuration allows for the creation of a user/role on the target DB (by default this is true)
        default-password: #Specify the default password


   ```

2. For realtime replication, make the necessary changes as shown below.
   ```YAML
   realtime:
     threads: #Enter the maximum number of threads Replicant should use while writing to the target database
     batch-size-rows: #Enter the appropriate size of a bath in accordance to your replication use case This configuration determines the size of a batch.
     txn-size-rows: #Enter the appropriate unit for each applier side job size????
     use-quoted-identifiers: #Enter either true or false; Entering true will enable Replicant to quote catalog, schema, table, view, column names while creating and accessing them
     before-image-format: #Enter either KEY or ALL; Default is KEY
     after-image-format: #Enter either UPDATED or ALL; Default is UPDATED
     retry-transactions [20.06.01.2] : #Set this to 'true' to enable each real-time transaction to be retried upon failures; The number of retries and wait duration between each retry is driven by the connection configuration of target database
     retry-failed-txn-idempotently [20.09.14.8]: #IF "retry-transaction" is set to true, you can set this to ‘true’ if you want each real-time transaction to be retried idempotently on failure.
     replay-consistency [20.09.14.1]: #Set to GLOBAL, if you want realtime replication to be performed with  global transactional consistency; Set to EVENTUAL, if you want realtime replication to be performed with eventual consistency
     skip-upto-cursors [20.09.14.1]: #Only for replay-consistency GLOBAL; Use this to specify a list of cursor positions up to which replication must be skipped
     apply-key-update-as-replace:  #Set this to true if you want to allow replays of an update operation that changes values of key columns (primary, unique, shard key) as insert and delete
  ```
