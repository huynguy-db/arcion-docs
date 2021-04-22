---
title: Oracle
weight: 1
---

# Source: Oracle
**The first four steps (I-IV) are to prepare the Oracle Database for replication and must be executed in an Oracle client. The remaining steps (V-VII) are to configure Replicant.**

## I. Setup Oracle Driver

1. Install the appropriate JDBC Driver (Recommended: JDBC Driver 18c and Java 8 compatible ojdbc8 version)
2. Download ojdbc8.jar from the following link: [Oracle JDBC Driver Download](https://www.oracle.com/database/technologies/jdbc-ucp-122-downloads.html#license-lightbox)
3. Place the downloaded ojdbc8 jar file into the replicant-cli/lib directory after installing Replicant

## II. Setup Oracle User

1. Create a new user for Replicant with the following commands
    ```SQL
       CREATE USER <USERNAME> IDENTIFIED BY <PASSWORD>
       DEFAULT TABLESPACE <user-defined-tablesace>
       QUOTA unlimited on <user-defined-tablespace>
       TEMPORARY TABLESPACE TEMP;
    ```
From here on, the newly created user will be referenced as ```rep-usr```, but you may name the user anything you like.

2. Provide ```rep-usr``` the permission to create a session
    ```SQL
      GRANT CREATE SESSION TO <USERNAME>;
    ```
3. Grant the select permission for all the tables that are part of  the replication
    ```SQL
      GRANT SELECT ON <TABLENAME> TO $USERNAME;
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
   ```SQL
     SHUTDOWN IMMEDIATE
     STARTUP MOUNT
     ALTER DATABASE ARCHIVELOG
     ALTER DATABASE OPEN
   ```
2. Once the database is in ARCHIVELOG mode, grant the EXECUTE_CATALOG_ROLE role to use the DBMS_LOGMNR package:
    ```SQL
      GRANT EXECUTE_CATALOG_ROLE TO <USERNAME>
    ```
3. Provide the following permissions to allow Replicant to access the START_LOGMNR procedure
    For Oracle 11g:
    ```SQL
      GRANT SELECT ANY TRANSACTION TO <USERNAME>;
    ```

    For Oracle 12C and beyond:
    ```SQL
      GRANT LOGMINING TO <USERNAME>;
    ```
4. Provide the following permission to allow Replicant to access v_$logmnr_contents
    ```SQL
      GRANT SELECT ON v_$logmnr_contents TO <USERNAME>;
    ```
    For Oracle 19C and beyond, Replicant requires additional access to v_$logfile
    ```SQL
      GRANT SELECT ON v_$logfile TO <USERNAME>;
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
      GRANT SELECT ON DBA_SEGMENTS TO <USERNAME>
    ```
2. Provide the following continuous access permissions:
    ```SQL
      GRANT SELECT ON gv_$database TO <USERNAME>
      GRANT SELECT ON gv_$transaction TO <USERNAME>
      GRANT SELECT ON gv_$session TO <USERNAME>--Not required for replicant release 20.8.13.7 and above
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
      GRANT SELECT ON DBA_PDBS to <USERNAME> CONTAINER=ALL;
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

2. Make the necessary changes as follows:

    ```YAML
    type: ORACLE

    host: localhost #Replace localhost with your oracle host name
    port: 1521 #Replace the default port number 1521 if needed
    service-name: IO #Replace IO with the service name that contains the schema you will be replicated

    username: 'REPLICANT' #Replace REPLICANT with your username of the user that connects to your oracle server
    password: 'Replicant#123' #Replace Replicant#123 with the your user's password

    max-connections: 30 #Maximum number of connections replicant can open in Oracle
    ```

## VI. Setup Filter Configuration

1. Navigate to the filter configuration file
        ```BASH
        vi filter/oracle_filter.yaml
        ```

2. Make the necessary changes as shown below:
    ```YAML
    allow:
      schema: "REPLICANT" #Replace REPLICANT with the name of your schema
      types: [TABLE] #Enter the applicable object type: TABLE or VIEW or TABLE,VIEW

      ##Below, you can specify which tables within the schema will be replicated. If not specified, all tables will be replicated.

      allow:
        Orders: #Replace Orders with the name of the table you want to replicate

          #The parameters below are optional
          allow: [column1, column2] #You may replace column1, column2 with a list of specific columns within this table you want to replicate.
          #To replicate all columns in this table, remove this configuration
          conditions: "O_ORDERKEY < 5000" #Enter the predicate that you want to apply during replication

        Customers: #Replace Customers with the name of the table you want to replicate

          #The parameters below are optional
          block: [column1, column2] #You may replace column1, column2 with a list of columns to blacklist within this table;
          #all other columns will be allowed
          conditions: "C_CUSTKEY < 5000" #Enter the predicate that you want to apply during replication
        ```


## VII. Setup Extractor Configuration

For real-time replication, you must create a heartbeat table in the source Oracle.

1. Create a heartbeat table in the catalog/schema you are going to replicate with the following DDL
   ```SQL
   CREATE TABLE "<schema>"."replicate_io_cdc_heartbeat"(
     "timestamp" NUMBER NOT NULL,
     PRIMARY KEY("timestamp"));
   ```

2. Grant ```INSERT```, ```UPDATE```, and ```DELETE``` privileges to the user configured for Replicant

3. Navigate to the extractor configuration file
   ```BASH
   vi conf/src/oracle.yaml
   ```
4. Under the Realtime Section, make the necessary changes as follows:
     ```YAML
     realtime:
       heartbeat:
         enable: true
         schema: "REPLICANT" #Replace REPLCIANT with your schema name
         table-name [20.09.14.3]: replicate_io_cdc_heartbeat #Replace replicate_io_cdc_heartbeat with your heartbeat table's name if applicable
         column-name [20.10.07.9]: timestamp #Replace timestamp with your heartbeat table's column name if applicable
     ```
