---
title: Oracle
---

# Source: Oracle
**The first four steps (I-IV) are to prepare the Oracle Database for replication. The remaining steps (V-VII) are to configure Replicant.**

## I. Setup Oracle Driver

1. Install the appropriate JDBC Driver (Recommended: JDBC Driver 18c and Java 8 compatible ojdbc8 version)
2. Download ojdbc8.jar from the following link: [Oracle JDBC Driver Download](https://www.oracle.com/database/technologies/jdbc-ucp-122-downloads.html#license-lightbox)
3. Place the downloaded ojdbc8 jar file into the replicant-cli/lib directory after installing Replicant

## II. Setup Oracle User

1. Create a new user for Replicant with the following commands
    ```BASH
       CREATE USER <USERNAME> IDENTIFIED BY <PASSWORD>
       DEFAULT TABLESPACE <user-defined-tablesace>
       QUOTA unlimited on <user-defined-tablespace>
       TEMPORARY TABLESPACE TEMP;
    ```
From here on, the newly created user will be refenced as ```rep-usr```, but you may name the user anything you like.

2. Provide ```rep-usr``` the permission to create a session
    ```SQL
      GRANT CREATE SESSION TO <USERNAME>;
    ```
3. Grant the select permission for all the tables that are part of  the replication
    ```SQL
      GRANT SELECT ON <TABLENAME> TO <USERNAME>;
    ```
## III. Setup Change Data Capture (CDC)
In the proceeding steps, grant the instructed permissions to ```rep-usr```

1. Set the destination for the log archive
    ```BASH
      ALTER SYSTEM SET log_archive_dest = '$PATH_TO_REDO_LOG_FILES' scope=spfile  
    ```

   Note: To use log-based CDC, the Oracle database must be in ARCHIVELOG mode.
   To check what mode the database is in, use the ```ARCHIVE LOG LIST``` command.
   To set the database in ARCHIVELOG mode, use the following commands:
   ```BASH
     SHUTDOWN IMMEDIATE
     STARTUP MOUNT
     ALTER DATABASE ARCHIVELOG
     ALTER DATABASE OPEN
   ```
2. Once the database is in ARCHIVELOG mode, grant the EXECUTE_CATALOG_ROLE role to use the DBMS_LOGMNR package:
    ```SQL
      GRANT EXECUTE_CATALOG_ROLE TO $USERNAME;
    ```
3. Provide the following permissions to allow Replicant to access the START_LOGMNR procedure
    For Oracle 11g:
    ```SQL
      GRANT SELECT ANY TRANSACTION TO $USERNAME;
    ```

    For Oracle 12C and beyond:
    ```SQL
      GRANT LOGMINING TO $USERNAME;
    ```
4. Provide the following permission to allow Replicant to access v_$logmnr_contents
    ```SQL
      GRANT SELECT ON v_$logmnr_contents TO $USERNAME;
    ```
    For Oracle 19C and beyond, Replicant requires additional access to v_$logfile
    ```SQL
      GRANT SELECT ON v_$logfile TO $USERNAME;
    ```
5. Enable either primary key or all column logging at the database or table level
  * Note: If you use table level logging, you must enable it for the CDC heartbeat table as well

    ```SQL
      PRIMARY KEY (database level)
      ALTER DATABASE ADD SUPPLEMENTAL LOG DATA (PRIMARY KEY) COLUMNS
      ALL (database level)
      ALTER DATABASE ADD SUPPLEMENTAL LOG DATA (ALL) COLUMNS

      PRIMARY KEY (table level)
      ALTER <TABLE_NAME> ADD SUPPLEMENTAL LOG DATA (PRIMARY KEY) COLUMNS
      ALL (table level)
      ALTER <TABLE_NAME> ADD SUPPLEMENTAL LOG DATA (ALL) COLUMNS
      --Note: Do not enable force logging, if table level logging is enabled
      ALTER DATABASE FORCE LOGGING
      ALTER SYSTEM SWITCH LOGFILE
    ```


## IV. Setup Global Permissions

In the proceeding steps, grant the instructed permissions to ```rep-usr```

**Quick Definitions**
  * One Time Access: The granted permission is only required for the initial data load (snapshot) and for reinit operations (snapshots of newly added tables). The permission can be revoked after the necessary operation is complete.
  * Continuous Access: The granted permission is required throughout the replication process.

1. Provide the following privilege for one time access:
    ```SQL
      GRANT SELECT ON DBA_SEGMENTS TO $USERNAME
    ```
2. Provide the following continuous access permissions:
    ```SQL
      GRANT SELECT ON gv_$database TO $USERNAME
      GRANT SELECT ON gv_$transaction TO $USERNAME
      GRANT SELECT ON gv_$session TO $USERNAME --Not required for replicant release 20.8.13.7 and above
    ```
3. Grant the following continuous access permission for all the tables involved in Replication:
    ```SQL
      GRANT FLASHBACK ON <TABLE_NAME> TO $USERNAME
    ```
4. Provide ```rep-usr``` access to the below system views from Oracle during schema migration. The content depends on permissions given to the current user.
    ```SQL
      GRANT SELECT ON ALL_TABLES TO <USERNAME>;
      GRANT SELECT ON ALL_VIEWS TO <USERNAME>;
      GRANT SELECT ON ALL_CONSTRAINTS TO <USERNAME>;
      GRANT SELECT ON ALL_CONS_COLUMNS TO <USERNAME>;
      GRANT SELECT ON ALL_PART_TABLES TO <USERNAME>;
      GRANT SELECT ON ALL_PART_KEY_COLUMNS TO <USERNAME>;
      GRANT SELECT ON ALL_TAB_COLUMNS TO <USERNAME>;
      GRANT SELECT ON SYS.ALL_INDEXES TO <USERNAME>;
      GRANT SELECT ON SYS.ALL_IND_COLUMNS TO <USERNAME>;
      GRANT SELECT ON SYS.ALL_IND_EXPRESSIONS TO <USERNAME>;
    ```

## IV. Grant Pluggable Database (PDB) Permissions

1. Ensure that you are connected as a common user with privileges granted on both CDB$ROOT and PDB

2. Provide following additional permissions:
    ```SQL
      GRANT SET CONTAINER TO $USERNAME CONTAINER=ALL;
      GRANT SELECT ON DBA_PDBS to $USERNAME CONTAINER=ALL;
    ```  
3. Open pluggable database:
    ```SQL
      ALTER PLUGGABLE DATABASE $PDB_NAME OPEN READ WRITE FORCE;
    ```
<br> </br>
**The proceeding steps are to set up Replicant. Position yourself at Replicant's home directory**

## V. Setup Connection Configuration

1. Navigate to the connection configuration file
    ```BASH
    vi conf/conn/oracle.yaml
    ```

2. Make the necessary changes shown below:

    ```YAML
    type: ORACLE
    host: #Enter the hostname of the Oracle server
    port: #Enter the port number to connect to the server
    service-name: #Enter the service name that contains the schema to be replicated
    username: #Enter the username to connect to the server
    password: # Enter the user password
    credential-store: #Edit the following configurations if you wish to specify the username and password in a credential store
      type: PKCS12 | JKS | JCEKS
      path: #Enter the location of the key-store
      Key-prefix: #Create entries in the credential store for username and password configs using a prefix and specify the prefix here
      Password: #Entering a keystore password here is optional;
      #however, if you do not specify the keystore password here,
      #you must use the UUID from your license file as the keystore password.
    max-connections: #Enter the maximum number of connections replicant can open in Oracle DB
    ```

## VI. Setup Extractor Configuration

For real-time replication, you must create a heartbeat table in the source Oracle.

1. Create a heartbeat table in the catalog/schema you are going to replicate with the following DDL
   ```SQL
   CREATE TABLE "<schema>"."replicate_io_cdc_heartbeat"( \
     "timestamp" NUMBER NOT NULL, \
     PRIMARY KEY("timestamp"));
   ```

2. Grant ```INSERT```, ```UPDATE```, and ```DELETE``` privileges to the user configured for Replicant

3. Navigate to Oracle's extractor configurations
   ```BASH
   vi conf/src/oracle.yaml
   ```
4. Under the Realtime Section, make the necessary changes as follows
     ```YAML
     heartbeat:
       enable: #Set to true
       schema: #Enter the schema of the data being replicated
       table-name [20.09.14.3]: #HB table name only if dif
       column-name [20.10.07.9]: #HB column name only if dif
       interval-ms: 10000 #Enter the interval at which the heartbeat table should be updated
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



## VII. Setup Filter Configuration

1. Navigate to the filter configuration file
    ```BASH
    vi filter/oracle_filter.yaml
    ```

2. Make the necessary changes as shown below:
    ```YAML
    allow:
      schema: #Specify the source database schema that needs to be replicated. Each schema must have a separate entry
      types: [TABLE]
      allow:
        <table_name>: #Specify the collection name; each collection within the database must be a separate entry
          allow: [column1, column2] #Enter a list of the columns which you want to replicate from this table; if you do not specify, all columns will be replicated
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
