---
title: Oracle
bookHidden: false
---
# Destination: Oracle

The extracted `replicant-cli` will be referred to as the `$REPLICANT_HOME` directory in the proceeding steps.

## I. Set up Shared Directory

Replicant uses the [external directory feature in Oracle](https://docs.oracle.com/cd/B19306_01/server.102/b14215/et_concepts.htm) for efficient loading of data into target Oracle. You must specify the shared directory [in the `stage` section of the connection configuration file](#iii-setup-connection-configuration).

1. Create a directory shared between Replicant host and Oracle host with `READ` and `WRITE` access
2. One way to create the shared directory is using NFS. You can follow NFS recommendation:

From here onwards, we'll consider the directory created in this step to have the following path: `/data/shared_fs`.

## II. Set up Oracle User Permissions
The following step must be executed in an Oracle client.

1. Grant the following privileges to the host replicant user
   ```SQL
    GRANT CREATE TABLE TO <USERNAME>;
    --If you are unable to provide the permission above, you must manually create all the tables

    GRANT CREATE ANY DIRECTORY TO <USERNAME>;
    --If you are unable to provide the permission above, you must manually create the following directories:
    CREATE OR REPLACE DIRECTORY csv_data_dir AS '/data/shared_fs';
    CREATE OR REPLACE DIRECTORY csv_log_dir AS '/data/shared_fs';


    GRANT ALTER TABLE TO <USERNAME>;
    --
    ```
2. Manually create user schema and a schema named io_replicate. Grant both of them permission to access a tablespace

## III. Set up Connection Configuration

1. From `$REPLICANT_HOME`, navigate to the sample connection configuration file:
    ```BASH
    vi conf/conn/oracle_dst.yaml
    ```

2. Make the necessary changes as follows:
      ```YAML
      type: ORACLE

      host: localhost #Replace localhost with your oracle host name
      port: 1521 #Replace the default port number 1521 if needed
      service-name: IO #Replace IO with the service name that contains the schema you will be replicated

      username: 'REPLICANT' #Replace REPLICANT with your username of the user that connects to your oracle server
      password: 'Replicant#123' #Replace Replicant#123 with the your user's password

      stage:
        type: SHARED_FS
        root-dir: /data/shared_fs  #Enter the path of the shared directory

      max-connections: 30 #Maximum number of connections replicant can open in Oracle
      max-retries: 10 #Number of times any operation on the system will be re-attempted on failures.
      retry-wait-duration-ms: 1000 #Duration in milliseconds replicant should wait before performing then next retry of a failed operation

      #charset: AL32UTF8 #Character set to use when transferring data. This option must match the charset value in the source connection configuration.

    ```
    - Make sure the specified user has the following privileges on the catalogs/schemas into which replicated tables should be created:
      - `CREATE TABLE`
      - `CREATE SCHEMA`
      - `CREATE ANY DIRECTORY`
      - `ALTER TABLE`
    - If the user does not have `CREATE SCHEMA` privilege, then create a schema manually with name `io_blitzz` and grant all privileges for it to the user specified here. Replicant uses this database for internal checkpointing and metadata management.

    ### Additional parameters
    * `max-metadata-connections`*[v21.05.04.6]*: When `--metadata` switch is not provided, the target is used as a metadata store. This config will determine the connection pool size for metadata storage.

## IV. Set up Applier Configuration

Replicant supports creating/loading tables at the partition and subpartition levels. Follow the instructions below if you want to change the behavior.

1. From `$REPLICANT_HOME`, naviagte to the sample applier configuration file:
   ```BASH
   vi conf/dst/oracle.yaml
   ```

2. The following Oracle-specific parameters are available for `snapshot` mode:
  - `enable-partition-load`: This option enables partition-wise load on target oracle. *It is enabled by default for Oracle->Oracle pipeline.* 
  - `disable-partition-wise-load-on-failure`: If there is a mismatch between the partitioning spec on source and target, Replicant will throw error at runtime. If this option is set to `true`, Replicant will automatically fall back to non-partition aware multi-threaded load in next retry attempt.
  - `init-constraint-post-snapshot`: This config creates constraints and indexes after the snapshot is complete.
  - `init-views-as-views`*[v21.04.06.8]*: To create views as views instead of as tables. 
  
    *Default: By default, this parameter is set to `false`.*

  - `init-views-post-snapshot`*[v21.04.06.8]*: If init-views-as-views is true, this option will create views after snapshot is complete. If disabled, views are created prior to snapshot. (by default this is true).
  - `bulk-load`: Blitzz can leverage underlying support of `FILE` based bulk loading into the target system.
    - `enable`: To enable/disable bulk loading.
    - `type`: `FILE`
    - `serialize`: Specifies whether the files generated should be applied in serial/parallel fashion. Values are either `true` or `false`. 
    - `method`: Specifies the method used to perform bulk load. The following methods are available:
      - `EXTERNAL_TABLE`: This method uses an external table to load intermediate CSV files that Replicant generates into the target Oracle. The prerequisite for this mechanism is that we need to have a shared directory between Replicant machine and target Oracle.
      - `SQL_LOADER`: This mechanism uses [Oracle's `sqlldr` utility](https://docs.oracle.com/cd/B19306_01/server.102/b14215/part_ldr.htm) to perform client side load into target Oracle. This mechanism does not require shared directory between Replicant machine and target Oracle. The prerequisite for this mechanism is that we need to set the following three environment variables before executing the Replicant process. You can include them in `.bashrc` as well:

        ```bash
        export ORACLE_HOME=<path_to_directory_containing_sqlldr_binary>
        export LD_LIBRARY_PATH="$ORACLE_HOME":$LD_LIBRARY_PATH
        export PATH="$ORACLE_HOME:$PATH"
        ```

        {{< hint "warning" >}}`sqlldr` has a limitation that it does not accept case-sensitive usernames. For example, `sqlldr` will not accept the first command below:
        
  ```SQL
  create user “test” identified by “Test#123”
  create user test identified by “Test#123”
  ```
        {{< /hint >}}


  Below is a sample config:

   ```YAML
   snapshot:
     enable-partition-load: true
     disable-partition-wise-load-on-failure: false

     bulk-load : Blitzz can leverage underlying support of FILEbased bulk loading into the target system.
       enable: true
       type: FILE
       serialize: true/false.
       method: SQL_LOADER.

   ```
   For a detailed explanation of configuration parameters in the applier file, read [Applier Reference]({{< ref "/docs/references/applier-reference" >}} "Applier Reference").
