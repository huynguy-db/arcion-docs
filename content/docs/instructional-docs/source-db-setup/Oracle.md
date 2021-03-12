---
title: Oracle
---

# Source: Oracle

**Prerequisites**
When using Replicant to transfer data from Oracle, you must install both an appropriate JDBC Driver (recommended JDBC Driver: 18c) and a Java 8 compatible ojdbc8 version.
  * Note: Place the downloaded jar file into the replicant/lib directory after installing Replicant

## I. Setup Oracle User

## II. Grant permissions

**Quick Definitions**
  * One Time Access: The granted permission is only required once
  * Continuous Access: The granted permission is required throughout the entire replication process

1. **Need to replace:** Go to where the permissions are granted

2. Grant the following Permissions to the Replicant User:

    ```BASH
      GRANT SELECT ON DBA_SEGMENTS TO $USERNAME #ONE TIME ACCESS;
      #Required to take a snapshot but can be revoked after the snapshot is complete

      GRANT SELECT ON gv_$database TO $USERNAME #CONTINUOUS ACCCESS
      GRANT SELECT ON gv_$transaction TO $USERNAME #CONTINUOUS ACCCESS
      GRANT SELECT ON gv_$session TO $USERNAME #CONTINUOUS ACCCESS

      GRANT FLASHBACK ON <TABLE_NAME> TO $USERNAME ##CONTINUOUS ACCCESS;
      #Required for all application tables

      GRANT EXECUTE_ CATALOG_ROLE TO $USERNAME #CONTINUOUS ACCCESS;
      #Required to use the DBMS_LOGMNR package

      GRANT SELECT ANY TRANSACTION TO $USERNAME #This grant is only for Oracle11G;
      #CONTINUOUS ACCESS
      GRANT LOGMINING TO $USERNAME #This grant is only for Oracle12C and beyond;
      #CONTINUOUS ACCESS; Required to access the START_LOGMNR procedure:

      GRANT SELECT ON v_$logmnr_contents TO $USERNAME #CONTINUOUS ACCESS;
      #Required to access v_$logmnr_contents

      GRANT SELECT ON v_$logfile TO $USERNAME #This grant is only for Oracle19C and beyond;
      #CONTINUOUS ACCESS; Required for additional access to v_$logfile

    ```

## III. Setup Connection Configuration

1. Navigate to the connection configuration file
    ```BASH
    vi conf/conn/oracle.yaml
    ```

2. Make the necessary changes shown below:

    ```YAML
    type: ORACLE
    host: #Enter the hostname of the Oracle server
    port: #Enter the port number to connect to the server
    username: #Enter the username to connect to the server
    password: # Enter the user password
    credential-store: #Edit the following configurations if you wish to specify the username and password in a credential store
      type: PKCS12 | JKS | JCEKS
      path: #Enter the location of the key-store
      Key-prefix: #Create entries in the credential store for username and password configs using a prefix and specify the prefix here
      Password: #Entering a keystore password here is optional;
      #however, if you do not specify the keystore password here,
      #you must use the UUID from your license file as the keystore password.
    max-connections: #Enter the maximum number of connections replicant would use to fetch data from the Oracle system.
    Service-name: #Enter the service name that contains the schema to be replicated
    max-retries: #Enter the maXimum number of time an operation will be re-attempted when an operation fails
    retry-wait-duration-ms: #Enter the duration, in milliseconds, replicant should wait before performing then next retry of a failed operation
    source-failover [20.10.07.16]: #?
    charset [20.12.04.4]: #Enter the character set that will be used when transferring data
    continuous-log-mining [20.12.04.12]: true/false # Set this to false for Oracle versions 19C and beyond
    ```

## IV. Setup Extractor Configuration

For real-time replication, you must create a heartbeat table in the extractor configuration.

1. Create a heartbeat table in the catalog/schema you are going to replicate with the following DDL
   ``` BASH
   CREATE TABLE <catalog>.<schema>.replicate_io_cdc_heartbeat( \
   timestamp <data_type_equivalent_to_long>)
   ```

2. Grant ```INSERT```, ```UPDATE```, and ```DELETE``` privileges to the user configured for Replicant

3. Navigate to Oracle's extractor configurations
   ```BASH
   vi conf/src/Oracle.yaml
   ```
4. Under the Realtime Section, make the necessary changes as follows
     ```YAML
     heartbeat:
       enable: #Set to true
       catalog: #Enter the catalog of the data being replicated
       schema: #Enter the schema of the data being replicated
       table-name [20.09.14.3]: #What is this for?
       column-name [20.10.07.9]: #What is this for?
       Interval-ms: #Enter the interval at which the heartbeat table should be updated
       #with the latest timestamp (milliseconds since epoch) by replicant.
       fetch-interval-s: #Enter the interval in seconds after which Replicant will try to fetch the CDC log
     ```


Editing the rest of the extractor configurations is optional. Replicant will run with the default configurations. However, if you need to specify certain configurations for certain specific or change a few settings to enhance Replicant's performance you must edit the extractor configurations with the proceeding steps.



5. For changes is Replicant's data snapshot, make the necessary adjustments as shown below:

      ```YAML
      threads: #Enter the maximum number of threads you would like replicant to use
      #for data extraction

      fetch-size-rows: #Enter the maximum number of records/documents you would like Replicant
      #to fetch at once from the Oracle Database

      lock: #You can edit the following settings to enable and configure object locking.
      #No object locking is done by default.
        enable: false
        scope: table
        force: false
        timeout-sec: 5

      min-job-size-rows: #Enter the minimum number of tables/collections you would like
      #each replication job to contain

      max-jobs-per-chunk: #Enter the maximum number of jobs created per
      #source table/collection

      split-key: #Edit this configuration to split the table/collection into
      #multiple jobs in order to do parallel extraction

      split-method: #Specify which of the two split methods, RANGE or MODULO, Replicant will use

      fetch-PK: #what does this do?

      fetch-UK: #what does this do?

      fetch-FK: #what does this do?

      fetch-Indexes: #fetch (and replicant) indexes for tables. (By default, this is false)

      fetch-user-roles: #fetch (and replicant) user/roles. (By default, it is true)

      fetch-schemas-from-system-tables: #Use system tables to fetch schema information

      per-table-config: #Use this section if you want to override certain configuration in specific tables
        i.	schema: <shema_name>
        ii.	tables:

        <table_name>:
          a.	max-jobs-per-chunk: #Use this to control intra-table parallelism.
          #Set it to 1 if there is no split-key candidate in a given collection/table
          b.	row-identifier-key: #Enter a list of columns which uniquely
          #identify a row in this table
          c.	extraction-priority: # Enter the priority for scheduling the extraction
          #of a table. Higher value is higher priority


      ```
6. For changes in Real-Time replication, make the necessary adjustments as shown below:

      ```YAML
      threads: #Enter the maximum number of threads to be used by replicant
      #for real-time extraction

      fetch-size-rows: #Enter the number of records/documents
      #Replicant should fetch at one time from Oracle

      fetch-duration-per-extractor-slot-s: #Specify the number of seconds a
      #thread should continue extraction from a given replication channel/slot

      start-position [20.09.14.1]: #Edit the configurations below to specify
      #the log position from where replication should begin for real-time mode

        start-scn: #Enter the scn from which replication should start

        idempotent-replay [20.09.14.1]: #Enter one of the three possible values: ALWAYS/ NONE/ NEVER

      ```



## V. Setup Filter Configuration

1. Navigate to the filter configuration file
    ```BASH
    vi filter/<Oracle>_filter.yaml
    ```

2. Make the necessary changes as shown below:
    ```YAML
    allow:
      catalog: #Specify the source catalog which needs to be replicated.
      schema: #Specify the source database schema that needs to be replicated. Each schema must have a separate entry
      types: [TABLE]
      allow:
        <table_name>: #Specify the collection name; each collection within the database must be a separate entry
          allow: #Ent3er a list of the columns which you want to replicate from this table; if you do not specify, all columns will be replicated
            conditions: #Enter the predicate that you want Replicant to use while extracting data from Oracle
            src-conditions: #If the target systems has a different column name for the column the above filtering condition is applied to,
            #specify the same filtering condition in both column names in src-conditions and dst-conditions
            #for the source and target systems, respectively
            dst-conditions: #As explained in src-conditions

    allow-update-any [20.05.12.3]: #only applicable to real-time replication;
    #Specify a list of columns here if you want Replicant to only publish the updated operations in this table
    #when any of those columns are found modified
    allow-update-all [20.05.12.3]: #only applicable to real-time replication;
    #Specify a list of columns here if you want Replicant to only publish the updated operations in this table
    #when all of those columns are found modified
    ```
