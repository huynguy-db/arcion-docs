---
title: PostgreSQL
weight: 1
---
# Source: PostgreSQL

## I. Create a user in postgresql

1. Log in to postgresql client
    ```BASH
    psql -U $POSTGRESQL_ROOT_USER
    ```

2. Create the user
    ```sql
    CREATE USER <username> PASSWORD '<password>';
    ```

3. Grant the following permissions:

    ```SQL
    GRANT USAGE ON SCHEMA "<schema>" TO <username>;
    ```

    ```sql
    GRANT
    SELECT,
    INSERT,
    UPDATE,
    DELETE,
    REFERENCES ON ALL TABLES IN SCHEMA "<schema>" TO <username>;
    ```

    ```SQL
    ALTER ROLE <username> WITH REPLICATION;
    ```


## II. Setup PostgreSQL for Replication
1. Edit postgresql.conf
    ```BASH
    vi $PGDATA/postgresql.conf
    ```

2. Change the parameters below as follows:
    ```Xorg
    wal_level = logical
    max_replication_slots = 1 #Can be different as per requirements
    ```

3. To perform log consumption for CDC replication from the PostgreSQL server, you must either use the test_decoding plugin that is by default installed in PostgreSQL or you must install the logical decoding plugin wal2json

    **Instructions for using wal2json**
    1. Install the wal2json plugin with the steps from the following link: https://github.com/eulerto/wal2json/blob/master/README.md

    2. Create a logical replication slot for the given catalog to be replicated with the following SQL.
        ```SQL
        SELECT 'init' FROM pg_create_logical_replication_slot('<replication_slot_name>', 'wal2json');
        ```
    3. Verify the slot has been created
        ```sql
        SELECT * from pg_replication_slots;
        ```

     **Instructions for using test_decoding**

    If you are using the test_decoding plugin, you do not need to install anything as PostgreSQL comes equipped with it.

    1. Use the following sql to create a logical replication slot for test_decoding plugin:
        ```SQL
        SELECT 'init' FROM pg_create_logical_replication_slot('<replication_slot_name>', 'test_decoding');
        ```

    2. Set the replicant identity to FULL for the tables  part of the replication process that do no have a primary key
        ```SQL
        ALTER TABLE <table_name> REPLICA IDENTITY FULL;
        ```
<br></br>
**For the proceeding steps 3-5, position yourself in Replicant's ```HOME``` directory**
## III. Setup Connection Configuration

1. Navigate to the connection configuration file
    ```BASH
    vi conf/conn/postgresql.yaml
    ```

2. Make the necessary changes as follows:

    ```YAML
    type: POSTGRESQL

    host: localhost #Replace localhost with your PostgreSQL host name
    port: 5432 #Replace the default port number 5432 if needed

    database: "postgres" #Replace postgres with your database name
    username: "replicant" #Replace replicant with your postgresql username
    password: "Replicant#123" #Replace Replicant#123 with your user's password

    max-connections: 30 #Maximum number of connections replicant can open in postgresql
    ```

## IV. Setup Filter Configuration

1. Navigate to the filter configuration file
    ```BASH
    vi filter/postgresql_filter.yaml
    ```

2. Make the necessary changes as shown below:
    ```YAML
    allow:
    - catalog: "postgres" #Replace postgres with your database name
      schema: "public" #Replace public with the name of your schema
      types: [TABLE] #Enter the applicable object type: TABLE or VIEW or TABLE,VIEW

      #Below, you can specify which tables within the schema will be replicated. If not specified, all tables will be replicated.
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

## V. Setup Extractor Configuration

For real-time replication, you must create a heartbeat table in the source PostgreSQL

1. Create a heartbeat table in the catalog/schema you are going to replicate with the following DDL
   ```SQL
   CREATE TABLE "<user_database>"."<schema>"."replicate_io_cdc_heartbeat"(
     "timestamp" BIGINT NOT NULL,
     PRIMARY KEY("timestamp"));
   ```

2. Grant ```INSERT```, ```UPDATE```, and ```DELETE``` privileges to the user configured for replication

3. Navigate to the extractor configurations
   ```BASH
   vi conf/src/postgresql.yaml
   ```
4. Under the Realtime Section, make the necessary changes as follows
     ```YAML
     heartbeat:
       enable: true
       catalog: "postgres" #Replace postgres with your database name
       schema: "public" #Replace public with your schema name
       table-name [20.09.14.3]: replicate_io_cdc_heartbeat #Replace replicate_io_cdc_heartbeat with your heartbeat table's name if applicable
       column-name [20.10.07.9]: timestamp #Replace timestamp with your heartbeat table's column name if applicable
     ```
