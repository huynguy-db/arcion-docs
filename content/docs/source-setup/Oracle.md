---
title: Oracle
weight: 1
bookHidden: false
---

# Source Oracle
**The first five steps (I-V) are to prepare the Oracle Database for replication and must be executed in an Oracle client. The remaining steps (VI-VIII) are to configure Replicant.**

## I. Obtain the JDBC Driver for Oracle

Replicant requires the JDBC driver for Oracle as a dependency. To obtain the appropriate driver, follow the steps below: 

- Go to the [Oracle Database JDBC driver Downloads page](https://www.oracle.com/database/technologies/appdev/jdbc-downloads.html).
- We recommend JDBC Driver 18c and Java 8-compatible driver. So navigate to the **Oracle Database 18c Downloads** section. 
- From there, download the [Oracle JDBC Driver `ojdbc8.jar`](https://download.oracle.com/otn-pub/otn_software/jdbc/1815/ojdbc8.jar).
- Put the `ojdbc8.jar` file inside `$REPLICANT_HOME/lib` directory.

## II. Set up Oracle User

1. Create a new user for Replicant with the following command:
    ```SQL
    CREATE USER <USERNAME> IDENTIFIED BY <PASSWORD>
    DEFAULT TABLESPACE <user-defined-tablesace>
    QUOTA unlimited on <user-defined-tablespace>
    TEMPORARY TABLESPACE TEMP;
    ```

2. Provide the create session permission:
    ```SQL
    GRANT CREATE SESSION TO <USERNAME>;
    ```
3. Grant the select permission for all the tables that are part of the replication:
    ```SQL
    GRANT SELECT ON <TABLENAME> TO <USERNAME>;
    ```

    OR

    The select permission can be granted on all of the tables
    ```SQL
    GRANT SELECT ANY TABLE TO <USERNAME>;
    ```

## III. Set up Change Data Capture (CDC)

1. Set the destination for the log archive:
    ```BASH
    ALTER SYSTEM SET log_archive_dest = '$PATH_TO_REDO_LOG_FILES' scope=spfile  
    ```
   {{< hint "info" >}}
   To use log-based CDC, the Oracle database must be in ARCHIVELOG mode.
   To check what mode the database is in, use the ```ARCHIVE LOG LIST``` command.
   To set the database in ARCHIVELOG mode, use the following commands:
   ```SQL
   SHUTDOWN IMMEDIATE
   STARTUP MOUNT
   ALTER DATABASE ARCHIVELOG
   ALTER DATABASE OPEN
   ```
   {{< /hint >}}
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
4. Provide the following permission to allow Replicant to access v_$logmnr_contents:
    ```SQL
    GRANT SELECT ON v_$logmnr_contents TO <USERNAME>;
    GRANT SELECT ON gv$archived_log to $USERNAME;
    ```
    For Oracle 19C and beyond, Replicant requires additional access to v_$logfile:
    ```SQL
    GRANT SELECT ON v_$logfile TO <USERNAME>;
    ```
### Enabling logs
You have to enable either primary key or all column logging at either the database level or the table level.
  
{{< hint "info" >}}If you use table level logging, you must enable it for the CDC heartbeat table as well.{{< /hint >}}

  #### Database level Supplemental logging
  * Enable Force Logging:  
    ```SQL
    ALTER DATABASE FORCE LOGGING
    ```


  * Enable `PRIMARY KEY` logging:
    ```SQL
    ALTER DATABASE ADD SUPPLEMENTAL LOG DATA (PRIMARY KEY) COLUMNS
    ```

    OR

  * Enable `ALL` Column logging:
    ```SQL
    ALTER DATABASE ADD SUPPLEMENTAL LOG DATA (ALL) COLUMNS
    ```

  #### Table level supplemental logging
  * `PRIMARY KEY` logging
    ```SQL
    ALTER <TABLE_NAME> ADD SUPPLEMENTAL LOG DATA (PRIMARY KEY) COLUMNS
    ```

    OR

  * `ALL` Column logging
    ```SQL
    ALTER <TABLE_NAME> ADD SUPPLEMENTAL LOG DATA (ALL) COLUMNS
    ```
  * If table level logging is enabled, then force logging should not be enabled. We need force logging for database level logging:

    ```SQL
    ALTER DATABASE FORCE LOGGING
    ALTER SYSTEM SWITCH LOGFILE
    ```
  * The following additional permissions are required:
    ```SQL
    GRANT SELECT ON gv_$instance TO $USERNAME;
    GRANT SELECT ON gv_$PDBS TO $USERNAME;
    GRANT SELECT ON gv_$log TO $USERNAME;
    GRANT SELECT ON gv_$database_incarnation to $USERNAME;
    ```
{{< hint "info" >}}Only enable either `PRIMARY KEY` logging or `ALL` column logging, not both.{{< /hint >}}


## IV. Set up Global Permissions

**Quick Definitions**
  * One Time Access: The granted permission is only required for the initial data load (snapshot) and for reinit operations (snapshots of newly added tables). The permission can be revoked after the necessary operation is complete.
  * Continuous Access: The granted permission is required throughout the replication process.

1. Provide the following privilege for one time access:
    ```SQL
    GRANT SELECT ON DBA_SEGMENTS TO <USERNAME>;
    ```
2. Provide the following continuous access permissions; these are necessary during snapshot as well as continious real-time replication:
    ```SQL
    GRANT SELECT ON gv_$database TO <USERNAME>;
    GRANT SELECT ON gv_$transaction TO <USERNAME>;
    GRANT SELECT ON gv_$session TO <USERNAME>;--Not required for replicant release 20.8.13.7 and above
    ```
3. Grant the following continuous access permission for the tables involved in Replication:
    ```SQL
    GRANT FLASHBACK ON <TABLE_NAME> TO <USERNAME>;
    ```

    OR

    Enable Flashback for all tables
     ```SQL
     GRANT FLASHBACK ANY TABLE TO <USERNAME>;
     ```

4. Provide access to the below system views for schema migration:
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

## V. Grant Pluggable Database (PDB) Permissions

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
The proceeding steps are to set up Replicant. The extracted `replicant-cli` will be referred to as the `$REPLICANT_HOME` directory in the proceeding steps.


## VI. Set up Connection Configuration

1. From `$REPLICANT_HOME`, navigate to the connection configuration file:
    ```BASH
    vi conf/conn/oracle.yaml
    ```

2. Make the necessary changes as follows:
    ```YAML
    type: ORACLE

    host: localhost #Replace localhost with your oracle host name
    port: 1521 #Replace the default port number 1521 if needed
    service-name: IO #Replace IO with the service name of your Oracle Listener

    username: 'REPLICANT' #Replace REPLICANT with your username to connect to Oracle
    password: 'Replicant#123' #Replace Replicant#123 with the your user's password

    max-connections: 30 #Maximum number of connections replicant can open in Oracle
    ```


## VII. Set up Filter Configuration

1. From `$REPLICANT_HOME`, navigate to the filter configuration file:
    ```BASH
    vi filter/oracle_filter.yaml
    ```

2. In accordance to your replication needs, specify the schema(s)/table(s) which is to be replicated. Use the format explained below:  
    ```YAML
    allow:

      #In this example, data of object type Table in the schema REPLICANT will be replicated
      schema: "REPLICANT"
      types: [TABLE]

      #From the shemca REPLCIANT, only the Orders, Customers, and Returns tables will be replicated.
      #Note: Unless specified, all tables in the schema will be replicated

      allow:
        Orders:
           #Within Orders, only the US and AUS columns will be replicated
           allow: ["US, AUS"]

        Lineitem: #All columns in the table Lineitem  will be replicated without any predicates

        Customers:  
           #Within Customers, only the product and service columns will be replicated as long as they meet the condition C_CUSTKEY < 5000
           allow: ["product", "service"]
           conditions: "C_CUSTKEY < 5000"
     ```
      Below is the filter file template you must follow:

      ```YAML
      allow:
        schema: <your_schema_name>
        types: <your_object_type>


        allow:
          your_table_name_1:
            allow: ["your_column_name"]
            conditions: "your_condition"  

          your_table_name_2:

          your_table_name_3:
            allow: ["your_column_name"]
            conditions: "your_condition"  
      ```
For a detailed explanation of configuration parameters in the filter file, read: [Filter Reference]({{< ref "/docs/references/filter-reference" >}} "Filter Reference")

## VIII. Set up Extractor Configuration

For real-time replication, you must create a heartbeat table in the source Oracle.

1. Create a heartbeat table in the schema you are going to replicate with the following DDL:
   ```SQL
   CREATE TABLE "<schema>"."replicate_io_cdc_heartbeat"(
     "timestamp" NUMBER NOT NULL,
     PRIMARY KEY("timestamp"));
   ```

2. Grant ```INSERT```, ```UPDATE```, and ```DELETE``` privileges to the user configured for replication

3. From `$REPLICANT_HOME`, navigate to the extractor configuration file:
   ```BASH
   vi conf/src/oracle.yaml
   ```
4. The configuration file has two parts:

    - Parameters related to snapshot mode.
    - Parameters related to realtime mode.

    ### Parameters related to snapshot mode
    The following parameters are specific to Oracle as source:

    - `fetch-create-sql`: This option can be used to apply exact create SQL on source to target.

      *This parameter is available only for Oracle->Oracle pipeline.*

    - `fetch-create-sql-no-constraints`: This option is used to split create table SQL and Primary/Unique/Foreign Key constraints as different SQLs. So as part of schema migration we create tables without constraints and after the snapshot is complete the constraints are applied. Application of constraints post snapshot is configured by applier config init-constraint-post-snapshot.
    
      *This parameter is available only for Oracle->Oracle pipeline.*

    - `serialize-fetch-createSql`: This option is used to fetch create SQL in serialized manner after fetching table schema.
    - `serialize-fetch-create-sql-no-constraints`: This option is used to fetch SQL of Primary/Unique/Foreign Key constraints in serialized manner.

      *This parameter is available only for Oracle->Oracle pipeline.*

    The following is a sample configuration for snapshot mode:

    ```YAML
    snapshot:
      threads: 16
      fetch-size-rows: 10_000
      verify-row-count: false
      _fetch-exact-row-count: true
      _traceDBTasks: true
    #  inf-number-behavior: EXCEPTION   # EXCEPTION, ROUND, CONVERT_TO_NULL
    #  flashback-query: true
    #  parallel-query: true
    #  fetch-user-roles: true

    #   per-table-config:
    #   - schema: tpch
    #     tables:
    #       lineitem1:
    #         row-identifier-key: [ORDERKEY, LINENUMBER]
    #         extraction-priority: 1 #Higher value is higher priority. Both positive and negative values are allowed. Default priority is 0 if unspecified.
    #       lineitem1:
    #         row-identifier-key: [ORDERKEY, LINENUMBER]
    #        products:
    #          per-partition-config:
    #          - partition-name: SYS_P461
    #            row-count: 0
    #          - partition-name: SYS_P462
    #            row-count: 0
    #          - partition-name: SYS_P463
    #            row-count: 1
    #          - partition-name: SYS_P464
    #            row-count: 3
    #        part:
    #          row-count: 2000
      ```
    
    {{< hint "info" >}}
  - Supplying `split-key` in the `per-table-config `section is not required (and not supported) for Oracle source.
  - We strongly recommend that you specify `row-identifier-key` in `per-table-config` section for tables not having PK/UK constraints defined on the source Oracle system.
    {{< /hint >}}  

    ### Parameters related to realtime mode
    If you want to operate in realtime mode, you can use the `realtime` section to specify your configuration. The following Oracle specific parameters are available:

    - `block-ddl-transaction`*[v20.09.14.3]*: This option blocks fetching logs for DDL operation from Oracle.
    - `use-current-scn`*[v20.09.14.8]*: In `start-postion` section, this option allows using current `scn` value for to start reading realtime operations.
    - `start-scn`[v20.09.14.3]: In `start-postion` section this option allows using user specified `scn` value for to start reading realtime operations.
    - `inter-source-latency-s`*[v20.10.07.16]:* In the `start-position` section this config option in seconds represents the lag between primary and standby Oracle in case the source-failover feature is enabled.
    - `stop-inactive-lm-session-after-s`*[v20.12.04.14]*: Check if inactive logminer session after specified seconds and cancel the statement.
    - `adjust-lm-fetch-size`*[v21.02.01.2]*: Allow adjusting the logimer fetch size if there is a lot of log activity.
    - `auto-adjust-lm-timeout`*[v21.04.06.6]*: This is a tuning config which will adjust the logminer query timeout based on workload for continuous mine mode.

      *Default: By default, this parameter is set to `false`*.

    - `log-miner-dict-file`*[v21.09.17.6]*: If specified, this file will be used as the dictionary for log mining instead of using the online dictionary. The file must be accessible by Oracle.
    - `oldest-active-txn-window-hr`*[v22.07.19.3]*: Specifies the time period in hours up to which Replicant should fetch the oldest transaction SCN.

      *Default: By default, this parameter is set to `24`*.

    The following is a sample configuration for realtime mode:

    ```YAML
    realtime:
      threads: 4
      _traceDBTasks: true
      #fetch-size-rows: 0
      #stop-inactive-lm-session-after-s: 2
      heartbeat:
        enable: true
        schema: "tpch"
        interval-ms: 10000
        table-name: replicate_io_cdc_heartbeat

      #start-position:
        #start-scn: 2362927
    ```

## IX. Using Native Oracle Log Reader (Beta)

{{< hint "info" >}}**Note:** This feature is currently in Beta. {{< /hint >}}

It's possible to configure Replicant so that it can read and make use of Oracle redo log files.

### Modify Oracle Connection Configuration File

Add the following two parameters in the Oracle connection configuration file:

```YAML
log-reader: REDOLOG
transaction-store-location: PATH_TO_TRANSACTION_STORAGE
```

Replace *`PATH_TO_TRANSACTION_STORAGE`* with the location of Oracle transaction storage.

### Grant Necessary Permissions

Replicant user should have the following permissions granted for them in order to use the native Oracle log reader.

  ```SQL
  GRANT SELECT ON gv_$instance TO USERNAME;
  GRANT SELECT ON v_$log TO USERNAME;
  GRANT SELECT ON v_$logfile TO USERNAME;
  GRANT SELECT ON v_$archived_log to USERNAME;
  ```

  Replace *`USERNAME`* with your Oracle username.

### Oracle ASM for Logs

Replicant also supports using Oracle Automatic Storage Management (ASM) for logs. To use ASM, follow the steps below:

1. Make sure that the following permission is granted:

    ```SQL
    GRANT SELECT ON gv_$asm_client TO USERNAME
    ```
  
    Replace *`USERNAME`* with your ASM username.

2. In your Oracle connection configuration file, create a new section `asm-connection`.  This section will have the necessary ASM connection configuration. Below is a sample connection configuration file with ASM connection details specified as well:

    ```YAML
    type: ORACLE
    host: localhost
    port: 53545
    service-name: IO
    username: 'REPLICANT_USERNAME'
    password: 'REPLICANT_PASSWORD'

    asm-connection:
      host: oracle-asm
      port: 1521
      service-name: +ASM
      username: 'ASM_USERNAME'
      password: 'ASM_PASSWORD'
      max-connections: 10
    ```

    Replace the following:

    - *`REPLICANT_USERNAME`*: your Replicant username.
    - *`REPLICANT_PASSWORD`*: the password associated with your Replicant username.
    - *`ASM_USERNAME`*: the username to connect to the ASM instance.
    - *`ASM_PASSWORD`*: the password associated with *`ASM_USERNAME`*.

3. To use the file system directly, Replicant must have access to the redo log files for reading. If Replicant's path(s) to redo log files is different from the database's path, you must include the path to the redo log files explicitly in the Source connection configuration file. For example:

    ```YAML
    log-path: /home/replicant-user/shared/redo/online
    archive-log-path: /home/replicant-user/shared/redo/archive
    ```
   
For a detailed explanation of configuration parameters in the Extractor file, see [Extractor Reference]({{< ref "/docs/references/extractor-reference" >}} "Extractor Reference").
