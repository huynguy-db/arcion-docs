---
title: PostgreSQL
weight: 1
---
# Source: PostgreSQL

## I. Create User

1. Execute the following commands as user: postgres psql -d <dbname>
    ```sql
    CREATE USER <username> PASSWORD '<password>';
    GRANT USAGE ON SCHEMA "<schema>" TO <username>;
    GRANT SELECT, INSERT, UPDATE, DELETE, REFERENCES ON ALL TABLES IN SCHEMA "<schema>" TO <username>;
    ALTER ROLE <username> WITH REPLICATION;
    ```


## II. Setup PostgreSQL for Replication

To perform log consumption for CDC replication from the PostgreSQL server, you must either use the test_decoding plugin that is by default installed in the PostgreSQL either or you must install the logical decoding plugin wal2json


1. **Instructions for using wal2json**
    A. Install the wal2json plugin with the steps from the following link: https://github.com/eulerto/wal2json/blob/master/README.md

    B. Create a logical replication slot for the given catalog to be replicated with the following SQL. Replace "io_blitzz" with the name of your replication slot::
        ```SQL
        SELECT 'init' FROM pg_create_logical_replication_slot('io_blitzz', 'wal2json');
        ```
    C. Verify the slot has been created
        ```sql
        SELECT * from pg_replication_slots
        ```
    D. Follow all the standard guidelines for wal retention in PostgreSQL

1. **Instructions for using test_decoding**
    If you are using the test_decoding plugin, you do not need to install anything as PostgreSQL comes equipped with it.
    A. Use the following sql to create a logical replication slot for test_decoding
    plugin. Replace "io_blitzz" with the name of your replication slot:
        ```SQL
        SELECT 'init' FROM pg_create_logical_replication_slot('io_blitzz', 'test_decoding');
        ```

2. Set the replicant identity to FULL for the tables  part of the replication process that do no have a primary key
    ```SQL
    ALTER TABLE lineitem REPLICA IDENTITY FULL;
    ```

## III. Setup Connection Configuration

1. Navigate to the connection configuration file
        ```BASH
        vi conf/conn/postgresql.yaml
        ```

2. Make the necessary changes as follows:

        ```YAML
        type: PostgreSQL

        host: localhost #Replace localhost with your oracle host name
        port: 5432 #Replace the default port number 5432 if needed
        service-name: IO #Replace IO with the service name that contains the schema you will be replicated

        username: 'REPLICANT' #Replace REPLICANT with your username of the user that connects to your oracle server
        password: 'Replicant#123' #Replace Replicant#123 with the your user's password

        max-connections: 30 #Maximum number of connections replicant can open in Oracle
        ```




## IV. Setup Extractor Configuration

For real-time replication, you must create a heartbeat table in the source Oracle.

1. Create a heartbeat table in the catalog/schema you are going to replicate with the following DDL
   ```SQL
   CREATE TABLE "<schema>"."replicate_io_cdc_heartbeat"(
     "timestamp" NUMBER NOT NULL,
     PRIMARY KEY("timestamp"));
   ```

2. Grant ```INSERT```, ```UPDATE```, and ```DELETE``` privileges to the user configured for Replicant

3. Navigate to Oracle's extractor configurations
   ```BASH
   vi conf/src/postgresql.yaml
   ```
4. Under the Realtime Section, make the necessary changes as follows
     ```YAML
     heartbeat:
       enable: true
       schema: "REPLICANT" #Replace REPLCIANT with your schema name
       table-name [20.09.14.3]: replicate_io_cdc_heartbeat #Replace replicate_io_cdc_heartbeat with your heartbeat table's name if applicable
       column-name [20.10.07.9]: timestamp #Replace timestamp with your heartbeat table's column name if applicable
     ```




## Managing PostgreSQL Replication

6. Replication slots can be stopped with below sql and recreated again with sql in 3
SELECT 'stop' FROM pg_drop_replication_slot('io_blitzz');


8. [21.02.01.1]: If the log-reader-type is set to STREAM, the minimal supported server version is 9.4.

9. [21.02.01.1]: Additionally, if the log-reader-type is set to STREAM, replication connection must be allowed as <username> that will be used to perform the replication.
To enable replication connection, pg_hba.conf needs to be modified with some of the following entries depending on use-case:

TYPE DATABASE USER ADDRESS METHOD # allow local replication connection to <username> (IPv4 + IPv6)
local    replication
host     replication
host     replication

<username> <username> <username>
127.0.0.1/32 ::1/128
trust <auth-method>
<auth-method>

allow remote replication connection from any client machine to <username> (IPv4 + IPv6)
host replication <username> 0.0.0.0/0 <auth-method>

host replication <username> ::0/0 <auth-method>
For more details and examples, please refer to PostgreSQL official documentation here.
